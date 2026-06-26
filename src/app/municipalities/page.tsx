import type { Metadata } from 'next'
import Link from 'next/link'
import { Info } from 'lucide-react'
import { getAllMunicipalities } from '@/data/mock'
import MunicipalityExplorer from './MunicipalityExplorer'
import { buildPageMetadata } from '@/lib/seo'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbSchema } from '@/lib/schema'
import { provinceCodeToSlug, provinceLabels } from '@/lib/utils'
import type { ProvinceCode } from '@/types'

export const metadata: Metadata = buildPageMetadata({
  title: 'Municipality Explorer',
  description:
    'Browse and search all 213 South African municipalities. Population, households, and key Census 2022 indicators by province.',
  path: '/municipalities',
})

const PROVINCE_LINKS = (Object.entries(provinceCodeToSlug) as [ProvinceCode, string][]).map(
  ([code, slug]) => ({
    code,
    slug,
    label: provinceLabels[slug] ?? slug,
    count: getAllMunicipalities().filter((m) => m.province === code).length,
  })
)

export default function MunicipalitiesPage() {
  const municipalities = getAllMunicipalities()

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Municipalities', path: '/municipalities' },
  ]

  return (
    <div className="container-page py-10 space-y-10">
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      {/* Breadcrumb + header */}
      <div>
        <Breadcrumbs items={breadcrumbs} className="mb-3" />
        <h1 className="font-display text-3xl font-semibold text-slate-900 dark:text-white mb-2">
          Municipality Explorer
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
          Search and filter all 213 South African municipalities. Population and household data
          from Census 2022, sourced from Statistics South Africa Municipal Fact Sheets.
        </p>
      </div>

      {/* Client-side explorer — search, filter, paginate */}
      <MunicipalityExplorer municipalities={municipalities} />

      {/* Server-rendered province index for crawlability */}
      <nav aria-label="Municipalities by province" className="border-t border-slate-200 pt-8 dark:border-slate-700">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Browse by province
        </h2>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PROVINCE_LINKS.map(({ slug, label, count }) => (
            <li key={slug}>
              <Link
                href={`/provinces/${slug}`}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm hover:border-brand-300 dark:border-slate-800 dark:hover:border-brand-700 transition-colors"
              >
                <span className="text-slate-700 dark:text-slate-300">{label}</span>
                <span className="text-xs text-slate-400">{count} municipalities</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer note */}
      <div className="flex items-start gap-2 text-xs text-slate-400 dark:text-slate-500">
        <Info size={13} className="shrink-0 mt-0.5" />
        <p>
          All data from Stats SA Census 2022 Municipal Fact Sheets (revised August 2025).
          Population and household figures are boundary-aligned to 2021 local government election boundaries.
          Category A = metropolitan municipalities, B = local municipalities, C = district municipalities.
        </p>
      </div>
    </div>
  )
}
