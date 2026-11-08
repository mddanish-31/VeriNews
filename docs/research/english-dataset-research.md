# English Fake News Dataset Research: VeriNews

> **Evidence correction (accessed 2026-11-06):** Zenodo's counts, mapping and 78,098-entry statement are deposit claims. The local file has since been strictly parsed with a raised in-memory field limit: it contains 72,134 four-field records and raw label counts 0: 35,028, 1: 37,106. Thus the old default-parser errors are resolved as field-limit artifacts, but the label meaning remains unresolved because it conflicts with Zenodo's explicit mapping. The record/API declares CC BY 4.0 (**verified as deposit metadata**); rights to aggregated upstream material remain unverified. Missingness, duplicates, near-duplicates, source/topic leakage and text usability require corrected-parser analysis.

> **Label integrity correction (2026-11-06):** The local raw CSV has now been strictly parsed with an increased in-memory CSV field limit: 72,134 four-field records, labels `0: 35,028` and `1: 37,106`, sequential index 0–72,133. The previous parsing anomalies were caused by two unusually long multiline text fields. The local distribution conflicts with Zenodo's explicit mapping and is not evidence to reverse labels. See [WELFake label-integrity investigation](welfake-label-integrity-investigation.md) and [alternative-resolution report](welfake-alternative-resolution.md). WELFake is on hold pending primary-source resolution.

## 1. Executive Summary

This document evaluates established research datasets for English fake news and credibility classification. To comply with VeriNews requirements, candidate datasets are evaluated for full-text availability, verifiable academic provenance, licensing openness, balance between real and fake samples, and freedom from artificial data leakage.

---

## 2. Candidate Evaluation

### 2.1 WELFake (Word Embedding Over Linguistic Features for Fake News Detection)

- **Original Source & Access**:
  - Official Zenodo Deposit: [Zenodo DOI 10.5281/zenodo.4561253](https://doi.org/10.5281/zenodo.4561253)
  - Kaggle Distribution Mirror: [Fake News Classification (WELFake)](https://www.kaggle.com/datasets/saurabhshahane/fake-news-classification)
- **Primary Research Paper**:
   - Verma, P. K., Agrawal, P., Amorim, I., & Prodan, R. (2021). *"WELFake: Word Embedding Over Linguistic Features for Fake News Detection."* *IEEE Transactions on Computational Social Systems*, 8(4), 881–893. DOI: `10.1109/TCSS.2021.3068519`. Full text was not retrieved in this investigation.
- **Language**: English.
- **Verifiable Record Count**:
   - Local strict parse: 72,134 data records; this is a structural record count, not a count after any text-quality filtering.
  - Zenodo reports 78,098 CSV data entries and 72,134 accessed in its dataframe. Cause of the 78,098 statement remains unresolved.
  - Uncompressed file size: ~245 MB (`WELFake_Dataset.csv`).
- **Label Definitions**:
  - Zenodo states `0 = Fake`, `1 = Real`; the local observed counts correspond to the reported Fake/Real totals under the opposite mapping. The semantic encoding therefore remains **UNRESOLVED**; do not reverse labels.
- **Class Balance (Reported)**:
  - Real news: **35,028** records (~48.6%).
  - Fake news: **37,106** records (~51.4%).
  - Balance: Near balanced in reported metadata; requires local script verification after filtering missing text rows.
- **Dataset Format**:
  - CSV file with columns:
    1. `Unnamed: 0`: Serial integer index.
    2. `title`: Headline string.
    3. `text`: Full article body text.
    4. `label`: Binary target integer (`0` or `1`).
- **Licence & Usage Restrictions**:
  - **VERIFIED as Zenodo metadata**: the current record/API explicitly declares **Creative Commons Attribution 4.0 International (CC BY 4.0)**.
  - **Rights caveat**: The deposit identifies Kaggle, McIntire, Reuters and BuzzFeed Political as aggregated sources. Whether the depositor could license all included material and whether redistribution is lawful remains **UNVERIFIED**; the platform declaration is not a legal review of upstream rights.
- **Collection Period & Upstream Provenance**:
  - Aggregated from four popular fake-news research datasets:
    1. *Kaggle Fake News Competition* (2018).
    2. *McIntire Fake News Dataset* (George McIntire, 2016).
    3. *Reuters News Corpus* (wire reporting from 2016–2017).
    4. *BuzzFeed Political News* (curated 2016 US election claims).
- **Known Limitations & Source Leakage Risks**:
   - *Potential source leakage*: Merging four corpora can correlate source, topic, collection procedure and label. Exact source/label effects, duplicates, and Reuters-dateline frequency have not been measured with the corrected parse.
  - *Aggregation Inconsistencies & Duplicates*: Merging four separate corpora creates potential duplicate articles and disparate headline/body length distributions.
   - *Missing Values*: Missing/whitespace-only body counts have not been established from local file inspection.
- **Suitability for VeriNews**:
   - **On hold**. The file has substantial article text, but semantic label mapping is unresolved. Do not preprocess for supervised modeling until primary evidence resolves the mapping and mentor review approves the next step.

---

### 2.2 ISOT Fake News Dataset (University of Victoria)

- **Original Source & Access**:
  - Official Project Page: [ISOT Research Lab, University of Victoria](https://onlineacademiccommunity.uvic.ca/isot/2022/11/27/fake-news-detection-datasets)
  - Kaggle Mirror: [Fake News Detection Dataset](https://www.kaggle.com/datasets/clmentbisaillon/fake-news-detection)
- **Primary Research Papers**:
  - Ahmed, H., Traore, I., & Saad, S. (2017). *"Detection of Online Fake News Using N-Gram Analysis and Machine Learning Techniques."* *ISDDC 2017*, LNCS vol. 10618, Springer.
  - Ahmed, H., Traore, I., & Saad, S. (2018). *"Detecting opinion spams and fake news using text classification."* *Security and Privacy*, 1(1), e9. [DOI](https://doi.org/10.1002/spy2.9)
- **Language**: English.
- **Verifiable Record Count**:
  - Total records: **44,898** news articles.
- **Label Definitions**:
  - Provided as two discrete files:
    - `True.csv`: Real news articles (~21,417 records).
    - `Fake.csv`: Fake news articles (~23,481 records).
- **Class Balance**:
  - Real: **21,417** records (~47.7%).
  - Fake: **23,481** records (~52.3%).
  - Balance: **Well-balanced**.
- **Dataset Format**:
  - Two CSV files with columns:
    1. `title`: Article headline.
    2. `text`: Article body.
    3. `subject`: Topic category (e.g., *politicsNews*, *worldnews*, *News*, *left-news*).
    4. `date`: Publication date string.
- **Licence & Usage Restrictions**:
  - The official UVic project page provides a download, but an explicit dataset licence was not established from the official page/description inspected. A third-party mirror's licence is not assumed to apply to the original dataset.
- **Collection Period & Provenance**:
  - Collected 2016–2017. Real news crawled from *Reuters.com*; fake news collected from websites flagged by *PolitiFact* and *Wikipedia*.
- **Known Limitations**:
  - *Severe source confounding risk*: The official dataset description says real articles come from Reuters while fake articles come from sources categorized as unreliable. Reuters dateline cues and broader source/topic differences may leak labels; their frequency and predictive effect have not been measured here. Removing one dateline token cannot eliminate the broader confound.
  - *Domain skew*: Heavily concentrated on US political drama and 2016 election commentary.
- **Suitability for VeriNews**:
   - **Conditional research candidate only**. It is a close article-format alternative, but not cleared: official source materials do not establish an explicit dataset licence, and source-based label construction creates serious confounding beyond Reuters datelines. See [alternative-resolution report](welfake-alternative-resolution.md).

---

### 2.3 LIAR Dataset

- **Original Source & Access**:
  - Repository / Project: [UC Santa Barbara - William Wang](https://www.cs.ucsb.edu/~william/data/liar_dataset.zip)
- **Primary Research Paper**:
  - Wang, W. Y. (2017). *""Liar, Liar Pants on Fire": A New Benchmark Dataset for Fake News Detection."* *Proceedings of the 55th Annual Meeting of the Association for Computational Linguistics (Volume 2: Short Papers)*, ACL 2017, pp. 422–426.
- **Language**: English.
- **Verifiable Record Count**:
  - Total records: **12,836** short statements.
- **Label Definitions**:
  - 6-class truthfulness scale: `pants-fire`, `false`, `barely-true`, `half-true`, `mostly-true`, `true`.
- **Class Balance**:
  - Multi-class distribution; binary mapping is non-standard and varies by researcher.
- **Dataset Format**:
  - TSV files partitioned into `train.tsv`, `valid.tsv`, `test.tsv`.
- **Licence**: No dataset licence was verified on the UCSB author page. A search-indexed copy of the dataset README reproduced by a [third-party mirror](https://www.kaggle.com/datasets/doanquanvietnamca/liar-dataset) says research-purpose use only and notes original-source copyrights; because the archive/README was not directly fetched, treat that notice as a secondary lead requiring manual confirmation. The ACL paper's publication licence does not license the underlying dataset.
- **Known Limitations**:
  - Consists of isolated single-sentence political claims (average length ~18 words) rather than structured news articles or paragraphs.
- **Suitability for VeriNews**:
  - **Unsuitable for VeriNews MVP**. VeriNews requires news article text (minimum 100 characters, up to 5,000 characters) with journalistic narrative flow, not short political debate soundbites.

---

### 2.4 FakeNewsNet

- **Original Source & Access**:
  - GitHub: [KaiDMML/FakeNewsNet](https://github.com/KaiDMML/FakeNewsNet)
- **Primary Research Paper**:
  - Shu, K., Mahudeswaran, D., Wang, S., & Liu, H. (2020). *"FakeNewsNet: A Data Repository with News Content, Social Context, and Dynamic Information for Studying Fake News on Social Media."* *Big Data*, 8(3), 171–188.
- **Language**: English.
- **Verifiable Record Count**:
  - ~23,000 news samples across PolitiFact and GossipCop domains.
- **Dataset Format & Licensing**:
  - JSON / CSV files providing claim metadata, web archive URLs, and Twitter interaction IDs.
- **Known Limitations**:
  - Does not supply a static CSV with full text bundled. Complying with Twitter Developer terms requires "hydrating" tweets and crawling web archive URLs, causing dead links (404s) and inconsistent reproducibility.
- **Suitability for VeriNews**:
  - **Unsuitable for VeriNews MVP**. Violates the Ponytail principle of reproducibility and simple self-contained offline workflows.

---

## 3. Comparative Synthesis & Candidate Recommendation

| Dataset | Verifiable Records | Format | Labels | Balanced? | Full Article Text? | License Status | Recommendation Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **WELFake** | 72,134 local strict parse; Zenodo also says 78,098 entries | CSV | Zenodo says `0`=Fake, `1`=Real; local raw counts conflict; meaning unresolved | Near balanced | Article text and title | CC BY 4.0 declared; upstream rights unresolved | **On hold** pending primary label resolution |
| **ISOT** | 44,898 official-description reported | CSV (2 files) | Real/Fake source-based groups | Yes (48% / 52%) | Yes | Official download; explicit dataset licence not established | Conditional only; source/label confounding and rights review |
| **LIAR** | 12,836 paper-reported | TSV | Six human PolitiFact truthfulness ratings | Multi-class | No (Short statements) | No open dataset licence verified; secondary README copy says research-only | Adjacent claim benchmark; not article-compatible |
| **FakeNewsNet** | ~23,000 | JSON / URLs | Binary | Variable | No (Requires dynamic crawling) | Academic | Excluded (Non-reproducible hydration) |

### English Candidate Status
WELFake is **on hold**, not approved for P08 or modeling. Its local file parses to 72,134 records, but label semantics remain unresolved: the Zenodo mapping conflicts with the observed raw label counts, and no verified paper/supplement/repository evidence settled the conflict. Do not reverse labels. See [WELFake label-integrity investigation](welfake-label-integrity-investigation.md) and [alternative-resolution report](welfake-alternative-resolution.md). ISOT is conditional on rights review and source-aware evaluation; LIAR is only an adjacent claim-level option.

## IFND source note (accessed 2026-11-06)

The [IFND paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC8520332/) reports 56,868 records and describes fake-text augmentation. The [author-maintained repository](https://github.com/sonalgarg174/Dataset) lists `IFND.csv`; its [README](https://github.com/sonalgarg174/Dataset/blob/main/README.md) says Indian fake/real news, labels `1=True`, `0=Fake`, and research-purpose use only. The paper CC BY 4.0 is a publication licence, not a dataset licence. GitHub API shows no repository licence; redistribution terms remain **UNVERIFIED**. 56,713 remains unexplained. Paper/repository passages checked do not establish per-row language, and the CSV was not downloaded or inspected. Do not treat this as an independent English test set until language, augmentation, overlap and rights are checked.
