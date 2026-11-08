# VeriNews P01-I — WELFake Primary Evidence Findings

**Research date:** 2026-11-07  
**Scope:** Documentation of the read-only primary-source findings supplied for H-01 (label mapping) and H-02 (record counts). No dataset/archive or local CSV was accessed for this report, and no audit was repeated.  
**Project status:** P01 remains **OPEN**. H-01 and H-02 remain **UNRESOLVED**. WELFake remains **ON HOLD**. No dataset is approved for local model training or public portfolio demonstration. Preserve original labels unchanged. P02 Figma has **NOT started**; this report does not complete a roadmap phase or milestone.

## 1. Purpose and evidence boundaries

This report records the latest investigation findings for the two priority evidence questions in the P01-H access plan. It keeps four evidence categories distinct:

1. **Zenodo declarations:** statements in the WELFake deposit record and API.
2. **Original-paper findings:** findings attributed to the original IEEE paper, *“WELFake: Word Embedding Over Linguistic Features for Fake News Detection,”* DOI `10.1109/TCSS.2021.3068519`.
3. **Prior local audit:** structural record and raw-label counts documented in the existing label-integrity report; not rechecked here.
4. **Unresolved interpretations:** explanations not established by the above evidence.

The supplied investigation notes report that the paper gives the dataset size and class distribution. The exact supporting passage is not independently traceable in this report: no page, section, table, figure, or quotation is recorded. The paper's DOI, `10.1109/TCSS.2021.3068519`, is a bibliographic reference, not proof of a specific numeric label encoding. The exact full-text URL already present in the project evidence is the [Crossref-listed IEEE PDF endpoint](http://xplorestaging.ieee.org/ielx7/6570650/9502055/09395133.pdf?arnumber=9395133). P01-G records that endpoint as attempted on 2026-11-07 but not readable by the available PDF reader. This report does not claim a new retrieval or independently inspected paper passage.

No secondary repository, search snippet, or downstream implementation is used as primary evidence.

## 2. H-01 — Label mapping

### 2.1 Findings

- **Zenodo declaration:** The [official Zenodo record](https://zenodo.org/records/4561253) explicitly states **“Label (0 = fake and 1 = real)”**. It reports **35,028 Real** and **37,106 Fake** articles. The [record API](https://zenodo.org/api/records/4561253) is the corresponding machine-readable metadata reference.
- **Original paper:** The supplied investigation notes report that the original IEEE paper gives the reported dataset size and class distribution. The exact supporting passage is not independently traceable in this report. An exact numeric label encoding for the supplied CSV has **not** been independently established; the DOI is bibliographic metadata, not proof of that encoding. The reported class totals do not establish that the deposited CSV's integer values follow Zenodo's declared mapping.
- **Prior local audit:** The existing strict audit documented **72,134 records**, with raw counts **label 0: 35,028** and **label 1: 37,106**. Those local findings are cited from the existing [label-integrity investigation](welfake-label-integrity-investigation.md); this report did not access the CSV or repeat the audit.
- **Comparison:** The local counts align numerically with Zenodo's reported class totals only under a reversed interpretation (`0 = Real`, `1 = Fake`). This numerical alignment does **not** establish that the CSV labels are reversed and is not a basis for changing them.

### 2.2 Decision

**H-01 — UNRESOLVED.** Zenodo's declared mapping is verified as a deposit statement, but its application to the exact supplied CSV has not been independently established by verified primary evidence. Do not infer, reverse, modify, or relabel the dataset. Keep the original label values unchanged.

### 2.3 Evidence matrix — H-01

| Claim | Source | Evidence obtained | What the evidence establishes | What it does not establish | Confidence / status | Next required evidence |
|---|---|---|---|---|---|---|
| Zenodo declares `0 = Fake`, `1 = Real`. | [Zenodo record 4561253](https://zenodo.org/records/4561253); [Zenodo API](https://zenodo.org/api/records/4561253) | Record description explicitly states “Label (0 = fake and 1 = real).” | The deposit's declared label mapping. | Whether each value in the exact supplied CSV implements that declaration. | **VERIFIED as a declaration; H-01 remains UNRESOLVED.** | Primary evidence tied to the exact deposited CSV/version that establishes the column encoding and resolves the conflict. |
| Zenodo reports 35,028 Real and 37,106 Fake. | Zenodo record/API | Class totals are reported in the deposit description. | What the deposit reports as its class distribution. | The semantic interpretation of the CSV's integer values. | **VERIFIED as a reported figure.** | A primary mapping statement tied to the exact file/release. |
| The supplied investigation notes report that the original paper gives the dataset size and class distribution. | Original IEEE paper, DOI `10.1109/TCSS.2021.3068519`; scholarly route references in Section 4 | Supplied notes attribute the size and class distribution to the paper, but provide no independently traceable page, section, table, figure, or quotation. | That the supplied investigation notes report these paper findings. | The unreferenced passage itself, exact label encoding in the supplied CSV, and record-level application of any encoding. The DOI is bibliographic, not proof of numeric label semantics. | **Attributed to supplied notes; passage not independently traceable. H-01 remains UNRESOLVED.** | Traceable paper passage with page/section/table and any statement linking numeric encoding to the Zenodo CSV release. |
| Existing strict local audit reports 72,134 records: 35,028 zeros and 37,106 ones. | Prior [WELFake label-integrity investigation](welfake-label-integrity-investigation.md) | Existing report records a strict four-field parse and raw label counts. | The result of the previously documented local audit. | Semantic meaning of `0` or `1`; this report did not reproduce or independently validate the audit. | **Previously audited; not re-audited here.** | No new CSV inspection is authorized by this report. If later needed, obtain separate mentor authorization for a narrowly scoped re-audit. |
| Local class counts match Zenodo's class totals only under reversed semantics. | Comparison of Zenodo reported totals and prior local audit counts | Equal numeric totals appear in opposite label positions under Zenodo's declaration. | A numerical inconsistency requiring resolution. | That labels are in fact reversed, that Zenodo is wrong, or why the mismatch exists. | **UNRESOLVED; counts are not semantic proof.** | Exact-release primary label definition and reconciliation from original authors/publisher. |

## 3. H-02 — Record-count discrepancy

### 3.1 Findings

- **Zenodo record:** The deposit states that the CSV has **78,098 entries** and that **72,134 entries** were accessed “as per the data frame.” It also describes a 72,134-article dataset.
- **Original paper:** The supplied investigation notes report that the paper gives **72,134 articles** and class totals of **35,028 Real** and **37,106 Fake**. The exact supporting passage is not independently traceable in this report.
- **Prior local audit:** The existing strict local audit reports **72,134 logical records**. This report did not access the file or rerun that audit.
- Searching the available paper text for `78098` and `78 098` did not reveal an explanation for the 78,098 figure.
- The difference between Zenodo's 78,098 CSV-entry statement and the 72,134 dataframe/article figure remains unexplained.

No cause is assigned. In particular, this report does not attribute the difference to multiline CSV fields, malformed rows, filtering, parser behavior, or any other mechanism without primary evidence.

### 3.2 Decision

**H-02 — UNRESOLVED.** The figures are documented, but no primary evidence currently defines what the 78,098 figure counts or explains how it relates to the 72,134 articles/dataframe entries and exact deposited CSV. Do not select a hypothesis as fact.

### 3.3 Evidence matrix — H-02

| Claim | Source | Evidence obtained | What the evidence establishes | What it does not establish | Confidence / status | Next required evidence |
|---|---|---|---|---|---|---|
| Zenodo reports 78,098 CSV entries and 72,134 dataframe entries/articles. | [Zenodo record 4561253](https://zenodo.org/records/4561253); [Zenodo API](https://zenodo.org/api/records/4561253) | Deposit description contains both figures and the “accessed as per the data frame” wording. | The two figures and wording as Zenodo-declared metadata. | The unit/definition of “entries,” their version relationship, or the cause of the difference. | **VERIFIED as a declaration; discrepancy UNRESOLVED.** | Author/publisher primary explanation defining each count and linking it to the exact release/file. |
| The supplied investigation notes report that the original paper gives 72,134 articles and the stated class distribution. | Original IEEE paper, DOI `10.1109/TCSS.2021.3068519` | Supplied notes report these paper figures and state that searches of available paper text for `78098` and `78 098` found no explanation; the supporting count passage is not independently traceable here. | That the supplied investigation notes attribute the figures to the paper and report no explanation found in the searched text. | A traceable paper passage for the count or why Zenodo has the additional figure. | **Attributed to supplied notes; passage not independently traceable. H-02 remains UNRESOLVED.** | Any traceable paper/supplement passage, version history, or official author documentation defining 78,098 and reconciling the counts. |
| Prior local strict audit reports 72,134 logical records. | Prior [WELFake label-integrity investigation](welfake-label-integrity-investigation.md) | Existing report records 72,134 strict four-field records. | The previously documented local structural count. | Why Zenodo separately states 78,098 entries; this report did not inspect the file. | **Previously audited; not re-audited here.** | Primary definition of the metadata counts; any file-level comparison requires separate authorization. |
| The discrepancy has a particular technical cause. | No accepted primary source in the evidence summarized here | No cause was found in the available paper text; no cause is inferred. | Nothing beyond the fact that the counts differ. | Multiline fields, malformed rows, filtering, parser behavior, or any other proposed explanation. | **UNRESOLVED; no cause established.** | Explicit primary evidence tied to the relevant release and counting procedure. |

## 4. Source register

The first two sources below document Zenodo's declarations. The IEEE sources refer to the original scholarly work; Crossref is bibliographic metadata and is not itself article text. Access notes preserve the boundary between this report's supplied findings and prior route history.

| Source | Type / role | URL or DOI | Evidence and limitation |
|---|---|---|---|
| WELFake Zenodo record 4561253 | Dataset deposit metadata | [https://zenodo.org/records/4561253](https://zenodo.org/records/4561253) | Declares `0 = Fake`, `1 = Real`; reports class totals and 78,098/72,134 wording. These are deposit statements and do not by themselves prove how the supplied file encodes labels or explain the count difference. |
| WELFake Zenodo record API | Machine-readable deposit metadata | [https://zenodo.org/api/records/4561253](https://zenodo.org/api/records/4561253) | API reference for the same deposit metadata; not a substitute for file-level label confirmation. |
| Original IEEE paper | Primary scholarly work; Verma et al., “WELFake: Word Embedding Over Linguistic Features for Fake News Detection,” DOI `10.1109/TCSS.2021.3068519` | [https://doi.org/10.1109/TCSS.2021.3068519](https://doi.org/10.1109/TCSS.2021.3068519) | Supplied investigation notes report the dataset size and class distribution from the paper, but the supporting passage is not independently traceable in this report. The DOI is a bibliographic reference, not proof of the specific numeric label encoding. |
| IEEE Xplore article page | Publisher landing page | [https://ieeexplore.ieee.org/document/9395133](https://ieeexplore.ieee.org/document/9395133) | Existing P01-G records that the page did not return readable article text via the route used there. |
| Crossref metadata | Bibliographic metadata | [https://api.crossref.org/works/10.1109/TCSS.2021.3068519](https://api.crossref.org/works/10.1109/TCSS.2021.3068519) | Citation metadata and publisher pointer; not evidence of the label encoding or a count explanation. |
| Crossref-listed IEEE PDF endpoint | Scholarly full-text route already documented in P01-G | [http://xplorestaging.ieee.org/ielx7/6570650/9502055/09395133.pdf?arnumber=9395133](http://xplorestaging.ieee.org/ielx7/6570650/9502055/09395133.pdf?arnumber=9395133) | Exact route documented in P01-G. That report records it as attempted but unreadable by the available PDF reader. The latest paper findings are recorded above as supplied; no new retrieval is claimed here. |

No ResearchGate URL is included because none is documented in the existing P01 evidence. No secondary repository, snippet, or downstream implementation is used to establish either finding.

## 5. Limitations and next evidence needed

1. **H-01:** Obtain primary evidence that explicitly maps both numeric values to the semantic classes and ties that mapping to the exact supplied Zenodo CSV/release. The evidence must address the numerical conflict; totals alone are insufficient.
2. **H-02:** Obtain a primary explanation defining the 78,098 and 72,134 counting units and connecting them to the same release/version. Searches for `78098` and `78 098` in available paper text did not yield an explanation.
3. Paper-reported class distribution does not resolve the dataset's integer encoding. Zenodo's declared encoding does not, on its own, verify the local CSV's encoding.
4. The prior local parse is cited from an existing report only. No CSV inspection, audit-script run, or local data comparison was performed for P01-I.
5. Rights, provenance beyond the cited count facts, dataset eligibility, and project approvals are not reassessed by this report; existing findings remain unchanged.

## 6. Project state and stop point

- **P01:** OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL.
- **H-01 label mapping:** **UNRESOLVED**.
- **H-02 record-count discrepancy:** **UNRESOLVED**.
- **WELFake:** **ON HOLD**.
- **Local model training:** No dataset approved.
- **Public portfolio demonstration:** No dataset approved.
- **Labels:** Preserve original values; do not infer, reverse, modify, or relabel them.
- **P02 Figma:** **NOT started**.
- No roadmap phase or milestone is marked complete by this report. No roadmap or approval status is changed.

**STOP: awaiting mentor review. Do not automatically begin H-03.**

## Related VeriNews evidence

- [P01-H WELFake primary evidence access plan](p01-h-welfake-primary-evidence-access-plan.md)
- [P01-G WELFake evidence verification](p01-g-welfake-evidence-verification.md)
- [P01-F dataset evidence decision register](p01-f-dataset-evidence-decision-register.md)
- [WELFake label-integrity investigation](welfake-label-integrity-investigation.md)
- [Phase 1 summary](../phase-1-summary.md)
