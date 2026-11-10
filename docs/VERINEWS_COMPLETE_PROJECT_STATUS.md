# VeriNews — Complete Project Progress & Workflow Synchronization Report
**Comprehensive Historical Journey, Architectural Audit, and System Status (Phase P00 through Phase P15)**

- **Document Version**: 1.0.0
- **Audited Date**: 2026-11-10
- **Lifecycle Mode**: Development
- **Release Status**: **Pending Mentor Review** (NOT authorized for public release or production deployment)
- **Repository Root**: `C:\Users\mddan\Desktop\VeriNews`

---

## 1. Executive Project Summary

VeriNews is an experimental, research-oriented multilingual Natural Language Processing (NLP) and Machine Learning (ML) system designed to detect stylistic, linguistic, and lexical patterns in short news text and headlines (20–500 characters). Developed as a rigorous, solo, resume-caliber software engineering and applied ML project, VeriNews emphasizes **probabilistic calibration, local explainability, privacy-preserving zero-retention architecture, and strict scientific boundaries**.

The platform explicitly rejects the premise that machine learning models can serve as automated arbiters of objective factual truth. Instead, it frames fake-news analysis as **stylistic pattern detection**, surfacing linguistic signals (e.g. sensationalism, manufactured urgency, lexical attribution) alongside non-dismissible Responsible AI disclaimers directing users to credentialed fact-checking organizations.

As of November 10, 2026, **Phase P15 (Reliability Improvements, Error Hardening, and Browser-Level E2E Verification)** has completed technical implementation and verification. All 102 backend tests pass, frontend static typecheck and production build pass with zero errors, 9/9 API regression checks pass, 5/5 Hindi smoke tests pass, and an automated 12-scenario Browser E2E suite passes with exit code 0 and 13 verified visual screenshots.

However, the project remains in **Development Mode** and is formally **Pending Mentor Review**. Public model inference flags remain disabled by default (`ENABLE_ENGLISH_INFERENCE = false`, `ENABLE_HINDI_INFERENCE = false`). Hindi inference is strictly gated behind HTTP 503 because dataset licensing and redistribution rights for Hindi training corpora remain unresolved in Phase P01.

---

## 2. Project Objectives, Scope, and Non-Goals

### 2.1 Project Objectives
1. **Multilingual NLP Scope**: Evaluate short news headlines across **English (Latin script)** and **Hindi (Devanagari script)**, with active detection and rejection of unsupported Romanized Hindi (Hinglish).
2. **Calibrated Uncertainty**: Transform uncalibrated linear decision boundaries into reliable posterior probabilities using Platt sigmoid scaling (`CalibratedClassifierCV`) to prevent overconfident hallucinations.
3. **Transparent Explainability**: Deliver in-memory, feature-level token contributions ($w_i \cdot \text{TF-IDF}_i$) without retaining user-submitted text on disk or in persistent databases.
4. **Zero Content Retention**: Enforce a strict data-minimization architecture where news headlines, article tokens, and deterministic hashes are never written to database tables or application server logs.
5. **Production Engineering Quality**: Build a clean, decoupled full-stack architecture combining a Next.js 16 (React 19, Turbopack, Tailwind CSS) frontend and a FastAPI (Python 3.14, Pydantic v2, Uvicorn) backend.

### 2.2 System Boundaries & Input Domain
- **Input Domain**: Short news headlines and claim statements strictly between **20 and 500 characters** containing alphanumeric tokens.
- **Out-of-Domain Guard**: Text containing zero vocabulary tokens matching the trained vectorizer is flagged as `Unclassifiable / Out of Domain` without evaluating the classifier intercept.
- **Language Scope**: English in Latin script; Hindi in Devanagari script. Romanized Hindi (Hinglish) is rejected via HTTP 422.

### 2.3 Explicit Non-Goals
- **No Factual Arbiter**: VeriNews does not verify physical events, check external databases, query search engines, or determine whether an underlying historical or civic claim is empirically true.
- **No Long-Form Ingestion**: Full-length articles (>500 characters) are disallowed to prevent domain shift from headline training distributions.
- **No Persistent Content Logging**: The system never archives submitted user text for retraining or surveillance.

---

## 3. Complete Historical Project Timeline (P00 through P15)

```
[ P00: Product Scope & Requirements ] (Completed)
         │
[ P01: Research & Dataset Feasibility ] (In Progress / Blocked on Licensing)
         │
[ P02: UI/UX Design System ] (Completed / Design-Locked)
         │
[ P03: Frontend Foundation (Next.js 16) ] (Completed)
         │
[ P04: Frontend Preview with Mock Data ] (Completed)
         │
[ P05: Database Design & Zero-Retention Schema ] (Completed)
         │
[ P06: Backend Foundation & API Contract ] (Completed)
         │
[ P07: Backend Database Integration (SQLAlchemy/PostgreSQL) ] (Completed)
         │
[ P08: Dataset Preparation & ML Data Foundations ] (Completed)
         │
[ P09: NLP Preprocessing & Language Routing ] (Incorporated / Completed in P10/P13)
         │
[ P10: Classical ML Training & Leakage Investigation ] (Completed)
         │
[ P11: Calibration, Explainability & Benchmarking ] (Completed)
         │
[ P12: Optional Transformer Experiment ] (Not Started / Deferred)
         │
[ P13: ML, FastAPI & Frontend Integration ] (Completed)
         │
[ P14: Testing, Security, Privacy & Hardening ] (Completed)
         │
[ P15: Reliability Hardening & Browser E2E Verification ] (Completed / Pending Mentor Review)
```

### Chronological Milestones
- **2026-11-08**: Project foundation initialized with canonical roadmap P00–P15. Project tracker established with strict audit rules.
- **2026-11-08 (P00–P04)**: Product scope defined (`docs/project-scope.md`). UI/UX design locked. Next.js 16 frontend foundation and interactive mock-data preview verified with responsive layouts and dark mode.
- **2026-11-08 (P05–P07)**: PostgreSQL database schema engineered (`backend/app/db/models.py`). Strict Zero Content Retention enforced by omitting article text, tokens, and hashes from `Analysis` entity. FastAPI backend skeleton created with `/api/health` and `/api/predict`.
- **2026-11-08 to 2026-11-09 (P01 Dataset Audits)**: Comprehensive audits of WELFake, Indic Zenodo, IFND, and TaLLIP datasets. WELFake discovered to have inverse label mapping discrepancies. Indic Zenodo discovered to have paper-to-archive discrepancies and NC-SA license conflicts. IFND selected as English headline candidate; TaLLIP selected as Hindi candidate. Formal training/redistribution approval blocked pending mentor review.
- **2026-11-09 (P08 & P10)**: ML data schemas, safe readers, and validators implemented (`ml/readers.py`, `ml/validation.py`). Hardened classical baselines trained. Publisher token leakage identified and analyzed in IFND (`docs/research/p10-p11-model-hardening-and-leakage-investigation-report.md`).
- **2026-11-09 (P11)**: Platt sigmoid probability calibration implemented (`ml/calibration.py`). In-memory `TFIDFExplainer` built with signed feature weights and Responsible AI disclaimers (`ml/explainability.py`).
- **2026-11-09 (P13 & P14)**: FastAPI service wired to calibrated model artifacts (`backend/app/services/model_service.py`). Independent English and Hindi activation gates established. Input domain bounded to 20–500 characters. In-memory rate limiting and 64 KB payload limits enforced.
- **2026-11-10 (P15 Implementation)**: Controlled resolution of 7 reliability bugs: zero-vocabulary intercept hallucination guard, Romanized Hindi (Hinglish) rejection, post-hoc stop-word explanation filtering, frontend request race-condition protection via `latestRequestId`, atomic Clear button reset, strict Hindi 503 gating, and user-facing error message sanitization.
- **2026-11-10 (P15 E2E & Review)**: Automated 12-scenario Browser E2E suite executed via Chrome DevTools Protocol (`scripts/verify_e2e_full_browser.mjs`, exit code 0). Scroll centering implemented; all 13 screenshots visually audited and confirmed non-empty. Master mentor review package compiled (`docs/P15_MENTOR_REVIEW.md`, v1.1.0 Audited & Qualified).

---

## 4. Phase-Wise Progress & Detailed Status Classification

| Phase ID | Canonical Phase Title | Status Classification | Primary Artifacts & Deliverables | Verification Level | Blockers & Next Dependencies |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **P00** | Product Scope and Requirements | **Completed and Verified** | `docs/project-scope.md`<br>`docs/functional-requirements.md`<br>`docs/non-functional-requirements.md` | Verified against documentation baseline | None. Foundation locked. |
| **P01** | Research and Dataset Feasibility | **In Progress / Blocked** | 30+ audit files in `docs/research/`<br>`scripts/audit_and_train_baselines.py`<br>`data/raw/` directories | Independently Verified in Code & Docs | **BLOCKED**: Mentor approval required for dataset provenance, licensing, and redistribution rights (IFND & TaLLIP). |
| **P02** | UI/UX Design | **Completed and Verified** | Design tokens in `frontend/src/app/globals.css`<br>Tailwind configuration | Verified in browser UI | None. Design system locked. |
| **P03** | Frontend Foundation | **Completed and Verified** | Next.js 16 App Router, TypeScript, React 19, responsive navigation | Verified in browser QA & build | None. |
| **P04** | Complete Frontend with Mock Data | **Completed and Verified** | Interactive Analyzer card, theme toggle, modals, sample excerpts | Verified in browser QA | None. |
| **P05** | Database Design | **Completed and Verified** | `docs/database-design.md`<br>`backend/app/db/models.py`<br>Alembic migrations | Verified in unit tests | Strict Zero Content Retention schema invariants locked. |
| **P06** | Backend Foundation & API Contract | **Completed and Verified** | `backend/app/main.py`<br>`backend/app/api/routes.py`<br>Pydantic schemas | Verified (102 pytest pass) | None. |
| **P07** | Backend & Database Integration | **Completed and Verified** | `backend/app/db/session.py`<br>`backend/tests/test_database.py` | Verified in test fixtures | Database layer runtime decoupled; ready for optional connection. |
| **P08** | Dataset Preparation & ML Foundations | **Completed and Verified** | `ml/schemas.py`, `ml/readers.py`<br>`ml/validation.py`, `ml/quality.py` | Verified (28 unit tests pass) | Ready for authorized data ingestion. |
| **P09** | NLP Preprocessing & Language Routing | **Incorporated into P10/P13** | Unicode script routing in `language.py`<br>TF-IDF pipelines in `pipeline.py` | Verified in integration tests | Officially tracked as Not Started on roadmap; functionality implemented in P10/P13/services. |
| **P10** | Classical ML Training & Evaluation | **Completed and Verified** | LinearSVC & LogisticRegression pipelines<br>`models/baselines/*.joblib` | Verified in ML test suite | Leakage and publisher bias documented in research reports. |
| **P11** | Calibration, Explainability & Benchmarking | **Completed and Verified** | Platt sigmoid `CalibratedClassifierCV`<br>`ml/explainability.py`<br>`models/calibrated/*.joblib` | Verified in ML test suite | Feature attribution disclaimers enforced. |
| **P12** | Optional Transformer Experiment | **Not Started / Deferred** | Research notes on mBERT / IndicBERT | Recorded as Not Started | Optional; deferred in favor of lightweight, explainable linear models. |
| **P13** | ML, FastAPI & Frontend Integration | **Completed and Verified** | `backend/app/services/model_service.py`<br>`frontend/src/App.tsx` API client | Verified (9/9 API regression pass) | Technical integration verified; public inference flags disabled. |
| **P14** | Testing, Security, Privacy & Performance | **Completed and Verified** | In-memory rate limiting, 64 KB payload guard, headline length constraints (20–500) | Verified in unit & security tests | None. |
| **P15** | Deployment, Documentation & v1.0 Release | **Implementation Completed / Review Pending** | `docs/P15_MENTOR_REVIEW.md`<br>`scripts/verify_e2e_full_browser.mjs`<br>13 E2E screenshots | Independently Verified (12/12 E2E, 13/13 screenshots) | **BLOCKED ON MENTOR APPROVAL**: Public release and production deployment not authorized. |

---

## 5. Dataset Research, Provenance, and Audit History

Between Phase P01 and P08, an exhaustive multi-dataset provenance and feasibility audit was conducted across 5 major candidate datasets:

### 5.1 WELFake (English) — Audited & Rejected for Training
- **Audit Findings**: Detailed in `docs/research/p01-k-welfake-original-paper-evidence-review.md` and `docs/research/welfake-label-integrity-investigation.md`.
- **Label Conflict**: Analysis revealed an inverted label mapping between the original Kaggle dataset upload and the primary IEEE paper methodology, creating ambiguity around ground-truth truthfulness labels.
- **Decision**: Rejected as a primary training candidate to prevent inverted model predictions.

### 5.2 Indic Zenodo (Hindi) — Audited & Rejected for Training
- **Audit Findings**: Documented in `docs/research/indic-zenodo-hindi-provenance-investigation.md` and `docs/research/p01-indic-zenodo-final-dataset-audit.md`.
- **Discrepancies**: Investigation discovered discrepancies between the published research paper text and the Zenodo archive contents.
- **License Conflict**: The dataset carries a restrictive Creative Commons Non-Commercial Share-Alike (CC BY-NC-SA 4.0) license with ambiguous attribution chains, creating legal risk for distribution.
- **Decision**: Gated and rejected for deployment.

### 5.3 IFND (Indian Fake News Dataset — English) — Audited & Candidate Trained
- **Audit Findings**: Detailed in `docs/research/p10-p11-model-hardening-and-leakage-investigation-report.md`.
- **Characteristics**: 56,714 Indian English news headlines with binary labels (`Fake`, `True`).
- **Publisher Leakage**: Empirical investigation revealed that publisher tokens (e.g. source names in brackets or prefixes) correlated strongly with class labels, introducing publisher-level bias. Sanitization procedures were documented.
- **Status**: Used to train the local candidate model artifact (`en_ifnd_indian_headlines_calibrated_sigmoid.joblib`). Formal redistribution rights and licensing remain pending mentor approval in Task P01.

### 5.4 TaLLIP (Hindi) — Audited & Candidate Trained (Gated)
- **Audit Findings**: Documented in `docs/research/hindi-dataset-research.md`.
- **Characteristics**: Hindi news articles evaluated via Devanagari character n-grams ($n \in [2, 6]$).
- **Status**: Candidate model serialized (`hi_tallip_hindi_articles_calibrated_sigmoid.joblib`). Functional for technical smoke tests, but achieves moderate F1 and lacks licensing clearance. **Strictly disabled behind HTTP 503**.

### 5.5 ISOT Fake News Dataset (English Baseline) — Audited
- **Audit Findings**: Documented in `docs/research/english-dataset-research.md`. Used for comparative baseline benchmarking (`models/baselines/en_isot_*.joblib`). Shows high lexical clustering around specific political topics.

---

## 6. NLP and Classical Machine Learning Workflow

### 6.1 Feature Engineering Pipeline
- **English Feature Representation**: Subword and word-level $n$-grams ($n \in [1, 2]$) extracted via `TfidfVectorizer` (vocabulary size: ~5,000 to 10,000 features).
- **Hindi Feature Representation**: Subword Devanagari character $n$-grams ($n \in [2, 6]$) to capture rich morpho-syntactic inflections and affixation patterns.
- **Input Bounds**: Strict 20 to 500 characters, reflecting headline training distributions and preventing empty/massive input anomalies.

### 6.2 Model Comparison and Selection
- Evaluated `LinearSVC` (Support Vector Classifier) against `LogisticRegression`.
- Linear models were selected deliberately over opaque black-box transformers (e.g. BERT) because linear models provide:
  1. Deterministic inference with sub-30ms CPU latency.
  2. Direct mathematical feature attribution ($w_i \cdot x_i$).
  3. Seamless calibration via Platt sigmoid scaling.
  4. Ultra-lightweight memory footprint (~180 KB artifact size).

### 6.3 Probability Calibration
- Raw uncalibrated decision boundaries produce extreme or unrepresentative confidence scores.
- Implemented Platt sigmoid scaling using `CalibratedClassifierCV(method='sigmoid', cv='prefit')` on held-out calibration splits (`ml/calibration.py`).
- Mapped probabilities into human-readable confidence tiers:
  - $\ge 85\%$: High Confidence Pattern
  - $70\% - 84\%$: Moderate Confidence Pattern
  - $50\% - 69\%$: Low Confidence Pattern / Borderline

### 6.4 Explainability (`TFIDFExplainer`) & P15 Stop-Word Filtering
- Local feature contribution: $c_i = w_i \cdot \text{TF-IDF}_i$.
- **P15 Improvement**: Post-hoc filtering removes uninformative grammatical unigrams and pure stop-word n-grams (`ENGLISH_UNINFORMATIVE_STOP_WORDS`, `HINDI_UNINFORMATIVE_STOP_WORDS`).
- When inputs contain exclusively stop words, returns `influential_features=[]` with an honest fallback note rather than arbitrary stop-word rankings.

### 6.5 Zero-Vocabulary & Out-of-Domain Guard
- **The Bug**: Pure gibberish (e.g. `xyzabc qwerasdf...`) produced zero vectorizer features ($X_{vec} = \mathbf{0}$). In linear models, this evaluated to the intercept $b$, which Platt calibration transformed into a synthetic 86.4% "Credible" prediction.
- **P15 Guard**: Added `if X_vec.nnz == 0:` density check in `backend/app/services/model_service.py`. Bypasses the classifier and returns:
  `prediction_label="Unclassifiable"`, `confidence_tier="Unclassifiable / Out of Domain"`, `confidence_score=None`, and `influential_tokens=[]`.

---

## 7. Backend Architecture and Service Workflow

### 7.1 Architecture & Endpoints
The backend is built with **FastAPI** running on **Uvicorn ASGI**:
- `GET /api/health`: Service health and independent model readiness probe (`english: bool`, `hindi: bool`).
- `GET /api/samples`: Pre-curated, verified illustrative news excerpts in English and Hindi.
- `POST /api/predict`: Headline analysis endpoint taking `text` (20–500 chars) and optional `language_hint`.

### 7.2 Language & Script Routing Engine (`backend/app/services/language.py`)
1. **Devanagari Detection**: Evaluates Unicode range `\u0900-\u097F`. If Devanagari characters dominate, routed to Hindi pipeline.
2. **Latin Script Detection**: Evaluates ASCII/Latin characters. If Latin dominates, checked against Romanized Hindi detector.
3. **Romanized Hindi (Hinglish) Rejection**: Curated set of 45 high-specificity Indic words (`ROMANIZED_HINDI_INDIC_WORDS`). If $\ge 3$ distinct Indic matches occur, raises `UnsupportedLanguageException` returning HTTP 422:
   > *"Romanized Hindi (Hinglish) is not supported yet. Please enter Hindi using Devanagari script."*
4. **Script Mismatch Guards**: When `language_hint="hi"` has Latin script or `language_hint="en"` has Devanagari script, raises actionable HTTP 422.

### 7.3 Independent Language Activation Gates
- Model service reads `ENABLE_ENGLISH_INFERENCE` and `ENABLE_HINDI_INFERENCE` independently from environment variables (`os.getenv`).
- English inference: Operational when enabled; disabled by default in repository config.
- Hindi inference: **Strictly disabled** behind HTTP 503 (`ModelUnavailableException`), returning:
  > *"The Hindi model service is not available. Hindi model inference is currently disabled pending dataset licensing and deployment clearance. VeriNews never fabricates synthetic predictions."*

### 7.4 Zero Content Retention & Security Guards
- **Route Logging**: Logs only `char_length` and `language_hint`. Never logs `request.text`.
- **Database Decoupling**: `/api/predict` performs pure in-memory inference without calling `db.add()` or `db.commit()`.
- **Payload Guard**: In-memory middleware rejects payloads $> 64\text{ KB}$ with HTTP 413.
- **Rate Limiting**: Sliding 60-second window limiting callers to 60 requests/minute (HTTP 429). Periodic pruning evicts expired IP tracking entries.

---

## 8. Frontend and Website Implementation Workflow

### 8.1 Technology Stack & Architecture
- **Framework**: Next.js 16.4.5 (App Router, Turbopack, React 19, TypeScript).
- **Styling**: Tailwind CSS with custom design system tokens, light/dark themes, and CSS variables.
- **State Management**: React hooks (`useState`, `useRef`, `useEffect`).

### 8.2 Component Hierarchy & Structure
- `frontend/src/app/page.tsx`: Root page rendering main `<App />`.
- `frontend/src/App.tsx`: Central client application managing:
  - Hero Section with glowing ambient background and CTA triggers.
  - "Why VeriNews?" 3-pillar feature grid (Language Analysis, Pattern Detection, Context First).
  - Analyzer Section: Active analysis interface, live notifications, and trust badges.
  - History Section: Reading space preview (displays empty-state placeholder in preview mode).
  - About Section: Educational mission, 3 core principles, caution callouts.
  - Footer: Multi-column navigation and modal triggers (Methodology, Limitations, FAQ, Privacy, Terms).
  - Modals (`InfoModal.tsx`): Accessible dialog popups for technical and legal documentation.
- `frontend/src/components/Analyzer.tsx`:
  - 20–500 character headline textarea.
  - Live non-whitespace trimmed character counter with actionable threshold guidance.
  - Sample loader buttons (English & Hindi).
  - Language selector (`Auto`, `English`, `Hindi`).
  - Atomic Clear button resetting inputs, validation errors, notices, and result cards.
- `frontend/src/components/AnalysisResult.tsx`:
  - Standard Result State: Colored indicator dot, prediction badge (`Credible` / `Unreliable`), confidence bar, model metadata, latency, top influential tokens, and Responsible AI disclaimer.
  - Unclassifiable State: Neutral muted dot (`bg-content-muted`), `Unclassifiable / Out of Domain` badge, `Not applicable` confidence (no percentage or progress bar), and domain explanation.
- `frontend/src/components/NavBar.tsx`: Sticky responsive header with desktop navigation, mobile drawer toggle, theme toggle, and keyboard accessibility (ESC to close).
- `frontend/src/components/ThemeToggle.tsx`: Seamless Light/Dark theme switcher backed by browser `localStorage ('verinews-theme')`.
- `frontend/src/app/project-tracker/page.tsx`: Server-side loaded Project Tracker dashboard (active in development mode).

### 8.3 P15 UX and Reliability Improvements
1. **Race-Condition Guard**: Introduced `latestRequestId = useRef(0)` in `App.tsx`. Stale responses from superseded or cleared requests are discarded.
2. **Trimmed Character Counter**: Measures `trimmedText.length` rather than raw whitespace.
3. **Atomic Clear**: Clear button triggers `onClear()` callback, resetting all parent notices and analysis results.

---

## 9. Testing, Hardening, and Browser E2E Verification History

### 9.1 Verification Suite Summary

| Verification Category | Target Component | Command Executed | Result | Details |
| :--- | :--- | :--- | :--- | :--- |
| **Backend Unit Tests** | Core API, DB, Services | `pytest -W default -ra` | **PASS (102/102)** | 102 passed, 1 Starlette warning in 17.08s |
| **Frontend Static Typecheck** | Next.js / TypeScript | `npm run typecheck` | **PASS (0 Errors)** | TypeScript `tsc --noEmit` exited 0 |
| **Frontend Linter** | ESLint 9+ Rules | `npm run lint` | **PASS (0 Errors)** | Zero linting warnings or errors |
| **Frontend Build** | Next.js Production Build | `npm run build` | **PASS (3/3 Routes)** | Turbopack production build exited 0 |
| **API Integration Tests** | Backend HTTP Contract | `node scripts/test_frontend_api_integration.mjs` | **PASS (9/9)** | 9 integration tests passed |
| **English Live Smoke Test** | English Model Pipeline | `python scripts/test_local_english_inference.py` | **PASS** | Live HTTP 200, 0.9077 confidence verified |
| **Hindi Live Smoke Test** | Hindi Gating & Pipeline | `python scripts/test_local_hindi_smoke_test.py` | **PASS (5/5)** | Gating, memory activation, and restoration |
| **Browser E2E Automated Suite** | Real Browser Workflows | `node scripts/verify_e2e_full_browser.mjs` | **PASS (12/12)** | Chrome CDP automation across 12 scenarios |
| **Visual Screenshot Audit** | Rendered UI Evidence | Manual `read_file` inspection | **PASS (13/13)** | All 13 PNGs non-empty, scrolled to target |
| **Browser Storage Audit** | Client Zero-Retention | Chrome CDP expression evaluation | **PASS** | `localStorage: []`, `sessionStorage: []`, `cookies: ""` |

### 9.2 Browser E2E Scenario Inventory (12 Scenarios, 13 Screenshots)
1. **Scenario 1**: English news headline $\rightarrow$ Genuine prediction (`Credible`, 82% confidence, top tokens). (`scenario-1-english-headline.png`, 129 KB)
2. **Scenario 2**: Random gibberish $\rightarrow$ `Unclassifiable / Out of Domain`, no confidence percentage. (`scenario-2-unclassifiable-gibberish.png`, 126 KB)
3. **Scenario 3**: Romanized Hindi (Hinglish) $\rightarrow$ Actionable HTTP 422 alert banner. (`scenario-3-roman-hindi-rejection.png`, 99 KB)
4. **Scenario 4**: Legitimate English text $\rightarrow$ Preserved as genuine English prediction. (`scenario-4-legit-english-preserved.png`, 131 KB)
5. **Scenario 5**: Devanagari Hindi with Hindi disabled $\rightarrow$ Gated HTTP 503 alert banner. (`scenario-5-hindi-disabled-503.png`, 100 KB)
6. **Scenario 6**: English text with Hindi hint $\rightarrow$ Script mismatch HTTP 422 banner. (`scenario-6-english-with-hindi-hint.png`, 103 KB)
7. **Scenario 7**: Hindi text with English hint $\rightarrow$ Script mismatch HTTP 422 banner. (`scenario-7-hindi-with-english-hint.png`, 98 KB)
8. **Scenario 8**: Clear button $\rightarrow$ Atomically resets textarea, validation messages, and result cards. (`scenario-8-clear-button-resets-all.png`, 109 KB)
9. **Scenario 9**: Request race condition $\rightarrow$ Late response discarded; form remains cleared. (`scenario-9-race-condition-guard.png`, 110 KB)
10. **Scenario 10**: Short input (<20 chars) $\rightarrow$ Real-time trimmed counter validation error. (`scenario-10-character-counter-validation.png`, 104 KB)
11. **Scenario 11**: Unclassifiable visual hierarchy $\rightarrow$ Neutral dot, no gradient bars. (`scenario-11-unclassifiable-visuals.png`, 126 KB)
12. **Scenario 12a**: Desktop layout (1280×800) $\rightarrow$ Full navbar, actions bar, trust badges. (`scenario-12-desktop-1280x800.png`, 102 KB)
13. **Scenario 12b**: Mobile layout (375×667) $\rightarrow$ Collapsed navbar, responsive card wrapping. (`scenario-12-mobile-375x667.png`, 135 KB)

---

## 10. System Architecture and Technology Stack Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                            │
│  Next.js 16.4.5 (Turbopack, React 19, Tailwind CSS, TypeScript)        │
│  - App Router: / (Home, Analyzer, History, About), /project-tracker    │
│  - Client Storage: Theme preference only ('verinews-theme')            │
│  - Accessibility: Semantic HTML, ARIA roles, skip-to-content links     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST API (JSON)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY LAYER                            │
│  FastAPI 0.115+ / Uvicorn ASGI Server (Python 3.14)                   │
│  - Security Middleware: 64 KB payload guard, in-memory IP rate limiter │
│  - Validation: Pydantic v2 schemas (20–500 chars, sanitized loc/msg)   │
│  - Language Routing: Unicode script analysis (Latin vs. Devanagari)    │
│  - Hinglish Detector: 45 Indic keywords rejection guard (HTTP 422)     │
│  - Activation Gates: ENABLE_ENGLISH_INFERENCE & ENABLE_HINDI_INFERENCE │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ In-Memory Pipeline Call
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        MACHINE LEARNING ENGINE                         │
│  Scikit-Learn Linear Pipelines & Calibration Layer                     │
│  - English: TF-IDF Word n-grams + Logistic Regression (Platt Sigmoid)  │
│  - Hindi: TF-IDF Char n-grams + Platt Sigmoid [Gated HTTP 503]         │
│  - Intercept Guard: Zero-density check (X_vec.nnz == 0 -> Unclassifiable)│
│  - Explainability: TFIDFExplainer (signed weights, stop-word filtered) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Decoupled / Dormant at Runtime
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       PERSISTENCE LAYER (ORM)                          │
│  PostgreSQL / SQLAlchemy 2.0 / Alembic Migrations                      │
│  - Strict Zero Content Retention: Analysis model omits headline text,  │
│    tokens, and hashes.                                                 │
│  - Decoupled: /api/predict performs zero database writes at runtime.   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 11. Current Project Status

- **Development Lifecycle Mode**: `Development` (Maintenance mode not activated).
- **Phase P15 Status**: **Implementation Completed; Pending Mentor Review**.
- **Public Inference Status**: **Disabled** (`ENABLE_ENGLISH_INFERENCE=false`, `ENABLE_HINDI_INFERENCE=false`).
- **Git Staging State**: Exactly **65 files** staged for preview release. Staging scope preserved untouched.
- **Next Canonical Step**: Await mentor review of `docs/P15_MENTOR_REVIEW.md` and resolve Phase P01 dataset licensing clearance.

---

## 12. Known Limitations and Scientific Caveats

1. **Statistical Correlation vs. Factual Truth**: Linear TF-IDF classifiers identify stylistic and lexical correlations in headline text. They cannot establish whether claims are empirically true or false.
2. **IFND Publisher Bias**: The IFND training corpus exhibits publisher-level label homogeneity and publisher token leakage. While sanitized during experiments, the candidate model reflects stylistic correlation rather than semantic truth.
3. **Hindi Candidate Model Maturity**: The TaLLIP Hindi candidate model achieves moderate macro F1 scores and relies on character n-grams. It is not sufficiently calibrated or validated for public use.
4. **Length Sensitivity**: VeriNews is strictly calibrated for headlines (20–500 characters). Submitting long-form articles or paragraphs causes distribution shift and invalidates calibration.
5. **Feature Attribution Caveat**: Token weights represent model coefficients, not causative proof of deceit. Responsible AI disclaimers directing users to accredited fact-checking organizations are mandatory.

---

## 13. Critical Blockers: Dataset Rights, Licensing, and Deployment Authorization

The following 10 items are strictly blocked and must not be marked completed without explicit mentor clearance:
1. **IFND Provenance & Redistribution Rights**: Commercial and redistribution rights for IFND remain unresolved.
2. **IFND Publisher Token Leakage**: Formal protocol for domain-generalization testing without publisher bias is required.
3. **Hindi TaLLIP Licensing & Rights**: Provenance and redistribution rights for the TaLLIP corpus remain unapproved.
4. **Indic Zenodo Licensing Conflict**: Creative Commons CC BY-NC-SA 4.0 license and archive discrepancies prevent deployment.
5. **Hindi Model Calibration & Readiness**: Production calibration of Hindi inference is incomplete.
6. **Cross-Source Robust Generalization**: Out-of-distribution evaluation across external news corpora is pending.
7. **Reverse-Proxy & Cloud Logging Verification**: Privacy verification has only been completed locally; production reverse-proxy (Nginx/Cloudflare) logging has not been audited in the cloud.
8. **Third-Party Exception Logging Risk**: Standard Python exception handlers could hypothetically log input substrings if a compiled library fails with an input excerpt in its exception message.
9. **Live Database Lifecycle Verification**: Connection pooling under multi-worker production traffic has not been tested against a live managed PostgreSQL instance.
10. **Formal Mentor Approval**: Phase P15 and public release authorization require formal mentor sign-off.

---

## 14. Formal Mentor Review Status and Gates

- **Master Review Package**: [`docs/P15_MENTOR_REVIEW.md`](file:///C:/Users/mddan/Desktop/VeriNews/docs/P15_MENTOR_REVIEW.md) (Version 1.1.0 Audited & Qualified).
- **Review Decision**: Pending.
- **Release Authorization**: Not authorized. Public inference flags must remain `false`.

---

## 15. Recommended Next Actions and Phased Road Ahead

1. **Step 1 (Immediate)**: Await mentor review and formal evaluation of `docs/P15_MENTOR_REVIEW.md`.
2. **Step 2 (Phase P01 Resolution)**: If mentor authorizes proceeding, resolve Phase P01 dataset provenance, licensing, and redistribution rights for English and Hindi training corpora.
3. **Step 3 (Generalization & Hardening)**: Conduct cross-source generalization benchmarks to evaluate model robustness beyond IFND and TaLLIP training distributions.
4. **Step 4 (Production Privacy Audit)**: In the event of cloud deployment planning, configure reverse-proxy access logs (Nginx/Cloudflare) to guarantee Zero Content Retention upstream.
5. **Step 5 (Release Gate)**: Only upon explicit, written mentor approval, execute the release transition helper (`scripts/activate_maintenance_mode.mjs`) to activate Maintenance mode.

---

## 16. Comprehensive Evidence Register and Repository Reference Index

| Artifact Description | Repository-Relative Path | Verification Status | Notes |
| :--- | :--- | :--- | :--- |
| **Master Mentor Review Package** | `docs/P15_MENTOR_REVIEW.md` | **Independently Verified** | v1.1.0 Audited & Qualified review document. |
| **Complete Website Feature Inventory** | `docs/VERINEWS_WEBSITE_FEATURE_INVENTORY.md` | **Independently Verified** | Comprehensive UI and component inventory. |
| **Automated Browser E2E Runner** | `scripts/verify_e2e_full_browser.mjs` | **Verified Script & Recorded Result** | 12 scenarios automated via Chrome DevTools Protocol; exit code 0. |
| **Browser Visual Screenshots (13 files)** | `scripts/screenshots/*.png` | **Independently Verified** | All 13 PNGs visually inspected; non-empty (98 KB – 135 KB). |
| **API Integration Regression Suite** | `scripts/test_frontend_api_integration.mjs` | **Verified Script & Recorded Result** | 9/9 automated HTTP tests passing against backend. |
| **Local English Smoke Test** | `scripts/test_local_english_inference.py` | **Verified Script & Recorded Result** | In-process temporary enablement; live HTTP 200; 503 restored. |
| **Local Hindi Smoke Test** | `scripts/test_local_hindi_smoke_test.py` | **Verified Script & Recorded Result** | 5/5 cases passed; gating and memory activation verified. |
| **Backend Unit & Integration Suite** | `project-tracker/execution-history/exec-20261110070023910-d6a82860.json` | **Reported from Execution Record** | 102 passed, 1 Starlette warning. |
| **Frontend Production Build** | `project-tracker/execution-history/exec-20261110070023910-d6a82860.json` | **Reported from Execution Record** | Next.js 16.4.5 Turbopack production build succeeded. |
| **Frontend Static Typecheck & Lint** | `project-tracker/execution-history/exec-20261110070023910-d6a82860.json` | **Reported from Execution Record** | 0 TypeScript errors, 0 ESLint errors. |
| **Database Schema & ORM Models** | `backend/app/db/models.py` | **Independently Verified in Code** | Strict Zero Content Retention schema verified. |
| **Model Service Dispatcher** | `backend/app/services/model_service.py` | **Independently Verified in Code** | Zero-vocabulary guard, Platt calibration, independent gating. |
| **Language Routing Engine** | `backend/app/services/language.py` | **Independently Verified in Code** | Unicode script detection, Romanized Hindi 422 rejection. |
| **Explainability Engine** | `ml/explainability.py` | **Independently Verified in Code** | Signed token contributions, stop-word filtering. |
| **Client Application & UI** | `frontend/src/App.tsx`, `frontend/src/components/*` | **Independently Verified in Code** | Responsive Next.js frontend with race-condition guard. |

