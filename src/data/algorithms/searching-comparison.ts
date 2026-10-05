export type SearchingComplexityCase = 'best' | 'average' | 'worst'

/** Conceptual growth classes used by the complexity chart (not runtime ms). */
export type SearchingComplexityClass =
  | 'O(1)'
  | 'O(log log n)'
  | 'O(log n)'
  | 'O(√n)'
  | 'O(n)'

export type SearchingAlgorithmComparison = {
  id: string
  name: string
  slug: string
  category: string
  best: string
  average: string
  worst: string
  space: string
  sortedRequired: boolean
  numericRequired: boolean
  strategy: string
  keyIdea: string
  strengths: string[]
  limitations: string[]
  lessonHref: string
  /** Short label used on strategy cards. */
  strategyLabel: string
  /** One-line complexity summary for strategy cards. */
  complexitySummary: string
  /** Requirement line for strategy cards. */
  requirementSummary: string
  /** Neutral “better fit when…” guidance for pair comparison. */
  betterFitWhen: string
  mainStrength: string
  mainLimitation: string
  /** Why numeric data is or is not fundamental for this algorithm. */
  numericRequirementNote: string
  /** Optional clarification under the Average column (e.g. Interpolation). */
  averageNote?: string
  /** Optional space clarification (e.g. iterative Binary Search). */
  spaceNote?: string
  /** Chart class for best / average / worst (conceptual ranks). */
  bestClass: SearchingComplexityClass
  averageClass: SearchingComplexityClass
  worstClass: SearchingComplexityClass
}

export type SearchingDecisionCard = {
  id: string
  condition: string
  guidance: string
}

export type SearchingMisconception = {
  id: string
  claim: string
  correction: string
}

export type SearchingComplexityExplainer = {
  id: string
  label: string
  explanation: string
}

export type SearchingLearningOrderItem = {
  id: string
  slug: string
  name: string
  reason: string
  lessonHref: string
}

export type SearchingPairDifference = {
  leftSlug: string
  rightSlug: string
  points: string[]
}

/** Conceptual growth order used by the complexity chart (not runtime ms). */
export const searchingComplexityClassRank: Record<
  SearchingComplexityClass,
  number
> = {
  'O(1)': 1,
  'O(log log n)': 2,
  'O(log n)': 3,
  'O(√n)': 4,
  'O(n)': 5,
}

export const searchingComplexityCaseLabels: Record<
  SearchingComplexityCase,
  string
> = {
  best: 'Best Case',
  average: 'Average Case',
  worst: 'Worst Case',
}

/** Shared demo input for the interactive comparison visualizer. */
export const SEARCHING_COMPARISON_DEMO_ARRAY = [
  10, 20, 30, 40, 50, 60, 70, 80, 90, 100,
] as const

export const SEARCHING_COMPARISON_DEMO_TARGET = 70

export const searchingComparisonAlgorithms: SearchingAlgorithmComparison[] = [
  {
    id: 'linear-search',
    name: 'Linear Search',
    slug: 'linear-search',
    category: 'Searching',
    best: 'O(1)',
    average: 'O(n)',
    worst: 'O(n)',
    space: 'O(1)',
    sortedRequired: false,
    numericRequired: false,
    strategy: 'Check elements one by one from the start until the target is found or the array ends.',
    keyIdea: 'Sequential scan through the collection.',
    strategyLabel: 'Sequential scan',
    complexitySummary: 'Best O(1) · Average/Worst O(n) · Space O(1)',
    requirementSummary: 'Works on unsorted data · Any comparable values',
    betterFitWhen:
      'the data is unsorted, the collection is small, or you want the simplest approach.',
    mainStrength: 'Works on unsorted data and is very simple to reason about.',
    mainLimitation: 'May need to inspect many elements as the input grows.',
    numericRequirementNote:
      'Numeric values are not required — Linear Search only needs equality comparisons, so many data types work.',
    strengths: [
      'Works on unsorted data.',
      'Very simple to understand and implement.',
      'Works with many data types that support equality checks.',
    ],
    limitations: [
      'Can require checking many elements.',
      'Average and worst-case time grow linearly with input size.',
    ],
    lessonHref: '/learn/linear-search',
    bestClass: 'O(1)',
    averageClass: 'O(n)',
    worstClass: 'O(n)',
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    slug: 'binary-search',
    category: 'Searching',
    best: 'O(1)',
    average: 'O(log n)',
    worst: 'O(log n)',
    space: 'O(1)',
    spaceNote:
      'Space is O(1) for the iterative implementation used in this course.',
    sortedRequired: true,
    numericRequired: false,
    strategy:
      'Repeatedly divide a sorted search range in half by comparing the middle value with the target.',
    keyIdea: 'Repeated halving of the remaining search range.',
    strategyLabel: 'Repeated halving',
    complexitySummary: 'Best O(1) · Average/Worst O(log n) · Space O(1)',
    requirementSummary: 'Requires sorted data · Ordered keys (not only numbers)',
    betterFitWhen:
      'the data is already sorted and you want a reliable general-purpose logarithmic search.',
    mainStrength: 'Predictable O(log n) worst-case behavior on sorted data.',
    mainLimitation: 'Requires sorted (ordered) data before it can be used.',
    numericRequirementNote:
      'Numeric values are not a fundamental requirement — Binary Search needs an ordered universe so it can decide left vs right, which can include sorted strings or other comparable keys.',
    strengths: [
      'O(log n) worst-case time for the iterative procedure shown here.',
      'Simple and reliable for sorted data.',
      'Works with ordered non-numeric keys when a total order is available.',
    ],
    limitations: [
      'Requires sorted data.',
      'Sorting first has its own cost if the collection is not already ordered.',
    ],
    lessonHref: '/learn/binary-search',
    bestClass: 'O(1)',
    averageClass: 'O(log n)',
    worstClass: 'O(log n)',
  },
  {
    id: 'jump-search',
    name: 'Jump Search',
    slug: 'jump-search',
    category: 'Searching',
    best: 'O(1)',
    average: 'O(√n)',
    worst: 'O(√n)',
    space: 'O(1)',
    sortedRequired: true,
    numericRequired: false,
    strategy:
      'Jump through fixed-size blocks on sorted data, then scan the relevant block linearly.',
    keyIdea: 'Block jumping followed by a local linear scan.',
    strategyLabel: 'Block jumping + linear scan',
    complexitySummary: 'Best O(1) · Average/Worst O(√n) · Space O(1)',
    requirementSummary: 'Requires sorted data · Ordered keys (not only numbers)',
    betterFitWhen:
      'the data is sorted and a block-based alternative to full sequential scanning is useful.',
    mainStrength: 'Uses blocks to skip ahead instead of checking every element up front.',
    mainLimitation:
      'Requires sorted data and usually stays O(√n) in the worst case.',
    numericRequirementNote:
      'Numeric values are not a fundamental requirement — Jump Search relies on sorted order to skip blocks safely, not on arithmetic with the values themselves.',
    strengths: [
      'Uses blocks to skip ahead on sorted arrays.',
      'Simple alternative to scanning every element from the start.',
      'Works with ordered non-numeric keys when comparisons define order.',
    ],
    limitations: [
      'Requires sorted data.',
      'Usually does not improve asymptotic worst-case complexity beyond O(√n).',
      'Still finishes with a linear scan inside the chosen block.',
    ],
    lessonHref: '/learn/jump-search',
    bestClass: 'O(1)',
    averageClass: 'O(√n)',
    worstClass: 'O(√n)',
  },
  {
    id: 'interpolation-search',
    name: 'Interpolation Search',
    slug: 'interpolation-search',
    category: 'Searching',
    best: 'O(1)',
    average: 'O(log log n)*',
    averageNote:
      'Typical/average O(log log n) under suitable distribution assumptions — not a universal guarantee. Worst case is O(n).',
    worst: 'O(n)',
    space: 'O(1)',
    sortedRequired: true,
    numericRequired: true,
    strategy:
      'Estimate where the target should be based on its value relative to the current low and high ends.',
    keyIdea: 'Value-based position estimation on sorted numeric data.',
    strategyLabel: 'Value-based estimation',
    complexitySummary:
      'Best O(1) · Typical O(log log n)* · Worst O(n) · Space O(1)',
    requirementSummary: 'Requires sorted numeric data · Distribution matters',
    betterFitWhen:
      'the data is sorted, numeric, and roughly uniformly distributed so value-based estimates can help.',
    mainStrength:
      'Can be very efficient on suitable uniformly distributed numeric data.',
    mainLimitation:
      'Requires sorted numeric data, and performance depends on distribution — worst case is O(n).',
    numericRequirementNote:
      'Numeric values are important because the algorithm estimates position from values.',
    strengths: [
      'Can be very efficient on suitable uniformly distributed numeric data.',
      'Estimates a likely position instead of always probing the middle.',
    ],
    limitations: [
      'Requires sorted numeric data.',
      'Performance depends on distribution.',
      'Worst case is O(n).',
    ],
    lessonHref: '/learn/interpolation-search',
    bestClass: 'O(1)',
    averageClass: 'O(log log n)',
    worstClass: 'O(n)',
  },
  {
    id: 'exponential-search',
    name: 'Exponential Search',
    slug: 'exponential-search',
    category: 'Searching',
    best: 'O(1)',
    average: 'O(log n)',
    worst: 'O(log n)',
    space: 'O(1)',
    sortedRequired: true,
    numericRequired: false,
    strategy:
      'Expand the search boundary exponentially until it passes the target, then use Binary Search inside that range.',
    keyIdea: 'Exponential range expansion followed by Binary Search.',
    strategyLabel: 'Exponential range expansion + binary search',
    complexitySummary: 'Best O(1) · Average/Worst O(log n) · Space O(1)',
    requirementSummary: 'Requires sorted data · Ordered keys (not only numbers)',
    betterFitWhen:
      'the searchable range is not known in advance, or the target may be near the beginning of a large sorted sequence.',
    mainStrength:
      'Quickly discovers a useful search range before finishing with Binary Search.',
    mainLimitation:
      'Requires sorted data and remains O(log n) overall — more complex than direct Binary Search when boundaries are already known.',
    numericRequirementNote:
      'Numeric values are not a fundamental requirement — Exponential Search needs order to grow a safe bound, then Binary Search inside it.',
    strengths: [
      'Quickly discovers a search range.',
      'Useful when the full range is not known in advance.',
      'Can help when the target may be near the beginning of a large sorted sequence.',
    ],
    limitations: [
      'Requires sorted data.',
      'Still O(log n) overall.',
      'More complex than direct Binary Search when boundaries are already known.',
    ],
    lessonHref: '/learn/exponential-search',
    bestClass: 'O(1)',
    averageClass: 'O(log n)',
    worstClass: 'O(log n)',
  },
]

export const searchingDecisionCards: SearchingDecisionCard[] = [
  {
    id: 'unsorted',
    condition: 'If the data is unsorted',
    guidance:
      'Linear Search may be appropriate — it does not require preprocessing or ordered input.',
  },
  {
    id: 'sorted-general',
    condition: 'If the data is sorted',
    guidance:
      'Binary Search can be a good general-purpose option for ordered collections.',
  },
  {
    id: 'sorted-blocks',
    condition: 'If the data is sorted and you want block-based searching',
    guidance:
      'Jump Search may be useful as a block-jumping alternative to scanning from the start.',
  },
  {
    id: 'sorted-uniform',
    condition:
      'If the data is sorted, numeric, and roughly uniformly distributed',
    guidance:
      'Interpolation Search may be useful when value-based position estimates can help.',
  },
  {
    id: 'unknown-range',
    condition:
      'If the searchable range is not known or the target may be near the beginning',
    guidance:
      'Exponential Search may be useful for discovering a range before Binary Search.',
  },
]

export const searchingMisconceptions: SearchingMisconception[] = [
  {
    id: 'binary-any-array',
    claim: 'Binary Search works on any array.',
    correction:
      'It requires ordered/sorted data so each comparison can safely discard half of the remaining range.',
  },
  {
    id: 'interpolation-always-faster',
    claim: 'Interpolation Search is always faster than Binary Search.',
    correction:
      'Its strong performance depends on the data distribution. Under poor conditions it can degrade to O(n).',
  },
  {
    id: 'exponential-log-log',
    claim: 'Exponential Search is O(log log n).',
    correction:
      'Its overall worst-case complexity is O(log n). O(log log n) is associated with Interpolation Search under suitable distribution assumptions — not Exponential Search.',
  },
  {
    id: 'jump-few-checks',
    claim: 'Jump Search checks only a few elements.',
    correction:
      'It jumps between blocks and then performs a linear scan within a block, so the number of checks depends on both phases.',
  },
  {
    id: 'linear-useless',
    claim: 'Linear Search is useless.',
    correction:
      'It is simple and works even when data is unsorted — a practical choice for small inputs or one-off searches.',
  },
]

export const searchingComplexityExplainers: SearchingComplexityExplainer[] = [
  {
    id: 'o1',
    label: 'O(1)',
    explanation:
      'Constant-time best case — for example, finding the target on the first probe.',
  },
  {
    id: 'ologn',
    label: 'O(log n)',
    explanation:
      'The search space shrinks rapidly. Binary Search and Exponential Search stay in this class in the worst case for the procedures shown here.',
  },
  {
    id: 'osqrt',
    label: 'O(√n)',
    explanation:
      'Jump Search uses blocks whose size is typically around √n, then scans inside one block.',
  },
  {
    id: 'on',
    label: 'O(n)',
    explanation:
      'The algorithm may inspect many elements — Linear Search’s average/worst case, or Interpolation Search’s worst case.',
  },
  {
    id: 'ologlogn',
    label: 'O(log log n)',
    explanation:
      'Possible for Interpolation Search under suitable distribution assumptions. It is not guaranteed for every dataset.',
  },
]

export const searchingComparisonLearningOrder: SearchingLearningOrderItem[] = [
  {
    id: 'linear-search',
    slug: 'linear-search',
    name: 'Linear Search',
    reason: 'Establishes the basic idea of searching by checking elements one by one.',
    lessonHref: '/learn/linear-search',
  },
  {
    id: 'binary-search',
    slug: 'binary-search',
    name: 'Binary Search',
    reason: 'Introduces divide-and-conquer searching on sorted data.',
    lessonHref: '/learn/binary-search',
  },
  {
    id: 'jump-search',
    slug: 'jump-search',
    name: 'Jump Search',
    reason: 'Introduces block-based searching between sequential and binary ideas.',
    lessonHref: '/learn/jump-search',
  },
  {
    id: 'interpolation-search',
    slug: 'interpolation-search',
    name: 'Interpolation Search',
    reason: 'Introduces value-based estimation on sorted numeric data.',
    lessonHref: '/learn/interpolation-search',
  },
  {
    id: 'exponential-search',
    slug: 'exponential-search',
    name: 'Exponential Search',
    reason:
      'Introduces range discovery followed by Binary Search inside the discovered window.',
    lessonHref: '/learn/exponential-search',
  },
]

/** Default pair used by the two-algorithm comparison section. */
export const defaultSearchingPairComparison: SearchingPairDifference = {
  leftSlug: 'binary-search',
  rightSlug: 'interpolation-search',
  points: [
    'Binary Search repeatedly probes the middle of the current range and does not rely on value spacing.',
    'Interpolation Search estimates a likely index from the target’s value relative to the low and high ends.',
    'Binary Search needs sorted ordered data; Interpolation Search needs sorted numeric data.',
    'Binary Search has O(log n) worst-case time; Interpolation Search can be faster under suitable distributions but has O(n) worst case.',
    'Consider Binary Search as a reliable general option; consider Interpolation Search when values are roughly uniformly distributed.',
  ],
}

/**
 * Build “what changes between them?” notes for any selected pair.
 * Uses curated copy for Binary vs Interpolation; otherwise derives clear trade-off bullets.
 */
export function getSearchingPairDifferences(
  left: SearchingAlgorithmComparison,
  right: SearchingAlgorithmComparison,
): string[] {
  const isDefaultPair =
    (left.slug === defaultSearchingPairComparison.leftSlug &&
      right.slug === defaultSearchingPairComparison.rightSlug) ||
    (left.slug === defaultSearchingPairComparison.rightSlug &&
      right.slug === defaultSearchingPairComparison.leftSlug)

  if (isDefaultPair) {
    if (
      left.slug === defaultSearchingPairComparison.leftSlug &&
      right.slug === defaultSearchingPairComparison.rightSlug
    ) {
      return defaultSearchingPairComparison.points
    }

    return [
      'Interpolation Search estimates a likely index from the target’s value relative to the low and high ends.',
      'Binary Search repeatedly probes the middle of the current range and does not rely on value spacing.',
      'Interpolation Search needs sorted numeric data; Binary Search needs sorted ordered data.',
      'Interpolation Search can be faster under suitable distributions but has O(n) worst case; Binary Search has O(log n) worst-case time.',
      'Consider Interpolation Search when values are roughly uniformly distributed; consider Binary Search as a reliable general option.',
    ]
  }

  const points: string[] = []

  if (left.worst !== right.worst) {
    points.push(
      `${left.name} has worst-case ${left.worst}, while ${right.name} has worst-case ${right.worst}.`,
    )
  } else if (left.average !== right.average) {
    points.push(
      `${left.name} lists average ${left.average}, while ${right.name} lists ${right.average}.`,
    )
  }

  if (left.sortedRequired !== right.sortedRequired) {
    points.push(
      left.sortedRequired
        ? `${left.name} requires sorted data; ${right.name} does not.`
        : `${right.name} requires sorted data; ${left.name} does not.`,
    )
  }

  if (left.numericRequired !== right.numericRequired) {
    points.push(
      left.numericRequired
        ? `${left.name} expects numeric values for position estimates; ${right.name} does not fundamentally require numbers.`
        : `${right.name} expects numeric values for position estimates; ${left.name} does not fundamentally require numbers.`,
    )
  }

  if (left.space !== right.space) {
    points.push(
      `${left.name} lists space as ${left.space}; ${right.name} lists ${right.space}.`,
    )
  }

  points.push(
    `Better fit when… ${left.name}: ${left.betterFitWhen} ${right.name}: ${right.betterFitWhen}`,
  )

  points.push(
    `Strategy differs: ${left.name} — ${left.strategyLabel}. ${right.name} — ${right.strategyLabel}.`,
  )

  return points.slice(0, 5)
}

export function getSearchingComparisonBySlug(
  slug: string,
): SearchingAlgorithmComparison | undefined {
  return searchingComparisonAlgorithms.find(
    (algorithm) => algorithm.slug === slug,
  )
}

export function getSearchingTimeForCase(
  algorithm: SearchingAlgorithmComparison,
  complexityCase: SearchingComplexityCase,
): SearchingComplexityClass {
  switch (complexityCase) {
    case 'best':
      return algorithm.bestClass
    case 'average':
      return algorithm.averageClass
    case 'worst':
      return algorithm.worstClass
  }
}

export function getSearchingDisplayTimeForCase(
  algorithm: SearchingAlgorithmComparison,
  complexityCase: SearchingComplexityCase,
): string {
  switch (complexityCase) {
    case 'best':
      return algorithm.best
    case 'average':
      return algorithm.average
    case 'worst':
      return algorithm.worst
  }
}
