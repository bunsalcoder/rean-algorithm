import { Link } from 'react-router-dom'
import {
  ArrayStringAlgorithmCard,
  ArrayStringConceptCards,
  ArrayStringHero,
  ArrayStringLearningPath,
  ArrayStringMiniDemo,
} from '../components/array-string'
import { Card, Container, Section } from '../components/ui'
import {
  ARRAY_EXAMPLE,
  STRING_EXAMPLE,
  arrayStringConcepts,
  arrayStringLearningOrder,
  getAvailableArrayStringAlgorithms,
  getComingSoonArrayStringAlgorithms,
} from '../data/algorithms/array-string'
import { useInView } from '../hooks/useInView'
import { cn } from '../lib/cn'

export function ArrayStringAlgorithmsPage() {
  const { ref, isInView } = useInView<HTMLDivElement>({
    threshold: 0,
    rootMargin: '0px',
  })

  const availableAlgorithms = getAvailableArrayStringAlgorithms()
  const comingSoonAlgorithms = getComingSoonArrayStringAlgorithms()
  const stringChars = STRING_EXAMPLE.split('')

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
            <li className="text-foreground">Array &amp; String Algorithms</li>
          </ol>
        </nav>

        <div
          className="mt-6 section-reveal-item sm:mt-8"
          style={{ transitionDelay: '60ms' }}
        >
          <ArrayStringHero />
        </div>

        <section
          className="mt-12 section-reveal-item sm:mt-14"
          style={{ transitionDelay: '100ms' }}
          aria-labelledby="arrays-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">STRUCTURES</p>
            <h2
              id="arrays-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              Arrays
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground sm:text-body">
              An array stores multiple values in an ordered sequence.
            </p>
          </div>

          <Card className="p-5 sm:p-6 hover:border-primary/25">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/25">
                <p className="text-label text-[0.65rem] tracking-[0.08em]">
                  Example
                </p>
                <p className="mt-2 font-mono text-sm text-foreground">
                  [{ARRAY_EXAMPLE.join(', ')}]
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/25">
                <p className="text-label text-[0.65rem] tracking-[0.08em]">
                  Index → Value
                </p>
                <div className="mt-2 overflow-x-auto">
                  <table className="min-w-max border-collapse text-left font-mono text-sm">
                    <thead>
                      <tr className="text-muted-foreground">
                        <th className="pr-3 font-medium">Index</th>
                        {ARRAY_EXAMPLE.map((_, index) => (
                          <th key={`idx-${index}`} className="px-1.5 font-normal">
                            {index}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="text-foreground">
                        <th className="pr-3 font-medium text-muted-foreground">
                          Value
                        </th>
                        {ARRAY_EXAMPLE.map((value, index) => (
                          <td key={`val-${index}`} className="px-1.5">
                            {value}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <p className="mt-5 text-body-sm text-muted-foreground sm:text-body">
              Arrays matter because they give you easy indexed access, hold
              sequential data, appear as common input structures, and form the
              foundation for many algorithms.
            </p>

            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                'Easy indexed access',
                'Natural fit for sequential data',
                'Common input structure in problems',
                'Foundation for many algorithms',
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
        </section>

        <section
          className="mt-12 section-reveal-item sm:mt-14"
          style={{ transitionDelay: '140ms' }}
          aria-labelledby="strings-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">STRUCTURES</p>
            <h2
              id="strings-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              Strings
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground sm:text-body">
              A string can be viewed as a sequence of characters — so many string
              problems reuse array-like techniques.
            </p>
          </div>

          <Card className="p-5 sm:p-6 hover:border-primary/25">
            <div className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/25">
              <p className="text-label text-[0.65rem] tracking-[0.08em]">
                Example
              </p>
              <p className="mt-2 font-mono text-sm text-foreground">
                &quot;{STRING_EXAMPLE}&quot;
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {stringChars.map((char, index) => (
                  <span
                    key={`${char}-${index}`}
                    className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-surface font-mono text-sm font-medium text-foreground"
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>

            <p className="mt-5 text-body-sm text-muted-foreground sm:text-body">
              Many string problems use the same ideas you apply to arrays:
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {[
                'Indexing',
                'Scanning',
                'Comparison',
                'Counting',
                'Searching',
                'Two pointers',
                'Sliding windows',
              ].map((technique) => (
                <li
                  key={technique}
                  className="rounded-md border border-border bg-muted/40 px-2.5 py-1 text-sm text-foreground dark:bg-muted/25"
                >
                  {technique}
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <section
          className="mt-12 section-reveal-item sm:mt-14"
          style={{ transitionDelay: '180ms' }}
          aria-labelledby="concepts-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">TECHNIQUES</p>
            <h2
              id="concepts-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              Core Array &amp; String Techniques
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground sm:text-body">
              These patterns show up across array and string problems. Two
              Pointers, Sliding Window, and Prefix Sum are available — the rest
              are marked Coming Soon.
            </p>
          </div>

          <ArrayStringConceptCards concepts={arrayStringConcepts} />
        </section>

        <section
          className="mt-12 section-reveal-item sm:mt-14"
          style={{ transitionDelay: '200ms' }}
          aria-labelledby="demo-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">INTERACTIVE</p>
            <h2
              id="demo-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              See Array &amp; String Patterns in Action
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground sm:text-body">
              Switch between Two Pointers, Sliding Window, Prefix Sum, Frequency
              Counting, Kadane&apos;s Algorithm, and Longest Unique Substring
              using the same visualization engine as the lessons.
            </p>
          </div>

          <ArrayStringMiniDemo />
        </section>

        <section
          className="mt-12 section-reveal-item sm:mt-14"
          style={{ transitionDelay: '220ms' }}
          aria-labelledby="learning-path-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">PATH</p>
            <h2
              id="learning-path-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              Recommended Learning Order
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground sm:text-body">
              A suggested sequence for building up array and string skills.
              Available lessons are linked; later stages stay marked Coming Soon.
              This is a guide, not a progress tracker.
            </p>
          </div>

          <ArrayStringLearningPath items={arrayStringLearningOrder} />
        </section>

        <section
          className="mt-12 section-reveal-item sm:mt-14"
          style={{ transitionDelay: '260ms' }}
          aria-labelledby="available-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">CATALOG</p>
            <h2
              id="available-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              Available Algorithms
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground sm:text-body">
              Open an interactive lesson, or preview what is planned next.
            </p>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {availableAlgorithms.map((algorithm) => (
              <li key={algorithm.slug}>
                <ArrayStringAlgorithmCard algorithm={algorithm} />
              </li>
            ))}
          </ul>

          {comingSoonAlgorithms.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-muted-foreground">
                Coming Soon
              </h3>
              <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {comingSoonAlgorithms.map((algorithm) => (
                  <li key={algorithm.slug}>
                    <ArrayStringAlgorithmCard algorithm={algorithm} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              to="/learn/two-pointers"
              className={cn(
                'inline-flex h-11 w-full items-center justify-center gap-2 rounded-md px-5 text-base font-medium sm:w-auto',
                'bg-primary text-primary-foreground shadow-sm transition-theme hover:bg-primary-hover',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              )}
            >
              Start with Two Pointers →
            </Link>
            <Link
              to="/learn/sliding-window"
              className={cn(
                'inline-flex h-11 w-full items-center justify-center gap-2 rounded-md px-5 text-base font-medium sm:w-auto',
                'border border-border bg-surface text-foreground shadow-sm transition-theme hover:bg-muted',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              )}
            >
              Open Sliding Window →
            </Link>
            <Link
              to="/learn/prefix-sum"
              className={cn(
                'inline-flex h-11 w-full items-center justify-center gap-2 rounded-md px-5 text-base font-medium sm:w-auto',
                'border border-border bg-surface text-foreground shadow-sm transition-theme hover:bg-muted',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              )}
            >
              Open Prefix Sum →
            </Link>
            <Link
              to="/learn/frequency-counting"
              className={cn(
                'inline-flex h-11 w-full items-center justify-center gap-2 rounded-md px-5 text-base font-medium sm:w-auto',
                'border border-border bg-surface text-foreground shadow-sm transition-theme hover:bg-muted',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              )}
            >
              Open Frequency Counting →
            </Link>
            <Link
              to="/learn/kadanes-algorithm"
              className={cn(
                'inline-flex h-11 w-full items-center justify-center gap-2 rounded-md px-5 text-base font-medium sm:w-auto',
                'border border-border bg-surface text-foreground shadow-sm transition-theme hover:bg-muted',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              )}
            >
              Open Kadane&apos;s Algorithm →
            </Link>
            <Link
              to="/learn/longest-substring-without-repeating-characters"
              className={cn(
                'inline-flex h-11 w-full items-center justify-center gap-2 rounded-md px-5 text-base font-medium sm:w-auto',
                'border border-border bg-surface text-foreground shadow-sm transition-theme hover:bg-muted',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              )}
            >
              Open Longest Unique Substring →
            </Link>
          </div>
        </section>
      </Container>
    </Section>
  )
}
