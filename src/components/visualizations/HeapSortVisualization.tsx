import { useMemo, useState } from 'react'
import {
  HEAP_SORT_ARRAY_PRESETS,
  HEAP_SORT_DEFAULT_ARRAY,
  buildHeapSortSteps,
} from '../../algorithms/sorting/heapSort'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import { HeapTreeView } from './HeapTreeView'
import type { ArrayPreset } from './types'
import { resolveArrayElements } from './utils'

const ARRAY_PRESETS: ArrayPreset[] = HEAP_SORT_ARRAY_PRESETS.map((preset) => ({
  id: preset.id,
  label: preset.label,
  values: [...preset.values],
}))

/**
 * Thin lesson wrapper: owns Heap Sort inputs, generates steps,
 * and feeds the reusable AlgorithmVisualizer with a compact heap tree.
 */
export function HeapSortVisualization() {
  const [array, setArray] = useState<number[]>([...HEAP_SORT_DEFAULT_ARRAY])

  const steps = useMemo(() => buildHeapSortSteps(array), [array])

  return (
    <AlgorithmVisualizer
      key={`heap-sort-${array.join(',')}`}
      title="Heap Sort in action"
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
      canvasAddon={(step) => {
        const elements = resolveArrayElements(array, step)
        const heapSizeRaw = step?.meta?.heapSize
        const heapSize =
          typeof heapSizeRaw === 'number'
            ? heapSizeRaw
            : typeof heapSizeRaw === 'string'
              ? Number(heapSizeRaw)
              : elements.length

        return (
          <HeapTreeView
            elements={elements}
            heapSize={Number.isFinite(heapSize) ? heapSize : elements.length}
            className="mb-4"
          />
        )
      }}
    />
  )
}
