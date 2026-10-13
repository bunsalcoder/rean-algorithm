import type { VisualizationStep } from '../../components/visualizations/types'
import { compressString } from './stringCompression'

export type StringCompressionPhase =
  | 'initialize'
  | 'read-character'
  | 'extend-run'
  | 'run-ended'
  | 'write-character'
  | 'write-count'
  | 'advance'
  | 'complete'

type StringCompressionMeta = {
  phase: StringCompressionPhase
  input: string
  currentIndex: number
  currentCharacter: string
  runCharacter: string
  runCount: number
  runStart: number
  runEnd: number
  output: string
  lastAppend: string
  processedEnd: number
  isComplete: boolean
  message: string
}

function meta(
  fields: StringCompressionMeta,
): NonNullable<VisualizationStep['meta']> {
  return {
    phase: fields.phase,
    input: fields.input,
    currentIndex: fields.currentIndex,
    currentCharacter: fields.currentCharacter,
    runCharacter: fields.runCharacter,
    runCount: fields.runCount,
    runStart: fields.runStart,
    runEnd: fields.runEnd,
    output: fields.output,
    lastAppend: fields.lastAppend,
    processedEnd: fields.processedEnd,
    isComplete: fields.isComplete,
    message: fields.message,
  }
}

function baseMeta(
  partial: Partial<StringCompressionMeta> &
    Pick<StringCompressionMeta, 'phase' | 'input' | 'message'>,
): StringCompressionMeta {
  return {
    phase: partial.phase,
    input: partial.input,
    currentIndex: partial.currentIndex ?? -1,
    currentCharacter: partial.currentCharacter ?? '',
    runCharacter: partial.runCharacter ?? '',
    runCount: partial.runCount ?? 0,
    runStart: partial.runStart ?? -1,
    runEnd: partial.runEnd ?? -1,
    output: partial.output ?? '',
    lastAppend: partial.lastAppend ?? '',
    processedEnd: partial.processedEnd ?? -1,
    isComplete: partial.isComplete ?? false,
    message: partial.message,
  }
}

function formatChar(char: string): string {
  if (char === ' ') {
    return "' '"
  }
  if (char === '') {
    return '(none)'
  }
  return `'${char}'`
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

/**
 * Builds a step-by-step VisualizationStep sequence for String Compression.
 * Each step is an immutable snapshot. Pure data — no React state.
 */
export function buildStringCompressionSteps(input: string): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const indices = Array.from(
    { length: Math.max(input.length, 1) },
    (_, i) => i,
  )
  const finalOutput = compressString(input)

  steps.push({
    id: 'string-compression-init',
    title: 'Start with an empty output',
    explanation:
      'Walk the string left to right. Count each consecutive run of identical characters, write the character, and write the count only when it is greater than one.',
    detail:
      input.length === 0
        ? 'Input: "" (empty)'
        : `Input: "${input}" (length ${input.length})`,
    array: indices,
    operation: 'move',
    meta: meta(
      baseMeta({
        phase: 'initialize',
        input,
        message:
          'Output starts empty. Ready to scan consecutive character runs.',
      }),
    ),
  })

  if (input.length === 0) {
    steps.push({
      id: 'string-compression-empty-complete',
      title: 'Empty input',
      explanation:
        'There are no characters to compress. Return an empty string.',
      detail: 'Result: ""',
      array: indices,
      operation: 'complete',
      meta: meta(
        baseMeta({
          phase: 'complete',
          input,
          output: '',
          isComplete: true,
          message: 'Finished. Result: "".',
        }),
      ),
    })

    return steps
  }

  let output = ''
  let i = 0
  let processedEnd = -1

  while (i < input.length) {
    const character = input[i]!
    let count = 1

    steps.push({
      id: `string-compression-read-${i}`,
      title: `Read ${formatChar(character)} at index ${i}`,
      explanation: `Begin a new run with ${formatChar(character)} at index ${i}. Count starts at 1.`,
      detail: `index ${i} of ${input.length}`,
      array: indices,
      highlighted: [i],
      active: [i],
      pointers: [{ index: i, label: 'i' }],
      operation: 'compare',
      meta: meta(
        baseMeta({
          phase: 'read-character',
          input,
          currentIndex: i,
          currentCharacter: character,
          runCharacter: character,
          runCount: 1,
          runStart: i,
          runEnd: i,
          output,
          processedEnd,
          message: `Starting run of ${formatChar(character)}.`,
        }),
      ),
    })

    while (i + count < input.length && input[i + count] === character) {
      const nextIndex = i + count
      count += 1

      steps.push({
        id: `string-compression-extend-${i}-${count}`,
        title: `Extend run of ${formatChar(character)}`,
        explanation: `Index ${nextIndex} is also ${formatChar(character)}. Run count is now ${count}.`,
        detail: `run [${i}…${i + count - 1}]`,
        array: indices,
        highlighted: rangeIndices(i, i + count - 1),
        active: [nextIndex],
        compared: [nextIndex],
        pointers: [
          { index: i, label: 'run' },
          { index: nextIndex, label: 'next' },
        ],
        operation: 'compare',
        meta: meta(
          baseMeta({
            phase: 'extend-run',
            input,
            currentIndex: nextIndex,
            currentCharacter: character,
            runCharacter: character,
            runCount: count,
            runStart: i,
            runEnd: i + count - 1,
            output,
            processedEnd,
            message: `Same character — count is ${count}.`,
          }),
        ),
      })
    }

    const runEnd = i + count - 1
    const nextAfterRun = i + count
    const endedBecause =
      nextAfterRun >= input.length
        ? 'end of string'
        : `next character ${formatChar(input[nextAfterRun]!)} differs`

    steps.push({
      id: `string-compression-run-ended-${i}`,
      title: `Run of ${formatChar(character)} ended`,
      explanation: `The run of ${formatChar(character)} has length ${count} (indices ${i}–${runEnd}). Reason: ${endedBecause}.`,
      detail:
        count > 1
          ? `Will write ${formatChar(character)} and count ${count}`
          : `Will write ${formatChar(character)} without a count`,
      array: indices,
      highlighted: rangeIndices(i, runEnd),
      found: rangeIndices(i, runEnd),
      pointers: [{ index: i, label: 'run' }],
      operation: 'compare',
      meta: meta(
        baseMeta({
          phase: 'run-ended',
          input,
          currentIndex: runEnd,
          currentCharacter: character,
          runCharacter: character,
          runCount: count,
          runStart: i,
          runEnd,
          output,
          processedEnd,
          message:
            count > 1
              ? `Count ${count} > 1 — write character and count.`
              : `Count is 1 — write character only.`,
        }),
      ),
    })

    output += character
    const charAppend = character

    steps.push({
      id: `string-compression-write-char-${i}`,
      title: `Write ${formatChar(character)}`,
      explanation: `Append ${formatChar(character)} to the compressed output.`,
      detail: `output → "${output}"`,
      array: indices,
      highlighted: rangeIndices(i, runEnd),
      operation: 'move',
      meta: meta(
        baseMeta({
          phase: 'write-character',
          input,
          currentIndex: runEnd,
          currentCharacter: character,
          runCharacter: character,
          runCount: count,
          runStart: i,
          runEnd,
          output,
          lastAppend: charAppend,
          processedEnd,
          message: `Appended ${formatChar(character)}.`,
        }),
      ),
    })

    if (count > 1) {
      const countText = String(count)
      output += countText

      steps.push({
        id: `string-compression-write-count-${i}`,
        title: `Write count ${count}`,
        explanation: `Count ${count} is greater than one, so append "${countText}" after the character.`,
        detail: `output → "${output}"`,
        array: indices,
        highlighted: rangeIndices(i, runEnd),
        found: rangeIndices(i, runEnd),
        operation: 'move',
        meta: meta(
          baseMeta({
            phase: 'write-count',
            input,
            currentIndex: runEnd,
            currentCharacter: character,
            runCharacter: character,
            runCount: count,
            runStart: i,
            runEnd,
            output,
            lastAppend: countText,
            processedEnd,
            message: `Appended count ${count}.`,
          }),
        ),
      })
    }

    processedEnd = runEnd
    i += count

    steps.push({
      id: `string-compression-advance-${processedEnd}`,
      title: i < input.length ? 'Advance to next run' : 'Past end of input',
      explanation:
        i < input.length
          ? `Advance past the finished run. Next index is ${i}.`
          : 'Every character has been processed. Ready to return the compressed string.',
      detail: `output so far: "${output}"`,
      array: indices,
      eliminated: rangeIndices(0, processedEnd),
      ...(i < input.length
        ? {
            highlighted: [i],
            pointers: [{ index: i, label: 'i' }],
          }
        : {}),
      operation: 'move',
      meta: meta(
        baseMeta({
          phase: 'advance',
          input,
          currentIndex: i < input.length ? i : -1,
          currentCharacter: i < input.length ? input[i]! : '',
          runCharacter: '',
          runCount: 0,
          runStart: -1,
          runEnd: -1,
          output,
          lastAppend: '',
          processedEnd,
          message:
            i < input.length
              ? `Continue from index ${i}.`
              : 'Scan complete.',
        }),
      ),
    })
  }

  steps.push({
    id: 'string-compression-complete',
    title: 'Compression complete',
    explanation:
      'Return the built output string. This educational format omits counts of 1; it is not a universal lossless encoding for arbitrary inputs with digits.',
    detail: `Result: "${finalOutput}"`,
    array: indices,
    sorted: indices,
    operation: 'complete',
    meta: meta(
      baseMeta({
        phase: 'complete',
        input,
        output: finalOutput,
        processedEnd: input.length - 1,
        isComplete: true,
        message: `Finished. Result: "${finalOutput}".`,
      }),
    ),
  })

  return steps
}
