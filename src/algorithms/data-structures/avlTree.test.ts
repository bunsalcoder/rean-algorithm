import { describe, expect, it } from 'vitest'
import {
  AVLTree,
  AVL_DEFAULT_VALUES,
  AVL_LR_SEQUENCE,
  AVL_PLAYGROUND_VALUES,
  AVL_RL_SEQUENCE,
  AVL_RR_SEQUENCE,
  assertInvariants,
  balanceFactor,
  clear,
  createEmpty,
  deleteValue,
  findMax,
  findMin,
  height,
  inorderTraversal,
  insert,
  isBalanced,
  isEmpty,
  levelOrderTraversal,
  postorderTraversal,
  preorderTraversal,
  search,
  size,
  snapshotFromArray,
  toArray,
} from './avlTree'
import {
  buildAVLTreeSteps,
  parseTreeSnapshot,
  serializeTreeSnapshot,
  snapshotFromFinalStep,
} from './avlTreeSteps'

function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state
  }
}

describe('empty tree', () => {
  it('starts empty with height -1', () => {
    const tree = createEmpty()
    expect(isEmpty(tree)).toBe(true)
    expect(size(tree)).toBe(0)
    expect(height(tree)).toBe(-1)
    expect(toArray(tree)).toEqual([])
    expect(findMin(tree).value).toBeNull()
    expect(findMax(tree).value).toBeNull()
    expect(search(tree, 10).found).toBe(false)
    expect(isBalanced(tree)).toBe(true)
    assertInvariants(tree)
  })
})

describe('insert and rotations', () => {
  it('balances the default LL sequence to root 20', () => {
    const tree = snapshotFromArray(AVL_DEFAULT_VALUES)
    expect(levelOrderTraversal(tree)).toEqual([20, 10, 30])
    expect(toArray(tree)).toEqual([10, 20, 30])
    expect(height(tree)).toBe(1)
    expect(balanceFactor(tree, tree.rootId)).toBe(0)
    assertInvariants(tree)
  })

  it('balances RR / LR / RL demos', () => {
    for (const sequence of [
      AVL_RR_SEQUENCE,
      AVL_LR_SEQUENCE,
      AVL_RL_SEQUENCE,
    ]) {
      const tree = snapshotFromArray(sequence)
      expect(levelOrderTraversal(tree)).toEqual([20, 10, 30])
      assertInvariants(tree)
    }
  })

  it('ignores duplicate insertions', () => {
    let tree = insert(createEmpty(), 50).snapshot
    const dup = insert(tree, 50)
    expect(dup.inserted).toBe(false)
    expect(size(dup.snapshot)).toBe(1)
    expect(dup.snapshot).toBe(tree)
  })

  it('handles negative values and zero', () => {
    let tree = createEmpty()
    tree = insert(tree, 0).snapshot
    tree = insert(tree, -5).snapshot
    tree = insert(tree, 3).snapshot
    tree = insert(tree, -5).snapshot
    expect(toArray(tree)).toEqual([-5, 0, 3])
    assertInvariants(tree)
  })

  it('keeps a larger playground tree balanced', () => {
    const tree = snapshotFromArray(AVL_PLAYGROUND_VALUES)
    expect(toArray(tree)).toEqual([10, 20, 30, 40, 50, 60, 70])
    expect(isBalanced(tree)).toBe(true)
    assertInvariants(tree)
  })

  it('balances multiple consecutive insertions', () => {
    let tree = createEmpty()
    for (const value of [1, 2, 3, 4, 5, 6, 7]) {
      tree = insert(tree, value).snapshot
      assertInvariants(tree)
    }
    expect(height(tree)).toBeLessThanOrEqual(3)
    expect(toArray(tree)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })
})

describe('search', () => {
  const tree = snapshotFromArray(AVL_PLAYGROUND_VALUES)

  it('finds existing values and records the path', () => {
    const result = search(tree, 30)
    expect(result.found).toBe(true)
    expect(result.pathIds.length).toBeGreaterThan(0)
    const byId = new Map(tree.nodes.map((n) => [n.id, n]))
    expect(byId.get(result.nodeId!)!.value).toBe(30)
  })

  it('reports missing values with the failed path', () => {
    const result = search(tree, 45)
    expect(result.found).toBe(false)
    expect(result.nodeId).toBeNull()
    expect(result.pathIds.length).toBeGreaterThan(0)
  })
})

describe('delete', () => {
  it('deletes a leaf and stays balanced', () => {
    let tree = snapshotFromArray(AVL_PLAYGROUND_VALUES)
    const result = deleteValue(tree, 10)
    expect(result.deleted).toBe(true)
    expect(result.caseKind).toBe('leaf')
    expect(toArray(result.snapshot)).toEqual([20, 30, 40, 50, 60, 70])
    assertInvariants(result.snapshot)
  })

  it('deletes a node with one child', () => {
    let tree = snapshotFromArray([20, 10, 30, 5])
    const result = deleteValue(tree, 10)
    expect(result.deleted).toBe(true)
    expect(result.caseKind).toBe('one-child')
    expect(toArray(result.snapshot)).toEqual([5, 20, 30])
    assertInvariants(result.snapshot)
  })

  it('deletes a node with two children via inorder successor', () => {
    let tree = snapshotFromArray(AVL_PLAYGROUND_VALUES)
    const result = deleteValue(tree, 20)
    expect(result.deleted).toBe(true)
    expect(result.caseKind).toBe('two-children')
    expect(toArray(result.snapshot)).toEqual([10, 30, 40, 50, 60, 70])
    assertInvariants(result.snapshot)
  })

  it('deletes the root', () => {
    let tree = snapshotFromArray(AVL_DEFAULT_VALUES)
    const result = deleteValue(tree, 20)
    expect(result.deleted).toBe(true)
    expect(toArray(result.snapshot)).toEqual([10, 30])
    assertInvariants(result.snapshot)
  })

  it('rebalances after a deletion that would unbalance an ordinary BST', () => {
    // Build a small AVL tree, then delete to force rebalancing.
    let tree = snapshotFromArray([30, 20, 40, 10, 25, 50])
    assertInvariants(tree)
    tree = deleteValue(tree, 50).snapshot
    tree = deleteValue(tree, 40).snapshot
    assertInvariants(tree)
    expect(isBalanced(tree)).toBe(true)
  })

  it('ignores missing deletes and empty trees', () => {
    expect(deleteValue(createEmpty(), 1).deleted).toBe(false)
    const tree = snapshotFromArray([1])
    expect(deleteValue(tree, 99).deleted).toBe(false)
    expect(size(deleteValue(tree, 99).snapshot)).toBe(1)
  })
})

describe('traversals and extremes', () => {
  const tree = snapshotFromArray(AVL_PLAYGROUND_VALUES)

  it('returns classic traversal orders', () => {
    expect(inorderTraversal(tree)).toEqual([10, 20, 30, 40, 50, 60, 70])
    expect(preorderTraversal(tree)[0]).toBe(40)
    expect(postorderTraversal(tree).at(-1)).toBe(40)
    expect(levelOrderTraversal(tree)[0]).toBe(40)
  })

  it('finds min and max', () => {
    expect(findMin(tree).value).toBe(10)
    expect(findMax(tree).value).toBe(70)
  })
})

describe('class wrapper', () => {
  it('exposes the lesson API surface', () => {
    const tree = new AVLTree([30, 20, 10])
    expect(tree.toArray()).toEqual([10, 20, 30])
    expect(tree.search(20)).toBe(true)
    expect(tree.height()).toBe(1)
    expect(tree.isBalanced()).toBe(true)
    expect(tree.balanceFactor(20)).toBe(0)
    expect(tree.findMin()).toBe(10)
    expect(tree.findMax()).toBe(30)
    expect(tree.delete(10)).toBe(true)
    expect(tree.insert(15)).toBe(true)
    tree.clear()
    expect(tree.isEmpty()).toBe(true)
  })
})

describe('clear and single-node', () => {
  it('clears and supports a single node', () => {
    let tree = snapshotFromArray([42])
    expect(height(tree)).toBe(0)
    expect(balanceFactor(tree, tree.rootId)).toBe(0)
    tree = clear(tree)
    expect(isEmpty(tree)).toBe(true)
  })
})

describe('seeded random sequences', () => {
  it('preserves BST order and AVL balance after many updates', () => {
    const rand = mulberry32(20260320)
    let tree = createEmpty()

    for (let i = 0; i < 60; i += 1) {
      const value = (rand() % 200) - 50
      tree = insert(tree, value).snapshot
      assertInvariants(tree)
      expect(isBalanced(tree)).toBe(true)
    }

    for (let i = 0; i < 40; i += 1) {
      const values = toArray(tree)
      if (values.length === 0) {
        break
      }
      const value = values[rand() % values.length]!
      tree = deleteValue(tree, value).snapshot
      assertInvariants(tree)
      expect(isBalanced(tree)).toBe(true)
    }
  })
})

describe('visualization steps', () => {
  it('serializes and parses snapshots round-trip', () => {
    const tree = snapshotFromArray(AVL_DEFAULT_VALUES)
    const parsed = parseTreeSnapshot(serializeTreeSnapshot(tree))
    expect(parsed.rootId).toBe(tree.rootId)
    expect(parsed.nodes).toEqual(tree.nodes)
  })

  it('builds immutable insert steps for the LL demo', () => {
    const start = snapshotFromArray([30, 20])
    const steps = buildAVLTreeSteps(start, 'insert', 10)
    expect(steps.length).toBeGreaterThan(5)
    expect(steps.some((step) => step.meta?.rotationType === 'LL')).toBe(true)
    expect(steps.some((step) => step.meta?.phase === 'rotate')).toBe(true)

    const first = parseTreeSnapshot(String(steps[0]?.meta?.treeSnapshot ?? ''))
    const mid = parseTreeSnapshot(
      String(steps[Math.floor(steps.length / 2)]?.meta?.treeSnapshot ?? ''),
    )
    // Historical frames must not share mutable node arrays.
    expect(first.nodes).not.toBe(mid.nodes)

    const final = snapshotFromFinalStep(steps)
    expect(levelOrderTraversal(final)).toEqual([20, 10, 30])
    assertInvariants(final)
  })

  it('covers search, delete, and rotation demos', () => {
    const tree = snapshotFromArray(AVL_DEFAULT_VALUES)
    const searchSteps = buildAVLTreeSteps(tree, 'search', 10)
    expect(searchSteps.at(-1)?.meta?.success).toBe(true)

    const deleteSteps = buildAVLTreeSteps(tree, 'delete', 10)
    expect(deleteSteps.length).toBeGreaterThan(3)
    const afterDelete = snapshotFromFinalStep(deleteSteps)
    expect(toArray(afterDelete)).toEqual([20, 30])
    assertInvariants(afterDelete)

    for (const operation of [
      'rotate-ll',
      'rotate-rr',
      'rotate-lr',
      'rotate-rl',
    ] as const) {
      const demo = buildAVLTreeSteps(createEmpty(), operation, null)
      expect(demo.length).toBeGreaterThan(5)
      const final = snapshotFromFinalStep(demo)
      expect(levelOrderTraversal(final)).toEqual([20, 10, 30])
      assertInvariants(final)
    }
  })

  it('handles invalid inputs without corrupting the tree', () => {
    const tree = snapshotFromArray(AVL_DEFAULT_VALUES)
    const steps = buildAVLTreeSteps(tree, 'insert', null)
    expect(steps[0]?.meta?.phase).toBe('invalid')
    expect(toArray(snapshotFromFinalStep(steps))).toEqual([10, 20, 30])
  })

  it('keeps previous/next history stable across scrubbing', () => {
    const start = snapshotFromArray([30, 20])
    const steps = buildAVLTreeSteps(start, 'insert', 10)
    const snapshots = steps.map((step) =>
      serializeTreeSnapshot(
        parseTreeSnapshot(String(step.meta?.treeSnapshot ?? '')),
      ),
    )
    // Re-parse each historical frame independently.
    for (let i = 0; i < snapshots.length; i += 1) {
      expect(serializeTreeSnapshot(parseTreeSnapshot(snapshots[i]!))).toBe(
        snapshots[i],
      )
    }
  })
})
