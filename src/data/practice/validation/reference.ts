import { groupAnagrams } from '../../../algorithms/array-string/groupAnagrams'
import { findMostFrequent } from '../../../algorithms/array-string/frequencyCounting'
import { maxSubarray } from '../../../algorithms/array-string/kadanesAlgorithm'
import { longestSubstringWithoutRepeating } from '../../../algorithms/array-string/longestSubstringWithoutRepeating'
import {
  buildPrefixSum,
  rangeSum,
} from '../../../algorithms/array-string/prefixSum'
import { maxSumSubarray } from '../../../algorithms/array-string/slidingWindow'
import { twoSumSorted } from '../../../algorithms/array-string/twoPointers'
import { isValidAnagram } from '../../../algorithms/array-string/validAnagram'
import { binarySearch } from '../../../lib/binarySearch'
import { linearSearch } from '../../../lib/linearSearch'
import type { PracticeComparableValue, PracticeTestCaseInput } from './types'

function asNumberArray(value: PracticeComparableValue | undefined): number[] {
  if (!Array.isArray(value)) {
    throw new Error('Expected a number array input.')
  }

  return value.map((item) => {
    if (typeof item !== 'number') {
      throw new Error('Expected numeric array elements.')
    }
    return item
  })
}

function asStringArray(value: PracticeComparableValue | undefined): string[] {
  if (!Array.isArray(value)) {
    throw new Error('Expected a string array input.')
  }

  return value.map((item) => {
    if (typeof item !== 'string') {
      throw new Error('Expected string array elements.')
    }
    return item
  })
}

function asNumber(value: PracticeComparableValue | undefined, label: string): number {
  if (typeof value !== 'number') {
    throw new Error(`Expected numeric “${label}”.`)
  }
  return value
}

function asString(value: PracticeComparableValue | undefined, label: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Expected string “${label}”.`)
  }
  return value
}

/**
 * Run the trusted lesson/reference implementation for a supported problem.
 * Deterministic and UI-independent. Does not execute learner source code.
 */
export function runTrustedReference(
  problemSlug: string,
  input: PracticeTestCaseInput,
): PracticeComparableValue {
  switch (problemSlug) {
    case 'find-an-element':
      return linearSearch(
        asNumberArray(input.arr),
        asNumber(input.target, 'target'),
      )

    case 'find-target-sorted-array':
      return binarySearch(
        asNumberArray(input.arr),
        asNumber(input.target, 'target'),
      )

    case 'two-sum-sorted':
      return twoSumSorted(
        asNumberArray(input.arr),
        asNumber(input.target, 'target'),
      )

    case 'max-sum-fixed-window':
      return maxSumSubarray(
        asNumberArray(input.arr),
        asNumber(input.k, 'k'),
      )

    case 'range-sum-queries': {
      const arr = asNumberArray(input.arr)
      const left = asNumber(input.left, 'left')
      const right = asNumber(input.right, 'right')
      const prefix = buildPrefixSum(arr)
      return rangeSum(prefix, left, right)
    }

    case 'most-frequent-number':
      return findMostFrequent(asNumberArray(input.arr))

    case 'maximum-subarray-sum': {
      const result = maxSubarray(asNumberArray(input.arr))
      if (result === null) {
        return null
      }
      return {
        maxSum: result.maxSum,
        start: result.start,
        end: result.end,
      }
    }

    case 'longest-substring-no-repeat': {
      const result = longestSubstringWithoutRepeating(asString(input.s, 's'))
      return {
        length: result.length,
        start: result.start,
        end: result.end,
      }
    }

    case 'valid-anagram':
      return isValidAnagram(
        asString(input.first, 'first'),
        asString(input.second, 'second'),
      )

    case 'group-anagrams':
      return groupAnagrams(asStringArray(input.words))

    default:
      throw new Error(
        `No trusted reference implementation is registered for “${problemSlug}”.`,
      )
  }
}

export function hasTrustedReference(problemSlug: string): boolean {
  try {
    // Cheap registry check without running algorithms.
    switch (problemSlug) {
      case 'find-an-element':
      case 'find-target-sorted-array':
      case 'two-sum-sorted':
      case 'max-sum-fixed-window':
      case 'range-sum-queries':
      case 'most-frequent-number':
      case 'maximum-subarray-sum':
      case 'longest-substring-no-repeat':
      case 'valid-anagram':
      case 'group-anagrams':
        return true
      default:
        return false
    }
  } catch {
    return false
  }
}
