import { molecularResult } from '../domain/screening.ts'
import type { CtValues, NormalizedScreeningResult, Rules, SourceRow, TargetKey } from '../domain/types.ts'
import { dateOnly, emptyProfile, nullableCt, requiredText, requireColumns, testKey } from './shared.ts'

const TARGETS: Record<string, TargetKey> = { HPV16: 'hpv16', HPV18: 'hpv18', HPV52: 'hpv52',
  'HR lain (11 tipe)': 'otherHighRisk', 'Beta-globin (IC)': 'internalControl' }
export function adaptCerviscan(rows: SourceRow[], rules: Rules): NormalizedScreeningResult[] {
  requireColumns(rows, ['Sample', 'Target', 'Cq', 'id_perempuan', 'lab', 'tgl_run'])
  const groups = new Map<string, SourceRow[]>()
  for (const row of rows) {
    const sample = requiredText(row.values.Sample, 'Sample')
    groups.set(sample, [...(groups.get(sample) || []), row])
  }
  return [...groups].map(([sampleId, group]) => {
    const first = group[0].values
    if (group.length !== 5) throw new Error(`CerviScan ${sampleId}: expected exactly five target rows`)
    const seen = new Set<string>()
    const ct: CtValues = { hpv16: null, hpv18: null, hpv52: null, otherHighRisk: null, internalControl: null }
    for (const row of group) {
      const r = row.values
      for (const key of ['id_perempuan', 'lab', 'tgl_run']) {
        if (r[key] !== first[key]) throw new Error(`CerviScan ${sampleId}: conflicting ${key}`)
      }
      const target = requiredText(r.Target, 'Target')
      if (!Object.hasOwn(TARGETS, target) || seen.has(target)) throw new Error(`CerviScan ${sampleId}: unknown/duplicate target ${target}`)
      seen.add(target)
      ct[TARGETS[target]] = nullableCt(r.Cq)
    }
    return { testId: testKey('CerviScan', sampleId), sourceDevice: 'CerviScan', sampleId,
      patientId: requiredText(first.id_perempuan, 'patient ID'), sourceLab: requiredText(first.lab, 'lab'),
      resultDate: dateOnly(first.tgl_run), ct, ...molecularResult(ct, rules), profile: emptyProfile(), research: null,
      sourceCompletenessLabel: '', provenance: { sheet: '3 Mock CerviScan', excelRows: group.map(r => r.excelRow), rawPayload: group.map(r => r.values) } }
  })
}
