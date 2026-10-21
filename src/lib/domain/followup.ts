import { categoryFromSource, dateOnly, joinKey, nullableText, optionalDate, requiredText, assertUnique } from '../adapters/shared.ts'
import { isPositive } from './screening.ts'
import type { Followup, FollowUpStatus, NormalizedScreeningResult, Rules, SourceRow } from './types.ts'

export function elapsedDays(start: string, end: string): number {
  const days = (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000
  if (!Number.isFinite(days) || days < 0) throw new Error(`Invalid chronological interval: ${start} → ${end}`)
  return days
}
export function plusYears(day: string, years: number) {
  const date = new Date(`${day}T00:00:00Z`)
  // Mirrors Excel DATE(YEAR(date)+years, MONTH(date), DAY(date)), including leap-day overflow.
  date.setUTCFullYear(date.getUTCFullYear() + years)
  return date.toISOString().slice(0, 10)
}
export function joinFollowups(results: NormalizedScreeningResult[], rows: SourceRow[], rules: Rules): Followup[] {
  assertUnique(rows, row => joinKey(requiredText(row.values.sumber_alat, 'source'), requiredText(row.values.id_perempuan, 'patient')), 'follow-up source/patient')
  assertUnique(results, r => joinKey(r.sourceDevice, r.patientId), 'screening source/patient (ambiguous episode)')
  if (results.length !== rows.length) throw new Error('Follow-up coverage mismatch')
  const lookup = new Map(rows.map(row => [joinKey(String(row.values.sumber_alat), String(row.values.id_perempuan)), row]))
  return results.map(result => {
    const row = lookup.get(joinKey(result.sourceDevice, result.patientId))
    if (!row) throw new Error(`Missing follow-up: ${result.testId}`)
    const r = row.values
    if (categoryFromSource(r['kategori (rumus)']) !== result.programCategory || dateOnly(r['tgl_hasil (rumus)']) !== result.resultDate) {
      throw new Error(`Follow-up result/category mismatch: ${result.testId}`)
    }
    const contactedAt = optionalDate(r.tgl_dihubungi_kader)
    const ivaAt = optionalDate(r.tgl_iva)
    const contactDays = contactedAt ? elapsedDays(result.resultDate, contactedAt) : null
    const ivaDays = ivaAt ? elapsedDays(result.resultDate, ivaAt) : null
    if (contactDays !== r['hari_ke_kontak (rumus)'] || ivaDays !== r['hari_ke_iva (rumus)']) throw new Error(`Elapsed-day cache mismatch: ${result.testId}`)
    if (ivaAt && contactedAt && ivaAt < contactedAt) throw new Error('IVA precedes contact')
    const ivaResult = nullableText(r.hasil_iva)
    if (!!ivaAt !== !!ivaResult) throw new Error(`IVA date/result incomplete: ${result.testId}`)
    if (ivaResult && !['Negatif', 'Positif <75%', 'Positif >=75% atau curiga kanker'].includes(ivaResult)) throw new Error(`Unknown IVA result: ${ivaResult}`)
    const ivaWithinTarget = isPositive(result.programCategory) && ivaDays != null ? ivaDays <= rules.ivaTargetDays.value : null
    const cachedTarget = isPositive(result.programCategory) ? (ivaWithinTarget === true ? 'Ya' : 'Tidak') : null
    if (r['iva_dalam_target (rumus)'] !== cachedTarget) throw new Error(`IVA target cache mismatch: ${result.testId}`)
    let expectedRecall: string
    if (result.programCategory === 'NEGATIVE') expectedRecall = plusYears(result.resultDate, rules.negativeRecallYears.value)
    else if (result.programCategory === 'INVALID') expectedRecall = 'Ambil ulang'
    else if (ivaResult === 'Negatif' && ivaAt) expectedRecall = plusYears(ivaAt,
      result.programCategory === 'POSITIVE_16_18' ? rules.positive1618NormalIvaRecallYears.value : rules.otherNormalIvaRecallYears.value)
    else expectedRecall = 'Ditentukan bidan'
    const rawRecall = requiredText(r['tgl_recall (rumus)'], 'recall')
    const recallAt = /^\d{4}-/.test(rawRecall) ? dateOnly(rawRecall) : null
    if ((recallAt || rawRecall) !== expectedRecall) throw new Error(`Recall cache mismatch: ${result.testId}`)
    return { testId: result.testId, contactedAt, contactDays, ivaAt, ivaDays, ivaWithinTarget,
      ivaResult, recordedAction: nullableText(r.tindakan), histology: nullableText(r.histologi),
      recallAt, recallInstruction: recallAt ? null : rawRecall,
      provenance: { sheet: '6 Tindak Lanjut', excelRow: row.excelRow } }
  })
}
export function followUpStatus(result: NormalizedScreeningResult, followup: Followup): FollowUpStatus {
  if (!result.valid) return 'RETEST_REQUIRED'
  if (result.programCategory === 'NEGATIVE') return 'ROUTINE_RECALL'
  if (!followup.contactedAt) return 'AWAITING_CONTACT'
  if (!followup.ivaAt) return 'AWAITING_IVA'
  if (followup.ivaResult === 'Negatif') return 'FOLLOW_UP_COMPLETE'
  return followup.recordedAction === 'Rujuk FKTL' ? 'REFERRED' : 'ACTION_REQUIRED'
}
