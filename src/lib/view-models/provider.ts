import type { Screening } from '../domain/types.ts'
import { patientViewModel } from './patient.ts'
import { badgeCategory, dateLabel, statusLabel } from './shared.ts'

export type TabKey = 'telepon' | 'iva' | 'ambilUlang' | 'selesai'
export function providerViewModel(r: Screening) {
  const tab: TabKey = r.followUpStatus === 'AWAITING_CONTACT' ? 'telepon' : r.followUpStatus === 'RETEST_REQUIRED' ? 'ambilUlang' :
    ['AWAITING_IVA', 'ACTION_REQUIRED', 'REFERRED'].includes(r.followUpStatus) ? 'iva' : 'selesai'
  return { id: r.patientId, testId: r.testId, nama: r.patientId, usia: r.profile.age,
    source: r.sourceDevice, kategori: badgeCategory(r.programCategory), status: statusLabel(r.followUpStatus),
    aksi: 'Lihat tindak lanjut', tab, patient: patientViewModel(r),
    contactDate: dateLabel(r.followup.contactedAt), ivaDate: dateLabel(r.followup.ivaAt),
    ivaResult: r.followup.ivaResult || 'Belum tercatat', action: r.followup.recordedAction || 'Belum tercatat' }
}
