import { Link } from 'react-router-dom'
import { Card, DataSintetis, KategoriBadge, Sidebar } from '../components/ui'
import { dataset } from '../lib/services/data.ts'
import { providerViewModel, type TabKey } from '../lib/view-models/provider.ts'

const tabLabels: Record<TabKey,string> = { telepon:'Perlu kontak', iva:'IVA / tindak lanjut', ambilUlang:'Pemeriksaan ulang', selesai:'Recall / selesai' }
export default function KaderTugas() {
  const rows = dataset.screenings.map(providerViewModel)
  const groups = (['telepon','iva','ambilUlang','selesai'] as TabKey[]).map(key=>({ key, rows: rows.filter(r=>r.tab===key) }))
  return <div className="flex min-h-screen bg-canvas"><Sidebar screen="tugas" items={[{label:'Kasus tindak lanjut',icon:'nav-tugas',to:'/kader',active:true}]} user={{initials:'KD',name:'Petugas',role:'Tenaga kesehatan'}}/>
    <main className="flex min-w-0 flex-1 flex-col gap-5 p-8"><div className="flex items-start justify-between"><div><h1 className="text-2xl font-bold text-ink">Kasus tindak lanjut</h1><p className="text-sm text-muted">Daftar dibentuk dari catatan tindak lanjut yang sudah ada pada snapshot.</p></div><DataSintetis screen="tugas"/></div>
      <p className="rounded-lg border border-amber bg-amber-soft p-4 text-sm text-amber-ink">Workbook tidak menyediakan penugasan kader, nama/telepon peserta, SLA kontak, atau kemampuan mencatat perubahan. Daftar ini bersifat baca-saja dan memakai ID pseudonim.</p>
      {groups.map(g=><Card key={g.key} className="overflow-hidden"><div className="flex justify-between p-4"><h2 className="font-bold">{tabLabels[g.key]}</h2><span className="text-sm text-muted">{g.rows.length} rekaman</span></div>
        <div className="overflow-auto"><table className="w-full text-left text-sm"><thead><tr className="border-y bg-white text-muted"><th className="p-3">ID peserta</th><th>Sumber</th><th>Umur</th><th>Kategori</th><th>Status</th><th></th></tr></thead><tbody>{g.rows.map(r=><tr key={r.testId} className="border-b border-line"><td className="p-3 font-semibold">{r.id}</td><td>{r.source}</td><td>{r.usia == null ? 'Tidak tersedia' : `${r.usia} tahun`}</td><td><KategoriBadge kategori={r.kategori} screen="tugas"/></td><td>{r.status}</td><td><Link className="text-teal" to={`/kader/pasien/${encodeURIComponent(r.testId)}`}>Lihat</Link></td></tr>)}</tbody></table></div>
      </Card>)}
    </main>
  </div>
}
