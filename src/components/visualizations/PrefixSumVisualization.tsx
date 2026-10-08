import { useMemo, useState, type FormEvent } from 'react'
import {
  PREFIX_SUM_ARRAY_PRESETS,
  PREFIX_SUM_DEFAULT_ARRAY,
  PREFIX_SUM_DEFAULT_LEFT,
  PREFIX_SUM_DEFAULT_RIGHT,
  buildPrefixSum,
  clampRange,
  isValidRange,
  rangeSum,
} from '../../algorithms/array-string/prefixSum'
import { buildPrefixSumSteps } from '../../algorithms/array-string/prefixSumSteps'
import { cn } from '../../lib/cn'
import { Button } from '../ui'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import { PrefixSumPanels } from './PrefixSumPanels'
import type { ArrayPreset } from './types'

const ARRAY_PRESETS: ArrayPreset[] = PREFIX_SUM_ARRAY_PRESETS.map((preset) => ({
  id: preset.id,
  label: preset.label,
  values: preset.values,
}))

/**
 * Thin lesson wrapper: owns Prefix Sum inputs, generates steps,
 * and feeds the reusable AlgorithmVisualizer with original/formula panels.
 */
export function PrefixSumVisualization() {
  const [array, setArray] = useState<number[]>([...PREFIX_SUM_DEFAULT_ARRAY])
  const [leftInput, setLeftInput] = useState(String(PREFIX_SUM_DEFAULT_LEFT))
  const [rightInput, setRightInput] = useState(String(PREFIX_SUM_DEFAULT_RIGHT))
  const [left, setLeft] = useState(PREFIX_SUM_DEFAULT_LEFT)
  const [right, setRight] = useState(PREFIX_SUM_DEFAULT_RIGHT)
  const [inputError, setInputError] = useState<string | null>(null)

  const rangeOk = isValidRange(array, left, right)

  const steps = useMemo(
    () => (rangeOk ? buildPrefixSumSteps(array, left, right) : []),
    [array, left, right, rangeOk],
  )

  const prefix = useMemo(() => buildPrefixSum(array), [array])
  const result = rangeOk ? rangeSum(prefix, left, right) : null

  function applyRange(rawLeft: string, rawRight: string) {
    const trimmedLeft = rawLeft.trim()
    const trimmedRight = rawRight.trim()

    if (trimmedLeft === '' || trimmedRight === '') {
      setInputError('Enter whole numbers for both left and right indices.')
      return
    }

    const parsedLeft = Number(trimmedLeft)
    const parsedRight = Number(trimmedRight)

    if (!Number.isInteger(parsedLeft) || !Number.isInteger(parsedRight)) {
      setInputError('Please enter valid whole numbers for left and right.')
      return
    }

    if (array.length === 0) {
      setInputError('The array is empty, so no range can be selected.')
      return
    }

    if (
      parsedLeft < 0 ||
      parsedRight < 0 ||
      parsedLeft >= array.length ||
      parsedRight >= array.length
    ) {
      setInputError(
        `Indices must satisfy 0 ≤ left ≤ right ≤ ${array.length - 1}.`,
      )
      return
    }

    if (parsedLeft > parsedRight) {
      setInputError('Left index must be less than or equal to right index.')
      return
    }

    setInputError(null)
    setLeft(parsedLeft)
    setRight(parsedRight)
    setLeftInput(String(parsedLeft))
    setRightInput(String(parsedRight))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    applyRange(leftInput, rightInput)
  }

  function handleArrayChange(next: number[]) {
    setArray(next)
    if (next.length === 0) {
      setLeft(0)
      setRight(-1)
      setLeftInput('0')
      setRightInput('0')
      setInputError('The array is empty, so no range can be selected.')
      return
    }

    const clamped = clampRange(next, left, right)
    setLeft(clamped.left)
    setRight(clamped.right)
    setLeftInput(String(clamped.left))
    setRightInput(String(clamped.right))
    if (inputError) {
      setInputError(null)
    }
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
        Prefix Sum uses a leading zero: prefix[i] is the sum of the first i
        elements. Range sum is prefix[right + 1] − prefix[left]. The array does
        not need to be sorted.
      </p>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1">
            <span className="text-label text-[0.65rem] tracking-[0.08em]">
              Left index
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={leftInput}
              onChange={(event) => {
                setLeftInput(event.target.value)
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
              placeholder="e.g. 1"
              aria-invalid={inputError ? true : undefined}
              aria-describedby={
                inputError ? 'prefix-sum-range-error' : undefined
              }
            />
          </label>

          <label className="min-w-0 flex-1">
            <span className="text-label text-[0.65rem] tracking-[0.08em]">
              Right index
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={rightInput}
              onChange={(event) => {
                setRightInput(event.target.value)
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
              placeholder="e.g. 4"
              aria-invalid={inputError ? true : undefined}
              aria-describedby={
                inputError ? 'prefix-sum-range-error' : undefined
              }
            />
          </label>

          <Button type="submit" className="w-full sm:w-auto">
            Apply range
          </Button>
        </div>

        <p className="mt-3 text-body-sm text-muted-foreground" aria-live="polite">
          Array:{' '}
          <span className="font-mono text-foreground">
            [{array.join(', ')}]
          </span>
          {' · '}
          Left: <span className="font-mono text-foreground">{left}</span>
          {' · '}
          Right: <span className="font-mono text-foreground">{right}</span>
          {' · '}
          Range sum:{' '}
          <span className="font-mono text-foreground">
            {result === null ? 'valid range required' : result}
          </span>
        </p>
      </form>

      {inputError ? (
        <p
          id="prefix-sum-range-error"
          className="text-sm text-rose-600 dark:text-rose-300"
          role="alert"
        >
          {inputError}
        </p>
      ) : null}

      {!rangeOk ? (
        <p className="text-sm text-rose-600 dark:text-rose-300" role="alert">
          {array.length === 0
            ? 'Add array values to run the visualization.'
            : `Choose indices satisfying 0 ≤ left ≤ right ≤ ${array.length - 1}.`}
        </p>
      ) : (
        <AlgorithmVisualizer
          key={`prefix-sum-${array.join(',')}-${left}-${right}`}
          title="Prefix Sum in action"
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
          canvasAddon={(step) => (
            <PrefixSumPanels original={array} step={step} />
          )}
        />
      )}
    </div>
  )
}
