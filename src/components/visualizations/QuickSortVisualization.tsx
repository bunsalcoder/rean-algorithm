import { useMemo, useState } from 'react'
import {
  QUICK_SORT_ARRAY_PRESETS,
  QUICK_SORT_DEFAULT_ARRAY,
  buildQuickSortSteps,
} from '../../algorithms/sorting/quickSort'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import type { ArrayPreset } from './types'

const ARRAY_PRESETS: ArrayPreset[] = QUICK_SORT_ARRAY_PRESETS.map(
  (preset) => ({
    id: preset.id,
    label: preset.label,
    values: [...preset.values],
  }),
)

/**
 * Thin lesson wrapper: owns Quick Sort inputs, generates steps,
 * and feeds the reusable AlgorithmVisualizer. No custom playback UI.
 */
export function QuickSortVisualization() {
  const [array, setArray] = useState<number[]>([...QUICK_SORT_DEFAULT_ARRAY])

  const steps = useMemo(() => buildQuickSortSteps(array), [array])

  return (
    <AlgorithmVisualizer
      key={`quick-sort-${array.join(',')}`}
      title="Quick Sort in action"
      category="Sorting"
      array={array}
      steps={steps}
      onArrayChange={setArray}
      inputOptions={{
        presets: ARRAY_PRESETS,
        minSize: 3,
        maxSize: 8,
        allowRandom: true,
        allowSizeAdjust: true,
        randomMin: -10,
        randomMax: 20,
      }}
      showFullscreen
    />
  )
}
