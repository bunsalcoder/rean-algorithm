import type { Lesson } from './types'

export const validAnagram: Lesson = {
  slug: 'valid-anagram',
  title: 'Valid Anagram',
  description:
    'Learn how to determine whether two strings contain exactly the same characters with the same frequencies.',
  category: 'Array & String',
  difficulty: 'Beginner',
  estimatedTime: '20 minutes',
  tags: [
    'Array & String',
    'Valid Anagram',
    'Frequency Counting',
    'Hash Map',
    'Strings',
    'Beginner',
  ],

  objectives: [
    'Understand what an anagram is.',
    'Count characters using a frequency map.',
    'Compare character frequencies across two strings.',
    'Reject strings with different lengths.',
    'Understand time and space complexity.',
    'Recognize when frequency counting is preferable to sorting.',
  ],

  overview: [
    'An anagram contains exactly the same characters with the same frequencies, regardless of their order.',
    'Examples: "listen" and "silent" → true; "anagram" and "nagaram" → true; "rat" and "car" → false; "aacc" and "ccac" → false; "a" and "aa" → false.',
    'This lesson builds on Frequency Counting. Instead of answering “how many times does x appear?”, ask “do these two strings have identical character counts?”',
    'Primary comparison rules are exact: case-sensitive, and spaces and punctuation count as characters. Do not silently normalize inputs. Applications may later choose to ignore case or spaces — that is a separate product requirement.',
    'Prerequisites: Strings, Hash maps, and Frequency Counting. Examples in this lesson use ordinary BMP characters so string length and character iteration stay consistent.',
  ],

  whyItMatters: [
    'Anagram checks appear in interviews, spelling games, and text-processing tools. The core skill is comparing multisets of characters.',
    'Sorting both strings works, but frequency counting usually answers the same question in linear time with a compact map.',
    'The decrementing approach is especially clear: build counts from the first string, then cancel them with the second. If every cancel succeeds and lengths match, the frequencies are identical.',
    'Recognizing when to count instead of sort is a reusable pattern for many string and array problems.',
  ],

  visualization: {
    title: 'Valid Anagram frequency map',
    description:
      'Watch both strings, the shared frequency map, and the final Valid Anagram / Not Anagrams result as counts are incremented and decremented.',
    type: 'valid-anagram',
  },

  steps: [
    {
      title: 'Compare lengths first',
      description:
        'If the strings have different lengths, return false immediately. "a" and "aa" fail here.',
    },
    {
      title: 'Count the first string',
      description:
        'Walk the first string and increment a frequency map. For "listen": l → 1, i → 1, s → 1, t → 1, e → 1, n → 1.',
    },
    {
      title: 'Decrement with the second string',
      description:
        'For each character in the second string, decrease its count. For "silent", every character finds a matching count to cancel.',
    },
    {
      title: 'Fail on missing or overused characters',
      description:
        'If a character is missing or already at count 0, return false. That is how "rat" vs "car" and "aacc" vs "ccac" fail.',
    },
    {
      title: 'Return true when all counts cancel',
      description:
        'Matching lengths plus successful decrements mean the frequencies are identical. Map insertion order never mattered.',
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
        'Let n be the length of each string when lengths match (or the shorter path when they do not).',
        'Building and then decrementing the map takes O(n) time with typical hash-map operations.',
        'The different-length check can reject some inputs immediately, but the general worst-case complexity remains O(n).',
      ],
      space: [
        'Space is O(k), where k is the number of distinct characters in the input.',
        'k is at most the number of distinct characters that appear (and at most n).',
        'Neither input string is mutated.',
      ],
    },
  },

  pseudocode: `IsValidAnagram(first, second)
    if length(first) != length(second)
        return false

    frequency = empty map

    for each character in first
        frequency[character] += 1

    for each character in second
        if frequency[character] does not exist
            return false

        if frequency[character] == 0
            return false

        frequency[character] -= 1

    return true

# Why decrementing works:
# Matching lengths mean both strings have the same number of characters.
# Incrementing builds the multiset of the first string.
# Each successful decrement cancels one occurrence from that multiset.
# If every character from the second string cancels successfully,
# no extras remain and no character was missing — the multisets match.`,

  code: {
    python: `def is_valid_anagram(first, second):
    if len(first) != len(second):
        return False

    frequency = {}

    for char in first:
        frequency[char] = frequency.get(char, 0) + 1

    for char in second:
        if frequency.get(char, 0) == 0:
            return False

        frequency[char] -= 1

    return True


# Examples
print(is_valid_anagram("listen", "silent"))  # True
print(is_valid_anagram("rat", "car"))        # False
print(is_valid_anagram("", ""))              # True
print(is_valid_anagram("a", "A"))            # False`,
    javascript: `function isValidAnagram(first, second) {
  if (first.length !== second.length) {
    return false;
  }

  const frequency = new Map();

  for (const char of first) {
    frequency.set(
      char,
      (frequency.get(char) ?? 0) + 1,
    );
  }

  for (const char of second) {
    const count = frequency.get(char) ?? 0;

    if (count === 0) {
      return false;
    }

    frequency.set(char, count - 1);
  }

  return true;
}

// Examples (ordinary BMP characters)
console.log(isValidAnagram("listen", "silent")); // true
console.log(isValidAnagram("rat", "car"));       // false
console.log(isValidAnagram("", ""));             // true
console.log(isValidAnagram("a", "A"));           // false`,
    typescript: `export function isValidAnagram(
  first: string,
  second: string,
): boolean {
  if (first.length !== second.length) {
    return false;
  }

  const frequency = new Map<string, number>();

  for (const char of first) {
    const count = frequency.get(char) ?? 0;
    frequency.set(char, count + 1);
  }

  for (const char of second) {
    const count = frequency.get(char) ?? 0;

    if (count === 0) {
      return false;
    }

    frequency.set(char, count - 1);
  }

  return true;
}

// Examples (ordinary BMP characters)
console.log(isValidAnagram("listen", "silent")); // true
console.log(isValidAnagram("rat", "car"));       // false
console.log(isValidAnagram("", ""));             // true
console.log(isValidAnagram("a", "A"));           // false`,
  },

  whenToUse: [
    'Checking whether two strings are anagrams under exact comparison rules',
    'Comparing character multisets without caring about order',
    'Problems where frequency counting is clearer than sorting',
    'Case-sensitive or punctuation-aware text checks',
    'Building intuition before Group Anagrams and related clustering problems',
  ],

  whenNotToUse: [
    'You need to ignore case, spaces, or punctuation — normalize first as a separate step if the product requires it.',
    'You only need lexicographic order or sorted output, not frequency equality.',
    'A language-specific sorting approach is already required by the problem constraints.',
    'You are comparing sets of unique characters and duplicates do not matter (that is a different problem).',
  ],

  keyTakeaways: [
    'Anagrams share the same characters with the same frequencies; order does not matter.',
    'Different lengths can never be anagrams.',
    'Build counts from the first string, then decrement with the second.',
    'Missing characters or zero counts mean the strings are not anagrams.',
    'Map insertion order is irrelevant — compare counts, not key order.',
    'Exact comparison is case-sensitive and treats spaces/punctuation as characters.',
    'Empty strings are valid anagrams of each other.',
    'Typical complexity: O(n) time and O(k) space for k distinct characters.',
    'Sorting is a valid alternative at about O(n log n); frequency counting is usually preferable when counts are enough.',
  ],

  thinkingGuide: {
    title: 'Alternative approach: sorting',
    description:
      'You can also sort both strings and compare the results. Frequency counting is usually faster, but sorting is a useful mental model.',
    steps: [
      'Sorting approach: sort the characters of both strings, then compare the sorted results.',
      'If the sorted strings are equal, the originals are anagrams under the same comparison rules.',
      'Typical sorting complexity: O(n log n) time. Extra space depends on the language and sorting implementation.',
      'Frequency counting is typically O(n) time and O(k) extra space for k distinct characters.',
      'Choose counting when you only need equality of multisets. Choose sorting when sorted forms are useful for other reasons.',
      'Do not rely on micro-benchmarks here — reason from asymptotic cost and clarity.',
    ],
  },

  commonMistakes: {
    description:
      'These mistakes show up often when learners first implement anagram checks.',
    mistakes: [
      {
        title: 'Checking only that both strings have the same length',
        explanation:
          '"rat" and "car" have the same length but different characters. Length is necessary, not sufficient.',
      },
      {
        title: 'Comparing sets of characters without comparing counts',
        explanation:
          'Sets ignore duplicates. "aacc" and "ccac" need counts, not only membership.',
      },
      {
        title: 'Ignoring duplicate characters',
        explanation:
          'Frequencies must match exactly. One extra "a" or "c" makes the answer false.',
      },
      {
        title: 'Comparing map insertion order',
        explanation:
          'Maps may list keys in different orders. Equality depends on counts for each character, not on the order keys were inserted.',
      },
      {
        title: 'Accidentally normalizing case or spaces without requirements',
        explanation:
          '"a" and "A" are not anagrams under exact rules. "a " and " a" are anagrams because both contain one "a" and one space.',
      },
      {
        title: 'Mishandling missing characters',
        explanation:
          'If the second string introduces a character never seen in the first, return false immediately.',
      },
      {
        title: 'Forgetting empty strings are valid anagrams of each other',
        explanation:
          '("", "") has equal length and identical (empty) frequencies → true.',
      },
      {
        title: 'Using inconsistent Unicode length and iteration semantics',
        explanation:
          'In JavaScript/TypeScript, .length counts UTF-16 code units while for...of iterates code points. This lesson scopes examples to ordinary BMP characters so those views agree.',
      },
    ],
  },

  algorithmConnection: {
    title: 'Frequency Counting vs Sorting',
    eyebrow: 'COMPARE',
    description:
      'Both approaches can decide whether two strings are anagrams. They trade time, space, and clarity differently.',
    items: [
      {
        title: 'Frequency counting',
        description:
          'Count then cancel. Typically O(n) time and O(k) space. Directly checks multiset equality and fits the visualization in this lesson.',
      },
      {
        title: 'Sorting',
        description:
          'Sort both strings and compare. Typically O(n log n) time. Extra space depends on the sort. Simple to explain, usually slower asymptotically.',
      },
      {
        title: 'Exact vs normalized rules',
        description:
          'Decide comparison rules first. Exact mode preserves case, spaces, and punctuation. Normalization (lowercase, strip spaces) is a separate preprocessing choice.',
      },
    ],
  },

  previousLesson: {
    title: 'Longest Substring Without Repeating Characters',
    href: '/learn/longest-substring-without-repeating-characters',
  },

  nextLesson: {
    title: 'Group Anagrams (Coming Soon)',
    href: '/algorithms/array-string',
  },

  categoryHref: '/algorithms/array-string',
}
