# SA Data Hub — Dataset Audit
**Generated:** 2026-06-02  
**Codebase state:** Post-Phase 3 (Citation Generator complete; Phase 4 pending)  
**Audit scope:** All 12 dataset files, registry, CSV export system, Download Center, Census, Search, Metadata, Municipality readiness

---

## Section 1: Dataset Inventory

The codebase contains **12 JSON files** under `src/data/datasets/`. Eleven contain `statistics[]` arrays consumed by the application. One (`provinces.json`) uses a `provinces[]` array and is treated separately by the data layer.

### 1.1 Complete Inventory Table

| Dataset | File | Format | Stats | Series | Data Points | File Size | Last Verified | Update Frequency |
|---------|------|--------|-------|--------|------------|-----------|---------------|-----------------|
| Unemployment | `unemployment.json` | JSON | 3 | 3 | 44 | 5,921 B | 2026-05-31 | Quarterly |
| Youth Unemployment | `youth-unemployment.json` | JSON | 4 | 4 | 55 | 6,861 B | 2026-05-31 | Quarterly |
| Labour Force | `labour-force.json` | JSON | 2 | 2 | 40 | 4,537 B | 2026-05-31 | Quarterly |
| Inflation & CPI | `inflation.json` | JSON | 4 | 4 | 53 | 7,636 B | 2026-05-31 | Monthly |
| GDP & Economy | `gdp.json` | JSON | 4 | 4 | 43 | 6,851 B | 2026-05-31 | Quarterly |
| Interest Rates | `interest-rates.json` | JSON | 2 | 2 | 52 | 5,068 B | 2026-05-31 | ~Bi-monthly (MPC) |
| Crime | `crime.json` | JSON | 3 | 3 | 17 | 4,397 B | 2025-05-01 | Annual |
| Education | `education.json` | JSON | 3 | 2 | 16 | 4,376 B | 2025-05-01 | Annual |
| Population | `population.json` | JSON | 3 | 1 | 10 | 4,239 B | 2026-05-30 | Annual |
| Housing & Services | `housing.json` | JSON | 3 | 3 | 11 | 4,231 B | 2025-05-01 | Census/Annual |
| Census 2022 | `census.json` | JSON | 3 | 2 | 6 | 3,708 B | 2025-05-01 | Decennial |
| Provinces | `provinces.json` | JSON | 9 provinces | — | — | 8,307 B | 2026-05-31 | Quarterly |

**Totals (excluding provinces):** 34 statistics, 29 series, 347 data points, ~63 KB

### 1.2 Per-Dataset Last-Updated Dates (from stat-level `lastUpdated` fields)

| Dataset | Most Recent `lastUpdated` | Freshness Notes |
|---------|--------------------------|----------------|
| Unemployment | 2026-02-17 | Q4 2025 QLFS data |
| Youth Unemployment | 2026-02-18 | Q4 2025 QLFS data |
| Labour Force | 2026-02-18 | Q4 2025 QLFS data |
| Inflation | 2026-05-21 | April 2026 CPI data |
| GDP | 2026-03-10 | Q4 2025 GDP release |
| Interest Rates | 2026-03-27 | March 2026 MPC statement |
| Crime | 2024-09-20 | 2023/24 financial year data |
| Education | 2025-01-15 | NSC 2024 results (most recent stat) |
| Population | 2024-07-30 | Mid-year estimates 2024 |
| Housing | 2023-10-10 | Census 2022 data |
| Census | 2023-10-10 | Census 2022 (static) |

### 1.3 Registry Metadata — What Is Present vs Missing

The `datasetRegistry` in `src/lib/registry.ts` has 11 entries (one per JSON file stem, excluding `provinces.json`).

**Fields present in each registry entry:**

`id`, `label`, `description`, `statIds`, `categoryId`, `sourceName`, `sourceShortName`, `sourceUrl`, `publicationName`, `updateFrequency`, `automationLevel`, `unit`, `seriesStart`

**Fields missing from registry entries:**

| Missing Field | Impact |
|---------------|--------|
| `lastUpdated` (stored value) | Derived on-demand via `getEntryLastUpdated()`. Not stored — requires iterating stat IDs on every call. No caching. |
| `fileSize` | Not tracked anywhere. Download Center cannot show file size to users. |
| `rowCount` / `dataPointCount` | Not stored in registry. `getEntryStatCount()` returns stat count, not data-point count. |
| `downloadPath` | No explicit download path field. File naming is derived at export time. |
| `notes` | Present in each JSON `_meta.notes` block but never propagated to the registry. |
| `geographicLevel` | Not defined. All datasets are national-level; provinces.json is province-level. No field distinguishes them. |
| `dataFormat` | Not stored. All files are JSON; exported as CSV. Format not declared in registry. |
| `license` | Not defined anywhere. All data is from official South African government sources (presumed open). |
| `tags` | Not defined. Would enable faceted search and filtering. |
| `citationDOI` | Not defined. Citation widget uses URLs only. |
| `seriesEnd` | `seriesStart` is present but `seriesEnd` is not. Users cannot see the temporal coverage end date without fetching data. |

**`provinces.json` is entirely absent from the registry.** It is a parallel data structure consumed by the provinces pages but has no `DatasetRegistryEntry`, no Download Center card, no `ExportButton`, and no `CitationWidget`. This is the only dataset with no export or citation capability.

---

## Section 2: CSV Export Audit

### 2.1 Export System Architecture

The export system was built in Phase 1. It lives in `src/lib/export.ts`. Two modes exist:

- **Series mode** — one row per data point: `id, title, category, series_name, period, value, unit`
- **Summary mode** — one row per statistic: `id, title, category, value, raw_value, unit, change, change_label, trend, last_updated, source_name, source_url`

The mode is selected automatically: series mode is used when a single stat with series data is passed; summary mode is used otherwise.

### 2.2 Per-Dataset Export Analysis

#### Category Page Export (`/category/[slug]`)

The `ExportButton` on each category page receives `stats` via `getStatsByCategory(params.slug)`, which returns **all** statistics whose `categoryId` matches the slug. This means:

| Category Page | Stats exported | Includes sub-dataset files? | Correct? |
|---------------|---------------|----------------------------|----------|
| `/category/unemployment` | 9 stats (unemployment + youth-unemployment + labour-force combined) | Yes — all three JSON files | **Ambiguous** — exports more than the visible page subset |
| `/category/gdp` | 6 stats (gdp + interest-rates combined) | Yes | **Ambiguous** |
| `/category/inflation` | 4 stats (inflation.json only) | N/A | ✅ Correct |
| `/category/crime` | 3 stats | N/A | ✅ Correct |
| `/category/education` | 3 stats | N/A | ✅ Correct |
| `/category/population` | 3 stats | N/A | ✅ Correct |
| `/category/housing` | 3 stats | N/A | ✅ Correct |
| `/category/census` | 3 stats | N/A | ✅ Correct |

For multi-file categories (`unemployment`, `gdp`), the category page export includes stats from all sub-datasets because `getStatsByCategory` collects by `categoryId`. This is actually **more comprehensive** than what is on screen, since the category page shows all those stats. It is not incorrect, but users may not realise they are receiving data from multiple source files.

#### Download Center Export (`/downloads`)

Each `DatasetDownloadCard` calls `getStatsByIds(entry.statIds)` and passes the result to `ExportButton`. This exports **exactly the stats listed in the registry entry** for that specific dataset file — no more, no less.

| Dataset | What users receive | What users should receive | Gap? |
|---------|-------------------|--------------------------|------|
| Unemployment | 3 stats + all series data points | 3 stats + series data | ✅ None |
| Youth Unemployment | 4 stats + all series | 4 stats + series | ✅ None |
| Labour Force | 2 stats + all series | 2 stats + series | ✅ None |
| Inflation | 4 stats + all series | 4 stats + series | ✅ None |
| GDP | 4 stats + all series | 4 stats + series | ✅ None |
| Interest Rates | 2 stats + all series | 2 stats + series | ✅ None |
| Crime | 3 stats + all series | 3 stats + series | ✅ None |
| Education | 3 stats + series (note: 1 stat has no series) | 3 stats + series | ⚠️ Minor — `education-literacy` has no series data |
| Population | 3 stats + series (2 stats have no series) | 3 stats + series | ⚠️ Minor — `population-urban` and `population-median-age` have no series |
| Housing | 3 stats + all series | 3 stats + series | ✅ None |
| Census | 3 stats + series (1 stat has no series) | 3 stats + series | ⚠️ Minor — `census-no-income` has no series data |
| Provinces | **Not exported** | Should be exportable | ❌ Critical gap |

### 2.3 Export Mode Logic Gap

The export mode selection logic in `buildCsvContent` is:
```
mode = stats.length === 1 && stats[0].series?.length ? 'series' : 'summary'
```

This means: when the `ExportButton` on a category/download page passes multiple stats (which is always the case for full-dataset exports), **summary mode is used**. Summary mode exports only the current headline value per stat, not the full time-series data.

**This is the most significant gap in the export system.** A researcher downloading the Unemployment dataset from the Download Center receives:
- **Current behaviour:** One CSV row per stat (3 rows), showing headline values only
- **Expected behaviour:** Full time-series CSV with all 44 data points across 3 series

The series data exists in the JSON files. The `buildCsvContent` function supports series output. The problem is the mode-selection logic defaults to summary when multiple stats are passed.

**What should happen for full-dataset exports:** When a user clicks "Download CSV" from the Download Center, they should receive all series data for all stats in that dataset — one row per data point, with the stat ID and series name as context columns.

### 2.4 Specific Stats Missing Series Data (Export Gaps)

Three stats across three datasets have no `series` array at all. Users downloading these datasets receive a summary-mode row showing only the headline value — there is no time-series to export:

| Stat ID | Dataset | Missing Data | Notes |
|---------|---------|-------------|-------|
| `census-no-income` | census.json | No series | Only static 2022 value available |
| `education-literacy` | education.json | No series | Only 2023 Census point; no trend series |
| `population-urban` | population.json | No series | Only 2023 Census point |
| `population-median-age` | population.json | No series | Only 2023 Census point |

These are not necessarily gaps to fill — some are structurally justified (single Census datapoints). But the export output is less useful for these specific stats.

### 2.5 Provinces Export Gap

`provinces.json` contains 9 province objects with unemployment rates, population, matric pass rates, GDP share, and detailed `stats` sub-objects. This data is displayed in the Provinces pages but:

- Not in the registry
- Not in the Download Center
- Has no `ExportButton`
- Has no `CitationWidget`

This is a meaningful gap since province-level data is exactly what researchers often need.

---

## Section 3: Download Center Audit

### 3.1 Current Implementation

The Download Center (`/downloads`) was built in Phase 2. Each dataset gets a `DatasetDownloadCard` showing: label, description, source (linked), last-updated date, update frequency, automation badge, stat count, `ExportButton`, and `CitationWidget`.

### 3.2 Missing Metadata in Each Download Card

| Field | Present? | Notes |
|-------|----------|-------|
| Dataset label | ✅ Yes | |
| Description | ✅ Yes | |
| Source name (linked) | ✅ Yes | |
| Publication name | ✅ Yes | |
| Last updated date | ✅ Yes | Derived via `getEntryLastUpdated()` |
| Update frequency | ✅ Yes | |
| Automation level badge | ✅ Yes | |
| Indicator count | ✅ Yes | Shows stat count, not data-point count |
| **File size** | ❌ Missing | Not available — no field in registry |
| **Estimated row count (data points)** | ❌ Missing | Registry stores stat count but not data-point count |
| **Data coverage dates** | ❌ Missing | `seriesStart` is in the registry but not displayed; `seriesEnd` is not in registry |
| **Geographic level** | ❌ Missing | All cards look identical; no "National" / "Provincial" distinction |
| **Data format badge** | ❌ Missing | Always CSV, but not stated explicitly for new users |
| **Notes / caveats** | ❌ Missing | JSON `_meta.notes` fields contain valuable methodology caveats but are never surfaced |
| **Update history link** | ❌ Missing | Phase 4 (Update Log) not yet built — no link possible yet |
| **Provinces dataset** | ❌ Missing | No card exists for the provincial data |

### 3.3 Scalability Concerns

The current Download Center iterates the entire `datasetRegistry` array (11 entries) at build time. This approach is entirely sound for the current scale and for any foreseeable expansion. No scalability concern exists at the data layer.

However, two UI scalability issues are worth noting:

**Filtering and sorting absent.** At 11 datasets the full list is readable. At 20–30 datasets (post-municipality or post-health/electricity expansion), the page needs filter controls (by category, by freshness, by automation level) and sort controls (by name, by last updated). The card grid has no filtering mechanism today.

**"Download all" is not implemented**, as intended. This is noted in the original handoff as a deliberate V4 exclusion. However, the card layout does not indicate this limitation — power users may expect it.

---

## Section 4: Census Audit

### 4.1 What Is Currently in `census.json`

The census dataset is a single `CategoryId: 'census'` with 3 statistics:

| Stat ID | Title | Value | Series Points | Theme |
|---------|-------|-------|--------------|-------|
| `census-households` | Total Households | 17.3M | 3 (2001, 2011, 2022) | Households |
| `census-internet-access` | Households with Internet Access | 64.0% | 3 (2011, 2016, 2022) | Living Conditions / Technology |
| `census-no-income` | Individuals with No Income | 30.4% | 0 | Income |

All three are from Census 2022, published 2023-10-10. The dataset is correctly marked `static` with `Decennial` update frequency.

### 4.2 Census Themes — Current Coverage

| Theme | Currently Represented? | Current Stats | Notes |
|-------|----------------------|--------------|-------|
| **Households** | ✅ Partial | `census-households` (total count) | Missing: household size, type (formal/informal), ownership, headship |
| **Internet Access / Technology** | ✅ Present | `census-internet-access` | Good coverage for a single indicator |
| **Income** | ✅ Partial | `census-no-income` | Only "no income" measure; no income distribution, no median income |
| **Population** | ⚠️ Scattered | `population.json` has Census 2022 stats | Census population stats live in `population.json`, not `census.json` — architectural fragmentation |
| **Education** | ⚠️ Scattered | `education-literacy` in `education.json` | Census 2022 literacy stat lives outside the census dataset |
| **Housing / Living Conditions** | ⚠️ Scattered | `housing.json` has 3 Census 2022 stats | Electricity, piped water, formal dwellings are Census 2022 data but live in `housing.json` |
| **Employment** | ❌ Missing | None | Census 2022 has employment figures; not represented in `census.json` |
| **Migration** | ❌ Missing | None | Census 2022 has migration/place of birth data; absent entirely |
| **Age & Gender Distribution** | ❌ Missing | None | Basic demographic pyramids not represented |
| **Race / Population Group** | ❌ Missing | None | Politically sensitive but published by Stats SA |
| **Language** | ❌ Missing | None | Home language data from Census 2022 not represented |
| **Disability** | ❌ Missing | None | Census 2022 disability module not represented |

### 4.3 Census Years Supported

Only **Census 2022** data is directly modelled as a dataset. However, earlier census years appear as data points within series:

- Census 2001 data points: present in `census-households` and `housing.json` series
- Census 2011 data points: present in `census-households`, `census-internet-access`, and `housing.json` series
- Census 1996: present in `population-total` series only

**No Census 1996, 2001, or 2011 datasets exist as standalone registry entries.** All historical census comparisons are baked into series data rather than being discrete, citable datasets.

### 4.4 Geographic Levels Available vs Missing

| Geographic Level | Available? | Notes |
|-----------------|-----------|-------|
| National | ✅ Yes | All census stats are national-level |
| Provincial | ⚠️ Partial | `provinces.json` has some Census 2022 figures (literacy via matricPassRate, electricity, piped water) but these are in `ProvinceStats`, not `statistics[]` |
| District Municipality | ❌ Missing | 52 district municipalities — no data |
| Local Municipality | ❌ Missing | 213 local municipalities — no data |
| Ward | ❌ Missing | 4,468 wards — no data |

The Census 2022 release includes data at all these geographic levels. The current codebase represents only the national level.

### 4.5 Critical Census Architecture Issue

Census 2022 data is **split across three separate dataset files**:

- `census.json` — households, internet access, income
- `housing.json` — electricity access, piped water, formal dwellings (all Census 2022)
- `population.json` — urbanisation rate, median age (from Census 2022)
- `education.json` — literacy rate (`education-literacy`, Census 2022)

This fragmentation means:
- A user downloading `census.json` via the Download Center does not get all Census 2022 data
- The Census category page (`/category/census`) shows only 3 indicators, not the ~9 Census-derived statistics in the codebase
- The `CitationWidget` on the Census page cites only one of the three source publications, despite housing and education having different publications

---

## Section 5: Search Audit

### 5.1 Current Search Architecture

Search is implemented in `src/lib/search.ts` using:
- Levenshtein distance fuzzy matching (threshold = 2)
- Synonym expansion via a static `SYNONYMS` dictionary
- Token-based matching per query word
- Scoring: title match (100) > category match (60) > fuzzy title (50) > description keyword (20) > fuzzy description (10)

The search operates on the flat `statistics[]` array — 34 stats total.

### 5.2 Conceptual Test Cases

#### "Western Cape unemployment"

**What happens:** The query expands via synonyms: `['western cape unemployment', 'western cape', 'western cape cape town', 'unemployment', 'labour', 'employment']`. The search then scores all 34 stats against each expanded query.

**Problem:** No stat in `statistics[]` has "Western Cape" in its `title`, `categoryId`, or `description`. Province-level unemployment stats live in `provinces.json` as `ProvinceData` objects, not as `Statistic` objects. `searchStatistics()` never sees province data.

**Result:** The query degrades to matching "unemployment" terms only — the user gets national unemployment stats, not Western Cape-specific data.

**Gap:** Province-level data is not searchable. A user asking province-specific questions gets no province-specific results.

#### "Gauteng crime"

**What happens:** "Gauteng" has no synonym entry. "Crime" matches the crime category. The province qualifier is ignored entirely.

**Result:** National crime statistics are returned. There is no Gauteng-level crime data in the dataset, so this is arguably correct — but the search gives no indication that it has dropped the province qualifier, and no link to the province page for Gauteng.

**Gap:** The search engine provides no feedback to the user that their province qualifier was dropped or that province-specific pages exist.

#### "KwaZulu-Natal education"

**Same issue as above.** "kwazulu-natal" has a synonym entry (`['kwazulu-natal', 'durban', 'kzn']`) but these map to the string values "kwazulu-natal", "durban", "kzn" — none of which appear in any statistic title, category, or description. The education qualifier works and returns education stats. Province qualifier is silently dropped.

### 5.3 Specific Issues Identified

**Issue 1 — Province queries return no province-specific results.**  
The `statistics[]` array contains only national-level data. Province data lives in `ProvinceData[]` which is never passed to `searchStatistics()`. The `SYNONYMS` dictionary has province entries but they expand to strings that don't match any statistic.

**Issue 2 — `SearchResult.categoryLabel` is set to `stat.categoryId` (the ID), not the human-readable label.**  
In `searchStatistics()`, the returned result object sets `categoryLabel: stat.categoryId` rather than resolving the category label from the `categories` array. This means any UI displaying the categoryLabel would show `unemployment` instead of `Unemployment`, `gdp` instead of `GDP & Economy`, etc.

**Issue 3 — No intent detection for province-qualified queries.**  
A query like "Western Cape unemployment" should ideally redirect to or surface the province page for Western Cape alongside (or instead of) national stats. The current scorer has no mechanism for this.

**Issue 4 — Score inflation for multi-token synonyms.**  
When a query expands to many synonyms (e.g. "poverty" expands to `['poverty', 'income', 'household', 'unemployment']`), each synonym runs through the full scoring pass. A stat that matches multiple expanded terms can accumulate very high scores (potentially 300–500 points) while appearing no more relevant than a stat scoring 100 on a direct match. There is no normalisation.

**Issue 5 — "census" query returns all stats sourced from Census 2022.**  
Because housing, population, and education stats are labelled with `"Census 2022 Statistical Release"` as their `publicationName`, searching for "census" could surface them. However, since `publicationName` is not indexed (only `title`, `categoryId`, `description` are scored), this does not happen — the Census category stats are the only ones returned. This is probably correct behaviour, but it is incidental rather than deliberate.

**Issue 6 — No search results page or "did you mean" for zero-result queries.**  
If a query returns no matches (score = 0), the UI receives an empty array with no fallback or suggestion.

---

## Section 6: Metadata Audit

### 6.1 Registry Field Completeness Per Dataset

Evaluating each registry entry against the fields specified in the audit requirements:

| Dataset | `source` | `frequency` | `release` | `file size` | `row count` | `download path` | `citation` | `update metadata` |
|---------|----------|-------------|-----------|-------------|-------------|-----------------|------------|-------------------|
| unemployment | ✅ | ✅ | ✅ (publicationName) | ❌ | ❌ | ❌ | ✅ (via CitationWidget) | ✅ lastUpdated |
| youth-unemployment | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| labour-force | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| inflation | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| gdp | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| interest-rates | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| crime | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| education | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| population | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| housing | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| census | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **provinces** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 6.2 Source Field Inconsistency (Carried From Pre-V4)

The `DataSource` type now includes `release?: string` (confirmed in `src/types/index.ts`). Three datasets use `release` instead of `publicationName` at the stat level:

| Dataset File | Stats Using `release` | `publicationName` Present? |
|-------------|----------------------|---------------------------|
| `interest-rates.json` | `repo-rate`, `prime-lending-rate` | ❌ Missing |
| `labour-force.json` | `labour-force-participation`, `female-labour-participation` | ❌ Missing |
| `youth-unemployment.json` | All 4 stats | ❌ Missing |

The registry entries for these three datasets have `publicationName` defined (they use "Quarterly Labour Force Survey" and "MPC Statement"). The citation engine (`citation.ts`) falls back to `release` when `publicationName` is absent, so citations generate correctly. However, the stat-level `source.publicationName` is absent for these 9 statistics, which means stat-level citation (using `generateCitation()` on an individual stat) would produce a less-specific citation title. The stat-level citation mode is currently unrendered in the UI (noted in PHASE3_COMPLETE.md as "not yet used on any page"), so this is not yet user-visible.

### 6.3 Duplicate Stat IDs (Known Issue)

Two stat IDs appear in multiple dataset files:

| Stat ID | Files | Impact |
|---------|-------|--------|
| `labour-force-participation` | `unemployment.json` AND `labour-force.json` | `getStatById('labour-force-participation')` returns the first match — always the one from `unemployment.json`, since it appears earlier in the `statistics[]` spread order in `mock.ts`. The `labour-force.json` version is unreachable via ID lookup. |
| `repo-rate` | `inflation.json` AND `interest-rates.json` | Same issue — `getStatById('repo-rate')` always returns the `inflation.json` version. The `interest-rates.json` version is unreachable via ID lookup. |

These duplicates were noted in PHASE2_COMPLETE.md and PHASE3_COMPLETE.md. They affect: `getStatById()` correctness, `getStatsByIds()` resolution for registry entries, and any future stat-level feature (stat-level citation, individual stat export). The shadow stats accumulate in the flat `statistics[]` array but are unreachable by ID.

### 6.4 `_meta` Fields Not Propagated to Registry

Each JSON file has a `_meta.notes` field containing important methodology caveats. None of these are surfaced to users:

| Dataset | `_meta.notes` content (summarised) |
|---------|-------------------------------------|
| census | "Data is static until next census. Figures are definitive." |
| interest-rates | (Presumably: semi-manual; LATEST_REPO_RATE must be set post-MPC) |
| crime | Notes about SAPS release schedule |
| housing | Census vs GHS sourcing distinction |
| population | Combination of Census and mid-year estimates |

This information would be valuable in the Download Center and the forthcoming Update Log.

---

## Section 7: Municipality & District Readiness

### 7.1 Current Architecture Assessment

The current architecture supports only two geographic levels: national (all `statistics[]`) and provincial (the `ProvinceData[]` array in `provinces.json`). There is no municipality concept anywhere in the codebase.

### 7.2 What Would Need to Change

**`src/types/index.ts`**  
A `Municipality` type would need to be added alongside `Province`. A `MunicipalityId` union type (or preferably a string type, given 213 local municipalities) would be needed. `Statistic` would need an optional `municipality?: MunicipalityId` field.

**`src/data/datasets/` and `src/data/mock.ts`**  
A `municipalities.json` file would be needed, modelled on `provinces.json`. The `getStatsByMunicipality()` helper would follow the same pattern as `getStatsByCategory()`. `mock.ts` would need a new import and spread.

**`src/lib/registry.ts`**  
The `DatasetRegistryEntry` shape would need a `geographicLevels: ('national' | 'provincial' | 'district' | 'local')[]` field. The registry itself handles new entries with no structural changes — adding a municipality dataset is just another entry in `datasetRegistry[]`.

**`src/app/` — new routes**  
New pages at `/municipalities` and `/municipalities/[id]` would be required, following the existing pattern of `/provinces` and `/provinces/[id]`. `generateStaticParams()` would need to enumerate all 213 municipalities. This is the largest surface area change.

**`src/lib/search.ts`**  
The synonym map has province entries; municipality names would need to be added. The `scoreMatch()` function would need `municipalityId` as an indexed field on `Statistic`.

### 7.3 Datasets Affected by Municipality Expansion

| Dataset | Municipality Data Available from Source? | Notes |
|---------|----------------------------------------|-------|
| Crime | ✅ Yes | SAPS publishes station-level and precinct-level data |
| Population | ✅ Yes | Census 2022 is fully disaggregated to ward level |
| Housing | ✅ Yes | Census 2022 service delivery data available by municipality |
| Education | ⚠️ Partial | Matric data sometimes available by district; literacy by Census |
| Unemployment | ⚠️ Partial | QLFS has metro-level data for major metros only |
| GDP | ❌ Limited | No municipal GDP data; district GDP estimates exist but are not official Stats SA |
| Inflation | ❌ No | CPI is national; no municipal breakdown published |

### 7.4 Registry Scalability for Municipalities

The registry as structured is a flat static array. Adding 9 municipal datasets (one per province with aggregated data) is trivial. Adding disaggregated data for 52 district municipalities or 213 local municipalities would require either:

- A dynamic registry-loading pattern (currently not needed and not implemented), or
- A very large static array (213 entries) which is structurally fine for TypeScript but awkward to maintain manually

The `DatasetRegistryEntry` type has no `geographicLevel` field, which means there is currently no way to filter the registry by geographic scope. This would need to be added before municipality datasets are mixed into the same registry as national datasets.

---

## Section 8: Prioritised Findings

### 8.1 Critical

**C1 — Export mode defaults to summary for all multi-stat exports**  
The category page and Download Center always trigger summary mode (one row per stat, headline value only). Users who click "Download CSV" expecting a time-series dataset receive a 3–4 row summary instead of 40–55 rows of trend data. This is the most impactful gap for the stated purpose of the Download Center (serving researchers and journalists).

**C2 — Provinces dataset entirely absent from registry, Download Center, and export**  
`provinces.json` has no registry entry, no Download Center card, no `ExportButton`, and no `CitationWidget`. Province-level data (9 provinces × multiple indicators) is displayed on province pages but cannot be downloaded.

**C3 — Duplicate stat IDs (`repo-rate`, `labour-force-participation`)**  
`getStatById()` always returns the first-match version, making half of each duplicated stat permanently unreachable via ID. This silently corrupts registry-based exports for `interest-rates` and `labour-force` datasets (the registry calls `getStatsByIds()` which calls `getStatById()` per ID — the `interest-rates.json` `repo-rate` and `labour-force.json` `labour-force-participation` are shadowed by earlier entries in the `statistics[]` spread order).

### 8.2 High

**H1 — Census data is fragmented across four dataset files**  
Housing, population, and education datasets contain Census 2022 statistics that conceptually belong with or alongside the `census.json` dataset. A user downloading `census.json` does not get all Census 2022 data. The Census category page shows only 3 of the ~9 Census-derived statistics in the codebase.

**H2 — Province search queries drop the province qualifier silently**  
Queries like "Western Cape unemployment" return national stats without any signal to the user that the province qualifier was ignored or that a province page exists. This is a discoverability failure.

**H3 — Download Center cards missing file size, data coverage dates, and notes**  
Users evaluating whether to download a dataset cannot see how large the file will be, what date range is covered, or any methodology caveats. These are standard expectations for a data download interface.

**H4 — `_meta.notes` never surfaced to users**  
Each dataset JSON has a `notes` field with important caveats (e.g., "Census 2022 is static until ~2032", SAPS release schedule). This is never shown anywhere in the UI.

### 8.3 Medium

**M1 — `SearchResult.categoryLabel` uses the raw ID, not the human-readable label**  
Any UI that renders `categoryLabel` from search results would show `gdp` instead of `GDP & Economy`. Currently the search results UI may not display this field, but it is a data-quality issue in the returned structure.

**M2 — Three datasets use `source.release` instead of `source.publicationName` at stat level**  
`youth-unemployment.json`, `interest-rates.json`, and `labour-force.json` stats lack `publicationName`. Stat-level citation (currently unused in the UI) would produce incomplete citations for these 9 stats.

**M3 — Registry missing `notes`, `geographicLevel`, `fileSize`, `dataPointCount` fields**  
These are needed for a complete Download Center and for the forthcoming Update Log.

**M4 — `seriesEnd` not stored in registry**  
`seriesStart` is declared but `seriesEnd` is not. Users cannot see temporal coverage without examining data.

**M5 — Stat-level export for stats without series data**  
Stats like `census-no-income`, `education-literacy`, `population-urban`, `population-median-age` have no series. Their export produces a single summary row with no trend data. This is not wrong but is potentially surprising.

### 8.4 Low

**L1 — Search score inflation with multi-synonym expansion**  
High-synonym queries can produce artificially elevated scores with no normalisation. Does not cause wrong results, but ranking may be unstable.

**L2 — Province page is fully client-rendered**  
`provinces/page.tsx` uses `'use client'` for sort state, meaning all province data is bundled client-side. Fine at current scale; minor performance concern.

**L3 — `getFeaturedStats()` uses a hardcoded ID list**  
Noted in the handoff. No registry or data-layer mechanism to flag a stat as featured. Not blocking.

**L4 — No "Download all datasets" option**  
Deliberately excluded from V4. Worth planning for V5 as a ZIP bundle.

**L5 — No license field on any dataset**  
All data is from official South African government publications. Presumed open under PAIA/Stats SA terms. No license declaration exists anywhere in the codebase.

---

## Section 9: Recommended Next Phase Implementation Order

Based on this audit, the recommended implementation order for the next phases is:

### Priority 1 — Fix Critical Gaps Before Adding New Features

Before implementing any of the planned phases, two critical bugs should be resolved as they affect existing Phase 1/2/3 functionality:

**Step A: Fix duplicate stat IDs (C3)**  
Rename `repo-rate` in `interest-rates.json` to `repo-rate-sarb` or similar, and rename `labour-force-participation` in `unemployment.json` to `unemployment-lfp` to distinguish it from `labour-force.json`. Update `registry.ts` `statIds` arrays and `getFeaturedStats()` if applicable. This is a data fix, not a feature.

**Step B: Fix export mode for full-dataset downloads (C1)**  
In `buildCsvContent()` or `ExportButton`, add a prop or option to force series mode for full-dataset exports from the Download Center. The simplest fix: add `mode: 'series'` to the `ExportOptions` passed from `DatasetDownloadCard`. This is a one-line fix at the call site that transforms the Download Center from a summary exporter to a full time-series exporter.

### Priority 2 — Phase 4: Dataset Update Log

Phase 4 is next in the original roadmap and has all its dependencies satisfied (registry is stable, utility functions are extracted, `getUpdateLog()` is already implemented in `registry.ts`). Build now. Add `_meta.notes` propagation to the `UpdateLogEntry` type while building this page, which also resolves H4.

### Priority 3 — Full CSV Downloads Enhancement

After the export mode fix in Step B above, expand the Download Center cards to display:
- Data coverage date range (`seriesStart` to latest data point)
- Estimated row count (data points)
- File size (requires computing at build time or storing in registry)

Add the `provinces` dataset to the registry and Download Center (resolves C2).

### Priority 4 — Dataset Update Log (Phase 4) + Website Changelog

Build `src/app/updates/page.tsx` as specified in the V4 handoff. Seed `src/data/update-history.ts` with entries for all datasets based on current `lastUpdated` fields. Propagate `_meta.notes` to registry entries as a `notes?: string` field and surface them on the Update Log and Download Center.

### Priority 5 — Search Upgrade

Address H2 and M1 together:
- Make province pages discoverable from search (surface province page links when province names appear in query)
- Fix `categoryLabel` to return human-readable label from `categories[]`
- Add "no results" fallback with suggestions
- Consider indexing `provinces[]` as a separate search domain

### Priority 6 — Census Modernisation

This is the largest scope item and should not block other work:
- Consolidate Census 2022 statistics: decide whether to unify Census-sourced stats into `census.json` or to accept the current split and add cross-dataset Census navigation
- Add missing Census themes: employment from Census 2022 (new stat), age/gender distribution (new stats)
- Add provincial Census breakdowns if municipality expansion is not imminent

### Priority 7 — Municipality Expansion

Plan and document the full architecture change (new `Municipality` type, new routes, new registry fields) before implementation. Prioritise the datasets with clean municipality-level source data: Crime (SAPS station data), Population (Census ward data), Housing (Census service delivery data). Defer Unemployment municipality expansion until QLFS metro-level data is structured.

### Summary Table

| # | Work Item | Resolves | Effort |
|---|-----------|----------|--------|
| Step A | Fix duplicate stat IDs | C3 | Very low — data fix only |
| Step B | Fix export mode (series for full datasets) | C1 | Very low — one-line fix |
| 4 | Phase 4: Dataset Update Log | H4, M3 (partial) | Medium — per handoff spec |
| 3 | Full CSV Downloads + Provinces in registry | C2, H3 | Low–Medium |
| 5 | Search Upgrade | H2, M1 | Medium |
| 6 | Census Modernisation | H1 | Medium–High |
| 7 | Municipality Expansion | Architecture only | High |

---

*End of audit. No code was written, modified, or created as part of this document. All findings are based on static analysis of the existing codebase and dataset files.*
