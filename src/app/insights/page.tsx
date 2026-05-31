'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { StoryCard } from '@/components/ui/StoryCard'
import { STORIES, getFeaturedStories } from '@/data/stories'
import { Story, StoryCategory } from '@/types'
import { cn } from '@/lib/utils'

const CATEGORIES: { id: StoryCategory | 'all'; label: string }[] = [
  { id: 'all',          label: 'All stories' },
  { id: 'unemployment', label: 'Unemployment' },
  { id: 'economy',      label: 'Economy' },
  { id: 'inflation',    label: 'Inflation' },
  { id: 'crime',        label: 'Crime' },
  { id: 'education',    label: 'Education' },
  { id: 'population',   label: 'Population' },
  { id: 'housing',      label: 'Housing' },
  { id: 'policy',       label: 'Policy' },
]

export default function InsightsPage() {
  const [selectedCategory, setSelectedCategory] = useState<StoryCategory | 'all'>('all')
  const [search, setSearch] = useState('')

  const featured = getFeaturedStories()

  const filtered = useMemo<Story[]>(() => {
    return STORIES.filter((s) => {
      const matchCat = selectedCategory === 'all' || s.category === selectedCategory
      const q = search.toLowerCase()
      const matchSearch = !q || [s.title, s.subtitle, s.summary, ...s.tags].some((t) =>
        t.toLowerCase().includes(q)
      )
      return matchCat && matchSearch
    })
  }, [selectedCategory, search])

  const nonFeatured = filtered.filter((s) => !s.featured || selectedCategory !== 'all' || search)

  return (
    <div className="animate-fade-in py-8">
      <div className="container-page">

        {/* Header */}
        <div className="mb-8 max-w-2xl">
          <h1 className="heading-display text-3xl font-semibold">Insights</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Data stories that explain what South Africa's numbers actually mean — written for everyone, not just economists.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stories…"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 dark:focus:border-brand-500 dark:focus:ring-brand-900/30"
          />
        </div>

        {/* Category filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {CATEGORIES.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setSelectedCategory(id)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                selectedCategory === id
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Featured stories (only shown when no filter/search active) */}
        {selectedCategory === 'all' && !search && featured.length > 0 && (
          <div className="mb-10">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Featured stories
            </h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {featured.map((story) => (
                <StoryCard key={story.slug} story={story} featured />
              ))}
            </div>
          </div>
        )}

        {/* All / filtered stories */}
        {nonFeatured.length > 0 && (
          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {selectedCategory === 'all' && !search ? 'More stories' : `${filtered.length} stor${filtered.length === 1 ? 'y' : 'ies'}`}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {nonFeatured.map((story) => (
                <StoryCard key={story.slug} story={story} />
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="card flex flex-col items-center justify-center py-16 text-center">
            <p className="text-2xl">📭</p>
            <p className="mt-3 font-medium text-slate-700 dark:text-slate-300">No stories found</p>
            <p className="mt-1 text-sm text-slate-400">Try a different search or category.</p>
            <button
              onClick={() => { setSearch(''); setSelectedCategory('all') }}
              className="mt-4 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
