import type { LessonSortProperties } from '../../data/lessons/types'
import { Card } from '../ui'
import { LessonSection, LessonSectionHeading } from './LessonSection'

type LessonSortPropertiesProps = {
  properties: LessonSortProperties
}

export function LessonSortPropertiesSection({
  properties,
}: LessonSortPropertiesProps) {
  return (
    <LessonSection id="sort-properties">
      <LessonSectionHeading
        id="sort-properties"
        eyebrow="PROPERTIES"
        title="Important Properties"
        description={
          properties.description ??
          'Two traits worth knowing about Insertion Sort: stability and in-place sorting.'
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {properties.items.map((item) => (
          <Card key={item.title} className="p-5 sm:p-6 hover:border-primary/25">
            <h3 className="text-base font-medium text-foreground">{item.title}</h3>
            <p className="mt-2 text-body-sm text-muted-foreground">
              {item.description}
            </p>
            {item.steps ? (
              <ol className="mt-4 space-y-2 rounded-lg border border-border bg-muted/40 px-4 py-3 dark:bg-muted/20">
                {item.steps.map((step, index) => (
                  <li
                    key={step}
                    className="flex gap-2 font-mono text-sm text-muted-foreground"
                  >
                    <span className="text-primary">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            ) : null}
          </Card>
        ))}
      </div>
    </LessonSection>
  )
}
