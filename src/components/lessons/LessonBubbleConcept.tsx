import type { LessonBubbleConcept } from '../../data/lessons/types'
import { cn } from '../../lib/cn'
import { Card } from '../ui'
import { LessonSection, LessonSectionHeading } from './LessonSection'

type LessonBubbleConceptProps = {
  concept: LessonBubbleConcept
}

function ChipRow({ values, highlight }: { values: number[]; highlight?: number }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((value, index) => {
        const isHighlight = highlight !== undefined && value === highlight && index === values.length - 1
        return (
          <span
            key={`${value}-${index}`}
            className={cn(
              'inline-flex size-9 items-center justify-center rounded-md border font-mono text-xs font-medium sm:size-10 sm:text-sm',
              isHighlight
                ? 'border-emerald-500/40 bg-emerald-500/15 text-foreground ring-1 ring-emerald-500/25'
                : 'border-border bg-muted text-foreground',
            )}
          >
            {value}
          </span>
        )
      })}
    </div>
  )
}

export function LessonBubbleConceptSection({
  concept,
}: LessonBubbleConceptProps) {
  return (
    <LessonSection id="bubble-concept">
      <LessonSectionHeading
        id="bubble-concept"
        eyebrow="CORE IDEA"
        title="Larger Values Bubble Up"
        description="After each pass, one of the largest remaining values reaches its final position."
      />

      <Card className="p-5 sm:p-6 hover:border-primary/25">
        <ul className="space-y-3">
          {concept.paragraphs.map((paragraph) => (
            <li
              key={paragraph}
              className="flex gap-3 text-body-sm text-foreground"
            >
              <span
                aria-hidden="true"
                className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
              />
              <span>{paragraph}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 grid gap-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <div>
            <p className="text-label text-[0.65rem] tracking-[0.08em]">
              Before pass
            </p>
            <div className="mt-2">
              <ChipRow values={concept.before} />
            </div>
          </div>

          <div className="flex flex-col items-center gap-1 text-center">
            <span className="font-mono text-lg font-medium text-primary">
              {concept.bubbledValue}
            </span>
            <span className="text-xs text-muted-foreground" aria-hidden="true">
              ↓ bubbles
            </span>
          </div>

          <div>
            <p className="text-label text-[0.65rem] tracking-[0.08em]">
              After pass 1
            </p>
            <div className="mt-2">
              <ChipRow
                values={concept.after}
                highlight={concept.bubbledValue}
              />
            </div>
          </div>
        </div>

        <p className="mt-5 text-body-sm text-muted-foreground">
          {concept.explanation}
        </p>
      </Card>
    </LessonSection>
  )
}
