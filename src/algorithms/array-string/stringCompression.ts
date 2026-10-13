/**
 * String Compression — run-length encode consecutive identical characters.
 *
 * Pure algorithm module for lessons and visualization.
 * Appends each character, then its run count only when the count is > 1.
 * Does not mutate the input string; builds a new output string.
 *
 * Iteration uses UTF-16 code-unit indices (`input.length` / `input[i]`),
 * matching the lesson pseudocode. Examples use ordinary BMP characters so
 * code units align with user-perceived characters. For arbitrary Unicode
 * (surrogate pairs, combining marks, grapheme clusters), this index walk is
 * not a universal grapheme-aware compressor.
 *
 * Omitting the count for single characters is unambiguous for letter-based
 * lesson examples. Inputs with digits or delimiter-like characters need an
 * escaping or delimiter strategy for a lossless round-trip — this lesson
 * teaches the simple educational format only.
 */

export const STRING_COMPRESSION_DEFAULT_INPUT = 'aaabbc' as const

export type StringCompressionPreset = {
  id: string
  label: string
  input: string
}

export const STRING_COMPRESSION_PRESETS: readonly StringCompressionPreset[] = [
  {
    id: 'aaabbc',
    label: 'aaabbc → a3b2c',
    input: 'aaabbc',
  },
  {
    id: 'abc',
    label: 'abc → abc',
    input: 'abc',
  },
  {
    id: 'aabbcc',
    label: 'aabbcc → a2b2c2',
    input: 'aabbcc',
  },
  {
    id: 'aaaaa',
    label: 'aaaaa → a5',
    input: 'aaaaa',
  },
  {
    id: 'aabbaa',
    label: 'aabbaa → a2b2a2',
    input: 'aabbaa',
  },
  {
    id: 'empty',
    label: '(empty)',
    input: '',
  },
  {
    id: 'single',
    label: 'a → a',
    input: 'a',
  },
  {
    id: 'spaces',
    label: 'a␠␠b',
    input: 'a  b',
  },
  {
    id: 'case-sensitive',
    label: 'aaAA',
    input: 'aaAA',
  },
] as const

/**
 * Compress consecutive runs: character, then count only when count > 1.
 * Returns a new string; does not modify `input`.
 */
export function compressString(input: string): string {
  let output = ''
  let i = 0

  while (i < input.length) {
    const character = input[i]!
    let count = 1

    while (i + count < input.length && input[i + count] === character) {
      count += 1
    }

    output += character
    if (count > 1) {
      output += String(count)
    }

    i += count
  }

  return output
}

const COMPRESSION_CHAR_POOL = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' as const

/** Pick a short random string with some repeated runs for the visualizer. */
export function generateRandomCompressionInput(length = 8): string {
  const size = Math.max(1, Math.min(length, 16))
  let result = ''
  let i = 0

  while (i < size) {
    const char =
      COMPRESSION_CHAR_POOL[
        Math.floor(Math.random() * COMPRESSION_CHAR_POOL.length)
      ]!
    const remaining = size - i
    const runLength = Math.min(
      remaining,
      1 + Math.floor(Math.random() * 3),
    )
    result += char.repeat(runLength)
    i += runLength
  }

  return result
}
