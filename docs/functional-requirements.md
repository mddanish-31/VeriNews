# Functional Requirements: VeriNews

## 1. Requirement Taxonomy
Requirements are organized into functional subsystems:
- **INP**: Input & Ingestion
- **LNG**: Language Identification & Routing
- **PRC**: Text Preprocessing & Cleaning
- **ML**: Model Inference & Credibility Scoring
- **EXP**: Explainability & Feature Contribution
- **UX**: User Experience & Responsible Messaging
- **HST**: History & Data Persistence (Tier B Feasibility Scope)

---

## 2. Detailed Functional Requirements

### 2.1 Input & Ingestion (INP)

#### FR-INP-01: Direct Text Submission
- **Description**: The system must provide a multi-line text input field allowing users to paste or type raw news articles or snippets (headline + body).
- **Input**: Raw string text.
- **Validation Rules**:
  - Minimum text length: 100 characters (or ~20 words) to ensure sufficient linguistic features for classification.
  - Maximum text length: 5,000 characters (or ~1,000 words) to prevent CPU resource exhaustion and payload flooding.
  - Text must not be purely whitespace or punctuation.
- **Error Behavior**: If input fails validation, display inline warning: `"Input too short. Please provide at least 100 characters of news text for meaningful analysis."` or `"Input exceeds 5,000 characters."`

#### FR-INP-02: Sample News Loader
- **Description**: The system should provide quick-select preloaded sample snippets (1 Credible English, 1 Sensationalist English, 1 Credible Hindi, 1 Sensationalist Hindi) to allow one-click testing without external copying.

---

### 2.2 Language Identification & Routing (LNG)

#### FR-LNG-01: Automatic Language Detection
- **Description**: The system must analyze incoming text and determine whether it is predominantly English or Hindi.
- **Processing Logic**:
  - Detect Unicode script range (Devanagari Unicode block `\u0900-\u097F` vs. Basic Latin `\u0000-\u007F`).
  - Supplement with a lightweight language identification heuristic (e.g., Python `langdetect` library or regex script frequency threshold).
- **Outputs**: Language code (`en` or `hi`).
- **Edge Cases**:
  - *Mixed Script (Code-switching)*: If text contains both scripts, route based on majority character proportion (> 60%).
  - *Unsupported Script (e.g., Arabic, Cyrillic, Chinese)*: Reject input with error message: `"Unsupported language detected. VeriNews currently supports English and Hindi (Devanagari script)."`

---

### 2.3 Text Preprocessing & Cleaning (PRC)

#### FR-PRC-01: English Text Normalization
- **Description**: Standardize raw English text before vectorization.
- **Steps**:
  - Lowercase conversion.
  - URL removal (`http\S+|www\S+`).
  - Special character and punctuation removal, preserving sentence boundaries where relevant.
  - Stopword filtering using standard curated English stopword lists.
  - Whitespace collapse.

#### FR-PRC-02: Hindi Text Normalization
- **Description**: Standardize Devanagari Hindi text before vectorization.
- **Steps**:
  - Devanagari Unicode normalization (NFC normalization to handle diacritics/matras consistently).
  - Removal of Latin URLs, English noise, and digits.
  - Punctuation removal (including Devanagari danda `।` and double danda `॥`).
  - Hindi stopword removal using a curated Hindi stopword list.
  - Tokenization suited for Devanagari text.

---

### 2.4 Model Inference & Scoring (ML)

#### FR-ML-01: Credibility Classification
- **Description**: The system must pass the preprocessed tokens to the corresponding language model to generate a prediction.
- **Output Classes**:
  - `Credible / Standard Reporting`: Linguistic patterns align with traditional, objective journalism.
  - `Unreliable / Sensationalist`: Linguistic patterns reflect sensationalism, hyperbole, or common misinformation tropes.
- **Output Format**:
  - Assigned label (string).
  - Raw probability distribution (float between 0.0 and 1.0 for each class).

#### FR-ML-02: Confidence Score Qualification
- **Description**: The system must present the probability as an appropriately qualified confidence score to prevent false sense of precision.
- **Gradation Scale**:
  - Probability 0.50 – 0.65: `"Low Confidence"` (Inconclusive stylistic signals).
  - Probability 0.66 – 0.85: `"Moderate Confidence"`.
  - Probability 0.86 – 1.00: `"High Confidence"`.
- **Display**: Output percentage alongside the qualitative confidence descriptor (e.g., `"Likely Unreliable (78% — Moderate Confidence)"`).

---

### 2.5 Explainability & Interpretability (EXP)

#### FR-EXP-01: Feature Contribution Highlighting
- **Description**: For every prediction, the system must explain which words or n-grams most strongly influenced the classification outcome.
- **Processing Logic**:
  - Extract the top 5 to 10 features with the highest positive and negative model coefficients (or explainability attribution scores via LIME/SHAP/Eli5).
- **Presentation**:
  - Visual word badges or inline text highlights (e.g., red highlights for words pulling toward "Unreliable", green highlights for words pulling toward "Credible").
  - Feature importance breakdown table showing the relative weight/direction of top terms.

---

### 2.6 User Experience & Responsible Messaging (UX)

#### FR-UX-01: Mandatory Responsible AI Disclaimer
- **Description**: The analysis results page must persistently display a clear, non-dismissible advisory notice.
- **Standard Text**:
  > *"Notice: VeriNews analyzes linguistic, stylistic, and rhetorical patterns associated with news reporting styles. A 'Credible' or 'Unreliable' score does NOT constitute independent verification of real-world facts. For critical health, political, or breaking news claims, always cross-reference with accredited independent fact-checkers."*

#### FR-UX-02: Intuitive Visual Hierarchy
- **Description**: Results must be rendered with accessible color indicators (e.g., neutral blues/greens for credible, amber/red for unreliable) accompanied by clear textual labels for accessibility (WCAG AA color contrast compliant).

---

### 2.7 History & Data Persistence (HST)

#### FR-HST-01: Client-Side Session History (MVP 1.0)
- **Description**: For the initial MVP release, past analyses are persisted strictly within the user's browser using `localStorage`.
- **Capacity**: Stores the last 3–5 analyses in the active browser, allowing users to view recent verdicts and keywords without requiring user accounts or backend database dependencies.
- **Privacy**: No user-submitted text is stored on the server in MVP 1.0.

#### FR-HST-02: Server-Side Persistence & Database (Planned Full Application)
- **Description**: For the planned production persistent-data version, provide relational storage powered by PostgreSQL, SQLAlchemy ORM, and Alembic schema migrations.
- **Data Entities**: User accounts, prediction logs (`user_id`, `input_text_snippet`, `detected_language`, `prediction_label`, `confidence_score`, `influential_tokens`, `created_at`), and user feedback flags.
- **Authentication**: User authentication is explicitly deferred to a later release, after core ML evaluation and database integration are established.

