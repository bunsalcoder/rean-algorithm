import { learningPathSteps } from '../../data/learningHighlights'
import { cn } from '../../lib/cn'

type LearningPathProps = {
  className?: string
}

export function LearningPath({ className }: LearningPathProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'inline-flex flex-col gap-1 rounded-xl border border-border bg-surface/80 p-4',
        'shadow-sm backdrop-blur-sm dark:bg-surface/60',
        className,
      )}
    >
      {learningPathSteps.map((step, index) => (
        <div key={step} className="flex flex-col items-start">
          <span
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-medium tracking-wide',
              index === learningPathSteps.length - 1
                ? 'bg-primary/15 text-primary dark:bg-primary/20'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {step}
          </span>
          {index < learningPathSteps.length - 1 ? (
            <span className="ml-4 py-0.5 text-xs text-primary/50">↓</span>
          ) : null}
        </div>
      ))}
    </div>
  )
}
