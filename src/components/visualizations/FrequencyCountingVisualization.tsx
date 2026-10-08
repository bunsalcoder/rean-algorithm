import { useMemo, useState } from 'react'
import {
  FREQUENCY_COUNTING_ARRAY_PRESETS,
  FREQUENCY_COUNTING_DEFAULT_ARRAY,
  buildFrequencyMap,
  findMostFrequent,
} from '../../algorithms/array-string/frequencyCounting'
import { buildFrequencyCountingSteps } from '../../algorithms/array-string/frequencyCountingSteps'
import { cn } from '../../lib/cn'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import { FrequencyCountingPanels } from './FrequencyCountingPanels'
import type { ArrayPreset } from './types'

const ARRAY_PRESETS: ArrayPreset[] = FREQUENCY_COUNTING_ARRAY_PRESETS.map(
  (preset) => ({
    id: preset.id,
    label: preset.label,
    values: preset.values,
  }),
)

function formatFrequencySummary(arr: readonly number[]): string {
  if (arr.length === 0) {
    return '(empty)'
  }

  const frequency = buildFrequencyMap(arr)
  return [...frequency.entries()]
    .map(([key, count]) => `${key} → ${count}`)
    .join(', ')
}

/**
 * Thin lesson wrapper: owns Frequency Counting inputs, generates steps,
 * and feeds the reusable AlgorithmVisualizer with frequency-map panels.
 */
export function FrequencyCountingVisualization() {
  const [array, setArray] = useState<number[]>([
    ...FREQUENCY_COUNTING_DEFAULT_ARRAY,
  ])

  const steps = useMemo(() => buildFrequencyCountingSteps(array), [array])
  const mostFrequent = useMemo(() => findMostFrequent(array), [array])
  const summary = useMemo(() => formatFrequencySummary(array), [array])

  return (
    <div className="space-y-4">
      <p
        className={cn(
          'rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2',
          'text-body-sm text-sky-950 dark:text-sky-100',
        )}
        role="note"
      >
        Frequency Counting keeps a running count in a hash map. Key = value,
        value = number of occurrences. Hash map operations are typically O(1) on
        average.
      </p>

      <div className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20">
        <p className="text-body-sm text-muted-foreground" aria-live="polite">
          Array:{' '}
          <span className="font-mono text-foreground">
            [{array.join(', ')}]
          </span>
          {' · '}
          Frequencies:{' '}
          <span className="font-mono text-foreground">{summary}</span>
          {' · '}
          Most frequent:{' '}
          <span className="font-mono text-foreground">
            {mostFrequent === null ? 'n/a' : mostFrequent}
          </span>
        </p>
      </div>

      <AlgorithmVisualizer
        key={`frequency-counting-${array.join(',')}`}
        title="Frequency Counting in action"
        category="Array & String"
        array={array}
        steps={steps}
        onArrayChange={setArray}
        inputOptions={{
          presets: ARRAY_PRESETS,
          minSize: 0,
          maxSize: 12,
          allowRandom: true,
          allowSizeAdjust: true,
          sortAscending: false,
          randomMin: -5,
          randomMax: 8,
        }}
        showFullscreen
        canvasAddon={(step) => (
          <FrequencyCountingPanels original={array} step={step} />
        )}
      />
    </div>
  )
}
