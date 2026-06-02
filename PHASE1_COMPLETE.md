# SA Data Hub V4 — Phase 1 Complete

**Generated:** 2026-06-01  
**Phase completed:** Refactor Prep + Phase 1 (Dataset Registry + CSV Export)  
**Based on:** SA_Data_Hub_V4_Handoff.md + full codebase audit of V4 project

---

## Status

| Item | Status |
|------|--------|
| Refactor Prep — extract freshness helpers to utils.ts | ✅ Done |
| Refactor Prep — FreshnessIndicator imports from utils.ts | ✅ Done |
| Refactor Prep — DataSource.release type fix | ✅ Already present in types/index.ts |
| Phase 1 — `src/lib/registry.ts` | ✅ Done |
| Phase 1 — `src/lib/export.ts` | ✅ Done |
| Phase 1 — `src/components/ui/ExportButton.tsx` | ✅ Done |
| Phase 1 — `src/data/mock.ts` (getStatsByIds added) | ✅ Done |
| Phase 1 — `src/components/charts/LineChartCard.tsx` | ✅ Done |
| Phase 1 — `src/components/charts/BarChartCard.tsx` | ✅ Done |
| Phase 1 — `src/app/category/[slug]/page.tsx` | ✅ Done |
| Phase 2 — Download Center | 🔜 Next |
| Phase 3 — Citation Generator | 🔜 Pending |
| Phase 4 — Dataset Update Log | 🔜 Pending |

---

## Files Created

| File | Purpose |
|------|---------|
| `src/lib/registry.ts` | Dataset Registry — central metadata hub for all V4 features |
| `src/lib/export.ts` | CSV export engine — `buildCsvContent`, `downloadCsv`, `exportDataset`, `exportSingleStat` |
| `src/components/ui/ExportButton.tsx` | Reusable export button — `ExportButton` (full/icon variants) + `ChartExportButton` |

---

## Files Modified

| File | What changed |
|------|-------------|
| `src/lib/utils.ts` | Added `FreshnessStatus` type + `getFreshness()`, `formatRelativeDate()`, `formatAbsoluteDate()` as named exports |
| `src/components/ui/FreshnessIndicator.tsx` | Removed locally-defined helpers; imports them from `src/lib/utils.ts`. Also renders `source.release` as fallback for `source.publicationName` in the display |
| `src/data/mock.ts` | Added `getStatsByIds(ids: string[]): Statistic[]` helper; bumped version comment to v4 |
| `src/components/charts/LineChartCard.tsx` | Added optional `stat?: Statistic` prop; renders `<ChartExportButton>` in card header when stat is provided |
| `src/components/charts/BarChartCard.tsx` | Same as LineChartCard |
| `src/app/category/[slug]/page.tsx` | Removed local `UPDATE_FREQUENCY` map; reads frequency from `getRegistryByCategory()`. Added `<ExportButton>` in header (desktop + mobile). Passes `stat={stat}` to chart cards |

---

## Files NOT Modified (by design)

| File | Reason |
|------|--------|
| `src/types/index.ts` | `DataSource.release` was already present — no change needed |
| `src/app/dashboard/page.tsx` | Out of scope for Phase 1 |
| `src/components/layout/Navbar.tsx` | No nav change for Phase 1; Downloads link added in Phase 2 |
| `src/components/layout/Footer.tsx` | Downloads/Updates links added in Phase 2 and Phase 4 |
| All dataset JSON files | Data is correct; no schema changes needed |
| All Python scripts | No changes needed for Phase 1 |

---

## Architectural Decisions

### 1. Registry IDs match JSON filename stems, not categoryIds

The handoff specified this and it was followed exactly. `youth-unemployment`, `labour-force`, and `interest-rates` all have their own registry entries despite sharing `categoryId` values (`unemployment` and `gdp`) with other datasets. This is essential for Phase 2's Download Center, where each file gets its own download card.

### 2. `getStatsByIds()` added to mock.ts instead of the registry reading directly

The registry imports `getStatById` from mock.ts. To avoid a circular import (`mock.ts → registry.ts → mock.ts`), `getStatsByIds` was added to mock.ts as a simple helper, and the registry reads through `getStatById` for individual lookups. The registry does not hold a reference to `statistics[]` directly.

**Important:** This means `registry.ts` depends on `mock.ts`, but NOT the reverse. The registry is a consumer of the data layer, not part of it.

### 3. `getUpdateLog()` is defined in registry.ts now (pre-built for Phase 4)

The handoff recommended placing `getUpdateLog()` in `registry.ts`. It's been implemented and returns `UpdateLogEntry[]` sorted by `lastUpdated` descending. Phase 4 can call `getUpdateLog()` directly from `src/app/updates/page.tsx` with no additional work.

### 4. ExportButton is a single file with two named exports

`ExportButton` (full/icon variants via prop) and `ChartExportButton` (single-stat shortcut) are co-located in `ExportButton.tsx`. The handoff described them as one "ExportButton component" — keeping them in one file reduces import complexity and the `ChartExportButton` is a thin wrapper that calls `exportSingleStat()`.

### 5. Category page keeps `stats` from `getStatsByCategory()` — no registry involvement

The category page passes `stats` (all stats for that category) to `ExportButton`. This exports all stats in the category (including sub-dataset stats like youth unemployment that share the category ID). This is correct behaviour for a "Download GDP & Economy data" button. Phase 2's Download Center will offer per-dataset exports using `getStatsByIds()`.

### 6. `FreshnessIndicator` now falls back to `source.release` in the display

The updated `FreshnessIndicator` renders `source.publicationName ?? source.release` when displaying the publication name. This fixes the silent omission for `interest-rates`, `labour-force`, and `youth-unemployment` stats that use `release` instead of `publicationName`.

---

## Deviations from the Original Handoff

### Deviation 1: DataSource.release type fix was already done

The handoff listed fixing `DataSource` to include `release?: string` as Refactor Prep step 1. **The fix was already present** in the project's `src/types/index.ts`. No change was required. This was confirmed by auditing the file directly.

### Deviation 2: No change to types/index.ts

The handoff said "no changes needed" to types for Phase 1. Confirmed — no changes were made.

### Deviation 3: Single `ExportButton.tsx` instead of separate icon/full components

The handoff described one component file. Followed exactly — one file, two named exports (`ExportButton` with variant prop, `ChartExportButton`).

---

## How Phase 1 integrates in the running app

After dropping in the modified/created files:

1. **Category pages** — each category page header now shows a "Download CSV" button. Clicking it downloads all statistics for that category as a CSV with series data. Chart cards each have a small download icon that exports that stat's time series only.

2. **No new pages** — Phase 1 is purely additive UI on existing pages plus new lib files.

3. **No new dependencies** — all CSV generation uses `Blob` and `URL.createObjectURL` (native browser APIs, no npm packages).

4. **No breaking changes** — all component props are backwards-compatible. The `stat` prop on chart cards is optional; charts without it render identically to before.

---

## Instructions for Phase 2: Download Center

### What Phase 2 requires (from the V4 handoff)

Phase 2 needs:
1. `src/lib/registry.ts` ← **Already done in Phase 1**
2. `src/components/ui/ExportButton.tsx` ← **Already done in Phase 1**
3. `getStatsByIds()` in `mock.ts` ← **Already done in Phase 1**
4. `src/app/downloads/page.tsx` ← **To build**
5. Nav + footer links ← **To update**

### Exact steps

**Step 1 — Create `src/app/downloads/page.tsx`** (server component)

```typescript
// Imports needed:
import { datasetRegistry, getEntryLastUpdated, getEntryStatCount, getEntryFreshness } from '@/lib/registry'
import { getStatsByIds } from '@/data/mock'
import { ExportButton } from '@/components/ui/ExportButton'
import { FreshnessIndicator } from '@/components/ui/FreshnessIndicator'
import { formatDate } from '@/lib/utils'
```

Page layout (follow `src/app/category/[slug]/page.tsx` structure):
- Page header: "Data Downloads" title + description
- Summary row: total datasets count, date of most recent update across all datasets
- Grid of `DatasetDownloadCard` components (one per `datasetRegistry` entry)

Each card:
- Dataset label + description
- Source name (linked) 
- `formatDate(getEntryLastUpdated(entry))` for last updated
- Update frequency badge
- Automation level badge (green=auto, amber=semi-auto, slate=manual, teal=static)
- `getEntryStatCount(entry)` stat count
- `<ExportButton stats={getStatsByIds(entry.statIds)} label={entry.label} />`

**CRITICAL:** The page is a server component. `ExportButton` is a client component. The pattern is already established in the category page — server component calls `getStatsByIds()`, passes the result as a prop to `ExportButton`. This works because `Statistic[]` is fully serialisable.

**Step 2 — Add nav links**

In `src/components/layout/Navbar.tsx`:
```typescript
const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/insights', label: 'Insights' },
  { href: '/downloads', label: 'Downloads' },   // ← add here
  { href: '/provinces', label: 'Provinces' },
  // ... Categories dropdown ...
  { href: '/methodology', label: 'Methodology' },
]
```

In `src/components/layout/Footer.tsx`, add to the Platform `ul`:
```typescript
{ label: 'Data Downloads', href: '/downloads' },
```

**Step 3 — No new types needed**

`DatasetRegistryEntry`, `AutomationLevel`, and the helper functions are already exported from `src/lib/registry.ts`. No additions to `src/types/index.ts` are needed for Phase 2.

### Watch out for

- **The `interest-rates` dataset has `repo-rate` as a stat ID.** The `inflation` dataset also includes a stat called `repo-rate` with the same ID. Check for duplicate stat IDs before the Download Center goes live — `getStatsByIds(['repo-rate', 'prime-lending-rate'])` for the interest-rates registry entry must resolve correctly. The current `mock.ts` spreads `inflationData` before `interestRatesData`, so a duplicate `repo-rate` ID would resolve to the inflation version. This was an existing data inconsistency in the project — worth auditing when building the Download Center.

- **`getStatsByIds` preserves order and silently drops unknown IDs.** It filters via `filter()` not `find()`, so registry entries with stale stat IDs will produce shorter-than-expected arrays without throwing.

- **The automation level badge colours** — use these Tailwind classes consistently:
  - `auto`: `bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-300`
  - `semi-auto`: `bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300`
  - `manual`: `bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300`
  - `static`: `bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-300`

---

## Instructions for Phase 3: Citation Generator

Phase 3 can be built in parallel with Phase 2. It has no dependency on Phase 2.

Dependencies already satisfied: `Statistic.source` shape, `DataSource` type (with `release` field), `formatDate()` in utils.

### Files to create:
- `src/lib/citation.ts` — `generateCitation()`, `generateDatasetCitation()`
- `src/components/ui/CitationWidget.tsx` — `'use client'`, style selector, copy button

### Key implementation note on `release` vs `publicationName`:
```typescript
// In generateDatasetCitation():
const title = stat.source.publicationName ?? stat.source.release ?? stat.title
const year = (stat.source.publicationDate ?? stat.lastUpdated).slice(0, 4)
```

Both fields are now in the `DataSource` type, so TypeScript will not complain about accessing `stat.source.release`.

---

## Instructions for Phase 4: Dataset Update Log

Phase 4 depends on Phase 1 (registry + `getUpdateLog()`). Both are complete.

### `getUpdateLog()` is already implemented in `src/lib/registry.ts`

The function returns `UpdateLogEntry[]` sorted by `lastUpdated` descending. Phase 4 only needs to:

1. Create `src/data/update-history.ts` (hand-maintained notable events array)
2. Create `src/app/updates/page.tsx` (server component calling `getUpdateLog()`)
3. Add footer link

### Extract `getFreshness()` and `formatRelativeDate()` reminder:
**Already done in Refactor Prep.** Both are named exports from `src/lib/utils.ts`. The `updates/page.tsx` can import them directly.

### The `FreshnessStatus` type:
Also exported from `src/lib/utils.ts` as `export type FreshnessStatus`. Import it from there, not from `FreshnessIndicator.tsx`.

---

## Quick Integration Checklist

When integrating Phase 1 files into the project:

- [ ] Copy `src/lib/utils.ts` (adds 3 new exports, safe to overwrite)
- [ ] Copy `src/lib/registry.ts` (new file)
- [ ] Copy `src/lib/export.ts` (new file)
- [ ] Copy `src/components/ui/ExportButton.tsx` (new file)
- [ ] Copy `src/components/ui/FreshnessIndicator.tsx` (modified — imports from utils)
- [ ] Copy `src/data/mock.ts` (adds `getStatsByIds`, safe to overwrite)
- [ ] Copy `src/components/charts/LineChartCard.tsx` (adds optional `stat` prop, backwards-compatible)
- [ ] Copy `src/components/charts/BarChartCard.tsx` (same)
- [ ] Copy `src/app/category/[slug]/page.tsx` (updated — reads registry for frequency, adds ExportButton)
- [ ] Run `npm run build` to verify TypeScript compilation
- [ ] Test: visit any category page, click "Download CSV", confirm download
- [ ] Test: click chart download icon, confirm single-stat series CSV downloads
