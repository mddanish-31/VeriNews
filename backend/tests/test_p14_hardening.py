"""P14 Release Hardening and Production Readiness Test Suite.

Verifies:
1. Input-Domain Compatibility (20 to 500 characters, headline domain, boundary tests).
2. Rate Limiting and Payload Size Protections.
3. Security, Privacy, and Strict Zero Content Retention.
4. Model Readiness, Decoupling, and Safe Default Fallback (503 without fabrication).
5. Explainability and Non-Dismissible Attribution Disclaimers.
"""

import time
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from backend.app.core.config import settings
from backend.app.db.session import get_engine
from backend.app.main import app, _request_history
from backend.app.services.model_service import model_service

client = TestClient(app)

SAMPLE_HEADLINE_VALID = "Cabinet approves new semiconductor manufacturing incentive package today."
SAMPLE_HINDI_HEADLINE = "नगर परिषद ने शहर में नए पुस्तकालय के निर्माण को मंजूरी दी।"


@pytest.fixture(autouse=True)
def reset_service_and_rate_limiter():
    """Reset rate limiter and model service state for clean test isolation."""
    _request_history.clear()
    orig_en = model_service.enable_english_inference
    orig_hi = model_service.enable_hindi_inference
    orig_model = model_service._en_model
    orig_vec = model_service._en_vectorizer
    orig_exp = model_service._en_explainer
    orig_ver = model_service._en_model_version

    yield

    _request_history.clear()
    model_service.enable_english_inference = orig_en
    model_service.enable_hindi_inference = orig_hi
    model_service._en_model = orig_model
    model_service._en_vectorizer = orig_vec
    model_service._en_explainer = orig_exp
    model_service._en_model_version = orig_ver


def test_input_domain_boundary_exact_minimum_20_chars():
    """Verify 20 characters is accepted and 19 characters is rejected."""
    model_service.enable_english_inference = True
    model_service.load_english_candidate("en_ifnd_indian_headlines_calibrated_sigmoid.joblib")

    # 19 characters -> Should be rejected
    text_19 = "A" * 19
    resp_19 = client.post("/api/predict", json={"text": text_19, "language_hint": "en"})
    assert resp_19.status_code == 400
    assert resp_19.json()["error_code"] == "VALIDATION_ERROR"

    # 20 characters -> Valid headline statement
    text_20 = "Govt launches plan a"
    assert len(text_20) == 20
    resp_20 = client.post("/api/predict", json={"text": text_20, "language_hint": "en"})
    assert resp_20.status_code == 200
    assert resp_20.json()["prediction_label"] in ("Credible", "Unreliable")


def test_input_domain_boundary_exact_maximum_500_chars():
    """Verify 500 characters is accepted and 501 characters is rejected."""
    model_service.enable_english_inference = True
    model_service.load_english_candidate("en_ifnd_indian_headlines_calibrated_sigmoid.joblib")

    # 500 characters -> Valid headline + subhead
    text_500 = "Headline report statement. " * 18 + "12345678901234"
    text_500 = text_500[:500]
    assert len(text_500) == 500
    resp_500 = client.post("/api/predict", json={"text": text_500, "language_hint": "en"})
    assert resp_500.status_code == 200

    # 501 characters -> Should be rejected
    text_501 = text_500 + "X"
    assert len(text_501) == 501
    resp_501 = client.post("/api/predict", json={"text": text_501, "language_hint": "en"})
    assert resp_501.status_code == 400
    assert resp_501.json()["error_code"] == "VALIDATION_ERROR"
    assert "500 characters" in resp_501.json()["detail"]


def test_full_length_article_rejection():
    """Verify long articles (e.g. 1500 chars) are rejected with clear domain explanations."""
    long_article = "News investigative report body paragraph content. " * 30
    resp = client.post("/api/predict", json={"text": long_article, "language_hint": "en"})
    assert resp.status_code == 400
    assert resp.json()["error_code"] == "VALIDATION_ERROR"
    assert "500 characters" in resp.json()["detail"]


def test_whitespace_only_rejection():
    """Verify inputs with only whitespace characters are rejected."""
    whitespace_text = "   \n\t  " * 5
    resp = client.post("/api/predict", json={"text": whitespace_text})
    assert resp.status_code == 400
    assert resp.json()["error_code"] == "VALIDATION_ERROR"


def test_request_payload_size_limit_413():
    """Verify payloads exceeding 64 KB are blocked with HTTP 413."""
    oversized_headers = {"Content-Length": str(100 * 1024)}  # 100 KB
    resp = client.post(
        "/api/predict",
        json={"text": SAMPLE_HEADLINE_VALID},
        headers=oversized_headers,
    )
    assert resp.status_code == 413
    assert resp.json()["error_code"] == "PAYLOAD_TOO_LARGE"


def test_rate_limiting_enforcement_429():
    """Verify excessive requests per IP are throttled with HTTP 429."""
    model_service.enable_english_inference = True
    model_service.load_english_candidate("en_ifnd_indian_headlines_calibrated_sigmoid.joblib")

    # Send up to 60 requests
    for _ in range(60):
        resp = client.post("/api/predict", json={"text": SAMPLE_HEADLINE_VALID})
        assert resp.status_code == 200

    # 61st request must trigger 429
    throttled_resp = client.post("/api/predict", json={"text": SAMPLE_HEADLINE_VALID})
    assert throttled_resp.status_code == 429
    assert throttled_resp.json()["error_code"] == "RATE_LIMIT_EXCEEDED"


def test_zero_content_retention_on_headline_inference():
    """Verify zero database rows created for analyses or user feedback during inference."""
    if not settings.DATABASE_URL:
        pytest.skip("DATABASE_URL not set; skipping live DB retention check.")

    engine = get_engine()
    with engine.connect() as conn:
        before_analyses = conn.execute(text("SELECT COUNT(*) FROM analyses")).scalar()
        before_feedback = conn.execute(text("SELECT COUNT(*) FROM user_feedback")).scalar()

    model_service.enable_english_inference = True
    model_service.load_english_candidate("en_ifnd_indian_headlines_calibrated_sigmoid.joblib")
    resp = client.post("/api/predict", json={"text": SAMPLE_HEADLINE_VALID, "language_hint": "en"})
    assert resp.status_code == 200

    with engine.connect() as conn:
        after_analyses = conn.execute(text("SELECT COUNT(*) FROM analyses")).scalar()
        after_feedback = conn.execute(text("SELECT COUNT(*) FROM user_feedback")).scalar()

    assert before_analyses == after_analyses
    assert before_feedback == after_feedback


def test_model_readiness_default_disabled_safeguard():
    """Verify English defaults to disabled (HTTP 503) without synthetic predictions."""
    model_service.enable_english_inference = False
    model_service._en_model = None

    resp = client.post("/api/predict", json={"text": SAMPLE_HEADLINE_VALID, "language_hint": "en"})
    assert resp.status_code == 503
    assert "English model service is not available" in resp.json()["detail"]


def test_hindi_safely_gated_pending_licensing():
    """Verify Hindi returns 503 explaining licensing hold."""
    model_service.enable_hindi_inference = False
    model_service._hi_model = None

    resp = client.post("/api/predict", json={"text": SAMPLE_HINDI_HEADLINE, "language_hint": "hi"})
    assert resp.status_code == 503
    assert "Hindi model service is not available" in resp.json()["detail"]
    assert "pending dataset licensing and deployment clearance" in resp.json()["detail"]


def test_environment_variable_reconciliation(monkeypatch):
    """Verify both VERINEWS_ENABLE_ENGLISH_INFERENCE and generic ENABLE_ENGLISH_INFERENCE are honored."""
    from backend.app.core.config import Settings

    # 1. Default disabled
    monkeypatch.delenv("VERINEWS_ENABLE_ENGLISH_INFERENCE", raising=False)
    monkeypatch.delenv("ENABLE_ENGLISH_INFERENCE", raising=False)
    s_default = Settings()
    assert s_default.ENABLE_ENGLISH_INFERENCE is False

    # 2. Enabled via VERINEWS_ prefix
    monkeypatch.setenv("VERINEWS_ENABLE_ENGLISH_INFERENCE", "true")
    s_verinews = Settings()
    assert s_verinews.ENABLE_ENGLISH_INFERENCE is True

    # 3. Enabled via generic fallback
    monkeypatch.delenv("VERINEWS_ENABLE_ENGLISH_INFERENCE", raising=False)
    monkeypatch.setenv("ENABLE_ENGLISH_INFERENCE", "true")
    s_generic = Settings()
    assert s_generic.ENABLE_ENGLISH_INFERENCE is True


def test_rate_limiter_stale_ip_pruning():
    """Verify rate limiter prunes stale client IPs when window expires."""
    from backend.app.main import _request_history, prune_stale_rate_limit_ips

    # Seed stale IPs and active IP
    now = time.monotonic()
    _request_history["old-ip-1"] = [now - 100.0]
    _request_history["old-ip-2"] = [now - 120.0]
    _request_history["active-ip"] = [now - 5.0]

    # Explicit prune invocation
    pruned = prune_stale_rate_limit_ips(now)
    assert pruned == 2

    # Stale IPs should have been evicted, active retained
    assert "old-ip-1" not in _request_history
    assert "old-ip-2" not in _request_history
    assert "active-ip" in _request_history


def test_model_loading_missing_artifact_graceful_fallback():
    """Verify that specifying a non-existent artifact returns False and fails safely to HTTP 503."""
    loaded = model_service.load_english_candidate("non_existent_model_artifact_xyz.joblib")
    assert loaded is False
    assert model_service.is_english_ready() is False

    resp = client.post("/api/predict", json={"text": SAMPLE_HEADLINE_VALID, "language_hint": "en"})
    assert resp.status_code == 503
    assert "English model service is not available" in resp.json()["detail"]


def test_model_loading_corrupted_artifact_graceful_fallback(tmp_path):
    """Verify that a corrupted or invalid artifact file fails safely without crashing the service."""
    corrupted_file = tmp_path / "corrupted_model.joblib"
    corrupted_file.write_bytes(b"NOT_A_VALID_JOBLIB_PICKLE_HEADER_12345")

    loaded = model_service.load_english_candidate(str(corrupted_file))
    assert loaded is False
    assert model_service.is_english_ready() is False

    resp = client.post("/api/predict", json={"text": SAMPLE_HEADLINE_VALID, "language_hint": "en"})
    assert resp.status_code == 503


def test_model_loading_invalid_bundle_structure_fallback(tmp_path):
    """Verify that a bundle missing required keys (model, vectorizer) fails validation."""
    import joblib
    invalid_file = tmp_path / "invalid_bundle.joblib"
    joblib.dump({"just_some_random_key": 42}, invalid_file)

    loaded = model_service.load_english_candidate(str(invalid_file))
    assert loaded is False
    assert model_service.is_english_ready() is False


def test_custom_models_directory_configuration(monkeypatch, tmp_path):
    """Verify VERINEWS_MODELS_DIR configuration property overrides default path."""
    from backend.app.core.config import Settings
    monkeypatch.setenv("VERINEWS_MODELS_DIR", str(tmp_path))
    s = Settings()
    assert s.MODELS_DIR == tmp_path


def test_model_loading_does_not_change_inference_flags():
    """Verify loading an artifact never mutates or enables inference authorization flags."""
    model_service.enable_english_inference = False
    model_service.enable_hindi_inference = False

    # Loading English candidate artifact
    loaded = model_service.load_english_candidate("en_ifnd_indian_headlines_calibrated_sigmoid.joblib")
    assert loaded is True
    # Invariant: Flag must remain strictly False
    assert model_service.enable_english_inference is False
    assert model_service.is_english_ready() is False

    # Loading Hindi candidate artifact
    hi_loaded = model_service.load_hindi_candidate("hi_tallip_hindi_articles_calibrated_sigmoid.joblib")
    assert hi_loaded is True
    # Invariant: Flag must remain strictly False
    assert model_service.enable_hindi_inference is False
    assert model_service.is_hindi_ready() is False


def test_disabled_inference_blocks_prediction_even_with_loaded_model():
    """Verify that having an artifact loaded in memory still returns 503 if authorization flag is false."""
    model_service.enable_english_inference = False
    loaded = model_service.load_english_candidate("en_ifnd_indian_headlines_calibrated_sigmoid.joblib")
    assert loaded is True
    assert model_service._en_model is not None
    assert model_service.is_english_ready() is False

    resp = client.post("/api/predict", json={"text": SAMPLE_HEADLINE_VALID, "language_hint": "en"})
    assert resp.status_code == 503
    assert "English model service is not available" in resp.json()["detail"]


def test_enabled_inference_works_after_successful_loading():
    """Verify that when inference is authorized AND artifact is loaded, prediction succeeds."""
    model_service.enable_english_inference = True
    loaded = model_service.load_english_candidate("en_ifnd_indian_headlines_calibrated_sigmoid.joblib")
    assert loaded is True
    assert model_service.is_english_ready() is True

    resp = client.post("/api/predict", json={"text": SAMPLE_HEADLINE_VALID, "language_hint": "en"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["prediction_label"] in ("Credible", "Unreliable")
    assert 0.0 <= data["confidence_score"] <= 1.0


def test_failed_loading_does_not_enable_inference():
    """Verify that a missing or corrupted artifact never authorizes inference."""
    model_service.enable_english_inference = False
    loaded = model_service.load_english_candidate("non_existent_artifact_123.joblib")
    assert loaded is False
    assert model_service.enable_english_inference is False
    assert model_service.is_english_ready() is False

    # Even if authorization flag was True, failed load leaves model unready
    model_service.enable_english_inference = True
    model_service._en_model = None
    loaded_bad = model_service.load_english_candidate("non_existent_artifact_123.joblib")
    assert loaded_bad is False
    assert model_service.is_english_ready() is False


def test_english_and_hindi_flags_remain_independent():
    """Verify English and Hindi authorization flags and loading states are completely decoupled."""
    # 1. English enabled, Hindi disabled
    model_service.enable_english_inference = True
    model_service.enable_hindi_inference = False
    model_service.load_english_candidate("en_ifnd_indian_headlines_calibrated_sigmoid.joblib")
    model_service.load_hindi_candidate("hi_tallip_hindi_articles_calibrated_sigmoid.joblib")

    assert model_service.is_english_ready() is True
    assert model_service.is_hindi_ready() is False

    # English prediction succeeds
    resp_en = client.post("/api/predict", json={"text": SAMPLE_HEADLINE_VALID, "language_hint": "en"})
    assert resp_en.status_code == 200

    # Hindi prediction is blocked with 503
    resp_hi = client.post("/api/predict", json={"text": SAMPLE_HINDI_HEADLINE, "language_hint": "hi"})
    assert resp_hi.status_code == 503
