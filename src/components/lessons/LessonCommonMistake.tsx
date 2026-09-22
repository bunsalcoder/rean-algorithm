import type { LessonCommonMistake } from '../../data/lessons/types'
import { cn } from '../../lib/cn'
import { Card } from '../ui'
import { LessonSection, LessonSectionHeading } from './LessonSection'

type LessonCommonMistakeProps = {
  mistake: LessonCommonMistake
}

export function LessonCommonMistakeSection({
  mistake,
}: LessonCommonMistakeProps) {
  return (
    <LessonSection id="common-mistake">
      <LessonSectionHeading
        id="common-mistake"
        eyebrow="WATCH OUT"
        title="Common Beginner Mistake"
        description="Do not swap immediately every time you find a smaller value."
      />

      <Card className="border-amber-500/25 p-5 sm:p-6 hover:border-amber-500/40">
        <ul className="space-y-3">
          {mistake.paragraphs.map((paragraph) => (
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

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-rose-500/25 bg-rose-500/5 px-4 py-3 dark:bg-rose-400/10">
            <p className="text-label text-[0.65rem] tracking-[0.08em] text-rose-700 dark:text-rose-300">
              Incorrect mental model
            </p>
            <ol className="mt-3 space-y-2">
              {mistake.incorrect.map((step, index) => (
                <li
                  key={step}
                  className={cn(
                    'flex gap-2 text-body-sm text-muted-foreground',
                  )}
                >
                  <span className="font-mono text-rose-600 dark:text-rose-300">
                    {index + 1}.
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/5 px-4 py-3 dark:bg-emerald-400/10">
            <p className="text-label text-[0.65rem] tracking-[0.08em] text-emerald-700 dark:text-emerald-300">
              Selection Sort does this
            </p>
            <ol className="mt-3 space-y-2">
              {mistake.correct.map((step, index) => (
                <li
                  key={step}
                  className={cn(
                    'flex gap-2 text-body-sm text-muted-foreground',
                  )}
                >
                  <span className="font-mono text-emerald-600 dark:text-emerald-300">
                    {index + 1}.
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <p className="mt-5 text-body-sm text-muted-foreground">
          {mistake.explanation}
        </p>
      </Card>
    </LessonSection>
  )
}
