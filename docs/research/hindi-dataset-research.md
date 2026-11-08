# Hindi Fake News Dataset Research: VeriNews

## 1. Executive Summary

This document evaluates candidate datasets for Hindi fake news detection. Hindi is the product language target, but no dataset is yet approved: file content, language quality, rights and provenance must be established before selection.

---

## 2. Candidate Evaluation

### 2.1 TaLLIP Multilingual Dataset (`Arko98/TALLIP-FakeNews-Dataset`)

- **Original Source & Access**:
  - Official GitHub Repository: [Arko98/TALLIP-FakeNews-Dataset](https://github.com/Arko98/TALLIP-FakeNews-Dataset)
  - Dataset Archive Host: [IIT Patna AI-NLP-ML Group](http://www.iitp.ac.in/~ai-nlp-ml/resources/data/TALLIP-FakeNews-Dataset.zip)
- **Primary Research Paper**:
  - De, A., Bandyopadhyay, D., Gain, B., & Ekbal, A. (2021). *"A Transformer-Based Approach to Multilingual Fake News Detection in Low-Resource Languages."* *ACM Transactions on Asian and Low-Resource Language Information Processing (ACM TALLIP)*.
  - Institutional Provenance: Indian Institute of Technology Patna (IIT Patna) and IIT Hyderabad.
- **Languages Covered (5 Languages + Multilingual)**:
  - English, **Hindi (Devanagari script)**, Swahili, Indonesian, and Vietnamese, alongside a combined multilingual partition.
- **Available Partitions & Splits**:
  - Pre-split into dedicated `train` and `test` data files for each supported language.
  - README lists six domains; paper abstract states seven. The second repository's tree contains seven domain-named `.txt` files including Sports, suggesting it is omitted from README lists. Exact provenance/version is unresolved.
    1. Technology
    2. Business
    3. Education
    4. Politics
    5. Celebrity News
    6. Entertainment
- **Record Count & Class Balance Status**:
  - **Record Count Status (Requires Local Inspection)**: Exact Hindi train/test counts in listed text files have not been measured. The available repository filenames are `.txt`; do not assume CSV.
  - **Class Distribution Status**: Label mapping and class balance require inspection. Seven domain-named files appear in the second repo tree, but relationships among per-domain and complete files are not established.
- **Label Definitions**:
  - Binary classification:
    - `Real`: Authentic news article text.
    - `Fake`: Fabricated / misleading news article text.
- **Dataset Format**:
  - Second repository tree lists train/test `.txt` files; exact schema, text/label encoding and whether files contain full articles require inspection.
- **Licence & Usage Restrictions**:
  - Arko98 displays an MIT code licence. The second repository, https://github.com/amanifeunou/TaLLIP_Dataset, contains train/test text files but no visible licence. Neither establishes a dataset licence; use and redistribution terms remain **UNVERIFIED**.
- **Known Limitations**:
  - Domain inventory differs by source (six named in READMEs; seven domain files in second repository); cross-domain transfer and exact file relationships require verification.
  - Real-world digital Hindi text often contains transliterated English or code-mixing, whereas this corpus focuses primarily on standard Devanagari text.
- **Suitability for VeriNews**:
  - **Potential Hindi candidate only**, pending content/label, provenance and dataset licence confirmation. Repository filenames indicate Hindi train/test text files, but their language quality and suitability are not independently validated.

---

### 2.2 HinFakeNews (LFWE Benchmark)

- **Original Source & Access**:
  - Introduced by researchers at PES University, Bengaluru.
  - ResearchGate / ACM Digital Library: [LFWE: Linguistic Feature Based Word Embedding](https://dl.acm.org/)
- **Primary Research Paper**:
  - Sharma, R., & Arya, A. (2023). *"LFWE: Linguistic Feature Based Word Embedding for Hindi Fake News Detection."* *ACM Transactions on Asian and Low-Resource Language Information Processing (ACM TALLIP)*.
- **Language**: Hindi (Devanagari script).
- **Verifiable Record Count**:
  - Total records: **~33,300** annotated Hindi news articles.
- **Label Definitions**:
  - Coarse-grained binary classification: `Real` vs. `Fake`.
  - Fine-grained topical categorization: `World`, `India`, `Politics`, `News`, `Fact-Check`.
- **Class Balance**:
  - Sourced systematically from International Fact-Checking Network (IFCN) signatories and mainstream Hindi media houses.
- **Dataset Format**:
  - Tabular features including title, raw article text, metadata, category, and binary truth label.
- **Licence & Usage Restrictions**:
  - **RESTRICTED / UNRELEASED AS A DIRECT PUBLIC REPOSITORY**.
  - As of 2024/2026, the authors have not released an open GitHub or Kaggle download link in the core publication. Researchers must request the dataset directly from the authors (Richa Sharma or Dr. Arti Arya at PES University) via formal institutional inquiry.
- **Known Limitations**:
  - Lack of a direct, permanent public URL prevents reproducible, automated cloning in solo developer workflows.
- **Suitability for VeriNews**:
  - **Theoretically Excellent, Practically Blocked**. Highly valuable benchmark in published literature, but cannot serve as our primary dataset due to access barriers.

---

### 2.3 IFND (Indian Fake News Dataset)

- **Original Source & Access**:
  - Author-maintained GitHub repository: [sonalgarg174/Dataset](https://github.com/sonalgarg174/Dataset)
  - Kaggle: [Indian Fake News Dataset](https://www.kaggle.com/)
  - Hugging Face Mirror: `keplersystems/tts-news-dataset`
- **Primary Research Paper**:
  - Sharma, D. K., & Garg, S. (2021/2023). *"IFND: a benchmark dataset for fake news detection."* *Complex & Intelligent Systems*, Springer.
- **Language**:
  - Paper/repository passages checked do not specify per-row language; reported English/Hindi coverage needs archive validation.
- **Verifiable Record Count**:
  - Paper reports 56,868; author repository contains `IFND.csv`, row count not inspected. Prior project notes cite 56,713; discrepancy remains unexplained.
- **Label Definitions**:
  - Author repository README maps `1=True`, `0=Fake` (**REPOSITORY-REPORTED**).
- **Class Balance**:
  - Sourced from accredited Indian fact-checking platforms (*Alt News*, *BOOM Live*) for fake claims, and verified mainstream publications (*NDTV*, *The Tribune*, *Times Now*, *The Statesman*) for real news.
- **Dataset Format**:
  - CSV file with columns: `id`, `Statement`, `Image`, `Category`, `Date`, `Label`.
- **Licence & Usage Restrictions**:
  - Paper is CC BY 4.0, but that is the publication licence, not the data licence. Repository README says research-purpose use only; formal dataset licence/redistribution rights remain **UNVERIFIED**.
- **Known Limitations**:
  - *Multimodal & Short Text Focus*: The paper describes statement/title and image fields. Actual statement lengths and availability of full article bodies require archive inspection.
  - *Language*: Per-row language and language tags are unverified. Do not assume English/Hindi mix or use script regex for language labels before archive inspection.
- **Suitability for VeriNews**:
  - **Unresolved possible supplementary dataset**. Not approved for independent evaluation pending archive, language, overlap, augmentation and rights review.

---

### 2.4 BharatFakeNewsKosh (BFNK)

- **Original Source & Access**:
  - Public research distribution on Kaggle and ResearchGate.
- **Primary Research Papers**:
  - Associated with *BharatFakeNewsTracker* and *BharatAuthenticNet* publications (2023–2024).
- **Language**: Multilingual Indian context (Hindi, English, regional dialects).
- **Verifiable Record Count**: ~26,000 records.
- **Label Definitions**: Binary veracity.
- **Known Limitations**:
  - High noise level; contains heavily unformatted social media posts, WhatsApp forwards, and code-mixed snippets that violate VeriNews' strict Devanagari-only MVP scope.
- **Suitability for VeriNews**:
  - **Not Selected for Baseline**. Too noisy for clean TF-IDF training in an MVP.

---

## 3. Comparative Synthesis & Candidate Recommendation

| Dataset | Record Status | Language | Format | License Status | Direct Accessibility | Full Article Text? | Recommendation Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **TaLLIP** | Train/Test `.txt` files listed; count/content uninspected | Hindi claimed among five languages | `.txt` listed; schema unverified | Code MIT in Arko98 repo; dataset licence unverified | Two public repositories | Unknown pending content inspection | Potential candidate only; provenance/rights audit required |
| **HinFakeNews** | ~33,300 (Paper-reported) | Hindi (Devanagari) | Tabular | Restricted | Author Request Only | Yes | Blocked (No open link) |
| **IFND** | Paper: 56,868; prior notes: 56,713; repo CSV row count not inspected | Language per record unverified | `IFND.csv` in author repo | Research-only README; formal licence unverified | Public repo | Statement/title + image URL and metadata | Not approved for external evaluation pending version/language/rights audit |
| **BFNK** | ~26,000 (Paper-reported) | Multi / Mixed | CSV | Academic | Kaggle | No (Social posts) | Excluded (High noise) |

### TaLLIP Candidate Status
TaLLIP is a potential English/Hindi research candidate, not an approved training dataset. Before selection, inspect user-provided copies of the listed text files for language/script, schema, labels, counts, duplicates and data quality, and obtain explicit dataset reuse terms. The README's six domains, paper abstract's seven domains and second repository's seven domain-named files (including Sports) are not yet reconciled. IFND is not approved as an independent test set pending version, language, augmentation, overlap and rights review.

## Audit update — evidence status (accessed 2026-11-06)

- **TaLLIP**: [Arko98 repository](https://github.com/Arko98/TALLIP-FakeNews-Dataset), [second repository](https://github.com/amanifeunou/TaLLIP_Dataset), and paper [DOI 10.1145/3472619](https://doi.org/10.1145/3472619) checked 2026-11-06. README sources identify English, Hindi, Swahili, Vietnamese and Indonesian plus multilingual train/test data; READMEs list six domains, paper abstract says seven. Second-repository recursive tree contains seven domain-named `.txt` files for English/Hindi: Business, Celebrity, Education, Entertainment, Politics, Sports, Technology. This suggests Sports is omitted from README lists, but source/version equivalence is **UNVERIFIED**. Text files are listed online; counts and contents/labels not inspected. Arko98 code licence is MIT; second repository has no visible licence. Dataset licence remains **UNVERIFIED**. English/Hindi are potentially useful only after content, labels, provenance and rights review.
- **IFND**: [paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC8520332/), [author dataset repository](https://github.com/sonalgarg174/Dataset), [README](https://github.com/sonalgarg174/Dataset/blob/main/README.md), and [contents API](https://api.github.com/repos/sonalgarg174/Dataset/contents) checked 2026-11-06. Paper reports 56,868 and artificial fake-text augmentation; initial fake count 7,271 and final table 37,809 true + 19,059 fake imply 11,788 augmented fake rows, while text also mentions scraping 20,000 additional real items without a clear reconciliation. Repository has `IFND.csv`; README gives `1=True`, `0=Fake`, and “research purposes only.” Paper CC BY 4.0 applies to the article, not automatically the dataset; GitHub API has no licence field. Prior 56,713 remains unexplained. Language per row, archive row count/content and dataset redistribution terms remain **UNVERIFIED / REQUIRES ARCHIVE INSPECTION**. Not approved as an independent external test pending language, overlap, augmentation/version and rights review.

Hindi script is not equivalent to Hindi language. Measure language/script distribution on actual files. Compare raw text and language-specific preprocessing experimentally; do not assume stopword removal, stemming or lemmatization help.
