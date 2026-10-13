import type { StringCompressionPhase } from '../../algorithms/array-string/stringCompressionSteps'
import { cn } from '../../lib/cn'
import type { VisualizationStep } from './types'

type StringCompressionPanelsProps = {
  input: string
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

function readPhase(
  meta: VisualizationStep['meta'],
): StringCompressionPhase | null {
  const value = meta?.phase
  return typeof value === 'string' ? (value as StringCompressionPhase) : null
}

function displayChar(char: string): string {
  if (char === ' ') {
    return '␠'
  }
  if (char === '') {
    return '—'
  }
  return char
}

/**
 * Educational panels for String Compression:
 * input cells, run counter, and growing compressed output.
 */
export function StringCompressionPanels({
  input,
  step,
  className,
}: StringCompressionPanelsProps) {
  const meta = step?.meta
  const phase = readPhase(meta)
  const currentIndex = readNumber(meta, 'currentIndex', -1)
  const runCharacter = readString(meta, 'runCharacter')
  const runCount = readNumber(meta, 'runCount', 0)
  const runStart = readNumber(meta, 'runStart', -1)
  const runEnd = readNumber(meta, 'runEnd', -1)
  const output = readString(meta, 'output')
  const lastAppend = readString(meta, 'lastAppend')
  const processedEnd = readNumber(meta, 'processedEnd', -1)
  const isComplete = readBoolean(meta, 'isComplete', false)
  const message = readString(meta, 'message')

  const showRunCounter =
    phase === 'read-character' ||
    phase === 'extend-run' ||
    phase === 'run-ended' ||
    phase === 'write-character' ||
    phase === 'write-count'

  const appending =
    phase === 'write-character' || phase === 'write-count'

  const previousOutputLength =
    appending && lastAppend.length > 0
      ? Math.max(0, output.length - lastAppend.length)
      : output.length

  return (
    <div className={cn('mb-4 space-y-3', className)}>
      <div
        className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-muted/20 sm:p-4"
        aria-label="Input string"
      >
        <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
          Input string
        </p>
        <p className="mt-1 font-mono text-sm text-muted-foreground">
          &quot;{input}&quot;
          <span className="ml-2 text-xs">length {input.length}</span>
        </p>

        {input.length === 0 ? (
          <p className="mt-2 text-body-sm text-muted-foreground">
            (empty string)
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto pb-1">
            <div
              className="grid w-max gap-2"
              style={{
                gridTemplateColumns: `repeat(${input.length}, minmax(2.5rem, 1fr))`,
              }}
            >
              {input.split('').map((char, index) => {
                const inActiveRun =
                  runStart >= 0 &&
                  runEnd >= runStart &&
                  index >= runStart &&
                  index <= runEnd
                const isCurrent = index === currentIndex && currentIndex >= 0
                const isProcessed =
                  processedEnd >= 0 &&
                  index <= processedEnd &&
                  !inActiveRun &&
                  phase !== 'complete'
                const isDone = phase === 'complete' || isComplete

                return (
                  <div
                    key={`input-${index}`}
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
                        isDone
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-foreground'
                          : isCurrent
                            ? 'border-primary bg-primary/15 text-foreground shadow-sm ring-2 ring-primary/30 scale-105 motion-reduce:scale-100'
                            : inActiveRun
                              ? 'border-sky-600/50 bg-sky-500/15 text-foreground dark:border-sky-400/40'
                              : isProcessed
                                ? 'border-border/50 bg-muted/50 text-muted-foreground opacity-70'
                                : 'border-border bg-surface text-foreground',
                      )}
                    >
                      {displayChar(char)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {showRunCounter ? (
        <div
          className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-muted/20 sm:p-4"
          aria-label="Run counter"
          aria-live="polite"
        >
          <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
            Run counter
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[0.65rem] text-muted-foreground">
                Character
              </span>
              <span
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-md border font-mono text-lg font-semibold',
                  'border-primary/40 bg-primary/10 text-foreground',
                )}
              >
                {displayChar(runCharacter)}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[0.65rem] text-muted-foreground">Count</span>
              <span
                className={cn(
                  'flex h-12 min-w-12 items-center justify-center rounded-md border px-3 font-mono text-lg font-semibold',
                  'transition-[background-color,border-color] duration-300 ease-out motion-reduce:transition-none',
                  phase === 'extend-run' || phase === 'run-ended'
                    ? 'border-sky-600/50 bg-sky-500/15 text-foreground dark:border-sky-400/40'
                    : 'border-border bg-surface text-foreground',
                )}
              >
                {runCount}
              </span>
            </div>
            {runStart >= 0 && runEnd >= runStart ? (
              <p className="text-body-sm text-muted-foreground">
                Active run: indices {runStart}
                {runEnd > runStart ? `–${runEnd}` : ''}
              </p>
            ) : null}
          </div>
          <p className="mt-3 text-body-sm text-muted-foreground">
            {phase === 'run-ended' ||
            phase === 'write-character' ||
            phase === 'write-count'
              ? runCount > 1
                ? `Run ended with count ${runCount} (> 1) — write the character and the count.`
                : 'Run ended with count 1 — write the character only (omit the count).'
              : phase === 'extend-run'
                ? 'Same character continues the run — increment the count.'
                : 'Starting a new consecutive run.'}
          </p>
        </div>
      ) : null}

      <div
        className={cn(
          'rounded-xl border px-4 py-3',
          phase === 'complete' || isComplete
            ? 'border-emerald-500/40 bg-emerald-500/10'
            : 'border-border bg-muted/40 dark:bg-muted/20',
        )}
        aria-label="Compressed output"
        role="status"
        aria-live="polite"
      >
        <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
          Compressed output
        </p>
        {output.length === 0 ? (
          <p className="mt-2 font-mono text-sm text-muted-foreground">
            {phase === 'complete' || isComplete ? '""' : '(empty)'}
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto pb-1">
            <div className="flex w-max flex-wrap gap-1.5">
              {output.split('').map((char, index) => {
                const isNew =
                  appending && index >= previousOutputLength

                return (
                  <span
                    key={`out-${index}-${char}`}
                    className={cn(
                      'flex h-9 min-w-9 items-center justify-center rounded-md border px-1.5 font-mono text-sm',
                      'transition-[background-color,border-color,transform] duration-300 ease-out',
                      'motion-reduce:transition-none motion-reduce:transform-none',
                      isNew
                        ? 'border-primary bg-primary/15 text-foreground ring-2 ring-primary/25 scale-105 motion-reduce:scale-100'
                        : phase === 'complete' || isComplete
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-foreground'
                          : 'border-border bg-surface text-foreground',
                    )}
                  >
                    {displayChar(char)}
                  </span>
                )
              })}
            </div>
          </div>
        )}
        {(phase === 'complete' || isComplete) && output.length > 0 ? (
          <p className="mt-2 font-mono text-sm text-foreground">
            Result: &quot;{output}&quot;
          </p>
        ) : null}
      </div>

      {message ? (
        <p className="text-body-sm text-muted-foreground" aria-live="polite">
          {message}
        </p>
      ) : null}
    </div>
  )
}
