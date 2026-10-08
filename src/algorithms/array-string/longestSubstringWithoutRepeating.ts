/**
 * Longest Substring Without Repeating Characters — variable-size sliding window.
 *
 * Pure algorithm module used by the lesson code examples and visualization.
 * Uses a Set to track characters inside the current window. Does not mutate
 * the input string.
 */

export type LongestSubstringResult = {
  length: number
  start: number
  end: number
}

export const LONGEST_SUBSTRING_DEFAULT = 'abcabcbb' as const

export const LONGEST_SUBSTRING_PWWKEW = 'pwwkew' as const

export const LONGEST_SUBSTRING_AAAA = 'aaaa' as const

export const LONGEST_SUBSTRING_ABCDEF = 'abcdef' as const

export const LONGEST_SUBSTRING_BBBBB = 'bbbbb' as const

export const LONGEST_SUBSTRING_DVDF = 'dvdf' as const

export const LONGEST_SUBSTRING_ABBA = 'abba' as const

export const LONGEST_SUBSTRING_TMMZUXT = 'tmmzuxt' as const

export const LONGEST_SUBSTRING_SINGLE = 'a' as const

export const LONGEST_SUBSTRING_EMPTY = '' as const

export const LONGEST_SUBSTRING_PRESETS = [
  {
    id: 'lesson-default',
    label: 'abcabcbb',
    value: LONGEST_SUBSTRING_DEFAULT,
  },
  {
    id: 'pwwkew',
    label: 'pwwkew',
    value: LONGEST_SUBSTRING_PWWKEW,
  },
  {
    id: 'aaaa',
    label: 'aaaa',
    value: LONGEST_SUBSTRING_AAAA,
  },
  {
    id: 'abcdef',
    label: 'abcdef',
    value: LONGEST_SUBSTRING_ABCDEF,
  },
  {
    id: 'bbbbb',
    label: 'bbbbb',
    value: LONGEST_SUBSTRING_BBBBB,
  },
  {
    id: 'dvdf',
    label: 'dvdf',
    value: LONGEST_SUBSTRING_DVDF,
  },
  {
    id: 'abba',
    label: 'abba',
    value: LONGEST_SUBSTRING_ABBA,
  },
  {
    id: 'tmmzuxt',
    label: 'tmmzuxt',
    value: LONGEST_SUBSTRING_TMMZUXT,
  },
  {
    id: 'single',
    label: 'a',
    value: LONGEST_SUBSTRING_SINGLE,
  },
  {
    id: 'empty',
    label: '(empty)',
    value: LONGEST_SUBSTRING_EMPTY,
  },
] as const

/** Inclusive slice of the substring from start to end. */
export function getSubstring(
  value: string,
  start: number,
  end: number,
): string {
  if (
    value.length === 0 ||
    start < 0 ||
    end < 0 ||
    start > end ||
    end >= value.length
  ) {
    return ''
  }
  return value.slice(start, end + 1)
}

/**
 * Find the longest contiguous substring with all unique characters.
 * Empty string → length 0, start 0, end -1.
 */
export function longestSubstringWithoutRepeating(
  value: string,
): LongestSubstringResult {
  const seen = new Set<string>()

  let left = 0
  let bestStart = 0
  let bestEnd = -1

  for (let right = 0; right < value.length; right += 1) {
    while (seen.has(value[right]!)) {
      seen.delete(value[left]!)
      left += 1
    }

    seen.add(value[right]!)

    if (right - left + 1 > bestEnd - bestStart + 1) {
      bestStart = left
      bestEnd = right
    }
  }

  return {
    length: bestEnd >= bestStart ? bestEnd - bestStart + 1 : 0,
    start: bestStart,
    end: bestEnd,
  }
}
