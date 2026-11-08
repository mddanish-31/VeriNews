# VeriNews P01-B — Alternative Dataset Shortlist

**Research date:** 2026-11-06  
**Scope:** Read-only source and metadata review. No dataset files were downloaded, no models trained, no dependencies installed, and no application code changed.

## Executive decision

**No dataset is approved as a direct English + Hindi article-level replacement.** The strongest practical lead for a Hindi article-text audit is TaLLIP; the strongest English/Hindi *cross-language* research lead is MM-COVID, but it is COVID-specific, mixes source-content types, and has unresolved reuse terms and a count discrepancy. Neither clears the rights and data-quality gates for training. The 2024 Zenodo Indic-language deposit is directly accessible and declares CC BY 4.0, but the record does not establish its annotation method or per-language counts, and the deposited archives have not been inspected.

Keep existing decisions unchanged: WELFake on hold (do not reverse labels), ISOT conditional, LIAR claim-level only, TaLLIP rights/archive inspection pending, and IFND not approved. There is **no unconditional primary or secondary candidate**. P01-B is ready for mentor review as a feasibility/risk report, not as dataset approval. Stop here; do not start P02.

Evidence labels in this report mean: **VERIFIED** = directly checked in an authoritative metadata/source page (not necessarily archive contents); **PAPER-REPORTED** = stated in the identified paper; **REPOSITORY-REPORTED** = stated by the dataset owner/maintainer; **REQUIRES ARCHIVE INSPECTION** = cannot be established without examining the dataset files; **UNVERIFIED** = no adequate evidence found. A status on a statement does not imply the dataset as a whole is verified.

## 1. Candidate comparison

| Candidate | Language / task | Size and labels | Access / terms | Main fit and blocker | Evidence status | Status for VeriNews |
|---|---|---|---|---|---|---|
| [ISOT](https://onlineacademiccommunity.uvic.ca/isot/2022/11/27/fake-news-detection-datasets) | English; article-level | 44,898 reported: 21,417 real, 23,481 fake; groups collected from different source pools | Official project download; explicit dataset licence not found | Full-text article format and classical-ML-friendly; severe source/label confounding and rights not cleared | VERIFIED project-page counts/format; PAPER-REPORTED provenance; UNVERIFIED licence | Conditional English candidate only |
| [TaLLIP](https://github.com/Arko98/TALLIP-FakeNews-Dataset) | English, Hindi (Devanagari), Swahili, Vietnamese, Indonesian; article-level claimed | Exact counts, balance, encoding and schema not verified | IIT Patna archive linked; repo MIT licence is not established as a data licence | Best apparent English/Hindi fit; underlying English data derives from another corpus, domain inventories conflict, archive and label provenance need inspection | REPOSITORY-REPORTED languages/labels; REQUIRES ARCHIVE INSPECTION for counts/schema; UNVERIFIED data licence | Conditional; not approved |
| [Multilingual Fake News Detection Dataset (Zenodo 11408513)](https://doi.org/10.5281/zenodo.11408513) | Gujarati, Hindi, Marathi, Telugu; article-level claimed | Counts and class balance unreported in record | Open files listed; Zenodo metadata declares CC BY 4.0 | Direct Hindi archive, but methodology, label provenance, data quality and count are unknown | VERIFIED deposit metadata/file listing; REQUIRES ARCHIVE INSPECTION; label method UNVERIFIED | Conditional Hindi audit lead, not yet recommended for modeling |
| [MM-COVID](https://github.com/bigheiniu/MM-COVID) | English, Hindi, Spanish, Portuguese, French, Italian; mixed source content, not strictly article-only | Paper reports 3,981 fake and 7,192 trustworthy (11,173 total); language table totals 3,981 fake and 7,584 real (11,565) | Public repository; dataset-specific reuse terms not established | English/Hindi and cross-language labels make it a useful research lead; COVID-only, some source items are social posts, source/class construction and totals need audit | PAPER-REPORTED; count conflict VERIFIED by arithmetic on paper table; dataset terms UNVERIFIED | Conditional cross-language evaluation lead |
| [FakeCovid](https://doi.org/10.5281/zenodo.3965871) | 40 languages, including Hindi reported; fact-check/news items | 7,623 total reported; per-language/class counts not established here; manually assigned 11 content categories, with veracity distinctions described by project | Zenodo CSV openly listed; GitHub shows CC0 repo badge/licence; Zenodo/project reuse statements conflict in prior inspection and upstream content rights are unresolved | Strong multilingual fact-check provenance and Hindi presence, but COVID-specific and the data/label categories require careful task mapping | VERIFIED Zenodo metadata/file; REPOSITORY-REPORTED language/categories; rights conflict UNVERIFIED | Supplementary research lead only; terms conflict unresolved |
| [CT-FAN / CT-FAN-22](https://zenodo.org/records/6555293) | English and German; article-level fake-news detection | English training set roughly 1,264 reported in task materials; four-way ratings in English; exact usable split counts require inspection | Research-only access terms; no redistribution of data excerpts; record is open | Useful English task benchmark, no Hindi; small English training set; not an unrestricted training corpus | VERIFIED Zenodo restrictions; PAPER-REPORTED task details; REQUIRES ARCHIVE INSPECTION for usable split count | English benchmark only, not MVP replacement |
| [HinFakeNews / LFWE](https://dl.acm.org/action/doSearch?AllField=LFWE%3A+Linguistic+Feature+Based+Word+Embedding+for+Hindi+Fake+News+Detection) | Hindi; article-level claimed | About 33,300 reported; label/class balance details require paper/data access review | No direct public archive confirmed; author contact/access request likely | Potentially strong Hindi corpus with richer metadata, but inaccessible for reproducible solo use at present | PAPER-REPORTED; access and data terms UNVERIFIED | Blocked pending access |
| [WELFake](https://doi.org/10.5281/zenodo.4561253) | English; article-level | Local strict parse 72,134; raw labels 0: 35,028 and 1: 37,106; semantic mapping unresolved | Zenodo declares CC BY 4.0; upstream rights unresolved | Label mapping conflict makes supervised use unsafe | VERIFIED local structure/metadata; label semantics unresolved | On hold; do not reverse labels |
| [LIAR](https://aclanthology.org/P17-2067/) | English; claim-level | 12,836 paper-reported; six truthfulness ratings | Author-linked archive; data terms not fully confirmed | Not news articles; binary mapping would discard editorial gradations | PAPER-REPORTED; licence/terms UNVERIFIED | Exclude as article replacement |
| [IFND](https://github.com/sonalgarg174/Dataset) | Per-row English/Hindi language unresolved; article-level not established | Paper reports 56,868; repository CSV row count not inspected; augmentation reported | README says research-purpose use; formal dataset licence unverified | Short statement/title fields, synthetic augmentation and provenance/count inconsistencies | PAPER-REPORTED counts/augmentation; REPOSITORY-REPORTED README; REQUIRES ARCHIVE INSPECTION | Not approved |
| [NELA-GT-2018](https://github.com/MELALab/nela-gt) | English; article text with publisher-level source labels | 713,534 paper-reported; 194 sources, source labels from multiple rating sites | Public repository; dataset-specific terms need review | Labels apply to publishers, not independently adjudicated articles; source leakage is inherent to target | PAPER-REPORTED and REPOSITORY-REPORTED; terms require review | Not a direct article-veracity replacement |
| [Fakeddit](https://fakeddit.netlify.app/) | English Reddit posts; multimodal | Over 1 million paper-reported; 2-, 3-, and 6-way labels via distant supervision | Download page; dataset terms require confirmation | Posts and distant-supervision labels, not article-level verified news | PAPER-REPORTED; dataset terms UNVERIFIED | Exclude for MVP task |

## 2. English dataset shortlist

### ISOT — conditional article-format option

- **VERIFIED (official project description):** The University of Victoria page describes `True.csv` and `Fake.csv`, totals 21,417 real and 23,481 fake articles, and identifies the collection as English full-text news from roughly 2016–2017. The original studies are Ahmed, Traore & Saad (2017), [DOI 10.1007/978-3-319-69155-8_9](https://doi.org/10.1007/978-3-319-69155-8_9), and (2018), [DOI 10.1002/spy2.9](https://doi.org/10.1002/spy2.9).
- **PAPER/REPOSITORY-REPORTED:** Real items were crawled from Reuters; fake items came from sources categorized as unreliable using PolitiFact/Wikipedia references. This is source-group labeling, not an independent fact-check of every article.
- **UNVERIFIED:** An explicit dataset licence or reuse permission was not identified on the official materials inspected. Public download is not proof of permission to redistribute.
- **Risk/suitability:** Full article text and manageable CSVs suit TF-IDF/classical ML, but models can learn publisher, style, topic and collection cues. Require source-aware analysis, duplicate/event grouping and rights review before selection. It is a conditional educational proxy, not gold-standard truth assessment.

### CT-FAN — small English task benchmark

- **PAPER-REPORTED:** The [CheckThat! 2022 overview](https://ceur-ws.org/Vol-3180/paper-30.pdf) describes English and German article veracity classification. English has multiple rating classes; task and paper material report roughly 1,264 English training examples (exact partition totals must be checked against the task table/archive).
- **VERIFIED:** The [Zenodo record](https://zenodo.org/api/records/6555293) is published and its text imposes research-only conditions, including limits on reproducing dataset portions and attempts to identify original fact-check entries/individuals. Do not treat the repository/code or paper licence as broader data permission.
- **Risks/suitability:** Too small to stand in for a broad English corpus and supplies no Hindi. Potentially valuable as a fixed research benchmark if task labels and access conditions match the planned experiment. Archive/split inspection remains required.

### Other English leads

- **NELA-GT:** [Paper](https://arxiv.org/abs/1904.01546) and [repository](https://github.com/MELALab/nela-gt) report article text and 713k articles. Its labels rate sources/outlets as reliable, unreliable or mixed; assigning that label to each article does not make it article-level annotation. Strong source leakage and label-transfer assumptions make it unsuitable as a direct fake/real article corpus.
- **Fakeddit:** [LREC paper](https://aclanthology.org/2020.lrec-1.755/) reports over one million Reddit samples with distant-supervision labels. It is social-post/multimodal data, not publisher article text or direct human article fact-checking. Terms and label mapping need review before any separate study.
- **WELFake, ISOT and LIAR decisions** remain as documented in [the resolution memo](welfake-alternative-resolution.md). No new evidence from this shortlist changes them.

## 3. Hindi dataset shortlist

### TaLLIP — strongest Hindi article-text audit lead, still conditional

- **REPOSITORY-REPORTED:** The author-associated [repository](https://github.com/Arko98/TALLIP-FakeNews-Dataset) lists Hindi train/test data and five language-specific datasets plus a multilingual set. It describes binary real/fake news and six domains. The paper DOI is [10.1145/3472619](https://doi.org/10.1145/3472619); the abstract reproduced in the repository describes five languages and seven domains, while its README lists six. A second repository tree previously showed seven domain-named files, including Sports. Exact release/version relationship is unresolved.
- **REPOSITORY-REPORTED:** English version was processed from Pérez-Rosas et al.'s [COLING 2018 dataset/paper](https://aclanthology.org/C18-1287/); English and Hindi therefore should not be assumed to share identical collection and annotation provenance.
- **VERIFIED:** The Arko98 GitHub repo displays an MIT licence. **UNVERIFIED:** whether the licence covers the data; no independent data licence was established. The linked IIT Patna archive has not been downloaded or inspected.
- **REQUIRES ARCHIVE INSPECTION:** exact Hindi row counts, language/script quality, full article vs. snippets, labels and mapping, class balance, domain composition, duplicate overlap, and split leakage.
- **Suitability:** Best apparent match to both English/Hindi article-level requirements among the leads, but do not select/train until provenance, actual text and data rights are cleared. Treat it as the first manual audit candidate, not a recommendation to use now.

### Zenodo Indic-language deposit — accessible Hindi archive, weakly documented

- **VERIFIED (Zenodo metadata/API):** [Record 10.5281/zenodo.11408513](https://zenodo.org/api/records/11408513) is open, declares `CC BY 4.0`, describes fake/real news articles in Gujarati, Hindi, Marathi and Telugu, and lists a `Hindi_F&R_News.zip` archive (59,650,455 bytes). Metadata identifies creators and publication date (2024-06-01).
- **UNVERIFIED:** per-language article counts, class distribution, individual label definitions/provenance, source mix, collection process, article completeness, duplicates, archive structure, and whether the declared licence is sufficient for every underlying item. Record metadata is not archive validation or legal review.
- **Suitability:** A direct candidate for a future Hindi audit because archive existence, language and declared licence are documented. Not approved as a primary corpus until archive and annotation inspection; no English counterpart.

### HinFakeNews / LFWE — promising but blocked

- **PAPER-REPORTED:** Sharma & Arya, “LFWE: Linguistic Feature Based Word Embedding for Hindi Fake News Detection,” ACM TALLIP (2023), report about 33,300 Hindi articles and metadata (title/text, time, authorship, URLs and topic categories); see the [ACM search result](https://dl.acm.org/action/doSearch?AllField=LFWE%3A+Linguistic+Feature+Based+Word+Embedding+for+Hindi+Fake+News+Detection).
- **UNVERIFIED:** public direct dataset release, complete label protocol, exact distribution and reuse rights. Prior source searches did not establish a public archive.
- **Suitability:** Could be a useful Hindi benchmark if authors provide files and terms. Do not make it a prerequisite for MVP or report it as openly downloadable.

### Excluded Hindi leads

- **IFND:** Hindi/English coverage is not established per record; repository says research-purpose use, while formal data licence is absent. Paper describes augmented fake text and title/statement fields; archive count, full-body text and augmentation overlap need inspection. Not approved.
- Search results for other small Hindi Kaggle/GitHub corpora were not promoted: author/paper provenance, direct data terms, class mapping and article-level content were not established to the evidence standard for this shortlist.

## 4. Multilingual and cross-language shortlist

### MM-COVID — best English/Hindi cross-language research lead, not general-news MVP data

- **PAPER-REPORTED:** Li et al., [“MM-COVID: A Multilingual and Multimodal Data Repository for Combating COVID-19 Disinformation”](https://arxiv.org/abs/2011.04088), covers English, Spanish, Portuguese, Hindi, French and Italian. It reports 3,981 fake and 7,192 trustworthy items (11,173 total) and a source-content collection process based on fact-checks plus reliable health websites.
- **PAPER-REPORTED:** The language table gives English fake/real = 2,168/2,114 and Hindi = 336/1,023. Across all six languages, table values sum to 3,981 fake and 7,584 real (11,565 total), which conflicts with the abstract's 7,192 real/11,173 total. The Hindi subset is notably imbalanced and small for fake items.
- **PAPER-REPORTED limitation:** Source content includes both news articles and social-media posts; some missing source URLs are represented using the claim text. Real examples include official health websites, while fake examples are derived from fact-checking sources. This produces source/type/topic artifacts and means “fake/real” is not a uniform article-level independent annotation.
- **REPOSITORY-REPORTED:** [Author repository](https://github.com/bigheiniu/MM-COVID) provides dataset-related material. **UNVERIFIED:** applicable dataset licence/reuse terms; the paper's arXiv licence is not a data licence. File completeness and current downloadability require manual check.
- **Suitability:** Strongest identified resource for a carefully scoped within-dataset English/Hindi COVID cross-language experiment. Poor choice for broad news credibility or a general-domain MVP. Rights, count discrepancy, item type, language and duplicate/event alignment must be resolved first.

### FakeCovid — broad language coverage, but veracity/task and rights ambiguity

- **VERIFIED (Zenodo deposit metadata):** [Record 10.5281/zenodo.3965871](https://zenodo.org/api/records/3965871) lists a public 55 MB CSV and describes 7,623 fact-checked COVID-19 news items collected from 92 fact-checking sites, across 40 languages/105 countries. Project page reports manual assignment to 11 content categories. Hindi is included in the language coverage (per project reporting); per-language counts were not verified.
- **REPOSITORY-REPORTED:** [Project page](https://gautamshahi.github.io/FakeCovid/) and [GitHub repository](https://github.com/Gautamshahi/FakeCovid) provide the project description and identify the repository as CC0-1.0. The Zenodo record and project/repository have had conflicting reuse/licence statements in reviewed sources; do not assume one overrides the other or that either clears rights in republished fact-check/source text.
- **PAPER-REPORTED:** Labels include fact-check verdict distinctions / categories, not necessarily a clean binary fake-vs-real article label. News source and fact-checking outlet, date, language and COVID topic can be strong shortcuts.
- **Suitability:** Possible manually reviewed supplementary benchmark for multilingual fact-check analysis. Not a direct, general-purpose credibility corpus until label conversion and rights are resolved.

### Cross-language evaluation is not the same as cross-language training

MM-COVID is the only candidate in this review with reported English and Hindi partitions and class-by-language counts, but its content/label construction and class totals require resolution. FakeCovid reports Hindi among 40 languages, but per-language detail and directly comparable English/Hindi distributions have not been established. TaLLIP offers English and Hindi train/test partitions by repository claim, but it is not clear whether records or events align across languages; do not call its multilingual split a translation-pair or parallel dataset. The Zenodo Indic deposit does not include English. No verified parallel English–Hindi article corpus has been identified.

## 5. Licence and access audit

| Candidate | What the checked source establishes | What it does not establish |
|---|---|---|
| WELFake | Zenodo metadata declares CC BY 4.0 | Upstream rights for aggregated Reuters/BuzzFeed/other material; semantic labels unresolved |
| ISOT | Official project page offers files | No explicit dataset licence found in inspected official materials; mirror terms do not automatically apply |
| TaLLIP | IIT archive link and public repo; Arko98 repo displays MIT | MIT code licence does not establish dataset licence; author/data permissions remain unverified |
| Zenodo Indic deposit | Open archive metadata and CC BY 4.0 declaration | Underlying source rights, annotation quality, and whether record declaration resolves all contributors' rights |
| MM-COVID | Author repository/paper describe dataset | Dataset use/redistribution terms not established; paper publication licence is not data permission |
| FakeCovid | Public Zenodo CSV; GitHub repository shows CC0 badge/licence | Conflicting project/Zenodo reuse statements and rights in third-party content need reconciliation |
| CT-FAN | Zenodo record states research-only conditions and data restrictions | Not a general redistribution licence; user must comply with record terms |
| LIAR | Author page links archive | No open data licence verified; research-only language is a secondary lead pending archive notice confirmation |
| IFND | Repository README says research purposes only | Formal dataset licence and upstream reuse permission not established |
| NELA-GT / Fakeddit | Public owner repositories/pages | Dataset-specific terms still require examination; code or paper licences are not automatically data licences |

**Rule:** Do not redistribute any candidate data, publish excerpts, or interpret public access as permission. Before any future use, inspect the exact version's data terms and determine whether the intended academic/resume project use and any derived artifacts are permitted. This report is not legal advice.

## 6. Label compatibility

VeriNews expects article-level fake/real classification. “Fake,” “real,” “trustworthy,” publisher reliability, fact-check verdicts, and synthetic examples are not interchangeable labels.

| Label design | Candidates | Compatibility consequence |
|---|---|---|
| Source-group binary labels | ISOT; parts of MM-COVID | May encode publisher/source or collection procedure, not independent article truth. Must document as proxy credibility classification and test source-held-out performance. |
| Fake/real labels, protocol unresolved | TaLLIP; Zenodo Indic deposit | Need label mapping, annotator/source process and item-level scope before training. |
| Fact-check verdicts / multiple categories | FakeCovid; LIAR; some CT-FAN tasks | Preserve original granularity first. Any binary collapse needs a documented mapping and sensitivity analysis; LIAR is claim-level, not article-level. |
| Publisher-level ratings copied to articles | NELA-GT | Target is source reliability. Cannot claim per-article factual verification. |
| Distant supervision / augmented text | Fakeddit; IFND | Labels or text-generation process can introduce systematic artifacts and overlap; not a clean editorial fake/real corpus. |
| Unresolved encoding conflict | WELFake | No supervised use until primary evidence resolves label semantics; never infer or reverse based on counts. |

## 7. Data quality, leakage and evaluation risks

Across all candidates, likely leakage dimensions include publisher/source, fact-checking organization, topic/event, date, language, duplicated or translated claim, template, domain, collection pipeline, and text length. A random row split can place near-duplicate claims or source/event templates in both train and test and inflate performance.

Before any dataset is selected, the later data audit should record exact archive/version and terms; structural row counts; per-language/script and class counts; missing, short and non-article text; label provenance; exact and near duplicates; URL/domain/source, topic and time distributions; synthetic/augmented items; and overlap between corpora/splits. Keep source/event/duplicate groups together where metadata allows. Report a conventional stratified baseline alongside group-held-out/source-held-out and, if feasible, temporal, domain and language-wise evaluation. Fit all learned preprocessing only on training partitions. For cross-language claims, report per-language class counts and do not assume that same-event pairs are independent samples.

## 8. Recommendation

### Primary candidate

**None approved.** If mentor authorizes manual archive and rights review, audit **TaLLIP first** for the closest reported English + Hindi article-level scope, and audit the **Zenodo Hindi archive** as a separately sourced Hindi option. This is a research order, not permission to download/use or a positive dataset recommendation. If rights cannot be established, do not proceed with those files.

### Secondary candidate

**MM-COVID as a conditional cross-language benchmark only**, if its terms can be established and the scope is explicitly limited to COVID-19 misinformation. Before using it, reconcile paper/table totals and determine article-vs-social-post composition, source labels, language counts, duplicate/event links and permissions. FakeCovid is a secondary multilingual fact-check lead but ranks behind MM-COVID for this MVP due to conflicting terms and unclear binary compatibility.

### English-only fallback

ISOT is the most practical article-format candidate among investigated English datasets, but only after rights review and with explicit acceptance of source-based labels and leakage caveats. It is not a cleared replacement for WELFake. CT-FAN may serve as a limited English benchmark under its research-only access conditions, not as the primary corpus.

## 9. Unresolved questions

1. What are TaLLIP's actual archive contents, exact train/test counts, labels, article completeness, language quality, source/domain mapping and data-use terms? Why do README/paper/domain-file inventories differ?
2. Who owns or can grant reuse rights for TaLLIP content (including English source data and translations)? Does the IIT archive provide a separate terms notice?
3. What are the per-language counts and label distributions in the Zenodo Indic deposit, and how were fake/real labels established? Are items complete articles, claims, or mixed formats?
4. Can MM-COVID's 11,173 vs. 11,565 reported totals be reconciled from the official files? What portion is news article text versus social-media/claim content? What terms govern reuse?
5. Which FakeCovid licence/terms apply to the actual data, and do they authorize intended research use of underlying third-party content? What are Hindi/English counts and original verdict mapping?
6. Can HinFakeNews be obtained with explicit terms and a stable archive from its authors?
7. Does the project prefer a narrowly scoped COVID misinformation experiment, a broader but weaker source-label proxy, or deferring model work until suitable rights-cleared data is found?
8. Separately, WELFake's label mapping remains unresolved, ISOT's explicit data licence remains unestablished, and IFND's per-record language/augmentation and rights remain unverified.

## 10. Manual tasks required from the user / mentor

No manual download is required for this review. Before any later dataset selection:

1. **Mentor decision:** approve which research direction to pursue: TaLLIP archive/rights inquiry, Zenodo Hindi archive audit, conditional MM-COVID cross-language feasibility, or no dataset pending more research.
2. **Rights gate:** inspect the exact dataset-specific terms or obtain written permission from the responsible authors/maintainers where terms are absent or conflict. Record whether private experimentation, public code, derived metrics and redistribution are allowed.
3. **Archive gate:** only after authorization, obtain a user-approved archive copy and inspect locally; do not assume metadata or repository filenames prove its contents. Preserve the original archive hash and citation.
4. **Annotation gate:** document original label definitions, collection and adjudication process, class mappings, source-level vs item-level labeling, translated/parallel relationships and synthetic content.
5. **Leakage gate:** audit duplicates, event/source overlap and per-language balance before selecting train/validation/test splits.

These are manual approvals/permissions and future audit tasks; no model training or application work is part of this P01-B deliverable.

## Sources reviewed

Primary/owner sources and papers referenced above (accessed 2026-11-06):

- [ISOT official project page](https://onlineacademiccommunity.uvic.ca/isot/2022/11/27/fake-news-detection-datasets); [2017 paper DOI](https://doi.org/10.1007/978-3-319-69155-8_9); [2018 paper DOI](https://doi.org/10.1002/spy2.9).
- [TaLLIP author-associated repository](https://github.com/Arko98/TALLIP-FakeNews-Dataset); [second repository](https://github.com/amanifeunou/TaLLIP_Dataset); [paper DOI](https://doi.org/10.1145/3472619); [IIT Patna archive URL](http://www.iitp.ac.in/~ai-nlp-ml/resources/data/TALLIP-FakeNews-Dataset.zip) (link observed, archive not fetched).
- [Zenodo Indic record](https://zenodo.org/records/11408513); [record API](https://zenodo.org/api/records/11408513); [files API](https://zenodo.org/api/records/11408513/files).
- [MM-COVID paper](https://arxiv.org/abs/2011.04088); [author repository](https://github.com/bigheiniu/MM-COVID).
- [FakeCovid Zenodo record](https://zenodo.org/records/3965871); [record API](https://zenodo.org/api/records/3965871); [project page](https://gautamshahi.github.io/FakeCovid/); [author repository](https://github.com/Gautamshahi/FakeCovid).
- [CT-FAN Zenodo record](https://zenodo.org/records/6555293); [CheckThat! 2022 task paper](https://ceur-ws.org/Vol-3180/paper-30.pdf).
- [HinFakeNews/LFWE ACM DOI search](https://dl.acm.org/); [IFND paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC8520332/); [IFND author repository](https://github.com/sonalgarg174/Dataset).
- [NELA-GT paper](https://arxiv.org/abs/1904.01546) and [repository](https://github.com/MELALab/nela-gt); [Fakeddit paper](https://aclanthology.org/2020.lrec-1.755/) and [project page](https://fakeddit.netlify.app/); [LIAR paper](https://aclanthology.org/P17-2067/).
- Existing VeriNews audit notes: [English research](english-dataset-research.md), [Hindi research](hindi-dataset-research.md), [WELFake alternative resolution](welfake-alternative-resolution.md), and [dataset comparison](dataset-comparison.md).
