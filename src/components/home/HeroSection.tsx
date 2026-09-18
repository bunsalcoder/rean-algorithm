import { useNavigate } from 'react-router-dom'
import { Button, Container, Section } from '../ui'
import { AlgorithmCodePreview } from './AlgorithmCodePreview'

export function HeroSection() {
  const navigate = useNavigate()

  return (
    <Section className="relative overflow-hidden py-14 sm:py-16 lg:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-8 size-72 rounded-full bg-primary/15 blur-3xl dark:bg-primary/20" />
        <div className="absolute -right-16 bottom-0 size-80 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15" />
        <div className="absolute right-1/4 top-1/3 size-48 rounded-full bg-accent/60 blur-3xl dark:bg-primary/10" />
        <div className="hero-grid absolute inset-0 opacity-[0.35] dark:opacity-[0.2]" />
      </div>

      <Container className="relative grid items-center gap-12 lg:grid-cols-2 lg:gap-14 xl:gap-16">
        <div className="max-w-xl">
          <p className="hero-enter text-label text-primary">
            LEARN • PRACTICE • IMPROVE
          </p>

          <h1 className="hero-enter hero-enter-delay-1 mt-4 text-foreground">
            Master Algorithms
            <span className="mt-1 block text-primary">Step by Step</span>
          </h1>

          <p className="hero-enter hero-enter-delay-2 mt-5 max-w-md text-body text-muted-foreground sm:mt-6">
            rean-algorithm is a modern learning platform for algorithms and data
            structures. Explore clear explanations, interactive examples, and
            hands-on practice to build your problem-solving skills and become a
            better developer.
          </p>

          <div className="hero-enter hero-enter-delay-3 mt-7 flex flex-wrap items-center gap-3 sm:mt-8">
            <Button
              size="lg"
              onClick={() => navigate('/algorithms')}
              className="min-w-[10.5rem]"
            >
              Start Learning →
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/algorithms')}
              className="min-w-[10.5rem]"
            >
              Explore Algorithms
            </Button>
          </div>
        </div>

        <div className="hero-enter hero-enter-delay-4 min-w-0 pb-8 pt-2 sm:pb-10 lg:pb-6 lg:pt-0">
          <AlgorithmCodePreview />
        </div>
      </Container>
    </Section>
  )
}
