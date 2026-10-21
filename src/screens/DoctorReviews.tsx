import { Link, useParams } from 'react-router-dom'
import { Card, DataSintetis, KategoriBadge, Sidebar } from '../components/ui'
import { dataset, getScreening } from '../lib/services/data.ts'
import { doctorQueue, doctorViewModel } from '../lib/view-models/doctor.ts'

export default function DoctorReviews() {
  const { id } = useParams()
  const selected = id ? getScreening(id) : null
  const queue = doctorQueue(dataset.screenings)
  const record = selected ? doctorViewModel(selected) : null
  return <div className="flex min-h-screen bg-canvas"><Sidebar screen="ringkasan" items={[
    { label: 'Antrean review', icon: 'nav-ringkasan', to: '/doctor/reviews', active: !id },
  ]} user={{ initials: 'DR', name: 'Reviewer', role: 'Dokter / Clinical Reviewer' }} />
    <main className="flex min-w-0 flex-1 flex-col gap-5 p-8">
      <div className="flex items-start justify-between"><div><h1 className="text-2xl font-bold text-ink">Review klinis</h1><p className="text-sm text-muted">Antrean berasal dari status invalid atau ketidaklengkapan sumber; belum merupakan keputusan dokter.</p></div><DataSintetis screen="ringkasan" /></div>
      <p className="rounded-lg border border-amber bg-amber-soft p-3 text-sm text-amber-ink">Tidak ada model ML atau skor prioritas klinis. Ambang teknis hanya mengikuti catatan workbook sintetis dan bukan validasi klinis.</p>
      {record ? <>
        <Link to="/doctor/reviews" className="text-sm text-teal">← Kembali ke antrean</Link>
        <Card className="flex flex-col gap-5 p-6">
          <div className="flex items-center justify-between"><div><h2 className="text-lg font-bold">{record.testId} · {record.sampleId}</h2><p className="text-sm text-muted">{record.source} · hasil {record.resultDate} · pasien pseudonim {record.patientId}</p></div><KategoriBadge kategori={record.category} screen="ringkasan" /></div>
          <p className="text-sm font-semibold">Alasan masuk antrean: {record.reviewReasons.join('; ') || 'Tidak ada alasan berbasis data.'}</p>
          <div className="overflow-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-2">Target</th><th>Hasil</th><th>Ct</th></tr></thead><tbody>{record.molecular.map(t => <tr key={t.key} className="border-b"><td className="py-2">{t.label}</td><td>{t.result}</td><td>{t.ct}</td></tr>)}</tbody></table></div>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">{Object.entries(record.profile).map(([k,v]) => <div key={k}><dt className="font-semibold">{k}</dt><dd className="text-muted">{v}</dd></div>)}</dl>
          <p className="text-xs text-muted">Delta Ct: {record.deltaCt} · {record.availability}. Kelengkapan sumber: {record.sourceCompletenessLabel}.</p>
          {record.research && <p className="rounded bg-purple-soft p-3 text-sm">Data riset terpisah dari keputusan klinis · status {record.research.status}; metilasi {record.research.methylation}.</p>}
          <p className="text-xs text-muted">Provenance: {record.provenance}. Status review: {record.reviewStatus}.</p>
        </Card>
      </> : <Card className="overflow-hidden"><table className="w-full text-left text-sm"><thead className="bg-white"><tr><th className="p-3">ID tes</th><th>Sumber</th><th>Kategori</th><th>Alasan review</th><th></th></tr></thead><tbody>
        {queue.map(r => <tr key={r.testId} className="border-t border-line"><td className="p-3 font-semibold">{r.testId}</td><td>{r.source}</td><td><KategoriBadge kategori={r.category} screen="ringkasan"/></td><td>{r.reviewReasons.join('; ')}</td><td><Link className="text-teal" to={`/doctor/reviews/${encodeURIComponent(r.testId)}`}>Buka</Link></td></tr>)}
      </tbody></table>{!queue.length && <p className="p-5 text-sm">Tidak ada catatan yang memenuhi pemicu review pada snapshot ini.</p>}</Card>}
      <p className="text-xs text-muted">Snapshot berisi {dataset.screenings.length} hasil dari tiga adapter sumber.</p>
    </main>
  </div>
}
