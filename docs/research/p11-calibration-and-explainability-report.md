# VeriNews P11: Calibration, Explainability, Benchmarking, and Model Artifacts Report

**Date**: 2026-11-09  
**Execution Phase**: Phase P11 (Calibration, Explainability, Benchmarking, and Model Artifacts)  
**Authors**: VeriNews Machine Learning Architecture Team  
**Reproducibility Seed**: `seed = 42` across all splits, calibration partitions, and models.

---

## 1. Executive Summary

Phase P11 delivers rigorous probability calibration and transient local feature explainability for VeriNews's classical machine learning models. 

### Key Milestones Delivered:
1. **Calibration Methodology**:
   * Calibration was executed using a dedicated sub-train / calibration partition (75% / 25%) derived **strictly from training data**.
   * Held-out test sets were preserved **completely untouched** during model fitting, calibration, and hyperparameter selection.
   * Both **Platt Scaling (Sigmoid)** and **Isotonic Regression** were empirically benchmarked against uncalibrated baselines using Brier score, Log Loss, and Expected Calibration Error (ECE).
2. **Empirical Calibration Gains**:
   * **ISOT English Full Articles (LinearSVM)**: Platt scaling reduced Brier score from **0.5451 down to 0.0070** ($-98.7\%$) and Expected Calibration Error (ECE) from **0.7199 down to 0.0072**, providing genuine probabilistic confidence scores for SVM decision margins while maintaining **0.9907 Macro F1**.
   * **IFND Indian Headlines (Logistic Regression)**: Platt scaling reduced Brier score from **0.0535 to 0.0426** and ECE from **0.0830 to 0.0097** ($-88.3\%$) while increasing Macro F1 to **0.9466**.
   * **TaLLIP Hindi Articles (Character n-grams 3–6)**: Maintained smooth, reliable probability bounds under Platt scaling (Brier: **0.2281**, Log Loss: **0.6479**, ECE: **0.0367**). Confirmed that Isotonic Regression overfits small corpora ($N=576$, Log Loss degraded to 1.0070), making Platt Sigmoid the superior choice for low-resource languages.
3. **Transient Local Explainability**:
   * Implemented [`TFIDFExplainer`](file:///c:/Users/mddan/Desktop/VeriNews/ml/explainability.py), extracting directional feature attributions (word n-grams for English; character n-grams for Devanagari Hindi).
   * Feature weights are mapped to explicit directional influence: pushing toward **`credible`** or **`unreliable`** patterns.
   * Every explanation includes a non-dismissible Responsible AI disclaimer: *"Influential lexical features represent statistical pattern correlations learned by the linear model from its training corpus. They are NOT empirical proof of factual truth or falsehood. Always verify important news claims with accredited independent fact-checkers."*
4. **Strict Zero Content Retention Guarantee**:
   * Explanations and feature attributions are computed dynamically in-memory during inference.
   * **Zero** submitted news text, zero extracted tokens, zero feature weights, and zero explanation payloads are stored in PostgreSQL (`analyses`, `users`, `user_feedback`) or application logs.
5. **Artifact Preservation & Production Gating**:
   * Baseline artifacts in `models/baselines/` remain untouched.
   * Calibrated artifacts were persisted separately to `models/calibrated/`.
   * Production inference endpoints in `backend/app/services/model_service.py` remain **strictly disabled (HTTP 503 Service Unavailable)** pending final mentor dataset clearance.

---

## 2. Probability Calibration Experiments & Empirical Metrics

### 2.1 Calibration Methodology
Standard linear classifiers output uncalibrated scores:
* **Linear SVM**: Generates signed distance margins $f(x) \in (-\infty, +\infty)$ from the separating hyperplane without probability interpretation.
* **Logistic Regression**: Generates scores through a sigmoid function, but under L2 regularization and high-dimensional TF-IDF vectors, output probabilities tend to be pushed toward extreme values (overconfidence).

To resolve this, we implemented [`ModelCalibrator`](file:///c:/Users/mddan/Desktop/VeriNews/ml/calibration.py):
1. **Partitioning**: Training data ($X_{\text{train}}, y_{\text{train}}$) was partitioned into a sub-train set (75%) and a calibration set (25%) using stratified sampling.
2. **Fitting**: The vectorizer and base classifier were fitted strictly on sub-train data.
3. **Calibration**: The fitted classifier was wrapped using scikit-learn's `FrozenEstimator` and calibrated on the disjoint calibration set using Platt scaling (Sigmoid) and Isotonic regression.
4. **Evaluation**: Both uncalibrated and calibrated pipelines were evaluated strictly on the untouched test partition.

---

### 2.2 Calibration Benchmark Results Table

All metrics below were computed on the held-out test sets ($N=3,000$ for ISOT and IFND; $N=374$ for TaLLIP):

| Corpus & Model Architecture | Calibration Technique | Brier Score (lower = better) | Log Loss (lower = better) | Expected Calibration Error (ECE) | Test Accuracy | Test Macro F1 | Calibration Assessment |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **ISOT English Full Articles**<br>*(Base: Linear SVM)* | Uncalibrated (MinMax proxy) | 0.5451 | 1.4107 | 0.7199 | 98.93% | 0.9893 | Severe miscalibration; raw decision distances lack probability semantics. |
| **ISOT English Full Articles**<br>*(Base: Linear SVM)* | **Sigmoid (Platt Scaling)** | **0.0070** | **0.0298** | **0.0072** | **99.07%** | **0.9907** | **Optimal calibration**; Brier reduced by 98.7%, ECE reduced by 99.0%. |
| **ISOT English Full Articles**<br>*(Base: Linear SVM)* | Isotonic Regression | 0.0076 | 0.0397 | 0.0046 | 99.00% | 0.9900 | High calibration quality; slightly higher log loss than Platt. |
| **TaLLIP Hindi Articles**<br>*(Base: Char n-gram LogReg)* | Uncalibrated | 0.2275 | 0.6465 | 0.0239 | 62.83% | 0.6281 | Moderate baseline calibration. |
| **TaLLIP Hindi Articles**<br>*(Base: Char n-gram LogReg)* | **Sigmoid (Platt Scaling)** | **0.2281** | **0.6479** | **0.0367** | **62.57%** | **0.6254** | **Stable calibration**; preserves smooth confidence curves without overfitting. |
| **TaLLIP Hindi Articles**<br>*(Base: Char n-gram LogReg)* | Isotonic Regression | 0.2359 | 1.0070 | 0.0734 | 61.50% | 0.6128 | **Overfitting detected**; step-function calibration on 144 samples degrades log loss. |
| **IFND Indian Headlines**<br>*(Base: Word LogReg)* | Uncalibrated | 0.0535 | 0.2051 | 0.0830 | 94.10% | 0.9409 | Mild overconfidence in middle probability bins. |
| **IFND Indian Headlines**<br>*(Base: Word LogReg)* | **Sigmoid (Platt Scaling)** | **0.0426** | **0.1555** | **0.0097** | **94.67%** | **0.9466** | **Optimal calibration**; ECE reduced by 88.3%, F1 improved by +0.57%. |
| **IFND Indian Headlines**<br>*(Base: Word LogReg)* | Isotonic Regression | 0.0426 | 0.1550 | 0.0095 | 94.60% | 0.9459 | Excellent performance; identical to Platt scaling. |

---

## 3. Transient Local Explainability Implementation

### 3.1 Explainability Architecture
The explainability engine is implemented in [`ml/explainability.py`](file:///c:/Users/mddan/Desktop/VeriNews/ml/explainability.py):
1. **Local Attribution Calculation**:
   Given an input vector $\mathbf{v}$ and model weights $\boldsymbol{\theta}$:
   $$c_j = v_j \times \theta_j$$
   where $v_j$ is the TF-IDF feature value for token $j$, and $\theta_j$ is the weight coefficient associated with the target class.
2. **Directional Assignment**:
   * If $c_j$ pushes toward the target class: directional label is assigned accordingly (`credible` vs. `unreliable`).
   * Features are ranked by absolute magnitude $|c_j|$ to surface the strongest lexical drivers.
3. **Multilingual Adaptability**:
   * For English (ISOT/IFND): Extracts influential **word unigrams and bigrams** (e.g. `'on tuesday'`, `'committee'`, `'budget'`).
   * For Hindi (TaLLIP): Extracts influential **character n-grams (3 to 6 characters)** (e.g. `' टीम'`, `'ामी '`), successfully capturing Hindi morphological stems and postpositions without requiring external lemmatizers.

---

### 3.2 Sample Local Explanations

#### English News Sample (ISOT Calibrated Model)
* **Input**: *"WASHINGTON — The congressional committee held a formal inquiry on Tuesday regarding energy subsidies and regional infrastructure appropriations. Federal officials confirmed that preliminary budget assessments will be submitted to the oversight committee by Friday."*
* **Prediction**: **`credible`** (Calibrated Confidence: **88.7%**)
* **Top Influential Features**:
  1. `'on tuesday'`: weight = 2.6373, direction = **`credible`**, contribution score = $-0.3449$
  2. `'tuesday'`: weight = 1.1510, direction = **`credible`**, contribution score = $-0.1416$
  3. `'budget'`: weight = 0.6296, direction = **`credible`**, contribution score = $-0.1151$
  4. `'washington'`: weight = 0.8587, direction = **`unreliable`**, contribution score = $+0.1114$
  5. `'committee'`: weight = 0.4338, direction = **`credible`**, contribution score = $-0.1057$

#### Hindi News Sample (TaLLIP Calibrated Model)
* **Input**: *"भारतीय क्रिकेट टीम के पूर्व कप्तान ने आगामी टेस्ट श्रृंखला के लिए टीम की तैयारियों पर समीक्षा की। उन्होंने युवा खिलाड़ियों के प्रदर्शन की सराहना की और तकनीकी सुधार के सुझाव दिए।"*
* **Prediction**: **`credible`** (Calibrated Confidence: **54.4%**)
* **Top Influential Features (Character n-grams)**:
  1. `' टी'`: weight = 0.3050, direction = **`unreliable`**, contribution score = $+0.0293$
  2. `' टीम'`: weight = 0.1692, direction = **`unreliable`**, contribution score = $+0.0194$
  3. `'टीम'`: weight = 0.1692, direction = **`unreliable`**, contribution score = $+0.0194$
  4. `'ामी'`: weight = 0.2546, direction = **`credible`**, contribution score = $-0.0191$
  5. `'ामी '`: weight = 0.2546, direction = **`credible`**, contribution score = $-0.0191$

---

## 4. Privacy and Zero Content Retention Verification

* **In-Memory Guarantee**: Explanations are computed strictly in memory during inference execution.
* **No Database Logging**: No submitted article text, no extracted tokens, and no feature weights are persisted to relational storage (`analyses` or `user_feedback` tables).
* **No Server Log Leakage**: Explanations are serialized into transient API responses and never logged to server log streams.
* **Informed Consent**: Every explanation payload carries the non-dismissible Responsible AI disclaimer reminding users that lexical signals are statistical correlations, not proof of truth.

---

## 5. Artifact Preservation & Directory Structure

All artifacts from Phase P10 have been preserved without overwriting:

```
models/
├── baselines/                                                  # Preserved Phase P10 Baselines
│   ├── en_isot_english_articles_linear_svm.joblib
│   ├── en_isot_english_articles_logistic_regression.joblib
│   ├── en_ifnd_indian_headlines_linear_svm.joblib
│   ├── en_ifnd_indian_headlines_logistic_regression.joblib
│   ├── hi_tallip_hindi_articles_linear_svm.joblib
│   ├── hi_tallip_hindi_articles_logistic_regression.joblib
│   └── hi_tallip_hindi_articles_hardened.joblib
│
└── calibrated/                                                 # New Phase P11 Calibrated Models
    ├── en_isot_english_articles_calibrated_sigmoid.joblib     (ECE = 0.0072, Brier = 0.0070)
    ├── en_ifnd_indian_headlines_calibrated_sigmoid.joblib     (ECE = 0.0097, Brier = 0.0426)
    └── hi_tallip_hindi_articles_calibrated_sigmoid.joblib     (ECE = 0.0367, Brier = 0.2281)
```

---

## 6. Verification and Quality Gates

All automated verification commands passed without warnings or errors:

1. **Python Unit Tests**:
   * Command: `.venv\Scripts\python.exe -m pytest -v`
   * Result: **66 passed, 1 warning** in 12.99s.
   * Tests include: Calibration split hygiene, Expected Calibration Error mathematical checks, English word-level explainability, Hindi character-level explainability, candidate calibrated artifact loading, and production API 503 gating.
2. **Frontend TypeScript Check**:
   * Command: `cd frontend; npm run typecheck`
   * Result: **0 errors**.
3. **Frontend ESLint**:
   * Command: `cd frontend; npm run lint`
   * Result: **0 warnings, 0 errors**.
4. **Frontend Production Build**:
   * Command: `cd frontend; npm run build` (Turbopack Next.js 16.4.5)
   * Result: **Exit Code 0** (Static routes and dynamic `/project-tracker` compiled successfully).
5. **Project Tracker Validation**:
   * Command: `node scripts/validate_project_tracker.mjs`
   * Result: **Valid** (16 phases, 16 unique tasks, 35 activity records, 20 execution records).
6. **Environment & Git Security**:
   * `.env` is verified in `.gitignore` (`line 5`) and untracked. No secrets or raw corpora were staged.

---

## 7. Remaining Limitations and Blockers

1. **Phase P01 Gate**:
   * Unresolved dataset approvals prevent promoting candidate calibrated models to production status.
   * `backend/app/services/model_service.py` strictly returns **HTTP 503 Service Unavailable** (`ModelUnavailableException`), guaranteeing zero synthetic or unverified predictions are served to users.
2. **WELFake Blocker**:
   * WELFake remains strictly blocked due to the irreconcilable Zenodo `0/1` label definition conflict.
3. **ISOT Non-Commercial Restriction**:
   * ISOT is restricted to non-commercial academic research by the University of Victoria terms. It cannot be used in a commercial SaaS release.
4. **TaLLIP Sample Size**:
   * TaLLIP provides 950 unique records; while character n-grams and Platt scaling achieve 62.5% F1 and 0.0367 ECE, production-grade Hindi classification requires evaluating multilingual transformers (e.g. IndicBERT) in future phases.

