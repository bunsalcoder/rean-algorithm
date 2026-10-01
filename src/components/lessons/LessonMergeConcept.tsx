import type { LessonMergeConcept } from '../../data/lessons/types'
import { cn } from '../../lib/cn'
import { Card } from '../ui'
import { LessonSection, LessonSectionHeading } from './LessonSection'

type LessonMergeConceptProps = {
  concept: LessonMergeConcept
}

function GroupRow({ groups }: { groups: number[][] }) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      {groups.map((group, groupIndex) => (
        <div key={`group-${groupIndex}`} className="flex items-center gap-2">
          {groupIndex > 0 ? (
            <span
              aria-hidden="true"
              className="font-mono text-xs text-muted-foreground"
            >
              |
            </span>
          ) : null}
          <div
            className={cn(
              'flex flex-wrap items-center gap-1.5 rounded-lg border border-border/80 bg-muted/40 px-2 py-1.5',
              'dark:bg-muted/25',
            )}
          >
            {group.map((value, index) => (
              <span
                key={`${value}-${index}`}
                className={cn(
                  'inline-flex size-9 items-center justify-center rounded-md border font-mono text-xs font-medium sm:size-10 sm:text-sm',
                  group.length === 1
                    ? 'border-emerald-500/40 bg-emerald-500/15 text-foreground ring-1 ring-emerald-500/25'
                    : 'border-border bg-surface text-foreground',
                )}
              >
                {value}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function StageList({
  stages,
}: {
  stages: LessonMergeConcept['divideStages']
}) {
  return (
    <div className="space-y-5">
      {stages.map((stage, index) => (
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
            <GroupRow groups={stage.groups} />
          </div>
          {index === 0 && stage.note ? (
            <p className="mt-2 text-xs text-muted-foreground">{stage.note}</p>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export function LessonMergeConceptSection({
  concept,
}: LessonMergeConceptProps) {
  return (
    <LessonSection id="merge-concept">
      <LessonSectionHeading
        id="merge-concept"
        eyebrow="CORE IDEA"
        title="Divide, Then Merge"
        description="Merge Sort splits the array into smaller pieces, then merges sorted pieces back together. Split → Split → Split → Merge → Merge → Sorted."
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

        <div className="mt-6 space-y-8">
          <div>
            <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
              {concept.divideLabel}
            </p>
            <div className="mt-4">
              <StageList stages={concept.divideStages} />
            </div>
          </div>

          <div>
            <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
              {concept.mergeLabel}
            </p>
            <div className="mt-4">
              <StageList stages={concept.mergeStages} />
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
