import type { ReactNode } from 'react'
import type { HighlightIconName } from '../../data/learningHighlights'
import { cn } from '../../lib/cn'

type HighlightIconProps = {
  name: HighlightIconName
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

export function HighlightIcon({ name, className }: HighlightIconProps) {
  switch (name) {
    case 'explanations':
      return (
        <IconShell className={className}>
          <path d="M5 4.5h10a2 2 0 0 1 2 2v13l-3.5-2-3.5 2-3.5-2-3.5 2v-13a2 2 0 0 1 2-2Z" />
          <path d="M8 9h6" />
          <path d="M8 12.5h4" />
        </IconShell>
      )
    case 'visual':
      return (
        <IconShell className={className}>
          <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z" />
          <circle cx="12" cy="12" r="2.75" />
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
    case 'practice':
      return (
        <IconShell className={className}>
          <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
          <path d="m8 9.5 2.5 2.5L8 14.5" />
          <path d="M13 14.5h3.5" />
        </IconShell>
      )
  }
}
