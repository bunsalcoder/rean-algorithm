import type { Lesson } from './types'

export const insertionSort: Lesson = {
  slug: 'insertion-sort',
  title: 'Insertion Sort',
  description:
    'Learn how Insertion Sort builds a sorted prefix by taking each next element as a key and inserting it into the correct position by shifting larger values right.',
  category: 'Sorting Algorithms',
  difficulty: 'Beginner',
  estimatedTime: '20 min',
  tags: ['sorting', 'shifting', 'in-place', 'stable', 'O(n²)', 'key'],

  objectives: [
    'Explain Insertion Sort as inserting a key into a growing sorted portion',
    'Distinguish shifting larger elements from swapping neighbors',
    'Read why i starts at 1 and why j moves backward',
    'Recognize best-case O(n), worst-case O(n²), and O(1) extra space',
  ],

  overview: [
    'Insertion Sort takes one element from the unsorted portion and inserts it into the correct position in the sorted portion.',
    'For example, start with [7, 4, 9, 2, 5]. Treat the first element as already sorted: [7] | [4, 9, 2, 5]. Take 4 as the key. Because 4 < 7, shift 7 to the right, then insert 4 to get [4, 7] | [9, 2, 5].',
    'Continue the same process for 9, 2, and 5 until the entire array is sorted. Larger values move right to make space — that is shifting, not swapping.',
  ],

  whyItMatters: [
    'It matches how many people sort cards in their hand — insert each new card into place.',
    'Watching shifts (not swaps) clarifies how Insertion Sort differs from Bubble Sort.',
    'It introduces the idea of a stable, in-place sort with a useful best-case of O(n).',
  ],

  visualization: {
    title: 'Insertion Sort in action',
    description:
      'Step through selecting a key, comparing backward, shifting larger values right, and inserting the key into place.',
    type: 'insertion-sort',
  },

  steps: [
    {
      title: 'Treat the first element as sorted',
      description:
        'A single element is already sorted. The sorted portion starts as [array[0]].',
    },
    {
      title: 'Select the next key',
      description:
        'Take the next unsorted element as the key — the value you will insert into the sorted portion.',
    },
    {
      title: 'Compare backward through the sorted portion',
      description:
        'Move j from right to left. Compare each sorted value with the key.',
    },
    {
      title: 'Shift larger elements one position right',
      description:
        'If array[j] > key, copy array[j] into array[j + 1]. Do not swap. Keep the key held separately.',
    },
    {
      title: 'Insert the key, then grow the sorted portion',
      description:
        'When no more larger values remain to the left, place the key at array[j + 1]. Repeat until everything is sorted.',
    },
  ],

  insertionConcept: {
    paragraphs: [
      'The left side is already sorted.',
      'Take the next element as the key.',
      'Shift larger sorted values one position right to make space.',
      'Insert the key into the open position.',
    ],
    stages: [
      {
        label: 'Sorted portion + key',
        values: [2, 5, 8, 3],
        sortedCount: 3,
        keyIndex: 3,
        note: 'key = 3',
      },
      {
        label: 'Shift 8 right',
        values: [2, 5, 8, 8],
        sortedCount: 3,
        note: '← shift',
      },
      {
        label: 'Shift 5 right',
        values: [2, 5, 5, 8],
        sortedCount: 2,
        note: '← shift',
      },
      {
        label: 'Insert 3',
        values: [2, 3, 5, 8],
        sortedCount: 4,
        keyIndex: 1,
        note: 'insert',
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
      sortedPrefix: [7],
      remaining: [4, 9, 2, 5],
      firstKey: 4,
    },
    moveBackward: {
      paragraphs: [
        'The key needs to be compared against the sorted elements from right to left — closest first.',
        'Moving j backward finds the first place where the key belongs, shifting larger values as you go.',
      ],
      steps: [
        '3 < 8 → shift 8',
        '3 < 5 → shift 5',
        '3 > 2 → stop',
        'insert 3',
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
      'Avoid these common traps when learning Insertion Sort for the first time.',
    mistakes: [
      {
        title: 'Swapping instead of shifting',
        explanation:
          'Insertion Sort normally shifts larger values one position right to create space for the key. Treating every step as an adjacent swap confuses it with Bubble Sort.',
      },
      {
        title: 'Starting i at 0',
        explanation:
          'The first element is already considered sorted, so the first key starts at index 1. Beginning at 0 wastes work and muddies the mental model.',
      },
      {
        title: 'Moving j forward',
        explanation:
          'j needs to move backward because we are searching for the key’s position inside the already-sorted left portion.',
      },
      {
        title: 'Forgetting to insert the key',
        explanation:
          'After shifting elements, the key must be placed at array[j + 1]. Leaving it out leaves a hole or a duplicated shifted value.',
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
          'Insertion Sort rearranges the same array instead of building another full copy. That matches the O(1) extra space complexity.',
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
        'Best case O(n): if the array is already sorted, like [1, 2, 3, 4, 5], each key needs only a quick comparison and almost no shifting.',
        'Average and worst case O(n²): reverse-sorted input like [5, 4, 3, 2, 1] forces many shifts for every key.',
        'Each pass may walk farther left through a larger sorted prefix, so total work grows roughly with n × n in the hard cases.',
      ],
      space: [
        'Sorting happens in place — we rearrange the same array.',
        'Only a few extra variables are needed, such as i, j, and key — O(1) extra space.',
      ],
    },
  },

  pseudocode: `for i from 1 to n - 1
    key = array[i]
    j = i - 1

    while j >= 0 and array[j] > key
        array[j + 1] = array[j]
        j = j - 1

    array[j + 1] = key`,

  code: {
    python: `def insertion_sort(array):
    values = list(array)

    for i in range(1, len(values)):
        key = values[i]
        j = i - 1

        while j >= 0 and values[j] > key:
            values[j + 1] = values[j]
            j -= 1

        values[j + 1] = key

    return values


# Example
print(insertion_sort([7, 4, 9, 2, 5]))  # [2, 4, 5, 7, 9]`,
    javascript: `function insertionSort(array) {
  const values = [...array];

  for (let i = 1; i < values.length; i += 1) {
    const key = values[i];
    let j = i - 1;

    while (j >= 0 && values[j] > key) {
      values[j + 1] = values[j];
      j -= 1;
    }

    values[j + 1] = key;
  }

  return values;
}

// Example
console.log(insertionSort([7, 4, 9, 2, 5])); // [2, 4, 5, 7, 9]`,
    typescript: `function insertionSort(array: number[]): number[] {
  const values = [...array];

  for (let i = 1; i < values.length; i += 1) {
    const key = values[i];
    let j = i - 1;

    while (j >= 0 && values[j] > key) {
      values[j + 1] = values[j];
      j -= 1;
    }

    values[j + 1] = key;
  }

  return values;
}

// Example
console.log(insertionSort([7, 4, 9, 2, 5])); // [2, 4, 5, 7, 9]`,
  },

  whenToUse: [
    'You are learning how a sorted prefix grows by inserting one key at a time',
    'The array is tiny, nearly sorted, or clarity matters more than speed',
    'You want a simple stable, in-place sort for teaching or small inputs',
  ],

  whenNotToUse: [
    'You need an efficient sort for large reverse-sorted inputs — prefer Merge Sort, Quick Sort, or a built-in sort',
    'You need guaranteed better worst-case performance than O(n²)',
    'Production code where library sorting is available and appropriate',
  ],

  keyTakeaways: [
    'Insertion Sort inserts each key into a growing sorted portion',
    'Larger sorted values shift right to make space — that is not a swap loop',
    'i starts at 1; j walks backward while array[j] > key',
    'Best case O(n), average/worst O(n²), extra space O(1); can be stable and in-place',
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

  categoryHref: '/algorithms/sorting',
}
