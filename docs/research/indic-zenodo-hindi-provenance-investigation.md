# Indic Zenodo Hindi Dataset — Provenance, Annotation and Licensing Investigation

**Access date:** 2026-11-06  
**Scope:** Read-only comparison of the Zenodo deposit, its OpenAIRE catalogue entry, the 2025 Frontiers paper, and the completed local extracted-file audit. No author contact, data download/extraction, raw-file change, preprocessing or training was performed. The existing [archive inspection report](indic-zenodo-hindi-archive-inspection.md) was not modified.

## Executive assessment

The 2025 paper reports a detailed collection, verification, annotation, deduplication and filtering pipeline. Those statements are **paper-reported**, not independently verified properties of the local extracted archive. Several material inconsistencies prevent treating the deposit and the paper's experimental corpus as demonstrably identical: local Hindi text-file count is 20,593 versus the paper's 20,493; local exact duplicate excess is 5,493 despite the paper's deduplication claims; two local files are shorter than 50 characters despite a reported minimum 50-token filter; the paper's language descriptions and statistics conflict; and Figure 1 reports 10,293 Hindi items, the local fake-folder count rather than the combined count.

The record and OpenAIRE catalogue display **CC BY 4.0**, while the paper states the dataset is **CC BY-NC 4.0**. The Frontiers article itself is under **CC BY 4.0**. This is a rights/metadata discrepancy, not a legal determination. A publication licence does not automatically license the third-party news content within a dataset.

## A. Original Zenodo record

The following are **record metadata**, not independent verification of the archive's contents or its individual records.

| Field | Zenodo record observation |
|---|---|
| Title | *Multilingual Fake News Detection Dataset: Gujarati, Hindi, Marathi, and Telugu* |
| DOI | [10.5281/zenodo.11408513](https://doi.org/10.5281/zenodo.11408513) |
| Creators | Kailas Patil; Parshv Gandhi; Abhishek Chauhan; Vaibhav Patil; Ameya Pawar |
| Institution shown | Vishwakarma University (creator affiliations on the record) |
| Publication date | 2024-06-01 |
| Listed language coverage | Gujarati, Hindi, Marathi and Telugu (four languages) |
| Hindi archive | `Hindi_F&R_News.zip`; 59,650,455 bytes in record API; displayed as 59.7 MB on the record page |
| Description | Says the dataset supports fake-news research in four Indian languages and comprises news articles from various sources labelled “fake” or “real.” |
| Access and rights | Record is open; visible Rights field and API metadata declare Creative Commons Attribution 4.0 International (CC BY 4.0). |

**Evidence boundary:** the record verifies what the depositor supplied as metadata: a named Hindi ZIP file, its listed size, language coverage, description and CC BY 4.0 declaration. It does not establish the actual number, language, completeness, label validity or provenance of files in the local extracted copy. The record's generic “fake”/“real” description is not an annotation protocol.

## B. 2025 research paper — claims reported by the paper

The source is Jadhav, Rohini; Meshram, Vishal; Bhosle, Amol; Patil, Kailas; Dash, Sital; and Jadhav, Shrikant, “Explainable multilingual and multimodal fake-news detection: toward robust and trustworthy AI for combating misinformation,” *Frontiers in Artificial Intelligence*, published 2025-12-10, DOI [10.3389/frai.2025.1690616](https://doi.org/10.3389/frai.2025.1690616). The paper's Frontiers page and full text were accessed on 2026-11-06.

The following statements are **PAPER-REPORTED**. They are attributed to the paper and are not represented as independently verified facts about the local archive:

### Collection sources and scope — PAPER-REPORTED

- The paper says data were collected/compiled during January–May 2024 and describes five languages: Hindi, Gujarati, Marathi, Telugu and English.
- It names fact-checking sources including **AltNews, BoomLive, Factly and IFCN members** as sources supporting fake-content labels.
- It names **The Hindu, The Indian Express and BBC Hindi** among mainstream sources supplying real-news samples.
- It also says candidate fake content was collected from **social-media posts**, including Twitter/X and public Facebook pages, and validated against fact-check repositories.
- The paper describes source registry/policy checks, crawling, metadata extraction, fact-check alignment and translation/quality-check steps.

### Labeling and annotation — PAPER-REPORTED

- The paper defines **Fake** as verified false and **Real** as verified true.
- It reports **three trained bilingual annotators per language** independently reviewing each article.
- It reports inter-annotator agreement as **Cohen's kappa (κ) = 0.82**.
- It says disagreements were resolved through adjudication meetings.
- It says candidate claims/items were cross-checked against fact-check evidence/repositories, including the listed fact-check organizations, before assigning Fake or Real labels.

These are descriptions of the paper's stated methods. The annotation instructions, annotation forms, per-item adjudication records and identity/linkage to this deposit were not verified in the local archive.

### Deduplication and minimum-length filtering — PAPER-REPORTED

- The paper reports identifying near-duplicates with **SimHash** and a similarity threshold of **0.85**.
- It reports removing exact duplicates using **canonical URL checks and text hashes**.
- It reports discarding articles with **fewer than 50 tokens**.

The paper does not, in the passages inspected, provide reproducible scripts, versioned manifests, tokenization details sufficient to independently reproduce these claims against the local extracted files. The local audit findings are compared below; they do not independently show which processing stage or release the local files represent.

## C. Critical discrepancy analysis

| Issue | Deposit / paper statement | Completed local audit | Assessment |
|---|---|---|---|
| Hindi count | Paper's language statistics report Hindi **20,493**. | **20,593** text files in the two label folders combined: 10,293 fake-folder + 10,300 real-folder files. | **Difference: 100. Dataset count consistency: FAILED.** The files were counted as text files; local audit did not establish that all are valid articles. |
| Exact duplicates | Paper says exact duplicates were removed using canonical URLs and text hashes. | **5,493 excess exact duplicate files** within labels: 2,792 fake-folder excess and 2,701 real-folder excess; 2,448 and 342 within-label duplicate groups, respectively. No exact byte-identical content was found across labels. | **Duplicate-methodology consistency: UNRESOLVED / CONFLICTING.** Exact duplicates remain in the local folders, but archive-to-paper identity and pipeline stage are unknown. |
| Minimum length | Paper says items under **50 tokens** were discarded. | Shortest observed files are **16 characters** (fake folder) and **46 characters** (real folder). | Discrepancy requiring explanation. Character counts and token counts are different measures; the paper's tokenization and mapping to the local files are not established. Both are extremely short relative to a 50-token threshold under ordinary tokenization, but no conversion or processing inference is made here. |
| Language coverage | Zenodo title/description and language metadata list **four** languages. Paper describes **five**, including English. | The local audit was only of the Hindi archive. | Coverage mismatch; no English archive is listed in the Zenodo record's four files. Identity/version relationship is unresolved. |
| Paper's language statistics | Paper's prose/abstract describes five languages. | Paper's dataset language-count list in the inspected data-description section lists only Hindi, Gujarati, Telugu and Marathi—four entries—and gives no English count there. | Internal paper reporting is inconsistent; do not infer the missing language count. |
| Figure 1 Hindi figure | Figure 1 reports Hindi **10,293**. | Local fake-folder count is **10,293**; combined fake + real count is **20,593**. | Numeric match is notable but does not prove Figure 1 is counting only the fake subset or that it refers to the same version. The figure text/caption also discusses multilingual distribution; no reconciliation is supported. |

### Hypotheses only — not selected as explanations

Possible explanations include different processing stages, different dataset versions, different subsets, reporting errors, or an unclear mapping between the deposited archive and the paper's experimental dataset. **No hypothesis is selected:** the sources and local audit do not establish which, if any, is correct.

## D. Licensing analysis

| Source | Visible statement | Evidence boundary |
|---|---|---|
| **Zenodo record Rights field** | CC BY 4.0; the API identifies `cc-by-4.0`. | Verified as the record's declared licence metadata. This does not independently establish that the depositor held rights to license every third-party news article or image. |
| **OpenAIRE catalogue** | The supplied [OpenAIRE dataset entry](https://explore.openaire.eu/search/dataset?pid=10.5281%2Fzenodo.11408513) displays **CC BY** for the Zenodo-linked dataset records. | Catalogue metadata mirrors/indexes a licence assertion; it is not an independent rights audit and does not resolve the conflict with the paper. |
| **2025 Frontiers paper's dataset statement** | States the dataset is released under **CC BY-NC 4.0**, describing academic research use and non-commercial restriction. | Paper-reported dataset-licence claim; it conflicts with the visible Zenodo/OpenAIRE CC BY metadata. It was not accompanied here by a separately inspected data-specific licence file that resolves precedence/version. |
| **Frontiers article publication licence** | The paper's Statements section says the article is open access under **CC BY 4.0**. | Applies to the scholarly article as published. A paper's publication licence does **not automatically establish reuse rights for third-party news articles, images, social posts or other content reproduced/collected in the dataset**. |

The discrepancy between CC BY and CC BY-NC 4.0 must be resolved against the exact data version and rights-holder terms. This report makes **no legal clearance conclusion** and does not advise that the archive may be used, redistributed or republished.

## E. Final assessment

| Required status | Assessment |
|---|---|
| Creator identity | **PARTIALLY VERIFIED** — creator names and Vishwakarma University affiliations are displayed in Zenodo metadata; individual roles, dataset authorship and rights authority are not independently established. |
| Collection methodology | **REPORTED IN PAPER, NOT INDEPENDENTLY VERIFIED FOR LOCAL ARCHIVE** |
| Label methodology | **REPORTED IN PAPER, NOT INDEPENDENTLY VERIFIED FOR LOCAL ARCHIVE** |
| Archive-to-paper identity | **UNRESOLVED** |
| Dataset count consistency | **FAILED** |
| Duplicate-methodology consistency | **UNRESOLVED / CONFLICTING** |
| Third-party content rights | **UNRESOLVED** |
| Training approval | **NOT APPROVED** |

## F. Next evidence requirements

Before considering this resource for VeriNews, obtain or establish:

1. **Exact mapping between the 2024 archive and the 2025 paper's dataset:** stable version identifiers, checksums/manifests, file-to-record mapping and the paper's exact released data artifact.
2. **Original annotation guidelines:** instructions defining verified false/true, evidence requirements, treatment of partly true/unverified claims, annotator language assignments, adjudication rules and label-to-file mapping.
3. **Source-level provenance or manifest:** per-record source URL/publisher, source type, language, collection date, fact-check reference and annotation evidence where legally available.
4. **Reproducible processing scripts and version information:** exact URL canonicalization, text-hash and SimHash procedures, similarity threshold implementation, tokenizer, minimum-token calculation, balancing/augmentation steps, version history and processing-stage outputs.
5. **Explanations for the discrepancies:** the 100-record count difference, local exact duplicates despite reported deduplication, short local files versus the 50-token threshold, four-versus-five language coverage, and Figure 1's 10,293 Hindi count.
6. **Clear dataset-level rights and third-party content reuse terms:** explanation of the CC BY vs. CC BY-NC 4.0 conflict and documentation of permissions/rights for news text, images and social-media content, including what may be used, retained, quoted, transformed and redistributed.

## Sources reviewed (accessed 2026-11-06)

- Zenodo record: [HTML record](https://zenodo.org/records/11408513); [record API](https://zenodo.org/api/records/11408513).
- Frontiers paper: [full article](https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2025.1690616/full); DOI [10.3389/frai.2025.1690616](https://doi.org/10.3389/frai.2025.1690616).
- OpenAIRE catalogue: [dataset search entry](https://explore.openaire.eu/search/dataset?pid=10.5281%2Fzenodo.11408513) (the catalogue resolves to an indexed Zenodo result).
- Local comparison: [Indic Zenodo Hindi archive inspection](indic-zenodo-hindi-archive-inspection.md), which records the read-only local counts, text lengths, encoding checks and exact duplicate results.

## Concise mentor decision

**Do not approve this dataset for training or preprocessing.** Keep it as a research lead only while archive-to-paper identity, count/deduplication/length discrepancies, annotation documentation and third-party rights are unresolved. Request the listed provenance and rights evidence before any next-stage decision. Stop for mentor review.
