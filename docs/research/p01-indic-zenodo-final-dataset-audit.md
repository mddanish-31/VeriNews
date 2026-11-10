# VeriNews P01-O — Indic Zenodo Hindi Final Audit Consolidation

**Execution label:** P01-O  
**Review date:** 2026-11-08  
**Scope:** Consolidation of final Indic Zenodo Hindi dataset audit findings. Documentation-only task. No datasets downloaded, opened for writing, or modified. No models trained.  
**Project decision:** Indic Zenodo Hindi remains **NOT APPROVED** for local training or public portfolio demonstration. P01 remains **OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL**. WELFake remains **ON HOLD**. P02 remains **NOT STARTED**.  
**Tracker execution ID:** EXEC-20261109061656986-DC92A096

---

## 1. Executive Summary

This report consolidates the final audit findings for the Indic Zenodo Hindi Fake/Real dataset. The audit was performed using `scripts/audit_indic_zenodo_files.py`, which reads files in binary mode, computes SHA-256 hashes in 1 MB chunks, and excludes AppleDouble metadata files (`._*` and `__MACOSX/`).

**Principal finding:** The Indic Zenodo Hindi archive contains 20,593 actual article text files across two language-labeled folders (10,293 fake + 10,300 real). Of these, 15,100 unique content hashes exist, meaning 5,493 files are exact duplicates within their respective folders. Zero cross-label identical hashes exist between Fake and Real folders. Zero empty files and zero unreadable files were found.

**Critical finding:** Zero cross-label identical hashes do **not** establish label correctness. Files with identical content across Fake and Real folders would indicate label inconsistency; zero shared hashes means no file content appears in both folders, but this does not validate that individual file labels are correct. Label provenance remains unresolved (see H-01).

**Final decision:** Indic Zenodo Hindi remains **NOT APPROVED** for model training or public portfolio demonstration. Mandatory evidence gates (explicit dataset licence, upstream content rights, label provenance, archive-to-paper identity) remain unresolved.

---

## 2. Directory Structure and Actual Article Counts

| Directory | TXT Files | Notes |
|-----------|-----------|-------|
| `data/raw/indic_zenodo/Hindi_F&R_News/Hindi_fake_news/` | 10,293 | Fake-labelled articles |
| `data/raw/indic_zenodo/Hindi_F&R_News/Hindi_real_news/` | 10,300 | Real-labelled articles |
| `data/raw/indic_zenodo/Hindi_F&R_News/__MACOSX/` | 20,593 | AppleDouble metadata files (excluded from audit) |
| **Total actual article files** | **20,593** | **10,293 fake + 10,300 real** |

**Directory structure:**
```
data/raw/indic_zenodo/Hindi_F&R_News/
├── Hindi_fake_news/     (10,293 .txt files)
├── Hindi_real_news/     (10,300 .txt files)
└── __MACOSX/            (20,593 AppleDouble metadata files — excluded)
```

The `__MACOSX/` directory contains macOS AppleDouble metadata files (names beginning with `._`) created when files are copied to non-HFS+ volumes. These are not article content and are explicitly excluded from the audit by the `is_article_file()` filter in `scripts/audit_indic_zenodo_files.py`.

---

## 3. 41,186 versus 20,593 — Explanation

The discrepancy between 41,186 and 20,593 TXT files is fully explained by the `__MACOSX` directory:

| Source | TXT File Count |
|--------|---------------|
| `Hindi_fake_news/` | 10,293 |
| `Hindi_real_news/` | 10,300 |
| `__MACOSX/` | 20,593 |
| **All `.txt` files** | **41,186** |
| **Actual article files** (excluding `__MACOSX`) | **20,593** |

The `__MACOSX/` directory contains 20,593 AppleDouble metadata files (names beginning with `._`). These are macOS filesystem metadata, not article content. The audit script explicitly excludes them via the `is_article_file()` filter:

```python
def is_article_file(path: Path) -> bool:
    return path.suffix.lower() == ".txt" and not path.name.startswith("._")
```

Therefore, the audited count of **20,593 actual article files** is correct, and the 41,186 figure includes non-article metadata files.

---

## 4. Per-Folder Audit Results

### Hindi_fake_news

| Metric | Value |
|--------|-------|
| Total TXT files | 10,293 |
| Unique content hashes | 7,501 |
| Exact duplicate files beyond first copy | 2,792 |
| Empty files | 0 |
| Unreadable files | 0 |

### Hindi_real_news

| Metric | Value |
|-----------|-------|
| Total TXT files | 10,300 |
| Unique content hashes | 7,599 |
| Exact duplicate files beyond first copy | 2,701 |
| Empty files | 0 |
| Unreadable files | 0 |

### Duplicate Definition

Within-folder excess = sum(group size - 1) for each content hash group. For example, if three files share the same SHA-256 hash, they contribute 2 to the duplicate excess count.

---

## 5. Cross-Folder Analysis

| Metric | Value |
|-----------|-------|
| Total TXT files across both folders | 20,593 |
| Total unique content hashes across both folders | 15,100 |
| Identical content hashes shared between Fake and Real | 0 |
| Shared hash groups | 0 |
| Total files involved in shared hashes | 0 |

**No content hash appears in both the Fake and Real folders.** This means no file content is identical across the two label folders. However, this does **not** establish label correctness — files with different content can still be mislabeled, and labels could be systematically inverted or noisy without producing identical content across folders.

---

## 6. Audit Method

- **Hashing algorithm:** SHA-256
- **File reading mode:** Binary (`rb`), read in 1 MB chunks
- **File inclusion:** Only `.txt` files; excludes `._*` AppleDouble metadata files and `__MACOSX/` directory
- **Duplicate detection:** SHA-256 hash equality; within-folder excess = sum(group size - 1)
- **Cross-folder analysis:** Compares hash values across both folders; reports hashes appearing in both Fake and Real folders
- **No article content was read, printed, or modified**
- **No dataset files were deleted, renamed, moved, or modified**

---

## 7. Evidence Distinction

| Evidence Type | Source | Status |
|---------------|--------|--------|
| File counts per folder | `scripts/audit_indic_zenodo_files.py` | VERIFIED — actual file system enumeration |
| Unique content hashes per folder | SHA-256 computation over file contents | VERIFIED — computed from actual file bytes |
| Duplicate excess per folder | SHA-256 hash grouping | VERIFIED — computed from actual file bytes |
| Cross-folder shared hashes | SHA-256 hash comparison across folders | VERIFIED — zero shared hashes found |
| Label correctness (Fake vs Real accuracy) | Not established | **UNRESOLVED** — file content equality does not validate label semantics |
| Archive-to-paper identity | Not established | **UNRESOLVED** — local file count (20,593) differs from paper-reported count (20,493) |
| Upstream content rights | Not established | **UNRESOLVED** — CC BY 4.0 (Zenodo) vs CC BY-NC 4.0 (paper) conflict |

---

## 8. Relationship to Earlier Findings

This audit confirms and extends earlier findings:

| Finding | Source | Status |
|---------|--------|--------|
| 20,593 actual article files | `scripts/audit_indic_zenodo_files.py` | VERIFIED — direct file system enumeration |
| 15,100 unique content hashes | SHA-256 computation | VERIFIED — computed from actual file bytes |
| 5,493 duplicate files | 2,792 fake + 2,701 real excess | VERIFIED by hash grouping |
| 0 shared hashes between folders | Cross-folder hash comparison | VERIFIED — zero shared hashes found |
| Archive-to-paper identity | Paper reports 20,493 articles; local audit finds 20,593 | UNRESOLVED — 100-file discrepancy unexplained |
| Licence conflict | Zenodo CC BY 4.0 vs paper CC BY-NC 4.0 | UNRESOLVED — no resolution of which applies |
| Label correctness | Not established by any audit | **UNRESOLVED** — zero cross-label hashes does not validate labels |

The file audit confirms the repository's internal consistency (files exist, are readable, and hash deterministically) but does **not** resolve label semantics, upstream rights, or archive-to-paper identity.

---

## 9. Final Decision

**Indic Zenodo Hindi: NOT APPROVED** for local training or public portfolio demonstration.

**Unresolved gates:**

| Gate | Status | Required Evidence |
|------|--------|-------------------|
| Label semantics | UNRESOLVED | Primary evidence tying numeric labels to Fake/Real semantics in the exact CSV release |
| Record-count discrepancy | UNRESOLVED | Primary documentation defining each counting unit and reconciling 20,593 local vs 20,493 paper-reported |
| Source provenance | UNRESOLVED | Per-record source map, collection dates, article URLs, source-to-class assignment |
| Dataset-specific licence | UNRESOLVED | Resolution of CC BY 4.0 (Zenodo) vs CC BY-NC 4.0 (paper) conflict |
| Upstream content rights | UNRESOLVED | Evidence of depositor authority over all article text |
| Evaluation suitability | UNRESOLVED | Near-duplicate grouping, source leakage auditing, train/test split validation |

**No dataset — including Indic Zenodo Hindi — is approved for local training or public portfolio demonstration.**

---

## Related VeriNews Research

- P01-E Final Dataset Feasibility Review
- P01-F Dataset Evidence Decision Register
- P01-G WELFake Evidence Verification
- P01-H WELFake Evidence Access Plan
- P01-I WELFake Primary Evidence Findings
- P01-J Consolidated Dataset Provenance, Rights & Feasibility Research
- P01-K WELFake Original Paper Evidence Review
- P01-L WELFake Full-Paper Methodology Review
- P01-M Comprehensive Dataset Evidence Recovery & Candidate Review
- P01-N Critical WELFake Evidence Resolution
- P01-O Three-Dataset Comparative Evaluation
- P01-O Final Dataset Selection
- P01-O WELFake Language Distribution Audit
- WELFake Label and CSV Integrity Investigation
- WELFake Archive Inspection

**STOP: awaiting mentor review. Do not begin downloads, audits, preprocessing, model work, author contact, or another research phase automatically.**
