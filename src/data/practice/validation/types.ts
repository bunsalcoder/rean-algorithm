/**
 * Typed models for practice test cases and static answer validation.
 * Validation never executes learner-submitted source code.
 */

export type PracticeTestCaseKind = 'sample' | 'normal' | 'edge'

/** Values the comparator and validators understand. */
export type PracticeComparableValue =
  | null
  | boolean
  | number
  | string
  | PracticeComparableValue[]
  | { readonly [key: string]: PracticeComparableValue }

export type PracticeTestCaseInput = {
  readonly [key: string]: PracticeComparableValue
}

export type PracticeTestCase = {
  id: string
  problemSlug: string
  kind: PracticeTestCaseKind
  description: string
  input: PracticeTestCaseInput
  expected: PracticeComparableValue
  /** Optional learning note shown when this case fails. */
  feedback?: string
  /**
   * When true, top-level arrays compare as multisets (order ignored).
   * Nested group-anagram style results use a dedicated group comparator.
   */
  orderIndependent?: boolean
}

export type ValidationStatus =
  | 'passed'
  | 'failed'
  | 'not_run'
  | 'invalid_input'

/**
 * How this problem can be checked in the UI.
 * - check_example_answer: structured candidate vs expected
 * - trusted_reference: run lesson algorithm, compare to expected
 * - exploration_only: browse cases + optional reference check; no candidate input
 * - unsupported: no validation available
 */
export type ValidationMode =
  | 'check_example_answer'
  | 'trusted_reference'
  | 'exploration_only'
  | 'unsupported'

export type CandidateAnswerKind =
  | 'number'
  | 'boolean'
  | 'nullish_number'
  | 'number_array'
  | 'kadane_result'
  | 'longest_substring_result'
  | 'none'

export type ProblemValidationSupport = {
  slug: string
  /** Primary learner-facing mode for the Check Example Answer UI. */
  candidateMode: 'check_example_answer' | 'exploration_only' | 'unsupported'
  /** Whether trusted-reference checks are available for this problem. */
  referenceSupported: boolean
  answerKind: CandidateAnswerKind
  answerLabel: string
  answerPlaceholder: string
  conceptHint: string
}

export type CaseValidationResult = {
  testCaseId: string
  status: ValidationStatus
  expected?: PracticeComparableValue
  actual?: PracticeComparableValue
  message?: string
  feedback?: string
  /** Always false — this project does not execute learner source code. */
  executedSourceCode: false
  validationMode: ValidationMode
}

export type ValidationSummary = {
  passed: number
  failed: number
  notRun: number
  invalidInput: number
  total: number
}

export type ValidateCandidateOptions = {
  problemSlug: string
  testCaseId: string
  candidate: PracticeComparableValue
}

export type ValidateReferenceOptions = {
  problemSlug: string
  /** When omitted, all cases for the problem are evaluated. */
  testCaseIds?: readonly string[]
}
