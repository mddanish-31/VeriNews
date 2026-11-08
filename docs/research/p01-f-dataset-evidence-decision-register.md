# VeriNews P01-F — Dataset Evidence Decision Register

**Register date:** 2026-11-07  
**Purpose:** Compact, traceable status register consolidating P01 evidence. Detailed audits remain in their existing reports; this register does not replace or reinterpret them.  
**Project status:** **P01 OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL.** No dataset is approved or legally cleared for local training or public portfolio demonstration.  
**Scope of this update:** Documentation only. No dataset/archive was accessed or downloaded, no author/provider was contacted, no raw data was modified, and no training or dependency installation occurred. P02 and the P00–P15 roadmap are unchanged.

## 1. How to read this register

- **Technical suitability** describes fit to the article-level English or Hindi (Devanagari) MVP and CPU baseline, not permission or quality approval.
- **Label/provenance confidence** summarizes evidence about unit, label semantics, collection/annotation and version identity. “Reported” does not mean independently confirmed against the data.
- **Dataset-specific rights** records a licence or terms declaration attached to the dataset release. It does not establish the depositor's authority over every included item.
- **Upstream content rights** concern news articles, posts, images or source material included in a corpus.
- **Local training permission** and **public-demonstration permission** are assessed separately. A public demonstration includes publishing a model/results and any displayed excerpts/screenshots; each may have different terms.
- **Unknown / not evidenced** is not a conclusion that use is forbidden. **Not approved** means the project has not authorized use. No row below is a legal clearance.

## 2. English candidates

| Candidate | Technical suitability | Label / provenance confidence | Dataset-specific rights | Upstream content rights | Local-training permission | Public-demonstration permission | Current project status |
|---|---|---|---|---|---|---|---|
| **WELFake** | High format/CPU promise: English article text, 72,134 strict four-field records. Record's separate 78,098-entry statement is unexplained. | **Low / conflicted:** Zenodo says `0=Fake, 1=Real`; strict local counts match reported class totals only under reversal. Counts/style do not resolve mapping. Aggregated source/topic/duplicate leakage remains to be re-audited on valid parsing. | Zenodo declares CC BY 4.0; verified only as deposit metadata. | **Unresolved:** source components include Kaggle, McIntire, Reuters and BuzzFeed Political; depositor authority over all content is not established. | **Not approved.** Declaration alone does not clear upstream rights; label mapping also blocks modeling. | **Not approved / not cleared.** No public use approval; upstream rights and label issue remain. | **On hold. Do not reverse labels.** |
| **ISOT** | Good article-format and likely CPU fit; English only. Source-group labels make it unsuitable as gold-standard item-level truth. | **Moderate for documented collection design, low for item-level truth:** official README says Real items are Reuters and Fake items are from outlets described as unreliable/flagged. No official split; substantial source/topic confounding risk. | **Unknown:** official page offers a download, but no dataset-specific reuse grant was identified. | **Unresolved:** includes Reuters and other publishers' article text; rights were not established. | **Not approved / permission not evidenced.** | **Not approved / permission not evidenced.** | **Conditional English-only source-proxy or external evaluation candidate; not approved.** |
| **LIAR** | Poor MVP fit: short political claims, not article text. Computationally small. | **Moderate for claim-level task:** 12,836 paper-reported claims with six PolitiFact ratings; binary conversion is non-standard. | **Unknown:** no dataset licence verified on author page; “research only” is a secondary-source lead. | Third-party claim/news provenance and reuse terms remain **unresolved**. | **Not approved; no dataset permission evidenced.** | **Not approved; no public demonstration permission evidenced.** | **Adjacent claim-verification benchmark only; not an article replacement.** |
| **FakeNewsNet** | Poor reproducibility/MVP fit: dynamic crawling and tweet hydration rather than stable self-contained full text. | **Low for a frozen training corpus:** changing availability and collection make record/version consistency difficult. | **Not established** in reviewed project materials. | **Unresolved**, including article and social content. | **Not approved; permission not evidenced.** | **Not approved; permission not evidenced.** | **Excluded from MVP shortlist.** |
| **NELA-GT** | English article text, but source-level publisher reliability is a different target; large scale is unnecessary for the CPU MVP. | **High confidence in task mismatch:** labels represent publishers/sources rather than article truth; source leakage is inherent to transferring them to articles. | **Not verified** in reviewed owner README. | **Unresolved** for article text and transformed records. | **Not approved; permission not evidenced.** | **Not approved; permission not evidenced.** | **Rejected for the current article-level Fake/Real task.** |
| **Fakeddit** | Poor task fit: Reddit social posts, multimodal/distant labels, not publisher articles. | **High confidence in task mismatch:** project reports 2-, 3- and 6-way distant-supervision labels. | **Not verified** in this review; project guidelines apply. | **Unresolved**, including underlying Reddit content. | **Not approved; permission not evidenced.** | **Not approved; permission not evidenced.** | **Rejected for the current article-level Fake/Real task.** |

## 3. Hindi candidates

| Candidate | Technical suitability | Label / provenance confidence | Dataset-specific rights | Upstream content rights | Local-training permission | Public-demonstration permission | Current project status |
|---|---|---|---|---|---|---|---|
| **TaLLIP Hindi** | Closest reported article-level Hindi candidate; repository paths list Hindi train/test files. Actual schema, count and text completeness are unverified; CPU fit is plausible if corpus size is moderate. | **Low:** repository reports binary Fake/Real, but operational labels, annotation, Hindi sources, original-vs-translated status and split construction are undocumented. Six-vs-seven domain descriptions and release identity remain unresolved. | **Unknown:** MIT repository licence is for stated Software scope, not established as a dataset licence. | **Unresolved:** language-specific source rights and English-source lineage are not fully documented. | **Not approved; permission not evidenced.** | **Not approved; permission not evidenced.** | **Pending verification; preserve current status.** |
| **Indic Zenodo Hindi archive** | Hindi text files are present in an already-existing local audit, but article completeness, language coverage and corpus-to-paper identity remain uncertain. CPU fit is plausible, not a clearance. | **Low / conflicted:** local audit counted 20,593 files vs. paper-reported 20,493; found 5,493 exact duplicate excess and two very short files despite paper-reported filtering. Label folders are not proof of truth. Annotation methods are paper-reported but not tied to this archive version. | **Conflict:** Zenodo declares CC BY 4.0; the 2025 paper says CC BY-NC 4.0. No precedence/version resolution. | **Unresolved:** news, fact-check and social-source content rights are not established by either declaration. | **Not approved.** Conflicting terms, archive identity, quality and rights remain unresolved. | **Not approved / not cleared.** | **Research lead only; not approved for training or preprocessing.** |
| **IFND** | Weak article-task fit: repository lists CSV fields such as Statement, Image, Category, Date and Label; full article bodies and row language are unverified. CPU-feasible only in a generic size sense. | **Low:** paper reports 56,868 vs. 56,713 in prior notes; repository row count/language are unverified. Paper describes artificial fake-text augmentation; overlap and version lineage matter. | README says research-purpose use only; no formal dataset licence located. | **Unresolved** for source articles/images and augmented text. | **Not approved.** “Research purpose” is not an express VeriNews training grant in reviewed evidence. | **Not approved; terms do not establish public display.** | **Not approved as independent external test; supplementary lead only.** |
| **HinFakeNews / LFWE** | Paper-reported ~33,300 Hindi articles and binary/topical labels suggest potential technical fit, if a legitimate release exists. | **Low / paper-reported:** counts and method not independently checked; no public archive available in reviewed sources. | **Unknown / access not established.** | **Unresolved.** | **Not approved; no accessible authorized release or training permission evidenced.** | **Not approved; no public-use permission evidenced.** | **Restricted/unreleased research reference; not selected.** |
| **BharatFakeNewsKosh (BFNK)** | Poor current MVP fit: reports describe noisy social posts/forwards and code-mixed content, not a clean Devanagari article corpus. | **Low / paper-reported:** exact relevant Hindi article subset and labels not independently validated. | **Not established** in P01. | **Unresolved** for posts and source content. | **Not approved; permission not evidenced.** | **Not approved; permission not evidenced.** | **Excluded from baseline for task/noise mismatch.** |

## 4. Cross-language leads affecting the English/Hindi decision

These do not constitute a verified bilingual training set or change existing dispositions.

| Candidate | Technical / label-provenance status | Dataset-specific and upstream rights | Local training / public demo | Current disposition |
|---|---|---|---|---|
| **MM-COVID** | English and Hindi are reported, but mixed fact-check/news/social content, COVID-only scope and count conflict (paper total 11,173; language table totals 11,565) prevent direct MVP fit. | Dataset reuse terms and upstream rights not found. | **Neither approved nor permission evidenced.** | Research-only lead for a separately scoped COVID task; not an MVP set. |
| **FakeCovid** | 40 languages including Hindi are reported, but per-language counts and a clean binary article task are unverified; COVID/fact-check labels. | Project page states CC BY-NC 4.0 for research; Zenodo declares CC BY 4.0; repository shows CC0. Conflicting scopes and third-party rights unresolved. | **Neither approved nor cleared.** | Research-only pending exact-version terms and task evidence. |
| **CT-FAN** | English/German, four-way truth rating; no Hindi and not the MVP binary target. | Express research-only restrictions; no redistribution. Underlying content conditions remain relevant. | Training permission is unclear under derivative-work restrictions; public model display is not clarified. Neither approved. | Research benchmark only, subject to its terms; not an MVP dataset. |

No source in the reviewed P01 set establishes a verified English–Hindi parallel/translated corpus. Do not infer alignment from a multilingual language list.

## 5. Exact unresolved evidence and where it can be resolved

“Existing documentation” below means the reports already inspected for this register; it does not authorize new source access. External/documentary evidence or archive/file inspection is a future requirement only after mentor authorization. No action below is authorized now.

| Candidate | Questions already answerable from existing documentation | Exact evidence still required (and whether external/authorized activity is needed) |
|---|---|---|
| **WELFake** | The parser-limit anomalies were artifacts; strict parsing yields 72,134 four-field records with labels `0: 35,028`, `1: 37,106`. Zenodo's stated mapping and reported class totals conflict. Raw values remain unchanged. Zenodo declares CC BY 4.0 as metadata. | **External primary evidence:** authoritative label mapping and explanation of 78,098-vs-72,134 entries. **Rights evidence:** applicable permissions for each upstream source/content and depositor authority, plus terms for local training, metrics, public model/results/examples and redistribution. **After mentor authorization:** corrected-parse quality, duplicate and leakage audit; no raw edits. |
| **ISOT** | Official README documents 44,898 records and Reuters-vs-flagged-outlet collection; no dataset-specific reuse grant or official split was found in reviewed pages. | **External rights evidence:** express dataset/content terms for research, training, public demonstration, derived metrics and redistribution, including upstream article rights. **After mentor authorization:** verify archive version/schema/counts and construct source/event/duplicate-aware evaluation. |
| **TaLLIP** | Repositories list English/Hindi train-test paths and request citation; MIT scope does not establish a dataset licence. Six/seven-domain and Hindi provenance questions are documented. IIT Patna HEAD attempt timed out; no archive was fetched. | **External primary evidence:** dataset-specific activity rights; source/annotation guidance; Hindi original/translated/mixed provenance; release/version relationship and domain reconciliation. **Archive access/content audit requires separate mentor authorization** for stable copy, counts/schema/labels/language/split/duplicates. |
| **Indic Zenodo Hindi** | Existing local audit and paper/record comparison establish the count, duplicate, short-file, language and licence discrepancies; archive-to-paper identity is unresolved. Zenodo CC BY and paper CC BY-NC claims conflict. | **External primary evidence:** exact archive-to-paper version/manifest, annotation instructions and processing artifacts explaining each discrepancy; resolve applicable dataset terms and rights to article/social/image content. **Any further archive/file inspection requires mentor authorization.** |
| **IFND** | Paper/repository report differing counts, research-purpose wording, label mapping, augmentation and statement/image fields. Language per row and full article bodies are not established. | **External/documentary evidence:** exact data version/count/schema, row-language specification, augmentation lineage and dataset-specific training/display/metrics/upstream rights terms. **File-level validation or overlap audit requires mentor authorization.** |
| **HinFakeNews** | Existing papers/project notes report scale/task but no publicly verifiable release. | A legitimate access route, exact version, annotation/provenance documentation and separate dataset/upstream rights terms. This may require external evidence and mentor-authorized contact/access; neither is authorized here. |
| **BFNK** | Existing research describes noisy social/mixed content and general task mismatch. | If reconsidered, evidence for a stable article-level Devanagari subset, label/provenance quality and dataset/upstream rights; any subset inspection requires mentor authorization. Otherwise no further MVP work is warranted. |
| **LIAR** | Claim-level six-class task and author-page distribution are documented; a secondary “research only” notice is not confirmed on the author archive. | Primary dataset-use terms, if ever considered for its distinct claim-level task; clarify whether training, public metrics/demo and redistribution are permitted. |
| **FakeNewsNet** | Dynamic hydration/crawling and reproducibility limitations are already documented. | Stable authorized full-text release and dataset-specific/upstream rights would be required to reconsider. Not a current priority. |
| **NELA-GT / Fakeddit** | Existing documentation establishes task mismatch (publisher-level labels; Reddit multimodal posts). | No evidence-gathering for current MVP recommended. Revisit only after a mentor-approved scope change; then assess their own rights and task requirements. |
| **MM-COVID / FakeCovid / CT-FAN** | Existing P01-D records task/count or terms evidence and current limitations. | For any separate research question, obtain exact-version dataset/upstream rights and clarify training, model-publication, excerpts and metric conditions. No new access/contact authorized. |

## 6. Dataset-selection approval gates

A candidate remains **not approved** unless all applicable gates pass independently for English or Hindi and the exact release:

1. **Scope and technical fit:** article-level text in the intended language/script, compatible with the product task and text-length requirements; stable format, counts and CPU-feasible scale.
2. **Label/provenance confidence:** exact label mapping and operational definitions, evidence/annotation process, source and version lineage, language/original-vs-translated status and known augmentation are documented. Conflicts are resolved by primary evidence, not inferred from class counts/style.
3. **Dataset-specific permission:** applicable terms are documented for private research and local training. The software or paper licence is not substituted for a data licence.
4. **Upstream-content rights:** evidence supports the depositor's authority and intended handling of included articles, images, social posts and other third-party material. A deposit declaration alone is not treated as proof.
5. **Public-output permission:** separately establish rights/terms for public portfolio demonstration of model/results, model artifacts, screenshots and any example excerpts. Check non-commercial, attribution, display, retention and model-output conditions.
6. **Evaluation integrity:** an authorized audit can establish language/content quality, duplicates, overlap, source/event/topic leakage and a defensible untouched/grouped evaluation split. Rights and task gates must precede archive access or processing.
7. **Mentor decision:** mentor explicitly approves the exact dataset version and allowed activities. Passing technical gates alone does not grant rights or project approval.

Keep separate English and Hindi preprocessing, training and evaluation tracks as the preferred MVP hypothesis. Each language dataset must pass the gates independently; do not merge incompatible labels or claim separate pipelines are empirically superior before evaluation.

## 7. Evidence priority and stop point

Recommended order for a later mentor-authorized evidence phase:

1. **WELFake:** primary label mapping and upstream rights.
2. **Indic Zenodo Hindi:** archive-to-paper provenance/quality discrepancies and CC BY vs. CC BY-NC/upstream rights.
3. **TaLLIP:** dataset-specific rights, release/archive identity and Hindi/English provenance/schema verification.
4. **ISOT:** explicit dataset and upstream reuse terms before any evaluation use.

This ordering is a research priority, **not a prediction or promise of approval**. Current candidate decisions remain unchanged: WELFake on hold; TaLLIP pending verification; Indic Hindi archive not approved/research lead; ISOT conditional only; IFND not approved as an independent test; all other dispositions as recorded above and in P01-D.

No dataset is approved or legally cleared for local training or public demonstration. This register authorizes **no** dataset download, archive access, author/provider contact, file inspection, external rights inquiry, raw-data change, training, dependency installation, P02 work or roadmap change.

**P01 remains OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL. STOP: awaiting mentor review.**

## Sources consolidated

- [Phase 1 summary](../phase-1-summary.md)
- [P01-E Final Dataset Feasibility Review](p01-e-final-dataset-feasibility-review.md)
- [P01-J Consolidated Provenance, Rights & Feasibility Research](p01-j-consolidated-provenance-rights-feasibility.md) — consolidated public-source findings; no candidate approval or status change.
- [P01-C Dataset Selection Strategy](p01-c-dataset-selection-strategy.md)
- [P01-D Rights-Cleared Dataset Discovery](p01-d-rights-cleared-dataset-discovery.md)
- [WELFake Label and CSV Integrity Investigation](welfake-label-integrity-investigation.md)
- [WELFake Archive Inspection](welfake-archive-inspection.md) — initial parser findings are superseded as stated at the top of that report.
- [Indic Zenodo Hindi Provenance Investigation](indic-zenodo-hindi-provenance-investigation.md)
- [Indic Zenodo Hindi Archive Inspection](indic-zenodo-hindi-archive-inspection.md)
