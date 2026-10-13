import type {
  ReversePhaseNumber,
  RotateArrayPhase,
} from '../../algorithms/array-string/rotateArraySteps'
import { cn } from '../../lib/cn'
import type { VisualizationStep } from './types'
import { formatArray } from './utils'

type RotateArrayPanelsProps = {
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

function readString(
  meta: VisualizationStep['meta'],
  key: string,
  fallback = '',
): string {
  const value = meta?.[key]
  return typeof value === 'string' ? value : fallback
}

function readPhase(meta: VisualizationStep['meta']): RotateArrayPhase | null {
  const value = meta?.phase
  return typeof value === 'string' ? (value as RotateArrayPhase) : null
}

const PHASE_LABELS: {
  number: ReversePhaseNumber
  title: string
  why: string
}[] = [
  {
    number: 1,
    title: 'Reverse entire array',
    why: 'Moves the future prefix to the front (reversed).',
  },
  {
    number: 2,
    title: 'Reverse first k',
    why: 'Restores order of the rotated prefix.',
  },
  {
    number: 3,
    title: 'Reverse the rest',
    why: 'Restores the suffix — rotation is done.',
  },
]

/**
 * Educational panels for Rotate Array:
 * phase indicator, original vs working array, pointer/swap status.
 */
export function RotateArrayPanels({
  original,
  step,
  className,
}: RotateArrayPanelsProps) {
  const meta = step?.meta
  const phase = readPhase(meta)
  const rawK = readNumber(meta, 'rawK', 0)
  const normalizedK = readNumber(meta, 'normalizedK', 0)
  const reversePhase = readNumber(meta, 'reversePhase', 0) as ReversePhaseNumber
  const rangeStart = readNumber(meta, 'rangeStart', -1)
  const rangeEnd = readNumber(meta, 'rangeEnd', -1)
  const left = readNumber(meta, 'left', -1)
  const right = readNumber(meta, 'right', -1)
  const swappedLeft = readNumber(meta, 'swappedLeft', -1)
  const swappedRight = readNumber(meta, 'swappedRight', -1)
  const completedPhases = readNumber(meta, 'completedPhases', 0)
  const isComplete = readBoolean(meta, 'isComplete', false)
  const message = readString(meta, 'message')
  const working = step?.array ? [...step.array] : [...original]

  const showPointers =
    phase === 'reverse-start' ||
    phase === 'compare-pointers' ||
    phase === 'swap' ||
    phase === 'advance-pointers'

  return (
    <div className={cn('mb-4 space-y-3', className)}>
      <div
        className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-muted/20 sm:p-4"
        aria-label="Reversal phases"
      >
        <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
          Three-reversal phases
        </p>
        <ol className="mt-3 grid gap-2 sm:grid-cols-3">
          {PHASE_LABELS.map((item) => {
            const done = completedPhases >= item.number
            const active =
              reversePhase === item.number &&
              phase !== 'complete' &&
              phase !== 'initialize' &&
              phase !== 'normalize-k' &&
              !isComplete

            return (
              <li
                key={item.number}
                className={cn(
                  'rounded-lg border px-3 py-2 transition-[background-color,border-color] duration-300 ease-out',
                  'motion-reduce:transition-none',
                  done && !active
                    ? 'border-emerald-500/40 bg-emerald-500/10'
                    : active
                      ? 'border-primary/50 bg-primary/10 ring-1 ring-primary/25'
                      : 'border-border bg-surface',
                )}
              >
                <p className="text-[0.65rem] font-medium tracking-wide text-muted-foreground">
                  Phase {item.number}
                  {done && !active ? ' · done' : active ? ' · active' : ''}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {item.title}
                </p>
                <p className="mt-1 text-body-sm text-muted-foreground">
                  {item.why}
                </p>
              </li>
            )
          })}
        </ol>
        <p className="mt-3 text-body-sm text-muted-foreground" aria-live="polite">
          raw k = <span className="font-mono text-foreground">{rawK}</span>
          {' · '}
          normalized k ={' '}
          <span className="font-mono text-foreground">{normalizedK}</span>
          {' · '}
          n = <span className="font-mono text-foreground">{original.length}</span>
        </p>
      </div>

      <div
        className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-muted/20 sm:p-4"
        aria-label="Original array"
      >
        <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
          Original (unchanged)
        </p>
        <p className="mt-2 font-mono text-sm text-muted-foreground">
          {original.length === 0 ? '[]' : formatArray(original)}
        </p>
      </div>

      <div
        className={cn(
          'rounded-xl border px-3 py-3 sm:p-4',
          phase === 'complete' || isComplete
            ? 'border-emerald-500/40 bg-emerald-500/10'
            : 'border-border bg-muted/40 dark:bg-muted/20',
        )}
        aria-label="Working array"
        role="status"
        aria-live="polite"
      >
        <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
          Working array
        </p>
        {working.length === 0 ? (
          <p className="mt-2 text-body-sm text-muted-foreground">(empty)</p>
        ) : (
          <div className="mt-3 overflow-x-auto pb-1">
            <div
              className="grid w-max gap-2"
              style={{
                gridTemplateColumns: `repeat(${working.length}, minmax(2.5rem, 1fr))`,
              }}
            >
              {working.map((value, index) => {
                const inRange =
                  rangeStart >= 0 &&
                  rangeEnd >= rangeStart &&
                  index >= rangeStart &&
                  index <= rangeEnd
                const isLeft = showPointers && index === left && left >= 0
                const isRight = showPointers && index === right && right >= 0
                const isSwapping =
                  phase === 'swap' &&
                  (index === swappedLeft || index === swappedRight)
                const isComparing =
                  phase === 'compare-pointers' &&
                  (index === left || index === right)
                const isDone = phase === 'complete' || isComplete

                return (
                  <div
                    key={`work-${index}`}
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
                          : isSwapping
                            ? 'border-amber-500/60 bg-amber-500/20 text-foreground shadow-sm ring-2 ring-amber-500/30 scale-105 motion-reduce:scale-100'
                            : isComparing || isLeft || isRight
                              ? 'border-primary bg-primary/15 text-foreground shadow-sm ring-2 ring-primary/30 scale-105 motion-reduce:scale-100'
                              : inRange
                                ? 'border-sky-600/50 bg-sky-500/15 text-foreground dark:border-sky-400/40'
                                : 'border-border bg-surface text-foreground',
                      )}
                    >
                      {value}
                    </span>
                    <span className="min-h-[1rem] font-mono text-[0.6rem] text-primary">
                      {isLeft && isRight
                        ? 'L/R'
                        : isLeft
                          ? 'L'
                          : isRight
                            ? 'R'
                            : '\u00a0'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        {(phase === 'complete' || isComplete) && working.length > 0 ? (
          <p className="mt-2 font-mono text-sm text-foreground">
            Result: {formatArray(working)}
          </p>
        ) : null}
      </div>

      {showPointers && left >= 0 && right >= 0 ? (
        <div
          className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-muted/20 sm:p-4"
          aria-label="Pointer status"
          aria-live="polite"
        >
          <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
            Pointers
          </p>
          <p className="mt-2 text-body-sm text-muted-foreground">
            left = <span className="font-mono text-foreground">{left}</span>
            {' · '}
            right = <span className="font-mono text-foreground">{right}</span>
            {rangeStart >= 0 && rangeEnd >= rangeStart ? (
              <>
                {' · '}
                range ={' '}
                <span className="font-mono text-foreground">
                  [{rangeStart}, {rangeEnd}]
                </span>
              </>
            ) : null}
          </p>
          {phase === 'swap' && swappedLeft >= 0 ? (
            <p className="mt-1 text-body-sm text-muted-foreground">
              Swapping indices{' '}
              <span className="font-mono text-foreground">{swappedLeft}</span>
              {' and '}
              <span className="font-mono text-foreground">{swappedRight}</span>
            </p>
          ) : null}
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
