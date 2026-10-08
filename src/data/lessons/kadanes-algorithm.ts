import type { Lesson } from './types'

export const kadanesAlgorithm: Lesson = {
  slug: 'kadanes-algorithm',
  title: "Kadane's Algorithm",
  description:
    'Learn how to find the contiguous subarray with the largest sum in linear time.',
  category: 'Array & String',
  difficulty: 'Intermediate',
  estimatedTime: '25 min',
  tags: [
    'Array & String',
    "Kadane's Algorithm",
    'Maximum Subarray',
    'Dynamic Programming',
    'Contiguous',
    'Intermediate',
  ],

  objectives: [
    'Understand the Maximum Subarray problem.',
    'Understand the intuition behind Kadane\'s Algorithm.',
    'Track the best sum ending at the current position.',
    'Track the best sum found so far.',
    'Understand when to extend a subarray and when to start a new one.',
    'Understand why the algorithm runs in O(n).',
    'Handle arrays containing negative numbers.',
  ],

  overview: [
    'Given an array of integers, find the contiguous subarray with the largest sum.',
    'Example: [-2, 1, -3, 4, -1, 2, 1, -5, 4]. The answer is [4, -1, 2, 1] because 4 + (−1) + 2 + 1 = 6.',
    '"Contiguous" means the selected elements must be next to each other. You cannot skip elements. For this example, [4, 2, 1] is not valid — those values are not all contiguous in the array.',
    'Kadane\'s core idea: at every element, ask whether it is better to continue the current subarray or start a new subarray here. That local decision is enough to find the global maximum in one pass.',
  ],

  whyItMatters: [
    'Checking every contiguous subarray is expensive. There are O(n²) ranges; naively summing each costs O(n³), and even with cumulative sums the search is still O(n²).',
    'Kadane\'s Algorithm solves the same problem in O(n) time and O(1) extra space by maintaining only a running "best ending here" sum and the best overall.',
    'The decision currentSum = max(value, currentSum + value) is the heart of the method: restart when the previous run hurts you; extend when it helps.',
    'Important detail: initialize from the first element, not from 0. Otherwise an all-negative array would incorrectly return 0 instead of the largest single (least negative) value.',
  ],

  visualization: {
    title: "Kadane's Algorithm in action",
    description:
      'Watch currentSum and bestSum update as each value chooses between extending the run or starting fresh.',
    type: 'kadanes-algorithm',
  },

  steps: [
    {
      title: 'Initialize from the first element',
      description:
        'Set currentSum and bestSum to array[0]. Remember start and end indices for the current and best subarrays. Do not seed bestSum with 0.',
    },
    {
      title: 'Read the next value',
      description:
        'Walk left to right. For each index i ≥ 1, read value = array[i].',
    },
    {
      title: 'Compute both candidates',
      description:
        'Start new: value. Extend: currentSum + value. Compare them.',
    },
    {
      title: 'Choose extend or restart',
      description:
        'currentSum = max(value, currentSum + value). If you start new, set currentStart = i. Always set currentEnd = i.',
    },
    {
      title: 'Update the best so far',
      description:
        'If currentSum > bestSum, set bestSum = currentSum and copy the current indices into bestStart / bestEnd.',
    },
    {
      title: 'Finish after one pass',
      description:
        'When the scan ends, bestSum is the maximum contiguous sum and [bestStart, bestEnd] identifies the subarray. For the lesson array that is 6 with indices 3…6 → [4, -1, 2, 1].',
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
        'One pass through the array — each element is processed a constant number of times.',
        'Brute force over all ranges is O(n²) with cumulative sums, or O(n³) if each range is summed from scratch.',
        'Kadane improves that progression to O(n) for the classic maximum contiguous sum.',
      ],
      space: [
        'Only a fixed set of variables is maintained (sums and indices).',
        'No additional array is required.',
        'Returning indices and the sum still uses O(1) auxiliary space. The input array is not mutated.',
      ],
    },
  },

  pseudocode: `Kadane(array)
    if array is empty
        return no result

    currentSum = array[0]
    bestSum = array[0]

    currentStart = 0
    bestStart = 0
    bestEnd = 0

    for i from 1 to length(array) - 1

        if array[i] > currentSum + array[i]
            currentSum = array[i]
            currentStart = i
        else
            currentSum = currentSum + array[i]

        if currentSum > bestSum
            bestSum = currentSum
            bestStart = currentStart
            bestEnd = i

    return bestSum, bestStart, bestEnd`,

  code: {
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
    }


# Example
values = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
print(max_subarray(values))
# {"max_sum": 6, "start": 3, "end": 6}
# Subarray values[3:7] == [4, -1, 2, 1]`,
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
}

// Example
const values = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
console.log(maxSubarray(values));
// { maxSum: 6, start: 3, end: 6 }
// values.slice(3, 7) === [4, -1, 2, 1]`,
    typescript: `type MaximumSubarrayResult = {
  maxSum: number;
  start: number;
  end: number;
};

function maxSubarray(
  arr: number[],
): MaximumSubarrayResult | null {
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
}

// Example
const values: number[] = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
console.log(maxSubarray(values));
// { maxSum: 6, start: 3, end: 6 }
// values.slice(3, 7) === [4, -1, 2, 1]`,
  },

  whenToUse: [
    'Maximum sum contiguous subarray',
    'Maximum profit-like contiguous gain problems',
    'Problems where a running sum can be restarted',
    'Array optimization problems with contiguous ranges',
    'Competitive programming',
    'Interview problems that match this structure',
  ],

  whenNotToUse: [
    'The problem has extra constraints that change the local restart/extend decision.',
    'You need a fixed window size — use Sliding Window instead.',
    'You need many exact range-sum queries — use Prefix Sum instead.',
    'The array is updated frequently and you need a more advanced structure.',
    'The problem asks for a non-contiguous subsequence or a different property than maximum contiguous sum.',
  ],

  keyTakeaways: [
    'Maximum Subarray asks for the best contiguous segment — elements must be adjacent.',
    'Kadane\'s decision: currentSum = max(value, currentSum + value).',
    'Track bestSum (and indices) whenever the current run improves the global answer.',
    'Initialize from the first element so all-negative arrays work.',
    'Time O(n), space O(1) auxiliary.',
    'Fixed-size range → Sliding Window; repeated range sums → Prefix Sum; maximum contiguous sum → Kadane.',
    'Do not confuse subarray (contiguous) with subsequence (may skip elements).',
  ],

  thinkingGuide: {
    title: "Kadane's Core Decision",
    description:
      'At every value, compare starting fresh with extending the previous run.',
    steps: [
      'For value, the two options are: start new → value, or extend → currentSum + value.',
      'Choose currentSum = max(value, currentSum + value).',
      'Then bestSum = max(bestSum, currentSum).',
      'Example at 4 with previous currentSum −4: start new = 4, extend = 0 → choose 4 and restart.',
      'Example at −1 with previous currentSum 4: start new = −1, extend = 3 → choose 3 and extend.',
      'Keep currentStart / currentEnd (and bestStart / bestEnd) so you can report the actual subarray, not only the sum.',
    ],
  },

  commonMistakes: {
    description:
      'These mistakes show up often when learners first implement Kadane\'s Algorithm.',
    mistakes: [
      {
        title: 'Initializing bestSum to 0',
        explanation:
          'Seed with array[0]. Using 0 fails on all-negative inputs and invents an empty “sum 0” answer the classic problem does not allow.',
      },
      {
        title: 'Failing on all-negative arrays',
        explanation:
          'For [-8, -3, -5, -2] the answer is [-2] with sum −2 — the single least-negative value — not 0.',
      },
      {
        title: 'Confusing subarray with subsequence',
        explanation:
          'A subarray is contiguous. A subsequence may skip elements. Kadane solves the contiguous case.',
      },
      {
        title: 'Allowing non-contiguous elements',
        explanation:
          'Picking 4, 2, and 1 from the lesson array is invalid because they are not one contiguous block.',
      },
      {
        title: 'Losing the starting index when restarting',
        explanation:
          'When you start a new run, set currentStart = i. Forgetting this leaves stale indices in the answer.',
      },
      {
        title: 'Updating bestSum incorrectly',
        explanation:
          'Only update best when currentSum is strictly greater (or use your chosen tie rule consistently). Copy bestStart/bestEnd from the current run at the same time.',
      },
      {
        title: 'Forgetting the empty-array case',
        explanation:
          'Guard arr.length === 0 (or the language equivalent) before reading arr[0].',
      },
      {
        title: 'Using nested loops when Kadane is enough',
        explanation:
          'O(n²) or O(n³) range enumeration works but is unnecessary for the classic maximum contiguous sum.',
      },
    ],
  },

  algorithmConnection: {
    title: 'Brute Force vs Kadane',
    eyebrow: 'COMPARE',
    description:
      'Every contiguous subarray can be checked, but the cost depends on how you sum ranges. Kadane avoids enumerating ranges entirely.',
    items: [
      {
        title: 'Brute force (naive sums)',
        description:
          'There are O(n²) contiguous ranges. Summing each range from scratch costs O(n) work per range → O(n³) overall.',
      },
      {
        title: 'Brute force (with cumulative sums)',
        description:
          'Precompute prefix totals so each range sum is O(1). Enumerating all ranges is then O(n²).',
      },
      {
        title: "Kadane's Algorithm",
        description:
          'One linear scan with a restart/extend decision. Time O(n), extra space O(1). Same answer for the classic maximum contiguous sum.',
      },
    ],
  },

  previousLesson: {
    title: 'Frequency Counting',
    href: '/learn/frequency-counting',
  },

  nextLesson: {
    title: 'Longest Substring Without Repeating Characters',
    href: '/learn/longest-substring-without-repeating-characters',
  },

  categoryHref: '/algorithms/array-string',
}
