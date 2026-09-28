import { useMemo, useState, type FormEvent } from 'react'
import {
  LINEAR_SEARCH_DEFAULT_ARRAY,
  LINEAR_SEARCH_DEFAULT_TARGET,
  LINEAR_SEARCH_NOT_FOUND_TARGET,
  buildLinearSearchSteps,
  linearSearch,
} from '../../lib/linearSearch'
import { cn } from '../../lib/cn'
import { Button } from '../ui'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'

const TARGET_PRESETS = [
  ...LINEAR_SEARCH_DEFAULT_ARRAY.map((value) => ({
    value,
    label: String(value),
  })),
  {
    value: LINEAR_SEARCH_NOT_FOUND_TARGET,
    label: `${LINEAR_SEARCH_NOT_FOUND_TARGET} (not in array)`,
  },
] as const

/**
 * Thin lesson wrapper: owns Linear Search inputs, generates steps,
 * and feeds the reusable AlgorithmVisualizer. No custom playback UI.
 */
export function LinearSearchVisualization() {
  const array = LINEAR_SEARCH_DEFAULT_ARRAY
  const [targetInput, setTargetInput] = useState(
    String(LINEAR_SEARCH_DEFAULT_TARGET),
  )
  const [target, setTarget] = useState(LINEAR_SEARCH_DEFAULT_TARGET)
  const [inputError, setInputError] = useState<string | null>(null)

  const steps = useMemo(
    () => buildLinearSearchSteps(array, target),
    [array, target],
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

  const resultIndex = linearSearch(array, target)

  return (
    <div className="space-y-4">
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
              placeholder="e.g. 42"
              aria-invalid={inputError ? true : undefined}
              aria-describedby={
                inputError ? 'linear-search-target-error' : undefined
              }
            />
          </label>

          <label className="min-w-0 sm:w-52">
            <span className="text-label text-[0.65rem] tracking-[0.08em]">
              Quick pick
            </span>
            <select
              value={
                TARGET_PRESETS.some((preset) => preset.value === target)
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
              {TARGET_PRESETS.map((preset) => (
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
          Result:{' '}
          <span className="font-mono text-foreground">
            {resultIndex === -1 ? '-1 (not found)' : `index ${resultIndex}`}
          </span>
        </p>
      </form>

      {inputError ? (
        <p
          id="linear-search-target-error"
          className="text-sm text-rose-600 dark:text-rose-300"
          role="alert"
        >
          {inputError}
        </p>
      ) : null}

      <AlgorithmVisualizer
        key={`linear-search-${array.join(',')}-${target}`}
        title="Linear Search in action"
        category="Searching"
        array={array}
        steps={steps}
        showFullscreen
      />
    </div>
  )
}
