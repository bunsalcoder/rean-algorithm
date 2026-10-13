import {
  parseValidAnagramEntries,
  type ValidAnagramPhase,
  type ValidAnagramResult,
} from '../../algorithms/array-string/validAnagramSteps'
import { cn } from '../../lib/cn'
import type { VisualizationStep } from './types'

type ValidAnagramPanelsProps = {
  first: string
  second: string
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

function readString(
  meta: VisualizationStep['meta'],
  key: string,
  fallback = '',
): string {
  const value = meta?.[key]
  return typeof value === 'string' ? value : fallback
}

function readPhase(meta: VisualizationStep['meta']): ValidAnagramPhase | null {
  const value = meta?.phase
  return typeof value === 'string' ? (value as ValidAnagramPhase) : null
}

function readResult(meta: VisualizationStep['meta']): ValidAnagramResult {
  const value = meta?.result
  if (value === 'valid' || value === 'invalid') {
    return value
  }
  return null
}

function displayChar(char: string): string {
  if (char === ' ') {
    return "' '"
  }
  return char
}

function CharacterRow({
  label,
  value,
  currentIndex,
  isActive,
  emphasize,
}: {
  label: string
  value: string
  currentIndex: number
  isActive: boolean
  emphasize: 'increment' | 'decrement' | 'neutral'
}) {
  return (
    <div
      className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-muted/20 sm:p-4"
      aria-label={label}
    >
      <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
        {label}
      </p>
      <p className="mt-1 font-mono text-sm text-muted-foreground">
        &quot;{value}&quot;
        <span className="ml-2 text-xs">
          length {value.length}
        </span>
      </p>

      {value.length === 0 ? (
        <p className="mt-2 text-body-sm text-muted-foreground">(empty string)</p>
      ) : (
        <div className="mt-3 overflow-x-auto pb-1">
          <div
            className="grid w-max gap-2"
            style={{
              gridTemplateColumns: `repeat(${value.length}, minmax(2.5rem, 1fr))`,
            }}
          >
            {value.split('').map((char, index) => {
              const isCurrent = isActive && index === currentIndex && currentIndex >= 0

              return (
                <div
                  key={`${label}-${index}`}
                  className="flex flex-col items-center gap-1"
                >
                  <span className="font-mono text-[0.65rem] text-muted-foreground">
                    {index}
                  </span>
                  <span
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-md border font-mono text-sm font-medium',
                      'transition-[background-color,border-color,box-shadow,transform] duration-300 ease-out',
                      'motion-reduce:transition-none motion-reduce:transform-none',
                      isCurrent && emphasize === 'increment'
                        ? 'border-primary bg-primary/15 text-foreground shadow-sm ring-2 ring-primary/30 scale-105 motion-reduce:scale-100'
                        : isCurrent && emphasize === 'decrement'
                          ? 'border-sky-600/60 bg-sky-500/15 text-foreground shadow-sm ring-2 ring-sky-500/30 scale-105 motion-reduce:scale-100 dark:border-sky-400/50'
                          : isCurrent
                            ? 'border-primary bg-primary/10 text-foreground ring-2 ring-primary/25'
                            : 'border-border bg-surface text-foreground',
                    )}
                  >
                    {char === ' ' ? '␠' : char}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Educational panels for Valid Anagram:
 * both input strings plus a live frequency map and result banner.
 */
export function ValidAnagramPanels({
  first,
  second,
  step,
  className,
}: ValidAnagramPanelsProps) {
  const meta = step?.meta
  const phase = readPhase(meta)
  const currentIndex = readNumber(meta, 'currentIndex', -1)
  const currentCharacter = readString(meta, 'currentCharacter')
  const activeString = readString(meta, 'activeString', 'none')
  const previousCount = readNumber(meta, 'previousCount', 0)
  const newCount = readNumber(meta, 'newCount', 0)
  const message = readString(meta, 'message')
  const result = readResult(meta)
  const entries = parseValidAnagramEntries(
    readString(meta, 'frequencySnapshot', '[]'),
  )

  const firstActive = activeString === 'first'
  const secondActive = activeString === 'second'
  const showMapAction =
    phase === 'increment-frequency' ||
    phase === 'decrement-frequency' ||
    phase === 'read-first-character' ||
    phase === 'read-second-character'

  return (
    <div className={cn('mb-4 space-y-3', className)}>
      <div className="grid gap-3 lg:grid-cols-2">
        <CharacterRow
          label="First string"
          value={first}
          currentIndex={currentIndex}
          isActive={firstActive}
          emphasize="increment"
        />
        <CharacterRow
          label="Second string"
          value={second}
          currentIndex={currentIndex}
          isActive={secondActive}
          emphasize="decrement"
        />
      </div>

      <div
        className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-muted/20 sm:p-4"
        aria-label="Frequency map"
        aria-live="polite"
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
              Frequency Map
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Insertion order does not matter — compare counts only.
            </p>
          </div>
          {showMapAction && currentCharacter !== '' ? (
            <p className="font-mono text-xs text-muted-foreground">
              {phase === 'increment-frequency'
                ? `${displayChar(currentCharacter)}: ${previousCount} → ${newCount}`
                : phase === 'decrement-frequency'
                  ? `${displayChar(currentCharacter)}: ${previousCount} → ${newCount}`
                  : `read ${displayChar(currentCharacter)}`}
            </p>
          ) : null}
        </div>

        {entries.length === 0 ? (
          <p className="mt-3 text-body-sm text-muted-foreground">(empty)</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-[12rem] border-collapse text-left font-mono text-sm">
              <caption className="sr-only">
                Frequency map with character and count columns
              </caption>
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Character</th>
                  <th className="px-3 py-2 font-medium">Count</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const isFocus =
                    currentCharacter !== '' &&
                    entry.key === currentCharacter &&
                    (phase === 'increment-frequency' ||
                      phase === 'decrement-frequency' ||
                      phase === 'read-first-character' ||
                      phase === 'read-second-character')

                  return (
                    <tr
                      key={`anagram-entry-${entry.key === ' ' ? 'space' : entry.key}`}
                      className={cn(
                        'border-b border-border/60 last:border-b-0',
                        'transition-[background-color] duration-300 ease-out motion-reduce:transition-none',
                        isFocus ? 'bg-primary/12' : undefined,
                      )}
                    >
                      <td
                        className={cn(
                          'px-3 py-2 text-foreground',
                          isFocus && 'font-semibold',
                        )}
                      >
                        {entry.key === ' ' ? "' '" : entry.key}
                      </td>
                      <td
                        className={cn(
                          'px-3 py-2 text-foreground',
                          'transition-transform duration-300 ease-out motion-reduce:transition-none',
                          isFocus &&
                            (phase === 'increment-frequency' ||
                              phase === 'decrement-frequency')
                            ? 'origin-left scale-110 font-semibold motion-reduce:scale-100'
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
      </div>

      {result ? (
        <div
          className={cn(
            'rounded-xl border px-4 py-3 text-sm font-medium',
            result === 'valid'
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100'
              : 'border-rose-500/40 bg-rose-500/10 text-rose-950 dark:text-rose-100',
          )}
          role="status"
          aria-live="polite"
        >
          {result === 'valid' ? 'Valid Anagram' : 'Not Anagrams'}
        </div>
      ) : null}

      {message ? (
        <p className="text-body-sm text-muted-foreground" aria-live="polite">
          {message}
        </p>
      ) : null}
    </div>
  )
}
