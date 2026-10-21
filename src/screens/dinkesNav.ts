import type { NavItem } from '../components/ui'

export const dinkesUser = { initials: 'DK', name: 'Pengguna Dinkes', role: 'Tampilan agregat' }

export const dinkesNav = (active: 'ringkasan' | 'puskesmas'): NavItem[] => [
  { label: 'Ringkasan', icon: 'nav-ringkasan', to: '/dinkes', active: active === 'ringkasan' },
  { label: 'Sumber data', icon: 'nav-puskesmas', to: '/dinkes', active: active === 'puskesmas' },
]
