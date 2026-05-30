"""
scripts/update_education.py — update SA education statistics

SOURCES:
  1. Matric pass rate — Department of Basic Education (DBE)
     URL: https://www.education.gov.za/Informationfor/Examinationsresults.aspx
     Frequency: Annual — published in January (for previous year's results)

  2. Literacy rate — Census 2022 (Stats SA)
     Static until next census (~2032)

  3. Higher education enrolment — DHET annual statistics
     URL: https://www.dhet.gov.za/Management%20Information%20Systems/
     Frequency: Annual — typically published October/November

WHY PARTIALLY MANUAL:
  DBE does not offer a data API. Results are announced at a press conference
  and published as PDFs/press releases. The matric pass rate is a single
  widely-reported number — easiest to update manually from news coverage or
  the DBE website each January.

HOW TO UPDATE MATRIC RESULTS (annually, ~5 minutes):
  1. In January each year, DBE announces results. Check:
     - https://www.education.gov.za
     - Or simply search: "matric pass rate 2024 South Africa"
  2. Update src/data/datasets/education.json:
     - Find statistic id: 'matric-pass-rate'
     - Update 'value', 'rawValue', 'change', 'changeLabel', 'trend'
     - Add new data point to series.data: { "label": "2024", "value": XX.X }
     - Update 'lastUpdated' and 'source.publicationDate'

NEXT EXPECTED UPDATE: January 2026 (for 2025 matric results)
"""

from __future__ import annotations

import argparse

from utils import load_dataset, today_iso


def run(dry_run: bool = False) -> None:
    existing = load_dataset("education")
    stats    = existing.get("statistics", [])

    matric = next((s for s in stats if s["id"] == "matric-pass-rate"), None)
    last   = matric["lastUpdated"] if matric else "unknown"

    print(f"\n  ══ EDUCATION DATA — MANUAL UPDATE REQUIRED ══")
    print(f"")
    print(f"  Matric pass rate last updated: {last}")
    print(f"  Next matric results:           January 2026")
    print(f"  DBE website:                   https://www.education.gov.za")
    print(f"")
    print(f"  To update matric results each January:")
    print(f"  1. Get the pass rate from DBE press release or news.")
    print(f"  2. Edit src/data/datasets/education.json")
    print(f"  3. Update 'matric-pass-rate' statistic fields.")
    print(f"  4. Add a new entry to series.data.")
    print(f"")
    print(f"  Literacy rate is static — next update at Census 2032.")
    print(f"  ══════════════════════════════════════════════")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    run(dry_run=args.dry_run)
