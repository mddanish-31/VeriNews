# VeriNews Dataset Provenance and Licence Review

**Date**: 2026-11-09  
**Status**: Comprehensive Legal, Provenance, and Licensing Audit  
**Scope**: Evaluates all 4 candidate corpora (`WELFake`, `ISOT`, `TaLLIP Hindi`, and `IFND`) against commercial viability, non-commercial research terms, redistribution constraints, and semantic label integrity.

---

## 1. Executive Summary

| Dataset | Primary Source & Authors | Verified Licence on Origin | Commercial Use Cleared? | Redistribution Permitted? | Scientific / Academic Use? | Production Deployment Decision |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **WELFake** | Verma et al. (2021), IEEE / Zenodo | CC BY 4.0 | **Conditional** (Attribution required) | Yes (with attribution) | Yes | **BLOCKED**: Unresolved label semantics conflict (0 vs 1 definition). |
| **ISOT** | Ahmed et al. (2017), Univ. of Victoria ISOT Lab | Academic Non-Commercial Terms | **NO** (Strictly non-commercial) | Restrained (Academic request) | Yes | **RESEARCH / BENCHMARK ONLY**: Permitted for evaluation; barred from commercial release. |
| **TaLLIP Hindi** | Patel et al. (2021), IIT Hyderabad / IIT Patna | ACM Publications Academic Terms | **NO** (Academic research only) | Restrained (Cite ACM paper) | Yes | **RESEARCH / BENCHMARK ONLY**: Permitted for classical Hindi baseline evaluation. |
| **IFND** | Kar et al. (2021), Mendeley Data / Elsevier | CC BY 4.0 | **YES** (With proper attribution) | Yes (Attribution required) | Yes | **APPROVED AS HEADLINE BENCHMARK**: Permitted for research and derivative works. |

---

## 2. Detailed Dataset Audits

### 2.1 WELFake (Word-Enhanced Learning for Fake News Detection)

* **Provenance Reference**: Zenodo Record `4561253` (DOI: `10.5281/zenodo.4561253`), published alongside IEEE Transactions on Technology and Society (Verma, Agrawal, Patel, 2021).
* **Licence Stated on Repository**: Creative Commons Attribution 4.0 International (`CC BY 4.0`).
* **Source Lineage**: The dataset is an amalgam of four previously published datasets:
  1. Kaggle Fake News (William Yang).
  2. McIntyre Fake News.
  3. Reuters News.
  4. BuzzFeed News.
* **Licence Analysis**:
  * CC BY 4.0 formally allows sharing, copying, and adapting the material for both commercial and non-commercial purposes, provided reasonable attribution is given.
  * However, the upstream rights of individual journalistic articles scraped into the component corpora (BuzzFeed, Reuters) were compiled under research fair-use doctrines.
* **Critical Integrity Blocker**:
  > [!CAUTION]
  > **Fatal Label Semantics Inversion**:
  > The Zenodo release text verbally states: `0 = Fake, 1 = Real`.
  > Conversely, the Zenodo summary metadata states: `35,028 Real news, 37,106 Fake news`.
  > In the actual `WELFake_Dataset.csv` file, the label counts are exactly:
  > * Label `0`: **35,028 rows**
  > * Label `1`: **37,106 rows**
  > 
  > This creates an irreconcilable contradiction: if `0 = Fake`, then there are 35,028 Fake rows (contradicting the summary); if `0 = Real`, then the verbal readme is reversed.
  > 
  > **Decision**: **STRICTLY BLOCKED FROM TRAINING**. Without direct clarification from the primary authors, training on WELFake risks training an inverted classifier that flags authentic journalism as fake.

---

### 2.2 ISOT Fake News Dataset

* **Provenance Reference**: University of Victoria, Information Security and Object Technology (ISOT) Research Lab (Victoria, BC, Canada). Ahmed, Traore, Saad (2017), published in *Journal of Information Security and Applications*.
* **Licence Stated on Repository**: ISOT Academic Terms of Use: *"The dataset is made available for academic research and non-commercial educational purposes only."*
* **Source Lineage**:
  * Real news: Scraped directly from `Reuters.com` between 2016 and 2017.
  * Fake news: Extracted from websites flagged by PolitiFact and fact-checked claims.
* **Licence Analysis**:
  * **Commercial Use**: **PROHIBITED**. The University of Victoria terms explicitly disallow incorporation into commercial SaaS products or revenue-generating services.
  * **Redistribution**: Restricted; derivative models trained solely on ISOT may be subject to the academic non-commercial restriction.
  * **Academic / Research**: **FULLY PERMITTED**. Validated as a benchmark baseline for comparative NLP evaluation.
* **Integrity & Leakage Findings**:
  * The dataset is cleanly split into `True.csv` and `Fake.csv`, eliminating label ambiguity.
  * Real news articles uniformly originate from Reuters, introducing journalistic style and dateline leakage (`WASHINGTON (Reuters) - `) which must be aggressively stripped prior to NLP training.
* **Decision**: **APPROVED FOR BENCHMARKING ONLY**. Cannot be packaged into a commercial SaaS production deployment.

---

### 2.3 TaLLIP Hindi Fake News Dataset

* **Provenance Reference**: ACM Transactions on Asian and Low-Resource Language Information Processing (ACM-TALLIP, 2021). Patel, Sharma, Patel (IIT Hyderabad, IIT Patna). Repository: `TaLLIP_Dataset-main`.
* **Licence Stated on Repository**: Standard academic research release under ACM publication ethics.
* **Source Lineage**:
  * 980 total records (950 unique) collected across 7 categories (Celebrity, Politics, Sports, Technology, Entertainment, Business, Education) in Hindi Devanagari.
  * Fact-checked via verified Indian fact-checking initiatives (e.g., AltNews, BoomLive, Vishwas News).
* **Licence Analysis**:
  * **Commercial Use**: **UNVERIFIED / RESTRICTED**. Standard academic publication repositories do not convey automatic commercial exploitation rights without express author agreement.
  * **Academic / Research**: **PERMITTED** for low-resource Indian language fake news research with paper citation.
* **Integrity & Capacity Findings**:
  * Contains authentic Devanagari script text with author-provided train/test splits.
  * Size limitation (950 unique records) limits baseline generalization; character n-grams are required to overcome vocabulary sparsity.
* **Decision**: **APPROVED FOR HINDI BASELINE RESEARCH**.

---

### 2.4 IFND (Indian Fake News Dataset)

* **Provenance Reference**: Mendeley Data / Elsevier (Kar, Maharana, Mohapatra, 2021). DOI: `10.17632/z3pt4nnksv.1`.
* **Licence Stated on Repository**: Creative Commons Attribution 4.0 International (`CC BY 4.0`).
* **Source Lineage**:
  * 56,714 raw news statements and claims (50,950 usable unique) focusing on Indian news stories published between 2013 and 2021.
  * Sourced from 29 distinct web domains (mainstream Indian dailies and fact-checking websites).
* **Licence Analysis**:
  * **Commercial Use**: **PERMITTED** under CC BY 4.0 with proper author attribution.
  * **Redistribution & Adaptation**: **PERMITTED**. Derivative models and benchmarks may be published.
* **Integrity & Formatting Findings**:
  * Text entries are concise statements and headlines ($\mu = 80.2$ characters, max 348 characters), rather than long-form articles.
  * Extreme publisher segregation: 24 of 29 publishers exclusively publish either 100% True or 100% Fake statements.
* **Decision**: **APPROVED AS SEPARATE INDIAN HEADLINE BENCHMARK**. Must not be conflated with full-length journalistic article classifiers.

---

## 3. Commercial vs. Academic Readiness Summary

```
                      [Candidate Corpora]
                               |
         +---------------------+---------------------+
         |                                           |
    [Full Articles]                           [Short Headlines]
         |                                           |
   +-----+-----+                                     |
   |           |                                     |
[ISOT (EN)] [TaLLIP (HI)]                        [IFND (EN/IN)]
   |           |                                     |
Academic    Academic                            CC BY 4.0
Non-Comm    Non-Comm                         Commercial Ready
(Benchmark) (Benchmark)                         (Benchmark)
   |           |                                     |
   +-----------+-------------------------------------+
                       |
             [WELFake (EN)] -> BLOCKED (Label Inversion Blocker)
```

1. **Production Deployment Recommendation**:
   * For the immediate research preview phase, `ISOT` (English) and `TaLLIP` (Hindi) baselines serve as rigorous academic benchmarks.
   * If commercial SaaS deployment is pursued in future releases, models must either be trained exclusively on rights-cleared corpora (`CC BY 4.0` / public domain) or licensed directly from publisher syndication feeds.
2. **Next Steps**:
   * Maintain WELFake in blocked state until written clarification is obtained from the IEEE/Zenodo authors.
   * Retain `ModelService` prediction gating (`is_english_ready: false`, `is_hindi_ready: false`) until mentor review approves phase progression.

