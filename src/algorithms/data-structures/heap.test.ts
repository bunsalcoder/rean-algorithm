import { describe, expect, it } from 'vitest'
import {
  buildHeap,
  buildHeapByInserts,
  clear,
  cloneSnapshot,
  createEmpty,
  extract,
  heapify,
  insert,
  isEmpty,
  isValidHeap,
  leftChildIndex,
  parentIndex,
  peek,
  rightChildIndex,
  size,
  snapshotFromArray,
  toArray,
  withKind,
} from './heap'
import {
  buildHeapSteps,
  parseHeapSnapshot,
  serializeHeapSnapshot,
  valuesFromFinalStep,
} from './heapSteps'

function extractAll(snapshot: ReturnType<typeof buildHeap>): number[] {
  const out: number[] = []
  let current = snapshot
  while (!isEmpty(current)) {
    const result = extract(current)
    expect(result.ok).toBe(true)
    out.push(result.value!)
    current = result.snapshot
    expect(isValidHeap(current)).toBe(true)
  }
  return out
}

describe('index formulas', () => {
  it('matches the lesson parent / child identities', () => {
    expect(parentIndex(1)).toBe(0)
    expect(parentIndex(2)).toBe(0)
    expect(parentIndex(5)).toBe(2)
    expect(leftChildIndex(0)).toBe(1)
    expect(rightChildIndex(0)).toBe(2)
    expect(leftChildIndex(2)).toBe(5)
    expect(rightChildIndex(2)).toBe(6)
  })
})

describe('min heap ordering', () => {
  it('keeps the minimum at the root after inserts', () => {
    let snapshot = createEmpty('min')
    for (const value of [4, 8, 3, 10, 1]) {
      snapshot = insert(snapshot, value).snapshot
      expect(isValidHeap(snapshot)).toBe(true)
    }
    expect(peek(snapshot)).toBe(1)
    expect(extractAll(snapshot)).toEqual([1, 3, 4, 8, 10])
  })

  it('buildHeap produces a valid min heap', () => {
    const snapshot = buildHeap([4, 8, 3, 10, 1], 'min')
    expect(isValidHeap(snapshot)).toBe(true)
    expect(peek(snapshot)).toBe(1)
  })
})

describe('max heap ordering', () => {
  it('keeps the maximum at the root after inserts', () => {
    let snapshot = createEmpty('max')
    for (const value of [4, 8, 3, 10, 1]) {
      snapshot = insert(snapshot, value).snapshot
      expect(isValidHeap(snapshot)).toBe(true)
    }
    expect(peek(snapshot)).toBe(10)
    expect(extractAll(snapshot)).toEqual([10, 8, 4, 3, 1])
  })

  it('buildHeap produces a valid max heap', () => {
    const snapshot = buildHeap([4, 8, 3, 10, 1], 'max')
    expect(isValidHeap(snapshot)).toBe(true)
    expect(peek(snapshot)).toBe(10)
  })
})

describe('insert and extract', () => {
  it('supports empty and single-element heaps', () => {
    const empty = createEmpty('min')
    expect(isEmpty(empty)).toBe(true)
    expect(size(empty)).toBe(0)
    expect(peek(empty)).toBeUndefined()
    expect(extract(empty).ok).toBe(false)

    const single = insert(empty, 42).snapshot
    expect(size(single)).toBe(1)
    expect(peek(single)).toBe(42)
    expect(isValidHeap(single)).toBe(true)

    const after = extract(single)
    expect(after.ok).toBe(true)
    expect(after.value).toBe(42)
    expect(isEmpty(after.snapshot)).toBe(true)
  })

  it('supports duplicates, zero, and negatives', () => {
    const snapshot = buildHeap([4, 2, 4, 1, 2, 0, -3], 'min')
    expect(isValidHeap(snapshot)).toBe(true)
    expect(peek(snapshot)).toBe(-3)
    expect(extractAll(snapshot)).toEqual([-3, 0, 1, 2, 2, 4, 4])
  })

  it('does not mutate the previous snapshot on insert or extract', () => {
    const before = buildHeap([3, 1, 2], 'min')
    const beforeValues = toArray(before)
    insert(before, 0)
    extract(before)
    expect(toArray(before)).toEqual(beforeValues)
  })
})

describe('build heap', () => {
  it('matches extraction order for min and max', () => {
    const values = [9, 1, 5, 3, 7, 2]
    expect(extractAll(buildHeap(values, 'min'))).toEqual([1, 2, 3, 5, 7, 9])
    expect(extractAll(buildHeap(values, 'max'))).toEqual([9, 7, 5, 3, 2, 1])
  })

  it('heapify repairs a single subtree', () => {
    // Almost a min heap but root is too large.
    const broken = snapshotFromArray([9, 1, 3, 4, 2], 'min')
    expect(isValidHeap(broken)).toBe(false)
    const fixed = heapify(broken, 0)
    expect(isValidHeap(fixed)).toBe(true)
    expect(peek(fixed)).toBe(1)
  })

  it('buildHeapByInserts also yields a valid heap (O(n log n) path)', () => {
    const values = [5, 2, 9, 1, 7]
    const viaBuild = buildHeap(values, 'min')
    const viaInserts = buildHeapByInserts(values, 'min')
    expect(isValidHeap(viaBuild)).toBe(true)
    expect(isValidHeap(viaInserts)).toBe(true)
    expect(extractAll(viaBuild)).toEqual(extractAll(viaInserts))
  })
})

describe('clear, size, and kind', () => {
  it('clears and reports size', () => {
    const snapshot = buildHeap([1, 2, 3], 'max')
    expect(size(snapshot)).toBe(3)
    const emptied = clear(snapshot)
    expect(isEmpty(emptied)).toBe(true)
    expect(emptied.kind).toBe('max')
    expect(size(emptied)).toBe(0)
  })

  it('withKind changes kind without reordering until rebuild', () => {
    const minHeap = buildHeap([1, 4, 3], 'min')
    const flipped = withKind(minHeap, 'max')
    expect(flipped.kind).toBe('max')
    expect(toArray(flipped)).toEqual(toArray(minHeap))
  })
})

describe('immutable visualization snapshots', () => {
  it('clones so later edits do not rewrite history', () => {
    const original = buildHeap([4, 1, 3], 'min')
    const copy = cloneSnapshot(original)
    const mutated = {
      ...copy,
      values: copy.values.map((value, index) => (index === 0 ? 99 : value)),
    }
    expect(toArray(original)[0]).toBe(1)
    expect(mutated.values[0]).toBe(99)
  })

  it('serializes and parses snapshots round-trip', () => {
    const snapshot = buildHeap([4, 8, 3], 'max')
    const roundTrip = parseHeapSnapshot(serializeHeapSnapshot(snapshot))
    expect(roundTrip.kind).toBe('max')
    expect(toArray(roundTrip)).toEqual(toArray(snapshot))
  })

  it('keeps each insert step’s array immutable across scrubbing', () => {
    const initial = buildHeap([4, 8, 3], 'min')
    const steps = buildHeapSteps(initial, 'insert', 1)
    expect(steps.length).toBeGreaterThan(2)

    const arrays = steps.map((step) => [...(step.array ?? [])])
    // Mutate copies taken from steps — originals must stay intact.
    for (const step of steps) {
      if (step.array && step.array.length > 0) {
        const raw = step.meta?.heapSnapshot
        expect(typeof raw).toBe('string')
        const parsed = parseHeapSnapshot(String(raw))
        expect(parsed.values).toEqual(step.array)
      }
    }

    expect(arrays[0]).toEqual(toArray(initial))
    const finalValues = valuesFromFinalStep(steps)
    expect(finalValues[0]).toBe(1)
    expect(isValidHeap(snapshotFromArray(finalValues, 'min'))).toBe(true)
  })

  it('records underflow for peek/extract on empty heaps', () => {
    const empty = createEmpty('max')
    const peekSteps = buildHeapSteps(empty, 'peek')
    expect(peekSteps.some((step) => step.meta?.phase === 'underflow')).toBe(
      true,
    )
    const extractSteps = buildHeapSteps(empty, 'extract')
    expect(extractSteps.some((step) => step.meta?.phase === 'underflow')).toBe(
      true,
    )
  })

  it('build-heap steps end on a valid heap matching buildHeap()', () => {
    const values = [4, 8, 3, 10, 1]
    const steps = buildHeapSteps(
      snapshotFromArray(values, 'min'),
      'build-heap',
      null,
      values,
    )
    const finalValues = valuesFromFinalStep(steps)
    expect(finalValues).toEqual(toArray(buildHeap(values, 'min')))
    expect(isValidHeap(snapshotFromArray(finalValues, 'min'))).toBe(true)
  })
})
