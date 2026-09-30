import type { Lesson } from './types'

export const selectionSort: Lesson = {
  slug: 'selection-sort',
  title: 'Selection Sort',
  description:
    'Learn how Selection Sort repeatedly finds the smallest element in the unsorted portion of an array and places it in its correct position.',
  category: 'Sorting',
  difficulty: 'Beginner',
  estimatedTime: '20 min',
  tags: ['Sorting', 'Arrays', 'Selection Sort', 'O(n²)'],

  objectives: [
    'Understand how Selection Sort works.',
    'Understand the difference between the sorted and unsorted portions.',
    'Learn how the minimum element is selected.',
    'Visualize comparisons and swaps.',
    'Understand how the sorted portion grows after each pass.',
    'Analyze time and space complexity.',
    'Implement Selection Sort in Python, JavaScript, and TypeScript.',
  ],

  overview: [
    'Selection Sort repeatedly finds the smallest element in the unsorted portion of an array and places it in its correct position.',
    'Start with [5, 3, 8, 2, 4]. Begin at the first position, search the remaining unsorted portion, find the smallest element, and swap it with the first unsorted element. The sorted portion then grows by one element. Repeat until the array is sorted.',
    'Conceptually: find minimum → 2 to get [2, 3, 8, 5, 4]; find the next minimum → 3 (already in place) so the array stays [2, 3, 8, 5, 4]; find the next minimum → 4 to get [2, 3, 4, 5, 8]; continue until sorted.',
    'Selection Sort separates the array conceptually into a sorted portion and an unsorted portion: Sorted portion | Unsorted portion.',
  ],

  whyItMatters: [
    'It is simple to understand.',
    'It demonstrates the idea of maintaining a sorted and unsorted region.',
    'It provides another way to understand comparison-based sorting.',
    'It makes the relationship between comparisons and swaps easy to visualize.',
    'It helps learners compare different O(n²) sorting algorithms.',
  ],

  visualization: {
    title: 'Selection Sort in action',
    description:
      'Step through minimum searches, updates to the minimum candidate, swaps, and the growing sorted portion from left to right.',
    type: 'selection-sort',
  },

  steps: [
    {
      title: 'Start at the first unsorted position',
      description:
        'Begin at the left. Index i is where the next smallest element should go.',
    },
    {
      title: 'Assume the current element is the minimum',
      description:
        'Set minIndex = i. Treat that value as the smallest until a smaller one appears.',
    },
    {
      title: 'Compare it with the remaining unsorted elements',
      description:
        'Walk j from i + 1 to the end. Compare each value with the current minimum.',
    },
    {
      title: 'If a smaller element is found, update the minimum position',
      description:
        'If array[j] < array[minIndex], update minIndex = j. Do not swap yet.',
    },
    {
      title: 'Continue until the unsorted portion has been checked',
      description:
        'Finish scanning the entire unsorted portion so minIndex points to the true minimum.',
    },
    {
      title: 'Swap the smallest element with the first unsorted element',
      description:
        'If minIndex is not already i, swap array[i] with array[minIndex].',
    },
    {
      title: 'Mark that position as sorted',
      description:
        'Index i is now in its final sorted position. The sorted portion has grown by one.',
    },
    {
      title: 'Repeat until the entire array is sorted',
      description:
        'Move to the next unsorted position and repeat until every element is placed.',
    },
  ],

  selectionConcept: {
    paragraphs: [
      'Find the smallest element in the unsorted portion.',
      'Place it at the beginning of that portion.',
      'The sorted portion grows one element at a time from left to right.',
    ],
    before: [5, 3, 8, 2, 4],
    afterFirst: [2, 3, 8, 5, 4],
    afterSecond: [2, 3, 8, 5, 4],
    selectedValue: 2,
    secondSelectedValue: 3,
    explanation:
      'First we select 2 and swap it into index 0. Then we search [3, 8, 5, 4] — the minimum is already 3, so no swap is needed. The sorted portion becomes [2, 3].',
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
        'Even when the array is already sorted, it still performs approximately the same number of comparisons — there is no early-exit optimization in the classic algorithm.',
        'The total number of comparisons grows approximately with n × n, so best, average, and worst-case time complexity are all O(n²).',
      ],
      space: [
        'The sorting algorithm itself uses O(1) auxiliary space for indices and a temporary swap variable.',
        'The implementations below copy the input array before sorting, so they create an additional O(n) result array even though the in-place sorting procedure only needs O(1) extra space.',
      ],
    },
  },

  pseudocode: `SelectionSort(array)
    n = length(array)

    for i = 0 to n - 1
        minIndex = i

        for j = i + 1 to n - 1
            if array[j] < array[minIndex]
                minIndex = j

        if minIndex != i
            swap array[i] and array[minIndex]

    return array`,

  code: {
    python: `def selection_sort(arr):
    arr = arr.copy()
    n = len(arr)

    for i in range(n):
        min_index = i

        for j in range(i + 1, n):
            if arr[j] < arr[min_index]:
                min_index = j

        if min_index != i:
            arr[i], arr[min_index] = arr[min_index], arr[i]

    return arr`,
    javascript: `function selectionSort(arr) {
    const result = [...arr];
    const n = result.length;

    for (let i = 0; i < n; i++) {
        let minIndex = i;

        for (let j = i + 1; j < n; j++) {
            if (result[j] < result[minIndex]) {
                minIndex = j;
            }
        }

        if (minIndex !== i) {
            [result[i], result[minIndex]] = [
                result[minIndex],
                result[i]
            ];
        }
    }

    return result;
}`,
    typescript: `function selectionSort(arr: number[]): number[] {
    const result = [...arr];
    const n = result.length;

    for (let i = 0; i < n; i++) {
        let minIndex = i;

        for (let j = i + 1; j < n; j++) {
            if (result[j] < result[minIndex]) {
                minIndex = j;
            }
        }

        if (minIndex !== i) {
            [result[i], result[minIndex]] = [
                result[minIndex],
                result[i]
            ];
        }
    }

    return result;
}`,
  },

  whenToUse: [
    'Learning sorting fundamentals.',
    'Very small datasets.',
    'Situations where minimizing the number of swaps may matter more than minimizing comparisons.',
    'Educational demonstrations.',
  ],

  whenNotToUse: [
    'Large datasets.',
    'Performance-sensitive applications.',
    'Situations where O(n²) comparison complexity is too expensive.',
    'Cases where more efficient sorting algorithms are available.',
  ],

  commonMistakes: {
    description:
      'These mistakes show up often when learners first write Selection Sort.',
    mistakes: [
      {
        title: 'Forgetting to reset minIndex for every pass',
        explanation:
          'At the start of each pass, set minIndex = i. Reusing the previous pass’s minIndex tracks the wrong candidate.',
      },
      {
        title: 'Comparing against the wrong element',
        explanation:
          'Always compare array[j] with array[minIndex], not with an unrelated index or a stale value.',
      },
      {
        title: 'Swapping before finishing the search for the minimum',
        explanation:
          'Do not swap as soon as a smaller value appears. Finish scanning the unsorted portion, then swap once.',
      },
      {
        title: 'Forgetting to start the inner loop at i + 1',
        explanation:
          'The inner loop should begin at i + 1. Starting at 0 rescans sorted elements and can break the algorithm.',
      },
      {
        title: 'Forgetting to mark the newly placed element as sorted in the visualization',
        explanation:
          'After the swap (or no-swap), index i is locked. Mark it sorted so the growing prefix is clear.',
      },
      {
        title: 'Confusing the minimum candidate with the current comparison element',
        explanation:
          'The current comparison element is j. The minimum candidate is minIndex. They are often different indices.',
      },
    ],
  },

  keyTakeaways: [
    'Selection Sort divides the array into sorted and unsorted portions.',
    'It finds the smallest remaining element.',
    'The smallest element is placed at the beginning of the unsorted portion.',
    'The sorted portion grows after every pass.',
    'Best, average, and worst-case time complexity are O(n²).',
    'The sorting procedure uses O(1) auxiliary space.',
    'Selection Sort is simple but generally not suitable for large datasets.',
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

  nextLesson: {
    title: 'Insertion Sort',
    href: '/learn/insertion-sort',
  },

  categoryHref: '/algorithms/sorting',
}
