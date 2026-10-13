import type { VisualizationStep } from '../../components/visualizations/types'
import { isValidAnagram } from './validAnagram'

export type ValidAnagramPhase =
  | 'initialize'
  | 'check-length'
  | 'read-first-character'
  | 'increment-frequency'
  | 'read-second-character'
  | 'decrement-frequency'
  | 'compare-counts'
  | 'valid'
  | 'invalid'
  | 'complete'

export type ValidAnagramFrequencyEntry = {
  key: string
  count: number
}

export type ValidAnagramResult = 'valid' | 'invalid' | null

type ValidAnagramMeta = {
  phase: ValidAnagramPhase
  firstString: string
  secondString: string
  currentIndex: number
  currentCharacter: string
  activeString: 'first' | 'second' | 'none'
  previousCount: number
  newCount: number
  frequencySnapshot: string
  result: ValidAnagramResult
  message: string
}

/** Serialize frequency entries (insertion order) for step meta. */
export function serializeValidAnagramEntries(
  entries: readonly ValidAnagramFrequencyEntry[],
): string {
  return JSON.stringify(entries.map((entry) => [entry.key, entry.count]))
}

/** Parse a frequency snapshot produced by serializeValidAnagramEntries. */
export function parseValidAnagramEntries(
  snapshot: string,
): ValidAnagramFrequencyEntry[] {
  if (!snapshot) {
    return []
  }

  try {
    const parsed: unknown = JSON.parse(snapshot)
    if (!Array.isArray(parsed)) {
      return []
    }

    const entries: ValidAnagramFrequencyEntry[] = []
    for (const item of parsed) {
      if (
        Array.isArray(item) &&
        item.length === 2 &&
        typeof item[0] === 'string' &&
        typeof item[1] === 'number'
      ) {
        entries.push({ key: item[0], count: item[1] })
      }
    }
    return entries
  } catch {
    return []
  }
}

function entriesFromMap(
  map: Map<string, number>,
): ValidAnagramFrequencyEntry[] {
  return [...map.entries()].map(([key, count]) => ({ key, count }))
}

function cloneEntries(
  entries: readonly ValidAnagramFrequencyEntry[],
): ValidAnagramFrequencyEntry[] {
  return entries.map((entry) => ({ key: entry.key, count: entry.count }))
}

function formatFrequencyDetail(
  entries: readonly ValidAnagramFrequencyEntry[],
): string {
  if (entries.length === 0) {
    return '(empty)'
  }
  return entries.map((entry) => `${displayChar(entry.key)} → ${entry.count}`).join(', ')
}

function displayChar(char: string): string {
  if (char === ' ') {
    return "' '"
  }
  if (char === '') {
    return '(empty)'
  }
  return char
}

function formatQuoted(value: string): string {
  return `"${value}"`
}

function indexArray(length: number): number[] {
  return Array.from({ length }, (_, index) => index)
}

function meta(
  fields: ValidAnagramMeta,
): NonNullable<VisualizationStep['meta']> {
  return {
    phase: fields.phase,
    firstString: fields.firstString,
    secondString: fields.secondString,
    currentIndex: fields.currentIndex,
    currentCharacter: fields.currentCharacter,
    activeString: fields.activeString,
    previousCount: fields.previousCount,
    newCount: fields.newCount,
    frequencySnapshot: fields.frequencySnapshot,
    result: fields.result,
    message: fields.message,
  }
}

function baseMeta(
  partial: Partial<ValidAnagramMeta> &
    Pick<ValidAnagramMeta, 'phase' | 'firstString' | 'secondString' | 'message'>,
): ValidAnagramMeta {
  return {
    phase: partial.phase,
    firstString: partial.firstString,
    secondString: partial.secondString,
    currentIndex: partial.currentIndex ?? -1,
    currentCharacter: partial.currentCharacter ?? '',
    activeString: partial.activeString ?? 'none',
    previousCount: partial.previousCount ?? 0,
    newCount: partial.newCount ?? 0,
    frequencySnapshot: partial.frequencySnapshot ?? '[]',
    result: partial.result ?? null,
    message: partial.message,
  }
}

/**
 * Builds a step-by-step VisualizationStep sequence for Valid Anagram.
 * Each step is an immutable snapshot. Pure data — no React state.
 */
export function buildValidAnagramSteps(
  firstInput: string,
  secondInput: string,
): VisualizationStep[] {
  const first = firstInput
  const second = secondInput
  const steps: VisualizationStep[] = []
  const emptySnapshot = serializeValidAnagramEntries([])
  const finalResult = isValidAnagram(first, second)
  const indices = indexArray(Math.max(first.length, second.length, 1))

  steps.push({
    id: 'valid-anagram-init',
    title: 'Start with two strings',
    explanation:
      'An anagram contains exactly the same characters with the same frequencies, regardless of order. We will count characters in the first string, then use the second string to cancel those counts.',
    detail: `First: ${formatQuoted(first)}. Second: ${formatQuoted(second)}. Map insertion order does not matter — only counts do.`,
    array: indices,
    operation: 'move',
    meta: meta(
      baseMeta({
        phase: 'initialize',
        firstString: first,
        secondString: second,
        frequencySnapshot: emptySnapshot,
        message:
          'Begin with an empty frequency map. Compare character counts, not key order.',
      }),
    ),
  })

  steps.push({
    id: 'valid-anagram-check-length',
    title: 'Compare lengths',
    explanation:
      first.length === second.length
        ? `Both strings have length ${first.length}. Lengths match, so continue.`
        : `Lengths differ: ${first.length} vs ${second.length}. Different lengths cannot be anagrams.`,
    detail: `length(first) = ${first.length}, length(second) = ${second.length}`,
    array: indices,
    operation: 'compare',
    meta: meta(
      baseMeta({
        phase: 'check-length',
        firstString: first,
        secondString: second,
        frequencySnapshot: emptySnapshot,
        result: first.length === second.length ? null : 'invalid',
        message:
          first.length === second.length
            ? 'Same length — proceed to count characters.'
            : 'Reject immediately: anagrams must have the same length.',
      }),
    ),
  })

  if (first.length !== second.length) {
    steps.push({
      id: 'valid-anagram-invalid-length',
      title: 'Not Anagrams',
      explanation:
        'Because the lengths differ, the strings cannot contain the same characters with the same frequencies.',
      detail: 'Result: Not Anagrams',
      array: indices,
      operation: 'complete',
      meta: meta(
        baseMeta({
          phase: 'invalid',
          firstString: first,
          secondString: second,
          frequencySnapshot: emptySnapshot,
          result: 'invalid',
          message: 'Not Anagrams — length check failed.',
        }),
      ),
    })

    steps.push({
      id: 'valid-anagram-complete-invalid-length',
      title: 'Check complete',
      explanation: 'The early length check rejected this pair.',
      detail: 'Result: Not Anagrams',
      array: indices,
      operation: 'complete',
      meta: meta(
        baseMeta({
          phase: 'complete',
          firstString: first,
          secondString: second,
          frequencySnapshot: emptySnapshot,
          result: 'invalid',
          message: 'Finished. Result: Not Anagrams.',
        }),
      ),
    })

    return steps
  }

  const frequency = new Map<string, number>()

  for (let i = 0; i < first.length; i += 1) {
    const char = first[i]!
    const previousCount = frequency.get(char) ?? 0
    const newCount = previousCount + 1
    const beforeSnapshot = serializeValidAnagramEntries(
      cloneEntries(entriesFromMap(frequency)),
    )

    steps.push({
      id: `valid-anagram-read-first-${i}`,
      title: `Read '${displayChar(char)}' from the first string`,
      explanation: `Read character ${displayChar(char)} at index ${i} in the first string.`,
      detail:
        previousCount === 0
          ? `Character ${displayChar(char)} is new in the map.`
          : `Character ${displayChar(char)} already has count ${previousCount}.`,
      array: indices,
      highlighted: [i],
      active: [i],
      pointers: [{ index: i, label: 'first' }],
      operation: 'compare',
      meta: meta(
        baseMeta({
          phase: 'read-first-character',
          firstString: first,
          secondString: second,
          currentIndex: i,
          currentCharacter: char,
          activeString: 'first',
          previousCount,
          newCount: previousCount,
          frequencySnapshot: beforeSnapshot,
          message: `Counting the first string at index ${i}.`,
        }),
      ),
    })

    frequency.set(char, newCount)
    const afterSnapshot = serializeValidAnagramEntries(
      cloneEntries(entriesFromMap(frequency)),
    )

    steps.push({
      id: `valid-anagram-increment-${i}`,
      title: `Increment count for '${displayChar(char)}'`,
      explanation: `Increase the frequency of ${displayChar(char)} from ${previousCount} to ${newCount}.`,
      detail: `${displayChar(char)} → ${newCount}`,
      array: indices,
      highlighted: [i],
      active: [i],
      found: [i],
      pointers: [{ index: i, label: 'first' }],
      operation: 'move',
      meta: meta(
        baseMeta({
          phase: 'increment-frequency',
          firstString: first,
          secondString: second,
          currentIndex: i,
          currentCharacter: char,
          activeString: 'first',
          previousCount,
          newCount,
          frequencySnapshot: afterSnapshot,
          message: `Map so far: ${formatFrequencyDetail(entriesFromMap(frequency))}`,
        }),
      ),
    })
  }

  const afterFirstSnapshot = serializeValidAnagramEntries(
    cloneEntries(entriesFromMap(frequency)),
  )

  if (first.length === 0) {
    steps.push({
      id: 'valid-anagram-empty-first-done',
      title: 'Both strings are empty',
      explanation:
        'Empty strings have the same length and no characters to count. They are valid anagrams of each other.',
      detail: 'frequency map stays empty',
      array: indices,
      operation: 'move',
      meta: meta(
        baseMeta({
          phase: 'compare-counts',
          firstString: first,
          secondString: second,
          frequencySnapshot: afterFirstSnapshot,
          message: 'No characters to process — counts already match.',
        }),
      ),
    })
  }

  let failedEarly = false

  for (let i = 0; i < second.length; i += 1) {
    const char = second[i]!
    const previousCount = frequency.get(char) ?? 0
    const beforeSnapshot = serializeValidAnagramEntries(
      cloneEntries(entriesFromMap(frequency)),
    )

    steps.push({
      id: `valid-anagram-read-second-${i}`,
      title: `Read '${displayChar(char)}' from the second string`,
      explanation: `Read character ${displayChar(char)} at index ${i} in the second string. Use it to cancel a count from the map.`,
      detail:
        previousCount === 0
          ? `Character ${displayChar(char)} is missing or already fully used — this will fail.`
          : `Current count for ${displayChar(char)} is ${previousCount}.`,
      array: indices,
      highlighted: [i],
      active: [i],
      compared: [i],
      pointers: [{ index: i, label: 'second' }],
      operation: 'compare',
      meta: meta(
        baseMeta({
          phase: 'read-second-character',
          firstString: first,
          secondString: second,
          currentIndex: i,
          currentCharacter: char,
          activeString: 'second',
          previousCount,
          newCount: previousCount,
          frequencySnapshot: beforeSnapshot,
          message: `Checking the second string at index ${i}.`,
        }),
      ),
    })

    if (previousCount === 0) {
      failedEarly = true

      steps.push({
        id: `valid-anagram-invalid-${i}`,
        title: 'Not Anagrams',
        explanation:
          previousCount === 0 && !frequency.has(char)
            ? `Character ${displayChar(char)} does not exist in the frequency map built from the first string.`
            : `Character ${displayChar(char)} has count 0 — the second string has more of this character than the first.`,
        detail: 'Result: Not Anagrams',
        array: indices,
        highlighted: [i],
        active: [i],
        operation: 'complete',
        meta: meta(
          baseMeta({
            phase: 'invalid',
            firstString: first,
            secondString: second,
            currentIndex: i,
            currentCharacter: char,
            activeString: 'second',
            previousCount: 0,
            newCount: 0,
            frequencySnapshot: beforeSnapshot,
            result: 'invalid',
            message: `Not Anagrams — problem at '${displayChar(char)}' in the second string.`,
          }),
        ),
      })

      steps.push({
        id: 'valid-anagram-complete-invalid',
        title: 'Check complete',
        explanation:
          'Decrementing failed because a character was missing or overused. The strings are not anagrams.',
        detail: 'Result: Not Anagrams',
        array: indices,
        operation: 'complete',
        meta: meta(
          baseMeta({
            phase: 'complete',
            firstString: first,
            secondString: second,
            currentIndex: i,
            currentCharacter: char,
            activeString: 'second',
            frequencySnapshot: beforeSnapshot,
            result: 'invalid',
            message: 'Finished. Result: Not Anagrams.',
          }),
        ),
      })

      break
    }

    const newCount = previousCount - 1
    frequency.set(char, newCount)
    const afterSnapshot = serializeValidAnagramEntries(
      cloneEntries(entriesFromMap(frequency)),
    )

    steps.push({
      id: `valid-anagram-decrement-${i}`,
      title: `Decrement count for '${displayChar(char)}'`,
      explanation: `Decrease the frequency of ${displayChar(char)} from ${previousCount} to ${newCount}.`,
      detail: `${displayChar(char)} → ${newCount}`,
      array: indices,
      highlighted: [i],
      active: [i],
      found: [i],
      pointers: [{ index: i, label: 'second' }],
      operation: 'move',
      meta: meta(
        baseMeta({
          phase: 'decrement-frequency',
          firstString: first,
          secondString: second,
          currentIndex: i,
          currentCharacter: char,
          activeString: 'second',
          previousCount,
          newCount,
          frequencySnapshot: afterSnapshot,
          message: `Map so far: ${formatFrequencyDetail(entriesFromMap(frequency))}`,
        }),
      ),
    })
  }

  if (!failedEarly) {
    const finalSnapshot = serializeValidAnagramEntries(
      cloneEntries(entriesFromMap(frequency)),
    )

    steps.push({
      id: 'valid-anagram-compare-counts',
      title: 'All characters matched',
      explanation:
        'Every character from the second string successfully decremented a count. Because the lengths matched and no count went negative, the frequencies are identical.',
      detail: `Final map: ${formatFrequencyDetail(entriesFromMap(frequency))}`,
      array: indices,
      operation: 'compare',
      meta: meta(
        baseMeta({
          phase: 'compare-counts',
          firstString: first,
          secondString: second,
          frequencySnapshot: finalSnapshot,
          result: finalResult ? 'valid' : 'invalid',
          message:
            'Map insertion order never mattered — only that every count canceled out.',
        }),
      ),
    })

    steps.push({
      id: 'valid-anagram-valid',
      title: 'Valid Anagram',
      explanation:
        'The two strings contain exactly the same characters with the same frequencies.',
      detail: 'Result: Valid Anagram',
      array: indices,
      sorted: indices,
      operation: 'complete',
      meta: meta(
        baseMeta({
          phase: 'valid',
          firstString: first,
          secondString: second,
          frequencySnapshot: finalSnapshot,
          result: 'valid',
          message: 'Valid Anagram',
        }),
      ),
    })

    steps.push({
      id: 'valid-anagram-complete',
      title: 'Check complete',
      explanation:
        'Frequency counting finished. The decrementing approach works because matching lengths plus successful canceling means every character appeared equally often.',
      detail: 'Result: Valid Anagram',
      array: indices,
      sorted: indices,
      operation: 'complete',
      meta: meta(
        baseMeta({
          phase: 'complete',
          firstString: first,
          secondString: second,
          frequencySnapshot: finalSnapshot,
          result: 'valid',
          message: 'Finished. Result: Valid Anagram.',
        }),
      ),
    })
  }

  return steps
}
