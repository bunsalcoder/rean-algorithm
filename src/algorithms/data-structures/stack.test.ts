import { describe, expect, it } from 'vitest'
import {
  clear,
  cloneSnapshot,
  formatStack,
  isEmpty,
  peek,
  pop,
  push,
  size,
  snapshotFromArray,
  toArray,
  topIndex,
} from './stack'
import {
  buildStackSteps,
  parseStackSnapshot,
  serializeStackSnapshot,
  valuesFromFinalStep,
} from './stackSteps'

describe('snapshot / toArray / topIndex', () => {
  it('treats the last array element as the top', () => {
    const snapshot = snapshotFromArray([10, 20, 30])
    expect(toArray(snapshot)).toEqual([10, 20, 30])
    expect(topIndex(snapshot)).toBe(2)
    expect(peek(snapshot)).toBe(30)
    expect(formatStack(toArray(snapshot))).toContain('top = 30')
  })

  it('handles an empty stack', () => {
    const empty = snapshotFromArray([])
    expect(toArray(empty)).toEqual([])
    expect(topIndex(empty)).toBe(-1)
    expect(peek(empty)).toBeUndefined()
    expect(isEmpty(empty)).toBe(true)
    expect(size(empty)).toBe(0)
  })

  it('clones snapshots so later edits do not rewrite history', () => {
    const original = snapshotFromArray([1, 2])
    const copy = cloneSnapshot(original)
    const mutated = {
      ...copy,
      values: copy.values.map((value, index) => (index === 0 ? 99 : value)),
    }
    expect(toArray(original)).toEqual([1, 2])
    expect(toArray(mutated)).toEqual([99, 2])
  })
})

describe('push', () => {
  it('pushes into an empty stack', () => {
    const { snapshot, ok } = push(snapshotFromArray([]), 10)
    expect(ok).toBe(true)
    expect(toArray(snapshot)).toEqual([10])
    expect(peek(snapshot)).toBe(10)
  })

  it('supports multiple pushes', () => {
    let snapshot = snapshotFromArray([])
    snapshot = push(snapshot, 10).snapshot
    snapshot = push(snapshot, 20).snapshot
    snapshot = push(snapshot, 30).snapshot
    expect(toArray(snapshot)).toEqual([10, 20, 30])
    expect(peek(snapshot)).toBe(30)
  })

  it('does not mutate the previous snapshot', () => {
    const before = snapshotFromArray([10, 20])
    push(before, 30)
    expect(toArray(before)).toEqual([10, 20])
  })

  it('rejects push when educational capacity is full', () => {
    const full = snapshotFromArray([1, 2], 2)
    const result = push(full, 3)
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('overflow')
    expect(toArray(result.snapshot)).toEqual([1, 2])
  })
})

describe('pop', () => {
  it('pops from a non-empty stack', () => {
    const { snapshot, value, ok } = pop(snapshotFromArray([10, 20, 30]))
    expect(ok).toBe(true)
    expect(value).toBe(30)
    expect(toArray(snapshot)).toEqual([10, 20])
  })

  it('reports underflow on an empty stack without changing state', () => {
    const empty = snapshotFromArray([])
    const result = pop(empty)
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('underflow')
    expect(result.value).toBeUndefined()
    expect(toArray(result.snapshot)).toEqual([])
  })

  it('does not mutate the previous snapshot', () => {
    const before = snapshotFromArray([10, 20])
    pop(before)
    expect(toArray(before)).toEqual([10, 20])
  })
})

describe('peek / isEmpty / size / clear', () => {
  it('peeks without mutation', () => {
    const snapshot = snapshotFromArray([10, 20, 30])
    expect(peek(snapshot)).toBe(30)
    expect(toArray(snapshot)).toEqual([10, 20, 30])
  })

  it('reports undefined peek on empty', () => {
    expect(peek(snapshotFromArray([]))).toBeUndefined()
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
})

describe('buildStackSteps', () => {
  it('pushes and matches the pure API', () => {
    const steps = buildStackSteps([10, 20], 'push', 30)
    expect(valuesFromFinalStep(steps)).toEqual(
      toArray(push(snapshotFromArray([10, 20]), 30).snapshot),
    )
    expect(steps[steps.length - 1]?.meta?.success).toBe(true)
    expect(steps[steps.length - 1]?.meta?.result).toBe('30')
  })

  it('pops from a non-empty stack', () => {
    const steps = buildStackSteps([10, 20, 30], 'pop')
    expect(valuesFromFinalStep(steps)).toEqual([10, 20])
    expect(steps[steps.length - 1]?.meta?.result).toBe('30')
    expect(steps[steps.length - 1]?.meta?.success).toBe(true)
  })

  it('explains underflow on empty pop and peek', () => {
    const popSteps = buildStackSteps([], 'pop')
    expect(valuesFromFinalStep(popSteps)).toEqual([])
    expect(popSteps.some((step) => step.meta?.phase === 'underflow')).toBe(true)
    expect(popSteps[popSteps.length - 1]?.meta?.success).toBe(false)

    const peekSteps = buildStackSteps([], 'peek')
    expect(valuesFromFinalStep(peekSteps)).toEqual([])
    expect(peekSteps.some((step) => step.meta?.phase === 'underflow')).toBe(true)
  })

  it('peeks without changing the stack', () => {
    const steps = buildStackSteps([10, 20, 30], 'peek')
    expect(valuesFromFinalStep(steps)).toEqual([10, 20, 30])
    expect(steps[steps.length - 1]?.meta?.result).toBe('30')
  })

  it('reports isEmpty and size', () => {
    const emptySteps = buildStackSteps([], 'is-empty')
    expect(emptySteps[emptySteps.length - 1]?.meta?.result).toBe('true')

    const sizeSteps = buildStackSteps([10, 20, 30], 'size')
    expect(sizeSteps[sizeSteps.length - 1]?.meta?.result).toBe('3')
    expect(valuesFromFinalStep(sizeSteps)).toEqual([10, 20, 30])
  })

  it('keeps historical snapshots stable when later frames change', () => {
    const steps = buildStackSteps([10, 20], 'push', 30)
    expect(steps.length).toBeGreaterThan(2)

    const firstRaw = steps[0]?.meta?.stackSnapshot
    expect(typeof firstRaw).toBe('string')
    const firstSnapshot = parseStackSnapshot(firstRaw as string)
    expect(toArray(firstSnapshot)).toEqual([10, 20])

    const lastRaw = steps[steps.length - 1]?.meta?.stackSnapshot
    const lastSnapshot = parseStackSnapshot(lastRaw as string)
    expect(toArray(lastSnapshot)).toEqual([10, 20, 30])

    const edited = {
      ...lastSnapshot,
      values: lastSnapshot.values.map((value, index) =>
        index === 0 ? 999 : value,
      ),
    }
    expect(serializeStackSnapshot(edited)).not.toEqual(firstRaw)
    expect(parseStackSnapshot(firstRaw as string)).toEqual(firstSnapshot)
  })

  it('supports previous/next/reset style scrubbing via independent frames', () => {
    const steps = buildStackSteps([10, 20], 'push', 30)
    expect(steps.length).toBeGreaterThan(3)

    const first = steps[0]!
    const last = steps[steps.length - 1]!

    expect(
      toArray(parseStackSnapshot(first.meta?.stackSnapshot as string)),
    ).toEqual([10, 20])
    expect(
      toArray(parseStackSnapshot(last.meta?.stackSnapshot as string)),
    ).toEqual([10, 20, 30])
    expect(last.operation).toBe('complete')
    expect(first.meta?.stackSnapshot).not.toEqual(last.meta?.stackSnapshot)

    // Scrubbing back to an earlier frame must still show the original stack.
    const earlier = steps.find(
      (step) =>
        toArray(parseStackSnapshot(step.meta?.stackSnapshot as string)).length ===
        2,
    )
    expect(earlier).toBeDefined()
    expect(
      toArray(parseStackSnapshot(earlier!.meta?.stackSnapshot as string)),
    ).toEqual([10, 20])
  })

  it('handles invalid push input without changing the stack', () => {
    const steps = buildStackSteps([10, 20], 'push')
    expect(valuesFromFinalStep(steps)).toEqual([10, 20])
    expect(steps[0]?.meta?.phase).toBe('invalid')
    expect(steps[steps.length - 1]?.meta?.success).toBe(false)
  })

  it('demonstrates educational overflow without mutating the stack', () => {
    const steps = buildStackSteps([1, 2], 'push', 3, 2)
    expect(valuesFromFinalStep(steps)).toEqual([1, 2])
    expect(steps.some((step) => step.meta?.phase === 'overflow')).toBe(true)
    expect(steps[steps.length - 1]?.meta?.success).toBe(false)
  })
})
