/**
 * src/lib/registry.ts
 *
 * SA Data Hub — Dataset Registry
 *
 * Single source of truth for per-dataset metadata currently scattered across:
 *  - JSON `_meta` blocks (update_frequency, source, notes)
 *  - Statistic.source fields (name, url, publicationName)
 *  - The hardcoded UPDATE_FREQUENCY map in category/[slug]/page.tsx
 *
 * All V4 features (CSV Export, Download Center, Citation Generator, Update Log)
 * read from this registry. New datasets need only one entry here to be
 * automatically supported by every downstream feature.
 *
 * ── Registry IDs vs categoryIds ──────────────────────────────────────────────
 * Registry IDs match the JSON filename stem (e.g. "youth-unemployment"),
 * NOT necessarily the categoryId (which would be "unemployment" for that file).
 * This distinction matters for the Download Center (Phase 2) where each file
 * gets its own download card, not one card per category.
 *
 * ── Adding a new dataset ─────────────────────────────────────────────────────
 * 1. Add the JSON file to src/data/datasets/
 * 2. Import + spread into statistics[] in src/data/mock.ts
 * 3. Add one DatasetRegistryEntry here
 * 4. All downstream V4 features work automatically
 */

import { CategoryId } from '@/types'
import { statistics, getStatById } from '@/data/mock'
import { getFreshness, FreshnessStatus } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export type AutomationLevel = 'auto' | 'semi-auto' | 'manual' | 'static'

export interface DatasetRegistryEntry {
  /** Matches the JSON filename stem, e.g. "youth-unemployment" */
  id: string
  /** Display name, e.g. "Youth Unemployment" */
  label: string
  /** One-sentence description */
  description: string
  /** All Statistic IDs that belong to this dataset */
  statIds: string[]
  /** The categoryId these stats belong to in the UI */
  categoryId: CategoryId
  /** Primary source organisation name */
  sourceName: string
  /** Primary source organisation short name */
  sourceShortName: string
  /** Link to the official source publication */
  sourceUrl: string
  /** Publication or release name, if available */
  publicationName?: string
  /** Human-readable update frequency */
  updateFrequency: string
  /** How the update is performed */
  automationLevel: AutomationLevel
  /** Primary unit of measure for the dataset */
  unit: string
  /** Earliest data point label across all series */
  seriesStart: string
}

// ─── Registry entries ─────────────────────────────────────────────────────────
// Ordered to match the categories array in mock.ts

export const datasetRegistry: DatasetRegistryEntry[] = [
  {
    id: 'unemployment',
    label: 'Unemployment',
    description: 'Official quarterly unemployment rate (ILO strict definition) from the Stats SA QLFS.',
    statIds: ['unemployment-national', 'youth-unemployment', 'labour-force-participation'],
    categoryId: 'unemployment',
    sourceName: 'Statistics South Africa',
    sourceShortName: 'Stats SA',
    sourceUrl: 'https://www.statssa.gov.za/?page_id=1854&PPN=P0211',
    publicationName: 'Quarterly Labour Force Survey',
    updateFrequency: 'Quarterly',
    automationLevel: 'semi-auto',
    unit: '%',
    seriesStart: 'Q1 2022',
  },
  {
    id: 'youth-unemployment',
    label: 'Youth Unemployment',
    description: 'Unemployment and NEET rates for youth aged 15–34, from the Stats SA QLFS.',
    statIds: ['youth-unemployment-narrow', 'youth-unemployment-1524', 'youth-unemployment-expanded', 'youth-neet-rate'],
    categoryId: 'unemployment',
    sourceName: 'Statistics South Africa',
    sourceShortName: 'Stats SA',
    sourceUrl: 'https://www.statssa.gov.za/?page_id=1854&PPN=P0211',
    publicationName: 'Quarterly Labour Force Survey',
    updateFrequency: 'Quarterly',
    automationLevel: 'semi-auto',
    unit: '%',
    seriesStart: 'Q1 2022',
  },
  {
    id: 'labour-force',
    label: 'Labour Force Participation',
    description: 'Labour force participation rates by gender and overall, from the Stats SA QLFS.',
    statIds: ['labour-force-participation', 'female-labour-participation'],
    categoryId: 'unemployment',
    sourceName: 'Statistics South Africa',
    sourceShortName: 'Stats SA',
    sourceUrl: 'https://www.statssa.gov.za/?page_id=1854&PPN=P0211',
    publicationName: 'Quarterly Labour Force Survey',
    updateFrequency: 'Quarterly',
    automationLevel: 'semi-auto',
    unit: '%',
    seriesStart: 'Q1 2022',
  },
  {
    id: 'inflation',
    label: 'Inflation & CPI',
    description: 'Monthly headline CPI, food inflation, and annual average inflation from Stats SA.',
    statIds: ['cpi-headline', 'food-inflation', 'repo-rate', 'annual-cpi-avg'],
    categoryId: 'inflation',
    sourceName: 'Statistics South Africa',
    sourceShortName: 'Stats SA',
    sourceUrl: 'https://www.statssa.gov.za/?page_id=1854&PPN=P0141',
    publicationName: 'Consumer Price Index',
    updateFrequency: 'Monthly',
    automationLevel: 'semi-auto',
    unit: '%',
    seriesStart: 'May 2025',
  },
  {
    id: 'gdp',
    label: 'GDP & Economic Growth',
    description: 'Quarterly and annual real GDP growth, nominal GDP, and GDP per capita from Stats SA.',
    statIds: ['gdp-growth', 'gdp-annual-growth', 'gdp-nominal', 'gdp-per-capita'],
    categoryId: 'gdp',
    sourceName: 'Statistics South Africa',
    sourceShortName: 'Stats SA',
    sourceUrl: 'https://www.statssa.gov.za/?page_id=1854&PPN=P0441',
    publicationName: 'Gross Domestic Product',
    updateFrequency: 'Quarterly',
    automationLevel: 'semi-auto',
    unit: '%',
    seriesStart: 'Q1 2022',
  },
  {
    id: 'interest-rates',
    label: 'Interest Rates',
    description: 'SARB repo rate and prime lending rate from MPC statements.',
    statIds: ['repo-rate', 'prime-lending-rate'],
    categoryId: 'gdp',
    sourceName: 'South African Reserve Bank',
    sourceShortName: 'SARB',
    sourceUrl: 'https://www.resbank.co.za/en/home/what-we-do/monetary-policy/monetary-policy-decisions',
    publicationName: 'MPC Statement',
    updateFrequency: 'Every ~2 months (MPC meetings)',
    automationLevel: 'semi-auto',
    unit: '%',
    seriesStart: 'Jan 2023',
  },
  {
    id: 'crime',
    label: 'Crime Statistics',
    description: 'Annual crime figures by category from SAPS, including murder and contact crimes.',
    statIds: ['murder-rate', 'crime-contact', 'crime-robbery'],
    categoryId: 'crime',
    sourceName: 'South African Police Service',
    sourceShortName: 'SAPS',
    sourceUrl: 'https://www.saps.gov.za/services/crimestats.php',
    publicationName: 'Crime Statistics Report',
    updateFrequency: 'Annual',
    automationLevel: 'manual',
    unit: 'cases',
    seriesStart: '2017/18',
  },
  {
    id: 'education',
    label: 'Education',
    description: 'Matric pass rates, literacy rates, and higher education enrolment from DBE and Stats SA.',
    statIds: ['matric-pass-rate', 'education-literacy', 'higher-education-enrolment'],
    categoryId: 'education',
    sourceName: 'Department of Basic Education',
    sourceShortName: 'DBE',
    sourceUrl: 'https://www.education.gov.za/Informationfor/Examinationsresults.aspx',
    publicationName: 'NSC Examination Results',
    updateFrequency: 'Annual',
    automationLevel: 'manual',
    unit: '%',
    seriesStart: '2015',
  },
  {
    id: 'population',
    label: 'Population',
    description: 'Total population, urbanisation rate, and median age from Stats SA mid-year estimates.',
    statIds: ['population-total', 'population-urban', 'population-median-age'],
    categoryId: 'population',
    sourceName: 'Statistics South Africa',
    sourceShortName: 'Stats SA',
    sourceUrl: 'https://www.statssa.gov.za/?page_id=1854&PPN=P0302',
    publicationName: 'Mid-Year Population Estimates',
    updateFrequency: 'Annual',
    automationLevel: 'auto',
    unit: 'people',
    seriesStart: '1996',
  },
  {
    id: 'housing',
    label: 'Housing & Services',
    description: 'Access to piped water, electricity, and formal dwelling data from Census 2022 and GHS.',
    statIds: ['housing-access-piped-water', 'housing-electricity', 'housing-formal-dwellings'],
    categoryId: 'housing',
    sourceName: 'Statistics South Africa',
    sourceShortName: 'Stats SA',
    sourceUrl: 'https://www.statssa.gov.za/?page_id=1854&PPN=P0318',
    publicationName: 'Census 2022 / General Household Survey',
    updateFrequency: 'Annual (GHS); Decennial (Census)',
    automationLevel: 'manual',
    unit: '%',
    seriesStart: '2001',
  },
  {
    id: 'census',
    label: 'Census 2022',
    description: 'Household, internet access, and income data from the South Africa Census 2022.',
    statIds: ['census-households', 'census-internet-access', 'census-no-income'],
    categoryId: 'census',
    sourceName: 'Statistics South Africa',
    sourceShortName: 'Stats SA',
    sourceUrl: 'https://www.statssa.gov.za/census/census_2022/',
    publicationName: 'Census 2022 Statistical Release',
    updateFrequency: 'Decennial (next census ~2032)',
    automationLevel: 'static',
    unit: 'various',
    seriesStart: '2001',
  },
]

// ─── Derived fields helpers ───────────────────────────────────────────────────

/**
 * Returns the ISO date of the most recently updated statistic in a registry entry.
 * Reads from the live statistics array — always accurate.
 */
export function getEntryLastUpdated(entry: DatasetRegistryEntry): string {
  const dates = entry.statIds
    .map((id) => getStatById(id)?.lastUpdated)
    .filter((d): d is string => !!d)
  if (dates.length === 0) return ''
  return dates.sort().reverse()[0]
}

/**
 * Returns the count of statistics that exist in the live data for an entry.
 * Guards against stale statIds — only counts IDs that resolve to a real stat.
 */
export function getEntryStatCount(entry: DatasetRegistryEntry): number {
  return entry.statIds.filter((id) => !!getStatById(id)).length
}

/**
 * Returns the primary source DataSource object for a registry entry,
 * derived from the first resolved stat in statIds.
 */
export function getEntrySource(entry: DatasetRegistryEntry) {
  for (const id of entry.statIds) {
    const stat = getStatById(id)
    if (stat) return stat.source
  }
  return null
}

/**
 * Returns freshness status for a registry entry, using updateFrequency
 * and the most recent lastUpdated date.
 */
export function getEntryFreshness(entry: DatasetRegistryEntry): FreshnessStatus {
  const lastUpdated = getEntryLastUpdated(entry)
  if (!lastUpdated) return 'stale'
  return getFreshness(lastUpdated, entry.updateFrequency)
}

// ─── Lookup helpers ───────────────────────────────────────────────────────────

export function getRegistryEntry(id: string): DatasetRegistryEntry | undefined {
  return datasetRegistry.find((e) => e.id === id)
}

export function getRegistryByCategory(categoryId: CategoryId): DatasetRegistryEntry[] {
  return datasetRegistry.filter((e) => e.categoryId === categoryId)
}

// ─── Update Log (consumed by Phase 4, defined here for registry cohesion) ────

export interface UpdateLogEntry {
  datasetId: string
  datasetLabel: string
  lastUpdated: string
  updateFrequency: string
  automationLevel: AutomationLevel
  sourceName: string
  sourceUrl: string
  freshnessStatus: FreshnessStatus
}

/**
 * Returns a structured update log derived entirely from the registry and
 * live stat data. Sorted by lastUpdated descending (most recent first).
 * Consumed by Phase 4's /updates page.
 */
export function getUpdateLog(): UpdateLogEntry[] {
  return datasetRegistry
    .map((entry) => ({
      datasetId: entry.id,
      datasetLabel: entry.label,
      lastUpdated: getEntryLastUpdated(entry),
      updateFrequency: entry.updateFrequency,
      automationLevel: entry.automationLevel,
      sourceName: entry.sourceName,
      sourceUrl: entry.sourceUrl,
      freshnessStatus: getEntryFreshness(entry),
    }))
    .filter((e) => e.lastUpdated !== '')
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
}
