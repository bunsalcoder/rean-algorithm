/**
 * Binary Heap — pure data-structure module.
 *
 * Array-backed complete binary tree with a configurable comparator so the
 * same implementation supports Min Heap and Max Heap. Mutating helpers return
 * new immutable snapshots so visualization history stays scrub-safe.
 * Independent of React.
 */

export type HeapKind = 'min' | 'max'

/** Comparator: return negative when a should be closer to the root than b. */
export type HeapComparator = (a: number, b: number) => number

/** Immutable heap snapshot (level-order array). */
export type HeapSnapshot = {
  readonly values: readonly number[]
  readonly kind: HeapKind
}

export const HEAP_DEFAULT_VALUES = [4, 8, 3, 10, 1] as const

export const HEAP_ALT_VALUES = [5, 2, 9, 1, 7] as const

export const HEAP_SINGLE_VALUE = [42] as const

export const HEAP_WITH_NEGATIVES = [-2, 5, -7, 0, 3] as const

export const HEAP_WITH_DUPLICATES = [4, 2, 4, 1, 2] as const

export const HEAP_ARRAY_PRESETS = [
  {
    id: 'lesson-default',
    label: 'Lesson [4, 8, 3, 10, 1]',
    values: HEAP_DEFAULT_VALUES,
  },
  {
    id: 'alt',
    label: 'Alt [5, 2, 9, 1, 7]',
    values: HEAP_ALT_VALUES,
  },
  {
    id: 'duplicates',
    label: 'Duplicates [4, 2, 4, 1, 2]',
    values: HEAP_WITH_DUPLICATES,
  },
  {
    id: 'negatives',
    label: 'Negatives [-2, 5, -7, 0, 3]',
    values: HEAP_WITH_NEGATIVES,
  },
  {
    id: 'single',
    label: 'Single element',
    values: HEAP_SINGLE_VALUE,
  },
  {
    id: 'empty',
    label: 'Empty heap',
    values: [] as const,
  },
] as const

/** Parent index for zero-based heap arrays. */
export function parentIndex(i: number): number {
  return Math.floor((i - 1) / 2)
}

/** Left child index. */
export function leftChildIndex(i: number): number {
  return 2 * i + 1
}

/** Right child index. */
export function rightChildIndex(i: number): number {
  return 2 * i + 2
}

export function comparatorFor(kind: HeapKind): HeapComparator {
  return kind === 'min' ? (a, b) => a - b : (a, b) => b - a
}

/** True when parent is correctly ordered relative to child for this kind. */
export function respectsHeapOrder(
  parent: number,
  child: number,
  kind: HeapKind,
): boolean {
  return kind === 'min' ? parent <= child : parent >= child
}

/**
 * Verify the heap property for every parent–child pair.
 * Empty / single-element heaps are always valid.
 */
export function isValidHeap(snapshot: HeapSnapshot): boolean {
  const { values, kind } = snapshot
  for (let i = 1; i < values.length; i += 1) {
    const p = parentIndex(i)
    if (!respectsHeapOrder(values[p], values[i], kind)) {
      return false
    }
  }
  return true
}

/** Build a snapshot from level-order values (does not heapify). */
export function snapshotFromArray(
  values: readonly number[],
  kind: HeapKind = 'min',
): HeapSnapshot {
  return {
    values: [...values],
    kind,
  }
}

/** Deep-clone so later frames cannot rewrite history. */
export function cloneSnapshot(snapshot: HeapSnapshot): HeapSnapshot {
  return {
    values: [...snapshot.values],
    kind: snapshot.kind,
  }
}

/** Level-order array copy. */
export function toArray(snapshot: HeapSnapshot): number[] {
  return [...snapshot.values]
}

export function size(snapshot: HeapSnapshot): number {
  return snapshot.values.length
}

export function isEmpty(snapshot: HeapSnapshot): boolean {
  return snapshot.values.length === 0
}

/** Peek at the root without removing it. Empty → undefined. */
export function peek(snapshot: HeapSnapshot): number | undefined {
  if (snapshot.values.length === 0) {
    return undefined
  }
  return snapshot.values[0]
}

export function clear(snapshot: HeapSnapshot): HeapSnapshot {
  return {
    values: [],
    kind: snapshot.kind,
  }
}

/** Switch kind without reordering — caller should rebuild if needed. */
export function withKind(snapshot: HeapSnapshot, kind: HeapKind): HeapSnapshot {
  return {
    values: [...snapshot.values],
    kind,
  }
}

export type InsertResult = {
  snapshot: HeapSnapshot
  /** Index where the value finally settled. */
  finalIndex: number
}

/**
 * Insert a value: append then sift up. O(log n).
 * Supports duplicates, zero, and negatives.
 */
export function insert(snapshot: HeapSnapshot, value: number): InsertResult {
  const compare = comparatorFor(snapshot.kind)
  const values = [...snapshot.values, value]
  let index = values.length - 1

  while (index > 0) {
    const parent = parentIndex(index)
    if (compare(values[index], values[parent]) >= 0) {
      break
    }
    ;[values[index], values[parent]] = [values[parent], values[index]]
    index = parent
  }

  return {
    snapshot: { values, kind: snapshot.kind },
    finalIndex: index,
  }
}

export type ExtractResult = {
  snapshot: HeapSnapshot
  value: number | undefined
  ok: boolean
  reason?: 'underflow'
}

/**
 * Extract the root (min or max depending on kind), move last to root,
 * then sift down. O(log n).
 */
export function extract(snapshot: HeapSnapshot): ExtractResult {
  if (snapshot.values.length === 0) {
    return {
      snapshot: cloneSnapshot(snapshot),
      value: undefined,
      ok: false,
      reason: 'underflow',
    }
  }

  const compare = comparatorFor(snapshot.kind)
  const root = snapshot.values[0]

  if (snapshot.values.length === 1) {
    return {
      snapshot: { values: [], kind: snapshot.kind },
      value: root,
      ok: true,
    }
  }

  // Move last element to root, drop the old last slot, then sift down.
  const last = snapshot.values[snapshot.values.length - 1]
  const next = snapshot.values.slice(0, -1)
  next[0] = last

  siftDown(next, 0, compare)

  return {
    snapshot: { values: next, kind: snapshot.kind },
    value: root,
    ok: true,
  }
}

/**
 * Restore heap property downward from index (heapify / sift-down). O(log n).
 * Returns a new snapshot; does not mutate the input.
 */
export function heapify(
  snapshot: HeapSnapshot,
  index: number,
): HeapSnapshot {
  if (index < 0 || index >= snapshot.values.length) {
    return cloneSnapshot(snapshot)
  }

  const values = [...snapshot.values]
  siftDown(values, index, comparatorFor(snapshot.kind))
  return { values, kind: snapshot.kind }
}

/**
 * Build a heap from an unordered array in O(n) via bottom-up heapify.
 * Starts at the last non-leaf parent ⌊n/2⌋ − 1 and walks toward the root.
 */
export function buildHeap(
  values: readonly number[],
  kind: HeapKind = 'min',
): HeapSnapshot {
  const next = [...values]
  const compare = comparatorFor(kind)
  for (let i = Math.floor(next.length / 2) - 1; i >= 0; i -= 1) {
    siftDown(next, i, compare)
  }
  return { values: next, kind }
}

/**
 * Sift a newly appended value upward (used by step generators).
 * Mutates the working array in place for efficiency during step building;
 * callers clone before recording frames.
 */
export function siftUpInPlace(
  values: number[],
  startIndex: number,
  compare: HeapComparator,
): number {
  let index = startIndex
  while (index > 0) {
    const parent = parentIndex(index)
    if (compare(values[index], values[parent]) >= 0) {
      break
    }
    ;[values[index], values[parent]] = [values[parent], values[index]]
    index = parent
  }
  return index
}

/** Sift downward from index. Mutates `values` in place. */
export function siftDown(
  values: number[],
  startIndex: number,
  compare: HeapComparator,
): void {
  let index = startIndex
  const n = values.length

  while (true) {
    const left = leftChildIndex(index)
    const right = rightChildIndex(index)
    let best = index

    if (left < n && compare(values[left], values[best]) < 0) {
      best = left
    }
    if (right < n && compare(values[right], values[best]) < 0) {
      best = right
    }
    if (best === index) {
      break
    }
    ;[values[index], values[best]] = [values[best], values[index]]
    index = best
  }
}

/** Choose the preferred child for heapify teaching highlights. */
export function preferredChildIndex(
  values: readonly number[],
  index: number,
  kind: HeapKind,
): number | null {
  const left = leftChildIndex(index)
  const right = rightChildIndex(index)
  const n = values.length
  if (left >= n) {
    return null
  }

  const compare = comparatorFor(kind)
  let best = left
  if (right < n && compare(values[right], values[left]) < 0) {
    best = right
  }
  return best
}

export function formatHeap(values: readonly number[], kind: HeapKind): string {
  if (values.length === 0) {
    return `${kind}-heap []`
  }
  return `${kind}-heap [${values.join(', ')}] (root = ${values[0]})`
}

/** Create an empty heap of the given kind. */
export function createEmpty(kind: HeapKind = 'min'): HeapSnapshot {
  return { values: [], kind }
}

/**
 * Build a valid heap from values by inserting one at a time — O(n log n).
 * Useful for contrasting with O(n) buildHeap in tests and lessons.
 */
export function buildHeapByInserts(
  values: readonly number[],
  kind: HeapKind = 'min',
): HeapSnapshot {
  let snapshot = createEmpty(kind)
  for (const value of values) {
    snapshot = insert(snapshot, value).snapshot
  }
  return snapshot
}
