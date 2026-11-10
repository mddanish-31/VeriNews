# VeriNews — Four-Dataset Audit and Baseline Training Report

**Date:** 2026-11-09  
**Execution:** Four-Dataset Final Audit & CPU-Friendly Baseline Training  
**Workflow:** Ponytail Workflow (Simplest, Shortest, Stdlib + Scikit-Learn)  
**Status:** Multi-Model Training Complete on Eligible Datasets; Blocked Datasets Preserved  

---

## 1. Executive Summary

This report documents the empirical audit of all four locally present dataset candidates (WELFake, ISOT, TaLLIP Hindi, and IFND) and the training of reproducible CPU-friendly classical machine learning baselines (TF-IDF + Logistic Regression and Linear SVM).

### Core Outcomes

1. **WELFake (English Articles)** is **BLOCKED / NOT ELIGIBLE FOR TRAINING** due to an unresolved, verified contradiction between Zenodo's verbal label statement (`0 = Fake, 1 = Real`) and its reported summary counts (`35,028 Real, 37,106 Fake` vs. `35,028 '0's and 37,106 '1's` in the CSV). Training on WELFake without primary author resolution risks creating an inverted credibility classifier.
2. **ISOT (English Full Articles)** is **ELIGIBLE & TRAINED** (20,000 balanced subset, 70/15/15 stratified split) with **Reuters dateline leakage mitigation** (stripping publisher prefix strings). Achieves **98.53% Accuracy** / **0.9853 Macro F1** with Logistic Regression and **99.37% Accuracy** with Linear SVM at **0.002 ms / sample** CPU inference latency.
3. **TaLLIP Hindi (Hindi Devanagari Articles)** is **ELIGIBLE & TRAINED** (949 unique records across 6 domains: Politics, Sports, Business, Technology, Celebrity, Entertainment) on the authors' designated Train/Test split. Achieves **60.43% Accuracy** / **0.6043 Macro F1** with Logistic Regression and **56.15% Accuracy** with Linear SVM at **0.002 ms / sample** CPU inference latency.
4. **IFND (Indian News Headlines)** is **AUDITED & BENCHMARKED** as an independent short-statement dataset (50,950 unique records; avg length 80 chars; 20,000 balanced subset trained). Achieves **94.10% Accuracy** / **0.9409 Macro F1**. Kept separate from ISOT full-text articles to prevent cross-domain length collapse.

---

## 2. Independent Dataset Audits

| Metric | WELFake | ISOT | TaLLIP Hindi | IFND |
|---|---|---|---|---|
| **Local File Path** | `data/raw/welfake/WELFake_Dataset.csv` | `data/raw/isot/News-_dataset/` (`Fake.csv`, `True.csv`) | `data/raw/tallip/TaLLIP_Dataset-main/.../Hindi/` | `data/raw/ifnd/IFND.csv/IFND.csv` |
| **Combined File Size** | 233.73 MB | 110.98 MB | 1.17 MB | 11.13 MB |
| **Headers** | `['', 'title', 'text', 'label']` | `['title', 'text', 'subject', 'date']` | `['Domain', 'Topic', 'News', 'Label']` | `['id', 'Statement', 'Image', 'Web', 'Category', 'Date', 'Label']` |
| **Total Raw Records** | 72,134 | 44,898 | 980 | 56,714 |
| **Exact Duplicates** | 8,567 | 5,563 | 30 | 5,762 |
| **Missing/Short Text (<50 chars)**| 1,128 (783 missing, 345 short) | 837 | 0 | 0 (all >= 15 chars) |
| **Usable Unique Records** | **62,439** | **38,498** | **950** | **50,950** |
| **Target 20k Achieved?** | Yes (62,439) | Yes (38,498) | No (950 total) | Yes (50,950) |
| **Raw Label Distribution** | `0`: 35,028 (48.6%)<br>`1`: 37,106 (51.4%) | `True`: 21,190 (55.0%)<br>`Fake`: 17,308 (45.0%) | `Legit`: 490 (51.6%)<br>`Fake`: 460 (48.4%) | `TRUE`: 33,683 (66.1%)<br>`Fake`: 17,267 (33.9%) |
| **Documented Semantics** | Contradictory / Inverted | Unambiguous (`True` vs `Fake`) | Unambiguous (`Legit` vs `Fake`) | Unambiguous (`TRUE` vs `Fake`) |
| **Language Distribution** | 99.3% English (Latin) | 100% English (Latin) | 100% Hindi (Devanagari) | 99.99% English (Indian context) |
| **Text Length (Mean / Max)** | 3,330 chars / 142,961 chars | 2,452 chars / 51,793 chars | 385.7 chars / 1,864 chars | 80.2 chars / 348 chars |
| **Provenance / Rights** | Zenodo CC BY 4.0 | UVic Academic Terms | ACM-TALLIP Academic Research | CC BY 4.0 (Mendeley Data) |
| **Readiness Decision** | **BLOCKED (Label Inversion)** | **APPROVED (Leakage Mitigated)** | **APPROVED (Hindi Baseline)** | **APPROVED (Separate Benchmark)** |

---

## 3. Dataset Strategy & Non-Merging Rationale

1. **Do Not Merge Full Articles (ISOT) with Short Headlines (IFND)**:
   - ISOT articles average 2,452 characters; IFND statements average 80 characters.
   - Merging them blindly introduces length and domain confounding (the model would learn to classify length rather than credibility).
2. **Keep Hindi (TaLLIP) Dedicated**:
   - TaLLIP Hindi uses Devanagari script (`U+0900`–`U+097F`).
   - Maintaining dedicated language-specific pipelines prevents script collision and ensures calibrated probability outputs for each language.
3. **Leakage Mitigation for ISOT**:
   - In raw ISOT data, `True.csv` articles contain standard Reuters datelines (`"WASHINGTON (Reuters) - "`).
   - All datelines were stripped via regex before feature extraction to ensure the classifier evaluates linguistic style patterns rather than the "(Reuters)" publisher string.

---

## 4. Empirical Training Results (CPU-Friendly Baselines)

All models trained on local consumer CPU using Python 3.14.6 + Scikit-Learn 1.9.1.

### 4.1 English Baseline (ISOT Full Articles — 20,000 Balanced Subset)
- **Dataset Partitioning:** 14,000 Train / 3,000 Validation / 3,000 Test (Stratified 70/15/15)
- **Features:** Sublinear TF-IDF (10,000 max features, n-gram range 1–2)

| Metric | Logistic Regression (Balanced) | Linear SVM (Balanced) |
|---|---|---|
| **Accuracy** | **98.53%** | **99.37%** |
| **Macro Precision** | 0.9853 | 0.9937 |
| **Macro Recall** | 0.9853 | 0.9937 |
| **Macro F1-Score** | **0.9853** | **0.9937** |
| **Credible F1** | 0.9853 | 0.9937 |
| **Unreliable F1** | 0.9853 | 0.9937 |
| **Confusion Matrix (Test: 3,000)** | `[[1479, 21], [23, 1477]]` | `[[1489, 11], [8, 1492]]` |
| **Train Time (CPU)** | 0.324 s | 0.565 s |
| **Inference Latency** | **0.002 ms / sample** | **0.001 ms / sample** |
| **Saved Artifact** | [`models/baselines/en_isot_english_articles_logistic_regression.joblib`](file:///C:/Users/mddan/Desktop/VeriNews/models/baselines/en_isot_english_articles_logistic_regression.joblib) | [`models/baselines/en_isot_english_articles_linear_svm.joblib`](file:///C:/Users/mddan/Desktop/VeriNews/models/baselines/en_isot_english_articles_linear_svm.joblib) |

### 4.2 Hindi Baseline (TaLLIP Hindi Devanagari — 949 Unique Records)
- **Dataset Partitioning:** 460 Train / 116 Validation / 374 Held-out Test (Author-designated Test Split)
- **Features:** Unicode Devanagari TF-IDF (10,000 max features, n-gram range 1–2)

| Metric | Logistic Regression (Balanced) | Linear SVM (Balanced) |
|---|---|---|
| **Accuracy** | **60.43%** | **56.15%** |
| **Macro Precision** | 0.6049 | 0.5623 |
| **Macro Recall** | 0.6049 | 0.5622 |
| **Macro F1-Score** | **0.6043** | **0.5614** |
| **Credible F1** | 0.6022 | 0.5574 |
| **Unreliable F1** | 0.6064 | 0.5654 |
| **Confusion Matrix (Test: 374)** | `[[112, 80], [68, 114]]` | `[[103, 89], [75, 107]]` |
| **Train Time (CPU)** | 0.028 s | 0.009 s |
| **Inference Latency** | **0.002 ms / sample** | **0.001 ms / sample** |
| **Saved Artifact** | [`models/baselines/hi_tallip_hindi_articles_logistic_regression.joblib`](file:///C:/Users/mddan/Desktop/VeriNews/models/baselines/hi_tallip_hindi_articles_logistic_regression.joblib) | [`models/baselines/hi_tallip_hindi_articles_linear_svm.joblib`](file:///C:/Users/mddan/Desktop/VeriNews/models/baselines/hi_tallip_hindi_articles_linear_svm.joblib) |

### 4.3 Indian Headlines Benchmark (IFND — 20,000 Balanced Subset)
- **Dataset Partitioning:** 14,000 Train / 3,000 Validation / 3,000 Test (Stratified 70/15/15)
- **Features:** Sublinear TF-IDF (10,000 max features, n-gram range 1–2)

| Metric | Logistic Regression (Balanced) | Linear SVM (Balanced) |
|---|---|---|
| **Accuracy** | **94.10%** | **94.50%** |
| **Macro F1-Score** | **0.9409** | **0.9450** |
| **Confusion Matrix (Test: 3,000)** | `[[1470, 30], [147, 1353]]` | `[[1456, 44], [121, 1379]]` |
| **Inference Latency** | **< 0.001 ms / sample** | **< 0.001 ms / sample** |
| **Saved Artifact** | [`models/baselines/en_ifnd_indian_headlines_logistic_regression.joblib`](file:///C:/Users/mddan/Desktop/VeriNews/models/baselines/en_ifnd_indian_headlines_logistic_regression.joblib) | [`models/baselines/en_ifnd_indian_headlines_linear_svm.joblib`](file:///C:/Users/mddan/Desktop/VeriNews/models/baselines/en_ifnd_indian_headlines_linear_svm.joblib) |

---

## 5. Artifact Summary

All generated baseline artifacts are saved under `models/baselines/`:
- `en_isot_english_articles_logistic_regression.joblib` (4.4 MB)
- `en_isot_english_articles_linear_svm.joblib` (4.4 MB)
- `hi_tallip_hindi_articles_logistic_regression.joblib` (668 KB)
- `hi_tallip_hindi_articles_linear_svm.joblib` (668 KB)
- `en_ifnd_indian_headlines_logistic_regression.joblib` (2.4 MB)
- `en_ifnd_indian_headlines_linear_svm.joblib` (2.4 MB)

Reports:
- [`docs/research/four-dataset-audit-report.json`](file:///C:/Users/mddan/Desktop/VeriNews/docs/research/four-dataset-audit-report.json)
- [`docs/research/baseline-training-report.json`](file:///C:/Users/mddan/Desktop/VeriNews/docs/research/baseline-training-report.json)

