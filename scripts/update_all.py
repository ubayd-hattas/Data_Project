#!/usr/bin/env python3
"""
update_all.py — SA Data Hub master update script

Usage:
    python update_all.py              # update everything
    python update_all.py --only cpi  # update only inflation
    python update_all.py --dry-run   # check sources, don't write files

What this does:
    1. Fetches/validates fresh data from each official source.
    2. For automated sources: writes updated JSON directly.
    3. For manual sources: prints what changed and what to copy.
    4. Produces a summary report of what was updated.

Requirements:
    pip install requests beautifulsoup4 lxml python-dateutil

Run from your project root (the folder containing package.json):
    python scripts/update_all.py
"""

import argparse
import importlib
import sys
import time
from datetime import datetime
from pathlib import Path


# ─── Updater registry ────────────────────────────────────────────────────────
# Each entry: (module_name, dataset_id, automation_level)
# automation_level: "auto" = fully automated, "manual" = prints instructions

UPDATERS = [
    ("update_inflation",    "inflation",    "auto"),
    ("update_unemployment", "unemployment", "auto"),
    ("update_gdp",          "gdp",          "auto"),
    ("update_population",   "population",   "auto"),
    ("update_crime",        "crime",        "manual"),    # SAPS has no API
    ("update_education",    "education",    "manual"),    # DBE releases annually
    ("update_housing",      "housing",      "manual"),    # Census / GHS
    ("update_census",       "census",       "manual"),    # Static until 2032
]


def run_updater(module_name: str, dry_run: bool) -> dict:
    """Import and run a single updater module, return a result dict."""
    scripts_dir = Path(__file__).parent
    sys.path.insert(0, str(scripts_dir))

    result = {
        "module": module_name,
        "status": "unknown",
        "message": "",
        "updated_at": datetime.now().isoformat(),
    }

    try:
        mod = importlib.import_module(module_name)
        if hasattr(mod, "run"):
            mod.run(dry_run=dry_run)
            result["status"] = "ok"
            result["message"] = "Completed successfully"
        else:
            result["status"] = "skip"
            result["message"] = "No run() function found"
    except Exception as e:
        result["status"] = "error"
        result["message"] = str(e)

    return result


def print_summary(results: list[dict]) -> None:
    print("\n" + "═" * 60)
    print("  SA Data Hub — Update Summary")
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("═" * 60)
    for r in results:
        icon = {"ok": "✓", "error": "✗", "skip": "–", "unknown": "?"}.get(r["status"], "?")
        print(f"  {icon}  {r['module']:<25}  {r['message']}")
    print("═" * 60)
    errors = [r for r in results if r["status"] == "error"]
    if errors:
        print(f"\n  ⚠  {len(errors)} updater(s) failed. Check output above.")
    else:
        print("\n  All updaters completed.")
    print()


def main():
    parser = argparse.ArgumentParser(description="SA Data Hub — update all datasets")
    parser.add_argument("--only", metavar="DATASET", help="Run only this updater (e.g. inflation)")
    parser.add_argument("--dry-run", action="store_true", help="Fetch data but don't write files")
    args = parser.parse_args()

    targets = UPDATERS
    if args.only:
        targets = [(m, d, a) for m, d, a in UPDATERS if d == args.only]
        if not targets:
            print(f"No updater found for '{args.only}'. Available: {[d for _,d,_ in UPDATERS]}")
            sys.exit(1)

    if args.dry_run:
        print("\n[DRY RUN] — data will be fetched but files will not be written.\n")

    results = []
    for module_name, dataset_id, automation in targets:
        print(f"\n{'─'*60}")
        print(f"  Updating: {dataset_id} [{automation}]")
        print(f"{'─'*60}")
        result = run_updater(module_name, dry_run=args.dry_run)
        results.append(result)
        time.sleep(1)   # polite delay between requests

    print_summary(results)


if __name__ == "__main__":
    main()
