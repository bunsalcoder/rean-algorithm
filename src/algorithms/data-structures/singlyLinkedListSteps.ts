/**
 * Step generator for Singly Linked List visualization.
 *
 * Each step embeds an immutable `nodesSnapshot` so previous/next scrubbing
 * never mutates historical frames. Pure data — no React.
 */

import type { VisualizationStep } from '../../components/visualizations/types'
import { formatArray } from '../../components/visualizations/utils'
import {
  allocateNodeId,
  cloneSnapshot,
  snapshotFromArray,
  snapshotNodeOrder,
  snapshotToArray,
  type LinkedListSnapshot,
  type ListNodeSnapshot,
} from './singlyLinkedList'

export type SinglyLinkedListOperation =
  | 'traverse'
  | 'insert-beginning'
  | 'insert-end'
  | 'delete-by-value'

export type SinglyLinkedListPhase =
  | 'initialize'
  | 'visit'
  | 'create-node'
  | 'link'
  | 'update-head'
  | 'find-tail'
  | 'compare'
  | 'unlink'
  | 'not-found'
  | 'invalid'
  | 'complete'

type StepMetaFields = {
  phase: SinglyLinkedListPhase
  operation: SinglyLinkedListOperation
  nodesSnapshot: string
  headId: string | null
  currentId: string | null
  previousId: string | null
  focusId: string | null
  nullHighlighted: boolean
  success: boolean | null
  operand: number | null
  message: string
}

/** Serialize a snapshot for VisualizationStep.meta. */
export function serializeNodesSnapshot(snapshot: LinkedListSnapshot): string {
  return JSON.stringify({
    headId: snapshot.headId,
    nextIdCounter: snapshot.nextIdCounter,
    nodes: snapshot.nodes,
  })
}

/** Parse a nodes snapshot produced by serializeNodesSnapshot. */
export function parseNodesSnapshot(raw: string): LinkedListSnapshot {
  if (!raw) {
    return { headId: null, nodes: [], nextIdCounter: 0 }
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return { headId: null, nodes: [], nextIdCounter: 0 }
    }

    const record = parsed as Record<string, unknown>
    const headId =
      typeof record.headId === 'string' || record.headId === null
        ? (record.headId as string | null)
        : null
    const nextIdCounter =
      typeof record.nextIdCounter === 'number' &&
      Number.isFinite(record.nextIdCounter)
        ? record.nextIdCounter
        : 0

    const nodesRaw = record.nodes
    if (!Array.isArray(nodesRaw)) {
      return { headId, nodes: [], nextIdCounter }
    }

    const nodes: ListNodeSnapshot[] = []
    for (const item of nodesRaw) {
      if (!item || typeof item !== 'object') {
        continue
      }
      const node = item as Record<string, unknown>
      if (
        typeof node.id !== 'string' ||
        typeof node.value !== 'number' ||
        !(typeof node.nextId === 'string' || node.nextId === null)
      ) {
        continue
      }
      nodes.push({
        id: node.id,
        value: node.value,
        nextId: node.nextId,
      })
    }

    return { headId, nodes, nextIdCounter }
  } catch {
    return { headId: null, nodes: [], nextIdCounter: 0 }
  }
}

function meta(fields: StepMetaFields): NonNullable<VisualizationStep['meta']> {
  return {
    phase: fields.phase,
    operation: fields.operation,
    nodesSnapshot: fields.nodesSnapshot,
    headId: fields.headId,
    currentId: fields.currentId,
    previousId: fields.previousId,
    focusId: fields.focusId,
    nullHighlighted: fields.nullHighlighted,
    success: fields.success,
    operand: fields.operand,
    message: fields.message,
  }
}

function valuesArray(snapshot: LinkedListSnapshot): number[] {
  return snapshotToArray(snapshot)
}

function indexOfNode(
  snapshot: LinkedListSnapshot,
  nodeId: string | null,
): number {
  if (nodeId === null) {
    return -1
  }
  return snapshotNodeOrder(snapshot).indexOf(nodeId)
}

function pushStep(
  steps: VisualizationStep[],
  options: {
    id: string
    title: string
    explanation: string
    detail?: string
    snapshot: LinkedListSnapshot
    phase: SinglyLinkedListPhase
    operation: SinglyLinkedListOperation
    currentId?: string | null
    previousId?: string | null
    focusId?: string | null
    nullHighlighted?: boolean
    success?: boolean | null
    operand?: number | null
    message?: string
    active?: readonly number[]
    highlighted?: readonly number[]
    compared?: readonly number[]
    moving?: readonly number[]
    found?: readonly number[]
    eliminated?: readonly number[]
    complete?: boolean
  },
): void {
  const snapshot = cloneSnapshot(options.snapshot)
  const array = valuesArray(snapshot)
  const currentIndex = indexOfNode(snapshot, options.currentId ?? null)
  const focusIndex = indexOfNode(snapshot, options.focusId ?? null)
  const previousIndex = indexOfNode(snapshot, options.previousId ?? null)

  const pointers: Array<{ index: number; label: string }> = []
  if (snapshot.headId !== null) {
    const headIndex = indexOfNode(snapshot, snapshot.headId)
    if (headIndex >= 0) {
      pointers.push({ index: headIndex, label: 'head' })
    }
  }
  if (currentIndex >= 0 && currentIndex !== indexOfNode(snapshot, snapshot.headId)) {
    pointers.push({ index: currentIndex, label: 'current' })
  }
  if (previousIndex >= 0) {
    pointers.push({ index: previousIndex, label: 'prev' })
  }

  steps.push({
    id: options.id,
    title: options.title,
    explanation: options.explanation,
    detail: options.detail,
    array,
    active: options.active ?? (currentIndex >= 0 ? [currentIndex] : undefined),
    highlighted:
      options.highlighted ?? (focusIndex >= 0 ? [focusIndex] : undefined),
    compared: options.compared,
    moving: options.moving,
    found: options.found,
    eliminated: options.eliminated,
    pointers: pointers.length > 0 ? pointers : undefined,
    operation: options.complete ? 'complete' : undefined,
    meta: meta({
      phase: options.phase,
      operation: options.operation,
      nodesSnapshot: serializeNodesSnapshot(snapshot),
      headId: snapshot.headId,
      currentId: options.currentId ?? null,
      previousId: options.previousId ?? null,
      focusId: options.focusId ?? null,
      nullHighlighted: options.nullHighlighted ?? false,
      success: options.success ?? null,
      operand: options.operand ?? null,
      message: options.message ?? options.explanation,
    }),
  })
}

function isValidOperand(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function buildTraverseSteps(
  initial: LinkedListSnapshot,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: SinglyLinkedListOperation = 'traverse'

  pushStep(steps, {
    id: 'sll-traverse-init',
    title: 'Start at head',
    explanation:
      initial.headId === null
        ? 'The list is empty. Head is null, so traversal finishes immediately.'
        : `Set current to head. Follow each next reference until you reach null.`,
    detail:
      initial.headId === null
        ? 'head → null'
        : `head → ${formatArray(valuesArray(initial))} → null`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    currentId: initial.headId,
    nullHighlighted: initial.headId === null,
    message:
      initial.headId === null
        ? 'Empty list — nothing to visit.'
        : 'Begin traversal at the head node.',
  })

  if (initial.headId === null) {
    pushStep(steps, {
      id: 'sll-traverse-complete-empty',
      title: 'Traversal complete',
      explanation: 'There were no nodes to visit. An empty list is a valid edge case.',
      snapshot: initial,
      phase: 'complete',
      operation,
      nullHighlighted: true,
      success: true,
      complete: true,
      message: 'Traversal finished on an empty list.',
    })
    return steps
  }

  let stepIndex = 0
  for (const nodeId of snapshotNodeOrder(initial)) {
    const node = initial.nodes.find((n) => n.id === nodeId)!
    pushStep(steps, {
      id: `sll-traverse-visit-${stepIndex}`,
      title: `Visit ${node.value}`,
      explanation: `Current points at the node with value ${node.value}. Read the value, then follow next.`,
      detail:
        node.nextId === null
          ? `next is null — this is the last node.`
          : `next points to another node; continue walking.`,
      snapshot: initial,
      phase: 'visit',
      operation,
      currentId: nodeId,
      nullHighlighted: node.nextId === null,
      message: `Visiting node ${node.value}.`,
    })
    stepIndex += 1
  }

  pushStep(steps, {
    id: 'sll-traverse-null',
    title: 'Reach null',
    explanation:
      'Current becomes null. Every node from head to the final next has been visited.',
    snapshot: initial,
    phase: 'visit',
    operation,
    currentId: null,
    nullHighlighted: true,
    message: 'Reached null — end of the list.',
  })

  pushStep(steps, {
    id: 'sll-traverse-complete',
    title: 'Traversal complete',
    explanation: `Visited ${formatArray(valuesArray(initial))} in order from head to null.`,
    snapshot: initial,
    phase: 'complete',
    operation,
    success: true,
    complete: true,
    message: 'Traversal finished successfully.',
  })

  return steps
}

function buildInsertBeginningSteps(
  initial: LinkedListSnapshot,
  value: number,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: SinglyLinkedListOperation = 'insert-beginning'

  pushStep(steps, {
    id: 'sll-insert-head-init',
    title: 'Prepare insert at head',
    explanation: `Insert ${value} at the beginning. The new node must point to the current head before head is updated.`,
    detail:
      initial.headId === null
        ? 'List is empty — the new node will become the only node.'
        : `Current list: head → ${formatArray(valuesArray(initial))} → null`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    currentId: initial.headId,
    operand: value,
    message: 'Ready to insert at the beginning.',
  })

  const { id: newId, nextIdCounter } = allocateNodeId(initial)
  const created: LinkedListSnapshot = {
    headId: initial.headId,
    nextIdCounter,
    nodes: [
      ...initial.nodes.map((n) => ({ ...n })),
      { id: newId, value, nextId: null },
    ],
  }

  pushStep(steps, {
    id: 'sll-insert-head-create',
    title: `Create node ${value}`,
    explanation: `Allocate a new node with value ${value}. Its next is still unset (null for now).`,
    snapshot: created,
    phase: 'create-node',
    operation,
    focusId: newId,
    moving: [indexOfNode(created, newId)].filter((i) => i >= 0),
    operand: value,
    message: `New node [${value}] created.`,
  })

  const linked: LinkedListSnapshot = {
    ...created,
    nodes: created.nodes.map((node) =>
      node.id === newId ? { ...node, nextId: initial.headId } : node,
    ),
  }

  pushStep(steps, {
    id: 'sll-insert-head-link',
    title: 'Point new node at old head',
    explanation:
      initial.headId === null
        ? `new.next = null because the list was empty.`
        : `Set new.next to the previous head. Do this before changing head, or the old list would be lost.`,
    snapshot: linked,
    phase: 'link',
    operation,
    focusId: newId,
    currentId: initial.headId,
    moving: [indexOfNode(linked, newId)].filter((i) => i >= 0),
    operand: value,
    message: 'new.next → previous head.',
  })

  const updated: LinkedListSnapshot = {
    ...linked,
    headId: newId,
  }

  pushStep(steps, {
    id: 'sll-insert-head-update',
    title: 'Update head',
    explanation: `Set head to the new node. The list now starts with ${value}.`,
    detail: `head → ${formatArray(valuesArray(updated))} → null`,
    snapshot: updated,
    phase: 'update-head',
    operation,
    currentId: newId,
    focusId: newId,
    found: [0],
    operand: value,
    message: 'head now points at the new node.',
  })

  pushStep(steps, {
    id: 'sll-insert-head-complete',
    title: 'Insert complete',
    explanation: `Inserted ${value} at the beginning in O(1) time — only a few pointer updates.`,
    snapshot: updated,
    phase: 'complete',
    operation,
    currentId: newId,
    success: true,
    operand: value,
    complete: true,
    message: 'Insert at beginning finished.',
  })

  return steps
}

function buildInsertEndSteps(
  initial: LinkedListSnapshot,
  value: number,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: SinglyLinkedListOperation = 'insert-end'

  pushStep(steps, {
    id: 'sll-insert-end-init',
    title: 'Prepare insert at end',
    explanation: `Append ${value}. Without a maintained tail reference, walk to the last node first (O(n)).`,
    detail:
      initial.headId === null
        ? 'List is empty — append is the same as insert at head.'
        : `Current list: head → ${formatArray(valuesArray(initial))} → null`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    currentId: initial.headId,
    operand: value,
    message: 'Ready to insert at the end.',
  })

  if (initial.headId === null) {
    const { id: newId, nextIdCounter } = allocateNodeId(initial)
    const created: LinkedListSnapshot = {
      headId: newId,
      nextIdCounter,
      nodes: [{ id: newId, value, nextId: null }],
    }

    pushStep(steps, {
      id: 'sll-insert-end-empty-create',
      title: `Create node ${value}`,
      explanation: `Empty list: the new node becomes head and its next is null.`,
      snapshot: created,
      phase: 'create-node',
      operation,
      focusId: newId,
      currentId: newId,
      moving: [0],
      operand: value,
      message: 'New sole node created.',
    })

    pushStep(steps, {
      id: 'sll-insert-end-empty-complete',
      title: 'Insert complete',
      explanation: `head → [${value}] → null`,
      snapshot: created,
      phase: 'complete',
      operation,
      currentId: newId,
      success: true,
      operand: value,
      complete: true,
      message: 'Append to empty list finished.',
    })
    return steps
  }

  const order = snapshotNodeOrder(initial)
  let walkIndex = 0
  for (const nodeId of order) {
    const node = initial.nodes.find((n) => n.id === nodeId)!
    const isLast = node.nextId === null
    pushStep(steps, {
      id: `sll-insert-end-walk-${walkIndex}`,
      title: isLast ? `Found tail ${node.value}` : `Walk past ${node.value}`,
      explanation: isLast
        ? `Reached the last node (${node.value}) whose next is null. This is where we attach the new node.`
        : `current.next is not null, so keep walking toward the end.`,
      snapshot: initial,
      phase: isLast ? 'find-tail' : 'visit',
      operation,
      currentId: nodeId,
      nullHighlighted: isLast,
      operand: value,
      message: isLast ? 'Tail located.' : 'Still looking for the tail.',
    })
    walkIndex += 1
  }

  const tailId = order[order.length - 1]!
  const { id: newId, nextIdCounter } = allocateNodeId(initial)
  const created: LinkedListSnapshot = {
    headId: initial.headId,
    nextIdCounter,
    nodes: [
      ...initial.nodes.map((n) => ({ ...n })),
      { id: newId, value, nextId: null },
    ],
  }

  pushStep(steps, {
    id: 'sll-insert-end-create',
    title: `Create node ${value}`,
    explanation: `Allocate a new node with value ${value} and next = null.`,
    snapshot: created,
    phase: 'create-node',
    operation,
    focusId: newId,
    previousId: tailId,
    moving: [indexOfNode(created, newId)].filter((i) => i >= 0),
    operand: value,
    message: `New node [${value}] ready to append.`,
  })

  const linked: LinkedListSnapshot = {
    ...created,
    nodes: created.nodes.map((node) =>
      node.id === tailId ? { ...node, nextId: newId } : node,
    ),
  }

  pushStep(steps, {
    id: 'sll-insert-end-link',
    title: 'Link tail.next',
    explanation: `Set the previous tail's next to the new node. The old null terminator moves to the new node.`,
    detail: `head → ${formatArray(valuesArray(linked))} → null`,
    snapshot: linked,
    phase: 'link',
    operation,
    focusId: newId,
    previousId: tailId,
    currentId: newId,
    found: [indexOfNode(linked, newId)].filter((i) => i >= 0),
    operand: value,
    message: 'Tail now points at the new node.',
  })

  pushStep(steps, {
    id: 'sll-insert-end-complete',
    title: 'Insert complete',
    explanation: `Appended ${value}. Finding the tail took O(n); the link update itself is O(1).`,
    snapshot: linked,
    phase: 'complete',
    operation,
    currentId: newId,
    success: true,
    operand: value,
    complete: true,
    message: 'Insert at end finished.',
  })

  return steps
}

function buildDeleteByValueSteps(
  initial: LinkedListSnapshot,
  value: number,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: SinglyLinkedListOperation = 'delete-by-value'

  pushStep(steps, {
    id: 'sll-delete-init',
    title: 'Prepare delete by value',
    explanation: `Search for the first node with value ${value}, then splice it out by updating the previous next reference.`,
    detail:
      initial.headId === null
        ? 'List is empty — there is nothing to delete.'
        : `Current list: head → ${formatArray(valuesArray(initial))} → null`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    currentId: initial.headId,
    operand: value,
    message: 'Ready to delete by value.',
  })

  if (initial.headId === null) {
    pushStep(steps, {
      id: 'sll-delete-empty',
      title: 'Nothing to delete',
      explanation: `The list is empty, so value ${value} cannot be deleted. State is unchanged.`,
      snapshot: initial,
      phase: 'not-found',
      operation,
      nullHighlighted: true,
      success: false,
      operand: value,
      message: 'Empty list — delete skipped.',
    })

    pushStep(steps, {
      id: 'sll-delete-empty-complete',
      title: 'Delete finished (no change)',
      explanation: 'Invalid delete left the visualization state intact.',
      snapshot: initial,
      phase: 'complete',
      operation,
      nullHighlighted: true,
      success: false,
      operand: value,
      complete: true,
      message: 'No nodes were removed.',
    })
    return steps
  }

  const order = snapshotNodeOrder(initial)
  const headNode = initial.nodes.find((n) => n.id === initial.headId)!

  if (headNode.value === value) {
    pushStep(steps, {
      id: 'sll-delete-head-match',
      title: `Head matches ${value}`,
      explanation: `The head node holds ${value}. Deleting the head is a special case: move head to head.next.`,
      snapshot: initial,
      phase: 'compare',
      operation,
      currentId: headNode.id,
      compared: [0],
      operand: value,
      message: 'Head is the node to delete.',
    })

    const after: LinkedListSnapshot = {
      headId: headNode.nextId,
      nextIdCounter: initial.nextIdCounter,
      nodes: initial.nodes
        .filter((n) => n.id !== headNode.id)
        .map((n) => ({ ...n })),
    }

    pushStep(steps, {
      id: 'sll-delete-head-unlink',
      title: 'Move head forward',
      explanation:
        after.headId === null
          ? `head.next was null, so the list is now empty.`
          : `Set head to the former second node. The old head is unlinked.`,
      detail:
        after.headId === null
          ? 'head → null'
          : `head → ${formatArray(valuesArray(after))} → null`,
      snapshot: after,
      phase: 'unlink',
      operation,
      currentId: after.headId,
      eliminated: [],
      operand: value,
      message: 'Head updated; old head removed.',
    })

    pushStep(steps, {
      id: 'sll-delete-head-complete',
      title: 'Delete complete',
      explanation: `Removed ${value} from the head in O(1) pointer work.`,
      snapshot: after,
      phase: 'complete',
      operation,
      success: true,
      operand: value,
      complete: true,
      message: 'Head deletion finished.',
    })
    return steps
  }

  pushStep(steps, {
    id: 'sll-delete-head-skip',
    title: `Head is not ${value}`,
    explanation: `Head holds ${headNode.value}, not ${value}. Keep a prev pointer and walk current forward.`,
    snapshot: initial,
    phase: 'compare',
    operation,
    currentId: headNode.id,
    compared: [0],
    operand: value,
    message: 'Continue searching past the head.',
  })

  let prevId: string | null = headNode.id
  let foundId: string | null = null
  let searchIndex = 1

  for (let i = 1; i < order.length; i += 1) {
    const nodeId = order[i]!
    const node = initial.nodes.find((n) => n.id === nodeId)!
    const matches = node.value === value

    pushStep(steps, {
      id: `sll-delete-compare-${searchIndex}`,
      title: matches
        ? `Found ${value}`
        : `Compare ${node.value} with ${value}`,
      explanation: matches
        ? `current.value equals ${value}. prev.next will skip this node.`
        : `current.value is ${node.value}, which is not ${value}. Advance prev and current.`,
      snapshot: initial,
      phase: 'compare',
      operation,
      currentId: nodeId,
      previousId: prevId,
      compared: [indexOfNode(initial, nodeId)].filter((i) => i >= 0),
      found: matches
        ? [indexOfNode(initial, nodeId)].filter((i) => i >= 0)
        : undefined,
      operand: value,
      message: matches ? 'Target node located.' : 'Keep searching.',
    })

    if (matches) {
      foundId = nodeId
      break
    }

    prevId = nodeId
    searchIndex += 1
  }

  if (foundId === null) {
    pushStep(steps, {
      id: 'sll-delete-not-found',
      title: 'Value not found',
      explanation: `Reached null without seeing ${value}. The list is unchanged — invalid deletes must not corrupt state.`,
      snapshot: initial,
      phase: 'not-found',
      operation,
      currentId: null,
      previousId: prevId,
      nullHighlighted: true,
      success: false,
      operand: value,
      message: 'Missing value — no changes.',
    })

    pushStep(steps, {
      id: 'sll-delete-not-found-complete',
      title: 'Delete finished (no change)',
      explanation: `No node with value ${value} existed. Historical snapshots remain intact.`,
      snapshot: initial,
      phase: 'complete',
      operation,
      success: false,
      operand: value,
      complete: true,
      message: 'Delete skipped; list unchanged.',
    })
    return steps
  }

  const foundNode = initial.nodes.find((n) => n.id === foundId)!
  const after: LinkedListSnapshot = {
    headId: initial.headId,
    nextIdCounter: initial.nextIdCounter,
    nodes: initial.nodes
      .filter((n) => n.id !== foundId)
      .map((n) =>
        n.id === prevId ? { ...n, nextId: foundNode.nextId } : { ...n },
      ),
  }

  pushStep(steps, {
    id: 'sll-delete-unlink',
    title: 'Skip the deleted node',
    explanation: `Set prev.next to the deleted node's next. The node with ${value} is no longer reachable from head.`,
    detail: `head → ${formatArray(valuesArray(after))} → null`,
    snapshot: after,
    phase: 'unlink',
    operation,
    previousId: prevId,
    currentId: foundNode.nextId,
    focusId: prevId,
    operand: value,
    message: 'prev.next skips the deleted node.',
  })

  pushStep(steps, {
    id: 'sll-delete-complete',
    title: 'Delete complete',
    explanation: `Removed the first ${value}. Finding it took O(n); the unlink itself is O(1).`,
    snapshot: after,
    phase: 'complete',
    operation,
    success: true,
    operand: value,
    complete: true,
    message: 'Delete by value finished.',
  })

  return steps
}

/**
 * Build visualization steps for a singly linked list operation.
 *
 * @param values - Initial list values (head → tail).
 * @param operation - traverse | insert-beginning | insert-end | delete-by-value
 * @param operand - Required for insert/delete operations.
 */
export function buildSinglyLinkedListSteps(
  values: readonly number[],
  operation: SinglyLinkedListOperation,
  operand?: number,
): VisualizationStep[] {
  const initial = snapshotFromArray(values)

  if (
    (operation === 'insert-beginning' ||
      operation === 'insert-end' ||
      operation === 'delete-by-value') &&
    !isValidOperand(operand)
  ) {
    const steps: VisualizationStep[] = []
    pushStep(steps, {
      id: 'sll-invalid-operand',
      title: 'Invalid input',
      explanation:
        'Enter a finite number before running insert or delete. The list was not modified.',
      snapshot: initial,
      phase: 'invalid',
      operation,
      currentId: initial.headId,
      success: false,
      message: 'Operand missing or not a finite number.',
    })
    pushStep(steps, {
      id: 'sll-invalid-complete',
      title: 'Waiting for valid input',
      explanation: 'Fix the value input, then run the operation again.',
      snapshot: initial,
      phase: 'complete',
      operation,
      success: false,
      complete: true,
      message: 'No changes applied.',
    })
    return steps
  }

  switch (operation) {
    case 'traverse':
      return buildTraverseSteps(initial)
    case 'insert-beginning':
      return buildInsertBeginningSteps(initial, operand!)
    case 'insert-end':
      return buildInsertEndSteps(initial, operand!)
    case 'delete-by-value':
      return buildDeleteByValueSteps(initial, operand!)
  }
}

/** Read final list values from a step sequence (for tests). */
export function valuesFromFinalStep(
  steps: readonly VisualizationStep[],
): number[] {
  const last = steps[steps.length - 1]
  if (!last?.meta) {
    return []
  }
  const raw = last.meta.nodesSnapshot
  if (typeof raw !== 'string') {
    return last.array ? [...last.array] : []
  }
  return snapshotToArray(parseNodesSnapshot(raw))
}
