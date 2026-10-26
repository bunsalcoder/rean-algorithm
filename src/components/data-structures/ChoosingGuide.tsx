import { Link } from 'react-router-dom'
import {
  getDataStructureById,
  structureScenarios,
} from '../../data/data-structures'
import { cn } from '../../lib/cn'
import { Badge } from '../ui'

type ChoosingGuideProps = {
  className?: string
}

export function ChoosingGuide({ className }: ChoosingGuideProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <p className="text-body-sm text-muted-foreground">
        No structure is universally best. Match the access pattern you need,
        then weigh memory, complexity assumptions, and implementation cost.
      </p>
      <ul className="space-y-2">
        {structureScenarios.map((scenario) => {
          const structure = getDataStructureById(scenario.structureId)
          const isAvailable = structure?.availability === 'available'
          const href = structure?.href

          const body = (
            <>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-sm font-medium text-foreground">
                  {scenario.need}
                </p>
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-sm font-medium text-primary">
                    → {scenario.structureName}
                  </span>
                  {!isAvailable ? (
                    <Badge variant="muted" className="text-[0.6rem]">
                      Coming Soon
                    </Badge>
                  ) : null}
                </span>
              </div>
              <p className="mt-1.5 text-body-sm text-muted-foreground">
                {scenario.rationale}
              </p>
            </>
          )

          if (isAvailable && href) {
            return (
              <li key={scenario.id}>
                <Link
                  to={href}
                  className={cn(
                    'block rounded-xl border border-border bg-surface p-4 shadow-sm',
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
            <li key={scenario.id}>
              <div className="rounded-xl border border-border bg-surface p-4 opacity-90">
                {body}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
