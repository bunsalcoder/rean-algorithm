import { useMemo, useState } from 'react'
import {
  STACK_ARRAY_PRESETS,
  STACK_DEFAULT_VALUES,
  STACK_EDUCATIONAL_MAX_CAPACITY,
  clear,
  formatStack,
  isEmpty,
  peek,
  pop,
  push,
  size,
  snapshotFromArray,
  toArray,
} from '../../algorithms/data-structures/stack'
import {
  buildStackSteps,
  type StackOperation,
} from '../../algorithms/data-structures/stackSteps'
import { cn } from '../../lib/cn'
import { Button } from '../ui'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import { StackPanels } from './StackPanels'

const OPERATIONS: {
  id: StackOperation
  label: string
  needsValue: boolean
}[] = [
  { id: 'push', label: 'Push', needsValue: true },
  { id: 'pop', label: 'Pop', needsValue: false },
  { id: 'peek', label: 'Peek', needsValue: false },
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
  operation: StackOperation,
  operand: number | undefined,
  maxCapacity: number | null,
): string {
  const snapshot = snapshotFromArray(values, maxCapacity)

  if (operation === 'push') {
    if (operand === undefined) {
      return 'Enter a finite number to preview'
    }
    const result = push(snapshot, operand)
    if (!result.ok) {
      return `Overflow (educational cap ${maxCapacity}) — stack unchanged`
    }
    return `${formatStack(values)} → push(${operand}) → ${formatStack(toArray(result.snapshot))}`
  }

  if (operation === 'pop') {
    const result = pop(snapshot)
    if (!result.ok) {
      return 'Underflow — empty stack, nothing to pop'
    }
    return `${formatStack(values)} → pop() → ${formatStack(toArray(result.snapshot))} (returned ${result.value})`
  }

  if (operation === 'peek') {
    const top = peek(snapshot)
    if (top === undefined) {
      return 'Underflow — empty stack, nothing to peek'
    }
    return `peek() → ${top} (stack unchanged)`
  }

  if (operation === 'is-empty') {
    return `isEmpty() → ${isEmpty(snapshot)}`
  }

  return `size() → ${size(snapshot)}`
}

/**
 * Interactive playground for stack LIFO operations.
 * Owns stack values + operation selection; feeds AlgorithmVisualizer.
 */
export function StackVisualization() {
  const [values, setValues] = useState<number[]>([...STACK_DEFAULT_VALUES])
  const [operation, setOperation] = useState<StackOperation>('push')
  const [valueInput, setValueInput] = useState('40')
  const [useCapacity, setUseCapacity] = useState(false)
  const [capacityInput, setCapacityInput] = useState(
    String(STACK_EDUCATIONAL_MAX_CAPACITY),
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
        ? 'Enter a number to push.'
        : 'Value must be a finite number.'
      : null

  const capacityError =
    useCapacity &&
    (parsedCapacity === undefined || parsedCapacity < 0)
      ? 'Educational capacity must be a non-negative finite number.'
      : null

  const steps = useMemo(
    () => buildStackSteps(values, operation, operand, maxCapacity),
    [values, operation, operand, maxCapacity],
  )

  const indexArray = useMemo(
    () => values.map((_, index) => index),
    [values],
  )

  const applyFinalStack = () => {
    const snapshot = snapshotFromArray(values, maxCapacity)

    if (operation === 'push') {
      if (operand === undefined) {
        return
      }
      const result = push(snapshot, operand)
      if (result.ok) {
        setValues(toArray(result.snapshot))
      }
      return
    }

    if (operation === 'pop') {
      const result = pop(snapshot)
      if (result.ok) {
        setValues(toArray(result.snapshot))
      }
      return
    }

    // peek / is-empty / size do not mutate
  }

  const resetStack = () => {
    setValues([...STACK_DEFAULT_VALUES])
    setOperation('push')
    setValueInput('40')
  }

  const clearStack = () => {
    setValues(toArray(clear(snapshotFromArray(values, maxCapacity))))
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
        A stack is LIFO: push and pop only at the top. The last array element is
        the top. Pop or peek on an empty stack is underflow — the visualization
        explains the error instead of inventing a value.
      </p>

      <div className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20">
        <p className="text-body-sm text-muted-foreground" aria-live="polite">
          Stack:{' '}
          <span className="font-mono text-foreground">
            {formatStack(values)}
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
        key={`stack-${operation}-${values.join(',')}-${valueInput}-${maxCapacity}`}
        title="Stack in action"
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
                  Value to push
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
                  placeholder="e.g. 40"
                  aria-label="Value to push"
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
                Starting stack
              </p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {STACK_ARRAY_PRESETS.map((preset) => {
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
                  onClick={clearStack}
                >
                  Clear
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetStack}
                >
                  Reset lesson stack
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
                  not how every stack works)
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
                      When size reaches this limit, push reports overflow and
                      leaves the stack unchanged.
                    </p>
                  )}
                </label>
              ) : null}
            </div>

            {operation === 'push' || operation === 'pop' ? (
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={
                    (operation === 'push' && operand === undefined) ||
                    Boolean(capacityError)
                  }
                  onClick={applyFinalStack}
                >
                  Apply result to starting stack
                </Button>
                <p className="mt-1.5 text-body-sm text-muted-foreground">
                  Optional: commit a successful push or pop as the new starting
                  stack. Playback never mutates historical steps. Underflow and
                  overflow leave the stack unchanged.
                </p>
              </div>
            ) : null}
          </div>
        }
        canvasAddon={(step) => <StackPanels step={step} />}
      />
    </div>
  )
}
