import type { LessonOptimizationNote } from '../../data/lessons/types'
import { cn } from '../../lib/cn'
import { Card } from '../ui'
import { LessonSection, LessonSectionHeading } from './LessonSection'

type LessonOptimizationNoteProps = {
  note: LessonOptimizationNote
}

export function LessonOptimizationNoteSection({
  note,
}: LessonOptimizationNoteProps) {
  return (
    <LessonSection id="optimization">
      <LessonSectionHeading
        id="optimization"
        eyebrow="OPTIONAL"
        title="Early Exit Optimization"
        description="A common improvement — separate from the basic Bubble Sort shown in the visualization."
      />

      <Card className="border-amber-500/25 p-5 sm:p-6 hover:border-amber-500/40">
        <ul className="space-y-3">
          {note.paragraphs.map((paragraph) => (
            <li
              key={paragraph}
              className="flex gap-3 text-body-sm text-foreground"
            >
              <span
                aria-hidden="true"
                className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500"
              />
              <span>{paragraph}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 rounded-lg border border-border bg-muted/40 px-4 py-3 dark:bg-muted/20">
          <p className="text-label text-[0.65rem] tracking-[0.08em]">
            Already sorted example
          </p>
          <p className="mt-1 font-mono text-sm text-foreground">
            [{note.exampleArray.join(', ')}]
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            If one full pass makes{' '}
            <span className="font-mono text-foreground">swaps = 0</span>, stop
            early. Optimized best case:{' '}
            <span className="font-mono text-foreground">{note.bestCase}</span>
          </p>
        </div>

        <p className={cn('mt-4 text-body-sm text-muted-foreground')}>
          {note.explanation}
        </p>
      </Card>
    </LessonSection>
  )
}
