import type { VisualizationStep } from '../../components/visualizations/types'
import { formatArray } from '../../components/visualizations/utils'

/** Default lesson array from the Selection Sort walkthrough. */
export const SELECTION_SORT_DEFAULT_ARRAY = [5, 3, 8, 2, 4] as const

export const SELECTION_SORT_SORTED_ARRAY = [1, 2, 3, 4, 5] as const

export const SELECTION_SORT_ARRAY_PRESETS = [
  {
    id: 'lesson-default',
    label: 'Lesson [5, 3, 8, 2, 4]',
    values: SELECTION_SORT_DEFAULT_ARRAY,
  },
  {
    id: 'nearly-sorted',
    label: 'Nearly sorted [1, 3, 2, 5, 4]',
    values: [1, 3, 2, 5, 4] as const,
  },
  {
    id: 'already-sorted',
    label: 'Already sorted [1, 2, 3, 4, 5]',
    values: SELECTION_SORT_SORTED_ARRAY,
  },
  {
    id: 'reversed',
    label: 'Reversed [5, 4, 3, 2, 1]',
    values: [5, 4, 3, 2, 1] as const,
  },
  {
    id: 'duplicates',
    label: 'Duplicates [4, 2, 4, 1, 2]',
    values: [4, 2, 4, 1, 2] as const,
  },
  {
    id: 'negatives',
    label: 'Negatives [-2, 5, -7, 0, 3]',
    values: [-2, 5, -7, 0, 3] as const,
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

function sortedPrefixIndices(sortedCount: number): number[] {
  if (sortedCount <= 0) {
    return []
  }
  return rangeIndices(0, sortedCount - 1)
}

function minimumLabel(array: readonly number[], minIndex: number): string {
  return `${array[minIndex]} @ ${minIndex}`
}

/**
 * Educational Selection Sort.
 * Copies the input so the original array is never mutated.
 */
export function selectionSort(array: readonly number[]): number[] {
  const result = clone(array)
  const n = result.length

  for (let i = 0; i < n; i += 1) {
    let minIndex = i

    for (let j = i + 1; j < n; j += 1) {
      if (result[j] < result[minIndex]) {
        minIndex = j
      }
    }

    if (minIndex !== i) {
      ;[result[i], result[minIndex]] = [result[minIndex], result[i]]
    }
  }

  return result
}

/**
 * Builds a VisualizationStep sequence for Selection Sort.
 * Pure data — no React state and no UI dependencies beyond the shared step type.
 */
export function buildSelectionSortSteps(
  input: readonly number[],
): VisualizationStep[] {
  const original = clone(input)
  const array = clone(input)
  const n = array.length
  const steps: VisualizationStep[] = []
  const totalPasses = Math.max(n - 1, 0)

  steps.push({
    id: 'selection-start',
    title: 'Start Selection Sort',
    explanation:
      n <= 1
        ? `The array ${formatArray(array)} is already sorted — there is nothing to rearrange.`
        : `We start with ${formatArray(array)}. Selection Sort repeatedly finds the smallest element in the unsorted portion and swaps it into the first unsorted position. The sorted portion grows from left to right.`,
    detail:
      n > 1
        ? 'Watch the current position, the minimum candidate, comparisons, and swaps.'
        : undefined,
    array: clone(array),
    highlighted: n > 1 ? rangeIndices(0, n - 1) : undefined,
    sorted: n === 1 ? [0] : undefined,
    meta: { pass: 0, minimum: '—', comparison: '—' },
  })

  if (n <= 1) {
    steps.push({
      id: 'selection-done',
      title: 'Array sorted',
      explanation: `Original: ${formatArray(original)}. Sorted: ${formatArray(array)}.`,
      array: clone(array),
      sorted: n === 1 ? [0] : [],
      operation: 'complete',
      meta: { pass: 0, minimum: '—', comparison: '—' },
    })
    return steps
  }

  for (let i = 0; i < n - 1; i += 1) {
    const pass = i + 1
    let minIndex = i
    const sortedBefore = sortedPrefixIndices(i)
    const unsortedRange = rangeIndices(i, n - 1)

    steps.push({
      id: `selection-pass-start-p${pass}`,
      title: `Pass ${pass}: fill index ${i}`,
      explanation: `Current position = index ${i}. Assume ${array[i]} is the minimum until a smaller value appears in the unsorted portion.`,
      detail: `Sorted | Unsorted → ${formatArray(array.slice(0, i))} | ${formatArray(array.slice(i))}`,
      array: clone(array),
      active: [i],
      candidate: [minIndex],
      highlighted: unsortedRange,
      sorted: sortedBefore,
      operation: 'compare',
      pointers: [
        { index: i, label: 'i' },
        { index: minIndex, label: 'min' },
      ],
      meta: {
        pass,
        minimum: minimumLabel(array, minIndex),
        comparison: '—',
      },
    })

    for (let j = i + 1; j < n; j += 1) {
      const currentValue = array[j]
      const currentMinValue = array[minIndex]
      const comparisonLabel = `${currentValue} vs ${currentMinValue}`

      steps.push({
        id: `selection-compare-p${pass}-j${j}`,
        title: `Compare ${currentValue} with minimum ${currentMinValue}`,
        explanation: `Pass ${pass}: compare ${currentValue} at index ${j} with the current minimum ${currentMinValue} at index ${minIndex}.`,
        detail: `${currentValue} ${currentValue < currentMinValue ? '<' : currentValue > currentMinValue ? '>' : '='} ${currentMinValue}`,
        array: clone(array),
        active: [i],
        candidate: [minIndex],
        compared: [j],
        highlighted: unsortedRange,
        sorted: sortedBefore,
        operation: 'compare',
        pointers: [
          { index: i, label: 'i' },
          { index: minIndex, label: 'min' },
          { index: j, label: 'j' },
        ],
        meta: {
          pass,
          minimum: minimumLabel(array, minIndex),
          comparison: comparisonLabel,
        },
      })

      if (currentValue < currentMinValue) {
        minIndex = j

        steps.push({
          id: `selection-update-min-p${pass}-j${j}`,
          title: `New minimum: ${array[minIndex]}`,
          explanation: `${currentValue} is smaller than ${currentMinValue}, so update the minimum candidate to index ${minIndex}.`,
          detail: `minIndex = ${minIndex}`,
          array: clone(array),
          active: [i],
          candidate: [minIndex],
          compared: [j],
          highlighted: unsortedRange,
          sorted: sortedBefore,
          operation: 'compare',
          pointers: [
            { index: i, label: 'i' },
            { index: minIndex, label: 'min' },
          ],
          meta: {
            pass,
            minimum: minimumLabel(array, minIndex),
            comparison: comparisonLabel,
          },
        })
      } else {
        steps.push({
          id: `selection-keep-min-p${pass}-j${j}`,
          title: `Keep minimum ${currentMinValue}`,
          explanation: `${currentValue} is not smaller than ${currentMinValue}, so the minimum candidate stays at index ${minIndex}.`,
          detail: `minIndex remains ${minIndex}`,
          array: clone(array),
          active: [i],
          candidate: [minIndex],
          compared: [j],
          highlighted: unsortedRange,
          sorted: sortedBefore,
          operation: 'compare',
          pointers: [
            { index: i, label: 'i' },
            { index: minIndex, label: 'min' },
            { index: j, label: 'j' },
          ],
          meta: {
            pass,
            minimum: minimumLabel(array, minIndex),
            comparison: comparisonLabel,
          },
        })
      }
    }

    const minValue = array[minIndex]

    if (minIndex !== i) {
      const left = array[i]
      ;[array[i], array[minIndex]] = [array[minIndex], array[i]]

      steps.push({
        id: `selection-swap-p${pass}`,
        title: `Swap ${left} ↔ ${minValue}`,
        explanation: `The search is finished. The smallest remaining value is ${minValue}. Swap it with the first unsorted element (${left}).`,
        detail: `Array is now ${formatArray(array)}`,
        array: clone(array),
        swapped: [i, minIndex],
        highlighted: unsortedRange,
        sorted: sortedBefore,
        operation: 'swap',
        pointers: [
          { index: i, label: 'i' },
          { index: minIndex, label: 'from' },
        ],
        meta: {
          pass,
          minimum: `${minValue} @ ${i}`,
          comparison: '—',
        },
      })
    } else {
      steps.push({
        id: `selection-no-swap-p${pass}`,
        title: 'No swap needed',
        explanation: `The smallest remaining value is already ${minValue} at index ${i}. No swap is necessary.`,
        detail: `Array remains ${formatArray(array)}`,
        array: clone(array),
        active: [i],
        candidate: [minIndex],
        highlighted: unsortedRange,
        sorted: sortedBefore,
        operation: 'compare',
        pointers: [{ index: i, label: 'min' }],
        meta: {
          pass,
          minimum: minimumLabel(array, minIndex),
          comparison: '—',
        },
      })
    }

    const sortedCount = i + 1
    const sortedNow = sortedPrefixIndices(sortedCount)

    steps.push({
      id: `selection-pass-complete-p${pass}`,
      title: `Pass ${pass} complete`,
      explanation: `${array[i]} is now in its final position at index ${i}. The sorted portion grows by one element.`,
      detail: `Sorted | Unsorted → ${formatArray(array.slice(0, sortedCount))} | ${formatArray(array.slice(sortedCount))}`,
      array: clone(array),
      sorted: sortedNow,
      highlighted: rangeIndices(sortedCount, n - 1),
      operation: 'mark-sorted',
      pointers: [{ index: i, label: 'locked' }],
      meta: {
        pass,
        minimum: '—',
        comparison: '—',
      },
    })
  }

  steps.push({
    id: 'selection-done',
    title: 'Array sorted',
    explanation:
      'Every pass placed the next smallest remaining value at the front of the unsorted portion until the whole array was ordered.',
    detail: `Original: ${formatArray(original)} → Sorted: ${formatArray(array)}`,
    array: clone(array),
    sorted: rangeIndices(0, n - 1),
    operation: 'complete',
    meta: {
      pass: totalPasses,
      minimum: '—',
      comparison: '—',
    },
  })

  return steps
}
