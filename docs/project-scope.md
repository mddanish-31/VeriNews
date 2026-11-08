# Project Scope: VeriNews

## 1. Executive Summary
VeriNews is an educational and portfolio-grade multilingual news credibility analysis platform designed for solo development and execution on consumer CPU hardware.

To ensure timely completion, high code quality, and maintainable software engineering practices, this document delineates strict boundaries across three lifecycle tiers:
- **Tier A: Must-Have MVP (Phase 1–Phase 4)**
- **Tier B: Secondary Features (Stretch Goals)**
- **Tier C: Future Enhancements (Long-Term Roadmap)**

---

## 2. Scope Categorization

### Tier A: Must-Have MVP
The initial release must deliver an end-to-end, functional, and self-contained prototype:

1. **Modern Decoupled Interface (Next.js App Router + React + TypeScript + Tailwind CSS)**:
   - Frontend application built with Next.js App Router, React, TypeScript, and Tailwind CSS.
   - Streamlit was evaluated but is explicitly **not selected** as the production frontend to avoid architectural dead-ends.
   - Textarea with character count and length validation (minimum ~100 characters, maximum ~5,000 characters).
   - In-browser session history storing the last 3–5 analyses in `localStorage` without backend dependency.

2. **Multilingual Processing (English and Hindi - Devanagari Script)**:
   - Automated language identification (routing between English and Hindi text).
   - Clean handling of standard English ASCII/Unicode and Hindi Devanagari Unicode text (`\u0900-\u097F`).
   - Romanized Hindi / Hinglish is explicitly out of scope for the initial MVP.
   - Script-aware preprocessing (stopword handling, punctuation stripping, whitespace normalization).

3. **Machine Learning Credibility Classification (Scikit-Learn Baseline)**:
   - Dual TF-IDF vectorizers with calibrated linear classifiers (Logistic Regression / Linear SVM) executed via Python + Scikit-Learn.
   - Multilingual transformer experiments (e.g., XLM-RoBERTa) deferred to secondary research benchmarking.
   - Binary credibility prediction (`Likely Credible` vs. `Potentially Unreliable / Sensationalist`).
   - Calibrated confidence score (percentage and qualitative tier: Low, Moderate, High confidence).
   - Local hardware execution guaranteed: 100% CPU-only compatibility.
   - Note: Latency limits (< 1.5s) are provisional engineering targets, not guaranteed specifications.

4. **Decoupled Backend API (Python + FastAPI)**:
   - RESTful API endpoints powered by FastAPI and Pydantic validation.
   - Decoupled `src/verinews/` ML core callable independently from CLI, tests, or web server.

5. **Explainable AI (Feature Contribution)**:
   - Highlighting or listing the top positive and negative vocabulary features (tokens) contributing to the score using interpretable model coefficients.

6. **Responsible AI Disclaimers & Education**:
   - Prominent non-dismissible UI disclaimer clarifying that model scores reflect linguistic pattern similarity, not empirical factual verification.
   - Educational tooltips explaining why certain words trigger credibility flags.

7. **Reproducible Engineering**:
   - Clean dependency files (`requirements.txt`, `package.json`).
   - Clear project structure and offline model artifact loading.

---

### Tier B: Secondary Features (Post-MVP / Stretch Goals)
These features will be evaluated only after the core Tier A pipeline is fully validated and tested:

1. **User Authentication & Session Management**:
   - User registration and login (email/password or session token).
   - **Decision**: Deferred to a later release. MVP history relies exclusively on browser `localStorage` (last 3–5 analyses) to keep initial engineering focused on ML evaluation.

2. **Persistent Database Integration (PostgreSQL + SQLAlchemy + Alembic)**:
   - Storing persistent user accounts, historical submissions, analysis reports, and model feedback.
   - Architecture decision: PostgreSQL with SQLAlchemy ORM and Alembic schema migrations planned for the full application.

3. **Multilingual Transformer Integration**:
   - Incorporating fine-tuned XLM-RoBERTa or IndicBERT models as optional advanced inference engines alongside the CPU-optimized Scikit-Learn baseline.

4. **Batch Analysis**:
   - Uploading a CSV file with multiple headlines or short articles for bulk credibility evaluation.

5. **Confidence Threshold Customization**:
   - Allowing technical users or researchers to adjust classification probability thresholds.

---

### Tier C: Future Enhancements (Explicitly Out of MVP Scope)
The following capabilities are deliberately excluded from the initial and secondary phases to prevent scope creep and maintain technical feasibility:

1. **Live Web Scraping & URL Extraction**:
   - *Rationale*: Modern news sites employ dynamic client-side rendering (React/Next.js), aggressive paywalls, anti-bot mechanisms (Cloudflare, CAPTCHAs), and frequent DOM changes. Scraping requires complex browser automation (Playwright/Puppeteer) that adds fragility unrelated to core NLP modeling.
2. **Real-Time Live Fact-Checking & Knowledge Retrieval**:
   - *Rationale*: Checking whether a real-world claim occurred requires knowledge graph grounding, web search APIs (Bing/Google API costs), and Retrieval-Augmented Generation (RAG). This is out of scope for a local CPU-based beginner NLP project.
3. **Browser Extensions (Chrome/Firefox)**:
   - *Rationale*: Requires separate JavaScript Manifest V3 codebase, background service workers, and cross-origin security configurations.
4. **Multimodal Analysis (Images, Deepfake Videos, Memes)**:
   - *Rationale*: Requires computer vision pipelines, reverse image search, OCR models, and significant GPU memory.
5. **Code-Mixed / Hinglish Romanized Processing**:
   - *Rationale*: Social media "Hinglish" (Hindi written in Latin script) lacks standardized spelling and standardized training datasets, leading to high noise. Phase 0 restricts Hindi input to standard Devanagari script.

---

## 3. Hardware & Operational Boundaries
- **Inference Hardware**: Standard consumer CPU (x86_64, minimum 8GB RAM). Zero local GPU requirements.
- **Model Training Hardware**: Local CPU (for lightweight models such as Logistic Regression, Linear SVM, Naive Bayes) or free-tier cloud environments (Google Colab / Kaggle Notebooks) if fine-tuning compact transformer models.
- **Cost Ceiling**: $0.00 (Zero paid cloud APIs, zero proprietary LLM tokens). All tools, datasets, and libraries must be open-source and freely accessible.
