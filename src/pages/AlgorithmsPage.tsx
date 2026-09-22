import { Link } from 'react-router-dom'
import { algorithmCategoryMeta } from '../data/algorithms'
import { CategoryIcon } from '../components/home/CategoryIcon'
import { categoryAccentStyles } from '../components/home/categoryAccentStyles'
import { Container, Section } from '../components/ui'
import { useInView } from '../hooks/useInView'
import { cn } from '../lib/cn'

export function AlgorithmsPage() {
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
          <p className="text-label text-primary">CATALOG</p>
          <h1 className="mt-2 text-foreground">Algorithms</h1>
          <p className="mt-3 max-w-2xl text-body text-muted-foreground">
            Browse algorithm categories and open interactive lessons. Start with
            Searching for Binary Search, or Sorting for Bubble Sort.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
          {algorithmCategoryMeta.map((category, index) => {
            const accent = categoryAccentStyles[category.accent]

            return (
              <Link
                key={category.id}
                to={category.href}
                className={cn(
                  'group relative flex flex-col overflow-hidden rounded-xl',
                  'border border-border bg-surface p-5 shadow-sm',
                  'transition-all duration-300 ease-out',
                  'hover:-translate-y-1 hover:shadow-md',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  'section-reveal-item',
                  accent.hoverBorder,
                  accent.hoverShadow,
                )}
                style={{ transitionDelay: `${80 + index * 40}ms` }}
              >
                <div
                  className={cn(
                    'flex size-11 items-center justify-center rounded-lg',
                    accent.iconWrap,
                  )}
                >
                  <CategoryIcon
                    name={category.icon}
                    className={cn('size-5', accent.icon)}
                  />
                </div>
                <h2 className="mt-4 text-base font-medium text-foreground sm:text-lg">
                  {category.title}
                </h2>
                <p className="mt-2 text-body-sm text-muted-foreground">
                  {category.description}
                </p>
              </Link>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
