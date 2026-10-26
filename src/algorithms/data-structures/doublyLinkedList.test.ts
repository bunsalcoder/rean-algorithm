import { describe, expect, it } from 'vitest'
import {
  cloneSnapshot,
  deleteByValue,
  insertAfter,
  insertAtBeginning,
  insertAtEnd,
  insertBefore,
  isBidirectionallyConsistent,
  isSnapshotConsistent,
  listFromArray,
  listToArray,
  listToArrayReverse,
  snapshotFromArray,
  snapshotToArray,
  snapshotToArrayReverse,
  traverseBackward,
  traverseForward,
} from './doublyLinkedList'
import {
  buildDoublyLinkedListSteps,
  parseNodesSnapshot,
  serializeNodesSnapshot,
  valuesFromFinalStep,
} from './doublyLinkedListSteps'

describe('listFromArray / listToArray / traverse', () => {
  it('builds and walks a non-empty list both directions', () => {
    const list = listFromArray([10, 20, 30])
    expect(listToArray(list)).toEqual([10, 20, 30])
    expect(listToArrayReverse(list)).toEqual([30, 20, 10])
    expect(traverseForward(list)).toEqual([10, 20, 30])
    expect(traverseBackward(list)).toEqual([30, 20, 10])
    expect(isBidirectionallyConsistent(list)).toBe(true)
    expect(list.head?.prev).toBeNull()
    expect(list.tail?.next).toBeNull()
  })

  it('handles an empty list', () => {
    const list = listFromArray([])
    expect(list.head).toBeNull()
    expect(list.tail).toBeNull()
    expect(listToArray(list)).toEqual([])
    expect(listToArrayReverse(list)).toEqual([])
    expect(isBidirectionallyConsistent(list)).toBe(true)
  })

  it('handles a single node', () => {
    const list = listFromArray([42])
    expect(list.head).toBe(list.tail)
    expect(list.head?.prev).toBeNull()
    expect(list.head?.next).toBeNull()
    expect(listToArray(list)).toEqual([42])
    expect(listToArrayReverse(list)).toEqual([42])
  })

  it('preserves duplicate values and bidirectional links', () => {
    const list = listFromArray([2, 2, 3])
    expect(listToArray(list)).toEqual([2, 2, 3])
    expect(isBidirectionallyConsistent(list)).toBe(true)
  })
})

describe('insertAtBeginning / insertAtEnd', () => {
  it('inserts at the beginning', () => {
    const next = insertAtBeginning(listFromArray([10, 20]), 5)
    expect(listToArray(next)).toEqual([5, 10, 20])
    expect(isBidirectionallyConsistent(next)).toBe(true)
    expect(next.head?.value).toBe(5)
    expect(next.tail?.value).toBe(20)
  })

  it('inserts into an empty list at beginning', () => {
    const next = insertAtBeginning(listFromArray([]), 7)
    expect(listToArray(next)).toEqual([7])
    expect(next.head).toBe(next.tail)
  })

  it('appends at the end in O(1) with tail', () => {
    const next = insertAtEnd(listFromArray([10, 20]), 30)
    expect(listToArray(next)).toEqual([10, 20, 30])
    expect(next.tail?.value).toBe(30)
    expect(isBidirectionallyConsistent(next)).toBe(true)
  })

  it('appends to an empty list', () => {
    const next = insertAtEnd(listFromArray([]), 1)
    expect(listToArray(next)).toEqual([1])
    expect(next.head).toBe(next.tail)
  })

  it('does not mutate the input list', () => {
    const list = listFromArray([10, 20])
    const before = listToArray(list)
    insertAtBeginning(list, 5)
    insertAtEnd(list, 30)
    expect(listToArray(list)).toEqual(before)
  })
})

describe('insertBefore / insertAfter', () => {
  it('inserts before a middle value', () => {
    const { list, inserted } = insertBefore(listFromArray([10, 20, 30]), 20, 15)
    expect(inserted).toBe(true)
    expect(listToArray(list)).toEqual([10, 15, 20, 30])
    expect(isBidirectionallyConsistent(list)).toBe(true)
  })

  it('inserts before head', () => {
    const { list, inserted } = insertBefore(listFromArray([10, 20]), 10, 5)
    expect(inserted).toBe(true)
    expect(listToArray(list)).toEqual([5, 10, 20])
    expect(list.head?.value).toBe(5)
  })

  it('inserts after a middle value', () => {
    const { list, inserted } = insertAfter(listFromArray([10, 20, 30]), 10, 15)
    expect(inserted).toBe(true)
    expect(listToArray(list)).toEqual([10, 15, 20, 30])
    expect(isBidirectionallyConsistent(list)).toBe(true)
  })

  it('inserts after tail', () => {
    const { list, inserted } = insertAfter(listFromArray([10, 20]), 20, 30)
    expect(inserted).toBe(true)
    expect(listToArray(list)).toEqual([10, 20, 30])
    expect(list.tail?.value).toBe(30)
  })

  it('leaves the list unchanged when the target is missing', () => {
    const original = listFromArray([10, 20])
    const before = insertBefore(original, 99, 1)
    const after = insertAfter(original, 99, 1)
    expect(before.inserted).toBe(false)
    expect(after.inserted).toBe(false)
    expect(listToArray(before.list)).toEqual([10, 20])
    expect(listToArray(after.list)).toEqual([10, 20])
  })

  it('uses the first duplicate as the target', () => {
    const { list } = insertAfter(listFromArray([2, 2, 3]), 2, 9)
    expect(listToArray(list)).toEqual([2, 9, 2, 3])
  })
})

describe('deleteByValue', () => {
  it('deletes the head', () => {
    const { list, deleted } = deleteByValue(listFromArray([10, 20, 30]), 10)
    expect(deleted).toBe(true)
    expect(listToArray(list)).toEqual([20, 30])
    expect(list.head?.prev).toBeNull()
    expect(isBidirectionallyConsistent(list)).toBe(true)
  })

  it('deletes a middle node', () => {
    const { list, deleted } = deleteByValue(listFromArray([10, 20, 30]), 20)
    expect(deleted).toBe(true)
    expect(listToArray(list)).toEqual([10, 30])
    expect(isBidirectionallyConsistent(list)).toBe(true)
  })

  it('deletes the tail', () => {
    const { list, deleted } = deleteByValue(listFromArray([10, 20, 30]), 30)
    expect(deleted).toBe(true)
    expect(listToArray(list)).toEqual([10, 20])
    expect(list.tail?.next).toBeNull()
    expect(isBidirectionallyConsistent(list)).toBe(true)
  })

  it('deletes the only node', () => {
    const { list, deleted } = deleteByValue(listFromArray([42]), 42)
    expect(deleted).toBe(true)
    expect(list.head).toBeNull()
    expect(list.tail).toBeNull()
  })

  it('leaves the list unchanged when the value is missing', () => {
    const original = listFromArray([10, 20, 30])
    const { list, deleted } = deleteByValue(original, 99)
    expect(deleted).toBe(false)
    expect(listToArray(list)).toEqual([10, 20, 30])
  })

  it('deletes only the first duplicate match', () => {
    const { list, deleted } = deleteByValue(listFromArray([2, 2, 3]), 2)
    expect(deleted).toBe(true)
    expect(listToArray(list)).toEqual([2, 3])
  })

  it('handles delete on an empty list', () => {
    const { list, deleted } = deleteByValue(listFromArray([]), 1)
    expect(deleted).toBe(false)
    expect(list.head).toBeNull()
    expect(list.tail).toBeNull()
  })
})

describe('snapshots', () => {
  it('round-trips values with prev and next ids', () => {
    const snapshot = snapshotFromArray([10, 20, 30])
    expect(snapshot.headId).toBe('n0')
    expect(snapshot.tailId).toBe('n2')
    expect(snapshot.nodes).toEqual([
      { id: 'n0', value: 10, prevId: null, nextId: 'n1' },
      { id: 'n1', value: 20, prevId: 'n0', nextId: 'n2' },
      { id: 'n2', value: 30, prevId: 'n1', nextId: null },
    ])
    expect(snapshotToArray(snapshot)).toEqual([10, 20, 30])
    expect(snapshotToArrayReverse(snapshot)).toEqual([30, 20, 10])
    expect(isSnapshotConsistent(snapshot)).toBe(true)
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

describe('buildDoublyLinkedListSteps', () => {
  it('forward traversal visits every node', () => {
    const steps = buildDoublyLinkedListSteps([10, 20, 30], 'traverse-forward')
    expect(valuesFromFinalStep(steps)).toEqual([10, 20, 30])
    expect(steps[steps.length - 1]?.meta?.success).toBe(true)
  })

  it('backward traversal keeps the list unchanged', () => {
    const steps = buildDoublyLinkedListSteps([10, 20, 30], 'traverse-backward')
    expect(valuesFromFinalStep(steps)).toEqual([10, 20, 30])
    expect(steps.some((step) => step.meta?.phase === 'visit')).toBe(true)
  })

  it('insert at beginning matches the pure API', () => {
    const steps = buildDoublyLinkedListSteps(
      [10, 20],
      'insert-beginning',
      5,
    )
    expect(valuesFromFinalStep(steps)).toEqual(
      listToArray(insertAtBeginning(listFromArray([10, 20]), 5)),
    )
    const finalSnap = parseNodesSnapshot(
      String(steps[steps.length - 1]?.meta?.nodesSnapshot),
    )
    expect(isSnapshotConsistent(finalSnap)).toBe(true)
  })

  it('insert at end matches the pure API', () => {
    const steps = buildDoublyLinkedListSteps([10, 20], 'insert-end', 30)
    expect(valuesFromFinalStep(steps)).toEqual([10, 20, 30])
  })

  it('insert before updates four references between neighbors', () => {
    const steps = buildDoublyLinkedListSteps(
      [10, 20, 30],
      'insert-before',
      15,
      20,
    )
    expect(valuesFromFinalStep(steps)).toEqual([10, 15, 20, 30])
    const link = steps.find((step) => step.meta?.phase === 'link')
    expect(link?.explanation).toMatch(/10\.next = 15/)
    expect(link?.explanation).toMatch(/15\.prev = 10/)
    expect(link?.explanation).toMatch(/15\.next = 20/)
    expect(link?.explanation).toMatch(/20\.prev = 15/)
  })

  it('insert after a known node', () => {
    const steps = buildDoublyLinkedListSteps(
      [10, 20, 30],
      'insert-after',
      15,
      10,
    )
    expect(valuesFromFinalStep(steps)).toEqual([10, 15, 20, 30])
  })

  it('delete head, middle, and tail', () => {
    expect(
      valuesFromFinalStep(
        buildDoublyLinkedListSteps([10, 20, 30], 'delete-by-value', 10),
      ),
    ).toEqual([20, 30])
    expect(
      valuesFromFinalStep(
        buildDoublyLinkedListSteps([10, 20, 30], 'delete-by-value', 20),
      ),
    ).toEqual([10, 30])
    expect(
      valuesFromFinalStep(
        buildDoublyLinkedListSteps([10, 20, 30], 'delete-by-value', 30),
      ),
    ).toEqual([10, 20])
  })

  it('deletes the only node to an empty list', () => {
    const steps = buildDoublyLinkedListSteps([42], 'delete-by-value', 42)
    expect(valuesFromFinalStep(steps)).toEqual([])
    const finalSnap = parseNodesSnapshot(
      String(steps[steps.length - 1]?.meta?.nodesSnapshot),
    )
    expect(finalSnap.headId).toBeNull()
    expect(finalSnap.tailId).toBeNull()
  })

  it('marks missing deletes and invalid operands as unsuccessful', () => {
    const missing = buildDoublyLinkedListSteps(
      [10, 20],
      'delete-by-value',
      99,
    )
    expect(missing[missing.length - 1]?.meta?.success).toBe(false)
    expect(valuesFromFinalStep(missing)).toEqual([10, 20])

    const invalid = buildDoublyLinkedListSteps([10], 'insert-beginning')
    expect(invalid[invalid.length - 1]?.meta?.success).toBe(false)
    expect(valuesFromFinalStep(invalid)).toEqual([10])

    const badTarget = buildDoublyLinkedListSteps(
      [10, 20],
      'insert-before',
      5,
    )
    expect(badTarget[badTarget.length - 1]?.meta?.success).toBe(false)
  })

  it('keeps historical snapshots isolated under scrubbing', () => {
    const steps = buildDoublyLinkedListSteps(
      [10, 20, 30],
      'insert-beginning',
      5,
    )
    const first = parseNodesSnapshot(String(steps[0]?.meta?.nodesSnapshot))
    const last = parseNodesSnapshot(
      String(steps[steps.length - 1]?.meta?.nodesSnapshot),
    )
    expect(snapshotToArray(first)).toEqual([10, 20, 30])
    expect(snapshotToArray(last)).toEqual([5, 10, 20, 30])

    const reserialized = parseNodesSnapshot(serializeNodesSnapshot(first))
    expect(snapshotToArray(reserialized)).toEqual([10, 20, 30])
  })
})
