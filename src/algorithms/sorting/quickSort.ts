import type { VisualizationStep } from '../../components/visualizations/types'
import { formatArray } from '../../components/visualizations/utils'

/** Default lesson array from the Quick Sort walkthrough. */
export const QUICK_SORT_DEFAULT_ARRAY = [5, 3, 8, 2, 4] as const

export const QUICK_SORT_SORTED_ARRAY = [1, 2, 3, 4, 5] as const

export const QUICK_SORT_ARRAY_PRESETS = [
  {
    id: 'lesson-default',
    label: 'Lesson [5, 3, 8, 2, 4]',
    values: QUICK_SORT_DEFAULT_ARRAY,
  },
  {
    id: 'extra-example',
    label: 'Example [8, 3, 5, 1, 7, 2]',
    values: [8, 3, 5, 1, 7, 2] as const,
  },
  {
    id: 'already-sorted',
    label: 'Already sorted [1, 2, 3, 4, 5]',
    values: QUICK_SORT_SORTED_ARRAY,
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

function formatRange(start: number, end: number): string {
  return start === end ? `[${start}]` : `[${start}..${end}]`
}

function swap(array: number[], a: number, b: number) {
  ;[array[a], array[b]] = [array[b], array[a]]
}

/**
 * Educational Quick Sort (Lomuto partition, last-element pivot).
 * Copies the input so the original array is never mutated.
 */
export function quickSort(array: readonly number[]): number[] {
  const result = clone(array)

  function partition(low: number, high: number): number {
    const pivot = result[high]
    let i = low - 1

    for (let j = low; j < high; j += 1) {
      if (result[j] <= pivot) {
        i += 1
        swap(result, i, j)
      }
    }

    swap(result, i + 1, high)
    return i + 1
  }

  function sort(low: number, high: number) {
    if (low < high) {
      const pivotIndex = partition(low, high)
      sort(low, pivotIndex - 1)
      sort(pivotIndex + 1, high)
    }
  }

  if (result.length > 1) {
    sort(0, result.length - 1)
  }

  return result
}

/**
 * Builds a VisualizationStep sequence for Quick Sort.
 *
 * Emphasizes Lomuto partitioning: choose a pivot (last element),
 * walk the range comparing each value to the pivot, grow the left
 * region, then place the pivot in its final position.
 */
export function buildQuickSortSteps(
  input: readonly number[],
): VisualizationStep[] {
  const original = clone(input)
  const array = clone(input)
  const n = array.length
  const steps: VisualizationStep[] = []
  const finalized = new Set<number>()

  function collectFinalized(): number[] {
    return [...finalized].sort((a, b) => a - b)
  }

  function leftRegion(low: number, i: number): number[] {
    if (i < low) {
      return []
    }
    return rangeIndices(low, i)
  }

  function rightRegion(i: number, high: number, excludeJ?: number): number[] {
    const start = i + 1
    const end = high - 1
    if (end < start) {
      return []
    }
    return rangeIndices(start, end).filter((index) => index !== excludeJ)
  }

  steps.push({
    id: 'quick-start',
    title: 'Start with the entire array',
    explanation:
      n <= 1
        ? `The array ${formatArray(array)} is already sorted — there is nothing to partition.`
        : `Start with ${formatArray(array)}. Quick Sort picks a pivot, partitions the range so smaller-or-equal values go left and larger values go right, then recursively sorts each side.`,
    detail:
      n > 1
        ? 'This lesson uses the last element as the pivot and a Lomuto-style partition.'
        : undefined,
    array: clone(array),
    highlighted: n > 0 ? rangeIndices(0, n - 1) : undefined,
    meta: {
      phase: n <= 1 ? 'Done' : 'Ready',
      range: n > 0 ? formatRange(0, n - 1) : '—',
      pivot: '—',
      i: '—',
      j: '—',
      comparison: '—',
    },
  })

  if (n <= 1) {
    if (n === 1) {
      finalized.add(0)
    }
    steps.push({
      id: 'quick-done',
      title: 'The array is completely sorted',
      explanation: `Original: ${formatArray(original)}. Sorted: ${formatArray(array)}.`,
      array: clone(array),
      sorted: n === 1 ? [0] : [],
      operation: 'complete',
      meta: {
        phase: 'Done',
        range: n === 1 ? '[0]' : '—',
        pivot: '—',
        i: '—',
        j: '—',
        comparison: '—',
      },
    })
    return steps
  }

  let stepCounter = 0

  function nextId(prefix: string): string {
    stepCounter += 1
    return `quick-${prefix}-${stepCounter}`
  }

  function partitionRange(low: number, high: number): number {
    const pivotValue = array[high]
    let i = low - 1

    steps.push({
      id: nextId('choose-pivot'),
      title: `Choose ${pivotValue} as the pivot`,
      explanation: `Choose ${pivotValue} as the pivot for this partition. This lesson always uses the last element of the current range ${formatRange(low, high)}.`,
      detail: `Pivot index ${high} · Range ${formatArray(array.slice(low, high + 1))}`,
      array: clone(array),
      highlighted: rangeIndices(low, high),
      candidate: [high],
      sorted: collectFinalized(),
      operation: 'partition',
      pointers: [
        { index: low, label: 'low' },
        { index: high, label: 'pivot' },
      ],
      meta: {
        phase: 'Partition',
        range: formatRange(low, high),
        pivot: `${pivotValue} @ ${high}`,
        i: String(i),
        j: '—',
        comparison: '—',
      },
    })

    for (let j = low; j < high; j += 1) {
      const value = array[j]

      steps.push({
        id: nextId('compare'),
        title: `Compare ${value} with pivot ${pivotValue}`,
        explanation: `Compare ${value} with pivot ${pivotValue}. If ${value} is less than or equal to the pivot, it belongs in the left region; otherwise it stays toward the right.`,
        detail: `${value} ${value <= pivotValue ? '≤' : '>'} ${pivotValue}`,
        array: clone(array),
        highlighted: rangeIndices(low, high),
        left: leftRegion(low, i),
        right: rightRegion(i, high, j),
        compared: [j, high],
        candidate: [high],
        sorted: collectFinalized(),
        operation: 'compare',
        pointers: [
          { index: j, label: 'j' },
          { index: high, label: 'pivot' },
          ...(i >= low ? [{ index: i, label: 'i' }] : []),
        ],
        meta: {
          phase: 'Partition',
          range: formatRange(low, high),
          pivot: `${pivotValue} @ ${high}`,
          i: String(i),
          j: String(j),
          comparison: `${value} vs ${pivotValue}`,
        },
      })

      if (value <= pivotValue) {
        i += 1

        if (i !== j) {
          swap(array, i, j)

          steps.push({
            id: nextId('swap-left'),
            title: `Move ${value} into the left region`,
            explanation: `${value} is less than or equal to ${pivotValue}, so move it into the left region by swapping indices ${i} and ${j}.`,
            detail: `Left region now covers ${formatRange(low, i)} · Array: ${formatArray(array)}`,
            array: clone(array),
            highlighted: rangeIndices(low, high),
            left: leftRegion(low, i),
            right: rightRegion(i, high),
            swapped: [i, j],
            candidate: [high],
            sorted: collectFinalized(),
            operation: 'swap',
            pointers: [
              { index: i, label: 'i' },
              { index: j, label: 'j' },
              { index: high, label: 'pivot' },
            ],
            meta: {
              phase: 'Partition',
              range: formatRange(low, high),
              pivot: `${pivotValue} @ ${high}`,
              i: String(i),
              j: String(j),
              comparison: `${value} ≤ ${pivotValue}`,
            },
          })
        } else {
          steps.push({
            id: nextId('keep-left'),
            title: `${value} already belongs in the left region`,
            explanation: `${value} is less than or equal to ${pivotValue}, and it is already at the next left-region slot, so advance i without swapping.`,
            detail: `Left region now covers ${formatRange(low, i)}`,
            array: clone(array),
            highlighted: rangeIndices(low, high),
            left: leftRegion(low, i),
            right: rightRegion(i, high),
            active: [j],
            candidate: [high],
            sorted: collectFinalized(),
            operation: 'partition',
            pointers: [
              { index: i, label: 'i' },
              { index: j, label: 'j' },
              { index: high, label: 'pivot' },
            ],
            meta: {
              phase: 'Partition',
              range: formatRange(low, high),
              pivot: `${pivotValue} @ ${high}`,
              i: String(i),
              j: String(j),
              comparison: `${value} ≤ ${pivotValue}`,
            },
          })
        }
      } else {
        steps.push({
          id: nextId('stay-right'),
          title: `${value} stays in the right region`,
          explanation: `${value} is greater than ${pivotValue}, so it stays in the right region for now. Do not advance i.`,
          detail: `i stays at ${i}`,
          array: clone(array),
          highlighted: rangeIndices(low, high),
          left: leftRegion(low, i),
          right: [...rightRegion(i, high, j), j],
          active: [j],
          candidate: [high],
          sorted: collectFinalized(),
          operation: 'partition',
          pointers: [
            { index: j, label: 'j' },
            { index: high, label: 'pivot' },
            ...(i >= low ? [{ index: i, label: 'i' }] : []),
          ],
          meta: {
            phase: 'Partition',
            range: formatRange(low, high),
            pivot: `${pivotValue} @ ${high}`,
            i: String(i),
            j: String(j),
            comparison: `${value} > ${pivotValue}`,
          },
        })
      }
    }

    const pivotIndex = i + 1
    swap(array, pivotIndex, high)

    steps.push({
      id: nextId('place-pivot'),
      title: 'Place the pivot after the left region',
      explanation: `Place the pivot after the elements assigned to the left region by swapping index ${pivotIndex} with the pivot at index ${high}.`,
      detail: `Array now: ${formatArray(array)}`,
      array: clone(array),
      highlighted: rangeIndices(low, high),
      left: pivotIndex > low ? rangeIndices(low, pivotIndex - 1) : [],
      right: pivotIndex < high ? rangeIndices(pivotIndex + 1, high) : [],
      swapped: pivotIndex === high ? [pivotIndex] : [pivotIndex, high],
      candidate: [pivotIndex],
      sorted: collectFinalized(),
      operation: 'swap',
      pointers: [
        { index: pivotIndex, label: 'pivot' },
        { index: low, label: 'low' },
        { index: high, label: 'high' },
      ],
      meta: {
        phase: 'Partition',
        range: formatRange(low, high),
        pivot: `${pivotValue} @ ${pivotIndex}`,
        i: String(i),
        j: '—',
        comparison: '—',
      },
    })

    finalized.add(pivotIndex)

    steps.push({
      id: nextId('pivot-final'),
      title: 'The pivot is now in its final position',
      explanation: `The pivot ${pivotValue} is now in its final sorted position at index ${pivotIndex}. Values to its left are ≤ ${pivotValue}; values to its right are > ${pivotValue}. Those sides are not fully sorted yet.`,
      detail:
        pivotIndex > low || pivotIndex < high
          ? 'Next, recursively process the remaining unsorted partitions on either side.'
          : 'No unsorted partitions remain beside this pivot.',
      array: clone(array),
      left: pivotIndex > low ? rangeIndices(low, pivotIndex - 1) : [],
      right: pivotIndex < high ? rangeIndices(pivotIndex + 1, high) : [],
      found: [pivotIndex],
      sorted: collectFinalized().filter((index) => index !== pivotIndex),
      operation: 'mark-sorted',
      pointers: [{ index: pivotIndex, label: 'final' }],
      meta: {
        phase: 'Pivot placed',
        range: formatRange(low, high),
        pivot: `${pivotValue} @ ${pivotIndex}`,
        i: String(i),
        j: '—',
        comparison: '—',
      },
    })

    return pivotIndex
  }

  function sortRange(low: number, high: number) {
    if (low > high) {
      return
    }

    if (low === high) {
      finalized.add(low)
      steps.push({
        id: nextId('base'),
        title: 'Single-element partition is already sorted',
        explanation: `A partition with one element is already sorted. Value ${array[low]} at index ${low} needs no further work.`,
        detail: `Base case at ${formatRange(low, high)}`,
        array: clone(array),
        sorted: collectFinalized(),
        active: [low],
        operation: 'mark-sorted',
        pointers: [{ index: low, label: 'base' }],
        meta: {
          phase: 'Base case',
          range: formatRange(low, high),
          pivot: `${array[low]} @ ${low}`,
          i: '—',
          j: '—',
          comparison: '—',
        },
      })
      return
    }

    steps.push({
      id: nextId('range'),
      title: 'Process the current partition',
      explanation: `Recursively process the remaining unsorted partition covering ${formatRange(low, high)}: ${formatArray(array.slice(low, high + 1))}.`,
      detail: 'Choose a pivot, partition, then recurse on each side.',
      array: clone(array),
      highlighted: rangeIndices(low, high),
      sorted: collectFinalized(),
      operation: 'partition',
      pointers: [
        { index: low, label: 'low' },
        { index: high, label: 'high' },
      ],
      meta: {
        phase: 'Recurse',
        range: formatRange(low, high),
        pivot: '—',
        i: '—',
        j: '—',
        comparison: '—',
      },
    })

    const pivotIndex = partitionRange(low, high)
    sortRange(low, pivotIndex - 1)
    sortRange(pivotIndex + 1, high)
  }

  sortRange(0, n - 1)

  // Mark any remaining unfinalized indices (should already be covered).
  for (let index = 0; index < n; index += 1) {
    finalized.add(index)
  }

  steps.push({
    id: 'quick-done',
    title: 'The array is completely sorted',
    explanation:
      'Every partition finished placing its pivot, and the recursive subranges are resolved. The entire array is now ordered.',
    detail: `Original: ${formatArray(original)} → Sorted: ${formatArray(array)}`,
    array: clone(array),
    sorted: rangeIndices(0, n - 1),
    operation: 'complete',
    meta: {
      phase: 'Done',
      range: formatRange(0, n - 1),
      pivot: '—',
      i: '—',
      j: '—',
      comparison: '—',
    },
  })

  return steps
}
