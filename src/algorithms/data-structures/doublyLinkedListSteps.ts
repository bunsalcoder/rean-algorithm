/**
 * Step generator for Doubly Linked List visualization.
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
  snapshotNodeOrderReverse,
  snapshotToArray,
  type DoublyLinkedListSnapshot,
  type DoublyListNodeSnapshot,
} from './doublyLinkedList'

export type DoublyLinkedListOperation =
  | 'traverse-forward'
  | 'traverse-backward'
  | 'insert-beginning'
  | 'insert-end'
  | 'insert-before'
  | 'insert-after'
  | 'delete-by-value'

export type DoublyLinkedListPhase =
  | 'initialize'
  | 'visit'
  | 'create-node'
  | 'link'
  | 'update-head'
  | 'update-tail'
  | 'find-target'
  | 'compare'
  | 'unlink'
  | 'not-found'
  | 'invalid'
  | 'complete'

type StepMetaFields = {
  phase: DoublyLinkedListPhase
  operation: DoublyLinkedListOperation
  nodesSnapshot: string
  headId: string | null
  tailId: string | null
  currentId: string | null
  previousId: string | null
  focusId: string | null
  nullHighlighted: boolean
  success: boolean | null
  operand: number | null
  target: number | null
  message: string
}

/** Serialize a snapshot for VisualizationStep.meta. */
export function serializeNodesSnapshot(
  snapshot: DoublyLinkedListSnapshot,
): string {
  return JSON.stringify({
    headId: snapshot.headId,
    tailId: snapshot.tailId,
    nextIdCounter: snapshot.nextIdCounter,
    nodes: snapshot.nodes,
  })
}

/** Parse a nodes snapshot produced by serializeNodesSnapshot. */
export function parseNodesSnapshot(raw: string): DoublyLinkedListSnapshot {
  if (!raw) {
    return { headId: null, tailId: null, nodes: [], nextIdCounter: 0 }
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return { headId: null, tailId: null, nodes: [], nextIdCounter: 0 }
    }

    const record = parsed as Record<string, unknown>
    const headId =
      typeof record.headId === 'string' || record.headId === null
        ? (record.headId as string | null)
        : null
    const tailId =
      typeof record.tailId === 'string' || record.tailId === null
        ? (record.tailId as string | null)
        : null
    const nextIdCounter =
      typeof record.nextIdCounter === 'number' &&
      Number.isFinite(record.nextIdCounter)
        ? record.nextIdCounter
        : 0

    const nodesRaw = record.nodes
    if (!Array.isArray(nodesRaw)) {
      return { headId, tailId, nodes: [], nextIdCounter }
    }

    const nodes: DoublyListNodeSnapshot[] = []
    for (const item of nodesRaw) {
      if (!item || typeof item !== 'object') {
        continue
      }
      const node = item as Record<string, unknown>
      if (
        typeof node.id !== 'string' ||
        typeof node.value !== 'number' ||
        !(typeof node.nextId === 'string' || node.nextId === null) ||
        !(typeof node.prevId === 'string' || node.prevId === null)
      ) {
        continue
      }
      nodes.push({
        id: node.id,
        value: node.value,
        prevId: node.prevId,
        nextId: node.nextId,
      })
    }

    return { headId, tailId, nodes, nextIdCounter }
  } catch {
    return { headId: null, tailId: null, nodes: [], nextIdCounter: 0 }
  }
}

function meta(fields: StepMetaFields): NonNullable<VisualizationStep['meta']> {
  return {
    phase: fields.phase,
    operation: fields.operation,
    nodesSnapshot: fields.nodesSnapshot,
    headId: fields.headId,
    tailId: fields.tailId,
    currentId: fields.currentId,
    previousId: fields.previousId,
    focusId: fields.focusId,
    nullHighlighted: fields.nullHighlighted,
    success: fields.success,
    operand: fields.operand,
    target: fields.target,
    message: fields.message,
  }
}

function valuesArray(snapshot: DoublyLinkedListSnapshot): number[] {
  return snapshotToArray(snapshot)
}

function indexOfNode(
  snapshot: DoublyLinkedListSnapshot,
  nodeId: string | null,
): number {
  if (nodeId === null) {
    return -1
  }
  return snapshotNodeOrder(snapshot).indexOf(nodeId)
}

function formatChain(snapshot: DoublyLinkedListSnapshot): string {
  const values = valuesArray(snapshot)
  if (values.length === 0) {
    return 'null ⇄ null (empty)'
  }
  return `null ← [${values.join('] ⇄ [')}] → null`
}

function pushStep(
  steps: VisualizationStep[],
  options: {
    id: string
    title: string
    explanation: string
    detail?: string
    snapshot: DoublyLinkedListSnapshot
    phase: DoublyLinkedListPhase
    operation: DoublyLinkedListOperation
    currentId?: string | null
    previousId?: string | null
    focusId?: string | null
    nullHighlighted?: boolean
    success?: boolean | null
    operand?: number | null
    target?: number | null
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
  if (
    snapshot.tailId !== null &&
    snapshot.tailId !== snapshot.headId
  ) {
    const tailIndex = indexOfNode(snapshot, snapshot.tailId)
    if (tailIndex >= 0) {
      pointers.push({ index: tailIndex, label: 'tail' })
    }
  }
  if (
    currentIndex >= 0 &&
    currentIndex !== indexOfNode(snapshot, snapshot.headId) &&
    currentIndex !== indexOfNode(snapshot, snapshot.tailId)
  ) {
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
      tailId: snapshot.tailId,
      currentId: options.currentId ?? null,
      previousId: options.previousId ?? null,
      focusId: options.focusId ?? null,
      nullHighlighted: options.nullHighlighted ?? false,
      success: options.success ?? null,
      operand: options.operand ?? null,
      target: options.target ?? null,
      message: options.message ?? options.explanation,
    }),
  })
}

function isValidOperand(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function buildTraverseForwardSteps(
  initial: DoublyLinkedListSnapshot,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: DoublyLinkedListOperation = 'traverse-forward'

  pushStep(steps, {
    id: 'dll-fwd-init',
    title: 'Start at head',
    explanation:
      initial.headId === null
        ? 'The list is empty. Head and tail are null, so forward traversal finishes immediately.'
        : 'Set current to head. Follow each next reference until you reach null.',
    detail:
      initial.headId === null
        ? 'head → null · tail → null'
        : formatChain(initial),
    snapshot: initial,
    phase: 'initialize',
    operation,
    currentId: initial.headId,
    nullHighlighted: initial.headId === null,
    message:
      initial.headId === null
        ? 'Empty list — nothing to visit.'
        : 'Begin forward traversal at the head node.',
  })

  if (initial.headId === null) {
    pushStep(steps, {
      id: 'dll-fwd-complete-empty',
      title: 'Traversal complete',
      explanation: 'There were no nodes to visit. An empty list is a valid edge case.',
      snapshot: initial,
      phase: 'complete',
      operation,
      nullHighlighted: true,
      success: true,
      complete: true,
      message: 'Forward traversal finished on an empty list.',
    })
    return steps
  }

  let stepIndex = 0
  for (const nodeId of snapshotNodeOrder(initial)) {
    const node = initial.nodes.find((n) => n.id === nodeId)!
    pushStep(steps, {
      id: `dll-fwd-visit-${stepIndex}`,
      title: `Visit ${node.value}`,
      explanation: `Current points at ${node.value}. Read the value, then follow next.`,
      detail:
        node.nextId === null
          ? 'next is null — this is the tail.'
          : 'next points to another node; continue walking forward.',
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
    id: 'dll-fwd-null',
    title: 'Reach null',
    explanation:
      'Current becomes null. Every node from head to the final next has been visited.',
    snapshot: initial,
    phase: 'visit',
    operation,
    currentId: null,
    nullHighlighted: true,
    message: 'Reached null — end of the forward walk.',
  })

  pushStep(steps, {
    id: 'dll-fwd-complete',
    title: 'Forward traversal complete',
    explanation: `Visited ${formatArray(valuesArray(initial))} from head to null.`,
    snapshot: initial,
    phase: 'complete',
    operation,
    success: true,
    complete: true,
    message: 'Forward traversal finished successfully.',
  })

  return steps
}

function buildTraverseBackwardSteps(
  initial: DoublyLinkedListSnapshot,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: DoublyLinkedListOperation = 'traverse-backward'

  pushStep(steps, {
    id: 'dll-bwd-init',
    title: 'Start at tail',
    explanation:
      initial.tailId === null
        ? 'The list is empty. Tail is null, so backward traversal finishes immediately.'
        : 'Set current to tail. Follow each prev reference until you reach null. This is the key advantage over a singly linked list.',
    detail:
      initial.tailId === null
        ? 'head → null · tail → null'
        : formatChain(initial),
    snapshot: initial,
    phase: 'initialize',
    operation,
    currentId: initial.tailId,
    nullHighlighted: initial.tailId === null,
    message:
      initial.tailId === null
        ? 'Empty list — nothing to visit.'
        : 'Begin backward traversal at the tail node.',
  })

  if (initial.tailId === null) {
    pushStep(steps, {
      id: 'dll-bwd-complete-empty',
      title: 'Traversal complete',
      explanation: 'There were no nodes to visit.',
      snapshot: initial,
      phase: 'complete',
      operation,
      nullHighlighted: true,
      success: true,
      complete: true,
      message: 'Backward traversal finished on an empty list.',
    })
    return steps
  }

  let stepIndex = 0
  for (const nodeId of snapshotNodeOrderReverse(initial)) {
    const node = initial.nodes.find((n) => n.id === nodeId)!
    pushStep(steps, {
      id: `dll-bwd-visit-${stepIndex}`,
      title: `Visit ${node.value}`,
      explanation: `Current points at ${node.value}. Read the value, then follow prev.`,
      detail:
        node.prevId === null
          ? 'prev is null — this is the head.'
          : 'prev points to another node; continue walking backward.',
      snapshot: initial,
      phase: 'visit',
      operation,
      currentId: nodeId,
      nullHighlighted: node.prevId === null,
      message: `Visiting node ${node.value} (backward).`,
    })
    stepIndex += 1
  }

  pushStep(steps, {
    id: 'dll-bwd-null',
    title: 'Reach null',
    explanation:
      'Current becomes null after walking prev from tail through head.',
    snapshot: initial,
    phase: 'visit',
    operation,
    currentId: null,
    nullHighlighted: true,
    message: 'Reached null — end of the backward walk.',
  })

  pushStep(steps, {
    id: 'dll-bwd-complete',
    title: 'Backward traversal complete',
    explanation: `Visited from tail toward head using prev references.`,
    snapshot: initial,
    phase: 'complete',
    operation,
    success: true,
    complete: true,
    message: 'Backward traversal finished successfully.',
  })

  return steps
}

function buildInsertBeginningSteps(
  initial: DoublyLinkedListSnapshot,
  value: number,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: DoublyLinkedListOperation = 'insert-beginning'
  const oldHeadId = initial.headId

  pushStep(steps, {
    id: 'dll-insert-head-init',
    title: 'Prepare insert at head',
    explanation: `Insert ${value} at the beginning. Update new.next, old head.prev, and head — and if the list was empty, also set tail.`,
    detail: formatChain(initial),
    snapshot: initial,
    phase: 'initialize',
    operation,
    currentId: initial.headId,
    operand: value,
    message: 'Ready to insert at the beginning.',
  })

  const { id: newId, nextIdCounter } = allocateNodeId(initial)
  const created: DoublyLinkedListSnapshot = {
    headId: initial.headId,
    tailId: initial.tailId,
    nextIdCounter,
    nodes: [
      ...initial.nodes.map((n) => ({ ...n })),
      { id: newId, value, prevId: null, nextId: null },
    ],
  }

  pushStep(steps, {
    id: 'dll-insert-head-create',
    title: `Create node ${value}`,
    explanation: `Allocate a new node with value ${value}. prev and next are still null.`,
    snapshot: created,
    phase: 'create-node',
    operation,
    focusId: newId,
    moving: [indexOfNode(created, newId)].filter((i) => i >= 0),
    operand: value,
    message: `New node [${value}] created.`,
  })

  const linkedNext: DoublyLinkedListSnapshot = {
    ...created,
    nodes: created.nodes.map((node) =>
      node.id === newId ? { ...node, nextId: oldHeadId } : node,
    ),
  }

  pushStep(steps, {
    id: 'dll-insert-head-link-next',
    title: 'Set new.next → old head',
    explanation:
      oldHeadId === null
        ? 'new.next = null because the list was empty.'
        : `Set new.next to the previous head (${valuesArray(initial)[0]}).`,
    snapshot: linkedNext,
    phase: 'link',
    operation,
    focusId: newId,
    currentId: oldHeadId,
    operand: value,
    message: 'new.next updated.',
  })

  let afterPrev: DoublyLinkedListSnapshot = linkedNext
  if (oldHeadId !== null) {
    afterPrev = {
      ...linkedNext,
      nodes: linkedNext.nodes.map((node) =>
        node.id === oldHeadId ? { ...node, prevId: newId } : node,
      ),
    }
    pushStep(steps, {
      id: 'dll-insert-head-link-prev',
      title: 'Set old head.prev → new',
      explanation: `Update the previous head's prev to the new node. Doubly linked lists must keep both directions consistent.`,
      snapshot: afterPrev,
      phase: 'link',
      operation,
      focusId: newId,
      currentId: oldHeadId,
      operand: value,
      message: 'oldHead.prev → new node.',
    })
  }

  const updated: DoublyLinkedListSnapshot = {
    ...afterPrev,
    headId: newId,
    tailId: initial.tailId === null ? newId : initial.tailId,
  }

  pushStep(steps, {
    id: 'dll-insert-head-update',
    title: 'Update head' + (initial.tailId === null ? ' and tail' : ''),
    explanation:
      initial.tailId === null
        ? `Empty list: head and tail both point at the new sole node.`
        : `Set head to the new node. Tail is unchanged.`,
    detail: formatChain(updated),
    snapshot: updated,
    phase: 'update-head',
    operation,
    currentId: newId,
    focusId: newId,
    found: [0],
    operand: value,
    message: 'head (and tail if empty) updated.',
  })

  pushStep(steps, {
    id: 'dll-insert-head-complete',
    title: 'Insert complete',
    explanation: `Inserted ${value} at the head in O(1) with a maintained head reference.`,
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
  initial: DoublyLinkedListSnapshot,
  value: number,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: DoublyLinkedListOperation = 'insert-end'
  const oldTailId = initial.tailId

  pushStep(steps, {
    id: 'dll-insert-end-init',
    title: 'Prepare insert at end',
    explanation: `Append ${value}. With a maintained tail reference, append is O(1) — no walk required.`,
    detail: formatChain(initial),
    snapshot: initial,
    phase: 'initialize',
    operation,
    currentId: initial.tailId,
    operand: value,
    message: 'Ready to insert at the end.',
  })

  const { id: newId, nextIdCounter } = allocateNodeId(initial)
  const created: DoublyLinkedListSnapshot = {
    headId: initial.headId,
    tailId: initial.tailId,
    nextIdCounter,
    nodes: [
      ...initial.nodes.map((n) => ({ ...n })),
      { id: newId, value, prevId: null, nextId: null },
    ],
  }

  pushStep(steps, {
    id: 'dll-insert-end-create',
    title: `Create node ${value}`,
    explanation: `Allocate a new node with value ${value}. prev and next start as null.`,
    snapshot: created,
    phase: 'create-node',
    operation,
    focusId: newId,
    moving: [indexOfNode(created, newId)].filter((i) => i >= 0),
    operand: value,
    message: `New node [${value}] created.`,
  })

  if (oldTailId === null) {
    const alone: DoublyLinkedListSnapshot = {
      headId: newId,
      tailId: newId,
      nextIdCounter,
      nodes: [{ id: newId, value, prevId: null, nextId: null }],
    }

    pushStep(steps, {
      id: 'dll-insert-end-empty',
      title: 'Empty list → head and tail',
      explanation: `The list was empty, so head and tail both become the new node.`,
      detail: formatChain(alone),
      snapshot: alone,
      phase: 'update-tail',
      operation,
      currentId: newId,
      focusId: newId,
      found: [0],
      operand: value,
      message: 'Sole node is head and tail.',
    })

    pushStep(steps, {
      id: 'dll-insert-end-empty-complete',
      title: 'Insert complete',
      explanation: `Appended ${value} to an empty list.`,
      snapshot: alone,
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

  const linkedPrev: DoublyLinkedListSnapshot = {
    ...created,
    nodes: created.nodes.map((node) =>
      node.id === newId ? { ...node, prevId: oldTailId } : node,
    ),
  }

  pushStep(steps, {
    id: 'dll-insert-end-link-prev',
    title: 'Set new.prev → old tail',
    explanation: `new.prev = oldTail so the chain can walk backward.`,
    snapshot: linkedPrev,
    phase: 'link',
    operation,
    focusId: newId,
    previousId: oldTailId,
    operand: value,
    message: 'new.prev → previous tail.',
  })

  const linkedNext: DoublyLinkedListSnapshot = {
    ...linkedPrev,
    nodes: linkedPrev.nodes.map((node) =>
      node.id === oldTailId ? { ...node, nextId: newId } : node,
    ),
  }

  pushStep(steps, {
    id: 'dll-insert-end-link-next',
    title: 'Set oldTail.next → new',
    explanation: `Connect the previous tail forward to the new node.`,
    snapshot: linkedNext,
    phase: 'link',
    operation,
    focusId: newId,
    previousId: oldTailId,
    currentId: newId,
    operand: value,
    message: 'oldTail.next → new node.',
  })

  const updated: DoublyLinkedListSnapshot = {
    ...linkedNext,
    tailId: newId,
  }

  pushStep(steps, {
    id: 'dll-insert-end-update-tail',
    title: 'Update tail',
    explanation: `Set tail to the new node. Head is unchanged.`,
    detail: formatChain(updated),
    snapshot: updated,
    phase: 'update-tail',
    operation,
    currentId: newId,
    focusId: newId,
    found: [indexOfNode(updated, newId)].filter((i) => i >= 0),
    operand: value,
    message: 'tail now points at the new node.',
  })

  pushStep(steps, {
    id: 'dll-insert-end-complete',
    title: 'Insert complete',
    explanation: `Appended ${value} in O(1) thanks to the maintained tail reference.`,
    snapshot: updated,
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

function buildSearchForTargetSteps(
  steps: VisualizationStep[],
  initial: DoublyLinkedListSnapshot,
  operation: DoublyLinkedListOperation,
  target: number,
  operand: number,
): string | null {
  if (initial.headId === null) {
    pushStep(steps, {
      id: 'dll-target-empty',
      title: 'Empty list',
      explanation: `Cannot insert relative to ${target} — the list is empty.`,
      snapshot: initial,
      phase: 'not-found',
      operation,
      nullHighlighted: true,
      success: false,
      operand,
      target,
      message: 'Empty list — relative insert skipped.',
    })
    return null
  }

  const order = snapshotNodeOrder(initial)
  let foundId: string | null = null
  let searchIndex = 0

  for (const nodeId of order) {
    const node = initial.nodes.find((n) => n.id === nodeId)!
    const matches = node.value === target

    pushStep(steps, {
      id: `dll-target-search-${searchIndex}`,
      title: matches ? `Found ${target}` : `Compare ${node.value}`,
      explanation: matches
        ? `Located the first node with value ${target}. Link updates from here are O(1).`
        : `current.value is ${node.value}, not ${target}. Continue forward.`,
      snapshot: initial,
      phase: matches ? 'find-target' : 'compare',
      operation,
      currentId: nodeId,
      compared: [indexOfNode(initial, nodeId)].filter((i) => i >= 0),
      found: matches
        ? [indexOfNode(initial, nodeId)].filter((i) => i >= 0)
        : undefined,
      operand,
      target,
      message: matches ? 'Target node located.' : 'Still searching.',
    })

    if (matches) {
      foundId = nodeId
      break
    }
    searchIndex += 1
  }

  if (foundId === null) {
    pushStep(steps, {
      id: 'dll-target-missing',
      title: 'Target not found',
      explanation: `No node with value ${target}. The list is unchanged — invalid ops must not corrupt references.`,
      snapshot: initial,
      phase: 'not-found',
      operation,
      currentId: null,
      nullHighlighted: true,
      success: false,
      operand,
      target,
      message: 'Missing target — no changes.',
    })
  }

  return foundId
}

function buildInsertBeforeSteps(
  initial: DoublyLinkedListSnapshot,
  target: number,
  value: number,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: DoublyLinkedListOperation = 'insert-before'

  pushStep(steps, {
    id: 'dll-insert-before-init',
    title: 'Prepare insert before',
    explanation: `Insert ${value} before the first node with value ${target}. Once the target is known, update four references around the splice.`,
    detail: formatChain(initial),
    snapshot: initial,
    phase: 'initialize',
    operation,
    currentId: initial.headId,
    operand: value,
    target,
    message: 'Ready to insert before a known value.',
  })

  const targetId = buildSearchForTargetSteps(
    steps,
    initial,
    operation,
    target,
    value,
  )

  if (targetId === null) {
    pushStep(steps, {
      id: 'dll-insert-before-fail-complete',
      title: 'Insert finished (no change)',
      explanation: 'Relative insert skipped; historical snapshots stay intact.',
      snapshot: initial,
      phase: 'complete',
      operation,
      success: false,
      operand: value,
      target,
      complete: true,
      message: 'No nodes were inserted.',
    })
    return steps
  }

  const targetNode = initial.nodes.find((n) => n.id === targetId)!
  const leftId = targetNode.prevId

  // Insert before head is the same as insert at beginning.
  if (leftId === null) {
    const headSteps = buildInsertBeginningSteps(initial, value)
    // Re-tag operation in explanations already done; reuse complete chain by
    // appending only the mutation steps after search (skip init of head insert).
    for (const step of headSteps.slice(1)) {
      steps.push({
        ...step,
        meta: step.meta
          ? {
              ...step.meta,
              operation,
              target,
              operand: value,
            }
          : step.meta,
      })
    }
    return steps
  }

  const leftNode = initial.nodes.find((n) => n.id === leftId)!
  const { id: newId, nextIdCounter } = allocateNodeId(initial)

  const created: DoublyLinkedListSnapshot = {
    headId: initial.headId,
    tailId: initial.tailId,
    nextIdCounter,
    nodes: [
      ...initial.nodes.map((n) => ({ ...n })),
      { id: newId, value, prevId: null, nextId: null },
    ],
  }

  pushStep(steps, {
    id: 'dll-insert-before-create',
    title: `Create node ${value}`,
    explanation: `Allocate the new node between ${leftNode.value} and ${targetNode.value}.`,
    snapshot: created,
    phase: 'create-node',
    operation,
    focusId: newId,
    currentId: targetId,
    previousId: leftId,
    operand: value,
    target,
    message: `New node [${value}] ready.`,
  })

  // Four reference updates: left.next, new.prev, new.next, target.prev
  const state: DoublyLinkedListSnapshot = {
    ...created,
    nodes: created.nodes.map((node) => {
      if (node.id === newId) {
        return { ...node, prevId: leftId, nextId: targetId }
      }
      if (node.id === leftId) {
        return { ...node, nextId: newId }
      }
      if (node.id === targetId) {
        return { ...node, prevId: newId }
      }
      return { ...node }
    }),
  }

  pushStep(steps, {
    id: 'dll-insert-before-link',
    title: 'Update four references',
    explanation: `${leftNode.value}.next = ${value}; ${value}.prev = ${leftNode.value}; ${value}.next = ${targetNode.value}; ${targetNode.value}.prev = ${value}.`,
    detail: formatChain(state),
    snapshot: state,
    phase: 'link',
    operation,
    focusId: newId,
    currentId: targetId,
    previousId: leftId,
    found: [indexOfNode(state, newId)].filter((i) => i >= 0),
    operand: value,
    target,
    message: 'All four adjacent references updated.',
  })

  pushStep(steps, {
    id: 'dll-insert-before-complete',
    title: 'Insert complete',
    explanation: `Inserted ${value} before ${target}. Finding the target was O(n); the splice was O(1).`,
    snapshot: state,
    phase: 'complete',
    operation,
    currentId: newId,
    success: true,
    operand: value,
    target,
    complete: true,
    message: 'Insert before finished.',
  })

  return steps
}

function buildInsertAfterSteps(
  initial: DoublyLinkedListSnapshot,
  target: number,
  value: number,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: DoublyLinkedListOperation = 'insert-after'

  pushStep(steps, {
    id: 'dll-insert-after-init',
    title: 'Prepare insert after',
    explanation: `Insert ${value} after the first node with value ${target}. Once the target is known, update the neighboring prev/next references.`,
    detail: formatChain(initial),
    snapshot: initial,
    phase: 'initialize',
    operation,
    currentId: initial.headId,
    operand: value,
    target,
    message: 'Ready to insert after a known value.',
  })

  const targetId = buildSearchForTargetSteps(
    steps,
    initial,
    operation,
    target,
    value,
  )

  if (targetId === null) {
    pushStep(steps, {
      id: 'dll-insert-after-fail-complete',
      title: 'Insert finished (no change)',
      explanation: 'Relative insert skipped; list unchanged.',
      snapshot: initial,
      phase: 'complete',
      operation,
      success: false,
      operand: value,
      target,
      complete: true,
      message: 'No nodes were inserted.',
    })
    return steps
  }

  const targetNode = initial.nodes.find((n) => n.id === targetId)!
  const rightId = targetNode.nextId

  if (rightId === null) {
    const endSteps = buildInsertEndSteps(initial, value)
    for (const step of endSteps.slice(1)) {
      steps.push({
        ...step,
        meta: step.meta
          ? {
              ...step.meta,
              operation,
              target,
              operand: value,
            }
          : step.meta,
      })
    }
    return steps
  }

  const rightNode = initial.nodes.find((n) => n.id === rightId)!
  const { id: newId, nextIdCounter } = allocateNodeId(initial)

  const created: DoublyLinkedListSnapshot = {
    headId: initial.headId,
    tailId: initial.tailId,
    nextIdCounter,
    nodes: [
      ...initial.nodes.map((n) => ({ ...n })),
      { id: newId, value, prevId: null, nextId: null },
    ],
  }

  pushStep(steps, {
    id: 'dll-insert-after-create',
    title: `Create node ${value}`,
    explanation: `Allocate the new node between ${targetNode.value} and ${rightNode.value}.`,
    snapshot: created,
    phase: 'create-node',
    operation,
    focusId: newId,
    currentId: targetId,
    operand: value,
    target,
    message: `New node [${value}] ready.`,
  })

  const state: DoublyLinkedListSnapshot = {
    ...created,
    nodes: created.nodes.map((node) => {
      if (node.id === newId) {
        return { ...node, prevId: targetId, nextId: rightId }
      }
      if (node.id === targetId) {
        return { ...node, nextId: newId }
      }
      if (node.id === rightId) {
        return { ...node, prevId: newId }
      }
      return { ...node }
    }),
  }

  pushStep(steps, {
    id: 'dll-insert-after-link',
    title: 'Update four references',
    explanation: `${targetNode.value}.next = ${value}; ${value}.prev = ${targetNode.value}; ${value}.next = ${rightNode.value}; ${rightNode.value}.prev = ${value}.`,
    detail: formatChain(state),
    snapshot: state,
    phase: 'link',
    operation,
    focusId: newId,
    currentId: targetId,
    found: [indexOfNode(state, newId)].filter((i) => i >= 0),
    operand: value,
    target,
    message: 'All four adjacent references updated.',
  })

  pushStep(steps, {
    id: 'dll-insert-after-complete',
    title: 'Insert complete',
    explanation: `Inserted ${value} after ${target}. Search was O(n); the splice was O(1).`,
    snapshot: state,
    phase: 'complete',
    operation,
    currentId: newId,
    success: true,
    operand: value,
    target,
    complete: true,
    message: 'Insert after finished.',
  })

  return steps
}

function buildDeleteByValueSteps(
  initial: DoublyLinkedListSnapshot,
  value: number,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: DoublyLinkedListOperation = 'delete-by-value'

  pushStep(steps, {
    id: 'dll-delete-init',
    title: 'Prepare delete by value',
    explanation: `Find the first node with value ${value}, then unlink it by updating neighboring prev/next (and head/tail if needed).`,
    detail: formatChain(initial),
    snapshot: initial,
    phase: 'initialize',
    operation,
    currentId: initial.headId,
    operand: value,
    message: 'Ready to delete by value.',
  })

  if (initial.headId === null) {
    pushStep(steps, {
      id: 'dll-delete-empty',
      title: 'Nothing to delete',
      explanation: `The list is empty, so ${value} cannot be deleted.`,
      snapshot: initial,
      phase: 'not-found',
      operation,
      nullHighlighted: true,
      success: false,
      operand: value,
      message: 'Empty list — delete skipped.',
    })
    pushStep(steps, {
      id: 'dll-delete-empty-complete',
      title: 'Delete finished (no change)',
      explanation: 'State unchanged.',
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
  let foundId: string | null = null
  let searchIndex = 0

  for (const nodeId of order) {
    const node = initial.nodes.find((n) => n.id === nodeId)!
    const matches = node.value === value

    pushStep(steps, {
      id: `dll-delete-compare-${searchIndex}`,
      title: matches ? `Found ${value}` : `Compare ${node.value}`,
      explanation: matches
        ? `Located ${value}. With prev and next known, unlinking is O(1) — no need to walk for a predecessor as in a singly list.`
        : `current.value is ${node.value}, not ${value}. Continue.`,
      snapshot: initial,
      phase: 'compare',
      operation,
      currentId: nodeId,
      compared: [indexOfNode(initial, nodeId)].filter((i) => i >= 0),
      found: matches
        ? [indexOfNode(initial, nodeId)].filter((i) => i >= 0)
        : undefined,
      operand: value,
      message: matches ? 'Target located.' : 'Keep searching.',
    })

    if (matches) {
      foundId = nodeId
      break
    }
    searchIndex += 1
  }

  if (foundId === null) {
    pushStep(steps, {
      id: 'dll-delete-not-found',
      title: 'Value not found',
      explanation: `Reached null without seeing ${value}. List unchanged.`,
      snapshot: initial,
      phase: 'not-found',
      operation,
      currentId: null,
      nullHighlighted: true,
      success: false,
      operand: value,
      message: 'Missing value — no changes.',
    })
    pushStep(steps, {
      id: 'dll-delete-not-found-complete',
      title: 'Delete finished (no change)',
      explanation: 'Invalid delete left the structure intact.',
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

  const found = initial.nodes.find((n) => n.id === foundId)!
  const leftId = found.prevId
  const rightId = found.nextId

  let after: DoublyLinkedListSnapshot = {
    headId: initial.headId,
    tailId: initial.tailId,
    nextIdCounter: initial.nextIdCounter,
    nodes: initial.nodes
      .filter((n) => n.id !== foundId)
      .map((n) => {
        if (n.id === leftId) {
          return { ...n, nextId: rightId }
        }
        if (n.id === rightId) {
          return { ...n, prevId: leftId }
        }
        return { ...n }
      }),
  }

  // Only node
  if (leftId === null && rightId === null) {
    after = { headId: null, tailId: null, nextIdCounter: initial.nextIdCounter, nodes: [] }
    pushStep(steps, {
      id: 'dll-delete-only',
      title: 'Delete the only node',
      explanation: `Removing the sole node sets head and tail to null.`,
      detail: 'null ⇄ null (empty)',
      snapshot: after,
      phase: 'unlink',
      operation,
      nullHighlighted: true,
      operand: value,
      message: 'List is now empty.',
    })
  } else if (leftId === null) {
    // Delete head
    after = { ...after, headId: rightId }
    pushStep(steps, {
      id: 'dll-delete-head',
      title: 'Unlink head',
      explanation: `Move head to the former second node and set its prev to null.`,
      detail: formatChain(after),
      snapshot: after,
      phase: 'unlink',
      operation,
      currentId: rightId,
      operand: value,
      message: 'Head updated; old head removed.',
    })
  } else if (rightId === null) {
    // Delete tail
    after = { ...after, tailId: leftId }
    pushStep(steps, {
      id: 'dll-delete-tail',
      title: 'Unlink tail',
      explanation: `Move tail to the former second-to-last node and set its next to null.`,
      detail: formatChain(after),
      snapshot: after,
      phase: 'unlink',
      operation,
      currentId: leftId,
      previousId: leftId,
      operand: value,
      message: 'Tail updated; old tail removed.',
    })
  } else {
    const leftNode = initial.nodes.find((n) => n.id === leftId)!
    const rightNode = initial.nodes.find((n) => n.id === rightId)!
    pushStep(steps, {
      id: 'dll-delete-middle',
      title: 'Unlink middle node',
      explanation: `Set ${leftNode.value}.next = ${rightNode.value} and ${rightNode.value}.prev = ${leftNode.value}. The deleted node is unreachable.`,
      detail: formatChain(after),
      snapshot: after,
      phase: 'unlink',
      operation,
      previousId: leftId,
      currentId: rightId,
      focusId: leftId,
      operand: value,
      message: 'Neighbors reconnected around the deleted node.',
    })
  }

  pushStep(steps, {
    id: 'dll-delete-complete',
    title: 'Delete complete',
    explanation: `Removed the first ${value}. Finding it took O(n); unlinking a known node is O(1).`,
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
 * Build visualization steps for a doubly linked list operation.
 *
 * @param values - Initial list values (head → tail).
 * @param operation - Operation to demonstrate.
 * @param operand - New value (insert) or value to delete.
 * @param target - Selected node value for insert-before / insert-after.
 */
export function buildDoublyLinkedListSteps(
  values: readonly number[],
  operation: DoublyLinkedListOperation,
  operand?: number,
  target?: number,
): VisualizationStep[] {
  const initial = snapshotFromArray(values)

  const needsOperand =
    operation === 'insert-beginning' ||
    operation === 'insert-end' ||
    operation === 'insert-before' ||
    operation === 'insert-after' ||
    operation === 'delete-by-value'

  const needsTarget =
    operation === 'insert-before' || operation === 'insert-after'

  if (needsOperand && !isValidOperand(operand)) {
    const steps: VisualizationStep[] = []
    pushStep(steps, {
      id: 'dll-invalid-operand',
      title: 'Invalid input',
      explanation:
        'Enter a finite number for the value. The list was not modified.',
      snapshot: initial,
      phase: 'invalid',
      operation,
      currentId: initial.headId,
      success: false,
      message: 'Operand missing or not a finite number.',
    })
    pushStep(steps, {
      id: 'dll-invalid-complete',
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

  if (needsTarget && !isValidOperand(target)) {
    const steps: VisualizationStep[] = []
    pushStep(steps, {
      id: 'dll-invalid-target',
      title: 'Invalid target',
      explanation:
        'Enter a finite target value (the selected node). The list was not modified.',
      snapshot: initial,
      phase: 'invalid',
      operation,
      currentId: initial.headId,
      success: false,
      operand: operand ?? null,
      message: 'Target missing or not a finite number.',
    })
    pushStep(steps, {
      id: 'dll-invalid-target-complete',
      title: 'Waiting for valid input',
      explanation: 'Fix the target input, then run the operation again.',
      snapshot: initial,
      phase: 'complete',
      operation,
      success: false,
      operand: operand ?? null,
      complete: true,
      message: 'No changes applied.',
    })
    return steps
  }

  switch (operation) {
    case 'traverse-forward':
      return buildTraverseForwardSteps(initial)
    case 'traverse-backward':
      return buildTraverseBackwardSteps(initial)
    case 'insert-beginning':
      return buildInsertBeginningSteps(initial, operand!)
    case 'insert-end':
      return buildInsertEndSteps(initial, operand!)
    case 'insert-before':
      return buildInsertBeforeSteps(initial, target!, operand!)
    case 'insert-after':
      return buildInsertAfterSteps(initial, target!, operand!)
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
