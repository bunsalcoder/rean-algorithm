/**
 * Rotate Array — right-rotate by k positions using three reversals.
 *
 * Pure algorithm module for lessons and visualization.
 * The public function copies the input, then reverses in place on that copy.
 * Negative k is normalized to an equivalent right rotation via
 * `((k % n) + n) % n` (e.g. left by 1 ≡ right by n − 1).
 *
 * Space: O(n) overall for the copy-preserving API; O(1) auxiliary space
 * for the in-place reversal helper on the working array.
 */

export const ROTATE_ARRAY_DEFAULT_ARRAY = [1, 2, 3, 4, 5, 6, 7] as const
export const ROTATE_ARRAY_DEFAULT_K = 3

export type RotateArrayPreset = {
  id: string
  label: string
  values: readonly number[]
  k: number
}

export const ROTATE_ARRAY_PRESETS: readonly RotateArrayPreset[] = [
  {
    id: 'lesson-default',
    label: '[1…7], k=3',
    values: ROTATE_ARRAY_DEFAULT_ARRAY,
    k: 3,
  },
  {
    id: 'k-zero',
    label: '[1…5], k=0',
    values: [1, 2, 3, 4, 5],
    k: 0,
  },
  {
    id: 'k-equals-n',
    label: '[1…4], k=4',
    values: [1, 2, 3, 4],
    k: 4,
  },
  {
    id: 'k-larger',
    label: '[1…5], k=8',
    values: [1, 2, 3, 4, 5],
    k: 8,
  },
  {
    id: 'negative-k',
    label: '[1…7], k=-1',
    values: ROTATE_ARRAY_DEFAULT_ARRAY,
    k: -1,
  },
  {
    id: 'duplicates',
    label: '[2,2,3,3], k=2',
    values: [2, 2, 3, 3],
    k: 2,
  },
  {
    id: 'single',
    label: '[9], k=5',
    values: [9],
    k: 5,
  },
  {
    id: 'empty',
    label: '[], k=3',
    values: [],
    k: 3,
  },
] as const

/**
 * Normalize k to a right-rotation count in `[0, n)`.
 * Negative values map to the equivalent right rotation.
 * When n is 0, returns 0.
 */
export function normalizeRotationK(k: number, n: number): number {
  if (n === 0) {
    return 0
  }
  return ((k % n) + n) % n
}

/**
 * Reverse `arr[left…right]` in place with two pointers (O(1) auxiliary space).
 * Empty or single-element ranges are no-ops.
 */
export function reverseRangeInPlace(
  arr: number[],
  left: number,
  right: number,
): void {
  let lo = left
  let hi = right
  while (lo < hi) {
    const tmp = arr[lo]!
    arr[lo] = arr[hi]!
    arr[hi] = tmp
    lo += 1
    hi -= 1
  }
}

/**
 * Right-rotate a copy of `nums` by `k` positions using three reversals.
 * Does not mutate the caller's array. Empty input returns `[]`.
 */
export function rotateArrayRight(nums: number[], k: number): number[] {
  const n = nums.length
  if (n === 0) {
    return []
  }

  const normalizedK = normalizeRotationK(k, n)
  const result = [...nums]

  if (normalizedK === 0) {
    return result
  }

  reverseRangeInPlace(result, 0, n - 1)
  reverseRangeInPlace(result, 0, normalizedK - 1)
  reverseRangeInPlace(result, normalizedK, n - 1)

  return result
}

/** Pick a short random array for the visualizer. */
export function generateRandomRotateArray(length = 7): number[] {
  const size = Math.max(1, Math.min(length, 12))
  return Array.from(
    { length: size },
    () => Math.floor(Math.random() * 20) + 1,
  )
}
