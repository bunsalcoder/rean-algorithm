import type { VisualizationStep } from '../../components/visualizations/types'
import { formatArray } from '../../components/visualizations/utils'
import { buildPrefixSum, isValidRange, rangeSum } from './prefixSum'

export type PrefixSumPhase =
  | 'build-prefix'
  | 'add'
  | 'prefix-created'
  | 'query-start'
  | 'query-left'
  | 'query-right'
  | 'query-calculate'
  | 'query-result'
  | 'complete'

type PrefixMeta = {
  phase: PrefixSumPhase
  currentIndex: number
  currentValue: number
  previousPrefix: number
  currentPrefix: number
  left: number
  right: number
  queryResult: number
  prefixFilled: number
  formulaLeft: number
  formulaRight: number
}

function meta(fields: PrefixMeta): NonNullable<VisualizationStep['meta']> {
  return {
    phase: fields.phase,
    currentIndex: fields.currentIndex,
    currentValue: fields.currentValue,
    previousPrefix: fields.previousPrefix,
    currentPrefix: fields.currentPrefix,
    left: fields.left,
    right: fields.right,
    queryResult: fields.queryResult,
    prefixFilled: fields.prefixFilled,
    formulaLeft: fields.formulaLeft,
    formulaRight: fields.formulaRight,
  }
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

/**
 * Snapshot of the prefix array with only the first `filled` entries set.
 * Remaining slots stay 0 and are marked eliminated in the step.
 */
function prefixSnapshot(prefix: readonly number[], filled: number): number[] {
  return prefix.map((value, index) => (index < filled ? value : 0))
}

function unfilledIndices(length: number, filled: number): number[] {
  const indices: number[] = []
  for (let i = filled; i < length; i += 1) {
    indices.push(i)
  }
  return indices
}

/**
 * Builds a step-by-step VisualizationStep sequence for Prefix Sum.
 * Uses the leading-zero convention throughout. Pure data — no React state.
 */
export function buildPrefixSumSteps(
  input: readonly number[],
  left: number,
  right: number,
): VisualizationStep[] {
  const array = [...input]
  const steps: VisualizationStep[] = []
  const n = array.length

  if (n === 0) {
    steps.push({
      id: 'prefix-sum-empty',
      title: 'Empty array',
      explanation:
        'The array is empty, so there is nothing to preprocess and no range to query.',
      detail: 'Result: no range sum',
      array: [0],
      meta: meta({
        phase: 'complete',
        currentIndex: -1,
        currentValue: 0,
        previousPrefix: 0,
        currentPrefix: 0,
        left: -1,
        right: -1,
        queryResult: 0,
        prefixFilled: 1,
        formulaLeft: 0,
        formulaRight: 0,
      }),
    })
    return steps
  }

  if (!isValidRange(array, left, right)) {
    steps.push({
      id: 'prefix-sum-invalid-range',
      title: 'Invalid range',
      explanation: `Need 0 ≤ left ≤ right < ${n}. Received left = ${left}, right = ${right}.`,
      detail: 'Choose a valid inclusive range to run the visualization.',
      array: buildPrefixSum(array),
      highlighted: array.map((_, index) => index),
      meta: meta({
        phase: 'complete',
        currentIndex: -1,
        currentValue: 0,
        previousPrefix: 0,
        currentPrefix: 0,
        left,
        right,
        queryResult: 0,
        prefixFilled: n + 1,
        formulaLeft: 0,
        formulaRight: 0,
      }),
    })
    return steps
  }

  const prefix = buildPrefixSum(array)
  const queryResult = rangeSum(prefix, left, right)
  const formulaRight = right + 1

  steps.push({
    id: 'prefix-sum-build-start',
    title: 'Start building the prefix sum',
    explanation:
      'Start building the prefix sum array. Begin with a leading zero so prefix[i] means the sum of the first i elements.',
    detail: `Original array: ${formatArray(array)}`,
    array: prefixSnapshot(prefix, 1),
    active: [0],
    eliminated: unfilledIndices(n + 1, 1),
    pointers: [{ index: 0, label: 'prefix[0]' }],
    meta: meta({
      phase: 'build-prefix',
      currentIndex: 0,
      currentValue: 0,
      previousPrefix: 0,
      currentPrefix: 0,
      left,
      right,
      queryResult,
      prefixFilled: 1,
      formulaLeft: left,
      formulaRight,
    }),
  })

  for (let i = 0; i < n; i += 1) {
    const previousPrefix = prefix[i]!
    const currentValue = array[i]!
    const currentPrefix = prefix[i + 1]!
    const filled = i + 2

    steps.push({
      id: `prefix-sum-add-${i}`,
      title: `Add ${currentValue} to the previous prefix`,
      explanation: `Add the current value ${currentValue} (index ${i}) to the previous prefix sum ${previousPrefix}.`,
      detail: `prefix[${i + 1}] = prefix[${i}] + ${currentValue} = ${previousPrefix} + ${currentValue}`,
      array: prefixSnapshot(prefix, filled - 1),
      highlighted: [i],
      compared: [i],
      active: [i],
      eliminated: unfilledIndices(n + 1, filled - 1),
      pointers: [
        { index: i, label: 'prev' },
      ],
      operation: 'compare',
      meta: meta({
        phase: 'add',
        currentIndex: i,
        currentValue,
        previousPrefix,
        currentPrefix,
        left,
        right,
        queryResult,
        prefixFilled: filled - 1,
        formulaLeft: left,
        formulaRight,
      }),
    })

    steps.push({
      id: `prefix-sum-created-${i}`,
      title: `Prefix sum at index ${i + 1} is ${currentPrefix}`,
      explanation: `Store the result: prefix[${i + 1}] = ${currentPrefix}.`,
      detail: `prefix[${i + 1}] represents the sum of the first ${i + 1} element${i === 0 ? '' : 's'}.`,
      array: prefixSnapshot(prefix, filled),
      highlighted: [i + 1],
      active: [i + 1],
      found: [i + 1],
      eliminated: unfilledIndices(n + 1, filled),
      pointers: [{ index: i + 1, label: `prefix[${i + 1}]` }],
      operation: 'move',
      meta: meta({
        phase: 'prefix-created',
        currentIndex: i,
        currentValue,
        previousPrefix,
        currentPrefix,
        left,
        right,
        queryResult,
        prefixFilled: filled,
        formulaLeft: left,
        formulaRight,
      }),
    })
  }

  steps.push({
    id: 'prefix-sum-prefix-ready',
    title: 'Prefix array ready',
    explanation: `Prefix sum array is complete: ${formatArray(prefix)}. Now answer the range query.`,
    detail: `Query range: left = ${left}, right = ${right}`,
    array: prefix,
    sorted: prefix.map((_, index) => index),
    meta: meta({
      phase: 'query-start',
      currentIndex: -1,
      currentValue: 0,
      previousPrefix: 0,
      currentPrefix: 0,
      left,
      right,
      queryResult,
      prefixFilled: n + 1,
      formulaLeft: left,
      formulaRight,
    }),
  })

  steps.push({
    id: 'prefix-sum-query-range',
    title: 'Select the requested range',
    explanation: `Select the inclusive range from index ${left} to ${right}: ${formatArray(array.slice(left, right + 1))}.`,
    detail: 'Brute force would sum these values one by one. Prefix Sum reuses the precomputed totals.',
    array: prefix,
    highlighted: [left, formulaRight],
    left: [left],
    right: [formulaRight],
    eliminated: outsideRange(n + 1, left, formulaRight),
    pointers: [
      { index: left, label: 'left' },
      { index: formulaRight, label: 'right+1' },
    ],
    meta: meta({
      phase: 'query-start',
      currentIndex: -1,
      currentValue: 0,
      previousPrefix: 0,
      currentPrefix: 0,
      left,
      right,
      queryResult,
      prefixFilled: n + 1,
      formulaLeft: left,
      formulaRight,
    }),
  })

  steps.push({
    id: 'prefix-sum-query-left',
    title: `Look up prefix[left] = ${prefix[left]}`,
    explanation: `prefix[${left}] = ${prefix[left]} is the sum of the first ${left} element${left === 1 ? '' : 's'} — everything before the range.`,
    detail: `We will subtract this from prefix[${formulaRight}].`,
    array: prefix,
    compared: [left],
    active: [left],
    left: [left],
    pointers: [{ index: left, label: 'left' }],
    meta: meta({
      phase: 'query-left',
      currentIndex: left,
      currentValue: array[left]!,
      previousPrefix: 0,
      currentPrefix: prefix[left]!,
      left,
      right,
      queryResult,
      prefixFilled: n + 1,
      formulaLeft: left,
      formulaRight,
    }),
  })

  steps.push({
    id: 'prefix-sum-query-right',
    title: `Look up prefix[right + 1] = ${prefix[formulaRight]}`,
    explanation: `prefix[${formulaRight}] = ${prefix[formulaRight]} is the sum of the first ${formulaRight} elements — everything through index ${right}.`,
    detail: 'The +1 shifts from array indices to prefix indices.',
    array: prefix,
    compared: [formulaRight],
    active: [formulaRight],
    right: [formulaRight],
    pointers: [
      { index: left, label: 'left' },
      { index: formulaRight, label: 'right+1' },
    ],
    meta: meta({
      phase: 'query-right',
      currentIndex: right,
      currentValue: array[right]!,
      previousPrefix: prefix[left]!,
      currentPrefix: prefix[formulaRight]!,
      left,
      right,
      queryResult,
      prefixFilled: n + 1,
      formulaLeft: left,
      formulaRight,
    }),
  })

  steps.push({
    id: 'prefix-sum-query-calculate',
    title: 'Calculate the range sum',
    explanation: `Use prefix[right + 1] − prefix[left] to calculate the range sum: prefix[${formulaRight}] − prefix[${left}].`,
    detail: `${prefix[formulaRight]} − ${prefix[left]}`,
    array: prefix,
    compared: [left, formulaRight],
    left: [left],
    right: [formulaRight],
    pointers: [
      { index: left, label: 'left' },
      { index: formulaRight, label: 'right+1' },
    ],
    operation: 'compare',
    meta: meta({
      phase: 'query-calculate',
      currentIndex: -1,
      currentValue: 0,
      previousPrefix: prefix[left]!,
      currentPrefix: prefix[formulaRight]!,
      left,
      right,
      queryResult,
      prefixFilled: n + 1,
      formulaLeft: left,
      formulaRight,
    }),
  })

  steps.push({
    id: 'prefix-sum-query-result',
    title: `${prefix[formulaRight]} − ${prefix[left]} = ${queryResult}`,
    explanation: `The subtraction removes everything before the range, leaving the sum from index ${left} to ${right}.`,
    detail: `Result: ${queryResult}`,
    array: prefix,
    found: [left, formulaRight],
    left: [left],
    right: [formulaRight],
    pointers: [
      { index: left, label: 'left' },
      { index: formulaRight, label: 'right+1' },
    ],
    meta: meta({
      phase: 'query-result',
      currentIndex: -1,
      currentValue: 0,
      previousPrefix: prefix[left]!,
      currentPrefix: prefix[formulaRight]!,
      left,
      right,
      queryResult,
      prefixFilled: n + 1,
      formulaLeft: left,
      formulaRight,
    }),
  })

  steps.push({
    id: 'prefix-sum-complete',
    title: 'Complete',
    explanation: `The range sum from index ${left} to ${right} is ${queryResult}. Preprocessing was O(n); this query was O(1).`,
    detail: `Result: ${queryResult}`,
    array: prefix,
    found: [left, formulaRight],
    left: [left],
    right: [formulaRight],
    eliminated: outsideRange(n + 1, left, formulaRight),
    pointers: [
      { index: left, label: 'left' },
      { index: formulaRight, label: 'right+1' },
    ],
    operation: 'complete',
    meta: meta({
      phase: 'complete',
      currentIndex: -1,
      currentValue: 0,
      previousPrefix: prefix[left]!,
      currentPrefix: prefix[formulaRight]!,
      left,
      right,
      queryResult,
      prefixFilled: n + 1,
      formulaLeft: left,
      formulaRight,
    }),
  })

  return steps
}
