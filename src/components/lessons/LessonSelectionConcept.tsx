import type { LessonSelectionConcept } from '../../data/lessons/types'
import { cn } from '../../lib/cn'
import { Card } from '../ui'
import { LessonSection, LessonSectionHeading } from './LessonSection'

type LessonSelectionConceptProps = {
  concept: LessonSelectionConcept
}

function ChipRow({
  values,
  sortedCount = 0,
  highlightIndex,
}: {
  values: number[]
  sortedCount?: number
  highlightIndex?: number
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {values.map((value, index) => {
        const isSorted = index < sortedCount
        const isHighlight = highlightIndex === index

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
                isHighlight
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

export function LessonSelectionConceptSection({
  concept,
}: LessonSelectionConceptProps) {
  return (
    <LessonSection id="selection-concept">
      <LessonSectionHeading
        id="selection-concept"
        eyebrow="CORE IDEA"
        title="Select the Minimum"
        description="Selection Sort repeatedly selects the smallest element from the unsorted portion and places it at the beginning of that portion."
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
          <div>
            <p className="text-label text-[0.65rem] tracking-[0.08em]">
              Start
            </p>
            <div className="mt-2">
              <ChipRow values={concept.before} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Find minimum → {concept.selectedValue}
            </p>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground" aria-hidden="true">
            <span className="font-mono text-lg text-primary">↓</span>
            <span className="text-xs">swap into position</span>
          </div>

          <div>
            <p className="text-label text-[0.65rem] tracking-[0.08em]">
              After selecting {concept.selectedValue}
            </p>
            <div className="mt-2">
              <ChipRow
                values={concept.afterFirst}
                sortedCount={1}
                highlightIndex={0}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground" aria-hidden="true">
            <span className="font-mono text-lg text-primary">↓</span>
            <span className="text-xs">
              find minimum in the unsorted portion → {concept.secondSelectedValue}
            </span>
          </div>

          <div>
            <p className="text-label text-[0.65rem] tracking-[0.08em]">
              Sorted portion grows
            </p>
            <div className="mt-2">
              <ChipRow
                values={concept.afterSecond}
                sortedCount={2}
                highlightIndex={1}
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
