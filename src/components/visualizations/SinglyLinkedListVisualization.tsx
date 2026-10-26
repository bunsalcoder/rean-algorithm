import { useMemo, useState } from 'react'
import {
  SINGLY_LINKED_LIST_ARRAY_PRESETS,
  SINGLY_LINKED_LIST_DEFAULT_VALUES,
  deleteByValue,
  insertAtBeginning,
  insertAtEnd,
  listFromArray,
  listToArray,
} from '../../algorithms/data-structures/singlyLinkedList'
import {
  buildSinglyLinkedListSteps,
  type SinglyLinkedListOperation,
} from '../../algorithms/data-structures/singlyLinkedListSteps'
import { cn } from '../../lib/cn'
import { Button } from '../ui'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import { LinkedListPanels } from './LinkedListPanels'

const OPERATIONS: {
  id: SinglyLinkedListOperation
  label: string
  needsValue: boolean
}[] = [
  { id: 'traverse', label: 'Traverse', needsValue: false },
  { id: 'insert-beginning', label: 'Insert at beginning', needsValue: true },
  { id: 'insert-end', label: 'Insert at end', needsValue: true },
  { id: 'delete-by-value', label: 'Delete by value', needsValue: true },
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
  operation: SinglyLinkedListOperation,
  operand: number | undefined,
): string {
  const head = listFromArray(values)

  if (operation === 'traverse') {
    const walked = listToArray(head)
    return walked.length === 0
      ? 'Empty — visit null immediately'
      : `Visit ${walked.join(' → ')} → null`
  }

  if (operand === undefined) {
    return 'Enter a finite number to preview'
  }

  if (operation === 'insert-beginning') {
    return `Result: ${listToArray(insertAtBeginning(head, operand)).join(' → ') || '(empty)'} → null`
  }

  if (operation === 'insert-end') {
    return `Result: ${listToArray(insertAtEnd(head, operand)).join(' → ') || '(empty)'} → null`
  }

  const { head: next, deleted } = deleteByValue(head, operand)
  if (!deleted) {
    return values.length === 0
      ? 'Empty list — nothing to delete'
      : `Value ${operand} not found — list unchanged`
  }
  const result = listToArray(next)
  return result.length === 0
    ? 'Result: empty list (head → null)'
    : `Result: ${result.join(' → ')} → null`
}

/**
 * Interactive playground for singly linked list operations.
 * Owns list values + operation selection; feeds AlgorithmVisualizer.
 */
export function SinglyLinkedListVisualization() {
  const [values, setValues] = useState<number[]>([
    ...SINGLY_LINKED_LIST_DEFAULT_VALUES,
  ])
  const [operation, setOperation] =
    useState<SinglyLinkedListOperation>('traverse')
  const [valueInput, setValueInput] = useState('5')

  const selected = OPERATIONS.find((item) => item.id === operation)!
  const operand = parseOperand(valueInput)
  const inputError =
    selected.needsValue && operand === undefined
      ? valueInput.trim() === ''
        ? 'Enter a number for this operation.'
        : 'Value must be a finite number.'
      : null

  const steps = useMemo(
    () => buildSinglyLinkedListSteps(values, operation, operand),
    [values, operation, operand],
  )

  const indexArray = useMemo(
    () => values.map((_, index) => index),
    [values],
  )

  const applyFinalList = () => {
    if (operation === 'traverse') {
      return
    }
    if (operand === undefined) {
      return
    }
    const head = listFromArray(values)
    if (operation === 'insert-beginning') {
      setValues(listToArray(insertAtBeginning(head, operand)))
      return
    }
    if (operation === 'insert-end') {
      setValues(listToArray(insertAtEnd(head, operand)))
      return
    }
    const { head: next, deleted } = deleteByValue(head, operand)
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
        Each node stores a value and a next reference. Follow next from head
        until null. Insert at the beginning is O(1); append and search need a
        walk when you do not keep a tail pointer.
      </p>

      <div className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20">
        <p className="text-body-sm text-muted-foreground" aria-live="polite">
          List:{' '}
          <span className="font-mono text-foreground">
            {values.length === 0
              ? 'head → null'
              : `head → [${values.join('] → [')}] → null`}
          </span>
          {' · '}
          Preview:{' '}
          <span className="font-mono text-foreground">
            {previewResult(values, operation, operand)}
          </span>
        </p>
      </div>

      <AlgorithmVisualizer
        key={`sll-${operation}-${values.join(',')}-${valueInput}`}
        title="Singly Linked List in action"
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
                    inputError && 'border-rose-500/60',
                  )}
                  placeholder="e.g. 5"
                  aria-label="Operation value"
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
                Starting list
              </p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {SINGLY_LINKED_LIST_ARRAY_PRESETS.map((preset) => {
                  const selectedPreset =
                    values.length === preset.values.length &&
                    values.every((value, index) => value === preset.values[index])
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

            {operation !== 'traverse' ? (
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={operand === undefined}
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
        canvasAddon={(step) => <LinkedListPanels step={step} />}
      />
    </div>
  )
}
