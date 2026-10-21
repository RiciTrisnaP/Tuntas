import { categoryFor } from '../domain/screening.ts'
import type { MolecularTarget, NormalizedScreeningResult, QualitativeResult, SourceRow } from '../domain/types.ts'
import { assertUnique, dateOnly, emptyProfile, requiredText, requireColumns, testKey } from './shared.ts'

export function adaptCobas(rows: SourceRow[]): NormalizedScreeningResult[] {
  requireColumns(rows, ['Sample ID', 'id_perempuan', 'HPV16', 'HPV18', 'Other HR (12 tipe)', 'Validity', 'Ct (semua kanal)', 'lab', 'tgl_run'])
  const results = rows.map(row => {
    const r = row.values
    if (r.Validity !== 'Valid' && r.Validity !== 'Invalid') throw new Error(`Unknown cobas validity at row ${row.excelRow}`)
    if (r['Ct (semua kanal)'] !== 'Perlu cek') throw new Error('cobas Ct contract changed: inspect source before exposing Ct')
    const valid = r.Validity === 'Valid'
    const qualitative = (field: string): QualitativeResult => {
      const value = r[field]
      if (!['POS', 'NEG', 'Invalid'].includes(String(value))) throw new Error(`Unknown cobas result: ${value}`)
      if ((value === 'Invalid') !== !valid) throw new Error('Inconsistent cobas result/validity')
      return value === 'Invalid' ? 'INVALID' : value === 'POS' ? 'POSITIVE' : 'NEGATIVE'
    }
    const q = { hpv16: qualitative('HPV16'), hpv18: qualitative('HPV18'), otherHighRisk: qualitative('Other HR (12 tipe)') }
    const targets: MolecularTarget[] = [
      { key: 'hpv16', label: 'HPV16', result: q.hpv16, ct: null, availability: 'UNAVAILABLE' },
      { key: 'hpv18', label: 'HPV18', result: q.hpv18, ct: null, availability: 'UNAVAILABLE' },
      { key: 'otherHighRisk', label: 'HR lain (12 tipe)', result: q.otherHighRisk, ct: null, availability: 'UNAVAILABLE' },
    ]
    const sampleId = requiredText(r['Sample ID'], 'sample ID')
    return { testId: testKey('cobas', sampleId), sourceDevice: 'cobas' as const, sampleId,
      patientId: requiredText(r.id_perempuan, 'patient ID'), resultDate: dateOnly(r.tgl_run), sourceLab: requiredText(r.lab, 'lab'),
      ct: { hpv16: null, hpv18: null, hpv52: null, otherHighRisk: null, internalControl: null },
      qualitative: q, valid, programCategory: categoryFor(valid, q.hpv16, q.hpv18, q.otherHighRisk), deltaCt: null,
      targets, profile: emptyProfile(), research: null, sourceCompletenessLabel: '',
      provenance: { sheet: '4 Mock cobas', excelRows: [row.excelRow], rawPayload: [r] } }
  })
  assertUnique(results, r => r.testId, 'cobas sample')
  return results
}
