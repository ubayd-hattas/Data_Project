import { Clock, RefreshCw, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react'
import { DataSource } from '@/types'
import { cn } from '@/lib/utils'

interface FreshnessIndicatorProps {
  lastUpdated: string        // ISO date string
  source: DataSource
  updateFrequency?: string   // e.g. "Monthly", "Quarterly", "Annual"
  className?: string
  compact?: boolean
}

type FreshnessStatus = 'fresh' | 'recent' | 'aging' | 'stale'

function getFreshness(lastUpdated: string, frequency?: string): FreshnessStatus {
  const now = new Date()
  const updated = new Date(lastUpdated)
  const diffDays = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24))

  // Determine expected max age by frequency
  const maxAge = frequency?.toLowerCase().includes('month') ? 45
    : frequency?.toLowerCase().includes('quarter') ? 120
    : frequency?.toLowerCase().includes('annual') ? 400
    : frequency?.toLowerCase().includes('static') ? 99999
    : 180

  if (diffDays <= maxAge * 0.5) return 'fresh'
  if (diffDays <= maxAge) return 'recent'
  if (diffDays <= maxAge * 1.5) return 'aging'
  return 'stale'
}

const statusConfig: Record<FreshnessStatus, {
  label: string
  icon: typeof CheckCircle
  textClass: string
  bgClass: string
  borderClass: string
}> = {
  fresh: {
    label: 'Up to date',
    icon: CheckCircle,
    textClass: 'text-brand-700 dark:text-brand-300',
    bgClass: 'bg-brand-50 dark:bg-brand-950/30',
    borderClass: 'border-brand-200 dark:border-brand-800',
  },
  recent: {
    label: 'Recent',
    icon: CheckCircle,
    textClass: 'text-slate-600 dark:text-slate-300',
    bgClass: 'bg-slate-50 dark:bg-slate-800/50',
    borderClass: 'border-slate-200 dark:border-slate-700',
  },
  aging: {
    label: 'Due for update',
    icon: AlertTriangle,
    textClass: 'text-amber-700 dark:text-amber-300',
    bgClass: 'bg-amber-50 dark:bg-amber-950/30',
    borderClass: 'border-amber-200 dark:border-amber-800',
  },
  stale: {
    label: 'May be outdated',
    icon: AlertCircle,
    textClass: 'text-red-700 dark:text-red-300',
    bgClass: 'bg-red-50 dark:bg-red-950/30',
    borderClass: 'border-red-200 dark:border-red-800',
  },
}

function formatRelativeDate(isoDate: string): string {
  const now = new Date()
  const date = new Date(isoDate)
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`
}

function formatAbsoluteDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function FreshnessIndicator({
  lastUpdated,
  source,
  updateFrequency,
  className,
  compact = false,
}: FreshnessIndicatorProps) {
  const status = getFreshness(lastUpdated, updateFrequency)
  const config = statusConfig[status]
  const StatusIcon = config.icon

  if (compact) {
    return (
      <div className={cn('flex items-center gap-1.5 text-xs', className)}>
        <Clock size={11} className="text-slate-400 shrink-0" />
        <span className="text-slate-500 dark:text-slate-400">
          {formatRelativeDate(lastUpdated)}
        </span>
        <span className="text-slate-300 dark:text-slate-700">·</span>
        <span className={cn('font-medium', config.textClass)}>{config.label}</span>
      </div>
    )
  }

  return (
    <div className={cn('rounded-xl border p-4', config.bgClass, config.borderClass, className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Status badge */}
          <div className="mb-2 flex items-center gap-1.5">
            <StatusIcon size={13} className={config.textClass} />
            <span className={cn('text-xs font-semibold', config.textClass)}>{config.label}</span>
          </div>

          {/* Date info */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <Clock size={11} className="text-slate-400 shrink-0" />
              <span>
                Last updated:{' '}
                <strong className="font-medium">{formatAbsoluteDate(lastUpdated)}</strong>
                {' '}({formatRelativeDate(lastUpdated)})
              </span>
            </div>

            {updateFrequency && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <RefreshCw size={11} className="text-slate-400 shrink-0" />
                <span>Update frequency: <strong className="font-medium text-slate-600 dark:text-slate-300">{updateFrequency}</strong></span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="text-slate-400">Source:</span>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-slate-600 underline underline-offset-2 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
              >
                {source.name}
              </a>
            </div>

            {source.publicationName && (
              <div className="text-xs text-slate-400 pl-0">
                {source.publicationName}
                {source.publicationDate && (
                  <span> · {formatAbsoluteDate(source.publicationDate)}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
