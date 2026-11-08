# Indic Zenodo Hindi Dataset — Extracted Archive Inspection

**Audit date:** 2026-11-06  
**Scope:** Read-only audit of the manually extracted files. No raw files were moved, renamed, deleted, edited, preprocessed or used for model training. No dataset approval is given by this report.

## Summary

The extracted folders are nested under `data/raw/indic_zenodo/Hindi_F&R_News/`, rather than directly under `data/raw/indic_zenodo/`. The two label folders contain 10,293 and 10,300 `.txt` files respectively. The sibling `__MACOSX/` tree contains 20,595 metadata files and is excluded from article counts.

All 20,593 label-folder files are nonempty and decode as UTF-8. Exact byte-level duplicates are substantial within both folders: 2,448 duplicate groups / 2,792 excess files in `Hindi_fake_news`, and 342 groups / 2,701 excess files in `Hindi_real_news`. No exact-content group spans both label folders. These are audit findings only; no duplicates were removed.

**Dataset status: NOT APPROVED for training.** Folder names are not proof of label validity. Label semantics, annotation/collection methodology, per-item truth verification and third-party content reuse rights remain **UNVERIFIED** pending reliable documentation and mentor review.

## 1. Observed facts

### Folder structure and counts

| Path | Observation |
|---|---:|
| `data/raw/indic_zenodo/Hindi_F&R_News/Hindi_fake_news/` | 10,293 files |
| `data/raw/indic_zenodo/Hindi_F&R_News/Hindi_real_news/` | 10,300 files |
| `data/raw/indic_zenodo/Hindi_F&R_News/__MACOSX/` | 20,595 files, excluded as macOS metadata |
| Label-folder text files counted (not all independently verified as articles) | 20,593 |

All label-folder files have `.txt` extensions. The audit traverses nested files in each label folder and does not count the sibling `__MACOSX` files as articles.

### Encoding, emptiness and text lengths

Lengths below are decoded Unicode character counts, including whitespace and line breaks. Percentiles use the nearest-rank-style index implemented in the script (`round((n-1)*p)`).

| Folder | Total bytes | Zero-byte | Whitespace-only UTF-8 | UTF-8 decode errors | Min chars | Median | P90 | P95 | Max chars |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `Hindi_fake_news` | 94,334,049 | 0 | 0 | 0 | 16 | 3,312 | 5,924 | 7,295 | 53,209 |
| `Hindi_real_news` | 98,812,152 | 0 | 0 | 0 | 46 | 2,483 | 7,741 | 9,367 | 25,562 |

Extension distribution is `.txt` only in both folders (10,293 fake-folder files; 10,300 real-folder files). No encoding normalization or content transformation was performed.

### Exact duplicate audit

Exactness is defined as equality of raw file bytes, grouped by SHA-256. “Excess files” means the sum of `group size - 1` within a label. For cross-label groups it means `group size - number of represented label folders`; no cross-label duplicates were found.

| Scope | Duplicate groups | Excess duplicate files |
|---|---:|---:|
| Within `Hindi_fake_news` | 2,448 | 2,792 |
| Within `Hindi_real_news` | 342 | 2,701 |
| Across fake and real folders | 0 | 0 |

The exact group membership can be regenerated with `python scripts/audit_indic_zenodo_hindi.py --list-duplicates`. By default, the script prints group totals and up to five examples per scope to avoid excessive console output. No files were deduplicated or altered.

### Representative sample inspection

The script inspected three deterministic samples per folder (first, middle and last paths after case-insensitive path sorting). It printed no article text. All six samples:

- decoded as UTF-8;
- had two nonempty lines;
- had a first line no longer than 180 characters (a **headline-candidate heuristic**, not proof of a headline);
- had no URL or date matching the script's simple patterns.

Five of six sample files exceeded 500 characters. A source/byline cue regex matched two fake-folder samples and none of the real-folder samples. These are weak text-pattern indicators only. No separate structured fields were apparent in this small sample; source names, dates and URLs may occur elsewhere in the collection or in formats not caught by these heuristics.

The two-line structure and short first lines are consistent with (but do not establish) a title followed by article text. Some files are very short (minimum 16/46 characters), and the real-folder sample included a 291-character file, so completeness and article-vs-snippet status require broader manual review.

## 2. Inferences

- The very high within-folder exact-duplicate counts may reflect repeated article content or duplicated entries. Filename suffixes and exact hashes do not explain why copies exist or whether they represent distinct source records.
- The lack of exact duplicates across folders is not evidence that the two folders are semantically distinct: near-duplicates, paraphrases, translations, shared claims and mislabeled items were not evaluated.
- `.txt` format, UTF-8 decodability and substantial median length make the files technically readable as text. They do not establish that each file is a complete news article or correctly labeled.
- A first-line headline and second-line body is plausible from the sample shape but is not established from field-level metadata or documentation.

## 3. Unverified claims

- **Label semantics:** `Hindi_fake_news` and `Hindi_real_news` folder names are observed names only. Their truthfulness meaning and correctness are **UNVERIFIED**.
- **Annotation methodology:** annotators, evidence standards, adjudication, fact-checker provenance, collection procedure and per-item label assignment are **UNVERIFIED** from this local inspection.
- **Language/script:** UTF-8 validity does not prove Hindi language or Devanagari script for every item; corpus-wide language/script classification was not performed.
- **Metadata:** headlines, source/publisher, authors, dates, URLs and other metadata are not consistently verified as distinct fields. Sample regex checks are heuristic and limited to six files.
- **Rights:** the Zenodo record [10.5281/zenodo.11408513](https://zenodo.org/records/11408513) declares CC BY 4.0 in record metadata. That deposit-level declaration was not independently established as clearing rights for every third-party article or source. Rights to reproduce, redistribute or publish article text remain **UNVERIFIED** and need human review.
- **Original ZIP integrity/hash:** the ZIP was not present in the inspected project structure and was not sought or audited for this task. No ZIP hash or archive-integrity result is claimed.

## 4. Remaining risks and questions

1. Obtain and review dataset-owner documentation for label definitions, source collection, annotation/adjudication and language composition.
2. Determine whether the deposited CC BY 4.0 declaration covers these underlying texts and the intended use; resolve third-party rights before any redistribution or public excerpts.
3. Review duplicate-group membership and investigate why exact copies occur. Follow-up should remain read-only unless separately approved; this audit did not remove or consolidate anything.
4. Measure near-duplicates and cross-label semantic overlap, and verify whether the apparent title/body structure holds beyond the six-file sample.
5. Assess per-file language/script, article completeness, source/date/URL coverage and short-text cases before considering task fit.
6. Check source and topic concentration and plan a leakage-aware evaluation only after mentor approval and rights/label gates are satisfied.

## 5. Reproducibility and verification

Audit script: [`scripts/audit_indic_zenodo_hindi.py`](../../scripts/audit_indic_zenodo_hindi.py)  
Run from the repository root:

```powershell
python scripts/audit_indic_zenodo_hindi.py
```

The script uses only the Python standard library, reads files without writing to the dataset, recognizes the observed nested `Hindi_F&R_News/` extraction layout (or direct label folders), excludes the sibling `__MACOSX/` tree from article counts, hashes raw contents for exact duplicates, and emits only text-free sample indicators. Use `--list-duplicates` to print all exact duplicate member paths.

**Executed command:** `python3 scripts/audit_indic_zenodo_hindi.py` using the existing interpreter at `<local Python interpreter>` (Python 3.14.6). Exit code: **0**. The first attempt with the Windows `python` alias failed because it invoked the Microsoft Store alias; no installation was performed. One run with the original verbose duplicate listing exceeded the 120-second command window; the script was adjusted to summarize duplicate groups by default and the completed run exited successfully. Its console output was redirected to a temporary file outside the repository/raw data.

Raw-data preservation was maintained: this audit only opened and read extracted files. It created no audit output under `data/raw/indic_zenodo/`, did not alter raw files, and did not train or preprocess data.

## Decision

This is a structural and content-pattern audit, **not a dataset approval**. Keep label semantics, annotation quality and third-party reuse rights **UNVERIFIED**. Stop for mentor review before any next-stage dataset selection, preprocessing or modeling.
