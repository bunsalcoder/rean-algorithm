/**
 * Step generator for Hash Table visualization (separate chaining).
 *
 * Each step embeds an immutable `hashTableSnapshot` so previous/next
 * scrubbing never mutates historical frames. Pure data — no React.
 */

import type { VisualizationStep } from '../../components/visualizations/types'
import {
  assertInvariants,
  bucketIndex,
  cloneSnapshot,
  createEmpty,
  deleteKey as tableDelete,
  formatBucket,
  formatEntry,
  formatKey,
  formatTable,
  formatValue,
  get as tableGet,
  has as tableHas,
  hashKey,
  indexForKey,
  loadFactor,
  multiEntryBucketCount,
  occupiedBucketCount,
  rehash,
  set as tableSet,
  size as tableSize,
  type HashTableEntry,
  type HashTableSnapshot,
  type HashTableValue,
  HASH_TABLE_DEFAULT_CAPACITY,
  HASH_TABLE_DEFAULT_LOAD_FACTOR_THRESHOLD,
} from './hashTable'

export type HashTableOperation =
  | 'set'
  | 'get'
  | 'update'
  | 'delete'
  | 'has'
  | 'stats'

export type HashTablePhase =
  | 'initialize'
  | 'read-key'
  | 'compute-hash'
  | 'compute-index'
  | 'check-bucket'
  | 'traverse-chain'
  | 'insert'
  | 'update'
  | 'found'
  | 'not-found'
  | 'delete'
  | 'resize'
  | 'rehash'
  | 'report-stats'
  | 'invalid'
  | 'complete'

type StepMetaFields = {
  phase: HashTablePhase
  operation: HashTableOperation
  hashTableSnapshot: string
  inputKey: string | null
  inputValue: string | null
  hash: number | null
  bucketIndex: number | null
  activeBucket: number | null
  activeEntry: number | null
  collision: boolean
  collisionEvents: number
  multiEntryBuckets: number
  occupiedBuckets: number
  loadFactor: number
  capacity: number
  size: number
  result: string | null
  success: boolean | null
  message: string
  resized: boolean
}

/** Serialize a snapshot for VisualizationStep.meta. */
export function serializeHashTableSnapshot(
  snapshot: HashTableSnapshot,
): string {
  return JSON.stringify({
    buckets: snapshot.buckets,
    capacity: snapshot.capacity,
    size: snapshot.size,
    loadFactorThreshold: snapshot.loadFactorThreshold,
    collisionEvents: snapshot.collisionEvents,
  })
}

function parseValue(raw: unknown): HashTableValue | undefined {
  if (typeof raw === 'string' || typeof raw === 'boolean') {
    return raw
  }
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return raw
  }
  return undefined
}

/** Parse a hash-table snapshot produced by serializeHashTableSnapshot. */
export function parseHashTableSnapshot(raw: string): HashTableSnapshot {
  if (!raw) {
    return createEmpty()
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return createEmpty()
    }

    const record = parsed as Record<string, unknown>
    const capacity =
      typeof record.capacity === 'number' &&
      Number.isFinite(record.capacity) &&
      record.capacity >= 1
        ? Math.floor(record.capacity)
        : HASH_TABLE_DEFAULT_CAPACITY

    const loadFactorThreshold =
      typeof record.loadFactorThreshold === 'number' &&
      Number.isFinite(record.loadFactorThreshold) &&
      record.loadFactorThreshold > 0 &&
      record.loadFactorThreshold <= 1
        ? record.loadFactorThreshold
        : HASH_TABLE_DEFAULT_LOAD_FACTOR_THRESHOLD

    const collisionEvents =
      typeof record.collisionEvents === 'number' &&
      Number.isFinite(record.collisionEvents) &&
      record.collisionEvents >= 0
        ? Math.floor(record.collisionEvents)
        : 0

    const buckets: HashTableEntry[][] = Array.from(
      { length: capacity },
      () => [],
    )

    if (Array.isArray(record.buckets)) {
      for (let i = 0; i < Math.min(record.buckets.length, capacity); i += 1) {
        const chain = record.buckets[i]
        if (!Array.isArray(chain)) {
          continue
        }
        for (const item of chain) {
          if (!item || typeof item !== 'object') {
            continue
          }
          const entry = item as Record<string, unknown>
          if (typeof entry.key !== 'string') {
            continue
          }
          const value = parseValue(entry.value)
          if (value === undefined) {
            continue
          }
          buckets[i]!.push({ key: entry.key, value })
        }
      }
    }

    let size = 0
    for (const bucket of buckets) {
      size += bucket.length
    }

    const sizeField =
      typeof record.size === 'number' && Number.isFinite(record.size)
        ? Math.max(0, Math.floor(record.size))
        : size

    return {
      buckets,
      capacity,
      size: sizeField === size ? sizeField : size,
      loadFactorThreshold,
      collisionEvents,
    }
  } catch {
    return createEmpty()
  }
}

function meta(fields: StepMetaFields): NonNullable<VisualizationStep['meta']> {
  return {
    phase: fields.phase,
    operation: fields.operation,
    hashTableSnapshot: fields.hashTableSnapshot,
    inputKey: fields.inputKey,
    inputValue: fields.inputValue,
    hash: fields.hash,
    bucketIndex: fields.bucketIndex,
    activeBucket: fields.activeBucket,
    activeEntry: fields.activeEntry,
    collision: fields.collision,
    collisionEvents: fields.collisionEvents,
    multiEntryBuckets: fields.multiEntryBuckets,
    occupiedBuckets: fields.occupiedBuckets,
    loadFactor: Number(fields.loadFactor.toFixed(4)),
    capacity: fields.capacity,
    size: fields.size,
    result: fields.result,
    success: fields.success,
    message: fields.message,
    resized: fields.resized,
  }
}

function serializeInputValue(value: HashTableValue | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null
  }
  if (typeof value === 'string') {
    return JSON.stringify(value)
  }
  return String(value)
}

function pushStep(
  steps: VisualizationStep[],
  options: {
    id: string
    title: string
    explanation: string
    detail?: string
    snapshot: HashTableSnapshot
    phase: HashTablePhase
    operation: HashTableOperation
    inputKey?: string | null
    inputValue?: HashTableValue | null
    hash?: number | null
    bucketIndex?: number | null
    activeBucket?: number | null
    activeEntry?: number | null
    collision?: boolean
    result?: string | null
    success?: boolean | null
    message?: string
    resized?: boolean
    active?: readonly number[]
    highlighted?: readonly number[]
    found?: readonly number[]
    complete?: boolean
  },
): void {
  const snapshot = cloneSnapshot(options.snapshot)
  assertInvariants(snapshot)

  const activeBucket =
    options.activeBucket === undefined ? null : options.activeBucket
  const bucketIdx =
    options.bucketIndex === undefined ? activeBucket : options.bucketIndex

  steps.push({
    id: options.id,
    title: options.title,
    explanation: options.explanation,
    detail: options.detail,
    array: snapshot.buckets.map((bucket) => bucket.length),
    active:
      options.active ??
      (activeBucket !== null && activeBucket >= 0 ? [activeBucket] : undefined),
    highlighted: options.highlighted,
    found: options.found,
    operation: options.complete ? 'complete' : undefined,
    meta: meta({
      phase: options.phase,
      operation: options.operation,
      hashTableSnapshot: serializeHashTableSnapshot(snapshot),
      inputKey: options.inputKey ?? null,
      inputValue: serializeInputValue(options.inputValue),
      hash: options.hash ?? null,
      bucketIndex: bucketIdx,
      activeBucket,
      activeEntry:
        options.activeEntry === undefined ? null : options.activeEntry,
      collision: options.collision ?? false,
      collisionEvents: snapshot.collisionEvents,
      multiEntryBuckets: multiEntryBucketCount(snapshot),
      occupiedBuckets: occupiedBucketCount(snapshot),
      loadFactor: loadFactor(snapshot),
      capacity: snapshot.capacity,
      size: snapshot.size,
      result: options.result ?? null,
      success: options.success ?? null,
      message: options.message ?? options.explanation,
      resized: options.resized ?? false,
    }),
  })
}

function pushHashPath(
  steps: VisualizationStep[],
  options: {
    idPrefix: string
    snapshot: HashTableSnapshot
    operation: HashTableOperation
    key: string
    value?: HashTableValue | null
    startTitle: string
    startExplanation: string
  },
): { hash: number; index: number } {
  const { snapshot, operation, key } = options
  const hash = hashKey(key)
  const index = bucketIndex(hash, snapshot.capacity)

  pushStep(steps, {
    id: `${options.idPrefix}-read-key`,
    title: options.startTitle,
    explanation: options.startExplanation,
    detail: `Key ${formatKey(key)}${options.value !== undefined && options.value !== null ? ` · value ${formatValue(options.value)}` : ''}`,
    snapshot,
    phase: 'read-key',
    operation,
    inputKey: key,
    inputValue: options.value ?? null,
  })

  pushStep(steps, {
    id: `${options.idPrefix}-hash`,
    title: 'Compute hash',
    explanation: `Educational rolling hash: hash = (hash * 31 + charCode) >>> 0 → ${hash}.`,
    detail:
      'This deterministic hash is for teaching and tests — not a production universal hash.',
    snapshot,
    phase: 'compute-hash',
    operation,
    inputKey: key,
    inputValue: options.value ?? null,
    hash,
  })

  pushStep(steps, {
    id: `${options.idPrefix}-index`,
    title: 'Map to bucket index',
    explanation: `index = hash % capacity = ${hash} % ${snapshot.capacity} = ${index}.`,
    detail:
      'Different keys can share an index (collision). A good hash spreads keys; it does not guarantee unique indices.',
    snapshot,
    phase: 'compute-index',
    operation,
    inputKey: key,
    inputValue: options.value ?? null,
    hash,
    bucketIndex: index,
    activeBucket: index,
    highlighted: [index],
  })

  return { hash, index }
}

function traverseChainSteps(
  steps: VisualizationStep[],
  options: {
    idPrefix: string
    snapshot: HashTableSnapshot
    operation: HashTableOperation
    key: string
    value?: HashTableValue | null
    hash: number
    index: number
    stopWhenFound?: boolean
  },
): { foundIndex: number; collided: boolean } {
  const bucket = options.snapshot.buckets[options.index] ?? []
  const collided = bucket.length > 0

  pushStep(steps, {
    id: `${options.idPrefix}-check-bucket`,
    title: 'Check bucket',
    explanation:
      bucket.length === 0
        ? `Bucket ${options.index} is empty.`
        : `Bucket ${options.index} holds ${bucket.length} entr${bucket.length === 1 ? 'y' : 'ies'}: ${formatBucket(bucket)}.`,
    detail: collided
      ? 'A non-empty bucket means we may need to walk a collision chain.'
      : 'No chain walk needed yet.',
    snapshot: options.snapshot,
    phase: 'check-bucket',
    operation: options.operation,
    inputKey: options.key,
    inputValue: options.value ?? null,
    hash: options.hash,
    bucketIndex: options.index,
    activeBucket: options.index,
    collision: collided,
    highlighted: [options.index],
  })

  let foundIndex = -1
  for (let i = 0; i < bucket.length; i += 1) {
    const entry = bucket[i]!
    const match = entry.key === options.key
    pushStep(steps, {
      id: `${options.idPrefix}-chain-${i}`,
      title: match ? 'Key match in chain' : 'Walk collision chain',
      explanation: match
        ? `Found ${formatEntry(entry)} at chain index ${i}.`
        : `Compare with ${formatEntry(entry)} — keys differ; continue.`,
      snapshot: options.snapshot,
      phase: 'traverse-chain',
      operation: options.operation,
      inputKey: options.key,
      inputValue: options.value ?? null,
      hash: options.hash,
      bucketIndex: options.index,
      activeBucket: options.index,
      activeEntry: i,
      collision: bucket.length > 1 || (collided && !match),
      highlighted: [options.index],
      found: match ? [options.index] : undefined,
    })
    if (match) {
      foundIndex = i
      if (options.stopWhenFound !== false) {
        break
      }
    }
  }

  return { foundIndex, collided }
}

function buildInvalidSteps(
  initial: HashTableSnapshot,
  operation: HashTableOperation,
  message: string,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  pushStep(steps, {
    id: 'invalid-0',
    title: 'Invalid input',
    explanation: message,
    snapshot: initial,
    phase: 'invalid',
    operation,
    success: false,
    result: 'invalid input',
  })
  pushStep(steps, {
    id: 'invalid-done',
    title: 'No change',
    explanation: `Table remains: ${formatTable(initial)}.`,
    snapshot: initial,
    phase: 'complete',
    operation,
    success: false,
    result: 'invalid input',
    complete: true,
  })
  return steps
}

function buildSetSteps(
  initial: HashTableSnapshot,
  key: string,
  value: HashTableValue,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: HashTableOperation = 'set'
  const wouldExceed =
    !tableHas(initial, key) &&
    (initial.size + 1) / initial.capacity > initial.loadFactorThreshold

  pushStep(steps, {
    id: 'set-init',
    title: 'Start set',
    explanation: `set(${formatKey(key)}, ${formatValue(value)}). Current size ${initial.size}, capacity ${initial.capacity}, load factor ${loadFactor(initial).toFixed(2)}.`,
    detail: `Threshold ${initial.loadFactorThreshold}. Separate chaining stores colliding keys in the same bucket list.`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    inputKey: key,
    inputValue: value,
  })

  let working = initial
  let resized = false

  if (wouldExceed) {
    const newCapacity = initial.capacity * 2
    pushStep(steps, {
      id: 'set-resize',
      title: 'Load factor too high — resize',
      explanation: `Adding a new key would push load factor above ${initial.loadFactorThreshold}. Grow capacity ${initial.capacity} → ${newCapacity}.`,
      detail:
        'One resize is O(n). With doubling, inserts stay amortized O(1) on average.',
      snapshot: initial,
      phase: 'resize',
      operation,
      inputKey: key,
      inputValue: value,
      resized: true,
    })

    working = rehash(initial, newCapacity)
    resized = true

    pushStep(steps, {
      id: 'set-rehash',
      title: 'Rehash existing entries',
      explanation: `Recompute every key’s index for capacity ${newCapacity}. Table after rehash: ${formatTable(working)}.`,
      snapshot: working,
      phase: 'rehash',
      operation,
      inputKey: key,
      inputValue: value,
      resized: true,
    })
  }

  const { hash, index } = pushHashPath(steps, {
    idPrefix: 'set',
    snapshot: working,
    operation,
    key,
    value,
    startTitle: 'Read key and value',
    startExplanation: `Prepare to store ${formatKey(key)} → ${formatValue(value)}.`,
  })

  const { foundIndex, collided } = traverseChainSteps(steps, {
    idPrefix: 'set',
    snapshot: working,
    operation,
    key,
    value,
    hash,
    index,
  })

  const result = tableSet(initial, key, value)

  if (foundIndex >= 0) {
    pushStep(steps, {
      id: 'set-update',
      title: 'Update existing key',
      explanation: `Key already exists — replace value with ${formatValue(value)} (no duplicate entry).`,
      snapshot: result.snapshot,
      phase: 'update',
      operation,
      inputKey: key,
      inputValue: value,
      hash: result.hash,
      bucketIndex: result.index,
      activeBucket: result.index,
      activeEntry: result.entryIndex,
      collision: collided,
      success: true,
      result: `updated → ${formatValue(value)}`,
      found: [result.index],
      resized,
    })
  } else {
    pushStep(steps, {
      id: 'set-insert',
      title: collided ? 'Insert into collision chain' : 'Insert into empty bucket',
      explanation: collided
        ? `Collision: append ${formatEntry({ key, value })} onto bucket ${result.index}.`
        : `Write ${formatEntry({ key, value })} into empty bucket ${result.index}.`,
      detail: result.collided
        ? 'This insert counts as a collision event (new key into a non-empty bucket).'
        : undefined,
      snapshot: result.snapshot,
      phase: 'insert',
      operation,
      inputKey: key,
      inputValue: value,
      hash: result.hash,
      bucketIndex: result.index,
      activeBucket: result.index,
      activeEntry: result.entryIndex,
      collision: result.collided,
      success: true,
      result: `inserted → ${formatValue(value)}`,
      found: [result.index],
      resized: result.resized,
    })
  }

  pushStep(steps, {
    id: 'set-done',
    title: 'set complete',
    explanation: `Table: ${formatTable(result.snapshot)}. size=${result.snapshot.size}, load factor=${loadFactor(result.snapshot).toFixed(2)}.`,
    snapshot: result.snapshot,
    phase: 'complete',
    operation,
    inputKey: key,
    inputValue: value,
    hash: result.hash,
    bucketIndex: result.index,
    activeBucket: result.index,
    activeEntry: result.entryIndex,
    collision: result.collided,
    success: true,
    result: foundIndex >= 0 ? 'updated' : 'inserted',
    complete: true,
    resized: result.resized,
    found: [result.index],
  })

  return steps
}

function buildUpdateSteps(
  initial: HashTableSnapshot,
  key: string,
  value: HashTableValue,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: HashTableOperation = 'update'

  pushStep(steps, {
    id: 'update-init',
    title: 'Start update',
    explanation: `update(${formatKey(key)}, ${formatValue(value)}) — only succeeds if the key already exists.`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    inputKey: key,
    inputValue: value,
  })

  const { hash, index } = pushHashPath(steps, {
    idPrefix: 'update',
    snapshot: initial,
    operation,
    key,
    value,
    startTitle: 'Read key and new value',
    startExplanation: `Looking up ${formatKey(key)} to replace its value.`,
  })

  const { foundIndex, collided } = traverseChainSteps(steps, {
    idPrefix: 'update',
    snapshot: initial,
    operation,
    key,
    value,
    hash,
    index,
  })

  if (foundIndex < 0) {
    pushStep(steps, {
      id: 'update-missing',
      title: 'Key not found',
      explanation: `Cannot update — ${formatKey(key)} is not in the table. Use set to insert.`,
      snapshot: initial,
      phase: 'not-found',
      operation,
      inputKey: key,
      inputValue: value,
      hash,
      bucketIndex: index,
      activeBucket: index,
      collision: collided,
      success: false,
      result: 'not found',
    })
    pushStep(steps, {
      id: 'update-missing-done',
      title: 'update rejected',
      explanation: `Table unchanged: ${formatTable(initial)}.`,
      snapshot: initial,
      phase: 'complete',
      operation,
      inputKey: key,
      inputValue: value,
      hash,
      bucketIndex: index,
      success: false,
      result: 'not found',
      complete: true,
    })
    return steps
  }

  const result = tableSet(initial, key, value)
  pushStep(steps, {
    id: 'update-write',
    title: 'Write new value',
    explanation: `Replace value at chain index ${foundIndex} with ${formatValue(value)}.`,
    snapshot: result.snapshot,
    phase: 'update',
    operation,
    inputKey: key,
    inputValue: value,
    hash: result.hash,
    bucketIndex: result.index,
    activeBucket: result.index,
    activeEntry: result.entryIndex,
    collision: collided,
    success: true,
    result: `updated → ${formatValue(value)}`,
    found: [result.index],
  })
  pushStep(steps, {
    id: 'update-done',
    title: 'update complete',
    explanation: `Table: ${formatTable(result.snapshot)}.`,
    snapshot: result.snapshot,
    phase: 'complete',
    operation,
    inputKey: key,
    inputValue: value,
    hash: result.hash,
    bucketIndex: result.index,
    activeBucket: result.index,
    activeEntry: result.entryIndex,
    success: true,
    result: 'updated',
    complete: true,
    found: [result.index],
  })
  return steps
}

function buildGetSteps(
  initial: HashTableSnapshot,
  key: string,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: HashTableOperation = 'get'

  pushStep(steps, {
    id: 'get-init',
    title: 'Start get',
    explanation: `get(${formatKey(key)}) — hash, index, then walk the bucket chain if needed.`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    inputKey: key,
  })

  const { hash, index } = pushHashPath(steps, {
    idPrefix: 'get',
    snapshot: initial,
    operation,
    key,
    startTitle: 'Read lookup key',
    startExplanation: `Search for key ${formatKey(key)}.`,
  })

  const { foundIndex, collided } = traverseChainSteps(steps, {
    idPrefix: 'get',
    snapshot: initial,
    operation,
    key,
    hash,
    index,
  })

  const value = tableGet(initial, key)
  if (foundIndex < 0 || value === undefined) {
    pushStep(steps, {
      id: 'get-miss',
      title: 'Not found',
      explanation: `${formatKey(key)} is not in bucket ${index}.`,
      snapshot: initial,
      phase: 'not-found',
      operation,
      inputKey: key,
      hash,
      bucketIndex: index,
      activeBucket: index,
      collision: collided,
      success: false,
      result: 'not found',
    })
    pushStep(steps, {
      id: 'get-miss-done',
      title: 'get complete',
      explanation: 'Lookup finished without a match. Table unchanged.',
      snapshot: initial,
      phase: 'complete',
      operation,
      inputKey: key,
      hash,
      bucketIndex: index,
      success: false,
      result: 'not found',
      complete: true,
    })
    return steps
  }

  pushStep(steps, {
    id: 'get-hit',
    title: 'Found value',
    explanation: `get(${formatKey(key)}) → ${formatValue(value)}.`,
    snapshot: initial,
    phase: 'found',
    operation,
    inputKey: key,
    inputValue: value,
    hash,
    bucketIndex: index,
    activeBucket: index,
    activeEntry: foundIndex,
    collision: collided,
    success: true,
    result: formatValue(value),
    found: [index],
  })
  pushStep(steps, {
    id: 'get-done',
    title: 'get complete',
    explanation: 'Lookup finished. Table unchanged.',
    snapshot: initial,
    phase: 'complete',
    operation,
    inputKey: key,
    inputValue: value,
    hash,
    bucketIndex: index,
    activeBucket: index,
    activeEntry: foundIndex,
    success: true,
    result: formatValue(value),
    complete: true,
    found: [index],
  })
  return steps
}

function buildHasSteps(
  initial: HashTableSnapshot,
  key: string,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: HashTableOperation = 'has'
  const present = tableHas(initial, key)

  pushStep(steps, {
    id: 'has-init',
    title: 'Start contains',
    explanation: `has(${formatKey(key)}) — true if the key exists, even when the value is 0, false, or "".`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    inputKey: key,
  })

  const { hash, index } = pushHashPath(steps, {
    idPrefix: 'has',
    snapshot: initial,
    operation,
    key,
    startTitle: 'Read key',
    startExplanation: `Check whether ${formatKey(key)} is stored.`,
  })

  const { foundIndex, collided } = traverseChainSteps(steps, {
    idPrefix: 'has',
    snapshot: initial,
    operation,
    key,
    hash,
    index,
  })

  pushStep(steps, {
    id: present ? 'has-true' : 'has-false',
    title: present ? 'Key present' : 'Key absent',
    explanation: `has(${formatKey(key)}) → ${present}.`,
    snapshot: initial,
    phase: present ? 'found' : 'not-found',
    operation,
    inputKey: key,
    hash,
    bucketIndex: index,
    activeBucket: index,
    activeEntry: foundIndex >= 0 ? foundIndex : null,
    collision: collided,
    success: present,
    result: String(present),
    found: present ? [index] : undefined,
  })
  pushStep(steps, {
    id: 'has-done',
    title: 'contains complete',
    explanation: 'Membership check finished. Table unchanged.',
    snapshot: initial,
    phase: 'complete',
    operation,
    inputKey: key,
    hash,
    bucketIndex: index,
    success: present,
    result: String(present),
    complete: true,
    found: present ? [index] : undefined,
  })
  return steps
}

function buildDeleteSteps(
  initial: HashTableSnapshot,
  key: string,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: HashTableOperation = 'delete'

  pushStep(steps, {
    id: 'delete-init',
    title: 'Start delete',
    explanation: `delete(${formatKey(key)}) — remove the entry from its bucket chain.`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    inputKey: key,
  })

  const { hash, index } = pushHashPath(steps, {
    idPrefix: 'delete',
    snapshot: initial,
    operation,
    key,
    startTitle: 'Read key to delete',
    startExplanation: `Locate ${formatKey(key)} for removal.`,
  })

  const { foundIndex, collided } = traverseChainSteps(steps, {
    idPrefix: 'delete',
    snapshot: initial,
    operation,
    key,
    hash,
    index,
  })

  const result = tableDelete(initial, key)
  if (!result.ok) {
    pushStep(steps, {
      id: 'delete-miss',
      title: 'Key not found',
      explanation: `Nothing to delete — ${formatKey(key)} is absent.`,
      snapshot: initial,
      phase: 'not-found',
      operation,
      inputKey: key,
      hash,
      bucketIndex: index,
      activeBucket: index,
      collision: collided,
      success: false,
      result: 'not found',
    })
    pushStep(steps, {
      id: 'delete-miss-done',
      title: 'delete complete',
      explanation: `Table unchanged: ${formatTable(initial)}.`,
      snapshot: initial,
      phase: 'complete',
      operation,
      inputKey: key,
      hash,
      bucketIndex: index,
      success: false,
      result: 'not found',
      complete: true,
    })
    return steps
  }

  pushStep(steps, {
    id: 'delete-remove',
    title: 'Remove from chain',
    explanation: `Unlink ${formatEntry({ key, value: result.value! })} from bucket ${result.index}. Remaining: ${formatBucket(result.snapshot.buckets[result.index] ?? [])}.`,
    snapshot: result.snapshot,
    phase: 'delete',
    operation,
    inputKey: key,
    inputValue: result.value,
    hash: result.hash,
    bucketIndex: result.index,
    activeBucket: result.index,
    activeEntry: foundIndex,
    collision: collided,
    success: true,
    result: `deleted ${formatValue(result.value!)}`,
    highlighted: [result.index],
  })
  pushStep(steps, {
    id: 'delete-done',
    title: 'delete complete',
    explanation: `Table: ${formatTable(result.snapshot)}. size=${result.snapshot.size}.`,
    snapshot: result.snapshot,
    phase: 'complete',
    operation,
    inputKey: key,
    inputValue: result.value,
    hash: result.hash,
    bucketIndex: result.index,
    activeBucket: result.index,
    success: true,
    result: 'deleted',
    complete: true,
  })
  return steps
}

function buildStatsSteps(initial: HashTableSnapshot): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: HashTableOperation = 'stats'
  const lf = loadFactor(initial)
  const occupied = occupiedBucketCount(initial)
  const multi = multiEntryBucketCount(initial)

  pushStep(steps, {
    id: 'stats-init',
    title: 'Table statistics',
    explanation:
      'Inspect capacity, size, load factor, occupied buckets, and collision metrics.',
    snapshot: initial,
    phase: 'initialize',
    operation,
  })

  pushStep(steps, {
    id: 'stats-report',
    title: 'Current metrics',
    explanation: `capacity=${initial.capacity}, size=${tableSize(initial)}, load factor=${lf.toFixed(2)}, occupied buckets=${occupied}, multi-entry buckets=${multi}, collision events (lifetime inserts)=${initial.collisionEvents}.`,
    detail:
      'Collision events count inserts that landed in a non-empty bucket. Multi-entry buckets count chains that currently hold 2+ keys — these numbers are related but not identical.',
    snapshot: initial,
    phase: 'report-stats',
    operation,
    success: true,
    result: `lf=${lf.toFixed(2)}`,
  })

  pushStep(steps, {
    id: 'stats-done',
    title: 'stats complete',
    explanation: `Table: ${formatTable(initial)}.`,
    snapshot: initial,
    phase: 'complete',
    operation,
    success: true,
    result: 'reported',
    complete: true,
  })
  return steps
}

/**
 * Build visualization steps for a hash-table operation.
 * Snapshots inside each step are immutable clones.
 */
export function buildHashTableSteps(
  initial: HashTableSnapshot,
  operation: HashTableOperation,
  key?: string | null,
  value?: HashTableValue | null,
): VisualizationStep[] {
  const needsKey =
    operation === 'set' ||
    operation === 'get' ||
    operation === 'update' ||
    operation === 'delete' ||
    operation === 'has'

  if (needsKey && key === null) {
    return buildInvalidSteps(
      initial,
      operation,
      'Provide a key. Empty string "" is a valid key — leave the field intentionally empty only when that is the key you want.',
    )
  }

  if (
    (operation === 'set' || operation === 'update') &&
    (value === null || value === undefined)
  ) {
    return buildInvalidSteps(
      initial,
      operation,
      'Provide a value. 0, false, and "" are valid values — parse them explicitly in the playground.',
    )
  }

  switch (operation) {
    case 'set':
      return buildSetSteps(initial, key!, value!)
    case 'update':
      return buildUpdateSteps(initial, key!, value!)
    case 'get':
      return buildGetSteps(initial, key!)
    case 'has':
      return buildHasSteps(initial, key!)
    case 'delete':
      return buildDeleteSteps(initial, key!)
    case 'stats':
      return buildStatsSteps(initial)
    default: {
      const _exhaustive: never = operation
      return _exhaustive
    }
  }
}

/** Convenience: build steps from a flat entry list. */
export function buildHashTableStepsFromEntries(
  entries: readonly HashTableEntry[],
  operation: HashTableOperation,
  key?: string | null,
  value?: HashTableValue | null,
  capacity: number = HASH_TABLE_DEFAULT_CAPACITY,
): VisualizationStep[] {
  let snapshot = createEmpty(capacity)
  for (const entry of entries) {
    snapshot = tableSet(snapshot, entry.key, entry.value).snapshot
  }
  return buildHashTableSteps(snapshot, operation, key, value)
}

/** Recover the final snapshot from a completed step sequence. */
export function snapshotFromFinalStep(
  steps: readonly VisualizationStep[],
): HashTableSnapshot {
  const last = steps[steps.length - 1]
  const raw = last?.meta?.hashTableSnapshot
  if (typeof raw !== 'string') {
    return createEmpty()
  }
  return parseHashTableSnapshot(raw)
}

/** Re-export helpers useful to the visualization UI. */
export { indexForKey, hashKey, formatKey, formatValue }
