import type { Lesson } from './types'

export const mergeSort: Lesson = {
  slug: 'merge-sort',
  title: 'Merge Sort',
  description:
    'Learn how Merge Sort divides an array into smaller parts, sorts them, and merges them back together efficiently.',
  category: 'Sorting',
  difficulty: 'Beginner',
  estimatedTime: '25 min',
  tags: ['Sorting', 'Arrays', 'Merge Sort', 'Divide & Conquer', 'O(n log n)'],

  objectives: [
    'Understand the Divide & Conquer approach.',
    'Understand how Merge Sort splits an array.',
    'Understand how sorted subarrays are merged.',
    'Visualize the recursive splitting process.',
    'Understand why Merge Sort runs in O(n log n).',
    "Understand Merge Sort's space complexity.",
    'Implement Merge Sort in Python, JavaScript, and TypeScript.',
  ],

  overview: [
    'Merge Sort sorts by dividing an array into smaller pieces, sorting those pieces, and merging them back together. The pattern is simple: divide the array into two halves, keep dividing until each piece has one element, then merge the sorted pieces until the whole array is ordered.',
    'Start with [5, 3, 8, 2, 4]. Split into [5, 3] and [8, 2, 4]. Keep splitting until you reach single elements: [5] [3] [8] [2] [4].',
    'Then merge: [5] and [3] become [3, 5]. On the right, [2] and [4] become [2, 4], then merge with [8] to get [2, 4, 8]. Finally merge [3, 5] with [2, 4, 8] to get [2, 3, 4, 5, 8].',
    'The important part is not simply splitting. The algorithm becomes useful because each half is sorted before the final merge — combining two sorted lists is efficient and predictable.',
  ],

  whyItMatters: [
    'It uses Divide & Conquer — a pattern that appears in many algorithms.',
    'It provides O(n log n) time complexity in the best, average, and worst cases.',
    'Its performance is predictable, which helps when you need reliable sorting behavior.',
    'It works well for large datasets where O(n²) sorts become too slow.',
    'It is useful when stable sorting is important (equal values keep their relative order).',
    'Tradeoff: this implementation needs additional memory for merging — about O(n) auxiliary space. Algorithm choice still depends on the problem, input size, memory constraints, and implementation requirements. Merge Sort is not always better than Bubble Sort, Selection Sort, or Insertion Sort.',
  ],

  visualization: {
    title: 'Merge Sort in action',
    description:
      'Step through the Divide phase (splitting ranges) and the Merge phase (comparing sorted halves and combining them).',
    type: 'merge-sort',
  },

  steps: [
    {
      title: 'Start with the entire array',
      description:
        'Begin with the full unsorted array. Merge Sort will divide this range recursively.',
    },
    {
      title: 'Divide the array into two halves',
      description:
        'Find the middle index and split into a left half and a right half.',
    },
    {
      title: 'Keep dividing until each part has one element',
      description:
        'Recursively divide the left half, then the right half, until every piece is a single element. A one-element array is already sorted.',
    },
    {
      title: 'Merge two sorted halves',
      description:
        'Compare the first remaining values of the two sorted halves and always take the smaller one into a temporary merged result.',
    },
    {
      title: 'Copy any remaining values',
      description:
        'When one half is exhausted, copy the rest of the other half into the merged result.',
    },
    {
      title: 'Write the merged result back',
      description:
        'Copy the temporary merged values back into the original range. This is where the extra memory is used.',
    },
    {
      title: 'Continue merging up the call tree',
      description:
        'Each successful merge produces a larger sorted section. Keep merging until the full array is sorted.',
    },
    {
      title: 'The array is completely sorted',
      description:
        'When the top-level merge finishes, every element is in order.',
    },
  ],

  mergeConcept: {
    paragraphs: [
      'Divide the array into two halves.',
      'Keep dividing until each part contains one element.',
      'Merge the smaller sorted parts together.',
      'Continue merging until the entire array is sorted.',
    ],
    divideLabel: 'DIVIDE',
    mergeLabel: 'MERGE',
    divideStages: [
      {
        label: 'Start',
        groups: [[5, 3, 8, 2, 4]],
      },
      {
        label: 'First split',
        groups: [
          [5, 3],
          [8, 2, 4],
        ],
      },
      {
        label: 'Keep splitting',
        groups: [[5], [3], [8], [2, 4]],
      },
      {
        label: 'Single elements',
        groups: [[5], [3], [8], [2], [4]],
        note: 'each piece is already sorted',
      },
    ],
    mergeStages: [
      {
        label: 'Merge small pieces',
        groups: [[3, 5], [8], [2, 4]],
        note: 'sorted halves appear',
      },
      {
        label: 'Merge the right side',
        groups: [
          [3, 5],
          [2, 4, 8],
        ],
      },
      {
        label: 'Final merge',
        groups: [[2, 3, 4, 5, 8]],
        note: 'fully sorted',
      },
    ],
    explanation:
      'Splitting alone does not sort the array. Merge Sort becomes powerful because each half is sorted before it is merged — and merging two sorted lists is efficient.',
  },

  commonMistakes: {
    description:
      'These mistakes show up often when learners first write Merge Sort.',
    mistakes: [
      {
        title: 'Forgetting the base case',
        explanation:
          'If the array length is 0 or 1, return a copy immediately. Without this base case, recursion never stops.',
      },
      {
        title: 'Incorrect middle calculation',
        explanation:
          'Use middle = floor(length / 2). An off-by-one middle index splits unevenly or drops elements.',
      },
      {
        title: 'Not recursively sorting both halves',
        explanation:
          'You must call Merge Sort on the left half and the right half before merging. Sorting only one side leaves the result wrong.',
      },
      {
        title: 'Merging incorrectly',
        explanation:
          'Always compare the current heads of both halves and take the smaller (or equal) value. Mixing up the comparison breaks ordering and stability.',
      },
      {
        title: 'Forgetting remaining elements',
        explanation:
          'When one half runs out, append whatever is left in the other half. Skipping this leaves values out of the result.',
      },
      {
        title: 'Mixing the split phase with the merge phase',
        explanation:
          'First divide down to single elements, then merge on the way back up. Trying to merge before both halves are sorted defeats the algorithm.',
      },
      {
        title: 'Misunderstanding why the result becomes sorted',
        explanation:
          'The key insight is that merging two already-sorted lists produces a sorted list. That property is what rebuilds order from the bottom up.',
      },
      {
        title: 'Assuming Merge Sort is in-place for this implementation',
        explanation:
          'This beginner-friendly version builds temporary arrays during merging, so it uses O(n) auxiliary space — not O(1).',
      },
      {
        title: 'Not understanding recursion',
        explanation:
          'Each recursive call sorts a smaller piece. Trust the base case and the merge: if both halves are sorted, merging them sorts the whole range.',
      },
    ],
  },

  sortProperties: {
    description:
      'Two traits worth knowing early: Merge Sort can be stable, and this implementation is not in-place.',
    items: [
      {
        title: 'Stable sort',
        description:
          'When two values are equal, taking from the left half first (left[i] <= right[j]) keeps their original relative order.',
      },
      {
        title: 'Not in-place (this implementation)',
        description:
          'Merging builds a temporary result array, then copies values back. That extra memory is the usual tradeoff for predictable O(n log n) sorting.',
        steps: [
          'Original array',
          'temporary merge buffer',
          'Sorted array',
        ],
      },
    ],
  },

  algorithmConnection: {
    title: 'Compare Sorting Strategies',
    eyebrow: 'COMPARE',
    description:
      'Earlier sorts rearrange an array with nested loops. Merge Sort introduces Divide & Conquer. None is universally better.',
    items: [
      {
        title: 'Bubble Sort',
        description:
          'Compare adjacent neighbors and possibly swap. Simple, but usually O(n²).',
      },
      {
        title: 'Selection Sort',
        description:
          'Find the next smallest value and swap it into place once per pass.',
      },
      {
        title: 'Insertion Sort',
        description:
          'Insert each next key into a growing sorted prefix by shifting larger values right.',
      },
      {
        title: 'Merge Sort',
        description:
          'Divide into halves, sort recursively, then merge sorted halves in O(n log n) time with extra memory.',
      },
    ],
  },

  complexity: {
    time: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)',
    },
    space: 'O(n)',
    notes: {
      time: [
        'There are approximately log n levels of splitting — each level halves the piece sizes.',
        'At every level, merging processes about n elements in total.',
        'Therefore total time is about n × log n → O(n log n) in the best, average, and worst cases.',
      ],
      space: [
        'The merge process builds temporary arrays, so this implementation uses O(n) auxiliary space.',
        'Exact memory behavior can vary by implementation, but do not treat this version as O(1) auxiliary space.',
      ],
    },
  },

  pseudocode: `MergeSort(array)
    if length(array) <= 1
        return array

    middle = floor(length(array) / 2)

    left = MergeSort(left half)
    right = MergeSort(right half)

    return Merge(left, right)


Merge(left, right)
    result = empty array

    while left and right both contain elements
        if first element of left <= first element of right
            add first element of left to result
        else
            add first element of right to result

    add remaining elements from left
    add remaining elements from right

    return result`,

  code: {
    python: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr.copy()

    middle = len(arr) // 2

    # Recursively sort the left half and the right half.
    # Each call works on a smaller piece until pieces have one element.
    left = merge_sort(arr[:middle])
    right = merge_sort(arr[middle:])

    # Merge two already-sorted halves into one sorted list.
    return merge(left, right)


def merge(left, right):
    result = []
    i = 0
    j = 0

    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1

    # One half may still have leftover values — copy them.
    result.extend(left[i:])
    result.extend(right[j:])

    return result`,
    javascript: `function mergeSort(arr) {
    if (arr.length <= 1) {
        return [...arr];
    }

    const middle = Math.floor(arr.length / 2);

    // Recursively sort each half, then merge the sorted results.
    const left = mergeSort(arr.slice(0, middle));
    const right = mergeSort(arr.slice(middle));

    return merge(left, right);
}

function merge(left, right) {
    const result = [];
    let i = 0;
    let j = 0;

    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result.push(left[i]);
            i += 1;
        } else {
            result.push(right[j]);
            j += 1;
        }
    }

    while (i < left.length) {
        result.push(left[i]);
        i += 1;
    }

    while (j < right.length) {
        result.push(right[j]);
        j += 1;
    }

    return result;
}`,
    typescript: `function mergeSort(arr: number[]): number[] {
    if (arr.length <= 1) {
        return [...arr];
    }

    const middle = Math.floor(arr.length / 2);

    // Recursively sort each half, then merge the sorted results.
    const left = mergeSort(arr.slice(0, middle));
    const right = mergeSort(arr.slice(middle));

    return merge(left, right);
}

function merge(left: number[], right: number[]): number[] {
    const result: number[] = [];
    let i = 0;
    let j = 0;

    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result.push(left[i]);
            i += 1;
        } else {
            result.push(right[j]);
            j += 1;
        }
    }

    while (i < left.length) {
        result.push(left[i]);
        i += 1;
    }

    while (j < right.length) {
        result.push(right[j]);
        j += 1;
    }

    return result;
}`,
  },

  whenToUse: [
    'Predictable O(n log n) performance is important.',
    'Working with large datasets where O(n²) sorts are too slow.',
    'Stable sorting is useful.',
    'Additional memory for merging is acceptable.',
    'Divide & Conquer is a natural fit for the problem.',
  ],

  whenNotToUse: [
    'Memory usage is highly constrained.',
    'A different sorting algorithm better fits the environment or runtime.',
    'The dataset is very small and simplicity matters more.',
    'The language or runtime already provides a suitable optimized sorting implementation.',
  ],

  keyTakeaways: [
    'Merge Sort uses Divide & Conquer.',
    'The array is repeatedly divided into smaller pieces.',
    'Single-element arrays are already sorted.',
    'Sorted pieces are merged back together.',
    'Merge Sort runs in O(n log n) time.',
    'This implementation uses O(n) additional space.',
    'Understanding the merge operation is the key to understanding Merge Sort.',
  ],

  thinkingGuide: {
    title: 'How to Think About Merge Sort',
    description:
      'Use this checklist to derive the algorithm instead of only memorizing the code.',
    steps: [
      'Can I sort a smaller piece of the array?',
      'Split into a left half and a right half.',
      'Recursively sort the left half.',
      'Recursively sort the right half.',
      'Merge two sorted halves by always taking the smaller head.',
      'Copy any remaining values.',
      'Trust the base case: one element is already sorted.',
    ],
  },

  previousLesson: {
    title: 'Insertion Sort',
    href: '/learn/insertion-sort',
  },

  nextLesson: {
    title: 'Quick Sort',
    href: '/algorithms/sorting',
  },

  categoryHref: '/algorithms/sorting',
}
