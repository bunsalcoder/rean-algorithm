import { describe, expect, it } from 'vitest'
import { getAvailableArrayStringAlgorithms } from './array-string'
import {
  arrayStringComparisonAlgorithms,
  arrayStringComparisonLearningOrder,
  arrayStringDecisionCards,
  arrayStringMisconceptions,
  arrayStringProblemOptions,
  getArrayStringComparisonBySlug,
  getArrayStringProblemOption,
  getImplementedArrayStringComparisons,
  getImplementedArrayStringLearningOrder,
} from './array-string-comparison'
import { getLesson } from '../lessons'

const EXPECTED_COMPLEXITY: Record<
  string,
  { time: string; space: string }
> = {
  'two-pointers': { time: 'O(n)', space: 'O(1)' },
  'sliding-window': { time: 'O(n)', space: 'O(1)' },
  'prefix-sum': { time: 'O(n) prep + O(1)/query', space: 'O(n)' },
  'frequency-counting': { time: 'O(n) expected', space: 'O(k)' },
  'kadanes-algorithm': { time: 'O(n)', space: 'O(1)' },
  'longest-substring-without-repeating': {
    time: 'O(n) expected',
    space: 'O(k)',
  },
  'valid-anagram': { time: 'O(n) expected', space: 'O(k)' },
  'group-anagrams': { time: 'O(n × m log m)', space: 'O(n × m)' },
  'string-compression': { time: 'O(n)', space: 'O(n)' },
  'rotate-array': {
    time: 'O(n)',
    space: 'O(n) API / O(1) in-place helper',
  },
}

describe('array-string comparison data', () => {
  it('includes only implemented hub algorithms with registered lessons', () => {
    const comparisons = getImplementedArrayStringComparisons()
    const availableSlugs = new Set(
      getAvailableArrayStringAlgorithms().map((algorithm) => algorithm.slug),
    )

    expect(comparisons.length).toBe(10)
    expect(comparisons.some((item) => item.slug === 'maximum-subarray')).toBe(
      false,
    )

    for (const algorithm of comparisons) {
      expect(availableSlugs.has(algorithm.slug)).toBe(true)
      expect(algorithm.available).toBe(true)

      const lessonSlug = algorithm.lessonHref.replace(/^\/learn\//, '')
      expect(getLesson(lessonSlug)).toBeDefined()
      expect(algorithm.lessonHref.startsWith('/learn/')).toBe(true)
    }
  })

  it('keeps complexity labels consistent with documented implementations', () => {
    for (const algorithm of arrayStringComparisonAlgorithms) {
      const expected = EXPECTED_COMPLEXITY[algorithm.slug]
      expect(expected).toBeDefined()
      expect(algorithm.timeComplexity).toBe(expected!.time)
      expect(algorithm.spaceComplexity).toBe(expected!.space)
    }
  })

  it('resolves every comparison and learning-order lesson link', () => {
    for (const algorithm of getImplementedArrayStringComparisons()) {
      const lessonSlug = algorithm.lessonHref.replace(/^\/learn\//, '')
      expect(getLesson(lessonSlug)?.slug).toBe(lessonSlug)
    }

    for (const item of getImplementedArrayStringLearningOrder()) {
      const lessonSlug = item.lessonHref.replace(/^\/learn\//, '')
      expect(getLesson(lessonSlug)?.slug).toBe(lessonSlug)
    }
  })

  it('preserves learning order and skips missing lessons gracefully', () => {
    const order = getImplementedArrayStringLearningOrder()
    const expectedOrder = arrayStringComparisonLearningOrder.map(
      (item) => item.slug,
    )

    expect(order.map((item) => item.slug)).toEqual(expectedOrder)
    expect(order).toHaveLength(10)
  })

  it('updates the problem selector recommendation when the option changes', () => {
    const pair = getArrayStringProblemOption('sorted-pair-sum')
    const range = getArrayStringProblemOption('many-range-sums')
    const maxSum = getArrayStringProblemOption('max-contiguous-sum')

    expect(pair?.primarySlug).toBe('two-pointers')
    expect(range?.primarySlug).toBe('prefix-sum')
    expect(maxSum?.primarySlug).toBe('kadanes-algorithm')
    expect(maxSum?.alternativeSlugs).toContain('sliding-window')

    expect(getArrayStringComparisonBySlug(pair!.primarySlug)?.lessonHref).toBe(
      '/learn/two-pointers',
    )
    expect(getArrayStringComparisonBySlug(range!.primarySlug)?.lessonHref).toBe(
      '/learn/prefix-sum',
    )
  })

  it('covers decision cards and misconceptions without empty content', () => {
    expect(arrayStringDecisionCards.length).toBeGreaterThanOrEqual(8)
    expect(arrayStringMisconceptions.length).toBeGreaterThanOrEqual(6)
    expect(arrayStringProblemOptions.length).toBe(10)

    for (const card of arrayStringDecisionCards) {
      expect(card.clue.length).toBeGreaterThan(0)
      expect(card.recommendation.length).toBeGreaterThan(0)
      expect(card.limitation.length).toBeGreaterThan(0)
      expect(getArrayStringComparisonBySlug(card.lessonSlug)).toBeDefined()
    }

    for (const item of arrayStringMisconceptions) {
      expect(item.claim.length).toBeGreaterThan(0)
      expect(item.correction.length).toBeGreaterThan(0)
    }
  })

  it('does not invent unavailable destinations for selector alternatives', () => {
    for (const option of arrayStringProblemOptions) {
      const primary = getArrayStringComparisonBySlug(option.primarySlug)
      expect(primary).toBeDefined()
      expect(getLesson(primary!.lessonHref.replace(/^\/learn\//, ''))).toBeDefined()

      for (const slug of option.alternativeSlugs) {
        const alternative = getArrayStringComparisonBySlug(slug)
        expect(alternative).toBeDefined()
        expect(
          getLesson(alternative!.lessonHref.replace(/^\/learn\//, '')),
        ).toBeDefined()
      }
    }
  })
})
