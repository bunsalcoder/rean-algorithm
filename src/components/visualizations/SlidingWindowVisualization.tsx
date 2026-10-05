import { useMemo, useState, type FormEvent } from 'react'
import {
  SLIDING_WINDOW_ARRAY_PRESETS,
  SLIDING_WINDOW_DEFAULT_ARRAY,
  SLIDING_WINDOW_DEFAULT_SIZE,
  SLIDING_WINDOW_SIZE_PRESETS,
  isValidWindowSize,
  maxSumSubarray,
} from '../../algorithms/array-string/slidingWindow'
import { buildSlidingWindowSteps } from '../../algorithms/array-string/slidingWindowSteps'
import { cn } from '../../lib/cn'
import { Button } from '../ui'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import type { ArrayPreset } from './types'

const ARRAY_PRESETS: ArrayPreset[] = SLIDING_WINDOW_ARRAY_PRESETS.map(
  (preset) => ({
    id: preset.id,
    label: preset.label,
    values: preset.values,
  }),
)

/**
 * Thin lesson wrapper: owns Sliding Window inputs, generates steps,
 * and feeds the reusable AlgorithmVisualizer.
 */
export function SlidingWindowVisualization() {
  const [array, setArray] = useState<number[]>([
    ...SLIDING_WINDOW_DEFAULT_ARRAY,
  ])
  const [windowSizeInput, setWindowSizeInput] = useState(
    String(SLIDING_WINDOW_DEFAULT_SIZE),
  )
  const [windowSize, setWindowSize] = useState(SLIDING_WINDOW_DEFAULT_SIZE)
  const [inputError, setInputError] = useState<string | null>(null)

  const windowOk = isValidWindowSize(array, windowSize)

  const steps = useMemo(
    () => (windowOk ? buildSlidingWindowSteps(array, windowSize) : []),
    [array, windowSize, windowOk],
  )

  function applyWindowSize(rawValue: string) {
    const trimmed = rawValue.trim()

    if (trimmed === '') {
      setInputError('Enter a whole number for the window size.')
      return
    }

    const parsed = Number(trimmed)

    if (!Number.isInteger(parsed)) {
      setInputError('Please enter a valid whole number.')
      return
    }

    if (parsed < 1) {
      setInputError('Window size must be at least 1.')
      return
    }

    if (parsed > array.length) {
      setInputError(
        `Window size must be at most ${array.length} (the array length).`,
      )
      return
    }

    setInputError(null)
    setWindowSize(parsed)
    setWindowSizeInput(String(parsed))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    applyWindowSize(windowSizeInput)
  }

  function handlePresetChange(rawValue: string) {
    applyWindowSize(rawValue)
  }

  function handleArrayChange(next: number[]) {
    setArray(next)
    if (windowSize > next.length) {
      setInputError(
        `Window size ${windowSize} is larger than the new array length ${next.length}. Choose a smaller window size.`,
      )
    } else if (inputError) {
      setInputError(null)
    }
  }

  const result = windowOk ? maxSumSubarray(array, windowSize) : null

  const sizePresets = useMemo(() => {
    const capped = SLIDING_WINDOW_SIZE_PRESETS.filter(
      (size) => size <= array.length,
    ).map((size) => ({
      value: size as number,
      label: String(size),
    }))
    const seen = new Set(capped.map((preset) => preset.value))
    if (windowOk && !seen.has(windowSize)) {
      return [...capped, { value: windowSize, label: String(windowSize) }]
    }
    return capped
  }, [array.length, windowOk, windowSize])

  return (
    <div className="space-y-4">
      <p
        className={cn(
          'rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2',
          'text-body-sm text-sky-950 dark:text-sky-100',
        )}
        role="note"
      >
        Sliding Window works on contiguous ranges. The array does not need to be
        sorted for this technique.
      </p>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1">
            <span className="text-label text-[0.65rem] tracking-[0.08em]">
              Window size
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={windowSizeInput}
              onChange={(event) => {
                setWindowSizeInput(event.target.value)
                if (inputError) {
                  setInputError(null)
                }
              }}
              className={cn(
                'mt-1.5 h-10 w-full rounded-md border border-border bg-surface px-3',
                'font-mono text-sm text-foreground shadow-sm transition-theme',
                'placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
              placeholder="e.g. 3"
              aria-invalid={inputError ? true : undefined}
              aria-describedby={
                inputError ? 'sliding-window-size-error' : undefined
              }
            />
          </label>

          <label className="min-w-0 sm:w-52">
            <span className="text-label text-[0.65rem] tracking-[0.08em]">
              Quick pick
            </span>
            <select
              value={
                sizePresets.some((preset) => preset.value === windowSize)
                  ? String(windowSize)
                  : ''
              }
              onChange={(event) => {
                if (event.target.value !== '') {
                  handlePresetChange(event.target.value)
                }
              }}
              className={cn(
                'mt-1.5 h-10 w-full rounded-md border border-border bg-surface px-3',
                'font-mono text-sm text-foreground shadow-sm transition-theme',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
              aria-label="Choose a window size preset"
            >
              <option value="" disabled>
                Choose a size
              </option>
              {sizePresets.map((preset) => (
                <option key={preset.label} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>

          <Button type="submit" className="w-full sm:w-auto">
            Apply window size
          </Button>
        </div>

        <p className="mt-3 text-body-sm text-muted-foreground" aria-live="polite">
          Array:{' '}
          <span className="font-mono text-foreground">
            [{array.join(', ')}]
          </span>
          {' · '}
          Window size:{' '}
          <span className="font-mono text-foreground">{windowSize}</span>
          {' · '}
          Maximum sum:{' '}
          <span className="font-mono text-foreground">
            {result === null ? 'valid window size required' : result}
          </span>
        </p>
      </form>

      {inputError ? (
        <p
          id="sliding-window-size-error"
          className="text-sm text-rose-600 dark:text-rose-300"
          role="alert"
        >
          {inputError}
        </p>
      ) : null}

      {!windowOk ? (
        <p className="text-sm text-rose-600 dark:text-rose-300" role="alert">
          Choose a window size between 1 and {array.length} to run the
          visualization.
        </p>
      ) : (
        <AlgorithmVisualizer
          key={`sliding-window-${array.join(',')}-${windowSize}`}
          title="Sliding Window in action"
          category="Array & String"
          array={array}
          steps={steps}
          onArrayChange={handleArrayChange}
          inputOptions={{
            presets: ARRAY_PRESETS,
            minSize: 1,
            maxSize: 12,
            allowRandom: true,
            allowSizeAdjust: true,
            sortAscending: false,
            randomMin: -10,
            randomMax: 20,
          }}
          showFullscreen
        />
      )}
    </div>
  )
}
