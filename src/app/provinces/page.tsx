import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'
import ProvincesExplorer from './ProvincesExplorer'

export const metadata: Metadata = buildPageMetadata({
  title: 'Province Explorer',
  description:
    'Compare unemployment, education, housing, and population indicators across all nine South African provinces. Interactive charts and provincial profiles.',
  path: '/provinces',
})

export default function ProvincesPage() {
  return <ProvincesExplorer />
}
