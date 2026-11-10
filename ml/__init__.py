"""VeriNews ML Data Foundations & Classical Pipeline Package.

Provides robust, decoupled data loading, schema validation, explicit label mapping,
data quality auditing, and CPU-friendly classical ML pipelines.
"""

from .labels import LabelMapping, LabelMappingError
from .pipeline import (
    ClassicalCredibilityClassifier,
    DataSplit,
    EvaluationReport,
    prepare_and_split_records,
)
from .quality import DatasetAuditor
from .readers import DatasetReadError, SafeDatasetReader
from .schemas import (
    CanonicalLabel,
    DatasetSchema,
    QualityReport,
    Record,
    ValidationError,
)
from .validation import (
    RecordValidator,
    is_devanagari_char,
    is_latin_char,
    is_missing_value,
)

__all__ = [
    "CanonicalLabel",
    "Record",
    "ValidationError",
    "DatasetSchema",
    "QualityReport",
    "LabelMapping",
    "LabelMappingError",
    "SafeDatasetReader",
    "DatasetReadError",
    "RecordValidator",
    "DatasetAuditor",
    "ClassicalCredibilityClassifier",
    "DataSplit",
    "EvaluationReport",
    "prepare_and_split_records",
    "is_missing_value",
    "is_devanagari_char",
    "is_latin_char",
]
