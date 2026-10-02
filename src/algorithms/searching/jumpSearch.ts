import type { VisualizationStep } from '../../components/visualizations/types'
import { formatArray } from '../../components/visualizations/utils'

/** Default lesson array from the Jump Search walkthrough (n = 16, √n = 4). */
export const JUMP_SEARCH_DEFAULT_ARRAY = [
  1, 3, 5, 7, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42,
] as const

export const JUMP_SEARCH_ALT_ARRAY = [
  2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44, 47,
] as const

export const JUMP_SEARCH_DEFAULT_TARGET = 27
export const JUMP_SEARCH_NOT_FOUND_TARGET = 26

export const JUMP_SEARCH_ARRAY_PRESETS = [
  {
    id: 'lesson-default',
    label: 'Lesson array',
    values: JUMP_SEARCH_DEFAULT_ARRAY,
  },
  {
    id: 'alt-sorted',
    label: 'Alternate sorted',
    values: JUMP_SEARCH_ALT_ARRAY,
  },
] as const

function rangeIndices(start: number, endExclusive: number): number[] {
  if (endExclusive <= start) {
    return []
  }
  const indices: number[] = []
  for (let i = start; i < endExclusive; i += 1) {
    indices.push(i)
  }
  return indices
}

function jumpSizeFor(n: number): number {
  if (n <= 0) {
    return 0
  }
  return Math.max(1, Math.floor(Math.sqrt(n)))
}

/**
 * Educational Jump Search used by the lesson code examples.
 * Requires a sorted ascending array. Prefer readability over micro-optimizations.
 */
export function jumpSearch(
  array: readonly number[],
  target: number,
): number {
  const n = array.length

  if (n === 0) {
    return -1
  }

  const jump = jumpSizeFor(n)
  let previous = 0
  let current = jump

  while (current < n && array[current - 1] < target) {
    previous = current
    current += jump
  }

  current = Math.min(current, n)

  while (previous < current && array[previous] < target) {
    previous += 1
  }

  if (previous < n && array[previous] === target) {
    return previous
  }

  return -1
}

/**
 * Builds a step-by-step VisualizationStep sequence for Jump Search.
 * Pure data — no React state and no UI dependencies beyond the shared step type.
 *
 * Visual state mapping:
 * - Jump / block boundary → active + compared
 * - Active block → highlighted
 * - Checked (jumped past) blocks → eliminated
 * - Linear scan → active + compared inside the block
 * - Found → found
 */
export function buildJumpSearchSteps(
  input: readonly number[],
  target: number,
): VisualizationStep[] {
  const array = [...input]
  const steps: VisualizationStep[] = []
  const n = array.length

  if (n === 0) {
    steps.push({
      id: 'jump-empty',
      title: 'Empty array',
      explanation: `The array is empty, so there is nothing to search. Jump Search returns -1 for target ${target}.`,
      detail: 'Result: -1 (not found)',
      array,
      meta: { target, result: -1, phase: 'complete' },
    })
    return steps
  }

  const jump = jumpSizeFor(n)
  let previous = 0
  let current = jump
  let jumpStep = 0

  steps.push({
    id: 'jump-start',
    title: 'Start Jump Search',
    explanation: `We are looking for ${target} in the sorted array ${formatArray(array)}. n = ${n}, so jump size ≈ √${n} = ${jump}. Start at previous = 0 and current = ${jump}.`,
    detail: 'Jump Search requires the array to be sorted in ascending order.',
    array,
    highlighted: rangeIndices(0, Math.min(jump, n)),
    pointers: [
      { index: 0, label: 'prev' },
      { index: Math.min(jump, n) - 1, label: 'jump' },
    ],
    meta: { target, jump, previous: 0, current: jump, phase: 'jump' },
  })

  while (current < n && array[current - 1] < target) {
    jumpStep += 1
    const boundaryIndex = current - 1
    const boundaryValue = array[boundaryIndex]
    const blockStart = previous
    const blockEnd = current

    steps.push({
      id: `jump-boundary-${jumpStep}`,
      title: `Jump to index ${current} — check boundary`,
      explanation: `The block from index ${blockStart} to ${blockEnd - 1} ends at ${boundaryValue}. Compare the boundary with the target ${target}: ${boundaryValue} < ${target}, so the target cannot be in this block.`,
      detail: `Boundary value at index ${boundaryIndex}: ${boundaryValue}`,
      array,
      highlighted: rangeIndices(blockStart, blockEnd),
      active: [boundaryIndex],
      compared: [boundaryIndex],
      eliminated: rangeIndices(0, blockStart),
      pointers: [
        { index: previous, label: 'prev' },
        { index: boundaryIndex, label: 'boundary' },
      ],
      meta: {
        target,
        jump,
        previous,
        current,
        boundary: boundaryValue,
        phase: 'jump',
      },
    })

    const nextPrevious = current
    const nextCurrent = current + jump

    steps.push({
      id: `jump-advance-${jumpStep}`,
      title: `Jump forward by ${jump}`,
      explanation: `Move previous to ${nextPrevious} and current to ${Math.min(nextCurrent, n)}. Continue jumping while later blocks might still contain ${target}.`,
      detail:
        nextCurrent < n
          ? `Next block starts at index ${nextPrevious}.`
          : `Reached the final partial block starting at index ${nextPrevious}.`,
      array,
      highlighted: rangeIndices(nextPrevious, Math.min(nextCurrent, n)),
      eliminated: rangeIndices(0, nextPrevious),
      pointers: [
        { index: nextPrevious, label: 'prev' },
        {
          index: Math.min(nextCurrent, n) - 1,
          label: nextCurrent <= n ? 'jump' : 'end',
        },
      ],
      meta: {
        target,
        jump,
        previous: nextPrevious,
        current: nextCurrent,
        phase: 'jump',
      },
    })

    previous = nextPrevious
    current = nextCurrent
  }

  current = Math.min(current, n)
  const blockStart = previous
  const activeBlock = rangeIndices(blockStart, current)
  const checkedBefore = rangeIndices(0, blockStart)

  if (previous >= n) {
    steps.push({
      id: 'jump-past-end',
      title: `Target ${target} is beyond the array`,
      explanation: `Jumping finished past the last index. Every block boundary was smaller than ${target}, so ${target} cannot be in the array.`,
      detail: 'Result: -1 (not found)',
      array,
      eliminated: array.map((_, index) => index),
      meta: { target, jump, previous, current, result: -1, phase: 'complete' },
    })
    return steps
  }

  const boundaryIndex = Math.min(current, n) - 1
  const boundaryValue = array[boundaryIndex]

  steps.push({
    id: 'jump-identify-block',
    title: 'Identify the active block',
    explanation:
      current < n || boundaryValue >= target
        ? `Stop jumping. The target ${target} could be inside the block from index ${blockStart} to ${current - 1}. Next: linear scan inside this block.`
        : `Reached the end of the array. Linear-scan the final block from index ${blockStart} to ${current - 1}.`,
    detail: `Active block: indices ${blockStart}–${current - 1} · JUMP → BLOCK`,
    array,
    highlighted: activeBlock,
    eliminated: checkedBefore,
    active: [boundaryIndex],
    compared: [boundaryIndex],
    pointers: [
      { index: blockStart, label: 'prev' },
      { index: boundaryIndex, label: 'end' },
    ],
    meta: {
      target,
      jump,
      previous: blockStart,
      current,
      phase: 'block',
    },
  })

  let scanStep = 0

  while (previous < current && array[previous] < target) {
    scanStep += 1
    const value = array[previous]

    steps.push({
      id: `jump-linear-${scanStep}`,
      title: `Linear scan: check ${value}`,
      explanation: `Inside the block, compare index ${previous} (${value}) with the target ${target}. ${value} < ${target}, so move forward one step.`,
      detail: 'Linear scan within the selected block · BLOCK → LINEAR SCAN',
      array,
      highlighted: activeBlock,
      eliminated: [...checkedBefore, ...rangeIndices(blockStart, previous)],
      active: [previous],
      compared: [previous],
      pointers: [{ index: previous, label: 'i' }],
      meta: {
        target,
        jump,
        previous,
        current,
        index: previous,
        phase: 'linear',
      },
    })

    previous += 1
  }

  if (previous < n && array[previous] === target) {
    steps.push({
      id: `jump-found-${previous}`,
      title: `Target ${target} found at index ${previous}`,
      explanation: `${array[previous]} equals the target ${target}. Jump Search stops and returns index ${previous}.`,
      detail: `Result: index ${previous} · LINEAR SCAN → FOUND`,
      array,
      highlighted: activeBlock.filter((index) => index !== previous),
      eliminated: [...checkedBefore, ...rangeIndices(blockStart, previous)],
      found: [previous],
      pointers: [{ index: previous, label: 'found' }],
      meta: {
        target,
        jump,
        result: previous,
        phase: 'found',
      },
    })
    return steps
  }

  const missIndex = previous < current ? previous : current - 1
  const missValue =
    previous < current ? array[previous] : array[Math.max(0, current - 1)]

  steps.push({
    id: 'jump-not-found',
    title: `Target ${target} was not found`,
    explanation:
      previous < current
        ? `Index ${previous} holds ${missValue}, which is not ${target}. The target is not in this block — Jump Search returns -1.`
        : `The linear scan finished the block without finding ${target}. Jump Search returns -1.`,
    detail: 'Result: -1 (not found)',
    array,
    highlighted: activeBlock,
    eliminated: array
      .map((_, index) => index)
      .filter((index) => !activeBlock.includes(index)),
    compared: missIndex >= 0 ? [missIndex] : undefined,
    active: missIndex >= 0 ? [missIndex] : undefined,
    meta: {
      target,
      jump,
      result: -1,
      phase: 'not-found',
      missValue,
    },
  })

  return steps
}
