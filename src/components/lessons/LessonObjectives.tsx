import { Card } from '../ui'
import { LessonSection, LessonSectionHeading } from './LessonSection'

type LessonObjectivesProps = {
  objectives: string[]
}

export function LessonObjectives({ objectives }: LessonObjectivesProps) {
  return (
    <LessonSection id="objectives">
      <LessonSectionHeading
        id="objectives"
        eyebrow="LEARNING GOALS"
        title="Learning Objectives"
        description="What you will understand and be able to do after this lesson."
      />

      <Card className="hover:border-primary/25 hover:shadow-md">
        <ul className="space-y-3">
          {objectives.map((objective) => (
            <li key={objective} className="flex gap-3 text-body-sm text-foreground sm:text-body">
              <span
                aria-hidden="true"
                className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
              />
              <span>{objective}</span>
            </li>
          ))}
        </ul>
      </Card>
    </LessonSection>
  )
}
