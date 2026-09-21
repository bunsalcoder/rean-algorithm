export type NavItem = {
  label: string
  to: string
  end?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', to: '/', end: true },
  { label: 'Roadmap', to: '/roadmap' },
  { label: 'Algorithms', to: '/algorithms' },
  { label: 'Data Structures', to: '/data-structures' },
  { label: 'Practice', to: '/practice' },
  { label: 'About', to: '/about' },
]
