import { Link } from 'react-router-dom'
import {
  searchingComparisonAlgorithms,
  type SearchingAlgorithmComparison,
} from '../../data/algorithms/searching-comparison'
import { cn } from '../../lib/cn'
import { Badge, Card } from '../ui'

function StrategyIcon({
  slug,
  className,
}: {
  slug: string
  className?: string
}) {
  const shared = {
    'aria-hidden': true as const,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
  }

  switch (slug) {
    case 'linear-search':
      return (
        <svg {...shared}>
          <path d="M4 12h13" />
          <path d="m14 7 5 5-5 5" />
          <circle cx="4" cy="12" r="1.25" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'binary-search':
      return (
        <svg {...shared}>
          <path d="M5 19V5l7 7 7-7v14" />
        </svg>
      )
    case 'jump-search':
      return (
        <svg {...shared}>
          <path d="M4 17h3l2-5 3 8 2-6h6" />
          <path d="M4 7h4M12 7h4M20 7h0" />
        </svg>
      )
    case 'interpolation-search':
      return (
        <svg {...shared}>
          <path d="M4 18 10 8l4 5 6-9" />
          <circle cx="10" cy="8" r="1.25" fill="currentColor" stroke="none" />
          <circle cx="20" cy="4" r="1.25" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'exponential-search':
      return (
        <svg {...shared}>
          <path d="M4 18c2-1 3-4 4-8 1 5 2 8 4 8s3-3 4-8c1 4 2 7 4 8" />
          <path d="M4 18h16" />
        </svg>
      )
    default:
      return (
        <svg {...shared}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
      )
  }
}

type SearchingStrategyCardsProps = {
  algorithms?: SearchingAlgorithmComparison[]
  className?: string
}

export function SearchingStrategyCards({
  algorithms = searchingComparisonAlgorithms,
  className,
}: SearchingStrategyCardsProps) {
  return (
    <ul
      className={cn(
        'grid gap-4 sm:grid-cols-2 xl:grid-cols-3',
        className,
      )}
    >
      {algorithms.map((algorithm) => (
        <li key={algorithm.slug}>
          <Card className="flex h-full flex-col p-5 hover:border-primary/25 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary-muted text-primary">
                <StrategyIcon slug={algorithm.slug} className="size-5" />
              </span>
              <Badge variant="muted" className="font-mono text-[0.65rem]">
                {algorithm.worst}
              </Badge>
            </div>

            <h3 className="mt-4 text-base font-medium text-foreground">
              {algorithm.name}
            </h3>
            <p className="mt-1 text-sm font-medium text-accent-foreground">
              {algorithm.strategyLabel}
            </p>
            <p className="mt-2 flex-1 text-body-sm text-muted-foreground">
              {algorithm.keyIdea}
            </p>

            <dl className="mt-4 space-y-1.5 rounded-lg border border-border bg-muted/40 px-3 py-2.5 dark:bg-muted/25">
              <div className="flex justify-between gap-2 text-sm">
                <dt className="text-muted-foreground">Complexity</dt>
                <dd className="text-right font-mono text-xs text-foreground">
                  {algorithm.average} avg
                </dd>
              </div>
              <div className="text-sm">
                <dt className="sr-only">Requirement</dt>
                <dd className="text-body-sm text-muted-foreground">
                  {algorithm.requirementSummary}
                </dd>
              </div>
            </dl>

            <Link
              to={algorithm.lessonHref}
              className={cn(
                'mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary',
                'transition-theme hover:text-primary-hover',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              )}
            >
              Learn More →
            </Link>
          </Card>
        </li>
      ))}
    </ul>
  )
}
