# VeriNews P01-O — WELFake Language Distribution Audit

**Execution label:** P01-O  
**Review date:** 2026-11-08  
**Scope:** Documentation-only language-distribution audit of the WELFake dataset (`data/raw/welfake/WELFake_Dataset.csv`). No dataset files were downloaded, opened for writing, or modified. No model training was performed.  
**Project decision:** Continue research; no dataset selected or approved. P01 remains **OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL**. WELFake remains **ON HOLD**. No dataset is approved for local training or public portfolio demonstration. P02 is **NOT STARTED**.  
**Tracker execution ID:** EXEC-20261108174414450-0F965AE2

---

## 1. Audit Objective

The objective of this audit was to determine the language distribution of the WELFake dataset's text content using a reproducible 2,000-record random sample. This information is needed to assess whether the dataset is predominantly English-language and therefore suitable for an English-language baseline research pipeline, independent of label semantics or upstream rights considerations.

This audit does **not** resolve the WELFake label-semantics question (H-01), the source-provenance question (H-04), or the upstream-content-rights question (H-05). It is a language-distribution snapshot only.

---

## 2. Dataset and Sampling Methodology

| Attribute | Value |
|-----------|-------|
| Dataset file | `data/raw/welfake/WELFake_Dataset.csv` |
| Total dataset records | 72,134 |
| Columns | `''` (index), `title`, `text`, `label` |
| Sample method | Random sampling without replacement |
| Sample size | 2,000 records |
| Random seed | 42 |
| Combined fields | `title` + `text` |
| Missing-value handling | Empty string |
| Minimum combined text length | 30 characters |
| Language detector | `langdetect` |
| Detector seed | 42 |

**Important:** This is a **2,000-record sample audit**, not a full-dataset audit of all 72,134 records. The results below apply only to the sampled records and should not be extrapolated to the full dataset without explicit statistical justification.

---

## 3. Language Detection Methodology

1. The WELFake CSV was read with pandas.
2. Missing values in `title` and `text` were treated as empty strings.
3. `title` and `text` were concatenated with a space separator and stripped of leading/trailing whitespace.
4. A reproducible random sample of 2,000 records was drawn using `df.sample(n=2000, random_state=42)`.
5. Records with combined text shorter than 30 characters were skipped and counted separately.
6. Each remaining record's combined text was passed to `langdetect.detect()`.
7. `DetectorFactory.seed = 42` was set before detection to ensure reproducible language identification.
8. Detection errors (exceptions raised by `langdetect`) were counted separately.
9. Detected language codes were counted using `collections.Counter`.
10. Percentages were computed as `count / analyzed_records * 100`, rounded to one decimal place.

---

## 4. Observed Results

| Language | Count | Percentage |
|----------|-------|------------|
| English (`en`) | 1,984 | 99.3% |
| Russian (`ru`) | 9 | 0.5% |
| Spanish (`es`) | 3 | 0.2% |
| French (`fr`) | 1 | 0.1% |
| Turkish (`tr`) | 1 | 0.1% |
| **Total analyzed** | **1,998** | **100%** |

**Summary statistics:**
- Sample size: 2,000
- Skipped short records (< 30 chars): 1
- Detection errors: 1
- Successfully analyzed records: 1,998

**Important caveats:**
- Percentages are based on 1,998 successfully detected records, not on the full 72,134-record dataset.
- Percentages are rounded to one decimal place and may not sum to exactly 100%.
- No claim is made that 99.3% of all 72,134 records are English. The 99.3% figure applies only to the sampled records.
- Language detection is automated and approximate; it does not establish article authenticity or truthfulness.

---

## 5. Interpretation and Limitations

The sample suggests that the WELFake dataset is predominantly English-language, with approximately 99.3% of analyzed records detected as English. Small numbers of Russian (9 records), Spanish (3 records), French (1 record), and Turkish (1 record) records were also detected.

However, the following limitations apply:

1. **Sample size:** Only 2,000 of 72,134 records (~2.8%) were analyzed. Full-dataset language distribution may differ.
2. **Detection accuracy:** `langdetect` is a probabilistic language detector and may misclassify short or mixed-language texts.
3. **Short-text exclusion:** Records with combined text shorter than 30 characters were excluded from language detection; their language is unknown.
4. **Detection errors:** One record failed language detection; its language is unknown.
5. **No label-language correlation:** This audit does not examine whether language correlates with the `label` column values (`0` / `1`), which themselves have an unresolved mapping to Fake/Real semantics (see H-01).

---

## 6. Suitability for English-Language Baseline Research

From a language-composition standpoint, the WELFake sample is overwhelmingly English (99.3% of analyzed records), which is consistent with an English-language baseline research pipeline. However:

- **Language suitability ≠ dataset approval.** Language distribution is only one of many required gates.
- **Label semantics remain unresolved** (H-01): The exact numeric-to-semantic mapping in the CSV is not established.
- **Upstream rights remain unresolved** (H-05): The depositor's authority over all upstream article content is not established.
- **Provenance remains unresolved** (H-03): Per-record source lineage and label-construction methodology are not documented.

Therefore, even though the dataset appears predominantly English, it is **not approved** for model training.

---

## 7. Why This Audit Does Not Establish Hindi or Multilingual Suitability

The WELFake sample is 99.3% English. There is no evidence from this audit that the dataset contains meaningful Hindi-language content. The Indic Zenodo Hindi archive (`data/raw/indic_zenodo/Hindi_F&R_News/`) is a separate dataset with its own unresolved integrity and rights questions (see P01-M and P01-N). No multilingual or Hindi-language training pipeline can be justified from WELFake data alone.

---

## 8. Relationship to Earlier WELFake Research Findings

This audit is consistent with prior P01 findings:

- **P01-K** documented that P01-K's Section IV-A/Table III figures were imported from supplied investigation notes and not independently verified from readable paper content.
- **P01-L** documented that the full WELFake paper PDF was not accessible as readable text through any available route.
- **P01-M** established that WELFake remains ON HOLD due to unresolved label semantics, provenance, and upstream rights.
- **P01-N** confirmed that H-01 (label semantics), H-04 (Kaggle/McIntire source identity), and H-05 (Reuters/BuzzFeed rights) remain UNRESOLVED.

The language-distribution audit does **not** resolve H-01, H-04, or H-05. It adds one additional data point (language composition) but does not change any prior P01 task status.

---

## 9. Final Dataset Status and Unresolved Approval Gates

**WELFake remains ON HOLD.** No dataset is approved for local training or public portfolio demonstration.

**Unresolved gates:**

| Gate | Status | Blocker |
|------|--------|---------|
| Label semantics (H-01) | UNRESOLVED | Zenodo declares `0=Fake,1=Real`; local counts match only under reversal; no readable paper passage confirms mapping |
| Record-count discrepancy (H-02) | UNRESOLVED | Zenodo states 78,098 entries / 72,134 dataframe entries; no cause established |
| Dataset construction/provenance (H-03) | UNRESOLVED | No per-record source map, label-construction procedure, or quality-control documentation |
| Kaggle/McIntire source identity (H-04) | UNRESOLVED | Zenodo names sources generically; no exact identity established |
| Reuters/BuzzFeed rights (H-05) | UNRESOLVED | No depositor authority established over upstream article content |

**No dataset — including WELFake — is approved for local training or public portfolio demonstration.**

---

## 10. Reproducibility Instructions

To reproduce this audit:

1. Ensure Python 3.14.6 is available.
2. Install required dependencies: `pandas`, `langdetect`, `tqdm`.
3. Confirm `data/raw/welfake/WELFake_Dataset.csv` exists (245,086,152 bytes, SHA-256: `665331424230fc452e9482c3547a6a199a2c29745ade8d236950d1d105223773`).
4. Run: `py scripts/audit_welfake_language.py`
5. Expected output: approximately 2,000 sampled records, ~1,998 analyzed, with English dominant (~99.3%).

**Note:** The script samples randomly with `random_state=42`, so re-running it should produce the same sample and the same language distribution, provided the input CSV is unchanged.

---

## Related VeriNews Research

- P01-E Final Dataset Feasibility Review
- P01-F Dataset Evidence Decision Register
- P01-G WELFake Evidence Verification
- P01-H WELFake Evidence Access Plan
- P01-I WELFake Primary Evidence Findings
- P01-J Consolidated Dataset Provenance, Rights & Feasibility Research
- P01-K WELFake Original Paper Evidence Review
- P01-L WELFake Full-Paper Methodology Review
- P01-M Comprehensive Dataset Evidence Recovery & Candidate Review
- P01-N Critical WELFake Evidence Resolution
- P01-O Three-Dataset Comparative Evaluation
- P01-O Final Dataset Selection
- WELFake Label and CSV Integrity Investigation
- WELFake Archive Inspection

**STOP: awaiting mentor review. Do not begin downloads, audits, preprocessing, model work, author contact, or another research phase automatically.**
