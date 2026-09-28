import type { Lesson } from './types'

export const linearSearch: Lesson = {
  slug: 'linear-search',
  title: 'Linear Search',
  description:
    'Learn how to find an element by checking each item in a collection one by one.',
  category: 'Searching',
  difficulty: 'Beginner',
  estimatedTime: '15 min',
  tags: ['Searching', 'Arrays', 'Linear Search', 'O(n)'],

  objectives: [
    'Understand how Linear Search works.',
    'Understand how an array is searched from beginning to end.',
    'Visualize each comparison made by the algorithm.',
    'Understand when Linear Search is useful.',
    'Determine the time and space complexity of Linear Search.',
    'Implement Linear Search in Python, JavaScript, and TypeScript.',
  ],

  overview: [
    'Linear Search checks elements one at a time, starting from the beginning of the collection.',
    'For example, given [10, 25, 7, 42, 18] and target 42, the algorithm checks 10 → not 42, then 25 → not 42, then 7 → not 42, then 42 → found.',
    'The algorithm does not require the data to be sorted. It simply walks from left to right until it finds a match or runs out of elements.',
  ],

  whyItMatters: [
    'It is one of the simplest searching algorithms.',
    'It works on unsorted data.',
    'It is easy to implement.',
    'It is useful when the dataset is small.',
    'It provides a foundation for understanding more advanced searching algorithms.',
  ],

  visualization: {
    title: 'Linear Search in action',
    description:
      'Step through each comparison as Linear Search walks the array looking for the target.',
    type: 'linear-search',
  },

  steps: [
    {
      title: 'Start from the first element',
      description:
        'Begin at index 0. That is the first value you will compare with the target.',
    },
    {
      title: 'Compare the current element with the target',
      description:
        'Ask a simple question: does the value at the current index equal the target?',
    },
    {
      title: 'If they match, return the position',
      description:
        'When the values are equal, return the current index. The search is finished.',
    },
    {
      title: 'If they do not match, move to the next element',
      description:
        'Increase the index by one and continue. Do not skip elements.',
    },
    {
      title: 'Continue until found or the array ends',
      description:
        'Keep comparing until you find the target or you pass the last index. If nothing matches, return -1.',
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
        'If the target is the first element, Linear Search finds it immediately — that is O(1).',
        'If the target is somewhere in the middle, the number of comparisons grows with the array size — about O(n) on average.',
        'If the target is the last element, or does not exist at all, every element must be checked — O(n) in the worst case.',
      ],
      space: [
        'The iterative version only needs a few variables such as the current index.',
        'It does not allocate an extra array proportional to the input size, so space stays O(1).',
      ],
    },
  },

  pseudocode: `LinearSearch(array, target)

    for each element in array

        if element equals target

            return index

    return -1`,

  code: {
    python: `def linear_search(arr, target):
    # Walk each index from left to right
    for i in range(len(arr)):
        # Compare the current value with the target
        if arr[i] == target:
            return i  # Return the index when found

    return -1  # Target was not in the array


# Example
values = [10, 25, 7, 42, 18]
print(linear_search(values, 42))  # 3
print(linear_search(values, 99))  # -1`,
    javascript: `function linearSearch(arr, target) {
  // Walk each index from left to right
  for (let i = 0; i < arr.length; i++) {
    // Compare the current value with the target
    if (arr[i] === target) {
      return i; // Return the index when found
    }
  }

  return -1; // Target was not in the array
}

// Example
const values = [10, 25, 7, 42, 18];
console.log(linearSearch(values, 42)); // 3
console.log(linearSearch(values, 99)); // -1`,
    typescript: `function linearSearch(arr: number[], target: number): number {
  // Walk each index from left to right
  for (let i = 0; i < arr.length; i++) {
    // Compare the current value with the target
    if (arr[i] === target) {
      return i; // Return the index when found
    }
  }

  return -1; // Target was not in the array
}

// Example
const values = [10, 25, 7, 42, 18];
console.log(linearSearch(values, 42)); // 3
console.log(linearSearch(values, 99)); // -1`,
  },

  whenToUse: [
    'The dataset is small and a simple scan is fast enough.',
    'The data is unsorted and sorting first would cost more than searching once.',
    'Simplicity matters more than search optimization.',
    'You only need to search infrequently, so a linear pass is acceptable.',
  ],

  whenNotToUse: [
    'The dataset is very large and a full scan would be too slow.',
    'Searches happen frequently on the same collection.',
    'The data is already sorted and Binary Search can be used instead.',
    'A more appropriate data structure (such as a hash set or map) can provide faster lookup.',
  ],

  keyTakeaways: [
    'Linear Search checks elements sequentially.',
    'It does not require sorted data.',
    'It stops when the target is found.',
    'If the target is not found, it checks every element.',
    'Best-case time complexity is O(1).',
    'Worst-case time complexity is O(n).',
    'Space complexity is O(1).',
  ],

  commonMistakes: {
    description:
      'These mistakes show up often when learners first write Linear Search.',
    mistakes: [
      {
        title: 'Forgetting that array indexes start at 0',
        explanation:
          'The first element is at index 0, not 1. Off-by-one mistakes often skip the first or last value.',
      },
      {
        title: 'Returning the value instead of the index',
        explanation:
          'Most Linear Search problems ask for the position. Returning arr[i] instead of i is a common mix-up.',
      },
      {
        title: 'Forgetting the “not found” case',
        explanation:
          'If the loop finishes without a match, return a clear signal such as -1 so callers know the target is missing.',
      },
      {
        title: 'Accidentally skipping elements',
        explanation:
          'Update the index by exactly one each time. Jumping ahead can miss the target even when it exists.',
      },
      {
        title: 'Assuming the array must be sorted',
        explanation:
          'Linear Search works on unsorted collections. Sorting is only required for algorithms like Binary Search.',
      },
    ],
  },

  previousLesson: {
    title: 'Big O Complexity',
    href: '/roadmap/complexity',
  },

  nextLesson: {
    title: 'Binary Search',
    href: '/learn/binary-search',
  },

  categoryHref: '/algorithms/searching',
}
