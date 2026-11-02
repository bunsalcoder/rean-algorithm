import {
  parseCircularQueueSnapshot,
  type CircularQueuePhase,
} from '../../algorithms/data-structures/circularQueueSteps'
import {
  CIRCULAR_QUEUE_DEFAULT_CAPACITY,
  isEmpty,
  isFull,
} from '../../algorithms/data-structures/circularQueue'
import { cn } from '../../lib/cn'
import type { ElementVisualState, VisualizationStep } from './types'
import { elementStateClasses } from './utils'

type CircularQueuePanelsProps = {
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

function readBoolean(
  meta: VisualizationStep['meta'],
  key: string,
): boolean {
  return meta?.[key] === true
}

function readPhase(meta: VisualizationStep['meta']): CircularQueuePhase | null {
  const value = meta?.phase
  return typeof value === 'string' ? (value as CircularQueuePhase) : null
}

function resolveSlotState(
  index: number,
  meta: VisualizationStep['meta'],
  frontIdx: number,
  rearIdx: number,
  insertIdx: number,
  occupied: boolean,
): ElementVisualState {
  const phase = readPhase(meta)
  const activeIndex = readNumber(meta, 'activeIndex')

  if (
    activeIndex === index &&
    (phase === 'enqueue' ||
      phase === 'create-element' ||
      phase === 'wrap-rear' ||
      phase === 'focus-insert')
  ) {
    return 'moving'
  }
  if (
    activeIndex === index &&
    (phase === 'dequeue' || phase === 'wrap-front')
  ) {
    return 'moving'
  }
  if (activeIndex === index && (phase === 'front' || phase === 'rear')) {
    return 'found'
  }
  if (activeIndex === index && phase === 'focus-front') {
    return 'highlighted'
  }
  if (activeIndex === index && phase === 'complete') {
    return 'found'
  }
  if (occupied && index === frontIdx) {
    return 'active'
  }
  if (occupied && index === rearIdx && rearIdx !== frontIdx) {
    return 'highlighted'
  }
  if (!occupied && index === insertIdx && insertIdx >= 0) {
    return 'highlighted'
  }
  if (activeIndex === index) {
    return 'highlighted'
  }
  return 'default'
}

function slotPosition(index: number, capacity: number): {
  left: string
  top: string
} {
  // Place index 0 near the top, then clockwise.
  const angle = (index / capacity) * Math.PI * 2 - Math.PI / 2
  const radius = 42
  const x = 50 + radius * Math.cos(angle)
  const y = 50 + radius * Math.sin(angle)
  return { left: `${x}%`, top: `${y}%` }
}

/**
 * Circular buffer panel: ring of fixed slots with front/rear markers,
 * empty slots, wraparound cues, and a linear buffer strip for indices.
 */
export function CircularQueuePanels({
  step,
  className,
}: CircularQueuePanelsProps) {
  const meta = step?.meta
  const snapshotRaw = meta?.circularQueueSnapshot
  const snapshot = parseCircularQueueSnapshot(
    typeof snapshotRaw === 'string'
      ? snapshotRaw
      : JSON.stringify({
          buffer: Array.from(
            { length: CIRCULAR_QUEUE_DEFAULT_CAPACITY },
            () => null,
          ),
          front: 0,
          rear: 0,
          size: 0,
          capacity: CIRCULAR_QUEUE_DEFAULT_CAPACITY,
        }),
  )
  const phase = readPhase(meta)
  const result = readString(meta, 'result')
  const wrapped = readBoolean(meta, 'wrapped')
  const frontIdx = isEmpty(snapshot) ? -1 : snapshot.front
  const rearIdx = isEmpty(snapshot) ? -1 : snapshot.rear
  const insertIdx = readNumber(meta, 'nextInsertIndex') ?? -1
  const removeIdx = readNumber(meta, 'nextRemoveIndex') ?? -1
  const pendingOperand =
    phase === 'create-element' ? readNumber(meta, 'operand') : null
  const leavingValue =
    phase === 'focus-front' || phase === 'dequeue' || phase === 'wrap-front'
      ? readNumber(meta, 'leavingValue')
      : null
  const empty = isEmpty(snapshot)
  const full = isFull(snapshot)

  return (
    <div className={cn('mb-4 space-y-3', className)}>
      <div
        className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-muted/20 sm:p-4"
        aria-label="Circular queue visualization"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
            Circular Queue (ring buffer)
          </p>
          <p className="text-[0.65rem] text-muted-foreground">
            size {snapshot.size} / capacity {snapshot.capacity}
            {empty ? ' · empty' : ''}
            {full ? ' · full' : ''}
            {wrapped ? ' · wraparound' : ''}
          </p>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="relative mx-auto aspect-square w-full max-w-[20rem]">
            <div
              className="absolute inset-[18%] rounded-full border border-dashed border-border/80"
              aria-hidden="true"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-md border border-border bg-surface/80 px-3 py-2 text-center shadow-sm">
                <p className="font-mono text-xs text-foreground">
                  front={empty ? '—' : snapshot.front}
                </p>
                <p className="font-mono text-xs text-foreground">
                  rear={empty ? '—' : snapshot.rear}
                </p>
                <p className="mt-1 text-[0.65rem] text-muted-foreground">
                  next insert{' '}
                  {insertIdx >= 0 ? insertIdx : '—'}
                  {' · '}
                  next remove{' '}
                  {removeIdx >= 0 ? removeIdx : '—'}
                </p>
              </div>
            </div>

            <div
              className="absolute inset-0"
              role="list"
              aria-label={`Circular buffer with capacity ${snapshot.capacity}`}
            >
            {snapshot.buffer.map((value, index) => {
              const occupied = value !== null
              const state = resolveSlotState(
                index,
                meta,
                frontIdx,
                rearIdx,
                insertIdx,
                occupied,
              )
              const pos = slotPosition(index, snapshot.capacity)
              const isFront = index === frontIdx
              const isRear = index === rearIdx
              const isInsert = index === insertIdx && insertIdx >= 0
              const isEntering =
                occupied &&
                isRear &&
                (phase === 'enqueue' ||
                  phase === 'create-element' ||
                  phase === 'wrap-rear')
              const isLeaving =
                (isFront && phase === 'focus-front') ||
                (leavingValue !== null &&
                  index === readNumber(meta, 'activeIndex') &&
                  phase === 'dequeue')

              return (
                <div
                  key={`ring-${index}`}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={pos}
                >
                  <div
                    role="listitem"
                    className={cn(
                      'relative flex h-12 w-12 flex-col items-center justify-center rounded-md border',
                      'font-mono text-xs font-semibold transition-theme sm:h-14 sm:w-14 sm:text-sm',
                      occupied
                        ? elementStateClasses[state]
                        : 'border-dashed border-border bg-muted/50 text-muted-foreground',
                      isEntering
                        ? 'motion-safe:animate-[queue-enter_420ms_ease-out]'
                        : null,
                      isLeaving
                        ? 'motion-safe:animate-[queue-leave_420ms_ease-in]'
                        : null,
                      wrapped &&
                        (phase === 'wrap-rear' || phase === 'wrap-front') &&
                        index === (activeIndexSafe(meta) ?? -1)
                        ? 'motion-safe:animate-[circular-wrap_520ms_ease-out]'
                        : null,
                    )}
                    aria-label={
                      occupied
                        ? `Index ${index}, value ${value}${isFront ? ', front' : ''}${isRear ? ', rear' : ''}`
                        : `Index ${index}, empty${isInsert ? ', next insertion' : ''}`
                    }
                  >
                    <span className="text-[0.55rem] font-medium text-muted-foreground">
                      [{index}]
                    </span>
                    <span>{occupied ? value : '·'}</span>
                    {pendingOperand !== null && index === insertIdx ? (
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.55rem] text-sky-700 dark:text-sky-300">
                        +{pendingOperand}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 flex min-h-4 flex-col items-center text-[0.55rem] font-medium tracking-wide text-primary">
                    {isFront && isRear ? (
                      <span>front/rear</span>
                    ) : (
                      <>
                        {isFront ? <span>front</span> : null}
                        {isRear ? <span>rear</span> : null}
                      </>
                    )}
                    {!occupied && isInsert ? <span>next</span> : null}
                  </div>
                </div>
              )
            })}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
                Linear buffer view
              </p>
              <p className="mt-1 text-[0.65rem] text-muted-foreground">
                Same slots left-to-right. After index {snapshot.capacity - 1},
                the next index wraps to 0.
              </p>
              <div
                className="mt-3 flex flex-wrap items-stretch gap-1.5"
                role="list"
                aria-label={`Buffer with capacity ${snapshot.capacity}`}
              >
                {snapshot.buffer.map((value, index) => {
                  const occupied = value !== null
                  const state = resolveSlotState(
                    index,
                    meta,
                    frontIdx,
                    rearIdx,
                    insertIdx,
                    occupied,
                  )
                  const isFront = index === frontIdx
                  const isRear = index === rearIdx
                  return (
                    <div
                      key={`row-${index}`}
                      role="listitem"
                      className={cn(
                        'relative flex min-w-12 flex-1 flex-col items-center justify-center rounded-md border px-2 py-2',
                        'font-mono text-xs font-semibold sm:min-w-14',
                        occupied
                          ? elementStateClasses[state]
                          : 'border-dashed border-border bg-muted/50 text-muted-foreground',
                      )}
                    >
                      <span className="text-[0.55rem] text-muted-foreground">
                        [{index}]
                      </span>
                      <span>{occupied ? value : '·'}</span>
                      <span className="mt-1 min-h-3 text-[0.55rem] font-medium tracking-wide text-primary">
                        {isFront && isRear
                          ? 'F/R'
                          : isFront
                            ? 'F'
                            : isRear
                              ? 'R'
                              : index === insertIdx && insertIdx >= 0
                                ? 'N'
                                : ''}
                      </span>
                    </div>
                  )
                })}
              </div>
              <p className="mt-2 text-center text-[0.65rem] text-muted-foreground">
                wrap → index 0
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[0.7rem] sm:grid-cols-4">
              <StatChip label="Front" value={empty ? '—' : String(snapshot.front)} />
              <StatChip label="Rear" value={empty ? '—' : String(snapshot.rear)} />
              <StatChip label="Size" value={String(snapshot.size)} />
              <StatChip label="Capacity" value={String(snapshot.capacity)} />
            </div>

            {(empty || full || wrapped) && (
              <div
                className={cn(
                  'rounded-lg border px-3 py-2 text-body-sm',
                  full
                    ? 'border-rose-500/30 bg-rose-500/10 text-rose-950 dark:text-rose-100'
                    : empty
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100'
                      : 'border-sky-500/30 bg-sky-500/10 text-sky-950 dark:text-sky-100',
                )}
                role="status"
              >
                {full
                  ? 'Full: size === capacity. Enqueue is blocked until a dequeue frees a slot.'
                  : empty
                    ? 'Empty: size === 0. Front/rear placeholders are 0 until the first enqueue.'
                    : 'Wraparound: the next index after the last slot returns to 0.'}
              </div>
            )}
          </div>
        </div>

        {result !== null ? (
          <p
            className="mt-3 text-center font-mono text-body-sm text-muted-foreground"
            aria-live="polite"
          >
            Result: <span className="text-foreground">{result}</span>
          </p>
        ) : null}
      </div>
    </div>
  )
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface/70 px-2 py-1.5 text-center">
      <p className="text-label text-[0.55rem] tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <p className="font-mono text-sm text-foreground">{value}</p>
    </div>
  )
}

function activeIndexSafe(meta: VisualizationStep['meta']): number | null {
  const value = meta?.activeIndex
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}
