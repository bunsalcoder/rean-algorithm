/**
 * Sliding Window — fixed-size maximum subarray sum.
 *
 * Pure algorithm module used by the lesson code examples and visualization.
 * Works on contiguous ranges; the array does not need to be sorted.
 * Does not mutate the input.
 */

export const SLIDING_WINDOW_DEFAULT_ARRAY = [2, 1, 5, 1, 3, 2] as const

export const SLIDING_WINDOW_ALT_ARRAY = [1, 2, 3, 4, 5] as const

export const SLIDING_WINDOW_NEGATIVE_ARRAY = [5, -1, 3, 2] as const

export const SLIDING_WINDOW_ALL_NEGATIVE_ARRAY = [-5, -2, -8, -1] as const

export const SLIDING_WINDOW_DEFAULT_SIZE = 3

export const SLIDING_WINDOW_SIZE_PRESETS = [2, 3, 4, 5] as const

export const SLIDING_WINDOW_ARRAY_PRESETS = [
  {
    id: 'lesson-default',
    label: 'Lesson array',
    values: SLIDING_WINDOW_DEFAULT_ARRAY,
  },
  {
    id: 'small-positive',
    label: 'Small positive',
    values: SLIDING_WINDOW_ALT_ARRAY,
  },
  {
    id: 'with-negatives',
    label: 'With negatives',
    values: SLIDING_WINDOW_NEGATIVE_ARRAY,
  },
  {
    id: 'all-negatives',
    label: 'All negatives',
    values: SLIDING_WINDOW_ALL_NEGATIVE_ARRAY,
  },
] as const

/**
 * Find the maximum sum of any contiguous subarray of the given fixed size.
 * Returns 0 when the array is empty or the window size is invalid.
 */
export function maxSumSubarray(
  arr: readonly number[],
  windowSize: number,
): number {
  if (arr.length === 0 || windowSize <= 0 || windowSize > arr.length) {
    return 0
  }

  let windowSum = 0

  for (let i = 0; i < windowSize; i += 1) {
    windowSum += arr[i]!
  }

  let maxSum = windowSum

  for (let i = windowSize; i < arr.length; i += 1) {
    windowSum += arr[i]!
    windowSum -= arr[i - windowSize]!
    maxSum = Math.max(maxSum, windowSum)
  }

  return maxSum
}

/** True when windowSize is a valid fixed window for the given array. */
export function isValidWindowSize(
  arr: readonly number[],
  windowSize: number,
): boolean {
  return (
    Number.isInteger(windowSize) &&
    windowSize >= 1 &&
    windowSize <= arr.length
  )
}
