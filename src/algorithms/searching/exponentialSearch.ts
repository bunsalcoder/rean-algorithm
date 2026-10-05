import type { VisualizationStep } from '../../components/visualizations/types'
import { formatArray } from '../../components/visualizations/utils'

/** Default lesson array — boundary doubling is easy to see (n = 16). */
export const EXPONENTIAL_SEARCH_DEFAULT_ARRAY = [
  2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32,
] as const

export const EXPONENTIAL_SEARCH_ALT_ARRAY = [
  1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31,
] as const

export const EXPONENTIAL_SEARCH_DEFAULT_TARGET = 26
export const EXPONENTIAL_SEARCH_NOT_FOUND_TARGET = 15

export const EXPONENTIAL_SEARCH_ARRAY_PRESETS = [
  {
    id: 'lesson-default',
    label: 'Lesson array',
    values: EXPONENTIAL_SEARCH_DEFAULT_ARRAY,
  },
  {
    id: 'alt-sorted',
    label: 'Alternate sorted',
    values: EXPONENTIAL_SEARCH_ALT_ARRAY,
  },
] as const

function rangeIndices(start: number, endInclusive: number): number[] {
  if (endInclusive < start) {
    return []
  }
  const indices: number[] = []
  for (let i = start; i <= endInclusive; i += 1) {
    indices.push(i)
  }
  return indices
}

function eliminatedOutside(
  length: number,
  low: number,
  high: number,
): number[] {
  const indices: number[] = []
  for (let i = 0; i < length; i += 1) {
    if (i < low || i > high) {
      indices.push(i)
    }
  }
  return indices
}

/**
 * Educational Exponential Search used by the lesson code examples.
 * Requires a sorted ascending array. Does not mutate the input.
 */
export function exponentialSearch(
  arr: readonly number[],
  target: number,
): number {
  const n = arr.length

  if (n === 0) {
    return -1
  }

  if (arr[0] === target) {
    return 0
  }

  let bound = 1

  while (bound < n && arr[bound] < target) {
    bound *= 2
  }

  let low = Math.floor(bound / 2)
  let high = Math.min(bound, n - 1)

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)

    if (arr[mid] === target) {
      return mid
    }

    if (arr[mid] < target) {
      low = mid + 1
    } else {
      high = mid - 1
    }
  }

  return -1
}

/**
 * Builds a step-by-step VisualizationStep sequence for Exponential Search.
 * Pure data — no React state and no UI dependencies beyond the shared step type.
 *
 * Visual state mapping:
 * - Phase 1 (expanding): current / previous boundary → active + compared
 * - Candidate range after expand → highlighted
 * - Phase 2 (binary): low / high / mid → pointers
 * - Discarded sides → eliminated
 * - Found → found
 */
export function buildExponentialSearchSteps(
  input: readonly number[],
  target: number,
): VisualizationStep[] {
  const array = [...input]
  const steps: VisualizationStep[] = []
  const n = array.length

  if (n === 0) {
    steps.push({
      id: 'exp-empty',
      title: 'Empty array',
      explanation: `The array is empty, so there is nothing to search. Exponential Search returns -1 for target ${target}.`,
      detail: 'Result: -1 (not found) · Phase complete',
      array,
      meta: {
        target,
        result: -1,
        phase: 'complete',
        phaseLabel: 'Complete',
      },
    })
    return steps
  }

  steps.push({
    id: 'exp-start',
    title: 'Start Exponential Search',
    explanation: `We are looking for ${target} in the sorted array ${formatArray(array)}. Exponential Search does not start in the middle — it first grows a boundary exponentially, then runs Binary Search inside that range.`,
    detail:
      'Phase 1: Expanding Range · Sorted ascending data is required.',
    array,
    highlighted: [0],
    pointers: [{ index: 0, label: 'start' }],
    meta: {
      target,
      bound: 1,
      previousBound: 0,
      phase: 'initialize',
      phaseLabel: 'Expanding Range',
    },
  })

  if (array[0] === target) {
    steps.push({
      id: 'exp-found-first',
      title: `Found ${target} at index 0`,
      explanation: `arr[0] equals the target ${target}. Exponential Search returns 0 immediately — no range expansion or Binary Search is needed.`,
      detail: 'Result: index 0 · Best case O(1)',
      array,
      found: [0],
      pointers: [{ index: 0, label: 'found' }],
      meta: {
        target,
        result: 0,
        phase: 'found',
        phaseLabel: 'Found',
      },
    })
    return steps
  }

  let bound = 1
  let previousBound = 0
  let expandStep = 0

  while (bound < n && array[bound] < target) {
    expandStep += 1
    const boundValue = array[bound]

    steps.push({
      id: `exp-check-${expandStep}`,
      title: `Check index ${bound}`,
      explanation: `Compare arr[${bound}] = ${boundValue} with the target ${target}. ${boundValue} < ${target}, so the target cannot sit at or before this boundary — grow the range.`,
      detail: `Phase 1: Expanding Range · Boundary ${bound} is still too small`,
      array,
      highlighted: rangeIndices(previousBound, Math.min(bound, n - 1)),
      active: [bound],
      compared: [bound],
      eliminated:
        previousBound > 0 ? rangeIndices(0, previousBound - 1) : undefined,
      pointers: [
        ...(previousBound > 0
          ? [{ index: previousBound, label: 'prev' }]
          : []),
        { index: bound, label: 'bound' },
      ],
      meta: {
        target,
        bound,
        previousBound,
        currentIndex: bound,
        comparison: 'less',
        phase: 'check-boundary',
        phaseLabel: 'Expanding Range',
      },
    })

    const nextBound = bound * 2

    steps.push({
      id: `exp-expand-${expandStep}`,
      title: `Expand boundary to ${nextBound}`,
      explanation: `Double the boundary: ${bound} × 2 = ${nextBound}. The sequence of boundaries grows as 1, 2, 4, 8, 16… — not one index at a time.`,
      detail: `Phase 1: Expanding Range · ${bound} → ${nextBound}`,
      array,
      highlighted: rangeIndices(
        bound,
        Math.min(nextBound, n) - 1 >= bound
          ? Math.min(nextBound, n) - 1
          : bound,
      ),
      eliminated: rangeIndices(0, bound - 1),
      pointers: [
        { index: bound, label: 'prev' },
        {
          index: Math.min(nextBound, n - 1),
          label: nextBound < n ? 'bound' : 'end',
        },
      ],
      meta: {
        target,
        bound: nextBound,
        previousBound: bound,
        phase: 'expand',
        phaseLabel: 'Expanding Range',
      },
    })

    previousBound = bound
    bound = nextBound
  }

  const clampedHigh = Math.min(bound, n - 1)
  const rangeLow = Math.floor(bound / 2)
  const rangeHigh = clampedHigh

  if (bound < n) {
    const boundValue = array[bound]
    expandStep += 1

    steps.push({
      id: `exp-check-stop-${expandStep}`,
      title: `Check index ${bound}`,
      explanation: `Compare arr[${bound}] = ${boundValue} with the target ${target}. ${boundValue} >= ${target}, so this boundary is large enough — stop expanding.`,
      detail: `Phase 1: Expanding Range · Boundary found at index ${bound}`,
      array,
      highlighted: rangeIndices(previousBound, bound),
      active: [bound],
      compared: [bound],
      eliminated:
        previousBound > 0 ? rangeIndices(0, previousBound - 1) : undefined,
      pointers: [
        ...(previousBound > 0
          ? [{ index: previousBound, label: 'prev' }]
          : []),
        { index: bound, label: 'bound' },
      ],
      meta: {
        target,
        bound,
        previousBound,
        currentIndex: bound,
        comparison: boundValue === target ? 'equal' : 'greater',
        phase: 'check-boundary',
        phaseLabel: 'Expanding Range',
      },
    })
  } else {
    steps.push({
      id: 'exp-bound-end',
      title: 'Reached the end of the array',
      explanation: `The boundary ${bound} is past the last index (${n - 1}). Stop expanding and search the final candidate range with Binary Search.`,
      detail: 'Phase 1: Expanding Range · Boundary clamped to the array end',
      array,
      highlighted: rangeIndices(previousBound, n - 1),
      eliminated:
        previousBound > 0 ? rangeIndices(0, previousBound - 1) : undefined,
      pointers: [
        ...(previousBound > 0
          ? [{ index: previousBound, label: 'prev' }]
          : []),
        { index: n - 1, label: 'end' },
      ],
      meta: {
        target,
        bound,
        previousBound,
        phase: 'check-boundary',
        phaseLabel: 'Expanding Range',
      },
    })
  }

  steps.push({
    id: 'exp-boundary-found',
    title: `Candidate range: indices ${rangeLow}…${rangeHigh}`,
    explanation: `Set low = floor(${bound} / 2) = ${rangeLow} and high = min(${bound}, ${n - 1}) = ${rangeHigh}. Phase 1 is done — Binary Search will run only inside this range, not the whole array.`,
    detail: `Phase 1 → Phase 2 · Expanding Range → Binary Search · [${rangeLow} … ${rangeHigh}]`,
    array,
    highlighted: rangeIndices(rangeLow, rangeHigh),
    eliminated: eliminatedOutside(n, rangeLow, rangeHigh),
    pointers: [
      { index: rangeLow, label: 'low' },
      { index: rangeHigh, label: 'high' },
    ],
    meta: {
      target,
      bound,
      previousBound,
      low: rangeLow,
      high: rangeHigh,
      phase: 'boundary-found',
      phaseLabel: 'Expanding Range',
    },
  })

  let low = rangeLow
  let high = rangeHigh
  let binaryStep = 0

  steps.push({
    id: 'exp-binary-start',
    title: 'Start Binary Search in the range',
    explanation: `Phase 2 begins. Search for ${target} between indices ${low} and ${high} using the familiar low / high / mid Binary Search process.`,
    detail: 'Phase 2: Binary Search',
    array,
    highlighted: rangeIndices(low, high),
    eliminated: eliminatedOutside(n, low, high),
    pointers: [
      { index: low, label: 'low' },
      { index: high, label: 'high' },
    ],
    meta: {
      target,
      bound,
      low,
      high,
      phase: 'binary-search-start',
      phaseLabel: 'Binary Search',
    },
  })

  while (low <= high) {
    binaryStep += 1
    const mid = Math.floor((low + high) / 2)
    const midValue = array[mid]

    steps.push({
      id: `exp-binary-probe-${binaryStep}`,
      title: `Probe mid = ${mid}`,
      explanation: `Compute mid = floor((${low} + ${high}) / 2) = ${mid}. Look at arr[${mid}] = ${midValue}.`,
      detail: 'Phase 2: Binary Search · Probe the middle of the current range',
      array,
      highlighted: rangeIndices(low, high),
      active: [mid],
      eliminated: eliminatedOutside(n, low, high),
      pointers: [
        { index: low, label: 'low' },
        { index: high, label: 'high' },
        { index: mid, label: 'mid' },
      ],
      meta: {
        target,
        bound,
        low,
        high,
        mid,
        currentIndex: mid,
        phase: 'binary-probe',
        phaseLabel: 'Binary Search',
      },
    })

    steps.push({
      id: `exp-binary-compare-${binaryStep}`,
      title: `Compare ${midValue} with ${target}`,
      explanation: `Compare arr[${mid}] = ${midValue} with the target ${target}.`,
      detail: 'Phase 2: Binary Search · Decide equal, too small, or too large',
      array,
      highlighted: rangeIndices(low, high),
      active: [mid],
      compared: [mid],
      eliminated: eliminatedOutside(n, low, high),
      pointers: [
        { index: low, label: 'low' },
        { index: high, label: 'high' },
        { index: mid, label: 'mid' },
      ],
      meta: {
        target,
        bound,
        low,
        high,
        mid,
        currentIndex: mid,
        phase: 'binary-compare',
        phaseLabel: 'Binary Search',
      },
    })

    if (midValue === target) {
      steps.push({
        id: `exp-found-${mid}`,
        title: `Found ${target} at index ${mid}`,
        explanation: `arr[${mid}] equals the target ${target}. Exponential Search stops and returns index ${mid}.`,
        detail: `Result: index ${mid} · Binary Search → Found`,
        array,
        found: [mid],
        highlighted: rangeIndices(low, high).filter((index) => index !== mid),
        eliminated: eliminatedOutside(n, low, high),
        pointers: [{ index: mid, label: 'found' }],
        meta: {
          target,
          bound,
          low,
          high,
          mid,
          result: mid,
          phase: 'found',
          phaseLabel: 'Found',
        },
      })
      return steps
    }

    if (midValue < target) {
      const nextLow = mid + 1
      steps.push({
        id: `exp-binary-move-low-${binaryStep}`,
        title: `${midValue} < ${target} → raise low`,
        explanation: `The mid value is smaller than the target, so discard indices at or below ${mid}. Move low to ${nextLow}.`,
        detail:
          nextLow <= high
            ? `Phase 2: Binary Search · New range: indices ${nextLow}–${high}`
            : 'Phase 2: Binary Search · The new range is empty.',
        array,
        highlighted: rangeIndices(nextLow, high),
        eliminated: eliminatedOutside(n, nextLow, high),
        compared: [mid],
        pointers:
          nextLow <= high
            ? [
                { index: nextLow, label: 'low' },
                { index: high, label: 'high' },
              ]
            : undefined,
        meta: {
          target,
          bound,
          low: nextLow,
          high,
          mid,
          comparison: 'less',
          phase: 'binary-move-low',
          phaseLabel: 'Binary Search',
        },
      })
      low = nextLow
    } else {
      const nextHigh = mid - 1
      steps.push({
        id: `exp-binary-move-high-${binaryStep}`,
        title: `${midValue} > ${target} → lower high`,
        explanation: `The mid value is larger than the target, so discard indices at or above ${mid}. Move high to ${nextHigh}.`,
        detail:
          low <= nextHigh
            ? `Phase 2: Binary Search · New range: indices ${low}–${nextHigh}`
            : 'Phase 2: Binary Search · The new range is empty.',
        array,
        highlighted: rangeIndices(low, nextHigh),
        eliminated: eliminatedOutside(n, low, nextHigh),
        compared: [mid],
        pointers:
          low <= nextHigh
            ? [
                { index: low, label: 'low' },
                { index: nextHigh, label: 'high' },
              ]
            : undefined,
        meta: {
          target,
          bound,
          low,
          high: nextHigh,
          mid,
          comparison: 'greater',
          phase: 'binary-move-high',
          phaseLabel: 'Binary Search',
        },
      })
      high = nextHigh
    }
  }

  steps.push({
    id: 'exp-not-found',
    title: `Target ${target} was not found`,
    explanation: `Binary Search finished the candidate range without finding ${target}. Exponential Search returns -1.`,
    detail: 'Result: -1 (not found)',
    array,
    highlighted: rangeLow <= rangeHigh ? rangeIndices(rangeLow, rangeHigh) : undefined,
    eliminated:
      rangeLow <= rangeHigh
        ? eliminatedOutside(n, rangeLow, rangeHigh)
        : array.map((_, index) => index),
    meta: {
      target,
      bound,
      low,
      high,
      result: -1,
      phase: 'not-found',
      phaseLabel: 'Not found',
    },
  })

  return steps
}
