"""Unit tests for P11 Probability Calibration, Transient Explainability, and Production Safety."""

from pathlib import Path
import numpy as np
import pytest
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC

from backend.app.services.model_service import ModelService, ModelUnavailableException
from ml.calibration import (
    ModelCalibrator,
    compute_expected_calibration_error,
    evaluate_calibration,
)
from ml.explainability import (
    RESPONSIBLE_AI_EXPLANATION_DISCLAIMER,
    TFIDFExplainer,
)


def test_expected_calibration_error_calculation():
    """Verify ECE computes zero for perfectly calibrated predictions."""
    # Perfect calibration: prob 0.8 is true 80% of the time, prob 0.2 is true 20%
    y_true = np.array([1, 1, 1, 1, 0, 0, 0, 0, 0, 1])
    y_prob = np.array([0.8, 0.8, 0.8, 0.8, 0.8, 0.2, 0.2, 0.2, 0.2, 0.2])

    ece = compute_expected_calibration_error(y_true, y_prob, n_bins=5)
    assert 0.0 <= ece <= 0.05


def test_model_calibrator_split_hygiene():
    """Verify ModelCalibrator splits calibration data strictly from training data."""
    X_train = [
        "Government announces new economic policy for small businesses.",
        "Breaking scandal reveals shocking conspiracy in town.",
        "Municipal elections scheduled for the third week of November.",
        "Anonymous sources claim unbelievable extraterrestrial sightings.",
        "Federal reserve maintains interest rates at current benchmarks.",
        "Celebrity caught in viral sensational feud on internet.",
        "Health department issues seasonal influenza vaccination advisory.",
        "Miracle cure eliminates all illnesses overnight according to bloggers.",
        "Treasury department releases quarterly fiscal stability outlook.",
        "Fabricated rumor claims city will run out of water tomorrow.",
        "State governor inaugurates regional transportation terminal.",
        "Sensational clickbait promises instant lottery jackpot formula.",
        "Ministry of education publishes revised high school standards.",
        "Bizarre hoax alleges prominent bank replaced money with coupons.",
        "Public health clinic expands pediatric vaccination hours.",
        "Unverified tabloid story accuses mayor of absurd crimes.",
    ]
    y_train = [
        "credible", "unreliable", "credible", "unreliable",
        "credible", "unreliable", "credible", "unreliable",
        "credible", "unreliable", "credible", "unreliable",
        "credible", "unreliable", "credible", "unreliable",
    ]

    calibrator = ModelCalibrator(calibration_fraction=0.25, method="sigmoid", random_state=42)
    vec = TfidfVectorizer()
    clf = LogisticRegression()

    cal_model, fitted_vec, stats = calibrator.calibrate(clf, vec, X_train, y_train)

    assert stats["total_train_samples"] == 16
    assert stats["subtrain_samples"] == 12
    assert stats["calibration_samples"] == 4
    assert hasattr(cal_model, "predict_proba")


def test_tfidf_explainer_english_word_level():
    """Verify TFIDFExplainer extracts top influential words with polarity and disclaimer."""
    corpus = [
        "Official council budget hearing scheduled for Tuesday afternoon.",
        "Shocking secret conspiracy exposed by anonymous whistleblowers.",
    ]
    labels = ["credible", "unreliable"]

    vec = TfidfVectorizer()
    X = vec.fit_transform(corpus)
    clf = LogisticRegression()
    clf.fit(X, labels)

    explainer = TFIDFExplainer(vectorizer=vec, model=clf, classes=clf.classes_, language="en")
    explanation = explainer.explain("Official council hearing exposes budget secret.", top_k=3)

    assert explanation.feature_type == "word_ngram"
    assert explanation.predicted_label in ["credible", "unreliable"]
    assert len(explanation.influential_features) <= 3
    assert explanation.disclaimer == RESPONSIBLE_AI_EXPLANATION_DISCLAIMER

    for feat in explanation.influential_features:
        assert isinstance(feat.token, str)
        assert feat.direction in ["credible", "unreliable"]
        assert feat.weight >= 0.0


def test_tfidf_explainer_hindi_character_level():
    """Verify TFIDFExplainer extracts character n-grams for Devanagari Hindi."""
    hindi_corpus = [
        "नगर परिषद ने विकास कार्यों के लिए बजट को मंजूरी दी।",
        "सोशल मीडिया पर सनसनीखेज झूठी अफवाह तेजी से वायरल हुई।",
    ]
    labels = ["credible", "unreliable"]

    vec = TfidfVectorizer(analyzer="char", ngram_range=(3, 5))
    X = vec.fit_transform(hindi_corpus)
    clf = LogisticRegression()
    clf.fit(X, labels)

    explainer = TFIDFExplainer(vectorizer=vec, model=clf, classes=clf.classes_, language="hi")
    explanation = explainer.explain("परिषद ने बजट को मंजूरी दी।", top_k=3)

    assert explanation.feature_type == "character_ngram"
    assert explanation.language == "hi"
    assert len(explanation.influential_features) <= 3
    for feat in explanation.influential_features:
        assert len(feat.token) >= 3  # Character n-gram


def test_model_service_discovers_calibrated_artifacts():
    """Verify ModelService discovers calibrated model artifacts in models/calibrated/."""
    service = ModelService()
    calibrated_artifacts = service.get_candidate_calibrated_artifacts()

    assert "english" in calibrated_artifacts
    assert "hindi" in calibrated_artifacts
    assert "en_isot_english_articles_calibrated_sigmoid.joblib" in calibrated_artifacts["english"]
    assert "hi_tallip_hindi_articles_calibrated_sigmoid.joblib" in calibrated_artifacts["hindi"]

    # Test loading calibrated pipeline
    bundle = service.load_calibrated_pipeline("en_isot_english_articles_calibrated_sigmoid.joblib")
    assert bundle is not None
    assert "vectorizer" in bundle
    assert "model" in bundle
    assert hasattr(bundle["model"], "predict_proba")


def test_production_api_still_disabled():
    """Verify production inference remains strictly disabled (HTTP 503 invariant)."""
    service = ModelService()
    readiness = service.get_readiness()

    assert readiness["english"] is False
    assert readiness["hindi"] is False

    with pytest.raises(ModelUnavailableException):
        service.predict(
            text="Valid journalistic news text exceeding one hundred characters length minimum threshold.",
            detected_language="en",
            language_name="English",
        )
