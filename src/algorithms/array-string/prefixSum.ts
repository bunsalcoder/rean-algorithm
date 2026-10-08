/**
 * Prefix Sum — preprocess an array for efficient range-sum queries.
 *
 * Pure algorithm module used by the lesson code examples and visualization.
 * Uses the leading-zero convention: prefix[i] = sum of the first i elements.
 * Does not mutate the input.
 */

export const PREFIX_SUM_DEFAULT_ARRAY = [2, 4, 1, 6, 3, 5] as const

export const PREFIX_SUM_ALT_ARRAY = [1, 2, 3, 4, 5] as const

export const PREFIX_SUM_NEGATIVE_ARRAY = [-3, 2, -1, 4] as const

export const PREFIX_SUM_ZEROS_ARRAY = [0, 0, 0] as const

export const PREFIX_SUM_DEFAULT_LEFT = 1

export const PREFIX_SUM_DEFAULT_RIGHT = 4

export const PREFIX_SUM_ARRAY_PRESETS = [
  {
    id: 'lesson-default',
    label: 'Lesson array',
    values: PREFIX_SUM_DEFAULT_ARRAY,
  },
  {
    id: 'small-positive',
    label: 'Small positive',
    values: PREFIX_SUM_ALT_ARRAY,
  },
  {
    id: 'with-negatives',
    label: 'With negatives',
    values: PREFIX_SUM_NEGATIVE_ARRAY,
  },
  {
    id: 'zeros',
    label: 'All zeros',
    values: PREFIX_SUM_ZEROS_ARRAY,
  },
] as const

/**
 * Build a prefix sum array with a leading zero.
 * prefix[i] is the sum of the first i elements of arr.
 */
export function buildPrefixSum(arr: readonly number[]): number[] {
  const prefix = new Array<number>(arr.length + 1).fill(0)

  for (let i = 0; i < arr.length; i += 1) {
    prefix[i + 1] = prefix[i]! + arr[i]!
  }

  return prefix
}

/**
 * Range sum for inclusive indices [left, right] using a leading-zero prefix.
 * Formula: prefix[right + 1] - prefix[left]
 */
export function rangeSum(
  prefix: readonly number[],
  left: number,
  right: number,
): number {
  return prefix[right + 1]! - prefix[left]!
}

/** True when 0 <= left <= right < arr.length. */
export function isValidRange(
  arr: readonly number[],
  left: number,
  right: number,
): boolean {
  return (
    arr.length > 0 &&
    Number.isInteger(left) &&
    Number.isInteger(right) &&
    left >= 0 &&
    right < arr.length &&
    left <= right
  )
}

/**
 * Clamp a requested range into valid bounds for the given array.
 * Empty arrays return left = 0, right = -1 (invalid sentinel).
 */
export function clampRange(
  arr: readonly number[],
  left: number,
  right: number,
): { left: number; right: number } {
  if (arr.length === 0) {
    return { left: 0, right: -1 }
  }

  const maxIndex = arr.length - 1
  let nextLeft = Number.isInteger(left) ? left : 0
  let nextRight = Number.isInteger(right) ? right : maxIndex

  nextLeft = Math.min(Math.max(nextLeft, 0), maxIndex)
  nextRight = Math.min(Math.max(nextRight, 0), maxIndex)

  if (nextLeft > nextRight) {
    nextRight = nextLeft
  }

  return { left: nextLeft, right: nextRight }
}
