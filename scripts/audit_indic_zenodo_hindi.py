"""Read-only audit of the extracted Hindi Indic Zenodo dataset.

Run from the repository root:
    python scripts/audit_indic_zenodo_hindi.py

Uses only the Python standard library. It never writes to the raw dataset.
"""

from __future__ import annotations

import hashlib
import argparse
import re
import statistics
from collections import Counter, defaultdict
from pathlib import Path


BASE = Path(__file__).resolve().parents[1] / "data" / "raw" / "indic_zenodo"
EXTRACTED_ROOT_NAME = "Hindi_F&R_News"
LABEL_DIRS = ("Hindi_fake_news", "Hindi_real_news")
EXCLUDED_DIR = "__MACOSX"
SAMPLE_COUNT = 3
DUPLICATE_EXAMPLES = 5
URL_RE = re.compile(r"https?://|www\.", re.IGNORECASE)
DATE_RE = re.compile(
    r"\b(?:\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}|"
    r"\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})\b",
    re.IGNORECASE,
)
SOURCE_CUE_RE = re.compile(
    r"\b(?:source|published|author|byline|reporter|correspondent|प्रकाशित|लेखक|स्रोत)\b",
    re.IGNORECASE,
)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def quantile(values: list[int], fraction: float) -> int | None:
    if not values:
        return None
    ordered = sorted(values)
    index = round((len(ordered) - 1) * fraction)
    return ordered[index]


def relative(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--list-duplicates",
        action="store_true",
        help="Print every duplicate group and member path (can produce a long report).",
    )
    args = parser.parse_args()

    if not BASE.is_dir():
        raise SystemExit(f"Dataset directory not found: {BASE}")

    if all((BASE / label).is_dir() for label in LABEL_DIRS):
        root = BASE
    elif all((BASE / EXTRACTED_ROOT_NAME / label).is_dir() for label in LABEL_DIRS):
        root = BASE / EXTRACTED_ROOT_NAME
    else:
        raise SystemExit(
            "Could not find both label folders directly under the audit directory "
            f"or under {EXTRACTED_ROOT_NAME}/: {BASE}"
        )

    global ROOT
    ROOT = root

    print(f"Dataset root: {ROOT}")
    excluded_root = ROOT / EXCLUDED_DIR
    excluded_files = sum(1 for item in excluded_root.rglob("*") if item.is_file()) if excluded_root.is_dir() else 0
    print(f"Excluded {EXCLUDED_DIR}/ metadata files: {excluded_files}")

    files_by_label: dict[str, list[Path]] = {}
    for label in LABEL_DIRS:
        folder = ROOT / label
        if not folder.is_dir():
            raise SystemExit(f"Required label folder not found: {folder}")
        files = sorted(
            (item for item in folder.rglob("*") if item.is_file()),
            key=lambda item: item.as_posix().casefold(),
        )
        files_by_label[label] = files
        print(f"\n[{label}] files: {len(files)}")

    all_hashes: dict[str, list[tuple[str, Path]]] = defaultdict(list)
    lengths_by_label: dict[str, list[int]] = defaultdict(list)
    extension_counts: dict[str, Counter[str]] = defaultdict(Counter)
    decode_errors: dict[str, list[str]] = defaultdict(list)
    empty_files: dict[str, list[str]] = defaultdict(list)
    whitespace_files: dict[str, list[str]] = defaultdict(list)
    total_bytes: dict[str, int] = defaultdict(int)
    sample_info: dict[str, list[dict[str, object]]] = defaultdict(list)

    for label, paths in files_by_label.items():
        for path in paths:
            rel = relative(path)
            extension_counts[label][path.suffix.lower() or "[no extension]"] += 1
            size = path.stat().st_size
            total_bytes[label] += size
            if size == 0:
                empty_files[label].append(rel)

            raw = path.read_bytes()
            all_hashes[hashlib.sha256(raw).hexdigest()].append((label, path))
            try:
                text = raw.decode("utf-8")
            except UnicodeDecodeError:
                decode_errors[label].append(rel)
                continue

            lengths_by_label[label].append(len(text))
            if text and not text.strip():
                whitespace_files[label].append(rel)

    # Inspect a deterministic representative sample from each label without
    # printing article text: first, midpoint and last path in sorted order.
    for label, paths in files_by_label.items():
        if not paths:
            continue
        indices = sorted({0, len(paths) // 2, len(paths) - 1})[:SAMPLE_COUNT]
        for index in indices:
            path = paths[index]
            try:
                text = path.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                sample_info[label].append({"path": relative(path), "utf8": False})
                continue
            lines = [line.strip() for line in text.splitlines() if line.strip()]
            sample_info[label].append(
                {
                    "path": relative(path),
                    "utf8": True,
                    "characters": len(text),
                    "nonempty_lines": len(lines),
                    "first_line_characters": len(lines[0]) if lines else 0,
                    "url_present": bool(URL_RE.search(text)),
                    "date_pattern_present": bool(DATE_RE.search(text)),
                    "source_or_byline_cue_present": bool(SOURCE_CUE_RE.search(text)),
                    "headline_candidate": bool(lines and len(lines[0]) <= 180),
                    "article_text_candidate": len(text.strip()) >= 500,
                }
            )

    within_groups: dict[str, list[list[str]]] = {}
    within_excess: dict[str, int] = {}
    for label in LABEL_DIRS:
        groups = [
            sorted(relative(path) for found_label, path in occurrences if found_label == label)
            for occurrences in all_hashes.values()
            if sum(found_label == label for found_label, _ in occurrences) > 1
        ]
        groups.sort(key=lambda group: group[0].casefold())
        within_groups[label] = groups
        within_excess[label] = sum(len(group) - 1 for group in groups)

    cross_groups: list[list[str]] = []
    for occurrences in all_hashes.values():
        labels = {label for label, _ in occurrences}
        if len(labels) > 1:
            cross_groups.append(sorted(f"{label}/{path.relative_to(ROOT / label).as_posix()}" for label, path in occurrences))
    cross_groups.sort(key=lambda group: group[0].casefold())
    cross_excess = sum(len(group) - len({item.split("/", 1)[0] for item in group}) for group in cross_groups)

    print("\nExtensions:")
    for label in LABEL_DIRS:
        print(f"  {label}: {dict(sorted(extension_counts[label].items()))}")

    print("\nFile/text checks:")
    for label in LABEL_DIRS:
        lengths = lengths_by_label[label]
        print(
            f"  {label}: bytes={total_bytes[label]}, zero_byte_files={len(empty_files[label])}, "
            f"whitespace_only_utf8={len(whitespace_files[label])}, "
            f"utf8_decode_errors={len(decode_errors[label])}, "
            f"valid_utf8_files={len(lengths)}"
        )
        if lengths:
            print(
                "    decoded text characters: "
                f"min={min(lengths)}, median={int(statistics.median(lengths))}, "
                f"p90={quantile(lengths, 0.90)}, p95={quantile(lengths, 0.95)}, max={max(lengths)}"
            )
        if empty_files[label]:
            print(f"    zero-byte paths: {empty_files[label]}")
        if whitespace_files[label]:
            print(f"    whitespace-only paths: {whitespace_files[label]}")
        if decode_errors[label]:
            print(f"    UTF-8 error paths: {decode_errors[label]}")

    print("\nExact duplicate groups (SHA-256 of raw file bytes):")
    for label in LABEL_DIRS:
        groups = within_groups[label]
        print(f"  Within {label}: groups={len(groups)}, excess_files={within_excess[label]}")
        shown = groups if args.list_duplicates else groups[:DUPLICATE_EXAMPLES]
        for group in shown:
            print(f"    - {group}")
        if not args.list_duplicates and len(groups) > len(shown):
            print(f"    ... {len(groups) - len(shown)} additional groups (rerun with --list-duplicates)")
    print(f"  Across labels: groups={len(cross_groups)}, excess_files={cross_excess}")
    shown_cross = cross_groups if args.list_duplicates else cross_groups[:DUPLICATE_EXAMPLES]
    for group in shown_cross:
        print(f"    - {group}")
    if not args.list_duplicates and len(cross_groups) > len(shown_cross):
        print(f"    ... {len(cross_groups) - len(shown_cross)} additional groups (rerun with --list-duplicates)")

    print("\nRepresentative sample indicators (no article text printed):")
    for label in LABEL_DIRS:
        print(f"  {label}:")
        for info in sample_info[label]:
            print(f"    - {info}")

    print("\nDuplicate definitions: within-label excess = sum(group size - 1); "
          "cross-label excess = sum(group size - number of represented labels).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
