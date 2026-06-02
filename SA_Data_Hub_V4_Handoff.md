# SA Data Hub V4 — Implementation Handoff

**Generated:** 2026-06-01  
**Based on:** Full codebase audit of the V3 project (sa-data-hub, Next.js 14, TypeScript)  
**Purpose:** Complete developer handoff enabling immediate V4 implementation without re-auditing the project

---

## Executive Summary

SA Data Hub is a statically-generated Next.js 14 application. All data lives in JSON files under `src/data/datasets/`. There is no backend, no database, and no API runtime — everything is imported at build time and rendered server-side or statically. This is the single most important architectural fact for V4 planning.

V4 introduces four features: a **CSV Export System**, a **Download Center** page, a **Citation Generator**, and a **Dataset Update Log**. None of these require a backend or new dependencies. They are all implementable as pure TypeScript client utilities, static pages, and React components that operate on the data already in scope.

The recommended approach for all four features is to build a single **Dataset Registry** (`src/lib/registry.ts`) that centralises per-dataset metadata currently scattered across three sources: the JSON `_meta` blocks, the `Statistic.source` fields, and the hardcoded `UPDATE_FREQUENCY` map in the category page. Everything else — export, citation, update log — reads from that registry. This gives V4 a clean, scalable foundation that will serve V5 and beyond without refactoring.

---

## Project Structure

```
sa-data-hub/
├── src/
│   ├── app/                          Next.js App Router pages
│   │   ├── layout.tsx                Root layout — fonts, ThemeProvider, Navbar, Footer, Analytics
│   │   ├── globals.css               Tailwind directives + custom tokens (.card, .heading-display, .container-page)
│   │   ├── page.tsx                  Homepage — hero, featured stats, insights CTA
│   │   ├── dashboard/page.tsx        Dashboard — all stats, filters, search, timeline
│   │   ├── category/[slug]/page.tsx  Per-category page — stat cards, explanations, freshness, charts
│   │   ├── provinces/page.tsx        Province Explorer — sortable grid, comparison table
│   │   ├── provinces/[id]/page.tsx   Province detail — stats, ranking bar, prev/next nav
│   │   ├── insights/page.tsx         Insights Hub index — story cards, category filter, search
│   │   ├── insights/[slug]/page.tsx  Individual story — sections, stat callouts, related stories
│   │   ├── methodology/page.tsx      Source docs, dataset definitions, update frequencies
│   │   └── not-found.tsx             404 page
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx            Navigation with dropdown Categories menu, theme toggle
│   │   │   ├── Footer.tsx            Links grid — Categories, Platform, Sources columns
│   │   │   └── ThemeProvider.tsx     next-themes wrapper (light/dark/system)
│   │   ├── charts/
│   │   │   ├── LineChartCard.tsx     Recharts LineChart — custom tooltip, no grey hover block
│   │   │   └── BarChartCard.tsx      Recharts BarChart — cursor={false} fix applied
│   │   └── ui/
│   │       ├── StatCard.tsx          KPI card — value, trend badge, change label
│   │       ├── CategoryCard.tsx      Category grid card — icon, label, stat count
│   │       ├── InsightPanel.tsx      Insight summary with sentiment colour
│   │       ├── DatasetExplanation.tsx Collapsible 4-section explanation accordion
│   │       ├── FreshnessIndicator.tsx Data age badge — fresh/recent/aging/stale logic
│   │       ├── HistoricalTimeline.tsx Timeline of SA events overlaid on chart data
│   │       ├── ProvinceCard.tsx      Province summary card
│   │       ├── SearchBar.tsx         Fuzzy search input
│   │       ├── SourceBadge.tsx       Source attribution pill
│   │       ├── StatCallout.tsx       Live stat inline in story sections
│   │       └── StoryCard.tsx         Insights Hub story preview card
│   │
│   ├── data/
│   │   ├── mock.ts                   Central data layer — imports all JSONs, exports helpers
│   │   ├── stories.ts                Hand-authored Insights Hub stories (3 currently)
│   │   └── datasets/                 One JSON file per dataset (12 files)
│   │       ├── unemployment.json
│   │       ├── youth-unemployment.json
│   │       ├── labour-force.json
│   │       ├── inflation.json
│   │       ├── gdp.json
│   │       ├── interest-rates.json
│   │       ├── crime.json
│   │       ├── education.json
│   │       ├── population.json
│   │       ├── housing.json
│   │       ├── census.json
│   │       └── provinces.json
│   │
│   ├── lib/
│   │   ├── utils.ts                  cn(), formatNumber(), formatDate(), getTrendColor(), GOOD_WHEN_DOWN
│   │   ├── insights.ts               generateInsight() — derives contextual insights from series data
│   │   ├── explanations.ts           generateExplanation() — 4-section text from live stat data
│   │   └── search.ts                 searchStatistics() — Levenshtein fuzzy search + synonym map
│   │
│   └── types/
│       └── index.ts                  All TypeScript interfaces — Statistic, DataSource, DataSeries, etc.
│
├── scripts/                          Python data update automation
│   ├── utils.py                      Shared: load_dataset(), save_dataset(), fetch(), report_changes()
│   ├── update_all.py                 Master runner — UPDATERS registry, --only and --dry-run flags
│   ├── update_unemployment.py
│   ├── update_inflation.py
│   ├── update_gdp.py
│   ├── update_interest_rates.py      Semi-manual — constant LATEST_REPO_RATE must be set after MPC
│   ├── update_population.py
│   ├── update_crime.py               Manual — SAPS has no API
│   ├── update_education.py           Manual — DBE annual release
│   ├── update_housing.py             Manual — Census/GHS
│   └── update_census.py              Static — next census ~2032
│
├── package.json                      Dependencies listed below
├── tailwind.config.ts                Brand green + gold palette, DM Sans/DM Serif/DM Mono fonts
├── next.config.js
└── IMPLEMENTATION_NOTES.md           V2/V2.1 architecture decisions (worth preserving)
```

---

## Existing Data Flow

### End-to-end path from source to screen

```
Official source (Stats SA / SARB / SAPS / DBE)
    ↓  Python update script (scripts/update_*.py)
    ↓  writes
src/data/datasets/<name>.json   ← static JSON files committed to git
    ↓  imported at build time via
src/data/mock.ts               ← assembles statistics[], provinces[], categories[]
    ↓  consumed by
Next.js server components       ← call getStatsByCategory(), getStatById(), etc.
    ↓  pass props to
React UI components             ← StatCard, LineChartCard, DatasetExplanation, etc.
    ↓  rendered to
Static HTML (Vercel)            ← no runtime data fetching, no API calls
```

### Dataset JSON structure

Every dataset JSON (except provinces.json) follows this schema:

```json
{
  "_meta": {
    "source": "string",
    "source_url": "string",
    "update_frequency": "string",
    "last_verified": "YYYY-MM-DD",
    "auto_updated": "YYYY-MM-DD",   // only on auto-updated datasets
    "notes": "string"
  },
  "statistics": [
    {
      "id": "string",               // e.g. "unemployment-national"
      "categoryId": "string",       // matches Category.id
      "title": "string",
      "value": "string",            // formatted display value e.g. "31.4%"
      "rawValue": number,
      "unit": "string",             // e.g. "%" | "cases" | "ZAR billion"
      "change": number,
      "changeLabel": "string",
      "trend": "up" | "down" | "stable",
      "description": "string",
      "source": {
        "name": "string",
        "shortName": "string",
        "url": "string",
        "publicationName": "string",   // present on newer datasets
        "publicationDate": "YYYY-MM-DD" // present on newer datasets
        // NOTE: some older stats use "release" instead of "publicationName"
      },
      "lastUpdated": "YYYY-MM-DD",
      "series": [
        {
          "name": "string",
          "unit": "string",
          "color": "string",          // optional hex
          "data": [
            { "label": "string", "value": number }
          ]
        }
      ]
    }
  ]
}
```

### Important metadata inconsistency to be aware of

There are two `source` field patterns in the codebase. Newer datasets (unemployment, inflation, gdp) use `publicationName` + `publicationDate`. Older/semi-manual ones (youth-unemployment, interest-rates, labour-force) use `release` instead. The `DataSource` type in `src/types/index.ts` defines `publicationName` and `publicationDate` as optional, but does not define `release`. The registry abstraction recommended below resolves this by normalising the metadata at one point.

### How data reaches pages

`src/data/mock.ts` is the sole entry point for all data. It imports all 12 JSON files, assembles the flat `statistics` array, and exports helpers:

- `getStatsByCategory(categoryId)` — used by category pages
- `getStatById(id)` — used by stories (StatCallout) and dashboard
- `getFeaturedStats()` — hardcoded list of 6 IDs for the homepage
- `searchStats(query)` — delegates to `src/lib/search.ts`
- `getProvinceData()` / `getProvinceById(id)` — provinces
- `getProvincesSortedBy(key)` — province explorer sort

---

## Existing Reusable Patterns

### Patterns to reuse — do not duplicate

**1. The `_meta` block in JSON files**  
Every dataset already has a `_meta` block with `source`, `source_url`, `update_frequency`, `last_verified`, `notes`. This is the ground truth for update log and freshness data. Read from here rather than hardcoding.

**2. `Statistic.source` — the `DataSource` interface**  
Every stat carries its source: `name`, `shortName`, `url`, `publicationName`, `publicationDate`. Citation generation should read directly from `stat.source`, not from a separate lookup table.

**3. `Statistic.lastUpdated` — already ISO-formatted**  
All 34 statistics have `lastUpdated` as `YYYY-MM-DD`. This is the authoritative "last updated" date. Do not create a parallel store.

**4. `FreshnessIndicator` component**  
Already implements freshness logic (`fresh` / `recent` / `aging` / `stale`) with relative and absolute date formatting. The update log should reuse `getFreshness()` — extract it as a named export from `FreshnessIndicator.tsx` rather than re-implementing the logic.

**5. `formatDate()` in `src/lib/utils.ts`**  
Formats ISO dates to South African locale (`en-ZA`). Use this everywhere a date is displayed.

**6. `cn()` utility**  
`clsx` + `tailwind-merge` wrapper already in `src/lib/utils.ts`. Use for all conditional className construction.

**7. Category page layout pattern**  
`src/app/category/[slug]/page.tsx` is a clean example of a server component that: calls data helpers, handles `notFound()`, renders a header band, then renders a list of components. New pages (Download Center) should follow this exact pattern.

**8. `generateStaticParams()` pattern**  
Category and province pages both implement `generateStaticParams()`. The Download Center and any new static route must do the same.

**9. The `.card` CSS class**  
Defined in `globals.css` as `rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900`. All cards in V4 should use `.card` not inline Tailwind equivalents.

**10. Python `utils.py` pattern in scripts**  
`load_dataset()` / `save_dataset()` / `report_changes()` are clean, reusable. Any new Python script for the update log history file should use these helpers.

---

## Recommended Core Abstractions

### 1. `datasetRegistry`

**Purpose:** Single source of truth for per-dataset metadata that is currently scattered across JSON `_meta` blocks, `Statistic.source` fields, and the hardcoded `UPDATE_FREQUENCY` map in the category page. All V4 features read from this.

**Where it lives:** `src/lib/registry.ts` (new file)

**Why it's needed:** Currently `UPDATE_FREQUENCY` is a local constant in `category/[slug]/page.tsx`. The update log needs this data. The citation generator needs source and publication data. The download center needs dataset labels, descriptions, and stat counts. Without a registry, all four V4 features would hardcode the same metadata in different places.

**Shape:**

```typescript
export interface DatasetRegistryEntry {
  id: string                    // matches categoryId or stat grouping key
  label: string                 // display name e.g. "Unemployment"
  description: string           // one-sentence summary
  statIds: string[]             // all Statistic IDs in this dataset
  source: {
    name: string
    shortName: string
    url: string
    publicationName?: string
  }
  updateFrequency: string       // "Monthly" | "Quarterly" | "Annual" | "Static"
  automationLevel: 'auto' | 'semi-auto' | 'manual' | 'static'
  lastUpdated: string           // ISO date — derived from max(stat.lastUpdated) across statIds
  seriesStart: string           // earliest data point label e.g. "Q1 2022"
  unit: string                  // primary unit of the dataset
  categoryId: CategoryId        // links back to the category
}

export const datasetRegistry: DatasetRegistryEntry[]
export function getRegistryEntry(id: string): DatasetRegistryEntry | undefined
export function getRegistryByCategory(categoryId: CategoryId): DatasetRegistryEntry[]
```

**Inputs:** Static, defined inline — pulled from the existing `categories` array in `mock.ts`, the `_meta` blocks in each JSON, and the stat arrays.  
**Outputs:** Typed registry entries consumed by export, citation, and update log features.

---

### 2. `exportDataset()`

**Purpose:** Converts a `Statistic[]` array (for a given dataset or stat) into a CSV string, then triggers a browser download.

**Where it lives:** `src/lib/export.ts` (new file)

**Why it's needed:** This is the core logic behind the CSV Export System. Isolating it as a pure function (string in, CSV string out) makes it testable and reusable from multiple call sites (category page, download center, individual stat card).

**Signature:**

```typescript
export function buildCsvContent(
  stats: Statistic[],
  options?: { includeSeries?: boolean; includeMetadata?: boolean }
): string

export function downloadCsv(filename: string, csvContent: string): void

export function exportDataset(
  stats: Statistic[],
  datasetLabel: string,
  options?: { includeSeries?: boolean }
): void   // calls buildCsvContent then downloadCsv
```

**Inputs:** One or more `Statistic` objects (already in scope on every page that would show an export button).  
**Outputs:** A `.csv` file downloaded by the browser. No server required.

---

### 3. `generateCitation()`

**Purpose:** Produces a formatted citation string for a dataset in APA or Harvard style, derived from the metadata already present in `Statistic.source`.

**Where it lives:** `src/lib/citation.ts` (new file)

**Why it's needed:** All the raw material for a citation (author/organisation, publication name, URL, date) already lives in `stat.source`. This function standardises that into recognised academic formats.

**Signature:**

```typescript
export type CitationStyle = 'APA' | 'Harvard'

export interface CitationInput {
  source: DataSource           // from Statistic.source
  accessedDate?: string        // defaults to today's ISO date
  datasetTitle?: string        // e.g. "National Unemployment Rate"
}

export function generateCitation(input: CitationInput, style: CitationStyle): string
export function generateDatasetCitation(stat: Statistic, style: CitationStyle): string
```

**Inputs:** A `Statistic` (which carries `source`) and a `CitationStyle`.  
**Outputs:** A plain text string, ready to copy or display.

---

### 4. `getUpdateLog()`

**Purpose:** Returns a structured update history — when each dataset was last verified and what changed — derived from the `_meta` blocks in the JSON files and optionally from a hand-maintained log file.

**Where it lives:** `src/lib/registry.ts` (as an export from the registry module)

**Why it's needed:** The update log page needs to display per-dataset update dates, frequency, and automation level. Rather than a separate data store, this derives from the registry and the `lastUpdated` field already present on every stat.

**Signature:**

```typescript
export interface UpdateLogEntry {
  datasetId: string
  datasetLabel: string
  lastUpdated: string          // ISO date
  updateFrequency: string
  automationLevel: string
  source: string
  sourceUrl: string
  notes?: string
}

export function getUpdateLog(): UpdateLogEntry[]
export function getUpdateLogEntry(datasetId: string): UpdateLogEntry | undefined
```

**Inputs:** The `datasetRegistry` — no external data needed.  
**Outputs:** Sorted array of `UpdateLogEntry`, most-recently-updated first.

---

## Phase 1: CSV Export System

### Goal

Allow users to download any dataset or individual statistic as a CSV file directly from the browser. No server required — the CSV is assembled client-side from the JSON data already loaded.

Two export modes are needed:
- **Full dataset export** — all stats in a category, each with their series data
- **Single stat export** — one statistic's series data as a time series CSV

### Files To Create

| File | Purpose |
|------|---------|
| `src/lib/export.ts` | `buildCsvContent()`, `downloadCsv()`, `exportDataset()` |
| `src/components/ui/ExportButton.tsx` | Reusable export button component |

### Files To Modify

| File | Change |
|------|--------|
| `src/app/category/[slug]/page.tsx` | Add `<ExportButton>` in the page header area, passing the category's stats |
| `src/components/charts/LineChartCard.tsx` | Add a small export icon button in the card header to export that stat's series |
| `src/components/charts/BarChartCard.tsx` | Same as LineChartCard |
| `src/types/index.ts` | No changes needed — `Statistic` and `DataSeries` already have the right shape |

### Implementation Steps

**Step 1 — Create `src/lib/export.ts`**

Implement three functions:

`buildCsvContent(stats, options)` — builds a CSV string from a `Statistic[]`. Two CSV formats:

- Summary format (one row per stat): columns are `id`, `title`, `category`, `value`, `rawValue`, `unit`, `change`, `trend`, `lastUpdated`, `source`
- Series format (one row per data point per stat): columns are `id`, `title`, `seriesName`, `label`, `value`, `unit`

Default to series format when a single stat is passed with series data. Default to summary format for a full category export.

`downloadCsv(filename, csvContent)` — creates a `Blob`, assigns it a temporary object URL, clicks it programmatically, then revokes the URL. Standard browser download pattern, no libraries needed.

`exportDataset(stats, datasetLabel, options)` — calls `buildCsvContent` then `downloadCsv`. The filename should follow: `sa-data-hub_<datasetLabel>_<YYYY-MM-DD>.csv`.

CSV header row should include: `# SA Data Hub — <dataset> — Downloaded <date> — Source: sadatahub.vercel.app` as a comment row (prefixed with `#`), which is valid CSV and helps users track where the file came from.

**Step 2 — Create `src/components/ui/ExportButton.tsx`**

A `'use client'` component that accepts `stats: Statistic[]`, `label: string`, and an optional `variant: 'icon' | 'full'`. The icon variant is for chart cards (small, icon-only). The full variant is for category page headers (button with text "Download CSV"). On click, calls `exportDataset()`.

Use `lucide-react`'s `Download` icon (already available). Style using the existing `.card` border treatment and brand colours.

**Step 3 — Integrate into category pages**

In `src/app/category/[slug]/page.tsx`, the page header already has the category title, description, and freshness indicator. Add an `<ExportButton stats={stats} label={category.label} variant="full" />` to the right of the header. The component must be marked `'use client'` since it triggers a browser download — wrap it in a client boundary or keep the export button in a separate client component file.

**Step 4 — Integrate into chart cards**

Both `LineChartCard` and `BarChartCard` accept `series` props. Pass through the parent stat's id/title so the export button can generate a per-stat CSV. Add a small `Download` icon in the top-right corner of the card header, inside the existing card chrome.

### Risks

- **Server component / client component boundary.** Category pages are server components. `ExportButton` must be `'use client'` because `downloadCsv` uses browser APIs (`Blob`, `URL.createObjectURL`). Pass `stats` as a serialisable prop from the server component — all `Statistic` fields are JSON-serialisable. Do not pass functions as props across the boundary.
- **Large series data.** Interest rates has 26 data points, labour force has 24. These are small and safe. If future datasets have hundreds of points, the CSV generation is still O(n) and safe for browser-side processing.
- **File naming collisions.** Include the ISO date in the filename to avoid stale files in the user's downloads folder.
- **Unit heterogeneity in full-category exports.** A GDP category export mixes `%` and `ZAR billion` stats. The CSV column header should include the unit per row, not assume it's uniform.

---

## Phase 2: Download Center

### Goal

A dedicated `/downloads` page where users can see all available datasets, their last-updated date, their source, and download any of them as a CSV with one click. This is the "front door" for researchers and journalists who come specifically for the data, not the visualisations.

### Files To Create

| File | Purpose |
|------|---------|
| `src/app/downloads/page.tsx` | Download Center page |
| `src/lib/registry.ts` | Dataset registry (shared with Phases 3 and 4) |

### Files To Modify

| File | Change |
|------|--------|
| `src/components/layout/Navbar.tsx` | Add "Downloads" link to `navLinks` array |
| `src/components/layout/Footer.tsx` | Add "Downloads" link in the Platform column |
| `src/data/mock.ts` | Re-export `statistics` and `getStatsByCategory` (already exported — no change needed) |

### Implementation Steps

**Step 1 — Create `src/lib/registry.ts`**

This is the most important file in V4. Build `datasetRegistry` as a static array of `DatasetRegistryEntry` objects. Populate it by reading from the existing `categories` array (for labels/descriptions), the existing `statistics` array (for stat IDs, lastUpdated, units), and the existing `_meta` blocks (for automation level, update frequency).

The `lastUpdated` field for a registry entry should be computed as `Math.max(...statIds.map(id => new Date(getStatById(id)?.lastUpdated).getTime()))` — the most recent update across all stats in the dataset.

Initial registry entries (11 datasets):

| id | label | automationLevel | updateFrequency |
|----|-------|----------------|----------------|
| unemployment | Unemployment | auto | Quarterly |
| youth-unemployment | Youth Unemployment | auto | Quarterly |
| labour-force | Labour Force Participation | auto | Quarterly |
| inflation | Inflation & Prices | auto | Monthly |
| gdp | GDP & Economy | auto | Quarterly |
| interest-rates | Interest Rates | semi-auto | ~Bi-monthly (MPC) |
| crime | Crime | manual | Annual |
| education | Education | manual | Annual |
| population | Population | auto | Annual |
| housing | Housing | manual | Annual |
| census | Census 2022 | static | Decennial |

**Step 2 — Create `src/app/downloads/page.tsx`**

This is a server component. It imports `datasetRegistry` from `src/lib/registry.ts` and `getStatsByCategory` from `src/data/mock.ts`.

Page layout (follow the existing category page structure):
- Page header with title "Data Downloads" and a short description
- A `FreshnessIndicator`-style summary row at the top showing total datasets and last overall update date
- A grid of `DatasetDownloadCard` components (one per registry entry)

Each `DatasetDownloadCard` shows:
- Dataset label and description
- Source name (linked to source URL)
- Last updated date (using `formatDate()` from `src/lib/utils.ts`)
- Update frequency badge
- Automation level badge (colour-coded: green=auto, amber=semi-auto, slate=manual, teal=static)
- Stat count (e.g. "4 indicators")
- A "Download CSV" button (the `ExportButton` component from Phase 1)

The card passes the stats for that dataset by calling `getStatsByCategory(entry.categoryId)` in the server component, then passing them to the client `ExportButton`.

**Step 3 — Add navigation links**

In `Navbar.tsx`, add `{ href: '/downloads', label: 'Downloads' }` to the `navLinks` array. Position it between Insights and Provinces. In `Footer.tsx`, add a Downloads link in the Platform section.

### Risks

- **The server/client split applies here too.** The page itself is a server component. `ExportButton` is a client component. Avoid wrapping the entire page in `'use client'` — only the button needs it.
- **Category ID vs dataset ID mismatch.** In the registry, some datasets (youth-unemployment, labour-force, interest-rates) have their own files but share a `categoryId` with a parent category (all map to `unemployment` or `gdp`). The registry entry's `id` should match the JSON filename stem, not the `categoryId`, so that `getStatsByCategory` is not the right call for sub-datasets. Use a `statIds` array in the registry entry and call `getStatById()` for each, or introduce a `getStatsByIds(ids: string[])` helper in `mock.ts`.
- **"Download all" feature.** A single "Download all datasets" button is appealing but produces a multi-sheet experience that plain CSV cannot represent. Do not implement this in V4 — keep it per-dataset.

---

## Phase 3: Citation Generator

### Goal

Let users generate a properly formatted academic citation for any dataset with one click, in APA or Harvard style. The citation should be copyable with a single button. This makes SA Data Hub suitable for student research and academic use.

### Files To Create

| File | Purpose |
|------|---------|
| `src/lib/citation.ts` | `generateCitation()`, `generateDatasetCitation()` |
| `src/components/ui/CitationWidget.tsx` | UI: style selector, formatted citation, copy button |

### Files To Modify

| File | Change |
|------|--------|
| `src/app/downloads/page.tsx` | Add `<CitationWidget>` to each `DatasetDownloadCard` (expandable) |
| `src/app/category/[slug]/page.tsx` | Add `<CitationWidget>` below the `FreshnessIndicator` |

### Implementation Steps

**Step 1 — Create `src/lib/citation.ts`**

Both APA 7th edition and Harvard require: author (organisation), year, title, type/medium, URL, access date.

**APA 7th format:**
```
Statistics South Africa. (2026). Quarterly Labour Force Survey Q4 2025 [Dataset]. Statistics South Africa. https://www.statssa.gov.za/?page_id=1854&PPN=P0211
```

**Harvard format:**
```
Statistics South Africa (2026) Quarterly Labour Force Survey Q4 2025 [Dataset]. Available at: https://www.statssa.gov.za/?page_id=1854&PPN=P0211 (Accessed: 1 June 2026).
```

The function logic:
1. Extract `source.name` as the author/organisation.
2. Use `source.publicationDate ?? stat.lastUpdated` to get the year.
3. Use `source.publicationName ?? stat.title` as the publication/dataset title.
4. Use `source.url` as the URL.
5. Use `accessedDate ?? today's date` as the access date.
6. Assemble the string according to the style template.

Note the source field inconsistency: some stats use `release` instead of `publicationName`. In `generateDatasetCitation()`, fall back gracefully: `publicationName ?? release ?? title`.

**Step 2 — Create `src/components/ui/CitationWidget.tsx`**

A `'use client'` component that accepts `stat: Statistic` (or `stats: Statistic[]` for a full dataset — use the first stat's source in that case, since all stats in a category share a source).

UI structure:
- A collapsed trigger: "Cite this dataset" link with a `Quote` icon (lucide-react)
- On expand (local `useState`): show a tab switcher for APA / Harvard
- The formatted citation text in a `<pre>` or `<code>` block with monospace font (`font-mono` — already in Tailwind config)
- A "Copy" button that calls `navigator.clipboard.writeText()` and shows a brief "Copied!" confirmation using a `setTimeout` state toggle

Style: use the existing `card` class for the widget container. The copy button should use the existing `btn-secondary` class pattern from the existing buttons (the codebase uses inline Tailwind rather than a `btn-secondary` class, but match the visual style of the existing secondary action buttons in `FreshnessIndicator.tsx`).

**Step 3 — Integrate**

On the category page, place `<CitationWidget stats={stats} />` immediately below the `FreshnessIndicator`, before the overview cards. On the downloads page, collapse it inside each `DatasetDownloadCard` with a "Show citation" toggle.

### Support: APA and Harvard

Citation construction from the existing metadata:

| Field | Source in data | Notes |
|-------|---------------|-------|
| Author | `stat.source.name` | Full org name |
| Year | `stat.source.publicationDate?.slice(0,4) ?? stat.lastUpdated.slice(0,4)` | Extract year only |
| Title | `stat.source.publicationName ?? stat.title` | Publication name preferred |
| Medium | `[Dataset]` | Hardcoded |
| Publisher | `stat.source.name` | Same as author for govt data (per APA 7 guidance) |
| URL | `stat.source.url` | Direct link to the publication |
| Access date | Current date | Format differs by style |

### Risks

- **Citation standards evolve.** APA 7 and Harvard 2024 are the target. Do not attempt to cover Chicago, MLA, or Vancouver in V4 — the CitationStyle type should be extensible (`'APA' | 'Harvard' | string`) but only two cases implemented.
- **Multi-source datasets.** The GDP category includes both Stats SA stats and a SARB interest rate stat. When generating a category-level citation, use the source of the first (most representative) stat, and add a note in the `CitationWidget` UI that individual indicators may have different sources, linking to the Methodology page.
- **`navigator.clipboard` availability.** Clipboard API requires HTTPS and user interaction — both are true on Vercel. Add a fallback (select + copy) for older browsers, but it is not critical.

---

## Phase 4: Dataset Update Log

### Goal

A visible, public record of when each dataset was last updated, what the update frequency is, whether the update was automated or manual, and any notable notes. This builds trust and is genuinely useful for researchers who need to know whether data is current before citing it.

### Files To Create

| File | Purpose |
|------|---------|
| `src/app/updates/page.tsx` | Dataset Update Log page |
| `src/data/update-history.ts` | Hand-maintained changelog for notable data events |

### Files To Modify

| File | Change |
|------|--------|
| `src/lib/registry.ts` | Add `getUpdateLog()` function (export from the same registry module) |
| `src/components/layout/Navbar.tsx` | No nav change recommended — link from Downloads page and Footer only |
| `src/components/layout/Footer.tsx` | Add "Update Log" link in the Platform column |
| `src/components/ui/FreshnessIndicator.tsx` | Extract `getFreshness()` as a named export so update log can reuse it |

### Implementation Steps

**Step 1 — Create `src/data/update-history.ts`**

A hand-maintained array of notable update events. This is separate from the automated `lastUpdated` fields — it records significant data events worth calling out (a new quarter of data, a methodology change, a new dataset added).

```typescript
export interface UpdateHistoryEntry {
  date: string               // ISO date
  datasetId: string          // matches registry entry id
  datasetLabel: string
  type: 'data-update' | 'methodology-change' | 'new-dataset' | 'correction'
  summary: string            // one sentence
  source?: string            // optional: link to the official release
}

export const UPDATE_HISTORY: UpdateHistoryEntry[] = [
  {
    date: '2026-05-21',
    datasetId: 'inflation',
    datasetLabel: 'Inflation & Prices',
    type: 'data-update',
    summary: 'CPI data updated with April 2026 figures (Stats SA P0141, published 21 May 2026).',
    source: 'http://www.statssa.gov.za/?page_id=1854&PPN=P0141',
  },
  // ... add more as datasets are updated
]
```

Seed this file with entries for all current data based on the `lastUpdated` fields already in the JSON files.

**Step 2 — Add `getUpdateLog()` to `src/lib/registry.ts`**

Combines two data sources:
1. The `datasetRegistry` — one entry per dataset with its current `lastUpdated`, `updateFrequency`, `automationLevel`, `source`, `sourceUrl`, and `notes`
2. The `UPDATE_HISTORY` array — notable events, most recent first

Returns `UpdateLogEntry[]` sorted by `lastUpdated` descending.

**Step 3 — Create `src/app/updates/page.tsx`**

Server component. Layout follows the methodology page structure — a header section, then a timeline of updates.

Three sections on the page:

**Section A — Dataset Status Table**  
A summary table (or card grid for mobile) showing every dataset with:
- Dataset label
- Last updated (formatted with `formatDate()`)
- Relative date ("3 months ago" — reuse `formatRelativeDate()` from `FreshnessIndicator.tsx`)
- Update frequency
- Automation level (badge)
- Freshness status badge (reusing the `getFreshness()` function extracted from `FreshnessIndicator.tsx`)

Sort by `lastUpdated` descending by default.

**Section B — Change History Timeline**  
A vertical timeline of `UPDATE_HISTORY` entries. Group by month. Each entry shows: date, dataset label, type badge, summary text, and an optional link to the official source. Use the existing `HistoricalTimeline.tsx` visual style as a reference, but implement a simpler version since this is structured data rather than overlaid chart annotations.

**Section C — Automation Notes**  
A brief section explaining which datasets update automatically vs manually, linking to the Methodology page for full detail. This section can reuse the existing methodology page's SOURCES data.

**Step 4 — Update the Python scripts to write to update-history**

This is optional for V4 but worth planning: when `save_dataset()` in `scripts/utils.py` is called with changed data, it could append a JSON entry to a `src/data/update-log.json` file. In V4, the hand-maintained `.ts` file is fine. In V5, this automation would make the log self-maintaining.

### Risks

- **`formatRelativeDate()` is currently private inside `FreshnessIndicator.tsx`**. Extract it as a named export from `src/lib/utils.ts` rather than duplicating it in the update log page.
- **Stale log entries.** If the hand-maintained `update-history.ts` is not updated when datasets are refreshed, the log becomes misleading. Mitigate by linking the `lastUpdated` fields in the registry — those are always accurate — and treating the history file as optional supplementary detail.
- **Page discoverability.** The update log is primarily for power users and researchers. Do not add it to the main navbar — link it from the Downloads page, the Methodology page, and the Footer.

---

## Dependency Review

### Existing dependencies (no additions needed for core V4)

| Package | Version | V4 Use |
|---------|---------|--------|
| `next` | 14.2.3 | App Router, static generation, server components |
| `react` / `react-dom` | ^18 | Client components, state, effects |
| `lucide-react` | ^0.383.0 | `Download`, `Quote`, `Copy`, `Check` icons for V4 UI |
| `clsx` + `tailwind-merge` | ^2.x | `cn()` for conditional classes |
| `next-themes` | ^0.3.0 | Dark/light theme — no V4 changes |
| `recharts` | ^2.12.7 | Charts — no V4 changes |
| `@vercel/analytics` | ^2.0.1 | Analytics — no V4 changes |

### No new dependencies required

All four V4 features are implementable with zero new npm dependencies:

- **CSV export** — `Blob`, `URL.createObjectURL`, string concatenation. Native browser APIs.
- **Download Center** — pure React + Tailwind.
- **Citation Generator** — string formatting. No library needed.
- **Update Log** — static data + React. No library needed.

### If a future AI session considers adding dependencies — advice

- Do **not** add `xlsx` or `csv-parser` for CSV export. The data is already structured as TypeScript objects. A library adds bundle size with zero benefit.
- Do **not** add `citation-js` or similar. The citation formats are simple enough to implement in 30 lines.
- Do **not** add `react-table` for the update log table. Tailwind + semantic HTML is sufficient for a simple status table.

---

## Scalability Review

The Dataset Registry abstraction is specifically designed to accommodate future datasets without touching V4 feature code.

### Adding electricity datasets

Electricity (Eskom/NERSA load-shedding, generation capacity) would follow the same pattern as existing datasets:
1. Create `src/data/datasets/electricity.json` with `_meta` and `statistics` array
2. Add a `CategoryId` of `'electricity'` to `src/types/index.ts`
3. Add the category to `categories[]` in `mock.ts`, import and spread the statistics
4. Add an entry to `datasetRegistry` in `src/lib/registry.ts`
5. The Downloads page, Update Log, Citation Widget, and Export button all work immediately with zero changes

The only complication is that Eskom has no public API. The update script would be `automation: 'manual'`. The registry handles this gracefully with the `automationLevel` field.

### Adding health datasets

Same pattern. A `'health'` `CategoryId`, new JSON files, registry entries. Health data (life expectancy, HIV prevalence) comes from Stats SA's General Household Survey and the South African Health Survey — both are annual releases, similar to housing data already present.

### Adding water access datasets

Already partially present. `housing-access-piped-water` exists in `housing.json`. A dedicated water dataset would extract this into its own file and category, following the exact same pattern as the youth-unemployment dataset was split out from the main unemployment dataset.

### Adding municipality-level datasets

This is the most architecturally significant future addition. The current data model has province-level granularity. Municipality data would require:
1. A `Municipality` type alongside `Province` in `src/types/index.ts`
2. A `municipalities.json` similar to `provinces.json`
3. New pages at `/municipalities` and `/municipalities/[id]`

The registry abstraction handles this as just another dataset type. The CSV export, citation, and update log all work immediately.

### Adding future analytics features (cross-dataset comparison, correlations)

The current data model already supports this. `statistics[]` is a flat array with `categoryId` for grouping and `series[].data[]` for time series. A cross-dataset comparison page would call `getStatById()` for multiple IDs and render them on the same `Recharts` `<ComposedChart>`. No data model changes needed.

---

## Technical Debt and Refactoring Opportunities

Only items with meaningful long-term value are listed here.

### 1. Source field inconsistency (medium priority — do before V4 ships)

Some stats use `source.publicationName` + `source.publicationDate` (unemployment, inflation, gdp, crime, education, population, housing, census). Others use `source.release` (youth-unemployment, interest-rates, labour-force). The `DataSource` type only defines `publicationName` and `publicationDate` — `release` is an undeclared field.

**Fix:** Update `DataSource` in `src/types/index.ts` to include `release?: string`. Then update `generateDatasetCitation()` to fall back: `publicationName ?? release ?? title`. This is a 5-minute fix that prevents the citation generator from silently outputting incomplete citations.

### 2. `UPDATE_FREQUENCY` hardcoded in category page (low priority — resolved by registry)

In `src/app/category/[slug]/page.tsx` there is a local `UPDATE_FREQUENCY` constant mapping category IDs to strings. This is the only place in the frontend that has this information. Once the `datasetRegistry` in `src/lib/registry.ts` is created, the category page should read from the registry instead of this local constant. This removes a duplication risk when new datasets are added.

### 3. `getFeaturedStats()` uses a hardcoded ID list (low priority)

In `src/data/mock.ts`, `getFeaturedStats()` hardcodes 6 stat IDs. This is fine for now but should eventually be driven by a `featured: true` field on the JSON stats or registry entry, so the featured set can be changed without touching application code. Not blocking for V4.

### 4. `FreshnessIndicator` internal helper functions are not exported (do before Phase 4)

`getFreshness()`, `formatRelativeDate()`, and `formatAbsoluteDate()` are defined inside `FreshnessIndicator.tsx` but not exported. The Update Log page needs `getFreshness()` and `formatRelativeDate()`. Move them to `src/lib/utils.ts` as named exports before building Phase 4.

### 5. Province page is `'use client'` entirely (low priority)

`src/app/provinces/page.tsx` is a client component for sorting state. This means the static data is bundled client-side rather than rendered on the server. For a small dataset this is fine, but worth noting. A future refactor could use server components for the data layer and a client island for the sort controls.

---

## Recommended Implementation Order

### Order and rationale

**1. Refactor prep (1–2 hours)**
- Fix the source field inconsistency (`release` vs `publicationName`) in `src/types/index.ts`
- Extract `getFreshness()`, `formatRelativeDate()`, `formatAbsoluteDate()` from `FreshnessIndicator.tsx` into `src/lib/utils.ts`

This is the minimal prep needed. It prevents rework in later phases.

**2. Phase 1 — Dataset Registry + CSV Export**
- Create `src/lib/registry.ts` with `datasetRegistry` and `getUpdateLog()`
- Create `src/lib/export.ts`
- Create `src/components/ui/ExportButton.tsx`
- Integrate into category pages and chart cards

This is the foundation. The registry is consumed by every subsequent phase. Export is the highest-value user-facing feature and establishes the server/client split pattern that Phases 2–4 follow.

**3. Phase 2 — Download Center**
- Create `src/app/downloads/page.tsx`
- Add nav links

Depends on Phase 1's `ExportButton` and the `datasetRegistry`. Can be built immediately after Phase 1.

**4. Phase 3 — Citation Generator**
- Create `src/lib/citation.ts`
- Create `src/components/ui/CitationWidget.tsx`
- Integrate into category pages and download center

Depends only on the existing `Statistic.source` shape. Can be built in parallel with Phase 2 if two sessions are running.

**5. Phase 4 — Dataset Update Log**
- Create `src/data/update-history.ts` (seed with current data)
- Add `getUpdateLog()` to `src/lib/registry.ts`
- Create `src/app/updates/page.tsx`
- Add footer link

Depends on the registry (Phase 1) and the utility extractions (prep step). Build last because it requires the registry to be stable.

**Why this order minimises risk:**
- The registry is created once and never restructured — all features depend on it being right.
- CSV export is pure logic with no UI dependencies, so it can be validated before any pages are built.
- The Download Center is a new page with no risk of breaking existing pages.
- Citation and update log are additive — they add new components and pages without modifying existing rendering paths.

---

## Notes for Future AI Sessions

This section is written specifically for an AI assistant that will continue V4 implementation without re-reading the full codebase.

### What you need to know before writing any code

**The project has no backend.** All data is static JSON imported at build time. Do not introduce `fetch()`, API routes, or server-side data fetching for V4. Everything should be pure TypeScript functions operating on imported data.

**Server components vs client components.** Most app pages are server components (no `'use client'`). Only interactive components need `'use client'`. For V4: `ExportButton`, `CitationWidget`, and any component with `useState` must be client components. Pass serialisable data (plain objects/arrays, no functions) from server to client as props.

**The central data file is `src/data/mock.ts`.** It imports all JSON datasets and exports helper functions. When adding a new dataset, follow the exact pattern already there: import the JSON, spread into `statistics[]`, add a helper if needed.

**The `_meta` blocks in JSON files are the source of truth for dataset metadata.** They contain `source`, `source_url`, `update_frequency`, `last_verified`, `notes`. The registry should read from the statistics in memory (which come from the JSON) rather than re-reading the JSON files.

**The `DataSource` type has an inconsistency** — some stats use `source.release` (undeclared field) while the type only defines `publicationName`. Fix this in `src/types/index.ts` before building the citation generator.

**CSS classes to use.** Use `.card` for card containers, `.container-page` for page width, `.heading-display` for headings, `font-mono` for data values, `font-display` for display headings. Do not replicate these inline.

**Brand colour.** The brand colour is a deep green (HSL `142 76% 36%`) — Tailwind class `brand-600`. The accent is gold (`gold-500`). Do not use indigo or blue as primary colours — those are not part of the design system.

**lucide-react icons available** (v0.383.0). For V4 features: `Download`, `Quote`, `Copy`, `Check`, `Clock`, `RefreshCw`, `CheckCircle`, `AlertTriangle`, `AlertCircle` — all already used in the project or available in this version.

### Conventions to preserve

- All TypeScript interfaces live in `src/types/index.ts`. Do not define types locally in component or lib files.
- All data helper functions live in `src/data/mock.ts`. New helpers (e.g. `getStatsByIds`) should be added there.
- All pure utility functions live in `src/lib/utils.ts`. Date formatting, class merging, trend helpers all belong there.
- All feature-specific logic lives in dedicated `src/lib/` files (insights.ts, explanations.ts, search.ts). Follow this pattern: `src/lib/export.ts`, `src/lib/citation.ts`, `src/lib/registry.ts`.
- File names use kebab-case for routes and PascalCase for components.
- All components use Tailwind utility classes; inline `style` props are used only for dynamic/computed values.

### Files that should not be heavily modified

| File | Reason |
|------|--------|
| `src/data/datasets/*.json` | These are data files. Only modify field values, never restructure the schema |
| `src/types/index.ts` | Add fields carefully — many components destructure these types |
| `src/data/mock.ts` | Only add new imports and helper functions at the bottom |
| `src/app/layout.tsx` | Root layout — modifying fonts or providers has site-wide effects |
| `src/components/layout/ThemeProvider.tsx` | Theme is stable — do not touch |
| `src/lib/search.ts` | The synonym map is carefully tuned — do not restructure |

### Common pitfalls

1. **Do not add a `'use client'` directive to a page just because it has an interactive button.** Extract only the interactive part into a client component and keep the page server-rendered.
2. **Do not use `useEffect` to load data.** All data is already in scope via static imports. `useEffect` data fetching would require an API route that doesn't exist.
3. **The `statistics` array contains 34 stats across 11 datasets.** Some datasets share a `categoryId` (youth-unemployment and labour-force both use `categoryId: 'unemployment'`). When building the registry, group by the JSON filename stem, not by `categoryId`.
4. **`generateStaticParams()` is required for any new `[dynamic]` route.** If you add a route like `/updates/[id]`, implement `generateStaticParams()` or the build will fail.
5. **The project uses Next.js 14 App Router**, not Pages Router. All pages are in `src/app/`. There is no `src/pages/` directory. Do not create one.
6. **The `DataSource` field `release` is used in some JSON files but is not in the TypeScript type.** This will cause TypeScript errors if you try to access `stat.source.release`. Fix the type first.

### Implementation priorities if time is limited

If you can only do part of V4, build in this order:
1. `src/lib/registry.ts` — everything else depends on it
2. `src/lib/export.ts` + `ExportButton.tsx` — highest user value
3. `src/app/downloads/page.tsx` — the visible face of the export feature
4. `src/lib/citation.ts` + `CitationWidget.tsx` — lower effort, high credibility value
5. `src/app/updates/page.tsx` — lowest urgency, but builds trust

If only one thing gets built, build the registry and the CSV export. They deliver the most value and establish the patterns everything else follows.
