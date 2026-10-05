import { useId, useState } from 'react'
import {
  getSearchingDisplayTimeForCase,
  getSearchingTimeForCase,
  searchingComparisonAlgorithms,
  searchingComplexityCaseLabels,
  searchingComplexityClassRank,
  type SearchingAlgorithmComparison,
  type SearchingComplexityCase,
  type SearchingComplexityClass,
} from '../../data/algorithms/searching-comparison'
import { cn } from '../../lib/cn'
import { Badge, Button, Card } from '../ui'

const CASES: SearchingComplexityCase[] = ['best', 'average', 'worst']
const SCALE: SearchingComplexityClass[] = [
  'O(1)',
  'O(log log n)',
  'O(log n)',
  'O(√n)',
  'O(n)',
]

type SearchingComplexityComparisonProps = {
  algorithms?: SearchingAlgorithmComparison[]
  className?: string
}

export function SearchingComplexityComparison({
  algorithms = searchingComparisonAlgorithms,
  className,
}: SearchingComplexityComparisonProps) {
  const [selectedCase, setSelectedCase] =
    useState<SearchingComplexityCase>('average')
  const headingId = useId()
  const descriptionId = useId()
  const noteId = useId()

  return (
    <Card className={cn('p-5 sm:p-6 hover:border-primary/25', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-label text-primary">BIG O GROWTH</p>
          <h3
            id={headingId}
            className="mt-2 text-lg font-medium text-foreground sm:text-xl"
          >
            Complexity at a Glance
          </h3>
          <p
            id={descriptionId}
            className="mt-2 max-w-2xl text-body-sm text-muted-foreground"
          >
            This chart compares conceptual Big O growth classes — how work can
            scale as input size increases. It is not a measured runtime
            benchmark and does not show milliseconds.
          </p>
        </div>

        <Badge variant="muted" className="shrink-0 self-start">
          Conceptual only
        </Badge>
      </div>

      <div
        className="mt-5 flex flex-wrap gap-2"
        role="group"
        aria-labelledby={headingId}
        aria-describedby={`${descriptionId} ${noteId}`}
      >
        {CASES.map((complexityCase) => {
          const isActive = selectedCase === complexityCase
          return (
            <Button
              key={complexityCase}
              type="button"
              size="sm"
              variant={isActive ? 'primary' : 'outline'}
              aria-pressed={isActive}
              onClick={() => setSelectedCase(complexityCase)}
            >
              {searchingComplexityCaseLabels[complexityCase]}
            </Button>
          )
        })}
      </div>

      <p className="mt-4 text-body-sm text-muted-foreground" aria-live="polite">
        Showing{' '}
        <span className="font-medium text-foreground">
          {searchingComplexityCaseLabels[selectedCase].toLowerCase()}
        </span>{' '}
        growth classes for all five algorithms.
      </p>

      <div className="mt-6 space-y-3" role="list" aria-label="Complexity bars">
        {algorithms.map((algorithm) => {
          const complexityClass = getSearchingTimeForCase(
            algorithm,
            selectedCase,
          )
          const display = getSearchingDisplayTimeForCase(
            algorithm,
            selectedCase,
          )
          const rank = searchingComplexityClassRank[complexityClass]
          const maxRank = searchingComplexityClassRank['O(n)']
          const widthPercent = Math.round((rank / maxRank) * 100)

          return (
            <div
              key={algorithm.slug}
              role="listitem"
              className="grid grid-cols-1 gap-2 sm:grid-cols-[10.5rem_1fr_auto] sm:items-center sm:gap-3"
            >
              <p className="text-sm font-medium text-foreground">
                {algorithm.name}
              </p>

              <div
                className="h-3 overflow-hidden rounded-full bg-muted dark:bg-muted/60"
                aria-hidden="true"
              >
                <div
                  className={cn(
                    'h-full rounded-full bg-primary transition-[width] duration-300 ease-out',
                    'motion-reduce:transition-none',
                  )}
                  style={{ width: `${widthPercent}%` }}
                />
              </div>

              <p className="font-mono text-sm font-medium text-accent-foreground sm:min-w-[7.5rem] sm:text-right">
                <span className="sr-only">
                  {algorithm.name}{' '}
                  {searchingComplexityCaseLabels[selectedCase]}:{' '}
                </span>
                {display}
              </p>
            </div>
          )
        })}
      </div>

      <p
        id={noteId}
        className="mt-5 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-body-sm text-muted-foreground dark:bg-muted/25"
      >
        Interpolation Search can achieve O(log log n) behavior under suitable
        distribution assumptions, but its worst case is O(n).
      </p>

      <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
        <p className="w-full text-xs text-muted-foreground">
          Scale (smaller growth class → larger growth of cost):
        </p>
        {SCALE.map((label) => (
          <Badge key={label} variant="default" className="font-mono">
            {label}
          </Badge>
        ))}
      </div>
    </Card>
  )
}
