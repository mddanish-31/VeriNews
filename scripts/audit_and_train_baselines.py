"""VeriNews Four-Dataset Audit and Classical Baseline Training Script.

Audits:
1. WELFake (English full articles)
2. ISOT (English full articles)
3. TaLLIP (Hindi Devanagari articles)
4. IFND (English / Indian news statements)

Trains:
- English Baseline (ISOT 20k balanced with Reuters dateline leakage mitigation)
- Hindi Baseline (TaLLIP Hindi Devanagari)
- Indian Headlines Benchmark (IFND 20k balanced)
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
from sklearn.model_selection import train_test_split
from sklearn.svm import LinearSVC

csv.field_size_limit(50_000_000)

ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data" / "raw"
MODELS_DIR = ROOT_DIR / "models" / "baselines"
MODELS_DIR.mkdir(parents=True, exist_ok=True)


def clean_isot_text(text: str) -> str:
    """Strip Reuters dateline prefix to prevent trivial source leakage."""
    # Pattern: "WASHINGTON (Reuters) - " or "LONDON (Reuters) - "
    cleaned = re.sub(r"^[A-Za-z\s,/\.\-]+(?:\(Reuters\)|\(reuters\))\s*[-–—]\s*", "", text.strip())
    # Also strip standalone "(Reuters)" prefixes
    cleaned = re.sub(r"^\(Reuters\)\s*[-–—]?\s*", "", cleaned.strip())
    return cleaned.strip()


def audit_welfake() -> Dict[str, Any]:
    """Audit WELFake dataset."""
    path = DATA_DIR / "welfake" / "WELFake_Dataset.csv"
    if not path.is_file():
        return {"status": "FILE_NOT_FOUND"}

    size_bytes = os.path.getsize(path)
    total_records = 0
    missing_text = 0
    missing_title = 0
    short_text = 0
    seen_hashes = set()
    duplicates = 0
    unique_usable = 0
    labels = {"0": 0, "1": 0}
    text_lengths = []

    with open(path, "r", encoding="utf-8", errors="replace") as f:
        reader = csv.reader(f)
        headers = next(reader)
        for row in reader:
            total_records += 1
            if len(row) >= 4:
                title, text, label = row[1].strip(), row[2].strip(), row[3].strip()
                if label in labels:
                    labels[label] += 1
                if not text:
                    missing_text += 1
                elif len(text) < 50:
                    short_text += 1
                else:
                    h = hashlib.sha256(text.encode("utf-8")).hexdigest()
                    if h in seen_hashes:
                        duplicates += 1
                    else:
                        seen_hashes.add(h)
                        unique_usable += 1
                        text_lengths.append(len(text))
                if not title:
                    missing_title += 1

    return {
        "dataset": "WELFake",
        "file_path": str(path),
        "file_size_mb": round(size_bytes / (1024 * 1024), 2),
        "headers": headers,
        "total_records": total_records,
        "usable_unique_records": unique_usable,
        "exact_duplicates": duplicates,
        "missing_text": missing_text,
        "missing_title": missing_title,
        "short_text_lt_50": short_text,
        "label_distribution": labels,
        "text_length": {
            "min": min(text_lengths) if text_lengths else 0,
            "max": max(text_lengths) if text_lengths else 0,
            "mean": round(float(np.mean(text_lengths)), 1) if text_lengths else 0,
        },
        "license": "CC BY 4.0 on Zenodo (Record 4561253)",
        "decision": "BLOCKED — INSUFFICIENT EVIDENCE (UNRESOLVED LABEL INVERSION)",
        "reason": (
            "Contradiction between Zenodo text (0=Fake, 1=Real) and Zenodo summary counts "
            "(35,028 Real, 37,106 Fake vs 35,028 '0's and 37,106 '1's in CSV). "
            "Training risks creating an inverted credibility model."
        ),
    }


def audit_isot() -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    """Audit ISOT dataset and return clean records."""
    fake_path = DATA_DIR / "isot" / "News-_dataset" / "Fake.csv"
    true_path = DATA_DIR / "isot" / "News-_dataset" / "True.csv"

    if not fake_path.is_file() or not true_path.is_file():
        return {"status": "FILE_NOT_FOUND"}, []

    size_mb = round((os.path.getsize(fake_path) + os.path.getsize(true_path)) / (1024 * 1024), 2)
    records = []
    seen_hashes = set()
    duplicates = 0
    missing_text = 0
    subjects = {}
    text_lengths = []

    for path, label, canonical in [(true_path, "True", "credible"), (fake_path, "Fake", "unreliable")]:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            reader = csv.reader(f)
            headers = next(reader)
            for row in reader:
                if len(row) >= 4:
                    title, raw_text, subject, date = row[0].strip(), row[1].strip(), row[2].strip(), row[3].strip()
                    subjects[subject] = subjects.get(subject, 0) + 1
                    cleaned = clean_isot_text(raw_text)
                    if not cleaned or len(cleaned) < 50:
                        missing_text += 1
                        continue
                    h = hashlib.sha256(cleaned.encode("utf-8")).hexdigest()
                    if h in seen_hashes:
                        duplicates += 1
                        continue
                    seen_hashes.add(h)
                    text_lengths.append(len(cleaned))
                    records.append({
                        "id": f"isot_{len(records)}",
                        "text": cleaned,
                        "raw_label": label,
                        "canonical_label": canonical,
                        "subject": subject,
                        "language": "en",
                    })

    audit_res = {
        "dataset": "ISOT",
        "file_paths": [str(fake_path), str(true_path)],
        "file_size_mb": size_mb,
        "headers": headers,
        "total_records": 44898,
        "usable_unique_records": len(records),
        "exact_duplicates": duplicates,
        "missing_or_short_text": missing_text,
        "label_distribution": {
            "credible (True.csv)": sum(1 for r in records if r["canonical_label"] == "credible"),
            "unreliable (Fake.csv)": sum(1 for r in records if r["canonical_label"] == "unreliable"),
        },
        "subjects": subjects,
        "text_length": {
            "min": min(text_lengths) if text_lengths else 0,
            "max": max(text_lengths) if text_lengths else 0,
            "mean": round(float(np.mean(text_lengths)), 1) if text_lengths else 0,
        },
        "license": "University of Victoria (UVic) Academic Research Terms",
        "decision": "APPROVED FOR ENGLISH FULL-ARTICLE BASELINE (WITH LEAKAGE MITIGATION)",
        "leakage_mitigation": "Stripped Reuters dateline prefixes to avoid trivial publisher cue learning.",
    }
    return audit_res, records


def audit_tallip() -> Tuple[Dict[str, Any], List[Dict[str, Any]], List[Dict[str, Any]]]:
    """Audit TaLLIP Hindi dataset and return train and test records."""
    hindi_dir = DATA_DIR / "tallip" / "TaLLIP_Dataset-main" / "TaLLIP_Dataset-main" / "Hindi"
    train_path = hindi_dir / "Train" / "train_Hindi_Data_Complete_FakeNews.txt"
    test_path = hindi_dir / "Test" / "test_Hindi_Data_Complete_FakeNews.txt"

    if not train_path.is_file() or not test_path.is_file():
        return {"status": "FILE_NOT_FOUND"}, [], []

    size_mb = round((os.path.getsize(train_path) + os.path.getsize(test_path)) / (1024 * 1024), 2)
    train_records = []
    test_records = []
    seen_hashes = set()
    duplicates = 0
    domains = {}
    text_lengths = []

    for path, target_list in [(train_path, train_records), (test_path, test_records)]:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            reader = csv.reader(f, delimiter="\t")
            headers = next(reader)
            for row in reader:
                if len(row) >= 4:
                    domain, topic, news, label = row[0].strip(), row[1].strip(), row[2].strip(), row[3].strip()
                    domains[domain] = domains.get(domain, 0) + 1
                    h = hashlib.sha256(news.encode("utf-8")).hexdigest()
                    if h in seen_hashes:
                        duplicates += 1
                        continue
                    seen_hashes.add(h)
                    text_lengths.append(len(news))
                    canonical = "credible" if label.lower() == "legit" else "unreliable"
                    target_list.append({
                        "id": f"tallip_{len(target_list)}",
                        "text": news,
                        "raw_label": label,
                        "canonical_label": canonical,
                        "domain": domain,
                        "language": "hi",
                    })

    all_records = train_records + test_records
    audit_res = {
        "dataset": "TaLLIP Hindi",
        "file_paths": [str(train_path), str(test_path)],
        "file_size_mb": size_mb,
        "headers": headers,
        "total_records": 980,
        "usable_unique_records": len(all_records),
        "exact_duplicates": duplicates,
        "train_samples": len(train_records),
        "test_samples": len(test_records),
        "label_distribution": {
            "credible (Legit)": sum(1 for r in all_records if r["canonical_label"] == "credible"),
            "unreliable (Fake)": sum(1 for r in all_records if r["canonical_label"] == "unreliable"),
        },
        "domains": domains,
        "text_length": {
            "min": min(text_lengths) if text_lengths else 0,
            "max": max(text_lengths) if text_lengths else 0,
            "mean": round(float(np.mean(text_lengths)), 1) if text_lengths else 0,
        },
        "license": "ACM-TALLIP Academic Research (IIT Hyderabad / IIT Patna, 2021)",
        "decision": "APPROVED FOR HINDI BASELINE TRAINING",
        "reason": "Verified Devanagari Hindi text, balanced labels, domain tags, author split available.",
    }
    return audit_res, train_records, test_records


def resolve_ifnd_path() -> Path:
    """Resolve IFND path supporting flat and nested directory structures."""
    nested = DATA_DIR / "ifnd" / "IFND.csv" / "IFND.csv"
    if nested.is_file():
        return nested
    flat = DATA_DIR / "ifnd" / "IFND.csv"
    if flat.is_file():
        return flat
    raise FileNotFoundError(f"IFND not found at {flat} or {nested}")


def audit_ifnd() -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    """Audit IFND dataset and return clean records."""
    try:
        path = resolve_ifnd_path()
    except FileNotFoundError:
        return {"status": "FILE_NOT_FOUND"}, []

    size_mb = round(os.path.getsize(path) / (1024 * 1024), 2)
    records = []
    seen_hashes = set()
    duplicates = 0
    categories = {}
    text_lengths = []

    with open(path, "r", encoding="utf-8", errors="replace") as f:
        reader = csv.reader(f)
        headers = next(reader)
        for row in reader:
            if len(row) >= 7:
                id_val, statement, image, web, category, date, label = (
                    row[0].strip(), row[1].strip(), row[2].strip(),
                    row[3].strip(), row[4].strip(), row[5].strip(), row[6].strip()
                )
                categories[category] = categories.get(category, 0) + 1
                if not statement or len(statement) < 15:
                    continue
                h = hashlib.sha256(statement.encode("utf-8")).hexdigest()
                if h in seen_hashes:
                    duplicates += 1
                    continue
                seen_hashes.add(h)
                text_lengths.append(len(statement))
                canonical = "credible" if label.upper() == "TRUE" else "unreliable"
                records.append({
                    "id": id_val,
                    "text": statement,
                    "raw_label": label,
                    "canonical_label": canonical,
                    "category": category,
                    "web": web,
                    "language": "en",
                })

    audit_res = {
        "dataset": "IFND",
        "file_path": str(path),
        "file_size_mb": size_mb,
        "headers": headers,
        "total_records": 56714,
        "usable_unique_records": len(records),
        "exact_duplicates": duplicates,
        "label_distribution": {
            "credible (TRUE)": sum(1 for r in records if r["canonical_label"] == "credible"),
            "unreliable (Fake)": sum(1 for r in records if r["canonical_label"] == "unreliable"),
        },
        "top_categories": dict(sorted(categories.items(), key=lambda x: x[1], reverse=True)[:5]),
        "text_length": {
            "min": min(text_lengths) if text_lengths else 0,
            "max": max(text_lengths) if text_lengths else 0,
            "mean": round(float(np.mean(text_lengths)), 1) if text_lengths else 0,
        },
        "license": "CC BY 4.0 (Mendeley Data / Kar et al., 2021)",
        "decision": "APPROVED FOR INDIAN NEWS HEADLINE BENCHMARK (SEPARATE FROM FULL ARTICLES)",
        "notes": "Short statements/headlines (avg 80 chars); kept separate to prevent length/domain collapse.",
    }
    return audit_res, records


def train_and_evaluate(
    name: str,
    X_train: List[str],
    y_train: List[str],
    X_val: List[str],
    y_val: List[str],
    X_test: List[str],
    y_test: List[str],
    language: str = "en",
) -> Dict[str, Any]:
    """Train and evaluate TF-IDF + Logistic Regression and Linear SVM."""
    print(f"\n--- Training {name} ---")
    print(f"Train samples: {len(X_train)} | Val samples: {len(X_val)} | Test samples: {len(X_test)}")

    token_pattern = r"(?u)\b\w+\b"
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=10000,
        sublinear_tf=True,
        token_pattern=token_pattern,
    )

    t0_fit = time.perf_counter()
    X_train_vec = vectorizer.fit_transform(X_train)
    fit_time = round(time.perf_counter() - t0_fit, 3)

    X_val_vec = vectorizer.transform(X_val)
    X_test_vec = vectorizer.transform(X_test)

    # 1. Logistic Regression
    lr = LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42, solver="lbfgs")
    t0_lr = time.perf_counter()
    lr.fit(X_train_vec, y_train)
    lr_train_time = round(time.perf_counter() - t0_lr, 3)

    t0_inf = time.perf_counter()
    lr_preds = lr.predict(X_test_vec)
    lr_inf_time = round((time.perf_counter() - t0_inf) / len(X_test) * 1000, 3)  # ms per sample

    lr_acc = float(accuracy_score(y_test, lr_preds))
    lr_prec, lr_rec, lr_f1, _ = precision_recall_fscore_support(y_test, lr_preds, average="macro", zero_division=0)
    lr_prec_c, lr_rec_c, lr_f1_c, _ = precision_recall_fscore_support(
        y_test, lr_preds, labels=["credible", "unreliable"], zero_division=0
    )
    lr_cm = confusion_matrix(y_test, lr_preds, labels=["credible", "unreliable"]).tolist()

    # 2. Linear SVM
    svm = LinearSVC(class_weight="balanced", random_state=42, max_iter=2000)
    t0_svm = time.perf_counter()
    svm.fit(X_train_vec, y_train)
    svm_train_time = round(time.perf_counter() - t0_svm, 3)

    t0_svm_inf = time.perf_counter()
    svm_preds = svm.predict(X_test_vec)
    svm_inf_time = round((time.perf_counter() - t0_svm_inf) / len(X_test) * 1000, 3)

    svm_acc = float(accuracy_score(y_test, svm_preds))
    svm_prec, svm_rec, svm_f1, _ = precision_recall_fscore_support(y_test, svm_preds, average="macro", zero_division=0)
    svm_cm = confusion_matrix(y_test, svm_preds, labels=["credible", "unreliable"]).tolist()

    # Save artifacts
    lr_artifact_path = MODELS_DIR / f"{language}_{name.lower().replace(' ', '_')}_logistic_regression.joblib"
    svm_artifact_path = MODELS_DIR / f"{language}_{name.lower().replace(' ', '_')}_linear_svm.joblib"

    joblib.dump({"vectorizer": vectorizer, "model": lr, "classes": lr.classes_, "language": language}, lr_artifact_path, compress=3)
    joblib.dump({"vectorizer": vectorizer, "model": svm, "classes": svm.classes_, "language": language}, svm_artifact_path, compress=3)

    results = {
        "model_name": name,
        "language": language,
        "sample_counts": {"train": len(X_train), "val": len(X_val), "test": len(X_test)},
        "tfidf_fit_time_s": fit_time,
        "logistic_regression": {
            "train_time_s": lr_train_time,
            "inference_latency_ms_per_sample": lr_inf_time,
            "accuracy": round(lr_acc, 4),
            "macro_precision": round(float(lr_prec), 4),
            "macro_recall": round(float(lr_rec), 4),
            "macro_f1": round(float(lr_f1), 4),
            "per_class_f1": {"credible": round(float(lr_f1_c[0]), 4), "unreliable": round(float(lr_f1_c[1]), 4)},
            "confusion_matrix": lr_cm,
            "artifact_path": str(lr_artifact_path),
        },
        "linear_svm": {
            "train_time_s": svm_train_time,
            "inference_latency_ms_per_sample": svm_inf_time,
            "accuracy": round(svm_acc, 4),
            "macro_precision": round(float(svm_prec), 4),
            "macro_recall": round(float(svm_rec), 4),
            "macro_f1": round(float(svm_f1), 4),
            "confusion_matrix": svm_cm,
            "artifact_path": str(svm_artifact_path),
        },
    }
    return results


def main():
    print("=== STARTING VERINEWS FOUR-DATASET AUDIT ===")
    welfake_audit = audit_welfake()
    isot_audit, isot_records = audit_isot()
    tallip_audit, tallip_train, tallip_test = audit_tallip()
    ifnd_audit, ifnd_records = audit_ifnd()

    all_audits = {
        "welfake": welfake_audit,
        "isot": isot_audit,
        "tallip": tallip_audit,
        "ifnd": ifnd_audit,
    }

    # Write audit report JSON
    audit_json_path = ROOT_DIR / "docs" / "research" / "four-dataset-audit-report.json"
    audit_json_path.parent.mkdir(parents=True, exist_ok=True)
    with open(audit_json_path, "w", encoding="utf-8") as f:
        json.dump(all_audits, f, indent=2, ensure_ascii=False)
    print(f"Audit report saved to: {audit_json_path}")

    # Training models on eligible datasets
    training_results = {}

    # 1. English Baseline: ISOT (20,000 balanced subset, leakage-mitigated)
    if isot_records:
        # Sample exactly 10,000 credible and 10,000 unreliable
        cred_isot = [r for r in isot_records if r["canonical_label"] == "credible"]
        unrel_isot = [r for r in isot_records if r["canonical_label"] == "unreliable"]
        np.random.seed(42)
        idx_cred = np.random.choice(len(cred_isot), size=min(10000, len(cred_isot)), replace=False)
        idx_unrel = np.random.choice(len(unrel_isot), size=min(10000, len(unrel_isot)), replace=False)

        balanced_isot = [cred_isot[i] for i in idx_cred] + [unrel_isot[i] for i in idx_unrel]
        X_isot = [r["text"] for r in balanced_isot]
        y_isot = [r["canonical_label"] for r in balanced_isot]

        # 70/15/15 stratified split
        X_tr, X_temp, y_tr, y_temp = train_test_split(X_isot, y_isot, test_size=0.30, random_state=42, stratify=y_isot)
        X_v, X_te, y_v, y_te = train_test_split(X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp)

        isot_results = train_and_evaluate(
            name="ISOT English Articles",
            X_train=X_tr, y_train=y_tr,
            X_val=X_v, y_val=y_v,
            X_test=X_te, y_test=y_te,
            language="en",
        )
        training_results["isot_english"] = isot_results

    # 2. Hindi Baseline: TaLLIP Hindi (949 unique records, author split)
    if tallip_train and tallip_test:
        X_tallip_tr = [r["text"] for r in tallip_train]
        y_tallip_tr = [r["canonical_label"] for r in tallip_train]
        X_tallip_te = [r["text"] for r in tallip_test]
        y_tallip_te = [r["canonical_label"] for r in tallip_test]

        # Split 20% of train for validation
        X_hi_tr, X_hi_val, y_hi_tr, y_hi_val = train_test_split(
            X_tallip_tr, y_tallip_tr, test_size=0.20, random_state=42, stratify=y_tallip_tr
        )

        tallip_results = train_and_evaluate(
            name="TaLLIP Hindi Articles",
            X_train=X_hi_tr, y_train=y_hi_tr,
            X_val=X_hi_val, y_val=y_hi_val,
            X_test=X_tallip_te, y_test=y_tallip_te,
            language="hi",
        )
        training_results["tallip_hindi"] = tallip_results

    # 3. Indian Headlines Benchmark: IFND (20,000 balanced subset)
    if ifnd_records:
        cred_ifnd = [r for r in ifnd_records if r["canonical_label"] == "credible"]
        unrel_ifnd = [r for r in ifnd_records if r["canonical_label"] == "unreliable"]
        np.random.seed(42)
        idx_c = np.random.choice(len(cred_ifnd), size=min(10000, len(cred_ifnd)), replace=False)
        idx_u = np.random.choice(len(unrel_ifnd), size=min(10000, len(unrel_ifnd)), replace=False)

        balanced_ifnd = [cred_ifnd[i] for i in idx_c] + [unrel_ifnd[i] for i in idx_u]
        X_ifnd = [r["text"] for r in balanced_ifnd]
        y_ifnd = [r["canonical_label"] for r in balanced_ifnd]

        X_tr, X_temp, y_tr, y_temp = train_test_split(X_ifnd, y_ifnd, test_size=0.30, random_state=42, stratify=y_ifnd)
        X_v, X_te, y_v, y_te = train_test_split(X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp)

        ifnd_results = train_and_evaluate(
            name="IFND Indian Headlines",
            X_train=X_tr, y_train=y_tr,
            X_val=X_v, y_val=y_v,
            X_test=X_te, y_test=y_te,
            language="en",
        )
        training_results["ifnd_headlines"] = ifnd_results

    # Save training report JSON
    train_json_path = ROOT_DIR / "docs" / "research" / "baseline-training-report.json"
    with open(train_json_path, "w", encoding="utf-8") as f:
        json.dump(training_results, f, indent=2, ensure_ascii=False)
    print(f"\nTraining report saved to: {train_json_path}")
    print("=== AUDIT AND TRAINING COMPLETE ===")


if __name__ == "__main__":
    main()

