// ─── Data Categories ────────────────────────────────────────────────────────

export type CategoryId =
  | 'unemployment'
  | 'crime'
  | 'inflation'
  | 'education'
  | 'population'
  | 'housing'
  | 'gdp'
  | 'census'

export type Province =
  | 'all'
  | 'gauteng'
  | 'western-cape'
  | 'kwazulu-natal'
  | 'eastern-cape'
  | 'limpopo'
  | 'mpumalanga'
  | 'north-west'
  | 'free-state'
  | 'northern-cape'

// ─── Data Structures ────────────────────────────────────────────────────────

export interface DataPoint {
  label: string       // e.g. "Q1 2023", "2019", "Jan"
  value: number
  secondaryValue?: number  // for multi-series charts
}

export interface DataSeries {
  name: string
  data: DataPoint[]
  unit: string        // e.g. "%", "ZAR", "million"
  color?: string
}

export interface Statistic {
  id: string
  categoryId: CategoryId
  title: string
  value: string           // formatted display value e.g. "32.9%"
  rawValue: number
  unit: string
  change: number          // percentage point change from previous period
  changeLabel: string     // e.g. "from Q3 2023"
  trend: 'up' | 'down' | 'stable'
  description: string
  source: DataSource
  lastUpdated: string     // ISO date string
  province?: Province
  series?: DataSeries[]
}

export interface DataSource {
  name: string            // e.g. "Statistics South Africa"
  shortName: string       // e.g. "Stats SA"
  url: string
  publicationName?: string
  publicationDate?: string
}

// ─── Category Metadata ──────────────────────────────────────────────────────

export interface Category {
  id: CategoryId
  label: string
  description: string
  icon: string            // lucide icon name
  color: string           // tailwind color class
  bgColor: string
  stats: number           // number of datasets in category
}

// ─── Search ─────────────────────────────────────────────────────────────────

export interface SearchResult {
  id: string
  title: string
  categoryId: CategoryId
  categoryLabel: string
  value: string
  href: string
}

// ─── Dashboard Filters ──────────────────────────────────────────────────────

export interface DashboardFilters {
  category: CategoryId | 'all'
  province: Province
  search: string
}
