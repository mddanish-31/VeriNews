# Phase 1 Summary: Research and Technical Planning

## 1. Executive Overview

Phase 1 of **VeriNews** documentation has been audited and corrected, but it is **not approved** and important evidence remains unresolved:
1. Applied approved architectural decisions across Phase 0 documentation.
2. Conducted rigorous dataset research across English and Hindi corpora, distinguishing verified facts, paper-reported claims, and items requiring local inspection.
3. Formulated the Decoupled Dual-Pipeline architecture as a testable engineering hypothesis, acknowledging non-zero token overlap from shared numerals, punctuation, acronyms, and loanwords.
4. Compared classical baselines and optional transformers; TF-IDF + Logistic Regression is the proposed initial baseline, to compare with Linear SVM and Multinomial Naive Bayes.
5. Defined a comprehensive evaluation methodology including deduplication, leakage auditing, calibration evaluation (reliability diagrams, Brier score, ECE), and out-of-domain robustness.
6. Documented the full-stack technical architecture (Next.js App Router + React + TypeScript + Tailwind CSS frontend, FastAPI backend, `localStorage` MVP history, planned PostgreSQL persistent database).
7. Reviewed architecture decisions and documented unresolved evidence, privacy, language-routing and serving constraints.

---

## 2. Research Findings Summary

### 2.1 Candidate Dataset Audit

| Language | Primary Candidate Dataset | Record Status | Primary Provenance | License Status | Key Limitation & Audit Action |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **English** | **WELFake (on hold)** | Local strict parse: 72,134 records; Zenodo also says 78,098 entries, cause unresolved | Verma et al. (*IEEE TCSS* 2021) | Record/API declare CC BY 4.0; upstream rights remain unresolved | Raw label counts conflict with Zenodo's explicit mapping; no reversal. No verified paper/repo evidence resolves it. |
| **Hindi** | **TaLLIP** | [Second repository](https://github.com/amanifeunou/TaLLIP_Dataset) lists train/test `.txt` files; exact counts/content not inspected | De et al. (ACM TALLIP 2021), [DOI](https://doi.org/10.1145/3472619) | Arko98 code MIT; second repo no visible licence; dataset licence unverified | Five languages repository-reported; README six domains vs paper abstract seven; second repo tree lists seven domain-named files including Sports. Provenance/version needs inspection. |
| **Secondary candidate** | **IFND** | [Paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC8520332/) reports 56,868; [author repo](https://github.com/sonalgarg174/Dataset) includes `IFND.csv` (row count uninspected); 56,713 remains unexplained | Sharma & Garg (*Complex & Intell. Syst.*) | Paper CC BY is publication only; repo says research-purpose use; dataset redistribution licence unverified | Paper describes augmentation; labels `1=True, 0=Fake`. Row language, archive count/version, external-test suitability and rights unresolved. |

#### HinFakeNews:
Existing notes claim approximately 33,300 records and lack of a public download, but these claims were not independently verified during this audit (**PAPER-REPORTED / UNVERIFIED**). Do not treat the dataset as available or licensed without primary-source confirmation.

---

### 2.2 Dataset Compatibility & Pipeline Hypothesis

- **Token Overlap Reality**: Real-world English and Hindi news text exhibit non-zero token overlap due to Arabic numerals (`0–9`), shared punctuation, global Latin acronyms (`COVID-19`, `WHO`, `AI`), and borrowed English words.
- **The Dual-Pipeline Hypothesis**: Separate language pipelines are a plausible design for independent preprocessing/vocabulary, but superiority is untested; compare against a shared model.
- **Verification Plan**: In Phase 2, we will empirically compute the vocabulary intersection ratio and benchmark decoupled models against a unified TF-IDF baseline.

---

### 2.3 ML Architecture Comparison & Evaluation Protocol

| Architecture | Target Latency (Provisional) | Target Model Size (Provisional) | Explainability | Calibration Status | Role in VeriNews |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **TF-IDF + Logistic Regression** | Not measured | Not measured | Linear association; class-order dependent | Requires evaluation | Proposed initial baseline |
| **TF-IDF + Multinomial Naive Bayes** | Not measured | Not measured | Model-feature association | Requires evaluation | Comparison baseline |
| **TF-IDF + Linear SVM** | Not measured | Not measured | Linear association | Margin; calibrate if needed | Comparison baseline |
| **XLM-RoBERTa / IndicBERT** | Not measured | Not measured | More complex | Requires evaluation | Optional experiment only if justified |

#### Calibration & Truth Boundary:
- Logistic Regression optimizes log-loss but **does not guarantee calibrated probabilities** under finite samples, regularization shrinkage, or domain shift.
- In Phase 2, predicted probabilities will be evaluated using reliability curves, Brier scores, and Expected Calibration Error (ECE), applying Platt scaling if needed.
- Predicted probabilities reflect **statistical pattern correlation with training data**, and must **never be equated with factual truth**.

#### Generalization & Leakage Protocol:
- High accuracy on random splits often reflects memorization of temporal buzzwords or publisher formatting cues.
- Dataset preparation/modeling will execute deduplication, leakage review and grouped/domain evaluation. IFND is not an approved external set until provenance, licence and version are confirmed.

---

### 2.4 Proposed Full-Stack Technical Architecture (subject to approval)

- **Frontend**: Next.js App Router + React + TypeScript + Tailwind CSS. Streamlit is explicitly **not selected** as the production frontend.
- **Backend**: Python 3.10+ + FastAPI + Pydantic v2.
- **MVP History**: Browser `localStorage` (last 3–5 analyses; same-origin/XSS/shared-device risk; deletion required).
- **Persistent Database (Full App)**: PostgreSQL 15+ + SQLAlchemy 2.0 ORM + Alembic migrations.
- **Hardware Boundary**: Classical baseline intended to run CPU-first. <1.5 seconds, <1 GB RAM and <150 MB artifacts are provisional targets only; not measured.
- **Authentication**: Deferred to post-MVP release.

---

## 3. The Ponytail Ladder Compliance Audit

In accordance with the Ponytail workflow (*do the simplest thing that actually works; no unrequested abstractions*):

1. **Selected proposed stack**: React SPA + FastAPI are project decisions; implementation has not started.
2. **Skipped Premature Server Database & Auth**: Replaced with browser `localStorage` for the last 3–5 analyses. Avoids auth and ORM boilerplate before core ML signal is proven.
3. **Deferred transformer inference**: Proposed CPU-efficient Scikit-learn linear baselines with inspectable lexical associations, not factual explanations.
4. **Skipped Hinglish / Code-Mixed Processing**: Restricted to standard Devanagari script to avoid unstandardized phonetic spelling noise.
5. **No measured performance**: Latency, memory and artifact sizes remain provisional targets pending later measurement.

```
[Proposed Baseline: language-specific pipeline hypothesis + localStorage MVP]
  → skipped: Monolithic Streamlit, immediate server PostgreSQL/Auth, local 1GB+ transformers, Romanized Hinglish.
  → add only after human approval at the appropriate later phase and supporting evidence.
```

---

## 4. Documentation Deliverables Created & Audited

1. `docs/research/english-dataset-research.md` (Audited research on WELFake, ISOT, LIAR, FakeNewsNet).
2. `docs/research/hindi-dataset-research.md` (Audited research on TaLLIP, HinFakeNews, IFND, BFNK).
3. `docs/research/dataset-comparison.md` (Master matrix with new "Evidence Status" section).
4. `docs/research/dataset-compatibility.md` (Linguistic overlap analysis and dual-pipeline engineering hypothesis).
5. `docs/research/ml-model-comparison.md` (Architecture comparison and comprehensive evaluation methodology).
6. `docs/technical-architecture.md` (Full-stack architecture, API schemas, sequence diagrams, database design, error handling).
7. `docs/technology-decisions.md` (10 Architecture Decision Records reflecting audited candidate status).
8. `docs/phase-1-summary.md` (This summary document).
9. [`docs/research/p01-e-final-dataset-feasibility-review.md`](research/p01-e-final-dataset-feasibility-review.md) (Accepted P01-E research documentation deliverable; it does not select or approve a dataset or close P01).
10. [`docs/research/p01-j-consolidated-provenance-rights-feasibility.md`](research/p01-j-consolidated-provenance-rights-feasibility.md) (Consolidated public-source research on WELFake H-03, English/Hindi alternatives and rights; no dataset selected or approved; awaiting mentor review).

---

## 5. Phase 1 status and authoritative roadmap

**P01 status: OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL.** P01-E is accepted as a research documentation deliverable only; P01 is not closed. No dataset is approved for local training or public portfolio demonstration. Preserve the existing dataset decisions and the separate English/Hindi pipelines as the preferred MVP hypothesis, not an empirically validated result. ML implementation, dataset ingestion and P02 remain blocked pending the required evidence and explicit mentor approval. No dataset download, archive access, author contact or other external action is authorized by this status update.

Mentor approval is required before advancing. The canonical roadmap is:

P00 — Product Scope and Requirements
P01 — Research & Dataset Feasibility
P02 — Figma UI/UX Design
P03 — Frontend Foundation
P04 — Complete Frontend with Mock Data
P05 — Database Concepts and Design
P06 — Backend Foundation and API Contract
P07 — Backend + Database Integration
P08 — Python/ML Data Foundations and Dataset Preparation
P09 — NLP Preprocessing and Language Routing
P10 — Classical ML Training and Evaluation
P11 — Calibration, Explainability, Benchmarking and Model Artifacts
P12 — Optional Advanced Transformer Experiment
P13 — ML + FastAPI + Frontend Integration and Persistence
P14 — Testing, Security, Privacy and Performance
P15 — Deployment, Documentation and v1.0 Release

P02 is specifically Figma UI/UX. Do not skip, renumber or replace roadmap phases.

## 6. Remaining research and validation

Priority evidence gaps are: (1) WELFake label mapping and upstream rights; (2) Indic Zenodo archive-to-paper provenance, data quality and rights conflict; (3) TaLLIP rights and archive/release verification; and (4) ISOT dataset reuse terms. These are evidence priorities only: they do not authorize dataset downloads, archive access or author contact. IFND count/version/language/rights, dataset quality/leakage, actual language identification, preprocessing choices and all model metrics also remain unresolved or unmeasured. Accuracy alone is insufficient; use macro/per-class/weighted metrics as appropriate, confusion matrix and error analysis, language-wise and grouped/domain-held-out tests, calibration evaluation and untouched final test. Fit vectorizer on training data only. Raw text vs preprocessing variants must be compared experimentally. Explanations show learned lexical associations, not truth.

Serving: load model artifacts once at startup. Async does not make CPU inference non-blocking; use FastAPI sync/threadpool defaults initially and measure before adding process workers. localStorage is accessible to same-origin scripts and exposed to XSS/shared-device risks; provide deletion/retention controls and avoid sensitive content. It is separate from future PostgreSQL history/authentication.

### Status recommendation

**P01 remains OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL.** P01-E is accepted as documentation, but primary-source dataset discrepancies and rights remain unresolved. No dataset is approved for local training or public portfolio demonstration. ML implementation, dataset ingestion and P02 remain blocked; no P02 work starts until explicit mentor approval and next instruction.

English dataset decision is separately documented in [WELFake Label Resolution and English Alternatives](research/welfake-alternative-resolution.md): Recommendation C; WELFake remains on hold and neither ISOT nor LIAR is currently approved as a direct replacement.

The consolidated P01-J review also leaves H-03 unresolved, records AIKosh HinFakeNews and BSAkash as unverified identities, and recommends no dataset selection pending evidence and mentor review. See [P01-J](research/p01-j-consolidated-provenance-rights-feasibility.md) for detailed sources and permission limits.

Upon approval of Phase 1, Phase 2 will execute:
The next work item is not automatic. Follow the canonical roadmap only after explicit mentor approval. Data preparation, NLP, model training and evaluation belong to P08–P11; UI/UX design is P02.
