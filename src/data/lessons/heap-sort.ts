import type { Lesson } from './types'

export const heapSort: Lesson = {
  slug: 'heap-sort',
  title: 'Heap Sort',
  description:
    'Learn how Heap Sort uses a binary heap to repeatedly select the largest element and build a sorted array.',
  category: 'Sorting',
  difficulty: 'Intermediate',
  estimatedTime: '25 min',
  tags: ['Sorting', 'Arrays', 'Heap', 'Heap Sort', 'O(n log n)'],

  objectives: [
    'Understand what a binary heap is.',
    'Understand the Max Heap property.',
    'Understand how an array represents a heap.',
    'Learn how to build a Max Heap.',
    'Understand heapify.',
    'Understand how Heap Sort repeatedly extracts the maximum value.',
    'Understand Heap Sort complexity.',
    'Implement Heap Sort in Python, JavaScript, and TypeScript.',
  ],

  overview: [
    'Heap Sort sorts by first turning the array into a Max Heap, then repeatedly moving the largest remaining value to the end. The pattern is: build a Max Heap so the root holds the maximum, swap that root with the last unsorted element, shrink the heap, heapify the root to restore the Max Heap property, and repeat until everything is sorted.',
    'A binary heap is commonly represented with an array. For zero-based indexing, the left child of index i is 2·i+1, the right child is 2·i+2, and the parent is ⌊(i−1)/2⌋. A Max Heap satisfies parent ≥ children, so the largest value is always at the root.',
    'Start with [5, 3, 8, 2, 4]. After building a Max Heap you get [8, 4, 5, 2, 3]. Move the maximum: [3, 4, 5, 2 | 8]. Restore the heap: [5, 4, 3, 2 | 8]. Move the next maximum: [2, 4, 3 | 5, 8]. Continue through [4, 2, 3 | 5, 8] and further extractions until the final sorted array [2, 3, 4, 5, 8].',
    'The important idea is that a heap is not a fully sorted array — it only guarantees the parent–child relationship. Heap Sort uses that guarantee to pull out the next maximum efficiently.',
  ],

  whyItMatters: [
    'Heap Sort provides O(n log n) worst-case time.',
    'It uses the heap data structure, which also appears in Priority Queues.',
    'The sorting procedure can work in place, without the auxiliary merge array used by this project’s Merge Sort implementation.',
    'It shows how a data structure can drive an algorithm design.',
    'Tradeoffs still matter: Heap Sort is typically not stable, and practical constant factors or locality may favor other algorithms for some workloads. Do not treat it as universally better than Merge Sort or Quick Sort.',
  ],

  visualization: {
    title: 'Heap Sort in action',
    description:
      'Step through Max Heap construction, heapify, extracting the maximum, and growing the sorted region — with array and compact tree views.',
    type: 'heap-sort',
  },

  steps: [
    {
      title: 'Represent the array as a binary heap',
      description:
        'Map each index to a tree node using left = 2·i+1 and right = 2·i+2. The same values appear in both the array and the tree.',
    },
    {
      title: 'Build a Max Heap',
      description:
        'Heapify each non-leaf node from the bottom up until every parent is greater than or equal to its children. The largest value ends up at the root.',
    },
    {
      title: 'Swap the root with the last unsorted element',
      description:
        'Move the current maximum into the sorted region at the end of the array.',
    },
    {
      title: 'Reduce the heap size',
      description:
        'Exclude the newly sorted suffix from future heapify work so the sorted region stays untouched.',
    },
    {
      title: 'Heapify the root',
      description:
        'Restore the Max Heap property on the remaining unsorted prefix so the new largest value rises to the root.',
    },
    {
      title: 'Repeat until only one element remains',
      description:
        'Each extraction grows the sorted region by one. Continue until the whole array is ordered.',
    },
    {
      title: 'The array is completely sorted',
      description:
        'When every maximum has been extracted into place, Heap Sort is finished.',
    },
  ],

  heapConcept: {
    paragraphs: [
      'A binary heap is a complete binary tree commonly stored in an array.',
      'In a Max Heap, every parent is greater than or equal to its children.',
      'The largest value is always at the root (index 0).',
      'Heap Sort builds this structure first, then repeatedly extracts the root into a sorted suffix.',
    ],
    indexingTitle: 'Zero-based child formulas',
    formulas: [
      {
        label: 'Left child',
        formula: '2 * i + 1',
      },
      {
        label: 'Right child',
        formula: '2 * i + 2',
      },
      {
        label: 'Parent',
        formula: 'Math.floor((i - 1) / 2)',
      },
    ],
    maxHeapProperty: 'parent ≥ children',
    before: {
      label: 'Unsorted array as a tree',
      array: [5, 3, 8, 2, 4],
      note: 'Not yet a Max Heap — 5 < 8 at the right child.',
    },
    after: {
      label: 'After building a Max Heap',
      array: [8, 4, 5, 2, 3],
      note: 'Root 8 is the maximum; every parent ≥ its children.',
    },
    explanation:
      'The tree and the array are the same structure. Heap Sort never needs a separate tree data type for this lesson — the array indices already encode parent and child links.',
  },

  commonMistakes: {
    description:
      'These mistakes show up often when learners first write Heap Sort.',
    mistakes: [
      {
        title: 'Confusing a Max Heap with a sorted array',
        explanation:
          'A Max Heap only guarantees parent ≥ children. Values in the array are not fully sorted until Heap Sort finishes extracting maxima.',
      },
      {
        title: 'Forgetting zero-based child formulas',
        explanation:
          'Use left = 2·i+1 and right = 2·i+2. Off-by-one formulas break heapify and can read past the heap.',
      },
      {
        title: 'Using the wrong heap size after extraction',
        explanation:
          'After swapping the root with index end, heapify with heapSize = end so the sorted suffix is excluded.',
      },
      {
        title: 'Comparing against the wrong child',
        explanation:
          'Track the current largest among root, left, and right. Selecting the wrong child leaves the Max Heap property broken.',
      },
      {
        title: 'Forgetting to restore the heap after a swap',
        explanation:
          'When you swap root with a larger child, continue heapifying downward from that child index.',
      },
      {
        title: 'Continuing to heapify the sorted region',
        explanation:
          'Heapify must respect heapSize. Touching indices ≥ heapSize can scramble already-extracted values.',
      },
      {
        title: 'Incorrectly building the initial heap',
        explanation:
          'Start from the last non-leaf parent (⌊n/2⌋ − 1) and move toward the root. Skipping parents leaves the structure invalid.',
      },
      {
        title: 'Confusing heap structure with array order',
        explanation:
          'Level-order array layout is not sorted order. Adjacent array indices are not necessarily related as consecutive sorted values.',
      },
      {
        title: 'Forgetting that only the root relationship is global',
        explanation:
          'The heap guarantees the largest remaining unsorted value is at the root — not that every subtree is fully sorted left-to-right.',
      },
    ],
  },

  sortProperties: {
    description:
      'Two traits worth knowing early: this Heap Sort is not stable, and the heap procedure itself can work in place.',
    items: [
      {
        title: 'Not a stable sort',
        description:
          'Equal values may change relative order during swaps. If your application needs equal keys to keep their original order, choose a stable algorithm such as Merge Sort.',
      },
      {
        title: 'In-place heap procedure, copy-preserving wrapper',
        description:
          'The Max Heap Sort procedure rearranges values inside an array without a merge buffer. This lesson still copies the input first so callers keep their original array unchanged — the returned copy uses O(n) extra memory on top of the recursion stack used by heapify.',
        steps: [
          'Copy the input',
          'Build a Max Heap in place on the copy',
          'Extract maxima in place',
          'Return the sorted copy',
        ],
      },
    ],
  },

  algorithmConnection: {
    title: 'Compare Sorting Strategies',
    eyebrow: 'COMPARE',
    description:
      'Heap Sort joins the O(n log n) family, but it is organized around a heap rather than Divide & Conquer merges or pivot partitions. None of these algorithms is universally best.',
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
          'Divide into halves, sort recursively, then merge sorted halves with predictable O(n log n) time and extra memory.',
      },
      {
        title: 'Quick Sort',
        description:
          'Partition around a pivot, place that pivot, then recursively sort the remaining sections. Fast on average; worst case can reach O(n²).',
      },
      {
        title: 'Heap Sort',
        description:
          'Build a Max Heap, then repeatedly extract the root into a sorted suffix. Worst-case O(n log n); typically not stable.',
      },
    ],
  },

  complexity: {
    time: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)',
    },
    space:
      'O(1) for in-place heap sort · O(log n) recursion stack · + O(n) if copying input',
    notes: {
      time: [
        'Building the Max Heap takes O(n) time — tighter than the naive O(n log n) bound for heap construction.',
        'Each extraction does O(log n) work to heapify the root, and there are O(n) extractions.',
        'Overall best, average, and worst-case time are O(n log n). Unlike the last-element Quick Sort in this course, Heap Sort does not degrade to O(n²) on sorted or reverse-sorted inputs.',
      ],
      space: [
        'The algorithmic in-place Heap Sort procedure rearranges values inside the working array and needs only O(1) auxiliary variables aside from the call stack.',
        'Recursive heapify can use O(log n) stack space in the worst case (the height of the heap).',
        'This lesson copies the input before sorting so the original array is unchanged. That returned copy requires O(n) additional memory — do not claim the copy-preserving wrapper uses only O(1) total memory.',
      ],
    },
  },

  pseudocode: `HeapSort(array)
    n = length(array)

    // Build a Max Heap
    for i = floor(n / 2) - 1 down to 0
        Heapify(array, n, i)

    for end = n - 1 down to 1
        swap array[0] and array[end]
        heapSize = end
        Heapify(array, heapSize, 0)

    return array


Heapify(array, heapSize, root)
    largest = root
    left = 2 * root + 1
    right = 2 * root + 2

    if left < heapSize and array[left] > array[largest]
        largest = left

    if right < heapSize and array[right] > array[largest]
        largest = right

    if largest != root
        swap array[root] and array[largest]
        Heapify(array, heapSize, largest)


// Roles:
// n / heapSize — how many elements are still in the active heap
// root         — subtree root being heapified
// left, right  — child indices of root
// largest      — index of the greatest among root and its children
// end          — last unsorted index; becomes part of the sorted region`,

  code: {
    python: `def heap_sort(arr):
    # Copy first so the caller's list is not mutated.
    result = arr.copy()
    n = len(result)

    def heapify(heap_size, root):
        largest = root
        left = 2 * root + 1
        right = 2 * root + 2

        if left < heap_size and result[left] > result[largest]:
            largest = left

        if right < heap_size and result[right] > result[largest]:
            largest = right

        if largest != root:
            result[root], result[largest] = (
                result[largest],
                result[root],
            )
            heapify(heap_size, largest)

    for i in range(n // 2 - 1, -1, -1):
        heapify(n, i)

    for end in range(n - 1, 0, -1):
        result[0], result[end] = result[end], result[0]
        heapify(end, 0)

    return result`,
    javascript: `function heapSort(arr) {
    // Copy first so the caller's array is not mutated.
    const result = [...arr];
    const n = result.length;

    function heapify(heapSize, root) {
        let largest = root;
        const left = 2 * root + 1;
        const right = 2 * root + 2;

        if (left < heapSize && result[left] > result[largest]) {
            largest = left;
        }

        if (right < heapSize && result[right] > result[largest]) {
            largest = right;
        }

        if (largest !== root) {
            [result[root], result[largest]] = [
                result[largest],
                result[root],
            ];
            heapify(heapSize, largest);
        }
    }

    for (let i = Math.floor(n / 2) - 1; i >= 0; i -= 1) {
        heapify(n, i);
    }

    for (let end = n - 1; end > 0; end -= 1) {
        [result[0], result[end]] = [result[end], result[0]];
        heapify(end, 0);
    }

    return result;
}`,
    typescript: `function heapSort(arr: number[]): number[] {
    // Copy first so the caller's array is not mutated.
    const result = [...arr];
    const n = result.length;

    function heapify(heapSize: number, root: number): void {
        let largest = root;
        const left = 2 * root + 1;
        const right = 2 * root + 2;

        if (left < heapSize && result[left] > result[largest]) {
            largest = left;
        }

        if (right < heapSize && result[right] > result[largest]) {
            largest = right;
        }

        if (largest !== root) {
            [result[root], result[largest]] = [
                result[largest],
                result[root],
            ];
            heapify(heapSize, largest);
        }
    }

    for (let i = Math.floor(n / 2) - 1; i >= 0; i -= 1) {
        heapify(n, i);
    }

    for (let end = n - 1; end > 0; end -= 1) {
        [result[0], result[end]] = [result[end], result[0]];
        heapify(end, 0);
    }

    return result;
}`,
  },

  whenToUse: [
    'Worst-case O(n log n) time is important.',
    'In-place sorting is desirable for the problem constraints.',
    'Additional O(n) merge storage is undesirable.',
    'Predictable sorting complexity matters.',
    'Understanding heaps is relevant to the problem (including Priority Queues).',
  ],

  whenNotToUse: [
    'A stable sort is required by the application.',
    'Implementation simplicity is the highest priority.',
    'Another algorithm provides better practical behavior for the specific workload.',
    'The language already provides an optimized sorting implementation that fits the needs.',
  ],

  keyTakeaways: [
    'A Max Heap keeps the largest value at the root.',
    'A heap can be represented efficiently using an array.',
    'Heap Sort first builds a Max Heap.',
    'The maximum value is repeatedly moved to the end.',
    'The remaining heap is restored after each extraction.',
    'Heap Sort runs in O(n log n) time.',
    'The in-place sorting procedure uses O(1) auxiliary storage aside from recursion/copy considerations.',
    'Heaps are also important for Priority Queues.',
  ],

  thinkingGuide: {
    title: 'How to Think About Heap Sort',
    description:
      'Use this checklist to derive the algorithm instead of only memorizing the code.',
    steps: [
      'Picture the array as a complete binary tree using the child formulas.',
      'Build a Max Heap so every parent is ≥ its children.',
      'Trust that the root is the largest remaining unsorted value.',
      'Swap the root with the last unsorted index.',
      'Shrink the heap so the sorted suffix is excluded.',
      'Heapify from the root to restore the Max Heap property.',
      'Repeat until one element remains unsorted.',
    ],
  },

  previousLesson: {
    title: 'Quick Sort',
    href: '/learn/quick-sort',
  },

  nextLesson: {
    title: 'Sorting Algorithm Comparison',
    href: '/algorithms/sorting',
  },

  categoryHref: '/algorithms/sorting',
}
