import { describe, expect, it } from 'vitest'
import {
  normalizeRotationK,
  reverseRangeInPlace,
  rotateArrayRight,
} from './rotateArray'
import { buildRotateArraySteps } from './rotateArraySteps'

function arrayFromFinalStep(
  input: readonly number[],
  k: number,
): number[] {
  const steps = buildRotateArraySteps(input, k)
  const last = steps[steps.length - 1]
  return last?.array ? [...last.array] : []
}

describe('normalizeRotationK', () => {
  it('maps negative k to an equivalent right rotation', () => {
    expect(normalizeRotationK(-1, 7)).toBe(6)
    expect(normalizeRotationK(-3, 7)).toBe(4)
  })

  it('reduces k larger than n', () => {
    expect(normalizeRotationK(10, 7)).toBe(3)
    expect(normalizeRotationK(7, 7)).toBe(0)
  })

  it('returns 0 for empty length', () => {
    expect(normalizeRotationK(5, 0)).toBe(0)
  })
})

describe('reverseRangeInPlace', () => {
  it('reverses a subrange without extra slices', () => {
    const arr = [1, 2, 3, 4, 5]
    reverseRangeInPlace(arr, 1, 3)
    expect(arr).toEqual([1, 4, 3, 2, 5])
  })

  it('is a no-op for empty or single-element ranges', () => {
    const arr = [1, 2, 3]
    reverseRangeInPlace(arr, 2, 1)
    expect(arr).toEqual([1, 2, 3])
    reverseRangeInPlace(arr, 1, 1)
    expect(arr).toEqual([1, 2, 3])
  })
})

describe('rotateArrayRight', () => {
  it('rotates the default example right by 3', () => {
    expect(rotateArrayRight([1, 2, 3, 4, 5, 6, 7], 3)).toEqual([
      5, 6, 7, 1, 2, 3, 4,
    ])
  })

  it('handles k = 0', () => {
    expect(rotateArrayRight([1, 2, 3, 4, 5], 0)).toEqual([1, 2, 3, 4, 5])
  })

  it('handles k equal to array length', () => {
    expect(rotateArrayRight([1, 2, 3, 4], 4)).toEqual([1, 2, 3, 4])
  })

  it('handles k larger than array length', () => {
    expect(rotateArrayRight([1, 2, 3, 4, 5], 8)).toEqual([3, 4, 5, 1, 2])
  })

  it('handles an empty array', () => {
    expect(rotateArrayRight([], 3)).toEqual([])
  })

  it('handles a single-element array', () => {
    expect(rotateArrayRight([9], 5)).toEqual([9])
  })

  it('preserves duplicate values', () => {
    expect(rotateArrayRight([2, 2, 3, 3], 2)).toEqual([3, 3, 2, 2])
  })

  it('normalizes negative k to an equivalent right rotation', () => {
    // k = -1 ≡ right by 6 on length 7
    expect(rotateArrayRight([1, 2, 3, 4, 5, 6, 7], -1)).toEqual([
      2, 3, 4, 5, 6, 7, 1,
    ])
    expect(rotateArrayRight([1, 2, 3, 4, 5, 6, 7], -1)).toEqual(
      rotateArrayRight([1, 2, 3, 4, 5, 6, 7], 6),
    )
  })

  it('does not mutate the input array', () => {
    const input = [1, 2, 3, 4, 5, 6, 7]
    const snapshot = [...input]
    rotateArrayRight(input, 3)
    expect(input).toEqual(snapshot)
  })
})

describe('buildRotateArraySteps', () => {
  it('final array matches rotateArrayRight for the default example', () => {
    const input = [1, 2, 3, 4, 5, 6, 7]
    expect(arrayFromFinalStep(input, 3)).toEqual(rotateArrayRight(input, 3))
  })

  it('final array matches rotateArrayRight for edge cases', () => {
    const cases: { input: number[]; k: number }[] = [
      { input: [], k: 3 },
      { input: [9], k: 5 },
      { input: [1, 2, 3, 4, 5], k: 0 },
      { input: [1, 2, 3, 4], k: 4 },
      { input: [1, 2, 3, 4, 5], k: 8 },
      { input: [2, 2, 3, 3], k: 2 },
      { input: [1, 2, 3, 4, 5, 6, 7], k: -1 },
      { input: [1, 2, 3], k: -5 },
    ]

    for (const { input, k } of cases) {
      expect(arrayFromFinalStep(input, k)).toEqual(rotateArrayRight(input, k))
    }
  })

  it('marks the final step complete', () => {
    const steps = buildRotateArraySteps([1, 2, 3, 4, 5, 6, 7], 3)
    const last = steps[steps.length - 1]
    expect(last?.meta?.phase).toBe('complete')
    expect(last?.meta?.isComplete).toBe(true)
    expect(last?.operation).toBe('complete')
  })

  it('simulates actual swaps through the three phases', () => {
    const steps = buildRotateArraySteps([1, 2, 3, 4, 5, 6, 7], 3)
    const phases = steps
      .map((step) => step.meta?.phase)
      .filter((phase) => typeof phase === 'string')

    expect(phases).toContain('normalize-k')
    expect(phases).toContain('reverse-start')
    expect(phases).toContain('swap')
    expect(phases).toContain('phase-complete')
    expect(phases.filter((phase) => phase === 'reverse-start')).toHaveLength(3)
  })
})
