import type { LessonNestedLoops } from '../../data/lessons/types'
import { cn } from '../../lib/cn'
import { Card } from '../ui'
import { LessonSection, LessonSectionHeading } from './LessonSection'

type LessonNestedLoopsProps = {
  nestedLoops: LessonNestedLoops
}

export function LessonNestedLoopsSection({
  nestedLoops,
}: LessonNestedLoopsProps) {
  return (
    <LessonSection id="nested-loops">
      <LessonSectionHeading
        id="nested-loops"
        eyebrow="LOOPS"
        title="The Two Loops"
        description={nestedLoops.description}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {[nestedLoops.outerLoop, nestedLoops.innerLoop].map((loop) => (
          <Card
            key={loop.title}
            className="p-5 hover:border-primary/25 sm:p-6"
          >
            <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
              {loop.title.includes('Outer') ? 'OUTER' : 'INNER'}
            </p>
            <h3 className="mt-2 text-base font-medium text-foreground">
              {loop.title}
            </h3>
            <p className="mt-2 text-body-sm text-muted-foreground">
              {loop.description}
            </p>
          </Card>
        ))}
      </div>

      <Card className="mt-4 border-primary/20 p-5 sm:p-6 hover:border-primary/35">
        <p className="text-sm font-medium text-foreground">
          {nestedLoops.passShrinkTitle ?? 'Why the inner loop gets shorter'}
        </p>
        <ul className="mt-3 space-y-2">
          {nestedLoops.passShrink.map((line) => (
            <li
              key={line}
              className={cn(
                'flex gap-2 font-mono text-sm text-muted-foreground',
              )}
            >
              <span
                aria-hidden="true"
                className="mt-2 size-1 shrink-0 rounded-full bg-primary"
              />
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-body-sm text-muted-foreground">
          {nestedLoops.passShrinkNote ?? (
            <>
              That is why the inner bound is often written as{' '}
              <span className="font-mono text-foreground">n - i - 1</span> (or{' '}
              <span className="font-mono text-foreground">n - i - 2</span> as the
              last starting index). Sorted suffixes do not need to be compared again.
            </>
          )}
        </p>
      </Card>
    </LessonSection>
  )
}
