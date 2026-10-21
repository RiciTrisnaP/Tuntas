import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { Logo } from './components/ui'
import DinkesPuskesmas from './screens/DinkesPuskesmas'
import DinkesRingkasan from './screens/DinkesRingkasan'
import KaderDetail from './screens/KaderDetail'
import KaderTugas from './screens/KaderTugas'
import DoctorReviews from './screens/DoctorReviews'
import PatientResult from './screens/PatientResult'
import { CANONICAL_PATIENTS, sourceUrl } from './lib/services/data.ts'
import { SOURCES } from './lib/domain/config.ts'

function Beranda() {
  return <main className="mx-auto flex max-w-[760px] flex-col gap-8 px-4 py-16">
    <Logo screen="ringkasan" size="lg" />
    <p className="text-[14px] text-muted">Prototipe TUNTAS · skenario data sintetis</p>
    <div className="grid gap-4 sm:grid-cols-2">
      <section className="rounded-[12px] border border-line bg-white p-6 shadow-card"><h2 className="mb-3 text-[12px] font-bold text-muted">PASIEN</h2>
        <Link className="text-teal hover:underline" to={`/patient/${CANONICAL_PATIENTS[1]}`}>Contoh hasil peserta</Link></section>
      <section className="rounded-[12px] border border-line bg-white p-6 shadow-card"><h2 className="mb-3 text-[12px] font-bold text-muted">DOKTER / REVIEWER</h2>
        <Link className="text-teal hover:underline" to="/doctor/reviews">Antrean review berbasis aturan</Link></section>
      <section className="rounded-[12px] border border-line bg-white p-6 shadow-card"><h2 className="mb-3 text-[12px] font-bold text-muted">DINAS KESEHATAN</h2>
        <Link className="text-teal hover:underline" to="/dinkes">Ringkasan agregat sumber</Link></section>
      <section className="rounded-[12px] border border-line bg-white p-6 shadow-card"><h2 className="mb-3 text-[12px] font-bold text-muted">OPERASIONAL SUMBER</h2>
        {SOURCES.map(source => <Link key={source} className="mr-4 text-teal hover:underline" to={sourceUrl(source)}>{source}</Link>)}</section>
    </div>
  </main>
}

export default function App() { return <BrowserRouter><Routes>
  <Route path="/" element={<Beranda />} />
  <Route path="/patient/:id" element={<PatientResult />} />
  <Route path="/doctor/reviews" element={<DoctorReviews />} />
  <Route path="/doctor/reviews/:id" element={<DoctorReviews />} />
  <Route path="/kader" element={<KaderTugas />} />
  <Route path="/kader/pasien/:id" element={<KaderDetail />} />
  <Route path="/dinkes" element={<DinkesRingkasan />} />
  <Route path="/dinkes/source/:source" element={<DinkesPuskesmas />} />
  <Route path="/dinkes/puskesmas/:source" element={<DinkesPuskesmas />} />
</Routes></BrowserRouter> }
