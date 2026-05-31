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
  label: string
  value: number
  secondaryValue?: number
}

export interface DataSeries {
  name: string
  data: DataPoint[]
  unit: string
  color?: string
}

export interface Statistic {
  id: string
  categoryId: CategoryId
  title: string
  value: string
  rawValue: number
  unit: string
  change: number
  changeLabel: string
  trend: 'up' | 'down' | 'stable'
  description: string
  source: DataSource
  lastUpdated: string
  province?: Province
  series?: DataSeries[]
  insight?: Insight
}

export interface DataSource {
  name: string
  shortName: string
  url: string
  release?: string
  publicationName?: string
  publicationDate?: string
}

// ─── Data Interpretation Layer ───────────────────────────────────────────────

export type InsightSentiment = 'positive' | 'negative' | 'neutral' | 'mixed'
export type InsightType = 'trend' | 'turning-point' | 'context' | 'comparison' | 'warning'

export interface Insight {
  summary: string
  sentiment: InsightSentiment
  type: InsightType
  details?: string[]
  generatedFrom?: string
}

// ─── Insights Hub — Story types ──────────────────────────────────────────────

export type StoryCategory =
  | 'unemployment'
  | 'economy'
  | 'inflation'
  | 'crime'
  | 'education'
  | 'population'
  | 'housing'
  | 'policy'

export interface StorySection {
  id: string
  heading: string
  body: string                    // prose paragraphs, newline-separated
  statCallouts?: string[]         // Statistic IDs to render as live callouts
  highlight?: string              // pull-quote or key sentence
}

export interface Story {
  slug: string
  title: string
  subtitle: string
  category: StoryCategory
  categoryLabel: string
  readingTimeMinutes: number
  publishedDate: string           // ISO date
  lastUpdated: string             // ISO date
  featured: boolean
  coverEmoji: string              // simple visual identity
  summary: string                 // 2-3 sentence teaser shown on card
  relatedStatIds: string[]        // Statistic IDs shown as live callouts
  relatedSlugs?: string[]         // Other story slugs for "related stories"
  sections: StorySection[]
  tags: string[]
}

// ─── Historical Timeline ─────────────────────────────────────────────────────

export interface TimelineEvent {
  date: string          // "YYYY" or "YYYY-MM"
  label: string
  description: string
  type: 'economic' | 'political' | 'social' | 'crisis'
}

// ─── Province Data ───────────────────────────────────────────────────────────

export interface ProvinceStats {
  unemployment: {
    rate: number
    expanded: number
    period: string
    trend: 'up' | 'down' | 'stable'
    change: number
  }
  population: {
    total: number
    urban: number
    source: string
  }
  education: {
    matricPassRate: number
    year: number
    literacyRate: number
  }
  housing: {
    electricityAccess: number
    pipedWaterInDwelling: number
    formalDwellings: number
  }
}

export interface ProvinceData {
  id: Province
  name: string
  capital: string
  population: number
  populationShare: number
  unemploymentRate: number
  unemploymentRank: number
  gdpShare: number
  matricPassRate: number
  stats: ProvinceStats
}

// ─── Category Metadata ──────────────────────────────────────────────────────

export interface Category {
  id: CategoryId
  label: string
  description: string
  icon: string
  color: string
  bgColor: string
  stats: number
}

// ─── Search ─────────────────────────────────────────────────────────────────

export interface SearchResult {
  id: string
  title: string
  categoryId: CategoryId
  categoryLabel: string
  value: string
  href: string
  score?: number
}

// ─── Dashboard Filters ──────────────────────────────────────────────────────

export interface DashboardFilters {
  category: CategoryId | 'all'
  province: Province
  search: string
}

// ─── Methodology ────────────────────────────────────────────────────────────

export interface DataSourceMeta {
  id: string
  name: string
  shortName: string
  url: string
  description: string
  datasets: string[]
  updateFrequency: string
  automationLevel: 'full' | 'partial' | 'manual' | 'static'
  reliability: 'official' | 'derived' | 'third-party'
}
