import type { Lesson } from './types'

export const longestSubstringWithoutRepeating: Lesson = {
  slug: 'longest-substring-without-repeating-characters',
  title: 'Longest Substring Without Repeating Characters',
  description:
    'Learn how a variable-size sliding window can find the longest substring without repeated characters.',
  category: 'Array & String',
  difficulty: 'Intermediate',
  estimatedTime: '25–30 min',
  tags: [
    'Array & String',
    'Longest Unique Substring',
    'Sliding Window',
    'Variable Window',
    'Set',
    'Strings',
    'Intermediate',
  ],

  objectives: [
    'Understand the longest substring without repeating characters problem.',
    'Understand the difference between fixed-size and variable-size sliding windows.',
    'Use a Set or Map to track characters inside a window.',
    'Expand the window when characters are unique.',
    'Shrink the window when a duplicate appears.',
    'Track the longest valid window.',
    'Understand why the algorithm runs in O(n).',
  ],

  overview: [
    'Given a string, find the longest substring that contains no repeated characters.',
    'Example: "abcabcbb". Possible substrings include "a", "ab", "abc", "bca", and "cab". The longest valid substring is "abc" with length 3.',
    'A substring must be contiguous — you cannot skip characters. For example, "ac" is not a substring of "abc" because b sits between a and c.',
    'This lesson builds on fixed-size Sliding Window (Step 27). Here the window grows and shrinks based on validity: all characters inside must stay unique.',
  ],

  whyItMatters: [
    'Many string problems ask for the longest or shortest contiguous segment that satisfies a condition. A variable-size window is the natural tool.',
    'Checking every substring for uniqueness is expensive. A Set-backed sliding window answers the same question in linear time.',
    'The right pointer expands the window. The left pointer shrinks it when a duplicate appears. Together they maintain the invariant: every character in the window is unique.',
    'Recognizing when a problem needs a fixed window versus a variable window is an important algorithm skill — the same family of ideas, different constraints.',
  ],

  visualization: {
    title: 'Variable sliding window in action',
    description:
      'Watch the right pointer expand, the Set track active characters, and the left pointer shrink when a duplicate appears. Track the best unique window so far.',
    type: 'longest-substring-without-repeating',
  },

  steps: [
    {
      title: 'Start with an empty window',
      description:
        'Left starts at 0. The right pointer has not claimed a character yet. The Set of characters inside the window is empty.',
    },
    {
      title: 'Expand the right pointer',
      description:
        'Move right forward to include the next character. For "abcabcbb", the first expansions build "a", then "ab", then "abc".',
    },
    {
      title: 'Add unique characters to the Set',
      description:
        'If the new character is not already in the Set, add it. The window remains valid and may become the new best.',
    },
    {
      title: 'Detect a duplicate',
      description:
        'When the next character already exists in the Set — for example adding another "a" to "abc" — the window is temporarily invalid.',
    },
    {
      title: 'Shrink from the left until unique again',
      description:
        'Remove characters from the Set while moving left forward, until the duplicate is gone. "abca" shrinks to "bca".',
    },
    {
      title: 'Update the best window',
      description:
        'Whenever the current valid window is longer than the best so far, remember its length and indices. For the default example the answer stays length 3 ("abc").',
    },
  ],

  complexity: {
    time: {
      best: 'O(n)',
      average: 'O(n)',
      worst: 'O(n)',
    },
    space: 'O(k)',
    notes: {
      time: [
        'The right pointer moves forward at most n times.',
        'The left pointer also moves forward at most n times.',
        'Even with a nested while loop, each character is added and removed from the Set at most once — total pointer movements are O(n), not O(n²).',
      ],
      space: [
        'The Set stores characters currently inside the window.',
        'k is the number of distinct characters in the window (at most the alphabet size, or n in the worst case).',
        'Worst-case extra space is O(n) when every character is unique.',
      ],
    },
  },

  pseudocode: `LongestUniqueSubstring(string)
    seen = empty set
    left = 0
    bestLength = 0
    bestStart = 0
    bestEnd = -1

    for right from 0 to length(string) - 1
        while string[right] exists in seen
            remove string[left] from seen
            left = left + 1

        add string[right] to seen

        currentLength = right - left + 1

        if currentLength > bestLength
            bestLength = currentLength
            bestStart = left
            bestEnd = right

    return bestLength, bestStart, bestEnd`,

  code: {
    python: `def longest_substring_without_repeating(value):
    seen = set()
    left = 0
    best_start = 0
    best_end = -1

    for right in range(len(value)):
        while value[right] in seen:
            seen.remove(value[left])
            left += 1

        seen.add(value[right])

        if (
            right - left
            > best_end - best_start
        ):
            best_start = left
            best_end = right

    if best_end == -1:
        return {
            "length": 0,
            "start": 0,
            "end": -1,
        }

    return {
        "length": best_end - best_start + 1,
        "start": best_start,
        "end": best_end,
    }


# Example
print(longest_substring_without_repeating("abcabcbb"))
# {"length": 3, "start": 0, "end": 2}  → "abc"

print(longest_substring_without_repeating("pwwkew"))
# {"length": 3, "start": 2, "end": 4}  → "wke"`,
    javascript: `function longestSubstringWithoutRepeating(value) {
  const seen = new Set();

  let left = 0;
  let bestStart = 0;
  let bestEnd = -1;

  for (let right = 0; right < value.length; right += 1) {
    while (seen.has(value[right])) {
      seen.delete(value[left]);
      left += 1;
    }

    seen.add(value[right]);

    if (
      right - left
      > bestEnd - bestStart
    ) {
      bestStart = left;
      bestEnd = right;
    }
  }

  return {
    length:
      bestEnd >= bestStart
        ? bestEnd - bestStart + 1
        : 0,
    start: bestStart,
    end: bestEnd,
  };
}

// Example
console.log(longestSubstringWithoutRepeating("abcabcbb"));
// { length: 3, start: 0, end: 2 }  → "abc"

console.log(longestSubstringWithoutRepeating("pwwkew"));
// { length: 3, start: 2, end: 4 }  → "wke"`,
    typescript: `type LongestSubstringResult = {
  length: number;
  start: number;
  end: number;
};

function longestSubstringWithoutRepeating(
  value: string,
): LongestSubstringResult {
  const seen = new Set<string>();

  let left = 0;
  let bestStart = 0;
  let bestEnd = -1;

  for (let right = 0; right < value.length; right += 1) {
    while (seen.has(value[right]!)) {
      seen.delete(value[left]!);
      left += 1;
    }

    seen.add(value[right]!);

    if (
      right - left
      > bestEnd - bestStart
    ) {
      bestStart = left;
      bestEnd = right;
    }
  }

  return {
    length:
      bestEnd >= bestStart
        ? bestEnd - bestStart + 1
        : 0,
    start: bestStart,
    end: bestEnd,
  };
}

// Example
console.log(longestSubstringWithoutRepeating("abcabcbb"));
// { length: 3, start: 0, end: 2 }  → "abc"

console.log(longestSubstringWithoutRepeating("pwwkew"));
// { length: 3, start: 2, end: 4 }  → "wke"`,
  },

  whenToUse: [
    'Longest or shortest substring that must satisfy a condition',
    'Contiguous ranges with constraints that can become invalid',
    'Problems where moving the left pointer restores validity',
    'String problems involving unique characters',
    'Problems that combine sets or maps with contiguous windows',
    'Examples of the pattern family: longest substring without repeating characters, longest substring with at most K distinct characters, and minimum-window style problems (not implemented in this lesson)',
  ],

  whenNotToUse: [
    'The elements do not need to be contiguous — that is a subsequence problem, not a substring window.',
    'The window cannot be maintained efficiently with expand/shrink updates.',
    'Prefix Sum is more appropriate for repeated range-sum queries on numbers.',
    'A fixed-size window is clearly required (for example maximum sum of size k).',
    'You only need a single-pass frequency map without a contiguous window invariant.',
  ],

  keyTakeaways: [
    'Substring means contiguous; subsequence may skip characters.',
    'Variable-size windows grow with the right pointer and shrink with the left pointer.',
    'A Set stores which characters are currently inside the window.',
    'On a duplicate, shrink until the window is unique again — do not stop after one left move if duplicates remain.',
    'Track both best length and best indices, not only the final window.',
    'Time is O(n) because each pointer moves at most n times; space is O(k) for distinct characters in the window.',
    'Fixed-size window (Step 27) keeps size constant; this lesson changes size based on validity.',
  ],

  thinkingGuide: {
    title: 'Fixed vs Variable Sliding Window',
    description:
      'Both techniques use a contiguous window. The difference is whether the window size stays constant.',
    steps: [
      'Fixed-size Sliding Window (previous lesson): window size = k stays constant. Example — maximum sum of a subarray of size 3: [a b c] → [b c d] → [c d e].',
      'Variable-size Sliding Window (this lesson): window size changes with validity. Example — unique characters: [a] → [a b] → [a b c] → then shrink to [b c a] after a duplicate.',
      'Right pointer expands the window. Left pointer shrinks it when the invariant breaks.',
      'Invariant here: every character inside the window must be unique.',
      'Recognizing which window type a problem needs is a core interview skill — ask whether size is given or defined by a condition.',
      'Second example "pwwkew": "pw" is valid; adding another "w" duplicates; left moves until the window is valid again; best answer is "wke" with length 3.',
    ],
  },

  commonMistakes: {
    description:
      'These mistakes show up often when learners first implement the variable-size unique-substring window.',
    mistakes: [
      {
        title: 'Forgetting to remove characters when moving left',
        explanation:
          'When left advances, delete value[left] from the Set first. Otherwise the Set no longer matches the window.',
      },
      {
        title: 'Moving left only once when duplicates remain',
        explanation:
          'Use while, not if. After one removal the duplicate may still be in the window — keep shrinking until seen.has(value[right]) is false.',
      },
      {
        title: 'Confusing substring with subsequence',
        explanation:
          'A substring is contiguous. Skipping characters (a subsequence) is a different problem and does not fit this window.',
      },
      {
        title: 'Tracking best length but not best indices',
        explanation:
          'Update bestStart and bestEnd whenever the length improves, so you can report the actual substring, not only a number.',
      },
      {
        title: 'Returning the last valid window instead of the longest',
        explanation:
          'The final window after the scan may be shorter than an earlier best. Always keep a separate best length/indices.',
      },
      {
        title: 'Incorrectly claiming O(n²) because of the nested while',
        explanation:
          'Left and right each move at most n times across the whole run. Amortized time is O(n).',
      },
      {
        title: 'Mishandling the empty string',
        explanation:
          'For "" return length 0 (and end = -1 in this lesson’s convention). Do not return a negative length.',
      },
      {
        title: 'Using a frequency map incorrectly',
        explanation:
          'A Map of counts also works, but you must decrement and delete keys carefully. This lesson uses a Set for a clearer uniqueness invariant.',
      },
      {
        title: 'Forgetting that the window must remain contiguous',
        explanation:
          'Left and right define one closed interval. You cannot drop a character from the middle without advancing left past it.',
      },
    ],
  },

  algorithmConnection: {
    title: 'Brute Force vs Sliding Window + Set',
    eyebrow: 'COMPARE',
    description:
      'You can check every substring for uniqueness, or maintain one valid window as you scan. The optimized approach reuses work instead of restarting.',
    items: [
      {
        title: 'Brute force',
        description:
          'Generate every substring and check whether it contains duplicate characters. Cost depends on the implementation, but checking all ranges is much more expensive than a single linear scan.',
      },
      {
        title: 'Sliding Window + Set',
        description:
          'Expand and shrink one window while a Set tracks membership. Validity is maintained incrementally. The optimized solution runs in O(n) time.',
      },
      {
        title: 'Fixed vs variable',
        description:
          'Fixed-size windows keep k constant (max sum of size k). Variable-size windows change length based on a condition (unique characters). Same family — different control of the left edge.',
      },
    ],
  },

  previousLesson: {
    title: "Kadane's Algorithm",
    href: '/learn/kadanes-algorithm',
  },

  nextLesson: {
    title: 'Valid Anagram (Coming Soon)',
    href: '/algorithms/array-string',
  },

  categoryHref: '/algorithms/array-string',
}
