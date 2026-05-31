# SA Data Hub — Version 2 Implementation Notes

## Overview

This document records implementation decisions, data source choices, and maintenance guidance for SA Data Hub Version 2 and 2.1.

---

## What Was Built

### v2 (Previous Session)
- Updated GDP dataset (`gdp.json`) — quarterly Stats SA data
- Updated Inflation dataset (`inflation.json`) — monthly CPI from Stats SA P0141
- Updated Unemployment dataset (`unemployment.json`) — quarterly QLFS from Stats SA P0211
- Provinces dataset (`provinces.json`) — all 9 provinces with labour, education, and housing stats
- Updated TypeScript types (`src/types/index.ts`) — ProvinceData, Insight, InsightSentiment types
- Data insight engine (`src/lib/insights.ts`) — computes insights from series data
- Fuzzy search engine (`src/lib/search.ts`) — typo-tolerant search with SA-specific synonyms
- Updated mock.ts — province helpers, search integration
- InsightPanel component — contextual insight display
- ProvinceCard component — province summary card
- Updated category page — integrates insights and province data

### v2.1 (This Session)
| Component | File | Description |
|-----------|------|-------------|
| Province Explorer | `src/app/provinces/page.tsx` | Full province list, sortable grid, comparison table, bar chart |
| Province Detail | `src/app/provinces/[id]/page.tsx` | Individual province stats, national ranking bar, prev/next navigation |
| Methodology Page | `src/app/methodology/page.tsx` | Data sources, update frequencies, definitions, limitations, transparency notes |
| Navigation | `src/components/layout/Navbar.tsx` | Added Provinces and Methodology links |
| Youth Unemployment | `src/data/datasets/youth-unemployment.json` | 15–34, 15–24, expanded, NEET rate |
| Interest Rates | `src/data/datasets/interest-rates.json` | Repo rate and prime lending rate from SARB |
| Labour Force | `src/data/datasets/labour-force.json` | LFPR overall and female LFPR |
| Interest Rates Script | `scripts/update_interest_rates.py` | Semi-automated SARB rate updater |
| Mock.ts v2.1 | `src/data/mock.ts` | Imports 3 new datasets, getProvinceData() exported |

---

## Data Source Reference

### Statistics South Africa (Stats SA)
**Website:** https://www.statssa.gov.za  
**Datasets used:** Unemployment (P0211), CPI/Inflation (P0141), GDP (P0441), Census 2022, Population estimates, General Household Survey

**Release schedule:**
- CPI: Monthly, published ~25 days after the reference month
- QLFS (unemployment): Quarterly, published ~6 weeks after the reference quarter
- GDP: Quarterly, published ~60 days after the reference quarter
- GHS (housing): Annual, published ~12 months after reference year

**API notes:** Stats SA does not offer a structured API. Automation scripts download Excel/CSV from their statistical release pages. The page structure is relatively stable but should be verified after each major site update.

### South African Reserve Bank (SARB)
**Website:** https://www.resbank.co.za  
**Datasets used:** Repo rate, Prime lending rate

**Release schedule:** MPC meetings approximately every 2 months. Rate announcements are made at 3pm on the final day of the meeting. The rate is effective immediately.

**Update process:** The `update_interest_rates.py` script uses a manual constant (`LATEST_REPO_RATE`) that must be updated after each MPC meeting. A scraping approach was evaluated but SARB's decision page uses JavaScript rendering that makes automated scraping fragile. The manual constant approach is more reliable.

**2026 MPC meeting dates (approximate):** January, March, May, July, September, November.

### Department of Basic Education (DBE)
**Website:** https://www.education.gov.za  
**Datasets used:** Matric pass rates (NSC results)

**Release schedule:** Annual in January for the previous year's results. Provincial breakdown is published in the full NSC Diagnostic Report, usually released 2–3 weeks after the headline results.

### South African Police Service (SAPS)
**Website:** https://www.saps.gov.za/services/crimestats.php  
**Datasets used:** Crime statistics by category

**Release schedule:** Annual in September, covering the April–March financial year. Station-level data is available separately.

### World Bank Open Data
**Website:** https://data.worldbank.org/country/ZA  
**API:** https://api.worldbank.org/v2/country/ZA/indicator/{indicator}?format=json  
**Datasets used:** Long-run GDP growth (NY.GDP.MKTP.KD.ZG), GDP per capita

**No API key required.** World Bank data lags Stats SA by 1–2 years but provides consistent long-run methodology.

---

## New Datasets — v2.1

### Youth Unemployment (`youth-unemployment.json`)
**Category:** unemployment  
**Statistics:**
- `youth-unemployment-narrow` — 15–34 year olds, narrow definition
- `youth-unemployment-1524` — 15–24 year olds (most severe cohort)
- `youth-unemployment-expanded` — 15–34, includes discouraged work-seekers
- `youth-neet-rate` — Not in Employment, Education, or Training

**Source:** Stats SA QLFS Q4 2025 (P0211)  
**Update:** Quarterly, bundled with `update_unemployment.py` (extend to include youth tables)

**Why this dataset:** SA has one of the world's highest youth unemployment rates. The 15–24 rate (~61%) frequently receives international attention. The NEET rate captures a broader social risk dimension. These figures are widely cited by the National Treasury, ILO, and in SA's political discourse.

### Interest Rates (`interest-rates.json`)
**Category:** gdp  
**Statistics:**
- `repo-rate` — SARB benchmark rate
- `prime-lending-rate` — Repo + 3.5pp

**Source:** South African Reserve Bank  
**Update:** After each MPC meeting (~bi-monthly) via `update_interest_rates.py`

**Why this dataset:** The repo rate directly affects mortgage costs, business investment, and the rand. It is among the most-followed economic statistics in South Africa and provides essential context for GDP and inflation data.

**Maintenance:** Update `LATEST_REPO_RATE` in `scripts/update_interest_rates.py` after each MPC meeting. The SARB website (https://www.resbank.co.za/en/home/what-we-do/monetary-policy/decisions) publishes the full statement on decision day.

### Labour Force Participation (`labour-force.json`)
**Category:** unemployment  
**Statistics:**
- `labour-force-participation` — Overall LFPR (15–64)
- `female-labour-participation` — Female LFPR

**Source:** Stats SA QLFS Q4 2025 (P0211)  
**Update:** Quarterly

**Why this dataset:** The LFPR explains *why* the unemployment rate can appear to improve even when fewer people are working — discouraged workers exit the labour force, lowering both the numerator (unemployed) and denominator (labour force). Understanding LFPR is essential context for unemployment figures.

---

## Province Explorer Architecture

The Province Explorer consists of two routes:

```
/provinces          → src/app/provinces/page.tsx       (index: grid, chart, comparison)
/provinces/[id]     → src/app/provinces/[id]/page.tsx  (detail: stats, ranking bar, nav)
```

Both routes are **server components** (no 'use client') *except* for the index page which needs React state for the sort selector, tab switcher, and comparison dropdowns.

**Data flow:** Both pages call `getProvinceData()` and `getProvinceById()` from `src/data/mock.ts`, which reads from `src/data/datasets/provinces.json`. No API calls at runtime — everything is static JSON.

**Static params:** `generateStaticParams()` is implemented in both pages for Next.js static generation. All 9 province pages are pre-rendered at build time.

---

## Navigation Structure

```
Home    Dashboard    Provinces    Categories▾    Methodology
                                   Unemployment
                                   GDP & Economy
                                   Inflation
                                   Crime
                                   Education
                                   Population
                                   Housing
                                   Census 2022
```

---

## Recommended Future Datasets

These were evaluated but not implemented due to data reliability or complexity constraints:

| Dataset | Source | Feasibility | Blocker |
|---------|--------|-------------|---------|
| Poverty Headcount Ratio | Stats SA / World Bank | Medium | Annual, 2-year lag |
| Gini Coefficient | Stats SA (Income & Expenditure Survey) | Medium | Every 5–7 years |
| Government Debt (% GDP) | National Treasury / SARB | High | SARB API available |
| Internet/Broadband Access | Stats SA GHS | Medium | Annual, 1-year lag |
| Rand/USD Exchange Rate | SARB | High | Daily data available |
| Load-shedding Hours | Eskom / Electricity regulator | Medium | No stable API |

**Recommended next addition:** Government debt (% of GDP) from National Treasury. The data is available in the MTBPS and Budget Review, is politically salient, and would complement the interest rate and GDP datasets already present.

---

## Automation Scripts

| Script | Mode | Data Source | Trigger |
|--------|------|-------------|---------|
| update_inflation.py | Auto | Stats SA P0141 | Monthly, ~26th |
| update_unemployment.py | Auto | Stats SA P0211 | Quarterly |
| update_gdp.py | Auto | World Bank API | Quarterly |
| update_interest_rates.py | Semi-auto | SARB MPC | After each MPC meeting |
| update_population.py | Auto | World Bank API | Annual |
| update_crime.py | Manual | SAPS PDF | Annual (September) |
| update_education.py | Manual | DBE PDF | Annual (January) |
| update_housing.py | Manual | Stats SA GHS | Annual |
| update_census.py | Manual | Stats SA | 2032 |

**To run all auto scripts:**
```bash
python scripts/update_all.py
```

**To run a single script:**
```bash
python scripts/update_all.py --only inflation
```

**Dry run (no file writes):**
```bash
python scripts/update_all.py --dry-run
```

---

## Deployment Notes

The project is a Next.js 14 app with static data files. No backend is required. Recommended deployment targets:

- **Vercel** — zero-config Next.js deployment, already integrated (Vercel Analytics present in layout.tsx)
- **Netlify** — alternative with similar Next.js support

Data updates can be shipped as git commits — each script writes updated JSON files that are committed and deployed. A GitHub Actions workflow could automate this for the quarterly and monthly updates.

---

*Generated: 2026-05-31 | SA Data Hub v2.1*
