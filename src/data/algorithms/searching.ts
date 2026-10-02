export type SearchingAlgorithm = {
  slug: string
  name: string
  description: string
  difficulty: string
  bestTime: string
  averageTime: string
  worstTime: string
  requiresSortedData: boolean
  href?: string
  available: boolean
  /** Short line used on the learning-path stage card. */
  pathDescription: string
  /** Compact complexity shown on the learning-path stage. */
  pathComplexity: string
  mainIdea: string
  useCase: string
}

export type SearchingConcept = {
  id: string
  title: string
  description: string
}

export type SearchingRequirement = {
  id: string
  question: string
  guidance: string
}

export type SearchingLearningOrderItem = {
  id: string
  title: string
  href?: string
  available: boolean
}

export type SearchComparisonRow = {
  property: string
  linear: string
  binary: string
}

export const searchingAlgorithms: SearchingAlgorithm[] = [
  {
    slug: 'linear-search',
    name: 'Linear Search',
    description:
      'Check elements one by one until the target is found or the array ends.',
    difficulty: 'Beginner',
    bestTime: 'O(1)',
    averageTime: 'O(n)',
    worstTime: 'O(n)',
    requiresSortedData: false,
    href: '/learn/linear-search',
    available: true,
    pathDescription:
      'Learn the simplest searching approach by checking elements one by one.',
    pathComplexity: 'O(n)',
    mainIdea: 'Check elements sequentially',
    useCase: 'Simple search without preprocessing',
  },
  {
    slug: 'binary-search',
    name: 'Binary Search',
    description:
      'Search a sorted array by repeatedly eliminating half of the remaining search range.',
    difficulty: 'Beginner',
    bestTime: 'O(1)',
    averageTime: 'O(log n)',
    worstTime: 'O(log n)',
    requiresSortedData: true,
    href: '/learn/binary-search',
    available: true,
    pathDescription:
      'Learn how sorted data can be searched by repeatedly eliminating half of the search space.',
    pathComplexity: 'O(log n)',
    mainIdea: 'Repeatedly eliminate half the search space',
    useCase: 'Efficient search in sorted data',
  },
  {
    slug: 'jump-search',
    name: 'Jump Search',
    description:
      'Jump ahead in fixed steps on sorted data, then scan a small block linearly.',
    difficulty: 'Beginner',
    bestTime: 'O(1)',
    averageTime: 'O(√n)',
    worstTime: 'O(√n)',
    requiresSortedData: true,
    href: '/learn/jump-search',
    available: true,
    pathDescription:
      'Bridge linear and binary ideas by jumping ahead, then scanning a block.',
    pathComplexity: 'O(√n)',
    mainIdea: 'Jump in blocks, then scan locally',
    useCase: 'Sorted arrays when binary search is less convenient',
  },
  {
    slug: 'interpolation-search',
    name: 'Interpolation Search',
    description:
      'Estimate the probable position of the target using value distribution on sorted data.',
    difficulty: 'Intermediate',
    bestTime: 'O(1)',
    averageTime: 'O(log log n)',
    worstTime: 'O(n)',
    requiresSortedData: true,
    available: false,
    pathDescription:
      'Use value spacing to guess where the target is likely to be.',
    pathComplexity: 'O(log log n)',
    mainIdea: 'Probe based on value distribution',
    useCase: 'Uniformly distributed sorted keys',
  },
  {
    slug: 'exponential-search',
    name: 'Exponential Search',
    description:
      'Expand the search bound exponentially, then finish with binary search.',
    difficulty: 'Intermediate',
    bestTime: 'O(1)',
    averageTime: 'O(log n)',
    worstTime: 'O(log n)',
    requiresSortedData: true,
    available: false,
    pathDescription:
      'Find a suitable range quickly, then apply binary search inside it.',
    pathComplexity: 'O(log n)',
    mainIdea: 'Grow bounds, then binary search',
    useCase: 'Unbounded or very large sorted sequences',
  },
  {
    slug: 'rotated-sorted-array',
    name: 'Search in Rotated Sorted Array',
    description:
      'Adapt binary search ideas when a sorted array has been rotated.',
    difficulty: 'Advanced',
    bestTime: 'O(1)',
    averageTime: 'O(log n)',
    worstTime: 'O(log n)',
    requiresSortedData: false,
    available: false,
    pathDescription:
      'Handle rotated sorted input while still narrowing the search space.',
    pathComplexity: 'O(log n)',
    mainIdea: 'Binary search with rotation awareness',
    useCase: 'Rotated sorted interview-style problems',
  },
  {
    slug: 'search-2d-matrix',
    name: 'Search in 2D Matrix',
    description:
      'Search structured matrices by treating rows and columns as ordered ranges.',
    difficulty: 'Advanced',
    bestTime: 'O(1)',
    averageTime: 'O(log(m·n))',
    worstTime: 'O(log(m·n))',
    requiresSortedData: true,
    available: false,
    pathDescription:
      'Extend searching ideas from one dimension into matrix structures.',
    pathComplexity: 'O(log(m·n))',
    mainIdea: 'Search across ordered rows and columns',
    useCase: 'Sorted matrix lookup problems',
  },
]

export const searchingConcepts: SearchingConcept[] = [
  {
    id: 'sequential-search',
    title: 'Sequential Search',
    description:
      'Visit elements in order, usually from the start of the collection, until the target is found or the data ends.',
  },
  {
    id: 'sorted-data',
    title: 'Sorted Data',
    description:
      'Ordered input unlocks techniques that discard large portions of the collection without checking every value.',
  },
  {
    id: 'search-space',
    title: 'Search Space',
    description:
      'The portion of the input that could still contain the target. Search algorithms try to shrink this space safely.',
  },
  {
    id: 'range-reduction',
    title: 'Range Reduction',
    description:
      'Binary search repeatedly removes half of the remaining range, which is why its work grows much more slowly than linear scanning.',
  },
  {
    id: 'target-matching',
    title: 'Target Matching',
    description:
      'Every search compares candidate values against a target, then decides whether to stop, continue, or discard a region.',
  },
  {
    id: 'time-complexity',
    title: 'Time Complexity',
    description:
      'Big O describes how the number of operations grows as the input size grows — the key question behind choosing a search method.',
  },
]

export const searchingRequirements: SearchingRequirement[] = [
  {
    id: 'sorted',
    question: 'Is the data sorted?',
    guidance:
      'If not, Linear Search works immediately. Binary Search needs sorted input first.',
  },
  {
    id: 'modifiable',
    question: 'Can the data be modified?',
    guidance:
      'Sorting before searching may reorder values. If order must stay fixed, consider whether you can copy the data or must search as-is.',
  },
  {
    id: 'size',
    question: 'How large is the input?',
    guidance:
      'For tiny arrays, Linear Search is often fine. As n grows, logarithmic search becomes much more attractive — if sorting is already paid for.',
  },
  {
    id: 'repeated',
    question: 'Do we need repeated searches?',
    guidance:
      'One search may not justify sorting. Many searches on the same data can make preprocessing worthwhile.',
  },
  {
    id: 'preprocessing',
    question: 'Is preprocessing acceptable?',
    guidance:
      'Sorting costs time up front. Binary Search shines when that cost is already paid or will be amortized across many lookups.',
  },
  {
    id: 'memory',
    question: 'Is memory limited?',
    guidance:
      'Some approaches need extra space for copies or auxiliary structures. Linear Search needs almost none beyond a few indices.',
  },
]

export const searchingLearningOrder: SearchingLearningOrderItem[] = [
  {
    id: 'big-o-complexity',
    title: 'Big O Complexity',
    href: '/learn/big-o-complexity',
    available: true,
  },
  {
    id: 'linear-search',
    title: 'Linear Search',
    href: '/learn/linear-search',
    available: true,
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    href: '/learn/binary-search',
    available: true,
  },
  {
    id: 'jump-search',
    title: 'Jump Search',
    href: '/learn/jump-search',
    available: true,
  },
  {
    id: 'interpolation-search',
    title: 'Interpolation Search',
    available: false,
  },
  {
    id: 'exponential-search',
    title: 'Exponential Search',
    available: false,
  },
  {
    id: 'advanced-search-problems',
    title: 'Advanced Search Problems',
    available: false,
  },
]

export const searchComparisonRows: SearchComparisonRow[] = [
  {
    property: 'Works on unsorted data',
    linear: 'Yes',
    binary: 'No',
  },
  {
    property: 'Requires sorted data',
    linear: 'No',
    binary: 'Yes',
  },
  {
    property: 'Best',
    linear: 'O(1)',
    binary: 'O(1)',
  },
  {
    property: 'Average',
    linear: 'O(n)',
    binary: 'O(log n)',
  },
  {
    property: 'Worst',
    linear: 'O(n)',
    binary: 'O(log n)',
  },
  {
    property: 'Main idea',
    linear: 'Check elements sequentially',
    binary: 'Repeatedly eliminate half the search space',
  },
  {
    property: 'Use case',
    linear: 'Simple search without preprocessing',
    binary: 'Efficient search in sorted data',
  },
]

export const LINEAR_DEMO_ARRAY = [10, 25, 7, 42, 18, 31] as const
export const LINEAR_DEMO_TARGET = 42
export const BINARY_DEMO_ARRAY = [
  3, 7, 12, 18, 24, 31, 42, 56, 68,
] as const
export const BINARY_DEMO_TARGET = 42

export function getAvailableSearchingAlgorithms(): SearchingAlgorithm[] {
  return searchingAlgorithms.filter((algorithm) => algorithm.available)
}

export function getComingSoonSearchingAlgorithms(): SearchingAlgorithm[] {
  return searchingAlgorithms.filter((algorithm) => !algorithm.available)
}

export function getSearchingAlgorithmBySlug(
  slug: string,
): SearchingAlgorithm | undefined {
  return searchingAlgorithms.find((algorithm) => algorithm.slug === slug)
}

/** Stages currently shown on the learning path (available + coming soon). */
export function getSearchingLearningPath(): SearchingAlgorithm[] {
  return searchingAlgorithms
}
