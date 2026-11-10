# VeriNews P01-M — Evidence Register Addendum

**Execution label:** P01-M  
**Review date:** 2026-11-08  
**Scope:** Structured list of resolved, partially resolved, and unresolved evidence questions from the P01-M comprehensive evidence recovery & candidate feasibility review, with references to relevant reports.  
**Companion report:** `docs/research/p01-m-comprehensive-evidence-recovery-and-candidate-review.md`  
**Status:** P01 remains **OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL**. WELFake remains **ON HOLD**. No dataset is approved. P02 is **NOT STARTED**.  
**Tracker execution ID:** EXEC-20261108163026383-0724DC5F

## 1. Purpose

This register consolidates evidence questions across all P01 workstreams (P01-M workstreams A–F) and records their resolution status. It does not rewrite or delete previous research reports. It corrects contradictions through explicit addenda only.

## 2. Resolved evidence questions

| ID | Question | Resolution | Source / report reference |
|----|----------|------------|---------------------------|
| R1 | WELFake Zenodo record metadata | VERIFIED — Zenodo record 4561253 HTML/API fully accessible; declares CC BY 4.0, 72,134 articles, 35,028 real / 37,106 fake, four sources, label mapping `0=Fake,1=Real` | Zenodo record (accessed 2026-11-08); P01-M Section 4 |
| R2 | WELFake paper bibliographic metadata | VERIFIED — DOI/Crossref confirms title, authors, venue, pages, year | Crossref / IEEE DOI metadata (accessed 2026-11-08) |
| R3 | WELFake local strict-parse counts | VERIFIED as previously audited — 72,134 four-field records; raw label `0`: 35,028; raw label `1`: 37,106 | WELFake Label and CSV Integrity Investigation; P01-M Section 5 (cited, not re-run) |
| R4 | ISOT Fake News record counts | VERIFIED via UVic official page — 44,898 total (21,417 Real / 23,481 Fake) | english-dataset-research.md (preserved) |
| R5 | LIAR record count and labels | VERIFIED via ACL 2017 paper — 12,836 short statements, 6-class PolitiFact ratings | english-dataset-research.md (preserved) |
| R6 | FakeNewsNet cannot be distributed completely | VERIFIED via FakeNewsNet README — "Complete dataset cannot be distributed because of Twitter privacy policies and news publisher copy rights" | FakeNewsNet GitHub README (accessed 2026-11-08) |
| R7 | BuzzFeed News reference repository accessible | VERIFIED as accessible — https://github.com/BuzzFeedNews/2016-10-facebook-fact-check/tree/master/data contains facebook-fact-check.csv; connection to exact WELFake component unverified | GitHub repository (accessed 2026-11-08) |
| R8 | Indic Zenodo Hindi file counts verified | VERIFIED — `scripts/audit_indic_zenodo_files.py` confirms 10,293 fake + 10,300 real = 20,593 actual article files | `scripts/audit_indic_zenodo_files.py`; `docs/research/p01-indic-zenodo-final-dataset-audit.md` |
| R9 | Indic Zenodo Hindi unique content hashes verified | VERIFIED — 7,501 fake + 7,599 real = 15,100 unique SHA-256 hashes across both folders | `scripts/audit_indic_zenodo_files.py`; `docs/research/p01-indic-zenodo-final-dataset-audit.md` |
| R10 | Indic Zenodo Hindi duplicate files verified | VERIFIED — 2,792 fake + 2,701 real = 5,493 exact duplicate files beyond first copy | `scripts/audit_indic_zenodo_files.py`; `docs/research/p01-indic-zenodo-final-dataset-audit.md` |
| R11 | Indic Zenodo Hindi cross-folder shared hashes verified | VERIFIED — 0 identical content hashes shared between Fake and Real folders | `scripts/audit_indic_zenodo_files.py`; `docs/research/p01-indic-zenodo-final-dataset-audit.md` |

## 3. Partially resolved evidence questions

| ID | Question | Resolution | Remaining gap | Source / report reference |
|----|----------|------------|---------------|---------------------------|
| PR1 | WELFake label mapping declared | PARTIALLY VERIFIED — Zenodo declares `0=Fake,1=Real`; verified as deposit statement | Not confirmed against exact CSV; local counts conflict under declared mapping | Zenodo record; P01-M Section 5.1 |
| PR2 | WELFake class totals | PARTIALLY VERIFIED — Zenodo reports 35,028 real / 37,106 fake; matches local raw counts numerically | Numerical agreement only; does not establish per-row semantics | Zenodo record; P01-M Section 5.1 |
| PR3 | WELFake record count | PARTIALLY VERIFIED — Zenodo reports 72,134 articles; matches local strict-parse count | Source of 72,134 figure not independently verified from readable paper | Zenodo record; P01-M Section 5.1 |
| PR4 | WELFake source names | PARTIALLY VERIFIED — Zenodo names Kaggle, McIntire, Reuters, BuzzFeed Political as merged sources | Per-record lineage, per-source contributions, label attribution not established | Zenodo record description; P01-M Section 6 |
| PR5 | WELFake upstream rights declaration | PARTIALLY VERIFIED — Zenodo declares CC BY 4.0 for deposit | Scope/authority over upstream articles unresolved; not project approval | Zenodo record; P01-M Section 6.5 |
| PR6 | ISOT record counts | PARTIALLY VERIFIED — UVic reports 44,898 total (21,417 Real / 23,481 Fake) | Explicit dataset licence not established; source confounding unresolved | english-dataset-research.md; P01-M Section 7.2 |
| PR7 | TaLLIP file existence | PARTIALLY VERIFIED — train/test `.txt` files listed in two repositories | Counts, schema, labels, language quality not inspected | hindi-dataset-research.md; P01-M Section 8.1 |
| PR8 | Indic Zenodo Hindi file existence | PARTIALLY VERIFIED — Hindi ZIP listed in deposit; archive inspected locally in prior audit | Archive-to-paper identity unresolved; count/duplicate/short-file/language discrepancies documented | indic-zenodo-hindi-provenance-investigation.md; P01-M Section 8.2 |
| PR9 | WELFake file checksum | VERIFIED — SHA-256 `665331424230fc452e9482c3547a6a199a2c29745ade8d236950d1d105223773`; unchanged during inspection | Only verifies file integrity, not label semantics or rights | WELFake Archive Inspection; P01-M Section 5 |

## 4. Unresolved evidence questions

| ID | Question | Why unresolved | Required primary evidence | Source / report reference |
|----|----------|----------------|---------------------------|---------------------------|
| U1 | WELFake label-to-class mapping in exact CSV | Zenodo declares `0=Fake,1=Real`; local counts match paper totals only under reversal; no readable paper passage confirms mapping | Authoritative source tying numeric encoding to exact Zenodo CSV release/version; reconciliation of count conflict | H-01 unresolved; P01-K, P01-L, P01-M Section 5.1 |
| U2 | WELFake record-count discrepancy (78,098 vs 72,134) | Zenodo states both figures; no cause established; searches for `78098`/`78 098` in available paper text found no explanation | Primary documentation defining each counting unit and reconciling them to the deposited release | H-02 unresolved; P01-I, P01-M Section 5.2 |
| U3 | WELFake label assignment method | Not documented in any accessible paper section; paper full text inaccessible | Primary paper/supplement passage specifying how Fake/Real labels were assigned (inherited vs. independently verified) | H-03 unresolved; P01-L Section 4.1; P01-M Section 4.2 |
| U4 | WELFake annotation / fact-checking / adjudication / QC | Not documented in any accessible paper section | Primary documentation of annotators, evidence standards, independent verification, agreement measures, adjudication | H-03 unresolved; P01-L Section 4.2 |
| U5 | WELFake per-record source lineage | Zenodo names four sources generically; no record-level manifest | Versioned source-to-record/partition manifest; per-source contribution counts; label-origin documentation | H-03 unresolved; P01-M Section 6 |
| U6 | WELFake filtering / cleaning / deduplication | Not documented in any accessible paper section | Primary documentation of transformations, cleaning, deduplication, record removal | H-03 unresolved; P01-L Section 4.4 |
| U7 | WELFake train/test split and leakage | Not documented in any accessible paper section | Primary documentation of split construction and source/domain-held-out evaluation | H-03 unresolved; P01-L Section 4.7 |
| U8 | WELFake supplementary files / code / reproducible mapping | Zenodo listed one CSV only; existence of supplement elsewhere unknown | Verification of whether any supplementary material resolves U1–U3 | P01-L Section 4.8; P01-M Section 4.2 |
| U9 | WELFake upstream content rights | Zenodo declares CC BY 4.0 for deposit; depositor authority over upstream articles unresolved | Rights chain for Kaggle, McIntire, Reuters, BuzzFeed Political content; depositor authority evidence | P01-M Section 6.5 |
| U10 | Kaggle exact identity (WELFake component) | Zenodo names "Kaggle" generically; mirror (saurabhshahane/fake-news-classification) inaccessible (404) | Exact dataset/owner/URL/version/licence from authorized primary documentation | P01-M Section 6.1 |
| U11 | McIntire exact identity | Zenodo names "McIntire" generically; no exact identity found | Exact dataset/owner/URL/version/licence from authorized primary documentation | P01-M Section 6.2 |
| U12 | Reuters exact identity (WELFake component) | Zenodo names "Reuters" generically; exact corpus/edition not established | Exact corpus edition, collection interval, access route, licence terms | P01-M Section 6.3 |
| U13 | BuzzFeed Political exact WELFake component | Zenodo lists BuzzFeed News reference; connection to exact WELFake component unverified | Verification that the listed BuzzFeed repository is the WELFake source component | P01-M Section 6.4 |
| U14 | ISOT dataset licence | Official page offers download; explicit dataset licence not established | Dataset-specific reuse terms from official source | P01-M Section 7.2 |
| U15 | ISOT source confounding measured | Reuters dateline correlation with Real label not measured; frequency/predictive effect unknown | Source-aware evaluation with source/event/grouped splits after rights review | P01-M Section 7.2 |
| U16 | TaLLIP counts, schema, labels | Files listed; not inspected | Local inspection of train/test `.txt` files with mentor authorization | P01-M Section 8.1 |
| U17 | TaLLIP dataset licence | Arko98 code MIT (not data); second repo no visible licence | Explicit dataset reuse terms from authors/maintainers | P01-M Section 8.1 |
| U18 | TaLLIP Hindi original vs translated | Not established | Documentation of whether Hindi content is original, translated, or mixed | P01-M Section 8.1 |
| U19 | Indic Zenodo Hindi archive-to-paper identity | Paper-reported 20,493 vs local audit 20,593 files; 5,493 duplicate excess; 2 short files; 4 vs 5 languages | Exact archive-to-paper version/manifest; annotation instructions explaining discrepancies | P01-M Section 8.2 |
| U20 | Indic Zenodo Hindi licence conflict | Zenodo CC BY 4.0 vs related paper CC BY-NC 4.0 | Resolution of which declaration applies to exact archive version | P01-M Section 8.2 |
| U21 | HinFakeNews access | No direct public download link; author contact not authorized | Legitimate access route; author/publisher documentation | P01-M Section 8.3 |
| U22 | IFND per-row language | Not specified in checked primary documentation | Archive inspection with mentor authorization | P01-M Section 8.4 |
| U23 | IFND count discrepancy | Paper 56,868 vs prior notes 56,713; augmentation reconciliation unclear | Version/count manifest; augmentation lineage | P01-M Section 8.4 |
| U24 | IFND formal dataset licence | README research-purpose only; no formal licence identified | Explicit dataset terms for training/display/metrics/redistribution | P01-M Section 8.4 |
| U25 | All candidates — evaluation design readiness | No dataset approved; no grouped/source-held-out evaluation run | Approved dataset + mentor authorization for evaluation design execution | P01-M Section 10 |

## 5. Evidence register summary

| Status | Count | Questions |
|--------|-------|-----------|
| Resolved | 7 | R1–R7 |
| Partially resolved | 9 | PR1–PR9 |
| Unresolved | 25 | U1–U25 |

**Total evidence questions tracked:** 41

## 6. Cross-references

- Main P01-M report: `docs/research/p01-m-comprehensive-evidence-recovery-and-candidate-review.md`
- P01-K: `docs/research/p01-k-welfake-original-paper-evidence-review.md`
- P01-L: `docs/research/p01-l-welfake-full-paper-methodology-review.md`
- P01-I: `docs/research/p01-i-welfake-primary-evidence-findings.md`
- P01-H: `docs/research/p01-h-welfake-primary-evidence-access-plan.md`
- P01-J: `docs/research/p01-j-consolidated-provenance-rights-feasibility.md`
- P01-G: `docs/research/p01-g-welfake-evidence-verification.md`
- P01-F: `docs/research/p01-f-dataset-evidence-decision-register.md`
- P01-E: `docs/research/p01-e-final-dataset-feasibility-review.md`
- WELFake Label and CSV Integrity Investigation: `docs/research/welfake-label-integrity-investigation.md`
- WELFake Archive Inspection: `docs/research/welfake-archive-inspection.md`
- English Dataset Research: `docs/research/english-dataset-research.md`
- Hindi Dataset Research: `docs/research/hindi-dataset-research.md`
- Dataset Comparison: `docs/research/dataset-comparison.md`
- Dataset Compatibility: `docs/research/dataset-compatibility.md`
- Phase 1 Summary: `docs/phase-1-summary.md`

## 7. Status confirmation

- **P01:** OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL
- **WELFake:** ON HOLD
- **H-01 label mapping:** UNRESOLVED
- **H-02 record-count discrepancy:** UNRESOLVED
- **H-03 construction/provenance:** UNRESOLVED
- **Local training eligibility:** NOT APPROVED
- **Public demo eligibility:** NOT APPROVED
- **P02:** NOT STARTED
- **P05–P15:** NOT STARTED

**STOP: awaiting mentor review. Do not begin downloads, audits, preprocessing, model work, author contact, or another research phase automatically.**
