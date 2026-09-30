import type { Lesson } from './types'

export const bubbleSort: Lesson = {
  slug: 'bubble-sort',
  title: 'Bubble Sort',
  description:
    'Learn how Bubble Sort repeatedly compares adjacent elements and swaps them to sort an array.',
  category: 'Sorting',
  difficulty: 'Beginner',
  estimatedTime: '20 min',
  tags: ['Sorting', 'Arrays', 'Bubble Sort', 'O(n²)'],

  objectives: [
    'Understand how Bubble Sort works.',
    'Learn how adjacent elements are compared.',
    'Understand when and why elements are swapped.',
    'Visualize how the largest unsorted value moves toward the end.',
    'Understand the role of each pass.',
    'Analyze time and space complexity.',
    'Implement Bubble Sort in Python, JavaScript, and TypeScript.',
  ],

  overview: [
    'Bubble Sort repeatedly compares neighboring elements. If two adjacent elements are in the wrong order, they are swapped.',
    'After each complete pass, the largest remaining unsorted element reaches its correct position at the end of the array.',
    'For example, start with [5, 3, 8, 2, 4]. Compare neighbors and swap when needed until the array becomes [2, 3, 4, 5, 8].',
    'Bubble Sort is simple to understand, but it can be inefficient for large arrays.',
  ],

  whyItMatters: [
    'It is a beginner-friendly introduction to sorting.',
    'It demonstrates comparisons and swaps.',
    'It helps learners understand nested loops.',
    'It provides a foundation for analyzing sorting complexity.',
    'It helps learners understand why more efficient sorting algorithms are useful.',
  ],

  visualization: {
    title: 'Bubble Sort in action',
    description:
      'Step through adjacent comparisons, swaps, and passes as large values bubble toward the end.',
    type: 'bubble-sort',
  },

  steps: [
    {
      title: 'Start at the beginning of the array',
      description:
        'Begin at the left side. The first pair you will look at is array[0] and array[1].',
    },
    {
      title: 'Compare the current element with the next element',
      description:
        'Compare two adjacent values: array[j] and array[j + 1]. Ask whether they are in the wrong order.',
    },
    {
      title: 'Swap when the left element is larger',
      description:
        'If the left element is larger than the right element, swap them. Otherwise leave them alone.',
    },
    {
      title: 'Move to the next adjacent pair',
      description:
        'Advance j by one and compare the next neighboring pair.',
    },
    {
      title: 'Continue until the end of the unsorted range',
      description:
        'Keep comparing pairs until you reach the end of the current unsorted portion of the array.',
    },
    {
      title: 'Lock the largest unsorted element in place',
      description:
        'After one full pass, the largest unsorted element is in its final position near the end.',
    },
    {
      title: 'Repeat with the remaining unsorted elements',
      description:
        'Run another pass over the remaining unsorted prefix. Each pass locks one more value at the end.',
    },
    {
      title: 'Stop when the array is sorted',
      description:
        'Finish when every element is in order. With the early-exit optimization, a pass with zero swaps means you can stop immediately.',
    },
  ],

  bubbleConcept: {
    paragraphs: [
      'Larger values “bubble” toward the end of the array.',
      'After each pass, one of the largest remaining values reaches its final position.',
      'That bubbling idea is the core mental model — more important than memorizing the loops at first.',
    ],
    before: [5, 3, 8, 2, 4],
    after: [3, 5, 2, 4, 8],
    bubbledValue: 8,
    explanation:
      'In the first pass, 8 keeps moving right whenever it is larger than its neighbor. By the end of the pass, 8 sits at the end — its final sorted spot.',
  },

  nestedLoops: {
    description:
      'Bubble Sort uses two loops. Nested loops can feel confusing at first, so separate their jobs clearly.',
    outerLoop: {
      title: 'Outer loop — i',
      description:
        'Controls the number of passes. Each time i increases, one more element at the end is already sorted.',
    },
    innerLoop: {
      title: 'Inner loop — j',
      description:
        'Walks through neighboring pairs. It compares array[j] with array[j + 1] because those two values sit next to each other.',
    },
    passShrink: [
      'Pass 1 → compare almost the entire array',
      'Pass 2 → the last element is already sorted',
      'Pass 3 → the last two elements are sorted',
      '…continue until nothing unsorted remains',
    ],
  },

  optimizationNote: {
    paragraphs: [
      'A useful optimization watches whether a pass made any swaps.',
      'If a complete pass performs zero swaps, the array is already sorted and the algorithm can stop early.',
      'The visualization and code examples below include this early-exit check.',
    ],
    exampleArray: [1, 2, 3, 4, 5],
    bestCase: 'O(n)',
    explanation:
      'On an already sorted array like [1, 2, 3, 4, 5], Bubble Sort finishes after one pass with swapped = false. Best-case time becomes O(n).',
  },

  complexity: {
    time: {
      best: 'O(n)',
      average: 'O(n²)',
      worst: 'O(n²)',
    },
    space: 'O(1)',
    notes: {
      time: [
        'The nested loops lead to quadratic work in the average and worst cases.',
        'A sorted array can finish in one pass when the early-exit optimization is used, giving best-case O(n).',
        'Without early exit, classic Bubble Sort would still be O(n²) even on sorted input.',
      ],
      space: [
        'The sorting procedure itself uses O(1) auxiliary space for indices and a temporary swap.',
        'The implementations below copy the input array, so their total additional memory usage is O(n), even though the in-place sorting logic only needs O(1) extra space.',
      ],
    },
  },

  pseudocode: `BubbleSort(array)
    n = length(array)

    for i = 0 to n - 1
        swapped = false

        for j = 0 to n - i - 2
            if array[j] > array[j + 1]
                swap array[j] and array[j + 1]
                swapped = true

        if swapped == false
            break

    return array`,

  code: {
    python: `def bubble_sort(arr):
    arr = arr.copy()
    n = len(arr)

    for i in range(n):
        swapped = False

        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True

        if not swapped:
            break

    return arr`,
    javascript: `function bubbleSort(arr) {
    const result = [...arr];
    const n = result.length;

    for (let i = 0; i < n; i++) {
        let swapped = false;

        for (let j = 0; j < n - i - 1; j++) {
            if (result[j] > result[j + 1]) {
                [result[j], result[j + 1]] = [result[j + 1], result[j]];
                swapped = true;
            }
        }

        if (!swapped) {
            break;
        }
    }

    return result;
}`,
    typescript: `function bubbleSort(arr: number[]): number[] {
    const result = [...arr];
    const n = result.length;

    for (let i = 0; i < n; i++) {
        let swapped = false;

        for (let j = 0; j < n - i - 1; j++) {
            if (result[j] > result[j + 1]) {
                [result[j], result[j + 1]] = [result[j + 1], result[j]];
                swapped = true;
            }
        }

        if (!swapped) {
            break;
        }
    }

    return result;
}`,
  },

  whenToUse: [
    'Learning basic sorting concepts.',
    'Demonstrating comparisons and swaps.',
    'Sorting very small arrays when simplicity is sufficient.',
    'Educational demonstrations.',
  ],

  whenNotToUse: [
    'Large datasets.',
    'Performance-sensitive applications.',
    'Situations where efficient sorting algorithms such as Merge Sort or Quick Sort are more appropriate.',
  ],

  commonMistakes: {
    description:
      'These mistakes show up often when learners first write Bubble Sort.',
    mistakes: [
      {
        title: 'Comparing non-adjacent elements',
        explanation:
          'Bubble Sort only compares neighbors: array[j] and array[j + 1]. Comparing distant indices breaks the algorithm.',
      },
      {
        title: 'Forgetting to swap elements when needed',
        explanation:
          'When the left value is larger than the right value, you must swap. Skipping the swap leaves the array unsorted.',
      },
      {
        title: 'Using an incorrect inner-loop boundary',
        explanation:
          'The inner loop should stop at n - i - 2 (or run while j < n - i - 1). Going past the unsorted range wastes work or reads past the end.',
      },
      {
        title: 'Forgetting that the sorted range grows after each pass',
        explanation:
          'After each pass, one more value at the end is locked. Shrink the comparison range instead of rescanning sorted elements.',
      },
      {
        title: 'Forgetting the early-exit condition',
        explanation:
          'If a full pass makes no swaps, the array is already sorted. Tracking swapped lets best-case time become O(n).',
      },
      {
        title: 'Incorrectly identifying the best-case complexity',
        explanation:
          'With early exit, best case is O(n). Without it, even a sorted array still costs O(n²). Know which version you are analyzing.',
      },
    ],
  },

  keyTakeaways: [
    'Bubble Sort compares adjacent elements.',
    'Elements are swapped when they are in the wrong order.',
    'Each pass moves the largest remaining unsorted value to its final position.',
    'Average and worst-case time complexity are O(n²).',
    'Best-case time complexity is O(n) with early exit.',
    'The algorithm is easy to understand but inefficient for large inputs.',
  ],

  thinkingGuide: {
    title: 'How to Think About Bubble Sort',
    description:
      'Use this checklist instead of trying to memorize the code first.',
    steps: [
      'Look at two neighboring values.',
      'Are they in the wrong order?',
      'If yes, swap them.',
      'Move to the next pair.',
      'Finish the pass.',
      'If no swaps occurred, stop early.',
      'Otherwise repeat with a shorter unsorted range.',
    ],
  },

  algorithmConnection: {
    description:
      'Searching and sorting solve different problems. Connect what you already know without ranking the algorithms.',
    items: [
      {
        title: 'Linear Search',
        description: 'Finds a value by checking elements one by one.',
      },
      {
        title: 'Binary Search',
        description:
          'Finds a value by repeatedly eliminating half of a sorted array.',
      },
      {
        title: 'Bubble Sort',
        description: 'Rearranges values into sorted order.',
      },
    ],
  },

  previousLesson: {
    title: 'Binary Search',
    href: '/learn/binary-search',
  },

  nextLesson: {
    title: 'Selection Sort',
    href: '/learn/selection-sort',
  },

  categoryHref: '/algorithms/sorting',
}
