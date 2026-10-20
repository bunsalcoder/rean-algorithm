import { Link } from 'react-router-dom'
import type { PracticeProblem } from '../../data/practice'
import { cn } from '../../lib/cn'
import { Badge, Card } from '../ui'
import { PracticeDifficultyBadge } from './PracticeDifficultyBadge'

type PracticeProblemCardProps = {
  problem: PracticeProblem
  completed?: boolean
  attempted?: boolean
  validationAvailable?: boolean
}

export function PracticeProblemCard({
  problem,
  completed = false,
  attempted = false,
  validationAvailable = false,
}: PracticeProblemCardProps) {
  return (
    <Card
      className={cn(
        'flex h-full flex-col gap-4 p-5 transition-theme sm:p-6',
        'hover:border-primary/30',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <PracticeDifficultyBadge difficulty={problem.difficulty} />
            <Badge variant="muted">{problem.category}</Badge>
            {completed ? (
              <Badge variant="primary" aria-label="Completed this session">
                Completed
              </Badge>
            ) : null}
            {!completed && attempted ? (
              <Badge variant="muted" aria-label="Attempted this session">
                Attempted
              </Badge>
            ) : null}
            {validationAvailable ? (
              <Badge variant="muted" aria-label="Validation available">
                Checks available
              </Badge>
            ) : null}
          </div>
          <h2 className="text-lg font-medium text-foreground sm:text-xl">
            <Link
              to={`/practice/${problem.slug}`}
              className={cn(
                'rounded-sm transition-theme hover:text-primary',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            >
              {problem.title}
            </Link>
          </h2>
        </div>
      </div>

      <p className="line-clamp-3 text-body-sm text-muted-foreground">
        {problem.description}
      </p>

      <ul className="flex flex-wrap gap-1.5" aria-label="Technique tags">
        {problem.tags.slice(0, 4).map((tag) => (
          <li key={tag}>
            <Badge variant="muted" className="font-normal">
              {tag}
            </Badge>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-1">
        <Link
          to={`/practice/${problem.slug}`}
          className={cn(
            'inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium',
            'bg-primary text-primary-foreground shadow-sm transition-theme',
            'hover:bg-primary-hover',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          )}
        >
          Open problem
        </Link>
      </div>
    </Card>
  )
}
