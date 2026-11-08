# WELFake Label Resolution and English Alternatives

**Research date:** 2026-11-06  
**Scope:** Read-only source investigation and local analysis. No dataset was downloaded, no processed data was created, and no model was trained.

## Decision

**Recommendation C — Evidence is insufficient; further research is necessary.** Keep WELFake on hold. The local file is structurally parseable, but neither its contents nor verified primary evidence establish whether the semantic mapping is `0 = Fake, 1 = Real` or the reverse. Do not infer the mapping from class totals or writing style, and do not reverse labels.

ISOT is the closest article-format alternative, but it is not currently a cleared replacement: its label construction is source-based, its source/label confounding is substantial, and an explicit dataset licence was not found on the official project materials inspected. LIAR has human fact-check verdict labels and is a useful adjacent claim-verification benchmark, but it contains short political statements rather than full news articles and its distribution notice says research-purpose use only. Neither dataset can be approved as a direct WELFake replacement under the current evidence.

## WELFake: primary evidence and independent analysis

### Directly verified

- The [author-maintained Zenodo record](https://zenodo.org/records/4561253) and [record API](https://zenodo.org/api/records/4561253) state `0 = Fake`, `1 = Real`, and report 35,028 Real plus 37,106 Fake. The deposit describes its source material as combined from Kaggle, McIntire, Reuters, and BuzzFeed Political.
- The local file was strictly parsed with Python's CSV field limit raised in memory. It contains 72,134 four-field records, labels `0: 35,028` and `1: 37,106`, and sequential indices `0–72,133`. The prior parser anomalies resulted from two text fields larger than the default field limit. See [the label-integrity investigation](welfake-label-integrity-investigation.md).
- The raw values, counts, and indices are reproducible local observations. They are not independent evidence of which label means Fake or Real.
- The [paper DOI](https://doi.org/10.1109/TCSS.2021.3068519) resolves to the 2021 IEEE Transactions on Computational Social Systems paper by Verma, Agrawal, Amorim, and Prodan. Its full text was not retrieved in this investigation. The Zenodo files listing exposes the CSV, but no separately listed supplementary file was found in the inspected record metadata.

### Not established

- No independently verified paper passage or supplementary material was available to establish the mapping.
- Searches for an author-maintained repository did not identify a verified source-code repository for the original WELFake paper that defines or operationalizes the label mapping. Search results included unrelated downstream/student projects; these are not primary evidence.
- The exact class-count correspondence under the reversed mapping is only a consistency clue. It is not sufficient to establish label semantics.
- Small local text samples cannot serve as ground truth, and writing style, publisher cues, or apparent plausibility are not proof of truthfulness.
- Zenodo's additional claim of 78,098 CSV entries versus the 72,134 records present locally remains unexplained.

### WELFake risk assessment

| Risk | Finding |
| --- | --- |
| Label validity | Unresolved conflict between explicit deposit mapping and raw counts. |
| Structural parsing | Resolved for local file with a sufficient CSV field limit; this does not resolve semantic labels. |
| Source/duplicate leakage | Likely risk because the dataset merges four corpora; exact duplicate, near-duplicate, and source/label correlations have not been recomputed with the corrected parser. |
| Licence | Zenodo declares CC BY 4.0, but rights to underlying aggregated materials were not established. |
| Resume-project suitability | Potentially strong article corpus if labels and reuse rights can be established; not suitable for supervised credibility modeling while label semantics remain uncertain. |

## Alternatives

No candidate was downloaded. Sizes and label definitions below are source-reported unless explicitly described as locally verified; no local inspection was performed on either alternative.

### ISOT Fake News Dataset — closest article-format candidate, conditional only

**Primary sources:** [UVic ISOT project page](https://onlineacademiccommunity.uvic.ca/isot/2022/11/27/fake-news-detection-datasets), [official dataset description PDF](https://onlineacademiccommunity.uvic.ca/isot/wp-content/uploads/sites/7295/2023/02/ISOT_Fake_News_Dataset_ReadMe.pdf), original research [2017 conference DOI](https://doi.org/10.1007/978-3-319-69155-8_9) and [2018 journal DOI](https://doi.org/10.1002/spy2.9).

- **Labels and provenance:** The official description calls the two groups real/truthful and fake. It says truthful examples were crawled from Reuters.com; fake examples came from outlets described as unreliable, with sources identified/flagged using PolitiFact and Wikipedia. This is dataset-level source-based construction; it does not establish that every included article received an individual independent fact-check.
- **Size/language/availability:** Official description reports 21,417 real and 23,481 fake articles (44,898 total), collected mainly from 2016–2017. English full-article CSVs (`True.csv`, `Fake.csv`) are offered from the UVic research-group page. Those counts and the archive itself were not locally re-verified.
- **Licence/redistribution:** No explicit dataset licence was identified on the official landing page or description inspected. Public download availability is not equivalent to permission to redistribute or use without conditions. A Kaggle mirror's displayed licence is not a substitute for terms from the original source.
- **Leakage and quality risks:** Reuters as the real class source versus a collection of unreliable sites for fake examples creates strong publisher/source and likely style/topic leakage. Reuters datelines are a known conspicuous cue. Removing that token alone does not remove outlet, topic, date, event, duplicate, or collection-procedure confounding. The files need deduplication and grouped/source-aware evaluation if later approved.
- **Academic resume suitability:** Potentially usable for a transparently caveated educational experiment after licence/terms review. It is not a gold-standard fact-check corpus, and a classifier may learn source identity rather than credibility.
- **Objective fit:** Better article-format fit than LIAR, but only a weak proxy for broad credibility assessment because class labels partly encode source-selection policy.

### LIAR — claim-verification benchmark, not an article replacement

**Primary sources:** Wang, *“Liar, Liar Pants on Fire”: A New Benchmark Dataset for Fake News Detection*, [ACL Anthology paper](https://aclanthology.org/P17-2067/); [author's UCSB data page](https://www.cs.ucsb.edu/~william/software.html), which links the dataset archive.

- **Labels and provenance:** The paper describes 12.8K manually labeled short statements gathered from PolitiFact's API. Labels are six editorial truthfulness ratings: `pants-fire`, `false`, `barely-true`, `half-true`, `mostly-true`, and `true`. These are human fact-check judgments, not an unambiguous binary fake/real taxonomy. Any binary grouping would be a new project decision and lose important gradations.
- **Size/language/availability:** 12,836 English statements in TSV splits, according to the paper. The author's page links a downloadable ZIP. It was not downloaded here.
- **Licence/redistribution:** No dataset licence was verified on the UCSB author page. A search-indexed copy of the README reproduced by a [third-party mirror](https://www.kaggle.com/datasets/doanquanvietnamca/liar-dataset) says research-purpose use only and that original-source copyrights remain. This is secondary evidence and was not directly confirmed from the linked author archive; it is not a general open licence. The ACL paper's publication licence does not license the underlying statement data. Terms must be reviewed before use or redistribution.
- **Leakage and quality risks:** Political statements are tied to repeated speakers, parties, topics, venues, and time. Speaker metadata and repeated claims can leak across random splits; preserve the supplied splits initially and consider speaker/time/topic grouping if conducting a study. Statements are not full article bodies.
- **Academic resume suitability:** Strong academic provenance for a small claim-verification demonstration, provided the research-use notice is respected and the task is described accurately. It is not a suitable dataset for a full-article credibility classifier.
- **Objective fit:** Supports narrow claim truthfulness/fact-check classification; not the project's current article-level credibility assessment without a substantial scope change.

## Comparison

| Dataset | Text/task | Label evidence | Access and rights | Main risk | Replacement status |
| --- | --- | --- | --- | --- | --- |
| WELFake | English news articles; binary fake/real | Official explicit mapping conflicts with local distribution; unresolved | Zenodo download; CC BY 4.0 declared, upstream rights unresolved | Semantic label error, aggregation leakage | **On hold** |
| ISOT | English full news articles; binary real/fake | Official project description identifies source-based groups | Public official download; explicit dataset licence not established | Near-direct source/label confounding | **Conditional research candidate, not cleared** |
| LIAR | English short political claims; six fact-check ratings | Original paper and author distribution describe human PolitiFact judgments | Author-linked public archive; research-purpose notice, no verified open data licence | Speaker/topic leakage; task mismatch | **Adjacent benchmark only** |

## Recommendation and next step

Choose **C**, not A or B. A is unsupported because no primary evidence resolves WELFake. B would imply a replacement dataset is sufficiently vetted and task-compatible; neither candidate meets that bar now. Keep WELFake on hold and do not relabel. At mentor review, decide whether to (1) continue primary-source/document investigation, (2) perform a rights/terms review of ISOT and accept a source-based proxy task with explicit limitations, or (3) narrow the product task to claim-level fact-checking and assess LIAR under its research-use terms. No author contact is requested as part of this recommendation.

## Manual work and integrity

- **No download or manual file operation is required now.** No alternative has been downloaded, and this investigation did not change or create datasets.
- Before a future ISOT/LIAR study, a human must review the original data-use terms and decide whether the project use and any redistribution are permitted. That review is a prerequisite, not permission already established here.
- No preprocessing, training, or P02 work was started.
- `data/raw/welfake/WELFake_Dataset.csv` remains unchanged; SHA-256: `665331424230fc452e9482c3547a6a199a2c29745ade8d236950d1d105223773`.

## Source access record

Sources were checked on 2026-11-06. The WELFake paper DOI resolved to bibliographic information but the full paper text was unavailable through the inspected routes. The UVic ISOT landing page and its description PDF search-indexed text were inspected; the linked archive was not fetched. The LIAR ACL paper page and UCSB author page were inspected; the ZIP was not fetched. Search snippets and secondary mirrors are not treated as primary proof of WELFake label mapping or dataset rights. The LIAR README usage restriction is explicitly marked secondary and requires confirmation.
