/**
 * Priority Queue — heap-backed abstract data type.
 *
 * Removes elements by priority (not insertion order). Internally a binary heap
 * of {item, priority, sequence} entries. Reuses HeapKind and index formulas
 * from the Heap module; sift logic is specialized for priority + FIFO ties.
 *
 * Immutable snapshots keep visualization history scrub-safe.
 * Independent of React.
 */

import {
  leftChildIndex,
  parentIndex,
  rightChildIndex,
  type HeapKind,
} from './heap'

/** Min = smaller priority number wins; Max = larger priority number wins. */
export type PriorityQueueMode = HeapKind

/** One queued item with its priority and insertion sequence (FIFO ties). */
export type PriorityQueueEntry<T = string> = {
  readonly item: T
  readonly priority: number
  readonly sequence: number
}

/** Immutable priority-queue snapshot (level-order heap array). */
export type PriorityQueueSnapshot<T = string> = {
  readonly entries: readonly PriorityQueueEntry<T>[]
  readonly mode: PriorityQueueMode
  /** Next sequence number to assign on enqueue (monotonic). */
  readonly nextSequence: number
}

export type PriorityQueueSeed<T = string> = {
  readonly item: T
  readonly priority: number
}

/** Sample tasks used by the lesson playground (min-mode: 1 is most urgent). */
export const PRIORITY_QUEUE_SAMPLE_TASKS = [
  { item: 'Fix critical bug', priority: 1 },
  { item: 'Review pull request', priority: 3 },
  { item: 'Update documentation', priority: 5 },
  { item: 'Refactor component', priority: 4 },
] as const satisfies readonly PriorityQueueSeed[]

export const PRIORITY_QUEUE_ALT_TASKS = [
  { item: 'Handle SEV-1 outage', priority: 0 },
  { item: 'Reply to customer', priority: 2 },
  { item: 'Weekly standup notes', priority: 8 },
] as const satisfies readonly PriorityQueueSeed[]

export const PRIORITY_QUEUE_EQUAL_PRIORITY_DEMO = [
  { item: 'Task A (first)', priority: 2 },
  { item: 'Task B (second)', priority: 2 },
  { item: 'Task C (third)', priority: 2 },
] as const satisfies readonly PriorityQueueSeed[]

export const PRIORITY_QUEUE_PRESETS = [
  {
    id: 'lesson-default',
    label: 'Sample tasks',
    seeds: PRIORITY_QUEUE_SAMPLE_TASKS,
  },
  {
    id: 'alt',
    label: 'Ops triage',
    seeds: PRIORITY_QUEUE_ALT_TASKS,
  },
  {
    id: 'equal-priority',
    label: 'Equal priorities (FIFO)',
    seeds: PRIORITY_QUEUE_EQUAL_PRIORITY_DEMO,
  },
  {
    id: 'empty',
    label: 'Empty queue',
    seeds: [] as const,
  },
] as const

/**
 * Comparator: negative when `a` should be closer to the root than `b`.
 * Equal priorities break ties by insertion sequence (FIFO — earlier first).
 */
export function compareEntries<T>(
  a: PriorityQueueEntry<T>,
  b: PriorityQueueEntry<T>,
  mode: PriorityQueueMode,
): number {
  if (a.priority !== b.priority) {
    return mode === 'min' ? a.priority - b.priority : b.priority - a.priority
  }
  return a.sequence - b.sequence
}

/** True when parent is correctly ordered relative to child for this mode. */
export function respectsPriorityOrder<T>(
  parent: PriorityQueueEntry<T>,
  child: PriorityQueueEntry<T>,
  mode: PriorityQueueMode,
): boolean {
  return compareEntries(parent, child, mode) <= 0
}

/**
 * Verify the heap property for every parent–child pair (including FIFO ties).
 * Empty / single-element queues are always valid.
 */
export function isValidPriorityQueue<T>(
  snapshot: PriorityQueueSnapshot<T>,
): boolean {
  const { entries, mode } = snapshot
  for (let i = 1; i < entries.length; i += 1) {
    const p = parentIndex(i)
    if (!respectsPriorityOrder(entries[p], entries[i], mode)) {
      return false
    }
  }
  return true
}

export function createEmpty<T = string>(
  mode: PriorityQueueMode = 'min',
): PriorityQueueSnapshot<T> {
  return {
    entries: [],
    mode,
    nextSequence: 0,
  }
}

/** Deep-clone so later frames cannot rewrite history. */
export function cloneSnapshot<T>(
  snapshot: PriorityQueueSnapshot<T>,
): PriorityQueueSnapshot<T> {
  return {
    entries: snapshot.entries.map((entry) => ({ ...entry })),
    mode: snapshot.mode,
    nextSequence: snapshot.nextSequence,
  }
}

/**
 * Build a queue by enqueueing seeds in order (O(n log n)).
 * Sequence numbers follow seed order for deterministic FIFO demos.
 */
export function fromSeeds<T = string>(
  seeds: readonly PriorityQueueSeed<T>[],
  mode: PriorityQueueMode = 'min',
): PriorityQueueSnapshot<T> {
  let snapshot = createEmpty<T>(mode)
  for (const seed of seeds) {
    snapshot = enqueue(snapshot, seed.item, seed.priority).snapshot
  }
  return snapshot
}

/**
 * Switch mode and rebuild the heap so the new ordering holds.
 * Preserves each entry’s original insertion sequence for stable FIFO ties.
 */
export function withMode<T>(
  snapshot: PriorityQueueSnapshot<T>,
  mode: PriorityQueueMode,
): PriorityQueueSnapshot<T> {
  if (snapshot.mode === mode) {
    return cloneSnapshot(snapshot)
  }

  const ordered = [...snapshot.entries].sort((a, b) => a.sequence - b.sequence)
  const entries: PriorityQueueEntry<T>[] = []
  for (const entry of ordered) {
    entries.push({ ...entry })
    siftUp(entries, entries.length - 1, mode)
  }

  return {
    entries,
    mode,
    nextSequence: snapshot.nextSequence,
  }
}

export function size<T>(snapshot: PriorityQueueSnapshot<T>): number {
  return snapshot.entries.length
}

export function isEmpty<T>(snapshot: PriorityQueueSnapshot<T>): boolean {
  return snapshot.entries.length === 0
}

/** Peek at the next item without removing it. Empty → undefined. */
export function peek<T>(
  snapshot: PriorityQueueSnapshot<T>,
): PriorityQueueEntry<T> | undefined {
  if (snapshot.entries.length === 0) {
    return undefined
  }
  return { ...snapshot.entries[0] }
}

export function clear<T>(
  snapshot: PriorityQueueSnapshot<T>,
): PriorityQueueSnapshot<T> {
  return {
    entries: [],
    mode: snapshot.mode,
    nextSequence: snapshot.nextSequence,
  }
}

/** Level-order copy of entries (item + priority + sequence). */
export function toArray<T>(
  snapshot: PriorityQueueSnapshot<T>,
): PriorityQueueEntry<T>[] {
  return snapshot.entries.map((entry) => ({ ...entry }))
}

export type EnqueueResult<T> = {
  snapshot: PriorityQueueSnapshot<T>
  /** Index where the entry finally settled. */
  finalIndex: number
  entry: PriorityQueueEntry<T>
}

/**
 * Enqueue an item with a priority: append then sift up. O(log n).
 * Supports duplicate priorities, zero, and negatives. Ties use FIFO.
 */
export function enqueue<T>(
  snapshot: PriorityQueueSnapshot<T>,
  item: T,
  priority: number,
): EnqueueResult<T> {
  if (!Number.isFinite(priority)) {
    throw new RangeError('priority must be a finite number')
  }

  const entry: PriorityQueueEntry<T> = {
    item,
    priority,
    sequence: snapshot.nextSequence,
  }
  const entries = [...snapshot.entries, entry]
  const finalIndex = siftUp(entries, entries.length - 1, snapshot.mode)

  return {
    snapshot: {
      entries,
      mode: snapshot.mode,
      nextSequence: snapshot.nextSequence + 1,
    },
    finalIndex,
    entry,
  }
}

export type DequeueResult<T> = {
  snapshot: PriorityQueueSnapshot<T>
  entry: PriorityQueueEntry<T> | undefined
  ok: boolean
  reason?: 'underflow'
}

/**
 * Dequeue the highest-priority entry (min or max depending on mode),
 * move last to root, then sift down. O(log n).
 */
export function dequeue<T>(
  snapshot: PriorityQueueSnapshot<T>,
): DequeueResult<T> {
  if (snapshot.entries.length === 0) {
    return {
      snapshot: cloneSnapshot(snapshot),
      entry: undefined,
      ok: false,
      reason: 'underflow',
    }
  }

  const root = snapshot.entries[0]

  if (snapshot.entries.length === 1) {
    return {
      snapshot: {
        entries: [],
        mode: snapshot.mode,
        nextSequence: snapshot.nextSequence,
      },
      entry: { ...root },
      ok: true,
    }
  }

  const last = snapshot.entries[snapshot.entries.length - 1]
  const next = snapshot.entries.slice(0, -1)
  next[0] = last
  siftDown(next, 0, snapshot.mode)

  return {
    snapshot: {
      entries: next,
      mode: snapshot.mode,
      nextSequence: snapshot.nextSequence,
    },
    entry: { ...root },
    ok: true,
  }
}

/** Format a short human-readable summary for status lines. */
export function formatPriorityQueue<T>(
  snapshot: PriorityQueueSnapshot<T>,
): string {
  const label = snapshot.mode === 'min' ? 'min-PQ' : 'max-PQ'
  if (snapshot.entries.length === 0) {
    return `${label} []`
  }
  const root = snapshot.entries[0]
  const body = snapshot.entries
    .map((entry) => `${String(entry.item)}@${entry.priority}`)
    .join(', ')
  return `${label} [${body}] (next = ${String(root.item)}@${root.priority})`
}

/** Describe which end of the priority scale wins for UI copy. */
export function priorityDirectionLabel(mode: PriorityQueueMode): string {
  return mode === 'min'
    ? 'Smaller number = higher priority (more urgent)'
    : 'Larger number = higher priority'
}

function siftUp<T>(
  entries: PriorityQueueEntry<T>[],
  startIndex: number,
  mode: PriorityQueueMode,
): number {
  let index = startIndex
  while (index > 0) {
    const parent = parentIndex(index)
    if (compareEntries(entries[index], entries[parent], mode) >= 0) {
      break
    }
    ;[entries[index], entries[parent]] = [entries[parent], entries[index]]
    index = parent
  }
  return index
}

function siftDown<T>(
  entries: PriorityQueueEntry<T>[],
  startIndex: number,
  mode: PriorityQueueMode,
): void {
  let index = startIndex
  const n = entries.length

  while (true) {
    const left = leftChildIndex(index)
    const right = rightChildIndex(index)
    let best = index

    if (left < n && compareEntries(entries[left], entries[best], mode) < 0) {
      best = left
    }
    if (right < n && compareEntries(entries[right], entries[best], mode) < 0) {
      best = right
    }
    if (best === index) {
      break
    }
    ;[entries[index], entries[best]] = [entries[best], entries[index]]
    index = best
  }
}

/**
 * Mutable convenience wrapper matching the lesson API surface.
 * Prefer immutable helpers above for visualization and tests.
 */
export class PriorityQueue<T = string> {
  private snapshot: PriorityQueueSnapshot<T>

  constructor(mode: PriorityQueueMode = 'min') {
    this.snapshot = createEmpty(mode)
  }

  get mode(): PriorityQueueMode {
    return this.snapshot.mode
  }

  enqueue(item: T, priority: number): void {
    this.snapshot = enqueue(this.snapshot, item, priority).snapshot
  }

  peek(): PriorityQueueEntry<T> | undefined {
    return peek(this.snapshot)
  }

  dequeue(): PriorityQueueEntry<T> | undefined {
    const result = dequeue(this.snapshot)
    this.snapshot = result.snapshot
    return result.entry
  }

  size(): number {
    return size(this.snapshot)
  }

  isEmpty(): boolean {
    return isEmpty(this.snapshot)
  }

  clear(): void {
    this.snapshot = clear(this.snapshot)
  }

  toArray(): PriorityQueueEntry<T>[] {
    return toArray(this.snapshot)
  }

  /** Snapshot copy for inspectors / tests. */
  toSnapshot(): PriorityQueueSnapshot<T> {
    return cloneSnapshot(this.snapshot)
  }
}

export { parentIndex, leftChildIndex, rightChildIndex }
