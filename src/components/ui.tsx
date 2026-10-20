import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

/** Resolves a downloaded Figma asset: asset('tugas', 'phone') → /assets/tugas/phone.svg */
export const asset = (screen: string, name: string) =>
  `${import.meta.env.BASE_URL}assets/${screen}/${name}.svg`

export function Icon({ src, size, className = '' }: { src: string; size: number; className?: string }) {
  // Explicit CSS size so flex `align-items: stretch` can't distort the SVG next to multi-line text.
  return (
    <img src={src} alt="" width={size} height={size} style={{ width: size, height: size }} className={`block shrink-0 ${className}`} />
  )
}

/* ---------- Brand ---------- */

export function Logo({ screen, size = 'md', centang = 'centang' }: {
  screen: string
  size?: 'sm' | 'md' | 'lg'
  centang?: string
}) {
  const text = { sm: 'text-[14px]', md: 'text-[18px]', lg: 'text-[24px]' }[size]
  const mark = { sm: 12, md: 12, lg: 16 }[size]
  return (
    <div className="flex items-start">
      <span className={`font-extrabold leading-none tracking-[0.5px] text-navy ${text}`}>TUNTAS</span>
      <Icon src={asset(screen, centang)} size={mark} />
    </div>
  )
}

/* ---------- Mobile chrome ---------- */

export function StatusBar({ screen, className = '' }: { screen: string; className?: string }) {
  return (
    <div className={`flex h-[62px] items-center justify-between px-4 ${className}`}>
      <span className="pr-1.5 font-inter text-[16px] font-semibold text-ink">09.41</span>
      <div className="flex items-center gap-[7px] pl-1.5">
        <Icon src={asset(screen, 'signal')} size={18} />
        <Icon src={asset(screen, 'wifi')} size={18} />
        <Icon src={asset(screen, 'battery')} size={18} />
      </div>
    </div>
  )
}

/** Centers a 390px-wide phone screen on larger viewports. */
export function PhoneFrame({ children, className = 'bg-canvas' }: { children: ReactNode; className?: string }) {
  return (
    <div className="min-h-screen bg-[#e4e9ee]">
      <div className={`relative mx-auto flex min-h-screen w-full max-w-[390px] flex-col ${className}`}>
        {children}
      </div>
    </div>
  )
}

/* ---------- Badges & chips ---------- */

export type Kategori = 'positif1618' | 'positifLain' | 'invalid' | 'negatif'

const kategoriStyle: Record<Kategori, { label: string; box: string; text: string; dot: string }> = {
  positif1618: { label: 'Positif 16/18', box: 'bg-red-soft', text: 'text-red', dot: 'dot-merah' },
  positifLain: { label: 'Positif lain', box: 'bg-amber-tint', text: 'text-amber', dot: 'dot-kuning' },
  invalid: { label: 'Invalid', box: 'bg-gray-tint', text: 'text-muted', dot: 'dot-abu' },
  negatif: { label: 'Negatif', box: 'bg-green-tint', text: 'text-green', dot: 'dot-hijau' },
}

/** Kemenkes result category badge (rounded-6 with colored dot). */
export function KategoriBadge({ kategori, screen, variant = 'mobile' }: {
  kategori: Kategori
  screen: string
  /** Desktop (Lab) uses slightly different tints and the amber ink text. */
  variant?: 'mobile' | 'desktop'
}) {
  const s = kategoriStyle[kategori]
  let box = s.box
  let text = s.text
  if (variant === 'desktop') {
    if (kategori === 'positifLain') { box = 'bg-amber-soft'; text = 'text-amber-ink' }
    if (kategori === 'negatif') box = 'bg-green-soft'
    if (kategori === 'invalid') box = 'bg-gray-soft'
  }
  return (
    <span className={`inline-flex h-6 shrink-0 items-center gap-2 rounded-[6px] px-2 ${box}`}>
      <Icon src={asset(screen, s.dot)} size={8} />
      <span className={`whitespace-nowrap text-[12px] font-semibold ${text}`}>{s.label}</span>
    </span>
  )
}

export type Skor = 'tinggi' | 'sedang' | 'rendah'

const skorStyle: Record<Skor, { label: string; cls: string; icon: string }> = {
  tinggi: { label: 'Skor Tinggi', cls: 'bg-red-soft border-red text-red', icon: 'skor-tinggi' },
  sedang: { label: 'Skor Sedang', cls: 'bg-amber-tint border-amber text-amber', icon: 'skor-sedang' },
  rendah: { label: 'Skor Rendah', cls: 'bg-green-tint border-green text-green', icon: 'skor-rendah' },
}

export function SkorChip({ skor, screen }: { skor: Skor; screen: string }) {
  const s = skorStyle[skor]
  return (
    <span className={`inline-flex h-6 shrink-0 items-center gap-2 rounded-full border px-2 ${s.cls}`}>
      <Icon src={asset(screen, s.icon)} size={14} />
      <span className="whitespace-nowrap text-[12px] font-bold">{s.label}</span>
    </span>
  )
}

/** Generic pill with icon — SLA chips, status chips, severity chips. */
export function Pill({ icon, iconSize = 14, children, className }: {
  icon?: string
  iconSize?: number
  children: ReactNode
  className: string
}) {
  return (
    <span className={`inline-flex h-6 shrink-0 items-center gap-2 rounded-full px-2 text-[12px] font-bold whitespace-nowrap ${className}`}>
      {icon && <Icon src={icon} size={iconSize} />}
      {children}
    </span>
  )
}

export function CountBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-6 shrink-0 items-center justify-center rounded-full bg-red px-2 text-[12px] font-bold text-white">
      {children}
    </span>
  )
}

/* ---------- Surfaces ---------- */

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[12px] border border-line bg-white shadow-card ${className}`}>{children}</div>
  )
}

export function CardHead({ title, meta, size = 16 }: { title: ReactNode; meta?: ReactNode; size?: 16 | 18 }) {
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <h2 className={`font-bold text-ink ${size === 18 ? 'text-[18px]' : 'text-[16px]'}`}>{title}</h2>
      {meta && <span className="text-[13px] font-semibold whitespace-nowrap text-muted">{meta}</span>}
    </div>
  )
}

/* ---------- Desktop chrome ---------- */

export type NavItem = { label: string; icon: string; to?: string; count?: number; active?: boolean }

export function Sidebar({ screen, items, user }: {
  screen: string
  items: NavItem[]
  user: { initials: string; name: string; role: string }
}) {
  return (
    <aside className="sticky top-0 flex h-screen w-[240px] shrink-0 flex-col gap-8 border-r border-line bg-white px-4 py-6">
      <div className="px-2">
        <Link to="/" aria-label="Beranda TUNTAS"><Logo screen={screen} size="lg" /></Link>
      </div>
      <nav className="flex flex-col gap-2">
        {items.map((item) => {
          const cls = `flex h-10 w-full items-center gap-4 rounded-[8px] px-2 text-left text-[14px] ${
            item.active ? 'bg-navy-soft font-bold text-navy' : 'font-medium text-ink hover:bg-canvas'
          }`
          const inner = (
            <>
              <Icon src={asset(screen, item.icon)} size={20} />
              <span className="flex-1">{item.label}</span>
              {item.count != null && <CountBadge>{item.count}</CountBadge>}
            </>
          )
          return item.to ? (
            <Link key={item.label} to={item.to} className={cls} aria-current={item.active ? 'page' : undefined}>{inner}</Link>
          ) : (
            <button key={item.label} type="button" className={cls}>{inner}</button>
          )
        })}
      </nav>
      <div className="mt-auto flex h-16 items-center gap-2 border-t border-line px-2 py-4">
        <span className="flex size-8 items-center justify-center rounded-full bg-teal-soft text-[12px] font-bold text-teal">
          {user.initials}
        </span>
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold text-ink">{user.name}</span>
          <span className="text-[12px] text-muted">{user.role}</span>
        </div>
      </div>
    </aside>
  )
}

export function DataSintetis({ screen }: { screen: string }) {
  return (
    <span className="inline-flex h-8 shrink-0 items-center gap-2 rounded-full border border-amber bg-amber-soft px-4">
      <Icon src={asset(screen, 'sintetis')} size={16} />
      <span className="text-[13px] font-bold text-amber-ink">Data sintetis</span>
    </span>
  )
}

export function KpiCard({ label, value, note, icon, iconBox, progress }: {
  label: string
  value: string
  note: ReactNode
  icon: string
  iconBox: string
  progress?: { value: number; target: number; color: string }
}) {
  return (
    <Card className="flex min-w-0 flex-1 flex-col gap-4 p-6">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[14px] font-medium whitespace-nowrap text-muted">{label}</span>
        <span className={`flex size-8 items-center justify-center rounded-[8px] ${iconBox}`}>
          <Icon src={icon} size={16} />
        </span>
      </div>
      <span className="text-[32px] font-bold tracking-[-0.5px] text-ink">{value}</span>
      <p className="text-[13px] text-muted">{note}</p>
      {progress && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[12px]">
            <span className="text-muted">Target {progress.target}%</span>
            <span className="font-semibold text-ink">{progress.value}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-navy-soft">
            <div className={`h-2 rounded-full ${progress.color}`} style={{ width: `${progress.value}%` }} />
          </div>
        </div>
      )}
    </Card>
  )
}

/* ---------- Funnel (Kaskade skrining) ---------- */

export type Tahap = { label: string; value: number; display: string; pct: ReactNode; pctBold?: boolean }

const BAR_MAX = 136

function FunnelGroup({ title, stages, slotWidth }: { title: string; stages: Tahap[]; slotWidth: number }) {
  const max = Math.max(...stages.map((s) => s.value))
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[12px] font-bold tracking-[0.5px] whitespace-nowrap text-muted">{title}</p>
      <div className="flex">
        {stages.map((s) => (
          <div key={s.label} className="flex flex-col gap-2" style={{ width: slotWidth }}>
            <div className="flex h-[176px] flex-col items-center justify-end gap-2 border-b border-line">
              <span className="text-[16px] font-bold text-ink">{s.display}</span>
              <div
                className="w-6 rounded-t-[4px] bg-navy"
                style={{ height: Math.round((s.value / max) * BAR_MAX) }}
              />
            </div>
            <div className="flex flex-col items-center">
              <p className="h-10 w-full text-center text-[13px] leading-[1.4] font-semibold text-ink">{s.label}</p>
              <div className={`text-center text-[12px] text-muted ${s.pctBold ? 'font-semibold' : ''}`}>{s.pct}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Funnel({ screen, skrining, tindakLanjut, slotWidth }: {
  screen: string
  skrining: { title: string; stages: Tahap[] }
  tindakLanjut: { title: string; stages: Tahap[] }
  slotWidth: number
}) {
  return (
    <div className="flex w-full items-start">
      <FunnelGroup {...skrining} slotWidth={slotWidth} />
      <div className="flex h-[276px] min-w-6 flex-1 flex-col items-center justify-center gap-2">
        <div className="h-20 w-px bg-line" />
        <span className="flex size-6 items-center justify-center rounded-full border border-line bg-canvas">
          <Icon src={asset(screen, 'zoom')} size={12} />
        </span>
        <div className="h-20 w-px bg-line" />
      </div>
      <FunnelGroup {...tindakLanjut} slotWidth={slotWidth} />
    </div>
  )
}

export function LeakPill({ screen, children }: { screen: string; children: ReactNode }) {
  return (
    <Pill icon={asset(screen, 'leak')} className="bg-amber-soft text-amber-ink">{children}</Pill>
  )
}
