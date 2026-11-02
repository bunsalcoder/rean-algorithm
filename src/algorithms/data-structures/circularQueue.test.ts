import { describe, expect, it } from 'vitest'
import {
  CircularQueueCapacityError,
  assertInvariants,
  capacity,
  clear,
  cloneSnapshot,
  createEmpty,
  dequeue,
  enqueue,
  front,
  isEmpty,
  isFull,
  nextIndex,
  nextInsertionIndex,
  rear,
  size,
  snapshotFromArray,
  snapshotFromState,
  toArray,
  withCapacity,
} from './circularQueue'
import {
  buildCircularQueueSteps,
  parseCircularQueueSnapshot,
  serializeCircularQueueSnapshot,
  snapshotFromFinalStep,
  valuesFromFinalStep,
} from './circularQueueSteps'

describe('capacity validation', () => {
  it('rejects zero and negative capacities', () => {
    expect(() => createEmpty(0)).toThrow(CircularQueueCapacityError)
    expect(() => createEmpty(-1)).toThrow(CircularQueueCapacityError)
    expect(() => snapshotFromArray([], 0)).toThrow(CircularQueueCapacityError)
    expect(() => snapshotFromArray([1], -3)).toThrow(CircularQueueCapacityError)
  })

  it('rejects non-integer capacities', () => {
    expect(() => createEmpty(2.5)).toThrow(CircularQueueCapacityError)
    expect(() => createEmpty(Number.NaN)).toThrow(CircularQueueCapacityError)
  })

  it('rejects values longer than capacity', () => {
    expect(() => snapshotFromArray([1, 2, 3], 2)).toThrow(/Cannot fit/)
  })
})

describe('empty-state and invariants', () => {
  it('uses front = rear = 0 placeholders when empty', () => {
    const empty = createEmpty(6)
    expect(empty.front).toBe(0)
    expect(empty.rear).toBe(0)
    expect(empty.size).toBe(0)
    expect(isEmpty(empty)).toBe(true)
    expect(isFull(empty)).toBe(false)
    expect(front(empty)).toBeUndefined()
    expect(rear(empty)).toBeUndefined()
    expect(toArray(empty)).toEqual([])
    assertInvariants(empty)
  })

  it('clones snapshots so later edits do not rewrite history', () => {
    const original = snapshotFromArray([10, 20], 4)
    const copy = cloneSnapshot(original)
    const mutated = {
      ...copy,
      buffer: copy.buffer.map((value, index) => (index === 0 ? 99 : value)),
    }
    expect(toArray(original)).toEqual([10, 20])
    expect(toArray(mutated)).toEqual([99, 20])
  })
})

describe('enqueue / dequeue ordering', () => {
  it('enqueues into an empty queue', () => {
    const { snapshot, ok, writtenIndex } = enqueue(createEmpty(4), 10)
    expect(ok).toBe(true)
    expect(writtenIndex).toBe(0)
    expect(toArray(snapshot)).toEqual([10])
    expect(snapshot.front).toBe(0)
    expect(snapshot.rear).toBe(0)
    expect(front(snapshot)).toBe(10)
    expect(rear(snapshot)).toBe(10)
    assertInvariants(snapshot)
  })

  it('supports FIFO ordering across multiple operations', () => {
    let snapshot = createEmpty(5)
    snapshot = enqueue(snapshot, 10).snapshot
    snapshot = enqueue(snapshot, 20).snapshot
    snapshot = enqueue(snapshot, 30).snapshot
    expect(toArray(snapshot)).toEqual([10, 20, 30])

    const first = dequeue(snapshot)
    expect(first.ok).toBe(true)
    expect(first.value).toBe(10)
    snapshot = first.snapshot
    expect(toArray(snapshot)).toEqual([20, 30])
    expect(front(snapshot)).toBe(20)
    expect(rear(snapshot)).toBe(30)
  })

  it('does not mutate the previous snapshot', () => {
    const before = snapshotFromArray([10, 20], 4)
    enqueue(before, 30)
    dequeue(before)
    expect(toArray(before)).toEqual([10, 20])
  })
})

describe('full and empty detection', () => {
  it('fills the entire queue and rejects overflow', () => {
    let snapshot = createEmpty(3)
    snapshot = enqueue(snapshot, 1).snapshot
    snapshot = enqueue(snapshot, 2).snapshot
    snapshot = enqueue(snapshot, 3).snapshot
    expect(isFull(snapshot)).toBe(true)
    expect(size(snapshot)).toBe(3)
    expect(capacity(snapshot)).toBe(3)
    expect(nextInsertionIndex(snapshot)).toBe(-1)

    const overflow = enqueue(snapshot, 4)
    expect(overflow.ok).toBe(false)
    expect(overflow.reason).toBe('overflow')
    expect(toArray(overflow.snapshot)).toEqual([1, 2, 3])
  })

  it('rejects dequeue from an empty queue', () => {
    const empty = createEmpty(4)
    const result = dequeue(empty)
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('underflow')
    expect(result.value).toBeUndefined()
    expect(isEmpty(result.snapshot)).toBe(true)
  })

  it('resets placeholders after dequeueing the only element', () => {
    let snapshot = snapshotFromArray([42], 4)
    const result = dequeue(snapshot)
    expect(result.ok).toBe(true)
    expect(result.value).toBe(42)
    snapshot = result.snapshot
    expect(isEmpty(snapshot)).toBe(true)
    expect(snapshot.front).toBe(0)
    expect(snapshot.rear).toBe(0)
    expect(snapshot.buffer.every((slot) => slot === null)).toBe(true)
  })
})

describe('wraparound and slot reuse', () => {
  it('wraps rear from the final index to zero', () => {
    let snapshot = snapshotFromArray([10, 20, 30], 4)
    snapshot = dequeue(snapshot).snapshot // frees index 0
    const result = enqueue(snapshot, 40)
    expect(result.ok).toBe(true)
    expect(result.wrapped).toBe(false) // rear moved 2 → 3, not wrap yet
    snapshot = result.snapshot

    snapshot = dequeue(snapshot).snapshot // remove 20
    snapshot = dequeue(snapshot).snapshot // remove 30; live = [40] at index 3
    const wrap = enqueue(snapshot, 50)
    expect(wrap.ok).toBe(true)
    expect(wrap.wrapped).toBe(true)
    expect(wrap.writtenIndex).toBe(0)
    expect(toArray(wrap.snapshot)).toEqual([40, 50])
    expect(wrap.snapshot.front).toBe(3)
    expect(wrap.snapshot.rear).toBe(0)
    assertInvariants(wrap.snapshot)
  })

  it('wraps front from the final index to zero', () => {
    const snapshot = snapshotFromState({
      buffer: [20, null, null, 10],
      front: 3,
      rear: 0,
      size: 2,
    })
    const result = dequeue(snapshot)
    expect(result.ok).toBe(true)
    expect(result.value).toBe(10)
    expect(result.wrapped).toBe(true)
    expect(result.snapshot.front).toBe(0)
    expect(toArray(result.snapshot)).toEqual([20])
  })

  it('reuses slots after dequeue in a classic wrap sequence', () => {
    let snapshot = createEmpty(4)
    for (const value of [10, 20, 30, 40]) {
      snapshot = enqueue(snapshot, value).snapshot
    }
    expect(isFull(snapshot)).toBe(true)
    snapshot = dequeue(snapshot).snapshot
    snapshot = enqueue(snapshot, 50).snapshot
    expect(toArray(snapshot)).toEqual([20, 30, 40, 50])
    expect(snapshot.buffer[0]).toBe(50)
    expect(snapshot.front).toBe(1)
    expect(snapshot.rear).toBe(0)
  })

  it('supports capacity of one', () => {
    let snapshot = createEmpty(1)
    expect(isEmpty(snapshot)).toBe(true)
    const filled = enqueue(snapshot, 7)
    expect(filled.ok).toBe(true)
    expect(isFull(filled.snapshot)).toBe(true)
    expect(enqueue(filled.snapshot, 8).ok).toBe(false)

    const removed = dequeue(filled.snapshot)
    expect(removed.ok).toBe(true)
    expect(removed.value).toBe(7)
    expect(isEmpty(removed.snapshot)).toBe(true)

    snapshot = enqueue(removed.snapshot, 9).snapshot
    expect(toArray(snapshot)).toEqual([9])
  })

  it('supports repeated interleaved enqueue/dequeue sequences', () => {
    let snapshot = createEmpty(5)
    const expected: number[] = []

    for (let i = 0; i < 40; i += 1) {
      if (!isFull(snapshot)) {
        snapshot = enqueue(snapshot, i).snapshot
        expected.push(i)
      }
      if (i % 2 === 1 && !isEmpty(snapshot)) {
        const result = dequeue(snapshot)
        expect(result.ok).toBe(true)
        expect(result.value).toBe(expected.shift())
        snapshot = result.snapshot
      }
      assertInvariants(snapshot)
    }

    while (!isEmpty(snapshot)) {
      const result = dequeue(snapshot)
      expect(result.value).toBe(expected.shift())
      snapshot = result.snapshot
    }
    expect(expected).toEqual([])
  })
})

describe('front / rear / clear / withCapacity / nextIndex', () => {
  it('reads front and rear without mutation', () => {
    const snapshot = snapshotFromArray([10, 20, 30], 6)
    expect(front(snapshot)).toBe(10)
    expect(rear(snapshot)).toBe(30)
    expect(toArray(snapshot)).toEqual([10, 20, 30])
  })

  it('clears all elements and preserves capacity', () => {
    const cleared = clear(snapshotFromArray([10, 20], 8))
    expect(isEmpty(cleared)).toBe(true)
    expect(cleared.capacity).toBe(8)
    expect(cleared.buffer).toHaveLength(8)
  })

  it('relays values when capacity changes', () => {
    const grown = withCapacity(snapshotFromArray([1, 2], 3), 5)
    expect(grown.capacity).toBe(5)
    expect(toArray(grown)).toEqual([1, 2])
    expect(grown.front).toBe(0)
    expect(grown.rear).toBe(1)
    expect(() => withCapacity(snapshotFromArray([1, 2, 3], 3), 2)).toThrow()
  })

  it('computes modulo nextIndex', () => {
    expect(nextIndex(0, 6)).toBe(1)
    expect(nextIndex(5, 6)).toBe(0)
    expect(nextIndex(2, 3)).toBe(0)
  })
})

describe('buildCircularQueueSteps', () => {
  it('keeps historical snapshots immutable across scrubbing', () => {
    const steps = buildCircularQueueSteps([10, 20], 'enqueue', 30, 4)
    const first = parseCircularQueueSnapshot(
      String(steps[0]?.meta?.circularQueueSnapshot),
    )
    const last = parseCircularQueueSnapshot(
      String(steps[steps.length - 1]?.meta?.circularQueueSnapshot),
    )
    expect(toArray(first)).toEqual([10, 20])
    expect(toArray(last)).toEqual([10, 20, 30])
    expect(valuesFromFinalStep(steps)).toEqual([10, 20, 30])
  })

  it('records overflow and underflow without changing state', () => {
    const fullSteps = buildCircularQueueSteps([1, 2], 'enqueue', 3, 2)
    expect(fullSteps.some((step) => step.meta?.phase === 'overflow')).toBe(
      true,
    )
    expect(valuesFromFinalStep(fullSteps)).toEqual([1, 2])
    expect(fullSteps[fullSteps.length - 1]?.meta?.success).toBe(false)

    const emptySteps = buildCircularQueueSteps([], 'dequeue', undefined, 4)
    expect(emptySteps.some((step) => step.meta?.phase === 'underflow')).toBe(
      true,
    )
    expect(valuesFromFinalStep(emptySteps)).toEqual([])
  })

  it('shows wraparound phases for rear and front', () => {
    const wrapped = snapshotFromState({
      buffer: [null, null, null, 10, 20, 30],
      front: 3,
      rear: 5,
      size: 3,
    })
    const enqueueSteps = buildCircularQueueSteps(
      [],
      'enqueue',
      40,
      6,
      wrapped,
    )
    expect(enqueueSteps.some((step) => step.meta?.phase === 'wrap-rear')).toBe(
      true,
    )
    expect(enqueueSteps.some((step) => step.meta?.wrapped === true)).toBe(true)
    const afterEnqueue = snapshotFromFinalStep(enqueueSteps)!
    expect(afterEnqueue.rear).toBe(0)
    expect(toArray(afterEnqueue)).toEqual([10, 20, 30, 40])

    const frontWrapSource = snapshotFromState({
      buffer: [20, null, null, null, null, 10],
      front: 5,
      rear: 0,
      size: 2,
    })
    const dequeueSteps = buildCircularQueueSteps(
      [],
      'dequeue',
      undefined,
      6,
      frontWrapSource,
    )
    expect(dequeueSteps.some((step) => step.meta?.phase === 'wrap-front')).toBe(
      true,
    )
    expect(valuesFromFinalStep(dequeueSteps)).toEqual([20])
  })

  it('supports isEmpty and isFull result steps', () => {
    const emptySteps = buildCircularQueueSteps([], 'is-empty', undefined, 3)
    expect(emptySteps[emptySteps.length - 1]?.meta?.result).toBe('true')

    const fullSteps = buildCircularQueueSteps([1, 2, 3], 'is-full', undefined, 3)
    expect(fullSteps[fullSteps.length - 1]?.meta?.result).toBe('true')
  })

  it('rejects invalid enqueue operands', () => {
    const steps = buildCircularQueueSteps([1], 'enqueue', undefined, 3)
    expect(steps[steps.length - 1]?.meta?.phase).toBe('complete')
    expect(steps[steps.length - 1]?.meta?.success).toBe(false)
    expect(valuesFromFinalStep(steps)).toEqual([1])
  })

  it('round-trips serialize/parse snapshots', () => {
    const snapshot = snapshotFromState({
      buffer: [30, null, 10, 20],
      front: 2,
      rear: 0,
      size: 3,
    })
    const parsed = parseCircularQueueSnapshot(
      serializeCircularQueueSnapshot(snapshot),
    )
    expect(parsed).toEqual(snapshot)
  })
})
