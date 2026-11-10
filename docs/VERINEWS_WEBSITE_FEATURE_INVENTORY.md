# VeriNews — Complete Website Feature Inventory & Component Audit
**Comprehensive Technical Documentation of Pages, Components, Interactions, and Verification Status**

- **Document Version**: 1.0.0
- **Audited Date**: 2026-11-10
- **Application Framework**: Next.js 16.4.5 (App Router, Turbopack, React 19, TypeScript)
- **Styling Architecture**: Tailwind CSS 3.4+ with custom design system variables and dark mode
- **Repository Root**: `C:\Users\mddan\Desktop\VeriNews`

---

## 1. Executive Summary

This document provides a comprehensive technical inventory of all implemented user-facing pages, interactive components, navigation structures, API integration clients, UI states, and responsive design behaviors across the VeriNews web application.

Each feature is audited against actual repository source code and classified with its implementation status, relevant source files, verification evidence, and remaining limitations.

---

## 2. Route and Page Inventory

### 2.1 Root Application Page (`/`)
- **Route**: `GET /`
- **Source File**: [`frontend/src/app/page.tsx`](file:///C:/Users/mddan/Desktop/VeriNews/frontend/src/app/page.tsx) $\rightarrow$ [`frontend/src/App.tsx`](file:///C:/Users/mddan/Desktop/VeriNews/frontend/src/App.tsx)
- **Status**: **Implemented and Verified**
- **Architecture**: Client Component (`'use client'`) composing all primary application sections into a single-page responsive layout.
- **Verification Evidence**:
  - Next.js production build (`npm run build`) generates static route `/` with exit code 0.
  - Browser E2E Scenario 12 (Desktop 1280×800 and Mobile 375×667 screenshots).
- **Remaining Limitations**: The page is rendered as a client-side application shell; server-side rendering for analysis results is intentionally omitted to prevent headline retention.

### 2.2 Project Control Center & Tracker Dashboard (`/project-tracker`)
- **Route**: `GET /project-tracker`
- **Source Files**:
  - Page Router: [`frontend/src/app/project-tracker/page.tsx`](file:///C:/Users/mddan/Desktop/VeriNews/frontend/src/app/project-tracker/page.tsx)
  - UI Component: [`frontend/src/app/project-tracker/tracker-dashboard.tsx`](file:///C:/Users/mddan/Desktop/VeriNews/frontend/src/app/project-tracker/tracker-dashboard.tsx)
  - Server Data Loader: [`frontend/src/lib/project-tracker-data.server.ts`](file:///C:/Users/mddan/Desktop/VeriNews/frontend/src/lib/project-tracker-data.server.ts)
  - Type Definitions: [`frontend/src/lib/project-tracker-types.ts`](file:///C:/Users/mddan/Desktop/VeriNews/frontend/src/lib/project-tracker-types.ts)
- **Status**: **Implemented and Verified (Development Mode Only)**
- **Architecture**: Server-side loaded dashboard (`force-dynamic`). In production (`NODE_ENV === 'production'`), it automatically calls `notFound()` to prevent public exposure of internal engineering tracking data.
- **Features**:
  - Live phase-by-phase status cards (P00 through P15).
  - Filter by Phase, Status (`Completed`, `In Progress`, `Not Started`), and Priority.
  - Expandable task cards showing execution history, timestamps, blockers, and verification evidence.
  - Graceful fallback: renders a safe "Unavailable" UI if JSON records are missing or malformed without crashing.
- **Verification Evidence**:
  - Verified in Phase P04 testing: `http://localhost:3000/project-tracker` returned HTTP 200 with dynamic snapshot data.

---

## 3. Global Layout, Styling, and Accessibility

### 3.1 Root Layout Shell
- **Source File**: [`frontend/src/app/layout.tsx`](file:///C:/Users/mddan/Desktop/VeriNews/frontend/src/app/layout.tsx)
- **Status**: **Implemented and Verified**
- **Features**:
  - HTML structure with `lang="en"` and `suppressHydrationWarning`.
  - Google Fonts integration via `next/font/google`: Inter (`--font-sans`) and Plus Jakarta Sans (`--font-display`).
  - Inline head script: Evaluates browser `localStorage.getItem('verinews-theme')` or system preference (`prefers-color-scheme`) and applies `dark` class before DOM render, preventing theme flash.
  - Metadata: Title, description, and viewport configuration.

### 3.2 Design System and Theme Tokens
- **Source File**: [`frontend/src/app/globals.css`](file:///C:/Users/mddan/Desktop/VeriNews/frontend/src/app/globals.css)
- **Status**: **Implemented and Verified**
- **Tokens Implemented**:
  - Light mode CSS variables: `--color-main: #f8f9ff`, `--color-surface: #ffffff`, `--color-border: #e2e8f0`.
  - Dark mode CSS variables: `--color-main: #090b14`, `--color-surface: #111425`, `--color-border: #232942`.
  - Brand identity colors: `--color-brand-blue: #2563eb`, `--color-brand-violet: #7c3aed`.
  - Status indicators: `--color-status-success: #10b981`, `--color-status-danger: #ef4444`, `--color-status-warning: #f59e0b`.
  - Accessibility: Skip-to-main-content link (`.skip-link`) positioned off-screen until focused.

---

## 4. Component Feature Inventory

### 4.1 Header and Navigation Bar (`NavBar`)
- **Source File**: [`frontend/src/components/NavBar.tsx`](file:///C:/Users/mddan/Desktop/VeriNews/frontend/src/components/NavBar.tsx)
- **Status**: **Implemented and Verified**
- **Features**:
  - Sticky header (`sticky top-0 z-50`) with backdrop blur (`backdrop-blur-md`).
  - Brand Logo: 3 slanted pill stripes (blue and violet) with hover scaling animation and link to `#home`.
  - Desktop Navigation: Pill-style links to `#home`, `#why-verinews`, `#analyzer`, `#history`, `#about`.
  - Mobile Menu Drawer: Collapsible navigation menu triggered by hamburger button; includes Escape key listener and backdrop click handler.
  - Theme Toggle Integration: Desktop and mobile placements of `<ThemeToggle />`.
  - Quick CTA: "Try the Analyzer" button scrolling smoothly to `#analyzer`.
- **Verification Evidence**:
  - Verified across desktop (1280×800) and mobile (375×667) in E2E Scenario 12.

### 4.2 Hero Section & Illustration
- **Source Files**: [`frontend/src/App.tsx`](file:///C:/Users/mddan/Desktop/VeriNews/frontend/src/App.tsx) (lines 153–230), [`frontend/src/components/HeroIllustration.tsx`](file:///C:/Users/mddan/Desktop/VeriNews/frontend/src/components/HeroIllustration.tsx)
- **Status**: **Implemented and Verified**
- **Features**:
  - Research Preview pill badge with shield icon.
  - Two-tone typography: "Verify News. Read Smarter." with gradient text clip.
  - Explanatory subtitle establishing multilingual scope in English and Hindi.
  - Primary CTA buttons: "Explore the Analyzer" and "How It Works".
  - Language indicator badges: English and Hindi pills.
  - Custom SVG Hero Illustration: Multi-layered graphic showing verification shield, data streams, and trust nodes with light/dark adaptive strokes.
- **Verification Evidence**:
  - Visually audited during initial E2E runs (captured at scroll position 0,0).

### 4.3 "Why VeriNews?" Educational Grid
- **Source File**: [`frontend/src/App.tsx`](file:///C:/Users/mddan/Desktop/VeriNews/frontend/src/App.tsx) (lines 232–300)
- **Status**: **Implemented and Verified**
- **Features**:
  - Section anchor `#why-verinews`.
  - 3-card feature grid explaining the core philosophical pillars:
    1. **Language Analysis**: Studies style, grammar, lexicon, and tone.
    2. **Pattern Detection**: Identifies sensationalism and manufactured urgency.
    3. **Context First**: Encourages critical reading rather than trusting models as truth arbiters.
  - Hover elevation and border accent transitions.

### 4.4 Interactive Headline Analyzer Card (`Analyzer`)
- **Source File**: [`frontend/src/components/Analyzer.tsx`](file:///C:/Users/mddan/Desktop/VeriNews/frontend/src/components/Analyzer.tsx)
- **Status**: **Implemented and Verified**
- **Features**:
  - Section anchor `#analyzer`.
  - Textarea (`#article-input`): 20–500 character headline input field with auto-resizing guidance.
  - Trimmed Character Counter: Real-time non-whitespace counter displaying `length / 500 characters`. Displays amber threshold guidance (*"Add X more characters to reach the 20-character headline minimum"*) when input is between 1 and 19 characters.
  - Pre-Curated Sample Inserters: "English sample" and "Hindi sample" buttons that prefill verified headline excerpts.
  - Language Selector: Dropdown selector allowing users to specify `Auto-detect`, `English`, or `Hindi`.
  - Analyze Button: Submits payload to backend; displays animated SVG spinner and "Analyzing..." state while in-flight; disabled when input is invalid or request is active.
  - Clear Button: Single-click atomic reset calling `clearText()` and `onClear()` callback, resetting textarea, submit attempts, character counter, validation messages, and active result cards.
- **Verification Evidence**:
  - Browser E2E Scenarios 1, 3, 5, 8, 10.

### 4.5 Prediction Result Interface (`AnalysisResult`)
- **Source File**: [`frontend/src/components/AnalysisResult.tsx`](file:///C:/Users/mddan/Desktop/VeriNews/frontend/src/components/AnalysisResult.tsx)
- **Status**: **Implemented and Verified**
- **Dual Visual Modes**:
  1. **Standard Classification Result State**:
     - Status Header: Green indicator dot for `Credible`; red/amber for `Unreliable`.
     - Prediction Badge: `Credible` or `Unreliable` with semantic styling.
     - Confidence Hierarchy: Displays confidence tier (`High Confidence Pattern`, `Moderate Confidence Pattern`) and percentage badge (`82%`).
     - Visual Bar: Gradient progress bar filled to the exact percentage.
     - Model Metadata: Serialized model version (`en_ifnd_indian_headlines_calibrated_sigmoid`) and CPU latency in milliseconds.
     - Linguistic Context: Detected language badge (`English` / `Hindi`).
     - Feature Attribution: Top 5 influential tokens displayed as pill badges ($w_i \cdot \text{TF-IDF}_i$). Pure stop words are filtered out.
     - Non-Dismissible Disclaimer: Responsible AI caution directing users to accredited fact-checkers.
  2. **Unclassifiable / Out of Domain Result State (P15 Improvement)**:
     - Neutral Status Dot: Muted grey dot (`bg-content-muted`).
     - Header Badge: `Unclassifiable / Out of Domain`.
     - Confidence Display: "Not applicable" text; **zero percentage badges and zero progress bars**.
     - Out-of-Domain Note: Explains that submitted text contains no in-vocabulary training tokens.
     - Feature Attribution: Omitted (`influential_tokens=[]`).
- **Verification Evidence**:
  - Browser E2E Scenario 1 (`scenario-1-english-headline.png`) and Scenario 2/11 (`scenario-2-unclassifiable-gibberish.png`, `scenario-11-unclassifiable-visuals.png`).

### 4.6 History Section (`Recent Reads`)
- **Source Files**: [`frontend/src/App.tsx`](file:///C:/Users/mddan/Desktop/VeriNews/frontend/src/App.tsx) (lines 378–434), [`frontend/src/components/HistoryItem.tsx`](file:///C:/Users/mddan/Desktop/VeriNews/frontend/src/components/HistoryItem.tsx)
- **Status**: **Implemented as Preview Placeholder (Verified)**
- **Features**:
  - Section anchor `#history`.
  - Header: "Your reading space — Recent reads."
  - Notice Badge: "No analysis history is available in this preview".
  - Empty State Card: Dashed border container with clock icon and "Your history starts here. The analysis service is not connected, so no real analysis history is available or stored."
  - Action link: "Go to Analyzer" scrolling to `#analyzer`.
  - Component Architecture: `historyEntries` is maintained as an empty state array (`useState<HistoryEntryData[]>([])`). In accordance with Zero Content Retention, no analysis results are written to browser storage or server databases.
- **Verification Evidence**:
  - Desktop browser screenshot (`scenario-12-desktop-1280x800.png`).

### 4.7 About Section & Scientific Caveats
- **Source File**: [`frontend/src/App.tsx`](file:///C:/Users/mddan/Desktop/VeriNews/frontend/src/App.tsx) (lines 436–521)
- **Status**: **Implemented and Verified**
- **Features**:
  - Section anchor `#about`.
  - Headline: "Curious about the story. Careful about the answer."
  - 3 Core Cards:
    1. *01 / What it does*: Studies linguistic and stylistic patterns in English and Hindi.
    2. *02 / What it doesn't*: It doesn't fact-check; cannot verify real-time events.
    3. *03 / Why it matters*: Training data and publisher formatting shape outputs.
  - Caution Callout: Warning icon reminding readers to consult credentialed fact-checkers for civic or health claims.
  - Quick CTA: "Try the Analyzer" button.

### 4.8 Footer and Modal System (`InfoModal`)
- **Source Files**: [`frontend/src/App.tsx`](file:///C:/Users/mddan/Desktop/VeriNews/frontend/src/App.tsx) (lines 523–656), [`frontend/src/components/InfoModal.tsx`](file:///C:/Users/mddan/Desktop/VeriNews/frontend/src/components/InfoModal.tsx)
- **Status**: **Implemented and Verified**
- **Footer Navigation**:
  - Brand column with logo and tagline ("Read with curiosity. Think with care.").
  - "Explore" links: `#home`, `#why-verinews`, `#analyzer`, `#history`, `#about`.
  - "Resources" links (trigger modals): `Methodology`, `Limitations`, `FAQ`.
  - "Legal" links (trigger modals): `Privacy Policy`, `Terms of Use`.
  - Bottom Bar: Copyright notice and non-dismissible caveat ("AI can inform. It cannot verify reality.").
- **Modal Dialog Features (`InfoModal.tsx`)**:
  - Accessible dialog (`role="dialog"`, `aria-modal="true"`) with backdrop blur.
  - Escape key listener and backdrop click-to-dismiss.
  - Close button (`aria-label="Close dialog"`).
  - Rich educational and legal content across all 5 modal types:
    - `methodology`: Explains TF-IDF, linear classification, calibration, and token attribution.
    - `limitations`: Explains dataset bounds, publisher bias, and lack of real-time web verification.
    - `faq`: Answers questions about scoring, language routing, and model confidence.
    - `privacy`: Details the Zero Content Retention policy and explains that only theme preference is stored.
    - `terms`: Sets forth educational, non-commercial terms of use.

### 4.9 Theme Switcher (`ThemeToggle`)
- **Source File**: [`frontend/src/components/ThemeToggle.tsx`](file:///C:/Users/mddan/Desktop/VeriNews/frontend/src/components/ThemeToggle.tsx)
- **Status**: **Implemented and Verified**
- **Features**:
  - Sun / Moon animated icon toggle.
  - Toggles `dark` class on `document.documentElement`.
  - Persists preference in `localStorage.setItem('verinews-theme', 'dark' | 'light')`.
- **Verification Evidence**:
  - Evaluated in E2E Scenario 12 and verified in unit/browser tests.

---

## 5. Frontend API Client and Integration Workflow

### 5.1 Endpoint Resolution (`resolveApiBase`)
- **Source File**: [`frontend/src/App.tsx`](file:///C:/Users/mddan/Desktop/VeriNews/frontend/src/App.tsx) (lines 13–22)
- **Resolution Priority**:
  1. `process.env.NEXT_PUBLIC_API_URL` (if configured, strips trailing slashes).
  2. If browser hostname is `127.0.0.1`, resolves to `http://127.0.0.1:8000`.
  3. Default fallback: `http://localhost:8000`.
- **Dual-Stack Resilience**: Includes automated localhost/127.0.0.1 dual-stack fallback fetch in catch handler to prevent IPv4/IPv6 socket binding discrepancies on Windows.

### 5.2 Request Sequencing & Race-Condition Guard (P15)
- **Problem**: When a network request was in-flight and the user cleared the form or submitted a new query, late HTTP responses previously overwrote the clean UI.
- **Implementation**:
  ```typescript
  const latestRequestId = useRef(0)
  // On submit:
  const thisRequestId = ++latestRequestId.current
  // On Clear:
  latestRequestId.current++
  // In fetch response handler:
  if (thisRequestId !== latestRequestId.current) return
  ```
- **Verification Evidence**:
  - Automated Browser E2E Scenario 9 (`scenario-9-race-condition-guard.png`).

### 5.3 Error Message Sanitization
- **Implementation**: In [`frontend/src/App.tsx`](file:///C:/Users/mddan/Desktop/VeriNews/frontend/src/App.tsx) (lines 118–127), backend error responses are parsed cleanly:
  - If `detail` is a string (e.g. 422 Hinglish or 503 Model Unavailable), renders the string directly.
  - If `detail` is an array of Pydantic validation errors, joins `e.msg` with semicolons.
  - Never dumps raw JSON stack traces or internal server exception details to users.
- **Verification Evidence**:
  - Browser E2E Scenarios 3, 5, 6, 7.

---

## 6. Comprehensive Website Feature Audit Matrix

| Feature / UI Component | Implementation Status | Source File References | Verification Level | Known Limitations / Remaining Work |
| :--- | :--- | :--- | :--- | :--- |
| **Root Homepage (`/`)** | Implemented & Verified | `frontend/src/app/page.tsx`<br>`frontend/src/App.tsx` | Next.js Build & E2E Pass | Client-side application shell. |
| **Project Tracker (`/project-tracker`)** | Implemented & Verified | `frontend/src/app/project-tracker/page.tsx`<br>`tracker-dashboard.tsx` | Browser QA Pass | Dev mode only (`notFound()` in production). |
| **Theme System (Light/Dark)** | Implemented & Verified | `layout.tsx`, `globals.css`<br>`ThemeToggle.tsx` | CDP Storage & E2E Pass | None. |
| **Header Navbar** | Implemented & Verified | `NavBar.tsx` | Browser E2E Pass | None. Responsive drawer active. |
| **Hero Section & Graphic** | Implemented & Verified | `App.tsx`, `HeroIllustration.tsx` | Visual Inspection Pass | None. |
| **"Why VeriNews?" Grid** | Implemented & Verified | `App.tsx` | Browser E2E Pass | Static informational content. |
| **Headline Input Textarea** | Implemented & Verified | `Analyzer.tsx` | Browser E2E Pass | Bounded to 20–500 characters. |
| **Trimmed Character Counter** | Implemented & Verified | `Analyzer.tsx` | Browser E2E Pass (Scen. 10) | None. Non-whitespace counting. |
| **Sample Headlines Inserter** | Implemented & Verified | `Analyzer.tsx` | Browser E2E Pass | Curated illustrative samples only. |
| **Language Selection** | Implemented & Verified | `Analyzer.tsx` | Browser E2E Pass (Scen. 6, 7) | Auto, English, Hindi supported. |
| **Atomic Clear Button** | Implemented & Verified | `Analyzer.tsx`, `App.tsx` | Browser E2E Pass (Scen. 8) | Atomically resets input and results. |
| **Request Race Guard** | Implemented & Verified | `App.tsx` (`latestRequestId`) | Browser E2E Pass (Scen. 9) | Discards stale in-flight responses. |
| **Standard Prediction Card** | Implemented & Verified | `AnalysisResult.tsx` | Browser E2E Pass (Scen. 1, 4) | Stylistic pattern, not factual truth. |
| **Unclassifiable Result Card** | Implemented & Verified | `AnalysisResult.tsx` | Browser E2E Pass (Scen. 2, 11) | Neutral dot, no progress bar. |
| **Stop-Word Explanation Filter** | Implemented & Verified | `ml/explainability.py` | Unit Test & E2E Pass | Excludes uninformative tokens. |
| **Live Status Alert Banner** | Implemented & Verified | `App.tsx` (`role="status"`) | Browser E2E Pass (Scen. 3, 5) | Displays human-readable notices. |
| **History Reading Space** | Implemented (Preview) | `App.tsx`, `HistoryItem.tsx` | Visual Inspection Pass | Mock preview; persistence omitted. |
| **About Educational Section** | Implemented & Verified | `App.tsx` | Browser E2E Pass | Static scientific caveats. |
| **Modal Documentation Dialogs** | Implemented & Verified | `InfoModal.tsx` | Interactive UI Pass | 5 modal types fully populated. |
| **Footer Navigation & Legal** | Implemented & Verified | `App.tsx` | Browser E2E Pass | None. |
| **Dual-Stack API Fallback** | Implemented & Verified | `App.tsx` (`resolveApiBase`) | Script Regression Pass | Handles localhost/127.0.0.1. |
| **Mobile Responsive Layout** | Implemented & Verified | Tailwind utility classes | Browser E2E Pass (Scen. 12b) | Verified at 375×667 viewport. |

