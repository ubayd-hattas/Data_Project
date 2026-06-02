# V4 Stabilization Complete

**Date:** 2026-06-02  
**Scope:** V4 Stabilization Release (Phase 1 export controls + Download Center stabilization).  
**Explicitly NOT included:** Dataset Update Log (Phase 4) and any search/census/municipality upgrades.

## What was done

### Duplicate Stat IDs (Critical)
Fixed duplicate stat IDs that caused registry lookups to shadow/unreach certain statistics.

**Renamed stat IDs**
- `repo-rate` → `repo-rate-sarb` in `interest-rates.json`
- `labour-force-participation` → `lfpr-overall` in `labour-force.json`

**Updated registry references**
- `labour-force` dataset `statIds` now use `lfpr-overall`
- `interest-rates` dataset `statIds` now use `repo-rate-sarb`

### Full Dataset CSV Downloads (Critical)
Fixed Download Center exports to include full time-series data (series mode) instead of summary-only headline rows.

**Change**
- Added `exportMode?: ExportMode` to `ExportButton`
- Download Center cards pass `exportMode="series"` so `buildCsvContent()` uses `mode: "series"`

Category page exports were intentionally left on auto-detection for backward compatibility.

### Provinces Dataset Integration (Critical)
Added `provinces.json` as a first-class dataset in the registry and Download Center.

**Registry**
- Added `provinces` entry to `datasetRegistry` with `geographicLevel: "provincial"` and dataset metadata fields.

**Export + citation**
- Implemented `buildProvinceCsvContent()` and `exportProvincesDataset()` in `src/lib/export.ts`
- Added `ProvincesExportButton` to `src/components/ui/ExportButton.tsx`
- Download Center renders the provinces card and uses the dedicated provinces export path.

### Download Center Metadata Upgrade (High)
Upgraded registry + Download Center UI to show:
- approximate file size
- exported row count (data point count)
- data coverage start/end (`seriesStart` → `seriesEnd`)
- geographic level (national vs provincial)
- notes/caveats (from dataset `_meta.notes`)

## Files

### Created
- `src/components/ui/ExportButton.tsx`
- `src/lib/export.ts`
- `src/lib/registry.ts`

### Modified
- `src/data/datasets/interest-rates.json` (repo-rate id rename)
- `src/data/datasets/labour-force.json` (labour-force-participation id rename)
- `src/lib/registry.ts` (duplicate statIds, new registry fields, provinces entry)
- `src/lib/export.ts` (provinces export CSV)
- `src/components/ui/ExportButton.tsx` (exportMode + ProvincesExportButton)
- `src/app/downloads/page.tsx` (exportMode wiring, metadata rendering, provinces card)
- `src/components/charts/LineChartCard.tsx` and `src/components/charts/BarChartCard.tsx` (export icon header layout)
- `src/app/category/[slug]/page.tsx` (category header export visibility/layout)

## Testing performed

1. **TypeScript/Next build**
   - `npm run build` succeeded (no TS errors).

2. **Duplicate stat ID audit (runtime/static validation)**
   - Node script scanned all dataset JSON `statistics[]` IDs.
   - Result: `duplicate stat IDs: 0`
   - Confirmed counts:
     - `repo-rate` = 1, `repo-rate-sarb` = 1
     - `labour-force-participation` = 1, `lfpr-overall` = 1

3. **Production HTML verification (no-click)**
   - Started production server (`npm run start`) and fetched HTML:
     - `/downloads`: verified presence of **Provinces** card and **Download CSV** button text.
     - `/category/unemployment`: verified header shows **Download CSV** and chart export controls exist in markup.

## Notes / Follow-ups for Phase 4
- Do **not** implement the Dataset Update Log yet (already intentionally excluded).
- Next likely follow-up after stabilization:
  - integrate Update Log UI and ensure registry `_meta.notes` are used consistently there as well.

