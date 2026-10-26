import { Link } from 'react-router-dom'
import type { DataStructure } from '../../data/data-structures'
import { categoryAccentStyles } from '../home/categoryAccentStyles'
import { cn } from '../../lib/cn'
import { Badge, Card } from '../ui'

type DataStructureCardProps = {
  structure: DataStructure
  className?: string
}

export function DataStructureCard({
  structure,
  className,
}: DataStructureCardProps) {
  const accent = categoryAccentStyles[structure.accent]
  const isAvailable = structure.availability === 'available'

  return (
    <Card
      className={cn(
        'flex h-full flex-col p-5 sm:p-6',
        !isAvailable && 'opacity-80 hover:border-border hover:shadow-sm',
        isAvailable && accent.hoverBorder,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'flex size-10 items-center justify-center rounded-lg text-sm font-semibold',
            isAvailable ? accent.iconWrap : 'bg-muted text-muted-foreground',
            isAvailable && accent.icon,
          )}
          aria-hidden="true"
        >
          {structure.name.charAt(0)}
        </span>
        <Badge
          variant={isAvailable ? 'primary' : 'muted'}
          className="text-[0.65rem]"
        >
          {isAvailable ? 'Available' : 'Coming Soon'}
        </Badge>
      </div>

      <h3 className="mt-4 text-base font-medium text-foreground sm:text-lg">
        {structure.name}
      </h3>
      <p className="mt-2 flex-1 text-body-sm text-muted-foreground">
        {structure.description}
      </p>

      <p className="mt-4 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-body-sm text-muted-foreground dark:bg-muted/25">
        <span className="font-medium text-foreground">Use case: </span>
        {structure.useCase}
      </p>

      {isAvailable && structure.href ? (
        <Link
          to={structure.href}
          className={cn(
            'mt-5 inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium',
            'bg-primary text-primary-foreground shadow-sm transition-theme hover:bg-primary-hover',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          )}
        >
          {structure.hrefLabel ?? `Open ${structure.name}`}
        </Link>
      ) : (
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Dedicated guide coming soon
        </p>
      )}
    </Card>
  )
}
