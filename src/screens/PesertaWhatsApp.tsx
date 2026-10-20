import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon, PhoneFrame, StatusBar, asset } from '../components/ui'

const S = 'wa'
const a = (n: string) => asset(S, n)

type Pesan = {
  tanggal: string
  judul: string
  isi: string[]
  jam: string
  tautan?: { label: string; icon: string }[]
}

// Each "" in isi is a blank line, as in the Figma bubbles.
const percakapan: Pesan[] = [
  {
    tanggal: 'Senin, 5 Oktober 2026',
    judul: 'Undangan Cek Kesehatan Gratis',
    isi: [
      'Halo Bu Sari 👋',
      'Puskesmas Cempaka Putih mengundang Ibu mengikuti Cek Kesehatan Gratis, termasuk tes HPV untuk menjaga kesehatan leher rahim.',
      '',
      '📅 Sabtu, 10 Oktober 2026',
      '🕗 08.00–11.00 WIB',
      '📍 Puskesmas Cempaka Putih',
    ],
    jam: '09.00',
    tautan: [{ label: 'Lihat info', icon: 'link' }],
  },
  {
    tanggal: 'Kamis, 8 Oktober 2026',
    judul: 'Pengingat: 2 hari lagi',
    isi: [
      'Bu Sari, jadwal Cek Kesehatan Gratis Ibu hari Sabtu, 10 Oktober 2026 pukul 08.00 WIB.',
      '',
      'Agar hasilnya akurat, mohon pastikan:',
      '✅ Ibu tidak sedang haid',
      '✅ Tidak berhubungan suami istri 2 hari sebelum pemeriksaan',
      '',
      'Sampai bertemu, Bu 🙏',
    ],
    jam: '08.30',
  },
  {
    tanggal: 'Jumat, 16 Oktober 2026',
    judul: 'Hasil pemeriksaan sudah tersedia',
    isi: [
      'Hasil pemeriksaan Ibu sudah tersedia di aplikasi SATUSEHAT Mobile. Bila perlu pemeriksaan lanjutan, kader Puskesmas akan menghubungi Ibu dalam 48 jam.',
    ],
    jam: '10.15',
    tautan: [{ label: 'Buka SATUSEHAT Mobile', icon: 'link' }],
  },
  {
    tanggal: 'Hari ini',
    judul: 'Pengingat jadwal IVA',
    isi: [
      'Bu Sari, ini pengingat jadwal pemeriksaan lanjutan (IVA) Ibu:',
      '',
      '📅 Kamis, 22 Oktober 2026',
      '🕘 09.00 WIB',
      '📍 Puskesmas Cempaka Putih',
      '',
      'Pemeriksaan hanya beberapa menit. Ibu boleh datang ditemani keluarga.',
    ],
    jam: '07.30',
    tautan: [
      { label: 'Saya akan datang', icon: 'link' },
      { label: 'Ubah jadwal', icon: 'link-cal' },
    ],
  },
]

function DateChip({ children }: { children: string }) {
  return (
    <div className="flex justify-center py-2">
      <span className="flex h-6 items-center rounded-[8px] bg-white px-2 text-[12px] font-semibold text-muted">{children}</span>
    </div>
  )
}

export default function PesertaWhatsApp() {
  const [draft, setDraft] = useState('')

  return (
    <PhoneFrame className="bg-wa-bg">
      <div className="sticky top-0 z-10">
        <StatusBar screen={S} className="bg-white" />
        <header className="flex h-16 items-center gap-2 border-b border-line bg-white px-2">
          <Link to="/" aria-label="Kembali"><Icon src={a('back')} size={24} /></Link>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-navy">
            <Icon src={a('mark')} size={20} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-2">
              <span className="flex-1 text-[15px] font-bold text-ink">TUNTAS Puskesmas Cempaka Putih</span>
              <Icon src={a('verified')} size={16} />
            </div>
            <span className="text-[12px] text-muted">Akun bisnis resmi</span>
          </div>
          <button type="button" aria-label="Telepon"><Icon src={a('call')} size={20} /></button>
          <button type="button" aria-label="Lainnya"><Icon src={a('more')} size={20} /></button>
        </header>
      </div>

      <main className="flex flex-1 flex-col gap-2 px-2 py-4">
        <div className="flex justify-center px-6 pb-2">
          <p className="flex gap-2 rounded-[8px] bg-amber-soft px-4 py-2 text-center text-[12px] leading-[1.5] text-amber-ink">
            <Icon src={a('lock')} size={12} className="mt-0.5" />
            Ini akun bisnis resmi Puskesmas Cempaka Putih. Pesan dilindungi enkripsi end-to-end.
          </p>
        </div>

        {percakapan.map((m) => (
          <div key={m.judul} className="flex flex-col gap-2">
            <DateChip>{m.tanggal}</DateChip>
            <article className="flex w-[320px] flex-col gap-2 rounded-tl-[4px] rounded-tr-[12px] rounded-br-[12px] rounded-bl-[12px] bg-white py-2 pr-2 pl-4 shadow-[0_1px_1px_rgba(26,36,51,0.08)]">
              <h2 className="text-[14px] font-bold text-ink">{m.judul}</h2>
              <div className="text-[14px] leading-[1.5] text-wa-ink">
                {m.isi.map((line, i) => <p key={i}>{line || ' '}</p>)}
              </div>
              <span className="self-end text-[11px] text-wa-meta">{m.jam}</span>
              {m.tautan && (
                <div className="flex flex-col border-t border-[rgba(11,20,26,0.1)]">
                  {m.tautan.map((t) => (
                    <button key={t.label} type="button" className="flex items-center justify-center gap-2 py-2 text-[14px] font-semibold text-teal">
                      <Icon src={a(t.icon)} size={16} />
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </article>
          </div>
        ))}
      </main>

      <form
        onSubmit={(e) => { e.preventDefault(); setDraft('') }}
        className="sticky bottom-0 flex items-center gap-2 bg-wa-bg px-2 pt-2 pb-6"
      >
        <div className="flex h-12 flex-1 items-center gap-4 rounded-full bg-white px-4">
          <Icon src={a('emoji')} size={22} />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ketik pesan"
            aria-label="Ketik pesan"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted"
          />
          <Icon src={a('attach')} size={20} />
        </div>
        <button type="submit" aria-label="Kirim" className="flex size-12 shrink-0 items-center justify-center rounded-full bg-teal">
          <Icon src={a('mic')} size={22} />
        </button>
      </form>
    </PhoneFrame>
  )
}
