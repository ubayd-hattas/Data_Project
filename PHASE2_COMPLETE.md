# SA Data Hub V4 — Phase 2 Complete

**Generated:** 2026-06-01  
**Phase completed:** Phase 2 (Download Center)  
**Based on:** SA_Data_Hub_V4_Handoff.md + PHASE1_COMPLETE.md + full audit of Phase 1 output

---

## Status

| Item | Status |
|------|--------|
| Refactor Prep — extract freshness helpers to utils.ts | ✅ Done (Phase 1) |
| Refactor Prep — FreshnessIndicator imports from utils.ts | ✅ Done (Phase 1) |
| Refactor Prep — DataSource.release type fix | ✅ Already present (Phase 1) |
| Phase 1 — `src/lib/registry.ts` | ✅ Done (Phase 1) |
| Phase 1 — `src/lib/export.ts` | ✅ Done (Phase 1) |
| Phase 1 — `src/components/ui/ExportButton.tsx` | ✅ Done (Phase 1) |
| Phase 1 — `src/data/mock.ts` (getStatsByIds added) | ✅ Done (Phase 1) |
| Phase 1 — `src/components/charts/LineChartCard.tsx` | ✅ Done (Phase 1) |
| Phase 1 — `src/components/charts/BarChartCard.tsx` | ✅ Done (Phase 1) |
| Phase 1 — `src/app/category/[slug]/page.tsx` | ✅ Done (Phase 1) |
| Phase 2 — `src/app/downloads/page.tsx` | ✅ Done |
| Phase 2 — Nav link (`Navbar.tsx`) | ✅ Done |
| Phase 2 — Footer link (`Footer.tsx`) | ✅ Done |
| Phase 3 — Citation Generator | 🔜 Next |
| Phase 4 — Dataset Update Log | 🔜 Pending |

---

## Files Created

| File | Purpose |
|------|---------|
| `src/app/downloads/page.tsx` | Download Center — server component rendering one `DatasetDownloadCard` per registry entry, with summary stats in the page header |

---

## Files Modified

| File | What changed |
|------|-------------|
| `src/components/layout/Navbar.tsx` | Added `{ href: '/downloads', label: 'Downloads' }` to `navLinks` array between Insights and Provinces. Applies to both desktop dropdown nav and mobile menu automatically — both render from the same array. |
| `src/components/layout/Footer.tsx` | Added `{ label: 'Data Downloads', href: '/downloads' }` to the Platform `ul` between Data Stories and Province Explorer. |

---

## Files NOT Modified (by design)

| File | Reason |
|------|--------|
| `src/lib/registry.ts` | Already complete from Phase 1; no changes needed |
| `src/components/ui/ExportButton.tsx` | Already complete from Phase 1; used as-is |
| `src/data/mock.ts` | `getStatsByIds` already present from Phase 1; no changes needed |
| `src/types/index.ts` | No new types required for Phase 2 |
| All dataset JSON files | Data layer unchanged |
| All Python scripts | Not in scope |

---

## Architectural Decisions

### 1. `DatasetDownloadCard` is a server component function, not a separate file

The handoff described `DatasetDownloadCard` as a component to be built, but did not specify whether it should live in its own file. It was co-located in `downloads/page.tsx` as a local function component rather than extracted to `src/components/ui/`. Rationale: it is used in exactly one place, has no reuse surface, and its data-fetching calls (`getStatsByIds`, `getEntryLastUpdated`, etc.) are only meaningful in the context of this page. Extracting it would add import complexity for no benefit. If it is ever needed on another page, extract it at that point.

### 2. `getStatsByIds()` is called inside `DatasetDownloadCard`, not in the page root

Each card calls `getStatsByIds(entry.statIds)` independently. An alternative would have been to pre-fetch all stats at the page level and pass them down. The per-card approach was chosen because:

- It keeps the card self-contained and readable — the card owns all the data it needs
- The page root iterates `datasetRegistry` (11 entries); there is no N+1 concern with static imports
- It mirrors the pattern from the category page, where `ExportButton` receives its stats as a prop computed close to where it is used

The stat data all comes from the in-memory `statistics[]` array. There is no I/O cost to calling `getStatsByIds` multiple times.

### 3. `automationBadge` and `freshnessIcon` are local helper functions, not components

Both are render helpers that return JSX. They are not exported and not reused elsewhere. Defining them as plain functions (rather than components) keeps the file flat and avoids naming them in a way that implies they have lifecycle concerns or props beyond their single argument. If the badge or icon designs are ever used in Phase 4's update log page, extract them to `src/components/ui/` at that point.

### 4. Freshness is shown as an icon + inline text, not as a full `FreshnessIndicator`

The full `FreshnessIndicator` component (used on category pages) renders a multi-part pill with source attribution, relative date, and absolute date. That level of detail is inappropriate for a compact download card where space is constrained and the source is already displayed separately. A minimal icon + date string was used instead, using the same `FreshnessStatus` values and colour conventions as the full indicator.

### 5. Page header summary stats are derived at render time, not hardcoded

The "X datasets", "Y total indicators", and "most recent update" figures in the page header are computed from `datasetRegistry` and `getEntryStatCount()` on every render. They stay accurate automatically as datasets are added or stat counts change — no manual maintenance required.

### 6. No `generateStaticParams` required

`/downloads` is a static route (no dynamic segment), so Next.js 14 will statically render it at build time without any `generateStaticParams` call. This is consistent with all other non-dynamic pages in the project (`/dashboard`, `/methodology`, etc.).

---

## Deviations from the Original Handoff

### Deviation 1: No separate `DatasetDownloadCard` component file

The original handoff described building a `DatasetDownloadCard` component as part of the page. The handoff did not specify a file location, but implied it might be a standalone component. It was kept in `page.tsx` — see Architectural Decision 1 above.

### Deviation 2: `automationBadge` label for `auto` is "Auto-updated", not "Auto"

The handoff specified the Tailwind classes for automation badges but did not specify the label text. "Auto-updated" is more descriptive than a bare "Auto" for users reading the Download Center. The other labels follow the obvious conventions: "Semi-auto", "Manual", "Static".

### Deviation 3: Source row shows `publicationName` inline, not as a separate badge

The handoff described showing a `publicationName` on each card. Rather than a separate badge element, the publication name is rendered inline after the source link as `— Publication Name`. This is less visually busy and preserves space for the more actionable elements (freshness, frequency, export button).

---

## Known Issue: `repo-rate` Duplicate Stat ID

This was flagged in PHASE1_COMPLETE.md and remains unresolved. Both the `inflation` and `interest-rates` registry entries include `'repo-rate'` in their `statIds`. `getStatsByIds` uses `Array.filter`, which preserves order from `statistics[]`. Because `inflationData` is spread before `interestRatesData` in `mock.ts`, the `inflation` version of `repo-rate` will appear in the interest-rates download card.

**Impact on Phase 2:** The interest-rates CSV will include the inflation dataset's `repo-rate` stat, not the interest-rates dataset's. The data values may be identical (both sourced from SARB), but the source attribution in the CSV header will reference the inflation publication rather than the MPC Statement.

**Recommended fix before launch:** Rename the interest-rates stat ID from `repo-rate` to `repo-rate-mpc` (or similar) in both `interest-rates.json` and the registry entry's `statIds`. This requires a one-line change in each of:
- `src/data/datasets/interest-rates.json` — change the stat's `id` field
- `src/lib/registry.ts` — update `statIds` for the `interest-rates` entry
- Verify no other component references the old ID (search codebase for `'repo-rate'`)

---

## Integration Checklist

When integrating Phase 2 files into the project:

- [ ] Copy `src/app/downloads/page.tsx` (new file)
- [ ] Copy `src/components/layout/Navbar.tsx` (adds Downloads link)
- [ ] Copy `src/components/layout/Footer.tsx` (adds Data Downloads link)
- [ ] Run `npm run build` to verify TypeScript compilation
- [ ] Test: visit `/downloads`, confirm 11 dataset cards render
- [ ] Test: click Download CSV on any card, confirm CSV downloads with correct filename and content
- [ ] Test: confirm Downloads appears in desktop nav and mobile menu
- [ ] Test: confirm "Data Downloads" link appears in footer Platform section
- [ ] Optional: audit `repo-rate` duplicate (see Known Issue above)

---

## Instructions for Phase 3: Citation Generator

Phase 3 has no dependency on Phase 2 and can be built immediately.

### Dependencies already satisfied

- `Statistic.source` shape — present in `src/types/index.ts`
- `DataSource.release` field — already present (confirmed in Phase 1 audit)
- `formatDate()` — named export from `src/lib/utils.ts`
- `datasetRegistry` — available from `src/lib/registry.ts` (for dataset-level citations)
- `getStatsByIds()` — available from `src/data/mock.ts`

### Files to create

**`src/lib/citation.ts`** — Pure TypeScript, no client directive. Two exported functions:

```typescript
export type CitationStyle = 'apa' | 'chicago' | 'harvard'

export interface CitationResult {
  style: CitationStyle
  text: string        // plain text version for copy
  html: string        // HTML version with italics/links if desired
}

export function generateCitation(stat: Statistic, style: CitationStyle): CitationResult
export function generateDatasetCitation(entry: DatasetRegistryEntry, style: CitationStyle): CitationResult
```

Key implementation note for `generateCitation()` — the `release` vs `publicationName` field:

```typescript
// Both fields are present in the DataSource type (confirmed in Phase 1)
const publicationTitle = stat.source.publicationName ?? stat.source.release ?? stat.title
const year = (stat.source.publicationDate ?? stat.lastUpdated).slice(0, 4)
const accessDate = new Date().toISOString().slice(0, 10)
```

For `generateDatasetCitation()`, use the registry entry directly — it has `sourceName`, `publicationName`, `sourceUrl`, and `updateFrequency` all in one place, avoiding the need to resolve a stat.

**`src/components/ui/CitationWidget.tsx`** — Client component (`'use client'`). Props:

```typescript
interface CitationWidgetProps {
  // Either a single stat or a registry entry — not both
  stat?: Statistic
  entry?: DatasetRegistryEntry
  // Pre-fetched stats for dataset-level citation (passed from server component)
  // Only used when `entry` is provided
  defaultStyle?: CitationStyle
}
```

UI structure:
- Style selector: three tab-style buttons (APA / Chicago / Harvard). Use `useState` for the active style.
- Citation text block: monospaced, selectable, auto-updates when style changes
- Copy button: uses `navigator.clipboard.writeText()`. Same `done` state pattern as `ExportButton` — check icon for 2 seconds after copying.

Icons available in lucide-react@0.383.0: `Quote` (widget header), `Copy`, `Check` (copy confirmation).

### Where to integrate CitationWidget

**Category pages** (`src/app/category/[slug]/page.tsx`): Add a `<CitationWidget entry={registryEntries[0]} />` below the `FreshnessIndicator` and above the category insight banner. Pass the first registry entry for the category. For categories with multiple registry entries (e.g. unemployment has three: unemployment, youth-unemployment, labour-force), you may want to show one widget per entry — or a single widget for the primary entry only. The simplest approach is to use `registryEntries[0]` for V4 and iterate in V5 if needed.

**Download Center** (`src/app/downloads/page.tsx`): Add `<CitationWidget entry={entry} />` inside `DatasetDownloadCard`, below the Export button. The `entry` is already in scope. No `getStatsByIds` call needed — `generateDatasetCitation` uses the registry entry directly.

**No new pages required.** Citation is an additive widget on existing pages.

### Server/client split

`citation.ts` is pure logic — no directive needed. `CitationWidget.tsx` must be `'use client'` because it uses `useState` and `navigator.clipboard`. The server component (category page or downloads page) passes `entry` or `stat` as a serialisable prop. This is the same pattern as `ExportButton`.

### APA format reference

For a stat-level citation in APA style:
```
{sourceName}. ({year}). {publicationTitle} [{indicator}: {stat.title}]. Retrieved {accessDate}, from {sourceUrl}
```

For a dataset-level citation in APA style:
```
{entry.sourceName}. ({year}). {entry.publicationName ?? entry.label}. Retrieved {accessDate}, from {entry.sourceUrl}
```

Adapt structure for Chicago and Harvard — the same fields apply, the ordering and punctuation differ.

### Watch out for

- **Stats without a `publicationDate`** — most stats only have `lastUpdated`. Use `lastUpdated.slice(0, 4)` as the year fallback. Do not throw or return an empty string; the year is always resolvable this way.
- **`CitationWidget` inside a server component** — the server component must not import `CitationWidget` without the `entry` or `stat` prop being a plain serialisable object. Both `DatasetRegistryEntry` and `Statistic` are fully serialisable (no functions, no class instances), so this is safe.
- **`navigator.clipboard` requires HTTPS or localhost** — on the Vercel deployment this is fine. In local `http://` dev environments, the copy button may silently fail. A graceful fallback (select all text) is worth adding if the team tests on plain HTTP.
- **Do not add citation styles to `src/types/index.ts`** — `CitationStyle` and `CitationResult` are feature-specific types that belong in `src/lib/citation.ts`. The convention from the handoff is that `src/types/index.ts` holds data model types (`Statistic`, `DataSource`, etc.), not feature utility types.

---

## Quick Reference: Phase Dependency Graph

```
Refactor Prep
    └── Phase 1: Registry + CSV Export
            ├── Phase 2: Download Center          ✅ Complete
            ├── Phase 3: Citation Generator        🔜 Next (no Phase 2 dependency)
            └── Phase 4: Dataset Update Log        🔜 After Phase 3 or in parallel
```

Phase 3 and Phase 4 are independent of each other and can be built in either order or in parallel.
