import { useMemo, useState } from 'react'
import {
  HASH_TABLE_DEFAULT_CAPACITY,
  HASH_TABLE_DEFAULT_ENTRIES,
  HASH_TABLE_ENTRY_PRESETS,
  clear,
  createEmpty,
  formatKey,
  formatTable,
  formatValue,
  get,
  has,
  loadFactor,
  multiEntryBucketCount,
  occupiedBucketCount,
  set,
  size,
  snapshotFromEntries,
  deleteKey,
  type HashTableEntry,
  type HashTableSnapshot,
  type HashTableValue,
} from '../../algorithms/data-structures/hashTable'
import {
  buildHashTableSteps,
  type HashTableOperation,
} from '../../algorithms/data-structures/hashTableSteps'
import { cn } from '../../lib/cn'
import { Button } from '../ui'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import { HashTablePanels } from './HashTablePanels'

const OPERATIONS: {
  id: HashTableOperation
  label: string
  needsKey: boolean
  needsValue: boolean
}[] = [
  { id: 'set', label: 'Insert / set', needsKey: true, needsValue: true },
  { id: 'get', label: 'Get', needsKey: true, needsValue: false },
  { id: 'update', label: 'Update', needsKey: true, needsValue: true },
  { id: 'delete', label: 'Delete', needsKey: true, needsValue: false },
  { id: 'has', label: 'Contains', needsKey: true, needsValue: false },
  { id: 'stats', label: 'Statistics', needsKey: false, needsValue: false },
]

type ValueKind = 'string' | 'number' | 'boolean'

function parseTypedValue(
  raw: string,
  kind: ValueKind,
): HashTableValue | undefined {
  if (kind === 'string') {
    return raw
  }
  if (kind === 'boolean') {
    const trimmed = raw.trim().toLowerCase()
    if (trimmed === 'true') {
      return true
    }
    if (trimmed === 'false') {
      return false
    }
    return undefined
  }
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

function entriesEqual(
  left: readonly HashTableEntry[],
  right: readonly HashTableEntry[],
): boolean {
  if (left.length !== right.length) {
    return false
  }
  return left.every(
    (entry, index) =>
      entry.key === right[index]?.key && entry.value === right[index]?.value,
  )
}

function previewResult(
  snapshot: HashTableSnapshot,
  operation: HashTableOperation,
  key: string,
  value: HashTableValue | undefined,
): string {
  if (operation === 'stats') {
    return `capacity=${snapshot.capacity}, size=${size(snapshot)}, load=${loadFactor(snapshot).toFixed(2)}, occupied=${occupiedBucketCount(snapshot)}, multi-entry=${multiEntryBucketCount(snapshot)}, collisionEvents=${snapshot.collisionEvents}`
  }

  if (operation === 'set') {
    if (value === undefined) {
      return 'Enter a value to preview'
    }
    const result = set(snapshot, key, value)
    return result.inserted
      ? `set(${formatKey(key)}, ${formatValue(value)}) → inserted`
      : `set(${formatKey(key)}, ${formatValue(value)}) → updated`
  }

  if (operation === 'update') {
    if (value === undefined) {
      return 'Enter a value to preview'
    }
    if (!has(snapshot, key)) {
      return `update(${formatKey(key)}) → not found`
    }
    return `update(${formatKey(key)}, ${formatValue(value)}) → ok`
  }

  if (operation === 'get') {
    const found = get(snapshot, key)
    return found === undefined
      ? `get(${formatKey(key)}) → not found`
      : `get(${formatKey(key)}) → ${formatValue(found)}`
  }

  if (operation === 'has') {
    return `has(${formatKey(key)}) → ${has(snapshot, key)}`
  }

  const result = deleteKey(snapshot, key)
  return result.ok
    ? `delete(${formatKey(key)}) → removed ${formatValue(result.value!)}`
    : `delete(${formatKey(key)}) → not found`
}

/**
 * Interactive playground for hash-table operations with separate chaining.
 * Owns table state + operation selection; feeds AlgorithmVisualizer.
 */
export function HashTableVisualization() {
  const [snapshot, setSnapshot] = useState<HashTableSnapshot>(() =>
    snapshotFromEntries(
      HASH_TABLE_DEFAULT_ENTRIES,
      HASH_TABLE_DEFAULT_CAPACITY,
    ),
  )
  const [operation, setOperation] = useState<HashTableOperation>('set')
  const [keyInput, setKeyInput] = useState('kiwi')
  const [valueInput, setValueInput] = useState('50')
  const [valueKind, setValueKind] = useState<ValueKind>('number')

  const selected = OPERATIONS.find((item) => item.id === operation)!
  const key = keyInput
  const value = selected.needsValue
    ? parseTypedValue(valueInput, valueKind)
    : undefined

  const valueError =
    selected.needsValue && value === undefined
      ? valueKind === 'boolean'
        ? 'Enter true or false.'
        : valueKind === 'number'
          ? 'Enter a finite number (0 is valid).'
          : null
      : null

  const steps = useMemo(
    () =>
      buildHashTableSteps(
        snapshot,
        operation,
        selected.needsKey ? key : null,
        selected.needsValue ? (value ?? null) : null,
      ),
    [snapshot, operation, selected.needsKey, selected.needsValue, key, value],
  )

  const indexArray = useMemo(
    () => snapshot.buckets.map((_, index) => index),
    [snapshot.buckets],
  )

  const mutating =
    operation === 'set' || operation === 'update' || operation === 'delete'

  const applyFinalTable = () => {
    if (operation === 'set') {
      if (value === undefined) {
        return
      }
      setSnapshot(set(snapshot, key, value).snapshot)
      return
    }
    if (operation === 'update') {
      if (value === undefined || !has(snapshot, key)) {
        return
      }
      setSnapshot(set(snapshot, key, value).snapshot)
      return
    }
    if (operation === 'delete') {
      const result = deleteKey(snapshot, key)
      if (result.ok) {
        setSnapshot(result.snapshot)
      }
    }
  }

  const resetTable = () => {
    setSnapshot(
      snapshotFromEntries(
        HASH_TABLE_DEFAULT_ENTRIES,
        HASH_TABLE_DEFAULT_CAPACITY,
      ),
    )
    setOperation('set')
    setKeyInput('kiwi')
    setValueInput('50')
    setValueKind('number')
  }

  const clearTable = () => {
    setSnapshot(clear(snapshot))
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
        A hash table maps keys to bucket indices with a hash function. This
        playground uses separate chaining: colliding keys share a bucket list.
        Empty-string keys and values like 0, false, and "" are valid. The
        rolling hash is educational and deterministic — not production-grade
        universal hashing.
      </p>

      <div className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20">
        <p className="text-body-sm text-muted-foreground" aria-live="polite">
          Table:{' '}
          <span className="font-mono text-foreground">
            {formatTable(snapshot)}
          </span>
          {' · '}
          size={size(snapshot)}
          {' · '}
          capacity={snapshot.capacity}
          {' · '}
          load={loadFactor(snapshot).toFixed(2)}
          {' · '}
          Preview:{' '}
          <span className="font-mono text-foreground">
            {previewResult(snapshot, operation, key, value)}
          </span>
        </p>
      </div>

      <AlgorithmVisualizer
        key={`hash-table-${operation}-${serializeForKey(snapshot)}-${keyInput}-${valueInput}-${valueKind}`}
        title="Hash table in action"
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

            {selected.needsKey ? (
              <label className="block min-w-0 max-w-md">
                <span className="text-label text-[0.65rem] tracking-[0.08em]">
                  Key (empty string allowed)
                </span>
                <input
                  type="text"
                  value={keyInput}
                  onChange={(event) => setKeyInput(event.target.value)}
                  className={cn(
                    'mt-1.5 h-10 w-full rounded-md border border-border bg-surface px-3',
                    'font-mono text-sm text-foreground shadow-sm transition-theme',
                    'placeholder:text-muted-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  )}
                  placeholder='e.g. apple or ""'
                  aria-label="Hash table key"
                />
              </label>
            ) : null}

            {selected.needsValue ? (
              <div className="grid gap-3 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-end">
                <label className="block min-w-0">
                  <span className="text-label text-[0.65rem] tracking-[0.08em]">
                    Value type
                  </span>
                  <select
                    value={valueKind}
                    onChange={(event) =>
                      setValueKind(event.target.value as ValueKind)
                    }
                    className={cn(
                      'mt-1.5 h-10 w-full rounded-md border border-border bg-surface px-3',
                      'text-sm text-foreground shadow-sm transition-theme',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    )}
                    aria-label="Value type"
                  >
                    <option value="number">number</option>
                    <option value="string">string</option>
                    <option value="boolean">boolean</option>
                  </select>
                </label>
                <label className="block min-w-0">
                  <span className="text-label text-[0.65rem] tracking-[0.08em]">
                    Value
                  </span>
                  <input
                    type="text"
                    value={valueInput}
                    onChange={(event) => setValueInput(event.target.value)}
                    className={cn(
                      'mt-1.5 h-10 w-full rounded-md border border-border bg-surface px-3',
                      'font-mono text-sm text-foreground shadow-sm transition-theme',
                      'placeholder:text-muted-foreground',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      valueError && 'border-rose-500/60',
                    )}
                    placeholder={
                      valueKind === 'boolean'
                        ? 'true or false'
                        : valueKind === 'number'
                          ? 'e.g. 50'
                          : 'e.g. ripe'
                    }
                    aria-label="Hash table value"
                    aria-invalid={valueError ? true : undefined}
                  />
                  {valueError ? (
                    <p className="mt-1.5 text-body-sm text-rose-600 dark:text-rose-400">
                      {valueError}
                    </p>
                  ) : null}
                </label>
              </div>
            ) : null}

            <div>
              <p className="text-label text-[0.65rem] tracking-[0.08em]">
                Starting table
              </p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {HASH_TABLE_ENTRY_PRESETS.map((preset) => {
                  const selectedPreset = entriesEqual(
                    snapshotFromEntries(
                      preset.entries,
                      HASH_TABLE_DEFAULT_CAPACITY,
                    ).buckets.flat(),
                    snapshot.buckets.flat(),
                  )
                  return (
                    <Button
                      key={preset.id}
                      type="button"
                      variant={selectedPreset ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() =>
                        setSnapshot(
                          snapshotFromEntries(
                            preset.entries,
                            HASH_TABLE_DEFAULT_CAPACITY,
                          ),
                        )
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
                  onClick={clearTable}
                >
                  Clear
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSnapshot(createEmpty(HASH_TABLE_DEFAULT_CAPACITY))
                  }
                >
                  Empty capacity 7
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetTable}
                >
                  Reset lesson table
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
                  onClick={applyFinalTable}
                >
                  Apply result to starting table
                </Button>
                <p className="mt-1.5 text-body-sm text-muted-foreground">
                  Optional: commit a successful set, update, or delete as the new
                  starting table. Playback never mutates historical steps.
                </p>
              </div>
            ) : null}
          </div>
        }
        canvasAddon={(step) => <HashTablePanels step={step} />}
      />
    </div>
  )
}

function serializeForKey(snapshot: HashTableSnapshot): string {
  return `${snapshot.capacity}:${snapshot.size}:${snapshot.collisionEvents}:${snapshot.buckets
    .map((bucket) =>
      bucket.map((entry) => `${entry.key}=${String(entry.value)}`).join('>'),
    )
    .join('|')}`
}
