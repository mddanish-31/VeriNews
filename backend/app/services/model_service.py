import logging
import os
from pathlib import Path
import time
from typing import Any, Dict, List, Optional
import joblib
import numpy as np

from backend.app.core.config import settings
from backend.app.schemas.prediction import PredictionResponse, TokenAttribution
from ml.explainability import TFIDFExplainer

logger = logging.getLogger(__name__)


class ModelUnavailableException(Exception):
    """Raised when an inference request is made but no trained approved model artifact exists."""

    def __init__(self, message: str, language: str):
        super().__init__(message)
        self.message = message
        self.language = language


class ModelService:
    """Manages model artifact loading and CPU inference dispatch.

    Safety Guarantee:
    Production inference readiness is independently gated for English and Hindi.
    Candidate baseline/calibrated artifacts are tracked in models/ and require
    explicit activation or deployment gate clearance before being served.
    """

    def __init__(self, models_dir: Optional[Path] = None):
        self._custom_models_dir = models_dir
        self.enable_english_inference = settings.ENABLE_ENGLISH_INFERENCE
        self.enable_hindi_inference = settings.ENABLE_HINDI_INFERENCE

        self._en_model = None
        self._en_vectorizer = None
        self._en_explainer = None
        self._en_model_version = None
        self._en_disclaimer = None

        self._hi_model = None
        self._hi_vectorizer = None
        self._hi_explainer = None
        self._hi_model_version = None
        self._hi_disclaimer = None

        # Auto-load candidate models if explicitly enabled via settings
        if self.enable_english_inference:
            self.load_english_candidate(settings.DEFAULT_ENGLISH_ARTIFACT)
        if self.enable_hindi_inference:
            self.load_hindi_candidate(settings.DEFAULT_HINDI_ARTIFACT)

    @property
    def models_dir(self) -> Path:
        """Dynamically return custom models directory if set, or system settings.MODELS_DIR."""
        if self._custom_models_dir is not None:
            return self._custom_models_dir
        return settings.MODELS_DIR

    @models_dir.setter
    def models_dir(self, value: Optional[Path]) -> None:
        self._custom_models_dir = value

    def reload(self) -> None:
        """Reload configuration and candidate models based on current settings and environment."""
        env_en = os.getenv("VERINEWS_ENABLE_ENGLISH_INFERENCE")
        if env_en is not None:
            self.enable_english_inference = env_en.lower() in ("true", "1", "yes")
        else:
            self.enable_english_inference = settings.ENABLE_ENGLISH_INFERENCE

        env_hi = os.getenv("VERINEWS_ENABLE_HINDI_INFERENCE")
        if env_hi is not None:
            self.enable_hindi_inference = env_hi.lower() in ("true", "1", "yes")
        else:
            self.enable_hindi_inference = settings.ENABLE_HINDI_INFERENCE

        self._en_model = None
        self._en_vectorizer = None
        self._en_explainer = None
        self._hi_model = None
        self._hi_vectorizer = None
        self._hi_explainer = None

        if self.enable_english_inference:
            self.load_english_candidate(settings.DEFAULT_ENGLISH_ARTIFACT)
        if self.enable_hindi_inference:
            self.load_hindi_candidate(settings.DEFAULT_HINDI_ARTIFACT)

    def resolve_artifact_path(self, artifact_name: str) -> Optional[Path]:
        """Resolve model artifact path against direct paths, models_dir, or subdirectories."""
        # 1. Direct path check (absolute or relative to current working directory)
        candidate = Path(artifact_name)
        if candidate.is_file():
            return candidate

        # 2. Directly in models_dir
        candidate = self.models_dir / artifact_name
        if candidate.is_file():
            return candidate

        # 3. In standard subdirectories (calibrated, baselines)
        for subdir in ["calibrated", "baselines"]:
            candidate = self.models_dir / subdir / artifact_name
            if candidate.is_file():
                return candidate

        return None

    def load_english_candidate(self, artifact_name: str = "en_ifnd_indian_headlines_calibrated_sigmoid.joblib") -> bool:
        """Load and validate an eligible candidate English model artifact (e.g. IFND calibrated model)."""
        artifact_path = self.resolve_artifact_path(artifact_name)
        if artifact_path is None:
            logger.warning(
                "Candidate English model artifact '%s' was not found in %s or subdirectories.",
                artifact_name,
                self.models_dir,
            )
            return False

        try:
            bundle = joblib.load(artifact_path)
        except Exception as exc:
            logger.error("Failed to load English model artifact at %s: %s", artifact_path, exc)
            return False

        if not isinstance(bundle, dict):
            logger.error("English model bundle at %s is invalid: expected dict, got %s", artifact_path, type(bundle))
            return False

        if "model" not in bundle or "vectorizer" not in bundle:
            logger.error("English model bundle at %s is missing required 'model' or 'vectorizer' keys", artifact_path)
            return False

        model = bundle["model"]
        vectorizer = bundle["vectorizer"]

        if not hasattr(vectorizer, "transform"):
            logger.error("Vectorizer in %s does not implement 'transform'", artifact_path)
            return False

        if not hasattr(model, "predict"):
            logger.error("Model in %s does not implement 'predict'", artifact_path)
            return False

        self._en_model = model
        self._en_vectorizer = vectorizer
        self._en_model_version = artifact_name.replace(".joblib", "")

        try:
            self._en_explainer = TFIDFExplainer(
                vectorizer=self._en_vectorizer,
                model=self._en_model,
                classes=bundle.get("classes"),
                language="en",
            )
        except Exception as exc:
            logger.warning("Could not initialize explainability for %s: %s", artifact_path, exc)
            self._en_explainer = None

        self._en_disclaimer = (
            "VeriNews analyzes stylistic and linguistic markers. This assessment reflects statistical "
            "patterns learned from the candidate benchmark corpus (IFND, Kar et al., 2021) and does "
            "NOT verify empirical facts. Always verify important news with accredited fact-checkers."
        )
        logger.info("Successfully loaded and validated English model artifact: %s (version: %s)", artifact_path.name, self._en_model_version)
        return True

    def load_hindi_candidate(self, artifact_name: str = "hi_tallip_hindi_articles_calibrated_sigmoid.joblib") -> bool:
        """Load and validate an experimental candidate Hindi model artifact (TaLLIP)."""
        artifact_path = self.resolve_artifact_path(artifact_name)
        if artifact_path is None:
            logger.warning(
                "Candidate Hindi model artifact '%s' was not found in %s or subdirectories.",
                artifact_name,
                self.models_dir,
            )
            return False

        try:
            bundle = joblib.load(artifact_path)
        except Exception as exc:
            logger.error("Failed to load Hindi model artifact at %s: %s", artifact_path, exc)
            return False

        if not isinstance(bundle, dict):
            logger.error("Hindi model bundle at %s is invalid: expected dict, got %s", artifact_path, type(bundle))
            return False

        if "model" not in bundle or "vectorizer" not in bundle:
            logger.error("Hindi model bundle at %s is missing required 'model' or 'vectorizer' keys", artifact_path)
            return False

        model = bundle["model"]
        vectorizer = bundle["vectorizer"]

        if not hasattr(vectorizer, "transform"):
            logger.error("Vectorizer in %s does not implement 'transform'", artifact_path)
            return False

        if not hasattr(model, "predict"):
            logger.error("Model in %s does not implement 'predict'", artifact_path)
            return False

        self._hi_model = model
        self._hi_vectorizer = vectorizer
        self._hi_model_version = artifact_name.replace(".joblib", "")

        try:
            self._hi_explainer = TFIDFExplainer(
                vectorizer=self._hi_vectorizer,
                model=self._hi_model,
                classes=bundle.get("classes"),
                language="hi",
            )
        except Exception as exc:
            logger.warning("Could not initialize explainability for %s: %s", artifact_path, exc)
            self._hi_explainer = None

        self._hi_disclaimer = (
            "VeriNews analyzes stylistic and linguistic markers in Devanagari Hindi. This experimental "
            "assessment reflects statistical patterns learned from the TaLLIP research corpus (Patel et al., "
            "2021) and does NOT verify empirical facts. Always verify news with accredited fact-checkers."
        )
        logger.info("Successfully loaded and validated Hindi model artifact: %s (version: %s)", artifact_path.name, self._hi_model_version)
        return True

    def get_candidate_baseline_artifacts(self) -> Dict[str, List[str]]:
        """List candidate baseline and hardened model artifacts available on disk."""
        baselines_dir = self.models_dir / "baselines"
        if not baselines_dir.is_dir():
            return {"english": [], "hindi": []}

        en_artifacts = [p.name for p in baselines_dir.glob("en_*.joblib")]
        hi_artifacts = [p.name for p in baselines_dir.glob("hi_*.joblib")]
        return {
            "english": sorted(en_artifacts),
            "hindi": sorted(hi_artifacts),
        }

    def get_candidate_calibrated_artifacts(self) -> Dict[str, List[str]]:
        """List calibrated model artifacts available on disk."""
        calibrated_dir = self.models_dir / "calibrated"
        if not calibrated_dir.is_dir():
            return {"english": [], "hindi": []}

        en_artifacts = [p.name for p in calibrated_dir.glob("en_*.joblib")]
        hi_artifacts = [p.name for p in calibrated_dir.glob("hi_*.joblib")]
        return {
            "english": sorted(en_artifacts),
            "hindi": sorted(hi_artifacts),
        }

    def load_candidate_pipeline(self, artifact_name: str) -> Optional[Dict[str, Any]]:
        """Safely load a candidate baseline or hardened model artifact for evaluation."""
        artifact_path = self.models_dir / "baselines" / artifact_name
        if not artifact_path.is_file():
            return None
        return joblib.load(artifact_path)

    def load_calibrated_pipeline(self, artifact_name: str) -> Optional[Dict[str, Any]]:
        """Safely load a candidate calibrated model artifact for evaluation."""
        artifact_path = self.models_dir / "calibrated" / artifact_name
        if not artifact_path.is_file():
            return None
        return joblib.load(artifact_path)

    def is_english_ready(self) -> bool:
        """Check if English model is loaded and approved for inference."""
        if not self.enable_english_inference:
            return False
        return self._en_model is not None

    def is_hindi_ready(self) -> bool:
        """Check if Hindi model is loaded and approved for inference."""
        if not self.enable_hindi_inference:
            return False
        return self._hi_model is not None

    def get_readiness(self) -> Dict[str, bool]:
        """Return readiness status for all supported language pipelines."""
        return {
            "english": self.is_english_ready(),
            "hindi": self.is_hindi_ready(),
        }

    def predict(self, text: str, detected_language: str, language_name: str) -> PredictionResponse:
        """Execute model inference and generate transient explainability.

        Privacy guarantee:
        - Input text, extracted features, and tokens are NEVER stored in PostgreSQL or disk logs.
        - Output is returned transiently to the client.
        """
        is_ready = self.is_english_ready() if detected_language == "en" else self.is_hindi_ready()

        if not is_ready:
            if detected_language == "hi":
                msg = (
                    f"The {language_name} model service is not available. "
                    "Hindi model inference is currently disabled pending dataset licensing and deployment clearance. "
                    "VeriNews never fabricates synthetic predictions."
                )
            else:
                msg = (
                    f"The {language_name} model service is not available. "
                    "In this research preview, no approved machine learning model has been deployed yet. "
                    "VeriNews never fabricates synthetic predictions."
                )
            raise ModelUnavailableException(message=msg, language=detected_language)

        t0 = time.perf_counter()

        # Select pipeline components
        if detected_language == "en":
            model = self._en_model
            vectorizer = self._en_vectorizer
            explainer = self._en_explainer
            model_ver = self._en_model_version or "IFND-Calibrated-Sigmoid-v1"
            disclaimer = self._en_disclaimer
        else:
            model = self._hi_model
            vectorizer = self._hi_vectorizer
            explainer = self._hi_explainer
            model_ver = self._hi_model_version or "TaLLIP-Calibrated-Sigmoid-v1"
            disclaimer = self._hi_disclaimer

        # 1. Transform text
        X_vec = vectorizer.transform([text])

        # Zero-vocabulary density guard: Check for matching vocabulary features
        if X_vec.nnz == 0:
            latency = round((time.perf_counter() - t0) * 1000, 2)
            return PredictionResponse(
                detected_language=detected_language,
                language_name=language_name,
                prediction_label="Unclassifiable",
                is_credible=None,
                confidence_score=None,
                confidence_tier="Unclassifiable / Out of Domain",
                influential_tokens=[],
                disclaimer=(
                    "The submitted text contains no recognizable vocabulary from the model's training "
                    "distribution. VeriNews cannot produce a reliable stylistic pattern assessment for "
                    "out-of-domain or unclassifiable inputs."
                ),
                model_version=model_ver,
                latency_ms=latency,
            )

        # 2. Probability inference

        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(X_vec)[0]
            classes = list(getattr(model, "classes_", ["credible", "unreliable"]))
            pos_idx = int(np.argmax(probs))
            raw_label = str(classes[pos_idx])
            confidence = float(probs[pos_idx])
        else:
            raw_pred = model.predict(X_vec)[0]
            raw_label = str(raw_pred)
            confidence = 1.0

        # Confidence tier
        if confidence >= 0.85:
            confidence_tier = "High Confidence Pattern"
        elif confidence >= 0.70:
            confidence_tier = "Moderate Confidence Pattern"
        else:
            confidence_tier = "Low Confidence / Ambiguous Pattern"

        is_credible = (raw_label.lower() in ("credible", "real", "legit", "true"))
        prediction_label = "Credible" if is_credible else "Unreliable"

        # 3. Transient explainability (top 5 influential features)
        token_attributions = []
        if explainer is not None:
            explanation = explainer.explain(text, top_k=5)
            for feat in explanation.influential_features:
                token_attributions.append(
                    TokenAttribution(
                        token=feat.token,
                        weight=feat.weight,
                        direction=feat.direction,
                    )
                )
            if not token_attributions and explanation.disclaimer:
                disclaimer = explanation.disclaimer

        latency = round((time.perf_counter() - t0) * 1000, 2)

        return PredictionResponse(
            detected_language=detected_language,
            language_name=language_name,
            prediction_label=prediction_label,
            is_credible=is_credible,
            confidence_score=round(confidence, 4),
            confidence_tier=confidence_tier,
            influential_tokens=token_attributions,
            disclaimer=disclaimer or (
                "VeriNews analyzes stylistic and linguistic markers. This assessment reflects statistical "
                "patterns and does NOT verify empirical facts. Always verify news with accredited fact-checkers."
            ),
            model_version=model_ver,
            latency_ms=latency,
        )


# Global singleton instance
model_service = ModelService()
