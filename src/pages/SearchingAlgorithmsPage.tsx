import { Link } from 'react-router-dom'
import {
  SearchComparison,
  SearchConcepts,
  SearchingAlgorithmCard,
  SearchingHero,
  SearchLearningPath,
  SearchMiniDemo,
} from '../components/searching'
import { Badge, Card, Container, Section } from '../components/ui'
import {
  getAvailableSearchingAlgorithms,
  getComingSoonSearchingAlgorithms,
  getSearchingAlgorithmBySlug,
  getSearchingLearningPath,
  searchingConcepts,
  searchingLearningOrder,
  searchingRequirements,
} from '../data/algorithms/searching'
import { useInView } from '../hooks/useInView'
import { cn } from '../lib/cn'

const COMPARISON_SECTION_ID = 'search-comparison'

export function SearchingAlgorithmsPage() {
  const { ref, isInView } = useInView<HTMLDivElement>({
    threshold: 0,
    rootMargin: '0px',
  })

  const learningPath = getSearchingLearningPath()
  const availableAlgorithms = getAvailableSearchingAlgorithms()
  const comingSoonAlgorithms = getComingSoonSearchingAlgorithms()
  const linear = getSearchingAlgorithmBySlug('linear-search')!
  const binary = getSearchingAlgorithmBySlug('binary-search')!

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
            <li className="text-foreground">Searching Algorithms</li>
          </ol>
        </nav>

        <div
          className="mt-6 section-reveal-item sm:mt-8"
          style={{ transitionDelay: '60ms' }}
        >
          <SearchingHero />
        </div>

        <div
          className="mt-8 section-reveal-item sm:mt-10"
          style={{ transitionDelay: '80ms' }}
        >
          <Link
            to="/algorithms/searching/comparison"
            className={cn(
              'group flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5',
              'transition-theme hover:border-primary/30 hover:shadow-md',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            )}
          >
            <span className="min-w-0">
              <span className="text-label text-primary">COMPARE</span>
              <span className="mt-1 block text-base font-medium text-foreground sm:text-lg">
                Compare Searching Algorithms
              </span>
              <span className="mt-1 block text-body-sm text-muted-foreground">
                Compare strategies, complexity, and requirements across Linear,
                Binary, Jump, Interpolation, and Exponential Search.
              </span>
            </span>
            <span className="shrink-0 text-sm font-medium text-primary transition-theme group-hover:text-primary-hover">
              Open comparison →
            </span>
          </Link>
        </div>

        <section
          className="mt-12 section-reveal-item sm:mt-14"
          style={{ transitionDelay: '100ms' }}
          aria-labelledby="what-is-searching-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">INTRODUCTION</p>
            <h2
              id="what-is-searching-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              What Is a Searching Algorithm?
            </h2>
          </div>

          <Card className="p-5 sm:p-6 hover:border-primary/25">
            <p className="text-body text-muted-foreground">
              A searching algorithm is a method for locating a target value
              within a collection of data.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/25">
                <p className="text-label text-[0.65rem] tracking-[0.08em]">
                  Array
                </p>
                <p className="mt-2 font-mono text-sm text-foreground">
                  [10, 25, 7, 42, 18, 31]
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/25">
                <p className="text-label text-[0.65rem] tracking-[0.08em]">
                  Target
                </p>
                <p className="mt-2 font-mono text-sm text-foreground">42</p>
              </div>
            </div>

            <p className="mt-5 text-body-sm text-muted-foreground sm:text-body">
              Different algorithms may find the same value using very different
              numbers of operations. The key question is:{' '}
              <span className="font-medium text-foreground">
                How much work does the algorithm need as the input grows?
              </span>{' '}
              That growth question is exactly what{' '}
              <Link
                to="/learn/big-o-complexity"
                className={cn(
                  'font-medium text-primary transition-theme hover:text-primary-hover',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                )}
              >
                Big O Complexity
              </Link>{' '}
              helps you answer.
            </p>
          </Card>
        </section>

        <section
          className="mt-12 section-reveal-item sm:mt-14"
          style={{ transitionDelay: '140ms' }}
          aria-labelledby="learning-path-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">PATH</p>
            <h2
              id="learning-path-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              Searching Learning Path
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground sm:text-body">
              Start with the available lessons, then return as more search
              techniques arrive. Future stages are marked Coming Soon.
            </p>
          </div>

          <SearchLearningPath algorithms={learningPath} />
        </section>

        <section
          className="mt-12 section-reveal-item sm:mt-14"
          style={{ transitionDelay: '180ms' }}
          aria-labelledby="explore-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">CATALOG</p>
            <h2
              id="explore-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              Explore Searching Algorithms
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground sm:text-body">
              Open an interactive lesson, or preview what is planned next.
            </p>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {availableAlgorithms.map((algorithm) => (
              <li key={algorithm.slug}>
                <SearchingAlgorithmCard algorithm={algorithm} />
              </li>
            ))}
          </ul>

          {comingSoonAlgorithms.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-muted-foreground">
                Coming soon
              </h3>
              <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {comingSoonAlgorithms.map((algorithm) => (
                  <li key={algorithm.slug}>
                    <SearchingAlgorithmCard algorithm={algorithm} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section
          className="mt-12 section-reveal-item sm:mt-14"
          style={{ transitionDelay: '220ms' }}
          aria-labelledby="before-you-search-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">REQUIREMENTS</p>
            <h2
              id="before-you-search-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              Before You Search
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground sm:text-body">
              Algorithm choice depends on properties of the data — not on a
              single universal ranking.
            </p>
          </div>

          <ol className="space-y-3">
            {searchingRequirements.map((item, index) => (
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

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Card className="p-5 hover:border-primary/25 sm:p-6">
              <h3 className="text-base font-medium text-foreground">
                Linear Search
              </h3>
              <ul className="mt-3 space-y-2">
                {[
                  'Works on unsorted data',
                  'Simple to understand and implement',
                  'No preprocessing required',
                  'O(n) worst case',
                ].map((point) => (
                  <li
                    key={point}
                    className="flex gap-2 text-body-sm text-muted-foreground"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1 shrink-0 rounded-full bg-primary"
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-5 hover:border-primary/25 sm:p-6">
              <h3 className="text-base font-medium text-foreground">
                Binary Search
              </h3>
              <ul className="mt-3 space-y-2">
                {[
                  'Requires sorted data',
                  'Repeatedly removes half of the remaining range',
                  'O(log n) worst case',
                  'Sorting or other preprocessing may have its own cost',
                ].map((point) => (
                  <li
                    key={point}
                    className="flex gap-2 text-body-sm text-muted-foreground"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1 shrink-0 rounded-full bg-primary"
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>

        <section
          className="mt-12 section-reveal-item sm:mt-14"
          style={{ transitionDelay: '260ms' }}
          aria-labelledby="demo-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">INTERACTIVE</p>
            <h2
              id="demo-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              See Searching in Action
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground sm:text-body">
              Switch between Linear Search and Binary Search using the same
              visualization engine as the lessons.
            </p>
          </div>

          <SearchMiniDemo />
        </section>

        <section
          id={COMPARISON_SECTION_ID}
          className="mt-12 scroll-mt-24 section-reveal-item sm:mt-14"
          style={{ transitionDelay: '300ms' }}
          aria-labelledby="comparison-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">COMPARE</p>
            <h2
              id="comparison-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              Linear Search vs Binary Search
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground sm:text-body">
              Side-by-side properties and a lightweight visual of how each
              approach moves through the array.
            </p>
          </div>

          <SearchComparison linear={linear} binary={binary} />
        </section>

        <section
          className="mt-12 section-reveal-item sm:mt-14"
          style={{ transitionDelay: '340ms' }}
          aria-labelledby="concepts-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">FOUNDATIONS</p>
            <h2
              id="concepts-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              Concepts You&apos;ll Learn
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground sm:text-body">
              These ideas show up across searching lessons. They are concepts,
              not separate pages.
            </p>
          </div>

          <SearchConcepts concepts={searchingConcepts} />
        </section>

        <section
          className="mt-12 section-reveal-item sm:mt-14"
          style={{ transitionDelay: '380ms' }}
          aria-labelledby="order-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">ORDER</p>
            <h2
              id="order-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              Recommended Learning Order
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground sm:text-body">
              Follow this sequence. Available lessons are linked; later stages
              stay marked coming soon.
            </p>
          </div>

          <ol className="space-y-2">
            {searchingLearningOrder.map((item, index) => {
              const content = (
                <>
                  <span
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-md font-mono text-xs font-medium',
                      item.available
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground',
                    )}
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <span
                    className={cn(
                      'min-w-0 flex-1 text-sm font-medium',
                      item.available
                        ? 'text-foreground'
                        : 'text-muted-foreground',
                    )}
                  >
                    {item.title}
                  </span>
                  {item.available ? (
                    <span className="text-sm font-medium text-primary">
                      Open →
                    </span>
                  ) : (
                    <Badge variant="muted" className="text-[0.65rem]">
                      Coming later
                    </Badge>
                  )}
                </>
              )

              if (!item.available || !item.href) {
                return (
                  <li key={item.id}>
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 opacity-80">
                      {content}
                    </div>
                  </li>
                )
              }

              return (
                <li key={item.id}>
                  <Link
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border border-border bg-surface p-3 shadow-sm',
                      'transition-theme hover:border-primary/30 hover:shadow-md',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    )}
                  >
                    {content}
                  </Link>
                </li>
              )
            })}
          </ol>
        </section>
      </Container>
    </Section>
  )
}
