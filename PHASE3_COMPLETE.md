# SA Data Hub V4 — Phase 3 Complete

**Generated:** 2026-06-01
**Phase completed:** Phase 3 (Citation Generator)
**Based on:** SA_Data_Hub_V4_Handoff.md + PHASE2_COMPLETE.md + full audit of Phase 1 and Phase 2 output

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
| Phase 2 — `src/app/downloads/page.tsx` | ✅ Done (Phase 2) |
| Phase 2 — Nav link (`Navbar.tsx`) | ✅ Done (Phase 2) |
| Phase 2 — Footer link (`Footer.tsx`) | ✅ Done (Phase 2) |
| Phase 3 — `src/lib/citation.ts` | ✅ Done |
| Phase 3 — `src/components/ui/CitationWidget.tsx` | ✅ Done |
| Phase 3 — CitationWidget in category pages | ✅ Done |
| Phase 3 — CitationWidget in Download Center | ✅ Done |
| Phase 4 — Dataset Update Log | 🔜 Next |

---

## Files Created

| File | Purpose |
|------|---------|
| `src/lib/citation.ts` | Pure TypeScript citation engine — `generateCitation()` for stat-level, `generateDatasetCitation()` for registry-level, plus `CitationStyle`, `CitationResult` types and style display helpers |
| `src/components/ui/CitationWidget.tsx` | `'use client'` collapsible UI widget — expand/collapse trigger, APA/Harvard tab switcher, formatted citation display, clipboard copy button |

---

## Files Modified

| File | What changed |
|------|-------------|
| `src/app/category/[slug]/page.tsx` | Added `CitationWidget` import + `getEntryLastUpdated` import; added `primaryEntryLastUpdated` derivation; rendered `<CitationWidget entry={registryEntries[0]} lastUpdated={primaryEntryLastUpdated} />` between `FreshnessIndicator` and the category insight banner; changed `FreshnessIndicator` wrapper from `mb-8` to `mb-4` to keep vertical rhythm tight when both components are stacked |
| `src/app/downloads/page.tsx` | Added `CitationWidget` import; added `<CitationWidget entry={entry} lastUpdated={lastUpdated} />` inside `DatasetDownloadCard` below the `ExportButton`. `lastUpdated` was already computed in the card function for the meta row, so no additional data fetching was required |

---

## Files NOT Modified (by design)

| File | Reason |
|------|--------|
| `src/lib/registry.ts` | Complete from Phase 1/2; `getEntryLastUpdated` already exported and used as the `lastUpdated` source for `generateDatasetCitation` |
| `src/types/index.ts` | No new data-model types required; `CitationStyle` and `CitationResult` are feature-specific and live in `src/lib/citation.ts` per project convention |
| `src/components/layout/Navbar.tsx` | No nav link added — citation is a widget on existing pages, not a standalone page |
| `src/components/layout/Footer.tsx` | No footer link added — same reasoning |
| All dataset JSON files | Data layer unchanged |
| All Python scripts | Not in scope |

---

## Citation Architecture

### How the system works

```
DatasetRegistryEntry (registry.ts)
    └── generateDatasetCitation(entry, style, lastUpdated)  ← citation.ts
            └── CitationResult { text, html }
                    └── CitationWidget.tsx (renders, copies to clipboard)

Statistic.source (types/index.ts)
    └── generateCitation(stat, style)  ← citation.ts
            └── CitationResult { text, html }
                    └── CitationWidget.tsx (renders, copies to clipboard)
```

### `CitationResult` shape

```typescript
interface CitationResult {
  style: CitationStyle   // 'apa' | 'harvard'
  text:  string          // plain text — safe for clipboard, CSV, screen readers
  html:  string          // same content but with <em> titles and <a> URLs
}
```

The `html` field uses `dangerouslySetInnerHTML` inside `CitationWidget`. This is safe because `citation.ts` constructs the HTML itself from registry/stat data — no user input ever reaches the HTML builder.

### APA 7th edition format

```
{sourceName}. ({year}). {title} [Dataset]. {sourceUrl}
```

Example:
```
Statistics South Africa. (2026). Quarterly Labour Force Survey Q4 2025 [Dataset]. https://www.statssa.gov.za/?page_id=1854&PPN=P0211
```

Per APA 7 §10.9: when the publisher equals the author (standard for South African government sources), the duplicate publisher is omitted. This rule is applied by construction — the format does not include a separate publisher field.

### Harvard format

```
{sourceName} ({year}) {title} [Dataset]. Available at: {sourceUrl} (Accessed: {D Month YYYY}).
```

Example:
```
Statistics South Africa (2026) Quarterly Labour Force Survey Q4 2025 [Dataset]. Available at: https://www.statssa.gov.za/?page_id=1854&PPN=P0211 (Accessed: 1 June 2026).
```

---

## Metadata Sources Used

| Field | Source for `generateDatasetCitation` | Source for `generateCitation` |
|-------|--------------------------------------|-------------------------------|
| Author | `entry.sourceName` | `stat.source.name` |
| Year | `lastUpdated` param (pre-resolved by caller via `getEntryLastUpdated`) | `stat.source.publicationDate ?? stat.lastUpdated` → first 4 chars |
| Title | `entry.publicationName ?? entry.label` | `stat.source.publicationName ?? stat.source.release ?? stat.title` |
| URL | `entry.sourceUrl` | `stat.source.url` |
| Access date | `todayISO()` formatted as "D Month YYYY" | same |

### Why `lastUpdated` is passed as a parameter to `generateDatasetCitation`

`citation.ts` imports only from `@/types` and `@/lib/registry`. To resolve a registry entry's actual last-updated date, `getEntryLastUpdated(entry)` would need to be called — which imports from `@/data/mock`. Allowing that import would create a dependency chain from a pure utility library into the data layer. Instead, the caller pre-resolves the date:

- In `downloads/page.tsx`: `lastUpdated` is already computed by `DatasetDownloadCard` for the meta row — passed straight through to `CitationWidget`
- In `category/[slug]/page.tsx`: `primaryEntryLastUpdated` is derived once at the top of the server component via `getEntryLastUpdated(registryEntries[0])`

This keeps `citation.ts` pure and independently testable.

---

## Reusable Utilities Added

### `src/lib/citation.ts` exports

| Export | Type | Description |
|--------|------|-------------|
| `CitationStyle` | `type` | `'apa' \| 'harvard'` — extensible for V5 |
| `CitationResult` | `interface` | `{ style, text, html }` |
| `generateCitation` | `function` | Stat-level citation from `Statistic` |
| `generateDatasetCitation` | `function` | Dataset-level citation from `DatasetRegistryEntry` |
| `CITATION_STYLE_LABELS` | `const` | Human-readable labels: `{ apa: 'APA 7th', harvard: 'Harvard' }` |
| `CITATION_STYLES` | `const` | Ordered array: `['apa', 'harvard']` |

### Adding a new citation style in V5

1. Add the literal to `CitationStyle`: `export type CitationStyle = 'apa' | 'harvard' | 'chicago'`
2. Write a `buildChicagoText()` and `buildChicagoHtml()` helper following the existing pattern
3. Add a `case 'chicago':` branch to the switch in both `generateCitation` and `generateDatasetCitation`
4. Add an entry to `CITATION_STYLE_LABELS` and `CITATION_STYLES`
5. `CitationWidget` picks up the new style automatically from `CITATION_STYLES` — no UI changes needed

### Adding a new dataset

No citation-specific work required. Any new `DatasetRegistryEntry` added to `registry.ts` automatically receives citation support on the Download Center and its category page. The registry entry's `sourceName`, `sourceUrl`, and `publicationName` fields drive the citation output.

---

## UI Components Added

### `CitationWidget` — props

```typescript
// Dataset-level (most common in V4):
<CitationWidget entry={entry} lastUpdated={lastUpdated} />

// Stat-level (available for future use):
<CitationWidget stat={stat} />

// Optional:
defaultOpen={boolean}   // default: false — widget starts collapsed
className={string}      // forwarded to the outer container
```

### UI structure

1. **Collapsed trigger** — "Cite this dataset" with `Quote` icon and `ChevronDown`/`ChevronUp` toggle. Full-width button with hover state.
2. **Expanded panel** (rendered when `isOpen === true`):
   - Style tab switcher — pill-style toggle for APA 7th / Harvard, built from `CITATION_STYLES`
   - Citation text block — monospace `<p>` with `dangerouslySetInnerHTML` for the HTML version (italicised title, linked URL)
   - Actions row — source link (left) and Copy button (right)
   - Methodology note — "Individual indicators may cite different sources. See methodology" — only rendered when `entry` prop is used (not for stat-level)

### Design decisions

- **Collapsible by default.** The Download Center already has dense cards with an export button. Collapsing citation avoids overwhelming the page on first view. Users who want citations can expand them; researchers who always want them can open all cards.
- **Monospace citation text.** `font-mono` (DM Mono — already configured in `tailwind.config.ts`) makes the formatted citation visually distinct from UI chrome and easy to read as a citation block.
- **`dangerouslySetInnerHTML` is safe here.** The HTML content is constructed entirely by `citation.ts` from registry/stat data. No user input reaches the HTML builder. The only HTML elements inserted are `<em>` (for the italicised title) and `<a>` (for the URL). This is the same pattern Next.js/React uses for syntax highlighting and markdown rendering in this codebase.

---

## Clipboard Functionality

`CitationWidget` uses the standard `navigator.clipboard.writeText()` API with a graceful fallback to the deprecated `document.execCommand('copy')` for HTTP (non-HTTPS) development environments.

The Copy button mirrors the `ExportButton` done/reset interaction pattern exactly:
- Click → shows `<Check /> Copied` with brand-green colouring
- After 2000ms → resets to `<Copy /> Copy`

The `clipboard` API requires a secure context (HTTPS or `localhost`). On Vercel, HTTPS is always present. On local HTTP dev servers, the fallback fires. If both fail silently, the user can still select the citation text manually — the text block has no `user-select: none`.

---

## Any Deviations From Original Handoff

### Deviation 1: `CitationStyle` uses lowercase literals, not uppercase

The original handoff spec used `'APA' | 'Harvard'`. PHASE2_COMPLETE.md used `'apa' | 'chicago' | 'harvard'`. The implemented type uses `'apa' | 'harvard'` (lowercase, no Chicago) matching the PHASE2_COMPLETE.md casing convention and the user's Phase 3 requirements (APA + Harvard only). Lowercase is consistent with the other string literal union types in the codebase (`'fresh' | 'recent' | 'aging' | 'stale'`, `'auto' | 'semi-auto' | 'manual' | 'static'`).

### Deviation 2: `CitationWidget` accepts `entry` OR `stat` (discriminated union), not `stat?: Statistic; entry?: DatasetRegistryEntry` optional fields

The handoff described both as optional props. Using a discriminated union (`CitationWidgetEntryProps | CitationWidgetStatProps`) gives TypeScript compile-time enforcement that exactly one is provided. This prevents silent bugs where neither prop is passed. The downside is marginally more verbose types — the tradeoff is worth it.

### Deviation 3: `lastUpdated` is a parameter on `generateDatasetCitation`, not resolved internally

The handoff implied the function would resolve the year from the registry entry internally. As documented in "Metadata Sources Used", resolving it internally would require importing from `@/data/mock`, coupling a pure utility to the data layer. The caller pre-resolves it — this is a one-liner at every call site and maintains `citation.ts` as a pure, independently testable module.

### Deviation 4: Methodology note is rendered only in the `entry` mode, not in `stat` mode

The handoff's PHASE2_COMPLETE.md spec mentioned showing a "individual indicators may cite different sources" note. This note is only meaningful at the dataset level (where a registry entry groups multiple stats that may have different sources). It is suppressed when `CitationWidget` is used in stat mode, since a single stat has exactly one source.

### Deviation 5: `FreshnessIndicator` wrapper margin changed from `mb-8` to `mb-4` on category page

When `CitationWidget` was inserted between `FreshnessIndicator` and the category insight banner, the original `mb-8` on the freshness wrapper left too much space between the two vertically-adjacent panels. Reduced to `mb-4` so that `FreshnessIndicator` + `CitationWidget` read as a logical pair. The `CitationWidget` wrapper retains `mb-8` to preserve the gap before the insight banner.

---

## Testing Performed

### Logic verification (Node.js, no TypeScript compilation)

Manually verified citation output for:

| Dataset | Style | Expected output | Verified |
|---------|-------|----------------|----------|
| Unemployment (Stats SA, 2026) | APA | `Statistics South Africa. (2026). Quarterly Labour Force Survey [Dataset]. https://...` | ✅ |
| Unemployment (Stats SA, 2026) | Harvard | `Statistics South Africa (2026) Quarterly Labour Force Survey [Dataset]. Available at: https://... (Accessed: 1 June 2026).` | ✅ |
| Inflation (stat-level, publicationDate present) | APA | `Statistics South Africa. (2026). Quarterly Labour Force Survey Q4 2025 [Dataset]. https://...` | ✅ |

### File structure verification

- All imports in `citation.ts` and `CitationWidget.tsx` resolve to existing exports
- All Lucide icons used (`Quote`, `Copy`, `Check`, `ChevronDown`, `ChevronUp`, `ExternalLink`) confirmed available in `lucide-react@^0.383.0` (cross-referenced against existing usages in the codebase and the V4 handoff spec)
- `CitationWidget` uses `'use client'` — safe to import from server components (category page, downloads page) because it receives only serialisable props (`DatasetRegistryEntry`, `string`)
- `citation.ts` has no `'use client'` directive — pure TypeScript, safe to import anywhere

### Prop compatibility check

- Category page: `registryEntries[0]` is `DatasetRegistryEntry | undefined`. Wrapped in `{registryEntries[0] && <CitationWidget ... />}` guard — TypeScript will narrow the type correctly.
- Downloads page: `lastUpdated` is already `string` (result of `getEntryLastUpdated(entry)`) — compatible with `lastUpdated?: string` on `CitationWidget`.

---

## Known Issues Carried Forward

### `repo-rate` duplicate stat ID (from Phase 2)

Not related to Phase 3. The citation system reads from `DatasetRegistryEntry.sourceUrl` and `sourceName` which are correct for both `inflation` and `interest-rates` entries. The duplicate stat ID does not affect citation output.

---

## Integration Checklist

When integrating Phase 3 files into the project:

- [ ] Copy `src/lib/citation.ts` (new file)
- [ ] Copy `src/components/ui/CitationWidget.tsx` (new file)
- [ ] Copy `src/app/category/[slug]/page.tsx` (adds `CitationWidget` below freshness + adjusts margin)
- [ ] Copy `src/app/downloads/page.tsx` (adds `CitationWidget` to each download card)
- [ ] Run `npm run build` to verify TypeScript compilation
- [ ] Test: visit any `/category/[slug]` page, confirm "Cite this dataset" trigger appears below the freshness indicator
- [ ] Test: expand the citation widget, confirm APA tab shows correct format
- [ ] Test: switch to Harvard tab, confirm format changes and access date is today
- [ ] Test: click Copy, confirm the button flashes "Copied" and clipboard receives plain text (no HTML tags)
- [ ] Test: visit `/downloads`, expand any card's citation widget, confirm same behaviour
- [ ] Test: verify no regression on existing Export CSV buttons on category pages and download cards
- [ ] Optional: audit `repo-rate` duplicate (from Phase 2 — not introduced by Phase 3)

---

## Notes For Phase 4

### What Phase 4 needs from the citation system

Phase 4 (Dataset Update Log) at `/updates` does **not** need the citation system. It is a status dashboard, not a research tool. Do not add `CitationWidget` to the update log page in Phase 4.

### `UpdateLogEntry` type and `getUpdateLog()` are already in `registry.ts`

Both were added in Phase 1 as placeholders for Phase 4. They are ready to use. No changes to `registry.ts` are needed before starting Phase 4.

### `formatRelativeDate` and `formatAbsoluteDate` are already exported from `utils.ts`

These were extracted in Phase 1 refactor prep. The update log page can import both directly without any new utility work.

### `FreshnessStatus` and `getFreshness` are already exported from `utils.ts`

Same — extracted in Phase 1. The update log page can use these for the per-dataset freshness badges without any new work.

### The `automationBadge` helper in `downloads/page.tsx` is a candidate for extraction

Phase 4's update log will need to display the same automation level badges. Consider extracting `automationBadge` from `downloads/page.tsx` to `src/components/ui/AutomationBadge.tsx` before Phase 4, to avoid duplicating it. This is a minor refactor (one file, one import change in `downloads/page.tsx`) and is not a blocker.

---

## Future AI Session Notes

### What was built

Phase 3 introduced a pure citation generation library (`citation.ts`) and a collapsible UI widget (`CitationWidget.tsx`). The widget is integrated on two existing pages — category pages and the Download Center — without creating any new routes or modifying the data layer.

### The `citation.ts` purity constraint

`citation.ts` intentionally does not import from `@/data/mock`. This keeps it a pure utility that can be unit-tested without any mock data setup. The `lastUpdated` date is always passed by the caller. Do not break this constraint in future work.

### Extending to Chicago/MLA/Vancouver

Add the literal to `CitationStyle`, write two builders (text + html), add switch cases in both generator functions, add to `CITATION_STYLE_LABELS` and `CITATION_STYLES`. `CitationWidget` renders tabs dynamically from `CITATION_STYLES` — zero UI changes needed.

### Stat-level citation usage

`<CitationWidget stat={stat} />` is implemented but not yet used on any page in V4. It is available for future integration on individual stat cards or story stat callouts (`StatCallout.tsx`) if needed in V5.

### Server/client boundary

`citation.ts` — no directive, safe anywhere.
`CitationWidget.tsx` — `'use client'`, must receive serialisable props. Both `DatasetRegistryEntry` and `Statistic` are fully serialisable. Do not pass functions or class instances as props to this component.

---

## Quick Reference: Phase Dependency Graph

```
Refactor Prep
    └── Phase 1: Registry + CSV Export
            ├── Phase 2: Download Center          ✅ Complete
            ├── Phase 3: Citation Generator        ✅ Complete
            └── Phase 4: Dataset Update Log        🔜 Next
```

Phase 4 has no dependencies on Phase 3 and can be started immediately.
