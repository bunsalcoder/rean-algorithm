import { useMemo, useState } from 'react'
import {
  INSERTION_SORT_ARRAY_PRESETS,
  INSERTION_SORT_DEFAULT_ARRAY,
  buildInsertionSortSteps,
} from '../../algorithms/sorting/insertionSort'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import type { ArrayPreset } from './types'

const ARRAY_PRESETS: ArrayPreset[] = INSERTION_SORT_ARRAY_PRESETS.map(
  (preset) => ({
    id: preset.id,
    label: preset.label,
    values: [...preset.values],
  }),
)

/**
 * Thin lesson wrapper: owns Insertion Sort inputs, generates steps,
 * and feeds the reusable AlgorithmVisualizer. No custom playback UI.
 */
export function InsertionSortVisualization() {
  const [array, setArray] = useState<number[]>([
    ...INSERTION_SORT_DEFAULT_ARRAY,
  ])

  const steps = useMemo(() => buildInsertionSortSteps(array), [array])

  return (
    <AlgorithmVisualizer
      key={`insertion-sort-${array.join(',')}`}
      title="Insertion Sort in action"
      category="Sorting"
      array={array}
      steps={steps}
      onArrayChange={setArray}
      inputOptions={{
        presets: ARRAY_PRESETS,
        minSize: 3,
        maxSize: 10,
        allowRandom: true,
        allowSizeAdjust: true,
        randomMin: -10,
        randomMax: 20,
      }}
      showFullscreen
    />
  )
}
