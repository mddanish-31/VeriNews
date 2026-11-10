# VeriNews — P15 Formal Mentor Review Package
**Reliability Improvements, Error Hardening, and Browser-Level E2E Verification**

- **Document Version**: 1.1.0 (Audited & Qualified)
- **Audited Date**: 2026-11-10
- **Lifecycle Phase**: P15 — Deployment, Documentation, and v1.0 Release Hardening (Pre-Deployment Review)
- **Review Status**: **Pending Mentor Review** (NOT authorized for public release or production deployment)
- **Repository Root**: `C:\Users\mddan\Desktop\VeriNews`

---

## A. Project Overview and System Scope

### 1. Purpose and Scope
VeriNews is an experimental, research-oriented multilingual Natural Language Processing (NLP) and Machine Learning (ML) platform designed to detect stylistic, linguistic, and lexical patterns associated with potentially misleading news claims and headlines. The system evaluates short news text (20–500 characters) across **English (Latin script)** and **Hindi (Devanagari script)**.

VeriNews is deliberately engineered as an educational and analytical tool that emphasizes **transparency, calibrated uncertainty, and explainability**. It is **not** an automated arbiter of factual truth and does not perform real-time external web fact-checking.

### 2. Language Inference Availability Status
- **English Inference**: A trained, calibrated scikit-learn model artifact exists (`en_ifnd_indian_headlines_calibrated_sigmoid`). Technical local inference is functional when temporarily enabled in-process for tests. However, in repository configuration, public inference is **disabled by default** (`ENABLE_ENGLISH_INFERENCE = false`) pending formal mentor authorization.
- **Hindi Inference**: An experimental candidate model artifact exists (`hi_tallip_hindi_headlines_calibrated_sigmoid`). However, Hindi inference is **strictly disabled** behind an HTTP 503 service gate (`ENABLE_HINDI_INFERENCE = false`) because the underlying dataset provenance, redistribution terms, and licensing have not been approved by the mentor/owner (Task P01). VeriNews never fabricates synthetic predictions when the model is gated.
- **Romanized Hindi (Hinglish)**: Colloquial Hindi written in Latin script is **unsupported**. It is actively detected and rejected with an actionable HTTP 422 validation response directing users to enter Devanagari script.

### 3. Architecture and Data Flow

```
[ Client Browser: Next.js 16 / React 19 UI (Port 3000) ]
   ├── Client Storage: Theme preference only in localStorage ('verinews-theme')
   └── Zero Client Persistence: No headlines, predictions, or tokens stored
                       │
             HTTP / JSON (REST API)
                       ▼
[ Backend API: FastAPI / ASGI Server (Uvicorn, Port 8000) ]
   ├── Request Validation: Pydantic v2 (20–500 chars, loc/msg sanitized)
   ├── Rate Limiting: In-memory IP timestamp window (60 req/min, no body logging)
   ├── Language & Script Routing: Devanagari vs. Latin vs. Romanized Hindi
   ├── Safety & Licensing Gates: Independent English/Hindi activation flags
   └── Model Service Dispatcher: Transient CPU-bound in-memory inference
           │
           ├── English Pipeline: IFND Calibrated Platt Sigmoid (Word n-grams)
           ├── Hindi Pipeline: TaLLIP Calibrated Platt Sigmoid (Char n-grams) [Gated 503]
           └── Explainability: In-Memory TFIDFExplainer (Local Lexical Attribution)
                       │
[ Database Layer: PostgreSQL / SQLAlchemy / Alembic (Decoupled at Runtime) ]
   ├── Schema Invariants: models.Analysis omits article text, tokens, and hashes
   └── Runtime Behavior: /api/predict performs zero database writes (read/write dormant)
```

- **Frontend**: Next.js 16.4.5 (Turbopack, React 19, Tailwind CSS, TypeScript).
- **Backend API**: FastAPI 0.115+, Pydantic v2 validation, Uvicorn ASGI server (Python 3.14).
- **Database Layer**: PostgreSQL with SQLAlchemy 2.0 and Alembic migrations. The database schema enforces a strict Zero Content Retention design; at runtime, the prediction route does not perform database writes.
- **Machine Learning Core**: Scikit-learn linear classifiers (LinearSVC, LogisticRegression, Platt CalibratedClassifierCV), TfidfVectorizer.
- **Explainability**: Custom in-memory `TFIDFExplainer` computing signed lexical token contributions ($w_i \cdot \text{TF-IDF}_i$) accompanied by non-dismissible Responsible AI disclaimers.

---

## B. P15 Implementation Summary

During Phase P15, seven focused reliability, safety, and UX defects were resolved in application code:

### 1. Romanized Hindi (Hinglish) Detection and Rejection
- **Problem Addressed**: Colloquial Hindi written in Latin script (e.g., *"kya yeh sach hai bhai sarkar ne naya aadesh jaari kiya hai"*) bypassed Latin script validation and was silently routed to the English model, producing misleading predictions on out-of-domain vocabulary.
- **Implementation**: Implemented `is_likely_romanized_hindi()` in [`backend/app/services/language.py`](file:///C:/Users/mddan/Desktop/VeriNews/backend/app/services/language.py) utilizing a curated set of 45 high-specificity Indic words (`ROMANIZED_HINDI_INDIC_WORDS`). Requires $\ge 3$ distinct Indic matches to avoid false-flagging English headlines containing isolated loanwords or proper nouns.
- **Expected Behavior**: Automatically detects Romanized Hindi in auto mode or when `language_hint="hi"` is paired with Latin script, returning an actionable HTTP 422:
  > *"Romanized Hindi (Hinglish) is not supported yet. Please enter Hindi using Devanagari script."*
- **Verification Evidence**:
  - Unit tests: `test_romanized_hindi_rejected_in_auto_mode` and `test_legitimate_english_not_rejected_as_romanized_hindi` in [`backend/tests/test_frontend_integration.py`](file:///C:/Users/mddan/Desktop/VeriNews/backend/tests/test_frontend_integration.py) (PASS).
  - Browser E2E: Scenario 3 (`scenario-3-roman-hindi-rejection.png`) and Scenario 4 (`scenario-4-legit-english-preserved.png`).

### 2. Zero-Vocabulary and Unclassifiable Input Handling
- **Problem Addressed**: When submitted text contained zero tokens matching the trained vectorizer vocabulary, the feature vector was entirely zero ($X_{vec} = \mathbf{0}$). In linear models, this evaluated purely to the intercept $b$. When passed through Platt calibration, this intercept produced synthetic, high-confidence "Credible" predictions (~86.4%) on random gibberish (e.g. `xyzabc qwerasdf...`).
- **Implementation**: Added feature density validation `if X_vec.nnz == 0:` in [`backend/app/services/model_service.py`](file:///C:/Users/mddan/Desktop/VeriNews/backend/app/services/model_service.py). When zero in-vocabulary features are present, the classifier is bypassed entirely.
- **Expected Behavior**: Returns HTTP 200 with `prediction_label="Unclassifiable"`, `is_credible=None`, `confidence_score=None`, `confidence_tier="Unclassifiable / Out of Domain"`, `influential_tokens=[]`, and an explanatory disclaimer.
- **Verification Evidence**:
  - Unit tests: `test_zero_vocabulary_returns_unclassifiable` in [`backend/tests/test_frontend_integration.py`](file:///C:/Users/mddan/Desktop/VeriNews/backend/tests/test_frontend_integration.py) (PASS).
  - API regression: Test 7 in [`scripts/test_frontend_api_integration.mjs`](file:///C:/Users/mddan/Desktop/VeriNews/scripts/test_frontend_api_integration.mjs) (PASS).
  - Browser E2E: Scenario 2 (`scenario-2-unclassifiable-gibberish.png`) and Scenario 11 (`scenario-11-unclassifiable-visuals.png`).

### 3. Explanation and Stop-Word Filtering Improvements
- **Problem Addressed**: The English IFND candidate vectorizer was trained without stop-word filtering, causing common grammatical tokens (`the`, `is`, `and`, `has`, `in`) to acquire non-zero coefficients and dominate top-$k$ feature explanations.
- **Implementation**: Implemented post-hoc stop-word filtering in [`ml/explainability.py`](file:///C:/Users/mddan/Desktop/VeriNews/ml/explainability.py) (`_is_uninformative`) using comprehensive English and Hindi stop-word lexicons (`ENGLISH_UNINFORMATIVE_STOP_WORDS`, `HINDI_UNINFORMATIVE_STOP_WORDS`). Filtered unigrams and all-stop-word n-grams. Added character n-gram disclaimer explaining subword morphological attribution. If an input contains exclusively stop words, returns `influential_features=[]` with an honest fallback note.
- **Expected Behavior**: Only topical, substantive content words appear as influential features; purely grammatical sentences return an informative fallback note rather than arbitrary stop-word rankings.
- **Verification Evidence**:
  - Unit tests: `test_explanation_filters_uninformative_stop_words` in [`backend/tests/test_frontend_integration.py`](file:///C:/Users/mddan/Desktop/VeriNews/backend/tests/test_frontend_integration.py) (PASS).
  - Browser E2E: Scenario 1 (`scenario-1-english-headline.png`) verifying `the` is omitted and substantive tokens (`council`, `expected`, `library`) are highlighted.

### 4. Frontend Request Race-Condition Protection
- **Problem Addressed**: When an analysis request was in flight and the user clicked Clear, the eventual late HTTP response rendered over the cleared inputs, causing stale results to appear over an empty form.
- **Implementation**: Introduced a request sequencing ref `latestRequestId = useRef(0)` in [`frontend/src/App.tsx`](file:///C:/Users/mddan/Desktop/VeriNews/frontend/src/App.tsx). Clicking Clear increments this sequence ID; pending `fetch` promises compare their captured ID against `latestRequestId.current` before updating state.
- **Expected Behavior**: Late-arriving responses from superseded or cleared requests are silently discarded.
- **Verification Evidence**:
  - API regression: Test 9 in [`scripts/test_frontend_api_integration.mjs`](file:///C:/Users/mddan/Desktop/VeriNews/scripts/test_frontend_api_integration.mjs) (PASS).
  - Browser E2E: Scenario 9 (`scenario-9-race-condition-guard.png`).

### 5. Clear Button and Input Validation State Reset
- **Problem Addressed**: The Clear button previously only cleared the local textarea state, leaving active analysis results, validation errors, and API error banners visible on screen. Furthermore, the character counter measured raw string length rather than non-whitespace trimmed length.
- **Implementation**: Updated [`frontend/src/components/Analyzer.tsx`](file:///C:/Users/mddan/Desktop/VeriNews/frontend/src/components/Analyzer.tsx) to accept `onClear?: () => void`. Modified `clearText()` to clear the textarea, reset validation errors, and invoke `onClear()`, which resets `analysisResult` and `notice` in `App.tsx`. Updated the counter to measure `trimmedText.length` with threshold guidance (*"Add X more characters to reach the 20-character headline minimum"*).
- **Expected Behavior**: Single-click atomic reset of all user inputs, counters, validation notices, API banners, and result cards.
- **Verification Evidence**:
  - Browser E2E: Scenario 8 (`scenario-8-clear-button-resets-all.png`) and Scenario 10 (`scenario-10-character-counter-validation.png`).

### 6. Hindi Inference Safety Gate
- **Problem Addressed**: Hindi dataset provenance and licensing remain unapproved (Task P01). Uncalibrated public Hindi inference must be prevented.
- **Implementation**: Default application settings maintain `ENABLE_HINDI_INFERENCE = false`. The prediction route in [`backend/app/api/routes.py`](file:///C:/Users/mddan/Desktop/VeriNews/backend/app/api/routes.py) intercepts Hindi requests when disabled and raises `ModelUnavailableException`.
- **Expected Behavior**: Returns HTTP 503 with exact, transparent messaging:
  > *"The Hindi model service is not available. Hindi model inference is currently disabled pending dataset licensing and deployment clearance. VeriNews never fabricates synthetic predictions."*
- **Verification Evidence**:
  - Pytest: `test_independent_gating_english_enabled_hindi_disabled` in [`backend/tests/test_p14_hardening.py`](file:///C:/Users/mddan/Desktop/VeriNews/backend/tests/test_p14_hardening.py) (PASS).
  - Live smoke test: [`scripts/test_local_hindi_smoke_test.py`](file:///C:/Users/mddan/Desktop/VeriNews/scripts/test_local_hindi_smoke_test.py) Step 1 & Step 9 (PASS).
  - Browser E2E: Scenario 5 (`scenario-5-hindi-disabled-503.png`).

### 7. Correct User-Facing Status Messages
- **Problem Addressed**: Previous error handling rendered raw JSON objects, technical validation stack traces, or generic failure codes to users.
- **Implementation**: Standardized error response handling in [`frontend/src/App.tsx`](file:///C:/Users/mddan/Desktop/VeriNews/frontend/src/App.tsx) to parse `detail` strings or arrays cleanly into user-facing alert notices.
- **Expected Behavior**: Clean, human-readable notifications in the alert banner without exposing internal server traces or raw JSON schema syntax.
- **Verification Evidence**:
  - API regression: Tests 4, 5, 8 in [`scripts/test_frontend_api_integration.mjs`](file:///C:/Users/mddan/Desktop/VeriNews/scripts/test_frontend_api_integration.mjs) (PASS).
  - Browser E2E: Scenarios 3, 5, 6, 7.

---

## C. Testing and Verification Evidence

All test claims are mapped to explicit execution records and artifacts in the repository.

### 1. Test Verification Matrix

| Verification Tier | Command / Execution Script | Status Label | Result | Details / Execution Reference |
| :--- | :--- | :--- | :--- | :--- |
| **Backend Unit & Integration Suite** | `.venv\Scripts\python.exe -m pytest -W default -ra` | **Reported from Execution Record** | **PASS (102/102)** | 102 passed, 1 warning (`StarletteDeprecationWarning`), 0 failures in 17.08s. Recorded in [`project-tracker/execution-history/exec-20261110070023910-d6a82860.json`](file:///C:/Users/mddan/Desktop/VeriNews/project-tracker/execution-history/exec-20261110070023910-d6a82860.json). |
| **Frontend Static Typecheck** | `npm --prefix frontend run typecheck` | **Reported from Execution Record** | **PASS (0 Errors)** | TypeScript `tsc --noEmit` exited with code 0. Recorded in `exec-20261110070023910-d6a82860.json`. |
| **Frontend Linter** | `npm --prefix frontend run lint` | **Reported from Execution Record** | **PASS (0 Errors)** | ESLint 9+ exited with code 0 (zero errors/warnings). Recorded in `exec-20261110070023910-d6a82860.json`. |
| **Frontend Production Build** | `npm --prefix frontend run build` | **Reported from Execution Record** | **PASS (3/3 Routes)** | Next.js 16.4.5 Turbopack production build completed with exit code 0. Recorded in `exec-20261110070023910-d6a82860.json`. |
| **API Integration Regression** | `node scripts/test_frontend_api_integration.mjs` | **Verified Script & Recorded Result** | **PASS (9/9)** | 9 automated HTTP checks covering URL resolution, payload formatting, 503 gating, 422 Hinglish, 200 Unclassifiable, and race-condition sequencing. |
| **Live Local English Inference** | `python scripts/test_local_english_inference.py` | **Verified Script & Recorded Result** | **PASS** | Evaluated live candidate model artifact in-memory: HTTP 200, 0.9077 confidence, model version verified, HTTP 503 restored upon completion. |
| **Controlled Hindi Smoke Test** | `python scripts/test_local_hindi_smoke_test.py` | **Verified Script & Recorded Result** | **PASS (5/5 Cases)** | Verified default 503 gate, temporary in-process memory activation, 2 Devanagari headlines, empty/short input validation, script mismatch, and 503 restoration. |
| **Browser E2E Automated Suite** | `node scripts/verify_e2e_full_browser.mjs` | **Verified Script & Recorded Result** | **PASS (12/12)** | Automated Chrome CDP testing across 12 end-to-end browser scenarios, exiting with code 0. |
| **Visual Screenshot Audit** | Direct inspection of all 13 PNG files | **Independently Verified** | **PASS (13/13)** | All 13 screenshots visually inspected via `read_file`; confirmed element scroll centering, non-empty files (98 KB – 135 KB). |
| **Browser Client Storage Audit** | Chrome CDP expression evaluation | **Independently Verified** | **PASS** | Evaluated during Scenario 12: `localStorage: []` (or theme), `sessionStorage: []`, `cookies: ""`. |

### 2. Warnings and Resource Audit
- **`StarletteDeprecationWarning`**: `Using httpx with starlette.testclient is deprecated; install httpx2 instead.`
  - **Audit Finding**: Upstream Starlette 0.46+ deprecation notice. Per project safety constraints, dependencies remain pinned without forcing unvalidated package updates. No functional or runtime impact.
- **`psycopg.Connection ResourceWarning`**: **Qualified**.
  - **Investigation**: In earlier development (recorded in [`project-tracker/execution-history/exec-20261109170845778-6718405f.json`](file:///C:/Users/mddan/Desktop/VeriNews/project-tracker/execution-history/exec-20261109170845778-6718405f.json)), session and connection fixtures in [`backend/tests/test_database.py`](file:///C:/Users/mddan/Desktop/VeriNews/backend/tests/test_database.py) were hardened with explicit `connection.close()` and `engine.dispose()` calls, resolving connection leaks during active database test runs.
  - **Current Test Execution State**: In standard offline test runs (102 tests), live PostgreSQL tests are skipped via `pytest.skip("DATABASE_URL is not set...")` because no database is configured. Consequently, database connection fixtures do not execute, resulting in zero `ResourceWarning`s emitted during offline runs. Persistent pool teardown in a live multi-worker PostgreSQL deployment remains dependent on runtime environment configuration and has not been verified under load.

### 3. Raw Log Availability Disclosure
- Test executions and check results were captured directly into structured JSON execution records under [`project-tracker/execution-history/`](file:///C:/Users/mddan/Desktop/VeriNews/project-tracker/execution-history/) rather than persisted as separate plaintext `.log` files. No raw terminal stdout text files exist on disk for the completed test suites; their results are verified via the signed OpenCode execution history records.

---

## D. Browser E2E Screenshot Inventory

All 13 screenshot artifacts were captured via Chrome DevTools Protocol (CDP) on dedicated port 9876 with viewports scrolled directly to the target UI component. All files exist in [`scripts/screenshots/`](file:///C:/Users/mddan/Desktop/VeriNews/scripts/screenshots/) and were individually verified.

```
scripts/screenshots/
├── scenario-1-english-headline.png              (129,674 bytes) [Independently Verified]
├── scenario-2-unclassifiable-gibberish.png      (126,099 bytes) [Independently Verified]
├── scenario-3-roman-hindi-rejection.png          (99,295 bytes) [Independently Verified]
├── scenario-4-legit-english-preserved.png       (131,885 bytes) [Independently Verified]
├── scenario-5-hindi-disabled-503.png            (100,006 bytes) [Independently Verified]
├── scenario-6-english-with-hindi-hint.png       (103,647 bytes) [Independently Verified]
├── scenario-7-hindi-with-english-hint.png        (98,308 bytes) [Independently Verified]
├── scenario-8-clear-button-resets-all.png       (109,949 bytes) [Independently Verified]
├── scenario-9-race-condition-guard.png          (110,043 bytes) [Independently Verified]
├── scenario-10-character-counter-validation.png (104,408 bytes) [Independently Verified]
├── scenario-11-unclassifiable-visuals.png       (126,099 bytes) [Independently Verified]
├── scenario-12-desktop-1280x800.png             (102,233 bytes) [Independently Verified]
└── scenario-12-mobile-375x667.png               (135,625 bytes) [Independently Verified]
```

### Detailed Artifact Visual Verification Log

1. **`scenario-1-english-headline.png`** (129,674 bytes) — **Independently Verified**
   - **Rendered State**: Centered on `ANALYSIS RESULT` card.
   - **Elements Observed**: Green indicator dot, `Credible` badge, `Moderate Confidence Pattern`, model confidence `82%`, model version `en_ifnd_indian_headlines_calibrated_sigmoid`, gradient confidence bar (82%), `English`, latency `27.02 ms`, top 5 influential features (`expected`, `new`, `council`, `begin`, `approved`), linguistic context, and non-dismissible disclaimer. Pure stop-word `the` is confirmed excluded.
2. **`scenario-2-unclassifiable-gibberish.png`** (126,099 bytes) — **Independently Verified**
   - **Rendered State**: Centered on `Domain Scope Assessment` card.
   - **Elements Observed**: Neutral muted dot (`bg-content-muted`), `Unclassifiable / Out of Domain` headline, confidence assessment `Not applicable` (no percentage), zero green/yellow badges, zero progress bars, out-of-domain vocabulary note, and explanatory disclaimer.
3. **`scenario-3-roman-hindi-rejection.png`** (99,295 bytes) — **Independently Verified**
   - **Rendered State**: Centered on status alert banner above Analyzer card.
   - **Elements Observed**: Alert banner stating *"Romanized Hindi (Hinglish) is not supported yet. Please enter Hindi using Devanagari script."*, textarea with 72 characters of Hinglish text, and counter `72 / 500 characters`.
4. **`scenario-4-legit-english-preserved.png`** (131,885 bytes) — **Independently Verified**
   - **Rendered State**: Centered on genuine English prediction result card.
   - **Elements Observed**: `Credible` pattern, `High Confidence Pattern`, `98%` confidence bar, top tokens (`major`, `new`, `announces`, `package`), confirming legitimate English headlines are not falsely flagged as Hinglish.
5. **`scenario-5-hindi-disabled-503.png`** (100,006 bytes) — **Independently Verified**
   - **Rendered State**: Centered on gated status alert banner above Analyzer card.
   - **Elements Observed**: Alert banner stating *"The Hindi model service is not available. Hindi model inference is currently disabled pending dataset licensing and deployment clearance. VeriNews never fabricates synthetic predictions."*
6. **`scenario-6-english-with-hindi-hint.png`** (103,647 bytes) — **Independently Verified**
   - **Rendered State**: Centered on script mismatch status alert banner.
   - **Elements Observed**: Alert banner stating *"Hindi was specified as the language hint, but the text contains no Devanagari characters. Romanized Hindi (Hinglish) is not supported yet. Please enter Hindi using Devanagari script."*
7. **`scenario-7-hindi-with-english-hint.png`** (98,308 bytes) — **Independently Verified**
   - **Rendered State**: Centered on script mismatch status alert banner.
   - **Elements Observed**: Alert banner stating *"English was specified as the language hint, but the text contains no Latin characters. Please provide English text in Latin script."*
8. **`scenario-8-clear-button-resets-all.png`** (109,949 bytes) — **Independently Verified**
   - **Rendered State**: Centered on empty Analyzer card after clicking Clear.
   - **Elements Observed**: Empty textarea with default placeholder, counter `0 / 500 characters`, disabled Clear button, and complete absence of notice banners or previous result cards.
9. **`scenario-9-race-condition-guard.png`** (110,043 bytes) — **Independently Verified**
   - **Rendered State**: Centered on empty Analyzer card after delayed response arrives.
   - **Elements Observed**: Confirms that when Clear was clicked during an active in-flight request, the eventual late HTTP response was discarded by `latestRequestId.current`, preserving the clean form.
10. **`scenario-10-character-counter-validation.png`** (104,408 bytes) — **Independently Verified**
    - **Rendered State**: Centered on Analyzer card under validation error.
    - **Elements Observed**: Red textarea border, red validation message *"Add 7 more characters to reach the 20-character headline minimum."*, amber counter `13 / 500 characters (minimum 20 characters required)`, confirming non-whitespace trimmed counting.
11. **`scenario-11-unclassifiable-visuals.png`** (126,099 bytes) — **Independently Verified**
    - **Rendered State**: Centered on unclassifiable visual hierarchy.
    - **Elements Observed**: Demonstrates neutral muted dot (`bg-content-muted`), absence of success/danger dots, absence of gradient progress bar, and presence of out-of-domain vocabulary note.
12. **`scenario-12-desktop-1280x800.png`** (102,233 bytes) — **Independently Verified**
    - **Rendered State**: Desktop resolution (1280×800 viewport).
    - **Elements Observed**: Full desktop navbar with logo, navigation links (`Home`, `Why VeriNews?`, `Analyze`, `History`, `About`), dark mode toggle, `Try the Analyzer →` button, action controls bar, and 3 trust badges across the bottom.
13. **`scenario-12-mobile-375x667.png`** (135,625 bytes) — **Independently Verified**
    - **Rendered State**: Mobile resolution (375×667 viewport).
    - **Elements Observed**: Collapsed mobile navbar with hamburger menu toggle, vertically stacked single-column `Domain Scope Assessment` card, wrapped text, and zero horizontal clipping.

---

## E. Zero Content Retention & Data Handling Audit

To provide complete technical transparency, this section distinguishes between verified application-layer behaviors and operational limitations that remain unverified in production.

### 1. Browser Client Storage Verification — **Independently Verified**
- **Code Inspection**: In [`frontend/src/`](file:///C:/Users/mddan/Desktop/VeriNews/frontend/src/), browser storage is used exclusively for theme preference:
  - `localStorage.getItem('verinews-theme')`
  - `localStorage.setItem('verinews-theme', ...)`
- **Runtime Verification**: In-browser CDP evaluation during automated E2E tests confirmed:
  - `localStorage`: Only theme key present (or empty if not toggled).
  - `sessionStorage`: Completely empty (`[]`).
  - `document.cookie`: Completely empty (`""`).
- **Conclusion**: The frontend client never persists submitted headlines, tokens, language hints, or prediction outputs.

### 2. Backend Route & Inference Layer — **Independently Verified in Code**
- **In-Memory Processing**: The `/api/predict` route in [`backend/app/api/routes.py`](file:///C:/Users/mddan/Desktop/VeriNews/backend/app/api/routes.py) performs transient in-memory inference. Submitted text is vectorized and scored in CPU RAM and returned in a `PredictionResponse` JSON payload.
- **No Database Writes**: Although `db: Optional[Session] = Depends(get_optional_db)` is present in the route signature, `db` is completely unused. No `db.add()`, `db.commit()`, or SQL insert statements exist in `backend/app/api/routes.py`. The database layer is decoupled and dormant during prediction requests.

### 3. Database Schema Design — **Independently Verified in Code & Tests**
- **Model Invariants**: The SQLAlchemy `Analysis` model in [`backend/app/db/models.py`](file:///C:/Users/mddan/Desktop/VeriNews/backend/app/db/models.py) deliberately omits article text (`input_snippet`), raw word tokens, deterministic content hashes (`input_hash`), and feature vectors. It stores non-content operational metadata only (`input_char_length`, `detected_language`, `language_routing_method`, `prediction_label`, `confidence_score`, `model_version`, `latency_ms`).
- **Feedback Invariants**: The `UserFeedback` model omits free-form text comments to prevent accidental ingestion of sensitive text.
- **Unit Test Coverage**: Enforced by `test_schema_zero_content_retention_invariants` in [`backend/tests/test_database.py`](file:///C:/Users/mddan/Desktop/VeriNews/backend/tests/test_database.py).

### 4. Application Logging & Middleware — **Independently Verified in Code**
- **Route Logging**: In [`backend/app/api/routes.py`](file:///C:/Users/mddan/Desktop/VeriNews/backend/app/api/routes.py), the logger records only metadata:
  ```python
  logger.info(
      "Received /api/predict request: char_length=%d, language_hint=%s",
      len(request.text),
      request.language_hint,
  )
  ```
  Submitted news text is never passed to `logger.info`.
- **Rate-Limiting Middleware**: In [`backend/app/main.py`](file:///C:/Users/mddan/Desktop/VeriNews/backend/app/main.py), `security_and_rate_limit_middleware` inspects headers (`content-length`) and tracks caller IP addresses and timestamps (`_request_history`). It does not read, parse, or log request bodies.
- **Validation Error Sanitization**: Pydantic validation errors in `validation_exception_handler` format `loc` and `msg` only, avoiding raw payload echo in responses or log streams.

### 5. What Remains Unverified / Production Operational Qualifications
While the application code does not persist or log user content, absolute Zero Content Retention across all environments cannot be claimed without qualifying the following:
1. **Upstream Reverse Proxies and Edge Routers**: In a live cloud deployment (e.g. Nginx, Cloudflare, AWS ALB, Vercel, or Render), edge servers can log full request payloads or query parameters if access logging or request inspection is enabled upstream. Upstream edge server configurations have not been deployed or audited.
2. **Unhandled Library Exceptions**: While `generic_exception_handler` in `main.py` catches general exceptions and logs `type(exc).__name__` with `exc_info=True`, if a third-party library (e.g., scikit-learn or scipy) raises an internal error containing an excerpt of the input string in its exception message, that message would be written to the server's stderr stream.
3. **Dormant Database Pipeline**: Because `/api/predict` currently performs pure in-memory inference without calling `Analysis`, full lifecycle zero-retention verification under continuous live database writes has not been tested in production.

---

## F. Git and Environment Safety Audit

### 1. Staging Scope Integrity
- **Pre-existing Staged Files**: Exactly **65 files** staged for preview release.
- **Integrity Check**: Verified via `git diff --name-only --cached | Measure-Object -Line`. Exactly 65 files remain staged.
- **Git Actions**: Zero `git add`, `git commit`, `git push`, `git reset`, `git checkout`, or `git stash` operations were executed.

### 2. File Modification Audit
- **P15 Implementation Modifications (Unstaged Working Tree)**:
  - `backend/app/services/language.py`
  - `backend/app/services/model_service.py`
  - `backend/tests/test_frontend_integration.py`
  - `frontend/src/App.tsx`
  - `frontend/src/components/AnalysisResult.tsx`
  - `frontend/src/components/Analyzer.tsx`
  - `frontend/src/types.ts`
  - `ml/explainability.py`
  - `scripts/test_frontend_api_integration.mjs`
  - `project-tracker/progress.json`
  - `project-tracker/roadmap.json`
- **Verification Runner & Artifacts (Untracked)**:
  - `scripts/verify_e2e_full_browser.mjs`
  - `scripts/screenshots/*.png` (13 PNG files)
- **Documentation**:
  - `docs/P15_MENTOR_REVIEW.md` (this review document only)

### 3. Environment & Secrets Safety
- `.env` and `.env.example` were **not modified**.
- Public inference configuration remains disabled:
  - `ENABLE_ENGLISH_INFERENCE = false`
  - `ENABLE_HINDI_INFERENCE = false`
- No secrets, API keys, tokens, or credentials were added to any file or transcript.
- Model artifacts in `models/` and datasets in `data/` were **not modified**.

---

## G. Known Limitations and Risks

1. **Dataset Provenance & Licensing Unresolved (Phase P01)**:
   - Neither IFND nor TaLLIP has received official mentor/owner dataset licensing or redistribution clearance.
   - Public deployment of model weights derived from these datasets cannot proceed without explicit copyright and licensing review.
2. **IFND Source-Label Leakage & Publisher Bias**:
   - As documented in research audits ([`docs/research/p10-p11-model-hardening-and-leakage-investigation-report.md`](file:///C:/Users/mddan/Desktop/VeriNews/docs/research/p10-p11-model-hardening-and-leakage-investigation-report.md)), the raw IFND dataset contains publisher token leakage and publisher-level label homogeneity. While sanitized during experiments, the candidate model reflects stylistic correlation rather than semantic truth.
3. **Hindi TaLLIP Model Not Deployment-Ready**:
   - The candidate Hindi model achieves moderate macro F1 scores and relies on subword character n-grams ($n \in [2, 6]$). While functional for technical smoke tests, it is not sufficiently calibrated or validated for public production use. Hindi inference must remain gated.
4. **Statistical Pattern vs. Empirical Truth**:
   - Linear TF-IDF classifiers evaluate stylistic and lexical token frequency correlations learned from training corpora. A prediction of "Credible" or "Unreliable" does **not** verify whether the factual claims in a headline are empirically true or false.
5. **Feature Attribution Limitations**:
   - Token attribution weights indicate statistical correlation with training labels, not causative proof of veracity. Explanations must always be accompanied by non-dismissible Responsible AI disclaimers directing users to accredited fact-checking organizations.
6. **No Public Release Authorization**:
   - P15 represents pre-deployment reliability hardening and verification. It does NOT authorize public release, staging merges, or production deployment. Public inference flags must remain `false` in production environment variables until formal mentor clearance.

---

## H. Evidence Provenance Register

| Evidence Artifact / Verification Item | Repository-Relative Path | Verification Level | Audit Notes |
| :--- | :--- | :--- | :--- |
| **Backend Unit & Integration Suite** | `project-tracker/execution-history/exec-20261110070023910-d6a82860.json` | **Reported from Execution Record** | 102 passed, 1 Starlette warning. No raw text log on disk. |
| **Frontend Static Typecheck** | `project-tracker/execution-history/exec-20261110070023910-d6a82860.json` | **Reported from Execution Record** | TypeScript `tsc --noEmit` exit code 0. |
| **Frontend Linter** | `project-tracker/execution-history/exec-20261110070023910-d6a82860.json` | **Reported from Execution Record** | ESLint exit code 0. |
| **Frontend Production Build** | `project-tracker/execution-history/exec-20261110070023910-d6a82860.json` | **Reported from Execution Record** | Next.js 16.4.5 Turbopack build exit code 0. |
| **API Integration Regression Suite** | `scripts/test_frontend_api_integration.mjs` | **Verified Script & Recorded Result** | 9/9 automated HTTP tests passing against local backend. |
| **Live Local English Inference Script** | `scripts/test_local_english_inference.py` | **Verified Script & Recorded Result** | In-process temporary enablement; model loads and scores; 503 restored. |
| **Controlled Hindi Smoke Test Script** | `scripts/test_local_hindi_smoke_test.py` | **Verified Script & Recorded Result** | 5/5 cases passed; in-process enablement; 503 gate restored. |
| **Automated Browser E2E Runner** | `scripts/verify_e2e_full_browser.mjs` | **Verified Script & Recorded Result** | 12 browser scenarios automated via Chrome DevTools Protocol; exit code 0. |
| **Browser Visual Screenshots (13 files)** | `scripts/screenshots/*.png` | **Independently Verified** | All 13 PNG files visually inspected; non-empty (98 KB – 135 KB); target element scrolled to center. |
| **Browser Client Storage Invariants** | `scripts/verify_e2e_full_browser.mjs` (Scenario 12) | **Independently Verified** | In-browser CDP expression confirmed `localStorage: []` (or theme), `sessionStorage: []`, `cookies: ""`. |
| **Backend Zero Retention Invariants** | `backend/app/api/routes.py`, `backend/app/db/models.py` | **Independently Verified in Code** | Code audit confirmed `/api/predict` performs no DB writes, logs only `char_length`/`language_hint`, and `Analysis` omits content columns. |
| **Upstream Reverse Proxy / Cloud Logs** | N/A (Production edge infrastructure) | **Not Independently Verified** | Reverse proxy / cloud access logs have not been deployed or audited in a live cloud environment. |
| **Live Multi-Worker Database Pool Teardown** | `backend/tests/test_database.py` | **Qualified** | Connection cleanup implemented in fixtures, but live tests skipped offline when `DATABASE_URL` is omitted. |

---

## I. Mentor Review Checklist

This checklist is provided for the project mentor/owner to evaluate Phase P15 deliverables.

| Review Dimension | Evaluation Criteria | Mentor Assessment |
| :--- | :--- | :--- |
| **1. Reliability Implementation Quality** | Does zero-vocabulary guard correctly prevent classifier intercept hallucination? Does Hinglish detection effectively prevent language misrouting? | [ ] Satisfactory<br>[ ] Changes Required |
| **2. Test Coverage & Completeness** | Are backend unit tests, frontend typecheck, linter, production build, and integration suites comprehensive (102 pytest, 9 API, 12 E2E)? | [ ] Satisfactory<br>[ ] Changes Required |
| **3. Error Handling & User Feedback** | Are user-facing notices clear, human-readable, and actionable? Are HTTP 400, 422, and 503 handled gracefully? | [ ] Satisfactory<br>[ ] Changes Required |
| **4. Frontend State & Race Conditions** | Does Clear button atomically reset all input and result state? Is in-flight fetch race condition guard effective? | [ ] Satisfactory<br>[ ] Changes Required |
| **5. Explainability & Disclaimers** | Are stop words excluded from top features? Are character n-grams properly described? Are Responsible AI disclaimers non-dismissible? | [ ] Satisfactory<br>[ ] Changes Required |
| **6. Dataset & Licensing Integrity** | Does Hindi inference remain gated under HTTP 503? Are public inference flags disabled? Is Task P01 properly blocked pending approval? | [ ] Satisfactory<br>[ ] Changes Required |
| **7. Browser E2E Evidence Authenticity** | Do all 13 screenshots provide genuine visual evidence of the actual Analyzer and result cards rather than the hero section? | [ ] Satisfactory<br>[ ] Changes Required |
| **8. Git Staging & Environment Safety** | Have the 65 pre-existing staged files been preserved untouched? Are `.env` files and deployment configurations protected? | [ ] Satisfactory<br>[ ] Changes Required |

### Mentor Decision & Review Record

- **Review Decision**: `[ ] APPROVED` &nbsp;&nbsp;&nbsp;&nbsp; `[ ] REVISION REQUIRED` &nbsp;&nbsp;&nbsp;&nbsp; `[ ] BLOCKED`
- **Reviewed By (Mentor / Owner)**: _____________________________________________
- **Review Date**: ________________________
- **Required Corrections (if any)**:
  ```
  __________________________________________________________________________________
  __________________________________________________________________________________
  __________________________________________________________________________________
  ```

---

## J. Final Status

> **P15 implementation and Browser E2E verification are ready for mentor review. This does not constitute mentor approval or authorization to proceed to the next phase.**
