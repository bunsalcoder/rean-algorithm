/**
 * Singly Linked List — pure data-structure module.
 *
 * Nodes are immutable. Mutating operations return a new head (and never
 * share mutable node objects with prior snapshots). Used by the lesson
 * code examples, tests, and visualization step generator.
 */

/** Immutable singly linked list node. */
export type ListNode = {
  readonly value: number
  readonly next: ListNode | null
}

/**
 * Flat, JSON-friendly snapshot of a list for visualization frames.
 * Each historical step owns its own node array so scrubbing prev/next
 * cannot rewrite earlier frames.
 */
export type ListNodeSnapshot = {
  readonly id: string
  readonly value: number
  readonly nextId: string | null
}

export type LinkedListSnapshot = {
  readonly headId: string | null
  readonly nodes: readonly ListNodeSnapshot[]
  /** Monotonic counter used when allocating new node ids. */
  readonly nextIdCounter: number
}

export const SINGLY_LINKED_LIST_DEFAULT_VALUES = [10, 20, 30] as const

export const SINGLY_LINKED_LIST_ALT_VALUES = [5, 15, 25, 35] as const

export const SINGLY_LINKED_LIST_SINGLE_VALUE = [42] as const

export const SINGLY_LINKED_LIST_ARRAY_PRESETS = [
  {
    id: 'lesson-default',
    label: 'Lesson list',
    values: SINGLY_LINKED_LIST_DEFAULT_VALUES,
  },
  {
    id: 'four-nodes',
    label: 'Four nodes',
    values: SINGLY_LINKED_LIST_ALT_VALUES,
  },
  {
    id: 'single-node',
    label: 'Single node',
    values: SINGLY_LINKED_LIST_SINGLE_VALUE,
  },
  {
    id: 'empty',
    label: 'Empty list',
    values: [] as const,
  },
] as const

/** Build an immutable linked list from array values (left → right = head → tail). */
export function listFromArray(values: readonly number[]): ListNode | null {
  if (values.length === 0) {
    return null
  }

  let head: ListNode = { value: values[values.length - 1]!, next: null }
  for (let i = values.length - 2; i >= 0; i -= 1) {
    head = { value: values[i]!, next: head }
  }
  return head
}

/** Walk the list and collect values into an array. Empty list → []. */
export function listToArray(head: ListNode | null): number[] {
  const values: number[] = []
  let current: ListNode | null = head
  while (current !== null) {
    values.push(current.value)
    current = current.next
  }
  return values
}

/** Alias for listToArray — traverse from head until null. */
export function traverse(head: ListNode | null): number[] {
  return listToArray(head)
}

/** Insert a new node at the beginning. O(1). */
export function insertAtBeginning(
  head: ListNode | null,
  value: number,
): ListNode {
  return { value, next: head }
}

/** Append a new node at the end. O(n) without a maintained tail reference. */
export function insertAtEnd(head: ListNode | null, value: number): ListNode {
  const newNode: ListNode = { value, next: null }
  if (head === null) {
    return newNode
  }

  // Rebuild so prior heads remain unchanged (immutable snapshots).
  const values = listToArray(head)
  values.push(value)
  return listFromArray(values)!
}

export type DeleteByValueResult = {
  head: ListNode | null
  deleted: boolean
}

/**
 * Delete the first node whose value equals `value`.
 * Head deletion is O(1); otherwise O(n) to find the node.
 * Missing values leave the list unchanged (`deleted: false`).
 */
export function deleteByValue(
  head: ListNode | null,
  value: number,
): DeleteByValueResult {
  if (head === null) {
    return { head: null, deleted: false }
  }

  if (head.value === value) {
    return { head: head.next, deleted: true }
  }

  const values = listToArray(head)
  const index = values.indexOf(value)
  if (index === -1) {
    return { head, deleted: false }
  }

  values.splice(index, 1)
  return { head: listFromArray(values), deleted: true }
}

/** Deep-clone a snapshot so historical frames stay isolated. */
export function cloneSnapshot(
  snapshot: LinkedListSnapshot,
): LinkedListSnapshot {
  return {
    headId: snapshot.headId,
    nextIdCounter: snapshot.nextIdCounter,
    nodes: snapshot.nodes.map((node) => ({
      id: node.id,
      value: node.value,
      nextId: node.nextId,
    })),
  }
}

/** Build a snapshot from values with stable sequential ids (`n0`, `n1`, …). */
export function snapshotFromArray(
  values: readonly number[],
): LinkedListSnapshot {
  if (values.length === 0) {
    return { headId: null, nodes: [], nextIdCounter: 0 }
  }

  const nodes: ListNodeSnapshot[] = values.map((value, index) => ({
    id: `n${index}`,
    value,
    nextId: index < values.length - 1 ? `n${index + 1}` : null,
  }))

  return {
    headId: nodes[0]!.id,
    nodes,
    nextIdCounter: values.length,
  }
}

/** Values in head → tail order from a snapshot. */
export function snapshotToArray(snapshot: LinkedListSnapshot): number[] {
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

/** Ordered node ids from head to null (exclusive). */
export function snapshotNodeOrder(
  snapshot: LinkedListSnapshot,
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

/** Allocate a fresh node id against a snapshot's counter. */
export function allocateNodeId(snapshot: LinkedListSnapshot): {
  id: string
  nextIdCounter: number
} {
  return {
    id: `n${snapshot.nextIdCounter}`,
    nextIdCounter: snapshot.nextIdCounter + 1,
  }
}
