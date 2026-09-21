import { LessonSection, LessonSectionHeading } from './LessonSection'

type LessonOverviewProps = {
  paragraphs: string[]
}

export function LessonOverview({ paragraphs }: LessonOverviewProps) {
  return (
    <LessonSection id="overview">
      <LessonSectionHeading
        id="overview"
        eyebrow="OVERVIEW"
        title="Overview"
        description="A clear explanation of the concept before you dive into steps and code."
      />

      <div className="space-y-4">
        {paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className={
              index === 0
                ? 'rounded-lg border border-primary/15 bg-primary-muted/60 px-4 py-3 text-body text-foreground dark:bg-primary-muted/40'
                : 'text-body text-muted-foreground'
            }
          >
            {paragraph}
          </p>
        ))}
      </div>
    </LessonSection>
  )
}
