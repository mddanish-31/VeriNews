"""Unit tests for classical ML pipeline, stratified splitting, and evaluation."""

from pathlib import Path
import pytest

from ml.labels import LabelMapping
from ml.pipeline import (
    ClassicalCredibilityClassifier,
    EvaluationReport,
    prepare_and_split_records,
)
from ml.readers import SafeDatasetReader
from ml.schemas import CanonicalLabel, DatasetSchema, Record
from ml.validation import RecordValidator

FIXTURES_DIR = Path(__file__).parent / "fixtures"


@pytest.fixture
def synthetic_records_en():
    """Programmatically generated synthetic English news records for reproducible pipeline tests."""
    records = []
    credible_samples = [
        "The municipal transportation authority announced service improvements along major bus routes.",
        "Regional weather service issues moderate rain advisory for northern agricultural districts.",
        "City council approved the annual infrastructure budget following public consultation hearings.",
        "Public health department releases seasonal vaccination schedule for community clinics.",
        "Local university opens registration for renewable energy symposium and academic workshops.",
        "State highway patrol reports decreased traffic collisions following new signal installations.",
        "Department of water resources confirms reservoir levels remain within normal seasonal parameters.",
        "District education board announces schedule for high school science and technology fair.",
    ]
    unreliable_samples = [
        "Secret whistleblower reveals miracle herbs cure all illnesses in twelve hours flat.",
        "Shocking government conspiracy exposed: mysterious rays secretly control city water supply.",
        "Ancient aliens built underground energy towers beneath capital city claims anonymous insider.",
        "Terrified scientists admit secret device turns plain river water into solid pure gold.",
        "Miracle mineral liquid reverses aging instantly and big pharma tries to ban it today.",
        "Leaked documents prove secret global cabal replaces all daylight with synthetic illumination.",
        "Bizarre ancient ritual discovered in forest guarantees eternal wealth overnight to believers.",
        "Hidden laboratory creates telepathic radio waves that read citizens thoughts in their sleep.",
    ]

    for i, text in enumerate(credible_samples):
        records.append(
            Record(
                id=f"synth-en-cred-{i}",
                text=text,
                raw_label="1",
                canonical_label=CanonicalLabel.CREDIBLE,
                language="en",
                row_number=i + 1,
            )
        )

    for i, text in enumerate(unreliable_samples):
        records.append(
            Record(
                id=f"synth-en-unrel-{i}",
                text=text,
                raw_label="0",
                canonical_label=CanonicalLabel.UNRELIABLE,
                language="en",
                row_number=len(credible_samples) + i + 1,
            )
        )

    return records


@pytest.fixture
def synthetic_records_hi():
    """Programmatically generated synthetic Hindi news records for pipeline tests."""
    records = []
    credible_samples = [
        "नगर विकास परिषद ने आज आधिकारिक रूप से एक नए आधुनिक सार्वजनिक पुस्तकालय को मंजूरी दी।",
        "मौसम विज्ञान केंद्र ने राज्य के उत्तरी जिलों में आगामी तीन दिनों तक हल्की वर्षा की संभावना जताई।",
        "राज्य सरकार ने किसानों के लिए नई सिंचाई सहायता योजना के तहत अनुदान जारी किया।",
        "स्वास्थ्य विभाग ने प्राथमिक स्वास्थ्य केंद्रों पर निःशुल्क टीकाकरण शिविर लगाने की घोषणा की।",
        "शिक्षा निदेशालय ने आगामी सत्र के लिए माध्यमिक विद्यालयों के समय में बदलाव किया है।",
        "ऊर्जा निगम ने ग्रामीण क्षेत्रों में बिजली आपूर्ति सुदृढ़ करने के लिए नए ट्रांसफार्मर लगाए।",
    ]
    unreliable_samples = [
        "गुप्त प्रयोगशाला से मिली चौंकाने वाली जानकारी के अनुसार पानी से शुद्ध सोना बनाने का दावा।",
        "चमत्कारी जड़ी-बूटी से हर बीमारी का एक रात में इलाज होने का झूठा दावा वायरल हो रहा है।",
        "सोशल मीडिया पर अंतरिक्ष से रहस्यमयी किरणें आने की मनगढ़ंत कहानी फैलाई जा रही है।",
        "गुप्त खजाने का नक्शा मिलने का सनसनीखेज दावा सोशल मीडिया पर तेजी से शेयर किया जा रहा है।",
        "जादुई ताबीज से रातों-रात अमीर बनने की अफवाह फैलाकर लोगों से ठगी की कोशिश की गई।",
        "वैज्ञानिकों के नाम से फैलाई जा रही झूठी खबर कि कल से सूर्य का प्रकाश नहीं दिखेगा।",
    ]

    for i, text in enumerate(credible_samples):
        records.append(
            Record(
                id=f"synth-hi-cred-{i}",
                text=text,
                raw_label="1",
                canonical_label=CanonicalLabel.CREDIBLE,
                language="hi",
                row_number=i + 1,
            )
        )

    for i, text in enumerate(unreliable_samples):
        records.append(
            Record(
                id=f"synth-hi-unrel-{i}",
                text=text,
                raw_label="0",
                canonical_label=CanonicalLabel.UNRELIABLE,
                language="hi",
                row_number=len(credible_samples) + i + 1,
            )
        )

    return records


def test_prepare_and_split_stratification_and_leakage(synthetic_records_en):
    """Verify that train/val/test splitting is stratified, reproducible, and prevents duplicate leakage."""
    # Add an exact duplicate to verify deduplication
    duplicate_record = Record(
        id="duplicate-01",
        text=synthetic_records_en[0].text,  # Exact duplicate text
        raw_label="1",
        canonical_label=CanonicalLabel.CREDIBLE,
        language="en",
    )
    records_with_dup = synthetic_records_en + [duplicate_record]

    split = prepare_and_split_records(
        records_with_dup,
        val_size=0.2,
        test_size=0.2,
        random_state=42,
        deduplicate=True,
    )

    # Duplicate must have been removed from unique samples
    assert split.split_stats["duplicates_removed_for_leakage_prevention"] == 1
    assert split.split_stats["unique_samples"] == len(synthetic_records_en)

    # Disjoint splits: no exact overlap between train, val, and test texts
    train_set = set(split.X_train)
    val_set = set(split.X_val)
    test_set = set(split.X_test)
    assert len(train_set & test_set) == 0
    assert len(train_set & val_set) == 0
    assert len(val_set & test_set) == 0

    # Binary classes present in all splits
    assert set(split.y_train) == {"credible", "unreliable"}
    assert set(split.y_val) == {"credible", "unreliable"}
    assert set(split.y_test) == {"credible", "unreliable"}


def test_classical_classifier_english_pipeline(synthetic_records_en):
    """Verify end-to-end training and evaluation of classical ML pipeline on English synthetic data."""
    split = prepare_and_split_records(
        synthetic_records_en,
        val_size=0.25,
        test_size=0.25,
        random_state=42,
    )

    model = ClassicalCredibilityClassifier(
        language="en",
        max_features=500,
        ngram_range=(1, 2),
        min_df=1,
        random_state=42,
    )

    model.fit(split.X_train, split.y_train)
    assert model.is_fitted is True

    # Predictions
    preds = model.predict(split.X_test)
    assert len(preds) == len(split.X_test)
    assert all(p in {"credible", "unreliable"} for p in preds)

    # Probabilities
    probs = model.predict_proba(split.X_test)
    assert probs.shape == (len(split.X_test), 2)
    assert probs.sum(axis=1) == pytest.approx(1.0)

    # Evaluation
    report = model.evaluate(split.X_test, split.y_test)
    assert isinstance(report, EvaluationReport)
    assert 0.0 <= report.accuracy <= 1.0
    assert 0.0 <= report.f1_macro <= 1.0
    assert "credible" in report.f1_per_class
    assert "unreliable" in report.f1_per_class
    assert len(report.confusion_matrix) == 2


def test_classical_classifier_hindi_pipeline(synthetic_records_hi):
    """Verify training and evaluation of classical ML pipeline on Hindi synthetic Devanagari data."""
    split = prepare_and_split_records(
        synthetic_records_hi,
        val_size=0.25,
        test_size=0.25,
        random_state=42,
    )

    model = ClassicalCredibilityClassifier(
        language="hi",
        max_features=500,
        min_df=1,
        random_state=42,
    )

    model.fit(split.X_train, split.y_train)
    assert model.is_fitted is True

    # Evaluation
    report = model.evaluate(split.X_test, split.y_test)
    assert report.total_samples == len(split.X_test)
    assert "credible" in report.class_distribution
    assert "unreliable" in report.class_distribution


def test_artifact_saving_security_gate(synthetic_records_en, tmp_path):
    """Verify that saving model artifacts is blocked unless dataset_approved=True."""
    split = prepare_and_split_records(synthetic_records_en, val_size=0.25, test_size=0.25)
    model = ClassicalCredibilityClassifier(language="en", min_df=1)
    model.fit(split.X_train, split.y_train)

    target_file = tmp_path / "model.joblib"

    # Must raise PermissionError when dataset_approved=False
    with pytest.raises(PermissionError, match="Model artifact serialization is blocked"):
        model.save_artifact(target_file, dataset_approved=False)

    # When dataset_approved=True, saving and loading succeed
    saved_path = model.save_artifact(
        target_file, metadata={"source": "synthetic_test"}, dataset_approved=True
    )
    assert saved_path.is_file()

    loaded_model = ClassicalCredibilityClassifier.load_artifact(saved_path)
    assert loaded_model.language == "en"
    assert loaded_model.is_fitted is True
    test_preds = loaded_model.predict(["A sample municipal test announcement."])
    assert len(test_preds) == 1

