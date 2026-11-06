/**
 * AVL Tree — self-balancing binary search tree.
 *
 * Ordering: left < node < right. Duplicate insertions are ignored.
 * Balance factor = height(left) − height(right).
 * Empty subtree height = −1, leaf height = 0.
 * Valid balance factors: −1, 0, or 1.
 *
 * Mutating helpers return new immutable snapshots so visualization history
 * stays scrub-safe. Independent of React.
 */

/** Flat, JSON-friendly AVL node for visualization frames. */
export type AVLNodeSnapshot = {
  readonly id: string
  readonly value: number
  readonly leftId: string | null
  readonly rightId: string | null
  /** Height in edges; leaf = 0. */
  readonly height: number
}

/**
 * Immutable AVL snapshot.
 * Each historical step owns its own node array so scrubbing prev/next
 * cannot rewrite earlier frames.
 */
export type AVLTreeSnapshot = {
  readonly rootId: string | null
  readonly nodes: readonly AVLNodeSnapshot[]
  /** Monotonic counter used when allocating new node ids. */
  readonly nextIdCounter: number
}

export type AVLRotationKind = 'LL' | 'RR' | 'LR' | 'RL' | 'L' | 'R'

export type RotationResult = {
  readonly snapshot: AVLTreeSnapshot
  /** New root of the rotated subtree. */
  readonly newRootId: string
  readonly rotation: AVLRotationKind
  /** Pivot that was rotated (unbalanced node for single rotations). */
  readonly pivotId: string
  /** Child that moved into the pivot’s place (for teaching highlights). */
  readonly risingId: string
}

/** Default lesson sequence — inserting 10 triggers LL → right rotation. */
export const AVL_DEFAULT_VALUES = [30, 20, 10] as const

/** After the default sequence (and LL fix), the tree is 20 / 10 / 30. */
export const AVL_DEFAULT_BALANCED_VALUES = [20, 10, 30] as const

/** RR demo: insert 10, 20, 30 → left rotation at 10. */
export const AVL_RR_SEQUENCE = [10, 20, 30] as const

/** LR demo: insert 30, 10, 20 → left on 10, then right on 30. */
export const AVL_LR_SEQUENCE = [30, 10, 20] as const

/** RL demo: insert 10, 30, 20 → right on 30, then left on 10. */
export const AVL_RL_SEQUENCE = [10, 30, 20] as const

/** Larger playground tree that stays balanced under AVL rules. */
export const AVL_PLAYGROUND_VALUES = [40, 20, 60, 10, 30, 50, 70] as const

export const AVL_SINGLE_VALUE = [42] as const

export const AVL_ARRAY_PRESETS = [
  {
    id: 'lesson-default',
    label: 'Lesson: 30 → 20 → 10 (LL)',
    values: AVL_DEFAULT_VALUES,
  },
  {
    id: 'rr-demo',
    label: 'RR: 10 → 20 → 30',
    values: AVL_RR_SEQUENCE,
  },
  {
    id: 'lr-demo',
    label: 'LR: 30 → 10 → 20',
    values: AVL_LR_SEQUENCE,
  },
  {
    id: 'rl-demo',
    label: 'RL: 10 → 30 → 20',
    values: AVL_RL_SEQUENCE,
  },
  {
    id: 'balanced',
    label: 'Balanced seven',
    values: AVL_PLAYGROUND_VALUES,
  },
  {
    id: 'single',
    label: 'Single node',
    values: AVL_SINGLE_VALUE,
  },
  {
    id: 'empty',
    label: 'Empty tree',
    values: [] as const,
  },
] as const

/** Empty tree snapshot. */
export function createEmpty(): AVLTreeSnapshot {
  return { rootId: null, nodes: [], nextIdCounter: 0 }
}

/** Deep-clone so later frames cannot rewrite history. */
export function cloneSnapshot(snapshot: AVLTreeSnapshot): AVLTreeSnapshot {
  return {
    rootId: snapshot.rootId,
    nextIdCounter: snapshot.nextIdCounter,
    nodes: snapshot.nodes.map((node) => ({
      id: node.id,
      value: node.value,
      leftId: node.leftId,
      rightId: node.rightId,
      height: node.height,
    })),
  }
}

/** Allocate the next stable node id (`n0`, `n1`, …). */
export function allocateNodeId(
  snapshot: AVLTreeSnapshot,
): { id: string; nextIdCounter: number } {
  return {
    id: `n${snapshot.nextIdCounter}`,
    nextIdCounter: snapshot.nextIdCounter + 1,
  }
}

function nodeMap(snapshot: AVLTreeSnapshot): Map<string, AVLNodeSnapshot> {
  return new Map(snapshot.nodes.map((node) => [node.id, node]))
}

function getNode(
  snapshot: AVLTreeSnapshot,
  id: string | null,
): AVLNodeSnapshot | null {
  if (id === null) {
    return null
  }
  return nodeMap(snapshot).get(id) ?? null
}

/** Height of a subtree root id; null → −1. Uses stored height when present. */
export function nodeHeight(
  snapshot: AVLTreeSnapshot,
  id: string | null,
): number {
  if (id === null) {
    return -1
  }
  const node = getNode(snapshot, id)
  return node ? node.height : -1
}

/**
 * Balance factor = height(left) − height(right).
 * Missing / null node → 0.
 */
export function balanceFactor(
  snapshot: AVLTreeSnapshot,
  nodeId: string | null,
): number {
  const node = getNode(snapshot, nodeId)
  if (!node) {
    return 0
  }
  return nodeHeight(snapshot, node.leftId) - nodeHeight(snapshot, node.rightId)
}

function replaceNode(
  snapshot: AVLTreeSnapshot,
  updated: AVLNodeSnapshot,
): AVLTreeSnapshot {
  return {
    ...snapshot,
    nodes: snapshot.nodes.map((node) =>
      node.id === updated.id ? updated : node,
    ),
  }
}

function withNodes(
  snapshot: AVLTreeSnapshot,
  nodes: readonly AVLNodeSnapshot[],
  rootId: string | null = snapshot.rootId,
): AVLTreeSnapshot {
  return {
    rootId,
    nextIdCounter: snapshot.nextIdCounter,
    nodes: nodes.map((node) => ({ ...node })),
  }
}

/** Recompute and store height for one node from its children’s heights. */
export function updateHeight(
  snapshot: AVLTreeSnapshot,
  nodeId: string,
): AVLTreeSnapshot {
  const node = getNode(snapshot, nodeId)
  if (!node) {
    return snapshot
  }
  const height =
    1 +
    Math.max(
      nodeHeight(snapshot, node.leftId),
      nodeHeight(snapshot, node.rightId),
    )
  if (node.height === height) {
    return snapshot
  }
  return replaceNode(snapshot, { ...node, height })
}

function setChild(
  snapshot: AVLTreeSnapshot,
  parentId: string,
  side: 'left' | 'right',
  childId: string | null,
): AVLTreeSnapshot {
  const parent = getNode(snapshot, parentId)
  if (!parent) {
    return snapshot
  }
  const updated: AVLNodeSnapshot =
    side === 'left'
      ? { ...parent, leftId: childId }
      : { ...parent, rightId: childId }
  return replaceNode(snapshot, updated)
}

/**
 * Right rotation around `y` (LL fix when used alone).
 *
 * ```
 *      y              x
 *     / \            / \
 *    x   C   =>     A   y
 *   / \                / \
 *  A   B              B   C
 * ```
 */
export function rotateRight(
  snapshot: AVLTreeSnapshot,
  yId: string,
): RotationResult | null {
  const y = getNode(snapshot, yId)
  if (!y || y.leftId === null) {
    return null
  }
  const x = getNode(snapshot, y.leftId)
  if (!x) {
    return null
  }

  const bId = x.rightId
  let next = setChild(snapshot, x.id, 'right', yId)
  next = setChild(next, yId, 'left', bId)
  next = updateHeight(next, yId)
  next = updateHeight(next, x.id)

  return {
    snapshot: next,
    newRootId: x.id,
    rotation: 'R',
    pivotId: yId,
    risingId: x.id,
  }
}

/**
 * Left rotation around `x` (RR fix when used alone).
 *
 * ```
 *    x                  y
 *   / \                / \
 *  A   y      =>      x   C
 *     / \            / \
 *    B   C          A   B
 * ```
 */
export function rotateLeft(
  snapshot: AVLTreeSnapshot,
  xId: string,
): RotationResult | null {
  const x = getNode(snapshot, xId)
  if (!x || x.rightId === null) {
    return null
  }
  const y = getNode(snapshot, x.rightId)
  if (!y) {
    return null
  }

  const bId = y.leftId
  let next = setChild(snapshot, y.id, 'left', xId)
  next = setChild(next, xId, 'right', bId)
  next = updateHeight(next, xId)
  next = updateHeight(next, y.id)

  return {
    snapshot: next,
    newRootId: y.id,
    rotation: 'L',
    pivotId: xId,
    risingId: y.id,
  }
}

export type RebalanceResult = {
  readonly snapshot: AVLTreeSnapshot
  readonly newRootId: string
  /** High-level case when a rotation occurred; null if already balanced. */
  readonly caseKind: 'LL' | 'RR' | 'LR' | 'RL' | null
  readonly rotations: readonly RotationResult[]
}

/**
 * Rebalance a single subtree root if |BF| > 1.
 * Double rotations expose both single-rotation results in `rotations`.
 */
export function rebalanceNode(
  snapshot: AVLTreeSnapshot,
  nodeId: string,
): RebalanceResult {
  let current = updateHeight(snapshot, nodeId)
  const bf = balanceFactor(current, nodeId)
  const node = getNode(current, nodeId)
  if (!node) {
    return {
      snapshot: current,
      newRootId: nodeId,
      caseKind: null,
      rotations: [],
    }
  }

  // Left heavy
  if (bf > 1 && node.leftId) {
    const leftBf = balanceFactor(current, node.leftId)
    const rotations: RotationResult[] = []

    if (leftBf < 0) {
      // LR: left-rotate left child, then right-rotate node
      const first = rotateLeft(current, node.leftId)
      if (!first) {
        return {
          snapshot: current,
          newRootId: nodeId,
          caseKind: null,
          rotations: [],
        }
      }
      rotations.push({ ...first, rotation: 'L' })
      current = setChild(first.snapshot, nodeId, 'left', first.newRootId)
      current = updateHeight(current, nodeId)

      const second = rotateRight(current, nodeId)
      if (!second) {
        return {
          snapshot: current,
          newRootId: nodeId,
          caseKind: 'LR',
          rotations,
        }
      }
      rotations.push({ ...second, rotation: 'R' })
      return {
        snapshot: second.snapshot,
        newRootId: second.newRootId,
        caseKind: 'LR',
        rotations,
      }
    }

    // LL
    const rotated = rotateRight(current, nodeId)
    if (!rotated) {
      return {
        snapshot: current,
        newRootId: nodeId,
        caseKind: null,
        rotations: [],
      }
    }
    return {
      snapshot: rotated.snapshot,
      newRootId: rotated.newRootId,
      caseKind: 'LL',
      rotations: [{ ...rotated, rotation: 'R' }],
    }
  }

  // Right heavy
  if (bf < -1 && node.rightId) {
    const rightBf = balanceFactor(current, node.rightId)
    const rotations: RotationResult[] = []

    if (rightBf > 0) {
      // RL: right-rotate right child, then left-rotate node
      const first = rotateRight(current, node.rightId)
      if (!first) {
        return {
          snapshot: current,
          newRootId: nodeId,
          caseKind: null,
          rotations: [],
        }
      }
      rotations.push({ ...first, rotation: 'R' })
      current = setChild(first.snapshot, nodeId, 'right', first.newRootId)
      current = updateHeight(current, nodeId)

      const second = rotateLeft(current, nodeId)
      if (!second) {
        return {
          snapshot: current,
          newRootId: nodeId,
          caseKind: 'RL',
          rotations,
        }
      }
      rotations.push({ ...second, rotation: 'L' })
      return {
        snapshot: second.snapshot,
        newRootId: second.newRootId,
        caseKind: 'RL',
        rotations,
      }
    }

    // RR
    const rotated = rotateLeft(current, nodeId)
    if (!rotated) {
      return {
        snapshot: current,
        newRootId: nodeId,
        caseKind: null,
        rotations: [],
      }
    }
    return {
      snapshot: rotated.snapshot,
      newRootId: rotated.newRootId,
      caseKind: 'RR',
      rotations: [{ ...rotated, rotation: 'L' }],
    }
  }

  return {
    snapshot: current,
    newRootId: nodeId,
    caseKind: null,
    rotations: [],
  }
}

/**
 * Build a snapshot by inserting values left-to-right with stable ids.
 * Duplicates in the input are skipped (same policy as insert).
 */
export function snapshotFromArray(
  values: readonly number[],
): AVLTreeSnapshot {
  let snapshot = createEmpty()
  for (const value of values) {
    snapshot = insert(snapshot, value).snapshot
  }
  return snapshot
}

/** Inorder values (sorted ascending for a valid AVL BST). Empty → []. */
export function toArray(snapshot: AVLTreeSnapshot): number[] {
  return inorderTraversal(snapshot)
}

export function isEmpty(snapshot: AVLTreeSnapshot): boolean {
  return snapshot.rootId === null || snapshot.nodes.length === 0
}

export function clear(_snapshot: AVLTreeSnapshot): AVLTreeSnapshot {
  return createEmpty()
}

export type InsertResult = {
  readonly snapshot: AVLTreeSnapshot
  /** False when the value already existed (duplicate ignored). */
  readonly inserted: boolean
  readonly nodeId: string | null
}

type InsertRecResult = {
  snapshot: AVLTreeSnapshot
  newRootId: string | null
  inserted: boolean
  nodeId: string | null
}

function insertRec(
  snapshot: AVLTreeSnapshot,
  nodeId: string | null,
  value: number,
): InsertRecResult {
  if (nodeId === null) {
    const { id, nextIdCounter } = allocateNodeId(snapshot)
    const node: AVLNodeSnapshot = {
      id,
      value,
      leftId: null,
      rightId: null,
      height: 0,
    }
    return {
      snapshot: {
        rootId: snapshot.rootId,
        nextIdCounter,
        nodes: [...snapshot.nodes, node],
      },
      newRootId: id,
      inserted: true,
      nodeId: id,
    }
  }

  const node = getNode(snapshot, nodeId)
  if (!node) {
    return {
      snapshot,
      newRootId: nodeId,
      inserted: false,
      nodeId: null,
    }
  }

  if (value === node.value) {
    return {
      snapshot,
      newRootId: nodeId,
      inserted: false,
      nodeId: node.id,
    }
  }

  if (value < node.value) {
    const child = insertRec(snapshot, node.leftId, value)
    if (!child.inserted) {
      return {
        snapshot: child.snapshot,
        newRootId: nodeId,
        inserted: false,
        nodeId: child.nodeId,
      }
    }
    let next = setChild(child.snapshot, nodeId, 'left', child.newRootId)
    const balanced = rebalanceNode(next, nodeId)
    return {
      snapshot: balanced.snapshot,
      newRootId: balanced.newRootId,
      inserted: true,
      nodeId: child.nodeId,
    }
  }

  const child = insertRec(snapshot, node.rightId, value)
  if (!child.inserted) {
    return {
      snapshot: child.snapshot,
      newRootId: nodeId,
      inserted: false,
      nodeId: child.nodeId,
    }
  }
  let next = setChild(child.snapshot, nodeId, 'right', child.newRootId)
  const balanced = rebalanceNode(next, nodeId)
  return {
    snapshot: balanced.snapshot,
    newRootId: balanced.newRootId,
    inserted: true,
    nodeId: child.nodeId,
  }
}

/**
 * Insert a value with AVL rebalancing after BST placement.
 * Equal values are ignored; the tree is unchanged.
 */
export function insert(
  snapshot: AVLTreeSnapshot,
  value: number,
): InsertResult {
  if (!Number.isFinite(value)) {
    return { snapshot, inserted: false, nodeId: null }
  }

  if (snapshot.rootId === null) {
    const { id, nextIdCounter } = allocateNodeId(snapshot)
    const node: AVLNodeSnapshot = {
      id,
      value,
      leftId: null,
      rightId: null,
      height: 0,
    }
    return {
      snapshot: { rootId: id, nodes: [node], nextIdCounter },
      inserted: true,
      nodeId: id,
    }
  }

  const result = insertRec(snapshot, snapshot.rootId, value)
  if (!result.inserted) {
    return {
      snapshot,
      inserted: false,
      nodeId: result.nodeId,
    }
  }
  return {
    snapshot: {
      ...result.snapshot,
      rootId: result.newRootId,
    },
    inserted: true,
    nodeId: result.nodeId,
  }
}

/**
 * Place a value with BST rules only — no height updates or rotations.
 * Used by the step generator so learners see imbalance before fixing it.
 */
export function insertUnbalanced(
  snapshot: AVLTreeSnapshot,
  value: number,
): InsertResult {
  if (!Number.isFinite(value)) {
    return { snapshot, inserted: false, nodeId: null }
  }

  if (snapshot.rootId === null) {
    const { id, nextIdCounter } = allocateNodeId(snapshot)
    const node: AVLNodeSnapshot = {
      id,
      value,
      leftId: null,
      rightId: null,
      height: 0,
    }
    return {
      snapshot: { rootId: id, nodes: [node], nextIdCounter },
      inserted: true,
      nodeId: id,
    }
  }

  const byId = nodeMap(snapshot)
  let currentId: string | null = snapshot.rootId
  let parentId: string | null = null
  let wentLeft = false

  while (currentId !== null) {
    const current = byId.get(currentId)
    if (!current) {
      break
    }
    if (value === current.value) {
      return { snapshot, inserted: false, nodeId: current.id }
    }
    parentId = currentId
    if (value < current.value) {
      wentLeft = true
      currentId = current.leftId
    } else {
      wentLeft = false
      currentId = current.rightId
    }
  }

  if (parentId === null) {
    return { snapshot, inserted: false, nodeId: null }
  }

  const { id, nextIdCounter } = allocateNodeId(snapshot)
  const newNode: AVLNodeSnapshot = {
    id,
    value,
    leftId: null,
    rightId: null,
    height: 0,
  }

  const nodes = snapshot.nodes.map((node) => {
    if (node.id !== parentId) {
      return node
    }
    return wentLeft
      ? { ...node, leftId: id }
      : { ...node, rightId: id }
  })

  return {
    snapshot: {
      rootId: snapshot.rootId,
      nodes: [...nodes, newNode],
      nextIdCounter,
    },
    inserted: true,
    nodeId: id,
  }
}

/**
 * Refresh heights along a path from a node up to the root (inclusive),
 * bottom-up. Path should be root → … → start (we reverse internally).
 */
export function updateHeightsAlongPath(
  snapshot: AVLTreeSnapshot,
  pathFromRoot: readonly string[],
): AVLTreeSnapshot {
  let current = snapshot
  for (let i = pathFromRoot.length - 1; i >= 0; i -= 1) {
    const id = pathFromRoot[i]
    if (id) {
      current = updateHeight(current, id)
    }
  }
  return current
}

/** Ancestor chain from root to `nodeId` (inclusive), or [] if missing. */
export function pathToNode(
  snapshot: AVLTreeSnapshot,
  nodeId: string,
): string[] {
  if (snapshot.rootId === null) {
    return []
  }

  const byId = nodeMap(snapshot)
  const path: string[] = []
  let currentId: string | null = snapshot.rootId

  while (currentId !== null) {
    path.push(currentId)
    if (currentId === nodeId) {
      return path
    }
    const current = byId.get(currentId)
    if (!current) {
      return []
    }
    const target = byId.get(nodeId)
    if (!target) {
      return []
    }
    currentId =
      target.value < current.value ? current.leftId : current.rightId
  }

  return []
}

export type SearchResult = {
  readonly found: boolean
  readonly nodeId: string | null
  /** Node ids visited from root toward the target (includes match or last miss). */
  readonly pathIds: readonly string[]
}

/** Search for a value; returns path from root. */
export function search(
  snapshot: AVLTreeSnapshot,
  value: number,
): SearchResult {
  if (!Number.isFinite(value) || snapshot.rootId === null) {
    return { found: false, nodeId: null, pathIds: [] }
  }

  const byId = nodeMap(snapshot)
  const pathIds: string[] = []
  let currentId: string | null = snapshot.rootId

  while (currentId !== null) {
    const current = byId.get(currentId)
    if (!current) {
      break
    }
    pathIds.push(current.id)
    if (value === current.value) {
      return { found: true, nodeId: current.id, pathIds }
    }
    currentId = value < current.value ? current.leftId : current.rightId
  }

  return { found: false, nodeId: null, pathIds }
}

export type DeleteResult = {
  readonly snapshot: AVLTreeSnapshot
  readonly deleted: boolean
  /** Which structural case applied, when deleted. */
  readonly caseKind: 'leaf' | 'one-child' | 'two-children' | null
}

function findMinNode(
  snapshot: AVLTreeSnapshot,
  startId: string,
): AVLNodeSnapshot | null {
  const byId = nodeMap(snapshot)
  let current = byId.get(startId) ?? null
  while (current?.leftId) {
    current = byId.get(current.leftId) ?? null
  }
  return current
}

function findParentId(
  snapshot: AVLTreeSnapshot,
  childId: string,
): string | null {
  for (const node of snapshot.nodes) {
    if (node.leftId === childId || node.rightId === childId) {
      return node.id
    }
  }
  return null
}

function removeNodeById(
  nodes: readonly AVLNodeSnapshot[],
  nodeId: string,
): AVLNodeSnapshot[] {
  return nodes.filter((node) => node.id !== nodeId).map((node) => ({ ...node }))
}

type DeleteRecResult = {
  snapshot: AVLTreeSnapshot
  newRootId: string | null
  deleted: boolean
  caseKind: 'leaf' | 'one-child' | 'two-children' | null
}

function deleteRec(
  snapshot: AVLTreeSnapshot,
  nodeId: string | null,
  value: number,
): DeleteRecResult {
  if (nodeId === null) {
    return {
      snapshot,
      newRootId: null,
      deleted: false,
      caseKind: null,
    }
  }

  const node = getNode(snapshot, nodeId)
  if (!node) {
    return {
      snapshot,
      newRootId: nodeId,
      deleted: false,
      caseKind: null,
    }
  }

  if (value < node.value) {
    const child = deleteRec(snapshot, node.leftId, value)
    if (!child.deleted) {
      return {
        snapshot: child.snapshot,
        newRootId: nodeId,
        deleted: false,
        caseKind: null,
      }
    }
    let next = setChild(child.snapshot, nodeId, 'left', child.newRootId)
    const balanced = rebalanceNode(next, nodeId)
    return {
      snapshot: balanced.snapshot,
      newRootId: balanced.newRootId,
      deleted: true,
      caseKind: child.caseKind,
    }
  }

  if (value > node.value) {
    const child = deleteRec(snapshot, node.rightId, value)
    if (!child.deleted) {
      return {
        snapshot: child.snapshot,
        newRootId: nodeId,
        deleted: false,
        caseKind: null,
      }
    }
    let next = setChild(child.snapshot, nodeId, 'right', child.newRootId)
    const balanced = rebalanceNode(next, nodeId)
    return {
      snapshot: balanced.snapshot,
      newRootId: balanced.newRootId,
      deleted: true,
      caseKind: child.caseKind,
    }
  }

  // Found the node to delete
  if (node.leftId === null && node.rightId === null) {
    return {
      snapshot: withNodes(
        snapshot,
        removeNodeById(snapshot.nodes, nodeId),
        snapshot.rootId,
      ),
      newRootId: null,
      deleted: true,
      caseKind: 'leaf',
    }
  }

  if (node.leftId === null || node.rightId === null) {
    const childId = node.leftId ?? node.rightId
    return {
      snapshot: withNodes(
        snapshot,
        removeNodeById(snapshot.nodes, nodeId),
        snapshot.rootId,
      ),
      newRootId: childId,
      deleted: true,
      caseKind: 'one-child',
    }
  }

  // Two children: copy inorder successor, then delete successor
  const successor = findMinNode(snapshot, node.rightId)
  if (!successor) {
    return {
      snapshot,
      newRootId: nodeId,
      deleted: false,
      caseKind: null,
    }
  }

  const withValue = replaceNode(snapshot, {
    ...node,
    value: successor.value,
  })
  const removed = deleteRec(withValue, node.rightId, successor.value)
  let next = setChild(removed.snapshot, nodeId, 'right', removed.newRootId)
  // Refresh the (same-id) node after right-subtree deletion
  const balanced = rebalanceNode(next, nodeId)
  return {
    snapshot: balanced.snapshot,
    newRootId: balanced.newRootId,
    deleted: true,
    caseKind: 'two-children',
  }
}

/**
 * Delete a value with AVL rebalancing on the way back to the root.
 */
export function deleteValue(
  snapshot: AVLTreeSnapshot,
  value: number,
): DeleteResult {
  if (!Number.isFinite(value) || snapshot.rootId === null) {
    return { snapshot, deleted: false, caseKind: null }
  }

  const result = deleteRec(snapshot, snapshot.rootId, value)
  if (!result.deleted) {
    return { snapshot, deleted: false, caseKind: null }
  }

  return {
    snapshot: {
      ...result.snapshot,
      rootId: result.newRootId,
    },
    deleted: true,
    caseKind: result.caseKind,
  }
}

/**
 * Structural BST delete without rebalancing — for step-by-step visualization.
 * Heights are left stale until the step generator updates them.
 */
export function deleteUnbalanced(
  snapshot: AVLTreeSnapshot,
  value: number,
): DeleteResult {
  if (!Number.isFinite(value) || snapshot.rootId === null) {
    return { snapshot, deleted: false, caseKind: null }
  }

  const found = search(snapshot, value)
  if (!found.found || found.nodeId === null) {
    return { snapshot, deleted: false, caseKind: null }
  }

  const byId = nodeMap(snapshot)
  const target = byId.get(found.nodeId)
  if (!target) {
    return { snapshot, deleted: false, caseKind: null }
  }

  const parentId = findParentId(snapshot, target.id)
  const leftId = target.leftId
  const rightId = target.rightId

  const replaceChildLink = (
    nodes: readonly AVLNodeSnapshot[],
    oldChildId: string,
    newChildId: string | null,
    rootId: string | null,
  ): { nodes: AVLNodeSnapshot[]; rootId: string | null } => {
    if (parentId === null) {
      return { nodes: [...nodes], rootId: newChildId }
    }
    return {
      rootId,
      nodes: nodes.map((node) => {
        if (node.id !== parentId) {
          return { ...node }
        }
        if (node.leftId === oldChildId) {
          return { ...node, leftId: newChildId }
        }
        if (node.rightId === oldChildId) {
          return { ...node, rightId: newChildId }
        }
        return { ...node }
      }),
    }
  }

  if (leftId === null && rightId === null) {
    const linked = replaceChildLink(
      snapshot.nodes,
      target.id,
      null,
      snapshot.rootId,
    )
    return {
      snapshot: {
        rootId: linked.rootId,
        nodes: removeNodeById(linked.nodes, target.id),
        nextIdCounter: snapshot.nextIdCounter,
      },
      deleted: true,
      caseKind: 'leaf',
    }
  }

  if (leftId === null || rightId === null) {
    const childId = leftId ?? rightId
    const linked = replaceChildLink(
      snapshot.nodes,
      target.id,
      childId,
      snapshot.rootId,
    )
    return {
      snapshot: {
        rootId: linked.rootId,
        nodes: removeNodeById(linked.nodes, target.id),
        nextIdCounter: snapshot.nextIdCounter,
      },
      deleted: true,
      caseKind: 'one-child',
    }
  }

  const successor = findMinNode(snapshot, rightId)
  if (!successor) {
    return { snapshot, deleted: false, caseKind: null }
  }

  const withReplacedValue: AVLTreeSnapshot = {
    rootId: snapshot.rootId,
    nextIdCounter: snapshot.nextIdCounter,
    nodes: snapshot.nodes.map((node) =>
      node.id === target.id ? { ...node, value: successor.value } : { ...node },
    ),
  }

  const successorParentId = findParentId(withReplacedValue, successor.id)
  const successorChildId = successor.rightId

  let nodes: AVLNodeSnapshot[]
  let rootId = withReplacedValue.rootId
  if (successorParentId === null) {
    nodes = [...withReplacedValue.nodes]
    rootId = successorChildId
  } else {
    nodes = withReplacedValue.nodes.map((node) => {
      if (node.id !== successorParentId) {
        return { ...node }
      }
      if (node.leftId === successor.id) {
        return { ...node, leftId: successorChildId }
      }
      if (node.rightId === successor.id) {
        return { ...node, rightId: successorChildId }
      }
      return { ...node }
    })
  }

  return {
    snapshot: {
      rootId,
      nodes: removeNodeById(nodes, successor.id),
      nextIdCounter: snapshot.nextIdCounter,
    },
    deleted: true,
    caseKind: 'two-children',
  }
}

/** Wire a rotated subtree root into its parent (or as tree root). */
export function replaceSubtreeRoot(
  snapshot: AVLTreeSnapshot,
  oldRootId: string,
  newRootId: string,
): AVLTreeSnapshot {
  if (snapshot.rootId === oldRootId) {
    return { ...snapshot, rootId: newRootId }
  }
  const parentId = findParentId(snapshot, oldRootId)
  if (!parentId) {
    return { ...snapshot, rootId: newRootId }
  }
  const parent = getNode(snapshot, parentId)
  if (!parent) {
    return snapshot
  }
  if (parent.leftId === oldRootId) {
    return setChild(snapshot, parentId, 'left', newRootId)
  }
  if (parent.rightId === oldRootId) {
    return setChild(snapshot, parentId, 'right', newRootId)
  }
  return snapshot
}

/** Inorder: Left → Root → Right. */
export function inorderTraversal(snapshot: AVLTreeSnapshot): number[] {
  const byId = nodeMap(snapshot)
  const values: number[] = []

  function visit(id: string | null) {
    if (id === null) {
      return
    }
    const node = byId.get(id)
    if (!node) {
      return
    }
    visit(node.leftId)
    values.push(node.value)
    visit(node.rightId)
  }

  visit(snapshot.rootId)
  return values
}

/** Preorder: Root → Left → Right. */
export function preorderTraversal(snapshot: AVLTreeSnapshot): number[] {
  const byId = nodeMap(snapshot)
  const values: number[] = []

  function visit(id: string | null) {
    if (id === null) {
      return
    }
    const node = byId.get(id)
    if (!node) {
      return
    }
    values.push(node.value)
    visit(node.leftId)
    visit(node.rightId)
  }

  visit(snapshot.rootId)
  return values
}

/** Postorder: Left → Right → Root. */
export function postorderTraversal(snapshot: AVLTreeSnapshot): number[] {
  const byId = nodeMap(snapshot)
  const values: number[] = []

  function visit(id: string | null) {
    if (id === null) {
      return
    }
    const node = byId.get(id)
    if (!node) {
      return
    }
    visit(node.leftId)
    visit(node.rightId)
    values.push(node.value)
  }

  visit(snapshot.rootId)
  return values
}

/** Level-order (breadth-first) traversal. */
export function levelOrderTraversal(snapshot: AVLTreeSnapshot): number[] {
  if (snapshot.rootId === null) {
    return []
  }

  const byId = nodeMap(snapshot)
  const values: number[] = []
  const queue: string[] = [snapshot.rootId]

  while (queue.length > 0) {
    const id = queue.shift()
    if (!id) {
      continue
    }
    const node = byId.get(id)
    if (!node) {
      continue
    }
    values.push(node.value)
    if (node.leftId) {
      queue.push(node.leftId)
    }
    if (node.rightId) {
      queue.push(node.rightId)
    }
  }

  return values
}

export type MinMaxResult = {
  readonly value: number | null
  readonly nodeId: string | null
}

/** Minimum value = leftmost node. Empty → null. */
export function findMin(snapshot: AVLTreeSnapshot): MinMaxResult {
  if (snapshot.rootId === null) {
    return { value: null, nodeId: null }
  }
  const node = findMinNode(snapshot, snapshot.rootId)
  return node
    ? { value: node.value, nodeId: node.id }
    : { value: null, nodeId: null }
}

/** Maximum value = rightmost node. Empty → null. */
export function findMax(snapshot: AVLTreeSnapshot): MinMaxResult {
  if (snapshot.rootId === null) {
    return { value: null, nodeId: null }
  }
  const byId = nodeMap(snapshot)
  let current = byId.get(snapshot.rootId) ?? null
  while (current?.rightId) {
    current = byId.get(current.rightId) ?? null
  }
  return current
    ? { value: current.value, nodeId: current.id }
    : { value: null, nodeId: null }
}

/**
 * Height in edges. Empty tree → −1. Leaf → 0.
 * Uses the stored root height when the tree is non-empty.
 */
export function height(snapshot: AVLTreeSnapshot): number {
  return nodeHeight(snapshot, snapshot.rootId)
}

/** Number of stored nodes. */
export function size(snapshot: AVLTreeSnapshot): number {
  return snapshot.nodes.length
}

/** True when every node has balance factor in {−1, 0, 1}. */
export function isBalanced(snapshot: AVLTreeSnapshot): boolean {
  for (const node of snapshot.nodes) {
    const bf = balanceFactor(snapshot, node.id)
    if (bf < -1 || bf > 1) {
      return false
    }
  }
  return true
}

/** Compact text form for previews, e.g. `[10, 20, 30]`. */
export function formatTree(snapshot: AVLTreeSnapshot): string {
  if (isEmpty(snapshot)) {
    return '[]'
  }
  return `[${toArray(snapshot).join(', ')}]`
}

/**
 * Structural + BST + AVL checks for tests.
 */
export function assertInvariants(snapshot: AVLTreeSnapshot): void {
  const ids = new Set<string>()
  for (const node of snapshot.nodes) {
    if (ids.has(node.id)) {
      throw new Error(`Duplicate node id: ${node.id}`)
    }
    ids.add(node.id)
  }

  if (snapshot.rootId === null) {
    if (snapshot.nodes.length !== 0) {
      throw new Error('Empty root but non-empty nodes')
    }
    return
  }

  if (!ids.has(snapshot.rootId)) {
    throw new Error(`Root id ${snapshot.rootId} missing from nodes`)
  }

  for (const node of snapshot.nodes) {
    if (node.leftId !== null && !ids.has(node.leftId)) {
      throw new Error(`Left child ${node.leftId} missing`)
    }
    if (node.rightId !== null && !ids.has(node.rightId)) {
      throw new Error(`Right child ${node.rightId} missing`)
    }

    const expectedHeight =
      1 +
      Math.max(
        nodeHeight(snapshot, node.leftId),
        nodeHeight(snapshot, node.rightId),
      )
    if (node.height !== expectedHeight) {
      throw new Error(
        `Height mismatch on ${node.id} (value ${node.value}): stored ${node.height}, expected ${expectedHeight}`,
      )
    }

    const bf = balanceFactor(snapshot, node.id)
    if (bf < -1 || bf > 1) {
      throw new Error(
        `AVL imbalance on ${node.id} (value ${node.value}): BF=${bf}`,
      )
    }
  }

  const values = inorderTraversal(snapshot)
  for (let i = 1; i < values.length; i += 1) {
    if (values[i]! <= values[i - 1]!) {
      throw new Error(
        `Inorder not strictly increasing: ${values.join(', ')}`,
      )
    }
  }
}

/**
 * Imperative wrapper matching the lesson API surface.
 * Internally keeps an immutable snapshot.
 */
export class AVLTree {
  private snapshot: AVLTreeSnapshot

  constructor(values: readonly number[] = []) {
    this.snapshot = snapshotFromArray(values)
  }

  /** Current immutable snapshot (clone for safety). */
  getSnapshot(): AVLTreeSnapshot {
    return cloneSnapshot(this.snapshot)
  }

  insert(value: number): boolean {
    const result = insert(this.snapshot, value)
    this.snapshot = result.snapshot
    return result.inserted
  }

  search(value: number): boolean {
    return search(this.snapshot, value).found
  }

  delete(value: number): boolean {
    const result = deleteValue(this.snapshot, value)
    this.snapshot = result.snapshot
    return result.deleted
  }

  findMin(): number | null {
    return findMin(this.snapshot).value
  }

  findMax(): number | null {
    return findMax(this.snapshot).value
  }

  height(): number {
    return height(this.snapshot)
  }

  balanceFactor(nodeValue: number): number | null {
    const found = search(this.snapshot, nodeValue)
    if (!found.found || found.nodeId === null) {
      return null
    }
    return balanceFactor(this.snapshot, found.nodeId)
  }

  inorderTraversal(): number[] {
    return inorderTraversal(this.snapshot)
  }

  preorderTraversal(): number[] {
    return preorderTraversal(this.snapshot)
  }

  postorderTraversal(): number[] {
    return postorderTraversal(this.snapshot)
  }

  levelOrderTraversal(): number[] {
    return levelOrderTraversal(this.snapshot)
  }

  isBalanced(): boolean {
    return isBalanced(this.snapshot)
  }

  isEmpty(): boolean {
    return isEmpty(this.snapshot)
  }

  clear(): void {
    this.snapshot = createEmpty()
  }

  toArray(): number[] {
    return toArray(this.snapshot)
  }
}
