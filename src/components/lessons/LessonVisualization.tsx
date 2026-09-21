import type { LessonVisualization } from '../../data/lessons/types'
import { cn } from '../../lib/cn'
import { LessonSection, LessonSectionHeading } from './LessonSection'

type LessonVisualizationProps = {
  visualization: LessonVisualization
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M8 5.14v13.72a1 1 0 0 0 1.55.83l10.12-6.86a1 1 0 0 0 0-1.66L9.55 4.31A1 1 0 0 0 8 5.14Z" />
    </svg>
  )
}

export function LessonVisualizationPanel({
  visualization,
}: LessonVisualizationProps) {
  return (
    <LessonSection id="visualization">
      <LessonSectionHeading
        id="visualization"
        eyebrow="VISUAL"
        title="Visual Explanation"
        description={visualization.description}
      />

      <div
        className={cn(
          'relative overflow-hidden rounded-xl border border-border bg-surface shadow-sm',
          'transition-theme',
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-40"
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, color-mix(in oklab, var(--primary) 22%, transparent) 1px, transparent 0)',
              backgroundSize: '20px 20px',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary-muted/40 via-transparent to-surface" />
        </div>

        <div className="relative flex min-h-[220px] flex-col items-center justify-center gap-4 px-6 py-12 text-center sm:min-h-[280px]">
          <div
            className={cn(
              'flex size-14 items-center justify-center rounded-full',
              'border border-primary/25 bg-primary-muted text-primary',
              'shadow-sm transition-theme',
            )}
          >
            <PlayIcon className="ml-0.5 size-5" />
          </div>

          <div className="max-w-md">
            <p className="text-base font-medium text-foreground sm:text-lg">
              {visualization.title}
            </p>
            <p className="mt-2 text-body-sm text-muted-foreground">
              Interactive visualization coming soon. This container is ready for
              step-by-step algorithm animations.
            </p>
          </div>

          <div className="mt-2 flex items-end gap-1.5" aria-hidden="true">
            {[40, 72, 56, 88, 48, 64].map((height, index) => (
              <span
                key={index}
                className="w-6 rounded-t-md bg-primary/25 dark:bg-primary/35 sm:w-7"
                style={{ height }}
              />
            ))}
          </div>
        </div>
      </div>
    </LessonSection>
  )
}
