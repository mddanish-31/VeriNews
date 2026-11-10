"""Transient Explainability Framework for VeriNews TF-IDF Models.

Features:
- Local feature attribution: computes active token contributions (weight * TF-IDF value).
- Supports word n-grams (English ISOT/IFND) and character n-grams (Hindi TaLLIP).
- Works transparently with raw linear models (LinearSVC, LogisticRegression) and CalibratedClassifierCV.
- Ranks influential features by absolute impact magnitude.
- Explicit directionality: identifies whether each token correlates with 'credible' or 'unreliable' patterns.
- Strict Zero Content Retention: explanations are transient and in-memory; never persisted to DB or disk.
- Non-dismissible Responsible AI disclaimer: features are correlation signals, not proof of truth.
"""

from dataclasses import asdict, dataclass
from typing import Any, Dict, List, Optional, Tuple, Union

import numpy as np


@dataclass
class TokenFeatureContribution:
    """A single influential lexical token or character n-gram with attribution weight."""

    token: str
    weight: float
    direction: str  # 'credible' or 'unreliable'
    contribution_score: float  # raw feature value * coefficient

    def to_dict(self) -> Dict[str, Any]:
        """Convert contribution to dictionary."""
        return asdict(self)


@dataclass
class LocalExplanation:
    """Transient local explanation for a specific inference input."""

    predicted_label: str
    confidence_score: Optional[float]
    influential_features: List[TokenFeatureContribution]
    total_active_features: int
    language: str
    feature_type: str  # 'word_ngram' or 'character_ngram'
    disclaimer: str

    def to_dict(self) -> Dict[str, Any]:
        """Convert explanation to serializable dictionary."""
        return {
            "predicted_label": self.predicted_label,
            "confidence_score": self.confidence_score,
            "influential_features": [f.to_dict() for f in self.influential_features],
            "total_active_features": self.total_active_features,
            "language": self.language,
            "feature_type": self.feature_type,
            "disclaimer": self.disclaimer,
        }


RESPONSIBLE_AI_EXPLANATION_DISCLAIMER = (
    "Influential lexical features represent statistical pattern correlations learned by the "
    "linear model from its training corpus. They are NOT empirical proof of factual truth or "
    "falsehood. Always verify important news claims with accredited independent fact-checkers."
)

RESPONSIBLE_AI_CHAR_EXPLANATION_DISCLAIMER = (
    "Influential character n-gram features represent subword morphological patterns learned by the "
    "Hindi model from its training corpus. They are NOT empirical proof of factual truth or "
    "falsehood. Always verify important news claims with accredited independent fact-checkers."
)

ENGLISH_UNINFORMATIVE_STOP_WORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
    "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both",
    "but", "by", "can", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't",
    "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't",
    "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
    "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll",
    "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's",
    "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on",
    "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own",
    "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some",
    "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then",
    "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this",
    "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we",
    "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's",
    "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with",
    "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your",
    "yours", "yourself", "yourselves", "will", "just", "now", "also",
}

HINDI_UNINFORMATIVE_STOP_WORDS = {
    "है", "हैं", "था", "थी", "थे", "ने", "को", "में", "पर", "से", "का", "की", "के",
    "और", "या", "भी", "ही", "तो", "एक", "यह", "वह", "इस", "उस", "इन", "उन",
    "किया", "किए", "गया", "गई", "गए", "कर", "रहा", "रही", "रहे", "हुए", "हुआ",
    "हुई", "तक", "लिए", "साथ", "बाद", "पहले", "वाले", "वाली", "होने", "होता",
    "होती", "होते", "दिया", "दिए", "दी", "गईं", "गए", "गया", "था", "थी", "थीं",
}


class TFIDFExplainer:
    """Extracts transient feature attribution from TF-IDF linear classifiers."""

    def __init__(
        self,
        vectorizer: Any,
        model: Any,
        classes: Optional[List[str]] = None,
        language: str = "en",
    ):
        """Initialize TFIDFExplainer.

        Args:
            vectorizer: Fitted TF-IDF vectorizer (word or char level).
            model: Fitted linear model or CalibratedClassifierCV.
            classes: Class labels list (default: extracted from model).
            language: Target language ('en' or 'hi').
        """
        self.vectorizer = vectorizer
        self.model = model
        self.language = language
        self.classes = list(classes) if classes is not None else list(getattr(model, "classes_", ["credible", "unreliable"]))

        # Extract underlying linear estimator and coefficients
        self.coef, self.intercept = self._extract_coefficients(model)
        self.feature_names = self._extract_feature_names(vectorizer)

        # Detect feature type (char vs word)
        analyzer = getattr(vectorizer, "analyzer", "word")
        self.feature_type = "character_ngram" if analyzer == "char" else "word_ngram"

    def _extract_coefficients(self, model: Any) -> Tuple[np.ndarray, float]:
        """Extract linear coefficients from a base estimator, FrozenEstimator, or CalibratedClassifierCV."""
        # Direct linear estimator with coef_
        if hasattr(model, "coef_"):
            coef = model.coef_
            intercept = float(model.intercept_[0]) if hasattr(model, "intercept_") else 0.0
            return coef, intercept

        # Direct FrozenEstimator wrapper
        if hasattr(model, "estimator") and hasattr(model.estimator, "coef_"):
            coef = model.estimator.coef_
            intercept = float(model.estimator.intercept_[0]) if hasattr(model.estimator, "intercept_") else 0.0
            return coef, intercept

        # Handle CalibratedClassifierCV
        if hasattr(model, "calibrated_classifiers_") and model.calibrated_classifiers_:
            first_cal = model.calibrated_classifiers_[0]
            est = getattr(first_cal, "estimator", None)
            if hasattr(est, "estimator") and hasattr(est.estimator, "coef_"):
                coef = est.estimator.coef_
                intercept = float(est.estimator.intercept_[0]) if hasattr(est.estimator, "intercept_") else 0.0
                return coef, intercept
            if hasattr(est, "coef_"):
                coef = est.coef_
                intercept = float(est.intercept_[0]) if hasattr(est, "intercept_") else 0.0
                return coef, intercept

        if hasattr(model, "estimator"):
            est = model.estimator
            if hasattr(est, "estimator") and hasattr(est.estimator, "coef_"):
                coef = est.estimator.coef_
                intercept = float(est.estimator.intercept_[0]) if hasattr(est.estimator, "intercept_") else 0.0
                return coef, intercept
            if hasattr(est, "coef_"):
                coef = est.coef_
                intercept = float(est.intercept_[0]) if hasattr(est, "intercept_") else 0.0
                return coef, intercept

        raise ValueError(f"Unable to extract linear coefficients from model of type {type(model)}.")

    def _extract_feature_names(self, vectorizer: Any) -> np.ndarray:
        """Extract array of feature tokens from vectorizer or FeatureUnion."""
        if hasattr(vectorizer, "get_feature_names_out"):
            return vectorizer.get_feature_names_out()
        raise ValueError("Vectorizer must implement get_feature_names_out().")

    def explain(
        self,
        text: str,
        top_k: int = 10,
    ) -> LocalExplanation:
        """Generate transient feature attribution for an input news text.

        Guarantees:
        - Completely transient in-memory operation.
        - Identifies top active features pushing toward credible or unreliable.
        - Zero storage or database side-effects.

        Args:
            text: Input news text.
            top_k: Maximum number of influential features to return.

        Returns:
            LocalExplanation container.
        """
        # Transform input text
        X_vec = self.vectorizer.transform([text])

        # Get prediction and confidence
        if hasattr(self.model, "predict_proba"):
            probs = self.model.predict_proba(X_vec)[0]
            pred_idx = int(np.argmax(probs))
            predicted_label = self.classes[pred_idx]
            confidence_score = round(float(probs[pred_idx]), 4)
        else:
            pred_label = self.model.predict(X_vec)[0]
            predicted_label = str(pred_label)
            confidence_score = None

        # Extract active non-zero feature indices
        non_zero_indices = X_vec.nonzero()[1]
        total_active = len(non_zero_indices)

        if total_active == 0:
            return LocalExplanation(
                predicted_label=predicted_label,
                confidence_score=confidence_score,
                influential_features=[],
                total_active_features=0,
                language=self.language,
                feature_type=self.feature_type,
                disclaimer=(
                    RESPONSIBLE_AI_CHAR_EXPLANATION_DISCLAIMER
                    if self.feature_type == "character_ngram"
                    else RESPONSIBLE_AI_EXPLANATION_DISCLAIMER
                ),
            )

        # Scikit-learn binary convention:
        # coef_[0] corresponds to self.classes[1]
        # If classes = ['credible', 'unreliable'], classes[1] is 'unreliable'.
        # positive coef means pushing toward classes[1] ('unreliable').
        # negative coef means pushing toward classes[0] ('credible').
        coef_1d = self.coef[0]
        pos_class_is_unreliable = (len(self.classes) >= 2 and self.classes[1] == "unreliable")

        contributions: List[TokenFeatureContribution] = []
        for idx in non_zero_indices:
            tfidf_val = float(X_vec[0, idx])
            c_weight = float(coef_1d[idx])
            score = tfidf_val * c_weight
            token_str = str(self.feature_names[idx])

            if pos_class_is_unreliable:
                direction = "unreliable" if score > 0 else "credible"
            else:
                direction = "credible" if score > 0 else "unreliable"

            contributions.append(
                TokenFeatureContribution(
                    token=token_str,
                    weight=round(abs(c_weight), 4),
                    direction=direction,
                    contribution_score=round(float(score), 4),
                )
            )

        # Rank features by absolute contribution impact magnitude
        contributions.sort(key=lambda x: abs(x.contribution_score), reverse=True)

        # Filter out uninformative grammatical stop words and non-lexical tokens
        informative_contributions = [c for c in contributions if not self._is_uninformative(c.token)]

        # Determine appropriate disclaimer
        base_disclaimer = (
            RESPONSIBLE_AI_CHAR_EXPLANATION_DISCLAIMER
            if self.feature_type == "character_ngram"
            else RESPONSIBLE_AI_EXPLANATION_DISCLAIMER
        )

        # Honest fallback if input contains only stop words
        if not informative_contributions and total_active > 0:
            return LocalExplanation(
                predicted_label=predicted_label,
                confidence_score=confidence_score,
                influential_features=[],
                total_active_features=total_active,
                language=self.language,
                feature_type=self.feature_type,
                disclaimer=(
                    "The submitted text contains only common grammatical stop words with no distinct "
                    "topical features. Lexical attribution cannot identify substantive claims."
                ),
            )

        top_features = informative_contributions[:top_k]

        return LocalExplanation(
            predicted_label=predicted_label,
            confidence_score=confidence_score,
            influential_features=top_features,
            total_active_features=total_active,
            language=self.language,
            feature_type=self.feature_type,
            disclaimer=base_disclaimer,
        )

    def _is_uninformative(self, token: str) -> bool:
        """Determine whether a token or n-gram is an uninformative grammatical stop word or whitespace/punct."""
        cleaned = token.strip()
        if not cleaned:
            return True

        if self.feature_type == "character_ngram":
            stripped = "".join(c for c in cleaned if c.isalnum())
            if not stripped or len(stripped) <= 1:
                return True
            return False

        # For word n-grams
        words = [w.lower() for w in cleaned.split()]
        if not words:
            return True

        if self.language == "hi":
            return all(w in HINDI_UNINFORMATIVE_STOP_WORDS or not any(c.isalnum() for c in w) for w in words)
        else:
            return all(w in ENGLISH_UNINFORMATIVE_STOP_WORDS or not any(c.isalnum() for c in w) for w in words)

