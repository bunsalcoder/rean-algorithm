import { describe, expect, it } from 'vitest'
import {
  clear,
  cloneSnapshot,
  dequeue,
  enqueue,
  formatQueue,
  front,
  frontIndex,
  isEmpty,
  normalize,
  rear,
  rearIndex,
  size,
  snapshotFromArray,
  snapshotFromBuffer,
  toArray,
} from './queue'
import {
  buildQueueSteps,
  parseQueueSnapshot,
  serializeQueueSnapshot,
  valuesFromFinalStep,
} from './queueSteps'

describe('snapshot / toArray / front / rear indices', () => {
  it('treats index 0 of the live view as the front', () => {
    const snapshot = snapshotFromArray([10, 20, 30, 40])
    expect(toArray(snapshot)).toEqual([10, 20, 30, 40])
    expect(frontIndex(snapshot)).toBe(0)
    expect(rearIndex(snapshot)).toBe(3)
    expect(front(snapshot)).toBe(10)
    expect(rear(snapshot)).toBe(40)
    expect(formatQueue(toArray(snapshot))).toContain('front = 10')
  })

  it('handles an empty queue', () => {
    const empty = snapshotFromArray([])
    expect(toArray(empty)).toEqual([])
    expect(frontIndex(empty)).toBe(-1)
    expect(rearIndex(empty)).toBe(-1)
    expect(front(empty)).toBeUndefined()
    expect(rear(empty)).toBeUndefined()
    expect(isEmpty(empty)).toBe(true)
    expect(size(empty)).toBe(0)
  })

  it('clones snapshots so later edits do not rewrite history', () => {
    const original = snapshotFromArray([1, 2])
    const copy = cloneSnapshot(original)
    const mutated = {
      ...copy,
      buffer: copy.buffer.map((value, index) => (index === 0 ? 99 : value)),
    }
    expect(toArray(original)).toEqual([1, 2])
    expect(toArray(mutated)).toEqual([99, 2])
  })
})

describe('enqueue', () => {
  it('enqueues into an empty queue', () => {
    const { snapshot, ok } = enqueue(snapshotFromArray([]), 10)
    expect(ok).toBe(true)
    expect(toArray(snapshot)).toEqual([10])
    expect(front(snapshot)).toBe(10)
    expect(rear(snapshot)).toBe(10)
  })

  it('supports multiple enqueues in FIFO order', () => {
    let snapshot = snapshotFromArray([])
    snapshot = enqueue(snapshot, 10).snapshot
    snapshot = enqueue(snapshot, 20).snapshot
    snapshot = enqueue(snapshot, 30).snapshot
    expect(toArray(snapshot)).toEqual([10, 20, 30])
    expect(front(snapshot)).toBe(10)
    expect(rear(snapshot)).toBe(30)
  })

  it('does not mutate the previous snapshot', () => {
    const before = snapshotFromArray([10, 20])
    enqueue(before, 30)
    expect(toArray(before)).toEqual([10, 20])
  })

  it('rejects enqueue when educational capacity is full', () => {
    const full = snapshotFromArray([1, 2], 2)
    const result = enqueue(full, 3)
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('overflow')
    expect(toArray(result.snapshot)).toEqual([1, 2])
  })
})

describe('dequeue', () => {
  it('dequeues from a non-empty queue (FIFO)', () => {
    const { snapshot, value, ok } = dequeue(
      snapshotFromArray([10, 20, 30, 40]),
    )
    expect(ok).toBe(true)
    expect(value).toBe(10)
    expect(toArray(snapshot)).toEqual([20, 30, 40])
    expect(front(snapshot)).toBe(20)
  })

  it('reports underflow on an empty queue without changing state', () => {
    const empty = snapshotFromArray([])
    const result = dequeue(empty)
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('underflow')
    expect(result.value).toBeUndefined()
    expect(toArray(result.snapshot)).toEqual([])
  })

  it('does not mutate the previous snapshot', () => {
    const before = snapshotFromArray([10, 20])
    dequeue(before)
    expect(toArray(before)).toEqual([10, 20])
  })

  it('advances head without Array.shift and compacts when prefix grows', () => {
    // Enough live elements that one dequeue keeps a positive head.
    let snapshot = snapshotFromBuffer([10, 20, 30, 40, 50, 60], 1)
    expect(toArray(snapshot)).toEqual([20, 30, 40, 50, 60])
    expect(snapshot.head).toBe(1)

    const first = dequeue(snapshot)
    expect(first.ok).toBe(true)
    expect(first.value).toBe(20)
    expect(toArray(first.snapshot)).toEqual([30, 40, 50, 60])
    // Discarded prefix (2) < live (4) → head advances, no compact yet.
    expect(first.snapshot.head).toBe(2)
    expect(first.snapshot.buffer).toEqual([10, 20, 30, 40, 50, 60])

    // Keep dequeueing until discarded prefix >= live → compaction resets head.
    snapshot = first.snapshot
    snapshot = dequeue(snapshot).snapshot // head 3, live 3 → compact
    expect(toArray(snapshot)).toEqual([40, 50, 60])
    expect(snapshot.head).toBe(0)
    expect(snapshot.buffer).toEqual([40, 50, 60])

    while (!isEmpty(snapshot)) {
      snapshot = dequeue(snapshot).snapshot
    }
    expect(snapshot.head).toBe(0)
    expect(snapshot.buffer).toEqual([])
  })

  it('supports large interleaved enqueue/dequeue sequences with FIFO order', () => {
    let snapshot = snapshotFromArray([])
    const expected: number[] = []

    for (let i = 0; i < 100; i += 1) {
      snapshot = enqueue(snapshot, i).snapshot
      expected.push(i)
      if (i % 3 === 2) {
        const result = dequeue(snapshot)
        expect(result.ok).toBe(true)
        expect(result.value).toBe(expected.shift())
        snapshot = result.snapshot
      }
    }

    while (!isEmpty(snapshot)) {
      const result = dequeue(snapshot)
      expect(result.ok).toBe(true)
      expect(result.value).toBe(expected.shift())
      snapshot = result.snapshot
    }

    expect(expected).toEqual([])
    expect(toArray(snapshot)).toEqual([])
  })
})

describe('front / rear / isEmpty / size / clear / normalize', () => {
  it('reads front and rear without mutation', () => {
    const snapshot = snapshotFromArray([10, 20, 30])
    expect(front(snapshot)).toBe(10)
    expect(rear(snapshot)).toBe(30)
    expect(toArray(snapshot)).toEqual([10, 20, 30])
  })

  it('reports undefined front/rear on empty', () => {
    const empty = snapshotFromArray([])
    expect(front(empty)).toBeUndefined()
    expect(rear(empty)).toBeUndefined()
  })

  it('tracks isEmpty and size', () => {
    const empty = snapshotFromArray([])
    expect(isEmpty(empty)).toBe(true)
    expect(size(empty)).toBe(0)

    const filled = snapshotFromArray([10, 20])
    expect(isEmpty(filled)).toBe(false)
    expect(size(filled)).toBe(2)
  })

  it('clears all elements and preserves capacity setting', () => {
    const cleared = clear(snapshotFromArray([10, 20], 4))
    expect(toArray(cleared)).toEqual([])
    expect(cleared.maxCapacity).toBe(4)
    expect(isEmpty(cleared)).toBe(true)
  })

  it('normalizes a head-advanced buffer', () => {
    const advanced = snapshotFromBuffer([1, 2, 3, 4], 2)
    expect(advanced.head).toBe(2)
    expect(toArray(advanced)).toEqual([3, 4])
    const normalized = normalize(advanced)
    expect(normalized.head).toBe(0)
    expect(normalized.buffer).toEqual([3, 4])
    expect(toArray(normalized)).toEqual([3, 4])
  })
})

describe('buildQueueSteps', () => {
  it('enqueues and matches the pure API', () => {
    const steps = buildQueueSteps([10, 20, 30], 'enqueue', 40)
    expect(valuesFromFinalStep(steps)).toEqual(
      toArray(enqueue(snapshotFromArray([10, 20, 30]), 40).snapshot),
    )
    expect(steps[steps.length - 1]?.meta?.success).toBe(true)
    expect(steps[steps.length - 1]?.meta?.result).toBe('40')
  })

  it('dequeues from a non-empty queue', () => {
    const steps = buildQueueSteps([10, 20, 30], 'dequeue')
    expect(valuesFromFinalStep(steps)).toEqual([20, 30])
    expect(steps[steps.length - 1]?.meta?.result).toBe('10')
    expect(steps[steps.length - 1]?.meta?.success).toBe(true)
  })

  it('explains underflow on empty dequeue, front, and rear', () => {
    const dequeueSteps = buildQueueSteps([], 'dequeue')
    expect(valuesFromFinalStep(dequeueSteps)).toEqual([])
    expect(dequeueSteps.some((step) => step.meta?.phase === 'underflow')).toBe(
      true,
    )
    expect(dequeueSteps[dequeueSteps.length - 1]?.meta?.success).toBe(false)

    const frontSteps = buildQueueSteps([], 'front')
    expect(valuesFromFinalStep(frontSteps)).toEqual([])
    expect(frontSteps.some((step) => step.meta?.phase === 'underflow')).toBe(
      true,
    )

    const rearSteps = buildQueueSteps([], 'rear')
    expect(valuesFromFinalStep(rearSteps)).toEqual([])
    expect(rearSteps.some((step) => step.meta?.phase === 'underflow')).toBe(
      true,
    )
  })

  it('reads front and rear without changing the queue', () => {
    const frontSteps = buildQueueSteps([10, 20, 30], 'front')
    expect(valuesFromFinalStep(frontSteps)).toEqual([10, 20, 30])
    expect(frontSteps[frontSteps.length - 1]?.meta?.result).toBe('10')

    const rearSteps = buildQueueSteps([10, 20, 30], 'rear')
    expect(valuesFromFinalStep(rearSteps)).toEqual([10, 20, 30])
    expect(rearSteps[rearSteps.length - 1]?.meta?.result).toBe('30')
  })

  it('reports isEmpty and size', () => {
    const emptySteps = buildQueueSteps([], 'is-empty')
    expect(emptySteps[emptySteps.length - 1]?.meta?.result).toBe('true')

    const sizeSteps = buildQueueSteps([10, 20, 30], 'size')
    expect(sizeSteps[sizeSteps.length - 1]?.meta?.result).toBe('3')
    expect(valuesFromFinalStep(sizeSteps)).toEqual([10, 20, 30])
  })

  it('keeps historical snapshots stable when later frames change', () => {
    const steps = buildQueueSteps([10, 20], 'enqueue', 30)
    expect(steps.length).toBeGreaterThan(2)

    const firstRaw = steps[0]?.meta?.queueSnapshot
    expect(typeof firstRaw).toBe('string')
    const firstSnapshot = parseQueueSnapshot(firstRaw as string)
    expect(toArray(firstSnapshot)).toEqual([10, 20])

    const lastRaw = steps[steps.length - 1]?.meta?.queueSnapshot
    const lastSnapshot = parseQueueSnapshot(lastRaw as string)
    expect(toArray(lastSnapshot)).toEqual([10, 20, 30])

    const edited = {
      ...lastSnapshot,
      buffer: lastSnapshot.buffer.map((value, index) =>
        index === 0 ? 999 : value,
      ),
    }
    expect(serializeQueueSnapshot(edited)).not.toEqual(firstRaw)
    expect(parseQueueSnapshot(firstRaw as string)).toEqual(firstSnapshot)
  })

  it('supports previous/next/reset style scrubbing via independent frames', () => {
    const steps = buildQueueSteps([10, 20], 'enqueue', 30)
    expect(steps.length).toBeGreaterThan(3)

    const first = steps[0]!
    const last = steps[steps.length - 1]!

    expect(
      toArray(parseQueueSnapshot(first.meta?.queueSnapshot as string)),
    ).toEqual([10, 20])
    expect(
      toArray(parseQueueSnapshot(last.meta?.queueSnapshot as string)),
    ).toEqual([10, 20, 30])
    expect(last.operation).toBe('complete')
    expect(first.meta?.queueSnapshot).not.toEqual(last.meta?.queueSnapshot)

    const earlier = steps.find(
      (step) =>
        toArray(parseQueueSnapshot(step.meta?.queueSnapshot as string))
          .length === 2,
    )
    expect(earlier).toBeDefined()
    expect(
      toArray(parseQueueSnapshot(earlier!.meta?.queueSnapshot as string)),
    ).toEqual([10, 20])
  })

  it('handles invalid enqueue input without changing the queue', () => {
    const steps = buildQueueSteps([10, 20], 'enqueue')
    expect(valuesFromFinalStep(steps)).toEqual([10, 20])
    expect(steps[0]?.meta?.phase).toBe('invalid')
    expect(steps[steps.length - 1]?.meta?.success).toBe(false)
  })

  it('demonstrates educational overflow without mutating the queue', () => {
    const steps = buildQueueSteps([1, 2], 'enqueue', 3, 2)
    expect(valuesFromFinalStep(steps)).toEqual([1, 2])
    expect(steps.some((step) => step.meta?.phase === 'overflow')).toBe(true)
    expect(steps[steps.length - 1]?.meta?.success).toBe(false)
  })
})
