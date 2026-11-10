"""Tests for P10/P11 Model Hardening, IFND Path Resolution, and Model Readiness Safety."""

from pathlib import Path
import pytest

from backend.app.services.model_service import ModelService, ModelUnavailableException
from ml.readers import DatasetReadError, resolve_ifnd_path


def test_resolve_ifnd_path_finds_actual_dataset():
    """Verify resolve_ifnd_path correctly locates the IFND CSV file."""
    path = resolve_ifnd_path()
    assert path.is_file()
    assert path.name == "IFND.csv"
    assert path.stat().st_size > 1_000_000  # > 1MB


def test_resolve_ifnd_path_raises_on_invalid_dir(tmp_path):
    """Verify resolve_ifnd_path raises DatasetReadError when file is missing."""
    with pytest.raises(DatasetReadError):
        resolve_ifnd_path(base_dir=tmp_path)


def test_model_service_candidate_artifacts_discovery():
    """Verify ModelService discovers candidate baseline artifacts without activating them."""
    service = ModelService()
    artifacts = service.get_candidate_baseline_artifacts()

    assert "english" in artifacts
    assert "hindi" in artifacts
    assert len(artifacts["english"]) >= 2
    assert "hi_tallip_hindi_articles_hardened.joblib" in artifacts["hindi"]


def test_hardened_hindi_model_artifact_contract():
    """Verify hardened Hindi model artifact contains valid pipeline components."""
    service = ModelService()
    artifact = service.load_candidate_pipeline("hi_tallip_hindi_articles_hardened.joblib")

    assert artifact is not None
    assert "vectorizer" in artifact
    assert "model" in artifact
    assert "classes" in artifact
    assert artifact["language"] == "hi"
    assert set(artifact["classes"]) == {"credible", "unreliable"}

    # Test inference on a sample Devanagari sentence
    sample_hindi = "यह एक परीक्षण समाचार लेख है जो विश्वसनीयता की जांच करता है।"
    vec = artifact["vectorizer"]
    model = artifact["model"]

    vec_sample = vec.transform([sample_hindi])
    pred = model.predict(vec_sample)[0]
    assert pred in {"credible", "unreliable"}


def test_production_readiness_remains_safely_disabled():
    """Verify production inference remains strictly disabled until formal promotion."""
    service = ModelService()
    readiness = service.get_readiness()

    assert readiness["english"] is False
    assert readiness["hindi"] is False

    with pytest.raises(ModelUnavailableException):
        service.predict(
            text="Valid news text about city planning.",
            detected_language="en",
            language_name="English",
        )

