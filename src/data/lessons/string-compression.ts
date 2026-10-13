import type { Lesson } from './types'

export const stringCompression: Lesson = {
  slug: 'string-compression',
  title: 'String Compression',
  description:
    'Compress consecutive repeated characters with a simple run-length encoding that writes counts only when greater than one.',
  category: 'Array & String',
  difficulty: 'Beginner',
  estimatedTime: '20–25 minutes',
  tags: [
    'Array & String',
    'String Compression',
    'Run-Length Encoding',
    'Strings',
    'Beginner',
    'Intermediate',
  ],

  objectives: [
    'Recognize consecutive runs of identical characters.',
    'Count each run while scanning left to right.',
    'Write a character and append its count only when the count is greater than one.',
    'Trace how the compressed output is built step by step.',
    'Understand time and space complexity of the string-returning approach.',
    'Know when this simple encoding is unambiguous and when it needs escaping.',
  ],

  overview: [
    'Given a string, compress consecutive identical characters by writing each character followed by its run count when that count is greater than one.',
    'Default example: "aaabbc" → "a3b2c".',
    'Additional examples: "abc" → "abc"; "aabbcc" → "a2b2c2"; "aaaaa" → "a5"; "aabbaa" → "a2b2a2"; "" → "".',
    'Characters are processed exactly as supplied: no trimming, no case folding. "aaAA" becomes "a2A2" because case distinguishes runs.',
    'This is a simple educational compression format — not a universal lossless encoding for arbitrary strings. Omitting the count for single characters is unambiguous for letter-based examples, but inputs containing digits or delimiter-like characters need an escaping or delimiter strategy for a safe round-trip.',
    'The implementation builds a new output string rather than rewriting the input in place.',
    'Prerequisites: basic string indexing and loops. Examples use ordinary BMP characters so UTF-16 code-unit indices align with user-perceived characters.',
  ],

  whyItMatters: [
    'Run-length encoding appears in interviews, image formats, telemetry, and any domain where long consecutive repeats are common.',
    'Scanning once and counting runs is a foundational “walk and rewrite” pattern for strings and arrays.',
    'Understanding when counts can be omitted teaches you to think about encoding ambiguity — a key design skill beyond coding drills.',
    'The same consecutive-run idea shows up in group-by, streak detection, and in-place compression variants.',
  ],

  visualization: {
    title: 'String Compression run-length walk',
    description:
      'Watch each consecutive run grow, see when the count is written, and follow the compressed output as it is built.',
    type: 'string-compression',
  },

  steps: [
    {
      title: 'Start with an empty output',
      description:
        'Prepare an empty result string and begin at the first character of the input.',
    },
    {
      title: 'Read the current character',
      description:
        'Take the character at the current index and start a run with count 1. For "aaabbc", the first run begins with "a".',
    },
    {
      title: 'Extend the run',
      description:
        'While the next characters equal the run character, increase the count. Three consecutive "a" characters yield count 3.',
    },
    {
      title: 'End the run and write',
      description:
        'When the next character differs (or the string ends), append the character. If count > 1, also append the count — e.g. write "a3".',
    },
    {
      title: 'Advance to the next run',
      description:
        'Move past the finished run and repeat. Next, count two "b" characters and write "b2", then a single "c" and write "c" without a count.',
    },
    {
      title: 'Return the compressed string',
      description:
        'When every character is processed, return the built output. For the default input the result is "a3b2c".',
    },
  ],

  complexity: {
    time: {
      best: 'O(n)',
      average: 'O(n)',
      worst: 'O(n)',
    },
    space: 'O(n)',
    notes: {
      time: [
        'Let n be the length of the input string.',
        'Each character is examined a constant number of times while counting runs and advancing the index, so the scan is O(n).',
        'Appending to the output string is proportional to the number of written characters; overall work remains linear in n for typical implementations.',
      ],
      space: [
        'Auxiliary space is O(n) in the general case for the newly built output string.',
        'This string-returning implementation is not in-place and does not claim O(1) auxiliary space.',
        'Depending on the representation, the output can be longer than the input (for example many single characters, or large multi-digit counts).',
      ],
    },
  },

  pseudocode: `CompressString(input)
    output = empty string
    i = 0

    while i < length(input)
        character = input[i]
        count = 1

        while i + count < length(input)
              and input[i + count] equals character
            count = count + 1

        append character to output

        if count > 1
            append count to output

        i = i + count

    return output`,

  code: {
    python: `def compress_string(input_str: str) -> str:
    output = []
    i = 0
    n = len(input_str)

    while i < n:
        character = input_str[i]
        count = 1

        while i + count < n and input_str[i + count] == character:
            count += 1

        output.append(character)
        if count > 1:
            output.append(str(count))

        i += count

    return "".join(output)


# Examples (exact characters — no trim / case fold)
print(compress_string("aaabbc"))  # a3b2c
print(compress_string("abc"))     # abc
print(compress_string("aabbcc"))  # a2b2c2
print(compress_string("aaaaa"))   # a5
print(compress_string("aabbaa"))  # a2b2a2
print(compress_string(""))        # (empty)
print(compress_string("aaAA"))    # a2A2`,

    javascript: `function compressString(input) {
  let output = "";
  let i = 0;

  while (i < input.length) {
    const character = input[i];
    let count = 1;

    while (i + count < input.length && input[i + count] === character) {
      count += 1;
    }

    output += character;
    if (count > 1) {
      output += String(count);
    }

    i += count;
  }

  return output;
}

// Examples (ordinary BMP characters; UTF-16 indices)
console.log(compressString("aaabbc")); // a3b2c
console.log(compressString("abc")); // abc
console.log(compressString("aabbcc")); // a2b2c2
console.log(compressString("aaaaa")); // a5
console.log(compressString("aabbaa")); // a2b2a2
console.log(compressString("")); // ""
console.log(compressString("aaAA")); // a2A2`,

    typescript: `export function compressString(input: string): string {
  let output = "";
  let i = 0;

  while (i < input.length) {
    const character = input[i]!;
    let count = 1;

    while (i + count < input.length && input[i + count] === character) {
      count += 1;
    }

    output += character;
    if (count > 1) {
      output += String(count);
    }

    i += count;
  }

  return output;
}

// Examples (ordinary BMP characters; UTF-16 indices)
console.log(compressString("aaabbc")); // a3b2c
console.log(compressString("abc")); // abc
console.log(compressString("aabbcc")); // a2b2c2
console.log(compressString("aaaaa")); // a5
console.log(compressString("aabbaa")); // a2b2a2
console.log(compressString("")); // ""
console.log(compressString("aaAA")); // a2A2`,
  },

  whenToUse: [
    'Inputs with long consecutive runs of the same character',
    'Teaching or practicing a single left-to-right string scan',
    'Letter-based or otherwise unambiguous alphabets where omitting count 1 is safe',
    'Interview warm-ups that lead into in-place compression variants',
    'Streak detection or “group consecutive equals” style problems',
  ],

  whenNotToUse: [
    'You need a universal lossless codec for arbitrary text that may contain digits — design escaping or delimiters first.',
    'Runs are rare and short — compression may not shrink the string and can even grow it.',
    'You require in-place / O(1) auxiliary space — this lesson builds a new string (O(n) space).',
    'You need grapheme-aware Unicode handling — code-unit indexing is not a full grapheme compressor.',
    'You need maximum compression for general data — use a general-purpose codec instead of simple RLE.',
  ],

  keyTakeaways: [
    'Run-length encoding counts consecutive identical characters.',
    'Write the character always; write the count only when it is greater than one.',
    'Scan left to right in O(n) time while building a new output string.',
    'Auxiliary space is O(n) for the output — this is not an in-place O(1) solution.',
    'Exact rules: no silent trim or case folding; "aaAA" → "a2A2".',
    'Omitting count 1 is fine for letter examples but ambiguous if digits appear in the payload.',
    'Non-consecutive repeats do not merge: "aba" stays "aba".',
    'Empty input compresses to an empty string.',
  ],

  thinkingGuide: {
    title: 'Count the run, then write',
    description:
      'Separate “how long is this streak?” from “what do I append?” so each step stays clear.',
    steps: [
      'Fix the character at the current index as the run character.',
      'Grow count while the next indices still equal that character.',
      'Always append the character once the run ends.',
      'Append the count only if count > 1 — that is the educational rule for this lesson.',
      'Advance i by count so the next loop starts at the next unprocessed character.',
      'Ask whether your alphabet can contain digits; if yes, plan escaping before treating the format as reversible.',
    ],
  },

  commonMistakes: {
    description:
      'Common pitfalls when first implementing simple string compression.',
    mistakes: [
      {
        title: 'Writing the count even when it is 1',
        explanation:
          'This lesson omits count 1 so "abc" stays "abc", not "a1b1c1".',
      },
      {
        title: 'Merging non-consecutive repeats',
        explanation:
          '"aabbaa" has two separate runs of "a". The correct result is "a2b2a2", not "a4b2".',
      },
      {
        title: 'Trimming or lowercasing the input',
        explanation:
          'Spaces and case are significant. Process characters exactly as supplied.',
      },
      {
        title: 'Mutating the original string or claiming O(1) space',
        explanation:
          'Building a new output string uses O(n) auxiliary space. Do not describe this version as in-place.',
      },
      {
        title: 'Assuming the format is always reversible with digits present',
        explanation:
          'Without escaping, a digit in the input can look like a count. Letter-only examples avoid that ambiguity.',
      },
      {
        title: 'Treating UTF-16 indices as universal graphemes',
        explanation:
          'Lesson examples use ordinary BMP characters. Surrogate pairs and combining marks need a different iteration model.',
      },
    ],
  },

  algorithmConnection: {
    title: 'Educational RLE vs in-place variants',
    eyebrow: 'COMPARE',
    description:
      'The same run-counting idea appears in several problem styles with different space constraints.',
    items: [
      {
        title: 'New output string (this lesson)',
        description:
          'Simple to teach and verify. Time O(n), auxiliary space O(n) for the result.',
      },
      {
        title: 'In-place write pointer',
        description:
          'Some interview problems rewrite a character array with read/write indices under extra constraints. That changes the space story.',
      },
      {
        title: 'General compression codecs',
        description:
          'Real-world compressors handle mixed alphabets, entropy coding, and framing — far beyond consecutive-run RLE.',
      },
    ],
  },

  previousLesson: {
    title: 'Group Anagrams',
    href: '/learn/group-anagrams',
  },

  nextLesson: {
    title: 'Rotate Array',
    href: '/learn/rotate-array',
  },

  categoryHref: '/algorithms/array-string',
}
