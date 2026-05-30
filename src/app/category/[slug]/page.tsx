import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Briefcase, TrendingUp, ShoppingCart, Shield,
  GraduationCap, Users, Home, BarChart3, ArrowLeft, LucideIcon,
} from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { LineChartCard } from '@/components/charts/LineChartCard'
import { BarChartCard } from '@/components/charts/BarChartCard'
import { SourceBadge } from '@/components/ui/SourceBadge'
import { getCategoryById, getStatsByCategory } from '@/data/mock'
import { CategoryId } from '@/types'
import { formatDate } from '@/lib/utils'

const iconMap: Record<string, LucideIcon> = {
  Briefcase, TrendingUp, ShoppingCart, Shield,
  GraduationCap, Users, Home, BarChart3,
}

interface CategoryPageProps {
  params: { slug: string }
}

// Generate all category pages at build time
export function generateStaticParams() {
  return [
    'unemployment', 'gdp', 'inflation', 'crime',
    'education', 'population', 'housing', 'census',
  ].map((slug) => ({ slug }))
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = getCategoryById(params.slug)
  if (!category) notFound()

  const stats = getStatsByCategory(params.slug)
  const Icon = iconMap[category.icon] ?? BarChart3
  const statsWithSeries = stats.filter((s) => s.series && s.series.length > 0)
  const allSources = Array.from(new Map(stats.map((s) => [s.source.name, s.source])).values())
  const latestUpdate = stats
    .map((s) => s.lastUpdated)
    .sort()
    .reverse()[0]

  return (
    <div className="animate-fade-in py-8">
      <div className="container-page">

        {/* Back */}
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft size={14} /> Back to dashboard
        </Link>

        {/* Header */}
        <div className="mb-8 flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${category.bgColor}`}>
            <Icon size={24} className={category.color} />
          </div>
          <div>
            <h1 className="heading-display text-3xl font-semibold">{category.label}</h1>
            <p className="mt-1 max-w-xl text-slate-500 dark:text-slate-400">{category.description}</p>
            <p className="mt-2 text-xs text-slate-400">
              {stats.length} dataset{stats.length !== 1 ? 's' : ''} · Last updated {latestUpdate ? formatDate(latestUpdate) : '—'}
            </p>
          </div>
        </div>

        {/* Overview cards */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>

        {/* Charts */}
        {statsWithSeries.length > 0 && (
          <div className="mb-10">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
              Trend visualisations
            </h2>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {statsWithSeries.map((stat, i) =>
                i % 2 === 0 ? (
                  <LineChartCard
                    key={stat.id}
                    title={stat.title}
                    series={stat.series!}
                  />
                ) : (
                  <BarChartCard
                    key={stat.id}
                    title={stat.title}
                    series={stat.series!}
                  />
                )
              )}
            </div>
          </div>
        )}

        {/* Sources */}
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Data sources
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {allSources.map((source) => (
              <SourceBadge key={source.name} source={source} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
