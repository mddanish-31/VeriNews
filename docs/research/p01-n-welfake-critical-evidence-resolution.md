# VeriNews P01-N — Critical WELFake Evidence Resolution

**Execution label:** P01-N  
**Review date:** 2026-11-08  
**Scope:** Critical evidence resolution for WELFake dataset blockers (H-01 label semantics, H-04 Kaggle/McIntire source identity, H-05 Reuters/BuzzFeed rights). Documentation-only research task. No dataset/archive was downloaded, no local raw file was opened, no audit, preprocessing, training, or evaluation was performed.  
**Project decision:** Continue research; no dataset selected or approved. P01 remains **OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL**. WELFake remains **ON HOLD**. No dataset is approved for local training or public portfolio demonstration. P02 is **NOT STARTED**.  
**Tracker execution ID:** EXEC-20261108173301840-A58B9344

## 1. Executive decision

This report consolidates the critical WELFake evidence resolution across three workstreams: H-01 (label semantics), H-04 (Kaggle/McIntire source identity), and H-05 (Reuters/BuzzFeed rights).

**Principal finding:** No new primary evidence was obtained that resolves any of the three critical evidence questions. The Zenodo record remains fully accessible as metadata only; the original IEEE paper full text remains inaccessible through all documented routes; no author-maintained repository, supplementary material, or reproducible mapping was found; and exact upstream identities for Kaggle, McIntire, and Reuters were not established from public documentation.

**Final WELFake recommendation:** **ON HOLD.** WELFake does not meet the combined task, label/provenance, dataset-integrity, dataset-licence, upstream-content-rights, evaluation-design, and mentor-approval gates for VeriNews local training and public demonstration. No dataset is approved. P01 remains open.

## 2. Source identification

| Attribute | Value |
|-----------|-------|
| Paper title | WELFake: Word Embedding over Linguistic Features for Fake News Detection |
| Paper venue | IEEE Transactions on Computational Social Systems (TCSS), 2021 |
| DOI | 10.1109/TCSS.2021.3068519 |
| Paper PDF URL | https://zenodo.org/records/4692818/files/WELFake__Word_Embedding_over_Linguistic_Features_for_Fake_News_Detection.pdf |
| Dataset record URL | https://zenodo.org/records/4561253 |
| Access date | 2026-11-08 |
| Access result | Zenodo record HTML/API fully accessible; original IEEE paper PDF not readable (`application/octet-stream`); IEEE Xplore page returned no readable article text |

## 3. Workstream A — H-01: WELFake label semantics

### 3.1 Investigation performed

The following sources were inspected for evidence on how the deposited WELFake CSV's numeric labels (`0` and `1`) map to Fake and Real:

| Source | URL | Access result | Evidence boundary |
|--------|-----|---------------|-------------------|
| Zenodo record HTML | https://zenodo.org/records/4561253 | Fully accessible — record metadata, description, rights, file listing | Dataset record metadata only; file content not accessed |
| Zenodo record API | https://zenodo.org/api/records/4561253 | Fully accessible — machine-readable metadata | Metadata only; no file-content endpoint accessed |
| IEEE DOI resolution | https://doi.org/10.1109/TCSS.2021.3068519 | Bibliographic metadata confirmed | Citation metadata; not paper text |
| IEEE Xplore article page | https://ieeexplore.ieee.org/document/9395133 | No readable article text returned | Not paper content |
| Crossref-listed IEEE PDF endpoint | http://xplorestaging.ieee.org/ielx7/6570650/9502055/09395133.pdf?arnumber=9395133 | Unsupported `application/pdf` content type; not readable | Not retrieved |
| Related Springer DOI | https://doi.org/10.1007/978-981-15-5619-7_18 | Bibliographic citation details only | Related work, not WELFake-specific evidence |

### 3.2 Findings

| Question | Finding | Evidence category |
|----------|---------|-------------------|
| Does the paper explicitly explain how Fake and Real labels were assigned? | Not verifiable from accessible primary sources. The full paper PDF was not readable, so this methodology question could not be independently assessed. | Paper inaccessible |
| Does it describe human annotation, fact-checking, adjudication or quality control? | Not verifiable from accessible primary sources. | Paper inaccessible |
| Does it identify the original source dataset behind each article? | Not verifiable from accessible primary sources. Zenodo names four sources generically (Kaggle, McIntire, Reuters, BuzzFeed Political) but gives no per-record lineage. | Zenodo deposit declaration only |
| Does it describe filtering, cleaning, deduplication or record removal? | Not verifiable from accessible primary sources. | Paper inaccessible |
| Does it explain the 72,134 dataset size and any relationship to the Zenodo 78,098 entries statement? | Not verifiable from accessible primary sources. Zenodo states both figures; no cause established. | Zenodo deposit declaration only |
| Does it establish the numeric label encoding used in the exact deposited CSV? | Not verifiable from accessible primary sources. Zenodo declares `0=Fake,1=Real` but this is deposit metadata only; not confirmed against exact CSV. | Zenodo deposit declaration only |
| Does it describe train/test splitting and possible source or duplicate leakage? | Not verifiable from accessible primary sources. | Paper inaccessible |
| Does it provide supplementary files, code or a reproducible mapping? | Not verifiable from accessible primary sources. Zenodo listed one CSV (`WELFake_Dataset.csv`); existence of supplement elsewhere unknown. | Zenodo record metadata |

### 3.3 Label mapping analysis

| Source | Statement | Status |
|--------|-----------|--------|
| Zenodo record description | “Label (0 = fake and 1 = real)” | PARTIALLY VERIFIED — verified as deposit declaration; not confirmed against exact CSV |
| Zenodo class totals | 35,028 real; 37,106 fake | VERIFIED as reported |
| Local strict audit (cited, not re-run) | Raw label `0`: 35,028; raw label `1`: 37,106 | Previously audited; raw values unchanged |
| P01-K Section IV-A/Table III | 35,028 real; 37,106 fake aggregate | Attributed via supplied notes; not independently verified from readable paper |

**Conclusion:** Local counts match Zenodo-reported totals **only under reversal** of Zenodo's declared mapping (local `0` count matches paper real total 35,028; local `1` count matches paper fake total 37,106). Count-level agreement is **not** per-row label semantics. **No labels were reversed or modified.** Raw values remain unchanged. H-01 remains **UNRESOLVED**.

## 4. Workstream B — H-04: Kaggle/McIntire source identity

### 4.1 Kaggle

| Attribute | Finding |
|-----------|---------|
| Exact upstream identity | Not established; Zenodo names only "Kaggle" generically |
| Original publisher/maintainer | Not established |
| Dataset version/date | Not established |
| Original label definitions | Not established |
| Material type (articles/headlines/claims) | Not established |
| WELFake-specific row attribution | Not established |
| Transformations/label conversions documented | Not established |
| Dataset-specific reuse terms | Not established |
| Upstream content rights | Not established |

**Access attempt:** Kaggle mirror cited in existing research (saurabhshahane/fake-news-classification) returned 404; not accessible. No exact WELFake-source identity was found from public documentation.

### 4.2 McIntire

| Attribute | Finding |
|-----------|---------|
| Exact upstream identity | Not established; Zenodo names only "McIntire" generically |
| Original publisher/maintainer | Not established |
| Dataset version/date | Not established |
| Original label definitions | Not established |
| Material type | Not established |
| WELFake-specific row attribution | Not established |
| Transformations/label conversions documented | Not established |
| Dataset-specific reuse terms | Not established |
| Upstream content rights | Not established |

**Access attempt:** Web search for "McIntire fake news dataset" returned no results. No exact McIntire dataset URL or identity was identified from public documentation. Per P01-H instructions, exact URL was not guessed.

### 4.3 Related: Benjamin political news dataset (Zenodo reference)

The Zenodo record lists "Benjamin political news dataset, https://github.com/rpitrust/fakenewsdata1" as a reference. This repository is accessible and documented:

- Repository: https://github.com/rpitrust/fakenewsdata1 (fork of BenjaminDHorne/fakenewsdata1)
- Contains: Horne2017_FakeNewsData.zip and README.txt
- Content: Two independent news datasets from Horne & Adali (2017): Buzzfeed Political News Data and Random Political News Data
- License: Copyright (c) 2017, Benjamin D. Horne & Sibel Adali; redistribution permitted with attribution and citation
- **Important:** This repository is listed in Zenodo references but **is not established as the WELFake "Kaggle" or "McIntire" component**. It is referenced as "Benjamin political news dataset" in Zenodo, not as one of the four named sources.

### 4.4 H-04 conclusion

Exact upstream identity for Kaggle and McIntire was **not established** from public documentation. Zenodo names them generically ("Kaggle", "McIntire") without version, URL, or per-record lineage. H-04 remains **UNRESOLVED**.

## 5. Workstream C — H-05: Reuters/BuzzFeed rights

### 5.1 Reuters

| Attribute | Finding |
|-----------|---------|
| Exact upstream identity | Not established; Zenodo names only "Reuters" generically |
| Original publisher/maintainer | Reuters named generically but exact corpus/edition not established |
| Dataset version/date | Not established |
| Original label definitions | Not established |
| Material type | Not established |
| WELFake-specific row attribution | Not established |
| Transformations/label conversions documented | Not established |
| Dataset-specific reuse terms | Not established |
| Upstream content rights | Not established |

**Access attempt:** Web search for Reuters fake news dataset/WELFake source returned no results. No exact Reuters corpus URL or identity was identified from public documentation.

### 5.2 BuzzFeed Political

| Attribute | Finding |
|-----------|---------|
| Exact upstream identity | Zenodo lists BuzzFeed News reference: https://github.com/BuzzFeedNews/2016-10-facebook-fact-check/tree/master/data |
| Original publisher/maintainer | BuzzFeed News (named in Zenodo reference) |
| Dataset version/date | Accessed: 31 March 2020 (per Zenodo reference wording) |
| Original label definitions | BuzzFeed ground truth as set by BuzzFeed (per Horne & Adali README characterization) |
| Material type | News story body text and title |
| WELFake-specific row attribution | Not established — Zenodo reference list does not reconcile references to row-level components |
| Transformations/label conversions documented | Not established |
| Dataset-specific reuse terms | Not established for WELFake component |
| Upstream content rights | Not established |

**Access attempt:** The BuzzFeed News GitHub repository is accessible and documented as containing `facebook-fact-check.csv`. Per Horne & Adali (2017) README characterization, BuzzFeed News used keyword search on BuzzSumo to find stories, collected body text/title, and used BuzzFeed-set ground truth. This repository is listed in Zenodo references but **its connection to the exact WELFake "BuzzFeed Political" component remains unverified**.

### 5.3 Rights analysis

| Rights question | Finding |
|-----------------|---------|
| Zenodo licence declaration | CC BY 4.0 (deposit metadata, verified) |
| Depositor authority over upstream articles | Not established |
| Kaggle upstream rights | Not established |
| McIntire upstream rights | Not established |
| Reuters upstream rights | Not established |
| BuzzFeed Political upstream rights | Not established |

**Conclusion:** Zenodo declares CC BY 4.0 for the deposit and marks it Open. This is verified as deposit-level metadata only. It does **not** establish depositor authority over all upstream article text, nor permissions for any specific VeriNews activity. Upstream rights for Kaggle, McIntire, Reuters, and BuzzFeed Political content remain **UNRESOLVED**. A CC BY declaration on the WELFake Zenodo deposit must not be treated as proof that the depositor had authority to relicense all upstream article content. H-05 remains **UNRESOLVED**.

## 6. Workstream D — Evidence matrix (H-01, H-04, H-05)

See `docs/research/p01-n-welfake-evidence-matrix.md` for the full structured evidence matrix.

### Summary matrix

| ID | Claim/question | Source | Status | Confidence |
|----|---------------|--------|--------|------------|
| A1 | WELFake label mapping `0=Fake,1=Real` declared by Zenodo | Zenodo record 4561253 | PARTIALLY RESOLVED (declaration verified; CSV application unresolved) | High (as declaration), Low (as CSV semantics) |
| A2 | WELFake label mapping in exact CSV | Unknown | UNRESOLVED | N/A |
| A3 | WELFake label assignment method | Not documented in accessible paper | UNRESOLVED | N/A |
| A4 | WELFake annotation/fact-checking/adjudication/QC | Not documented in accessible paper | UNRESOLVED | N/A |
| B1 | Kaggle exact identity (WELFake component) | Zenodo names "Kaggle" generically; Kaggle mirror inaccessible (404) | UNRESOLVED | N/A |
| B2 | McIntire exact identity | Zenodo names "McIntire" generically; web search returned no results | UNRESOLVED | N/A |
| C1 | Reuters exact identity (WELFake component) | Zenodo names "Reuters" generically; web search returned no results | UNRESOLVED | N/A |
| C2 | BuzzFeed Political exact WELFake component | Zenodo lists GitHub reference; connection unverified | UNRESOLVED | N/A |
| C3 | Upstream content rights (Kaggle, McIntire, Reuters, BuzzFeed Political) | Not established for any source | UNRESOLVED | N/A |
| C4 | Zenodo CC BY 4.0 scope over upstream content | Deposit metadata only; depositor authority unresolved | PARTIALLY RESOLVED (declaration verified; scope unresolved) | High (as declaration), Low (as rights coverage) |

## 7. Workstream E — Final WELFake decision

### 7.1 Decision criteria assessment

| Gate | Requirement | Status | Evidence |
|------|-------------|--------|----------|
| Label semantics | Numeric label encoding established for exact CSV | UNRESOLVED | Zenodo declares `0=Fake,1=Real`; local counts conflict under that mapping; no readable paper passage confirms mapping |
| Provenance | Source lineage and label-generation method documented | UNRESOLVED | Zenodo names four sources generically; no per-record lineage |
| Dataset-specific rights | Exact-version licence scope established | PARTIALLY RESOLVED | Zenodo declares CC BY 4.0; scope/authority unresolved |
| Upstream content rights | Depositor authority over all article text established | UNRESOLVED | No rights chain for Kaggle, McIntire, Reuters, BuzzFeed Political |
| Evaluation suitability | Dataset integrity and leakage understood | UNRESOLVED | 78,098 vs 72,134 count discrepancy unexplained; deduplication not documented |

### 7.2 Final recommendation

**WELFake: ON HOLD.**

**Justification:** WELFake does not meet the combined gates for VeriNews local training and public demonstration:
1. **Label semantics unresolved:** The exact numeric label encoding in the deposited CSV is not established. Zenodo's declared mapping (`0=Fake,1=Real`) conflicts with local raw counts under that mapping (local `0`: 35,028 matches paper "real" total; local `1`: 37,106 matches paper "fake" total). Count-level agreement is not per-row semantics.
2. **Provenance unresolved:** No per-record source lineage, label-construction method, or quality-control documentation was found in any accessible source.
3. **Upstream rights unresolved:** No evidence establishes depositor authority over all upstream article content from Kaggle, McIntire, Reuters, and BuzzFeed Political. Zenodo's CC BY 4.0 declaration is deposit-level metadata only.
4. **Dataset integrity unresolved:** The 78,098 vs 72,134 count discrepancy is unexplained; deduplication/filtering procedures undocumented.

**No dataset is approved for local training or public portfolio demonstration. WELFake remains ON HOLD. P01 remains OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL.**

### 7.3 Minimum remaining evidence before dataset approval

1. Primary label-mapping evidence tying numeric encoding to the exact Zenodo CSV release/version (resolving H-01)
2. Primary explanation defining the 78,098 and 72,134 counting units (resolving H-02)
3. Primary documentation of source lineage, label assignment, annotation/adjudication, filtering/deduplication (resolving H-03)
4. Exact upstream identity and rights for Kaggle, McIntire, Reuters, BuzzFeed Political (resolving H-04/H-05)
5. Mentor approval of exact version and activity scope

### 7.4 Most efficient next action

Mentor review of this consolidated evidence and authorization of a narrowly scoped follow-up on WELFake label mapping (H-01) and source rights (H-04/H-05). If the paper or official source remains inaccessible, record that limitation and retain UNRESOLVED; do not substitute secondary snippets or infer reversal from totals.

## 8. Strict restrictions observed

- No dataset/archive downloaded, opened, or inspected
- No local raw dataset files opened or modified
- No labels reversed, renamed, or modified
- No preprocessing, model training, or dependency installation
- No authors/dataset maintainers/providers contacted
- No legal clearance claimed; no dataset approved
- P01 remains In Progress; P02 not started
- No frontend/backend application code modified
- No commit, push, or remote change to GitHub

## 9. Sources

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

- P01-E Final Dataset Feasibility Review
- P01-F Dataset Evidence Decision Register
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
