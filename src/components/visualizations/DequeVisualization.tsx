import { useMemo, useState } from 'react'
import {
  DEQUE_ARRAY_PRESETS,
  DEQUE_DEFAULT_VALUES,
  DEQUE_EDUCATIONAL_MAX_CAPACITY,
  back,
  clear,
  formatDeque,
  front,
  isEmpty,
  popBack,
  popFront,
  pushBack,
  pushFront,
  size,
  snapshotFromArray,
  toArray,
} from '../../algorithms/data-structures/deque'
import {
  buildDequeSteps,
  type DequeOperation,
} from '../../algorithms/data-structures/dequeSteps'
import { cn } from '../../lib/cn'
import { Button } from '../ui'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import { DequePanels } from './DequePanels'

const OPERATIONS: {
  id: DequeOperation
  label: string
  needsValue: boolean
}[] = [
  { id: 'push-front', label: 'pushFront', needsValue: true },
  { id: 'push-back', label: 'pushBack', needsValue: true },
  { id: 'pop-front', label: 'popFront', needsValue: false },
  { id: 'pop-back', label: 'popBack', needsValue: false },
  { id: 'front', label: 'front', needsValue: false },
  { id: 'back', label: 'back', needsValue: false },
  { id: 'is-empty', label: 'isEmpty', needsValue: false },
  { id: 'size', label: 'Size', needsValue: false },
]

function parseOperand(raw: string): number | undefined {
  const trimmed = raw.trim()
  if (trimmed === '') {
    return undefined
  }
  const value = Number(trimmed)
  if (!Number.isFinite(value)) {
    return undefined
  }
  return value
}

function previewResult(
  values: readonly number[],
  operation: DequeOperation,
  operand: number | undefined,
  maxCapacity: number | null,
): string {
  const snapshot = snapshotFromArray(values, maxCapacity)

  if (operation === 'push-front') {
    if (operand === undefined) {
      return 'Enter a finite number to preview'
    }
    const result = pushFront(snapshot, operand)
    if (!result.ok) {
      return `Overflow (educational cap ${maxCapacity}) — deque unchanged`
    }
    return `${formatDeque(values)} → pushFront(${operand}) → ${formatDeque(toArray(result.snapshot))}`
  }

  if (operation === 'push-back') {
    if (operand === undefined) {
      return 'Enter a finite number to preview'
    }
    const result = pushBack(snapshot, operand)
    if (!result.ok) {
      return `Overflow (educational cap ${maxCapacity}) — deque unchanged`
    }
    return `${formatDeque(values)} → pushBack(${operand}) → ${formatDeque(toArray(result.snapshot))}`
  }

  if (operation === 'pop-front') {
    const result = popFront(snapshot)
    if (!result.ok) {
      return 'Underflow — empty deque, nothing to popFront'
    }
    return `${formatDeque(values)} → popFront() → ${formatDeque(toArray(result.snapshot))} (returned ${result.value})`
  }

  if (operation === 'pop-back') {
    const result = popBack(snapshot)
    if (!result.ok) {
      return 'Underflow — empty deque, nothing to popBack'
    }
    return `${formatDeque(values)} → popBack() → ${formatDeque(toArray(result.snapshot))} (returned ${result.value})`
  }

  if (operation === 'front') {
    const value = front(snapshot)
    if (value === undefined) {
      return 'Underflow — empty deque, nothing at the front'
    }
    return `front() → ${value} (deque unchanged)`
  }

  if (operation === 'back') {
    const value = back(snapshot)
    if (value === undefined) {
      return 'Underflow — empty deque, nothing at the rear'
    }
    return `back() → ${value} (deque unchanged)`
  }

  if (operation === 'is-empty') {
    return `isEmpty() → ${isEmpty(snapshot)}`
  }

  return `size() → ${size(snapshot)}`
}

/**
 * Interactive playground for deque double-ended operations.
 * Owns deque values + operation selection; feeds AlgorithmVisualizer.
 */
export function DequeVisualization() {
  const [values, setValues] = useState<number[]>([...DEQUE_DEFAULT_VALUES])
  const [operation, setOperation] = useState<DequeOperation>('push-back')
  const [valueInput, setValueInput] = useState('50')
  const [useCapacity, setUseCapacity] = useState(false)
  const [capacityInput, setCapacityInput] = useState(
    String(DEQUE_EDUCATIONAL_MAX_CAPACITY),
  )

  const selected = OPERATIONS.find((item) => item.id === operation)!
  const operand = parseOperand(valueInput)
  const parsedCapacity = parseOperand(capacityInput)
  const maxCapacity =
    useCapacity && parsedCapacity !== undefined && parsedCapacity >= 0
      ? Math.floor(parsedCapacity)
      : null

  const inputError =
    selected.needsValue && operand === undefined
      ? valueInput.trim() === ''
        ? 'Enter a number to insert.'
        : 'Value must be a finite number.'
      : null

  const capacityError =
    useCapacity && (parsedCapacity === undefined || parsedCapacity < 0)
      ? 'Educational capacity must be a non-negative finite number.'
      : null

  const steps = useMemo(
    () => buildDequeSteps(values, operation, operand, maxCapacity),
    [values, operation, operand, maxCapacity],
  )

  const indexArray = useMemo(
    () => values.map((_, index) => index),
    [values],
  )

  const applyFinalDeque = () => {
    const snapshot = snapshotFromArray(values, maxCapacity)

    if (operation === 'push-front') {
      if (operand === undefined) {
        return
      }
      const result = pushFront(snapshot, operand)
      if (result.ok) {
        setValues(toArray(result.snapshot))
      }
      return
    }

    if (operation === 'push-back') {
      if (operand === undefined) {
        return
      }
      const result = pushBack(snapshot, operand)
      if (result.ok) {
        setValues(toArray(result.snapshot))
      }
      return
    }

    if (operation === 'pop-front') {
      const result = popFront(snapshot)
      if (result.ok) {
        setValues(toArray(result.snapshot))
      }
      return
    }

    if (operation === 'pop-back') {
      const result = popBack(snapshot)
      if (result.ok) {
        setValues(toArray(result.snapshot))
      }
      return
    }

    // front / back / is-empty / size do not mutate
  }

  const resetDeque = () => {
    setValues([...DEQUE_DEFAULT_VALUES])
    setOperation('push-back')
    setValueInput('50')
  }

  const clearDeque = () => {
    setValues(toArray(clear(snapshotFromArray(values, maxCapacity))))
  }

  const mutating =
    operation === 'push-front' ||
    operation === 'push-back' ||
    operation === 'pop-front' ||
    operation === 'pop-back'

  return (
    <div className="space-y-4">
      <p
        className={cn(
          'rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2',
          'text-body-sm text-sky-950 dark:text-sky-100',
        )}
        role="note"
      >
        A deque is double-ended: insert or remove at the front or the rear.
        Pops and peeks on an empty deque are underflow — the visualization
        explains the error instead of inventing a value. Optional educational
        capacity is a demo knob, not a universal deque rule.
      </p>

      <div className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20">
        <p className="text-body-sm text-muted-foreground" aria-live="polite">
          Deque:{' '}
          <span className="font-mono text-foreground">
            {formatDeque(values)}
          </span>
          {' · '}
          size={size(snapshotFromArray(values))}
          {' · '}
          isEmpty={String(isEmpty(snapshotFromArray(values)))}
          {' · '}
          Preview:{' '}
          <span className="font-mono text-foreground">
            {previewResult(values, operation, operand, maxCapacity)}
          </span>
        </p>
      </div>

      <AlgorithmVisualizer
        key={`deque-${operation}-${values.join(',')}-${valueInput}-${maxCapacity}`}
        title="Deque in action"
        category="Data Structures"
        array={indexArray}
        steps={steps}
        hideArray
        showLegend={false}
        showFullscreen
        inputSlot={
          <div className="space-y-4 rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20">
            <div>
              <p className="text-label text-[0.65rem] tracking-[0.08em]">
                Operation
              </p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {OPERATIONS.map((item) => (
                  <Button
                    key={item.id}
                    type="button"
                    variant={operation === item.id ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setOperation(item.id)}
                    aria-pressed={operation === item.id}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>

            {selected.needsValue ? (
              <label className="block min-w-0 max-w-xs">
                <span className="text-label text-[0.65rem] tracking-[0.08em]">
                  Value to insert
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={valueInput}
                  onChange={(event) => setValueInput(event.target.value)}
                  className={cn(
                    'mt-1.5 h-10 w-full rounded-md border border-border bg-surface px-3',
                    'font-mono text-sm text-foreground shadow-sm transition-theme',
                    'placeholder:text-muted-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    inputError && 'border-rose-500/60',
                  )}
                  placeholder="e.g. 50"
                  aria-label="Value to insert"
                  aria-invalid={inputError ? true : undefined}
                />
                {inputError ? (
                  <p className="mt-1.5 text-body-sm text-rose-600 dark:text-rose-400">
                    {inputError}
                  </p>
                ) : null}
              </label>
            ) : null}

            <div>
              <p className="text-label text-[0.65rem] tracking-[0.08em]">
                Starting deque
              </p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {DEQUE_ARRAY_PRESETS.map((preset) => {
                  const selectedPreset =
                    values.length === preset.values.length &&
                    values.every(
                      (value, index) => value === preset.values[index],
                    )
                  return (
                    <Button
                      key={preset.id}
                      type="button"
                      variant={selectedPreset ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => setValues([...preset.values])}
                      aria-pressed={selectedPreset}
                    >
                      {preset.label}
                    </Button>
                  )
                })}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearDeque}
                >
                  Clear
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetDeque}
                >
                  Reset lesson deque
                </Button>
              </div>
            </div>

            <div className="space-y-2 rounded-lg border border-border/80 bg-surface/60 p-3">
              <label className="flex items-start gap-2 text-body-sm text-foreground">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={useCapacity}
                  onChange={(event) => setUseCapacity(event.target.checked)}
                />
                <span>
                  Demonstrate educational max capacity (optional overflow demo —
                  not how every deque works)
                </span>
              </label>
              {useCapacity ? (
                <label className="block max-w-xs">
                  <span className="text-label text-[0.65rem] tracking-[0.08em]">
                    Educational capacity
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={capacityInput}
                    onChange={(event) => setCapacityInput(event.target.value)}
                    className={cn(
                      'mt-1.5 h-10 w-full rounded-md border border-border bg-surface px-3',
                      'font-mono text-sm text-foreground shadow-sm transition-theme',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      capacityError && 'border-rose-500/60',
                    )}
                    aria-label="Educational max capacity"
                    aria-invalid={capacityError ? true : undefined}
                  />
                  {capacityError ? (
                    <p className="mt-1.5 text-body-sm text-rose-600 dark:text-rose-400">
                      {capacityError}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-body-sm text-muted-foreground">
                      When size reaches this limit, inserts report overflow and
                      leave the deque unchanged.
                    </p>
                  )}
                </label>
              ) : null}
            </div>

            {mutating ? (
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={
                    ((operation === 'push-front' ||
                      operation === 'push-back') &&
                      operand === undefined) ||
                    Boolean(capacityError)
                  }
                  onClick={applyFinalDeque}
                >
                  Apply result to starting deque
                </Button>
                <p className="mt-1.5 text-body-sm text-muted-foreground">
                  Optional: commit a successful insert or pop as the new starting
                  deque. Playback never mutates historical steps. Underflow and
                  overflow leave the deque unchanged.
                </p>
              </div>
            ) : null}
          </div>
        }
        canvasAddon={(step) => <DequePanels step={step} />}
      />
    </div>
  )
}
