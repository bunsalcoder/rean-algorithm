import { Link } from 'react-router-dom'
import { getDataStructuresStartHref } from '../../data/data-structures'
import { cn } from '../../lib/cn'
import { DataStructureVisual } from './DataStructureVisual'

type DataStructuresHeroProps = {
  className?: string
}

export function DataStructuresHero({ className }: DataStructuresHeroProps) {
  const startHref = getDataStructuresStartHref()

  return (
    <header
      className={cn(
        'grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-10',
        className,
      )}
    >
      <div className="min-w-0 max-w-2xl">
        <p className="text-label text-primary">STRUCTURE YOUR THINKING</p>
        <h1 className="mt-2 text-foreground">Understand Data Structures</h1>
        <p className="mt-3 text-body text-muted-foreground">
          Data structures organize information so programs can store, access,
          and update it efficiently. The shape you choose shapes the speed of
          the algorithms that run on top of it.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            to={startHref}
            className={cn(
              'inline-flex h-11 w-full items-center justify-center gap-2 rounded-md px-5 text-base font-medium',
              'bg-primary text-primary-foreground shadow-sm transition-theme hover:bg-primary-hover',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              'sm:w-auto',
            )}
          >
            Start Learning
          </Link>
          <a
            href="#explore"
            className={cn(
              'inline-flex h-11 w-full items-center justify-center gap-2 rounded-md px-5 text-base font-medium',
              'border border-border bg-surface text-foreground shadow-sm transition-theme hover:bg-muted',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              'sm:w-auto',
            )}
          >
            Explore Structures
          </a>
        </div>
      </div>

      <DataStructureVisual />
    </header>
  )
}
