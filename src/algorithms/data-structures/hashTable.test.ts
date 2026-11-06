import { describe, expect, it } from 'vitest'
import {
  assertInvariants,
  bucketIndex,
  clear,
  cloneSnapshot,
  createEmpty,
  deleteKey,
  entries,
  formatBucket,
  get,
  has,
  hashKey,
  HashTableCapacityError,
  HashTableLoadFactorError,
  indexForKey,
  loadFactor,
  multiEntryBucketCount,
  occupiedBucketCount,
  rehash,
  set,
  size,
  snapshotFromEntries,
  HASH_TABLE_DEFAULT_CAPACITY,
} from './hashTable'
import {
  buildHashTableSteps,
  parseHashTableSnapshot,
  serializeHashTableSnapshot,
  snapshotFromFinalStep,
} from './hashTableSteps'

describe('hash function', () => {
  it('is deterministic for the same key', () => {
    expect(hashKey('apple')).toBe(hashKey('apple'))
    expect(hashKey('')).toBe(0)
  })

  it('maps hash to a bucket index with modulo', () => {
    const hash = hashKey('apple')
    expect(bucketIndex(hash, 7)).toBe(hash % 7)
    expect(indexForKey('apple', 7)).toBe(hash % 7)
  })
})

describe('capacity and load-factor validation', () => {
  it('rejects invalid capacities', () => {
    expect(() => createEmpty(0)).toThrow(HashTableCapacityError)
    expect(() => createEmpty(-1)).toThrow(HashTableCapacityError)
    expect(() => createEmpty(1.5)).toThrow(HashTableCapacityError)
    expect(() => createEmpty(Number.NaN)).toThrow(HashTableCapacityError)
  })

  it('rejects invalid load-factor thresholds', () => {
    expect(() => createEmpty(7, 0)).toThrow(HashTableLoadFactorError)
    expect(() => createEmpty(7, 1.1)).toThrow(HashTableLoadFactorError)
    expect(() => createEmpty(7, Number.NaN)).toThrow(HashTableLoadFactorError)
  })
})

describe('empty table', () => {
  it('starts empty with the default capacity', () => {
    const table = createEmpty()
    expect(table.capacity).toBe(HASH_TABLE_DEFAULT_CAPACITY)
    expect(size(table)).toBe(0)
    expect(loadFactor(table)).toBe(0)
    expect(occupiedBucketCount(table)).toBe(0)
    expect(get(table, 'missing')).toBeUndefined()
    expect(has(table, 'missing')).toBe(false)
    assertInvariants(table)
  })
})

describe('set / get / has / update semantics', () => {
  it('inserts and retrieves values', () => {
    let table = createEmpty(7)
    table = set(table, 'apple', 10).snapshot
    table = set(table, 'banana', 20).snapshot
    expect(get(table, 'apple')).toBe(10)
    expect(get(table, 'banana')).toBe(20)
    expect(has(table, 'apple')).toBe(true)
    expect(size(table)).toBe(2)
    assertInvariants(table)
  })

  it('updates an existing key instead of duplicating', () => {
    let table = createEmpty(7)
    table = set(table, 'apple', 10).snapshot
    const updated = set(table, 'apple', 99)
    expect(updated.inserted).toBe(false)
    expect(get(updated.snapshot, 'apple')).toBe(99)
    expect(size(updated.snapshot)).toBe(1)
    expect(entries(updated.snapshot)).toEqual([{ key: 'apple', value: 99 }])
  })

  it('handles empty-string keys and falsy values', () => {
    let table = createEmpty(7)
    table = set(table, '', 0).snapshot
    table = set(table, 'flag', false).snapshot
    table = set(table, 'blank', '').snapshot
    expect(has(table, '')).toBe(true)
    expect(get(table, '')).toBe(0)
    expect(get(table, 'flag')).toBe(false)
    expect(get(table, 'blank')).toBe('')
    expect(size(table)).toBe(3)
  })

  it('does not mutate the previous snapshot', () => {
    const before = snapshotFromEntries([{ key: 'a', value: 1 }])
    set(before, 'b', 2)
    expect(entries(before)).toEqual([{ key: 'a', value: 1 }])
    expect(cloneSnapshot(before)).not.toBe(before)
  })
})

describe('delete', () => {
  it('removes an existing key', () => {
    let table = snapshotFromEntries([
      { key: 'a', value: 1 },
      { key: 'b', value: 2 },
    ])
    const result = deleteKey(table, 'a')
    expect(result.ok).toBe(true)
    expect(result.value).toBe(1)
    expect(has(result.snapshot, 'a')).toBe(false)
    expect(get(result.snapshot, 'b')).toBe(2)
    expect(size(result.snapshot)).toBe(1)
  })

  it('reports failure for a missing key', () => {
    const table = snapshotFromEntries([{ key: 'a', value: 1 }])
    const result = deleteKey(table, 'missing')
    expect(result.ok).toBe(false)
    expect(size(result.snapshot)).toBe(1)
    expect(has(result.snapshot, 'a')).toBe(true)
  })
})

describe('collisions and chaining', () => {
  it('stores multiple keys that share a bucket', () => {
    // Educational hash: apple and bird both map to bucket 1 when capacity is 7.
    let table = createEmpty(7, 0.75)
    const first = set(table, 'apple', 1)
    table = first.snapshot
    const second = set(table, 'bird', 2)
    expect(second.collided).toBe(true)
    expect(second.index).toBe(indexForKey('apple', 7))
    table = second.snapshot
    const bucket = table.buckets[second.index]!
    expect(bucket).toHaveLength(2)
    expect(get(table, 'apple')).toBe(1)
    expect(get(table, 'bird')).toBe(2)
    expect(multiEntryBucketCount(table)).toBe(1)
    expect(table.collisionEvents).toBe(1)
    expect(formatBucket(bucket)).toContain('apple')
    assertInvariants(table)
  })

  it('distinguishes collision events from current multi-entry buckets', () => {
    // At capacity 7, apple / bird / c share bucket 1 (educational hash).
    let table = createEmpty(7, 0.75)
    table = set(table, 'apple', 1).snapshot
    table = set(table, 'bird', 2).snapshot
    table = set(table, 'c', 3).snapshot
    expect(indexForKey('apple', 7)).toBe(indexForKey('bird', 7))
    expect(indexForKey('apple', 7)).toBe(indexForKey('c', 7))
    expect(table.collisionEvents).toBe(2)
    expect(multiEntryBucketCount(table)).toBe(1)

    table = deleteKey(table, 'bird').snapshot
    table = deleteKey(table, 'c').snapshot
    expect(multiEntryBucketCount(table)).toBe(0)
    expect(table.collisionEvents).toBe(2)
  })
})

describe('load factor, resize, and rehash', () => {
  it('computes load factor as size / capacity', () => {
    let table = createEmpty(4, 1)
    table = set(table, 'a', 1).snapshot
    table = set(table, 'b', 2).snapshot
    expect(loadFactor(table)).toBe(0.5)
    expect(occupiedBucketCount(table)).toBeGreaterThan(0)
  })

  it('resizes and rehashes when the threshold would be exceeded', () => {
    let table = createEmpty(2, 0.5)
    table = set(table, 'a', 1).snapshot
    expect(table.capacity).toBe(2)
    const grown = set(table, 'b', 2)
    expect(grown.resized).toBe(true)
    expect(grown.snapshot.capacity).toBeGreaterThanOrEqual(4)
    expect(get(grown.snapshot, 'a')).toBe(1)
    expect(get(grown.snapshot, 'b')).toBe(2)
    assertInvariants(grown.snapshot)
  })

  it('rehash preserves entries and collision event totals', () => {
    let table = createEmpty(2, 1)
    table = set(table, 'x', 1).snapshot
    table = set(table, 'y', 2).snapshot
    const events = table.collisionEvents
    const next = rehash(table, 8)
    expect(next.capacity).toBe(8)
    expect(get(next, 'x')).toBe(1)
    expect(get(next, 'y')).toBe(2)
    expect(next.collisionEvents).toBe(events)
    assertInvariants(next)
  })

  it('handles a large insertion sequence', () => {
    let table = createEmpty(4, 0.75)
    for (let i = 0; i < 50; i += 1) {
      table = set(table, `k${i}`, i).snapshot
    }
    expect(size(table)).toBe(50)
    expect(get(table, 'k0')).toBe(0)
    expect(get(table, 'k49')).toBe(49)
    expect(loadFactor(table)).toBeLessThanOrEqual(0.75 + 1e-9)
    assertInvariants(table)
  })
})

describe('clear', () => {
  it('removes entries but keeps capacity settings', () => {
    let table = snapshotFromEntries(
      [
        { key: 'a', value: 1 },
        { key: 'b', value: 2 },
      ],
      7,
      0.6,
    )
    table = clear(table)
    expect(size(table)).toBe(0)
    expect(table.capacity).toBe(7)
    expect(table.loadFactorThreshold).toBe(0.6)
    expect(table.collisionEvents).toBe(0)
  })
})

describe('visualization steps', () => {
  it('keeps historical snapshots stable when scrubbing', () => {
    const initial = snapshotFromEntries([{ key: 'apple', value: 10 }], 7)
    const steps = buildHashTableSteps(initial, 'set', 'banana', 20)
    expect(steps.length).toBeGreaterThan(3)

    const firstRaw = steps[0]!.meta!.hashTableSnapshot as string
    const midRaw = steps[Math.floor(steps.length / 2)]!.meta!
      .hashTableSnapshot as string
    const last = snapshotFromFinalStep(steps)

    const first = parseHashTableSnapshot(firstRaw)
    const mid = parseHashTableSnapshot(midRaw)

    expect(size(first)).toBe(1)
    expect(get(first, 'apple')).toBe(10)
    expect(get(last, 'banana')).toBe(20)
    expect(serializeHashTableSnapshot(first)).toBe(firstRaw)
    expect(serializeHashTableSnapshot(mid)).toBe(midRaw)
  })

  it('shows not-found for get/delete/update of missing keys', () => {
    const table = createEmpty(7)
    const getSteps = buildHashTableSteps(table, 'get', 'missing')
    expect(getSteps.some((step) => step.meta?.result === 'not found')).toBe(
      true,
    )

    const deleteSteps = buildHashTableSteps(table, 'delete', 'missing')
    expect(
      deleteSteps.some((step) => step.meta?.result === 'not found'),
    ).toBe(true)

    const updateSteps = buildHashTableSteps(table, 'update', 'missing', 1)
    expect(
      updateSteps.some((step) => step.meta?.result === 'not found'),
    ).toBe(true)
  })

  it('reports stats without mutating the table', () => {
    const table = snapshotFromEntries([{ key: 'a', value: 1 }])
    const steps = buildHashTableSteps(table, 'stats')
    const final = snapshotFromFinalStep(steps)
    expect(size(final)).toBe(1)
    expect(steps.some((step) => step.meta?.phase === 'report-stats')).toBe(
      true,
    )
  })

  it('includes resize / rehash phases when load factor requires growth', () => {
    const table = createEmpty(2, 0.5)
    const withOne = set(table, 'a', 1).snapshot
    const steps = buildHashTableSteps(withOne, 'set', 'b', 2)
    expect(steps.some((step) => step.meta?.phase === 'resize')).toBe(true)
    expect(steps.some((step) => step.meta?.phase === 'rehash')).toBe(true)
    expect(snapshotFromFinalStep(steps).capacity).toBeGreaterThan(2)
  })
})
