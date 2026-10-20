import type { PracticeProblem } from './types'

export const practiceProblems: PracticeProblem[] = [
  {
    id: 'practice-find-an-element',
    slug: 'find-an-element',
    title: 'Find an Element',
    difficulty: 'Beginner',
    category: 'Searching',
    description:
      'Given an array of numbers and a target value, return the index of the first occurrence of the target. If the target is not present, return -1. The array is not required to be sorted.',
    examples: [
      {
        input: 'arr = [10, 25, 7, 42, 18], target = 42',
        output: '3',
        explanation: '42 appears at index 3.',
      },
      {
        input: 'arr = [10, 25, 7, 42, 18], target = 99',
        output: '-1',
        explanation: '99 is not in the array.',
      },
      {
        input: 'arr = [5, 5, 5], target = 5',
        output: '0',
        explanation: 'Return the first matching index.',
      },
    ],
    constraints: [
      '0 ≤ arr.length ≤ 10^5',
      'arr[i] and target are integers',
      'Return the smallest index if duplicates exist',
    ],
    hints: [
      'You do not need the array to be sorted for this problem.',
      'Walk from left to right and compare each value to the target.',
      'As soon as you find a match, return that index. If you finish the loop, return -1.',
    ],
    approach: [
      'Use Linear Search: inspect each element once from index 0 to n − 1.',
      'When arr[i] equals the target, return i immediately.',
      'If no element matches, return -1.',
    ],
    complexity: {
      time: 'O(n)',
      space: 'O(1)',
      notes: [
        'Best case is O(1) when the target is at the first index.',
        'Worst case scans the entire array.',
      ],
    },
    solutions: {
      python: `def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1`,
      javascript: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i;
    }
  }
  return -1;
}`,
      typescript: `function linearSearch(arr: number[], target: number): number {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i;
    }
  }
  return -1;
}`,
    },
    relatedLessonSlug: 'linear-search',
    relatedLessonHref: '/learn/linear-search',
    tags: ['linear-search', 'arrays', 'searching', 'O(n)'],
  },
  {
    id: 'practice-find-target-sorted',
    slug: 'find-target-sorted-array',
    title: 'Find a Target in a Sorted Array',
    difficulty: 'Beginner',
    category: 'Searching',
    description:
      'Given a sorted array of numbers in non-decreasing order and a target value, return the index of the target using Binary Search. If the target is not present, return -1.',
    examples: [
      {
        input: 'arr = [3, 7, 12, 18, 24, 31, 42, 56, 68], target = 42',
        output: '6',
      },
      {
        input: 'arr = [3, 7, 12, 18, 24, 31, 42, 56, 68], target = 50',
        output: '-1',
      },
      {
        input: 'arr = [1], target = 1',
        output: '0',
      },
    ],
    constraints: [
      '0 ≤ arr.length ≤ 10^5',
      'arr is sorted in non-decreasing order',
      'arr[i] and target are integers',
    ],
    hints: [
      'Because the array is sorted, half of the remaining range can be discarded after each comparison.',
      'Maintain left and right bounds and compute mid carefully to avoid overflow-style mistakes.',
      'If arr[mid] is smaller than the target, search the right half; if larger, search the left half.',
    ],
    approach: [
      'Set left = 0 and right = n − 1.',
      'While left ≤ right, compare the middle element with the target.',
      'Narrow the search range until the target is found or the range becomes empty.',
    ],
    complexity: {
      time: 'O(log n)',
      space: 'O(1)',
      notes: [
        'Requires a sorted array.',
        'Each step roughly halves the search space.',
      ],
    },
    solutions: {
      python: `def binary_search(arr, target):
    left = 0
    right = len(arr) - 1

    while left <= right:
        mid = left + (right - left) // 2

        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1`,
      javascript: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);

    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}`,
      typescript: `function binarySearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);

    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}`,
    },
    relatedLessonSlug: 'binary-search',
    relatedLessonHref: '/learn/binary-search',
    tags: ['binary-search', 'sorted-array', 'searching', 'O(log n)'],
  },
  {
    id: 'practice-two-sum-sorted',
    slug: 'two-sum-sorted',
    title: 'Find Two Numbers With a Target Sum',
    difficulty: 'Beginner',
    category: 'Array & String',
    description:
      'Given a sorted array of integers and a target sum, return the indices of two numbers that add up to the target. If no such pair exists, return [-1, -1]. Prefer an efficient two-pointer approach over checking every pair.',
    examples: [
      {
        input: 'arr = [1, 2, 3, 4, 6, 8, 9], target = 10',
        output: '[0, 6]',
        explanation: '1 + 9 = 10.',
      },
      {
        input: 'arr = [1, 2, 3, 4, 6, 8, 9], target = 100',
        output: '[-1, -1]',
      },
      {
        input: 'arr = [2, 3, 5], target = 8',
        output: '[1, 2]',
        explanation: '3 + 5 = 8.',
      },
    ],
    constraints: [
      '2 ≤ arr.length ≤ 10^5',
      'arr is sorted in non-decreasing order',
      'You may assume at most one valid answer for these practice cases',
    ],
    hints: [
      'Because the array is sorted, pointers at both ends give you directional information.',
      'If the current sum is too small, move the left pointer right. If it is too large, move the right pointer left.',
      'Stop when the pointers meet or a matching pair is found.',
    ],
    approach: [
      'Place left at the start and right at the end of the sorted array.',
      'Compare arr[left] + arr[right] with the target and move the pointers accordingly.',
      'Return the indices when the sum matches; otherwise return [-1, -1].',
    ],
    complexity: {
      time: 'O(n)',
      space: 'O(1)',
      notes: ['A nested brute-force scan would be O(n²) time.'],
    },
    solutions: {
      python: `def two_sum_sorted(arr, target):
    left = 0
    right = len(arr) - 1

    while left < right:
        current_sum = arr[left] + arr[right]

        if current_sum == target:
            return [left, right]

        if current_sum < target:
            left += 1
        else:
            right -= 1

    return [-1, -1]`,
      javascript: `function twoSumSorted(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left < right) {
    const currentSum = arr[left] + arr[right];

    if (currentSum === target) {
      return [left, right];
    }

    if (currentSum < target) {
      left += 1;
    } else {
      right -= 1;
    }
  }

  return [-1, -1];
}`,
      typescript: `function twoSumSorted(arr: number[], target: number): number[] {
  let left = 0;
  let right = arr.length - 1;

  while (left < right) {
    const currentSum = arr[left] + arr[right];

    if (currentSum === target) {
      return [left, right];
    }

    if (currentSum < target) {
      left += 1;
    } else {
      right -= 1;
    }
  }

  return [-1, -1];
}`,
    },
    relatedLessonSlug: 'two-pointers',
    relatedLessonHref: '/learn/two-pointers',
    tags: ['two-pointers', 'sorted-array', 'pair-sum', 'O(n)'],
  },
  {
    id: 'practice-max-sum-fixed-window',
    slug: 'max-sum-fixed-window',
    title: 'Maximum Sum of a Fixed-Size Subarray',
    difficulty: 'Beginner',
    category: 'Array & String',
    description:
      'Given an array of integers and a positive window size k, return the maximum sum of any contiguous subarray of length k. If the input is invalid (empty array, non-positive k, or k larger than the array), return 0.',
    examples: [
      {
        input: 'arr = [2, 1, 5, 1, 3, 2], k = 3',
        output: '9',
        explanation: 'Subarray [5, 1, 3] sums to 9.',
      },
      {
        input: 'arr = [1, 2, 3, 4, 5], k = 2',
        output: '9',
        explanation: 'Subarray [4, 5] sums to 9.',
      },
      {
        input: 'arr = [1, 2], k = 3',
        output: '0',
        explanation: 'Window size exceeds array length.',
      },
    ],
    constraints: [
      '0 ≤ arr.length ≤ 10^5',
      'k is an integer',
      'Array values are integers (may be negative)',
    ],
    hints: [
      'Recomputing the sum of every window from scratch is correct but slower than necessary.',
      'After the first window sum, slide by subtracting the outgoing element and adding the incoming one.',
      'Track the maximum window sum seen so far.',
    ],
    approach: [
      'Validate the inputs, then compute the sum of the first window of size k.',
      'Slide the window across the array, updating the running sum in O(1) per step.',
      'Return the largest window sum observed.',
    ],
    complexity: {
      time: 'O(n)',
      space: 'O(1)',
      notes: [
        'Fixed-size sliding window avoids O(n · k) repeated summing.',
      ],
    },
    solutions: {
      python: `def max_sum_subarray(arr, window_size):
    if (
        not arr
        or window_size <= 0
        or window_size > len(arr)
    ):
        return 0

    window_sum = sum(arr[:window_size])
    max_sum = window_sum

    for i in range(window_size, len(arr)):
        window_sum += arr[i]
        window_sum -= arr[i - window_size]
        max_sum = max(max_sum, window_sum)

    return max_sum`,
      javascript: `function maxSumSubarray(arr, windowSize) {
  if (
    arr.length === 0 ||
    windowSize <= 0 ||
    windowSize > arr.length
  ) {
    return 0;
  }

  let windowSum = 0;
  for (let i = 0; i < windowSize; i += 1) {
    windowSum += arr[i];
  }

  let maxSum = windowSum;
  for (let i = windowSize; i < arr.length; i += 1) {
    windowSum += arr[i];
    windowSum -= arr[i - windowSize];
    maxSum = Math.max(maxSum, windowSum);
  }

  return maxSum;
}`,
      typescript: `function maxSumSubarray(arr: number[], windowSize: number): number {
  if (
    arr.length === 0 ||
    windowSize <= 0 ||
    windowSize > arr.length
  ) {
    return 0;
  }

  let windowSum = 0;
  for (let i = 0; i < windowSize; i += 1) {
    windowSum += arr[i]!;
  }

  let maxSum = windowSum;
  for (let i = windowSize; i < arr.length; i += 1) {
    windowSum += arr[i]!;
    windowSum -= arr[i - windowSize]!;
    maxSum = Math.max(maxSum, windowSum);
  }

  return maxSum;
}`,
    },
    relatedLessonSlug: 'sliding-window',
    relatedLessonHref: '/learn/sliding-window',
    tags: ['sliding-window', 'subarray', 'fixed-window', 'O(n)'],
  },
  {
    id: 'practice-range-sum-queries',
    slug: 'range-sum-queries',
    title: 'Range Sum Queries',
    difficulty: 'Beginner',
    category: 'Array & String',
    description:
      'Build a prefix-sum structure for an integer array so that the sum of any inclusive range [left, right] can be answered efficiently. Implement both building the prefix array and answering a single range query.',
    examples: [
      {
        input:
          'arr = [2, 4, 1, 6, 3, 5]; query left = 1, right = 4',
        output: 'prefix = [0, 2, 6, 7, 13, 16, 21]; range sum = 14',
        explanation: '4 + 1 + 6 + 3 = 14.',
      },
      {
        input:
          'arr = [2, 4, 1, 6, 3, 5]; query left = 0, right = 5',
        output: '21',
        explanation: 'Sum of the entire array.',
      },
    ],
    constraints: [
      '0 ≤ arr.length ≤ 10^5',
      '0 ≤ left ≤ right < arr.length',
      'Array values are integers',
    ],
    hints: [
      'Store cumulative totals so a range becomes a subtraction of two prefix values.',
      'A common layout uses prefix[0] = 0 and prefix[i + 1] = prefix[i] + arr[i].',
      'Then sum(left, right) = prefix[right + 1] − prefix[left].',
    ],
    approach: [
      'Precompute a prefix array of length n + 1 in a single O(n) pass.',
      'Answer each query in O(1) using the prefix difference formula.',
      'This is ideal when many range-sum queries share the same static array.',
    ],
    complexity: {
      time: 'O(n) prep + O(1) per query',
      space: 'O(n)',
      notes: [
        'Useful when the array is mostly static and queries are frequent.',
      ],
    },
    solutions: {
      python: `def build_prefix_sum(arr):
    prefix = [0] * (len(arr) + 1)

    for i in range(len(arr)):
        prefix[i + 1] = prefix[i] + arr[i]

    return prefix


def range_sum(prefix, left, right):
    return prefix[right + 1] - prefix[left]`,
      javascript: `function buildPrefixSum(arr) {
  const prefix = new Array(arr.length + 1).fill(0);

  for (let i = 0; i < arr.length; i += 1) {
    prefix[i + 1] = prefix[i] + arr[i];
  }

  return prefix;
}

function rangeSum(prefix, left, right) {
  return prefix[right + 1] - prefix[left];
}`,
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
}`,
    },
    relatedLessonSlug: 'prefix-sum',
    relatedLessonHref: '/learn/prefix-sum',
    tags: ['prefix-sum', 'range-query', 'arrays', 'O(1)-query'],
  },
  {
    id: 'practice-most-frequent-number',
    slug: 'most-frequent-number',
    title: 'Find the Most Frequent Number',
    difficulty: 'Beginner',
    category: 'Array & String',
    description:
      'Given an array of integers, return the value that appears most frequently. If the array is empty, return null. If multiple values share the highest frequency, return the one that appears first when scanning left to right among those with the maximum count (as in the lesson reference).',
    examples: [
      {
        input: 'arr = [2, 1, 2, 3, 1, 2, 4]',
        output: '2',
        explanation: '2 appears three times; others appear less often.',
      },
      {
        input: 'arr = []',
        output: 'null',
      },
      {
        input: 'arr = [7]',
        output: '7',
      },
    ],
    constraints: [
      '0 ≤ arr.length ≤ 10^5',
      'Array values are integers',
    ],
    hints: [
      'Counting occurrences once is enough; you do not need nested scans for every value.',
      'A hash map (dictionary / Map) stores value → frequency in expected O(1) updates.',
      'After building frequencies, scan again (or while counting) to find the max frequency value.',
    ],
    approach: [
      'Build a frequency map of all values.',
      'Track the value whose frequency is highest.',
      'Return that value, or null for an empty input.',
    ],
    complexity: {
      time: 'O(n) expected',
      space: 'O(k)',
      notes: [
        'k is the number of distinct values in the array.',
      ],
    },
    solutions: {
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

    return most_frequent`,
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
    if (frequency.get(value) > frequency.get(mostFrequent)) {
      mostFrequent = value;
    }
  }

  return mostFrequent;
}`,
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

function findMostFrequent(arr: number[]): number | null {
  if (arr.length === 0) {
    return null;
  }

  const frequency = buildFrequencyMap(arr);
  let mostFrequent = arr[0]!;

  for (const value of arr) {
    if (
      (frequency.get(value) ?? 0) >
      (frequency.get(mostFrequent) ?? 0)
    ) {
      mostFrequent = value;
    }
  }

  return mostFrequent;
}`,
    },
    relatedLessonSlug: 'frequency-counting',
    relatedLessonHref: '/learn/frequency-counting',
    tags: ['frequency-counting', 'hash-map', 'arrays', 'O(n)'],
  },
  {
    id: 'practice-maximum-subarray-sum',
    slug: 'maximum-subarray-sum',
    title: 'Maximum Subarray Sum',
    difficulty: 'Intermediate',
    category: 'Array & String',
    description:
      'Given a non-empty array of integers (which may include negatives), find a contiguous subarray with the largest sum. Return the maximum sum together with the start and end indices of that subarray. For an empty array, return null.',
    examples: [
      {
        input: 'arr = [-2, 1, -3, 4, -1, 2, 1, -5, 4]',
        output: '{ maxSum: 6, start: 3, end: 6 }',
        explanation: 'The subarray [4, -1, 2, 1] sums to 6.',
      },
      {
        input: 'arr = [-3, -1, -2]',
        output: '{ maxSum: -1, start: 1, end: 1 }',
        explanation: 'When all values are negative, the best subarray is the largest single element.',
      },
    ],
    constraints: [
      '0 ≤ arr.length ≤ 10^5',
      'Array values are integers and may be negative',
      'Empty input should return null',
    ],
    hints: [
      'You do not need to check every possible subarray explicitly.',
      'At each index, decide whether to extend the previous running sum or start a new subarray here.',
      'Keep a separate best sum (and its indices) while scanning once from left to right.',
    ],
    approach: [
      'Use Kadane’s algorithm: maintain currentSum and bestSum while iterating.',
      'Reset the current start when starting a new candidate subarray.',
      'Update bestStart and bestEnd whenever currentSum improves bestSum.',
    ],
    complexity: {
      time: 'O(n)',
      space: 'O(1)',
      notes: [
        'Returning indices does not change the asymptotic auxiliary space.',
      ],
    },
    solutions: {
      python: `def max_subarray(arr):
    if not arr:
        return None

    current_sum = arr[0]
    best_sum = arr[0]
    current_start = 0
    best_start = 0
    best_end = 0

    for i in range(1, len(arr)):
        if arr[i] > current_sum + arr[i]:
            current_sum = arr[i]
            current_start = i
        else:
            current_sum += arr[i]

        if current_sum > best_sum:
            best_sum = current_sum
            best_start = current_start
            best_end = i

    return {
        "max_sum": best_sum,
        "start": best_start,
        "end": best_end,
    }`,
      javascript: `function maxSubarray(arr) {
  if (arr.length === 0) {
    return null;
  }

  let currentSum = arr[0];
  let bestSum = arr[0];
  let currentStart = 0;
  let bestStart = 0;
  let bestEnd = 0;

  for (let i = 1; i < arr.length; i += 1) {
    if (arr[i] > currentSum + arr[i]) {
      currentSum = arr[i];
      currentStart = i;
    } else {
      currentSum += arr[i];
    }

    if (currentSum > bestSum) {
      bestSum = currentSum;
      bestStart = currentStart;
      bestEnd = i;
    }
  }

  return {
    maxSum: bestSum,
    start: bestStart,
    end: bestEnd,
  };
}`,
      typescript: `type MaxSubarrayResult = {
  maxSum: number;
  start: number;
  end: number;
};

function maxSubarray(arr: number[]): MaxSubarrayResult | null {
  if (arr.length === 0) {
    return null;
  }

  let currentSum = arr[0]!;
  let bestSum = arr[0]!;
  let currentStart = 0;
  let bestStart = 0;
  let bestEnd = 0;

  for (let i = 1; i < arr.length; i += 1) {
    const value = arr[i]!;

    if (value > currentSum + value) {
      currentSum = value;
      currentStart = i;
    } else {
      currentSum += value;
    }

    if (currentSum > bestSum) {
      bestSum = currentSum;
      bestStart = currentStart;
      bestEnd = i;
    }
  }

  return {
    maxSum: bestSum,
    start: bestStart,
    end: bestEnd,
  };
}`,
    },
    relatedLessonSlug: 'kadanes-algorithm',
    relatedLessonHref: '/learn/kadanes-algorithm',
    tags: ['kadane', 'maximum-subarray', 'dynamic-thinking', 'O(n)'],
  },
  {
    id: 'practice-longest-substring-no-repeat',
    slug: 'longest-substring-no-repeat',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Intermediate',
    category: 'Array & String',
    description:
      'Given a string, find the length of the longest contiguous substring that contains no repeating characters. Also return the start and end indices of one such substring (as in the lesson reference). For an empty string, length is 0.',
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '{ length: 3, start: 0, end: 2 }',
        explanation: 'One longest substring is "abc".',
      },
      {
        input: 's = "pwwkew"',
        output: '{ length: 3, start: 2, end: 4 }',
        explanation: 'One longest substring is "wke".',
      },
      {
        input: 's = ""',
        output: '{ length: 0, start: 0, end: -1 }',
      },
    ],
    constraints: [
      '0 ≤ s.length ≤ 10^5',
      'Characters are ordinary BMP characters (as in the lesson)',
    ],
    hints: [
      'A variable-size sliding window works well for “longest substring with property X”.',
      'Keep a set (or map) of characters currently inside the window.',
      'When a duplicate appears, shrink from the left until the window is valid again.',
    ],
    approach: [
      'Expand a right pointer across the string while maintaining uniqueness in the window.',
      'When a repeat is found, advance left and remove characters until the conflict is gone.',
      'Track the best window length and its indices.',
    ],
    complexity: {
      time: 'O(n) expected',
      space: 'O(k)',
      notes: [
        'k is the number of distinct characters in the window (at most alphabet size, or n).',
      ],
    },
    solutions: {
      python: `def longest_substring_without_repeating(value):
    seen = set()
    left = 0
    best_start = 0
    best_end = -1

    for right in range(len(value)):
        while value[right] in seen:
            seen.remove(value[left])
            left += 1

        seen.add(value[right])

        if right - left > best_end - best_start:
            best_start = left
            best_end = right

    if best_end == -1:
        return {"length": 0, "start": 0, "end": -1}

    return {
        "length": best_end - best_start + 1,
        "start": best_start,
        "end": best_end,
    }`,
      javascript: `function longestSubstringWithoutRepeating(value) {
  const seen = new Set();
  let left = 0;
  let bestStart = 0;
  let bestEnd = -1;

  for (let right = 0; right < value.length; right += 1) {
    while (seen.has(value[right])) {
      seen.delete(value[left]);
      left += 1;
    }

    seen.add(value[right]);

    if (right - left > bestEnd - bestStart) {
      bestStart = left;
      bestEnd = right;
    }
  }

  return {
    length: bestEnd >= bestStart ? bestEnd - bestStart + 1 : 0,
    start: bestStart,
    end: bestEnd,
  };
}`,
      typescript: `type LongestSubstringResult = {
  length: number;
  start: number;
  end: number;
};

function longestSubstringWithoutRepeating(
  value: string,
): LongestSubstringResult {
  const seen = new Set<string>();
  let left = 0;
  let bestStart = 0;
  let bestEnd = -1;

  for (let right = 0; right < value.length; right += 1) {
    while (seen.has(value[right]!)) {
      seen.delete(value[left]!);
      left += 1;
    }

    seen.add(value[right]!);

    if (right - left > bestEnd - bestStart) {
      bestStart = left;
      bestEnd = right;
    }
  }

  return {
    length: bestEnd >= bestStart ? bestEnd - bestStart + 1 : 0,
    start: bestStart,
    end: bestEnd,
  };
}`,
    },
    relatedLessonSlug: 'longest-substring-without-repeating-characters',
    relatedLessonHref: '/learn/longest-substring-without-repeating-characters',
    tags: ['sliding-window', 'strings', 'hash-set', 'O(n)'],
  },
  {
    id: 'practice-valid-anagram',
    slug: 'valid-anagram',
    title: 'Valid Anagram',
    difficulty: 'Beginner',
    category: 'Array & String',
    description:
      'Given two strings, determine whether they are anagrams of each other under exact comparison: same characters with the same frequencies. Comparison is case-sensitive and does not ignore spaces or punctuation.',
    examples: [
      {
        input: 'first = "listen", second = "silent"',
        output: 'true',
      },
      {
        input: 'first = "rat", second = "car"',
        output: 'false',
      },
      {
        input: 'first = "a", second = "A"',
        output: 'false',
        explanation: 'Case differs, so they are not anagrams under exact rules.',
      },
      {
        input: 'first = "", second = ""',
        output: 'true',
      },
    ],
    constraints: [
      '0 ≤ first.length, second.length ≤ 10^5',
      'Ordinary BMP characters (as in the lesson)',
    ],
    hints: [
      'Strings of different lengths cannot be anagrams.',
      'Count characters from the first string, then decrement while scanning the second.',
      'If a needed count would go negative, the multisets do not match.',
    ],
    approach: [
      'Reject immediately when lengths differ.',
      'Build a frequency map from the first string.',
      'Decrement counts using the second string; return true only if every decrement succeeds.',
    ],
    complexity: {
      time: 'O(n) expected',
      space: 'O(k)',
      notes: ['k is the number of distinct characters involved.'],
    },
    solutions: {
      python: `def is_valid_anagram(first, second):
    if len(first) != len(second):
        return False

    frequency = {}

    for char in first:
        frequency[char] = frequency.get(char, 0) + 1

    for char in second:
        if frequency.get(char, 0) == 0:
            return False
        frequency[char] -= 1

    return True`,
      javascript: `function isValidAnagram(first, second) {
  if (first.length !== second.length) {
    return false;
  }

  const frequency = new Map();

  for (const char of first) {
    frequency.set(char, (frequency.get(char) ?? 0) + 1);
  }

  for (const char of second) {
    const count = frequency.get(char) ?? 0;
    if (count === 0) {
      return false;
    }
    frequency.set(char, count - 1);
  }

  return true;
}`,
      typescript: `function isValidAnagram(first: string, second: string): boolean {
  if (first.length !== second.length) {
    return false;
  }

  const frequency = new Map<string, number>();

  for (const char of first) {
    frequency.set(char, (frequency.get(char) ?? 0) + 1);
  }

  for (const char of second) {
    const count = frequency.get(char) ?? 0;
    if (count === 0) {
      return false;
    }
    frequency.set(char, count - 1);
  }

  return true;
}`,
    },
    relatedLessonSlug: 'valid-anagram',
    relatedLessonHref: '/learn/valid-anagram',
    tags: ['anagram', 'frequency-counting', 'strings', 'hash-map'],
  },
  {
    id: 'practice-group-anagrams',
    slug: 'group-anagrams',
    title: 'Group Anagrams',
    difficulty: 'Intermediate',
    category: 'Array & String',
    description:
      'Given an array of strings, group the anagrams together. Two words belong in the same group when they contain the same characters with the same frequencies (exact, case-sensitive comparison). Return the groups as an array of arrays. Group order and order within a group may follow insertion order from a single left-to-right pass.',
    examples: [
      {
        input: 'words = ["eat", "tea", "tan", "ate", "nat", "bat"]',
        output: '[["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]',
        explanation: 'Groups share the same sorted character signature.',
      },
      {
        input: 'words = ["a", "A"]',
        output: '[["a"], ["A"]]',
        explanation: 'Case-sensitive: "a" and "A" are different.',
      },
      {
        input: 'words = []',
        output: '[]',
      },
    ],
    constraints: [
      '0 ≤ words.length ≤ 10^4',
      '0 ≤ words[i].length ≤ 100',
      'Ordinary BMP characters (as in the lesson)',
    ],
    hints: [
      'Words that are anagrams share a canonical signature.',
      'Sorting the characters of a word is a simple signature for grouping.',
      'Use a map from signature → list of words, then return the map values.',
    ],
    approach: [
      'For each word, compute a signature (sorted characters).',
      'Append the word to the bucket for that signature.',
      'Return all buckets as the grouped result.',
    ],
    complexity: {
      time: 'O(n × m log m)',
      space: 'O(n × m)',
      notes: [
        'n is the number of words; m is the maximum word length when sorting each word.',
      ],
    },
    solutions: {
      python: `def group_anagrams(words):
    groups = {}

    for word in words:
        signature = "".join(sorted(word))

        if signature not in groups:
            groups[signature] = []

        groups[signature].append(word)

    return list(groups.values())`,
      javascript: `function groupAnagrams(words) {
  const groups = new Map();

  for (const word of words) {
    const signature = [...word].sort().join("");

    if (!groups.has(signature)) {
      groups.set(signature, []);
    }

    groups.get(signature).push(word);
  }

  return [...groups.values()];
}`,
      typescript: `function wordSignature(word: string): string {
  return [...word].sort().join("");
}

function groupAnagrams(words: string[]): string[][] {
  const groups = new Map<string, string[]>();

  for (const word of words) {
    const signature = wordSignature(word);
    const bucket = groups.get(signature);

    if (bucket === undefined) {
      groups.set(signature, [word]);
    } else {
      bucket.push(word);
    }
  }

  return [...groups.values()];
}`,
    },
    relatedLessonSlug: 'group-anagrams',
    relatedLessonHref: '/learn/group-anagrams',
    tags: ['anagram', 'grouping', 'hash-map', 'sorting'],
  },
]
