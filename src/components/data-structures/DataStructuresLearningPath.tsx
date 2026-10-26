import { Link } from 'react-router-dom'
import {
  dataStructureLearningPath,
  type DataStructureLearningStep,
} from '../../data/data-structures'
import { cn } from '../../lib/cn'
import { Badge } from '../ui'

type DataStructuresLearningPathProps = {
  steps?: DataStructureLearningStep[]
  className?: string
}

export function DataStructuresLearningPath({
  steps = dataStructureLearningPath,
  className,
}: DataStructuresLearningPathProps) {
  return (
    <ol className={cn('space-y-2', className)}>
      {steps.map((step, index) => {
        const isAvailable = step.availability === 'available' && Boolean(step.href)
        const content = (
          <>
            <span
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-md font-mono text-xs font-medium',
                isAvailable
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  'block text-sm font-medium',
                  isAvailable ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {step.title}
              </span>
              <span className="mt-0.5 block text-body-sm text-muted-foreground">
                {step.description}
              </span>
            </span>
            {isAvailable ? (
              <span className="shrink-0 text-sm font-medium text-primary">
                Open →
              </span>
            ) : (
              <Badge variant="muted" className="shrink-0 text-[0.65rem]">
                Coming Soon
              </Badge>
            )}
          </>
        )

        if (!isAvailable || !step.href) {
          return (
            <li key={step.id}>
              <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3 opacity-80 sm:items-center">
                {content}
              </div>
            </li>
          )
        }

        const isHashLink = step.href.includes('#')
        if (isHashLink) {
          return (
            <li key={step.id}>
              <a
                href={step.href}
                className={cn(
                  'flex items-start gap-3 rounded-xl border border-border bg-surface p-3 shadow-sm sm:items-center',
                  'transition-theme hover:border-primary/30 hover:shadow-md',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                )}
              >
                {content}
              </a>
            </li>
          )
        }

        return (
          <li key={step.id}>
            <Link
              to={step.href}
              className={cn(
                'flex items-start gap-3 rounded-xl border border-border bg-surface p-3 shadow-sm sm:items-center',
                'transition-theme hover:border-primary/30 hover:shadow-md',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              )}
            >
              {content}
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
