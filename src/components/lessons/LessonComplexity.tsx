import type { LessonComplexity } from '../../data/lessons/types'
import { cn } from '../../lib/cn'
import { Badge, Card } from '../ui'
import { LessonSection, LessonSectionHeading } from './LessonSection'

type LessonComplexityProps = {
  complexity: LessonComplexity
}

type Metric = {
  label: string
  value: string
  accent?: boolean
}

export function LessonComplexitySection({ complexity }: LessonComplexityProps) {
  const metrics: Metric[] = [
    { label: 'Best Case', value: complexity.time.best },
    { label: 'Average Case', value: complexity.time.average, accent: true },
    { label: 'Worst Case', value: complexity.time.worst },
    { label: 'Space Complexity', value: complexity.space },
  ]

  return (
    <LessonSection id="complexity">
      <LessonSectionHeading
        id="complexity"
        eyebrow="ANALYSIS"
        title="Complexity"
        description="How cost grows as the input size increases."
      />

      <Card className="p-5 sm:p-6 hover:border-primary/25">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <Badge variant="primary">Time Complexity</Badge>
          <Badge variant="muted">Space Complexity</Badge>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className={cn(
                'rounded-lg border border-border bg-muted/50 px-4 py-3 transition-theme',
                'dark:bg-muted/30',
                metric.accent && 'border-primary/25 bg-primary-muted/50 dark:bg-primary-muted/30',
              )}
            >
              <p className="text-label text-[0.65rem] tracking-[0.08em]">
                {metric.label}
              </p>
              <p
                className={cn(
                  'mt-1 font-mono text-base font-medium sm:text-lg',
                  metric.accent ? 'text-primary' : 'text-foreground',
                )}
              >
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </LessonSection>
  )
}
