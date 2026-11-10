"""Schemas and data models for ML data foundations.

Defines canonical labels, dataset records, validation errors, schema definitions,
and data quality report structures.
"""

from dataclasses import asdict, dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional, Set


class CanonicalLabel(str, Enum):
    """Canonical binary classification labels for VeriNews credibility estimation.

    Labels represent linguistic and stylistic patterns, NOT empirical factuality:
    - CREDIBLE: Patterns characteristic of verifiable, standard news reporting.
    - UNRELIABLE: Patterns characteristic of unverified, sensationalist, or misleading content.
    """

    CREDIBLE = "credible"
    UNRELIABLE = "unreliable"


@dataclass(frozen=True)
class ValidationError:
    """Represents a specific validation error or warning encountered during dataset processing."""

    row_index: int
    field: str
    error_type: str
    message: str
    invalid_value: Optional[str] = None
    is_warning: bool = False

    def to_dict(self) -> Dict[str, Any]:
        """Convert validation error/warning to serializable dictionary."""
        return {
            "row_index": self.row_index,
            "field": self.field,
            "error_type": self.error_type,
            "message": self.message,
            "invalid_value": self.invalid_value[:100] if self.invalid_value else None,
            "is_warning": self.is_warning,
        }


@dataclass
class Record:
    """Represents a single standardized news record in the ML data pipeline."""

    id: str
    text: str
    raw_label: Any
    canonical_label: Optional[CanonicalLabel] = None
    language: Optional[str] = None
    title: Optional[str] = None
    row_number: int = 0
    raw_metadata: Dict[str, Any] = field(default_factory=dict)
    validation_errors: List[ValidationError] = field(default_factory=list)

    @property
    def is_valid(self) -> bool:
        """Record is valid if it has no blocking validation errors (warnings do not invalidate)."""
        return not any(not err.is_warning for err in self.validation_errors)

    @property
    def errors(self) -> List[ValidationError]:
        """List of blocking validation errors."""
        return [err for err in self.validation_errors if not err.is_warning]

    @property
    def warnings(self) -> List[ValidationError]:
        """List of non-blocking validation warnings."""
        return [err for err in self.validation_errors if err.is_warning]


@dataclass(frozen=True)
class DatasetSchema:
    """Configuration schema defining the structure and validation rules for a dataset.

    Dataset text length is decoupled from API/inference limits:
    - API limits (100–5,000 chars) apply to live online user submissions.
    - Dataset limits are configurable per dataset (e.g. min_text_length=None or 20,
      max_text_length=None or 100,000 for full investigative articles).
    """

    text_column: str = "text"
    label_column: str = "label"
    id_column: Optional[str] = "id"
    language_column: Optional[str] = "language"
    title_column: Optional[str] = "title"
    min_text_length: Optional[int] = 20
    max_text_length: Optional[int] = None
    supported_languages: Set[str] = field(default_factory=lambda: {"en", "hi", "hi-latn"})
    strict_script_matching: bool = False
    allow_missing_id: bool = True
    allow_missing_language: bool = True
    allow_missing_title: bool = True

    def required_columns(self) -> Set[str]:
        """Set of column names strictly required in dataset headers."""
        cols = {self.text_column, self.label_column}
        if self.id_column and not self.allow_missing_id:
            cols.add(self.id_column)
        if self.language_column and not self.allow_missing_language:
            cols.add(self.language_column)
        if self.title_column and not self.allow_missing_title:
            cols.add(self.title_column)
        return cols


@dataclass
class QualityReport:
    """Structured data quality audit report for a dataset."""

    dataset_name: str
    source_path: str
    generated_at: str
    total_records: int
    valid_records: int
    invalid_records: int
    missing_values_by_column: Dict[str, int]
    exact_duplicate_count: int
    duplicate_detection_method: str = "exact_sha256_text_hash"
    semantic_duplicate_detection: str = "not_implemented_or_claimed"
    label_distribution: Dict[str, int] = field(default_factory=dict)
    language_distribution: Dict[str, int] = field(default_factory=dict)
    text_length_stats: Dict[str, float] = field(default_factory=dict)
    error_summary: Dict[str, int] = field(default_factory=dict)
    warning_summary: Dict[str, int] = field(default_factory=dict)
    sample_errors: List[Dict[str, Any]] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        """Serialize quality report to dictionary."""
        return asdict(self)
