import { Card } from '../ui'
import { LessonSection, LessonSectionHeading } from './LessonSection'

type LessonWhyItMattersProps = {
  points: string[]
}

export function LessonWhyItMatters({ points }: LessonWhyItMattersProps) {
  return (
    <LessonSection id="why-it-matters">
      <LessonSectionHeading
        id="why-it-matters"
        eyebrow="CONTEXT"
        title="Why It Matters"
        description="Why this idea shows up in interviews, contests, and real software."
      />

      <div className="grid gap-3 sm:grid-cols-1">
        {points.map((point) => (
          <Card key={point} className="p-5 hover:border-primary/30">
            <p className="text-body-sm text-foreground sm:text-body">{point}</p>
          </Card>
        ))}
      </div>
    </LessonSection>
  )
}
