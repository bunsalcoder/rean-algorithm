import { useMemo, useState } from 'react'
import {
  BST_ARRAY_PRESETS,
  BST_DEFAULT_VALUES,
  clear,
  createEmpty,
  deleteValue,
  findMax,
  findMin,
  formatTree,
  height,
  insert,
  search,
  size,
  snapshotFromArray,
  type BinarySearchTreeSnapshot,
} from '../../algorithms/data-structures/binarySearchTree'
import {
  buildBinarySearchTreeSteps,
  type BinarySearchTreeOperation,
} from '../../algorithms/data-structures/binarySearchTreeSteps'
import { cn } from '../../lib/cn'
import { Button } from '../ui'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import { BinarySearchTreePanels } from './BinarySearchTreePanels'

const OPERATIONS: {
  id: BinarySearchTreeOperation
  label: string
  needsValue: boolean
}[] = [
  { id: 'insert', label: 'Insert', needsValue: true },
  { id: 'search', label: 'Search', needsValue: true },
  { id: 'delete', label: 'Delete', needsValue: true },
  { id: 'inorder', label: 'Inorder', needsValue: false },
  { id: 'preorder', label: 'Preorder', needsValue: false },
  { id: 'postorder', label: 'Postorder', needsValue: false },
  { id: 'level-order', label: 'Level-order', needsValue: false },
  { id: 'find-min', label: 'Find min', needsValue: false },
  { id: 'find-max', label: 'Find max', needsValue: false },
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

function valuesEqual(
  left: readonly number[],
  right: readonly number[],
): boolean {
  if (left.length !== right.length) {
    return false
  }
  // Compare multisets via sorted copies — trees store unique values
  const a = [...left].sort((x, y) => x - y)
  const b = [...right].sort((x, y) => x - y)
  return a.every((value, index) => value === b[index])
}

function previewResult(
  snapshot: BinarySearchTreeSnapshot,
  operation: BinarySearchTreeOperation,
  value: number | null,
): string {
  if (operation === 'insert') {
    if (value === null) {
      return 'Enter a number to preview'
    }
    const result = insert(snapshot, value)
    return result.inserted
      ? `insert(${value}) → inserted`
      : `insert(${value}) → duplicate ignored`
  }
  if (operation === 'search') {
    if (value === null) {
      return 'Enter a number to preview'
    }
    return search(snapshot, value).found
      ? `search(${value}) → found`
      : `search(${value}) → not found`
  }
  if (operation === 'delete') {
    if (value === null) {
      return 'Enter a number to preview'
    }
    const result = deleteValue(snapshot, value)
    return result.deleted
      ? `delete(${value}) → ${result.caseKind}`
      : `delete(${value}) → not found`
  }
  if (operation === 'find-min') {
    const min = findMin(snapshot).value
    return min === null ? 'findMin() → empty' : `findMin() → ${min}`
  }
  if (operation === 'find-max') {
    const max = findMax(snapshot).value
    return max === null ? 'findMax() → empty' : `findMax() → ${max}`
  }
  return `${operation}() → walk all nodes`
}

/**
 * Interactive playground for BST insert, search, delete, and traversals.
 * Owns tree state + operation selection; feeds AlgorithmVisualizer.
 */
export function BinarySearchTreeVisualization() {
  const [snapshot, setSnapshot] = useState<BinarySearchTreeSnapshot>(() =>
    snapshotFromArray(BST_DEFAULT_VALUES),
  )
  const [operation, setOperation] =
    useState<BinarySearchTreeOperation>('insert')
  const [valueInput, setValueInput] = useState('25')

  const selected = OPERATIONS.find((item) => item.id === operation)!
  const value = selected.needsValue ? parseNumber(valueInput) : null
  const valueError =
    selected.needsValue && value === null
      ? 'Enter a finite number (0 and negatives are valid).'
      : null

  const steps = useMemo(
    () => buildBinarySearchTreeSteps(snapshot, operation, value),
    [snapshot, operation, value],
  )

  const indexArray = useMemo(
    () => snapshot.nodes.map((_, index) => index),
    [snapshot.nodes],
  )

  const mutating =
    operation === 'insert' || operation === 'delete'

  const applyFinalTree = () => {
    if (operation === 'insert') {
      if (value === null) {
        return
      }
      setSnapshot(insert(snapshot, value).snapshot)
      return
    }
    if (operation === 'delete') {
      if (value === null) {
        return
      }
      const result = deleteValue(snapshot, value)
      if (result.deleted) {
        setSnapshot(result.snapshot)
      }
    }
  }

  const resetTree = () => {
    setSnapshot(snapshotFromArray(BST_DEFAULT_VALUES))
    setOperation('insert')
    setValueInput('25')
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
        A binary search tree keeps left &lt; node &lt; right. Duplicate inserts
        are ignored in this lesson. Height is measured in edges (empty = −1,
        leaf = 0). An ordinary BST is not self-balancing — sorted inserts can
        skew the tree toward O(n) operations.
      </p>

      <div className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20">
        <p className="text-body-sm text-muted-foreground" aria-live="polite">
          Inorder:{' '}
          <span className="font-mono text-foreground">
            {formatTree(snapshot)}
          </span>
          {' · '}
          size={size(snapshot)}
          {' · '}
          height={height(snapshot)}
          {' · '}
          Preview:{' '}
          <span className="font-mono text-foreground">
            {previewResult(snapshot, operation, value)}
          </span>
        </p>
      </div>

      <AlgorithmVisualizer
        key={`bst-${operation}-${serializeForKey(snapshot)}-${valueInput}`}
        title="Binary search tree in action"
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
                  placeholder="e.g. 25"
                  aria-label="BST operation value"
                  aria-invalid={valueError ? true : undefined}
                />
                {valueError ? (
                  <p className="mt-1.5 text-body-sm text-rose-600 dark:text-rose-400">
                    {valueError}
                  </p>
                ) : null}
              </label>
            ) : null}

            <div>
              <p className="text-label text-[0.65rem] tracking-[0.08em]">
                Starting tree
              </p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {BST_ARRAY_PRESETS.map((preset) => {
                  const selectedPreset = valuesEqual(
                    snapshotFromArray(preset.values).nodes.map((n) => n.value),
                    snapshot.nodes.map((n) => n.value),
                  )
                  return (
                    <Button
                      key={preset.id}
                      type="button"
                      variant={selectedPreset ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() =>
                        setSnapshot(snapshotFromArray(preset.values))
                      }
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
                  onClick={() => setSnapshot(clear(snapshot))}
                >
                  Clear
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSnapshot(createEmpty())}
                >
                  Empty tree
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetTree}
                >
                  Reset lesson tree
                </Button>
              </div>
            </div>

            {mutating ? (
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={Boolean(valueError)}
                  onClick={applyFinalTree}
                >
                  Apply result to starting tree
                </Button>
                <p className="mt-1.5 text-body-sm text-muted-foreground">
                  Optional: commit a successful insert or delete as the new
                  starting tree. Playback never mutates historical steps.
                </p>
              </div>
            ) : null}
          </div>
        }
        canvasAddon={(step) => <BinarySearchTreePanels step={step} />}
      />
    </div>
  )
}

function serializeForKey(snapshot: BinarySearchTreeSnapshot): string {
  return `${snapshot.rootId ?? 'null'}:${snapshot.nextIdCounter}:${snapshot.nodes
    .map((node) => `${node.id}=${node.value}>${node.leftId ?? ''}/${node.rightId ?? ''}`)
    .join('|')}`
}
