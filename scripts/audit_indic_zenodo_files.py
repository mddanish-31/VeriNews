"""Read-only audit of Indic Zenodo Hindi Fake/Real article files.

Run from the repository root:
    python scripts/audit_indic_zenodo_files.py

Uses only the Python standard library plus tqdm for progress bars.
It never writes to the raw dataset.
"""

from __future__ import annotations

import hashlib
from collections import Counter
from pathlib import Path

try:
    from tqdm import tqdm
except ImportError:
    tqdm = None

BASE = Path(__file__).resolve().parents[1] / "data" / "raw" / "indic_zenodo" / "Hindi_F&R_News"
LABEL_DIRS = ("Hindi_fake_news", "Hindi_real_news")
EXCLUDED_DIR_NAME = "__MACOSX"


def sha256_file(path: Path) -> str:
    """Compute SHA-256 hash of a file using 1 MB chunks."""
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def is_article_file(path: Path) -> bool:
    """Return True if path is a .txt file and not an AppleDouble metadata file."""
    return path.suffix.lower() == ".txt" and not path.name.startswith("._")


def audit_folder(folder: Path) -> dict:
    """Audit a single label folder and return statistics."""
    files = sorted((f for f in folder.rglob("*") if f.is_file()), key=lambda p: p.as_posix().casefold())

    txt_files = []
    for f in files:
        if is_article_file(f):
            txt_files.append(f)

    total_txt = len(txt_files)
    empty_files = []
    unreadable_files = []
    hash_to_paths: dict[str, list[Path]] = {}

    for path in tqdm(txt_files, desc=f"Auditing {folder.name}", unit="file"):
        try:
            raw = path.read_bytes()
        except Exception:
            unreadable_files.append(path.relative_to(folder).as_posix())
            continue

        if len(raw) == 0:
            empty_files.append(path.relative_to(folder).as_posix())

        digest = hashlib.sha256(raw).hexdigest()
        hash_to_paths.setdefault(digest, []).append(path)

    unique_hashes = len(hash_to_paths)
    duplicate_excess = sum(len(paths) - 1 for paths in hash_to_paths.values())

    return {
        "total_txt": total_txt,
        "unique_hashes": unique_hashes,
        "duplicate_excess": duplicate_excess,
        "empty_files": empty_files,
        "unreadable_files": unreadable_files,
        "hash_to_paths": hash_to_paths,
    }


def main() -> int:
    results: dict[str, dict] = {}
    all_hash_to_paths: dict[str, list[Path]] = {}

    for label in LABEL_DIRS:
        folder = BASE / label
        if not folder.is_dir():
            raise SystemExit(f"Required label folder not found: {folder}")
        results[label] = audit_folder(folder)
        for digest, paths in results[label]["hash_to_paths"].items():
            all_hash_to_paths.setdefault(digest, []).extend(paths)

    # Cross-folder analysis
    cross_label_hashes = {
        digest: paths
        for digest, paths in all_hash_to_paths.items()
        if len({p.parent.parent.name for p in paths}) > 1
    }

    total_txt_all = sum(results[label]["total_txt"] for label in LABEL_DIRS)
    unique_hashes_all = len(all_hash_to_paths)

    print("=== WELFake Indic Zenodo Hindi File Audit ===")
    print(f"Base directory: {BASE}")
    print()

    for label in LABEL_DIRS:
        r = results[label]
        print(f"\n[{label}]")
        print(f"  Total TXT files: {r['total_txt']}")
        print(f"  Unique content hashes: {r['unique_hashes']}")
        print(f"  Exact duplicate files beyond first copy: {r['duplicate_excess']}")
        print(f"  Empty files: {len(r['empty_files'])}")
        if r["empty_files"]:
            for p in r["empty_files"]:
                print(f"      - {p}")
        print(f"  Unreadable files: {len(r['unreadable_files'])}")
        if r["unreadable_files"]:
            for p in r["unreadable_files"]:
                print(f"      - {p}")

    print("\n=== Cross-Folder Analysis ===")
    print(f"  Total TXT files across both folders: {total_txt_all}")
    print(f"  Total unique content hashes across both folders: {unique_hashes_all}")
    print(f"  Identical content hashes shared between Fake and Real: {len(cross_label_hashes)}")
    if cross_label_hashes:
        shared_files = sum(len(paths) for paths in cross_label_hashes.values())
        shared_groups = len(cross_label_hashes)
        print(f"  Shared hash groups: {shared_groups}")
        print(f"  Total files involved in shared hashes: {shared_files}")
        for digest, paths in sorted(cross_label_hashes.items()):
            labels = {p.parent.parent.name for p in paths}
            print(f"    {digest[:12]}... -> {sorted(labels)}")

    print("\nDuplicate definitions:")
    print("  Within-folder excess = sum(group size - 1)")
    print("  Cross-folder shared = number of hash values appearing in both folders")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())