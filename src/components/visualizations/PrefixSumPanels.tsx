import { cn } from '../../lib/cn'
import type { VisualizationStep } from './types'
import type { PrefixSumPhase } from '../../algorithms/array-string/prefixSumSteps'

type PrefixSumPanelsProps = {
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

function readPhase(meta: VisualizationStep['meta']): PrefixSumPhase | null {
  const value = meta?.phase
  return typeof value === 'string' ? (value as PrefixSumPhase) : null
}

/**
 * Educational panels shown above the prefix-array visualizer:
 * original array with range highlight, plus formula / result readout.
 */
export function PrefixSumPanels({
  original,
  step,
  className,
}: PrefixSumPanelsProps) {
  const meta = step?.meta
  const phase = readPhase(meta)
  const left = readNumber(meta, 'left', -1)
  const right = readNumber(meta, 'right', -1)
  const currentIndex = readNumber(meta, 'currentIndex', -1)
  const queryResult = readNumber(meta, 'queryResult', 0)
  const previousPrefix = readNumber(meta, 'previousPrefix', 0)
  const currentPrefix = readNumber(meta, 'currentPrefix', 0)
  const formulaLeft = readNumber(meta, 'formulaLeft', left)
  const formulaRight = readNumber(meta, 'formulaRight', right + 1)

  const isQueryPhase =
    phase === 'query-start' ||
    phase === 'query-left' ||
    phase === 'query-right' ||
    phase === 'query-calculate' ||
    phase === 'query-result' ||
    phase === 'complete'

  const showFormula =
    phase === 'query-calculate' ||
    phase === 'query-result' ||
    phase === 'complete' ||
    phase === 'query-left' ||
    phase === 'query-right' ||
    phase === 'query-start'

  return (
    <div className={cn('mb-4 space-y-3', className)}>
      <div
        className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-muted/20 sm:p-4"
        aria-label="Original array"
      >
        <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
          Original array
        </p>
        {original.length === 0 ? (
          <p className="mt-2 text-body-sm text-muted-foreground">
            Empty array — nothing to display.
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
                const inRange =
                  isQueryPhase &&
                  left >= 0 &&
                  right >= 0 &&
                  index >= left &&
                  index <= right
                const isBuildFocus =
                  (phase === 'add' || phase === 'prefix-created') &&
                  index === currentIndex

                return (
                  <div
                    key={`original-${index}`}
                    className="flex flex-col items-center gap-1"
                  >
                    <span className="font-mono text-[0.65rem] text-muted-foreground">
                      {index}
                    </span>
                    <span
                      className={cn(
                        'flex h-11 w-11 items-center justify-center rounded-md border font-mono text-sm font-medium',
                        'transition-[background-color,border-color,box-shadow] duration-300 ease-out motion-reduce:transition-none',
                        inRange
                          ? 'border-sky-500/60 bg-sky-500/15 text-foreground ring-1 ring-sky-500/25 dark:border-sky-400/60 dark:bg-sky-400/15'
                          : isBuildFocus
                            ? 'border-primary bg-primary/15 text-foreground shadow-sm ring-2 ring-primary/30'
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
        {isQueryPhase && left >= 0 && right >= 0 ? (
          <p className="mt-3 text-body-sm text-muted-foreground">
            Selected range:{' '}
            <span className="font-mono text-foreground">
              [{original.slice(left, right + 1).join(', ')}]
            </span>
            {' · '}
            Left:{' '}
            <span className="font-mono text-foreground">{left}</span>
            {' · '}
            Right:{' '}
            <span className="font-mono text-foreground">{right}</span>
          </p>
        ) : null}
      </div>

      <div
        className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-muted/20 sm:p-4"
        aria-live="polite"
      >
        <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
          Range formula
        </p>
        {showFormula && original.length > 0 ? (
          <div className="mt-2 space-y-1 font-mono text-sm text-foreground">
            <p>prefix[right + 1] − prefix[left]</p>
            <p>
              prefix[{formulaRight}] − prefix[{formulaLeft}]
            </p>
            {(phase === 'query-calculate' ||
              phase === 'query-result' ||
              phase === 'complete') && (
              <p>
                {currentPrefix} − {previousPrefix}
                {(phase === 'query-result' || phase === 'complete') && (
                  <> = {queryResult}</>
                )}
              </p>
            )}
            {(phase === 'query-result' || phase === 'complete') && (
              <p className="pt-1 text-body-sm font-sans text-muted-foreground">
                Result:{' '}
                <span className="font-mono font-medium text-foreground">
                  {queryResult}
                </span>
              </p>
            )}
          </div>
        ) : (
          <p className="mt-2 text-body-sm text-muted-foreground">
            {phase === 'build-prefix' ||
            phase === 'add' ||
            phase === 'prefix-created'
              ? 'Build the prefix array first. Range queries come after preprocessing.'
              : 'Choose a valid range to see the constant-time formula.'}
          </p>
        )}
      </div>

      <p className="text-label text-[0.65rem] tracking-[0.08em] text-muted-foreground">
        Prefix sum array
      </p>
    </div>
  )
}
