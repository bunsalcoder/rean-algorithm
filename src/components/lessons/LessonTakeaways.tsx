import { Card } from '../ui'
import { LessonSection, LessonSectionHeading } from './LessonSection'

type LessonTakeawaysProps = {
  takeaways: string[]
}

export function LessonTakeaways({ takeaways }: LessonTakeawaysProps) {
  return (
    <LessonSection id="key-takeaways">
      <LessonSectionHeading
        id="key-takeaways"
        eyebrow="SUMMARY"
        title="Key Takeaways"
        description="The main ideas to remember from this lesson."
      />

      <Card className="border-primary/20 bg-primary-muted/40 hover:border-primary/35 dark:bg-primary-muted/25">
        <ul className="space-y-3">
          {takeaways.map((takeaway) => (
            <li
              key={takeaway}
              className="flex gap-3 text-body-sm font-medium text-foreground sm:text-body"
            >
              <span
                aria-hidden="true"
                className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
              />
              <span>{takeaway}</span>
            </li>
          ))}
        </ul>
      </Card>
    </LessonSection>
  )
}
