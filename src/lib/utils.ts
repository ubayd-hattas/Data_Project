import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { CategoryId } from '@/types'

// ─── Class merging ────────────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Number formatting ────────────────────────────────────────────────────────
export function formatNumber(value: number, unit: string): string {
  if (unit === '%') return `${value.toFixed(1)}%`
  if (unit === 'ZAR billion') {
    if (value >= 1000) return `R${(value / 1000).toFixed(2)}T`
    return `R${value.toFixed(0)}B`
  }
  if (unit === 'million') return `${value.toFixed(1)}M`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return value.toLocaleString('en-ZA')
  return value.toString()
}

// ─── Date formatting ──────────────────────────────────────────────────────────
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// ─── Trend helpers ────────────────────────────────────────────────────────────
export function getTrendColor(trend: 'up' | 'down' | 'stable', isGoodWhenDown = false): string {
  if (trend === 'stable') return 'text-slate-500'
  if (isGoodWhenDown) {
    return trend === 'down' ? 'text-brand-600 dark:text-brand-400' : 'text-red-500 dark:text-red-400'
  }
  return trend === 'up' ? 'text-brand-600 dark:text-brand-400' : 'text-red-500 dark:text-red-400'
}

export function getTrendBadgeClass(trend: 'up' | 'down' | 'stable', isGoodWhenDown = false): string {
  if (trend === 'stable') return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
  const isPositive = isGoodWhenDown ? trend === 'down' : trend === 'up'
  return isPositive
    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
    : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
}

// ─── Category helpers ─────────────────────────────────────────────────────────
// For some categories, a downward trend is good (e.g., unemployment, crime, inflation)
export const GOOD_WHEN_DOWN: CategoryId[] = ['unemployment', 'crime', 'inflation']

export function isGoodWhenDown(categoryId: CategoryId): boolean {
  return GOOD_WHEN_DOWN.includes(categoryId)
}

// ─── Province labels ──────────────────────────────────────────────────────────
export const provinceLabels: Record<string, string> = {
  all: 'All Provinces',
  gauteng: 'Gauteng',
  'western-cape': 'Western Cape',
  'kwazulu-natal': 'KwaZulu-Natal',
  'eastern-cape': 'Eastern Cape',
  limpopo: 'Limpopo',
  mpumalanga: 'Mpumalanga',
  'north-west': 'North West',
  'free-state': 'Free State',
  'northern-cape': 'Northern Cape',
}
