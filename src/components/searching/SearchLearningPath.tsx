import { Link } from 'react-router-dom'
import type { SearchingAlgorithm } from '../../data/algorithms/searching'
import { cn } from '../../lib/cn'
import { Badge } from '../ui'

type SearchLearningPathProps = {
  algorithms: SearchingAlgorithm[]
  className?: string
}

export function SearchLearningPath({
  algorithms,
  className,
}: SearchLearningPathProps) {
  return (
    <ol className={cn('space-y-3', className)}>
      {algorithms.map((algorithm, index) => {
        const stage = index + 1
        const content = (
          <>
            <span
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-medium',
                algorithm.available
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
              aria-hidden="true"
            >
              {String(stage).padStart(2, '0')}
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    'text-sm font-medium sm:text-base',
                    algorithm.available
                      ? 'text-foreground'
                      : 'text-muted-foreground',
                  )}
                >
                  {algorithm.name}
                </span>
                <Badge
                  variant={algorithm.available ? 'primary' : 'muted'}
                  className="text-[0.65rem]"
                >
                  {algorithm.available ? algorithm.difficulty : 'Coming Soon'}
                </Badge>
                <Badge variant="muted" className="font-mono text-[0.65rem]">
                  {algorithm.pathComplexity}
                </Badge>
              </span>
              <span className="mt-1.5 block text-body-sm text-muted-foreground">
                {algorithm.pathDescription}
              </span>
            </span>

            {algorithm.available ? (
              <span className="shrink-0 text-sm font-medium text-primary">
                Learn →
              </span>
            ) : null}
          </>
        )

        if (!algorithm.available || !algorithm.href) {
          return (
            <li key={algorithm.slug}>
              <div
                className={cn(
                  'flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 opacity-80 sm:flex-row sm:items-center',
                  'shadow-sm',
                )}
              >
                {content}
              </div>
            </li>
          )
        }

        return (
          <li key={algorithm.slug}>
            <Link
              to={algorithm.href}
              className={cn(
                'group flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm sm:flex-row sm:items-center',
                'transition-theme hover:border-primary/30 hover:shadow-md',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              )}
            >
              {content}
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
