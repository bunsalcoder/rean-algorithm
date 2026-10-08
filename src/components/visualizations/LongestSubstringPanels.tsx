import {
  parseActiveCharacters,
  type LongestSubstringPhase,
} from '../../algorithms/array-string/longestSubstringWithoutRepeatingSteps'
import { cn } from '../../lib/cn'
import type { VisualizationStep } from './types'

type LongestSubstringPanelsProps = {
  original: string
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

function readBoolean(
  meta: VisualizationStep['meta'],
  key: string,
  fallback: boolean,
): boolean {
  const value = meta?.[key]
  return typeof value === 'boolean' ? value : fallback
}

function readPhase(meta: VisualizationStep['meta']): LongestSubstringPhase | null {
  const value = meta?.phase
  return typeof value === 'string' ? (value as LongestSubstringPhase) : null
}

function formatQuoted(value: string): string {
  return `"${value}"`
}

/**
 * Educational panels for Longest Substring Without Repeating Characters:
 * string with window markers, active Set, and best-window readout.
 */
export function LongestSubstringPanels({
  original,
  step,
  className,
}: LongestSubstringPanelsProps) {
  const meta = step?.meta
  const phase = readPhase(meta)
  const left = readNumber(meta, 'left', 0)
  const right = readNumber(meta, 'right', -1)
  const currentCharacter = readString(meta, 'currentCharacter')
  const duplicateCharacter = readString(meta, 'duplicateCharacter')
  const removedCharacter = readString(meta, 'removedCharacter')
  const activeCharacters = parseActiveCharacters(
    readString(meta, 'activeCharacters'),
  )
  const currentWindow = readString(meta, 'currentWindow')
  const currentLength = readNumber(meta, 'currentLength', 0)
  const bestStart = readNumber(meta, 'bestStart', 0)
  const bestEnd = readNumber(meta, 'bestEnd', -1)
  const bestLength = readNumber(meta, 'bestLength', 0)
  const bestSubstring = readString(meta, 'bestSubstring')
  const bestUpdated = readBoolean(meta, 'bestUpdated', false)

  const hasWindow = right >= left && right >= 0
  const emphasizeDuplicate =
    phase === 'duplicate-found' ||
    phase === 'shrink-left' ||
    phase === 'remove-character'
  const emphasizeBest =
    phase === 'update-best' || phase === 'complete' || bestUpdated
  const emphasizeAdd =
    phase === 'add-character' ||
    phase === 'expand-right' ||
    phase === 'window-valid'

  return (
    <div className={cn('space-y-3', className)}>
      <div
        className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-muted/20 sm:p-4"
        aria-label="Input string with current window"
      >
        <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
          String
        </p>

        {original.length === 0 ? (
          <p className="mt-2 text-body-sm text-muted-foreground">
            Empty string — nothing to scan.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto pb-1">
            <div
              className="grid w-max gap-2"
              style={{
                gridTemplateColumns: `repeat(${original.length}, minmax(2.75rem, 1fr))`,
              }}
            >
              {original.split('').map((char, index) => {
                const inWindow =
                  hasWindow && index >= left && index <= right
                const inBest =
                  bestEnd >= bestStart &&
                  bestEnd >= 0 &&
                  index >= bestStart &&
                  index <= bestEnd
                const isRight = index === right && right >= 0
                const isLeft = index === left && hasWindow
                const isRemoved =
                  phase === 'remove-character' &&
                  index === left - 1 &&
                  removedCharacter !== ''

                return (
                  <div
                    key={`longest-char-${index}`}
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
                        isRight && emphasizeDuplicate
                          ? 'border-primary bg-primary/20 text-foreground shadow-sm ring-2 ring-primary/35 scale-105 motion-reduce:scale-100'
                          : isRight && emphasizeAdd
                            ? 'border-primary bg-primary/15 text-foreground shadow-sm ring-2 ring-primary/30 scale-105 motion-reduce:scale-100'
                            : isRemoved
                              ? 'border-border bg-muted text-muted-foreground line-through opacity-70'
                              : inWindow
                                ? 'border-dashed border-primary/50 bg-primary/5 text-foreground'
                                : inBest
                                  ? 'border-sky-600/50 bg-sky-500/10 text-foreground dark:border-sky-400/40 dark:bg-sky-400/10'
                                  : 'border-border bg-surface text-foreground',
                      )}
                      title={
                        isRight
                          ? 'Right pointer'
                          : isLeft
                            ? 'Left pointer'
                            : inWindow
                              ? 'Current window'
                              : inBest
                                ? 'Best substring'
                                : undefined
                      }
                    >
                      {char}
                    </span>
                    {isLeft && isRight ? (
                      <span className="text-[0.6rem] font-medium text-primary">
                        L/R
                      </span>
                    ) : isLeft ? (
                      <span className="text-[0.6rem] font-medium text-primary">
                        left
                      </span>
                    ) : isRight ? (
                      <span className="text-[0.6rem] font-medium text-primary">
                        right
                      </span>
                    ) : inWindow ? (
                      <span className="text-[0.6rem] text-muted-foreground">
                        win
                      </span>
                    ) : inBest ? (
                      <span className="text-[0.6rem] text-sky-700 dark:text-sky-300">
                        best
                      </span>
                    ) : (
                      <span className="text-[0.6rem] opacity-0">·</span>
                    )}
                  </div>
                )
              })}
            </div>

            {hasWindow ? (
              <p
                className="mt-3 font-mono text-xs text-muted-foreground"
                aria-hidden="true"
              >
                <span className="inline-flex items-center gap-1">
                  <span className="text-primary">└</span>
                  <span className="border-b border-dashed border-primary/50 px-1">
                    current window
                  </span>
                  <span className="text-primary">┘</span>
                  <span className="ml-2">
                    [{left}…{right}]
                  </span>
                </span>
              </p>
            ) : null}
          </div>
        )}

        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.7rem] text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block size-3 rounded-sm border-2 border-primary bg-primary/15"
            />
            Left / right focus
          </li>
          <li className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block size-3 rounded-sm border border-dashed border-primary/50 bg-primary/5"
            />
            Current window
          </li>
          <li className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block size-3 rounded-sm border border-sky-600/50 bg-sky-500/10 dark:border-sky-400/40"
            />
            Best substring
          </li>
        </ul>
      </div>

      <div
        className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-muted/20 sm:p-4"
        aria-label="Current sliding window state"
        aria-live="polite"
      >
        <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
          Current State
        </p>

        <div className="mt-3 grid gap-2 text-body-sm sm:grid-cols-2">
          <p className="text-muted-foreground">
            Left:{' '}
            <span className="font-mono text-foreground">{left}</span>
          </p>
          <p className="text-muted-foreground">
            Right:{' '}
            <span className="font-mono text-foreground">
              {right < 0 ? '—' : right}
            </span>
          </p>
          <p className="text-muted-foreground">
            Current Window:{' '}
            <span className="font-mono text-foreground">
              {formatQuoted(currentWindow)}
            </span>
          </p>
          <p className="text-muted-foreground">
            Current Length:{' '}
            <span className="font-mono text-foreground">{currentLength}</span>
          </p>
          <p className="text-muted-foreground">
            Best Length:{' '}
            <span
              className={cn(
                'font-mono',
                emphasizeBest ? 'font-semibold text-foreground' : 'text-foreground',
              )}
            >
              {bestLength}
            </span>
          </p>
          <p className="text-muted-foreground">
            Best Substring:{' '}
            <span className="font-mono text-foreground">
              {formatQuoted(bestSubstring)}
            </span>
            {bestEnd >= bestStart && bestEnd >= 0 ? (
              <span className="ml-1 text-xs">
                (i {bestStart}–{bestEnd})
              </span>
            ) : null}
          </p>
        </div>

        {currentCharacter ? (
          <p className="mt-3 text-body-sm text-muted-foreground">
            Current character:{' '}
            <span className="font-mono text-foreground">
              &apos;{currentCharacter}&apos;
            </span>
            {duplicateCharacter ? (
              <>
                {' · '}
                Duplicate:{' '}
                <span className="font-mono font-medium text-foreground">
                  &apos;{duplicateCharacter}&apos;
                </span>
              </>
            ) : null}
            {removedCharacter &&
            (phase === 'shrink-left' || phase === 'remove-character') ? (
              <>
                {' · '}
                Removing:{' '}
                <span className="font-mono text-foreground">
                  &apos;{removedCharacter}&apos;
                </span>
              </>
            ) : null}
          </p>
        ) : null}
      </div>

      <div
        className={cn(
          'rounded-xl border p-3 sm:p-4',
          'transition-[border-color,background-color,box-shadow] duration-300 ease-out motion-reduce:transition-none',
          emphasizeDuplicate
            ? 'border-primary/45 bg-primary/10 shadow-sm'
            : 'border-border bg-muted/40 dark:bg-muted/20',
        )}
        aria-label="Active character set"
        aria-live="polite"
      >
        <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
          Active Characters (Set)
        </p>
        {activeCharacters.length === 0 ? (
          <p className="mt-2 font-mono text-sm text-muted-foreground">{'{ }'}</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {activeCharacters.map((char) => {
              const isDuplicate = char === duplicateCharacter && emphasizeDuplicate
              const isCurrent = char === currentCharacter && emphasizeAdd

              return (
                <li
                  key={`active-${char}`}
                  className={cn(
                    'flex h-9 min-w-9 items-center justify-center rounded-md border px-2 font-mono text-sm',
                    'transition-[background-color,border-color,transform] duration-300 ease-out motion-reduce:transition-none',
                    isDuplicate
                      ? 'border-primary bg-primary/20 font-semibold text-foreground scale-105 motion-reduce:scale-100'
                      : isCurrent
                        ? 'border-primary/50 bg-primary/10 text-foreground'
                        : 'border-border bg-surface text-foreground',
                  )}
                >
                  {char}
                </li>
              )
            })}
          </ul>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          Characters currently inside the sliding window. A duplicate forces the
          left pointer to move until the Set is unique again.
        </p>
      </div>
    </div>
  )
}
