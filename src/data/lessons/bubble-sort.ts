import type { Lesson } from './types'

export const bubbleSort: Lesson = {
  slug: 'bubble-sort',
  title: 'Bubble Sort',
  description:
    'Learn how Bubble Sort repeatedly compares neighboring values and swaps them until larger numbers “bubble” to the end of the array.',
  category: 'Sorting Algorithms',
  difficulty: 'Beginner',
  estimatedTime: '18 min',
  tags: ['sorting', 'nested-loops', 'in-place', 'O(n²)'],

  objectives: [
    'Explain Bubble Sort as repeated neighbor comparisons and swaps',
    'Track how each pass moves a large value toward the end',
    'Read the outer pass loop and the inner comparison loop',
    'Recognize why classic Bubble Sort takes roughly O(n²) time',
  ],

  overview: [
    'Bubble Sort repeatedly compares two neighboring elements. If they are in the wrong order, we swap them.',
    'For example, start with [5, 3, 8, 4, 2]. Compare 5 and 3. Since 5 > 3, swap them to get [3, 5, 8, 4, 2]. Then continue comparing the next neighboring pair.',
    'After each complete pass, the largest unsorted element moves toward the end of the array. Keep repeating passes until the whole array is sorted.',
  ],

  whyItMatters: [
    'It is one of the easiest sorting algorithms to visualize — perfect for learning nested loops.',
    'Watching values “bubble” to the end builds intuition for how sorting rearranges data step by step.',
    'Understanding Bubble Sort makes later sorting algorithms easier to compare and contrast.',
  ],

  visualization: {
    title: 'Bubble Sort in action',
    description:
      'Step through neighbor comparisons, swaps, and passes as large values move toward the end.',
    type: 'bubble-sort',
  },

  steps: [
    {
      title: 'Look at two neighbors',
      description:
        'Start at the left. Compare array[j] with array[j + 1] — the two values sitting next to each other.',
    },
    {
      title: 'Swap if they are out of order',
      description:
        'If the left value is greater than the right value, swap them. Otherwise leave them alone and move on.',
    },
    {
      title: 'Walk across the unsorted part',
      description:
        'Continue comparing the next pair until you reach the end of the current unsorted range.',
    },
    {
      title: 'Finish the pass',
      description:
        'After one full pass, the largest unsorted value has bubbled to its place near the end.',
    },
    {
      title: 'Repeat with a shorter range',
      description:
        'Run another pass over the remaining unsorted prefix. Each pass locks one more value at the end until everything is sorted.',
    },
  ],

  bubbleConcept: {
    paragraphs: [
      'Larger values “bubble” toward the end of the array.',
      'After each pass, one of the largest remaining values reaches its final position.',
      'That bubbling idea is the core mental model — more important than memorizing the loops at first.',
    ],
    before: [5, 3, 8, 4, 2],
    after: [3, 5, 4, 2, 8],
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
      'A common optimization watches whether a pass made any swaps.',
      'If a complete pass performs zero swaps, the array is already sorted and you can stop early.',
      'This is different from the basic nested-loop version shown in the visualization and code below.',
    ],
    exampleArray: [1, 2, 3, 4, 5],
    bestCase: 'O(n)',
    explanation:
      'On an already sorted array like [1, 2, 3, 4, 5], an optimized Bubble Sort finishes after one pass with swaps = 0. Best-case time becomes O(n). The classic version without this check still runs all passes.',
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

  complexity: {
    time: {
      best: 'O(n²)',
      average: 'O(n²)',
      worst: 'O(n²)',
    },
    space: 'O(1)',
    notes: {
      time: [
        'Classic Bubble Sort compares neighboring pairs across multiple passes, so the work grows roughly with n × n.',
        '5 elements need a manageable number of comparisons; 100 elements need many more.',
        'With the optional early-exit optimization (not used in the basic code below), best case can improve to O(n) on an already sorted array.',
      ],
      space: [
        'Sorting happens in place — we rearrange the same array.',
        'Only a few extra variables are needed, such as loop indices and a temporary swap variable.',
      ],
    },
  },

  pseudocode: `for i from 0 to n - 1
    for j from 0 to n - i - 2
        if array[j] > array[j + 1]
            swap array[j] and array[j + 1]`,

  code: {
    python: `def bubble_sort(array):
    values = list(array)
    n = len(values)

    for i in range(n):
        for j in range(0, n - i - 1):
            if values[j] > values[j + 1]:
                values[j], values[j + 1] = values[j + 1], values[j]

    return values


# Example
print(bubble_sort([5, 3, 8, 4, 2]))  # [2, 3, 4, 5, 8]`,
    javascript: `function bubbleSort(array) {
  const values = [...array];

  for (let i = 0; i < values.length; i += 1) {
    for (let j = 0; j < values.length - i - 1; j += 1) {
      if (values[j] > values[j + 1]) {
        const temp = values[j];
        values[j] = values[j + 1];
        values[j + 1] = temp;
      }
    }
  }

  return values;
}

// Example
console.log(bubbleSort([5, 3, 8, 4, 2])); // [2, 3, 4, 5, 8]`,
    typescript: `function bubbleSort(array: number[]): number[] {
  const values = [...array];

  for (let i = 0; i < values.length; i += 1) {
    for (let j = 0; j < values.length - i - 1; j += 1) {
      if (values[j] > values[j + 1]) {
        const temp = values[j];
        values[j] = values[j + 1];
        values[j + 1] = temp;
      }
    }
  }

  return values;
}

// Example
console.log(bubbleSort([5, 3, 8, 4, 2])); // [2, 3, 4, 5, 8]`,
  },

  whenToUse: [
    'You are learning how sorting and nested loops work visually',
    'The array is tiny and clarity matters more than speed',
    'You want an in-place sort with very simple swap logic',
  ],

  whenNotToUse: [
    'You need an efficient sort for large inputs — prefer Merge Sort, Quick Sort, or a built-in sort',
    'You need guaranteed better average performance than O(n²)',
    'Production code where library sorting is available and appropriate',
  ],

  keyTakeaways: [
    'Bubble Sort compares neighbors and swaps them when they are out of order',
    'Each pass bubbles a large unsorted value toward the end',
    'The outer loop runs passes; the inner loop compares array[j] with array[j + 1]',
    'Classic Bubble Sort is O(n²) time and O(1) extra space',
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
      'Repeat.',
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
