/**
 * src/data/update-history.ts
 *
 * Dataset-level update events used by Phase 4's update log UI.
 * This complements (not replaces) live `lastUpdated` values derived from stats.
 */

export type UpdateHistoryType =
  | 'data-update'
  | 'methodology-change'
  | 'new-dataset'
  | 'correction'

export interface UpdateHistoryEntry {
  date: string
  datasetId: string
  datasetLabel: string
  type: UpdateHistoryType
  summary: string
  source?: string
}

export const UPDATE_HISTORY: UpdateHistoryEntry[] = [
  {
    date: '2026-05-31',
    datasetId: 'provinces',
    datasetLabel: 'Provinces',
    type: 'data-update',
    summary: 'Provincial unemployment and comparative indicators refreshed using the latest QLFS-aligned release.',
    source: 'https://www.statssa.gov.za/?page_id=1854&PPN=P0211',
  },
  {
    date: '2026-05-31',
    datasetId: 'unemployment',
    datasetLabel: 'Unemployment',
    type: 'data-update',
    summary: 'Metadata verification run completed for unemployment indicators and source attribution.',
    source: 'https://www.statssa.gov.za/?page_id=1854&PPN=P0211',
  },
  {
    date: '2026-05-31',
    datasetId: 'youth-unemployment',
    datasetLabel: 'Youth Unemployment',
    type: 'data-update',
    summary: 'Youth unemployment and NEET series validated against the latest QLFS publication.',
    source: 'https://www.statssa.gov.za/?page_id=1854&PPN=P0211',
  },
  {
    date: '2026-05-31',
    datasetId: 'labour-force',
    datasetLabel: 'Labour Force Participation',
    type: 'data-update',
    summary: 'Labour force participation indicators verified and aligned with QLFS metadata.',
    source: 'https://www.statssa.gov.za/?page_id=1854&PPN=P0211',
  },
  {
    date: '2026-05-31',
    datasetId: 'inflation',
    datasetLabel: 'Inflation & CPI',
    type: 'data-update',
    summary: 'Inflation dataset metadata validated for monthly CPI release tracking.',
    source: 'https://www.statssa.gov.za/?page_id=1854&PPN=P0141',
  },
  {
    date: '2026-05-31',
    datasetId: 'gdp',
    datasetLabel: 'GDP & Economic Growth',
    type: 'data-update',
    summary: 'GDP quarterly indicators and coverage range validated for registry consistency.',
    source: 'https://www.statssa.gov.za/?page_id=1854&PPN=P0441',
  },
  {
    date: '2026-05-31',
    datasetId: 'interest-rates',
    datasetLabel: 'Interest Rates',
    type: 'methodology-change',
    summary: 'Registry and lookup alignment updated for SARB repo/prime dataset identifier consistency.',
    source: 'https://www.resbank.co.za/en/home/what-we-do/monetary-policy/monetary-policy-decisions',
  },
  {
    date: '2025-05-01',
    datasetId: 'crime',
    datasetLabel: 'Crime Statistics',
    type: 'data-update',
    summary: 'Annual SAPS crime series refreshed with the latest published reporting cycle.',
    source: 'https://www.saps.gov.za/services/crimestats.php',
  },
  {
    date: '2025-01-15',
    datasetId: 'education',
    datasetLabel: 'Education',
    type: 'data-update',
    summary: 'NSC exam results and education indicators updated from latest DBE release.',
    source: 'https://www.education.gov.za/Informationfor/Examinationsresults.aspx',
  },
  {
    date: '2024-07-30',
    datasetId: 'population',
    datasetLabel: 'Population',
    type: 'data-update',
    summary: 'Population indicators aligned with latest mid-year population estimates publication.',
    source: 'https://www.statssa.gov.za/?page_id=1854&PPN=P0302',
  },
  {
    date: '2023-10-10',
    datasetId: 'housing',
    datasetLabel: 'Housing & Services',
    type: 'data-update',
    summary: 'Housing and services indicators updated from Census 2022 and household survey sources.',
    source: 'https://www.statssa.gov.za/?page_id=1854&PPN=P0318',
  },
  {
    date: '2023-10-10',
    datasetId: 'census',
    datasetLabel: 'Census 2022',
    type: 'new-dataset',
    summary: 'Census 2022 baseline dataset published and marked as static until the next census cycle.',
    source: 'https://www.statssa.gov.za/census/census_2022/',
  },
]
