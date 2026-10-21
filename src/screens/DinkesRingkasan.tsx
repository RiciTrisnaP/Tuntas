import { Link } from 'react-router-dom'
import { Card, DataSintetis, KpiCard, Sidebar, asset } from '../components/ui'
import { SOURCES } from '../lib/domain/config.ts'
import { dataset } from '../lib/services/data.ts'
import { governmentViewModel } from '../lib/view-models/government.ts'
import { dateLabel, percentLabel, resultPeriod } from '../lib/view-models/shared.ts'
import { dinkesNav, dinkesUser } from './dinkesNav'

const S = 'ringkasan'
const a = (name: string) => asset(S, name)
const fmt = (n: number) => new Intl.NumberFormat('id-ID').format(n)

export default function DinkesRingkasan() {
  const vm = governmentViewModel(dataset.screenings)
  return <div className="flex min-h-screen bg-canvas"><Sidebar screen={S} items={dinkesNav('ringkasan')} user={dinkesUser}/>
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-8">
      <div className="flex items-start justify-between gap-4"><div><h1 className="text-[28px] font-bold text-ink">Ringkasan skrining HPV DNA</h1>
        <p className="text-sm text-muted">Snapshot hasil {resultPeriod(dataset)} · bukan pelaporan populasi atau status hari ini.</p></div><DataSintetis screen={S}/></div>
      <p className="rounded-lg border border-amber bg-amber-soft p-4 text-sm text-amber-ink">Workbook tidak memuat undangan, wilayah domisili/Puskesmas asal, target layanan per wilayah, atau tanggal snapshot operasional. Angka di bawah hanya agregat catatan sumber yang tersedia.</p>
      <div className="flex flex-wrap gap-4">
        <KpiCard label="Hasil skrining" value={fmt(vm.total)} note={`${fmt(vm.valid)} valid · ${fmt(vm.invalid)} invalid`} icon={a('kpi-diskrining')} iconBox="bg-teal-soft"/>
        <KpiCard label="Positif HPV16/18" value={fmt(vm.positive1618)} note={`${percentLabel(vm.positiveComposition)} dari seluruh catatan`} icon={a('kpi-positif')} iconBox="bg-red-soft"/>
        <KpiCard label="Positif HR lain" value={fmt(vm.positiveOther)} note="Mengikuti kategori standar workbook" icon={a('kpi-lain')} iconBox="bg-amber-soft"/>
        <KpiCard label="Invalid" value={fmt(vm.invalid)} note={`${percentLabel(vm.invalidRate)} dari seluruh catatan`} icon={a('kpi-invalid')} iconBox="bg-gray-soft"/>
        <KpiCard label="IVA ≤ 60 hari" value={fmt(vm.ivaWithinTarget)} note={`${fmt(vm.ivaCompleted)} IVA tercatat · ${percentLabel(vm.ivaWithinTargetRate)} dari hasil positif`} icon={a('kpi-iva')} iconBox="bg-navy-soft"/>
      </div>
      <Card className="overflow-hidden"><div className="p-5"><h2 className="text-lg font-bold">Ringkasan per sumber data</h2><p className="text-sm text-muted">Sumber laboratorium ditampilkan terpisah dari wilayah pasien; workbook tidak menyediakan pemetaan domisili.</p></div>
        <div className="overflow-auto"><table className="w-full text-left text-sm"><thead className="bg-white text-muted"><tr><th className="p-3">Adapter</th><th>Hasil</th><th>Positif</th><th>Invalid</th><th>IVA ≤60 hari</th><th></th></tr></thead><tbody>{vm.bySource.map(r=><tr key={r.source} className="border-t border-line"><td className="p-3 font-semibold">{r.source}</td><td>{r.total}</td><td>{r.positive}</td><td>{r.invalid}</td><td>{r.ivaWithinTarget} / {r.positive} ({percentLabel(r.ivaWithinTargetRate)})</td><td><Link className="text-teal hover:underline" to={`/dinkes/source/${encodeURIComponent(r.source)}`}>Rincian</Link></td></tr>)}</tbody></table></div>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">{SOURCES.map(source=>{const rows=dataset.screenings.filter(r=>r.sourceDevice===source);const labs=[...new Set(rows.flatMap(r=>r.sourceLab?[r.sourceLab]:[]))];return <Card key={source} className="p-5"><h2 className="font-bold">{source}</h2><p className="mt-2 text-sm text-muted">{rows.length} rekaman · {labs.length?`lab tercatat: ${labs.join(', ')}`:'nama laboratorium tidak tersedia'}</p><p className="mt-2 text-xs text-muted">Periode hasil {dateLabel(dataset.metadata.firstResultDate)}–{dateLabel(dataset.metadata.lastResultDate)}</p></Card>})}</div>
      <p className="text-xs text-muted">Catatan denominator: angka IVA ≤60 hari dihitung dari nilai tanggal tindak lanjut yang tercatat dibanding tanggal hasil. Nilai masa depan dalam workbook tetap ditampilkan sebagai skenario, tanpa menyimpulkan keterlambatan saat ini.</p>
    </main>
  </div>
}
