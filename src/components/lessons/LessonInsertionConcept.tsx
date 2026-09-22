import type { LessonInsertionConcept } from '../../data/lessons/types'
import { cn } from '../../lib/cn'
import { Card } from '../ui'
import { LessonSection, LessonSectionHeading } from './LessonSection'

type LessonInsertionConceptProps = {
  concept: LessonInsertionConcept
}

function ChipRow({
  values,
  sortedCount = 0,
  keyIndex,
}: {
  values: number[]
  sortedCount?: number
  keyIndex?: number
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {values.map((value, index) => {
        const isSorted = index < sortedCount
        const isKey = keyIndex === index

        return (
          <span key={`${value}-${index}`} className="flex items-center gap-1.5">
            {sortedCount > 0 && index === sortedCount ? (
              <span
                aria-hidden="true"
                className="mx-0.5 font-mono text-xs text-muted-foreground"
              >
                |
              </span>
            ) : null}
            <span
              className={cn(
                'inline-flex size-9 items-center justify-center rounded-md border font-mono text-xs font-medium sm:size-10 sm:text-sm',
                isKey
                  ? 'border-sky-500/50 bg-sky-500/15 text-foreground ring-1 ring-sky-500/25'
                  : isSorted
                    ? 'border-emerald-500/40 bg-emerald-500/15 text-foreground ring-1 ring-emerald-500/25'
                    : 'border-border bg-muted text-foreground',
              )}
            >
              {value}
            </span>
          </span>
        )
      })}
    </div>
  )
}

export function LessonInsertionConceptSection({
  concept,
}: LessonInsertionConceptProps) {
  return (
    <LessonSection id="insertion-concept">
      <LessonSectionHeading
        id="insertion-concept"
        eyebrow="CORE IDEA"
        title="Insert the Key"
        description="Insertion Sort takes one element from the unsorted portion and inserts it into the correct position in the sorted portion — by shifting, not swapping."
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

        <div className="mt-6 space-y-5">
          {concept.stages.map((stage, index) => (
            <div key={`${stage.label}-${index}`}>
              {index > 0 ? (
                <div
                  className="mb-5 flex items-center gap-2 text-muted-foreground"
                  aria-hidden="true"
                >
                  <span className="font-mono text-lg text-primary">↓</span>
                  {stage.note ? (
                    <span className="text-xs">{stage.note}</span>
                  ) : null}
                </div>
              ) : null}

              <p className="text-label text-[0.65rem] tracking-[0.08em]">
                {stage.label}
              </p>
              <div className="mt-2">
                <ChipRow
                  values={stage.values}
                  sortedCount={stage.sortedCount}
                  keyIndex={stage.keyIndex}
                />
              </div>
              {index === 0 && stage.note ? (
                <p className="mt-2 text-xs text-muted-foreground">{stage.note}</p>
              ) : null}
            </div>
          ))}
        </div>

        <p className="mt-5 text-body-sm text-muted-foreground">
          {concept.explanation}
        </p>
      </Card>
    </LessonSection>
  )
}
