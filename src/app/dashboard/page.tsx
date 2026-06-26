import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'
import DashboardView from './DashboardView'

export const metadata: Metadata = buildPageMetadata({
  title: 'Statistics Dashboard',
  description:
    'Search and explore South African public statistics — unemployment, GDP, inflation, crime, education, population, and housing data from official sources.',
  path: '/dashboard',
})

export default function DashboardPage() {
  return <DashboardView />
}
