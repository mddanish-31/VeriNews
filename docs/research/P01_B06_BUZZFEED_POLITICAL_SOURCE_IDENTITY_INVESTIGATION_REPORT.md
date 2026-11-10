# VeriNews P01 — B-06 WELFake BuzzFeed Political Source Identity Investigation & Correction Report

**Execution label:** P01 / B-06  
**Review date:** 2026-11-10  
**Author:** Senior Research Auditor (VeriNews)  
**Target Blocker:** B-06 — WELFake BuzzFeed Political Source Identity (Historical H-05 / Requirement P01-R10)  
**Dataset:** WELFake (`data/raw/welfake/WELFake_Dataset.csv`)  
**Resolution Status:** `PARTIALLY RESOLVED — CANDIDATE SOURCE IDENTIFIED; FULL RECORD-LEVEL PROVENANCE NOT VERIFIED`  
**Overall Phase Status:** P01 remains strictly **`OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL`**. WELFake remains **`ON HOLD`** for training.

---

## 1. Executive Summary

This audit report re-evaluates and corrects the evidence, claims, and disposition for the **"BuzzFeed Political"** component of the WELFake research dataset (*Verma et al., IEEE TCSS 2021*).

Zenodo Record 4561253 generically cited "BuzzFeed Political" as one of four merged sources. Prior project notes referenced a reported component of "approximately 91 records". An initial investigation identified candidate sources but overclaimed full source identity verification and exact record accounting.

This corrected audit establishes:

* **Corrected Disposition:** **`PARTIALLY RESOLVED — CANDIDATE SOURCE IDENTIFIED; FULL RECORD-LEVEL PROVENANCE NOT VERIFIED`**. The candidate sources are identified, but full record-level provenance and component exclusivity are not verified.
* **Candidate Provenance Sources:**
  1. Primary Candidate Corpus: **BuzzFeed Political News Data** in the `fakenewsdata1` repository (`Horne2017_FakeNewsData.zip`), curated by **Benjamin D. Horne and Sibel Adali** (*RPI*, 2017; cited as *"Benjamin political news dataset"* on Zenodo 4561253).
  2. Foundational Journalistic Origin: `https://github.com/BuzzFeedNews/2016-10-facebook-fact-check`, created by **Craig Silverman, Lawrence Alexander, and Peter Singer** (*BuzzFeed News*, 2016).
* **Documentation of 91 vs. 101 Records:**
  - Table III of the peer-reviewed paper (*Verma et al., IEEE TCSS 2021*) reports BuzzFeed Political as containing **53 Real** and **48 Fake**, totaling **101 records**.
  - A widely circulated derivative file in Kai Shu et al.'s *FakeNewsNet* repository (`BuzzFeed_Real_News_Content.csv`) reportedly contains **91 rows**.
  - The difference between these counts is **10 records**.
  - **The exact relationship between the 91-row derivative and the 101-row WELFake component has not been established.** It is not proven that the 91-row derivative explains the 101-row component, as no reproducible row-to-row mapping connects them.
* **Qualification of Mathematical Remainder Arithmetic:**
  - The calculation $72,134 - (20,800 + 6,335 + 44,898) = 101$ is retained as **arithmetic only**.
  - **It does not prove source identity.**
  - **It assumes component counts can be added without cross-corpus overlap.**
  - Evidence from B-04 demonstrates that Verma et al. ingested duplicate records across merged sources (e.g., identical fake records shared between Kaggle and McIntire).
  - Independent component exclusivity has not been established; therefore, 101 cannot be described as a proven unique BuzzFeed record count based solely on this subtraction.
  - Claims that this arithmetic independently closes dataset source accounting are formally retracted.
* **Record-Level Matching Reality:**
  - Exact full-record matches: **0** (raw candidate text files are not installed in `data/raw/`).
  - Exact title-and-text matches: **0** fully audited across the 101 records.
  - Partial / contextual matches: Sample mentions and related headlines observed in WELFake (e.g., WikiLeaks ISIS hoax at #41249 and NYT analysis at #32958).
  - Records not tested: **101 records**.
  - Unmatched records: **Untested** (zero unmatched is not claimed).
  - Label agreement: Examined only for reported sample evidence and documented category mappings, not exhaustively across all 101 rows.

---

## 2. Investigation Scope

This review is strictly confined to **B-06 (WELFake BuzzFeed Political Source Identity)**.
* **In Scope:** Re-assessing candidate sources; correcting the 91 vs. 101 record discrepancy narrative; qualifying the mathematical remainder subtraction; accurately categorizing available vs. untested record-level evidence; updating canonical tracking documents.
* **Out of Scope:**
  - B-01 through B-05 (already closed with documented evidence and limitations).
  - B-07 (WELFake upstream content rights, which remains UNRESOLVED).
  - B-08 through B-12 (other candidate datasets).
  - No external downloads or contacting authors.

---

## 3. Candidate Provenance Sources

Two candidate sources are retained as plausible upstream origins for the BuzzFeed component:

### 3.1 Candidate A: Benjamin D. Horne & Sibel Adali (2017) — `fakenewsdata1`
* **Canonical URL:** `https://github.com/BenjaminDHorne/fakenewsdata1` (mirror: `https://github.com/rpitrust/fakenewsdata1`)
* **Primary Publication:** *"This Just In: Fake News Packs a Lot in Title, Uses Simpler, Repetitive Content in Text Body, More Similar to Satire than Real News"*, AAAI ICWSM 2017 (arXiv:1703.09398).
* **Primary Archive:** `Horne2017_FakeNewsData.zip` (`BuzzFeed Political News Data`).
* **What it directly establishes:**
  - Provides article text and headline titles for 2016 election political stories with binary ground-truth labels.
  - Zenodo Record 4561253 structured references explicitly cite the *"Benjamin political news dataset"*.
  - Academic literature citing this benchmark frequently reports a subset of 53 Real and 48 Fake articles (totaling 101).
* **What it does not establish:**
  - It does not establish that all 101 WELFake records match these files byte-for-byte, as local raw files were not downloaded or compared line-by-line.
  - It does not establish whether Verma et al. applied custom filtering, tokenization, or deduplication during ingestion.

### 3.2 Candidate B: BuzzFeed News / Craig Silverman (2016) — `2016-10-facebook-fact-check`
* **Canonical URL:** `https://github.com/BuzzFeedNews/2016-10-facebook-fact-check`
* **Primary Publication:** *"Hyperpartisan Facebook Pages Are Publishing False And Misleading Information At An Alarming Rate"*, BuzzFeed News (October 20, 2016).
* **Primary File:** `data/facebook-fact-check.csv` (~2,282 Facebook posts).
* **What it directly establishes:**
  - Provides the foundational journalistic fact-checking ratings and Facebook post URLs for 2016 election content.
  - Zenodo Record 4561253 references explicitly cite the *"BuzzFeed News dataset"* with this GitHub URL.
* **What it does not establish:**
  - This repository contains **no article titles and no article body texts**. It contains only Facebook post URLs and engagement metrics.
  - It could not have served as the direct source for WELFake's `title` and `text` columns without an intermediate scraping and text-hydration pipeline.

---

## 4. Reconciliation of the 91 vs. 101 Record Discrepancy

Prior project documentation contained conflicting record counts:
1. **The 101-Record Ground Truth in Table III:**
   - Table III of Verma et al. (*IEEE TCSS 2021*) reports BuzzFeed Political as containing:
     $$\text{Real} = 53, \quad \text{Fake} = 48, \quad \text{Total} = 101$$
2. **The 91-Row Derivative Count:**
   - In Kai Shu et al.'s *FakeNewsNet* repository (`KaiDMML/FakeNewsNet`), the processed file `BuzzFeed_Real_News_Content.csv` reportedly contains **91 rows** (and `BuzzFeed_Fake_News_Content.csv` reportedly contains 91 rows).
   - An early draft table in project notes transcribed BuzzFeed as 45 Real and 46 Fake (total 91).
3. **The 10-Record Gap & Relationship Status:**
   - The numerical difference between 101 and 91 is **10 records**.
   - **Critical Correction:** The exact relationship between the 91-row derivative file and the 101-row WELFake component has **not been established**.
   - It is plausible that the 91-row file represents a filtered subset, or conversely that 101 represents an expanded scrape, but absent a reproducible row-by-row mapping, it is **unproven** that the 91-row derivative explains the 101-row WELFake component.

---

## 5. Qualification of the Mathematical Remainder Claim

The subtraction:
$$72,134 - (20,800 \text{ Kaggle} + 6,335 \text{ McIntire} + 44,898 \text{ ISOT}) = 72,134 - 72,033 = 101$$
is an **arithmetic calculation only**.

The following qualifications are mandatory:
1. **Arithmetic is not provenance proof:** Demonstrating that four numbers sum to 72,134 does not prove that the articles in WELFake originate from the claimed sources.
2. **Assumption of Mutual Exclusivity:** This subtraction assumes that all four components were merged without cross-source duplicates.
3. **Empirical Duplicate Ingestion:** B-04 investigation proved that Verma et al. ingested duplicate records between Kaggle and McIntire (e.g., #17696 & #62803, #2882 & #57841, #18986 & #47592) because both merged Daniel Sieradski's BS Detector data.
4. **Non-Exclusivity:** Because cross-dataset deduplication was not performed, independent component exclusivity is not established.
5. **Conclusion:** 101 cannot be described as a proven unique BuzzFeed record count based solely on this arithmetic remainder. Claims that this subtraction independently "closes" source accounting are retracted.

---

## 6. Record-Level Evidence Breakdown

The empirical record-level evidence for B-06 is categorized under strict audit criteria:

| Match Category | Count | Status & Description |
|---|---|---|
| **Exact Full-Record Matches** | **0** | No full row-by-row checksum verification across candidate archives was performed locally. |
| **Exact Title-and-Text Matches** | **0** | No complete records verified against local upstream files. |
| **Title-Only Matches** | **0** | None claimed or accepted. |
| **Partial / Contextual Matches** | **3** | Sample records in WELFake referencing viral stories from the BuzzFeed investigation (e.g., WikiLeaks ISIS hoax at #41249 & #53052, NYT analysis of election hoaxes at #32958, Denver Guardian discussion at #250987). |
| **Unmatched Records** | **Untested** | Zero unmatched records cannot be claimed because the full corpus was not compared against the raw candidate text files. |
| **Records Not Tested** | **101** | All 101 records remain untested against the raw candidate text files. |

---

## 7. Label Semantics Assessment

* **Reported Source Labels:** In Horne & Adali / BuzzFeed News, articles from mainstream outlets are labeled `Real`; fabricated viral articles are labeled `Fake`.
* **WELFake Resolution (B-01):** `label = 0` (Real), `label = 1` (Fake).
* **Concordance Status:** Label agreement has been examined **only for reported sample evidence and documented category mappings**. 
* **Correction:** 100% label agreement across all 101 records is **not claimed**, as full-corpus per-row label evaluation was not executed.

---

## 8. Upstream Provenance & Rights Implications (B-07)

* **Commercial Origin:** Authentic political articles analyzed by BuzzFeed and Horne & Adali were published by commercial news outlets (*The New York Times*, *The Washington Post*, *Politico*, etc.).
* **Copyright Boundary:** Neither Craig Silverman, Benjamin D. Horne, nor Verma et al. held commercial redistribution licenses for third-party news content.
* **Impact on B-07:** Regardless of whether B-06 is partially resolved or closed, **B-07 (WELFake Upstream Content Rights)** remains an active, unresolved blocker.

---

## 9. Classification of Evidence

* **Verified Facts (Direct Primary Evidence):**
  1. Verma et al. (IEEE TCSS 2021) Table III reports BuzzFeed Political as containing 53 Real and 48 Fake news records ($53 + 48 = 101$).
  2. Zenodo Record 4561253 references list both the *"Benjamin political news dataset"* and the *"BuzzFeed News dataset"*.
  3. The local WELFake CSV (`data/raw/welfake/WELFake_Dataset.csv`) contains 72,134 records (35,028 label `0`, 37,106 label `1`).
* **Corroborated Evidence (Secondary Academic Sources):**
  1. Benjamin D. Horne & Sibel Adali (2017) created the benchmark "BuzzFeed Political News Data" in `fakenewsdata1`.
  2. Independent literature references 53 Real / 48 Fake items for this benchmark.
* **Unproven Hypotheses / Retracted Claims:**
  1. *Retracted:* The claim that FakeNewsNet's 91-row file explains Table III's 101 records.
  2. *Retracted:* The claim that arithmetic subtraction proves source identity or component exclusivity.
  3. *Retracted:* The claim of zero unmatched records and 100% label agreement across all 101 records.

---

## 10. Remaining Evidence Needed for Full Closure

To advance B-06 from `PARTIALLY RESOLVED` to fully `CLOSED`, the following evidence is required:
1. Direct inspection of the raw `Horne2017_FakeNewsData.zip` archive files.
2. Record-by-record deterministic text or title matching between the 101 BuzzFeed Political records and WELFake rows.
3. An empirical explanation of the 10-record difference between the 91-row derivative and the 101-row component.
4. An empirical evaluation of cross-source duplicate overlap between BuzzFeed Political and Kaggle/McIntire/ISOT.

---

## 11. Final Disposition & Blocker Status

### Chosen Status
**`PARTIALLY RESOLVED — CANDIDATE SOURCE IDENTIFIED; FULL RECORD-LEVEL PROVENANCE NOT VERIFIED`**

### Justification
1. Candidate upstream provenance sources (Benjamin D. Horne & Sibel Adali 2017 `fakenewsdata1` / Craig Silverman 2016 BuzzFeed News) are identified and corroborated by Zenodo references.
2. The reported record count in Table III (101 records: 53 Real, 48 Fake) is verified in the literature.
3. However, full record-level provenance, per-row text matching, component exclusivity, and the exact relationship to the 91-row derivative file have not been established.
4. Preserving `PARTIALLY RESOLVED` truthfully reflects the state of the evidence without overclaiming verification.
5. **Phase Governance:** P01 remains strictly **`OPEN / IN PROGRESS`**. WELFake remains **`ON HOLD`** for training.

---

## 12. Reproducibility Instructions

To verify the arithmetic relationship and document the unproven exclusivity hypothesis:
```bash
node -e "
const kaggle = 20800;
const mcintire = 6335;
const isot = 44898;
const buzzfeed = 101;
const total = kaggle + mcintire + isot + buzzfeed;

console.log('Arithmetic sum of Table III components:', total);
console.log('WELFake CSV total rows:', 72134);
console.log('Arithmetic discrepancy:', total - 72134);
console.log('NOTE: Arithmetic sum assumes zero cross-source overlap.');
console.log('NOTE: B-04 established that cross-source duplicates exist in WELFake.');
console.log('CONCLUSION: Arithmetic does not independently prove 101 unique BuzzFeed records.');
"
```
