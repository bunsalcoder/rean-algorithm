import { describe, expect, it } from 'vitest'
import { practiceProblems } from '../problems'
import { practiceRelatedLessonExists } from '../index'
import { valuesEqual } from './compare'
import { parseCandidateAnswer } from './parseAnswer'
import { runTrustedReference } from './reference'
import {
  getProblemValidationSupport,
  listCheckExampleAnswerSlugs,
  listSupportedValidationSlugs,
  listUnsupportedValidationSlugs,
} from './support'
import {
  filterTestCasesByKind,
  getTestCaseById,
  getTestCasesForProblem,
  practiceTestCases,
} from './testCases'
import {
  applyCandidateResult,
  createNotRunResults,
  resetValidationResults,
  resultsNeverClaimSourceExecution,
  summarizeValidationResults,
  validateCandidateAnswer,
  validateWithTrustedReference,
} from './validate'

describe('practice test case data integrity', () => {
  it('has unique test case ids', () => {
    const ids = practiceTestCases.map((testCase) => testCase.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('associates every case with a known practice problem', () => {
    const slugs = new Set(practiceProblems.map((problem) => problem.slug))

    for (const testCase of practiceTestCases) {
      expect(slugs.has(testCase.problemSlug)).toBe(true)
      expect(testCase.id.trim().length).toBeGreaterThan(0)
      expect(testCase.description.trim().length).toBeGreaterThan(0)
      expect(['sample', 'normal', 'edge']).toContain(testCase.kind)
    }
  })

  it('includes sample, normal, and edge coverage for supported problems', () => {
    for (const slug of listSupportedValidationSlugs()) {
      const cases = getTestCasesForProblem(slug)
      expect(cases.length).toBeGreaterThanOrEqual(4)
      expect(cases.some((testCase) => testCase.kind === 'sample')).toBe(true)
      expect(
        cases.filter((testCase) => testCase.kind === 'normal').length,
      ).toBeGreaterThanOrEqual(2)
      expect(
        cases.filter((testCase) => testCase.kind === 'edge').length,
      ).toBeGreaterThanOrEqual(1)
    }
  })

  it('filters by kind without inventing cases', () => {
    const cases = getTestCasesForProblem('find-an-element')
    const samples = filterTestCasesByKind(cases, 'sample')
    expect(samples.every((testCase) => testCase.kind === 'sample')).toBe(true)
    expect(filterTestCasesByKind(cases, 'all')).toHaveLength(cases.length)
  })
})

describe('value comparison', () => {
  it('compares primitives, null, and ordered arrays', () => {
    expect(valuesEqual(3, 3)).toBe(true)
    expect(valuesEqual(3, 4)).toBe(false)
    expect(valuesEqual(null, null)).toBe(true)
    expect(valuesEqual(null, 0)).toBe(false)
    expect(valuesEqual(true, true)).toBe(true)
    expect(valuesEqual('a', 'a')).toBe(true)
    expect(valuesEqual([1, 2], [1, 2])).toBe(true)
    expect(valuesEqual([1, 2], [2, 1])).toBe(false)
  })

  it('supports order-independent array comparison when requested', () => {
    expect(
      valuesEqual([1, 2, 2], [2, 1, 2], { orderIndependent: true }),
    ).toBe(true)
    expect(
      valuesEqual([1, 2], [1, 2, 2], { orderIndependent: true }),
    ).toBe(false)
  })

  it('compares plain objects by keys without JSON stringify tricks', () => {
    expect(
      valuesEqual(
        { maxSum: 6, start: 3, end: 6 },
        { end: 6, maxSum: 6, start: 3 },
      ),
    ).toBe(true)
    expect(
      valuesEqual({ maxSum: 6, start: 3, end: 6 }, { maxSum: 6, start: 3, end: 5 }),
    ).toBe(false)
  })

  it('compares group-anagram nested arrays with order-independent groups', () => {
    expect(
      valuesEqual(
        [
          ['tea', 'eat'],
          ['bat'],
        ],
        [
          ['bat'],
          ['eat', 'tea'],
        ],
        { groupAnagrams: true },
      ),
    ).toBe(true)
  })
})

describe('structured answer parsing', () => {
  it('parses numbers, booleans, nullish numbers, and arrays', () => {
    expect(parseCandidateAnswer('3', 'number')).toEqual({ ok: true, value: 3 })
    expect(parseCandidateAnswer('-1', 'number')).toEqual({
      ok: true,
      value: -1,
    })
    expect(parseCandidateAnswer('true', 'boolean')).toEqual({
      ok: true,
      value: true,
    })
    expect(parseCandidateAnswer('null', 'nullish_number')).toEqual({
      ok: true,
      value: null,
    })
    expect(parseCandidateAnswer('[0, 6]', 'number_array')).toEqual({
      ok: true,
      value: [0, 6],
    })
  })

  it('rejects invalid structured answers without crashing', () => {
    expect(parseCandidateAnswer('3.5', 'number').ok).toBe(false)
    expect(parseCandidateAnswer('maybe', 'boolean').ok).toBe(false)
    expect(parseCandidateAnswer('[1, a]', 'number_array').ok).toBe(false)
    expect(parseCandidateAnswer('', 'number').ok).toBe(false)
    expect(parseCandidateAnswer('1', 'none').ok).toBe(false)
  })

  it('parses kadane and longest-substring objects', () => {
    expect(
      parseCandidateAnswer(
        '{ maxSum: 6, start: 3, end: 6 }',
        'kadane_result',
      ),
    ).toEqual({
      ok: true,
      value: { maxSum: 6, start: 3, end: 6 },
    })
    expect(
      parseCandidateAnswer(
        'length: 3, start: 0, end: 2',
        'longest_substring_result',
      ),
    ).toEqual({
      ok: true,
      value: { length: 3, start: 0, end: 2 },
    })
    expect(
      parseCandidateAnswer('{ maxSum: 6 }', 'kadane_result').ok,
    ).toBe(false)
  })
})

describe('trusted reference results for supported problems', () => {
  it('matches expected outputs for every authored test case', () => {
    for (const slug of listSupportedValidationSlugs()) {
      const results = validateWithTrustedReference({ problemSlug: slug })
      const summary = summarizeValidationResults(results)

      expect(summary.failed).toBe(0)
      expect(summary.invalidInput).toBe(0)
      expect(summary.passed).toBe(getTestCasesForProblem(slug).length)
      expect(resultsNeverClaimSourceExecution(results)).toBe(true)
    }
  })

  it('handles empty and boundary inputs via reference runners', () => {
    expect(
      runTrustedReference('find-an-element', { arr: [], target: 1 }),
    ).toBe(-1)
    expect(
      runTrustedReference('most-frequent-number', { arr: [] }),
    ).toBeNull()
    expect(
      runTrustedReference('maximum-subarray-sum', { arr: [] }),
    ).toBeNull()
    expect(
      runTrustedReference('max-sum-fixed-window', { arr: [1], k: 3 }),
    ).toBe(0)
    expect(
      runTrustedReference('longest-substring-no-repeat', { s: '' }),
    ).toEqual({ length: 0, start: 0, end: -1 })
  })
})

describe('candidate validation statuses and summaries', () => {
  it('marks passed and failed candidate checks correctly', () => {
    const sample = getTestCaseById('find-an-element-sample')!
    const passed = validateCandidateAnswer({
      problemSlug: 'find-an-element',
      testCaseId: sample.id,
      candidate: 3,
    })
    const failed = validateCandidateAnswer({
      problemSlug: 'find-an-element',
      testCaseId: sample.id,
      candidate: 0,
    })

    expect(passed.status).toBe('passed')
    expect(failed.status).toBe('failed')
    expect(failed.expected).toBe(3)
    expect(failed.actual).toBe(0)
    expect(passed.executedSourceCode).toBe(false)
    expect(failed.executedSourceCode).toBe(false)
  })

  it('keeps unevaluated cases as not_run and computes summary counts', () => {
    const initial = createNotRunResults('find-an-element')
    expect(initial.every((result) => result.status === 'not_run')).toBe(true)

    const sample = getTestCaseById('find-an-element-sample')!
    const checked = validateCandidateAnswer({
      problemSlug: 'find-an-element',
      testCaseId: sample.id,
      candidate: 3,
    })
    const merged = applyCandidateResult(initial, checked)
    const summary = summarizeValidationResults(merged)

    expect(summary.passed).toBe(1)
    expect(summary.failed).toBe(0)
    expect(summary.notRun).toBe(initial.length - 1)
    expect(summary.total).toBe(initial.length)
  })

  it('reset clears evaluated statuses back to not_run', () => {
    const initial = createNotRunResults('valid-anagram')
    const caseId = getTestCaseById('valid-anagram-sample')!.id
    const merged = applyCandidateResult(
      initial,
      validateCandidateAnswer({
        problemSlug: 'valid-anagram',
        testCaseId: caseId,
        candidate: false,
      }),
    )
    expect(summarizeValidationResults(merged).failed).toBe(1)

    const reset = resetValidationResults(merged)
    expect(reset.every((result) => result.status === 'not_run')).toBe(true)
    expect(summarizeValidationResults(reset).notRun).toBe(reset.length)
  })

  it('rejects candidate answers for exploration-only and unknown cases', () => {
    const exploration = validateCandidateAnswer({
      problemSlug: 'group-anagrams',
      testCaseId: 'group-anagrams-sample',
      candidate: [],
    })
    expect(exploration.status).toBe('invalid_input')
    expect(exploration.validationMode).toBe('exploration_only')

    const missing = validateCandidateAnswer({
      problemSlug: 'find-an-element',
      testCaseId: 'does-not-exist',
      candidate: 1,
    })
    expect(missing.status).toBe('invalid_input')
  })
})

describe('support matrix and lesson links', () => {
  it('supports check-example-answer for the curated subset only', () => {
    const checkSlugs = listCheckExampleAnswerSlugs()
    expect(checkSlugs).toContain('find-an-element')
    expect(checkSlugs).toContain('valid-anagram')
    expect(checkSlugs).not.toContain('group-anagrams')

    expect(getProblemValidationSupport('group-anagrams').candidateMode).toBe(
      'exploration_only',
    )
    expect(listUnsupportedValidationSlugs()).toEqual([])
  })

  it('keeps related lesson links valid for every practice problem', () => {
    for (const problem of practiceProblems) {
      expect(
        practiceRelatedLessonExists(problem),
        `${problem.slug} → ${problem.relatedLessonSlug}`,
      ).toBe(true)
      expect(problem.relatedLessonHref).toBe(
        `/learn/${problem.relatedLessonSlug}`,
      )
    }
  })

  it('never claims arbitrary source code was executed', () => {
    const candidate = validateCandidateAnswer({
      problemSlug: 'two-sum-sorted',
      testCaseId: 'two-sum-sorted-sample',
      candidate: [0, 6],
    })
    const reference = validateWithTrustedReference({
      problemSlug: 'two-sum-sorted',
    })

    expect(candidate.executedSourceCode).toBe(false)
    expect(resultsNeverClaimSourceExecution(reference)).toBe(true)
    expect(candidate.validationMode).not.toBe('unsupported')
    expect(
      reference.every(
        (result) => result.validationMode === 'trusted_reference',
      ),
    ).toBe(true)
  })
})
