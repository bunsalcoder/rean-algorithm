import type { LessonAlgorithmConnection } from '../../data/lessons/types'
import { cn } from '../../lib/cn'
import { Card } from '../ui'
import { LessonSection, LessonSectionHeading } from './LessonSection'

type LessonAlgorithmConnectionProps = {
  connection: LessonAlgorithmConnection
}

export function LessonAlgorithmConnectionSection({
  connection,
}: LessonAlgorithmConnectionProps) {
  return (
    <LessonSection id="algorithm-connection">
      <LessonSectionHeading
        id="algorithm-connection"
        eyebrow="CONNECTION"
        title="Search vs Sort"
        description={connection.description}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {connection.items.map((item) => (
          <Card
            key={item.title}
            className={cn('p-4 sm:p-5 hover:border-primary/25')}
          >
            <p className="text-sm font-medium text-foreground">{item.title}</p>
            <p className="mt-2 text-body-sm text-muted-foreground">
              {item.description}
            </p>
          </Card>
        ))}
      </div>
    </LessonSection>
  )
}
