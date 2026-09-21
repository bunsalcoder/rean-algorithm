import { algorithmCategories } from '../../data/categories'
import { Container, Section } from '../ui'
import { CategoryCard } from './CategoryCard'

export function ExploreByCategory() {
  return (
    <Section className="relative border-t border-border-subtle bg-muted/40 py-14 sm:py-16 lg:py-20 dark:bg-muted/25">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent"
      />

      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-label text-primary">ALGORITHM CATEGORIES</p>
          <h2 className="mt-3 text-foreground">Explore by Category</h2>
          <p className="mx-auto mt-3 max-w-xl text-body text-muted-foreground">
            Browse through different algorithm categories and find what you want
            to learn.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {algorithmCategories.map((category) => (
            <CategoryCard key={category.href} category={category} />
          ))}
        </div>
      </Container>
    </Section>
  )
}
