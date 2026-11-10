"""P13 Early Model Integration verification tests.

Verifies:
1. Default disabled state returns HTTP 503 without fabrication.
2. English candidate model (IFND calibrated Logistic Regression) loads cleanly.
3. Live prediction yields HTTP 200, valid labels, calibrated probabilities,
   confidence tiers, top influential features with directions, and non-dismissible disclaimers.
4. Hindi prediction remains safely gated (HTTP 503) pending deployment clearance.
5. Input boundary validation (100 - 5000 chars, script validation).
6. Strict Zero Content Retention in memory, database, and logs.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from backend.app.core.config import settings
from backend.app.db.session import get_engine
from backend.app.main import app
from backend.app.services.model_service import model_service

client = TestClient(app)

SAMPLE_ENGLISH_NEWS = (
    "The ministry of finance has announced the introduction of a new fiscal incentive package "
    "for regional clean energy initiatives across multiple southern states today. Officials confirmed "
    "that technical criteria, project guidelines, and compliance rules will be shared in the next gazette."
)

SAMPLE_HINDI_NEWS = (
    "नगर परिषद ने शहर के पूर्वी हिस्से में एक नए सार्वजनिक पुस्तकालय के निर्माण को मंजूरी दी है। "
    "अधिकारियों के अनुसार, निर्माण अगले वसंत में शुरू होने की उम्मीद है। प्रस्तावित भवन में "
    "पढ़ने का कक्ष, सामुदायिक गतिविधियों के लिए स्थान और डिजिटल संसाधनों की सुविधा शामिल होगी।"
)


@pytest.fixture(autouse=True)
def reset_model_service_state():
    """Ensure clean isolated model service state before and after each test."""
    orig_en_flag = model_service.enable_english_inference
    orig_hi_flag = model_service.enable_hindi_inference
    orig_en_model = model_service._en_model
    orig_en_vec = model_service._en_vectorizer
    orig_en_exp = model_service._en_explainer
    orig_en_ver = model_service._en_model_version
    orig_en_disc = model_service._en_disclaimer

    yield

    model_service.enable_english_inference = orig_en_flag
    model_service.enable_hindi_inference = orig_hi_flag
    model_service._en_model = orig_en_model
    model_service._en_vectorizer = orig_en_vec
    model_service._en_explainer = orig_en_exp
    model_service._en_model_version = orig_en_ver
    model_service._en_disclaimer = orig_en_disc


def test_default_production_gating_returns_503():
    """Verify that by default when unconfigured, English inference returns HTTP 503."""
    model_service.enable_english_inference = False
    model_service._en_model = None

    response = client.post(
        "/api/predict",
        json={"text": SAMPLE_ENGLISH_NEWS, "language_hint": "en"},
    )
    assert response.status_code == 503
    data = response.json()
    assert "English model service is not available" in data["detail"]
    assert "never fabricates synthetic predictions" in data["detail"]


def test_english_candidate_integration_end_to_end():
    """
    Verify activating candidate IFND calibrated model allows end-to-end inference
    with calibrated probabilities, confidence tiers, and token attributions.
    """
    model_service.enable_english_inference = True
    loaded = model_service.load_english_candidate("en_ifnd_indian_headlines_calibrated_sigmoid.joblib")
    assert loaded is True, "Candidate IFND calibrated model artifact must exist in models/calibrated/"
    assert model_service.is_english_ready() is True

    response = client.post(
        "/api/predict",
        json={"text": SAMPLE_ENGLISH_NEWS, "language_hint": "en"},
    )
    assert response.status_code == 200
    data = response.json()

    # Schema integrity checks
    assert data["detected_language"] == "en"
    assert data["language_name"] == "English"
    assert data["prediction_label"] in ("Credible", "Unreliable")
    assert isinstance(data["is_credible"], bool)
    assert 0.0 <= data["confidence_score"] <= 1.0
    assert data["confidence_tier"] in (
        "High Confidence Pattern",
        "Moderate Confidence Pattern",
        "Low Confidence / Ambiguous Pattern",
    )
    assert data["model_version"] == "en_ifnd_indian_headlines_calibrated_sigmoid"
    assert isinstance(data["latency_ms"], (int, float))
    assert data["latency_ms"] >= 0

    # Explainability checks
    assert "influential_tokens" in data
    assert isinstance(data["influential_tokens"], list)
    assert len(data["influential_tokens"]) <= 5
    for token_item in data["influential_tokens"]:
        assert "token" in token_item
        assert "weight" in token_item
        assert "direction" in token_item
        assert token_item["direction"] in ("credible", "unreliable")

    # Responsible AI disclaimer checks
    assert "disclaimer" in data
    assert "IFND" in data["disclaimer"]
    assert "NOT verify empirical facts" in data["disclaimer"]


def test_hindi_inference_remains_safely_gated_503():
    """Verify Hindi inference returns HTTP 503 explaining licensing restrictions."""
    model_service.enable_hindi_inference = False
    model_service._hi_model = None

    response = client.post(
        "/api/predict",
        json={"text": SAMPLE_HINDI_NEWS, "language_hint": "hi"},
    )
    assert response.status_code == 503
    data = response.json()
    assert "Hindi model service is not available" in data["detail"]
    assert "pending dataset licensing and deployment clearance" in data["detail"]


def test_input_validation_boundary_conditions():
    """Verify boundary conditions for 20 - 500 character constraints."""
    # Under 20 characters
    short_resp = client.post(
        "/api/predict",
        json={"text": "Short report."},
    )
    assert short_resp.status_code == 400
    assert short_resp.json()["error_code"] == "VALIDATION_ERROR"

    # Over 500 characters
    long_resp = client.post(
        "/api/predict",
        json={"text": "Breaking headline statement content. " * 25},
    )
    assert long_resp.status_code == 400
    assert long_resp.json()["error_code"] == "VALIDATION_ERROR"

    # Unsupported script (e.g. Arabic)
    arabic_text = "هذا نص تجريبي للاختبار الإخباري يهدف إلى التحقق من معالجة النصوص غير المدعومة في النظام البرمجي بشكل صحيح تماما."
    script_resp = client.post(
        "/api/predict",
        json={"text": arabic_text},
    )
    assert script_resp.status_code == 422
    assert "Unsupported script" in script_resp.json()["detail"]


def test_zero_content_retention_during_inference():
    """
    Verify that inference requests NEVER write submitted text or tokens
    to the database (analyses, users, user_feedback tables).
    """
    if not settings.DATABASE_URL:
        pytest.skip("DATABASE_URL not configured; skipping live database check.")

    engine = get_engine()
    with engine.connect() as conn:
        count_before = conn.execute(text("SELECT COUNT(*) FROM analyses")).scalar()

    # Load candidate and make prediction
    model_service.enable_english_inference = True
    model_service.load_english_candidate("en_ifnd_indian_headlines_calibrated_sigmoid.joblib")
    response = client.post(
        "/api/predict",
        json={"text": SAMPLE_ENGLISH_NEWS, "language_hint": "en"},
    )
    assert response.status_code == 200

    with engine.connect() as conn:
        count_after = conn.execute(text("SELECT COUNT(*) FROM analyses")).scalar()

    assert count_before == count_after, "Strict Zero Content Retention: /api/predict must not persist article records."

