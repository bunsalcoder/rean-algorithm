import type { Lesson } from './types'

export const twoPointers: Lesson = {
  slug: 'two-pointers',
  title: 'Two Pointers',
  description:
    'Use two indices/pointers to examine different parts of a sequence efficiently — starting with the classic left/right pair-sum pattern on sorted arrays.',
  category: 'Array & String',
  difficulty: 'Beginner',
  estimatedTime: '20 min',
  tags: ['Array & String', 'Two Pointers', 'Arrays', 'O(n)'],

  objectives: [
    'Understand the two-pointer pattern with a left pointer and a right pointer.',
    'Learn how to find a pair of values that sum to a target on sorted data.',
    'Understand why this approach depends on the array being sorted.',
    'See how pointer movement is decided by comparing the current sum with the target.',
    'Compare the O(n) two-pointer approach with a brute-force O(n²) nested loop.',
    'Implement sorted two-sum in Python, JavaScript, and TypeScript without mutating the input.',
  ],

  overview: [
    'Instead of scanning an array repeatedly, we can sometimes use two pointers to keep track of two positions at the same time.',
    'Common patterns include one pointer from the left and one from the right, two pointers moving in the same direction, and pointers moving at different speeds.',
    'For this first lesson, focus on a left pointer and a right pointer on a sorted array.',
    'Example: given [1, 2, 3, 4, 6, 8, 9] and target 10, valid pairs include 1 + 9, 2 + 8, and 4 + 6. The educational walkthrough stops at the first valid pair: 1 + 9 = 10.',
  ],

  whyItMatters: [
    'The two-pointer pattern appears in many problems involving sorted arrays.',
    'It is useful for pair sums, duplicate removal, reversing sequences, palindrome checks, partitioning, and merging sequences.',
    'It can reduce certain nested-loop problems from O(n²) to O(n).',
    'Learning why a pointer can move is more important than memorizing a single code template.',
  ],

  visualization: {
    title: 'Two Pointers in action',
    description:
      'Watch left and right move toward each other as the current sum is compared with the target. The first valid pair stops the search.',
    type: 'two-pointers',
  },

  steps: [
    {
      title: 'Start with sorted data',
      description:
        'Confirm the array is sorted in ascending order. The movement rules below depend on that order.',
    },
    {
      title: 'Place left and right',
      description:
        'Set left to the first index and right to the last index. These two positions hold the current candidate pair.',
    },
    {
      title: 'Compute the current sum',
      description:
        'Add array[left] and array[right]. Compare that sum with the target.',
    },
    {
      title: 'If the sum equals the target, stop',
      description:
        'Return the indices [left, right]. For the first educational example, finding 1 + 9 = 10 is enough.',
    },
    {
      title: 'If the sum is too small, move left rightward',
      description:
        'Because the array is sorted, a larger left value can increase the sum. Set left = left + 1.',
    },
    {
      title: 'If the sum is too large, move right leftward',
      description:
        'A smaller right value can decrease the sum. Set right = right - 1.',
    },
    {
      title: 'Repeat while left < right',
      description:
        'Keep comparing and moving until a pair is found or the pointers meet. If they meet without a match, return [-1, -1].',
    },
  ],

  complexity: {
    time: {
      best: 'O(1)',
      average: 'O(n)',
      worst: 'O(n)',
    },
    space: 'O(1)',
    notes: {
      time: [
        'Both pointers move toward each other, and each index is processed a limited number of times.',
        'A brute-force nested loop that checks every pair would take O(n²) time.',
        'The two-pointer approach finds a pair (or proves none exists) in O(n) time on sorted input.',
        'If the first and last values already form the target pair, the best case is O(1).',
      ],
      space: [
        'The algorithm only needs a few variables such as left, right, and currentSum.',
        'It does not allocate an extra array proportional to the input size, so space stays O(1).',
        'The input array is not mutated.',
      ],
    },
  },

  pseudocode: `TwoSumSorted(array, target)
    left = 0
    right = length(array) - 1

    while left < right
        sum = array[left] + array[right]

        if sum equals target
            return [left, right]

        if sum < target
            left = left + 1
        else
            right = right - 1

    return [-1, -1]`,

  code: {
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

    return [-1, -1]


# Example
values = [1, 2, 3, 4, 6, 8, 9]
print(two_sum_sorted(values, 10))  # [0, 6]
print(two_sum_sorted(values, 100))  # [-1, -1]`,
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
}

// Example
const values = [1, 2, 3, 4, 6, 8, 9];
console.log(twoSumSorted(values, 10)); // [0, 6]
console.log(twoSumSorted(values, 100)); // [-1, -1]`,
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
}

// Example
const values: number[] = [1, 2, 3, 4, 6, 8, 9];
console.log(twoSumSorted(values, 10)); // [0, 6]
console.log(twoSumSorted(values, 100)); // [-1, -1]`,
  },

  whenToUse: [
    'Sorted arrays.',
    'Finding pairs.',
    'Comparing values from both ends.',
    'Problems where two positions need to move toward each other.',
    'Situations where a nested loop can potentially be replaced by coordinated pointer movement.',
  ],

  whenNotToUse: [
    'Data is unsorted and cannot reasonably be sorted.',
    'The problem requires arbitrary random access rather than coordinated scanning.',
    'Pointer movement cannot be logically determined from the current comparison.',
    'Two pointers is a pattern, not a universal solution for every array or string problem.',
  ],

  keyTakeaways: [
    'Two pointers can reduce certain nested-loop problems from O(n²) to O(n).',
    'The left/right pattern is especially useful on sorted data.',
    'The direction of pointer movement depends on the current comparison.',
    'The technique is a reusable problem-solving pattern.',
    'Understanding why a pointer can move is more important than memorizing the code.',
  ],

  sortedRequirement: {
    title: 'Why must the array be sorted?',
    description:
      'The pointer movement rules depend on knowing how values change as we move from left to right.',
    paragraphs: [
      'The left/right two-pointer rules depend on sorted order.',
      'If the sum is too small, increasing the left value can increase the sum.',
      'If the sum is too large, decreasing the right value can decrease the sum.',
      'If the array is not sorted, we cannot safely conclude “sum is too small → move left” or “sum is too large → move right”.',
      'Do not silently sort the input inside the algorithm unless the problem explicitly allows it — sorting has its own cost and may change required indices.',
    ],
    sorted: [1, 2, 3, 4, 6, 8, 9],
    unsorted: [6, 1, 9, 2, 8, 3, 4],
    explanation:
      'In the unsorted example, moving left or right no longer has a predictable effect on the sum, so the classic two-pointer pair-sum strategy is unsafe.',
  },

  thinkingGuide: {
    title: 'The Two Pointer Rule',
    description:
      'Use this comparison rule on sorted data. Memorize the reason for each move, not only the code.',
    steps: [
      'if arr[left] + arr[right] < target → left++',
      'if arr[left] + arr[right] > target → right--',
      'if arr[left] + arr[right] === target → found',
      'Because the array is sorted, a larger left value can raise the sum and a smaller right value can lower it.',
      'Keep looping while left < right. When the pointers meet, no pair remains.',
    ],
  },

  commonMistakes: {
    description:
      'These mistakes show up often when learners first write the left/right two-pointer pattern.',
    mistakes: [
      {
        title: 'Forgetting that the array is sorted',
        explanation:
          'Without ascending order, the move-left / move-right decisions are unsafe. Sort first only when the problem allows it, or choose another approach.',
      },
      {
        title: 'Moving the wrong pointer',
        explanation:
          'If the sum is too small, move left up. If the sum is too large, move right down. Swapping those moves usually skips the correct pair.',
      },
      {
        title: 'Using <= instead of < incorrectly in the loop',
        explanation:
          'Use while left < right for distinct pair indices. Using <= can compare an element with itself.',
      },
      {
        title: 'Moving both pointers unnecessarily',
        explanation:
          'After each comparison, move only the pointer that the rule requires — unless you have a specific reason to advance both.',
      },
      {
        title: 'Returning values when the problem expects indices',
        explanation:
          'This lesson returns [index1, index2], or [-1, -1] when no pair exists. Check the problem statement carefully.',
      },
      {
        title: 'Mutating the input array accidentally',
        explanation:
          'The educational implementation only moves indices. Avoid swapping or rewriting array values unless the problem asks for it.',
      },
      {
        title:
          'Assuming every pair-sum problem can use two pointers without sorting or another suitable structure',
        explanation:
          'Unsorted pair-sum often needs hashing or a nested loop. Two pointers is a pattern for the right conditions — not a universal shortcut.',
      },
    ],
  },

  algorithmConnection: {
    title: 'Brute Force vs Two Pointers',
    eyebrow: 'COMPARE',
    description:
      'The same pair-sum question can be solved in more than one way. The difference is how much work grows as n grows.',
    items: [
      {
        title: 'Brute force',
        description:
          'Check every pair with nested loops. Time: O(n²). Works on unsorted data, but does much more work as the array grows.',
      },
      {
        title: 'Two pointers on sorted data',
        description:
          'Start at both ends and move based on the current sum. Time: O(n). Space: O(1). Requires sorted order for the movement rules to be valid.',
      },
    ],
  },

  previousLesson: {
    title: 'Array & String Algorithms',
    href: '/algorithms/array-string',
  },

  categoryHref: '/algorithms/array-string',
}
