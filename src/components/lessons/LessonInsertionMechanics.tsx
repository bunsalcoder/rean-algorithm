import type { LessonInsertionMechanics } from '../../data/lessons/types'
import { cn } from '../../lib/cn'
import { Card } from '../ui'
import { LessonSection, LessonSectionHeading } from './LessonSection'

type LessonInsertionMechanicsProps = {
  mechanics: LessonInsertionMechanics
}

export function LessonInsertionMechanicsSection({
  mechanics,
}: LessonInsertionMechanicsProps) {
  const { startAtOne, moveBackward, whileCondition } = mechanics

  return (
    <LessonSection id="insertion-mechanics">
      <LessonSectionHeading
        id="insertion-mechanics"
        eyebrow="MECHANICS"
        title="Why the Loops Work This Way"
        description="Three beginner questions: why i starts at 1, why j moves backward, and what the while condition means."
      />

      <div className="space-y-4">
        <Card className="p-5 sm:p-6 hover:border-primary/25">
          <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
            WHY i = 1
          </p>
          <h3 className="mt-2 text-base font-medium text-foreground">
            The first element is already sorted
          </h3>
          <ul className="mt-3 space-y-2">
            {startAtOne.paragraphs.map((paragraph) => (
              <li
                key={paragraph}
                className="flex gap-3 text-body-sm text-muted-foreground"
              >
                <span
                  aria-hidden="true"
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                />
                <span>{paragraph}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-lg border border-border bg-muted/40 px-4 py-3 dark:bg-muted/20">
            <p className="font-mono text-sm text-foreground">
              [{startAtOne.sortedPrefix.join(', ')}]
              <span className="mx-2 text-muted-foreground">|</span>[
              {startAtOne.remaining.join(', ')}]
            </p>
            <p className="mt-2 text-body-sm text-muted-foreground">
              First key ={' '}
              <span className="font-mono text-foreground">
                {startAtOne.firstKey}
              </span>
              , not the first element.
            </p>
          </div>
        </Card>

        <Card className="p-5 sm:p-6 hover:border-primary/25">
          <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
            WHY j MOVES BACKWARD
          </p>
          <h3 className="mt-2 text-base font-medium text-foreground">
            Search the sorted portion from right to left
          </h3>
          <ul className="mt-3 space-y-2">
            {moveBackward.paragraphs.map((paragraph) => (
              <li
                key={paragraph}
                className="flex gap-3 text-body-sm text-muted-foreground"
              >
                <span
                  aria-hidden="true"
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                />
                <span>{paragraph}</span>
              </li>
            ))}
          </ul>
          <ol className="mt-4 space-y-2 rounded-lg border border-border bg-muted/40 px-4 py-3 dark:bg-muted/20">
            {moveBackward.steps.map((step, index) => (
              <li
                key={step}
                className={cn(
                  'flex gap-2 font-mono text-sm text-muted-foreground',
                )}
              >
                <span className="text-primary">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Card>

        <Card className="p-5 sm:p-6 hover:border-primary/25">
          <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
            WHILE CONDITION
          </p>
          <h3 className="mt-2 text-base font-medium text-foreground">
            <span className="font-mono text-sm sm:text-base">
              while (j &gt;= 0 &amp;&amp; array[j] &gt; key)
            </span>
          </h3>
          <ul className="mt-3 space-y-2">
            {whileCondition.paragraphs.map((paragraph) => (
              <li
                key={paragraph}
                className="flex gap-3 text-body-sm text-muted-foreground"
              >
                <span
                  aria-hidden="true"
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                />
                <span>{paragraph}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {whileCondition.conditions.map((condition) => (
              <div
                key={condition.code}
                className="rounded-lg border border-border bg-muted/40 px-4 py-3 dark:bg-muted/20"
              >
                <p className="font-mono text-sm text-foreground">
                  {condition.code}
                </p>
                <p className="mt-2 text-body-sm text-muted-foreground">
                  {condition.explanation}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </LessonSection>
  )
}
