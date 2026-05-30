import Link from 'next/link'
import { TrendingUp, TrendingDown, Minus, Clock } from 'lucide-react'
import { Statistic } from '@/types'
import { cn, formatDate, getTrendBadgeClass, isGoodWhenDown } from '@/lib/utils'

interface StatCardProps {
  stat: Statistic
  compact?: boolean
  href?: string
}

export function StatCard({ stat, compact = false, href }: StatCardProps) {
  const goodDown = isGoodWhenDown(stat.categoryId)
  const badgeClass = getTrendBadgeClass(stat.trend, goodDown)

  const TrendIcon =
    stat.trend === 'up' ? TrendingUp : stat.trend === 'down' ? TrendingDown : Minus

  const content = (
    <div className={cn('card group flex flex-col gap-4 p-5 transition-all duration-200', href && 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer')}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
        <span className={cn('flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', badgeClass)}>
          <TrendIcon size={11} />
          {Math.abs(stat.change).toFixed(1)}
          {stat.unit === '%' ? 'pp' : '%'}
        </span>
      </div>

      {/* Value */}
      <div>
        <p className="stat-value">{stat.value}</p>
        <p className="mt-0.5 text-xs text-slate-400">{stat.changeLabel}</p>
      </div>

      {/* Description (only non-compact) */}
      {!compact && (
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-3">
          {stat.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Clock size={11} />
        <span>Updated {formatDate(stat.lastUpdated)}</span>
        <span className="mx-1 text-slate-300 dark:text-slate-700">·</span>
        <span>{stat.source.shortName}</span>
      </div>
    </div>
  )

  if (href) return <Link href={href}>{content}</Link>
  return content
}
