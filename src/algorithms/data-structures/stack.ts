/**
 * Stack — pure LIFO data-structure module.
 *
 * Internal representation: a dynamic array where the **last** element is the
 * top of the stack. Push appends; pop removes from the end. All mutating
 * helpers return new arrays so historical visualization snapshots stay
 * immutable. Used by lesson examples, tests, and the step generator.
 */

/** Immutable snapshot of stack contents (bottom → top, last index = top). */
export type StackSnapshot = {
  readonly values: readonly number[]
  /**
   * Optional educational capacity. When set, push may report overflow.
   * Real stacks are often unbounded (until memory); this limit is for teaching.
   */
  readonly maxCapacity: number | null
}

export const STACK_DEFAULT_VALUES = [10, 20, 30] as const

export const STACK_ALT_VALUES = [5, 15, 25] as const

export const STACK_SINGLE_VALUE = [42] as const

/** Default educational capacity used in the playground overflow demo. */
export const STACK_EDUCATIONAL_MAX_CAPACITY = 5

export const STACK_ARRAY_PRESETS = [
  {
    id: 'lesson-default',
    label: 'Lesson stack',
    values: STACK_DEFAULT_VALUES,
  },
  {
    id: 'three-mid',
    label: '5 · 15 · 25',
    values: STACK_ALT_VALUES,
  },
  {
    id: 'single',
    label: 'Single element',
    values: STACK_SINGLE_VALUE,
  },
  {
    id: 'empty',
    label: 'Empty stack',
    values: [] as const,
  },
] as const

/** Build a snapshot from bottom→top values (last element = top). */
export function snapshotFromArray(
  values: readonly number[],
  maxCapacity: number | null = null,
): StackSnapshot {
  return {
    values: [...values],
    maxCapacity,
  }
}

/** Deep-clone so later frames cannot rewrite history. */
export function cloneSnapshot(snapshot: StackSnapshot): StackSnapshot {
  return {
    values: [...snapshot.values],
    maxCapacity: snapshot.maxCapacity,
  }
}

/** Bottom→top array copy. Empty stack → []. */
export function toArray(snapshot: StackSnapshot): number[] {
  return [...snapshot.values]
}

/** Index of the top element, or -1 when empty. */
export function topIndex(snapshot: StackSnapshot): number {
  return snapshot.values.length === 0 ? -1 : snapshot.values.length - 1
}

/** Number of elements currently on the stack. */
export function size(snapshot: StackSnapshot): number {
  return snapshot.values.length
}

/** True when the stack has no elements. */
export function isEmpty(snapshot: StackSnapshot): boolean {
  return snapshot.values.length === 0
}

/** Peek at the top value without removing it. Empty → undefined. */
export function peek(snapshot: StackSnapshot): number | undefined {
  if (snapshot.values.length === 0) {
    return undefined
  }
  return snapshot.values[snapshot.values.length - 1]
}

export type PushResult = {
  snapshot: StackSnapshot
  /** False when educational max capacity would be exceeded. */
  ok: boolean
  reason?: 'overflow'
}

/**
 * Push a value onto the top (end of the array).
 * Amortized O(1) for a dynamic array; a single resize can take O(n).
 */
export function push(snapshot: StackSnapshot, value: number): PushResult {
  if (
    snapshot.maxCapacity !== null &&
    snapshot.values.length >= snapshot.maxCapacity
  ) {
    return {
      snapshot: cloneSnapshot(snapshot),
      ok: false,
      reason: 'overflow',
    }
  }

  return {
    snapshot: {
      values: [...snapshot.values, value],
      maxCapacity: snapshot.maxCapacity,
    },
    ok: true,
  }
}

export type PopResult = {
  snapshot: StackSnapshot
  /** Popped value when successful. */
  value: number | undefined
  /** False when the stack was empty (underflow). */
  ok: boolean
  reason?: 'underflow'
}

/** Remove and return the top element. Empty stack → underflow. */
export function pop(snapshot: StackSnapshot): PopResult {
  if (snapshot.values.length === 0) {
    return {
      snapshot: cloneSnapshot(snapshot),
      value: undefined,
      ok: false,
      reason: 'underflow',
    }
  }

  const value = snapshot.values[snapshot.values.length - 1]!
  return {
    snapshot: {
      values: snapshot.values.slice(0, -1),
      maxCapacity: snapshot.maxCapacity,
    },
    value,
    ok: true,
  }
}

/** Clear all elements; capacity setting is preserved. */
export function clear(snapshot: StackSnapshot): StackSnapshot {
  return {
    values: [],
    maxCapacity: snapshot.maxCapacity,
  }
}

/** Format bottom→top for status text, e.g. `[10, 20, 30]` (30 on top). */
export function formatStack(values: readonly number[]): string {
  if (values.length === 0) {
    return '[] (empty)'
  }
  return `[${values.join(', ')}] (top = ${values[values.length - 1]})`
}
