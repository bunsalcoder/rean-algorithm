import {
  parseDequeSnapshot,
  type DequeDirection,
  type DequePhase,
} from '../../algorithms/data-structures/dequeSteps'
import { toArray } from '../../algorithms/data-structures/deque'
import { cn } from '../../lib/cn'
import type { ElementVisualState, VisualizationStep } from './types'
import { elementStateClasses } from './utils'

type DequePanelsProps = {
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

function readPhase(meta: VisualizationStep['meta']): DequePhase | null {
  const value = meta?.phase
  return typeof value === 'string' ? (value as DequePhase) : null
}

function readDirection(meta: VisualizationStep['meta']): DequeDirection {
  const value = meta?.direction
  return value === 'front' || value === 'rear' ? value : 'none'
}

function resolveElementState(
  index: number,
  meta: VisualizationStep['meta'],
  frontIdx: number,
  rearIdx: number,
): ElementVisualState {
  const phase = readPhase(meta)
  const activeIndex = readNumber(meta, 'activeIndex')

  if (
    activeIndex === index &&
    (phase === 'push-front' ||
      phase === 'push-back' ||
      phase === 'create-element')
  ) {
    return 'moving'
  }
  if (
    activeIndex === index &&
    (phase === 'pop-front' || phase === 'pop-back')
  ) {
    return 'moving'
  }
  if (activeIndex === index && (phase === 'front' || phase === 'back')) {
    return 'found'
  }
  if (
    activeIndex === index &&
    (phase === 'focus-front' || phase === 'focus-rear')
  ) {
    return 'highlighted'
  }
  if (activeIndex === index && phase === 'complete') {
    return 'found'
  }
  if (index === frontIdx) {
    return 'active'
  }
  if (index === rearIdx && rearIdx !== frontIdx) {
    return 'highlighted'
  }
  if (activeIndex === index) {
    return 'highlighted'
  }
  return 'default'
}

/**
 * Horizontal deque panel: FRONT ⇄ … ⇄ REAR with inserts/removes at either
 * end (respects prefers-reduced-motion via motion-safe).
 */
export function DequePanels({ step, className }: DequePanelsProps) {
  const meta = step?.meta
  const snapshotRaw = meta?.dequeSnapshot
  const snapshot = parseDequeSnapshot(
    typeof snapshotRaw === 'string'
      ? snapshotRaw
      : '{"buffer":[],"front":0,"size":0,"capacity":1,"maxCapacity":null}',
  )
  const values = toArray(snapshot)
  const frontIdx = values.length === 0 ? -1 : 0
  const rearIdx = values.length === 0 ? -1 : values.length - 1
  const phase = readPhase(meta)
  const direction = readDirection(meta)
  const result = readString(meta, 'result')
  const capacity = snapshot.maxCapacity
  const pendingOperand =
    phase === 'create-element' ? readNumber(meta, 'operand') : null
  const leavingValue =
    phase === 'focus-front' ||
    phase === 'focus-rear' ||
    phase === 'pop-front' ||
    phase === 'pop-back'
      ? readNumber(meta, 'leavingValue')
      : null
  const showEmpty =
    values.length === 0 &&
    pendingOperand === null &&
    phase !== 'create-element' &&
    leavingValue === null

  const pendingAtFront = pendingOperand !== null && direction === 'front'
  const pendingAtRear = pendingOperand !== null && direction === 'rear'
  const leavingAtFront =
    leavingValue !== null &&
    (phase === 'pop-front' || (phase === 'focus-front' && direction === 'front'))
  const leavingAtRear =
    leavingValue !== null &&
    (phase === 'pop-back' || (phase === 'focus-rear' && direction === 'rear'))

  return (
    <div className={cn('mb-4 space-y-3', className)}>
      <div
        className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-muted/20 sm:p-4"
        aria-label="Deque visualization"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
            Deque (double-ended)
          </p>
          <p className="text-[0.65rem] text-muted-foreground">
            Insert / remove at either end
            {capacity !== null
              ? ` · educational capacity ${capacity}`
              : ''}
            {direction !== 'none' ? ` · active end: ${direction}` : ''}
          </p>
        </div>

        <div className="mt-4 overflow-x-auto">
          <div className="flex min-w-0 flex-col items-stretch gap-2 px-1 sm:px-2">
            <div className="flex items-end justify-between gap-2 text-center">
              <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                <span className="text-label text-[0.65rem] tracking-[0.1em] text-primary">
                  FRONT
                </span>
                <span aria-hidden="true" className="text-muted-foreground">
                  ↓
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col items-end gap-0.5">
                <span className="text-label text-[0.65rem] tracking-[0.1em] text-primary">
                  REAR
                </span>
                <span aria-hidden="true" className="text-muted-foreground">
                  ↓
                </span>
              </div>
            </div>

            <div
              className="flex flex-wrap items-center justify-start gap-1.5 sm:justify-center sm:gap-2"
              role="list"
              aria-label={
                showEmpty
                  ? 'Empty deque'
                  : `Deque with ${values.length} element${values.length === 1 ? '' : 's'}`
              }
            >
              {showEmpty ? (
                <div
                  className={cn(
                    'flex h-11 min-w-[8rem] flex-1 items-center justify-center rounded-md border border-dashed border-border',
                    'bg-muted/50 px-3 text-center font-mono text-xs text-muted-foreground sm:flex-none',
                  )}
                  role="listitem"
                >
                  empty
                </div>
              ) : (
                <>
                  {pendingAtFront ? (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div
                        className={cn(
                          'flex h-11 min-w-14 items-center justify-center rounded-md border-2 border-dashed',
                          'border-sky-500/60 bg-sky-500/10 px-3 font-mono text-sm font-semibold text-foreground',
                          'motion-safe:animate-[deque-enter-front_420ms_ease-out]',
                        )}
                        aria-label={`Incoming front value ${pendingOperand}`}
                        role="listitem"
                      >
                        [{pendingOperand}]
                      </div>
                      {values.length > 0 || leavingAtFront ? (
                        <span
                          aria-hidden="true"
                          className="text-muted-foreground"
                        >
                          ⇄
                        </span>
                      ) : null}
                    </div>
                  ) : null}

                  {leavingAtFront && phase === 'pop-front' ? (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div
                        role="listitem"
                        className={cn(
                          'relative flex h-11 min-w-14 items-center justify-center rounded-md border px-3',
                          'font-mono text-sm font-semibold',
                          elementStateClasses.moving,
                          'motion-safe:animate-[deque-leave-front_420ms_ease-in]',
                        )}
                        aria-label={`Popped front value ${leavingValue}`}
                      >
                        <span>[{leavingValue}]</span>
                        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.6rem] font-medium tracking-wide text-primary">
                          leaving front
                        </span>
                      </div>
                      {values.length > 0 ? (
                        <span
                          aria-hidden="true"
                          className="text-muted-foreground"
                        >
                          ⇄
                        </span>
                      ) : null}
                    </div>
                  ) : null}

                  {values.map((value, index) => {
                    const state = resolveElementState(
                      index,
                      meta,
                      frontIdx,
                      rearIdx,
                    )
                    const isFront = index === frontIdx
                    const isRear = index === rearIdx
                    const isLeavingFront =
                      isFront && phase === 'focus-front' && direction === 'front'
                    const isLeavingRear =
                      isRear && phase === 'focus-rear' && direction === 'rear'
                    const isEnteringFront =
                      isFront &&
                      (phase === 'push-front' || phase === 'create-element') &&
                      direction === 'front'
                    const isEnteringRear =
                      isRear &&
                      (phase === 'push-back' || phase === 'create-element') &&
                      direction === 'rear'

                    return (
                      <div
                        key={`${index}-${value}`}
                        className="flex items-center gap-1.5 sm:gap-2"
                      >
                        {index > 0 ? (
                          <span
                            aria-hidden="true"
                            className="text-muted-foreground"
                          >
                            ⇄
                          </span>
                        ) : null}
                        <div
                          role="listitem"
                          className={cn(
                            'relative flex h-11 min-w-14 items-center justify-center rounded-md border px-3',
                            'font-mono text-sm font-semibold transition-theme',
                            elementStateClasses[state],
                            isEnteringFront
                              ? 'motion-safe:animate-[deque-enter-front_420ms_ease-out]'
                              : null,
                            isEnteringRear
                              ? 'motion-safe:animate-[deque-enter-rear_420ms_ease-out]'
                              : null,
                            isLeavingFront
                              ? 'motion-safe:animate-[deque-leave-front_420ms_ease-in]'
                              : null,
                            isLeavingRear
                              ? 'motion-safe:animate-[deque-leave-rear_420ms_ease-in]'
                              : null,
                          )}
                        >
                          <span>[{value}]</span>
                          {isFront && isRear ? (
                            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.6rem] font-medium tracking-wide text-primary">
                              front / rear
                            </span>
                          ) : isFront ? (
                            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.6rem] font-medium tracking-wide text-primary">
                              front
                            </span>
                          ) : isRear ? (
                            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.6rem] font-medium tracking-wide text-primary">
                              rear
                            </span>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}

                  {leavingAtRear && phase === 'pop-back' ? (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {values.length > 0 ? (
                        <span
                          aria-hidden="true"
                          className="text-muted-foreground"
                        >
                          ⇄
                        </span>
                      ) : null}
                      <div
                        role="listitem"
                        className={cn(
                          'relative flex h-11 min-w-14 items-center justify-center rounded-md border px-3',
                          'font-mono text-sm font-semibold',
                          elementStateClasses.moving,
                          'motion-safe:animate-[deque-leave-rear_420ms_ease-in]',
                        )}
                        aria-label={`Popped rear value ${leavingValue}`}
                      >
                        <span>[{leavingValue}]</span>
                        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.6rem] font-medium tracking-wide text-primary">
                          leaving rear
                        </span>
                      </div>
                    </div>
                  ) : null}

                  {pendingAtRear ? (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {values.length > 0 || leavingAtRear ? (
                        <span
                          aria-hidden="true"
                          className="text-muted-foreground"
                        >
                          ⇄
                        </span>
                      ) : null}
                      <div
                        className={cn(
                          'flex h-11 min-w-14 items-center justify-center rounded-md border-2 border-dashed',
                          'border-sky-500/60 bg-sky-500/10 px-3 font-mono text-sm font-semibold text-foreground',
                          'motion-safe:animate-[deque-enter-rear_420ms_ease-out]',
                        )}
                        aria-label={`Incoming rear value ${pendingOperand}`}
                        role="listitem"
                      >
                        [{pendingOperand}]
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>

            {!showEmpty && values.length > 0 ? (
              <div className="h-4" aria-hidden="true" />
            ) : null}
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
