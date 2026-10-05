import { Link } from 'react-router-dom'
import type { ArrayStringConcept } from '../../data/algorithms/array-string'
import { cn } from '../../lib/cn'
import { Badge, Card } from '../ui'

type ArrayStringConceptCardsProps = {
  concepts: ArrayStringConcept[]
  className?: string
}

export function ArrayStringConceptCards({
  concepts,
  className,
}: ArrayStringConceptCardsProps) {
  return (
    <ul className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {concepts.map((concept) => {
        const body = (
          <>
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-medium text-foreground sm:text-base">
                {concept.title}
              </h3>
              <Badge
                variant={concept.available ? 'primary' : 'muted'}
                className="shrink-0 text-[0.65rem]"
              >
                {concept.available ? 'Available' : 'Coming Soon'}
              </Badge>
            </div>
            <p className="mt-2 flex-1 text-body-sm text-muted-foreground">
              {concept.description}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Difficulty:{' '}
              <span className="font-medium text-foreground">
                {concept.difficulty}
              </span>
            </p>
            {concept.available && concept.href ? (
              <span className="mt-3 inline-flex text-sm font-medium text-primary">
                Open lesson →
              </span>
            ) : null}
          </>
        )

        if (concept.available && concept.href) {
          return (
            <li key={concept.id}>
              <Link
                to={concept.href}
                className={cn(
                  'flex h-full flex-col rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5',
                  'transition-theme hover:border-primary/30 hover:shadow-md',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                )}
              >
                {body}
              </Link>
            </li>
          )
        }

        return (
          <li key={concept.id}>
            <Card className="flex h-full flex-col p-4 opacity-85 hover:border-border hover:shadow-sm sm:p-5">
              {body}
            </Card>
          </li>
        )
      })}
    </ul>
  )
}
