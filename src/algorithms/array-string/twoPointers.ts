/**
 * Two Pointers — sorted two-sum.
 *
 * Pure algorithm module used by the lesson code examples and visualization.
 * Requires a sorted ascending array. Does not mutate the input.
 */

export const TWO_POINTERS_DEFAULT_ARRAY = [1, 2, 3, 4, 6, 8, 9] as const

export const TWO_POINTERS_ALT_ARRAY = [1, 2, 3, 4, 5] as const

export const TWO_POINTERS_NEGATIVE_ARRAY = [-10, -5, 0, 5, 10] as const

export const TWO_POINTERS_DEFAULT_TARGET = 10
export const TWO_POINTERS_NOT_FOUND_TARGET = 100

export const TWO_POINTERS_TARGET_PRESETS = [
  10, 7, 12, 20, 100,
] as const

export const TWO_POINTERS_ARRAY_PRESETS = [
  {
    id: 'lesson-default',
    label: 'Lesson array',
    values: TWO_POINTERS_DEFAULT_ARRAY,
  },
  {
    id: 'small-sorted',
    label: 'Small sorted',
    values: TWO_POINTERS_ALT_ARRAY,
  },
  {
    id: 'with-negatives',
    label: 'With negatives',
    values: TWO_POINTERS_NEGATIVE_ARRAY,
  },
] as const

/**
 * Find two indices in a sorted ascending array whose values sum to target.
 * Returns the first valid pair encountered by the classic left/right scan,
 * or [-1, -1] when no pair exists.
 */
export function twoSumSorted(
  arr: readonly number[],
  target: number,
): number[] {
  let left = 0
  let right = arr.length - 1

  while (left < right) {
    const currentSum = arr[left]! + arr[right]!

    if (currentSum === target) {
      return [left, right]
    }

    if (currentSum < target) {
      left += 1
    } else {
      right -= 1
    }
  }

  return [-1, -1]
}
