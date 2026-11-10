"""CPU-friendly classical ML training, evaluation, and serialization pipeline.

Features:
- Separate pipelines for English and Hindi text.
- Binary label enforcement (CREDIBLE and UNRELIABLE) via explicit LabelMapping.
- Stratified train/val/test splitting with exact duplicate leakage prevention.
- TF-IDF feature extraction with calibrated Logistic Regression.
- Comprehensive evaluation metrics: accuracy, precision, recall, F1, confusion matrix.
- Guarded artifact saving: refuses to save artifacts from unapproved datasets.
"""

from dataclasses import asdict, dataclass, field
import hashlib
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, precision_recall_fscore_support
from sklearn.model_selection import train_test_split

from .schemas import CanonicalLabel, Record


@dataclass
class EvaluationReport:
    """Comprehensive evaluation metrics for model performance assessment."""

    accuracy: float
    precision_macro: float
    recall_macro: float
    f1_macro: float
    precision_per_class: Dict[str, float]
    recall_per_class: Dict[str, float]
    f1_per_class: Dict[str, float]
    confusion_matrix: List[List[int]]
    class_distribution: Dict[str, int]
    total_samples: int

    def to_dict(self) -> Dict[str, Any]:
        """Serialize report to dictionary."""
        return asdict(self)


@dataclass
class DataSplit:
    """Container for stratified train, validation, and test datasets."""

    X_train: List[str]
    y_train: List[str]
    X_val: List[str]
    y_val: List[str]
    X_test: List[str]
    y_test: List[str]
    split_stats: Dict[str, Any] = field(default_factory=dict)


def prepare_and_split_records(
    records: List[Record],
    val_size: float = 0.15,
    test_size: float = 0.15,
    random_state: int = 42,
    deduplicate: bool = True,
) -> DataSplit:
    """Filter, deduplicate, and split validated records into train, val, and test partitions.

    Guarantees:
    - Only valid records with non-null canonical labels are included.
    - Exact duplicate texts are pruned before splitting to prevent train-test data leakage.
    - Stratified splitting preserves class balance across all splits.
    - Reproducible with fixed random_state.

    Args:
        records: List of Record instances.
        val_size: Fraction of data reserved for validation.
        test_size: Fraction of data reserved for testing.
        random_state: Random seed for reproducibility.
        deduplicate: If True, prunes exact duplicate texts before splitting.

    Returns:
        DataSplit container with train, validation, and test sets.

    Raises:
        ValueError: If insufficient samples exist for stratified splitting.
    """
    valid_records = [r for r in records if r.is_valid and r.canonical_label is not None]
    if not valid_records:
        raise ValueError("No valid records with canonical labels available for splitting.")

    # Prevent train-test leakage by removing exact duplicate texts
    seen_hashes = set()
    unique_records: List[Record] = []
    duplicate_count = 0

    for r in valid_records:
        clean_text = r.text.strip()
        text_hash = hashlib.sha256(clean_text.encode("utf-8")).hexdigest()
        if deduplicate and text_hash in seen_hashes:
            duplicate_count += 1
            continue
        seen_hashes.add(text_hash)
        unique_records.append(r)

    total_samples = len(unique_records)
    if total_samples < 4:
        raise ValueError(
            f"Insufficient unique samples ({total_samples}) for train/val/test splitting. "
            "At least 4 samples are required."
        )

    X = [r.text.strip() for r in unique_records]
    y = [r.canonical_label.value for r in unique_records]

    # Verify binary representation
    unique_labels = sorted(list(set(y)))
    if len(unique_labels) < 2:
        raise ValueError(
            f"Both binary classes must be present for splitting. Found only: {unique_labels}"
        )

    # First split off test set
    X_train_val, X_test, y_train_val, y_test = train_test_split(
        X,
        y,
        test_size=test_size,
        random_state=random_state,
        stratify=y,
    )

    # Next split train into train and val
    val_relative_ratio = val_size / (1.0 - test_size)
    X_train, X_val, y_train, y_val = train_test_split(
        X_train_val,
        y_train_val,
        test_size=val_relative_ratio,
        random_state=random_state,
        stratify=y_train_val,
    )

    stats = {
        "total_input_records": len(records),
        "valid_records": len(valid_records),
        "duplicates_removed_for_leakage_prevention": duplicate_count,
        "unique_samples": total_samples,
        "train_samples": len(X_train),
        "val_samples": len(X_val),
        "test_samples": len(X_test),
        "class_distribution_train": {c: y_train.count(c) for c in unique_labels},
        "class_distribution_val": {c: y_val.count(c) for c in unique_labels},
        "class_distribution_test": {c: y_test.count(c) for c in unique_labels},
    }

    return DataSplit(
        X_train=X_train,
        y_train=y_train,
        X_val=X_val,
        y_val=y_val,
        X_test=X_test,
        y_test=y_test,
        split_stats=stats,
    )


class ClassicalCredibilityClassifier:
    """CPU-friendly classical ML model pipeline using TF-IDF + Logistic Regression."""

    def __init__(
        self,
        language: str = "en",
        max_features: int = 10000,
        ngram_range: Tuple[int, int] = (1, 2),
        min_df: int = 1,
        random_state: int = 42,
    ):
        """Initialize ClassicalCredibilityClassifier.

        Args:
            language: Target language ('en' for English, 'hi' for Hindi).
            max_features: Maximum TF-IDF vocabulary features.
            ngram_range: Token n-gram range (default: unigrams and bigrams).
            min_df: Minimum document frequency threshold.
            random_state: Random state for deterministic reproducibility.
        """
        self.language = language
        self.max_features = max_features
        self.ngram_range = ngram_range
        self.min_df = min_df
        self.random_state = random_state

        # Script-aware token pattern: preserves Unicode word characters (Devanagari and Latin)
        token_pattern = r"(?u)\b\w+\b"

        self.vectorizer = TfidfVectorizer(
            ngram_range=self.ngram_range,
            max_features=self.max_features,
            min_df=self.min_df,
            sublinear_tf=True,
            token_pattern=token_pattern,
        )

        self.classifier = LogisticRegression(
            class_weight="balanced",
            max_iter=1000,
            random_state=self.random_state,
            solver="lbfgs",
        )

        self.is_fitted = False
        self.classes_: Optional[np.ndarray] = None

    def fit(self, X: List[str], y: List[str]) -> "ClassicalCredibilityClassifier":
        """Fit TF-IDF vectorizer and Logistic Regression classifier on training data.

        Args:
            X: List of article text strings.
            y: List of canonical label strings ('credible' / 'unreliable').

        Returns:
            self
        """
        X_vec = self.vectorizer.fit_transform(X)
        self.classifier.fit(X_vec, y)
        self.is_fitted = True
        self.classes_ = self.classifier.classes_
        return self

    def predict(self, X: List[str]) -> List[str]:
        """Predict canonical credibility labels for input texts."""
        if not self.is_fitted:
            raise RuntimeError("Classifier has not been fitted.")
        X_vec = self.vectorizer.transform(X)
        preds = self.classifier.predict(X_vec)
        return list(preds)

    def predict_proba(self, X: List[str]) -> np.ndarray:
        """Predict calibrated class probability distributions."""
        if not self.is_fitted:
            raise RuntimeError("Classifier has not been fitted.")
        X_vec = self.vectorizer.transform(X)
        return self.classifier.predict_proba(X_vec)

    def evaluate(self, X: List[str], y_true: List[str]) -> EvaluationReport:
        """Evaluate classifier performance against gold labels.

        Args:
            X: List of evaluation texts.
            y_true: Ground truth canonical labels.

        Returns:
            EvaluationReport with precision, recall, F1, confusion matrix.
        """
        if not self.is_fitted:
            raise RuntimeError("Classifier has not been fitted.")

        y_pred = self.predict(X)
        unique_classes = sorted(list(set(y_true) | set(y_pred)))

        acc = float(accuracy_score(y_true, y_pred))
        precision_mac, recall_mac, f1_mac, _ = precision_recall_fscore_support(
            y_true, y_pred, average="macro", zero_division=0
        )
        prec_per, rec_per, f1_per, _ = precision_recall_fscore_support(
            y_true, y_pred, labels=unique_classes, zero_division=0
        )

        cm = confusion_matrix(y_true, y_pred, labels=unique_classes).tolist()
        class_dist = {c: y_true.count(c) for c in unique_classes}

        return EvaluationReport(
            accuracy=round(acc, 4),
            precision_macro=round(float(precision_mac), 4),
            recall_macro=round(float(recall_mac), 4),
            f1_macro=round(float(f1_mac), 4),
            precision_per_class={c: round(float(p), 4) for c, p in zip(unique_classes, prec_per)},
            recall_per_class={c: round(float(r), 4) for c, r in zip(unique_classes, rec_per)},
            f1_per_class={c: round(float(f), 4) for c, f in zip(unique_classes, f1_per)},
            confusion_matrix=cm,
            class_distribution=class_dist,
            total_samples=len(y_true),
        )

    def save_artifact(
        self,
        output_path: Union[str, Path],
        metadata: Optional[Dict[str, Any]] = None,
        dataset_approved: bool = False,
    ) -> Path:
        """Save serialized model artifact using joblib.

        Strict Safety Gate:
        Refuses to save production model artifacts unless dataset_approved=True.

        Args:
            output_path: Path to target .joblib file.
            metadata: Model metadata dictionary.
            dataset_approved: Safety flag confirming dataset has formal mentor approval.

        Returns:
            Path of saved artifact.

        Raises:
            PermissionError: If dataset is not formally approved.
        """
        if not dataset_approved:
            raise PermissionError(
                "Model artifact serialization is blocked: Training on unapproved datasets is strictly forbidden. "
                "Dataset approval gate (P01) must pass before saving production models."
            )

        path = Path(output_path)
        path.parent.mkdir(parents=True, exist_ok=True)

        payload = {
            "model": self,
            "language": self.language,
            "classes": self.classes_,
            "metadata": metadata or {},
        }
        joblib.dump(payload, path, compress=3)
        return path

    @classmethod
    def load_artifact(cls, input_path: Union[str, Path]) -> "ClassicalCredibilityClassifier":
        """Load a serialized model artifact."""
        path = Path(input_path)
        if not path.is_file():
            raise FileNotFoundError(f"Artifact not found: {path}")

        payload = joblib.load(path)
        return payload["model"]

