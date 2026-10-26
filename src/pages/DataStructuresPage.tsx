import { Link } from 'react-router-dom'
import { LearningJourneyLinks } from '../components/learning'
import { Container, Section } from '../components/ui'
import { cn } from '../lib/cn'

export function DataStructuresPage() {
  return (
    <Section className="relative overflow-hidden py-10 sm:py-12 lg:py-14">
      <Container size="md" className="relative text-center">
        <p className="text-label text-primary">CATALOG</p>
        <h1 className="mt-2 text-foreground">Data Structures</h1>
        <p className="mx-auto mt-4 max-w-xl text-body text-muted-foreground">
          Dedicated data structure guides are coming soon. Frequency counting
          and related hashing ideas already appear in the Array &amp; String
          lessons.
        </p>
        <div className="mx-auto mt-8 max-w-lg text-left">
          <LearningJourneyLinks />
        </div>
        <p className="mt-6 text-body-sm text-muted-foreground">
          Meanwhile, explore{' '}
          <Link
            to="/algorithms/array-string"
            className={cn(
              'font-medium text-primary transition-theme hover:text-primary-hover',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            Array &amp; String
          </Link>{' '}
          or the{' '}
          <Link
            to="/roadmap"
            className={cn(
              'font-medium text-primary transition-theme hover:text-primary-hover',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            learning roadmap
          </Link>
          .
        </p>
      </Container>
    </Section>
  )
}
