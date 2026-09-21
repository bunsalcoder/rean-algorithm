import { roadmapStages } from '../../data/roadmap'
import { Container, Section } from '../ui'
import { RoadmapStageCard } from './RoadmapStageCard'

export function RoadmapPath() {
  return (
    <Section className="relative overflow-hidden pb-16 pt-2 sm:pb-20 sm:pt-4 lg:pb-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 size-80 -translate-x-1/2 rounded-full bg-primary/6 blur-3xl dark:bg-primary/10" />
      </div>

      <Container size="md" className="relative">
        <ol className="relative flex flex-col gap-8 sm:gap-10 lg:gap-12">
          {roadmapStages.map((stage, index) => (
            <RoadmapStageCard
              key={stage.id}
              stage={stage}
              index={index}
              isLast={index === roadmapStages.length - 1}
            />
          ))}
        </ol>

        <div
          aria-hidden="true"
          className="mx-auto mt-2 flex flex-col items-center gap-2 pl-10 sm:pl-12 lg:pl-0"
        >
          <div className="roadmap-path-pulse size-2.5 rounded-full bg-primary/50" />
          <p className="text-xs font-medium tracking-wide text-muted-foreground">
            Keep going — mastery awaits
          </p>
        </div>
      </Container>
    </Section>
  )
}
