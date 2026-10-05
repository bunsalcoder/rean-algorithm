import { useMemo, useState, type FormEvent } from 'react'
import {
  TWO_POINTERS_ARRAY_PRESETS,
  TWO_POINTERS_DEFAULT_ARRAY,
  TWO_POINTERS_DEFAULT_TARGET,
  TWO_POINTERS_TARGET_PRESETS,
  twoSumSorted,
} from '../../algorithms/array-string/twoPointers'
import { buildTwoPointersSteps } from '../../algorithms/array-string/twoPointersSteps'
import { cn } from '../../lib/cn'
import { Button } from '../ui'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import type { ArrayPreset } from './types'

const ARRAY_PRESETS: ArrayPreset[] = TWO_POINTERS_ARRAY_PRESETS.map(
  (preset) => ({
    id: preset.id,
    label: preset.label,
    values: preset.values,
  }),
)

function isSortedAscending(values: readonly number[]): boolean {
  for (let i = 1; i < values.length; i += 1) {
    if (values[i]! < values[i - 1]!) {
      return false
    }
  }
  return true
}

function formatPairResult(result: number[]): string {
  if (result[0] === -1 && result[1] === -1) {
    return '[-1, -1] (not found)'
  }
  return `[${result[0]}, ${result[1]}]`
}

/**
 * Thin lesson wrapper: owns Two Pointers inputs, generates steps,
 * and feeds the reusable AlgorithmVisualizer.
 */
export function TwoPointersVisualization() {
  const [array, setArray] = useState<number[]>([...TWO_POINTERS_DEFAULT_ARRAY])
  const [targetInput, setTargetInput] = useState(
    String(TWO_POINTERS_DEFAULT_TARGET),
  )
  const [target, setTarget] = useState(TWO_POINTERS_DEFAULT_TARGET)
  const [inputError, setInputError] = useState<string | null>(null)

  const sortedOk = isSortedAscending(array)

  const steps = useMemo(
    () => (sortedOk ? buildTwoPointersSteps(array, target) : []),
    [array, target, sortedOk],
  )

  function applyTarget(rawValue: string) {
    const trimmed = rawValue.trim()

    if (trimmed === '') {
      setInputError('Enter a whole number as the target sum.')
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

  const result = sortedOk ? twoSumSorted(array, target) : [-1, -1]
  const targetPresets = useMemo(() => {
    const fromDefaults = TWO_POINTERS_TARGET_PRESETS.map((value) => ({
      value: value as number,
      label: String(value),
    }))
    const seen = new Set<number>(fromDefaults.map((preset) => preset.value))
    if (!seen.has(target)) {
      return [...fromDefaults, { value: target, label: String(target) }]
    }
    return fromDefaults
  }, [target])

  return (
    <div className="space-y-4">
      <p
        className={cn(
          'rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2',
          'text-body-sm text-amber-900 dark:text-amber-100',
        )}
        role="note"
      >
        This left/right two-pointer approach requires sorted data. Random arrays
        are generated sorted so the demo stays valid. The visualizer does not
        silently sort a custom unsorted input.
      </p>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1">
            <span className="text-label text-[0.65rem] tracking-[0.08em]">
              Target sum
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
              placeholder="e.g. 10"
              aria-invalid={inputError ? true : undefined}
              aria-describedby={
                inputError ? 'two-pointers-target-error' : undefined
              }
            />
          </label>

          <label className="min-w-0 sm:w-52">
            <span className="text-label text-[0.65rem] tracking-[0.08em]">
              Quick pick
            </span>
            <select
              value={
                targetPresets.some((preset) => preset.value === target)
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
              aria-label="Choose a target sum preset"
            >
              <option value="" disabled>
                Choose a target
              </option>
              {targetPresets.map((preset) => (
                <option key={preset.label} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>

          <Button type="submit" className="w-full sm:w-auto">
            Apply target
          </Button>
        </div>

        <p className="mt-3 text-body-sm text-muted-foreground" aria-live="polite">
          Array:{' '}
          <span className="font-mono text-foreground">
            [{array.join(', ')}]
          </span>
          {' · '}
          Target:{' '}
          <span className="font-mono text-foreground">{target}</span>
          {' · '}
          Result:{' '}
          <span className="font-mono text-foreground">
            {!sortedOk ? 'sorted input required' : formatPairResult(result)}
          </span>
        </p>
      </form>

      {inputError ? (
        <p
          id="two-pointers-target-error"
          className="text-sm text-rose-600 dark:text-rose-300"
          role="alert"
        >
          {inputError}
        </p>
      ) : null}

      {!sortedOk ? (
        <p className="text-sm text-rose-600 dark:text-rose-300" role="alert">
          Sorted input required. The pointer movement rules depend on ascending
          order. Use a sorted preset or generate a random sorted array.
        </p>
      ) : (
        <AlgorithmVisualizer
          key={`two-pointers-${array.join(',')}-${target}`}
          title="Two Pointers in action"
          category="Array & String"
          array={array}
          steps={steps}
          onArrayChange={handleArrayChange}
          inputOptions={{
            presets: ARRAY_PRESETS,
            minSize: 2,
            maxSize: 12,
            allowRandom: true,
            allowSizeAdjust: true,
            sortAscending: true,
            randomMin: -20,
            randomMax: 40,
          }}
          showFullscreen
        />
      )}
    </div>
  )
}
