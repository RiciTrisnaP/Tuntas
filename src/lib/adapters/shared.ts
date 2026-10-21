import type { CellValue, SourceRow, SourceDevice, ProgramCategory } from '../domain/types.ts'

export const requiredText = (value: CellValue, field: string): string => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Missing/invalid ${field}`)
  return value.trim()
}
export const nullableText = (value: CellValue): string | null => value == null ? null : requiredText(value, 'text')
export const numeric = (value: CellValue, field: string): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`Missing/invalid ${field}`)
  return value
}
export const nullableCt = (value: CellValue): number | null => {
  if (value == null || value === '' || value === 'N/A') return null
  const result = typeof value === 'string' ? Number(value) : value
  if (typeof result !== 'number' || !Number.isFinite(result) || result < 0) throw new Error(`Invalid Ct: ${value}`)
  return result
}
export function dateOnly(value: CellValue): string {
  const text = requiredText(value, 'date')
  const day = text.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10) !== day) {
    throw new Error(`Invalid date: ${text}`)
  }
  return day
}
export const optionalDate = (value: CellValue): string | null => value == null ? null : dateOnly(value)
export const testKey = (source: SourceDevice, sample: string) => `${source}:${sample}`
export const joinKey = (source: string, patient: string) => `${source}:${patient}`
export function categoryFromSource(value: CellValue): ProgramCategory {
  switch (value) {
    case 'Negatif': return 'NEGATIVE'
    case 'Positif 16/18': return 'POSITIVE_16_18'
    case 'Positif lain': return 'POSITIVE_OTHER'
    case 'Invalid': return 'INVALID'
    default: throw new Error(`Unknown category: ${value}`)
  }
}
export function requireColumns(rows: SourceRow[], headers: string[]) {
  for (const row of rows) for (const header of headers) {
    if (!Object.hasOwn(row.values, header)) throw new Error(`Missing column ${header} at Excel row ${row.excelRow}`)
  }
}
export const emptyProfile = () => ({ age: null, screeningHistory: null, vaccination: null,
  redFlagSymptoms: null, collectionMethod: null, collectedAt: null })
export function assertUnique<T>(rows: T[], key: (row: T) => string, label: string) {
  const seen = new Set<string>()
  for (const row of rows) {
    const id = key(row)
    if (seen.has(id)) throw new Error(`Duplicate ${label}: ${id}`)
    seen.add(id)
  }
}
