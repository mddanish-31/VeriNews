"""Read-only language audit of the WELFake dataset.

Run from the repository root:
    py scripts/audit_welfake_language.py

Reads only the existing WELFake CSV file. Samples 2,000 records with a fixed
random seed. Never modifies the original dataset.
"""

from __future__ import annotations

from collections import Counter
from pathlib import Path

try:
    import pandas as pd
except ImportError as exc:
    raise SystemExit("pandas is not installed. Install it to run this script.") from exc

try:
    from langdetect import detect
    from langdetect import DetectorFactory
except ImportError as exc:
    raise SystemExit("langdetect is not installed. Install it to run this script.") from exc

try:
    from tqdm import tqdm
except ImportError as exc:
    raise SystemExit("tqdm is not installed. Install it to run this script.") from exc

DetectorFactory.seed = 42

BASE = Path(__file__).resolve().parents[1] / "data" / "raw" / "welfake" / "WELFake_Dataset.csv"
SAMPLE_SIZE = 2000
RANDOM_SEED = 42
SHORT_TEXT_THRESHOLD = 30


def main() -> int:
    if not BASE.is_file():
        raise SystemExit(f"Dataset file not found: {BASE}")

    df = pd.read_csv(BASE)

    if "title" not in df.columns or "text" not in df.columns:
        raise SystemExit("CSV must contain 'title' and 'text' columns.")

    df["title"] = df["title"].fillna("")
    df["text"] = df["text"].fillna("")

    combined = (df["title"].astype(str) + " " + df["text"].astype(str)).str.strip()

    # Reproducible random sample of 2,000 records
    sampled = combined.sample(n=SAMPLE_SIZE, random_state=RANDOM_SEED).reset_index(drop=True)

    skipped_short = 0
    errors = 0
    counts: Counter[str] = Counter()

    for text in tqdm(sampled, desc="Detecting language", unit="record"):
        if len(text) < SHORT_TEXT_THRESHOLD:
            skipped_short += 1
            continue
        try:
            lang = detect(text)
            counts[lang] += 1
        except Exception:
            errors += 1

    analyzed = SAMPLE_SIZE - skipped_short - errors

    print(f"Sample size: {SAMPLE_SIZE}")
    print(f"Skipped short records (< {SHORT_TEXT_THRESHOLD} chars): {skipped_short}")
    print(f"Detection errors: {errors}")
    print(f"Analyzed records: {analyzed}")
    print("\nLanguage counts:")
    for lang, count in counts.most_common():
        pct = (count / analyzed * 100) if analyzed else 0.0
        print(f"  {lang}: {count} ({pct:.1f}%)")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())