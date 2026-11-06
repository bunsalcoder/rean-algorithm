/**
 * Hash Table — separate-chaining key–value store.
 *
 * Educational polynomial rolling hash maps string keys to bucket indices:
 *
 *   hash = (hash * 31 + charCode) >>> 0
 *   index = hash % capacity
 *
 * Collisions share a bucket (an array of entries). set() updates an existing
 * key instead of inserting a duplicate. When size / capacity exceeds the
 * load-factor threshold, capacity doubles and all entries are rehashed.
 *
 * This hash is deterministic for reproducible examples and tests — not a
 * production-grade universal hashing solution.
 *
 * All helpers return new snapshots so historical visualization frames stay
 * immutable. Independent of React.
 */

/** Supported educational value types (includes 0, false, and ""). */
export type HashTableValue = string | number | boolean

/** One key–value pair stored in a bucket chain. */
export type HashTableEntry = {
  readonly key: string
  readonly value: HashTableValue
}

/** Immutable snapshot of a separate-chaining hash table. */
export type HashTableSnapshot = {
  /** Bucket array; each bucket is a chain of entries (possibly empty). */
  readonly buckets: readonly (readonly HashTableEntry[])[]
  /** Number of buckets (`buckets.length`). */
  readonly capacity: number
  /** Number of stored key–value pairs. */
  readonly size: number
  /**
   * Resize when `size / capacity` would exceed this after an insert
   * that adds a new key (default 0.75).
   */
  readonly loadFactorThreshold: number
  /**
   * Cumulative count of insert-time collision events: each time set()
   * places a *new* key into a bucket that already held at least one entry.
   * Distinct from “buckets that currently contain multiple entries.”
   */
  readonly collisionEvents: number
}

export const HASH_TABLE_DEFAULT_CAPACITY = 7

export const HASH_TABLE_MIN_CAPACITY = 1

export const HASH_TABLE_DEFAULT_LOAD_FACTOR_THRESHOLD = 0.75

/** Default playground seed: intentionally includes a collision pair. */
export const HASH_TABLE_DEFAULT_ENTRIES: readonly HashTableEntry[] = [
  { key: 'apple', value: 10 },
  { key: 'banana', value: 20 },
  { key: 'grape', value: 30 },
  { key: 'orange', value: 40 },
] as const

export const HASH_TABLE_ALT_ENTRIES: readonly HashTableEntry[] = [
  { key: 'cat', value: 1 },
  { key: 'dog', value: 2 },
  { key: 'bird', value: 3 },
] as const

export const HASH_TABLE_SINGLE_ENTRY: readonly HashTableEntry[] = [
  { key: 'solo', value: 42 },
] as const

export const HASH_TABLE_ENTRY_PRESETS = [
  {
    id: 'lesson-default',
    label: 'Lesson table',
    entries: HASH_TABLE_DEFAULT_ENTRIES,
  },
  {
    id: 'three-pets',
    label: 'cat · dog · bird',
    entries: HASH_TABLE_ALT_ENTRIES,
  },
  {
    id: 'single',
    label: 'Single entry',
    entries: HASH_TABLE_SINGLE_ENTRY,
  },
  {
    id: 'empty',
    label: 'Empty table',
    entries: [] as const,
  },
] as const

export class HashTableCapacityError extends Error {
  constructor(capacity: number) {
    super(
      `Hash table capacity must be a positive integer (got ${String(capacity)})`,
    )
    this.name = 'HashTableCapacityError'
  }
}

export class HashTableLoadFactorError extends Error {
  constructor(threshold: number) {
    super(
      `Hash table load-factor threshold must be a finite number in (0, 1] (got ${String(threshold)})`,
    )
    this.name = 'HashTableLoadFactorError'
  }
}

function assertValidCapacity(capacity: number): number {
  if (
    !Number.isFinite(capacity) ||
    !Number.isInteger(capacity) ||
    capacity < HASH_TABLE_MIN_CAPACITY
  ) {
    throw new HashTableCapacityError(capacity)
  }
  return capacity
}

function assertValidLoadFactorThreshold(threshold: number): number {
  if (
    !Number.isFinite(threshold) ||
    threshold <= 0 ||
    threshold > 1
  ) {
    throw new HashTableLoadFactorError(threshold)
  }
  return threshold
}

function emptyBuckets(capacity: number): HashTableEntry[][] {
  return Array.from({ length: capacity }, () => [])
}

/**
 * Educational polynomial rolling hash for string keys.
 * Uses unsigned 32-bit arithmetic (`>>> 0`) for stable, reproducible values.
 */
export function hashKey(key: string): number {
  let hash = 0
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  }
  return hash
}

/** Map an unsigned hash onto a bucket index for the given capacity. */
export function bucketIndex(hash: number, capacity: number): number {
  const k = assertValidCapacity(capacity)
  return hash % k
}

/** Hash a key and reduce it to a bucket index. */
export function indexForKey(key: string, capacity: number): number {
  return bucketIndex(hashKey(key), capacity)
}

/** Build an empty hash table. */
export function createEmpty(
  capacity: number = HASH_TABLE_DEFAULT_CAPACITY,
  loadFactorThreshold: number = HASH_TABLE_DEFAULT_LOAD_FACTOR_THRESHOLD,
): HashTableSnapshot {
  const k = assertValidCapacity(capacity)
  const threshold = assertValidLoadFactorThreshold(loadFactorThreshold)
  return {
    buckets: emptyBuckets(k),
    capacity: k,
    size: 0,
    loadFactorThreshold: threshold,
    collisionEvents: 0,
  }
}

/** Deep-clone so later frames cannot rewrite history. */
export function cloneSnapshot(snapshot: HashTableSnapshot): HashTableSnapshot {
  return {
    buckets: snapshot.buckets.map((bucket) =>
      bucket.map((entry) => ({ key: entry.key, value: entry.value })),
    ),
    capacity: snapshot.capacity,
    size: snapshot.size,
    loadFactorThreshold: snapshot.loadFactorThreshold,
    collisionEvents: snapshot.collisionEvents,
  }
}

/** Build a snapshot from an ordered list of entries (last write wins). */
export function snapshotFromEntries(
  entries: readonly HashTableEntry[],
  capacity: number = HASH_TABLE_DEFAULT_CAPACITY,
  loadFactorThreshold: number = HASH_TABLE_DEFAULT_LOAD_FACTOR_THRESHOLD,
): HashTableSnapshot {
  let snapshot = createEmpty(capacity, loadFactorThreshold)
  for (const entry of entries) {
    snapshot = set(snapshot, entry.key, entry.value).snapshot
  }
  return snapshot
}

/** Current load factor: size / capacity (0 when capacity is positive empty). */
export function loadFactor(snapshot: HashTableSnapshot): number {
  if (snapshot.capacity <= 0) {
    return 0
  }
  return snapshot.size / snapshot.capacity
}

export function capacity(snapshot: HashTableSnapshot): number {
  return snapshot.capacity
}

export function size(snapshot: HashTableSnapshot): number {
  return snapshot.size
}

export function isEmpty(snapshot: HashTableSnapshot): boolean {
  return snapshot.size === 0
}

/** Number of buckets that currently hold at least one entry. */
export function occupiedBucketCount(snapshot: HashTableSnapshot): number {
  let count = 0
  for (const bucket of snapshot.buckets) {
    if (bucket.length > 0) {
      count += 1
    }
  }
  return count
}

/**
 * Number of buckets that currently hold two or more entries
 * (active multi-entry chains — not the same as collisionEvents).
 */
export function multiEntryBucketCount(snapshot: HashTableSnapshot): number {
  let count = 0
  for (const bucket of snapshot.buckets) {
    if (bucket.length > 1) {
      count += 1
    }
  }
  return count
}

/** Flat list of entries in bucket order (stable for a given snapshot). */
export function entries(snapshot: HashTableSnapshot): HashTableEntry[] {
  const result: HashTableEntry[] = []
  for (const bucket of snapshot.buckets) {
    for (const entry of bucket) {
      result.push({ key: entry.key, value: entry.value })
    }
  }
  return result
}

/** Look up a key. Missing → undefined (distinguish from stored undefined — we do not store undefined). */
export function get(
  snapshot: HashTableSnapshot,
  key: string,
): HashTableValue | undefined {
  const index = indexForKey(key, snapshot.capacity)
  const bucket = snapshot.buckets[index] ?? []
  for (const entry of bucket) {
    if (entry.key === key) {
      return entry.value
    }
  }
  return undefined
}

/** True when the key exists (works for values 0, false, and ""). */
export function has(snapshot: HashTableSnapshot, key: string): boolean {
  const index = indexForKey(key, snapshot.capacity)
  const bucket = snapshot.buckets[index] ?? []
  for (const entry of bucket) {
    if (entry.key === key) {
      return true
    }
  }
  return false
}

export type HashTableSetResult = {
  snapshot: HashTableSnapshot
  /** True when a brand-new key was inserted; false when an existing key was updated. */
  inserted: boolean
  /** True when this insert collided into a non-empty bucket. */
  collided: boolean
  /** Bucket index written. */
  index: number
  /** Unsigned hash of the key. */
  hash: number
  /** True when capacity grew and entries were rehashed. */
  resized: boolean
  /** Chain index within the bucket after the write. */
  entryIndex: number
}

/**
 * Rehash all entries into a larger table (typically 2× capacity).
 * Preserves collisionEvents and loadFactorThreshold — rebuild inserts do
 * not count as new collision events.
 */
export function rehash(
  snapshot: HashTableSnapshot,
  newCapacity: number,
): HashTableSnapshot {
  const k = assertValidCapacity(newCapacity)
  const next = createEmpty(k, snapshot.loadFactorThreshold)

  let current = next
  for (const entry of entries(snapshot)) {
    // Bypass resize recursion — we already chose the target capacity.
    current = setWithoutResize(current, entry.key, entry.value).snapshot
  }
  return {
    ...current,
    collisionEvents: snapshot.collisionEvents,
  }
}

function setWithoutResize(
  snapshot: HashTableSnapshot,
  key: string,
  value: HashTableValue,
): HashTableSetResult {
  const hash = hashKey(key)
  const index = bucketIndex(hash, snapshot.capacity)
  const buckets = snapshot.buckets.map((bucket) =>
    bucket.map((entry) => ({ key: entry.key, value: entry.value })),
  )
  const bucket = buckets[index]!
  const existingIndex = bucket.findIndex((entry) => entry.key === key)

  if (existingIndex >= 0) {
    bucket[existingIndex] = { key, value }
    return {
      snapshot: {
        buckets,
        capacity: snapshot.capacity,
        size: snapshot.size,
        loadFactorThreshold: snapshot.loadFactorThreshold,
        collisionEvents: snapshot.collisionEvents,
      },
      inserted: false,
      collided: false,
      index,
      hash,
      resized: false,
      entryIndex: existingIndex,
    }
  }

  const collided = bucket.length > 0
  bucket.push({ key, value })

  return {
    snapshot: {
      buckets,
      capacity: snapshot.capacity,
      size: snapshot.size + 1,
      loadFactorThreshold: snapshot.loadFactorThreshold,
      collisionEvents: snapshot.collisionEvents + (collided ? 1 : 0),
    },
    inserted: true,
    collided,
    index,
    hash,
    resized: false,
    entryIndex: bucket.length - 1,
  }
}

/**
 * Insert or update a key–value pair.
 * Average O(1); worst O(n). Resize is O(n) when it runs; inserts stay
 * amortized O(1) under the doubling policy.
 */
export function set(
  snapshot: HashTableSnapshot,
  key: string,
  value: HashTableValue,
): HashTableSetResult {
  const hash = hashKey(key)
  const provisionalIndex = bucketIndex(hash, snapshot.capacity)
  const provisionalBucket = snapshot.buckets[provisionalIndex] ?? []
  const alreadyExists = provisionalBucket.some((entry) => entry.key === key)

  let working = snapshot
  let resized = false

  if (!alreadyExists) {
    while (
      (working.size + 1) / working.capacity >
      working.loadFactorThreshold
    ) {
      working = rehash(working, working.capacity * 2)
      resized = true
    }
  }

  const result = setWithoutResize(working, key, value)
  return {
    ...result,
    resized: resized || result.resized,
  }
}

export type HashTableDeleteResult = {
  snapshot: HashTableSnapshot
  ok: boolean
  /** Removed value when ok. */
  value?: HashTableValue
  index: number
  hash: number
  entryIndex: number
}

/**
 * Remove a key if present.
 * Missing key → ok false; snapshot unchanged aside from cloning.
 */
export function deleteKey(
  snapshot: HashTableSnapshot,
  key: string,
): HashTableDeleteResult {
  const hash = hashKey(key)
  const index = bucketIndex(hash, snapshot.capacity)
  const bucket = snapshot.buckets[index] ?? []
  const entryIndex = bucket.findIndex((entry) => entry.key === key)

  if (entryIndex < 0) {
    return {
      snapshot: cloneSnapshot(snapshot),
      ok: false,
      index,
      hash,
      entryIndex: -1,
    }
  }

  const value = bucket[entryIndex]!.value
  const buckets = snapshot.buckets.map((chain, bucketIdx) => {
    if (bucketIdx !== index) {
      return chain.map((entry) => ({ key: entry.key, value: entry.value }))
    }
    return chain
      .filter((_, i) => i !== entryIndex)
      .map((entry) => ({ key: entry.key, value: entry.value }))
  })

  return {
    snapshot: {
      buckets,
      capacity: snapshot.capacity,
      size: snapshot.size - 1,
      loadFactorThreshold: snapshot.loadFactorThreshold,
      collisionEvents: snapshot.collisionEvents,
    },
    ok: true,
    value,
    index,
    hash,
    entryIndex,
  }
}

/** Clear all entries; capacity and threshold are preserved. */
export function clear(snapshot: HashTableSnapshot): HashTableSnapshot {
  return {
    buckets: emptyBuckets(snapshot.capacity),
    capacity: snapshot.capacity,
    size: 0,
    loadFactorThreshold: snapshot.loadFactorThreshold,
    collisionEvents: 0,
  }
}

/** Format a value for status / explanation text. */
export function formatValue(value: HashTableValue): string {
  if (typeof value === 'string') {
    return JSON.stringify(value)
  }
  return String(value)
}

/** Format a key for status text (shows empty string clearly). */
export function formatKey(key: string): string {
  return JSON.stringify(key)
}

/** Format one entry as `"key": value`. */
export function formatEntry(entry: HashTableEntry): string {
  return `${formatKey(entry.key)}: ${formatValue(entry.value)}`
}

/** Format a bucket chain for status text. */
export function formatBucket(bucket: readonly HashTableEntry[]): string {
  if (bucket.length === 0) {
    return '[empty]'
  }
  return bucket.map((entry) => `[${formatEntry(entry)}]`).join(' → ')
}

/** Format the whole table as a compact index / bucket listing. */
export function formatTable(snapshot: HashTableSnapshot): string {
  return snapshot.buckets
    .map((bucket, index) => `${index}: ${formatBucket(bucket)}`)
    .join(' | ')
}

/** Check core invariants used by tests and the step generator. */
export function assertInvariants(snapshot: HashTableSnapshot): void {
  const { buckets, capacity: k, size: live, loadFactorThreshold } = snapshot
  if (k <= 0 || buckets.length !== k) {
    throw new Error('capacity / buckets length mismatch')
  }
  if (live < 0) {
    throw new Error('size must be non-negative')
  }
  if (loadFactorThreshold <= 0 || loadFactorThreshold > 1) {
    throw new Error('invalid load-factor threshold')
  }

  let counted = 0
  const seen = new Set<string>()
  for (let i = 0; i < buckets.length; i += 1) {
    const bucket = buckets[i]!
    for (const entry of bucket) {
      if (seen.has(entry.key)) {
        throw new Error(`duplicate key ${formatKey(entry.key)}`)
      }
      seen.add(entry.key)
      if (indexForKey(entry.key, k) !== i) {
        throw new Error(
          `key ${formatKey(entry.key)} is in bucket ${i} but hashes to ${indexForKey(entry.key, k)}`,
        )
      }
      counted += 1
    }
  }
  if (counted !== live) {
    throw new Error('entry count does not match size')
  }
}
