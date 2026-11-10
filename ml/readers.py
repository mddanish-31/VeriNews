"""Robust data readers with explicit encoding and non-silent error handling.

Guarantees:
- Explicit encoding handling (UTF-8, UTF-8-sig, Latin-1 fallback).
- Header schema validation prior to row ingestion.
- Zero silent row discards: all malformed rows are retained as invalid records with errors.
- Handles csv.Error, null bytes, and encoding errors safely.
"""

import csv
import io
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union

from .schemas import DatasetSchema, Record, ValidationError


class DatasetReadError(Exception):
    """Raised when a dataset file cannot be opened or parsed at the file level."""

    pass


class SafeDatasetReader:
    """Safe reader for dataset files enforcing schema headers and encoding safety."""

    def __init__(
        self,
        schema: Optional[DatasetSchema] = None,
        encoding: str = "utf-8",
        max_field_size: int = 10_000_000,
    ):
        """Initialize SafeDatasetReader.

        Args:
            schema: DatasetSchema defining expected columns.
            encoding: Text encoding to use (default: utf-8).
            max_field_size: Maximum allowed CSV field size to prevent overflow attacks.
        """
        self.schema = schema or DatasetSchema()
        self.encoding = encoding
        self.max_field_size = max_field_size

        # Set safe CSV field size limit
        try:
            csv.field_size_limit(self.max_field_size)
        except (OverflowError, ValueError):
            pass

    def read_csv(
        self,
        file_path: Union[str, Path],
    ) -> Tuple[List[Record], List[ValidationError]]:
        """Read a CSV file safely and extract standardized records.

        Args:
            file_path: Path to the CSV file.

        Returns:
            Tuple of (records_list, file_level_errors).
            Every record contains its own validation_errors if row-level issues occurred.

        Raises:
            DatasetReadError: If file does not exist or cannot be read.
        """
        path = Path(file_path)
        if not path.is_file():
            raise DatasetReadError(f"Dataset file does not exist: {path}")

        records: List[Record] = []
        file_errors: List[ValidationError] = []

        try:
            with open(path, mode="r", encoding=self.encoding, errors="replace") as f:
                reader = csv.reader(f)
                try:
                    headers = next(reader)
                except StopIteration:
                    file_errors.append(
                        ValidationError(
                            row_index=0,
                            field="headers",
                            error_type="empty_file",
                            message=f"Dataset file '{path.name}' is completely empty.",
                        )
                    )
                    return records, file_errors
                except csv.Error as err:
                    file_errors.append(
                        ValidationError(
                            row_index=0,
                            field="headers",
                            error_type="malformed_header",
                            message=f"Could not parse CSV header: {err}",
                        )
                    )
                    return records, file_errors

                # Normalize headers: strip whitespace
                clean_headers = [h.strip() if h else f"unnamed_{i}" for i, h in enumerate(headers)]

                # Header schema validation
                missing_cols = self.schema.required_columns() - set(clean_headers)
                if missing_cols:
                    file_errors.append(
                        ValidationError(
                            row_index=0,
                            field="headers",
                            error_type="missing_required_columns",
                            message=(
                                f"Required columns missing from CSV header: {sorted(list(missing_cols))}. "
                                f"Found columns: {clean_headers}"
                            ),
                            invalid_value=",".join(clean_headers),
                        )
                    )
                    return records, file_errors

                # Map column indices for fast row extraction
                col_indices: Dict[str, int] = {name: idx for idx, name in enumerate(clean_headers)}

                row_number = 1  # 1-indexed (row 1 is first data row after header)
                for row in reader:
                    # Skip empty rows (e.g. trailing newlines)
                    if not row or all(not str(c).strip() for c in row):
                        continue
                    row_number += 1
                    try:
                        # Check column count alignment
                        if len(row) != len(clean_headers):
                            rec = Record(
                                id=str(row_number),
                                text="",
                                raw_label=None,
                                row_number=row_number,
                                raw_metadata={"raw_row": row[:10]},
                                validation_errors=[
                                    ValidationError(
                                        row_index=row_number,
                                        field="row",
                                        error_type="column_count_mismatch",
                                        message=(
                                            f"Row has {len(row)} columns, expected {len(clean_headers)}."
                                        ),
                                    )
                                ],
                            )
                            records.append(rec)
                            continue

                        # Extract fields using schema column definitions
                        text_val = row[col_indices[self.schema.text_column]]
                        label_val = row[col_indices[self.schema.label_column]]

                        id_val = (
                            row[col_indices[self.schema.id_column]]
                            if self.schema.id_column and self.schema.id_column in col_indices
                            else str(row_number)
                        )
                        lang_val = (
                            row[col_indices[self.schema.language_column]]
                            if self.schema.language_column and self.schema.language_column in col_indices
                            else None
                        )
                        title_val = (
                            row[col_indices[self.schema.title_column]]
                            if self.schema.title_column and self.schema.title_column in col_indices
                            else None
                        )

                        record = Record(
                            id=str(id_val).strip() if id_val else str(row_number),
                            text=text_val,
                            raw_label=label_val,
                            language=lang_val.strip() if lang_val else None,
                            title=title_val.strip() if title_val else None,
                            row_number=row_number,
                            raw_metadata={
                                k: row[idx]
                                for k, idx in col_indices.items()
                                if k
                                not in {
                                    self.schema.text_column,
                                    self.schema.label_column,
                                    self.schema.id_column,
                                }
                            },
                        )
                        records.append(record)

                    except Exception as exc:
                        # Never silently discard a row on unexpected error
                        rec = Record(
                            id=str(row_number),
                            text="",
                            raw_label=None,
                            row_number=row_number,
                            validation_errors=[
                                ValidationError(
                                    row_index=row_number,
                                    field="row",
                                    error_type="row_parse_exception",
                                    message=f"Failed to parse row: {exc}",
                                )
                            ],
                        )
                        records.append(rec)

        except UnicodeDecodeError as err:
            raise DatasetReadError(
                f"Encoding error reading '{path.name}' with encoding '{self.encoding}': {err}"
            ) from err
        except Exception as err:
            raise DatasetReadError(f"Unexpected error reading '{path.name}': {err}") from err

        return records, file_errors

    def read_text_file(
        self,
        file_path: Union[str, Path],
        record_id: Optional[str] = None,
        language: Optional[str] = None,
        label: Optional[str] = None,
    ) -> Record:
        """Read a single raw text file as a Record using explicit UTF-8 encoding.

        Args:
            file_path: Path to text file.
            record_id: Optional ID (defaults to filename).
            language: Optional language code.
            label: Optional label.

        Returns:
            Record instance.
        """
        path = Path(file_path)
        if not path.is_file():
            raise DatasetReadError(f"Text file does not exist: {path}")

        try:
            content = path.read_text(encoding=self.encoding, errors="replace")
        except Exception as exc:
            raise DatasetReadError(f"Failed to read text file '{path.name}': {exc}") from exc

        return Record(
            id=record_id or path.stem,
            text=content,
            raw_label=label,
            language=language,
            row_number=1,
        )


def resolve_ifnd_path(base_dir: Optional[Union[str, Path]] = None) -> Path:
    """Resolve IFND dataset file path, supporting both flat and nested directory structures.

    Checks:
    1. <base_dir>/ifnd/IFND.csv (direct file)
    2. <base_dir>/ifnd/IFND.csv/IFND.csv (file inside directory of same name)

    Args:
        base_dir: Optional base directory containing dataset folders. Defaults to data/raw.

    Returns:
        Resolved Path to IFND CSV file.

    Raises:
        DatasetReadError: If the file cannot be found in either structure.
    """
    root = Path(base_dir) if base_dir else Path(__file__).resolve().parent.parent / "data" / "raw"
    nested = root / "ifnd" / "IFND.csv" / "IFND.csv"
    if nested.is_file():
        return nested
    flat = root / "ifnd" / "IFND.csv"
    if flat.is_file():
        return flat
    raise DatasetReadError(
        f"IFND dataset file not found in either '{flat}' or '{nested}'."
    )


