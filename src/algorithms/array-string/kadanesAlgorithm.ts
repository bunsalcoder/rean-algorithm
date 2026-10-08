/**
 * Kadane's Algorithm — maximum contiguous subarray sum.
 *
 * Pure algorithm module used by the lesson code examples and visualization.
 * Does not mutate the input. Initializes from the first element so all-negative
 * arrays return the largest (least negative) value, never 0 by default.
 */

export type MaximumSubarrayResult = {
  maxSum: number
  start: number
  end: number
}

export const KADANES_DEFAULT_ARRAY = [
  -2, 1, -3, 4, -1, 2, 1, -5, 4,
] as const

export const KADANES_ALL_NEGATIVE_ARRAY = [-8, -3, -5, -2] as const

export const KADANES_SINGLE_POSITIVE_ARRAY = [5] as const

export const KADANES_SINGLE_NEGATIVE_ARRAY = [-5] as const

export const KADANES_ALL_POSITIVE_ARRAY = [1, 2, 3, 4] as const

export const KADANES_MIXED_ARRAY = [5, -2, 3, 4, -10] as const

export const KADANES_ZEROS_ARRAY = [0, 0, 0] as const

export const KADANES_ARRAY_PRESETS = [
  {
    id: 'lesson-default',
    label: 'Lesson array',
    values: KADANES_DEFAULT_ARRAY,
  },
  {
    id: 'all-negative',
    label: 'All negative',
    values: KADANES_ALL_NEGATIVE_ARRAY,
  },
  {
    id: 'all-positive',
    label: 'All positive',
    values: KADANES_ALL_POSITIVE_ARRAY,
  },
  {
    id: 'mixed',
    label: 'Mixed',
    values: KADANES_MIXED_ARRAY,
  },
  {
    id: 'zeros',
    label: 'Zeros',
    values: KADANES_ZEROS_ARRAY,
  },
  {
    id: 'single-positive',
    label: 'Single positive',
    values: KADANES_SINGLE_POSITIVE_ARRAY,
  },
  {
    id: 'single-negative',
    label: 'Single negative',
    values: KADANES_SINGLE_NEGATIVE_ARRAY,
  },
] as const

/** Slice of the contiguous subarray from start to end (inclusive). */
export function getSubarray(
  arr: readonly number[],
  start: number,
  end: number,
): number[] {
  if (
    arr.length === 0 ||
    start < 0 ||
    end < 0 ||
    start > end ||
    end >= arr.length
  ) {
    return []
  }
  return arr.slice(start, end + 1)
}

/**
 * Find the contiguous subarray with the largest sum.
 * Empty arrays return null. Single-element arrays return that element.
 */
export function maxSubarray(
  arr: readonly number[],
): MaximumSubarrayResult | null {
  if (arr.length === 0) {
    return null
  }

  let currentSum = arr[0]!
  let bestSum = arr[0]!

  let currentStart = 0
  let bestStart = 0
  let bestEnd = 0

  for (let i = 1; i < arr.length; i += 1) {
    const value = arr[i]!

    if (value > currentSum + value) {
      currentSum = value
      currentStart = i
    } else {
      currentSum += value
    }

    if (currentSum > bestSum) {
      bestSum = currentSum
      bestStart = currentStart
      bestEnd = i
    }
  }

  return {
    maxSum: bestSum,
    start: bestStart,
    end: bestEnd,
  }
}
