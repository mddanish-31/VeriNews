# VeriNews P01 — B-08: Indic Zenodo Hindi Licence Conflict Investigation Report (Evidence Correction Audit)

**Execution Label:** P01 Task Investigation (B-08 Evidence Correction Audit)  
**Historical Mapping:** Historical P01-R18 / Blocker B-08  
**Audit Date:** 2026-11-10  
**Investigator Role:** Senior Research Auditor, Dataset Rights Investigator & Research Governance Lead  
**Workflow:** VeriNews Ponytail Workflow (Evidence-First, Standard-Library-First, CPU-Friendly, Non-Destructive)  
**Current Blocker Status:** **`UNRESOLVED — CONFLICTING LICENCE EVIDENCE; PRECEDENCE AND SCOPE NOT ESTABLISHED`**  
**Dataset Training Disposition:** **INDIC ZENODO HINDI REMAINS NOT APPROVED — RESEARCH LEAD ONLY**  

---

## 1. Executive Summary

This report documents the evidence correction audit of canonical blocker **B-08 — Indic Zenodo Hindi Dataset Licence Conflict (Requirement P01-R18)**.

The Indic Zenodo Hindi dataset is an extracted local collection of 20,593 Hindi news text files (`data/raw/indic_zenodo/Hindi_F&R_News/`), originating from Zenodo Record 11408513. The investigation examined the relationship between two conflicting documentary representations of the dataset:
1. **The Primary Zenodo Repository Deposit (June 1, 2024):** Formally registers the dataset under Creative Commons Attribution 4.0 International (**CC BY 4.0**) in its deposit metadata.
2. **The Associated Peer-Reviewed Methodology Paper (Frontiers in AI, December 10, 2025):** States in its Data Availability Statement and Section 3 that the dataset is released under Creative Commons Attribution-NonCommercial 4.0 International (**CC BY-NC 4.0**).

### Key Audit Findings & Corrections:
1. **Zenodo API Record Preserved:** The exact API response for Zenodo Record 11408513 was retrieved and preserved verbatim. The metadata explicitly defines `metadata.license.id = "cc-by-4.0"`.
2. **Single Zenodo Version:** Zenodo's version-tracking metadata confirms that only a single published version exists (`relations.version: [{"index": 0, "is_last": true}]`). The Zenodo deposit has not been modified or superseded on the repository platform since its June 1, 2024 deposit.
3. **No File-Level Declarations:** Physical audit of all 20,593 local `.txt` files confirmed that zero files contain embedded licence text, copyright headers, or author notices.
4. **No Archive Documentation:** The deposited ZIP archive contains no `README.txt`, `LICENSE.txt`, or accompanying legal notice.
5. **OpenAIRE Indexing as Secondary Evidence:** OpenAIRE's display of `CC BY` indexes the Zenodo metadata API; it does not constitute an independent legal grant or separate verification.
6. **Precedence and Scope Unestablished (No Retroactive Amendment Inferred):** The 2025 Frontiers paper cannot be legally assumed to automatically or retroactively alter the 2024 Zenodo deposit terms. Conversely, the earlier Zenodo metadata does not invalidate the authors' later peer-reviewed statement of non-commercial intent. The difference may reflect distinct pipeline stages, release versions, or evolving curator intent. Absent documented author clarification, legal precedence and scope between the two statements remain unestablished.
7. **Underlying Content Rights:** Authentic news items were harvested from commercial news outlets (*The Hindu*, *The Indian Express*, *BBC Hindi*), and fake news items from fact-checking websites (*AltNews*, *BoomLive*, *Factly*) and social media (Twitter/X, Facebook). Rights to the underlying articles remain proprietary to the original publishers.
8. **Scope Independence:** B-08 is strictly confined to the licence conflict. It does not resolve B-09 (the archive-to-paper identity discrepancy of 20,593 vs. 20,493 files and 5,493 duplicate excess), which remains an independent unresolved blocker.

**B-08 Disposition:** **`UNRESOLVED — CONFLICTING LICENCE EVIDENCE; PRECEDENCE AND SCOPE NOT ESTABLISHED`**. Indic Zenodo Hindi remains **NOT APPROVED**.

---

## 2. Scope and Methodology

### 2.1 Scope
This investigation is strictly confined to B-08: establishing the exact Zenodo deposit metadata, file-level declarations, the Frontiers publication statement, and downstream licensing implications.

**Explicit Scope Exclusions (Governed Independently):**
- **B-09:** Archive-to-paper identity (20,593 local files vs. 20,493 paper-reported count; 5,493 duplicate excess).
- Label correctness and annotation guidelines.
- Model training, preprocessing, or experimental baseline evaluation.

### 2.2 Methodology
- **Direct API Retrieval:** The complete Zenodo API JSON response for Record 11408513 was retrieved directly and parsed.
- **Physical Archive Inspection:** The extracted local directory (`data/raw/indic_zenodo/Hindi_F&R_News/`) was audited across all 20,593 files for licence headers.
- **Documentary Cross-Check:** The published Frontiers article full text was examined in its exact publication context.
- **No Author Contact:** No contact was initiated with the Zenodo depositors, Vishwakarma University, or journal editors.
- **No Legal Opinion:** Factual conflicts are documented without issuing definitive legal rulings.

---

## 3. Exact Zenodo Record Identity & Preserved API JSON

### 3.1 Core Record Metadata

| Field | Value |
|---|---|
| **Platform** | Zenodo (CERN) |
| **Record Identifier (`id`)** | `11408513` |
| **Concept Record ID (`conceptrecid`)** | `11408512` |
| **Canonical DOI** | `10.5281/zenodo.11408513` |
| **Concept DOI** | `10.5281/zenodo.11408512` |
| **Canonical DOI URL** | `https://doi.org/10.5281/zenodo.11408513` |
| **Direct API URL** | `https://zenodo.org/api/records/11408513` |
| **Web Interface URL** | `https://zenodo.org/records/11408513` |
| **Record Title** | *Multilingual Fake News Detection Dataset: Gujarati, Hindi, Marathi, and Telugu* |
| **Creators** | Patil, Kailas (ORCID: `0000-0001-6537-5733`); Parshv, Gandhi; Abhishek, Chauhan; Vaibhav, Patil; Ameya, Pawar |
| **Affiliation** | Vishwakarma University, Pune, India |
| **Publication Date** | 2024-06-01 |
| **Creation Timestamp** | `2024-06-01T11:28:58.411227+00:00` |
| **Modification Timestamp** | `2024-06-01T11:28:58.761452+00:00` |
| **Declared License ID** | `cc-by-4.0` |
| **Access Right** | `open` |
| **Status / State** | `published` / `done` |

### 3.2 Deposited Files on Zenodo Record 11408513

| File Key | Size (Bytes) | MD5 Checksum | API Content Link |
|---|---:|---|---|
| `Marathi_F&R_News.zip` | 46,745,083 | `5aa6a5904c6812ead2a09448ffa51b38` | `https://zenodo.org/api/records/11408513/files/Marathi_F&R_News.zip/content` |
| `Gujarati_F&R_News.zip` | 42,844,608 | `77fec7e22af5e916816f3dc98a2781a7` | `https://zenodo.org/api/records/11408513/files/Gujarati_F&R_News.zip/content` |
| `Telugu_F&R_News.zip` | 44,952,890 | `de7c018e8c9346da73196c2f997fc6df` | `https://zenodo.org/api/records/11408513/files/Telugu_F&R_News.zip/content` |
| `Hindi_F&R_News.zip` | 59,650,455 | `3be2e9e1f636472c99308a5eac1bb7e1` | `https://zenodo.org/api/records/11408513/files/Hindi_F&R_News.zip/content` |

### 3.3 Preserved Primary Zenodo API JSON (Verbatim Extract)

```json
{
  "id": 11408513,
  "conceptrecid": "11408512",
  "doi": "10.5281/zenodo.11408513",
  "conceptdoi": "10.5281/zenodo.11408512",
  "doi_url": "https://doi.org/10.5281/zenodo.11408513",
  "created": "2024-06-01T11:28:58.411227+00:00",
  "modified": "2024-06-01T11:28:58.761452+00:00",
  "title": "Multilingual Fake News Detection Dataset: Gujarati, Hindi, Marathi, and Telugu",
  "metadata": {
    "title": "Multilingual Fake News Detection Dataset: Gujarati, Hindi, Marathi, and Telugu",
    "doi": "10.5281/zenodo.11408513",
    "publication_date": "2024-06-01",
    "description": "<p>This dataset is designed to support research in fake news detection across four major Indian languages: Gujarati, Hindi, Marathi, and Telugu. The dataset includes a diverse set of news articles collected from various sources, each labeled as either 'fake' or 'real'. The primary goal is to provide a resource that helps in the development and evaluation of natural language processing (NLP) models capable of detecting fake news in these regional languages.</p>",
    "access_right": "open",
    "creators": [
      {"name": "Patil, Kailas", "affiliation": "Vishwakarma University", "orcid": "0000-0001-6537-5733"},
      {"name": "Parshv, Gandhi", "affiliation": "Vishwakarma University"},
      {"name": "Abhishek, Chauhan", "affiliation": "Vishwakarma University"},
      {"name": "Vaibhav, Patil", "affiliation": "Vishwakarma University"},
      {"name": "Ameya, Pawar", "affiliation": "Vishwakarma University"}
    ],
    "keywords": ["Fake News", "Gujarati", "Hindi", "Marathi", "Telugu", "NLP", "Machine Learning", "Text Classification"],
    "language": "guj",
    "resource_type": {"title": "Dataset", "type": "dataset"},
    "license": {"id": "cc-by-4.0"},
    "relations": {
      "version": [{"index": 0, "is_last": true, "parent": {"pid_type": "recid", "pid_value": "11408512"}}]
    }
  },
  "status": "published"
}
```

---

## 4. Official Metadata Licence

In the official Zenodo metadata API response above:
- The declared licence is unambiguously set to `{"id": "cc-by-4.0"}`.
- Creative Commons Attribution 4.0 International (**CC BY 4.0**) grants licensees worldwide permission to copy, adapt, and redistribute the work for any purpose, including commercial purposes, subject to attribution.
- **Secondary Indexing Note:** The OpenAIRE Explore catalogue entry (`https://explore.openaire.eu/search/dataset?pid=10.5281%2Fzenodo.11408513`) reflects **CC BY** because it indexes Zenodo's metadata field. This indexing confirms external metadata discovery but does not constitute an independent licence grant beyond the Zenodo deposit.

---

## 5. File-Level Licence Declarations

A complete physical audit of the local archive directory (`data/raw/indic_zenodo/`) was performed:

```
data/raw/indic_zenodo/
└── Hindi_F&R_News/
    ├── Hindi_fake_news/  (10,293 text files)
    ├── Hindi_real_news/  (10,300 text files)
    └── __MACOSX/         (macOS resource fork metadata files)
```

### Audit Results:
1. **Total Text Files Inspected:** 20,593 `.txt` files.
2. **Embedded Licence Headers:** **Zero (0)** files contain a licence header, copyright notice, or terms statement.
3. **Internal Structure:** Files consist of raw Devanagari news text (headline on line 1, article body on line 2).
4. **Conclusion:** No file-level licence declaration exists within the dataset files.

---

## 6. README and Documentation Declarations

1. **Local Archive:** There is no `README`, `README.txt`, `README.md`, `LICENSE`, or `LICENSE.txt` file anywhere in `data/raw/indic_zenodo/` or `Hindi_F&R_News/`.
2. **Zenodo Deposit Text:** The web description provides a general project summary but does not include licence terms, usage restrictions, or copyright disclaimers beyond the metadata dropdown selection.
3. **Conclusion:** Downstream users receive no documentation or licence text bundled inside the downloaded ZIP file.

---

## 7. The Conflicting CC BY 4.0 / CC BY-NC 4.0 Evidence

### 7.1 Primary Peer-Reviewed Publication
- **Source:** Rohini Jadhav, Vishal Meshram, Amol Bhosle, Kailas Patil, Sital Dash, and Shrikant Jadhav, *"Explainable multilingual and multimodal fake-news detection: toward robust and trustworthy AI for combating misinformation"*, *Frontiers in Artificial Intelligence*, published 2025-12-10, DOI: `10.3389/frai.2025.1690616`.
- **Author Identity:** Kailas Patil is both the lead author/depositor on Zenodo Record 11408513 and a senior author on the Frontiers publication.

### 7.2 Exact Location and Context of CC BY-NC 4.0 Statement
In the Frontiers paper's **Data Availability Statement** and **Section 3 ("Dataset Collection and Preprocessing")**:
- The authors explicitly write:
  > *"The dataset is made publicly available for academic research purposes under the **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)** license. Commercial use, redistribution for profit, or unauthorized commercial exploitation is strictly prohibited."*
- **Frontiers Article Publication Licence:** In the article metadata, the scholarly article itself is published under **CC BY 4.0** (standard Frontiers Open Access). This publication licence applies to the text of the research paper, not to the underlying dataset.

### 7.3 Direct Comparison:

| Attribute | Zenodo Deposit Record 11408513 | Frontiers in AI Paper (2025) | Conflict Status |
|---|---|---|:---:|
| **Licence Specified** | **CC BY 4.0** | **CC BY-NC 4.0** | **Direct Discrepancy** |
| **Commercial Exploitation** | Permitted (with attribution) | Strictly Prohibited (NonCommercial restriction) | **Incompatible Terms** |
| **Source Medium** | Repository metadata field | Peer-reviewed journal article text | **Different Channels** |
| **Date of Record** | 2024-06-01 | 2025-12-10 | **18-Month Interval** |

---

## 8. Version History and Precedence Analysis

### 8.1 Version History on Zenodo
Zenodo API metadata field `relations.version` reports:
```json
[{"index": 0, "is_last": true, "parent": {"pid_type": "recid", "pid_value": "11408512"}}]
```
- Only **Version 1** has ever been published on Zenodo.
- The record has not been amended, retracted, or updated with a newer version on Zenodo.

### 8.2 Precedence and Interpretation
The legal and factual relationship between the 2024 Zenodo deposit and the 2025 Frontiers publication cannot be determined from existing records:
1. **No Automatic Retroactive Amendment:** A statement in a later scholarly article does not automatically or retroactively alter an earlier public licence grant attached to a public repository deposit.
2. **Author Intent:** The later publication indicates that the research group considers the dataset restricted to non-commercial academic research.
3. **Possible Version / Pipeline Distinction:** It is plausible that the 2024 Zenodo deposit represents an uncurated initial deposit, while the 2025 paper describes a filtered experimental corpus (as evidenced by count and deduplication discrepancies noted in B-09). However, no documentary manifest links the two versions.
4. **Conclusion:** Precedence, governing authority, and the exact scope of the conflicting declarations cannot be determined without author clarification.

---

## 9. Licence Implications for VeriNews

The practical consequences of the conflict for VeriNews depend on the intended activity:

### 9.1 Academic & Non-Commercial Research
- Both CC BY 4.0 and CC BY-NC 4.0 permit non-commercial academic research, computational analysis, and scholarly publication.
- Internal research evaluation is therefore aligned with both declared terms.

### 9.2 Commercial SaaS Deployment
- Under **CC BY 4.0**, commercial use would be permissible (subject to attribution and underlying article rights).
- Under **CC BY-NC 4.0**, commercial SaaS deployment, paid API access, or monetized distribution is strictly barred.
- Because the authors' peer-reviewed publication asserts CC BY-NC 4.0, treating the dataset as CC BY 4.0 for commercial deployment carries substantial legal risk.

### 9.3 Redistribution of Raw Text Files
- Scraped articles from *The Hindu*, *The Indian Express*, and *BBC Hindi* remain protected by commercial publisher copyright.
- Neither CC BY 4.0 nor CC BY-NC 4.0 conveys copyright clearance over third-party news text.
- Bulk redistribution of the 20,593 text files is restricted regardless of which compilation licence takes precedence.

---

## 10. Evidence Gaps

1. **No Author Clarification:** No public statement, repository update, or erratum clarifies whether CC BY 4.0 on Zenodo was an administrative selection error, an intentional open release, or superseded by the Frontiers paper.
2. **Absence of Bundled Licence:** No licence text or README was packaged with the raw ZIP archive.
3. **Absence of Publisher Licences:** No evidence exists that commercial Indian news publishers (*BBC Hindi*, *The Hindu*, etc.) authorized redistribution of their full-text articles.

---

## 11. Final B-08 Disposition

### Disposition:
**`UNRESOLVED — CONFLICTING LICENCE EVIDENCE; PRECEDENCE AND SCOPE NOT ESTABLISHED`**

### Rationale:
1. The Zenodo deposit metadata unambiguously specifies CC BY 4.0.
2. The peer-reviewed Frontiers paper explicitly specifies CC BY-NC 4.0.
3. No file-level licence headers, archive documentation, or author errata establish precedence or scope between the two declarations.
4. OpenAIRE indexing reflects the Zenodo metadata API and does not resolve the conflict.
5. In accordance with VeriNews operating principles, the auditor cannot choose a preferred licence or assume retroactive amendment without primary evidence.
6. Indic Zenodo Hindi remains **NOT APPROVED** for local training or portfolio demonstration.

---

## 12. Remaining Actions

1. **Maintain Training Hold:** Do not use Indic Zenodo Hindi for model training, preprocessing, or baseline experiments.
2. **Preserve Blocker Independence:** Maintain B-08 strictly independent of B-09 (archive-to-paper identity); do not combine their evidence.
3. **Mentor Review Submission:** Submit this finding in the Mentor Approval Dossier for owner/mentor decision.

---

## 13. Reproducibility and Source Register

| Entity / Source | Canonical Reference / URL | Date Accessed | Evidence Type |
|---|---|:---:|---|
| **Zenodo Record 11408513** | `https://zenodo.org/records/11408513` | 2026-11-10 | Primary Repository Page |
| **Zenodo API JSON** | `https://zenodo.org/api/records/11408513` | 2026-11-10 | Primary API Record (Preserved in Section 3) |
| **Frontiers in AI Journal Article** | DOI: `10.3389/frai.2025.1690616` | 2026-11-10 | Primary Peer-Reviewed Publication |
| **OpenAIRE Dataset Entry** | `https://explore.openaire.eu/search/dataset?pid=10.5281%2Fzenodo.11408513` | 2026-11-10 | Secondary Metadata Indexing |
| **Local Archive Audit** | `data/raw/indic_zenodo/Hindi_F&R_News/` (20,593 text files) | 2026-11-10 | Physical Filesystem Inspection |
| **CC BY 4.0 Legal Code** | `https://creativecommons.org/licenses/by/4.0/legalcode` | 2026-11-10 | Statutory Licence Specification |
| **CC BY-NC 4.0 Legal Code** | `https://creativecommons.org/licenses/by-nc/4.0/legalcode` | 2026-11-10 | Statutory Licence Specification |
