# Non-Functional Requirements: VeriNews

## 1. Introduction
Non-Functional Requirements (NFRs) specify the quality attributes, operational limits, hardware boundaries, and architectural standards for VeriNews. Given that the developer is working independently on a consumer CPU laptop without specialized GPU hardware, these NFRs enforce simplicity, efficiency, and engineering discipline.

> [!NOTE]
> All performance thresholds, latency targets, and memory limits listed in this document are **provisional engineering targets**, not guaranteed specifications. They serve as engineering benchmarks during profiling and optimization.

---

## 2. Requirement Specifications

### 2.1 Performance & Latency (PERF)
- **NFR-PERF-01 (Inference Latency - Provisional Target)**: End-to-end inference (language identification + text preprocessing + model scoring + feature explainability) is targeted to complete in under **1.5 seconds** for an average news snippet (1,000 characters) on a standard dual-core or quad-core consumer CPU.
- **NFR-PERF-02 (Application Startup Time - Provisional Target)**: The FastAPI application server and serialized Scikit-learn model artifacts are targeted to cold-start and become ready to accept requests in under **10 seconds** without heavy model weight downloading at runtime.
- **NFR-PERF-03 (Throughput)**: The local system must comfortably serve single-user interactive requests without thread locking or UI freezing.

### 2.2 Hardware & Resource Constraints (RES)
- **NFR-RES-01 (Zero GPU Dependency)**: The entire inference and runtime stack must execute 100% on standard x86_64 CPU hardware. No CUDA, ROCm, or GPU drivers may be required to run the application.
- **NFR-RES-02 (Memory Footprint)**: Total runtime memory (RAM) consumption of the web server, preprocessing pipelines, and loaded model artifacts combined must remain under **1.0 GB** (ideally < 500 MB).
- **NFR-RES-03 (Model Artifact Storage)**: Serialized model and vectorizer artifacts saved on disk must not exceed **150 MB** total, ensuring fast loading and easy distribution without Git LFS bloat.

### 2.3 Usability & Internationalization (USE)
- **NFR-USE-01 (Devanagari Font Rendering)**: The web interface must properly render Unicode Devanagari text (Hindi matras, conjuncts, and ligatures) across modern desktop browsers without font clipping or corruption.
- **NFR-USE-02 (Responsive Design)**: The UI must be usable across desktop displays (1080p/1440p) and mobile screen dimensions (320px–420px width).
- **NFR-USE-03 (Accessibility - WCAG AA)**: Color contrast for text badges and labels (such as Credible / Unreliable tags) must meet WCAG 2.1 AA standards (minimum 4.5:1 contrast ratio for normal text). Predictions must never rely on color alone; text labels must accompany color indicators.

### 2.4 Maintainability & Architectural Simplicity (MNT)
- **NFR-MNT-01 (Ponytail Dependency Discipline)**:
  - Avoid heavy, bloated deep learning runtimes (e.g., PyTorch, TensorFlow) for the initial MVP if classical NLP algorithms (e.g., Scikit-Learn TF-IDF + Logistic Regression/Naive Bayes) achieve comparable baseline signal on CPU.
  - Rely on Python's standard library (`re`, `json`, `pathlib`, `collections`, `typing`) wherever applicable.
- **NFR-MNT-02 (Modularity & Separation of Concerns)**:
  - Strict separation between:
    - Text preprocessing logic (`preprocessing/`)
    - Model inference logic (`model/`)
    - Web presentation/API layer (`app/` or `ui/`)
- **NFR-MNT-03 (Code Readability & Style)**:
  - Code must strictly follow PEP 8 style standards with descriptive variable names and explicit type hints.

### 2.5 Reliability & Robustness (REL)
- **NFR-REL-01 (Crash Resilience)**: Malformed input (e.g., emojis only, zero-width spaces, mixed scripts, binary control characters) must be trapped gracefully by validation layers without triggering unhandled 500 server crashes.
- **NFR-REL-02 (Deterministic Execution)**: Given identical text input and identical model artifacts, the preprocessing pipeline and classifier must produce identical prediction outputs and confidence scores.

### 2.6 Privacy & Security (SEC)
- **NFR-SEC-01 (Stateless Ingestion by Default)**: In MVP 1.0, user-submitted news text is processed strictly in-memory during request execution and is not persisted to disk or remote servers.
- **NFR-SEC-02 (Input Sanitization)**: Text inputs must be sanitized against HTML/script injection (XSS) before rendering back into the UI.
- **NFR-SEC-03 (Zero External Telemetry)**: No user text or prediction data is transmitted to third-party APIs or external analytics services.

### 2.7 Portability & Reproducibility (ENV)
- **NFR-ENV-01 (Cross-Platform Execution)**: The project must install and run seamlessly across Windows 10/11, macOS, and standard Linux distributions (Ubuntu/Debian).
- **NFR-ENV-02 (Pinned Dependencies)**: All third-party Python packages must be pinned with exact versions in `requirements.txt`, and frontend packages pinned in `package.json`.
- **NFR-ENV-03 (Setup Simplicity)**: Setting up and running the application from a fresh clone must follow standard decoupled developer workflows:
  ```bash
  # Backend Setup (FastAPI)
  python -m venv venv
  .\venv\Scripts\Activate  # or source venv/bin/activate on Unix
  pip install -r requirements.txt
  uvicorn src.verinews.api.main:app --reload

  # Frontend Setup (Next.js + React)
  cd frontend
  npm install
  npm run dev
  ```
