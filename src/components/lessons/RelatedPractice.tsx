import { Card } from '../ui'
import { LessonSection, LessonSectionHeading } from './LessonSection'

export function RelatedPractice() {
  return (
    <LessonSection id="related-practice">
      <LessonSectionHeading
        id="related-practice"
        eyebrow="PRACTICE"
        title="Related Practice"
        description="Hands-on problems tied to this lesson will live here."
      />

      <Card className="flex flex-col items-center justify-center gap-2 border-dashed py-10 text-center hover:border-primary/25">
        <p className="text-base font-medium text-foreground">
          Practice coming soon
        </p>
        <p className="max-w-sm text-body-sm text-muted-foreground">
          Short exercises and interview-style prompts will appear in a future
          update. For now, focus on the concepts above.
        </p>
      </Card>
    </LessonSection>
  )
}
