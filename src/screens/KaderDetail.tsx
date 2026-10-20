import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Card, CardHead, Icon, KategoriBadge, PhoneFrame, Pill, SkorChip, StatusBar, asset } from '../components/ui'
import CatatHasilSheet from './CatatHasilSheet'

const S = 'detail'
const a = (n: string) => asset(S, n)

type Langkah = { label: string; sub: string; state: 'done' | 'current' | 'todo' }

const perjalanan: Langkah[] = [
  { label: 'Undangan', sub: '5 Okt 2026', state: 'done' },
  { label: 'Sampel', sub: '13 Okt 2026 · self-swab', state: 'done' },
  { label: 'Hasil', sub: '18 Okt 2026', state: 'done' },
  { label: 'Dihubungi', sub: 'Sedang berjalan · 3 percobaan', state: 'current' },
  { label: 'IVA', sub: 'Belum dijadwalkan', state: 'todo' },
  { label: 'Terapi/Recall', sub: 'Menunggu hasil IVA', state: 'todo' },
]

const hasil: { label: string; value: string; danger?: boolean }[] = [
  { label: 'Genotipe', value: 'HPV 16 terdeteksi', danger: true },
  { label: 'Kit', value: 'CerviScan' },
  { label: 'Cara ambil sampel', value: 'Self-swab' },
  { label: 'Tanggal sampel', value: '13 Okt 2026' },
]

const faktor = [
  { label: 'HPV 16 terdeteksi', poin: 3, icon: 'f-hpv' },
  { label: 'Usia di atas 35', poin: 1, icon: 'f-usia' },
  { label: 'Belum pernah skrining', poin: 1, icon: 'f-skrining' },
]

const skrip = [
  { judul: 'Buka', isi: '“Selamat pagi, Ibu S. Saya kader dari Puskesmas Cempaka Putih. Apakah Ibu sedang bisa bicara sebentar secara pribadi?”' },
  { judul: 'Sampaikan', isi: '“Hasil tes HPV Ibu menunjukkan ada virus HPV tipe 16. Ini bukan berarti kanker, tetapi perlu diperiksa lanjut dengan IVA agar bisa ditangani lebih awal.”' },
  { judul: 'Ajak', isi: '“Kapan Ibu bisa datang ke Puskesmas untuk pemeriksaan IVA? Pemeriksaannya singkat.”' },
]

const riwayat: { judul: string; meta: string; icon: string; dot: string; note?: string }[] = [
  { judul: 'Telepon · tidak diangkat', meta: 'Hari ini, 08.15 · Kader Rina', icon: 'ev-missed', dot: 'bg-red-soft' },
  { judul: 'WhatsApp terkirim', meta: 'Kemarin, 16.40 · Kader Rina', icon: 'ev-wa', dot: 'bg-teal-soft', note: 'Undangan pemeriksaan lanjutan. Dibaca, belum dibalas.' },
  { judul: 'Telepon · tidak diangkat', meta: 'Kemarin, 10.20 · Kader Rina', icon: 'ev-missed', dot: 'bg-red-soft' },
  { judul: 'Tugas dibuat otomatis', meta: 'Kemarin, 09.30 · Sistem TUNTAS', icon: 'ev-system', dot: 'bg-gray-soft', note: 'Hasil Positif 16/18 masuk dari lab.' },
]

function StepDot({ i, state }: { i: number; state: Langkah['state'] }) {
  if (state === 'done')
    return (
      <span className="flex size-6 items-center justify-center rounded-full bg-teal">
        <Icon src={a('check')} size={14} />
      </span>
    )
  if (state === 'current')
    return (
      <span className="flex size-6 items-center justify-center rounded-full border-4 border-navy-soft bg-navy text-[12px] font-bold text-white">
        {i + 1}
      </span>
    )
  return (
    <span className="flex size-6 items-center justify-center rounded-full border-2 border-line bg-white text-[12px] font-bold text-muted">
      {i + 1}
    </span>
  )
}

export default function KaderDetail({ sheetOpen = false }: { sheetOpen?: boolean }) {
  const { id = 's' } = useParams()
  const navigate = useNavigate()
  const [skripOpen, setSkripOpen] = useState(true)
  const current = perjalanan.findIndex((l) => l.state === 'current')
  const total = faktor.reduce((n, f) => n + f.poin, 0)

  return (
    <PhoneFrame>
      <StatusBar screen={S} />
      <header className="flex h-14 items-center justify-between px-2">
        <Link to="/kader" aria-label="Kembali" className="flex size-10 items-center justify-center rounded-[8px] hover:bg-navy-soft">
          <Icon src={a('back')} size={22} />
        </Link>
        <h1 className="text-[16px] font-bold text-ink">Detail pasien</h1>
        <button type="button" aria-label="Lainnya" className="flex size-10 items-center justify-center rounded-[8px] hover:bg-navy-soft">
          <Icon src={a('more')} size={22} />
        </button>
      </header>

      <main className="flex flex-col gap-4 px-4 pt-2 pb-6">
        <section className="flex flex-col gap-4 pb-2">
          <div className="flex items-center gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-navy-soft text-[22px] font-bold text-navy">S</span>
            <div className="flex flex-col">
              <span className="text-[24px] font-bold tracking-[-0.3px] text-ink">Ibu S., 38 tahun</span>
              <span className="text-[14px] text-muted">NIK •••• 0142 · RW 05 Cempaka Putih</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <KategoriBadge kategori="positif1618" screen={S} />
            <SkorChip skor="tinggi" screen={S} />
            <Pill icon={a('sla')} className="bg-amber-soft text-amber-ink">Sisa 24 jam</Pill>
          </div>
        </section>

        <Card className="flex flex-col gap-4 p-4">
          <CardHead title="Perjalanan skrining" meta={`Langkah ${current + 1} dari ${perjalanan.length}`} />
          <ol className="flex flex-col">
            {perjalanan.map((l, i) => {
              const last = i === perjalanan.length - 1
              return (
                <li key={l.label} className={`flex gap-4 ${last ? 'h-10' : 'h-14'}`}>
                  <div className="flex w-6 flex-col items-center">
                    <StepDot i={i} state={l.state} />
                    {!last && <div className={`w-0.5 flex-1 ${l.state === 'done' ? 'bg-teal' : 'bg-line'}`} />}
                  </div>
                  <div className={`flex flex-1 flex-col ${last ? '' : 'pb-4'}`}>
                    <span className={`text-[14px] leading-[1.7] ${
                      l.state === 'current' ? 'font-bold text-navy' : l.state === 'done' ? 'font-semibold text-ink' : 'font-semibold text-muted'
                    }`}>{l.label}</span>
                    <span className={`text-[13px] ${l.state === 'current' ? 'font-semibold text-teal' : 'text-muted'}`}>{l.sub}</span>
                  </div>
                </li>
              )
            })}
          </ol>
        </Card>

        <Card className="flex flex-col gap-4 p-4">
          <CardHead title="Hasil tes HPV DNA" meta="18 Okt 2026" />
          <dl className="flex flex-col text-[14px]">
            <div className="flex h-10 items-center justify-between border-b border-line">
              <dt className="text-muted">Kategori</dt>
              <dd><KategoriBadge kategori="positif1618" screen={S} /></dd>
            </div>
            {hasil.map((r, i) => (
              <div key={r.label} className={`flex h-10 items-center justify-between ${i < hasil.length - 1 ? 'border-b border-line' : ''}`}>
                <dt className="text-muted">{r.label}</dt>
                <dd className={`font-semibold ${r.danger ? 'text-red' : 'text-ink'}`}>{r.value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-ink">Kenapa prioritas Tinggi?</h2>
            <SkorChip skor="tinggi" screen={S} />
          </div>
          <ul className="flex flex-col gap-2">
            {faktor.map((f) => (
              <li key={f.label} className="flex items-center gap-4 rounded-[8px] bg-canvas p-2">
                <span className="flex size-8 items-center justify-center rounded-[8px] bg-white">
                  <Icon src={a(f.icon)} size={16} />
                </span>
                <span className="flex-1 text-[14px] font-medium text-ink">{f.label}</span>
                <span className="flex h-6 items-center rounded-full bg-red-soft px-2 text-[13px] font-bold text-red">+{f.poin}</span>
              </li>
            ))}
          </ul>
          <div className="flex h-[49px] items-center justify-between border-t border-line px-2 py-4 text-[14px]">
            <span className="font-semibold text-ink">Total skor</span>
            <span className="font-bold text-red">{total} poin · Tinggi</span>
          </div>
          <p className="flex gap-2 text-[12px] text-muted">
            <Icon src={a('info')} size={14} />
            Skor menentukan urutan prioritas, bukan diagnosis.
          </p>
        </Card>

        <Card className="flex flex-col">
          <button
            type="button"
            onClick={() => setSkripOpen((o) => !o)}
            aria-expanded={skripOpen}
            className={`flex h-16 items-center gap-4 p-4 text-left ${skripOpen ? 'border-b border-line' : ''}`}
          >
            <span className="flex size-8 items-center justify-center rounded-[8px] bg-teal-soft">
              <Icon src={a('skrip')} size={16} />
            </span>
            <span className="flex-1 text-[15px] font-bold text-ink">Skrip konseling Positif 16/18</span>
            <Icon src={a('chevron')} size={20} className={skripOpen ? '' : 'rotate-180'} />
          </button>
          {skripOpen && (
            <div className="flex flex-col gap-4 p-4">
              {skrip.map((s, i) => (
                <div key={s.judul} className="flex gap-4">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-navy-soft text-[12px] font-bold text-navy">{i + 1}</span>
                  <div className="flex flex-1 flex-col">
                    <span className="text-[13px] leading-[1.8] font-bold text-navy">{s.judul}</span>
                    <p className="text-[14px] leading-[1.6] text-ink">{s.isi}</p>
                  </div>
                </div>
              ))}
              <p className="flex gap-2 rounded-[8px] bg-amber-soft p-4 text-[13px] leading-[1.5] text-amber-ink">
                <Icon src={a('tip')} size={16} />
                Bila Ibu cemas, menolak, atau bertanya hal medis, eskalasikan ke konselor.
              </p>
            </div>
          )}
        </Card>

        <button
          type="button"
          className="flex h-12 items-center justify-center gap-2 rounded-[8px] border border-line bg-white px-4 text-[14px] font-semibold text-navy hover:bg-canvas"
        >
          <Icon src={a('eskalasi')} size={16} />
          Eskalasi ke konselor
        </button>

        <Card className="flex flex-col gap-4 p-4">
          <CardHead title="Riwayat kontak" meta={`${riwayat.length} aktivitas`} />
          <ol className="flex flex-col">
            {riwayat.map((e, i) => {
              const last = i === riwayat.length - 1
              return (
                <li key={i} className="flex gap-4">
                  <div className="flex w-8 flex-col items-center">
                    <span className={`flex size-8 items-center justify-center rounded-full ${e.dot}`}>
                      <Icon src={a(e.icon)} size={16} />
                    </span>
                    {!last && <div className="w-0.5 flex-1 bg-line" />}
                  </div>
                  <div className={`flex flex-1 flex-col ${last ? '' : 'pb-4'}`}>
                    <span className="text-[14px] font-semibold text-ink">{e.judul}</span>
                    <span className="text-[12px] leading-[1.6] text-muted">{e.meta}</span>
                    {e.note && (
                      <div className="py-2">
                        <p className="rounded-[8px] bg-canvas px-4 py-2 text-center text-[13px] leading-[1.5] text-ink">{e.note}</p>
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </Card>
      </main>

      <footer className="sticky bottom-0 flex h-[88px] gap-2 border-t border-line bg-white px-4 pt-4 pb-6">
        <a href="tel:" aria-label="Telepon" className="flex size-12 shrink-0 items-center justify-center rounded-[8px] border border-line bg-white">
          <Icon src={a('ab-phone')} size={20} />
        </a>
        <Link
          to={`/kader/pasien/${id}/catat`}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[8px] bg-teal px-4 text-[15px] font-semibold text-white hover:brightness-110"
        >
          <Icon src={a('ab-note')} size={16} />
          Catat hasil kontak
        </Link>
      </footer>

      {sheetOpen && <CatatHasilSheet onClose={() => navigate(`/kader/pasien/${id}`)} />}
    </PhoneFrame>
  )
}
