/**
 * Binary Search Tree — pure data-structure module.
 *
 * Ordering property: for every node, all values in the left subtree are
 * strictly smaller and all values in the right subtree are strictly larger.
 * Duplicate insertions are ignored (tree unchanged).
 *
 * Height convention (edges): empty tree = -1, single leaf = 0.
 * No balancing — trees may become skewed. Independent of React.
 *
 * Mutating helpers return new snapshots so historical visualization frames
 * stay immutable.
 */

/** Flat, JSON-friendly node for visualization frames. */
export type BSTNodeSnapshot = {
  readonly id: string
  readonly value: number
  readonly leftId: string | null
  readonly rightId: string | null
}

/**
 * Immutable BST snapshot.
 * Each historical step owns its own node array so scrubbing prev/next
 * cannot rewrite earlier frames.
 */
export type BinarySearchTreeSnapshot = {
  readonly rootId: string | null
  readonly nodes: readonly BSTNodeSnapshot[]
  /** Monotonic counter used when allocating new node ids. */
  readonly nextIdCounter: number
}

/** Default playground tree: 50 with balanced children 30/70, … */
export const BST_DEFAULT_VALUES = [50, 30, 70, 20, 40, 60, 80] as const

/** Balanced comparison tree for the shape explorer. */
export const BST_BALANCED_VALUES = [40, 20, 60, 10, 30, 50, 70] as const

/** Skewed comparison tree (sorted ascending inserts). */
export const BST_SKEWED_VALUES = [10, 20, 30, 40] as const

export const BST_ALT_VALUES = [25, 15, 35, 10, 20] as const

export const BST_SINGLE_VALUE = [42] as const

export const BST_ARRAY_PRESETS = [
  {
    id: 'lesson-default',
    label: 'Lesson tree',
    values: BST_DEFAULT_VALUES,
  },
  {
    id: 'balanced',
    label: 'Balanced shape',
    values: BST_BALANCED_VALUES,
  },
  {
    id: 'skewed',
    label: 'Skewed shape',
    values: BST_SKEWED_VALUES,
  },
  {
    id: 'five-nodes',
    label: '25 · 15 · 35 · 10 · 20',
    values: BST_ALT_VALUES,
  },
  {
    id: 'single',
    label: 'Single node',
    values: BST_SINGLE_VALUE,
  },
  {
    id: 'empty',
    label: 'Empty tree',
    values: [] as const,
  },
] as const

/** Empty tree snapshot. */
export function createEmpty(): BinarySearchTreeSnapshot {
  return { rootId: null, nodes: [], nextIdCounter: 0 }
}

/** Deep-clone so later frames cannot rewrite history. */
export function cloneSnapshot(
  snapshot: BinarySearchTreeSnapshot,
): BinarySearchTreeSnapshot {
  return {
    rootId: snapshot.rootId,
    nextIdCounter: snapshot.nextIdCounter,
    nodes: snapshot.nodes.map((node) => ({
      id: node.id,
      value: node.value,
      leftId: node.leftId,
      rightId: node.rightId,
    })),
  }
}

/** Allocate the next stable node id (`n0`, `n1`, …). */
export function allocateNodeId(
  snapshot: BinarySearchTreeSnapshot,
): { id: string; nextIdCounter: number } {
  return {
    id: `n${snapshot.nextIdCounter}`,
    nextIdCounter: snapshot.nextIdCounter + 1,
  }
}

function nodeMap(
  snapshot: BinarySearchTreeSnapshot,
): Map<string, BSTNodeSnapshot> {
  return new Map(snapshot.nodes.map((node) => [node.id, node]))
}

/**
 * Build a snapshot by inserting values left-to-right with stable ids.
 * Duplicates in the input are skipped (same policy as insert).
 */
export function snapshotFromArray(
  values: readonly number[],
): BinarySearchTreeSnapshot {
  let snapshot = createEmpty()
  for (const value of values) {
    snapshot = insert(snapshot, value).snapshot
  }
  return snapshot
}

/** Inorder values (sorted ascending for a valid BST). Empty → []. */
export function toArray(snapshot: BinarySearchTreeSnapshot): number[] {
  return inorderTraversal(snapshot)
}

export function isEmpty(snapshot: BinarySearchTreeSnapshot): boolean {
  return snapshot.rootId === null || snapshot.nodes.length === 0
}

export function clear(
  _snapshot: BinarySearchTreeSnapshot,
): BinarySearchTreeSnapshot {
  return createEmpty()
}

export type InsertResult = {
  readonly snapshot: BinarySearchTreeSnapshot
  /** False when the value already existed (duplicate ignored). */
  readonly inserted: boolean
  readonly nodeId: string | null
}

/**
 * Insert a value. Smaller → left, larger → right.
 * Equal values are ignored; the tree is unchanged.
 */
export function insert(
  snapshot: BinarySearchTreeSnapshot,
  value: number,
): InsertResult {
  if (!Number.isFinite(value)) {
    return { snapshot, inserted: false, nodeId: null }
  }

  if (snapshot.rootId === null) {
    const { id, nextIdCounter } = allocateNodeId(snapshot)
    const node: BSTNodeSnapshot = {
      id,
      value,
      leftId: null,
      rightId: null,
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
  const newNode: BSTNodeSnapshot = {
    id,
    value,
    leftId: null,
    rightId: null,
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

export type SearchResult = {
  readonly found: boolean
  readonly nodeId: string | null
  /** Node ids visited from root toward the target (includes match or last miss). */
  readonly pathIds: readonly string[]
}

/** Search for a value; returns path from root. */
export function search(
  snapshot: BinarySearchTreeSnapshot,
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
  readonly snapshot: BinarySearchTreeSnapshot
  readonly deleted: boolean
  /** Which structural case applied, when deleted. */
  readonly caseKind: 'leaf' | 'one-child' | 'two-children' | null
}

function replaceChildLink(
  nodes: readonly BSTNodeSnapshot[],
  parentId: string | null,
  oldChildId: string,
  newChildId: string | null,
  rootId: string | null,
): { nodes: BSTNodeSnapshot[]; rootId: string | null } {
  if (parentId === null) {
    return {
      nodes: [...nodes],
      rootId: newChildId,
    }
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

function removeNodeById(
  nodes: readonly BSTNodeSnapshot[],
  nodeId: string,
): BSTNodeSnapshot[] {
  return nodes.filter((node) => node.id !== nodeId).map((node) => ({ ...node }))
}

function findMinNode(
  snapshot: BinarySearchTreeSnapshot,
  startId: string,
): BSTNodeSnapshot | null {
  const byId = nodeMap(snapshot)
  let current = byId.get(startId) ?? null
  while (current?.leftId) {
    current = byId.get(current.leftId) ?? null
  }
  return current
}

function findParentId(
  snapshot: BinarySearchTreeSnapshot,
  childId: string,
): string | null {
  for (const node of snapshot.nodes) {
    if (node.leftId === childId || node.rightId === childId) {
      return node.id
    }
  }
  return null
}

/**
 * Delete a value. Three cases:
 * 1. Leaf — unlink the node.
 * 2. One child — replace the node with its child.
 * 3. Two children — copy inorder successor value, then remove the successor.
 */
export function deleteValue(
  snapshot: BinarySearchTreeSnapshot,
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

  // Case 1: leaf
  if (leftId === null && rightId === null) {
    const linked = replaceChildLink(
      snapshot.nodes,
      parentId,
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

  // Case 2: one child
  if (leftId === null || rightId === null) {
    const childId = leftId ?? rightId
    const linked = replaceChildLink(
      snapshot.nodes,
      parentId,
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

  // Case 3: two children — inorder successor = min of right subtree
  const successor = findMinNode(snapshot, rightId)
  if (!successor) {
    return { snapshot, deleted: false, caseKind: null }
  }

  // Replace target value with successor value (keep target id stable).
  const withReplacedValue: BinarySearchTreeSnapshot = {
    rootId: snapshot.rootId,
    nextIdCounter: snapshot.nextIdCounter,
    nodes: snapshot.nodes.map((node) =>
      node.id === target.id ? { ...node, value: successor.value } : { ...node },
    ),
  }

  // Remove successor from its original location (successor has no left child).
  const successorParentId = findParentId(withReplacedValue, successor.id)
  const successorChildId = successor.rightId
  const linked = replaceChildLink(
    withReplacedValue.nodes,
    successorParentId,
    successor.id,
    successorChildId,
    withReplacedValue.rootId,
  )

  return {
    snapshot: {
      rootId: linked.rootId,
      nodes: removeNodeById(linked.nodes, successor.id),
      nextIdCounter: snapshot.nextIdCounter,
    },
    deleted: true,
    caseKind: 'two-children',
  }
}

/** Inorder: Left → Root → Right. */
export function inorderTraversal(
  snapshot: BinarySearchTreeSnapshot,
): number[] {
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
export function preorderTraversal(
  snapshot: BinarySearchTreeSnapshot,
): number[] {
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
export function postorderTraversal(
  snapshot: BinarySearchTreeSnapshot,
): number[] {
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
export function levelOrderTraversal(
  snapshot: BinarySearchTreeSnapshot,
): number[] {
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

/** Same traversals returning node ids (for step highlighting). */
export function inorderNodeIds(
  snapshot: BinarySearchTreeSnapshot,
): string[] {
  const byId = nodeMap(snapshot)
  const ids: string[] = []

  function visit(id: string | null) {
    if (id === null) {
      return
    }
    const node = byId.get(id)
    if (!node) {
      return
    }
    visit(node.leftId)
    ids.push(node.id)
    visit(node.rightId)
  }

  visit(snapshot.rootId)
  return ids
}

export function preorderNodeIds(
  snapshot: BinarySearchTreeSnapshot,
): string[] {
  const byId = nodeMap(snapshot)
  const ids: string[] = []

  function visit(id: string | null) {
    if (id === null) {
      return
    }
    const node = byId.get(id)
    if (!node) {
      return
    }
    ids.push(node.id)
    visit(node.leftId)
    visit(node.rightId)
  }

  visit(snapshot.rootId)
  return ids
}

export function postorderNodeIds(
  snapshot: BinarySearchTreeSnapshot,
): string[] {
  const byId = nodeMap(snapshot)
  const ids: string[] = []

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
    ids.push(node.id)
  }

  visit(snapshot.rootId)
  return ids
}

export function levelOrderNodeIds(
  snapshot: BinarySearchTreeSnapshot,
): string[] {
  if (snapshot.rootId === null) {
    return []
  }

  const byId = nodeMap(snapshot)
  const ids: string[] = []
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
    ids.push(node.id)
    if (node.leftId) {
      queue.push(node.leftId)
    }
    if (node.rightId) {
      queue.push(node.rightId)
    }
  }

  return ids
}

export type MinMaxResult = {
  readonly value: number | null
  readonly nodeId: string | null
}

/** Minimum value = leftmost node. Empty → null. */
export function findMin(snapshot: BinarySearchTreeSnapshot): MinMaxResult {
  if (snapshot.rootId === null) {
    return { value: null, nodeId: null }
  }
  const node = findMinNode(snapshot, snapshot.rootId)
  return node
    ? { value: node.value, nodeId: node.id }
    : { value: null, nodeId: null }
}

/** Maximum value = rightmost node. Empty → null. */
export function findMax(snapshot: BinarySearchTreeSnapshot): MinMaxResult {
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
 * Height in edges. Empty tree → -1. Leaf → 0.
 * Ordinary (possibly unbalanced) BST — no balance guarantee.
 */
export function height(snapshot: BinarySearchTreeSnapshot): number {
  const byId = nodeMap(snapshot)

  function nodeHeight(id: string | null): number {
    if (id === null) {
      return -1
    }
    const node = byId.get(id)
    if (!node) {
      return -1
    }
    return 1 + Math.max(nodeHeight(node.leftId), nodeHeight(node.rightId))
  }

  return nodeHeight(snapshot.rootId)
}

/** Number of stored nodes. */
export function size(snapshot: BinarySearchTreeSnapshot): number {
  return snapshot.nodes.length
}

/** Compact text form for previews, e.g. `[20, 30, 40, 50, 60, 70, 80]`. */
export function formatTree(snapshot: BinarySearchTreeSnapshot): string {
  if (isEmpty(snapshot)) {
    return '[]'
  }
  return `[${toArray(snapshot).join(', ')}]`
}

/**
 * Lightweight structural checks for tests.
 * Does not prove full BST ordering for every subtree edge case beyond
 * inorder sortedness + unique ids.
 */
export function assertInvariants(snapshot: BinarySearchTreeSnapshot): void {
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
export class BinarySearchTree {
  private snapshot: BinarySearchTreeSnapshot

  constructor(values: readonly number[] = []) {
    this.snapshot = snapshotFromArray(values)
  }

  /** Current immutable snapshot (clone for safety). */
  getSnapshot(): BinarySearchTreeSnapshot {
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

  findMin(): number | null {
    return findMin(this.snapshot).value
  }

  findMax(): number | null {
    return findMax(this.snapshot).value
  }

  height(): number {
    return height(this.snapshot)
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
