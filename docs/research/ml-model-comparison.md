# Machine Learning Architecture Comparison: VeriNews

## 1. Executive Summary

This document evaluates four machine learning architectures for fake news and credibility classification:
1. **TF-IDF + Logistic Regression**
2. **TF-IDF + Multinomial Naive Bayes**
3. **TF-IDF + Linear Support Vector Machine (Linear SVM)**
4. **XLM-RoBERTa (Pretrained Multilingual Transformer)**

Each candidate is evaluated against seven engineering dimensions: CPU compatibility, estimated model size targets, projected inference latency, multilingual support, explainability, training complexity, and dataset requirements.

> [!NOTE]
> All latency figures, memory limits, and artifact sizes cited in this document represent **provisional engineering targets**, not measured benchmarks. Final empirical performance will be benchmarked on local CPU hardware during Phase 2 training.

---

## 2. In-Depth Architectural Evaluation

### 2.1 Model Evaluation Matrix

| Metric / Attribute | TF-IDF + Logistic Regression | TF-IDF + Multinomial Naive Bayes | TF-IDF + Linear SVM | XLM-RoBERTa (Base) |
| :--- | :--- | :--- | :--- | :--- |
| **CPU Compatibility** | **Optimal** (Pure CPU, C-optimized) | **Optimal** (Pure CPU, counting ops) | **Optimal** (`liblinear` C-backend) | **Challenging** (Heavy CPU tensor compute) |
| **Target Disk Size (Provisional)** | **< 25 MB** (Sparse vocabulary + weights) | **< 15 MB** (Vocabulary + count vectors) | **< 25 MB** (Vocabulary + hyperplanes) | **~1.1 GB** (270M parameters) |
| **Target RAM Usage (Provisional)** | **< 100 MB** | **< 60 MB** | **< 100 MB** | **~1.5 – 2.5 GB** |
| **Target Latency (Provisional)** | **Target: < 10 ms** (Sub-second target) | **Target: < 5 ms** | **Target: < 10 ms** | **Target: 300 – 1,500 ms** (100x slower) |
| **Multilingual Support** | Via decoupled language pipelines (EN & HI) | Via decoupled language pipelines (EN & HI) | Via decoupled language pipelines (EN & HI) | **Native** (Unified across 100 languages) |
| **Explainability** | **Direct & Linear** (Feature weights $w_i$) | **Direct** (Log-likelihood ratio) | **Direct & Linear** (Hyperplane weights $w_i$) | **Complex Black Box** (Requires Integrated Gradients / SHAP) |
| **Calibration Status** | **Requires Evaluation** (Log-loss objective, but uncalibrated under shift/regularization) | **Severely Overconfident** (Violated independence assumption) | **Uncalibrated Margin** (Requires Platt scaling) | Softmax probabilities (Frequently uncalibrated) |
| **Training Complexity** | **Low** (CPU feasible in seconds) | **Very Low** (Instant counting) | **Low** (CPU feasible in seconds) | **High** (GPU required; Colab / Kaggle needed) |
| **Dependency Footprint** | `scikit-learn`, `scipy`, `numpy` | `scikit-learn`, `scipy`, `numpy` | `scikit-learn`, `scipy`, `numpy` | `torch`, `transformers`, `huggingface-hub`, `accelerate` |
| **VeriNews Status** | **PROPOSED INITIAL BASELINE** | Comparison baseline | Comparison baseline | Optional experiment only if baseline limitations justify it |

---

## 3. Detailed Architectural Profiles

### 3.1 Option 1: TF-IDF + Logistic Regression
- **Mathematical Basis**:
  Transforms raw text into word/subword n-gram TF-IDF vectors $\mathbf{x} \in \mathbb{R}^d$, followed by a linear classification function with standard sigmoid link:
  $$P(y = 1 \mid \mathbf{x}) = \sigma(\mathbf{w}^T \mathbf{x} + b) = \frac{1}{1 + e^{-(\mathbf{w}^T \mathbf{x} + b)}}$$
- **Strengths**:
  1. *CPU Efficiency Target*: Vector dot products and sigmoids execute with minimal compute overhead on modern CPUs.
   2. *Direct Interpretability*: In binary scikit-learn Logistic Regression, coefficient direction is toward `classes_[1]`. With WELFake `[0=Fake, 1=Real]`, positive coefficients push toward Real and negative toward Fake. Always inspect `classes_` and label mapping; changed encodings change semantic interpretation. **Illustrative only, not a result:** for `classes_ == [0, 1]`, coefficient `+0.4` associates the feature with class 1 (Real), all else equal. This learned lexical association is not factual evidence.
  3. *Probabilistic Foundation*: Directly minimizes log-loss (cross-entropy), producing continuous probabilities rather than raw geometric margins.
- **Calibration Reality Check**:
  - While Logistic Regression minimizes log-loss, **it does not automatically guarantee calibrated probabilities** in practice.
  - Finite training samples, $L_2$ regularization shrinkage penalties, class imbalance, and domain shifts between training corpora and user submissions cause predicted probabilities to diverge from true empirical probabilities.
  - **Requirement**: Predicted probabilities must be empirically evaluated using calibration curves and Brier scores, applying post-hoc calibration (e.g., Platt scaling or isotonic regression) if systematic over- or under-confidence is observed.
   - **Factual Reality Boundary**: A raw output is a model score, not automatically calibrated confidence or the probability that a story is true. It is never independent factual verification.
- **Weaknesses**:
  Cannot capture non-linear sentence syntax, compositional semantics, or subtle sarcasm without higher-order n-gram approximations.

### 3.2 Option 2: TF-IDF + Multinomial Naive Bayes
- **Mathematical Basis**:
  Computes class posterior via Bayes' theorem under the conditional feature independence assumption:
  $$P(y \mid \mathbf{x}) \propto P(y) \prod_{i=1}^d P(x_i \mid y)^{x_i}$$
- **Strengths**:
  Rapid training (pure frequency counting) and tiny memory footprint.
- **Calibration Vulnerability**:
  Text features violate its conditional-independence assumption, and posterior estimates can be poorly calibrated or overconfident; measure calibration rather than assuming a specific failure magnitude.

### 3.3 Option 3: TF-IDF + Linear Support Vector Machine (Linear SVM)
- **Mathematical Basis**:
  Maximizes the geometric margin between classes:
  $$\min_{\mathbf{w}, b} \frac{1}{2} \|\mathbf{w}\|^2 + C \sum_{i=1}^N \max(0, 1 - y_i(\mathbf{w}^T \mathbf{x}_i + b))$$
- **Strengths**:
  Often achieves strong F1 performance on high-dimensional sparse text vectors.
- **Calibration Requirement**:
  Standard `LinearSVC` outputs signed geometric distance to the separating hyperplane, not probabilities. To provide confidence scores, it must be wrapped in `CalibratedClassifierCV` using Platt scaling (sigmoid fitting via cross-validation). This will be evaluated alongside Logistic Regression in Phase 2.

### 3.4 Option 4: XLM-RoBERTa (Pretrained Multilingual Transformer)
- **Mathematical Basis**:
  Multi-layer bidirectional Transformer encoder (Conneau et al., 2020) pretrained on 2.5 TB of filtered Common Crawl text across 100 languages with cross-lingual masked language modeling.
- **Strengths**:
  Context-aware representations, handling of word polysemy, and potential cross-lingual transfer from high-resource English to Hindi.
- **Practical Bottlenecks for Consumer CPU Deployment**:
  1. *Model Weight Size*: ~1.1 GB disk footprint violates lightweight distribution targets.
  2. *CPU Inference Latency Target*: 12-layer attention forward passes are projected to take 300–1,500 ms on a dual/quad-core CPU.
  3. *Explainability Overhead*: Attributing predictions to specific tokens requires gradient-based techniques (e.g., Integrated Gradients), requiring 20–50 backward passes that would introduce severe CPU latency.
  4. *Training Infrastructure*: Fine-tuning requires GPU access (Google Colab / Kaggle) and specialized dependencies (`torch`, `transformers`).

---

## 4. Synthesis & Candidate Model Strategy

1. **Proposed Baseline Candidate**: **TF-IDF + Calibrated Logistic Regression (Dual Language Pipelines)**
   - Selected as the primary candidate to evaluate in Phase 2 due to minimal dependencies, transparent linear coefficients for explainability, and low CPU resource targets.
   - Must be benchmarked against Linear SVM and Naive Bayes during Phase 2 training before declaring final selection.
2. **Advanced Research Experiment**: **XLM-RoBERTa-base (or IndicBERT)**
   - Maintained as an offline cloud experiment to quantify whether deep transformer representations produce a statistically significant accuracy gain over linear baselines.

---

## 5. Comprehensive Evaluation Methodology & Validation Protocol

To ensure models generalize to real-world news rather than memorizing dataset artifacts, Phase 2 will execute the following validation protocol:

### 5.1 Dataset Hygiene & Leakage Prevention
1. **Duplicate & Near-Duplicate Detection**:
   - Compute exact SHA-256 hashes and MinHash / Jaccard similarity across training and test splits.
   - Purge duplicate articles to prevent train/test leakage.
2. **Publisher & Source Leakage Auditing**:
   - Inspect top model coefficients to confirm that publisher names (e.g., `"Reuters"`, `"BoomLive"`) or datelines (`"WASHINGTON - "`) are not dominating the decision boundary.
   - Apply regex filters to scrub all publisher signatures prior to vectorization.
3. **Class Distribution Auditing**:
   - Measure class balance before and after text cleaning and length filtering (dropping text < 100 characters).
4. **Language & Script Verification**:
   - Validate character Unicode distribution to ensure English text contains predominantly Basic Latin and Hindi contains predominantly Devanagari script.

### 5.2 Core Classification Metrics
Models will be evaluated using standard supervised classification metrics:
- **Accuracy**: Overall fraction of correct predictions.
- **Precision (Macro & Per-Class)**: True positives divided by total predicted positives.
- **Recall (Macro & Per-Class)**: True positives divided by total actual positives.
- **F1-Score (Macro & Per-Class)**: Harmonic mean of precision and recall; primary metric under any class imbalance.
- **Confusion Matrix**: Tracking false positives and false negatives to identify directional bias.

### 5.3 Probability Calibration Evaluation
If predicted probabilities are exposed to users as confidence scores, calibration must be verified:
1. **Reliability Diagrams (Calibration Curves)**:
   - Partition predictions into 10 probability bins (e.g., $[0.5, 0.6), [0.6, 0.7), \dots$).
   - Plot mean predicted probability against empirical observed accuracy per bin. Perfect calibration follows the diagonal $y = x$.
2. **Brier Score**:
   $$\text{Brier} = \frac{1}{N} \sum_{i=1}^N (p_i - y_i)^2$$
   Measures mean squared error of probability forecasts (lower is better; benchmarked against a naive base-rate predictor).
3. **Expected Calibration Error (ECE)**:
   Quantifies the weighted average gap between model confidence and empirical accuracy across all bins.
4. **Post-Hoc Calibration**:
   If calibration curves show systematic miscalibration, apply Platt scaling (sigmoid calibration) or Isotonic Regression via `CalibratedClassifierCV`.

### 5.4 Why High Random-Split Scores Do Not Prove Real-World Generalization
A high random-split score can reflect **temporal, topical, duplicate or publisher leakage**:
- *Topical Leakage*: If all training articles about a specific event (e.g., a specific election cycle or natural disaster) are labeled "Fake", the model learns that the event keywords themselves mean "Fake".
- *Publisher Formatting Cues*: Punctuation quirks, font artifacts, or HTML crawl residue can serve as spurious shortcuts.
- *Temporal Drift*: Breaking news events contain novel entity names not present in the training corpus.

**Validation Remedy**:
Where dataset structures permit, evaluate cross-domain and source-held-out performance. IFND is not approved as external evaluation until its provenance, labels, version and licence are verified.

### 5.5 Comparison, preprocessing and explanation policy

- **Multinomial Naive Bayes**: simple, fast and CPU-suitable; useful comparison on nonnegative count/TF-IDF features. Independence assumption is unrealistic for text; calibration can be weak. Beginner-friendly, but not automatically multilingual or well calibrated.
- **Logistic Regression**: sparse text is CPU-practical; coefficients are inspectable with correct class-order interpretation. It cannot model rich context and may learn corpus shortcuts; probabilities are not automatically calibrated. It is the initial baseline because it balances simplicity, CPU suitability, interpretability and a probability interface—not because it is guaranteed to win.
- **Linear SVM**: useful on sparse text and CPU-practical; weights support association inspection. Raw margins are not probabilities; calibrate using training/validation folds, never the final test set. It shares context and shortcut limitations.
- **XLM-RoBERTa/IndicBERT**: contextual pretrained models may address some lexical limitations, but no performance gain is promised. More compute, dependencies and explanation complexity are required. Optional offline experiment only if baseline limitations justify it; no local GPU is available.

Fit the vectorizer on training data only. Keep final test data untouched during preprocessing/model selection, calibration and threshold choice. Deduplicate before splitting; group related source/event/near-duplicate items when metadata permits. Random splits alone may overstate generalization. Evaluate accuracy, precision/recall, macro F1, weighted F1 where prevalence matters, confusion matrix, per-class metrics, false-positive/negative examples, language-wise performance, and cross-domain/external performance where feasible. Accuracy alone can hide class-specific errors. Calibrate on validation data and report reliability diagrams/Brier score; no confidence threshold is approved.

Compare raw text with preprocessing variants experimentally. Stopword removal, stemming and lemmatization are not presumed to help; Hindi must not inherit English assumptions. TF-IDF feature explanations show model/vectorizer associations, not factual truth or causal evidence.

### Dataset evidence update (accessed 2026-11-06)

IFND is not approved as an independent test set: its [paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC8520332/) reports 56,868 and synthetic fake-text augmentation; the [author repository](https://github.com/sonalgarg174/Dataset) contains `IFND.csv` and states research-purpose use only, with no formal GitHub licence. Per-row language, archive count, augmentation/version and rights need inspection; the competing 56,713 figure remains unexplained. WELFake’s [Zenodo API](https://zenodo.org/api/records/4561253) declares CC BY 4.0, but aggregated upstream rights are unresolved. TaLLIP English/Hindi files are listed in [this repository](https://github.com/amanifeunou/TaLLIP_Dataset); content, labels, licence and domain discrepancy need verification. These limits do not change the proposed model comparison strategy.
