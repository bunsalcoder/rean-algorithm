import type { VisualizationStep } from '../../components/visualizations/types'
import { formatArray } from '../../components/visualizations/utils'

/** Default lesson array from the Insertion Sort walkthrough. */
export const INSERTION_SORT_DEFAULT_ARRAY = [5, 3, 8, 2, 4] as const

export const INSERTION_SORT_SORTED_ARRAY = [1, 2, 3, 4, 5] as const

export const INSERTION_SORT_ARRAY_PRESETS = [
  {
    id: 'lesson-default',
    label: 'Lesson [5, 3, 8, 2, 4]',
    values: INSERTION_SORT_DEFAULT_ARRAY,
  },
  {
    id: 'nearly-sorted',
    label: 'Nearly sorted [1, 3, 2, 5, 4]',
    values: [1, 3, 2, 5, 4] as const,
  },
  {
    id: 'already-sorted',
    label: 'Already sorted [1, 2, 3, 4, 5]',
    values: INSERTION_SORT_SORTED_ARRAY,
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

/**
 * Educational Insertion Sort.
 * Copies the input so the original array is never mutated.
 */
export function insertionSort(array: readonly number[]): number[] {
  const result = clone(array)

  for (let i = 1; i < result.length; i += 1) {
    const key = result[i]
    let j = i - 1

    while (j >= 0 && result[j] > key) {
      result[j + 1] = result[j]
      j -= 1
    }

    result[j + 1] = key
  }

  return result
}

/**
 * Builds a VisualizationStep sequence for Insertion Sort.
 *
 * Emphasizes holding a key, shifting larger elements right, then inserting —
 * not adjacent swapping. Pure data — no React state.
 */
export function buildInsertionSortSteps(
  input: readonly number[],
): VisualizationStep[] {
  const original = clone(input)
  const array = clone(input)
  const n = array.length
  const steps: VisualizationStep[] = []
  const totalPasses = Math.max(n - 1, 0)

  steps.push({
    id: 'insertion-start',
    title: 'Start Insertion Sort',
    explanation:
      n <= 1
        ? `The array ${formatArray(array)} is already sorted — there is nothing to rearrange.`
        : `We start with ${formatArray(array)}. Insertion Sort builds a sorted portion from left to right. Treat the first element as already sorted, then insert each next value into its correct position by shifting larger elements right.`,
    detail:
      n > 1
        ? `Sorted | Unsorted → ${formatArray(array.slice(0, 1))} | ${formatArray(array.slice(1))}`
        : undefined,
    array: clone(array),
    highlighted: n > 1 ? rangeIndices(0, n - 1) : undefined,
    sorted: n === 1 ? [0] : n > 1 ? [0] : undefined,
    meta: { pass: 0, key: '—', comparison: '—' },
  })

  if (n <= 1) {
    steps.push({
      id: 'insertion-done',
      title: 'Array sorted',
      explanation: `Original: ${formatArray(original)}. Sorted: ${formatArray(array)}.`,
      array: clone(array),
      sorted: n === 1 ? [0] : [],
      operation: 'complete',
      meta: { pass: 0, key: '—', comparison: '—' },
    })
    return steps
  }

  for (let i = 1; i < n; i += 1) {
    const pass = i
    const key = array[i]
    let j = i - 1
    const sortedBefore = sortedPrefixIndices(i)

    steps.push({
      id: `insertion-select-key-p${pass}`,
      title: `Select key ${key}`,
      explanation: `Pass ${pass}: take ${key} at index ${i} as the current key. We will insert it into the correct position inside the sorted portion on the left.`,
      detail: `Sorted | Unsorted → ${formatArray(array.slice(0, i))} | ${formatArray(array.slice(i))}`,
      array: clone(array),
      active: [i],
      sorted: sortedBefore,
      highlighted: rangeIndices(i, n - 1),
      operation: 'compare',
      pointers: [{ index: i, label: 'key' }],
      meta: {
        pass,
        key,
        comparison: '—',
      },
    })

    let didShift = false

    while (j >= 0 && array[j] > key) {
      const comparedValue = array[j]
      const comparisonLabel = `${key} vs ${comparedValue}`

      steps.push({
        id: `insertion-compare-p${pass}-j${j}`,
        title: `Compare ${key} with ${comparedValue}`,
        explanation: `The key is ${key}. Compare it with ${comparedValue} at index ${j}. Because ${comparedValue} > ${key}, we shift ${comparedValue} one position to the right to make space.`,
        detail: `${comparedValue} > ${key} → shift right`,
        array: clone(array),
        active: array[i] === key ? [i] : undefined,
        compared: [j],
        sorted: sortedBefore,
        highlighted: rangeIndices(i, n - 1),
        operation: 'compare',
        pointers: [
          ...(array[i] === key ? [{ index: i, label: 'key' }] : []),
          { index: j, label: 'j' },
        ],
        meta: {
          pass,
          key,
          comparison: comparisonLabel,
        },
      })

      // Shift: copy array[j] into array[j + 1]. The key is held separately.
      array[j + 1] = array[j]
      didShift = true

      steps.push({
        id: `insertion-shift-p${pass}-j${j}`,
        title: `Shift ${comparedValue} right`,
        explanation: `${comparedValue} moves one position to the right. This is a shift — not a swap. The key ${key} is still held separately until we find its insertion spot.`,
        detail: `Array now: ${formatArray(array)}`,
        array: clone(array),
        moving: [j, j + 1],
        sorted: sortedBefore.filter((index) => index !== j && index !== j + 1),
        highlighted: rangeIndices(i, n - 1),
        operation: 'move',
        pointers: [
          { index: j, label: 'from' },
          { index: j + 1, label: 'to' },
        ],
        meta: {
          pass,
          key,
          comparison: comparisonLabel,
        },
      })

      j -= 1
    }

    if (j >= 0) {
      const comparedValue = array[j]
      const comparisonLabel = `${key} vs ${comparedValue}`

      steps.push({
        id: `insertion-compare-stop-p${pass}-j${j}`,
        title: `Compare ${key} with ${comparedValue}`,
        explanation: `The key is ${key}. Compare it with ${comparedValue} at index ${j}. ${comparedValue} is not greater than ${key}, so we stop shifting.`,
        detail: `${comparedValue} ${comparedValue > key ? '>' : comparedValue < key ? '<' : '='} ${key} → stop`,
        array: clone(array),
        active: array[i] === key ? [i] : undefined,
        compared: [j],
        sorted: sortedBefore,
        highlighted: rangeIndices(i, n - 1),
        operation: 'compare',
        pointers: [
          ...(array[i] === key ? [{ index: i, label: 'key' }] : []),
          { index: j, label: 'j' },
        ],
        meta: {
          pass,
          key,
          comparison: comparisonLabel,
        },
      })
    }

    const insertAt = j + 1
    array[insertAt] = key

    if (!didShift && insertAt === i) {
      steps.push({
        id: `insertion-no-shift-p${pass}`,
        title: `Key ${key} already in place`,
        explanation: `${key} is already greater than or equal to the sorted elements to its left. No shifting is required — leave it where it is.`,
        detail: `Array remains ${formatArray(array)}`,
        array: clone(array),
        active: [i],
        candidate: [insertAt],
        sorted: sortedBefore,
        highlighted: rangeIndices(i, n - 1),
        operation: 'compare',
        pointers: [{ index: insertAt, label: 'key' }],
        meta: {
          pass,
          key,
          comparison: j >= 0 ? `${key} vs ${array[j]}` : '—',
        },
      })
    } else {
      steps.push({
        id: `insertion-insert-p${pass}`,
        title: `Insert ${key} at index ${insertAt}`,
        explanation: `There are no more elements larger than ${key} to its left. Insert the key into index ${insertAt}.`,
        detail: `Result: ${formatArray(array)}`,
        array: clone(array),
        found: [insertAt],
        sorted: sortedBefore.filter((index) => index !== insertAt),
        highlighted: rangeIndices(Math.max(i, insertAt + 1), n - 1),
        operation: 'move',
        pointers: [{ index: insertAt, label: 'insert' }],
        meta: {
          pass,
          key,
          comparison: '—',
        },
      })
    }

    const sortedCount = i + 1
    const sortedNow = sortedPrefixIndices(sortedCount)

    steps.push({
      id: `insertion-pass-complete-p${pass}`,
      title: `Pass ${pass} complete`,
      explanation: `${key} is now in its correct position within the sorted portion. The sorted portion has grown by one element.`,
      detail: `Sorted | Unsorted → ${formatArray(array.slice(0, sortedCount))} | ${formatArray(array.slice(sortedCount))}`,
      array: clone(array),
      sorted: sortedNow,
      highlighted: rangeIndices(sortedCount, n - 1),
      operation: 'mark-sorted',
      pointers: [{ index: insertAt, label: 'placed' }],
      meta: {
        pass,
        key: '—',
        comparison: '—',
      },
    })
  }

  steps.push({
    id: 'insertion-done',
    title: 'Array sorted',
    explanation:
      'Every key was inserted into the growing sorted portion by shifting larger values right until the whole array was ordered.',
    detail: `Original: ${formatArray(original)} → Sorted: ${formatArray(array)}`,
    array: clone(array),
    sorted: rangeIndices(0, n - 1),
    operation: 'complete',
    meta: {
      pass: totalPasses,
      key: '—',
      comparison: '—',
    },
  })

  return steps
}
