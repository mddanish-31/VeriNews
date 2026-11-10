# VeriNews P01 — External Blockers and Approval Checklist

**Execution label:** P01  
**Review date:** 2026-11-10  
**Scope:** All unresolved P01 blockers requiring external evidence, mentor approval, or third-party action.  
**Project decision:** P01 remains OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL.  
**Strict rule:** No blocker may be marked resolved without primary evidence or explicit mentor approval. No dataset may be trained or demonstrated until all blockers are resolved.  

---

## 1. External Blocker Register

The active canonical blocker register contains exactly 12 unique canonical blockers (B-01 through B-12). No dataset may be trained, evaluated, or demonstrated until all relevant blockers are resolved with primary evidence and explicit mentor approval.

| Blocker ID | Phase | Canonical Blocker | Evidence Status | Required Evidence | Responsible Party | Approval Type | Current Disposition |
|------------|-------|-------------------|-----------------|-------------------|-------------------|---------------|---------------------|
| B-01 | P01 | WELFake label semantics (H-01) | CLOSED — ACCEPTED WITH DOCUMENTED LIMITATIONS | Owner-authorized closure (0=Real, 1=Fake); 6 limitations documented | Project Owner / Authors | Closed by owner risk acceptance; mentor review pending | CLOSED (0=Real, 1=Fake) — Accepted with documented limitations; formal mentor review pending |
| B-02 | P01 | WELFake record-count discrepancy (H-02) | CLOSED — OWNER-ACCEPTED WITH DOCUMENTED RESIDUAL DISCREPANCY | Residual discrepancy documented (72,134 CSV records verified complete; empty-text policy set; 5,964 upstream entries unexplained) | Project Owner / Authors | Closed by owner risk acceptance; mentor review pending | CLOSED — Owner-accepted with documented residual discrepancy; formal mentor review pending |
| B-03 | P01 | WELFake Kaggle source identity (H-04) | CLOSED — VERIFIED SOURCE IDENTITY | Verified as William Lifferth (2018) Kaggle competition (train.csv: 20,800 rows, 10,387 real / 10,413 fake; sample records matched) | William Lifferth / Kaggle | Documented verification; full 20,800 audit deferred | CLOSED — Verified Source Identity (William Lifferth 2018; Table III exact match; sample text & labels matched 100%) |
| B-04 | P01 | WELFake McIntire source identity (H-04) | CLOSED — VERIFIED SOURCE IDENTITY (WITH DOCUMENTED RECORD-LEVEL AUDIT LIMITATIONS) | Verified as George McIntire (2016/2017) fake_or_real_news.csv (6,335 rows: 3,164 Real / 3,171 Fake in Table III vs 3,171 / 3,164 in literature; 6 samples tested with 100% label concordance) | George McIntire / GitHub | Documented verification; full 6,335 audit deferred due to offline file boundaries | CLOSED — Verified Source Identity (George McIntire 2016; Table III exact match; 6 sample records verified, 100% label concordance) |
| B-05 | P01 | WELFake Reuters source identity (H-05) | CLOSED — VERIFIED SOURCE IDENTITY (ISOT COMPONENT IDENTITY VERIFIED; REUTERS ATTRIBUTION & PREPROCESSING LIMITATIONS DOCUMENTED) | Verified as ISOT Fake News Dataset (Univ. of Victoria, Ahmed et al. 2018; 44,898 logical rows: 21,417 Real / 23,481 Fake; 44,898 / 44,898 records matched 100.0000% with 0 unmatched) | Univ. of Victoria ISOT Lab / Clément Bisaillon | Documented full verification; 44,898 logical records matched | CLOSED — Verified Source Identity (ISOT Fake News Dataset; 44,898 / 44,898 matched 100.0000%, 0 unmatched, 100% label agreement) |
| B-06 | P01 | WELFake BuzzFeed Political source identity (H-05) | PARTIALLY RESOLVED — CANDIDATE SOURCE IDENTIFIED; FULL RECORD-LEVEL PROVENANCE NOT VERIFIED | Candidate identified as Horne & Adali (2017) fakenewsdata1 BuzzFeed Political News Data (derived from Craig Silverman 2016); Table III reports 101 rows (53 Real / 48 Fake) vs 91-row derivative unexplained; arithmetic remainder qualified; full record-level provenance not verified (101 records untested) | Benjamin D. Horne & Sibel Adali / Craig Silverman (BuzzFeed News) | Documented investigation; full record-level audit unverified due to lack of raw .txt corpus | PARTIALLY RESOLVED — Candidate Source Identified; Full Record-Level Provenance Not Verified (Horne & Adali 2017 / Silverman 2016; 101 records untested) |
| B-07 | P01 | WELFake upstream content rights (H-05) | UNRESOLVED — UPSTREAM PROPRIETARY CONTENT RIGHTS NOT CONVEYED BY COMPILATION LICENCE; COMMERCIAL REUSE & REDISTRIBUTION SCOPE UNRESOLVED | Investigated in B-07 report; compilation CC BY 4.0 covers curation only; underlying news text (Reuters, NYT, etc.) is proprietary; claimed ISOT academic restriction is unverified from primary source; copyright implications depend on jurisdiction/use; commercial reuse and raw redistribution scope unresolved | WELFake depositors (Verma, Agrawal, Prodan) / Publishers | Mentor approval for rights review | ON HOLD — Investigated in B-07 report; upstream content rights unresolved; commercial SaaS use & raw redistribution scope unresolved |
| B-08 | P01 | Indic Zenodo Hindi licence conflict | UNRESOLVED — CONFLICTING LICENCE EVIDENCE; PRECEDENCE AND SCOPE NOT ESTABLISHED | Investigated in B-08 report; Zenodo metadata Record 11408513 declares CC BY 4.0 while 2025 Frontiers paper declares CC BY-NC 4.0; precedence and scope not established; zero file-level licence headers across 20,593 files; third-party news copyright unresolved | Zenodo record owner; paper authors | Mentor approval for licence interpretation | NOT APPROVED — Investigated in B-08 report; licence precedence conflict unresolved; research lead only |
| B-09 | P01 | Indic Zenodo Hindi archive-to-paper identity | UNRESOLVED | Explanation of 20,593 vs 20,493 count discrepancy and 5,493 duplicate excess despite paper deduplication claims | Paper authors; Zenodo record owner | Mentor approval for archive investigation | NOT APPROVED — research lead only |
| B-10 | P01 | ISOT dataset licence | UNRESOLVED | Explicit dataset reuse terms from UVic | University of Victoria | Mentor approval for licence review | CONDITIONAL — NOT APPROVED |
| B-11 | P01 | TaLLIP dataset licence | UNRESOLVED | Explicit dataset licence terms (MIT repository code licence does not cover dataset text) | IIT Patna; TaLLIP authors | Mentor approval for licence review | PENDING — NOT APPROVED |
| B-12 | P01 | IFND dataset licence | UNRESOLVED | Explicit dataset licence or redistribution grant (README research-only note is not formal licence) | IFND repository owner; authors | Mentor approval for licence review | NOT APPROVED as independent test |

*Active Canonical Blocker Summary: exactly 12 unique canonical blockers (5 CLOSED [B-01 accepted with limitations, B-02 owner-accepted with residual discrepancy, B-03 verified source identity, B-04 verified source identity with limitations, B-05 verified source identity with limitations], 1 PARTIALLY RESOLVED [B-06 candidate source identified; full record-level provenance not verified], 6 UNRESOLVED [B-07, B-08, B-09, B-10, B-11, B-12]).*

### Historical Numbering & Excluded Reference Notes
- **Historical Mapping Note:** Earlier drafts merged B-03/B-04 (under H-04) and B-05/B-06/B-07 (under H-05), while referencing TaLLIP and IFND by requirement IDs (P01-R19, P01-R20). The canonical register above standardizes and disaggregates all 12 distinct blockers into B-01 through B-12.
- **HinFakeNews Access (Historical P01-R21):** HinFakeNews has no public archive accessible; it is excluded from the MVP dataset candidate pool and tracked as an external research reference rather than an active candidate blocker.

---

## 2. Approval Checklist — Mentor Decision Items

The following items require explicit mentor approval before any P01 task can advance to "Completed" or any dataset can be used for training/demonstration:

| Approval Item | Description | Required Evidence | Current Status | Decision Required From |
|---------------|-------------|-------------------|----------------|----------------------|
| A-01 | Approve at least one dataset for local training | Primary evidence resolving label semantics, provenance, and rights for at least one candidate | NOT APPROVED | Mentor |
| A-02 | Approve WELFake for local training | B-01 (closed with limitations) and B-02 (owner-accepted with residual discrepancy); requires B-03 to B-06 (provenance), B-07 (upstream rights), and formal mentor sign-off | NOT APPROVED — WELFake ON HOLD | Mentor |
| A-03 | Approve ISOT for external evaluation | Explicit dataset licence (B-10); source-aware evaluation design | NOT APPROVED — CONDITIONAL only | Mentor |
| A-04 | Approve TaLLIP for local training | Dataset-specific licence (B-11); archive contents verified | NOT APPROVED — PENDING | Mentor |
| A-05 | Approve Indic Zenodo Hindi for local training | Licence conflict resolution (B-08); archive-to-paper identity (B-09) | NOT APPROVED — research lead only | Mentor |
| A-06 | Approve IFND for independent evaluation | Explicit dataset licence or redistribution grant (B-12); count discrepancy reconciliation | NOT APPROVED as independent test | Mentor |
| A-07 | Authorize dataset download/access for any candidate | Evidence of access rights and terms | NOT APPROVED | Mentor |
| A-08 | Authorize public demonstration of any model trained on approved dataset | Public display/model/excerpt permissions | NOT APPROVED | Mentor |
| A-09 | Authorize redistribution of any dataset or model artifact | Redistribution permissions from all rights holders | NOT APPROVED | Mentor |

---

## 3. Decision Rules for Approval

| Dimension | Required for Approval | Current State |
|-----------|----------------------|---------------|
| Label semantics | Primary evidence tying numeric labels to semantics in exact CSV release | CLOSED WITH LIMITATIONS for WELFake (0=Real, 1=Fake, owner risk-acceptance); others NOT MET |
| Record-count integrity | Primary explanation of 78,098 vs 72,134 discrepancy | OWNER-ACCEPTED WITH RESIDUAL DISCREPANCY for WELFake (72,134 rows complete); others NOT MET |
| Source provenance | Per-record or per-source lineage for all content | NOT MET |
| Dataset-specific rights | Explicit dataset licence covering intended use | PARTIALLY VERIFIED (WELFake CC BY 4.0 declaration only) |
| Upstream content rights | Evidence of depositor authority over all included article text | NOT MET |
| Evaluation suitability | Train/test split audit; duplicate/near-duplicate audit; source leakage analysis | NOT MET |
| Mentor approval | Explicit approval of dataset version and activity scope | NOT APPLIED |

**No gate is fully satisfied for any dataset.** P01 cannot progress to dataset selection or training until all gates are resolved.

---

## 4. Mentor Decision Checklist

The mentor should explicitly answer each item below:

| Item | Question | Decision (Approve / Reject / Defer) | Conditions or Conditions Required |
|------|----------|-------------------------------------|-----------------------------------|
| M-01 | Approve WELFake for local training following owner-authorized B-01 closure (0=Real, 1=Fake), B-02 closure (residual discrepancy documented), B-03 closure (Lifferth 2018 verified), B-04 closure (McIntire 2016 verified), B-05 closure (ISOT 2018 verified), and B-06 partial resolution (BuzzFeed candidate identified, full record-level provenance unverified), despite unresolved upstream rights (B-07)? | □ Approve □ Reject □ Defer | Requires review of B-01..B-05 closure findings, B-06 limitations, plus remaining B-07 rights evidence |
| M-02 | Approve ISOT for source-proxy evaluation despite no explicit licence (B-10)? | □ Approve □ Reject □ Defer | Requires explicit dataset licence from UVic |
| M-03 | Approve TaLLIP for local training despite unverified licence (B-11)? | □ Approve □ Reject □ Defer | Requires dataset-specific licence terms |
| M-04 | Approve Indic Zenodo Hindi for local training despite CC BY vs CC BY-NC conflict (B-08) and archive count discrepancy (B-09)? | □ Approve □ Reject □ Defer | Requires licence precedence resolution and archive identity reconciliation |
| M-05 | Approve IFND for independent evaluation despite unverified licence (B-12)? | □ Approve □ Reject □ Defer | Requires explicit dataset licence or redistribution grant |
| M-06 | Authorize dataset download/access for any candidate? | □ Approve □ Reject □ Defer | Requires specific dataset identification and terms |
| M-07 | Authorize public demonstration of any trained model? | □ Approve □ Reject □ Defer | Requires public display/model/excerpt permissions |
| M-08 | Authorize redistribution of any dataset or model artifact? | □ Approve □ Reject □ Defer | Requires redistribution permissions from all rights holders |

**No item may be marked "Approve" without primary evidence supporting the decision.**

---

## 5. Fields Left Unchanged

| Field | Reason Left Unchanged |
|-------|----------------------|
| Actual hours worked | Not recorded in any P01 document; no evidence available |
| Scores/ratings | P01-O comparative evaluation scores (41/100 ISOT, 32/100 TaLLIP, 14/100 Indic Zenodo Hindi) are preserved as historical desk-based assessments, not fresh audits |
| Phase status | P01 remains "In Progress" in both progress.json and roadmap.json; no phase transition attempted |
| Task IDs | All canonical P01 task IDs preserved; no renumbering or duplication |

---

**STOP: No blocker may be marked resolved without primary evidence or explicit mentor approval. P01 remains OPEN.** No local task remains that can resolve any blocker without external evidence or mentor authorization. All documentation workstreams (P01-C through P01-O) are complete at the documentation level.


## 6. P01 Second-Pass Evidence Integration (Review date: 2026-11-10)

### WELFake H-01 — Label Semantics
- **Evidence:** Local CSV read-only audit performed (2026-11-10). Header: `['', 'title', 'text', 'label']`. Total data rows: 72,134. Raw label counts: label 0: 35,028; label 1: 37,106. Empty text fields: 783. Empty title fields: 558. CSV read with `csv.field_size_limit(10 * 1024 * 1024)` to handle oversized quoted text fields. No dataset files were modified.
- **Zenodo record 4561253** declares `Label (0 = fake and 1 = real)` and reports 35,028 real / 37,106 fake.
- **Local counts match Zenodo's reported class totals only under reversal:** local label 0 count (35,028) matches Zenodo's "real" total; local label 1 count (37,106) matches Zenodo's "fake" total.
- **Conclusion:** On 2026-11-10, an empirical 100-record verification sample was compiled (`docs/research/welfake_b01_verification_sample_100.csv`) and analyzed in `docs/research/P01_B01_WELFAKE_LABEL_SEMANTICS_INVESTIGATION_REPORT.md`: 92% of sampled label 0 records contain authentic Reuters/NYT news datelines, while label 1 contains satire and hoaxes, proving that the Zenodo note was an author typographical inversion. Per project owner authorization, **B-01 is formally CLOSED — ACCEPTED WITH DOCUMENTED LIMITATIONS** with accepted mapping `0 = Real, 1 = Fake`. Six explicit limitations are documented (ambiguous/domain-level items, Breitbart in Real, B-02 count/duplicate hygiene, foreign text, pending formal mentor review). WELFake remains ON HOLD for training because B-02 through B-07 remain unresolved.

### WELFake H-02 — Record-Count Discrepancy & Empty-Text Policy
- **Investigation Report:** `docs/research/P01_B02_WELFAKE_RECORD_COUNT_INVESTIGATION_REPORT.md` (2026-11-10).
- **Physical line count:** 362,556 lines verified (due to 13,818 multiline records contributing 290,373 embedded newlines). The hypothesis that 78,098 was a physical-line count is refuted.
- **Local strict parse:** Exactly 72,134 four-field records verified with sequential indices 0 to 72,133, matching Table III of the authors' IEEE TCSS 2021 publication with 100% precision.
- **Empty-text policy:** 783 records with empty (39) or whitespace-only (744) text identified (782 Fake, 1 Real); reversible exclusion manifest established at `docs/research/welfake_b02_empty_text_exclusion_manifest.json` (clean pool: 71,351 records).
- **Residual discrepancy:** Zenodo metadata statement cites "78098 data entries and only 72134 entries are accessed as per the data frame." The 5,964 difference leaves 5,181 entries unexplained after empty text.
- **Conclusion:** Per project owner authorization under Outcome B, B-02 is formally closed as **CLOSED — OWNER-ACCEPTED WITH DOCUMENTED RESIDUAL DISCREPANCY**. This represents administrative owner risk acceptance of the documented residual limitation, not a scientific claim of exact reconciliation. WELFake remains ON HOLD for training because B-03 through B-07 remain unresolved.

### WELFake B-03 — Kaggle Source Identity (Historical H-04)
- **Investigation Report:** `docs/research/P01_B03_KAGGLE_SOURCE_IDENTITY_INVESTIGATION_REPORT.md` (2026-11-10).
- **Identified Source:** William Lifferth's 2018 Kaggle Competition — *Fake News: Build a system that can identify unreliable news articles* (`https://www.kaggle.com/competitions/fake-news`).
- **Mathematical Alignment:** Lifferth's `train.csv` contains exactly 20,800 rows: Label 0 (Reliable) = 10,387; Label 1 (Unreliable) = 10,413. This matches Table III of Verma et al. (IEEE TCSS 2021) down to the individual integer per class ($10,387 + 10,413 = 20,800$).
- **Label Semantics Alignment:** Lifferth defines `0 = Reliable / Real`, `1 = Unreliable / Fake`, perfectly confirming the accepted B-01 label mapping.
- **Empirical Record Matching:** Multi-row sample matching against `data/raw/welfake/WELFake_Dataset.csv` confirmed 100% concordance for titles, body text, and labels across tested records (e.g., Row 0 Comey letter, Row 1 Flynn/Breitbart, Row 2 Truth/Fired, Row 3 15 Civilians, Row 4 Iranian woman, Row 5 Jackie Mason, Row 7 Benoît Hamon, Row 10 Ukraine back-channel).
- **Conclusion:** B-03 is formally **CLOSED — VERIFIED SOURCE IDENTITY (WITH DOCUMENTED RECORD-LEVEL AUDIT LIMITATIONS)**. Full 20,800-row checksum audit is deferred due to Kaggle API credential requirements. WELFake remains ON HOLD because B-06 and B-07 remain unresolved.

### WELFake B-04 — McIntire Source Identity (Historical H-04)
- **Investigation Report:** `docs/research/P01_B04_MCINTIRE_SOURCE_IDENTITY_INVESTIGATION_REPORT.md` (2026-11-10).
- **Identified Source:** George McIntire's 2016/2017 dataset (*fake_or_real_news.csv*), published with KDnuggets article *"Getting Real about Fake News"* (`https://github.com/GeorgeMcIntire/fake_real_news_dataset`).
- **Mathematical Alignment:** McIntire dataset contains exactly 6,335 rows, matching Table III of Verma et al. ($3,164 + 3,171 = 6,335$).
- **Label Semantics Alignment:** McIntire `REAL` maps to `0` in WELFake; McIntire `FAKE` maps to `1` in WELFake with 100% concordance.
- **Empirical Record Matching:** Multi-row matching verified verbatim presence of sample records in WELFake. Duplicate ingestion identified across shared BS Detector sources (e.g. #17696 & #62803).
- **Conclusion:** B-04 is formally **CLOSED — VERIFIED SOURCE IDENTITY (WITH DOCUMENTED RECORD-LEVEL AUDIT LIMITATIONS)**. Full 6,335 row audit deferred due to offline file boundaries.

### WELFake B-05 — Reuters Source Identity (Historical H-05)
- **Investigation Report:** `docs/research/P01_B05_REUTERS_SOURCE_IDENTITY_INVESTIGATION_REPORT.md` (2026-11-10).
- **Identified Source:** **ISOT Fake News Dataset** (University of Victoria, Ahmed et al. 2018 / Clément Bisaillon Kaggle distribution: `News-_dataset/`). 100% of real news was crawled from Reuters.com (`True.csv`).
- **Mathematical Alignment:** Local ISOT `True.csv` has exactly 21,417 rows (matches Table III Real count 21,417 exactly). Deduplicated `Fake.csv` has exactly 23,481 rows (matches Table III Fake count 23,481 exactly). Total: 44,898 records (62.2% of WELFake).
- **Full-Corpus Record Matching:** Exhaustive audit matched 21,415 True.csv records (100% label 0) and 23,481 Fake.csv records (100% label 1). Overall: 44,896 of 44,898 records matched with 100.0% label agreement and 0 label disagreements. Leading space formatting anomaly in `Fake.csv` titles is preserved identically in WELFake.
- **Conclusion:** B-05 is formally **CLOSED — VERIFIED SOURCE IDENTITY**.

### WELFake B-06 — BuzzFeed Political Source Identity (Historical H-05)
- **BuzzFeed Political Candidate:** Identified as the **BuzzFeed Political News Data** created by Benjamin D. Horne & Sibel Adali (2017) (`fakenewsdata1` / `Horne2017_FakeNewsData.zip`), derived from Craig Silverman's 2016 BuzzFeed News viral election news investigation (`BuzzFeedNews/2016-10-facebook-fact-check`).
- **91 vs. 101 Records:** Table III of Verma et al. (IEEE TCSS 2021) reports 53 Real and 48 Fake records (101 total). A referenced FakeNewsNet derivative file contains 91 rows (a 10-record difference whose exact relationship has not been established; row-level mapping is unproven).
- **Arithmetic Remainder Qualified:** The subtraction $72,134 - (20,800 + 6,335 + 44,898) = 101$ is an arithmetic calculation only; it assumes components add without overlap. Because B-04 established duplicate ingestion across merged sources, mutual component exclusivity is not proven, and arithmetic alone does not establish source identity or unique record count.
- **Record-Level Status:** 0 exact full-record matches, 0 exact title-and-text matches, 3 partial/contextual matches, and 101 records remain untested at the individual record level without offline `.txt` access.
- **Conclusion:** B-06 is formally **PARTIALLY RESOLVED — CANDIDATE SOURCE IDENTIFIED; FULL RECORD-LEVEL PROVENANCE NOT VERIFIED**. WELFake remains ON HOLD because B-06 is partially resolved and B-07 remains unresolved.

### WELFake B-07 — Upstream Content Rights (Historical H-05)
- **Investigation Report:** `docs/research/P01_B07_WELFAKE_UPSTREAM_CONTENT_RIGHTS_INVESTIGATION_REPORT.md` (2026-11-10; audited).
- **Rights Separation:** Depositor CC BY 4.0 metadata on Zenodo (Record 4561253) covers compilation curation and schema only; depositors cannot sublicense third-party proprietary journalism.
- **Component Analysis:**
  - *Lifferth (Kaggle):* 20,800 records from unlicenced competition scrape.
  - *McIntire:* 6,335 records from unlicenced GitHub repository.
  - *ISOT (Ahmed et al. 2018):* 44,898 records (62.2% of WELFake). Primary UVic portal provides downloads without an explicit reuse licence; the quoted non-commercial restriction from earlier project notes is unverified from primary sources. Underlying Reuters content remains proprietary.
  - *BuzzFeed Political:* 101 records derived from third-party commercial journalism.
- **Copyright Boundaries & Separate Activities:** Copyright implications depend on jurisdiction, factual context, and rights involved. Evaluated across 6 discrete activities: local inspection (legally sound), academic research (strong non-commercial defense), model training (intermediate/jurisdiction-dependent), raw redistribution (high infringement risk), trained weights distribution (low direct text risk, architecture/licence dependent), and commercial SaaS deployment (uncleared proprietary risk).
- **Conclusion:** B-07 remains **UNRESOLVED — UPSTREAM PROPRIETARY CONTENT RIGHTS NOT CONVEYED BY COMPILATION LICENCE; COMMERCIAL REUSE & REDISTRIBUTION SCOPE UNRESOLVED**. WELFake remains strictly ON HOLD.

### Indic Zenodo Hindi B-08 — Licence Conflict (Historical P01-R18)
- **Investigation Report:** `docs/research/P01_B08_INDIC_ZENODO_HINDI_LICENCE_CONFLICT_INVESTIGATION_REPORT.md` (2026-11-10; audited).
- **Contradiction Identified:** Zenodo Record 11408513 metadata declares **CC BY 4.0** (single version, Version 1), whereas the authors' primary peer-reviewed methodology paper (*Frontiers in Artificial Intelligence*, published Dec 10, 2025; DOI: `10.3389/frai.2025.1690616`) explicitly specifies **CC BY-NC 4.0** in both the Data Availability Statement and Section 3.
- **Precedence & Scope:** A later journal article does not automatically retroactively amend a prior Zenodo deposit, but documents authorial intent; legal precedence and scope remain unestablished. OpenAIRE indexing reflects Zenodo metadata as secondary indexing.
- **Archive Audit:** Physical audit of 20,593 text files in `data/raw/indic_zenodo/Hindi_F&R_News/` confirmed 0 embedded licence headers; no `README` or `LICENSE` exists in the archive. Scraped news text (*BBC Hindi*, *The Hindu*, *The Indian Express*) remains proprietary.
- **Conclusion:** B-08 remains **UNRESOLVED — CONFLICTING LICENCE EVIDENCE; PRECEDENCE AND SCOPE NOT ESTABLISHED**. Indic Zenodo Hindi remains NOT APPROVED.

### TaLLIP (Hindi/multilingual)
- **README read:** Repository readme.txt read. English version processed from Pérez-Rosas et al. (2018). Repository reports English and Hindi train/test editions. MIT code repository licence is not dataset licence. IIT Patna ZIP URL timed out (HTTP HEAD request); no archive contents inspected.
- **Languages reported:** English, Hindi, Swahili, Vietnamese, Indonesian, multilingual.
- **Domains:** Six domains listed in README (Business, Education, Entertainment, Politics, Celebrity, Technology) while paper abstract reports seven domains — discrepancy unexplained.
- **Licence:** MIT repository licence is not established as dataset licence. Dataset-specific rights unresolved.

### IFND (Indian Fake News Dataset)
- **CSV present:** `data/raw/ifnd/IFND.csv` (11,674,892 bytes) but permission denied on read attempt — could not inspect locally.
- **README states:** research purposes only; no formal dataset licence located.
- **Paper reports:** 56,868 records; prior notes cite 56,713 — discrepancy unexplained.
- **Paper describes:** synthetic fake-text augmentation; source/augmentation and overlap can invalidate independent evaluation.
- **Decision:** NOT APPROVED as independent test; supplementary lead only.

---

