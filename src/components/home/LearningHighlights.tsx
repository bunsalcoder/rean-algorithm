import { learningHighlights } from '../../data/learningHighlights'
import { useInView } from '../../hooks/useInView'
import { cn } from '../../lib/cn'
import { Container, Section } from '../ui'
import { HighlightCard } from './HighlightCard'
import { LearningPath } from './LearningPath'

export function LearningHighlights() {
  const { ref, isInView } = useInView<HTMLDivElement>()

  return (
    <Section className="relative overflow-hidden border-t border-border-subtle py-14 sm:py-16 lg:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-16 size-64 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15" />
        <div className="absolute -right-16 bottom-10 size-72 rounded-full bg-primary/8 blur-3xl dark:bg-primary/12" />
      </div>

      <Container
        ref={ref}
        className={cn(
          'relative grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12 xl:gap-16',
          'section-reveal',
          isInView && 'section-reveal-visible',
        )}
      >
        <div className="section-reveal-item max-w-md">
          <p className="text-label text-primary">WHY REAN ALGORITHM</p>
          <h2 className="mt-3 text-foreground">
            Learn Algorithms by Understanding Them
          </h2>
          <p className="mt-3 text-body text-muted-foreground">
            Don&apos;t just memorize code. Understand how algorithms work
            through clear explanations, visual examples, step-by-step
            animations, and practical problems.
          </p>

          <LearningPath className="mt-8 hidden sm:inline-flex" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          {learningHighlights.map((highlight, index) => (
            <div
              key={highlight.title}
              className="section-reveal-item h-full"
              style={{ transitionDelay: `${120 + index * 70}ms` }}
            >
              <HighlightCard highlight={highlight} />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
