import { describe, expect, it } from 'vitest'
import {
  BinarySearchTree,
  assertInvariants,
  clear,
  cloneSnapshot,
  createEmpty,
  deleteValue,
  findMax,
  findMin,
  height,
  inorderTraversal,
  insert,
  isEmpty,
  levelOrderTraversal,
  postorderTraversal,
  preorderTraversal,
  search,
  size,
  snapshotFromArray,
  toArray,
  BST_BALANCED_VALUES,
  BST_DEFAULT_VALUES,
  BST_SKEWED_VALUES,
} from './binarySearchTree'
import {
  buildBinarySearchTreeSteps,
  parseTreeSnapshot,
  serializeTreeSnapshot,
  snapshotFromFinalStep,
} from './binarySearchTreeSteps'

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
    assertInvariants(tree)
  })
})

describe('insert', () => {
  it('inserts into an empty tree as the root', () => {
    const result = insert(createEmpty(), 50)
    expect(result.inserted).toBe(true)
    expect(result.nodeId).toBe('n0')
    expect(result.snapshot.rootId).toBe('n0')
    expect(toArray(result.snapshot)).toEqual([50])
    expect(height(result.snapshot)).toBe(0)
    assertInvariants(result.snapshot)
  })

  it('places smaller values left and larger values right', () => {
    let tree = createEmpty()
    tree = insert(tree, 50).snapshot
    tree = insert(tree, 30).snapshot
    tree = insert(tree, 70).snapshot
    tree = insert(tree, 20).snapshot
    tree = insert(tree, 40).snapshot

    const byId = new Map(tree.nodes.map((n) => [n.id, n]))
    const root = byId.get(tree.rootId!)!
    expect(root.value).toBe(50)
    expect(byId.get(root.leftId!)!.value).toBe(30)
    expect(byId.get(root.rightId!)!.value).toBe(70)
    expect(toArray(tree)).toEqual([20, 30, 40, 50, 70])
    assertInvariants(tree)
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
    tree = insert(tree, -5).snapshot // duplicate
    expect(toArray(tree)).toEqual([-5, 0, 3])
    expect(search(tree, -5).found).toBe(true)
    expect(search(tree, 0).found).toBe(true)
    assertInvariants(tree)
  })

  it('builds the default lesson tree', () => {
    const tree = snapshotFromArray(BST_DEFAULT_VALUES)
    expect(toArray(tree)).toEqual([20, 30, 40, 50, 60, 70, 80])
    expect(height(tree)).toBe(2)
    assertInvariants(tree)
  })
})

describe('search', () => {
  const tree = snapshotFromArray(BST_DEFAULT_VALUES)

  it('finds existing values and records the path', () => {
    const result = search(tree, 40)
    expect(result.found).toBe(true)
    expect(result.pathIds.length).toBeGreaterThan(0)
    const byId = new Map(tree.nodes.map((n) => [n.id, n]))
    expect(byId.get(result.nodeId!)!.value).toBe(40)
    expect(byId.get(result.pathIds[0]!)!.value).toBe(50)
  })

  it('reports missing values with the failed path', () => {
    const result = search(tree, 45)
    expect(result.found).toBe(false)
    expect(result.nodeId).toBeNull()
    expect(result.pathIds.length).toBeGreaterThan(0)
  })
})

describe('delete', () => {
  it('deletes a leaf', () => {
    let tree = snapshotFromArray(BST_DEFAULT_VALUES)
    const result = deleteValue(tree, 20)
    expect(result.deleted).toBe(true)
    expect(result.caseKind).toBe('leaf')
    expect(toArray(result.snapshot)).toEqual([30, 40, 50, 60, 70, 80])
    assertInvariants(result.snapshot)
  })

  it('deletes a node with one child', () => {
    // 50 → 30 → 20 (left only after removing 40)
    let tree = snapshotFromArray([50, 30, 20, 70])
    const result = deleteValue(tree, 30)
    expect(result.deleted).toBe(true)
    expect(result.caseKind).toBe('one-child')
    expect(toArray(result.snapshot)).toEqual([20, 50, 70])
    assertInvariants(result.snapshot)
  })

  it('deletes a node with two children via inorder successor', () => {
    let tree = snapshotFromArray(BST_DEFAULT_VALUES)
    const result = deleteValue(tree, 30)
    expect(result.deleted).toBe(true)
    expect(result.caseKind).toBe('two-children')
    // successor of 30 is 40
    expect(toArray(result.snapshot)).toEqual([20, 40, 50, 60, 70, 80])
    assertInvariants(result.snapshot)
  })

  it('deletes the root', () => {
    let tree = snapshotFromArray(BST_DEFAULT_VALUES)
    const result = deleteValue(tree, 50)
    expect(result.deleted).toBe(true)
    expect(result.caseKind).toBe('two-children')
    // successor of 50 is 60
    expect(toArray(result.snapshot)).toEqual([20, 30, 40, 60, 70, 80])
    expect(result.snapshot.nodes.find((n) => n.id === tree.rootId)?.value).toBe(
      60,
    )
    assertInvariants(result.snapshot)
  })

  it('deletes the only node', () => {
    let tree = snapshotFromArray([42])
    const result = deleteValue(tree, 42)
    expect(result.deleted).toBe(true)
    expect(result.caseKind).toBe('leaf')
    expect(isEmpty(result.snapshot)).toBe(true)
    expect(height(result.snapshot)).toBe(-1)
  })

  it('leaves the tree unchanged when the value is missing', () => {
    const tree = snapshotFromArray(BST_DEFAULT_VALUES)
    const result = deleteValue(tree, 99)
    expect(result.deleted).toBe(false)
    expect(toArray(result.snapshot)).toEqual(toArray(tree))
  })
})

describe('traversals', () => {
  const tree = snapshotFromArray(BST_DEFAULT_VALUES)

  it('returns correct inorder / preorder / postorder / level-order', () => {
    expect(inorderTraversal(tree)).toEqual([20, 30, 40, 50, 60, 70, 80])
    expect(preorderTraversal(tree)).toEqual([50, 30, 20, 40, 70, 60, 80])
    expect(postorderTraversal(tree)).toEqual([20, 40, 30, 60, 80, 70, 50])
    expect(levelOrderTraversal(tree)).toEqual([50, 30, 70, 20, 40, 60, 80])
  })
})

describe('findMin / findMax / height / clear', () => {
  it('finds extremes and respects height convention', () => {
    const tree = snapshotFromArray(BST_DEFAULT_VALUES)
    expect(findMin(tree).value).toBe(20)
    expect(findMax(tree).value).toBe(80)
    expect(height(tree)).toBe(2)
    expect(height(snapshotFromArray([10]))).toBe(0)
    expect(height(createEmpty())).toBe(-1)
  })

  it('clear returns an empty tree', () => {
    const tree = snapshotFromArray(BST_DEFAULT_VALUES)
    const emptied = clear(tree)
    expect(isEmpty(emptied)).toBe(true)
    expect(height(emptied)).toBe(-1)
  })
})

describe('balanced vs skewed shape', () => {
  it('balanced tree has smaller height than skewed for similar sizes', () => {
    const balanced = snapshotFromArray(BST_BALANCED_VALUES)
    const skewed = snapshotFromArray(BST_SKEWED_VALUES)
    expect(height(balanced)).toBe(2)
    expect(height(skewed)).toBe(3)
    expect(size(balanced)).toBe(7)
    expect(size(skewed)).toBe(4)
    // Searching 40 in skewed walks all four nodes
    expect(search(skewed, 40).pathIds.length).toBe(4)
    assertInvariants(balanced)
    assertInvariants(skewed)
  })
})

describe('BinarySearchTree class API', () => {
  it('exposes the documented methods', () => {
    const bst = new BinarySearchTree()
    expect(bst.isEmpty()).toBe(true)
    expect(bst.insert(50)).toBe(true)
    expect(bst.insert(30)).toBe(true)
    expect(bst.insert(50)).toBe(false)
    expect(bst.search(30)).toBe(true)
    expect(bst.findMin()).toBe(30)
    expect(bst.findMax()).toBe(50)
    expect(bst.height()).toBe(1)
    expect(bst.inorderTraversal()).toEqual([30, 50])
    expect(bst.preorderTraversal()).toEqual([50, 30])
    expect(bst.postorderTraversal()).toEqual([30, 50])
    expect(bst.levelOrderTraversal()).toEqual([50, 30])
    expect(bst.delete(30)).toBe(true)
    expect(bst.toArray()).toEqual([50])
    bst.clear()
    expect(bst.isEmpty()).toBe(true)
  })
})

describe('immutable snapshots', () => {
  it('cloneSnapshot isolates historical frames', () => {
    const original = snapshotFromArray([50, 30])
    const cloned = cloneSnapshot(original)
    const mutated = insert(cloned, 70).snapshot
    expect(toArray(original)).toEqual([30, 50])
    expect(toArray(mutated)).toEqual([30, 50, 70])
    expect(original.nodes).not.toBe(mutated.nodes)
  })
})

describe('visualization steps', () => {
  it('serializes and parses snapshots without losing structure', () => {
    const tree = snapshotFromArray(BST_DEFAULT_VALUES)
    const roundTrip = parseTreeSnapshot(serializeTreeSnapshot(tree))
    expect(toArray(roundTrip)).toEqual(toArray(tree))
    expect(roundTrip.rootId).toBe(tree.rootId)
    expect(roundTrip.nextIdCounter).toBe(tree.nextIdCounter)
  })

  it('keeps historical insert frames immutable while applying final', () => {
    const start = snapshotFromArray([50, 30, 70])
    const steps = buildBinarySearchTreeSteps(start, 'insert', 40)
    expect(steps.length).toBeGreaterThan(1)
    const first = parseTreeSnapshot(String(steps[0]!.meta?.treeSnapshot ?? ''))
    expect(toArray(first)).toEqual([30, 50, 70])

    const final = snapshotFromFinalStep(steps)
    expect(toArray(final)).toEqual([30, 40, 50, 70])
    expect(toArray(start)).toEqual([30, 50, 70])
  })

  it('highlights search path for found and missing values', () => {
    const tree = snapshotFromArray(BST_DEFAULT_VALUES)
    const foundSteps = buildBinarySearchTreeSteps(tree, 'search', 40)
    const lastFound = foundSteps[foundSteps.length - 1]!
    expect(lastFound.meta?.success).toBe(true)

    const missSteps = buildBinarySearchTreeSteps(tree, 'search', 45)
    const lastMiss = missSteps[missSteps.length - 1]!
    expect(lastMiss.meta?.success).toBe(false)
  })

  it('walks delete cases including two-child successor', () => {
    const tree = snapshotFromArray(BST_DEFAULT_VALUES)
    const steps = buildBinarySearchTreeSteps(tree, 'delete', 30)
    expect(steps.some((s) => s.meta?.phase === 'find-successor')).toBe(true)
    const final = snapshotFromFinalStep(steps)
    expect(toArray(final)).toEqual([20, 40, 50, 60, 70, 80])
  })

  it('produces traversal visit order for all four traversals', () => {
    const tree = snapshotFromArray(BST_DEFAULT_VALUES)
    for (const op of [
      'inorder',
      'preorder',
      'postorder',
      'level-order',
    ] as const) {
      const steps = buildBinarySearchTreeSteps(tree, op, null)
      expect(steps.length).toBeGreaterThan(1)
      const last = steps[steps.length - 1]!
      expect(last.meta?.success).toBe(true)
      expect(typeof last.meta?.result).toBe('string')
    }
  })

  it('validates empty / missing inputs', () => {
    const emptySteps = buildBinarySearchTreeSteps(createEmpty(), 'delete', 10)
    expect(emptySteps.some((s) => s.meta?.phase === 'invalid' || s.meta?.success === false)).toBe(
      true,
    )

    const bad = buildBinarySearchTreeSteps(
      snapshotFromArray([50]),
      'insert',
      null,
    )
    expect(bad[bad.length - 1]!.meta?.phase).toBe('invalid')
  })
})
