# VeriNews — P15 Deployment Planning & Free-Tier Compatibility Audit

**Phase:** P15 (Deployment, Documentation and v1.0 Release — Planning Mode)  
**Date:** 2026-11-09  
**Status:** In Progress — Deployment Planning & Compatibility Audit Only  
**Deployment Execution:** NOT PERFORMED (Awaiting Mentor Approval)  
**Budget:** ₹0/month  

---

## 1. Executive Summary & Recommended Hosting Architecture

### Recommended ₹0/Month Architecture (Planning Only)
After an empirical audit of VeriNews's local runtime memory, storage, inference latency, and framework lifecycles, the proposed production hosting architecture is:

| Component | Target Platform | Tier / Plan | Estimated Monthly Cost | Operational Role & Terms |
|---|---|---|---|---|
| **Frontend** | **Vercel** | Hobby | **₹0 / $0 (Estimated)** | Next.js 16 UI hosting, edge CDN caching, automatic SSL. *Personal / non-commercial projects only.* |
| **Backend** | **Render** | Free Web Service | **₹0 / $0 (Estimated)** | FastAPI REST API, Uvicorn ASGI server. 512 MB RAM, 0.1 vCPU. *Inactivity spin-down after 15 min.* |
| **Database** | **Neon** | Free Tier | **₹0 / $0 (Estimated)** | Serverless PostgreSQL with SSL (1 GB storage, 100 CU-hours/month, 5 GB egress). |
| **Source Code** | **GitHub** | Free | **₹0 / $0 (Estimated)** | Version control and deployment triggers via Git integration. |
| **ML Artifacts** | **Render Container** | Free (Bundled in Git) | **₹0 / $0 (Estimated)** | Only approved candidate model (~179 KB). Restricted research models are excluded from Git. |

*Cost Notice*: All costs are estimates in USD and INR (based on an illustrative conversion rate of $1 ≈ ₹85–₹86). Free-tier allowances and terms are set by platform providers and subject to change.

**Final Financial Verdict:** VeriNews **is designed to operate within a ₹0/month ($0.00) budget** on free tiers during the demonstration and non-commercial evaluation phase. Actual cloud compatibility on Render must be empirically verified via staged deployment.

---

## 2. ML Model Compatibility, Licensing & Runtime Audit

Render Free imposes strict constraints: **512 MB RAM** and **0.1 shared vCPU**. A common failure mode in free AI deployments is Out-Of-Memory (OOM) termination. We conducted local OS-level process measurements and an artifact licensing audit across the complete VeriNews stack.

### 2.1 Artifact Audit: Disk Size, Licensing & Git Redistribution Status

An audit of all 10 `.joblib` model artifacts present in the repository was conducted:

| Artifact Name | Directory | File Size | Provenance / Data Origin | License Terms | Git Tracking & Deployment Status |
|---|---|---|---|---|---|
| **`en_ifnd_indian_headlines_calibrated_sigmoid.joblib`** | `models/calibrated/` | **183,265 bytes (178.9 KB)** | IFND (Indian Fake News Dataset) | CC BY 4.0 | **Candidate for Deployment**: Eligible for Git tracking; deployment held pending mentor sign-off on P01. |
| `en_isot_english_articles_calibrated_sigmoid.joblib` | `models/calibrated/` | 198,460 bytes (193.8 KB) | ISOT (Univ. of Victoria) | Restricted (Research only; no redistribution) | **Excluded from Git**: Added to `.gitignore`. Retained locally for research benchmarks only. |
| `hi_tallip_hindi_articles_calibrated_sigmoid.joblib` | `models/calibrated/` | 155,853 bytes (152.2 KB) | TaLLIP Hindi dataset | Unclear / Non-commercial academic only | **Excluded from Git**: Added to `.gitignore`. Retained locally for research benchmarks only. |
| Baseline artifacts (7 files: `en_isot_*`, `hi_tallip_*`, `en_ifnd_*`, `en_welfake_*`) | `models/baselines/` | 1,214,612 bytes (1.16 MB) | Various research corpora | Various academic / restricted terms | **Excluded from Git**: Entire `models/baselines/` added to `.gitignore`. Research only. |
| **Total Disk Footprint** | `models/` | **1,752,190 bytes (1.67 MB)** | — | — | Only 1 artifact (179 KB) candidate for Git; 9 artifacts excluded. |

#### Critical Licensing Invariant on Model Redistribution
> [!IMPORTANT]
> **Disabling inference in code does NOT make redistributing model weights lawful.**  
> Simply setting `VERINEWS_ENABLE_HINDI_INFERENCE=false` in the application configuration or leaving endpoints gated does not grant the right to commit or publish model weights derived from datasets with restricted redistribution terms (such as ISOT or TaLLIP). Committing restricted artifacts to a public Git repository constitutes unauthorized redistribution.  
> Therefore, `.gitignore` has been updated to explicitly bar all restricted research models from Git tracking:
> ```gitignore
> models/baselines/
> models/calibrated/en_isot_*
> models/calibrated/hi_tallip_*
> ```
> Only the candidate IFND artifact (`en_ifnd_indian_headlines_calibrated_sigmoid.joblib`), whose source dataset was published under CC BY 4.0, is eligible for repository inclusion, subject to mentor approval in P01.

---

### 2.2 Local Process Memory Measurements (Windows 11)

Memory measurements were recorded locally on a Windows 11 host (CPython 3.14, 64-bit) running the complete FastAPI backend and Scikit-Learn inference pipeline:

| Execution Stage | Measured OS Working Set (RSS) | Memory Delta | Traced Python Heap |
|---|---|---|---|
| **1. Base Python Interpreter** | **14.11 MB** | — | 0.00 MB |
| **2. Backend Framework Imports** (FastAPI, Scikit-Learn, NumPy, SciPy, SQLAlchemy, Psycopg 3) | **187.76 MB** | +173.65 MB | 125.55 MB |
| **3. Model Loading** (`load_english_candidate()`) | **193.05 MB** | **+5.29 MB** | 127.01 MB |
| **4. Active Inference (100 passes)** | **193.29 MB** | **+0.24 MB** | 127.05 MB |
| **Peak Runtime Memory (Local Windows)** | **193.29 MB** | — | **131.52 MB** |

*Local CPU Latency*: Average inference latency was **3.66 ms** per prediction. Startup duration was **4.03 seconds**.

---

### 2.3 Runtime Compatibility: Local Windows vs. Render Linux Container

> [!WARNING]
> **Do NOT claim that Render deployment is proven compatible until tested on Render.**  
> Local measurements on Windows 11 CPython 3.14 (193.29 MB RSS) provide a promising preliminary signal, but cannot be treated as proof of compatibility with Render's Linux environment:
> 1. **Memory Allocator Differences**: Linux C standard library (`glibc` `ptmalloc`) manages heap fragmentation and memory page arenas differently from the Windows VirtualAlloc/HeapAlloc APIs, which can increase resident set size under repeated allocations.
> 2. **Shared Library & ELF Overhead**: Dynamic linking of C extensions (`numpy`, `scipy`, `scikit-learn`) on Linux loads shared ELF objects (`.so`) with different memory-mapping and paging characteristics than Windows DLLs.
> 3. **Container cgroup Accounting**: Render enforces memory limits at the Linux container cgroup layer, which counts kernel page caches and network socket buffers against the 512 MB boundary.
> 4. **CPU Throttling**: Render's 0.1 shared vCPU quota imposes CFS (Completely Fair Scheduler) quota throttling that can lengthen framework cold-boot and request latency compared to an unconstrained local CPU.

---

### 2.4 Staged Cloud Verification Protocol on Render

To verify cloud compatibility without risking OOM crashes or deploying unauthorized models, a rigorous 3-stage protocol must be followed when deployment execution is approved:

1. **Stage 1 — Baseline Deployment with Inference Disabled**:
   - Deploy backend to Render with `VERINEWS_ENABLE_ENGLISH_INFERENCE=false` and `VERINEWS_ENABLE_HINDI_INFERENCE=false`.
   - Verify cold-start duration and container health probe (`GET /api/health`).
   - Inspect Render service logs and metrics to establish actual Linux container baseline memory (FastAPI + framework imports without model loading).
2. **Stage 2 — Runtime & Memory Monitoring**:
   - Monitor the container through idle spin-down (after 15 minutes) and cold-start wake cycles under simulated health check traffic.
   - Confirm that background garbage collection and memory usage remain stable well below Render's 512 MB ceiling.
3. **Stage 3 — Approved Staging Inference Test**:
   - **Only after** mentor sign-off on P01 dataset licensing and successful Stage 1 & 2 verification.
   - Enable `VERINEWS_ENABLE_ENGLISH_INFERENCE=true` in a staging environment.
   - Execute a controlled batch of headline predictions and record real Linux container RSS and CPU latency under Render's 0.1 shared vCPU throttling.

*Current Policy*: **Inference remains disabled** (`VERINEWS_ENABLE_ENGLISH_INFERENCE=false`, `VERINEWS_ENABLE_HINDI_INFERENCE=false`). No model inference will be enabled without mentor approval.

---

## 3. Frontend Deployment Readiness (Vercel)

* **Framework**: Next.js 16.4.5 (Turbopack, React 19).
* **Build Verification**: `next build` compiles in ~4 seconds, generating static routes (`/`, `/_not-found`) and dynamic route (`/project-tracker`).
* **Environment Variable Requirements**:
  * `NEXT_PUBLIC_API_URL`: Points to the live Render backend URL (e.g. `https://verinews-api.onrender.com`).
  * Note: `NEXT_PUBLIC_*` variables are embedded into client bundles at build time. Changing the backend URL requires triggering a Vercel redeploy.
* **Production Route Isolation**:
  * The development dashboard at `/project-tracker` contains a production guard:
    ```typescript
    if (process.env.NODE_ENV === 'production') notFound();
    ```
  * In production, navigating to `/project-tracker` immediately returns a 404, preventing internal metrics or file paths from leaking to public users.

---

## 4. Backend Deployment Readiness & Reverse Proxy Security (Render)

* **Application Entry Point**: `backend.app.main:app`.
* **Safe Initial Uvicorn Start Command**:
  ```bash
  uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
  ```

### 4.1 Reverse Proxy Security & Header Spoofing Analysis
* **Render Inbound Proxy Documentation Status: UNVERIFIED**:
  - Official Render documentation confirms that incoming requests pass through Cloudflare edge routing and internal load balancers, and that client IPs are placed in `X-Forwarded-For`.
  - However, **Render does NOT officially publish or guarantee a static CIDR block or internal IP subnet** for the load balancer connecting to the web service container.
  - While private RFC 1918 subnets (such as `10.0.0.0/8`) are common in container orchestrators, assuming `10.0.0.0/8` without empirical verification is speculative.
* **Security & Tradeoff Analysis of Uvicorn Proxy Configuration**:
  - **Option 1: `--forwarded-allow-ips='*'` (INSECURE / NOT RECOMMENDED)**:
    Uvicorn blindly trusts every proxy hop. An external client could send a forged `X-Forwarded-For: <spoofed-ip>` header; Uvicorn would parse to the leftmost untrusted value and set `request.client.host` to the forged IP, enabling rate-limit bypass.
  - **Option 2: Unverified CIDR (e.g. `--forwarded-allow-ips='10.0.0.0/8'`) (FRAGILE)**:
    If Render's proxy connects from an IP outside that assumed range (e.g., another RFC 1918 block or link-local address), Uvicorn will reject the proxy headers as untrusted and fall back to the proxy's immediate IP.
  - **Option 3: Safe Initial Default (RECOMMENDED FOR PREVIEW v1)**:
    Start with Uvicorn's safe default (`uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`).
    *Rate-limiting implication*: Uvicorn does not trust external headers without verification. If Render proxies traffic over an internal address, `request.client.host` will reflect that proxy IP, causing all incoming callers to share the 60 requests/minute bucket. For Preview v1 (an educational research preview with inference disabled and modest traffic), this is entirely acceptable and guarantees zero IP spoofing.
  - **Stage 1 Verification Path**: During initial Stage 1 deployment, inspect Render logs to observe the actual source IP of incoming requests. Once the real proxy subnet is empirically verified on Render, configure `--forwarded-allow-ips` with that verified CIDR block.

### 4.2 Dependencies & Build Configuration
* **Dependencies & Build Command**:
  To ensure Render builds all web server and ML dependencies without missing packages, a unified deployment build command will be used:
  ```bash
  pip install --upgrade pip && pip install -r requirements.txt -r backend/requirements.txt
  ```
* **Health Check Path**: `GET /api/health` returns `200 OK` with `{"status": "healthy", ...}`, suitable for Render's health-check probe.
* **Inactivity Spin-Down Behavior**:
  Render Free services spin down after 15 minutes of inactivity. When a new request arrives, a cold start takes approximately **45–55 seconds** to boot. The frontend handles this gracefully by displaying a connection retry notice if the API response times out.

---

## 5. Neon PostgreSQL Database Integration

* **Existing Provisioning**: Neon Serverless PostgreSQL instance is active with SSL enabled.
* **Connection String Format**:
  ```env
  DATABASE_URL=postgresql+psycopg://username:password@ep-example.region.neon.tech/verinews?sslmode=require
  ```
* **Neon Free Tier Resource Allowances (Audited)**:
  - **Storage**: **1 GB per project** (updated from legacy 0.5 GB quota).
  - **Compute**: **100 Compute Unit (CU) hours per month** (sufficient for low-volume non-commercial usage).
  - **Network Transfer**: **5 GB egress per month**.
  - **Connection Pooling**: Available on port 5432 / 6543 pooler endpoints.
* **Storage Consumption under Zero Content Retention**:
  Because VeriNews never stores article bodies, headlines, tokens, or explanations in the database, storage consumption per analysis is strictly zero rows. Only database migrations, schema definitions, and administrative tables consume storage. Neon's 1 GB free storage provides massive headroom.
* **Compute Auto-Suspend**:
  Neon's free compute automatically suspends after 5 minutes of inactivity to preserve CU-hours. Reconnection latency is ~1.5–2.0 seconds, handled transparently by SQLAlchemy engine connection pooling and psycopg retries.
* **Database Migrations on Release**:
  Migrations are executed via Alembic prior to service launch:
  ```bash
  alembic upgrade head
  ```

---

## 6. Security, Privacy & Release Governance

1. **Strict Zero Content Retention**:
   - Automated tests confirm zero rows created in `analyses`, `users`, or `user_feedback` during prediction.
   - Text is evaluated in transient RAM and discarded immediately after response serialization.
2. **Payload Size Guard**:
   - Maximum 64 KB request body enforced at the middleware layer (`HTTP 413 Content Too Large`).
3. **In-Memory Rate Limiting**:
   - Sliding window of 60 requests/minute per client IP (`HTTP 429 Rate Limit Exceeded`).
   - Stale IPs evicted automatically after 60 seconds.
4. **Safety Default / Deployment Hold**:
   - `VERINEWS_ENABLE_ENGLISH_INFERENCE=false` (by default in production).
   - `VERINEWS_ENABLE_HINDI_INFERENCE=false` (strictly disabled; TaLLIP research-only).
   - Phase P01 remains `In Progress` pending explicit mentor approval of IFND dataset provenance.
   - Model is clearly presented as an **experimental headline pattern classifier**, not an arbiter of factual truth.

---

## 7. Cost Comparison & Alternative Platforms

> [!NOTE]
> All price projections in USD ($) and INR (₹) are estimated using an approximate conversion rate of $1 USD ≈ ₹85–₹86 INR. Actual billing depends on exchange rates, local taxes/GST, and individual cloud provider terms at the time of usage.

| Platform Stack | Estimated Monthly Cost | Cold Starts | RAM Limit | Suitability for VeriNews & Licensing Constraints |
|---|---|---|---|---|
| **Vercel Hobby + Render Free + Neon Free** | **₹0 / month ($0.00)** *(Estimated)* | ~50s after 15 min idle | 512 MB (Local measured: 193 MB) | **RECOMMENDED**: Fully compatible with demonstration goals. Vercel Hobby is restricted to personal / non-commercial use. |
| **Vercel Hobby + Railway Hobby + Neon Free** | **~₹425–₹650 / month ($5–$7.50)** *(Estimated)* | None | 512 MB+ | Unsuitable: Railway does not provide a permanent ₹0 free tier. |
| **Vercel Hobby + Render Starter ($7) + Neon Free** | **~₹600 / month ($7.00)** *(Estimated)* | None (Always-on) | 512 MB | Optional future upgrade if cold starts must be eliminated after v1.0 release approval. |

---

## 8. Exact Chronological Manual Deployment Checklist

*Note: For planning only. Do NOT perform these actions until mentor approval is granted.*

### Step 1: GitHub Repository Check
* **URL**: `https://github.com`
* **Account**: Existing GitHub account.
* **Action**: Ensure all verified codebase changes (backend, frontend, approved candidate model, migrations) are committed to your repository's `main` branch. Ensure `.gitignore` continues to exclude restricted research models (`models/baselines/`, `models/calibrated/en_isot_*`, `models/calibrated/hi_tallip_*`).

### Step 2: Render Backend Web Service Setup
1. **URL**: `https://render.com`
2. **Account**: Sign up or log in (free account, no credit card required).
3. **Action**: Click **New +** → **Web Service**.
4. **Connect**: Connect your GitHub repository `VeriNews`.
5. **Configuration**:
   - **Name**: `verinews-backend` (or similar).
   - **Region**: Choose closest (e.g., Singapore or Frankfurt).
   - **Branch**: `main`.
   - **Runtime**: `Python 3`.
   - **Build Command**:
     ```bash
     pip install --upgrade pip && pip install -r requirements.txt -r backend/requirements.txt
     ```
   - **Start Command (Safe Default for Preview v1)**:
     ```bash
     uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
     ```
     *(Note: `--forwarded-allow-ips` remains unconfigured until Render's inbound proxy IP is verified during Stage 1).*
   - **Instance Type**: Select **Free (512 MB RAM, 0.1 CPU)**.
6. **Environment Variables**:
   Under **Advanced** → **Environment Variables**, add:
   - `PYTHON_VERSION`: `3.11.9` (or `3.12`)
   - `VERINEWS_ENV`: `production`
   - `DATABASE_URL`: Your existing Neon connection string (`postgresql+psycopg://...`)
   - `VERINEWS_CORS_ORIGINS`: `http://localhost:3000,https://<your-vercel-app>.vercel.app`
   - `VERINEWS_ENABLE_ENGLISH_INFERENCE`: `false` (default disabled until mentor clearance)
   - `VERINEWS_ENABLE_HINDI_INFERENCE`: `false`
7. **Deploy**: Click **Create Web Service**. Wait for build completion and copy the service URL (e.g. `https://verinews-backend.onrender.com`).
8. **Verify (Stage 1 of Staged Testing Protocol)**: Visit `https://verinews-backend.onrender.com/api/health` to confirm `healthy` probe and inspect Render service memory metrics.

### Step 3: Vercel Frontend Setup
1. **URL**: `https://vercel.com`
2. **Account**: Sign up or log in with GitHub (Hobby plan, no credit card required).
3. **Action**: Click **Add New...** → **Project**.
4. **Import**: Select your `VeriNews` repository.
5. **Project Configuration**:
   - **Framework Preset**: `Next.js`.
   - **Root Directory**: Click Edit → select `frontend`.
   - **Build Command**: `npm run build` (default).
   - **Output Directory**: `.next` (default).
6. **Environment Variables**:
   Add the following environment variable:
   - `NEXT_PUBLIC_API_URL`: The Render backend URL from Step 2 (e.g., `https://verinews-backend.onrender.com`).
7. **Deploy**: Click **Deploy**. Vercel will build and assign a domain (e.g., `https://verinews.vercel.app`).

### Step 4: Final Domain Handshake
1. Return to the **Render Dashboard** → `verinews-backend` → **Environment**.
2. Update `VERINEWS_CORS_ORIGINS` to include the exact Vercel URL:
   ```env
   VERINEWS_CORS_ORIGINS=http://localhost:3000,https://verinews.vercel.app
   ```
3. Save changes. Render will automatically reload the application.

---

## 6. Local Development & Integration Runbook

### 6.1 Backend Startup (With Local English Inference)
To run the backend locally with English inference enabled for testing without touching `.env`:

```powershell
# In Windows PowerShell:
.\scripts\start-backend-local.ps1
```

Or manually:
```powershell
$env:VERINEWS_ENABLE_ENGLISH_INFERENCE="true"
$env:VERINEWS_ENABLE_HINDI_INFERENCE="false"
.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

- **Backend Base URL**: `http://127.0.0.1:8000`
- **Health-Check URL**: `http://127.0.0.1:8000/api/health`
- **Prediction Endpoint**: `http://127.0.0.1:8000/api/predict`
- **Interactive OpenAPI Docs**: `http://127.0.0.1:8000/api/docs`
- **How to Stop the Backend**: Press `Ctrl + C` in the running PowerShell terminal.

### 6.2 Frontend Startup
In a separate terminal:
```bash
cd frontend
npm run dev
```
- **Frontend URL**: `http://localhost:3000`
- Connects automatically to local backend at `http://localhost:8000`.

### 6.3 Hindi Status and Approval Requirements
- **Technical Readiness**: Validated. The Hindi TF-IDF character n-gram pipeline and explainability extractors function correctly on Devanagari text.
- **Licensing Gate**: **UNRESOLVED**. The TaLLIP Hindi dataset was published under ACM academic terms without explicit commercial or public redistribution rights.
- **Enforcement**: Hindi inference remains strictly **disabled** (`VERINEWS_ENABLE_HINDI_INFERENCE=false`), returning honest `HTTP 503` explaining licensing hold. Public deployment requires explicit copyright/licensing clearance.

---

## 9. Remaining Unresolved Blockers Before Live Launch

1. **Phase P01 (Dataset Licensing & Provenance)**:
   - IFND is sourced under CC BY 4.0; however, primary-source review and formal mentor approval are required before activating English predictions in production.
   - P01 remains `In Progress`.
2. **Feature Flag State**:
   - `VERINEWS_ENABLE_ENGLISH_INFERENCE` must remain `false` during initial deployment. Activation is a separate step post-launch.
3. **Mentor Approval Gate**:
   - Per `AGENTS.md`, actual production deployment cannot proceed without explicit mentor sign-off.

