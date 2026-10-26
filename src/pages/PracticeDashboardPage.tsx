import { Link } from 'react-router-dom'
import { PracticeDifficultyBadge } from '../components/practice'
import { Badge, Button, Card, Container, Section } from '../components/ui'
import { usePracticeCompletion } from '../context/PracticeCompletionContext'
import {
  formatActivityLabel,
  getPracticeSessionSummary,
  getTopicProgressOverview,
  getValidationAvailability,
  isValidationSupported,
  practiceProblems,
  recommendNextPracticeProblem,
} from '../data/practice'
import {
  getRecentPracticeSlugFromActivity,
  recommendNextLearningAction,
} from '../data/recommendLearning'
import { useInView } from '../hooks/useInView'
import { cn } from '../lib/cn'

function learningRecommendationKindLabel(
  kind:
    | 'start_lesson'
    | 'continue_lesson'
    | 'practice_problem'
    | 'review_prerequisite'
    | 'explore_comparison',
): string {
  switch (kind) {
    case 'start_lesson':
      return 'Start a lesson'
    case 'continue_lesson':
      return 'Continue a lesson'
    case 'practice_problem':
      return 'Practice a problem'
    case 'review_prerequisite':
      return 'Review a prerequisite'
    case 'explore_comparison':
      return 'Explore a comparison'
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}

function formatEventTime(at: number): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(at))
  } catch {
    return new Date(at).toLocaleTimeString()
  }
}

export function PracticeDashboardPage() {
  const {
    completedSlugs,
    attemptedSlugs,
    recentActivity,
    resetSession,
  } = usePracticeCompletion()
  const { ref, isInView } = useInView<HTMLDivElement>({
    threshold: 0,
    rootMargin: '0px',
  })

  const summary = getPracticeSessionSummary(practiceProblems, {
    completedSlugs,
    attemptedSlugs,
  })
  const topics = getTopicProgressOverview(practiceProblems, completedSlugs)
  const recommendation = recommendNextPracticeProblem(
    practiceProblems,
    completedSlugs,
  )
  const learningRecommendation = recommendNextLearningAction({
    completedPracticeSlugs: completedSlugs,
    recentPracticeSlug: getRecentPracticeSlugFromActivity(recentActivity),
  })
  const validationBySlug = getValidationAvailability(practiceProblems)
  const completedSessionItems = practiceProblems.filter((problem) =>
    completedSlugs.has(problem.slug),
  )

  const handleResetSession = () => {
    const confirmed = window.confirm(
      'Reset session progress?\n\nThis clears only your current session’s learning progress (completions, answer checks, and recent activity). Lesson content and algorithm data are not deleted.',
    )
    if (confirmed) {
      resetSession()
    }
  }

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
                to="/"
                className="transition-theme hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                to="/practice"
                className="transition-theme hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Practice
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-foreground">Dashboard</li>
          </ol>
        </nav>

        <header
          className="mt-6 flex flex-col gap-4 sm:mt-8 lg:flex-row lg:items-end lg:justify-between"
        >
          <div
            className="max-w-3xl section-reveal-item"
            style={{ transitionDelay: '60ms' }}
          >
            <p className="text-label text-primary">PRACTICE</p>
            <h1 className="mt-2 text-foreground">Your Learning Dashboard</h1>
            <p className="mt-4 text-body text-muted-foreground">
              Track your practice session, explore new topics, and choose what
              to learn next.
            </p>
            <p className="mt-3 text-body-sm text-muted-foreground">
              Progress here is session-only. Marking a problem complete is
              separate from checking a structured answer or verifying a trusted
              reference.
            </p>
          </div>

          <div
            className="flex flex-wrap gap-3 section-reveal-item"
            style={{ transitionDelay: '80ms' }}
          >
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
            <Button
              type="button"
              variant="secondary"
              onClick={handleResetSession}
              aria-describedby="session-reset-help"
            >
              Reset session progress
            </Button>
          </div>
        </header>

        <p
          id="session-reset-help"
          className="mt-3 text-body-sm text-muted-foreground section-reveal-item"
          style={{ transitionDelay: '90ms' }}
        >
          Reset clears only this browser session’s practice progress — not
          lessons or algorithm content.
        </p>

        <section
          className="mt-8 section-reveal-item sm:mt-10"
          style={{ transitionDelay: '100ms' }}
          aria-labelledby="dashboard-summary-heading"
        >
          <h2
            id="dashboard-summary-heading"
            className="text-xl font-medium text-foreground sm:text-2xl"
          >
            Session summary
          </h2>

          {!summary.hasSessionActivity ? (
            <Card
              className="mt-4 space-y-3 p-5 sm:p-6"
              role="status"
            >
              <p className="text-base font-medium text-foreground">
                No practice activity in this session yet
              </p>
              <p className="text-body-sm text-muted-foreground">
                Open a problem, check a structured answer where available, or
                mark a problem complete to see live counts here. There are{' '}
                {summary.totalProblems} problems in the practice collection.
              </p>
              <Link
                to="/practice"
                className="inline-flex text-sm font-medium text-primary transition-theme hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Browse the practice library
              </Link>
            </Card>
          ) : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="Problems completed"
                value={summary.completedCount}
                hint={`of ${summary.totalProblems} available`}
              />
              <SummaryCard
                label="Problems attempted"
                value={summary.attemptedCount}
                hint="Structured answer checks only"
              />
              <SummaryCard
                label="Topics explored"
                value={summary.topicsExploredCount}
                hint="From completed problems"
              />
              <SummaryCard
                label="Problems remaining"
                value={summary.remainingCount}
                hint="Not marked complete yet"
              />
            </ul>
          )}
        </section>

        <section
          className="mt-10 section-reveal-item sm:mt-12"
          style={{ transitionDelay: '110ms' }}
          aria-labelledby="dashboard-learning-path-heading"
        >
          <h2
            id="dashboard-learning-path-heading"
            className="text-xl font-medium text-foreground sm:text-2xl"
          >
            Learning path
          </h2>
          <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground">
            Recommendation based on available content and current-session
            activity — not performance analysis or AI personalization.
          </p>

          {learningRecommendation.status === 'empty' ? (
            <Card className="mt-4 space-y-2 p-5 sm:p-6" role="status">
              <p className="text-body text-foreground">
                {learningRecommendation.reason}
              </p>
            </Card>
          ) : (
            <Card className="mt-4 space-y-4 p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary">
                  {learningRecommendationKindLabel(learningRecommendation.kind)}
                </Badge>
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground">
                  {learningRecommendation.title}
                </h3>
                <p className="mt-2 text-body-sm text-muted-foreground">
                  {learningRecommendation.reason}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to={learningRecommendation.href}
                  className={cn(
                    'inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium',
                    'bg-primary text-primary-foreground shadow-sm transition-theme',
                    'hover:bg-primary-hover',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  )}
                >
                  Continue
                </Link>
                <Link
                  to="/roadmap"
                  className={cn(
                    'inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium',
                    'border border-border bg-surface text-foreground shadow-sm transition-theme',
                    'hover:bg-muted',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  )}
                >
                  Full roadmap
                </Link>
              </div>

              {completedSessionItems.length > 0 ? (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Completed this session
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {completedSessionItems.slice(0, 6).map((problem) => (
                      <li key={problem.slug}>
                        <Link
                          to={`/practice/${problem.slug}`}
                          className="inline-flex rounded-md border border-border-subtle bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground transition-theme hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {problem.title}
                        </Link>
                      </li>
                    ))}
                    {completedSessionItems.length > 6 ? (
                      <li className="px-1 py-1 text-xs text-muted-foreground">
                        +{completedSessionItems.length - 6} more
                      </li>
                    ) : null}
                  </ul>
                </div>
              ) : (
                <p className="text-body-sm text-muted-foreground">
                  No practice problems marked complete in this session yet.
                </p>
              )}
            </Card>
          )}
        </section>

        <section
          className="mt-10 section-reveal-item sm:mt-12"
          style={{ transitionDelay: '120ms' }}
          aria-labelledby="dashboard-continue-heading"
        >
          <h2
            id="dashboard-continue-heading"
            className="text-xl font-medium text-foreground sm:text-2xl"
          >
            Continue practice
          </h2>

          {recommendation.status === 'empty' ? (
            <Card className="mt-4 space-y-2 p-5 sm:p-6" role="status">
              <p className="text-body text-foreground">{recommendation.reason}</p>
            </Card>
          ) : recommendation.status === 'all_completed' ? (
            <Card className="mt-4 space-y-4 p-5 sm:p-6" role="status">
              <p className="text-base font-medium text-foreground">
                Session collection complete
              </p>
              <p className="text-body-sm text-muted-foreground">
                {recommendation.reason}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/algorithms/array-string"
                  className={cn(
                    'inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium',
                    'bg-primary text-primary-foreground shadow-sm transition-theme',
                    'hover:bg-primary-hover',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  )}
                >
                  Revisit Array &amp; String lessons
                </Link>
                <Link
                  to="/algorithms/searching"
                  className={cn(
                    'inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium',
                    'border border-border bg-surface text-foreground shadow-sm transition-theme',
                    'hover:bg-muted',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  )}
                >
                  Explore Searching hub
                </Link>
              </div>
            </Card>
          ) : (
            <Card className="mt-4 space-y-4 p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <PracticeDifficultyBadge
                  difficulty={recommendation.problem.difficulty}
                />
                <Badge variant="muted">{recommendation.problem.category}</Badge>
                {validationBySlug.get(recommendation.problem.slug) ? (
                  <Badge variant="primary">Validation available</Badge>
                ) : (
                  <Badge variant="muted">Validation not available yet</Badge>
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground">
                  {recommendation.problem.title}
                </h3>
                <p className="mt-2 text-body-sm text-muted-foreground">
                  {recommendation.reason}
                </p>
                <p className="mt-2 text-body-sm text-muted-foreground">
                  This suggestion uses your session completions and the practice
                  library order. It does not analyze answer performance.
                </p>
              </div>
              <Link
                to={recommendation.href}
                className={cn(
                  'inline-flex h-10 w-fit items-center justify-center rounded-md px-4 text-sm font-medium',
                  'bg-primary text-primary-foreground shadow-sm transition-theme',
                  'hover:bg-primary-hover',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                )}
              >
                Open recommended problem
              </Link>
            </Card>
          )}
        </section>

        <section
          className="mt-10 section-reveal-item sm:mt-12"
          style={{ transitionDelay: '140ms' }}
          aria-labelledby="dashboard-topics-heading"
        >
          <h2
            id="dashboard-topics-heading"
            className="text-xl font-medium text-foreground sm:text-2xl"
          >
            Topic overview
          </h2>
          <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground">
            Counts reflect problems available in the practice library and
            completions marked during this session — not long-term mastery.
          </p>

          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {topics.map((topic) => (
              <li key={topic.category}>
                <Card className="flex h-full flex-col gap-3 p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="text-base font-medium text-foreground">
                      {topic.category}
                    </h3>
                    <Badge variant="muted">
                      {topic.availableCount}{' '}
                      {topic.availableCount === 1 ? 'problem' : 'problems'}
                    </Badge>
                  </div>
                  <p className="text-body-sm text-muted-foreground">
                    {topic.completedCount} marked complete this session
                  </p>
                  {topic.sessionProgressRatio !== null &&
                  topic.availableCount > 0 ? (
                    <div>
                      <div
                        className="h-2 overflow-hidden rounded-full bg-muted"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={topic.availableCount}
                        aria-valuenow={topic.completedCount}
                        aria-label={`Session progress for ${topic.category}`}
                      >
                        <div
                          className="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none"
                          style={{
                            width: `${Math.round(topic.sessionProgressRatio * 100)}%`,
                          }}
                        />
                      </div>
                      <p className="mt-2 text-body-sm text-muted-foreground">
                        Session progress: {topic.completedCount} of{' '}
                        {topic.availableCount}
                      </p>
                    </div>
                  ) : null}
                  <Link
                    to={topic.exploreHref}
                    className="mt-auto inline-flex text-sm font-medium text-primary transition-theme hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Explore {topic.category} problems
                  </Link>
                </Card>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="mt-10 section-reveal-item sm:mt-12"
          style={{ transitionDelay: '160ms' }}
          aria-labelledby="dashboard-activity-heading"
        >
          <h2
            id="dashboard-activity-heading"
            className="text-xl font-medium text-foreground sm:text-2xl"
          >
            Recent activity
          </h2>
          <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground">
            Only events from this session are listed. Trusted-reference checks
            are not treated as learner attempts.
          </p>

          {recentActivity.length === 0 ? (
            <Card className="mt-4 space-y-2 p-5 sm:p-6" role="status">
              <p className="text-base font-medium text-foreground">
                No recent activity yet
              </p>
              <p className="text-body-sm text-muted-foreground">
                Activity appears when you open a problem, check a structured
                answer, or change completion status.
              </p>
            </Card>
          ) : (
            <ul className="mt-4 space-y-2">
              {recentActivity.map((event) => (
                <li key={event.id}>
                  <Card className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {formatActivityLabel(event.kind)}
                      </p>
                      <Link
                        to={`/practice/${event.problemSlug}`}
                        className="mt-1 inline-flex text-body-sm text-primary transition-theme hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {event.problemTitle}
                      </Link>
                      {event.kind === 'checked_answer' &&
                      isValidationSupported(event.problemSlug) ? (
                        <p className="mt-1 text-body-sm text-muted-foreground">
                          Structured answer check — not a claim that the problem
                          was solved.
                        </p>
                      ) : null}
                    </div>
                    <time
                      className="shrink-0 text-body-sm text-muted-foreground"
                      dateTime={new Date(event.at).toISOString()}
                    >
                      {formatEventTime(event.at)}
                    </time>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>
      </Container>
    </Section>
  )
}

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string
  value: number
  hint: string
}) {
  return (
    <li>
      <Card className="h-full space-y-1 p-4 sm:p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        <p className="text-body-sm text-muted-foreground">{hint}</p>
      </Card>
    </li>
  )
}
