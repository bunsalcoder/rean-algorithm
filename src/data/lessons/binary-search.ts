import type { Lesson } from './types'

export const binarySearch: Lesson = {
  slug: 'binary-search',
  title: 'Binary Search',
  description:
    'Learn how Binary Search finds a value in a sorted array by repeatedly checking the middle and discarding half of the remaining range.',
  category: 'Searching Algorithms',
  difficulty: 'Beginner',
  estimatedTime: '15 min',
  tags: ['searching', 'sorted-array', 'divide-and-conquer', 'O(log n)'],

  objectives: [
    'Explain why Binary Search needs a sorted array',
    'Track low, mid, and high while the search range shrinks',
    'Decide which half to keep after comparing the middle value',
    'Recognize found and not-found outcomes, including low > high',
  ],

  overview: [
    'Binary Search is a searching algorithm that works by repeatedly dividing a sorted array into two halves.',
    'For example, consider the sorted array [2, 5, 8, 12, 16, 23, 38, 45, 56]. If we are searching for 23, we look at the middle element, compare it with 23, then search only the left half or the right half.',
    'If the target is smaller than the middle value, we search the left half. If the target is larger, we search the right half. We continue until the target is found or there is nothing left to search.',
  ],

  whyItMatters: [
    'It turns a large sorted list into a few comparisons instead of scanning every item.',
    'Interview and contest problems often expect you to recognize when Binary Search applies.',
    'The same “check the middle, discard a half” idea appears in many variants later.',
  ],

  visualization: {
    title: 'Binary Search in action',
    description:
      'Step through low, mid, and high as the search range shrinks toward the target.',
    type: 'binary-search',
  },

  steps: [
    {
      title: 'Confirm the array is sorted',
      description:
        'Binary Search only works correctly when values increase from left to right. Sorting is the precondition that lets you safely discard a whole half.',
    },
    {
      title: 'Set low and high',
      description:
        'Start with low at the first index and high at the last index. Everything between them is the current search range.',
    },
    {
      title: 'Compute mid and compare',
      description:
        'mid is the middle index of the current range. Compare arr[mid] with the target: equal means found, smaller means go right, larger means go left.',
    },
    {
      title: 'Eliminate one half',
      description:
        'Update low to mid + 1 or high to mid - 1. The discarded side is no longer part of the search.',
    },
    {
      title: 'Repeat until done',
      description:
        'Keep going while low <= high. If low becomes greater than high, the range is empty and the target is not present.',
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
        'Each step removes about half of the remaining search space.',
        'For example: 16 → 8 → 4 → 2 → 1 elements.',
        'That is why Binary Search is much faster than checking every element one by one on large sorted arrays.',
      ],
      space: [
        'The iterative version only needs a few variables such as low, high, and mid.',
        'It does not need extra arrays proportional to the input size.',
      ],
    },
  },

  pseudocode: `low = 0
high = array.length - 1

while low <= high
    mid = floor((low + high) / 2)

    if array[mid] === target
        return mid

    if array[mid] < target
        low = mid + 1
    else
        high = mid - 1

return -1`,

  code: {
    python: `def binary_search(array, target):
    low = 0
    high = len(array) - 1

    while low <= high:
        mid = (low + high) // 2

        if array[mid] == target:
            return mid

        if array[mid] < target:
            low = mid + 1
        else:
            high = mid - 1

    return -1


# Example
values = [2, 5, 8, 12, 16, 23, 38, 45, 56]
print(binary_search(values, 23))  # 5`,
    javascript: `function binarySearch(array, target) {
  let low = 0;
  let high = array.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    if (array[mid] === target) {
      return mid;
    }

    if (array[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return -1;
}

// Example
const values = [2, 5, 8, 12, 16, 23, 38, 45, 56];
console.log(binarySearch(values, 23)); // 5`,
    typescript: `function binarySearch(array: number[], target: number): number {
  let low = 0;
  let high = array.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    if (array[mid] === target) {
      return mid;
    }

    if (array[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return -1;
}

// Example
const values = [2, 5, 8, 12, 16, 23, 38, 45, 56];
console.log(binarySearch(values, 23)); // 5`,
  },

  whenToUse: [
    'The collection is already sorted (or you can afford to sort it once)',
    'You need to find whether a value exists, or locate its index',
    'The input is large enough that scanning every element would be too slow',
  ],

  whenNotToUse: [
    'The array is unsorted and you only search once — sorting first may cost more than a linear scan',
    'You need every matching occurrence in an unsorted list',
    'The data structure does not support efficient random access by index',
  ],

  keyTakeaways: [
    'Binary Search repeatedly checks the middle of a sorted range',
    'low, mid, and high make the current window visible and teachable',
    'If the target is larger than mid, discard the left half; if smaller, discard the right half',
    'Stop with a found index, or when low > high means not found',
  ],

  sortedRequirement: {
    paragraphs: [
      'Binary Search works because the array is sorted.',
      'If the target is greater than the middle value, we know everything to the left of the middle can be ignored.',
      'If the target is smaller, we know everything to the right can be ignored.',
    ],
    sorted: [2, 5, 8, 12, 16, 23, 38],
    unsorted: [12, 2, 38, 5, 23, 8, 16],
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
      'Repeat.',
    ],
  },

  previousLesson: {
    title: 'Introduction to Algorithms',
    href: '/learn/introduction-to-algorithms',
  },

  nextLesson: {
    title: 'Bubble Sort',
    href: '/learn/bubble-sort',
  },

  categoryHref: '/algorithms/searching',
}
