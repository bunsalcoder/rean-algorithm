import { Link } from 'react-router-dom'
import {
  SearchingAlgorithmPairComparison,
  SearchingComparisonHero,
  SearchingComparisonTable,
  SearchingComplexityComparison,
  SearchingRequirementsMatrix,
  SearchingStrategyCards,
  SearchingStrategyDemo,
} from '../components/searching'
import { Badge, Card, Container, Section } from '../components/ui'
import {
  SEARCHING_COMPARISON_DEMO_ARRAY,
  searchingComparisonAlgorithms,
  searchingComparisonLearningOrder,
  searchingComplexityExplainers,
  searchingDecisionCards,
  searchingMisconceptions,
} from '../data/algorithms/searching-comparison'
import { useInView } from '../hooks/useInView'
import { cn } from '../lib/cn'

const INTRO_STRATEGIES = [
  {
    name: 'Linear Search',
    summary: 'Check elements one by one.',
  },
  {
    name: 'Binary Search',
    summary: 'Repeatedly divide a sorted search range in half.',
  },
  {
    name: 'Jump Search',
    summary: 'Jump through blocks and then scan the relevant block.',
  },
  {
    name: 'Interpolation Search',
    summary: 'Estimate where the target should be based on its value.',
  },
  {
    name: 'Exponential Search',
    summary: 'Expand the search boundary exponentially, then use Binary Search.',
  },
] as const

const UNIFORM_ARRAY = SEARCHING_COMPARISON_DEMO_ARRAY
const UNEVEN_ARRAY = [1, 2, 3, 4, 5, 100, 500, 1000, 5000, 10000] as const

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

export function SearchingComparisonPage() {
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
                to="/algorithms/searching"
                className="transition-theme hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Searching Algorithms
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-foreground">Comparison</li>
          </ol>
        </nav>

        <header
          className="mt-6 section-reveal-item sm:mt-8"
          style={{ transitionDelay: '60ms' }}
        >
          <div className="max-w-3xl">
            <p className="text-label text-primary">SEARCHING ALGORITHMS</p>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              Searching Algorithms Comparison
            </p>
            <h1 className="mt-2 text-foreground">
              Choose the Right Search Strategy
            </h1>
            <p className="mt-3 text-body text-muted-foreground">
              Compare different search strategies and understand when each
              approach makes sense. Different searching algorithms make
              different assumptions about the data. Compare their strategies,
              complexity, and requirements to understand when each approach is
              useful.
            </p>
          </div>

          <div className="mt-6 max-w-4xl">
            <SearchingComparisonHero />
          </div>
        </header>

        <section
          className="mt-10 section-reveal-item sm:mt-12"
          style={{ transitionDelay: '100ms' }}
          aria-labelledby="intro-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">INTRODUCTION</p>
            <h2
              id="intro-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              What Searching Means
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground sm:text-body">
              Searching means finding a target value inside a collection of
              data. Different algorithms approach the problem differently.
            </p>
          </div>

          <Card className="p-5 sm:p-6 hover:border-primary/25">
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {INTRO_STRATEGIES.map((item) => (
                <li
                  key={item.name}
                  className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/25"
                >
                  <p className="text-sm font-medium text-foreground">
                    {item.name}
                  </p>
                  <p className="mt-1.5 text-body-sm text-muted-foreground">
                    {item.summary}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <section
          className="mt-10 section-reveal-item sm:mt-12"
          style={{ transitionDelay: '140ms' }}
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
              Review documented complexity and requirements side by side. This
              table presents information — it does not rank algorithms.
            </p>
          </div>

          <SearchingComparisonTable />

          <p className="mt-3 text-xs text-muted-foreground sm:hidden">
            Scroll horizontally to see every column on smaller screens.
          </p>
          <p className="mt-3 text-body-sm text-muted-foreground">
            * Interpolation Search&apos;s O(log log n) average/typical case
            assumes a suitable value distribution. Its worst case is O(n).
          </p>
        </section>

        <section
          className="mt-10 section-reveal-item sm:mt-12"
          style={{ transitionDelay: '180ms' }}
          aria-labelledby="complexity-chart-heading"
        >
          <h2 id="complexity-chart-heading" className="sr-only">
            Complexity visualization
          </h2>
          <SearchingComplexityComparison />
        </section>

        <section
          className="mt-10 section-reveal-item sm:mt-12"
          style={{ transitionDelay: '220ms' }}
          aria-labelledby="strategy-demo-heading"
        >
          <h2 id="strategy-demo-heading" className="sr-only">
            Interactive search strategy demo
          </h2>
          <SearchingStrategyDemo />
        </section>

        <section
          className="mt-10 section-reveal-item sm:mt-12"
          style={{ transitionDelay: '260ms' }}
          aria-labelledby="pair-heading"
        >
          <h2 id="pair-heading" className="sr-only">
            Two algorithm comparison
          </h2>
          <SearchingAlgorithmPairComparison />
        </section>

        <section
          className="mt-10 section-reveal-item sm:mt-12"
          style={{ transitionDelay: '300ms' }}
          aria-labelledby="choose-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">DECISION MINDSET</p>
            <h2
              id="choose-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              How to Choose a Search Algorithm
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground sm:text-body">
              These cards suggest starting points. They are not absolute rules —
              consider your data and constraints.
            </p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {searchingDecisionCards.map((card, index) => (
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
                        {card.condition}
                      </p>
                      <p className="mt-1.5 text-body-sm text-muted-foreground">
                        {card.guidance}
                      </p>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="mt-10 section-reveal-item sm:mt-12"
          style={{ transitionDelay: '340ms' }}
          aria-labelledby="requirements-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">REQUIREMENTS</p>
            <h2
              id="requirements-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              Requirements Matrix
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground sm:text-body">
              Sorted order and numeric values are different constraints. Only
              some strategies need both.
            </p>
          </div>

          <SearchingRequirementsMatrix />
        </section>

        <section
          className="mt-10 section-reveal-item sm:mt-12"
          style={{ transitionDelay: '380ms' }}
          aria-labelledby="distribution-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">INTERPOLATION</p>
            <h2
              id="distribution-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              Why Data Distribution Matters
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground sm:text-body">
              Interpolation Search estimates a position from values. Distribution
              affects how useful that estimate can be.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5 hover:border-primary/25 sm:p-6">
              <p className="text-label text-primary">Roughly uniform</p>
              <p className="mt-3 font-mono text-sm text-foreground">
                [{UNIFORM_ARRAY.join(', ')}]
              </p>
              <p className="mt-3 text-body-sm text-muted-foreground">
                When values are roughly evenly distributed, the estimate can be
                useful because nearby indices tend to hold nearby values.
              </p>
            </Card>
            <Card className="p-5 hover:border-primary/25 sm:p-6">
              <p className="text-label text-primary">Highly uneven</p>
              <p className="mt-3 font-mono text-sm text-foreground">
                [{UNEVEN_ARRAY.join(', ')}]
              </p>
              <p className="mt-3 text-body-sm text-muted-foreground">
                When values are heavily uneven, the estimate may be poor. That
                does not mean every non-uniform dataset always becomes O(n) —
                but distribution still matters.
              </p>
            </Card>
          </div>
        </section>

        <section
          className="mt-10 section-reveal-item sm:mt-12"
          style={{ transitionDelay: '420ms' }}
          aria-labelledby="strategies-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">STRATEGIES</p>
            <h2
              id="strategies-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              Searching Strategies
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground sm:text-body">
              Five compact cards summarizing how each approach thinks about the
              search space.
            </p>
          </div>

          <SearchingStrategyCards />
        </section>

        <section
          className="mt-10 section-reveal-item sm:mt-12"
          style={{ transitionDelay: '460ms' }}
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
              An educational sequence for building intuition — not a progress or
              quiz system.
            </p>
          </div>

          <ol className="space-y-2">
            {searchingComparisonLearningOrder.map((item, index) => (
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
          style={{ transitionDelay: '500ms' }}
          aria-labelledby="complexity-explain-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">BIG O</p>
            <h2
              id="complexity-explain-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              Understanding the Complexity
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground sm:text-body">
              Keep these classes conceptual. They describe growth patterns, not
              measured runtimes on your machine.
            </p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {searchingComplexityExplainers.map((item) => (
              <li key={item.id}>
                <Card className="h-full p-4 hover:border-primary/25 sm:p-5">
                  <Badge variant="primary" className="font-mono text-[0.7rem]">
                    {item.label}
                  </Badge>
                  <p className="mt-3 text-body-sm text-muted-foreground">
                    {item.explanation}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="mt-10 section-reveal-item sm:mt-12"
          style={{ transitionDelay: '540ms' }}
          aria-labelledby="misconceptions-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">CLARITY</p>
            <h2
              id="misconceptions-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              Common Misconceptions
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground sm:text-body">
              Quick corrections for ideas that often show up when learning
              searching algorithms.
            </p>
          </div>

          <ol className="space-y-3">
            {searchingMisconceptions.map((item, index) => (
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
          style={{ transitionDelay: '580ms' }}
          aria-labelledby="lessons-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">CONTINUE LEARNING</p>
            <h2
              id="lessons-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              Open a Searching Lesson
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground sm:text-body">
              Dive into an interactive walkthrough for any algorithm in this
              comparison.
            </p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {searchingComparisonAlgorithms.map((algorithm) => (
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
                      {algorithm.average}
                    </Badge>
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
          style={{ transitionDelay: '620ms' }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              to="/learn/exponential-search"
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
                Exponential Search
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
                Next
                <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </span>
              <span className="text-sm font-medium text-foreground sm:text-base">
                Array &amp; String Algorithms
              </span>
            </Link>
          </div>

          <p className="mt-4 text-center text-body-sm text-muted-foreground">
            Current: Searching Comparison
          </p>

          <div className="mt-4 flex justify-center">
            <Link
              to="/algorithms/searching"
              className={cn(
                'inline-flex text-sm font-medium text-muted-foreground',
                'transition-theme hover:text-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            >
              ← Back to Searching Algorithms
            </Link>
          </div>
        </nav>
      </Container>
    </Section>
  )
}
