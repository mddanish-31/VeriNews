"""Unit tests for dataset quality auditing, duplicate detection, and JSON reports."""

import json
from pathlib import Path

from ml.labels import LabelMapping
from ml.quality import DatasetAuditor
from ml.readers import SafeDatasetReader
from ml.schemas import CanonicalLabel, DatasetSchema
from ml.validation import RecordValidator

FIXTURES_DIR = Path(__file__).parent / "fixtures"


def test_quality_audit_on_valid_dataset():
    """Verify auditing a clean dataset produces accurate counts and statistics."""
    mapping = LabelMapping(
        raw_to_canonical={
            "1": CanonicalLabel.CREDIBLE,
            "0": CanonicalLabel.UNRELIABLE,
        },
        source_description="Test binary mapping",
        documentation_reference="Ref-Quality-001",
    )
    schema = DatasetSchema(min_text_length=50)
    reader = SafeDatasetReader(schema=schema)
    records, _ = reader.read_csv(FIXTURES_DIR / "synthetic_valid_en_hi.csv")

    validator = RecordValidator(schema=schema, label_mapping=mapping)
    validator.validate_batch(records)

    auditor = DatasetAuditor()
    report = auditor.audit(records, dataset_name="Synthetic Valid Dataset", source_path="fixtures")

    assert report.total_records == 6
    assert report.valid_records == 6
    assert report.invalid_records == 0
    assert report.exact_duplicate_count == 0
    assert report.duplicate_detection_method == "exact_sha256_text_hash"
    assert report.semantic_duplicate_detection == "not_implemented_or_claimed"

    # Label distribution: 4 credible (label 1), 2 unreliable (label 0)
    assert report.label_distribution.get("credible") == 4
    assert report.label_distribution.get("unreliable") == 2

    # Language distribution: 3 en, 3 hi
    assert report.language_distribution.get("en") == 3
    assert report.language_distribution.get("hi") == 3

    # Text length stats exist
    assert "mean" in report.text_length_stats
    assert report.text_length_stats["min"] > 50


def test_exact_duplicate_detection():
    """Verify that exact duplicate records are accurately counted using text hash."""
    schema = DatasetSchema(min_text_length=50)
    reader = SafeDatasetReader(schema=schema)
    records, _ = reader.read_csv(FIXTURES_DIR / "synthetic_duplicates.csv")

    auditor = DatasetAuditor()
    report = auditor.audit(records, dataset_name="Duplicates Test")

    # In synthetic_duplicates.csv: 4 records, 3 identical texts (1 original + 2 duplicates)
    assert report.total_records == 4
    assert report.exact_duplicate_count == 2
    assert report.duplicate_detection_method == "exact_sha256_text_hash"


def test_audit_report_json_serialization_and_privacy(tmp_path):
    """Verify JSON report generation, structure, and absence of raw article text."""
    schema = DatasetSchema(min_text_length=50)
    reader = SafeDatasetReader(schema=schema)
    records, _ = reader.read_csv(FIXTURES_DIR / "synthetic_invalid_cases.csv")

    validator = RecordValidator(schema=schema)
    validator.validate_batch(records)

    auditor = DatasetAuditor()
    report = auditor.audit(records, dataset_name="Invalid Test Dataset")

    report_file = tmp_path / "quality_audit_report.json"
    written_path = auditor.write_json_report(report, report_file)
    assert written_path.is_file()

    # Read back and verify JSON integrity
    with open(report_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert data["dataset_name"] == "Invalid Test Dataset"
    assert data["total_records"] == 6
    assert data["invalid_records"] > 0
    assert "missing_values_by_column" in data
    assert "label_distribution" in data
    assert "language_distribution" in data

    # Strict Privacy Check: Full article bodies must NEVER appear in the audit report
    report_json_str = json.dumps(data)
    assert "Le gouvernement a annoncé de nouvelles mesures budgétaires" not in report_json_str
    assert "The regional transportation authority scheduled railway maintenance" not in report_json_str

