export type ArrayStringAlgorithm = {
  slug: string
  name: string
  description: string
  difficulty: string
  href?: string
  available: boolean
  pathDescription: string
}

export type ArrayStringConcept = {
  id: string
  title: string
  description: string
  difficulty: string
  available: boolean
  href?: string
}

export type ArrayStringLearningOrderItem = {
  id: string
  title: string
  href?: string
  available: boolean
}

export const arrayStringAlgorithms: ArrayStringAlgorithm[] = [
  {
    slug: 'two-pointers',
    name: 'Two Pointers',
    description:
      'Use two indices to examine different parts of a sorted sequence and find pairs efficiently.',
    difficulty: 'Beginner',
    href: '/learn/two-pointers',
    available: true,
    pathDescription:
      'Learn the classic left/right pattern for pair sums on sorted arrays.',
  },
  {
    slug: 'sliding-window',
    name: 'Sliding Window',
    description:
      'Maintain a moving window over a sequence to analyze contiguous segments efficiently.',
    difficulty: 'Beginner',
    href: '/learn/sliding-window',
    available: true,
    pathDescription:
      'Slide a fixed-size window and reuse the previous sum instead of restarting.',
  },
  {
    slug: 'prefix-sum',
    name: 'Prefix Sum',
    description:
      'Precompute running totals so range sums can be answered quickly.',
    difficulty: 'Beginner',
    available: false,
    pathDescription:
      'Turn repeated range-sum work into constant-time lookups.',
  },
  {
    slug: 'frequency-counting',
    name: 'Frequency Counting',
    description:
      'Count how often values appear using maps or arrays to unlock faster comparisons.',
    difficulty: 'Beginner',
    available: false,
    pathDescription:
      'Use hashing and counts for anagrams, duplicates, and membership checks.',
  },
  {
    slug: 'kadanes-algorithm',
    name: "Kadane's Algorithm",
    description:
      'Find the maximum contiguous subarray sum with a linear scan.',
    difficulty: 'Intermediate',
    available: false,
    pathDescription:
      'Track the best ending-here sum without checking every subarray.',
  },
  {
    slug: 'maximum-subarray',
    name: 'Maximum Subarray',
    description:
      'Locate the contiguous segment with the largest sum — a classic array problem.',
    difficulty: 'Intermediate',
    available: false,
    pathDescription:
      'Connect subarray thinking with efficient scanning techniques.',
  },
  {
    slug: 'longest-substring-without-repeating',
    name: 'Longest Substring Without Repeating Characters',
    description:
      'Find the longest window of unique characters in a string.',
    difficulty: 'Intermediate',
    available: false,
    pathDescription:
      'Combine sliding windows with frequency tracking on strings.',
  },
  {
    slug: 'valid-anagram',
    name: 'Valid Anagram',
    description:
      'Decide whether two strings contain the same characters with the same frequencies.',
    difficulty: 'Beginner',
    available: false,
    pathDescription:
      'Apply counting techniques to string comparison problems.',
  },
  {
    slug: 'group-anagrams',
    name: 'Group Anagrams',
    description:
      'Cluster words that are anagrams of each other using signatures or counts.',
    difficulty: 'Intermediate',
    available: false,
    pathDescription:
      'Scale frequency ideas from pairs of strings to groups of words.',
  },
  {
    slug: 'string-compression',
    name: 'String Compression',
    description:
      'Compress consecutive repeated characters while walking the string once.',
    difficulty: 'Beginner',
    available: false,
    pathDescription:
      'Practice in-place style scanning and rewriting of character runs.',
  },
  {
    slug: 'rotate-array',
    name: 'Rotate Array',
    description:
      'Shift array elements by k positions using efficient in-place techniques.',
    difficulty: 'Beginner',
    available: false,
    pathDescription:
      'Rearrange values with index math or reverse-based rotations.',
  },
]

export const arrayStringConcepts: ArrayStringConcept[] = [
  {
    id: 'traversal',
    title: 'Traversal',
    description:
      'Visit elements in order to read, compare, or transform a sequence.',
    difficulty: 'Beginner',
    available: false,
  },
  {
    id: 'two-pointers',
    title: 'Two Pointers',
    description:
      'Track two positions at once to compare ends, scan together, or shrink a range.',
    difficulty: 'Beginner',
    available: true,
    href: '/learn/two-pointers',
  },
  {
    id: 'sliding-window',
    title: 'Sliding Window',
    description:
      'Maintain a contiguous window that expands and contracts as you scan.',
    difficulty: 'Beginner',
    available: true,
    href: '/learn/sliding-window',
  },
  {
    id: 'prefix-sum',
    title: 'Prefix Sum',
    description:
      'Store running totals so any contiguous range sum can be recovered quickly.',
    difficulty: 'Beginner',
    available: false,
  },
  {
    id: 'hashing-frequency',
    title: 'Hashing / Frequency Counting',
    description:
      'Count occurrences to detect duplicates, anagrams, and membership quickly.',
    difficulty: 'Beginner',
    available: false,
  },
  {
    id: 'sorting-scanning',
    title: 'Sorting + Scanning',
    description:
      'Sort first when order unlocks simpler linear scans afterward.',
    difficulty: 'Beginner',
    available: false,
  },
  {
    id: 'in-place-modification',
    title: 'In-Place Modification',
    description:
      'Rewrite values inside the same array or string with careful index management.',
    difficulty: 'Intermediate',
    available: false,
  },
  {
    id: 'string-processing',
    title: 'String Processing',
    description:
      'Treat strings as character sequences and apply array-style scanning patterns.',
    difficulty: 'Beginner',
    available: false,
  },
]

export const arrayStringLearningOrder: ArrayStringLearningOrderItem[] = [
  {
    id: 'foundations',
    title: 'Array & String Foundations',
    available: false,
  },
  {
    id: 'traversal',
    title: 'Traversal',
    available: false,
  },
  {
    id: 'two-pointers',
    title: 'Two Pointers',
    href: '/learn/two-pointers',
    available: true,
  },
  {
    id: 'sliding-window',
    title: 'Sliding Window',
    href: '/learn/sliding-window',
    available: true,
  },
  {
    id: 'frequency-counting',
    title: 'Frequency Counting',
    available: false,
  },
  {
    id: 'prefix-sum',
    title: 'Prefix Sum',
    available: false,
  },
  {
    id: 'sorting-scanning',
    title: 'Sorting + Scanning',
    available: false,
  },
  {
    id: 'advanced-array-patterns',
    title: 'Advanced Array Patterns',
    available: false,
  },
  {
    id: 'string-algorithms',
    title: 'String Algorithms',
    available: false,
  },
]

export const ARRAY_EXAMPLE = [10, 20, 30, 40, 50] as const
export const STRING_EXAMPLE = 'ALGORITHM'

export function getAvailableArrayStringAlgorithms(): ArrayStringAlgorithm[] {
  return arrayStringAlgorithms.filter((algorithm) => algorithm.available)
}

export function getComingSoonArrayStringAlgorithms(): ArrayStringAlgorithm[] {
  return arrayStringAlgorithms.filter((algorithm) => !algorithm.available)
}

export function getArrayStringAlgorithmBySlug(
  slug: string,
): ArrayStringAlgorithm | undefined {
  return arrayStringAlgorithms.find((algorithm) => algorithm.slug === slug)
}
