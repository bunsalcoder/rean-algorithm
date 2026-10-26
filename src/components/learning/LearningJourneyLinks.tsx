import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'

type LearningJourneyLinksProps = {
  className?: string
  /** Compact single-line variant for hub footers. */
  compact?: boolean
}

/**
 * Shared learning-journey links for hubs, comparison pages, and practice.
 */
export function LearningJourneyLinks({
  className,
  compact = false,
}: LearningJourneyLinksProps) {
  if (compact) {
    return (
      <p className={cn('text-body-sm text-muted-foreground', className)}>
        Continue on the{' '}
        <Link
          to="/roadmap"
          className="font-medium text-primary transition-theme hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          learning roadmap
        </Link>{' '}
        or your{' '}
        <Link
          to="/practice/dashboard"
          className="font-medium text-primary transition-theme hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          practice dashboard
        </Link>
        .
      </p>
    )
  }

  return (
    <nav
      aria-label="Learning journey"
      className={cn(
        'flex flex-wrap gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5',
        className,
      )}
    >
      <Link
        to="/roadmap"
        className={cn(
          'inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium',
          'bg-primary text-primary-foreground shadow-sm transition-theme',
          'hover:bg-primary-hover',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
      >
        Learning roadmap
      </Link>
      <Link
        to="/practice/dashboard"
        className={cn(
          'inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium',
          'border border-border bg-background text-foreground shadow-sm transition-theme',
          'hover:bg-muted',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
      >
        Practice dashboard
      </Link>
      <Link
        to="/practice"
        className={cn(
          'inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium',
          'border border-border bg-background text-foreground shadow-sm transition-theme',
          'hover:bg-muted',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
      >
        Practice library
      </Link>
    </nav>
  )
}
