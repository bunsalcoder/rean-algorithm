import {
  parseFrequencyEntries,
  type FrequencyCountingPhase,
} from '../../algorithms/array-string/frequencyCountingSteps'
import { cn } from '../../lib/cn'
import type { VisualizationStep } from './types'

type FrequencyCountingPanelsProps = {
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

function readPhase(meta: VisualizationStep['meta']): FrequencyCountingPhase | null {
  const value = meta?.phase
  return typeof value === 'string' ? (value as FrequencyCountingPhase) : null
}

function readSnapshot(meta: VisualizationStep['meta']): string {
  const value = meta?.frequencySnapshot
  return typeof value === 'string' ? value : '[]'
}

/**
 * Educational panels for Frequency Counting:
 * original array with current-element highlight, plus a live frequency map.
 */
export function FrequencyCountingPanels({
  original,
  step,
  className,
}: FrequencyCountingPanelsProps) {
  const meta = step?.meta
  const phase = readPhase(meta)
  const currentIndex = readNumber(meta, 'currentIndex', -1)
  const currentKey = readNumber(meta, 'currentKey', 0)
  const previousCount = readNumber(meta, 'previousCount', 0)
  const newCount = readNumber(meta, 'newCount', 0)
  const isNewKey = readBoolean(meta, 'isNewKey', false)
  const mostFrequentRaw = meta?.mostFrequent
  const mostFrequent =
    typeof mostFrequentRaw === 'number' ? mostFrequentRaw : null
  const entries = parseFrequencyEntries(readSnapshot(meta))

  const showAction =
    phase === 'create-key' ||
    phase === 'increment' ||
    phase === 'frequency-updated' ||
    phase === 'read-value'

  return (
    <div className={cn('mb-4 space-y-3', className)}>
      <div
        className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-muted/20 sm:p-4"
        aria-label="Input array"
      >
        <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
          Array
        </p>
        {original.length === 0 ? (
          <p className="mt-2 text-body-sm text-muted-foreground">
            Empty array — nothing to count.
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
                const isCurrent = index === currentIndex && currentIndex >= 0

                return (
                  <div
                    key={`freq-array-${index}`}
                    className="flex flex-col items-center gap-1"
                  >
                    <span className="font-mono text-[0.65rem] text-muted-foreground">
                      {index}
                    </span>
                    <span
                      className={cn(
                        'flex h-11 w-11 items-center justify-center rounded-md border font-mono text-sm font-medium',
                        'transition-[background-color,border-color,box-shadow,transform] duration-300 ease-out',
                        'motion-reduce:transition-none motion-reduce:transform-none',
                        isCurrent
                          ? 'border-primary bg-primary/15 text-foreground shadow-sm ring-2 ring-primary/30 scale-105 motion-reduce:scale-100'
                          : 'border-border bg-surface text-foreground',
                      )}
                    >
                      {value}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        {currentIndex >= 0 ? (
          <p className="mt-3 text-body-sm text-muted-foreground" aria-live="polite">
            Current:{' '}
            <span className="font-mono text-foreground">
              index {currentIndex}
            </span>
            {' · '}
            value{' '}
            <span className="font-mono text-foreground">{currentKey}</span>
          </p>
        ) : null}
      </div>

      <div
        className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-muted/20 sm:p-4"
        aria-label="Frequency map"
        aria-live="polite"
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
            Frequency Map
          </p>
          {showAction ? (
            <p className="font-mono text-xs text-muted-foreground">
              {phase === 'create-key'
                ? `new key ${currentKey}`
                : phase === 'increment'
                  ? `${currentKey}: ${previousCount} → ${newCount}`
                  : phase === 'frequency-updated'
                    ? `${currentKey} → ${newCount}`
                    : `read ${currentKey}`}
            </p>
          ) : null}
        </div>

        {entries.length === 0 ? (
          <p className="mt-3 text-body-sm text-muted-foreground">(empty)</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-[12rem] border-collapse text-left font-mono text-sm">
              <caption className="sr-only">
                Frequency map with value and count columns
              </caption>
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Value</th>
                  <th className="px-3 py-2 font-medium">Count</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const isFocus =
                    currentIndex >= 0 &&
                    entry.key === currentKey &&
                    (phase === 'create-key' ||
                      phase === 'increment' ||
                      phase === 'frequency-updated' ||
                      phase === 'read-value')
                  const isMostFrequent =
                    phase === 'complete' &&
                    mostFrequent !== null &&
                    entry.key === mostFrequent

                  return (
                    <tr
                      key={`freq-entry-${entry.key}`}
                      className={cn(
                        'border-b border-border/60 last:border-b-0',
                        'transition-[background-color] duration-300 ease-out motion-reduce:transition-none',
                        isFocus
                          ? 'bg-primary/12'
                          : isMostFrequent
                            ? 'bg-sky-500/10 dark:bg-sky-400/10'
                            : undefined,
                      )}
                    >
                      <td
                        className={cn(
                          'px-3 py-2 text-foreground',
                          isFocus && 'font-semibold',
                        )}
                      >
                        {entry.key}
                        {isFocus && isNewKey && phase === 'create-key' ? (
                          <span className="ml-2 text-[0.65rem] font-sans font-normal text-primary">
                            new
                          </span>
                        ) : null}
                        {isMostFrequent ? (
                          <span className="ml-2 text-[0.65rem] font-sans font-normal text-sky-700 dark:text-sky-300">
                            most frequent
                          </span>
                        ) : null}
                      </td>
                      <td
                        className={cn(
                          'px-3 py-2 text-foreground',
                          'transition-transform duration-300 ease-out motion-reduce:transition-none',
                          isFocus &&
                            (phase === 'increment' ||
                              phase === 'frequency-updated')
                            ? 'font-semibold scale-110 origin-left motion-reduce:scale-100'
                            : undefined,
                        )}
                      >
                        {entry.count}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {phase === 'complete' && mostFrequent !== null ? (
          <p className="mt-3 text-body-sm text-muted-foreground">
            Most frequent value:{' '}
            <span className="font-mono font-medium text-foreground">
              {mostFrequent}
            </span>
          </p>
        ) : null}
      </div>

      <p className="text-label text-[0.65rem] tracking-[0.08em] text-muted-foreground">
        Array walkthrough
      </p>
    </div>
  )
}
