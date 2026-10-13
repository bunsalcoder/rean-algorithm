/**
 * Group Anagrams — cluster words that share the same character multiset.
 *
 * Pure algorithm module for lessons and visualization.
 * Comparison is exact: case-sensitive, spaces and punctuation count.
 * Does not mutate the input array or its strings.
 *
 * Signatures use sorted characters (UTF-16 code units via spread).
 * Lesson examples use ordinary BMP characters; sorting code units is not
 * a universal grapheme-cluster canonical form for all Unicode text.
 */

export const GROUP_ANAGRAMS_DEFAULT_WORDS = [
  'eat',
  'tea',
  'tan',
  'ate',
  'nat',
  'bat',
] as const

export type GroupAnagramsPreset = {
  id: string
  label: string
  words: readonly string[]
}

export const GROUP_ANAGRAMS_PRESETS: readonly GroupAnagramsPreset[] = [
  {
    id: 'classic',
    label: 'eat, tea, tan, …',
    words: GROUP_ANAGRAMS_DEFAULT_WORDS,
  },
  {
    id: 'empty-array',
    label: '[]',
    words: [],
  },
  {
    id: 'empty-string',
    label: '[""]',
    words: [''],
  },
  {
    id: 'single',
    label: '["a"]',
    words: ['a'],
  },
  {
    id: 'mixed-length',
    label: 'ab, ba, abc, cab',
    words: ['ab', 'ba', 'abc', 'cab'],
  },
  {
    id: 'case-sensitive',
    label: 'a / A',
    words: ['a', 'A'],
  },
  {
    id: 'spaces',
    label: 'a␠ / ␠a',
    words: ['a ', ' a'],
  },
  {
    id: 'duplicate-words',
    label: 'eat × 2',
    words: ['eat', 'eat', 'tea'],
  },
] as const

/** Build a sorted-character signature for grouping anagrams. */
export function wordSignature(word: string): string {
  return [...word].sort().join('')
}

/**
 * Group words that are anagrams of each other.
 * Group order follows first-seen signature order; words keep input order.
 */
export function groupAnagrams(words: string[]): string[][] {
  const groups = new Map<string, string[]>()

  for (const word of words) {
    const signature = wordSignature(word)
    const bucket = groups.get(signature)

    if (bucket === undefined) {
      groups.set(signature, [word])
    } else {
      bucket.push(word)
    }
  }

  return [...groups.values()]
}

export type ParseGroupAnagramsResult =
  | { ok: true; words: string[] }
  | { ok: false; error: string }

/**
 * Parse learner input: JSON array of strings, or comma-separated tokens.
 * Empty tokens between commas are preserved as empty strings.
 */
export function parseGroupAnagramsInput(raw: string): ParseGroupAnagramsResult {
  const trimmed = raw.trim()

  if (trimmed === '') {
    return { ok: true, words: [] }
  }

  if (trimmed.startsWith('[')) {
    try {
      const parsed: unknown = JSON.parse(trimmed)
      if (!Array.isArray(parsed)) {
        return { ok: false, error: 'JSON input must be an array of strings.' }
      }

      const words: string[] = []
      for (const item of parsed) {
        if (typeof item !== 'string') {
          return { ok: false, error: 'Every array element must be a string.' }
        }
        words.push(item)
      }

      return { ok: true, words }
    } catch {
      return { ok: false, error: 'Invalid JSON array. Check quotes and brackets.' }
    }
  }

  return { ok: true, words: raw.split(',').map((part) => part) }
}

/** Format words for a compact display field (JSON array). */
export function formatGroupAnagramsInput(words: readonly string[]): string {
  return JSON.stringify([...words])
}

const ANAGRAM_WORD_POOL = [
  'eat',
  'tea',
  'tan',
  'ate',
  'nat',
  'bat',
  'cat',
  'act',
  'dog',
  'god',
  'rat',
  'tar',
  'art',
  'listen',
  'silent',
  'ab',
  'ba',
] as const

/** Pick a random non-empty word list for the visualizer. */
export function generateRandomGroupAnagramsWords(
  count = 6,
): string[] {
  const size = Math.max(1, Math.min(count, 10))
  const words: string[] = []

  for (let i = 0; i < size; i += 1) {
    const index = Math.floor(Math.random() * ANAGRAM_WORD_POOL.length)
    words.push(ANAGRAM_WORD_POOL[index]!)
  }

  return words
}
