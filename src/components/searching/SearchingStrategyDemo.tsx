import { useId, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { buildExponentialSearchSteps } from '../../algorithms/searching/exponentialSearch'
import { buildInterpolationSearchSteps } from '../../algorithms/searching/interpolationSearch'
import { buildJumpSearchSteps } from '../../algorithms/searching/jumpSearch'
import {
  SEARCHING_COMPARISON_DEMO_ARRAY,
  SEARCHING_COMPARISON_DEMO_TARGET,
  getSearchingComparisonBySlug,
  searchingComparisonAlgorithms,
} from '../../data/algorithms/searching-comparison'
import { buildBinarySearchSteps } from '../../lib/binarySearch'
import { cn } from '../../lib/cn'
import { buildLinearSearchSteps } from '../../lib/linearSearch'
import { Badge, Card } from '../ui'
import { AlgorithmVisualizer } from '../visualizations'
import type { VisualizationStep } from '../visualizations/types'

const DEMO_ARRAY = SEARCHING_COMPARISON_DEMO_ARRAY
const DEMO_TARGET = SEARCHING_COMPARISON_DEMO_TARGET

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

function buildStepsForSlug(
  slug: string,
  array: readonly number[],
  target: number,
): VisualizationStep[] {
  switch (slug) {
    case 'linear-search':
      return buildLinearSearchSteps(array, target)
    case 'binary-search':
      return buildBinarySearchSteps(array, target)
    case 'jump-search':
      return buildJumpSearchSteps(array, target)
    case 'interpolation-search':
      return buildInterpolationSearchSteps(array, target)
    case 'exponential-search':
      return buildExponentialSearchSteps(array, target)
    default:
      return []
  }
}

type SearchingStrategyDemoProps = {
  defaultSlug?: string
  className?: string
}

export function SearchingStrategyDemo({
  defaultSlug = 'binary-search',
  className,
}: SearchingStrategyDemoProps) {
  const selectId = useId()
  const [selectedSlug, setSelectedSlug] = useState(defaultSlug)
  const selected =
    getSearchingComparisonBySlug(selectedSlug) ??
    searchingComparisonAlgorithms[0]

  const steps = useMemo(
    () =>
      selected
        ? buildStepsForSlug(selected.slug, DEMO_ARRAY, DEMO_TARGET)
        : [],
    [selected],
  )

  if (!selected) return null

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-label text-primary">INTERACTIVE</p>
          <h3 className="mt-2 text-lg font-medium text-foreground sm:text-xl">
            See How They Search
          </h3>
          <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground">
            Select an algorithm to watch how it searches the same sorted array
            for the same target. Steps come from the real algorithm generators —
            not hard-coded fake results.
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
            {searchingComparisonAlgorithms.map((algorithm) => (
              <option key={algorithm.slug} value={algorithm.slug}>
                {algorithm.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20"
        aria-live="polite"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p className="text-body-sm text-muted-foreground">
            Array:{' '}
            <span className="font-mono text-foreground">
              [{DEMO_ARRAY.join(', ')}]
            </span>
          </p>
          <p className="font-mono text-sm font-medium text-accent-foreground">
            Target: {DEMO_TARGET}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          <AlgorithmVisualizer
            key={`search-comparison-${selected.slug}`}
            title={`${selected.name} demo`}
            category="Searching"
            array={DEMO_ARRAY}
            steps={steps}
            showFullscreen={false}
          />
        </div>

        <Card
          className="p-4 sm:p-5 hover:border-primary/25"
          aria-live="polite"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h4 className="text-base font-medium text-foreground">
              {selected.name}
            </h4>
            <Badge variant="primary" className="text-[0.65rem]">
              {selected.category}
            </Badge>
          </div>

          <p className="mt-3 text-body-sm text-muted-foreground">
            {selected.strategy}
          </p>

          <dl className="mt-4 rounded-lg border border-border bg-muted/40 px-3 dark:bg-muted/25">
            <PropertyRow label="Strategy">
              {selected.strategyLabel}
            </PropertyRow>
            <PropertyRow label="Best">
              <span className="font-mono">{selected.best}</span>
            </PropertyRow>
            <PropertyRow label="Average">
              <span className="font-mono">{selected.average}</span>
            </PropertyRow>
            <PropertyRow label="Worst">
              <span className="font-mono">{selected.worst}</span>
            </PropertyRow>
            <PropertyRow label="Space">
              <span className="font-mono">{selected.space}</span>
            </PropertyRow>
            <PropertyRow label="Sorted required">
              {selected.sortedRequired ? 'Yes' : 'No'}
            </PropertyRow>
            <PropertyRow label="Numeric data">
              {selected.numericRequired ? 'Yes' : 'No'}
            </PropertyRow>
          </dl>

          {selected.averageNote ? (
            <p className="mt-3 text-body-sm text-muted-foreground">
              {selected.averageNote}
            </p>
          ) : null}

          {selected.spaceNote ? (
            <p className="mt-2 text-body-sm text-muted-foreground">
              {selected.spaceNote}
            </p>
          ) : null}

          <div className="mt-5 grid gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Strengths</p>
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
              <p className="text-sm font-medium text-foreground">Limitations</p>
              <ul className="mt-2 space-y-2">
                {selected.limitations.map((item) => (
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
    </div>
  )
}
