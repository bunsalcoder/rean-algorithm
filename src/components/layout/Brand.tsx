import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'

type BrandProps = {
  className?: string
  onNavigate?: () => void
}

function BrandMark() {
  return (
    <span
      aria-hidden="true"
      className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 17V7l8 5 8-5v10" />
        <path d="M4 7l8 5 8-5" />
      </svg>
    </span>
  )
}

export function Brand({ className, onNavigate }: BrandProps) {
  return (
    <Link
      to="/"
      onClick={onNavigate}
      className={cn(
        'group inline-flex items-center gap-2.5 rounded-md focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'focus-visible:ring-offset-background',
        className,
      )}
      aria-label="Rean Algorithm home"
    >
      <BrandMark />
      <span className="text-sm font-medium tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-[0.9375rem]">
        rean-algorithm
      </span>
    </Link>
  )
}
