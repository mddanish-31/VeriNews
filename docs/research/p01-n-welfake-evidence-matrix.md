# VeriNews P01-N — WELFake Evidence Matrix

**Execution label:** P01-N  
**Review date:** 2026-11-08  
**Scope:** Structured evidence matrix for H-01 (label semantics), H-04 (Kaggle/McIntire source identity), and H-05 (Reuters/BuzzFeed rights). Companion report: `docs/research/p01-n-welfake-critical-evidence-resolution.md`.  
**Project decision:** Continue research; no dataset selected or approved. P01 remains **OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL**. WELFake remains **ON HOLD**. No dataset is approved for local training or public portfolio demonstration. P02 is **NOT STARTED**.  
**Tracker execution ID:** EXEC-20261108173301840-A58B9344

## 1. Purpose

This register consolidates evidence questions across P01-N workstreams A–C (WELFake label semantics, Kaggle/McIntire source identity, Reuters/BuzzFeed rights) and records their resolution status with exact sources, URLs, evidence categories, confidence levels, and final status.

It does not rewrite or delete previous research reports. It corrects contradictions through explicit addenda only.

## 2. Evidence status vocabulary

| Status | Meaning |
|--------|---------|
| RESOLVED | Authoritative primary source directly checked; claim verified against exact release |
| PARTIALLY RESOLVED | Primary source statement confirmed but application/scope unresolved |
| UNRESOLVED | Not established by inspected primary evidence |

| Confidence | Meaning |
|------------|---------|
| High | Direct primary source statement, clearly applicable to the exact release |
| Medium | Primary source statement with some ambiguity or scope limitation |
| Low | Indirect, attributed, or unverified secondary claim |

## 3. H-01: WELFake label semantics

| ID | Claim / question | Source name | Exact URL | Source type | What the source establishes | What it does not establish | Access status | Confidence | Final status |
|----|-----------------|-------------|-----------|-------------|---------------------------|---------------------------|---------------|------------|--------------|
| H-01.1 | Zenodo declares `0 = Fake`, `1 = Real` | Zenodo record 4561253 | https://zenodo.org/records/4561253 | Primary source (author/depositor deposit metadata) | The deposit explicitly declares `0 = Fake`, `1 = Real` and reports 35,028 real / 37,106 fake articles | Whether the deposited CSV's label values actually follow this declaration; whether per-row semantics match | Accessible (HTML + API) | High (as declaration), Low (as CSV semantics) | PARTIALLY RESOLVED |
| H-01.2 | Zenodo class totals: 35,028 real / 37,106 fake | Zenodo record 4561253 | https://zenodo.org/records/4561253 | Primary source (deposit metadata) | The deposit reports 35,028 real and 37,106 fake articles | Whether these totals correspond to the exact deposited CSV's label values; whether they match local audit under the declared mapping | Accessible | High | PARTIALLY RESOLVED |
| H-01.3 | Local strict-parse raw counts: label `0`: 35,028; label `1`: 37,106 | WELFake Label and CSV Integrity Investigation | docs/research/welfake-label-integrity-investigation.md | Primary source (local audit, cited not re-run) | Strict parse yields 72,134 four-field records; raw label counts `0: 35,028`, `1: 37,106`; sequential index 0–72,133 | Whether local label values correspond to Zenodo's declared mapping; whether local audit reflects the exact deposited CSV | Not re-inspected in P01-N | High (as local audit result), Low (as semantic mapping) | PARTIALLY RESOLVED |
| H-01.4 | P01-K Section IV-A/Table III class counts | P01-K report | docs/research/p01-k-welfake-original-paper-evidence-review.md | Attributed via supplied notes (paper-reported) | Paper reports aggregate totals 72,134 / 35,028 real / 37,106 fake; per-source Kaggle 10,387/10,413; McIntire 3,171/3,164; Reuters 21,417/23,481; BuzzFeed Political 53/48 | Whether paper figures were independently verified from readable paper content; whether they apply to exact deposited CSV | Not re-inspected in P01-N | Low | PARTIALLY RESOLVED |
| H-01.5 | Label mapping in exact deposited CSV | Unknown | — | Unknown | Nothing | Whether `0` means Fake and `1` means Real in the exact CSV; whether local `0` count matches paper "real" or "fake" semantically | Inaccessible (paper full text unreadable; no author mapping found) | N/A | UNRESOLVED |
| H-01.6 | Label assignment method | Not documented in accessible paper | — | Unknown | Nothing | Whether labels were inherited from source datasets, manually assigned, independently fact-checked, or mixed | Inaccessible | N/A | UNRESOLVED |
| H-01.7 | Annotation / fact-checking / adjudication / QC | Not documented in accessible paper | — | Unknown | Nothing | Whether human annotators, evidence standards, independent verification, agreement measures, or adjudication were documented | Inaccessible | N/A | UNRESOLVED |

**H-01 overall status:** UNRESOLVED — Aggregate count matching is not proof of per-row label semantics. Zenodo's declared mapping conflicts with local raw counts under that mapping. No authoritative source ties numeric encoding to the exact CSV release.

## 4. H-04: Kaggle/McIntire source identity

| ID | Claim / question | Source name | Exact URL | Source type | What the source establishes | What it does not establish | Access status | Confidence | Final status |
|----|-----------------|-------------|-----------|-------------|---------------------------|---------------------------|---------------|------------|--------------|
| H-04.1 | Zenodo names "Kaggle" as one of four merged sources | Zenodo record 4561253 | https://zenodo.org/records/4561253 | Primary source (deposit metadata) | The depositor states the dataset merges "four popular news datasets (i.e. Kaggle, McIntire, Reuters, BuzzFeed Political)" | Exact dataset identity, version, URL, owner, licence, contribution, or per-record lineage | Accessible | High (as depositor statement), Low (as source identity) | PARTIALLY RESOLVED |
| H-04.2 | Kaggle exact identity (WELFake component) | Zenodo record 4561253; Kaggle mirror | https://zenodo.org/records/4561253; https://www.kaggle.com/datasets/saurabhshahane/fake-news-classification | Primary source (deposit); Secondary source (mirror) | Zenodo names "Kaggle" generically. Kaggle mirror URL returned 404; not accessible | Exact dataset/owner/URL/version/licence for the Kaggle component actually included in WELFake | Partially accessible (Zenodo yes; Kaggle mirror no) | Low | UNRESOLVED |
| H-04.3 | McIntire exact identity (WELFake component) | Zenodo record 4561253 | https://zenodo.org/records/4561253 | Primary source (deposit metadata) | Zenodo names "McIntire" generically | Exact dataset/owner/URL/version/licence for the McIntire component actually included in WELFake | Accessible (Zenodo); not found via web search | Low | UNRESOLVED |
| H-04.4 | Benjamin political news dataset (Zenodo reference) | GitHub repository rpitrust/fakenewsdata1 | https://github.com/rpitrust/fakenewsdata1 | Primary source (repository) | Repository contains Horne & Adali (2017) datasets with README granting redistribution under attribution and citation. Listed in Zenodo references as "Benjamin political news dataset" | Connection to WELFake "Kaggle" or "McIntire" component not established; listed under a different name in Zenodo references | Accessible | Medium (as repository content), Low (as WELFake component link) | PARTIALLY RESOLVED |

**H-04 overall status:** UNRESOLVED — Exact upstream identity for Kaggle and McIntire was not established from public documentation. Zenodo names them generically without version, URL, or per-record lineage.

## 5. H-05: Reuters/BuzzFeed rights

| ID | Claim / question | Source name | Exact URL | Source type | What the source establishes | What it does not establish | Access status | Confidence | Final status |
|----|-----------------|-------------|-----------|-------------|---------------------------|---------------------------|---------------|------------|--------------|
| H-05.1 | Zenodo names "Reuters" as one of four merged sources | Zenodo record 4561253 | https://zenodo.org/records/4561253 | Primary source (deposit metadata) | The depositor states the dataset merges "four popular news datasets (i.e. Kaggle, McIntire, Reuters, BuzzFeed Political)" | Exact corpus edition, collection interval, access route, licence terms, or per-record lineage | Accessible | High (as depositor statement), Low (as source identity) | PARTIALLY RESOLVED |
| H-05.2 | Reuters exact identity (WELFake component) | Zenodo record 4561253 | https://zenodo.org/records/4561253 | Primary source (deposit metadata) | Zenodo names "Reuters" generically | Exact corpus/edition, collection interval, access route, licence terms, per-record attribution | Accessible (Zenodo); not found via web search | Low | UNRESOLVED |
| H-05.3 | BuzzFeed News reference repository accessible | GitHub repository BuzzFeedNews/2016-10-facebook-fact-check | https://github.com/BuzzFeedNews/2016-10-facebook-fact-check/tree/master/data | Primary source (repository) | Repository contains `facebook-fact-check.csv`. Per Horne & Adali (2017) README characterization, BuzzFeed News used keyword search on BuzzSumo to find stories, collected body text/title, used BuzzFeed-set ground truth | Connection to exact WELFake "BuzzFeed Political" component not established; Zenodo reference list does not reconcile references to row-level components | Accessible | Medium (as repository content), Low (as WELFake component link) | PARTIALLY RESOLVED |
| H-05.4 | Zenodo CC BY 4.0 deposit licence | Zenodo record 4561253 | https://zenodo.org/records/4561253 | Primary source (deposit metadata) | The deposit declares Creative Commons Attribution 4.0 International; record marked Open | Whether depositor owns or may license all upstream news article text; whether every intended VeriNews activity is permitted | Accessible | High (as deposit declaration), Low (as upstream rights coverage) | PARTIALLY RESOLVED |
| H-05.5 | Upstream content rights (Kaggle, McIntire, Reuters, BuzzFeed Political) | Unknown | — | Unknown | Nothing | Whether depositor had authority to license each included component; whether downstream redistribution is lawful; per-source rights terms | Inaccessible (no source-specific terms found) | N/A | UNRESOLVED |
| H-05.6 | WELFake local training eligibility | Aggregate of H-01 through H-05 | — | Synthesis | Label semantics unresolved; upstream rights unresolved; depositor authority unresolved | Whether local model training on this material is permitted | Synthesis | N/A | UNRESOLVED (NOT APPROVED) |
| H-05.7 | WELFake public demo eligibility | Aggregate of H-01 through H-05 | — | Synthesis | Upstream rights and public display/model/excerpt permissions not established | Whether public portfolio demonstration of model/results/excerpts is permitted | Synthesis | N/A | UNRESOLVED (NOT APPROVED) |

**H-05 overall status:** UNRESOLVED — Zenodo's CC BY 4.0 declaration is deposit-level metadata only. No evidence establishes depositor authority over all upstream article text or permissions for any specific VeriNews activity.

## 6. Cross-reference summary

| Evidence question | H-01 | H-04 | H-05 |
|------------------|------|------|------|
| Label mapping in exact CSV | UNRESOLVED | N/A | N/A |
| Label assignment method | UNRESOLVED | N/A | N/A |
| Annotation / fact-checking / QC | UNRESOLVED | N/A | N/A |
| Kaggle exact identity | N/A | UNRESOLVED | N/A |
| McIntire exact identity | N/A | UNRESOLVED | N/A |
| Reuters exact identity | N/A | N/A | UNRESOLVED |
| BuzzFeed Political WELFake component link | N/A | N/A | PARTIALLY RESOLVED |
| Upstream content rights | N/A | N/A | UNRESOLVED |
| Zenodo CC BY 4.0 scope | N/A | N/A | PARTIALLY RESOLVED |
| Local training eligibility | N/A | N/A | UNRESOLVED (NOT APPROVED) |
| Public demo eligibility | N/A | N/A | UNRESOLVED (NOT APPROVED) |

## 7. Restrictions observed

- No dataset/archive downloaded, opened, or inspected
- No local raw dataset files opened or modified
- No labels reversed, renamed, or modified
- No preprocessing, model training, or dependency installation
- No authors/dataset maintainers/providers contacted
- No legal clearance claimed; no dataset approved
- No frontend/backend application code modified
- No commit, push, or remote change to GitHub

## 8. Sources

| Source | URL | Access date | Access result |
|--------|-----|-------------|---------------|
| Zenodo WELFake record 4561253 | https://zenodo.org/records/4561253 | 2026-11-08 | Fully accessible HTML |
| Zenodo WELFake API | https://zenodo.org/api/records/4561253 | 2026-11-08 | Fully accessible metadata |
| IEEE DOI | https://doi.org/10.1109/TCSS.2021.3068519 | 2026-11-08 | Bibliographic metadata only |
| IEEE Xplore article page | https://ieeexplore.ieee.org/document/9395133 | 2026-11-08 | No readable article text |
| Crossref-listed IEEE PDF | http://xplorestaging.ieee.org/ielx7/6570650/9502055/09395133.pdf?arnumber=9395133 | 2026-11-08 | Unsupported content type; not readable |
| Related Springer DOI | https://doi.org/10.1007/978-981-15-5619-7_18 | 2026-11-08 | Bibliographic citation only |
| BuzzFeed News reference | https://github.com/BuzzFeedNews/2016-10-facebook-fact-check/tree/master/data | 2026-11-08 | Accessible; connection to WELFake unverified |
| Benjamin Horne fakenewsdata1 | https://github.com/rpitrust/fakenewsdata1 | 2026-11-08 | Accessible; not established as WELFake component |
| Kaggle WELFake mirror | https://www.kaggle.com/datasets/saurabhshahane/fake-news-classification | 2026-11-08 | Not accessible (404) |

## Related VeriNews research

- P01-G WELFake Evidence Verification
- P01-H WELFake Evidence Access Plan
- P01-I WELFake Primary Evidence Findings
- P01-J Consolidated Dataset Provenance, Rights & Feasibility Research
- P01-K WELFake Original Paper Evidence Review
- P01-L WELFake Full-Paper Methodology Review
- P01-M Comprehensive Evidence Recovery & Candidate Review
- WELFake Label and CSV Integrity Investigation
- WELFake Archive Inspection

**STOP: awaiting mentor review. Do not begin downloads, audits, preprocessing, model work, author contact, or another research phase automatically.**
