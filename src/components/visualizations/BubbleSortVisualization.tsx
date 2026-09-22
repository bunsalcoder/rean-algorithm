import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  BUBBLE_SORT_DEFAULT_ARRAY,
  buildBubbleSortFrames,
  generateRandomArray,
  parseNumberArray,
  type BubbleSortFrame,
} from '../../lib/bubbleSort'
import { cn } from '../../lib/cn'
import { Button } from '../ui'

const PLAY_INTERVAL_MS = 1200

type CellState = 'normal' | 'comparing' | 'swapping' | 'sorted' | 'completed'

function getCellState(index: number, frame: BubbleSortFrame): CellState {
  if (frame.phase === 'done') {
    return 'completed'
  }

  if (frame.swapping && (index === frame.swapping[0] || index === frame.swapping[1])) {
    return 'swapping'
  }

  if (
    frame.comparing &&
    (index === frame.comparing[0] || index === frame.comparing[1])
  ) {
    return 'comparing'
  }

  const sortedStart = frame.array.length - frame.sortedCount
  if (frame.sortedCount > 0 && index >= sortedStart) {
    return 'sorted'
  }

  return 'normal'
}

const cellStateClasses: Record<CellState, string> = {
  normal: 'border-border bg-muted text-foreground',
  comparing:
    'border-amber-500 bg-amber-500/15 text-foreground shadow-sm ring-2 ring-amber-500/30 dark:border-amber-400 dark:bg-amber-400/15',
  swapping:
    'border-rose-500 bg-rose-500/15 text-foreground shadow-sm ring-2 ring-rose-500/30 dark:border-rose-400 dark:bg-rose-400/15 -translate-y-1',
  sorted:
    'border-emerald-500/50 bg-emerald-500/10 text-foreground ring-1 ring-emerald-500/20 dark:border-emerald-400/50 dark:bg-emerald-400/10',
  completed:
    'border-emerald-500 bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-500/35 dark:border-emerald-400 dark:bg-emerald-400 dark:text-emerald-950',
}

const cellStateLabels: Partial<Record<CellState, string>> = {
  comparing: 'compare',
  swapping: 'swap',
  sorted: 'sorted',
  completed: 'done',
}

function ControlIcon({
  name,
  className,
}: {
  name: 'reset' | 'prev' | 'next' | 'play' | 'pause'
  className?: string
}) {
  const paths: Record<typeof name, string> = {
    reset: 'M3.5 12a8.5 8.5 0 1 0 2.1-5.6M3.5 4.5v4h4',
    prev: 'M14.5 6.5 9 12l5.5 5.5M8 6.5v11',
    next: 'M9.5 6.5 15 12l-5.5 5.5M16 6.5v11',
    play: 'M8 5.5v13l11-6.5-11-6.5Z',
    pause: 'M8 5.5h3.5v13H8zm6.5 0H18v13h-3.5z',
  }

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
      <path d={paths[name]} />
    </svg>
  )
}

function formatList(values: readonly number[]): string {
  return `[${values.join(', ')}]`
}

export function BubbleSortVisualization() {
  const [arrayInput, setArrayInput] = useState(
    formatList(BUBBLE_SORT_DEFAULT_ARRAY),
  )
  const [array, setArray] = useState<number[]>([...BUBBLE_SORT_DEFAULT_ARRAY])
  const [inputError, setInputError] = useState<string | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const frames = useMemo(() => buildBubbleSortFrames(array), [array])
  const frame = frames[Math.min(stepIndex, frames.length - 1)]
  const isFirst = stepIndex <= 0
  const isLast = stepIndex >= frames.length - 1
  const isActivelyPlaying = isPlaying && !isLast

  useEffect(() => {
    if (!isActivelyPlaying) {
      return
    }

    const timer = window.setTimeout(() => {
      setStepIndex((current) => Math.min(current + 1, frames.length - 1))
    }, PLAY_INTERVAL_MS)

    return () => window.clearTimeout(timer)
  }, [isActivelyPlaying, stepIndex, frames.length])

  function applyArray(rawValue: string) {
    const parsed = parseNumberArray(rawValue)

    if (!parsed) {
      setInputError(
        'Enter whole numbers separated by commas, e.g. 5, 3, 8, 4, 2',
      )
      return
    }

    if (parsed.length > 10) {
      setInputError('Keep the array at 10 numbers or fewer so steps stay readable.')
      return
    }

    if (parsed.length === 0) {
      setInputError('Enter at least one number.')
      return
    }

    setInputError(null)
    setArray(parsed)
    setArrayInput(formatList(parsed))
    setStepIndex(0)
    setIsPlaying(false)
  }

  function handleApply(event: FormEvent) {
    event.preventDefault()
    applyArray(arrayInput)
  }

  function handleRandom() {
    const next = generateRandomArray()
    setInputError(null)
    setArray(next)
    setArrayInput(formatList(next))
    setStepIndex(0)
    setIsPlaying(false)
  }

  function handleReset() {
    setStepIndex(0)
    setIsPlaying(false)
  }

  function handlePrevious() {
    setIsPlaying(false)
    setStepIndex((current) => Math.max(0, current - 1))
  }

  function handleNext() {
    setIsPlaying(false)
    setStepIndex((current) => Math.min(frames.length - 1, current + 1))
  }

  function handlePlayPause() {
    if (isActivelyPlaying) {
      setIsPlaying(false)
      return
    }

    if (isLast) {
      setStepIndex(0)
    }

    setIsPlaying(true)
  }

  const compareLeft = frame.compareValues?.[0] ?? null
  const compareRight = frame.compareValues?.[1] ?? null

  return (
    <div className="space-y-5">
      <form
        onSubmit={handleApply}
        className="flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20"
      >
        <label className="min-w-0">
          <span className="text-label text-[0.65rem] tracking-[0.08em]">
            Array
          </span>
          <input
            type="text"
            value={arrayInput}
            onChange={(event) => {
              setArrayInput(event.target.value)
              if (inputError) {
                setInputError(null)
              }
            }}
            className={cn(
              'mt-1.5 h-10 w-full rounded-md border border-border bg-surface px-3',
              'font-mono text-sm text-foreground shadow-sm transition-theme',
              'placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
            placeholder="e.g. 5, 3, 8, 4, 2"
            aria-invalid={inputError ? true : undefined}
            aria-describedby={
              inputError ? 'bubble-sort-array-error' : undefined
            }
          />
        </label>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button type="submit" className="w-full sm:w-auto">
            Apply Array
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={handleRandom}
          >
            Generate Random Array
          </Button>
        </div>
      </form>

      {inputError ? (
        <p
          id="bubble-sort-array-error"
          className="text-sm text-rose-600 dark:text-rose-300"
          role="alert"
        >
          {inputError}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleReset}
          aria-label="Reset visualization"
        >
          <ControlIcon name="reset" className="size-4" />
          Reset
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handlePrevious}
          disabled={isFirst}
          aria-label="Previous step"
        >
          <ControlIcon name="prev" className="size-4" />
          Previous
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleNext}
          disabled={isLast}
          aria-label="Next step"
        >
          <ControlIcon name="next" className="size-4" />
          Next
        </Button>
        <Button
          type="button"
          variant={isActivelyPlaying ? 'outline' : 'primary'}
          size="sm"
          onClick={handlePlayPause}
          aria-label={
            isActivelyPlaying ? 'Pause' : isLast ? 'Replay' : 'Play'
          }
        >
          <ControlIcon
            name={isActivelyPlaying ? 'pause' : 'play'}
            className="size-4"
          />
          {isActivelyPlaying ? 'Pause' : isLast ? 'Replay' : 'Play'}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            key: 'pass',
            label: 'Pass',
            value:
              frame.totalPasses === 0
                ? '—'
                : `${frame.pass} / ${frame.totalPasses}`,
          },
          {
            key: 'comparison',
            label: 'Comparison',
            value:
              frame.comparisonInPass > 0
                ? `${frame.comparisonInPass} / ${frame.comparisonsInPassTotal}`
                : '—',
          },
          {
            key: 'swaps',
            label: 'Swaps',
            value: String(frame.totalSwaps),
          },
          {
            key: 'comparisons',
            label: 'Comparisons',
            value: String(frame.totalComparisons),
          },
        ].map((stat) => (
          <div
            key={stat.key}
            className="rounded-lg border border-border bg-surface px-3 py-3 transition-theme"
          >
            <p className="text-label text-[0.65rem] tracking-[0.08em]">
              {stat.label}
            </p>
            <p className="mt-1 font-mono text-lg font-medium text-foreground">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {frame.comparing && compareLeft !== null && compareRight !== null ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 dark:bg-amber-400/10">
          <p className="text-label text-[0.65rem] tracking-[0.08em] text-amber-800 dark:text-amber-200">
            Comparing
          </p>
          <p className="mt-1 font-mono text-base font-medium text-foreground">
            {compareLeft} and {compareRight}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {frame.phase === 'swap'
              ? `${compareLeft} > ${compareRight} · swap them`
              : frame.phase === 'no-swap'
                ? `${compareLeft} ≤ ${compareRight} · already in order`
                : 'Check whether they are in the wrong order'}
          </p>
        </div>
      ) : null}

      <div
        className={cn(
          'overflow-x-auto rounded-xl border border-border bg-surface p-4 sm:p-5',
          'transition-theme',
        )}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-label text-[0.65rem] tracking-[0.08em]">
            {frame.totalPasses > 0
              ? `Pass ${frame.pass} of ${frame.totalPasses}`
              : 'Array'}
          </p>
          <p className="text-xs text-muted-foreground">
            Step {stepIndex + 1} of {frames.length}
          </p>
        </div>

        <div className="mx-auto flex w-max min-w-full justify-center gap-1.5 sm:gap-2">
          {frame.array.map((value, index) => {
            const state = getCellState(index, frame)
            const stateLabel = cellStateLabels[state]
            const isComparePointer =
              frame.comparing !== null &&
              (index === frame.comparing[0] || index === frame.comparing[1])

            return (
              <div
                key={`${index}-${value}-${frame.phase}`}
                className="flex w-10 flex-col items-center gap-1 sm:w-12"
              >
                <div className="flex h-7 items-end justify-center">
                  {isComparePointer ? (
                    <span className="text-[0.65rem] font-medium text-amber-700 dark:text-amber-300">
                      ↑
                    </span>
                  ) : (
                    <span className="h-4" aria-hidden="true" />
                  )}
                </div>

                <div
                  className={cn(
                    'flex size-10 items-center justify-center rounded-md border font-mono text-sm font-medium sm:size-12 sm:text-base',
                    'transition-all duration-300',
                    cellStateClasses[state],
                  )}
                  aria-label={`Index ${index}, value ${value}, state ${state}`}
                >
                  {value}
                </div>

                <div className="flex min-h-8 flex-col items-center justify-start gap-0.5">
                  {stateLabel ? (
                    <span
                      className={cn(
                        'text-[0.6rem] font-medium uppercase tracking-wide',
                        state === 'comparing' &&
                          'text-amber-700 dark:text-amber-300',
                        state === 'swapping' &&
                          'text-rose-700 dark:text-rose-300',
                        (state === 'sorted' || state === 'completed') &&
                          'text-emerald-700 dark:text-emerald-300',
                      )}
                    >
                      {stateLabel}
                    </span>
                  ) : null}
                  <span className="text-[0.6rem] text-muted-foreground">
                    {index}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm border border-border bg-muted" />
            Normal
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm border border-amber-500 bg-amber-500/20" />
            Comparing
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm border border-rose-500 bg-rose-500/20" />
            Swapping
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm border border-emerald-500 bg-emerald-500/20" />
            Sorted
          </span>
        </div>
      </div>

      <div
        className={cn(
          'rounded-xl border border-border bg-surface p-4 sm:p-5',
          frame.phase === 'done' &&
            'border-emerald-500/35 bg-emerald-500/5 dark:bg-emerald-400/10',
          frame.phase === 'swap' &&
            'border-rose-500/30 bg-rose-500/5 dark:bg-rose-400/10',
          frame.phase === 'pass-complete' &&
            'border-primary/30 bg-primary-muted/30',
        )}
        aria-live="polite"
      >
        <p className="text-label text-[0.65rem] tracking-[0.08em]">
          Current state
        </p>
        <p className="mt-1 text-base font-medium text-foreground">
          {frame.summary}
        </p>
        <p className="mt-3 whitespace-pre-line text-body-sm text-muted-foreground">
          {frame.explanation}
        </p>

        {frame.phase === 'done' ? (
          <div className="mt-4 space-y-1 font-mono text-sm text-emerald-700 dark:text-emerald-300">
            <p>Original: {formatList(frame.originalArray)}</p>
            <p>Sorted: {formatList(frame.array)}</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
