import type { Lesson } from './types'

export const binarySearch: Lesson = {
  slug: 'binary-search',
  title: 'Binary Search',
  description:
    'Learn how to find an element efficiently in a sorted array by repeatedly dividing the search range in half.',
  category: 'Searching',
  difficulty: 'Beginner',
  estimatedTime: '20 min',
  tags: ['Searching', 'Arrays', 'Binary Search', 'O(log n)'],

  objectives: [
    'Understand how Binary Search works.',
    'Understand why the input array must be sorted.',
    'Learn how to calculate the middle index.',
    'Understand how the search range changes after each comparison.',
    'Visualize the left, middle, and right pointers.',
    'Understand the time and space complexity.',
    'Implement Binary Search in Python, JavaScript, and TypeScript.',
  ],

  overview: [
    'Binary Search is an algorithm that finds a target in a sorted collection.',
    'Instead of checking every element one by one, it checks the middle element and eliminates half of the remaining search range.',
    'For example, consider the sorted array [3, 7, 12, 18, 24, 31, 42, 56, 68] and target 42. Compare 42 with the middle value. If the target is larger, search only the right half. If it is smaller, search only the left half.',
    'Binary Search requires sorted data for this approach to work correctly.',
  ],

  whyItMatters: [
    'It can search large sorted arrays efficiently.',
    'It reduces the search range by approximately half per iteration.',
    'It provides a foundation for more advanced searching techniques.',
    'It helps developers understand algorithmic efficiency.',
  ],

  visualization: {
    title: 'Binary Search in action',
    description:
      'Step through left, mid, and right as the search range shrinks toward the target — or until nothing remains.',
    type: 'binary-search',
  },

  steps: [
    {
      title: 'Set left and right',
      description:
        'Set left to the first index and right to the last index. Everything between them is the current search range.',
    },
    {
      title: 'Calculate the middle index',
      description:
        'Compute mid as the middle of the current range. A common formula is mid = floor((left + right) / 2), or the overflow-safe form left + floor((right - left) / 2).',
    },
    {
      title: 'Compare the middle element with the target',
      description:
        'Look at array[mid]. Ask whether it equals the target, is smaller, or is larger.',
    },
    {
      title: 'If they match, return the index',
      description:
        'When array[mid] equals the target, return mid. The search is finished.',
    },
    {
      title: 'If the target is smaller, move right to mid - 1',
      description:
        'Everything at mid and to the right can be discarded. Shrink the range by setting right = mid - 1.',
    },
    {
      title: 'If the target is larger, move left to mid + 1',
      description:
        'Everything at mid and to the left can be discarded. Shrink the range by setting left = mid + 1.',
    },
    {
      title: 'Repeat until found or the range is empty',
      description:
        'Keep going while left <= right. If left becomes greater than right, the target is not present — return -1.',
    },
  ],

  complexity: {
    time: {
      best: 'O(1)',
      average: 'O(log n)',
      worst: 'O(log n)',
    },
    space: 'O(1)',
    notes: {
      time: [
        'Each comparison eliminates about half of the remaining search range.',
        'For example: 16 → 8 → 4 → 2 → 1 elements. That logarithmic shrink is why Binary Search is O(log n) on average and in the worst case.',
        'If the middle element is the target on the first check, the best case is O(1).',
      ],
      space: [
        'The iterative version only needs a few variables such as left, right, and mid.',
        'It does not allocate an extra array proportional to the input size, so space stays O(1).',
      ],
    },
  },

  pseudocode: `BinarySearch(array, target)

    left = 0
    right = length(array) - 1

    while left <= right

        mid = floor((left + right) / 2)

        if array[mid] equals target
            return mid

        if array[mid] < target
            left = mid + 1
        else
            right = mid - 1

    return -1`,

  code: {
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

    return -1


# Example
values = [3, 7, 12, 18, 24, 31, 42, 56, 68]
print(binary_search(values, 42))  # 6
print(binary_search(values, 50))  # -1`,
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
}

// Example
const values = [3, 7, 12, 18, 24, 31, 42, 56, 68];
console.log(binarySearch(values, 42)); // 6
console.log(binarySearch(values, 50)); // -1`,
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
}

// Example
const values = [3, 7, 12, 18, 24, 31, 42, 56, 68];
console.log(binarySearch(values, 42)); // 6
console.log(binarySearch(values, 50)); // -1`,
  },

  whenToUse: [
    'Searching in sorted arrays.',
    'Searching large sorted collections.',
    'Situations where repeated searches justify maintaining sorted data.',
    'Problems involving monotonic conditions that can be searched using binary-search techniques.',
  ],

  whenNotToUse: [
    'Unsorted data without first sorting it.',
    'Situations where sorting costs more than a single Linear Search.',
    'Data structures without efficient random access, such as ordinary linked lists.',
    'Situations where a different data structure provides a more appropriate lookup method.',
  ],

  keyTakeaways: [
    'Binary Search works on sorted data.',
    'It compares the target with the middle element.',
    'Each iteration eliminates approximately half of the remaining search range.',
    'Best-case time complexity is O(1).',
    'Average and worst-case time complexity are O(log n).',
    'Iterative space complexity is O(1).',
  ],

  sortedRequirement: {
    paragraphs: [
      'Binary Search works because the array is sorted.',
      'If the target is greater than the middle value, everything to the left of mid can be ignored.',
      'If the target is smaller, everything to the right of mid can be ignored.',
    ],
    sorted: [3, 7, 12, 18, 24, 31, 42],
    unsorted: [18, 3, 42, 7, 31, 12, 24],
    explanation:
      'In the unsorted example, the middle value does not tell you which side can be discarded. Normal Binary Search would make the wrong cut, so sort first (or use Linear Search).',
  },

  thinkingGuide: {
    title: 'How to Think About It',
    description:
      'Use this checklist whenever a problem looks like a search on ordered data.',
    steps: [
      'Is the array sorted?',
      'Can I check the middle?',
      'Is the target smaller or larger than the middle?',
      'Which half can I eliminate?',
      'Repeat until found or the range is empty.',
    ],
  },

  commonMistakes: {
    description:
      'These mistakes show up often when learners first write Binary Search.',
    mistakes: [
      {
        title: 'Using Binary Search on unsorted data',
        explanation:
          'Without sorted order, discarding a half is unsafe. Sort first, or use Linear Search instead.',
      },
      {
        title: 'Incorrectly updating left or right',
        explanation:
          'After comparing mid, set left = mid + 1 or right = mid - 1. Leaving mid inside the range can cause infinite loops or missed values.',
      },
      {
        title: 'Forgetting to use mid - 1 or mid + 1',
        explanation:
          'If you set left = mid or right = mid when the values are not equal, the loop may never shrink the range.',
      },
      {
        title: 'Using the wrong loop condition',
        explanation:
          'Use while left <= right. Stopping at left < right can skip the final single-element range.',
      },
      {
        title: 'Confusing an index with a value',
        explanation:
          'mid is an index. Compare array[mid] with the target, then return mid — not the value itself — when found.',
      },
      {
        title: 'Incorrectly handling empty arrays',
        explanation:
          'When the array is empty, right becomes -1 and the loop never runs. Return -1 so callers know the target is missing.',
      },
      {
        title: 'Infinite loops from bad boundary updates',
        explanation:
          'If left and right stop changing, the loop never ends. Always move past mid after a mismatch.',
      },
    ],
  },

  previousLesson: {
    title: 'Linear Search',
    href: '/learn/linear-search',
  },

  nextLesson: {
    title: 'Bubble Sort',
    href: '/learn/bubble-sort',
  },

  categoryHref: '/algorithms/searching',
}
