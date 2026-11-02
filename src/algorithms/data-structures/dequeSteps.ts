/**
 * Step generator for Deque visualization.
 *
 * Each step embeds an immutable `dequeSnapshot` so previous/next scrubbing
 * never mutates historical frames. Pure data — no React.
 */

import type { VisualizationStep } from '../../components/visualizations/types'
import { formatArray } from '../../components/visualizations/utils'
import {
  assertInvariants,
  back as dequeBack,
  cloneSnapshot,
  formatDeque,
  front as dequeFront,
  frontIndex,
  isEmpty as dequeIsEmpty,
  popBack as dequePopBack,
  popFront as dequePopFront,
  pushBack as dequePushBack,
  pushFront as dequePushFront,
  rearIndex,
  size as dequeSize,
  snapshotFromArray,
  toArray,
  type DequeSnapshot,
} from './deque'

export type DequeOperation =
  | 'push-front'
  | 'push-back'
  | 'pop-front'
  | 'pop-back'
  | 'front'
  | 'back'
  | 'is-empty'
  | 'size'

export type DequePhase =
  | 'initialize'
  | 'focus-front'
  | 'focus-rear'
  | 'create-element'
  | 'push-front'
  | 'push-back'
  | 'pop-front'
  | 'pop-back'
  | 'front'
  | 'back'
  | 'check-empty'
  | 'report-size'
  | 'underflow'
  | 'overflow'
  | 'invalid'
  | 'complete'

/** Direction of the active end operation for panel annotations. */
export type DequeDirection = 'front' | 'rear' | 'none'

type StepMetaFields = {
  phase: DequePhase
  operation: DequeOperation
  dequeSnapshot: string
  frontIndex: number
  rearIndex: number
  activeIndex: number | null
  result: string | null
  success: boolean | null
  operand: number | null
  message: string
  educationalCapacity: number | null
  leavingValue: number | null
  direction: DequeDirection
  wrapped: boolean
  resized: boolean
}

/** Serialize a snapshot for VisualizationStep.meta. */
export function serializeDequeSnapshot(snapshot: DequeSnapshot): string {
  return JSON.stringify({
    buffer: snapshot.buffer,
    front: snapshot.front,
    size: snapshot.size,
    capacity: snapshot.capacity,
    maxCapacity: snapshot.maxCapacity,
  })
}

/** Parse a deque snapshot produced by serializeDequeSnapshot. */
export function parseDequeSnapshot(raw: string): DequeSnapshot {
  if (!raw) {
    return snapshotFromArray([])
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return snapshotFromArray([])
    }

    const record = parsed as Record<string, unknown>
    const maxCapacity =
      typeof record.maxCapacity === 'number' &&
      Number.isFinite(record.maxCapacity) &&
      record.maxCapacity >= 0
        ? record.maxCapacity
        : null

    if (Array.isArray(record.buffer)) {
      const buffer: (number | null)[] = []
      for (const item of record.buffer) {
        if (item === null) {
          buffer.push(null)
        } else if (typeof item === 'number' && Number.isFinite(item)) {
          buffer.push(item)
        } else {
          buffer.push(null)
        }
      }
      const capacity =
        typeof record.capacity === 'number' &&
        Number.isFinite(record.capacity) &&
        record.capacity > 0
          ? Math.floor(record.capacity)
          : buffer.length || 1
      while (buffer.length < capacity) {
        buffer.push(null)
      }
      const sizeRaw = record.size
      const size =
        typeof sizeRaw === 'number' && Number.isFinite(sizeRaw)
          ? Math.max(0, Math.min(Math.floor(sizeRaw), capacity))
          : 0
      const frontRaw = record.front
      const front =
        size === 0
          ? 0
          : typeof frontRaw === 'number' && Number.isFinite(frontRaw)
            ? ((Math.floor(frontRaw) % capacity) + capacity) % capacity
            : 0
      return {
        buffer: buffer.slice(0, capacity),
        front,
        size,
        capacity,
        maxCapacity,
      }
    }

    if (Array.isArray(record.values)) {
      const values: number[] = []
      for (const item of record.values) {
        if (typeof item === 'number' && Number.isFinite(item)) {
          values.push(item)
        }
      }
      return snapshotFromArray(values, maxCapacity)
    }

    return snapshotFromArray([])
  } catch {
    return snapshotFromArray([])
  }
}

function meta(fields: StepMetaFields): NonNullable<VisualizationStep['meta']> {
  return {
    phase: fields.phase,
    operation: fields.operation,
    dequeSnapshot: fields.dequeSnapshot,
    frontIndex: fields.frontIndex,
    rearIndex: fields.rearIndex,
    activeIndex: fields.activeIndex,
    result: fields.result,
    success: fields.success,
    operand: fields.operand,
    message: fields.message,
    educationalCapacity: fields.educationalCapacity,
    leavingValue: fields.leavingValue,
    direction: fields.direction,
    wrapped: fields.wrapped,
    resized: fields.resized,
  }
}

function pushStep(
  steps: VisualizationStep[],
  options: {
    id: string
    title: string
    explanation: string
    detail?: string
    snapshot: DequeSnapshot
    phase: DequePhase
    operation: DequeOperation
    activeIndex?: number | null
    result?: string | null
    success?: boolean | null
    operand?: number | null
    message?: string
    leavingValue?: number | null
    direction?: DequeDirection
    wrapped?: boolean
    resized?: boolean
    active?: readonly number[]
    highlighted?: readonly number[]
    moving?: readonly number[]
    found?: readonly number[]
    complete?: boolean
  },
): void {
  const snapshot = cloneSnapshot(options.snapshot)
  assertInvariants(snapshot)
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
      dequeSnapshot: serializeDequeSnapshot(snapshot),
      frontIndex: front,
      rearIndex: rear,
      activeIndex,
      result: options.result ?? null,
      success: options.success ?? null,
      operand: options.operand ?? null,
      message: options.message ?? options.explanation,
      educationalCapacity: snapshot.maxCapacity,
      leavingValue: options.leavingValue ?? null,
      direction: options.direction ?? 'none',
      wrapped: options.wrapped ?? false,
      resized: options.resized ?? false,
    }),
  })
}

function buildInvalidOperandSteps(
  initial: DequeSnapshot,
  operation: DequeOperation,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  pushStep(steps, {
    id: 'invalid-0',
    title: 'Invalid input',
    explanation:
      'Enter a finite number to insert. The deque is unchanged until a valid value is provided.',
    snapshot: initial,
    phase: 'invalid',
    operation,
    activeIndex: null,
    success: false,
    result: 'invalid input',
    message: 'Waiting for a valid insert value.',
    direction: operation === 'push-front' ? 'front' : 'rear',
  })
  pushStep(steps, {
    id: 'invalid-done',
    title: 'No change',
    explanation: `Deque remains ${formatDeque(toArray(initial))}.`,
    snapshot: initial,
    phase: 'complete',
    operation,
    activeIndex: null,
    success: false,
    result: 'invalid input',
    complete: true,
    direction: operation === 'push-front' ? 'front' : 'rear',
  })
  return steps
}

function buildPushFrontSteps(
  initial: DequeSnapshot,
  operand: number,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: DequeOperation = 'push-front'
  const live = toArray(initial)

  pushStep(steps, {
    id: 'push-front-init',
    title: 'Start pushFront',
    explanation: `Insert ${operand} at the front. Current deque: ${formatDeque(live)}.`,
    detail:
      initial.maxCapacity !== null
        ? `Educational capacity limit: ${initial.maxCapacity} (configurable demo — not a rule of all deques).`
        : 'Circular buffer grows by doubling when full; pushFront is amortized O(1).',
    snapshot: initial,
    phase: 'initialize',
    operation,
    operand,
    activeIndex: frontIndex(initial) >= 0 ? frontIndex(initial) : null,
    direction: 'front',
  })

  if (
    initial.maxCapacity !== null &&
    dequeSize(initial) >= initial.maxCapacity
  ) {
    pushStep(steps, {
      id: 'push-front-overflow',
      title: 'Deque overflow (educational)',
      explanation: `Cannot pushFront ${operand}: size ${dequeSize(initial)} already equals the educational max capacity of ${initial.maxCapacity}.`,
      detail:
        'This limit is a teaching knob. Real deques typically grow until memory is exhausted.',
      snapshot: initial,
      phase: 'overflow',
      operation,
      operand,
      success: false,
      result: 'overflow',
      message: 'Overflow — pushFront rejected; deque unchanged.',
      direction: 'front',
    })
    pushStep(steps, {
      id: 'push-front-overflow-done',
      title: 'pushFront rejected',
      explanation: `Deque still ${formatDeque(live)}. Clear space with a pop, or raise the educational capacity.`,
      snapshot: initial,
      phase: 'complete',
      operation,
      operand,
      success: false,
      result: 'overflow',
      complete: true,
      direction: 'front',
    })
    return steps
  }

  pushStep(steps, {
    id: 'push-front-create',
    title: 'Prepare new front',
    explanation: `Create value ${operand}. It will enter at the front (left end).`,
    snapshot: initial,
    phase: 'create-element',
    operation,
    operand,
    activeIndex: null,
    moving: [],
    highlighted: [],
    message: `New element ${operand} ready to pushFront.`,
    direction: 'front',
  })

  const result = dequePushFront(initial, operand)
  if (!result.ok) {
    pushStep(steps, {
      id: 'push-front-fail',
      title: 'pushFront failed',
      explanation: 'pushFront was rejected.',
      snapshot: initial,
      phase: 'overflow',
      operation,
      operand,
      success: false,
      result: 'overflow',
      complete: true,
      direction: 'front',
    })
    return steps
  }

  const newFront = frontIndex(result.snapshot)
  const wrapNote = result.wrapped
    ? ' Front index wrapped around the ring buffer.'
    : ''
  const resizeNote = result.resized
    ? ' The ring was resized (O(n) this time; still amortized O(1)).'
    : ''

  pushStep(steps, {
    id: 'push-front-place',
    title: 'Enter at the front',
    explanation: `Write ${operand} at the front. New front = ${dequeFront(result.snapshot)}. Rear stays ${dequeBack(result.snapshot)}.${wrapNote}${resizeNote}`,
    snapshot: result.snapshot,
    phase: 'push-front',
    operation,
    operand,
    activeIndex: newFront,
    moving: [newFront],
    result: String(operand),
    success: true,
    message: `Pushed ${operand} at front.`,
    direction: 'front',
    wrapped: result.wrapped ?? false,
    resized: result.resized ?? false,
  })

  pushStep(steps, {
    id: 'push-front-done',
    title: 'pushFront complete',
    explanation: `Deque is now ${formatDeque(toArray(result.snapshot))}. Both ends remain usable.`,
    snapshot: result.snapshot,
    phase: 'complete',
    operation,
    operand,
    activeIndex: newFront,
    found: [newFront],
    result: String(operand),
    success: true,
    complete: true,
    direction: 'front',
    wrapped: result.wrapped ?? false,
    resized: result.resized ?? false,
  })

  return steps
}

function buildPushBackSteps(
  initial: DequeSnapshot,
  operand: number,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: DequeOperation = 'push-back'
  const live = toArray(initial)

  pushStep(steps, {
    id: 'push-back-init',
    title: 'Start pushBack',
    explanation: `Insert ${operand} at the rear. Current deque: ${formatDeque(live)}.`,
    detail:
      initial.maxCapacity !== null
        ? `Educational capacity limit: ${initial.maxCapacity} (configurable demo — not a rule of all deques).`
        : 'Circular buffer grows by doubling when full; pushBack is amortized O(1).',
    snapshot: initial,
    phase: 'initialize',
    operation,
    operand,
    activeIndex: rearIndex(initial) >= 0 ? rearIndex(initial) : null,
    direction: 'rear',
  })

  if (
    initial.maxCapacity !== null &&
    dequeSize(initial) >= initial.maxCapacity
  ) {
    pushStep(steps, {
      id: 'push-back-overflow',
      title: 'Deque overflow (educational)',
      explanation: `Cannot pushBack ${operand}: size ${dequeSize(initial)} already equals the educational max capacity of ${initial.maxCapacity}.`,
      detail:
        'This limit is a teaching knob. Real deques typically grow until memory is exhausted.',
      snapshot: initial,
      phase: 'overflow',
      operation,
      operand,
      success: false,
      result: 'overflow',
      message: 'Overflow — pushBack rejected; deque unchanged.',
      direction: 'rear',
    })
    pushStep(steps, {
      id: 'push-back-overflow-done',
      title: 'pushBack rejected',
      explanation: `Deque still ${formatDeque(live)}. Clear space with a pop, or raise the educational capacity.`,
      snapshot: initial,
      phase: 'complete',
      operation,
      operand,
      success: false,
      result: 'overflow',
      complete: true,
      direction: 'rear',
    })
    return steps
  }

  pushStep(steps, {
    id: 'push-back-create',
    title: 'Prepare new rear',
    explanation: `Create value ${operand}. It will enter at the rear (right end).`,
    snapshot: initial,
    phase: 'create-element',
    operation,
    operand,
    activeIndex: null,
    moving: [],
    highlighted: [],
    message: `New element ${operand} ready to pushBack.`,
    direction: 'rear',
  })

  const result = dequePushBack(initial, operand)
  if (!result.ok) {
    pushStep(steps, {
      id: 'push-back-fail',
      title: 'pushBack failed',
      explanation: 'pushBack was rejected.',
      snapshot: initial,
      phase: 'overflow',
      operation,
      operand,
      success: false,
      result: 'overflow',
      complete: true,
      direction: 'rear',
    })
    return steps
  }

  const newRear = rearIndex(result.snapshot)
  const wrapNote = result.wrapped
    ? ' Rear index wrapped around the ring buffer.'
    : ''
  const resizeNote = result.resized
    ? ' The ring was resized (O(n) this time; still amortized O(1)).'
    : ''

  pushStep(steps, {
    id: 'push-back-place',
    title: 'Enter at the rear',
    explanation: `Write ${operand} at the rear. New rear = ${dequeBack(result.snapshot)}. Front stays ${dequeFront(result.snapshot)}.${wrapNote}${resizeNote}`,
    snapshot: result.snapshot,
    phase: 'push-back',
    operation,
    operand,
    activeIndex: newRear,
    moving: [newRear],
    result: String(operand),
    success: true,
    message: `Pushed ${operand} at rear.`,
    direction: 'rear',
    wrapped: result.wrapped ?? false,
    resized: result.resized ?? false,
  })

  pushStep(steps, {
    id: 'push-back-done',
    title: 'pushBack complete',
    explanation: `Deque is now ${formatDeque(toArray(result.snapshot))}. Both ends remain usable.`,
    snapshot: result.snapshot,
    phase: 'complete',
    operation,
    operand,
    activeIndex: newRear,
    found: [newRear],
    result: String(operand),
    success: true,
    complete: true,
    direction: 'rear',
    wrapped: result.wrapped ?? false,
    resized: result.resized ?? false,
  })

  return steps
}

function buildPopFrontSteps(initial: DequeSnapshot): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: DequeOperation = 'pop-front'
  const front = frontIndex(initial)
  const live = toArray(initial)

  pushStep(steps, {
    id: 'pop-front-init',
    title: 'Start popFront',
    explanation: `Remove the front element. Current deque: ${formatDeque(live)}.`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    activeIndex: front >= 0 ? front : null,
    direction: 'front',
  })

  if (dequeIsEmpty(initial)) {
    pushStep(steps, {
      id: 'pop-front-underflow',
      title: 'Deque underflow',
      explanation:
        'The deque is empty — there is no front element to remove. popFront would be an underflow error.',
      detail:
        'Always check isEmpty (or handle an empty result) before assuming a pop succeeds.',
      snapshot: initial,
      phase: 'underflow',
      operation,
      success: false,
      result: 'underflow',
      message: 'Underflow — deque unchanged.',
      activeIndex: null,
      direction: 'front',
    })
    pushStep(steps, {
      id: 'pop-front-underflow-done',
      title: 'popFront rejected',
      explanation: 'Deque remains empty. Insert a value before popping.',
      snapshot: initial,
      phase: 'complete',
      operation,
      success: false,
      result: 'underflow',
      complete: true,
      activeIndex: null,
      direction: 'front',
    })
    return steps
  }

  const frontValue = dequeFront(initial)!

  pushStep(steps, {
    id: 'pop-front-focus',
    title: 'Focus the front',
    explanation: `Front is ${frontValue}. popFront removes only this end — the rear is untouched.`,
    snapshot: initial,
    phase: 'focus-front',
    operation,
    activeIndex: front,
    highlighted: [front],
    leavingValue: frontValue,
    direction: 'front',
  })

  const result = dequePopFront(initial)
  if (!result.ok || result.value === undefined) {
    pushStep(steps, {
      id: 'pop-front-fail',
      title: 'popFront failed',
      explanation: 'Unexpected empty deque during popFront.',
      snapshot: initial,
      phase: 'underflow',
      operation,
      success: false,
      result: 'underflow',
      complete: true,
      activeIndex: null,
      direction: 'front',
    })
    return steps
  }

  const wrapNote = result.wrapped
    ? ' Front index wrapped around the ring buffer.'
    : ''

  pushStep(steps, {
    id: 'pop-front-remove',
    title: 'Leave from the front',
    explanation: `Return ${result.value} and advance front with modular wrap.${wrapNote} New front is ${dequeFront(result.snapshot) ?? 'none (empty)'}.`,
    snapshot: result.snapshot,
    phase: 'pop-front',
    operation,
    activeIndex: frontIndex(result.snapshot) >= 0 ? frontIndex(result.snapshot) : null,
    moving:
      frontIndex(result.snapshot) >= 0
        ? [frontIndex(result.snapshot)]
        : undefined,
    result: String(result.value),
    success: true,
    message: `popFront → ${result.value}`,
    leavingValue: result.value,
    direction: 'front',
    wrapped: result.wrapped ?? false,
  })

  pushStep(steps, {
    id: 'pop-front-done',
    title: 'popFront complete',
    explanation: `Returned ${result.value}. Deque is now ${formatDeque(toArray(result.snapshot))}.`,
    snapshot: result.snapshot,
    phase: 'complete',
    operation,
    activeIndex:
      frontIndex(result.snapshot) >= 0 ? frontIndex(result.snapshot) : null,
    found:
      frontIndex(result.snapshot) >= 0
        ? [frontIndex(result.snapshot)]
        : undefined,
    result: String(result.value),
    success: true,
    complete: true,
    direction: 'front',
    wrapped: result.wrapped ?? false,
  })

  return steps
}

function buildPopBackSteps(initial: DequeSnapshot): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: DequeOperation = 'pop-back'
  const rear = rearIndex(initial)
  const live = toArray(initial)

  pushStep(steps, {
    id: 'pop-back-init',
    title: 'Start popBack',
    explanation: `Remove the rear element. Current deque: ${formatDeque(live)}.`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    activeIndex: rear >= 0 ? rear : null,
    direction: 'rear',
  })

  if (dequeIsEmpty(initial)) {
    pushStep(steps, {
      id: 'pop-back-underflow',
      title: 'Deque underflow',
      explanation:
        'The deque is empty — there is no rear element to remove. popBack would be an underflow error.',
      detail:
        'Always check isEmpty (or handle an empty result) before assuming a pop succeeds.',
      snapshot: initial,
      phase: 'underflow',
      operation,
      success: false,
      result: 'underflow',
      message: 'Underflow — deque unchanged.',
      activeIndex: null,
      direction: 'rear',
    })
    pushStep(steps, {
      id: 'pop-back-underflow-done',
      title: 'popBack rejected',
      explanation: 'Deque remains empty. Insert a value before popping.',
      snapshot: initial,
      phase: 'complete',
      operation,
      success: false,
      result: 'underflow',
      complete: true,
      activeIndex: null,
      direction: 'rear',
    })
    return steps
  }

  const rearValue = dequeBack(initial)!

  pushStep(steps, {
    id: 'pop-back-focus',
    title: 'Focus the rear',
    explanation: `Rear is ${rearValue}. popBack removes only this end — the front is untouched.`,
    snapshot: initial,
    phase: 'focus-rear',
    operation,
    activeIndex: rear,
    highlighted: [rear],
    leavingValue: rearValue,
    direction: 'rear',
  })

  const result = dequePopBack(initial)
  if (!result.ok || result.value === undefined) {
    pushStep(steps, {
      id: 'pop-back-fail',
      title: 'popBack failed',
      explanation: 'Unexpected empty deque during popBack.',
      snapshot: initial,
      phase: 'underflow',
      operation,
      success: false,
      result: 'underflow',
      complete: true,
      activeIndex: null,
      direction: 'rear',
    })
    return steps
  }

  const wrapNote = result.wrapped
    ? ' Rear index wrapped around the ring buffer.'
    : ''

  pushStep(steps, {
    id: 'pop-back-remove',
    title: 'Leave from the rear',
    explanation: `Return ${result.value} and retreat the rear with modular wrap.${wrapNote} New rear is ${dequeBack(result.snapshot) ?? 'none (empty)'}.`,
    snapshot: result.snapshot,
    phase: 'pop-back',
    operation,
    activeIndex:
      rearIndex(result.snapshot) >= 0 ? rearIndex(result.snapshot) : null,
    moving:
      rearIndex(result.snapshot) >= 0
        ? [rearIndex(result.snapshot)]
        : undefined,
    result: String(result.value),
    success: true,
    message: `popBack → ${result.value}`,
    leavingValue: result.value,
    direction: 'rear',
    wrapped: result.wrapped ?? false,
  })

  pushStep(steps, {
    id: 'pop-back-done',
    title: 'popBack complete',
    explanation: `Returned ${result.value}. Deque is now ${formatDeque(toArray(result.snapshot))}.`,
    snapshot: result.snapshot,
    phase: 'complete',
    operation,
    activeIndex:
      rearIndex(result.snapshot) >= 0 ? rearIndex(result.snapshot) : null,
    found:
      rearIndex(result.snapshot) >= 0
        ? [rearIndex(result.snapshot)]
        : undefined,
    result: String(result.value),
    success: true,
    complete: true,
    direction: 'rear',
    wrapped: result.wrapped ?? false,
  })

  return steps
}

function buildFrontSteps(initial: DequeSnapshot): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: DequeOperation = 'front'
  const front = frontIndex(initial)
  const live = toArray(initial)

  pushStep(steps, {
    id: 'front-init',
    title: 'Start front / peek',
    explanation: `Read the front without removing it. Current deque: ${formatDeque(live)}.`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    activeIndex: front >= 0 ? front : null,
    direction: 'front',
  })

  if (dequeIsEmpty(initial)) {
    pushStep(steps, {
      id: 'front-underflow',
      title: 'Nothing at the front',
      explanation:
        'The deque is empty. front() has no value to return — treat this like an underflow / empty result.',
      snapshot: initial,
      phase: 'underflow',
      operation,
      success: false,
      result: 'underflow',
      message: 'Empty — front returns nothing.',
      activeIndex: null,
      direction: 'front',
    })
    pushStep(steps, {
      id: 'front-underflow-done',
      title: 'Front complete (empty)',
      explanation: 'Deque unchanged (still empty). Insert before reading the front.',
      snapshot: initial,
      phase: 'complete',
      operation,
      success: false,
      result: 'underflow',
      complete: true,
      activeIndex: null,
      direction: 'front',
    })
    return steps
  }

  const frontValue = dequeFront(initial)!

  pushStep(steps, {
    id: 'front-focus',
    title: 'Inspect front',
    explanation: `Front value is ${frontValue}. front() does not change size or order.`,
    snapshot: initial,
    phase: 'front',
    operation,
    activeIndex: front,
    highlighted: [front],
    found: [front],
    result: String(frontValue),
    success: true,
    message: `front → ${frontValue}`,
    direction: 'front',
  })

  pushStep(steps, {
    id: 'front-done',
    title: 'Front complete',
    explanation: `Returned ${frontValue}. Deque still ${formatDeque(live)}.`,
    snapshot: initial,
    phase: 'complete',
    operation,
    activeIndex: front,
    found: [front],
    result: String(frontValue),
    success: true,
    complete: true,
    direction: 'front',
  })

  return steps
}

function buildBackSteps(initial: DequeSnapshot): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: DequeOperation = 'back'
  const rear = rearIndex(initial)
  const live = toArray(initial)

  pushStep(steps, {
    id: 'back-init',
    title: 'Start back / peek rear',
    explanation: `Read the rear without removing it. Current deque: ${formatDeque(live)}.`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    activeIndex: rear >= 0 ? rear : null,
    direction: 'rear',
  })

  if (dequeIsEmpty(initial)) {
    pushStep(steps, {
      id: 'back-underflow',
      title: 'Nothing at the rear',
      explanation:
        'The deque is empty. back() has no value to return — treat this like an underflow / empty result.',
      snapshot: initial,
      phase: 'underflow',
      operation,
      success: false,
      result: 'underflow',
      message: 'Empty — back returns nothing.',
      activeIndex: null,
      direction: 'rear',
    })
    pushStep(steps, {
      id: 'back-underflow-done',
      title: 'Back complete (empty)',
      explanation: 'Deque unchanged (still empty). Insert before reading the rear.',
      snapshot: initial,
      phase: 'complete',
      operation,
      success: false,
      result: 'underflow',
      complete: true,
      activeIndex: null,
      direction: 'rear',
    })
    return steps
  }

  const backValue = dequeBack(initial)!

  pushStep(steps, {
    id: 'back-focus',
    title: 'Inspect rear',
    explanation: `Rear value is ${backValue}. back() does not change size or order.`,
    snapshot: initial,
    phase: 'back',
    operation,
    activeIndex: rear,
    highlighted: [rear],
    found: [rear],
    result: String(backValue),
    success: true,
    message: `back → ${backValue}`,
    direction: 'rear',
  })

  pushStep(steps, {
    id: 'back-done',
    title: 'Back complete',
    explanation: `Returned ${backValue}. Deque still ${formatDeque(live)}.`,
    snapshot: initial,
    phase: 'complete',
    operation,
    activeIndex: rear,
    found: [rear],
    result: String(backValue),
    success: true,
    complete: true,
    direction: 'rear',
  })

  return steps
}

function buildIsEmptySteps(initial: DequeSnapshot): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: DequeOperation = 'is-empty'
  const empty = dequeIsEmpty(initial)
  const live = toArray(initial)

  pushStep(steps, {
    id: 'empty-init',
    title: 'Check isEmpty',
    explanation: `Ask whether the deque has any elements. Current: ${formatDeque(live)}.`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    activeIndex: frontIndex(initial) >= 0 ? frontIndex(initial) : null,
  })

  pushStep(steps, {
    id: 'empty-check',
    title: empty ? 'Deque is empty' : 'Deque is not empty',
    explanation: empty
      ? 'Size is 0 — isEmpty() returns true. Pops and peeks would underflow.'
      : `Size is ${dequeSize(initial)} — isEmpty() returns false. Front is ${dequeFront(initial)}, rear is ${dequeBack(initial)}.`,
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
    explanation: `isEmpty() = ${empty}. Deque unchanged.`,
    snapshot: initial,
    phase: 'complete',
    operation,
    result: String(empty),
    success: true,
    complete: true,
  })

  return steps
}

function buildSizeSteps(initial: DequeSnapshot): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: DequeOperation = 'size'
  const n = dequeSize(initial)
  const live = toArray(initial)

  pushStep(steps, {
    id: 'size-init',
    title: 'Check size',
    explanation: `Count elements currently in the deque. Current: ${formatDeque(live)}.`,
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
        ? 'The deque has 0 elements.'
        : `The deque has ${n} element${n === 1 ? '' : 's'}. Front index = ${frontIndex(initial)}, rear index = ${rearIndex(initial)}.`,
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
    explanation: `size() = ${n}. Deque unchanged.`,
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
 * Build visualization steps for a deque operation.
 *
 * @param values Front→rear deque values (index 0 = front).
 * @param operation Deque operation to animate.
 * @param operand Required for push-front / push-back; ignored otherwise.
 * @param maxCapacity Optional educational capacity (null = unbounded growth).
 * @param initialSnapshot Optional ring snapshot (preserves wrap state).
 */
export function buildDequeSteps(
  values: readonly number[],
  operation: DequeOperation,
  operand?: number,
  maxCapacity: number | null = null,
  initialSnapshot?: DequeSnapshot,
): VisualizationStep[] {
  const initial =
    initialSnapshot !== undefined
      ? cloneSnapshot(initialSnapshot)
      : snapshotFromArray(values, maxCapacity)

  if (operation === 'push-front') {
    if (operand === undefined || !Number.isFinite(operand)) {
      return buildInvalidOperandSteps(initial, operation)
    }
    return buildPushFrontSteps(initial, operand)
  }

  if (operation === 'push-back') {
    if (operand === undefined || !Number.isFinite(operand)) {
      return buildInvalidOperandSteps(initial, operation)
    }
    return buildPushBackSteps(initial, operand)
  }

  if (operation === 'pop-front') {
    return buildPopFrontSteps(initial)
  }

  if (operation === 'pop-back') {
    return buildPopBackSteps(initial)
  }

  if (operation === 'front') {
    return buildFrontSteps(initial)
  }

  if (operation === 'back') {
    return buildBackSteps(initial)
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
  const raw = steps[steps.length - 1]?.meta?.dequeSnapshot
  if (typeof raw !== 'string') {
    return [...(steps[steps.length - 1]?.array ?? [])]
  }
  return toArray(parseDequeSnapshot(raw))
}

/** Snapshot from the final step's embedded meta. */
export function snapshotFromFinalStep(
  steps: readonly VisualizationStep[],
): DequeSnapshot {
  if (steps.length === 0) {
    return snapshotFromArray([])
  }
  const raw = steps[steps.length - 1]?.meta?.dequeSnapshot
  if (typeof raw !== 'string') {
    return snapshotFromArray(steps[steps.length - 1]?.array ?? [])
  }
  return parseDequeSnapshot(raw)
}

/** Human-readable label for the current operation result meta field. */
export function describeDequeResult(
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
