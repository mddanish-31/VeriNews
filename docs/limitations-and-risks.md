# Limitations and Risks: VeriNews

## 1. Fundamental NLP & Machine Learning Limitations

### 1.1 Stylistic Detection vs. Empirical Truth Verification
- **Core Limitation**: Machine learning classifiers analyze **syntactic, rhetorical, and vocabulary patterns**; they do not possess an ontological model of physical reality.
- **Consequence**:
  - A sophisticated fabrication written in calm, authoritative, neutral journalistic prose may be classified as "Likely Credible".
  - A legitimate breaking news article written with urgent, passionate, or emotionally charged language may be flagged as "Sensationalist / Unreliable".
- **Design Principle**: VeriNews must never claim to determine whether a claim is "True" or "False". It provides a **stylistic credibility and sensationalism assessment**.

### 1.2 Temporal Drift and Out-of-Domain Generalization
- **Core Limitation**: Supervised NLP models are bounded by the temporal and thematic distribution of their training corpora.
- **Consequence**: When presented with breaking news events involving novel entities, emerging scientific topics, or newly coined political buzzwords never seen during training, the model's predictive reliability degrades significantly.

### 1.3 Linguistic Nuances: Sarcasm, Irony, and Satire
- **Core Limitation**: Satirical publications (e.g., *The Onion*, *Faking News*) mimic journalistic formats while stating absurdities. Sarcasm and irony often invert token polarity without explicit grammatical cues.
- **Consequence**: Baseline n-gram and linear models frequently fail to detect sarcasm, often classifying well-crafted satire as credible reporting.

### 1.4 Script and Code-Switching ("Hinglish")
- **Core Limitation**: Informal digital discourse in India frequently employs "Hinglish"—Hindi phonetically written using the Latin/English script, often interspersed with English vocabulary.
- **Consequence**: Romanized Hindi lacks standardized spelling (e.g., *"kya"* vs *"kyaa"*, *"sach"* vs *"such"*). Standard tokenizers and English vocabularies interpret these as out-of-vocabulary noise or gibberish.
- **Boundaries**: VeriNews Phase 0 restricts Hindi support strictly to Unicode **Devanagari script** (`\u0900-\u097F`) to maintain rigorous preprocessing standards.

---

## 2. Hardware & Operational Constraints

### 2.1 CPU Execution Constraints
- **Limitation**: The target deployment and development environment is a standard consumer laptop without a dedicated GPU.
- **Impact**:
  - Precludes running large parameter generative models (LLMs) or resource-heavy transformer ensembles locally.
  - Dictates that all vectorization and inference operations must remain lightweight (scikit-learn linear baselines or highly optimized distilled models).

### 2.2 Solo Developer & Beginner Learning Curve
- **Limitation**: The developer is a solo beginner in Python and Machine Learning.
- **Impact**: Introducing complex distributed architectures, Dockerized microservices, or complex multi-head attention pipelines increases failure risk and stalls project momentum.
- **Mitigation**: Strictly follow the Ponytail methodology: modular, standard-library-first Python, readable scikit-learn pipelines, and comprehensive documentation.

---

## 3. Ethical, Social & Legal Risks

### 3.1 Automation Bias (The "AI Stamped It" Syndrome)
- **Risk**: Non-technical users often exhibit uncritical trust in algorithmic outputs, assuming that an AI confidence score is an infallible stamp of truth.
- **Severity**: High | **Likelihood**: High
- **Mitigation**:
  - Non-dismissible disclaimers on every result screen.
  - Replacing binary "Fake/Real" labels with nuanced descriptors: `"Likely Credible Reporting Style"` vs. `"Sensationalist / Unreliable Indicators"`.
  - Displaying qualified confidence intervals (e.g., labeling probabilities between 50% and 65% as `"Inconclusive / Low Confidence"`).

### 3.2 Accusations of Political or Institutional Bias
- **Risk**: Training datasets may inadvertently contain political skew or historical biases originating from the underlying publishers.
- **Severity**: Moderate | **Likelihood**: Moderate
- **Mitigation**:
  - Transparent model cards and dataset attribution documentation.
  - Feature explainability (showing exact word triggers) so users see *why* a passage triggered an indicator.

---

## 4. Risk Mitigation Matrix

| Identified Risk | Severity | Likelihood | Concrete Technical & UX Mitigation |
| :--- | :---: | :---: | :--- |
| **User conflates style with factual truth** | High | High | Display mandatory advisory notice; clearly label results as "Linguistic & Stylistic Analysis". Provide links to certified fact-checkers (e.g., IFCN signatories). |
| **Short or uninformative input creates nonsense predictions** | Medium | High | Enforce minimum character validation threshold (>= 100 characters) before enabling inference. |
| **Model over-fitting to training topic keywords** | High | Medium | Use balanced n-gram representations, robust stopword removal, and evaluate cross-domain validation folds during training. |
| **Server out-of-memory crash on low-spec laptop** | High | Low | Select lightweight model artifacts (< 100 MB total disk footprint, < 500 MB RAM consumption). Avoid heavy PyTorch/TensorFlow runtimes for MVP. |
| **Hinglish / Romanized Hindi submitted** | Medium | Medium | Implement script detection guardrail; explicitly advise user to submit Hindi in Devanagari script. |

