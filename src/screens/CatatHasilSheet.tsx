import { useEffect, useState } from 'react'
import { Icon, asset } from '../components/ui'

const S = 'catat'
const a = (n: string) => asset(S, n)

type Hasil = 'terhubung' | 'tidak' | 'salah' | 'tolak'

const opsi: { key: Hasil; label: string; icon: string }[] = [
  { key: 'terhubung', label: 'Terhubung', icon: 'o-terhubung' },
  { key: 'tidak', label: 'Tidak diangkat', icon: 'o-tidak' },
  { key: 'salah', label: 'Nomor salah', icon: 'o-salah' },
  { key: 'tolak', label: 'Menolak', icon: 'o-tolak' },
]

const tanggal = [
  { key: '22', hari: 'Kam', tgl: '22 Okt' },
  { key: '23', hari: 'Jum', tgl: '23 Okt' },
  { key: '26', hari: 'Sen', tgl: '26 Okt' },
]

const jam = ['Pagi · 08.00–10.00', 'Siang · 10.00–12.00']

const MAX_CATATAN = 500

export default function CatatHasilSheet({ onClose }: { onClose: () => void }) {
  const [hasil, setHasil] = useState<Hasil>('terhubung')
  const [tgl, setTgl] = useState('22')
  const [slot, setSlot] = useState(jam[0])
  const [catatan, setCatatan] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-20 flex justify-center">
      <div className="relative flex h-full w-full max-w-[390px] flex-col justify-end">
        <button type="button" aria-label="Tutup" onClick={onClose} className="absolute inset-0 bg-[rgba(26,36,51,0.5)]" />
        <form
          role="dialog"
          aria-modal="true"
          aria-labelledby="catat-title"
          onSubmit={(e) => { e.preventDefault(); onClose() }}
          className="relative flex max-h-[calc(100%-48px)] flex-col gap-6 overflow-y-auto rounded-t-[12px] bg-white px-4 pt-2 pb-6 shadow-[0_-4px_8px_rgba(26,36,51,0.12)]"
        >
          <div className="flex justify-center">
            <div className="h-1 w-10 rounded-full bg-line" />
          </div>

          <div className="flex items-start gap-4">
            <div className="flex flex-1 flex-col">
              <h2 id="catat-title" className="text-[20px] font-bold text-ink">Catat hasil kontak</h2>
              <p className="text-[14px] text-muted">Ibu S., 38 · Telepon hari ini, 09.41</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Tutup" className="flex size-10 items-center justify-center rounded-[8px] bg-canvas">
              <Icon src={a('close')} size={20} />
            </button>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-[14px] font-bold text-ink">Hasil kontak *</legend>
            <div className="grid grid-cols-2 gap-2">
              {opsi.map((o) => {
                const on = hasil === o.key
                return (
                  <label
                    key={o.key}
                    className={`flex h-14 cursor-pointer items-center gap-2 rounded-[8px] px-4 text-[14px] ${
                      on ? 'border-2 border-teal bg-teal-soft font-bold text-teal' : 'border border-line bg-white font-medium text-ink'
                    }`}
                  >
                    <input type="radio" name="hasil" value={o.key} checked={on} onChange={() => setHasil(o.key)} className="sr-only" />
                    <Icon src={a(o.icon)} size={18} />
                    <span className="flex-1">{o.label}</span>
                    {on && (
                      <span className="flex size-4 items-center justify-center rounded-full bg-teal">
                        <Icon src={a('check')} size={12} />
                      </span>
                    )}
                  </label>
                )
              })}
            </div>
          </fieldset>

          {hasil === 'terhubung' && (
            <div className="flex flex-col gap-6 border-t border-line py-4">
              <fieldset className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <legend className="text-[14px] font-bold text-ink">Jadwal IVA *</legend>
                  <span className="text-[12px] font-semibold text-muted">Pkm Cempaka Putih</span>
                </div>
                <div className="flex gap-2">
                  {tanggal.map((t) => {
                    const on = tgl === t.key
                    return (
                      <button
                        key={t.key}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setTgl(t.key)}
                        className={`flex h-14 flex-1 flex-col items-center justify-center rounded-[8px] border ${
                          on ? 'border-navy bg-navy' : 'border-line bg-white'
                        }`}
                      >
                        <span className={`text-[12px] font-medium ${on ? 'text-navy-200' : 'text-muted'}`}>{t.hari}</span>
                        <span className={`text-[14px] font-bold ${on ? 'text-white' : 'text-ink'}`}>{t.tgl}</span>
                      </button>
                    )
                  })}
                  <button
                    type="button"
                    className="flex h-14 flex-1 flex-col items-center justify-center rounded-[8px] border border-line bg-white"
                  >
                    <Icon src={a('cal-plus')} size={18} />
                    <span className="text-[12px] font-semibold text-muted">Lainnya</span>
                  </button>
                </div>
                <div className="flex gap-2">
                  {jam.map((j) => {
                    const on = slot === j
                    return (
                      <button
                        key={j}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setSlot(j)}
                        className={`flex h-10 flex-1 items-center justify-center rounded-[8px] border text-[13px] ${
                          on ? 'border-navy bg-navy-soft font-bold text-navy' : 'border-line bg-white font-medium text-ink'
                        }`}
                      >
                        {j}
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              <div className="flex flex-col gap-2">
                <label htmlFor="catatan" className="text-[14px] font-bold text-ink">Catatan</label>
                <textarea
                  id="catatan"
                  value={catatan}
                  maxLength={MAX_CATATAN}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Contoh: Ibu bersedia datang, minta diingatkan sehari sebelumnya."
                  className="h-24 resize-none rounded-[8px] border border-line bg-white p-4 text-[14px] leading-[1.5] text-ink outline-none placeholder:text-center placeholder:text-muted focus:border-teal"
                />
                <span className="text-[12px] text-muted">
                  Opsional · maks. {MAX_CATATAN} karakter{catatan && ` · ${catatan.length}/${MAX_CATATAN}`}
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="flex h-12 items-center justify-center gap-2 rounded-[8px] bg-teal px-4 text-[15px] font-semibold text-white hover:brightness-110"
          >
            <Icon src={a('save')} size={16} />
            Simpan
          </button>
        </form>
      </div>
    </div>
  )
}
