import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  PracticeDifficultyBadge,
  PracticeHints,
  PracticeSolutionPanel,
  PracticeTestCases,
} from '../components/practice'
import { Badge, Button, Card, Container, Section } from '../components/ui'
import { usePracticeCompletion } from '../context/PracticeCompletionContext'
import {
  getAdjacentPracticeProblems,
  getPracticeProblem,
} from '../data/practice'
import { useInView } from '../hooks/useInView'
import { cn } from '../lib/cn'

function PracticeProblemNotFound({ slug }: { slug?: string }) {
  return (
    <Section className="flex flex-1 items-center">
      <Container size="sm" className="text-center">
        <p className="text-label text-primary">404</p>
        <h1 className="mt-3 text-foreground">Practice problem not found</h1>
        <p className="mx-auto mt-4 max-w-md text-body text-muted-foreground">
          {slug
            ? `No practice problem matches “${slug}”. Check the URL or return to the practice library.`
            : 'This practice problem does not exist yet.'}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/practice"
            className={cn(
              'inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium',
              'bg-primary text-primary-foreground shadow-sm transition-theme',
              'hover:bg-primary-hover',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            Back to practice
          </Link>
          <Link
            to="/"
            className={cn(
              'inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium',
              'border border-border bg-surface text-foreground shadow-sm transition-theme',
              'hover:bg-muted',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            Go home
          </Link>
        </div>
      </Container>
    </Section>
  )
}

export function PracticeProblemPage() {
  const { slug } = useParams<{ slug: string }>()
  const problem = slug ? getPracticeProblem(slug) : undefined
  const { isCompleted, toggleCompleted, recordAnswerCheck, recordVisit } =
    usePracticeCompletion()
  const { ref, isInView } = useInView<HTMLDivElement>({
    threshold: 0,
    rootMargin: '0px',
  })

  useEffect(() => {
    if (slug && getPracticeProblem(slug)) {
      recordVisit(slug)
    }
  }, [slug, recordVisit])

  if (!problem) {
    return <PracticeProblemNotFound slug={slug} />
  }

  const completed = isCompleted(problem.slug)
  const { previous, next } = getAdjacentPracticeProblems(problem.slug)

  return (
    <Section className="relative overflow-hidden py-10 sm:py-12 lg:py-14">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 size-72 rounded-full bg-primary/10 blur-3xl dark:bg-primary/16" />
        <div className="absolute -right-20 top-40 size-64 rounded-full bg-primary/8 blur-3xl dark:bg-primary/12" />
      </div>

      <Container
        ref={ref}
        size="lg"
        className={cn(
          'relative section-reveal',
          isInView && 'section-reveal-visible',
        )}
      >
        <nav aria-label="Breadcrumb" className="section-reveal-item">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link
                to="/practice"
                className="transition-theme hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Practice
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-foreground">{problem.title}</li>
          </ol>
        </nav>

        <header
          className="mt-6 section-reveal-item sm:mt-8"
          style={{ transitionDelay: '60ms' }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <PracticeDifficultyBadge difficulty={problem.difficulty} />
            <Badge variant="muted">{problem.category}</Badge>
            {completed ? (
              <Badge variant="primary" aria-label="Completed this session">
                Completed this session
              </Badge>
            ) : null}
          </div>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 max-w-3xl">
              <h1 className="text-foreground">{problem.title}</h1>
              <p className="mt-4 whitespace-pre-wrap text-body text-muted-foreground">
                {problem.description}
              </p>
            </div>

            <Button
              type="button"
              variant={completed ? 'secondary' : 'primary'}
              className="shrink-0"
              onClick={() => toggleCompleted(problem.slug)}
              aria-pressed={completed}
            >
              {completed ? 'Mark Incomplete' : 'Mark Completed'}
            </Button>
          </div>

          <p className="mt-3 text-body-sm text-muted-foreground">
            Completion is tracked for this browser session only and is not saved
            permanently.
          </p>
        </header>

        <div className="mt-10 space-y-12 sm:mt-12 sm:space-y-14">
          <section
            className="section-reveal-item"
            style={{ transitionDelay: '100ms' }}
            aria-labelledby="practice-examples-heading"
          >
            <h2
              id="practice-examples-heading"
              className="text-xl font-medium text-foreground sm:text-2xl"
            >
              Examples
            </h2>
            <ul className="mt-4 space-y-3">
              {problem.examples.map((example, index) => (
                <li key={`example-${index}`}>
                  <Card className="space-y-2 p-4 hover:border-border hover:shadow-sm sm:p-5">
                    <p className="text-label text-primary">
                      Example {index + 1}
                    </p>
                    <p className="font-mono text-sm text-foreground break-words">
                      <span className="text-muted-foreground">Input:</span>{' '}
                      {example.input}
                    </p>
                    <p className="font-mono text-sm text-foreground break-words">
                      <span className="text-muted-foreground">Output:</span>{' '}
                      {example.output}
                    </p>
                    {example.explanation ? (
                      <p className="text-body-sm text-muted-foreground">
                        {example.explanation}
                      </p>
                    ) : null}
                  </Card>
                </li>
              ))}
            </ul>
          </section>

          <div className="section-reveal-item">
            <PracticeTestCases
              problem={problem}
              onCandidateAnswerCheck={recordAnswerCheck}
            />
          </div>

          <section
            className="section-reveal-item"
            aria-labelledby="practice-constraints-heading"
          >
            <h2
              id="practice-constraints-heading"
              className="text-xl font-medium text-foreground sm:text-2xl"
            >
              Constraints
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-body text-muted-foreground">
              {problem.constraints.map((constraint) => (
                <li key={constraint}>{constraint}</li>
              ))}
            </ul>
          </section>

          <div className="section-reveal-item">
            <PracticeHints hints={problem.hints} />
          </div>

          <section
            className="section-reveal-item"
            aria-labelledby="practice-approach-heading"
          >
            <h2
              id="practice-approach-heading"
              className="text-xl font-medium text-foreground sm:text-2xl"
            >
              Approach
            </h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-body text-muted-foreground">
              {problem.approach.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>

          <section
            className="section-reveal-item"
            aria-labelledby="practice-complexity-heading"
          >
            <h2
              id="practice-complexity-heading"
              className="text-xl font-medium text-foreground sm:text-2xl"
            >
              Complexity
            </h2>
            <Card className="mt-4 space-y-3 p-5 hover:border-border hover:shadow-sm sm:p-6">
              <p className="text-body text-foreground">
                <span className="font-medium">Time:</span>{' '}
                {problem.complexity.time}
              </p>
              <p className="text-body text-foreground">
                <span className="font-medium">Auxiliary space:</span>{' '}
                {problem.complexity.space}
              </p>
              {problem.complexity.notes && problem.complexity.notes.length > 0 ? (
                <ul className="list-disc space-y-1 pl-5 text-body-sm text-muted-foreground">
                  {problem.complexity.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              ) : null}
            </Card>
          </section>

          <div className="section-reveal-item">
            <PracticeSolutionPanel problem={problem} />
          </div>

          <section
            className="section-reveal-item"
            aria-labelledby="practice-related-lesson-heading"
          >
            <h2
              id="practice-related-lesson-heading"
              className="text-xl font-medium text-foreground sm:text-2xl"
            >
              Related lesson
            </h2>
            <Card className="mt-4 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <p className="text-body-sm text-muted-foreground">
                Prefer a guided walkthrough before or after solving? Open the
                matching lesson.
              </p>
              <Link
                to={problem.relatedLessonHref}
                className={cn(
                  'inline-flex h-10 shrink-0 items-center justify-center rounded-md px-4 text-sm font-medium',
                  'bg-primary text-primary-foreground shadow-sm transition-theme',
                  'hover:bg-primary-hover',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                )}
              >
                Open lesson
              </Link>
            </Card>
          </section>

          <nav
            className="section-reveal-item"
            aria-label="Practice problem navigation"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              {previous ? (
                <Link
                  to={`/practice/${previous.slug}`}
                  className={cn(
                    'inline-flex min-w-0 items-center gap-2 rounded-md border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground shadow-sm',
                    'transition-theme hover:border-primary/30 hover:bg-muted',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  )}
                >
                  <span aria-hidden="true">←</span>
                  <span className="min-w-0 truncate">{previous.title}</span>
                </Link>
              ) : (
                <span />
              )}

              {next ? (
                <Link
                  to={`/practice/${next.slug}`}
                  className={cn(
                    'inline-flex min-w-0 items-center justify-end gap-2 rounded-md border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground shadow-sm sm:ml-auto',
                    'transition-theme hover:border-primary/30 hover:bg-muted',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  )}
                >
                  <span className="min-w-0 truncate">{next.title}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-4">
              <Link
                to="/practice"
                className="text-sm font-medium text-primary transition-theme hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                ← Back to practice library
              </Link>
              <Link
                to="/practice/dashboard"
                className="text-sm font-medium text-primary transition-theme hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Learning dashboard
              </Link>
            </div>
          </nav>
        </div>
      </Container>
    </Section>
  )
}
