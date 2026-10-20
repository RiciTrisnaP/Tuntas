import { Link } from 'react-router-dom'
import {
  Card, CountBadge, DataSintetis, Funnel, Icon, KpiCard, LeakPill, Pill, Sidebar, asset, type Tahap,
} from '../components/ui'
import { dinkesNav, dinkesUser } from './dinkesNav'

const S = 'ringkasan'
const a = (n: string) => asset(S, n)

const filters = [
  { icon: 'f-periode', label: 'Periode', value: 'Jul–Sep 2026' },
  { icon: 'f-kota', label: 'Kota', value: 'Jakarta Pusat' },
  { icon: 'f-puskesmas', label: 'Puskesmas', value: 'Semua (3)' },
  { icon: 'f-kit', label: 'Kit', value: 'Semua kit' },
]

const skrining: Tahap[] = [
  { label: 'Diundang', value: 1250, display: '1.250', pct: 'basis' },
  { label: 'Sampel diambil', value: 1006, display: '1.006', pct: '80,5% lanjut', pctBold: true },
  { label: 'Hasil valid', value: 989, display: '989', pct: <>98,3% lanjut ·<br />6 menunggu hasil</>, pctBold: true },
]

const tindakLanjut: Tahap[] = [
  { label: 'Positif', value: 45, display: '45', pct: '4,6% dari valid' },
  { label: 'Dihubungi', value: 41, display: '41', pct: '91,1% lanjut', pctBold: true },
  { label: 'IVA', value: 29, display: '29', pct: <LeakPill screen={S}>70,7% lanjut</LeakPill> },
  { label: 'Diterapi', value: 24, display: '24', pct: '82,8% lanjut', pctBold: true },
]

type Status = 'tercapai' | 'bawah' | 'kritis'
const statusStyle: Record<Status, { label: string; track: string; fill: string; pill: string; icon: string }> = {
  tercapai: { label: 'Tercapai', track: 'bg-green-soft', fill: 'bg-green', pill: 'bg-green-soft text-green', icon: 'st-tercapai' },
  bawah: { label: 'Di bawah target', track: 'bg-amber-soft', fill: 'bg-amber', pill: 'bg-amber-soft text-amber-ink', icon: 'st-bawah' },
  kritis: { label: 'Kritis', track: 'bg-red-soft', fill: 'bg-red', pill: 'bg-red-soft text-red', icon: 'st-kritis' },
}

const TARGET = 80
const puskesmas: { nama: string; sudah: number; positif: number; status: Status; to?: string }[] = [
  { nama: 'Puskesmas A', sudah: 14, positif: 17, status: 'tercapai' },
  { nama: 'Puskesmas B', sudah: 9, positif: 14, status: 'bawah' },
  { nama: 'Puskesmas C', sudah: 6, positif: 14, status: 'kritis', to: '/dinkes/puskesmas/c' },
]

type Alarm = {
  judul: string; jumlah: string; detail: string; link: string; to?: string
  icon: string; kritis: boolean
}
const alarms: Alarm[] = [
  { judul: 'Sampel lebih dari 7 hari tanpa hasil', jumlah: '6 sampel', detail: 'Terlama 12 hari · 4 di antaranya dari Puskesmas C', link: 'Lihat sampel', icon: 'al-sampel', kritis: false },
  { judul: 'Positif lebih dari 60 hari belum IVA', jumlah: '5 peserta', detail: 'Puskesmas C 3 · Puskesmas B 2', link: 'Lihat peserta', icon: 'al-positif', kritis: true },
  { judul: 'Invalid di atas 5%', jumlah: '1 Puskesmas', detail: 'Puskesmas C · 5,6% (10 dari 180 sampel)', link: 'Lihat Puskesmas', to: '/dinkes/puskesmas/c', icon: 'al-invalid', kritis: false },
]

function AlarmCard({ al }: { al: Alarm }) {
  const tone = al.kritis ? 'bg-red-soft' : 'bg-amber-soft'
  const linkCls = 'flex items-center gap-2 py-2 text-[13px] font-bold text-teal hover:underline'
  const linkInner = <>{al.link}<Icon src={a('arrow')} size={14} /></>
  return (
    <div className="flex flex-col gap-2 rounded-[8px] border border-line bg-canvas p-4">
      <div className="flex items-center justify-between">
        <span className={`flex size-8 items-center justify-center rounded-[8px] ${tone}`}>
          <Icon src={a(al.icon)} size={16} />
        </span>
        <Pill
          icon={a(al.kritis ? 'sev-kritis' : 'sev-perhatian')}
          iconSize={12}
          className={al.kritis ? 'bg-red-soft text-red' : 'bg-amber-soft text-amber-ink'}
        >
          {al.kritis ? 'Kritis' : 'Perhatian'}
        </Pill>
      </div>
      <p className="text-[14px] font-semibold text-ink">{al.judul}</p>
      <p className="text-[24px] leading-[1.2] font-bold text-ink">{al.jumlah}</p>
      <p className="text-[13px] leading-[1.5] text-muted">{al.detail}</p>
      {al.to ? <Link to={al.to} className={linkCls}>{linkInner}</Link> : <button type="button" className={linkCls}>{linkInner}</button>}
    </div>
  )
}

export default function DinkesRingkasan() {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar screen={S} items={dinkesNav('ringkasan')} user={dinkesUser} />
      <main className="flex min-w-0 flex-1 flex-col gap-6 p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-[28px] font-bold tracking-[-0.5px] text-ink">Ringkasan skrining HPV DNA</h1>
            <p className="text-[14px] text-muted">Kaskade dari undangan hingga terapi · diperbarui 19 Okt 2026, 08.00 WIB</p>
          </div>
          <DataSintetis screen={S} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <button key={f.label} type="button" className="flex h-10 items-center gap-2 rounded-[8px] border border-line bg-white px-4 text-[13px] hover:border-muted">
              <Icon src={a(f.icon)} size={16} />
              <span className="text-muted">{f.label}</span>
              <span className="font-bold text-ink">{f.value}</span>
              <Icon src={a('chevron')} size={16} />
            </button>
          ))}
          <button type="button" className="flex h-10 items-center gap-2 px-2 text-[13px] font-semibold text-teal">
            <Icon src={a('reset')} size={14} />
            Atur ulang
          </button>
        </div>

        <div className="flex items-stretch gap-4">
          <KpiCard label="Diskrining" value="1.006" note="80,5% dari 1.250 diundang" icon={a('kpi-diskrining')} iconBox="bg-teal-soft" />
          <KpiCard label="Positif 16/18" value="12" note="1,2% dari 989 hasil valid" icon={a('kpi-positif')} iconBox="bg-red-soft" />
          <KpiCard label="Positif lain" value="33" note="3,3% dari 989 hasil valid" icon={a('kpi-lain')} iconBox="bg-amber-soft" />
          <KpiCard label="Invalid" value="1,1%" note={<>11 dari 1.000 diperiksa ·<br />batas 5%</>} icon={a('kpi-invalid')} iconBox="bg-gray-soft" />
          <KpiCard
            label="Sudah IVA ≤ 60 hari" value="64%" note="29 dari 45 positif" icon={a('kpi-iva')} iconBox="bg-navy-soft"
            progress={{ value: 64, target: TARGET, color: 'bg-amber' }}
          />
        </div>

        <div className="flex items-stretch gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <Card className="flex flex-col gap-6 p-6">
              <div className="flex flex-col">
                <h2 className="text-[18px] font-bold text-ink">Kaskade skrining</h2>
                <p className="text-[13px] text-muted">Jumlah peserta per tahap. Persen = yang lanjut dari tahap sebelumnya.</p>
              </div>
              <Funnel
                screen={S}
                slotWidth={88}
                skrining={{ title: 'SKRINING · SKALA 0–1.250', stages: skrining }}
                tindakLanjut={{ title: 'TINDAK LANJUT POSITIF · SKALA 0–45', stages: tindakLanjut }}
              />
              <p className="flex items-center gap-2 border-t border-line py-4 text-[13px] text-ink">
                <Icon src={a('insight')} size={16} />
                Kebocoran terbesar ada di tahap Dihubungi → IVA: 12 dari 41 peserta yang sudah dihubungi belum datang IVA.
              </p>
            </Card>

            <Card className="flex flex-col gap-6 p-6">
              <div className="flex items-end justify-between">
                <div className="flex flex-col">
                  <h2 className="text-[18px] font-bold text-ink">Positif sudah IVA dalam 60 hari</h2>
                  <p className="text-[13px] text-muted">Per Puskesmas · persen dari peserta positif</p>
                </div>
                <span className="flex items-center gap-2 text-[12px] font-semibold text-muted">
                  <span className="h-4 w-0.5 bg-ink" />
                  Target {TARGET}%
                </span>
              </div>
              <div className="flex flex-col gap-4">
                {puskesmas.map((p) => {
                  const pct = Math.round((p.sudah / p.positif) * 100)
                  const st = statusStyle[p.status]
                  const name = (
                    <div className="flex w-36 shrink-0 flex-col">
                      <span className="text-[14px] font-semibold text-ink">{p.nama}</span>
                      <span className="text-[12px] text-muted">{p.sudah} dari {p.positif} positif</span>
                    </div>
                  )
                  return (
                    <div key={p.nama} className="flex items-center gap-4">
                      {p.to ? <Link to={p.to} className="hover:underline">{name}</Link> : name}
                      <div className={`relative h-4 min-w-0 flex-1 rounded-[4px] ${st.track}`}>
                        <div className={`absolute inset-y-0 left-0 rounded-r-[4px] ${st.fill}`} style={{ width: `${pct}%` }} />
                        <div className="absolute -top-1 h-6 w-0.5 bg-ink" style={{ left: `${TARGET}%` }} />
                      </div>
                      <span className="w-12 shrink-0 text-right text-[16px] font-bold text-ink">{pct}%</span>
                      <div className="w-36 shrink-0">
                        <Pill icon={a(st.icon)} className={st.pill}>{st.label}</Pill>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-4">
                <div className="w-36 shrink-0" />
                <div className="flex flex-1 justify-between text-[12px] text-muted">
                  {['0%', '25%', '50%', '75%', '100%'].map((t) => <span key={t}>{t}</span>)}
                </div>
                <div className="w-52 shrink-0" />
              </div>
            </Card>
          </div>

          <Card className="flex w-[360px] shrink-0 flex-col gap-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-[18px] font-bold text-ink">
                <Icon src={a('alarm')} size={20} />
                Alarm
              </h2>
              <CountBadge>{alarms.length} aktif</CountBadge>
            </div>
            {alarms.map((al) => <AlarmCard key={al.judul} al={al} />)}
            <p className="text-[12px] leading-[1.5] text-muted">
              Ambang alarm mengikuti pedoman program dan dapat diatur oleh admin Dinkes.
            </p>
          </Card>
        </div>
      </main>
    </div>
  )
}
