#!/usr/bin/env python3
"""
WELFake Dataset Record-Count Discrepancy (H-02 / B-02) and Data-Quality Audit
Standard library only. Non-destructive and deterministic.
"""

import csv
import hashlib
import json
import os
import sys

csv.field_size_limit(50_000_000)

WORKSPACE = r"C:\Users\mddan\Desktop\VeriNews"
CSV_PATH = os.path.join(WORKSPACE, r"data\raw\welfake\WELFake_Dataset.csv")
EXCLUSION_MANIFEST_PATH = os.path.join(WORKSPACE, r"docs\research\welfake_b02_empty_text_exclusion_manifest.json")

def audit_file():
    if not os.path.exists(CSV_PATH):
        print(f"ERROR: Dataset file not found at {CSV_PATH}", file=sys.stderr)
        sys.exit(1)

    print("=== 1. FILE INTEGRITY & BASIC ATTRIBUTES ===")
    file_size = os.path.getsize(CSV_PATH)
    print(f"File Path: {CSV_PATH}")
    print(f"File Size: {file_size:,} bytes ({file_size} bytes)")
    
    # Check BOM & initial bytes
    with open(CSV_PATH, "rb") as f:
        head_bytes = f.read(16)
        has_utf8_bom = head_bytes.startswith(b"\xef\xbb\xbf")
        print(f"UTF-8 BOM detected: {has_utf8_bom}")
        print(f"First 16 raw bytes: {head_bytes}")

    # Compute SHA-256
    print("Computing SHA-256 hash...")
    h = hashlib.sha256()
    with open(CSV_PATH, "rb") as f:
        while chunk := f.read(4 * 1024 * 1024):
            h.update(chunk)
    sha256_hash = h.hexdigest()
    print(f"SHA-256: {sha256_hash}")
    expected_sha = "665331424230fc452e9482c3547a6a199a2c29745ade8d236950d1d105223773"
    if sha256_hash != expected_sha:
        print(f"ERROR: SHA-256 mismatch! Expected {expected_sha}", file=sys.stderr)
        sys.exit(1)
    print("SHA-256 Match: EXACT MATCH (Dataset verified authentic & unaltered)")

    print("\n=== 2. PHYSICAL LINE COUNTING ===")
    total_physical_lines = 0
    total_cr = 0
    total_lf = 0
    total_crlf = 0
    with open(CSV_PATH, "rb") as f:
        content = f.read()
        total_lf = content.count(b"\n")
        total_cr = content.count(b"\r")
        total_crlf = content.count(b"\r\n")
    
    # Using python text readline
    with open(CSV_PATH, "r", encoding="utf-8", errors="replace") as f:
        for _ in f:
            total_physical_lines += 1
            
    print(f"Physical lines (text newline-delimited): {total_physical_lines:,} ({total_physical_lines})")
    print(f"Total '\\n' byte count: {total_lf:,}")
    print(f"Total '\\r' byte count: {total_cr:,}")
    print(f"Total '\\r\\n' sequence count: {total_crlf:,}")

    print("\n=== 3. LOGICAL CSV PARSING & MULTILINE AUDIT ===")
    logical_records = 0
    header = None
    multiline_records = 0
    additional_physical_lines = 0
    
    # Field-specific metrics
    empty_titles = 0
    whitespace_titles = 0
    empty_texts = 0
    whitespace_texts = 0
    both_empty = 0
    
    # Label counts (all)
    label_counts_total = {"0": 0, "1": 0}
    other_labels = {}
    
    # Label counts of unusable text records
    unusable_label_counts = {"0": 0, "1": 0}
    
    # Collect unusable records for exclusion manifest
    unusable_records_manifest = []
    
    # Check index continuity
    indices_are_sequential = True
    expected_idx = 0
    
    with open(CSV_PATH, "r", encoding="utf-8", errors="replace", newline="") as f:
        reader = csv.reader(f)
        try:
            header = next(reader)
        except StopIteration:
            print("ERROR: CSV is empty!", file=sys.stderr)
            sys.exit(1)
            
        for row_num, row in enumerate(reader, start=1):
            logical_records += 1
            if len(row) != 4:
                print(f"ERROR: Row {row_num} has length {len(row)} != 4", file=sys.stderr)
                sys.exit(1)
                
            idx_str, title_str, text_str, label_str = row
            
            # Check sequential integer index
            try:
                idx_int = int(idx_str)
                if idx_int != expected_idx:
                    indices_are_sequential = False
            except ValueError:
                indices_are_sequential = False
            expected_idx += 1
            
            # Check embedded newlines across all fields
            row_newlines = sum(col.count("\n") + col.count("\r") - col.count("\r\n") for col in row)
            # Standard physical lines contributed: number of embedded line breaks
            row_embedded_lines = sum(col.count("\n") for col in row)
            if row_embedded_lines > 0:
                multiline_records += 1
                additional_physical_lines += row_embedded_lines
                
            # Count labels
            lbl = label_str.strip()
            if lbl in label_counts_total:
                label_counts_total[lbl] += 1
            else:
                other_labels[lbl] = other_labels.get(lbl, 0) + 1
                
            # Audit title
            t_len = len(title_str)
            t_stripped_len = len(title_str.strip())
            if t_len == 0:
                empty_titles += 1
            elif t_stripped_len == 0:
                whitespace_titles += 1
                
            # Audit text
            txt_len = len(text_str)
            txt_stripped_len = len(text_str.strip())
            is_unusable_text = False
            exclusion_reason = None
            
            if txt_len == 0:
                empty_texts += 1
                is_unusable_text = True
                exclusion_reason = "EMPTY_TEXT"
            elif txt_stripped_len == 0:
                whitespace_texts += 1
                is_unusable_text = True
                exclusion_reason = "WHITESPACE_ONLY_TEXT"
                
            if (t_len == 0 or t_stripped_len == 0) and is_unusable_text:
                both_empty += 1
                
            if is_unusable_text:
                if lbl in unusable_label_counts:
                    unusable_label_counts[lbl] += 1
                unusable_records_manifest.append({
                    "dataset_index": idx_str,
                    "csv_logical_row": row_num,
                    "title": title_str,
                    "text_length": txt_len,
                    "text_stripped_length": txt_stripped_len,
                    "label": lbl,
                    "exclusion_reason": exclusion_reason
                })

    print(f"Header: {header}")
    print(f"Total Logical CSV Records: {logical_records:,} ({logical_records})")
    print(f"Sequential indices 0 to {expected_idx - 1}: {indices_are_sequential}")
    print(f"Malformed / Wrong-width rows: 0")
    print(f"Non-binary labels: {len(other_labels)}")
    print(f"Records containing multiline fields: {multiline_records:,} ({multiline_records})")
    print(f"Additional physical lines from multiline records: {additional_physical_lines:,} ({additional_physical_lines})")
    reconstructed_physical_lines = 1 + logical_records + additional_physical_lines
    print(f"Reconstructed physical lines (1 header + {logical_records} records + {additional_physical_lines} embedded lines): {reconstructed_physical_lines:,}")
    print(f"Exact physical line count match: {reconstructed_physical_lines == total_physical_lines}")

    print("\n=== 4. RECORD-COUNT DISCREPANCY RECONCILIATION ===")
    zenodo_published_entries = 78098
    paper_and_dataframe_entries = 72134
    difference = zenodo_published_entries - logical_records
    print(f"Zenodo-reported 'data entries': {zenodo_published_entries:,}")
    print(f"Zenodo-reported 'as per the data frame': {paper_and_dataframe_entries:,}")
    print(f"Locally verified logical CSV records: {logical_records:,}")
    print(f"Observed Difference: {zenodo_published_entries} - {logical_records} = {difference:,}")
    print(f"Total Physical Lines in CSV: {total_physical_lines:,}")
    
    hyp_physical_match = (total_physical_lines == zenodo_published_entries)
    print(f"Hypothesis 1 ('78,098 is physical lines'): {hyp_physical_match} (Physical lines = {total_physical_lines:,} != 78,098)")

    print("\n=== 5. EMPTY / WHITESPACE-ONLY TEXT AUDIT ===")
    total_unusable_text = empty_texts + whitespace_texts
    print(f"Empty text fields (0 bytes): {empty_texts}")
    print(f"Whitespace-only text fields (>0 bytes, stripped len 0): {whitespace_texts}")
    print(f"Total unusable text fields: {total_unusable_text}")
    print(f"Empty titles (0 bytes): {empty_titles}")
    print(f"Whitespace-only titles: {whitespace_titles}")
    print(f"Total unusable titles: {empty_titles + whitespace_titles}")
    print(f"Both title and text unusable: {both_empty}")

    print("\n=== 6. LABEL DISTRIBUTION & EXCLUSION IMPACT ===")
    print(f"Raw Class Distribution (Total {logical_records:,}):")
    pct_0_raw = (label_counts_total['0'] / logical_records) * 100
    pct_1_raw = (label_counts_total['1'] / logical_records) * 100
    print(f"  - Label 0 (Real): {label_counts_total['0']:,} ({pct_0_raw:.4f}%)")
    print(f"  - Label 1 (Fake): {label_counts_total['1']:,} ({pct_1_raw:.4f}%)")
    
    print(f"\nUnusable-Text Records Distribution (Total {total_unusable_text}):")
    u_pct_0 = (unusable_label_counts['0'] / total_unusable_text) * 100
    u_pct_1 = (unusable_label_counts['1'] / total_unusable_text) * 100
    print(f"  - Label 0 (Real): {unusable_label_counts['0']} ({u_pct_0:.2f}%)")
    print(f"  - Label 1 (Fake): {unusable_label_counts['1']} ({u_pct_1:.2f}%)")

    clean_total = logical_records - total_unusable_text
    clean_0 = label_counts_total['0'] - unusable_label_counts['0']
    clean_1 = label_counts_total['1'] - unusable_label_counts['1']
    clean_pct_0 = (clean_0 / clean_total) * 100
    clean_pct_1 = (clean_1 / clean_total) * 100
    
    print(f"\nPost-Exclusion Usable Distribution (Total {clean_total:,}):")
    print(f"  - Label 0 (Real): {clean_0:,} ({clean_pct_0:.4f}%) [Delta: {clean_pct_0 - pct_0_raw:+.4f}%]")
    print(f"  - Label 1 (Fake): {clean_1:,} ({clean_pct_1:.4f}%) [Delta: {clean_pct_1 - pct_1_raw:+.4f}%]")

    # Save Exclusion Manifest
    print(f"\nWriting exclusion manifest to {EXCLUSION_MANIFEST_PATH}...")
    manifest_data = {
        "manifest_version": "1.0.0",
        "dataset_name": "WELFake_Dataset",
        "source_file": "data/raw/welfake/WELFake_Dataset.csv",
        "source_file_sha256": sha256_hash,
        "source_file_size_bytes": file_size,
        "policy": "REVERSIBLE_EMPTY_TEXT_EXCLUSION",
        "description": "Records excluded from text modeling due to empty or whitespace-only text field. Raw CSV remains unaltered.",
        "total_source_records": logical_records,
        "total_excluded_records": total_unusable_text,
        "total_training_ready_records": clean_total,
        "breakdown": {
            "empty_text_count": empty_texts,
            "whitespace_only_text_count": whitespace_texts,
            "both_title_and_text_empty": both_empty
        },
        "class_distribution_raw": {
            "label_0_real": label_counts_total['0'],
            "label_1_fake": label_counts_total['1']
        },
        "class_distribution_excluded": {
            "label_0_real": unusable_label_counts['0'],
            "label_1_fake": unusable_label_counts['1']
        },
        "class_distribution_training_ready": {
            "label_0_real": clean_0,
            "label_1_fake": clean_1
        },
        "excluded_records": unusable_records_manifest
    }
    
    with open(EXCLUSION_MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest_data, f, indent=2)
    print(f"Successfully generated exclusion manifest with {len(unusable_records_manifest)} entries.")

    print("\n=== AUDIT COMPLETE: EXIT CODE 0 ===")
    return 0

if __name__ == "__main__":
    sys.exit(audit_file())
