"""VeriNews — Controlled Local-Only Hindi Model Smoke Test.

Evaluates:
1. Hindi artifact inspection (TaLLIP calibrated vs. hardened baseline).
2. Model loading, vectorizer, and CPU inference capability.
3. FastAPI endpoint integration (/api/predict) with process-level flag.
4. Five required test cases:
   - Normal Hindi headline #1
   - Unrelated Hindi headline #2
   - Invalid / empty / short input
   - English text with Hindi language hint ('hi')
   - Hindi text with English language hint ('en')
5. Preservation of English inference and safety gating.
6. Safe restoration of Hindi gating (HTTP 503).
"""

import json
import os
from pathlib import Path
import sys

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi.testclient import TestClient
from backend.app.core.config import settings
from backend.app.services.model_service import model_service
from backend.app.main import app

client = TestClient(app)

# Test cases
HINDI_HEADLINE_1 = "भारतीय अंतरिक्ष अनुसंधान संगठन (इसरो) ने नए मौसम उपग्रह का सफल प्रक्षेपण किया।"
HINDI_HEADLINE_2 = "उच्चतम न्यायालय ने प्रदूषण नियंत्रण पर राज्य सरकारों को नई कार्ययोजना प्रस्तुत करने का निर्देश दिया।"
ENGLISH_HEADLINE = "The finance ministry announced new corporate taxation guidelines for the upcoming fiscal quarter."


def run_smoke_test():
    print("=" * 80)
    print("VERINEWS CONTROLLED LOCAL HINDI INFERENCE SMOKE TEST")
    print("=" * 80)

    # 1. Default safety gate check
    print("\n[STEP 1] Verifying Default Production / Release Safety Gates:")
    model_service.reload()
    print(f"  settings.ENABLE_HINDI_INFERENCE (default):   {settings.ENABLE_HINDI_INFERENCE}")
    print(f"  model_service.is_hindi_ready() (default):     {model_service.is_hindi_ready()}")
    assert not model_service.is_hindi_ready(), "Hindi inference must be disabled by default!"

    # Probe /api/predict with Hindi text under default gate -> MUST be 503
    resp_default = client.post("/api/predict", json={"text": HINDI_HEADLINE_1, "language_hint": "hi"})
    print(f"  Default POST /api/predict status code:       {resp_default.status_code}")
    assert resp_default.status_code == 503, f"Expected 503, got {resp_default.status_code}"
    print(f"  Default 503 error detail:                    {resp_default.json().get('detail')}")

    # 2. Process-level activation for controlled testing
    print("\n[STEP 2] Activating Hindi Inference at Process-Level (Memory Only):")
    os.environ["VERINEWS_ENABLE_HINDI_INFERENCE"] = "true"
    os.environ["VERINEWS_ENABLE_ENGLISH_INFERENCE"] = "true"
    model_service.reload()
    print(f"  settings.ENABLE_HINDI_INFERENCE (process):   {settings.ENABLE_HINDI_INFERENCE}")
    print(f"  model_service.is_hindi_ready():               {model_service.is_hindi_ready()}")
    print(f"  Loaded Hindi model version:                  {model_service._hi_model_version}")
    print(f"  Model type:                                  {type(model_service._hi_model)}")
    print(f"  Vectorizer type:                             {type(model_service._hi_vectorizer)}")
    assert model_service.is_hindi_ready(), "Hindi model should be ready after process activation!"

    # Probe /api/health
    resp_health = client.get("/api/health")
    print(f"  GET /api/health response:                    {resp_health.status_code} -> {resp_health.json()}")

    # 3. Test Case 1: Normal Hindi news headline
    print("\n[STEP 3] Test Case 1: Normal Hindi Headline #1:")
    print(f"  Input: \"{HINDI_HEADLINE_1}\"")
    resp_case1 = client.post("/api/predict", json={"text": HINDI_HEADLINE_1, "language_hint": "hi"})
    print(f"  HTTP Status: {resp_case1.status_code}")
    data1 = resp_case1.json()
    print(f"  Detected Language:   {data1.get('detected_language')} ({data1.get('language_name')})")
    print(f"  Prediction Label:    {data1.get('prediction_label')} (is_credible={data1.get('is_credible')})")
    print(f"  Confidence Score:    {data1.get('confidence_score')} ({data1.get('confidence_tier')})")
    print(f"  Model Version:       {data1.get('model_version')}")
    print(f"  Latency:             {data1.get('latency_ms')} ms")
    print(f"  Influential Tokens:  {data1.get('influential_tokens')}")
    print(f"  Disclaimer:          {data1.get('disclaimer')}")
    assert resp_case1.status_code == 200
    assert data1["detected_language"] == "hi"

    # 4. Test Case 2: Second unrelated Hindi news headline
    print("\n[STEP 4] Test Case 2: Unrelated Hindi Headline #2:")
    print(f"  Input: \"{HINDI_HEADLINE_2}\"")
    resp_case2 = client.post("/api/predict", json={"text": HINDI_HEADLINE_2, "language_hint": "hi"})
    print(f"  HTTP Status: {resp_case2.status_code}")
    data2 = resp_case2.json()
    print(f"  Detected Language:   {data2.get('detected_language')} ({data2.get('language_name')})")
    print(f"  Prediction Label:    {data2.get('prediction_label')} (is_credible={data2.get('is_credible')})")
    print(f"  Confidence Score:    {data2.get('confidence_score')} ({data2.get('confidence_tier')})")
    print(f"  Model Version:       {data2.get('model_version')}")
    print(f"  Latency:             {data2.get('latency_ms')} ms")
    print(f"  Influential Tokens:  {data2.get('influential_tokens')}")
    assert resp_case2.status_code == 200
    assert data2["detected_language"] == "hi"

    # 5. Test Case 3: Invalid or empty inputs
    print("\n[STEP 5] Test Case 3: Invalid or Empty Inputs:")
    # 3a: Empty input (Pydantic schema validation -> 400)
    resp_empty = client.post("/api/predict", json={"text": "", "language_hint": "hi"})
    print(f"  3a Empty text HTTP status:                   {resp_empty.status_code} (Pydantic validation -> 400)")
    print(f"     Error detail:                             {resp_empty.json().get('detail')}")
    assert resp_empty.status_code == 400

    # 3b: Text too short (< 20 chars) (Pydantic schema validation -> 400)
    resp_short = client.post("/api/predict", json={"text": "छोटा समाचार", "language_hint": "hi"})
    print(f"  3b Short text (<20 chars) HTTP status:       {resp_short.status_code} (Pydantic validation -> 400)")
    print(f"     Error detail:                             {resp_short.json().get('detail')}")
    assert resp_short.status_code == 400

    # 3c: Insufficient alphabetic characters (Passes schema len >= 20, fails script detection -> 422)
    resp_no_alpha = client.post("/api/predict", json={"text": "1234567890 9876543210 1234567890", "language_hint": "hi"})
    print(f"  3c Non-alphabetic text HTTP status:          {resp_no_alpha.status_code} (Script detector -> 422)")
    print(f"     Error detail:                             {resp_no_alpha.json().get('detail')}")
    assert resp_no_alpha.status_code == 422


    # 6. Test Case 4: English input sent with Hindi language hint
    print("\n[STEP 6] Test Case 4: English Text with Hindi Language Hint:")
    print(f"  Input: \"{ENGLISH_HEADLINE}\"")
    print("  Language Hint: 'hi'")
    resp_case4 = client.post("/api/predict", json={"text": ENGLISH_HEADLINE, "language_hint": "hi"})
    print(f"  HTTP Status: {resp_case4.status_code} (Expected 422 script mismatch)")
    print(f"  Error Detail: {resp_case4.json().get('detail')}")
    assert resp_case4.status_code == 422
    assert "Hindi was specified as the language hint, but the text contains no Devanagari characters" in resp_case4.json()["detail"]

    # 7. Test Case 5: Hindi input sent with English language hint
    print("\n[STEP 7] Test Case 5: Hindi Text with English Language Hint:")
    print(f"  Input: \"{HINDI_HEADLINE_1}\"")
    print("  Language Hint: 'en'")
    resp_case5 = client.post("/api/predict", json={"text": HINDI_HEADLINE_1, "language_hint": "en"})
    print(f"  HTTP Status: {resp_case5.status_code} (Expected 422 script mismatch)")
    print(f"  Error Detail: {resp_case5.json().get('detail')}")
    assert resp_case5.status_code == 422
    assert "English was specified as the language hint, but the text contains no Latin characters" in resp_case5.json()["detail"]

    # 8. Preservation of English inference
    print("\n[STEP 8] Verifying English Inference Preservation:")
    resp_en = client.post("/api/predict", json={"text": ENGLISH_HEADLINE, "language_hint": "en"})
    print(f"  English prediction HTTP Status:              {resp_en.status_code}")
    data_en = resp_en.json()
    print(f"  English prediction:                          {data_en.get('prediction_label')} ({data_en.get('confidence_score')}, {data_en.get('model_version')})")
    assert resp_en.status_code == 200
    assert data_en["detected_language"] == "en"

    # 9. Restoration of safety gates
    print("\n[STEP 9] Restoring Default Safe Production Gates:")
    os.environ["VERINEWS_ENABLE_HINDI_INFERENCE"] = "false"
    os.environ["VERINEWS_ENABLE_ENGLISH_INFERENCE"] = "false"
    model_service.reload()
    print(f"  settings.ENABLE_HINDI_INFERENCE:             {settings.ENABLE_HINDI_INFERENCE}")
    print(f"  model_service.is_hindi_ready():               {model_service.is_hindi_ready()}")
    assert not model_service.is_hindi_ready(), "Hindi must be gated again!"

    # Probe /api/predict again -> MUST return 503
    resp_restored = client.post("/api/predict", json={"text": HINDI_HEADLINE_1, "language_hint": "hi"})
    print(f"  Post-restoration Hindi POST /api/predict:    {resp_restored.status_code} (Expected 503)")
    assert resp_restored.status_code == 503
    print(f"  Post-restoration detail:                     {resp_restored.json().get('detail')}")

    print("\n" + "=" * 80)
    print("ALL 5 SMOKE TEST CASES AND SAFETY GATES PASSED SUCCESSFULLY!")
    print("=" * 80)


if __name__ == "__main__":
    run_smoke_test()
