import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  arrayStringComplexityClassRank,
  getImplementedArrayStringComparisons,
  type ArrayStringAlgorithmComparison,
  type ArrayStringComplexityClass,
} from '../../data/algorithms/array-string-comparison'
import { cn } from '../../lib/cn'
import { Badge, Card } from '../ui'

const SCALE: ArrayStringComplexityClass[] = [
  'O(1)',
  'O(n)',
  'O(n × m log m)',
]

type ArrayStringComplexityExplorerProps = {
  algorithms?: ArrayStringAlgorithmComparison[]
  defaultSlug?: string
  className?: string
}

export function ArrayStringComplexityExplorer({
  algorithms = getImplementedArrayStringComparisons(),
  defaultSlug = 'two-pointers',
  className,
}: ArrayStringComplexityExplorerProps) {
  const selectId = useId()
  const headingId = useId()
  const descriptionId = useId()
  const noteId = useId()

  const [selectedSlug, setSelectedSlug] = useState(() => {
    if (algorithms.some((algorithm) => algorithm.slug === defaultSlug)) {
      return defaultSlug
    }
    return algorithms[0]?.slug ?? defaultSlug
  })

  const selected =
    algorithms.find((algorithm) => algorithm.slug === selectedSlug) ??
    algorithms[0]

  if (!selected) {
    return null
  }

  const rank = arrayStringComplexityClassRank[selected.timeClass]
  const maxRank = arrayStringComplexityClassRank['O(n × m log m)']
  const widthPercent = Math.round((rank / maxRank) * 100)

  return (
    <Card className={cn('p-5 sm:p-6 hover:border-primary/25', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-label text-primary">COMPLEXITY EXPLORER</p>
          <h3
            id={headingId}
            className="mt-2 text-lg font-medium text-foreground sm:text-xl"
          >
            Inspect Time &amp; Space
          </h3>
          <p
            id={descriptionId}
            className="mt-2 max-w-2xl text-body-sm text-muted-foreground"
          >
            Select an implemented pattern to review its documented complexity,
            assumptions, and trade-offs. The bar shows a conceptual growth
            class — not measured milliseconds.
          </p>
        </div>

        <Badge variant="muted" className="shrink-0 self-start">
          Conceptual only
        </Badge>
      </div>

      <label
        htmlFor={selectId}
        className="mt-5 flex w-full max-w-md flex-col gap-1.5 text-body-sm text-muted-foreground"
      >
        <span className="font-medium text-foreground">Algorithm</span>
        <select
          id={selectId}
          value={selected.slug}
          aria-labelledby={headingId}
          aria-describedby={`${descriptionId} ${noteId}`}
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

      <div className="mt-5 space-y-4" aria-live="polite">
        <div>
          <h4 className="text-base font-medium text-foreground sm:text-lg">
            {selected.name}
          </h4>
          <p className="mt-1 text-body-sm text-muted-foreground">
            {selected.problem}
          </p>
        </div>

        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 dark:bg-muted/25">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Time
            </dt>
            <dd className="mt-1 font-mono text-sm font-medium text-foreground">
              {selected.timeComplexity}
            </dd>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 dark:bg-muted/25">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Auxiliary space
            </dt>
            <dd className="mt-1 font-mono text-sm font-medium text-foreground">
              {selected.spaceComplexity}
            </dd>
          </div>
        </dl>

        <div>
          <p className="text-sm font-medium text-foreground">
            Conceptual growth class
          </p>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-3">
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
            <p className="font-mono text-sm font-medium text-accent-foreground sm:min-w-[8rem] sm:text-right">
              {selected.timeClass}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-foreground">Assumptions</p>
            <p className="mt-1.5 text-body-sm text-muted-foreground">
              {selected.assumptions}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Trade-offs</p>
            <p className="mt-1.5 text-body-sm text-muted-foreground">
              {selected.tradeoffs}
            </p>
          </div>
        </div>

        <p
          id={noteId}
          className="rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-body-sm text-muted-foreground dark:bg-muted/25"
        >
          Requirement: {selected.requirement}
        </p>

        <Link
          to={selected.lessonHref}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-primary',
            'transition-theme hover:text-primary-hover',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          )}
        >
          Open lesson →
        </Link>
      </div>

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
