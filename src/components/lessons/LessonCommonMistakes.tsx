import type { LessonCommonMistakesList } from '../../data/lessons/types'
import { Card } from '../ui'
import { LessonSection, LessonSectionHeading } from './LessonSection'

type LessonCommonMistakesProps = {
  mistakes: LessonCommonMistakesList
}

export function LessonCommonMistakesSection({
  mistakes,
}: LessonCommonMistakesProps) {
  return (
    <LessonSection id="common-mistakes">
      <LessonSectionHeading
        id="common-mistakes"
        eyebrow="WATCH OUT"
        title="Common Beginner Mistakes"
        description={
          mistakes.description ??
          'These mistakes show up often when learners first write Insertion Sort.'
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {mistakes.mistakes.map((mistake, index) => (
          <Card
            key={mistake.title}
            className="border-amber-500/25 p-4 sm:p-5 hover:border-amber-500/40"
          >
            <p className="text-label text-[0.65rem] tracking-[0.08em] text-amber-700 dark:text-amber-300">
              Mistake {index + 1}
            </p>
            <h3 className="mt-2 text-sm font-medium text-foreground">
              {mistake.title}
            </h3>
            <p className="mt-2 text-body-sm text-muted-foreground">
              {mistake.explanation}
            </p>
          </Card>
        ))}
      </div>
    </LessonSection>
  )
}
