import { useMemo, useState } from 'react'
import {
  LONGEST_SUBSTRING_DEFAULT,
  LONGEST_SUBSTRING_PRESETS,
  getSubstring,
  longestSubstringWithoutRepeating,
} from '../../algorithms/array-string/longestSubstringWithoutRepeating'
import { buildLongestSubstringWithoutRepeatingSteps } from '../../algorithms/array-string/longestSubstringWithoutRepeatingSteps'
import { cn } from '../../lib/cn'
import { Button } from '../ui'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import { LongestSubstringPanels } from './LongestSubstringPanels'

/**
 * Thin lesson wrapper: owns string inputs, generates steps, and feeds the
 * reusable AlgorithmVisualizer with character-window panels.
 */
export function LongestSubstringVisualization() {
  const [value, setValue] = useState<string>(LONGEST_SUBSTRING_DEFAULT)

  const steps = useMemo(
    () => buildLongestSubstringWithoutRepeatingSteps(value),
    [value],
  )
  const result = useMemo(
    () => longestSubstringWithoutRepeating(value),
    [value],
  )
  const indexArray = useMemo(
    () => Array.from({ length: value.length }, (_, index) => index),
    [value.length],
  )

  return (
    <div className="space-y-4">
      <p
        className={cn(
          'rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2',
          'text-body-sm text-sky-950 dark:text-sky-100',
        )}
        role="note"
      >
        Variable-size sliding window: expand with the right pointer when
        characters are unique; shrink with the left pointer when a duplicate
        appears. A Set tracks characters inside the window.
      </p>

      <div className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20">
        <p className="text-body-sm text-muted-foreground" aria-live="polite">
          String:{' '}
          <span className="font-mono text-foreground">
            &quot;{value}&quot;
          </span>
          {' · '}
          Length:{' '}
          <span className="font-mono text-foreground">{result.length}</span>
          {' · '}
          Substring:{' '}
          <span className="font-mono text-foreground">
            &quot;
            {getSubstring(value, result.start, result.end)}
            &quot;
          </span>
          {' · '}
          Indices:{' '}
          <span className="font-mono text-foreground">
            [{result.start}, {result.end}]
          </span>
        </p>
      </div>

      <AlgorithmVisualizer
        key={`longest-substring-${value}`}
        title="Longest Unique Substring in action"
        category="Array & String"
        array={indexArray}
        steps={steps}
        hideArray
        showLegend={false}
        showFullscreen
        inputSlot={
          <div className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20">
            <p className="text-label text-[0.65rem] tracking-[0.08em]">
              Input string
            </p>
            <p className="mt-1.5 font-mono text-sm text-foreground">
              &quot;{value}&quot;
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {LONGEST_SUBSTRING_PRESETS.map((preset) => (
                <Button
                  key={preset.id}
                  type="button"
                  variant={value === preset.value ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setValue(preset.value)}
                  aria-pressed={value === preset.value}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
        }
        canvasAddon={(step) => (
          <LongestSubstringPanels original={value} step={step} />
        )}
      />
    </div>
  )
}
