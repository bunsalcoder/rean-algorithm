import { useMemo, useState } from 'react'
import {
  HEAP_ARRAY_PRESETS,
  HEAP_DEFAULT_VALUES,
  buildHeap,
  clear,
  createEmpty,
  extract,
  formatHeap,
  insert,
  isEmpty,
  isValidHeap,
  peek,
  size,
  snapshotFromArray,
  toArray,
  type HeapKind,
  type HeapSnapshot,
} from '../../algorithms/data-structures/heap'
import {
  buildHeapSteps,
  type HeapOperation,
} from '../../algorithms/data-structures/heapSteps'
import { cn } from '../../lib/cn'
import { Button } from '../ui'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import { HeapPanels } from './HeapPanels'

const OPERATIONS: {
  id: HeapOperation
  label: string
  needsValue: boolean
  needsBuildArray?: boolean
}[] = [
  { id: 'insert', label: 'Insert', needsValue: true },
  { id: 'peek', label: 'Peek', needsValue: false },
  { id: 'extract', label: 'Extract root', needsValue: false },
  { id: 'build-heap', label: 'Build heap', needsValue: false, needsBuildArray: true },
  { id: 'is-empty', label: 'isEmpty', needsValue: false },
  { id: 'size', label: 'Size', needsValue: false },
  { id: 'clear', label: 'Clear', needsValue: false },
]

function parseNumber(raw: string): number | null {
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

function parseNumberList(raw: string): number[] | null {
  const trimmed = raw.trim()
  if (trimmed === '') {
    return []
  }
  const parts = trimmed.split(/[\s,]+/).filter(Boolean)
  const values: number[] = []
  for (const part of parts) {
    const value = Number(part)
    if (!Number.isFinite(value)) {
      return null
    }
    values.push(value)
  }
  return values
}

function valuesEqual(
  left: readonly number[],
  right: readonly number[],
): boolean {
  if (left.length !== right.length) {
    return false
  }
  return left.every((value, index) => value === right[index])
}

function previewResult(
  snapshot: HeapSnapshot,
  operation: HeapOperation,
  value: number | null,
  buildValues: number[] | null,
): string {
  if (operation === 'insert') {
    if (value === null) {
      return 'Enter a finite number to preview'
    }
    const result = insert(snapshot, value)
    return `insert(${value}) → ${formatHeap(toArray(result.snapshot), snapshot.kind)}`
  }
  if (operation === 'peek') {
    const root = peek(snapshot)
    return root === undefined
      ? 'peek() → empty'
      : `peek() → ${root} (heap unchanged)`
  }
  if (operation === 'extract') {
    const result = extract(snapshot)
    if (!result.ok) {
      return 'extract() → empty heap'
    }
    return `extract() → ${result.value}; now ${formatHeap(toArray(result.snapshot), snapshot.kind)}`
  }
  if (operation === 'build-heap') {
    if (buildValues === null) {
      return 'Enter a comma-separated list (e.g. 4, 8, 3, 10, 1)'
    }
    const built = buildHeap(buildValues, snapshot.kind)
    return `buildHeap(${buildValues.join(', ')}) → ${formatHeap(toArray(built), snapshot.kind)}`
  }
  if (operation === 'is-empty') {
    return `isEmpty() → ${isEmpty(snapshot)}`
  }
  if (operation === 'size') {
    return `size() → ${size(snapshot)}`
  }
  return 'clear() → empty heap'
}

/**
 * Interactive Min/Max Heap playground with synchronized tree + array views.
 */
export function HeapVisualization() {
  const [kind, setKind] = useState<HeapKind>('min')
  const [snapshot, setSnapshot] = useState<HeapSnapshot>(() =>
    buildHeap(HEAP_DEFAULT_VALUES, 'min'),
  )
  const [operation, setOperation] = useState<HeapOperation>('insert')
  const [valueInput, setValueInput] = useState('2')
  const [buildInput, setBuildInput] = useState(
    HEAP_DEFAULT_VALUES.join(', '),
  )

  const selected = OPERATIONS.find((item) => item.id === operation)!
  const value = selected.needsValue ? parseNumber(valueInput) : null
  const buildValues = selected.needsBuildArray
    ? parseNumberList(buildInput)
    : null

  const valueError =
    selected.needsValue && value === null
      ? 'Enter a finite number (0, negatives, and duplicates are valid).'
      : null

  const buildError =
    selected.needsBuildArray && buildValues === null
      ? 'Use comma- or space-separated finite numbers.'
      : null

  const steps = useMemo(
    () => buildHeapSteps(snapshot, operation, value, buildValues),
    [snapshot, operation, value, buildValues],
  )

  const indexArray = useMemo(
    () => snapshot.values.map((_, index) => index),
    [snapshot.values],
  )

  const mutating =
    operation === 'insert' ||
    operation === 'extract' ||
    operation === 'build-heap' ||
    operation === 'clear'

  const switchKind = (next: HeapKind) => {
    setKind(next)
    setSnapshot((current) => buildHeap(current.values, next))
  }

  const applyFinalHeap = () => {
    if (operation === 'insert') {
      if (value === null) {
        return
      }
      setSnapshot(insert(snapshot, value).snapshot)
      return
    }
    if (operation === 'extract') {
      const result = extract(snapshot)
      if (result.ok) {
        setSnapshot(result.snapshot)
      }
      return
    }
    if (operation === 'build-heap') {
      if (buildValues === null) {
        return
      }
      setSnapshot(buildHeap(buildValues, kind))
      return
    }
    if (operation === 'clear') {
      setSnapshot(clear(snapshot))
    }
  }

  const resetLesson = () => {
    setKind('min')
    setSnapshot(buildHeap(HEAP_DEFAULT_VALUES, 'min'))
    setOperation('insert')
    setValueInput('2')
    setBuildInput(HEAP_DEFAULT_VALUES.join(', '))
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
        A binary heap is a complete binary tree stored in an array. It only
        guarantees the parent–child heap property — it is not fully sorted.
        Switch Min / Max, then step through insert, peek, extract, and O(n)
        build-heap. Tree and array views stay synchronized.
      </p>

      <div className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-label text-[0.65rem] tracking-[0.08em]">
            Heap type
          </p>
          <Button
            type="button"
            variant={kind === 'min' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => switchKind('min')}
            aria-pressed={kind === 'min'}
          >
            Min Heap
          </Button>
          <Button
            type="button"
            variant={kind === 'max' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => switchKind('max')}
            aria-pressed={kind === 'max'}
          >
            Max Heap
          </Button>
        </div>

        <p className="mt-3 text-body-sm text-muted-foreground" aria-live="polite">
          {formatHeap(snapshot.values, kind)}
          {' · '}
          size={size(snapshot)}
          {' · '}
          empty={isEmpty(snapshot) ? 'yes' : 'no'}
          {' · '}
          valid={isValidHeap(snapshot) ? 'yes' : 'no'}
          {' · '}
          Preview:{' '}
          <span className="font-mono text-foreground">
            {previewResult(snapshot, operation, value, buildValues)}
          </span>
        </p>
      </div>

      <AlgorithmVisualizer
        key={`heap-${kind}-${operation}-${snapshot.values.join(',')}-${valueInput}-${buildInput}`}
        title="Heap in action"
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
                  Value
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
                    valueError && 'border-rose-500/60',
                  )}
                  placeholder="e.g. 2"
                  aria-label="Heap insert value"
                  aria-invalid={valueError ? true : undefined}
                />
                {valueError ? (
                  <p className="mt-1.5 text-body-sm text-rose-600 dark:text-rose-400">
                    {valueError}
                  </p>
                ) : null}
              </label>
            ) : null}

            {selected.needsBuildArray ? (
              <label className="block min-w-0 max-w-xl">
                <span className="text-label text-[0.65rem] tracking-[0.08em]">
                  Build from array
                </span>
                <input
                  type="text"
                  value={buildInput}
                  onChange={(event) => setBuildInput(event.target.value)}
                  className={cn(
                    'mt-1.5 h-10 w-full rounded-md border border-border bg-surface px-3',
                    'font-mono text-sm text-foreground shadow-sm transition-theme',
                    'placeholder:text-muted-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    buildError && 'border-rose-500/60',
                  )}
                  placeholder="e.g. 4, 8, 3, 10, 1"
                  aria-label="Values to build into a heap"
                  aria-invalid={buildError ? true : undefined}
                />
                {buildError ? (
                  <p className="mt-1.5 text-body-sm text-rose-600 dark:text-rose-400">
                    {buildError}
                  </p>
                ) : (
                  <p className="mt-1.5 text-body-sm text-muted-foreground">
                    Bottom-up heapify is O(n). Prefer this over n individual
                    inserts when building from scratch.
                  </p>
                )}
              </label>
            ) : null}

            {!selected.needsValue && !selected.needsBuildArray ? (
              <p className="text-body-sm text-muted-foreground">
                {operation === 'extract'
                  ? `Extract removes the ${kind === 'min' ? 'minimum' : 'maximum'} at the root, then sift-down restores the heap.`
                  : operation === 'peek'
                    ? 'Peek reads the root in O(1) without changing the heap.'
                    : 'Use previous / next / play to scrub immutable frames.'}
              </p>
            ) : null}

            <div>
              <p className="text-label text-[0.65rem] tracking-[0.08em]">
                Starting heap
              </p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {HEAP_ARRAY_PRESETS.map((preset) => {
                  const built = buildHeap(preset.values, kind)
                  const selectedPreset = valuesEqual(
                    built.values,
                    snapshot.values,
                  )
                  return (
                    <Button
                      key={preset.id}
                      type="button"
                      variant={selectedPreset ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setSnapshot(buildHeap(preset.values, kind))
                        setBuildInput([...preset.values].join(', '))
                      }}
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
                  onClick={() => setSnapshot(createEmpty(kind))}
                >
                  Empty
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSnapshot(snapshotFromArray(snapshot.values, kind))
                  }
                >
                  Keep as array (no heapify)
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={resetLesson}>
                  Reset lesson heap
                </Button>
              </div>
            </div>

            {mutating ? (
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={Boolean(valueError || buildError)}
                  onClick={applyFinalHeap}
                >
                  Apply result to starting heap
                </Button>
                <p className="mt-1.5 text-body-sm text-muted-foreground">
                  Optional: commit a successful mutation as the new starting
                  heap. Playback never rewrites earlier steps.
                </p>
              </div>
            ) : null}
          </div>
        }
        canvasAddon={(step) => <HeapPanels step={step} />}
      />
    </div>
  )
}
