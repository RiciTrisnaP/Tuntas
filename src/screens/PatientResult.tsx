import { Link, useParams } from 'react-router-dom'
import { DataSintetis, KategoriBadge, PhoneFrame, StatusBar } from '../components/ui'
import { CANONICAL_PATIENTS, getScreening } from '../lib/services/data.ts'
import { patientViewModel } from '../lib/view-models/patient.ts'
import { categoryLabel, snapshotNotice } from '../lib/view-models/shared.ts'
import { dataset } from '../lib/services/data.ts'

export default function PatientResult() {
  const { id = '' } = useParams()
  const record = getScreening(id)
  if (!record) return <PhoneFrame><StatusBar screen="peserta"/><main className="p-5"><p>Contoh data untuk ID tersebut tidak tersedia.</p><Link className="text-teal" to="/">Kembali</Link></main></PhoneFrame>
  const vm = patientViewModel(record)
  return <PhoneFrame>
    <StatusBar screen="peserta" className="bg-white" />
    <header className="flex items-center justify-between border-b border-line bg-white px-5 py-4"><Link to="/" className="text-sm text-teal">‹ Beranda</Link><DataSintetis screen="peserta" /></header>
    <main className="flex flex-col gap-4 p-4">
      <section className="rounded-xl border border-line bg-white p-5 shadow-card">
        <p className="text-xs font-semibold uppercase text-muted">Hasil skrining HPV DNA · {vm.resultDate}</p>
        <div className="mt-3"><KategoriBadge kategori={vm.category} screen="peserta" /></div>
        <h1 className="mt-4 text-xl font-bold text-ink">{vm.headline}</h1>
        <p className="mt-2 text-base leading-6 text-muted">{vm.explanation}</p>
      </section>
      <section className="rounded-xl border border-line bg-white p-5 shadow-card"><h2 className="font-bold">Langkah berikutnya</h2>
        <p className="mt-2 text-base leading-6">{vm.nextStep}</p>
        {vm.recallDate && <p className="mt-2 text-sm text-muted">Tanggal recall yang tercatat: {vm.recallDate}</p>}
        <p className="mt-2 text-xs text-muted">{vm.status}</p>
      </section>
      <section className="rounded-xl border border-line bg-white p-5 shadow-card"><h2 className="font-bold">Riwayat tercatat</h2>
        <ol className="mt-3 flex flex-col gap-3">{vm.journey.map((item, i) => <li key={`${item.label}-${i}`} className="border-l-2 border-teal pl-3">
          <p className="text-sm font-semibold">{item.label}{item.date ? ` · ${item.date}` : ''}</p><p className="text-xs text-muted">{item.detail}</p>
        </li>)}</ol>
      </section>
      <p className="text-xs leading-5 text-muted">{snapshotNotice(dataset)} Tampilan ini bukan pesan WhatsApp atau akun layanan resmi.</p>
      <p className="text-xs text-muted">ID contoh: {record.patientId} · Sumber hasil: {record.sourceDevice}</p>
      <p className="text-xs text-muted">Kategori: {categoryLabel(record.programCategory)}. Konsultasikan hasil dengan tenaga kesehatan.</p>
      <nav aria-label="Pilih contoh data pasien" className="rounded-xl border border-line bg-white p-4"><p className="text-sm font-semibold">Contoh ID pasien dalam snapshot</p><div className="mt-2 flex flex-wrap gap-3">{CANONICAL_PATIENTS.map(patientId=><Link key={patientId} to={`/patient/${patientId}`} aria-current={patientId===record.patientId?'page':undefined} className={`rounded border px-2 py-1 text-sm ${patientId===record.patientId?'border-teal bg-teal-soft font-bold text-teal':'border-line text-ink'}`}>{patientId}</Link>)}</div></nav>
    </main>
  </PhoneFrame>
}
