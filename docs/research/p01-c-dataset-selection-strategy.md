# VeriNews P01-C — Final Dataset Selection Strategy

**Access date:** 2026-11-07  
**Scope:** Read-only review of TaLLIP and ISOT primary/author-associated sources and published-paper metadata. No dataset or archive was downloaded, no archive was extracted, no raw data was modified, no dependencies were installed, and no dataset was approved. Existing reports and the P00–P15 roadmap were not modified.  
**Decision state:** Stop for mentor review; do not begin P02 or dataset ingestion.

## 1. Executive summary

Neither candidate is approved as a final training dataset.

- **TaLLIP — Pending verification.** Repository pages report English and Hindi editions with train/test partitions, and the English edition is explicitly said to be processed from Pérez-Rosas et al. (2018). The release pages do not establish actual record counts, schemas, annotation instructions, per-language provenance, whether Hindi is original or translated, or dataset-level rights. An MIT code-repository licence is not evidence of a dataset licence. The linked IIT Patna archive's current reachability could not be established without fetching it.
- **ISOT — Potential external evaluation candidate, conditional and not approved.** The UVic-hosted README reports 44,898 English article records in `True.csv` and `Fake.csv`, collection mainly from 2016–2017, and labels derived from Reuters versus outlets characterized as unreliable by PolitiFact/Wikipedia. It documents article fields and subject counts, but not a pre-defined train/test split or an explicit dataset licence. The label/source and topic confounds make it unsuitable as gold-standard article-level truth; rights and leakage controls remain gates even for evaluation.

These labels are research dispositions only. **No final training dataset is selected.** ISOT can at most support a separately scoped, English-only, source-proxy baseline or external robustness check after rights review and an appropriate split/duplicate audit; it is not a Hindi resource. TaLLIP remains the closer reported language match but has unresolved evidence gaps.

## 2. Evidence-status convention

- **VERIFIED — primary-source statement:** Directly observed on the official project page, repository, or dataset README. This verifies that the source makes the statement, not that every underlying record conforms.
- **PAPER-REPORTED:** Stated in a cited research paper or its accessible abstract; not independently reproduced here.
- **REPOSITORY-REPORTED:** Stated by an author-associated or alternative repository; not archive-verified.
- **SECONDARY-SOURCE:** Reported by a non-owner source or carried forward from existing VeriNews research notes; not treated as a primary-source finding unless independently confirmed.
- **INFERENCE:** Risk or suitability conclusion drawn from the documented collection design; not a measured property of records.
- **UNVERIFIED / NOT DOCUMENTED:** Adequate evidence was not located in sources accessible in this review.
- **NOT INSPECTED:** Would require reading the dataset/archive contents. No dataset contents were inspected in this phase.

## 3. Candidate comparison

| Dimension | TaLLIP | ISOT |
|---|---|---|
| Languages | English, Hindi, Swahili, Vietnamese, Indonesian, plus a multilingual combined edition (**REPOSITORY-REPORTED**). | English only (**VERIFIED** from UVic README/article description). Not a Hindi dataset. |
| Unit/task | Described as fake-news detection; article/news text is implied by the source dataset description (**REPOSITORY-/PAPER-REPORTED**). The release's item-level scope and completeness are **NOT INSPECTED**. | News articles, article-level format (**VERIFIED** as described by official README), but fake/real labels are assigned through source pools, not documented independent adjudication of each article. |
| Reported size | No total or per-language counts located in the reviewed repository READMEs or accessible paper abstract (**UNVERIFIED**). | 44,898 total: 21,417 real and 23,481 fake (**VERIFIED** from UVic-hosted README). |
| Label methodology | Binary fake/real use is described, but label definitions, evidence standard, annotators, adjudication, and class counts are **NOT DOCUMENTED** in the reviewed repository READMEs. | `True.csv` records are described as crawled from Reuters; fake records came from outlets called unreliable and flagged by PolitiFact and Wikipedia (**VERIFIED as README-reported method**). It is source-group labeling, not per-article truth adjudication. |
| Provenance | English was cleaned/processed from Pérez-Rosas et al. (2018); additional language versions are attributed to TaLLIP authors. Whether Hindi records are original, translated, aligned, or collected separately is **UNVERIFIED**. | Real articles from Reuters; fake articles from multiple unreliable outlets; most articles focus on politics and world news. Collection was focused mainly on 2016–2017 to match a Kaggle fake-news collection (**VERIFIED** from README). |
| Licence / reuse | Arko98 repo displays MIT, but it is not established as covering dataset contents. The alternative repo shows no data licence in its inspected top-level page. Dataset rights and redistribution conditions are **UNVERIFIED**. | No dataset-specific licence/reuse grant was identified in the official dataset page or README inspected. Public download access is not permission to redistribute or reuse. **UNVERIFIED**. |
| Train/test split | Author-associated repository says separate train/test editions for English and Hindi and a multilingual edition (**REPOSITORY-REPORTED**). Split construction, sizes, stratification, and leakage controls are **NOT DOCUMENTED** in the reviewed README. | Official README identifies `True.csv` and `Fake.csv`, not a train/validation/test partition. A supplied train/test split was not documented (**VERIFIED / NOT DOCUMENTED**). |
| Format / schema | Alternative repo has `Train` and `Test` directories under Hindi. Exact filenames, encoding, delimiters, schema, and label representation were not documented in the inspected README; no file was opened (**NOT INSPECTED**). | Two CSV files; README says each article contains title, text, type, and publication date. It also gives subject/category totals. The precise CSV header/label encoding is **NOT independently verified**; README's term “type” and filenames do not resolve whether subject or class is encoded in a field versus file identity. |
| Leakage / duplicates | **INFERENCE:** random row splitting may leak repeated articles, events, domains, or translation/parallel content. No duplicate, source, or cross-language overlap audit exists for the release. | **INFERENCE:** source is strongly associated with class (Reuters vs. flagged outlets); topic is concentrated in politics/world and may differ by class; near duplicates, event overlap, publisher overlap and temporal leakage across any later user-created split are unmeasured. |
| Availability | Repository pages are publicly viewable. IIT Patna ZIP URL is cited by the author-associated repo, but an HTTP HEAD probe timed out. Availability of the archive is **UNVERIFIED**; it was not fetched. | UVic official page and README are currently viewable; page links the dataset archive. This confirms a published link, not that the archive was fetched or inspected. |
| VeriNews suitability | Closest reported English+Hindi article-text candidate, but insufficient evidence on labels, actual Hindi content, counts, splits and rights. **Pending verification; not approved.** | English-only candidate for a clearly qualified proxy task or external test after rights review. **Potential external evaluation candidate; conditional and not approved.** Never use as a Hindi training/evaluation corpus. |

## 4. TaLLIP evidence review

### 4.1 Availability, languages, and split structure

- **VERIFIED — Arko98 repository statement:** README lists English, Hindi, Swahili, Vietnamese and Indonesian versions, each with train/test editions, plus a multilingual train/test edition. It links the IIT Patna ZIP archive.
- **VERIFIED — alternative repository structure:** `amanifeunou/TaLLIP_Dataset` displays language directories including English and Hindi; the Hindi directory contains `Train` and `Test` directories. This verifies repository paths exist, not contents or equivalence to the IIT Patna ZIP.
- **UNVERIFIED:** whether both languages have non-empty, usable article records in the exact ZIP release; actual per-language, class, domain, and split counts; split methodology; whether multilingual files are concatenated or otherwise aligned; and correspondence among the two GitHub repositories, paper, and ZIP versions.
- **Access test:** An HTTP `HEAD` request to `http://www.iitp.ac.in/~ai-nlp-ml/resources/data/TALLIP-FakeNews-Dataset.zip` timed out in this environment. No response status or redirect was obtained. The archive was not downloaded. This is **inconclusive**, not proof that the archive is unavailable.

### 4.2 File formats, counts, domains, and labels

- The reviewed READMEs do not document the data file schema, delimiter, character encoding, record layout, or exact data counts. The alternative repository's visible language/train/test folder names are insufficient to infer file formats or schemas. **NOT DOCUMENTED / NOT INSPECTED.**
- The Arko98 README describes six domains: Technology, Business (spelled “Bussiness” in the README), Education, Politics, Celebrity News, and Entertainment. The paper abstract reproduced in that README says **seven** domains. The apparent discrepancy is unresolved; no per-language or per-domain counts were located in the accessible materials.
- The repository characterizes the task as fake-news detection, but the reviewed README does not provide operational definitions for Fake/Real, annotation instructions, annotator qualifications/counts, adjudication, or evidence sources. Do not treat the binary names as proof of factual verification.

### 4.3 Original, translated, or other content; provenance

- **REPOSITORY-REPORTED:** English data were collected, cleaned and processed from “Automatic Detection of Fake News” by Pérez-Rosas et al. (COLING 2018). The TaLLIP README requests citation of that source when only the English version is used.
- **REPOSITORY-REPORTED:** the authors extended the dataset for the other languages and ask users to cite the TaLLIP paper.
- **UNVERIFIED:** the collection and translation procedure for Hindi; whether Hindi is original reporting, translated English examples, separately collected articles, or a mixture; the publishers/sites, source URLs, collection dates, and label-evidence provenance. No parallel article/pairing claim is supported by the inspected README.
- **PAPER-REPORTED:** the accessible abstract describes a multilingual BERT-based approach, language-specific and domain-specific experiments, zero-shot and cross-domain transfer experiments, and a five-language/seven-domain dataset. It does not, in the accessible abstract, provide enough corpus construction detail to resolve the questions above.

### 4.4 Research methodology and limitations

The ACM DOI resolves to De et al., *A Transformer-Based Approach to Multilingual Fake News Detection in Low-Resource Languages*, ACM TALLIP 21(1), DOI [10.1145/3472619](https://doi.org/10.1145/3472619). The ACM full page returned HTTP 403 in this review; methodology assessment is therefore limited to the abstract reproduced in the repository and repository statements.

- **PAPER-REPORTED:** the study conducts language-specific/domain-specific, zero-shot, and cross-domain experiments and reports performance improvements over comparison systems.
- **UNVERIFIED from accessible primary text:** precise annotation procedure, per-language data counts, language-specific sources, split assignment, duplicate handling, exact reported metrics/baselines, and detailed limitations. No unsupported detail is inferred from abstract-level claims.
- **INFERENCE / evidence limitations:** without split and source details, reported scores cannot establish robust generalization across outlets, events, or time. Translation/parallel status is unknown, so the records cannot be represented as an English–Hindi parallel corpus. Dataset-specific rights must be cleared independently from paper/code licences.

### 4.5 TaLLIP rights

#### Source evidence and exact wording (accessed 2026-11-07)

- The author-associated [Arko98 repository README](https://github.com/Arko98/TALLIP-FakeNews-Dataset) calls the linked ZIP “The dataset” and says: **“If you use this dataset in any research work, please cite the paper.”** For English-only use it separately says to cite Pérez-Rosas et al. This is a citation request, not an express grant of permission to copy, train on, publish or redistribute the data.
- The repository's [MIT `LICENSE`](https://github.com/Arko98/TALLIP-FakeNews-Dataset/blob/main/LICENSE) says: **“Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the ‘Software’), to deal in the Software without restriction…”** The scope is the defined **Software**. The page does not identify the news corpus as Software or explicitly license dataset contents. Therefore the MIT text is verified as a repository/software licence, but **not verified as a dataset licence**.
- The [alternative repository](https://github.com/amanifeunou/TaLLIP_Dataset) README also requests citation of the paper and English source study; the inspected top-level page provides no dataset licence or use terms.
- The README links the [IIT Patna archive](http://www.iitp.ac.in/~ai-nlp-ml/resources/data/TALLIP-FakeNews-Dataset.zip). A HEAD-only request to that exact HTTP URL timed out on 2026-11-07; no HTTP status, redirect, or headers were obtained. No archive bytes were fetched. Thus current accessibility is **inconclusive / unverified**. Because the host did not respond, no archive-hosted terms notice could be checked. No separate terms notice is linked in the inspected repository README.
- The cited [TaLLIP ACM paper DOI](https://doi.org/10.1145/3472619) resolves bibliographically, but ACM's full page returned 403. No dataset-specific licence statement was verified from the paper page. A publication licence, if any, would not by itself establish rights to the underlying corpus.
- The cited English-source [Pérez-Rosas et al. ACL Anthology entry](https://aclanthology.org/C18-1287/) displays CC BY 4.0 for ACL materials published after 2016. That is publication/materials licensing information, **not evidence that the distinct TaLLIP English dataset or its upstream article text is licensed CC BY 4.0**.

#### Permission status by intended activity

| Activity | Evidence-based status | Reason |
|---|---|---|
| Academic research use | **UNVERIFIED** | README requests citation for research use, but does not expressly grant dataset-use rights or state conditions. Citation is not a permission grant. |
| Local model training | **UNVERIFIED** | No dataset licence or explicit training permission located. MIT code licence does not establish permission for corpus contents. |
| Public resume demonstration (model, screenshots, or example text) | **UNVERIFIED** | No public demonstration, display, or excerpt permission located. No article text should be republished absent clearance. |
| Publishing derived metrics | **UNVERIFIED** | No terms address metrics or derived artifacts. Citation request alone does not settle this permission. |
| Redistributing files, excerpts, or a modified dataset | **UNVERIFIED; no permission evidenced** | No dataset redistribution grant or source-content permission was located. Do not redistribute on the basis of repository visibility or MIT code terms. |
| Downloading the IIT Patna archive | **Availability unverified; permission to download not established** | The repository provides a link, but HEAD timed out and was not followed by a GET. The link implies an intended download path, but does not establish operational accessibility or reuse rights. |

**Conclusion:** No permission above is treated as verified. The only verified licence is the repository's MIT licence for its stated Software scope; it must not be applied to the dataset without explicit evidence. Do not fetch, use, train on, publicly demonstrate, or redistribute TaLLIP pending mentor-approved rights evidence.

## 5. ISOT evidence review

### 5.1 Size, files, fields, and distribution

The UVic-hosted dataset README states:

- The dataset comprises **21,417 Real-News** and **23,481 Fake-News** articles (**44,898 total**).
- It consists of `True.csv` and `Fake.csv`; the prose calls out more than 12,600 articles per file, while the table provides the larger totals above.
- Each article is described as having title, text, type, and publication date. The README's subject table appears to enumerate topics/categories (Real: World-News 10,145; Politics-News 11,272. Fake: Government-News 1,570; Middle-east 778; US News 783; left-news 4,459; politics 6,841; News 9,050). These counts sum to the reported class totals.
- The README does **not** unambiguously specify the actual CSV header names or how the fake/real label is represented inside a row. Do not assume a schema from third-party mirrors or from the file names without a later authorized file audit.

### 5.2 Label meaning and collection method

- **VERIFIED — official README statement:** truthful items were crawled from Reuters.com. Fake items came from different outlets described as unreliable and flagged by PolitiFact and Wikipedia.
- **VERIFIED — official README statement:** articles cover different topics but the majority focus on political and world news. Collection focused mostly on 2016–2017 to match fake-news data collected for Kaggle. The README says data were cleaned/processed but punctuation and mistakes in fake news were retained.
- **Interpretation:** `True` and `Fake` are operationally source-group labels under the documented collection procedure. The README does not say each article was individually fact-checked or independently annotated. Model performance can therefore reflect publisher/style/collection artifacts rather than veracity.

### 5.3 Train/test and research limits

- No official train/test split is described by the UVic README. `True.csv` and `Fake.csv` are class/source files, not evidence of train and test partitions.
- The README lists two cited studies: Ahmed, Traore & Saad (2017), “Detection of Online Fake News Using N-Gram Analysis and Machine Learning Techniques,” and Ahmed, Traore & Saad (2018), “Detecting opinion spams and fake news using text classification.” Those citations are available from the README, but the papers were not retrieved in full for this report. Accordingly, no paper-specific experimental limitation beyond the README evidence is asserted.
- **INFERENCE:** a random split may put the same publisher, event, or near-duplicate story into both partitions and inflate results. Source-held-out and event/duplicate-grouped tests are necessary if an authorized audit proceeds. Topic distribution differences may be another shortcut; actual class-topic correlations should be measured rather than assumed.

### 5.4 Rights and scope

#### Official terms and exact wording (accessed 2026-11-07)

- The official [ISOT dataset page](https://onlineacademiccommunity.uvic.ca/isot/2022/11/27/fake-news-detection-datasets) labels a link **“Click here to download the ISOT Fake News Dataset.”** This verifies that the owner-associated page offers a download link. It is reasonable to infer that the link is provided to enable visitors to retrieve a copy, but the page does not state the permitted purposes, training rights, public-display rights, or redistribution conditions. The archive was not fetched in this review.
- The official [ISOT README PDF](https://onlineacademiccommunity.uvic.ca/isot/wp-content/uploads/sites/7295/2023/02/ISOT_Fake_News_Dataset_ReadMe.pdf) describes the dataset and citations but contains no dataset-specific licence or express research/training/redistribution grant in the inspected text.
- The README cites research publications, but no publication-specific licence was established in this focused review. In any event, a licence covering a scholarly paper would cover that publication's materials under its terms, not automatically the separately distributed dataset or the third-party news articles it contains. ISOT has no code repository licence relevant to its dataset identified in the reviewed owner sources.
- UVic's general [Terms of Use](https://www.uvic.ca/info/terms-of-use/index.php) state: **“Any use of a website or its contents or both (collectively: ‘website’) hosted by the University of Victoria (‘UVic’) is subject to the following terms and conditions.”** They also state that users must not make available content that infringes another party's copyright or proprietary rights. These are website-use terms, not a dataset licence or affirmative grant for reuse of Reuters and other third-party article text.
- UVic's [Copyright information](https://www.uvic.ca/info/copyright-information/index.php) says: **“The material on this site is covered by the provisions of the Copyright Act, by Canadian laws, policies, regulations and international agreements”** and that those provisions can **“prohibit reproduction of materials without written permission.”** This general notice does not identify the copyright holder or grant dataset reuse rights. It reinforces that the site link must not be treated as an open licence. The underlying article texts may also involve third-party rights.
- No dataset-specific licence or terms notice was found on the owner-associated dataset page or README. Accordingly, a direct download path is present, but legal permission for use in this VeriNews project is **not established** by the reviewed sources. This is not a legal determination that all uses are forbidden.

#### Permission status by intended activity

| Activity | Evidence-based status | Reason |
|---|---|---|
| Downloading a copy | **Offered by official page; scope beyond retrieval unknown** | The page expressly presents a “Click here to download” link. No separate access agreement or use terms were displayed on the dataset page. A linked download does not itself grant downstream rights. |
| Academic research use | **UNVERIFIED** | Neither page nor README expressly licenses academic reuse. The README's publication citations are not data permission. |
| Local model training | **UNVERIFIED** | No training or computational-analysis permission was found. Public download availability is not an affirmative training licence. |
| Public resume demonstration (model, screenshots, or example text) | **UNVERIFIED** | No public display or excerpt permission was found. Avoid reproducing article text without clearance. |
| Publishing derived metrics | **UNVERIFIED** | No terms specifically address model outputs or metrics; no permission is inferred from the download link. |
| Redistributing files, excerpts, or a modified dataset | **UNVERIFIED; no permission evidenced** | No dataset redistribution licence was identified; UVic's general copyright notice warns reproduction may require written permission. Do not redistribute absent clearance. |

**Conclusion:** It is verified that UVic's page provides a download link; it is **not verified** that downloading for private project use, training a model, publicly demonstrating results, publishing metrics, or redistributing any data is permitted. Dataset/content reuse rights remain unresolved. Do not download or use ISOT for VeriNews until explicit applicable terms or permission are established.

ISOT is **English-only** and cannot support the Hindi half of the VeriNews bilingual MVP. It could only be investigated as an English-only proxy baseline/external evaluation set, subject to rights review and transparent reporting that the labels are source-derived.

## 6. Research recommendation and candidate dispositions

| Candidate | Required disposition | Reason / boundary |
|---|---|---|
| TaLLIP | **Pending verification** | Reported English+Hindi availability makes it the closer scope match, but the archive, counts/schema, label and annotation protocol, language provenance/translation status, split integrity, and dataset rights remain unverified. Do not approve for training or evaluation yet. |
| ISOT | **Potential external evaluation candidate** | Officially described English article corpus with reported counts and source methodology; potentially useful only as a source-proxy robustness check after explicit rights clearance, schema confirmation, and duplicate/event/source-aware evaluation design. Not a Hindi dataset and not gold-standard item-level truth. Not approved at this time. |

**No final training dataset is selected.** These conditional dispositions do not authorize downloading, extraction, processing, redistribution, or author contact. The existing P01-B decisions remain unchanged.

## 7. Limitations and evidence gaps

1. TaLLIP's ACM full text returned HTTP 403; only bibliographic metadata, the repository-reproduced abstract, and repository statements were available.
2. The TaLLIP IIT Patna archive request timed out on a HEAD-only check; no response status or separate archive-hosted terms notice could be verified. The archive was not fetched.
3. Neither candidate's data files were inspected. Counts, schema, encoding, item completeness, duplicates, exact labels, language/script quality, and overlap therefore remain unverified except where official documentation reports them.
4. Dataset-specific reuse terms were not located for either candidate. Download-link presence and repository-code or publication licences do not establish dataset rights. This report is not legal advice and makes no rights determination.
5. Paper methodology findings are restricted to explicit accessible statements; absence from an abstract/README is not proof the full paper or data release contains no such information.
6. Risks such as publisher/topic leakage are inferences from documented construction, not measured leakage rates.

## 8. Next evidence requirements

Before any selection decision, mentor review should determine whether a manual evidence request/audit is authorized. If authorized, the minimum gates are:

### TaLLIP

1. Obtain a stable, access-controlled copy only after mentor authorization; record release/version, archive hash and source URL. Inspect file inventory without changing originals.
2. Confirm actual English/Hindi train/test counts; per-class and per-domain distributions; exact schema, encoding, text length/completeness, and whether multilingual files duplicate component records.
3. Obtain primary documentation of label definitions, annotators/evidence/adjudication, language-specific collection sources and dates, and whether Hindi material is original, translated, or mixed.
4. Reconcile the six-domain README listing with the seven-domain paper abstract and establish which repository/archive release corresponds to the experiments.
5. Establish dataset-level permission for intended private research, model training, derived artifacts, publication, and any redistribution; do not rely on MIT code licensing.
6. Audit exact/near duplicates, source and event overlap within/between splits, and cross-language translation/pair overlap before considering a split valid.

### ISOT

1. Establish explicit dataset/content reuse rights for the intended use and any public artifacts.
2. On an authorized copy, verify actual CSV fields, encoding, label representation, exact counts, missing/short text, and archive/version.
3. Audit source/publisher, date, subject, event, exact/near duplicates, and class correlations; create source/event-grouped splits rather than relying only on random row split.
4. If used at all, document the target as **source-derived fake/real proxy classification**, report English-only scope, and do not describe metrics as general factual-verification accuracy or multilingual performance.

## 9. Sources reviewed (accessed 2026-11-07)

### TaLLIP

- Arko98 author-associated repository and README: <https://github.com/Arko98/TALLIP-FakeNews-Dataset>
- Arko98 repository MIT `LICENSE` (repository Software only; not identified as a dataset licence): <https://github.com/Arko98/TALLIP-FakeNews-Dataset/blob/main/LICENSE>
- Alternative repository and README: <https://github.com/amanifeunou/TaLLIP_Dataset>
- Alternative repository Hindi directory (Train/Test paths): <https://github.com/amanifeunou/TaLLIP_Dataset/tree/main/Hindi>
- Research paper DOI: <https://doi.org/10.1145/3472619>
- ACM page (returned 403 during review): <https://dl.acm.org/doi/10.1145/3472619>
- IIT Patna archive URL listed by repository (not fetched; HEAD timed out): <http://www.iitp.ac.in/~ai-nlp-ml/resources/data/TALLIP-FakeNews-Dataset.zip>
- English source paper, Pérez-Rosas et al. (2018), ACL Anthology: <https://aclanthology.org/C18-1287/>

### ISOT

- Official ISOT datasets page: <https://onlineacademiccommunity.uvic.ca/isot/datasets/>
- Official Fake News dataset description page: <https://onlineacademiccommunity.uvic.ca/isot/2022/11/27/fake-news-detection-datasets>
- Official dataset README PDF: <https://onlineacademiccommunity.uvic.ca/isot/wp-content/uploads/sites/7295/2023/02/ISOT_Fake_News_Dataset_ReadMe.pdf>
- UVic general Terms of Use (not dataset-specific): <https://www.uvic.ca/info/terms-of-use/index.php>
- UVic general Copyright information (not a dataset licence): <https://www.uvic.ca/info/copyright-information/index.php>
- Dataset archive link shown on official page (not fetched): <https://onlineacademiccommunity.uvic.ca/isot/wp-content/uploads/sites/7295/2023/03/News-_dataset.zip>
- Ahmed, Traore & Saad (2017) paper DOI: <https://doi.org/10.1007/978-3-319-69155-8_9>
- Ahmed, Traore & Saad (2018) paper DOI: <https://doi.org/10.1002/spy2.9>

### Existing VeriNews context consulted

- [P01-B Alternative Dataset Shortlist](alternative-dataset-shortlist.md)
- [Dataset Comparison & Selection Matrix](dataset-comparison.md)
- [MVP Definition](../mvp-definition.md)

## 10. Mentor handoff — stop point

**Recommended next manual action:** mentor review the two conditional dispositions and decide whether to authorize a rights-first follow-up for either candidate. Do not download/extract archives or start P02 until the mentor has reviewed this report. TaLLIP requires primary evidence for its data and annotation terms; ISOT requires explicit reuse-rights review before any data use. No contact with authors or maintainers has been made or is recommended without mentor direction.

**STOP: awaiting mentor review.**
