import { useMemo, useState } from 'react'
import {
  STRING_COMPRESSION_DEFAULT_INPUT,
  STRING_COMPRESSION_PRESETS,
  compressString,
  generateRandomCompressionInput,
} from '../../algorithms/array-string/stringCompression'
import { buildStringCompressionSteps } from '../../algorithms/array-string/stringCompressionSteps'
import { cn } from '../../lib/cn'
import { Button } from '../ui'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import { StringCompressionPanels } from './StringCompressionPanels'

/**
 * Thin lesson wrapper: owns string input, generates steps, and feeds the
 * reusable AlgorithmVisualizer with run-length panels.
 */
export function StringCompressionVisualization() {
  const [input, setInput] = useState<string>(STRING_COMPRESSION_DEFAULT_INPUT)

  const steps = useMemo(() => buildStringCompressionSteps(input), [input])
  const compressed = useMemo(() => compressString(input), [input])
  const indexArray = useMemo(
    () => Array.from({ length: Math.max(input.length, 1) }, (_, index) => index),
    [input.length],
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
        Count consecutive identical characters and write each character followed
        by its count when the count is greater than one. Characters are used
        exactly as typed (no trim or case folding). Digits in the input make
        this simple format ambiguous without escaping.
      </p>

      <div className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20">
        <p className="text-body-sm text-muted-foreground" aria-live="polite">
          Input:{' '}
          <span className="font-mono text-foreground">
            &quot;{input}&quot;
          </span>
          {' · '}
          Compressed:{' '}
          <span className="font-mono text-foreground">
            &quot;{compressed}&quot;
          </span>
        </p>
      </div>

      <AlgorithmVisualizer
        key={`string-compression-${input}`}
        title="String Compression in action"
        category="Array & String"
        array={indexArray}
        steps={steps}
        hideArray
        showLegend={false}
        showFullscreen
        inputSlot={
          <div className="space-y-4 rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20">
            <label className="block min-w-0">
              <span className="text-label text-[0.65rem] tracking-[0.08em]">
                Input string
              </span>
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className={cn(
                  'mt-1.5 h-10 w-full rounded-md border border-border bg-surface px-3',
                  'font-mono text-sm text-foreground shadow-sm transition-theme',
                  'placeholder:text-muted-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                )}
                placeholder="e.g. aaabbc"
                aria-label="Input string"
              />
            </label>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInput(STRING_COMPRESSION_DEFAULT_INPUT)}
              >
                Load example
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInput(generateRandomCompressionInput())}
              >
                Generate example
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInput('')}
              >
                Clear
              </Button>
            </div>

            <div>
              <p className="text-label text-[0.65rem] tracking-[0.08em]">
                Presets
              </p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {STRING_COMPRESSION_PRESETS.map((preset) => {
                  const selected = input === preset.input
                  return (
                    <Button
                      key={preset.id}
                      type="button"
                      variant={selected ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => setInput(preset.input)}
                      aria-pressed={selected}
                    >
                      {preset.label}
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>
        }
        canvasAddon={(step) => (
          <StringCompressionPanels input={input} step={step} />
        )}
      />
    </div>
  )
}
