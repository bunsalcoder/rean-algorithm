import type { Lesson } from './types'

export const quickSort: Lesson = {
  slug: 'quick-sort',
  title: 'Quick Sort',
  description:
    'Learn how Quick Sort partitions an array around a pivot and recursively sorts the resulting sections.',
  category: 'Sorting',
  difficulty: 'Beginner',
  estimatedTime: '25 min',
  tags: ['Sorting', 'Arrays', 'Quick Sort', 'Divide & Conquer', 'O(n log n)'],

  objectives: [
    'Understand the Divide & Conquer approach.',
    'Understand what a pivot is.',
    'Understand how partitioning works.',
    'Follow the recursive sorting process.',
    'Understand best, average, and worst-case complexity.',
    'Implement Quick Sort in Python, JavaScript, and TypeScript.',
  ],

  overview: [
    'Quick Sort sorts by choosing a pivot, rearranging the current section around that pivot, and then recursively sorting the sections that remain. The pattern is: pick a pivot, partition so smaller-or-equal values end up on one side and larger values on the other, then repeat on each side until every section has zero or one element.',
    'Start with [5, 3, 8, 2, 4]. This lesson uses the last element as the pivot, so the first pivot is 4. After a Lomuto-style partition, values ≤ 4 move left of the pivot and values > 4 stay to the right. When that partition finishes, 4 is in its final sorted position — but the left and right sections are not fully sorted yet.',
    'Then recurse. Sort the left section and the right section the same way: choose a pivot, partition, and continue. Keep going until every remaining section contains at most one element.',
    'Pivot selection and partitioning details vary between implementations. Lomuto partition with the last element as pivot is a clear beginner-friendly scheme, not the only correct one. Do not assume every element is already in its final place after each partition — only the pivot reaches its final position when that partition operation completes.',
  ],

  whyItMatters: [
    'It uses Divide & Conquer — a pattern that appears in many algorithms.',
    'It often performs well in practice on typical inputs.',
    'It can sort in place, depending on the implementation and whether you copy the input first.',
    'It introduces partitioning and pivot selection, two ideas that show up beyond this lesson.',
    'Its performance depends on how balanced the partitions are. Balanced splits behave closer to O(n log n); consistently unbalanced splits can degrade toward O(n²).',
    'Compared with Merge Sort: Merge Sort divides the input and merges sorted halves, while Quick Sort partitions around a pivot and sorts the resulting sections. Neither is universally better — choose based on memory needs, stability requirements, pivot strategy, and worst-case guarantees.',
  ],

  visualization: {
    title: 'Quick Sort in action',
    description:
      'Step through pivot selection, Lomuto partitioning, swaps, pivot placement, and recursive subranges.',
    type: 'quick-sort',
  },

  steps: [
    {
      title: 'Start with the entire array',
      description:
        'Begin with the full unsorted array. Quick Sort will partition this range and recurse.',
    },
    {
      title: 'Choose a pivot',
      description:
        'Select a pivot for the current partition. This lesson uses the last element of the range.',
    },
    {
      title: 'Scan and compare with the pivot',
      description:
        'Walk left to right through the range (excluding the pivot). Compare each value with the pivot.',
    },
    {
      title: 'Grow the left region',
      description:
        'When a value is less than or equal to the pivot, move it into the left region by swapping it into the next left slot.',
    },
    {
      title: 'Leave larger values on the right',
      description:
        'When a value is greater than the pivot, leave it toward the right region and continue scanning.',
    },
    {
      title: 'Place the pivot in its final position',
      description:
        'After the scan, swap the pivot into place immediately after the left region. That pivot is now in its final sorted position.',
    },
    {
      title: 'Recursively sort the remaining sections',
      description:
        'Apply the same process to the section left of the pivot and the section right of the pivot.',
    },
    {
      title: 'The array is completely sorted',
      description:
        'When every partition is resolved down to empty or single-element sections, the whole array is sorted.',
    },
  ],

  commonMistakes: {
    description:
      'These mistakes show up often when learners first write Quick Sort.',
    mistakes: [
      {
        title: 'Incorrect pivot index',
        explanation:
          'If you mean to use the last element, the pivot must be array[high]. Using the wrong index partitions around the wrong value.',
      },
      {
        title: 'Incorrect partition boundaries',
        explanation:
          'The scan should run from low to high - 1. Including the pivot in the scan, or starting past low, drops or double-counts values.',
      },
      {
        title: 'Forgetting to move the pivot into its final position',
        explanation:
          'After the scan, swap the pivot with the slot after the left region (i + 1). Skipping this leaves the pivot stranded at the end of the range.',
      },
      {
        title: 'Including the pivot in a recursive subrange',
        explanation:
          'Recurse on low..pivotIndex - 1 and pivotIndex + 1..high. Sorting a range that still includes the pivot can undo the partition.',
      },
      {
        title: 'Incorrectly advancing the partition index',
        explanation:
          'Only advance i when array[j] <= pivot, and only then swap array[i] with array[j]. Advancing i on every step breaks the left-region invariant.',
      },
      {
        title: 'Mishandling duplicates',
        explanation:
          'With <=, duplicates belong in the left region. Using a strict < (or the opposite inequality) changes where equals land and can break expected behavior.',
      },
      {
        title: 'Confusing partitioning with fully sorting the array',
        explanation:
          'A finished partition places only the pivot in its final position. The left and right sections still need recursive sorting.',
      },
      {
        title: 'Ignoring worst-case complexity',
        explanation:
          'Average O(n log n) does not mean O(n log n) always. Already sorted inputs with a last-element pivot can create highly unbalanced partitions and O(n²) time.',
      },
    ],
  },

  sortProperties: {
    description:
      'Two traits worth knowing early: this Quick Sort is not stable, and the partition procedure itself can work in place.',
    items: [
      {
        title: 'Not a stable sort',
        description:
          'Equal values may change relative order during swaps. If your application needs equal keys to keep their original order, choose a stable algorithm such as Merge Sort.',
      },
      {
        title: 'In-place partitioning, copy-preserving wrapper',
        description:
          'The Lomuto partition rearranges values inside an array without a merge buffer. This lesson still copies the input first so callers keep their original array unchanged — the returned copy uses O(n) extra memory on top of the recursion stack.',
        steps: [
          'Copy the input',
          'Partition in place on the copy',
          'Return the sorted copy',
        ],
      },
    ],
  },

  algorithmConnection: {
    title: 'Compare Sorting Strategies',
    eyebrow: 'COMPARE',
    description:
      'Earlier sorts rearrange an array with nested loops. Merge Sort and Quick Sort both use Divide & Conquer, but they divide work differently. None is universally better.',
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
    ],
  },

  complexity: {
    time: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n²)',
    },
    space: 'O(log n) average · O(n) worst (stack); + O(n) if copying input',
    notes: {
      time: [
        'Best and average cases happen when partitions stay reasonably balanced, giving about log n levels of work and about n work per level → O(n log n).',
        'Worst case happens when partitions are consistently unbalanced — for example, already sorted or reverse-sorted arrays when the pivot is always the last element. Then you may get about n levels of work and O(n²) total time.',
        'Choosing the last element as pivot is simple for learning, but certain patterned inputs can cause poor partition balance. Other pivot strategies exist; they are outside this beginner lesson.',
      ],
      space: [
        'The in-place Lomuto partition rearranges values inside the working array and does not need an O(n) merge buffer.',
        'Recursion still uses the call stack: typically about O(log n) auxiliary space on average, and up to O(n) in the worst case when partitions are unbalanced.',
        'This lesson copies the input before sorting so the original array is unchanged. That returned copy requires O(n) additional memory on top of the recursion stack.',
      ],
    },
  },

  pseudocode: `QuickSort(array, low, high)
    if low < high
        pivotIndex = Partition(array, low, high)
        QuickSort(array, low, pivotIndex - 1)
        QuickSort(array, pivotIndex + 1, high)


Partition(array, low, high)
    pivot = array[high]
    i = low - 1

    for j = low to high - 1
        if array[j] <= pivot
            i = i + 1
            swap array[i] and array[j]

    swap array[i + 1] and array[high]
    return i + 1


// Roles:
// low, high  — inclusive bounds of the current partition
// pivot      — value at array[high] for this Lomuto scheme
// i          — end of the growing left region (values <= pivot)
// j          — current index being examined
// pivotIndex — final index of the pivot after Partition returns`,

  code: {
    python: `def quick_sort(arr):
    # Copy first so the caller's list is not mutated.
    result = arr.copy()

    def partition(low, high):
        pivot = result[high]
        i = low - 1

        for j in range(low, high):
            if result[j] <= pivot:
                i += 1
                result[i], result[j] = result[j], result[i]

        result[i + 1], result[high] = result[high], result[i + 1]
        return i + 1

    def sort(low, high):
        if low < high:
            pivot_index = partition(low, high)
            sort(low, pivot_index - 1)
            sort(pivot_index + 1, high)

    if len(result) > 1:
        sort(0, len(result) - 1)

    return result`,
    javascript: `function quickSort(arr) {
    // Copy first so the caller's array is not mutated.
    const result = [...arr];

    function partition(low, high) {
        const pivot = result[high];
        let i = low - 1;

        for (let j = low; j < high; j += 1) {
            if (result[j] <= pivot) {
                i += 1;
                [result[i], result[j]] = [result[j], result[i]];
            }
        }

        [result[i + 1], result[high]] = [result[high], result[i + 1]];
        return i + 1;
    }

    function sort(low, high) {
        if (low < high) {
            const pivotIndex = partition(low, high);
            sort(low, pivotIndex - 1);
            sort(pivotIndex + 1, high);
        }
    }

    if (result.length > 1) {
        sort(0, result.length - 1);
    }

    return result;
}`,
    typescript: `function quickSort(arr: number[]): number[] {
    // Copy first so the caller's array is not mutated.
    const result = [...arr];

    function partition(low: number, high: number): number {
        const pivot = result[high];
        let i = low - 1;

        for (let j = low; j < high; j += 1) {
            if (result[j] <= pivot) {
                i += 1;
                [result[i], result[j]] = [result[j], result[i]];
            }
        }

        [result[i + 1], result[high]] = [result[high], result[i + 1]];
        return i + 1;
    }

    function sort(low: number, high: number): void {
        if (low < high) {
            const pivotIndex = partition(low, high);
            sort(low, pivotIndex - 1);
            sort(pivotIndex + 1, high);
        }
    }

    if (result.length > 1) {
        sort(0, result.length - 1);
    }

    return result;
}`,
  },

  whenToUse: [
    'Fast average-case performance is desirable.',
    'In-place partitioning is useful for the problem constraints.',
    'The implementation and pivot strategy suit the application.',
    'The input size and value distribution are appropriate for the chosen pivot scheme.',
  ],

  whenNotToUse: [
    'Predictable worst-case O(n log n) time is required.',
    'Recursion depth is a concern on very large or pathological inputs.',
    'A stable sort is required by the application.',
    'The chosen pivot strategy repeatedly creates unbalanced partitions.',
    'A production language already provides a suitable optimized built-in sort.',
  ],

  keyTakeaways: [
    'Quick Sort uses Divide & Conquer.',
    'A pivot divides the current partition into regions.',
    'Partitioning places the pivot in its final position.',
    'The remaining partitions are sorted recursively.',
    'Average time complexity is O(n log n).',
    'Worst-case time complexity is O(n²).',
    'Pivot selection affects performance.',
  ],

  thinkingGuide: {
    title: 'How to Think About Quick Sort',
    description:
      'Use this checklist to derive the algorithm instead of only memorizing the code.',
    steps: [
      'Pick a pivot for the current range (here: the last element).',
      'Scan the other values and grow a left region of values ≤ pivot.',
      'Leave larger values toward the right.',
      'Swap the pivot into place after the left region.',
      'Trust that only the pivot is finalized by this partition.',
      'Recursively sort the left section and the right section.',
      'Stop when a section has fewer than two elements.',
    ],
  },

  previousLesson: {
    title: 'Merge Sort',
    href: '/learn/merge-sort',
  },

  nextLesson: {
    title: 'Heap Sort',
    href: '/learn/heap-sort',
  },

  categoryHref: '/algorithms/sorting',
}
