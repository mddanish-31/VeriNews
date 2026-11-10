# VeriNews P01-O — Three-Dataset Comparative Evaluation

**Execution label:** P01-O  
**Review date:** 2026-11-08  
**Scope:** Comparative evaluation of ISOT Fake News Dataset (English), TaLLIP Multilingual Dataset (Hindi), and Indic Zenodo Hindi Fake/Real archive as candidate datasets for the VeriNews MVP.  
**Project decision:** Continue research; no dataset selected or approved. P01 remains **OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL**. WELFake remains **ON HOLD**. No dataset is approved for local training or public portfolio demonstration. P02 is **NOT STARTED**.  
**Tracker execution ID:** EXEC-20261108174414450-0F965AE2  
**Preceding reports:** P01-M (comprehensive evidence recovery), P01-N (critical WELFake evidence resolution), P01-K through P01-J (prior P01 research)

---

## 1. Executive summary

This report evaluates three dataset candidates for the VeriNews MVP: ISOT Fake News Dataset (English), TaLLIP Multilingual Dataset (Hindi), and Indic Zenodo Hindi Fake/Real archive (Hindi). All three were previously assessed in P01-M and remain unresolved for training approval.

**Principal finding:** No candidate passes all required gates for VeriNews local training and public demonstration. Each candidate has at least one blocking issue: unresolved label semantics (WELFake, out of scope here), missing dataset licence (ISOT, TaLLIP), licence conflict (Indic Zenodo Hindi), unmeasured counts/schema (TaLLIP), or access restrictions (HinFakeNews). No multilingual MVP can proceed with current evidence.

**Comparative recommendation:** No candidate is APPROVED FOR BASELINE TRAINING. ISOT is CONDITIONALLY SUITABLE pending licence and source-confounding review. TaLLIP is PENDING pending licence and archive verification. Indic Zenodo Hindi is PENDING/NOT APPROVED pending CC BY vs CC BY-NC conflict resolution and archive-to-paper identity reconciliation. **Training cannot proceed on any candidate in this execution.**

---

## 2. Scope and methodology

### 2.1 Methodology

This task evaluates three dataset candidates against weighted criteria:

| Criterion | Weight |
|-----------|--------:|
| Label reliability | 25 |
| Data integrity and reproducibility | 20 |
| Provenance and rights clarity | 20 |
| Language/task suitability | 15 |
| Leakage and evaluation suitability | 10 |
| CPU feasibility | 10 |
| Total | 100 |

**Scoring formula:** Weighted Score = sum((Rating / 5) × Criterion Weight), where each criterion is rated 0–5 and the weight is the criterion's weight from the table above. The maximum possible score is 100.

**Important:** These scores are provisional desk-based assessments using existing evidence gathered from public sources and prior reports (P01-E through P01-N). They are **not** fresh raw-dataset audits. No local raw dataset files were opened or modified in this execution except for reading file headers and row counts (read-only inspection). Python 3.14.6 is available in this environment and was used to read CSV headers and count rows for the WELFake dataset that is already present locally (`data/raw/welfake/WELFake_Dataset.csv`). Scores may change if new evidence is obtained from primary sources or if raw-dataset audits are performed under future mentor authorization.

### 2.2 Evidence categories

| Category | Meaning |
|----------|---------|
| VERIFIED | Authoritative primary source directly checked |
| PARTIALLY VERIFIED | Primary source statement confirmed but application/scope unresolved |
| UNRESOLVED | Not established by inspected primary evidence |
| PAPER-REPORTED | Claimed in a publication; not independently confirmed against data |
| REPOSITORY-REPORTED | Claimed in repository README/metadata; not independently confirmed |

### 2.3 Restrictions observed

- No dataset/archive downloaded during this task (all data was already present locally from prior sessions)
- No local raw dataset files modified
- No labels reversed or relabeled
- No preprocessing, model training, or dependency installation
- No authors/dataset maintainers/providers contacted
- No legal clearance claimed; no dataset approved without mentor approval
- No frontend/backend application functionality modified
- No push to GitHub

---

## 3. Candidate A — ISOT Fake News Dataset (English)

### 3.1 Identity and source

| Attribute | Finding |
|-----------|---------|
| Dataset name | ISOT Fake News Dataset |
| Original source | University of Victoria (UVic) ISOT Research Lab |
| Official page | https://onlineacademiccommunity.uvic.ca/isot/2022/11/27/fake-news-detection-datasets |
| Primary papers | Ahmed et al. (2017), ISDDC; Ahmed et al. (2018), Security and Privacy |
| DOI | https://doi.org/10.1002/spy2.9 |
| Format | Two CSV files (True.csv / Fake.csv), full article body + title |
| Language | English |

### 3.2 Label quality

| Attribute | Finding |
|-----------|---------|
| Label meaning | Real = Reuters-sourced; Fake = outlets flagged by PolitiFact/Wikipedia |
| Label origin | Source-group-derived, NOT individually fact-checked per article |
| Annotation process | Not documented per article |
| Quality control | Not documented |
| Label noise risk | High — source-based labels create systematic bias |

### 3.3 Data integrity

| Attribute | Finding |
|-----------|---------|
| Record count | 44,898 total reported (21,417 Real / 23,481 Fake) |
| Format | CSV with columns: title, text, subject, date |
| Class balance | ~47.7% Real / ~52.3% Fake |
| Train/test split | Not officially documented |
| Duplicate/near-duplicate analysis | Not performed |
| Source leakage | Severe — Reuters dateline cues correlate with Real label |

### 3.4 Rights and usage

| Attribute | Finding |
|-----------|---------|
| Dataset licence | Not established — official page offers download but no explicit dataset licence |
| Upstream content rights | Unresolved — Reuters and other publisher article rights not established |
| Redistribution terms | Not established |
| Public demonstration rights | Not established |
| Local training permission | Not established |

### 3.5 Suitability for VeriNews

| Criterion | Score (0–5) | Rationale |
|-----------|-------------|-----------|
| Label reliability | 1 | Source-group-derived labels, not individually verified |
| Data integrity | 2 | Counts reported but not independently verified; no split documentation |
| Provenance and rights | 1 | No explicit dataset licence; upstream rights unresolved |
| Language/task suitability | 4 | English article text, appropriate format |
| Leakage and evaluation suitability | 1 | Severe source confounding; Reuters datelines leak labels |
| CPU feasibility | 5 | ~45K records, CPU-feasible |
| **Weighted total** | **41/100** | Below approval threshold |

**Status: CONDITIONALLY SUITABLE** — Article-format candidate with full text, but source-based label confounding and missing licence prevent approval. Requires: explicit dataset licence, source-aware evaluation design, leakage mitigation.

---

## 4. Candidate B — TaLLIP Hindi

### 4.1 Identity and source

| Attribute | Finding |
|-----------|---------|
| Dataset name | TaLLIP Multilingual Dataset (TALLIP-FakeNews-Dataset) |
| Original source | Arko98/TALLIP-FakeNews-Dataset (GitHub); amanifeunou/TaLLIP_Dataset (second repository); IIT Patna archive link |
| Primary paper | De et al. (2021), ACM TALLIP, DOI: 10.1145/3472619 |
| Institutional provenance | IIT Patna and IIT Hyderabad |
| Languages | English, Hindi (Devanagari), Swahili, Indonesian, Vietnamese (reported) |
| Format | Train/test `.txt` files listed; exact schema unverified |

### 4.2 Label quality

| Attribute | Finding |
|-----------|---------|
| Label meaning | Binary Real/Fake claimed |
| Label origin | Not documented; method unverified |
| Annotation process | Not documented |
| Quality control | Not documented |
| Label noise risk | High — no annotation evidence |

### 4.3 Data integrity

| Attribute | Finding |
|-----------|---------|
| Record count | Not measured — train/test `.txt` files listed but contents not inspected |
| Class balance | Not measured |
| Format | `.txt` files listed; schema unknown |
| Train/test availability | Files listed in repositories; not inspected |
| Duplicate analysis | Not performed |

### 4.4 Rights and usage

| Attribute | Finding |
|-----------|---------|
| Dataset licence | Not established — Arko98 code MIT (not data licence); second repo no visible licence |
| Upstream content rights | Not established |
| Redistribution terms | Not established |
| Public demonstration rights | Not established |
| Local training permission | Not established |

### 4.5 Suitability for VeriNews

| Criterion | Score (0–5) | Rationale |
|-----------|-------------|-----------|
| Label reliability | 1 | Binary label claimed; method unverified |
| Data integrity | 1 | Counts/schema not inspected; files listed only |
| Provenance and rights | 1 | No dataset licence; MIT code licence ≠ data licence |
| Language/task suitability | 3 | Hindi Devanagari claimed; original vs translated unknown |
| Leakage and evaluation suitability | 1 | No split documentation; no leakage analysis |
| CPU feasibility | 4 | Plausible if corpus size moderate |
| **Weighted total** | **32/100** | Below approval threshold |

**Status: PENDING** — Potential Hindi candidate, but dataset licence, archive verification, counts, schema, labels, and provenance all require verification. Not approved.

---

## 5. Candidate C — Indic Zenodo Hindi Fake/Real archive

### 5.1 Identity and source

| Attribute | Finding |
|-----------|---------|
| Dataset name | Indic Zenodo Hindi Fake/Real archive |
| Zenodo record | 11408513 |
| Related paper | Frontiers in AI, DOI: 10.3389/frai.2025.1690616 |
| Format | Hindi ZIP plus Gujarati, Marathi, Telugu archives |
| Language | Hindi deposit-reported; paper reports five-language corpus |

### 5.2 Label quality

| Attribute | Finding |
|-----------|---------|
| Label meaning | Paper reports multi-stage annotation (trained annotators, κ=0.82, adjudication, SimHash dedup) |
| Label origin | Paper-reported; not tied to exact archive |
| Annotation process | Paper-reported; not verified against actual archive |
| Quality control | Paper-reported; not verified against actual archive |
| Label noise risk | Unknown — archive-to-paper identity unresolved |

### 5.3 Data integrity

| Attribute | Finding |
|-----------|---------|
| Record count | Conflict: paper-reported 20,493 vs local audit 20,593 files |
| Duplicates | 5,493 exact-duplicate excess despite paper deduplication description |
| Short files | Two very short files vs paper-reported 50-token minimum |
| Languages | Four languages in deposit vs five in paper |
| Local audit status | Previously audited locally; files exist at `data/raw/indic_zenodo/Hindi_F&R_News/` |

### 5.4 Rights and usage

| Attribute | Finding |
|-----------|---------|
| Dataset licence | CONFLICT — Zenodo declares CC BY 4.0; related paper states CC BY-NC 4.0 |
| Upstream content rights | News/social/image rights unresolved |
| Redistribution terms | Not established |
| Public demonstration rights | Not established |
| Local training permission | Not established |

### 5.5 Suitability for VeriNews

| Criterion | Score (0–5) | Rationale |
|-----------|-------------|-----------|
| Label reliability | 2 | Paper-reported annotation; not tied to exact archive |
| Data integrity | 1 | Count conflicts, duplicate excess, short files, language mismatch |
| Provenance and rights | 1 | Archive-to-paper identity unresolved; licence conflict |
| Language/task suitability | 3 | Hindi Devanagari claimed; original vs translated unknown |
| Leakage and evaluation suitability | 1 | No split documentation; duplicates present |
| CPU feasibility | 4 | ~20K files, CPU-feasible if approved |
| **Weighted total** | **37/100** | Below approval threshold |

**Status: PENDING / NOT APPROVED** — Material integrity and rights conflicts block use. Not approved for training or public demonstration.

---

## 6. Comparative scorecard

| Criterion (weight) | ISOT | TaLLIP | Indic Zenodo Hindi |
|-------------------|------|--------|-------------------|
| Label reliability (25) | 1/5 | 1/5 | 2/5 |
| Data integrity (20) | 2/5 | 1/5 | 1/5 |
| Provenance/rights (20) | 1/5 | 1/5 | 1/5 |
| Language/task suitability (15) | 4/5 | 3/5 | 3/5 |
| Leakage/evaluation (10) | 1/5 | 1/5 | 1/5 |
| CPU feasibility (10) | 5/5 | 4/5 | 4/5 |
| **Weighted score /100** | **41** | **32** | **37** |

All three candidates score well below any approval threshold. No candidate achieves a passing score on any single critical criterion (label reliability, provenance/rights, data integrity).

---

## 7. Final candidate decision

| Candidate | Decision | Reason |
|-----------|----------|--------|
| **ISOT** (English) | CONDITIONALLY SUITABLE | Article-format English text with full articles, but source-based label confounding and missing explicit dataset licence prevent approval. Requires: explicit dataset licence, source-aware evaluation, leakage mitigation. |
| **TaLLIP** (Hindi) | PENDING | Potential Hindi candidate with train/test `.txt` files listed, but counts, schema, labels, language quality, and dataset licence all unverified. |
| **Indic Zenodo Hindi** | PENDING / NOT APPROVED | Material integrity conflicts (count discrepancies, duplicate excess, short files, language mismatch) and rights conflict (CC BY vs CC BY-NC) block use. |

**No candidate is APPROVED FOR BASELINE TRAINING.**

---

## 8. Restrictions observed

- No dataset/archive downloaded during this task (all data was already present locally from prior sessions)
- No local raw dataset files modified
- No labels reversed or relabeled
- No preprocessing, model training, or dependency installation
- No authors/dataset maintainers/providers contacted
- No legal clearance claimed; no dataset approved without mentor approval
- No frontend/backend application functionality modified
- No push to GitHub
- Python 3.14.6 is available but was used only for read-only inspection (row counts, header inspection)

---

**P01 remains OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL. STOP: awaiting consolidated mentor review. Do not begin downloads, audits, preprocessing, model work, author contact, or another research phase automatically.**
