import { Link } from 'react-router-dom'
import { AlgorithmList } from '../components/algorithms/AlgorithmList'
import { CategoryIcon } from '../components/home/CategoryIcon'
import { categoryAccentStyles } from '../components/home/categoryAccentStyles'
import { Container, Section } from '../components/ui'
import {
  getAlgorithmCategory,
  getAlgorithmsByCategory,
  type AlgorithmCategoryId,
} from '../data/algorithms'
import { useInView } from '../hooks/useInView'
import { cn } from '../lib/cn'
import { PlaceholderPage } from './PlaceholderPage'

type AlgorithmCategoryPageProps = {
  categoryId: AlgorithmCategoryId
}

export function AlgorithmCategoryPage({
  categoryId,
}: AlgorithmCategoryPageProps) {
  const category = getAlgorithmCategory(categoryId)
  const algorithms = getAlgorithmsByCategory(categoryId)
  const { ref, isInView } = useInView<HTMLDivElement>({
    threshold: 0,
    rootMargin: '0px',
  })

  if (!category) {
    return (
      <PlaceholderPage
        title="Category not found"
        description="This algorithm category does not exist yet."
      />
    )
  }

  const accent = categoryAccentStyles[category.accent]
  const availableCount = algorithms.filter(
    (algorithm) => algorithm.status === 'available',
  ).length

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
            <li className="text-foreground">{category.title}</li>
          </ol>
        </nav>

        <div
          className="mt-6 flex flex-col gap-5 sm:mt-8 sm:flex-row sm:items-start section-reveal-item"
          style={{ transitionDelay: '60ms' }}
        >
          <div
            className={cn(
              'flex size-12 shrink-0 items-center justify-center rounded-xl',
              accent.iconWrap,
            )}
          >
            <CategoryIcon
              name={category.icon}
              className={cn('size-6', accent.icon)}
            />
          </div>

          <div className="min-w-0">
            <p className="text-label text-primary">ALGORITHM CATEGORY</p>
            <h1 className="mt-2 text-foreground">{category.title}</h1>
            <p className="mt-3 max-w-2xl text-body text-muted-foreground">
              {category.description}
            </p>
            <p className={cn('mt-3 text-sm font-medium', accent.count)}>
              {availableCount} available
              {algorithms.length > availableCount
                ? ` · ${algorithms.length - availableCount} coming soon`
                : null}
            </p>
          </div>
        </div>

        <div
          className="mt-10 section-reveal-item sm:mt-12"
          style={{ transitionDelay: '120ms' }}
        >
          <h2 className="text-lg font-medium text-foreground sm:text-xl">
            Algorithms in this category
          </h2>
          <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground">
            Pick a lesson to open an interactive walkthrough. Available lessons
            use the same visual style as the rest of Rean Algorithm.
          </p>

          <div className="mt-6 max-w-2xl">
            <AlgorithmList algorithms={algorithms} />
          </div>
        </div>
      </Container>
    </Section>
  )
}
