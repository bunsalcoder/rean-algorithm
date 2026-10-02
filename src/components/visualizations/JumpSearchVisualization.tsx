import { useMemo, useState, type FormEvent } from 'react'
import {
  JUMP_SEARCH_ARRAY_PRESETS,
  JUMP_SEARCH_DEFAULT_ARRAY,
  JUMP_SEARCH_DEFAULT_TARGET,
  JUMP_SEARCH_NOT_FOUND_TARGET,
  buildJumpSearchSteps,
  jumpSearch,
} from '../../algorithms/searching/jumpSearch'
import { cn } from '../../lib/cn'
import { Button } from '../ui'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import type { ArrayPreset } from './types'

const ARRAY_PRESETS: ArrayPreset[] = JUMP_SEARCH_ARRAY_PRESETS.map(
  (preset) => ({
    id: preset.id,
    label: preset.label,
    values: preset.values,
  }),
)

function isSortedAscending(values: readonly number[]): boolean {
  for (let i = 1; i < values.length; i += 1) {
    if (values[i] < values[i - 1]) {
      return false
    }
  }
  return true
}

/**
 * Thin lesson wrapper: owns Jump Search inputs, generates steps,
 * and feeds the reusable AlgorithmVisualizer. No custom playback UI.
 */
export function JumpSearchVisualization() {
  const [array, setArray] = useState<number[]>([
    ...JUMP_SEARCH_DEFAULT_ARRAY,
  ])
  const [targetInput, setTargetInput] = useState(
    String(JUMP_SEARCH_DEFAULT_TARGET),
  )
  const [target, setTarget] = useState(JUMP_SEARCH_DEFAULT_TARGET)
  const [inputError, setInputError] = useState<string | null>(null)

  const sortedOk = isSortedAscending(array)

  const steps = useMemo(
    () => (sortedOk ? buildJumpSearchSteps(array, target) : []),
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

  const resultIndex = sortedOk ? jumpSearch(array, target) : -1
  const targetPresetsForArray = useMemo(() => {
    const fromArray = array.map((value) => ({
      value,
      label: String(value),
    }))
    const notFound = {
      value: JUMP_SEARCH_NOT_FOUND_TARGET,
      label: array.includes(JUMP_SEARCH_NOT_FOUND_TARGET)
        ? String(JUMP_SEARCH_NOT_FOUND_TARGET)
        : `${JUMP_SEARCH_NOT_FOUND_TARGET} (not in array)`,
    }
    const outOfRange = {
      value: 100,
      label: '100 (not in array)',
    }
    const seen = new Set(fromArray.map((preset) => preset.value))
    const extras = [notFound, outOfRange].filter(
      (preset) => !seen.has(preset.value),
    )
    return [...fromArray, ...extras]
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
        Jump Search requires sorted data. Random arrays are generated sorted so
        the demo stays valid.
      </p>

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
              placeholder="e.g. 27"
              aria-invalid={inputError ? true : undefined}
              aria-describedby={
                inputError ? 'jump-search-target-error' : undefined
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
          Jump:{' '}
          <span className="font-mono text-foreground">
            {array.length === 0
              ? '—'
              : Math.max(1, Math.floor(Math.sqrt(array.length)))}
          </span>
          {' · '}
          Result:{' '}
          <span className="font-mono text-foreground">
            {!sortedOk
              ? 'sorted input required'
              : resultIndex === -1
                ? '-1 (not found)'
                : `index ${resultIndex}`}
          </span>
        </p>
      </form>

      {inputError ? (
        <p
          id="jump-search-target-error"
          className="text-sm text-rose-600 dark:text-rose-300"
          role="alert"
        >
          {inputError}
        </p>
      ) : null}

      {!sortedOk ? (
        <p className="text-sm text-rose-600 dark:text-rose-300" role="alert">
          Sorted input required. Jump Search relies on ascending order to choose
          the correct block. Use a sorted preset or generate a random sorted
          array.
        </p>
      ) : (
        <AlgorithmVisualizer
          key={`jump-search-${array.join(',')}-${target}`}
          title="Jump Search in action"
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
