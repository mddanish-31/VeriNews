# WELFake Archive Inspection

> **Superseded parser findings:** The initial audit below used Python's default 131,072-character CSV field limit. A follow-up strict parse with an in-memory 50,000,000-character limit confirms 72,134 four-column records, no parse errors, and labels limited to `0` and `1`. The earlier 45 wrong-width rows, two parse errors, two non-binary labels, and all statistics derived from the recovered malformed parse are not valid source-data findings. See [WELFake Label and CSV Integrity Investigation](welfake-label-integrity-investigation.md) for corrected findings. The raw file remains unchanged.

**Inspection date:** 2026-11-06  
**Scope:** Read-only structural and descriptive audit; no model training or NLP preprocessing was performed.

## 1. Inspection summary

The manually supplied CSV is present and readable as UTF-8. A strict standard-library CSV reader identified 72,179 yielded data records, but 45 yielded records have a field count other than the four-column header and two strict CSV parse errors occurred. Exactly 72,134 yielded records have four fields. Therefore, 72,134 is the count of structurally four-column records in this inspection, not a claim that all source records are valid or usable.

The raw label distribution does not align with Zenodo's reported class counts under the documented mapping. This is a material unresolved label audit issue; the label values alone do not establish factual truth.

## 2. File integrity

| Property | Finding |
| --- | --- |
| Original path | `data/raw/welfake/WELFake_Dataset.csv` |
| File size | 245,086,152 bytes (245.086 MB decimal) |
| Encoding | UTF-8; strict decoding succeeded; no UTF-8 BOM detected |
| SHA-256 before inspection | `665331424230fc452e9482c3547a6a199a2c29745ade8d236950d1d105223773` |
| SHA-256 after inspection | `665331424230fc452e9482c3547a6a199a2c29745ade8d236950d1d105223773` |
| Integrity check | Hash and file size unchanged during inspection |

The file contains mixed physical line endings: 76,917 CRLF, 285,591 LF-only, and 48 CR-only terminators detected. The original was not normalized.

## 3. Dataset schema and counts

- **Header columns:** 4
- **Exact names:** `""`, `title`, `text`, `label`
- The first column has an empty header and behaves like an index/serial column; it is the unnamed column.
- **CSV records yielded:** 72,179, excluding the header, with 2 parser error events during strict parsing.
- **Four-field records:** 72,134.
- **Wrong-width yielded records:** 45.
- The parser detected comma delimiter, double-quote quoting, and doubled-quote escaping. Multiline fields were parsed: 13,816 yielded records spanned multiple physical lines.

### Observed value types

Types below are inferred from values across the 72,134 four-field records; article values are not reproduced.

| Column | Observed types |
| --- | --- |
| Unnamed first column (`""`) | 72,132 integer-like; 2 text-like anomalous values |
| `title` | 71,576 text-like; 558 empty |
| `text` | 71,351 text-like; 783 empty |
| `label` | 72,132 integer-like; 2 text-like anomalous values |

No data types were coerced or changed.

## 4. Label audit

Within the 72,134 four-field records:

| Raw label value | Count | Share of all four-field records |
| --- | ---: | ---: |
| `0` | 35,028 | 48.5596% |
| `1` | 37,104 | 51.4376% |
| Non-binary text-like values | 2 | 0.0028% |
| Blank labels | 0 | 0% |

Under the documented mapping (`0 = Fake`, `1 = Real`), the file therefore has 35,028 label-0 records and 37,104 label-1 records. This differs from Zenodo's reported 35,028 Real and 37,106 Fake. In particular, the archive's value counts appear reversed relative to those reported class totals if the documented mapping is applied. The two anomalous label values also need investigation. No interpretation of the labels as factual truth is made.

## 5. Missing values and text quality

Counts below are for the 72,134 four-field records. A field was counted blank when empty or whitespace-only.

| Column | Blank values | Whitespace-only values |
| --- | ---: | ---: |
| Unnamed first column | 0 | 0 |
| `title` | 558 | 0 |
| `text` | 783 | 744 |
| `label` | 0 | 0 |

No common literal missing markers (`NA`, `N/A`, `NaN`, `null`, `none`) were observed during the scan. Two labels are nevertheless non-binary text-like values, as noted above.

For nonblank article text, measured string length was 1–115,372 Unicode characters:

- Under 100 characters: 830 records.
- Over 5,000 characters: 12,848 records.
- Empty/whitespace-only article text: 783 records.
- Empty titles: 558 records.

These are descriptive thresholds, not a quality approval or a preprocessing recommendation. No text was normalized, tokenized, or otherwise processed.

## 6. Duplicate analysis

Among four-field records, exact duplicate occurrences after the first were counted with SHA-256 fingerprints of the complete field sequences:

- Exact duplicate rows: **0**
- Repeated nonblank titles (exact string match, occurrences after first): **9,229**
- Repeated nonblank article texts (exact string match, occurrences after first): **8,636**

These are exact-match counts only. Near-duplicates, copied passages, cross-source overlap, and event-level overlap were not assessed.

## 7. CSV parsing and suspicious structure

- Strict `csv.reader` parsing produced **2 CSV error events**, at physical line-end positions reported by the reader as 2,854 and 32,880.
- The reader yielded **45 records with a field count different from the four-column header**; field counts ranged from 1 to 24.
- **72,134** yielded records had exactly four fields.
- **13,816** yielded records spanned multiple physical lines, supporting the presence of correctly parsed multiline fields; malformed records remain a caveat.
- No NUL bytes or other control characters in parsed fields were detected.
- Unexpected field widths and non-binary label values are suspicious structural records. Their contents are intentionally not reproduced here.

The parser continued after its two errors, but the original logical-record boundaries for malformed regions cannot be established with certainty from this parse alone.

## 8. Comparison with official Zenodo metadata

Sources accessed 2026-11-06:

- [Zenodo record 4561253](https://zenodo.org/records/4561253) — official record description.
- [Record API](https://zenodo.org/api/records/4561253) — machine-readable metadata.
- [Files API](https://zenodo.org/api/records/4561253/files) — deposited filename and size metadata.

| Measure | Zenodo-reported | Archive inspection | Assessment |
| --- | ---: | ---: | --- |
| Articles/records | 72,134 accessible articles | 72,179 yielded records; 72,134 with four fields | Four-field count matches the reported count, but 45 yielded records have wrong width and two parse errors occurred. |
| CSV entries | 78,098 entries described | 72,179 yielded records in this strict parse | Difference remains unexplained; do not infer a cause. |
| Real/Fake totals | 35,028 Real; 37,106 Fake | 35,028 label `0`; 37,104 label `1`; 2 non-binary labels | Totals and apparent mapping conflict; author/metadata clarification is needed. |
| Label mapping | `0 = Fake`, `1 = Real` | Raw integers `0` and `1` present | Mapping is documented by Zenodo, but observed class totals do not corroborate the stated class-count pairing. |
| File | `WELFake_Dataset.csv`, 245,086,152 bytes in files API | Same filename/path and byte size | Match. |

Zenodo declares CC BY 4.0 in its record/API. This inspection does not establish upstream rights or independently resolve redistribution permissions.

## 9. Limitations and unresolved questions

- Why Zenodo describes 78,098 CSV entries while the strict parser yields 72,179 records is unresolved.
- Why the raw label counts conflict with Zenodo's stated mapping remains unresolved. Do not reverse labels; proceed only if primary evidence establishes the mapping. See the follow-up label-integrity and alternative-resolution reports.
- The two strict CSV errors and 45 wrong-width records may affect interpretation of the raw structure; no article contents are reproduced for diagnosis.
- The exact duplicate analysis does not detect near-duplicates, source overlap, or leakage.
- This audit does not assess factual correctness, source credibility, label quality, publication bias, or fitness for generalization.
- Zenodo's declared CC BY 4.0 does not by itself settle rights in aggregated upstream materials.

## 10. Recommendation for next research step

Keep the source CSV unchanged and retain its SHA-256 in the dataset manifest. Before any training or label remapping, request authoritative clarification of the class-count/mapping conflict and the 78,098-entry discrepancy. If proceeding after mentor approval, inspect the malformed records through a privacy-safe, non-destructive diagnostic and separately audit near-duplicates, source overlap, and upstream rights. This basic statistical audit is not dataset-quality approval and does not advance the project roadmap.
