/**
 * Doubly Linked List — pure data-structure module.
 *
 * Maintains both head and tail. Each node has prev and next references.
 * Mutating operations rebuild the list so prior snapshots stay isolated.
 * Used by lesson examples, tests, and the visualization step generator.
 */

/** Immutable doubly linked list node. */
export type DoublyListNode = {
  readonly value: number
  readonly prev: DoublyListNode | null
  readonly next: DoublyListNode | null
}

/** List container with head and tail sentinels. */
export type DoublyLinkedList = {
  readonly head: DoublyListNode | null
  readonly tail: DoublyListNode | null
}

/**
 * Flat, JSON-friendly snapshot for visualization frames.
 * Each historical step owns its own node array so scrubbing prev/next
 * cannot rewrite earlier frames.
 */
export type DoublyListNodeSnapshot = {
  readonly id: string
  readonly value: number
  readonly prevId: string | null
  readonly nextId: string | null
}

export type DoublyLinkedListSnapshot = {
  readonly headId: string | null
  readonly tailId: string | null
  readonly nodes: readonly DoublyListNodeSnapshot[]
  /** Monotonic counter used when allocating new node ids. */
  readonly nextIdCounter: number
}

export const DOUBLY_LINKED_LIST_DEFAULT_VALUES = [10, 20, 30] as const

export const DOUBLY_LINKED_LIST_ALT_VALUES = [5, 15, 25, 35] as const

export const DOUBLY_LINKED_LIST_SINGLE_VALUE = [42] as const

export const DOUBLY_LINKED_LIST_ARRAY_PRESETS = [
  {
    id: 'lesson-default',
    label: 'Lesson list',
    values: DOUBLY_LINKED_LIST_DEFAULT_VALUES,
  },
  {
    id: 'four-nodes',
    label: 'Four nodes',
    values: DOUBLY_LINKED_LIST_ALT_VALUES,
  },
  {
    id: 'single-node',
    label: 'Single node',
    values: DOUBLY_LINKED_LIST_SINGLE_VALUE,
  },
  {
    id: 'empty',
    label: 'Empty list',
    values: [] as const,
  },
] as const

type MutableNode = {
  value: number
  prev: MutableNode | null
  next: MutableNode | null
}

/** Build an immutable doubly linked list (left → right = head → tail). */
export function listFromArray(values: readonly number[]): DoublyLinkedList {
  if (values.length === 0) {
    return { head: null, tail: null }
  }

  const builders: MutableNode[] = values.map((value) => ({
    value,
    prev: null,
    next: null,
  }))

  for (let i = 0; i < builders.length; i += 1) {
    if (i > 0) {
      builders[i]!.prev = builders[i - 1]!
    }
    if (i < builders.length - 1) {
      builders[i]!.next = builders[i + 1]!
    }
  }

  return {
    head: builders[0] as DoublyListNode,
    tail: builders[builders.length - 1]! as DoublyListNode,
  }
}

/** Walk forward from head and collect values. Empty list → []. */
export function listToArray(list: DoublyLinkedList): number[] {
  const values: number[] = []
  let current: DoublyListNode | null = list.head
  while (current !== null) {
    values.push(current.value)
    current = current.next
  }
  return values
}

/** Walk backward from tail and collect values. Empty list → []. */
export function listToArrayReverse(list: DoublyLinkedList): number[] {
  const values: number[] = []
  let current: DoublyListNode | null = list.tail
  while (current !== null) {
    values.push(current.value)
    current = current.prev
  }
  return values
}

/** Alias for listToArray — forward traversal. */
export function traverseForward(list: DoublyLinkedList): number[] {
  return listToArray(list)
}

/** Alias for listToArrayReverse — backward traversal. */
export function traverseBackward(list: DoublyLinkedList): number[] {
  return listToArrayReverse(list)
}

/**
 * Verify every adjacent pair agrees on next/prev, and that
 * head.prev / tail.next are null (or both ends are null when empty).
 */
export function isBidirectionallyConsistent(list: DoublyLinkedList): boolean {
  if (list.head === null && list.tail === null) {
    return true
  }
  if (list.head === null || list.tail === null) {
    return false
  }
  if (list.head.prev !== null || list.tail.next !== null) {
    return false
  }

  let current: DoublyListNode | null = list.head
  const seen = new Set<DoublyListNode>()
  while (current !== null) {
    if (seen.has(current)) {
      return false
    }
    seen.add(current)
    if (current.next !== null && current.next.prev !== current) {
      return false
    }
    if (current.prev !== null && current.prev.next !== current) {
      return false
    }
    if (current.next === null && current !== list.tail) {
      return false
    }
    current = current.next
  }

  return seen.has(list.tail)
}

/** Insert a new node at the beginning. O(1) with head reference. */
export function insertAtBeginning(
  list: DoublyLinkedList,
  value: number,
): DoublyLinkedList {
  const values = listToArray(list)
  values.unshift(value)
  return listFromArray(values)
}

/** Insert a new node at the end. O(1) with tail reference. */
export function insertAtEnd(
  list: DoublyLinkedList,
  value: number,
): DoublyLinkedList {
  const values = listToArray(list)
  values.push(value)
  return listFromArray(values)
}

export type InsertRelativeResult = {
  list: DoublyLinkedList
  inserted: boolean
}

/**
 * Insert `value` before the first node whose value equals `target`.
 * Missing target → unchanged list (`inserted: false`).
 * Finding the node is O(n); the link updates themselves are O(1).
 */
export function insertBefore(
  list: DoublyLinkedList,
  target: number,
  value: number,
): InsertRelativeResult {
  const values = listToArray(list)
  const index = values.indexOf(target)
  if (index === -1) {
    return { list, inserted: false }
  }
  values.splice(index, 0, value)
  return { list: listFromArray(values), inserted: true }
}

/**
 * Insert `value` after the first node whose value equals `target`.
 * Missing target → unchanged list (`inserted: false`).
 */
export function insertAfter(
  list: DoublyLinkedList,
  target: number,
  value: number,
): InsertRelativeResult {
  const values = listToArray(list)
  const index = values.indexOf(target)
  if (index === -1) {
    return { list, inserted: false }
  }
  values.splice(index + 1, 0, value)
  return { list: listFromArray(values), inserted: true }
}

export type DeleteByValueResult = {
  list: DoublyLinkedList
  deleted: boolean
}

/**
 * Delete the first node whose value equals `value`.
 * With a known node reference, unlink is O(1); finding by value is O(n).
 * Missing values leave the list unchanged (`deleted: false`).
 * Empty list → both head and tail null.
 */
export function deleteByValue(
  list: DoublyLinkedList,
  value: number,
): DeleteByValueResult {
  const values = listToArray(list)
  const index = values.indexOf(value)
  if (index === -1) {
    return { list, deleted: false }
  }
  values.splice(index, 1)
  return { list: listFromArray(values), deleted: true }
}

/** Deep-clone a snapshot so historical frames stay isolated. */
export function cloneSnapshot(
  snapshot: DoublyLinkedListSnapshot,
): DoublyLinkedListSnapshot {
  return {
    headId: snapshot.headId,
    tailId: snapshot.tailId,
    nextIdCounter: snapshot.nextIdCounter,
    nodes: snapshot.nodes.map((node) => ({
      id: node.id,
      value: node.value,
      prevId: node.prevId,
      nextId: node.nextId,
    })),
  }
}

/** Build a snapshot from values with stable sequential ids (`n0`, `n1`, …). */
export function snapshotFromArray(
  values: readonly number[],
): DoublyLinkedListSnapshot {
  if (values.length === 0) {
    return { headId: null, tailId: null, nodes: [], nextIdCounter: 0 }
  }

  const nodes: DoublyListNodeSnapshot[] = values.map((value, index) => ({
    id: `n${index}`,
    value,
    prevId: index > 0 ? `n${index - 1}` : null,
    nextId: index < values.length - 1 ? `n${index + 1}` : null,
  }))

  return {
    headId: nodes[0]!.id,
    tailId: nodes[nodes.length - 1]!.id,
    nodes,
    nextIdCounter: values.length,
  }
}

/** Values in head → tail order from a snapshot. */
export function snapshotToArray(snapshot: DoublyLinkedListSnapshot): number[] {
  const byId = new Map(snapshot.nodes.map((node) => [node.id, node]))
  const values: number[] = []
  let currentId = snapshot.headId
  const seen = new Set<string>()

  while (currentId !== null) {
    if (seen.has(currentId)) {
      break
    }
    seen.add(currentId)
    const node = byId.get(currentId)
    if (!node) {
      break
    }
    values.push(node.value)
    currentId = node.nextId
  }

  return values
}

/** Values in tail → head order from a snapshot. */
export function snapshotToArrayReverse(
  snapshot: DoublyLinkedListSnapshot,
): number[] {
  const byId = new Map(snapshot.nodes.map((node) => [node.id, node]))
  const values: number[] = []
  let currentId = snapshot.tailId
  const seen = new Set<string>()

  while (currentId !== null) {
    if (seen.has(currentId)) {
      break
    }
    seen.add(currentId)
    const node = byId.get(currentId)
    if (!node) {
      break
    }
    values.push(node.value)
    currentId = node.prevId
  }

  return values
}

/** Ordered node ids from head to null (exclusive). */
export function snapshotNodeOrder(
  snapshot: DoublyLinkedListSnapshot,
): readonly string[] {
  const byId = new Map(snapshot.nodes.map((node) => [node.id, node]))
  const order: string[] = []
  let currentId = snapshot.headId
  const seen = new Set<string>()

  while (currentId !== null) {
    if (seen.has(currentId)) {
      break
    }
    seen.add(currentId)
    order.push(currentId)
    const node = byId.get(currentId)
    if (!node) {
      break
    }
    currentId = node.nextId
  }

  return order
}

/** Ordered node ids from tail toward head. */
export function snapshotNodeOrderReverse(
  snapshot: DoublyLinkedListSnapshot,
): readonly string[] {
  const byId = new Map(snapshot.nodes.map((node) => [node.id, node]))
  const order: string[] = []
  let currentId = snapshot.tailId
  const seen = new Set<string>()

  while (currentId !== null) {
    if (seen.has(currentId)) {
      break
    }
    seen.add(currentId)
    order.push(currentId)
    const node = byId.get(currentId)
    if (!node) {
      break
    }
    currentId = node.prevId
  }

  return order
}

/** Check snapshot adjacent pairs agree on prevId/nextId. */
export function isSnapshotConsistent(
  snapshot: DoublyLinkedListSnapshot,
): boolean {
  if (snapshot.headId === null && snapshot.tailId === null) {
    return snapshot.nodes.length === 0
  }
  if (snapshot.headId === null || snapshot.tailId === null) {
    return false
  }

  const byId = new Map(snapshot.nodes.map((node) => [node.id, node]))
  const head = byId.get(snapshot.headId)
  const tail = byId.get(snapshot.tailId)
  if (!head || !tail || head.prevId !== null || tail.nextId !== null) {
    return false
  }

  for (const node of snapshot.nodes) {
    if (node.nextId !== null) {
      const next = byId.get(node.nextId)
      if (!next || next.prevId !== node.id) {
        return false
      }
    }
    if (node.prevId !== null) {
      const prev = byId.get(node.prevId)
      if (!prev || prev.nextId !== node.id) {
        return false
      }
    }
  }

  return true
}

/** Allocate a fresh node id against a snapshot's counter. */
export function allocateNodeId(snapshot: DoublyLinkedListSnapshot): {
  id: string
  nextIdCounter: number
} {
  return {
    id: `n${snapshot.nextIdCounter}`,
    nextIdCounter: snapshot.nextIdCounter + 1,
  }
}
