export const INSERTION_SORT_DEFAULT_ARRAY = [7, 4, 9, 2, 5] as const

export type InsertionSortPhase =
  | 'start'
  | 'select-key'
  | 'compare'
  | 'shift'
  | 'insert'
  | 'no-shift'
  | 'pass-complete'
  | 'done'

export type InsertionSortFrame = {
  array: number[]
  originalArray: number[]
  phase: InsertionSortPhase
  /** 1-based pass number (each key insertion is one pass). */
  pass: number
  totalPasses: number
  /** Index of the key being inserted (outer loop i). */
  keyIndex: number | null
  keyValue: number | null
  /** Index currently compared against the key (j). */
  comparingIndex: number | null
  /** Index of the element being shifted right. */
  shiftingIndex: number | null
  /** Index where the key was / will be inserted. */
  insertIndex: number | null
  /** Count of elements in the sorted prefix (excludes the key while it is held). */
  sortedCount: number
  totalComparisons: number
  totalShifts: number
  summary: string
  explanation: string
}

/**
 * Educational in-place Insertion Sort used by the lesson code examples.
 * Prefer readability over micro-optimizations.
 */
export function insertionSort(array: number[]): number[] {
  const result = [...array]

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

function clone(array: readonly number[]): number[] {
  return [...array]
}

function formatArray(array: readonly number[]): string {
  return `[${array.join(', ')}]`
}

/**
 * Builds a step-by-step visualization sequence for classic Insertion Sort.
 * Emphasizes shifting larger elements right — not adjacent swapping.
 */
export function buildInsertionSortFrames(
  input: readonly number[],
): InsertionSortFrame[] {
  const originalArray = clone(input)
  const array = clone(input)
  const n = array.length
  const totalPasses = Math.max(n - 1, 0)
  const frames: InsertionSortFrame[] = []

  let totalComparisons = 0
  let totalShifts = 0

  frames.push({
    array: clone(array),
    originalArray,
    phase: 'start',
    pass: totalPasses === 0 ? 0 : 1,
    totalPasses,
    keyIndex: null,
    keyValue: null,
    comparingIndex: null,
    shiftingIndex: null,
    insertIndex: null,
    sortedCount: n <= 1 ? n : 1,
    totalComparisons,
    totalShifts,
    summary: 'Start Insertion Sort',
    explanation:
      n <= 1
        ? `The array ${formatArray(array)} is already sorted — there is nothing to rearrange.`
        : `We start with ${formatArray(array)}.\n\nTreat the first element as already sorted:\n${formatArray(array.slice(0, 1))} | ${formatArray(array.slice(1))}\n\nWe start by considering the first element, ${array[0]}, as the sorted portion.`,
  })

  if (n <= 1) {
    frames.push({
      array: clone(array),
      originalArray,
      phase: 'done',
      pass: 0,
      totalPasses: 0,
      keyIndex: null,
      keyValue: null,
      comparingIndex: null,
      shiftingIndex: null,
      insertIndex: null,
      sortedCount: n,
      totalComparisons,
      totalShifts,
      summary: 'Array Sorted!',
      explanation: `Original:\n${formatArray(originalArray)}\n\nSorted:\n${formatArray(array)}\n\nArray Sorted!`,
    })
    return frames
  }

  for (let i = 1; i < n; i += 1) {
    const pass = i
    const key = array[i]
    let j = i - 1

    frames.push({
      array: clone(array),
      originalArray,
      phase: 'select-key',
      pass,
      totalPasses,
      keyIndex: i,
      keyValue: key,
      comparingIndex: null,
      shiftingIndex: null,
      insertIndex: null,
      sortedCount: i,
      totalComparisons,
      totalShifts,
      summary: `Select key ${key}`,
      explanation: `Pass ${pass} of ${totalPasses}.\n\nThe next element, ${key}, becomes the key.\n\nWe need to insert it into the correct position in the sorted portion.\n\nSorted | Unsorted:\n${formatArray(array.slice(0, i))} | ${formatArray(array.slice(i))}`,
    })

    let didShift = false

    while (j >= 0 && array[j] > key) {
      const comparedValue = array[j]
      totalComparisons += 1

      frames.push({
        array: clone(array),
        originalArray,
        phase: 'compare',
        pass,
        totalPasses,
        keyIndex: i,
        keyValue: key,
        comparingIndex: j,
        shiftingIndex: null,
        insertIndex: null,
        sortedCount: i,
        totalComparisons,
        totalShifts,
        summary: `Compare ${key} with ${comparedValue}`,
        explanation: `The key is ${key}.\n\nCompare ${key} with ${comparedValue}.\n\nBecause ${comparedValue} is greater than ${key}, we need to shift ${comparedValue} one position to the right.`,
      })

      array[j + 1] = array[j]
      totalShifts += 1
      didShift = true

      frames.push({
        array: clone(array),
        originalArray,
        phase: 'shift',
        pass,
        totalPasses,
        keyIndex: i,
        keyValue: key,
        comparingIndex: j,
        shiftingIndex: j,
        insertIndex: null,
        sortedCount: i,
        totalComparisons,
        totalShifts,
        summary: `Shift ${comparedValue} right`,
        explanation: `${comparedValue} is greater than the key ${key}, so shift ${comparedValue} one position to the right.\n\nThis is a shift — not a swap. The key ${key} is still held separately.\n\nArray now: ${formatArray(array)}`,
      })

      j -= 1
    }

    if (j >= 0) {
      const comparedValue = array[j]
      totalComparisons += 1

      frames.push({
        array: clone(array),
        originalArray,
        phase: 'compare',
        pass,
        totalPasses,
        keyIndex: i,
        keyValue: key,
        comparingIndex: j,
        shiftingIndex: null,
        insertIndex: null,
        sortedCount: i,
        totalComparisons,
        totalShifts,
        summary: `Compare ${key} with ${comparedValue}`,
        explanation: `The key is ${key}.\n\nCompare ${key} with ${comparedValue}.\n\n${comparedValue} is not greater than ${key}, so we stop shifting.`,
      })
    }

    const insertAt = j + 1
    array[insertAt] = key

    if (!didShift && insertAt === i) {
      frames.push({
        array: clone(array),
        originalArray,
        phase: 'no-shift',
        pass,
        totalPasses,
        keyIndex: i,
        keyValue: key,
        comparingIndex: j >= 0 ? j : null,
        shiftingIndex: null,
        insertIndex: insertAt,
        sortedCount: i,
        totalComparisons,
        totalShifts,
        summary: `Key ${key} already in place`,
        explanation: `${key} is already greater than or equal to the sorted elements to its left.\n\nNo shifting is required. Leave ${key} where it is.`,
      })
    } else {
      frames.push({
        array: clone(array),
        originalArray,
        phase: 'insert',
        pass,
        totalPasses,
        keyIndex: i,
        keyValue: key,
        comparingIndex: null,
        shiftingIndex: null,
        insertIndex: insertAt,
        sortedCount: i,
        totalComparisons,
        totalShifts,
        summary: `Insert ${key} at index ${insertAt}`,
        explanation: `There are no more elements larger than ${key} to its left.\n\nInsert ${key} into its correct position.\n\nResult: ${formatArray(array)}`,
      })
    }

    const sortedCount = i + 1

    frames.push({
      array: clone(array),
      originalArray,
      phase: 'pass-complete',
      pass,
      totalPasses,
      keyIndex: null,
      keyValue: null,
      comparingIndex: null,
      shiftingIndex: null,
      insertIndex: insertAt,
      sortedCount,
      totalComparisons,
      totalShifts,
      summary: `Pass ${pass} complete`,
      explanation: `The sorted portion has grown.\n\nSorted | Unsorted:\n${formatArray(array.slice(0, sortedCount))} | ${formatArray(array.slice(sortedCount))}`,
    })
  }

  frames.push({
    array: clone(array),
    originalArray,
    phase: 'done',
    pass: totalPasses,
    totalPasses,
    keyIndex: null,
    keyValue: null,
    comparingIndex: null,
    shiftingIndex: null,
    insertIndex: null,
    sortedCount: n,
    totalComparisons,
    totalShifts,
    summary: 'Array Sorted!',
    explanation: `Array Sorted!\n\nOriginal:\n${formatArray(originalArray)}\n\nSorted:\n${formatArray(array)}\n\nInsertion Sort took each key and inserted it into the growing sorted portion by shifting larger values right.`,
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
