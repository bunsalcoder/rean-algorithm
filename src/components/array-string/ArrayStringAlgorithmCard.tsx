import { Link } from 'react-router-dom'
import type { ArrayStringAlgorithm } from '../../data/algorithms/array-string'
import { cn } from '../../lib/cn'
import { Badge, Card } from '../ui'

function PointersGlyph({ className }: { className?: string }) {
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
      <path d="M4 7h16" />
      <path d="M4 12h10" />
      <path d="M4 17h16" />
      <path d="M7 5v4" />
      <path d="M17 15v4" />
    </svg>
  )
}

function ComingSoonGlyph({ className }: { className?: string }) {
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
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 9h8M8 13h5" />
    </svg>
  )
}

type ArrayStringAlgorithmCardProps = {
  algorithm: ArrayStringAlgorithm
  className?: string
}

export function ArrayStringAlgorithmCard({
  algorithm,
  className,
}: ArrayStringAlgorithmCardProps) {
  const Icon = algorithm.available ? PointersGlyph : ComingSoonGlyph

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
