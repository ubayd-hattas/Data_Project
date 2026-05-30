'use client'

import { useState, useMemo } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { LineChartCard } from '@/components/charts/LineChartCard'
import { SearchBar } from '@/components/ui/SearchBar'
import { statistics, categories } from '@/data/mock'
import { CategoryId, Province } from '@/types'
import { cn, provinceLabels } from '@/lib/utils'

const ALL_CATEGORIES: { id: CategoryId | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  ...categories.map((c) => ({ id: c.id, label: c.label })),
]

const PROVINCES: Province[] = [
  'all',
  'gauteng',
  'western-cape',
  'kwazulu-natal',
  'eastern-cape',
  'limpopo',
  'mpumalanga',
  'north-west',
  'free-state',
  'northern-cape',
]

export default function DashboardPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all')
  const [selectedProvince, setSelectedProvince] = useState<Province>('all')
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    return statistics.filter((s) => {
      const matchCategory = selectedCategory === 'all' || s.categoryId === selectedCategory
      const matchSearch =
        !search ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase())
      return matchCategory && matchSearch
    })
  }, [selectedCategory, search])

  // Pick a few stats with series for the chart showcase
  const chartStats = useMemo(
    () => filtered.filter((s) => s.series && s.series.length > 0).slice(0, 2),
    [filtered]
  )

  return (
    <div className="animate-fade-in py-8">
      <div className="container-page">

        {/* Header */}
        <div className="mb-8">
          <h1 className="heading-display text-3xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {filtered.length} dataset{filtered.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Search + filter toggle */}
        <div className="mb-4 flex gap-3">
          <SearchBar
            className="flex-1"
            onSearch={setSearch}
            placeholder="Search statistics…"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors',
              showFilters
                ? 'border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            )}
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Category */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_CATEGORIES.map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => setSelectedCategory(id)}
                      className={cn(
                        'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                        selectedCategory === id
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Province */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Province
                </label>
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value as Province)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {provinceLabels[p]}
                    </option>
                  ))}
                </select>
                {selectedProvince !== 'all' && (
                  <p className="mt-1.5 text-xs text-slate-400">
                    Note: provincial breakdowns coming in a future update.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Charts section */}
        {chartStats.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">Trend charts</h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {chartStats.map((stat) => (
                <LineChartCard
                  key={stat.id}
                  title={stat.title}
                  series={stat.series!}
                />
              ))}
            </div>
          </div>
        )}

        {/* Stat cards grid */}
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            All statistics
          </h2>
          {filtered.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <p className="text-slate-400">No statistics match your filters.</p>
              <button
                onClick={() => { setSearch(''); setSelectedCategory('all') }}
                className="mt-3 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((stat) => (
                <StatCard
                  key={stat.id}
                  stat={stat}
                  href={`/category/${stat.categoryId}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Source note */}
        <p className="mt-10 text-center text-xs text-slate-400">
          All data sourced from official South African government publications.
          See individual statistics for specific source attribution.
        </p>
      </div>
    </div>
  )
}
