import { Link } from 'react-router-dom'
import type { AlgorithmCategory } from '../../data/categories'
import { cn } from '../../lib/cn'
import { CategoryIcon } from './CategoryIcon'
import { categoryAccentStyles } from './categoryAccentStyles'

type CategoryCardProps = {
  category: AlgorithmCategory
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

export function CategoryCard({ category }: CategoryCardProps) {
  const accent = categoryAccentStyles[category.accent]

  return (
    <Link
      to={category.href}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-xl',
        'border border-border bg-surface p-5 shadow-sm sm:p-6',
        'transition-all duration-300 ease-out',
        'hover:-translate-y-1 hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        accent.hoverBorder,
        accent.hoverShadow,
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute -right-8 -top-8 size-28 rounded-full blur-2xl',
          'bg-transparent opacity-0 transition-opacity duration-300',
          'group-hover:opacity-100',
          accent.glow,
        )}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div
          className={cn(
            'flex size-11 items-center justify-center rounded-lg',
            'transition-transform duration-300 ease-out',
            'group-hover:scale-110',
            accent.iconWrap,
          )}
        >
          <CategoryIcon
            name={category.icon}
            className={cn('size-5', accent.icon)}
          />
        </div>

        <ArrowIcon
          className={cn(
            'mt-1 size-4 shrink-0 text-muted-foreground',
            'transition-transform duration-300 ease-out',
            'group-hover:translate-x-1 group-hover:text-foreground',
          )}
        />
      </div>

      <div className="relative mt-4 flex flex-1 flex-col">
        <h3 className="text-base font-medium text-foreground sm:text-lg">
          {category.title}
        </h3>

        <p
          className={cn(
            'mt-1.5 text-xs font-medium tracking-wide',
            accent.count,
          )}
        >
          {category.count} algorithms
        </p>

        <p className="mt-3 text-body-sm text-muted-foreground">
          {category.description}
        </p>
      </div>
    </Link>
  )
}
