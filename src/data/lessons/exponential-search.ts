import type { Lesson } from './types'

export const exponentialSearch: Lesson = {
  slug: 'exponential-search',
  title: 'Exponential Search',
  description:
    'Learn how Exponential Search finds a useful range by doubling a boundary, then finishes with Binary Search inside that range.',
  category: 'Searching',
  difficulty: 'Intermediate',
  estimatedTime: '25 min',
  tags: [
    'Searching',
    'Arrays',
    'Exponential Search',
    'Binary Search',
    'Sorted Data',
    'O(log n)',
  ],

  objectives: [
    'Understand what Exponential Search is.',
    'Understand why the search boundary grows exponentially.',
    'Understand the sequence 1, 2, 4, 8, 16…',
    'Understand how the algorithm finds a candidate range.',
    'Understand how Binary Search is used afterward.',
    'Understand why sorted data is required.',
    'Understand the complexity.',
    'Understand when Exponential Search can be useful.',
    'Trace the algorithm visually.',
    'Implement Exponential Search in Python, JavaScript, and TypeScript.',
  ],

  overview: [
    'Exponential Search does not immediately search the entire array.',
    'Instead, it starts near the beginning and expands the search range exponentially: 1, 2, 4, 8, 16, 32, 64…',
    'The algorithm keeps doubling the boundary until it reaches the end of the array, or the value at the boundary is large enough to contain the target.',
    'Then it performs Binary Search within that discovered range.',
    'Analogy: if you are looking for something and do not know how far away it is, you might first check nearby, then farther away, then much farther away — then look carefully inside the area you found.',
    'Exponential Search requires sorted data. It is not always better than Binary Search when the full array boundaries are already known.',
  ],

  whyItMatters: [
    'It shows a practical pattern: discover a range first, then search inside it.',
    'It connects Exponential Search to Binary Search instead of treating them as unrelated ideas.',
    'It is especially useful when the target may be near the beginning of a very large sorted array, or when the searchable size is not known up front.',
    'Its worst-case time is still O(log n) — the same asymptotic class as Binary Search — so the main benefit is how the range is found, not a better Big-O worst case.',
    'It makes boundary doubling and range clamping (high = min(bound, n − 1)) concrete and memorable.',
  ],

  visualization: {
    title: 'Exponential Search in action',
    description:
      'Watch Phase 1 grow the boundary as 1, 2, 4, 8… then switch to Phase 2 Binary Search with low, high, and mid inside the discovered range.',
    type: 'exponential-search',
  },

  steps: [
    {
      title: 'Handle empty arrays and index 0',
      description:
        'If the array is empty, return -1. If arr[0] equals the target, return 0 immediately.',
    },
    {
      title: 'Start with bound = 1',
      description:
        'Begin near the start of the array. The first boundary to check is index 1.',
    },
    {
      title: 'Expand while the boundary is still too small',
      description:
        'While bound < n and arr[bound] < target, double the boundary: bound = bound × 2. The checked indices follow 1, 2, 4, 8, 16… — not every index in order.',
    },
    {
      title: 'Stop when the range is large enough',
      description:
        'Stop expanding when bound reaches or passes the array end, or when arr[bound] >= target. That means the target cannot sit before the previous half-bound.',
    },
    {
      title: 'Form the Binary Search range',
      description:
        'Set low = floor(bound / 2) and high = min(bound, n − 1). This is the candidate window for Phase 2.',
    },
    {
      title: 'Run Binary Search inside the range',
      description:
        'Repeatedly compute mid, compare arr[mid] with the target, and move low or high until the value is found or the range is empty.',
    },
    {
      title: 'Return the index or -1',
      description:
        'If Binary Search finds the target, return its index. Otherwise return -1.',
    },
  ],

  complexity: {
    time: {
      best: 'O(1)',
      average: 'O(log n)',
      worst: 'O(log n)',
    },
    space: 'O(1)',
    notes: {
      time: [
        'Best case is O(1) when the target is at index 0 (or found immediately without meaningful work).',
        'The exponential phase takes O(log n) boundary checks because the bound doubles each time.',
        'The Binary Search phase also takes O(log n) comparisons inside the discovered range.',
        'Overall time remains O(log n). Exponential Search does not have a better worst-case complexity than Binary Search.',
        'Its main benefit is how it discovers a useful search range — especially when the target may be near the beginning, or the full size is not known in advance.',
      ],
      space: [
        'Exponential Search only needs a few variables such as bound, low, high, and mid.',
        'It does not allocate an extra array proportional to the input size, so space stays O(1).',
      ],
    },
  },

  pseudocode: `ExponentialSearch(array, target)
    n = length(array)

    if n == 0
        return -1

    if array[0] equals target
        return 0

    bound = 1

    while bound < n and array[bound] < target
        bound = bound * 2

    low = floor(bound / 2)
    high = min(bound, n - 1)

    while low <= high
        mid = floor((low + high) / 2)

        if array[mid] equals target
            return mid

        if array[mid] < target
            low = mid + 1
        else
            high = mid - 1

    return -1`,

  code: {
    python: `def exponential_search(arr, target):
    n = len(arr)

    if n == 0:
        return -1

    if arr[0] == target:
        return 0

    bound = 1

    while bound < n and arr[bound] < target:
        bound *= 2

    low = bound // 2
    high = min(bound, n - 1)

    while low <= high:
        mid = (low + high) // 2

        if arr[mid] == target:
            return mid

        if arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1

    return -1


# Example
values = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32]
print(exponential_search(values, 26))  # 12
print(exponential_search(values, 15))  # -1`,
    javascript: `function exponentialSearch(arr, target) {
  const n = arr.length;

  if (n === 0) {
    return -1;
  }

  if (arr[0] === target) {
    return 0;
  }

  let bound = 1;

  while (bound < n && arr[bound] < target) {
    bound *= 2;
  }

  let low = Math.floor(bound / 2);
  let high = Math.min(bound, n - 1);

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    if (arr[mid] === target) {
      return mid;
    }

    if (arr[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return -1;
}

// Example
const values = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32];
console.log(exponentialSearch(values, 26)); // 12
console.log(exponentialSearch(values, 15)); // -1`,
    typescript: `function exponentialSearch(
  arr: number[],
  target: number,
): number {
  const n = arr.length;

  if (n === 0) {
    return -1;
  }

  if (arr[0] === target) {
    return 0;
  }

  let bound = 1;

  while (bound < n && arr[bound] < target) {
    bound *= 2;
  }

  let low = Math.floor(bound / 2);
  let high = Math.min(bound, n - 1);

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    if (arr[mid] === target) {
      return mid;
    }

    if (arr[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return -1;
}

// Example
const values = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32];
console.log(exponentialSearch(values, 26)); // 12
console.log(exponentialSearch(values, 15)); // -1`,
  },

  whenToUse: [
    'The data is already sorted.',
    'The dataset is very large and the target may be near the beginning.',
    'The searchable range is not known in advance (conceptually unbounded or streaming-style access).',
    'You want to quickly establish a candidate range before running Binary Search.',
  ],

  whenNotToUse: [
    'The data is unsorted.',
    'The data is frequently changing and order is not maintained.',
    'You already know the exact search boundaries and simple Binary Search is sufficient.',
    'The data is not ordered in a way that supports doubling a boundary and narrowing by comparison.',
  ],

  keyTakeaways: [
    'Exponential Search first finds a useful range.',
    'The boundary grows exponentially: 1, 2, 4, 8, 16…',
    'After finding the range, Binary Search is used.',
    'Sorted data is required.',
    'Best case is O(1).',
    'Worst-case time is O(log n).',
    'Its main idea is range discovery, not beating Binary Search’s asymptotic complexity.',
  ],

  sortedRequirement: {
    title: 'Sorted Data Required',
    description:
      'Exponential Search needs ascending order so boundary values tell you when you have passed the target.',
    paragraphs: [
      'Exponential Search requires sorted data.',
      'The algorithm relies on increasing values to determine when it has passed the target and where the Binary Search range should be.',
      'Without ascending order, doubling a boundary does not safely eliminate earlier indices.',
      'Binary Search already works well when the entire array boundaries are known. Exponential Search adds a range-discovery phase before that Binary Search.',
    ],
    sorted: [2, 4, 6, 8, 10, 12, 14, 16],
    unsorted: [10, 2, 16, 4, 14, 6, 12, 8],
    explanation:
      'In the unsorted example, comparing arr[bound] with the target no longer tells you whether earlier indices can be discarded. Sort first, or use Linear Search.',
  },

  thinkingGuide: {
    title: 'How the Boundary Grows',
    description:
      'Phase 1 discovers a window; Phase 2 searches inside it. Keep the two phases separate in your mind.',
    steps: [
      'Start with bound = 1 after checking index 0.',
      'While bound < n and arr[bound] < target, set bound = bound × 2.',
      'Remember the progression: 1 → 2 → 4 → 8 → 16 → 32…',
      'When expansion stops, set low = floor(bound / 2) and high = min(bound, n − 1).',
      'Always clamp high to n − 1 so Binary Search stays inside the array.',
      'Run Binary Search with low, high, and mid until found or the range is empty.',
      'Worked example: arr = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32], target = 26. Boundaries check 1, 2, 4, 8, then stop at 16 (end). Binary Search runs on indices 8…15 and finds 26 at index 12.',
      'Do not claim Exponential Search is asymptotically faster than Binary Search in the worst case — both are O(log n).',
    ],
  },

  commonMistakes: {
    description:
      'These mistakes show up often when learners first write Exponential Search.',
    mistakes: [
      {
        title: 'Using unsorted data',
        explanation:
          'Without ascending order, boundary comparisons do not safely eliminate earlier indices. Sort first, or choose a different search method.',
      },
      {
        title: 'Forgetting to check index 0',
        explanation:
          'The classic formulation returns early when arr[0] is the target. Skipping that case makes the first-element path awkward.',
      },
      {
        title: 'Allowing the exponential boundary to exceed the array unsafely',
        explanation:
          'Always guard bound < n before reading arr[bound]. After expansion, clamp high with min(bound, n − 1).',
      },
      {
        title: 'Creating an invalid Binary Search range',
        explanation:
          'low should be floor(bound / 2) and high should be min(bound, n − 1). Mixing those up can skip the target or read past the array.',
      },
      {
        title: 'Forgetting to clamp high to n − 1',
        explanation:
          'When bound lands past the last index, high must still be a valid index. Use min(bound, n − 1).',
      },
      {
        title: 'Confusing the exponential phase with the Binary Search phase',
        explanation:
          'Phase 1 only grows the bound. Phase 2 is ordinary Binary Search inside the discovered window. Keep the goals separate.',
      },
      {
        title: 'Thinking Exponential Search is O(log log n)',
        explanation:
          'That complexity belongs to typical Interpolation Search under distribution assumptions. Exponential Search is O(log n) in the worst case.',
      },
      {
        title: 'Assuming it is always faster than Binary Search',
        explanation:
          'When the full array bounds are already known, Binary Search is already an excellent choice. Exponential Search shines at range discovery, not at beating O(log n).',
      },
    ],
  },

  algorithmConnection: {
    title:
      'Linear vs Binary vs Jump vs Interpolation vs Exponential Search',
    eyebrow: 'COMPARE',
    description:
      'These algorithms have different requirements and strategies. Learn the trade-offs instead of treating one as always best.',
    items: [
      {
        title: 'Linear Search',
        description:
          'Sorted required: No. Numeric required: No. Strategy: check elements sequentially. Best / worst: O(1) / O(n). Key idea: simple sequential scan.',
      },
      {
        title: 'Binary Search',
        description:
          'Sorted required: Yes. Numeric required: No (ordered keys). Strategy: repeatedly probe the middle. Best / worst: O(1) / O(log n). Key idea: known bounds, halve the range.',
      },
      {
        title: 'Jump Search',
        description:
          'Sorted required: Yes. Numeric required: No (ordered keys). Strategy: jump by blocks, then linear-scan. Best / worst: O(1) / O(√n). Key idea: block jumps before a local scan.',
      },
      {
        title: 'Interpolation Search',
        description:
          'Sorted required: Yes. Numeric required: Yes. Strategy: estimate position from values. Typical under good distribution: O(log log n); worst: O(n). Key idea: value-based probe.',
      },
      {
        title: 'Exponential Search',
        description:
          'Sorted required: Yes. Numeric required: No (ordered keys). Strategy: expand bound exponentially, then Binary Search. Best / worst: O(1) / O(log n). Key idea: discover a range, then search inside it.',
      },
      {
        title: 'Binary Search vs Exponential Search',
        description:
          'Binary Search assumes known low/high and probes the middle immediately. Exponential Search first discovers a useful window by doubling, then uses Binary Search. Both are O(log n) worst case. Exponential Search can help when the target is near the start or the full range is not known in advance.',
      },
    ],
  },

  previousLesson: {
    title: 'Interpolation Search',
    href: '/learn/interpolation-search',
  },

  nextLesson: {
    title: 'Searching Comparison',
    href: '/algorithms/searching',
  },

  categoryHref: '/algorithms/searching',
}
