import type { MunicipalityRecord } from '@/types'
import { getMunicipalitiesByProvince } from '@/data/mock'

const CATEGORY_LABELS: Record<string, string> = {
  A: 'metropolitan municipality',
  B: 'local municipality',
  C: 'district municipality',
}

function fmtPop(n: number): string {
  return n.toLocaleString('en-ZA')
}

/**
 * Generates a unique, data-driven introductory paragraph for a municipality profile.
 * Uses only fields present on the record — no filler or invented facts.
 */
export function generateMunicipalityIntro(m: MunicipalityRecord): string {
  const parts: string[] = []

  const typeLabel = CATEGORY_LABELS[m.category] ?? 'municipality'
  parts.push(
    `${m.name} is a Category ${m.category} ${typeLabel} in ${m.provinceName}, South Africa (Stats SA code ${m.id}).`
  )

  if (m.population2022 > 0) {
    const peers = getMunicipalitiesByProvince(m.province)
    const rank =
      [...peers]
        .sort((a, b) => b.population2022 - a.population2022)
        .findIndex((p) => p.id === m.id) + 1
    const rankNote =
      rank > 0 && peers.length > 1
        ? ` — the ${ordinal(rank)} most populous of ${peers.length} municipalities in the province`
        : ''
    parts.push(
      `The 2022 Census recorded a population of ${fmtPop(m.population2022)}${rankNote}.`
    )
  }

  if (m.populationGrowthRate != null && isFinite(m.populationGrowthRate)) {
    const dir = m.populationGrowthRate >= 0 ? 'grew' : 'declined'
    parts.push(
      `Population ${dir} by ${Math.abs(m.populationGrowthRate).toFixed(1)}% between the 2011 and 2022 censuses (boundary-aligned figures).`
    )
  }

  const serviceNotes: string[] = []
  if (m.pctFormalDwelling2022 != null && isFinite(m.pctFormalDwelling2022)) {
    serviceNotes.push(`${m.pctFormalDwelling2022.toFixed(1)}% of households live in formal dwellings`)
  }
  if (m.pctFlushToilet2022 != null && isFinite(m.pctFlushToilet2022)) {
    serviceNotes.push(`${m.pctFlushToilet2022.toFixed(1)}% have access to a flush toilet`)
  }
  if (m.pctElectricityCooking2022 != null && isFinite(m.pctElectricityCooking2022)) {
    serviceNotes.push(`${m.pctElectricityCooking2022.toFixed(1)}% use electricity for cooking`)
  }

  if (serviceNotes.length > 0) {
    parts.push(`On basic services: ${serviceNotes.join('; ')}.`)
  }

  if (m.areaKm2 > 0 && m.populationDensity2022 != null && isFinite(m.populationDensity2022)) {
    parts.push(
      `The municipal area covers ${fmtPop(Math.round(m.areaKm2))} km² at a density of ${m.populationDensity2022.toFixed(1)} people per km².`
    )
  }

  parts.push('All figures below are from Stats SA Census 2022 Municipal Fact Sheets.')

  return parts.join(' ')
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}
