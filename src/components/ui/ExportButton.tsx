'use client'

import { useState } from 'react'
import { Download, Check } from 'lucide-react'
import { ProvinceData, Statistic } from '@/types'
import { exportDataset, exportSingleStat, ExportOptions, ExportMode } from '@/lib/export'
import { exportProvincesDataset } from '@/lib/export'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExportButtonProps {
  /** The statistics to export */
  stats: Statistic[]
  /** Human-readable label used in the filename and CSV header comment */
  label: string
  /**
   * 'full'  — button with "Download CSV" text. Used in category page headers
   *           and Download Center cards.
   * 'icon'  — icon-only button. Used in chart card headers.
   */
  variant?: 'full' | 'icon'
  /** Forces how CSV rows are generated. Primarily used by Download Center for full datasets. */
  exportMode?: ExportMode
  /** Forwarded to exportDataset() */
  exportOptions?: ExportOptions
  className?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ExportButton({
  stats,
  label,
  variant = 'full',
  exportMode,
  exportOptions,
  className,
}: ExportButtonProps) {
  const [done, setDone] = useState(false)

  function handleClick() {
    if (stats.length === 0) return
    exportDataset(stats, label, {
      ...exportOptions,
      mode: exportMode ?? exportOptions?.mode,
    })
    setDone(true)
    setTimeout(() => setDone(false), 2000)
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={`Download ${label} as CSV`}
        aria-label={`Download ${label} as CSV`}
        className={cn(
          'flex shrink-0 items-center justify-center rounded-lg border p-2 transition-colors',
          'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900',
          'dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white',
          done && 'border-brand-300 text-brand-600 dark:border-brand-700 dark:text-brand-400',
          className
        )}
      >
        {done ? <Check size={16} /> : <Download size={16} />}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Download ${label} data as CSV`}
      className={cn(
        'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all',
        done
          ? 'border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-700 dark:bg-brand-950/30 dark:text-brand-300'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800',
        className
      )}
    >
      {done ? (
        <>
          <Check size={15} />
          Downloaded
        </>
      ) : (
        <>
          <Download size={15} />
          Download CSV
        </>
      )}
    </button>
  )
}

// ─── Single-stat chart variant ────────────────────────────────────────────────

interface ChartExportButtonProps {
  stat: Statistic
  className?: string
}

/**
 * Minimal export button for use inside chart card headers.
 * Exports only the series data for a single stat.
 */
export function ChartExportButton({ stat, className }: ChartExportButtonProps) {
  const [done, setDone] = useState(false)

  function handleClick() {
    exportSingleStat(stat)
    setDone(true)
    setTimeout(() => setDone(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={`Download ${stat.title} series data as CSV`}
      aria-label={`Download ${stat.title} as CSV`}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg border p-2 transition-colors',
        'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900',
        'dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white',
        done && 'border-brand-300 text-brand-600 dark:border-brand-700 dark:text-brand-400',
        className
      )}
    >
      {done ? <Check size={16} /> : <Download size={16} />}
    </button>
  )
}

// ─── Provinces dataset export ─────────────────────────────────────────────

interface ProvincesExportButtonProps {
  provinces: ProvinceData[]
  label: string
  className?: string
}

/**
 * Download Center export control for `provinces.json`.
 * Exports one CSV row per province with all indicator fields.
 */
export function ProvincesExportButton({ provinces, label, className }: ProvincesExportButtonProps) {
  const [done, setDone] = useState(false)

  function handleClick() {
    if (!provinces.length) return
    exportProvincesDataset(provinces, label)
    setDone(true)
    setTimeout(() => setDone(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Download ${label} as CSV`}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all',
        done
          ? 'border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-700 dark:bg-brand-950/30 dark:text-brand-300'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800',
        className
      )}
    >
      {done ? (
        <>
          <Check size={15} />
          Downloaded
        </>
      ) : (
        <>
          <Download size={15} />
          Download CSV
        </>
      )}
    </button>
  )
}
