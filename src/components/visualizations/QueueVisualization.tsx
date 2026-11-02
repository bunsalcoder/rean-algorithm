import { useMemo, useState } from 'react'
import {
  QUEUE_ARRAY_PRESETS,
  QUEUE_DEFAULT_VALUES,
  QUEUE_EDUCATIONAL_MAX_CAPACITY,
  clear,
  dequeue,
  enqueue,
  formatQueue,
  front,
  isEmpty,
  rear,
  size,
  snapshotFromArray,
  toArray,
} from '../../algorithms/data-structures/queue'
import {
  buildQueueSteps,
  type QueueOperation,
} from '../../algorithms/data-structures/queueSteps'
import { cn } from '../../lib/cn'
import { Button } from '../ui'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import { QueuePanels } from './QueuePanels'

const OPERATIONS: {
  id: QueueOperation
  label: string
  needsValue: boolean
}[] = [
  { id: 'enqueue', label: 'Enqueue', needsValue: true },
  { id: 'dequeue', label: 'Dequeue', needsValue: false },
  { id: 'front', label: 'Front / Peek', needsValue: false },
  { id: 'rear', label: 'Rear', needsValue: false },
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
  operation: QueueOperation,
  operand: number | undefined,
  maxCapacity: number | null,
): string {
  const snapshot = snapshotFromArray(values, maxCapacity)

  if (operation === 'enqueue') {
    if (operand === undefined) {
      return 'Enter a finite number to preview'
    }
    const result = enqueue(snapshot, operand)
    if (!result.ok) {
      return `Overflow (educational cap ${maxCapacity}) — queue unchanged`
    }
    return `${formatQueue(values)} → enqueue(${operand}) → ${formatQueue(toArray(result.snapshot))}`
  }

  if (operation === 'dequeue') {
    const result = dequeue(snapshot)
    if (!result.ok) {
      return 'Underflow — empty queue, nothing to dequeue'
    }
    return `${formatQueue(values)} → dequeue() → ${formatQueue(toArray(result.snapshot))} (returned ${result.value})`
  }

  if (operation === 'front') {
    const value = front(snapshot)
    if (value === undefined) {
      return 'Underflow — empty queue, nothing at the front'
    }
    return `front() → ${value} (queue unchanged)`
  }

  if (operation === 'rear') {
    const value = rear(snapshot)
    if (value === undefined) {
      return 'Underflow — empty queue, nothing at the rear'
    }
    return `rear() → ${value} (queue unchanged)`
  }

  if (operation === 'is-empty') {
    return `isEmpty() → ${isEmpty(snapshot)}`
  }

  return `size() → ${size(snapshot)}`
}

/**
 * Interactive playground for queue FIFO operations.
 * Owns queue values + operation selection; feeds AlgorithmVisualizer.
 */
export function QueueVisualization() {
  const [values, setValues] = useState<number[]>([...QUEUE_DEFAULT_VALUES])
  const [operation, setOperation] = useState<QueueOperation>('enqueue')
  const [valueInput, setValueInput] = useState('50')
  const [useCapacity, setUseCapacity] = useState(false)
  const [capacityInput, setCapacityInput] = useState(
    String(QUEUE_EDUCATIONAL_MAX_CAPACITY),
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
        ? 'Enter a number to enqueue.'
        : 'Value must be a finite number.'
      : null

  const capacityError =
    useCapacity &&
    (parsedCapacity === undefined || parsedCapacity < 0)
      ? 'Educational capacity must be a non-negative finite number.'
      : null

  const steps = useMemo(
    () => buildQueueSteps(values, operation, operand, maxCapacity),
    [values, operation, operand, maxCapacity],
  )

  const indexArray = useMemo(
    () => values.map((_, index) => index),
    [values],
  )

  const applyFinalQueue = () => {
    const snapshot = snapshotFromArray(values, maxCapacity)

    if (operation === 'enqueue') {
      if (operand === undefined) {
        return
      }
      const result = enqueue(snapshot, operand)
      if (result.ok) {
        setValues(toArray(result.snapshot))
      }
      return
    }

    if (operation === 'dequeue') {
      const result = dequeue(snapshot)
      if (result.ok) {
        setValues(toArray(result.snapshot))
      }
      return
    }

    // front / rear / is-empty / size do not mutate
  }

  const resetQueue = () => {
    setValues([...QUEUE_DEFAULT_VALUES])
    setOperation('enqueue')
    setValueInput('50')
  }

  const clearQueue = () => {
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
        A queue is FIFO: enqueue at the rear, dequeue from the front. Dequeue,
        front, or rear on an empty queue is underflow — the visualization
        explains the error instead of inventing a value.
      </p>

      <div className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20">
        <p className="text-body-sm text-muted-foreground" aria-live="polite">
          Queue:{' '}
          <span className="font-mono text-foreground">
            {formatQueue(values)}
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
        key={`queue-${operation}-${values.join(',')}-${valueInput}-${maxCapacity}`}
        title="Queue in action"
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
                  Value to enqueue
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
                  aria-label="Value to enqueue"
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
                Starting queue
              </p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {QUEUE_ARRAY_PRESETS.map((preset) => {
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
                  onClick={clearQueue}
                >
                  Clear
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetQueue}
                >
                  Reset lesson queue
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
                  not how every queue works)
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
                      When size reaches this limit, enqueue reports overflow and
                      leaves the queue unchanged.
                    </p>
                  )}
                </label>
              ) : null}
            </div>

            {operation === 'enqueue' || operation === 'dequeue' ? (
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={
                    (operation === 'enqueue' && operand === undefined) ||
                    Boolean(capacityError)
                  }
                  onClick={applyFinalQueue}
                >
                  Apply result to starting queue
                </Button>
                <p className="mt-1.5 text-body-sm text-muted-foreground">
                  Optional: commit a successful enqueue or dequeue as the new
                  starting queue. Playback never mutates historical steps.
                  Underflow and overflow leave the queue unchanged.
                </p>
              </div>
            ) : null}
          </div>
        }
        canvasAddon={(step) => <QueuePanels step={step} />}
      />
    </div>
  )
}
