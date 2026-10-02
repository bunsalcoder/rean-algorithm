import type { Lesson } from './types'

export const jumpSearch: Lesson = {
  slug: 'jump-search',
  title: 'Jump Search',
  description:
    'Learn how Jump Search uses fixed-size jumps to search through a sorted array before performing a linear scan inside the matching block.',
  category: 'Searching',
  difficulty: 'Beginner',
  estimatedTime: '20 min',
  tags: ['Searching', 'Arrays', 'Jump Search', 'Sorted Data', 'O(√n)'],

  objectives: [
    'Understand why Jump Search requires sorted data.',
    'Understand the idea of jumping through blocks.',
    'Understand how the jump size is chosen.',
    'Understand how the correct block is identified.',
    'Understand the linear scan inside the block.',
    'Understand the O(√n) time complexity.',
    'Compare Jump Search with Linear Search and Binary Search.',
    'Implement Jump Search in Python, JavaScript, and TypeScript.',
  ],

  overview: [
    'Jump Search finds a target in a sorted array by jumping ahead in fixed-size blocks instead of checking every element one by one.',
    'The idea is simple: jump forward by a block size, check whether the target could still be later, and once the correct block is found, scan that block linearly.',
    'For example, take the sorted array [1, 3, 5, 7, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42] and target 27. With n = 16, jump size ≈ √16 = 4.',
    'The blocks are [1, 3, 5, 7], [9, 12, 15, 18], [21, 24, 27, 30], and [33, 36, 39, 42]. Jump Search jumps to index 4, then 8, identifies the block from index 8 to 11, then linearly checks 21 → 24 → 27 and finds the target.',
    'Jump Search only works correctly when the array is sorted.',
  ],

  whyItMatters: [
    'It works on sorted arrays and reduces unnecessary element-by-element checks.',
    'It combines block jumping with a short linear scan.',
    'It has O(√n) worst-case time — a useful middle ground between Linear Search and Binary Search.',
    'It shows another way to shrink the search work without dividing the range in half.',
    'Binary Search generally reduces the search space more aggressively, while Jump Search demonstrates a different block-based strategy. Neither is universally better for every situation.',
  ],

  visualization: {
    title: 'Jump Search in action',
    description:
      'Watch JUMP → BLOCK → LINEAR SCAN → FOUND as the algorithm jumps by √n, selects a block, then scans inside it.',
    type: 'jump-search',
  },

  steps: [
    {
      title: 'Start at the beginning',
      description:
        'Set previous to 0 and current to the jump size. The first block covers indices from previous up to current - 1.',
    },
    {
      title: 'Jump to the next block boundary',
      description:
        'Move forward by the jump size. Look at the value at the end of the current block (array[current - 1]).',
    },
    {
      title: 'Compare the boundary value with the target',
      description:
        'If the boundary is still smaller than the target, the target cannot be in this block — jump again.',
    },
    {
      title: 'Continue jumping while later blocks might contain the target',
      description:
        'Keep advancing previous and current until the boundary is no longer smaller than the target, or you reach the end of the array.',
    },
    {
      title: 'Identify the block containing the target',
      description:
        'The active block is the range from previous to current (capped at n). That is where a linear scan begins.',
    },
    {
      title: 'Perform linear search inside that block',
      description:
        'Walk index by index from previous toward current, comparing each value with the target.',
    },
    {
      title: 'Return the index or -1',
      description:
        'If a value equals the target, return its index. If the block ends without a match, return -1.',
    },
  ],

  complexity: {
    time: {
      best: 'O(1)',
      average: 'O(√n)',
      worst: 'O(√n)',
    },
    space: 'O(1)',
    notes: {
      time: [
        'There are approximately √n jumps across the array.',
        'The final block can contain approximately √n elements for a linear scan.',
        'Total work is about √n + √n, which simplifies to O(√n).',
        'If the target is found very early (for example at the first boundary check or early in the first block), the best case approaches O(1).',
      ],
      space: [
        'Jump Search only needs a few variables such as jump, previous, and current.',
        'It does not allocate an extra array proportional to the input size, so space stays O(1).',
      ],
    },
  },

  pseudocode: `JumpSearch(array, target)

    n = length(array)

    if n == 0
        return -1

    jump = floor(sqrt(n))
    previous = 0
    current = jump

    while current < n and array[current - 1] < target
        previous = current
        current = current + jump

    current = min(current, n)

    while previous < current and array[previous] < target
        previous = previous + 1

    if previous < n and array[previous] == target
        return previous

    return -1`,

  code: {
    python: `import math


def jump_search(arr, target):
    n = len(arr)

    if n == 0:
        return -1

    jump = int(math.sqrt(n))
    previous = 0
    current = jump

    while current < n and arr[current - 1] < target:
        previous = current
        current += jump

    current = min(current, n)

    while previous < current and arr[previous] < target:
        previous += 1

    if previous < n and arr[previous] == target:
        return previous

    return -1


# Example
values = [1, 3, 5, 7, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42]
print(jump_search(values, 27))  # 10
print(jump_search(values, 26))  # -1`,
    javascript: `function jumpSearch(arr, target) {
  const n = arr.length;

  if (n === 0) {
    return -1;
  }

  const jump = Math.floor(Math.sqrt(n));
  let previous = 0;
  let current = jump;

  while (current < n && arr[current - 1] < target) {
    previous = current;
    current += jump;
  }

  current = Math.min(current, n);

  while (previous < current && arr[previous] < target) {
    previous += 1;
  }

  if (previous < n && arr[previous] === target) {
    return previous;
  }

  return -1;
}

// Example
const values = [1, 3, 5, 7, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42];
console.log(jumpSearch(values, 27)); // 10
console.log(jumpSearch(values, 26)); // -1`,
    typescript: `function jumpSearch(arr: number[], target: number): number {
  const n = arr.length;

  if (n === 0) {
    return -1;
  }

  const jump = Math.floor(Math.sqrt(n));
  let previous = 0;
  let current = jump;

  while (current < n && arr[current - 1] < target) {
    previous = current;
    current += jump;
  }

  current = Math.min(current, n);

  while (previous < current && arr[previous] < target) {
    previous += 1;
  }

  if (previous < n && arr[previous] === target) {
    return previous;
  }

  return -1;
}

// Example
const values = [1, 3, 5, 7, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42];
console.log(jumpSearch(values, 27)); // 10
console.log(jumpSearch(values, 26)); // -1`,
  },

  whenToUse: [
    'The data is already sorted.',
    'Sequential or block-oriented access makes fixed-size jumps practical.',
    'You want a simpler alternative to more complex search strategies.',
    'O(√n) search behavior is acceptable for the problem size.',
  ],

  whenNotToUse: [
    'The data is unsorted and you cannot sort it first.',
    'O(log n) search is preferable and Binary Search is a good fit.',
    'Frequent sorting would cost more than any search improvement.',
    'The data structure does not support useful indexed access.',
  ],

  keyTakeaways: [
    'Jump Search requires sorted data.',
    'It jumps through the array using approximately √n-sized blocks.',
    "Once the target's block is identified, it performs a linear scan.",
    'Best case is O(1).',
    'Worst-case time is O(√n).',
    'Space complexity is O(1).',
    'It demonstrates another way to reduce unnecessary searching.',
  ],

  sortedRequirement: {
    title: 'Must Be Sorted',
    description:
      'Jump Search requires sorted data. Without order, block boundaries cannot guide the search.',
    paragraphs: [
      'Jump Search requires sorted data.',
      'It relies on the ordering of values to know when it can stop jumping and which block should be searched.',
      'If values are out of order, a block boundary no longer tells you whether the target could appear later.',
    ],
    sorted: [1, 3, 5, 7, 9, 12, 15, 18],
    unsorted: [7, 1, 15, 3, 12, 5, 18, 9],
    explanation:
      'In the unsorted example, jumping by blocks cannot safely skip values — the target might sit anywhere. Sort first, or use Linear Search instead.',
  },

  thinkingGuide: {
    title: 'The Jump Size',
    description:
      'A common jump size is √n. That choice balances how many blocks you check against how large the final linear scan can be.',
    steps: [
      'n is the length of the array.',
      'jump is usually floor(√n) — for n = 16, jump = 4.',
      'If the jump is too small, there are many blocks to check.',
      'If the jump is too large, the final linear scan becomes larger.',
      'Using approximately √n balances these two parts.',
      'previous marks the start of the current block; current marks the end boundary.',
      'After jumping stops, the active block is scanned linearly for the target.',
    ],
  },

  commonMistakes: {
    description:
      'These mistakes show up often when learners first write Jump Search.',
    mistakes: [
      {
        title: 'Forgetting that the array must be sorted',
        explanation:
          'Without ascending order, block boundaries cannot tell you when to stop jumping. Sort first, or use Linear Search.',
      },
      {
        title: 'Choosing an incorrect jump size',
        explanation:
          'A common choice is floor(√n). A jump of 0 or n breaks the balance between jumping and scanning.',
      },
      {
        title: 'Checking the wrong block boundary',
        explanation:
          'Compare array[current - 1] while jumping. Off-by-one mistakes skip the true end of the block.',
      },
      {
        title: 'Skipping the final partial block',
        explanation:
          'When current passes n, cap it with min(current, n) and still scan the remaining indices.',
      },
      {
        title: 'Scanning outside the selected block',
        explanation:
          'The linear phase stays between previous and current. Walking past current rechecks the wrong region.',
      },
      {
        title: 'Confusing Jump Search with Binary Search',
        explanation:
          'Jump Search moves by fixed blocks, then scans. Binary Search repeatedly halves the range. Different strategies, different complexities.',
      },
      {
        title: 'Forgetting to handle an empty array',
        explanation:
          'When n is 0, return -1 immediately. There is no valid jump size or block to scan.',
      },
      {
        title: 'Incorrectly handling targets smaller than the first element',
        explanation:
          'If the first block boundary is already ≥ the target, do not jump further — linear-scan from the start.',
      },
      {
        title: 'Incorrectly handling targets larger than the last element',
        explanation:
          'Keep jumping to the end, scan the final block, and return -1 when nothing matches. Do not pretend a block contains the target.',
      },
    ],
  },

  algorithmConnection: {
    title: 'Jump Search vs Linear Search vs Binary Search',
    eyebrow: 'COMPARE',
    description:
      'These algorithms have different requirements and strategies. Learn the trade-offs instead of treating one as always best.',
    items: [
      {
        title: 'Linear Search',
        description:
          'Sorted data required: No. Worst case: O(n). Approach: check elements sequentially from the start.',
      },
      {
        title: 'Jump Search',
        description:
          'Sorted data required: Yes. Worst case: O(√n). Approach: jump by blocks, then scan the matching block linearly.',
      },
      {
        title: 'Binary Search',
        description:
          'Sorted data required: Yes. Worst case: O(log n). Approach: repeatedly divide the search range in half. Usually fewer comparisons than Jump Search on random-access sorted arrays.',
      },
    ],
  },

  previousLesson: {
    title: 'Binary Search',
    href: '/learn/binary-search',
  },

  nextLesson: {
    title: 'Interpolation Search',
    href: '/learn/interpolation-search',
  },

  categoryHref: '/algorithms/searching',
}
