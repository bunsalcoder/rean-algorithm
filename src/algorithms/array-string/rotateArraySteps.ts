import type { VisualizationStep } from '../../components/visualizations/types'
import { formatArray } from '../../components/visualizations/utils'
import {
  normalizeRotationK,
  rotateArrayRight,
} from './rotateArray'

export type RotateArrayPhase =
  | 'initialize'
  | 'normalize-k'
  | 'reverse-start'
  | 'compare-pointers'
  | 'swap'
  | 'advance-pointers'
  | 'reverse-complete'
  | 'phase-complete'
  | 'complete'

/** Which of the three reversal passes is active (0 = none / done). */
export type ReversePhaseNumber = 0 | 1 | 2 | 3

type RotateArrayMeta = {
  phase: RotateArrayPhase
  rawK: number
  normalizedK: number
  reversePhase: ReversePhaseNumber
  rangeStart: number
  rangeEnd: number
  left: number
  right: number
  swappedLeft: number
  swappedRight: number
  completedPhases: number
  isComplete: boolean
  message: string
}

function meta(
  fields: RotateArrayMeta,
): NonNullable<VisualizationStep['meta']> {
  return {
    phase: fields.phase,
    rawK: fields.rawK,
    normalizedK: fields.normalizedK,
    reversePhase: fields.reversePhase,
    rangeStart: fields.rangeStart,
    rangeEnd: fields.rangeEnd,
    left: fields.left,
    right: fields.right,
    swappedLeft: fields.swappedLeft,
    swappedRight: fields.swappedRight,
    completedPhases: fields.completedPhases,
    isComplete: fields.isComplete,
    message: fields.message,
  }
}

function baseMeta(
  partial: Partial<RotateArrayMeta> &
    Pick<RotateArrayMeta, 'phase' | 'rawK' | 'normalizedK' | 'message'>,
): RotateArrayMeta {
  return {
    phase: partial.phase,
    rawK: partial.rawK,
    normalizedK: partial.normalizedK,
    reversePhase: partial.reversePhase ?? 0,
    rangeStart: partial.rangeStart ?? -1,
    rangeEnd: partial.rangeEnd ?? -1,
    left: partial.left ?? -1,
    right: partial.right ?? -1,
    swappedLeft: partial.swappedLeft ?? -1,
    swappedRight: partial.swappedRight ?? -1,
    completedPhases: partial.completedPhases ?? 0,
    isComplete: partial.isComplete ?? false,
    message: partial.message,
  }
}

function rangeIndices(start: number, endInclusive: number): number[] {
  if (start < 0 || endInclusive < start) {
    return []
  }
  const indices: number[] = []
  for (let i = start; i <= endInclusive; i += 1) {
    indices.push(i)
  }
  return indices
}

function phaseTitle(reversePhase: ReversePhaseNumber): string {
  if (reversePhase === 1) {
    return 'Phase 1: Reverse the entire array'
  }
  if (reversePhase === 2) {
    return 'Phase 2: Reverse the first k elements'
  }
  if (reversePhase === 3) {
    return 'Phase 3: Reverse the remaining elements'
  }
  return 'Rotation'
}

function phaseWhy(reversePhase: ReversePhaseNumber, k: number): string {
  if (reversePhase === 1) {
    return 'Full reverse puts the future rotated prefix at the front (in reverse order).'
  }
  if (reversePhase === 2) {
    return `Reversing the first ${k} elements restores their relative order as the new prefix.`
  }
  if (reversePhase === 3) {
    return `Reversing indices ${k}…end restores the suffix so the whole array is right-rotated.`
  }
  return ''
}

/**
 * Builds a step-by-step VisualizationStep sequence for three-reversal
 * right rotation. Each step is an immutable snapshot. Pure data — no React.
 */
export function buildRotateArraySteps(
  input: readonly number[],
  k: number,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const n = input.length
  const working = [...input]
  const normalizedK = normalizeRotationK(k, n)
  const finalResult = rotateArrayRight([...input], k)

  steps.push({
    id: 'rotate-array-init',
    title: 'Start with a working copy',
    explanation:
      'Right-rotate by reversing the whole array, then the first k elements, then the rest. Work on a copy so the original input stays unchanged.',
    detail:
      n === 0
        ? `Input: [] · raw k = ${k}`
        : `Input: ${formatArray(working)} · raw k = ${k}`,
    array: [...working],
    highlighted: n > 0 ? rangeIndices(0, n - 1) : undefined,
    operation: 'move',
    meta: meta(
      baseMeta({
        phase: 'initialize',
        rawK: k,
        normalizedK,
        message:
          n === 0
            ? 'Array is empty — nothing to rotate.'
            : 'Working copy ready. Next: normalize k.',
      }),
    ),
  })

  if (n === 0) {
    steps.push({
      id: 'rotate-array-empty-complete',
      title: 'Empty array',
      explanation: 'There are no elements to rotate. Return an empty array.',
      detail: 'Result: []',
      array: [],
      operation: 'complete',
      meta: meta(
        baseMeta({
          phase: 'complete',
          rawK: k,
          normalizedK: 0,
          isComplete: true,
          message: 'Finished. Result: [].',
        }),
      ),
    })
    return steps
  }

  steps.push({
    id: 'rotate-array-normalize-k',
    title: 'Normalize k with modulo',
    explanation:
      k === normalizedK
        ? `k = ${k} already lies in [0, ${n}). Rotating by k is the same as rotating by k % n.`
        : `Rotating by ${k} is equivalent to rotating by ${normalizedK} because ${k} ≡ ${normalizedK} (mod ${n}). Negative k maps to an equivalent right rotation.`,
    detail: `n = ${n} · raw k = ${k} · normalized k = ${normalizedK}`,
    array: [...working],
    operation: 'move',
    meta: meta(
      baseMeta({
        phase: 'normalize-k',
        rawK: k,
        normalizedK,
        message:
          normalizedK === 0
            ? 'Normalized k is 0 — the array is already in the final order.'
            : `Will reverse ranges using k = ${normalizedK}.`,
      }),
    ),
  })

  if (normalizedK === 0) {
    steps.push({
      id: 'rotate-array-noop-complete',
      title: 'No rotation needed',
      explanation:
        'A normalized rotation of 0 leaves every element in place. Skip the three reversals.',
      detail: `Result: ${formatArray(working)}`,
      array: [...working],
      sorted: rangeIndices(0, n - 1),
      operation: 'complete',
      meta: meta(
        baseMeta({
          phase: 'complete',
          rawK: k,
          normalizedK,
          completedPhases: 0,
          isComplete: true,
          message: `Finished. Result: ${formatArray(working)}.`,
        }),
      ),
    })
    return steps
  }

  const phases: {
    reversePhase: ReversePhaseNumber
    start: number
    end: number
  }[] = [
    { reversePhase: 1, start: 0, end: n - 1 },
    { reversePhase: 2, start: 0, end: normalizedK - 1 },
    { reversePhase: 3, start: normalizedK, end: n - 1 },
  ]

  let completedPhases = 0

  for (const { reversePhase, start, end } of phases) {
    const why = phaseWhy(reversePhase, normalizedK)

    steps.push({
      id: `rotate-array-reverse-start-${reversePhase}`,
      title: phaseTitle(reversePhase),
      explanation: `${why} Reverse the inclusive range [${start}, ${end}].`,
      detail: `Range: indices ${start}…${end} · array: ${formatArray(working)}`,
      array: [...working],
      highlighted: rangeIndices(start, end),
      left: reversePhase === 2 ? rangeIndices(start, end) : undefined,
      right: reversePhase === 3 ? rangeIndices(start, end) : undefined,
      pointers:
        start <= end
          ? [
              { index: start, label: 'L' },
              { index: end, label: 'R' },
            ]
          : undefined,
      operation: 'move',
      meta: meta(
        baseMeta({
          phase: 'reverse-start',
          rawK: k,
          normalizedK,
          reversePhase,
          rangeStart: start,
          rangeEnd: end,
          left: start,
          right: end,
          completedPhases,
          message:
            start > end
              ? 'Empty range — nothing to reverse.'
              : start === end
                ? 'Single-element range — reverse is a no-op.'
                : `Place left at ${start} and right at ${end}.`,
        }),
      ),
    })

    let left = start
    let right = end

    if (left >= right) {
      steps.push({
        id: `rotate-array-reverse-complete-${reversePhase}-noop`,
        title: `Phase ${reversePhase} complete`,
        explanation:
          left > right
            ? 'The reverse range is empty, so the array is unchanged.'
            : 'A one-element range needs no swaps.',
        detail: `Array still ${formatArray(working)}`,
        array: [...working],
        highlighted: rangeIndices(start, end),
        operation: 'move',
        meta: meta(
          baseMeta({
            phase: 'reverse-complete',
            rawK: k,
            normalizedK,
            reversePhase,
            rangeStart: start,
            rangeEnd: end,
            left,
            right,
            completedPhases,
            message: `Phase ${reversePhase} finished without swaps.`,
          }),
        ),
      })
    } else {
      while (left < right) {
        steps.push({
          id: `rotate-array-compare-${reversePhase}-${left}-${right}`,
          title: 'Compare left and right pointers',
          explanation: `left (${left}) < right (${right}), so swap the values at these indices.`,
          detail: `${working[left]} ↔ ${working[right]}`,
          array: [...working],
          highlighted: rangeIndices(start, end),
          compared: [left, right],
          active: [left, right],
          pointers: [
            { index: left, label: 'L' },
            { index: right, label: 'R' },
          ],
          operation: 'compare',
          meta: meta(
            baseMeta({
              phase: 'compare-pointers',
              rawK: k,
              normalizedK,
              reversePhase,
              rangeStart: start,
              rangeEnd: end,
              left,
              right,
              completedPhases,
              message: `Pointers meet when left ≥ right. Currently ${left} < ${right}.`,
            }),
          ),
        })

        const leftValue = working[left]!
        const rightValue = working[right]!
        working[left] = rightValue
        working[right] = leftValue

        steps.push({
          id: `rotate-array-swap-${reversePhase}-${left}-${right}`,
          title: `Swap indices ${left} and ${right}`,
          explanation: `Swap ${leftValue} and ${rightValue}. Two-pointer reversal uses O(1) extra space — no slices.`,
          detail: `Array → ${formatArray(working)}`,
          array: [...working],
          highlighted: rangeIndices(start, end),
          swapped: [left, right],
          active: [left, right],
          pointers: [
            { index: left, label: 'L' },
            { index: right, label: 'R' },
          ],
          operation: 'swap',
          meta: meta(
            baseMeta({
              phase: 'swap',
              rawK: k,
              normalizedK,
              reversePhase,
              rangeStart: start,
              rangeEnd: end,
              left,
              right,
              swappedLeft: left,
              swappedRight: right,
              completedPhases,
              message: `Swapped ${leftValue} ↔ ${rightValue}.`,
            }),
          ),
        })

        left += 1
        right -= 1

        steps.push({
          id: `rotate-array-advance-${reversePhase}-${left}-${right}`,
          title: 'Advance pointers inward',
          explanation: `Move left to ${left} and right to ${right}${
            left < right
              ? ' and continue swapping.'
              : left === right
                ? '. Pointers meet — middle element stays.'
                : '. Pointers crossed — this reverse is done.'
          }`,
          detail: `Range still [${start}, ${end}]`,
          array: [...working],
          highlighted: rangeIndices(start, end),
          ...(left <= right
            ? {
                pointers: [
                  ...(left <= end && left >= start
                    ? [{ index: left, label: 'L' as const }]
                    : []),
                  ...(right >= start && right <= end
                    ? [{ index: right, label: 'R' as const }]
                    : []),
                ],
                active: [left, right].filter(
                  (index) => index >= start && index <= end,
                ),
              }
            : {}),
          operation: 'move',
          meta: meta(
            baseMeta({
              phase: 'advance-pointers',
              rawK: k,
              normalizedK,
              reversePhase,
              rangeStart: start,
              rangeEnd: end,
              left,
              right,
              completedPhases,
              message:
                left < right
                  ? 'Continue while left < right.'
                  : 'Pointers met or crossed — reverse complete.',
            }),
          ),
        })
      }

      steps.push({
        id: `rotate-array-reverse-complete-${reversePhase}`,
        title: `Reverse complete for phase ${reversePhase}`,
        explanation: `Finished reversing indices ${start}…${end}. ${why}`,
        detail: `Array → ${formatArray(working)}`,
        array: [...working],
        highlighted: rangeIndices(start, end),
        found: rangeIndices(start, end),
        operation: 'move',
        meta: meta(
          baseMeta({
            phase: 'reverse-complete',
            rawK: k,
            normalizedK,
            reversePhase,
            rangeStart: start,
            rangeEnd: end,
            left,
            right,
            completedPhases,
            message: `Phase ${reversePhase} reverse finished.`,
          }),
        ),
      })
    }

    completedPhases = reversePhase

    steps.push({
      id: `rotate-array-phase-complete-${reversePhase}`,
      title: `Phase ${reversePhase} done`,
      explanation:
        reversePhase === 3
          ? `All three reversals are finished. The working array is right-rotated by ${normalizedK}.`
          : `Phase ${reversePhase} of 3 is complete. Continue to the next reverse.`,
      detail: formatArray(working),
      array: [...working],
      ...(reversePhase === 1
        ? { highlighted: rangeIndices(0, n - 1) }
        : reversePhase === 2
          ? { left: rangeIndices(0, normalizedK - 1) }
          : { sorted: rangeIndices(0, n - 1) }),
      operation: 'move',
      meta: meta(
        baseMeta({
          phase: 'phase-complete',
          rawK: k,
          normalizedK,
          reversePhase,
          rangeStart: start,
          rangeEnd: end,
          completedPhases,
          message:
            reversePhase < 3
              ? `Completed phases: 1…${reversePhase}.`
              : 'Ready to return the rotated array.',
        }),
      ),
    })
  }

  steps.push({
    id: 'rotate-array-complete',
    title: 'Rotation complete',
    explanation: `Three reversals produce a right rotation by ${normalizedK}. The public API returns a new array; the caller's original stays unchanged.`,
    detail: `Result: ${formatArray(finalResult)}`,
    array: [...working],
    sorted: rangeIndices(0, n - 1),
    found: rangeIndices(0, n - 1),
    operation: 'complete',
    meta: meta(
      baseMeta({
        phase: 'complete',
        rawK: k,
        normalizedK,
        reversePhase: 0,
        completedPhases: 3,
        isComplete: true,
        message: `Finished. Result: ${formatArray(finalResult)}.`,
      }),
    ),
  })

  return steps
}
