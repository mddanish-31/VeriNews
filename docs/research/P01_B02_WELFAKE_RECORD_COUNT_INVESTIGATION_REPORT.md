# VeriNews P01 / B-02 Investigation Report
## WELFake Record-Count Discrepancy (H-02) and Empty-Text Handling Policy

**Execution Date:** 2026-11-10  
**Blocker ID:** B-02 — WELFake Record-Count Discrepancy (H-02)  
**Workflow:** Ponytail Workflow (Minimalist, evidence-driven, standard-library-first, CPU-friendly)  
**Target File:** `data/raw/welfake/WELFake_Dataset.csv` (Size: 245,086,152 bytes, SHA-256: `665331424230fc452e9482c3547a6a199a2c29745ade8d236950d1d105223773`)  
**Status:** **CLOSED — OWNER-ACCEPTED WITH DOCUMENTED RESIDUAL DISCREPANCY**

---

## 1. Executive Summary

This investigation was conducted under project owner authorization to investigate and resolve **Blocker B-02 (WELFake Record-Count Discrepancy / H-02)**, establish a safe, reversible handling policy for empty/whitespace-only text records, and determine whether B-02 closure criteria are satisfied.

### Key Audit Findings:
1. **Local CSV File Integrity**: The local dataset `data/raw/welfake/WELFake_Dataset.csv` is authentic and unaltered (`SHA-256: 665331424230fc452e9482c3547a6a199a2c29745ade8d236950d1d105223773`, 245,086,152 bytes).
2. **Logical Record Count**: With a raised field size limit (`50_000_000`), Python's standard-library CSV parser parses exactly **72,134 logical data records** with zero parser errors, zero wrong-width rows, and contiguous sequential indices from `0` to `72,133`.
3. **Alignment with Peer-Reviewed Paper**: The 72,134 logical record count matches the published article total in Table III of the authors' original IEEE TCSS 2021 publication (*Verma et al.*, 20,800 Kaggle + 6,335 McIntire + 44,898 ISOT + 101 BuzzFeed Political = 72,134) with 100% precision.
4. **Physical Line Count**: The raw CSV file contains **362,556 physical newline-delimited lines** (1 header + 72,134 records + 290,373 embedded newline characters across 13,818 multiline article bodies). This **conclusively refutes** the hypothesis that the Zenodo-reported figure of 78,098 was a physical-line count.
5. **Empty/Whitespace Text Records**: Exactly **783 records** have unusable text (39 empty strings + 744 whitespace-only strings). Exactly 558 records have empty titles, but 0 records have both empty title and empty text. Of the 783 unusable text records, **782 belong to Label 1 (Fake)** and only **1 belongs to Label 0 (Real)**.
6. **Reversible Exclusion Policy**: A deterministic, non-destructive exclusion policy is implemented in `docs/research/welfake_b02_empty_text_exclusion_manifest.json`. The raw CSV is left 100% untouched. Excluding these 783 rows leaves a training-ready pool of **71,351 records** (35,027 Real = 49.09%, 36,324 Fake = 50.91%), preserving class balance with negligible impact (+0.53% shift).
7. **Discrepancy Status & Owner Closure Decision**: While the local CSV is complete, intact, contiguous (0..72,133), and matches the published paper (72,134), the 5,964 difference between the Zenodo description statement ("78098 data entries") and the dataframe/paper count ("72134 entries") cannot be independently reconciled from available primary literature. Per project owner authorization under Outcome B, **B-02 is formally closed as CLOSED — OWNER-ACCEPTED WITH DOCUMENTED RESIDUAL DISCREPANCY**. This represents an administrative acceptance of the known limitation, NOT a claim of scientific reconciliation. WELFake remains ON HOLD for training because B-03 through B-07 remain unresolved.

---

## 2. Original Discrepancy

Historically, the VeriNews project tracked Blocker B-02 based on the following reported figures:

| Metric | Published / Reported Value | Source |
|---|---:|---|
| Zenodo Deposit "Data Entries" | 78,098 | Zenodo Record 4561253 metadata text |
| Zenodo Deposit "Data Frame" | 72,134 | Zenodo Record 4561253 metadata text |
| Original IEEE Paper Article Total | 72,134 | Verma et al. (IEEE TCSS 2021, Table III) |
| Locally Parsed Logical CSV Records | 72,134 | Local strict CSV parser audit |
| **Gross Discrepancy** | **5,964** | (78,098 - 72,134) |

The core evidence question for B-02 was:
> *What does the 78,098 figure count, why does it differ by 5,964 from the 72,134 dataframe/paper count, and does this discrepancy indicate missing, lost, or malformed data in the deposited CSV file?*

---

## 3. Exact Source Wording for the 78,098 Figure

The figure 78,098 originates exclusively from the official author-maintained Zenodo dataset deposit:

- **Repository Record:** [Zenodo Record 4561253](https://zenodo.org/records/4561253)
- **Title:** *WELFake dataset for fake news detection in text data*
- **Authors:** Pawan Kumar Verma, Prateek Agrawal, Radu Prodan
- **Publication Date:** February 25, 2021 (Version 0.1)
- **Exact Quotation:**
  > *"There are 78098 data entries and only 72134 entries are accessed as per the data frame."*

### Key Textual Observations:
1. The authors themselves explicitly distinguished between "78098 data entries" and "72134 entries ... as per the data frame".
2. The author note acknowledges that when loaded into a Python/pandas dataframe, the resulting object has 72,134 rows.
3. Nowhere in the published IEEE paper (*Verma et al., IEEE TCSS 2021*) does the number 78,098 or 5,964 appear. The paper only discusses 72,134 articles across the four constituent datasets.

---

## 4. Local CSV Audit Methodology

The local raw file was audited using a standalone Python standard library script:
`scratch/audit_welfake_record_count.py` (also tracked at `scripts/audit_welfake_record_count.py`).

### Environmental & Execution Parameters:
- **Parser:** Python `csv.reader` with `newline=""`, UTF-8 text mode (`errors="replace"`).
- **Field Size Limit:** `csv.field_size_limit(50_000_000)` (necessary because two records have text bodies of 134,206 and 142,961 characters, which exceed the default 131,072 character limit).
- **File Access:** Read-only streams (`rb` for hashes and byte-level line counts, `r` for logical records).
- **Zero Raw Mutations:** Zero writes, renames, or deletions applied to `data/raw/welfake/WELFake_Dataset.csv`.

---

## 5. Physical-Line Count

To test whether 78,098 represents a raw line count (e.g. from a shell `wc -l` or simple text file split), physical line breaks were audited at the byte level:

| Line-End Indicator | Count | Notes |
|---|---:|---|
| Total `\n` (Line Feed) bytes | 362,508 | Primary Unix/standard newline delimiter |
| Total `\r` (Carriage Return) bytes | 76,965 | Mac/Windows carriage returns |
| Total `\r\n` (CRLF) sequences | 76,917 | Windows CRLF sequences |
| Bare `\r` characters | 48 | Embedded vintage carriage returns |
| **Total Physical Lines (Python text readline)** | **362,556** | All line-delimited chunks |

### Result:
The CSV contains **362,556 physical lines**. The hypothesis that 78,098 was a physical-line count is **conclusively refutable** ($362,556 \gg 78,098$).

---

## 6. Logical-Record Count

Under strict CSV parsing adhering to RFC 4180 quotation semantics:

| Property | Observed Value | Verification Status |
|---|---:|---|
| Header Row | `['', 'title', 'text', 'label']` | Verified (4 columns) |
| Logical Data Records | **72,134** | Exact Match |
| Index Column Range | Contiguous `0` to `72,133` | 100% sequential, 0 gaps, 0 duplicates |
| Row Width Anomalies | 0 | Every record has exactly 4 fields |
| Label Values | Only `'0'` and `'1'` | 0 invalid, blank, or non-binary labels |
| Max Text Field Length | 142,961 chars (Row index 6,445) | Handled cleanly with raised limit |
| Total Unusable Text Rows | 783 | 39 empty, 744 whitespace-only |

### Completeness Assessment:
The index column (`0` through `72,133`) proves that the local CSV contains the **complete, intact, unabridged dataset** generated by the authors. No records were lost or dropped during download, archiving, or extraction.

---

## 7. Multiline-Record Contribution

In free-text news corpora, journalistic articles frequently contain internal line breaks (`\n`, `\r\n`). 

| Multiline Metric | Count |
|---|---:|
| Logical records with single-line text | 58,316 (80.84%) |
| Logical records containing embedded newlines | **13,818** (19.16%) |
| Embedded newline characters inside fields | **290,373** |
| Logical header row | 1 |
| Logical data rows | 72,134 |
| **Reconstructed Physical Lines ($1 + 72,134 + 290,373$)** | **362,508** `\n` breaks |

This exact mathematical reconstruction proves that the 362,508 newline characters in the file are fully accounted for by 72,134 logical CSV records and their quoted multiline text bodies.

---

## 8. Mathematical Reconciliation & Hypothesis Testing

| Hypothesis | Description | Test Result | Empirical Evidence / Rationale |
|---|---|---|---|
| **H1: Physical Line Count** | 78,098 represents raw lines in the CSV file | **REFUTED** | Actual physical lines = 362,556 ($362,556 \ne 78,098$). |
| **H2: Empty Text Dropped** | 5,964 difference is caused by empty text records | **REFUTED (Incomplete)** | Only 783 records have empty/whitespace text. $5,964 - 783 = 5,181$ records remain completely unexplained. |
| **H3: Duplicate Removal** | 5,964 represents duplicate rows removed | **UNSUPPORTED** | Local CSV still contains 8,458 full duplicates and 8,647 duplicate texts. Neither figure equals 5,964. |
| **H4: Upstream Collection Pre-Filter** | 78,098 was the raw item pool across the 4 sources prior to author filtering down to 72,134 | **PLAUSIBLE HYPOTHESIS** | Matches Zenodo author wording ("78098 data entries and only 72134 entries are accessed as per the data frame") and paper Table III (72,134 total articles). However, the specific 5,964 candidate items excluded before dataframe construction are undocumented. |

---

## 9. Empty/Whitespace Record Audit

A deep audit was conducted on missing and empty fields across all 72,134 records:

| Field Audit Metric | Count | Percentage of Total |
|---|---:|---:|
| Total records audited | 72,134 | 100.00% |
| Completely empty text fields (`len == 0`) | 39 | 0.054% |
| Whitespace-only text fields (`len > 0, len.strip == 0`) | 744 | 1.031% |
| **Total Unusable Text Records** | **783** | **1.085%** |
| Empty titles (`len == 0`) | 558 | 0.774% |
| Whitespace-only titles | 0 | 0.000% |
| Both title AND text unusable | **0** | 0.000% |

### Key Observations on Unusable Records:
1. Every record with empty text has a non-empty title.
2. Every record with an empty title has a non-empty, substantial body text.
3. Therefore, no record in WELFake is completely devoid of content. However, for a text-based NLP classifier evaluating article body content, records with 0 or whitespace-only body text cannot be meaningfully evaluated by text embeddings.
4. **Asymmetric Class Distribution**: Of the 783 unusable text records:
   - **Label 0 (Real): 1 record** (0.13%) — Dataset index `47225`
   - **Label 1 (Fake): 782 records** (99.87%) — e.g. clickbait articles where only the title was scraped
   This indicates that empty text in WELFake is almost entirely an artifact of scraped fake news blogs.

---

## 10. Exclusion Policy and Justification

### Policy Principles:
1. **Raw Immutability**: The raw dataset file `data/raw/welfake/WELFake_Dataset.csv` remains strictly read-only and unaltered.
2. **Reversibility**: Rather than creating duplicate filtered CSV files, exclusions are tracked in an external JSON manifest:
   `docs/research/welfake_b02_empty_text_exclusion_manifest.json`
3. **Traceability**: The manifest preserves the original dataset index, CSV logical row number, title, text lengths, label, and explicit exclusion reason (`EMPTY_TEXT` or `WHITESPACE_ONLY_TEXT`).
4. **NLP Training Safety**: Downstream training and preprocessing pipelines must filter rows where `dataset_index` is in the exclusion manifest.

---

## 11. Before/After Class Distributions

| Class | Raw CSV Count | Raw Proportion | Excluded Count | Usable / Clean Count | Post-Exclusion Proportion | Net Class Shift |
|---|---:|---:|---:|---:|---:|---:|
| **Label 0 (Real)** | 35,028 | 48.5596% | 1 | 35,027 | 49.0911% | **+0.5315%** |
| **Label 1 (Fake)** | 37,106 | 51.4404% | 782 | 36,324 | 50.9089% | **-0.5315%** |
| **Total** | **72,134** | **100.00%** | **783** | **71,351** | **100.00%** | — |

### Impact Evaluation:
Excluding the 783 unusable text records results in a tiny class shift of **0.53%**, preserving near-perfect parity (49.09% Real vs. 50.91% Fake). The exclusion policy is mathematically sound and introduces negligible class distortion.

---

## 12. Reproducibility Instructions

The audit and exclusion manifest can be reproduced at any time using standard-library Python:

```powershell
python scripts/audit_welfake_record_count.py
```

- **Output Manifest:** `docs/research/welfake_b02_empty_text_exclusion_manifest.json`
- **Manifest Check:** Validates that exactly 783 records are indexed, with 39 `EMPTY_TEXT` and 744 `WHITESPACE_ONLY_TEXT`.

---

## 13. Limitations and Residual Risks

1. **Unexplained Pre-DataFrame Discrepancy**: The origin and composition of the 5,964 pre-dataframe entries cited in the Zenodo metadata ("78098 data entries") remain unexplained in available primary literature. While the deposited CSV is 100% complete with respect to its internal index (0..72,133) and the published paper (72,134 articles), the specific candidate items excluded upstream cannot be identified.
2. **Title-Only Classification Risk**: The 783 excluded records have valid titles. If a future multimodal or title-based model is trained, these records could be reintroduced via the manifest.
3. **No Training Approval**: This investigation establishes data hygiene and resolves physical file structure, but does **NOT** authorize WELFake for model training. Blockers B-03 through B-07 (source provenance and upstream rights) remain unresolved.

---

## 14. Final B-02 Disposition

### Selected Disposition:
$$\mathbf{CLOSED\text{ — }OWNER\text{-}ACCEPTED\ WITH\ DOCUMENTED\ RESIDUAL\ DISCREPANCY}$$

### Justification & Outcome B Determination:
Following final targeted investigation of all available primary sources (Zenodo record 4561253 metadata/API, IEEE TCSS 2021 publication Table III, and local strict parser line reconstruction):
1. **Exact Reconciliation Status**: An exact mathematical reconciliation explaining the 5,964 difference between the Zenodo text ("78098 data entries") and the final dataframe ("72134 entries") is **unavailable** in public literature. The 5,964 figure represents an unexplained upstream pre-dataframe collection/filtering discrepancy.
2. **Local CSV Integrity**: The deposited CSV file `data/raw/welfake/WELFake_Dataset.csv` is authentic, uncorrupted, and complete. It contains exactly **72,134 logical data records** with contiguous sequential zero-based indices from `0` to `72,133` (zero gaps, zero missing records), matching Table III of the authors' peer-reviewed IEEE TCSS 2021 publication with 100% precision.
3. **Physical Line Hypothesis**: Conclusively refuted (actual physical lines = 362,556 due to 13,818 multiline records contributing 290,373 embedded newlines).
4. **Data Hygiene & Empty Text**: The 783 unusable empty/whitespace text records are established as a separate preprocessing hygiene issue and are fully tracked in a reversible, non-destructive exclusion manifest (`docs/research/welfake_b02_empty_text_exclusion_manifest.json`), leaving a clean training-ready pool of 71,351 records (49.09% Real, 50.91% Fake).
5. **Owner-Authorized Closure**: In accordance with explicit project owner authorization under Outcome B, Blocker B-02 is administratively marked **CLOSED — OWNER-ACCEPTED WITH DOCUMENTED RESIDUAL DISCREPANCY**. This decision reflects project owner risk acceptance of the documented residual limitation, NOT a claim that the 5,964 discrepancy was scientifically resolved.
6. **Training Boundary**: WELFake is **NOT** approved for baseline training or production inference. Upstream source provenance (B-03 through B-06) and upstream content rights (B-07) remain unresolved. Phase P01 remains **OPEN / IN PROGRESS**.

