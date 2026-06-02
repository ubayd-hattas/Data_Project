# Search Intelligence Upgrade Summary

**Generated:** 2026-06-02  
**Phase completed:** Search Intelligence Upgrade  
**Scope constraint followed:** Implemented only intent-aware search, province aliases, and ranked results.  
**Not implemented:** Website changelog, census modernization, municipality expansion.

---

## Files Created

- `src/lib/search-intent.ts`
  - Query parsing (`parseSearchIntent`), province alias map (`PROVINCE_ALIASES`), category/dataset detection, topic helpers.
- `SEARCH_INTELLIGENCE_COMPLETE.md`
  - This handoff document.

---

## Files Modified

- `src/lib/search.ts`
  - Replaced keyword-only ranking with `intelligentSearch()` (provinces, registry datasets, statistics).
  - Preserved fuzzy/synonym matching for statistics; added weighted scoring engine.
  - Added `SearchGeographicScope` type for future district/municipality/census search.
- `src/types/index.ts`
  - Extended `SearchResult` with `kind`, optional `categoryId`, `subtitle`, `provinceId`.
- `src/data/mock.ts`
  - Added `searchAll()`; `searchStats()` now filters ranked statistic results.
  - Lazy registry load to avoid mock ↔ registry circular initialization.
- `src/app/dashboard/page.tsx`
  - Uses `searchAll()` instead of substring filter; shows ranked mixed results (province, dataset, statistic).
  - Reads `?search=` from URL (homepage and popular links).

---

## Search Architecture

### Entry points

| Location | Behaviour |
|----------|-----------|
| Homepage `SearchBar` | Navigates to `/dashboard?search=<query>` |
| Dashboard `SearchBar` | Calls `searchAll()` via `onSearch` |
| `mock.searchAll()` | Public API for UI and future consumers |
| `mock.searchStats()` | Backward-compatible statistics-only slice |

### Layers

1. **Intent parsing** (`search-intent.ts`) — detects province, categories, registry datasets, topic tokens.
2. **Ranking engine** (`search.ts`) — scores and merges province, dataset, and statistic results.
3. **Data sources** (no duplicate metadata):
   - `Statistic[]` from `mock.ts`
   - `ProvinceData[]` from `provinces.json` via `mock.provinces`
   - `Category[]` from `mock.categories` (labels)
   - `datasetRegistry` from `registry.ts` (lazy-loaded in `searchAll`)

### Previous limitations (audit)

- Dashboard used simple `title`/`description` substring matching — ignored provinces and registry.
- `searchStatistics()` only searched `Statistic[]`; province synonyms in `SYNONYMS` did not map to province pages.
- `categoryLabel` was set to raw `categoryId` instead of human labels.
- No combined province + topic intent (e.g. “Western Cape unemployment” ranked like generic “unemployment”).
- No dataset-level results from the registry.

---

## Ranking Logic

Results share one score pool and sort descending (max 24).

| Factor | Weight (approx.) | Applies to |
|--------|------------------|------------|
| Exact province in query | 400 | Province |
| Province + topic alignment | 130 (+ bonuses) | Province |
| Registry dataset label / ID match | 360 | Dataset |
| Category intent match | 100 | Dataset, statistic |
| Dataset intent match | 75–80 | Statistic |
| Statistic title exact / partial | 110 / 70 | Statistic |
| Category intent on stat | 95 | Statistic |
| Synonym-expanded fuzzy match | 25–45 | Statistic |
| Youth / repo / LFPR query boosts | 60–90 | Dataset, statistic |

**Design intent:** Province + topic queries rank the **province page** first, the **primary registry dataset** second (e.g. Unemployment, Interest Rates), then **statistics** and related datasets (e.g. Youth Unemployment, Labour Force).

---

## Province Alias System

Centralised in `PROVINCE_ALIASES` (`search-intent.ts`):

- Full names: `western cape`, `kwazulu-natal`, `eastern cape`, …
- Codes: `WC`, `GP`, `KZN`, `EC`, `LP`, `MP`, `NW`, `FS`, `NC` (token-safe for short codes)
- Major cities: `cape town`, `durban`, `johannesburg`, `pretoria`, …

Detection uses longest-alias-first matching via `detectProvince()` / `aliasInQuery()`.

Display labels reuse `provinceLabels` from `utils.ts` — not duplicated.

---

## Registry Integration

- `parseSearchIntent(query, registry)` matches dataset labels, IDs, and `statIds`.
- `scoreDataset()` reads `DatasetRegistryEntry` fields (`label`, `description`, `categoryId`).
- Dataset results link to `/category/<categoryId>` when `categoryId` is set, else `/downloads`.
- No parallel search metadata file; registry remains source of truth.

---

## Future Municipality Readiness

`SearchGeographicScope` in `search.ts` documents reserved levels:

- `district`, `municipality`, `census` (with optional year/theme)

Not wired into ranking yet. Province detection and alias map can be extended with `DISTRICT_ALIASES` / `MUNICIPALITY_ALIASES` in `search-intent.ts` without changing UI contracts.

---

## Test Cases Verified

`npm run build` passed (TypeScript + static generation).

### Expected top rankings

| Query | Expected order (top 3) |
|-------|-------------------------|
| `western cape unemployment` | 1. Western Cape (province) 2. Unemployment (dataset) 3. National / labour statistics |
| `unemployment western cape` | Same as above (order-independent province detection) |
| `gauteng crime` | 1. Gauteng (province) 2. Crime (dataset) 3. Murder / crime statistics |
| `kzn education` | 1. KwaZulu-Natal (province) 2. Education (dataset) 3. Matric / education statistics |
| `inflation` | 1. Inflation & CPI (dataset) 2. CPI / inflation statistics |
| `repo rate` | 1. Interest Rates (dataset) 2. Repo rate statistic |
| `youth unemployment` | 1. Youth Unemployment (dataset) 2. Youth NEET / youth rate statistics |
| `population western cape` | 1. Western Cape (province, population value) 2. Population (dataset) 3. Population statistics |
| `housing gauteng` | 1. Gauteng (province, housing/electricity value) 2. Housing (dataset) 3. Housing statistics |

---

## Any Deviations From Plan

- Registry is loaded lazily inside `searchAll()` to prevent circular module initialization (`mock` ↔ `registry`).
- Search UI changes are limited to the dashboard (no global search overlay or navbar search).
- `searchStatistics()` remains for compatibility but expects optional registry/categories when used outside `searchAll`.

---

## Future AI Session Notes

- Append aliases to `PROVINCE_ALIASES` only in `search-intent.ts`.
- Adjust weights in `SCORE` in `search.ts` — avoid duplicating ranking in UI components.
- When adding districts/municipalities: extend `parseSearchIntent`, add alias maps, and map results to new routes without changing `SearchResult` shape.
- New registry datasets are picked up automatically for dataset-level search.
- Homepage and dashboard share `/dashboard?search=` — keep URL param sync if adding navbar search later.
