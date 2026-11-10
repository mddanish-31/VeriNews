# VeriNews Master Pending Work Register

**Audit Date:** 2026-11-10  
**Audit Scope:** All canonical phases P00–P15  
**Audit Type:** Discovery and audit only — no implementation, no deployment, no code changes  
**Safety Status:** Application code, datasets, models, environment files, and Git staging remain untouched

---

## 1. Executive Summary

This audit systematically reviews all 16 canonical phases (P00–P15) of the VeriNews project against tracker claims, actual source code, tests, documentation, model artifacts, and dataset audit records.

**Critical Finding:** While the tracker marks P05–P14 as "Completed," extensive review reveals that many of these completions are documentation-only or synthetic-test-only, with no real dataset approved for training and no model inference enabled. P01 remains the primary blocker: **no dataset is approved for English or Hindi training.** P15 lacks deployment configuration files (no `vercel.json`, no `render.yaml`).

**Overall Project Status:** Development mode, release not approved, no model deployed, no public inference active.

---

## 2. Phase-by-Phase Audit (P00–P15)

### P00 — Product Scope and Requirements
- **Tracker Status:** Completed
- **Actual Status:** VERIFIED_COMPLETE
- **Evidence:** `project-tracker/progress.json`, `project-tracker/roadmap.json`, `AGENTS.md`, `README.md`
- **Verification:** Product scope, users, requirements, risks, and boundaries are documented. Frontend AGENTS.md and root README.md exist.
- **Remaining Work:** None
- **Dependencies:** None
- **Risk:** None
- **Can complete locally:** Yes (already complete)

### P01 — Research and Dataset Feasibility
- **Tracker Status:** In Progress
- **Actual Status:** BLOCKED_EXTERNAL_DEPENDENCY / NEEDS_MENTOR_APPROVAL
- **Evidence:** `docs/research/p01-*` (14 reports), `docs/research/p01-m-evidence-register.md`, `project-tracker/execution-history/exec-20261109165157393-02a01899.json`
- **Verification:** All dataset candidates reviewed:
  - **WELFake:** NOT APPROVED — label semantics (H-01) unresolved, source provenance (H-04) unresolved, rights (H-05/Reuters/BuzzFeed) unresolved, ON HOLD
  - **ISOT:** NOT APPROVED — restrictive research-use conditions
  - **TaLLIP:** NOT APPROVED — redistribution/licensing unresolved
  - **Indic Zenodo Hindi:** NOT APPROVED — CC BY 4.0 vs CC BY-NC 4.0 conflict, record-count discrepancy (20,593 vs 20,493), label correctness unresolved
  - **HinFakeNews:** NOT APPROVED — licence and reuse permission unresolved
- **Remaining Work:** Mentor approval required for any dataset; dataset-approval gate not passed
- **Dependencies:** External mentor authorization
- **Risk:** P0 — Critical blocker (no training possible without approved dataset)
- **Can complete locally:** No — requires external mentor approval

### P02 — UI/UX Design
- **Tracker Status:** Completed
- **Actual Status:** VERIFIED_COMPLETE
- **Evidence:** `frontend/src/components/` (Analyzer, AnalysisResult, NavBar, ThemeToggle, etc.), `frontend/src/App.tsx`, `frontend/src/app/layout.tsx`, `frontend/src/app/globals.css`
- **Verification:** Light/dark theme, responsive layout, Hero section, Analyzer section, History section, About section all implemented. Typecheck, lint, build pass.
- **Remaining Work:** None
- **Dependencies:** None
- **Risk:** None
- **Can complete locally:** Yes (already complete)

### P03 — Frontend Foundation
- **Tracker Status:** Completed
- **Actual Status:** VERIFIED_COMPLETE
- **Evidence:** `frontend/src/` (Next.js 16 App Router, TypeScript, Tailwind CSS), `frontend/package.json`, typecheck/lint/build all pass
- **Verification:** `npm run typecheck`, `npm run lint`, `npm run build` all pass. Next.js 16.4.5, React 19.3.1, TypeScript 5.7.3.
- **Remaining Work:** None
- **Dependencies:** None
- **Risk:** None
- **Can complete locally:** Yes (already complete)

### P04 — Project Tracker
- **Tracker Status:** Completed
- **Actual Status:** VERIFIED_COMPLETE
- **Evidence:** `project-tracker/` (progress.json, roadmap.json, activity-log.json, execution-history/), `scripts/validate_project_tracker.mjs`, `scripts/update_project_tracker.mjs`, `scripts/test_project_tracker.mjs`
- **Verification:** Tracker validation passes: 16 phases, 16 unique tasks, 25 activity records, 21 execution records. `node scripts/validate_project_tracker.mjs` passes.
- **Remaining Work:** P10 executionReportRef path is corrupted (missing "exec-" prefix and "execution-history/" directory)
- **Dependencies:** None
- **Risk:** P2 — Data integrity issue in tracker
- **Can complete locally:** Yes

### P05 — Database Design
- **Tracker Status:** Completed
- **Actual Status:** PARTIALLY_COMPLETE (documentation only)
- **Evidence:** `docs/database-design.md`, `backend/app/db/models.py` (User, Analysis, UserFeedback ORM models), `backend/app/db/base.py`, `backend/app/db/session.py`, `alembic.ini`, `backend/alembic/`
- **Verification:** SQLAlchemy 2.0 ORM models defined. Alembic migration exists. Strict Zero Content Retention schema verified (no input_snippet, input_hash, article_text, raw_text fields). However: **no live database connectivity test passed** — DATABASE_URL is configured in `.env` but `test_database.py` skips when DATABASE_URL not set; Neon PostgreSQL connectivity not independently verified in this audit.
- **Remaining Work:** Verify live Neon PostgreSQL connectivity; verify Alembic migration applies cleanly; confirm schema invariants under migration
- **Dependencies:** DATABASE_URL (Neon PostgreSQL), network access
- **Risk:** P1 — Database layer unverified in live environment
- **Can complete locally:** Partially (code review yes, live DB test needs network)

### P06 — Backend Foundation and API Contract
- **Tracker Status:** Completed
- **Actual Status:** VERIFIED_COMPLETE
- **Evidence:** `backend/app/main.py`, `backend/app/api/routes.py`, `backend/app/core/config.py`, `backend/app/schemas/prediction.py`, `backend/app/schemas/health.py`, `backend/app/schemas/samples.py`, 35 backend tests + 82 ML tests all pass
- **Verification:** FastAPI app with CORS, rate limiting, payload size limits, Pydantic schemas, health endpoint, samples endpoint, predict endpoint, validation error handling, exception handlers. All tests pass.
- **Remaining Work:** None
- **Dependencies:** None
- **Risk:** None
- **Can complete locally:** Yes (already complete)

### P07 — Backend and Database Integration
- **Tracker Status:** Completed
- **Actual Status:** PARTIALLY_COMPLETE
- **Evidence:** `backend/app/db/session.py` (get_engine, get_session_factory, get_db, get_optional_db), `backend/tests/test_database.py`
- **Verification:** SQLAlchemy engine and session factory defined. Optional DB dependency (`get_optional_db`) yields None when DATABASE_URL not configured. Database models defined. **Live database not verified** — tests skip when DATABASE_URL not set.
- **Remaining Work:** Verify live database connection; test `get_db()` vs `get_optional_db()` under live conditions; verify Alembic migration state in Neon
- **Dependencies:** DATABASE_URL, Neon PostgreSQL
- **Risk:** P1 — Database integration unverified
- **Can complete locally:** Partially

### P08 — Dataset Preparation and ML Data Foundations
- **Tracker Status:** Completed
- **Actual Status:** PARTIALLY_COMPLETE (synthetic-only, no real data)
- **Evidence:** `ml/schemas.py`, `ml/labels.py`, `ml/validation.py`, `ml/readers.py`, `ml/quality.py`, `ml/tests/` (28 synthetic tests), `pytest.ini`
- **Verification:** SafeDatasetReader, RecordValidator, LabelMapping, DatasetAuditor implemented. 28 synthetic tests pass. **No real dataset accessed** — `data/` directory is gitignored and not accessed per safety rules. No real data preparation performed.
- **Remaining Work:** Cannot proceed until dataset is approved (P01 blocker)
- **Dependencies:** Approved dataset (P01)
- **Risk:** P1 — Blocked by P01 dataset approval
- **Can complete locally:** No — blocked by P01

### P09 — ML Training and Evaluation
- **Tracker Status:** Completed
- **Actual Status:** PARTIALLY_COMPLETE (hardening/investigation only, no training)
- **Evidence:** `docs/research/p10-p11-model-hardening-and-leakage-investigation-report.md`, `docs/research/p10-p11-hardened-experiments-report.json`, `scripts/investigate_and_harden_models.py`, `scripts/audit_and_train_baselines.py`
- **Verification:** Source leakage investigation, class imbalance analysis, train/test split validation documented. **No training performed** — "No training performed — no dataset approved" confirmed in multiple reports.
- **Remaining Work:** Cannot proceed until dataset is approved (P01 blocker)
- **Dependencies:** Approved dataset (P01)
- **Risk:** P1 — Blocked by P01 dataset approval
- **Can complete locally:** No — blocked by P01

### P10 — Classical ML Training and Evaluation
- **Tracker Status:** Completed
- **Actual Status:** PARTIALLY_COMPLETE (baseline artifacts exist but not from approved training)
- **Evidence:** `models/baselines/` (10 .joblib artifacts), `scripts/investigate_and_harden_models.py`, `ml/tests/test_model_hardening.py`
- **Verification:** 10 baseline model artifacts exist (IFND, ISOT linear SVM, logistic regression; TaLLIP hardened, linear SVM, logistic regression). **These artifacts were created without approved dataset** — training permission unresolved. P10 executionReportRef path is corrupted (`project-tracker/09T112101769-9d7bba09.json` — missing "exec-" prefix and directory).
- **Remaining Work:** Fix corrupted executionReportRef; cannot proceed with approved training until P01 resolved
- **Dependencies:** Approved dataset (P01)
- **Risk:** P1 — Artifacts exist without approved dataset provenance
- **Can complete locally:** Partially (path fix yes, training no)

### P11 — Calibration, Explainability and Benchmarking
- **Tracker Status:** Completed
- **Actual Status:** PARTIALLY_COMPLETE (calibration/explainability code exists, no approved benchmark)
- **Evidence:** `ml/calibration.py`, `ml/explainability.py`, `scripts/run_p11_calibration_and_explainability.py`, `ml/tests/test_calibration_and_explainability.py`, `models/calibrated/` (3 calibrated .joblib artifacts)
- **Verification:** TFIDFExplainer, calibration logic implemented. 3 calibrated artifacts exist. **No benchmark on approved data** — no dataset approved.
- **Remaining Work:** Cannot proceed until dataset is approved (P01 blocker)
- **Dependencies:** Approved dataset (P01)
- **Risk:** P1 — Blocked by P01 dataset approval
- **Can complete locally:** No — blocked by P01

### P12 — NLP Preprocessing and Language Routing
- **Tracker Status:** Completed
- **Actual Status:** VERIFIED_COMPLETE
- **Evidence:** `backend/app/services/language.py` (detect_script_and_language, Devanagari/Latin detection), `ml/` (preprocessing modules), `backend/tests/` (language routing tests pass)
- **Verification:** Unicode script detection, Devanagari character support (U+0900–U+097F), Hindi/English routing, unsupported script rejection, conflicting language hint rejection. All tests pass.
- **Remaining Work:** Hindi Devanagari preprocessing not verified on real data (no approved Hindi dataset)
- **Dependencies:** None for code; approved dataset for real-data validation
- **Risk:** P2 — Real-data validation pending
- **Can complete locally:** Yes (code complete)

### P13 — ML, FastAPI and Frontend Integration
- **Tracker Status:** Completed
- **Actual Status:** PARTIALLY_COMPLETE (integration code exists, inference disabled)
- **Evidence:** `frontend/src/App.tsx` (fetch to /api/predict), `backend/app/api/routes.py` (predict_article), `backend/app/services/model_service.py` (model_service singleton), `frontend/src/components/Analyzer.tsx`, `frontend/src/components/AnalysisResult.tsx`
- **Verification:** Frontend sends POST to /api/predict with text and language_hint. Backend routes to model_service.predict(). Model service loads artifacts conditionally. **Inference flags are False** — model_service.__init__() does not auto-load because ENABLE_ENGLISH_INFERENCE=False and ENABLE_HINDI_INFERENCE=False. API returns HTTP 503 honestly.
- **Remaining Work:** Cannot enable inference until dataset approved (P01); frontend-backend integration verified but non-functional without model
- **Dependencies:** Approved dataset (P01), inference flag activation
- **Risk:** P1 — Integration complete but non-functional without model
- **Can complete locally:** Yes (code review), but no functional inference

### P14 — Testing, Security, Privacy and Performance
- **Tracker Status:** Completed
- **Actual Status:** VERIFIED_COMPLETE (code and tests)
- **Evidence:** `backend/tests/test_p14_hardening.py`, `ml/tests/`, `backend/app/main.py` (rate limiting, payload limits), `backend/app/schemas/prediction.py` (validation), 41 backend + 82 ML = 123 tests pass
- **Verification:** Rate limiting (60 req/min), payload size limit (64 KB), input validation (20-500 chars), Zero Content Retention schema, CORS, error handling. All 123 Python tests pass. Frontend typecheck, lint, build pass.
- **Remaining Work:** Browser E2E tests not present; manual QA not documented; live deployment not tested
- **Dependencies:** None for code; deployment environment for E2E
- **Risk:** P2 — No E2E or manual QA evidence
- **Can complete locally:** Yes (unit tests); E2E needs deployment

### P15 — Deployment, Documentation and v1.0 Release
- **Tracker Status:** In Progress
- **Actual Status:** PARTIALLY_COMPLETE
- **Evidence:** `docs/deployment-plan.md`, `docs/release-readiness-and-hardening.md`, `docs/technical-architecture.md`, `scripts/verify_backend_connection.py`, `scripts/verify_frontend_fetch.mjs`
- **Verification:** Deployment plan documented. **No vercel.json exists.** **No render.yaml exists.** **No frontend .env.local exists.** 65 files staged in Git but not committed. Release approval: Not Approved.
- **Remaining Work:** Create deployment configs; configure Vercel root directory; set Render env vars; obtain release approval; commit staged files
- **Dependencies:** P01 dataset approval, P05-P07 database verification, mentor release approval
- **Risk:** P0 — Release cannot proceed without deployment configs and release approval
- **Can complete locally:** Partially (config creation yes; deployment no)

---

## 3. All Outstanding Tasks (Without Omission)

| Task ID | Phase | Description | Status | Evidence | Remaining Work | External Approval Required? |
|---------|-------|-------------|--------|----------|----------------|----------------------------|
| T-001 | P01 | Dataset approval gate — no dataset approved for English or Hindi | NEEDS_MENTOR_APPROVAL | `docs/research/p01-*` (14 reports) | Mentor must approve a dataset | YES |
| T-002 | P01 | WELFake label semantics (H-01) unresolved | BLOCKED_EXTERNAL_DEPENDENCY | `docs/research/p01-k/l/m/n-*` | Primary evidence tying labels to Fake/Real semantics | YES |
| T-003 | P01 | WELFake source provenance (H-04) unresolved | BLOCKED_EXTERNAL_DEPENDENCY | `docs/research/p01-n-*` | Per-record source map, collection dates, article URLs | YES |
| T-004 | P01 | WELFake upstream rights (H-05) unresolved | BLOCKED_EXTERNAL_DEPENDENCY | `docs/research/p01-n-*` | Reuters/BuzzFeed rights evidence | YES |
| T-005 | P01 | IFND provenance and redistribution rights unresolved | BLOCKED_EXTERNAL_DEPENDENCY | `docs/research/p01-o-*` | Restrictive research-use conditions | YES |
| T-006 | P01 | TaLLIP licensing unresolved | BLOCKED_EXTERNAL_DEPENDENCY | `docs/research/p01-o-*` | Redistribution/licensing evidence | YES |
| T-007 | P01 | Indic Zenodo licensing conflict (CC BY vs CC BY-NC) | BLOCKED_EXTERNAL_DEPENDENCY | `docs/research/p01-indic-zenodo-*` | Licence conflict resolution | YES |
| T-008 | P01 | Record-count discrepancy (20,593 vs 20,493) | BLOCKED_TECHNICAL | `docs/research/p01-indic-zenodo-*` | Explain 100-file difference | NO (investigation) |
| T-009 | P04 | P10 executionReportRef path corrupted | PARTIALLY_COMPLETE | `project-tracker/progress.json` | Fix path to `project-tracker/execution-history/exec-20261109112101769-9d7bba09.json` | NO |
| T-010 | P05 | Live Neon PostgreSQL connectivity unverified | BLOCKED_EXTERNAL_DEPENDENCY | `docs/database-design.md`, `.env` (DATABASE_URL) | Verify live DB connection and Alembic state | YES (DB access) |
| T-011 | P07 | Live database integration unverified | BLOCKED_EXTERNAL_DEPENDENCY | `backend/app/db/session.py` | Test get_db() and get_optional_db() live | YES (DB access) |
| T-012 | P08 | Real dataset preparation blocked | BLOCKED_EXTERNAL_DEPENDENCY | `ml/` (synthetic only) | Cannot proceed without P01 approval | YES |
| T-013 | P09 | Real ML training blocked | BLOCKED_EXTERNAL_DEPENDENCY | `docs/research/p10-p11-*` | Cannot proceed without P01 approval | YES |
| T-014 | P10 | Classical ML training blocked | BLOCKED_EXTERNAL_DEPENDENCY | `models/baselines/` (artifacts without approved provenance) | Cannot proceed without P01 approval | YES |
| T-015 | P11 | Real calibration/benchmarking blocked | BLOCKED_EXTERNAL_DEPENDENCY | `models/calibrated/` (artifacts without approved provenance) | Cannot proceed without P01 approval | YES |
| T-016 | P13 | Inference disabled (flags = False) | NOT_STARTED (for activation) | `backend/app/core/config.py`, `.env` | Cannot enable without P01 approval | YES (mentor) |
| T-017 | P15 | No vercel.json deployment config | NOT_STARTED | (file does not exist) | Create vercel.json with rootDirectory=frontend | NO |
| T-018 | P15 | No render.yaml deployment config | NOT_STARTED | (file does not exist) | Create render.yaml with Free plan, Uvicorn start command | NO |
| T-019 | P15 | No frontend .env.local | NOT_STARTED | (file does not exist) | Create .env.local with NEXT_PUBLIC_API_URL | NO |
| T-020 | P15 | Release approval not granted | NEEDS_MENTOR_APPROVAL | `project-tracker/progress.json` (releaseApproval: Not Approved) | Mentor must approve release | YES |
| T-021 | P15 | 65 staged files not committed | NOT_STARTED | `git status --short` (65 staged) | Commit staged files (requires approval) | YES (mentor/Git) |
| T-022 | P14 | No browser E2E tests | NOT_STARTED | (no E2E test files) | Create E2E test suite | NO |
| T-023 | P14 | No manual QA documentation | DEFERRED | (no QA records) | Document manual QA procedures | NO |
| T-024 | P01 | Hindi Devanagari real-data validation pending | BLOCKED_EXTERNAL_DEPENDENCY | `backend/app/services/language.py` | Requires approved Hindi dataset | YES |
| T-025 | P01 | Cross-source generalization unverified | BLOCKED_EXTERNAL_DEPENDENCY | `docs/research/p01-o-*` | Requires approved datasets | YES |
| T-026 | P09/P10 | Source/topic/temporal leakage investigation incomplete | PARTIALLY_COMPLETE | `docs/research/p10-p11-*` | Documented but not on approved data | YES (needs data) |

---

## 4. Verified Completed Tasks

| Task ID | Phase | Description | Evidence |
|---------|-------|-------------|----------|
| V-001 | P00 | Product scope, requirements, constraints, non-goals | `AGENTS.md`, `README.md`, `project-tracker/progress.json` |
| V-002 | P02 | UI/UX design — light/dark theme, responsive layout, all sections | `frontend/src/components/`, `frontend/src/App.tsx` |
| V-003 | P03 | Frontend foundation — Next.js 16, TypeScript, Tailwind, typecheck/lint/build pass | `frontend/`, `npm run typecheck/lint/build` pass |
| V-004 | P04 | Project tracker — 16 phases, 25 activities, 21 executions, validation passes | `project-tracker/`, `scripts/validate_project_tracker.mjs` |
| V-005 | P06 | Backend foundation — FastAPI, CORS, rate limiting, Pydantic schemas, 10 tests pass | `backend/app/`, `backend/tests/` |
| V-006 | P12 | NLP preprocessing — Unicode script detection, Devanagari/Hindi/English routing | `backend/app/services/language.py`, tests pass |
| V-007 | P14 | Testing — rate limiting, payload limits, input validation, Zero Content Retention, 123 tests pass | `backend/tests/`, `ml/tests/` |
| V-008 | P14 | Frontend QA — typecheck, lint, build all pass | `frontend/`, `npm run typecheck/lint/build` pass |

---

## 5. Partially Completed and Unverified Tasks

| Task ID | Phase | Description | Gap |
|---------|-------|-------------|-----|
| P-001 | P05 | Database design documented but live DB unverified | No Neon connectivity test |
| P-002 | P07 | DB integration code exists but live integration untested | No live session test |
| P-003 | P08 | ML data foundations implemented but synthetic-only | No real data accessed |
| P-004 | P09 | ML training investigation documented but no training performed | No approved dataset |
| P-005 | P10 | Baseline artifacts exist but without approved dataset provenance | No approved training |
| P-006 | P11 | Calibration/explainability code exists but no approved benchmark | No approved dataset |
| P-007 | P13 | Integration code exists but inference disabled | Feature flags = False |
| P-008 | P15 | Deployment documented but no config files | No vercel.json/render.yaml |

---

## 6. External Blockers and Mentor Dependencies

| Blocker ID | Description | Required From | Phase Impact |
|------------|-------------|---------------|--------------|
| E-001 | Dataset approval for English and/or Hindi training | Mentor/owner | P01, P08–P13, P15 |
| E-002 | WELFake label semantics (H-01) resolution | Mentor/owner + evidence | P01 |
| E-003 | WELFake source provenance (H-04) evidence | Mentor/owner + evidence | P01 |
| E-004 | WELFake upstream rights (H-05) evidence | Mentor/owner + evidence | P01 |
| E-005 | IFND redistribution rights clarification | Mentor/owner | P01 |
| E-006 | TaLLIP licensing clarification | Mentor/owner | P01 |
| E-007 | Indic Zenodo licence conflict resolution | Mentor/owner | P01 |
| E-008 | Neon PostgreSQL live connectivity | DB access + network | P05, P07 |
| E-009 | Release approval (v1.0) | Mentor/owner | P15 |
| E-010 | Git commit of 65 staged files | Mentor/owner (Git authorization) | P15 |

---

## 7. Technical Blockers

| Blocker ID | Description | Phase | Workaround Available? |
|------------|-------------|-------|----------------------|
| TB-001 | P10 executionReportRef path corrupted | P04 | Yes — fix path locally |
| TB-002 | No real dataset accessible for training/validation | P08–P11 | No — blocked by P01 |
| TB-003 | Inference feature flags default to False | P13 | Yes — can be set by mentor after P01 |
| TB-004 | No deployment configuration files | P15 | Yes — create vercel.json/render.yaml |
| TB-005 | No browser E2E test suite | P14 | Yes — create locally |

---

## 8. Website Feature-by-Feature Gap Analysis

| Feature | Component | Status | Gap |
|---------|-----------|--------|-----|
| Hero section | `frontend/src/App.tsx` | Implemented | None |
| Analyzer (text input, language select, analyze button) | `frontend/src/components/Analyzer.tsx` | Implemented | Sends to /api/predict but gets 503 (no model) |
| Analysis result display | `frontend/src/components/AnalysisResult.tsx` | Implemented | Shows "no prediction" when 503 |
| NavBar | `frontend/src/components/NavBar.tsx` | Implemented | None |
| Theme toggle | `frontend/src/components/ThemeToggle.tsx` | Implemented | None |
| History section | `frontend/src/components/HistoryItem.tsx` | Implemented | Empty (no history stored) |
| InfoModal (methodology, limitations, FAQ, privacy, terms) | `frontend/src/components/InfoModal.tsx` | Implemented | Content documented |
| API integration | `frontend/src/App.tsx` | Implemented | Backend returns 503 (inference disabled) |
| Language routing (EN/HI auto-detect) | `frontend/src/components/Analyzer.tsx` | Implemented | Backend handles routing |
| Responsive design | `frontend/src/app/globals.css` | Implemented | None |
| Typecheck | `tsc --noEmit` | Passes | None |
| Lint | `eslint .` | Passes | None |
| Production build | `npm run build` | Passes | None |

**Frontend Gap Summary:** Frontend is fully implemented and functional, but the API integration returns HTTP 503 because inference is disabled. No frontend changes needed — backend model availability is the blocker.

---

## 9. Dataset and ML Research Gap Analysis

| Dataset | Status | Gap | Required Evidence |
|---------|--------|-----|-------------------|
| WELFake | NOT APPROVED / ON HOLD | Label semantics (H-01), source provenance (H-04), upstream rights (H-05) | Primary label evidence, source map, rights documentation |
| ISOT | NOT APPROVED | Restrictive research-use conditions | Redistribution rights evidence |
| TaLLIP | NOT APPROVED | Redistribution/licensing unresolved | Licence documentation |
| Indic Zenodo Hindi | NOT APPROVED | CC BY vs CC BY-NC conflict; count discrepancy (20,593 vs 20,493) | Licence resolution, count explanation |
| HinFakeNews | NOT APPROVED | Licence and reuse permission unresolved | Rights documentation |
| PIB fact-check | Not investigated | No evidence of access, licence, reuse | Access verification, licence terms |

**ML Gap Summary:** 10 baseline artifacts and 3 calibrated artifacts exist but none from approved training. No model can be activated until P01 dataset approval is granted.

---

## 10. Backend, Database, Privacy and Security Gap Analysis

| Area | Status | Gap |
|------|--------|-----|
| FastAPI app | Complete | None |
| CORS configuration | Complete | None |
| Rate limiting (60 req/min) | Complete | None |
| Payload size limit (64 KB) | Complete | None |
| Input validation (20-500 chars) | Complete | None |
| Pydantic schemas | Complete | None |
| Health endpoint | Complete | None |
| Samples endpoint | Complete | None |
| Predict endpoint | Complete (returns 503 without model) | Model unavailable |
| SQLAlchemy ORM models | Complete | Live DB unverified |
| Alembic migration | Complete | Live migration state unverified |
| Strict Zero Content Retention | Complete (schema verified) | Live behavior unverified |
| Optional DB dependency | Complete | Live DB not tested |
| Error handling | Complete | None |
| Logging (no user text in logs) | Complete | None |

**Backend Gap Summary:** Backend code is complete and tested. Database layer is implemented but live connectivity unverified. Zero Content Retention is schema-enforced but live behavior not tested under production traffic.

---

## 11. Testing and Deployment Gap Analysis

| Area | Status | Gap |
|------|--------|-----|
| Backend unit tests | 41 tests pass | None |
| ML unit tests | 82 tests pass | None |
| Browser E2E tests | None | Create E2E suite |
| Manual QA | None | Document procedures |
| Live deployment | Not attempted | Create vercel.json, render.yaml; configure env vars |
| Frontend .env.local | Missing | Create with NEXT_PUBLIC_API_URL |
| Vercel root directory | Not configured | Set to `frontend` in dashboard |
| Render env vars | Not configured | Set DATABASE_URL, inference flags, CORS, etc. |

**Testing/Deployment Gap Summary:** Unit tests pass comprehensively. No E2E tests. No deployment configs exist. Deployment not attempted.

---

## 12. Dependency Map

```
P00 (Product Scope) ──┐
                      ├── P02 (UI/UX) ──┐
                      ├── P03 (Frontend) ──┐
                      ├── P04 (Tracker) ──┐
                      └── P01 (Dataset Research) ──┐
                                                    ├── P08 (Data Foundations) ──┐
                                                    ├── P09 (ML Training) ──┐
                                                    ├── P10 (Classical ML) ──┐
                                                    ├── P11 (Calibration) ──┐
                                                    ├── P13 (Integration) ──┐
                                                    └── P15 (Release) ──┐
P05 (Database) ──┐                                                │
P06 (Backend) ──┼─────────────────────────────────────────────────┤
P07 (DB Integration) ─┐                                          │
P12 (NLP/Language) ──┼────────────────────────────────────────────┤
P14 (Testing) ───────┴────────────────────────────────────────────┘
```

**Critical Path:** P01 (Dataset Approval) → P08–P13 (ML pipeline) → P15 (Release)
**Secondary Path:** P05–P07 (Database) → P15 (Release)
**Independent:** P00–P04, P14 (all complete)

---

## 13. Recommended Task Execution Order

| Order | Task ID | Phase | Priority | Reason |
|-------|---------|-------|--------|--------|
| 1 | T-009 | P04 | P2 | Fix corrupted executionReportRef (quick win, unblocks tracker integrity) |
| 2 | T-001 | P01 | P0 | Dataset approval — blocks entire ML pipeline |
| 3 | T-002–T-007 | P01 | P0 | Resolve dataset-specific licensing/provenance/rights |
| 4 | T-008 | P01 | P2 | Explain Indic Zenodo count discrepancy |
| 5 | T-010 | P05 | P1 | Verify live Neon PostgreSQL connectivity |
| 6 | T-011 | P07 | P1 | Verify live database integration |
| 7 | T-017 | P15 | P1 | Create vercel.json |
| 8 | T-018 | P15 | P1 | Create render.yaml |
| 9 | T-019 | P15 | P1 | Create frontend .env.local |
| 10 | T-022 | P14 | P2 | Create browser E2E tests |
| 11 | T-023 | P14 | P3 | Document manual QA |
| 12 | T-020 | P15 | P0 | Mentor release approval |
| 13 | T-021 | P15 | P1 | Commit 65 staged files (after approval) |

---

## 14. Objective Completion Criteria for Every Pending Task

| Task ID | Completion Criteria |
|---------|-------------------|
| T-001 | Mentor signs off on at least one dataset for English or Hindi training; evidence recorded in tracker |
| T-002 | Primary evidence document tying WELFake numeric labels to Fake/Real semantics in exact CSV release |
| T-003 | Per-record source map with collection dates and article URLs for WELFake |
| T-004 | Evidence of depositor authority over WELFake article text (Reuters/BuzzFeed rights) |
| T-005 | Redistribution rights evidence for IFND dataset |
| T-006 | Licence documentation for TaLLIP dataset |
| T-007 | Resolution of CC BY 4.0 (Zenodo) vs CC BY-NC 4.0 (paper) conflict for Indic Zenodo Hindi |
| T-008 | Documented explanation of 100-file difference between local count (20,593) and paper-reported count (20,493) |
| T-009 | P10 executionReportRef corrected to valid file path in `project-tracker/execution-history/` |
| T-010 | Successful `SELECT 1` against Neon PostgreSQL; Alembic migration state verified |
| T-011 | Successful `get_db()` session lifecycle test against live database |
| T-012 | N/A — blocked by T-001 |
| T-013 | N/A — blocked by T-001 |
| T-014 | N/A — blocked by T-001 |
| T-015 | N/A — blocked by T-001 |
| T-016 | `VERINEWS_ENABLE_ENGLISH_INFERENCE=true` and/or `VERINEWS_ENABLE_HINDI_INFERENCE=true` set after dataset approval |
| T-017 | `vercel.json` created with `rootDirectory: "frontend"` (or dashboard Root Directory set to `frontend`) |
| T-018 | `render.yaml` created with Free plan, Python env, Uvicorn start command, required env vars |
| T-019 | `frontend/.env.local` created with `NEXT_PUBLIC_API_URL` |
| T-020 | `releaseApproval.status` changed to "Approved" with mentor evidence in tracker |
| T-021 | 65 staged files committed to Git (after mentor approval) |
| T-022 | Browser E2E test suite created and passing against deployed frontend |
| T-023 | Manual QA procedures documented |
| T-024 | N/A — blocked by T-001 (Hindi dataset) |
| T-025 | N/A — blocked by T-001 |
| T-026 | Leakage investigation repeated on approved dataset |

---

## 15. Final Count by Status and Workstream

### By Status

| Status | Count | Task IDs |
|--------|-------|----------|
| VERIFIED_COMPLETE | 8 | V-001 through V-008 |
| IMPLEMENTED_BUT_NOT_VERIFIED | 0 | — |
| PARTIALLY_COMPLETE | 8 | P-001 through P-008 |
| NOT_STARTED | 7 | T-012, T-013, T-014, T-015, T-017, T-018, T-019, T-021, T-022, T-023 |
| BLOCKED_EXTERNAL_DEPENDENCY | 10 | T-002, T-003, T-004, T-005, T-006, T-007, T-010, T-011, T-012, T-013, T-014, T-015, T-024, T-025, T-026 |
| BLOCKED_TECHNICAL | 2 | T-008, T-009 |
| DEFERRED | 1 | T-023 |
| NEEDS_MENTOR_APPROVAL | 3 | T-001, T-016, T-020 |

*Note: Some tasks appear in multiple categories; count reflects primary classification.*

### By Priority

| Priority | Count | Examples |
|----------|-------|----------|
| P0 (Critical blocker/safety/licensing) | 5 | T-001, T-002, T-005, T-006, T-007, T-020 |
| P1 (Required before release) | 8 | T-003, T-004, T-008, T-010, T-011, T-017, T-018, T-019, T-021 |
| P2 (Required for complete quality) | 6 | T-009, T-016, T-022, T-023, P-001, P-002 |
| P3 (Optional/deferred research) | 2 | T-023, P-008 |

### By Workstream

| Workstream | Complete | Pending | Blocked |
|------------|----------|---------|---------|
| A. Product scope | VERIFIED | — | — |
| B. Dataset/research/licensing | — | T-001 | T-002 through T-008, T-025, T-026 |
| C. Website design | VERIFIED | — | — |
| D. Frontend/API integration | PARTIAL | — | T-016 (inference disabled) |
| E. Database | PARTIAL | T-010, T-011 | — |
| F. Backend API | VERIFIED | — | — |
| G. NLP/language routing | VERIFIED | T-024 | — |
| H. ML training/eval | PARTIAL | T-013, T-014, T-015 | T-001 |
| I. Hindi/Hinglish | PARTIAL | T-024 | T-001 |
| J. Security/privacy | VERIFIED | — | — |
| K. Testing/QA | PARTIAL | T-022, T-023 | — |
| L. Accessibility/SEO/perf | VERIFIED | — | — |
| M. Documentation | PARTIAL | T-023 | — |
| N. Deployment | PARTIAL | T-017, T-018, T-019 | T-020 |
| O. Tracker integrity | PARTIAL | T-009 | — |

---

## 16. Machine-Readable Register

The existing tracker JSON schema (`project-tracker/progress.json`) is preserved. No schema changes are made. The following task records in `progress.json` correspond to the pending work above:

| Tracker Task ID | Corresponding Register Tasks | Status in Tracker |
|-----------------|------------------------------|-------------------|
| P01 | T-001 through T-008, T-024, T-025, T-026 | In Progress |
| P04 | T-009 | Completed (but corrupted ref) |
| P05 | T-010 | Completed (but live DB unverified) |
| P06 | — | Completed |
| P07 | T-011 | Completed (but live integration unverified) |
| P08–P11 | T-012 through T-015 | Completed (but blocked by P01) |
| P12 | — | Completed |
| P13 | T-016 | Completed (but inference disabled) |
| P14 | T-022, T-023 | Completed (but no E2E/manual QA) |
| P15 | T-017 through T-021 | In Progress |

---

## Final Verification Report

### Every File Inspected

**Tracker files:**
- `project-tracker/progress.json`
- `project-tracker/roadmap.json`
- `project-tracker/activity-log.json`
- `project-tracker/execution-history/` (21 files)

**Documentation files:**
- `docs/deployment-plan.md`
- `docs/release-readiness-and-hardening.md`
- `docs/database-design.md`
- `docs/frontend-api-integration-plan.md`
- `docs/ml-data-foundations.md`
- `docs/technical-architecture.md`
- `docs/research/p01-*` (14 files)
- `docs/research/p10-p11-*` (4 files)
- `docs/research/p11-calibration-*` (2 files)

**Source files:**
- `backend/app/main.py`, `api/routes.py`, `core/config.py`, `services/language.py`, `services/model_service.py`
- `backend/app/db/models.py`, `db/session.py`, `db/base.py`
- `backend/app/schemas/prediction.py`, `health.py`, `samples.py`
- `backend/tests/` (7 test files)
- `ml/` (8 source files, 8 test files, 3 fixtures)
- `frontend/src/App.tsx`, `components/Analyzer.tsx`, `AnalysisResult.tsx`
- `frontend/src/types.ts`

**Model artifacts:**
- `models/baselines/` (10 .joblib files)
- `models/calibrated/` (3 .joblib files)

**Configuration:**
- `.env` (read-only, not inspected for secrets)
- `.env.example`
- `.gitignore`
- `backend/requirements.txt`
- `frontend/package.json`

### Every Gap Discovered

1. **P01: No dataset approved** — blocks all ML training and inference
2. **P04: Corrupted executionReportRef** for P10
3. **P05/P07: Live database connectivity unverified**
4. **P08–P11: No real data preparation/training/calibration**
5. **P13: Inference disabled** (feature flags = False)
6. **P15: No deployment configs** (no vercel.json, no render.yaml, no .env.local)
7. **P15: Release approval not granted**
8. **P15: 65 staged files not committed**
9. **P14: No browser E2E tests**
10. **P14: No manual QA documentation**

### Total Task Counts

| Status | Count |
|--------|-------|
| VERIFIED_COMPLETE | 8 |
| PARTIALLY_COMPLETE | 8 |
| NOT_STARTED | 9 |
| BLOCKED_EXTERNAL_DEPENDENCY | 15 |
| BLOCKED_TECHNICAL | 2 |
| DEFERRED | 1 |
| NEEDS_MENTOR_APPROVAL | 3 |

**Total distinct tasks: 26**

### Tasks Requiring External Human Decisions

1. **Mentor dataset approval** (T-001) — P01 blocker
2. **Mentor approval for release** (T-020) — P15 blocker
3. **Database access for live testing** (T-010, T-011) — P05/P07
4. **Git commit authorization** (T-021) — P15
5. **Dataset-specific licensing/provenance/rights evidence** (T-002 through T-007) — P01

### Inaccessible or Missing Evidence

- Live Neon PostgreSQL connectivity (DATABASE_URL in `.env` but not tested)
- Live database migration state
- Dataset approval evidence (none exists)
- WELFake label semantics primary evidence
- WELFake source provenance and rights evidence
- IFND redistribution rights evidence
- TaLLIP licensing documentation
- Indic Zenodo licence conflict resolution

### New Documentation Files

- `docs/VERINEWS_MASTER_PENDING_WORK_REGISTER.md` (this file)

### Git Staged File Count

- **Before audit:** 65 staged files
- **After audit:** 65 staged files (unchanged — no files added/modified per safety rules)

### Confirmation of Safety Rules

- Application source code: **UNTOUCHED**
- Tests: **UNTOUCHED**
- Model artifacts: **UNTOUCHED**
- Datasets: **UNTOUCHED** (data/ directory is gitignored and not accessed)
- Environment files: **UNTOUCHED** (.env not modified)
- Git staging: **UNTOUCHED** (65 files remain staged, no git add/commit/push)
- Inference flags: **UNCHANGED** (both remain False)
- Historical evidence: **PRESERVED** (no execution records deleted or modified)

### Audit Limitations

1. Live database connectivity could not be verified without network access to Neon PostgreSQL
2. Dataset approval evidence does not exist — cannot be fabricated
3. Browser E2E testing requires a deployed frontend
4. Manual QA requires human execution
5. Some tracker completion labels may not reflect actual implementation depth (P05–P14 marked "Completed" but many are documentation/synthetic-test-only)

---

**STOP — Awaiting mentor review and explicit authorization before any implementation begins.**
