# VeriNews P01 — B-07: WELFake Upstream Content Rights Investigation Report (Evidence Correction Audit)

**Execution Label:** P01 Task Investigation (B-07 Evidence Correction Audit)  
**Historical Mapping:** Historical H-05 / Requirement P01-R11  
**Audit Date:** 2026-11-10  
**Investigator Role:** Senior Research Auditor, Dataset Rights Investigator & Research Governance Lead  
**Workflow:** VeriNews Ponytail Workflow (Evidence-First, Standard-Library-First, CPU-Friendly, Non-Destructive)  
**Current Blocker Status:** **`UNRESOLVED — UPSTREAM PROPRIETARY CONTENT RIGHTS NOT CONVEYED BY COMPILATION LICENCE; COMMERCIAL REUSE & REDISTRIBUTION SCOPE UNRESOLVED`**  
**Dataset Training Disposition:** **WELFake REMAINS ON HOLD — NOT APPROVED FOR LOCAL TRAINING, PUBLIC DEMONSTRATION, OR COMMERCIAL DEPLOYMENT**  

---

## 1. Executive Summary

This report provides the evidence-corrected audit of canonical blocker **B-07 — WELFake Upstream Content Rights (Historical H-05 / Requirement P01-R11)**.

WELFake is a merged secondary corpus of 72,134 records compiled by Pawan Kumar Verma, Prateek Agrawal, and Radu Prodan (Zenodo Record 4561253; IEEE TCSS 2021). The depositors marked the Zenodo deposit with a Creative Commons Attribution 4.0 International (**CC BY 4.0**) metadata tag. However, the underlying text of WELFake consists entirely of articles aggregated from four external corpora:
1. **William Lifferth (2018) Kaggle Competition Dataset** (20,800 records).
2. **George McIntire (2016/2017) GitHub Dataset** (6,335 records).
3. **ISOT Fake News Dataset** (Ahmed, Traore & Saad 2018 / Univ. of Victoria; 44,898 logical records).
4. **BuzzFeed Political Candidate Component** (Horne & Adali 2017 / Craig Silverman 2016; 101 records in Table III; B-06 partially resolved).

### Key Audit Findings & Corrections:
1. **Compilation Rights vs. Underlying Content Rights:** The Zenodo CC BY 4.0 declaration legally attaches only to the compilation, schema, and metadata created by the depositors. Under established copyright law in major jurisdictions, an aggregator's open-access compilation declaration does **not** grant or sublicense copyright permissions over third-party proprietary journalistic text.
2. **Correction Regarding the ISOT Quoted Restriction:** Previous secondary project notes (`dataset-provenance-and-licence-review.md`) quoted: *"The dataset is made available for academic research and non-commercial educational purposes only."* Direct inspection of the official University of Victoria ISOT owner page and official README PDF confirms that **this exact phrase does not appear as a formal dataset licence grant or restriction on the official UVic portal**. The UVic download portal provides dataset descriptions and downloads without an explicit dataset-specific reuse licence. Consequently, this quotation is **UNVERIFIED AS A PRIMARY TEXTUAL RESTRICTION**, and B-10 (ISOT dataset licence) remains independently UNRESOLVED.
3. **Proprietary Publisher Copyright:** Authentic news text in WELFake originates from commercial news organizations—chiefly *Reuters* (via ISOT `True.csv`), *The New York Times*, *The Washington Post*, *The Wall Street Journal*, *Politico*, and *Breitbart News*. These publishers hold proprietary copyrights and publish explicit terms of service (e.g., Reuters Terms of Use: *"You may not copy, reproduce, republish, distribute, transmit, or commercially exploit any content without express written consent"*).
4. **Jurisdictional & Factual Dependence (No Blanket Legal Conclusion):** The legal defensibility of computational text ingestion depends on jurisdiction, the specific purpose (commercial vs. non-commercial research), and applicable exceptions (such as Fair Use under 17 U.S.C. § 107 in the US, Text and Data Mining exceptions under EU Directive 2019/790, or UK CDPA § 29A). This report does **not** issue a definitive legal opinion, nor does it assert that all downstream machine learning models are automatically infringing or that research exceptions provide blanket immunity.
5. **Separation of Activity Permissions:** Downstream use cannot be categorized with a single label; rights vary substantially between local non-commercial research inspection, model training, model weight distribution, public text excerpting, raw article redistribution, and commercial SaaS deployment.

**B-07 Disposition:** **UNRESOLVED**. Upstream proprietary news rights remain un-cleared by the compilation licence. WELFake remains strictly **ON HOLD**.

---

## 2. Scope and Methodology

### 2.1 Scope
This correction audit is narrowly scoped to B-07. It establishes what primary evidence confirms regarding rights chains, removes unverified quotations and legal overstatements, and defines activity-specific risk boundaries.

**Strict Scope Boundaries:**
- Preserves the factual closures of B-01 (label semantics), B-02 (record count), B-03 (Lifferth source identity), B-04 (McIntire source identity), and B-05 (ISOT source identity).
- Preserves the partially resolved status of B-06 (BuzzFeed Political).
- Does not modify raw data or repository code.

### 2.2 Methodology
- **Standard-Library-First & Read-Only:** All file checks and text audits use standard system tools without raw dataset modification.
- **Evidence Hierarchy:** Primary publisher terms of service, official academic repository terms, and statutory copyright principles take precedence over secondary project notes.
- **No Contact Rule:** No authors, publishers, or academic institutions were contacted.
- **No Legal Opinion:** The audit distinguishes verified primary facts from legal risks, avoiding categorical legal determinations.

---

## 3. Rights-Layer Separation

Text datasets collected from the web operate across distinct copyright layers that cannot be conflated:

```
+-------------------------------------------------------------------------+
| Layer 1: Underlying Journalistic Works & Literary Text                  |
| Rights Holders: News Publishers (Reuters, NYT, WP, Politico, etc.)      |
| Status: Proprietary Copyright; All Rights Reserved                      |
+-------------------------------------------------------------------------+
                                    |
                                    v (Scraped into intermediate corpora)
+-------------------------------------------------------------------------+
| Layer 2: Intermediate Curated Corpora                                   |
| Curators: Lifferth (Kaggle), McIntire, Ahmed et al. (ISOT), Horne-Adali |
| Status: Academic Benchmarks; Unlicensed / Unspecified Terms             |
+-------------------------------------------------------------------------+
                                    |
                                    v (Aggregated into single CSV)
+-------------------------------------------------------------------------+
| Layer 3: Secondary Compilation & Selection                              |
| Compilers: Verma, Agrawal & Prodan (WELFake)                            |
| Status: Zenodo Record 4561253 with CC BY 4.0 Metadata Declaration       |
+-------------------------------------------------------------------------+
                                    |
                                    v (Downstream Utilization)
+-------------------------------------------------------------------------+
| Layer 4: Downstream Use Cases (VeriNews Project)                        |
| Activities: Local Research, Training, Public Demo, Commercial SaaS       |
+-------------------------------------------------------------------------+
```

### Rights-Layer Evaluation:

| Rights Layer | Subject Matter | Claimed Rights Holder | Governing Terms / Evidence Status | VeriNews Assessment |
|---|---|---|---|---|
| **Layer 1: Original Article Text** | Full-length news articles, investigative journalism, and commentary. | Original Publishers (*Reuters*, *The New York Times*, *The Washington Post*, etc.) | Terms of Service; statutory copyright (all rights reserved). Scraped without documented licenses. | **Proprietary**. Rights were never conveyed to dataset curators or downstream users. |
| **Layer 2: Headlines & Excerpts** | Article titles and short lead-ins. | Original Authors / Publishers | Protected under copyright where sufficient original expression exists. | **Proprietary / Mixed**. Often cited under quotation/fair use, but bulk distribution remains restricted. |
| **Layer 3: Compilation Selection & Schema** | CSV layout, column naming, index mapping, and dataset curation. | Verma, Agrawal & Prodan (WELFake depositors) | Creative Commons Attribution 4.0 International (**CC BY 4.0**). | **Valid Compilation Declaration**. Applies to the compilation metadata and structure only; does not license Layer 1 text. |
| **Layer 4: Intermediate Corpus Licences** | Intermediate collection packages (Kaggle, McIntire repo, UVic ISOT archive, Horne & Adali zip). | Intermediate Compilers (Lifferth, McIntire, Ahmed et al., Horne & Adali) | Kaggle competition terms; unlicensed GitHub repository; UVic portal without explicit dataset licence. | **Unresolved / Unclear**. No documented commercial redistribution authority exists. |
| **Layer 5: Platform Hosting Terms** | Zenodo deposit, Kaggle hosting, GitHub repositories. | Platform Operators (CERN/Zenodo, Google/Kaggle, GitHub) | Terms of Service governing platform liability, metadata indexing, and user representations. | Depositor warrants authority to upload; platforms disclaim liability for third-party copyright claims. |

---

## 4. Component-by-Component Investigation

### 4.1 Component 1: William Lifferth (2018) Kaggle Competition Dataset
- **Contribution in WELFake:** Exactly 20,800 records (Table III: 10,387 Reliable, 10,413 Unreliable).
- **Original Source:** Kaggle Competition: *Fake News: Build a system that can identify unreliable news articles* (`https://www.kaggle.com/competitions/fake-news`).
- **Creator / Depositor:** William Lifferth.
- **Original Content Origin:** News articles scraped from diverse online sources during the 2016 US presidential election cycle (including articles from *The New York Times*, *Breitbart*, etc.).
- **Licence Terms Found:** Kaggle competition datasets are governed by competition-specific rules for evaluating participant submissions. No open-source or commercial redistribution licence (such as CC BY or MIT) was attached to the underlying article texts.
- **Rights Assessment:** Lifferth did not obtain copyright assignments from *The New York Times* or other original publishers. The dataset was provided as an unlicenced competition benchmark.
- **Redistribution Rights:** **Unlicensed / Unresolved**.

### 4.2 Component 2: George McIntire (2016/2017) GitHub Dataset
- **Contribution in WELFake:** Exactly 6,335 records (Table III: 3,164 Real, 3,171 Fake).
- **Original Source:** GitHub repository `https://github.com/GeorgeMcIntire/fake_real_news_dataset` and KDnuggets article *"Getting Real about Fake News"*.
- **Creator / Depositor:** George McIntire.
- **Original Content Origin:** Authentic articles scraped from mainstream publications (*The New York Times*, *The Wall Street Journal*, *The Washington Post*, etc.); fake news compiled from Daniel Sieradski's BS Detector domain list.
- **Licence Terms Found:** The GitHub repository contains **no `LICENSE` file** and no textual copyright grant.
- **Rights Assessment:** Under standard copyright law and GitHub's Terms of Service, a public repository without an explicit open-source licence is all-rights-reserved by default. The underlying news articles remain the exclusive intellectual property of the scraped news organizations.
- **Redistribution Rights:** **Unlicensed / Missing Terms**.

### 4.3 Component 3: ISOT Fake News Dataset (Ahmed, Traore & Saad 2018)
- **Contribution in WELFake:** Exactly 44,898 logical records (Table III: 21,417 Real, 23,481 Fake; 62.2% of WELFake).
- **Original Source:** University of Victoria, Information Security and Object Technology (ISOT) Research Lab (`https://onlineacademiccommunity.uvic.ca/isot/2022/11/27/fake-news-detection-datasets/`).
- **Creators / Authors:** Hadeer Ahmed, Issa Traore, and Sherif Saad (University of Victoria, Victoria, BC, Canada).
- **Examination of Quoted Restriction:**
  - *Secondary Citation:* Project report `dataset-provenance-and-licence-review.md` cited: *"The dataset is made available for academic research and non-commercial educational purposes only."*
  - *Primary Re-Examination:* Primary inspection of the UVic ISOT page and the official README PDF (`ISOT_Fake_News_Dataset_ReadMe.pdf`) reveals that **this exact quotation does not appear in the official portal or README**.
  - *Status of Quoted Sentence:* **UNVERIFIED AS A PRIMARY TEXTUAL RESTRICTION**.
  - *Primary Fact:* The UVic portal provides download links and descriptive text, but does not provide an explicit dataset-specific reuse licence or redistribution grant. General UVic website terms and copyright notices apply to the website itself, not as an explicit open-access dataset licence.
- **Origin of Real News (`True.csv`):** Exactly 21,417 articles crawled directly from `Reuters.com` between 2016 and 2017.
- **Origin of Fake News (`Fake.csv`):** Exactly 23,481 articles extracted from websites flagged by PolitiFact and Wikipedia.
- **Rights Assessment:** Because the UVic portal offers no explicit dataset reuse licence, downstream rights depend on the proprietary status of the underlying scraped articles (predominantly Reuters).

### 4.4 Component 4: Reuters Content within ISOT
- **Contribution in WELFake:** At least 21,415 verified records (29.7% of WELFake).
- **Original Copyright Holder:** Thomson Reuters / Reuters News Agency.
- **Governing Legal Terms:** Reuters Terms of Use (`https://www.reuters.com/info-pages/terms-of-use/`):
  > *"All content ... is the property of Thomson Reuters or its licensors and is protected by copyright... You may not copy, reproduce, republish, distribute, transmit, or commercially exploit any content without express written consent."*
- **Rights Assessment:** Scraped news articles from Reuters remain proprietary copyright material. Neither the University of Victoria nor Verma et al. held written agreements from Thomson Reuters authorizing bulk redistribution or commercial exploitation.

### 4.5 Component 5: ISOT Fake-News Sources
- **Contribution in WELFake:** 23,481 records (32.6% of WELFake).
- **Original Creators:** Authors of flagged websites, hyperpartisan blogs, and fabricated news outlets.
- **Rights Assessment:** While practical enforcement risk from defunct hoax websites may be low, no affirmative copyright release or public domain dedication was ever executed.

### 4.6 Component 6: BuzzFeed Political Candidate Component (Horne & Adali 2017 / Silverman 2016)
- **Contribution in WELFake:** 101 records reported in Table III (candidate source in B-06 report).
- **Original Sources:**
  - Benjamin D. Horne & Sibel Adali (2017) `fakenewsdata1` / `Horne2017_FakeNewsData.zip`.
  - Craig Silverman et al. (2016) `BuzzFeedNews/2016-10-facebook-fact-check`.
- **Rights Assessment:** Authentic political news articles were published by commercial news publishers (*The New York Times*, *The Washington Post*, *Politico*, etc.). Neither Silverman nor Horne & Adali held commercial redistribution licenses from those publishers.

---

## 5. Original Licence Evidence Summary

| Dataset / Source | Claimed / Displayed Licence | Primary Source Location | Scope Covered by Licence | Does it Clear Underlying News Text? |
|---|---|---|---|:---:|
| **WELFake (Zenodo 4561253)** | Creative Commons Attribution 4.0 International (**CC BY 4.0**) | Zenodo Record HTML & API (`rights: cc-by-4.0`) | Deposited CSV file compilation, schema, and metadata only | **NO** (Depositor cannot license 3rd-party articles) |
| **WELFake Journal Article** | Creative Commons Attribution 4.0 International (IEEE Open Access) | IEEE TCSS 2021 publication metadata | The scholarly paper text, figures, and formatting | **NO** (Applies to the journal article, not the dataset) |
| **ISOT Dataset** | Unspecified / No explicit dataset licence found | University of Victoria ISOT Portal & Official README | Academic research download; no explicit reuse licence | **NO** (Underlying Reuters articles remain proprietary) |
| **McIntire Dataset** | No formal licence file (Unlicensed) | GitHub repository `fake_real_news_dataset` | All rights reserved by default under copyright law | **NO** (Scraped from commercial media without rights) |
| **Kaggle / Lifferth** | Kaggle Competition Terms | Kaggle Competition Page (`fake-news`) | Competition participation and model evaluation | **NO** (No third-party news copyright conveyance) |
| **Horne & Adali (BuzzFeed)** | Academic Research Benchmark | Academic paper & repository distribution | NLP research benchmark | **NO** (Scraped news articles remain copyrighted) |
| **Thomson Reuters** | Proprietary All Rights Reserved | `Reuters.com` Terms of Service | Commercial news distribution | **NO** (Scraped without commercial permission) |

---

## 6. Upstream Article Copyright Analysis

### 6.1 Compilations vs. Underlying Works
In statutory copyright law (e.g., 17 U.S.C. § 103 in the United States, and equivalent provisions internationally):
- Copyright in a compilation extends only to the material contributed by the author of the compilation (selection, coordination, arrangement).
- It does not extend to the preexisting material employed in the work.
- It does not imply any exclusive right in the preexisting material, nor does it alter or destroy the copyright protection of the preexisting material.
- Therefore, attaching a CC BY 4.0 badge to `WELFake_Dataset.csv` on Zenodo does not convert proprietary Reuters or New York Times articles into CC BY 4.0 material.

### 6.2 Jurisdictional Boundaries of Research Exceptions
The legal defensibility of ingesting copyrighted news articles for computational analysis depends on the governing jurisdiction:
- **United States:** Governed by Fair Use (17 U.S.C. § 107). Four-factor balancing tests evaluate the purpose of use (transformative vs. commercial), nature of the work, amount used, and market effect. While non-commercial academic machine learning research often presents strong fair-use arguments, fair use is an affirmative defense determined on case-by-case facts; it is not an automatic statutory exemption.
- **European Union:** Governed by Articles 3 and 4 of Directive (EU) 2019/790 (Digital Single Market). Article 3 permits text and data mining (TDM) for scientific research by research organizations, while Article 4 permits general TDM unless rights holders have expressly reserved rights (opt-out).
- **United Kingdom & Others:** Section 29A of the CDPA provides an exception for computational analysis for non-commercial research, requiring lawful access.
- **Legal Auditor Statement:** This report does **not** provide legal advice. It does not conclude that computational training is universally lawful or unlawful, but recognizes that legal risk varies by jurisdiction and use case.

---

## 7. Activity-by-Activity Rights & Risk Analysis

To avoid unsupported categorical claims, permissions and risks must be evaluated separately for each distinct downstream activity:

### 7.1 Local Read-Only Inspection
- **Activity:** Opening and reading the local CSV file on disk for research auditing, checking schemas, or computing token lengths.
- **Legal Context:** Purely internal, non-consumptive observation of lawfully possessed local files. Does not involve public performance, display, or distribution.
- **Risk Assessment:** **Low Risk**. Standard research practice; no copyright distribution is triggered.

### 7.2 Non-Commercial Academic Research
- **Activity:** Conducting non-commercial statistical analysis, lexical audits, or comparative benchmarking published in academic papers.
- **Legal Context:** Strongly supported by academic research exceptions and fair-use doctrines across major legal jurisdictions.
- **Risk Assessment:** **Low to Moderate Risk**. Standard scholarly activity; publication of aggregate statistics and findings does not infringe underlying copyrights.

### 7.3 Model Training (Feature Extraction)
- **Activity:** Training local neural or linear classifiers where model parameters ingest text features.
- **Legal Context:** Whether model training is transformative fair use or permitted text-and-data mining is an evolving legal question globally. Where models do not memorize or regenerate substantial copyrighted text, fair-use arguments are substantial in research contexts. However, training on unapproved data remains governed by project-internal approval gates.
- **Risk Assessment:** **Moderate Risk (Legal) / High Risk (Governance)**. Blocked internally by project policy pending mentor authorization.

### 7.4 Public Redistribution of Raw Articles
- **Activity:** Hosting, mirroring, or redistributing `WELFake_Dataset.csv` containing full text of thousands of copyrighted articles.
- **Legal Context:** Direct distribution of full literary works. Scraped news text has not been licensed for public redistribution.
- **Risk Assessment:** **High to Critical Risk**. Directly infringes publishers' exclusive distribution rights under statutory copyright law.

### 7.5 Distribution of Trained Model Weights
- **Activity:** Distributing serialized model weights (e.g. Scikit-learn or PyTorch checkpoints).
- **Legal Context:** Model weights themselves generally do not constitute direct copies of training text, unless models can be inverted to extract verbatim articles. However, if intermediate datasets contain contractual or non-commercial restrictions, whether restrictions run with the weights remains legally unsettled.
- **Risk Assessment:** **Moderate Risk**. Subject to evolving legal doctrine on AI weights as derivative works.

### 7.6 Commercial Deployment / SaaS Production Release
- **Activity:** Incorporating models trained on WELFake into a commercial, revenue-generating SaaS product.
- **Legal Context:** Commercial exploitation substantially weakens fair-use defenses and exceeds non-commercial research exceptions. Major news publishers actively challenge commercial AI exploitation of their news archives without enterprise licensing agreements.
- **Risk Assessment:** **High Risk / Legally Constrained**. Commercial release without publisher licensing agreements presents material legal exposure.

---

## 8. Commercial-Use Implications

1. **Commercial Uncertainty:** Deploying WELFake in a commercial SaaS environment creates significant legal uncertainty because underlying articles were harvested from commercial news outlets without commercial licensing terms.
2. **Publisher Licensing Trends:** Commercial news organizations (such as Thomson Reuters and The New York Times) actively enforce copyright against commercial AI systems that incorporate scraped journalistic archives without commercial data licenses.
3. **No Definitive Universal Bar:** While commercial deployment is not automatically enjoined by criminal statute, it introduces civil copyright exposure that a production system cannot assume without explicit licensing or formal legal review.

---

## 9. Evidence Gaps

The following evidence gaps remain unresolved:
1. **Unverified Status of ISOT Quotation:** The phrase *"The dataset is made available for academic research and non-commercial educational purposes only"* was cited in secondary notes but is unverified from primary UVic portal text or the README PDF.
2. **Absence of Publisher Licences:** No primary evidence demonstrates that Verma et al., the University of Victoria, or George McIntire ever entered into copyright licensing agreements with Reuters, The New York Times, or other commercial publishers.
3. **Absence of Sublicensing Chain:** Zenodo Record 4561253 contains no documentation establishing depositor authority to sublicense third-party journalistic text under CC BY 4.0.

---

## 10. Risk Classification Summary

| Downstream Activity | Risk Level | Primary Constraint | Governance State |
|---|:---:|---|---|
| **Local Inspection** | Low | None | Permitted internally |
| **Academic Research** | Low | Citation required | Permitted internally |
| **Model Training** | Moderate | Fair use / TDM boundaries | Blocked by project hold |
| **Raw Article Redistribution** | High | Proprietary publisher copyright | Prohibited |
| **Weight Distribution** | Moderate | Derivative work ambiguity | Deferred pending review |
| **Commercial SaaS Deployment** | High | Scraped proprietary news text | Not cleared |

---

## 11. Final B-07 Disposition

### Disposition:
**`UNRESOLVED — UPSTREAM PROPRIETARY CONTENT RIGHTS NOT CONVEYED BY COMPILATION LICENCE; COMMERCIAL REUSE & REDISTRIBUTION SCOPE UNRESOLVED`**

### Rationale:
1. Zenodo's CC BY 4.0 declaration legally covers only the curation and metadata compilation, not the underlying proprietary news text.
2. The authentic news articles in WELFake originate from commercial journalism publishers (*Reuters*, *The New York Times*, etc.) without documented licensing agreements.
3. The exact licensing status of the ISOT component remains unverified on the official UVic portal (covered independently under B-10).
4. Fair Use and TDM defenses vary by jurisdiction and factual context, and do not provide an automatic guarantee of commercial or redistribution rights.
5. In accordance with VeriNews operating principles, B-07 cannot be closed without primary evidence of third-party copyright clearance or formal mentor policy.
6. WELFake remains strictly **ON HOLD** for model training and public portfolio demonstration.

---

## 12. Remaining Actions

1. **Maintain Training Hold:** Keep WELFake on hold for local model training.
2. **Prioritize Rights-Cleared Datasets:** Direct Phase P01 research toward datasets with explicit, verified rights chains (such as public domain text or headline benchmarks).
3. **Mentor Review Submission:** Submit this activity-separated risk analysis in the Mentor Approval Dossier for owner/mentor decision.

---

## 13. Reproducibility and Source Register

| Entity / Source | Canonical Reference / URL | Date Accessed | Evidence Type |
|---|---|:---:|---|
| **Zenodo Record 4561253** | `https://zenodo.org/records/4561253` (API: `https://zenodo.org/api/records/4561253`) | 2026-11-10 | Primary Deposit Metadata |
| **IEEE Journal Paper** | DOI: `10.1109/TCSS.2021.3068519` | 2026-11-10 | Primary Bibliographic Reference |
| **University of Victoria ISOT Lab** | `https://onlineacademiccommunity.uvic.ca/isot/2022/11/27/fake-news-detection-datasets/` | 2026-11-10 | Primary Academic Portal |
| **ISOT Official README PDF** | `https://onlineacademiccommunity.uvic.ca/isot/wp-content/uploads/sites/7295/2023/02/ISOT_Fake_News_Dataset_ReadMe.pdf` | 2026-11-10 | Primary Documentation Lead |
| **George McIntire Repository** | `https://github.com/GeorgeMcIntire/fake_real_news_dataset` | 2026-11-10 | Intermediate Upstream Repository |
| **Kaggle Fake News Competition** | `https://www.kaggle.com/competitions/fake-news` | 2026-11-10 | Intermediate Upstream Repository |
| **Reuters Terms of Use** | `https://www.reuters.com/info-pages/terms-of-use/` | 2026-11-10 | Publisher Legal Terms |
| **Creative Commons Legal Code** | CC BY 4.0 Legal Code (`https://creativecommons.org/licenses/by/4.0/legalcode`) | 2026-11-10 | Statutory Licence Specification |
| **US Copyright Act** | 17 U.S.C. § 107 (Fair Use) & § 103 (Compilations) | 2026-11-10 | Statutory Legal Standard |
