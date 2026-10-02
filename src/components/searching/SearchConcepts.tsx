import type { SearchingConcept } from '../../data/algorithms/searching'
import { cn } from '../../lib/cn'
import { Card } from '../ui'

type SearchConceptsProps = {
  concepts: SearchingConcept[]
  className?: string
}

export function SearchConcepts({ concepts, className }: SearchConceptsProps) {
  return (
    <ul className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {concepts.map((concept) => (
        <li key={concept.id}>
          <Card className="h-full p-4 sm:p-5 hover:border-primary/25">
            <h3 className="text-sm font-medium text-foreground sm:text-base">
              {concept.title}
            </h3>
            <p className="mt-2 text-body-sm text-muted-foreground">
              {concept.description}
            </p>
          </Card>
        </li>
      ))}
    </ul>
  )
}
