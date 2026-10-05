import type { VisualizationStep } from '../../components/visualizations/types'
import { formatArray } from '../../components/visualizations/utils'

export type TwoPointersPhase =
  | 'initialize'
  | 'compare'
  | 'move-left'
  | 'move-right'
  | 'found'
  | 'not-found'
  | 'complete'

function rangeIndices(left: number, right: number): number[] {
  if (left > right) {
    return []
  }
  const indices: number[] = []
  for (let i = left; i <= right; i += 1) {
    indices.push(i)
  }
  return indices
}

function outsideRange(length: number, left: number, right: number): number[] {
  const indices: number[] = []
  for (let i = 0; i < length; i += 1) {
    if (i < left || i > right) {
      indices.push(i)
    }
  }
  return indices
}

function buildPointers(
  left: number,
  right: number,
): NonNullable<VisualizationStep['pointers']> {
  return [
    { index: left, label: 'left' },
    { index: right, label: 'right' },
  ]
}

/**
 * Builds a step-by-step VisualizationStep sequence for the sorted two-sum
 * left/right two-pointer pattern. Pure data — no React state.
 */
export function buildTwoPointersSteps(
  input: readonly number[],
  target: number,
): VisualizationStep[] {
  const array = [...input]
  const steps: VisualizationStep[] = []
  const n = array.length

  if (n === 0) {
    steps.push({
      id: 'two-pointers-empty',
      title: 'Empty array',
      explanation: `The array is empty, so there are no values to pair. The algorithm returns [-1, -1] for target ${target}.`,
      detail: 'Result: [-1, -1]',
      array,
      meta: {
        target,
        resultLeft: -1,
        resultRight: -1,
        phase: 'complete' satisfies TwoPointersPhase,
      },
    })
    return steps
  }

  if (n === 1) {
    steps.push({
      id: 'two-pointers-single',
      title: 'Only one element',
      explanation: `The array ${formatArray(array)} has only one value. Two pointers need at least two positions, so the algorithm returns [-1, -1].`,
      detail: 'Result: [-1, -1]',
      array,
      active: [0],
      meta: {
        target,
        resultLeft: -1,
        resultRight: -1,
        phase: 'complete' satisfies TwoPointersPhase,
      },
    })
    return steps
  }

  let left = 0
  let right = n - 1

  steps.push({
    id: 'two-pointers-init',
    title: 'Initialize left and right',
    explanation: `We want two values in ${formatArray(array)} that add up to ${target}. Place left at index 0 and right at index ${right}.`,
    detail:
      'This left/right approach requires the array to be sorted in ascending order.',
    array,
    highlighted: rangeIndices(left, right),
    left: [left],
    right: [right],
    pointers: buildPointers(left, right),
    meta: {
      target,
      left,
      right,
      leftValue: array[left]!,
      rightValue: array[right]!,
      phase: 'initialize' satisfies TwoPointersPhase,
    },
  })

  let step = 0

  while (left < right) {
    step += 1
    const leftValue = array[left]!
    const rightValue = array[right]!
    const currentSum = leftValue + rightValue
    const activeRange = rangeIndices(left, right)
    const eliminated = outsideRange(n, left, right)

    let comparison: string
    if (currentSum === target) {
      comparison = 'equal'
    } else if (currentSum < target) {
      comparison = 'less'
    } else {
      comparison = 'greater'
    }

    steps.push({
      id: `two-pointers-compare-${step}`,
      title: `Compare ${leftValue} + ${rightValue}`,
      explanation: `left = ${left} (value ${leftValue}), right = ${right} (value ${rightValue}). Current sum: ${leftValue} + ${rightValue} = ${currentSum}. Target: ${target}.`,
      detail: `Compare sum ${currentSum} with target ${target}.`,
      array,
      highlighted: activeRange,
      compared: [left, right],
      left: [left],
      right: [right],
      eliminated,
      pointers: buildPointers(left, right),
      operation: 'compare',
      meta: {
        target,
        left,
        right,
        leftValue,
        rightValue,
        currentSum,
        comparison,
        phase: 'compare' satisfies TwoPointersPhase,
      },
    })

    if (currentSum === target) {
      steps.push({
        id: `two-pointers-found-${left}-${right}`,
        title: 'Valid pair found',
        explanation: `${leftValue} + ${rightValue} = ${target}, so we found a valid pair.`,
        detail: `Result: indices [${left}, ${right}]`,
        array,
        found: [left, right],
        left: [left],
        right: [right],
        eliminated,
        pointers: [
          { index: left, label: 'left' },
          { index: right, label: 'right' },
        ],
        meta: {
          target,
          left,
          right,
          leftValue,
          rightValue,
          currentSum,
          comparison: 'equal',
          resultLeft: left,
          resultRight: right,
          phase: 'found' satisfies TwoPointersPhase,
        },
      })

      steps.push({
        id: 'two-pointers-complete-found',
        title: 'Complete',
        explanation: `The first valid pair is ${leftValue} + ${rightValue} = ${target} at indices [${left}, ${right}].`,
        detail: `Result: [${left}, ${right}]`,
        array,
        found: [left, right],
        pointers: [
          { index: left, label: 'left' },
          { index: right, label: 'right' },
        ],
        operation: 'complete',
        meta: {
          target,
          left,
          right,
          leftValue,
          rightValue,
          currentSum,
          resultLeft: left,
          resultRight: right,
          phase: 'complete' satisfies TwoPointersPhase,
        },
      })

      return steps
    }

    if (currentSum < target) {
      const nextLeft = left + 1
      steps.push({
        id: `two-pointers-move-left-${step}`,
        title: `Sum too small → move left`,
        explanation: `${currentSum} is less than ${target}. Because the array is sorted, increase the left value by moving left to index ${nextLeft}.`,
        detail: `left: ${left} → ${nextLeft}`,
        array,
        highlighted: rangeIndices(nextLeft, right),
        left: [nextLeft],
        right: [right],
        eliminated: outsideRange(n, nextLeft, right),
        moving: [nextLeft],
        pointers:
          nextLeft < right
            ? buildPointers(nextLeft, right)
            : [{ index: right, label: 'right' }],
        operation: 'move',
        meta: {
          target,
          left: nextLeft,
          right,
          leftValue: array[nextLeft]!,
          rightValue,
          currentSum,
          comparison: 'less',
          phase: 'move-left' satisfies TwoPointersPhase,
        },
      })
      left = nextLeft
    } else {
      const nextRight = right - 1
      steps.push({
        id: `two-pointers-move-right-${step}`,
        title: `Sum too large → move right`,
        explanation: `${currentSum} is greater than ${target}. Because the array is sorted, decrease the right value by moving right to index ${nextRight}.`,
        detail: `right: ${right} → ${nextRight}`,
        array,
        highlighted: rangeIndices(left, nextRight),
        left: [left],
        right: [nextRight],
        eliminated: outsideRange(n, left, nextRight),
        moving: [nextRight],
        pointers:
          left < nextRight
            ? buildPointers(left, nextRight)
            : [{ index: left, label: 'left' }],
        operation: 'move',
        meta: {
          target,
          left,
          right: nextRight,
          leftValue,
          rightValue: array[nextRight]!,
          currentSum,
          comparison: 'greater',
          phase: 'move-right' satisfies TwoPointersPhase,
        },
      })
      right = nextRight
    }
  }

  steps.push({
    id: 'two-pointers-not-found',
    title: 'No valid pair',
    explanation: `left (${left}) is no longer less than right (${right}), so the pointers have met. No two values in the array sum to ${target}.`,
    detail: 'Result: [-1, -1]',
    array,
    eliminated: array.map((_, index) => index),
    meta: {
      target,
      left,
      right,
      resultLeft: -1,
      resultRight: -1,
      phase: 'not-found' satisfies TwoPointersPhase,
    },
  })

  steps.push({
    id: 'two-pointers-complete-not-found',
    title: 'Complete',
    explanation: `The search finished without finding a pair that sums to ${target}. Return [-1, -1].`,
    detail: 'Result: [-1, -1]',
    array,
    eliminated: array.map((_, index) => index),
    operation: 'complete',
    meta: {
      target,
      left,
      right,
      resultLeft: -1,
      resultRight: -1,
      phase: 'complete' satisfies TwoPointersPhase,
    },
  })

  return steps
}
