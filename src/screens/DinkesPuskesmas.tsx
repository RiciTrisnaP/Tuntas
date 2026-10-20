import { Link } from 'react-router-dom'
import { Card, DataSintetis, Funnel, Icon, KpiCard, LeakPill, Sidebar, asset, type Tahap } from '../components/ui'
import { dinkesNav, dinkesUser } from './dinkesNav'

const S = 'puskesmas'
const a = (n: string) => asset(S, n)

const skrining: Tahap[] = [
  { label: 'Diundang', value: 240, display: '240', pct: 'basis' },
  { label: 'Sampel diambil', value: 184, display: '184', pct: '76,7% lanjut' },
  { label: 'Hasil valid', value: 170, display: '170', pct: <>92,4% lanjut ·<br />4 menunggu hasil</> },
]

const tindakLanjut: Tahap[] = [
  { label: 'Positif', value: 14, display: '14', pct: '8,2% dari valid' },
  { label: 'Dihubungi', value: 11, display: '11', pct: '78,6% lanjut' },
  { label: 'IVA', value: 6, display: '6', pct: <LeakPill screen={S}>54,5% lanjut</LeakPill> },
  { label: 'Diterapi', value: 4, display: '4', pct: '66,7% lanjut' },
]

const kader: { nama: string; aktif: number; selesai: number; waktu: string; overSla?: boolean }[] = [
  { nama: 'Rina Wulandari', aktif: 3, selesai: 2, waktu: '1,4 hari' },
  { nama: 'Siti Aminah', aktif: 2, selesai: 1, waktu: '1,9 hari' },
  { nama: 'Yuni Kartika', aktif: 1, selesai: 0, waktu: '4,1 hari', overSla: true },
  { nama: 'Lilis Suryani', aktif: 2, selesai: 1, waktu: '1,7 hari' },
]

const yTicks = [0, 25, 50, 75, 100]
const xTicks = [
  { label: '13 Jul', x: 71 }, { label: '27 Jul', x: 133 }, { label: '10 Agu', x: 195 },
  { label: '24 Agu', x: 256 }, { label: '7 Sep', x: 318 }, { label: '21 Sep', x: 380 },
]
// Chart geometry from Figma: plot spans x 40→380, y 192 (0%) → 16 (100%).
const yFor = (pct: number) => 192 - (pct / 100) * 176

function TrenChart() {
  return (
    <div className="relative h-[232px] w-[428px]">
      {yTicks.map((t) => (
        <div key={t}>
          <div className="absolute left-10 h-px w-[340px] bg-line" style={{ top: yFor(t) }} />
          <span className="absolute w-9 -translate-x-full text-right text-[12px] text-muted" style={{ left: 34, top: yFor(t) - 8 }}>
            {t}%
          </span>
        </div>
      ))}
      <div className="absolute left-10 h-px w-[340px] bg-ink" style={{ top: 51 }} />
      <span className="absolute left-12 top-[31px] text-[12px] font-bold text-ink">Target 80%</span>
      <div className="absolute left-10 top-[116.3px] h-[40.5px] w-[340px]">
        <div className="absolute inset-[-2.47%_-0.29%]">
          <img src={a('garis-tren')} alt="" className="block size-full max-w-none" />
        </div>
      </div>
      <div className="absolute left-[375px] top-[111.32px] size-[10px]">
        <div className="absolute inset-[-20%]">
          <img src={a('end-dot')} alt="" className="block size-full max-w-none" />
        </div>
      </div>
      <span className="absolute left-[390px] top-[106.32px] text-[14px] font-bold text-ink">43%</span>
      {xTicks.map((t) => (
        <span key={t.label} className="absolute top-[200px] w-12 -translate-x-1/2 text-center text-[12px] text-muted" style={{ left: t.x }}>
          {t.label}
        </span>
      ))}
    </div>
  )
}

export default function DinkesPuskesmas() {
  const total = kader.reduce((s, k) => ({ aktif: s.aktif + k.aktif, selesai: s.selesai + k.selesai }), { aktif: 0, selesai: 0 })

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar screen={S} items={dinkesNav('puskesmas')} user={dinkesUser} />
      <main className="flex min-w-0 flex-1 flex-col gap-6 p-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px]">
          <Link to="/dinkes" className="flex items-center gap-2 font-semibold text-teal hover:underline">
            <Icon src={a('back')} size={16} />
            Ringkasan
          </Link>
          <Icon src={a('sep')} size={14} />
          <span className="text-muted">Puskesmas C</span>
        </nav>

        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <h1 className="text-[28px] font-bold tracking-[-0.5px] text-ink">Puskesmas C, Jakarta Pusat</h1>
              <span className="inline-flex h-7 items-center gap-2 rounded-full border border-red bg-red-soft px-2">
                <Icon src={a('kritis')} size={14} />
                <span className="text-[13px] font-bold text-red">Kritis</span>
              </span>
            </div>
            <p className="text-[14px] text-muted">Periode Jul–Sep 2026 · semua kit · data agregat, tanpa identitas peserta</p>
          </div>
          <DataSintetis screen={S} />
        </div>

        <div className="flex items-stretch gap-4">
          <KpiCard label="Diskrining" value="184" note="76,7% dari 240 diundang" icon={a('kpi-diskrining')} iconBox="bg-teal-soft" />
          <KpiCard label="Positif" value="14" note="8,2% dari 170 hasil valid" icon={a('kpi-positif')} iconBox="bg-red-soft" />
          <KpiCard
            label="Sudah IVA ≤ 60 hari" value="43%" note="6 dari 14 positif" icon={a('kpi-iva')} iconBox="bg-navy-soft"
            progress={{ value: 43, target: 80, color: 'bg-red' }}
          />
          <KpiCard label="Invalid" value="5,6%" note={<>10 dari 180 diperiksa ·<br />batas 5%</>} icon={a('kpi-invalid')} iconBox="bg-red-soft" />
        </div>

        <Card className="flex flex-col gap-6 p-6">
          <div className="flex flex-col">
            <h2 className="text-[18px] font-bold text-ink">Kaskade skrining Puskesmas C</h2>
            <p className="text-[13px] text-muted">Jumlah peserta per tahap. Persen = yang lanjut dari tahap sebelumnya.</p>
          </div>
          <Funnel
            screen={S}
            slotWidth={104}
            skrining={{ title: 'SKRINING · SKALA 0–240', stages: skrining }}
            tindakLanjut={{ title: 'TINDAK LANJUT POSITIF · SKALA 0–14', stages: tindakLanjut }}
          />
          <p className="flex items-center gap-2 border-t border-line py-4 text-[13px] text-ink">
            <Icon src={a('insight')} size={16} />
            Kebocoran terbesar di tahap Dihubungi → IVA: 5 dari 11 peserta yang sudah dihubungi belum datang IVA. Invalid 5,6% juga di atas batas 5%.
          </p>
        </Card>

        <div className="flex items-stretch gap-6">
          <Card className="flex min-w-0 flex-1 flex-col gap-4 p-6">
            <div className="flex flex-col">
              <h2 className="text-[18px] font-bold text-ink">% positif sudah IVA ≤ 60 hari</h2>
              <p className="text-[13px] text-muted">Mingguan, 12 minggu terakhir · Jul–Sep 2026</p>
            </div>
            <TrenChart />
            <p className="flex items-center gap-2 text-[13px] text-ink">
              <Icon src={a('trend')} size={16} />
              Naik 23 poin dalam 12 minggu, tetapi masih 37 poin di bawah target.
            </p>
          </Card>

          <Card className="flex min-w-0 flex-1 flex-col gap-4 p-6">
            <div className="flex flex-col">
              <h2 className="text-[18px] font-bold text-ink">Kinerja kader</h2>
              <p className="text-[13px] text-muted">Agregat per kader · tanpa data peserta</p>
            </div>
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-line text-[12px] leading-[1.4] font-bold tracking-[0.5px] text-muted">
                  <th className="h-[52px] py-2 text-left align-bottom">NAMA KADER</th>
                  <th className="w-16 py-2 pl-4 text-right align-bottom">TUGAS AKTIF</th>
                  <th className="w-24 py-2 pl-4 text-right align-bottom">SELESAI MINGGU INI</th>
                  <th className="w-[120px] py-2 pl-4 text-right align-bottom">RATA-RATA WAKTU KONTAK</th>
                </tr>
              </thead>
              <tbody>
                {kader.map((k) => (
                  <tr key={k.nama} className="h-12 border-b border-line text-ink">
                    <td className="font-semibold">{k.nama}</td>
                    <td className="text-right">{k.aktif}</td>
                    <td className="text-right">{k.selesai}</td>
                    <td className="text-right">
                      <span className={`inline-flex items-center gap-2 ${k.overSla ? 'font-bold' : ''}`}>
                        {k.overSla && <Icon src={a('over-sla')} size={14} />}
                        {k.waktu}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="h-12 font-bold text-ink">
                  <td>Total</td>
                  <td className="text-right">{total.aktif}</td>
                  <td className="text-right">{total.selesai}</td>
                  <td className="text-right">2,3 hari</td>
                </tr>
              </tbody>
            </table>
            <p className="flex items-center gap-2 text-[12px] text-muted">
              <Icon src={a('over-sla')} size={14} />
              Melewati SLA kontak pertama 48 jam
            </p>
          </Card>
        </div>
      </main>
    </div>
  )
}
