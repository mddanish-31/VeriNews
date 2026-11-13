"""Controlled Standalone Verification of gemini-3.5-flash-lite with VeriNews Prompt."""

import json
import os
import sys
import time
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.app.core.config import ROOT_ENV_FILE
from dotenv import load_dotenv
import httpx

if ROOT_ENV_FILE.is_file():
    load_dotenv(ROOT_ENV_FILE)

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("ERROR: GEMINI_API_KEY is missing.")
    sys.exit(1)

from backend.app.services.evidence_analyzer import ALLOWED_STATUSES

def run_test_for_language(lang: str, claim: str, evidence: list):
    print(f"\n========================================================")
    print(f"TESTING LANGUAGE: {lang.upper()} on gemini-3.5-flash-lite")
    print(f"========================================================")

    evidence_text = "\n\n".join(
        f"[Source {i+1}]: {src.get('publisher', 'Web')}\n"
        f"Title: {src.get('title', '')}\n"
        f"URL: {src.get('url', '')}\n"
        f"Snippet: {src.get('snippet', '')}"
        for i, src in enumerate(evidence)
    )

    lang_instruction = (
        "Respond in fluent Hindi (Devanagari script) for explanation and summary."
        if lang == "hi"
        else "Respond in clear English."
    )

    prompt = f"""You are the VeriNews AI Evidence Analyst. Your task is to verify an alleged news claim strictly using the retrieved live web evidence provided below.

CLAIM TO VERIFY:
\"\"\"{claim}\"\"\"

LIVE WEB EVIDENCE RETRIEVED:
\"\"\"{evidence_text}\"\"\"

RULES:
1. You must select EXACTLY ONE status from this list:
   - "Supported by Available Evidence"
   - "Contradicted by Available Evidence"
   - "Partially Supported"
   - "Misleading or Missing Context"
   - "Insufficient Evidence"
   - "Unable to Verify"
2. Never force the claim into Fake or Real.
3. Do NOT invent sources, URLs, or facts outside the provided snippets.
4. Do NOT output numerical accuracy or confidence percentages.
5. {lang_instruction}

Respond with ONLY a valid JSON object matching this schema:
{{
  "status": "<one of the 6 allowed statuses>",
  "summary": "<1-2 sentence summary of the news claim>",
  "claim_checked": "<concise statement of the specific core claim>",
  "explanation": "<objective analysis comparing the claim against retrieved evidence>",
  "supporting_evidence": ["<specific corroborating fact 1>", "<specific fact 2>"],
  "contradictory_evidence": ["<specific contradictory or debunking fact, if any>"],
  "missing_context": ["<context or limitation 1>", "<context 2>"]
}}"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.1, "responseMimeType": "application/json"},
    }

    # Execute with up to 2 retries on 503
    resp = None
    latency = 0.0
    for attempt in range(3):
        start = time.time()
        with httpx.Client(timeout=25.0) as client:
            resp = client.post(url, json=payload)
            latency = time.time() - start
        if resp.status_code == 200:
            break
        elif resp.status_code == 503:
            print(f"  Attempt {attempt+1} got 503 spike, retrying in 2s...")
            time.sleep(2.0)

    print(f"HTTP Status: {resp.status_code}")
    print(f"Latency: {latency:.2f} seconds")

    assert resp.status_code == 200, f"Expected HTTP 200, got {resp.status_code}: {resp.text[:200]}"
    data = resp.json()

    candidates = data.get("candidates", [])
    assert len(candidates) > 0, "No candidates returned"

    raw_text = candidates[0]["content"]["parts"][0]["text"]
    parsed = json.loads(raw_text)

    # Verify all required schema fields
    required_fields = [
        "status",
        "summary",
        "claim_checked",
        "explanation",
        "supporting_evidence",
        "contradictory_evidence",
        "missing_context",
    ]
    for field in required_fields:
        assert field in parsed, f"Missing required field: {field}"

    assert parsed["status"] in ALLOWED_STATUSES, f"Invalid status: {parsed['status']}"

    print(f"Parsed Status: {parsed['status']}")
    print(f"Summary: {parsed['summary']}")
    print(f"Claim Checked: {parsed['claim_checked']}")
    print(f"Explanation: {parsed['explanation'][:140]}...")
    print(f"Supporting Evidence items: {len(parsed['supporting_evidence'])}")
    print(f"Contradictory Evidence items: {len(parsed['contradictory_evidence'])}")
    print(f"Missing Context items: {len(parsed['missing_context'])}")

    return {
        "status_code": resp.status_code,
        "latency": latency,
        "parsed": parsed,
    }


# English sample
en_claim = "ISRO launched Chandrayaan-3 mission exploring lunar south pole"
en_evidence = [
    {
        "publisher": "The Hindu",
        "title": "ISRO successfully launches Chandrayaan-3 towards the Moon",
        "url": "https://www.thehindu.com/sci-tech/science/isro-chandrayaan-3-launch/article1234567.ece",
        "snippet": "The Indian Space Research Organisation launched its third lunar exploration mission Chandrayaan-3 to land on the lunar south pole.",
    },
    {
        "publisher": "BBC News",
        "title": "Chandrayaan-3: India's historic moon mission launched",
        "url": "https://www.bbc.com/news/world-asia-india-1234567",
        "snippet": "India has launched its historic Chandrayaan-3 spacecraft aiming for a soft touchdown on the Moon's southern polar region.",
    },
]

# Hindi sample
hi_claim = "भारतीय अंतरिक्ष अनुसंधान संगठन इसरो ने चंद्रयान मिशन प्रक्षेपित किया"
hi_evidence = [
    {
        "publisher": "AajTak",
        "title": "इसरो का चंद्रयान मिशन सफलतापूर्वक लॉन्च हुआ",
        "url": "https://aajtak.in/science/story/isro-chandrayaan-mission-launch-12345",
        "snippet": "भारतीय अंतरिक्ष अनुसंधान संगठन इसरो ने अपने महत्वाकांक्षी चंद्रयान मिशन का सफल प्रक्षेपण किया।",
    },
    {
        "publisher": "Dainik Jagran",
        "title": "चंद्रमा की ओर इसरो का ऐतिहासिक कदम",
        "url": "https://jagran.com/news/national-isro-chandrayaan-historic-step-12345",
        "snippet": "श्रीहरिकोटा स्थित अंतरिक्ष केंद्र से इसरो ने चंद्रयान को सफलतापूर्वक रवाना किया।",
    },
]

en_res = run_test_for_language("en", en_claim, en_evidence)
hi_res = run_test_for_language("hi", hi_claim, hi_evidence)

print("\n========================================================")
print("ALL STANDALONE TESTS ON gemini-3.5-flash-lite PASSED!")
print(f"English Latency: {en_res['latency']:.2f}s | Status: {en_res['parsed']['status']}")
print(f"Hindi Latency:   {hi_res['latency']:.2f}s | Status: {hi_res['parsed']['status']}")
print("========================================================")
