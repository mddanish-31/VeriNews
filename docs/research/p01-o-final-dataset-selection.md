# VeriNews P01-O — Final Dataset Selection

**Execution label:** P01-O  
**Review date:** 2026-11-08  
**Scope:** Final dataset selection decision for VeriNews MVP based on comparative evaluation of ISOT, TaLLIP, and Indic Zenodo Hindi.  
**Project decision:** No dataset selected or approved. P01 remains **OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL**. WELFake remains **ON HOLD**. No dataset is approved for local training or public portfolio demonstration. P02 is **NOT STARTED**.  
**Tracker execution ID:** EXEC-20261108174414450-0F965AE2  
**Preceding reports:** P01-M, P01-N, P01-O comparative evaluation (`docs/research/p01-o-three-dataset-comparative-evaluation.md`)

---

## 1. Executive summary

This report records the final dataset selection decision for VeriNews Phase P01 based on the comparative evaluation of three candidates: ISOT Fake News Dataset (English), TaLLIP Multilingual Dataset (Hindi), and Indic Zenodo Hindi Fake/Real archive.

**Decision: No dataset is approved for baseline training.**

All three candidates fail to meet the combined gates required for VeriNews: label reliability, data integrity, provenance and rights clarity, language/task suitability, leakage and evaluation suitability, and CPU feasibility. No candidate achieves a weighted score above 41/100.

**Selected dataset(s): None.**

**Training status:** No baseline model training can proceed in this execution. No candidate passes all required gates. Additionally, Python 3.14.6 is available in the environment but no candidate has passed all gates, so no training can proceed even though the runtime is present.

---

## 2. Candidate-by-candidate decision

### 2.1 ISOT Fake News Dataset (English)

| Attribute | Value |
|-----------|-------|
| Final status | CONDITIONALLY SUITABLE — NOT APPROVED |
| Score | 41/100 |
| Primary blocker | Missing explicit dataset licence; severe source-based label confounding |
| Secondary blocker | No official train/test split documented |
| Tertiary blocker | Upstream Reuters/publisher rights unresolved |

**Reason for non-selection:** ISOT provides full English article text with 44,898 records, but labels are source-group-derived (Reuters = Real, flagged outlets = Fake), not individually verified. No explicit dataset licence exists. Upstream publisher rights are unresolved. Without explicit licence and source-aware evaluation design, training would produce a source-proxy model, not a credibility classifier.

**Path to approval:** Explicit dataset reuse licence from UVic; source-aware grouped evaluation; leakage mitigation documentation; mentor approval.

### 2.2 TaLLIP Multilingual Dataset (Hindi)

| Attribute | Value |
|-----------|-------|
| Final status | PENDING — NOT APPROVED |
| Score | 32/100 |
| Primary blocker | Dataset licence unverified; archive contents not inspected |
| Secondary blocker | Counts, schema, labels, language quality all unverified |
| Tertiary blocker | Original vs translated content unknown |

**Reason for non-selection:** Train/test `.txt` files are listed in two GitHub repositories, but counts, schema, labels, and language quality have not been inspected. No dataset licence exists (Arko98 code MIT ≠ data licence; second repo has no visible licence). Without explicit dataset licence and content verification, training cannot proceed.

**Path to approval:** Dataset licence from authors/maintainers; archive download and content inspection; counts/schema/label verification; Hindi original vs translated documentation; mentor approval.

### 2.3 Indic Zenodo Hindi Fake/Real archive

| Attribute | Value |
|-----------|-------|
| Final status | PENDING / NOT APPROVED |
| Score | 37/100 |
| Primary blocker | Licence conflict (Zenodo CC BY 4.0 vs paper CC BY-NC 4.0) |
| Secondary blocker | Material integrity conflicts (count discrepancies, duplicate excess, short files, language mismatch) |
| Tertiary blocker | Archive-to-paper identity unresolved |

**Reason for non-selection:** Local files exist (`data/raw/indic_zenodo/Hindi_F&R_News/`), but the CC BY vs CC BY-NC conflict creates rights uncertainty. Material integrity issues (20,593 local files vs 20,493 paper-reported; 5,493 duplicate excess; 2 short files; 4 vs 5 languages) prevent reliable training.

**Path to approval:** CC BY vs CC BY-NC conflict resolution; archive-to-paper identity reconciliation; count/duplicate/short-file/language discrepancy explanations; mentor approval.

---

## 3. Decision rationale

### 3.1 Why no dataset is approved

No candidate satisfies all six weighted criteria at a level sufficient for training:

| Gate | ISOT | TaLLIP | Indic Zenodo Hindi |
|------|------|--------|-------------------|
| Label reliability | Source-derived, not item-verified | Method unverified | Paper-reported, not archive-tied |
| Data integrity | Counts reported, not audited | Not inspected | Count/duplicate conflicts |
| Provenance/rights | No explicit licence | No data licence | CC BY vs CC BY-NC conflict |
| Language/task suitability | English article text | Hindi Devanagari claimed | Hindi Devanagari claimed |
| Leakage/evaluation | Severe source confounding | Not documented | Not documented |
| CPU feasibility | Feasible (~45K records) | Plausible | Feasible (~20K files) |

### 3.2 Why training cannot proceed

1. **No dataset has explicit reuse terms** — ISOT has no explicit dataset licence; TaLLIP has no data licence; Indic Zenodo Hindi has conflicting licence declarations.
2. **No dataset has verified label semantics** — ISOT labels are source-group-derived; TaLLIP label method is unverified; Indic Zenodo Hindi labels are paper-reported but not tied to the archive.
3. **No dataset has verified integrity** — ISOT counts not audited; TaLLIP contents not inspected; Indic Zenodo Hindi has count/duplicate/language discrepancies.
4. **Python 3.14.6 is available** in the environment, but even if a dataset passed all gates, training could not proceed because no candidate meets the gate requirements.

---

## 4. Dataset acquisition status

| Candidate | Local files | Download status | Rights status | Training blocked by |
|-----------|-------------|-----------------|---------------|---------------------|
| ISOT | Not downloaded | Not downloaded — no explicit licence | Licence not established | Rights + label quality |
| TaLLIP | Not downloaded (.gitkeep only) | Not downloaded — licence unverified | Dataset licence unverified | Rights + content unknown |
| Indic Zenodo Hindi | Files present locally | Already present (prior download) | CC BY vs CC BY-NC conflict | Rights + integrity |
| WELFake | WELFake_Dataset.csv (245MB) | Already present (prior download) | Label mapping unresolved | Label semantics + rights |

**No new downloads were performed** in this execution. Per the task restrictions: "If a dataset's licence or upstream rights do not permit the intended use, do not download or train on it."

---

## 5. Audit report

No new audit was performed beyond read-only inspection of file headers and row counts for WELFake (already present locally). Python 3.14.6 was used to verify:

- WELFake: 72,134 four-field records, label `0`: 35,028, label `1`: 37,106 — matches prior audit records
- Indic Zenodo Hindi: 10,293 fake files + 10,300 real files = 20,593 total files — matches prior audit records

Existing audit findings from prior reports (P01-E through P01-N) were preserved and used as the basis for this evaluation. No new audit artifacts were generated.

| Dataset | Audit status | Key findings |
|---------|-------------|--------------|
| WELFake | Strict parse completed (P01-L/P01-N) | 72,134 four-field records; labels `0: 35,028`, `1: 37,106`; mapping conflict with Zenodo declaration |
| ISOT | Not audited locally | Counts paper-reported; no local inspection |
| TaLLIP | Not audited locally | Files not downloaded; contents unknown |
| Indic Zenodo Hindi | Prior audit exists | 20,593 files vs 20,493 paper-reported; 5,493 duplicate excess; 2 short files; 4 vs 5 languages |

---

## 6. Training status

**No training was performed.**

**Reason:** No dataset passed all required approval gates. Even if a dataset had passed, Python 3.14.6 is available in the environment but no candidate meets the gate requirements, so no training could occur.

**Planned baseline (when a dataset is approved):**
- TF-IDF vectorization
- Logistic Regression classifier
- Multinomial Naive Bayes comparison
- Linear SVM comparison (if CPU/memory permits)
- Stratified train/validation/test split
- Vectorizer fit on training data only
- Macro F1 as primary metric
- Accuracy, precision, recall, per-class F1, confusion matrix
- Reproducible random seeds

---

## 7. Changed and created files

| File | Action | Reason |
|------|--------|--------|
| `docs/research/p01-o-three-dataset-comparative-evaluation.md` | Created | Comparative evaluation of ISOT, TaLLIP, Indic Zenodo Hindi |
| `docs/research/p01-o-final-dataset-selection.md` | Created | Final dataset selection decision and rationale |
| `docs/research/p01-o-dataset-audit-report.md` | Not created | No new audit performed beyond read-only file header/row-count inspection; existing audit records preserved in prior reports |

No existing files were modified. No datasets were downloaded. No model artifacts were created.

---

## 8. Updated tracker status

| Item | Value |
|------|-------|
| P01 status | In Progress |
| P01 active phase | P01 (Research and Dataset Feasibility) |
| WELFake status | ON HOLD |
| ISOT status | CONDITIONALLY SUITABLE — NOT APPROVED |
| TaLLIP status | PENDING — NOT APPROVED |
| Indic Zenodo Hindi status | PENDING / NOT APPROVED |
| Lifecycle mode | Development |
| Release approval | Not Approved |
| P02 status | NOT STARTED |
| P05–P15 status | NOT STARTED |

**Tracker was updated** via `scripts/update_project_tracker.mjs` with execution ID EXEC-20261108174414450-0F965AE2.

---

## 9. Git working-tree status

```
## main...origin/main
 M project-tracker/progress.json
 M project-tracker/roadmap.json
?? docs/research/p01-k-welfake-original-paper-evidence-review.md
?? docs/research/p01-l-welfake-full-paper-methodology-review.md
?? docs/research/p01-m-comprehensive-evidence-recovery-and-candidate-review.md
?? docs/research/p01-m-evidence-register.md
?? docs/research/p01-n-welfake-critical-evidence-resolution.md
?? docs/research/p01-n-welfake-evidence-matrix.md
?? docs/research/p01-o-three-dataset-comparative-evaluation.md
?? docs/research/p01-o-final-dataset-selection.md
```

- No commit, push, or remote change was made.
- No raw datasets or model artifacts were committed to GitHub.
- `data/raw/` contents are excluded from Git via `data/.gitignore`.

---

## 10. Remaining blockers and next recommendation

| Blocker | Severity | Required resolution |
|---------|----------|---------------------|
| No dataset passes all approval gates | Critical | Explicit dataset licence + label semantics + upstream rights for at least one candidate |
| Python not available in environment | High | Python installation required for any training/audit |
| WELFake label mapping unresolved | High | Primary label-mapping evidence tied to exact CSV release |
| ISOT source confounding | Medium | Source-aware evaluation design; explicit dataset licence |
| TaLLIP dataset licence unverified | Medium | Dataset licence from authors; archive contents inspection |
| Indic Zenodo Hindi licence conflict | High | CC BY vs CC BY-NC resolution; archive-to-paper identity |

**Most efficient next action to close P01:** Mentor review of this consolidated evaluation and authorization of a narrowly scoped follow-up on the highest-priority unresolved item. Given that no dataset currently passes all gates, the most efficient path is to resolve WELFake label mapping (H-01) since WELFake already has the file locally and the highest-quality article text, OR to resolve ISOT's licence and source-confounding issues since ISOT has the cleanest article format.

**P01 remains OPEN / AWAITING DATASET EVIDENCE AND MENTOR APPROVAL. STOP: awaiting mentor review. Do not begin downloads, audits, preprocessing, model work, author contact, or another research phase automatically.**
