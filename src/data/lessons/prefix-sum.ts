import type { Lesson } from './types'

export const prefixSum: Lesson = {
  slug: 'prefix-sum',
  title: 'Prefix Sum',
  description:
    'Learn how to preprocess an array so that range-sum queries can be answered efficiently.',
  category: 'Array & String',
  difficulty: 'Beginner',
  estimatedTime: '20–25 min',
  tags: [
    'Array & String',
    'Prefix Sum',
    'Arrays',
    'Range Queries',
    'O(1)',
    'Beginner',
    'Intermediate',
  ],

  objectives: [
    'Understand what a prefix sum represents.',
    'Build a prefix sum array using the leading-zero convention.',
    'Use prefix sums to calculate range sums efficiently.',
    'Understand the difference between preprocessing time and query time.',
    'Recognize when Prefix Sum is useful.',
    'Understand the tradeoff between extra space and faster queries.',
  ],

  overview: [
    'Instead of calculating the same part of an array again and again, calculate cumulative sums once and reuse them.',
    'Example original array: [2, 4, 1, 6, 3, 5]. With a leading zero, the prefix array is [0, 2, 6, 7, 13, 16, 21].',
    'prefix[i] represents the sum of the first i elements. So prefix[0] = 0, prefix[1] = 2, prefix[2] = 2 + 4 = 6, prefix[3] = 2 + 4 + 1 = 7, and so on.',
    'This lesson uses the leading-zero prefix convention consistently. That makes range sums a simple subtraction: prefix[right + 1] − prefix[left].',
    'The array does not need to be sorted. Positive numbers, negatives, zeros, and duplicates are all supported.',
  ],

  whyItMatters: [
    'Repeated range-sum queries on the same array are expensive if you walk the range every time.',
    'Example: sum from index 1 to 4 in [2, 4, 1, 6, 3, 5] is 4 + 1 + 6 + 3 = 14. Brute force can take O(n) per query.',
    'With many queries, repeatedly scanning the array becomes costly.',
    'Prefix Sum preprocesses once in O(n), then answers each range-sum query in O(1).',
    'Tradeoff: more memory and preprocessing time in exchange for much faster range queries.',
  ],

  visualization: {
    title: 'Prefix Sum in action',
    description:
      'Watch the prefix array being built with a leading zero, then answer a range-sum query with prefix[right + 1] − prefix[left].',
    type: 'prefix-sum',
  },

  steps: [
    {
      title: 'Start with a leading zero',
      description:
        'Create a prefix array of length n + 1 filled with 0. prefix[0] = 0 is the sum of zero elements.',
    },
    {
      title: 'Read each original value',
      description:
        'Walk the original array from left to right. For [2, 4, 1, 6, 3, 5], start with 2.',
    },
    {
      title: 'Add to the previous prefix',
      description:
        'prefix[i + 1] = prefix[i] + array[i]. Example: prefix[1] = prefix[0] + 2 = 2.',
    },
    {
      title: 'Store the result',
      description:
        'Continue until the prefix array is complete: [0, 2, 6, 7, 13, 16, 21].',
    },
    {
      title: 'Answer a range query',
      description:
        'For left = 1 and right = 4, compute prefix[5] − prefix[1] = 16 − 2 = 14.',
    },
  ],

  complexity: {
    time: {
      best: 'O(n + q)',
      average: 'O(n + q)',
      worst: 'O(n + q)',
    },
    space: 'O(n)',
    notes: {
      time: [
        'Building the prefix array takes O(n) time.',
        'Each range-sum query then takes O(1) time.',
        'For q queries after preprocessing: O(n) + O(q) = O(n + q).',
        'Brute force answers each query in O(n), so q queries cost O(n × q).',
        'Prefix Sum is especially useful when the same array receives many range-sum queries. It is not always better for a single trivial query.',
      ],
      space: [
        'The prefix array uses O(n) extra memory (n + 1 entries with the leading zero).',
        'The input array is not mutated.',
      ],
    },
  },

  pseudocode: `BuildPrefixSum(array)
    prefix = array of length array.length + 1 filled with 0

    for i from 0 to array.length - 1
        prefix[i + 1] = prefix[i] + array[i]

    return prefix


RangeSum(prefix, left, right)
    return prefix[right + 1] - prefix[left]`,

  code: {
    python: `def build_prefix_sum(arr):
    prefix = [0] * (len(arr) + 1)

    for i in range(len(arr)):
        prefix[i + 1] = prefix[i] + arr[i]

    return prefix


def range_sum(prefix, left, right):
    return prefix[right + 1] - prefix[left]


# Example
values = [2, 4, 1, 6, 3, 5]
prefix = build_prefix_sum(values)
print(prefix)  # [0, 2, 6, 7, 13, 16, 21]
print(range_sum(prefix, 1, 4))  # 14`,
    javascript: `function buildPrefixSum(arr) {
  const prefix = new Array(arr.length + 1).fill(0);

  for (let i = 0; i < arr.length; i += 1) {
    prefix[i + 1] = prefix[i] + arr[i];
  }

  return prefix;
}

function rangeSum(prefix, left, right) {
  return prefix[right + 1] - prefix[left];
}

// Example
const values = [2, 4, 1, 6, 3, 5];
const prefix = buildPrefixSum(values);
console.log(prefix); // [0, 2, 6, 7, 13, 16, 21]
console.log(rangeSum(prefix, 1, 4)); // 14`,
    typescript: `function buildPrefixSum(arr: number[]): number[] {
  const prefix = new Array(arr.length + 1).fill(0);

  for (let i = 0; i < arr.length; i += 1) {
    prefix[i + 1] = prefix[i]! + arr[i]!;
  }

  return prefix;
}

function rangeSum(
  prefix: number[],
  left: number,
  right: number,
): number {
  return prefix[right + 1]! - prefix[left]!;
}

// Example
const values: number[] = [2, 4, 1, 6, 3, 5];
const prefix = buildPrefixSum(values);
console.log(prefix); // [0, 2, 6, 7, 13, 16, 21]
console.log(rangeSum(prefix, 1, 4)); // 14`,
  },

  whenToUse: [
    'Many range-sum queries on the same array.',
    'Static or mostly static arrays.',
    'Subarray and range calculations.',
    'Cumulative totals.',
    'Problems involving repeated interval sums.',
    'Competitive programming and algorithmic problem solving.',
    'Examples: “Find the sum from index L to R many times,” “answer multiple interval sum queries,” or “calculate cumulative totals.”',
  ],

  whenNotToUse: [
    'The array changes frequently and updates must be reflected immediately.',
    'Only one simple range query exists — preprocessing may be unnecessary.',
    'Extra O(n) memory is undesirable.',
    'A different data structure is better for frequent updates and queries.',
    'Problems with frequent updates may need structures such as a Fenwick Tree or Segment Tree (not covered in this lesson).',
  ],

  keyTakeaways: [
    'prefix[i] is the sum of the first i elements (leading-zero convention).',
    'Build once in O(n), then answer each range sum in O(1).',
    'Range formula: prefix[right + 1] − prefix[left].',
    'Extra O(n) space buys much faster repeated queries.',
    'The array does not need to be sorted.',
    'Negative numbers, zeros, and duplicates are supported.',
    'Prefix Sum is a preprocessing pattern, not a universal solution for every array problem.',
  ],

  thinkingGuide: {
    title: 'Why the Leading Zero Helps',
    description:
      'The extra zero at prefix[0] keeps the range formula consistent for every inclusive [left, right] pair.',
    steps: [
      'Original: [2, 4, 1, 6, 3, 5]',
      'prefix[1] = prefix[0] + 2 = 2',
      'prefix[2] = prefix[1] + 4 = 6',
      'prefix[3] = prefix[2] + 1 = 7',
      'prefix[4] = prefix[3] + 6 = 13',
      'prefix[5] = prefix[4] + 3 = 16',
      'prefix[6] = prefix[5] + 5 = 21',
      'Query left = 1, right = 4 → prefix[5] − prefix[1] = 16 − 2 = 14',
    ],
  },

  commonMistakes: {
    description:
      'These mistakes show up often when learners first implement Prefix Sum with a leading zero.',
    mistakes: [
      {
        title: 'Off-by-one errors',
        explanation:
          'Mixing whether ranges are inclusive/exclusive, or forgetting that prefix length is n + 1, leads to wrong indices.',
      },
      {
        title: 'Forgetting the extra zero at prefix[0]',
        explanation:
          'Without the leading zero, the range formula becomes inconsistent for queries that start at index 0.',
      },
      {
        title: 'Using prefix[right] − prefix[left] instead of prefix[right + 1] − prefix[left]',
        explanation:
          'With the leading-zero convention, the correct inclusive range sum is prefix[right + 1] − prefix[left].',
      },
      {
        title: 'Mixing array indices with prefix indices',
        explanation:
          'array[i] and prefix[i] mean different things. prefix[i] sums the first i original elements.',
      },
      {
        title: 'Assuming the array must be sorted',
        explanation:
          'Prefix Sum works on unsorted arrays. Sorting is not required for cumulative sums.',
      },
      {
        title: 'Forgetting that negative numbers are supported',
        explanation:
          'Prefix Sum is just addition. Negatives and zeros are valid and common in practice.',
      },
      {
        title: 'Mutating the original array unnecessarily',
        explanation:
          'Build a separate prefix array. Leave the input unchanged unless the problem asks otherwise.',
      },
    ],
  },

  algorithmConnection: {
    title: 'Brute Force vs Prefix Sum',
    eyebrow: 'COMPARE',
    description:
      'Both approaches can answer range-sum queries. The difference is how work is shared across many queries.',
    items: [
      {
        title: 'Brute Force Range Sum',
        description:
          'Preprocessing: O(1). Each query walks the range in O(n) worst case. q queries cost O(n × q).',
      },
      {
        title: 'Prefix Sum',
        description:
          'Preprocessing: O(n). Each query is O(1) via prefix[right + 1] − prefix[left]. q queries cost O(n + q). Space: O(n).',
      },
    ],
  },

  previousLesson: {
    title: 'Sliding Window',
    href: '/learn/sliding-window',
  },

  nextLesson: {
    title: 'Frequency Counting (Coming Soon)',
    href: '/algorithms/array-string',
  },

  categoryHref: '/algorithms/array-string',
}
