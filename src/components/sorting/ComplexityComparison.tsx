import { useId, useState } from 'react'
import {
  complexityCaseLabels,
  complexityClassRank,
  getTimeForCase,
  sortingComparisonAlgorithms,
  type ComplexityCase,
  type ComplexityClass,
  type SortingAlgorithmComparison,
} from '../../data/algorithms/sorting-comparison'
import { cn } from '../../lib/cn'
import { Badge, Button, Card } from '../ui'

const CASES: ComplexityCase[] = ['best', 'average', 'worst']
const SCALE: ComplexityClass[] = ['O(n)', 'O(n log n)', 'O(n²)']

type ComplexityComparisonProps = {
  algorithms?: SortingAlgorithmComparison[]
  className?: string
}

export function ComplexityComparison({
  algorithms = sortingComparisonAlgorithms,
  className,
}: ComplexityComparisonProps) {
  const [selectedCase, setSelectedCase] = useState<ComplexityCase>('average')
  const headingId = useId()
  const descriptionId = useId()

  return (
    <Card className={cn('p-5 sm:p-6 hover:border-primary/25', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-label text-primary">BIG O GROWTH</p>
          <h3
            id={headingId}
            className="mt-2 text-lg font-medium text-foreground sm:text-xl"
          >
            Time Complexity at a Glance
          </h3>
          <p
            id={descriptionId}
            className="mt-2 max-w-2xl text-body-sm text-muted-foreground"
          >
            This chart compares conceptual Big O growth classes — how work
            scales as input size increases. It is not a measured runtime
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
        aria-describedby={descriptionId}
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
              {complexityCaseLabels[complexityCase]}
            </Button>
          )
        })}
      </div>

      <p className="mt-4 text-body-sm text-muted-foreground" aria-live="polite">
        Showing{' '}
        <span className="font-medium text-foreground">
          {complexityCaseLabels[selectedCase].toLowerCase()}
        </span>{' '}
        growth classes for all six algorithms.
      </p>

      <div className="mt-6 space-y-3" role="list" aria-label="Complexity bars">
        {algorithms.map((algorithm) => {
          const complexity = getTimeForCase(algorithm, selectedCase)
          const rank = complexityClassRank[complexity]
          const maxRank = complexityClassRank['O(n²)']
          const widthPercent = Math.round((rank / maxRank) * 100)

          return (
            <div
              key={algorithm.slug}
              role="listitem"
              className="grid grid-cols-1 gap-2 sm:grid-cols-[9.5rem_1fr_auto] sm:items-center sm:gap-3"
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

              <p className="font-mono text-sm font-medium text-accent-foreground sm:min-w-[6.5rem] sm:text-right">
                <span className="sr-only">
                  {algorithm.name} {complexityCaseLabels[selectedCase]}:{' '}
                </span>
                {complexity}
              </p>
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
        <p className="w-full text-xs text-muted-foreground">
          Scale (slower growth → faster growth of cost):
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
