/**
 * Step generator for AVL Tree visualization.
 *
 * Each step embeds an immutable `treeSnapshot` so previous/next scrubbing
 * never mutates historical frames. Pure data — no React.
 */

import type { VisualizationStep } from '../../components/visualizations/types'
import {
  assertInvariants,
  balanceFactor,
  cloneSnapshot,
  createEmpty,
  deleteUnbalanced,
  deleteValue as treeDelete,
  formatTree,
  height,
  insert as treeInsert,
  insertUnbalanced,
  isBalanced,
  isEmpty,
  nodeHeight,
  pathToNode,
  rebalanceNode,
  replaceSubtreeRoot,
  rotateLeft,
  rotateRight,
  search as treeSearch,
  size,
  updateHeight,
  updateHeightsAlongPath,
  type AVLNodeSnapshot,
  type AVLTreeSnapshot,
} from './avlTree'

export type AVLTreeOperation =
  | 'insert'
  | 'search'
  | 'delete'
  | 'rotate-ll'
  | 'rotate-rr'
  | 'rotate-lr'
  | 'rotate-rl'

export type AVLTreePhase =
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
  | 'update-height'
  | 'calc-balance'
  | 'detect-imbalance'
  | 'select-rotation'
  | 'rotate'
  | 'update-after-rotation'
  | 'balanced'
  | 'invalid'
  | 'complete'

type StepMetaFields = {
  phase: AVLTreePhase
  operation: AVLTreeOperation
  treeSnapshot: string
  rootId: string | null
  activeId: string | null
  pathIds: string
  visitedIds: string
  focusId: string | null
  insertId: string | null
  deleteId: string | null
  imbalancedId: string | null
  risingId: string | null
  rotationType: string | null
  caseKind: string | null
  operand: number | null
  result: string | null
  success: boolean | null
  message: string
  treeHeight: number
  treeSize: number
  nodeHeights: string
  balanceFactors: string
}

/** Serialize a snapshot for VisualizationStep.meta. */
export function serializeTreeSnapshot(snapshot: AVLTreeSnapshot): string {
  return JSON.stringify({
    rootId: snapshot.rootId,
    nextIdCounter: snapshot.nextIdCounter,
    nodes: snapshot.nodes,
  })
}

/** Parse a tree snapshot produced by serializeTreeSnapshot. */
export function parseTreeSnapshot(raw: string): AVLTreeSnapshot {
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

    const nodes: AVLNodeSnapshot[] = []
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
      const storedHeight =
        typeof node.height === 'number' && Number.isFinite(node.height)
          ? Math.floor(node.height)
          : 0
      nodes.push({
        id: node.id,
        value: node.value,
        leftId: node.leftId as string | null,
        rightId: node.rightId as string | null,
        height: storedHeight,
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

function encodeHeights(snapshot: AVLTreeSnapshot): string {
  return snapshot.nodes
    .map((node) => `${node.id}:${node.height}`)
    .join(',')
}

function encodeBalanceFactors(snapshot: AVLTreeSnapshot): string {
  return snapshot.nodes
    .map((node) => `${node.id}:${balanceFactor(snapshot, node.id)}`)
    .join(',')
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
    insertId: fields.insertId,
    deleteId: fields.deleteId,
    imbalancedId: fields.imbalancedId,
    risingId: fields.risingId,
    rotationType: fields.rotationType,
    caseKind: fields.caseKind,
    operand: fields.operand,
    result: fields.result,
    success: fields.success,
    message: fields.message,
    treeHeight: fields.treeHeight,
    treeSize: fields.treeSize,
    nodeHeights: fields.nodeHeights,
    balanceFactors: fields.balanceFactors,
  }
}

function pushStep(
  steps: VisualizationStep[],
  options: {
    id: string
    title: string
    explanation: string
    detail?: string
    snapshot: AVLTreeSnapshot
    phase: AVLTreePhase
    operation: AVLTreeOperation
    activeId?: string | null
    pathIds?: readonly string[]
    visitedIds?: readonly string[]
    focusId?: string | null
    insertId?: string | null
    deleteId?: string | null
    imbalancedId?: string | null
    risingId?: string | null
    rotationType?: string | null
    caseKind?: string | null
    operand?: number | null
    result?: string | null
    success?: boolean | null
    message?: string
    complete?: boolean
    /** Allow temporarily unbalanced frames during teaching steps. */
    allowUnbalanced?: boolean
  },
): void {
  const snapshot = cloneSnapshot(options.snapshot)

  if (!options.allowUnbalanced) {
    // Intermediate frames may briefly violate AVL while we teach imbalance.
    // Still require unique ids + BST order when possible.
    try {
      if (options.phase !== 'copy-successor') {
        const values = snapshot.nodes.map((n) => n.value).sort((a, b) => a - b)
        const inorder: number[] = []
        const byId = new Map(snapshot.nodes.map((n) => [n.id, n]))
        const walk = (id: string | null) => {
          if (!id) return
          const n = byId.get(id)
          if (!n) return
          walk(n.leftId)
          inorder.push(n.value)
          walk(n.rightId)
        }
        walk(snapshot.rootId)
        for (let i = 1; i < inorder.length; i += 1) {
          if (inorder[i]! <= inorder[i - 1]!) {
            throw new Error(`Bad inorder: ${inorder.join(',')}`)
          }
        }
        void values
      }
    } catch {
      // Soft: still push the teaching frame.
    }
  }

  steps.push({
    id: options.id,
    title: options.title,
    explanation: options.explanation,
    detail: options.detail,
    array: snapshot.nodes.map((node) => node.value),
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
      insertId: options.insertId ?? null,
      deleteId: options.deleteId ?? null,
      imbalancedId: options.imbalancedId ?? null,
      risingId: options.risingId ?? null,
      rotationType: options.rotationType ?? null,
      caseKind: options.caseKind ?? null,
      operand: options.operand ?? null,
      result: options.result ?? null,
      success: options.success ?? null,
      message: options.message ?? options.explanation,
      treeHeight: height(snapshot),
      treeSize: size(snapshot),
      nodeHeights: encodeHeights(snapshot),
      balanceFactors: encodeBalanceFactors(snapshot),
    }),
  })
}

function buildInvalidSteps(
  initial: AVLTreeSnapshot,
  operation: AVLTreeOperation,
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
    allowUnbalanced: true,
  })
  return steps
}

function nodeValue(snapshot: AVLTreeSnapshot, id: string | null): string {
  if (!id) {
    return '∅'
  }
  const node = snapshot.nodes.find((n) => n.id === id)
  return node ? String(node.value) : '?'
}

function emitRebalanceWalk(
  steps: VisualizationStep[],
  operation: AVLTreeOperation,
  startSnapshot: AVLTreeSnapshot,
  pathFromRoot: readonly string[],
  operand: number | null,
  insertId: string | null,
  deleteId: string | null,
): AVLTreeSnapshot {
  let snapshot = startSnapshot
  const path = [...pathFromRoot]

  for (let i = path.length - 1; i >= 0; i -= 1) {
    const nodeId = path[i]!
    snapshot = updateHeight(snapshot, nodeId)
    const bf = balanceFactor(snapshot, nodeId)
    const value = nodeValue(snapshot, nodeId)

    pushStep(steps, {
      id: `${operation}-height-${nodeId}-${steps.length}`,
      title: `Update height of ${value}`,
      explanation: `Height(${value}) = 1 + max(height(left), height(right)) = ${nodeHeight(snapshot, nodeId)}.`,
      snapshot,
      phase: 'update-height',
      operation,
      operand,
      activeId: nodeId,
      pathIds: path,
      insertId,
      deleteId,
      allowUnbalanced: true,
    })

    pushStep(steps, {
      id: `${operation}-bf-${nodeId}-${steps.length}`,
      title: `Balance factor of ${value}`,
      explanation: `BF(${value}) = height(left) − height(right) = ${bf}. Valid AVL factors are −1, 0, or 1.`,
      snapshot,
      phase: 'calc-balance',
      operation,
      operand,
      activeId: nodeId,
      pathIds: path,
      insertId,
      deleteId,
      allowUnbalanced: true,
    })

    if (bf < -1 || bf > 1) {
      pushStep(steps, {
        id: `${operation}-imbalance-${nodeId}-${steps.length}`,
        title: `Imbalance at ${value}`,
        explanation: `Node ${value} is unbalanced (BF = ${bf}). Choose the rotation case from the heavy side.`,
        snapshot,
        phase: 'detect-imbalance',
        operation,
        operand,
        activeId: nodeId,
        imbalancedId: nodeId,
        pathIds: path,
        insertId,
        deleteId,
        allowUnbalanced: true,
      })

      const before = snapshot
      const result = rebalanceNode(before, nodeId)

      pushStep(steps, {
        id: `${operation}-select-${nodeId}-${steps.length}`,
        title: result.caseKind
          ? `Select ${result.caseKind} rotation`
          : 'Select rotation',
        explanation: result.caseKind
          ? caseExplanation(result.caseKind, value)
          : `No rotation required at ${value}.`,
        snapshot: before,
        phase: 'select-rotation',
        operation,
        operand,
        activeId: nodeId,
        imbalancedId: nodeId,
        rotationType: result.caseKind,
        caseKind: result.caseKind,
        pathIds: path,
        insertId,
        deleteId,
        allowUnbalanced: true,
      })

      let working = before
      for (let r = 0; r < result.rotations.length; r += 1) {
        const rot = result.rotations[r]!
        // Apply one rotation at a time for teaching, then wire into parent.
        const single =
          rot.rotation === 'R'
            ? rotateRight(working, rot.pivotId)
            : rotateLeft(working, rot.pivotId)
        if (!single) {
          continue
        }
        working = replaceSubtreeRoot(
          single.snapshot,
          rot.pivotId,
          single.newRootId,
        )
        working = updateHeight(working, single.pivotId)
        working = updateHeight(working, single.newRootId)

        pushStep(steps, {
          id: `${operation}-rotate-${nodeId}-${r}-${steps.length}`,
          title:
            single.rotation === 'R'
              ? `Right rotation at ${nodeValue(before, rot.pivotId)}`
              : `Left rotation at ${nodeValue(before, rot.pivotId)}`,
          explanation:
            single.rotation === 'R'
              ? `Right-rotate around ${nodeValue(before, rot.pivotId)}. Node ${nodeValue(working, single.risingId)} rises; child links and heights update.`
              : `Left-rotate around ${nodeValue(before, rot.pivotId)}. Node ${nodeValue(working, single.risingId)} rises; child links and heights update.`,
          snapshot: working,
          phase: 'rotate',
          operation,
          operand,
          activeId: single.newRootId,
          imbalancedId: rot.pivotId,
          risingId: single.risingId,
          rotationType: result.caseKind ?? single.rotation,
          caseKind: result.caseKind,
          pathIds: path,
          insertId,
          deleteId,
          allowUnbalanced: true,
        })
      }

      // Commit the authoritative rebalance result (keeps ids/heights consistent).
      snapshot = replaceSubtreeRoot(result.snapshot, nodeId, result.newRootId)
      // Fix path: nodeId may no longer sit where it was; rebuild from insert/delete focus.
      const focus = insertId ?? deleteId
      if (focus && snapshot.nodes.some((n) => n.id === focus)) {
        const rebuilt = pathToNode(snapshot, focus)
        path.splice(0, path.length, ...rebuilt)
      } else {
        // Replace nodeId in path with newRootId when it moved.
        const idx = path.indexOf(nodeId)
        if (idx >= 0) {
          path[idx] = result.newRootId
        }
      }

      pushStep(steps, {
        id: `${operation}-after-rot-${nodeId}-${steps.length}`,
        title: 'Update heights after rotation',
        explanation: `Affected subtree heights are refreshed. Tree inorder: ${formatTree(snapshot)}.`,
        snapshot,
        phase: 'update-after-rotation',
        operation,
        operand,
        activeId: result.newRootId,
        imbalancedId: null,
        risingId: result.rotations[result.rotations.length - 1]?.risingId ?? null,
        rotationType: result.caseKind,
        caseKind: result.caseKind,
        pathIds: path,
        insertId,
        deleteId,
        allowUnbalanced: !isBalanced(snapshot),
      })
    }
  }

  return snapshot
}

function caseExplanation(kind: string, value: string): string {
  switch (kind) {
    case 'LL':
      return `LL (Left-Left): ${value} is left-heavy and its left child is left-heavy (or balanced). Fix with a single right rotation.`
    case 'RR':
      return `RR (Right-Right): ${value} is right-heavy and its right child is right-heavy (or balanced). Fix with a single left rotation.`
    case 'LR':
      return `LR (Left-Right): ${value} is left-heavy but its left child is right-heavy. Left-rotate the child, then right-rotate ${value}.`
    case 'RL':
      return `RL (Right-Left): ${value} is right-heavy but its right child is left-heavy. Right-rotate the child, then left-rotate ${value}.`
    default:
      return `Apply the rotation case for node ${value}.`
  }
}

function buildInsertSteps(
  initial: AVLTreeSnapshot,
  value: number,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation = 'insert' as const

  pushStep(steps, {
    id: 'insert-init',
    title: 'Insert with AVL balancing',
    explanation: `Insert ${value} using BST placement, then update heights and rotate if any balance factor leaves {−1, 0, 1}.`,
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
      explanation: `The tree is empty, so ${value} becomes the root with height 0 and BF 0.`,
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
      explanation: `Inserted ${value}. AVL tree remains balanced: ${formatTree(result.snapshot)}.`,
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
          ? 'equal → duplicate (ignore)'
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
        break
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
        break
      }
      currentId = current.rightId
    }
  }

  const placed = insertUnbalanced(initial, value)
  if (!placed.inserted || !placed.nodeId) {
    return buildInvalidSteps(initial, operation, 'Insert failed unexpectedly.', value)
  }

  const afterInsertPath = [...path, placed.nodeId]
  pushStep(steps, {
    id: 'insert-place',
    title: 'BST insert complete',
    explanation: `Attached ${value} as a new leaf (ordinary BST placement). Next: update heights and check balance factors on the path back to the root.`,
    snapshot: placed.snapshot,
    phase: 'insert',
    operation,
    operand: value,
    activeId: placed.nodeId,
    insertId: placed.nodeId,
    pathIds: afterInsertPath,
    success: true,
    result: `inserted ${value}`,
    allowUnbalanced: true,
  })

  // Refresh heights on the path first so imbalance is visible before rotations.
  let working = updateHeightsAlongPath(placed.snapshot, afterInsertPath)
  pushStep(steps, {
    id: 'insert-heights-path',
    title: 'Heights updated on the path',
    explanation:
      'Every ancestor’s stored height is recomputed from its children. Balance factors may now leave {−1, 0, 1}.',
    snapshot: working,
    phase: 'update-height',
    operation,
    operand: value,
    activeId: placed.nodeId,
    insertId: placed.nodeId,
    pathIds: afterInsertPath,
    allowUnbalanced: true,
  })

  working = emitRebalanceWalk(
    steps,
    operation,
    working,
    afterInsertPath,
    value,
    placed.nodeId,
    null,
  )

  // Authoritative final tree from the balanced insert API.
  const final = treeInsert(initial, value).snapshot
  assertInvariants(final)

  pushStep(steps, {
    id: 'insert-balanced',
    title: 'AVL property restored',
    explanation: `Every node has BF ∈ {−1, 0, 1}. Final inorder: ${formatTree(final)}. Height = ${height(final)}.`,
    snapshot: final,
    phase: 'balanced',
    operation,
    operand: value,
    activeId: placed.nodeId,
    insertId: placed.nodeId,
    success: true,
    result: formatTree(final),
  })

  pushStep(steps, {
    id: 'insert-complete',
    title: 'Insert complete',
    explanation: `Inserted ${value} and rebalanced. Search/insert/delete stay O(log n) because height stays logarithmic.`,
    snapshot: final,
    phase: 'complete',
    operation,
    operand: value,
    activeId: final.rootId,
    insertId: placed.nodeId,
    success: true,
    result: formatTree(final),
    complete: true,
  })

  return steps
}

function buildSearchSteps(
  initial: AVLTreeSnapshot,
  value: number,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation = 'search' as const

  pushStep(steps, {
    id: 'search-init',
    title: 'Search',
    explanation: `Search for ${value} with the same left/right decisions as an ordinary BST. AVL balance keeps the path short.`,
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
    })
    pushStep(steps, {
      id: 'search-complete',
      title: 'Search complete',
      explanation: `${value} is not in the tree.`,
      snapshot: initial,
      phase: 'complete',
      operation,
      operand: value,
      success: false,
      result: 'not found',
      complete: true,
    })
    return steps
  }

  const result = treeSearch(initial, value)
  const byId = new Map(initial.nodes.map((n) => [n.id, n]))
  const path: string[] = []

  for (const id of result.pathIds) {
    path.push(id)
    const node = byId.get(id)
    if (!node) {
      continue
    }
    pushStep(steps, {
      id: `search-compare-${path.length}`,
      title: `Compare with ${node.value}`,
      explanation:
        value === node.value
          ? `${value} equals ${node.value} — found.`
          : value < node.value
            ? `${value} < ${node.value} → go left`
            : `${value} > ${node.value} → go right`,
      snapshot: initial,
      phase: 'compare',
      operation,
      operand: value,
      activeId: id,
      pathIds: path,
      focusId: id,
    })
  }

  if (result.found) {
    pushStep(steps, {
      id: 'search-found',
      title: 'Found',
      explanation: `Located ${value} along a path of length ${result.pathIds.length}.`,
      snapshot: initial,
      phase: 'found',
      operation,
      operand: value,
      activeId: result.nodeId,
      pathIds: result.pathIds,
      focusId: result.nodeId,
      success: true,
      result: 'found',
    })
  } else {
    pushStep(steps, {
      id: 'search-miss',
      title: 'Not found',
      explanation: `${value} is not in the tree. The highlighted path is where the search failed.`,
      snapshot: initial,
      phase: 'not-found',
      operation,
      operand: value,
      activeId: result.pathIds[result.pathIds.length - 1] ?? null,
      pathIds: result.pathIds,
      success: false,
      result: 'not found',
    })
  }

  pushStep(steps, {
    id: 'search-complete',
    title: 'Search complete',
    explanation: result.found
      ? `search(${value}) → found`
      : `search(${value}) → not found`,
    snapshot: initial,
    phase: 'complete',
    operation,
    operand: value,
    activeId: result.nodeId,
    pathIds: result.pathIds,
    success: result.found,
    result: result.found ? 'found' : 'not found',
    complete: true,
  })

  return steps
}

function buildDeleteSteps(
  initial: AVLTreeSnapshot,
  value: number,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation = 'delete' as const

  pushStep(steps, {
    id: 'delete-init',
    title: 'Delete with AVL rebalancing',
    explanation: `Delete ${value} with ordinary BST rules, then walk back to the root updating heights and rotating as needed.`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    operand: value,
    activeId: initial.rootId,
  })

  const found = treeSearch(initial, value)
  if (!found.found || found.nodeId === null) {
    pushStep(steps, {
      id: 'delete-miss',
      title: 'Value not found',
      explanation: `${value} is not in the tree — nothing to delete.`,
      snapshot: initial,
      phase: 'not-found',
      operation,
      operand: value,
      pathIds: found.pathIds,
      success: false,
      result: 'not found',
    })
    pushStep(steps, {
      id: 'delete-complete-miss',
      title: 'Delete complete',
      explanation: `Tree unchanged: ${formatTree(initial)}.`,
      snapshot: initial,
      phase: 'complete',
      operation,
      operand: value,
      success: false,
      result: 'not found',
      complete: true,
    })
    return steps
  }

  const target = initial.nodes.find((n) => n.id === found.nodeId)!
  const caseKind =
    target.leftId === null && target.rightId === null
      ? 'leaf'
      : target.leftId === null || target.rightId === null
        ? 'one-child'
        : 'two-children'

  pushStep(steps, {
    id: 'delete-identify',
    title: `Delete case: ${caseKind}`,
    explanation:
      caseKind === 'leaf'
        ? `${value} is a leaf — unlink it.`
        : caseKind === 'one-child'
          ? `${value} has one child — promote that child.`
          : `${value} has two children — copy the inorder successor, then remove the successor node.`,
    snapshot: initial,
    phase: 'identify-case',
    operation,
    operand: value,
    activeId: found.nodeId,
    deleteId: found.nodeId,
    pathIds: found.pathIds,
    caseKind,
  })

  const unbalanced = deleteUnbalanced(initial, value)
  if (!unbalanced.deleted) {
    return buildInvalidSteps(initial, operation, 'Delete failed unexpectedly.', value)
  }

  pushStep(steps, {
    id: 'delete-structure',
    title: 'BST structure updated',
    explanation: `Applied the ${unbalanced.caseKind} deletion case. Heights may be stale and the tree may be temporarily unbalanced.`,
    snapshot: unbalanced.snapshot,
    phase:
      unbalanced.caseKind === 'leaf'
        ? 'unlink'
        : unbalanced.caseKind === 'one-child'
          ? 'replace-with-child'
          : 'remove-successor',
    operation,
    operand: value,
    deleteId: found.nodeId,
    caseKind: unbalanced.caseKind,
    pathIds: found.pathIds,
    allowUnbalanced: true,
  })

  // Path for rebalance: ancestors of the structural change.
  // Prefer the original search path minus the deleted id when it was a leaf/one-child.
  let rebalancePath = found.pathIds.filter((id) =>
    unbalanced.snapshot.nodes.some((n) => n.id === id),
  )
  if (rebalancePath.length === 0 && unbalanced.snapshot.rootId) {
    rebalancePath = [unbalanced.snapshot.rootId]
  }

  let working = updateHeightsAlongPath(unbalanced.snapshot, rebalancePath)
  pushStep(steps, {
    id: 'delete-heights',
    title: 'Update heights toward the root',
    explanation:
      'Recompute heights on the path from the deletion site back toward the root before checking balance factors.',
    snapshot: working,
    phase: 'update-height',
    operation,
    operand: value,
    pathIds: rebalancePath,
    deleteId: found.nodeId,
    allowUnbalanced: true,
  })

  working = emitRebalanceWalk(
    steps,
    operation,
    working,
    rebalancePath,
    value,
    null,
    found.nodeId,
  )

  const final = treeDelete(initial, value).snapshot
  assertInvariants(final)

  pushStep(steps, {
    id: 'delete-balanced',
    title: 'AVL property restored',
    explanation: `Deletion finished and the tree is balanced again: ${formatTree(final)}.`,
    snapshot: final,
    phase: 'balanced',
    operation,
    operand: value,
    success: true,
    result: formatTree(final),
  })

  pushStep(steps, {
    id: 'delete-complete',
    title: 'Delete complete',
    explanation: `Deleted ${value} (${caseKind}). Height = ${height(final)}.`,
    snapshot: final,
    phase: 'complete',
    operation,
    operand: value,
    activeId: final.rootId,
    success: true,
    result: formatTree(final),
    complete: true,
  })

  return steps
}

/**
 * Build a demo that starts empty and inserts a fixed sequence, pausing on
 * the rotation that restores balance for the named case.
 */
function buildRotationDemoSteps(
  operation: 'rotate-ll' | 'rotate-rr' | 'rotate-lr' | 'rotate-rl',
  sequence: readonly number[],
  label: string,
  summary: string,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  let snapshot = createEmpty()

  pushStep(steps, {
    id: `${operation}-init`,
    title: `${label} rotation demo`,
    explanation: summary,
    detail: `Insertion sequence: [${sequence.join(', ')}]`,
    snapshot,
    phase: 'initialize',
    operation,
  })

  for (const value of sequence) {
    const before = snapshot
    const insertSteps = buildInsertSteps(before, value)
    // Prefix step ids so demos stay unique when nested.
    for (const step of insertSteps) {
      steps.push({
        ...step,
        id: `${operation}-${value}-${step.id}`,
        meta: {
          ...step.meta,
          operation,
        },
      })
    }
    snapshot = treeInsert(before, value).snapshot
  }

  pushStep(steps, {
    id: `${operation}-complete`,
    title: `${label} demo complete`,
    explanation: `Final balanced tree: ${formatTree(snapshot)}. Root = ${nodeValue(snapshot, snapshot.rootId)}.`,
    snapshot,
    phase: 'complete',
    operation,
    activeId: snapshot.rootId,
    success: true,
    result: formatTree(snapshot),
    complete: true,
  })

  return steps
}

/**
 * Build visualization steps for an AVL operation on an immutable starting tree.
 */
export function buildAVLTreeSteps(
  initial: AVLTreeSnapshot,
  operation: AVLTreeOperation,
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
    case 'rotate-ll':
      return buildRotationDemoSteps(
        'rotate-ll',
        [30, 20, 10],
        'LL',
        'Left-Left imbalance: inserting 10 under 30→20 makes 30 left-heavy on the left. Fix with a right rotation at 30.',
      )
    case 'rotate-rr':
      return buildRotationDemoSteps(
        'rotate-rr',
        [10, 20, 30],
        'RR',
        'Right-Right imbalance: inserting 30 under 10→20 makes 10 right-heavy on the right. Fix with a left rotation at 10.',
      )
    case 'rotate-lr':
      return buildRotationDemoSteps(
        'rotate-lr',
        [30, 10, 20],
        'LR',
        'Left-Right imbalance: inserting 20 between 30 and 10. Left-rotate at 10, then right-rotate at 30.',
      )
    case 'rotate-rl':
      return buildRotationDemoSteps(
        'rotate-rl',
        [10, 30, 20],
        'RL',
        'Right-Left imbalance: inserting 20 between 10 and 30. Right-rotate at 30, then left-rotate at 10.',
      )
    default:
      return buildInvalidSteps(initial, operation, 'Unknown operation.')
  }
}

/** Recover the final snapshot from a completed step sequence. */
export function snapshotFromFinalStep(
  steps: readonly VisualizationStep[],
): AVLTreeSnapshot {
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

/** Decode `id:number` pairs from height / balance-factor meta strings. */
export function decodeNumberMap(raw: unknown): Map<string, number> {
  const map = new Map<string, number>()
  if (typeof raw !== 'string' || raw.length === 0) {
    return map
  }
  for (const part of raw.split(',')) {
    const [id, valueRaw] = part.split(':')
    if (!id) {
      continue
    }
    const value = Number(valueRaw)
    if (Number.isFinite(value)) {
      map.set(id, value)
    }
  }
  return map
}
