# VeriNews P01-K — WELFake Original Paper Evidence Review

**Review date:** 2026-11-08  
**Scope:** Documentation-only review of the WELFake original paper and its dataset claims, reconciled with existing P01 findings. No dataset/archive was downloaded, no local raw file was opened, no audit, preprocessing, training, or evaluation was performed.  
**Project decision:** Continue research; no dataset selected or approved. P01 remains **OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL**. WELFake remains **ON HOLD**. No dataset is approved for local training or public portfolio demonstration. P02 is **NOT STARTED**.

## 1. Executive decision

This report documents the newly located WELFake original paper evidence and reconciles it with prior P01 findings (P01-E through P01-J). The paper confirms aggregate and source-wise class counts matching the existing local audit, but it does **not** resolve the WELFake label-to-class mapping conflict, and it does not document annotation, fact-checking, label inheritance, adjudication, or quality-control methods in the sections reviewed. **No dataset is selected or approved.** WELFake remains **ON HOLD**.

## 2. Source identification

| Attribute | Value |
|-----------|-------|
| Paper title | WELFake: Word Embedding over Linguistic Features for Fake News Detection |
| Paper venue | IEEE Transactions on Computational Social Systems (TCSS), 2021 |
| DOI | 10.1109/TCSS.2021.3068519 |
| Paper PDF URL | https://zenodo.org/records/4692818/files/WELFake__Word_Embedding_over_Linguistic_Features_for_Fake_News_Detection.pdf |
| Dataset record URL | https://zenodo.org/records/4561253 |
| Access date | 2026-11-08 (review performed from cited source URLs; no file downloaded or opened) |

## 3. Paper-reported evidence (Section IV-A and Table III)

### 3.1 Section IV-A — Dataset preparation

The paper's Section IV-A reports dataset preparation across four named sources:

| Source | Role in aggregate |
|--------|-------------------|
| Kaggle | One of four merged sources |
| McIntire | One of four merged sources |
| Reuters | One of four merged sources |
| BuzzFeed Political | One of four merged sources |

**Aggregate totals reported by the paper:**
- Total articles: **72,134**
- Real articles: **35,028**
- Fake articles: **37,106**

### 3.2 Table III — Per-source class distribution

The paper's Table III reports per-source real/fake breakdowns:

| Source | Real | Fake |
|--------|------|------|
| Kaggle | 10,387 | 10,413 |
| McIntire | 3,171 | 3,164 |
| Reuters | 21,417 | 23,481 |
| BuzzFeed Political | 53 | 48 |
| **Aggregate (reported)** | **35,028** | **37,106** |

The per-source figures sum to the reported aggregate totals:
- Real: 10,387 + 3,171 + 21,417 + 53 = 35,028
- Fake: 10,413 + 3,164 + 23,481 + 48 = 37,106

## 4. Existing local audit findings (unchanged)

The existing local strict parse (documented in P01-E through P01-J) establishes:

| Metric | Value |
|--------|-------|
| Strict four-field records | 72,134 |
| Raw label `0` | 35,028 |
| Raw label `1` | 37,106 |

**Raw values were not modified.** The local audit count of 72,134 matches the paper-reported aggregate total exactly.

## 5. Zenodo deposit declaration (context only)

The Zenodo record (https://zenodo.org/records/4561253) declares:

| Declaration | Value |
|-------------|-------|
| Label mapping | `0 = Fake`, `1 = Real` |
| Real articles | 35,028 |
| Fake articles | 37,106 |
| Total | 72,134 |

This declaration is deposit metadata only and is **not** primary evidence of the mapping in the exact CSV file.

## 6. Required analysis

### 6.1 Paper confirms aggregate and source-wise class counts

The paper's Section IV-A aggregate totals (72,134 total; 35,028 real; 37,106 fake) exactly match:
1. The existing local audit strict-parse count of 72,134 four-field records, and
2. The raw local counts of label `0`: 35,028 and label `1`: 37,106.

The paper's Table III per-source breakdowns sum correctly to the reported aggregate totals, and those totals match the Zenodo-declared counts. This confirms internal consistency between the paper, the Zenodo declaration, and the local audit **at the aggregate class-count level**.

### 6.2 Label-to-class mapping remains unresolved

Despite matching aggregate counts, **the exact label-to-class mapping in the WELFake CSV remains unresolved**:

- The Zenodo deposit declares `0 = Fake` and `1 = Real`.
- The existing local audit reports raw label `0`: 35,028 and raw label `1`: 37,106 — counts that match the paper's "real" and "fake" totals **only under reversal** of the Zenodo mapping (i.e., local label `0` matching paper real-count 35,028, local label `1` matching paper fake-count 37,106).
- Matching class totals do not establish per-row label semantics. Count-level agreement does not prove which raw label value corresponds to which class in the exact CSV.

**No labels were reversed or modified.** Raw values remain unchanged. Primary label-mapping evidence remains unresolved (H-01/H-02 remain unresolved in existing P01 records).

### 6.3 Annotation, fact-checking, label inheritance, adjudication and quality control

The sections reviewed (Section IV-A and Table III) document dataset preparation counts and per-source class distribution. They **do not** document:

- Annotation procedures or annotator standards,
- Independent fact-checking or verification of labels,
- Label inheritance protocols from source datasets,
- Adjudication processes for disputed labels, or
- Quality-control methods applied during dataset construction.

These items remain **unresolved**. No primary paper passage establishing annotators, evidence standards, independent verification, agreement measures, or adjudication was identified in the sections reviewed. Whether labels were inherited from source datasets, manually assigned, independently fact-checked, or mixed is unknown.

### 6.4 Evidence-source distinction

| Evidence type | Source | Status |
|---------------|--------|--------|
| Paper-reported class counts (aggregate and per-source) | Paper Section IV-A, Table III | Reported by paper authors; not independently re-derived from data |
| Local strict-parse counts | Existing P01 local audit | Locally computed; raw values unchanged; not re-inspected |
| Zenodo label mapping declaration | Zenodo record 4561253 metadata | Deposit declaration only; not confirmed against exact CSV |
| Label mapping in exact CSV | Unknown | **Unresolved** (H-01/H-02 unresolved) |
| Annotation/quality-control methods | Unknown | **Unresolved**; not documented in sections reviewed |

## 7. Preservation of existing dispositions

All existing P01 candidate dispositions, approval restrictions, and evidence-status conventions are preserved:

- WELFake remains **ON HOLD**; no dataset is approved for local training or public portfolio demonstration.
- Original labels remain unchanged; labels were **not** reversed.
- Class-count agreement is **not** treated as evidence of label semantics.
- P01 remains **OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL**.
- P02 remains **NOT STARTED**; the P00–P15 roadmap is unchanged.
- No dataset download, archive access, raw-data modification, preprocessing, training, dependency installation, author contact, or roadmap advancement is authorized by this report.

## 8. Recommended next evidence actions

These are recommendations for a later mentor-authorized phase only. No action below is authorized now:

1. Obtain primary label-mapping evidence for the exact WELFake CSV release (resolving H-01/H-02).
2. Obtain primary documentation of label assignment, annotation/adjudication, and quality-control methods from the paper full text or author/publisher sources.
3. Reconcile the Zenodo-declared mapping (`0 = Fake`, `1 = Real`) with the exact CSV semantics through authorized primary evidence only.
4. Establish upstream content rights and depositor authority for all four aggregated sources (Kaggle, McIntire, Reuters, BuzzFeed Political).
5. Only after mentor authorization and primary label-mapping resolution, recompute quality, duplicate, and leakage audits on an authorized copy.

## 9. Sources

- Original paper PDF: https://zenodo.org/records/4692818/files/WELFake__Word_Embedding_over_Linguistic_Features_for_Fake_News_Detection.pdf
- Paper DOI: 10.1109/TCSS.2021.3068519
- Dataset record: https://zenodo.org/records/4561253
- Review date: 2026-11-08

## Related VeriNews research

- P01-E Final Dataset Feasibility Review
- P01-F Dataset Evidence Decision Register
- P01-J Consolidated Dataset Provenance, Rights & Feasibility Research
- WELFake Label and CSV Integrity Investigation
- WELFake Archive Inspection

**STOP: awaiting mentor review. Do not begin downloads, audits, preprocessing, model work, author contact, or another research phase automatically.**
