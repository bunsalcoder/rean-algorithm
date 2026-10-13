import { useMemo, useState, type FormEvent } from 'react'
import {
  ROTATE_ARRAY_DEFAULT_ARRAY,
  ROTATE_ARRAY_DEFAULT_K,
  ROTATE_ARRAY_PRESETS,
  generateRandomRotateArray,
  normalizeRotationK,
  rotateArrayRight,
} from '../../algorithms/array-string/rotateArray'
import { buildRotateArraySteps } from '../../algorithms/array-string/rotateArraySteps'
import { cn } from '../../lib/cn'
import { Button } from '../ui'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import { RotateArrayPanels } from './RotateArrayPanels'
import type { ArrayPreset } from './types'
import { formatArray } from './utils'

const ARRAY_PRESETS: ArrayPreset[] = ROTATE_ARRAY_PRESETS.filter(
  (preset) => preset.values.length > 0 || preset.id === 'empty',
).map((preset) => ({
  id: preset.id,
  label: preset.label,
  values: preset.values,
}))

/**
 * Thin lesson wrapper: owns array + k inputs, generates three-reversal steps,
 * and feeds the reusable AlgorithmVisualizer.
 */
export function RotateArrayVisualization() {
  const [array, setArray] = useState<number[]>([...ROTATE_ARRAY_DEFAULT_ARRAY])
  const [kInput, setKInput] = useState(String(ROTATE_ARRAY_DEFAULT_K))
  const [k, setK] = useState(ROTATE_ARRAY_DEFAULT_K)
  const [inputError, setInputError] = useState<string | null>(null)

  const steps = useMemo(() => buildRotateArraySteps(array, k), [array, k])
  const result = useMemo(() => rotateArrayRight(array, k), [array, k])
  const normalizedK = useMemo(
    () => normalizeRotationK(k, array.length),
    [array.length, k],
  )

  function applyK(rawValue: string) {
    const trimmed = rawValue.trim()

    if (trimmed === '') {
      setInputError('Enter a whole number for k (rotation count).')
      return
    }

    const parsed = Number(trimmed)

    if (!Number.isInteger(parsed)) {
      setInputError('k must be a whole number (negative values are allowed).')
      return
    }

    setInputError(null)
    setK(parsed)
    setKInput(String(parsed))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    applyK(kInput)
  }

  function loadExample() {
    setArray([...ROTATE_ARRAY_DEFAULT_ARRAY])
    setK(ROTATE_ARRAY_DEFAULT_K)
    setKInput(String(ROTATE_ARRAY_DEFAULT_K))
    setInputError(null)
  }

  function generateExample() {
    const next = generateRandomRotateArray(7)
    const nextK = 1 + Math.floor(Math.random() * Math.max(1, next.length))
    setArray(next)
    setK(nextK)
    setKInput(String(nextK))
    setInputError(null)
  }

  function applyPreset(presetId: string) {
    const preset = ROTATE_ARRAY_PRESETS.find((item) => item.id === presetId)
    if (!preset) {
      return
    }
    setArray([...preset.values])
    setK(preset.k)
    setKInput(String(preset.k))
    setInputError(null)
  }

  return (
    <div className="space-y-4">
      <p
        className={cn(
          'rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2',
          'text-body-sm text-sky-950 dark:text-sky-100',
        )}
        role="note"
      >
        Right-rotate with three reversals: reverse all, reverse the first k,
        reverse the rest. Negative k is normalized to an equivalent right
        rotation via ((k % n) + n) % n.
      </p>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1">
            <span className="text-label text-[0.65rem] tracking-[0.08em]">
              Rotation count k
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={kInput}
              onChange={(event) => {
                setKInput(event.target.value)
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
                inputError ? 'rotate-array-k-error' : undefined
              }
            />
          </label>

          <Button type="submit" className="w-full sm:w-auto">
            Apply k
          </Button>
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button type="button" variant="outline" size="sm" onClick={loadExample}>
            Load example
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generateExample}
          >
            Generate example
          </Button>
        </div>

        <div className="mt-3">
          <p className="text-label text-[0.65rem] tracking-[0.08em]">Presets</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {ROTATE_ARRAY_PRESETS.map((preset) => {
              const selected =
                k === preset.k &&
                array.length === preset.values.length &&
                array.every((value, index) => value === preset.values[index])
              return (
                <Button
                  key={preset.id}
                  type="button"
                  variant={selected ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => applyPreset(preset.id)}
                  aria-pressed={selected}
                >
                  {preset.label}
                </Button>
              )
            })}
          </div>
        </div>

        <p className="mt-3 text-body-sm text-muted-foreground" aria-live="polite">
          Array:{' '}
          <span className="font-mono text-foreground">{formatArray(array)}</span>
          {' · '}
          k: <span className="font-mono text-foreground">{k}</span>
          {' · '}
          k % n:{' '}
          <span className="font-mono text-foreground">{normalizedK}</span>
          {' · '}
          Result:{' '}
          <span className="font-mono text-foreground">{formatArray(result)}</span>
        </p>
      </form>

      {inputError ? (
        <p
          id="rotate-array-k-error"
          className="text-sm text-rose-600 dark:text-rose-300"
          role="alert"
        >
          {inputError}
        </p>
      ) : null}

      <AlgorithmVisualizer
        key={`rotate-array-${array.join(',')}-${k}`}
        title="Rotate Array in action"
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
          randomMin: 1,
          randomMax: 20,
        }}
        showFullscreen
        canvasAddon={(step) => (
          <RotateArrayPanels original={array} step={step} />
        )}
      />
    </div>
  )
}
