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
    id: 'linear-search',
    title: 'Linear Search',
    description:
      'Check each element in order until you find the target or reach the end.',
    href: '/algorithms/searching',
    categoryId: 'searching',
    difficulty: 'Beginner',
    status: 'coming-soon',
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
    id: 'search-variations',
    title: 'Search Variations',
    description:
      'Lower bound, upper bound, and related binary-search patterns.',
    href: '/algorithms/searching',
    categoryId: 'searching',
    difficulty: 'Intermediate',
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
