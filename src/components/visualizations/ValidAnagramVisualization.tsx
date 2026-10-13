import { useMemo, useState } from 'react'
import {
  VALID_ANAGRAM_DEFAULT_FIRST,
  VALID_ANAGRAM_DEFAULT_SECOND,
  VALID_ANAGRAM_PRESETS,
  isValidAnagram,
} from '../../algorithms/array-string/validAnagram'
import { buildValidAnagramSteps } from '../../algorithms/array-string/validAnagramSteps'
import { cn } from '../../lib/cn'
import { Button } from '../ui'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import { ValidAnagramPanels } from './ValidAnagramPanels'

/**
 * Thin lesson wrapper: owns two string inputs, generates steps, and feeds the
 * reusable AlgorithmVisualizer with frequency-map panels.
 */
export function ValidAnagramVisualization() {
  const [first, setFirst] = useState<string>(VALID_ANAGRAM_DEFAULT_FIRST)
  const [second, setSecond] = useState<string>(VALID_ANAGRAM_DEFAULT_SECOND)

  const steps = useMemo(
    () => buildValidAnagramSteps(first, second),
    [first, second],
  )
  const isValid = useMemo(
    () => isValidAnagram(first, second),
    [first, second],
  )
  const indexArray = useMemo(
    () =>
      Array.from(
        { length: Math.max(first.length, second.length, 1) },
        (_, index) => index,
      ),
    [first.length, second.length],
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
        Count characters from the first string, then decrement with the second.
        Comparison is exact: case-sensitive, and spaces/punctuation count.
        Examples use ordinary BMP characters.
      </p>

      <div className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20">
        <p className="text-body-sm text-muted-foreground" aria-live="polite">
          First:{' '}
          <span className="font-mono text-foreground">&quot;{first}&quot;</span>
          {' · '}
          Second:{' '}
          <span className="font-mono text-foreground">
            &quot;{second}&quot;
          </span>
          {' · '}
          Result:{' '}
          <span className="font-mono text-foreground">
            {isValid ? 'Valid Anagram' : 'Not Anagrams'}
          </span>
        </p>
      </div>

      <AlgorithmVisualizer
        key={`valid-anagram-${first}::${second}`}
        title="Valid Anagram in action"
        category="Array & String"
        array={indexArray}
        steps={steps}
        hideArray
        showLegend={false}
        showFullscreen
        inputSlot={
          <div className="space-y-4 rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="min-w-0">
                <span className="text-label text-[0.65rem] tracking-[0.08em]">
                  First string
                </span>
                <input
                  type="text"
                  value={first}
                  onChange={(event) => setFirst(event.target.value)}
                  className={cn(
                    'mt-1.5 h-10 w-full rounded-md border border-border bg-surface px-3',
                    'font-mono text-sm text-foreground shadow-sm transition-theme',
                    'placeholder:text-muted-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  )}
                  placeholder="e.g. listen"
                  aria-label="First string"
                />
              </label>

              <label className="min-w-0">
                <span className="text-label text-[0.65rem] tracking-[0.08em]">
                  Second string
                </span>
                <input
                  type="text"
                  value={second}
                  onChange={(event) => setSecond(event.target.value)}
                  className={cn(
                    'mt-1.5 h-10 w-full rounded-md border border-border bg-surface px-3',
                    'font-mono text-sm text-foreground shadow-sm transition-theme',
                    'placeholder:text-muted-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  )}
                  placeholder="e.g. silent"
                  aria-label="Second string"
                />
              </label>
            </div>

            <div>
              <p className="text-label text-[0.65rem] tracking-[0.08em]">
                Example pairs
              </p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {VALID_ANAGRAM_PRESETS.map((preset) => {
                  const selected =
                    first === preset.first && second === preset.second
                  return (
                    <Button
                      key={preset.id}
                      type="button"
                      variant={selected ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setFirst(preset.first)
                        setSecond(preset.second)
                      }}
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
          <ValidAnagramPanels first={first} second={second} step={step} />
        )}
      />
    </div>
  )
}
