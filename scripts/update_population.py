"""
scripts/update_population.py — fetch latest SA population data

PRIMARY SOURCE: World Bank Open Data API
  - SP.POP.TOTL      = Population, total
  - SP.URB.TOTL.IN.ZS = Urban population (% of total)
  - SP.POP.GROW      = Population growth (annual %)
  No API key required.

HOW TO RUN:
    python scripts/update_population.py
    python scripts/update_population.py --dry-run
"""

from __future__ import annotations

import argparse

from utils import fetch, load_dataset, save_dataset, report_changes, today_iso


WB_BASE = "https://api.worldbank.org/v2/country/ZA/indicator"
WB_POP_URL    = f"{WB_BASE}/SP.POP.TOTL?format=json&per_page=15&mrv=15"
WB_URBAN_URL  = f"{WB_BASE}/SP.URB.TOTL.IN.ZS?format=json&per_page=15&mrv=15"


def _parse_wb(url: str, n: int = 10) -> list[dict]:
    resp   = fetch(url)
    raw    = resp.json()
    points = [
        {"label": str(e["date"]), "value": e["value"]}
        for e in raw[1]
        if e.get("value") is not None
    ]
    points.sort(key=lambda p: p["label"])
    return points[-n:]


def run(dry_run: bool = False) -> None:
    existing  = load_dataset("population")
    old_stats = existing.get("statistics", [])

    print("  Fetching population total from World Bank…")
    pop_raw = _parse_wb(WB_POP_URL, n=10)
    pop_series = [{"label": p["label"], "value": round(p["value"] / 1e6, 1)} for p in pop_raw]

    print("  Fetching urban population share from World Bank…")
    urban_series = [
        {"label": p["label"], "value": round(p["value"], 1)}
        for p in _parse_wb(WB_URBAN_URL, n=10)
    ]

    new_stats = []
    for stat in old_stats:
        s = dict(stat)

        if s["id"] == "population-total" and pop_series:
            latest = pop_series[-1]
            prev   = pop_series[-2] if len(pop_series) > 1 else None
            pct    = round((latest["value"] - prev["value"]) / prev["value"] * 100, 1) if prev else 0.0
            raw_people = round(latest["value"] * 1e6)
            s["rawValue"]    = raw_people
            s["value"]       = f"{latest['value']}M"
            s["change"]      = pct
            s["changeLabel"] = f"from {prev['label']}" if prev else s["changeLabel"]
            s["trend"]       = "up" if pct > 0 else "stable"
            s["series"]      = [{"name": "Population (millions)", "unit": "million", "data": pop_series}]

        elif s["id"] == "population-urban" and urban_series:
            latest = urban_series[-1]
            prev   = urban_series[-2] if len(urban_series) > 1 else None
            change = round(latest["value"] - prev["value"], 1) if prev else 0.0
            s["rawValue"]    = latest["value"]
            s["value"]       = f"{latest['value']}%"
            s["change"]      = change
            s["changeLabel"] = f"from {prev['label']}" if prev else s["changeLabel"]
            s["trend"]       = "up" if change > 0 else ("down" if change < 0 else "stable")

        new_stats.append(s)

    print("  Changes:")
    report_changes(old_stats, new_stats)

    updated = {
        **existing,
        "statistics": new_stats,
        "_meta": {
            **existing.get("_meta", {}),
            "last_verified": today_iso(),
            "auto_updated":  today_iso(),
        },
    }
    save_dataset("population", updated, dry_run=dry_run)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    run(dry_run=args.dry_run)
