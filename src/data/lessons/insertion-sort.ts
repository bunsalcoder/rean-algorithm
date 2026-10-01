import type { Lesson } from './types'

export const insertionSort: Lesson = {
  slug: 'insertion-sort',
  title: 'Insertion Sort',
  description:
    'Learn how Insertion Sort builds a sorted portion of an array by inserting each new element into its correct position.',
  category: 'Sorting',
  difficulty: 'Beginner',
  estimatedTime: '20 min',
  tags: ['Sorting', 'Arrays', 'Insertion Sort', 'O(n²)'],

  objectives: [
    'Understand how Insertion Sort works.',
    'Understand the sorted and unsorted portions of an array.',
    'Learn how an element is inserted into its correct position.',
    'Visualize comparisons and element movement.',
    'Understand why Insertion Sort can be efficient for nearly sorted data.',
    'Analyze time and space complexity.',
    'Implement Insertion Sort in Python, JavaScript, and TypeScript.',
  ],

  overview: [
    'Insertion Sort builds a sorted portion of an array one element at a time. Imagine holding cards in your hand: the cards on the left are already sorted. Take the next card and move it left until it reaches its correct position. Apply the same idea to an array.',
    'Start with [5, 3, 8, 2, 4]. Treat the first element as already sorted: [5 | 3, 8, 2, 4].',
    'Insert 3: compare with 5, shift 5 right, then place 3 → [3, 5 | 8, 2, 4]. Insert 8: it is already larger than 5, so no shift → [3, 5, 8 | 2, 4]. Insert 2 by shifting larger values right → [2, 3, 5, 8 | 4]. Insert 4 → [2, 3, 4, 5, 8].',
    'The left portion remains sorted throughout the algorithm. Each new element is inserted into its correct place by shifting larger elements one position to the right — not by repeatedly swapping neighbors.',
  ],

  whyItMatters: [
    'It is intuitive and easy to understand.',
    'It works well for small datasets.',
    'It can perform well when data is already nearly sorted.',
    'It introduces the idea of incrementally building a solution.',
    'It demonstrates element movement rather than only swapping.',
  ],

  visualization: {
    title: 'Insertion Sort in action',
    description:
      'Step through selecting a key, comparing backward, shifting larger values right, and inserting the key into place.',
    type: 'insertion-sort',
  },

  steps: [
    {
      title: 'Treat the first element as a sorted portion',
      description:
        'A single element is already sorted. The sorted portion starts as [array[0]].',
    },
    {
      title: 'Take the next element as the current value/key',
      description:
        'Select the next unsorted element as the key — the value you will insert into the sorted portion.',
    },
    {
      title: 'Compare the key with elements in the sorted portion',
      description:
        'Move j from right to left through the sorted portion. Compare each sorted value with the key.',
    },
    {
      title: 'Shift larger elements one position to the right',
      description:
        'If array[j] > key, copy array[j] into array[j + 1]. Do not swap. Keep the key held separately.',
    },
    {
      title: 'Continue until the correct insertion position is found',
      description:
        'Keep shifting while j >= 0 and array[j] > key. Stop when a smaller-or-equal value is found, or when you reach the start of the array.',
    },
    {
      title: 'Insert the key into that position',
      description:
        'Place the key at array[j + 1] — the open spot created by shifting.',
    },
    {
      title: 'The sorted portion has grown by one element',
      description:
        'After the insertion, indices 0 through i form a sorted prefix.',
    },
    {
      title: 'Repeat until the entire array is sorted',
      description:
        'Move to the next unsorted element and repeat until every key has been inserted.',
    },
  ],

  insertionConcept: {
    paragraphs: [
      'The cards (or array values) on the left are already sorted.',
      'Take the next element as the key.',
      'Shift larger sorted values one position right to make space.',
      'Insert the key into the open position.',
    ],
    stages: [
      {
        label: 'Start: sorted | unsorted',
        values: [5, 3, 8, 2, 4],
        sortedCount: 1,
        keyIndex: 1,
        note: 'key = 3',
      },
      {
        label: 'Shift 5 right',
        values: [5, 5, 8, 2, 4],
        sortedCount: 1,
        note: '← shift',
      },
      {
        label: 'Insert 3',
        values: [3, 5, 8, 2, 4],
        sortedCount: 2,
        keyIndex: 0,
        note: 'insert',
      },
      {
        label: 'Fully sorted',
        values: [2, 3, 4, 5, 8],
        sortedCount: 5,
        note: 'done',
      },
    ],
    explanation:
      'Insertion Sort creates a sorted section gradually. Each pass takes one key from the unsorted side and inserts it by shifting — never by repeatedly swapping neighbors.',
  },

  nestedLoops: {
    description:
      'Insertion Sort uses an outer for-loop and an inner while-loop. Separate their jobs: choose the next key, then shift room for it.',
    outerLoop: {
      title: 'Outer loop — i',
      description:
        'Selects the next element that needs to be inserted. i starts at 1 because index 0 is already a sorted portion of one element.',
    },
    innerLoop: {
      title: 'Inner loop — j (while)',
      description:
        'Moves backward through the sorted portion. While j >= 0 and array[j] > key, shift array[j] one position right, then decrease j.',
    },
    passShrink: [
      'Pass 1 → insert into a sorted portion of size 1',
      'Pass 2 → insert into a sorted portion of size 2',
      'Pass 3 → insert into a sorted portion of size 3',
      '…continue until the sorted portion covers the whole array',
    ],
    passShrinkTitle: 'Why the sorted portion grows',
    passShrinkNote:
      'Each pass places one more key into the sorted prefix. After inserting at i, the sorted portion becomes indices 0 through i.',
  },

  insertionMechanics: {
    startAtOne: {
      paragraphs: [
        'The first element is already considered a sorted portion of one element, so we start by inserting the second element.',
        'That is why the outer loop begins at i = 1, not i = 0.',
      ],
      sortedPrefix: [5],
      remaining: [3, 8, 2, 4],
      firstKey: 3,
    },
    moveBackward: {
      paragraphs: [
        'The key needs to be compared against the sorted elements from right to left — closest first.',
        'Moving j backward finds the first place where the key belongs, shifting larger values as you go.',
      ],
      steps: [
        '3 < 5 → shift 5',
        'j becomes -1 → stop',
        'insert 3 at index 0',
      ],
    },
    whileCondition: {
      paragraphs: [
        'The while condition has two parts. When either part becomes false, we stop shifting.',
      ],
      conditions: [
        {
          code: 'j >= 0',
          explanation:
            'We must not move outside the beginning of the array. If j becomes -1, the key belongs at the front.',
        },
        {
          code: 'array[j] > key',
          explanation:
            'Only elements larger than the key should be shifted. Equal or smaller values mean we found the insert spot.',
        },
      ],
    },
  },

  commonMistakes: {
    description:
      'These mistakes show up often when learners first write Insertion Sort.',
    mistakes: [
      {
        title: 'Starting the loop at index 0 instead of index 1',
        explanation:
          'The first element is already considered sorted, so the first key starts at index 1. Beginning at 0 wastes work and muddies the mental model.',
      },
      {
        title: 'Forgetting to store the current key',
        explanation:
          'Save the key in a variable before shifting. If you overwrite array[i] without storing it, the value is lost.',
      },
      {
        title: 'Overwriting the key before inserting it',
        explanation:
          'Shifting copies larger values into the key’s original slot. That is fine only because the key is held in a separate variable.',
      },
      {
        title: 'Moving elements in the wrong direction',
        explanation:
          'Larger elements shift right (toward higher indices) to open a gap for the key. Shifting left breaks the algorithm.',
      },
      {
        title: 'Forgetting to insert the key after shifting',
        explanation:
          'After the while loop, place the key at array[j + 1]. Leaving it out leaves a duplicated shifted value and drops the key.',
      },
      {
        title: 'Using the wrong while-loop condition',
        explanation:
          'The loop should continue while j >= 0 and array[j] > key. Using >= instead of > breaks stability; forgetting j >= 0 risks an out-of-bounds access.',
      },
      {
        title: 'Confusing shifting with swapping',
        explanation:
          'Insertion Sort shifts larger values one position right to create space. Treating every step as an adjacent swap confuses it with Bubble Sort.',
      },
    ],
  },

  sortProperties: {
    description:
      'Two traits worth knowing early: Insertion Sort can be stable, and it sorts in place.',
    items: [
      {
        title: 'Stable sort',
        description:
          'If two elements have equal values, a normal Insertion Sort keeps their original relative order. Only strictly larger values are shifted (array[j] > key), so equals stay put.',
      },
      {
        title: 'In-place sort',
        description:
          'The insertion-sort procedure rearranges the same array instead of building another full copy during sorting. That matches the O(1) auxiliary space for the sorting procedure itself.',
        steps: [
          'Original array',
          'same array gets modified',
          'Sorted array',
        ],
      },
    ],
  },

  algorithmConnection: {
    title: 'Compare Sorting Strategies',
    eyebrow: 'COMPARE',
    description:
      'Bubble Sort, Selection Sort, and Insertion Sort all rearrange an array — with different everyday strategies. None is universally better.',
    items: [
      {
        title: 'Bubble Sort',
        description:
          'Compare adjacent neighbors and possibly swap, then continue. Large values bubble toward the end.',
      },
      {
        title: 'Selection Sort',
        description:
          'Find the smallest element in the unsorted portion, then swap it into position once.',
      },
      {
        title: 'Insertion Sort',
        description:
          'Select a key, compare backward, shift larger values right, then insert the key into place.',
      },
    ],
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
        'Best case O(n): when the array is already sorted, each element requires only one comparison and no shifting.',
        'Average and worst case O(n²): a reverse-sorted array causes each new element to be shifted across the entire sorted portion.',
        'Each pass may walk farther left through a larger sorted prefix, so total work grows roughly with n × n in the hard cases.',
      ],
      space: [
        'The insertion-sort procedure itself uses O(1) auxiliary space for indices and the key variable.',
        'The implementations below copy the input array before sorting, so they create an additional O(n) result array even though the in-place sorting procedure only needs O(1) extra space. The copy preserves the original input for the lesson.',
      ],
    },
  },

  pseudocode: `InsertionSort(array)
    for i = 1 to length(array) - 1
        key = array[i]
        j = i - 1

        while j >= 0 and array[j] > key
            array[j + 1] = array[j]
            j = j - 1

        array[j + 1] = key

    return array`,

  code: {
    python: `def insertion_sort(arr):
    arr = arr.copy()

    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1

        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1

        arr[j + 1] = key

    return arr`,
    javascript: `function insertionSort(arr) {
    const result = [...arr];

    for (let i = 1; i < result.length; i++) {
        const key = result[i];
        let j = i - 1;

        while (j >= 0 && result[j] > key) {
            result[j + 1] = result[j];
            j--;
        }

        result[j + 1] = key;
    }

    return result;
}`,
    typescript: `function insertionSort(arr: number[]): number[] {
    const result = [...arr];

    for (let i = 1; i < result.length; i++) {
        const key = result[i];
        let j = i - 1;

        while (j >= 0 && result[j] > key) {
            result[j + 1] = result[j];
            j--;
        }

        result[j + 1] = key;
    }

    return result;
}`,
  },

  whenToUse: [
    'Small datasets.',
    'Nearly sorted data.',
    'Data that arrives incrementally.',
    'Situations where a simple in-place sorting algorithm is useful.',
    'Educational demonstrations of incremental algorithms.',
  ],

  whenNotToUse: [
    'Large randomly ordered datasets.',
    'Performance-sensitive sorting of large collections.',
    'Situations where O(n log n) sorting algorithms are more appropriate.',
  ],

  keyTakeaways: [
    'Insertion Sort maintains a sorted portion of the array.',
    'Each new element is inserted into its correct position.',
    'Larger elements are shifted to the right.',
    'Best-case time complexity is O(n).',
    'Average and worst-case time complexity are O(n²).',
    'The sorting procedure uses O(1) auxiliary space.',
    'It works particularly well for small or nearly sorted datasets.',
  ],

  thinkingGuide: {
    title: 'How to Think About Insertion Sort',
    description:
      'Use this checklist to derive the algorithm instead of only memorizing the code.',
    steps: [
      'Treat the first element as sorted.',
      'Pick the next element as the key.',
      'Compare the key with elements to its left.',
      'Shift larger elements one position right.',
      'Find the correct position.',
      'Insert the key.',
      'Repeat.',
    ],
  },

  previousLesson: {
    title: 'Selection Sort',
    href: '/learn/selection-sort',
  },

  nextLesson: {
    title: 'Merge Sort',
    href: '/learn/merge-sort',
  },

  categoryHref: '/algorithms/sorting',
}
