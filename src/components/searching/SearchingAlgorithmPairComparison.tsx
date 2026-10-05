import { useId, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  getSearchingPairDifferences,
  searchingComparisonAlgorithms,
  type SearchingAlgorithmComparison,
} from '../../data/algorithms/searching-comparison'
import { cn } from '../../lib/cn'
import { Badge, Card } from '../ui'

function Metric({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5 dark:bg-muted/25">
      <p className="text-label text-[0.65rem] tracking-[0.08em]">{label}</p>
      <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
    </div>
  )
}

function AlgorithmColumn({
  algorithm,
  label,
}: {
  algorithm: SearchingAlgorithmComparison
  label: string
}) {
  return (
    <Card className="p-4 sm:p-5 hover:border-primary/25">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-label text-primary">{label}</p>
          <h4 className="mt-1 text-base font-medium text-foreground sm:text-lg">
            {algorithm.name}
          </h4>
        </div>
        <Link
          to={algorithm.lessonHref}
          className={cn(
            'text-sm font-medium text-primary transition-theme hover:text-primary-hover',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          Learn →
        </Link>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Metric
          label="Best"
          value={<span className="font-mono">{algorithm.best}</span>}
        />
        <Metric
          label="Average"
          value={<span className="font-mono">{algorithm.average}</span>}
        />
        <Metric
          label="Worst"
          value={<span className="font-mono">{algorithm.worst}</span>}
        />
        <Metric
          label="Space"
          value={<span className="font-mono">{algorithm.space}</span>}
        />
        <Metric
          label="Sorted required"
          value={
            <Badge
              variant={algorithm.sortedRequired ? 'primary' : 'muted'}
              className="text-[0.65rem]"
            >
              {algorithm.sortedRequired ? 'Yes' : 'No'}
            </Badge>
          }
        />
        <Metric
          label="Numeric data"
          value={
            <Badge
              variant={algorithm.numericRequired ? 'primary' : 'muted'}
              className="text-[0.65rem]"
            >
              {algorithm.numericRequired ? 'Yes' : 'No'}
            </Badge>
          }
        />
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-sm font-medium text-foreground">Strategy</p>
          <p className="mt-1.5 text-body-sm text-muted-foreground">
            {algorithm.strategy}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Data requirement</p>
          <p className="mt-1.5 text-body-sm text-muted-foreground">
            {algorithm.requirementSummary}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Main strength</p>
          <p className="mt-1.5 text-body-sm text-muted-foreground">
            {algorithm.mainStrength}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Main limitation</p>
          <p className="mt-1.5 text-body-sm text-muted-foreground">
            {algorithm.mainLimitation}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Better fit when…</p>
          <p className="mt-1.5 text-body-sm text-muted-foreground">
            {algorithm.betterFitWhen}
          </p>
        </div>
      </div>
    </Card>
  )
}

type SearchingAlgorithmPairComparisonProps = {
  algorithms?: SearchingAlgorithmComparison[]
  defaultLeftSlug?: string
  defaultRightSlug?: string
  className?: string
}

export function SearchingAlgorithmPairComparison({
  algorithms = searchingComparisonAlgorithms,
  defaultLeftSlug = 'binary-search',
  defaultRightSlug = 'interpolation-search',
  className,
}: SearchingAlgorithmPairComparisonProps) {
  const leftId = useId()
  const rightId = useId()
  const [leftSlug, setLeftSlug] = useState(defaultLeftSlug)
  const [rightSlug, setRightSlug] = useState(defaultRightSlug)

  const left =
    algorithms.find((algorithm) => algorithm.slug === leftSlug) ?? algorithms[0]
  const right =
    algorithms.find((algorithm) => algorithm.slug === rightSlug) ??
    algorithms[1]

  const differences = useMemo(() => {
    if (!left || !right) return []
    return getSearchingPairDifferences(left, right)
  }, [left, right])

  if (!left || !right) return null

  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <p className="text-label text-primary">SIDE BY SIDE</p>
        <h3 className="mt-2 text-lg font-medium text-foreground sm:text-xl">
          Compare Two Algorithms
        </h3>
        <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground">
          Pick two algorithms and inspect how their strategies and requirements
          differ. This section explains differences — it does not declare a
          winner.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label
          htmlFor={leftId}
          className="flex flex-col gap-1.5 text-body-sm text-muted-foreground"
        >
          <span className="font-medium text-foreground">Algorithm A</span>
          <select
            id={leftId}
            value={left.slug}
            onChange={(event) => setLeftSlug(event.target.value)}
            className={cn(
              'h-10 w-full rounded-md border border-border bg-surface px-3',
              'text-sm text-foreground shadow-sm transition-theme',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            {algorithms.map((algorithm) => (
              <option key={algorithm.slug} value={algorithm.slug}>
                {algorithm.name}
              </option>
            ))}
          </select>
        </label>

        <label
          htmlFor={rightId}
          className="flex flex-col gap-1.5 text-body-sm text-muted-foreground"
        >
          <span className="font-medium text-foreground">Algorithm B</span>
          <select
            id={rightId}
            value={right.slug}
            onChange={(event) => setRightSlug(event.target.value)}
            className={cn(
              'h-10 w-full rounded-md border border-border bg-surface px-3',
              'text-sm text-foreground shadow-sm transition-theme',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            {algorithms.map((algorithm) => (
              <option key={algorithm.slug} value={algorithm.slug}>
                {algorithm.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2" aria-live="polite">
        <AlgorithmColumn algorithm={left} label="Algorithm A" />
        <AlgorithmColumn algorithm={right} label="Algorithm B" />
      </div>

      <Card className="p-5 sm:p-6 hover:border-primary/25">
        <h4 className="text-base font-medium text-foreground">
          What changes between them?
        </h4>
        <ul className="mt-3 space-y-2">
          {differences.map((point) => (
            <li
              key={point}
              className="flex gap-2 text-body-sm text-muted-foreground"
            >
              <span
                aria-hidden="true"
                className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
              />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
