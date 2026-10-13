/**
 * Valid Anagram — decide whether two strings have the same character frequencies.
 *
 * Pure algorithm module used by the lesson code examples and visualization.
 * Comparison is exact: case-sensitive, spaces and punctuation count.
 * Does not mutate either input string.
 *
 * This beginner lesson scopes examples to ordinary BMP characters so
 * `.length` (UTF-16 code units) and `for...of` (code points) agree.
 */

export const VALID_ANAGRAM_DEFAULT_FIRST = 'listen' as const

export const VALID_ANAGRAM_DEFAULT_SECOND = 'silent' as const

export type ValidAnagramPair = {
  id: string
  label: string
  first: string
  second: string
}

export const VALID_ANAGRAM_PRESETS: readonly ValidAnagramPair[] = [
  {
    id: 'listen-silent',
    label: 'listen / silent',
    first: 'listen',
    second: 'silent',
  },
  {
    id: 'anagram-nagaram',
    label: 'anagram / nagaram',
    first: 'anagram',
    second: 'nagaram',
  },
  {
    id: 'rat-car',
    label: 'rat / car',
    first: 'rat',
    second: 'car',
  },
  {
    id: 'aacc-ccac',
    label: 'aacc / ccac',
    first: 'aacc',
    second: 'ccac',
  },
  {
    id: 'a-aa',
    label: 'a / aa',
    first: 'a',
    second: 'aa',
  },
  {
    id: 'a-A',
    label: 'a / A',
    first: 'a',
    second: 'A',
  },
  {
    id: 'spaces',
    label: 'a␠ / ␠a',
    first: 'a ',
    second: ' a',
  },
  {
    id: 'punctuation',
    label: 'a! / !a',
    first: 'a!',
    second: '!a',
  },
  {
    id: 'empty',
    label: '(empty / empty)',
    first: '',
    second: '',
  },
] as const

/**
 * Return true when both strings contain exactly the same characters
 * with the same frequencies (order ignored).
 */
export function isValidAnagram(first: string, second: string): boolean {
  if (first.length !== second.length) {
    return false
  }

  const frequency = new Map<string, number>()

  for (const char of first) {
    const count = frequency.get(char) ?? 0
    frequency.set(char, count + 1)
  }

  for (const char of second) {
    const count = frequency.get(char) ?? 0

    if (count === 0) {
      return false
    }

    frequency.set(char, count - 1)
  }

  return true
}

/** Build a frequency map for a string without mutating the input. */
export function buildCharacterFrequencyMap(
  value: string,
): Map<string, number> {
  const frequency = new Map<string, number>()

  for (const char of value) {
    const count = frequency.get(char) ?? 0
    frequency.set(char, count + 1)
  }

  return frequency
}
