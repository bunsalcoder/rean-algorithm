import type { ReactNode } from 'react'
import type { CategoryIconName } from '../../data/categories'
import { cn } from '../../lib/cn'

type CategoryIconProps = {
  name: CategoryIconName
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

export function CategoryIcon({ name, className }: CategoryIconProps) {
  switch (name) {
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
    case 'searching':
      return (
        <IconShell className={className}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </IconShell>
      )
    case 'array-string':
      return (
        <IconShell className={className}>
          <rect x="3.5" y="6.5" width="5" height="11" rx="1" />
          <rect x="9.5" y="6.5" width="5" height="11" rx="1" />
          <rect x="15.5" y="6.5" width="5" height="11" rx="1" />
        </IconShell>
      )
    case 'linked-list':
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
    case 'tree-graph':
      return (
        <IconShell className={className}>
          <circle cx="12" cy="5.5" r="2" />
          <circle cx="6" cy="18.5" r="2" />
          <circle cx="18" cy="18.5" r="2" />
          <path d="M12 7.5v4M12 11.5 7.5 16.5M12 11.5l4.5 5" />
        </IconShell>
      )
    case 'dynamic-programming':
      return (
        <IconShell className={className}>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="M7 15.5 10.5 11l3 2.5L17 8.5" />
          <circle cx="17" cy="8.5" r="1.25" fill="currentColor" stroke="none" />
        </IconShell>
      )
    case 'backtracking':
      return (
        <IconShell className={className}>
          <path d="M7 4v8a5 5 0 0 0 5 5h5" />
          <path d="m14 14 3 3-3 3" />
          <circle cx="7" cy="4" r="1.5" fill="currentColor" stroke="none" />
        </IconShell>
      )
  }
}
