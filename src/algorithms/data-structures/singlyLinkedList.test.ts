import { describe, expect, it } from 'vitest'
import {
  cloneSnapshot,
  deleteByValue,
  insertAtBeginning,
  insertAtEnd,
  listFromArray,
  listToArray,
  snapshotFromArray,
  snapshotToArray,
  traverse,
} from './singlyLinkedList'
import {
  buildSinglyLinkedListSteps,
  parseNodesSnapshot,
  serializeNodesSnapshot,
  valuesFromFinalStep,
} from './singlyLinkedListSteps'

describe('listFromArray / listToArray / traverse', () => {
  it('builds and walks a non-empty list', () => {
    const head = listFromArray([10, 20, 30])
    expect(listToArray(head)).toEqual([10, 20, 30])
    expect(traverse(head)).toEqual([10, 20, 30])
  })

  it('handles an empty list', () => {
    expect(listFromArray([])).toBeNull()
    expect(listToArray(null)).toEqual([])
    expect(traverse(null)).toEqual([])
  })

  it('handles a single node', () => {
    expect(listToArray(listFromArray([42]))).toEqual([42])
  })

  it('preserves duplicate values and correct next chain order', () => {
    expect(listToArray(listFromArray([2, 2, 3]))).toEqual([2, 2, 3])
  })
})

describe('insertAtBeginning', () => {
  it('inserts 5 before 10 → 20', () => {
    const head = listFromArray([10, 20])
    const next = insertAtBeginning(head, 5)
    expect(listToArray(next)).toEqual([5, 10, 20])
  })

  it('inserts into an empty list', () => {
    expect(listToArray(insertAtBeginning(null, 7))).toEqual([7])
  })

  it('does not mutate the previous head chain when inserting', () => {
    const head = listFromArray([10, 20])
    const before = listToArray(head)
    insertAtBeginning(head, 5)
    expect(listToArray(head)).toEqual(before)
  })
})

describe('insertAtEnd', () => {
  it('appends to a non-empty list', () => {
    const head = listFromArray([10, 20])
    expect(listToArray(insertAtEnd(head, 30))).toEqual([10, 20, 30])
  })

  it('appends to an empty list', () => {
    expect(listToArray(insertAtEnd(null, 1))).toEqual([1])
  })

  it('does not mutate the input list', () => {
    const head = listFromArray([10, 20])
    const before = listToArray(head)
    insertAtEnd(head, 30)
    expect(listToArray(head)).toEqual(before)
  })
})

describe('deleteByValue', () => {
  it('deletes the head', () => {
    const { head, deleted } = deleteByValue(listFromArray([10, 20, 30]), 10)
    expect(deleted).toBe(true)
    expect(listToArray(head)).toEqual([20, 30])
  })

  it('deletes a middle node', () => {
    const { head, deleted } = deleteByValue(listFromArray([10, 20, 30]), 20)
    expect(deleted).toBe(true)
    expect(listToArray(head)).toEqual([10, 30])
  })

  it('deletes the last node', () => {
    const { head, deleted } = deleteByValue(listFromArray([10, 20, 30]), 30)
    expect(deleted).toBe(true)
    expect(listToArray(head)).toEqual([10, 20])
  })

  it('deletes the only node', () => {
    const { head, deleted } = deleteByValue(listFromArray([42]), 42)
    expect(deleted).toBe(true)
    expect(head).toBeNull()
  })

  it('leaves the list unchanged when the value is missing', () => {
    const original = listFromArray([10, 20, 30])
    const { head, deleted } = deleteByValue(original, 99)
    expect(deleted).toBe(false)
    expect(listToArray(head)).toEqual([10, 20, 30])
  })

  it('deletes only the first duplicate match', () => {
    const { head, deleted } = deleteByValue(listFromArray([2, 2, 3]), 2)
    expect(deleted).toBe(true)
    expect(listToArray(head)).toEqual([2, 3])
  })

  it('handles delete on an empty list', () => {
    const { head, deleted } = deleteByValue(null, 1)
    expect(deleted).toBe(false)
    expect(head).toBeNull()
  })
})

describe('snapshots', () => {
  it('round-trips values and keeps next references', () => {
    const snapshot = snapshotFromArray([10, 20, 30])
    expect(snapshot.headId).toBe('n0')
    expect(snapshot.nodes).toEqual([
      { id: 'n0', value: 10, nextId: 'n1' },
      { id: 'n1', value: 20, nextId: 'n2' },
      { id: 'n2', value: 30, nextId: null },
    ])
    expect(snapshotToArray(snapshot)).toEqual([10, 20, 30])
  })

  it('clones snapshots so later edits do not rewrite history', () => {
    const original = snapshotFromArray([1, 2])
    const copy = cloneSnapshot(original)
    const mutated = {
      ...copy,
      nodes: copy.nodes.map((node, index) =>
        index === 0 ? { ...node, value: 99 } : node,
      ),
    }
    expect(snapshotToArray(original)).toEqual([1, 2])
    expect(snapshotToArray(mutated)).toEqual([99, 2])
  })
})

describe('buildSinglyLinkedListSteps', () => {
  it('traverses empty and non-empty lists', () => {
    const empty = buildSinglyLinkedListSteps([], 'traverse')
    expect(empty.length).toBeGreaterThan(0)
    expect(empty[empty.length - 1]?.meta?.phase).toBe('complete')
    expect(valuesFromFinalStep(empty)).toEqual([])

    const steps = buildSinglyLinkedListSteps([10, 20, 30], 'traverse')
    expect(steps.some((step) => step.meta?.phase === 'visit')).toBe(true)
    expect(valuesFromFinalStep(steps)).toEqual([10, 20, 30])
  })

  it('inserts at the beginning to match the pure API', () => {
    const steps = buildSinglyLinkedListSteps([10, 20], 'insert-beginning', 5)
    expect(valuesFromFinalStep(steps)).toEqual(
      listToArray(insertAtBeginning(listFromArray([10, 20]), 5)),
    )
    expect(steps[steps.length - 1]?.meta?.success).toBe(true)
  })

  it('inserts at the end to match the pure API', () => {
    const steps = buildSinglyLinkedListSteps([10, 20], 'insert-end', 30)
    expect(valuesFromFinalStep(steps)).toEqual(
      listToArray(insertAtEnd(listFromArray([10, 20]), 30)),
    )
  })

  it('deletes head, middle, last, only, missing, and duplicates', () => {
    expect(
      valuesFromFinalStep(
        buildSinglyLinkedListSteps([10, 20, 30], 'delete-by-value', 10),
      ),
    ).toEqual([20, 30])

    expect(
      valuesFromFinalStep(
        buildSinglyLinkedListSteps([10, 20, 30], 'delete-by-value', 20),
      ),
    ).toEqual([10, 30])

    expect(
      valuesFromFinalStep(
        buildSinglyLinkedListSteps([10, 20, 30], 'delete-by-value', 30),
      ),
    ).toEqual([10, 20])

    expect(
      valuesFromFinalStep(
        buildSinglyLinkedListSteps([42], 'delete-by-value', 42),
      ),
    ).toEqual([])

    const missing = buildSinglyLinkedListSteps(
      [10, 20],
      'delete-by-value',
      99,
    )
    expect(valuesFromFinalStep(missing)).toEqual([10, 20])
    expect(missing[missing.length - 1]?.meta?.success).toBe(false)

    expect(
      valuesFromFinalStep(
        buildSinglyLinkedListSteps([2, 2, 3], 'delete-by-value', 2),
      ),
    ).toEqual([2, 3])
  })

  it('keeps historical snapshots stable when later frames change', () => {
    const steps = buildSinglyLinkedListSteps([10, 20], 'insert-beginning', 5)
    expect(steps.length).toBeGreaterThan(2)

    const firstRaw = steps[0]?.meta?.nodesSnapshot
    expect(typeof firstRaw).toBe('string')
    const firstSnapshot = parseNodesSnapshot(firstRaw as string)
    expect(snapshotToArray(firstSnapshot)).toEqual([10, 20])

    const lastRaw = steps[steps.length - 1]?.meta?.nodesSnapshot
    const lastSnapshot = parseNodesSnapshot(lastRaw as string)
    expect(snapshotToArray(lastSnapshot)).toEqual([5, 10, 20])

    // Editing a parsed last snapshot must not rewrite the first step's JSON.
    const edited = {
      ...lastSnapshot,
      nodes: lastSnapshot.nodes.map((node, index) =>
        index === 0 ? { ...node, value: 999 } : { ...node },
      ),
    }
    expect(serializeNodesSnapshot(edited)).not.toEqual(firstRaw)
    expect(parseNodesSnapshot(firstRaw as string)).toEqual(firstSnapshot)
  })

  it('supports previous/next/reset style scrubbing via independent frames', () => {
    const steps = buildSinglyLinkedListSteps([10, 20], 'insert-beginning', 5)
    expect(steps.length).toBeGreaterThan(3)

    const first = steps[0]!
    const mid = steps[Math.floor(steps.length / 2)]!
    const last = steps[steps.length - 1]!

    expect(snapshotToArray(parseNodesSnapshot(first.meta?.nodesSnapshot as string))).toEqual([
      10, 20,
    ])
    expect(snapshotToArray(parseNodesSnapshot(last.meta?.nodesSnapshot as string))).toEqual([
      5, 10, 20,
    ])
    expect(last.operation).toBe('complete')

    // Scrubbing back to an earlier frame must still show the original list.
    expect(snapshotToArray(parseNodesSnapshot(mid.meta?.nodesSnapshot as string))).not.toEqual(
      snapshotToArray(parseNodesSnapshot(last.meta?.nodesSnapshot as string)),
    )
    expect(first.meta?.nodesSnapshot).not.toEqual(last.meta?.nodesSnapshot)
  })

  it('handles invalid operands without changing the list', () => {
    const steps = buildSinglyLinkedListSteps([10, 20], 'insert-beginning')
    expect(valuesFromFinalStep(steps)).toEqual([10, 20])
    expect(steps[0]?.meta?.phase).toBe('invalid')
    expect(steps[steps.length - 1]?.meta?.success).toBe(false)

    const deleteEmpty = buildSinglyLinkedListSteps([], 'delete-by-value', 1)
    expect(valuesFromFinalStep(deleteEmpty)).toEqual([])
    expect(deleteEmpty[deleteEmpty.length - 1]?.meta?.success).toBe(false)
  })
})
