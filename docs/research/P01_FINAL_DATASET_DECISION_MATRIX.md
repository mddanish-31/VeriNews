# VeriNews P01 — Final Dataset Decision Matrix

**Execution label:** P01  
**Review date:** 2026-11-10  
**Scope:** Final dataset decision matrix for all P01 candidate datasets. Based on P01-C through P01-O research reports.  
**Project decision:** **No dataset is approved for baseline training.** All candidates fail at least one mandatory gate.  
**Status:** P01 remains OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL.  
**Strict rule:** This matrix records decisions based on existing evidence. It does not approve any dataset. No local training or public demonstration is authorized.  

---

## 1. Decision Matrix Summary

| Dataset | Languages | Approx. Size | Technical Suitability | Label Reliability | Provenance | Rights Clearance | Evaluation Suitability | Overall Score* | Disposition |
|---------|-----------|--------------|----------------------|-------------------|------------|------------------|----------------------|----------------|-------------|
| WELFake | English | 72,134 records | Strong article-text format | CLOSED WITH LIMITATIONS (0=Real, 1=Fake per owner auth; B-01) | SUBSTANTIALLY RESOLVED (Kaggle/Lifferth B-03 closed; McIntire B-04 closed; ISOT/Reuters B-05 closed; 99.86% traced; BuzzFeed B-06 candidate identified, unverified at record level) | PARTIALLY VERIFIED (Zenodo CC BY 4.0 covers compilation only; upstream news rights unresolved in B-07 report; commercial reuse & raw redistribution scope unresolved; B-07) | CLOSED WITH RESIDUAL DISCREPANCY (72,134 complete; empty text set; B-02); no split audit | Not scored | ON HOLD — NOT APPROVED |
| ISOT | English | 44,898 records | Strong article-format | UNRESOLVED (source-group labels) | UNRESOLVED (generic source names) | UNRESOLVED (no explicit licence) | UNRESOLVED (no official split) | 41/100 | CONDITIONALLY SUITABLE — NOT APPROVED |
| TaLLIP | EN/HI/ID/SW/VI/Multi | Counts unverified | CPU-feasible if moderate | UNRESOLVED (label definitions undocumented) | UNRESOLVED (source identity unknown) | UNRESOLVED (MIT is code licence, not dataset licence) | UNRESOLVED (no split audit) | 32/100 | PENDING — NOT APPROVED |
| Indic Zenodo Hindi | Hindi | 20,593 files | CPU-feasible | UNRESOLVED (label correctness unverified) | UNRESOLVED (archive-to-paper identity unresolved) | UNRESOLVED (CC BY 4.0 vs CC BY-NC 4.0 precedence and scope unresolved in B-08 report; B-08) | UNRESOLVED (5,493 duplicates; near-duplicate risk) | Not scored | NOT APPROVED — research lead only |
| HinFakeNews / LFWE | Hindi | ~33,300 reported | Potentially strong format | UNRESOLVED (paper-reported only) | UNRESOLVED (no public archive) | UNRESOLVED (no public release) | UNRESOLVED | Not scored | RESTRICTED / UNRELEASED |
| BFNK | Hindi + code-mixed | ~26,000 reported | Poor MVP fit (noisy social posts) | UNRESOLVED | UNRESOLVED | UNRESOLVED | Not scored | Not scored | EXCLUDED |
| IFND | English | 56,868 reported | Weak article-task fit (headlines/metadata) | UNRESOLVED (paper-reported) | UNRESOLVED | Research-purpose only; no formal licence (B-12) | UNRESOLVED | Not scored | NOT APPROVED as independent test |
| MM-COVID | EN/HI/others | 11,173 reported | Mixed content (news/fact-check/social) | UNRESOLVED | UNRESOLVED | UNRESOLVED | Not scored | Not scored | RESEARCH-ONLY |
| FakeCovid | 40 languages incl. Hindi | 7,623 reported | COVID/fact-check oriented | UNRESOLVED | UNRESOLVED | CONFLICT (CC BY-NC 4.0 vs CC BY 4.0 vs CC0) | UNRESOLVED | Not scored | RESEARCH-ONLY |
| CT-FAN | EN/DE (no Hindi) | ~1,264 English training | Four-way truth rating | UNRESOLVED | UNRESOLVED | Research-only; no redistribution | UNRESOLVED | Not scored | RESEARCH BENCHMARK ONLY |
| NELA-GT | English | ~1.8M (2020-2022) | Publisher-level labels, not article truth | UNRESOLVED | UNRESOLVED | No dataset licence verified | UNRESOLVED | Not scored | REJECTED |
| Fakeddit | English | >1M reported | Reddit posts; multimodal; distant labels | UNRESOLVED | UNRESOLVED | Not verified | UNRESOLVED | Not scored | REJECTED |

*\*Scores are provisional desk-based assessments from P01-O comparative evaluation. Not fresh raw-dataset audits. No raw dataset files were opened or modified during score calculation.*

---

## 2. Per-Dataset Decision Detail

### 2.1 WELFake — English

| Attribute | Value |
|-----------|-------|
| **Final Disposition** | ON HOLD — NOT APPROVED |
| **Primary Blocker** | Upstream rights (B-07/H-05 investigated in B-07 report: commercial reuse & raw redistribution scope unresolved; unresolved); BuzzFeed Political record-level provenance (B-06/H-05 partially resolved) |
| **Resolved Blockers** | B-01 closed with limitations (0=Real, 1=Fake); B-02 closed with residual discrepancy (72,134 rows complete; empty text set); B-03 closed (William Lifferth 2018; 20,800 rows); B-04 closed with audit limitations (George McIntire 2016; 6,335 rows, 6 sample records matched 100%); B-05 closed with attribution limitations (ISOT 2018; 44,898 logical rows, 44,898 / 44,898 records matched 100.0000%) [Note: B-06 is partially resolved: candidate source identified, full record-level provenance unverified] |
| **Tertiary Blocker** | No official train/test split; deduplication/filtering across merged sources undocumented |
| **Evidence Source** | p01-g, p01-h, p01-i, p01-n, p01-f, B-01/B-02/B-03/B-04/B-05/B-06/B-07 reports |
| **Local Verification** | 72,134 four-field records verified; label 0: 35,028; label 1: 37,106; 783 empty text fields |
| **Path to Approval** | Resolution of B-06 record-level provenance, B-07 upstream rights clearance / mentor policy, and mentor sign-off |

### 2.2 ISOT — English

| Attribute | Value |
|-----------|-------|
| **Final Disposition** | CONDITIONALLY SUITABLE — NOT APPROVED |
| **Primary Blocker** | No explicit dataset licence |
| **Secondary Blocker** | Source-based label confounding (Reuters vs. flagged outlets) |
| **Tertiary Blocker** | No official train/test split documented |
| **Evidence Source** | p01-c, p01-d, p01-e |
| **Local Verification** | IFND.csv permission denied; could not locally inspect |
| **Path to Approval** | Explicit dataset reuse licence; source-aware grouped evaluation design; leakage mitigation documentation; mentor approval |

### 2.3 TaLLIP — Hindi (and Multilingual)

| Attribute | Value |
|-----------|-------|
| **Final Disposition** | PENDING — NOT APPROVED |
| **Primary Blocker** | Dataset licence unverified |
| **Secondary Blocker** | Archive contents not inspected (IIT Patna ZIP timed out) |
| **Tertiary Blocker** | Counts, schema, labels, language quality all unverified |
| **Evidence Source** | p01-c, p01-d, p01-e |
| **Local Verification** | Readme.txt read; directory structure verified; contents not opened |
| **Path to Approval** | Dataset-specific rights terms; source/annotation guidance; Hindi original/translated/mixed provenance; release/version validation |

### 2.4 Indic Zenodo Hindi — Hindi

| Attribute | Value |
|-----------|-------|
| **Final Disposition** | NOT APPROVED — research lead only |
| **Primary Blocker** | CC BY 4.0 (Zenodo) vs CC BY-NC 4.0 (paper) conflict (B-08 investigated in B-08 report: precedence and scope not established) |
| **Secondary Blocker** | Archive-to-paper identity unresolved (20,593 vs 20,493 files; B-09) |
| **Tertiary Blocker** | 5,493 duplicate excess; 2 very short files; language discrepancy (4 vs 5 languages) |
| **Evidence Source** | p01-indic-zenodo-final-dataset-audit.md; p01-indic-zenodo-hindi-provenance-investigation.md; p01-o-final-dataset-selection.md; B-08 report |
| **Local Verification** | 10,293 fake + 10,300 real = 20,593 files; 15,100 unique hashes; 5,493 duplicates; 0 shared cross-folder hashes; 0 empty/unreadable files |
| **Path to Approval** | Licence conflict resolution; archive-to-paper identity reconciliation; third-party content rights evidence |

### 2.5 HinFakeNews / LFWE — Hindi

| Attribute | Value |
|-----------|-------|
| **Final Disposition** | RESTRICTED / UNRELEASED — research reference only |
| **Primary Blocker** | No public archive accessible |
| **Secondary Blocker** | No dataset-specific licence located |
| **Evidence Source** | p01-d |
| **Local Verification** | Not accessible locally |
| **Path to Approval** | Legitimate access route; per-language counts; dataset-specific terms; mentor authorization |

### 2.6 BFNK — Hindi + code-mixed

| Attribute | Value |
|-----------|-------|
| **Final Disposition** | EXCLUDED |
| **Primary Blocker** | Noisy social posts/forwards; code-mixed content; not clean Devanagari article corpus |
| **Evidence Source** | p01-d |
| **Local Verification** | Not accessible locally |
| **Path to Approval** | Not applicable for MVP; reconsider only if project scope changes |

---

## 3. Decision Gates (All Must Pass)

| Gate | Requirement | WELFake | ISOT | TaLLIP | Indic Zenodo Hindi |
|------|-------------|---------|------|--------|--------------------|
| G1 | Article-level text in target language(s) | PASS (English) | PASS (English) | PARTIAL (English+Hindi) | PARTIAL (Hindi) |
| G2 | Stable provenance with source-to-row lineage | FAIL | FAIL | FAIL | FAIL |
| G3 | Operational label semantics documented | FAIL (conflict) | FAIL (source-group labels) | FAIL (undocumented) | FAIL (uncorrected) |
| G4 | Integrity and suitability audit | PARTIAL (CSV count verified) | NOT PERFORMED | NOT PERFORMED | PARTIAL (file-level only) |
| G5 | Rights evidence (dataset-specific + upstream) | FAIL (upstream rights unresolved) | FAIL (no explicit licence) | FAIL (no dataset licence) | FAIL (licence conflict) |
| G6 | Evaluation readiness (train/test split, leakage audit) | FAIL (no official split) | FAIL (no official split) | FAIL (no documented split) | FAIL (near-duplicate audit needed) |
| G7 | Mentor approval | NOT APPLIED | NOT APPLIED | NOT APPLIED | NOT APPLIED |

**Result: No dataset passes all gates.**

---

## 4. Cross-Language Consideration

No dataset provides a verified parallel English–Hindi corpus suitable for the VeriNews MVP. Separate English and Hindi pipelines remain the recommended architecture, but no dataset passes all gates for either language independently.

**Separate-language pipeline requirement:**
- English: Needs WELFake label resolution OR ISOT licence + source-aware evaluation
- Hindi: Needs TaLLIP licence verification OR Indic Zenodo Hindi licence conflict resolution

Neither language currently has an approved dataset.

---

## 5. Mentor Approval Required

The following decisions require explicit mentor approval before any action:

1. **Dataset selection**: No dataset is currently approved. Mentor must review evidence and approve at least one dataset for training.
2. **Dataset-specific rights**: Any use of dataset content requires explicit rights verification beyond the deposit-level licence declaration.
3. **Public demonstration**: Public display of model results or dataset excerpts requires separate rights confirmation.
4. **Training initiation**: No training may proceed until dataset approval is documented.

**Do not infer approval from any evidence in this document.** All dispositions are research decisions only, not approvals.

**STOP: Awaiting mentor review.** No dataset training or demonstration is authorized.