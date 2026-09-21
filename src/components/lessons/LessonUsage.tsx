import { Card } from '../ui'
import { LessonSection, LessonSectionHeading } from './LessonSection'

type LessonUsageProps = {
  whenToUse: string[]
  whenNotToUse: string[]
}

function UsageList({
  items,
  tone,
}: {
  items: string[]
  tone: 'positive' | 'caution'
}) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-body-sm text-foreground">
          <span
            aria-hidden="true"
            className={
              tone === 'positive'
                ? 'mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500'
                : 'mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500'
            }
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function LessonUsage({ whenToUse, whenNotToUse }: LessonUsageProps) {
  return (
    <div className="space-y-12 sm:space-y-14">
      <LessonSection id="when-to-use">
        <LessonSectionHeading
          id="when-to-use"
          eyebrow="GUIDANCE"
          title="When to Use"
          description="Situations where this approach is a strong fit."
        />
        <Card className="border-emerald-500/20 hover:border-emerald-500/35">
          <UsageList items={whenToUse} tone="positive" />
        </Card>
      </LessonSection>

      <LessonSection id="when-not-to-use">
        <LessonSectionHeading
          id="when-not-to-use"
          eyebrow="GUIDANCE"
          title="When Not to Use"
          description="Cases where another approach may serve you better."
        />
        <Card className="border-amber-500/20 hover:border-amber-500/35">
          <UsageList items={whenNotToUse} tone="caution" />
        </Card>
      </LessonSection>
    </div>
  )
}
