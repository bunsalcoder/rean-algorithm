import { Link, useLocation } from 'react-router-dom'
import type { AlgorithmItem } from '../../data/algorithms'
import { cn } from '../../lib/cn'
import { Badge } from '../ui'

type AlgorithmListProps = {
  algorithms: AlgorithmItem[]
  activeHref?: string
  className?: string
  compact?: boolean
}

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

function SortGlyph({ className }: { className?: string }) {
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
      <path d="M8 5v14M8 19l-3-3M8 19l3-3M16 19V5M16 5l-3 3M16 5l3 3" />
    </svg>
  )
}

function AlgorithmGlyph({
  categoryId,
  className,
}: {
  categoryId: AlgorithmItem['categoryId']
  className?: string
}) {
  if (categoryId === 'sorting') {
    return <SortGlyph className={className} />
  }

  return <SearchGlyph className={className} />
}

export function AlgorithmList({
  algorithms,
  activeHref,
  className,
  compact = false,
}: AlgorithmListProps) {
  const location = useLocation()
  const currentPath = activeHref ?? location.pathname

  return (
    <ul className={cn('space-y-2', className)}>
      {algorithms.map((algorithm) => {
        const isActive =
          algorithm.status === 'available' &&
          (currentPath === algorithm.href ||
            (algorithm.lessonSlug !== undefined &&
              currentPath === `/learn/${algorithm.lessonSlug}`))
        const isAvailable = algorithm.status === 'available'

        const content = (
          <>
            <span
              className={cn(
                'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-primary-muted text-primary',
              )}
            >
              <AlgorithmGlyph
                categoryId={algorithm.categoryId}
                className="size-4"
              />
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    'text-sm font-medium',
                    isActive ? 'text-accent-foreground' : 'text-foreground',
                    !isAvailable && 'text-muted-foreground',
                  )}
                >
                  {algorithm.title}
                </span>
                {algorithm.status === 'coming-soon' ? (
                  <Badge variant="muted" className="text-[0.65rem]">
                    Soon
                  </Badge>
                ) : null}
              </span>
              {!compact ? (
                <span className="mt-1 block text-xs text-muted-foreground">
                  {algorithm.description}
                </span>
              ) : null}
            </span>
          </>
        )

        if (!isAvailable) {
          return (
            <li key={algorithm.id}>
              <div
                className={cn(
                  'flex gap-3 rounded-xl border border-border bg-surface p-3',
                  'opacity-80',
                  compact && 'p-2.5',
                )}
              >
                {content}
              </div>
            </li>
          )
        }

        return (
          <li key={algorithm.id}>
            <Link
              to={algorithm.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex gap-3 rounded-xl border p-3 transition-theme',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                compact && 'p-2.5',
                isActive
                  ? 'border-primary/35 bg-primary-muted shadow-sm'
                  : 'border-border bg-surface hover:border-primary/30 hover:shadow-sm',
              )}
            >
              {content}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
