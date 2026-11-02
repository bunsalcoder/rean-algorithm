/**
 * Circular Queue — fixed-capacity ring buffer with modulo wraparound.
 *
 * Representation: a fixed array of length `capacity`, plus `front`, `rear`,
 * and an explicit `size` counter. Empty slots store `null`. Wraparound uses:
 *
 *   nextIndex = (currentIndex + 1) % capacity
 *
 * Empty-state convention (documented and tested):
 *   - When `size === 0`, `front === 0` and `rear === 0` are conventional
 *     placeholders — they do not identify a live element.
 *   - When `size > 0`, `front` is the index of the first element and `rear`
 *     is the index of the last element.
 *
 * Full / empty detection uses the size counter (not `front === rear` alone):
 *   - Empty: `size === 0`
 *   - Full:  `size === capacity`
 *
 * Invariants for capacity `k > 0`:
 *   - `0 <= size <= k`
 *   - `buffer.length === k`
 *   - `0 <= front < k` and `0 <= rear < k`
 *
 * All helpers return new snapshots so historical visualization frames stay
 * immutable. Independent of React.
 */

/** Immutable snapshot of a fixed-capacity circular queue. */
export type CircularQueueSnapshot = {
  /** Fixed-length buffer; `null` marks an empty slot. */
  readonly buffer: readonly (number | null)[]
  /** Index of the front element when non-empty; `0` placeholder when empty. */
  readonly front: number
  /** Index of the rear element when non-empty; `0` placeholder when empty. */
  readonly rear: number
  /** Number of live elements currently stored. */
  readonly size: number
  /** Fixed capacity of the ring (`buffer.length`). */
  readonly capacity: number
}

export const CIRCULAR_QUEUE_DEFAULT_CAPACITY = 6

export const CIRCULAR_QUEUE_MIN_CAPACITY = 1

export const CIRCULAR_QUEUE_MAX_CAPACITY = 12

export const CIRCULAR_QUEUE_DEFAULT_VALUES = [10, 20, 30] as const

export const CIRCULAR_QUEUE_ALT_VALUES = [5, 15, 25, 35] as const

export const CIRCULAR_QUEUE_SINGLE_VALUE = [42] as const

export const CIRCULAR_QUEUE_CAPACITY_PRESETS = [1, 4, 6, 8, 12] as const

export const CIRCULAR_QUEUE_ARRAY_PRESETS = [
  {
    id: 'lesson-default',
    label: 'Lesson queue',
    values: CIRCULAR_QUEUE_DEFAULT_VALUES,
  },
  {
    id: 'four-mid',
    label: '5 · 15 · 25 · 35',
    values: CIRCULAR_QUEUE_ALT_VALUES,
  },
  {
    id: 'single',
    label: 'Single element',
    values: CIRCULAR_QUEUE_SINGLE_VALUE,
  },
  {
    id: 'empty',
    label: 'Empty queue',
    values: [] as const,
  },
] as const

export class CircularQueueCapacityError extends Error {
  constructor(capacity: number) {
    super(
      `Circular queue capacity must be a positive integer (got ${String(capacity)})`,
    )
    this.name = 'CircularQueueCapacityError'
  }
}

function assertValidCapacity(capacity: number): number {
  if (
    !Number.isFinite(capacity) ||
    !Number.isInteger(capacity) ||
    capacity <= 0
  ) {
    throw new CircularQueueCapacityError(capacity)
  }
  return capacity
}

function emptyBuffer(capacity: number): (number | null)[] {
  return Array.from({ length: capacity }, () => null)
}

/** Advance an index one step with wraparound. */
export function nextIndex(index: number, capacity: number): number {
  return (index + 1) % capacity
}

/** Build an empty circular queue of the given capacity. */
export function createEmpty(capacity: number): CircularQueueSnapshot {
  const k = assertValidCapacity(capacity)
  return {
    buffer: emptyBuffer(k),
    front: 0,
    rear: 0,
    size: 0,
    capacity: k,
  }
}

/**
 * Build a snapshot from front→rear logical values.
 * Values longer than capacity throw; capacity must be a positive integer.
 */
export function snapshotFromArray(
  values: readonly number[],
  capacity: number = CIRCULAR_QUEUE_DEFAULT_CAPACITY,
): CircularQueueSnapshot {
  const k = assertValidCapacity(capacity)
  if (values.length > k) {
    throw new Error(
      `Cannot fit ${values.length} values into circular queue capacity ${k}`,
    )
  }

  const buffer = emptyBuffer(k)
  for (let i = 0; i < values.length; i += 1) {
    buffer[i] = values[i]!
  }

  if (values.length === 0) {
    return { buffer, front: 0, rear: 0, size: 0, capacity: k }
  }

  return {
    buffer,
    front: 0,
    rear: values.length - 1,
    size: values.length,
    capacity: k,
  }
}

/**
 * Build a snapshot with explicit ring state (for wraparound demos / tests).
 * Validates capacity, size, and that occupied slots match size when possible.
 */
export function snapshotFromState(options: {
  buffer: readonly (number | null)[]
  front: number
  rear: number
  size: number
}): CircularQueueSnapshot {
  const capacity = assertValidCapacity(options.buffer.length)
  const size = Math.max(0, Math.min(Math.floor(options.size), capacity))
  const front =
    capacity === 0
      ? 0
      : ((Math.floor(options.front) % capacity) + capacity) % capacity
  const rear =
    capacity === 0
      ? 0
      : ((Math.floor(options.rear) % capacity) + capacity) % capacity

  return {
    buffer: [...options.buffer],
    front: size === 0 ? 0 : front,
    rear: size === 0 ? 0 : rear,
    size,
    capacity,
  }
}

/** Deep-clone so later frames cannot rewrite history. */
export function cloneSnapshot(
  snapshot: CircularQueueSnapshot,
): CircularQueueSnapshot {
  return {
    buffer: [...snapshot.buffer],
    front: snapshot.front,
    rear: snapshot.rear,
    size: snapshot.size,
    capacity: snapshot.capacity,
  }
}

/** Front→rear logical array copy. Empty queue → []. */
export function toArray(snapshot: CircularQueueSnapshot): number[] {
  if (snapshot.size === 0) {
    return []
  }
  const values: number[] = []
  let index = snapshot.front
  for (let i = 0; i < snapshot.size; i += 1) {
    const value = snapshot.buffer[index]
    if (value !== null && value !== undefined) {
      values.push(value)
    }
    index = nextIndex(index, snapshot.capacity)
  }
  return values
}

export function capacity(snapshot: CircularQueueSnapshot): number {
  return snapshot.capacity
}

export function size(snapshot: CircularQueueSnapshot): number {
  return snapshot.size
}

export function isEmpty(snapshot: CircularQueueSnapshot): boolean {
  return snapshot.size === 0
}

export function isFull(snapshot: CircularQueueSnapshot): boolean {
  return snapshot.size === snapshot.capacity
}

/** Index of the next enqueue slot, or -1 when full. */
export function nextInsertionIndex(snapshot: CircularQueueSnapshot): number {
  if (isFull(snapshot)) {
    return -1
  }
  if (isEmpty(snapshot)) {
    return 0
  }
  return nextIndex(snapshot.rear, snapshot.capacity)
}

/** Index of the next dequeue slot, or -1 when empty. */
export function nextRemovalIndex(snapshot: CircularQueueSnapshot): number {
  return isEmpty(snapshot) ? -1 : snapshot.front
}

/** Read the front value without removing it. Empty → undefined. */
export function front(snapshot: CircularQueueSnapshot): number | undefined {
  if (isEmpty(snapshot)) {
    return undefined
  }
  const value = snapshot.buffer[snapshot.front]
  return value === null ? undefined : value
}

/** Read the rear value without removing it. Empty → undefined. */
export function rear(snapshot: CircularQueueSnapshot): number | undefined {
  if (isEmpty(snapshot)) {
    return undefined
  }
  const value = snapshot.buffer[snapshot.rear]
  return value === null ? undefined : value
}

export type CircularEnqueueResult = {
  snapshot: CircularQueueSnapshot
  ok: boolean
  reason?: 'overflow'
  /** Buffer index where the value was written (when ok). */
  writtenIndex?: number
  /** True when rear wrapped from the last index to 0. */
  wrapped?: boolean
}

/**
 * Enqueue a value at the rear with wraparound.
 * Rejects when full (overflow); snapshot unchanged.
 */
export function enqueue(
  snapshot: CircularQueueSnapshot,
  value: number,
): CircularEnqueueResult {
  if (isFull(snapshot)) {
    return {
      snapshot: cloneSnapshot(snapshot),
      ok: false,
      reason: 'overflow',
    }
  }

  const buffer = [...snapshot.buffer]
  let rear = snapshot.rear
  let wrapped = false

  if (isEmpty(snapshot)) {
    rear = 0
    buffer[0] = value
  } else {
    const previousRear = snapshot.rear
    rear = nextIndex(previousRear, snapshot.capacity)
    wrapped = previousRear === snapshot.capacity - 1 && rear === 0
    buffer[rear] = value
  }

  return {
    snapshot: {
      buffer,
      front: isEmpty(snapshot) ? 0 : snapshot.front,
      rear,
      size: snapshot.size + 1,
      capacity: snapshot.capacity,
    },
    ok: true,
    writtenIndex: rear,
    wrapped,
  }
}

export type CircularDequeueResult = {
  snapshot: CircularQueueSnapshot
  value: number | undefined
  ok: boolean
  reason?: 'underflow'
  /** Buffer index that was cleared (when ok). */
  removedIndex?: number
  /** True when front wrapped from the last index to 0. */
  wrapped?: boolean
}

/**
 * Remove and return the front element, advancing front with wraparound.
 * Empty queue → underflow; snapshot unchanged.
 */
export function dequeue(
  snapshot: CircularQueueSnapshot,
): CircularDequeueResult {
  if (isEmpty(snapshot)) {
    return {
      snapshot: cloneSnapshot(snapshot),
      value: undefined,
      ok: false,
      reason: 'underflow',
    }
  }

  const value = snapshot.buffer[snapshot.front]
  if (value === null || value === undefined) {
    return {
      snapshot: cloneSnapshot(snapshot),
      value: undefined,
      ok: false,
      reason: 'underflow',
    }
  }

  const buffer = [...snapshot.buffer]
  const removedIndex = snapshot.front
  buffer[removedIndex] = null

  const nextSize = snapshot.size - 1
  if (nextSize === 0) {
    return {
      snapshot: {
        buffer,
        front: 0,
        rear: 0,
        size: 0,
        capacity: snapshot.capacity,
      },
      value,
      ok: true,
      removedIndex,
      wrapped: false,
    }
  }

  const previousFront = snapshot.front
  const nextFront = nextIndex(previousFront, snapshot.capacity)
  const wrapped = previousFront === snapshot.capacity - 1 && nextFront === 0

  return {
    snapshot: {
      buffer,
      front: nextFront,
      rear: snapshot.rear,
      size: nextSize,
      capacity: snapshot.capacity,
    },
    value,
    ok: true,
    removedIndex,
    wrapped,
  }
}

/** Clear all elements; capacity is preserved. */
export function clear(snapshot: CircularQueueSnapshot): CircularQueueSnapshot {
  return createEmpty(snapshot.capacity)
}

/**
 * Resize capacity. Live front→rear values are re-laid starting at index 0.
 * Throws if the new capacity is invalid or smaller than the current size.
 */
export function withCapacity(
  snapshot: CircularQueueSnapshot,
  newCapacity: number,
): CircularQueueSnapshot {
  const values = toArray(snapshot)
  return snapshotFromArray(values, newCapacity)
}

/** Format front→rear for status text. */
export function formatCircularQueue(values: readonly number[]): string {
  if (values.length === 0) {
    return '[] (empty)'
  }
  return `[${values.join(', ')}] (front = ${values[0]}, rear = ${values[values.length - 1]})`
}

/** Check core invariants used by tests and the step generator. */
export function assertInvariants(snapshot: CircularQueueSnapshot): void {
  const { buffer, front, rear, size: live, capacity: k } = snapshot
  if (k <= 0 || buffer.length !== k) {
    throw new Error('capacity / buffer length mismatch')
  }
  if (live < 0 || live > k) {
    throw new Error('size out of range')
  }
  if (front < 0 || front >= k || rear < 0 || rear >= k) {
    throw new Error('front/rear out of range')
  }
  if (live === 0 && (front !== 0 || rear !== 0)) {
    throw new Error('empty queue must use front = rear = 0')
  }

  let occupied = 0
  for (const slot of buffer) {
    if (slot !== null) {
      occupied += 1
    }
  }
  if (occupied !== live) {
    throw new Error('occupied slots do not match size')
  }
}
