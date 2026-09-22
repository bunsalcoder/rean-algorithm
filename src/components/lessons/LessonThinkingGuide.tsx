import type { LessonThinkingGuide } from '../../data/lessons/types'
import { cn } from '../../lib/cn'
import { LessonSection, LessonSectionHeading } from './LessonSection'

type LessonThinkingGuideProps = {
  guide: LessonThinkingGuide
}

export function LessonThinkingGuideSection({
  guide,
}: LessonThinkingGuideProps) {
  return (
    <LessonSection id="thinking-guide">
      <LessonSectionHeading
        id="thinking-guide"
        eyebrow="MINDSET"
        title={guide.title}
        description={guide.description}
      />

      <ol className="space-y-3">
        {guide.steps.map((step, index) => (
          <li
            key={step}
            className={cn(
              'flex gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm',
              'transition-theme hover:border-primary/30',
            )}
          >
            <span
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-lg',
                'bg-primary-muted font-mono text-sm font-medium text-accent-foreground',
              )}
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <p className="pt-1.5 text-body-sm text-foreground sm:text-body">
              {step}
            </p>
          </li>
        ))}
      </ol>
    </LessonSection>
  )
}
