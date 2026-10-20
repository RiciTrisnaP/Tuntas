import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { Logo } from './components/ui'
import DinkesPuskesmas from './screens/DinkesPuskesmas'
import DinkesRingkasan from './screens/DinkesRingkasan'
import KaderDetail from './screens/KaderDetail'
import KaderTugas from './screens/KaderTugas'
import LabUnggah from './screens/LabUnggah'
import PesertaWhatsApp from './screens/PesertaWhatsApp'

const screens = [
  { peran: 'Kader', items: [
    { to: '/kader', label: 'Tugas hari ini' },
    { to: '/kader/pasien/s', label: 'Detail pasien' },
    { to: '/kader/pasien/s/catat', label: 'Catat hasil kontak' },
  ] },
  { peran: 'Dinkes', items: [
    { to: '/dinkes', label: 'Ringkasan' },
    { to: '/dinkes/puskesmas/c', label: 'Detail Puskesmas C' },
  ] },
  { peran: 'Lab', items: [{ to: '/lab', label: 'Unggah hasil' }] },
  { peran: 'Peserta', items: [{ to: '/peserta/wa', label: 'Percakapan WhatsApp' }] },
]

function Beranda() {
  return (
    <main className="mx-auto flex max-w-[640px] flex-col gap-8 px-4 py-16">
      <Logo screen="ringkasan" size="lg" />
      <p className="text-[14px] text-muted">Prototipe layar TUNTAS · data sintetis</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {screens.map((g) => (
          <section key={g.peran} className="rounded-[12px] border border-line bg-white p-6 shadow-card">
            <h2 className="mb-3 text-[12px] font-bold tracking-[0.5px] text-muted uppercase">{g.peran}</h2>
            <ul className="flex flex-col gap-2">
              {g.items.map((s) => (
                <li key={s.to}>
                  <Link to={s.to} className="text-[15px] font-semibold text-teal hover:underline">{s.label}</Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Beranda />} />
        <Route path="/kader" element={<KaderTugas />} />
        <Route path="/kader/pasien/:id" element={<KaderDetail />} />
        <Route path="/kader/pasien/:id/catat" element={<KaderDetail sheetOpen />} />
        <Route path="/dinkes" element={<DinkesRingkasan />} />
        <Route path="/dinkes/puskesmas/c" element={<DinkesPuskesmas />} />
        <Route path="/lab" element={<LabUnggah />} />
        <Route path="/peserta/wa" element={<PesertaWhatsApp />} />
      </Routes>
    </BrowserRouter>
  )
}
