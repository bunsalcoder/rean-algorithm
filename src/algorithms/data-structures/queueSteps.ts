/**
 * Step generator for Queue visualization.
 *
 * Each step embeds an immutable `queueSnapshot` so previous/next scrubbing
 * never mutates historical frames. Pure data — no React.
 */

import type { VisualizationStep } from '../../components/visualizations/types'
import { formatArray } from '../../components/visualizations/utils'
import {
  cloneSnapshot,
  dequeue as queueDequeue,
  enqueue as queueEnqueue,
  formatQueue,
  front as queueFront,
  frontIndex,
  isEmpty as queueIsEmpty,
  rear as queueRear,
  rearIndex,
  size as queueSize,
  snapshotFromArray,
  toArray,
  type QueueSnapshot,
} from './queue'

export type QueueOperation =
  | 'enqueue'
  | 'dequeue'
  | 'front'
  | 'rear'
  | 'is-empty'
  | 'size'

export type QueuePhase =
  | 'initialize'
  | 'focus-front'
  | 'focus-rear'
  | 'create-element'
  | 'enqueue'
  | 'dequeue'
  | 'front'
  | 'rear'
  | 'check-empty'
  | 'report-size'
  | 'underflow'
  | 'overflow'
  | 'invalid'
  | 'complete'

type StepMetaFields = {
  phase: QueuePhase
  operation: QueueOperation
  queueSnapshot: string
  frontIndex: number
  rearIndex: number
  activeIndex: number | null
  result: string | null
  success: boolean | null
  operand: number | null
  message: string
  educationalCapacity: number | null
  /** Leaving value during dequeue animation (logical front before remove). */
  leavingValue: number | null
}

/** Serialize a snapshot for VisualizationStep.meta. */
export function serializeQueueSnapshot(snapshot: QueueSnapshot): string {
  return JSON.stringify({
    buffer: snapshot.buffer,
    head: snapshot.head,
    maxCapacity: snapshot.maxCapacity,
  })
}

/** Parse a queue snapshot produced by serializeQueueSnapshot. */
export function parseQueueSnapshot(raw: string): QueueSnapshot {
  if (!raw) {
    return { buffer: [], head: 0, maxCapacity: null }
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return { buffer: [], head: 0, maxCapacity: null }
    }

    const record = parsed as Record<string, unknown>
    const maxCapacity =
      typeof record.maxCapacity === 'number' &&
      Number.isFinite(record.maxCapacity) &&
      record.maxCapacity >= 0
        ? record.maxCapacity
        : null

    // Prefer buffer+head; also accept legacy/simple `values` arrays.
    if (Array.isArray(record.buffer)) {
      const buffer: number[] = []
      for (const item of record.buffer) {
        if (typeof item === 'number' && Number.isFinite(item)) {
          buffer.push(item)
        }
      }
      const headRaw = record.head
      const head =
        typeof headRaw === 'number' && Number.isFinite(headRaw)
          ? Math.max(0, Math.min(Math.floor(headRaw), buffer.length))
          : 0
      return { buffer, head, maxCapacity }
    }

    if (Array.isArray(record.values)) {
      const values: number[] = []
      for (const item of record.values) {
        if (typeof item === 'number' && Number.isFinite(item)) {
          values.push(item)
        }
      }
      return { buffer: values, head: 0, maxCapacity }
    }

    return { buffer: [], head: 0, maxCapacity }
  } catch {
    return { buffer: [], head: 0, maxCapacity: null }
  }
}

function meta(fields: StepMetaFields): NonNullable<VisualizationStep['meta']> {
  return {
    phase: fields.phase,
    operation: fields.operation,
    queueSnapshot: fields.queueSnapshot,
    frontIndex: fields.frontIndex,
    rearIndex: fields.rearIndex,
    activeIndex: fields.activeIndex,
    result: fields.result,
    success: fields.success,
    operand: fields.operand,
    message: fields.message,
    educationalCapacity: fields.educationalCapacity,
    leavingValue: fields.leavingValue,
  }
}

function pushStep(
  steps: VisualizationStep[],
  options: {
    id: string
    title: string
    explanation: string
    detail?: string
    snapshot: QueueSnapshot
    phase: QueuePhase
    operation: QueueOperation
    activeIndex?: number | null
    result?: string | null
    success?: boolean | null
    operand?: number | null
    message?: string
    leavingValue?: number | null
    active?: readonly number[]
    highlighted?: readonly number[]
    moving?: readonly number[]
    found?: readonly number[]
    complete?: boolean
  },
): void {
  const snapshot = cloneSnapshot(options.snapshot)
  const array = toArray(snapshot)
  const front = frontIndex(snapshot)
  const rear = rearIndex(snapshot)
  const activeIndex =
    options.activeIndex === undefined
      ? front >= 0
        ? front
        : null
      : options.activeIndex

  const pointers: Array<{ index: number; label: string }> = []
  if (front >= 0) {
    pointers.push({ index: front, label: 'front' })
  }
  if (rear >= 0 && rear !== front) {
    pointers.push({ index: rear, label: 'rear' })
  } else if (rear >= 0 && front === rear) {
    pointers.push({ index: rear, label: 'front/rear' })
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
      queueSnapshot: serializeQueueSnapshot(snapshot),
      frontIndex: front,
      rearIndex: rear,
      activeIndex,
      result: options.result ?? null,
      success: options.success ?? null,
      operand: options.operand ?? null,
      message: options.message ?? options.explanation,
      educationalCapacity: snapshot.maxCapacity,
      leavingValue: options.leavingValue ?? null,
    }),
  })
}

function buildInvalidOperandSteps(
  initial: QueueSnapshot,
  operation: QueueOperation,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  pushStep(steps, {
    id: 'invalid-0',
    title: 'Invalid input',
    explanation:
      'Enter a finite number to enqueue. The queue is unchanged until a valid value is provided.',
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
    explanation: `Queue remains ${formatQueue(toArray(initial))}.`,
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
  initial: QueueSnapshot,
  operand: number,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: QueueOperation = 'enqueue'
  const live = toArray(initial)

  pushStep(steps, {
    id: 'enqueue-init',
    title: 'Start enqueue',
    explanation: `Enqueue ${operand} at the rear. Current queue: ${formatQueue(live)}.`,
    detail:
      initial.maxCapacity !== null
        ? `Educational capacity limit: ${initial.maxCapacity} (configurable demo — not a rule of all queues).`
        : 'Dynamic arrays grow as needed; enqueue is amortized O(1).',
    snapshot: initial,
    phase: 'initialize',
    operation,
    operand,
    activeIndex: rearIndex(initial) >= 0 ? rearIndex(initial) : null,
  })

  if (
    initial.maxCapacity !== null &&
    queueSize(initial) >= initial.maxCapacity
  ) {
    pushStep(steps, {
      id: 'enqueue-overflow',
      title: 'Queue overflow (educational)',
      explanation: `Cannot enqueue ${operand}: size ${queueSize(initial)} already equals the educational max capacity of ${initial.maxCapacity}.`,
      detail:
        'This limit is a teaching knob. Many real queues grow until memory is exhausted; fixed-size circular buffers can overflow.',
      snapshot: initial,
      phase: 'overflow',
      operation,
      operand,
      success: false,
      result: 'overflow',
      message: 'Overflow — enqueue rejected; queue unchanged.',
    })
    pushStep(steps, {
      id: 'enqueue-overflow-done',
      title: 'Enqueue rejected',
      explanation: `Queue still ${formatQueue(live)}. Clear space with dequeue, or raise the educational capacity.`,
      snapshot: initial,
      phase: 'complete',
      operation,
      operand,
      success: false,
      result: 'overflow',
      complete: true,
    })
    return steps
  }

  pushStep(steps, {
    id: 'enqueue-create',
    title: 'Prepare new rear',
    explanation: `Create value ${operand}. It will join at the rear (end of the line).`,
    snapshot: initial,
    phase: 'create-element',
    operation,
    operand,
    activeIndex: null,
    moving: [],
    highlighted: [],
    message: `New element ${operand} ready to enqueue.`,
  })

  const { snapshot: after, ok } = queueEnqueue(initial, operand)
  if (!ok) {
    pushStep(steps, {
      id: 'enqueue-fail',
      title: 'Enqueue failed',
      explanation: 'Enqueue was rejected.',
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

  const newRear = rearIndex(after)
  pushStep(steps, {
    id: 'enqueue-place',
    title: 'Join at the rear',
    explanation: `Append ${operand} at the rear. New rear index = ${newRear}. Front stays ${queueFront(after)}.`,
    snapshot: after,
    phase: 'enqueue',
    operation,
    operand,
    activeIndex: newRear,
    moving: [newRear],
    result: String(operand),
    success: true,
    message: `Enqueued ${operand}.`,
  })

  pushStep(steps, {
    id: 'enqueue-done',
    title: 'Enqueue complete',
    explanation: `Queue is now ${formatQueue(toArray(after))}. FIFO: the next dequeue still removes the front (${queueFront(after)}).`,
    snapshot: after,
    phase: 'complete',
    operation,
    operand,
    activeIndex: newRear,
    found: [newRear],
    result: String(operand),
    success: true,
    complete: true,
  })

  return steps
}

function buildDequeueSteps(initial: QueueSnapshot): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: QueueOperation = 'dequeue'
  const front = frontIndex(initial)
  const live = toArray(initial)

  pushStep(steps, {
    id: 'dequeue-init',
    title: 'Start dequeue',
    explanation: `Remove the front element. Current queue: ${formatQueue(live)}.`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    activeIndex: front >= 0 ? front : null,
  })

  if (queueIsEmpty(initial)) {
    pushStep(steps, {
      id: 'dequeue-underflow',
      title: 'Queue underflow',
      explanation:
        'The queue is empty — there is no front element to remove. Dequeueing would be an underflow error.',
      detail:
        'Always check isEmpty (or handle an empty result) before assuming dequeue succeeds.',
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

  const frontValue = queueFront(initial)!

  pushStep(steps, {
    id: 'dequeue-focus',
    title: 'Focus the front',
    explanation: `Front is ${frontValue} at index ${front}. Dequeue removes only this element (FIFO).`,
    snapshot: initial,
    phase: 'focus-front',
    operation,
    activeIndex: front,
    highlighted: [front],
    leavingValue: frontValue,
  })

  const { snapshot: after, value, ok } = queueDequeue(initial)
  if (!ok || value === undefined) {
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
    title: 'Leave from the front',
    explanation: `Return ${value} and advance the head index (O(1) — no Array.shift). New front is ${queueFront(after) ?? 'none (empty)'}.`,
    snapshot: after,
    phase: 'dequeue',
    operation,
    activeIndex: frontIndex(after) >= 0 ? frontIndex(after) : null,
    moving: frontIndex(after) >= 0 ? [frontIndex(after)] : undefined,
    result: String(value),
    success: true,
    message: `Dequeued ${value}.`,
    leavingValue: value,
  })

  pushStep(steps, {
    id: 'dequeue-done',
    title: 'Dequeue complete',
    explanation: `Returned ${value}. Queue is now ${formatQueue(toArray(after))}.`,
    snapshot: after,
    phase: 'complete',
    operation,
    activeIndex: frontIndex(after) >= 0 ? frontIndex(after) : null,
    found: frontIndex(after) >= 0 ? [frontIndex(after)] : undefined,
    result: String(value),
    success: true,
    complete: true,
  })

  return steps
}

function buildFrontSteps(initial: QueueSnapshot): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: QueueOperation = 'front'
  const front = frontIndex(initial)
  const live = toArray(initial)

  pushStep(steps, {
    id: 'front-init',
    title: 'Start front / peek',
    explanation: `Read the front without removing it. Current queue: ${formatQueue(live)}.`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    activeIndex: front >= 0 ? front : null,
  })

  if (queueIsEmpty(initial)) {
    pushStep(steps, {
      id: 'front-underflow',
      title: 'Nothing at the front',
      explanation:
        'The queue is empty. Front/peek has no value to return — treat this like an underflow / empty result.',
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
      explanation: 'Queue unchanged (still empty). Enqueue before reading the front.',
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

  const frontValue = queueFront(initial)!

  pushStep(steps, {
    id: 'front-focus',
    title: 'Inspect front',
    explanation: `Front value is ${frontValue}. Front/peek does not change size or order.`,
    snapshot: initial,
    phase: 'front',
    operation,
    activeIndex: front,
    highlighted: [front],
    found: [front],
    result: String(frontValue),
    success: true,
    message: `front → ${frontValue}`,
  })

  pushStep(steps, {
    id: 'front-done',
    title: 'Front complete',
    explanation: `Returned ${frontValue}. Queue still ${formatQueue(live)}.`,
    snapshot: initial,
    phase: 'complete',
    operation,
    activeIndex: front,
    found: [front],
    result: String(frontValue),
    success: true,
    complete: true,
  })

  return steps
}

function buildRearSteps(initial: QueueSnapshot): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: QueueOperation = 'rear'
  const rear = rearIndex(initial)
  const live = toArray(initial)

  pushStep(steps, {
    id: 'rear-init',
    title: 'Start rear',
    explanation: `Read the rear without removing it. Current queue: ${formatQueue(live)}.`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    activeIndex: rear >= 0 ? rear : null,
  })

  if (queueIsEmpty(initial)) {
    pushStep(steps, {
      id: 'rear-underflow',
      title: 'Nothing at the rear',
      explanation:
        'The queue is empty. Rear has no value to return — treat this like an underflow / empty result.',
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
      explanation: 'Queue unchanged (still empty). Enqueue before reading the rear.',
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

  const rearValue = queueRear(initial)!

  pushStep(steps, {
    id: 'rear-focus',
    title: 'Inspect rear',
    explanation: `Rear value is ${rearValue}. Reading the rear does not change size or order.`,
    snapshot: initial,
    phase: 'rear',
    operation,
    activeIndex: rear,
    highlighted: [rear],
    found: [rear],
    result: String(rearValue),
    success: true,
    message: `rear → ${rearValue}`,
  })

  pushStep(steps, {
    id: 'rear-done',
    title: 'Rear complete',
    explanation: `Returned ${rearValue}. Queue still ${formatQueue(live)}.`,
    snapshot: initial,
    phase: 'complete',
    operation,
    activeIndex: rear,
    found: [rear],
    result: String(rearValue),
    success: true,
    complete: true,
  })

  return steps
}

function buildIsEmptySteps(initial: QueueSnapshot): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: QueueOperation = 'is-empty'
  const empty = queueIsEmpty(initial)
  const live = toArray(initial)

  pushStep(steps, {
    id: 'empty-init',
    title: 'Check isEmpty',
    explanation: `Ask whether the queue has any elements. Current: ${formatQueue(live)}.`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    activeIndex: frontIndex(initial) >= 0 ? frontIndex(initial) : null,
  })

  pushStep(steps, {
    id: 'empty-check',
    title: empty ? 'Queue is empty' : 'Queue is not empty',
    explanation: empty
      ? 'Size is 0 — isEmpty() returns true. Dequeue, front, and rear would underflow.'
      : `Size is ${queueSize(initial)} — isEmpty() returns false. Front is ${queueFront(initial)}, rear is ${queueRear(initial)}.`,
    snapshot: initial,
    phase: 'check-empty',
    operation,
    activeIndex: frontIndex(initial) >= 0 ? frontIndex(initial) : null,
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

function buildSizeSteps(initial: QueueSnapshot): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: QueueOperation = 'size'
  const n = queueSize(initial)
  const live = toArray(initial)

  pushStep(steps, {
    id: 'size-init',
    title: 'Check size',
    explanation: `Count elements currently in the queue. Current: ${formatQueue(live)}.`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    activeIndex: frontIndex(initial) >= 0 ? frontIndex(initial) : null,
  })

  pushStep(steps, {
    id: 'size-report',
    title: `Size = ${n}`,
    explanation:
      n === 0
        ? 'The queue has 0 elements.'
        : `The queue has ${n} element${n === 1 ? '' : 's'}. Front index = ${frontIndex(initial)}, rear index = ${rearIndex(initial)}.`,
    snapshot: initial,
    phase: 'report-size',
    operation,
    activeIndex: frontIndex(initial) >= 0 ? frontIndex(initial) : null,
    result: String(n),
    success: true,
    message: `size → ${n}`,
  })

  pushStep(steps, {
    id: 'size-done',
    title: 'Size check complete',
    explanation: `size() = ${n}. Queue unchanged.`,
    snapshot: initial,
    phase: 'complete',
    operation,
    result: String(n),
    success: true,
    complete: true,
  })

  return steps
}

/**
 * Build visualization steps for a queue operation.
 *
 * @param values Front→rear queue values (index 0 = front).
 * @param operation Queue operation to animate.
 * @param operand Required for enqueue; ignored otherwise.
 * @param maxCapacity Optional educational capacity (null = unbounded for the demo).
 */
export function buildQueueSteps(
  values: readonly number[],
  operation: QueueOperation,
  operand?: number,
  maxCapacity: number | null = null,
): VisualizationStep[] {
  const initial = snapshotFromArray(values, maxCapacity)

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

  return buildSizeSteps(initial)
}

/** Values from the final step's embedded snapshot (front → rear). */
export function valuesFromFinalStep(
  steps: readonly VisualizationStep[],
): number[] {
  if (steps.length === 0) {
    return []
  }
  const raw = steps[steps.length - 1]?.meta?.queueSnapshot
  if (typeof raw !== 'string') {
    return [...(steps[steps.length - 1]?.array ?? [])]
  }
  return toArray(parseQueueSnapshot(raw))
}

/** Human-readable label for the current operation result meta field. */
export function describeQueueResult(
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
