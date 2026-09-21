import type { ReactNode } from 'react'
import type { RoadmapIconName } from '../../data/roadmap'
import { cn } from '../../lib/cn'

type RoadmapIconProps = {
  name: RoadmapIconName
  className?: string
}

function IconShell({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(className)}
    >
      {children}
    </svg>
  )
}

export function RoadmapIcon({ name, className }: RoadmapIconProps) {
  switch (name) {
    case 'foundations':
      return (
        <IconShell className={className}>
          <path d="M4 19V9.5L12 5l8 4.5V19" />
          <path d="M9 19v-5h6v5" />
        </IconShell>
      )
    case 'complexity':
      return (
        <IconShell className={className}>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="M7 15.5 10.5 11l3 2.5L17 8.5" />
          <circle cx="17" cy="8.5" r="1.25" fill="currentColor" stroke="none" />
        </IconShell>
      )
    case 'arrays-strings':
      return (
        <IconShell className={className}>
          <rect x="3.5" y="6.5" width="5" height="11" rx="1" />
          <rect x="9.5" y="6.5" width="5" height="11" rx="1" />
          <path d="M16.5 8h4" />
          <path d="M16.5 12h4" />
          <path d="M16.5 16h2.5" />
        </IconShell>
      )
    case 'searching':
      return (
        <IconShell className={className}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </IconShell>
      )
    case 'sorting':
      return (
        <IconShell className={className}>
          <path d="M4 6h10" />
          <path d="M4 12h7" />
          <path d="M4 18h4" />
          <path d="M16 6v12" />
          <path d="m13 15 3 3 3-3" />
        </IconShell>
      )
    case 'linked-lists':
      return (
        <IconShell className={className}>
          <circle cx="5.5" cy="12" r="2.5" />
          <circle cx="12" cy="12" r="2.5" />
          <circle cx="18.5" cy="12" r="2.5" />
          <path d="M8 12h1.5M14.5 12H16" />
        </IconShell>
      )
    case 'stack-queue':
      return (
        <IconShell className={className}>
          <rect x="4" y="4.5" width="16" height="4" rx="1" />
          <rect x="4" y="10" width="16" height="4" rx="1" />
          <rect x="4" y="15.5" width="16" height="4" rx="1" />
        </IconShell>
      )
    case 'hashing':
      return (
        <IconShell className={className}>
          <rect x="4" y="4.5" width="16" height="15" rx="2" />
          <path d="M8 9.5h8" />
          <path d="M8 12.5h5" />
          <path d="M8 15.5h6.5" />
          <circle cx="16.5" cy="15.5" r="1.25" fill="currentColor" stroke="none" />
        </IconShell>
      )
    case 'trees':
      return (
        <IconShell className={className}>
          <circle cx="12" cy="5.5" r="2" />
          <circle cx="6" cy="18.5" r="2" />
          <circle cx="18" cy="18.5" r="2" />
          <path d="M12 7.5v4M12 11.5 7.5 16.5M12 11.5l4.5 5" />
        </IconShell>
      )
    case 'graphs':
      return (
        <IconShell className={className}>
          <circle cx="6" cy="7" r="2" />
          <circle cx="18" cy="7" r="2" />
          <circle cx="12" cy="17" r="2" />
          <path d="M8 7h8M7.5 8.5 11 15.5M16.5 8.5 13 15.5" />
        </IconShell>
      )
    case 'techniques':
      return (
        <IconShell className={className}>
          <path d="M12 3.5 14.2 8.7l5.5.5-4.2 3.7 1.3 5.3L12 15.8 7.2 18.2l1.3-5.3L4.3 9.2l5.5-.5Z" />
        </IconShell>
      )
    case 'dynamic-programming':
      return (
        <IconShell className={className}>
          <rect x="3.5" y="4.5" width="7" height="7" rx="1" />
          <rect x="13.5" y="4.5" width="7" height="7" rx="1" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
        </IconShell>
      )
    case 'advanced':
      return (
        <IconShell className={className}>
          <path d="M12 3v3" />
          <path d="M12 18v3" />
          <path d="M3 12h3" />
          <path d="M18 12h3" />
          <circle cx="12" cy="12" r="4.5" />
          <path d="m16.2 7.8 2-2" />
          <path d="m5.8 16.2 2-2" />
          <path d="m16.2 16.2 2 2" />
          <path d="m5.8 7.8 2 2" />
        </IconShell>
      )
  }
}
