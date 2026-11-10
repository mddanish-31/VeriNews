"""Record validation and data hygiene rules for ML pipelines.

Enforces:
- Required field existence and non-nullness.
- Supported language codes ('en', 'hi', 'hi-latn') without silent fallback.
- Binary label validity via explicit LabelMapping.
- Decoupled, configurable dataset text length boundaries.
- Multilingual Unicode script inspection with configurable warnings for Romanized Hindi.
- Separation of language metadata validation from script inspection.
"""

from typing import Any, List, Optional, Set, Tuple

from .labels import LabelMapping, LabelMappingError
from .schemas import CanonicalLabel, DatasetSchema, Record, ValidationError

# Missing value representations commonly encountered in raw data files
MISSING_STRING_VALUES: Set[str] = {
    "",
    "nan",
    "null",
    "none",
    "n/a",
    "na",
    "undefined",
    "nil",
}


def is_missing_value(val: Any) -> bool:
    """Check if a value is effectively missing, null, empty, or a NaN sentinel."""
    if val is None:
        return True
    if isinstance(val, str):
        return val.strip().lower() in MISSING_STRING_VALUES
    return False


def is_devanagari_char(char: str) -> bool:
    """Check if a character or grapheme cluster falls within the Unicode Devanagari block (U+0900 to U+097F)."""
    if not char:
        return False
    return all(0x0900 <= ord(c) <= 0x097F for c in char)


def is_latin_char(char: str) -> bool:
    """Check if character(s) fall within the Latin alphabet or Latin extended ranges."""
    if not char:
        return False
    return all(
        (0x0041 <= ord(c) <= 0x005A)
        or (0x0061 <= ord(c) <= 0x007A)
        or (0x00C0 <= ord(c) <= 0x024F)
        for c in char
    )


class RecordValidator:
    """Validates dataset records against schemas and configured label mappings."""

    def __init__(
        self,
        schema: Optional[DatasetSchema] = None,
        label_mapping: Optional[LabelMapping] = None,
    ):
        """Initialize RecordValidator.

        Args:
            schema: DatasetSchema defining thresholds and required columns.
            label_mapping: Configured LabelMapping for binary label resolution.
        """
        self.schema = schema or DatasetSchema()
        self.label_mapping = label_mapping

    def validate_record(self, record: Record) -> List[ValidationError]:
        """Validate a single record and attach any detected validation errors/warnings.

        Args:
            record: Record instance to validate.

        Returns:
            List of detected ValidationError instances (empty if valid and without warnings).
        """
        issues: List[ValidationError] = []

        # 1. Validate ID if mandatory
        if not self.schema.allow_missing_id:
            if is_missing_value(record.id):
                issues.append(
                    ValidationError(
                        row_index=record.row_number,
                        field="id",
                        error_type="missing_id",
                        message="Record identifier is required but missing or empty.",
                        invalid_value=str(record.id),
                        is_warning=False,
                    )
                )

        # 2. Validate Text field (presence, non-emptiness, configurable length)
        text_issues = self._validate_text(record.text, record.row_number)
        issues.extend(text_issues)

        # 3. Validate Language code and script inspection
        lang_issues = self._validate_language(record.language, record.text, record.row_number)
        issues.extend(lang_issues)

        # 4. Validate Label
        canonical_label, label_issues = self._validate_label(record.raw_label, record.row_number)
        issues.extend(label_issues)
        if canonical_label is not None:
            record.canonical_label = canonical_label

        record.validation_errors = issues
        return issues

    def validate_batch(self, records: List[Record]) -> List[Record]:
        """Validate a batch of records in place and return them."""
        for rec in records:
            self.validate_record(rec)
        return records

    def _validate_text(self, text: Any, row_index: int) -> List[ValidationError]:
        """Validate text field presence, non-emptiness, and configurable length bounds.

        Dataset text length limits are decoupled from live API limits (100–5,000 chars).
        Configurable via schema.min_text_length and schema.max_text_length.
        """
        issues: List[ValidationError] = []

        if is_missing_value(text):
            issues.append(
                ValidationError(
                    row_index=row_index,
                    field="text",
                    error_type="missing_text",
                    message="Article text is required but was missing, empty, or whitespace-only.",
                    invalid_value=str(text) if text is not None else None,
                    is_warning=False,
                )
            )
            return issues

        clean_text = str(text).strip()
        length = len(clean_text)

        # Configurable minimum length check
        if self.schema.min_text_length is not None and length < self.schema.min_text_length:
            issues.append(
                ValidationError(
                    row_index=row_index,
                    field="text",
                    error_type="text_too_short",
                    message=(
                        f"Article text length ({length} chars) is below configured minimum "
                        f"threshold ({self.schema.min_text_length} chars)."
                    ),
                    invalid_value=clean_text[:50],
                    is_warning=False,
                )
            )

        # Configurable maximum length check (supports arbitrarily long news articles when None)
        if self.schema.max_text_length is not None and length > self.schema.max_text_length:
            issues.append(
                ValidationError(
                    row_index=row_index,
                    field="text",
                    error_type="text_too_long",
                    message=(
                        f"Article text length ({length} chars) exceeds configured maximum "
                        f"threshold ({self.schema.max_text_length} chars)."
                    ),
                    invalid_value=clean_text[:50],
                    is_warning=False,
                )
            )

        return issues

    def _validate_language(
        self,
        language: Optional[str],
        text: Optional[str],
        row_index: int,
    ) -> List[ValidationError]:
        """Validate language metadata separately from Unicode script inspection.

        Rules:
        - Language metadata validation verifies the declared code is in supported_languages.
        - Unicode script inspection detects script discrepancies (e.g. Hindi in Latin script).
        - Script mismatch is treated as a non-blocking WARNING by default unless
          strict_script_matching is explicitly enabled.
        - Never automatically infer Romanized Hindi as Hindi without reliable language metadata.
        """
        issues: List[ValidationError] = []

        # 1. Language metadata validation
        if is_missing_value(language):
            if not self.schema.allow_missing_language:
                issues.append(
                    ValidationError(
                        row_index=row_index,
                        field="language",
                        error_type="missing_language",
                        message="Language metadata is required for this dataset but was missing or empty.",
                        invalid_value=str(language),
                        is_warning=False,
                    )
                )
            return issues

        normalized_lang = str(language).strip().lower()
        if normalized_lang not in self.schema.supported_languages:
            issues.append(
                ValidationError(
                    row_index=row_index,
                    field="language",
                    error_type="unsupported_language",
                    message=(
                        f"Language '{normalized_lang}' is not supported. "
                        f"Allowed codes: {sorted(list(self.schema.supported_languages))}."
                    ),
                    invalid_value=str(language),
                    is_warning=False,
                )
            )
            return issues

        # 2. Unicode script inspection (separate from metadata validation)
        if text and not is_missing_value(text):
            clean_text = str(text).strip()
            devanagari_count = sum(1 for c in clean_text if is_devanagari_char(c))
            latin_count = sum(1 for c in clean_text if is_latin_char(c))

            # Case: Hindi metadata ('hi' or 'hi-latn')
            if normalized_lang in ("hi", "hi-latn"):
                if devanagari_count == 0:
                    # Text has no Devanagari characters (e.g. Romanized Hindi / Hinglish)
                    msg = (
                        "Record language metadata is declared as Hindi ('hi'), but the text "
                        "contains zero Devanagari script characters (written in Latin/Romanized script)."
                    )
                    is_warn = not self.schema.strict_script_matching
                    issues.append(
                        ValidationError(
                            row_index=row_index,
                            field="language",
                            error_type="script_mismatch",
                            message=msg,
                            invalid_value=str(language),
                            is_warning=is_warn,
                        )
                    )
                # Note: Mixed-script text (Devanagari + Latin acronyms/names) is common and valid

            # Case: English metadata ('en')
            elif normalized_lang == "en":
                if latin_count == 0 and devanagari_count > 0:
                    # Text marked English but contains only Devanagari
                    msg = (
                        "Record language metadata is declared as English ('en'), but the text "
                        "contains zero Latin characters and is written in Devanagari script."
                    )
                    is_warn = not self.schema.strict_script_matching
                    issues.append(
                        ValidationError(
                            row_index=row_index,
                            field="language",
                            error_type="script_mismatch",
                            message=msg,
                            invalid_value=str(language),
                            is_warning=is_warn,
                        )
                    )

        return issues

    def _validate_label(
        self,
        raw_label: Any,
        row_index: int,
    ) -> Tuple[Optional[CanonicalLabel], List[ValidationError]]:
        """Validate that raw_label can be mapped to a CanonicalLabel."""
        issues: List[ValidationError] = []

        if is_missing_value(raw_label):
            issues.append(
                ValidationError(
                    row_index=row_index,
                    field="label",
                    error_type="missing_label",
                    message="Classification label is required but was missing or null.",
                    invalid_value=str(raw_label) if raw_label is not None else None,
                    is_warning=False,
                )
            )
            return None, issues

        if self.label_mapping is None:
            # If no mapping is configured, raw label must already be a CanonicalLabel
            if isinstance(raw_label, CanonicalLabel):
                return raw_label, []
            norm = str(raw_label).strip().lower()
            try:
                return CanonicalLabel(norm), []
            except ValueError:
                issues.append(
                    ValidationError(
                        row_index=row_index,
                        field="label",
                        error_type="unmapped_label_no_mapping",
                        message=(
                            f"Label '{raw_label}' is not a valid CanonicalLabel and no "
                            "LabelMapping was provided."
                        ),
                        invalid_value=str(raw_label),
                        is_warning=False,
                    )
                )
                return None, issues

        try:
            canonical = self.label_mapping.map_label(raw_label)
            return canonical, []
        except LabelMappingError as err:
            issues.append(
                ValidationError(
                    row_index=row_index,
                    field="label",
                    error_type="unmapped_label",
                    message=str(err),
                    invalid_value=str(raw_label),
                    is_warning=False,
                )
            )
            return None, issues
