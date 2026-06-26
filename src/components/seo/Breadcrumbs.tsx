import Link from 'next/link'
import type { BreadcrumbItem } from '@/lib/schema'

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

/**
 * Accessible breadcrumb trail — visual only; pair with breadcrumbSchema() for JSON-LD.
 */
export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={item.path} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden="true">/</span>}
              {isLast ? (
                <span className="text-slate-900 dark:text-white" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.path} className="hover:text-brand-600 transition-colors">
                  {item.name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
