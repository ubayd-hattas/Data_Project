import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'
import InsightsHub from './InsightsHub'

export const metadata: Metadata = buildPageMetadata({
  title: 'Data Stories & Insights',
  description:
    'Data-driven narratives explaining South African statistics — unemployment, inflation, GDP, crime, education, and more. Written for everyone, not just economists.',
  path: '/insights',
})

export default function InsightsPage() {
  return <InsightsHub />
}
