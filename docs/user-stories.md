# User Stories: VeriNews

## 1. User Personas

### Persona 1: Priya Sharma (Everyday News Consumer)
- **Profile**: 24-year-old marketing professional living in Delhi. Active user of WhatsApp and Instagram. Frequently encounters viral news claims regarding health advisories, government policies, and breaking news in both Hindi and English.
- **Pain Points**: Doesn't have time to conduct deep investigative research on every viral forward. Needs a fast, trustworthy tool to assess whether a message uses clickbait/sensationalist language.
- **Goal**: Paste a forwarded message and receive a rapid, easily understood credibility assessment with clear disclaimers.

### Persona 2: Rohit Verma (Media Studies Student & Researcher)
- **Profile**: 21-year-old undergraduate student studying journalism and mass communication. Analyzes linguistic framing, sensationalism, and rhetorical tropes in bilingual news reporting.
- **Pain Points**: Black-box tools only give a generic "Fake" or "Real" label without showing which specific words or phrases swayed the decision.
- **Goal**: Understand *why* an article was categorized as sensationalist by viewing keyword weights and linguistic feature highlights.

### Persona 3: Alex Chen (Senior Engineering Lead / Technical Recruiter)
- **Profile**: Engineering manager evaluating the developer's portfolio for an intermediate software engineering / applied ML role.
- **Pain Points**: Sees many junior portfolios with cut-and-paste wrapper code, uncalibrated claims of 99% accuracy, zero test coverage, and heavy unmaintainable dependencies.
- **Goal**: Review clean, modular, CPU-compatible code, thoughtful multilingual handling, solid unit tests, clear documentation, and ethical awareness regarding the limits of NLP.

---

## 2. User Stories & Acceptance Criteria

### Epic 1: Text Input & Multilingual Ingestion

#### US-1.1: Paste and Validate News Text
- **Story**: As a news consumer (Priya), I want to paste a block of news text into a simple input field and click "Analyze", so that I can quickly check its credibility.
- **Acceptance Criteria**:
  - **Given** I am on the VeriNews home page,
  - **When** I paste 250 characters of news text and click "Analyze",
  - **Then** the system accepts the text and displays a loading indicator while processing.
  - **Given** I enter fewer than 100 characters of text,
  - **When** I click "Analyze",
  - **Then** an inline validation message appears: `"Input too short. Please provide at least 100 characters for analysis."`, and no inference request is dispatched.

#### US-1.2: Automatic Language Identification
- **Story**: As a bilingual user (Priya), I want the system to automatically detect whether my text is in English or Hindi, so that I don't have to manually select a language toggle every time.
- **Acceptance Criteria**:
  - **Given** I paste an English news article,
  - **When** I trigger analysis,
  - **Then** the system detects `English (en)`, routes it to the English NLP pipeline, and displays `"Detected Language: English"`.
  - **Given** I paste a Hindi news snippet written in Devanagari script,
  - **When** I trigger analysis,
  - **Then** the system detects `Hindi (hi)`, routes it to the Hindi NLP pipeline, and displays `"Detected Language: Hindi (हिन्दी)"`.

#### US-1.3: Preloaded Sample Articles
- **Story**: As a first-time visitor (Alex / Rohit), I want to click sample buttons for English and Hindi news, so that I can instantly evaluate how the platform works without finding an article myself.
- **Acceptance Criteria**:
  - **Given** the input area is empty,
  - **When** I click `"Sample: Hindi Sensationalist News"`,
  - **Then** the text area is automatically populated with a curated Hindi sample snippet and ready for analysis.

---

### Epic 2: Credibility Assessment & Calibrated Scoring

#### US-2.1: View Credibility Classification and Confidence Score
- **Story**: As a news reader (Priya), I want to see a clear credibility verdict and an honest confidence score, so that I know how reliable the algorithm's prediction is.
- **Acceptance Criteria**:
  - **Given** an article has been processed,
  - **When** the results are displayed,
  - **Then** I see a primary label (e.g., `"Likely Credible"` or `"Potentially Unreliable / Sensationalist"`) accompanied by a confidence percentage and tier (e.g., `"76% — Moderate Confidence"`).
  - **Given** the model output probability is close to random chance (between 0.50 and 0.65),
  - **When** the results are shown,
  - **Then** the score is labeled as `"Low Confidence / Inconclusive Stylistic Signals"` rather than presenting a false certainty.

---

### Epic 3: Explainability & Linguistic Transparency

#### US-3.1: View Influential Words & Feature Breakdown
- **Story**: As a media student (Rohit), I want to see which words or linguistic cues contributed most to the prediction, so that I can understand the basis of the classification.
- **Acceptance Criteria**:
  - **Given** an article has been classified,
  - **When** I view the results section,
  - **Then** I see a list or visual highlight of the top positive and negative vocabulary features (e.g., words like *"shocking"*, *"miracle"*, or *"claimed"* highlighted with their relative directional weight).

---

### Epic 4: Responsible AI & User Guidance

#### US-4.1: Prominent Disclaimers on AI Limitations
- **Story**: As a user (Priya or Rohit), I want to see a clear disclaimer stating what this tool can and cannot do, so that I do not mistake linguistic analysis for absolute real-world truth.
- **Acceptance Criteria**:
  - **Given** any analysis result is on screen,
  - **When** I review the result,
  - **Then** an unmissable disclaimer states that VeriNews detects linguistic patterns and reporting style, and cannot independently verify real-world facts or breaking events.

---

### Epic 5: Portfolio Review & Engineering Rigor

#### US-5.1: Seamless Local Execution on Standard CPU
- **Story**: As an engineering lead/evaluator (Alex), I want to clone the repository and run the application locally on a CPU laptop in under 5 minutes, so that I can verify the developer's engineering fundamentals.
- **Acceptance Criteria**:
  - **Given** a standard computer with Python 3.10+ installed and no GPU,
  - **When** I follow the instructions in the `README.md`,
  - **Then** all dependencies install without compilation errors, the application boots in < 10 seconds, and inference executes in < 1.5 seconds.

