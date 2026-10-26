import {
  ChoosingGuide,
  DataStructureCard,
  DataStructuresHero,
  DataStructuresLearningPath,
  StructureExplorer,
} from '../components/data-structures'
import { LearningJourneyLinks } from '../components/learning'
import { Card, Container, Section } from '../components/ui'
import { dataStructures } from '../data/data-structures'
import { useInView } from '../hooks/useInView'
import { cn } from '../lib/cn'

export function DataStructuresPage() {
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
        <div className="section-reveal-item">
          <DataStructuresHero />
        </div>

        <div
          className="mt-8 section-reveal-item sm:mt-10"
          style={{ transitionDelay: '60ms' }}
        >
          <LearningJourneyLinks />
        </div>

        <section
          id="what-is"
          className="mt-12 scroll-mt-24 section-reveal-item sm:mt-14"
          style={{ transitionDelay: '80ms' }}
          aria-labelledby="what-is-ds-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">INTRODUCTION</p>
            <h2
              id="what-is-ds-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              What Is a Data Structure?
            </h2>
          </div>

          <Card className="p-5 sm:p-6 hover:border-primary/25">
            <p className="text-body text-muted-foreground">
              A data structure is a deliberate way to organize data so you can
              store it, access it, insert or delete values, and search
              efficiently. The layout you pick—contiguous slots, linked nodes,
              buckets, or a tree—changes which operations feel cheap or
              expensive.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/25">
                <p className="text-label text-primary">DATA STRUCTURES</p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  How information is organized
                </p>
                <p className="mt-2 text-body-sm text-muted-foreground">
                  Arrays, lists, maps, trees, and graphs define where values
                  live and how you reach them. They are the nouns of your
                  program&apos;s memory.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/25">
                <p className="text-label text-primary">ALGORITHMS</p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  How a problem is solved
                </p>
                <p className="mt-2 text-body-sm text-muted-foreground">
                  Algorithms are step-by-step procedures that operate on that
                  organized data—searching, sorting, traversing, and updating
                  it toward a goal.
                </p>
              </div>
            </div>

            <p className="mt-5 text-body-sm text-muted-foreground">
              Strong problem solving usually pairs both: choose a structure that
              matches your access pattern, then apply an algorithm that uses its
              strengths.
            </p>
          </Card>
        </section>

        <section
          id="explore"
          className="mt-12 scroll-mt-24 section-reveal-item sm:mt-14"
          style={{ transitionDelay: '100ms' }}
          aria-labelledby="explore-ds-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">CATALOG</p>
            <h2
              id="explore-ds-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              Explore Data Structures
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground">
              Browse core structures. Available cards link to real lessons or
              hubs already in the project; everything else is clearly marked
              Coming Soon.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dataStructures.map((structure, index) => (
              <div
                key={structure.id}
                className="section-reveal-item h-full"
                style={{ transitionDelay: `${120 + index * 30}ms` }}
              >
                <DataStructureCard structure={structure} />
              </div>
            ))}
          </div>
        </section>

        <section
          id="explorer"
          className="mt-12 scroll-mt-24 section-reveal-item sm:mt-14"
          style={{ transitionDelay: '140ms' }}
          aria-labelledby="explorer-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">INTERACTIVE</p>
            <h2
              id="explorer-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              Structure Explorer
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground">
              Select a structure to review how it organizes data, typical
              operations and complexities, and honest trade-offs. Complexities
              assume common implementations—real costs vary.
            </p>
          </div>

          <StructureExplorer />
        </section>

        <section
          id="choosing"
          className="mt-12 scroll-mt-24 section-reveal-item sm:mt-14"
          style={{ transitionDelay: '160ms' }}
          aria-labelledby="choosing-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">DECISION GUIDE</p>
            <h2
              id="choosing-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              Choosing the Right Structure
            </h2>
          </div>

          <ChoosingGuide />
        </section>

        <section
          id="learning-path"
          className="mt-12 scroll-mt-24 section-reveal-item sm:mt-14"
          style={{ transitionDelay: '180ms' }}
          aria-labelledby="learning-path-heading"
        >
          <div className="mb-5 sm:mb-6">
            <p className="text-label text-primary">PATH</p>
            <h2
              id="learning-path-heading"
              className="mt-2 text-xl font-medium text-foreground sm:text-2xl"
            >
              Recommended Learning Path
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground">
              A beginner-friendly sequence. Only steps with published content
              are linked; unfinished topics stay Coming Soon.
            </p>
          </div>

          <DataStructuresLearningPath />

          <div className="mt-8">
            <LearningJourneyLinks compact />
          </div>
        </section>
      </Container>
    </Section>
  )
}
