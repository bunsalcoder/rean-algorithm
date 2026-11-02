import { describe, expect, it } from 'vitest'
import {
  assertInvariants,
  back,
  clear,
  cloneSnapshot,
  createEmpty,
  formatDeque,
  front,
  frontIndex,
  isEmpty,
  normalize,
  popBack,
  popFront,
  pushBack,
  pushFront,
  rearBufferIndex,
  rearIndex,
  size,
  snapshotFromArray,
  snapshotFromState,
  toArray,
} from './deque'
import {
  buildDequeSteps,
  parseDequeSnapshot,
  serializeDequeSnapshot,
  snapshotFromFinalStep,
  valuesFromFinalStep,
} from './dequeSteps'

describe('snapshot / toArray / front / rear indices', () => {
  it('treats index 0 of the live view as the front', () => {
    const snapshot = snapshotFromArray([10, 20, 30, 40])
    expect(toArray(snapshot)).toEqual([10, 20, 30, 40])
    expect(frontIndex(snapshot)).toBe(0)
    expect(rearIndex(snapshot)).toBe(3)
    expect(front(snapshot)).toBe(10)
    expect(back(snapshot)).toBe(40)
    expect(formatDeque(toArray(snapshot))).toContain('front = 10')
    assertInvariants(snapshot)
  })

  it('handles an empty deque', () => {
    const empty = snapshotFromArray([])
    expect(toArray(empty)).toEqual([])
    expect(frontIndex(empty)).toBe(-1)
    expect(rearIndex(empty)).toBe(-1)
    expect(front(empty)).toBeUndefined()
    expect(back(empty)).toBeUndefined()
    expect(isEmpty(empty)).toBe(true)
    expect(size(empty)).toBe(0)
    assertInvariants(empty)
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

describe('pushFront / pushBack', () => {
  it('inserts into an empty deque from either end', () => {
    const fromFront = pushFront(createEmpty(4), 10)
    expect(fromFront.ok).toBe(true)
    expect(toArray(fromFront.snapshot)).toEqual([10])
    expect(front(fromFront.snapshot)).toBe(10)
    expect(back(fromFront.snapshot)).toBe(10)

    const fromBack = pushBack(createEmpty(4), 20)
    expect(fromBack.ok).toBe(true)
    expect(toArray(fromBack.snapshot)).toEqual([20])
  })

  it('supports multiple insertions at both ends', () => {
    let snapshot = createEmpty(8)
    snapshot = pushBack(snapshot, 20).snapshot
    snapshot = pushBack(snapshot, 30).snapshot
    snapshot = pushFront(snapshot, 10).snapshot
    snapshot = pushBack(snapshot, 40).snapshot
    snapshot = pushFront(snapshot, 5).snapshot
    expect(toArray(snapshot)).toEqual([5, 10, 20, 30, 40])
    expect(front(snapshot)).toBe(5)
    expect(back(snapshot)).toBe(40)
    assertInvariants(snapshot)
  })

  it('does not mutate the previous snapshot', () => {
    const before = snapshotFromArray([10, 20])
    pushFront(before, 5)
    pushBack(before, 30)
    expect(toArray(before)).toEqual([10, 20])
  })

  it('rejects insert when educational capacity is full', () => {
    const full = snapshotFromArray([1, 2], 2)
    const frontResult = pushFront(full, 0)
    expect(frontResult.ok).toBe(false)
    expect(frontResult.reason).toBe('overflow')
    expect(toArray(frontResult.snapshot)).toEqual([1, 2])

    const backResult = pushBack(full, 3)
    expect(backResult.ok).toBe(false)
    expect(backResult.reason).toBe('overflow')
  })

  it('resizes when the ring is full (amortized growth)', () => {
    let snapshot = createEmpty(2)
    snapshot = pushBack(snapshot, 1).snapshot
    snapshot = pushBack(snapshot, 2).snapshot
    expect(snapshot.capacity).toBe(2)
    const result = pushBack(snapshot, 3)
    expect(result.ok).toBe(true)
    expect(result.resized).toBe(true)
    expect(toArray(result.snapshot)).toEqual([1, 2, 3])
    expect(result.snapshot.capacity).toBeGreaterThan(2)
    assertInvariants(result.snapshot)
  })
})

describe('popFront / popBack', () => {
  it('removes from either end', () => {
    const start = snapshotFromArray([10, 20, 30, 40])
    const fromFront = popFront(start)
    expect(fromFront.ok).toBe(true)
    expect(fromFront.value).toBe(10)
    expect(toArray(fromFront.snapshot)).toEqual([20, 30, 40])

    const fromBack = popBack(start)
    expect(fromBack.ok).toBe(true)
    expect(fromBack.value).toBe(40)
    expect(toArray(fromBack.snapshot)).toEqual([10, 20, 30])
  })

  it('reports underflow on an empty deque without changing state', () => {
    const empty = createEmpty()
    const frontResult = popFront(empty)
    expect(frontResult.ok).toBe(false)
    expect(frontResult.reason).toBe('underflow')
    expect(frontResult.value).toBeUndefined()
    expect(toArray(frontResult.snapshot)).toEqual([])

    const backResult = popBack(empty)
    expect(backResult.ok).toBe(false)
    expect(backResult.reason).toBe('underflow')
  })

  it('does not mutate the previous snapshot', () => {
    const before = snapshotFromArray([10, 20])
    popFront(before)
    popBack(before)
    expect(toArray(before)).toEqual([10, 20])
  })
})

describe('front / back / size / clear', () => {
  it('reads ends without mutation', () => {
    const snapshot = snapshotFromArray([10, 20, 30])
    expect(front(snapshot)).toBe(10)
    expect(back(snapshot)).toBe(30)
    expect(toArray(snapshot)).toEqual([10, 20, 30])
  })

  it('clears while preserving capacity settings', () => {
    const snapshot = snapshotFromArray([1, 2, 3], 5)
    const cleared = clear(snapshot)
    expect(toArray(cleared)).toEqual([])
    expect(cleared.maxCapacity).toBe(5)
    expect(cleared.capacity).toBe(snapshot.capacity)
  })

  it('reports size correctly through mixed operations', () => {
    let snapshot = createEmpty(4)
    expect(size(snapshot)).toBe(0)
    snapshot = pushFront(snapshot, 1).snapshot
    snapshot = pushBack(snapshot, 2).snapshot
    expect(size(snapshot)).toBe(2)
    snapshot = popFront(snapshot).snapshot
    expect(size(snapshot)).toBe(1)
  })
})

describe('alternating ends and wraparound', () => {
  it('supports alternating front/rear operations', () => {
    let snapshot = createEmpty(8)
    snapshot = pushBack(snapshot, 2).snapshot
    snapshot = pushFront(snapshot, 1).snapshot
    snapshot = pushBack(snapshot, 3).snapshot
    snapshot = pushFront(snapshot, 0).snapshot
    expect(toArray(snapshot)).toEqual([0, 1, 2, 3])

    expect(popBack(snapshot).value).toBe(3)
    snapshot = popBack(snapshot).snapshot
    expect(popFront(snapshot).value).toBe(0)
    snapshot = popFront(snapshot).snapshot
    expect(toArray(snapshot)).toEqual([1, 2])
  })

  it('wraps indices around the ring without shifting', () => {
    // Capacity 4, fill, popFront twice, then pushBack twice to wrap rear.
    let snapshot = snapshotFromArray([10, 20, 30, 40], null, 4)
    expect(snapshot.capacity).toBe(4)
    snapshot = popFront(snapshot).snapshot
    snapshot = popFront(snapshot).snapshot
    expect(toArray(snapshot)).toEqual([30, 40])
    expect(snapshot.front).toBe(2)

    const first = pushBack(snapshot, 50)
    expect(first.ok).toBe(true)
    // Rear advances from index 3 → 0 (wraparound).
    expect(first.wrapped).toBe(true)
    snapshot = first.snapshot
    const second = pushBack(snapshot, 60)
    expect(second.ok).toBe(true)
    snapshot = second.snapshot
    expect(toArray(snapshot)).toEqual([30, 40, 50, 60])
    assertInvariants(snapshot)

    // pushFront should wrap toward the high end of the buffer after space frees.
    snapshot = popBack(snapshot).snapshot
    const wrapFront = pushFront(snapshot, 25)
    expect(wrapFront.ok).toBe(true)
    expect(toArray(wrapFront.snapshot)).toEqual([25, 30, 40, 50])
    assertInvariants(wrapFront.snapshot)
  })

  it('builds wrapped state via snapshotFromState', () => {
    const wrapped = snapshotFromState({
      buffer: [40, null, 20, 30],
      front: 2,
      size: 3,
    })
    expect(toArray(wrapped)).toEqual([20, 30, 40])
    expect(rearBufferIndex(wrapped)).toBe(0)
    assertInvariants(wrapped)

    const normalized = normalize(wrapped)
    expect(toArray(normalized)).toEqual([20, 30, 40])
    expect(normalized.front).toBe(0)
  })
})

describe('serialize / parse', () => {
  it('round-trips snapshots through JSON meta', () => {
    const snapshot = snapshotFromArray([7, 8, 9], 10)
    const raw = serializeDequeSnapshot(snapshot)
    const parsed = parseDequeSnapshot(raw)
    expect(toArray(parsed)).toEqual([7, 8, 9])
    expect(parsed.maxCapacity).toBe(10)
    expect(parsed.capacity).toBe(snapshot.capacity)
  })
})

describe('buildDequeSteps', () => {
  it('matches pushFront / pushBack API results', () => {
    const frontSteps = buildDequeSteps([10, 20], 'push-front', 5)
    expect(valuesFromFinalStep(frontSteps)).toEqual([5, 10, 20])
    expect(frontSteps[frontSteps.length - 1]?.meta?.success).toBe(true)

    const backSteps = buildDequeSteps([10, 20], 'push-back', 30)
    expect(valuesFromFinalStep(backSteps)).toEqual([10, 20, 30])
  })

  it('matches popFront / popBack API results', () => {
    const frontSteps = buildDequeSteps([10, 20, 30], 'pop-front')
    expect(valuesFromFinalStep(frontSteps)).toEqual([20, 30])
    expect(frontSteps[frontSteps.length - 1]?.meta?.result).toBe('10')

    const backSteps = buildDequeSteps([10, 20, 30], 'pop-back')
    expect(valuesFromFinalStep(backSteps)).toEqual([10, 20])
    expect(backSteps[backSteps.length - 1]?.meta?.result).toBe('30')
  })

  it('shows underflow for empty pops and peeks', () => {
    for (const operation of ['pop-front', 'pop-back', 'front', 'back'] as const) {
      const steps = buildDequeSteps([], operation)
      expect(steps.some((step) => step.meta?.phase === 'underflow')).toBe(true)
      expect(valuesFromFinalStep(steps)).toEqual([])
      expect(steps[steps.length - 1]?.meta?.success).toBe(false)
    }
  })

  it('reads front / back without mutation', () => {
    const frontSteps = buildDequeSteps([10, 20, 30], 'front')
    expect(valuesFromFinalStep(frontSteps)).toEqual([10, 20, 30])
    expect(frontSteps[frontSteps.length - 1]?.meta?.result).toBe('10')

    const backSteps = buildDequeSteps([10, 20, 30], 'back')
    expect(valuesFromFinalStep(backSteps)).toEqual([10, 20, 30])
    expect(backSteps[backSteps.length - 1]?.meta?.result).toBe('30')
  })

  it('reports isEmpty and size', () => {
    const emptySteps = buildDequeSteps([], 'is-empty')
    expect(emptySteps[emptySteps.length - 1]?.meta?.result).toBe('true')

    const sizeSteps = buildDequeSteps([10, 20, 30], 'size')
    expect(sizeSteps[sizeSteps.length - 1]?.meta?.result).toBe('3')
  })

  it('keeps historical snapshots stable under scrubbing', () => {
    const steps = buildDequeSteps([10, 20], 'push-back', 30)
    expect(steps.length).toBeGreaterThan(2)
    const firstRaw = steps[0]!.meta!.dequeSnapshot as string
    const firstValues = toArray(parseDequeSnapshot(firstRaw))
    expect(firstValues).toEqual([10, 20])

    const last = snapshotFromFinalStep(steps)
    expect(toArray(last)).toEqual([10, 20, 30])

    // Re-parse first after reading last — history unchanged.
    expect(toArray(parseDequeSnapshot(firstRaw))).toEqual([10, 20])
    expect(steps[steps.length - 1]?.operation).toBe('complete')
  })

  it('rejects invalid operands without changing the deque', () => {
    const steps = buildDequeSteps([10, 20], 'push-front')
    expect(steps.some((step) => step.meta?.phase === 'invalid')).toBe(true)
    expect(valuesFromFinalStep(steps)).toEqual([10, 20])
  })

  it('reports educational overflow', () => {
    const steps = buildDequeSteps([1, 2], 'push-back', 3, 2)
    expect(steps.some((step) => step.meta?.phase === 'overflow')).toBe(true)
    expect(valuesFromFinalStep(steps)).toEqual([1, 2])
  })

  it('distinguishes front vs rear insert phases', () => {
    const frontSteps = buildDequeSteps([10], 'push-front', 5)
    expect(frontSteps.some((step) => step.meta?.phase === 'push-front')).toBe(
      true,
    )
    expect(frontSteps.some((step) => step.meta?.direction === 'front')).toBe(
      true,
    )

    const backSteps = buildDequeSteps([10], 'push-back', 20)
    expect(backSteps.some((step) => step.meta?.phase === 'push-back')).toBe(
      true,
    )
    expect(backSteps.some((step) => step.meta?.direction === 'rear')).toBe(
      true,
    )
  })
})
