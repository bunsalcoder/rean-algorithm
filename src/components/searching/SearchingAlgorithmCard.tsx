import { Link } from 'react-router-dom'
import type { SearchingAlgorithm } from '../../data/algorithms/searching'
import { cn } from '../../lib/cn'
import { Badge, Card } from '../ui'

function SearchGlyph({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  )
}

function BinaryGlyph({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 19V5l7 7 7-7v14" />
    </svg>
  )
}

type SearchingAlgorithmCardProps = {
  algorithm: SearchingAlgorithm
  className?: string
}

export function SearchingAlgorithmCard({
  algorithm,
  className,
}: SearchingAlgorithmCardProps) {
  const Icon = algorithm.slug === 'binary-search' ? BinaryGlyph : SearchGlyph

  return (
    <Card
      className={cn(
        'flex h-full flex-col p-5 sm:p-6',
        !algorithm.available && 'opacity-80 hover:border-border hover:shadow-sm',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'flex size-10 items-center justify-center rounded-lg',
            algorithm.available
              ? 'bg-primary-muted text-primary'
              : 'bg-muted text-muted-foreground',
          )}
        >
          <Icon className="size-5" />
        </span>
        <div className="flex flex-wrap justify-end gap-1.5">
          {algorithm.available ? (
            <Badge variant="primary" className="text-[0.65rem]">
              {algorithm.difficulty}
            </Badge>
          ) : (
            <Badge variant="muted" className="text-[0.65rem]">
              Coming Soon
            </Badge>
          )}
        </div>
      </div>

      <h3 className="mt-4 text-base font-medium text-foreground sm:text-lg">
        {algorithm.name}
      </h3>
      <p className="mt-2 flex-1 text-body-sm text-muted-foreground">
        {algorithm.description}
      </p>

      <dl className="mt-4 space-y-1.5 rounded-lg border border-border bg-muted/40 px-3 py-2.5 dark:bg-muted/25">
        <div className="flex justify-between gap-2 text-sm">
          <dt className="text-muted-foreground">Best</dt>
          <dd className="font-mono text-foreground">{algorithm.bestTime}</dd>
        </div>
        <div className="flex justify-between gap-2 text-sm">
          <dt className="text-muted-foreground">Average</dt>
          <dd className="font-mono text-foreground">{algorithm.averageTime}</dd>
        </div>
        <div className="flex justify-between gap-2 text-sm">
          <dt className="text-muted-foreground">Worst</dt>
          <dd className="font-mono text-foreground">{algorithm.worstTime}</dd>
        </div>
      </dl>

      {algorithm.available && algorithm.href ? (
        <Link
          to={algorithm.href}
          className={cn(
            'mt-5 inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium',
            'bg-primary text-primary-foreground shadow-sm transition-theme hover:bg-primary-hover',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          )}
        >
          Learn {algorithm.name}
        </Link>
      ) : (
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Lesson coming soon
        </p>
      )}
    </Card>
  )
}
