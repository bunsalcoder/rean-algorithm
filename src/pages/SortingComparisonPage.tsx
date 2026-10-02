import { Link } from 'react-router-dom'
import {
  AlgorithmPairComparison,
  AlgorithmSelector,
  ComplexityComparison,
  SortingComparisonTable,
} from '../components/sorting'
import { Badge, Card, Container, Section } from '../components/ui'
import {
  sortingComparisonAlgorithms,
  sortingDecisionQuestions,
} from '../data/algorithms/sorting-comparison'
import { useInView } from '../hooks/useInView'
import { cn } from '../lib/cn'

const TRADEOFF_FLOW = [
  { label: 'Input', detail: 'Size, order, and constraints' },
  { label: 'Algorithm Choice', detail: 'One of the documented strategies' },
  {
    label: 'Trade-offs',
    detail: 'Time, space, stability, in-place behavior, input characteristics',
  },
  { label: 'Implementation', detail: 'How the lesson or library realizes it' },
] as const

export function SortingComparisonPage() {
  const { ref, isInView } = useInView<HTMLDivElement>({
    threshold: 0,
    rootMargin: '0px',
  })

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
                to="/algorithms/sorting"
                className="transition-theme hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Sorting Algorithms
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
          <p className="text-label text-primary">SORTING ALGORITHMS</p>
          <h1 className="mt-2 text-foreground">
            Which Sorting Algorithm Should I Use?
          </h1>
          <p className="mt-3 text-body text-muted-foreground">
            Compare common sorting algorithms by time complexity, space usage,
            stability, and how they work. The goal is to understand the
            trade-offs rather than memorize a single &apos;best&apos; algorithm.
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
              Space values below describe algorithmic auxiliary space for the
              sorting procedure. Lesson wrappers that copy the input add separate
              implementation overhead — see each algorithm&apos;s detail card.
            </p>
          </div>

          <SortingComparisonTable />

          <p className="mt-3 text-xs text-muted-foreground sm:hidden">
            Scroll horizontally to see every column on smaller screens.
          </p>
        </section>

        <section
          className="mt-10 section-reveal-item sm:mt-12"
          style={{ transitionDelay: '140ms' }}
          aria-labelledby="complexity-chart-heading"
        >
          <h2 id="complexity-chart-heading" className="sr-only">
            Time complexity visualization
          </h2>
          <ComplexityComparison />
        </section>

        <section
          className="mt-10 section-reveal-item sm:mt-12"
          style={{ transitionDelay: '180ms' }}
          aria-labelledby="tradeoff-flow-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">CONCEPT</p>
            <h2
              id="tradeoff-flow-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              From Input to Implementation
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground sm:text-body">
              Sorting choices are a path of trade-offs, not a single universal
              answer.
            </p>
          </div>

          <Card className="p-5 sm:p-6 hover:border-primary/25">
            <ol className="flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-2">
              {TRADEOFF_FLOW.map((step, index) => (
                <li
                  key={step.label}
                  className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center"
                >
                  <div
                    className={cn(
                      'flex-1 rounded-xl border border-border bg-muted/40 p-4',
                      'dark:bg-muted/25 transition-theme',
                    )}
                  >
                    <p className="font-mono text-xs text-primary">
                      {String(index + 1).padStart(2, '0')}
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {step.label}
                    </p>
                    <p className="mt-1 text-body-sm text-muted-foreground">
                      {step.detail}
                    </p>
                  </div>
                  {index < TRADEOFF_FLOW.length - 1 ? (
                    <span
                      aria-hidden="true"
                      className="flex justify-center text-primary lg:px-1"
                    >
                      <span className="lg:hidden">↓</span>
                      <span className="hidden lg:inline">→</span>
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
            <p className="mt-4 text-body-sm text-muted-foreground">
              Trade-offs include time, space, stability, in-place behavior, and
              how the input is ordered — then an implementation makes those
              choices concrete.
            </p>
          </Card>
        </section>

        <section
          className="mt-10 section-reveal-item sm:mt-12"
          style={{ transitionDelay: '220ms' }}
          aria-labelledby="selector-heading"
        >
          <h2 id="selector-heading" className="sr-only">
            Individual algorithm comparison
          </h2>
          <AlgorithmSelector />
        </section>

        <section
          className="mt-10 section-reveal-item sm:mt-12"
          style={{ transitionDelay: '260ms' }}
          aria-labelledby="pair-heading"
        >
          <h2 id="pair-heading" className="sr-only">
            Two algorithm comparison
          </h2>
          <AlgorithmPairComparison />
        </section>

        <section
          className="mt-10 section-reveal-item sm:mt-12"
          style={{ transitionDelay: '300ms' }}
          aria-labelledby="thinking-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">DECISION MINDSET</p>
            <h2
              id="thinking-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              How to Think About Sorting Choices
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground sm:text-body">
              These questions help determine which trade-offs matter. They are
              not a ranking of algorithms.
            </p>
          </div>

          <ol className="space-y-3">
            {sortingDecisionQuestions.map((item, index) => (
              <li
                key={item.question}
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
                      {item.question}
                    </p>
                    <p className="mt-1.5 text-body-sm text-muted-foreground">
                      {item.guidance}
                    </p>
                  </div>
                </div>
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
              Open a Sorting Lesson
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground sm:text-body">
              Dive into an interactive walkthrough for any algorithm in this
              comparison.
            </p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sortingComparisonAlgorithms.map((algorithm) => (
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
                      {algorithm.averageTime}
                    </Badge>
                  </span>
                  <span className="mt-3 text-sm font-medium text-primary">
                    Learn →
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <Link
              to="/algorithms/sorting"
              className={cn(
                'inline-flex text-sm font-medium text-muted-foreground',
                'transition-theme hover:text-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            >
              ← Back to Sorting Algorithms
            </Link>
          </div>
        </section>
      </Container>
    </Section>
  )
}
