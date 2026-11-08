# WELFake Label and CSV Integrity Investigation

**Inspection date:** 2026-11-06  
**Scope:** Read-only investigation of label semantics, CSV parser-limit artifacts, and the unnamed index column. No rows were changed, repaired, or written to another dataset.

## 1. Summary

The earlier archive audit used Python's default `csv.field_size_limit` of 131,072 characters. Two article-text fields exceed that limit. The resulting parser exceptions and recovery caused the previously reported 45 wrong-width rows and two non-binary label values. With the field limit raised in memory to 50,000,000 characters, strict CSV parsing yields all **72,134 records**, each with four fields, no parser errors, and only label values `0` and `1`.

The actual raw counts are `0: 35,028` and `1: 37,106`. These counts correspond exactly to Zenodo's reported Fake/Real totals **if the labels are reversed** (`0 = Real`, `1 = Fake`), but conflict with Zenodo's explicit mapping (`0 = Fake`, `1 = Real`). This is strong evidence of a possible metadata or label-mapping error, not authorization to reverse labels. Preserve the raw labels and resolve their meaning with the dataset authors before modeling.

## 2. Label distribution and whitespace audit

| Raw value | Count | Share |
| --- | ---: | ---: |
| `0` | 35,028 | 48.5596% |
| `1` | 37,106 | 51.4404% |
| Any other value | 0 | 0% |
| Blank/missing | 0 | 0% |

All label cells are exactly the one-character strings `0` or `1`; none contain leading/trailing whitespace or a UTF-8 decoding anomaly. Strict UTF-8 decoding succeeds for the file.

### Possible reversal

Zenodo reports 35,028 Real and 37,106 Fake, while the CSV has 35,028 zeros and 37,106 ones. Applying the record's mapping (`0 = Fake`, `1 = Real`) gives the opposite class totals. Applying the reversed mapping matches the reported totals exactly. This establishes a **possible reversal**; counts alone cannot establish which mapping is semantically correct. No relabeling was performed.

### Controlled semantic spot-check

Two records per raw label were inspected using their titles and short text excerpts only; excerpts are not reproduced here. In this small, non-random sample, label `0` examples included standard news-reporting style, while label `1` examples used strongly sensationalized framing. This is suggestive of reversal, but cannot prove either article's factual status or the dataset's intended encoding. The examples were not independently fact-checked, and stylistic cues are not ground truth.

## 3. CSV parse-limit and malformed-row investigation

The earlier strict-parser errors were:

- Physical line-end 2,854: `field larger than field limit (131072)`.
- Physical line-end 32,880: `field larger than field limit (131072)`.

These were Python reader field-size-limit errors, not evidence by themselves of invalid quoting. With `csv.field_size_limit(50_000_000)` set only in the inspection process, the same file parses strictly with:

- **72,134** yielded data records, all with four fields.
- **0** parser errors.
- **0** wrong-width records.
- **13,818** records containing multiline fields.

The error positions fall inside two correctly parsed, quoted multiline text fields:

| CSV index | Physical lines spanned | Text-field length |
| ---: | ---: | ---: |
| 327 | 2,269–2,871 | 134,206 characters |
| 6,445 | 32,506–32,910 | 142,961 characters |

Both exceed the default 131,072-character parser limit. Increasing that runtime limit resolves the apparent errors and fragmented rows without changing the source. Thus the earlier 45 wrong-width records and two non-binary label values were **parser-recovery artifacts**, not confirmed malformed source records. The two text fields are parsed as single multiline fields under the larger limit. No CSV repair was needed or attempted.

## 4. Index-column integrity

The first column has a blank header and is described by Zenodo as a serial number starting at zero. Under the successful higher-limit parse:

- Integer index values: **72,134**
- Minimum and maximum: **0–72,133**
- Unique values: **72,134**
- Duplicate index values: **0**
- Missing values within the expected range: **0**
- Non-integer indices: **0**

The index is contiguous and sequential. No index/label shift is present in the successful parse. Apparent non-integer indices and label fragments in the prior audit resulted from field-limit errors and parser recovery.

## 5. Authoritative source evidence

Accessed 2026-11-06:

- [Zenodo record](https://zenodo.org/records/4561253) and [record API](https://zenodo.org/api/records/4561253) — author-maintained deposit metadata reports 72,134 records, 35,028 Real, 37,106 Fake, and `0 = Fake`, `1 = Real`. Its class totals and mapping are internally inconsistent with the observed CSV distribution.
- [Zenodo files API](https://zenodo.org/api/records/4561253/files) — identifies `WELFake_Dataset.csv` and its deposited size.
- [Associated paper DOI](https://doi.org/10.1109/TCSS.2021.3068519) — DOI resolution returned bibliographic citation details; the full paper text was not retrieved in this check, so its label encoding could not be independently re-read.
- [A 2025 secondary study](https://www.mdpi.com/1999-5903/17/1/28) appeared in search results to associate label 0 with Real and label 1 with Fake, consistent with the observed counts but opposite Zenodo's stated mapping. The publisher page returned HTTP 403, so this snippet was not independently verified and is not treated as authoritative evidence.
- A web search also surfaced secondary publications repeating Zenodo's stated mapping alongside its class totals. These do not independently resolve the inconsistency. No independent author-maintained code or mapping source that resolves the contradiction was verified.

The official record's separate statement of **78,098 CSV entries** also remains unresolved: the supplied file parses to 72,134 logical data records with the higher field limit and sequential indices 0–72,133. No explanation is inferred.

## 6. Unresolved issues and recommendation

1. Keep the raw values unchanged. The mapping remains unresolved unless independently established by primary evidence; do not infer it from counts or style.
2. The 78,098-entry statement versus the 72,134 records in the deposited file also remains unexplained.
3. Keep the parser field limit sufficiently above the observed 142,961-character maximum when reading this original CSV; use streaming and strict parsing. This is a reader configuration, not a source-file modification.
4. Treat the prior audit's wrong-width, non-binary-label, and parse-error findings as superseded. Its text-quality and duplicate statistics were also computed with the default-limit recovery parse and should not be relied on without recomputation using the corrected parser configuration.

**Recommendation:** Do not reverse labels or proceed to model-oriented preprocessing until label semantics are confirmed by the authors or another primary source and mentor review approves the next step. A higher-limit strict parse establishes structural readability, not dataset quality, factual validity, or upstream rights.

## 7. File integrity

- Original: `data/raw/welfake/WELFake_Dataset.csv`
- Size: 245,086,152 bytes
- SHA-256 before investigation: `665331424230fc452e9482c3547a6a199a2c29745ade8d236950d1d105223773`
- SHA-256 after investigation: `665331424230fc452e9482c3547a6a199a2c29745ade8d236950d1d105223773`
- **Integrity result:** unchanged. The original was not modified, renamed, overwritten, normalized, or deleted.
