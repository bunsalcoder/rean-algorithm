import { useMemo, useState } from 'react'
import {
  MERGE_SORT_ARRAY_PRESETS,
  MERGE_SORT_DEFAULT_ARRAY,
  buildMergeSortSteps,
} from '../../algorithms/sorting/mergeSort'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import type { ArrayPreset } from './types'

const ARRAY_PRESETS: ArrayPreset[] = MERGE_SORT_ARRAY_PRESETS.map(
  (preset) => ({
    id: preset.id,
    label: preset.label,
    values: [...preset.values],
  }),
)

/**
 * Thin lesson wrapper: owns Merge Sort inputs, generates steps,
 * and feeds the reusable AlgorithmVisualizer. No custom playback UI.
 */
export function MergeSortVisualization() {
  const [array, setArray] = useState<number[]>([...MERGE_SORT_DEFAULT_ARRAY])

  const steps = useMemo(() => buildMergeSortSteps(array), [array])

  return (
    <AlgorithmVisualizer
      key={`merge-sort-${array.join(',')}`}
      title="Merge Sort in action"
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
