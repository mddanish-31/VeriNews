"""Data quality audit utilities and structured JSON reporting.

Key Capabilities:
- Missing-value accounting across all schema columns.
- Exact duplicate detection using SHA-256 content hashing.
  (Explicit distinction: exact duplicate detection only; semantic duplicate
  detection is NOT claimed or implemented).
- Label distribution breakdown.
- Language distribution breakdown.
- Text length statistics (min, max, mean, median).
- Generation of structured JSON audit reports.
- Privacy preservation: Audit reports contain zero raw article text.
"""

from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import statistics
from typing import Dict, List, Optional, Union

from .schemas import CanonicalLabel, QualityReport, Record
from .validation import is_missing_value


class DatasetAuditor:
    """Audits dataset quality, duplicate distribution, and validation metrics."""

    def __init__(self, sample_error_limit: int = 10):
        """Initialize DatasetAuditor.

        Args:
            sample_error_limit: Maximum number of sanitized error samples to include in report.
        """
        self.sample_error_limit = sample_error_limit

    def audit(
        self,
        records: List[Record],
        dataset_name: str,
        source_path: str = "in_memory",
    ) -> QualityReport:
        """Perform a comprehensive quality audit on a list of Records.

        Args:
            records: List of validated Record instances.
            dataset_name: Semantic name or identifier for the dataset.
            source_path: File path or origin identifier.

        Returns:
            QualityReport dataclass with aggregate quality metrics.
        """
        now_utc = datetime.now(timezone.utc).isoformat()
        total_records = len(records)

        if total_records == 0:
            return QualityReport(
                dataset_name=dataset_name,
                source_path=source_path,
                generated_at=now_utc,
                total_records=0,
                valid_records=0,
                invalid_records=0,
                missing_values_by_column={},
                exact_duplicate_count=0,
                duplicate_detection_method="exact_sha256_text_hash",
                semantic_duplicate_detection="not_implemented_or_claimed",
            )

        valid_records = 0
        invalid_records = 0
        missing_counts: Dict[str, int] = {
            "text": 0,
            "label": 0,
            "language": 0,
            "id": 0,
            "title": 0,
        }

        # Exact duplicate detection via SHA-256 hash of stripped text
        seen_hashes: Dict[str, int] = {}
        exact_duplicate_count = 0

        label_counter: Counter[str] = Counter()
        language_counter: Counter[str] = Counter()
        error_counter: Counter[str] = Counter()
        warning_counter: Counter[str] = Counter()
        sample_errors: List[Dict[str, any]] = []
        text_lengths: List[int] = []

        for record in records:
            if record.is_valid:
                valid_records += 1
            else:
                invalid_records += 1

            # Missing value accounting
            if is_missing_value(record.text):
                missing_counts["text"] += 1
            else:
                clean_text = record.text.strip()
                text_lengths.append(len(clean_text))

                # Exact duplicate detection
                text_hash = hashlib.sha256(clean_text.encode("utf-8")).hexdigest()
                count = seen_hashes.get(text_hash, 0)
                if count > 0:
                    exact_duplicate_count += 1
                seen_hashes[text_hash] = count + 1

            if is_missing_value(record.raw_label):
                missing_counts["label"] += 1

            if is_missing_value(record.language):
                missing_counts["language"] += 1
                language_counter["missing"] += 1
            else:
                language_counter[record.language.lower()] += 1

            if is_missing_value(record.id):
                missing_counts["id"] += 1

            if is_missing_value(record.title):
                missing_counts["title"] += 1

            # Label distribution
            if record.canonical_label is not None:
                label_counter[record.canonical_label.value] += 1
            else:
                label_counter["unmapped_or_invalid"] += 1

            # Error and warning collection
            for err in record.validation_errors:
                if err.is_warning:
                    warning_counter[err.error_type] += 1
                else:
                    error_counter[err.error_type] += 1
                    if len(sample_errors) < self.sample_error_limit:
                        sample_errors.append(err.to_dict())

        # Text length metrics
        length_stats: Dict[str, float] = {}
        if text_lengths:
            length_stats = {
                "min": float(min(text_lengths)),
                "max": float(max(text_lengths)),
                "mean": round(float(statistics.mean(text_lengths)), 2),
                "median": round(float(statistics.median(text_lengths)), 2),
            }

        return QualityReport(
            dataset_name=dataset_name,
            source_path=source_path,
            generated_at=now_utc,
            total_records=total_records,
            valid_records=valid_records,
            invalid_records=invalid_records,
            missing_values_by_column=missing_counts,
            exact_duplicate_count=exact_duplicate_count,
            duplicate_detection_method="exact_sha256_text_hash",
            semantic_duplicate_detection="not_implemented_or_claimed",
            label_distribution=dict(label_counter),
            language_distribution=dict(language_counter),
            text_length_stats=length_stats,
            error_summary=dict(error_counter),
            warning_summary=dict(warning_counter),
            sample_errors=sample_errors,
        )

    def write_json_report(
        self,
        report: QualityReport,
        output_path: Union[str, Path],
        indent: int = 2,
    ) -> Path:
        """Serialize a QualityReport to a JSON file.

        Args:
            report: QualityReport instance.
            output_path: Path to target JSON file.
            indent: Indentation spaces for formatting.

        Returns:
            Resolved Path of the written report.
        """
        path = Path(output_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        report_dict = report.to_dict()
        with open(path, mode="w", encoding="utf-8") as f:
            json.dump(report_dict, f, indent=indent, ensure_ascii=False)
        return path

