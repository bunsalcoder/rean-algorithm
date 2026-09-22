export const SELECTION_SORT_DEFAULT_ARRAY = [7, 4, 9, 2, 5] as const

export type SelectionSortPhase =
  | 'start'
  | 'pass-start'
  | 'compare'
  | 'update-min'
  | 'keep-min'
  | 'swap'
  | 'no-swap'
  | 'pass-complete'
  | 'done'

export type SelectionSortFrame = {
  array: number[]
  originalArray: number[]
  phase: SelectionSortPhase
  /** 1-based pass number currently in progress (or just finished). */
  pass: number
  totalPasses: number
  /** Index where the next minimum should be placed (outer loop i). */
  placeIndex: number | null
  /** Index currently being examined (inner loop j). */
  currentIndex: number | null
  /** Index of the smallest value found so far in this pass. */
  minIndex: number | null
  minValue: number | null
  /** Indices involved in the current swap, if any. */
  swapping: [number, number] | null
  /** Count of elements locked as sorted from the start. */
  sortedCount: number
  totalComparisons: number
  totalSwaps: number
  summary: string
  explanation: string
}

/**
 * Educational in-place Selection Sort used by the lesson code examples.
 * Prefer readability over micro-optimizations.
 */
export function selectionSort(array: number[]): number[] {
  const result = [...array]

  for (let i = 0; i < result.length; i += 1) {
    let minIndex = i

    for (let j = i + 1; j < result.length; j += 1) {
      if (result[j] < result[minIndex]) {
        minIndex = j
      }
    }

    if (minIndex !== i) {
      const temp = result[i]
      result[i] = result[minIndex]
      result[minIndex] = temp
    }
  }

  return result
}

function clone(array: readonly number[]): number[] {
  return [...array]
}

function formatArray(array: readonly number[]): string {
  return `[${array.join(', ')}]`
}

/**
 * Builds a step-by-step visualization sequence for classic Selection Sort.
 */
export function buildSelectionSortFrames(
  input: readonly number[],
): SelectionSortFrame[] {
  const originalArray = clone(input)
  const array = clone(input)
  const n = array.length
  const totalPasses = Math.max(n - 1, 0)
  const frames: SelectionSortFrame[] = []

  let totalComparisons = 0
  let totalSwaps = 0

  frames.push({
    array: clone(array),
    originalArray,
    phase: 'start',
    pass: totalPasses === 0 ? 0 : 1,
    totalPasses,
    placeIndex: n <= 1 ? null : 0,
    currentIndex: null,
    minIndex: n <= 1 ? null : 0,
    minValue: n <= 1 ? null : array[0],
    swapping: null,
    sortedCount: 0,
    totalComparisons,
    totalSwaps,
    summary: 'Start Selection Sort',
    explanation:
      n <= 1
        ? `The array ${formatArray(array)} is already sorted — there is nothing to rearrange.`
        : `We start with ${formatArray(array)}.\n\nSelection Sort finds the smallest element in the unsorted portion and moves it to the beginning of that portion.\n\nThe entire array begins as unsorted.`,
  })

  if (n <= 1) {
    frames.push({
      array: clone(array),
      originalArray,
      phase: 'done',
      pass: 0,
      totalPasses: 0,
      placeIndex: null,
      currentIndex: null,
      minIndex: null,
      minValue: null,
      swapping: null,
      sortedCount: n,
      totalComparisons,
      totalSwaps,
      summary: 'Array Sorted!',
      explanation: `Original:\n${formatArray(originalArray)}\n\nSorted:\n${formatArray(array)}\n\nArray Sorted!`,
    })
    return frames
  }

  for (let i = 0; i < n - 1; i += 1) {
    const pass = i + 1
    let minIndex = i

    frames.push({
      array: clone(array),
      originalArray,
      phase: 'pass-start',
      pass,
      totalPasses,
      placeIndex: i,
      currentIndex: i,
      minIndex,
      minValue: array[minIndex],
      swapping: null,
      sortedCount: i,
      totalComparisons,
      totalSwaps,
      summary: `Pass ${pass}: assume minimum is ${array[i]}`,
      explanation: `Pass ${pass} of ${totalPasses}.\n\nCurrent position = ${i}.\nMinimum index = ${i}.\n\nWe assume the first unsorted element (${array[i]}) is the smallest until we find a smaller one.\n\nSorted boundary: index ${i}`,
    })

    for (let j = i + 1; j < n; j += 1) {
      const currentValue = array[j]
      const currentMinValue = array[minIndex]
      totalComparisons += 1

      frames.push({
        array: clone(array),
        originalArray,
        phase: 'compare',
        pass,
        totalPasses,
        placeIndex: i,
        currentIndex: j,
        minIndex,
        minValue: currentMinValue,
        swapping: null,
        sortedCount: i,
        totalComparisons,
        totalSwaps,
        summary: `Comparing ${currentValue} with minimum ${currentMinValue}`,
        explanation: `We are searching for the smallest value in the unsorted portion.\n\nCurrent element: ${currentValue} (index ${j})\nCurrent minimum: ${currentMinValue} (index ${minIndex})\n\nCompare ${currentValue} with ${currentMinValue}.`,
      })

      if (currentValue < currentMinValue) {
        minIndex = j

        frames.push({
          array: clone(array),
          originalArray,
          phase: 'update-min',
          pass,
          totalPasses,
          placeIndex: i,
          currentIndex: j,
          minIndex,
          minValue: array[minIndex],
          swapping: null,
          sortedCount: i,
          totalComparisons,
          totalSwaps,
          summary: `New minimum: ${array[minIndex]}`,
          explanation: `${currentValue} is smaller than the current minimum ${currentMinValue}.\n\nUpdate the minimum to ${currentValue}.\n\nminIndex = ${minIndex}`,
        })
      } else {
        frames.push({
          array: clone(array),
          originalArray,
          phase: 'keep-min',
          pass,
          totalPasses,
          placeIndex: i,
          currentIndex: j,
          minIndex,
          minValue: array[minIndex],
          swapping: null,
          sortedCount: i,
          totalComparisons,
          totalSwaps,
          summary: `Keep minimum ${array[minIndex]}`,
          explanation: `${currentValue} is not smaller than the current minimum ${currentMinValue}.\n\nKeep minimum = ${currentMinValue} (index ${minIndex}).`,
        })
      }
    }

    const minValue = array[minIndex]

    if (minIndex !== i) {
      const left = array[i]
      array[i] = array[minIndex]
      array[minIndex] = left
      totalSwaps += 1

      frames.push({
        array: clone(array),
        originalArray,
        phase: 'swap',
        pass,
        totalPasses,
        placeIndex: i,
        currentIndex: null,
        minIndex: i,
        minValue: array[i],
        swapping: [i, minIndex],
        sortedCount: i,
        totalComparisons,
        totalSwaps,
        summary: `Swap ${left} and ${minValue}`,
        explanation: `We finished searching the unsorted portion.\n\nThe smallest value is ${minValue}.\n\nSwap it with the first unsorted element (${left}).\n\nResult: ${formatArray(array)}`,
      })
    } else {
      frames.push({
        array: clone(array),
        originalArray,
        phase: 'no-swap',
        pass,
        totalPasses,
        placeIndex: i,
        currentIndex: null,
        minIndex,
        minValue,
        swapping: null,
        sortedCount: i,
        totalComparisons,
        totalSwaps,
        summary: `No swap needed`,
        explanation: `We finished searching the unsorted portion.\n\nThe smallest value is already ${minValue} at index ${i}.\n\nNo swap is necessary.`,
      })
    }

    const sortedCount = i + 1

    frames.push({
      array: clone(array),
      originalArray,
      phase: 'pass-complete',
      pass,
      totalPasses,
      placeIndex: i,
      currentIndex: null,
      minIndex: i,
      minValue: array[i],
      swapping: null,
      sortedCount,
      totalComparisons,
      totalSwaps,
      summary: `Pass ${pass} complete`,
      explanation: `${array[i]} is now in its final position.\n\nThe sorted portion has grown by one element.\n\nSorted | Unsorted:\n${formatArray(array.slice(0, sortedCount))} | ${formatArray(array.slice(sortedCount))}`,
    })
  }

  frames.push({
    array: clone(array),
    originalArray,
    phase: 'done',
    pass: totalPasses,
    totalPasses,
    placeIndex: null,
    currentIndex: null,
    minIndex: null,
    minValue: null,
    swapping: null,
    sortedCount: n,
    totalComparisons,
    totalSwaps,
    summary: 'Array Sorted!',
    explanation: `Array Sorted!\n\nOriginal:\n${formatArray(originalArray)}\n\nSorted:\n${formatArray(array)}\n\nSelection Sort repeatedly selected the smallest remaining value until the whole array was ordered.`,
  })

  return frames
}

export function parseNumberArray(raw: string): number[] | null {
  const trimmed = raw.trim()

  if (trimmed === '') {
    return null
  }

  const withoutBrackets = trimmed.replace(/^\[/, '').replace(/\]$/, '')
  const parts = withoutBrackets
    .split(/[\s,]+/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length === 0) {
    return null
  }

  const numbers: number[] = []

  for (const part of parts) {
    const value = Number(part)

    if (!Number.isFinite(value) || !Number.isInteger(value)) {
      return null
    }

    numbers.push(value)
  }

  return numbers
}

export function generateRandomArray(size = 6): number[] {
  const length = Math.min(Math.max(size, 3), 8)
  const values: number[] = []

  while (values.length < length) {
    const next = Math.floor(Math.random() * 20) + 1
    values.push(next)
  }

  return values
}
