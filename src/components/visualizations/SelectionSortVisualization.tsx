import { useMemo, useState } from 'react'
import {
  SELECTION_SORT_ARRAY_PRESETS,
  SELECTION_SORT_DEFAULT_ARRAY,
  buildSelectionSortSteps,
} from '../../algorithms/sorting/selectionSort'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import type { ArrayPreset } from './types'

const ARRAY_PRESETS: ArrayPreset[] = SELECTION_SORT_ARRAY_PRESETS.map(
  (preset) => ({
    id: preset.id,
    label: preset.label,
    values: [...preset.values],
  }),
)

/**
 * Thin lesson wrapper: owns Selection Sort inputs, generates steps,
 * and feeds the reusable AlgorithmVisualizer. No custom playback UI.
 */
export function SelectionSortVisualization() {
  const [array, setArray] = useState<number[]>([
    ...SELECTION_SORT_DEFAULT_ARRAY,
  ])

  const steps = useMemo(() => buildSelectionSortSteps(array), [array])

  return (
    <AlgorithmVisualizer
      key={`selection-sort-${array.join(',')}`}
      title="Selection Sort in action"
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
