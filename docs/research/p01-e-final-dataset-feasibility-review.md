# VeriNews P01-E — Final Dataset Feasibility Review

**Review date:** 2026-11-07  
**Scope:** Consolidation of P01 dataset, provenance, rights, compatibility and model research. Documentation-only; no datasets downloaded, raw data modified, models trained, dependencies installed, authors contacted, roadmap changes made or P02 work started.  
**Decision:** **Continue research; pause ML implementation and dataset ingestion. Stop for mentor review.**

## 1. Executive decision

P01 has not identified a dataset that is simultaneously suitable for the English or Hindi article-level Fake/Real task, supported by adequate label/provenance evidence, and cleared for local training and public portfolio demonstration. **No training dataset is selected or approved.**

Keep the **separate English and Hindi pipelines** as the preferred MVP direction, not as an empirically proven architecture. Independent language data, labels, preprocessing and evaluation avoid assuming that language-specific labels and source artifacts are interchangeable. Compare this design with a shared representation only after suitable data is authorized and approved.

The distinction between feasibility dimensions is material:

- **Technically promising:** A dataset has a plausible text format/size/task fit for CPU baselines. This is not a rights or quality clearance.
- **Rights-cleared:** Applicable dataset-specific evidence supports the intended activity and relevant content rights. None is fully cleared for this project.
- **Suitable for local training:** Both rights and technical/label/provenance/evaluation gates are met. None currently qualifies.
- **Suitable for public portfolio demonstration:** Public display of a model/results and any example text is permitted, and the evaluation can be represented accurately. None currently qualifies.

An explicit licence declaration is evidence of what the depositor declares, not proof that they control all included third-party articles. Public access, repository-code licences and publication licences are not dataset-use grants.

## 2. Required-path inventory and evidence reviewed

The requested source reports were checked before drafting. The following required path is **missing**:

- `docs/research/phase-1-summary.md` — not present.
- The actual Phase 1 summary is `docs/phase-1-summary.md`; it was reviewed and is used as context below.

All other requested reports exist and were reviewed: `dataset-comparison.md`, `english-dataset-research.md`, `hindi-dataset-research.md`, `dataset-compatibility.md`, `ml-model-comparison.md`, `welfake-label-integrity-investigation.md`, `indic-zenodo-hindi-provenance-investigation.md`, `p01-c-dataset-selection-strategy.md`, and `p01-d-rights-cleared-dataset-discovery.md`.

This report consolidates rather than replaces those detailed source audits. Evidence distinctions (record metadata, paper-reported methods, repository statements, local structural audit, and inference) are preserved.

## 3. English candidates

| Candidate | Technical/task suitability | Label integrity and provenance | Rights status | Local training / public portfolio status | Disposition and next evidence action |
|---|---|---|---|---|---|
| **WELFake** | Strong article-text format and reported 72,134 rows; plausible CPU TF-IDF baseline. A 78,098-vs-72,134 record statement remains unexplained. | Corrected strict parse establishes 72,134 four-field records, raw labels `0: 35,028`, `1: 37,106`. This exactly matches reported class totals only under reversal, but Zenodo explicitly says `0=Fake, 1=Real`. Neither counts nor a small stylistic spot-check establish semantics. Aggregates Kaggle, McIntire, Reuters and BuzzFeed Political; source/topic/duplicate leakage still needs corrected-parse audit. | Zenodo record declares CC BY 4.0, but rights to upstream content and depositor authority remain unresolved. | **Local training: No, on hold. Public portfolio: No, not cleared.** Declaration is not upstream clearance; label conflict independently blocks use. | Preserve raw labels and on-hold decision. Seek primary label-mapping and 78,098-count evidence; establish upstream content permissions. Only after mentor authorization, recompute quality/duplicates/leakage on an authorized copy. See [label investigation](welfake-label-integrity-investigation.md) and [English research](english-dataset-research.md). |
| **ISOT** | English article text, UVic README reports 44,898 rows and two class/source files. CPU-feasible in principle, but not an unbiased gold-standard veracity set. | “Real” is Reuters-sourced and “Fake” from outlets described as unreliable/flagged. This creates substantial source/label and likely topic confounding; no official train/test split documented. | Official page offers download, but no dataset-specific reuse grant was found. Upstream article rights also unresolved. | **Local training: No. Public portfolio: No.** Download link does not establish training, metrics or display rights. | Obtain explicit rights covering local analysis/training, public demonstration and metrics; separately define a source-proxy task, verify schema, and design source/event/duplicate-grouped evaluation. Never present as general factual verification. See [P01-C](p01-c-dataset-selection-strategy.md). |
| **LIAR** | Small/CPU-feasible but consists of 12,836 short political claims with six PolitiFact ratings, not full articles. | Human fact-check verdict labels are semantically useful for claim verification, but converting six classes to binary is non-standard and loses information. | No author-page dataset licence verified; “research only” is a secondary-source lead, not confirmed primary permission. | **Local training: No for MVP. Public portfolio: No clearance; task mismatch.** | Keep as adjacent literature/benchmark only. If reconsidered, verify author-distribution terms and retain the six-class claim-level task rather than treating it as article data. |
| **FakeNewsNet** | Not a stable self-contained full-text corpus; relies on tweet hydration and crawling URLs, undermining reproducibility. | Binary source claims exist, but dynamic collection and missing/dead content make stable provenance and splits difficult. | No project-specific grant supporting this use was established in P01. | **Local training: No. Public portfolio: No.** | Excluded from the MVP shortlist. Reconsider only for a separately scoped, reproducible, rights-cleared research question. |

**English conclusion:** WELFake is the closest technical baseline lead but is blocked by label semantics and upstream rights. ISOT is a conditional source-proxy candidate, not an approved replacement. No English candidate is approved.

## 4. Hindi candidates

| Candidate | Technical/task suitability | Label integrity and provenance | Rights status | Local training / public portfolio status | Disposition and next evidence action |
|---|---|---|---|---|---|
| **TaLLIP Hindi** | Closest reported article-level Hindi candidate; repositories list Hindi train/test text files. Counts, schema, text completeness and Devanagari quality are not established. Could be CPU-feasible if scale is moderate. | Binary Fake/Real is reported, but label definitions, annotation/adjudication, Hindi sources and train/test construction are not documented in reviewed materials. Whether Hindi is original, translated or mixed is unknown. README lists six domains while paper abstract says seven; source/version equivalence is unresolved. | No dataset-specific grant found. MIT licence covers repository “Software” as stated, not demonstrated dataset contents. | **Local training: No, pending both technical evidence and rights. Public portfolio: No.** | Preserve pending-verification status. First obtain dataset-specific terms for training, metrics, public demo and redistribution; then, only if authorized, verify release identity, Hindi counts/schema/labels/provenance, translation status, domains and split/duplicate leakage. See [P01-C](p01-c-dataset-selection-strategy.md) and [Hindi research](hindi-dataset-research.md). |
| **Zenodo Indic-language Hindi archive** | Record describes Hindi Fake/Real news articles; local archive audit gives usable Hindi text files, but record-to-paper identity and task suitability remain uncertain. CPU baseline may be feasible. | Material inconsistencies: 20,593 local text files vs. paper-reported 20,493; 5,493 exact duplicate excess despite paper deduplication description; two very short files vs. reported 50-token minimum; four languages in deposit vs. five in paper; internal language-statistics discrepancies. Paper reports annotation procedures, but they are not independently tied to the deposited archive. | Zenodo declares CC BY 4.0; 2025 paper states CC BY-NC 4.0. Underlying news/social-media content rights are not verified. | **Local training: No. Public portfolio: No.** Conflicting terms and unresolved artifact identity/quality prevent approval. | Preserve not-approved/research-lead decision. Resolve exact version and CC BY vs. CC BY-NC terms; establish third-party content rights; obtain manifest, annotation instructions and reproducible processing details explaining all count/duplicate/length/language discrepancies. See [provenance investigation](indic-zenodo-hindi-provenance-investigation.md). |
| **IFND** | CSV is listed and labels are repository-reported as `1=True`, `0=Fake`; available fields are statement/title, image URL and metadata, not confirmed full article bodies. Potentially CPU-feasible, but target fit is weak. | Paper reports 56,868 while prior notes cite 56,713; repository row count and per-row language are unverified. Paper describes synthetic fake-text augmentation; source/augmentation and overlap can invalidate independent evaluation. | README says research purposes only; no formal dataset licence. Paper CC BY 4.0 applies to the paper, not automatically the data. | **Local training: Not approved; research-purpose statement is not a complete training grant. Public portfolio: No.** | Keep supplementary/research-only. Establish exact version/count, fields and language, augmentation lineage, overlap, and dataset-specific rights separately for training, display and metric publication. Do not use as independent test data until verified. |
| **HinFakeNews / LFWE** | Paper-reported ~33,300 Hindi article examples and binary plus topical labels; potentially strong format/task fit if obtainable. | Counts and annotation are paper-reported; no public archive was found to verify labels, sources, splits or quality. | Direct public release and dataset licence not established; described in project notes as restricted/unreleased. | **Local training: No access/rights. Public portfolio: No.** | Do not contact authors under current task restrictions. A future mentor-authorized evidence review would first need a legitimate access route and express terms; until then retain as unavailable research reference. |
| **BharatFakeNewsKosh (BFNK)** | Reported ~26,000 multilingual records, but predominantly social posts/forwards and code-mixed content rather than clean Devanagari articles. | Counts/labels are paper-reported; high noise and mixed content are documented risks. | Dataset-specific permission was not established in P01. | **Local training: No for MVP. Public portfolio: No clearance and task mismatch.** | Exclude from baseline. Reconsider only if the product scope changes and rights plus article-level Hindi subset are independently evidenced. |

**Hindi conclusion:** TaLLIP is the closest-scope lead, not cleared. The Indic archive has more local evidence but fails current provenance and rights gates. No Hindi dataset is approved.

## 5. Multilingual and adjacent candidates

- **MM-COVID:** English and Hindi are reported, but data mix fact-check/news/social content, reported total (11,173) conflicts with language-table sum (11,565), rights are unknown, and the domain is COVID-specific. Not an MVP training set; keep as research-only.
- **FakeCovid:** 40 languages including Hindi are reported, but per-language counts and a clean binary article target are unverified. Project page says CC BY-NC 4.0 for research; Zenodo says CC BY 4.0; repository shows CC0. Treat the terms as conflicting, not as clearance. Not an MVP set.
- **CT-FAN:** English/German, four-way truth ratings and explicit research-only/no-redistribution terms. Its restrictions do not clearly authorize model training or a public model demonstration; it is not a Hindi or binary MVP corpus.
- **NELA-GT:** English article text, but publisher reliability labels are transferred to articles. This is a different, source-linked target; not a Fake/Real article dataset.
- **Fakeddit:** English Reddit social posts, multimodal and distant-supervised. Not publisher article text; project guidelines and rights remain relevant. Not an MVP fit.

No multilingual resource is verified as a parallel English–Hindi corpus. Do not infer translation/alignment from a multilingual label or language list.

## 6. Minimum acceptance criteria before any dataset selection

### Required for each language independently

1. **Scope and format:** documented English or Hindi (Devanagari) article/paragraph text suitable for the MVP’s 100–5,000 character input boundary; task unit must match the intended article-level prediction. Claims, posts, publisher ratings and mixed fact-check records do not qualify without an explicitly revised task.
2. **Stable provenance:** identifiable dataset version, source/collection procedure and per-language record counts; establish whether content is original, translated, syndicated, augmented or mixed. A reproducible source manifest or equivalent evidence is required where available.
3. **Operational label semantics:** exact label mapping and definitions, evidence standard, annotation/label-generation method, adjudication and known limitations must be documented. Preserve source labels; never infer or reverse a mapping from class totals or writing style.
4. **Integrity and suitability audit:** after explicit authorization and under a mentor-approved workflow, verify file/schema, encoding, language/script, missing/short text, class distribution, exact and near duplicates, source/event/topic/date associations, and split overlap. Do not modify the raw source. Any derived working copy must be explicitly authorized and traceable.
5. **Rights evidence:** dataset-specific terms must support the intended private research and local model training. For a public portfolio, terms must also support public display of results/model and any example text or screenshots used. Derived metrics/publication and raw-data redistribution must be checked separately. Record attribution, non-commercial, share-alike, display, retention and model-output restrictions. Upstream third-party content rights must not be assumed from a depositor’s declaration.
6. **Evaluation readiness:** an untouched final test partition or a defensible grouped/temporal/domain-held-out evaluation design must be possible. Remove or group duplicates before partitioning; prevent publisher, event, template, translation and augmentation leakage. Explain the target as dataset-label prediction, not truth verification.
7. **Mentor approval:** select the dataset/version, exact use scope and next phase only after mentor review of evidence. No report here grants that approval.

### Cross-language acceptance

Maintain separate English and Hindi dataset/model/preprocessing/evaluation tracks as the MVP default. Require each language to pass the criteria above independently; do not pool incompatible labels or scales. Validate language identification separately; script detection alone is not language identification. Hinglish, mixed and unsupported input should remain unhandled or be rejected/clarified until policy is validated.

## 7. What may proceed and what remains blocked

### Can proceed without selecting data

- Documentation and mentor review of the evidence already collected.
- Requirements clarification and design notes for a separate-language architecture, including the boundary that a model estimates corpus-label patterns and does not independently verify facts.
- Non-data-dependent planning for evaluation metrics, leakage controls, calibration and CPU baseline comparisons. TF-IDF + Logistic Regression remains a **proposed** initial baseline, with Linear SVM and Multinomial Naive Bayes as comparisons; no measured performance is claimed.
- Planning the future authorization gates and evidence checklist. No actual dataset ingestion or empirical vocabulary comparison is implied.

### Must remain blocked

- Dataset selection/approval, downloading or fetching candidate archives, extraction, raw-data modification or new preprocessing/derived corpora.
- Supervised model training, calibration, performance claims, model artifacts and public prediction/demo claims.
- Any claim that a candidate is rights-cleared or suitable for public demonstration.
- Dataset-dependent language routing thresholds, learned explanations or confidence claims.
- P02 Figma or other roadmap advancement until explicit mentor direction. The P00–P15 roadmap is unchanged.

## 8. Candidate-specific next evidence actions

Actions below are recommendations for a later mentor-authorized phase. **No author contact or dataset access is authorized by this report.**

| Candidate | Next evidence action |
|---|---|
| WELFake | Locate primary label-map evidence and reconcile the 78,098 statement with the 72,134 strict records; document upstream licences/permissions for all aggregated sources. Preserve labels as-is. |
| ISOT | Obtain explicit rights terms for local training, public portfolio, derived metrics and redistribution; only then define a source-proxy evaluation and plan source/event/duplicate-held-out splits. |
| TaLLIP | Establish dataset-specific permissions and exact release identity; then verify Hindi/English counts, labels, provenance/translation status, domain inventory, schema and split leakage. |
| Indic Zenodo Hindi | Resolve CC BY/CC BY-NC conflict and archive-to-paper identity; obtain source/annotation manifest and explanations for count, duplicate, length and language discrepancies, plus underlying content rights. |
| IFND | Confirm permitted training/display/metrics scope; reconcile counts and exact CSV version; establish row language, article-body availability, augmentation lineage and overlap before any evaluation role. |
| HinFakeNews | Treat as unavailable until a legitimate dataset access route, terms and primary documentation are evidenced; no contact in this phase. |
| BFNK | Exclude from MVP unless a compliant article-level Devanagari subset and dataset-specific rights are established. |
| MM-COVID | Obtain explicit data-use terms and reconcile counts, item types and language labels; only consider for a separate COVID misinformation study. |
| FakeCovid | Reconcile project, Zenodo and repository terms for the exact release and third-party content; verify Hindi counts and target mapping. |
| CT-FAN | Clarify whether local model training and model-only public demonstration are allowed under its restrictions; otherwise retain for non-reconstructive research summaries only. |
| LIAR | Verify author-distribution terms; retain six-class claim-verification scope and do not substitute it for article training. |
| FakeNewsNet | Establish stable, authorized full-text access and reproducible versioning before reconsideration; otherwise keep excluded. |
| NELA-GT / Fakeddit | No next action for current MVP: task mismatch. Revisit only if the product target changes, then audit rights and task-specific guidelines. |

## 9. Model and evaluation implications

If and only if a dataset passes acceptance and mentor gates, the existing CPU-first research plan remains reasonable: compare TF-IDF + Logistic Regression, Multinomial Naive Bayes and Linear SVM in separate language tracks. Their CPU suitability and projected size/latency are engineering expectations, not measured results. XLM-RoBERTa/IndicBERT remains optional and deferred unless classical baselines justify the added compute and complexity.

Use macro/per-class metrics, confusion matrices and error analysis; group duplicates/source/events when metadata allows, keep the final test untouched, and fit vectorizers only on training data. Evaluate probability calibration before presenting scores as confidence. Neither a high random-split score nor a model probability is evidence that a story is true.

## 10. Final recommendation and stop point

**Decision: Continue research; pause ML implementation.** No dataset meets the current combined evidence bar, and no evidence supports clearing any candidate for both local training and public portfolio demonstration. Preserve the existing decisions: WELFake on hold; TaLLIP pending verification; ISOT conditional only; Indic Hindi archive not approved; IFND not approved as an independent test; no final training dataset selected. Preserve separate-language pipelines as the preferred, testable MVP hypothesis.

The next step is mentor review of the candidate-specific evidence actions and authorization boundaries. Do not download data, modify raw data, contact authors, train models, change the roadmap, begin P02, or automatically advance.

**STOP: awaiting mentor review.**

## Sources consolidated

- [Dataset comparison](dataset-comparison.md)
- [English dataset research](english-dataset-research.md)
- [Hindi dataset research](hindi-dataset-research.md)
- [Dataset compatibility](dataset-compatibility.md)
- [ML model comparison](ml-model-comparison.md)
- [WELFake label integrity investigation](welfake-label-integrity-investigation.md)
- [Indic Hindi provenance investigation](indic-zenodo-hindi-provenance-investigation.md)
- [P01-C dataset selection strategy](p01-c-dataset-selection-strategy.md)
- [P01-D rights-cleared dataset discovery](p01-d-rights-cleared-dataset-discovery.md)
- [P01-J consolidated provenance, rights & feasibility research](p01-j-consolidated-provenance-rights-feasibility.md) — later consolidated public-source review; P01 remains open and no dataset is approved.
- Actual Phase 1 summary: [`docs/phase-1-summary.md`](../phase-1-summary.md) — the requested `docs/research/phase-1-summary.md` path does not exist.
