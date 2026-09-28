import type { VisualizationStep } from '../components/visualizations/types'
import { formatArray } from '../components/visualizations/utils'

/** Default array for the sorting visualizer playground. */
export const SORTING_DEMO_DEFAULT_ARRAY = [5, 2, 8, 1, 6] as const

export const SORTING_DEMO_PRESETS = [
  {
    id: 'default',
    label: 'Demo [5, 2, 8, 1, 6]',
    values: SORTING_DEMO_DEFAULT_ARRAY,
  },
  {
    id: 'small',
    label: 'Small [4, 1, 3]',
    values: [4, 1, 3] as const,
  },
  {
    id: 'nearly-sorted',
    label: 'Nearly sorted [1, 3, 2, 4, 5]',
    values: [1, 3, 2, 4, 5] as const,
  },
] as const

function rangeIndices(start: number, end: number): number[] {
  if (end < start) {
    return []
  }
  return Array.from({ length: end - start + 1 }, (_, offset) => start + offset)
}

function swapInPlace(array: number[], left: number, right: number): void {
  ;[array[left], array[right]] = [array[right], array[left]]
}

/**
 * Builds a short, predefined sorting-operations demonstration.
 *
 * This is intentionally NOT a complete sorting algorithm. It walks through
 * compare → swap → candidate → move → mark-sorted → complete so the shared
 * visualization engine can exercise sorting-specific states.
 */
export function buildSortingDemoSteps(
  input: readonly number[],
): VisualizationStep[] {
  const original = [...input]
  const array = [...original]
  const n = array.length
  const steps: VisualizationStep[] = []

  steps.push({
    id: 'sorting-demo-start',
    title: 'Ready to sort',
    explanation: `Start with ${formatArray(array)}. This demo shows the visual states sorting lessons will use — compare, swap, move, candidate, and sorted — without running a full sorting algorithm.`,
    detail: 'Playback, speed, and reset use the same controls as search lessons.',
    array: [...array],
    highlighted: rangeIndices(0, n - 1),
    meta: { kind: 'sorting-demo' },
  })

  if (n === 0) {
    steps.push({
      id: 'sorting-demo-empty',
      title: 'Empty array',
      explanation: 'There are no elements to rearrange.',
      array: [],
      operation: 'complete',
    })
    return steps
  }

  if (n === 1) {
    steps.push({
      id: 'sorting-demo-single-sorted',
      title: 'Single element is sorted',
      explanation: `A one-element array is already sorted. Mark index 0 as sorted.`,
      array: [...array],
      sorted: [0],
      operation: 'mark-sorted',
      pointers: [{ index: 0, label: 'sorted' }],
    })
    steps.push({
      id: 'sorting-demo-single-done',
      title: 'Demo complete',
      explanation: 'Sorting visualization states are ready for future algorithm lessons.',
      array: [...array],
      sorted: [0],
      operation: 'complete',
    })
    return steps
  }

  // --- Compare first pair ---
  const left = 0
  const right = 1
  steps.push({
    id: 'sorting-demo-compare-0',
    title: `Compare ${array[left]} and ${array[right]}`,
    explanation: `Highlight neighboring values at indices ${left} and ${right}. Sorting algorithms repeatedly compare pairs like this to decide whether to swap.`,
    detail: `${array[left]} ${array[left] > array[right] ? '>' : array[left] < array[right] ? '<' : '='} ${array[right]}`,
    array: [...array],
    compared: [left, right],
    highlighted: rangeIndices(0, n - 1),
    operation: 'compare',
    pointers: [
      { index: left, label: 'a' },
      { index: right, label: 'b' },
    ],
    meta: { left: array[left], right: array[right] },
  })

  // --- Swap if out of order ---
  if (array[left] > array[right]) {
    const beforeLeft = array[left]
    const beforeRight = array[right]
    swapInPlace(array, left, right)
    steps.push({
      id: 'sorting-demo-swap-0',
      title: `Swap ${beforeLeft} ↔ ${beforeRight}`,
      explanation: `${beforeLeft} is larger than ${beforeRight}, so they exchange positions. Swap highlights animate the two cells.`,
      detail: `Array is now ${formatArray(array)}`,
      array: [...array],
      swapped: [left, right],
      operation: 'swap',
      pointers: [
        { index: left, label: 'L' },
        { index: right, label: 'R' },
      ],
    })
  } else {
    steps.push({
      id: 'sorting-demo-no-swap-0',
      title: 'Already in order',
      explanation: `${array[left]} is not greater than ${array[right]}, so no swap is needed. Comparisons do not always produce a swap.`,
      array: [...array],
      compared: [left, right],
      operation: 'compare',
    })
  }

  // --- Active range (unsorted portion) ---
  const rangeStart = 0
  const rangeEnd = Math.max(n - 2, 0)
  steps.push({
    id: 'sorting-demo-range',
    title: 'Highlight the active range',
    explanation: `Many sorting algorithms work on an unsorted window. Here the active range is indices ${rangeStart}–${rangeEnd}. Soft highlights show that window.`,
    array: [...array],
    highlighted: rangeIndices(rangeStart, rangeEnd),
    active: [rangeStart],
    pointers: [
      { index: rangeStart, label: 'start' },
      { index: rangeEnd, label: 'end' },
    ],
    meta: { rangeStart, rangeEnd },
  })

  // --- Minimum candidate scan (selection-style demo) ---
  let minIndex = rangeStart
  steps.push({
    id: 'sorting-demo-candidate-start',
    title: 'Track a minimum candidate',
    explanation: `Assume the first value in the range (${array[minIndex]} at index ${minIndex}) is the current minimum. Candidate highlights mark that choice.`,
    array: [...array],
    highlighted: rangeIndices(rangeStart, n - 1),
    candidate: [minIndex],
    active: [minIndex],
    pointers: [{ index: minIndex, label: 'min' }],
  })

  for (let j = rangeStart + 1; j < n; j += 1) {
    steps.push({
      id: `sorting-demo-candidate-compare-${j}`,
      title: `Compare with index ${j}`,
      explanation: `Compare ${array[j]} with the current minimum ${array[minIndex]}. Both cells are highlighted as a comparison pair.`,
      array: [...array],
      highlighted: rangeIndices(rangeStart, n - 1),
      compared: [minIndex, j],
      operation: 'compare',
      pointers: [
        { index: minIndex, label: 'min' },
        { index: j, label: 'j' },
      ],
    })

    if (array[j] < array[minIndex]) {
      minIndex = j
      steps.push({
        id: `sorting-demo-candidate-update-${j}`,
        title: `New minimum: ${array[minIndex]}`,
        explanation: `${array[minIndex]} is smaller, so the candidate moves to index ${minIndex}.`,
        array: [...array],
        highlighted: rangeIndices(rangeStart, n - 1),
        candidate: [minIndex],
        active: [minIndex],
        pointers: [{ index: minIndex, label: 'min' }],
      })
    }
  }

  if (minIndex !== rangeStart) {
    const beforeA = array[rangeStart]
    const beforeB = array[minIndex]
    swapInPlace(array, rangeStart, minIndex)
    steps.push({
      id: 'sorting-demo-candidate-swap',
      title: `Swap minimum into place`,
      explanation: `Move the minimum ${beforeB} to the front of the range by swapping with ${beforeA}.`,
      detail: `Array is now ${formatArray(array)}`,
      array: [...array],
      swapped: [rangeStart, minIndex],
      operation: 'swap',
      pointers: [
        { index: rangeStart, label: 'pos' },
        { index: minIndex, label: 'min' },
      ],
    })
  }

  // --- Mark first element sorted ---
  steps.push({
    id: 'sorting-demo-mark-sorted-0',
    title: 'Mark the first element sorted',
    explanation: `${array[0]} is now in its final position. Sorted highlights lock finished elements so learners can see progress grow.`,
    array: [...array],
    sorted: [0],
    highlighted: rangeIndices(1, n - 1),
    operation: 'mark-sorted',
    pointers: [{ index: 0, label: 'sorted' }],
  })

  // --- Move / shift demonstration (insertion-style) ---
  if (n >= 3) {
    const keyIndex = Math.min(2, n - 1)
    const key = array[keyIndex]
    const insertAt = 1

    steps.push({
      id: 'sorting-demo-move-pick',
      title: `Pick a key to move: ${key}`,
      explanation: `Treat ${key} at index ${keyIndex} as a key that needs to shift left into the sorted side — the same idea Insertion Sort uses.`,
      array: [...array],
      sorted: [0],
      active: [keyIndex],
      moving: [keyIndex],
      operation: 'move',
      pointers: [{ index: keyIndex, label: 'key' }],
      indexLabels: { [keyIndex]: 'key' },
    })

    if (keyIndex > insertAt) {
      // Shift neighbors right visually by walking the key left one step at a time.
      for (let from = keyIndex; from > insertAt; from -= 1) {
        const to = from - 1
        const movingValue = array[from]
        swapInPlace(array, from, to)
        steps.push({
          id: `sorting-demo-move-${from}-to-${to}`,
          title: `Move ${movingValue} left`,
          explanation: `Shift ${movingValue} from index ${from} to index ${to}. Moving highlights show the element in transit.`,
          detail: `Array is now ${formatArray(array)}`,
          array: [...array],
          sorted: [0],
          moving: [to],
          active: [to],
          operation: 'move',
          pointers: [{ index: to, label: 'key' }],
        })
      }
    }

    steps.push({
      id: 'sorting-demo-mark-sorted-prefix',
      title: 'Grow the sorted prefix',
      explanation: `After the move, mark indices 0–${Math.min(2, n - 1)} as sorted. Future sorting lessons will grow this region pass by pass.`,
      array: [...array],
      sorted: rangeIndices(0, Math.min(2, n - 1)),
      highlighted: rangeIndices(Math.min(3, n - 1), n - 1),
      operation: 'mark-sorted',
    })
  }

  // --- Final compare toward the end (optional polish) ---
  if (n >= 4) {
    const i = n - 2
    const j = n - 1
    steps.push({
      id: 'sorting-demo-tail-compare',
      title: `Compare the last pair`,
      explanation: `One more comparison at the end of the array: ${array[i]} vs ${array[j]}.`,
      array: [...array],
      sorted: rangeIndices(0, Math.min(2, n - 1)),
      compared: [i, j],
      operation: 'compare',
      pointers: [
        { index: i, label: 'a' },
        { index: j, label: 'b' },
      ],
    })

    if (array[i] > array[j]) {
      const a = array[i]
      const b = array[j]
      swapInPlace(array, i, j)
      steps.push({
        id: 'sorting-demo-tail-swap',
        title: `Swap ${a} ↔ ${b}`,
        explanation: `They were out of order, so swap them.`,
        array: [...array],
        sorted: rangeIndices(0, Math.min(2, n - 1)),
        swapped: [i, j],
        operation: 'swap',
      })
    }
  }

  // --- Complete ---
  steps.push({
    id: 'sorting-demo-complete',
    title: 'Demo complete',
    explanation: `All sorting visual states have been demonstrated. Original array was ${formatArray(original)}; current array is ${formatArray(array)}. Real sorting lessons will generate longer step sequences from actual algorithms.`,
    detail: 'Use Reset, change the array, or adjust playback speed to explore again.',
    array: [...array],
    sorted: rangeIndices(0, n - 1),
    operation: 'complete',
    meta: {
      original: formatArray(original),
      current: formatArray(array),
    },
  })

  return steps
}
