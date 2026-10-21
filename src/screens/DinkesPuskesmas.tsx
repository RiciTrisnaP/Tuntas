import { Link, useParams } from 'react-router-dom'
import { Card, DataSintetis, Sidebar } from '../components/ui'
import { SOURCES } from '../lib/domain/config.ts'
import type { SourceDevice } from '../lib/domain/types.ts'
import { dataset } from '../lib/services/data.ts'
import { governmentViewModel } from '../lib/view-models/government.ts'
import { percentLabel, resultPeriod } from '../lib/view-models/shared.ts'
import { dinkesNav, dinkesUser } from './dinkesNav'

export default function DinkesPuskesmas() {
  const { source: rawSource = '' } = useParams()
  const source = decodeURIComponent(rawSource) as SourceDevice
  const validSource = SOURCES.includes(source)
  const rows = validSource ? dataset.screenings.filter(r => r.sourceDevice === source) : []
  const vm = governmentViewModel(dataset.screenings, validSource ? source : undefined)
  const labs = [...new Set(rows.flatMap(r => r.sourceLab ? [r.sourceLab] : []))]
  return <div className="flex min-h-screen bg-canvas"><Sidebar screen="puskesmas" items={dinkesNav('puskesmas')} user={dinkesUser}/>
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-8">
      <Link to="/dinkes" className="text-sm font-semibold text-teal">← Ringkasan</Link>
      <div className="flex items-start justify-between"><div><h1 className="text-[28px] font-bold text-ink">Rincian adapter sumber</h1><p className="text-sm text-muted">{validSource ? source : 'Sumber tidak dikenal'} · hasil {resultPeriod(dataset)}</p></div><DataSintetis screen="puskesmas"/></div>
      {!validSource ? <Card className="p-5">Sumber ini tidak tersedia pada dataset.</Card> : <>
        <p className="rounded-lg border border-amber bg-amber-soft p-4 text-sm text-amber-ink">Ini rincian berdasarkan sistem/laboratorium sumber, bukan Puskesmas atau domisili pasien. Workbook tidak menyediakan pemetaan geografis pasien.</p>
        <div className="grid gap-4 sm:grid-cols-4">{[['Hasil',vm.total],['Positif',vm.positive],['Invalid',vm.invalid],['IVA ≤60 hari',`${vm.ivaWithinTarget} (${percentLabel(vm.ivaWithinTargetRate)})`]].map(([label,value])=><Card key={label} className="p-5"><p className="text-sm text-muted">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></Card>)}</div>
        <Card className="p-5"><h2 className="font-bold">Kelengkapan sumber</h2><p className="mt-2 text-sm">Laboratorium tercatat: {labs.length ? labs.join(', ') : 'tidak tersedia'}.</p><p className="mt-2 text-sm text-muted">Data umur, riwayat skrining, vaksinasi, metode pengambilan, dan tanggal pengambilan tidak tersedia pada adapter sumber ini bila tidak tercatat per sampel.</p></Card>
        <Card className="overflow-hidden"><div className="p-5"><h2 className="font-bold">Contoh rekaman pseudonim</h2><p className="text-xs text-muted">Tidak ada nama, nomor telepon, atau NIK dalam tampilan.</p></div><div className="overflow-auto"><table className="w-full text-left text-sm"><thead><tr className="border-y bg-white"><th className="p-3">ID tes</th><th>ID sampel</th><th>Hasil</th><th>Kategori</th><th>Status tindak lanjut</th></tr></thead><tbody>{rows.slice(0,20).map(r=><tr key={r.testId} className="border-b border-line"><td className="p-3">{r.testId}</td><td>{r.sampleId}</td><td>{r.resultDate}</td><td>{r.programCategory}</td><td>{r.followUpStatus}</td></tr>)}</tbody></table></div><p className="p-3 text-xs text-muted">Menampilkan maksimal 20 dari {rows.length} rekaman sumber.</p></Card>
      </>}
    </main>
  </div>
}
