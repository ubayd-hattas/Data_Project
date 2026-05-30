"""
scripts/update_census.py — Census 2022 data

Census 2022 data is static. The next census is expected around 2032.
This script simply confirms the data is current and prints the source.
"""

from __future__ import annotations

import argparse

from utils import load_dataset


def run(dry_run: bool = False) -> None:
    existing = load_dataset("census")
    count    = len(existing.get("statistics", []))
    print(f"\n  ══ CENSUS 2022 — STATIC DATA ══")
    print(f"  {count} statistics. No update required.")
    print(f"  Source: Census 2022 (Stats SA, October 2023)")
    print(f"  Next census: ~2032")
    print(f"  ═══════════════════════════════")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    run(dry_run=args.dry_run)
