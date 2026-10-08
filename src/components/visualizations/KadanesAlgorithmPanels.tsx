import {
  type KadanesPhase,
} from '../../algorithms/array-string/kadanesAlgorithmSteps'
import { getSubarray } from '../../algorithms/array-string/kadanesAlgorithm'
import { cn } from '../../lib/cn'
import type { VisualizationStep } from './types'

type KadanesAlgorithmPanelsProps = {
  original: readonly number[]
  step: VisualizationStep | undefined
  className?: string
}

function readNumber(
  meta: VisualizationStep['meta'],
  key: string,
  fallback: number,
): number {
  const value = meta?.[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function readBoolean(
  meta: VisualizationStep['meta'],
  key: string,
  fallback: boolean,
): boolean {
  const value = meta?.[key]
  return typeof value === 'boolean' ? value : fallback
}

function readPhase(meta: VisualizationStep['meta']): KadanesPhase | null {
  const value = meta?.phase
  return typeof value === 'string' ? (value as KadanesPhase) : null
}

function formatSlice(
  arr: readonly number[],
  start: number,
  end: number,
): string {
  const values = getSubarray(arr, start, end)
  if (values.length === 0) {
    return '[]'
  }
  return `[${values.join(', ')}]`
}

/**
 * Educational panels for Kadane's Algorithm:
 * array with current/best subarray markers, state readout, and decision view.
 */
export function KadanesAlgorithmPanels({
  original,
  step,
  className,
}: KadanesAlgorithmPanelsProps) {
  const meta = step?.meta
  const phase = readPhase(meta)
  const currentIndex = readNumber(meta, 'currentIndex', -1)
  const currentValue = readNumber(meta, 'currentValue', 0)
  const currentSum = readNumber(meta, 'currentSum', 0)
  const bestSum = readNumber(meta, 'bestSum', 0)
  const currentStart = readNumber(meta, 'currentStart', -1)
  const currentEnd = readNumber(meta, 'currentEnd', -1)
  const bestStart = readNumber(meta, 'bestStart', -1)
  const bestEnd = readNumber(meta, 'bestEnd', -1)
  const startNewCandidate = readNumber(meta, 'startNewCandidate', 0)
  const extendCandidate = readNumber(meta, 'extendCandidate', 0)
  const chosenCandidate = readNumber(meta, 'chosenCandidate', 0)
  const choseStartNew = readBoolean(meta, 'choseStartNew', false)
  const previousCurrentSum = readNumber(meta, 'previousCurrentSum', 0)
  const bestUpdated = readBoolean(meta, 'bestUpdated', false)

  const showDecision =
    phase === 'calculate-start-new' ||
    phase === 'calculate-extend' ||
    phase === 'choose' ||
    phase === 'update-current' ||
    phase === 'update-best'

  const emphasizeCurrentSum =
    phase === 'update-current' ||
    phase === 'choose' ||
    phase === 'update-best'
  const emphasizeBestSum =
    phase === 'update-best' || phase === 'complete' || bestUpdated

  return (
    <div className={cn('mb-4 space-y-3', className)}>
      <div
        className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-muted/20 sm:p-4"
        aria-label="Input array with current and best subarrays"
      >
        <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
          Array
        </p>
        {original.length === 0 ? (
          <p className="mt-2 text-body-sm text-muted-foreground">
            Empty array — nothing to scan.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto pb-1">
            <div
              className="grid w-max gap-2"
              style={{
                gridTemplateColumns: `repeat(${original.length}, minmax(2.75rem, 1fr))`,
              }}
            >
              {original.map((value, index) => {
                const inCurrent =
                  currentStart >= 0 &&
                  currentEnd >= 0 &&
                  index >= currentStart &&
                  index <= currentEnd
                const inBest =
                  bestStart >= 0 &&
                  bestEnd >= 0 &&
                  index >= bestStart &&
                  index <= bestEnd
                const isCurrentValue =
                  index === currentIndex && currentIndex >= 0

                return (
                  <div
                    key={`kadane-array-${index}`}
                    className="flex flex-col items-center gap-1"
                  >
                    <span className="font-mono text-[0.65rem] text-muted-foreground">
                      {index}
                    </span>
                    <span
                      className={cn(
                        'relative flex h-11 w-11 items-center justify-center rounded-md border font-mono text-sm font-medium',
                        'transition-[background-color,border-color,box-shadow,transform] duration-300 ease-out',
                        'motion-reduce:transition-none motion-reduce:transform-none',
                        isCurrentValue
                          ? 'border-primary bg-primary/15 text-foreground shadow-sm ring-2 ring-primary/30 scale-105 motion-reduce:scale-100'
                          : inBest
                            ? 'border-sky-600/50 bg-sky-500/10 text-foreground dark:border-sky-400/40 dark:bg-sky-400/10'
                            : inCurrent
                              ? 'border-dashed border-primary/50 bg-primary/5 text-foreground'
                              : 'border-border bg-surface text-foreground',
                      )}
                      title={
                        isCurrentValue
                          ? 'Current value'
                          : inBest
                            ? 'Best subarray'
                            : inCurrent
                              ? 'Current subarray'
                              : undefined
                      }
                    >
                      {value}
                    </span>
                    {isCurrentValue ? (
                      <span className="text-[0.6rem] font-medium text-primary">
                        current
                      </span>
                    ) : inBest && inCurrent ? (
                      <span className="text-[0.6rem] text-muted-foreground">
                        both
                      </span>
                    ) : inBest ? (
                      <span className="text-[0.6rem] text-sky-700 dark:text-sky-300">
                        best
                      </span>
                    ) : inCurrent ? (
                      <span className="text-[0.6rem] text-muted-foreground">
                        cur
                      </span>
                    ) : (
                      <span className="text-[0.6rem] opacity-0">·</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.7rem] text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block size-3 rounded-sm border-2 border-primary bg-primary/15"
            />
            Current value
          </li>
          <li className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block size-3 rounded-sm border border-dashed border-primary/50 bg-primary/5"
            />
            Current subarray
          </li>
          <li className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block size-3 rounded-sm border border-sky-600/50 bg-sky-500/10 dark:border-sky-400/40"
            />
            Best subarray
          </li>
        </ul>
      </div>

      <div
        className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-muted/20 sm:p-4"
        aria-label="Current Kadane state"
        aria-live="polite"
      >
        <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
          Current State
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div
            className={cn(
              'rounded-lg border px-3 py-2 transition-[border-color,background-color,box-shadow] duration-300 ease-out motion-reduce:transition-none',
              emphasizeCurrentSum
                ? 'border-primary/45 bg-primary/10 shadow-sm'
                : 'border-border bg-surface',
            )}
          >
            <p className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground">
              Current Sum
            </p>
            <p className="mt-1 font-mono text-xl font-semibold text-foreground">
              {original.length === 0 ? '—' : currentSum}
            </p>
            {currentIndex >= 0 ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Current value:{' '}
                <span className="font-mono text-foreground">{currentValue}</span>
              </p>
            ) : null}
          </div>

          <div
            className={cn(
              'rounded-lg border px-3 py-2 transition-[border-color,background-color,box-shadow] duration-300 ease-out motion-reduce:transition-none',
              emphasizeBestSum
                ? 'border-sky-600/45 bg-sky-500/10 shadow-sm dark:border-sky-400/40 dark:bg-sky-400/10'
                : 'border-border bg-surface',
            )}
          >
            <p className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground">
              Best Sum
            </p>
            <p className="mt-1 font-mono text-xl font-semibold text-foreground">
              {original.length === 0 ? '—' : bestSum}
            </p>
            {phase === 'update-best' ? (
              <p className="mt-1 text-xs text-sky-800 dark:text-sky-200">
                Best subarray updated
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-3 grid gap-2 text-body-sm sm:grid-cols-2">
          <p className="text-muted-foreground">
            Current Subarray:{' '}
            <span className="font-mono text-foreground">
              {formatSlice(original, currentStart, currentEnd)}
            </span>
            {currentStart >= 0 && currentEnd >= 0 ? (
              <span className="ml-1 text-xs">
                (i {currentStart}–{currentEnd})
              </span>
            ) : null}
          </p>
          <p className="text-muted-foreground">
            Best Subarray:{' '}
            <span className="font-mono text-foreground">
              {formatSlice(original, bestStart, bestEnd)}
            </span>
            {bestStart >= 0 && bestEnd >= 0 ? (
              <span className="ml-1 text-xs">
                (i {bestStart}–{bestEnd})
              </span>
            ) : null}
          </p>
        </div>
      </div>

      {showDecision && original.length > 0 ? (
        <div
          className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-muted/20 sm:p-4"
          aria-label="Extend or restart decision"
          aria-live="polite"
        >
          <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
            Decision
          </p>
          <p className="mt-2 text-body-sm text-muted-foreground">
            Previous current sum:{' '}
            <span className="font-mono text-foreground">
              {previousCurrentSum}
            </span>
            {' · '}
            Current value:{' '}
            <span className="font-mono text-foreground">{currentValue}</span>
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div
              className={cn(
                'rounded-lg border px-3 py-2 transition-[border-color,background-color] duration-300 ease-out motion-reduce:transition-none',
                phase === 'calculate-start-new' ||
                  (phase === 'choose' && choseStartNew) ||
                  (phase === 'update-current' && choseStartNew)
                  ? 'border-primary/45 bg-primary/10'
                  : 'border-border bg-surface',
              )}
            >
              <p className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground">
                Start new
              </p>
              <p className="mt-1 font-mono text-lg text-foreground">
                {startNewCandidate}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                just the value
              </p>
            </div>
            <div
              className={cn(
                'rounded-lg border px-3 py-2 transition-[border-color,background-color] duration-300 ease-out motion-reduce:transition-none',
                phase === 'calculate-extend' ||
                  (phase === 'choose' && !choseStartNew) ||
                  (phase === 'update-current' && !choseStartNew)
                  ? 'border-primary/45 bg-primary/10'
                  : 'border-border bg-surface',
              )}
            >
              <p className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground">
                Extend
              </p>
              <p className="mt-1 font-mono text-lg text-foreground">
                {extendCandidate}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {previousCurrentSum} + ({currentValue})
              </p>
            </div>
          </div>

          {(phase === 'choose' ||
            phase === 'update-current' ||
            phase === 'update-best') && (
            <p className="mt-3 text-body-sm text-foreground">
              Choose:{' '}
              <span className="font-mono font-semibold">{chosenCandidate}</span>
              {' — '}
              {choseStartNew ? 'start a new subarray here' : 'extend the current subarray'}
            </p>
          )}
        </div>
      ) : null}

      <p className="text-label text-[0.65rem] tracking-[0.08em] text-muted-foreground">
        Array walkthrough
      </p>
    </div>
  )
}
