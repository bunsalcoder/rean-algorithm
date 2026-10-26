import { useMemo, useState } from 'react'
import {
  DOUBLY_LINKED_LIST_ARRAY_PRESETS,
  DOUBLY_LINKED_LIST_DEFAULT_VALUES,
  deleteByValue,
  insertAfter,
  insertAtBeginning,
  insertAtEnd,
  insertBefore,
  listFromArray,
  listToArray,
  listToArrayReverse,
} from '../../algorithms/data-structures/doublyLinkedList'
import {
  buildDoublyLinkedListSteps,
  type DoublyLinkedListOperation,
} from '../../algorithms/data-structures/doublyLinkedListSteps'
import { cn } from '../../lib/cn'
import { Button } from '../ui'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import { DoublyLinkedListPanels } from './DoublyLinkedListPanels'

const OPERATIONS: {
  id: DoublyLinkedListOperation
  label: string
  needsValue: boolean
  needsTarget: boolean
}[] = [
  { id: 'traverse-forward', label: 'Traverse forward', needsValue: false, needsTarget: false },
  { id: 'traverse-backward', label: 'Traverse backward', needsValue: false, needsTarget: false },
  { id: 'insert-beginning', label: 'Insert at beginning', needsValue: true, needsTarget: false },
  { id: 'insert-end', label: 'Insert at end', needsValue: true, needsTarget: false },
  { id: 'insert-before', label: 'Insert before', needsValue: true, needsTarget: true },
  { id: 'insert-after', label: 'Insert after', needsValue: true, needsTarget: true },
  { id: 'delete-by-value', label: 'Delete by value', needsValue: true, needsTarget: false },
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

function formatList(values: readonly number[]): string {
  if (values.length === 0) {
    return 'null ⇄ null (empty)'
  }
  return `null ← [${values.join('] ⇄ [')}] → null`
}

function previewResult(
  values: readonly number[],
  operation: DoublyLinkedListOperation,
  operand: number | undefined,
  target: number | undefined,
): string {
  const list = listFromArray(values)

  if (operation === 'traverse-forward') {
    const walked = listToArray(list)
    return walked.length === 0
      ? 'Empty — visit null immediately'
      : `Forward: ${walked.join(' → ')} → null`
  }

  if (operation === 'traverse-backward') {
    const walked = listToArrayReverse(list)
    return walked.length === 0
      ? 'Empty — visit null immediately'
      : `Backward: ${walked.join(' → ')} → null`
  }

  if (operand === undefined) {
    return 'Enter a finite number to preview'
  }

  if (
    (operation === 'insert-before' || operation === 'insert-after') &&
    target === undefined
  ) {
    return 'Enter a target node value to preview'
  }

  if (operation === 'insert-beginning') {
    return `Result: ${formatList(listToArray(insertAtBeginning(list, operand)))}`
  }

  if (operation === 'insert-end') {
    return `Result: ${formatList(listToArray(insertAtEnd(list, operand)))}`
  }

  if (operation === 'insert-before') {
    const { list: next, inserted } = insertBefore(list, target!, operand)
    return inserted
      ? `Result: ${formatList(listToArray(next))}`
      : `Target ${target} not found — list unchanged`
  }

  if (operation === 'insert-after') {
    const { list: next, inserted } = insertAfter(list, target!, operand)
    return inserted
      ? `Result: ${formatList(listToArray(next))}`
      : `Target ${target} not found — list unchanged`
  }

  const { list: next, deleted } = deleteByValue(list, operand)
  if (!deleted) {
    return values.length === 0
      ? 'Empty list — nothing to delete'
      : `Value ${operand} not found — list unchanged`
  }
  return `Result: ${formatList(listToArray(next))}`
}

/**
 * Interactive playground for doubly linked list operations.
 * Owns list values + operation selection; feeds AlgorithmVisualizer.
 */
export function DoublyLinkedListVisualization() {
  const [values, setValues] = useState<number[]>([
    ...DOUBLY_LINKED_LIST_DEFAULT_VALUES,
  ])
  const [operation, setOperation] =
    useState<DoublyLinkedListOperation>('traverse-forward')
  const [valueInput, setValueInput] = useState('15')
  const [targetInput, setTargetInput] = useState('20')

  const selected = OPERATIONS.find((item) => item.id === operation)!
  const operand = parseOperand(valueInput)
  const target = parseOperand(targetInput)

  const valueError =
    selected.needsValue && operand === undefined
      ? valueInput.trim() === ''
        ? 'Enter a number for this operation.'
        : 'Value must be a finite number.'
      : null

  const targetError =
    selected.needsTarget && target === undefined
      ? targetInput.trim() === ''
        ? 'Enter the selected node value.'
        : 'Target must be a finite number.'
      : null

  const steps = useMemo(
    () => buildDoublyLinkedListSteps(values, operation, operand, target),
    [values, operation, operand, target],
  )

  const indexArray = useMemo(
    () => values.map((_, index) => index),
    [values],
  )

  const applyFinalList = () => {
    if (
      operation === 'traverse-forward' ||
      operation === 'traverse-backward'
    ) {
      return
    }
    if (operand === undefined) {
      return
    }
    const list = listFromArray(values)

    if (operation === 'insert-beginning') {
      setValues(listToArray(insertAtBeginning(list, operand)))
      return
    }
    if (operation === 'insert-end') {
      setValues(listToArray(insertAtEnd(list, operand)))
      return
    }
    if (operation === 'insert-before') {
      if (target === undefined) {
        return
      }
      const { list: next, inserted } = insertBefore(list, target, operand)
      if (inserted) {
        setValues(listToArray(next))
      }
      return
    }
    if (operation === 'insert-after') {
      if (target === undefined) {
        return
      }
      const { list: next, inserted } = insertAfter(list, target, operand)
      if (inserted) {
        setValues(listToArray(next))
      }
      return
    }
    const { list: next, deleted } = deleteByValue(list, operand)
    if (deleted) {
      setValues(listToArray(next))
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
        Each node stores value, prev, and next. Head and tail let you start
        walks in either direction. Insert or delete at a known node is O(1)
        for the pointer updates; finding a value is still O(n).
      </p>

      <div className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20">
        <p className="text-body-sm text-muted-foreground" aria-live="polite">
          List:{' '}
          <span className="font-mono text-foreground">
            {formatList(values)}
          </span>
          {' · '}
          Preview:{' '}
          <span className="font-mono text-foreground">
            {previewResult(values, operation, operand, target)}
          </span>
        </p>
      </div>

      <AlgorithmVisualizer
        key={`dll-${operation}-${values.join(',')}-${valueInput}-${targetInput}`}
        title="Doubly Linked List in action"
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

            {(selected.needsValue || selected.needsTarget) && (
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                {selected.needsValue ? (
                  <label className="block min-w-0 max-w-xs">
                    <span className="text-label text-[0.65rem] tracking-[0.08em]">
                      {selected.needsTarget ? 'New value' : 'Value'}
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
                      placeholder="e.g. 15"
                      aria-label="Operation value"
                      aria-invalid={valueError ? true : undefined}
                    />
                    {valueError ? (
                      <p className="mt-1.5 text-body-sm text-rose-600 dark:text-rose-400">
                        {valueError}
                      </p>
                    ) : null}
                  </label>
                ) : null}

                {selected.needsTarget ? (
                  <label className="block min-w-0 max-w-xs">
                    <span className="text-label text-[0.65rem] tracking-[0.08em]">
                      Target value
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={targetInput}
                      onChange={(event) => setTargetInput(event.target.value)}
                      className={cn(
                        'mt-1.5 h-10 w-full rounded-md border border-border bg-surface px-3',
                        'font-mono text-sm text-foreground shadow-sm transition-theme',
                        'placeholder:text-muted-foreground',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        targetError && 'border-rose-500/60',
                      )}
                      placeholder="e.g. 20"
                      aria-label="Target node value"
                      aria-invalid={targetError ? true : undefined}
                    />
                    {targetError ? (
                      <p className="mt-1.5 text-body-sm text-rose-600 dark:text-rose-400">
                        {targetError}
                      </p>
                    ) : null}
                  </label>
                ) : null}
              </div>
            )}

            <div>
              <p className="text-label text-[0.65rem] tracking-[0.08em]">
                Starting list
              </p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {DOUBLY_LINKED_LIST_ARRAY_PRESETS.map((preset) => {
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
              </div>
            </div>

            {operation !== 'traverse-forward' &&
            operation !== 'traverse-backward' ? (
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={
                    operand === undefined ||
                    (selected.needsTarget && target === undefined)
                  }
                  onClick={applyFinalList}
                >
                  Apply result to starting list
                </Button>
                <p className="mt-1.5 text-body-sm text-muted-foreground">
                  Optional: commit the operation outcome as the new starting
                  list for the next run. Playback never mutates historical
                  steps.
                </p>
              </div>
            ) : null}
          </div>
        }
        canvasAddon={(step) => <DoublyLinkedListPanels step={step} />}
      />
    </div>
  )
}
