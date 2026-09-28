import type { VisualizationStep } from '../components/visualizations/types'

export const BINARY_SEARCH_DEFAULT_ARRAY = [
  3, 7, 12, 18, 24, 31, 42, 56, 68,
] as const

export const BINARY_SEARCH_ALT_ARRAY = [
  1, 4, 9, 15, 22, 33, 41, 50, 60, 75,
] as const

export const BINARY_SEARCH_DEFAULT_TARGET = 42
export const BINARY_SEARCH_NOT_FOUND_TARGET = 50

export const BINARY_SEARCH_ARRAY_PRESETS = [
  {
    id: 'lesson-default',
    label: 'Lesson array',
    values: BINARY_SEARCH_DEFAULT_ARRAY,
  },
  {
    id: 'alt-sorted',
    label: 'Alternate sorted',
    values: BINARY_SEARCH_ALT_ARRAY,
  },
] as const

function formatArray(values: readonly number[]): string {
  return `[${values.join(', ')}]`
}

/**
 * Educational iterative binary search used by the lesson code examples.
 * Prefer readability over micro-optimizations.
 */
export function binarySearch(
  array: readonly number[],
  target: number,
): number {
  let left = 0
  let right = array.length - 1

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2)

    if (array[mid] === target) {
      return mid
    }

    if (array[mid] < target) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }

  return -1
}

function rangeIndices(left: number, right: number): number[] {
  if (left > right) {
    return []
  }
  const indices: number[] = []
  for (let i = left; i <= right; i += 1) {
    indices.push(i)
  }
  return indices
}

function eliminatedIndices(
  length: number,
  left: number,
  right: number,
): number[] {
  const indices: number[] = []
  for (let i = 0; i < length; i += 1) {
    if (i < left || i > right) {
      indices.push(i)
    }
  }
  return indices
}

function buildPointers(
  left: number,
  right: number,
  mid: number | null,
): VisualizationStep['pointers'] {
  if (left > right) {
    return undefined
  }

  const pointers: Array<{ index: number; label: string }> = [
    { index: left, label: 'left' },
    { index: right, label: 'right' },
  ]

  if (mid !== null) {
    pointers.push({ index: mid, label: 'mid' })
  }

  return pointers
}

/**
 * Builds a step-by-step VisualizationStep sequence for Binary Search.
 * Pure data — no React state and no UI dependencies beyond the shared step type.
 *
 * Visual state mapping:
 * - Active search range → highlighted
 * - Middle element → active
 * - Eliminated elements → eliminated
 * - Found → found
 */
export function buildBinarySearchSteps(
  input: readonly number[],
  target: number,
): VisualizationStep[] {
  const array = [...input]
  const steps: VisualizationStep[] = []
  const n = array.length

  if (n === 0) {
    steps.push({
      id: 'binary-empty',
      title: 'Empty array',
      explanation: `The array is empty, so there is nothing to search. Binary Search returns -1 for target ${target}.`,
      detail: 'Result: -1 (not found)',
      array,
      meta: { target, result: -1 },
    })
    return steps
  }

  let left = 0
  let right = n - 1

  steps.push({
    id: 'binary-start',
    title: 'Start Binary Search',
    explanation: `We are looking for ${target} in the sorted array ${formatArray(array)}. Set left to 0 and right to ${right}. The search range is the whole array.`,
    detail: 'Binary Search requires the array to be sorted in ascending order.',
    array,
    highlighted: rangeIndices(left, right),
    pointers: buildPointers(left, right, null),
    meta: { target, left, right },
  })

  let step = 0

  while (left <= right) {
    step += 1
    const mid = left + Math.floor((right - left) / 2)
    const midValue = array[mid]
    const range = rangeIndices(left, right)
    const eliminated = eliminatedIndices(n, left, right)

    steps.push({
      id: `binary-mid-${step}`,
      title: `Check mid at index ${mid}`,
      explanation: `left = ${left}, right = ${right}, mid = ${mid}. The middle value is ${midValue}. Compare it with the target ${target}.`,
      detail: `Current middle value: ${midValue}`,
      array,
      highlighted: range,
      active: [mid],
      compared: [mid],
      eliminated,
      pointers: buildPointers(left, right, mid),
      meta: { target, left, right, mid, midValue },
    })

    if (midValue === target) {
      steps.push({
        id: `binary-found-${mid}`,
        title: `Target ${target} found at index ${mid}`,
        explanation: `${midValue} equals the target ${target}. Binary Search stops and returns index ${mid}.`,
        detail: `Result: index ${mid}`,
        array,
        found: [mid],
        eliminated,
        highlighted: range.filter((index) => index !== mid),
        pointers: [{ index: mid, label: 'found' }],
        meta: { target, result: mid, left, right, mid },
      })
      return steps
    }

    if (midValue < target) {
      const nextLeft = mid + 1
      steps.push({
        id: `binary-go-right-${step}`,
        title: `${target} > ${midValue} → search the right half`,
        explanation: `The target ${target} is greater than ${midValue}, so discard everything at or left of mid. Move left to ${nextLeft}.`,
        detail:
          nextLeft <= right
            ? `New range: indices ${nextLeft} through ${right}`
            : 'The new range is empty — nothing left to search.',
        array,
        highlighted: rangeIndices(nextLeft, right),
        eliminated: eliminatedIndices(n, nextLeft, right),
        pointers: nextLeft <= right ? buildPointers(nextLeft, right, null) : undefined,
        meta: { target, left: nextLeft, right, discardedMid: mid },
      })
      left = nextLeft
    } else {
      const nextRight = mid - 1
      steps.push({
        id: `binary-go-left-${step}`,
        title: `${target} < ${midValue} → search the left half`,
        explanation: `The target ${target} is smaller than ${midValue}, so discard everything at or right of mid. Move right to ${nextRight}.`,
        detail:
          left <= nextRight
            ? `New range: indices ${left} through ${nextRight}`
            : 'The new range is empty — nothing left to search.',
        array,
        highlighted: rangeIndices(left, nextRight),
        eliminated: eliminatedIndices(n, left, nextRight),
        pointers: left <= nextRight ? buildPointers(left, nextRight, null) : undefined,
        meta: { target, left, right: nextRight, discardedMid: mid },
      })
      right = nextRight
    }
  }

  steps.push({
    id: 'binary-not-found',
    title: `Target ${target} was not found`,
    explanation: `left (${left}) is greater than right (${right}), so the search range is empty. ${target} is not in the array. Binary Search returns -1.`,
    detail: 'Result: -1 (not found)',
    array,
    eliminated: array.map((_, index) => index),
    meta: { target, result: -1, left, right },
  })

  return steps
}
