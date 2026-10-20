import { useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import type { PracticeProblem } from '../../data/practice'
import {
  VALIDATION_MODE_LABEL,
  VALIDATION_MODE_LIMITATIONS,
  applyCandidateResult,
  createNotRunResults,
  filterTestCasesByKind,
  formatComparableValue,
  formatTestCaseInput,
  getFailedResults,
  getProblemValidationSupport,
  getTestCasesForProblem,
  parseCandidateAnswer,
  resetValidationResults,
  summarizeValidationResults,
  validateCandidateAnswer,
  validateWithTrustedReference,
  type CaseValidationResult,
  type PracticeTestCase,
  type PracticeTestCaseKind,
  type ValidationStatus,
} from '../../data/practice/validation'
import { cn } from '../../lib/cn'
import { Button, Card } from '../ui'

type PracticeTestCasesProps = {
  problem: PracticeProblem
  /** Fired only when the learner checks a structured candidate answer. */
  onCandidateAnswerCheck?: (problemSlug: string) => void
}

type KindFilter = PracticeTestCaseKind | 'all'

const KIND_FILTERS: { id: KindFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'sample', label: 'Sample' },
  { id: 'normal', label: 'Normal' },
  { id: 'edge', label: 'Edge' },
]

function statusLabel(status: ValidationStatus): string {
  switch (status) {
    case 'passed':
      return 'Passed'
    case 'failed':
      return 'Failed'
    case 'not_run':
      return 'Not run'
    case 'invalid_input':
      return 'Invalid input'
    default: {
      const _exhaustive: never = status
      return _exhaustive
    }
  }
}

function statusClassName(status: ValidationStatus): string {
  switch (status) {
    case 'passed':
      return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
    case 'failed':
      return 'border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-200'
    case 'invalid_input':
      return 'border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100'
    case 'not_run':
      return 'border-border bg-muted/50 text-muted-foreground'
    default: {
      const _exhaustive: never = status
      return _exhaustive
    }
  }
}

function resultForCase(
  results: readonly CaseValidationResult[],
  testCaseId: string,
): CaseValidationResult | undefined {
  return results.find((result) => result.testCaseId === testCaseId)
}

export function PracticeTestCases({
  problem,
  onCandidateAnswerCheck,
}: PracticeTestCasesProps) {
  const support = getProblemValidationSupport(problem.slug)
  const allCases = getTestCasesForProblem(problem.slug)
  const baseId = useId()

  const [kindFilter, setKindFilter] = useState<KindFilter>('all')
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(
    allCases[0]?.id ?? null,
  )
  const [answerText, setAnswerText] = useState('')
  const [inputError, setInputError] = useState<string | null>(null)
  const [results, setResults] = useState<CaseValidationResult[]>(() =>
    createNotRunResults(problem.slug),
  )

  const visibleCases = filterTestCasesByKind(allCases, kindFilter)
  const selectedCase =
    allCases.find((testCase) => testCase.id === selectedCaseId) ?? null
  const summary = summarizeValidationResults(results)
  const failed = getFailedResults(results)
  const canCheckCandidate = support.candidateMode === 'check_example_answer'
  const canRunReference = support.referenceSupported && allCases.length > 0

  useEffect(() => {
    setKindFilter('all')
    setAnswerText('')
    setInputError(null)
    setResults(createNotRunResults(problem.slug))
    const nextCases = getTestCasesForProblem(problem.slug)
    setSelectedCaseId(nextCases[0]?.id ?? null)
  }, [problem.slug])

  useEffect(() => {
    const filtered = filterTestCasesByKind(allCases, kindFilter)
    if (
      selectedCaseId &&
      !filtered.some((testCase) => testCase.id === selectedCaseId)
    ) {
      setSelectedCaseId(filtered[0]?.id ?? null)
    }
  }, [allCases, kindFilter, selectedCaseId])

  const handleCheckExampleAnswer = () => {
    if (!canCheckCandidate || !selectedCase) {
      return
    }

    const parsed = parseCandidateAnswer(answerText, support.answerKind)
    if (!parsed.ok) {
      setInputError(parsed.error)
      setResults((previous) =>
        applyCandidateResult(previous, {
          testCaseId: selectedCase.id,
          status: 'invalid_input',
          executedSourceCode: false,
          validationMode: 'check_example_answer',
          message: parsed.error,
        }),
      )
      onCandidateAnswerCheck?.(problem.slug)
      return
    }

    setInputError(null)
    const next = validateCandidateAnswer({
      problemSlug: problem.slug,
      testCaseId: selectedCase.id,
      candidate: parsed.value,
    })
    setResults((previous) => applyCandidateResult(previous, next))
    onCandidateAnswerCheck?.(problem.slug)
  }

  const handleTrustedReference = () => {
    if (!canRunReference) {
      return
    }

    setInputError(null)
    const ids = visibleCases.map((testCase) => testCase.id)
    const evaluated = validateWithTrustedReference({
      problemSlug: problem.slug,
      testCaseIds: ids,
    })

    setResults((previous) => {
      const byId = new Map(
        evaluated.map((result) => [result.testCaseId, result]),
      )
      const base =
        previous.length > 0
          ? previous
          : createNotRunResults(problem.slug)

      return base.map((result) => byId.get(result.testCaseId) ?? result)
    })
  }

  const handleReset = () => {
    setAnswerText('')
    setInputError(null)
    setResults(resetValidationResults(createNotRunResults(problem.slug)))
  }

  if (support.candidateMode === 'unsupported' && allCases.length === 0) {
    return (
      <section aria-labelledby={`${baseId}-heading`}>
        <h2
          id={`${baseId}-heading`}
          className="text-xl font-medium text-foreground sm:text-2xl"
        >
          Test Cases
        </h2>
        <Card className="mt-4 space-y-3 p-5 sm:p-6">
          <p className="text-body text-foreground">
            Validation is not available for this problem yet.
          </p>
          <p className="text-body-sm text-muted-foreground">
            You can still study the examples, hints, and solution panel. No
            automated pass/fail checks are fabricated here.
          </p>
        </Card>
      </section>
    )
  }

  return (
    <section aria-labelledby={`${baseId}-heading`}>
      <h2
        id={`${baseId}-heading`}
        className="text-xl font-medium text-foreground sm:text-2xl"
      >
        Test Cases
      </h2>

      <Card className="mt-4 space-y-3 border-primary/25 bg-primary/5 p-5 dark:bg-primary/10 sm:p-6">
        <p className="text-label text-primary">Validation mode</p>
        <p className="text-body font-medium text-foreground">
          {canCheckCandidate
            ? VALIDATION_MODE_LABEL
            : support.candidateMode === 'exploration_only'
              ? 'Trusted reference exploration — no structured candidate input'
              : 'Validation not available'}
        </p>
        <p className="text-body-sm text-muted-foreground">
          {VALIDATION_MODE_LIMITATIONS}
        </p>
        {support.candidateMode === 'exploration_only' ? (
          <p className="text-body-sm text-muted-foreground">
            For this problem you can browse cases and optionally verify expected
            outputs against the lesson’s trusted reference implementation. Group
            order is not unique, so free-form answer checking is not offered.
          </p>
        ) : null}
      </Card>

      <div
        className="mt-4 flex flex-wrap gap-2"
        role="tablist"
        aria-label="Filter test cases by kind"
      >
        {KIND_FILTERS.map((filter) => {
          const selected = kindFilter === filter.id
          return (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setKindFilter(filter.id)}
              className={cn(
                'inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium transition-theme',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                selected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-surface text-foreground hover:bg-muted',
              )}
            >
              {filter.label}
            </button>
          )
        })}
      </div>

      {visibleCases.length === 0 ? (
        <p className="mt-4 text-body-sm text-muted-foreground" role="status">
          No test cases match this filter.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {visibleCases.map((testCase) => (
            <TestCaseCard
              key={testCase.id}
              testCase={testCase}
              selected={selectedCaseId === testCase.id}
              result={resultForCase(results, testCase.id)}
              onSelect={() => setSelectedCaseId(testCase.id)}
            />
          ))}
        </ul>
      )}

      {canCheckCandidate ? (
        <Card className="mt-6 space-y-4 p-5 sm:p-6">
          <div>
            <h3 className="text-base font-medium text-foreground">
              Check example answer
            </h3>
            <p className="mt-1 text-body-sm text-muted-foreground">
              Enter a structured answer for the selected case. This compares your
              value to the expected output — it does not run source code.
            </p>
          </div>

          <p className="text-body-sm text-foreground">
            Selected case:{' '}
            <span className="font-medium">
              {selectedCase ? selectedCase.description : 'None'}
            </span>
          </p>

          <div>
            <label
              htmlFor={`${baseId}-answer`}
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              {support.answerLabel}
            </label>
            <input
              id={`${baseId}-answer`}
              type="text"
              value={answerText}
              onChange={(event) => {
                setAnswerText(event.target.value)
                setInputError(null)
              }}
              placeholder={support.answerPlaceholder}
              autoComplete="off"
              spellCheck={false}
              className={cn(
                'h-10 w-full rounded-md border border-border bg-surface px-3 font-mono text-sm text-foreground shadow-sm',
                'transition-theme',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
              aria-invalid={inputError ? true : undefined}
              aria-describedby={
                inputError ? `${baseId}-answer-error` : undefined
              }
            />
            {inputError ? (
              <p
                id={`${baseId}-answer-error`}
                className="mt-2 text-body-sm text-rose-700 dark:text-rose-300"
                role="alert"
              >
                {inputError}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={handleCheckExampleAnswer}
              disabled={!selectedCase}
            >
              Check example answer
            </Button>
            {canRunReference ? (
              <Button
                type="button"
                variant="secondary"
                onClick={handleTrustedReference}
              >
                Verify with trusted reference
              </Button>
            ) : null}
            <Button type="button" variant="ghost" onClick={handleReset}>
              Reset results
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="mt-6 space-y-4 p-5 sm:p-6">
          <div>
            <h3 className="text-base font-medium text-foreground">
              Explore with trusted reference
            </h3>
            <p className="mt-1 text-body-sm text-muted-foreground">
              Run the lesson’s pure TypeScript reference against the visible
              cases and compare to expected outputs. This is not your code
              running.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {canRunReference ? (
              <Button type="button" onClick={handleTrustedReference}>
                Verify with trusted reference
              </Button>
            ) : null}
            <Button type="button" variant="ghost" onClick={handleReset}>
              Reset results
            </Button>
          </div>
        </Card>
      )}

      <Card
        className="mt-6 space-y-4 p-5 sm:p-6"
        aria-live="polite"
        aria-atomic="true"
      >
        <h3 className="text-base font-medium text-foreground">Results summary</h3>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryStat label="Passed" value={summary.passed} />
          <SummaryStat label="Failed" value={summary.failed} />
          <SummaryStat label="Not run" value={summary.notRun} />
          <SummaryStat label="Invalid input" value={summary.invalidInput} />
        </dl>
        <p className="text-body-sm text-muted-foreground">
          Counts are computed from the current result statuses ({summary.total}{' '}
          cases). Cases marked Not run were not evaluated.
        </p>

        {failed.length > 0 ? (
          <div className="space-y-3 border-t border-border pt-4">
            <h4 className="text-sm font-medium text-foreground">
              Feedback for failed cases
            </h4>
            <ul className="space-y-3">
              {failed.map((result) => (
                <li
                  key={result.testCaseId}
                  className="rounded-lg border border-rose-500/30 bg-rose-500/5 px-3 py-3 text-body-sm"
                >
                  <p className="font-medium text-foreground">
                    {result.testCaseId}
                  </p>
                  {result.message ? (
                    <p className="mt-1 text-muted-foreground">{result.message}</p>
                  ) : null}
                  {result.expected !== undefined ? (
                    <p className="mt-1 font-mono text-foreground">
                      Expected: {formatComparableValue(result.expected)}
                    </p>
                  ) : null}
                  {result.actual !== undefined ? (
                    <p className="mt-1 font-mono text-foreground">
                      {result.validationMode === 'trusted_reference'
                        ? 'Trusted reference output: '
                        : 'Structured answer: '}
                      {formatComparableValue(result.actual)}
                    </p>
                  ) : null}
                  {result.feedback ? (
                    <p className="mt-2 text-muted-foreground">{result.feedback}</p>
                  ) : (
                    <p className="mt-2 text-muted-foreground">
                      {support.conceptHint}
                    </p>
                  )}
                  <p className="mt-2 text-muted-foreground">
                    This feedback describes the expected result for the case. It
                    does not assert why source code failed, because no learner
                    code was executed.
                  </p>
                  <Link
                    to={problem.relatedLessonHref}
                    className="mt-2 inline-flex text-sm font-medium text-primary transition-theme hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Review related lesson
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card>
    </section>
  )
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 dark:bg-muted/20">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-lg font-semibold text-foreground">{value}</dd>
    </div>
  )
}

function TestCaseCard({
  testCase,
  selected,
  result,
  onSelect,
}: {
  testCase: PracticeTestCase
  selected: boolean
  result?: CaseValidationResult
  onSelect: () => void
}) {
  const status = result?.status ?? 'not_run'

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={cn(
          'w-full rounded-xl border bg-surface p-4 text-left shadow-sm transition-theme sm:p-5',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          selected
            ? 'border-primary/50 ring-1 ring-primary/30'
            : 'border-border hover:border-primary/30 hover:bg-muted/40',
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-label text-primary">
            {testCase.kind.charAt(0).toUpperCase() + testCase.kind.slice(1)}
          </span>
          <span
            className={cn(
              'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
              statusClassName(status),
            )}
          >
            {statusLabel(status)}
          </span>
        </div>
        <p className="mt-2 text-body text-foreground">{testCase.description}</p>
        <p className="mt-2 break-words font-mono text-sm text-foreground">
          <span className="text-muted-foreground">Input:</span>{' '}
          {formatTestCaseInput(testCase.input)}
        </p>
        <p className="mt-1 break-words font-mono text-sm text-foreground">
          <span className="text-muted-foreground">Expected:</span>{' '}
          {formatComparableValue(testCase.expected)}
        </p>
        {result?.message && status !== 'not_run' ? (
          <p className="mt-2 text-body-sm text-muted-foreground" role="status">
            {result.message}
          </p>
        ) : null}
      </button>
    </li>
  )
}
