export type CategoryAccent =
  | 'purple'
  | 'blue'
  | 'green'
  | 'orange'
  | 'pink'
  | 'teal'
  | 'violet'
  | 'red'

export type CategoryIconName =
  | 'sorting'
  | 'searching'
  | 'array-string'
  | 'linked-list'
  | 'stack-queue'
  | 'tree-graph'
  | 'dynamic-programming'
  | 'backtracking'

export type AlgorithmCategory = {
  title: string
  description: string
  count: number
  href: string
  icon: CategoryIconName
  accent: CategoryAccent
}

export const algorithmCategories: AlgorithmCategory[] = [
  {
    title: 'Sorting Algorithms',
    description: 'Learn popular sorting algorithms and their variations.',
    count: 8,
    href: '/algorithms/sorting',
    icon: 'sorting',
    accent: 'purple',
  },
  {
    title: 'Searching Algorithms',
    description: 'Find elements efficiently in sorted or unsorted data.',
    count: 6,
    href: '/algorithms/searching',
    icon: 'searching',
    accent: 'blue',
  },
  {
    title: 'Array & String',
    description: 'Work with arrays, strings and common manipulation problems.',
    count: 12,
    href: '/algorithms/array-string',
    icon: 'array-string',
    accent: 'green',
  },
  {
    title: 'Linked List',
    description: 'Understand and solve linked list problems.',
    count: 6,
    href: '/data-structures/linked-list',
    icon: 'linked-list',
    accent: 'orange',
  },
  {
    title: 'Stack & Queue',
    description: 'Learn stack and queue based problems and applications.',
    count: 6,
    href: '/data-structures/stack-queue',
    icon: 'stack-queue',
    accent: 'pink',
  },
  {
    title: 'Tree & Graph',
    description: 'Explore tree and graph traversal, shortest path and more.',
    count: 10,
    href: '/algorithms/tree-graph',
    icon: 'tree-graph',
    accent: 'teal',
  },
  {
    title: 'Dynamic Programming',
    description: 'Solve complex problems with optimal solutions.',
    count: 8,
    href: '/algorithms/dynamic-programming',
    icon: 'dynamic-programming',
    accent: 'violet',
  },
  {
    title: 'Backtracking',
    description: 'Explore backtracking techniques for combinatorial problems.',
    count: 6,
    href: '/algorithms/backtracking',
    icon: 'backtracking',
    accent: 'red',
  },
]
