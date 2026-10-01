import type { VisualizationStep } from '../../components/visualizations/types'
import { formatArray } from '../../components/visualizations/utils'

/** Default lesson array from the Merge Sort walkthrough. */
export const MERGE_SORT_DEFAULT_ARRAY = [5, 3, 8, 2, 4] as const

export const MERGE_SORT_SORTED_ARRAY = [1, 2, 3, 4, 5] as const

export const MERGE_SORT_ARRAY_PRESETS = [
  {
    id: 'lesson-default',
    label: 'Lesson [5, 3, 8, 2, 4]',
    values: MERGE_SORT_DEFAULT_ARRAY,
  },
  {
    id: 'extra-example',
    label: 'Example [8, 3, 5, 1, 7, 2]',
    values: [8, 3, 5, 1, 7, 2] as const,
  },
  {
    id: 'already-sorted',
    label: 'Already sorted [1, 2, 3, 4, 5]',
    values: MERGE_SORT_SORTED_ARRAY,
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

function merge(
  left: readonly number[],
  right: readonly number[],
): number[] {
  const result: number[] = []
  let i = 0
  let j = 0

  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i])
      i += 1
    } else {
      result.push(right[j])
      j += 1
    }
  }

  while (i < left.length) {
    result.push(left[i])
    i += 1
  }

  while (j < right.length) {
    result.push(right[j])
    j += 1
  }

  return result
}

/**
 * Educational Merge Sort.
 * Copies the input so the original array is never mutated.
 */
export function mergeSort(array: readonly number[]): number[] {
  if (array.length <= 1) {
    return clone(array)
  }

  const middle = Math.floor(array.length / 2)
  const left = mergeSort(array.slice(0, middle))
  const right = mergeSort(array.slice(middle))

  return merge(left, right)
}

/**
 * Builds a VisualizationStep sequence for Merge Sort.
 *
 * Emphasizes the Divide phase (recursive splitting) and the Merge phase
 * (comparing sorted halves and combining them). Pure data — no React state.
 */
export function buildMergeSortSteps(
  input: readonly number[],
): VisualizationStep[] {
  const original = clone(input)
  const array = clone(input)
  const n = array.length
  const steps: VisualizationStep[] = []
  const sortedRanges = new Set<string>()

  function rangeKey(lo: number, hi: number): string {
    return `${lo}:${hi}`
  }

  function collectSorted(): number[] {
    const indices = new Set<number>()
    for (const key of sortedRanges) {
      const [loText, hiText] = key.split(':')
      const lo = Number(loText)
      const hi = Number(hiText)
      for (const index of rangeIndices(lo, hi)) {
        indices.add(index)
      }
    }
    return [...indices].sort((a, b) => a - b)
  }

  function markSorted(lo: number, hi: number) {
    sortedRanges.add(rangeKey(lo, hi))
  }

  steps.push({
    id: 'merge-start',
    title: 'Start with the entire array',
    explanation:
      n <= 1
        ? `The array ${formatArray(array)} is already sorted — there is nothing to divide or merge.`
        : `Start with ${formatArray(array)}. Merge Sort uses Divide & Conquer: split the array into smaller pieces, sort those pieces, then merge them back together.`,
    detail:
      n > 1
        ? 'Phase plan: Split → Split → Split → Merge → Merge → Sorted'
        : undefined,
    array: clone(array),
    highlighted: n > 0 ? rangeIndices(0, n - 1) : undefined,
    meta: {
      phase: n <= 1 ? 'Done' : 'Divide',
      range: n > 0 ? formatRange(0, n - 1) : '—',
      left: '—',
      right: '—',
      comparison: '—',
      progress: '—',
    },
  })

  if (n <= 1) {
    if (n === 1) {
      markSorted(0, 0)
    }
    steps.push({
      id: 'merge-done',
      title: 'The array is completely sorted',
      explanation: `Original: ${formatArray(original)}. Sorted: ${formatArray(array)}.`,
      array: clone(array),
      sorted: n === 1 ? [0] : [],
      operation: 'complete',
      meta: {
        phase: 'Done',
        range: n === 1 ? '[0]' : '—',
        left: '—',
        right: '—',
        comparison: '—',
        progress: '—',
      },
    })
    return steps
  }

  let stepCounter = 0

  function nextId(prefix: string): string {
    stepCounter += 1
    return `merge-${prefix}-${stepCounter}`
  }

  function mergeRange(lo: number, mid: number, hi: number) {
    const leftPart = array.slice(lo, mid + 1)
    const rightPart = array.slice(mid + 1, hi + 1)
    const leftIndices = rangeIndices(lo, mid)
    const rightIndices = rangeIndices(mid + 1, hi)
    const total = hi - lo + 1
    const merged: number[] = []
    let i = 0
    let j = 0

    const outsideSorted = () =>
      collectSorted().filter((index) => index < lo || index > hi)

    steps.push({
      id: nextId('merge-begin'),
      title: 'Merge two sorted halves',
      explanation: `The left half ${formatArray(leftPart)} and the right half ${formatArray(rightPart)} are each sorted. Now merge them into one sorted section covering ${formatRange(lo, hi)}.`,
      detail: `Left ${formatRange(lo, mid)} · Right ${formatRange(mid + 1, hi)}`,
      array: clone(array),
      left: leftIndices,
      right: rightIndices,
      sorted: outsideSorted(),
      operation: 'merge',
      pointers: [
        { index: lo, label: 'L' },
        { index: mid, label: 'mid' },
        { index: hi, label: 'R' },
      ],
      meta: {
        phase: 'Merge',
        range: formatRange(lo, hi),
        left: formatRange(lo, mid),
        right: formatRange(mid + 1, hi),
        comparison: '—',
        progress: `0/${total}`,
      },
    })

    while (i < leftPart.length && j < rightPart.length) {
      const leftValue = leftPart[i]
      const rightValue = rightPart[j]
      const leftSource = lo + i
      const rightSource = mid + 1 + j

      steps.push({
        id: nextId('compare'),
        title: `Compare ${leftValue} and ${rightValue}`,
        explanation: `Compare the first remaining values of the two sorted halves: ${leftValue} (left) and ${rightValue} (right). Take the smaller value and place it into the merged result.`,
        detail: `${leftValue} ${leftValue <= rightValue ? '≤' : '>'} ${rightValue}`,
        array: clone(array),
        left: leftIndices,
        right: rightIndices,
        compared: [leftSource, rightSource],
        sorted: outsideSorted(),
        operation: 'compare',
        pointers: [
          { index: leftSource, label: 'left' },
          { index: rightSource, label: 'right' },
        ],
        meta: {
          phase: 'Merge',
          range: formatRange(lo, hi),
          left: formatRange(lo, mid),
          right: formatRange(mid + 1, hi),
          comparison: `${leftValue} vs ${rightValue}`,
          progress: `${merged.length}/${total}`,
        },
      })

      if (leftValue <= rightValue) {
        merged.push(leftValue)
        i += 1

        steps.push({
          id: nextId('take-left'),
          title: `Take ${leftValue} from the left`,
          explanation: `${leftValue} is smaller (or equal), so add it to the temporary merged result. The original halves stay visible until the merge finishes writing back.`,
          detail: `Merged buffer: ${formatArray(merged)}`,
          array: clone(array),
          left: leftIndices,
          right: rightIndices,
          active: [leftSource],
          moving: [leftSource],
          sorted: outsideSorted(),
          operation: 'move',
          pointers: [{ index: leftSource, label: 'take' }],
          meta: {
            phase: 'Merge',
            range: formatRange(lo, hi),
            left: formatRange(lo, mid),
            right: formatRange(mid + 1, hi),
            comparison: `${leftValue} vs ${rightValue}`,
            progress: `${merged.length}/${total}`,
          },
        })
      } else {
        merged.push(rightValue)
        j += 1

        steps.push({
          id: nextId('take-right'),
          title: `Take ${rightValue} from the right`,
          explanation: `${rightValue} is smaller, so add it to the temporary merged result. The original halves stay visible until the merge finishes writing back.`,
          detail: `Merged buffer: ${formatArray(merged)}`,
          array: clone(array),
          left: leftIndices,
          right: rightIndices,
          active: [rightSource],
          moving: [rightSource],
          sorted: outsideSorted(),
          operation: 'move',
          pointers: [{ index: rightSource, label: 'take' }],
          meta: {
            phase: 'Merge',
            range: formatRange(lo, hi),
            left: formatRange(lo, mid),
            right: formatRange(mid + 1, hi),
            comparison: `${leftValue} vs ${rightValue}`,
            progress: `${merged.length}/${total}`,
          },
        })
      }
    }

    while (i < leftPart.length) {
      const value = leftPart[i]
      const source = lo + i
      merged.push(value)
      i += 1

      steps.push({
        id: nextId('copy-left'),
        title: `Copy remaining ${value} from the left`,
        explanation:
          'The right half is exhausted. Copy the remaining values from the left half into the merged result.',
        detail: `Merged buffer: ${formatArray(merged)}`,
        array: clone(array),
        left: leftIndices,
        right: rightIndices,
        moving: [source],
        sorted: outsideSorted(),
        operation: 'move',
        pointers: [{ index: source, label: 'copy' }],
        meta: {
          phase: 'Merge',
          range: formatRange(lo, hi),
          left: formatRange(lo, mid),
          right: formatRange(mid + 1, hi),
          comparison: '—',
          progress: `${merged.length}/${total}`,
        },
      })
    }

    while (j < rightPart.length) {
      const value = rightPart[j]
      const source = mid + 1 + j
      merged.push(value)
      j += 1

      steps.push({
        id: nextId('copy-right'),
        title: `Copy remaining ${value} from the right`,
        explanation:
          'The left half is exhausted. Copy the remaining values from the right half into the merged result.',
        detail: `Merged buffer: ${formatArray(merged)}`,
        array: clone(array),
        left: leftIndices,
        right: rightIndices,
        moving: [source],
        sorted: outsideSorted(),
        operation: 'move',
        pointers: [{ index: source, label: 'copy' }],
        meta: {
          phase: 'Merge',
          range: formatRange(lo, hi),
          left: formatRange(lo, mid),
          right: formatRange(mid + 1, hi),
          comparison: '—',
          progress: `${merged.length}/${total}`,
        },
      })
    }

    for (let offset = 0; offset < merged.length; offset += 1) {
      array[lo + offset] = merged[offset]
    }

    steps.push({
      id: nextId('write-back'),
      title: 'Write the merged result back',
      explanation: `Copy the temporary merged result ${formatArray(merged)} back into indices ${formatRange(lo, hi)}. This is why this Merge Sort implementation uses O(n) extra memory.`,
      detail: `Array now: ${formatArray(array)}`,
      array: clone(array),
      left: leftIndices,
      right: rightIndices,
      moving: rangeIndices(lo, hi),
      found: rangeIndices(lo, hi),
      sorted: outsideSorted(),
      operation: 'move',
      pointers: [
        { index: lo, label: 'L' },
        { index: hi, label: 'R' },
      ],
      meta: {
        phase: 'Merge',
        range: formatRange(lo, hi),
        left: formatRange(lo, mid),
        right: formatRange(mid + 1, hi),
        comparison: '—',
        progress: `${total}/${total}`,
      },
    })

    markSorted(lo, hi)

    steps.push({
      id: nextId('merged'),
      title: 'The two sorted halves are now merged',
      explanation: `Range ${formatRange(lo, hi)} is now sorted: ${formatArray(array.slice(lo, hi + 1))}. Continue merging until the entire array is sorted.`,
      detail: `Array now: ${formatArray(array)}`,
      array: clone(array),
      sorted: collectSorted(),
      found: rangeIndices(lo, hi),
      operation: 'mark-sorted',
      pointers: [
        { index: lo, label: 'L' },
        { index: hi, label: 'R' },
      ],
      meta: {
        phase: 'Merge',
        range: formatRange(lo, hi),
        left: formatRange(lo, mid),
        right: formatRange(mid + 1, hi),
        comparison: '—',
        progress: `${total}/${total}`,
      },
    })
  }

  function sortRange(lo: number, hi: number, sideLabel: string) {
    if (lo >= hi) {
      if (lo === hi) {
        markSorted(lo, hi)
        steps.push({
          id: nextId('base'),
          title: 'Single-element piece is already sorted',
          explanation: `A one-element range is already sorted. Value ${array[lo]} at index ${lo} needs no further splitting.`,
          detail: `Base case at ${formatRange(lo, hi)}`,
          array: clone(array),
          sorted: collectSorted(),
          active: [lo],
          operation: 'mark-sorted',
          pointers: [{ index: lo, label: 'base' }],
          meta: {
            phase: 'Divide',
            range: formatRange(lo, hi),
            left: '—',
            right: '—',
            comparison: '—',
            progress: '—',
          },
        })
      }
      return
    }

    const mid = Math.floor((lo + hi) / 2)
    const leftIndices = rangeIndices(lo, mid)
    const rightIndices = rangeIndices(mid + 1, hi)

    steps.push({
      id: nextId('split'),
      title: 'Divide the array into two halves',
      explanation:
        sideLabel === 'root'
          ? `Divide the current range ${formatRange(lo, hi)} into a left half ${formatRange(lo, mid)} and a right half ${formatRange(mid + 1, hi)}.`
          : sideLabel === 'left'
            ? `Continue dividing the left half until each part contains one element. Split ${formatRange(lo, hi)} into ${formatRange(lo, mid)} and ${formatRange(mid + 1, hi)}.`
            : `Now divide the right half. Split ${formatRange(lo, hi)} into ${formatRange(lo, mid)} and ${formatRange(mid + 1, hi)}.`,
      detail: `Left ${formatArray(array.slice(lo, mid + 1))} · Right ${formatArray(array.slice(mid + 1, hi + 1))}`,
      array: clone(array),
      left: leftIndices,
      right: rightIndices,
      sorted: collectSorted(),
      operation: 'split',
      pointers: [
        { index: lo, label: 'L' },
        { index: mid, label: 'mid' },
        { index: hi, label: 'R' },
      ],
      meta: {
        phase: 'Divide',
        range: formatRange(lo, hi),
        left: formatRange(lo, mid),
        right: formatRange(mid + 1, hi),
        comparison: '—',
        progress: '—',
      },
    })

    sortRange(lo, mid, 'left')
    sortRange(mid + 1, hi, 'right')
    mergeRange(lo, mid, hi)
  }

  sortRange(0, n - 1, 'root')

  steps.push({
    id: 'merge-done',
    title: 'The array is completely sorted',
    explanation:
      'Every split eventually reached single elements, and every merge combined sorted halves. The entire array is now ordered.',
    detail: `Original: ${formatArray(original)} → Sorted: ${formatArray(array)}`,
    array: clone(array),
    sorted: rangeIndices(0, n - 1),
    operation: 'complete',
    meta: {
      phase: 'Done',
      range: formatRange(0, n - 1),
      left: '—',
      right: '—',
      comparison: '—',
      progress: `${n}/${n}`,
    },
  })

  return steps
}
