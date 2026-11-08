# VeriNews P01-G — WELFake Dataset Evidence Verification

**Research date:** 2026-11-07  
**Project status:** P01 remains **OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL**. WELFake remains **ON HOLD**. No dataset is approved for local training or public portfolio demonstration.  
**Scope:** Read-only review of existing VeriNews reports and publicly accessible WELFake record/bibliographic sources. No dataset or archive was downloaded or accessed during this task.

## 1. Purpose and scope

This report checks what authoritative public documentation establishes about WELFake's label mapping, construction/provenance and reuse terms. It reconciles that documentary evidence with—but does not repeat—the existing local archive audit.

The report separates:

- **Primary-source claims:** what the WELFake authors' Zenodo record says.
- **Bibliographic evidence:** publication metadata for the WELFake paper.
- **Existing local audit findings:** results recorded in VeriNews reports; no new local audit was run.
- **Inference:** risks suggested by source composition, explicitly not measured facts.

The task does not provide legal advice or approve dataset use. Existing labels and dispositions are preserved.

## 2. Existing evidence reviewed

The following files were present and inspected before this report was created:

- [WELFake Archive Inspection](welfake-archive-inspection.md) — initial low-field-limit findings are explicitly superseded by the follow-up; retain the correction notice.
- [WELFake Label and CSV Integrity Investigation](welfake-label-integrity-investigation.md) — corrected strict parse and unresolved semantic mapping.
- [WELFake Label Resolution and English Alternatives](welfake-alternative-resolution.md) — Recommendation C; WELFake remains on hold.
- [P01-E Final Dataset Feasibility Review](p01-e-final-dataset-feasibility-review.md) — no dataset approved for training or public demonstration.
- [P01-F Dataset Evidence Decision Register](p01-f-dataset-evidence-decision-register.md) — current candidate status and evidence gates.
- [Phase 1 summary](../phase-1-summary.md) — P01 open/awaiting dataset evidence and mentor approval.

### Findings already established by project documentation

The corrected local inspection reports **72,134 strict four-field records**, labels `0: 35,028` and `1: 37,106`, all labels exactly `0` or `1`, and no parser errors with a sufficiently high in-memory CSV field limit. It reports sequential indices `0–72,133`. The raw values were not changed. Two overlong quoted text fields caused the earlier default-parser errors; the original archive audit's earlier malformed-row, non-binary-label and derived statistics are superseded.

Zenodo reports 35,028 real and 37,106 fake and documents `0 = Fake, 1 = Real`. Thus local totals align with Zenodo's reported class totals only if the mapping were reversed. This numerical alignment is **not** proof of semantics. The controlled local spot-check was small and stylistic, not fact-checking evidence. Keep all raw labels unchanged.

The Zenodo statement of 78,098 CSV entries versus 72,134 strict local logical records also remains unexplained. The previous WELFake reports found no accessible verified author-maintained mapping repository or separate supplement resolving either issue.

## 3. Primary sources investigated

Access dates below are 2026-11-07.

| Source | Author/publisher and exact title | Access result and evidence boundary |
|---|---|---|
| [Zenodo record 4561253](https://zenodo.org/records/4561253) and [record API](https://zenodo.org/api/records/4561253) | Dataset deposit by Pawan Kumar Verma, Prateek Agrawal and Radu Prodan; *WELFake dataset for fake news detection in text data*; published by Zenodo, version 0.1 | **Accessed.** The public HTML page and record API expose the creators, description, source-combination statement, label mapping, counts, record references, one CSV file entry and a CC BY 4.0 licence declaration. The file itself was not opened or downloaded. |
| [Original journal paper DOI](https://doi.org/10.1109/TCSS.2021.3068519) / [IEEE Xplore record](https://ieeexplore.ieee.org/document/9395133) | Pawan Kumar Verma, Prateek Agrawal, Ivone Amorim and Radu Prodan; “WELFake: Word Embedding Over Linguistic Features for Fake News Detection”; *IEEE Transactions on Computational Social Systems*, 8(4), 881–893 (2021) | **Bibliographic metadata verified; article content not accessed.** DOI/Crossref resolves the title, authors, venue and 2021 publication details. The IEEE Xplore page returned no readable article content through the available fetch route. A Crossref-listed IEEE PDF endpoint could not be read because the fetch tool does not support PDF content. No paper passage, table, figure or supplement was therefore verified. |
| [Crossref metadata for the journal DOI](https://api.crossref.org/works/10.1109/TCSS.2021.3068519) | Crossref bibliographic record | **Accessed.** Confirms citation metadata and points to IEEE Xplore. It is not the paper text and does not establish label semantics or dataset rights. |
| [Related 2020 conference paper DOI](https://doi.org/10.1007/978-981-15-5619-7_18) | P. K. Verma and P. Agrawal; “Study and Detection of Fake News: P2C2-Based Machine Learning Approach”; Springer conference volume (2020) | DOI resolver returned bibliographic citation details; the Springer chapter page did not yield readable content. This is a related work listed by Zenodo, not evidence that its label definitions apply to WELFake. |

The Zenodo record lists **one file**, `WELFake_Dataset.csv`; no separate supplementary file is listed in the record metadata inspected. This does not rule out supplements elsewhere, but none was verified. Public repository search attempts did not produce an accessible author-maintained WELFake code/documentation source that resolves the mapping; no search snippet or unrelated downstream project is treated as primary proof.

## 4. Label mapping investigation

### Direct documentary evidence

The authors' Zenodo deposit description states:

> “Label (0 = fake and 1 = real).”

The same description reports **35,028 real** and **37,106 fake** articles. This is an explicit author/depositor statement of the intended mapping in the dataset record. It verifies the **declared mapping**, not that the supplied CSV's label values actually follow it.

| Source | Relevant location / wording | What it establishes | Confidence |
|---|---|---|---|
| Verma, Agrawal & Prodan, *WELFake dataset for fake news detection in text data*, Zenodo record 4561253, [HTML](https://zenodo.org/records/4561253), [API](https://zenodo.org/api/records/4561253) | Description: “Label (0 = fake and 1 = real).” Same description reports “35,028 real and 37,106 fake news.” | The deposit explicitly **declares** `0 = Fake`, `1 = Real`. It does not explain the discrepancy between these class totals and the corrected local counts under that declared mapping. | **PARTIALLY VERIFIED** — declared encoding is explicit; semantic application to the inspected local CSV remains unresolved. |
| Verma et al., “WELFake: Word Embedding Over Linguistic Features for Fake News Detection,” IEEE, [DOI](https://doi.org/10.1109/TCSS.2021.3068519) | Full article text, page/table/figure and supplement could not be accessed/read in this investigation. | No independently inspected paper passage confirms or contradicts the Zenodo label declaration. | **UNRESOLVED** |
| Existing corrected local audit, [label-integrity investigation](welfake-label-integrity-investigation.md) | Strict parse: `0: 35,028`, `1: 37,106`; two-records-per-label non-random style spot-check is explicitly non-authoritative. | Confirms raw values/counts, not the semantic meaning of the integers. Counts and style do not authorize reversal. | **UNRESOLVED** for actual semantic mapping. |

### Label decision

**The documentation's intended mapping is explicitly stated, but whether it is correct for the local CSV remains UNRESOLVED.** For the required overall status, label mapping confidence is **UNRESOLVED**. The primary Zenodo statement itself is verified as a statement; the label values must not be reversed or treated as confirmed ground truth. No new primary paper/supplement evidence resolved the conflict.

## 5. Dataset provenance investigation

### What the author/depositor record says

Zenodo describes a 72,134-article dataset created by merging “four popular news datasets (i.e. Kaggle, McIntire, Reuters, BuzzFeed Political).” It says the purpose was to provide more data and “prevent over-fitting of classifiers.” This verifies the deposit's provenance **claim**, not the record-by-record origin of the CSV.

The Zenodo record's references include, among other entries, a “Benjamin political news dataset,” a BuzzFeed News dataset, FakeNewsNet, LIAR, and the 2020 P2C2 paper. The visible reference list does not provide a record-level source manifest or clearly reconcile those references to all four names in the description (notably the generic “Kaggle,” “McIntire,” and “Reuters” components). No inference is made about which records came from which source.

### What is not established

- The accessible Zenodo description does not specify a per-record source map, collection dates, article URLs, source-to-class assignment, deduplication policy, or class-label construction procedure beyond the binary label declaration.
- No inspected primary paper passage or supplement was available to establish human annotation, fact-check verification, adjudication, annotator agreement, or quality-control procedures for the WELFake rows.
- It is therefore **not established** from sources accessed here whether labels are individual article-level fact-check outcomes, inherited from source datasets, publisher/source-derived, or a mixture. Calling them “Fake/Real” in the record does not settle how each row received its label.
- The use of multiple source corpora is record-reported. Source, topic, time-period and collection-procedure confounding are plausible risks, but no leakage rate or per-class source correlation was measured in this investigation.
- The original paper may contain additional details; it was not accessible through the checked public routes. Its contents are not inferred from the abstract/citation or other studies.

| Provenance question | Current evidence and status |
|---|---|
| Named source collections | Zenodo reports Kaggle, McIntire, Reuters and BuzzFeed Political. **PARTIALLY VERIFIED** as a depositor statement; record-level lineage is not supplied in the inspected metadata. |
| Label assignment method | Binary mapping is stated, but operational assignment/verification method not established from accessible primary text. **UNRESOLVED** |
| Article-level fact-check vs. source-derived labels | No evidence inspected settles this distinction. **UNRESOLVED** |
| Annotation and quality control | No accessible primary paper passage or supplement verified. **UNRESOLVED** |
| Source/topic/time bias | Multi-source composition is documented by Zenodo. Specific class associations and period bias are not established here; leakage concerns remain inference until measured. **PARTIALLY VERIFIED** |

## 6. Rights and permission verification

### Rights evidence

The Zenodo HTML Rights field and API metadata declare **Creative Commons Attribution 4.0 International (CC BY 4.0)**. Zenodo marks the record **Open** and offers a CSV file link. This verifies the record's access and licence declarations. It does **not** independently establish that the depositor owns or may license all upstream news article text, or that every intended activity involving those articles is permitted. No separate WELFake data-specific terms file or upstream permissions chain was found in the accessible record information.

Crossref's publisher-deposited metadata for the IEEE article records a CC BY 4.0 licence for the article's version of record. That is publication metadata for the scholarly paper, not evidence of WELFake dataset or upstream article-content rights. Repository software licensing was not treated as dataset permission.

### Activity permission matrix

“Declared CC BY 4.0” means the Zenodo record attaches that licence to the dataset deposit; it is not a legal finding of authority over third-party content. “Unknown” means the required permission was not established in reviewed primary evidence, not that use is legally prohibited.

| Activity | Dataset-specific licence / explicit permission | Underlying article/content rights | Evidence-based conclusion |
|---|---|---|---|
| 1. Dataset download/access | Zenodo marks the record **Open** and provides a CSV file link; the record declares CC BY 4.0. This establishes a publicly offered access route and deposit-level terms. | No independent upstream rights or copying authorization was established. | **PARTIALLY VERIFIED** for the deposit's access declaration only. This investigation did not download/access the CSV. |
| 2. Local inspection and research | CC BY 4.0 is declared for the deposit; no separate research-only restriction was visible on the record. | Rights to inspect/reuse included third-party articles under that declaration are not independently established. | **PARTIALLY VERIFIED** at deposit-metadata level; upstream scope remains unknown. |
| 3. Local preprocessing | CC BY 4.0 is declared; no WELFake-specific preprocessing permission statement beyond the licence was located. | Rights to transform article text and retain derived copies remain unverified for upstream content. | **UNRESOLVED** for the project use; do not preprocess under this report. |
| 4. Local model training | No separate training permission was found beyond Zenodo's CC BY 4.0 declaration. | Depositor authority over all source article text is unresolved; label validity is also unresolved. | **UNRESOLVED; NOT APPROVED.** |
| 5. Publishing aggregate evaluation metrics | CC BY 4.0 is declared, but the record does not separately address metrics. | Rights/conditions for metrics derived from third-party material were not established in the inspected source. | **UNRESOLVED.** Do not infer a metrics grant beyond the declaration. |
| 6. Public portfolio demonstration | Deposit-level CC BY 4.0 declaration may be relevant to licensed material; no separate public-demo statement found. | Rights to show a trained model, results or content derived from upstream articles are not established. | **UNRESOLVED; NOT APPROVED.** |
| 7. Showing dataset-derived text excerpts or samples | CC BY 4.0 is declared for the deposit, subject to its terms. | Rights to publicly reproduce excerpts from third-party news articles are not established. | **UNRESOLVED; do not publish samples/excerpts absent clearance.** |
| 8. Redistributing the dataset or processed derivatives | Zenodo declares CC BY 4.0 for the deposited record, which includes attribution conditions. | No evidence establishes authority to relicense every upstream article or derivative; upstream restrictions may differ. | **UNRESOLVED; no redistribution approval.** |

This matrix is an evidence summary, not legal advice. A CC BY field does not automatically clear upstream content or amount to project approval.

## 7. Conflicts, gaps, and inaccessible sources

1. **Label/count conflict:** Zenodo expressly maps `0=Fake, 1=Real` and reports 35,028 Real / 37,106 Fake. The corrected local parse has 35,028 zeros / 37,106 ones. This discrepancy is not resolved by the record, paper text accessible here, or local counts.
2. **Record-count discrepancy:** Zenodo says “78098 data entries” and that 72,134 were accessed in its dataframe. Existing strict local parsing yields 72,134 logical data records. No cause is established.
3. **Original paper access:** the IEEE Xplore page did not return readable article text via the available fetch route; the PDF endpoint returned `application/pdf`, which this environment's webfetch tool cannot read. No access restriction was bypassed. No relevant paper passage, table, figure or supplementary material was inspected.
4. **Author repository:** no verifiable original-author code/documentation repository with label mapping was identified in the existing reports or public source checks. No downstream/student repository is accepted as primary mapping evidence.
5. **Provenance detail:** Zenodo's source-list wording is high-level and lacks a per-record manifest, label-generation account and reconciled references. The paper might provide details, but those are not claimed here.
6. **Rights scope:** CC BY 4.0 is verified only as the Zenodo deposit declaration. Rights authority for upstream article content and permissions for the requested project activities remain unresolved.
7. **Secondary evidence:** prior reports mention a 2025 secondary study snippet suggesting reversed labels, but the source was not accessible/verified as primary evidence and it is not used to decide mapping or rights.

## 8. Final eligibility assessment

Only the following decision labels are used in this assessment: **VERIFIED**, **PARTIALLY VERIFIED**, **UNRESOLVED**, **NOT APPROVED**, **NOT APPLICABLE**.

| Required status | Decision | Basis |
|---|---|---|
| Label mapping confidence | **UNRESOLVED** | Zenodo's declared mapping is explicitly documented, but its application to the local CSV conflicts with reported class totals. No authoritative evidence inspected resolves the conflict. |
| Provenance confidence | **PARTIALLY VERIFIED** | Zenodo reports the four source collections and merge purpose; per-row lineage, actual label-generation method and article-level verification/annotation are not established. |
| Dataset-specific rights confidence | **PARTIALLY VERIFIED** | Zenodo's CC BY 4.0 declaration is verified as metadata. Its scope/authority over all deposited contents and project-specific use conditions have not been independently established. |
| Upstream article rights confidence | **UNRESOLVED** | No upstream rights chain, source-specific permissions or proof of depositor authority for all article text was located. |
| Local training eligibility | **NOT APPROVED** | Label semantics remain unresolved; upstream rights and use permissions are not established; project/mentor approval is absent. |
| Public demo eligibility | **NOT APPROVED** | Upstream rights and public display/model/excerpt permissions are not established; model results would also rely on unresolved labels. |

**Whether label mapping was verified:** The primary Zenodo record's *declared* `0=Fake, 1=Real` wording is **VERIFIED as a statement**. The actual semantic mapping in the supplied CSV is **UNRESOLVED**. Do not reverse values.

**Whether any rights were explicitly established:** The Zenodo record explicitly declares CC BY 4.0 and marks the record Open. That is **PARTIALLY VERIFIED as deposit-level metadata**, not legal clearance of upstream articles and not approval for VeriNews training or public demonstration.

## 9. Exact remaining evidence needed

Before reconsideration, the following evidence must be obtained without treating this list as authorization:

1. **Primary label confirmation:** an authoritative source from the original WELFake authors/maintainers or a readable original-paper/supplement passage that establishes how the CSV's `label` column is encoded and resolves the conflict with reported class totals. Evidence must apply to this exact release/version.
2. **78,098 explanation:** primary documentation explaining what “78098 data entries” counts and how that relates to the 72,134 records in the deposited release.
3. **Construction/annotation protocol:** original paper/supplement or author documentation specifying how each constituent source was selected, how Fake/Real labels were assigned, whether items were independently fact-checked or inherited source labels, annotation/adjudication/quality controls, and any deduplication/filtering steps.
4. **Source lineage:** a versioned manifest or authoritative equivalent mapping records or partitions to source, date and label-generation provenance; reconcile the four sources named in Zenodo's description with its references and the actual release.
5. **Dataset-specific terms:** clear terms for the exact dataset release and intended private research, local preprocessing/training, metric publication, public portfolio/model display, example excerpts, and redistribution of raw or processed derivatives.
6. **Upstream content rights:** evidence explaining rights/permissions for article text from Kaggle, McIntire, Reuters and BuzzFeed Political (or corrected source list), and the depositor's authority to license/authorize each included component.
7. **Mentor/project approval:** explicit approval of the exact version and activity scope after evidence review. Permission evidence does not itself change VeriNews status.

Any future local file re-audit, archive inspection, or contact with authors/providers requires separate mentor authorization. This task authorizes none of those actions.

## 10. Recommended next action

Keep WELFake **ON HOLD** and keep the supplied labels unchanged. The next recommended action is **mentor review of the evidence gap and authorization boundary**, followed—only if the mentor authorizes a research-only follow-up—by seeking/locating primary documentation for the exact label mapping, count discrepancy, construction protocol and upstream rights. If the paper or official source remains inaccessible, record that limitation and retain **UNRESOLVED**; do not substitute secondary snippets or infer reversal from totals.

## 11. Explicitly not performed

- Did not download, open, fetch or extract `data/raw/welfake/WELFake_Dataset.csv` or any dataset/archive.
- Did not repeat the existing local archive audit or run audit scripts.
- Did not modify raw data, labels, existing reports, audit scripts or audit results.
- Did not preprocess data, train/evaluate a model, install dependencies or create model artifacts.
- Did not contact authors, publishers, institutions or dataset providers.
- Did not bypass access restrictions or access private accounts.
- Did not change candidate approval status, P01 status or the P00–P15 roadmap; did not start P02.

**STOP: awaiting mentor review.**

## Sources actually accessed

- Zenodo record HTML: <https://zenodo.org/records/4561253> — accessed 2026-11-07.
- Zenodo record API: <https://zenodo.org/api/records/4561253> — accessed 2026-11-07. Record metadata only; no file-content endpoint accessed.
- Crossref bibliographic metadata: <https://api.crossref.org/works/10.1109/TCSS.2021.3068519> — accessed 2026-11-07; citation metadata, not article text.
- IEEE Xplore article page: <https://ieeexplore.ieee.org/document/9395133> — attempted 2026-11-07; no readable article text returned.
- Crossref-listed IEEE PDF endpoint: <http://xplorestaging.ieee.org/ielx7/6570650/9502055/09395133.pdf?arnumber=9395133> — attempted 2026-11-07; PDF content unsupported by the available fetch reader, not retrieved for local inspection.
- Related Springer DOI: <https://doi.org/10.1007/978-981-15-5619-7_18> — accessed 2026-11-07; bibliographic citation only, not full chapter text.

## Related VeriNews evidence

- [WELFake archive inspection](welfake-archive-inspection.md)
- [WELFake label integrity investigation](welfake-label-integrity-investigation.md)
- [WELFake alternative resolution](welfake-alternative-resolution.md)
- [P01-E feasibility review](p01-e-final-dataset-feasibility-review.md)
- [P01-F evidence decision register](p01-f-dataset-evidence-decision-register.md)
- [Phase 1 summary](../phase-1-summary.md)
