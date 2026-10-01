import type { LessonHeapConcept } from '../../data/lessons/types'
import { cn } from '../../lib/cn'
import { Card } from '../ui'
import { LessonSection, LessonSectionHeading } from './LessonSection'

type LessonHeapConceptProps = {
  concept: LessonHeapConcept
}

function MiniHeapTree({
  values,
  emphasizeRoot,
}: {
  values: number[]
  emphasizeRoot?: boolean
}) {
  if (values.length === 0) {
    return null
  }

  const levels: number[][] = []
  let index = 0
  let levelSize = 1

  while (index < values.length) {
    const level = values.slice(index, index + levelSize)
    levels.push(level)
    index += levelSize
    levelSize *= 2
  }

  return (
    <div className="flex flex-col items-center gap-2 sm:gap-3">
      {levels.map((level, depth) => (
        <div
          key={`heap-level-${depth}`}
          className="flex items-center justify-center gap-2 sm:gap-4"
        >
          {level.map((value, offset) => {
            const absoluteIndex =
              (depth === 0 ? 0 : 2 ** depth - 1) + offset
            const isRoot = absoluteIndex === 0

            return (
              <span
                key={`${value}-${absoluteIndex}`}
                className={cn(
                  'inline-flex size-9 items-center justify-center rounded-md border font-mono text-xs font-medium sm:size-10 sm:text-sm',
                  isRoot && emphasizeRoot
                    ? 'border-violet-500 bg-violet-500/15 text-foreground ring-2 ring-violet-500/30'
                    : 'border-border bg-surface text-foreground',
                )}
                title={`index ${absoluteIndex}`}
              >
                {value}
              </span>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function ArrayChips({ values }: { values: number[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="font-mono text-xs text-muted-foreground">[</span>
      {values.map((value, index) => (
        <span key={`${value}-${index}`} className="flex items-center gap-1">
          {index > 0 ? (
            <span className="font-mono text-xs text-muted-foreground">,</span>
          ) : null}
          <span
            className={cn(
              'inline-flex size-8 items-center justify-center rounded-md border font-mono text-xs font-medium sm:size-9',
              index === 0
                ? 'border-violet-500/45 bg-violet-500/12 text-foreground'
                : 'border-border bg-muted text-foreground',
            )}
          >
            {value}
          </span>
        </span>
      ))}
      <span className="font-mono text-xs text-muted-foreground">]</span>
    </div>
  )
}

function HeapStage({
  label,
  array,
  note,
  emphasizeRoot,
}: {
  label: string
  array: number[]
  note?: string
  emphasizeRoot?: boolean
}) {
  return (
    <div>
      <p className="text-label text-[0.65rem] tracking-[0.08em]">{label}</p>
      <div className="mt-3 space-y-4">
        <MiniHeapTree values={array} emphasizeRoot={emphasizeRoot} />
        <ArrayChips values={array} />
      </div>
      {note ? (
        <p className="mt-3 text-xs text-muted-foreground">{note}</p>
      ) : null}
    </div>
  )
}

export function LessonHeapConceptSection({ concept }: LessonHeapConceptProps) {
  return (
    <LessonSection id="heap-concept">
      <LessonSectionHeading
        id="heap-concept"
        eyebrow="CORE IDEA"
        title="Array as a Max Heap"
        description="A binary heap is a complete tree stored in an array. Heap Sort uses a Max Heap so the largest remaining value is always at the root."
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

        <div className="mt-6 rounded-lg border border-border/80 bg-muted/40 p-4 dark:bg-muted/25">
          <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
            {concept.indexingTitle}
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {concept.formulas.map((item) => (
              <div
                key={item.label}
                className="rounded-md border border-border bg-surface px-3 py-2"
              >
                <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-1 font-mono text-sm text-foreground">
                  {item.formula}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-body-sm text-muted-foreground">
            Max Heap property:{' '}
            <span className="font-mono text-foreground">
              {concept.maxHeapProperty}
            </span>
          </p>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <HeapStage
            label={concept.before.label}
            array={concept.before.array}
            note={concept.before.note}
          />
          <HeapStage
            label={concept.after.label}
            array={concept.after.array}
            note={concept.after.note}
            emphasizeRoot
          />
        </div>

        <p className="mt-5 text-body-sm text-muted-foreground">
          {concept.explanation}
        </p>
      </Card>
    </LessonSection>
  )
}
