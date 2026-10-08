import type { VisualizationStep } from '../../components/visualizations/types'
import { formatArray } from '../../components/visualizations/utils'
import { getSubarray, maxSubarray } from './kadanesAlgorithm'

export type KadanesPhase =
  | 'initialize'
  | 'read-value'
  | 'calculate-start-new'
  | 'calculate-extend'
  | 'choose'
  | 'update-current'
  | 'update-best'
  | 'complete'

type KadanesMeta = {
  phase: KadanesPhase
  currentIndex: number
  currentValue: number
  currentSum: number
  bestSum: number
  currentStart: number
  currentEnd: number
  bestStart: number
  bestEnd: number
  startNewCandidate: number
  extendCandidate: number
  chosenCandidate: number
  choseStartNew: boolean
  bestUpdated: boolean
  previousCurrentSum: number
}

function rangeIndices(start: number, end: number): number[] {
  if (start < 0 || end < 0 || start > end) {
    return []
  }
  const indices: number[] = []
  for (let i = start; i <= end; i += 1) {
    indices.push(i)
  }
  return indices
}

function formatSubarray(
  arr: readonly number[],
  start: number,
  end: number,
): string {
  const values = getSubarray(arr, start, end)
  if (values.length === 0) {
    return '[]'
  }
  return `[${values.join(', ')}]`
}

function meta(fields: KadanesMeta): NonNullable<VisualizationStep['meta']> {
  return {
    phase: fields.phase,
    currentIndex: fields.currentIndex,
    currentValue: fields.currentValue,
    currentSum: fields.currentSum,
    bestSum: fields.bestSum,
    currentStart: fields.currentStart,
    currentEnd: fields.currentEnd,
    bestStart: fields.bestStart,
    bestEnd: fields.bestEnd,
    startNewCandidate: fields.startNewCandidate,
    extendCandidate: fields.extendCandidate,
    chosenCandidate: fields.chosenCandidate,
    choseStartNew: fields.choseStartNew,
    bestUpdated: fields.bestUpdated,
    previousCurrentSum: fields.previousCurrentSum,
  }
}

function baseMeta(partial: Partial<KadanesMeta> & Pick<KadanesMeta, 'phase'>): KadanesMeta {
  return {
    phase: partial.phase,
    currentIndex: partial.currentIndex ?? -1,
    currentValue: partial.currentValue ?? 0,
    currentSum: partial.currentSum ?? 0,
    bestSum: partial.bestSum ?? 0,
    currentStart: partial.currentStart ?? -1,
    currentEnd: partial.currentEnd ?? -1,
    bestStart: partial.bestStart ?? -1,
    bestEnd: partial.bestEnd ?? -1,
    startNewCandidate: partial.startNewCandidate ?? 0,
    extendCandidate: partial.extendCandidate ?? 0,
    chosenCandidate: partial.chosenCandidate ?? 0,
    choseStartNew: partial.choseStartNew ?? false,
    bestUpdated: partial.bestUpdated ?? false,
    previousCurrentSum: partial.previousCurrentSum ?? 0,
  }
}

/**
 * Builds a step-by-step VisualizationStep sequence for Kadane's Algorithm.
 * Each step is an immutable snapshot. Pure data — no React state.
 */
export function buildKadanesAlgorithmSteps(
  input: readonly number[],
): VisualizationStep[] {
  const array = [...input]
  const steps: VisualizationStep[] = []
  const n = array.length
  const result = maxSubarray(array)

  if (n === 0) {
    steps.push({
      id: 'kadanes-empty',
      title: 'Empty array',
      explanation:
        'The array is empty, so there is no subarray to evaluate. The algorithm returns no result.',
      detail: 'Result: null',
      array: [],
      operation: 'complete',
      meta: meta(
        baseMeta({
          phase: 'complete',
        }),
      ),
    })
    return steps
  }

  let currentSum = array[0]!
  let bestSum = array[0]!
  let currentStart = 0
  let currentEnd = 0
  let bestStart = 0
  let bestEnd = 0

  steps.push({
    id: 'kadanes-init',
    title: 'Initialize from the first element',
    explanation: `Start with the first element ${array[0]}. Set both currentSum and bestSum to ${array[0]} — never initialize bestSum to 0, or all-negative arrays would be wrong.`,
    detail: `Array: ${formatArray(array)}. Current subarray: ${formatSubarray(array, 0, 0)}. Best subarray: ${formatSubarray(array, 0, 0)}.`,
    array,
    highlighted: [0],
    active: [0],
    found: [0],
    pointers: [{ index: 0, label: 'start' }],
    meta: meta(
      baseMeta({
        phase: 'initialize',
        currentIndex: 0,
        currentValue: array[0]!,
        currentSum,
        bestSum,
        currentStart,
        currentEnd,
        bestStart,
        bestEnd,
        startNewCandidate: array[0]!,
        extendCandidate: array[0]!,
        chosenCandidate: array[0]!,
        previousCurrentSum: array[0]!,
      }),
    ),
  })

  if (n === 1) {
    steps.push({
      id: 'kadanes-complete',
      title: 'Maximum subarray found',
      explanation: `Only one element exists. The maximum subarray is ${formatSubarray(array, 0, 0)} with sum ${bestSum}.`,
      detail: `maxSum = ${bestSum}, start = 0, end = 0`,
      array,
      found: [0],
      sorted: [0],
      operation: 'complete',
      meta: meta(
        baseMeta({
          phase: 'complete',
          currentIndex: 0,
          currentValue: array[0]!,
          currentSum,
          bestSum,
          currentStart,
          currentEnd,
          bestStart,
          bestEnd,
          chosenCandidate: bestSum,
          previousCurrentSum: currentSum,
        }),
      ),
    })
    return steps
  }

  for (let i = 1; i < n; i += 1) {
    const value = array[i]!
    const previousCurrentSum = currentSum
    const startNewCandidate = value
    const extendCandidate = previousCurrentSum + value
    const choseStartNew = startNewCandidate > extendCandidate
    const chosenCandidate = choseStartNew
      ? startNewCandidate
      : extendCandidate

    const currentRange = rangeIndices(currentStart, currentEnd)
    const bestRange = rangeIndices(bestStart, bestEnd)

    steps.push({
      id: `kadanes-read-${i}`,
      title: `Read value ${value} at index ${i}`,
      explanation: `Look at value ${value} at index ${i}. Ask: continue the current subarray, or start a new one here?`,
      detail: `Previous currentSum = ${previousCurrentSum}. Current subarray: ${formatSubarray(array, currentStart, currentEnd)}.`,
      array,
      highlighted: currentRange,
      active: [i],
      compared: [i],
      found: bestRange,
      pointers: [{ index: i, label: 'current' }],
      operation: 'compare',
      meta: meta(
        baseMeta({
          phase: 'read-value',
          currentIndex: i,
          currentValue: value,
          currentSum: previousCurrentSum,
          bestSum,
          currentStart,
          currentEnd,
          bestStart,
          bestEnd,
          startNewCandidate,
          extendCandidate,
          chosenCandidate,
          previousCurrentSum,
        }),
      ),
    })

    steps.push({
      id: `kadanes-start-new-${i}`,
      title: 'Candidate: start a new subarray',
      explanation: `Start new at this index: just use the value itself → ${startNewCandidate}.`,
      detail: `startNew = ${value}`,
      array,
      highlighted: currentRange,
      active: [i],
      candidate: [i],
      found: bestRange,
      pointers: [{ index: i, label: 'current' }],
      operation: 'compare',
      meta: meta(
        baseMeta({
          phase: 'calculate-start-new',
          currentIndex: i,
          currentValue: value,
          currentSum: previousCurrentSum,
          bestSum,
          currentStart,
          currentEnd,
          bestStart,
          bestEnd,
          startNewCandidate,
          extendCandidate,
          chosenCandidate,
          previousCurrentSum,
        }),
      ),
    })

    steps.push({
      id: `kadanes-extend-${i}`,
      title: 'Candidate: extend the current subarray',
      explanation: `Extend the existing subarray: ${previousCurrentSum} + (${value}) = ${extendCandidate}.`,
      detail: `extend = currentSum + value = ${previousCurrentSum} + ${value} = ${extendCandidate}`,
      array,
      highlighted: [...currentRange, i],
      active: [i],
      moving: [i],
      found: bestRange,
      pointers: [{ index: i, label: 'current' }],
      operation: 'compare',
      meta: meta(
        baseMeta({
          phase: 'calculate-extend',
          currentIndex: i,
          currentValue: value,
          currentSum: previousCurrentSum,
          bestSum,
          currentStart,
          currentEnd,
          bestStart,
          bestEnd,
          startNewCandidate,
          extendCandidate,
          chosenCandidate,
          previousCurrentSum,
        }),
      ),
    })

    steps.push({
      id: `kadanes-choose-${i}`,
      title: choseStartNew
        ? `Choose start new (${chosenCandidate})`
        : `Choose extend (${chosenCandidate})`,
      explanation: choseStartNew
        ? `max(${startNewCandidate}, ${extendCandidate}) = ${chosenCandidate}. Starting a new subarray at index ${i} is better.`
        : `max(${startNewCandidate}, ${extendCandidate}) = ${chosenCandidate}. Extending the current subarray is better.`,
      detail: `currentSum = max(value, currentSum + value) = ${chosenCandidate}`,
      array,
      highlighted: choseStartNew
        ? [i]
        : rangeIndices(currentStart, i),
      active: [i],
      found: bestRange,
      pointers: [{ index: i, label: choseStartNew ? 'restart' : 'extend' }],
      operation: 'move',
      meta: meta(
        baseMeta({
          phase: 'choose',
          currentIndex: i,
          currentValue: value,
          currentSum: previousCurrentSum,
          bestSum,
          currentStart,
          currentEnd,
          bestStart,
          bestEnd,
          startNewCandidate,
          extendCandidate,
          chosenCandidate,
          choseStartNew,
          previousCurrentSum,
        }),
      ),
    })

    if (choseStartNew) {
      currentSum = value
      currentStart = i
    } else {
      currentSum += value
    }
    currentEnd = i

    const updatedCurrentRange = rangeIndices(currentStart, currentEnd)

    steps.push({
      id: `kadanes-update-current-${i}`,
      title: `currentSum is now ${currentSum}`,
      explanation: choseStartNew
        ? `Restarted at index ${i}. Current subarray is ${formatSubarray(array, currentStart, currentEnd)} with sum ${currentSum}.`
        : `Extended to index ${i}. Current subarray is ${formatSubarray(array, currentStart, currentEnd)} with sum ${currentSum}.`,
      detail: `currentStart = ${currentStart}, currentEnd = ${currentEnd}`,
      array,
      highlighted: updatedCurrentRange,
      active: [i],
      found: bestRange,
      pointers: [
        { index: currentStart, label: 'cur start' },
        { index: currentEnd, label: 'cur end' },
      ],
      operation: 'move',
      meta: meta(
        baseMeta({
          phase: 'update-current',
          currentIndex: i,
          currentValue: value,
          currentSum,
          bestSum,
          currentStart,
          currentEnd,
          bestStart,
          bestEnd,
          startNewCandidate,
          extendCandidate,
          chosenCandidate,
          choseStartNew,
          previousCurrentSum,
        }),
      ),
    })

    const bestUpdated = currentSum > bestSum
    if (bestUpdated) {
      bestSum = currentSum
      bestStart = currentStart
      bestEnd = currentEnd

      steps.push({
        id: `kadanes-update-best-${i}`,
        title: `bestSum updated to ${bestSum}`,
        explanation: `currentSum (${currentSum}) is greater than the previous best. Update bestSum and remember indices ${bestStart}…${bestEnd}.`,
        detail: `Best subarray: ${formatSubarray(array, bestStart, bestEnd)} = ${bestSum}`,
        array,
        highlighted: updatedCurrentRange,
        active: [i],
        found: rangeIndices(bestStart, bestEnd),
        pointers: [
          { index: bestStart, label: 'best start' },
          { index: bestEnd, label: 'best end' },
        ],
        operation: 'mark-sorted',
        meta: meta(
          baseMeta({
            phase: 'update-best',
            currentIndex: i,
            currentValue: value,
            currentSum,
            bestSum,
            currentStart,
            currentEnd,
            bestStart,
            bestEnd,
            startNewCandidate,
            extendCandidate,
            chosenCandidate,
            choseStartNew,
            bestUpdated: true,
            previousCurrentSum,
          }),
        ),
      })
    }
  }

  const finalBest = result ?? {
    maxSum: bestSum,
    start: bestStart,
    end: bestEnd,
  }

  steps.push({
    id: 'kadanes-complete',
    title: 'Maximum subarray found',
    explanation: `Finished the linear scan. Maximum sum is ${finalBest.maxSum}. Subarray ${formatSubarray(array, finalBest.start, finalBest.end)} from index ${finalBest.start} to ${finalBest.end}.`,
    detail: `maxSum = ${finalBest.maxSum}, start = ${finalBest.start}, end = ${finalBest.end}`,
    array,
    found: rangeIndices(finalBest.start, finalBest.end),
    sorted: rangeIndices(finalBest.start, finalBest.end),
    operation: 'complete',
    meta: meta(
      baseMeta({
        phase: 'complete',
        currentIndex: n - 1,
        currentValue: array[n - 1]!,
        currentSum,
        bestSum: finalBest.maxSum,
        currentStart,
        currentEnd,
        bestStart: finalBest.start,
        bestEnd: finalBest.end,
        chosenCandidate: finalBest.maxSum,
        previousCurrentSum: currentSum,
      }),
    ),
  })

  return steps
}
