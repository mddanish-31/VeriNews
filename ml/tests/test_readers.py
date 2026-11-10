"""Unit tests for safe dataset reading and error handling."""

from pathlib import Path
import pytest

from ml.readers import DatasetReadError, SafeDatasetReader
from ml.schemas import DatasetSchema

FIXTURES_DIR = Path(__file__).parent / "fixtures"


def test_read_valid_synthetic_csv():
    """Verify reading a well-formed CSV file with English and Hindi records."""
    csv_path = FIXTURES_DIR / "synthetic_valid_en_hi.csv"
    assert csv_path.is_file(), f"Fixture missing: {csv_path}"

    schema = DatasetSchema(
        text_column="text",
        label_column="label",
        id_column="id",
        language_column="language",
        title_column="title",
    )
    reader = SafeDatasetReader(schema=schema, encoding="utf-8")
    records, file_errors = reader.read_csv(csv_path)

    assert len(file_errors) == 0
    assert len(records) == 6

    # Verify English record extraction
    en_rec = records[0]
    assert en_rec.id == "synth-en-001"
    assert en_rec.language == "en"
    assert "city development authority" in en_rec.text
    assert en_rec.raw_label == "1"

    # Verify Hindi record extraction and Unicode preservation
    hi_rec = records[3]
    assert hi_rec.id == "synth-hi-001"
    assert hi_rec.language == "hi"
    assert "नगर विकास परिषद" in hi_rec.text
    assert hi_rec.raw_label == "1"


def test_read_csv_no_silent_row_discards():
    """Verify that malformed or invalid rows are captured as records rather than silently dropped."""
    csv_path = FIXTURES_DIR / "synthetic_invalid_cases.csv"
    schema = DatasetSchema(
        text_column="text",
        label_column="label",
        id_column="id",
        language_column="language",
        title_column="title",
    )
    reader = SafeDatasetReader(schema=schema)
    records, file_errors = reader.read_csv(csv_path)

    assert len(file_errors) == 0
    # All 6 invalid rows must be parsed and retained for quality auditing
    assert len(records) == 6
    assert records[0].id == "inv-001"
    assert records[0].text == ""
    assert records[2].language == "fr"


def test_missing_required_columns_in_header(tmp_path):
    """Verify that a CSV missing required columns reports a schema-level header error."""
    bad_csv = tmp_path / "bad_headers.csv"
    bad_csv.write_text("random_col1,random_col2\nval1,val2\n", encoding="utf-8")

    schema = DatasetSchema(text_column="text", label_column="label")
    reader = SafeDatasetReader(schema=schema)
    records, file_errors = reader.read_csv(bad_csv)

    assert len(records) == 0
    assert len(file_errors) == 1
    assert file_errors[0].error_type == "missing_required_columns"


def test_empty_csv_file(tmp_path):
    """Verify that an empty file produces a clear error without crashing."""
    empty_file = tmp_path / "empty.csv"
    empty_file.write_text("", encoding="utf-8")

    reader = SafeDatasetReader()
    records, file_errors = reader.read_csv(empty_file)

    assert len(records) == 0
    assert len(file_errors) == 1
    assert file_errors[0].error_type == "empty_file"


def test_nonexistent_file_raises_error():
    """Verify that opening a missing file raises DatasetReadError."""
    reader = SafeDatasetReader()
    with pytest.raises(DatasetReadError, match="does not exist"):
        reader.read_csv("nonexistent_path_to_file.csv")


def test_read_text_file(tmp_path):
    """Verify reading a standalone UTF-8 text file."""
    txt_file = tmp_path / "sample_news.txt"
    hindi_content = "यह एक परीक्षण समाचार लेख है जो देवनागरी लिपि में लिखा गया है।"
    txt_file.write_text(hindi_content, encoding="utf-8")

    reader = SafeDatasetReader(encoding="utf-8")
    record = reader.read_text_file(txt_file, record_id="txt-001", language="hi", label="1")

    assert record.id == "txt-001"
    assert record.language == "hi"
    assert record.text == hindi_content

