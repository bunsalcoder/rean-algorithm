import { CodeBlock } from './CodeBlock'
import { LessonSection, LessonSectionHeading } from './LessonSection'

type LessonPseudocodeProps = {
  pseudocode: string
}

export function LessonPseudocode({ pseudocode }: LessonPseudocodeProps) {
  return (
    <LessonSection id="pseudocode">
      <LessonSectionHeading
        id="pseudocode"
        eyebrow="PSEUDOCODE"
        title="Pseudocode"
        description="Language-agnostic steps you can translate into any programming language."
      />

      <CodeBlock code={pseudocode} label="pseudocode" />
    </LessonSection>
  )
}
