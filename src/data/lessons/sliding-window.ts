import type { Lesson } from './types'

export const slidingWindow: Lesson = {
  slug: 'sliding-window',
  title: 'Sliding Window',
  description:
    'Maintain a fixed-size window over a sequence and move it efficiently — reuse the previous window sum instead of recalculating overlapping ranges.',
  category: 'Array & String',
  difficulty: 'Beginner',
  estimatedTime: '25 min',
  tags: ['Array & String', 'Sliding Window', 'Arrays', 'O(n)', 'Intermediate'],

  objectives: [
    'Understand the Sliding Window technique and what a “window” represents.',
    'Learn how fixed-size windows move from left to right across an array.',
    'Update a window efficiently by removing the outgoing value and adding the incoming value.',
    'Understand why Sliding Window can reduce repeated work compared with brute force.',
    'Recognize O(n) window traversal for this fixed-size maximum-sum problem.',
    'Know when the technique can be useful — and when a different approach fits better.',
    'Implement fixed-size maximum window sum in Python, JavaScript, and TypeScript without mutating the input.',
  ],

  overview: [
    'A sliding window is a range of consecutive elements. Instead of restarting every range calculation from scratch, we slide the window and update only what changed.',
    'Example array: [2, 1, 5, 1, 3, 2] with window size 3. The first window is [2, 1, 5], then [1, 5, 1], then [5, 1, 3], then [1, 3, 2].',
    'Goal for this lesson: find the maximum sum of any contiguous subarray of size 3. The window sums are 8, 7, 9, and 6 — so the answer is 9 from [5, 1, 3].',
    'This lesson focuses on fixed-size windows. Later lessons can cover variable-size windows, longest/shortest subarrays, longest substrings, and frequency-based windows.',
    'Sliding Window works on contiguous ranges. The array does not need to be sorted for this technique — an important contrast with the left/right Two Pointers pair-sum lesson.',
  ],

  whyItMatters: [
    'Many problems ask about contiguous subarrays or substrings — natural fits for a moving window.',
    'Neighboring windows overlap heavily, so recalculating each range from scratch wastes work.',
    'For fixed-size maximum sum, Sliding Window turns O(n × k) brute force into O(n) updates.',
    'The same “remove outgoing, add incoming” idea appears in many range and stream problems.',
  ],

  visualization: {
    title: 'Sliding Window in action',
    description:
      'Watch a fixed-size window slide across the array. Track the outgoing value, incoming value, current window sum, and the maximum found so far.',
    type: 'sliding-window',
  },

  steps: [
    {
      title: 'Choose a fixed window size',
      description:
        'Pick k consecutive positions. For the default example, k = 3 on [2, 1, 5, 1, 3, 2].',
    },
    {
      title: 'Create the first window',
      description:
        'Cover indices 0 through k − 1. The first window is [2, 1, 5].',
    },
    {
      title: 'Calculate the first window sum',
      description:
        'Sum the first k elements once: 2 + 1 + 5 = 8. Set maxSum = 8.',
    },
    {
      title: 'Slide one position to the right',
      description:
        'Move the window so the next contiguous range becomes active. Do not restart the sum from scratch.',
    },
    {
      title: 'Remove the outgoing value',
      description:
        'Subtract the element that left the window. Example: 8 − 2 when leaving [2, 1, 5].',
    },
    {
      title: 'Add the incoming value',
      description:
        'Add the element that entered the window. Example: after removing 2, add 1 to reach sum 7 for [1, 5, 1].',
    },
    {
      title: 'Update the maximum',
      description:
        'If the new window sum is larger than maxSum, update maxSum. Continue until the window reaches the end. The best sum for the default example is 9.',
    },
  ],

  complexity: {
    time: {
      best: 'O(n)',
      average: 'O(n)',
      worst: 'O(n)',
    },
    space: 'O(1)',
    notes: {
      time: [
        'Brute force recalculates every window of size k from scratch, which can take O(n × k) time.',
        'Sliding Window calculates the first window in O(k), then updates each following window in O(1).',
        'There are O(n) window positions overall, so this fixed-size maximum-sum problem is O(n).',
        'Not every Sliding Window problem is automatically O(n) — this lesson’s fixed-size maximum-sum version is.',
      ],
      space: [
        'The algorithm only needs a few variables such as windowSum and maxSum.',
        'It does not allocate an extra array proportional to the input size, so space stays O(1).',
        'The input array is not mutated.',
      ],
    },
  },

  pseudocode: `MaxSumSubarray(array, windowSize)
    if windowSize is invalid
        return 0

    windowSum = sum of first window
    maxSum = windowSum

    for each remaining element
        remove outgoing element
        add incoming element
        update maxSum

    return maxSum`,

  code: {
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

    return max_sum


# Example
values = [2, 1, 5, 1, 3, 2]
print(max_sum_subarray(values, 3))  # 9
print(max_sum_subarray([1, 2, 3, 4, 5], 2))  # 9`,
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
}

// Example
const values = [2, 1, 5, 1, 3, 2];
console.log(maxSumSubarray(values, 3)); // 9
console.log(maxSumSubarray([1, 2, 3, 4, 5], 2)); // 9`,
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
}

// Example
const values: number[] = [2, 1, 5, 1, 3, 2];
console.log(maxSumSubarray(values, 3)); // 9
console.log(maxSumSubarray([1, 2, 3, 4, 5], 2)); // 9`,
  },

  whenToUse: [
    'Contiguous subarrays.',
    'Contiguous substrings.',
    'Fixed-size ranges.',
    'Running sums over neighboring elements.',
    'Maximum or minimum over a moving range.',
    'Problems where consecutive elements overlap heavily between neighboring ranges.',
  ],

  whenNotToUse: [
    'Elements do not need to be contiguous.',
    'The problem requires arbitrary combinations rather than ranges.',
    'There is no useful state that can be updated when the window moves.',
    'A different technique better matches the problem.',
    'Sliding Window is a pattern, not a universal solution for every array or string problem.',
  ],

  keyTakeaways: [
    'A window represents a contiguous range.',
    'The window moves through the array from left to right.',
    'Fixed-size windows can reuse previous calculations.',
    'Remove what leaves the window.',
    'Add what enters the window.',
    'This can reduce O(n × k) work to O(n) for this fixed-size maximum-sum problem.',
    'Sliding Window is a reusable problem-solving pattern.',
  ],

  thinkingGuide: {
    title: 'Why the Window Works',
    description:
      'The key idea is reuse: each new window shares most of its values with the previous one.',
    steps: [
      'Start with [2, 1, 5]. Sum = 8.',
      'When the window moves to [1, 5, 1], do not recalculate 1 + 5 + 1 from scratch.',
      'Instead: 8 − 2 + 1 = 7.',
      'Next: 7 − 1 + 3 = 9 for [5, 1, 3].',
      'Then: 9 − 5 + 2 = 6 for [1, 3, 2].',
      'Track the maximum along the way. The answer is 9.',
      'Reuse information from the previous window — that is the Sliding Window idea.',
    ],
  },

  commonMistakes: {
    description:
      'These mistakes show up often when learners first write a fixed-size sliding window.',
    mistakes: [
      {
        title: 'Recalculating the entire window every time',
        explanation:
          'Summing all k elements for every start index works, but wastes the overlap. Prefer remove-outgoing + add-incoming updates.',
      },
      {
        title: 'Forgetting to remove the outgoing value',
        explanation:
          'If you only add the incoming value, the sum grows incorrectly and no longer represents the current window.',
      },
      {
        title: 'Adding the wrong incoming value',
        explanation:
          'The incoming index is the new right end of the window. Off-by-one mistakes here break the sum.',
      },
      {
        title: 'Using an invalid window size',
        explanation:
          'Window size must be at least 1 and at most the array length. Invalid sizes should be rejected (this lesson returns 0).',
      },
      {
        title: 'Confusing contiguous elements with arbitrary elements',
        explanation:
          'A window is a contiguous range. Sliding Window does not select arbitrary non-adjacent combinations.',
      },
      {
        title: 'Accidentally mutating the original array',
        explanation:
          'The educational implementation only updates running sums and indices. Avoid rewriting array values unless the problem asks for it.',
      },
      {
        title:
          'Assuming Sliding Window always works with non-contiguous selections',
        explanation:
          'If the problem is about subsets or unordered pairs, a window over consecutive indices is the wrong model.',
      },
      {
        title: 'Forgetting to initialize the first window',
        explanation:
          'You need the first window sum before the slide loop. Without it, there is nothing useful to update.',
      },
    ],
  },

  algorithmConnection: {
    title: 'Brute Force vs Sliding Window',
    eyebrow: 'COMPARE',
    description:
      'Both approaches can find the maximum fixed-size window sum. The difference is how much work repeats as the window moves.',
    items: [
      {
        title: 'Brute force — O(n × k)',
        description:
          'For every starting position, calculate the entire window sum again from scratch. Neighboring windows overlap, so most additions are repeated work.',
      },
      {
        title: 'Sliding Window — O(n)',
        description:
          'Calculate the first window once. Then remove the outgoing value, add the incoming value, and reuse previous work. Space stays O(1).',
      },
    ],
  },

  previousLesson: {
    title: 'Two Pointers',
    href: '/learn/two-pointers',
  },

  nextLesson: {
    title: 'Prefix Sum',
    href: '/learn/prefix-sum',
  },

  categoryHref: '/algorithms/array-string',
}
