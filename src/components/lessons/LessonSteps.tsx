import type { LessonStep } from '../../data/lessons/types'
import { cn } from '../../lib/cn'
import { LessonSection, LessonSectionHeading } from './LessonSection'

type LessonStepsProps = {
  steps: LessonStep[]
}

export function LessonSteps({ steps }: LessonStepsProps) {
  return (
    <LessonSection id="steps">
      <LessonSectionHeading
        id="steps"
        eyebrow="WALKTHROUGH"
        title="Step-by-Step Explanation"
        description="Follow the process in order. Each step builds on the one before it."
      />

      <ol className="relative space-y-4">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className={cn(
              'relative flex gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm',
              'sm:gap-5 sm:p-5',
              'transition-theme hover:border-primary/30 hover:shadow-md',
            )}
          >
            <span
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-lg',
                'bg-primary-muted font-mono text-sm font-medium text-accent-foreground',
                'transition-theme',
              )}
              aria-hidden="true"
            >
              {index + 1}
            </span>

            <div className="min-w-0 pt-0.5">
              <h3 className="text-base font-medium text-foreground">
                <span className="sr-only">Step {index + 1}: </span>
                {step.title}
              </h3>
              <p className="mt-1.5 text-body-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </LessonSection>
  )
}
