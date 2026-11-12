import { useMemo, useState } from 'react'
import {
  PRIORITY_QUEUE_PRESETS,
  PRIORITY_QUEUE_SAMPLE_TASKS,
  clear,
  createEmpty,
  dequeue,
  enqueue,
  formatPriorityQueue,
  fromSeeds,
  isEmpty,
  isValidPriorityQueue,
  peek,
  priorityDirectionLabel,
  size,
  toArray,
  withMode,
  type PriorityQueueMode,
  type PriorityQueueSnapshot,
} from '../../algorithms/data-structures/priorityQueue'
import {
  buildPriorityQueueSteps,
  snapshotFromFinalStep,
  type PriorityQueueOperation,
} from '../../algorithms/data-structures/priorityQueueSteps'
import { cn } from '../../lib/cn'
import { Button } from '../ui'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import { PriorityQueuePanels } from './PriorityQueuePanels'

const OPERATIONS: {
  id: PriorityQueueOperation
  label: string
  needsItem: boolean
}[] = [
  { id: 'enqueue', label: 'Enqueue', needsItem: true },
  { id: 'peek', label: 'Peek', needsItem: false },
  { id: 'dequeue', label: 'Dequeue', needsItem: false },
  { id: 'is-empty', label: 'isEmpty', needsItem: false },
  { id: 'size', label: 'Size', needsItem: false },
  { id: 'clear', label: 'Clear', needsItem: false },
]

const QUICK_ADD = [
  { item: 'Fix critical bug', priority: 1 },
  { item: 'Review pull request', priority: 3 },
  { item: 'Update documentation', priority: 5 },
  { item: 'Refactor component', priority: 4 },
] as const

function parsePriority(raw: string): number | null {
  const trimmed = raw.trim()
  if (trimmed === '') {
    return null
  }
  const value = Number(trimmed)
  if (!Number.isFinite(value)) {
    return null
  }
  return value
}

function snapshotsEqual(
  left: PriorityQueueSnapshot<string>,
  right: PriorityQueueSnapshot<string>,
): boolean {
  if (left.mode !== right.mode || left.entries.length !== right.entries.length) {
    return false
  }
  return left.entries.every(
    (entry, index) =>
      entry.item === right.entries[index].item &&
      entry.priority === right.entries[index].priority &&
      entry.sequence === right.entries[index].sequence,
  )
}

function previewResult(
  snapshot: PriorityQueueSnapshot<string>,
  operation: PriorityQueueOperation,
  item: string,
  priority: number | null,
): string {
  if (operation === 'enqueue') {
    if (!item.trim() || priority === null) {
      return 'Enter a task name and finite priority'
    }
    const result = enqueue(snapshot, item.trim(), priority)
    return `enqueue → ${formatPriorityQueue(result.snapshot)}`
  }
  if (operation === 'peek') {
    const next = peek(snapshot)
    return next
      ? `peek() → ${next.item} @ ${next.priority} (unchanged)`
      : 'peek() → empty'
  }
  if (operation === 'dequeue') {
    const result = dequeue(snapshot)
    if (!result.ok || !result.entry) {
      return 'dequeue() → empty queue'
    }
    return `dequeue() → ${result.entry.item} @ ${result.entry.priority}; now ${formatPriorityQueue(result.snapshot)}`
  }
  if (operation === 'is-empty') {
    return `isEmpty() → ${isEmpty(snapshot)}`
  }
  if (operation === 'size') {
    return `size() → ${size(snapshot)}`
  }
  return 'clear() → empty queue'
}

/**
 * Interactive Min/Max Priority Queue playground with heap tree + array views.
 */
export function PriorityQueueVisualization() {
  const [mode, setMode] = useState<PriorityQueueMode>('min')
  const [snapshot, setSnapshot] = useState<PriorityQueueSnapshot<string>>(() =>
    fromSeeds(PRIORITY_QUEUE_SAMPLE_TASKS, 'min'),
  )
  const [operation, setOperation] = useState<PriorityQueueOperation>('enqueue')
  const [itemInput, setItemInput] = useState('Pager duty')
  const [priorityInput, setPriorityInput] = useState('0')

  const selected = OPERATIONS.find((item) => item.id === operation)!
  const priority = selected.needsItem ? parsePriority(priorityInput) : null
  const itemError =
    selected.needsItem && itemInput.trim() === ''
      ? 'Enter a task name.'
      : null
  const priorityError =
    selected.needsItem && priority === null
      ? 'Enter a finite priority (0, negatives, and duplicates are valid).'
      : null

  const steps = useMemo(
    () =>
      buildPriorityQueueSteps(
        snapshot,
        operation,
        selected.needsItem
          ? { item: itemInput, priority: priority ?? Number.NaN }
          : null,
      ),
    [snapshot, operation, selected.needsItem, itemInput, priority],
  )

  const indexArray = useMemo(
    () => snapshot.entries.map((_, index) => index),
    [snapshot.entries],
  )

  const mutating =
    operation === 'enqueue' ||
    operation === 'dequeue' ||
    operation === 'clear'

  const switchMode = (next: PriorityQueueMode) => {
    setMode(next)
    setSnapshot((current) => withMode(current, next))
  }

  const applyFinalQueue = () => {
    if (operation === 'enqueue') {
      if (itemError || priorityError || priority === null) {
        return
      }
      setSnapshot(enqueue(snapshot, itemInput.trim(), priority).snapshot)
      return
    }
    if (operation === 'dequeue') {
      const result = dequeue(snapshot)
      if (result.ok) {
        setSnapshot(result.snapshot)
      }
      return
    }
    if (operation === 'clear') {
      setSnapshot(clear(snapshot))
    }
  }

  const resetLesson = () => {
    setMode('min')
    setSnapshot(fromSeeds(PRIORITY_QUEUE_SAMPLE_TASKS, 'min'))
    setOperation('enqueue')
    setItemInput('Pager duty')
    setPriorityInput('0')
  }

  const addMultipleSamples = () => {
    let next = snapshot
    for (const task of QUICK_ADD) {
      next = enqueue(next, task.item, task.priority).snapshot
    }
    setSnapshot(next)
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
        A priority queue removes the next item by priority — not by insertion
        order (unless priorities are equal; then FIFO applies). It is
        implemented with a binary heap. Switch Min / Max, then step through
        enqueue, peek, and dequeue. Tree and array views stay synchronized.
      </p>

      <div className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-label text-[0.65rem] tracking-[0.08em]">
            Priority mode
          </p>
          <Button
            type="button"
            variant={mode === 'min' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => switchMode('min')}
            aria-pressed={mode === 'min'}
          >
            Min Priority Queue
          </Button>
          <Button
            type="button"
            variant={mode === 'max' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => switchMode('max')}
            aria-pressed={mode === 'max'}
          >
            Max Priority Queue
          </Button>
        </div>

        <p className="mt-2 text-body-sm font-medium text-foreground">
          {priorityDirectionLabel(mode)}
        </p>

        <p className="mt-2 text-body-sm text-muted-foreground" aria-live="polite">
          {formatPriorityQueue(snapshot)}
          {' · '}
          size={size(snapshot)}
          {' · '}
          empty={isEmpty(snapshot) ? 'yes' : 'no'}
          {' · '}
          valid={isValidPriorityQueue(snapshot) ? 'yes' : 'no'}
          {' · '}
          Preview:{' '}
          <span className="font-mono text-foreground">
            {previewResult(snapshot, operation, itemInput, priority)}
          </span>
        </p>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[16rem] text-left text-body-sm">
            <caption className="sr-only">
              Sample tasks and their priority numbers
            </caption>
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-1 pr-3 font-medium">Sample task</th>
                <th className="py-1 font-medium">Priority</th>
              </tr>
            </thead>
            <tbody>
              {QUICK_ADD.map((task) => (
                <tr key={task.item} className="border-b border-border/60">
                  <td className="py-1.5 pr-3 text-foreground">{task.item}</td>
                  <td className="py-1.5 font-mono text-foreground">
                    {task.priority}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AlgorithmVisualizer
        key={`pq-${mode}-${operation}-${toArray(snapshot)
          .map((e) => `${e.sequence}:${e.priority}:${e.item}`)
          .join('|')}-${itemInput}-${priorityInput}`}
        title="Priority Queue in action"
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

            {selected.needsItem ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <label className="block min-w-0 max-w-sm flex-1">
                  <span className="text-label text-[0.65rem] tracking-[0.08em]">
                    Task
                  </span>
                  <input
                    type="text"
                    value={itemInput}
                    onChange={(event) => setItemInput(event.target.value)}
                    className={cn(
                      'mt-1.5 h-10 w-full rounded-md border border-border bg-surface px-3',
                      'text-sm text-foreground shadow-sm transition-theme',
                      'placeholder:text-muted-foreground',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      itemError && 'border-rose-500/60',
                    )}
                    placeholder="e.g. Fix critical bug"
                    aria-label="Task name to enqueue"
                    aria-invalid={itemError ? true : undefined}
                  />
                  {itemError ? (
                    <p className="mt-1.5 text-body-sm text-rose-600 dark:text-rose-400">
                      {itemError}
                    </p>
                  ) : null}
                </label>

                <label className="block min-w-0 max-w-[10rem]">
                  <span className="text-label text-[0.65rem] tracking-[0.08em]">
                    Priority
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={priorityInput}
                    onChange={(event) => setPriorityInput(event.target.value)}
                    className={cn(
                      'mt-1.5 h-10 w-full rounded-md border border-border bg-surface px-3',
                      'font-mono text-sm text-foreground shadow-sm transition-theme',
                      'placeholder:text-muted-foreground',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      priorityError && 'border-rose-500/60',
                    )}
                    placeholder="e.g. 1"
                    aria-label="Priority number"
                    aria-invalid={priorityError ? true : undefined}
                  />
                  {priorityError ? (
                    <p className="mt-1.5 text-body-sm text-rose-600 dark:text-rose-400">
                      {priorityError}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-body-sm text-muted-foreground">
                      {priorityDirectionLabel(mode)}
                    </p>
                  )}
                </label>
              </div>
            ) : (
              <p className="text-body-sm text-muted-foreground">
                {operation === 'dequeue'
                  ? `Dequeue removes the ${mode === 'min' ? 'minimum' : 'maximum'} priority at the root, then sift-down restores the heap.`
                  : operation === 'peek'
                    ? 'Peek reads the next item in O(1) without changing the queue.'
                    : 'Use previous / next / play to scrub immutable frames.'}
              </p>
            )}

            <div>
              <p className="text-label text-[0.65rem] tracking-[0.08em]">
                Starting queue
              </p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {PRIORITY_QUEUE_PRESETS.map((preset) => {
                  const built = fromSeeds(preset.seeds, mode)
                  const selectedPreset = snapshotsEqual(built, snapshot)
                  return (
                    <Button
                      key={preset.id}
                      type="button"
                      variant={selectedPreset ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => setSnapshot(fromSeeds(preset.seeds, mode))}
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
                  onClick={() => setSnapshot(createEmpty(mode))}
                >
                  Empty
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMultipleSamples}
                >
                  Add sample tasks
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={resetLesson}>
                  Reset lesson queue
                </Button>
              </div>
            </div>

            {mutating ? (
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={Boolean(itemError || priorityError)}
                  onClick={applyFinalQueue}
                >
                  Apply result to starting queue
                </Button>
                <p className="mt-1.5 text-body-sm text-muted-foreground">
                  Optional: commit a successful mutation as the new starting
                  queue. Playback never rewrites earlier steps. Final frame:{' '}
                  <span className="font-mono">
                    {formatPriorityQueue(snapshotFromFinalStep(steps))}
                  </span>
                </p>
              </div>
            ) : null}
          </div>
        }
        canvasAddon={(step) => <PriorityQueuePanels step={step} />}
      />
    </div>
  )
}
