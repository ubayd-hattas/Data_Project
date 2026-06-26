import type { Metadata } from 'next'
import Link from 'next/link'
import { Database, RefreshCw, Shield, ExternalLink } from 'lucide-react'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbSchema } from '@/lib/schema'
import { buildPageMetadata, AUTHOR } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'About',
  description:
    'Learn about SA Data Hub — an open, non-profit platform for South African public statistics. Data sources, methodology, update process, and maintainer information.',
  path: '/about',
})

const breadcrumbs = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
]

export default function AboutPage() {
  return (
    <div className="container-page py-10 max-w-3xl">
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      <h1 className="font-display text-3xl font-semibold text-slate-900 dark:text-white mb-4">
        About SA Data Hub
      </h1>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
        SA Data Hub is an independent, open-source platform that makes South African government statistics
        easier to find, understand, and use. It is not affiliated with any government department.
      </p>

      <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shrink-0">
            <Shield size={16} />
          </div>
          <h2 className="font-semibold text-xl text-slate-900 dark:text-white">Purpose</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
          Government statistics in South Africa are published across PDFs, Excel files, and fragmented portals.
          SA Data Hub aggregates indicators from trusted primary sources — Stats SA, the Reserve Bank, SAPS,
          the Department of Basic Education, and others — and presents them with charts, plain-English context,
          and free CSV downloads.
        </p>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          The platform serves students, researchers, journalists, developers, policymakers, and the general public.
          There are no paywalls, no advertising, and no editorial adjustment of official figures.
        </p>
      </section>

      <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shrink-0">
            <Database size={16} />
          </div>
          <h2 className="font-semibold text-xl text-slate-900 dark:text-white">Data sources</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          Every dataset traces back to an official publication. Primary sources include:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-600 dark:text-slate-400 mb-4">
          <li>Statistics South Africa — QLFS, CPI, GDP, Census 2022, population estimates, GHS</li>
          <li>South African Reserve Bank — interest rates, monetary statistics</li>
          <li>SAPS — annual crime statistics</li>
          <li>Department of Basic Education — matric results and enrolment</li>
        </ul>
        <Link
          href="/methodology"
          className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          Read full methodology and source documentation →
        </Link>
      </section>

      <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shrink-0">
            <RefreshCw size={16} />
          </div>
          <h2 className="font-semibold text-xl text-slate-900 dark:text-white">Update process</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
          Data is refreshed when official releases are published — quarterly for labour and GDP, monthly for inflation,
          annually for crime and education. Each dataset page shows its last update date, freshness status, and update history.
        </p>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          Platform-level changes are tracked on the{' '}
          <Link href="/changelog" className="text-brand-600 hover:underline dark:text-brand-400">
            changelog
          </Link>
          . Dataset-level updates are logged on the{' '}
          <Link href="/updates" className="text-brand-600 hover:underline dark:text-brand-400">
            updates tracker
          </Link>
          .
        </p>
      </section>

      <section className="card p-6">
        <h2 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">Maintainer</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          SA Data Hub is built and maintained by{' '}
          <a
            href={AUTHOR.url}
            rel="me author"
            className="font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            {AUTHOR.name}
          </a>
          , a software engineer focused on public data tools and civic technology. The project is open source
          and maintained in the maintainer&apos;s spare time.
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <a
            href={AUTHOR.url}
            rel="me"
            className="inline-flex items-center gap-1 text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
          >
            ubayd.me
            <ExternalLink size={12} />
          </a>
          <a
            href={AUTHOR.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
          >
            GitHub
            <ExternalLink size={12} />
          </a>
        </div>
      </section>
    </div>
  )
}
