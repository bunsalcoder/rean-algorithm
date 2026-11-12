import { describe, expect, it } from 'vitest'
import {
  PriorityQueue,
  PRIORITY_QUEUE_SAMPLE_TASKS,
  clear,
  cloneSnapshot,
  createEmpty,
  dequeue,
  enqueue,
  formatPriorityQueue,
  fromSeeds,
  isEmpty,
  isValidPriorityQueue,
  peek,
  size,
  toArray,
  withMode,
} from './priorityQueue'
import {
  buildPriorityQueueSteps,
  parsePriorityQueueSnapshot,
  serializePriorityQueueSnapshot,
} from './priorityQueueSteps'

function dequeueAll(
  snapshot: ReturnType<typeof fromSeeds>,
): string[] {
  const out: string[] = []
  let current = snapshot
  while (!isEmpty(current)) {
    const result = dequeue(current)
    expect(result.ok).toBe(true)
    out.push(result.entry!.item)
    current = result.snapshot
    expect(isValidPriorityQueue(current)).toBe(true)
  }
  return out
}

describe('min priority ordering', () => {
  it('removes the smallest priority first', () => {
    const snapshot = fromSeeds(PRIORITY_QUEUE_SAMPLE_TASKS, 'min')
    expect(isValidPriorityQueue(snapshot)).toBe(true)
    expect(peek(snapshot)?.item).toBe('Fix critical bug')
    expect(peek(snapshot)?.priority).toBe(1)
    expect(dequeueAll(snapshot)).toEqual([
      'Fix critical bug',
      'Review pull request',
      'Refactor component',
      'Update documentation',
    ])
  })
})

describe('max priority ordering', () => {
  it('removes the largest priority first', () => {
    const snapshot = fromSeeds(PRIORITY_QUEUE_SAMPLE_TASKS, 'max')
    expect(isValidPriorityQueue(snapshot)).toBe(true)
    expect(peek(snapshot)?.item).toBe('Update documentation')
    expect(peek(snapshot)?.priority).toBe(5)
    expect(dequeueAll(snapshot)).toEqual([
      'Update documentation',
      'Refactor component',
      'Review pull request',
      'Fix critical bug',
    ])
  })
})

describe('enqueue and dequeue', () => {
  it('supports empty and single-element queues', () => {
    const empty = createEmpty('min')
    expect(isEmpty(empty)).toBe(true)
    expect(size(empty)).toBe(0)
    expect(peek(empty)).toBeUndefined()
    expect(dequeue(empty).ok).toBe(false)

    const single = enqueue(empty, 'Only task', 7).snapshot
    expect(size(single)).toBe(1)
    expect(peek(single)?.item).toBe('Only task')
    expect(isValidPriorityQueue(single)).toBe(true)

    const after = dequeue(single)
    expect(after.ok).toBe(true)
    expect(after.entry?.item).toBe('Only task')
    expect(isEmpty(after.snapshot)).toBe(true)
  })

  it('does not mutate previous snapshots', () => {
    const before = fromSeeds(PRIORITY_QUEUE_SAMPLE_TASKS, 'min')
    const beforeEntries = toArray(before)
    enqueue(before, 'New', 0)
    dequeue(before)
    expect(toArray(before)).toEqual(beforeEntries)
  })
})

describe('peek without removing', () => {
  it('returns the next entry and leaves the queue unchanged', () => {
    const snapshot = fromSeeds(PRIORITY_QUEUE_SAMPLE_TASKS, 'min')
    const first = peek(snapshot)
    const second = peek(snapshot)
    expect(first?.item).toBe('Fix critical bug')
    expect(second?.item).toBe('Fix critical bug')
    expect(size(snapshot)).toBe(4)
    expect(dequeue(snapshot).entry?.item).toBe('Fix critical bug')
  })
})

describe('equal-priority FIFO behavior', () => {
  it('dequeues equal priorities in insertion order (min mode)', () => {
    let snapshot = createEmpty<string>('min')
    snapshot = enqueue(snapshot, 'first', 5).snapshot
    snapshot = enqueue(snapshot, 'second', 5).snapshot
    snapshot = enqueue(snapshot, 'third', 5).snapshot
    expect(dequeueAll(snapshot)).toEqual(['first', 'second', 'third'])
  })

  it('dequeues equal priorities in insertion order (max mode)', () => {
    let snapshot = createEmpty<string>('max')
    snapshot = enqueue(snapshot, 'first', 5).snapshot
    snapshot = enqueue(snapshot, 'second', 5).snapshot
    snapshot = enqueue(snapshot, 'third', 5).snapshot
    expect(dequeueAll(snapshot)).toEqual(['first', 'second', 'third'])
  })

  it('keeps FIFO among ties when interleaved with other priorities', () => {
    let snapshot = createEmpty<string>('min')
    snapshot = enqueue(snapshot, 'urgent', 1).snapshot
    snapshot = enqueue(snapshot, 'a', 3).snapshot
    snapshot = enqueue(snapshot, 'b', 3).snapshot
    snapshot = enqueue(snapshot, 'later', 9).snapshot
    expect(dequeueAll(snapshot)).toEqual(['urgent', 'a', 'b', 'later'])
  })
})

describe('duplicate, zero, and negative priorities', () => {
  it('handles duplicates, zero, and negatives in min mode', () => {
    let snapshot = createEmpty<string>('min')
    snapshot = enqueue(snapshot, 'zero', 0).snapshot
    snapshot = enqueue(snapshot, 'neg', -3).snapshot
    snapshot = enqueue(snapshot, 'dup-a', 2).snapshot
    snapshot = enqueue(snapshot, 'dup-b', 2).snapshot
    expect(isValidPriorityQueue(snapshot)).toBe(true)
    expect(peek(snapshot)?.item).toBe('neg')
    expect(dequeueAll(snapshot)).toEqual(['neg', 'zero', 'dup-a', 'dup-b'])
  })

  it('handles negatives in max mode', () => {
    let snapshot = createEmpty<string>('max')
    snapshot = enqueue(snapshot, 'low', -10).snapshot
    snapshot = enqueue(snapshot, 'high', -1).snapshot
    expect(peek(snapshot)?.item).toBe('high')
  })
})

describe('clear and size', () => {
  it('reports size and clears without resetting sequence bookkeeping mode', () => {
    const snapshot = fromSeeds(PRIORITY_QUEUE_SAMPLE_TASKS, 'min')
    expect(size(snapshot)).toBe(4)
    const emptied = clear(snapshot)
    expect(isEmpty(emptied)).toBe(true)
    expect(size(emptied)).toBe(0)
    expect(emptied.mode).toBe('min')
    expect(peek(emptied)).toBeUndefined()
  })
})

describe('heap invariant after operations', () => {
  it('stays valid after mixed enqueues, peeks, and dequeues', () => {
    let snapshot = createEmpty<string>('min')
    for (const seed of PRIORITY_QUEUE_SAMPLE_TASKS) {
      snapshot = enqueue(snapshot, seed.item, seed.priority).snapshot
      expect(isValidPriorityQueue(snapshot)).toBe(true)
    }
    peek(snapshot)
    snapshot = dequeue(snapshot).snapshot
    expect(isValidPriorityQueue(snapshot)).toBe(true)
    snapshot = enqueue(snapshot, 'Hotfix', -1).snapshot
    expect(isValidPriorityQueue(snapshot)).toBe(true)
    expect(peek(snapshot)?.item).toBe('Hotfix')
  })

  it('rebuilds a valid heap when switching min ↔ max', () => {
    const min = fromSeeds(PRIORITY_QUEUE_SAMPLE_TASKS, 'min')
    const max = withMode(min, 'max')
    expect(max.mode).toBe('max')
    expect(isValidPriorityQueue(max)).toBe(true)
    expect(peek(max)?.item).toBe('Update documentation')
    // Equal-priority FIFO identity preserved via original sequences.
    const back = withMode(max, 'min')
    expect(peek(back)?.item).toBe('Fix critical bug')
    expect(isValidPriorityQueue(back)).toBe(true)
  })
})

describe('PriorityQueue class API', () => {
  it('exposes enqueue, peek, dequeue, size, isEmpty, clear, toArray', () => {
    const pq = new PriorityQueue<string>('min')
    expect(pq.isEmpty()).toBe(true)
    pq.enqueue('A', 2)
    pq.enqueue('B', 1)
    expect(pq.size()).toBe(2)
    expect(pq.peek()?.item).toBe('B')
    expect(pq.dequeue()?.item).toBe('B')
    expect(pq.toArray().map((e) => e.item)).toEqual(['A'])
    pq.clear()
    expect(pq.isEmpty()).toBe(true)
    expect(pq.dequeue()).toBeUndefined()
  })
})

describe('serialization helpers', () => {
  it('round-trips snapshots used by visualization frames', () => {
    const snapshot = fromSeeds(PRIORITY_QUEUE_SAMPLE_TASKS, 'min')
    const raw = serializePriorityQueueSnapshot(snapshot)
    const parsed = parsePriorityQueueSnapshot(raw)
    expect(parsed.mode).toBe('min')
    expect(parsed.entries.map((e) => e.item)).toEqual(
      snapshot.entries.map((e) => e.item),
    )
    expect(cloneSnapshot(parsed)).toEqual(parsed)
  })

  it('formats a readable status string', () => {
    const snapshot = fromSeeds(
      [{ item: 'A', priority: 1 }],
      'min',
    )
    expect(formatPriorityQueue(snapshot)).toContain('min-PQ')
    expect(formatPriorityQueue(snapshot)).toContain('A@1')
  })
})

describe('step generator', () => {
  it('emits immutable frames for enqueue and dequeue', () => {
    const snapshot = fromSeeds(PRIORITY_QUEUE_SAMPLE_TASKS, 'min')
    const enqueueSteps = buildPriorityQueueSteps(snapshot, 'enqueue', {
      item: 'Pager duty',
      priority: 0,
    })
    expect(enqueueSteps.length).toBeGreaterThan(2)
    expect(enqueueSteps[0].meta?.pqSnapshot).toBeTypeOf('string')

    const dequeueSteps = buildPriorityQueueSteps(snapshot, 'dequeue')
    expect(dequeueSteps.some((step) => step.meta?.phase === 'extract-root')).toBe(
      true,
    )
    const finalRaw = dequeueSteps[dequeueSteps.length - 1].meta?.pqSnapshot
    expect(typeof finalRaw).toBe('string')
    const finalSnap = parsePriorityQueueSnapshot(String(finalRaw))
    expect(size(finalSnap)).toBe(3)
    expect(isValidPriorityQueue(finalSnap)).toBe(true)
  })
})
