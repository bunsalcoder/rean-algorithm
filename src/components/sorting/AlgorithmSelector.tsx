import { useId, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  sortingComparisonAlgorithms,
  type SortingAlgorithmComparison,
} from '../../data/algorithms/sorting-comparison'
import { cn } from '../../lib/cn'
import { Badge, Card } from '../ui'

function PropertyRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border-subtle py-2.5 last:border-b-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{children}</dd>
    </div>
  )
}

function BooleanText({
  value,
  yes,
  no,
}: {
  value: boolean
  yes: string
  no: string
}) {
  return (
    <Badge variant={value ? 'primary' : 'muted'} className="text-[0.7rem]">
      {value ? yes : no}
    </Badge>
  )
}

type AlgorithmSelectorProps = {
  algorithms?: SortingAlgorithmComparison[]
  defaultSlug?: string
  className?: string
}

export function AlgorithmSelector({
  algorithms = sortingComparisonAlgorithms,
  defaultSlug = 'insertion-sort',
  className,
}: AlgorithmSelectorProps) {
  const selectId = useId()
  const [selectedSlug, setSelectedSlug] = useState(defaultSlug)
  const selected =
    algorithms.find((algorithm) => algorithm.slug === selectedSlug) ??
    algorithms[0]

  if (!selected) return null

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-label text-primary">DETAILS</p>
          <h3 className="mt-2 text-lg font-medium text-foreground sm:text-xl">
            Compare an Algorithm
          </h3>
          <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground">
            Select one algorithm to review its documented characteristics,
            strengths, and trade-offs.
          </p>
        </div>

        <label
          htmlFor={selectId}
          className="flex w-full flex-col gap-1.5 text-body-sm text-muted-foreground sm:w-64"
        >
          <span className="font-medium text-foreground">Algorithm</span>
          <select
            id={selectId}
            value={selected.slug}
            onChange={(event) => setSelectedSlug(event.target.value)}
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

      <Card
        className={cn(
          'p-5 sm:p-6 hover:border-primary/25',
          'transition-[border-color,box-shadow] duration-200 motion-reduce:transition-none',
        )}
        aria-live="polite"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h4 className="text-base font-medium text-foreground sm:text-lg">
              {selected.name}
            </h4>
            <p className="mt-2 max-w-3xl text-body-sm text-muted-foreground">
              {selected.description}
            </p>
          </div>
          <Badge variant="primary">{selected.category}</Badge>
        </div>

        <dl className="mt-5 rounded-lg border border-border bg-muted/40 px-4 dark:bg-muted/25">
          <PropertyRow label="Best Time">
            <span className="font-mono">{selected.bestTime}</span>
          </PropertyRow>
          <PropertyRow label="Average Time">
            <span className="font-mono">{selected.averageTime}</span>
          </PropertyRow>
          <PropertyRow label="Worst Time">
            <span className="font-mono">{selected.worstTime}</span>
          </PropertyRow>
          <PropertyRow label="Space">
            <span className="font-mono">{selected.space}</span>
          </PropertyRow>
          <PropertyRow label="Stable?">
            <BooleanText value={selected.stable} yes="Yes" no="No" />
          </PropertyRow>
          <PropertyRow label="In-place?">
            <BooleanText value={selected.inPlace} yes="Yes" no="No" />
          </PropertyRow>
          <PropertyRow label="Adaptive?">
            <BooleanText value={selected.adaptive} yes="Yes" no="No" />
          </PropertyRow>
        </dl>

        {selected.adaptiveNote ? (
          <p className="mt-3 text-body-sm text-muted-foreground">
            {selected.adaptiveNote}
          </p>
        ) : null}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-foreground">Main strengths</p>
            <ul className="mt-2 space-y-2">
              {selected.strengths.map((item) => (
                <li
                  key={item}
                  className="flex gap-2 text-body-sm text-muted-foreground"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1 shrink-0 rounded-full bg-primary"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Trade-offs</p>
            <ul className="mt-2 space-y-2">
              {selected.tradeoffs.map((item) => (
                <li
                  key={item}
                  className="flex gap-2 text-body-sm text-muted-foreground"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground/50"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-5 space-y-2 border-t border-border pt-5">
          <p className="text-sm font-medium text-foreground">
            Algorithmic auxiliary space
          </p>
          <p className="text-body-sm text-muted-foreground">
            {selected.spaceDetail}
          </p>
          <p className="text-sm font-medium text-foreground">
            Implementation overhead caused by copying the input
          </p>
          <p className="text-body-sm text-muted-foreground">
            {selected.implementationSpaceNote}
          </p>
        </div>

        <div className="mt-5">
          <Link
            to={selected.lessonHref}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-primary',
              'transition-theme hover:text-primary-hover',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            )}
          >
            Learn this algorithm →
          </Link>
        </div>
      </Card>
    </div>
  )
}
