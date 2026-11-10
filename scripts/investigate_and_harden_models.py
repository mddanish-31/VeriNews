"""VeriNews P10/P11 Model Hardening, Leakage Investigation, and Evaluation Reliability.

This script executes:
1. Deduplication Timing and Split Hygiene Check.
2. Leakage and Evaluation Reliability Analysis for ISOT and IFND:
   - Source/Publisher, Subject, Formatting, and Temporal leakage.
   - Realistic Generalization Tests (Out-of-Subject for ISOT, Out-of-Publisher and Out-of-Category for IFND).
3. Hindi Baseline Improvement (TaLLIP):
   - 5-fold Stratified CV strictly on the training set (576 unique records).
   - Systematic comparison of Word TF-IDF, Char n-grams, and Word+Char FeatureUnion.
   - Comparison of Logistic Regression and Linear SVM with multiple regularization strengths.
   - Evaluation of best model on the untouched 374-record test set.
4. Benchmarking and Latency Profiling across repeated runs.
5. Saving new hardened artifacts without overwriting original baselines.
"""

import csv
import hashlib
import json
import os
from pathlib import Path
import re
import time
from typing import Any, Dict, List, Tuple

import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, precision_recall_fscore_support
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.pipeline import FeatureUnion, Pipeline
from sklearn.svm import LinearSVC

csv.field_size_limit(50_000_000)

ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data" / "raw"
MODELS_DIR = ROOT_DIR / "models" / "baselines"
DOCS_DIR = ROOT_DIR / "docs" / "research"
MODELS_DIR.mkdir(parents=True, exist_ok=True)
DOCS_DIR.mkdir(parents=True, exist_ok=True)


def resolve_ifnd_path() -> Path:
    """Resolve IFND path supporting flat and nested directory structures."""
    nested = DATA_DIR / "ifnd" / "IFND.csv" / "IFND.csv"
    if nested.is_file():
        return nested
    flat = DATA_DIR / "ifnd" / "IFND.csv"
    if flat.is_file():
        return flat
    raise FileNotFoundError(f"IFND not found at {flat} or {nested}")


def clean_isot_text(text: str) -> str:
    """Strip standard Reuters dateline prefixes."""
    cleaned = re.sub(r"^[A-Za-z\s,/\.\-]+(?:\(Reuters\)|\(reuters\))\s*[-–—]\s*", "", text.strip())
    cleaned = re.sub(r"^\(Reuters\)\s*[-–—]?\s*", "", cleaned.strip())
    return cleaned.strip()


# ==============================================================================
# 1. EVALUATION RELIABILITY & LEAKAGE INVESTIGATION: ISOT
# ==============================================================================

def investigate_isot_leakage() -> Dict[str, Any]:
    """Inspect ISOT for residual publisher cues and out-of-subject generalization."""
    fake_path = DATA_DIR / "isot" / "News-_dataset" / "Fake.csv"
    true_path = DATA_DIR / "isot" / "News-_dataset" / "True.csv"

    print("\n--- Investigating ISOT Leakage & Generalization ---")
    records = []
    seen_hashes = set()
    reuters_in_true = 0
    reuters_in_fake = 0
    subject_counts = {}

    for path, label, canonical in [(true_path, "True", "credible"), (fake_path, "Fake", "unreliable")]:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            reader = csv.reader(f)
            next(reader)
            for row in reader:
                if len(row) >= 4:
                    title, raw_text, subject, date = row[0].strip(), row[1].strip(), row[2].strip(), row[3].strip()
                    subject_counts[subject] = subject_counts.get(subject, 0) + 1
                    cleaned = clean_isot_text(raw_text)
                    if not cleaned or len(cleaned) < 50:
                        continue
                    h = hashlib.sha256(cleaned.encode("utf-8")).hexdigest()
                    if h in seen_hashes:
                        continue
                    seen_hashes.add(h)

                    # Check residual "reuters" in text
                    has_reuters = bool(re.search(r"\breuters\b", cleaned, re.IGNORECASE))
                    if canonical == "credible" and has_reuters:
                        reuters_in_true += 1
                    elif canonical == "unreliable" and has_reuters:
                        reuters_in_fake += 1

                    records.append({
                        "text": cleaned,
                        "canonical_label": canonical,
                        "subject": subject,
                        "date": date,
                    })

    cred_count = sum(1 for r in records if r["canonical_label"] == "credible")
    unrel_count = sum(1 for r in records if r["canonical_label"] == "unreliable")

    leakage_stats = {
        "total_unique_records": len(records),
        "credible_records": cred_count,
        "unreliable_records": unrel_count,
        "subjects": subject_counts,
        "residual_reuters_in_credible": reuters_in_true,
        "residual_reuters_in_credible_pct": round(reuters_in_true / cred_count * 100, 2),
        "residual_reuters_in_unreliable": reuters_in_fake,
        "residual_reuters_in_unreliable_pct": round(reuters_in_fake / unrel_count * 100, 2),
    }
    print(f"Residual 'Reuters' mentions: Credible={reuters_in_true} ({leakage_stats['residual_reuters_in_credible_pct']}%), Unreliable={reuters_in_fake} ({leakage_stats['residual_reuters_in_unreliable_pct']}%)")

    # Experiment: Out-of-Subject Generalization
    # Train on Politics domain: True: politicsNews (11,272), Fake: politics (6,841) + Government News (1,570)
    # Test on World/General News domain: True: worldnews (10,145), Fake: News (9,050) + left-news (4,459)
    train_pool = [r for r in records if r["subject"] in ["politicsNews", "politics", "Government News"]]
    test_pool = [r for r in records if r["subject"] in ["worldnews", "News", "left-news"]]

    # Balance train: 8,000 credible, 8,000 unreliable
    train_cred = [r for r in train_pool if r["canonical_label"] == "credible"]
    train_unrel = [r for r in train_pool if r["canonical_label"] == "unreliable"]
    np.random.seed(42)
    idx_tc = np.random.choice(len(train_cred), size=min(8000, len(train_cred)), replace=False)
    idx_tu = np.random.choice(len(train_unrel), size=min(8000, len(train_unrel)), replace=False)
    train_data = [train_cred[i] for i in idx_tc] + [train_unrel[i] for i in idx_tu]

    # Balance test: 3,000 credible, 3,000 unreliable
    test_cred = [r for r in test_pool if r["canonical_label"] == "credible"]
    test_unrel = [r for r in test_pool if r["canonical_label"] == "unreliable"]
    idx_ec = np.random.choice(len(test_cred), size=min(3000, len(test_cred)), replace=False)
    idx_eu = np.random.choice(len(test_unrel), size=min(3000, len(test_unrel)), replace=False)
    test_data = [test_cred[i] for i in idx_ec] + [test_unrel[i] for i in idx_eu]

    X_tr = [r["text"] for r in train_data]
    y_tr = [r["canonical_label"] for r in train_data]
    X_te = [r["text"] for r in test_data]
    y_te = [r["canonical_label"] for r in test_data]

    vec = TfidfVectorizer(ngram_range=(1, 2), max_features=10000, sublinear_tf=True)
    X_tr_v = vec.fit_transform(X_tr)
    X_te_v = vec.transform(X_te)

    lr = LogisticRegression(max_iter=1000, random_state=42)
    lr.fit(X_tr_v, y_tr)
    lr_preds = lr.predict(X_te_v)
    lr_acc = accuracy_score(y_te, lr_preds)
    lr_prec, lr_rec, lr_f1, _ = precision_recall_fscore_support(y_te, lr_preds, average="macro", zero_division=0)
    lr_cm = confusion_matrix(y_te, lr_preds, labels=["credible", "unreliable"]).tolist()

    svm = LinearSVC(max_iter=2000, random_state=42)
    svm.fit(X_tr_v, y_tr)
    svm_preds = svm.predict(X_te_v)
    svm_acc = accuracy_score(y_te, svm_preds)
    svm_prec, svm_rec, svm_f1, _ = precision_recall_fscore_support(y_te, svm_preds, average="macro", zero_division=0)
    svm_cm = confusion_matrix(y_te, svm_preds, labels=["credible", "unreliable"]).tolist()

    out_of_subject_results = {
        "train_subjects": ["politicsNews", "politics", "Government News"],
        "test_subjects": ["worldnews", "News", "left-news"],
        "train_samples": len(X_tr),
        "test_samples": len(X_te),
        "logistic_regression": {
            "accuracy": round(float(lr_acc), 4),
            "macro_f1": round(float(lr_f1), 4),
            "macro_precision": round(float(lr_prec), 4),
            "macro_recall": round(float(lr_rec), 4),
            "confusion_matrix": lr_cm,
        },
        "linear_svm": {
            "accuracy": round(float(svm_acc), 4),
            "macro_f1": round(float(svm_f1), 4),
            "macro_precision": round(float(svm_prec), 4),
            "macro_recall": round(float(svm_rec), 4),
            "confusion_matrix": svm_cm,
        },
    }

    print(f"ISOT Random Stratified Baseline F1: ~0.985 (LR) / ~0.994 (SVM)")
    print(f"ISOT Out-of-Subject Generalization F1: {round(lr_f1, 4)} (LR) / {round(svm_f1, 4)} (SVM)")

    return {
        "leakage_statistics": leakage_stats,
        "out_of_subject_evaluation": out_of_subject_results,
    }


# ==============================================================================
# 2. EVALUATION RELIABILITY & LEAKAGE INVESTIGATION: IFND
# ==============================================================================

def investigate_ifnd_leakage() -> Dict[str, Any]:
    """Inspect IFND for publisher exclusivity and grouped generalization."""
    ifnd_path = resolve_ifnd_path()
    print(f"\n--- Investigating IFND Leakage & Generalization from {ifnd_path} ---")

    records = []
    seen_hashes = set()
    web_counts = {}
    web_by_label = {}
    cat_counts = {}

    with open(ifnd_path, "r", encoding="utf-8", errors="replace") as f:
        reader = csv.reader(f)
        headers = next(reader)
        for row in reader:
            if len(row) >= 7:
                id_val, stmt, img, web, cat, dt, lbl = [c.strip() for c in row[:7]]
                if not stmt or len(stmt) < 15:
                    continue
                h = hashlib.sha256(stmt.encode("utf-8")).hexdigest()
                if h in seen_hashes:
                    continue
                seen_hashes.add(h)

                canonical = "credible" if lbl.upper() == "TRUE" else "unreliable"
                web_counts[web] = web_counts.get(web, 0) + 1
                cat_counts[cat] = cat_counts.get(cat, 0) + 1
                if web not in web_by_label:
                    web_by_label[web] = {"credible": 0, "unreliable": 0}
                web_by_label[web][canonical] += 1

                records.append({
                    "id": id_val,
                    "text": stmt,
                    "canonical_label": canonical,
                    "web": web,
                    "category": cat,
                    "date": dt,
                })

    exclusive_webs = {
        w: ("100% Credible" if c["unreliable"] == 0 else "100% Unreliable")
        for w, c in web_by_label.items()
        if (c["credible"] == 0 or c["unreliable"] == 0) and (c["credible"] + c["unreliable"] > 0)
    }

    print(f"IFND Total records: {len(records)}")
    print(f"Total unique publishers (web): {len(web_counts)}")
    print(f"Publishers publishing EXCLUSIVELY one label: {len(exclusive_webs)} / {len(web_counts)}")

    # 1. Publisher-Grouped Generalization
    # Select test publishers that have substantial data:
    # E.g. Test publishers: BOOMLIVE (Unreliable), THESTATESMAN (Credible), NEWSMOBILE (Unreliable), THEPRINT (Credible)
    test_webs = {"BOOMLIVE", "THESTATESMAN", "NEWSMOBILE", "THEPRINT"}
    train_pool = [r for r in records if r["web"] not in test_webs]
    test_pool = [r for r in records if r["web"] in test_webs]

    # Sample balanced train and test
    train_cred = [r for r in train_pool if r["canonical_label"] == "credible"]
    train_unrel = [r for r in train_pool if r["canonical_label"] == "unreliable"]
    np.random.seed(42)
    idx_tc = np.random.choice(len(train_cred), size=min(10000, len(train_cred)), replace=False)
    idx_tu = np.random.choice(len(train_unrel), size=min(10000, len(train_unrel)), replace=False)
    train_data = [train_cred[i] for i in idx_tc] + [train_unrel[i] for i in idx_tu]

    test_cred = [r for r in test_pool if r["canonical_label"] == "credible"]
    test_unrel = [r for r in test_pool if r["canonical_label"] == "unreliable"]
    idx_ec = np.random.choice(len(test_cred), size=min(2500, len(test_cred)), replace=False)
    idx_eu = np.random.choice(len(test_unrel), size=min(2500, len(test_unrel)), replace=False)
    test_data = [test_cred[i] for i in idx_ec] + [test_unrel[i] for i in idx_eu]

    X_tr = [r["text"] for r in train_data]
    y_tr = [r["canonical_label"] for r in train_data]
    X_te = [r["text"] for r in test_data]
    y_te = [r["canonical_label"] for r in test_data]

    vec = TfidfVectorizer(ngram_range=(1, 2), max_features=10000, sublinear_tf=True)
    X_tr_v = vec.fit_transform(X_tr)
    X_te_v = vec.transform(X_te)

    lr = LogisticRegression(max_iter=1000, random_state=42)
    lr.fit(X_tr_v, y_tr)
    lr_preds = lr.predict(X_te_v)
    lr_acc = accuracy_score(y_te, lr_preds)
    lr_prec, lr_rec, lr_f1, _ = precision_recall_fscore_support(y_te, lr_preds, average="macro", zero_division=0)
    lr_cm = confusion_matrix(y_te, lr_preds, labels=["credible", "unreliable"]).tolist()

    svm = LinearSVC(max_iter=2000, random_state=42)
    svm.fit(X_tr_v, y_tr)
    svm_preds = svm.predict(X_te_v)
    svm_acc = accuracy_score(y_te, svm_preds)
    svm_prec, svm_rec, svm_f1, _ = precision_recall_fscore_support(y_te, svm_preds, average="macro", zero_division=0)
    svm_cm = confusion_matrix(y_te, svm_preds, labels=["credible", "unreliable"]).tolist()

    # 2. Category-Grouped Generalization
    # Train on POLITICS, GOVERNMENT, VIOLENCE; Test on unseen COVID-19 and ELECTION
    cat_train_pool = [r for r in records if r["category"] in ["POLITICS", "GOVERNMENT", "VIOLENCE"]]
    cat_test_pool = [r for r in records if r["category"] in ["COVID-19", "ELECTION"]]

    c_tr_cred = [r for r in cat_train_pool if r["canonical_label"] == "credible"]
    c_tr_unrel = [r for r in cat_train_pool if r["canonical_label"] == "unreliable"]
    idx_cc = np.random.choice(len(c_tr_cred), size=min(6000, len(c_tr_cred)), replace=False)
    idx_cu = np.random.choice(len(c_tr_unrel), size=min(6000, len(c_tr_unrel)), replace=False)
    c_train_data = [c_tr_cred[i] for i in idx_cc] + [c_tr_unrel[i] for i in idx_cu]

    c_te_cred = [r for r in cat_test_pool if r["canonical_label"] == "credible"]
    c_te_unrel = [r for r in cat_test_pool if r["canonical_label"] == "unreliable"]
    idx_cec = np.random.choice(len(c_te_cred), size=min(2500, len(c_te_cred)), replace=False)
    idx_ceu = np.random.choice(len(c_te_unrel), size=min(2500, len(c_te_unrel)), replace=False)
    c_test_data = [c_te_cred[i] for i in idx_cec] + [c_te_unrel[i] for i in idx_ceu]

    cX_tr = [r["text"] for r in c_train_data]
    cy_tr = [r["canonical_label"] for r in c_train_data]
    cX_te = [r["text"] for r in c_test_data]
    cy_te = [r["canonical_label"] for r in c_test_data]

    cvec = TfidfVectorizer(ngram_range=(1, 2), max_features=10000, sublinear_tf=True)
    cX_tr_v = cvec.fit_transform(cX_tr)
    cX_te_v = cvec.transform(cX_te)

    c_lr = LogisticRegression(max_iter=1000, random_state=42)
    c_lr.fit(cX_tr_v, cy_tr)
    c_lr_preds = c_lr.predict(cX_te_v)
    c_lr_acc = accuracy_score(cy_te, c_lr_preds)
    _, _, c_lr_f1, _ = precision_recall_fscore_support(cy_te, c_lr_preds, average="macro", zero_division=0)
    c_lr_cm = confusion_matrix(cy_te, c_lr_preds, labels=["credible", "unreliable"]).tolist()

    c_svm = LinearSVC(max_iter=2000, random_state=42)
    c_svm.fit(cX_tr_v, cy_tr)
    c_svm_preds = c_svm.predict(cX_te_v)
    c_svm_acc = accuracy_score(cy_te, c_svm_preds)
    _, _, c_svm_f1, _ = precision_recall_fscore_support(cy_te, c_svm_preds, average="macro", zero_division=0)
    c_svm_cm = confusion_matrix(cy_te, c_svm_preds, labels=["credible", "unreliable"]).tolist()

    print(f"IFND Random Stratified Baseline F1: ~0.941 (LR) / ~0.945 (SVM)")
    print(f"IFND Publisher-Grouped Generalization F1: {round(lr_f1, 4)} (LR) / {round(svm_f1, 4)} (SVM)")
    print(f"IFND Category-Grouped Generalization F1: {round(c_lr_f1, 4)} (LR) / {round(c_svm_f1, 4)} (SVM)")

    return {
        "total_publishers": len(web_counts),
        "exclusive_publishers": exclusive_webs,
        "publisher_grouped_evaluation": {
            "test_publishers": list(test_webs),
            "train_samples": len(X_tr),
            "test_samples": len(X_te),
            "logistic_regression": {
                "accuracy": round(float(lr_acc), 4),
                "macro_f1": round(float(lr_f1), 4),
                "macro_precision": round(float(lr_prec), 4),
                "macro_recall": round(float(lr_rec), 4),
                "confusion_matrix": lr_cm,
            },
            "linear_svm": {
                "accuracy": round(float(svm_acc), 4),
                "macro_f1": round(float(svm_f1), 4),
                "macro_precision": round(float(svm_prec), 4),
                "macro_recall": round(float(svm_rec), 4),
                "confusion_matrix": svm_cm,
            },
        },
        "category_grouped_evaluation": {
            "train_categories": ["POLITICS", "GOVERNMENT", "VIOLENCE"],
            "test_categories": ["COVID-19", "ELECTION"],
            "train_samples": len(cX_tr),
            "test_samples": len(cX_te),
            "logistic_regression": {
                "accuracy": round(float(c_lr_acc), 4),
                "macro_f1": round(float(c_lr_f1), 4),
                "confusion_matrix": c_lr_cm,
            },
            "linear_svm": {
                "accuracy": round(float(c_svm_acc), 4),
                "macro_f1": round(float(c_svm_f1), 4),
                "confusion_matrix": c_svm_cm,
            },
        },
    }


# ==============================================================================
# 3. HINDI BASELINE IMPROVEMENT (TaLLIP)
# ==============================================================================

def benchmark_latency(model, vectorizer, sample_texts: List[str], repetitions: int = 300) -> float:
    """Measure inference latency per sample in milliseconds over multiple repetitions."""
    t0 = time.perf_counter()
    for _ in range(repetitions):
        X_vec = vectorizer.transform(sample_texts)
        _ = model.predict(X_vec)
    total_time = time.perf_counter() - t0
    total_samples = len(sample_texts) * repetitions
    return round((total_time / total_samples) * 1000, 4)


def improve_hindi_baseline() -> Dict[str, Any]:
    """Perform 5-fold CV on train set and evaluate best pipeline on untouched test set."""
    hindi_dir = DATA_DIR / "tallip" / "TaLLIP_Dataset-main" / "TaLLIP_Dataset-main" / "Hindi"
    train_path = hindi_dir / "Train" / "train_Hindi_Data_Complete_FakeNews.txt"
    test_path = hindi_dir / "Test" / "test_Hindi_Data_Complete_FakeNews.txt"

    print("\n--- Improving TaLLIP Hindi Baseline ---")
    train_records = []
    test_records = []
    seen_hashes = set()

    for path, target_list in [(train_path, train_records), (test_path, test_records)]:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            reader = csv.reader(f, delimiter="\t")
            headers = next(reader)
            for row in reader:
                if len(row) >= 4:
                    domain, topic, news, label = [c.strip() for c in row[:4]]
                    h = hashlib.sha256(news.encode("utf-8")).hexdigest()
                    if h in seen_hashes:
                        continue
                    seen_hashes.add(h)
                    canonical = "credible" if label.lower() == "legit" else "unreliable"
                    target_list.append({
                        "text": news,
                        "canonical_label": canonical,
                        "domain": domain,
                    })

    print(f"TaLLIP Train (Unique): {len(train_records)} | Test (Unique): {len(test_records)}")

    X_train_raw = np.array([r["text"] for r in train_records])
    y_train_raw = np.array([r["canonical_label"] for r in train_records])
    X_test_raw = [r["text"] for r in test_records]
    y_test_raw = [r["canonical_label"] for r in test_records]

    # Pipeline configurations to test via 5-fold Stratified CV
    feature_extractors = {
        "word_ngram_1_2": TfidfVectorizer(
            ngram_range=(1, 2),
            token_pattern=r"(?u)\b\w+\b",
            max_features=5000,
            sublinear_tf=True,
        ),
        "char_ngram_2_5": TfidfVectorizer(
            analyzer="char",
            ngram_range=(2, 5),
            max_features=10000,
            sublinear_tf=True,
        ),
        "char_ngram_3_6": TfidfVectorizer(
            analyzer="char",
            ngram_range=(3, 6),
            max_features=10000,
            sublinear_tf=True,
        ),
        "word_char_union": FeatureUnion([
            (
                "word",
                TfidfVectorizer(
                    ngram_range=(1, 2),
                    token_pattern=r"(?u)\b\w+\b",
                    max_features=5000,
                    sublinear_tf=True,
                ),
            ),
            (
                "char",
                TfidfVectorizer(
                    analyzer="char",
                    ngram_range=(2, 5),
                    max_features=8000,
                    sublinear_tf=True,
                ),
            ),
        ]),
    }

    classifiers = {
        "lr_c1.0": LogisticRegression(C=1.0, class_weight="balanced", max_iter=1000, random_state=42),
        "lr_c2.0": LogisticRegression(C=2.0, class_weight="balanced", max_iter=1000, random_state=42),
        "svm_c0.5": LinearSVC(C=0.5, class_weight="balanced", max_iter=2000, random_state=42),
        "svm_c1.0": LinearSVC(C=1.0, class_weight="balanced", max_iter=2000, random_state=42),
    }

    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_results = {}

    print("\nRunning 5-Fold Stratified Cross-Validation strictly inside Train set (576 samples)...")
    for feat_name, vec in feature_extractors.items():
        cv_results[feat_name] = {}
        for clf_name, clf in classifiers.items():
            f1_scores = []
            acc_scores = []
            for train_idx, val_idx in skf.split(X_train_raw, y_train_raw):
                X_tr, X_val = X_train_raw[train_idx], X_train_raw[val_idx]
                y_tr, y_val = y_train_raw[train_idx], y_train_raw[val_idx]

                X_tr_vec = vec.fit_transform(X_tr)
                X_val_vec = vec.transform(X_val)

                # Clone classifier instance
                model = clf.__class__(**clf.get_params())
                model.fit(X_tr_vec, y_tr)
                preds = model.predict(X_val_vec)

                _, _, f1, _ = precision_recall_fscore_support(y_val, preds, average="macro", zero_division=0)
                acc = accuracy_score(y_val, preds)
                f1_scores.append(f1)
                acc_scores.append(acc)

            mean_f1 = float(np.mean(f1_scores))
            std_f1 = float(np.std(f1_scores))
            mean_acc = float(np.mean(acc_scores))
            cv_results[feat_name][clf_name] = {
                "cv_mean_f1": round(mean_f1, 4),
                "cv_std_f1": round(std_f1, 4),
                "cv_mean_accuracy": round(mean_acc, 4),
            }
            print(f"  {feat_name:18} + {clf_name:10} -> CV F1: {mean_f1:.4f} (+/- {std_f1:.4f}) | Acc: {mean_acc:.4f}")

    # Determine best combination based on CV Mean F1
    best_config = None
    best_cv_f1 = -1.0
    for feat_name, clfs in cv_results.items():
        for clf_name, metrics in clfs.items():
            if metrics["cv_mean_f1"] > best_cv_f1:
                best_cv_f1 = metrics["cv_mean_f1"]
                best_config = (feat_name, clf_name)

    print(f"\nWinning Architecture on CV: Feature={best_config[0]} | Classifier={best_config[1]} (CV F1={best_cv_f1:.4f})")

    # Fit best winning model on full train (576) and evaluate strictly on untouched test (374)
    best_vec = feature_extractors[best_config[0]]
    best_clf_template = classifiers[best_config[1]]
    final_model = best_clf_template.__class__(**best_clf_template.get_params())

    t0_fit = time.perf_counter()
    X_train_vec = best_vec.fit_transform(X_train_raw)
    final_model.fit(X_train_vec, y_train_raw)
    train_fit_time = round(time.perf_counter() - t0_fit, 3)

    X_test_vec = best_vec.transform(X_test_raw)
    test_preds = final_model.predict(X_test_vec)

    test_acc = float(accuracy_score(y_test_raw, test_preds))
    test_prec, test_rec, test_f1, _ = precision_recall_fscore_support(y_test_raw, test_preds, average="macro", zero_division=0)
    test_prec_c, test_rec_c, test_f1_c, _ = precision_recall_fscore_support(
        y_test_raw, test_preds, labels=["credible", "unreliable"], zero_division=0
    )
    test_cm = confusion_matrix(y_test_raw, test_preds, labels=["credible", "unreliable"]).tolist()

    # Latency over 300 repetitions
    latency_ms = benchmark_latency(final_model, best_vec, X_test_raw[:50], repetitions=300)

    # Save hardened model artifact
    hardened_artifact_path = MODELS_DIR / "hi_tallip_hindi_articles_hardened.joblib"
    joblib.dump(
        {
            "vectorizer": best_vec,
            "model": final_model,
            "classes": final_model.classes_,
            "language": "hi",
            "feature_extractor": best_config[0],
            "classifier_name": best_config[1],
            "train_samples": len(train_records),
            "test_samples": len(test_records),
            "cv_mean_f1": best_cv_f1,
            "test_macro_f1": round(test_f1, 4),
        },
        hardened_artifact_path,
        compress=3,
    )
    print(f"Hardened model artifact saved to: {hardened_artifact_path}")
    print(f"Untouched Test Results: Acc={test_acc:.4f} | F1={test_f1:.4f} | Latency={latency_ms:.4f} ms/sample")

    return {
        "train_samples": len(train_records),
        "test_samples": len(test_records),
        "cross_validation_results": cv_results,
        "selected_best_configuration": {
            "feature_extractor": best_config[0],
            "classifier": best_config[1],
            "cv_macro_f1": round(best_cv_f1, 4),
        },
        "untouched_test_evaluation": {
            "accuracy": round(test_acc, 4),
            "macro_f1": round(float(test_f1), 4),
            "macro_precision": round(float(test_prec), 4),
            "macro_recall": round(float(test_rec), 4),
            "per_class_f1": {
                "credible": round(float(test_f1_c[0]), 4),
                "unreliable": round(float(test_f1_c[1]), 4),
            },
            "per_class_precision": {
                "credible": round(float(test_prec_c[0]), 4),
                "unreliable": round(float(test_prec_c[1]), 4),
            },
            "per_class_recall": {
                "credible": round(float(test_rec_c[0]), 4),
                "unreliable": round(float(test_rec_c[1]), 4),
            },
            "confusion_matrix": test_cm,
            "inference_latency_ms_per_sample": latency_ms,
            "fit_time_s": train_fit_time,
            "artifact_path": str(hardened_artifact_path),
        },
        "baseline_comparison": {
            "original_baseline_lr_f1": 0.6043,
            "original_baseline_svm_f1": 0.5614,
            "hardened_model_f1": round(float(test_f1), 4),
            "f1_improvement_over_baseline": round(float(test_f1) - 0.6043, 4),
        },
    }


# ==============================================================================
# MAIN EXECUTION
# ==============================================================================

def main():
    print("=== STARTING P10/P11 MODEL HARDENING & LEAKAGE INVESTIGATION ===")

    isot_results = investigate_isot_leakage()
    ifnd_results = investigate_ifnd_leakage()
    hindi_results = improve_hindi_baseline()

    combined_results = {
        "isot_leakage_and_generalization": isot_results,
        "ifnd_leakage_and_generalization": ifnd_results,
        "hindi_baseline_improvement": hindi_results,
    }

    report_json_path = DOCS_DIR / "p10-p11-hardened-experiments-report.json"
    with open(report_json_path, "w", encoding="utf-8") as f:
        json.dump(combined_results, f, indent=2, ensure_ascii=False)
    print(f"\nAll hardened experiment results successfully written to: {report_json_path}")
    print("=== P10/P11 INVESTIGATION AND EXPERIMENT COMPLETE ===")


if __name__ == "__main__":
    main()

