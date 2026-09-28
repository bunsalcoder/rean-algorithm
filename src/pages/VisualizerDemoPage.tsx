import { useMemo, useState } from 'react'
import {
  AlgorithmVisualizer,
  DEFAULT_DEMO_ARRAY,
  buildDemoVisualizationSteps,
  type ArrayPreset,
} from '../components/visualizations'
import { Container, Section } from '../components/ui'

const DEMO_PRESETS: readonly ArrayPreset[] = [
  {
    id: 'default',
    label: 'Demo [7, 2, 9, 4, 1, 6]',
    values: DEFAULT_DEMO_ARRAY,
  },
  {
    id: 'small',
    label: 'Small [3, 1, 4]',
    values: [3, 1, 4],
  },
  {
    id: 'sorted',
    label: 'Sorted [1, 2, 3, 4, 5]',
    values: [1, 2, 3, 4, 5],
  },
]

/**
 * Temporary playground for the reusable visualization engine.
 * Safe to remove or replace once algorithm lessons adopt the engine.
 */
export function VisualizerDemoPage() {
  const [array, setArray] = useState<number[]>([...DEFAULT_DEMO_ARRAY])
  const steps = useMemo(() => buildDemoVisualizationSteps(array), [array])

  return (
    <Section className="relative overflow-hidden py-10 sm:py-12 lg:py-14">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 size-72 rounded-full bg-primary/10 blur-3xl dark:bg-primary/16" />
        <div className="absolute -right-20 top-40 size-64 rounded-full bg-primary/8 blur-3xl dark:bg-primary/12" />
      </div>

      <Container size="lg" className="relative">
        <div className="max-w-2xl">
          <p className="text-label text-primary">PLAYGROUND</p>
          <h1 className="mt-2 text-foreground">Visualizer Demo</h1>
          <p className="mt-3 text-body text-muted-foreground">
            Temporary sandbox for the reusable algorithm visualization engine.
            Try playback, speed changes, and array input controls. This is not a
            complete algorithm lesson.
          </p>
        </div>

        <div className="mt-8 sm:mt-10">
          <AlgorithmVisualizer
            title="Array walkthrough demo"
            category="Visualization Engine"
            array={array}
            steps={steps}
            onArrayChange={setArray}
            inputOptions={{
              presets: DEMO_PRESETS,
              minSize: 3,
              maxSize: 10,
              allowRandom: true,
              allowSizeAdjust: true,
              randomMin: 1,
              randomMax: 20,
            }}
          />
        </div>
      </Container>
    </Section>
  )
}
