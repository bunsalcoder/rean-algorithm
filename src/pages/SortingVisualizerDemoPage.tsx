import { useMemo, useState } from 'react'
import {
  AlgorithmVisualizer,
  type ArrayPreset,
} from '../components/visualizations'
import { Container, Section } from '../components/ui'
import {
  SORTING_DEMO_DEFAULT_ARRAY,
  SORTING_DEMO_PRESETS,
  buildSortingDemoSteps,
} from '../lib/sortingDemo'

const DEMO_PRESETS: readonly ArrayPreset[] = SORTING_DEMO_PRESETS.map(
  (preset) => ({
    id: preset.id,
    label: preset.label,
    values: [...preset.values],
  }),
)

/**
 * Playground for sorting-oriented visualization states.
 * Not a complete sorting algorithm lesson.
 */
export function SortingVisualizerDemoPage() {
  const [array, setArray] = useState<number[]>([
    ...SORTING_DEMO_DEFAULT_ARRAY,
  ])
  const steps = useMemo(() => buildSortingDemoSteps(array), [array])

  return (
    <Section className="relative overflow-hidden py-10 sm:py-12 lg:py-14">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 size-72 rounded-full bg-primary/10 blur-3xl dark:bg-primary/16" />
        <div className="absolute -right-20 top-40 size-64 rounded-full bg-primary/8 blur-3xl dark:bg-primary/12" />
      </div>

      <Container size="lg" className="relative">
        <div className="max-w-2xl">
          <p className="text-label text-primary">PLAYGROUND</p>
          <h1 className="mt-2 text-foreground">Sorting Visualizer Demo</h1>
          <p className="mt-3 text-body text-muted-foreground">
            A small sandbox for sorting visualization states — compare, swap,
            move, candidate, and sorted — on the shared engine used by Linear
            Search and Binary Search. This is not a full sorting lesson.
          </p>
        </div>

        <div className="mt-8 sm:mt-10">
          <AlgorithmVisualizer
            title="Sorting operations demo"
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
