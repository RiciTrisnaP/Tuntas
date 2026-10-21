import { Link, useParams } from 'react-router-dom'
import { Card, DataSintetis, KategoriBadge, Sidebar } from '../components/ui'
import { getScreening } from '../lib/services/data.ts'
import { providerViewModel } from '../lib/view-models/provider.ts'

export default function KaderDetail() {
  const { id = '' } = useParams()
  const record = getScreening(id)
  if (!record) return <main className="p-8">Rekaman tidak tersedia. <Link className="text-teal" to="/kader">Kembali</Link></main>
  const vm = providerViewModel(record)
  return <div className="flex min-h-screen bg-canvas"><Sidebar screen="tugas" items={[{label:'Kasus tindak lanjut',icon:'nav-tugas',to:'/kader'}]} user={{initials:'KD',name:'Petugas',role:'Tenaga kesehatan'}}/>
    <main className="flex min-w-0 flex-1 flex-col gap-5 p-8"><Link to="/kader" className="text-sm text-teal">← Daftar kasus</Link><div className="flex items-start justify-between"><div><h1 className="text-2xl font-bold">Kasus {record.patientId}</h1><p className="text-sm text-muted">{record.testId} · {record.sampleId} · {record.sourceDevice} · {record.resultDate}</p></div><DataSintetis screen="tugas"/></div>
      <p className="rounded-lg border border-amber bg-amber-soft p-4 text-sm text-amber-ink">Tidak ada nama, NIK, nomor telepon, penugasan, atau catatan kontak bebas di workbook. Layar hanya menampilkan fakta tindak lanjut yang tercatat.</p>
      <Card className="flex flex-col gap-4 p-5"><div className="flex items-center justify-between"><h2 className="font-bold">Hasil sumber</h2><KategoriBadge kategori={vm.kategori} screen="tugas"/></div><p className="text-sm">Status: {vm.status}</p><p className="text-sm text-muted">Umur: {vm.usia == null ? 'Tidak tersedia pada sumber ini' : `${vm.usia} tahun`}</p></Card>
      <Card className="flex flex-col gap-3 p-5"><h2 className="font-bold">Tindak lanjut tercatat</h2><p className="text-sm">Kontak: {vm.contactDate}</p><p className="text-sm">IVA: {vm.ivaDate}</p><p className="text-sm">Hasil IVA: {vm.ivaResult}</p><p className="text-sm">Tindakan: {vm.action}</p><p className="text-xs text-muted">Mode baca-saja. Workbook tidak mencatat tindakan baru dari aplikasi.</p></Card>
    </main></div>
}
