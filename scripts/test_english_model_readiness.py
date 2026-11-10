"""VeriNews — Empirical Verification of English IFND Candidate Model Readiness.

Tests artifact loading, pipeline components, Platt calibration, boundary lengths (20-500 chars),
API contract adherence, explainability token generation, and ensures Hindi remains strictly disabled.
"""

from pathlib import Path
import sys
import time
import joblib
import numpy as np

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.schemas.prediction import PredictionResponse
from backend.app.services.model_service import ModelService
from ml.explainability import TFIDFExplainer


def main():
    print("=" * 70)
    print("VERINEWS — ENGLISH IFND CANDIDATE MODEL READINESS AUDIT")
    print("=" * 70)

    artifact_path = PROJECT_ROOT / "models" / "calibrated" / "en_ifnd_indian_headlines_calibrated_sigmoid.joblib"
    
    # 1. Artifact Existence & Loading
    assert artifact_path.is_file(), f"Artifact missing at {artifact_path}"
    print(f"[CHECK 1] Artifact exists: {artifact_path.name} ({artifact_path.stat().st_size:,} bytes)")

    bundle = joblib.load(artifact_path)
    required_keys = ["vectorizer", "model", "classes", "calibration_method"]
    for k in required_keys:
        assert k in bundle, f"Missing key '{k}' in joblib bundle"
    print(f"[CHECK 2] Joblib bundle structure verified: {list(bundle.keys())}")

    # 2. Pipeline Components
    vectorizer = bundle["vectorizer"]
    model = bundle["model"]
    classes = bundle["classes"]

    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.calibration import CalibratedClassifierCV

    assert isinstance(vectorizer, TfidfVectorizer), f"Expected TfidfVectorizer, got {type(vectorizer)}"
    assert isinstance(model, CalibratedClassifierCV), f"Expected CalibratedClassifierCV, got {type(model)}"
    print(f"[CHECK 3] Pipeline components verified: {type(vectorizer).__name__} + {type(model).__name__}")
    print(f"          Classes: {list(classes)} | Vocabulary size: {len(vectorizer.vocabulary_):,}")

    # 3. Calibration Verification
    assert bundle["calibration_method"] == "sigmoid", f"Expected sigmoid calibration, got {bundle['calibration_method']}"
    assert "brier_score" in bundle, "Missing brier_score metric in bundle"
    print(f"[CHECK 4] Calibration: Platt Sigmoid | Brier: {bundle.get('brier_score')} | ECE: {bundle.get('expected_calibration_error')} | Macro F1: {bundle.get('macro_f1')}")

    # 4. Explainability Readiness
    explainer = TFIDFExplainer(
        vectorizer=vectorizer,
        model=model,
        classes=classes,
        language="en",
    )
    test_headline = "City council approves major new public library for the east side"
    explanation = explainer.explain(test_headline, top_k=5)
    assert len(explanation.influential_features) > 0, "Explainer generated zero features"
    print(f"[CHECK 5] Local Explainability verified: Extracted {len(explanation.influential_features)} influential features")
    for t in explanation.influential_features[:3]:
        print(f"          - Token: '{t.token}', weight: {t.weight:+.4f}, direction: '{t.direction}'")

    # 5. Boundary Length Testing
    print("[CHECK 6] Testing input boundaries (20 to 500 characters):")
    # Min boundary (20 chars)
    min_headline = "A" * 19 + "!" # 20 chars
    X_min = vectorizer.transform([min_headline])
    probs_min = model.predict_proba(X_min)[0]
    assert len(probs_min) == 2 and np.isclose(np.sum(probs_min), 1.0), "Probability distribution invalid at min boundary"
    print(f"          - Boundary min (20 chars): OK (Probabilities: {probs_min})")

    # Max boundary (500 chars)
    max_headline = ("Breaking news report: " + "regional government policy announcement. ") * 10
    max_headline = max_headline[:500]
    assert len(max_headline) == 500
    X_max = vectorizer.transform([max_headline])
    probs_max = model.predict_proba(X_max)[0]
    assert len(probs_max) == 2 and np.isclose(np.sum(probs_max), 1.0), "Probability distribution invalid at max boundary"
    print(f"          - Boundary max (500 chars): OK (Probabilities: {probs_max})")

    # 6. ModelService Controlled Staging Simulation
    service = ModelService(models_dir=PROJECT_ROOT / "models")
    # In default mode, English inference is disabled
    assert not service.is_english_ready(), "English inference should be disabled by default"
    assert not service.is_hindi_ready(), "Hindi inference must be disabled"
    print("[CHECK 7] Default service state: English=DISABLED, Hindi=DISABLED (Zero inference leak)")

    # Test controlled activation of English only
    load_ok = service.load_english_candidate("en_ifnd_indian_headlines_calibrated_sigmoid.joblib")
    assert load_ok, "Failed to load candidate English model in controlled simulation"
    assert service.is_english_ready(), "English should be ready after explicit candidate loading"
    assert not service.is_hindi_ready(), "Hindi MUST remain disabled after English candidate loading"
    print("[CHECK 8] Controlled activation: English=READY, Hindi=DISABLED (Decoupled language safety verified)")

    # Execute genuine prediction
    sample_text = (
        "The city council has approved a new public library for the east side, with construction "
        "expected to begin next spring. The final budget and timeline will be published next week."
    )
    pred_response = service.predict(
        text=sample_text,
        detected_language="en",
        language_name="English",
    )
    assert isinstance(pred_response, PredictionResponse), "Response does not conform to PredictionResponse schema"
    assert pred_response.prediction_label in ["Credible", "Unreliable"], f"Unexpected label {pred_response.prediction_label}"
    assert 0.0 <= pred_response.confidence_score <= 1.0, f"Confidence out of range: {pred_response.confidence_score}"
    valid_tiers = ["High Confidence Pattern", "Moderate Confidence Pattern", "Low Confidence / Ambiguous Pattern"]
    assert pred_response.confidence_tier in valid_tiers, f"Unexpected tier {pred_response.confidence_tier}"
    assert "IFND" in pred_response.disclaimer, "Disclaimer missing IFND attribution"
    assert len(pred_response.influential_tokens) > 0, "Response missing influential tokens"
    print(f"[CHECK 9] Genuine Prediction Output Verified:")
    print(f"          - Label: {pred_response.prediction_label}")
    print(f"          - Confidence: {pred_response.confidence_score:.2%} ({pred_response.confidence_tier} tier)")
    print(f"          - Model Version: {pred_response.model_version}")
    print(f"          - Disclaimer: {pred_response.disclaimer[:90]}...")
    print(f"          - Latency: {pred_response.latency_ms:.2f} ms")

    # Verify Hindi prediction still raises ModelUnavailableException
    from backend.app.services.model_service import ModelUnavailableException
    hindi_blocked = False
    try:
        service.predict(text="नगर परिषद ने पुस्तकालय को मंजूरी दी।", detected_language="hi", language_name="Hindi")
    except ModelUnavailableException as exc:
        hindi_blocked = True
        assert "Hindi model service is not available" in exc.message
    assert hindi_blocked, "Hindi prediction was NOT blocked"
    print("[CHECK 10] Hindi Prediction Gate: Confirmed strictly blocked with ModelUnavailableException (HTTP 503)")

    print("=" * 70)
    print("ALL 10 READINESS CHECKS PASSED EMPIRICALLY.")
    print("=" * 70)


if __name__ == "__main__":
    main()
