import { adaptNusa } from './nusa.ts'
import { adaptCerviscan } from './cerviscan.ts'
import { adaptCobas } from './cobas.ts'
import { assertUnique, categoryFromSource, dateOnly, joinKey, requiredText } from './shared.ts'
import { followUpStatus, joinFollowups } from '../domain/followup.ts'
import { reviewReasons } from '../domain/review.ts'
import type { Dataset, NormalizedScreeningResult, RawWorkbook } from '../domain/types.ts'

function equal(actual: unknown, expected: unknown, context: string) {
  if (typeof actual === 'number' && typeof expected === 'number' && Math.abs(actual - expected) <= 1e-9) return
  if (actual !== expected) throw new Error(`Canonical mismatch ${context}: ${actual} != ${expected}`)
}
export function validateCanonical(results: NormalizedScreeningResult[], workbook: RawWorkbook) {
  const rows = workbook.tables.canonical.rows
  assertUnique(results, r => r.testId, 'test ID')
  assertUnique(rows, r => joinKey(String(r.values.sumber_alat), String(r.values.id_sampel)), 'canonical test')
  if (results.length !== rows.length) throw new Error('Canonical row coverage mismatch')
  const lookup = new Map(rows.map(row => [joinKey(String(row.values.sumber_alat), String(row.values.id_sampel)), row]))
  for (const result of results) {
    const row = lookup.get(result.testId)
    if (!row) throw new Error(`Missing canonical sample ${result.testId}`)
    const r = row.values
    const q = (v: string) => v === 'POSITIVE' ? 'Positif' : v === 'NEGATIVE' ? 'Negatif' : 'Invalid'
    const pairs = [
      [result.sourceDevice, r.sumber_alat], [result.sampleId, r.id_sampel], [result.patientId, r.id_perempuan],
      [result.ct.hpv16, r.ct_hpv16], [result.ct.hpv18, r.ct_hpv18], [result.ct.hpv52, r.ct_hpv52],
      [result.ct.otherHighRisk, r.ct_pool_lain], [result.ct.internalControl, r.ct_kontrol_internal],
      [q(result.qualitative.hpv16), r.hasil_16], [q(result.qualitative.hpv18), r.hasil_18],
      [q(result.qualitative.otherHighRisk), r['hasil_lain (52+pool)']], [result.valid ? 'Ya' : 'Tidak', r.valid],
      [result.programCategory, categoryFromSource(r.kategori_kemenkes)],
      [result.deltaCt, r.delta_ct === 'Perlu cek' ? null : r.delta_ct], [result.resultDate, dateOnly(r.tgl_hasil)],
    ]
    pairs.forEach(([actual, expected], i) => equal(actual, expected, `${result.testId} field ${i + 1}`))
    // Only the descriptive source label is carried over; no result is taken from the control table.
    result.sourceCompletenessLabel = requiredText(r.kelengkapan_data, 'completeness label')
  }
}
export function buildDataset(workbook: RawWorkbook): Dataset {
  for (const rule of Object.values(workbook.assumptions)) {
    if (typeof rule.value !== 'number' || !Number.isFinite(rule.value) || rule.value <= 0) throw new Error('Missing/invalid workbook assumption')
  }
  const results = [
    ...adaptNusa(workbook.tables.nusa.rows, workbook.assumptions),
    ...adaptCerviscan(workbook.tables.cerviscan.rows, workbook.assumptions),
    ...adaptCobas(workbook.tables.cobas.rows),
  ]
  validateCanonical(results, workbook)
  const followups = joinFollowups(results, workbook.tables.followups.rows, workbook.assumptions)
  const screenings = results.map((r, i) => ({ ...r, followup: followups[i],
    followUpStatus: followUpStatus(r, followups[i]), reviewReasons: reviewReasons(r) }))
  const dates = results.map(r => r.resultDate).sort()
  const ivaDates = followups.flatMap(f => f.ivaAt ? [f.ivaAt] : []).sort()
  return { metadata: { ...workbook.metadata, firstResultDate: dates[0], lastResultDate: dates[dates.length - 1],
    lastRecordedIvaDate: ivaDates[ivaDates.length - 1] }, rules: workbook.assumptions, screenings }
}
