import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  PracticeFilters,
  PracticeProblemCard,
} from '../components/practice'
import { Badge, Container, Section } from '../components/ui'
import { usePracticeCompletion } from '../context/PracticeCompletionContext'
import {
  filterPracticeProblems,
  getPracticeCategories,
  isValidationSupported,
  practiceProblems,
  type PracticeFilterState,
} from '../data/practice'
import { useInView } from '../hooks/useInView'
import { cn } from '../lib/cn'

const EMPTY_FILTERS: PracticeFilterState = {
  query: '',
  category: 'all',
  difficulty: 'all',
}

function resolveCategoryFilter(
  categoryParam: string | null,
  categories: readonly string[],
): string {
  if (categoryParam && categories.includes(categoryParam)) {
    return categoryParam
  }
  return 'all'
}

export function PracticePage() {
  const { ref, isInView } = useInView<HTMLDivElement>({
    threshold: 0,
    rootMargin: '0px',
  })
  const { isCompleted, isAttempted } = usePracticeCompletion()
  const [searchParams] = useSearchParams()
  const categories = getPracticeCategories()
  const categoryParam = searchParams.get('category')

  const [filters, setFilters] = useState<PracticeFilterState>(() => ({
    ...EMPTY_FILTERS,
    category: resolveCategoryFilter(categoryParam, categories),
  }))
  const [syncedCategoryParam, setSyncedCategoryParam] = useState(categoryParam)

  // Keep topic deep-links from the dashboard in sync without an effect.
  if (categoryParam !== syncedCategoryParam) {
    setSyncedCategoryParam(categoryParam)
    const nextCategory = resolveCategoryFilter(categoryParam, categories)
    if (filters.category !== nextCategory) {
      setFilters((current) => ({ ...current, category: nextCategory }))
    }
  }

  const filteredProblems = filterPracticeProblems(practiceProblems, filters)
  const totalCount = practiceProblems.length

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
            <li className="text-foreground">Practice</li>
          </ol>
        </nav>

        <header
          className="mt-6 max-w-3xl section-reveal-item sm:mt-8"
          style={{ transitionDelay: '60ms' }}
        >
          <p className="text-label text-primary">PRACTICE</p>
          <h1 className="mt-2 text-foreground">Algorithm practice problems</h1>
          <p className="mt-4 text-body text-muted-foreground">
            Work through carefully written problems tied to the lessons already
            available in Rean Algorithm. Read the statement, explore structured
            test cases, use progressive hints, then study the approach and
            reference solutions. Checks compare structured answers or trusted
            references — they do not execute your source code or invent
            verdicts.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge variant="primary">
              {totalCount} {totalCount === 1 ? 'problem' : 'problems'}
            </Badge>
            <Badge variant="muted">Session-only completion</Badge>
            <Link
              to="/practice/dashboard"
              className={cn(
                'inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium',
                'border border-border bg-surface text-foreground shadow-sm transition-theme',
                'hover:bg-muted',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            >
              Learning dashboard
            </Link>
          </div>
        </header>

        <div
          className="mt-8 section-reveal-item sm:mt-10"
          style={{ transitionDelay: '100ms' }}
        >
          <PracticeFilters
            filters={filters}
            categories={categories}
            resultCount={filteredProblems.length}
            totalCount={totalCount}
            onChange={setFilters}
            onClear={() => setFilters(EMPTY_FILTERS)}
          />
        </div>

        <div
          className="mt-8 section-reveal-item sm:mt-10"
          style={{ transitionDelay: '140ms' }}
        >
          {filteredProblems.length === 0 ? (
            <div
              className="rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center"
              role="status"
            >
              <p className="text-base font-medium text-foreground">
                No problems match these filters
              </p>
              <p className="mx-auto mt-2 max-w-md text-body-sm text-muted-foreground">
                Try a different search term, topic, or difficulty — or clear the
                filters to see the full library.
              </p>
              <button
                type="button"
                onClick={() => setFilters(EMPTY_FILTERS)}
                className={cn(
                  'mt-5 inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium',
                  'bg-primary text-primary-foreground shadow-sm transition-theme',
                  'hover:bg-primary-hover',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                )}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProblems.map((problem) => (
                <li key={problem.id}>
                  <PracticeProblemCard
                    problem={problem}
                    completed={isCompleted(problem.slug)}
                    attempted={isAttempted(problem.slug)}
                    validationAvailable={isValidationSupported(problem.slug)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside
          className="mt-10 max-w-2xl section-reveal-item sm:mt-12"
          style={{ transitionDelay: '180ms' }}
        >
          <p className="text-body-sm text-muted-foreground">
            Looking for guided walkthroughs first? Browse the{' '}
            <Link
              to="/algorithms/array-string"
              className="font-medium text-primary transition-theme hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Array &amp; String hub
            </Link>
            , the{' '}
            <Link
              to="/algorithms/searching"
              className="font-medium text-primary transition-theme hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Searching hub
            </Link>
            , or the full{' '}
            <Link
              to="/roadmap"
              className="font-medium text-primary transition-theme hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              learning roadmap
            </Link>
            . Track session progress on your{' '}
            <Link
              to="/practice/dashboard"
              className="font-medium text-primary transition-theme hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              learning dashboard
            </Link>
            .
          </p>
        </aside>
      </Container>
    </Section>
  )
}
