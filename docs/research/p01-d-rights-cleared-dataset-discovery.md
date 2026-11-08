# VeriNews P01-D — Rights-Cleared Dataset Discovery

**Access date:** 2026-11-07  
**Scope:** Read-only discovery and rights review of English, Hindi and multilingual fake-news/misinformation datasets. Sources were primary owner/institutional records, dataset repositories and relevant publication pages where accessible; existing P01 research was reused to avoid duplicate audits. No datasets or archives were downloaded, no raw data was changed, no models were trained, no dependencies were installed, and no authors were contacted.  
**Decision:** No dataset is approved. Stop for mentor review; do not advance to P02.

## 1. Executive recommendation

**No Strong candidate was found** that is both sufficiently supported for VeriNews’s English + Hindi article-level Fake/Real task and has clearly applicable dataset rights for local training and a public resume demonstration.

Closest leads, still conditional:

1. **WELFake (English):** its Zenodo dataset record explicitly declares CC BY 4.0, which on its face allows research, model training, public demonstration, metric publication and redistribution subject to attribution and other licence conditions. However, rights in the four aggregated upstream corpora have not been established, and the dataset’s label encoding remains unresolved. Preserve its existing **on-hold** decision; do not model or relabel.
2. **Multilingual Fake News Detection Dataset (Zenodo 11408513; Hindi):** the Zenodo record declares CC BY 4.0, but the related 2025 paper says CC BY-NC 4.0, and prior P01 evidence records archive-to-paper/count/deduplication inconsistencies and unverified third-party rights. Preserve its existing **not-approved/research-lead** decision.
3. **FakeCovid (Hindi reported among 40 languages; English/Hindi counts not verified):** its project page offers the dataset for research under CC BY-NC 4.0, while Zenodo metadata declares CC BY 4.0 and its GitHub repository shows CC0. These terms conflict. It is also COVID/fact-check-oriented and does not establish a clean article-level binary target. Treat as **Research-only** pending rights/label clarification, not as MVP data.

TaLLIP, ISOT, MM-COVID and several other article-format leads lack dataset-specific permission for the intended uses or have a material task mismatch. Public download links, research-paper licences, repository-code licences and platform visibility are not dataset-use permission.

## 2. Evidence and rights-status conventions

- **Verified permission:** an applicable, dataset-specific owner/depositor term expressly grants the activity. A licence declaration is reported as a declaration by that source, not a legal finding that the licensor controls every underlying item.
- **Explicit restriction:** the source expressly limits the activity (for example, research-only use or no redistribution).
- **Inferred:** plausible from the source wording, but not expressly granted for that exact activity. Inferences are not approvals.
- **Unknown:** no adequate dataset-specific evidence located.
- **Conflict:** relevant primary sources provide materially different terms; neither is silently preferred.
- **Task status categories:** **Strong candidate**, **Conditional candidate**, **Research-only**, and **Rejected**. These describe feasibility, not approval. No candidate below is approved for use.

### Rights matrix shorthand

`Declared yes*` = an explicit dataset-record licence says the activity is permitted, **subject to a material rights/authority caveat**. `Yes (research)` = owner source expressly says research use. `Inferred` = not explicit for that activity. `Conflict` = conflicting applicable terms. `Unknown` = no express permission located. `No` = express restriction. For all CC licences, attribution and other licence conditions apply. This matrix is a source-evidence summary, not legal advice.

## 3. Candidate comparison

| Dataset | Languages / unit and task | Reported size; labels | Format, split, access | Licence and candidate class | Technical fit / main risks |
|---|---|---|---|---|---|
| [WELFake](https://zenodo.org/records/4561253) | English; article text; binary Fake/Real | 72,134 reported; Zenodo says 35,028 real and 37,106 fake; `0=Fake`, `1=Real` asserted in metadata | CSV; no official train/test split established in the reviewed metadata; Zenodo file link | Zenodo record declares CC BY 4.0; upstream rights unresolved. **Conditional candidate** | Size is suitable for CPU TF-IDF baselines. Label semantics conflict with observed local raw counts; source, duplicate and topic leakage remain. Existing decision: **on hold; do not reverse labels**. |
| [ISOT](https://onlineacademiccommunity.uvic.ca/isot/2022/11/27/fake-news-detection-datasets) | English; article-level; True/Fake source groups, not independent item-level fact checks | 44,898 (21,417 real; 23,481 fake), owner README-reported | `True.csv`, `Fake.csv`; title/text/type/date described; no official train/test split documented; UVic download link | No dataset-specific reuse licence found. **Conditional candidate** | Modest CSV corpus is CPU-friendly. Strong publisher/source confounding (Reuters vs. outlets flagged unreliable), topic and duplicate leakage; no Hindi. Existing decision remains conditional only. |
| [TaLLIP](https://github.com/Arko98/TALLIP-FakeNews-Dataset) | English, Hindi, Swahili, Vietnamese, Indonesian claimed; fake-news article classification claimed | Exact counts and class balance not documented in reviewed README | Train/test editions reported; linked IIT Patna ZIP; data schema not documented | MIT repository licence is not identified as data licence; no dataset-specific terms located. **Conditional candidate** | Likely manageable for CPU methods if confirmed. Counts, Hindi provenance/translation status, labels, split leakage, domain count and rights unresolved. Existing decision: pending verification. |
| [Multilingual Fake News Detection Dataset](https://zenodo.org/records/11408513) | Gujarati, Hindi, Marathi, Telugu; articles claimed; Fake/Real metadata labels | Zenodo record lists four archives; no reliable per-language/class totals established by record | Language ZIP archives; no split described in record | Zenodo record declares CC BY 4.0; related 2025 paper reports CC BY-NC 4.0. Rights and archive/paper identity unresolved. **Conditional candidate** | Hindi possible; CPU baseline plausible after audit. Prior inspection documented count, duplicate, length and language-coverage discrepancies; rights in third-party source content unresolved. No English. |
| [IFND](https://github.com/sonalgarg174/Dataset) | India-related; per-row language not established; title/statement and metadata, not confirmed full articles | Paper reports 56,868; discrepancy remains in project notes; binary `1=True`, `0=Fake` per README | CSV listed; repository says research purposes only; no separate split verified | Research-purpose statement, but no formal dataset licence / redistribution grant. **Research-only** | Could be CPU-friendly, but full-body article fit, language, augmentation and provenance are unresolved. Not suitable for public dataset redistribution. |
| [MM-COVID](https://github.com/bigheiniu/MM-COVID) | English, Hindi, Spanish, Portuguese, French, Italian; mixed fact-check/news/social content; COVID misinformation | Paper reports 11,173 total; its language table sums to 11,565; table says English and Hindi partitions | JSON plus Twitter IDs; author repository points to Google Drive; no confirmed rights terms | Dataset licence/reuse terms not found. **Research-only** | Narrow COVID transfer study only; mixed item types, count mismatch, source/event leakage, Twitter hydration and rights prevent MVP use. |
| [FakeCovid](https://gautamshahi.github.io/FakeCovid/) | 40 languages including Hindi reported; fact-check news articles; content categories/veracity distinctions, not established as a compatible binary article corpus | Zenodo reports 7,623 items, 92 fact-checking sites, 105 countries; per-language/class counts not verified | CSV listed by Zenodo; project download page requires agreement to terms | Project page says CC BY-NC 4.0 for research; Zenodo says CC BY 4.0; GitHub shows CC0. **Conflict. Research-only** | CPU analysis likely feasible for text subset. COVID-only; facts, fact-check articles and labels may encode collection/source artifacts; no verified Hindi/English counts. |
| [CT-FAN](https://zenodo.org/records/6555293) | English and German (not Hindi); article-level four-way truth rating | About 1,264 English training examples reported in task description | ZIP; article fields described as ID/title/text/rating/domain; English task data and German cross-lingual test described | Zenodo agreement: research-only; no redistribution or dataset portions; no identifying source entries/people; non-reconstructive summaries/analyses may be published. **Research-only** | Small and CPU-friendly, but four-way claim rating is not VeriNews binary; use for controlled research benchmark only under terms. |
| [LIAR](https://aclanthology.org/P17-2067/) | English; short political claims/statements, six PolitiFact ratings | 12,836 paper-reported | TSV train/validation/test; author-linked archive | Author page does not expose a verified dataset-specific open licence; third-party README “research only” notice is secondary. **Rejected** for MVP task | CPU-friendly but claim-level, not news articles; converting six ratings to binary loses meaning. |
| [NELA-GT](https://github.com/MELALab/nela-gt) | English article text; labels rate publishers/sources, not article truth | Multi-year releases report ~1.8M each for 2020/2021/2022 (varies by edition) | SQLite/JSON; Harvard Dataverse links; source labels separate | No dataset reuse licence verified in the reviewed owner README. **Rejected** for MVP task | Scale is unnecessary for solo CPU MVP. Source-level label transfer causes inherent source leakage; some text is transformed to limit news-consumption reconstruction. |
| [Fakeddit](https://fakeddit.netlify.app/) | English Reddit posts/multimodal, not publisher articles; 2/3/6-way distant-supervision labels | Over one million samples reported by project | Train/validation/test files publicly linked; Reddit/post fields, images and metadata | Project guidelines constrain fields and use, but no explicit dataset licence was verified in this review. **Rejected** for MVP task | Not article-level fake/real news; multimodal scale is excessive and content/label design is incompatible. |

## 4. Rights review by candidate

### 4.1 WELFake — explicit Zenodo declaration; upstream rights and labels unresolved

**Primary evidence (accessed 2026-11-07):** [Zenodo record](https://zenodo.org/records/4561253), [record API](https://zenodo.org/api/records/4561253), [files API](https://zenodo.org/api/records/4561253/files). Zenodo metadata identifies `license.id = cc-by-4.0`. Its description says the dataset “merged four popular news datasets (i.e. Kaggle, McIntire, Reuters, BuzzFeed Political)” and states “Label (0 = fake and 1 = real).”

| Private academic research | Local model training | Public resume demonstration | Derived metrics | Raw-data redistribution |
|---|---|---|---|---|
| **Declared yes*** | **Declared yes*** | **Declared yes*** | **Declared yes*** | **Declared yes*** |

Under CC BY 4.0's declared terms, those uses are generally permitted with attribution, indication of changes and no extra restrictions. **Caveat:** the depositor's authority to license every upstream article is not verified. This is not a rights clearance. Separately, local raw label counts conflict with the record mapping; existing WELFake decision stays **on hold**. Do not treat the Zenodo declaration as resolving label semantics or upstream rights.

### 4.2 Hindi Indic Zenodo record — explicit record declaration conflicts with paper

**Primary evidence (accessed 2026-11-07):** [Zenodo record](https://zenodo.org/records/11408513) / [API](https://zenodo.org/api/records/11408513) declares `license.id = cc-by-4.0` and lists `Hindi_F&R_News.zip`. The associated [2025 paper](https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2025.1690616/full) states in its data-availability text that the dataset is under **CC BY-NC 4.0**. The record and paper therefore conflict on commercial permissions. The paper is under CC BY 4.0 as a publication; that does not itself license the data. The prior [P01 provenance investigation](indic-zenodo-hindi-provenance-investigation.md) documents the separate archive-to-paper, count, duplicate, length and language discrepancies.

| Private academic research | Local model training | Public resume demonstration | Derived metrics | Raw-data redistribution |
|---|---|---|---|---|
| **Conflict** | **Conflict** | **Conflict** (commercial status also relevant) | **Conflict** | **Conflict** |

If CC BY-NC governs, non-commercial research/training and non-commercial redistribution may be compatible subject to attribution and the licence conditions; however, the rights conflict and underlying article permissions prevent treating this as verified for VeriNews. Existing decision: **not approved**.

### 4.3 FakeCovid — project research terms conflict with deposit/repository metadata

**Primary evidence (accessed 2026-11-07):**

- The [project download page](https://gautamshahi.github.io/FakeCovid/) says: **“The FakeCovid dataset is free to download for research purposes under CC BY-NC 4.0 License Terms”** and asks the user to read and agree to the terms before download.
- The [Zenodo record](https://zenodo.org/records/3965871) / [API](https://zenodo.org/api/records/3965871) declares `license.id = cc-by-4.0`.
- The author-associated [GitHub repository](https://github.com/Gautamshahi/FakeCovid) displays a CC0 licence. Its [CC0 text](https://raw.githubusercontent.com/Gautamshahi/FakeCovid/master/LICENSE) says CC0 is applied by the affirmer “to the extent that he or she is an owner” and disclaims responsibility for clearing other persons' rights. These are three different declarations/scopes, not a harmonized dataset licence.
- The project and Zenodo metadata describe 7,623 fact-checked COVID-19 news articles collected from 92 fact-checking sites, across 40 languages/105 countries, with manual content categories. The [paper](https://arxiv.org/abs/2006.11343) reports classifying a false class and other fact-check articles; this is not evidence of a clean general-domain fake-vs-real annotation protocol. Hindi inclusion is project-reported; per-language counts are not established here.

| Private academic research | Local model training | Public resume demonstration | Derived metrics | Raw-data redistribution |
|---|---|---|---|---|
| **Yes (research) under project page; conflict remains** | **Inferred research use; conflict remains** | **Inferred only if genuinely non-commercial; unresolved** | **Conflict / not specifically discussed** | **Conflict** |

The project-page statement is the clearest use-specific grant, but the different CC BY and CC0 declarations and third-party fact-check/source content leave scope and authority unresolved. Treat only as **Research-only** until the rights-holder terms for the exact version are clarified. Do not infer that a GitHub CC0 code/repository notice overrides the project-page acceptance terms or clears third-party content.

### 4.4 CT-FAN — expressly research-only

**Primary evidence (accessed 2026-11-07):** [Zenodo record/API](https://zenodo.org/api/records/6555293), DOI [10.5281/zenodo.6555293](https://doi.org/10.5281/zenodo.6555293). The record says: **“The data in the research collection may only be used for research purposes.”** It further says: **“Summaries, analyses and interpretations … may be derived and published, provided it is impossible to reconstruct the information from these summaries,”** and **“You are not permitted to publish any portion of the dataset besides summary statistics or share it with anyone else.”** It also prohibits unauthorized commercial use, reproduction, derivative works, distribution, public display and identifying individuals/original fact-check entries.

| Private academic research | Local model training | Public resume demonstration | Derived metrics | Raw-data redistribution |
|---|---|---|---|---|
| **Yes, research-only** | **Unknown / derivative-work restriction** | **No dataset portions; model-only display not clarified** | **Yes if non-reconstructive summaries/analyses** | **No** |

This is not a general open licence. Training permission is not assumed where the same terms prohibit derivative works; public disclosure of dataset content and redistribution are restricted. It is an English/German research benchmark, not an MVP corpus.

### 4.5 Remaining rights findings

- **TaLLIP:** repositories request citation and the Arko98 repo has an MIT licence for its stated Software scope, but no dataset-specific grant. All five target uses remain **unknown**. See [P01-C rights follow-up](p01-c-dataset-selection-strategy.md), which also records the IIT Patna archive HEAD timeout; no archive was fetched.
- **ISOT:** UVic owner page says **“Click here to download the ISOT Fake News Dataset”**, but its README and project page state no dataset-use licence. This supports an inference that retrieval is offered, not that academic reuse, model training, a public portfolio, metrics publication or redistribution is authorized. All downstream use permissions remain **unknown**. See [P01-C rights follow-up](p01-c-dataset-selection-strategy.md).
- **IFND:** author repository README says **“You are allowed to use this dataset for research purposes only.”** Academic research is explicitly stated; local training as research is an inference, not an express training grant. Public demonstration, derived metrics and redistribution are not separately granted. No formal dataset licence was found. Rights are research-limited/otherwise unknown.
- **MM-COVID:** author repository describes data files and requests citation, but no dataset licence or use/redistribution grant was found. All five activities remain **unknown**. The arXiv paper licence is a paper licence, not data permission.
- **LIAR:** UCSB author page links the dataset ZIP, but no dataset-specific licence was verified there. The “research-purpose use only” statement found in existing project notes is from a third-party README mirror and was not independently confirmed from the author archive. Treat each permission as **unknown**, with research-only as a secondary-source lead.
- **NELA-GT:** owner repository reports transformed article text and source-level reliability labels; no dataset reuse licence was verified in the inspected README. Rights for research, model training, portfolio display, metrics and redistribution are **unknown**; task is not article-level Fake/Real.
- **Fakeddit:** the official project page links public train/validation/test data and imposes guidelines (use only specified fields, do not retrieve ground truth or use paired text/image data), but no dataset licence was verified in this review. All five permissions remain **unknown**, subject to project guidelines and underlying Reddit-content rights.

## 5. Permission matrix across intended activities

| Candidate | Private academic research | Local model training | Public resume demonstration | Publish derived metrics | Redistribute raw data |
|---|---|---|---|---|---|
| WELFake | Declared yes* | Declared yes* | Declared yes* | Declared yes* | Declared yes* |
| ISOT | Unknown | Unknown | Unknown | Unknown | Unknown; no permission evidenced |
| TaLLIP | Unknown | Unknown | Unknown | Unknown | Unknown; no permission evidenced |
| Zenodo Indic Hindi | Conflict: CC BY record vs. CC BY-NC paper | Conflict | Conflict | Conflict | Conflict |
| IFND | Yes, research only | Inferred as research; not explicit | Unknown | Unknown | No redistribution grant found |
| MM-COVID | Unknown | Unknown | Unknown | Unknown | Unknown; no permission evidenced |
| FakeCovid | Yes for research under project page; conflicting declarations | Inferred research use; conflicting declarations | Unknown; non-commercial-only terms may apply | Unknown/conflicting | Conflict |
| CT-FAN | Yes, research only | Unknown / derivative-work restriction | No data portions; model-only display unknown | Yes only if non-reconstructive summary/analysis | No |
| LIAR | Unknown; research-only is secondary-source claim | Unknown | Unknown | Unknown | Unknown; no permission evidenced |
| NELA-GT | Unknown | Unknown | Unknown | Unknown | Unknown |
| Fakeddit | Unknown; project guidelines apply | Unknown | Unknown | Unknown | Unknown |

`Declared yes*` is not a clearance of third-party upstream rights. `No redistribution grant found` means no permission was evidenced in reviewed sources; it is not a legal determination that no permission could exist.

## 6. Technical and task suitability synthesis

- **English:** WELFake and ISOT are article-text datasets with reported binary labels, but WELFake is blocked by unresolved label semantics/upstream rights, and ISOT by absent reuse terms and source-label confounding. CT-FAN has explicit research-only access and four-way labels, useful only for a limited benchmark if its conditions fit. LIAR is claim-level. NELA-GT transfers publisher labels to articles. Fakeddit is social-post, multimodal and distant-supervised.
- **Hindi:** TaLLIP is a language-scope lead, not rights-cleared. The Zenodo Indic record has a declared CC BY licence but a CC BY-NC discrepancy and material data/paper identity and quality issues. IFND is research-only and its fields are statements/titles rather than established full article bodies. No strong rights-cleared Hindi article-level candidate was identified.
- **English + Hindi:** TaLLIP claims both languages but lacks dataset terms and language provenance; MM-COVID reports both but has unknown rights, mixed item types and a count conflict; FakeCovid reports 40 languages including Hindi but rights conflict, per-language counts and task mapping remain unresolved. None qualifies as a verified parallel/translated corpus or as a rights-cleared general-news bilingual training set.
- **CPU feasibility:** TF-IDF with linear models should be technically manageable for the reported sizes of WELFake, ISOT, TaLLIP (if counts are moderate), IFND and CT-FAN; this is an engineering inference, not a benchmark result. Large NELA/Fakeddit-scale and multimodal work is unnecessary for this solo CPU MVP. Rights and target compatibility take precedence over computational ease.
- **Leakage controls:** all source-constructed datasets need duplicate/event/publisher-aware evaluation. Random splitting can leak outlets, templates, events, fact-check pages or translations. NELA's source-level label target is inherently source-linked. No leakage rate was measured for this report.

## 7. Candidate classifications

| Classification | Candidates | Basis |
|---|---|---|
| **Strong candidate** | **None** | No reviewed candidate clears both the English/Hindi article-level task and sufficiently supported dataset rights for local training plus public portfolio demonstration. |
| **Conditional candidate** | WELFake; ISOT; TaLLIP; Zenodo Indic Hindi | Relevant article-text/task potential, but rights, upstream authority, labels, access, provenance or quality evidence is materially incomplete/conflicting. Preserve existing project decisions. |
| **Research-only** | CT-FAN; IFND; FakeCovid; MM-COVID; LIAR | Access terms restrict purpose or rights remain uncertain; and/or the task is limited to a benchmark, COVID/fact-check domain, short claims, or mixed content. This status does not itself authorize training. |
| **Rejected** | NELA-GT; Fakeddit | NELA labels publisher reliability rather than article truth; Fakeddit is Reddit social content with distant labels and multimodal task rules. Both mismatch the VeriNews article-level Fake/Real target. |

## 8. Unresolved evidence requirements

1. **WELFake:** establish upstream permissions from the original source datasets and primary label semantics. Keep raw mapping unchanged until resolved.
2. **ISOT:** obtain applicable dataset/content reuse permission covering non-commercial academic training, a public resume demonstration and derived metrics; determine whether raw redistribution is allowed or prohibited.
3. **TaLLIP:** obtain dataset-specific licence/permission covering each intended activity; distinguish English upstream corpus rights from other language versions. The repo MIT code licence is not data permission.
4. **Zenodo Indic Hindi:** resolve CC BY vs. CC BY-NC terms and establish which paper/archive version the terms cover; clarify rights to underlying news, reproducible counts, annotation and duplicate discrepancies.
5. **FakeCovid:** reconcile official project CC BY-NC 4.0 acceptance terms, Zenodo CC BY 4.0 metadata and GitHub CC0 scope; establish permission over third-party fact-check/news content and whether its labels support the desired task.
6. **IFND / MM-COVID / LIAR / NELA-GT / Fakeddit:** identify a dataset-specific rights-holder grant or explicit terms for training, public demos, metrics and raw redistribution. Do not infer from publication licences, source code licences or public hosting.
7. For all candidate terms, determine whether “public resume demonstration” is non-commercial under the applicable licence, whether publishing a trained model or example snippets is allowed, and what attribution/notices are required.

This is a documentary feasibility review, not legal advice. Where ownership of included article text is uncertain, an uploader's licence declaration does not independently establish that the uploader can license all third-party material.

## 9. Sources reviewed (accessed 2026-11-07)

### Existing VeriNews evidence reused

- [P01-B Alternative Dataset Shortlist](alternative-dataset-shortlist.md)
- [P01-C Dataset Selection Strategy and rights follow-up](p01-c-dataset-selection-strategy.md)
- [WELFake Alternative Resolution](welfake-alternative-resolution.md)
- [Indic Zenodo Hindi Provenance Investigation](indic-zenodo-hindi-provenance-investigation.md)
- [English Dataset Research](english-dataset-research.md)
- [Hindi Dataset Research](hindi-dataset-research.md)

### Primary/owner sources

- WELFake [Zenodo record](https://zenodo.org/records/4561253), [API](https://zenodo.org/api/records/4561253), [files API](https://zenodo.org/api/records/4561253/files).
- ISOT [UVic owner page](https://onlineacademiccommunity.uvic.ca/isot/2022/11/27/fake-news-detection-datasets), [official README PDF](https://onlineacademiccommunity.uvic.ca/isot/wp-content/uploads/sites/7295/2023/02/ISOT_Fake_News_Dataset_ReadMe.pdf), [UVic general terms](https://www.uvic.ca/info/terms-of-use/index.php), [copyright notice](https://www.uvic.ca/info/copyright-information/index.php).
- TaLLIP [author-associated repository](https://github.com/Arko98/TALLIP-FakeNews-Dataset), [MIT repository licence](https://github.com/Arko98/TALLIP-FakeNews-Dataset/blob/main/LICENSE), [alternative repository](https://github.com/amanifeunou/TaLLIP_Dataset), [paper DOI](https://doi.org/10.1145/3472619), [IIT Patna archive URL](http://www.iitp.ac.in/~ai-nlp-ml/resources/data/TALLIP-FakeNews-Dataset.zip) (link only; prior HEAD probe timed out; not fetched).
- Hindi Indic dataset [Zenodo record](https://zenodo.org/records/11408513), [API](https://zenodo.org/api/records/11408513), [files API](https://zenodo.org/api/records/11408513/files), [2025 Frontiers paper](https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2025.1690616/full).
- IFND [author repository README](https://github.com/sonalgarg174/Dataset/blob/main/README.md), [research paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC8520332/).
- MM-COVID [author repository](https://github.com/bigheiniu/MM-COVID), [paper](https://arxiv.org/abs/2011.04088).
- FakeCovid [owner project/download page](https://gautamshahi.github.io/FakeCovid/), [Zenodo record](https://zenodo.org/records/3965871), [API](https://zenodo.org/api/records/3965871), [author repository](https://github.com/Gautamshahi/FakeCovid), [repository CC0 text](https://raw.githubusercontent.com/Gautamshahi/FakeCovid/master/LICENSE), [paper](https://arxiv.org/abs/2006.11343).
- CT-FAN [Zenodo record](https://zenodo.org/records/6555293), [record API with access terms](https://zenodo.org/api/records/6555293), [CheckThat! task overview](https://ceur-ws.org/Vol-3180/paper-30.pdf).
- LIAR [ACL paper](https://aclanthology.org/P17-2067/), [UCSB author data page](https://www.cs.ucsb.edu/~william/software.html).
- NELA-GT [owner repository](https://github.com/MELALab/nela-gt), [NELA-GT-2021 paper](https://arxiv.org/abs/2102.04567).
- Fakeddit [official project page/guidelines](https://fakeddit.netlify.app/), [author repository](https://github.com/entitize/Fakeddit), [LREC paper](https://aclanthology.org/2020.lrec-1.755/).

## 10. Final recommendation and stop point

Do **not** select or download a dataset from this review. Keep existing WELFake, Indic, TaLLIP and ISOT decisions unchanged. The best next manual action is mentor review of the rights conflicts and whether to request documented permission or choose a narrower **research-only** experiment. No author contact, data download, raw-data modification, model training, roadmap change or P02 work was performed.

**STOP: awaiting mentor review.**
