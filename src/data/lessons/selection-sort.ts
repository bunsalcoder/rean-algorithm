import type { Lesson } from './types'

export const selectionSort: Lesson = {
  slug: 'selection-sort',
  title: 'Selection Sort',
  description:
    'Learn how Selection Sort finds the smallest value in the unsorted portion of an array and places it into its final position, one element at a time.',
  category: 'Sorting Algorithms',
  difficulty: 'Beginner',
  estimatedTime: '18 min',
  tags: ['sorting', 'nested-loops', 'in-place', 'O(n²)', 'minIndex'],

  objectives: [
    'Explain Selection Sort as selecting the minimum from the unsorted portion',
    'Track how the sorted boundary grows from left to right',
    'Read the outer placement loop and the inner search loop',
    'Use minIndex to remember the smallest value before swapping once',
  ],

  overview: [
    'Selection Sort finds the smallest element in the unsorted portion of the array and moves it to the beginning of that portion.',
    'For example, start with [7, 4, 9, 2, 5]. The whole array is unsorted. Search for the smallest value — it is 2. Swap it with the first element to get [2, 4, 9, 7, 5]. Now 2 is in its final sorted position.',
    'Then repeat for the remaining unsorted portion: [2 | 4, 9, 7, 5]. Keep selecting the next minimum until the entire array is sorted.',
  ],

  whyItMatters: [
    'It makes the idea of a growing sorted prefix easy to see — perfect for beginners.',
    'Tracking a running minimum teaches an important pattern used in many algorithms.',
    'Comparing it with Bubble Sort shows that different strategies can solve the same sorting problem.',
  ],

  visualization: {
    title: 'Selection Sort in action',
    description:
      'Step through minimum searches, updates to minIndex, and swaps as the sorted portion grows from left to right.',
    type: 'selection-sort',
  },

  steps: [
    {
      title: 'Choose the next placement position',
      description:
        'Start at the left. Index i is where the next smallest element should go.',
    },
    {
      title: 'Assume the first unsorted value is the minimum',
      description:
        'Set minIndex = i. Believe that value is smallest until a smaller one appears.',
    },
    {
      title: 'Scan the unsorted portion',
      description:
        'Walk j from i + 1 to the end. Compare each value with the current minimum.',
    },
    {
      title: 'Update minIndex when a smaller value appears',
      description:
        'If array[j] < array[minIndex], update minIndex = j. Do not swap yet.',
    },
    {
      title: 'Swap once, then grow the sorted portion',
      description:
        'After the scan, swap array[i] with array[minIndex] if needed. Index i is now sorted. Move the boundary forward and repeat.',
    },
  ],

  selectionConcept: {
    paragraphs: [
      'Find the smallest element in the unsorted portion.',
      'Place it at the beginning of that portion.',
      'The sorted portion grows one element at a time from left to right.',
    ],
    before: [7, 4, 9, 2, 5],
    afterFirst: [2, 4, 9, 7, 5],
    afterSecond: [2, 4, 9, 7, 5],
    selectedValue: 2,
    secondSelectedValue: 4,
    explanation:
      'First we select 2 and swap it into index 0. Then we search [4, 9, 7, 5] — the minimum is already 4, so no swap is needed. The sorted portion becomes [2, 4].',
  },

  nestedLoops: {
    description:
      'Selection Sort uses two loops. Separate their jobs clearly — placement versus searching.',
    outerLoop: {
      title: 'Outer loop — i',
      description:
        'Determines where the next smallest element should be placed. When i = 0 we fill index 0; when i = 1 we fill index 1; and so on.',
    },
    innerLoop: {
      title: 'Inner loop — j',
      description:
        'Scans the remaining unsorted portion. It compares each element with the current minimum stored at minIndex.',
    },
    passShrink: [
      'Pass 1 → search almost the entire array',
      'Pass 2 → the first element is already sorted',
      'Pass 3 → the first two elements are sorted',
      '…continue until nothing unsorted remains',
    ],
    passShrinkTitle: 'Why the unsorted portion shrinks',
    passShrinkNote:
      'Each pass locks one more value at the front. The inner loop starts at i + 1, so it only searches what is still unsorted.',
  },

  minIndexNote: {
    paragraphs: [
      'minIndex stores the index of the smallest element found so far in the current pass.',
      'When minIndex = 0, it means: “So far, I believe index 0 contains the smallest value.”',
      'We do not swap every time we find a smaller number. We finish the search first.',
    ],
    initialExample: 'minIndex = i',
    updateCondition: 'if (array[j] < array[minIndex])',
    keyInsight:
      'Finish searching the unsorted portion, find the true minimum, then perform at most one swap. That is an important difference from Bubble Sort, which may swap many neighboring pairs in a single pass.',
  },

  commonMistake: {
    paragraphs: [
      'A common mistake is to swap immediately whenever a smaller value appears.',
      'That changes the array too early and loses track of the true minimum for the pass.',
    ],
    incorrect: [
      'Find a smaller value',
      'Immediately swap',
      'Continue (and possibly swap again)',
    ],
    correct: [
      'Search the entire unsorted portion',
      'Find the smallest value',
      'Swap once into position',
    ],
    explanation:
      'minIndex exists so you can remember the best candidate while you keep scanning. Swap only after the scan is complete.',
  },

  algorithmConnection: {
    title: 'Bubble Sort vs Selection Sort',
    eyebrow: 'COMPARE',
    description:
      'Both sort an array, but they use different strategies. Neither is universally better — learn how each thinks.',
    items: [
      {
        title: 'Bubble Sort',
        description:
          'Repeatedly compares neighboring elements and swaps them when they are out of order. Large values bubble toward the end.',
      },
      {
        title: 'Selection Sort',
        description:
          'Searches for the minimum in the unsorted portion, then swaps it into place once. The sorted portion grows from the left.',
      },
      {
        title: 'Shared idea',
        description:
          'Both rearrange values into sorted order with nested loops. Watching both builds intuition for different sorting strategies.',
      },
    ],
  },

  complexity: {
    time: {
      best: 'O(n²)',
      average: 'O(n²)',
      worst: 'O(n²)',
    },
    space: 'O(1)',
    notes: {
      time: [
        'Selection Sort still searches through the remaining unsorted portion for every position.',
        'First pass → compare many elements. Second pass → compare slightly fewer. Third pass → compare fewer still.',
        'The total number of comparisons grows approximately with n × n, so time complexity is O(n²).',
      ],
      space: [
        'Sorting happens in place — we rearrange the same array.',
        'Only a few extra variables are needed, such as i, j, minIndex, and a temporary swap variable — O(1) extra space.',
      ],
    },
  },

  pseudocode: `for i from 0 to n - 1
    minIndex = i
    for j from i + 1 to n - 1
        if array[j] < array[minIndex]
            minIndex = j
    swap array[i] and array[minIndex]`,

  code: {
    python: `def selection_sort(array):
    values = list(array)

    for i in range(len(values)):
        min_index = i

        for j in range(i + 1, len(values)):
            if values[j] < values[min_index]:
                min_index = j

        if min_index != i:
            values[i], values[min_index] = values[min_index], values[i]

    return values


# Example
print(selection_sort([7, 4, 9, 2, 5]))  # [2, 4, 5, 7, 9]`,
    javascript: `function selectionSort(array) {
  const values = [...array];

  for (let i = 0; i < values.length; i += 1) {
    let minIndex = i;

    for (let j = i + 1; j < values.length; j += 1) {
      if (values[j] < values[minIndex]) {
        minIndex = j;
      }
    }

    if (minIndex !== i) {
      const temp = values[i];
      values[i] = values[minIndex];
      values[minIndex] = temp;
    }
  }

  return values;
}

// Example
console.log(selectionSort([7, 4, 9, 2, 5])); // [2, 4, 5, 7, 9]`,
    typescript: `function selectionSort(array: number[]): number[] {
  const values = [...array];

  for (let i = 0; i < values.length; i += 1) {
    let minIndex = i;

    for (let j = i + 1; j < values.length; j += 1) {
      if (values[j] < values[minIndex]) {
        minIndex = j;
      }
    }

    if (minIndex !== i) {
      const temp = values[i];
      values[i] = values[minIndex];
      values[minIndex] = temp;
    }
  }

  return values;
}

// Example
console.log(selectionSort([7, 4, 9, 2, 5])); // [2, 4, 5, 7, 9]`,
  },

  whenToUse: [
    'You are learning how a sorted prefix grows one minimum at a time',
    'The array is tiny and clarity matters more than speed',
    'You want an in-place sort with at most one swap per pass',
  ],

  whenNotToUse: [
    'You need an efficient sort for large inputs — prefer Merge Sort, Quick Sort, or a built-in sort',
    'You need better average performance than O(n²)',
    'Production code where library sorting is available and appropriate',
  ],

  keyTakeaways: [
    'Selection Sort selects the smallest remaining value and places it next',
    'The sorted portion grows from left to right one element per pass',
    'minIndex tracks the minimum during the scan; swap happens after the search',
    'Classic Selection Sort is O(n²) time and O(1) extra space',
  ],

  thinkingGuide: {
    title: 'How to Think About Selection Sort',
    description:
      'Use this checklist to derive the algorithm instead of only memorizing the code.',
    steps: [
      'Where should the next smallest element go?',
      'Search the unsorted portion.',
      'Keep track of the smallest value.',
      'Finish the search.',
      'Swap the smallest value into position.',
      'Move the sorted boundary forward.',
      'Repeat.',
    ],
  },

  previousLesson: {
    title: 'Bubble Sort',
    href: '/learn/bubble-sort',
  },

  categoryHref: '/algorithms/sorting',
}
