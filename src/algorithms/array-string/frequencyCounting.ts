/**
 * Frequency Counting — count occurrences with a hash map.
 *
 * Pure algorithm module used by the lesson code examples and visualization.
 * Does not mutate the input.
 */

export const FREQUENCY_COUNTING_DEFAULT_ARRAY = [2, 1, 2, 3, 1, 2, 4] as const

export const FREQUENCY_COUNTING_ALT_ARRAY = [2, 1, 2, 3, 1] as const

export const FREQUENCY_COUNTING_NEGATIVE_ARRAY = [-2, -1, -2, 3] as const

export const FREQUENCY_COUNTING_ZEROS_ARRAY = [0, 0, 1, 0] as const

export const FREQUENCY_COUNTING_UNIQUE_ARRAY = [1, 2, 3, 4] as const

export const FREQUENCY_COUNTING_ARRAY_PRESETS = [
  {
    id: 'lesson-default',
    label: 'Lesson array',
    values: FREQUENCY_COUNTING_DEFAULT_ARRAY,
  },
  {
    id: 'with-duplicates',
    label: 'Duplicates',
    values: FREQUENCY_COUNTING_ALT_ARRAY,
  },
  {
    id: 'with-negatives',
    label: 'With negatives',
    values: FREQUENCY_COUNTING_NEGATIVE_ARRAY,
  },
  {
    id: 'with-zeros',
    label: 'With zeros',
    values: FREQUENCY_COUNTING_ZEROS_ARRAY,
  },
  {
    id: 'all-unique',
    label: 'All unique',
    values: FREQUENCY_COUNTING_UNIQUE_ARRAY,
  },
] as const

/**
 * Build a frequency map: key = value, value = number of occurrences.
 * Hash map operations are typically O(1) on average.
 */
export function buildFrequencyMap(
  arr: readonly number[],
): Map<number, number> {
  const frequency = new Map<number, number>()

  for (const value of arr) {
    const currentCount = frequency.get(value) ?? 0
    frequency.set(value, currentCount + 1)
  }

  return frequency
}

/**
 * Return the value that appears most often.
 * Empty arrays return null.
 * Ties: prefer the first value encountered with the highest frequency.
 */
export function findMostFrequent(arr: readonly number[]): number | null {
  if (arr.length === 0) {
    return null
  }

  const frequency = buildFrequencyMap(arr)
  let mostFrequent = arr[0]!

  for (const value of arr) {
    const currentCount = frequency.get(value) ?? 0
    const mostFrequentCount = frequency.get(mostFrequent) ?? 0

    if (currentCount > mostFrequentCount) {
      mostFrequent = value
    }
  }

  return mostFrequent
}

/** Values whose frequency is greater than 1. */
export function findDuplicates(arr: readonly number[]): number[] {
  const frequency = buildFrequencyMap(arr)
  const duplicates: number[] = []

  for (const [value, count] of frequency) {
    if (count > 1) {
      duplicates.push(value)
    }
  }

  return duplicates
}
