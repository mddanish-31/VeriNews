# VeriNews P01 — Master Requirement Evidence Matrix

**Execution label:** P01  
**Review date:** 2026-11-10  
**Scope:** Canonical P01 task inventory with requirement-to-evidence mapping. All P01 workstreams (P01-C through P01-O) documented. No dataset approved. WELFake ON HOLD.  
**Project decision:** P01 remains OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL.  
**Tracker execution ID:** Multiple execution records exist (EXEC-20261108163026383-0724DC5F through EXEC-20261110085800000-A1B2C3D4).  
**Strict rule:** This document records evidence status only. It does not approve any dataset, change any phase status, or authorize training/demonstration.  

---

## 1. Canonical P01 Task Inventory

All P01 workstreams are documented in `docs/research/`. Each workstream has an execution label, review date, and scope. No task ID is duplicated. All task IDs are canonical and preserved.

| Task ID | Title | Source File | Execution Label | Status | Completion Evidence |
|---------|-------|-------------|-----------------|--------|---------------------|
| P01-C | Dataset Selection Strategy | `docs/research/p01-c-dataset-selection-strategy.md` | P01-C | Completed documentation | Access date 2026-11-07; Stop for mentor review; do not begin P02 |
| P01-D | Rights-Cleared Dataset Discovery | `docs/research/p01-d-rights-cleared-dataset-discovery.md` | P01-D | Completed documentation | Access date 2026-11-07; Stop for mentor review; do not advance to P02 |
| P01-E | Final Dataset Feasibility Review | `docs/research/p01-e-final-dataset-feasibility-review.md` | P01-E | Completed documentation | Review date 2026-11-07; Decision: Continue research; pause ML implementation |
| P01-F | Dataset Evidence Decision Register | `docs/research/p01-f-dataset-evidence-decision-register.md` | P01-F | Completed documentation | Review date 2026-11-07; P01 OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL |
| P01-G | WELFake Evidence Verification | `docs/research/p01-g-welfake-evidence-verification.md` | P01-G | Completed documentation | Research date 2026-11-07; WELFake remains ON HOLD |
| P01-H | WELFake Evidence Access Plan | `docs/research/p01-h-welfake-primary-evidence-access-plan.md` | P01-H | Completed documentation | Plan date 2026-11-07; Planning only; no dataset access authorized |
| P01-I | WELFake Primary Evidence Findings | `docs/research/p01-i-welfake-primary-evidence-findings.md` | P01-I | Completed documentation | Research date 2026-11-07; H-01 and H-02 remain UNRESOLVED |
| P01-J | Consolidated Provenance Rights Feasibility | `docs/research/p01-j-consolidated-provenance-rights-feasibility.md` | P01-J | Completed documentation | Research date 2026-11-07; No dataset selected or approved |
| P01-K | WELFake Original Paper Evidence Review | `docs/research/p01-k-welfake-original-paper-evidence-review.md` | P01-K | Completed documentation | Review date 2026-11-08; WELFake remains ON HOLD |
| P01-L | WELFake Full-Paper Methodology Review | `docs/research/p01-l-welfake-full-paper-methodology-review.md` | P01-L | Completed documentation | Review date 2026-11-08; Full paper PDF not accessible |
| P01-M | Comprehensive Evidence Recovery | `docs/research/p01-m-comprehensive-evidence-recovery-and-candidate-review.md` | P01-M | Completed documentation | Execution label P01-M; Review date 2026-11-08 |
| P01-N | WELFake Critical Evidence Resolution | `docs/research/p01-n-welfake-critical-evidence-resolution.md` | P01-N | Completed documentation | Execution label P01-N; Review date 2026-11-08 |
| P01-N-Evidence-Matrix | WELFake Evidence Matrix | `docs/research/p01-n-welfake-evidence-matrix.md` | P01-N | Completed documentation | Execution label P01-N; Review date 2026-11-08 |
| P01-O-Comparative | Three-Dataset Comparative Evaluation | `docs/research/p01-o-three-dataset-comparative-evaluation.md` | P01-O | Completed documentation | Execution label P01-O; Review date 2026-11-08 |
| P01-O-Selection | Final Dataset Selection | `docs/research/p01-o-final-dataset-selection.md` | P01-O | Completed documentation | Execution label P01-O; Review date 2026-11-08 |
| P01-O-Language | WELFake Language Distribution Audit | `docs/research/p01-o-welfake-language-distribution-audit.md` | P01-O | Completed documentation | Execution label P01-O; Review date 2026-11-08 |
| P01-O-Indic-Zenodo | Indic Zenodo Hindi Final Audit | `docs/research/p01-indic-zenodo-final-dataset-audit.md` | P01-O | Completed documentation | Execution label P01-O; Review date 2026-11-08 |

**No duplicate task IDs exist.** All workstream IDs are unique. P01-O contains multiple workstreams sharing the same execution label prefix but distinct report titles.

---

## 2. Requirement-to-Evidence Matrix

The following table maps each P01 requirement to its evidence status. Evidence status vocabulary follows P01-N: VERIFIED / PARTIALLY VERIFIED / UNRESOLVED / PAPER-REPORTED / REPOSITORY-REPORTED.

| Requirement ID | Requirement | Source File(s) | Evidence Status | Confidence | Canonical Blocker | Notes |
|----------------|-------------|----------------|-----------------|------------|-------------------|-------|
| P01-R1 | Dataset identification (WELFake) | p01-k, p01-g | VERIFIED as Zenodo record 4561253 | High | — | Zenodo record fully accessible as metadata only |
| P01-R2 | Dataset identification (ISOT) | p01-c, p01-e | VERIFIED as UVic-hosted dataset | High | — | UVic README verified |
| P01-R3 | Dataset identification (TaLLIP) | p01-c, p01-d | REPOSITORY-REPORTED | Medium | — | GitHub repository accessible; archive not fetched |
| P01-R4 | Dataset identification (Indic Zenodo Hindi) | p01-indic-zenodo-*, p01-o-final-dataset-selection | VERIFIED as Zenodo deposit | High | — | Zenodo record accessible; archive contents locally audited |
| P01-R5 | WELFake label mapping (H-01) | p01-g, p01-h, p01-i, p01-n, B-01 report | CLOSED — ACCEPTED WITH DOCUMENTED LIMITATIONS | High (Empirical & Documentary) | B-01 | Closed per owner authorization (0=Real, 1=Fake); Zenodo note was inversion; formal mentor review pending |
| P01-R6 | WELFake record-count discrepancy (H-02) | p01-g, p01-h, p01-i, B-02 report | CLOSED — OWNER-ACCEPTED WITH DOCUMENTED RESIDUAL DISCREPANCY | High (CSV Complete & Contiguous; Residual Unexplained) | B-02 | Closed per owner auth with documented residual discrepancy; CSV complete (72,134 rows); empty-text manifest set |
| P01-R7 | WELFake source provenance Kaggle (H-04) | p01-h, p01-n, B-03 report | CLOSED — VERIFIED SOURCE IDENTITY | High (Mathematical & Sample Concordance) | B-03 | Verified as William Lifferth (2018) Kaggle competition (train.csv: 20,800 rows, 10,387 real / 10,413 fake); samples matched verbatim |
| P01-R8 | WELFake source provenance McIntire (H-04) | p01-h, p01-n, B-04 report | CLOSED — VERIFIED SOURCE IDENTITY (WITH DOCUMENTED RECORD-LEVEL AUDIT LIMITATIONS) | High (Mathematical & Sample Concordance) | B-04 | Verified as George McIntire (2016/2017) fake_or_real_news.csv (6,335 rows matching Table III); 6 sample records matched (5 exact title+text, 1 exact title+partial text; 100% label concordance); 7-record class inversion documented |
| P01-R9 | WELFake source provenance Reuters (H-05) | p01-h, p01-n, B-05 report | CLOSED — VERIFIED SOURCE IDENTITY (ISOT COMPONENT IDENTITY VERIFIED; REUTERS ATTRIBUTION & PREPROCESSING LIMITATIONS DOCUMENTED) | Highest (Full-Corpus Record Concordance) | B-05 | Verified as ISOT Fake News Dataset (Univ. of Victoria, Ahmed et al. 2018); 44,898 RFC-4180 logical rows (21,417 Real, 23,481 Fake) matching Table III with 0 discrepancy; 44,898 / 44,898 records matched (100.0000% coverage, 0 unmatched, 100% label concordance); Reuters is upstream author of True.csv only |
| P01-R10 | WELFake source provenance BuzzFeed Political (H-05) | p01-n, B-06 report | PARTIALLY RESOLVED — CANDIDATE SOURCE IDENTIFIED; FULL RECORD-LEVEL PROVENANCE NOT VERIFIED | Medium (Candidate Source Identified; Full Row-Level Provenance Not Verified) | B-06 | Candidate identified as Horne & Adali (2017) fakenewsdata1 BuzzFeed Political News Data (derived from Craig Silverman 2016); Table III reports 101 rows (53 Real, 48 Fake) vs 91-row derivative unexplained; arithmetic remainder qualified; full row-level provenance not verified |
| P01-R11 | WELFake upstream content rights (H-05) | p01-g, p01-h, p01-n, B-07 report | UNRESOLVED — UPSTREAM PROPRIETARY CONTENT RIGHTS NOT CONVEYED BY COMPILATION LICENCE; COMMERCIAL REUSE & REDISTRIBUTION SCOPE UNRESOLVED | N/A | B-07 | Investigated in B-07 report; compilation CC BY 4.0 does not convey underlying commercial news copyright (Reuters, NYT, etc.); secondary claim of explicit ISOT non-commercial restriction is unverified from primary source; copyright implications depend on jurisdiction/use; commercial reuse and raw redistribution scope unresolved |
| P01-R12 | WELFake dataset-specific rights | p01-g, p01-f, B-07 report | PARTIALLY VERIFIED | High (as declaration), Low (as rights coverage) | — | Zenodo declares CC BY 4.0; scope covers compilation/curation metadata only; underlying article rights unresolved (B-07) |
| P01-R13 | ISOT technical suitability | p01-c, p01-d, p01-e | VERIFIED | Medium | — | UVic README verified; source-based label confounding |
| P01-R14 | ISOT licence | p01-c, p01-d, B-07 report | UNRESOLVED | N/A | B-10 | UVic portal provides downloads without explicit reuse licence; claimed non-commercial restriction is unverified from primary source |
| P01-R15 | TaLLIP technical suitability | p01-c, p01-d | REPOSITORY-REPORTED | Medium | — | Repository lists English/Hindi train/test files; actual schema/counts unverified |
| P01-R16 | TaLLIP licence | p01-c, p01-d | UNRESOLVED | N/A | B-11 | MIT repository licence is not established as dataset licence |
| P01-R17 | Indic Zenodo Hindi technical suitability | p01-indic-zenodo-*, p01-o-final-dataset-selection | PARTIALLY VERIFIED | Medium | B-09 | 20,593 files locally audited; archive-to-paper identity unresolved |
| P01-R18 | Indic Zenodo Hindi licence conflict | p01-indic-zenodo-*, p01-d, B-08 report | UNRESOLVED — CONFLICTING LICENCE EVIDENCE; PRECEDENCE AND SCOPE NOT ESTABLISHED | N/A | B-08 | Investigated in B-08 report; Zenodo metadata Record 11408513 declares CC BY 4.0 while 2025 Frontiers paper declares CC BY-NC 4.0; precedence and scope not established; 0 of 20,593 files have licence headers; third-party news copyright unresolved |
| P01-R19 | IFND technical suitability | p01-d, p01-e | PARTIALLY VERIFIED | Low | — | Repository lists CSV fields; full article bodies unverified |
| P01-R20 | IFND licence | p01-d | UNRESOLVED | N/A | B-12 | README says research purposes only; no formal dataset licence located |
| P01-R21 | HinFakeNews availability | p01-d | UNKNOWN | N/A | — | No public archive accessible in reviewed sources |
| P01-R22 | BFNK suitability | p01-d | EXCLUDED | N/A | — | Noisy social posts/forwards; not clean Devanagari article corpus |

---

## 3. Canonical Blocker Register (B-01 through B-12)

The active canonical blocker register for P01 contains exactly 12 unique canonical blockers across all candidate datasets. All 12 canonical IDs are authoritative and must be resolved before any dataset can be considered for mentor approval:

| ID | Canonical Blocker | Dataset | Required Status | Requirement Mapping | Primary Evidence Question |
|---|---|---|---|---|---|
| B-01 | WELFake label semantics (H-01) | WELFake | CLOSED — ACCEPTED WITH DOCUMENTED LIMITATIONS | P01-R5 | Closed per owner authorization (0=Real, 1=Fake); 6 limitations documented; mentor review pending |
| B-02 | WELFake record-count discrepancy (H-02) | WELFake | CLOSED — OWNER-ACCEPTED WITH DOCUMENTED RESIDUAL DISCREPANCY | P01-R6 | Closed per owner auth; CSV complete (72,134 rows); empty-text policy set (783); 5,964 residual documented |
| B-03 | WELFake Kaggle source identity (H-04) | WELFake | CLOSED — VERIFIED SOURCE IDENTITY | P01-R7 | Verified as William Lifferth (2018) Kaggle competition (20,800 rows: 10,387 real / 10,413 fake; sample text & labels matched) |
| B-04 | WELFake McIntire source identity (H-04) | WELFake | CLOSED — VERIFIED SOURCE IDENTITY (WITH DOCUMENTED RECORD-LEVEL AUDIT LIMITATIONS) | P01-R8 | Verified as George McIntire (2016/2017) fake_or_real_news.csv (6,335 rows matching Table III; 6 sample records tested with 100% label concordance; 7-row class inversion noted) |
| B-05 | WELFake Reuters source identity (H-05) | WELFake | CLOSED — VERIFIED SOURCE IDENTITY (ISOT COMPONENT IDENTITY VERIFIED; REUTERS ATTRIBUTION & PREPROCESSING LIMITATIONS DOCUMENTED) | P01-R9 | Verified as ISOT Fake News Dataset (Univ. of Victoria, Ahmed et al. 2018; 44,898 logical rows: 21,417 Real / 23,481 Fake matching Table III with 0 discrepancy; 44,898 / 44,898 matched 100.0000% with 0 unmatched) |
| B-06 | WELFake BuzzFeed Political source identity (H-05) | WELFake | PARTIALLY RESOLVED — CANDIDATE SOURCE IDENTIFIED; FULL RECORD-LEVEL PROVENANCE NOT VERIFIED | P01-R10 | Candidate identified as Horne & Adali (2017) fakenewsdata1 BuzzFeed Political News Data (derived from Craig Silverman 2016); Table III reports 101 rows (53 Real / 48 Fake) vs 91-row derivative unexplained; arithmetic remainder qualified; full record-level provenance not verified (101 records untested) |
| B-07 | WELFake upstream content rights (H-05) | WELFake | UNRESOLVED — UPSTREAM PROPRIETARY CONTENT RIGHTS NOT CONVEYED BY COMPILATION LICENCE; COMMERCIAL REUSE & REDISTRIBUTION SCOPE UNRESOLVED | P01-R11 | Investigated in B-07 report; compilation CC BY 4.0 does not cover proprietary news text (Reuters, NYT, Politico); claimed explicit ISOT non-commercial restriction is unverified from primary source; raw redistribution & commercial SaaS scope unresolved |
| B-08 | Indic Zenodo Hindi licence conflict | Indic Zenodo Hindi | UNRESOLVED — CONFLICTING LICENCE EVIDENCE; PRECEDENCE AND SCOPE NOT ESTABLISHED | P01-R18 | Investigated in B-08 report; Zenodo metadata CC BY 4.0 conflicts with 2025 Frontiers paper CC BY-NC 4.0; precedence and scope not established; 0 of 20,593 files have licence headers; third-party news rights unresolved |
| B-09 | Indic Zenodo Hindi archive-to-paper identity | Indic Zenodo Hindi | UNRESOLVED | P01-R17 | Explanation of 20,593 vs 20,493 count discrepancy and 5,493 duplicate excess |
| B-10 | ISOT dataset licence | ISOT | UNRESOLVED | P01-R14 | Explicit dataset reuse licence from UVic |
| B-11 | TaLLIP dataset licence | TaLLIP | UNRESOLVED | P01-R16 | Explicit dataset licence terms (MIT code licence is not dataset licence) |
| B-12 | IFND dataset licence | IFND | UNRESOLVED | P01-R20 | Explicit dataset licence or redistribution grant (README research note is not licence) |

*Active Canonical Blocker Summary: exactly 12 unique canonical blockers (5 CLOSED [B-01 accepted with limitations, B-02 owner-accepted with residual discrepancy, B-03 verified source identity, B-04 verified source identity with limitations, B-05 verified source identity with limitations], 1 PARTIALLY RESOLVED [B-06 candidate source identified; full record-level provenance not verified], 6 UNRESOLVED [B-07, B-08, B-09, B-10, B-11, B-12]).*

---

## 4. P01 Acceptance Criteria vs. Current State

| Acceptance Criterion (from P01-E, Section 6) | Current State | Evidence Source | Status |
|---------------------------------------------|---------------|-----------------|--------|
| Scope and format: article-level text in English/Hindi | Partially met | WELFake (English), ISOT (English), TaLLIP (English+Hindi), Indic Zenodo Hindi (Hindi) | PARTIAL |
| Stable provenance: documented collection procedure | UNRESOLVED | All datasets: source-to-row lineage not established | NOT MET |
| Operational label semantics | UNRESOLVED | WELFake: label mapping conflict; ISOT: source-group labels; TaLLIP: undocumented; Indic Zenodo: label correctness unverified | NOT MET |
| Integrity and suitability audit | PARTIALLY VERIFIED | Indic Zenodo Hindi: file-level audit complete; WELFake: CSV record count verified; others: not locally audited | PARTIAL |
| Rights evidence | UNRESOLVED | All datasets: upstream content rights not established for any candidate | NOT MET |
| Evaluation readiness | UNRESOLVED | No dataset has approved train/test split or leakage audit | NOT MET |
| Mentor approval | NOT APPROVED | No dataset has mentor approval | NOT MET |

**Overall P01 Status: OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL.** No dataset meets all acceptance criteria.

---

## 5. Datasets Not Approved — Justification Summary

| Dataset | Primary Blocker(s) | Disposition |
|---------|-------------------|-------------|
| WELFake | B-01 (closed with limitations; 0=Real, 1=Fake); B-02 (closed per owner auth with residual discrepancy); B-03 (closed: Lifferth 2018 verified); B-04 (closed: McIntire 2016 verified with audit limitations); B-05 (closed: ISOT 2018 verified with attribution limitations); B-06 (partially resolved: candidate source identified, full record-level provenance unverified); B-07 (investigated in B-07 report: upstream proprietary rights uncleared; commercial reuse & raw redistribution scope unresolved; unresolved) | ON HOLD — NOT APPROVED for training; B-06 remains partially resolved; B-07 remains unresolved |
| ISOT | B-10 (ISOT dataset licence); source-based label confounding; no official train/test split | CONDITIONALLY SUITABLE — NOT APPROVED |
| TaLLIP | B-11 (TaLLIP dataset licence); archive contents not inspected; Hindi provenance/translation unknown | PENDING — NOT APPROVED |
| Indic Zenodo Hindi | B-08 (investigated in B-08 report: CC BY 4.0 vs CC BY-NC 4.0 precedence and scope unresolved), B-09 (archive-to-paper identity: 20,593 vs 20,493 and 5,493 duplicate excess) | NOT APPROVED; research lead only |
| IFND | B-12 (IFND dataset licence: research-purpose statement only; no formal licence); paper-reported count discrepancy (56,868 vs 56,713) | NOT APPROVED as independent test; supplementary lead only |
| HinFakeNews / LFWE | No public archive accessible; licence unresolved | RESTRICTED/UNRELEASED research reference; not selected |
| BFNK | Noisy social posts; code-mixed content; not clean Devanagari article corpus | EXCLUDED from MVP |
| MM-COVID | COVID-only scope; count conflict (11,173 vs 11,565) | COVID-only transfer study; not MVP |
| FakeCovid | COVID-focused; conflicting licences (CC BY-NC 4.0 project vs CC BY 4.0 Zenodo vs CC0 GitHub) | COVID/fact-check-oriented; not MVP |
| CT-FAN | English/German four-way truth rating; not binary; not Hindi | Research benchmark only; not MVP |
| NELA-GT | Publisher-level labels; not article-level truth | Rejected for MVP task |
| Fakeddit | Reddit social posts; multimodal/distant labels; not publisher articles | Rejected for MVP task |

---

## 6. Local Verification Summary (All Read-Only)

| Dataset | Local Verification Performed | Evidence File |
|---------|------------------------------|---------------|
| WELFake CSV | 72,134 rows verified; label 0: 35,028; label 1: 37,106; 783 empty text fields | `scripts/audit_welfake_language.py`; `p01-g`, `p01-n` |
| Indic Zenodo Hindi | 10,293 fake + 10,300 real = 20,593 files; 15,100 unique hashes; 5,493 duplicates; 0 cross-folder shared hashes | `scripts/audit_indic_zenodo_files.py`; `p01-indic-zenodo-final-dataset-audit.md` |
| TaLLIP | Directory structure verified (English/Hindi Train/Test); Readme.txt read | `data/raw/tallip/TaLLIP_Dataset-main/` directory listing |
| ISOT | IFND.csv permission denied; could not locally verify | Could not inspect locally |
| IFND | CSV permission denied | Could not inspect locally |

**Note:** WELFake local CSV reading used `csv.field_size_limit(10*1024*1024)` to handle oversized quoted text fields. No dataset files were downloaded, extracted, or modified. All reads were read-only.

---

**STOP: P01 local research and documentation work is complete. No dataset is approved. P01 remains OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL.** No task may be marked Complete until mentor approval is obtained for at least one dataset and all evidence gates are resolved.


## 7. P01 Second-Pass Evidence Consolidation (Review date: 2026-11-10)

### Local CSV Verification (2026-11-10)

The local WELFake CSV (`data/raw/welfake/WELFake_Dataset.csv`) was re-read using Python standard library csv module with increased field size limit:

| Metric | Value |
|--------|-------|
| Header | ['', 'title', 'text', 'label'] |
| Total data rows | 72,134 |
| Label 0 count | 35,028 |
| Label 1 count | 37,106 |
| Empty text fields | 783 |
| Empty title fields | 558 |

**H-01 / B-01 Label Semantics:** Zenodo declares `0=Fake, 1=Real` and reports 35,028 real / 37,106 fake. Local raw counts are label 0: 35,028 and label 1: 37,106. Local counts match Zenodo's reported class totals **only under reversal** of the declared mapping (local label 0 count = 35,028 matches Zenodo's reported "real" total; local label 1 count = 37,106 matches Zenodo's reported "fake" total). A formal 100-record verification sample (`docs/research/welfake_b01_verification_sample_100.csv`) and investigation report (`docs/research/P01_B01_WELFAKE_LABEL_SEMANTICS_INVESTIGATION_REPORT.md`) established that 92% of sampled label 0 records contain authentic Reuters/NYT datelines, while label 1 contains satire (The Onion, Clickhole) and hoaxes. On 2026-11-10, following project owner review, **B-01 was formally CLOSED — ACCEPTED WITH DOCUMENTED LIMITATIONS** under the accepted mapping `0 = Real, 1 = Fake`. Six explicit limitations are documented (ambiguous/domain-level items, Breitbart in Real, B-02 count/duplicate hygiene, foreign text, pending formal mentor review). WELFake remains ON HOLD for training because B-03 through B-07 remain unresolved.

**H-02 / B-02 Record-Count Discrepancy & Empty-Text Policy:** On 2026-11-10, an investigation (`docs/research/P01_B02_WELFAKE_RECORD_COUNT_INVESTIGATION_REPORT.md`) was executed. Local CSV parsing verified exactly 72,134 logical data records with sequential indices 0 to 72,133, matching Table III of the authors' IEEE TCSS 2021 publication with 100% precision. The physical line count is 362,556 lines (due to 13,818 multiline records contributing 290,373 embedded newlines), conclusively refuting the hypothesis that 78,098 was a line count. Exactly 783 records have empty (39) or whitespace-only (744) text (782 Fake, 1 Real); a non-destructive, reversible exclusion manifest was implemented (`docs/research/welfake_b02_empty_text_exclusion_manifest.json`), yielding a clean training-ready pool of 71,351 records (49.09% Real, 50.91% Fake). Because the 5,964 difference between the Zenodo text ("78098 data entries") and dataframe ("72134 entries") leaves 5,181 entries unexplained upstream after empty text, **B-02 was closed under project owner authorization as CLOSED — OWNER-ACCEPTED WITH DOCUMENTED RESIDUAL DISCREPANCY**. This represents owner risk acceptance of the documented limitation, NOT a claim of scientific reconciliation. WELFake remains ON HOLD for training because B-03 through B-07 remain unresolved.

### Source Code Reading
- CSV header: `['', 'title', 'text', 'label']` (4 columns)
- CSV reading mode: Python standard library `csv.reader` with `field_size_limit(10 * 1024 * 1024)` to handle oversized quoted text fields
- File reading mode: text mode, UTF-8 encoding with `errors='replace'`
- No article content was read, printed, or modified beyond hash/count computation
- No dataset files were deleted, renamed, moved, or modified

---

