"""Unit tests for record validation, configurable length boundaries, and script handling."""

import pytest

from ml.labels import LabelMapping
from ml.schemas import CanonicalLabel, DatasetSchema, Record
from ml.validation import RecordValidator, is_missing_value


@pytest.fixture
def standard_mapping():
    return LabelMapping(
        raw_to_canonical={
            1: CanonicalLabel.CREDIBLE,
            0: CanonicalLabel.UNRELIABLE,
        },
        source_description="Test standard binary mapping",
        documentation_reference="Doc-Ref-Standard-001",
    )


@pytest.fixture
def validator(standard_mapping):
    schema = DatasetSchema(
        min_text_length=50,
        max_text_length=1000,
        supported_languages={"en", "hi", "hi-latn"},
        strict_script_matching=False,
    )
    return RecordValidator(schema=schema, label_mapping=standard_mapping)


def test_valid_english_record(validator):
    """Verify that a valid English news record passes validation without errors."""
    record = Record(
        id="en-01",
        text=(
            "The regional environmental department announced that new air quality monitoring "
            "stations will be installed across major transit corridors starting this autumn."
        ),
        raw_label=1,
        language="en",
        title="Air Quality Stations Announced",
        row_number=2,
    )
    errors = validator.validate_record(record)
    assert len(errors) == 0
    assert record.is_valid is True
    assert record.canonical_label == CanonicalLabel.CREDIBLE


def test_valid_hindi_record(validator):
    """Verify that a valid Hindi Unicode record passes validation and preserves Devanagari."""
    record = Record(
        id="hi-01",
        text=(
            "राज्य सरकार ने किसानों के लिए नई सिंचाई सहायता योजना की घोषणा की है। "
            "इस पहल के अंतर्गत आधुनिक सौर ऊर्जा चालित पंप रियायती दरों पर उपलब्ध कराए जाएंगे।"
        ),
        raw_label=0,
        language="hi",
        title="सिंचाई सहायता योजना",
        row_number=3,
    )
    errors = validator.validate_record(record)
    assert len(errors) == 0
    assert record.is_valid is True
    assert record.canonical_label == CanonicalLabel.UNRELIABLE


def test_long_form_news_record_decoupled_from_api_limits(standard_mapping):
    """Verify that long-form investigative news (e.g. 15,000+ chars) passes dataset validation."""
    # Construct an investigative news piece of 15,000+ characters (exceeding API 5,000 character limit)
    paragraph = (
        "In a comprehensive twelve-month investigative report examining regional municipal "
        "infrastructure spending, public records reveal extensive capital allocations for "
        "sustainable transport networks, flood resilience drainage, and smart grid utilities. "
    )
    long_article = paragraph * 70  # ~15,400 characters

    # Dataset schema without arbitrary 5,000 char upper limit
    dataset_schema = DatasetSchema(
        min_text_length=100,
        max_text_length=None,  # No upper limit for investigative datasets
    )
    validator_long = RecordValidator(schema=dataset_schema, label_mapping=standard_mapping)

    record = Record(
        id="long-01",
        text=long_article,
        raw_label=1,
        language="en",
        row_number=1,
    )
    errors = validator_long.validate_record(record)
    assert len(errors) == 0
    assert record.is_valid is True
    assert len(record.text) > 15000


def test_configurable_text_length_bounds(standard_mapping):
    """Verify that min and max text length boundaries are fully configurable per schema."""
    # Schema with very low min length (e.g. for news headlines: 15 chars)
    headline_schema = DatasetSchema(min_text_length=15, max_text_length=200)
    val_headline = RecordValidator(schema=headline_schema, label_mapping=standard_mapping)

    short_headline_record = Record(
        id="head-01",
        text="City Council Votes on New Park.",  # 31 chars
        raw_label=1,
        language="en",
    )
    assert len(val_headline.validate_record(short_headline_record)) == 0
    assert short_headline_record.is_valid is True

    # Schema with min_text_length=None (any non-empty text passes)
    unbounded_min_schema = DatasetSchema(min_text_length=None, max_text_length=500)
    val_unbounded_min = RecordValidator(schema=unbounded_min_schema, label_mapping=standard_mapping)
    very_short_record = Record(
        id="short-01",
        text="Brief alert.",  # 12 chars
        raw_label=1,
        language="en",
    )
    assert len(val_unbounded_min.validate_record(very_short_record)) == 0
    assert very_short_record.is_valid is True


def test_empty_and_whitespace_text_always_rejected(validator):
    """Verify that empty, None, and whitespace-only text is always rejected regardless of bounds."""
    empty_record = Record(
        id="err-01",
        text="",
        raw_label=1,
        language="en",
        row_number=4,
    )
    errors = validator.validate_record(empty_record)
    assert any(e.error_type == "missing_text" for e in errors)
    assert empty_record.is_valid is False

    whitespace_record = Record(
        id="err-02",
        text="     \n\t   ",
        raw_label=1,
        language="en",
        row_number=5,
    )
    errors_ws = validator.validate_record(whitespace_record)
    assert any(e.error_type == "missing_text" for e in errors_ws)
    assert whitespace_record.is_valid is False


def test_text_too_short_and_too_long_errors(validator):
    """Verify that configured limits emit text_too_short and text_too_long errors."""
    # Configured validator has min=50, max=1000
    short_record = Record(
        id="err-03",
        text="Too short.",  # 10 chars < 50
        raw_label=1,
        language="en",
        row_number=6,
    )
    errors = validator.validate_record(short_record)
    assert any(e.error_type == "text_too_short" for e in errors)
    assert short_record.is_valid is False

    long_record = Record(
        id="err-04",
        text="News paragraph content repeat. " * 50,  # ~1500 chars > 1000
        raw_label=1,
        language="en",
        row_number=7,
    )
    errors_long = validator.validate_record(long_record)
    assert any(e.error_type == "text_too_long" for e in errors_long)
    assert long_record.is_valid is False


def test_romanized_hindi_warning_not_blocking_by_default(standard_mapping):
    """Verify that Romanized Hindi with language='hi' is not rejected, producing a warning."""
    schema = DatasetSchema(strict_script_matching=False)
    val = RecordValidator(schema=schema, label_mapping=standard_mapping)

    romanized_record = Record(
        id="hinglish-01",
        text=(
            "Kisanon ke liye nayi yojana ka ailan kiya gaya hai jisme unhe modern pump "
            "subsidy dar par uplabdh karaye jayenge sarkari adesh ke anusar."
        ),
        raw_label=1,
        language="hi",
        row_number=8,
    )
    issues = val.validate_record(romanized_record)

    # Must contain script_mismatch warning, but record MUST remain valid!
    assert any(issue.error_type == "script_mismatch" and issue.is_warning for issue in issues)
    assert romanized_record.is_valid is True
    assert len(romanized_record.errors) == 0
    assert len(romanized_record.warnings) == 1


def test_romanized_hindi_rejected_only_when_strict_script_matching_enabled(standard_mapping):
    """Verify that Romanized Hindi is rejected only when strict_script_matching=True."""
    strict_schema = DatasetSchema(strict_script_matching=True)
    val_strict = RecordValidator(schema=strict_schema, label_mapping=standard_mapping)

    romanized_record = Record(
        id="hinglish-02",
        text=(
            "Yeh khabar Roman lipi me likhi gayi hai aur isme koi Devanagari akshar nahi hai "
            "par language hi likha hai."
        ),
        raw_label=1,
        language="hi",
        row_number=9,
    )
    issues = val_strict.validate_record(romanized_record)

    assert any(issue.error_type == "script_mismatch" and not issue.is_warning for issue in issues)
    assert romanized_record.is_valid is False


def test_mixed_script_text_valid_without_warnings(validator):
    """Verify that mixed-script text (Devanagari + English names/acronyms) is completely valid."""
    mixed_record = Record(
        id="mixed-01",
        text=(
            "भारतीय अंतरिक्ष अनुसंधान संगठन (ISRO) ने आज श्रीहरिकोटा से नए मौसम उपग्रह "
            "INSAT-3DS का सफल प्रक्षेपण किया। इस मिशन में NASA के विशेषज्ञों ने भी भाग लिया।"
        ),
        raw_label=1,
        language="hi",
        row_number=10,
    )
    issues = validator.validate_record(mixed_record)

    assert len(issues) == 0
    assert mixed_record.is_valid is True
    assert len(mixed_record.warnings) == 0


def test_no_automatic_inference_of_romanized_hindi_without_metadata(standard_mapping):
    """Verify that pure Latin text without language metadata is not automatically inferred as Hindi."""
    schema = DatasetSchema(allow_missing_language=True)
    val = RecordValidator(schema=schema, label_mapping=standard_mapping)

    latin_text_no_meta = Record(
        id="no-meta-01",
        text=(
            "Yeh ek aam samachar hai jo bina kisi bhasha metadata ke prastut kiya gaya hai "
            "par isme kewal Latin akshar hain."
        ),
        raw_label=1,
        language=None,  # No metadata
        row_number=11,
    )
    issues = val.validate_record(latin_text_no_meta)

    # Must NOT automatically infer or claim language is 'hi'
    assert latin_text_no_meta.language is None
    assert latin_text_no_meta.is_valid is True
    assert len(issues) == 0


def test_unsupported_language_detected(validator):
    """Verify that languages other than supported languages are rejected."""
    french_record = Record(
        id="err-05",
        text=(
            "Le ministère de l'environnement a publié un rapport préliminaire sur les "
            "mesures de transition énergétique pour les cinq prochaines années."
        ),
        raw_label=1,
        language="fr",
        row_number=12,
    )
    errors = validator.validate_record(french_record)
    assert any(e.error_type == "unsupported_language" for e in errors)
    assert french_record.is_valid is False


def test_missing_and_invalid_labels(validator):
    """Verify that missing or unmapped label values are captured with clear errors."""
    missing_label_rec = Record(
        id="err-07",
        text=(
            "The municipal transportation authority announced service improvements "
            "along several major bus routes starting from next Monday."
        ),
        raw_label=None,
        language="en",
        row_number=13,
    )
    errors_missing = validator.validate_record(missing_label_rec)
    assert any(e.error_type == "missing_label" for e in errors_missing)
    assert missing_label_rec.is_valid is False

    invalid_label_rec = Record(
        id="err-08",
        text=(
            "The municipal transportation authority announced service improvements "
            "along several major bus routes starting from next Monday."
        ),
        raw_label="unknown_category",
        language="en",
        row_number=14,
    )
    errors_invalid = validator.validate_record(invalid_label_rec)
    assert any(e.error_type == "unmapped_label" for e in errors_invalid)
    assert invalid_label_rec.is_valid is False


def test_is_missing_value_helper():
    """Verify detection of various missing value representations."""
    assert is_missing_value(None) is True
    assert is_missing_value("") is True
    assert is_missing_value("   ") is True
    assert is_missing_value("NaN") is True
    assert is_missing_value("null") is True
    assert is_missing_value("None") is True
    assert is_missing_value("N/A") is True
    assert is_missing_value("valid text") is False
    assert is_missing_value(0) is False
    assert is_missing_value(1) is False
