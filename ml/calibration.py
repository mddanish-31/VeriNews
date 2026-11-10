"""Probability calibration framework for VeriNews classical models.

Guarantees:
- Calibration split is derived STRICTLY from training data (never from the test set).
- Evaluates Brier score, log loss, calibration curves, and Expected Calibration Error (ECE).
- Supports Platt scaling (sigmoid) and Isotonic regression via CalibratedClassifierCV.
- Compares uncalibrated and calibrated probabilities.
- Model artifacts are saved separately to models/calibrated/ preserving baselines.
"""

from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

import joblib
import numpy as np
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.metrics import accuracy_score, brier_score_loss, log_loss, precision_recall_fscore_support
from sklearn.model_selection import train_test_split


@dataclass
class CalibrationMetrics:
    """Metrics assessing the probability calibration quality of a model."""

    brier_score: float
    log_loss_value: float
    expected_calibration_error: float
    accuracy: float
    macro_f1: float
    calibration_curve_prob_true: List[float]
    calibration_curve_prob_pred: List[float]

    def to_dict(self) -> Dict[str, Any]:
        """Convert metrics to serializable dictionary."""
        return asdict(self)


def compute_expected_calibration_error(
    y_true_binary: np.ndarray,
    y_prob: np.ndarray,
    n_bins: int = 10,
) -> float:
    """Compute Expected Calibration Error (ECE) across uniform confidence bins.

    ECE = sum_{b=1}^B ( |B_b| / N ) * | acc(B_b) - conf(B_b) |

    Args:
        y_true_binary: Ground truth binary labels (0 or 1).
        y_prob: Predicted probability for positive class (1).
        n_bins: Number of confidence buckets.

    Returns:
        ECE float between 0.0 and 1.0.
    """
    bin_limits = np.linspace(0.0, 1.0, n_bins + 1)
    ece = 0.0
    n_samples = len(y_prob)

    for i in range(n_bins):
        bin_lower = bin_limits[i]
        bin_upper = bin_limits[i + 1]

        # Samples within this confidence bin
        if i == n_bins - 1:
            in_bin = (y_prob >= bin_lower) & (y_prob <= bin_upper)
        else:
            in_bin = (y_prob >= bin_lower) & (y_prob < bin_upper)

        bin_count = np.sum(in_bin)
        if bin_count > 0:
            bin_acc = np.mean(y_true_binary[in_bin])
            bin_conf = np.mean(y_prob[in_bin])
            ece += (bin_count / n_samples) * abs(bin_acc - bin_conf)

    return float(ece)


def evaluate_calibration(
    model: Any,
    vectorizer: Any,
    X_test: List[str],
    y_test: List[str],
    positive_label: str = "credible",
    n_bins: int = 10,
) -> CalibrationMetrics:
    """Evaluate calibration quality on a held-out test set.

    Args:
        model: Fitted classifier (calibrated or uncalibrated).
        vectorizer: Fitted TF-IDF vectorizer.
        X_test: Raw text evaluation samples.
        y_test: Ground truth string labels.
        positive_label: Positive class label name (default: 'credible').
        n_bins: Number of bins for calibration curve.

    Returns:
        CalibrationMetrics instance.
    """
    X_test_vec = vectorizer.transform(X_test)
    y_true_binary = np.array([1 if y == positive_label else 0 for y in y_test])

    # Extract probability predictions
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(X_test_vec)
        # Find index for positive class
        if hasattr(model, "classes_"):
            pos_idx = list(model.classes_).index(positive_label)
        else:
            pos_idx = 1
        y_prob = probs[:, pos_idx]
    elif hasattr(model, "decision_function"):
        # For raw LinearSVC without calibration: normalize decision function to [0, 1] via min-max as proxy
        df = model.decision_function(X_test_vec)
        # Standard min-max normalization
        df_min, df_max = df.min(), df.max()
        if df_max > df_min:
            y_prob = (df - df_min) / (df_max - df_min)
        else:
            y_prob = np.full_like(df, 0.5)
    else:
        raise ValueError("Model has neither predict_proba nor decision_function.")

    # Clip probabilities to avoid log(0)
    eps = 1e-15
    y_prob_clipped = np.clip(y_prob, eps, 1.0 - eps)

    # Compute metrics
    brier = float(brier_score_loss(y_true_binary, y_prob))
    logloss = float(log_loss(y_true_binary, y_prob_clipped))
    ece = float(compute_expected_calibration_error(y_true_binary, y_prob, n_bins=n_bins))

    # Binary prediction
    preds = model.predict(X_test_vec)
    acc = float(accuracy_score(y_test, preds))
    _, _, f1, _ = precision_recall_fscore_support(y_test, preds, average="macro", zero_division=0)

    # Calibration curve
    try:
        prob_true, prob_pred = calibration_curve(y_true_binary, y_prob, n_bins=n_bins, strategy="uniform")
        curve_true = [round(float(v), 4) for v in prob_true]
        curve_pred = [round(float(v), 4) for v in prob_pred]
    except Exception:
        curve_true, curve_pred = [], []

    return CalibrationMetrics(
        brier_score=round(brier, 4),
        log_loss_value=round(logloss, 4),
        expected_calibration_error=round(ece, 4),
        accuracy=round(acc, 4),
        macro_f1=round(float(f1), 4),
        calibration_curve_prob_true=curve_true,
        calibration_curve_prob_pred=curve_pred,
    )


class ModelCalibrator:
    """Manages train-calibration partitioning and probability calibration fitting."""

    def __init__(
        self,
        calibration_fraction: float = 0.25,
        method: str = "sigmoid",
        random_state: int = 42,
    ):
        """Initialize ModelCalibrator.

        Args:
            calibration_fraction: Fraction of training data reserved for calibration (default: 25%).
            method: Calibration technique ('sigmoid' for Platt scaling, 'isotonic' for isotonic regression).
            random_state: Seed for reproducible stratified splitting.
        """
        self.calibration_fraction = calibration_fraction
        self.method = method
        self.random_state = random_state

    def calibrate(
        self,
        base_estimator: Any,
        vectorizer: Any,
        X_train: List[str],
        y_train: List[str],
    ) -> Tuple[Any, Any, Dict[str, Any]]:
        """Fit a calibrated classifier using a dedicated sub-train / calibration split.

        Guarantees:
        - The calibration set is drawn STRICTLY from X_train / y_train.
        - The vectorizer and base estimator are fitted on X_subtrain.
        - CalibratedClassifierCV(cv='prefit') is fitted on X_cal.
        - Zero leakage from validation or test sets.

        Args:
            base_estimator: Uncalibrated scikit-learn classifier (e.g. LinearSVC or LogisticRegression).
            vectorizer: Scikit-learn feature extractor (e.g. TfidfVectorizer).
            X_train: Full training text corpus.
            y_train: Full training label list.

        Returns:
            Tuple of (fitted_calibrated_model, fitted_vectorizer, split_statistics).
        """
        # Split train into sub-train (e.g. 75%) and calibration (25%)
        X_subtrain, X_cal, y_subtrain, y_cal = train_test_split(
            X_train,
            y_train,
            test_size=self.calibration_fraction,
            random_state=self.random_state,
            stratify=y_train,
        )

        split_info = {
            "total_train_samples": len(X_train),
            "subtrain_samples": len(X_subtrain),
            "calibration_samples": len(X_cal),
            "calibration_fraction": self.calibration_fraction,
            "calibration_method": self.method,
            "random_state": self.random_state,
        }

        # 1. Fit vectorizer on sub-train
        X_subtrain_vec = vectorizer.fit_transform(X_subtrain)

        # 2. Fit base estimator on sub-train
        base_estimator.fit(X_subtrain_vec, y_subtrain)

        # 3. Transform calibration set with fitted vectorizer
        X_cal_vec = vectorizer.transform(X_cal)

        # 4. Fit calibration wrapper on calibration set using FrozenEstimator (or prefit fallback)
        unique_classes = set(y_cal)
        min_class_samples = min(list(y_cal).count(c) for c in unique_classes)
        cv_folds = min(5, max(2, min_class_samples))

        try:
            from sklearn.frozen import FrozenEstimator
            frozen_base = FrozenEstimator(base_estimator)
            calibrated_model = CalibratedClassifierCV(
                estimator=frozen_base,
                method=self.method,
                cv=cv_folds,
            )
        except ImportError:
            calibrated_model = CalibratedClassifierCV(
                estimator=base_estimator,
                method=self.method,
                cv="prefit",
            )
        calibrated_model.fit(X_cal_vec, y_cal)

        return calibrated_model, vectorizer, split_info

