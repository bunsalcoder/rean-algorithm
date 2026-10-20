/**
 * Comparison data for implemented Array & String lessons only.
 * Maximum Subarray (as a separate hub entry) is not included — use Kadane's.
 */

import { getAvailableArrayStringAlgorithms } from './array-string'
import { getLesson } from '../lessons'

/** Conceptual growth classes for the explorer chart (not runtime ms). */
export type ArrayStringComplexityClass =
  | 'O(1)'
  | 'O(n)'
  | 'O(n × m log m)'

export type ArrayStringAlgorithmComparison = {
  id: string
  slug: string
  name: string
  /** Main technique / pattern label. */
  technique: string
  /** Short problem statement this lesson demonstrates. */
  problem: string
  /** Typical time complexity for the demonstrated implementation. */
  timeComplexity: string
  /** Auxiliary space for the demonstrated implementation. */
  spaceComplexity: string
  /** Important prerequisite or assumption. */
  requirement: string
  /** Compact table cell for a typical use case. */
  exampleUseCase: string
  useCases: string[]
  limitations: string[]
  assumptions: string
  tradeoffs: string
  lessonHref: string
  available: true
  /** Conceptual class used by the complexity explorer bars. */
  timeClass: ArrayStringComplexityClass
  /** Optional footnote under time (e.g. Prefix Sum query vs prep). */
  timeNote?: string
  /** Optional footnote under space. */
  spaceNote?: string
}

export type ArrayStringDecisionCard = {
  id: string
  clue: string
  recommendation: string
  limitation: string
  lessonSlug: string
}

export type ArrayStringMisconception = {
  id: string
  claim: string
  correction: string
}

export type ArrayStringLearningOrderItem = {
  id: string
  slug: string
  name: string
  reason: string
  lessonHref: string
}

export type ArrayStringProblemOption = {
  id: string
  label: string
  /** Primary recommendation slug. */
  primarySlug: string
  /** Optional alternate approaches that are also implemented. */
  alternativeSlugs: string[]
  whyFits: string
  keyPrerequisite: string
}

/** Conceptual growth order for the complexity chart (not runtime ms). */
export const arrayStringComplexityClassRank: Record<
  ArrayStringComplexityClass,
  number
> = {
  'O(1)': 1,
  'O(n)': 2,
  'O(n × m log m)': 3,
}

export const arrayStringComparisonAlgorithms: ArrayStringAlgorithmComparison[] =
  [
    {
      id: 'two-pointers',
      slug: 'two-pointers',
      name: 'Two Pointers',
      technique: 'Two Pointers',
      problem: 'Find a pair that sums to a target in a sorted array.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      requirement: 'Sorted ascending input (for the two-sum pattern shown)',
      exampleUseCase: 'Sorted two-sum / pair search',
      useCases: [
        'Finding a pair with a given sum on sorted data',
        'Scanning from both ends when order lets you move pointers safely',
      ],
      limitations: [
        'The O(n) two-sum pattern requires sorted input.',
        'Sorting first adds cost and may break original order requirements.',
      ],
      assumptions:
        'Demonstrated on a sorted ascending number array. Best case can be O(1) when the ends already form the target pair.',
      tradeoffs:
        'Very efficient on sorted data, but not a drop-in for unsorted arrays without a preprocessing step.',
      lessonHref: '/learn/two-pointers',
      available: true,
      timeClass: 'O(n)',
      timeNote:
        'Often O(n) for the sorted two-sum scan; best case O(1) if the first check succeeds.',
    },
    {
      id: 'sliding-window',
      slug: 'sliding-window',
      name: 'Sliding Window (Fixed-size)',
      technique: 'Fixed-size Sliding Window',
      problem: 'Maximum sum of any contiguous subarray of fixed length k.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      requirement: 'Valid window size k (1 ≤ k ≤ n); contiguous ranges',
      exampleUseCase: 'Max sum of fixed-length subarrays',
      useCases: [
        'Maximum (or minimum) sum over windows of length k',
        'Fixed-length contiguous segment analysis',
      ],
      limitations: [
        'Solves contiguous fixed-size windows — not every array problem.',
        'Invalid k (empty array, k ≤ 0, or k > n) is handled as a no-result case in this lesson.',
      ],
      assumptions:
        'Fixed window size must be valid for the array. The array does not need to be sorted.',
      tradeoffs:
        'Reuses the previous window sum (O(n) total) instead of restarting each window (O(n × k)). Different from variable-size windows.',
      lessonHref: '/learn/sliding-window',
      available: true,
      timeClass: 'O(n)',
    },
    {
      id: 'prefix-sum',
      slug: 'prefix-sum',
      name: 'Prefix Sum',
      technique: 'Prefix Sum / Preprocessing',
      problem: 'Answer many range-sum queries on an unchanged array.',
      timeComplexity: 'O(n) prep + O(1)/query',
      spaceComplexity: 'O(n)',
      requirement: 'Array does not change between queries (or rebuild after edits)',
      exampleUseCase: 'Many range-sum queries',
      useCases: [
        'Repeated inclusive range sums on a static array',
        'Turning O(n) per query into O(1) after one preprocess',
      ],
      limitations: [
        'Uses O(n) extra space for the prefix array.',
        'Updates to the source array require rebuilding (or a different structure).',
      ],
      assumptions:
        'Leading-zero prefix: prefix[i] = sum of the first i elements. Queries use prefix[right + 1] − prefix[left].',
      tradeoffs:
        'Pay O(n) time and O(n) space once to make each range sum O(1). Best when query count is large.',
      lessonHref: '/learn/prefix-sum',
      available: true,
      timeClass: 'O(n)',
      timeNote:
        'Preprocessing is O(n); each valid range-sum query is O(1) afterward.',
      spaceNote: 'Stores a prefix array of length n + 1 (leading zero).',
    },
    {
      id: 'frequency-counting',
      slug: 'frequency-counting',
      name: 'Frequency Counting',
      technique: 'Hash Map / Frequency Counting',
      problem: 'Count occurrences and find the most frequent value.',
      timeComplexity: 'O(n) expected',
      spaceComplexity: 'O(k)',
      requirement: 'Hash-map operations are typically O(1) average',
      exampleUseCase: 'Counts, duplicates, most frequent',
      useCases: [
        'Building occurrence maps',
        'Finding the most frequent value',
        'Membership and duplicate checks via counts',
      ],
      limitations: [
        'Space grows with distinct keys (O(n) when all values are unique).',
        'Hash-map costs are typically expected O(1), not a universal worst-case guarantee.',
      ],
      assumptions:
        'Uses a Map for counts. Expected O(n) for build + most-frequent scan under typical hash-map behavior.',
      tradeoffs:
        'Direct answers to “how many?” and “most frequent?” without sorting, at the cost of O(k) extra space.',
      lessonHref: '/learn/frequency-counting',
      available: true,
      timeClass: 'O(n)',
      spaceNote: 'k = number of distinct keys; worst case O(n) when all unique.',
    },
    {
      id: 'kadanes-algorithm',
      slug: 'kadanes-algorithm',
      name: "Kadane's Algorithm",
      technique: "Kadane's / Running Sum",
      problem: 'Maximum sum of any contiguous subarray (variable length).',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      requirement: 'Contiguous subarray; classic max-sum objective',
      exampleUseCase: 'Maximum contiguous subarray sum',
      useCases: [
        'Maximum contiguous subarray sum',
        'Linear scan when every subarray start/end pair would be too expensive',
      ],
      limitations: [
        'Targets contiguous ranges — not arbitrary subsets.',
        'Fixed-size maximum sum is a Sliding Window problem; use that lesson when k is fixed.',
      ],
      assumptions:
        'Initializes from the first element so all-negative arrays return the largest (least negative) value.',
      tradeoffs:
        'O(n) time and O(1) auxiliary space versus checking every subarray.',
      lessonHref: '/learn/kadanes-algorithm',
      available: true,
      timeClass: 'O(n)',
    },
    {
      id: 'longest-substring-without-repeating',
      slug: 'longest-substring-without-repeating',
      name: 'Longest Substring Without Repeating Characters',
      technique: 'Variable-size Sliding Window + Set',
      problem: 'Longest contiguous substring with all unique characters.',
      timeComplexity: 'O(n) expected',
      spaceComplexity: 'O(k)',
      requirement: 'Contiguous substring; track characters in the window',
      exampleUseCase: 'Longest unique-character substring',
      useCases: [
        'Longest window without repeated characters',
        'Variable-size window that grows and shrinks while scanning',
      ],
      limitations: [
        'Set space depends on distinct characters in the window (up to O(n)).',
        'Not the same problem as fixed-size Sliding Window maximum sum.',
      ],
      assumptions:
        'Right and left pointers each move at most n times; Set add/remove are typically O(1) average.',
      tradeoffs:
        'O(n) expected scan with O(k) window state instead of checking every substring from scratch.',
      lessonHref: '/learn/longest-substring-without-repeating-characters',
      available: true,
      timeClass: 'O(n)',
      spaceNote:
        'k = distinct characters tracked in the window; worst case O(n).',
    },
    {
      id: 'valid-anagram',
      slug: 'valid-anagram',
      name: 'Valid Anagram',
      technique: 'Frequency Counting (Hash Map)',
      problem: 'Decide whether two strings are anagrams under exact rules.',
      timeComplexity: 'O(n) expected',
      spaceComplexity: 'O(k)',
      requirement: 'Exact comparison (case, spaces, punctuation count)',
      exampleUseCase: 'Anagram check for two strings',
      useCases: [
        'Checking whether two strings share the same character multiset',
        'Teaching frequency counting on strings',
      ],
      limitations: [
        'This lesson uses the hash-map approach — not the sorting-based alternative.',
        'Exact mode is case-sensitive; normalization is a separate choice.',
      ],
      assumptions:
        'Lengths must match for a yes answer. Map operations are typically O(1) average.',
      tradeoffs:
        'Expected O(n) time and O(k) space versus sorting both strings (extra sort cost).',
      lessonHref: '/learn/valid-anagram',
      available: true,
      timeClass: 'O(n)',
      spaceNote: 'k = distinct characters in the counted string.',
    },
    {
      id: 'group-anagrams',
      slug: 'group-anagrams',
      name: 'Group Anagrams',
      technique: 'Sorted Signatures + Hash Map',
      problem: 'Cluster words that are anagrams of each other.',
      timeComplexity: 'O(n × m log m)',
      spaceComplexity: 'O(n × m)',
      requirement: 'Exact comparison; signatures from sorted characters',
      exampleUseCase: 'Group words by anagram equivalence',
      useCases: [
        'Grouping a list of words into anagram families',
        'Scaling frequency ideas from pairs to many words',
      ],
      limitations: [
        'Sorting each word dominates time; a count signature can avoid sorting for small alphabets.',
        'Space scales with stored words and signature keys.',
      ],
      assumptions:
        'n words of average length m. Each word is sorted once for its signature.',
      tradeoffs:
        'Clear teaching approach with sorted signatures; slower asymptotically than fixed-alphabet count keys.',
      lessonHref: '/learn/group-anagrams',
      available: true,
      timeClass: 'O(n × m log m)',
      spaceNote:
        'Proportional to input/output characters plus stored signature keys.',
    },
    {
      id: 'string-compression',
      slug: 'string-compression',
      name: 'String Compression',
      technique: 'Run-Length Scan',
      problem: 'Encode consecutive repeated characters into a compact form.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      requirement: 'Educational run-length format; builds a new string',
      exampleUseCase: 'Summarize consecutive character runs',
      useCases: [
        'Run-length style encoding of consecutive repeats',
        'Teaching one-pass string scanning with for-loop index walks',
      ],
      limitations: [
        'May not shorten every string (e.g. all unique characters).',
        'This implementation returns a new string (O(n) output space), not in-place O(1).',
        'Simple format is not a universal lossless codec for digit-heavy inputs.',
      ],
      assumptions:
        'Append character, then count only when count > 1. One left-to-right scan.',
      tradeoffs:
        'Simple O(n) scan; output space is O(n) even when the core idea is a linear pass.',
      lessonHref: '/learn/string-compression',
      available: true,
      timeClass: 'O(n)',
      spaceNote: 'Auxiliary space for the newly built output string.',
    },
    {
      id: 'rotate-array',
      slug: 'rotate-array',
      name: 'Rotate Array',
      technique: 'Reversal Algorithm',
      problem: 'Right-rotate an array by k positions.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n) API / O(1) in-place helper',
      requirement: 'k normalized with ((k % n) + n) % n',
      exampleUseCase: 'Right-rotate by k with three reversals',
      useCases: [
        'Rotating arrays by k positions',
        'Teaching reverse-based in-place rearrangement',
      ],
      limitations: [
        'The public lesson API copies the input (O(n) additional space).',
        'True O(1) auxiliary space requires mutating the caller’s array in place.',
      ],
      assumptions:
        'Three reversals: whole array, first k, then the rest. Negative k maps to an equivalent right rotation.',
      tradeoffs:
        'Reversal helper is O(1) auxiliary; the copy-preserving public function is O(n) overall space.',
      lessonHref: '/learn/rotate-array',
      available: true,
      timeClass: 'O(n)',
      spaceNote:
        'Distinguish O(1) aux for reverseRangeInPlace from O(n) for rotateArrayRight’s copy.',
    },
  ]

export const arrayStringDecisionCards: ArrayStringDecisionCard[] = [
  {
    id: 'sorted-pair',
    clue: 'Need to find a pair in a sorted array?',
    recommendation: 'Consider Two Pointers.',
    limitation:
      'The demonstrated O(n) pattern assumes sorted input — sorting first adds cost.',
    lessonSlug: 'two-pointers',
  },
  {
    id: 'fixed-window',
    clue: 'Need to process contiguous subarrays of a fixed size?',
    recommendation: 'Consider Fixed-size Sliding Window.',
    limitation:
      'Window size must be valid, and the technique targets contiguous ranges only.',
    lessonSlug: 'sliding-window',
  },
  {
    id: 'range-sums',
    clue: 'Need many range-sum queries on an unchanged array?',
    recommendation: 'Consider Prefix Sum.',
    limitation:
      'You pay O(n) preprocessing time and O(n) space for the prefix array.',
    lessonSlug: 'prefix-sum',
  },
  {
    id: 'counts',
    clue: 'Need counts or membership frequencies?',
    recommendation: 'Consider Frequency Counting (or a hash map).',
    limitation:
      'Space grows with distinct keys; hash costs are typically expected O(1).',
    lessonSlug: 'frequency-counting',
  },
  {
    id: 'max-subarray',
    clue: 'Need a maximum-sum contiguous subarray (any length)?',
    recommendation: "Consider Kadane's Algorithm.",
    limitation:
      'For a fixed window length k, prefer Fixed-size Sliding Window instead.',
    lessonSlug: 'kadanes-algorithm',
  },
  {
    id: 'unique-substring',
    clue: 'Need a longest substring without repeated characters?',
    recommendation: 'Consider a variable-size Sliding Window with a set.',
    limitation:
      'Different from fixed-size windows; extra space depends on distinct characters.',
    lessonSlug: 'longest-substring-without-repeating',
  },
  {
    id: 'two-anagrams',
    clue: 'Need to check whether two strings are anagrams?',
    recommendation: 'Consider Frequency Counting (Valid Anagram lesson).',
    limitation:
      'This course shows the hash-map approach, not sorting both strings.',
    lessonSlug: 'valid-anagram',
  },
  {
    id: 'group-words',
    clue: 'Need to group words by anagram equivalence?',
    recommendation: 'Consider Group Anagrams.',
    limitation:
      'Sorted signatures cost O(n × m log m); count keys can be faster for small alphabets.',
    lessonSlug: 'group-anagrams',
  },
  {
    id: 'compress-runs',
    clue: 'Need to summarize consecutive repeated characters?',
    recommendation: 'Consider String Compression.',
    limitation:
      'Useful only when the encoding fits the input; may not shorten every string.',
    lessonSlug: 'string-compression',
  },
  {
    id: 'rotate-k',
    clue: 'Need to rotate an array by k positions?',
    recommendation: 'Consider the Reversal Algorithm (Rotate Array).',
    limitation:
      'Copy-preserving APIs add O(n) space even when reversals themselves are in-place.',
    lessonSlug: 'rotate-array',
  },
]

export const arrayStringMisconceptions: ArrayStringMisconception[] = [
  {
    id: 'on-always-best',
    claim: 'O(n) is automatically the best choice.',
    correction:
      'An O(n) method can require assumptions your input does not satisfy (for example, sorted data for Two Pointers). Match the technique to the constraints first.',
  },
  {
    id: 'prefix-free',
    claim: 'Prefix Sum is “free” speed for every range sum.',
    correction:
      'It needs O(n) preprocessing and O(n) extra storage. It shines when many queries share an unchanged array.',
  },
  {
    id: 'window-vs-pointers',
    claim: 'Sliding Window replaces Two Pointers for every scan.',
    correction:
      'Sliding Window works on contiguous ranges. Two Pointers often rely on ordered ends or paired indices — related ideas, not interchangeable labels.',
  },
  {
    id: 'hash-worst',
    claim: 'Hash-map operations are always O(1) in the worst case.',
    correction:
      'Typical educational analysis uses expected O(1) average. Pathological hashing can be worse; treat “O(1)” as the usual assumption, not a universal guarantee.',
  },
  {
    id: 'copy-space',
    claim: 'If the core idea is in-place, total space is always O(1).',
    correction:
      'A copied array or newly built string can make overall additional space O(n) even when the inner helper uses O(1) auxiliary memory (see Rotate Array and String Compression).',
  },
  {
    id: 'sort-then-pointers',
    claim: 'Always sort, then apply Two Pointers.',
    correction:
      'Sorting adds cost and may be inappropriate when original order must be preserved. Only sort when the problem allows it.',
  },
  {
    id: 'window-kinds',
    claim: 'Fixed-size and variable-size Sliding Window are the same problem.',
    correction:
      'Fixed-size windows (max sum of length k) and variable-size windows (longest unique substring) solve different constraints and update rules.',
  },
  {
    id: 'compress-always-shorter',
    claim: 'String Compression always shortens the input.',
    correction:
      'The encoding is useful only when runs make sense for the input. Strings without repeats can stay the same length or longer once counts are written.',
  },
]

export const arrayStringComparisonLearningOrder: ArrayStringLearningOrderItem[] =
  [
    {
      id: 'two-pointers',
      slug: 'two-pointers',
      name: 'Two Pointers',
      reason: 'Introduces paired indices on sorted sequences.',
      lessonHref: '/learn/two-pointers',
    },
    {
      id: 'sliding-window',
      slug: 'sliding-window',
      name: 'Sliding Window',
      reason: 'Adds contiguous fixed-size window updates.',
      lessonHref: '/learn/sliding-window',
    },
    {
      id: 'prefix-sum',
      slug: 'prefix-sum',
      name: 'Prefix Sum',
      reason: 'Shows preprocessing for fast range queries.',
      lessonHref: '/learn/prefix-sum',
    },
    {
      id: 'frequency-counting',
      slug: 'frequency-counting',
      name: 'Frequency Counting',
      reason: 'Introduces hash maps for occurrence problems.',
      lessonHref: '/learn/frequency-counting',
    },
    {
      id: 'kadanes-algorithm',
      slug: 'kadanes-algorithm',
      name: "Kadane's Algorithm",
      reason: 'Linear scan for maximum contiguous sum.',
      lessonHref: '/learn/kadanes-algorithm',
    },
    {
      id: 'longest-substring-without-repeating',
      slug: 'longest-substring-without-repeating',
      name: 'Longest Substring Without Repeating Characters',
      reason: 'Variable-size window with a Set on strings.',
      lessonHref: '/learn/longest-substring-without-repeating-characters',
    },
    {
      id: 'valid-anagram',
      slug: 'valid-anagram',
      name: 'Valid Anagram',
      reason: 'Applies frequency counting to string equality.',
      lessonHref: '/learn/valid-anagram',
    },
    {
      id: 'group-anagrams',
      slug: 'group-anagrams',
      name: 'Group Anagrams',
      reason: 'Scales anagram thinking to groups of words.',
      lessonHref: '/learn/group-anagrams',
    },
    {
      id: 'string-compression',
      slug: 'string-compression',
      name: 'String Compression',
      reason: 'One-pass run encoding and output construction.',
      lessonHref: '/learn/string-compression',
    },
    {
      id: 'rotate-array',
      slug: 'rotate-array',
      name: 'Rotate Array',
      reason: 'In-place reversal ideas and copy vs mutate space.',
      lessonHref: '/learn/rotate-array',
    },
  ]

export const arrayStringProblemOptions: ArrayStringProblemOption[] = [
  {
    id: 'sorted-pair-sum',
    label: 'Find a pair with a target sum (sorted array)',
    primarySlug: 'two-pointers',
    alternativeSlugs: [],
    whyFits:
      'Left and right pointers move based on whether the current sum is too small or too large — only safe when order is sorted.',
    keyPrerequisite: 'Array must be sorted ascending for this lesson’s pattern.',
  },
  {
    id: 'fixed-window-sum',
    label: 'Maximum sum of subarrays of length k',
    primarySlug: 'sliding-window',
    alternativeSlugs: [],
    whyFits:
      'A fixed window slides across contiguous positions while reusing the previous sum.',
    keyPrerequisite: 'Window size k must be valid for the array.',
  },
  {
    id: 'many-range-sums',
    label: 'Many range-sum queries on a static array',
    primarySlug: 'prefix-sum',
    alternativeSlugs: [],
    whyFits:
      'One preprocess builds answers so each inclusive range sum is a subtraction.',
    keyPrerequisite: 'Array should not change between queries (or rebuild).',
  },
  {
    id: 'count-values',
    label: 'Count occurrences / find most frequent value',
    primarySlug: 'frequency-counting',
    alternativeSlugs: [],
    whyFits:
      'A frequency map answers count and “most frequent” questions in a single pass.',
    keyPrerequisite: 'Typical hash-map operations (expected O(1) average).',
  },
  {
    id: 'max-contiguous-sum',
    label: 'Maximum contiguous subarray sum (any length)',
    primarySlug: 'kadanes-algorithm',
    alternativeSlugs: ['sliding-window'],
    whyFits:
      "Kadane tracks the best sum ending at each index in one linear scan. Fixed-size Sliding Window is an alternative only when length k is fixed.",
    keyPrerequisite: 'Problem asks for a contiguous segment (not an arbitrary subset).',
  },
  {
    id: 'longest-unique',
    label: 'Longest substring with unique characters',
    primarySlug: 'longest-substring-without-repeating',
    alternativeSlugs: ['sliding-window'],
    whyFits:
      'A variable window expands with new characters and shrinks when a duplicate appears. Fixed-size Sliding Window is related but solves a different objective.',
    keyPrerequisite: 'Contiguous substring; track characters currently in the window.',
  },
  {
    id: 'check-anagram',
    label: 'Check if two strings are anagrams',
    primarySlug: 'valid-anagram',
    alternativeSlugs: ['frequency-counting'],
    whyFits:
      'Matching character frequencies decides multiset equality. Frequency Counting is the same underlying idea on arrays.',
    keyPrerequisite: 'Decide exact vs normalized comparison rules first.',
  },
  {
    id: 'cluster-anagrams',
    label: 'Group a list of words by anagrams',
    primarySlug: 'group-anagrams',
    alternativeSlugs: ['valid-anagram'],
    whyFits:
      'Each word gets a signature; words with the same signature form a group. Valid Anagram checks a single pair instead.',
    keyPrerequisite: 'Consistent comparison rules across the whole word list.',
  },
  {
    id: 'run-length',
    label: 'Summarize consecutive repeated characters',
    primarySlug: 'string-compression',
    alternativeSlugs: [],
    whyFits:
      'A single scan counts runs and writes character + optional count.',
    keyPrerequisite: 'The educational encoding format fits your input.',
  },
  {
    id: 'rotate-by-k',
    label: 'Rotate an array by k positions',
    primarySlug: 'rotate-array',
    alternativeSlugs: [],
    whyFits:
      'Three reversals rearrange positions without an index-mapping loop in the teaching version.',
    keyPrerequisite: 'Clarify whether the API may copy or must mutate in place.',
  },
]

export function getArrayStringComparisonBySlug(
  slug: string,
): ArrayStringAlgorithmComparison | undefined {
  return arrayStringComparisonAlgorithms.find(
    (algorithm) => algorithm.slug === slug,
  )
}

export function getArrayStringComparisonById(
  id: string,
): ArrayStringAlgorithmComparison | undefined {
  return arrayStringComparisonAlgorithms.find(
    (algorithm) => algorithm.id === id,
  )
}

/**
 * Learning-order items that still resolve to an implemented lesson route.
 * Missing lessons are skipped so the UI never links to a dead destination.
 */
export function getImplementedArrayStringLearningOrder(): ArrayStringLearningOrderItem[] {
  return arrayStringComparisonLearningOrder.filter((item) => {
    const lessonSlug = item.lessonHref.replace(/^\/learn\//, '')
    return Boolean(getLesson(lessonSlug))
  })
}

/**
 * Comparison rows limited to algorithms that are marked available on the hub
 * and that have a registered lesson.
 */
export function getImplementedArrayStringComparisons(): ArrayStringAlgorithmComparison[] {
  const availableSlugs = new Set(
    getAvailableArrayStringAlgorithms().map((algorithm) => algorithm.slug),
  )

  return arrayStringComparisonAlgorithms.filter((algorithm) => {
    const lessonSlug = algorithm.lessonHref.replace(/^\/learn\//, '')
    return (
      algorithm.available &&
      availableSlugs.has(algorithm.slug) &&
      Boolean(getLesson(lessonSlug))
    )
  })
}

export function getArrayStringProblemOption(
  id: string,
): ArrayStringProblemOption | undefined {
  return arrayStringProblemOptions.find((option) => option.id === id)
}
