# VeriNews P01-M — Comprehensive Dataset Evidence Recovery & Candidate Feasibility Review

**Execution label:** P01-M  
**Review date:** 2026-11-08  
**Scope:** Consolidated documentation-only review of remaining P01 evidence research. No dataset/archive was downloaded, no local raw file was opened, no audit, preprocessing, training, or evaluation was performed.  
**Project decision:** Continue research; no dataset selected or approved. P01 remains **OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL**. WELFake remains **ON HOLD**. No dataset is approved for local training or public portfolio demonstration. P02 is **NOT STARTED**.  
**Tracker execution ID:** EXEC-20261108163026383-0724DC5F

## 1. Executive summary

This consolidated report completes the remaining P01 evidence research across six workstreams: WELFake paper and evidence recovery, WELFake source provenance and rights, English candidate reassessment, Hindi candidate reassessment, evaluation design preparation, and a final candidate decision matrix.

**Principal finding:** No candidate passes the combined task, label/provenance, dataset-integrity, dataset-licence, upstream-content-rights, evaluation-design, and mentor-approval gates for VeriNews local training and public demonstration. The strongest technical leads remain blocked by unresolved label semantics (WELFake), source-based label confounding (ISOT), unverified source identity and missing dataset licence (TaLLIP), access restrictions (HinFakeNews), and unmeasured counts/rights (IFND).

**WELFake paper recovery:** The Zenodo dataset record (4561253) is fully accessible as HTML/API. The original IEEE paper full text remains inaccessible through all documented routes (IEEE Xplore page returns no readable article text; Crossref-listed PDF endpoint is unsupported by the available reader). No supplementary material, author-maintained code, or reproducible mapping was found to resolve H-01 (label mapping), H-02 (record-count discrepancy), or H-03 (construction/provenance).

**WELFake source provenance:** Four named sources (Kaggle, McIntire, Reuters, BuzzFeed Political) are documented in the Zenodo deposit description only as a high-level depositor claim. No exact upstream identity/version, release date, per-record lineage, label-construction method, or upstream rights chain was established from public documentation.

**Candidate recommendation:** No candidate is APPROVED. English: WELFake ON HOLD; ISOT CONDITIONAL; LIAR adjacent-only; FakeNewsNet EXCLUDED. Hindi: TaLLIP PENDING; Indic Zenodo Hindi PENDING/NOT APPROVED; HinFakeNews blocked by access; IFND unresolved; BFNK excluded. No multilingual MVP can proceed with current evidence. The most efficient next action is mentor review of this consolidated evidence and authorization of a narrowly scoped follow-up on WELFake label mapping and source rights.

## 2. Scope and research methodology

### 2.1 Methodology

This task is a documentation and public-source research task only. It consists of:

1. Inspecting all existing P01 research reports (P01-E through P01-L).
2. Cross-checking P01-K/P01-L documentation consistency.
3. Attempting public retrieval of the WELFake original paper from legitimate sources.
4. Investigating public documentation for the four WELFake named source groups.
5. Reassessing English and Hindi candidate datasets against existing reports and newly accessible sources.
6. Preparing a practical evaluation design for post-approval use.
7. Producing one consolidated decision matrix and an evidence register addendum.

### 2.2 Evidence categories used

| Category | Meaning |
|----------|---------|
| VERIFIED | Authoritative primary source directly checked (document wording, count, mapping, licence) |
| PARTIALLY VERIFIED | Primary source statement confirmed but application/scope unresolved |
| UNRESOLVED | Not established by inspected primary evidence |
| NOT APPROVED | Project has not authorized use; not a legal conclusion |
| PAPER-REPORTED | Claimed in a publication; not independently confirmed against data |
| REPOSITORY-REPORTED | Claimed in repository README/metadata; not independently confirmed |

### 2.3 Restrictions observed

- No dataset/archive downloaded, opened, or inspected.
- No local raw dataset files opened or modified.
- No labels reversed or relabeled.
- No preprocessing, model training, or dependency installation.
- No authors/dataset maintainers/providers contacted.
- No legal clearance claimed; no dataset approved without mentor approval.
- No P02 or later phase started.
- No changes to frontend/backend application functionality.
- No push to GitHub.

## 3. P01-K/P01-L consistency and correction note

P01-K ([docs/research/p01-k-welfake-original-paper-evidence-review.md](p01-k-welfake-original-paper-evidence-review.md)) documented WELFake Section IV-A aggregate totals and Table III per-source class distribution from supplied investigation notes, asserting they were derived from the original paper. P01-L ([docs/research/p01-l-welfake-full-paper-methodology-review.md]) documented that the full WELFake paper PDF was not accessible as readable text through any documented route (Zenodo PDF returned `application/octet-stream`; IEEE Xplore returned no readable article text).

**Consistency finding:** P01-K's Section IV-A/Table III figures (72,134 total; 35,028 real; 37,106 fake; per-source Kaggle 10,387/10,413; McIntire 3,171/3,164; Reuters 21,417/23,481; BuzzFeed Political 53/48) match the Zenodo dataset record's declared class totals exactly. These figures were **not** independently verified from readable paper content in P01-L. They are attributed to the original paper via supplied investigation notes in P01-I but were not independently traceable to a page/section/table/quotation in P01-L. No correction to P01-K's recorded figures is made; they remain documented as **paper-reported/attributed via supplied notes**, not as directly verified from readable paper content.

No previous report is overwritten or deleted. P01-M adds this explicit addendum.

## 4. WELFake paper access and evidence recovery

### 4.1 Access attempts

| Source | URL | Access result | Evidence boundary |
|--------|-----|---------------|-------------------|
| Zenodo record HTML | https://zenodo.org/records/4561253 | **Fully accessible** — record metadata, description, references, rights, file listing | Dataset record metadata only; file content not accessed |
| Zenodo record API | https://zenodo.org/api/records/4561253 | **Fully accessible** — machine-readable metadata | Metadata only; no file-content endpoint accessed |
| IEEE DOI resolution | https://doi.org/10.1109/TCSS.2021.3068519 | Bibliographic metadata confirmed (title, authors, venue, pages 881–893, 2021) | Citation metadata; not paper text |
| IEEE Xplore article page | https://ieeexplore.ieee.org/document/9395133 | No readable article text returned through available route | Not paper content |
| Crossref-listed IEEE PDF endpoint | http://xplorestaging.ieee.org/ielx7/6570650/9502055/09395133.pdf?arnumber=9395133 | Unsupported `application/pdf` content type; not readable by available fetch reader | Not retrieved for local inspection |
| Related Springer DOI | https://doi.org/10.1007/978-981-15-5619-7_18 | Bibliographic citation details only; chapter text not readable | Related work, not WELFake-specific evidence |

**Result:** No readable full-paper content was obtained. No supplementary file, author-maintained code, or reproducible mapping was found. No author repository or documentation resolving the label mapping was identified.

### 4.2 Evidence-recovery status

The Zenodo deposit description is fully documented (see Section 5). The original paper's methodology sections — label assignment, annotation, source lineage, filtering/deduplication, train/test split, supplementary material — **could not be inspected**. All eight methodology questions from P01-L remain **UNRESOLVED** and are recorded as "Not verifiable from accessible primary sources. The full paper PDF was not readable, so this methodology question could not be independently assessed."

## 5. WELFake label and count investigation

### 5.1 Label mapping (H-01)

| Source | Statement | Status |
|--------|-----------|--------|
| Zenodo record description | “Label (0 = fake and 1 = real)” | **PARTIALLY VERIFIED** — verified as a deposit declaration; not confirmed against exact CSV |
| Zenodo class totals | 35,028 real; 37,106 fake | **VERIFIED as reported** |
| Local strict audit (cited, not re-run) | Raw label `0`: 35,028; raw label `1`: 37,106 | **Previously audited**; raw values unchanged |
| P01-K Section IV-A/Table III | 35,028 real; 37,106 fake aggregate; per-source sums match | **Attributed via supplied notes**; not independently verified from readable paper |

**Conclusion:** Local counts match Zenodo-reported totals **only under reversal** of Zenodo's declared mapping (local `0` count matches paper real total; local `1` count matches paper fake total). Count-level agreement is **not** per-row label semantics. **No labels were reversed or modified.** H-01 remains **UNRESOLVED**.

### 5.2 Record-count discrepancy (H-02)

| Source | Figure | Context |
|--------|--------|---------|
| Zenodo record description | 78,098 data entries in CSV | Deposit statement |
| Zenodo record description | 72,134 entries accessed as per the data frame | Deposit statement |
| Zenodo record description | 72,134 articles | Deposit statement |
| Local strict audit (cited) | 72,134 four-field records | Previously audited; not re-run |

**Conclusion:** No primary evidence defines the unit/version behind each figure or reconciles them. Searches for `78098`/`78 098` in available paper text found no explanation (P01-I). H-02 remains **UNRESOLVED**; no cause is inferred.

### 5.3 Construction/provenance (H-03)

Zenodo describes a merge of four named sources (Kaggle, McIntire, Reuters, BuzzFeed Political) for the purpose of preventing over-fitting. No per-record source map, collection dates, article URLs, source-to-class assignment, deduplication policy, or label-construction procedure was supplied in inspected metadata. No inspected primary paper passage established annotation, fact-checking, adjudication, annotator agreement, or quality control. H-03 remains **UNRESOLVED**.

## 6. WELFake source provenance and rights (Workstream B)

Investigated publicly available primary documentation for the four named source groups:

### 6.1 Kaggle

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

**Notes:** The Kaggle mirror cited in existing English research (saurabhshahane/fake-news-classification) could not be loaded (404). A GitHub repository rpitrust/fakenewsdata1 was accessible and documented as a fork of BenjaminDHorne/fakenewsdata1 containing Horne & Adali (2017) datasets with a README granting redistribution under copyright notice and citation. This repository is listed in Zenodo references but **is not established as the WELFake "Kaggle" component**. No exact WELFake-source identity was found.

### 6.2 McIntire

| Attribute | Finding |
|-----------|---------|
| Exact upstream identity | Not established; Zenodo names only "McIntire" generically |
| Original publisher/maintainer | Not established |
| Dataset version/date | Not established |
| Original label definitions | Not established |
| Material type | Not established |
| WELFake-specific row attribution | Not established |
| Transformations/label conversions | Not established |
| Dataset-specific reuse terms | Not established |
| Upstream content rights | Not established |

**Notes:** No exact McIntire dataset URL or identity was identified from public documentation. Per P01-H instructions, exact URL was not guessed.

### 6.3 Reuters

| Attribute | Finding |
|-----------|---------|
| Exact upstream identity | Not established; Zenodo names only "Reuters" generically |
| Original publisher/maintainer | Reuters (named) but exact corpus/edition not established |
| Dataset version/date | Not established |
| Original label definitions | Not established |
| Material type | Not established |
| WELFake-specific row attribution | Not established |
| Transformations/label conversions | Not established |
| Dataset-specific reuse terms | Not established |
| Upstream content rights | Not established |

**Notes:** Reuters named generically; no corpus edition, collection interval, access route, or Reuters licence terms for included content established.

### 6.4 BuzzFeed Political

| Attribute | Finding |
|-----------|---------|
| Exact upstream identity | Zenodo lists BuzzFeed News reference: https://github.com/BuzzFeedNews/2016-10-facebook-fact-check/tree/master/data |
| Original publisher/maintainer | BuzzFeed News (named in Zenodo reference) |
| Dataset version/date | Accessed: 31 March 2020 (per Zenodo reference wording) |
| Original label definitions | BuzzFeed ground truth as set by BuzzFeed (per Horne & Adali README characterization) |
| Material type | News story body text and title |
| WELFake-specific row attribution | Not established — Zenodo reference list does not reconcile references to row-level components |
| Transformations/label conversions | Not established |
| Dataset-specific reuse terms | Not established for WELFake component |
| Upstream content rights | Not established |

**Notes:** The BuzzFeed News GitHub repository is accessible and documented as containing `facebook-fact-check.csv`. Per Horne & Adali (2017) README characterization, BuzzFeed News used keyword search on BuzzSumo to find stories, collected body text/title, and used BuzzFeed-set ground truth. This repository is listed in Zenodo references but its connection to the exact WELFake "BuzzFeed Political" component remains **unverified**.

### 6.5 Rights summary

| Activity | Evidence status |
|----------|-----------------|
| Dataset download/access | PARTIALLY VERIFIED — Zenodo marks record Open, provides CSV link, declares CC BY 4.0 |
| Local inspection/research | PARTIALLY VERIFIED at deposit level; upstream scope unknown |
| Local preprocessing | UNRESOLVED |
| Local model training | UNRESOLVED; NOT APPROVED |
| Publishing aggregate metrics | UNRESOLVED |
| Public portfolio demonstration | UNRESOLVED; NOT APPROVED |
| Showing text excerpts/samples | UNRESOLVED; do not publish absent clearance |
| Redistributing raw/processed derivatives | UNRESOLVED; no redistribution approval |

**Rights conclusion:** Zenodo declares CC BY 4.0 for the deposit and marks it Open. This is verified as deposit-level metadata only. It does **not** establish depositor authority over all upstream article text, nor permissions for any specific VeriNews activity. Upstream rights for Kaggle, McIntire, Reuters, and BuzzFeed Political content remain **UNRESOLVED**.

## 7. English candidate review (Workstream C)

Reassessed against official/primary sources; existing reports (english-dataset-research.md, dataset-comparison.md) preserved unchanged.

### 7.1 WELFake (English)

| Attribute | Finding |
|-----------|---------|
| Dataset identity | WELFake_Dataset.csv, Zenodo 4561253 v0.1, 245,086,152 bytes |
| Format | Article body + title, four columns |
| Language | English |
| Label meaning | Zenodo declares `0=Fake,1=Real`; local raw counts conflict under that mapping; semantic mapping unresolved |
| Annotation/verification | Not documented in any accessible paper section |
| Source composition | Deposit-reported merge of Kaggle/McIntire/Reuters/BuzzFeed Political; per-record lineage not established |
| Size/schema | 72,134 strict four-field records (local audit cited); 4 columns |
| Duplicate/split leakage | Not measured; plausible source/topic confounding not ruled out |
| Access method | Zenodo CSV link (declared Open; not downloaded) |
| Licence | Zenodo declares CC BY 4.0 (deposit metadata only) |
| Upstream rights | Unresolved |
| CPU feasibility | Plausible (article text, ~72K records) |
| VeriNews suitability | **ON HOLD** — label semantics unresolved; not approved |

### 7.2 ISOT Fake News Dataset (English)

| Attribute | Finding (from english-dataset-research.md, preserved) |
|-----------|------------------------------------------------------|
| Identity | ISOT Fake News Dataset, University of Victoria |
| Format | Two CSVs (True.csv / Fake.csv), full article body + title |
| Language | English |
| Label meaning | Real = Reuters-sourced; Fake = outlets flagged by PolitiFact/Wikipedia; source-group-derived, not individually fact-checked |
| Size | 44,898 total reported (21,417 Real / 23,481 Fake) |
| Licence | Official page offers download; explicit dataset licence not established |
| Rights | Upstream Reuters/other publisher rights unresolved |
| Leakage risk | Severe source confounding; Reuters dateline cues correlate with Real label |
| VeriNews suitability | **CONDITIONAL** — source-proxy research lead only; not cleared for training/demo/external test |

### 7.3 LIAR (English)

| Attribute | Finding |
|-----------|---------|
| Identity | UCSB LIAR dataset, ACL 2017 paper |
| Format | TSV (train/valid/test) |
| Language | English |
| Label meaning | Six PolitiFact truthfulness ratings (`pants-fire` ... `true`) |
| Size | 12,836 short statements |
| Material type | Single-sentence political claims, not full articles |
| Licence | No open dataset licence verified; ACL publication licence ≠ dataset licence |
| VeriNews suitability | **EXCLUDED FOR MVP / ADJACENT RESEARCH ONLY** — task mismatch (short claims, not article text); not recommended as full-article dataset |

### 7.4 FakeNewsNet (English)

| Attribute | Finding |
|-----------|---------|
| Identity | KaiDMML/FakeNewsNet GitHub |
| Format | JSON/URL references; requires dynamic crawling and Twitter hydration |
| Language | English |
| Label meaning | PolitiFact / GossipCop ground truth |
| Size | ~23,000 samples |
| Licence | Academic; complete dataset cannot be distributed (Twitter privacy + publisher copyright) |
| Reproducibility | Violates reproducibility — dead links, dynamic crawling |
| VeriNews suitability | **EXCLUDED** |

### 7.5 English candidate conclusion

- **Best English candidate:** None approved. WELFake is ON HOLD (label semantics unresolved). ISOT is CONDITIONAL (source confounding + rights). LIAR is EXCLUDED FOR MVP / ADJACENT RESEARCH ONLY (task mismatch). FakeNewsNet is EXCLUDED.
- **Not recommended as full-article dataset:** LIAR (short claims), FakeNewsNet (non-reproducible).

## 8. Hindi candidate review (Workstream D)

Reassessed against primary sources; existing reports (hindi-dataset-research.md, indic-zenodo-hindi-provenance-investigation.md, indic-zenodo-hindi-archive-inspection.md) preserved unchanged.

### 8.1 TaLLIP Hindi

| Attribute | Finding |
|-----------|---------|
| Identity | Arko98/TALLIP-FakeNews-Dataset; amanifeunou/TaLLIP_Dataset; IIT Patna archive link |
| Format | Train/test `.txt` files listed; exact schema unverified |
| Language | Hindi (Devanagari) claimed among five languages |
| Label meaning | Binary Real/Fake claimed; method unverified |
| Size | Counts/content not inspected |
| Licence | Arko98 code MIT (not data licence); second repo no visible licence; dataset licence unverified |
| Rights | Dataset-specific reuse terms unverified |
| Duplicates/split leakage | Not measured |
| Train/test availability | Train/test text files listed; not inspected |
| CPU feasibility | Plausible if corpus size moderate |
| VeriNews suitability | **PENDING** — potential Hindi candidate; not approved |

### 8.2 Indic Zenodo Hindi Fake/Real archive

| Attribute | Finding (preserved from prior audit) |
|-----------|--------------------------------------|
| Identity | Zenodo record 11408513; related Frontiers paper DOI 10.3389/frai.2025.1690616 |
| Format | Hindi ZIP plus Gujarati, Marathi, Telugu archives |
| Language | Hindi deposit-reported; paper reports five-language corpus |
| Label meaning | Paper reports multi-stage annotation (trained annotators, κ=0.82, adjudication, SimHash dedup); not tied to exact archive |
| Size | Paper-reported; local audit counts conflict (20,593 files vs paper-reported 20,493) |
| Licence conflict | Zenodo declares CC BY 4.0; related paper states CC BY-NC 4.0 for dataset |
| Duplicates | 5,493 exact-duplicate excess despite paper deduplication description |
| Short files | Two very short files vs paper-reported 50-token minimum |
| Languages | Four languages in deposit vs five in paper |
| VeriNews suitability | **PENDING / NOT APPROVED** — material integrity and rights conflicts block use |

### 8.3 HinFakeNews (LFWE)

| Attribute | Finding |
|-----------|---------|
| Identity | Sharma & Arya, ACM TALLIP 2023; PES University, Bengaluru |
| Format | Tabular features (title, raw article text, metadata, category, binary truth label) |
| Language | Hindi (Devanagari) |
| Label meaning | Binary Fake/Real + 5 topical categories |
| Size | ~33,300 annotated Hindi news articles (paper-reported) |
| Access | Restricted/unreleased; no direct public download link |
| Licence | Not established; paper publication licence ≠ dataset licence |
| VeriNews suitability | **Blocked** — no open public repository link; author contact not authorized |

### 8.4 IFND (Hindi/English)

| Attribute | Finding |
|-----------|---------|
| Identity | Sharma & Garg, Complex & Intelligent Systems; author repo sonalgarg174/Dataset |
| Format | CSV (id, Statement, Image, Category, Date, Label) |
| Language | Per-row language unverified |
| Label meaning | Repository README: `1=True`, `0=Fake` (repository-reported) |
| Size | Paper: 56,868; prior notes: 56,713; discrepancy unresolved |
| Licence | Paper CC BY 4.0 (publication only); README research-purpose use only; formal data licence unverified |
| Material type | Statement/title + image URL + metadata; full article bodies unverified |
| Augmentation | Paper describes synthetic fake-text augmentation; overlap risk |
| VeriNews suitability | **PENDING FOR FURTHER REVIEW and NOT APPROVED AS AN INDEPENDENT EXTERNAL TEST** |

### 8.5 BharatFakeNewsKosh (BFNK)

| Attribute | Finding |
|-----------|---------|
| Identity | BharatAuthenticNet publications (2023–2024) |
| Format | Social media posts/forwards |
| Language | Hindi/English/regional, code-mixed |
| Label meaning | Binary veracity (paper-reported) |
| Size | ~26,000 records |
| VeriNews suitability | **EXCLUDED** — high noise, code-mixed, social posts; not clean Devanagari articles |

### 8.6 Hindi candidate conclusion

- **Best Hindi candidate:** None approved. TaLLIP is PENDING (potential, unverified). Indic Zenodo Hindi is PENDING/NOT APPROVED (integrity + rights conflicts). HinFakeNews is blocked by access. IFND is PENDING FOR FURTHER REVIEW and NOT APPROVED AS AN INDEPENDENT EXTERNAL TEST. BFNK is excluded.
- **Multilingual MVP:** Cannot proceed with available evidence. No verified English–Hindi parallel corpus exists.

## 9. Dataset comparison matrix (Workstream F)

| Dataset | Technical suitability | Label reliability | Provenance | Dataset integrity | Evaluation suitability | Dataset licence | Upstream rights | Local training eligible? | Public demo eligible? | Final status |
|---------|----------------------|-------------------|------------|-------------------|----------------------|-----------------|-----------------|-------------------------|----------------------|--------------|
| WELFake | Article-level format | Low/conflicted; mapping unresolved | Low; H-03 unresolved | H-02 unresolved; structural parse only | Not now | Declared CC BY 4.0; scope unresolved | Unknown | No | No | ON HOLD |
| ISOT | Article text but source-proxy | Source-derived, not item-level fact-check | Moderate collection description; no source-row map | No official split; source/topic confounding not measured | Conditional source-proxy test only after rights/split review | Not established | Unknown | No | No | CONDITIONAL |
| LIAR | Claim verification, not articles | Human PolitiFact ratings, 6 classes | Paper-described; URL/source documents | Established format; binary conversion changes target | Not now | No open data licence verified | Third-party claim/source unresolved | No (MVP) | No | EXCLUDED FOR MVP / ADJACENT RESEARCH ONLY (task mismatch) |
| FakeNewsNet | News/social context; no stable full-text package | Fact-check-site labels | Dynamic source/collection workflow | Incomplete/dynamic; hydration/link drift | No current reproducible test role | Academic; complete dataset cannot be distributed | Publisher/Twitter restrict complete corpus | No | No | EXCLUDED |
| TaLLIP | Article-like text files reported | Binary label claimed; method unverified | English lineage noted; Hindi lineage unclear | Counts/schema/completeness unknown | Not until data integrity verified | No dataset grant verified | Unknown | No | No | PENDING |
| HinFakeNews | Article-level claimed in paper | Binary/topical labels; method unverified | Paper only; direct release not identified | No data artifact to audit | Not until verified | Unknown | Unknown | No | No | BLOCKED (access) |
| IFND | Statement/title + metadata/images; full bodies unestablished | Paper-reported manual checks; augmentation | Counts/augmentation reconcile poorly | Synthetic content/overlap risk; no local re-audit | Not suitable as independent test now | Research-purpose README; no formal licence | Source article/image rights unresolved | No | No | PENDING FOR FURTHER REVIEW / NOT APPROVED AS AN INDEPENDENT EXTERNAL TEST |
| BFNK | Social posts/forwards; not clean article set | Paper-reported binary labels | Exact release/lineage unresolved | Noise and code-mixing reported | Poor external test for article task | Not established | Social content rights unknown | No | No | EXCLUDED |
| Indic Zenodo Hindi | Article-like per record/paper | Paper reports annotators/adjudication; not tied to archive | Archive-to-paper identity unresolved | Material count/duplicate/length/language discrepancies | Not until discrepancies/rights resolved | CC BY vs CC BY-NC conflict | News/social/image rights unresolved | No | No | PENDING / NOT APPROVED |

### Decision recommendations

1. **Best English candidate:** None approved. WELFake is ON HOLD (label semantics unresolved). ISOT is CONDITIONAL (rights + source confounding review required).
2. **Best Hindi candidate:** None approved. TaLLIP is PENDING (source identity, counts, licence verification needed).
3. **Multilingual MVP:** Cannot proceed. No verified English–Hindi parallel corpus; no candidate meets combined task/provenance/rights/evaluation gates.
4. **Minimum remaining evidence before dataset approval:** WELFake primary label-mapping evidence; WELFake 78,098 count reconciliation; WELFake source lineage and upstream rights; TaLLIP dataset licence and archive verification; ISOT explicit dataset reuse terms; Indic Zenodo Hindi CC BY vs CC BY-NC conflict resolution and archive-to-paper identity.
5. **Most efficient next action to close P01:** Mentor review of this consolidated evidence and authorization of a narrowly scoped follow-up on WELFake label mapping (H-01) and source rights (H-04/H-05).

## 10. Evaluation design recommendation (Workstream E)

Prepared for use once suitable datasets are approved. No model performance is reported; no training is authorized.

1. **Separate English and Hindi evaluation** — maintain language-specific pipelines; never pool incompatible labels or scales.
2. **Train/validation/test split strategy** — stratified split as baseline; reserve final test set untouched by preprocessing, vectorizer fitting, feature selection, tuning, or calibration; fit vectorizer on training data only.
3. **Duplicate and near-duplicate grouping** — exact and near-duplicate grouping before partitioning; remove or group duplicates; prevent publisher/event/template/translation/augmentation leakage.
4. **Source/domain-held-out evaluation** — where source metadata permits, use source-grouped or domain-held-out splits to test generalization beyond seen sources.
5. **Leakage prevention** — deduplicate before splitting; publisher datelines and fact-checker boilerplate removed before tokenization; source/topic/time associations documented separately from inferred leakage risk.
6. **Metrics** — macro/per-class metrics, precision, recall, confusion matrix; reliability diagrams, Brier score, ECE for calibration; Platt scaling if needed.
7. **Calibration limitations** — predicted probabilities reflect statistical pattern correlation with training data, never factual truth; Platt scaling calibrates scores, not truth.
8. **Error analysis** — systematic error analysis by source, topic, date, language; not treated as verification of article truth.
9. **Dataset bias and source-proxy risks** — source-label confounding documented (ISOT Reuters datelines; WELFake multi-source merge); treated as plausible risks, not measured findings until audited.
10. **Text classification vs factual verification** — model output estimates corpus-label patterns; does not independently verify facts; never equated with truth.

## 11. Unresolved evidence register

See addendum [`docs/research/p01-m-evidence-register.md`](p01-m-evidence-register.md).

## 12. Final recommendation and next action

**Recommendation:** Keep all candidates in current dispositions (WELFake ON HOLD; ISOT CONDITIONAL; TaLLIP PENDING; Indic Zenodo Hindi PENDING/NOT APPROVED; others as recorded). Do not select or approve any dataset.

**Most efficient next action to close P01:** Mentor review of this consolidated evidence and authorization of a narrowly scoped follow-up on WELFake label mapping (H-01) and source rights (H-04/H-05). If the paper or official source remains inaccessible, record that limitation and retain UNRESOLVED; do not substitute secondary snippets or infer reversal from totals.

**P01 remains OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL. STOP: awaiting consolidated mentor review. Do not begin downloads, audits, preprocessing, model work, author contact, or another research phase automatically.**

## 13. Complete source list

| Source | URL | Access date | Access result |
|--------|-----|-------------|---------------|
| Zenodo WELFake record 4561253 | https://zenodo.org/records/4561253 | 2026-11-08 | Fully accessible HTML |
| Zenodo WELFake API | https://zenodo.org/api/records/4561253 | 2026-11-08 | Fully accessible metadata |
| IEEE DOI | https://doi.org/10.1109/TCSS.2021.3068519 | 2026-11-08 | Bibliographic metadata only |
| IEEE Xplore article page | https://ieeexplore.ieee.org/document/9395133 | 2026-11-08 | No readable article text |
| Crossref-listed IEEE PDF | http://xplorestaging.ieee.org/ielx7/6570650/9502055/09395133.pdf?arnumber=9395133 | 2026-11-08 | Unsupported content type; not readable |
| Related Springer DOI | https://doi.org/10.1007/978-981-15-5619-7_18 | 2026-11-08 | Bibliographic citation only |
| BuzzFeed News data reference | https://github.com/BuzzFeedNews/2016-10-facebook-fact-check/tree/master/data | 2026-11-08 | Accessible; connection to WELFake unverified |
| Benjamin Horne fakenewsdata1 | https://github.com/rpitrust/fakenewsdata1 | 2026-11-08 | Accessible; not established as WELFake component |
| FakeNewsNet | https://github.com/KaiDMML/FakeNewsNet | 2026-11-08 | Accessible; complete dataset cannot be distributed |
| Kaggle ISOT mirror | https://www.kaggle.com/datasets/clmentbisaillon/fake-news-detection | 2026-11-08 | 404; not accessible |
| Kaggle WELFake mirror | https://www.kaggle.com/datasets/saurabhshahane/fake-news-classification | 2026-11-08 | Not accessible |
| Kaggle LIAR mirror | https://www.kaggle.com/datasets/doanquanvietnamca/liar-dataset | 2026-11-08 | Secondary lead; not directly fetched |
| Kaggle IFND mirror | https://www.kaggle.com/ | 2026-11-08 | Not specific; not fetched |
| TaLLIP Arko98 repo | https://github.com/Arko98/TALLIP-FakeNews-Dataset | 2026-11-06 | Previously accessed (P01-J) |
| TaLLIP second repo | https://github.com/amanifeunou/TaLLIP_Dataset | 2026-11-06 | Previously accessed (P01-J) |
| IIT Patna archive | http://www.iitp.ac.in/~ai-nlp-ml/resources/data/TALLIP-FakeNews-Dataset.zip | 2026-11-06 | Listed; not fetched (P01-J) |
| IFND paper | https://pmc.ncbi.nlm.nih.gov/articles/PMC8520332/ | 2026-11-06 | Previously accessed (P01-J) |
| IFND repo | https://github.com/sonalgarg174/Dataset | 2026-11-06 | Previously accessed (P01-J) |
| Zenodo Indic Hindi | https://zenodo.org/records/11408513 | 2026-11-06 | Previously accessed (P01-J) |
| Indic Hindi Frontiers paper | https://doi.org/10.3389/frai.2025.1690616 | 2026-11-06 | Previously accessed (P01-J) |
| AIKosh directory | https://aikosh.indiaai.gov.in/home/datasets/all | 2026-11-06 | Previously accessed (P01-J); no matching item found |
| AIKosh terms | https://aikosh.indiaai.gov.in/home/terms-n-conditions | 2026-11-06 | Previously accessed (P01-J) |
| UVic ISOT page | https://onlineacademiccommunity.uvic.ca/isot/2022/11/27/fake-news-detection-datasets | 2026-11-06 | Previously accessed (P01-J) |
| UCSB LIAR page | https://www.cs.ucsb.edu/~william/data/liar_dataset.zip | 2026-11-06 | Previously accessed (P01-J) |
| ACL LIAR paper | https://aclanthology.org/P17-2067/ | 2026-11-06 | Previously accessed (P01-J) |

## Related VeriNews research

- P01-E Final Dataset Feasibility Review
- P01-F Dataset Evidence Decision Register
- P01-G WELFake Evidence Verification
- P01-H WELFake Evidence Access Plan
- P01-I WELFake Primary Evidence Findings
- P01-J Consolidated Dataset Provenance, Rights & Feasibility Research
- P01-K WELFake Original Paper Evidence Review
- P01-L WELFake Full-Paper Methodology Review
- WELFake Label and CSV Integrity Investigation
- WELFake Archive Inspection
- English Dataset Research
- Hindi Dataset Research
- Dataset Comparison
- Dataset Compatibility
- ML Model Comparison
