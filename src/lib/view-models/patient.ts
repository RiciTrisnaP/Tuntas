import type { Screening } from '../domain/types.ts'
import { badgeCategory, dateLabel, statusLabel } from './shared.ts'

export function patientViewModel(r: Screening) {
  const f = r.followup
  const headline = { NEGATIVE: 'HPV risiko tinggi tidak terdeteksi pada sampel ini.',
    POSITIVE_16_18: 'HPV risiko tinggi tipe 16/18 terdeteksi.', POSITIVE_OTHER: 'HPV risiko tinggi tipe lain terdeteksi.',
    INVALID: 'Hasil pemeriksaan belum dapat dinilai dengan baik.' }[r.programCategory]
  const next = { ROUTINE_RECALL: 'Ikuti jadwal pemeriksaan berikutnya.', RETEST_REQUIRED: 'Hubungi tenaga kesehatan untuk pemeriksaan ulang.',
    AWAITING_CONTACT: 'Lanjutkan tindak lanjut bersama tenaga kesehatan.', AWAITING_IVA: 'Lanjutkan pemeriksaan IVA; tanggal pelaksanaan belum tercatat.',
    FOLLOW_UP_COMPLETE: 'Ikuti jadwal recall yang tercatat.', ACTION_REQUIRED: 'Bahas tindakan yang tercatat dengan tenaga medis.',
    REFERRED: 'Lanjutkan pemeriksaan sesuai rujukan yang tercatat.' }[r.followUpStatus]
  const journey: { label: string; date: string | null; detail: string; state: 'done' | 'current' | 'todo' }[] = [
    { label: 'Hasil tersedia', date: r.resultDate, detail: r.sourceDevice, state: 'done' },
  ]
  if (r.programCategory === 'INVALID') journey.push({ label: 'Pemeriksaan ulang', date: null, detail: 'Hasil belum dapat dinilai', state: 'current' })
  else if (r.programCategory !== 'NEGATIVE') {
    journey.push({ label: 'Kontak tenaga kesehatan', date: f.contactedAt, detail: f.contactedAt ? 'Kontak tercatat' : 'Belum tercatat', state: f.contactedAt ? 'done' : 'current' })
    journey.push({ label: 'Pemeriksaan IVA', date: f.ivaAt, detail: f.ivaResult || 'Pelaksanaan belum tercatat', state: f.ivaAt ? 'done' : f.contactedAt ? 'current' : 'todo' })
    if (f.recordedAction) journey.push({ label: 'Tindak lanjut tercatat', date: null, detail: f.recordedAction, state: 'done' })
  }
  if (f.recallAt) journey.push({ label: 'Pemeriksaan berikutnya', date: f.recallAt, detail: 'Tanggal recall', state: 'todo' })
  return { patientId: r.patientId, testId: r.testId, source: r.sourceDevice, sampleId: r.sampleId,
    resultDate: dateLabel(r.resultDate), category: badgeCategory(r.programCategory), headline,
    explanation: r.programCategory === 'INVALID' ? 'Sampel memerlukan evaluasi atau pengambilan ulang.' :
      r.programCategory === 'NEGATIVE' ? 'Tetap ikuti jadwal skrining dan konsultasikan keluhan kepada tenaga kesehatan.' : 'Hasil HPV positif bukan diagnosis kanker.',
    status: statusLabel(r.followUpStatus), nextStep: next, recallDate: f.recallAt ? dateLabel(f.recallAt) : null,
    recallInstruction: f.recallInstruction, journey,
    technicalDetails: [
      { label: 'HPV16', value: r.qualitative.hpv16 }, { label: 'HPV18', value: r.qualitative.hpv18 },
      { label: 'HPV risiko tinggi lain (termasuk pool)', value: r.qualitative.otherHighRisk },
    ] }
}
