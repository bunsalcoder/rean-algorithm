import { Link } from 'react-router-dom'
import { useInView } from '../../hooks/useInView'
import { cn } from '../../lib/cn'
import { Container, Section } from '../ui'

export function RoadmapHeader() {
  const { ref, isInView } = useInView<HTMLDivElement>()

  return (
    <Section className="relative overflow-hidden pb-8 pt-12 sm:pb-10 sm:pt-14 lg:pb-12 lg:pt-16">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-8 size-64 rounded-full bg-primary/12 blur-3xl dark:bg-primary/18" />
        <div className="absolute -right-16 bottom-0 size-72 rounded-full bg-primary/8 blur-3xl dark:bg-primary/12" />
        <div className="hero-grid absolute inset-0 opacity-[0.28] dark:opacity-[0.16]" />
      </div>

      <Container
        ref={ref}
        size="md"
        className={cn(
          'relative text-center section-reveal',
          isInView && 'section-reveal-visible',
        )}
      >
        <p className="section-reveal-item text-label text-primary">
          LEARNING PATH
        </p>
        <h1 className="section-reveal-item mt-3 text-foreground">
          Algorithm Roadmap
        </h1>
        <p
          className="section-reveal-item mx-auto mt-4 max-w-2xl text-body text-muted-foreground"
          style={{ transitionDelay: '80ms' }}
        >
          Follow a structured path from programming fundamentals to advanced
          algorithms. Stages link to lessons and practice that already exist —
          coming-soon stages stay honest until content ships.
        </p>
        <p
          className="section-reveal-item mx-auto mt-3 max-w-xl text-body-sm text-muted-foreground"
          style={{ transitionDelay: '100ms' }}
        >
          Track session practice on your{' '}
          <Link
            to="/practice/dashboard"
            className="font-medium text-primary transition-theme hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            learning dashboard
          </Link>
          .
        </p>
      </Container>
    </Section>
  )
}
