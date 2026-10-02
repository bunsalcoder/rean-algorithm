export type ComplexityCase = 'best' | 'average' | 'worst'

export type ComplexityClass = 'O(n)' | 'O(n log n)' | 'O(n²)'

export type SortingAlgorithmComparison = {
  slug: string
  name: string
  category: string
  bestTime: ComplexityClass
  averageTime: ComplexityClass
  worstTime: ComplexityClass
  /** Compact table label for algorithmic auxiliary space. */
  space: string
  /** Longer explanation of algorithmic auxiliary space. */
  spaceDetail: string
  /**
   * Implementation overhead from copying the input so lessons preserve the
   * original array. Distinct from algorithmic auxiliary space.
   */
  implementationSpaceNote: string
  stable: boolean
  inPlace: boolean
  adaptive: boolean
  adaptiveNote?: string
  description: string
  mainApproach: string
  strengths: string[]
  tradeoffs: string[]
  lessonHref: string
}

export type SortingDecisionQuestion = {
  question: string
  guidance: string
}

export type AlgorithmPairDifference = {
  leftSlug: string
  rightSlug: string
  points: string[]
}

/** Conceptual growth order used by the complexity chart (not runtime ms). */
export const complexityClassRank: Record<ComplexityClass, number> = {
  'O(n)': 1,
  'O(n log n)': 2,
  'O(n²)': 3,
}

export const complexityCaseLabels: Record<ComplexityCase, string> = {
  best: 'Best Case',
  average: 'Average Case',
  worst: 'Worst Case',
}

export const sortingComparisonAlgorithms: SortingAlgorithmComparison[] = [
  {
    slug: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'Sorting',
    bestTime: 'O(n)',
    averageTime: 'O(n²)',
    worstTime: 'O(n²)',
    space: 'O(1)',
    spaceDetail:
      'Algorithmic auxiliary space is O(1) for indices and a temporary swap.',
    implementationSpaceNote:
      'Lesson implementations copy the input before sorting so the original array is preserved. That copy adds O(n) implementation overhead on top of the O(1) sorting procedure.',
    stable: true,
    inPlace: true,
    adaptive: true,
    adaptiveNote:
      'Adaptive with the early-exit implementation used in the Bubble Sort lesson: a sorted array can finish after one pass.',
    description:
      'Repeatedly compare adjacent neighbors and swap them when they are out of order, so larger values gradually bubble toward the end.',
    mainApproach:
      'Walk through adjacent pairs, swap when needed, and shrink the unsorted suffix each pass. With early exit, stop when a pass makes no swaps.',
    strengths: [
      'Simple to understand and implement.',
      'Stable: equal values keep their relative order.',
      'Adaptive with early exit — already-sorted input can finish in O(n).',
      'Useful for teaching comparisons and swaps.',
    ],
    tradeoffs: [
      'Average and worst-case time are O(n²), which grows quickly for larger inputs.',
      'Usually not a practical choice when faster sorting algorithms are available.',
      'Many passes may repeat work that more structured algorithms avoid.',
    ],
    lessonHref: '/learn/bubble-sort',
  },
  {
    slug: 'selection-sort',
    name: 'Selection Sort',
    category: 'Sorting',
    bestTime: 'O(n²)',
    averageTime: 'O(n²)',
    worstTime: 'O(n²)',
    space: 'O(1)',
    spaceDetail:
      'Algorithmic auxiliary space is O(1) for indices and a temporary swap variable.',
    implementationSpaceNote:
      'Lesson implementations copy the input before sorting so the original array is preserved. That copy adds O(n) implementation overhead even though the in-place sorting procedure only needs O(1) extra space.',
    stable: false,
    inPlace: true,
    adaptive: false,
    adaptiveNote:
      'Not adaptive: even a sorted array still performs about the same number of comparisons.',
    description:
      'Repeatedly select the smallest value in the unsorted portion and swap it into the next sorted position.',
    mainApproach:
      'For each position, scan the remaining unsorted range for the minimum, then swap that minimum into place once.',
    strengths: [
      'Simple selection idea that is easy to visualize.',
      'In-place: rearranges values inside the working array.',
      'Performs at most one swap per outer pass (after finding the minimum).',
    ],
    tradeoffs: [
      'Best, average, and worst-case time are all O(n²).',
      'Not stable for the implementation used in this course.',
      'Not adaptive — already-sorted input does not meaningfully reduce comparisons.',
    ],
    lessonHref: '/learn/selection-sort',
  },
  {
    slug: 'insertion-sort',
    name: 'Insertion Sort',
    category: 'Sorting',
    bestTime: 'O(n)',
    averageTime: 'O(n²)',
    worstTime: 'O(n²)',
    space: 'O(1)',
    spaceDetail:
      'Algorithmic auxiliary space is O(1) for indices and the key variable used during insertion.',
    implementationSpaceNote:
      'Lesson implementations copy the input before sorting so the original array is preserved. That copy adds O(n) implementation overhead; the insertion procedure itself still uses O(1) auxiliary space.',
    stable: true,
    inPlace: true,
    adaptive: true,
    adaptiveNote:
      'Adaptive: nearly sorted input needs little shifting, so best-case time is O(n).',
    description:
      'Build a sorted prefix by inserting each next value into the correct position among the values already sorted.',
    mainApproach:
      'Take the next unsorted key, shift larger values in the sorted prefix one step right, then insert the key into the opened spot.',
    strengths: [
      'Stable and in-place for the procedure used here.',
      'Adaptive — excellent on small or nearly sorted arrays.',
      'Best-case O(n) when little or no shifting is needed.',
      'Often used as a building block inside more advanced sorts.',
    ],
    tradeoffs: [
      'Average and worst-case time remain O(n²).',
      'Reverse-sorted input causes lots of shifting.',
      'For large unordered arrays, O(n log n) algorithms usually grow more gently.',
    ],
    lessonHref: '/learn/insertion-sort',
  },
  {
    slug: 'merge-sort',
    name: 'Merge Sort',
    category: 'Sorting',
    bestTime: 'O(n log n)',
    averageTime: 'O(n log n)',
    worstTime: 'O(n log n)',
    space: 'O(n)',
    spaceDetail:
      'Algorithmic auxiliary space is O(n) for the temporary arrays used while merging sorted halves in this implementation.',
    implementationSpaceNote:
      'Lesson implementations may also copy the input so the original array is preserved. That preservation copy is separate implementation overhead; the merge procedure itself already needs O(n) auxiliary memory.',
    stable: true,
    inPlace: false,
    adaptive: false,
    adaptiveNote:
      'Not adaptive: this implementation still divides and merges even when the input is already sorted.',
    description:
      'Divide the array into halves, recursively sort each half, then merge the sorted halves into one ordered result.',
    mainApproach:
      'Divide the array into smaller halves, recursively sort them, then merge the sorted halves.',
    strengths: [
      'Predictable O(n log n) time in best, average, and worst cases for this implementation.',
      'Stable when equal values are taken from the left half first during merging.',
      'Reliable growth behavior on large inputs compared with O(n²) sorts.',
    ],
    tradeoffs: [
      'Uses additional O(n) memory for merging — not in-place in this course implementation.',
      'Not adaptive: sorted input does not skip the divide-and-merge work.',
      'Constant-factor overhead from allocating and copying into temporary arrays.',
    ],
    lessonHref: '/learn/merge-sort',
  },
  {
    slug: 'quick-sort',
    name: 'Quick Sort',
    category: 'Sorting',
    bestTime: 'O(n log n)',
    averageTime: 'O(n log n)',
    worstTime: 'O(n²)',
    space: 'O(log n)–O(n)',
    spaceDetail:
      'Algorithmic auxiliary space is mainly the recursion stack: about O(log n) on average, and up to O(n) in the worst case when partitions are unbalanced. Partitioning itself rearranges values in place.',
    implementationSpaceNote:
      'Lesson implementations copy the input before sorting so the original array is preserved. That copy adds O(n) implementation overhead on top of the recursion stack used by the sorting procedure.',
    stable: false,
    inPlace: true,
    adaptive: false,
    adaptiveNote:
      'Not adaptive in the sense used here: patterned inputs can still force unbalanced partitions with the demonstrated last-element pivot.',
    description:
      'Choose a pivot, partition the array around it, then recursively sort the partitions on each side of the pivot.',
    mainApproach:
      'Choose a pivot, partition the array around it, then recursively sort the resulting partitions.',
    strengths: [
      'Average-case O(n log n) with in-place partitioning (no O(n) merge buffer).',
      'Often practical when partitions stay reasonably balanced.',
      'Clear divide-and-conquer structure built around partitioning.',
    ],
    tradeoffs: [
      'Worst-case O(n²) for the last-element pivot strategy shown in this course (for example on sorted or reverse-sorted input).',
      'Not stable for the implementation used here.',
      'Recursion stack can grow to O(n) when partitions stay unbalanced.',
    ],
    lessonHref: '/learn/quick-sort',
  },
  {
    slug: 'heap-sort',
    name: 'Heap Sort',
    category: 'Sorting',
    bestTime: 'O(n log n)',
    averageTime: 'O(n log n)',
    worstTime: 'O(n log n)',
    space: 'O(1)',
    spaceDetail:
      'Algorithmic auxiliary space is O(1) for the in-place heap procedure, excluding the recursion stack if recursive heapify is used (about O(log n) stack depth).',
    implementationSpaceNote:
      'Lesson implementations copy the input before sorting so the original array is preserved. That copy adds O(n) implementation overhead; do not confuse it with the O(1) auxiliary space of the in-place heap procedure.',
    stable: false,
    inPlace: true,
    adaptive: false,
    adaptiveNote:
      'Not adaptive: heap construction and extractions still run even when the input is already sorted.',
    description:
      'Build a Max Heap, then repeatedly extract the largest value into the sorted suffix until the array is ordered.',
    mainApproach:
      'Heapify the array into a Max Heap, then repeatedly swap the root with the end of the heap and restore the heap property.',
    strengths: [
      'O(n log n) time in best, average, and worst cases for this implementation.',
      'In-place sorting procedure with O(1) auxiliary variables (aside from recursion stack if heapify is recursive).',
      'Predictable growth compared with Quick Sort’s O(n²) worst case for the demonstrated pivot strategy.',
    ],
    tradeoffs: [
      'Not stable — equal values may change relative order.',
      'Not adaptive on already-sorted input.',
      'Cache behavior and constant factors can differ from other O(n log n) sorts.',
    ],
    lessonHref: '/learn/heap-sort',
  },
]

export const sortingDecisionQuestions: SortingDecisionQuestion[] = [
  {
    question: 'Is the input very small?',
    guidance:
      'For small arrays, simple algorithms such as Insertion Sort can be practical because their overhead is low and their logic is easy to reason about. “Fastest asymptotic class” matters less when n is tiny.',
  },
  {
    question: 'Is the data already nearly sorted?',
    guidance:
      'For small or nearly sorted data, algorithms such as Insertion Sort can have useful properties. Adaptive behavior and best-case O(n) matter more when disorder is limited.',
  },
  {
    question: 'Is predictable worst-case time important?',
    guidance:
      'For predictable O(n log n) worst-case performance, Merge Sort and Heap Sort have different trade-offs — extra merge memory versus in-place heap maintenance and stability differences.',
  },
  {
    question: 'Is additional memory available?',
    guidance:
      'Merge Sort’s merge step uses additional O(n) memory in this course’s implementation. If auxiliary array storage is limited, in-place approaches such as Heap Sort or Quick Sort’s partitioning become more relevant — each with its own trade-offs.',
  },
  {
    question: 'Does stability matter?',
    guidance:
      'Stability preserves the relative order of equal values. Bubble Sort, Insertion Sort, and Merge Sort (with left-first merging) are stable here; Selection Sort, Quick Sort, and Heap Sort are not for the implementations used.',
  },
  {
    question: 'Is in-place sorting useful?',
    guidance:
      'In-place procedures rearrange the working array with little algorithmic auxiliary storage. That can matter on memory-constrained environments, but remember lesson wrappers may still copy the input for teaching.',
  },
  {
    question: 'Does the language already provide an optimized sort?',
    guidance:
      'Production code often uses a language’s built-in sort, which may combine hybrid strategies. Learning these six algorithms still helps you understand the trade-offs those library sorts are balancing.',
  },
]

/** Default pair used by the two-algorithm comparison section. */
export const defaultPairComparison: AlgorithmPairDifference = {
  leftSlug: 'merge-sort',
  rightSlug: 'quick-sort',
  points: [
    'Merge Sort has predictable O(n log n) worst-case time for this implementation.',
    'Quick Sort has O(n log n) average time but O(n²) worst case for the demonstrated pivot strategy.',
    'Merge Sort uses additional memory for merging.',
    'Quick Sort’s partitioning approach can use less auxiliary array storage.',
  ],
}

/**
 * Build “what changes between them?” notes for any selected pair.
 * Uses curated copy for Merge vs Quick; otherwise derives clear trade-off bullets.
 */
export function getPairDifferences(
  left: SortingAlgorithmComparison,
  right: SortingAlgorithmComparison,
): string[] {
  const isDefaultPair =
    (left.slug === defaultPairComparison.leftSlug &&
      right.slug === defaultPairComparison.rightSlug) ||
    (left.slug === defaultPairComparison.rightSlug &&
      right.slug === defaultPairComparison.leftSlug)

  if (isDefaultPair) {
    if (
      left.slug === defaultPairComparison.leftSlug &&
      right.slug === defaultPairComparison.rightSlug
    ) {
      return defaultPairComparison.points
    }

    return [
      'Quick Sort has O(n log n) average time but O(n²) worst case for the demonstrated pivot strategy.',
      'Merge Sort has predictable O(n log n) worst-case time for this implementation.',
      'Quick Sort’s partitioning approach can use less auxiliary array storage.',
      'Merge Sort uses additional memory for merging.',
    ]
  }

  const points: string[] = []

  if (left.worstTime !== right.worstTime) {
    points.push(
      `${left.name} has worst-case ${left.worstTime}, while ${right.name} has worst-case ${right.worstTime}.`,
    )
  } else if (left.averageTime !== right.averageTime) {
    points.push(
      `${left.name} averages ${left.averageTime}, while ${right.name} averages ${right.averageTime}.`,
    )
  }

  if (left.space !== right.space) {
    points.push(
      `${left.name} lists algorithmic space as ${left.space}; ${right.name} lists ${right.space}.`,
    )
  }

  if (left.stable !== right.stable) {
    points.push(
      left.stable
        ? `${left.name} is stable for the implementation used; ${right.name} is not.`
        : `${right.name} is stable for the implementation used; ${left.name} is not.`,
    )
  }

  if (left.inPlace !== right.inPlace) {
    points.push(
      left.inPlace
        ? `${left.name} is in-place for the procedure shown; ${right.name} is not.`
        : `${right.name} is in-place for the procedure shown; ${left.name} is not.`,
    )
  }

  if (left.adaptive !== right.adaptive) {
    points.push(
      left.adaptive
        ? `${left.name} is adaptive; ${right.name} is not for the implementations compared here.`
        : `${right.name} is adaptive; ${left.name} is not for the implementations compared here.`,
    )
  }

  points.push(
    `Approach differs: ${left.name} ${lowerFirst(left.mainApproach)} ${right.name} ${lowerFirst(right.mainApproach)}`,
  )

  return points.slice(0, 5)
}

function lowerFirst(value: string): string {
  if (!value) return value
  return value.charAt(0).toLowerCase() + value.slice(1)
}

export function getSortingComparisonBySlug(
  slug: string,
): SortingAlgorithmComparison | undefined {
  return sortingComparisonAlgorithms.find((algorithm) => algorithm.slug === slug)
}

export function getTimeForCase(
  algorithm: SortingAlgorithmComparison,
  complexityCase: ComplexityCase,
): ComplexityClass {
  switch (complexityCase) {
    case 'best':
      return algorithm.bestTime
    case 'average':
      return algorithm.averageTime
    case 'worst':
      return algorithm.worstTime
  }
}
