import { useMemo, useState } from 'react'
import {
  BUBBLE_SORT_ARRAY_PRESETS,
  BUBBLE_SORT_DEFAULT_ARRAY,
  buildBubbleSortSteps,
} from '../../algorithms/sorting/bubbleSort'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import type { ArrayPreset } from './types'

const ARRAY_PRESETS: ArrayPreset[] = BUBBLE_SORT_ARRAY_PRESETS.map(
  (preset) => ({
    id: preset.id,
    label: preset.label,
    values: [...preset.values],
  }),
)

/**
 * Thin lesson wrapper: owns Bubble Sort inputs, generates steps,
 * and feeds the reusable AlgorithmVisualizer. No custom playback UI.
 */
export function BubbleSortVisualization() {
  const [array, setArray] = useState<number[]>([
    ...BUBBLE_SORT_DEFAULT_ARRAY,
  ])

  const steps = useMemo(() => buildBubbleSortSteps(array), [array])

  return (
    <AlgorithmVisualizer
      key={`bubble-sort-${array.join(',')}`}
      title="Bubble Sort in action"
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
        randomMin: 1,
        randomMax: 20,
      }}
      showFullscreen
    />
  )
}
