import { Link } from 'react-router-dom'
import { Button } from '../ui'
import { cn } from '../../lib/cn'

type SearchingHeroProps = {
  onCompareClick: () => void
  className?: string
}

export function SearchingHero({
  onCompareClick,
  className,
}: SearchingHeroProps) {
  return (
    <header className={cn('max-w-3xl', className)}>
      <p className="text-label text-primary">SEARCHING ALGORITHMS</p>
      <h1 className="mt-2 text-foreground">Find What You&apos;re Looking For</h1>
      <p className="mt-3 text-body text-muted-foreground">
        Learn how searching algorithms find values in data, understand the
        trade-offs between different approaches, and discover when each
        technique is useful.
      </p>

      <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center">
        <Link
          to="/learn/linear-search"
          className={cn(
            'inline-flex h-11 w-full items-center justify-center gap-2 rounded-md px-5 text-base font-medium',
            'bg-primary text-primary-foreground shadow-sm transition-theme hover:bg-primary-hover',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            'sm:w-auto',
          )}
        >
          Start with Linear Search →
        </Link>
        <Button
          type="button"
          size="lg"
          variant="secondary"
          className="w-full sm:w-auto"
          onClick={onCompareClick}
        >
          Compare Search Methods
        </Button>
      </div>
    </header>
  )
}
