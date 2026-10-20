import { practiceProblems } from '../problems'
import type { ProblemValidationSupport } from './types'

const SUPPORT_BY_SLUG: Record<string, ProblemValidationSupport> = {
  'find-an-element': {
    slug: 'find-an-element',
    candidateMode: 'check_example_answer',
    referenceSupported: true,
    answerKind: 'number',
    answerLabel: 'Index answer',
    answerPlaceholder: 'e.g. 3 or -1',
    conceptHint:
      'Linear search scans left to right and returns the first matching index, or -1 when missing.',
  },
  'find-target-sorted-array': {
    slug: 'find-target-sorted-array',
    candidateMode: 'check_example_answer',
    referenceSupported: true,
    answerKind: 'number',
    answerLabel: 'Index answer',
    answerPlaceholder: 'e.g. 6 or -1',
    conceptHint:
      'Binary search halves a sorted range each step until the target is found or the range is empty.',
  },
  'two-sum-sorted': {
    slug: 'two-sum-sorted',
    candidateMode: 'check_example_answer',
    referenceSupported: true,
    answerKind: 'number_array',
    answerLabel: 'Index pair',
    answerPlaceholder: 'e.g. [0, 6] or [-1, -1]',
    conceptHint:
      'Two pointers on a sorted array move inward based on whether the current sum is too small or too large.',
  },
  'max-sum-fixed-window': {
    slug: 'max-sum-fixed-window',
    candidateMode: 'check_example_answer',
    referenceSupported: true,
    answerKind: 'number',
    answerLabel: 'Maximum window sum',
    answerPlaceholder: 'e.g. 9',
    conceptHint:
      'A fixed-size sliding window updates the running sum in O(1) as it slides, tracking the maximum.',
  },
  'range-sum-queries': {
    slug: 'range-sum-queries',
    candidateMode: 'check_example_answer',
    referenceSupported: true,
    answerKind: 'number',
    answerLabel: 'Range sum',
    answerPlaceholder: 'e.g. 14',
    conceptHint:
      'After building a leading-zero prefix array, range sum is prefix[right + 1] − prefix[left].',
  },
  'most-frequent-number': {
    slug: 'most-frequent-number',
    candidateMode: 'check_example_answer',
    referenceSupported: true,
    answerKind: 'nullish_number',
    answerLabel: 'Most frequent value',
    answerPlaceholder: 'e.g. 2 or null',
    conceptHint:
      'Count frequencies with a map, then pick the highest-count value (first among ties). Empty → null.',
  },
  'maximum-subarray-sum': {
    slug: 'maximum-subarray-sum',
    candidateMode: 'check_example_answer',
    referenceSupported: true,
    answerKind: 'kadane_result',
    answerLabel: 'Max subarray result',
    answerPlaceholder: '{ maxSum: 6, start: 3, end: 6 }',
    conceptHint:
      "Kadane's algorithm extends or restarts the running sum at each index while tracking the best window.",
  },
  'longest-substring-no-repeat': {
    slug: 'longest-substring-no-repeat',
    candidateMode: 'check_example_answer',
    referenceSupported: true,
    answerKind: 'longest_substring_result',
    answerLabel: 'Longest substring result',
    answerPlaceholder: '{ length: 3, start: 0, end: 2 }',
    conceptHint:
      'A variable sliding window expands while characters are unique and shrinks from the left on duplicates.',
  },
  'valid-anagram': {
    slug: 'valid-anagram',
    candidateMode: 'check_example_answer',
    referenceSupported: true,
    answerKind: 'boolean',
    answerLabel: 'Boolean answer',
    answerPlaceholder: 'true or false',
    conceptHint:
      'Exact anagrams need equal length and identical character frequencies (case and punctuation matter).',
  },
  'group-anagrams': {
    slug: 'group-anagrams',
    candidateMode: 'exploration_only',
    referenceSupported: true,
    answerKind: 'none',
    answerLabel: 'Structured answer not available',
    answerPlaceholder: '',
    conceptHint:
      'Words that share a character multiset belong together. Group order is not unique, so this page offers reference exploration only.',
  },
}

export const VALIDATION_MODE_LABEL =
  'Check Example Answer — structured answer vs expected output'

export const VALIDATION_MODE_LIMITATIONS =
  'This check compares a structured example answer (or a trusted lesson reference) to predefined expected outputs. It does not compile or execute Python, JavaScript, or TypeScript source code you type elsewhere on this page.'

export function getProblemValidationSupport(
  slug: string,
): ProblemValidationSupport {
  const known = SUPPORT_BY_SLUG[slug]
  if (known) {
    return known
  }

  return {
    slug,
    candidateMode: 'unsupported',
    referenceSupported: false,
    answerKind: 'none',
    answerLabel: 'Validation not available',
    answerPlaceholder: '',
    conceptHint:
      'Answer validation has not been configured for this problem yet.',
  }
}

export function isValidationSupported(slug: string): boolean {
  const support = getProblemValidationSupport(slug)
  return support.candidateMode !== 'unsupported'
}

export function listSupportedValidationSlugs(): string[] {
  return Object.keys(SUPPORT_BY_SLUG)
}

/** Slugs with Check Example Answer (structured candidate) support. */
export function listCheckExampleAnswerSlugs(): string[] {
  return Object.values(SUPPORT_BY_SLUG)
    .filter((entry) => entry.candidateMode === 'check_example_answer')
    .map((entry) => entry.slug)
}

/** Practice problems that intentionally have no structured validation yet. */
export function listUnsupportedValidationSlugs(): string[] {
  return practiceProblems
    .map((problem) => problem.slug)
    .filter((slug) => getProblemValidationSupport(slug).candidateMode === 'unsupported')
}
