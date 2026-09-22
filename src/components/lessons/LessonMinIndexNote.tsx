import type { LessonMinIndexNote } from '../../data/lessons/types'
import { Card } from '../ui'
import { LessonSection, LessonSectionHeading } from './LessonSection'

type LessonMinIndexNoteProps = {
  note: LessonMinIndexNote
}

export function LessonMinIndexNoteSection({ note }: LessonMinIndexNoteProps) {
  return (
    <LessonSection id="min-index">
      <LessonSectionHeading
        id="min-index"
        eyebrow="KEY VARIABLE"
        title="Understanding minIndex"
        description="minIndex remembers where the smallest value is — without swapping yet."
      />

      <Card className="p-5 sm:p-6 hover:border-primary/25">
        <ul className="space-y-3">
          {note.paragraphs.map((paragraph) => (
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

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 dark:bg-muted/20">
            <p className="text-label text-[0.65rem] tracking-[0.08em]">
              Starting belief
            </p>
            <p className="mt-1 font-mono text-sm text-foreground">
              {note.initialExample}
            </p>
            <p className="mt-2 text-body-sm text-muted-foreground">
              “So far, I believe this index holds the smallest value.”
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 dark:bg-muted/20">
            <p className="text-label text-[0.65rem] tracking-[0.08em]">
              When to update
            </p>
            <p className="mt-1 font-mono text-sm text-foreground">
              {note.updateCondition}
            </p>
            <p className="mt-2 text-body-sm text-muted-foreground">
              Then set <span className="font-mono text-foreground">minIndex = j</span>
            </p>
          </div>
        </div>

        <p className="mt-5 rounded-lg border border-primary/20 bg-primary-muted/30 px-4 py-3 text-body-sm text-foreground">
          {note.keyInsight}
        </p>
      </Card>
    </LessonSection>
  )
}
