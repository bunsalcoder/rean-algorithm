import type { Lesson } from './types'

export const frequencyCounting: Lesson = {
  slug: 'frequency-counting',
  title: 'Frequency Counting',
  description:
    'Learn how to count occurrences efficiently using a frequency map.',
  category: 'Array & String',
  difficulty: 'Beginner',
  estimatedTime: '20–25 min',
  tags: [
    'Array & String',
    'Frequency Counting',
    'Hash Map',
    'Counting',
    'Duplicates',
    'Beginner',
  ],

  objectives: [
    'Understand the idea of frequency counting.',
    'Learn how to build a frequency map.',
    'Understand why a hash map makes counting efficient.',
    'Find duplicates using frequencies.',
    'Find the most frequent value.',
    'Apply frequency counting to arrays and strings.',
    'Understand the time and space complexity.',
  ],

  overview: [
    'Instead of repeatedly scanning the array to count how many times each value appears, keep a running count in a hash map.',
    'Example array: [2, 1, 2, 3, 1, 2, 4]. Walk left to right and update counts: 2 → 1, then 1 → 1, then 2 → 2, then 3 → 1, then 1 → 2, then 2 → 3, then 4 → 1.',
    'Final frequency map: { 1: 2, 2: 3, 3: 1, 4: 1 }. Each key is a value from the input; each mapped value is how many times that key appeared.',
    'The same idea works for characters and strings. For "banana": b → 1, a → 3, n → 2. Numbers, characters, strings, categories, and identifiers can all be counted this way.',
  ],

  whyItMatters: [
    'A simple question like “How many times does 2 appear?” can be answered by scanning the whole array. That works once — but if you ask repeatedly, you scan repeatedly.',
    'Frequency counting changes the approach: first build the frequency map in one pass, then answer with a lookup. After building the map, frequency[2] immediately tells you 3.',
    'General pattern: Data → Build frequency map → Answer questions using stored counts. This pattern appears often in algorithm problems.',
    'Tradeoff: use extra memory for the map so later counting and lookups are much faster than rescanning the array each time.',
  ],

  visualization: {
    title: 'Frequency Counting in action',
    description:
      'Watch an empty frequency map fill as each array value is read, created, or incremented.',
    type: 'frequency-counting',
  },

  steps: [
    {
      title: 'Start with an empty map',
      description:
        'Create an empty frequency map. No values have been counted yet.',
    },
    {
      title: 'Read the next value',
      description:
        'Walk the array from left to right. For [2, 1, 2, 3, 1, 2, 4], start with 2.',
    },
    {
      title: 'Create or increment',
      description:
        'If the value is new, create an entry with count 1. If it already exists, increase its count by 1.',
    },
    {
      title: 'Continue until the end',
      description:
        'After the full pass the map is { 1: 2, 2: 3, 3: 1, 4: 1 }.',
    },
    {
      title: 'Answer questions from the map',
      description:
        'Duplicates are values with count > 1. The most frequent value here is 2 (count 3).',
    },
  ],

  complexity: {
    time: {
      best: 'O(n)',
      average: 'O(n)',
      worst: 'O(n)',
    },
    space: 'O(k)',
    notes: {
      time: [
        'Building the frequency map takes O(n) time for an array of length n.',
        'Hash map operations are typically O(1) on average, so each update is efficient in practice.',
        'Finding the most frequent value after the map is built takes another O(n) scan (or O(k) over the map keys).',
        'Overall for build + most-frequent: O(n) time.',
        'Brute force that rescans for every distinct value is much slower when you need many counts.',
      ],
      space: [
        'Space is O(k), where k is the number of distinct values.',
        'In the worst case every value is unique, so space is O(n).',
        'The input array is not mutated.',
      ],
    },
  },

  pseudocode: `BuildFrequencyMap(array)
    frequency = empty map

    for each value in array
        if value exists in frequency
            frequency[value] = frequency[value] + 1
        else
            frequency[value] = 1

    return frequency`,

  code: {
    python: `def build_frequency_map(arr):
    frequency = {}

    for value in arr:
        frequency[value] = frequency.get(value, 0) + 1

    return frequency


def find_most_frequent(arr):
    if not arr:
        return None

    frequency = build_frequency_map(arr)

    most_frequent = arr[0]

    for value in arr:
        if frequency[value] > frequency[most_frequent]:
            most_frequent = value

    return most_frequent


# Example
values = [2, 1, 2, 3, 1, 2, 4]
print(build_frequency_map(values))  # {2: 3, 1: 2, 3: 1, 4: 1}
print(find_most_frequent(values))   # 2`,
    javascript: `function buildFrequencyMap(arr) {
  const frequency = new Map();

  for (const value of arr) {
    const currentCount = frequency.get(value) ?? 0;
    frequency.set(value, currentCount + 1);
  }

  return frequency;
}

function findMostFrequent(arr) {
  if (arr.length === 0) {
    return null;
  }

  const frequency = buildFrequencyMap(arr);
  let mostFrequent = arr[0];

  for (const value of arr) {
    if (
      frequency.get(value) >
      frequency.get(mostFrequent)
    ) {
      mostFrequent = value;
    }
  }

  return mostFrequent;
}

// Example
const values = [2, 1, 2, 3, 1, 2, 4];
console.log(buildFrequencyMap(values)); // Map { 2 => 3, 1 => 2, 3 => 1, 4 => 1 }
console.log(findMostFrequent(values));  // 2`,
    typescript: `function buildFrequencyMap(
  arr: number[],
): Map<number, number> {
  const frequency = new Map<number, number>();

  for (const value of arr) {
    const currentCount = frequency.get(value) ?? 0;
    frequency.set(value, currentCount + 1);
  }

  return frequency;
}

function findMostFrequent(
  arr: number[],
): number | null {
  if (arr.length === 0) {
    return null;
  }

  const frequency = buildFrequencyMap(arr);
  let mostFrequent = arr[0];

  for (const value of arr) {
    const currentCount = frequency.get(value) ?? 0;
    const mostFrequentCount =
      frequency.get(mostFrequent) ?? 0;

    if (currentCount > mostFrequentCount) {
      mostFrequent = value;
    }
  }

  return mostFrequent;
}

// Example
const values: number[] = [2, 1, 2, 3, 1, 2, 4];
console.log(buildFrequencyMap(values)); // Map(4) { 2 => 3, 1 => 2, 3 => 1, 4 => 1 }
console.log(findMostFrequent(values));  // 2`,
  },

  whenToUse: [
    'Counting duplicates',
    'Finding the most frequent element',
    'Checking whether two collections contain the same frequencies',
    'Character frequency',
    'Counting categories',
    'Grouping values by occurrence',
    'Anagram-related problems (counting is the foundation; full anagram algorithms come later)',
    'Many hash-map based interview problems',
  ],

  whenNotToUse: [
    'You only need to process each value once and never need counts again.',
    'The number of distinct values is extremely large and memory matters.',
    'A simpler direct traversal is sufficient for the problem.',
    'Another data structure is more appropriate for the question being asked.',
  ],

  keyTakeaways: [
    'Frequency counting stores running counts in a hash map instead of rescanning.',
    'Key = value, value = number of occurrences.',
    'Build once in O(n), then answer count questions from the map.',
    'Space is O(k) for k distinct values (O(n) in the worst case).',
    'Any frequency greater than 1 means that value is duplicated.',
    'The most frequent value is the key with the largest count (ties: first encountered).',
    'The same pattern works for numbers, characters, strings, and categories.',
    'Hash map operations are typically O(1) on average — not a mathematical guarantee in every case.',
  ],

  thinkingGuide: {
    title: 'Applications: Duplicates & Most Frequent',
    description:
      'Once the frequency map exists, several common questions become simple lookups or short scans.',
    steps: [
      'Example: [2, 1, 2, 3, 1] → { 2: 2, 1: 2, 3: 1 }',
      'Any frequency > 1 is a duplicate: 2 and 1 are duplicated; 3 is unique.',
      'Example: [2, 1, 2, 3, 1, 2, 4] → { 1: 2, 2: 3, 3: 1, 4: 1 }',
      'Most frequent value: 2, because it appears 3 times.',
      'String example: "banana" → { b: 1, a: 3, n: 2 } — same idea, different key type.',
    ],
  },

  commonMistakes: {
    description:
      'These mistakes show up often when learners first implement frequency maps.',
    mistakes: [
      {
        title: 'Forgetting to initialize a missing key',
        explanation:
          'Reading frequency[value] before it exists can yield undefined/None. Use get(value, 0) or check membership before incrementing.',
      },
      {
        title: 'Accidentally resetting the count instead of incrementing',
        explanation:
          'Writing frequency[value] = 1 on every visit wipes previous counts. Always add 1 to the previous count.',
      },
      {
        title: 'Confusing the key with the count',
        explanation:
          'The key is the original value (for example 2). The mapped value is how many times it appeared (for example 3).',
      },
      {
        title: 'Mutating the original input unnecessarily',
        explanation:
          'Build a separate map. Leave the input array or string unchanged unless the problem asks otherwise.',
      },
      {
        title: 'Forgetting the empty-array case',
        explanation:
          'findMostFrequent([]) should return null / None. Guard empty inputs before indexing arr[0].',
      },
      {
        title: 'Assuming Map/object operations are always mathematically O(1)',
        explanation:
          'Hash map operations are typically O(1) on average. Worst-case behavior can be worse depending on the implementation and inputs.',
      },
      {
        title: 'Using sorting when a frequency map is simpler',
        explanation:
          'Sorting can help some counting problems, but a frequency map often answers “how many?” and “most frequent?” more directly in O(n) expected time.',
      },
    ],
  },

  algorithmConnection: {
    title: 'Brute Force vs Frequency Counting',
    eyebrow: 'COMPARE',
    description:
      'Both approaches can count occurrences. The difference is how much work is repeated.',
    items: [
      {
        title: 'Brute Force',
        description:
          'For each distinct value, scan the entire array. Repeated questions mean repeated full scans.',
      },
      {
        title: 'Frequency Counting',
        description:
          'Scan once and update counts. Then use the stored map for lookups. Extra memory buys faster repeated counting.',
      },
    ],
  },

  previousLesson: {
    title: 'Prefix Sum',
    href: '/learn/prefix-sum',
  },

  nextLesson: {
    title: "Kadane's Algorithm / Maximum Subarray (Coming Soon)",
    href: '/algorithms/array-string',
  },

  categoryHref: '/algorithms/array-string',
}
