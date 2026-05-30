"""
scripts/update_housing.py — update SA housing statistics

SOURCES:
  1. Census 2022 — static until ~2032
  2. General Household Survey (GHS, P0318) — Stats SA, annual

WHY SEMI-MANUAL:
  The GHS is published annually and contains updated service delivery
  indicators (water, electricity, sanitation). No API exists. The PDF
  and Excel are published at:
  https://www.statssa.gov.za/?page_id=1854&PPN=P0318

HOW TO UPDATE (annually, after GHS publication — typically August):
  1. Go to: https://www.statssa.gov.za/?page_id=1854&PPN=P0318
  2. Download the latest GHS Excel tables.
  3. Find updated figures for:
     - % households with piped water in dwelling
     - % households with electricity for lighting
     - % households in formal dwellings
  4. Edit src/data/datasets/housing.json accordingly.

NEXT EXPECTED UPDATE: August 2025 (GHS 2024 results)
"""

from __future__ import annotations

import argparse

from utils import load_dataset


def run(dry_run: bool = False) -> None:
    print(f"\n  ══ HOUSING DATA — SEMI-MANUAL UPDATE ══")
    print(f"")
    print(f"  Census 2022 data: static until ~2032")
    print(f"  GHS annual data:  https://www.statssa.gov.za/?page_id=1854&PPN=P0318")
    print(f"  Next GHS release: ~August 2025")
    print(f"")
    print(f"  Update src/data/datasets/housing.json after each GHS release.")
    print(f"  ══════════════════════════════════════")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    run(dry_run=args.dry_run)
