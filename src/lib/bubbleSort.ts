export const BUBBLE_SORT_DEFAULT_ARRAY = [5, 3, 8, 4, 2] as const

export type BubbleSortPhase =
  | 'start'
  | 'compare'
  | 'swap'
  | 'no-swap'
  | 'pass-complete'
  | 'done'

export type BubbleSortFrame = {
  array: number[]
  originalArray: number[]
  phase: BubbleSortPhase
  /** 1-based pass number currently in progress (or just finished). */
  pass: number
  totalPasses: number
  /** Indices being compared, if any. */
  comparing: [number, number] | null
  /** Values compared in this step (pre-swap order: left then right). */
  compareValues: [number, number] | null
  /** Indices being swapped, if any. */
  swapping: [number, number] | null
  /** Count of elements locked as sorted from the end. */
  sortedCount: number
  /** Comparison index within the current pass (1-based), or 0 when not comparing. */
  comparisonInPass: number
  comparisonsInPassTotal: number
  totalComparisons: number
  totalSwaps: number
  summary: string
  explanation: string
}

/**
 * Educational in-place Bubble Sort used by the lesson code examples.
 * Prefer readability over micro-optimizations.
 */
export function bubbleSort(array: number[]): number[] {
  const result = [...array]

  for (let i = 0; i < result.length; i += 1) {
    for (let j = 0; j < result.length - i - 1; j += 1) {
      if (result[j] > result[j + 1]) {
        const temp = result[j]
        result[j] = result[j + 1]
        result[j + 1] = temp
      }
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
 * Builds a step-by-step visualization sequence for classic Bubble Sort
 * (no early-exit optimization — that idea is taught separately in the lesson).
 */
export function buildBubbleSortFrames(
  input: readonly number[],
): BubbleSortFrame[] {
  const originalArray = clone(input)
  const array = clone(input)
  const n = array.length
  const totalPasses = Math.max(n - 1, 0)
  const frames: BubbleSortFrame[] = []

  let totalComparisons = 0
  let totalSwaps = 0

  frames.push({
    array: clone(array),
    originalArray,
    phase: 'start',
    pass: totalPasses === 0 ? 0 : 1,
    totalPasses,
    comparing: null,
    compareValues: null,
    swapping: null,
    sortedCount: 0,
    comparisonInPass: 0,
    comparisonsInPassTotal: Math.max(n - 1, 0),
    totalComparisons,
    totalSwaps,
    summary: 'Start Bubble Sort',
    explanation:
      n <= 1
        ? `The array ${formatArray(array)} is already sorted — there is nothing to rearrange.`
        : `We start with ${formatArray(array)}.\n\nBubble Sort repeatedly compares neighboring values. If they are in the wrong order, we swap them.\n\nAfter each full pass, the largest unsorted value moves toward the end.`,
  })

  if (n <= 1) {
    frames.push({
      array: clone(array),
      originalArray,
      phase: 'done',
      pass: 0,
      totalPasses: 0,
      comparing: null,
      compareValues: null,
      swapping: null,
      sortedCount: n,
      comparisonInPass: 0,
      comparisonsInPassTotal: 0,
      totalComparisons,
      totalSwaps,
      summary: 'Array Sorted!',
      explanation: `Original:\n${formatArray(originalArray)}\n\nSorted:\n${formatArray(array)}\n\nArray Sorted!`,
    })
    return frames
  }

  for (let i = 0; i < n - 1; i += 1) {
    const pass = i + 1
    const comparisonsInPassTotal = n - i - 1
    let swapsInPass = 0

    for (let j = 0; j < n - i - 1; j += 1) {
      const left = array[j]
      const right = array[j + 1]
      const comparisonInPass = j + 1
      totalComparisons += 1

      frames.push({
        array: clone(array),
        originalArray,
        phase: 'compare',
        pass,
        totalPasses,
        comparing: [j, j + 1],
        compareValues: [left, right],
        swapping: null,
        sortedCount: i,
        comparisonInPass,
        comparisonsInPassTotal,
        totalComparisons,
        totalSwaps,
        summary: `Comparing ${left} and ${right}`,
        explanation: `Pass ${pass} of ${totalPasses}.\n\nWe are comparing neighboring values at indices ${j} and ${j + 1}:\n${left} and ${right}.`,
      })

      if (left > right) {
        array[j] = right
        array[j + 1] = left
        totalSwaps += 1
        swapsInPass += 1

        frames.push({
          array: clone(array),
          originalArray,
          phase: 'swap',
          pass,
          totalPasses,
          comparing: [j, j + 1],
          compareValues: [left, right],
          swapping: [j, j + 1],
          sortedCount: i,
          comparisonInPass,
          comparisonsInPassTotal,
          totalComparisons,
          totalSwaps,
          summary: `Swap ${left} and ${right}`,
          explanation: `We are comparing ${left} and ${right}.\n\nBecause ${left} is greater than ${right}, the two values are in the wrong order.\n\nSwap them.\n\nResult: ${formatArray(array)}`,
        })
      } else {
        frames.push({
          array: clone(array),
          originalArray,
          phase: 'no-swap',
          pass,
          totalPasses,
          comparing: [j, j + 1],
          compareValues: [left, right],
          swapping: null,
          sortedCount: i,
          comparisonInPass,
          comparisonsInPassTotal,
          totalComparisons,
          totalSwaps,
          summary: `No swap needed`,
          explanation: `We are comparing ${left} and ${right}.\n\nBecause ${left} is smaller than or equal to ${right}, they are already in the correct order.\n\nNo swap is needed.\n\nArray remains: ${formatArray(array)}`,
        })
      }
    }

    const sortedCount = i + 1
    const bubbledValue = array[n - sortedCount]

    frames.push({
      array: clone(array),
      originalArray,
      phase: 'pass-complete',
      pass,
      totalPasses,
      comparing: null,
      compareValues: null,
      swapping: null,
      sortedCount,
      comparisonInPass: comparisonsInPassTotal,
      comparisonsInPassTotal,
      totalComparisons,
      totalSwaps,
      summary: `Pass ${pass} complete`,
      explanation: `Pass ${pass} is complete${swapsInPass === 0 ? ' (no swaps in this pass)' : ''}.\n\nThe largest unsorted value, ${bubbledValue}, has moved toward the end of the array.\n\nSorted from the end so far: ${formatArray(array.slice(n - sortedCount))}.`,
    })
  }

  frames.push({
    array: clone(array),
    originalArray,
    phase: 'done',
    pass: totalPasses,
    totalPasses,
    comparing: null,
    compareValues: null,
    swapping: null,
    sortedCount: n,
    comparisonInPass: 0,
    comparisonsInPassTotal: 0,
    totalComparisons,
    totalSwaps,
    summary: 'Array Sorted!',
    explanation: `Array Sorted!\n\nOriginal:\n${formatArray(originalArray)}\n\nSorted:\n${formatArray(array)}\n\nEvery pass moved a large value toward the end until the whole array was ordered.`,
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
