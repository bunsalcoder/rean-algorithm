import type { VisualizationStep } from '../components/visualizations/types'

export const LINEAR_SEARCH_DEFAULT_ARRAY = [10, 25, 7, 42, 18, 31] as const
export const LINEAR_SEARCH_DEFAULT_TARGET = 42
export const LINEAR_SEARCH_NOT_FOUND_TARGET = 99

function formatArray(values: readonly number[]): string {
  return `[${values.join(', ')}]`
}

/**
 * Educational Linear Search used by the lesson code examples.
 * Prefer readability over micro-optimizations.
 */
export function linearSearch(
  array: readonly number[],
  target: number,
): number {
  for (let i = 0; i < array.length; i += 1) {
    if (array[i] === target) {
      return i
    }
  }

  return -1
}

/**
 * Builds a step-by-step VisualizationStep sequence for Linear Search.
 * Pure data — no React state and no UI dependencies beyond the shared step type.
 *
 * Visual state mapping:
 * - Current  → active
 * - Compared → compared
 * - Not matched (already checked) → highlighted
 * - Found → found
 */
export function buildLinearSearchSteps(
  input: readonly number[],
  target: number,
): VisualizationStep[] {
  const array = [...input]
  const steps: VisualizationStep[] = []
  const checked: number[] = []

  steps.push({
    id: 'linear-start',
    title: 'Start Linear Search',
    explanation: `We are looking for ${target} in ${formatArray(array)}. Linear Search checks each element one by one, starting from the beginning.`,
    detail: 'The array does not need to be sorted.',
    array,
    meta: { target },
  })

  for (let i = 0; i < array.length; i += 1) {
    const value = array[i]

    steps.push({
      id: `linear-check-${i}`,
      title: `Check ${value}`,
      explanation: `Look at index ${i}. The current value is ${value}. Compare it with the target ${target}.`,
      array,
      active: [i],
      compared: [i],
      highlighted: [...checked],
      pointers: [{ index: i, label: 'i' }],
      meta: { target, index: i },
    })

    if (value === target) {
      steps.push({
        id: `linear-found-${i}`,
        title: `${value} matches the target → found`,
        explanation: `${value} equals the target ${target}. Linear Search stops here and returns index ${i}.`,
        detail: `Result: index ${i}`,
        array,
        found: [i],
        highlighted: [...checked],
        pointers: [{ index: i, label: 'found' }],
        meta: { target, result: i },
      })
      return steps
    }

    checked.push(i)
    const hasNext = i + 1 < array.length
    const nextValue = hasNext ? array[i + 1] : null

    steps.push({
      id: `linear-miss-${i}`,
      title: hasNext
        ? `${value} is not the target → move to ${nextValue}`
        : `${value} is not the target`,
      explanation: hasNext
        ? `${value} does not equal ${target}, so we mark it as not matched and move to the next element (${nextValue} at index ${i + 1}).`
        : `${value} does not equal ${target}. There are no more elements left to check.`,
      array,
      highlighted: [...checked],
      pointers: hasNext
        ? [{ index: i + 1, label: 'next' }]
        : undefined,
      meta: { target, index: i },
    })
  }

  steps.push({
    id: 'linear-not-found',
    title: `Target ${target} was not found`,
    explanation: `Every element in ${formatArray(array)} was checked. ${target} is not in the array, so Linear Search returns -1.`,
    detail: 'Result: -1 (not found)',
    array,
    highlighted: array.map((_, index) => index),
    meta: { target, result: -1 },
  })

  return steps
}
