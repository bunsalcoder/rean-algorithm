import { Link } from 'react-router-dom'
import {
  ArrayStringComparisonTable,
  ArrayStringComplexityExplorer,
  ArrayStringPatternSelector,
} from '../components/array-string'
import { LearningJourneyLinks } from '../components/learning'
import { Badge, Card, Container, Section } from '../components/ui'
import {
  arrayStringDecisionCards,
  arrayStringMisconceptions,
  getArrayStringComparisonBySlug,
  getImplementedArrayStringComparisons,
  getImplementedArrayStringLearningOrder,
} from '../data/algorithms/array-string-comparison'
import { useInView } from '../hooks/useInView'
import { cn } from '../lib/cn'

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

export function ArrayStringComparisonPage() {
  const { ref, isInView } = useInView<HTMLDivElement>({
    threshold: 0,
    rootMargin: '0px',
  })

  const algorithms = getImplementedArrayStringComparisons()
  const learningOrder = getImplementedArrayStringLearningOrder()

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
                to="/algorithms"
                className="transition-theme hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Algorithms
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                to="/algorithms/array-string"
                className="transition-theme hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Array &amp; String Algorithms
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-foreground">Comparison</li>
          </ol>
        </nav>

        <header
          className="mt-6 max-w-3xl section-reveal-item sm:mt-8"
          style={{ transitionDelay: '60ms' }}
        >
          <p className="text-label text-primary">ARRAY &amp; STRING</p>
          <h1 className="mt-2 text-foreground">
            Array &amp; String Algorithms Comparison
          </h1>
          <p className="mt-3 text-body text-muted-foreground">
            Understand common problem-solving patterns, compare their
            trade-offs, and learn how to choose the right approach.
          </p>
        </header>

        <section
          className="mt-10 section-reveal-item sm:mt-12"
          style={{ transitionDelay: '100ms' }}
          aria-labelledby="summary-table-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">OVERVIEW</p>
            <h2
              id="summary-table-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              Summary Comparison
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground sm:text-body">
              Side-by-side view of the {algorithms.length} implemented Array
              &amp; String lessons. Complexities describe the demonstrated
              implementations under their stated assumptions — not a ranking.
            </p>
          </div>

          <ArrayStringComparisonTable algorithms={algorithms} />

          <p className="mt-3 text-xs text-muted-foreground sm:hidden">
            Scroll horizontally to see every column on smaller screens.
          </p>
          <p className="mt-3 text-body-sm text-muted-foreground">
            Notes: Two Pointers needs sorted input for the O(n) two-sum pattern.
            Prefix Sum uses O(n) prep and O(1) per query. Hash-map times are
            expected under typical operations. Rotate Array&apos;s public API
            copies the input (O(n) space) while the reversal helper is O(1)
            auxiliary.
          </p>
        </section>

        <section
          className="mt-10 section-reveal-item sm:mt-12"
          style={{ transitionDelay: '140ms' }}
          aria-labelledby="complexity-explorer-heading"
        >
          <h2 id="complexity-explorer-heading" className="sr-only">
            Complexity explorer
          </h2>
          <ArrayStringComplexityExplorer algorithms={algorithms} />
        </section>

        <section
          className="mt-10 section-reveal-item sm:mt-12"
          style={{ transitionDelay: '180ms' }}
          aria-labelledby="choose-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">DECISION GUIDE</p>
            <h2
              id="choose-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              How to Choose the Right Pattern
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground sm:text-body">
              Use the problem clue as a starting point. Each card also names a
              limitation so the technique is not treated as universally optimal.
            </p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {arrayStringDecisionCards.map((card, index) => {
              const lesson = getArrayStringComparisonBySlug(card.lessonSlug)
              return (
                <li key={card.id}>
                  <Card className="h-full p-4 hover:border-primary/25 sm:p-5">
                    <div className="flex gap-3">
                      <span
                        className={cn(
                          'flex size-9 shrink-0 items-center justify-center rounded-lg',
                          'bg-primary-muted font-mono text-sm font-medium text-accent-foreground',
                        )}
                        aria-hidden="true"
                      >
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground sm:text-base">
                          {card.clue}
                        </p>
                        <p className="mt-1.5 text-body-sm text-muted-foreground">
                          {card.recommendation}
                        </p>
                        <p className="mt-2 text-body-sm text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Limitation:{' '}
                          </span>
                          {card.limitation}
                        </p>
                        {lesson ? (
                          <Link
                            to={lesson.lessonHref}
                            className={cn(
                              'mt-3 inline-flex text-sm font-medium text-primary',
                              'transition-theme hover:text-primary-hover',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            )}
                          >
                            Open {lesson.name} →
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </Card>
                </li>
              )
            })}
          </ul>
        </section>

        <section
          className="mt-10 section-reveal-item sm:mt-12"
          style={{ transitionDelay: '220ms' }}
          aria-labelledby="pattern-selector-heading"
        >
          <h2 id="pattern-selector-heading" className="sr-only">
            Interactive problem to pattern selector
          </h2>
          <ArrayStringPatternSelector />
        </section>

        <section
          className="mt-10 section-reveal-item sm:mt-12"
          style={{ transitionDelay: '260ms' }}
          aria-labelledby="misconceptions-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">TRADE-OFFS</p>
            <h2
              id="misconceptions-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              Trade-offs &amp; Common Misconceptions
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground sm:text-body">
              Quick corrections that keep complexity claims tied to assumptions.
            </p>
          </div>

          <ol className="space-y-3">
            {arrayStringMisconceptions.map((item, index) => (
              <li
                key={item.id}
                className={cn(
                  'rounded-xl border border-border bg-surface p-4 shadow-sm',
                  'transition-theme hover:border-primary/30',
                )}
              >
                <div className="flex gap-4">
                  <span
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-lg',
                      'bg-primary-muted font-mono text-sm font-medium text-accent-foreground',
                    )}
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground sm:text-base">
                      Myth: {item.claim}
                    </p>
                    <p className="mt-1.5 text-body-sm text-muted-foreground">
                      Correction: {item.correction}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section
          className="mt-10 section-reveal-item sm:mt-12"
          style={{ transitionDelay: '300ms' }}
          aria-labelledby="learning-order-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">ORDER</p>
            <h2
              id="learning-order-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              Recommended Learning Order
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground sm:text-body">
              A suggested sequence through implemented lessons only. Missing
              lessons are skipped automatically.
            </p>
          </div>

          <ol className="space-y-2">
            {learningOrder.map((item, index) => (
              <li key={item.id}>
                <Link
                  to={item.lessonHref}
                  className={cn(
                    'flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:gap-4',
                    'transition-theme hover:border-primary/30 hover:shadow-md',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-md',
                      'bg-primary font-mono text-xs font-medium text-primary-foreground',
                    )}
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-foreground">
                      {item.name}
                    </span>
                    <span className="mt-1 block text-body-sm text-muted-foreground">
                      {item.reason}
                    </span>
                  </span>
                  <span className="text-sm font-medium text-primary sm:shrink-0">
                    Open →
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section
          className="mt-10 section-reveal-item sm:mt-12"
          style={{ transitionDelay: '340ms' }}
          aria-labelledby="lessons-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">CONTINUE LEARNING</p>
            <h2
              id="lessons-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              Open an Array &amp; String Lesson
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground sm:text-body">
              Dive into an interactive walkthrough for any pattern in this
              comparison.
            </p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {algorithms.map((algorithm) => (
              <li key={algorithm.slug}>
                <Link
                  to={algorithm.lessonHref}
                  className={cn(
                    'flex h-full flex-col rounded-xl border border-border bg-surface p-4 shadow-sm',
                    'transition-theme hover:border-primary/30 hover:shadow-md',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {algorithm.name}
                    </span>
                    <Badge variant="muted" className="font-mono text-[0.65rem]">
                      {algorithm.timeComplexity}
                    </Badge>
                  </span>
                  <span className="mt-2 text-body-sm text-muted-foreground">
                    {algorithm.technique}
                  </span>
                  <span className="mt-3 text-sm font-medium text-primary">
                    Learn →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <nav
          aria-label="Comparison page navigation"
          className="mt-12 border-t border-border-subtle pt-8 section-reveal-item sm:mt-14 sm:pt-10"
          style={{ transitionDelay: '380ms' }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              to="/algorithms/searching/comparison"
              className={cn(
                'group flex flex-col gap-1 rounded-xl border border-border bg-surface p-4 shadow-sm',
                'transition-all duration-300 ease-out motion-reduce:transition-none',
                'hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            >
              <span className="inline-flex items-center gap-1.5 text-label text-primary">
                <ArrowLeftIcon className="size-3.5 transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none" />
                Previous
              </span>
              <span className="text-sm font-medium text-foreground sm:text-base">
                Searching Comparison
              </span>
            </Link>

            <Link
              to="/algorithms/array-string"
              className={cn(
                'group flex flex-col gap-1 rounded-xl border border-border bg-surface p-4 shadow-sm items-end text-right',
                'transition-all duration-300 ease-out motion-reduce:transition-none',
                'hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            >
              <span className="inline-flex items-center gap-1.5 text-label text-primary">
                Hub
                <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </span>
              <span className="text-sm font-medium text-foreground sm:text-base">
                Array &amp; String Algorithms
              </span>
            </Link>
          </div>

          <p className="mt-4 text-center text-body-sm text-muted-foreground">
            Current: Array &amp; String Comparison
          </p>

          <div className="mt-4 flex justify-center">
            <Link
              to="/algorithms/array-string"
              className={cn(
                'inline-flex text-sm font-medium text-muted-foreground',
                'transition-theme hover:text-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            >
              ← Back to Array &amp; String Algorithms
            </Link>
          </div>

          <div className="mt-6 flex justify-center">
            <LearningJourneyLinks compact />
          </div>
        </nav>
      </Container>
    </Section>
  )
}
