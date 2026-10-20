import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  arrayStringProblemOptions,
  getArrayStringComparisonBySlug,
  type ArrayStringProblemOption,
} from '../../data/algorithms/array-string-comparison'
import { cn } from '../../lib/cn'
import { Badge, Card } from '../ui'

type ArrayStringPatternSelectorProps = {
  options?: ArrayStringProblemOption[]
  defaultOptionId?: string
  className?: string
}

export function ArrayStringPatternSelector({
  options = arrayStringProblemOptions,
  defaultOptionId = 'sorted-pair-sum',
  className,
}: ArrayStringPatternSelectorProps) {
  const selectId = useId()
  const headingId = useId()

  const [selectedId, setSelectedId] = useState(() => {
    if (options.some((option) => option.id === defaultOptionId)) {
      return defaultOptionId
    }
    return options[0]?.id ?? defaultOptionId
  })

  const selected =
    options.find((option) => option.id === selectedId) ?? options[0]

  if (!selected) {
    return null
  }

  const primary = getArrayStringComparisonBySlug(selected.primarySlug)
  const alternatives = selected.alternativeSlugs
    .map((slug) => getArrayStringComparisonBySlug(slug))
    .filter((algorithm): algorithm is NonNullable<typeof algorithm> =>
      Boolean(algorithm),
    )

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-label text-primary">PROBLEM → PATTERN</p>
          <h3
            id={headingId}
            className="mt-2 text-lg font-medium text-foreground sm:text-xl"
          >
            Interactive Pattern Selector
          </h3>
          <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground">
            Choose a problem type to see a recommended implemented lesson, why
            it fits, and any sensible alternatives.
          </p>
        </div>

        <label
          htmlFor={selectId}
          className="flex w-full flex-col gap-1.5 text-body-sm text-muted-foreground sm:w-80"
        >
          <span className="font-medium text-foreground">Problem type</span>
          <select
            id={selectId}
            value={selected.id}
            aria-labelledby={headingId}
            onChange={(event) => setSelectedId(event.target.value)}
            className={cn(
              'h-10 w-full rounded-md border border-border bg-surface px-3',
              'text-sm text-foreground shadow-sm transition-theme',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
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
        {!primary ? (
          <p className="text-body-sm text-muted-foreground">
            No implemented lesson is available for this selection yet.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Recommended lesson
                </p>
                <h4 className="mt-1 text-base font-medium text-foreground sm:text-lg">
                  {primary.name}
                </h4>
              </div>
              <Badge variant="primary" className="font-mono text-[0.7rem]">
                {primary.timeComplexity}
              </Badge>
            </div>

            <dl className="mt-5 space-y-3">
              <div>
                <dt className="text-sm font-medium text-foreground">
                  Why this pattern fits
                </dt>
                <dd className="mt-1 text-body-sm text-muted-foreground">
                  {selected.whyFits}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-foreground">
                  Key prerequisite
                </dt>
                <dd className="mt-1 text-body-sm text-muted-foreground">
                  {selected.keyPrerequisite}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-foreground">
                  Time complexity (stated assumptions)
                </dt>
                <dd className="mt-1 font-mono text-sm text-foreground">
                  {primary.timeComplexity}
                </dd>
                {primary.timeNote ? (
                  <dd className="mt-1 text-body-sm text-muted-foreground">
                    {primary.timeNote}
                  </dd>
                ) : null}
              </div>
            </dl>

            <div className="mt-5">
              <Link
                to={primary.lessonHref}
                className={cn(
                  'inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium',
                  'bg-primary text-primary-foreground shadow-sm transition-theme hover:bg-primary-hover',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                )}
              >
                Open {primary.name} →
              </Link>
            </div>

            {alternatives.length > 0 ? (
              <div className="mt-6 border-t border-border pt-5">
                <p className="text-sm font-medium text-foreground">
                  Related alternatives
                </p>
                <p className="mt-1 text-body-sm text-muted-foreground">
                  More than one approach can be reasonable depending on
                  constraints.
                </p>
                <ul className="mt-3 space-y-2">
                  {alternatives.map((algorithm) => (
                    <li key={algorithm.slug}>
                      <Link
                        to={algorithm.lessonHref}
                        className={cn(
                          'flex flex-col gap-1 rounded-lg border border-border bg-muted/40 px-3 py-2.5 dark:bg-muted/25',
                          'transition-theme hover:border-primary/30',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        )}
                      >
                        <span className="text-sm font-medium text-foreground">
                          {algorithm.name}
                        </span>
                        <span className="text-body-sm text-muted-foreground">
                          {algorithm.technique} · {algorithm.timeComplexity}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        )}
      </Card>
    </div>
  )
}
