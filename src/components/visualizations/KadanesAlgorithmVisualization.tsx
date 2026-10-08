import { useMemo, useState } from 'react'
import {
  KADANES_ARRAY_PRESETS,
  KADANES_DEFAULT_ARRAY,
  getSubarray,
  maxSubarray,
} from '../../algorithms/array-string/kadanesAlgorithm'
import { buildKadanesAlgorithmSteps } from '../../algorithms/array-string/kadanesAlgorithmSteps'
import { cn } from '../../lib/cn'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import { KadanesAlgorithmPanels } from './KadanesAlgorithmPanels'
import type { ArrayPreset } from './types'

const ARRAY_PRESETS: ArrayPreset[] = KADANES_ARRAY_PRESETS.map((preset) => ({
  id: preset.id,
  label: preset.label,
  values: preset.values,
}))

/**
 * Thin lesson wrapper: owns Kadane's Algorithm inputs, generates steps,
 * and feeds the reusable AlgorithmVisualizer with decision panels.
 */
export function KadanesAlgorithmVisualization() {
  const [array, setArray] = useState<number[]>([...KADANES_DEFAULT_ARRAY])

  const steps = useMemo(() => buildKadanesAlgorithmSteps(array), [array])
  const result = useMemo(() => maxSubarray(array), [array])

  return (
    <div className="space-y-4">
      <p
        className={cn(
          'rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2',
          'text-body-sm text-sky-950 dark:text-sky-100',
        )}
        role="note"
      >
        At every element ask: continue the current subarray, or start a new one
        here? Update{' '}
        <span className="font-mono">currentSum = max(value, currentSum + value)</span>
        , then track the best sum and indices so far.
      </p>

      <div className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20">
        <p className="text-body-sm text-muted-foreground" aria-live="polite">
          Array:{' '}
          <span className="font-mono text-foreground">
            [{array.join(', ')}]
          </span>
          {' · '}
          {result === null ? (
            <>
              Result: <span className="font-mono text-foreground">null</span>
            </>
          ) : (
            <>
              Max sum:{' '}
              <span className="font-mono text-foreground">{result.maxSum}</span>
              {' · '}
              Subarray:{' '}
              <span className="font-mono text-foreground">
                [
                {getSubarray(array, result.start, result.end).join(', ')}
                ]
              </span>
              {' · '}
              Indices:{' '}
              <span className="font-mono text-foreground">
                [{result.start}, {result.end}]
              </span>
            </>
          )}
        </p>
      </div>

      <AlgorithmVisualizer
        key={`kadanes-algorithm-${array.join(',')}`}
        title="Kadane's Algorithm in action"
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
          randomMin: -8,
          randomMax: 8,
        }}
        showFullscreen
        canvasAddon={(step) => (
          <KadanesAlgorithmPanels original={array} step={step} />
        )}
      />
    </div>
  )
}
