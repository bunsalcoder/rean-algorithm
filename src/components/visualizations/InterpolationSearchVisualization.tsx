import { useMemo, useState, type FormEvent } from 'react'
import {
  INTERPOLATION_SEARCH_ARRAY_PRESETS,
  INTERPOLATION_SEARCH_DEFAULT_ARRAY,
  INTERPOLATION_SEARCH_DEFAULT_TARGET,
  INTERPOLATION_SEARCH_NOT_FOUND_TARGET,
  buildInterpolationSearchSteps,
  interpolationSearch,
} from '../../algorithms/searching/interpolationSearch'
import { cn } from '../../lib/cn'
import { Button } from '../ui'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import type { ArrayPreset } from './types'

const ARRAY_PRESETS: ArrayPreset[] = INTERPOLATION_SEARCH_ARRAY_PRESETS.map(
  (preset) => ({
    id: preset.id,
    label: preset.label,
    values: preset.values,
  }),
)

const TARGET_EXAMPLES = [70, 10, 100, 35, 5, 120] as const

function isSortedAscending(values: readonly number[]): boolean {
  for (let i = 1; i < values.length; i += 1) {
    if (values[i] < values[i - 1]) {
      return false
    }
  }
  return true
}

/**
 * Thin lesson wrapper: owns Interpolation Search inputs, generates steps,
 * and feeds the reusable AlgorithmVisualizer. No custom playback UI.
 */
export function InterpolationSearchVisualization() {
  const [array, setArray] = useState<number[]>([
    ...INTERPOLATION_SEARCH_DEFAULT_ARRAY,
  ])
  const [targetInput, setTargetInput] = useState(
    String(INTERPOLATION_SEARCH_DEFAULT_TARGET),
  )
  const [target, setTarget] = useState(INTERPOLATION_SEARCH_DEFAULT_TARGET)
  const [inputError, setInputError] = useState<string | null>(null)

  const sortedOk = isSortedAscending(array)

  const steps = useMemo(
    () => (sortedOk ? buildInterpolationSearchSteps(array, target) : []),
    [array, target, sortedOk],
  )

  function applyTarget(rawValue: string) {
    const trimmed = rawValue.trim()

    if (trimmed === '') {
      setInputError('Enter a whole number to search for.')
      return
    }

    const parsed = Number(trimmed)

    if (!Number.isInteger(parsed)) {
      setInputError('Please enter a valid whole number.')
      return
    }

    setInputError(null)
    setTarget(parsed)
    setTargetInput(String(parsed))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    applyTarget(targetInput)
  }

  function handlePresetChange(rawValue: string) {
    applyTarget(rawValue)
  }

  function handleArrayChange(next: number[]) {
    setArray(next)
  }

  const resultIndex = sortedOk ? interpolationSearch(array, target) : -1

  let resultLabel = 'sorted input required'
  if (sortedOk) {
    resultLabel =
      resultIndex === -1 ? '-1 (not found)' : `index ${resultIndex}`
  }

  const targetPresetsForArray = useMemo(() => {
    const fromArray = array.map((value) => ({
      value,
      label: String(value),
    }))
    const extras = TARGET_EXAMPLES.map((value) => {
      const inArray = array.includes(value)
      return {
        value,
        label: inArray ? String(value) : `${value} (not in array)`,
      }
    })
    const notFound = {
      value: INTERPOLATION_SEARCH_NOT_FOUND_TARGET,
      label: array.includes(INTERPOLATION_SEARCH_NOT_FOUND_TARGET)
        ? String(INTERPOLATION_SEARCH_NOT_FOUND_TARGET)
        : `${INTERPOLATION_SEARCH_NOT_FOUND_TARGET} (not in array)`,
    }

    const seen = new Set<number>()
    const merged = [...fromArray, ...extras, notFound].filter((preset) => {
      if (seen.has(preset.value)) {
        return false
      }
      seen.add(preset.value)
      return true
    })
    return merged
  }, [array])

  return (
    <div className="space-y-4">
      <p
        className={cn(
          'rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2',
          'text-body-sm text-amber-900 dark:text-amber-100',
        )}
        role="note"
      >
        Interpolation Search requires sorted numeric data. It performs best when
        values are distributed roughly evenly. Random arrays are generated
        sorted so the demo stays valid.
      </p>

      <div
        className={cn(
          'overflow-x-auto rounded-xl border border-border bg-muted/40 p-4',
          'dark:bg-muted/20',
        )}
        aria-label="Interpolation position formula"
      >
        <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
          Position formula
        </p>
        <pre className="mt-2 min-w-max font-mono text-xs text-foreground sm:text-sm">
          {`pos = low + ((target − arr[low]) × (high − low))
        / (arr[high] − arr[low])`}
        </pre>
        <p className="mt-2 text-body-sm text-muted-foreground">
          Binary Search always probes the middle. Interpolation Search estimates
          a likely index from the numeric values at the current bounds.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1">
            <span className="text-label text-[0.65rem] tracking-[0.08em]">
              Target
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={targetInput}
              onChange={(event) => {
                setTargetInput(event.target.value)
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
              placeholder="e.g. 70"
              aria-invalid={inputError ? true : undefined}
              aria-describedby={
                inputError ? 'interpolation-search-target-error' : undefined
              }
            />
          </label>

          <label className="min-w-0 sm:w-52">
            <span className="text-label text-[0.65rem] tracking-[0.08em]">
              Quick pick
            </span>
            <select
              value={
                targetPresetsForArray.some((preset) => preset.value === target)
                  ? String(target)
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
              aria-label="Choose a target preset"
            >
              <option value="" disabled>
                Choose a value
              </option>
              {targetPresetsForArray.map((preset) => (
                <option key={preset.label} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>

          <Button type="submit" className="w-full sm:w-auto">
            Search
          </Button>
        </div>

        <p className="mt-3 text-body-sm text-muted-foreground">
          Array:{' '}
          <span className="font-mono text-foreground">
            [{array.join(', ')}]
          </span>
          {' · '}
          Target:{' '}
          <span className="font-mono text-foreground">{target}</span>
          {' · '}
          Result:{' '}
          <span className="font-mono text-foreground">{resultLabel}</span>
        </p>
      </form>

      {inputError ? (
        <p
          id="interpolation-search-target-error"
          className="text-sm text-rose-600 dark:text-rose-300"
          role="alert"
        >
          {inputError}
        </p>
      ) : null}

      {!sortedOk ? (
        <p className="text-sm text-rose-600 dark:text-rose-300" role="alert">
          Sorted input required. Interpolation Search relies on ascending
          numeric order to estimate a position. Use a sorted preset or generate
          a random sorted array.
        </p>
      ) : (
        <AlgorithmVisualizer
          key={`interpolation-search-${array.join(',')}-${target}`}
          title="Interpolation Search in action"
          category="Searching"
          array={array}
          steps={steps}
          onArrayChange={handleArrayChange}
          inputOptions={{
            presets: ARRAY_PRESETS,
            minSize: 4,
            maxSize: 16,
            allowRandom: true,
            allowSizeAdjust: true,
            sortAscending: true,
            randomMin: 1,
            randomMax: 99,
          }}
          showFullscreen
        />
      )}
    </div>
  )
}
