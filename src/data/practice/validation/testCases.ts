import type { PracticeTestCase } from './types'

/**
 * Structured test cases keyed by practice problem slug.
 * Kept separate from React presentation.
 */
export const practiceTestCases: PracticeTestCase[] = [
  // —— Linear Search / find-an-element ——
  {
    id: 'find-an-element-sample',
    problemSlug: 'find-an-element',
    kind: 'sample',
    description: 'Target appears in the middle of an unsorted array.',
    input: { arr: [10, 25, 7, 42, 18], target: 42 },
    expected: 3,
    feedback: 'Return the first index where arr[i] equals the target.',
  },
  {
    id: 'find-an-element-normal-missing',
    problemSlug: 'find-an-element',
    kind: 'normal',
    description: 'Target is not present.',
    input: { arr: [10, 25, 7, 42, 18], target: 99 },
    expected: -1,
    feedback: 'If the loop finishes without a match, return -1.',
  },
  {
    id: 'find-an-element-normal-duplicates',
    problemSlug: 'find-an-element',
    kind: 'normal',
    description: 'Duplicates — return the first match.',
    input: { arr: [5, 5, 5], target: 5 },
    expected: 0,
  },
  {
    id: 'find-an-element-edge-empty',
    problemSlug: 'find-an-element',
    kind: 'edge',
    description: 'Empty array.',
    input: { arr: [], target: 1 },
    expected: -1,
    feedback: 'An empty array has no indices to search.',
  },
  {
    id: 'find-an-element-edge-first',
    problemSlug: 'find-an-element',
    kind: 'edge',
    description: 'Target at the first index.',
    input: { arr: [7, 1, 2], target: 7 },
    expected: 0,
  },

  // —— Binary Search / find-target-sorted-array ——
  {
    id: 'find-target-sorted-sample',
    problemSlug: 'find-target-sorted-array',
    kind: 'sample',
    description: 'Target present in a sorted array.',
    input: {
      arr: [3, 7, 12, 18, 24, 31, 42, 56, 68],
      target: 42,
    },
    expected: 6,
  },
  {
    id: 'find-target-sorted-normal-missing',
    problemSlug: 'find-target-sorted-array',
    kind: 'normal',
    description: 'Target absent from a sorted array.',
    input: {
      arr: [3, 7, 12, 18, 24, 31, 42, 56, 68],
      target: 50,
    },
    expected: -1,
    feedback: 'When left exceeds right, the search range is empty — return -1.',
  },
  {
    id: 'find-target-sorted-normal-mid',
    problemSlug: 'find-target-sorted-array',
    kind: 'normal',
    description: 'Alternate sorted array hit.',
    input: { arr: [1, 4, 9, 15, 22, 33], target: 15 },
    expected: 3,
  },
  {
    id: 'find-target-sorted-edge-single',
    problemSlug: 'find-target-sorted-array',
    kind: 'edge',
    description: 'Single-element array that matches.',
    input: { arr: [1], target: 1 },
    expected: 0,
  },
  {
    id: 'find-target-sorted-edge-empty',
    problemSlug: 'find-target-sorted-array',
    kind: 'edge',
    description: 'Empty sorted array.',
    input: { arr: [], target: 1 },
    expected: -1,
  },

  // —— Two Pointers / two-sum-sorted ——
  {
    id: 'two-sum-sorted-sample',
    problemSlug: 'two-sum-sorted',
    kind: 'sample',
    description: 'Pair at opposite ends.',
    input: { arr: [1, 2, 3, 4, 6, 8, 9], target: 10 },
    expected: [0, 6],
    feedback: '1 + 9 = 10 at indices 0 and 6.',
  },
  {
    id: 'two-sum-sorted-normal-missing',
    problemSlug: 'two-sum-sorted',
    kind: 'normal',
    description: 'No pair sums to the target.',
    input: { arr: [1, 2, 3, 4, 6, 8, 9], target: 100 },
    expected: [-1, -1],
  },
  {
    id: 'two-sum-sorted-normal-inner',
    problemSlug: 'two-sum-sorted',
    kind: 'normal',
    description: 'Pair found inside the array.',
    input: { arr: [2, 3, 5], target: 8 },
    expected: [1, 2],
  },
  {
    id: 'two-sum-sorted-edge-negatives',
    problemSlug: 'two-sum-sorted',
    kind: 'edge',
    description: 'Array with negatives.',
    input: { arr: [-10, -5, 0, 5, 10], target: 0 },
    expected: [0, 4],
  },
  {
    id: 'two-sum-sorted-edge-adjacent',
    problemSlug: 'two-sum-sorted',
    kind: 'edge',
    description: 'Adjacent pair near the start.',
    input: { arr: [1, 2, 3, 4, 5], target: 3 },
    expected: [0, 1],
  },

  // —— Sliding Window / max-sum-fixed-window ——
  {
    id: 'max-sum-fixed-window-sample',
    problemSlug: 'max-sum-fixed-window',
    kind: 'sample',
    description: 'Classic fixed window maximum.',
    input: { arr: [2, 1, 5, 1, 3, 2], k: 3 },
    expected: 9,
    feedback: 'Window [5, 1, 3] sums to 9.',
  },
  {
    id: 'max-sum-fixed-window-normal',
    problemSlug: 'max-sum-fixed-window',
    kind: 'normal',
    description: 'Window of size 2 on an ascending array.',
    input: { arr: [1, 2, 3, 4, 5], k: 2 },
    expected: 9,
  },
  {
    id: 'max-sum-fixed-window-normal-negatives',
    problemSlug: 'max-sum-fixed-window',
    kind: 'normal',
    description: 'Windows containing negatives.',
    input: { arr: [5, -1, 3, 2], k: 2 },
    expected: 5,
  },
  {
    id: 'max-sum-fixed-window-edge-invalid-k',
    problemSlug: 'max-sum-fixed-window',
    kind: 'edge',
    description: 'Window larger than the array.',
    input: { arr: [1, 2], k: 3 },
    expected: 0,
    feedback: 'Invalid window size returns 0 for this practice problem.',
  },
  {
    id: 'max-sum-fixed-window-edge-empty',
    problemSlug: 'max-sum-fixed-window',
    kind: 'edge',
    description: 'Empty array.',
    input: { arr: [], k: 1 },
    expected: 0,
  },

  // —— Prefix Sum / range-sum-queries (answer = range sum) ——
  {
    id: 'range-sum-queries-sample',
    problemSlug: 'range-sum-queries',
    kind: 'sample',
    description: 'Interior inclusive range.',
    input: { arr: [2, 4, 1, 6, 3, 5], left: 1, right: 4 },
    expected: 14,
    feedback: '4 + 1 + 6 + 3 = 14 via prefix[5] − prefix[1].',
  },
  {
    id: 'range-sum-queries-normal-full',
    problemSlug: 'range-sum-queries',
    kind: 'normal',
    description: 'Full array range.',
    input: { arr: [2, 4, 1, 6, 3, 5], left: 0, right: 5 },
    expected: 21,
  },
  {
    id: 'range-sum-queries-normal-single',
    problemSlug: 'range-sum-queries',
    kind: 'normal',
    description: 'Single-element range.',
    input: { arr: [2, 4, 1, 6, 3, 5], left: 3, right: 3 },
    expected: 6,
  },
  {
    id: 'range-sum-queries-edge-negatives',
    problemSlug: 'range-sum-queries',
    kind: 'edge',
    description: 'Range over negatives.',
    input: { arr: [-3, 2, -1, 4], left: 0, right: 2 },
    expected: -2,
  },
  {
    id: 'range-sum-queries-edge-zeros',
    problemSlug: 'range-sum-queries',
    kind: 'edge',
    description: 'All zeros.',
    input: { arr: [0, 0, 0], left: 0, right: 2 },
    expected: 0,
  },

  // —— Frequency Counting / most-frequent-number ——
  {
    id: 'most-frequent-sample',
    problemSlug: 'most-frequent-number',
    kind: 'sample',
    description: 'Clear majority value.',
    input: { arr: [2, 1, 2, 3, 1, 2, 4] },
    expected: 2,
  },
  {
    id: 'most-frequent-normal-single',
    problemSlug: 'most-frequent-number',
    kind: 'normal',
    description: 'Single-element array.',
    input: { arr: [7] },
    expected: 7,
  },
  {
    id: 'most-frequent-normal-tie',
    problemSlug: 'most-frequent-number',
    kind: 'normal',
    description: 'Tie — prefer the first max-frequency value encountered.',
    input: { arr: [2, 1, 2, 3, 1] },
    expected: 2,
    feedback:
      '2 and 1 both appear twice; scanning left-to-right keeps 2 as the first peak.',
  },
  {
    id: 'most-frequent-edge-empty',
    problemSlug: 'most-frequent-number',
    kind: 'edge',
    description: 'Empty array returns null.',
    input: { arr: [] },
    expected: null,
  },
  {
    id: 'most-frequent-edge-zeros',
    problemSlug: 'most-frequent-number',
    kind: 'edge',
    description: 'Zeros are valid values.',
    input: { arr: [0, 0, 1, 0] },
    expected: 0,
  },

  // —— Kadane / maximum-subarray-sum ——
  {
    id: 'maximum-subarray-sample',
    problemSlug: 'maximum-subarray-sum',
    kind: 'sample',
    description: 'Classic mixed array.',
    input: { arr: [-2, 1, -3, 4, -1, 2, 1, -5, 4] },
    expected: { maxSum: 6, start: 3, end: 6 },
    feedback: 'Best contiguous window is [4, -1, 2, 1].',
  },
  {
    id: 'maximum-subarray-normal-all-negative',
    problemSlug: 'maximum-subarray-sum',
    kind: 'normal',
    description: 'All-negative array picks the largest element.',
    input: { arr: [-3, -1, -2] },
    expected: { maxSum: -1, start: 1, end: 1 },
  },
  {
    id: 'maximum-subarray-normal-all-positive',
    problemSlug: 'maximum-subarray-sum',
    kind: 'normal',
    description: 'All positive — entire array.',
    input: { arr: [1, 2, 3, 4] },
    expected: { maxSum: 10, start: 0, end: 3 },
  },
  {
    id: 'maximum-subarray-edge-empty',
    problemSlug: 'maximum-subarray-sum',
    kind: 'edge',
    description: 'Empty array returns null.',
    input: { arr: [] },
    expected: null,
  },
  {
    id: 'maximum-subarray-edge-single',
    problemSlug: 'maximum-subarray-sum',
    kind: 'edge',
    description: 'Single negative element.',
    input: { arr: [-5] },
    expected: { maxSum: -5, start: 0, end: 0 },
  },

  // —— Longest substring ——
  {
    id: 'longest-substring-sample',
    problemSlug: 'longest-substring-no-repeat',
    kind: 'sample',
    description: 'Classic abcabcbb example.',
    input: { s: 'abcabcbb' },
    expected: { length: 3, start: 0, end: 2 },
  },
  {
    id: 'longest-substring-normal-pwwkew',
    problemSlug: 'longest-substring-no-repeat',
    kind: 'normal',
    description: 'pwwkew — longest is wke.',
    input: { s: 'pwwkew' },
    expected: { length: 3, start: 2, end: 4 },
  },
  {
    id: 'longest-substring-normal-unique',
    problemSlug: 'longest-substring-no-repeat',
    kind: 'normal',
    description: 'All unique characters.',
    input: { s: 'abcdef' },
    expected: { length: 6, start: 0, end: 5 },
  },
  {
    id: 'longest-substring-edge-empty',
    problemSlug: 'longest-substring-no-repeat',
    kind: 'edge',
    description: 'Empty string.',
    input: { s: '' },
    expected: { length: 0, start: 0, end: -1 },
  },
  {
    id: 'longest-substring-edge-repeats',
    problemSlug: 'longest-substring-no-repeat',
    kind: 'edge',
    description: 'All identical characters.',
    input: { s: 'bbbbb' },
    expected: { length: 1, start: 0, end: 0 },
  },

  // —— Valid Anagram ——
  {
    id: 'valid-anagram-sample',
    problemSlug: 'valid-anagram',
    kind: 'sample',
    description: 'Classic listen / silent.',
    input: { first: 'listen', second: 'silent' },
    expected: true,
  },
  {
    id: 'valid-anagram-normal-false',
    problemSlug: 'valid-anagram',
    kind: 'normal',
    description: 'Different character multisets.',
    input: { first: 'rat', second: 'car' },
    expected: false,
  },
  {
    id: 'valid-anagram-normal-empty',
    problemSlug: 'valid-anagram',
    kind: 'normal',
    description: 'Two empty strings.',
    input: { first: '', second: '' },
    expected: true,
  },
  {
    id: 'valid-anagram-edge-case',
    problemSlug: 'valid-anagram',
    kind: 'edge',
    description: 'Case sensitivity.',
    input: { first: 'a', second: 'A' },
    expected: false,
    feedback: 'Exact comparison treats uppercase and lowercase as different.',
  },
  {
    id: 'valid-anagram-edge-length',
    problemSlug: 'valid-anagram',
    kind: 'edge',
    description: 'Different lengths.',
    input: { first: 'a', second: 'aa' },
    expected: false,
  },

  // —— Group Anagrams (exploration / reference only) ——
  {
    id: 'group-anagrams-sample',
    problemSlug: 'group-anagrams',
    kind: 'sample',
    description: 'Classic grouping example.',
    input: { words: ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'] },
    expected: [
      ['eat', 'tea', 'ate'],
      ['tan', 'nat'],
      ['bat'],
    ],
    orderIndependent: true,
    feedback:
      'Group membership matters more than group order or word order within a group.',
  },
  {
    id: 'group-anagrams-normal-single',
    problemSlug: 'group-anagrams',
    kind: 'normal',
    description: 'Single word.',
    input: { words: ['a'] },
    expected: [['a']],
    orderIndependent: true,
  },
  {
    id: 'group-anagrams-normal-mixed',
    problemSlug: 'group-anagrams',
    kind: 'normal',
    description: 'Two anagram pairs of different lengths.',
    input: { words: ['ab', 'ba', 'abc', 'cab'] },
    expected: [
      ['ab', 'ba'],
      ['abc', 'cab'],
    ],
    orderIndependent: true,
  },
  {
    id: 'group-anagrams-edge-empty',
    problemSlug: 'group-anagrams',
    kind: 'edge',
    description: 'Empty word list.',
    input: { words: [] },
    expected: [],
    orderIndependent: true,
  },
  {
    id: 'group-anagrams-edge-case',
    problemSlug: 'group-anagrams',
    kind: 'edge',
    description: 'Case-sensitive grouping.',
    input: { words: ['a', 'A'] },
    expected: [['a'], ['A']],
    orderIndependent: true,
  },
]

const casesBySlug = new Map<string, PracticeTestCase[]>()
const casesById = new Map<string, PracticeTestCase>()
const EMPTY_TEST_CASES: PracticeTestCase[] = []

for (const testCase of practiceTestCases) {
  const list = casesBySlug.get(testCase.problemSlug) ?? []
  list.push(testCase)
  casesBySlug.set(testCase.problemSlug, list)
  casesById.set(testCase.id, testCase)
}

export function getTestCasesForProblem(slug: string): PracticeTestCase[] {
  return casesBySlug.get(slug) ?? EMPTY_TEST_CASES
}

export function getTestCaseById(id: string): PracticeTestCase | undefined {
  return casesById.get(id)
}

export function filterTestCasesByKind(
  cases: readonly PracticeTestCase[],
  kind: PracticeTestCase['kind'] | 'all',
): PracticeTestCase[] {
  if (kind === 'all') {
    return [...cases]
  }
  return cases.filter((testCase) => testCase.kind === kind)
}
