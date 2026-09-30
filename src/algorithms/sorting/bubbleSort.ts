import type { VisualizationStep } from '../../components/visualizations/types'
import { formatArray } from '../../components/visualizations/utils'

/** Default lesson array from the Bubble Sort walkthrough. */
export const BUBBLE_SORT_DEFAULT_ARRAY = [5, 3, 8, 2, 4] as const

export const BUBBLE_SORT_SORTED_ARRAY = [1, 2, 3, 4, 5] as const

export const BUBBLE_SORT_ARRAY_PRESETS = [
  {
    id: 'lesson-default',
    label: 'Lesson [5, 3, 8, 2, 4]',
    values: BUBBLE_SORT_DEFAULT_ARRAY,
  },
  {
    id: 'nearly-sorted',
    label: 'Nearly sorted [1, 3, 2, 5, 4]',
    values: [1, 3, 2, 5, 4] as const,
  },
  {
    id: 'already-sorted',
    label: 'Already sorted [1, 2, 3, 4, 5]',
    values: BUBBLE_SORT_SORTED_ARRAY,
  },
  {
    id: 'reversed',
    label: 'Reversed [5, 4, 3, 2, 1]',
    values: [5, 4, 3, 2, 1] as const,
  },
] as const

function clone(array: readonly number[]): number[] {
  return [...array]
}

function rangeIndices(start: number, end: number): number[] {
  if (end < start) {
    return []
  }
  return Array.from({ length: end - start + 1 }, (_, offset) => start + offset)
}

function sortedTailIndices(n: number, sortedCount: number): number[] {
  if (sortedCount <= 0 || n <= 0) {
    return []
  }
  const start = Math.max(0, n - sortedCount)
  return rangeIndices(start, n - 1)
}

/**
 * Educational Bubble Sort with early-exit optimization.
 * Copies the input so the original array is never mutated.
 */
export function bubbleSort(array: readonly number[]): number[] {
  const result = clone(array)
  const n = result.length

  for (let i = 0; i < n; i += 1) {
    let swapped = false

    for (let j = 0; j < n - i - 1; j += 1) {
      if (result[j] > result[j + 1]) {
        ;[result[j], result[j + 1]] = [result[j + 1], result[j]]
        swapped = true
      }
    }

    if (!swapped) {
      break
    }
  }

  return result
}

/**
 * Builds a VisualizationStep sequence for Bubble Sort with early exit.
 * Pure data — no React state and no UI dependencies beyond the shared step type.
 */
export function buildBubbleSortSteps(
  input: readonly number[],
): VisualizationStep[] {
  const original = clone(input)
  const array = clone(input)
  const n = array.length
  const steps: VisualizationStep[] = []

  steps.push({
    id: 'bubble-start',
    title: 'Start Bubble Sort',
    explanation:
      n <= 1
        ? `The array ${formatArray(array)} is already sorted — there is nothing to rearrange.`
        : `We start with ${formatArray(array)}. Bubble Sort repeatedly compares neighboring values. If they are in the wrong order, we swap them. After each full pass, the largest unsorted value bubbles to the end.`,
    detail:
      n > 1
        ? 'Watch comparisons, swaps, and the growing sorted region at the end.'
        : undefined,
    array: clone(array),
    highlighted: n > 1 ? rangeIndices(0, n - 1) : undefined,
    sorted: n === 1 ? [0] : undefined,
    meta: { pass: 0, comparison: '—' },
  })

  if (n <= 1) {
    steps.push({
      id: 'bubble-done',
      title: 'Array sorted',
      explanation: `Original: ${formatArray(original)}. Sorted: ${formatArray(array)}.`,
      array: clone(array),
      sorted: n === 1 ? [0] : [],
      operation: 'complete',
      meta: { pass: 0, comparison: '—' },
    })
    return steps
  }

  for (let i = 0; i < n; i += 1) {
    const pass = i + 1
    const unsortedEnd = n - i - 2
    let swapped = false
    const sortedBefore = sortedTailIndices(n, i)
    const activeRange = rangeIndices(0, n - i - 1)

    for (let j = 0; j <= unsortedEnd; j += 1) {
      const left = array[j]
      const right = array[j + 1]
      const comparisonLabel = `${j + 1}/${unsortedEnd + 1}`

      steps.push({
        id: `bubble-compare-p${pass}-j${j}`,
        title: `Compare ${left} and ${right}`,
        explanation: `Pass ${pass}: compare neighboring values at indices ${j} and ${j + 1} (${left} and ${right}).`,
        detail: `${left} ${left > right ? '>' : left < right ? '<' : '='} ${right}`,
        array: clone(array),
        compared: [j, j + 1],
        highlighted: activeRange,
        sorted: sortedBefore,
        operation: 'compare',
        pointers: [
          { index: j, label: 'j' },
          { index: j + 1, label: 'j+1' },
        ],
        meta: { pass, comparison: comparisonLabel },
      })

      if (left > right) {
        ;[array[j], array[j + 1]] = [array[j + 1], array[j]]
        swapped = true

        steps.push({
          id: `bubble-swap-p${pass}-j${j}`,
          title: `Swap ${left} ↔ ${right}`,
          explanation: `${left} is greater than ${right}, so they are in the wrong order. Swap them.`,
          detail: `Array is now ${formatArray(array)}`,
          array: clone(array),
          swapped: [j, j + 1],
          highlighted: activeRange,
          sorted: sortedBefore,
          operation: 'swap',
          pointers: [
            { index: j, label: 'L' },
            { index: j + 1, label: 'R' },
          ],
          meta: { pass, comparison: comparisonLabel },
        })
      } else {
        steps.push({
          id: `bubble-no-swap-p${pass}-j${j}`,
          title: 'No swap needed',
          explanation: `${left} is not greater than ${right}, so they stay in place.`,
          detail: `Array remains ${formatArray(array)}`,
          array: clone(array),
          compared: [j, j + 1],
          highlighted: activeRange,
          sorted: sortedBefore,
          operation: 'compare',
          meta: { pass, comparison: comparisonLabel },
        })
      }
    }

    const sortedCount = i + 1
    const sortedNow = sortedTailIndices(n, sortedCount)
    const bubbledValue = array[n - sortedCount]

    if (!swapped) {
      const allSorted = rangeIndices(0, n - 1)
      steps.push({
        id: `bubble-early-exit-p${pass}`,
        title: `Pass ${pass}: no swaps — early exit`,
        explanation: `Pass ${pass} made zero swaps, so the array is already sorted. Bubble Sort can stop early.`,
        detail: `Final array: ${formatArray(array)}`,
        array: clone(array),
        sorted: allSorted,
        operation: 'complete',
        meta: { pass, comparison: 'early exit' },
      })
      return steps
    }

    steps.push({
      id: `bubble-pass-complete-p${pass}`,
      title: `Pass ${pass} complete`,
      explanation: `The largest remaining unsorted value, ${bubbledValue}, has bubbled to its final position at index ${n - sortedCount}.`,
      detail: `Sorted from the end: ${formatArray(array.slice(n - sortedCount))}`,
      array: clone(array),
      sorted: sortedNow,
      highlighted: rangeIndices(0, n - sortedCount - 1),
      operation: 'mark-sorted',
      pointers: [{ index: n - sortedCount, label: 'locked' }],
      meta: { pass, comparison: '—' },
    })

    if (sortedCount >= n - 1) {
      break
    }
  }

  steps.push({
    id: 'bubble-done',
    title: 'Array sorted',
    explanation: `Every pass moved a large value toward the end until the whole array was ordered.`,
    detail: `Original: ${formatArray(original)} → Sorted: ${formatArray(array)}`,
    array: clone(array),
    sorted: rangeIndices(0, n - 1),
    operation: 'complete',
    meta: { pass: Math.max(n - 1, 0), comparison: '—' },
  })

  return steps
}
