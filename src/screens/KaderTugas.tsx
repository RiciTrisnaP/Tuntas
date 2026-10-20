import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Icon, KategoriBadge, Logo, PhoneFrame, Pill, SkorChip, StatusBar, asset } from '../components/ui'
import { pasienHariIni, tabs, type Pasien, type TabKey } from '../data/kader'

const S = 'tugas'
const a = (n: string) => asset(S, n)

function KartuPasien({ p }: { p: Pasien }) {
  return (
    <Card className="flex w-full flex-col gap-4 p-4">
      <Link to={`/kader/pasien/${p.id}`} className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-navy-soft text-[16px] font-bold text-navy">
            {p.nama.charAt(4)}
          </span>
          <div className="flex flex-1 flex-col">
            <span className="text-[16px] font-bold text-ink">{p.nama}</span>
            <span className="text-[14px] text-muted">{p.usia} tahun</span>
          </div>
          {p.skor && <SkorChip skor={p.skor} screen={S} />}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <KategoriBadge kategori={p.kategori} screen={S} />
            {p.sla && <Pill icon={a('sla')} className="bg-amber-soft text-amber-ink">{p.sla}</Pill>}
          </div>
          <div className="flex items-center gap-2">
            <Icon src={a('status-cal')} size={16} />
            <span className="text-[14px] font-medium text-ink">{p.status}</span>
          </div>
        </div>
      </Link>
      <button
        type="button"
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-teal px-4 text-[14px] font-semibold text-white hover:brightness-110"
      >
        <Icon src={a('phone')} size={16} />
        {p.aksi}
      </button>
    </Card>
  )
}

function NavTab({ icon, label, active }: { icon: string; label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={`flex h-full min-w-0 flex-1 flex-col items-center justify-center rounded-full px-3 py-2 text-[12px] ${
        active ? 'bg-teal-soft font-bold text-teal' : 'font-medium text-muted'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      <Icon src={a(icon)} size={22} />
      {label}
    </button>
  )
}

export default function KaderTugas() {
  const [tab, setTab] = useState<TabKey>('telepon')
  // "Perlu ditelepon" is the full call queue; other tabs narrow it down.
  const list = tab === 'telepon' ? pasienHariIni : pasienHariIni.filter((p) => p.tab === tab)
  const lewatBatas = 2

  return (
    <PhoneFrame>
      <StatusBar screen={S} />
      <main className="flex flex-1 flex-col gap-6 px-4 pt-2 pb-6">
        <header className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Link to="/"><Logo screen={S} /></Link>
            <div className="flex items-center gap-2">
              <Icon src={a('cal')} size={16} />
              <span className="text-[13px] font-medium text-muted">Senin, 19 Okt 2026</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] font-semibold text-teal">Puskesmas Cempaka Putih</span>
            <h1 className="text-[28px] font-bold tracking-[-0.5px] text-ink">Tugas hari ini</h1>
          </div>
          <Card className="flex h-[72px]">
            <div className="flex flex-1 items-center gap-4 p-4">
              <span className="flex size-10 items-center justify-center rounded-[8px] bg-teal-soft">
                <Icon src={a('stat-phone')} size={20} />
              </span>
              <div className="flex flex-col">
                <span className="text-[24px] leading-[1.2] font-bold text-ink">5</span>
                <span className="text-[13px] text-muted">perlu ditelepon</span>
              </div>
            </div>
            <div className="flex flex-1 items-center gap-4 border-l border-line p-4">
              <span className="flex size-10 items-center justify-center rounded-[8px] bg-red-soft">
                <Icon src={a('stat-alarm')} size={20} />
              </span>
              <div className="flex flex-col">
                <span className="text-[24px] leading-[1.2] font-bold text-red">{lewatBatas}</span>
                <span className="text-[13px] text-muted">lewat batas</span>
              </div>
            </div>
          </Card>
        </header>

        <div role="tablist" className="flex h-10 justify-between border-b border-line">
          {tabs.map((t) => (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`-mb-px flex h-10 items-center text-[14px] whitespace-nowrap ${
                tab === t.key ? 'border-b-2 border-navy font-bold text-navy' : 'font-medium text-muted'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-muted">Urut skor tertinggi</span>
            <button type="button" aria-label="Ubah urutan"><Icon src={a('sort')} size={16} /></button>
          </div>
          {list.map((p) => <KartuPasien key={p.id} p={p} />)}
          {list.length === 0 && (
            <p className="py-8 text-center text-[14px] text-muted">Tidak ada tugas di daftar ini.</p>
          )}
        </section>

        <p className="flex items-center justify-center gap-2 text-[12px] text-muted">
          <Icon src={a('info')} size={14} />
          Skor menentukan urutan prioritas, bukan diagnosis.
        </p>
      </main>

      <nav className="sticky bottom-0 px-4 pb-4">
        <div className="flex h-16 items-center gap-2 rounded-full border border-line bg-white/90 p-2 shadow-[0_4px_16px_rgba(26,36,51,0.08)] backdrop-blur">
          <NavTab icon="nav-tugas" label="Tugas" active />
          <NavTab icon="nav-pasien" label="Pasien" />
          <NavTab icon="nav-profil" label="Profil" />
        </div>
      </nav>
    </PhoneFrame>
  )
}
