import { molecularResult } from '../domain/screening.ts'
import type { NormalizedScreeningResult, Rules, SourceRow } from '../domain/types.ts'
import { assertUnique, categoryFromSource, dateOnly, nullableCt, nullableText, numeric, optionalDate, requiredText, requireColumns, testKey } from './shared.ts'

export function adaptNusa(rows: SourceRow[], rules: Rules): NormalizedScreeningResult[] {
  requireColumns(rows, ['id_perempuan', 'barcode_A', 'waktu_mulai_run', 'ct_hpv16', 'ct_hpv18', 'ct_hpv52', 'ct_pool_lain', 'ct_kontrol_internal', 'status_qc (rumus)', 'kategori (rumus)'])
  const results = rows.map(row => {
    const r = row.values
    const ct = { hpv16: nullableCt(r.ct_hpv16), hpv18: nullableCt(r.ct_hpv18), hpv52: nullableCt(r.ct_hpv52),
      otherHighRisk: nullableCt(r.ct_pool_lain), internalControl: nullableCt(r.ct_kontrol_internal) }
    const result = molecularResult(ct, rules)
    if (result.programCategory !== categoryFromSource(r['kategori (rumus)']) ||
      (result.valid ? 'Valid' : 'Invalid') !== r['status_qc (rumus)']) throw new Error(`NUSA cached QC/category disagreement at row ${row.excelRow}`)
    const sampleId = requiredText(r.barcode_A, 'barcode_A')
    return { testId: testKey('NUSA HPV', sampleId), sourceDevice: 'NUSA HPV' as const, sampleId,
      patientId: requiredText(r.id_perempuan, 'patient ID'), resultDate: dateOnly(r.waktu_mulai_run), sourceLab: null,
      ct, ...result, profile: { age: numeric(r.usia, 'age'), screeningHistory: nullableText(r.riwayat_skrining),
        vaccination: nullableText(r.vaksin_hpv), redFlagSymptoms: nullableText(r.gejala_merah),
        collectionMethod: nullableText(r.cara_ambil), collectedAt: nullableText(r.waktu_swab) },
      research: { clinicalUse: false as const, branchStatus: requiredText(r.status_cabang_B, 'branch B status'),
        barcode: requiredText(r.barcode_B, 'barcode_B'), sentAt: optionalDate(r.tgl_kirim_B), receivedAt: optionalDate(r.tgl_terima_B),
        genotype: nullableText(r.genotipe_lab), methylation: nullableText(r['metilasi (RISET)']), concordance: nullableText(r.kesesuaian_A_B) },
      sourceCompletenessLabel: '', provenance: { sheet: '2 Mock NUSA', excelRows: [row.excelRow], rawPayload: [r] } }
  })
  assertUnique(results, r => r.testId, 'NUSA sample')
  return results
}
