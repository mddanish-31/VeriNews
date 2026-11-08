# Architecture Decision Records (ADRs): VeriNews

This document records the foundational architectural decisions made for VeriNews, detailing context, alternatives considered, decision rationales, and consequences.

---

## ADR-01: Frontend Framework — Next.js App Router + React + TypeScript + Tailwind CSS

- **Status**: Approved
- **Context**: 
  We need a modern, responsive, and maintainable user interface for submitting news text, viewing credibility metrics, rendering token-level explainability badges, and browsing recent analyses.
- **Alternatives Evaluated**:
  1. *Streamlit*: Rapid to write in pure Python, but monolithic, tightly couples UI state to server execution, lacks standard REST API separation, and provides poor portfolio representation for modern software engineering.
  2. *Vanilla HTML/CSS/JavaScript*: Minimal dependencies, but difficult to maintain component state, type safety, and structured UI components as the application grows.
  3. *Next.js App Router + React + TypeScript + Tailwind CSS*: Type-safe React application with file-based routing and an integrated production build system.
- **Decision**: 
  Adopt **Next.js App Router + React + TypeScript + Tailwind CSS**. Streamlit is explicitly **not selected** as the production frontend.
- **Consequences**:
  - Requires maintaining separate client (`frontend/`) and backend (`src/verinews/`) codebases.
  - Grants complete UI flexibility, accessible styling via Tailwind, type-safe API consumption, and modular component reusability.

---

## ADR-02: Backend Framework — Python + FastAPI + Pydantic

- **Status**: Approved
- **Context**: 
  The backend must serve prediction endpoints, execute language routing, run Scikit-learn inference pipelines, and serialize JSON results with minimal latency.
- **Alternatives Evaluated**:
  1. *Flask*: Simple, but synchronous by default, requires manual request parsing, lacks native OpenAPI documentation, and lacks built-in Pydantic type validation.
  2. *Django / Django REST Framework*: Overly heavy and opinionated; bundles an ORM and admin site unnecessary for an initial ML inference microservice.
  3. *FastAPI*: High-performance asynchronous framework, automatic OpenAPI documentation, native Pydantic v2 data validation, and clean dependency injection.
- **Decision**: 
  Adopt **Python 3.10+ with FastAPI and Pydantic v2**.
- **Consequences**:
  - Provides instant interactive API documentation (`/docs`).
  - Strict compile-time and runtime validation of input payloads.
  - Async supports concurrency for I/O; it does not make CPU-bound model inference non-blocking. Ordinary synchronous FastAPI path operations run in a threadpool; worker/process strategy must follow measurement.

---

## ADR-03: Baseline ML Architecture — Scikit-Learn (TF-IDF + Logistic Regression)

- **Status**: Proposed Baseline Candidate (To be empirically benchmarked in Phase 2)
- **Context**: 
  We need an accurate, CPU-compatible, lightweight, and explainable baseline model for classifying news text as credible vs. unreliable.
- **Alternatives Evaluated**:
  1. *Pretrained Transformer (BERT / RoBERTa)*: Deep contextual understanding, but heavy model weights (> 1 GB), slow CPU inference latency (> 1.5s), and opaque "black box" explainability requiring expensive gradient methods.
   2. *Multinomial Naive Bayes*: Fast and CPU-friendly, but its independence assumption is unrealistic for text; calibration must be measured.
  3. *TF-IDF + Linear SVM*: Strong classification margins, but requires Platt scaling to produce probabilities.
   4. *TF-IDF + Logistic Regression*: CPU-friendly sparse baseline, inspectable linear coefficients, and a probability interface that still requires calibration evaluation.
- **Decision**: 
  Adopt **TF-IDF + Logistic Regression as the Proposed Baseline Candidate**, subject to empirical benchmarking against Linear SVM and Naive Bayes in Phase 2.
- **Consequences**:
  - Eliminates GPU requirements for the primary application.
  - Requires empirical probability calibration validation (reliability curves, Brier score, ECE) before exposing confidence scores to users.
  - Predicted probabilities reflect statistical linguistic correlation with training data, never empirical factual truth.
  - Serves as the reference benchmark against which any future complex neural models must be judged.

---

## ADR-04: Language Pipeline Decoupling — Dual Language Pipelines

- **Status**: Working Engineering Hypothesis (To be verified in Phase 2)
- **Context**: 
  VeriNews must support English and Hindi. While English and Hindi share non-zero token overlap (digits, punctuation, global acronyms like `COVID-19`, loanwords), their core vocabularies are predominantly script-distinct (Basic Latin vs. Devanagari).
- **Alternatives Evaluated**:
  1. *Merged Single Bag-of-Words*: Pools disjoint majority vocabularies into a single sparse matrix where the large English corpus (70k+) risks dominating regularization penalties over smaller Hindi corpora. Preprocessing conflicts emerge between English stopword filtering and Devanagari Unicode NFC/danda normalization.
  2. *Dual Decoupled Pipelines*: Language Router directs input to language-specific preprocessing, vectorizer, and model.
- **Decision**: 
  Adopt the **Decoupled Dual-Pipeline Architecture as an engineering hypothesis** to be tested and benchmarked against unified alternatives during Phase 2 modeling.
- **Consequences**:
  - Independent vocabulary tuning, stopword removal, and regularization.
  - Phase 2 will empirically measure vocabulary intersection and cross-lingual performance under both unified and decoupled configurations.
  - Clean modular architecture in `src/verinews/nlp/english.py` and `src/verinews/nlp/hindi.py`.

---

## ADR-05: MVP State & History Strategy — Browser `localStorage`

- **Status**: Approved
- **Context**: 
  Users need to review recent credibility analyses (last 3–5 items) without creating accounts or introducing heavy database management in the initial release.
- **Alternatives Evaluated**:
  1. *Immediate SQLite / Server DB*: Requires writing schema migrations, managing disk files, and tracking guest session IDs on the server.
  2. *Browser `localStorage`*: Client-side key-value storage managed natively by React.
- **Decision**: 
  Use **Browser `localStorage`** for the initial MVP to store the last 3–5 analyses.
- **Consequences**:
  - Zero server database setup required for MVP 1.0.
  - Not fully private or secure: same-origin JavaScript can access storage, XSS can expose it, and shared-device users may see history. Provide clear deletion and retention controls; avoid storing sensitive inputs. This is distinct from any future server-side history.
  - Instant client-side persistence that survives page reloads.

---

## ADR-06: Production Database Strategy — PostgreSQL + SQLAlchemy + Alembic

- **Status**: Approved
- **Context**: 
  For the planned full application, persistent multi-user storage, analysis archiving, and feedback collection will be required.
- **Alternatives Evaluated**:
  1. *MongoDB / NoSQL*: Flexible, but lacks ACID guarantees and structured relational modeling for relational feedback logs.
  2. *SQLite*: Lightweight, but lacks concurrent write capabilities in production web deployments.
  3. *PostgreSQL + SQLAlchemy + Alembic*: Industry-standard relational database with enterprise reliability, ACID compliance, and robust migration tooling.
- **Decision**: 
  Plan **PostgreSQL with SQLAlchemy 2.0 ORM and Alembic migrations** for the full application.
- **Consequences**:
  - Clear upgrade path from stateless MVP to production-grade persistent application.
  - Preserves clean boundaries: core ML logic remains 100% isolated from database schemas.

---

## ADR-07: Linguistic Scope — English & Hindi (Devanagari Only); Hinglish Excluded

- **Status**: Approved
- **Context**: 
  Digital media in India contains standard English, standard Hindi (Devanagari script), and informal romanized "Hinglish" (Hindi phonetically written in Latin script).
- **Alternatives Evaluated**:
  1. *Include Hinglish*: Romanized Hindi lacks standardized spelling (e.g., *"kya"* vs *"kyaa"*), has high out-of-vocabulary rates, and lacks clean, verified academic corpora.
  2. *Devanagari Hindi support*: Hindi in Devanagari is the product target. TaLLIP is only a candidate pending file and data-rights validation; IFND's per-row language coverage is unverified and does not establish Hindi dataset availability.
- **Decision**: 
  Restrict initial release to **English and Hindi written in Devanagari script**. Romanized Hindi / Hinglish is explicitly out of scope for the MVP.
- **Consequences**:
  - Script detection is only a routing signal, not language identification. Devanagari is not uniquely Hindi; Latin is not necessarily English. Hinglish/mixed/unsupported text must not be silently treated as English; routing requires validation.
  - High preprocessing precision and clean stopword filtering.

---

## ADR-08: Authentication Strategy — Deferred to Later Release

- **Status**: Approved
- **Context**: 
  Evaluating whether to implement user registration, login, JWT tokens, and password hashing in the initial release.
- **Decision**: 
  **Defer authentication to a post-MVP release.**
- **Consequences**:
  - Eliminates substantial security, token management, and auth boilerplate during early ML evaluation.
  - Keeps initial development focused on classification accuracy, explainability, and user experience.

---

## ADR-09: Local Hardware & Performance Boundaries

- **Status**: Approved
- **Context**: 
  The platform must be developed and executed on standard consumer CPU hardware without dedicated GPUs.
- **Decision**: 
  Mandate **100% CPU compatibility** for all application components and Scikit-learn pipelines. All stated performance limits (e.g., `< 1.5s` latency) are recognized as **provisional engineering targets**, not guaranteed specifications.
- **Consequences**:
  - Deep learning training is restricted to free cloud environments (Colab/Kaggle).
  - Runtime memory stays well below 200 MB, enabling seamless local execution on any modern laptop.

---

## ADR-10: Candidate Dataset Selection — WELFake (EN) and TaLLIP (HI)

- **Status**: Proposed Candidates (Subject to Phase 2 file audit and licence confirmation)
- **Context**: 
  Selecting verified, peer-reviewed candidate training datasets for English and Hindi fake news classification.
- **Decision**: 
  Recommend **WELFake** (Zenodo DOI `10.5281/zenodo.4561253`) for English and **TaLLIP (`Arko98`)** for Hindi as candidate corpora only, contingent on file, rights and quality review. IFND is an unresolved possible secondary dataset, not an approved testbed.
- **Consequences**: 
  - Upstream licence terms across WELFake's 4 constituent sources and TaLLIP's IIT Patna archive must be inspected upon download.
  - Candidate use is not approved until access, licence/rights and quality are audited; deduplicate and audit source/topic leakage before establishing splits and training.

## Audit correction: serving, privacy and evidence (2026-11-06)

- Inference artifacts load once at application startup; never load/train per request. CPU inference inside an `async` handler can block the event loop. Prefer ordinary sync endpoint/threadpool behavior initially, then profile; consider process workers only if measurements justify them. Worker processes can multiply model memory. Deployment/resource choices are deferred until measurement.
- Browser localStorage is readable by same-origin scripts, vulnerable to XSS exposure, persists across reloads and can be visible on shared devices. Provide delete/clear, retention limits (3–5 entries), and avoid storing sensitive text. It is not PostgreSQL/server history. Authentication remains out of MVP.
- Scores are not actual truth probabilities. No confidence threshold, benchmark or model result is approved before evaluation/calibration.
- Logistic Regression coefficient sign points toward `classes_[1]`. For WELFake mapping `[0=Fake,1=Real]`, positive means toward Real; inspect class order whenever encoding differs. A coefficient is lexical association, not fact evidence.
- Dataset evidence update (accessed 2026-11-06): Zenodo API explicitly declares CC BY 4.0 for WELFake (`license.id=cc-by-4.0`), but upstream rights remain unresolved. IFND paper reports 56,868, describes synthetic fake augmentation and has an author repository CSV; prior 56,713 remains unexplained. Repository README states research-purpose use only; this is not an unrestricted redistribution licence. TaLLIP second repository lists English/Hindi train/test `.txt` files and seven domain-named file categories, while README lists six and paper abstract seven; dataset licence is unverified.

### Authoritative roadmap

P00 Product Scope and Requirements → P01 Research & Dataset Feasibility → P02 Figma UI/UX Design → P03 Frontend Foundation → P04 Complete Frontend with Mock Data → P05 Database Concepts and Design → P06 Backend Foundation and API Contract → P07 Backend + Database Integration → P08 Python/ML Data Foundations and Dataset Preparation → P09 NLP Preprocessing and Language Routing → P10 Classical ML Training and Evaluation → P11 Calibration, Explainability, Benchmarking and Model Artifacts → P12 Optional Advanced Transformer Experiment → P13 ML + FastAPI + Frontend Integration and Persistence → P14 Testing, Security, Privacy and Performance → P15 Deployment, Documentation and v1.0 Release.
