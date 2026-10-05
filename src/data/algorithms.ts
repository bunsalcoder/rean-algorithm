import type { CategoryAccent, CategoryIconName } from './categories'

export type AlgorithmDifficulty = 'Beginner' | 'Intermediate' | 'Advanced'
export type AlgorithmStatus = 'available' | 'coming-soon'

export type AlgorithmCategoryId =
  | 'sorting'
  | 'searching'
  | 'array-string'
  | 'linked-list'
  | 'stack-queue'
  | 'tree-graph'
  | 'dynamic-programming'
  | 'backtracking'

export type AlgorithmItem = {
  id: string
  title: string
  description: string
  href: string
  lessonSlug?: string
  categoryId: AlgorithmCategoryId
  difficulty: AlgorithmDifficulty
  status: AlgorithmStatus
}

export type AlgorithmCategoryMeta = {
  id: AlgorithmCategoryId
  title: string
  description: string
  href: string
  icon: CategoryIconName
  accent: CategoryAccent
}

export const algorithmCategoryMeta: AlgorithmCategoryMeta[] = [
  {
    id: 'sorting',
    title: 'Sorting Algorithms',
    description: 'Learn popular sorting algorithms and their variations.',
    href: '/algorithms/sorting',
    icon: 'sorting',
    accent: 'purple',
  },
  {
    id: 'searching',
    title: 'Searching Algorithms',
    description: 'Find elements efficiently in sorted or unsorted data.',
    href: '/algorithms/searching',
    icon: 'searching',
    accent: 'blue',
  },
  {
    id: 'array-string',
    title: 'Array & String',
    description: 'Master common array and string manipulation techniques.',
    href: '/algorithms/array-string',
    icon: 'array-string',
    accent: 'green',
  },
  {
    id: 'linked-list',
    title: 'Linked List',
    description: 'Understand pointer-based list structures and patterns.',
    href: '/data-structures/linked-list',
    icon: 'linked-list',
    accent: 'orange',
  },
  {
    id: 'stack-queue',
    title: 'Stack & Queue',
    description: 'Explore LIFO and FIFO structures with classic problems.',
    href: '/data-structures/stack-queue',
    icon: 'stack-queue',
    accent: 'pink',
  },
  {
    id: 'tree-graph',
    title: 'Tree & Graph',
    description: 'Traverse and search hierarchical and networked data.',
    href: '/algorithms/tree-graph',
    icon: 'tree-graph',
    accent: 'teal',
  },
  {
    id: 'dynamic-programming',
    title: 'Dynamic Programming',
    description: 'Break hard problems into overlapping subproblems.',
    href: '/algorithms/dynamic-programming',
    icon: 'dynamic-programming',
    accent: 'violet',
  },
  {
    id: 'backtracking',
    title: 'Backtracking',
    description: 'Explore decision trees and prune invalid paths early.',
    href: '/algorithms/backtracking',
    icon: 'backtracking',
    accent: 'red',
  },
]

export const algorithms: AlgorithmItem[] = [
  {
    id: 'bubble-sort',
    title: 'Bubble Sort',
    description:
      'Compare neighbors and swap them until larger values bubble to the end.',
    href: '/learn/bubble-sort',
    lessonSlug: 'bubble-sort',
    categoryId: 'sorting',
    difficulty: 'Beginner',
    status: 'available',
  },
  {
    id: 'selection-sort',
    title: 'Selection Sort',
    description:
      'Repeatedly select the next smallest value and place it in order.',
    href: '/learn/selection-sort',
    lessonSlug: 'selection-sort',
    categoryId: 'sorting',
    difficulty: 'Beginner',
    status: 'available',
  },
  {
    id: 'insertion-sort',
    title: 'Insertion Sort',
    description:
      'Build a sorted prefix by inserting each next value into the right spot.',
    href: '/learn/insertion-sort',
    lessonSlug: 'insertion-sort',
    categoryId: 'sorting',
    difficulty: 'Beginner',
    status: 'available',
  },
  {
    id: 'merge-sort',
    title: 'Merge Sort',
    description:
      'Divide the array, sort each half, then merge the sorted halves.',
    href: '/learn/merge-sort',
    lessonSlug: 'merge-sort',
    categoryId: 'sorting',
    difficulty: 'Beginner',
    status: 'available',
  },
  {
    id: 'quick-sort',
    title: 'Quick Sort',
    description:
      'Partition around a pivot and recursively sort the left and right sides.',
    href: '/learn/quick-sort',
    lessonSlug: 'quick-sort',
    categoryId: 'sorting',
    difficulty: 'Beginner',
    status: 'available',
  },
  {
    id: 'heap-sort',
    title: 'Heap Sort',
    description:
      'Build a Max Heap, then repeatedly extract the largest value into place.',
    href: '/learn/heap-sort',
    lessonSlug: 'heap-sort',
    categoryId: 'sorting',
    difficulty: 'Intermediate',
    status: 'available',
  },
  {
    id: 'linear-search',
    title: 'Linear Search',
    description:
      'Check each element in order until you find the target or reach the end.',
    href: '/learn/linear-search',
    lessonSlug: 'linear-search',
    categoryId: 'searching',
    difficulty: 'Beginner',
    status: 'available',
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    description:
      'Repeatedly divide a sorted array in half to locate a target value.',
    href: '/learn/binary-search',
    lessonSlug: 'binary-search',
    categoryId: 'searching',
    difficulty: 'Beginner',
    status: 'available',
  },
  {
    id: 'jump-search',
    title: 'Jump Search',
    description:
      'Jump by √n-sized blocks on sorted data, then scan the matching block.',
    href: '/learn/jump-search',
    lessonSlug: 'jump-search',
    categoryId: 'searching',
    difficulty: 'Beginner',
    status: 'available',
  },
  {
    id: 'interpolation-search',
    title: 'Interpolation Search',
    description:
      'Estimate a likely position from value spacing on sorted numeric data.',
    href: '/learn/interpolation-search',
    lessonSlug: 'interpolation-search',
    categoryId: 'searching',
    difficulty: 'Intermediate',
    status: 'available',
  },
  {
    id: 'exponential-search',
    title: 'Exponential Search',
    description:
      'Grow a search bound by doubling, then Binary Search inside that range.',
    href: '/learn/exponential-search',
    lessonSlug: 'exponential-search',
    categoryId: 'searching',
    difficulty: 'Intermediate',
    status: 'available',
  },
  {
    id: 'search-variations',
    title: 'Search Variations',
    description:
      'Lower bound, upper bound, and related binary-search patterns.',
    href: '/algorithms/searching',
    categoryId: 'searching',
    difficulty: 'Intermediate',
    status: 'coming-soon',
  },
  {
    id: 'two-pointers',
    title: 'Two Pointers',
    description:
      'Use two indices to examine different parts of a sorted sequence efficiently.',
    href: '/learn/two-pointers',
    lessonSlug: 'two-pointers',
    categoryId: 'array-string',
    difficulty: 'Beginner',
    status: 'available',
  },
  {
    id: 'sliding-window',
    title: 'Sliding Window',
    description:
      'Maintain a moving window over a sequence to analyze contiguous segments.',
    href: '/learn/sliding-window',
    lessonSlug: 'sliding-window',
    categoryId: 'array-string',
    difficulty: 'Beginner',
    status: 'available',
  },
  {
    id: 'prefix-sum',
    title: 'Prefix Sum',
    description:
      'Precompute running totals so range sums can be answered quickly.',
    href: '/algorithms/array-string',
    categoryId: 'array-string',
    difficulty: 'Beginner',
    status: 'coming-soon',
  },
  {
    id: 'frequency-counting',
    title: 'Frequency Counting',
    description:
      'Count how often values appear to unlock faster comparisons.',
    href: '/algorithms/array-string',
    categoryId: 'array-string',
    difficulty: 'Beginner',
    status: 'coming-soon',
  },
  {
    id: 'kadanes-algorithm',
    title: "Kadane's Algorithm",
    description:
      'Find the maximum contiguous subarray sum with a linear scan.',
    href: '/algorithms/array-string',
    categoryId: 'array-string',
    difficulty: 'Intermediate',
    status: 'coming-soon',
  },
  {
    id: 'maximum-subarray',
    title: 'Maximum Subarray',
    description:
      'Locate the contiguous segment with the largest sum.',
    href: '/algorithms/array-string',
    categoryId: 'array-string',
    difficulty: 'Intermediate',
    status: 'coming-soon',
  },
  {
    id: 'longest-substring-without-repeating',
    title: 'Longest Substring Without Repeating Characters',
    description:
      'Find the longest window of unique characters in a string.',
    href: '/algorithms/array-string',
    categoryId: 'array-string',
    difficulty: 'Intermediate',
    status: 'coming-soon',
  },
  {
    id: 'valid-anagram',
    title: 'Valid Anagram',
    description:
      'Decide whether two strings contain the same characters with the same frequencies.',
    href: '/algorithms/array-string',
    categoryId: 'array-string',
    difficulty: 'Beginner',
    status: 'coming-soon',
  },
  {
    id: 'group-anagrams',
    title: 'Group Anagrams',
    description:
      'Cluster words that are anagrams of each other.',
    href: '/algorithms/array-string',
    categoryId: 'array-string',
    difficulty: 'Intermediate',
    status: 'coming-soon',
  },
  {
    id: 'string-compression',
    title: 'String Compression',
    description:
      'Compress consecutive repeated characters while walking the string once.',
    href: '/algorithms/array-string',
    categoryId: 'array-string',
    difficulty: 'Beginner',
    status: 'coming-soon',
  },
  {
    id: 'rotate-array',
    title: 'Rotate Array',
    description:
      'Shift array elements by k positions using efficient techniques.',
    href: '/algorithms/array-string',
    categoryId: 'array-string',
    difficulty: 'Beginner',
    status: 'coming-soon',
  },
]

const algorithmsByCategory = new Map<AlgorithmCategoryId, AlgorithmItem[]>()

for (const algorithm of algorithms) {
  const list = algorithmsByCategory.get(algorithm.categoryId) ?? []
  list.push(algorithm)
  algorithmsByCategory.set(algorithm.categoryId, list)
}

const categoryById = new Map(
  algorithmCategoryMeta.map((category) => [category.id, category]),
)

export function getAlgorithmCategory(
  id: string,
): AlgorithmCategoryMeta | undefined {
  return categoryById.get(id as AlgorithmCategoryId)
}

export function getAlgorithmsByCategory(
  categoryId: AlgorithmCategoryId,
): AlgorithmItem[] {
  return algorithmsByCategory.get(categoryId) ?? []
}

export function getAlgorithmByLessonSlug(
  slug: string,
): AlgorithmItem | undefined {
  return algorithms.find((algorithm) => algorithm.lessonSlug === slug)
}
