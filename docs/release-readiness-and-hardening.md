# VeriNews — P14 Release Hardening and Production Readiness Report

**Phase:** P14 (Release Hardening, Security, Privacy, and Performance Verification)  
**Date:** 2026-11-09  
**Status:** Complete — Awaiting Mentor Review  

---

## 1. Input-Domain Compatibility & Alignment

### Empirical Dataset Analysis
The candidate English model is trained and calibrated on the **IFND (Indian Fake News Dataset)** corpus:
- **Raw records**: 56,714 records; **50,950 usable unique records** after strict deduplication.
- **Observed Text-Length Distribution**:
  - Minimum length: 15 characters
  - Mean length: 80.2 characters
  - Maximum length: 348 characters
- **Domain Mismatch Resolution**:
  Earlier design specifications assumed a generic 100–5,000 character article range. Applying a model trained on 80-character headlines to 5,000-character investigative articles introduces severe out-of-domain feature dilution and spurious keyword correlations.
- **Defensible Production Input Range**:
  - **Minimum Length**: **20 characters** (at least 10 alphabetic letters, accommodating typical short headlines while rejecting single-word noise).
  - **Maximum Length**: **500 characters** (accommodating full headlines, subheads, and breaking alert claims up to the 348-character training maximum plus headroom, while firmly rejecting multi-paragraph full-text articles).

### System-Wide Boundary Alignment
1. **Frontend Validation (`frontend/src/components/Analyzer.tsx`)**:
   - `MIN_LENGTH = 20`, `MAX_LENGTH = 500`.
   - Clear headline-focused labels: *"Analyze News Headlines & Claims"*.
   - Dynamic validation warnings informing users that the service analyzes headlines and brief statements, not full-length articles.
   - Updated placeholder: *"Paste a news headline, claim statement, or breaking report summary (20–500 characters)..."*
2. **Backend Validation (`backend/app/core/config.py` & `prediction.py`)**:
   - `MIN_TEXT_LENGTH = 20`, `MAX_TEXT_LENGTH = 500`.
   - Rejects text < 20 chars with HTTP 400 (`VALIDATION_ERROR`).
   - Rejects text > 500 chars with HTTP 400 (`VALIDATION_ERROR`) and explanatory detail.
3. **Language Detection (`backend/app/services/language.py`)**:
   - Adjusted minimum required alphabetic character threshold from 20 to 10 letters, ensuring short 20-character headlines with spaces/punctuation are not rejected as unsupported scripts.

---

## 2. Model Readiness, Activation & Decoupled Gating

### Safety Default
By default, all production inference endpoints return **HTTP 503 (Service Unavailable)** without fabricating predictions:
```json
{
  "detail": "The English model service is not available. In this research preview, no approved machine learning model has been deployed yet. VeriNews never fabricates synthetic predictions.",
  "error_code": "HTTP_503"
}
```

### Exact Local Activation Configuration
To activate the eligible candidate English pipeline for local staging or authorized deployment:
1. Ensure the calibrated artifact exists: `models/calibrated/en_ifnd_indian_headlines_calibrated_sigmoid.joblib`.
2. Set the environment variable in `.env` or the runtime environment:
   ```env
   # Preferred namespaced variable (generic ENABLE_ENGLISH_INFERENCE is also supported for backwards compatibility)
   VERINEWS_ENABLE_ENGLISH_INFERENCE=true
   VERINEWS_DEFAULT_ENGLISH_ARTIFACT=en_ifnd_indian_headlines_calibrated_sigmoid.joblib
   ```
3. Consult `.env.example` in the repository root for the complete configuration template.
4. Restart the FastAPI backend. The service will load the artifact, set readiness to `true`, and serve calibrated predictions on `/api/predict`.

### Hindi Deployment Hold
Hindi inference remains strictly disabled (`ENABLE_HINDI_INFERENCE=false`). Requests route to the Hindi pipeline and return HTTP 503 explaining:
> *"The Hindi model service is not available. Hindi model inference is currently disabled pending dataset licensing and deployment clearance. VeriNews never fabricates synthetic predictions."*

---

## 3. Security, Privacy & Invariant Hardening

1. **Strict Zero Content Retention**:
   - Neither the submitted headline, nor any hash, snippet, feature token, or attribution weight is persisted in relational storage (`analyses`, `users`, `user_feedback`).
   - Verified by automated tests `test_zero_content_retention_on_headline_inference`: table counts before and after prediction calls remain strictly identical.
2. **Request Size Protections**:
   - Starlette middleware limits request payload to **64 KB** (`MAX_PAYLOAD_BYTES`).
   - Excess payloads return **HTTP 413 (Content Too Large)** before reading full bodies into memory.
3. **In-Memory Rate Limiting & Production Limitations**:
   - Per-IP sliding-window limiter on `/api/predict` allowing a maximum of **60 requests per minute**.
   - Excess requests return **HTTP 429 (Too Many Requests)**.
   - **Architectural Constraints & Production Limitations**:
     - *Process-Local Scope*: The rate limiter uses an in-memory dictionary. It is local to the active Python process and is **not** shared across multiple Uvicorn workers or horizontally scaled container instances. Each process enforces its own 60 req/min window.
     - *Reverse Proxy IP Handling*: `request.client.host` is used for caller identification. Behind reverse proxies (e.g., Nginx, Caddy, AWS ALB, Cloudflare), Uvicorn MUST be invoked with `--proxy-headers` and `--forwarded-allow-ips='<trusted-proxy-ip>'`.
     - *Security Rule*: Arbitrary `X-Forwarded-For` headers are intentionally **not** trusted directly in application code to prevent spoofed IP bypasses.
     - *Memory Hygiene*: Automatic dictionary pruning evicts expired IP records when the dictionary exceeds 500 keys or 60 seconds have elapsed.
     - *Production Recommendation*: For the initial single-instance CPU MVP, this native, zero-dependency implementation is optimal. External stores (e.g., Redis or Upstash) should only be introduced if multi-node clustering is explicitly adopted in future phases.
4. **Secret & Logging Hygiene**:
   - `.env` is listed in `.gitignore` and untracked by Git. A comprehensive `.env.example` template is provided in the repository root.
   - Structured logger records only `char_length` and `language_hint`. Raw text and extracted tokens are never logged.
   - CORS strictly reflects configured origin domains (`localhost:3000`, `127.0.0.1:3000`).

---

## 4. End-to-End Performance, CPU Benchmark & Calibration Reconciliation

### Model Performance on Candidate IFND Artifact
- **Model Type**: Calibrated Logistic Regression (Sigmoid scaling on TF-IDF word n-grams).
- **Inference Latency**: Mean inference latency is **~1.5 ms** on modern CPU cores.
- **Memory Footprint**: Candidate artifact bundle is **< 15 MB** on disk, easily resident in memory.
- **Explainability**: Top 5 influential tokens extracted transiently via `TFIDFExplainer` with directionality badges and non-dismissible Responsible AI disclaimers citing Kar et al. (2021).

### IFND Calibration Metric Verification & Discrepancy Resolution
During the initial drafting of the P14 report, a transcription error cited intermediate numbers (`Brier score 0.1418, Log loss 0.4497, ECE 0.0526`). 

The empirical evaluation of the serialized candidate artifact (`models/calibrated/en_ifnd_indian_headlines_calibrated_sigmoid.joblib`) confirms:
1. **P11 Held-Out Test Evaluation (3,000 samples, random_state=42 stratified split of 20,000 balanced subset)**:
   - **Brier Score**: **0.0426** (Uncalibrated: `0.0535` → Calibrated reduction of `0.0109`)
   - **Log Loss**: **0.1555** (Uncalibrated: `0.2051` → Calibrated reduction of `0.0496`)
   - **Expected Calibration Error (ECE)**: **0.0097** (Uncalibrated: `0.0830` → Calibrated reduction of `0.0733`)
   - **Accuracy**: **94.67%** (Uncalibrated: `94.10%`)
   - **Macro F1**: **94.66%** (Uncalibrated: `94.09%`)
2. **Category-Grouped Generalization Evaluation (15,752 out-of-domain samples from `COVID-19` and `ELECTION`)**:
   - **Brier Score**: **0.0338**
   - **Log Loss**: **0.1299**
   - **ECE**: **0.0477**
   - **Accuracy**: **95.84%**
   - **Macro F1**: **92.76%**
3. **Reproducibility Command**:
   ```bash
   .venv/Scripts/python -c "import joblib, csv, hashlib; from sklearn.model_selection import train_test_split; from ml.readers import resolve_ifnd_path; from ml.calibration import evaluate_calibration; p=resolve_ifnd_path(); rows=[(r[1].strip(), 'credible' if r[6].strip().upper()=='TRUE' else 'unreliable') for r in csv.reader(open(p, encoding='utf-8', errors='replace')) if len(r)>=7 and len(r[1].strip())>=15]; cred=[r for r in rows if r[1]=='credible']; unrel=[r for r in rows if r[1]=='unreliable']; import numpy as np; np.random.seed(42); b=[cred[i] for i in np.random.choice(len(cred), 10000, False)] + [unrel[i] for i in np.random.choice(len(unrel), 10000, False)]; _,Xt,_,yt=train_test_split([r[0] for r in b], [r[1] for r in b], test_size=0.15, random_state=42, stratify=[r[1] for r in b]); a=joblib.load('models/calibrated/en_ifnd_indian_headlines_calibrated_sigmoid.joblib'); m=evaluate_calibration(a['model'], a['vectorizer'], Xt, yt); print('Brier:', m.brier_score, 'LogLoss:', m.log_loss_value, 'ECE:', m.expected_calibration_error)"
   ```

---

## 5. Dataset Provenance, Licensing Evidence & P01 Status

### IFND Primary-Source Evidence
* **Mendeley Data DOI**: `10.17632/z3pt4nnksv.1`
* **Authors**: Debanjan Kar, Bhaskarjyoti Maharana, Abhirup Mohapatra (2021).
* **Associated Academic Paper**: Applied Soft Computing / Elsevier (2021).
* **Stated Licence on Mendeley Data Platform**: Creative Commons Attribution 4.0 International (`CC BY 4.0`).
* **Attribution Requirement**: Mandatory attribution to Kar et al. (2021). Integrated as a non-dismissible disclaimer in every prediction response.

### Primary Evidence vs. Remaining Uncertainties
* **Verified Evidence**:
  - The Mendeley Data dataset entry is published under CC BY 4.0.
  - The dataset consists of 56,714 raw statements (50,950 usable unique) scraped across 29 Indian news and fact-checking websites.
* **Remaining Uncertainty / Upstream Nuance**:
  - While the metadata and dataset compilation are licenced under CC BY 4.0, individual statements were originally scraped from third-party journalistic and fact-checking sources under research fair-use doctrines.
  - In a public production deployment, presenting commercial claims on scraped headlines carries copyright nuance.
* **Governance Decision**:
  - **Phase P01 remains open** pending explicit mentor and legal sign-off.
  - **Public inference remains gated (disabled by default)** to prevent unauthorized deployment without explicit administrative activation.

---

## 6. Answers to Mandatory P14 Readiness Questions

### 1. What passed and what failed?
- **Passed**:
  - Full Python test suite (80 passing tests across `backend/tests` and `ml/tests`).
  - Boundary condition tests (20 chars, 500 chars, whitespace, script detection).
  - Rate limiting (HTTP 429) and request payload limiting (HTTP 413).
  - Zero Content Retention invariant verification.
  - Frontend TypeScript typecheck (`tsc --noEmit` — 0 errors).
  - Frontend ESLint (`eslint .` — 0 warnings, 0 errors).
  - Next.js 16 production build (`next build` — static and dynamic routes compiled).
  - Project tracker schema validation (`validate_project_tracker.mjs`).
- **Failed**: None. All automated quality gates passed.

### 2. What input range is actually supported by the model?
- **20 to 500 characters**, representing news headlines, claim statements, and brief news alerts. Full-length articles (>500 characters) are rejected at the API boundary to prevent domain collapse.

### 3. Is English inference release-ready?
- **Conditionally Ready as an Experimental Headline Feature**: The technical pipeline (FastAPI + model + explainability + frontend + rate limiting + zero retention) is robust, calibrated, and well-tested. However, it must be presented strictly as an **experimental statistical headline analysis tool**, not a general article verifier or fact-checker.

### 4. What are the remaining licensing, security, privacy, and hosting blockers?
- **Licensing**:
  - P01 remains formally open pending mentor dataset sign-off.
  - IFND is under CC BY 4.0 (requires attribution, which is implemented in the API disclaimer).
  - ISOT and TaLLIP remain restricted to academic/non-commercial research and cannot be deployed publicly.
- **Hosting / Deployment**:
  - PostgreSQL database (Neon) is provisioned and schema is migrated.
  - Production hosting provider for FastAPI and Next.js (e.g. Vercel, Railway, Render) has not been configured or authorized.

### 5. What exact manual actions are required from the user?
1. Review and provide formal sign-off on dataset provenance and P01/P14 closure.
2. Choose hosting target for FastAPI backend and Next.js frontend.
3. Configure `VERINEWS_ENABLE_ENGLISH_INFERENCE=true` in production environment when ready to enable English predictions.

### 6. Can P15 deployment safely begin?
- **Yes, subject to mentor approval**: The software codebase is fully hardened, validated, and aligned with its actual model capabilities. Once the mentor grants deployment approval, Phase P15 (Deployment and v1.0 Release Documentation) may proceed.

