import type { VisualizationStep } from '../../components/visualizations/types'
import { formatArray } from '../../components/visualizations/utils'

export type SlidingWindowPhase =
  | 'initialize'
  | 'create-window'
  | 'calculate-window'
  | 'slide'
  | 'remove-outgoing'
  | 'add-incoming'
  | 'update-maximum'
  | 'complete'

function rangeIndices(start: number, end: number): number[] {
  if (start > end) {
    return []
  }
  const indices: number[] = []
  for (let i = start; i <= end; i += 1) {
    indices.push(i)
  }
  return indices
}

function outsideRange(
  length: number,
  start: number,
  end: number,
): number[] {
  const indices: number[] = []
  for (let i = 0; i < length; i += 1) {
    if (i < start || i > end) {
      indices.push(i)
    }
  }
  return indices
}

function buildWindowPointers(
  start: number,
  end: number,
): NonNullable<VisualizationStep['pointers']> {
  if (start === end) {
    return [{ index: start, label: 'window' }]
  }
  return [
    { index: start, label: 'start' },
    { index: end, label: 'end' },
  ]
}

type WindowMeta = {
  windowStart: number
  windowEnd: number
  windowSize: number
  currentSum: number
  maxSum: number
  outgoingIndex: number
  incomingIndex: number
  phase: SlidingWindowPhase
}

function meta(fields: WindowMeta): NonNullable<VisualizationStep['meta']> {
  return {
    windowStart: fields.windowStart,
    windowEnd: fields.windowEnd,
    windowSize: fields.windowSize,
    currentSum: fields.currentSum,
    maxSum: fields.maxSum,
    outgoingIndex: fields.outgoingIndex,
    incomingIndex: fields.incomingIndex,
    phase: fields.phase as string,
  }
}

/**
 * Builds a step-by-step VisualizationStep sequence for fixed-size
 * maximum window sum. Pure data — no React state.
 */
export function buildSlidingWindowSteps(
  input: readonly number[],
  windowSize: number,
): VisualizationStep[] {
  const array = [...input]
  const steps: VisualizationStep[] = []
  const n = array.length

  if (n === 0) {
    steps.push({
      id: 'sliding-window-empty',
      title: 'Empty array',
      explanation:
        'The array is empty, so there is no window to form. The algorithm returns 0.',
      detail: 'Result: 0',
      array,
      meta: meta({
        windowStart: -1,
        windowEnd: -1,
        windowSize,
        currentSum: 0,
        maxSum: 0,
        outgoingIndex: -1,
        incomingIndex: -1,
        phase: 'complete',
      }),
    })
    return steps
  }

  if (!Number.isInteger(windowSize) || windowSize <= 0) {
    steps.push({
      id: 'sliding-window-invalid-size',
      title: 'Invalid window size',
      explanation: `Window size must be at least 1. Received ${windowSize}. The algorithm returns 0.`,
      detail: 'Result: 0',
      array,
      meta: meta({
        windowStart: -1,
        windowEnd: -1,
        windowSize,
        currentSum: 0,
        maxSum: 0,
        outgoingIndex: -1,
        incomingIndex: -1,
        phase: 'complete',
      }),
    })
    return steps
  }

  if (windowSize > n) {
    steps.push({
      id: 'sliding-window-too-large',
      title: 'Window larger than array',
      explanation: `Window size ${windowSize} is larger than the array length ${n}. A fixed window cannot fit, so the algorithm returns 0.`,
      detail: 'Result: 0',
      array,
      highlighted: array.map((_, index) => index),
      meta: meta({
        windowStart: -1,
        windowEnd: -1,
        windowSize,
        currentSum: 0,
        maxSum: 0,
        outgoingIndex: -1,
        incomingIndex: -1,
        phase: 'complete',
      }),
    })
    return steps
  }

  steps.push({
    id: 'sliding-window-init',
    title: 'Initialize',
    explanation: `Find the maximum sum of any contiguous subarray of size ${windowSize} in ${formatArray(array)}. The array does not need to be sorted.`,
    detail: `Window size k = ${windowSize}`,
    array,
    meta: meta({
      windowStart: 0,
      windowEnd: windowSize - 1,
      windowSize,
      currentSum: 0,
      maxSum: 0,
      outgoingIndex: -1,
      incomingIndex: -1,
      phase: 'initialize',
    }),
  })

  const firstEnd = windowSize - 1
  const firstRange = rangeIndices(0, firstEnd)

  steps.push({
    id: 'sliding-window-create',
    title: 'Create the first window',
    explanation: `Create the first window over indices 0 through ${firstEnd}: ${formatArray(array.slice(0, windowSize))}.`,
    detail: 'A window is a contiguous range of consecutive elements.',
    array,
    highlighted: firstRange,
    left: [0],
    right: [firstEnd],
    eliminated: outsideRange(n, 0, firstEnd),
    pointers: buildWindowPointers(0, firstEnd),
    meta: meta({
      windowStart: 0,
      windowEnd: firstEnd,
      windowSize,
      currentSum: 0,
      maxSum: 0,
      outgoingIndex: -1,
      incomingIndex: -1,
      phase: 'create-window',
    }),
  })

  let windowSum = 0
  for (let i = 0; i < windowSize; i += 1) {
    windowSum += array[i]!
  }
  let maxSum = windowSum
  let bestStart = 0
  let bestEnd = firstEnd

  steps.push({
    id: 'sliding-window-calculate-first',
    title: 'Calculate the first window sum',
    explanation: `Calculate the sum of the first ${windowSize} elements: ${array
      .slice(0, windowSize)
      .join(' + ')} = ${windowSum}.`,
    detail: `Current window sum = ${windowSum}. Maximum so far = ${maxSum}.`,
    array,
    highlighted: firstRange,
    active: firstRange,
    left: [0],
    right: [firstEnd],
    eliminated: outsideRange(n, 0, firstEnd),
    pointers: buildWindowPointers(0, firstEnd),
    meta: meta({
      windowStart: 0,
      windowEnd: firstEnd,
      windowSize,
      currentSum: windowSum,
      maxSum,
      outgoingIndex: -1,
      incomingIndex: -1,
      phase: 'calculate-window',
    }),
  })

  let slide = 0

  for (let end = windowSize; end < n; end += 1) {
    slide += 1
    const start = end - windowSize + 1
    const outgoingIndex = start - 1
    const incomingIndex = end
    const outgoingValue = array[outgoingIndex]!
    const incomingValue = array[incomingIndex]!
    const previousSum = windowSum
    const windowRange = rangeIndices(start, end)

    steps.push({
      id: `sliding-window-slide-${slide}`,
      title: 'Slide the window',
      explanation: `Move the window one position to the right. New range: indices ${start} through ${end}.`,
      detail: `Reuse the previous sum (${previousSum}) instead of recalculating from scratch.`,
      array,
      highlighted: windowRange,
      moving: [start, end],
      left: [start],
      right: [end],
      eliminated: outsideRange(n, start, end),
      pointers: buildWindowPointers(start, end),
      operation: 'move',
      meta: meta({
        windowStart: start,
        windowEnd: end,
        windowSize,
        currentSum: previousSum,
        maxSum,
        outgoingIndex,
        incomingIndex,
        phase: 'slide',
      }),
    })

    steps.push({
      id: `sliding-window-remove-${slide}`,
      title: `Remove outgoing ${outgoingValue}`,
      explanation: `Remove ${outgoingValue} because it is leaving the window (index ${outgoingIndex}).`,
      detail: `${previousSum} − ${outgoingValue}`,
      array,
      highlighted: windowRange,
      compared: [outgoingIndex],
      moving: [outgoingIndex],
      left: [start],
      right: [end],
      eliminated: outsideRange(n, start, end),
      pointers: [
        { index: outgoingIndex, label: 'out' },
        { index: start, label: 'start' },
        { index: end, label: 'end' },
      ],
      operation: 'move',
      meta: meta({
        windowStart: start,
        windowEnd: end,
        windowSize,
        currentSum: previousSum,
        maxSum,
        outgoingIndex,
        incomingIndex,
        phase: 'remove-outgoing',
      }),
    })

    windowSum = previousSum - outgoingValue

    steps.push({
      id: `sliding-window-add-${slide}`,
      title: `Add incoming ${incomingValue}`,
      explanation: `Add ${incomingValue} because it is entering the window (index ${incomingIndex}).`,
      detail: `${previousSum} − ${outgoingValue} + ${incomingValue} = ${previousSum - outgoingValue + incomingValue}`,
      array,
      highlighted: windowRange,
      compared: [incomingIndex],
      moving: [incomingIndex],
      left: [start],
      right: [end],
      eliminated: outsideRange(n, start, end),
      pointers: [
        { index: incomingIndex, label: 'in' },
        { index: start, label: 'start' },
        { index: end, label: 'end' },
      ],
      operation: 'move',
      meta: meta({
        windowStart: start,
        windowEnd: end,
        windowSize,
        currentSum: previousSum - outgoingValue,
        maxSum,
        outgoingIndex,
        incomingIndex,
        phase: 'add-incoming',
      }),
    })

    windowSum = previousSum - outgoingValue + incomingValue

    const sumStep: VisualizationStep = {
      id: `sliding-window-sum-${slide}`,
      title: `Current window sum = ${windowSum}`,
      explanation: `Updated window sum: ${previousSum} − ${outgoingValue} + ${incomingValue} = ${windowSum}. Window: ${formatArray(array.slice(start, end + 1))}.`,
      detail: `Maximum so far = ${maxSum}.`,
      array,
      highlighted: windowRange,
      active: windowRange,
      left: [start],
      right: [end],
      eliminated: outsideRange(n, start, end),
      pointers: buildWindowPointers(start, end),
      meta: meta({
        windowStart: start,
        windowEnd: end,
        windowSize,
        currentSum: windowSum,
        maxSum,
        outgoingIndex,
        incomingIndex,
        phase: 'calculate-window',
      }),
    }
    steps.push(sumStep)

    if (windowSum > maxSum) {
      const previousMax = maxSum
      maxSum = windowSum
      bestStart = start
      bestEnd = end

      steps.push({
        id: `sliding-window-update-max-${slide}`,
        title: 'Update the maximum',
        explanation: `${windowSum} is larger than the previous maximum of ${previousMax}.`,
        detail: `Maximum window sum is now ${maxSum}.`,
        array,
        highlighted: windowRange,
        found: windowRange,
        left: [start],
        right: [end],
        eliminated: outsideRange(n, start, end),
        pointers: buildWindowPointers(start, end),
        meta: meta({
          windowStart: start,
          windowEnd: end,
          windowSize,
          currentSum: windowSum,
          maxSum,
          outgoingIndex,
          incomingIndex,
          phase: 'update-maximum',
        }),
      })
    } else {
      steps.push({
        id: `sliding-window-keep-max-${slide}`,
        title: 'Maximum unchanged',
        explanation: `${windowSum} is not larger than the current maximum of ${maxSum}, so keep the previous best.`,
        detail: `Maximum so far = ${maxSum}.`,
        array,
        highlighted: windowRange,
        left: [start],
        right: [end],
        eliminated: outsideRange(n, start, end),
        pointers: buildWindowPointers(start, end),
        meta: meta({
          windowStart: start,
          windowEnd: end,
          windowSize,
          currentSum: windowSum,
          maxSum,
          outgoingIndex,
          incomingIndex,
          phase: 'update-maximum',
        }),
      })
    }
  }

  const bestRange = rangeIndices(bestStart, bestEnd)

  steps.push({
    id: 'sliding-window-complete',
    title: 'Complete',
    explanation: `Maximum window sum is ${maxSum}. Best window: ${formatArray(array.slice(bestStart, bestEnd + 1))} at indices ${bestStart}–${bestEnd}.`,
    detail: `Result: ${maxSum}`,
    array,
    found: bestRange,
    left: [bestStart],
    right: [bestEnd],
    eliminated: outsideRange(n, bestStart, bestEnd),
    pointers: buildWindowPointers(bestStart, bestEnd),
    operation: 'complete',
    meta: meta({
      windowStart: bestStart,
      windowEnd: bestEnd,
      windowSize,
      currentSum: maxSum,
      maxSum,
      outgoingIndex: -1,
      incomingIndex: -1,
      phase: 'complete',
    }),
  })

  return steps
}
