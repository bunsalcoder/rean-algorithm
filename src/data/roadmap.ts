export type RoadmapStageStatus = 'not-started' | 'in-progress' | 'completed'

export type RoadmapAccent =
  | 'violet'
  | 'indigo'
  | 'blue'
  | 'sky'
  | 'teal'
  | 'emerald'
  | 'orange'
  | 'amber'
  | 'pink'
  | 'rose'
  | 'fuchsia'
  | 'cyan'
  | 'slate'

export type RoadmapIconName =
  | 'foundations'
  | 'complexity'
  | 'arrays-strings'
  | 'searching'
  | 'sorting'
  | 'linked-lists'
  | 'stack-queue'
  | 'hashing'
  | 'trees'
  | 'graphs'
  | 'techniques'
  | 'dynamic-programming'
  | 'advanced'

export type RoadmapStage = {
  id: string
  number: number
  title: string
  description: string
  topics: string[]
  icon: RoadmapIconName
  href: string
  accent: RoadmapAccent
  /** Future progress state — currently always not-started (static site). */
  status: RoadmapStageStatus
}

export const roadmapStages: RoadmapStage[] = [
  {
    id: 'foundations',
    number: 1,
    title: 'Foundations',
    description:
      'Build the programming fundamentals needed to understand algorithms.',
    topics: [
      'Programming Basics',
      'Variables & Data Types',
      'Conditions & Loops',
      'Functions',
      'Recursion Basics',
    ],
    icon: 'foundations',
    href: '/roadmap/foundations',
    accent: 'violet',
    status: 'not-started',
  },
  {
    id: 'complexity',
    number: 2,
    title: 'Complexity',
    description: 'Learn how to analyze the efficiency of algorithms.',
    topics: [
      'What is Big O?',
      'Time Complexity',
      'Space Complexity',
      'Best, Average & Worst Case',
      'Complexity Comparison',
    ],
    icon: 'complexity',
    href: '/roadmap/complexity',
    accent: 'indigo',
    status: 'not-started',
  },
  {
    id: 'arrays-strings',
    number: 3,
    title: 'Arrays & Strings',
    description:
      'Master the most common structures used in algorithm problems.',
    topics: [
      'Arrays',
      'Array Traversal',
      'Two Pointers',
      'Sliding Window',
      'Prefix Sum',
      'String Manipulation',
    ],
    icon: 'arrays-strings',
    href: '/roadmap/arrays-strings',
    accent: 'blue',
    status: 'not-started',
  },
  {
    id: 'searching',
    number: 4,
    title: 'Searching',
    description: 'Learn how to efficiently find information in data.',
    topics: ['Linear Search', 'Binary Search', 'Search Variations'],
    icon: 'searching',
    href: '/roadmap/searching',
    accent: 'sky',
    status: 'not-started',
  },
  {
    id: 'sorting',
    number: 5,
    title: 'Sorting',
    description:
      'Understand how different sorting strategies work and when to use them.',
    topics: [
      'Bubble Sort',
      'Selection Sort',
      'Insertion Sort',
      'Merge Sort',
      'Quick Sort',
      'Heap Sort',
      'Counting Sort',
    ],
    icon: 'sorting',
    href: '/roadmap/sorting',
    accent: 'teal',
    status: 'not-started',
  },
  {
    id: 'linked-lists',
    number: 6,
    title: 'Linked Lists',
    description: 'Understand linked structures and common pointer techniques.',
    topics: [
      'Singly Linked List',
      'Doubly Linked List',
      'Fast & Slow Pointers',
      'Linked List Reversal',
    ],
    icon: 'linked-lists',
    href: '/roadmap/linked-lists',
    accent: 'emerald',
    status: 'not-started',
  },
  {
    id: 'stack-queue',
    number: 7,
    title: 'Stack & Queue',
    description:
      'Learn structures that organize data around specific access patterns.',
    topics: ['Stack', 'Queue', 'Deque', 'Monotonic Stack', 'Priority Queue'],
    icon: 'stack-queue',
    href: '/roadmap/stack-queue',
    accent: 'orange',
    status: 'not-started',
  },
  {
    id: 'hashing',
    number: 8,
    title: 'Hashing',
    description: 'Learn how hashing can provide fast lookup and counting.',
    topics: ['Hash Tables', 'Hash Maps', 'Hash Sets', 'Frequency Counting'],
    icon: 'hashing',
    href: '/roadmap/hashing',
    accent: 'amber',
    status: 'not-started',
  },
  {
    id: 'trees',
    number: 9,
    title: 'Trees',
    description: 'Learn hierarchical data structures and traversal techniques.',
    topics: [
      'Binary Tree',
      'Tree Traversal',
      'Binary Search Tree',
      'Heap',
      'Trie',
    ],
    icon: 'trees',
    href: '/roadmap/trees',
    accent: 'pink',
    status: 'not-started',
  },
  {
    id: 'graphs',
    number: 10,
    title: 'Graphs',
    description:
      'Learn how to model and solve problems involving connected data.',
    topics: [
      'Graph Representation',
      'BFS',
      'DFS',
      'Connected Components',
      'Shortest Path',
      'Topological Sort',
      'Minimum Spanning Tree',
    ],
    icon: 'graphs',
    href: '/roadmap/graphs',
    accent: 'rose',
    status: 'not-started',
  },
  {
    id: 'algorithmic-techniques',
    number: 11,
    title: 'Algorithmic Techniques',
    description:
      'Learn reusable strategies for solving more complex problems.',
    topics: [
      'Greedy Algorithms',
      'Divide & Conquer',
      'Backtracking',
      'Bit Manipulation',
    ],
    icon: 'techniques',
    href: '/roadmap/algorithmic-techniques',
    accent: 'fuchsia',
    status: 'not-started',
  },
  {
    id: 'dynamic-programming',
    number: 12,
    title: 'Dynamic Programming',
    description:
      'Learn how to break complex problems into reusable subproblems.',
    topics: [
      'DP Fundamentals',
      'Memoization',
      'Tabulation',
      '1D DP',
      '2D DP',
      'Knapsack',
      'Subsequence Problems',
    ],
    icon: 'dynamic-programming',
    href: '/roadmap/dynamic-programming',
    accent: 'cyan',
    status: 'not-started',
  },
  {
    id: 'advanced-algorithms',
    number: 13,
    title: 'Advanced Algorithms',
    description:
      'Explore advanced techniques after mastering the fundamentals.',
    topics: [
      'Advanced Graph Algorithms',
      'Advanced String Algorithms',
      'Advanced Data Structures',
      'Advanced Dynamic Programming',
    ],
    icon: 'advanced',
    href: '/roadmap/advanced-algorithms',
    accent: 'slate',
    status: 'not-started',
  },
]

export function getRoadmapStage(id: string): RoadmapStage | undefined {
  return roadmapStages.find((stage) => stage.id === id)
}

export function getStageActionLabel(status: RoadmapStageStatus): string {
  switch (status) {
    case 'in-progress':
      return 'Continue'
    case 'completed':
      return 'Review'
    case 'not-started':
    default:
      return 'Start Learning'
  }
}

export function getStageStatusLabel(status: RoadmapStageStatus): string {
  switch (status) {
    case 'in-progress':
      return 'In Progress'
    case 'completed':
      return 'Completed'
    case 'not-started':
    default:
      return 'Not Started'
  }
}
