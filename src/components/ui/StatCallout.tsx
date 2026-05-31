import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Statistic } from '@/types'
import { cn, getTrendBadgeClass, isGoodWhenDown, formatDate } from '@/lib/utils'

interface StatCalloutProps {
  stat: Statistic
  className?: string
}

export function StatCallout({ stat, className }: StatCalloutProps) {
  const goodDown = isGoodWhenDown(stat.categoryId)
  const badgeClass = getTrendBadgeClass(stat.trend, goodDown)
  const TrendIcon = stat.trend === 'up' ? TrendingUp : stat.trend === 'down' ? TrendingDown : Minus

  return (
    <div className={cn(
      'my-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900',
      'flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6',
      className
    )}>
      {/* Big value */}
      <div className="flex-shrink-0">
        <p className="font-mono text-4xl font-medium tabular-nums text-slate-900 dark:text-white">
          {stat.value}
        </p>
        <div className="mt-1 flex items-center gap-1.5">
          <span className={cn('flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', badgeClass)}>
            <TrendIcon size={11} />
            {Math.abs(stat.change).toFixed(1)}{stat.unit === '%' ? 'pp' : '%'}
          </span>
          <span className="text-xs text-slate-400">{stat.changeLabel}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden h-12 w-px bg-slate-100 dark:bg-slate-800 sm:block" />

      {/* Context */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{stat.title}</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
          {stat.description}
        </p>
        <p className="mt-2 text-xs text-slate-400">
          {stat.source.shortName} · Updated {formatDate(stat.lastUpdated)}
        </p>
      </div>
    </div>
  )
}
