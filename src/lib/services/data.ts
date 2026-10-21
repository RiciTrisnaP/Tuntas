import generated from '../../data/generated/screenings.json'
import type { Dataset } from '../domain/types.ts'

// Synthetic fixtures only. Production data belongs behind server-side authorization, not this browser bundle.
export const dataset = generated as Dataset
export const screenings = dataset.screenings
export function getScreening(id: string) {
  const matches = screenings.filter(r => r.testId === id || r.patientId === id)
  return matches.length === 1 ? matches[0] : null
}
export const sourceUrl = (source: string) => `/dinkes/source/${encodeURIComponent(source)}`
export const reviewUrl = (testId: string) => `/doctor/reviews/${encodeURIComponent(testId)}`
export const CANONICAL_PATIENTS = ['P-0001', 'P-0008', 'P-0016', 'P-0024', 'P-0073', 'P-0124']
