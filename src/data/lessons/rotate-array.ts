import type { Lesson } from './types'

export const rotateArray: Lesson = {
  slug: 'rotate-array',
  title: 'Rotate Array',
  description:
    'Right-rotate an array by k positions using the classic three-reversal algorithm.',
  category: 'Array & String',
  difficulty: 'Intermediate',
  estimatedTime: '25 minutes',
  tags: [
    'Array & String',
    'Rotate Array',
    'Three Reversal',
    'In-Place',
    'Intermediate',
  ],

  objectives: [
    'Explain right rotation by k and why k % n is enough.',
    'Apply the three-reversal technique: reverse all, reverse first k, reverse the rest.',
    'Trace two-pointer swaps that reverse a subrange in O(1) auxiliary space.',
    'Distinguish the copy-preserving public API (O(n) space) from in-place reversal (O(1) aux).',
    'Normalize negative k to an equivalent right rotation.',
    'Recognize when a simpler copy/slice approach may be clearer.',
  ],

  overview: [
    'Given an array, rotate it to the right by k positions so the last k elements move to the front.',
    'Default example: [1, 2, 3, 4, 5, 6, 7], k = 3 → [5, 6, 7, 1, 2, 3, 4].',
    'Rotating by k is equivalent to rotating by k % n, where n is the array length. Values larger than n wrap around; k = 0 or k = n leave the array unchanged.',
    'Negative k is normalized to an equivalent right rotation with ((k % n) + n) % n. For example, k = −1 on length 7 is the same as a right rotation by 6 (a left rotation by 1).',
    'The efficient technique uses three reversals on a working array: reverse the entire array, reverse the first k elements, then reverse the remaining elements.',
    'This lesson’s public function copies the input first so callers keep their original array. The reversals themselves use constant auxiliary space on that working copy.',
  ],

  whyItMatters: [
    'Array rotation appears in interviews, circular buffers, scheduling windows, and image or signal shifts.',
    'Three reversals teach an elegant in-place idea: rearrange with local swaps instead of allocating a second buffer of results.',
    'Understanding k % n and negative-k normalization avoids off-by-one bugs when rotation counts come from user input or clocks.',
    'The same reverse-a-range skill shows up in string reversal, rotate-in-groups, and other two-pointer problems.',
  ],

  visualization: {
    title: 'Three-reversal right rotation',
    description:
      'Watch each reverse phase: full array, first k, then the remainder — with left/right pointers and swaps.',
    type: 'rotate-array',
  },

  steps: [
    {
      title: 'Copy and normalize k',
      description:
        'Work on a copy of the input. Let n be the length. Set k = ((k % n) + n) % n so large and negative values become a right-rotation count in [0, n).',
    },
    {
      title: 'Phase 1 — Reverse the entire array',
      description:
        '[1, 2, 3, 4, 5, 6, 7] becomes [7, 6, 5, 4, 3, 2, 1]. The future rotated prefix now sits at the front, still reversed.',
    },
    {
      title: 'Phase 2 — Reverse the first k elements',
      description:
        'For k = 3, reverse indices 0…2: [7, 6, 5, 4, 3, 2, 1] becomes [5, 6, 7, 4, 3, 2, 1]. The new prefix is in order.',
    },
    {
      title: 'Phase 3 — Reverse the remaining elements',
      description:
        'Reverse indices k…n−1: [5, 6, 7, 4, 3, 2, 1] becomes [5, 6, 7, 1, 2, 3, 4]. That is the right rotation.',
    },
    {
      title: 'Empty or single-element ranges',
      description:
        'If a reverse range is empty or has one element, do nothing. When normalized k is 0, skip all three reversals.',
    },
    {
      title: 'Return the result',
      description:
        'Return the working array. The caller’s original input was never mutated.',
    },
  ],

  complexity: {
    time: {
      best: 'O(n)',
      average: 'O(n)',
      worst: 'O(n)',
    },
    space: 'O(n) for the copy-preserving API; O(1) aux for in-place reversal',
    notes: {
      time: [
        'Let n be the array length.',
        'Each of the three reversals walks its range once with two pointers; together they perform O(n) swaps and comparisons.',
        'Normalizing k with modulo is O(1).',
      ],
      space: [
        'The in-place reverse helper uses O(1) auxiliary space (a few indices and a temporary for swaps).',
        'This lesson’s public rotateArrayRight copies the input, so overall additional space is O(n).',
        'Do not label the copy-preserving function as an overall O(1)-space solution. An in-place API that mutates the caller’s array can claim O(1) auxiliary space.',
      ],
    },
  },

  pseudocode: `RotateRight(array, k)
    n = length(array)

    if n equals 0
        return empty array

    k = k modulo n

    if k is negative
        normalize k to an equivalent right rotation

    result = copy(array)

    reverse(result, 0, n - 1)
    reverse(result, 0, k - 1)
    reverse(result, k, n - 1)

    return result

Reverse(array, left, right)
    while left < right
        swap array[left] and array[right]
        left = left + 1
        right = right - 1`,

  code: {
    python: `def normalize_rotation_k(k: int, n: int) -> int:
    if n == 0:
        return 0
    return ((k % n) + n) % n


def reverse_range(arr: list[int], left: int, right: int) -> None:
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1


def rotate_array_right(nums: list[int], k: int) -> list[int]:
    n = len(nums)
    if n == 0:
        return []

    k = normalize_rotation_k(k, n)
    result = nums[:]  # preserve the caller's array

    if k == 0:
        return result

    reverse_range(result, 0, n - 1)
    reverse_range(result, 0, k - 1)
    reverse_range(result, k, n - 1)
    return result


print(rotate_array_right([1, 2, 3, 4, 5, 6, 7], 3))  # [5, 6, 7, 1, 2, 3, 4]
print(rotate_array_right([1, 2, 3, 4, 5, 6, 7], -1))  # [2, 3, 4, 5, 6, 7, 1]
print(rotate_array_right([], 3))  # []`,

    javascript: `function normalizeRotationK(k, n) {
  if (n === 0) return 0;
  return ((k % n) + n) % n;
}

function reverseRange(arr, left, right) {
  while (left < right) {
    const tmp = arr[left];
    arr[left] = arr[right];
    arr[right] = tmp;
    left += 1;
    right -= 1;
  }
}

function rotateArrayRight(nums, k) {
  const n = nums.length;
  if (n === 0) return [];

  k = normalizeRotationK(k, n);
  const result = nums.slice(); // preserve the caller's array

  if (k === 0) return result;

  reverseRange(result, 0, n - 1);
  reverseRange(result, 0, k - 1);
  reverseRange(result, k, n - 1);
  return result;
}

console.log(rotateArrayRight([1, 2, 3, 4, 5, 6, 7], 3)); // [5, 6, 7, 1, 2, 3, 4]
console.log(rotateArrayRight([1, 2, 3, 4, 5, 6, 7], -1)); // [2, 3, 4, 5, 6, 7, 1]
console.log(rotateArrayRight([], 3)); // []`,

    typescript: `export function normalizeRotationK(k: number, n: number): number {
  if (n === 0) return 0;
  return ((k % n) + n) % n;
}

export function reverseRangeInPlace(
  arr: number[],
  left: number,
  right: number,
): void {
  while (left < right) {
    const tmp = arr[left]!;
    arr[left] = arr[right]!;
    arr[right] = tmp;
    left += 1;
    right -= 1;
  }
}

export function rotateArrayRight(nums: number[], k: number): number[] {
  const n = nums.length;
  if (n === 0) return [];

  const normalizedK = normalizeRotationK(k, n);
  const result = [...nums]; // preserve the caller's array

  if (normalizedK === 0) return result;

  reverseRangeInPlace(result, 0, n - 1);
  reverseRangeInPlace(result, 0, normalizedK - 1);
  reverseRangeInPlace(result, normalizedK, n - 1);
  return result;
}

console.log(rotateArrayRight([1, 2, 3, 4, 5, 6, 7], 3)); // [5, 6, 7, 1, 2, 3, 4]
console.log(rotateArrayRight([1, 2, 3, 4, 5, 6, 7], -1)); // [2, 3, 4, 5, 6, 7, 1]
console.log(rotateArrayRight([], 3)); // []`,
  },

  whenToUse: [
    'You need a right (or left) rotation and want an elegant linear scan',
    'Interview settings that ask for O(1) auxiliary space on an in-place mutation',
    'Teaching two-pointer reversal as a building block',
    'Rotation counts that may exceed n or be negative and need modulo normalization',
    'Problems related to circular buffers or “last k become first”',
  ],

  whenNotToUse: [
    'A one-line slice join is clearer for a throwaway script and you do not care about in-place constraints',
    'You must not allocate O(n) for a copy and also must not mutate the input — design constraints carefully',
    'Rotation is by a huge stream of operations where a deque or ring buffer is the real data structure',
    'You only need to report the k-th element after rotation — index math alone may suffice',
  ],

  keyTakeaways: [
    'Right rotation by k equals rotation by k % n.',
    'Three reversals: entire array → first k → remaining elements.',
    'Two-pointer reverse uses O(1) auxiliary space on the working array.',
    'A copy-preserving public API still costs O(n) additional space overall.',
    'Negative k normalizes to an equivalent right rotation.',
    'Empty or single-element reverse ranges are no-ops; k = 0 skips work.',
    'Never mutate the caller’s array unless the API is explicitly in-place.',
  ],

  thinkingGuide: {
    title: 'Why three reversals rotate',
    description:
      'Each reverse places a piece of the final order without shifting elements one-by-one.',
    steps: [
      'Picture the array as prefix A (length n − k) and suffix B (length k): A + B.',
      'A right rotation wants B + A.',
      'Reverse all → reverse(B) + reverse(A).',
      'Reverse the first k → B + reverse(A).',
      'Reverse the rest → B + A. Done.',
      'Always reduce k with modulo first so the picture stays accurate.',
    ],
  },

  commonMistakes: {
    description: 'Common pitfalls when implementing rotate-array with reversals.',
    mistakes: [
      {
        title: 'Forgetting k % n',
        explanation:
          'Large k must wrap. Without modulo, range ends go out of bounds or do the wrong amount of work.',
      },
      {
        title: 'Claiming O(1) space for a copying API',
        explanation:
          'Copying the input uses O(n) space. Only a mutating in-place API has O(1) auxiliary space overall.',
      },
      {
        title: 'Off-by-one on reverse ranges',
        explanation:
          'Phase 2 is indices 0…k−1; phase 3 is k…n−1. Inclusive bounds matter for the two-pointer loop.',
      },
      {
        title: 'Rejecting or mishandling negative k',
        explanation:
          'This lesson maps negative k to an equivalent right rotation. Document the convention and keep languages consistent.',
      },
      {
        title: 'Mutating the original when the API returns a new array',
        explanation:
          'Callers expect their input to stay unchanged. Reverse on a copy.',
      },
      {
        title: 'Using extra slices for each reverse',
        explanation:
          'The point of two-pointer reverse is O(1) aux on the working array — avoid allocating temporary subarrays for the swap loop.',
      },
    ],
  },

  algorithmConnection: {
    title: 'Copy vs in-place rotation',
    eyebrow: 'COMPARE',
    description:
      'Same three-reversal idea; different APIs change the space story.',
    items: [
      {
        title: 'Copy then reverse (this lesson)',
        description:
          'Safe for immutable call sites. Time O(n), additional space O(n).',
      },
      {
        title: 'In-place mutate',
        description:
          'Reverse directly on the caller’s array. Time O(n), auxiliary space O(1).',
      },
      {
        title: 'Allocate and place by index',
        description:
          'result[(i + k) % n] = nums[i]. Clear but always O(n) extra space; no clever reverses.',
      },
    ],
  },

  previousLesson: {
    title: 'String Compression',
    href: '/learn/string-compression',
  },

  nextLesson: {
    title: 'Array & String Comparison (Coming Soon)',
    href: '/algorithms/array-string',
  },

  categoryHref: '/algorithms/array-string',
}
