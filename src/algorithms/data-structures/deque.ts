/**
 * Deque (Double-Ended Queue) — circular-buffer implementation.
 *
 * Representation: a dynamic ring buffer of length `capacity`, a `front`
 * index (first live element when non-empty), and an explicit `size`.
 * The rear index is derived:
 *
 *   rear = (front + size - 1) % capacity   // when size > 0
 *
 * Insert / remove at either end uses modular arithmetic so both ends are
 * O(1) (amortized O(1) when a resize doubles the buffer). This never uses
 * Array.shift() / Array.unshift() for claimable O(1) end operations.
 *
 * Empty-state convention:
 *   - size === 0 → front = 0 (placeholder); no live rear
 *   - size > 0  → front indexes the first element; rear indexes the last
 *
 * Growth: when size === capacity before an insert, the buffer doubles
 * (amortized O(1)). An individual resize is O(n). Optional `maxCapacity`
 * is an educational hard stop — not a universal property of deques.
 *
 * All helpers return new snapshots so historical visualization frames stay
 * immutable. Independent of React.
 */

/** Immutable snapshot of a circular-buffer deque. */
export type DequeSnapshot = {
  /** Ring buffer; `null` marks an unused slot. */
  readonly buffer: readonly (number | null)[]
  /** Index of the front element when non-empty; `0` placeholder when empty. */
  readonly front: number
  /** Number of live elements currently stored. */
  readonly size: number
  /** Current buffer length (`buffer.length`). */
  readonly capacity: number
  /**
   * Optional educational hard cap on live size. When set, inserts that would
   * exceed it report overflow. Real deques often grow until memory limits.
   */
  readonly maxCapacity: number | null
}

export const DEQUE_DEFAULT_CAPACITY = 8

export const DEQUE_MIN_CAPACITY = 1

export const DEQUE_DEFAULT_VALUES = [10, 20, 30, 40] as const

export const DEQUE_ALT_VALUES = [5, 15, 25] as const

export const DEQUE_SINGLE_VALUE = [42] as const

/** Default educational capacity used in the playground overflow demo. */
export const DEQUE_EDUCATIONAL_MAX_CAPACITY = 5

export const DEQUE_ARRAY_PRESETS = [
  {
    id: 'lesson-default',
    label: 'Lesson deque',
    values: DEQUE_DEFAULT_VALUES,
  },
  {
    id: 'three-mid',
    label: '5 · 15 · 25',
    values: DEQUE_ALT_VALUES,
  },
  {
    id: 'single',
    label: 'Single element',
    values: DEQUE_SINGLE_VALUE,
  },
  {
    id: 'empty',
    label: 'Empty deque',
    values: [] as const,
  },
] as const

export class DequeCapacityError extends Error {
  constructor(capacity: number) {
    super(
      `Deque capacity must be a positive integer (got ${String(capacity)})`,
    )
    this.name = 'DequeCapacityError'
  }
}

function assertValidCapacity(capacity: number): number {
  if (
    !Number.isFinite(capacity) ||
    !Number.isInteger(capacity) ||
    capacity <= 0
  ) {
    throw new DequeCapacityError(capacity)
  }
  return capacity
}

function emptyBuffer(capacity: number): (number | null)[] {
  return Array.from({ length: capacity }, () => null)
}

/** Advance an index one step forward with wraparound. */
export function nextIndex(index: number, capacity: number): number {
  return (index + 1) % capacity
}

/** Move an index one step backward with wraparound. */
export function prevIndex(index: number, capacity: number): number {
  return (index - 1 + capacity) % capacity
}

/**
 * Absolute buffer index of the rear element, or -1 when empty.
 * rear = (front + size - 1) % capacity
 */
export function rearBufferIndex(snapshot: DequeSnapshot): number {
  if (snapshot.size === 0) {
    return -1
  }
  return (snapshot.front + snapshot.size - 1) % snapshot.capacity
}

/** Absolute buffer index of the next pushBack slot (may wrap). */
export function nextPushBackIndex(snapshot: DequeSnapshot): number {
  if (snapshot.size === 0) {
    return 0
  }
  return nextIndex(rearBufferIndex(snapshot), snapshot.capacity)
}

/** Absolute buffer index of the next pushFront slot (may wrap). */
export function nextPushFrontIndex(snapshot: DequeSnapshot): number {
  if (snapshot.size === 0) {
    return 0
  }
  return prevIndex(snapshot.front, snapshot.capacity)
}

/** Build an empty deque with the given initial capacity. */
export function createEmpty(
  capacity: number = DEQUE_DEFAULT_CAPACITY,
  maxCapacity: number | null = null,
): DequeSnapshot {
  const k = assertValidCapacity(capacity)
  return {
    buffer: emptyBuffer(k),
    front: 0,
    size: 0,
    capacity: k,
    maxCapacity,
  }
}

/**
 * Build a snapshot from front→rear logical values.
 * Capacity defaults to max(values.length, DEQUE_DEFAULT_CAPACITY).
 */
export function snapshotFromArray(
  values: readonly number[],
  maxCapacity: number | null = null,
  capacity?: number,
): DequeSnapshot {
  const needed = Math.max(values.length, 1)
  const k = assertValidCapacity(
    capacity ?? Math.max(needed, DEQUE_DEFAULT_CAPACITY),
  )
  if (values.length > k) {
    throw new Error(
      `Cannot fit ${values.length} values into deque capacity ${k}`,
    )
  }
  if (maxCapacity !== null && values.length > maxCapacity) {
    throw new Error(
      `Cannot fit ${values.length} values into educational max capacity ${maxCapacity}`,
    )
  }

  const buffer = emptyBuffer(k)
  for (let i = 0; i < values.length; i += 1) {
    buffer[i] = values[i]!
  }

  return {
    buffer,
    front: 0,
    size: values.length,
    capacity: k,
    maxCapacity,
  }
}

/**
 * Build a snapshot with explicit ring state (wraparound demos / tests).
 */
export function snapshotFromState(options: {
  buffer: readonly (number | null)[]
  front: number
  size: number
  maxCapacity?: number | null
}): DequeSnapshot {
  const capacity = assertValidCapacity(options.buffer.length)
  const size = Math.max(0, Math.min(Math.floor(options.size), capacity))
  const front =
    size === 0
      ? 0
      : ((Math.floor(options.front) % capacity) + capacity) % capacity

  return {
    buffer: [...options.buffer],
    front,
    size,
    capacity,
    maxCapacity: options.maxCapacity ?? null,
  }
}

/** Deep-clone so later frames cannot rewrite history. */
export function cloneSnapshot(snapshot: DequeSnapshot): DequeSnapshot {
  return {
    buffer: [...snapshot.buffer],
    front: snapshot.front,
    size: snapshot.size,
    capacity: snapshot.capacity,
    maxCapacity: snapshot.maxCapacity,
  }
}

/** Front→rear logical array copy. Empty → []. */
export function toArray(snapshot: DequeSnapshot): number[] {
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

/** Logical index of the front in the live array view (0 when non-empty). */
export function frontIndex(snapshot: DequeSnapshot): number {
  return isEmpty(snapshot) ? -1 : 0
}

/** Logical index of the rear in the live array view. */
export function rearIndex(snapshot: DequeSnapshot): number {
  const n = size(snapshot)
  return n === 0 ? -1 : n - 1
}

export function capacity(snapshot: DequeSnapshot): number {
  return snapshot.capacity
}

export function size(snapshot: DequeSnapshot): number {
  return snapshot.size
}

export function isEmpty(snapshot: DequeSnapshot): boolean {
  return snapshot.size === 0
}

export function isFull(snapshot: DequeSnapshot): boolean {
  if (snapshot.maxCapacity !== null) {
    return snapshot.size >= snapshot.maxCapacity
  }
  return false
}

/** True when the ring buffer itself has no free slots (before growth). */
export function isBufferFull(snapshot: DequeSnapshot): boolean {
  return snapshot.size === snapshot.capacity
}

/** Read the front value without removing it. Empty → undefined. */
export function front(snapshot: DequeSnapshot): number | undefined {
  if (isEmpty(snapshot)) {
    return undefined
  }
  const value = snapshot.buffer[snapshot.front]
  return value === null ? undefined : value
}

/** Read the rear (back) value without removing it. Empty → undefined. */
export function back(snapshot: DequeSnapshot): number | undefined {
  if (isEmpty(snapshot)) {
    return undefined
  }
  const index = rearBufferIndex(snapshot)
  const value = snapshot.buffer[index]
  return value === null ? undefined : value
}

/**
 * Grow the ring by at least doubling, re-laying front→rear starting at 0.
 * Honors educational maxCapacity as an upper bound on new capacity.
 */
function grow(snapshot: DequeSnapshot): DequeSnapshot {
  const values = toArray(snapshot)
  let nextCapacity = Math.max(snapshot.capacity * 2, snapshot.capacity + 1)
  if (snapshot.maxCapacity !== null) {
    nextCapacity = Math.min(nextCapacity, snapshot.maxCapacity)
  }
  if (nextCapacity < values.length) {
    nextCapacity = values.length
  }
  if (nextCapacity <= snapshot.capacity) {
    return cloneSnapshot(snapshot)
  }
  return snapshotFromArray(values, snapshot.maxCapacity, nextCapacity)
}

function ensureRoom(snapshot: DequeSnapshot): {
  snapshot: DequeSnapshot
  ok: boolean
  reason?: 'overflow'
  resized: boolean
} {
  if (
    snapshot.maxCapacity !== null &&
    snapshot.size >= snapshot.maxCapacity
  ) {
    return {
      snapshot: cloneSnapshot(snapshot),
      ok: false,
      reason: 'overflow',
      resized: false,
    }
  }

  if (!isBufferFull(snapshot)) {
    return { snapshot, ok: true, resized: false }
  }

  // Need growth; if maxCapacity equals current capacity, overflow.
  if (
    snapshot.maxCapacity !== null &&
    snapshot.capacity >= snapshot.maxCapacity
  ) {
    return {
      snapshot: cloneSnapshot(snapshot),
      ok: false,
      reason: 'overflow',
      resized: false,
    }
  }

  const grown = grow(snapshot)
  if (grown.capacity <= snapshot.capacity || grown.size >= grown.capacity) {
    return {
      snapshot: cloneSnapshot(snapshot),
      ok: false,
      reason: 'overflow',
      resized: false,
    }
  }

  return { snapshot: grown, ok: true, resized: true }
}

export type DequeInsertResult = {
  snapshot: DequeSnapshot
  ok: boolean
  reason?: 'overflow'
  /** Buffer index where the value was written (when ok). */
  writtenIndex?: number
  /** True when the written index wrapped past a buffer edge. */
  wrapped?: boolean
  /** True when the ring was resized before the insert. */
  resized?: boolean
}

/**
 * Insert a value at the front.
 * Amortized O(1); a single resize is O(n).
 */
export function pushFront(
  snapshot: DequeSnapshot,
  value: number,
): DequeInsertResult {
  const room = ensureRoom(snapshot)
  if (!room.ok) {
    return {
      snapshot: room.snapshot,
      ok: false,
      reason: 'overflow',
      resized: room.resized,
    }
  }

  const current = room.snapshot
  const buffer = [...current.buffer]
  let frontIdx: number
  let wrapped = false

  if (isEmpty(current)) {
    frontIdx = 0
    buffer[0] = value
  } else {
    const previousFront = current.front
    frontIdx = prevIndex(previousFront, current.capacity)
    wrapped = previousFront === 0 && frontIdx === current.capacity - 1
    buffer[frontIdx] = value
  }

  return {
    snapshot: {
      buffer,
      front: frontIdx,
      size: current.size + 1,
      capacity: current.capacity,
      maxCapacity: current.maxCapacity,
    },
    ok: true,
    writtenIndex: frontIdx,
    wrapped,
    resized: room.resized,
  }
}

/**
 * Insert a value at the rear (back).
 * Amortized O(1); a single resize is O(n).
 */
export function pushBack(
  snapshot: DequeSnapshot,
  value: number,
): DequeInsertResult {
  const room = ensureRoom(snapshot)
  if (!room.ok) {
    return {
      snapshot: room.snapshot,
      ok: false,
      reason: 'overflow',
      resized: room.resized,
    }
  }

  const current = room.snapshot
  const buffer = [...current.buffer]
  let rearIdx: number
  let wrapped = false

  if (isEmpty(current)) {
    rearIdx = 0
    buffer[0] = value
  } else {
    const previousRear = rearBufferIndex(current)
    rearIdx = nextIndex(previousRear, current.capacity)
    wrapped = previousRear === current.capacity - 1 && rearIdx === 0
    buffer[rearIdx] = value
  }

  return {
    snapshot: {
      buffer,
      front: isEmpty(current) ? 0 : current.front,
      size: current.size + 1,
      capacity: current.capacity,
      maxCapacity: current.maxCapacity,
    },
    ok: true,
    writtenIndex: rearIdx,
    wrapped,
    resized: room.resized,
  }
}

export type DequeRemoveResult = {
  snapshot: DequeSnapshot
  value: number | undefined
  ok: boolean
  reason?: 'underflow'
  /** Buffer index that was cleared (when ok). */
  removedIndex?: number
  /** True when front/rear wrapped across a buffer edge. */
  wrapped?: boolean
}

/**
 * Remove and return the front element.
 * Empty deque → underflow; snapshot unchanged.
 */
export function popFront(snapshot: DequeSnapshot): DequeRemoveResult {
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
        size: 0,
        capacity: snapshot.capacity,
        maxCapacity: snapshot.maxCapacity,
      },
      value,
      ok: true,
      removedIndex,
      wrapped: false,
    }
  }

  const previousFront = snapshot.front
  const nextFront = nextIndex(previousFront, snapshot.capacity)
  const wrapped =
    previousFront === snapshot.capacity - 1 && nextFront === 0

  return {
    snapshot: {
      buffer,
      front: nextFront,
      size: nextSize,
      capacity: snapshot.capacity,
      maxCapacity: snapshot.maxCapacity,
    },
    value,
    ok: true,
    removedIndex,
    wrapped,
  }
}

/**
 * Remove and return the rear (back) element.
 * Empty deque → underflow; snapshot unchanged.
 */
export function popBack(snapshot: DequeSnapshot): DequeRemoveResult {
  if (isEmpty(snapshot)) {
    return {
      snapshot: cloneSnapshot(snapshot),
      value: undefined,
      ok: false,
      reason: 'underflow',
    }
  }

  const removedIndex = rearBufferIndex(snapshot)
  const value = snapshot.buffer[removedIndex]
  if (value === null || value === undefined) {
    return {
      snapshot: cloneSnapshot(snapshot),
      value: undefined,
      ok: false,
      reason: 'underflow',
    }
  }

  const buffer = [...snapshot.buffer]
  buffer[removedIndex] = null

  const nextSize = snapshot.size - 1
  if (nextSize === 0) {
    return {
      snapshot: {
        buffer,
        front: 0,
        size: 0,
        capacity: snapshot.capacity,
        maxCapacity: snapshot.maxCapacity,
      },
      value,
      ok: true,
      removedIndex,
      wrapped: false,
    }
  }

  const previousRear = removedIndex
  const newRear = prevIndex(previousRear, snapshot.capacity)
  const wrapped = previousRear === 0 && newRear === snapshot.capacity - 1

  return {
    snapshot: {
      buffer,
      front: snapshot.front,
      size: nextSize,
      capacity: snapshot.capacity,
      maxCapacity: snapshot.maxCapacity,
    },
    value,
    ok: true,
    removedIndex,
    wrapped,
  }
}

/** Clear all elements; capacity and maxCapacity settings are preserved. */
export function clear(snapshot: DequeSnapshot): DequeSnapshot {
  return createEmpty(snapshot.capacity, snapshot.maxCapacity)
}

/**
 * Relayout live values starting at index 0 (useful after heavy wrap demos).
 * Capacity is preserved.
 */
export function normalize(snapshot: DequeSnapshot): DequeSnapshot {
  return snapshotFromArray(
    toArray(snapshot),
    snapshot.maxCapacity,
    snapshot.capacity,
  )
}

/** Apply or clear an educational max-capacity setting. */
export function withMaxCapacity(
  snapshot: DequeSnapshot,
  maxCapacity: number | null,
): DequeSnapshot {
  const values = toArray(snapshot)
  if (maxCapacity !== null && values.length > maxCapacity) {
    throw new Error(
      `Cannot set educational max capacity ${maxCapacity} below current size ${values.length}`,
    )
  }
  return {
    ...cloneSnapshot(snapshot),
    maxCapacity,
  }
}

/** Format front→rear for status text. */
export function formatDeque(values: readonly number[]): string {
  if (values.length === 0) {
    return '[] (empty)'
  }
  return `[${values.join(', ')}] (front = ${values[0]}, rear = ${values[values.length - 1]})`
}

/** Check core invariants used by tests and the step generator. */
export function assertInvariants(snapshot: DequeSnapshot): void {
  const { buffer, front, size: live, capacity: k, maxCapacity } = snapshot
  if (k <= 0 || buffer.length !== k) {
    throw new Error('capacity / buffer length mismatch')
  }
  if (live < 0 || live > k) {
    throw new Error('size out of range')
  }
  if (front < 0 || front >= k) {
    throw new Error('front out of range')
  }
  if (live === 0 && front !== 0) {
    throw new Error('empty deque must use front = 0')
  }
  if (maxCapacity !== null && live > maxCapacity) {
    throw new Error('size exceeds educational max capacity')
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
