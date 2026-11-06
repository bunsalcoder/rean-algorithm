import { useMemo, useState } from 'react'
import {
  AVL_ARRAY_PRESETS,
  AVL_DEFAULT_VALUES,
  clear,
  createEmpty,
  deleteValue,
  formatTree,
  height,
  insert,
  isBalanced,
  search,
  size,
  snapshotFromArray,
  type AVLTreeSnapshot,
} from '../../algorithms/data-structures/avlTree'
import {
  buildAVLTreeSteps,
  type AVLTreeOperation,
} from '../../algorithms/data-structures/avlTreeSteps'
import { cn } from '../../lib/cn'
import { Button } from '../ui'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import { AVLTreePanels } from './AVLTreePanels'

const OPERATIONS: {
  id: AVLTreeOperation
  label: string
  needsValue: boolean
}[] = [
  { id: 'insert', label: 'Insert', needsValue: true },
  { id: 'delete', label: 'Delete', needsValue: true },
  { id: 'search', label: 'Search', needsValue: true },
  { id: 'rotate-ll', label: 'LL demo', needsValue: false },
  { id: 'rotate-rr', label: 'RR demo', needsValue: false },
  { id: 'rotate-lr', label: 'LR demo', needsValue: false },
  { id: 'rotate-rl', label: 'RL demo', needsValue: false },
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
  const a = [...left].sort((x, y) => x - y)
  const b = [...right].sort((x, y) => x - y)
  return a.every((value, index) => value === b[index])
}

function previewResult(
  snapshot: AVLTreeSnapshot,
  operation: AVLTreeOperation,
  value: number | null,
): string {
  if (operation === 'insert') {
    if (value === null) {
      return 'Enter a number to preview'
    }
    const result = insert(snapshot, value)
    return result.inserted
      ? `insert(${value}) → inserted + rebalance`
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
      ? `delete(${value}) → ${result.caseKind} + rebalance`
      : `delete(${value}) → not found`
  }
  if (operation === 'rotate-ll') {
    return 'Demo sequence [30, 20, 10]'
  }
  if (operation === 'rotate-rr') {
    return 'Demo sequence [10, 20, 30]'
  }
  if (operation === 'rotate-lr') {
    return 'Demo sequence [30, 10, 20]'
  }
  return 'Demo sequence [10, 30, 20]'
}

/**
 * Interactive playground for AVL insert, delete, search, and rotation demos.
 */
export function AVLTreeVisualization() {
  const [snapshot, setSnapshot] = useState<AVLTreeSnapshot>(() =>
    snapshotFromArray(AVL_DEFAULT_VALUES),
  )
  const [operation, setOperation] = useState<AVLTreeOperation>('insert')
  const [valueInput, setValueInput] = useState('25')

  const selected = OPERATIONS.find((item) => item.id === operation)!
  const value = selected.needsValue ? parseNumber(valueInput) : null
  const valueError =
    selected.needsValue && value === null
      ? 'Enter a finite number (0 and negatives are valid).'
      : null

  const steps = useMemo(
    () => buildAVLTreeSteps(snapshot, operation, value),
    [snapshot, operation, value],
  )

  const indexArray = useMemo(
    () => snapshot.nodes.map((_, index) => index),
    [snapshot.nodes],
  )

  const mutating = operation === 'insert' || operation === 'delete'
  const rotationDemo = operation.startsWith('rotate-')

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

  const applyRotationDemoResult = () => {
    if (operation === 'rotate-ll') {
      setSnapshot(snapshotFromArray([30, 20, 10]))
      return
    }
    if (operation === 'rotate-rr') {
      setSnapshot(snapshotFromArray([10, 20, 30]))
      return
    }
    if (operation === 'rotate-lr') {
      setSnapshot(snapshotFromArray([30, 10, 20]))
      return
    }
    if (operation === 'rotate-rl') {
      setSnapshot(snapshotFromArray([10, 30, 20]))
    }
  }

  const resetTree = () => {
    setSnapshot(snapshotFromArray(AVL_DEFAULT_VALUES))
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
        An AVL tree is a self-balancing BST. After every insert or delete it
        updates heights, computes balance factors (height(left) −
        height(right)), and rotates (LL / RR / LR / RL) so every factor stays
        in {'{−1, 0, 1}'}. Default demo: insert 30 → 20 → 10 triggers LL, then a
        right rotation yields root 20 with children 10 and 30. Duplicates are
        ignored.
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
          balanced={isBalanced(snapshot) ? 'yes' : 'no'}
          {' · '}
          Preview:{' '}
          <span className="font-mono text-foreground">
            {previewResult(snapshot, operation, value)}
          </span>
        </p>
      </div>

      <AlgorithmVisualizer
        key={`avl-${operation}-${serializeForKey(snapshot)}-${valueInput}`}
        title="AVL tree in action"
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
                    onClick={() => {
                      setOperation(item.id)
                      if (item.id === 'rotate-ll') {
                        setSnapshot(createEmpty())
                      } else if (item.id === 'rotate-rr') {
                        setSnapshot(createEmpty())
                      } else if (item.id === 'rotate-lr') {
                        setSnapshot(createEmpty())
                      } else if (item.id === 'rotate-rl') {
                        setSnapshot(createEmpty())
                      }
                    }}
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
                  aria-label="AVL operation value"
                  aria-invalid={valueError ? true : undefined}
                />
                {valueError ? (
                  <p className="mt-1.5 text-body-sm text-rose-600 dark:text-rose-400">
                    {valueError}
                  </p>
                ) : null}
              </label>
            ) : (
              <p className="text-body-sm text-muted-foreground">
                Rotation demos start from an empty tree and insert a short
                sequence that triggers the selected imbalance case. Use
                previous / next / play to watch each height update and rotation.
              </p>
            )}

            <div>
              <p className="text-label text-[0.65rem] tracking-[0.08em]">
                Starting tree
              </p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {AVL_ARRAY_PRESETS.map((preset) => {
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

            {rotationDemo ? (
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={applyRotationDemoResult}
                >
                  Apply demo result as starting tree
                </Button>
              </div>
            ) : null}
          </div>
        }
        canvasAddon={(step) => <AVLTreePanels step={step} />}
      />
    </div>
  )
}

function serializeForKey(snapshot: AVLTreeSnapshot): string {
  return `${snapshot.rootId ?? 'null'}:${snapshot.nextIdCounter}:${snapshot.nodes
    .map(
      (node) =>
        `${node.id}=${node.value}>${node.leftId ?? ''}/${node.rightId ?? ''}:h${node.height}`,
    )
    .join('|')}`
}
