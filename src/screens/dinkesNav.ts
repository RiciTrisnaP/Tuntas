import type { NavItem } from '../components/ui'

export const dinkesUser = { initials: 'HP', name: 'dr. Hana Prasetyo', role: 'Sudinkes Jakarta Pusat' }

export const dinkesNav = (active: 'ringkasan' | 'puskesmas'): NavItem[] => [
  { label: 'Ringkasan', icon: 'nav-ringkasan', to: '/dinkes', active: active === 'ringkasan' },
  { label: 'Puskesmas', icon: 'nav-puskesmas', to: '/dinkes/puskesmas/c', active: active === 'puskesmas' },
  { label: 'Alarm', icon: 'nav-alarm', count: 3 },
  { label: 'Laporan', icon: 'nav-laporan' },
]
