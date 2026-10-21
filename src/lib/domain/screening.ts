import type { CtValues, MolecularTarget, ProgramCategory, QualitativeResult, Rules, TargetKey } from './types.ts'

export const isPositive = (category: ProgramCategory) => category === 'POSITIVE_16_18' || category === 'POSITIVE_OTHER'
export function categoryFor(valid: boolean, hpv16: QualitativeResult, hpv18: QualitativeResult, other: QualitativeResult): ProgramCategory {
  if (!valid) return 'INVALID'
  if ([hpv16, hpv18, other].some(r => r === 'NOT_AVAILABLE' || r === 'INVALID')) throw new Error('Incomplete qualitative result for valid test')
  if (hpv16 === 'POSITIVE' || hpv18 === 'POSITIVE') return 'POSITIVE_16_18'
  return other === 'POSITIVE' ? 'POSITIVE_OTHER' : 'NEGATIVE'
}
const TARGET_LABELS: Record<TargetKey, string> = { hpv16: 'HPV16', hpv18: 'HPV18', hpv52: 'HPV52', otherHighRisk: 'HR lain (11 tipe)', internalControl: 'Kontrol internal' }
export function molecularResult(ct: CtValues, rules: Rules) {
  const valid = ct.internalControl != null && ct.internalControl <= rules.internalControlMaxCt.value
  const qualitative = (value: number | null): QualitativeResult => !valid ? 'INVALID' :
    value != null && value < rules.hpvCtPositiveThreshold.value ? 'POSITIVE' : 'NEGATIVE'
  const hpv16 = qualitative(ct.hpv16)
  const hpv18 = qualitative(ct.hpv18)
  const otherHighRisk: QualitativeResult = !valid ? 'INVALID' :
    qualitative(ct.hpv52) === 'POSITIVE' || qualitative(ct.otherHighRisk) === 'POSITIVE' ? 'POSITIVE' : 'NEGATIVE'
  const hpvCts = [ct.hpv16, ct.hpv18, ct.hpv52, ct.otherHighRisk].filter((v): v is number => v != null)
  const targets: MolecularTarget[] = (Object.keys(ct) as TargetKey[]).map(key => ({
    key, label: TARGET_LABELS[key], ct: ct[key],
    result: key === 'internalControl' ? (valid ? 'POSITIVE' : 'INVALID') : qualitative(ct[key]),
    availability: ct[key] != null ? 'MEASURED' : key === 'internalControl' ? 'MISSING' : 'NOT_DETECTED',
  }))
  return { valid, qualitative: { hpv16, hpv18, otherHighRisk }, targets,
    programCategory: categoryFor(valid, hpv16, hpv18, otherHighRisk),
    deltaCt: valid && hpvCts.length ? Math.min(...hpvCts) - ct.internalControl! : null }
}
