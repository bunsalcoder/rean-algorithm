import type { LessonSortedRequirement } from '../../data/lessons/types'
import { cn } from '../../lib/cn'
import { Card } from '../ui'
import { LessonSection, LessonSectionHeading } from './LessonSection'

type LessonSortedRequirementProps = {
  requirement: LessonSortedRequirement
}

function ArrayChipRow({
  label,
  values,
  tone,
}: {
  label: string
  values: number[]
  tone: 'sorted' | 'unsorted'
}) {
  return (
    <div>
      <p
        className={cn(
          'text-label text-[0.65rem] tracking-[0.08em]',
          tone === 'sorted'
            ? 'text-emerald-700 dark:text-emerald-300'
            : 'text-amber-700 dark:text-amber-300',
        )}
      >
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {values.map((value, index) => (
          <span
            key={`${label}-${value}-${index}`}
            className={cn(
              'inline-flex size-9 items-center justify-center rounded-md border font-mono text-xs font-medium sm:size-10 sm:text-sm',
              tone === 'sorted'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-foreground'
                : 'border-amber-500/30 bg-amber-500/10 text-foreground',
            )}
          >
            {value}
          </span>
        ))}
      </div>
    </div>
  )
}

export function LessonSortedRequirementSection({
  requirement,
}: LessonSortedRequirementProps) {
  return (
    <LessonSection id="sorted-requirement">
      <LessonSectionHeading
        id="sorted-requirement"
        eyebrow="REQUIREMENT"
        title="Must Be Sorted"
        description="Binary Search depends on order. Without sorting, discarding a half is unsafe."
      />

      <Card className="border-amber-500/25 p-5 sm:p-6 hover:border-amber-500/40">
        <ul className="space-y-3">
          {requirement.paragraphs.map((paragraph) => (
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

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <ArrayChipRow
            label="Sorted"
            values={requirement.sorted}
            tone="sorted"
          />
          <ArrayChipRow
            label="Unsorted"
            values={requirement.unsorted}
            tone="unsorted"
          />
        </div>

        <p className="mt-5 text-body-sm text-muted-foreground">
          {requirement.explanation}
        </p>
      </Card>
    </LessonSection>
  )
}
