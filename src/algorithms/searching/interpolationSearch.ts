import type { VisualizationStep } from '../../components/visualizations/types'
import { formatArray } from '../../components/visualizations/utils'

/** Default lesson array — uniform spacing makes the first estimate easy to see. */
export const INTERPOLATION_SEARCH_DEFAULT_ARRAY = [
  10, 20, 30, 40, 50, 60, 70, 80, 90, 100,
] as const

export const INTERPOLATION_SEARCH_ALT_ARRAY = [
  5, 15, 25, 35, 45, 55, 65, 75, 85, 95,
] as const

export const INTERPOLATION_SEARCH_DEFAULT_TARGET = 70
export const INTERPOLATION_SEARCH_NOT_FOUND_TARGET = 35

export const INTERPOLATION_SEARCH_ARRAY_PRESETS = [
  {
    id: 'lesson-default',
    label: 'Lesson array',
    values: INTERPOLATION_SEARCH_DEFAULT_ARRAY,
  },
  {
    id: 'alt-sorted',
    label: 'Alternate sorted',
    values: INTERPOLATION_SEARCH_ALT_ARRAY,
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

function estimatePosition(
  array: readonly number[],
  target: number,
  low: number,
  high: number,
): number {
  return Math.floor(
    low +
      ((target - array[low]) * (high - low)) / (array[high] - array[low]),
  )
}

function estimateReason(
  array: readonly number[],
  low: number,
  high: number,
  pos: number,
): string {
  const mid = low + Math.floor((high - low) / 2)
  if (pos > mid) {
    return `Estimate position ${pos} because the target is closer to the upper end of the current value range.`
  }
  if (pos < mid) {
    return `Estimate position ${pos} because the target is closer to the lower end of the current value range.`
  }
  return `Estimate position ${pos} — the interpolation lands near the middle of indices ${low}–${high} for this value range (${array[low]}–${array[high]}).`
}

/**
 * Educational Interpolation Search used by the lesson code examples.
 * Requires a sorted ascending numeric array. Does not mutate the input.
 * The equal-boundary guard prevents division by zero.
 */
export function interpolationSearch(
  arr: readonly number[],
  target: number,
): number {
  let low = 0
  let high = arr.length - 1

  while (low <= high && target >= arr[low] && target <= arr[high]) {
    if (arr[low] === arr[high]) {
      return arr[low] === target ? low : -1
    }

    const pos = estimatePosition(arr, target, low, high)

    if (arr[pos] === target) {
      return pos
    }

    if (arr[pos] < target) {
      low = pos + 1
    } else {
      high = pos - 1
    }
  }

  return -1
}

/**
 * Builds a step-by-step VisualizationStep sequence for Interpolation Search.
 * Pure data — no React state and no UI dependencies beyond the shared step type.
 *
 * Visual state mapping:
 * - Active search range → highlighted
 * - Estimated / probed index → active + compared
 * - low / high / pos → pointers
 * - Discarded sides → eliminated
 * - Found → found
 */
export function buildInterpolationSearchSteps(
  input: readonly number[],
  target: number,
): VisualizationStep[] {
  const array = [...input]
  const steps: VisualizationStep[] = []
  const n = array.length

  if (n === 0) {
    steps.push({
      id: 'interp-empty',
      title: 'Empty array',
      explanation: `The array is empty, so there is nothing to search. Interpolation Search returns -1 for target ${target}.`,
      detail: 'Result: -1 (not found)',
      array,
      meta: { target, result: -1, phase: 'complete' },
    })
    return steps
  }

  let low = 0
  let high = n - 1
  let probe = 0

  steps.push({
    id: 'interp-start',
    title: 'Start Interpolation Search',
    explanation: `We are looking for ${target} in the sorted array ${formatArray(array)}. Set low = 0 and high = ${high}. Unlike Binary Search, the next probe is estimated from the values — not fixed at the middle.`,
    detail:
      'Interpolation Search requires sorted numeric data and works best when values are roughly evenly spaced.',
    array,
    highlighted: rangeIndices(low, high),
    pointers: [
      { index: low, label: 'low' },
      { index: high, label: 'high' },
    ],
    meta: { target, low, high, phase: 'initialize' },
  })

  while (low <= high && target >= array[low] && target <= array[high]) {
    if (array[low] === array[high]) {
      if (array[low] === target) {
        steps.push({
          id: `interp-equal-found-${low}`,
          title: `All remaining values equal ${target}`,
          explanation: `low and high both point at value ${array[low]}. The range has collapsed to equal values that match the target, so return index ${low}.`,
          detail: `Result: index ${low}`,
          array,
          found: [low],
          eliminated: eliminatedOutside(n, low, high),
          pointers: [{ index: low, label: 'found' }],
          meta: {
            target,
            low,
            high,
            result: low,
            phase: 'found',
          },
        })
        return steps
      }

      steps.push({
        id: 'interp-equal-miss',
        title: `Equal values — target ${target} not here`,
        explanation: `Every remaining value is ${array[low]}, which is not ${target}. Stop to avoid dividing by zero (arr[high] − arr[low] would be 0). Return -1.`,
        detail: 'Result: -1 (not found)',
        array,
        highlighted: rangeIndices(low, high),
        eliminated: eliminatedOutside(n, low, high),
        compared: [low],
        active: [low],
        pointers: [
          { index: low, label: 'low' },
          { index: high, label: 'high' },
        ],
        meta: {
          target,
          low,
          high,
          result: -1,
          phase: 'not-found',
        },
      })
      return steps
    }

    probe += 1
    const pos = estimatePosition(array, target, low, high)
    const lowValue = array[low]
    const highValue = array[high]
    const formulaDetail = `pos = ${low} + ((${target} − ${lowValue}) × (${high} − ${low})) / (${highValue} − ${lowValue}) = ${pos}`

    steps.push({
      id: `interp-estimate-${probe}`,
      title: `Estimate position ${pos}`,
      explanation: estimateReason(array, low, high, pos),
      detail: formulaDetail,
      array,
      highlighted: rangeIndices(low, high),
      active: [pos],
      eliminated: eliminatedOutside(n, low, high),
      pointers: [
        { index: low, label: 'low' },
        { index: high, label: 'high' },
        { index: pos, label: 'pos' },
      ],
      meta: {
        target,
        low,
        high,
        pos,
        phase: 'estimate',
      },
    })

    const posValue = array[pos]

    steps.push({
      id: `interp-probe-${probe}`,
      title: `Probe index ${pos}`,
      explanation: `Compare arr[${pos}] = ${posValue} with the target ${target}.`,
      detail: `Current probe value: ${posValue}`,
      array,
      highlighted: rangeIndices(low, high),
      active: [pos],
      compared: [pos],
      eliminated: eliminatedOutside(n, low, high),
      pointers: [
        { index: low, label: 'low' },
        { index: high, label: 'high' },
        { index: pos, label: 'pos' },
      ],
      meta: {
        target,
        low,
        high,
        pos,
        posValue,
        phase: 'probe',
      },
    })

    if (posValue === target) {
      steps.push({
        id: `interp-found-${pos}`,
        title: `Found ${target} at index ${pos}`,
        explanation: `arr[${pos}] equals the target ${target}. Interpolation Search stops and returns index ${pos}.`,
        detail: `Result: index ${pos}`,
        array,
        found: [pos],
        highlighted: rangeIndices(low, high).filter((index) => index !== pos),
        eliminated: eliminatedOutside(n, low, high),
        pointers: [{ index: pos, label: 'found' }],
        meta: {
          target,
          low,
          high,
          pos,
          result: pos,
          phase: 'found',
        },
      })
      return steps
    }

    if (posValue < target) {
      const nextLow = pos + 1
      steps.push({
        id: `interp-move-low-${probe}`,
        title: `${posValue} < ${target} → raise low`,
        explanation: `The probe ${posValue} is smaller than the target, so discard indices at or below ${pos}. Move low to ${nextLow}.`,
        detail:
          nextLow <= high
            ? `New range: indices ${nextLow} through ${high}`
            : 'The new range is empty — nothing left to search.',
        array,
        highlighted: rangeIndices(nextLow, high),
        eliminated: eliminatedOutside(n, nextLow, high),
        compared: [pos],
        pointers:
          nextLow <= high
            ? [
                { index: nextLow, label: 'low' },
                { index: high, label: 'high' },
              ]
            : undefined,
        meta: {
          target,
          low: nextLow,
          high,
          pos,
          phase: 'move-low',
        },
      })
      low = nextLow
    } else {
      const nextHigh = pos - 1
      steps.push({
        id: `interp-move-high-${probe}`,
        title: `${posValue} > ${target} → lower high`,
        explanation: `The probe ${posValue} is larger than the target, so discard indices at or above ${pos}. Move high to ${nextHigh}.`,
        detail:
          low <= nextHigh
            ? `New range: indices ${low} through ${nextHigh}`
            : 'The new range is empty — nothing left to search.',
        array,
        highlighted: rangeIndices(low, nextHigh),
        eliminated: eliminatedOutside(n, low, nextHigh),
        compared: [pos],
        pointers:
          low <= nextHigh
            ? [
                { index: low, label: 'low' },
                { index: nextHigh, label: 'high' },
              ]
            : undefined,
        meta: {
          target,
          low,
          high: nextHigh,
          pos,
          phase: 'move-high',
        },
      })
      high = nextHigh
    }
  }

  let outOfRangeReason: string
  if (low > high) {
    outOfRangeReason = `The search range became empty (low = ${low}, high = ${high}). Target ${target} is not in the array.`
  } else if (target < array[low]) {
    outOfRangeReason = `Target ${target} is smaller than arr[low] = ${array[low]}, so it cannot appear in the remaining range.`
  } else {
    outOfRangeReason = `Target ${target} is larger than arr[high] = ${array[high]}, so it cannot appear in the remaining range.`
  }

  steps.push({
    id: 'interp-not-found',
    title: `Target ${target} was not found`,
    explanation: outOfRangeReason,
    detail: 'Result: -1 (not found)',
    array,
    highlighted: low <= high ? rangeIndices(low, high) : undefined,
    eliminated:
      low <= high
        ? eliminatedOutside(n, low, high)
        : array.map((_, index) => index),
    meta: {
      target,
      low,
      high,
      result: -1,
      phase: 'not-found',
    },
  })

  return steps
}
