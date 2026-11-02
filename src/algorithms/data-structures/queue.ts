/**
 * Queue — pure FIFO data-structure module.
 *
 * Representation: a dynamic backing array plus a `head` index that points at
 * the front element. Enqueue appends to the end (amortized O(1)). Dequeue
 * advances `head` in O(1) instead of calling `Array.shift()` (which is O(n)).
 *
 * When the discarded prefix grows large relative to the live length, the
 * snapshot is compacted by slicing off dead slots and resetting `head` to 0
 * so memory does not grow unboundedly. Compaction is O(n) occasionally but
 * amortized O(1) across a long mix of enqueue/dequeue operations.
 *
 * All helpers return new snapshots so historical visualization frames stay
 * immutable. Used by lesson examples, tests, and the step generator.
 */

/** Immutable snapshot of queue contents (head index → rear at buffer end). */
export type QueueSnapshot = {
  /** Backing store; live elements are buffer[head..length). */
  readonly buffer: readonly number[]
  /** Index of the front element within buffer; equals buffer.length when empty. */
  readonly head: number
  /**
   * Optional educational capacity. When set, enqueue may report overflow.
   * Real queues are often unbounded (until memory); this limit is for teaching.
   */
  readonly maxCapacity: number | null
}

export const QUEUE_DEFAULT_VALUES = [10, 20, 30, 40] as const

export const QUEUE_ALT_VALUES = [5, 15, 25] as const

export const QUEUE_SINGLE_VALUE = [42] as const

/** Default educational capacity used in the playground overflow demo. */
export const QUEUE_EDUCATIONAL_MAX_CAPACITY = 5

export const QUEUE_ARRAY_PRESETS = [
  {
    id: 'lesson-default',
    label: 'Lesson queue',
    values: QUEUE_DEFAULT_VALUES,
  },
  {
    id: 'three-mid',
    label: '5 · 15 · 25',
    values: QUEUE_ALT_VALUES,
  },
  {
    id: 'single',
    label: 'Single element',
    values: QUEUE_SINGLE_VALUE,
  },
  {
    id: 'empty',
    label: 'Empty queue',
    values: [] as const,
  },
] as const

/** Compact when discarded prefix is at least as large as the live segment. */
function shouldCompact(head: number, bufferLength: number): boolean {
  const live = bufferLength - head
  return head > 0 && head >= live
}

function compactIfNeeded(
  buffer: readonly number[],
  head: number,
): { buffer: readonly number[]; head: number } {
  if (!shouldCompact(head, buffer.length)) {
    return { buffer, head }
  }
  return {
    buffer: buffer.slice(head),
    head: 0,
  }
}

/** Build a snapshot from front→rear values (index 0 = front). */
export function snapshotFromArray(
  values: readonly number[],
  maxCapacity: number | null = null,
): QueueSnapshot {
  return {
    buffer: [...values],
    head: 0,
    maxCapacity,
  }
}

/**
 * Build a snapshot with an explicit head (for testing wrap / compaction).
 * Live elements are buffer[head..]. Invalid head is clamped into range.
 * Does not auto-compact — call `normalize` or dequeue to reclaim prefix space.
 */
export function snapshotFromBuffer(
  buffer: readonly number[],
  head: number,
  maxCapacity: number | null = null,
): QueueSnapshot {
  const safeHead =
    buffer.length === 0
      ? 0
      : Math.max(0, Math.min(Math.floor(head), buffer.length))
  return {
    buffer: [...buffer],
    head: safeHead,
    maxCapacity,
  }
}

/** Deep-clone so later frames cannot rewrite history. */
export function cloneSnapshot(snapshot: QueueSnapshot): QueueSnapshot {
  return {
    buffer: [...snapshot.buffer],
    head: snapshot.head,
    maxCapacity: snapshot.maxCapacity,
  }
}

/** Front→rear array copy. Empty queue → []. */
export function toArray(snapshot: QueueSnapshot): number[] {
  return snapshot.buffer.slice(snapshot.head)
}

/** Logical index of the front in the live array view (always 0 when non-empty). */
export function frontIndex(snapshot: QueueSnapshot): number {
  return isEmpty(snapshot) ? -1 : 0
}

/** Logical index of the rear in the live array view. */
export function rearIndex(snapshot: QueueSnapshot): number {
  const n = size(snapshot)
  return n === 0 ? -1 : n - 1
}

/** Absolute buffer index of the front element, or -1 when empty. */
export function bufferFrontIndex(snapshot: QueueSnapshot): number {
  return isEmpty(snapshot) ? -1 : snapshot.head
}

/** Absolute buffer index of the rear element, or -1 when empty. */
export function bufferRearIndex(snapshot: QueueSnapshot): number {
  return isEmpty(snapshot) ? -1 : snapshot.buffer.length - 1
}

/** Number of live elements currently in the queue. */
export function size(snapshot: QueueSnapshot): number {
  return snapshot.buffer.length - snapshot.head
}

/** True when the queue has no live elements. */
export function isEmpty(snapshot: QueueSnapshot): boolean {
  return size(snapshot) === 0
}

/** Read the front value without removing it. Empty → undefined. */
export function front(snapshot: QueueSnapshot): number | undefined {
  if (isEmpty(snapshot)) {
    return undefined
  }
  return snapshot.buffer[snapshot.head]
}

/** Read the rear (last) value without removing it. Empty → undefined. */
export function rear(snapshot: QueueSnapshot): number | undefined {
  if (isEmpty(snapshot)) {
    return undefined
  }
  return snapshot.buffer[snapshot.buffer.length - 1]
}

export type EnqueueResult = {
  snapshot: QueueSnapshot
  /** False when educational max capacity would be exceeded. */
  ok: boolean
  reason?: 'overflow'
}

/**
 * Enqueue a value at the rear (end of the buffer).
 * Amortized O(1) for a dynamic array; a single resize can take O(n).
 */
export function enqueue(snapshot: QueueSnapshot, value: number): EnqueueResult {
  if (
    snapshot.maxCapacity !== null &&
    size(snapshot) >= snapshot.maxCapacity
  ) {
    return {
      snapshot: cloneSnapshot(snapshot),
      ok: false,
      reason: 'overflow',
    }
  }

  return {
    snapshot: {
      buffer: [...snapshot.buffer, value],
      head: snapshot.head,
      maxCapacity: snapshot.maxCapacity,
    },
    ok: true,
  }
}

export type DequeueResult = {
  snapshot: QueueSnapshot
  /** Dequeued value when successful. */
  value: number | undefined
  /** False when the queue was empty (underflow). */
  ok: boolean
  reason?: 'underflow'
}

/**
 * Remove and return the front element by advancing `head` (O(1)).
 * May compact the discarded prefix afterward for memory cleanup.
 * Empty queue → underflow.
 */
export function dequeue(snapshot: QueueSnapshot): DequeueResult {
  if (isEmpty(snapshot)) {
    return {
      snapshot: cloneSnapshot(snapshot),
      value: undefined,
      ok: false,
      reason: 'underflow',
    }
  }

  const value = snapshot.buffer[snapshot.head]!
  const nextHead = snapshot.head + 1
  const compacted = compactIfNeeded(snapshot.buffer, nextHead)

  return {
    snapshot: {
      buffer: [...compacted.buffer],
      head: compacted.head,
      maxCapacity: snapshot.maxCapacity,
    },
    value,
    ok: true,
  }
}

/** Clear all elements; capacity setting is preserved. */
export function clear(snapshot: QueueSnapshot): QueueSnapshot {
  return {
    buffer: [],
    head: 0,
    maxCapacity: snapshot.maxCapacity,
  }
}

/**
 * Force head-index normalization (compact dead prefix now).
 * Useful for demos and tests; dequeue already compacts when needed.
 */
export function normalize(snapshot: QueueSnapshot): QueueSnapshot {
  if (snapshot.head === 0) {
    return cloneSnapshot(snapshot)
  }
  return {
    buffer: snapshot.buffer.slice(snapshot.head),
    head: 0,
    maxCapacity: snapshot.maxCapacity,
  }
}

/** Format front→rear for status text, e.g. `[10, 20, 30]` (front = 10). */
export function formatQueue(values: readonly number[]): string {
  if (values.length === 0) {
    return '[] (empty)'
  }
  return `[${values.join(', ')}] (front = ${values[0]}, rear = ${values[values.length - 1]})`
}
