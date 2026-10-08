import type { VisualizationStep } from '../../components/visualizations/types'
import {
  getSubstring,
  longestSubstringWithoutRepeating,
} from './longestSubstringWithoutRepeating'

export type LongestSubstringPhase =
  | 'initialize'
  | 'expand-right'
  | 'add-character'
  | 'duplicate-found'
  | 'shrink-left'
  | 'remove-character'
  | 'window-valid'
  | 'update-best'
  | 'complete'

type LongestSubstringMeta = {
  phase: LongestSubstringPhase
  originalString: string
  left: number
  right: number
  currentCharacter: string
  activeCharacters: string
  duplicateCharacter: string
  removedCharacter: string
  currentWindow: string
  currentLength: number
  bestStart: number
  bestEnd: number
  bestLength: number
  bestSubstring: string
  bestUpdated: boolean
}

/** Serialize Set contents in insertion order for step meta. */
export function serializeActiveCharacters(seen: Iterable<string>): string {
  return [...seen].join(',')
}

/** Parse a serialized active-character list. */
export function parseActiveCharacters(snapshot: string): string[] {
  if (snapshot === '') {
    return []
  }
  return snapshot.split(',')
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

function formatWindow(value: string, left: number, right: number): string {
  if (right < left || left < 0 || right < 0) {
    return '""'
  }
  return `"${getSubstring(value, left, right)}"`
}

function formatBest(value: string, start: number, end: number): string {
  if (end < start || end < 0) {
    return '""'
  }
  return `"${getSubstring(value, start, end)}"`
}

function bestLengthOf(start: number, end: number): number {
  return end >= start && end >= 0 ? end - start + 1 : 0
}

function meta(
  fields: LongestSubstringMeta,
): NonNullable<VisualizationStep['meta']> {
  return {
    phase: fields.phase,
    originalString: fields.originalString,
    left: fields.left,
    right: fields.right,
    currentCharacter: fields.currentCharacter,
    activeCharacters: fields.activeCharacters,
    duplicateCharacter: fields.duplicateCharacter,
    removedCharacter: fields.removedCharacter,
    currentWindow: fields.currentWindow,
    currentLength: fields.currentLength,
    bestStart: fields.bestStart,
    bestEnd: fields.bestEnd,
    bestLength: fields.bestLength,
    bestSubstring: fields.bestSubstring,
    bestUpdated: fields.bestUpdated,
  }
}

function baseMeta(
  partial: Partial<LongestSubstringMeta> &
    Pick<LongestSubstringMeta, 'phase' | 'originalString'>,
): LongestSubstringMeta {
  const bestStart = partial.bestStart ?? 0
  const bestEnd = partial.bestEnd ?? -1
  const bestLength =
    partial.bestLength ?? bestLengthOf(bestStart, bestEnd)
  const bestSubstring =
    partial.bestSubstring ??
    (bestEnd >= bestStart && bestEnd >= 0
      ? getSubstring(partial.originalString, bestStart, bestEnd)
      : '')

  return {
    phase: partial.phase,
    originalString: partial.originalString,
    left: partial.left ?? 0,
    right: partial.right ?? -1,
    currentCharacter: partial.currentCharacter ?? '',
    activeCharacters: partial.activeCharacters ?? '',
    duplicateCharacter: partial.duplicateCharacter ?? '',
    removedCharacter: partial.removedCharacter ?? '',
    currentWindow: partial.currentWindow ?? '',
    currentLength: partial.currentLength ?? 0,
    bestStart,
    bestEnd,
    bestLength,
    bestSubstring,
    bestUpdated: partial.bestUpdated ?? false,
  }
}

function indexArray(length: number): number[] {
  return Array.from({ length }, (_, index) => index)
}

/**
 * Builds a step-by-step VisualizationStep sequence for the variable-size
 * sliding window (Set-based) longest unique substring algorithm.
 * Each step is an immutable snapshot. Pure data — no React state.
 */
export function buildLongestSubstringWithoutRepeatingSteps(
  input: string,
): VisualizationStep[] {
  const value = input
  const steps: VisualizationStep[] = []
  const indices = indexArray(value.length)
  const result = longestSubstringWithoutRepeating(value)

  const seen = new Set<string>()
  let left = 0
  let bestStart = 0
  let bestEnd = -1

  steps.push({
    id: 'longest-substring-init',
    title: 'Initialize the window',
    explanation:
      'Start with an empty sliding window. The left and right pointers have not claimed any characters yet. The Set that tracks characters inside the window is empty.',
    detail: `String: "${value}". Left: 0. Right: (none). Best length: 0.`,
    array: indices,
    operation: 'move',
    meta: meta(
      baseMeta({
        phase: 'initialize',
        originalString: value,
        left: 0,
        right: -1,
        bestStart: 0,
        bestEnd: -1,
        bestLength: 0,
        bestSubstring: '',
      }),
    ),
  })

  if (value.length === 0) {
    steps.push({
      id: 'longest-substring-complete',
      title: 'Empty string',
      explanation:
        'The string is empty, so there is no valid substring. Return length 0.',
      detail: 'length = 0, start = 0, end = -1',
      array: [],
      operation: 'complete',
      meta: meta(
        baseMeta({
          phase: 'complete',
          originalString: value,
          left: 0,
          right: -1,
          bestStart: 0,
          bestEnd: -1,
          bestLength: 0,
          bestSubstring: '',
        }),
      ),
    })
    return steps
  }

  for (let right = 0; right < value.length; right += 1) {
    const char = value[right]!

    steps.push({
      id: `longest-substring-expand-${right}`,
      title: `Expand right to index ${right}`,
      explanation: `Move the right pointer to include '${char}' at index ${right}.`,
      detail: `Right = ${right}. Character under consideration: '${char}'.`,
      array: indices,
      active: [right],
      highlighted: rangeIndices(left, Math.max(left, right - 1)),
      pointers: [
        { index: left, label: 'left' },
        { index: right, label: 'right' },
      ],
      operation: 'move',
      meta: meta(
        baseMeta({
          phase: 'expand-right',
          originalString: value,
          left,
          right,
          currentCharacter: char,
          activeCharacters: serializeActiveCharacters(seen),
          currentWindow: getSubstring(value, left, right - 1),
          currentLength: right > left ? right - left : 0,
          bestStart,
          bestEnd,
        }),
      ),
    })

    let shrinkRound = 0
    while (seen.has(char)) {
      const duplicate = char
      const removing = value[left]!

      steps.push({
        id: `longest-substring-duplicate-${right}-${shrinkRound}`,
        title: `Duplicate '${duplicate}' found`,
        explanation: `'${duplicate}' already exists in the current window. The window is invalid until that earlier occurrence leaves.`,
        detail: `Active Set: { ${serializeActiveCharacters(seen).split(',').join(', ')} }. Duplicate: '${duplicate}'.`,
        array: indices,
        active: [right],
        compared: [right],
        highlighted: rangeIndices(left, right),
        found: rangeIndices(bestStart, bestEnd),
        pointers: [
          { index: left, label: 'left' },
          { index: right, label: 'right' },
        ],
        operation: 'compare',
        meta: meta(
          baseMeta({
            phase: 'duplicate-found',
            originalString: value,
            left,
            right,
            currentCharacter: char,
            activeCharacters: serializeActiveCharacters(seen),
            duplicateCharacter: duplicate,
            currentWindow: getSubstring(value, left, right - 1),
            currentLength: right > left ? right - left : 0,
            bestStart,
            bestEnd,
          }),
        ),
      })

      steps.push({
        id: `longest-substring-shrink-${right}-${shrinkRound}`,
        title: 'Shrink from the left',
        explanation: `Move the left pointer forward to restore uniqueness. About to remove '${removing}' at index ${left}.`,
        detail: `Left moves from ${left} toward ${left + 1}.`,
        array: indices,
        active: [right],
        moving: [left],
        highlighted: rangeIndices(left, right),
        found: rangeIndices(bestStart, bestEnd),
        pointers: [
          { index: left, label: 'left' },
          { index: right, label: 'right' },
        ],
        operation: 'move',
        meta: meta(
          baseMeta({
            phase: 'shrink-left',
            originalString: value,
            left,
            right,
            currentCharacter: char,
            activeCharacters: serializeActiveCharacters(seen),
            duplicateCharacter: duplicate,
            removedCharacter: removing,
            currentWindow: getSubstring(value, left, right - 1),
            currentLength: right > left ? right - left : 0,
            bestStart,
            bestEnd,
          }),
        ),
      })

      seen.delete(removing)
      left += 1

      steps.push({
        id: `longest-substring-remove-${right}-${shrinkRound}`,
        title: `Remove '${removing}' from the Set`,
        explanation: `Remove '${removing}' from the active window Set. Left is now ${left}.`,
        detail: `Active Set: { ${serializeActiveCharacters(seen).split(',').filter(Boolean).join(', ') || 'empty'} }.`,
        array: indices,
        active: [right],
        eliminated: [left - 1],
        highlighted: rangeIndices(left, Math.max(left, right - 1)),
        found: rangeIndices(bestStart, bestEnd),
        pointers: [
          { index: left, label: 'left' },
          { index: right, label: 'right' },
        ],
        operation: 'move',
        meta: meta(
          baseMeta({
            phase: 'remove-character',
            originalString: value,
            left,
            right,
            currentCharacter: char,
            activeCharacters: serializeActiveCharacters(seen),
            duplicateCharacter: seen.has(char) ? char : '',
            removedCharacter: removing,
            currentWindow: getSubstring(value, left, right - 1),
            currentLength: right > left ? right - left : 0,
            bestStart,
            bestEnd,
          }),
        ),
      })

      shrinkRound += 1
    }

    if (shrinkRound > 0) {
      steps.push({
        id: `longest-substring-valid-${right}`,
        title: 'Window is valid again',
        explanation: `The window no longer contains a duplicate of '${char}'. All characters inside are unique — safe to add the new character.`,
        detail: `Left = ${left}. Right = ${right}. Active Set: { ${serializeActiveCharacters(seen).split(',').filter(Boolean).join(', ') || 'empty'} }.`,
        array: indices,
        active: [right],
        highlighted: rangeIndices(left, right - 1),
        found: rangeIndices(bestStart, bestEnd),
        pointers: [
          { index: left, label: 'left' },
          { index: right, label: 'right' },
        ],
        operation: 'move',
        meta: meta(
          baseMeta({
            phase: 'window-valid',
            originalString: value,
            left,
            right,
            currentCharacter: char,
            activeCharacters: serializeActiveCharacters(seen),
            currentWindow: getSubstring(value, left, right - 1),
            currentLength: right > left ? right - left : 0,
            bestStart,
            bestEnd,
          }),
        ),
      })
    }

    seen.add(char)
    const currentLength = right - left + 1
    const currentWindow = getSubstring(value, left, right)

    steps.push({
      id: `longest-substring-add-${right}`,
      title: `Add '${char}' to the window`,
      explanation: `'${char}' is not inside the window, so add it to the Set. Current window is ${formatWindow(value, left, right)}.`,
      detail: `Active Set: { ${serializeActiveCharacters(seen).split(',').join(', ')} }. Length = ${currentLength}.`,
      array: indices,
      active: [right],
      highlighted: rangeIndices(left, right),
      candidate: [right],
      found: rangeIndices(bestStart, bestEnd),
      pointers: [
        { index: left, label: 'left' },
        { index: right, label: 'right' },
      ],
      operation: 'move',
      meta: meta(
        baseMeta({
          phase: 'add-character',
          originalString: value,
          left,
          right,
          currentCharacter: char,
          activeCharacters: serializeActiveCharacters(seen),
          currentWindow,
          currentLength,
          bestStart,
          bestEnd,
        }),
      ),
    })

    const previousBestLength = bestLengthOf(bestStart, bestEnd)
    if (currentLength > previousBestLength) {
      bestStart = left
      bestEnd = right

      steps.push({
        id: `longest-substring-best-${right}`,
        title: `Best length updated to ${currentLength}`,
        explanation: `This is the longest valid window so far. Best substring is ${formatBest(value, bestStart, bestEnd)} (indices ${bestStart}…${bestEnd}).`,
        detail: `Best length = ${currentLength}. Best start = ${bestStart}. Best end = ${bestEnd}.`,
        array: indices,
        active: [right],
        highlighted: rangeIndices(left, right),
        found: rangeIndices(bestStart, bestEnd),
        sorted: rangeIndices(bestStart, bestEnd),
        pointers: [
          { index: bestStart, label: 'best start' },
          { index: bestEnd, label: 'best end' },
        ],
        operation: 'mark-sorted',
        meta: meta(
          baseMeta({
            phase: 'update-best',
            originalString: value,
            left,
            right,
            currentCharacter: char,
            activeCharacters: serializeActiveCharacters(seen),
            currentWindow,
            currentLength,
            bestStart,
            bestEnd,
            bestUpdated: true,
          }),
        ),
      })
    }
  }

  const finalBest = result
  const finalWindow = getSubstring(value, left, value.length - 1)

  steps.push({
    id: 'longest-substring-complete',
    title: 'Longest unique substring found',
    explanation:
      finalBest.length === 0
        ? 'Finished scanning. No characters were present, so the longest length is 0.'
        : `Finished scanning. The longest substring without repeating characters is ${formatBest(value, finalBest.start, finalBest.end)} with length ${finalBest.length} (indices ${finalBest.start}…${finalBest.end}).`,
    detail: `length = ${finalBest.length}, start = ${finalBest.start}, end = ${finalBest.end}`,
    array: indices,
    found: rangeIndices(finalBest.start, finalBest.end),
    sorted: rangeIndices(finalBest.start, finalBest.end),
    operation: 'complete',
    meta: meta(
      baseMeta({
        phase: 'complete',
        originalString: value,
        left,
        right: value.length - 1,
        currentCharacter: value[value.length - 1] ?? '',
        activeCharacters: serializeActiveCharacters(seen),
        currentWindow: finalWindow,
        currentLength: finalWindow.length,
        bestStart: finalBest.start,
        bestEnd: finalBest.end,
        bestLength: finalBest.length,
        bestSubstring: getSubstring(value, finalBest.start, finalBest.end),
      }),
    ),
  })

  return steps
}
