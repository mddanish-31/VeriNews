# VeriNews P01-H — WELFake Primary Evidence Access and Verification Plan

**Plan date:** 2026-11-07  
**Purpose:** Plan future, source-specific verification of evidence gaps recorded in P01-G. This is not evidence collection or authorization to access sources or files.  
**Project status:** P01 remains **OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL**. WELFake remains **ON HOLD**. No dataset is approved for local training or public portfolio demonstration. P02 has not started.

## 1. Scope and guardrails

This plan uses only the source references and access results already recorded in P01 reports. It does not perform new external research. Accessibility below means “previously recorded in P01-G,” not a claim that a URL is reachable today.

No dataset/archive is to be downloaded or opened under this plan. Do not inspect the local CSV or run audit scripts. Do not infer label semantics from counts or writing style, treat downstream student repositories as primary sources, or treat a software/paper licence as a dataset licence. Any future activity must remain within the authorization boundaries in Section 6.

## 2. Existing evidence baseline

P01-G and the existing investigation reports establish the following documentary baseline:

- The authors' Zenodo record explicitly says **“Label (0 = fake and 1 = real)”** and reports 35,028 real and 37,106 fake. This verifies the deposit's declaration, not that the exact CSV applies that mapping.
- The corrected local audit (not repeated for this plan) reports 72,134 strict four-field records, raw counts `0: 35,028` and `1: 37,106`. The relationship between these counts and the deposit's stated class totals is unresolved. Raw labels remain unchanged.
- Zenodo says the CSV has **“78098 data entries”** and “only 72134 entries are accessed as per the data frame.” Existing strict local parsing reports 72,134 logical records. No cause or counting definition is established.
- Zenodo describes a merge of **“Kaggle, McIntire, Reuters, BuzzFeed Political”** and says the aim was to provide more data and prevent classifier over-fitting. Per-record/per-partition source lineage, source contributions, label assignment, annotation, filtering and deduplication are not documented in the accessible metadata cited by P01-G.
- Zenodo declares CC BY 4.0 and marks the deposit Open. P01-G did not establish the depositor's authority over all upstream article text or permissions for every proposed VeriNews activity.
- The original IEEE paper's bibliographic metadata was verified, but its full text was not readable by the recorded fetch routes. No supplementary item was listed among the Zenodo files inspected. The related Springer DOI yielded citation details only.

Existing decisions remain unchanged: **WELFake ON HOLD; no label reversal; local training and public demonstration NOT APPROVED.**

## 3. Verification plan by evidence gap

### 3.1 Original label mapping

**Question:** Does the exact Zenodo v0.1 CSV, `WELFake_Dataset.csv`, use `0 = Fake, 1 = Real`, or another mapping?

#### Planned sources and inspection targets

1. **IEEE journal paper:** Use the DOI and IEEE Xplore record in Section 5. If legitimate full-text access is approved, inspect the dataset description, data/label definitions, experimental setup, tables/figures that state class encoding, footnotes and supplementary-material links. Record exact page/section and quotation.
2. **Supplementary material:** First establish from the publisher's article page or the relevant author/publisher record whether a supplement exists and what version it describes. P01-G only established that Zenodo listed one CSV file; it did not establish that no supplement exists elsewhere.
3. **Author-maintained documentation:** Search only official author/publisher-linked repositories or documentation after authorization. Confirm author ownership/association and release/version linkage. Do not rely on student forks, third-party mirrors, search snippets or code-only licences.
4. **Zenodo release:** Preserve the exact record/version and its literal mapping wording. Do not access the CSV file itself under this plan.

#### Evidence required to connect a mapping to the supplied release

A sufficient primary record must:

- explicitly define the `label` column's values, including which value means Fake and which means Real;
- identify the relevant WELFake release/file, ideally the Zenodo DOI/version and filename, and not merely describe a different paper experiment or predecessor corpus;
- state whether all rows use the mapping uniformly and explain any exclusions, relabeling or alternate releases;
- reconcile the stated class totals with the existing corrected local counts and the record's 78,098/72,134 statements, or otherwise explain why they refer to different units/releases; and
- be attributable to the dataset authors or publisher's original paper/supplement, with a stable URL/DOI and exact location recorded.

If credible primary sources conflict, or if the paper discusses a different version without a verifiable link to the deposited CSV, the mapping remains **UNRESOLVED**. A class-count match under reversal, plausible text style, or downstream repository claim is insufficient proof.

#### Label verification checklist

- [ ] Record exact paper/supplement title, authors, publisher, DOI/URL, access date, page/section/table/figure and short passage.
- [ ] Confirm the evidence explicitly maps both values (`0` and `1`) to semantic classes.
- [ ] Confirm it applies to Zenodo 4561253 version 0.1 and `WELFake_Dataset.csv`.
- [ ] Check for contradictory primary statements across the paper, supplement and deposit.
- [ ] Obtain a primary explanation of the class-total/count discrepancy; do not infer a reversal.
- [ ] Record conclusion as VERIFIED only if the exact-version link and contradictions are resolved; otherwise retain UNRESOLVED and preserve labels.

### 3.2 Record-count discrepancy

**Question:** What does Zenodo's “78098 data entries” count, and how does it relate to “only 72134 entries are accessed as per the data frame” and the 72,134 strict local logical records?

#### Metadata to preserve exactly

From the Zenodo description, retain both the literal wording and context:

> “There are 78098 data entries in csv file out of which only 72134 entries are accessed as per the data frame.”

Also retain the same description's statement of 72,134 news articles and its class totals (35,028 real; 37,106 fake). Preserve record DOI `10.5281/zenodo.4561253`, version 0.1, file name and the API/HTML retrieval date when the future research is authorized. These values are separate statements; do not silently treat them as equivalent counts.

#### Candidate documentary routes

- Original IEEE paper's data description, construction section, tables, notes and appendices/supplement, if legitimately accessible.
- Zenodo version history and metadata for the exact deposited version. Inspect metadata only unless separately authorized for any file operation.
- Original-author documentation that defines “entries,” “accessed,” dataframe filtering and whether counts refer to records, physical lines, filtered rows, a prior file version or another object.

#### Acceptance criterion

The discrepancy is resolved only by primary evidence that defines the unit/version behind each figure and reconciles that definition with the deposited version and existing strict local record count. Record the explanation verbatim with its exact source location. If the explanation is missing, ambiguous, or describes another release without linkage, keep the discrepancy **UNRESOLVED**. Do not select a cause based on plausible CSV/parser explanations.

### 3.3 Dataset construction and provenance

**Questions:** How were the four named collections combined; what did each contribute; how were labels assigned; were items independently fact-checked or labels inherited; what filtering, deduplication and quality checks were applied?

#### Paper/source documentation targets

If later authorized, inspect the original paper sections on dataset collection, data preparation, annotation/labels, experimental dataset statistics, limitations and supplementary material. Compare those statements with the Zenodo description and reference list. The related 2020 P2C2 conference paper is a separate publication; do not assume its process defines WELFake unless the WELFake paper or authors explicitly make that connection.

Zenodo's reference list includes some named dataset/paper references but does not, as recorded in P01-G, reconcile its references to the four-source merge claim. For a source named only generically (for example, “Kaggle” or “McIntire”), do not guess an exact dataset URL or creator. Record the URL as **not identified in existing evidence** until an authorized primary-source route identifies it.

#### Required lineage and method evidence

- Exact source/release identity for each component; source version/date and stable citation/URL.
- Per-source contribution counts and whether sources overlap or were nested/derived from each other.
- Source-to-partition or source-to-record lineage sufficient to determine which source supplied each example and its original label. If row-level manifests cannot be shared, require a reproducible source-level manifest and explicit limits on what it establishes.
- Transformation history: cleaning, selection, label conversion, balancing/augmentation, filtering and deduplication, with scripts/version or an equivalent reproducible method description.
- Label definition and assignment: inherited source labels vs. item-level fact-check/annotation; verification evidence, annotator roles, instructions, adjudication and quality controls if claimed.
- Explanation of whether source, topic and time-period are associated with labels. Describe documented facts separately from inferred leakage risk; do not present risk as a measured result.

#### Acceptance criterion

Mark provenance **VERIFIED** only when a primary, release-linked account and adequate lineage explain source contributions and label creation, with claimed quality/deduplication procedures reproducibly specified. Mark **PARTIALLY VERIFIED** when the named sources or general method are author-reported but per-record lineage or label method remains missing. Keep it **UNRESOLVED** if release identity, source attribution or label origin cannot be established.

### 3.4 Dataset-specific and upstream rights

**Questions:** What does the Zenodo CC BY 4.0 declaration cover? Can the depositor license the included content? What are the terms of each upstream source? Which proposed project activities are supported?

This plan is not legal advice. It creates an evidence checklist only. A record-level licence is not treated as proof of rights in underlying news text. A scholarly article licence, software licence, platform download link, or general website terms page must not be substituted for dataset- or content-specific permission.

#### Required rights chain

For the exact Zenodo version, document:

1. The complete Zenodo rights field, API licence identifier, record version and any included data-specific terms/notice.
2. Whether the declared CC BY 4.0 applies to the database/compilation, individual records, metadata, or some defined subset; what the depositor says they own/control; and any excluded/third-party components.
3. For each confirmed upstream collection, its official data-specific licence/terms and source-content terms in force for the relevant material. If Kaggle, McIntire or Reuters cannot be identified exactly from authoritative sources, record that as an unresolved source identity—not a guessed URL.
4. Evidence that the depositor had authority to license each included component, or explicit permissions/terms from the relevant rights holder(s). Conflicts and unknowns stay visible.
5. Separate permission evidence for each activity in the matrix below, including any non-commercial, attribution, display, retention, derivative, model-output or redistribution conditions.

#### Activity-specific rights checklist

| Activity | Evidence to locate | Block condition |
|---|---|---|
| Download/access | Zenodo record access state, exact release terms, any upstream access restrictions | Do not download or fetch a file under this plan; a public link does not settle reuse rights. |
| Local inspection/research | Dataset-specific permission and upstream terms for copying/reading the included texts | Unknown content scope or conflicting terms keeps use blocked pending review. |
| Local preprocessing | Permission for transforming/retaining text and any derived copy, including upstream content restrictions | Do not preprocess unless exact-version permission and mentor approval are documented. |
| Local model training | Terms that support computational training on this material, plus authority over included content | **Training remains blocked** until dataset and upstream terms, label/provenance gates and mentor approval pass. |
| Publishing aggregate evaluation metrics | Terms for publishing non-reconstructive derived metrics and any attribution/notices | Do not publish metrics on an unapproved dataset or assume metrics permission. |
| Public portfolio/model demonstration | Terms for public display of model, results, artifact and screenshots; assess non-commercial scope | **Public demo remains blocked** until separately supported by applicable evidence and mentor approval. |
| Showing text excerpts/samples | Reproduction/display permission for the exact article excerpts and applicable attribution | Do not display excerpts or samples absent clear permission. |
| Redistributing raw/processed data | Permission and rights chain for the exact source material and derivatives | **Redistribution remains blocked** unless expressly supported; CC BY metadata alone does not establish upstream authority. |

No row is marked cleared by this plan. A future rights review should distinguish evidence of a licence declaration from confirmation that the relevant rights-holder can grant it.

## 4. Evidence source directory

Accessibility statuses below are limited to evidence already recorded in P01-G and prior reports. “Previously accessed” does not authorize or imply a new attempt. A future attempt—including a public documentation page or publisher route—requires the authorization in Section 6.

| Evidence gap | Candidate primary source | Publisher / owner / author | Exact URL or DOI | Source type | Expected evidence | Known accessibility from existing record | Future attempt requires separate authorization? | Priority |
|---|---|---|---|---|---|---|---|---|
| Label, count, source list, record licence | WELFake record 4561253 | Pawan Kumar Verma, Prateek Agrawal, Radu Prodan; hosted by Zenodo | [https://zenodo.org/records/4561253](https://zenodo.org/records/4561253) | Author-associated dataset record | Exact wording, version, rights field, source description and any linked paper/supplement | **Previously accessed 2026-11-07.** Page was readable. One CSV file was listed; file not opened/downloaded. | Yes for a new access/review session under this plan; no file access. | 1 |
| Machine-readable label/count/licence/version metadata | WELFake record API | Dataset record metadata hosted by Zenodo | [https://zenodo.org/api/records/4561253](https://zenodo.org/api/records/4561253) | Public metadata API | Exact metadata fields, licence identifier, file metadata, record references and version links | **Previously accessed 2026-11-07.** Metadata was readable; no file-content endpoint was accessed. | Yes for any new metadata collection under this plan; file-content access is not authorized. | 1 |
| Label mapping; construction; quality control; counts | Original journal paper | Verma, Agrawal, Amorim & Prodan; IEEE | [DOI 10.1109/TCSS.2021.3068519](https://doi.org/10.1109/TCSS.2021.3068519) | Peer-reviewed journal article | Dataset section, explicit column mapping, counts and source/label construction methods | DOI bibliographic details were previously resolved; full text was not retrieved in P01-G. | Yes; use legitimate open/library routes only; no paywall or access-control bypass. | 1 |
| Same as above; supplementary links | IEEE Xplore article page | IEEE Xplore / IEEE | [https://ieeexplore.ieee.org/document/9395133](https://ieeexplore.ieee.org/document/9395133) | Publisher article landing page | Abstract/full text availability, article sections, supplements and official version details | **Previously attempted 2026-11-07; no readable article content returned.** Current accessibility not established. | Yes; only normal authorized routes. | 1 |
| Bibliographic metadata / alternate full-text pointer | Crossref work record | Crossref; publisher-deposited metadata | [https://api.crossref.org/works/10.1109/TCSS.2021.3068519](https://api.crossref.org/works/10.1109/TCSS.2021.3068519) | Bibliographic metadata | Citation, publication licence metadata and publisher link; not dataset semantics | **Previously accessed 2026-11-07.** Metadata readable; not article text. | Yes for a new retrieval/recording step. | 2 |
| Related research context only | P2C2 conference paper | P. K. Verma & P. Agrawal; Springer | [DOI 10.1007/978-981-15-5619-7_18](https://doi.org/10.1007/978-981-15-5619-7_18) | Related scholarly conference chapter | Potential context only; must not be substituted for WELFake-specific evidence absent explicit linkage | DOI citation details were previously available; chapter text was not readable in the recorded attempt. | Yes; legitimate full-text access only. | 3 |
| Source lineage and terms | Kaggle source named by Zenodo | Exact dataset/owner not identified in existing P01 evidence | **Exact URL not identified; do not guess.** | Upstream dataset and platform terms | Exact source/version, terms, labels and reuse conditions for the component actually included | Not established in P01-G. | Yes; first identify the exact source through authorized primary documentation; do not access/download its files. | 2 |
| Source lineage and terms | McIntire source named by Zenodo | Exact dataset/owner not identified in existing P01 evidence | **Exact URL not identified; do not guess.** | Upstream dataset documentation | Exact source/version and source-content terms; contribution and label lineage | Not established in P01-G. | Yes; exact source must first be established from an authorized primary document. | 2 |
| Source lineage and terms | Reuters source named by Zenodo | Reuters; exact corpus/source version not identified in existing P01 evidence | **Exact data/terms URL not identified; do not guess.** | Upstream source and official content terms | Exact Reuters material, relevant official licence/terms, and rights applicable to included article text | Not established in P01-G. | Yes; future documentation review needs separate mentor authorization; no Reuters content access. | 2 |
| Source lineage and terms | BuzzFeed Political / BuzzFeed News reference | BuzzFeed News reference URL is listed in Zenodo metadata; connection to the exact WELFake component remains unverified | [Zenodo-listed reference](https://github.com/BuzzFeedNews/2016-10-facebook-fact-check/tree/master/data) | Upstream repository/documentation reference, not verified as the WELFake release lineage | Exact component/version, label/source lineage, any applicable data-specific rights notice | URL is known from the Zenodo reference list; its accessibility and rights scope were not established by P01-G. | Yes; future documentation-only inspection after authorization; do not fetch dataset files. | 2 |
| Author-maintained mapping/source code | Original authors' official repository/docs, if identifiable | WELFake authors or their official institutions | **No verified URL identified in P01-G; do not invent one.** | Potential primary documentation | Mapping, release/hash linkage, construction scripts and source manifest | No verified author-maintained mapping repository was found in existing reports. | Yes; identification/search task requires separate mentor authorization. | 1 |
| Supplementary methods/count details | Publisher-listed supplement, if one exists | IEEE and/or article authors | **No supplement URL identified in P01-G.** Start from authorized article landing page; do not guess a direct file URL. | Supplementary material | Exact-release mapping, 78,098 explanation, source/annotation/quality methods | Zenodo record inspected in P01-G listed one CSV only; existence elsewhere is unknown. | Yes; legitimate route and mentor authorization required. | 1 |

The Zenodo description names four source collections, while its cited references are not a record-level source manifest and do not fully reconcile the named inputs. Exact upstream URLs for Kaggle, McIntire and Reuters are deliberately left unidentified until reliable primary documentation supplies them.

## 5. Prioritized future investigation sequence

All tasks below are **proposed future work**, not authorized by this plan. Completion of one task does not approve WELFake or remove other gates.

| Task ID / priority | Exact objective | Evidence to obtain | Acceptable sources | Completion criteria | Dependencies | Authorization needed | Expected decision impact |
|---|---|---|---|---|---|---|---|
| **H-01 — Label mapping (1)** | Establish whether `0=Fake, 1=Real` applies to the exact Zenodo 4561253 v0.1 CSV and resolve contradictions. | Explicit label-definition passage; release/file linkage; explanation of conflict with reported/local counts; paper/supplement comparison. | Original IEEE paper/supplement, author-maintained official docs, version-linked Zenodo metadata. | Exact mapping and release are linked by primary evidence; contradictions resolved and citations recorded. Otherwise record UNRESOLVED. | Identify the exact record/version and the authoritative source route. | Separate mentor authorization for new public/publisher research or full-text access attempts; no dataset file access. | Could resolve the declared-vs-applied mapping question; cannot alone authorize training. |
| **H-02 — Count discrepancy (1)** | Define what the 78,098 and 72,134 Zenodo figures count and relate them to the deposited version and corrected local result. | Primary count definitions, release/version history and statement tying the figures to files/records/dataframe filtering. | Zenodo record/version metadata; original paper/supplement; official author documentation. | Each number has an explicit unit/version and relationship; no inferred cause. Otherwise unresolved. | H-01 release identity helpful but not mandatory. | Separate mentor authorization; metadata/documentation only. Any file/CSV re-audit requires additional approval under H-07. | Clarifies release integrity and whether class/count comparisons refer to the same object. |
| **H-03 — Construction and provenance (2)** | Reconstruct how each named source contributed and how labels/quality procedures were assigned. | Versioned source-to-record/partition manifest; source versions and counts; label inheritance vs. independent verification; annotation/adjudication; deduplication/filtering/QC. | Original paper/supplement, author-maintained docs/repository, exact upstream official documentation after source identity is established. | Sources, transformations and labels trace to exact release; claimed methods have reproducible or sufficiently specific evidence. Distinguish VERIFIED from PARTIALLY VERIFIED. | H-01 and H-02 establish exact dataset release/units. | Separate mentor authorization for research/source documentation; repository source files or dataset access require additional explicit authorization. | Determines provenance confidence and reveals whether target is fact-check outcome or inherited/source-derived classification. |
| **H-04 — Dataset-specific terms (2)** | Establish the scope of the Zenodo CC BY 4.0 declaration for the exact release. | Full Rights field, linked data terms, licence scope, excluded content and exact version applicability. | Zenodo record/API, any official data-specific terms linked by depositor, original-author documentation. | Record what the rights-holder/depositor expressly declares; identify ambiguity. This is not legal advice or proof of third-party authority. | Exact release identity. | Separate mentor authorization for source/terms collection. | May clarify dataset-level rights confidence but cannot alone clear upstream articles. |
| **H-05 — Upstream content rights (2)** | Establish source identity, applicable terms and rights authority for every upstream component. | Exact source/version, official terms/licences, permissions or documented authority covering the included articles and relevant uses. | Official Kaggle dataset page/terms for identified source; McIntire's official documentation if identified; Reuters official content/licensing terms for exact material; BuzzFeed News official data terms/repository; author rights statement. | Every component is identified and evidence addresses the actual content and activities; conflicts/unknowns remain explicit. | H-03 source lineage; H-04 dataset licence scope. | Separate mentor authorization before browsing official upstream documentation. No content/archive download or provider contact. | Determines upstream-rights confidence. A partial chain leaves training and public-demo gates blocked. |
| **H-06 — Activity permissions (2)** | Evaluate the rights evidence separately for training, metrics, public display, excerpts and redistribution. | Activity-by-activity terms, attribution and non-commercial/display/derivative/model-output limits. | Exact Zenodo/data terms, official upstream terms and explicit rights-holder permissions where available. | Each activity is marked supported, restricted or unknown with cited exact wording; no blanket inference from CC BY metadata. | H-04 and H-05. | Separate mentor authorization; any contact requires separate explicit authorization under category D. | Can inform local training/public-demo eligibility, but only alongside all non-rights gates and mentor approval. |
| **H-07 — Local re-audit (3)** | Only if evidence requires comparison to the exact bytes, verify the existing CSV release identity/counts without changing it. | Exact file identity/checksum, strict logical-record count and only targeted fields needed to test a documented primary claim. | Existing authorized local file and approved read-only audit method; no new archive. | Scoped question, non-destructive method, output preserved as a new audit record only if authorized; reconcile rather than overwrite previous findings. | H-01/H-02 identify a specific unresolved file-level question; rights gate and mentor authorization. | **Separate explicit mentor authorization required. Not authorized by this plan.** | Could test file-to-document linkage/structural counts, not semantic truth or rights. |
| **H-08 — Final decision review (4)** | Reassess eligibility without auto-approval. | Completed evidence register for label, provenance, dataset rights, upstream rights, activity permissions, technical quality and evaluation design. | Existing and newly mentor-authorized primary evidence. | All gates assessed; mentor records exact decision and permitted scope. | H-01–H-06; H-07 only if separately approved/needed. | Explicit mentor/project approval required. | May lead to keep on hold, reject, or reconsider a narrowly defined next stage; never automatic training approval. |

## 6. Future authorization boundaries

The current task authorizes planning only. In particular, the word “public” below does not make new web research part of this task.

| Category | Covered by this planning task? | Separate mentor authorization for future execution? | Evidence/approval before proceeding |
|---|---|---|---|
| **A. Public documentation research** | **Planning only.** No new external pages were consulted for this plan. | **Yes**, before beginning a new evidence-collection pass under project workflow. | Mentor confirms scope/source list and that read-only page/metadata review is permitted; log date, exact wording and access failures. |
| **B. Legitimate scholarly full-text access attempts** | **Planning only.** No new attempt made. | **Yes.** | Mentor approval to try publisher open access, institutional library access available to the user, author manuscript legally deposited in an official repository, or other legitimate route. Do not bypass paywalls, credentials or access controls; do not download files unless separately approved. |
| **C. Inspecting official dataset terms/source documentation** | **Planning only.** No upstream source terms were newly accessed. | **Yes.** | Mentor approves exact source identities and documentation-only inspection. Do not access dataset files, private accounts or restricted pages. Record code licence, dataset terms, paper licence and article rights separately. |
| **D. Contacting authors or providers** | **No.** | **Yes, explicit authorization required.** | Written mentor instruction identifying the contact, purpose, allowed questions and method. No contact details are invented here; no messages are drafted or sent by this plan. |
| **E. Downloading additional archives or dataset versions** | **No.** | **Yes, separate explicit authorization required.** | Mentor approval of exact URL/version, allowed storage/location, integrity procedure, rights/access review and handling scope. Public URLs do not authorize download/reuse. |
| **F. Re-auditing the existing local CSV** | **No.** | **Yes, separate explicit authorization required.** | Mentor-approved narrow audit objective and non-destructive method. No audit script is run or result overwritten under this plan. |
| **G. Preprocessing, training or model evaluation** | **No.** | **Yes, separate explicit phase and dataset/use approval required.** | All label/provenance/rights/technical gates pass; mentor approves exact data version, operation and evaluation plan. This plan itself grants no processing or model permission. |

No action in D–G is authorized by this plan. No access should be inferred from a public URL, Zenodo “Open” status or a repository's software licence.

## 7. Decision framework

Use the evidence-status vocabulary already established in P01-G/P01-F. This plan defines thresholds; it does not change WELFake's status.

| Decision dimension | VERIFIED when… | PARTIALLY VERIFIED when… | UNRESOLVED / NOT APPROVED when… |
|---|---|---|---|
| **Label mapping** | Original-author/publisher primary evidence explicitly maps both values and demonstrably applies to the exact CSV release/version; the count conflict is reconciled; no unresolved contradictory primary evidence remains. | The exact declaration is explicit, but its connection to the supplied CSV or a relevant conflict is not resolved. | Only counts, style, snippets or downstream code support a mapping; sources conflict; or release linkage/count discrepancy remains. Current status stays **UNRESOLVED**. |
| **Provenance** | Exact source versions/contributions, transformations, label generation and claimed QC/deduplication are documented and tied to the release through a reproducible manifest/process. | Named source pool and broad process are author-reported, but source-to-row/partition lineage or label/QC detail is incomplete. | Source identity, label origin, version or methods cannot be established. |
| **Dataset-specific rights** | Exact-version dataset licence/terms are documented from an authoritative source, scope and permitted activity are clear, and conditions/restrictions are recorded. This verifies documentary terms only, not legal advice. | Zenodo CC BY 4.0 declaration is confirmed, but scope, authority, exclusions or applicability remain unclear. | Terms are missing, conflicting, not data-specific, or only a paper/software licence is available. |
| **Upstream article rights** | Each actual upstream component is identified and reliable source/rights-holder evidence supports the intended handling and activities for the included material. | Some but not all sources/rights are supported; unsupported components remain explicitly listed. | Source identities, rights-holder authority or permissions are unknown/conflicting. A dataset-level declaration alone does not pass this gate. |
| **Local-training eligibility reconsideration** | Label, provenance, exact-release integrity, dataset and upstream terms all support local preprocessing/training; an approved evaluation plan exists; mentor approves exact use. | **Not eligible** while any material evidence or authorization gate remains partial/unknown. | Current state: **NOT APPROVED**. Even a VERIFIED label alone does not approve training. |
| **Public-demo eligibility reconsideration** | All training gates pass and terms separately support public model/results/artifact display and any excerpts/screenshots/metrics, with conditions satisfied; mentor approves scope. | **Not eligible** if public-display or excerpt rights are less clear than training rights. | Current state: **NOT APPROVED**. Do not show dataset excerpts or claim a model demo is permitted based only on Zenodo CC BY metadata. |

No single resolved issue automatically approves WELFake. A future decision must separately assess technical data quality, evaluation validity, dataset-specific terms, upstream content rights, each proposed activity and mentor approval.

## 8. Recommended next step and stop point

The next action is mentor review of this plan and selection of a permitted evidence-collection scope. If authorized, begin with **H-01 label mapping**, then **H-02 count reconciliation**, **H-03 provenance**, and **H-04/H-05 rights**. Do not contact anyone, access/download an archive, inspect the local CSV, or preprocess/train as part of executing this plan unless separately and explicitly authorized.

Keep WELFake **ON HOLD**, preserve raw labels, and preserve P01 as **OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL**. No roadmap change or P02 work is proposed.

**STOP: awaiting mentor review. Do not advance automatically.**

## Sources and existing reports

### Already-known public references (access status as described above)

- [Zenodo WELFake record](https://zenodo.org/records/4561253)
- [Zenodo WELFake API](https://zenodo.org/api/records/4561253)
- [IEEE paper DOI](https://doi.org/10.1109/TCSS.2021.3068519)
- [IEEE Xplore article record](https://ieeexplore.ieee.org/document/9395133)
- [Related Springer paper DOI](https://doi.org/10.1007/978-981-15-5619-7_18)
- [BuzzFeed News source URL listed in Zenodo references](https://github.com/BuzzFeedNews/2016-10-facebook-fact-check/tree/master/data) — lineage and current accessibility not established.
- Kaggle, McIntire and Reuters — named in the Zenodo description, but exact upstream dataset/terms URLs were not identified in existing P01 evidence; do not guess.

### VeriNews evidence consulted

- [P01-G WELFake Evidence Verification](p01-g-welfake-evidence-verification.md)
- [WELFake label-integrity investigation](welfake-label-integrity-investigation.md)
- [WELFake alternative resolution](welfake-alternative-resolution.md)
- [P01-E feasibility review](p01-e-final-dataset-feasibility-review.md)
- [P01-F evidence decision register](p01-f-dataset-evidence-decision-register.md)
- [Phase 1 summary](../phase-1-summary.md)
