import type { Kategori, Skor } from '../components/ui'

export type TabKey = 'telepon' | 'iva' | 'ambilUlang' | 'selesai'

export type Pasien = {
  id: string
  nama: string
  usia: number
  kategori: Kategori
  skor?: Skor
  sla?: string
  status: string
  aksi: string
  tab: TabKey
}

// Synthetic data, as shown in the Figma "Kader · Tugas hari ini" frame.
export const pasienHariIni: Pasien[] = [
  { id: 's', nama: 'Ibu S.', usia: 38, kategori: 'positif1618', skor: 'tinggi', sla: 'Sisa 20 jam', status: 'Belum jadwal IVA', aksi: 'Telepon', tab: 'telepon' },
  { id: 'r', nama: 'Ibu R.', usia: 45, kategori: 'positifLain', skor: 'sedang', status: 'IVA hari Kamis, 22 Okt', aksi: 'Ingatkan', tab: 'iva' },
  { id: 'n', nama: 'Ibu N.', usia: 33, kategori: 'invalid', status: 'Perlu ambil ulang sampel', aksi: 'Hubungi', tab: 'ambilUlang' },
  { id: 'd', nama: 'Ibu D.', usia: 51, kategori: 'negatif', skor: 'rendah', status: 'Recall 10 tahun', aksi: 'Kirim info', tab: 'selesai' },
]

export const tabs: { key: TabKey; label: string }[] = [
  { key: 'telepon', label: 'Perlu ditelepon' },
  { key: 'iva', label: 'Pengingat IVA' },
  { key: 'ambilUlang', label: 'Ambil ulang' },
  { key: 'selesai', label: 'Selesai' },
]
