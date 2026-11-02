import {
  parseStackSnapshot,
  type StackPhase,
} from '../../algorithms/data-structures/stackSteps'
import { cn } from '../../lib/cn'
import type { ElementVisualState, VisualizationStep } from './types'
import { elementStateClasses } from './utils'

type StackPanelsProps = {
  step: VisualizationStep | undefined
  className?: string
}

function readString(
  meta: VisualizationStep['meta'],
  key: string,
): string | null {
  const value = meta?.[key]
  return typeof value === 'string' ? value : null
}

function readNumber(
  meta: VisualizationStep['meta'],
  key: string,
): number | null {
  const value = meta?.[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function readPhase(meta: VisualizationStep['meta']): StackPhase | null {
  const value = meta?.phase
  return typeof value === 'string' ? (value as StackPhase) : null
}

function resolveElementState(
  index: number,
  meta: VisualizationStep['meta'],
  topIdx: number,
): ElementVisualState {
  const phase = readPhase(meta)
  const activeIndex = readNumber(meta, 'activeIndex')

  if (activeIndex === index && (phase === 'push' || phase === 'create-element')) {
    return 'moving'
  }
  if (activeIndex === index && phase === 'pop') {
    return 'moving'
  }
  if (activeIndex === index && phase === 'peek') {
    return 'found'
  }
  if (activeIndex === index && phase === 'focus-top') {
    return 'highlighted'
  }
  if (activeIndex === index && phase === 'complete') {
    return 'found'
  }
  if (index === topIdx) {
    return 'active'
  }
  if (activeIndex === index) {
    return 'highlighted'
  }
  return 'default'
}

/**
 * Vertical stack panel: TOP pointer, cells bottom→top visually inverted
 * (top of stack rendered at the top of the column), BOTTOM baseline.
 */
export function StackPanels({ step, className }: StackPanelsProps) {
  const meta = step?.meta
  const snapshotRaw = meta?.stackSnapshot
  const snapshot = parseStackSnapshot(
    typeof snapshotRaw === 'string'
      ? snapshotRaw
      : '{"values":[],"maxCapacity":null}',
  )
  const values = snapshot.values
  const topIdx = values.length === 0 ? -1 : values.length - 1
  const phase = readPhase(meta)
  const result = readString(meta, 'result')
  const capacity = snapshot.maxCapacity
  const pendingOperand =
    phase === 'create-element' ? readNumber(meta, 'operand') : null
  const showEmpty =
    values.length === 0 && pendingOperand === null && phase !== 'create-element'

  // Render top → bottom (visual), while array is bottom → top.
  const visualOrder = values
    .map((value, index) => ({ value, index }))
    .reverse()

  return (
    <div className={cn('mb-4 space-y-3', className)}>
      <div
        className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-muted/20 sm:p-4"
        aria-label="Stack visualization"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
            Stack (LIFO)
          </p>
          <p className="text-[0.65rem] text-muted-foreground">
            Last in, first out · top is the last array index
            {capacity !== null
              ? ` · educational capacity ${capacity}`
              : ''}
          </p>
        </div>

        <div className="mt-4 flex flex-col items-center">
          <div className="mb-1 flex flex-col items-center gap-0.5">
            <span className="text-label text-[0.65rem] tracking-[0.1em] text-primary">
              TOP
            </span>
            <span aria-hidden="true" className="text-muted-foreground">
              ↓
            </span>
          </div>

          {pendingOperand !== null ? (
            <div
              className={cn(
                'mb-2 flex h-11 min-w-16 items-center justify-center rounded-md border-2 border-dashed',
                'border-sky-500/60 bg-sky-500/10 px-3 font-mono text-sm font-semibold text-foreground',
                'motion-safe:animate-[stack-enter_420ms_ease-out]',
              )}
              aria-label={`Incoming value ${pendingOperand}`}
            >
              {pendingOperand}
            </div>
          ) : null}

          <div
            className="flex w-full max-w-[12rem] flex-col items-stretch gap-1.5"
            role="list"
            aria-label={
              showEmpty
                ? 'Empty stack'
                : `Stack with ${values.length} element${values.length === 1 ? '' : 's'}`
            }
          >
            {showEmpty ? (
              <div
                className={cn(
                  'flex h-14 items-center justify-center rounded-md border border-dashed border-border',
                  'bg-muted/50 px-3 text-center font-mono text-xs text-muted-foreground',
                )}
                role="listitem"
              >
                empty
              </div>
            ) : (
              visualOrder.map(({ value, index }) => {
                const state = resolveElementState(index, meta, topIdx)
                const isTop = index === topIdx
                const isLeaving =
                  isTop && (phase === 'pop' || phase === 'focus-top')
                return (
                  <div
                    key={`${index}-${value}`}
                    role="listitem"
                    className={cn(
                      'relative flex h-11 items-center justify-center rounded-md border px-3',
                      'font-mono text-sm font-semibold transition-theme',
                      elementStateClasses[state],
                      phase === 'push' && isTop
                        ? 'motion-safe:animate-[stack-enter_420ms_ease-out]'
                        : null,
                      isLeaving && phase === 'pop'
                        ? 'motion-safe:animate-[stack-leave_420ms_ease-in]'
                        : null,
                    )}
                  >
                    <span>[{value}]</span>
                    {isTop ? (
                      <span className="absolute -right-14 top-1/2 -translate-y-1/2 text-[0.65rem] font-medium tracking-wide text-primary sm:-right-16">
                        ← top
                      </span>
                    ) : null}
                  </div>
                )
              })
            )}
          </div>

          <div className="mt-2 flex w-full max-w-[12rem] flex-col items-center gap-0.5">
            <div
              className="h-0.5 w-full rounded-full bg-border"
              aria-hidden="true"
            />
            <span className="text-label text-[0.65rem] tracking-[0.1em] text-muted-foreground">
              BOTTOM
            </span>
          </div>
        </div>

        {result !== null ? (
          <p
            className="mt-3 text-center font-mono text-body-sm text-muted-foreground"
            aria-live="polite"
          >
            Result:{' '}
            <span className="text-foreground">{result}</span>
          </p>
        ) : null}
      </div>
    </div>
  )
}
