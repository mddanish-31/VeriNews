# VeriNews P01 — Mentor Approval Dossier

**Execution label:** P01  
**Review date:** 2026-11-10  
**Scope:** Mentor-ready approval dossier for Phase P01 — Research and Dataset Feasibility.  
**Project decision:** P01 remains OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL. No dataset is approved for local training or public portfolio demonstration.  
**Strict rule:** This dossier presents evidence for mentor review. It does not approve any dataset, authorize any training, or authorize any public demonstration. Silence does not imply approval.  

---

## 1. Executive Summary

P01 — Research and Dataset Feasibility has completed all locally executable research and documentation work. All 14 P01 workstreams (P01-C through P01-O, including sub-workstreams) have been documented. Every candidate dataset has been evaluated against the project's approval gates.

**No dataset passes all approval gates.** The following candidates remain under consideration, each with unresolved blockers:

| Dataset | Primary Blocker | Current Disposition |
|---------|----------------|---------------------|
| WELFake (English) | B-01 closed with limitations; B-02 closed with residual discrepancy; B-03, B-04, B-05 closed (source identity verified); source provenance (B-06 partially resolved; unverified at record level); upstream rights (B-07 investigated in B-07 report: unresolved; commercial/redistribution barred) | ON HOLD |
| ISOT (English) | No explicit dataset licence (B-10); source-based label confounding | CONDITIONALLY SUITABLE — NOT APPROVED |
| TaLLIP (Hindi/multilingual) | Dataset licence unverified (B-11); archive contents not inspected | PENDING — NOT APPROVED |
| Indic Zenodo Hindi (Hindi) | CC BY 4.0 vs CC BY-NC 4.0 conflict (B-08 investigated in B-08 report: unresolved precedence); archive-to-paper identity unresolved (B-09) | NOT APPROVED — research lead only |
| IFND (English) | Dataset licence unverified (B-12); count discrepancy; synthetic augmentation | NOT APPROVED as independent test |

**No dataset may be used for training or public demonstration until mentor approval is granted.**

### Canonical Blocker Register (B-01 through B-12)

The active canonical blocker register contains exactly 12 unique canonical blockers across all candidate datasets. All 12 canonical IDs are authoritative and must be resolved before mentor approval can be granted:

| ID | Canonical Blocker | Dataset | Required Status | Primary Evidence Question |
|---|---|---|---|---|
| B-01 | WELFake label semantics (H-01) | WELFake | CLOSED — ACCEPTED WITH DOCUMENTED LIMITATIONS | Closed per owner authorization (0=Real, 1=Fake); 6 limitations documented; mentor review pending |
| B-02 | WELFake record-count discrepancy (H-02) | WELFake | CLOSED — OWNER-ACCEPTED WITH DOCUMENTED RESIDUAL DISCREPANCY | Closed per owner auth; CSV complete (72,134 rows); empty-text policy set (783); 5,964 residual documented |
| B-03 | WELFake Kaggle source identity (H-04) | WELFake | CLOSED — VERIFIED SOURCE IDENTITY | Verified as William Lifferth (2018) Kaggle competition (train.csv: 20,800 rows: 10,387 real / 10,413 fake; sample records matched) |
| B-04 | WELFake McIntire source identity (H-04) | WELFake | CLOSED — VERIFIED SOURCE IDENTITY (WITH DOCUMENTED RECORD-LEVEL AUDIT LIMITATIONS) | Verified as George McIntire (2016/2017) fake_or_real_news.csv (6,335 rows matching Table III; 6 sample records tested with 100% label concordance; 7-row class inversion noted) |
| B-05 | WELFake Reuters source identity (H-05) | WELFake | CLOSED — VERIFIED SOURCE IDENTITY (ISOT COMPONENT IDENTITY VERIFIED; REUTERS ATTRIBUTION & PREPROCESSING LIMITATIONS DOCUMENTED) | Verified as ISOT Fake News Dataset (Univ. of Victoria, Ahmed et al. 2018; 44,898 logical rows: 21,417 Real / 23,481 Fake matching Table III with 0 discrepancy; 44,898 / 44,898 matched 100.0000% with 0 unmatched) |
| B-06 | WELFake BuzzFeed Political source identity (H-05) | WELFake | PARTIALLY RESOLVED — CANDIDATE SOURCE IDENTIFIED; FULL RECORD-LEVEL PROVENANCE NOT VERIFIED | Candidate identified as Horne & Adali (2017) fakenewsdata1 BuzzFeed Political News Data (derived from Craig Silverman 2016); Table III reports 101 rows (53 Real / 48 Fake) vs 91-row derivative unexplained; arithmetic remainder qualified; full record-level provenance not verified (101 records untested) |
| B-07 | WELFake upstream content rights (H-05) | WELFake | UNRESOLVED — UPSTREAM PROPRIETARY CONTENT RIGHTS NOT CONVEYED BY COMPILATION LICENCE; COMMERCIAL REUSE & REDISTRIBUTION SCOPE UNRESOLVED | Investigated in B-07 report: compilation CC BY 4.0 covers curation only; underlying news text (Reuters, NYT, Politico) is proprietary; claimed explicit ISOT non-commercial restriction is unverified from primary source; raw redistribution & commercial SaaS scope unresolved |
| B-08 | Indic Zenodo Hindi licence conflict | Indic Zenodo Hindi | UNRESOLVED — CONFLICTING LICENCE EVIDENCE; PRECEDENCE AND SCOPE NOT ESTABLISHED | Investigated in B-08 report: Zenodo metadata Record 11408513 declares CC BY 4.0 while 2025 Frontiers paper declares CC BY-NC 4.0; precedence and scope not established; 0 of 20,593 files have licence headers; third-party news rights unresolved |
| B-09 | Indic Zenodo Hindi archive-to-paper identity | Indic Zenodo Hindi | UNRESOLVED | Explanation of 20,593 vs 20,493 count discrepancy and 5,493 duplicate excess |
| B-10 | ISOT dataset licence | ISOT | UNRESOLVED | Explicit dataset reuse licence from UVic |
| B-11 | TaLLIP dataset licence | TaLLIP | UNRESOLVED | Explicit dataset licence terms (MIT code licence is not dataset licence) |
| B-12 | IFND dataset licence | IFND | UNRESOLVED | Explicit dataset licence or redistribution grant (README research note is not licence) |

*Active Canonical Blocker Summary: exactly 12 unique canonical blockers (5 CLOSED [B-01 accepted with limitations, B-02 owner-accepted with residual discrepancy, B-03 verified source identity, B-04 verified source identity with limitations, B-05 verified source identity with limitations], 1 PARTIALLY RESOLVED [B-06 candidate source identified; full record-level provenance not verified], 6 UNRESOLVED [B-07, B-08, B-09, B-10, B-11, B-12]).*

---

## 2. Candidate Decision Summary

| Dataset | Languages | Records/Files | Technical Fit | Label Reliability | Provenance | Rights Clearance | Evaluation Readiness | Disposition |
|---------|-----------|---------------|---------------|-------------------|------------|------------------|----------------------|-------------|
| WELFake | English | 72,134 | Strong article-text format | CLOSED WITH LIMITATIONS — 0=Real, 1=Fake accepted per owner authorization (B-01) | SUBSTANTIALLY RESOLVED PROVENANCE — Kaggle (B-03), McIntire (B-04), and Reuters/ISOT (B-05) verified (72,033 / 72,134 records traced; 99.86%); BuzzFeed Political candidate identified but full record-level provenance unverified (B-06) | PARTIALLY VERIFIED — Zenodo CC BY 4.0 covers compilation only; upstream article rights unresolved in B-07 report (commercial reuse & raw redistribution scope unresolved; B-07) | CLOSED WITH RESIDUAL DISCREPANCY (B-02; 72,134 complete; empty text set); no official train/test split | ON HOLD |
| ISOT | English | 44,898 | Strong article-format | UNRESOLVED — source-group labels (Reuters vs. flagged outlets) | UNRESOLVED — generic source names | UNRESOLVED — no explicit dataset licence (B-10) | UNRESOLVED — no official train/test split | CONDITIONALLY SUITABLE — NOT APPROVED |
| TaLLIP | EN/HI/ID/SW/VI/Multi | Counts unverified | CPU-feasible if moderate | UNRESOLVED — label definitions not documented | UNRESOLVED — source identity unknown | UNRESOLVED — MIT code licence ≠ dataset licence (B-11) | UNRESOLVED — no split audit | PENDING — NOT APPROVED |
| Indic Zenodo Hindi | Hindi | 20,593 files (10,293 fake + 10,300 real) | CPU-feasible | UNRESOLVED — label correctness not verified | UNRESOLVED — archive-to-paper identity unresolved (B-09) | UNRESOLVED — CC BY 4.0 vs CC BY-NC 4.0 precedence and scope unresolved in B-08 report (B-08) | UNRESOLVED — 5,493 duplicate excess; near-duplicate risk | NOT APPROVED — research lead only |
| IFND | English | 56,868 reported | Article-text format | UNRESOLVED — synthetic fake-text augmentation | UNRESOLVED — source lineage not established | UNRESOLVED — README research-only note (B-12) | UNRESOLVED — paper count discrepancy (56,868 vs 56,713) | NOT APPROVED as independent test |

**No dataset achieves full gate clearance.** Mentor must select at least one dataset for training, or explicitly reject all candidates and define alternative approach.

---

## 3. Evidence Summary by Dataset

### WELFake (English)

**Local verification:** 72,134 four-field records verified via read-only CSV inspection. Label 0: 35,028; label 1: 37,106; 783 empty text fields. All labels are 0 or 1; no parser errors with sufficient field size limit.

**Zenodo declaration:** Record 4561253 declares `Label (0 = fake and 1 = real)` and reports 35,028 real / 37,106 fake. Local counts match Zenodo's reported totals **only under reversal** (local 0 matches paper's "real" total; local 1 matches paper's "fake" total). This numerical alignment is **not** per-row label semantics evidence.

**Paper access:** IEEE Xplore page did not return readable article content. PDF endpoint returned unsupported content type. No full-text access obtained.

**Source provenance:** Zenodo names "Kaggle, McIntire, Reuters, BuzzFeed Political" generically. Three of four sources are conclusively verified: Kaggle source verified as William Lifferth's 2018 competition (20,800 records; B-03 closed); McIntire verified as George McIntire's 2016/2017 dataset (6,335 records; B-04 closed with audit limitations); Reuters verified as ISOT Fake News Dataset (Univ. of Victoria, Ahmed et al. 2018; 44,898 logical records; B-05 closed with attribution limitations). For BuzzFeed Political (B-06), candidate source is identified as Benjamin D. Horne & Sibel Adali (2017) fakenewsdata1 (derived from Craig Silverman 2016); Table III reports 101 records (53 Real, 48 Fake) while candidate derivative reports 91 rows (a 10-record difference whose exact relationship has not been established); arithmetic remainder subtraction ($72,134 - 72,033 = 101$) does not prove component exclusivity or source identity; individual record matching is untested (B-06 is PARTIALLY RESOLVED). 72,033 / 72,134 records (99.86%) are accounted for across verified components.

**Rights:** Zenodo declares CC BY 4.0. Investigated in B-07 report (`docs/research/P01_B07_WELFAKE_UPSTREAM_CONTENT_RIGHTS_INVESTIGATION_REPORT.md`): deposit-level metadata only; does not convey rights to underlying commercial news articles (Reuters, NYT, Breitbart); claimed explicit ISOT non-commercial restriction is unverified from primary source; copyright implications depend on jurisdiction and factual use; commercial reuse and raw redistribution scope unresolved (B-07 unresolved).

**Decision:** ON HOLD. B-01 through B-05 closed with documented evidence and limitations. B-06 is partially resolved (candidate source identified; full record-level provenance unverified). Do not train or demonstrate publicly until B-06, B-07 (upstream rights), and formal mentor approval are resolved.

### ISOT (English)

**Local verification:** Could not read IFND.csv locally (permission denied). UVic README reports 44,898 records (21,417 real; 23,481 fake).

**Label methodology:** "Real" items from Reuters; "Fake" items from outlets characterized as unreliable by PolitiFact/Wikipedia. Source-based label confounding; not independently verified article-level truth.

**Rights:** No explicit dataset licence found on official page or README.

**Decision:** CONDITIONALLY SUITABLE — NOT APPROVED. Requires explicit licence and source-aware evaluation design.

### TaLLIP (English/Hindi/multilingual)

**Local verification:** Readme.txt read. Directory structure verified (English/Hindi/Indonesian/Swahili/Vietnamese/Multilingual, each with Train/Test). CSV contents not opened.

**Rights:** MIT repository licence is for software, not established as dataset licence.

**Decision:** PENDING — NOT APPROVED. Requires dataset-specific licence verification and archive content inspection.

### Indic Zenodo Hindi (Hindi)

**Local verification:** 10,293 fake files + 10,300 real files = 20,593 total. 15,100 unique SHA-256 hashes. 5,493 exact duplicate files. 0 shared cross-folder hashes. 0 empty files. 0 unreadable files.

**Licence conflict:** Zenodo record declares CC BY 4.0. 2025 paper states CC BY-NC 4.0. Investigated in B-08 report (`docs/research/P01_B08_INDIC_ZENODO_HINDI_LICENCE_CONFLICT_INVESTIGATION_REPORT.md`): conflicting licence evidence; precedence and scope not established; 0 file-level licence headers across 20,593 files; third-party news rights unresolved (B-08 unresolved).

**Archive-to-paper identity:** Paper reports 20,493 articles. Local audit finds 20,593 files. Discrepancy of 100 files unexplained. Two files shorter than 50 characters despite paper-reported minimum filter (B-09).

**Decision:** NOT APPROVED — research lead only. Requires licence conflict resolution and archive-to-paper identity reconciliation.

### IFND (English)

**Local verification:** CSV present (`data/raw/ifnd/IFND.csv`, 11.6 MB) but permission denied on read attempt — could not locally verify contents.

**Licence:** README states research purposes only; no formal dataset licence located (B-12).

**Integrity / Suitability:** Paper reports 56,868 records (prior notes cite 56,713); discrepancy unexplained. Paper describes synthetic fake-text augmentation which can invalidate independent evaluation.

**Decision:** NOT APPROVED as independent test; supplementary lead only.

---

## 4. Mentor Decision Checklist

The mentor must explicitly answer each item below. No item may be marked "Approve" without primary evidence.

| Item | Question | Decision (Approve / Reject / Defer) | Conditions Required |
|------|----------|-------------------------------------|---------------------|
| M-01 | Approve WELFake for local training following owner-authorized B-01 closure (0=Real, 1=Fake), B-02 closure (residual discrepancy documented), B-03 closure (Lifferth 2018 verified), B-04 closure (McIntire 2016 verified), B-05 closure (ISOT 2018 verified), and B-06 partial resolution (BuzzFeed candidate identified, full record-level provenance unverified), despite unresolved upstream rights (B-07)? | □ Approve □ Reject □ Defer | Requires review of B-01..B-05 closure findings, B-06 limitations, plus remaining B-07 rights evidence |
| M-02 | Approve ISOT for source-proxy evaluation despite no explicit dataset licence (B-10)? | □ Approve □ Reject □ Defer | Requires explicit dataset reuse licence from UVic |
| M-03 | Approve TaLLIP for local training despite unverified dataset licence (B-11)? | □ Approve □ Reject □ Defer | Requires dataset-specific licence terms from TaLLIP authors |
| M-04 | Approve Indic Zenodo Hindi for local training despite CC BY vs CC BY-NC conflict (B-08) and archive count discrepancy (B-09)? | □ Approve □ Reject □ Defer | Requires licence precedence resolution and archive identity reconciliation |
| M-05 | Approve IFND for independent evaluation despite unverified dataset licence (B-12)? | □ Approve □ Reject □ Defer | Requires explicit dataset licence or redistribution grant |
| M-06 | Approve any dataset for public demonstration of model results? | □ Approve □ Reject □ Defer | Requires public display/model/excerpt permissions |
| M-07 | Authorize dataset download/access for any candidate? | □ Approve □ Reject □ Defer | Requires specific dataset identification and terms |
| M-08 | Authorize redistribution of any dataset or model artifact? | □ Approve □ Reject □ Defer | Requires redistribution permissions from all rights holders |
| M-09 | Approve any dataset for baseline training at all in this phase? | □ Approve □ Reject □ Defer | Requires at least one candidate to pass all gates |

**Mentor Decision Summary:**

| Decision | Check One |
|----------|-----------|
| Approve at least one dataset for training | □ |
| Reject all datasets; continue research | □ |
| Defer decision pending additional evidence | □ |

**If approved, specify dataset:** ________________________

**Approved by:** ________________________ **Date:** ___________

---

## 5. Activities That Require Explicit Mentor Approval Before Execution

| Activity | Reason Authorization Required |
|----------|------------------------------|
| Download any dataset archive or CSV | Dataset rights not established; download does not imply usage permission |
| Preprocess any dataset | Preprocessing transforms data; requires rights and label semantics approval |
| Train any model on any dataset | Training requires dataset approval and rights clearance |
| Publish model metrics from any dataset | Metrics derived from unapproved data may not be published |
| Display model results publicly | Public demonstration requires separate rights clearance |
| Display dataset excerpts or samples publicly | Excerpt display requires content rights |
| Redistribute any dataset or derivative | Redistribution requires rights from all upstream content holders |
| Contact authors or providers | Contact requires separate authorization; no contact details invented |
| Access IEEE Xplore full text | Paywall/access control requires separate authorization |
| Access Kaggle dataset | Kaggle mirror returns 404; access requires separate authorization |

---

## 6. Fields Left Intentionally Unchanged

| Field | Reason |
|-------|--------|
| Actual hours worked | Not recorded in any P01 document; no evidence available |
| Scores/ratings | P01-O scores (41/100 ISOT, 32/100 TaLLIP, 14/100 Indic Zenodo Hindi) preserved as historical desk-based assessments; not fresh audits |
| Phase status | P01 remains "In Progress" in both progress.json and roadmap.json; no phase transition attempted without mentor direction |
| Task IDs | All canonical P01 task IDs preserved; no renumbering or duplication |
| Dataset labels | All raw label values preserved; no label reversal or modification |

---

## 7. Fields That Could Not Be Completed

| Field | Reason |
|-------|--------|
| Label semantics verification | Requires primary evidence from original paper or author-maintained documentation; not accessible |
| Record-count discrepancy explanation | Requires primary evidence defining 78,098 vs 72,134 counting units; not available |
| Source provenance for Kaggle/McIntire/Reuters/BuzzFeed Political | Requires exact upstream identity; not established in public documentation |
| Upstream content rights | Requires depositor authority evidence over all upstream article text; not available |
| Licence precedence (CC BY 4.0 vs CC BY-NC 4.0) | Requires resolution by Zenodo depositor or paper authors; not available |

---

## 8. Final Dossier Conclusion

**P01 Research and Dataset Feasibility — Documentation Complete; Approval Pending**

All locally executable research and documentation work for P01 is complete. Fourteen workstreams (P01-C through P01-O) have been documented. All candidate datasets have been evaluated against the project's approval gates. No dataset passes all gates.

**The dossier is submitted for mentor review.** The mentor must:

1. Review the evidence for each candidate dataset.
2. Decide whether to approve at least one dataset for training.
3. Authorize any follow-up evidence collection (label semantics, provenance, rights).
4. Explicitly approve or reject each training/demonstration use case.

**No dataset may be used for training or public demonstration until mentor approval is explicitly granted.**

**STOP: Awaiting mentor review.** No dataset training, demonstration, or redistribution is authorized.


## 9. P01 Second-Pass Evidence Integration (Review date: 2026-11-10)

### WELFake H-01 / B-01 — Label Semantics
Local CSV read-only audit performed (2026-11-10): 72,134 records; label 0: 35,028; label 1: 37,106. Zenodo declares `0=Fake, 1=Real` and reports 35,028 real / 37,106 fake. Local counts match Zenodo's reported class totals **only under reversal**. On 2026-11-10, an empirical 100-record verification sheet (`docs/research/welfake_b01_verification_sample_100.csv`) and investigation report (`docs/research/P01_B01_WELFAKE_LABEL_SEMANTICS_INVESTIGATION_REPORT.md`) confirmed that label 0 contains authentic Reuters/NYT news, while label 1 contains satire and hoaxes, proving the Zenodo text was an author typographical inversion. Per project owner authorization, **B-01 is formally CLOSED — ACCEPTED WITH DOCUMENTED LIMITATIONS** under accepted mapping `0 = Real, 1 = Fake`. Six explicit limitations are documented (ambiguous/domain-level items, Breitbart in Real, B-02 count/duplicate hygiene, foreign text, pending formal mentor review). WELFake remains ON HOLD for training because B-03 through B-07 remain unresolved.

### WELFake H-02 — Record-Count Discrepancy & Empty-Text Policy
Local CSV parsing verified exactly 72,134 four-field records with sequential indices 0 to 72,133, matching Table III of Verma et al. (IEEE TCSS 2021) with 100% precision (`docs/research/P01_B02_WELFAKE_RECORD_COUNT_INVESTIGATION_REPORT.md`). The physical line count is 362,556 lines (13,818 multiline records, 290,373 embedded newlines), refuting the line-count hypothesis. Reversible empty-text exclusion manifest was created (`docs/research/welfake_b02_empty_text_exclusion_manifest.json`) for 783 unusable records (782 Fake, 1 Real; clean pool: 71,351 records). However, because Zenodo reports "78098 data entries" vs "72134 entries ... as per the data frame", 5,181 entries remain unexplained upstream after accounting for empty text. Per project owner authorization under Outcome B, **B-02 is formally closed as CLOSED — OWNER-ACCEPTED WITH DOCUMENTED RESIDUAL DISCREPANCY**. This represents administrative owner risk acceptance of the documented residual limitation, not a scientific claim of exact reconciliation. WELFake remains ON HOLD for training because B-03 through B-07 remain unresolved.

### WELFake H-04/H-05 — Source Provenance (B-03..B-06) and Upstream Rights (B-07)
Three named sources are conclusively verified with single-integer precision to Table III: Kaggle (William Lifferth 2018; B-03 closed), McIntire (George McIntire 2016; B-04 closed with audit limitations), and Reuters (ISOT / Ahmed et al. 2018; B-05 closed with attribution limitations). 72,033 of 72,134 records (99.86%) are accounted for across verified components. For BuzzFeed Political (B-06), candidate source is identified as Horne & Adali (2017) fakenewsdata1 / Silverman (2016); Table III reports 101 records (53 Real, 48 Fake) vs 91-row derivative unexplained; arithmetic remainder qualified; record-level matching is untested (B-06 is PARTIALLY RESOLVED). Furthermore, B-07 (upstream content rights) was investigated in `docs/research/P01_B07_WELFAKE_UPSTREAM_CONTENT_RIGHTS_INVESTIGATION_REPORT.md`: underlying news journalism is proprietary copyright text; depositor compilation CC BY 4.0 does not grant rights to third-party journalism; claimed explicit ISOT non-commercial restriction is unverified from primary source; copyright implications depend on jurisdiction and factual use; commercial reuse and raw redistribution scope remain unresolved. B-07 remains UNRESOLVED — UPSTREAM PROPRIETARY CONTENT RIGHTS NOT CONVEYED BY COMPILATION LICENCE; COMMERCIAL REUSE & REDISTRIBUTION SCOPE UNRESOLVED, keeping WELFake ON HOLD. Indic Zenodo Hindi licence conflict (B-08) was investigated in `docs/research/P01_B08_INDIC_ZENODO_HINDI_LICENCE_CONFLICT_INVESTIGATION_REPORT.md`: Zenodo metadata (CC BY 4.0, 1 version) conflicts with 2025 Frontiers paper (CC BY-NC 4.0); precedence and scope are not established; zero of 20,593 files have licence declarations; B-08 remains UNRESOLVED — CONFLICTING LICENCE EVIDENCE; PRECEDENCE AND SCOPE NOT ESTABLISHED.

### TaLLIP and IFND
- **TaLLIP:** README read. English version from Pérez-Rosas et al. (2018). MIT repository licence is not dataset licence. IIT Patna ZIP URL timed out. Dataset rights unresolved.
- **IFND:** CSV permission denied on read attempt. README says research purposes only; no formal dataset licence located. Paper reports 56,868 vs prior notes 56,713 count discrepancy.

### Updated P01 Decision Status
No dataset passes all approval gates. WELFake ON HOLD; ISOT CONDITIONALLY SUITABLE — NOT APPROVED; TaLLIP PENDING — NOT APPROVED; Indic Zenodo Hindi NOT APPROVED — research lead only; IFND NOT APPROVED as independent test.

---

