# VeriNews P01-L — WELFake Full-Paper Methodology Review

**Review date:** 2026-11-08  
**Scope:** Documentation-only review of the full accessible WELFake original paper, extended from P01-K, to investigate dataset construction, label assignment, annotation, evaluation, and count/release reconciliation. No dataset/archive was downloaded, no local raw file was opened, no audit, preprocessing, training, or evaluation was performed.  
**Project decision:** Continue research; no dataset selected or approved. P01 remains **OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL**. WELFake remains **ON HOLD**. No dataset is approved for local training or public portfolio demonstration. P02 is **NOT STARTED**.  
**Cross-reference:** This report extends [P01-K — WELFake Original Paper Evidence Review](p01-k-welfake-original-paper-evidence-review.md), which documented Section IV-A and Table III aggregate/source-wise class counts. P01-L covers the full-paper methodology questions H-01 through H-08 identified in [P01-H](p01-h-welfake-primary-evidence-access-plan.md) and tracked in [P01-J](p01-j-consolidated-provenance-rights-feasibility.md).

## 1. Executive decision

The full WELFake paper PDF was not accessible as readable text via the available retrieval route (the Zenodo PDF file URL returned an unsupported `application/octet-stream` content type, consistent with P01-I/P01-H findings that IEEE full-text routes returned no readable article content). Consequently, none of the eight methodology questions below could be answered from primary paper content. **No dataset is selected or approved.** WELFake remains **ON HOLD**. H-01 through H-03 (label mapping, record-count discrepancy, dataset construction/provenance) remain **UNRESOLVED**, consistent with P01-I and P01-J.

## 2. Source identification

| Attribute | Value |
|-----------|-------|
| Paper title | WELFake: Word Embedding over Linguistic Features for Fake News Detection |
| Paper venue | IEEE Transactions on Computational Social Systems (TCSS), 2021 |
| DOI | 10.1109/TCSS.2021.3068519 |
| Paper PDF URL | https://zenodo.org/records/4692818/files/WELFake__Word_Embedding_over_Linguistic_Features_for_Fake_News_Detection.pdf |
| Dataset record URL | https://zenodo.org/records/4561253 |
| Access date | 2026-11-08 |
| Access result | Full paper PDF not readable as text (`application/octet-stream`); no sections beyond P01-K's Section IV-A / Table III could be inspected |

## 3. Access attempt record

| Attempt | URL | Result |
|---------|-----|--------|
| Full paper PDF via Zenodo | https://zenodo.org/records/4692818/files/WELFake__Word_Embedding_over_Linguistic_Features_for_Fake_News_Detection.pdf | Returned `application/octet-stream`; not readable as text; no paper content extracted |
| Crossref-listed IEEE PDF endpoint (P01-I/P01-G route) | http://xplorestaging.ieee.org/ielx7/6570650/9502055/09395133.pdf?arnumber=9395133 | Previously recorded as attempted but not readable by the available PDF reader (P01-I) |
| IEEE Xplore article record | https://ieeexplore.ieee.org/document/9395133 | Previously recorded as returning no readable article content via the route used (P01-I) |

No sections, pages, tables, or figures beyond those already documented in P01-K (Section IV-A and Table III) could be inspected.

## 4. Question-by-question findings

### 4.1 Q1 — How were Fake and Real labels assigned?

**Finding:** Not located in the full paper reviewed.

**Exact sections searched:** Full paper PDF was not readable; only Section IV-A and Table III were previously documented (P01-K). No paper passage establishing label assignment was accessible.

**Evidence category:** Not located (paper inaccessible); prior documentation from P01-K/P01-I/P01-J.

**What remains unresolved:** Whether labels were inherited from source datasets, manually assigned, independently fact-checked, or mixed. H-01 remains **UNRESOLVED**.

### 4.2 Q2 — Human annotation, fact-checking, adjudication or quality control?

**Finding:** Not located in the full paper reviewed.

**Exact sections searched:** Full paper PDF was not readable; no annotation/quality-control section could be inspected.

**Evidence category:** Not located (paper inaccessible).

**What remains unresolved:** Whether human annotators, evidence standards, independent verification, agreement measures, or adjudication were documented. H-03 (construction/provenance) remains **UNRESOLVED**.

### 4.3 Q3 — Original source dataset behind each article?

**Finding:** Not located in the full paper reviewed.

**Exact sections searched:** Full paper PDF was not readable; P01-K documented that the paper names four aggregate sources (Kaggle, McIntire, Reuters, BuzzFeed Political) but gives no per-record source lineage.

**Evidence category:** Not located (paper inaccessible); source names from P01-K Section IV-A.

**What remains unresolved:** Per-record/per-partition source lineage, source contributions, and whether sources overlap. H-03 remains **UNRESOLVED**. Exact Kaggle/McIntire/Reuters source URLs were not identified in existing evidence (P01-H).

### 4.4 Q4 — Filtering, cleaning, deduplication or record removal?

**Finding:** Not located in the full paper reviewed.

**Exact sections searched:** Full paper PDF was not readable; no filtering/deduplication section could be inspected.

**Evidence category:** Not located (paper inaccessible).

**What remains unresolved:** Transformations, cleaning, filtering, truncation, deduplication, and record-removal procedures. H-03 remains **UNRESOLVED**.

### 4.5 Q5 — Explanation of the 72,134 dataset size and relationship to Zenodo 78,098 entries?

**Finding:** Not located in the full paper reviewed.

**Exact sections searched:** Full paper PDF was not readable; P01-I records that searches for `78098` and `78 098` in available paper text found no explanation.

**Evidence category:** Not located (paper inaccessible); P01-I H-02 documentation.

**What remains unresolved:** What the 78,098 figure counts and how it relates to the 72,134 dataframe/articles and exact deposited CSV. H-02 remains **UNRESOLVED**. No cause is assigned (no inference about multiline fields, malformed rows, filtering, or parser behavior).

### 4.6 Q6 — Numeric label encoding used in the exact deposited CSV?

**Finding:** Not located in the full paper reviewed.

**Exact sections searched:** Full paper PDF was not readable; no explicit label-encoding passage tied to the exact CSV was accessible.

**Evidence category:** Not located (paper inaccessible); Zenodo declaration from P01-K (`0 = Fake`, `1 = Real`) is deposit metadata only.

**What remains unresolved:** Whether the exact CSV implements Zenodo's declared mapping. Local raw counts (label `0`: 35,028; label `1`: 37,106) match paper "real"/"fake" totals only under reversal, but count-level agreement is not per-row semantics. H-01 remains **UNRESOLVED**. Labels were **not** reversed or modified.

### 4.7 Q7 — Train/test splitting and possible source or duplicate leakage?

**Finding:** Not located in the full paper reviewed.

**Exact sections searched:** Full paper PDF was not readable; no train/test split section could be inspected.

**Evidence category:** Not located (paper inaccessible).

**What remains unresolved:** Split construction, source/topic/time-period associations with labels, and leakage risks (plausible, not measured). H-03 remains **UNRESOLVED**. No source/topic/duplicate leakage audit of the exact release was performed.

### 4.8 Q8 — Supplementary files, code or reproducible mapping?

**Finding:** Not located in the full paper reviewed.

**Exact sections searched:** Full paper PDF was not readable; P01-J documented that the Zenodo record listed one CSV file only; existence of any supplement elsewhere is unknown.

**Evidence category:** Not located (paper inaccessible); Zenodo record metadata from P01-J Section 3.1.

**What remains unresolved:** Whether any supplementary file, code, or reproducible mapping exists and, if so, whether it resolves H-01/H-02/H-03. Zenodo record 4561253 listed one CSV (`WELFake_Dataset.csv`) per P01-J; no supplement URL identified.

## 5. Evidence-source distinction (consistent with P01-K through P01-J)

| Evidence type | Source | Status |
|---------------|--------|--------|
| Paper-reported class counts (aggregate and per-source) | P01-K Section 3 (paper Section IV-A, Table III) | Reported by paper authors; not independently re-derived |
| Local strict-parse counts | Existing P01 local audit (cited, not re-audited) | Raw values unchanged; not re-inspected |
| Zenodo label mapping declaration | Zenodo record 4561253 metadata | Deposit declaration only; not confirmed against exact CSV |
| Label mapping in exact CSV | Unknown | **Unresolved** (H-01 unresolved) |
| Record-count discrepancy (78,098 vs 72,134) | Zenodo declaration | **Unresolved** (H-02 unresolved; searches for `78098`/`78 098` found no explanation per P01-I) |
| Full-paper methodology (label assignment, annotation, source lineage, filtering/dedup, split/leakage, supplementary files) | Not accessible (PDF unreadable) | **Not located in the full paper reviewed** |
| Annotation/quality-control methods | Unknown | **Unresolved**; not documented in any accessible section |

## 6. Preservation of existing dispositions

All existing P01 candidate dispositions, approval restrictions, and evidence-status conventions are preserved:

- WELFake remains **ON HOLD**; no dataset is approved for local training or public portfolio demonstration.
- Original labels remain unchanged; labels were **not** reversed, modified, or relabeled.
- Class-count agreement (paper = local = Zenodo at aggregate level) is **not** treated as evidence of label semantics.
- P01 remains **OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL**.
- P02 remains **NOT STARTED**; the P00–P15 roadmap is unchanged.
- No dataset download, archive access, raw-data modification, preprocessing, training, dependency installation, author contact, or roadmap advancement is authorized by this report.
- No claim is made that the paper establishes facts it does not explicitly state; no missing source lineage or annotation methods are inferred.

## 7. Recommended next evidence actions

These are recommendations for a later mentor-authorized phase only. No action below is authorized now:

1. Obtain primary label-mapping evidence for the exact WELFake CSV release (resolving H-01) — traceable paper passage with page/section/table and any statement linking numeric encoding to the Zenodo CSV release.
2. Obtain a primary explanation defining the 78,098 and 72,134 counting units and reconciling them (resolving H-02).
3. Obtain primary documentation of source lineage, label assignment, annotation/adjudication, filtering/deduplication, train/test splitting, and quality-control methods from the paper full text or author/publisher sources (resolving H-03).
4. Establish whether any supplementary file, code, or reproducible mapping exists that resolves H-01/H-02/H-03.
5. Establish upstream content rights and depositor authority for all four aggregated sources (Kaggle, McIntire, Reuters, BuzzFeed Political).
6. Only after mentor authorization and primary label-mapping resolution, recompute quality, duplicate, and leakage audits on an authorized copy.

## 8. Sources

- Original paper PDF (not readable): https://zenodo.org/records/4692818/files/WELFake__Word_Embedding_over_Linguistic_Features_for_Fake_News_Detection.pdf
- Paper DOI: 10.1109/TCSS.2021.3068519
- Dataset record: https://zenodo.org/records/4561253
- P01-K: docs/research/p01-k-welfake-original-paper-evidence-review.md
- P01-I: docs/research/p01-i-welfake-primary-evidence-findings.md
- P01-H: docs/research/p01-h-welfake-primary-evidence-access-plan.md
- P01-J: docs/research/p01-j-consolidated-provenance-rights-feasibility.md
- Review date: 2026-11-08

## Related VeriNews research

- P01-E Final Dataset Feasibility Review
- P01-F Dataset Evidence Decision Register
- P01-J Consolidated Dataset Provenance, Rights & Feasibility Research
- WELFake Label and CSV Integrity Investigation
- WELFake Archive Inspection

**STOP: awaiting mentor review. Do not begin downloads, audits, preprocessing, model work, author contact, or another research phase automatically.**
