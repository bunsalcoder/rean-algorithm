import { valuesEqual } from './compare'
import { formatComparableValue } from './formatValue'
import { runTrustedReference } from './reference'
import { getProblemValidationSupport } from './support'
import { getTestCaseById, getTestCasesForProblem } from './testCases'
import type {
  CaseValidationResult,
  PracticeComparableValue,
  PracticeTestCase,
  ValidateCandidateOptions,
  ValidateReferenceOptions,
  ValidationSummary,
} from './types'

function compareOptionsForCase(testCase: PracticeTestCase) {
  return {
    orderIndependent: testCase.orderIndependent === true,
    groupAnagrams: testCase.problemSlug === 'group-anagrams',
  }
}

function notRunResult(
  testCaseId: string,
  mode: CaseValidationResult['validationMode'],
): CaseValidationResult {
  return {
    testCaseId,
    status: 'not_run',
    executedSourceCode: false,
    validationMode: mode,
    message: 'This case was not evaluated.',
  }
}

function createInitialResults(
  cases: readonly PracticeTestCase[],
  mode: CaseValidationResult['validationMode'],
): CaseValidationResult[] {
  return cases.map((testCase) => notRunResult(testCase.id, mode))
}

/**
 * Compare a structured candidate answer against one predefined test case.
 * Does not execute learner source code.
 */
export function validateCandidateAnswer(
  options: ValidateCandidateOptions,
): CaseValidationResult {
  const support = getProblemValidationSupport(options.problemSlug)

  if (support.candidateMode === 'unsupported') {
    return {
      testCaseId: options.testCaseId,
      status: 'invalid_input',
      executedSourceCode: false,
      validationMode: 'unsupported',
      message: 'Validation is not available for this problem.',
    }
  }

  if (support.candidateMode === 'exploration_only') {
    return {
      testCaseId: options.testCaseId,
      status: 'invalid_input',
      executedSourceCode: false,
      validationMode: 'exploration_only',
      message:
        'This problem supports reference exploration only — structured candidate answers are not accepted.',
    }
  }

  const testCase = getTestCaseById(options.testCaseId)

  if (!testCase || testCase.problemSlug !== options.problemSlug) {
    return {
      testCaseId: options.testCaseId,
      status: 'invalid_input',
      executedSourceCode: false,
      validationMode: 'check_example_answer',
      message: 'Unknown test case for this problem.',
    }
  }

  const passed = valuesEqual(
    options.candidate,
    testCase.expected,
    compareOptionsForCase(testCase),
  )

  if (passed) {
    return {
      testCaseId: testCase.id,
      status: 'passed',
      expected: testCase.expected,
      actual: options.candidate,
      executedSourceCode: false,
      validationMode: 'check_example_answer',
      message: 'Structured answer matches the expected output.',
      feedback: testCase.feedback,
    }
  }

  return {
    testCaseId: testCase.id,
    status: 'failed',
    expected: testCase.expected,
    actual: options.candidate,
    executedSourceCode: false,
    validationMode: 'check_example_answer',
    message: `Expected ${formatComparableValue(testCase.expected)}, got ${formatComparableValue(options.candidate)}.`,
    feedback: testCase.feedback ?? support.conceptHint,
  }
}

/**
 * Apply a candidate check onto a full result list without fabricating other statuses.
 * Unevaluated cases remain `not_run`.
 */
export function applyCandidateResult(
  previous: readonly CaseValidationResult[],
  next: CaseValidationResult,
): CaseValidationResult[] {
  if (previous.length === 0) {
    return [next]
  }

  return previous.map((result) =>
    result.testCaseId === next.testCaseId ? next : result,
  )
}

/**
 * Run trusted reference implementations against predefined expected outputs.
 * Labels results as trusted_reference — never as learner code execution.
 */
export function validateWithTrustedReference(
  options: ValidateReferenceOptions,
): CaseValidationResult[] {
  const support = getProblemValidationSupport(options.problemSlug)

  if (!support.referenceSupported) {
    return [
      {
        testCaseId: '*',
        status: 'invalid_input',
        executedSourceCode: false,
        validationMode: 'unsupported',
        message: 'Trusted reference validation is not available for this problem.',
      },
    ]
  }

  const allCases = getTestCasesForProblem(options.problemSlug)
  const selectedIds = options.testCaseIds
    ? new Set(options.testCaseIds)
    : null
  const cases = selectedIds
    ? allCases.filter((testCase) => selectedIds.has(testCase.id))
    : allCases

  if (cases.length === 0) {
    return [
      {
        testCaseId: '*',
        status: 'invalid_input',
        executedSourceCode: false,
        validationMode: 'trusted_reference',
        message: 'No test cases were selected for reference validation.',
      },
    ]
  }

  const results = createInitialResults(allCases, 'trusted_reference')

  for (const testCase of cases) {
    try {
      const actual = runTrustedReference(testCase.problemSlug, testCase.input)
      const passed = valuesEqual(
        actual,
        testCase.expected,
        compareOptionsForCase(testCase),
      )

      const next: CaseValidationResult = passed
        ? {
            testCaseId: testCase.id,
            status: 'passed',
            expected: testCase.expected,
            actual,
            executedSourceCode: false,
            validationMode: 'trusted_reference',
            message:
              'Trusted reference output matches the expected result for this case.',
            feedback: testCase.feedback,
          }
        : {
            testCaseId: testCase.id,
            status: 'failed',
            expected: testCase.expected,
            actual,
            executedSourceCode: false,
            validationMode: 'trusted_reference',
            message: `Trusted reference produced ${formatComparableValue(actual)}, expected ${formatComparableValue(testCase.expected)}.`,
            feedback: testCase.feedback ?? support.conceptHint,
          }

      const index = results.findIndex(
        (result) => result.testCaseId === testCase.id,
      )
      if (index >= 0) {
        results[index] = next
      } else {
        results.push(next)
      }
    } catch (error) {
      const index = results.findIndex(
        (result) => result.testCaseId === testCase.id,
      )
      const next: CaseValidationResult = {
        testCaseId: testCase.id,
        status: 'invalid_input',
        expected: testCase.expected,
        executedSourceCode: false,
        validationMode: 'trusted_reference',
        message:
          error instanceof Error
            ? error.message
            : 'Trusted reference could not run for this case.',
      }
      if (index >= 0) {
        results[index] = next
      } else {
        results.push(next)
      }
    }
  }

  return results
}

/** Build a fresh not_run result list for a problem. */
export function createNotRunResults(
  problemSlug: string,
): CaseValidationResult[] {
  const support = getProblemValidationSupport(problemSlug)
  const mode =
    support.candidateMode === 'check_example_answer'
      ? 'check_example_answer'
      : support.candidateMode === 'exploration_only'
        ? 'exploration_only'
        : 'unsupported'

  return createInitialResults(getTestCasesForProblem(problemSlug), mode)
}

/** Reset all results to not_run without inventing pass/fail data. */
export function resetValidationResults(
  previous: readonly CaseValidationResult[],
): CaseValidationResult[] {
  return previous.map((result) =>
    notRunResult(result.testCaseId, result.validationMode),
  )
}

export function summarizeValidationResults(
  results: readonly CaseValidationResult[],
): ValidationSummary {
  const summary: ValidationSummary = {
    passed: 0,
    failed: 0,
    notRun: 0,
    invalidInput: 0,
    total: results.length,
  }

  for (const result of results) {
    switch (result.status) {
      case 'passed':
        summary.passed += 1
        break
      case 'failed':
        summary.failed += 1
        break
      case 'not_run':
        summary.notRun += 1
        break
      case 'invalid_input':
        summary.invalidInput += 1
        break
      default: {
        const _exhaustive: never = result.status
        void _exhaustive
      }
    }
  }

  return summary
}

/** True when every result explicitly denies source-code execution. */
export function resultsNeverClaimSourceExecution(
  results: readonly CaseValidationResult[],
): boolean {
  return results.every((result) => result.executedSourceCode === false)
}

export function getFailedResults(
  results: readonly CaseValidationResult[],
): CaseValidationResult[] {
  return results.filter((result) => result.status === 'failed')
}

export type { PracticeComparableValue }
