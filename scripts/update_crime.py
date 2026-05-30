"""
scripts/update_crime.py — update SA crime statistics

SOURCE: South African Police Service (SAPS)
  URL:   https://www.saps.gov.za/services/crimestats.php
  FREQUENCY: Annual — published each September for the Apr–Mar financial year

WHY THIS IS MANUAL:
  SAPS does not provide an API. Crime statistics are published as Excel
  workbooks and PDFs on their website once per year. There is no machine-
  readable feed. Automated scraping is fragile and unreliable for this source.

HOW TO UPDATE (takes ~10 minutes per year):
  1. Go to: https://www.saps.gov.za/services/crimestats.php
  2. Download the latest Excel workbook (usually published in September)
  3. Open the Excel file and find the national totals for:
     - Murder (category: Contact crimes)
     - Contact crimes total
     - Robbery with aggravating circumstances
  4. Update src/data/datasets/crime.json:
     - Change 'value', 'rawValue', 'change', 'changeLabel', 'trend'
     - Add the new year's data point to each 'series.data' array
     - Update 'lastUpdated' and 'source.publicationDate'
  5. Commit and deploy.

NEXT EXPECTED UPDATE: September 2025 (for 2024/25 financial year)
"""

from __future__ import annotations

import argparse
from datetime import datetime

from utils import load_dataset, today_iso


def run(dry_run: bool = False) -> None:
    existing = load_dataset("crime")
    stats    = existing.get("statistics", [])
    latest   = max((s.get("lastUpdated", "2000-01-01") for s in stats), default="2000-01-01")

    print(f"\n  ══ CRIME DATA — MANUAL UPDATE REQUIRED ══")
    print(f"")
    print(f"  Last updated:    {latest}")
    print(f"  Next release:    September 2025 (SAPS 2024/25 report)")
    print(f"  Source:          https://www.saps.gov.za/services/crimestats.php")
    print(f"")
    print(f"  To update:")
    print(f"  1. Download the Excel workbook from the SAPS page above.")
    print(f"  2. Look for sheet: 'Total Crime per station' or 'National' tab.")
    print(f"  3. Extract: Murder, Contact crimes total, Aggravated robbery.")
    print(f"  4. Edit:    src/data/datasets/crime.json")
    print(f"  5. Run:     git commit -m 'chore: update crime stats 2024/25'")
    print(f"")
    print(f"  Skipping automated update for crime. No changes written.")
    print(f"  ══════════════════════════════════════════")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    run(dry_run=args.dry_run)
