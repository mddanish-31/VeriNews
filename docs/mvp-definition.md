# MVP Definition: VeriNews

## 1. Executive MVP Strategy
The Minimum Viable Product (MVP) for VeriNews is defined as the smallest, most coherent software system that:
1. Solves the core user problem: evaluates linguistic credibility of English and Hindi news text.
2. Demonstrates end-to-end software engineering excellence: clean modular architecture, CPU-efficient ML, explainable outputs, and responsible AI guardrails.
3. Can be built, maintained, and mastered by a solo beginner developer without getting bogged down by extraneous infrastructure.

---

## 2. Technology Stack Evaluation (The Ponytail Ladder)

Applying the Ponytail principle—*reach for the simplest, most standard, and maintainable solution that satisfies the requirements*:

### 2.1 Machine Learning & NLP Stack

| Option | Technology | Pros | Cons | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| **Option A (Recommended for MVP)** | **Scikit-Learn (TF-IDF + Logistic Regression / Linear SVM)** | - Sub-millisecond CPU inference.<br>- Native, transparent feature coefficients for instant explainability.<br>- Tiny memory footprint (< 50 MB).<br>- Highly accessible for a Python/ML beginner.<br>- Rock-solid stability; no GPU needed. | Cannot model complex deep contextual relationships across long paragraphs. | **Selected for MVP Baseline**. Establishes the baseline benchmark against which any future complex model must be judged. |
| **Option B (Secondary / Upgrade)** | **Multilingual Transformer (e.g., XLM-RoBERTa, IndicBERT)** | - Context-aware semantic representations across multilingual corpora.<br>- Cross-lingual transfer learning capability. | - Heavy CPU inference latency (> 1.5–3.0s).<br>- 500MB+ model weights.<br>- Complex explainability (integrated gradients/attention rollout).<br>- Requires PyTorch/Hugging Face dependencies. | **Deferred to Advanced Experiments**. Evaluated in research benchmarks after establishing baseline. |

### 2.2 Application & Web Interface Architecture

| Architecture | Technology | Pros | Cons | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| **Option 1: Pure Python Framework** | **Streamlit** | - 100% Python; rapid initial prototyping. | Monolithic execution model; cannot serve as a decoupled industry-standard web client; tightly couples UI state to server execution. | **Not Selected for Production**. Streamlit is excluded as the production frontend to avoid architectural dead-ends. |
| **Option 2: Modern Decoupled Web Application (Approved Architecture)** | **Frontend: Next.js App Router + React + TypeScript + Tailwind CSS<br>Backend: Python + FastAPI** | - Clean architectural separation of concerns.<br>- Type-safe, production-grade web client with file-based routing and utility-first CSS styling.<br>- High-performance asynchronous REST API backend using FastAPI and Pydantic validation.<br>- Professional portfolio standard mirroring real-world software engineering. | Requires managing separate client and server workspaces. | **Selected Architecture**. A decoupled Next.js frontend communicates via REST API with a dedicated FastAPI inference service. |

*Architectural Principle*: Decouple the core NLP/ML pipeline (`src/verinews/`) completely from the web framework so that it can be invoked via CLI, test suite, or FastAPI endpoints with zero code modifications.

---

### 2.3 Data Persistence & State Strategy

| Component | Architecture Decision | Rationale |
| :--- | :--- | :--- |
| **MVP History (Initial Release)** | **Browser `localStorage` (last 3–5 analyses)** | Zero server-side database dependencies, zero authentication overhead, instantaneous client-side persistence, fully privacy-preserving. |
| **Full Application (Future Release)** | **PostgreSQL + SQLAlchemy + Alembic** | Robust relational persistence, ACID compliance, enterprise-grade schema migrations, structured queries for user history and model feedback. |
| **Authentication** | **Deferred to Later Release** | Keep initial release focused entirely on the ML inference and credibility evaluation lifecycle. |

---

## 3. MVP Scope Matrix

| Feature | MVP 1.0 Status | Description / Notes |
| :--- | :---: | :--- |
| **Raw Text Submission** | **MUST-HAVE** | Textarea with length validation (100–5,000 chars) and one-click sample loader. |
| **Bilingual Language Detection** | **MUST-HAVE** | Auto-detect English vs. Hindi (Devanagari script) with regex/heuristic fallback. |
| **Language-Specific Preprocessing** | **MUST-HAVE** | Normalization, punctuation removal, stopword filtering for English & Hindi. |
| **ML Classification Engine** | **MUST-HAVE** | Dual TF-IDF vectorizers + calibrated linear classifiers (one EN, one HI). |
| **Calibrated Confidence Score** | **MUST-HAVE** | Percentage probability qualified with Low / Moderate / High confidence tiers. |
| **Feature Contribution / Explainability** | **MUST-HAVE** | Top 5–10 positive & negative words driving the prediction output. |
| **Responsible AI Disclaimer** | **MUST-HAVE** | Non-dismissible disclaimer explaining stylistic vs. factual reality limitations. |
| **CPU Execution Guarantee** | **MUST-HAVE** | Complete pipeline runs on consumer laptop CPU; zero GPU dependencies. |
| **Client-Side Session History** | **MUST-HAVE (MVP)** | In-browser list of last 3–5 analyses stored in browser `localStorage`. |
| **User Authentication (Login/Register)** | **EXCLUDED (MVP)** | Deferred to a later release to preserve focus on core ML pipeline. |
| **Persistent Database Storage** | **PLANNED (Full App)**| PostgreSQL + SQLAlchemy + Alembic planned for the full application. |
| **URL Scraping / Web Crawler** | **EXCLUDED (Tier C)** | Excluded due to dynamic JS, anti-bot blocking, and paywalls. |
| **Live Fact-Check API Retrieval** | **EXCLUDED (Tier C)** | Excluded; requires external API keys and knowledge-grounded search. |

---

## 4. MVP Acceptance Checklist
Before declaring Phase 1 (Data & Modeling) and Phase 2 (App Engineering) complete, the MVP must pass these verification gates:

> [!NOTE]
> All performance and latency limits stated below and across project documentation are **provisional engineering targets**, not guaranteed specifications. They guide optimization priorities and will be validated against real CPU benchmarks.

- [ ] **Functional Gate**: An English news snippet and a Hindi news snippet (Devanagari script) can both be submitted via the UI and yield valid, distinct predictions.
- [ ] **Explainability Gate**: The UI clearly displays at least 5 key terms that influenced the decision.
- [ ] **Accuracy / Calibration Gate**: Confidence scores are calibrated; near-chance probabilities are explicitly labeled "Low Confidence / Inconclusive".
- [ ] **Performance Gate**: Total processing time from button click to rendered result meets the provisional engineering target (< 1.5 seconds) on a standard CPU.
- [ ] **Safety & Ethics Gate**: Prominent non-dismissible disclaimer is visible on the results screen.
- [ ] **Engineering Gate**: Automated test suite covers language detection, preprocessing, and inference with 100% deterministic test passes.
