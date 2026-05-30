import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center justify-center py-32 text-center">
      <p className="font-mono text-6xl font-bold text-brand-600 dark:text-brand-400">404</p>
      <h2 className="heading-display mt-4 text-2xl font-semibold">Page not found</h2>
      <p className="mt-2 text-slate-500 dark:text-slate-400">
        This statistic or category doesn't exist yet — or may be coming soon.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
      >
        Back to home
      </Link>
    </div>
  )
}
