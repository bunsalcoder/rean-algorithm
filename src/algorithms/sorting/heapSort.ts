import type { VisualizationStep } from '../../components/visualizations/types'
import { formatArray } from '../../components/visualizations/utils'

/** Default lesson array from the Heap Sort walkthrough. */
export const HEAP_SORT_DEFAULT_ARRAY = [5, 3, 8, 2, 4] as const

export const HEAP_SORT_SORTED_ARRAY = [1, 2, 3, 4, 5] as const

export const HEAP_SORT_ARRAY_PRESETS = [
  {
    id: 'lesson-default',
    label: 'Lesson [5, 3, 8, 2, 4]',
    values: HEAP_SORT_DEFAULT_ARRAY,
  },
  {
    id: 'extra-example',
    label: 'Example [8, 3, 5, 1, 7, 2]',
    values: [8, 3, 5, 1, 7, 2] as const,
  },
  {
    id: 'already-sorted',
    label: 'Already sorted [1, 2, 3, 4, 5]',
    values: HEAP_SORT_SORTED_ARRAY,
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

function swap(array: number[], a: number, b: number) {
  ;[array[a], array[b]] = [array[b], array[a]]
}

function sortedRegion(n: number, heapSize: number): number[] {
  if (heapSize >= n) {
    return []
  }
  return rangeIndices(heapSize, n - 1)
}

function heapRegion(heapSize: number): number[] {
  if (heapSize <= 0) {
    return []
  }
  return rangeIndices(0, heapSize - 1)
}

/**
 * Educational Max Heap Sort.
 * Copies the input so the original array is never mutated.
 */
export function heapSort(array: readonly number[]): number[] {
  const result = clone(array)
  const n = result.length

  function heapify(heapSize: number, root: number) {
    let largest = root
    const left = 2 * root + 1
    const right = 2 * root + 2

    if (left < heapSize && result[left] > result[largest]) {
      largest = left
    }

    if (right < heapSize && result[right] > result[largest]) {
      largest = right
    }

    if (largest !== root) {
      swap(result, root, largest)
      heapify(heapSize, largest)
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i -= 1) {
    heapify(n, i)
  }

  for (let end = n - 1; end > 0; end -= 1) {
    swap(result, 0, end)
    heapify(end, 0)
  }

  return result
}

/**
 * Builds a VisualizationStep sequence for Heap Sort.
 *
 * Emphasizes Max Heap structure: build the heap, extract the maximum
 * to the sorted region, then heapify the root to restore the property.
 */
export function buildHeapSortSteps(
  input: readonly number[],
): VisualizationStep[] {
  const original = clone(input)
  const array = clone(input)
  const n = array.length
  const steps: VisualizationStep[] = []
  let stepCounter = 0

  function nextId(prefix: string): string {
    stepCounter += 1
    return `heap-${prefix}-${stepCounter}`
  }

  function metaBase(
    phase: string,
    heapSize: number,
    extras: Record<string, string | number | boolean | null> = {},
  ) {
    return {
      phase,
      heapSize,
      root: heapSize > 0 ? `${array[0]} @ 0` : '—',
      ...extras,
    }
  }

  steps.push({
    id: 'heap-start',
    title: 'Start with the unsorted array',
    explanation:
      n <= 1
        ? `The array ${formatArray(array)} is already sorted — there is nothing to heapify.`
        : `Start with ${formatArray(array)}. Heap Sort first builds a Max Heap so the largest value sits at the root (index 0), then repeatedly extracts that maximum into a growing sorted region at the end.`,
    detail:
      n > 1
        ? 'A Max Heap stores parent ≥ children. In a zero-based array: left = 2·i+1, right = 2·i+2, parent = ⌊(i−1)/2⌋.'
        : undefined,
    array: clone(array),
    highlighted: n > 0 ? rangeIndices(0, n - 1) : undefined,
    meta: metaBase(n <= 1 ? 'Done' : 'Ready', n, {
      current: '—',
      child: '—',
      comparison: '—',
    }),
  })

  if (n <= 1) {
    steps.push({
      id: 'heap-done',
      title: 'All values are now sorted',
      explanation: `Original: ${formatArray(original)}. Sorted: ${formatArray(array)}.`,
      array: clone(array),
      sorted: n === 1 ? [0] : [],
      operation: 'complete',
      meta: metaBase('Done', 0, {
        current: '—',
        child: '—',
        comparison: '—',
      }),
    })
    return steps
  }

  function heapify(
    heapSize: number,
    root: number,
    phase: 'Building Max Heap' | 'Restore Heap',
  ) {
    const left = 2 * root + 1
    const right = 2 * root + 2
    let largest = root

    steps.push({
      id: nextId('heapify'),
      title: `Heapify at index ${root}`,
      explanation: `Heapify the subtree rooted at index ${root} (value ${array[root]}) so the Max Heap property holds for this node and its descendants within heap size ${heapSize}.`,
      detail: `Left child index ${left}${left < heapSize ? ` = ${array[left]}` : ' (none)'} · Right child index ${right}${right < heapSize ? ` = ${array[right]}` : ' (none)'}`,
      array: clone(array),
      highlighted: heapRegion(heapSize),
      active: [root],
      sorted: sortedRegion(n, heapSize),
      operation: 'heapify',
      pointers: [{ index: root, label: 'root' }],
      meta: metaBase(phase, heapSize, {
        current: `${array[root]} @ ${root}`,
        child: '—',
        comparison: '—',
      }),
    })

    if (left < heapSize) {
      steps.push({
        id: nextId('compare-left'),
        title: `Compare node ${array[root]} with left child ${array[left]}`,
        explanation: `Compare the current node ${array[root]} at index ${root} with its left child ${array[left]} at index ${left}.`,
        detail: `${array[left]} ${array[left] > array[root] ? '>' : array[left] < array[root] ? '<' : '='} ${array[root]}`,
        array: clone(array),
        highlighted: heapRegion(heapSize),
        compared: [root, left],
        sorted: sortedRegion(n, heapSize),
        operation: 'compare',
        pointers: [
          { index: root, label: 'node' },
          { index: left, label: 'left' },
        ],
        meta: metaBase(phase, heapSize, {
          current: `${array[root]} @ ${root}`,
          child: `${array[left]} @ ${left}`,
          comparison: `${array[left]} vs ${array[root]}`,
        }),
      })

      if (array[left] > array[largest]) {
        largest = left
        steps.push({
          id: nextId('select-left'),
          title: `${array[left]} is larger so far`,
          explanation: `The left child ${array[left]} is greater than ${array[root]}, so it becomes the current largest candidate.`,
          array: clone(array),
          highlighted: heapRegion(heapSize),
          candidate: [left],
          active: [root],
          sorted: sortedRegion(n, heapSize),
          operation: 'compare',
          pointers: [
            { index: root, label: 'node' },
            { index: left, label: 'largest' },
          ],
          meta: metaBase(phase, heapSize, {
            current: `${array[root]} @ ${root}`,
            child: `${array[left]} @ ${left}`,
            comparison: `${array[left]} > ${array[root]}`,
          }),
        })
      }
    }

    if (right < heapSize) {
      const compareAgainst = largest
      steps.push({
        id: nextId('compare-right'),
        title: `Compare with right child ${array[right]}`,
        explanation: `Compare the current largest candidate ${array[compareAgainst]} at index ${compareAgainst} with the right child ${array[right]} at index ${right}.`,
        detail: `${array[right]} ${array[right] > array[compareAgainst] ? '>' : array[right] < array[compareAgainst] ? '<' : '='} ${array[compareAgainst]}`,
        array: clone(array),
        highlighted: heapRegion(heapSize),
        compared: [compareAgainst, right],
        candidate: compareAgainst !== root ? [compareAgainst] : undefined,
        sorted: sortedRegion(n, heapSize),
        operation: 'compare',
        pointers: [
          { index: compareAgainst, label: 'largest' },
          { index: right, label: 'right' },
        ],
        meta: metaBase(phase, heapSize, {
          current: `${array[root]} @ ${root}`,
          child: `${array[right]} @ ${right}`,
          comparison: `${array[right]} vs ${array[compareAgainst]}`,
        }),
      })

      if (array[right] > array[largest]) {
        largest = right
        steps.push({
          id: nextId('select-right'),
          title: `${array[right]} is the larger child`,
          explanation: `The right child ${array[right]} is greater than the current largest candidate, so it becomes the selected larger child.`,
          array: clone(array),
          highlighted: heapRegion(heapSize),
          candidate: [right],
          active: [root],
          sorted: sortedRegion(n, heapSize),
          operation: 'compare',
          pointers: [
            { index: root, label: 'node' },
            { index: right, label: 'largest' },
          ],
          meta: metaBase(phase, heapSize, {
            current: `${array[root]} @ ${root}`,
            child: `${array[right]} @ ${right}`,
            comparison: `${array[right]} is larger`,
          }),
        })
      }
    }

    if (largest !== root) {
      const parentValue = array[root]
      const childValue = array[largest]

      steps.push({
        id: nextId('swap'),
        title: `${childValue} is larger, so swap them`,
        explanation: `${childValue} at index ${largest} is larger than ${parentValue} at index ${root}, so swap them to move the larger value upward toward the root of this subtree.`,
        detail: `Swap indices ${root} and ${largest}`,
        array: clone(array),
        highlighted: heapRegion(heapSize),
        compared: [root, largest],
        candidate: [largest],
        sorted: sortedRegion(n, heapSize),
        operation: 'compare',
        pointers: [
          { index: root, label: 'node' },
          { index: largest, label: 'larger' },
        ],
        meta: metaBase(phase, heapSize, {
          current: `${parentValue} @ ${root}`,
          child: `${childValue} @ ${largest}`,
          comparison: `${childValue} > ${parentValue}`,
        }),
      })

      swap(array, root, largest)

      steps.push({
        id: nextId('swapped'),
        title: `Swap ${parentValue} and ${childValue}`,
        explanation: `After the swap, ${childValue} sits at index ${root}. Continue heapifying downward from index ${largest} because the Max Heap property may still be violated there.`,
        detail: `Array now: ${formatArray(array)}`,
        array: clone(array),
        highlighted: heapRegion(heapSize),
        swapped: [root, largest],
        sorted: sortedRegion(n, heapSize),
        operation: 'swap',
        pointers: [
          { index: root, label: 'up' },
          { index: largest, label: 'down' },
        ],
        meta: metaBase(phase, heapSize, {
          current: `${array[root]} @ ${root}`,
          child: `${array[largest]} @ ${largest}`,
          comparison: 'swapped',
        }),
      })

      heapify(heapSize, largest, phase)
    } else {
      steps.push({
        id: nextId('ok'),
        title: 'Max Heap property holds here',
        explanation: `Node ${array[root]} at index ${root} is already greater than or equal to its children within the heap. No swap is needed at this subtree root.`,
        detail:
          phase === 'Building Max Heap'
            ? 'Continue building the Max Heap from the remaining parent nodes.'
            : 'Max Heap property has been restored for this path.',
        array: clone(array),
        highlighted: heapRegion(heapSize),
        found: [root],
        sorted: sortedRegion(n, heapSize),
        operation: 'heapify',
        pointers: [{ index: root, label: 'ok' }],
        meta: metaBase(phase, heapSize, {
          current: `${array[root]} @ ${root}`,
          child: '—',
          comparison: 'property holds',
        }),
      })
    }
  }

  // —— Phase 1: Build Max Heap ——
  steps.push({
    id: nextId('build-start'),
    title: 'Building Max Heap',
    explanation: `Build a Max Heap from ${formatArray(array)}. Start at the last non-leaf parent (index ${Math.floor(n / 2) - 1}) and heapify each parent down to the root.`,
    detail: 'After this phase, the largest value will be at index 0.',
    array: clone(array),
    highlighted: rangeIndices(0, n - 1),
    operation: 'build-heap',
    meta: metaBase('Building Max Heap', n, {
      current: '—',
      child: '—',
      comparison: '—',
    }),
  })

  for (let i = Math.floor(n / 2) - 1; i >= 0; i -= 1) {
    heapify(n, i, 'Building Max Heap')
  }

  steps.push({
    id: nextId('build-done'),
    title: 'The root contains the largest unsorted value',
    explanation: `Max Heap construction finished. Array is now ${formatArray(array)}. The root (index 0) holds ${array[0]} — the largest value in the heap.`,
    detail: 'Next, move that maximum into the sorted region at the end of the array.',
    array: clone(array),
    highlighted: rangeIndices(0, n - 1),
    candidate: [0],
    operation: 'build-heap',
    pointers: [{ index: 0, label: 'max' }],
    meta: metaBase('Building Max Heap', n, {
      current: `${array[0]} @ 0`,
      child: '—',
      comparison: '—',
    }),
  })

  // —— Phase 2+: Extract maximum + restore ——
  for (let end = n - 1; end > 0; end -= 1) {
    const maxValue = array[0]

    steps.push({
      id: nextId('extract'),
      title: 'Move the maximum value to the sorted region',
      explanation: `The root ${maxValue} is the largest remaining unsorted value. Swap it with the last unsorted element at index ${end} (${array[end]}) to place it into the sorted region.`,
      detail: `Heap size will shrink from ${end + 1} to ${end}.`,
      array: clone(array),
      highlighted: heapRegion(end + 1),
      candidate: [0],
      active: [end],
      sorted: sortedRegion(n, end + 1),
      operation: 'extract-max',
      pointers: [
        { index: 0, label: 'max' },
        { index: end, label: 'end' },
      ],
      meta: metaBase('Extract Maximum', end + 1, {
        current: `${maxValue} @ 0`,
        child: '—',
        comparison: `swap with ${array[end]} @ ${end}`,
      }),
    })

    swap(array, 0, end)

    steps.push({
      id: nextId('extracted'),
      title: 'Reduce the heap size',
      explanation: `${maxValue} is now in the sorted region at index ${end}. Reduce the heap size to ${end} so future heapify calls ignore the sorted suffix.`,
      detail: `Array: ${formatArray(array.slice(0, end))} | ${formatArray(array.slice(end))}`,
      array: clone(array),
      highlighted: heapRegion(end),
      swapped: [0, end],
      sorted: sortedRegion(n, end),
      operation: 'extract-max',
      pointers: [
        { index: 0, label: 'root' },
        { index: end, label: 'sorted' },
      ],
      meta: metaBase('Extract Maximum', end, {
        current: `${array[0]} @ 0`,
        child: '—',
        comparison: '—',
      }),
    })

    if (end > 1) {
      steps.push({
        id: nextId('restore'),
        title: 'Heapify the root to restore the Max Heap',
        explanation: `The value ${array[0]} at the root may violate the Max Heap property. Heapify from index 0 with heap size ${end} to restore it.`,
        array: clone(array),
        highlighted: heapRegion(end),
        active: [0],
        sorted: sortedRegion(n, end),
        operation: 'heapify',
        pointers: [{ index: 0, label: 'root' }],
        meta: metaBase('Restore Heap', end, {
          current: `${array[0]} @ 0`,
          child: '—',
          comparison: '—',
        }),
      })

      heapify(end, 0, 'Restore Heap')

      steps.push({
        id: nextId('restored'),
        title: 'Max Heap property has been restored',
        explanation: `The remaining heap ${formatArray(array.slice(0, end))} again satisfies parent ≥ children. The new root ${array[0]} is the next maximum to extract.`,
        array: clone(array),
        highlighted: heapRegion(end),
        candidate: [0],
        sorted: sortedRegion(n, end),
        operation: 'heapify',
        pointers: [{ index: 0, label: 'max' }],
        meta: metaBase('Restore Heap', end, {
          current: `${array[0]} @ 0`,
          child: '—',
          comparison: '—',
        }),
      })
    } else {
      // Only one heap element left — it is already in place after the swap.
      steps.push({
        id: nextId('last'),
        title: 'The final heap element is already in place',
        explanation: `Only one unsorted value remains at index 0. After the last extraction, the entire array ${formatArray(array)} is sorted.`,
        array: clone(array),
        sorted: rangeIndices(0, n - 1),
        operation: 'mark-sorted',
        meta: metaBase('Complete', 0, {
          current: '—',
          child: '—',
          comparison: '—',
        }),
      })
    }
  }

  steps.push({
    id: 'heap-done',
    title: 'All values are now sorted',
    explanation:
      'Every maximum was moved into the sorted region and the heap was restored after each extraction. The entire array is now ordered.',
    detail: `Original: ${formatArray(original)} → Sorted: ${formatArray(array)}`,
    array: clone(array),
    sorted: rangeIndices(0, n - 1),
    operation: 'complete',
    meta: metaBase('Done', 0, {
      current: '—',
      child: '—',
      comparison: '—',
    }),
  })

  return steps
}
