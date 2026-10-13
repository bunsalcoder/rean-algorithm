import type { Lesson } from './types'

export const groupAnagrams: Lesson = {
  slug: 'group-anagrams',
  title: 'Group Anagrams',
  description:
    'Group words that are anagrams of each other using sorted-character signatures and a hash map.',
  category: 'Array & String',
  difficulty: 'Intermediate',
  estimatedTime: '25 minutes',
  tags: [
    'Array & String',
    'Group Anagrams',
    'Hash Map',
    'Sorting',
    'Strings',
    'Intermediate',
  ],

  objectives: [
    'Recognize when two words are anagrams.',
    'Build a canonical signature by sorting characters.',
    'Use a hash map to group words by signature efficiently.',
    'Trace how each word updates the map.',
    'Understand time and space complexity for the sorted-signature approach.',
    'Compare the hash-map solution with a less efficient brute-force pairing approach.',
  ],

  overview: [
    'Given an array of strings, group words that contain the same characters with the same frequencies, regardless of character order.',
    'Default example: ["eat", "tea", "tan", "ate", "nat", "bat"] → [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]].',
    'Additional examples: [""] → [[""]]; ["a"] → [["a"]]; ["ab", "ba", "abc", "cab"] → [["ab", "ba"], ["abc", "cab"]]; [] → [].',
    'Group order follows the order in which each signature first appears. Word order inside each group preserves input order.',
    'Strings are compared exactly as supplied: case-sensitive, and spaces and punctuation count as characters.',
    'This lesson builds on Valid Anagram and Frequency Counting — instead of comparing two strings, classify many words at once.',
    'Prerequisites: hash maps, strings, and anagram intuition. Examples use ordinary BMP characters so length and iteration stay consistent.',
  ],

  whyItMatters: [
    'Grouping anagrams appears in interviews, word games, deduplication, and search clustering where order of letters should not matter.',
    'A signature (sorted characters or a frequency vector) turns “same multiset of letters” into a hashable key.',
    'One linear pass over the word list with map lookups is far simpler than comparing every pair of words.',
    'Understanding signatures generalizes to other grouping problems: normalized keys, buckets, and inverted indexes.',
  ],

  visualization: {
    title: 'Group Anagrams hash map',
    description:
      'Watch each word become a signature, see the live signature → words map, and inspect the grouped result step by step.',
    type: 'group-anagrams',
  },

  steps: [
    {
      title: 'Start with an empty map',
      description:
        'Create an empty map from signature to list of words. No groups exist yet.',
    },
    {
      title: 'Read the next word',
      description:
        'Walk the input left to right. For the default example, start with "eat".',
    },
    {
      title: 'Build the signature',
      description:
        'Sort the word’s characters: "eat" → "aet", "tea" → "aet", "tan" → "ant". Matching signatures mean anagrams.',
    },
    {
      title: 'Look up the signature',
      description:
        'If the signature is new, create a group containing only this word. If it exists, append the word to that group.',
    },
    {
      title: 'Preserve order',
      description:
        'Map keys appear in first-seen signature order. Words inside a group keep their input order.',
    },
    {
      title: 'Return all groups',
      description:
        'Collect the map’s values. For the default input: [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]].',
    },
  ],

  complexity: {
    time: {
      best: 'O(n × m log m)',
      average: 'O(n × m log m)',
      worst: 'O(n × m log m)',
    },
    space: 'O(n × m)',
    notes: {
      time: [
        'Let n be the number of words and m the average word length.',
        'Each word is sorted once to build its signature, which costs O(m log m) per word.',
        'Map lookups and appends are typically O(1) average per word, so overall time is approximately O(n × m log m).',
        'Sorting signatures is the teaching approach in this lesson — not the only possible solution.',
        'When the character set is small and fixed (e.g. lowercase a–z), a frequency-count signature can avoid per-word sorting.',
      ],
      space: [
        'Space is proportional to storing every input character in groups plus signature keys in the map.',
        'In big-O terms this is O(n × m) for the stored words and signatures, plus output structure overhead.',
        'The input array and strings are not mutated.',
      ],
    },
  },

  pseudocode: `GroupAnagrams(words)
    groups = empty map

    for each word in words
        signature = sorted characters of word

        if signature does not exist in groups
            groups[signature] = empty list

        append word to groups[signature]

    return all group values`,

  code: {
    python: `def group_anagrams(words):
    groups = {}

    for word in words:
        signature = "".join(sorted(word))

        if signature not in groups:
            groups[signature] = []

        groups[signature].append(word)

    return list(groups.values())


# Examples (exact comparison — no normalization)
print(group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))
# [['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]

print(group_anagrams([]))                 # []
print(group_anagrams([""]))               # [['']]
print(group_anagrams(["a"]))              # [['a']]
print(group_anagrams(["ab", "ba", "abc", "cab"]))
# [['ab', 'ba'], ['abc', 'cab']]
print(group_anagrams(["a", "A"]))         # [['a'], ['A']]`,

    javascript: `function groupAnagrams(words) {
  const groups = new Map();

  for (const word of words) {
    const signature = [...word].sort().join("");

    if (!groups.has(signature)) {
      groups.set(signature, []);
    }

    groups.get(signature).push(word);
  }

  return [...groups.values()];
}

// Examples (ordinary BMP characters)
console.log(
  groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]),
);
console.log(groupAnagrams([]));
console.log(groupAnagrams([""]));
console.log(groupAnagrams(["a", "A"]));`,

    typescript: `export function wordSignature(word: string): string {
  return [...word].sort().join("");
}

export function groupAnagrams(words: string[]): string[][] {
  const groups = new Map<string, string[]>();

  for (const word of words) {
    const signature = wordSignature(word);
    const bucket = groups.get(signature);

    if (bucket === undefined) {
      groups.set(signature, [word]);
    } else {
      bucket.push(word);
    }
  }

  return [...groups.values()];
}

// Examples (ordinary BMP characters)
console.log(
  groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]),
);
console.log(groupAnagrams([]));
console.log(groupAnagrams([""]));
console.log(groupAnagrams(["a", "A"]));`,
  },

  whenToUse: [
    'Clustering many strings by anagram equivalence in one pass',
    'Building buckets before further processing (search, games, dedup)',
    'Problems where a stable hash key from character multiset is enough',
    'Interview settings that extend Valid Anagram from pairs to collections',
    'Exact, case-sensitive grouping without normalizing inputs first',
  ],

  whenNotToUse: [
    'You need to ignore case, spaces, or punctuation — normalize explicitly first if the product requires it.',
    'Words are extremely long and sorting each word dominates — consider frequency-vector signatures for fixed alphabets.',
    'You only need to test one pair of strings — use Valid Anagram instead of building groups.',
    'Pairwise “are these two anagrams?” is enough — brute-force or counting on two strings is simpler.',
    'You require linguistically correct Unicode grapheme handling — sorted UTF-16 code units are not a full grapheme canonical form.',
  ],

  keyTakeaways: [
    'Anagrams share the same characters with the same frequencies; order does not matter.',
    'A sorted-character signature is a simple canonical key for teaching and for many ASCII/lowercase problems.',
    'Hash map: signature → list of words groups efficiently in one pass.',
    'First-seen signature order defines group order; input order defines word order within a group.',
    'Exact rules: case, spaces, and punctuation matter unless you choose to normalize.',
    'Time is approximately O(n × m log m) for n words of average length m when sorting signatures.',
    'Space scales with total stored characters and map keys — roughly O(n × m).',
    'Brute-force comparing all pairs is O(n² × m) and does not scale.',
    'Frequency-based signatures are an alternative when the alphabet is bounded.',
  ],

  thinkingGuide: {
    title: 'Brute force vs hash map',
    description:
      'You could compare every pair of words with an anagram check. The signature map avoids repeated work.',
    steps: [
      'Brute force: for each word, compare it to every other word with a two-string anagram test — O(n²) pairs, each costing about O(m).',
      'That repeats the same character analysis many times for words in the same anagram class.',
      'Signature approach: compute one key per word, O(m log m) sort (in this lesson), then O(1) average map update.',
      'After one pass, all words sharing a signature are already bucketed together.',
      'Choose the map when n grows; keep brute force in mind only to explain why grouping needs a shared key.',
    ],
  },

  commonMistakes: {
    description:
      'Common pitfalls when first implementing Group Anagrams.',
    mistakes: [
      {
        title: 'Using character set equality instead of frequency',
        explanation:
          '"aab" and "abb" might share letters in a set view but are not anagrams — counts must match.',
      },
      {
        title: 'Lowercasing or trimming without requirements',
        explanation:
          '"a" and "A" belong in different groups under exact rules. Leading spaces change signatures.',
      },
      {
        title: 'Returning map keys instead of grouped words',
        explanation:
          'The answer is lists of original words, not the sorted signature strings.',
      },
      {
        title: 'Losing input order inside groups',
        explanation:
          'Append each word to its group — do not sort words alphabetically unless the problem asks for it.',
      },
      {
        title: 'Assuming O(n × m) time for the sorted-signature version',
        explanation:
          'Per-word sorting adds a log m factor. Frequency signatures can change the tradeoff when the alphabet is fixed.',
      },
      {
        title: 'Treating Unicode sorting as perfect for all human text',
        explanation:
          'Spread-sorting UTF-16 code units is fine for scoped lesson examples but not a universal grapheme solution.',
      },
    ],
  },

  algorithmConnection: {
    title: 'Sorted signature vs frequency signature',
    eyebrow: 'COMPARE',
    description:
      'Both approaches produce a hashable anagram key. They differ in constants and constraints.',
    items: [
      {
        title: 'Sorted characters (this lesson)',
        description:
          'Sort letters to form the key. Simple to teach and implement. About O(m log m) per word of length m.',
      },
      {
        title: 'Frequency count vector',
        description:
          'Count each character in O(m), serialize counts (e.g. 26 letters). Often O(m) per word when the alphabet is fixed.',
      },
      {
        title: 'Valid Anagram as building block',
        description:
          'Pairwise anagram tests are the brute-force inner loop. Signatures replace repeated pairwise checks.',
      },
    ],
  },

  previousLesson: {
    title: 'Valid Anagram',
    href: '/learn/valid-anagram',
  },

  nextLesson: {
    title: 'String Compression',
    href: '/learn/string-compression',
  },

  categoryHref: '/algorithms/array-string',
}
