import type { Lesson } from './types'

export const interpolationSearch: Lesson = {
  slug: 'interpolation-search',
  title: 'Interpolation Search',
  description:
    'Learn how Interpolation Search estimates a likely position for a target instead of always checking the middle of a sorted numeric array.',
  category: 'Searching',
  difficulty: 'Intermediate',
  estimatedTime: '25 min',
  tags: [
    'Searching',
    'Arrays',
    'Interpolation Search',
    'Sorted Data',
    'O(log log n)',
  ],

  objectives: [
    'Understand how Interpolation Search works.',
    'Understand why it estimates a position.',
    'Understand the difference between Interpolation Search and Binary Search.',
    'Understand why sorted data is required.',
    'Understand why roughly uniformly distributed numeric data matters.',
    'Understand the interpolation position formula.',
    'Trace the algorithm visually.',
    'Implement Interpolation Search in Python, JavaScript, and TypeScript.',
    'Understand its time and space complexity.',
    'Recognize when it is useful and when it is not.',
  ],

  overview: [
    'Binary Search always chooses the middle position.',
    'Interpolation Search tries to make a better guess about where the target is located.',
    'For example, take the sorted array [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] and target 70. The target is much closer to the upper part of the value range than the middle.',
    'Interpolation Search estimates a position based on the numeric values at the current low and high bounds — similar to how you would open near page 900 in a 1000-page book instead of starting at page 500.',
    'It works best when the array is sorted, values are numeric, and values are roughly uniformly distributed. It is not always faster than Binary Search.',
  ],

  whyItMatters: [
    'It shows how value distribution can guide a smarter probe than always checking the middle.',
    'It connects searching to a simple proportional estimate — a useful mental model for ordered numeric keys.',
    'On roughly evenly spaced data, typical performance can improve beyond Binary Search’s O(log n) behavior.',
    'Its worst case is still O(n), so understanding the data matters as much as knowing the algorithm.',
    'It makes the division-by-zero guard (arr[low] === arr[high]) concrete and memorable.',
  ],

  visualization: {
    title: 'Interpolation Search in action',
    description:
      'Watch low, high, and the estimated position as the algorithm probes a calculated index — not always the middle — then narrows the range.',
    type: 'interpolation-search',
  },

  steps: [
    {
      title: 'Set low and high',
      description:
        'Set low to the first index and high to the last index. Everything between them is the current search range.',
    },
    {
      title: 'Check that the target is still in range',
      description:
        'If the target is smaller than arr[low] or larger than arr[high], it cannot be in the remaining range — return -1.',
    },
    {
      title: 'Guard against equal boundary values',
      description:
        'If arr[low] equals arr[high], stop estimating. Return low if that value matches the target; otherwise return -1. This avoids dividing by zero.',
    },
    {
      title: 'Estimate the probe position',
      description:
        'Use the interpolation formula to compute pos from low, high, target, arr[low], and arr[high]. The estimate shifts toward the side of the value range where the target sits.',
    },
    {
      title: 'Compare arr[pos] with the target',
      description:
        'Look at the value at the estimated index. Ask whether it equals the target, is smaller, or is larger.',
    },
    {
      title: 'If they match, return the index',
      description:
        'When arr[pos] equals the target, return pos. The search is finished.',
    },
    {
      title: 'If the probe is too small, raise low',
      description:
        'When arr[pos] < target, discard indices at or below pos by setting low = pos + 1.',
    },
    {
      title: 'If the probe is too large, lower high',
      description:
        'When arr[pos] > target, discard indices at or above pos by setting high = pos - 1.',
    },
    {
      title: 'Repeat until found or the range is empty',
      description:
        'Keep estimating and comparing while low <= high and the target remains within arr[low]…arr[high]. If the range collapses without a match, return -1.',
    },
  ],

  complexity: {
    time: {
      best: 'O(1)',
      average: 'O(log log n)*',
      worst: 'O(n)',
    },
    space: 'O(1)',
    notes: {
      time: [
        'Best case is O(1) when the first estimated position is the target — common on evenly spaced keys.',
        'Under suitable distribution assumptions (especially roughly uniformly distributed numeric values), typical/average performance can approach O(log log n). This is not a universal guarantee.',
        'Worst case is O(n). Heavily clustered or uneven distributions can make estimates unreliable and degrade toward linear work.',
        'Binary Search has O(log n) worst-case time regardless of value distribution. Interpolation Search can perform very well when its assumptions hold, but it does not replace Binary Search in every situation.',
      ],
      space: [
        'Interpolation Search only needs a few variables such as low, high, and pos.',
        'It does not allocate an extra array proportional to the input size, so space stays O(1).',
      ],
    },
  },

  pseudocode: `InterpolationSearch(array, target)
    low = 0
    high = length(array) - 1

    while low <= high
        if target < array[low] or target > array[high]
            return -1

        if array[low] equals array[high]
            if array[low] equals target
                return low
            return -1

        pos = estimated position using interpolation formula

        if array[pos] equals target
            return pos

        if array[pos] < target
            low = pos + 1
        else
            high = pos - 1

    return -1`,

  code: {
    python: `def interpolation_search(arr, target):
    low = 0
    high = len(arr) - 1

    while low <= high and arr[low] <= target <= arr[high]:
        if arr[low] == arr[high]:
            return low if arr[low] == target else -1

        pos = low + (
            (target - arr[low]) * (high - low)
        ) // (arr[high] - arr[low])

        if arr[pos] == target:
            return pos

        if arr[pos] < target:
            low = pos + 1
        else:
            high = pos - 1

    return -1


# Example
values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
print(interpolation_search(values, 70))  # 6
print(interpolation_search(values, 35))  # -1`,
    javascript: `function interpolationSearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;

  while (
    low <= high &&
    target >= arr[low] &&
    target <= arr[high]
  ) {
    if (arr[low] === arr[high]) {
      return arr[low] === target ? low : -1;
    }

    const pos = Math.floor(
      low +
        ((target - arr[low]) * (high - low)) /
          (arr[high] - arr[low]),
    );

    if (arr[pos] === target) {
      return pos;
    }

    if (arr[pos] < target) {
      low = pos + 1;
    } else {
      high = pos - 1;
    }
  }

  return -1;
}

// Example
const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
console.log(interpolationSearch(values, 70)); // 6
console.log(interpolationSearch(values, 35)); // -1`,
    typescript: `function interpolationSearch(
  arr: number[],
  target: number,
): number {
  let low = 0;
  let high = arr.length - 1;

  while (
    low <= high &&
    target >= arr[low] &&
    target <= arr[high]
  ) {
    if (arr[low] === arr[high]) {
      return arr[low] === target ? low : -1;
    }

    const pos = Math.floor(
      low +
        ((target - arr[low]) * (high - low)) /
          (arr[high] - arr[low]),
    );

    if (arr[pos] === target) {
      return pos;
    }

    if (arr[pos] < target) {
      low = pos + 1;
    } else {
      high = pos - 1;
    }
  }

  return -1;
}

// Example
const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
console.log(interpolationSearch(values, 70)); // 6
console.log(interpolationSearch(values, 35)); // -1`,
  },

  whenToUse: [
    'The data is already sorted.',
    'Values are numeric and roughly uniformly distributed.',
    'The dataset is large enough for the search strategy to matter.',
    'You can estimate position meaningfully from the values at the range boundaries.',
  ],

  whenNotToUse: [
    'The data is unsorted.',
    'The data is not numeric.',
    'Values are heavily clustered or unevenly distributed.',
    'The distribution makes position estimates unreliable.',
    'A simpler search strategy is more appropriate for the situation.',
  ],

  keyTakeaways: [
    'Interpolation Search works on sorted numeric data.',
    'It estimates where the target is likely to be.',
    'Its estimate uses the values at the current range boundaries.',
    'It performs especially well on roughly uniformly distributed data.',
    'Its worst-case complexity is O(n).',
    'O(log log n) is a typical-case idea under suitable distribution assumptions — not a universal guarantee.',
    'The interpolation formula must guard against division by zero.',
    'Understanding the data distribution is important when choosing this approach.',
  ],

  sortedRequirement: {
    title: 'Sorted Numeric Data',
    description:
      'Interpolation Search needs order and numeric values. It also performs best when spacing is roughly even.',
    paragraphs: [
      'Interpolation Search requires sorted numeric data.',
      'It performs best when values are distributed roughly evenly.',
      'Without ascending order, boundary values cannot guide a safe estimate of where the target sits.',
      'Binary Search always probes the middle. Interpolation Search estimates a likely position using the target value and the current bounds.',
    ],
    sorted: [10, 20, 30, 40, 50, 60, 70, 80],
    unsorted: [40, 10, 70, 20, 60, 30, 80, 50],
    explanation:
      'In the unsorted example, arr[low] and arr[high] no longer describe a meaningful value range for estimating pos. Sort first, or use an approach that does not depend on order.',
  },

  thinkingGuide: {
    title: 'The Interpolation Formula',
    description:
      'Estimate pos from how far the target sits between arr[low] and arr[high], then map that fraction onto the index range low…high.',
    steps: [
      'Formula: pos = low + ((target − arr[low]) × (high − low)) / (arr[high] − arr[low]). Use integer flooring in code.',
      'low — start of the current search range (index).',
      'high — end of the current search range (index).',
      'target — the value we are looking for.',
      'arr[low] — numeric value at the beginning of the range.',
      'arr[high] — numeric value at the end of the range.',
      'pos — estimated index to probe next.',
      'Worked example: arr = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100], target = 70, low = 0, high = 9 → pos = 0 + ((70 − 10) × 9) / (100 − 10) = 540 / 90 = 6. Index 6 holds 70.',
      'Always guard arr[low] === arr[high] before dividing, so the denominator never becomes zero.',
    ],
  },

  commonMistakes: {
    description:
      'These mistakes show up often when learners first write Interpolation Search.',
    mistakes: [
      {
        title: 'Using unsorted data',
        explanation:
          'Without ascending order, boundary values do not describe a usable range. Sort first, or choose a different search method.',
      },
      {
        title: 'Assuming O(log log n) always applies',
        explanation:
          'That typical-case behavior depends on suitable value distribution. Worst case remains O(n). Binary Search keeps O(log n) regardless of spacing.',
      },
      {
        title: 'Dividing by zero when arr[low] === arr[high]',
        explanation:
          'Equal boundary values make the denominator zero. Return early after checking whether that shared value matches the target.',
      },
      {
        title: 'Forgetting bounds checks',
        explanation:
          'If the target is outside arr[low]…arr[high], stop and return -1. Continuing can produce invalid estimates.',
      },
      {
        title: 'Using the wrong position formula',
        explanation:
          'Mix up indices and values carefully: multiply the value offset by (high − low), then divide by (arr[high] − arr[low]), and add low.',
      },
      {
        title: 'Mishandling integer position calculation',
        explanation:
          'Use integer division / Math.floor so pos is a valid index. Floating results must not be used as array indices.',
      },
      {
        title: 'Forgetting that the algorithm is designed for numeric data',
        explanation:
          'The formula assumes you can subtract and scale values. Non-numeric keys need a different approach.',
      },
      {
        title: 'Mutating the original array unnecessarily',
        explanation:
          'Interpolation Search only needs indices. Copying or reordering the input is not required for the search itself.',
      },
    ],
  },

  algorithmConnection: {
    title:
      'Linear Search vs Binary Search vs Jump Search vs Interpolation Search',
    eyebrow: 'COMPARE',
    description:
      'These algorithms have different requirements and strategies. Learn the trade-offs instead of treating one as always best.',
    items: [
      {
        title: 'Linear Search',
        description:
          'Sorted data required: No. Numeric data required: No. Strategy: check elements sequentially. Typical / worst: O(n) / O(n).',
      },
      {
        title: 'Binary Search',
        description:
          'Sorted data required: Yes. Numeric data required: No (ordered comparable keys). Strategy: repeatedly check the middle. Typical / worst: O(log n) / O(log n).',
      },
      {
        title: 'Jump Search',
        description:
          'Sorted data required: Yes. Numeric data required: No (ordered comparable keys). Strategy: jump through blocks, then linear-scan. Typical / worst: O(√n) / O(√n).',
      },
      {
        title: 'Interpolation Search',
        description:
          'Sorted data required: Yes. Numeric data required: Yes. Strategy: estimate a likely position from the values. Typical under good distribution: O(log log n); worst: O(n).',
      },
    ],
  },

  previousLesson: {
    title: 'Jump Search',
    href: '/learn/jump-search',
  },

  nextLesson: {
    title: 'Exponential Search',
    href: '/learn/exponential-search',
  },

  categoryHref: '/algorithms/searching',
}
