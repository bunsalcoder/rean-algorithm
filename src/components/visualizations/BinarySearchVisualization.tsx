import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  BINARY_SEARCH_ARRAY,
  buildBinarySearchFrames,
  type BinarySearchFrame,
} from '../../lib/binarySearch'
import { cn } from '../../lib/cn'
import { Button } from '../ui'

const PLAY_INTERVAL_MS = 1400
const DEFAULT_TARGET = 23

type CellState = 'normal' | 'range' | 'eliminated' | 'mid' | 'found'

function getCellState(
  index: number,
  frame: BinarySearchFrame,
): CellState {
  if (frame.outcome === 'found' && frame.foundIndex === index) {
    return 'found'
  }

  if (frame.mid === index && frame.outcome !== 'not-found') {
    return 'mid'
  }

  if (frame.outcome === 'not-found' || frame.low > frame.high) {
    return 'eliminated'
  }

  if (index < frame.low || index > frame.high) {
    return 'eliminated'
  }

  return 'range'
}

const cellStateClasses: Record<CellState, string> = {
  normal: 'border-border bg-muted text-foreground',
  range:
    'border-primary/40 bg-primary-muted text-accent-foreground ring-1 ring-primary/20',
  eliminated: 'border-border/60 bg-muted/40 text-muted-foreground opacity-45',
  mid: 'border-primary bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/30',
  found:
    'border-emerald-500 bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-500/35 dark:border-emerald-400 dark:bg-emerald-400 dark:text-emerald-950',
}

const cellStateLabels: Partial<Record<CellState, string>> = {
  mid: 'mid',
  found: 'found',
}

function ControlIcon({
  name,
  className,
}: {
  name: 'reset' | 'prev' | 'next' | 'play' | 'pause'
  className?: string
}) {
  const paths: Record<typeof name, string> = {
    reset:
      'M3.5 12a8.5 8.5 0 1 0 2.1-5.6M3.5 4.5v4h4',
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

function PointerLabel({
  label,
  active,
}: {
  label: string
  active: boolean
}) {
  if (!active) {
    return <span className="h-4" aria-hidden="true" />
  }

  return (
    <span className="flex flex-col items-center text-[0.6rem] font-medium uppercase tracking-wide text-primary">
      <span aria-hidden="true">↓</span>
      <span>{label}</span>
    </span>
  )
}

export function BinarySearchVisualization() {
  const array = BINARY_SEARCH_ARRAY
  const [targetInput, setTargetInput] = useState(String(DEFAULT_TARGET))
  const [target, setTarget] = useState(DEFAULT_TARGET)
  const [inputError, setInputError] = useState<string | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const frames = useMemo(
    () => buildBinarySearchFrames(array, target),
    [array, target],
  )

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

  function applyTarget(rawValue: string) {
    const trimmed = rawValue.trim()

    if (trimmed === '') {
      setInputError('Enter a whole number to search for.')
      return
    }

    const parsed = Number(trimmed)

    if (!Number.isInteger(parsed)) {
      setInputError('Please enter a valid whole number.')
      return
    }

    setInputError(null)
    setTarget(parsed)
    setStepIndex(0)
    setIsPlaying(false)
  }

  function handleSearch(event: FormEvent) {
    event.preventDefault()
    applyTarget(targetInput)
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

  return (
    <div className="space-y-5">
      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-4 sm:flex-row sm:items-end dark:bg-muted/20"
      >
        <label className="min-w-0 flex-1">
          <span className="text-label text-[0.65rem] tracking-[0.08em]">
            Target
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={targetInput}
            onChange={(event) => {
              setTargetInput(event.target.value)
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
            placeholder="e.g. 23"
            aria-invalid={inputError ? true : undefined}
            aria-describedby={inputError ? 'binary-search-target-error' : undefined}
          />
        </label>
        <Button type="submit" className="w-full sm:w-auto">
          Search
        </Button>
      </form>

      {inputError ? (
        <p
          id="binary-search-target-error"
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

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            key: 'low',
            label: 'low',
            value: frame.low,
            meaning: 'beginning of current search range',
          },
          {
            key: 'mid',
            label: 'mid',
            value: frame.mid,
            meaning: 'middle of current search range',
          },
          {
            key: 'high',
            label: 'high',
            value: frame.high,
            meaning: 'end of current search range',
          },
        ].map((pointer) => (
          <div
            key={pointer.key}
            className={cn(
              'rounded-lg border border-border bg-surface px-3 py-3 transition-theme',
              pointer.key === 'mid' && 'border-primary/30 bg-primary-muted/40',
            )}
          >
            <p className="text-label text-[0.65rem] tracking-[0.08em]">
              {pointer.label}
            </p>
            <p className="mt-1 font-mono text-lg font-medium text-foreground">
              {pointer.value === null ? '—' : pointer.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {pointer.meaning}
            </p>
          </div>
        ))}
      </div>

      <div
        className={cn(
          'overflow-x-auto rounded-xl border border-border bg-surface p-4 sm:p-5',
          'transition-theme',
        )}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-label text-[0.65rem] tracking-[0.08em]">
            Sorted array
          </p>
          <p className="text-xs text-muted-foreground">
            Step {stepIndex + 1} of {frames.length}
          </p>
        </div>

        <div className="mx-auto flex w-max min-w-full justify-center gap-1.5 sm:gap-2">
          {array.map((value, index) => {
            const state = getCellState(index, frame)
            const pointerTags: string[] = []

            if (
              frame.outcome !== 'not-found' &&
              index === frame.low &&
              frame.low <= frame.high
            ) {
              pointerTags.push('low')
            }
            if (
              frame.mid !== null &&
              index === frame.mid &&
              frame.outcome !== 'not-found'
            ) {
              pointerTags.push('mid')
            }
            if (
              frame.outcome !== 'not-found' &&
              index === frame.high &&
              frame.low <= frame.high
            ) {
              pointerTags.push('high')
            }

            const topLabel = pointerTags[0]
            const extraLabels = pointerTags.slice(1)
            const stateLabel = cellStateLabels[state]

            return (
              <div
                key={`${value}-${index}`}
                className="flex w-10 flex-col items-center gap-1 sm:w-12"
              >
                <div className="flex h-8 items-end justify-center">
                  {topLabel ? (
                    <PointerLabel label={topLabel} active />
                  ) : (
                    <span className="h-8" aria-hidden="true" />
                  )}
                </div>

                <div
                  className={cn(
                    'flex size-10 items-center justify-center rounded-md border font-mono text-sm font-medium sm:size-12 sm:text-base',
                    'transition-theme',
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
                        state === 'found'
                          ? 'text-emerald-600 dark:text-emerald-300'
                          : 'text-primary',
                      )}
                    >
                      {stateLabel}
                    </span>
                  ) : null}
                  {extraLabels.map((tag) => (
                    <span
                      key={tag}
                      className="text-[0.6rem] font-medium uppercase tracking-wide text-primary"
                    >
                      {tag}
                    </span>
                  ))}
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
            <span className="size-2.5 rounded-sm border border-primary/40 bg-primary-muted" />
            Searching range
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm border border-primary bg-primary" />
            Mid
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm border border-emerald-500 bg-emerald-500" />
            Found
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm border border-border bg-muted/40 opacity-60" />
            Eliminated
          </span>
        </div>
      </div>

      <div
        className={cn(
          'rounded-xl border border-border bg-surface p-4 sm:p-5',
          frame.outcome === 'found' &&
            'border-emerald-500/35 bg-emerald-500/5 dark:bg-emerald-400/10',
          frame.outcome === 'not-found' &&
            'border-amber-500/35 bg-amber-500/5 dark:bg-amber-400/10',
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
        {frame.outcome === 'found' && frame.foundIndex !== null ? (
          <p className="mt-3 font-mono text-sm text-emerald-700 dark:text-emerald-300">
            Index: {frame.foundIndex}
          </p>
        ) : null}
      </div>
    </div>
  )
}
