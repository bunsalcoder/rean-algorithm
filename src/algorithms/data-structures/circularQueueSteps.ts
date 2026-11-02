/**
 * Step generator for Circular Queue visualization.
 *
 * Each step embeds an immutable `circularQueueSnapshot` so previous/next
 * scrubbing never mutates historical frames. Pure data — no React.
 */

import type { VisualizationStep } from '../../components/visualizations/types'
import { formatArray } from '../../components/visualizations/utils'
import {
  CIRCULAR_QUEUE_DEFAULT_CAPACITY,
  cloneSnapshot,
  dequeue as cqDequeue,
  enqueue as cqEnqueue,
  formatCircularQueue,
  front as cqFront,
  isEmpty as cqIsEmpty,
  isFull as cqIsFull,
  nextIndex,
  nextInsertionIndex,
  nextRemovalIndex,
  rear as cqRear,
  size as cqSize,
  snapshotFromArray,
  toArray,
  type CircularQueueSnapshot,
} from './circularQueue'

export type CircularQueueOperation =
  | 'enqueue'
  | 'dequeue'
  | 'front'
  | 'rear'
  | 'is-empty'
  | 'is-full'

export type CircularQueuePhase =
  | 'initialize'
  | 'focus-front'
  | 'focus-rear'
  | 'focus-insert'
  | 'create-element'
  | 'wrap-rear'
  | 'wrap-front'
  | 'enqueue'
  | 'dequeue'
  | 'front'
  | 'rear'
  | 'check-empty'
  | 'check-full'
  | 'underflow'
  | 'overflow'
  | 'invalid'
  | 'complete'

type StepMetaFields = {
  phase: CircularQueuePhase
  operation: CircularQueueOperation
  circularQueueSnapshot: string
  frontIndex: number
  rearIndex: number
  activeIndex: number | null
  nextInsertIndex: number
  nextRemoveIndex: number
  liveSize: number
  capacity: number
  result: string | null
  success: boolean | null
  operand: number | null
  message: string
  leavingValue: number | null
  wrapped: boolean
}

/** Serialize a snapshot for VisualizationStep.meta. */
export function serializeCircularQueueSnapshot(
  snapshot: CircularQueueSnapshot,
): string {
  return JSON.stringify({
    buffer: snapshot.buffer,
    front: snapshot.front,
    rear: snapshot.rear,
    size: snapshot.size,
    capacity: snapshot.capacity,
  })
}

/** Parse a circular queue snapshot produced by serializeCircularQueueSnapshot. */
export function parseCircularQueueSnapshot(
  raw: string,
): CircularQueueSnapshot {
  const fallback: CircularQueueSnapshot = {
    buffer: Array.from(
      { length: CIRCULAR_QUEUE_DEFAULT_CAPACITY },
      () => null,
    ),
    front: 0,
    rear: 0,
    size: 0,
    capacity: CIRCULAR_QUEUE_DEFAULT_CAPACITY,
  }

  if (!raw) {
    return fallback
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return fallback
    }

    const record = parsed as Record<string, unknown>
    const capacityRaw = record.capacity
    const capacity =
      typeof capacityRaw === 'number' &&
      Number.isInteger(capacityRaw) &&
      capacityRaw > 0
        ? capacityRaw
        : CIRCULAR_QUEUE_DEFAULT_CAPACITY

    const buffer: (number | null)[] = Array.from(
      { length: capacity },
      () => null,
    )
    if (Array.isArray(record.buffer)) {
      for (let i = 0; i < capacity && i < record.buffer.length; i += 1) {
        const item = record.buffer[i]
        if (typeof item === 'number' && Number.isFinite(item)) {
          buffer[i] = item
        }
      }
    }

    const sizeRaw = record.size
    let size =
      typeof sizeRaw === 'number' && Number.isFinite(sizeRaw)
        ? Math.max(0, Math.min(Math.floor(sizeRaw), capacity))
        : buffer.filter((slot) => slot !== null).length

    const frontRaw = record.front
    const rearRaw = record.rear
    let front =
      typeof frontRaw === 'number' && Number.isFinite(frontRaw)
        ? ((Math.floor(frontRaw) % capacity) + capacity) % capacity
        : 0
    let rear =
      typeof rearRaw === 'number' && Number.isFinite(rearRaw)
        ? ((Math.floor(rearRaw) % capacity) + capacity) % capacity
        : 0

    if (size === 0) {
      front = 0
      rear = 0
    }

    return { buffer, front, rear, size, capacity }
  } catch {
    return fallback
  }
}

function meta(fields: StepMetaFields): NonNullable<VisualizationStep['meta']> {
  return {
    phase: fields.phase,
    operation: fields.operation,
    circularQueueSnapshot: fields.circularQueueSnapshot,
    frontIndex: fields.frontIndex,
    rearIndex: fields.rearIndex,
    activeIndex: fields.activeIndex,
    nextInsertIndex: fields.nextInsertIndex,
    nextRemoveIndex: fields.nextRemoveIndex,
    liveSize: fields.liveSize,
    capacity: fields.capacity,
    result: fields.result,
    success: fields.success,
    operand: fields.operand,
    message: fields.message,
    leavingValue: fields.leavingValue,
    wrapped: fields.wrapped,
  }
}

function pushStep(
  steps: VisualizationStep[],
  options: {
    id: string
    title: string
    explanation: string
    detail?: string
    snapshot: CircularQueueSnapshot
    phase: CircularQueuePhase
    operation: CircularQueueOperation
    activeIndex?: number | null
    result?: string | null
    success?: boolean | null
    operand?: number | null
    message?: string
    leavingValue?: number | null
    wrapped?: boolean
    active?: readonly number[]
    highlighted?: readonly number[]
    moving?: readonly number[]
    found?: readonly number[]
    complete?: boolean
  },
): void {
  const snapshot = cloneSnapshot(options.snapshot)
  const array = toArray(snapshot)
  const frontIdx = cqIsEmpty(snapshot) ? -1 : snapshot.front
  const rearIdx = cqIsEmpty(snapshot) ? -1 : snapshot.rear
  const insertIdx = nextInsertionIndex(snapshot)
  const removeIdx = nextRemovalIndex(snapshot)
  const activeIndex =
    options.activeIndex === undefined
      ? frontIdx >= 0
        ? frontIdx
        : null
      : options.activeIndex

  const pointers: Array<{ index: number; label: string }> = []
  if (frontIdx >= 0 && rearIdx >= 0 && frontIdx === rearIdx) {
    pointers.push({ index: frontIdx, label: 'front/rear' })
  } else {
    if (frontIdx >= 0) {
      pointers.push({ index: frontIdx, label: 'front' })
    }
    if (rearIdx >= 0) {
      pointers.push({ index: rearIdx, label: 'rear' })
    }
  }
  if (insertIdx >= 0 && insertIdx !== frontIdx && insertIdx !== rearIdx) {
    pointers.push({ index: insertIdx, label: 'next insert' })
  }

  steps.push({
    id: options.id,
    title: options.title,
    explanation: options.explanation,
    detail: options.detail,
    array,
    active: options.active ?? (activeIndex !== null ? [activeIndex] : undefined),
    highlighted: options.highlighted,
    moving: options.moving,
    found: options.found,
    pointers: pointers.length > 0 ? pointers : undefined,
    operation: options.complete ? 'complete' : undefined,
    meta: meta({
      phase: options.phase,
      operation: options.operation,
      circularQueueSnapshot: serializeCircularQueueSnapshot(snapshot),
      frontIndex: frontIdx,
      rearIndex: rearIdx,
      activeIndex,
      nextInsertIndex: insertIdx,
      nextRemoveIndex: removeIdx,
      liveSize: snapshot.size,
      capacity: snapshot.capacity,
      result: options.result ?? null,
      success: options.success ?? null,
      operand: options.operand ?? null,
      message: options.message ?? options.explanation,
      leavingValue: options.leavingValue ?? null,
      wrapped: options.wrapped ?? false,
    }),
  })
}

function buildInvalidOperandSteps(
  initial: CircularQueueSnapshot,
  operation: CircularQueueOperation,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  pushStep(steps, {
    id: 'invalid-0',
    title: 'Invalid input',
    explanation:
      'Enter a finite number to enqueue. The circular queue is unchanged until a valid value is provided.',
    snapshot: initial,
    phase: 'invalid',
    operation,
    activeIndex: null,
    success: false,
    result: 'invalid input',
    message: 'Waiting for a valid enqueue value.',
  })
  pushStep(steps, {
    id: 'invalid-done',
    title: 'No change',
    explanation: `Queue remains ${formatCircularQueue(toArray(initial))}.`,
    snapshot: initial,
    phase: 'complete',
    operation,
    activeIndex: null,
    success: false,
    result: 'invalid input',
    complete: true,
  })
  return steps
}

function buildEnqueueSteps(
  initial: CircularQueueSnapshot,
  operand: number,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: CircularQueueOperation = 'enqueue'
  const live = toArray(initial)
  const insertIdx = nextInsertionIndex(initial)

  pushStep(steps, {
    id: 'enqueue-init',
    title: 'Start enqueue',
    explanation: `Enqueue ${operand} at the rear. Current: ${formatCircularQueue(live)}. size = ${cqSize(initial)} / capacity = ${initial.capacity}.`,
    detail:
      'Circular queues use a fixed buffer. The next insert index is (rear + 1) % capacity when the queue is non-empty.',
    snapshot: initial,
    phase: 'initialize',
    operation,
    operand,
    activeIndex: insertIdx >= 0 ? insertIdx : null,
  })

  if (cqIsFull(initial)) {
    pushStep(steps, {
      id: 'enqueue-overflow',
      title: 'Queue is full',
      explanation: `Cannot enqueue ${operand}: size ${cqSize(initial)} already equals capacity ${initial.capacity}. The ring has no free slot.`,
      detail:
        'Full means size === capacity. Dequeue to free a slot before enqueueing again — wraparound alone does not create space.',
      snapshot: initial,
      phase: 'overflow',
      operation,
      operand,
      success: false,
      result: 'overflow',
      message: 'Overflow — enqueue rejected; queue unchanged.',
      activeIndex: null,
    })
    pushStep(steps, {
      id: 'enqueue-overflow-done',
      title: 'Enqueue rejected',
      explanation: `Queue still ${formatCircularQueue(live)}. Dequeue first, or choose a larger capacity.`,
      snapshot: initial,
      phase: 'complete',
      operation,
      operand,
      success: false,
      result: 'overflow',
      complete: true,
      activeIndex: null,
    })
    return steps
  }

  const willWrap =
    !cqIsEmpty(initial) &&
    initial.rear === initial.capacity - 1 &&
    nextIndex(initial.rear, initial.capacity) === 0

  pushStep(steps, {
    id: 'enqueue-focus-slot',
    title: willWrap ? 'Next slot wraps to 0' : 'Locate next insert slot',
    explanation: willWrap
      ? `Rear is at index ${initial.rear} (last slot). Next insert uses modulo wraparound: (${initial.rear} + 1) % ${initial.capacity} = 0.`
      : cqIsEmpty(initial)
        ? `Queue is empty — the first enqueue writes at index 0 and sets both front and rear to 0.`
        : `Next insertion index = (rear + 1) % capacity = (${initial.rear} + 1) % ${initial.capacity} = ${insertIdx}.`,
    snapshot: initial,
    phase: willWrap ? 'wrap-rear' : 'focus-insert',
    operation,
    operand,
    activeIndex: insertIdx,
    highlighted: insertIdx >= 0 ? [insertIdx] : undefined,
    wrapped: willWrap,
    message: willWrap
      ? 'Wraparound: next rear returns to index 0.'
      : `Insert slot = ${insertIdx}.`,
  })

  pushStep(steps, {
    id: 'enqueue-create',
    title: 'Prepare new rear',
    explanation: `Create value ${operand}. It will occupy buffer[${insertIdx}].`,
    snapshot: initial,
    phase: 'create-element',
    operation,
    operand,
    activeIndex: insertIdx,
    message: `New element ${operand} ready to enqueue at index ${insertIdx}.`,
  })

  const { snapshot: after, ok, writtenIndex, wrapped } = cqEnqueue(
    initial,
    operand,
  )
  if (!ok || writtenIndex === undefined) {
    pushStep(steps, {
      id: 'enqueue-fail',
      title: 'Enqueue failed',
      explanation: 'Enqueue was rejected because the queue is full.',
      snapshot: initial,
      phase: 'overflow',
      operation,
      operand,
      success: false,
      result: 'overflow',
      complete: true,
    })
    return steps
  }

  pushStep(steps, {
    id: 'enqueue-place',
    title: wrapped ? 'Write at wrapped rear' : 'Write at rear',
    explanation: wrapped
      ? `Wrote ${operand} at index 0 after wraparound. New rear = 0, front stays ${after.front}, size = ${after.size}.`
      : `Wrote ${operand} at index ${writtenIndex}. New rear = ${after.rear}, front = ${after.front}, size = ${after.size}.`,
    snapshot: after,
    phase: 'enqueue',
    operation,
    operand,
    activeIndex: writtenIndex,
    moving: [writtenIndex],
    result: String(operand),
    success: true,
    wrapped: Boolean(wrapped),
    message: wrapped
      ? `Enqueued ${operand} with wraparound to index 0.`
      : `Enqueued ${operand} at index ${writtenIndex}.`,
  })

  pushStep(steps, {
    id: 'enqueue-done',
    title: 'Enqueue complete',
    explanation: `Queue is now ${formatCircularQueue(toArray(after))}. Next insert slot = ${nextInsertionIndex(after) >= 0 ? nextInsertionIndex(after) : 'none (full)'}.`,
    snapshot: after,
    phase: 'complete',
    operation,
    operand,
    activeIndex: writtenIndex,
    found: [writtenIndex],
    result: String(operand),
    success: true,
    wrapped: Boolean(wrapped),
    complete: true,
  })

  return steps
}

function buildDequeueSteps(initial: CircularQueueSnapshot): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: CircularQueueOperation = 'dequeue'
  const live = toArray(initial)
  const frontIdx = cqIsEmpty(initial) ? -1 : initial.front

  pushStep(steps, {
    id: 'dequeue-init',
    title: 'Start dequeue',
    explanation: `Remove the front element. Current: ${formatCircularQueue(live)}. size = ${cqSize(initial)} / capacity = ${initial.capacity}.`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    activeIndex: frontIdx >= 0 ? frontIdx : null,
  })

  if (cqIsEmpty(initial)) {
    pushStep(steps, {
      id: 'dequeue-underflow',
      title: 'Queue is empty',
      explanation:
        'Cannot dequeue: size is 0. There is no front element to remove (underflow).',
      detail:
        'Empty means size === 0. Enqueue at least one value before dequeueing.',
      snapshot: initial,
      phase: 'underflow',
      operation,
      success: false,
      result: 'underflow',
      message: 'Underflow — queue unchanged.',
      activeIndex: null,
    })
    pushStep(steps, {
      id: 'dequeue-underflow-done',
      title: 'Dequeue rejected',
      explanation: 'Queue remains empty. Enqueue a value before dequeueing.',
      snapshot: initial,
      phase: 'complete',
      operation,
      success: false,
      result: 'underflow',
      complete: true,
      activeIndex: null,
    })
    return steps
  }

  const frontValue = cqFront(initial)!
  const willWrap =
    initial.size > 1 &&
    initial.front === initial.capacity - 1 &&
    nextIndex(initial.front, initial.capacity) === 0

  pushStep(steps, {
    id: 'dequeue-focus',
    title: 'Focus the front',
    explanation: `Front is ${frontValue} at buffer index ${frontIdx}. Dequeue clears this slot and advances front with modulo wraparound.`,
    snapshot: initial,
    phase: 'focus-front',
    operation,
    activeIndex: frontIdx,
    highlighted: [frontIdx],
    leavingValue: frontValue,
  })

  if (willWrap) {
    pushStep(steps, {
      id: 'dequeue-wrap-preview',
      title: 'Front will wrap to 0',
      explanation: `Front is at the last index (${initial.front}). After removal, next front = (${initial.front} + 1) % ${initial.capacity} = 0.`,
      snapshot: initial,
      phase: 'wrap-front',
      operation,
      activeIndex: frontIdx,
      highlighted: [frontIdx],
      leavingValue: frontValue,
      wrapped: true,
      message: 'Wraparound: next front returns to index 0.',
    })
  }

  const { snapshot: after, value, ok, removedIndex, wrapped } =
    cqDequeue(initial)
  if (!ok || value === undefined || removedIndex === undefined) {
    pushStep(steps, {
      id: 'dequeue-fail',
      title: 'Dequeue failed',
      explanation: 'Unexpected empty queue during dequeue.',
      snapshot: initial,
      phase: 'underflow',
      operation,
      success: false,
      result: 'underflow',
      complete: true,
      activeIndex: null,
    })
    return steps
  }

  pushStep(steps, {
    id: 'dequeue-remove',
    title: wrapped ? 'Remove and wrap front' : 'Remove from the front',
    explanation: wrapped
      ? `Returned ${value}, cleared index ${removedIndex}, and wrapped front to 0. New size = ${after.size}.`
      : after.size === 0
        ? `Returned ${value} and cleared the only element. Front and rear reset to the empty placeholders (0, 0).`
        : `Returned ${value}, cleared index ${removedIndex}, and advanced front to ${after.front}. New size = ${after.size}.`,
    snapshot: after,
    phase: 'dequeue',
    operation,
    activeIndex: after.size > 0 ? after.front : null,
    moving: after.size > 0 ? [after.front] : undefined,
    result: String(value),
    success: true,
    message: `Dequeued ${value}.`,
    leavingValue: value,
    wrapped: Boolean(wrapped),
  })

  pushStep(steps, {
    id: 'dequeue-done',
    title: 'Dequeue complete',
    explanation: `Returned ${value}. Queue is now ${formatCircularQueue(toArray(after))}. Freed slots can be reused on later enqueues.`,
    snapshot: after,
    phase: 'complete',
    operation,
    activeIndex: after.size > 0 ? after.front : null,
    found: after.size > 0 ? [after.front] : undefined,
    result: String(value),
    success: true,
    wrapped: Boolean(wrapped),
    complete: true,
  })

  return steps
}

function buildFrontSteps(initial: CircularQueueSnapshot): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: CircularQueueOperation = 'front'
  const live = toArray(initial)
  const frontIdx = cqIsEmpty(initial) ? -1 : initial.front

  pushStep(steps, {
    id: 'front-init',
    title: 'Start front / peek',
    explanation: `Read the front without removing it. Current: ${formatCircularQueue(live)}.`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    activeIndex: frontIdx >= 0 ? frontIdx : null,
  })

  if (cqIsEmpty(initial)) {
    pushStep(steps, {
      id: 'front-underflow',
      title: 'Nothing at the front',
      explanation:
        'The queue is empty (size === 0). Front/peek has no value to return.',
      snapshot: initial,
      phase: 'underflow',
      operation,
      success: false,
      result: 'underflow',
      message: 'Empty — front returns nothing.',
      activeIndex: null,
    })
    pushStep(steps, {
      id: 'front-underflow-done',
      title: 'Front complete (empty)',
      explanation: 'Queue unchanged (still empty). Enqueue before reading front.',
      snapshot: initial,
      phase: 'complete',
      operation,
      success: false,
      result: 'underflow',
      complete: true,
      activeIndex: null,
    })
    return steps
  }

  const frontValue = cqFront(initial)!

  pushStep(steps, {
    id: 'front-focus',
    title: 'Inspect front',
    explanation: `Front value is ${frontValue} at index ${frontIdx}. Peek does not change size, front, or rear.`,
    snapshot: initial,
    phase: 'front',
    operation,
    activeIndex: frontIdx,
    highlighted: [frontIdx],
    found: [frontIdx],
    result: String(frontValue),
    success: true,
    message: `front → ${frontValue}`,
  })

  pushStep(steps, {
    id: 'front-done',
    title: 'Front complete',
    explanation: `Returned ${frontValue}. Queue still ${formatCircularQueue(live)}.`,
    snapshot: initial,
    phase: 'complete',
    operation,
    activeIndex: frontIdx,
    found: [frontIdx],
    result: String(frontValue),
    success: true,
    complete: true,
  })

  return steps
}

function buildRearSteps(initial: CircularQueueSnapshot): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: CircularQueueOperation = 'rear'
  const live = toArray(initial)
  const rearIdx = cqIsEmpty(initial) ? -1 : initial.rear

  pushStep(steps, {
    id: 'rear-init',
    title: 'Start rear',
    explanation: `Read the rear without removing it. Current: ${formatCircularQueue(live)}.`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    activeIndex: rearIdx >= 0 ? rearIdx : null,
  })

  if (cqIsEmpty(initial)) {
    pushStep(steps, {
      id: 'rear-underflow',
      title: 'Nothing at the rear',
      explanation:
        'The queue is empty (size === 0). Rear has no value to return.',
      snapshot: initial,
      phase: 'underflow',
      operation,
      success: false,
      result: 'underflow',
      message: 'Empty — rear returns nothing.',
      activeIndex: null,
    })
    pushStep(steps, {
      id: 'rear-underflow-done',
      title: 'Rear complete (empty)',
      explanation: 'Queue unchanged (still empty). Enqueue before reading rear.',
      snapshot: initial,
      phase: 'complete',
      operation,
      success: false,
      result: 'underflow',
      complete: true,
      activeIndex: null,
    })
    return steps
  }

  const rearValue = cqRear(initial)!

  pushStep(steps, {
    id: 'rear-focus',
    title: 'Inspect rear',
    explanation: `Rear value is ${rearValue} at index ${rearIdx}. Reading the rear does not change the ring.`,
    snapshot: initial,
    phase: 'rear',
    operation,
    activeIndex: rearIdx,
    highlighted: [rearIdx],
    found: [rearIdx],
    result: String(rearValue),
    success: true,
    message: `rear → ${rearValue}`,
  })

  pushStep(steps, {
    id: 'rear-done',
    title: 'Rear complete',
    explanation: `Returned ${rearValue}. Queue still ${formatCircularQueue(live)}.`,
    snapshot: initial,
    phase: 'complete',
    operation,
    activeIndex: rearIdx,
    found: [rearIdx],
    result: String(rearValue),
    success: true,
    complete: true,
  })

  return steps
}

function buildIsEmptySteps(
  initial: CircularQueueSnapshot,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: CircularQueueOperation = 'is-empty'
  const empty = cqIsEmpty(initial)
  const live = toArray(initial)

  pushStep(steps, {
    id: 'empty-init',
    title: 'Check isEmpty',
    explanation: `Ask whether size === 0. Current: ${formatCircularQueue(live)} (size = ${cqSize(initial)}).`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    activeIndex: cqIsEmpty(initial) ? null : initial.front,
  })

  pushStep(steps, {
    id: 'empty-check',
    title: empty ? 'Queue is empty' : 'Queue is not empty',
    explanation: empty
      ? 'size === 0 — isEmpty() returns true. Dequeue, front, and rear would underflow.'
      : `size === ${cqSize(initial)} — isEmpty() returns false. Front is ${cqFront(initial)} at index ${initial.front}.`,
    snapshot: initial,
    phase: 'check-empty',
    operation,
    activeIndex: cqIsEmpty(initial) ? null : initial.front,
    result: String(empty),
    success: true,
    message: `isEmpty → ${empty}`,
  })

  pushStep(steps, {
    id: 'empty-done',
    title: 'Check complete',
    explanation: `isEmpty() = ${empty}. Queue unchanged.`,
    snapshot: initial,
    phase: 'complete',
    operation,
    result: String(empty),
    success: true,
    complete: true,
  })

  return steps
}

function buildIsFullSteps(initial: CircularQueueSnapshot): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: CircularQueueOperation = 'is-full'
  const full = cqIsFull(initial)
  const live = toArray(initial)

  pushStep(steps, {
    id: 'full-init',
    title: 'Check isFull',
    explanation: `Ask whether size === capacity. Current size = ${cqSize(initial)}, capacity = ${initial.capacity}.`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    activeIndex: cqIsEmpty(initial) ? null : initial.rear,
  })

  pushStep(steps, {
    id: 'full-check',
    title: full ? 'Queue is full' : 'Queue is not full',
    explanation: full
      ? `size === capacity (${initial.capacity}) — isFull() returns true. Enqueue would overflow until a dequeue frees a slot.`
      : `size ${cqSize(initial)} < capacity ${initial.capacity} — isFull() returns false. Next insert index = ${nextInsertionIndex(initial)}. Live values: ${formatCircularQueue(live)}.`,
    snapshot: initial,
    phase: 'check-full',
    operation,
    activeIndex: cqIsEmpty(initial) ? null : initial.rear,
    result: String(full),
    success: true,
    message: `isFull → ${full}`,
  })

  pushStep(steps, {
    id: 'full-done',
    title: 'Check complete',
    explanation: `isFull() = ${full}. Queue unchanged.`,
    snapshot: initial,
    phase: 'complete',
    operation,
    result: String(full),
    success: true,
    complete: true,
  })

  return steps
}

/**
 * Build visualization steps for a circular queue operation.
 *
 * @param values Front→rear logical values (laid contiguously from index 0).
 * @param operation Circular queue operation to animate.
 * @param operand Required for enqueue; ignored otherwise.
 * @param capacity Fixed ring capacity (must be a positive integer).
 * @param initialSnapshot Optional explicit ring state (overrides values layout).
 */
export function buildCircularQueueSteps(
  values: readonly number[],
  operation: CircularQueueOperation,
  operand?: number,
  capacity: number = CIRCULAR_QUEUE_DEFAULT_CAPACITY,
  initialSnapshot?: CircularQueueSnapshot,
): VisualizationStep[] {
  const initial =
    initialSnapshot !== undefined
      ? cloneSnapshot(initialSnapshot)
      : snapshotFromArray(values, capacity)

  if (operation === 'enqueue') {
    if (operand === undefined || !Number.isFinite(operand)) {
      return buildInvalidOperandSteps(initial, operation)
    }
    return buildEnqueueSteps(initial, operand)
  }

  if (operation === 'dequeue') {
    return buildDequeueSteps(initial)
  }

  if (operation === 'front') {
    return buildFrontSteps(initial)
  }

  if (operation === 'rear') {
    return buildRearSteps(initial)
  }

  if (operation === 'is-empty') {
    return buildIsEmptySteps(initial)
  }

  return buildIsFullSteps(initial)
}

/** Logical values from the final step's embedded snapshot (front → rear). */
export function valuesFromFinalStep(
  steps: readonly VisualizationStep[],
): number[] {
  if (steps.length === 0) {
    return []
  }
  const raw = steps[steps.length - 1]?.meta?.circularQueueSnapshot
  if (typeof raw !== 'string') {
    return [...(steps[steps.length - 1]?.array ?? [])]
  }
  return toArray(parseCircularQueueSnapshot(raw))
}

/** Snapshot from the final step. */
export function snapshotFromFinalStep(
  steps: readonly VisualizationStep[],
): CircularQueueSnapshot | null {
  if (steps.length === 0) {
    return null
  }
  const raw = steps[steps.length - 1]?.meta?.circularQueueSnapshot
  if (typeof raw !== 'string') {
    return null
  }
  return parseCircularQueueSnapshot(raw)
}

/** Human-readable label for the current operation result meta field. */
export function describeCircularQueueResult(
  steps: readonly VisualizationStep[],
): string {
  if (steps.length === 0) {
    return ''
  }
  const last = steps[steps.length - 1]!
  const result = last.meta?.result
  if (typeof result === 'string' && result !== '') {
    return result
  }
  return formatArray(last.array ?? [])
}
