# VeriNews — Canonical Project Roadmap

**Authoritative Roadmap Document**  
**Repository:** `VeriNews` — Multilingual Fake News Detection Using NLP and Machine Learning  
**Last Updated:** 2026-11-11  
**Status Reference:** See [PHASE_STATUS.md](file:///c:/Users/mddan/Desktop/VeriNews/docs/PHASE_STATUS.md) for detailed phase evidence and validation logs.  
**Machine-Readable Companion:** [project-tracker/roadmap.json](file:///c:/Users/mddan/Desktop/VeriNews/project-tracker/roadmap.json)  
**Knowledge Graph Companion:** [graphify-out/GRAPH_REPORT.md](file:///c:/Users/mddan/Desktop/VeriNews/graphify-out/GRAPH_REPORT.md)  

---

## 1. Architectural Scope & Roadmap Structure

The VeriNews roadmap is organized into two sequential tracks:
1. **Core Platform & ML Foundations (P00 through P15):** The original 16-phase research, machine learning, dataset feasibility, backend engineering, security hardening, and reliability verification track.
2. **Premium Experience Redesign (Phase 1 through Phase 5):** The frontend visual, interaction, and WebGL architecture redesign track following the Ponytail Workflow.

---

## 2. Track 1: Core Platform & ML Foundations (P00 – P15)

| Phase ID | Phase Name | Status | Category | Scope Summary |
| :--- | :--- | :--- | :--- | :--- |
| **P00** | Product Scope and Requirements | **Completed** | Product | Define core problem statement, multilingual scope (English & Hindi), non-goals, and scientific truth boundaries. |
| **P01** | Research and Dataset Feasibility | **In Progress / Blocked** | Research / ML | Provenance, licensing, annotation quality, and label integrity audits across WELFake, Indic Zenodo, IFND, and TaLLIP. |
| **P02** | UI/UX Design System | **Completed** | Design | High-fidelity UI layouts, typography tokens, light/dark themes, accessibility specifications. |
| **P03** | Frontend Foundation | **Completed** | Frontend | Next.js 16 App Router, React 19, TypeScript, Tailwind CSS responsive layouts. |
| **P04** | Complete Frontend with Mock Data | **Completed** | Frontend | Interactive preview with mock payloads, client-side history, theme toggle, and responsive verification. |
| **P05** | Database Design | **Completed** | Backend | Zero Content Retention database architecture (SQLAlchemy 2.0, Alembic migrations, PostgreSQL schema). |
| **P06** | Backend Foundation and API Contract | **Completed** | Backend | FastAPI service skeleton, Pydantic schemas, Unicode script detection, rate limiting, and health check. |
| **P07** | Backend and Database Integration | **Completed** | Backend | Decoupled session management, transaction safety, and Zero Retention verification fixtures. |
| **P08** | Dataset Preparation and ML Data Foundations | **Completed** | ML | Python ML schemas, safe data loaders, record sanitizers, and unit validation suites. |
| **P09** | NLP Preprocessing and Language Routing | **Incorporated (P10/P13)** | ML / NLP | Unicode-based routing for Latin/English and Devanagari/Hindi; text cleaning routines. |
| **P10** | Classical ML Training and Evaluation | **Completed** | ML | Classical baseline pipelines (TF-IDF + Logistic Regression / LinearSVC); leakage audit across training splits. |
| **P11** | Calibration, Explainability and Benchmarking | **Completed** | ML | Platt sigmoid scaling (`CalibratedClassifierCV`), local in-memory token explainability, and Responsible AI disclaimers. |
| **P12** | Optional Transformer Experiment | **Not Started / Deferred** | ML | Exploration of mBERT / IndicBERT; deferred in favor of lightweight, explainable linear baselines. |
| **P13** | ML, FastAPI and Frontend Integration | **Completed** | Integration | Connecting FastAPI service to serialized calibrated model artifacts; decoupled language inference gates. |
| **P14** | Testing, Security, Privacy and Hardening | **Completed** | Security / QA | Rate limiting (60 req/min), 64 KB payload guard, headline length constraints (20–500 chars), SSRF hardening (VN-04). |
| **P15** | Deployment, Documentation and v1.0 Release | **Review Pending** | DevOps / Release | 12-scenario Browser E2E verification, 13 screenshots, master mentor review package. Gated on mentor approval. |

---

## 3. Track 2: Premium UI Redesign (Phases 1 – 5)

| Phase ID | Phase Name | Status | Category | Scope Summary |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | Foundational Design System & Base UI Atoms | **Completed & Approved** | Frontend / Design | Design tokens, glassmorphism utilities, Lenis + GSAP SmoothScrollProvider, GlassCard, PillBadge, MagneticButton, CustomCursor. |
| **Phase 2** | WebGL Particle Hero & Cinematic Motion | **Completed & Approved** | Creative Dev / WebGL | Vanilla Three.js particle field, GLSL wave horizon shader, GSAP entrance timeline, theme sync, reduced-motion compliance. |
| **Phase 3** | Complete Homepage Experience | **OWNER APPROVED (100%)** | Frontend / UI | Full 10-point homepage experience: responsive navbar, Phase 2 hero integration, redesigned Analyzer, redesigned AnalysisResult, 3 feature sections, research/trust/privacy section, redesigned footer, cross-viewport layouts. Tasks P3-T01 through P3-T09 complete. Documented follow-ups (mobile drawer focus cycling, external link new-tab announcement, independent screenshot review) earmarked for Phase 4. |
| **Phase 4** | Remaining Screens & Experiences | **OWNER APPROVED (100%)** | Frontend / UX | Remaining routes (/ and /project-tracker), redesigned InfoModal dialogs (Methodology, Limitations, FAQ, Privacy, Terms) with accessible focus traps, mobile drawer circular focus cycling, external link new tab announcements, dual-track project tracker. Officially approved by project owner on 2026-11-11. |
| **Phase 5** | Final QA & Optimization | **OWNER APPROVED (100%)** | QA / Performance | Multi-viewport zero overflow (desktop, tablet, mobile), WebGL context loss recovery handling, prefers-reduced-motion verification, light theme transitions, 151/151 backend/ML regression pass, strict Zero Content Retention client storage audit, Graphify synchronization. Officially approved by project owner on 2026-11-11. |

---

## 4. Governance & Progression Rules

1. **Owner Approval Gate:** No phase may transition from `Not Started` to `In Progress` without explicit owner/mentor authorization.
2. **Traceable Evidence:** A phase cannot be marked `Completed` without passing static typecheck, linting, production build, backend/ML regressions, and verified visual/interaction evidence.
3. **Graphify Sync:** Knowledge graph must be synchronized via `graphify update .` upon code changes.
4. **Zero Fabrication:** Unmeasured hours or unverified test results remain `Pending`.

