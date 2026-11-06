/**
 * Step generator for Binary Search Tree visualization.
 *
 * Each step embeds an immutable `treeSnapshot` so previous/next scrubbing
 * never mutates historical frames. Pure data — no React.
 */

import type { VisualizationStep } from '../../components/visualizations/types'
import {
  assertInvariants,
  cloneSnapshot,
  createEmpty,
  deleteValue as treeDelete,
  findMax,
  findMin,
  formatTree,
  height,
  inorderNodeIds,
  inorderTraversal,
  insert as treeInsert,
  isEmpty,
  levelOrderNodeIds,
  levelOrderTraversal,
  postorderNodeIds,
  postorderTraversal,
  preorderNodeIds,
  preorderTraversal,
  search as treeSearch,
  size,
  type BinarySearchTreeSnapshot,
  type BSTNodeSnapshot,
} from './binarySearchTree'

export type BinarySearchTreeOperation =
  | 'insert'
  | 'search'
  | 'delete'
  | 'inorder'
  | 'preorder'
  | 'postorder'
  | 'level-order'
  | 'find-min'
  | 'find-max'

export type BinarySearchTreePhase =
  | 'initialize'
  | 'compare'
  | 'go-left'
  | 'go-right'
  | 'insert'
  | 'duplicate'
  | 'found'
  | 'not-found'
  | 'identify-case'
  | 'unlink'
  | 'replace-with-child'
  | 'find-successor'
  | 'copy-successor'
  | 'remove-successor'
  | 'visit'
  | 'report'
  | 'invalid'
  | 'complete'

type StepMetaFields = {
  phase: BinarySearchTreePhase
  operation: BinarySearchTreeOperation
  treeSnapshot: string
  rootId: string | null
  activeId: string | null
  pathIds: string
  visitedIds: string
  focusId: string | null
  successorId: string | null
  insertId: string | null
  deleteId: string | null
  caseKind: string | null
  operand: number | null
  result: string | null
  success: boolean | null
  message: string
  treeHeight: number
  treeSize: number
}

/** Serialize a snapshot for VisualizationStep.meta. */
export function serializeTreeSnapshot(
  snapshot: BinarySearchTreeSnapshot,
): string {
  return JSON.stringify({
    rootId: snapshot.rootId,
    nextIdCounter: snapshot.nextIdCounter,
    nodes: snapshot.nodes,
  })
}

/** Parse a tree snapshot produced by serializeTreeSnapshot. */
export function parseTreeSnapshot(raw: string): BinarySearchTreeSnapshot {
  if (!raw) {
    return createEmpty()
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return createEmpty()
    }

    const record = parsed as Record<string, unknown>
    const rootId =
      typeof record.rootId === 'string' || record.rootId === null
        ? (record.rootId as string | null)
        : null
    const nextIdCounter =
      typeof record.nextIdCounter === 'number' &&
      Number.isFinite(record.nextIdCounter)
        ? Math.max(0, Math.floor(record.nextIdCounter))
        : 0

    const nodesRaw = record.nodes
    if (!Array.isArray(nodesRaw)) {
      return { rootId, nodes: [], nextIdCounter }
    }

    const nodes: BSTNodeSnapshot[] = []
    for (const item of nodesRaw) {
      if (!item || typeof item !== 'object') {
        continue
      }
      const node = item as Record<string, unknown>
      if (
        typeof node.id !== 'string' ||
        typeof node.value !== 'number' ||
        !Number.isFinite(node.value) ||
        !(typeof node.leftId === 'string' || node.leftId === null) ||
        !(typeof node.rightId === 'string' || node.rightId === null)
      ) {
        continue
      }
      nodes.push({
        id: node.id,
        value: node.value,
        leftId: node.leftId as string | null,
        rightId: node.rightId as string | null,
      })
    }

    return { rootId, nodes, nextIdCounter }
  } catch {
    return createEmpty()
  }
}

function encodeIdList(ids: readonly string[]): string {
  return ids.join(',')
}

function meta(fields: StepMetaFields): NonNullable<VisualizationStep['meta']> {
  return {
    phase: fields.phase,
    operation: fields.operation,
    treeSnapshot: fields.treeSnapshot,
    rootId: fields.rootId,
    activeId: fields.activeId,
    pathIds: fields.pathIds,
    visitedIds: fields.visitedIds,
    focusId: fields.focusId,
    successorId: fields.successorId,
    insertId: fields.insertId,
    deleteId: fields.deleteId,
    caseKind: fields.caseKind,
    operand: fields.operand,
    result: fields.result,
    success: fields.success,
    message: fields.message,
    treeHeight: fields.treeHeight,
    treeSize: fields.treeSize,
  }
}

function pushStep(
  steps: VisualizationStep[],
  options: {
    id: string
    title: string
    explanation: string
    detail?: string
    snapshot: BinarySearchTreeSnapshot
    phase: BinarySearchTreePhase
    operation: BinarySearchTreeOperation
    activeId?: string | null
    pathIds?: readonly string[]
    visitedIds?: readonly string[]
    focusId?: string | null
    successorId?: string | null
    insertId?: string | null
    deleteId?: string | null
    caseKind?: string | null
    operand?: number | null
    result?: string | null
    success?: boolean | null
    message?: string
    complete?: boolean
  },
): void {
  const snapshot = cloneSnapshot(options.snapshot)
  // Intermediate two-child delete frames copy the successor value before
  // unlinking the successor, so inorder is briefly non-unique.
  if (options.phase !== 'copy-successor') {
    assertInvariants(snapshot)
  }

  steps.push({
    id: options.id,
    title: options.title,
    explanation: options.explanation,
    detail: options.detail,
    array: inorderTraversal(snapshot),
    operation: options.complete ? 'complete' : undefined,
    meta: meta({
      phase: options.phase,
      operation: options.operation,
      treeSnapshot: serializeTreeSnapshot(snapshot),
      rootId: snapshot.rootId,
      activeId: options.activeId ?? null,
      pathIds: encodeIdList(options.pathIds ?? []),
      visitedIds: encodeIdList(options.visitedIds ?? []),
      focusId: options.focusId ?? null,
      successorId: options.successorId ?? null,
      insertId: options.insertId ?? null,
      deleteId: options.deleteId ?? null,
      caseKind: options.caseKind ?? null,
      operand: options.operand ?? null,
      result: options.result ?? null,
      success: options.success ?? null,
      message: options.message ?? options.explanation,
      treeHeight: height(snapshot),
      treeSize: size(snapshot),
    }),
  })
}

function buildInvalidSteps(
  initial: BinarySearchTreeSnapshot,
  operation: BinarySearchTreeOperation,
  message: string,
  operand: number | null = null,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  pushStep(steps, {
    id: `${operation}-invalid`,
    title: 'Invalid input',
    explanation: message,
    snapshot: initial,
    phase: 'invalid',
    operation,
    operand,
    success: false,
    result: 'invalid',
    complete: true,
  })
  return steps
}

function nodeById(
  snapshot: BinarySearchTreeSnapshot,
  id: string | null,
): BSTNodeSnapshot | null {
  if (!id) {
    return null
  }
  return snapshot.nodes.find((node) => node.id === id) ?? null
}

function buildInsertSteps(
  initial: BinarySearchTreeSnapshot,
  value: number,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation = 'insert' as const

  pushStep(steps, {
    id: 'insert-init',
    title: 'Insert value',
    explanation: `Insert ${value} while preserving the BST ordering property: left < node < right.`,
    detail: `Current inorder: ${formatTree(initial)}. Duplicates are ignored.`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    operand: value,
    activeId: initial.rootId,
  })

  if (isEmpty(initial)) {
    const result = treeInsert(initial, value)
    pushStep(steps, {
      id: 'insert-empty-root',
      title: 'Empty tree → new root',
      explanation: `The tree is empty, so ${value} becomes the root.`,
      snapshot: result.snapshot,
      phase: 'insert',
      operation,
      operand: value,
      activeId: result.nodeId,
      insertId: result.nodeId,
      pathIds: result.nodeId ? [result.nodeId] : [],
      success: true,
      result: `inserted ${value} as root`,
    })
    pushStep(steps, {
      id: 'insert-complete',
      title: 'Insert complete',
      explanation: `Inserted ${value}. Tree inorder: ${formatTree(result.snapshot)}.`,
      snapshot: result.snapshot,
      phase: 'complete',
      operation,
      operand: value,
      activeId: result.nodeId,
      insertId: result.nodeId,
      success: true,
      result: formatTree(result.snapshot),
      complete: true,
    })
    return steps
  }

  const byId = new Map(initial.nodes.map((n) => [n.id, n]))
  let currentId: string | null = initial.rootId
  const path: string[] = []

  while (currentId !== null) {
    const current = byId.get(currentId)
    if (!current) {
      break
    }
    path.push(current.id)

    pushStep(steps, {
      id: `insert-compare-${path.length}`,
      title: `Compare with ${current.value}`,
      explanation: `Compare ${value} with current node ${current.value}.`,
      detail:
        value === current.value
          ? 'Equal → duplicate (ignore)'
          : value < current.value
            ? `${value} < ${current.value} → go left`
            : `${value} > ${current.value} → go right`,
      snapshot: initial,
      phase: 'compare',
      operation,
      operand: value,
      activeId: current.id,
      pathIds: path,
    })

    if (value === current.value) {
      pushStep(steps, {
        id: 'insert-duplicate',
        title: 'Duplicate ignored',
        explanation: `${value} already exists. This lesson ignores duplicate insertions so every value appears at most once.`,
        snapshot: initial,
        phase: 'duplicate',
        operation,
        operand: value,
        activeId: current.id,
        pathIds: path,
        success: false,
        result: 'duplicate ignored',
      })
      pushStep(steps, {
        id: 'insert-complete-dup',
        title: 'Insert complete',
        explanation: `No structural change. Tree remains ${formatTree(initial)}.`,
        snapshot: initial,
        phase: 'complete',
        operation,
        operand: value,
        activeId: current.id,
        pathIds: path,
        success: false,
        result: 'duplicate ignored',
        complete: true,
      })
      return steps
    }

    if (value < current.value) {
      pushStep(steps, {
        id: `insert-left-${path.length}`,
        title: 'Go left',
        explanation: `${value} < ${current.value}, so continue into the left subtree.`,
        snapshot: initial,
        phase: 'go-left',
        operation,
        operand: value,
        activeId: current.leftId,
        pathIds: path,
        focusId: current.id,
      })
      if (current.leftId === null) {
        const result = treeInsert(initial, value)
        pushStep(steps, {
          id: 'insert-place-left',
          title: 'Link as left child',
          explanation: `Left child is empty. Attach ${value} as the left child of ${current.value}.`,
          snapshot: result.snapshot,
          phase: 'insert',
          operation,
          operand: value,
          activeId: result.nodeId,
          insertId: result.nodeId,
          pathIds: result.nodeId ? [...path, result.nodeId] : path,
          success: true,
          result: `inserted ${value}`,
        })
        pushStep(steps, {
          id: 'insert-complete',
          title: 'Insert complete',
          explanation: `Inserted ${value}. Inorder: ${formatTree(result.snapshot)}.`,
          snapshot: result.snapshot,
          phase: 'complete',
          operation,
          operand: value,
          activeId: result.nodeId,
          insertId: result.nodeId,
          pathIds: result.nodeId ? [...path, result.nodeId] : path,
          success: true,
          result: formatTree(result.snapshot),
          complete: true,
        })
        return steps
      }
      currentId = current.leftId
    } else {
      pushStep(steps, {
        id: `insert-right-${path.length}`,
        title: 'Go right',
        explanation: `${value} > ${current.value}, so continue into the right subtree.`,
        snapshot: initial,
        phase: 'go-right',
        operation,
        operand: value,
        activeId: current.rightId,
        pathIds: path,
        focusId: current.id,
      })
      if (current.rightId === null) {
        const result = treeInsert(initial, value)
        pushStep(steps, {
          id: 'insert-place-right',
          title: 'Link as right child',
          explanation: `Right child is empty. Attach ${value} as the right child of ${current.value}.`,
          snapshot: result.snapshot,
          phase: 'insert',
          operation,
          operand: value,
          activeId: result.nodeId,
          insertId: result.nodeId,
          pathIds: result.nodeId ? [...path, result.nodeId] : path,
          success: true,
          result: `inserted ${value}`,
        })
        pushStep(steps, {
          id: 'insert-complete',
          title: 'Insert complete',
          explanation: `Inserted ${value}. Inorder: ${formatTree(result.snapshot)}.`,
          snapshot: result.snapshot,
          phase: 'complete',
          operation,
          operand: value,
          activeId: result.nodeId,
          insertId: result.nodeId,
          pathIds: result.nodeId ? [...path, result.nodeId] : path,
          success: true,
          result: formatTree(result.snapshot),
          complete: true,
        })
        return steps
      }
      currentId = current.rightId
    }
  }

  return buildInvalidSteps(initial, operation, 'Insert walk failed unexpectedly.', value)
}

function buildSearchSteps(
  initial: BinarySearchTreeSnapshot,
  value: number,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation = 'search' as const

  pushStep(steps, {
    id: 'search-init',
    title: 'Search value',
    explanation: `Search for ${value} by walking left or right from the root using the BST ordering property.`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    operand: value,
    activeId: initial.rootId,
  })

  if (isEmpty(initial)) {
    pushStep(steps, {
      id: 'search-empty',
      title: 'Empty tree',
      explanation: `The tree is empty, so ${value} is not found.`,
      snapshot: initial,
      phase: 'not-found',
      operation,
      operand: value,
      success: false,
      result: 'not found',
      complete: true,
    })
    return steps
  }

  const byId = new Map(initial.nodes.map((n) => [n.id, n]))
  let currentId: string | null = initial.rootId
  const path: string[] = []

  while (currentId !== null) {
    const current = byId.get(currentId)
    if (!current) {
      break
    }
    path.push(current.id)

    pushStep(steps, {
      id: `search-compare-${path.length}`,
      title: `Compare with ${current.value}`,
      explanation: `Compare target ${value} with ${current.value}.`,
      detail:
        value === current.value
          ? 'Match!'
          : value < current.value
            ? 'Target is smaller → left'
            : 'Target is larger → right',
      snapshot: initial,
      phase: 'compare',
      operation,
      operand: value,
      activeId: current.id,
      pathIds: path,
    })

    if (value === current.value) {
      pushStep(steps, {
        id: 'search-found',
        title: 'Found',
        explanation: `Found ${value} after visiting ${path.length} node(s).`,
        snapshot: initial,
        phase: 'found',
        operation,
        operand: value,
        activeId: current.id,
        pathIds: path,
        focusId: current.id,
        success: true,
        result: `found ${value}`,
      })
      pushStep(steps, {
        id: 'search-complete',
        title: 'Search complete',
        explanation: `Search path highlighted from root to ${value}.`,
        snapshot: initial,
        phase: 'complete',
        operation,
        operand: value,
        activeId: current.id,
        pathIds: path,
        focusId: current.id,
        success: true,
        result: `found ${value}`,
        complete: true,
      })
      return steps
    }

    if (value < current.value) {
      pushStep(steps, {
        id: `search-left-${path.length}`,
        title: 'Go left',
        explanation: `${value} < ${current.value} → follow the left child.`,
        snapshot: initial,
        phase: 'go-left',
        operation,
        operand: value,
        activeId: current.leftId,
        pathIds: path,
        focusId: current.id,
      })
      currentId = current.leftId
    } else {
      pushStep(steps, {
        id: `search-right-${path.length}`,
        title: 'Go right',
        explanation: `${value} > ${current.value} → follow the right child.`,
        snapshot: initial,
        phase: 'go-right',
        operation,
        operand: value,
        activeId: current.rightId,
        pathIds: path,
        focusId: current.id,
      })
      currentId = current.rightId
    }
  }

  pushStep(steps, {
    id: 'search-miss',
    title: 'Not found',
    explanation: `${value} is not in the tree. The highlighted path shows where the search failed.`,
    snapshot: initial,
    phase: 'not-found',
    operation,
    operand: value,
    pathIds: path,
    activeId: path[path.length - 1] ?? null,
    success: false,
    result: 'not found',
  })
  pushStep(steps, {
    id: 'search-complete-miss',
    title: 'Search complete',
    explanation: `No node equals ${value}.`,
    snapshot: initial,
    phase: 'complete',
    operation,
    operand: value,
    pathIds: path,
    activeId: path[path.length - 1] ?? null,
    success: false,
    result: 'not found',
    complete: true,
  })
  return steps
}

function buildDeleteSteps(
  initial: BinarySearchTreeSnapshot,
  value: number,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation = 'delete' as const

  pushStep(steps, {
    id: 'delete-init',
    title: 'Delete value',
    explanation: `Delete ${value}. Cases: leaf, one child, or two children (inorder successor).`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    operand: value,
    activeId: initial.rootId,
  })

  if (isEmpty(initial)) {
    pushStep(steps, {
      id: 'delete-empty',
      title: 'Empty tree',
      explanation: 'Nothing to delete in an empty tree.',
      snapshot: initial,
      phase: 'not-found',
      operation,
      operand: value,
      success: false,
      result: 'not found',
      complete: true,
    })
    return steps
  }

  const located = treeSearch(initial, value)
  const path = located.pathIds

  for (let i = 0; i < path.length; i += 1) {
    const id = path[i]!
    const node = nodeById(initial, id)
    if (!node) {
      continue
    }
    pushStep(steps, {
      id: `delete-locate-${i + 1}`,
      title: `Locate ${value}`,
      explanation: `Compare with ${node.value} while searching for the node to delete.`,
      snapshot: initial,
      phase: 'compare',
      operation,
      operand: value,
      activeId: id,
      pathIds: path.slice(0, i + 1),
      deleteId: located.found ? located.nodeId : null,
    })
  }

  if (!located.found || !located.nodeId) {
    pushStep(steps, {
      id: 'delete-missing',
      title: 'Value not found',
      explanation: `${value} is not in the tree — no deletion.`,
      snapshot: initial,
      phase: 'not-found',
      operation,
      operand: value,
      pathIds: path,
      success: false,
      result: 'not found',
      complete: true,
    })
    return steps
  }

  const target = nodeById(initial, located.nodeId)!
  const leftId = target.leftId
  const rightId = target.rightId
  let caseKind: 'leaf' | 'one-child' | 'two-children'
  if (leftId === null && rightId === null) {
    caseKind = 'leaf'
  } else if (leftId === null || rightId === null) {
    caseKind = 'one-child'
  } else {
    caseKind = 'two-children'
  }

  pushStep(steps, {
    id: 'delete-identify',
    title: 'Identify deletion case',
    explanation:
      caseKind === 'leaf'
        ? `${value} is a leaf — remove it directly.`
        : caseKind === 'one-child'
          ? `${value} has one child — replace it with that child.`
          : `${value} has two children — replace its value with the inorder successor, then remove the successor.`,
    snapshot: initial,
    phase: 'identify-case',
    operation,
    operand: value,
    activeId: target.id,
    pathIds: path,
    deleteId: target.id,
    caseKind,
  })

  if (caseKind === 'leaf') {
    const result = treeDelete(initial, value)
    pushStep(steps, {
      id: 'delete-unlink-leaf',
      title: 'Unlink leaf',
      explanation: `Remove leaf ${value} and clear its parent link.`,
      snapshot: result.snapshot,
      phase: 'unlink',
      operation,
      operand: value,
      pathIds: path.slice(0, -1),
      deleteId: target.id,
      caseKind,
      success: true,
      result: `deleted ${value}`,
    })
    pushStep(steps, {
      id: 'delete-complete',
      title: 'Delete complete',
      explanation: `Deleted leaf ${value}. Inorder: ${formatTree(result.snapshot)}.`,
      snapshot: result.snapshot,
      phase: 'complete',
      operation,
      operand: value,
      caseKind,
      success: true,
      result: formatTree(result.snapshot),
      complete: true,
    })
    return steps
  }

  if (caseKind === 'one-child') {
    const child = nodeById(initial, leftId ?? rightId)
    pushStep(steps, {
      id: 'delete-one-child-prep',
      title: 'Promote the only child',
      explanation: `Node ${value} has one child (${child?.value ?? '?'}). The parent will point to that child instead.`,
      snapshot: initial,
      phase: 'replace-with-child',
      operation,
      operand: value,
      activeId: child?.id ?? null,
      pathIds: path,
      deleteId: target.id,
      focusId: child?.id ?? null,
      caseKind,
    })
    const result = treeDelete(initial, value)
    pushStep(steps, {
      id: 'delete-one-child-done',
      title: 'Child promoted',
      explanation: `Removed ${value}; its child took its place in the tree.`,
      snapshot: result.snapshot,
      phase: 'unlink',
      operation,
      operand: value,
      caseKind,
      success: true,
      result: `deleted ${value}`,
    })
    pushStep(steps, {
      id: 'delete-complete',
      title: 'Delete complete',
      explanation: `Deleted ${value} (one-child case). Inorder: ${formatTree(result.snapshot)}.`,
      snapshot: result.snapshot,
      phase: 'complete',
      operation,
      operand: value,
      caseKind,
      success: true,
      result: formatTree(result.snapshot),
      complete: true,
    })
    return steps
  }

  // Two children — show successor walk, copy, then remove successor
  const byId = new Map(initial.nodes.map((n) => [n.id, n]))
  const rightChild = byId.get(rightId!)!
  let successor = rightChild
  const successorPath: string[] = [successor.id]
  while (successor.leftId) {
    successor = byId.get(successor.leftId)!
    successorPath.push(successor.id)
  }

  pushStep(steps, {
    id: 'delete-find-successor-start',
    title: 'Find inorder successor',
    explanation: `Inorder successor = minimum of the right subtree (start at ${rightChild.value}).`,
    snapshot: initial,
    phase: 'find-successor',
    operation,
    operand: value,
    activeId: rightChild.id,
    pathIds: path,
    deleteId: target.id,
    successorId: rightChild.id,
    caseKind,
  })

  for (let i = 1; i < successorPath.length; i += 1) {
    const id = successorPath[i]!
    const node = byId.get(id)!
    pushStep(steps, {
      id: `delete-successor-left-${i}`,
      title: 'Walk left for minimum',
      explanation: `Keep going left to ${node.value} — the successor is the leftmost node in the right subtree.`,
      snapshot: initial,
      phase: 'find-successor',
      operation,
      operand: value,
      activeId: id,
      pathIds: path,
      deleteId: target.id,
      successorId: id,
      caseKind,
    })
  }

  pushStep(steps, {
    id: 'delete-copy-successor',
    title: 'Copy successor value',
    explanation: `Replace ${value} with successor value ${successor.value} (node id stays ${target.id}).`,
    detail: 'Then remove the successor from its original location.',
    snapshot: {
      ...initial,
      nodes: initial.nodes.map((n) =>
        n.id === target.id ? { ...n, value: successor.value } : n,
      ),
    },
    phase: 'copy-successor',
    operation,
    operand: value,
    activeId: target.id,
    pathIds: path,
    deleteId: target.id,
    successorId: successor.id,
    focusId: target.id,
    caseKind,
  })

  const result = treeDelete(initial, value)
  pushStep(steps, {
    id: 'delete-remove-successor',
    title: 'Remove successor node',
    explanation: `Unlink successor ${successor.value} from its original spot (it had no left child).`,
    snapshot: result.snapshot,
    phase: 'remove-successor',
    operation,
    operand: value,
    activeId: target.id,
    deleteId: target.id,
    caseKind,
    success: true,
    result: `deleted ${value}`,
  })

  pushStep(steps, {
    id: 'delete-complete',
    title: 'Delete complete',
    explanation: `Deleted ${value} via inorder successor ${successor.value}. Inorder: ${formatTree(result.snapshot)}.`,
    snapshot: result.snapshot,
    phase: 'complete',
    operation,
    operand: value,
    caseKind,
    success: true,
    result: formatTree(result.snapshot),
    complete: true,
  })
  return steps
}

function buildTraversalSteps(
  initial: BinarySearchTreeSnapshot,
  operation: 'inorder' | 'preorder' | 'postorder' | 'level-order',
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const labels = {
    inorder: 'Inorder (Left → Root → Right)',
    preorder: 'Preorder (Root → Left → Right)',
    postorder: 'Postorder (Left → Right → Root)',
    'level-order': 'Level-order (breadth-first)',
  } as const

  const idFns = {
    inorder: inorderNodeIds,
    preorder: preorderNodeIds,
    postorder: postorderNodeIds,
    'level-order': levelOrderNodeIds,
  } as const

  const valueFns = {
    inorder: inorderTraversal,
    preorder: preorderTraversal,
    postorder: postorderTraversal,
    'level-order': levelOrderTraversal,
  } as const

  pushStep(steps, {
    id: `${operation}-init`,
    title: labels[operation],
    explanation: `Walk every node using ${labels[operation].toLowerCase()}.`,
    detail: isEmpty(initial)
      ? 'Tree is empty — result is [].'
      : `Starting from root. Final order will list all ${size(initial)} value(s).`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    activeId: initial.rootId,
  })

  if (isEmpty(initial)) {
    pushStep(steps, {
      id: `${operation}-empty`,
      title: 'Empty result',
      explanation: 'An empty tree yields an empty traversal.',
      snapshot: initial,
      phase: 'complete',
      operation,
      success: true,
      result: '[]',
      complete: true,
    })
    return steps
  }

  const orderIds = idFns[operation](initial)
  const orderValues = valueFns[operation](initial)
  const visited: string[] = []

  for (let i = 0; i < orderIds.length; i += 1) {
    const id = orderIds[i]!
    visited.push(id)
    const value = orderValues[i]!
    pushStep(steps, {
      id: `${operation}-visit-${i + 1}`,
      title: `Visit ${value}`,
      explanation: `Visit node ${value} (${i + 1} of ${orderIds.length}).`,
      detail: `Partial order: [${orderValues.slice(0, i + 1).join(', ')}]`,
      snapshot: initial,
      phase: 'visit',
      operation,
      activeId: id,
      visitedIds: visited,
      focusId: id,
      result: `[${orderValues.slice(0, i + 1).join(', ')}]`,
    })
  }

  pushStep(steps, {
    id: `${operation}-complete`,
    title: 'Traversal complete',
    explanation: `${labels[operation]} result: [${orderValues.join(', ')}].`,
    snapshot: initial,
    phase: 'complete',
    operation,
    visitedIds: orderIds,
    success: true,
    result: `[${orderValues.join(', ')}]`,
    complete: true,
  })
  return steps
}

function buildMinMaxSteps(
  initial: BinarySearchTreeSnapshot,
  operation: 'find-min' | 'find-max',
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const goingLeft = operation === 'find-min'

  pushStep(steps, {
    id: `${operation}-init`,
    title: goingLeft ? 'Find minimum' : 'Find maximum',
    explanation: goingLeft
      ? 'The minimum is the leftmost node — keep following left children.'
      : 'The maximum is the rightmost node — keep following right children.',
    snapshot: initial,
    phase: 'initialize',
    operation,
    activeId: initial.rootId,
  })

  if (isEmpty(initial)) {
    pushStep(steps, {
      id: `${operation}-empty`,
      title: 'Empty tree',
      explanation: 'No minimum or maximum in an empty tree.',
      snapshot: initial,
      phase: 'not-found',
      operation,
      success: false,
      result: 'empty',
      complete: true,
    })
    return steps
  }

  const byId = new Map(initial.nodes.map((n) => [n.id, n]))
  let currentId: string | null = initial.rootId
  const path: string[] = []

  while (currentId !== null) {
    const current = byId.get(currentId)
    if (!current) {
      break
    }
    path.push(current.id)
    const nextId = goingLeft ? current.leftId : current.rightId

    pushStep(steps, {
      id: `${operation}-at-${path.length}`,
      title: `At ${current.value}`,
      explanation: nextId
        ? goingLeft
          ? `Left child exists (${nodeById(initial, nextId)?.value}) — continue left.`
          : `Right child exists (${nodeById(initial, nextId)?.value}) — continue right.`
        : goingLeft
          ? `No left child — ${current.value} is the minimum.`
          : `No right child — ${current.value} is the maximum.`,
      snapshot: initial,
      phase: nextId ? (goingLeft ? 'go-left' : 'go-right') : 'found',
      operation,
      activeId: current.id,
      pathIds: path,
      focusId: current.id,
    })

    if (!nextId) {
      const extreme = goingLeft ? findMin(initial) : findMax(initial)
      pushStep(steps, {
        id: `${operation}-complete`,
        title: goingLeft ? 'Minimum found' : 'Maximum found',
        explanation: `${goingLeft ? 'Min' : 'Max'} = ${extreme.value}.`,
        snapshot: initial,
        phase: 'complete',
        operation,
        activeId: current.id,
        pathIds: path,
        focusId: current.id,
        success: true,
        result: String(extreme.value),
        complete: true,
      })
      return steps
    }

    currentId = nextId
  }

  return buildInvalidSteps(initial, operation, 'Min/max walk failed unexpectedly.')
}

/**
 * Build visualization steps for a BST operation on an immutable starting tree.
 */
export function buildBinarySearchTreeSteps(
  initial: BinarySearchTreeSnapshot,
  operation: BinarySearchTreeOperation,
  value: number | null,
): VisualizationStep[] {
  const needsValue =
    operation === 'insert' ||
    operation === 'search' ||
    operation === 'delete'

  if (needsValue && (value === null || !Number.isFinite(value))) {
    return buildInvalidSteps(
      initial,
      operation,
      'Enter a finite number. Zero and negatives are valid.',
      value,
    )
  }

  switch (operation) {
    case 'insert':
      return buildInsertSteps(initial, value!)
    case 'search':
      return buildSearchSteps(initial, value!)
    case 'delete':
      return buildDeleteSteps(initial, value!)
    case 'inorder':
    case 'preorder':
    case 'postorder':
    case 'level-order':
      return buildTraversalSteps(initial, operation)
    case 'find-min':
    case 'find-max':
      return buildMinMaxSteps(initial, operation)
    default:
      return buildInvalidSteps(initial, operation, 'Unknown operation.')
  }
}

/** Recover the final snapshot from a completed step sequence. */
export function snapshotFromFinalStep(
  steps: readonly VisualizationStep[],
): BinarySearchTreeSnapshot {
  const last = steps[steps.length - 1]
  const raw = last?.meta?.treeSnapshot
  if (typeof raw !== 'string') {
    return createEmpty()
  }
  return parseTreeSnapshot(raw)
}

/** Decode a comma-separated id list from step meta. */
export function decodeIdList(raw: unknown): string[] {
  if (typeof raw !== 'string' || raw.length === 0) {
    return []
  }
  return raw.split(',').filter(Boolean)
}
