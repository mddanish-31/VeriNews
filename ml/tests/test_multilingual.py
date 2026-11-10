"""Unit tests for multilingual handling, Unicode preservation, and script checks."""

from ml.schemas import DatasetSchema, Record
from ml.validation import (
    RecordValidator,
    is_devanagari_char,
    is_latin_char,
)


def test_devanagari_character_detection():
    """Verify that Devanagari characters and diacritics are accurately identified."""
    devanagari_samples = ["अ", "क", "ि", "्", "ं", "ह", "ज्ञ"]
    for char in devanagari_samples:
        assert is_devanagari_char(char) is True, f"Failed for {char}"

    non_devanagari = ["a", "Z", "1", "@", "é", "й", "م"]
    for char in non_devanagari:
        assert is_devanagari_char(char) is False, f"False positive for {char}"


def test_latin_character_detection():
    """Verify Latin alphabet identification including extended Latin accents."""
    latin_samples = ["A", "z", "é", "ñ", "ü", "ç"]
    for char in latin_samples:
        assert is_latin_char(char) is True, f"Failed for {char}"

    non_latin = ["अ", "क", "1", "!", "й", "中"]
    for char in non_latin:
        assert is_latin_char(char) is False, f"False positive for {char}"


def test_devanagari_hindi_synthetic_record():
    """Verify that pure Devanagari Hindi synthetic news passes validation with 0 errors/warnings."""
    text = (
        "प्रधानमंत्री ने विज्ञान भवन में आयोजित राष्ट्रीय नवाचार सम्मेलन का उद्घाटन किया। "
        "उन्होंने युवाओं से तकनीकी विकास और अनुसंधान में योगदान देने का आह्वान किया।"
    )
    record = Record(
        id="hi-dev-01",
        text=text,
        raw_label="credible",
        language="hi",
        row_number=1,
    )

    validator = RecordValidator(
        schema=DatasetSchema(min_text_length=50, supported_languages={"en", "hi"})
    )
    issues = validator.validate_record(record)

    assert len(issues) == 0
    assert record.is_valid is True
    assert record.text == text
    assert len(record.text) == len(text)


def test_romanized_hindi_synthetic_record():
    """Verify that Romanized Hindi (Hinglish) with language='hi' is kept valid with a warning."""
    text = (
        "Bharat sarkar ne naye digital portal ki shuruat ki hai jisse aam nagrik "
        "apne dastavez asani se prapt kar sakte hain bina kisi pareshani ke."
    )
    record = Record(
        id="hi-latn-01",
        text=text,
        raw_label="credible",
        language="hi",
        row_number=2,
    )

    validator = RecordValidator(
        schema=DatasetSchema(min_text_length=50, strict_script_matching=False)
    )
    issues = validator.validate_record(record)

    # Must be valid; script mismatch must be a warning, not a rejection
    assert record.is_valid is True
    assert len(record.errors) == 0
    assert len(record.warnings) == 1
    assert record.warnings[0].error_type == "script_mismatch"
    assert record.warnings[0].is_warning is True


def test_english_synthetic_record():
    """Verify standard English Latin script record passes cleanly."""
    text = (
        "The Ministry of Energy published its quarterly transition update today, "
        "highlighting significant increases in offshore wind capacity and battery storage."
    )
    record = Record(
        id="en-std-01",
        text=text,
        raw_label="credible",
        language="en",
        row_number=3,
    )

    validator = RecordValidator(schema=DatasetSchema(min_text_length=50))
    issues = validator.validate_record(record)

    assert len(issues) == 0
    assert record.is_valid is True
    assert len(record.warnings) == 0


def test_mixed_script_synthetic_record():
    """Verify mixed-script news (Devanagari with Latin acronyms/English terms) passes cleanly."""
    text = (
        "केंद्रीय मंत्री ने नई AI नीति और Semiconductor मिशन पर एक उच्च स्तरीय बैठक की अध्यक्षता की। "
        "उन्होंने कहा कि 5G और Cloud Computing के क्षेत्र में भारत वैश्विक स्तर पर अग्रणी बनेगा।"
    )
    record = Record(
        id="mixed-01",
        text=text,
        raw_label="credible",
        language="hi",
        row_number=4,
    )

    validator = RecordValidator(schema=DatasetSchema(min_text_length=50))
    issues = validator.validate_record(record)

    assert len(issues) == 0
    assert record.is_valid is True
    assert len(record.warnings) == 0


def test_unsupported_non_devanagari_non_latin_script():
    """Verify that records with unsupported languages and scripts are rejected."""
    cyrillic_record = Record(
        id="ru-01",
        text=(
            "Министерство транспорта объявило о завершении ремонтных работ "
            "на главном железнодорожном узле столицы к концу следующей недели."
        ),
        raw_label="credible",
        language="ru",
        row_number=5,
    )

    validator = RecordValidator()
    issues = validator.validate_record(cyrillic_record)

    assert any(e.error_type == "unsupported_language" and not e.is_warning for e in issues)
    assert cyrillic_record.is_valid is False
