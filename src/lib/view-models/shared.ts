import type { Dataset, FollowUpStatus, ProgramCategory, QualitativeResult, Screening } from '../domain/types.ts'

export type BadgeCategory = 'positif1618' | 'positifLain' | 'invalid' | 'negatif'
const BADGES: Record<ProgramCategory, BadgeCategory> = { NEGATIVE: 'negatif', POSITIVE_16_18: 'positif1618', POSITIVE_OTHER: 'positifLain', INVALID: 'invalid' }
export const badgeCategory = (category: ProgramCategory) => BADGES[category]
export const categoryLabel = (category: ProgramCategory) => ({ NEGATIVE: 'Negatif', POSITIVE_16_18: 'Positif 16/18', POSITIVE_OTHER: 'Positif lain', INVALID: 'Invalid' })[category]
export const resultLabel = (result: QualitativeResult) => ({ POSITIVE: 'Terdeteksi', NEGATIVE: 'Tidak terdeteksi', INVALID: 'Tidak dapat dinilai', NOT_AVAILABLE: 'Tidak tersedia' })[result]
export const dateLabel = (date: string | null) => date ? new Intl.DateTimeFormat('id-ID', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
}).format(new Date(`${date.slice(0, 10)}T00:00:00Z`)) : 'Belum tercatat'
export const numberLabel = (value: number) => new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(value)
export const percent = (numerator: number, denominator: number): number | null => denominator ? numerator / denominator * 100 : null
export const percentLabel = (value: number | null) => value == null ? 'Tidak tersedia' : `${numberLabel(value)}%`
export const statusLabel = (status: FollowUpStatus) => ({ ROUTINE_RECALL: 'Recall rutin', RETEST_REQUIRED: 'Perlu pemeriksaan ulang',
  AWAITING_CONTACT: 'Menunggu kontak', AWAITING_IVA: 'IVA belum tercatat', FOLLOW_UP_COMPLETE: 'Tindak lanjut selesai; recall',
  ACTION_REQUIRED: 'Tindak lanjut tenaga medis', REFERRED: 'Rujukan tercatat' })[status]
export function availabilityLabel(result: Screening) {
  if (result.sourceDevice === 'cobas') return 'Hasil kategori; Ct belum dikonfirmasi; HPV52 tidak terpisah'
  if (result.sourceDevice === 'CerviScan') return 'Ct lima target; profil peserta dan metode swab tidak disertakan'
  return 'Ct dan pra-analitik; cabang B bila tersedia; kurva amplifikasi tidak disertakan'
}
export const snapshotNotice = (dataset: Dataset) => `Data sintetis: snapshot skenario dengan tindak lanjut hingga ${dateLabel(dataset.metadata.lastRecordedIvaDate)}. Bukan status hari ini atau prevalensi populasi.`
export const resultPeriod = (dataset: Dataset) => `${dateLabel(dataset.metadata.firstResultDate)} – ${dateLabel(dataset.metadata.lastResultDate)}`
