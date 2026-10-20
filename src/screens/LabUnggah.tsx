import { Fragment, useRef, useState } from 'react'
import { Card, Icon, KategoriBadge, Logo, Pill, Sidebar, asset, type Kategori } from '../components/ui'

const S = 'lab'
const a = (n: string) => asset(S, n)

const nav = [
  { label: 'Unggah hasil', icon: 'nav-unggah', active: true },
  { label: 'Riwayat unggahan', icon: 'nav-riwayat' },
  { label: 'Sampel tertunda', icon: 'nav-tertunda' },
  { label: 'Pengaturan kit', icon: 'nav-kit' },
]

type Baris = {
  id: string
  /** Raw Ct per channel from the kit export: FAM, HEX, ROX, Cy5 (null = not detected). */
  raw: [number | null, number | null, number | null, number | null]
  kategori: Kategori
}

// Synthetic preview rows, as in the Figma "Lab · Unggah Hasil" frame.
const baris: Baris[] = [
  { id: 'TNT-0412', raw: [27.9, null, null, 29.8], kategori: 'positif1618' },
  { id: 'TNT-0413', raw: [null, null, null, 30.2], kategori: 'negatif' },
  { id: 'TNT-0414', raw: [null, null, 31.5, 29.6], kategori: 'positifLain' },
  { id: 'TNT-0415', raw: [null, null, null, null], kategori: 'invalid' },
  { id: 'TNT-0416', raw: [null, 33.1, null, 30.4], kategori: 'positif1618' },
  { id: 'TNT-0417', raw: [null, null, null, 29.9], kategori: 'negatif' },
]

const ct = (v: number | null) => (v == null ? '—' : v.toFixed(1).replace('.', ','))

const steps = [
  { label: 'Pilih kit', sub: 'CerviScan', done: true },
  { label: 'Unggah file', sub: '48 baris terbaca', done: true },
  { label: 'Pratinjau dan kirim', sub: 'Periksa sebelum kirim', done: false },
]

function Stepper() {
  return (
    <ol className="flex w-[520px] shrink-0">
      {steps.map((s, i) => (
        <li key={s.label} className="flex flex-1 flex-col gap-2">
          <div className="flex items-center">
            <div className={`h-0.5 flex-1 ${i === 0 ? 'bg-transparent' : 'bg-teal'}`} />
            {s.done ? (
              <span className="flex size-8 items-center justify-center rounded-full bg-teal"><Icon src={a('check')} size={16} /></span>
            ) : (
              <span className="flex size-8 items-center justify-center rounded-full border-4 border-navy-soft bg-navy text-[13px] font-bold text-white">{i + 1}</span>
            )}
            <div className={`h-0.5 flex-1 ${s.done ? 'bg-teal' : 'bg-transparent'}`} />
          </div>
          <div className="flex flex-col text-center">
            <span className={`text-[14px] ${s.done ? 'font-semibold text-ink' : 'font-bold text-navy'}`}>{s.label}</span>
            <span className={`text-[12px] ${s.done ? 'text-muted' : 'font-semibold text-teal'}`}>{s.sub}</span>
          </div>
        </li>
      ))}
    </ol>
  )
}

function StepHead({ done, n, title }: { done: boolean; n: number; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`flex size-6 items-center justify-center rounded-full text-[12px] font-bold text-white ${done ? 'bg-teal' : 'bg-navy'}`}>
        {done ? <Icon src={a('check-sm')} size={14} /> : n}
      </span>
      <h2 className="text-[16px] font-bold text-ink">{title}</h2>
    </div>
  )
}

const LEFT_W = 'w-[336px]'

// Totals across all 48 rows in the uploaded file (only 6 are previewed).
const counts: [Kategori, number][] = [['positif1618', 2], ['positifLain', 3], ['invalid', 1], ['negatif', 42]]

export default function LabUnggah() {
  const [file, setFile] = useState<{ name: string; meta: string } | null>({
    name: 'cerviscan_run_191026.csv',
    meta: '12 KB · 48 sampel · diunggah 09.12',
  })
  const [riset, setRiset] = useState(true)
  const [drag, setDrag] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  const pick = (f?: File) => {
    if (f) setFile({ name: f.name, meta: `${Math.max(1, Math.round(f.size / 1024))} KB · baru diunggah` })
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar
        screen={S}
        items={nav}
        user={{ initials: 'WS', name: 'Wulan Sari, A.Md.AK', role: 'Petugas Lab · Labkesda' }}
      />
      <main className="flex min-w-0 flex-1 flex-col gap-6 p-8">
        <div className="flex items-center justify-between gap-6">
          <div className="flex flex-col">
            <h1 className="text-[28px] font-bold tracking-[-0.5px] text-ink">Unggah hasil lab</h1>
            <p className="text-[14px] text-muted">Hasil tes HPV DNA dari kit apa pun diubah ke format standar TUNTAS sebelum dikirim.</p>
          </div>
          <Stepper />
        </div>

        <div className="flex h-[336px] gap-6">
          <Card className="flex w-[456px] shrink-0 flex-col gap-4 p-6">
            <StepHead done n={1} title="Pilih kit" />
            <div className="flex flex-col gap-2">
              <label htmlFor="kit" className="text-[13px] font-semibold text-muted">Kit pemeriksaan</label>
              <div className="relative flex h-12 items-center gap-2 rounded-[8px] border border-line bg-white px-4">
                <Icon src={a('kit')} size={16} />
                <select id="kit" className="flex-1 appearance-none bg-transparent text-[14px] font-bold text-ink outline-none">
                  <option>CerviScan</option>
                </select>
                <Icon src={a('chevron')} size={18} className="pointer-events-none" />
              </div>
              <div className="flex flex-col gap-2 rounded-[8px] bg-canvas p-4 text-[13px] text-muted">
                <span className="flex items-center gap-2"><Icon src={a('channel')} size={14} />Channel: FAM, HEX, ROX, Cy5</span>
                <span className="flex items-center gap-2"><Icon src={a('cutoff')} size={14} />{'Cutoff: Ct < 40 = terdeteksi'}</span>
              </div>
            </div>
          </Card>

          <Card className="flex min-w-0 flex-1 flex-col gap-4 p-6">
            <StepHead done={!!file} n={2} title="Unggah file" />
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]) }}
              className={`flex min-h-0 flex-1 flex-col items-center justify-center gap-2 rounded-[12px] border border-teal p-6 ${drag ? 'bg-[#d6eaea]' : 'bg-teal-soft'}`}
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-white"><Icon src={a('upload')} size={24} /></span>
              <p className="text-[16px] font-bold text-ink">Tarik dan lepas file CSV di sini</p>
              <p className="flex gap-2 text-[14px]">
                <span className="text-muted">atau</span>
                <button type="button" onClick={() => input.current?.click()} className="font-bold text-teal hover:underline">
                  pilih file dari komputer
                </button>
              </p>
              <p className="text-[12px] text-muted">Format .csv dari ekspor mesin · maks. 10 MB</p>
              <input ref={input} type="file" accept=".csv,text/csv" hidden onChange={(e) => pick(e.target.files?.[0])} />
            </div>
            {file && (
              <div className="flex h-[47px] items-center gap-4 rounded-[8px] border border-line px-4 py-2">
                <Icon src={a('file')} size={20} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[14px] font-semibold text-ink">{file.name}</span>
                  <span className="text-[12px] text-muted">{file.meta}</span>
                </div>
                <Pill icon={a('ok')} className="bg-green-soft text-green">Terbaca</Pill>
                <button type="button" aria-label="Hapus file" onClick={() => setFile(null)}>
                  <Icon src={a('remove')} size={18} />
                </button>
              </div>
            )}
          </Card>
        </div>

        <div className="flex items-stretch gap-6">
          <Card className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <div className="flex flex-col gap-2 px-6 pt-6 pb-4">
              <div className="flex items-center justify-between">
                <StepHead done={false} n={3} title="Pratinjau konversi" />
                <span className="text-[13px] text-muted">Menampilkan {baris.length} dari 48 sampel</span>
              </div>
              <div className="flex gap-2 text-[12px] leading-[1.5] text-muted">
                <Icon src={a('mapping')} size={14} />
                <p>
                  Pemetaan CerviScan: FAM → HPV 16 · HEX → HPV 18 · ROX → hrHPV lain (pool) · Cy5 → kontrol internal<br />
                  {'Cutoff CerviScan: Ct < 40 = terdeteksi'}
                </p>
              </div>
            </div>

            <div className="flex h-12 items-center border-y border-line">
              <div className={`flex h-full ${LEFT_W} shrink-0 items-center gap-2 bg-canvas px-4`}>
                <span className="flex-1 text-[14px] font-bold text-ink">Data asli kit</span>
                <span className="flex h-6 items-center rounded-[6px] border border-line bg-white px-2 text-[12px] font-semibold text-muted">CerviScan · CSV</span>
              </div>
              <div className="flex h-full w-10 shrink-0 items-center justify-center bg-white">
                <span className="flex size-8 items-center justify-center rounded-full bg-navy"><Icon src={a('arrow-circle')} size={16} /></span>
              </div>
              <div className="flex flex-1 items-center gap-2 px-4">
                <Logo screen={S} size="sm" centang="centang-sm" />
                <span className="text-[14px] font-bold text-ink">Format standar</span>
              </div>
            </div>

            <div role="table" aria-label="Pratinjau konversi">
              <div role="row" className="flex h-10 items-center border-b border-line text-[12px] font-bold tracking-[0.5px] text-muted">
                <div className={`flex h-full ${LEFT_W} shrink-0 items-center gap-2 bg-canvas px-4`}>
                  <span role="columnheader" className="w-24">ID SAMPEL</span>
                  {['FAM', 'HEX', 'ROX', 'Cy5'].map((c) => <span role="columnheader" key={c} className="w-11">{c}</span>)}
                </div>
                <div className="h-full w-10 shrink-0 bg-white" />
                <div className="flex flex-1 items-center gap-2 px-4">
                  <span role="columnheader" className="w-12">CT 16</span>
                  <span role="columnheader" className="w-12">CT 18</span>
                  <span role="columnheader" className="w-14">CT POOL</span>
                  <span role="columnheader" className="w-[104px]">KONTROL INTERNAL</span>
                  <span role="columnheader" className="flex-1">KATEGORI</span>
                </div>
              </div>

              {baris.map((b) => {
                const [fam, hex, rox, cy5] = b.raw
                const gagal = cy5 == null
                const rowBg = gagal ? 'bg-red-soft' : ''
                const cell = (v: number | null, w: string) => (
                  <span role="cell" className={`${w} ${v == null ? 'text-muted' : 'text-ink'}`}>{ct(v)}</span>
                )
                return (
                  <Fragment key={b.id}>
                    <div role="row" className={`relative flex h-12 items-center border-b text-[13px] ${gagal ? 'border-red-soft' : 'border-line'} ${rowBg}`}>
                      {gagal && <div className="absolute inset-y-0 left-0 w-1 bg-red" />}
                      <div className={`flex h-full ${LEFT_W} shrink-0 items-center gap-2 px-4 ${gagal ? 'bg-red-soft' : 'bg-canvas'}`}>
                        <span role="cell" className="w-24 font-semibold text-ink">{b.id}</span>
                        {cell(fam, 'w-11')}{cell(hex, 'w-11')}{cell(rox, 'w-11')}
                        {gagal ? <span role="cell" className="w-11 font-bold text-red">—</span> : cell(cy5, 'w-11')}
                      </div>
                      <div className={`flex h-full w-10 shrink-0 items-center justify-center ${gagal ? 'bg-red-soft' : 'bg-white'}`}>
                        <Icon src={a(gagal ? 'arrow-red' : 'arrow')} size={14} />
                      </div>
                      <div className="flex h-full flex-1 items-center gap-2 px-4">
                        {cell(fam, 'w-12')}{cell(hex, 'w-12')}{cell(rox, 'w-14')}
                        <span role="cell" className="flex w-[104px] items-center gap-2 font-semibold text-ink">
                          <Icon src={a(gagal ? 'fail' : 'ok')} size={14} />
                          {gagal ? 'Gagal' : 'Lulus'}
                        </span>
                        <span role="cell" className="flex-1"><KategoriBadge kategori={b.kategori} screen={S} variant="desktop" /></span>
                      </div>
                    </div>
                    {gagal && (
                      <div className="relative flex h-[72px] border-b border-line bg-red-soft px-4 pb-4">
                        <div className="absolute top-0 left-0 h-14 w-1 bg-red" />
                        <div className="flex flex-1 items-center gap-2 rounded-[8px] border border-red bg-white px-4 py-2 text-[13px]">
                          <Icon src={a('reason')} size={16} />
                          <span className="font-bold whitespace-nowrap text-red">Kontrol internal gagal, kategori Invalid</span>
                          <span className="text-muted">· Sampel otomatis masuk daftar Ambil ulang di Puskesmas asal.</span>
                        </div>
                      </div>
                    )}
                  </Fragment>
                )
              })}
            </div>

            <div className="flex items-center justify-between px-6 py-4 text-[13px]">
              <span className="text-muted">42 sampel lain: 40 Negatif, 2 Positif lain</span>
              <button type="button" className="flex items-center gap-2 font-bold text-teal hover:underline">
                Tampilkan semua 48
                <Icon src={a('expand')} size={14} />
              </button>
            </div>
          </Card>

          <section className="flex w-[304px] shrink-0 flex-col gap-4 rounded-[12px] border-2 border-purple bg-white p-6 shadow-card">
            <span className="inline-flex h-6 w-fit items-center gap-2 rounded-[6px] border border-purple px-2">
              <Icon src={a('riset')} size={14} />
              <span className="text-[12px] font-semibold text-purple">Riset, bukan keputusan klinis</span>
            </span>
            <div className="flex flex-col gap-2">
              <h2 className="text-[18px] font-bold text-ink">Cartridge B: metilasi</h2>
              <p className="flex items-center gap-2 text-[14px] font-bold text-ink">
                <Icon src={a('not-clinical')} size={16} />
                Tidak dipakai untuk keputusan klinis
              </p>
            </div>
            <p className="text-[13px] leading-[1.6] text-muted">
              Data metilasi dari cartridge B disimpan terpisah untuk riset kohort. Nilainya tidak mengubah kategori Kemenkes maupun skor prioritas.
            </p>
            <div className="flex flex-col rounded-[8px] bg-purple-soft p-4">
              <span className="text-[24px] font-bold text-ink">5 dari 48</span>
              <span className="text-[13px] text-muted">sampel memiliki data cartridge B</span>
            </div>
            <label className="flex cursor-pointer gap-4">
              <input type="checkbox" checked={riset} onChange={(e) => setRiset(e.target.checked)} className="sr-only" />
              <span className={`flex size-6 shrink-0 items-center justify-center rounded-[6px] ${riset ? 'bg-purple' : 'border-2 border-line bg-white'}`}>
                {riset && <Icon src={a('check')} size={16} />}
              </span>
              <span className="flex flex-col">
                <span className="text-[14px] leading-[1.7] font-semibold text-ink">Simpan ke dataset riset</span>
                <span className="text-[12px] leading-[1.5] text-muted">Hanya untuk peserta yang sudah memberi persetujuan riset.</span>
              </span>
            </label>
          </section>
        </div>

        <Card className="flex h-20 items-center gap-8 px-6 py-4">
          <div className="flex h-full items-center gap-8">
            <div className="flex flex-col gap-2">
              <span className="text-[24px] leading-[1.2] font-bold text-ink">48</span>
              <span className="text-[13px] leading-[1.85] font-semibold text-muted">Sampel</span>
            </div>
            <div className="h-12 w-px bg-line" />
            {counts.map(([k, n]) => (
              <div key={k} className="flex flex-col gap-2">
                <span className="text-[24px] leading-[1.2] font-bold text-ink">{n}</span>
                <KategoriBadge kategori={k} screen={S} variant="desktop" />
              </div>
            ))}
          </div>
          <div className="flex h-full flex-1 items-center justify-end gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[13px] font-semibold text-ink">Siap dikirim ke 3 Puskesmas</span>
              <span className="text-[12px] text-muted">Hasil positif langsung menjadi tugas kader</span>
            </div>
            <button type="button" className="flex h-12 items-center rounded-[8px] border border-line bg-white px-4 text-[14px] font-semibold text-navy hover:bg-canvas">
              Batal
            </button>
            <button
              type="button"
              disabled={!file}
              className="flex h-12 items-center gap-2 rounded-[8px] bg-teal px-6 text-[15px] font-semibold text-white hover:brightness-110 disabled:opacity-50"
            >
              <Icon src={a('send')} size={16} />
              Validasi dan kirim
            </button>
          </div>
        </Card>
      </main>
    </div>
  )
}
