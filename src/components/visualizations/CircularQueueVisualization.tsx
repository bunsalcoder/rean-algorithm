import { useMemo, useState } from 'react'
import {
  CIRCULAR_QUEUE_ARRAY_PRESETS,
  CIRCULAR_QUEUE_CAPACITY_PRESETS,
  CIRCULAR_QUEUE_DEFAULT_CAPACITY,
  CIRCULAR_QUEUE_DEFAULT_VALUES,
  CIRCULAR_QUEUE_MAX_CAPACITY,
  CIRCULAR_QUEUE_MIN_CAPACITY,
  clear,
  dequeue,
  enqueue,
  formatCircularQueue,
  front,
  isEmpty,
  isFull,
  rear,
  size,
  snapshotFromArray,
  snapshotFromState,
  toArray,
  withCapacity,
  type CircularQueueSnapshot,
} from '../../algorithms/data-structures/circularQueue'
import {
  buildCircularQueueSteps,
  type CircularQueueOperation,
} from '../../algorithms/data-structures/circularQueueSteps'
import { cn } from '../../lib/cn'
import { Button } from '../ui'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import { CircularQueuePanels } from './CircularQueuePanels'

const OPERATIONS: {
  id: CircularQueueOperation
  label: string
  needsValue: boolean
}[] = [
  { id: 'enqueue', label: 'Enqueue', needsValue: true },
  { id: 'dequeue', label: 'Dequeue', needsValue: false },
  { id: 'front', label: 'Front / Peek', needsValue: false },
  { id: 'rear', label: 'Rear', needsValue: false },
  { id: 'is-empty', label: 'isEmpty', needsValue: false },
  { id: 'is-full', label: 'isFull', needsValue: false },
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
  snapshot: CircularQueueSnapshot,
  operation: CircularQueueOperation,
  operand: number | undefined,
): string {
  const values = toArray(snapshot)

  if (operation === 'enqueue') {
    if (operand === undefined) {
      return 'Enter a finite number to preview'
    }
    const result = enqueue(snapshot, operand)
    if (!result.ok) {
      return `Full (size ${size(snapshot)} / ${snapshot.capacity}) — enqueue rejected`
    }
    const wrapNote = result.wrapped ? ' [wrapped]' : ''
    return `${formatCircularQueue(values)} → enqueue(${operand})${wrapNote} → ${formatCircularQueue(toArray(result.snapshot))}`
  }

  if (operation === 'dequeue') {
    const result = dequeue(snapshot)
    if (!result.ok) {
      return 'Empty — nothing to dequeue'
    }
    const wrapNote = result.wrapped ? ' [wrapped]' : ''
    return `${formatCircularQueue(values)} → dequeue()${wrapNote} → ${formatCircularQueue(toArray(result.snapshot))} (returned ${result.value})`
  }

  if (operation === 'front') {
    const value = front(snapshot)
    if (value === undefined) {
      return 'Empty — nothing at the front'
    }
    return `front() → ${value} (queue unchanged)`
  }

  if (operation === 'rear') {
    const value = rear(snapshot)
    if (value === undefined) {
      return 'Empty — nothing at the rear'
    }
    return `rear() → ${value} (queue unchanged)`
  }

  if (operation === 'is-empty') {
    return `isEmpty() → ${isEmpty(snapshot)}`
  }

  return `isFull() → ${isFull(snapshot)}`
}

/**
 * Interactive playground for circular queue ring-buffer operations.
 * Owns ring snapshot + operation selection; feeds AlgorithmVisualizer.
 */
export function CircularQueueVisualization() {
  const [snapshot, setSnapshot] = useState<CircularQueueSnapshot>(() =>
    snapshotFromArray(
      [...CIRCULAR_QUEUE_DEFAULT_VALUES],
      CIRCULAR_QUEUE_DEFAULT_CAPACITY,
    ),
  )
  const [operation, setOperation] =
    useState<CircularQueueOperation>('enqueue')
  const [valueInput, setValueInput] = useState('40')
  const [capacityInput, setCapacityInput] = useState(
    String(CIRCULAR_QUEUE_DEFAULT_CAPACITY),
  )

  const selected = OPERATIONS.find((item) => item.id === operation)!
  const operand = parseOperand(valueInput)
  const parsedCapacity = parseOperand(capacityInput)
  const capacityError =
    parsedCapacity === undefined ||
    !Number.isInteger(parsedCapacity) ||
    parsedCapacity < CIRCULAR_QUEUE_MIN_CAPACITY ||
    parsedCapacity > CIRCULAR_QUEUE_MAX_CAPACITY
      ? `Capacity must be an integer from ${CIRCULAR_QUEUE_MIN_CAPACITY} to ${CIRCULAR_QUEUE_MAX_CAPACITY}.`
      : parsedCapacity < snapshot.size
        ? `Capacity ${parsedCapacity} is smaller than the current size (${snapshot.size}). Dequeue first or pick a larger capacity.`
        : null

  const inputError =
    selected.needsValue && operand === undefined
      ? valueInput.trim() === ''
        ? 'Enter a number to enqueue.'
        : 'Value must be a finite number.'
      : null

  const steps = useMemo(
    () =>
      buildCircularQueueSteps(
        toArray(snapshot),
        operation,
        operand,
        snapshot.capacity,
        snapshot,
      ),
    [snapshot, operation, operand],
  )

  const indexArray = useMemo(
    () => snapshot.buffer.map((_, index) => index),
    [snapshot.buffer],
  )

  const applyFinalQueue = () => {
    if (operation === 'enqueue') {
      if (operand === undefined) {
        return
      }
      const result = enqueue(snapshot, operand)
      if (result.ok) {
        setSnapshot(result.snapshot)
      }
      return
    }

    if (operation === 'dequeue') {
      const result = dequeue(snapshot)
      if (result.ok) {
        setSnapshot(result.snapshot)
      }
    }
  }

  const resetQueue = () => {
    setSnapshot(
      snapshotFromArray(
        [...CIRCULAR_QUEUE_DEFAULT_VALUES],
        CIRCULAR_QUEUE_DEFAULT_CAPACITY,
      ),
    )
    setOperation('enqueue')
    setValueInput('40')
    setCapacityInput(String(CIRCULAR_QUEUE_DEFAULT_CAPACITY))
  }

  const clearQueue = () => {
    setSnapshot(clear(snapshot))
  }

  const applyCapacity = () => {
    if (
      parsedCapacity === undefined ||
      !Number.isInteger(parsedCapacity) ||
      capacityError
    ) {
      return
    }
    try {
      setSnapshot(withCapacity(snapshot, parsedCapacity))
    } catch {
      // Invalid capacity already surfaced via capacityError.
    }
  }

  const loadPreset = (values: readonly number[]) => {
    const capacity = Math.max(snapshot.capacity, values.length, 1)
    setSnapshot(snapshotFromArray([...values], capacity))
    setCapacityInput(String(capacity))
  }

  const loadWrappedDemo = () => {
    // Occupied slots wrap: front at 4, then 5, 0, 1 — rear at 1.
    const capacity = 6
    setSnapshot(
      snapshotFromState({
        buffer: [30, 40, null, null, 10, 20],
        front: 4,
        rear: 1,
        size: 4,
      }),
    )
    setCapacityInput(String(capacity))
    setOperation('enqueue')
    setValueInput('50')
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
        A circular queue reuses a fixed buffer with modulo wraparound. Enqueue
        at the rear, dequeue from the front. Full and empty are detected with an
        explicit size counter — not by comparing front and rear alone.
      </p>

      <div className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20">
        <p className="text-body-sm text-muted-foreground" aria-live="polite">
          Queue:{' '}
          <span className="font-mono text-foreground">
            {formatCircularQueue(toArray(snapshot))}
          </span>
          {' · '}
          size={size(snapshot)}/{snapshot.capacity}
          {' · '}
          front={isEmpty(snapshot) ? '—' : snapshot.front}
          {' · '}
          rear={isEmpty(snapshot) ? '—' : snapshot.rear}
          {' · '}
          isEmpty={String(isEmpty(snapshot))}
          {' · '}
          isFull={String(isFull(snapshot))}
          {' · '}
          Preview:{' '}
          <span className="font-mono text-foreground">
            {previewResult(snapshot, operation, operand)}
          </span>
        </p>
      </div>

      <AlgorithmVisualizer
        key={`circular-queue-${operation}-${snapshot.front}-${snapshot.rear}-${snapshot.size}-${snapshot.capacity}-${snapshot.buffer.join(',')}-${valueInput}`}
        title="Circular queue in action"
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
                  placeholder="e.g. 40"
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
                Capacity
              </p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
                <label className="block max-w-[8rem]">
                  <span className="sr-only">Capacity value</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={capacityInput}
                    onChange={(event) => setCapacityInput(event.target.value)}
                    className={cn(
                      'h-10 w-full rounded-md border border-border bg-surface px-3',
                      'font-mono text-sm text-foreground shadow-sm transition-theme',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      capacityError && 'border-rose-500/60',
                    )}
                    aria-label="Ring capacity"
                    aria-invalid={capacityError ? true : undefined}
                  />
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={Boolean(capacityError)}
                  onClick={applyCapacity}
                >
                  Apply capacity
                </Button>
                {CIRCULAR_QUEUE_CAPACITY_PRESETS.map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant={
                      snapshot.capacity === preset ? 'secondary' : 'outline'
                    }
                    size="sm"
                    disabled={preset < snapshot.size}
                    onClick={() => {
                      setCapacityInput(String(preset))
                      setSnapshot(withCapacity(snapshot, preset))
                    }}
                    aria-pressed={snapshot.capacity === preset}
                  >
                    {preset}
                  </Button>
                ))}
              </div>
              {capacityError ? (
                <p className="mt-1.5 text-body-sm text-rose-600 dark:text-rose-400">
                  {capacityError}
                </p>
              ) : (
                <p className="mt-1.5 text-body-sm text-muted-foreground">
                  Fixed ring size ({CIRCULAR_QUEUE_MIN_CAPACITY}–
                  {CIRCULAR_QUEUE_MAX_CAPACITY}). Changing capacity re-lays live
                  values from index 0.
                </p>
              )}
            </div>

            <div>
              <p className="text-label text-[0.65rem] tracking-[0.08em]">
                Starting queue
              </p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {CIRCULAR_QUEUE_ARRAY_PRESETS.map((preset) => {
                  const selectedPreset =
                    toArray(snapshot).length === preset.values.length &&
                    toArray(snapshot).every(
                      (value, index) => value === preset.values[index],
                    ) &&
                    snapshot.front === 0
                  return (
                    <Button
                      key={preset.id}
                      type="button"
                      variant={selectedPreset ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => loadPreset(preset.values)}
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
                  onClick={loadWrappedDemo}
                >
                  Wrapped demo
                </Button>
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
                  Reset
                </Button>
              </div>
            </div>

            {operation === 'enqueue' || operation === 'dequeue' ? (
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={
                    (operation === 'enqueue' &&
                      (operand === undefined || isFull(snapshot))) ||
                    (operation === 'dequeue' && isEmpty(snapshot))
                  }
                  onClick={applyFinalQueue}
                >
                  Apply result to starting queue
                </Button>
                <p className="mt-1.5 text-body-sm text-muted-foreground">
                  Optional: commit a successful enqueue or dequeue as the new
                  starting ring. Playback never mutates historical steps. Full
                  and empty operations leave the queue unchanged.
                </p>
              </div>
            ) : null}

            <p className="text-body-sm text-muted-foreground">
              Tip: use Wrapped demo, then enqueue to watch rear wrap, or dequeue
              until front wraps from the last index back to 0.
            </p>
          </div>
        }
        canvasAddon={(step) => <CircularQueuePanels step={step} />}
      />
    </div>
  )
}
