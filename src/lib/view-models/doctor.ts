import type { Screening } from '../domain/types.ts'
import { availabilityLabel, badgeCategory, dateLabel, numberLabel, resultLabel, statusLabel } from './shared.ts'

export function doctorViewModel(r: Screening) {
  return { patientId: r.patientId, testId: r.testId, sampleId: r.sampleId, source: r.sourceDevice,
    resultDate: dateLabel(r.resultDate), category: badgeCategory(r.programCategory), valid: r.valid,
    reviewRequired: r.reviewReasons.length > 0, reviewReasons: r.reviewReasons,
    followUpStatus: statusLabel(r.followUpStatus), reviewStatus: 'Review manusia belum dicatat',
    molecular: r.targets.map(t => ({ key: t.key, label: t.label,
      result: t.key === 'internalControl' ? (r.valid ? 'Lulus QC' : 'Tidak lulus QC') : resultLabel(t.result),
      ct: t.ct == null ? (t.availability === 'NOT_DETECTED' ? 'Tidak terdeteksi' : 'Tidak tersedia') : numberLabel(t.ct),
      availability: t.availability })),
    deltaCt: r.deltaCt == null ? 'Tidak tersedia' : numberLabel(r.deltaCt),
    availability: availabilityLabel(r), sourceCompletenessLabel: r.sourceCompletenessLabel,
    profile: { age: r.profile.age == null ? 'Tidak tersedia pada sumber ini' : `${r.profile.age} tahun`,
      screeningHistory: r.profile.screeningHistory || 'Tidak tersedia pada sumber ini',
      collectionMethod: r.profile.collectionMethod || 'Tidak tersedia pada sumber ini',
      vaccination: r.profile.vaccination || 'Tidak tersedia pada sumber ini' },
    research: r.research ? { clinicalUse: false as const, status: r.research.branchStatus,
      methylation: r.research.methylation || 'Tidak tersedia', genotype: r.research.genotype || 'Tidak tersedia',
      concordance: r.research.concordance || 'Tidak tersedia' } : null,
    followup: { contact: dateLabel(r.followup.contactedAt), iva: dateLabel(r.followup.ivaAt),
      ivaResult: r.followup.ivaResult || 'Belum tercatat', action: r.followup.recordedAction || 'Belum tercatat',
      histology: r.followup.histology || 'Belum tercatat', recall: r.followup.recallAt ? dateLabel(r.followup.recallAt) : r.followup.recallInstruction },
    provenance: `${r.provenance.sheet}, baris ${r.provenance.excelRows.join(', ')}` }
}
export const doctorQueue = (records: Screening[]) => records.filter(r => r.reviewReasons.length > 0).map(doctorViewModel)
