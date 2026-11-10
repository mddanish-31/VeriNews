"""Regression tests verifying backend contracts expected by the frontend.

Verifies:
1. CORS preflight (OPTIONS /api/predict) for localhost:3000 and 127.0.0.1:3000.
2. English prediction response schema matches frontend AnalysisResult expectations.
3. Independent gating: English enabled does not activate Hindi.
4. HTTP 503 structured error response detail for disabled models.
5. Language mismatch 422 errors contain clean, readable messages.
"""

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.model_service import model_service

client = TestClient(app)

SAMPLE_ENGLISH = (
    "The city council has approved a new public library for the east side, "
    "with construction expected to begin next spring."
)
SAMPLE_HINDI = (
    "भारतीय अंतरिक्ष अनुसंधान संगठन ने नए मौसम उपग्रह का सफल प्रक्षेपण किया।"
)


def test_cors_preflight_for_frontend_origins():
    """Verify CORS preflight returns 200 and allowed origins for localhost:3000 and 127.0.0.1:3000."""
    for origin in ["http://localhost:3000", "http://127.0.0.1:3000"]:
        response = client.options(
            "/api/predict",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type",
            },
        )
        assert response.status_code == 200
        assert response.headers.get("access-control-allow-origin") == origin
        assert "POST" in response.headers.get("access-control-allow-methods", "")


def test_prediction_response_schema_compatibility_with_frontend():
    """Verify 200 response contains all fields mapped by the frontend UI."""
    orig_en = model_service.enable_english_inference
    try:
        model_service.enable_english_inference = True
        model_service.load_english_candidate("en_ifnd_indian_headlines_calibrated_sigmoid.joblib")

        response = client.post(
            "/api/predict",
            json={"text": SAMPLE_ENGLISH, "language_hint": "en"},
            headers={"Origin": "http://localhost:3000"},
        )
        assert response.status_code == 200
        data = response.json()

        # Fields mapped by frontend/src/App.tsx
        assert "prediction_label" in data
        assert data["prediction_label"] in ("Credible", "Unreliable")
        assert "is_credible" in data
        assert isinstance(data["confidence_score"], float)
        assert "confidence_tier" in data
        assert data["confidence_tier"] in (
            "High Confidence Pattern",
            "Moderate Confidence Pattern",
            "Low Confidence / Ambiguous Pattern",
        )
        assert "language_name" in data
        assert data["language_name"] == "English"
        assert "influential_tokens" in data
        assert isinstance(data["influential_tokens"], list)
        assert "disclaimer" in data
        assert "model_version" in data
        assert data["model_version"] == "en_ifnd_indian_headlines_calibrated_sigmoid"
        assert "latency_ms" in data
        assert isinstance(data["latency_ms"], float)
    finally:
        model_service.enable_english_inference = orig_en


def test_independent_gating_english_enabled_hindi_disabled():
    """Verify enabling English leaves Hindi strictly disabled and returning 503."""
    orig_en = model_service.enable_english_inference
    orig_hi = model_service.enable_hindi_inference
    try:
        model_service.enable_english_inference = True
        model_service.enable_hindi_inference = False
        model_service.load_english_candidate("en_ifnd_indian_headlines_calibrated_sigmoid.joblib")

        # English -> 200
        en_resp = client.post("/api/predict", json={"text": SAMPLE_ENGLISH, "language_hint": "en"})
        assert en_resp.status_code == 200

        # Hindi -> 503 with exact licensing explanation
        hi_resp = client.post("/api/predict", json={"text": SAMPLE_HINDI, "language_hint": "hi"})
        assert hi_resp.status_code == 503
        data = hi_resp.json()
        assert "detail" in data
        assert "Hindi model inference is currently disabled pending dataset licensing" in data["detail"]
    finally:
        model_service.enable_english_inference = orig_en
        model_service.enable_hindi_inference = orig_hi


def test_http_503_error_payload_structure():
    """Verify 503 returns clean JSON with detail string that frontend can render directly."""
    orig_en = model_service.enable_english_inference
    try:
        model_service.enable_english_inference = False
        response = client.post("/api/predict", json={"text": SAMPLE_ENGLISH, "language_hint": "en"})
        assert response.status_code == 503
        data = response.json()
        assert "detail" in data
        assert isinstance(data["detail"], str)
        assert "English model service is not available" in data["detail"]
    finally:
        model_service.enable_english_inference = orig_en


def test_script_mismatch_422_detail_readable():
    """Verify 422 script mismatch returns human-readable detail string without stack traces."""
    response = client.post("/api/predict", json={"text": SAMPLE_ENGLISH, "language_hint": "hi"})
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data
    assert "Hindi was specified as the language hint, but the text contains no Devanagari characters" in data["detail"]


def test_zero_vocabulary_returns_unclassifiable():
    """Verify out-of-domain / zero-vocabulary text returns Unclassifiable without invoking model classifier."""
    orig_en = model_service.enable_english_inference
    try:
        model_service.enable_english_inference = True
        model_service.load_english_candidate("en_ifnd_indian_headlines_calibrated_sigmoid.joblib")

        # 30+ chars of nonsense letters that share zero vocabulary with IFND training corpus
        nonsense_text = "xyzabc qwerasdf zxcvbnmlk qwertyuiop asdfghjk"
        response = client.post(
            "/api/predict",
            json={"text": nonsense_text, "language_hint": "en"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["prediction_label"] == "Unclassifiable"
        assert data["is_credible"] is None
        assert data["confidence_score"] is None
        assert data["confidence_tier"] == "Unclassifiable / Out of Domain"
        assert data["influential_tokens"] == []
        assert "no recognizable vocabulary" in data["disclaimer"]
    finally:
        model_service.enable_english_inference = orig_en


def test_romanized_hindi_rejected_in_auto_mode():
    """Verify Romanized Hindi (Hinglish) with >=3 Indic words is rejected with actionable 422."""
    hinglish_text = "kya yeh sach hai bhai sarkar ne naya aadesh jaari kiya hai sabhi ke liye"
    response = client.post(
        "/api/predict",
        json={"text": hinglish_text, "language_hint": "auto"},
    )
    assert response.status_code == 422
    data = response.json()
    assert "Romanized Hindi (Hinglish) is not supported yet" in data["detail"]
    assert "Devanagari script" in data["detail"]


def test_legitimate_english_not_rejected_as_romanized_hindi():
    """Verify legitimate English news headline is routed to English pipeline and NOT flagged as Hinglish."""
    orig_en = model_service.enable_english_inference
    try:
        model_service.enable_english_inference = True
        model_service.load_english_candidate("en_ifnd_indian_headlines_calibrated_sigmoid.joblib")

        english_headline = (
            "Finance Minister announces major relief package for small businesses in new budget proposal."
        )
        response = client.post(
            "/api/predict",
            json={"text": english_headline, "language_hint": "auto"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["language_name"] == "English"
        assert data["prediction_label"] in ("Credible", "Unreliable")
    finally:
        model_service.enable_english_inference = orig_en


def test_explanation_filters_uninformative_stop_words():
    """Verify stop words like 'the', 'in', 'is' are excluded from influential features."""
    orig_en = model_service.enable_english_inference
    try:
        model_service.enable_english_inference = True
        model_service.load_english_candidate("en_ifnd_indian_headlines_calibrated_sigmoid.joblib")

        headline = "The government approves the new national health policy and healthcare fund today."
        response = client.post(
            "/api/predict",
            json={"text": headline, "language_hint": "en"},
        )
        assert response.status_code == 200
        data = response.json()
        tokens = [t["token"].lower() for t in data["influential_tokens"]]
        # Uninformative stop words must NOT be among top features
        assert "the" not in tokens
        assert "and" not in tokens
    finally:
        model_service.enable_english_inference = orig_en


def test_hindi_candidate_model_smoke_test_when_enabled():
    """Verify Hindi candidate artifact (TaLLIP calibrated) loads and predicts on CPU when enabled."""
    orig_hi = model_service.enable_hindi_inference
    try:
        model_service.enable_hindi_inference = True
        model_service.load_hindi_candidate("hi_tallip_hindi_articles_calibrated_sigmoid.joblib")

        response = client.post(
            "/api/predict",
            json={"text": SAMPLE_HINDI, "language_hint": "hi"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["language_name"] == "Hindi"
        assert data["prediction_label"] in ("Credible", "Unreliable")
        assert isinstance(data["confidence_score"], float)
        assert data["model_version"] == "hi_tallip_hindi_articles_calibrated_sigmoid"
        assert len(data["influential_tokens"]) > 0
    finally:
        model_service.enable_hindi_inference = orig_hi
        model_service._hi_model = None
        model_service._hi_vectorizer = None
        model_service._hi_explainer = None
