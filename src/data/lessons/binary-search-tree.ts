import type { Lesson } from './types'

export const binarySearchTree: Lesson = {
  slug: 'binary-search-tree',
  title: 'Binary Search Tree',
  description:
    'Learn trees and binary search trees: roots, nodes, edges, the BST ordering property, insert, search, three deletion cases, and the four classic traversals — plus why tree shape controls complexity.',
  category: 'Data Structures',
  difficulty: 'Beginner',
  estimatedTime: '40 min',
  tags: [
    'Data Structures',
    'Trees',
    'Binary Search Tree',
    'BST',
    'Traversal',
    'Beginner',
  ],

  objectives: [
    'Understand what a tree data structure is.',
    'Name roots, nodes, edges, parents, children, leaves, and subtrees.',
    'Distinguish binary trees from binary search trees.',
    'State the BST ordering property.',
    'Insert and search for values using left/right decisions.',
    'Delete nodes with zero, one, or two children (inorder successor).',
    'Perform inorder, preorder, postorder, and level-order traversals.',
    'Explain how tree shape (height) affects operation complexity.',
  ],

  overview: [
    'A tree is a hierarchical collection of nodes connected by edges. Exactly one node is the root; every other node has one parent. Nodes with no children are leaves. A subtree is any node plus all of its descendants.',
    'A binary tree allows at most two children per node (commonly called left and right). A binary search tree (BST) adds an ordering rule: every value in the left subtree is smaller than the node, and every value in the right subtree is larger.',
    'That ordering turns search into a walk from the root: go left when the target is smaller, right when larger — the same idea as binary search on a sorted array, but stored as linked nodes instead of contiguous indices.',
    'Default playground tree: root 50, left 30 (20, 40), right 70 (60, 80). Inserting already-sorted values into an ordinary BST can produce a skewed chain and turn O(log n) hopes into O(n) walks. This lesson does not add AVL or Red-Black balancing — continue to the AVL Tree lesson for self-balancing rotations.',
  ],

  whyItMatters: [
    'Trees model hierarchies: file systems, UI component trees, org charts, and expression trees.',
    'BSTs support ordered data with efficient average-case search, insert, and delete when the tree stays reasonably balanced.',
    'Inorder traversal of a BST yields sorted order — useful for range scans and “next larger” queries.',
    'Understanding unbalanced shapes prepares you for later balanced trees and for choosing when a hash table is a better fit.',
  ],

  visualization: {
    title: 'Binary search tree in action',
    description:
      'Step through insert, search, delete (leaf / one child / two children), and all four traversals. Watch the search path, newly inserted nodes, and inorder-successor deletion.',
    type: 'binary-search-tree',
  },

  steps: [
    {
      title: 'See the tree vocabulary',
      description:
        'Root at the top, edges to children, parents above, leaves at the bottom, left and right subtrees under each node.',
    },
    {
      title: 'Apply the BST ordering property',
      description:
        'For every node, left subtree values are smaller and right subtree values are larger. Duplicates are ignored in this lesson.',
    },
    {
      title: 'Insert by walking left or right',
      description:
        'Compare with the current node: smaller → left, larger → right, until you find an empty child link and attach the new leaf.',
    },
    {
      title: 'Search along a single path',
      description:
        'The same left/right decisions locate a value or prove it is missing. The highlighted path is the work you paid for.',
    },
    {
      title: 'Delete in three cases',
      description:
        'Leaf: unlink. One child: promote the child. Two children: copy the inorder successor (min of right subtree), then remove that successor.',
    },
    {
      title: 'Traverse every node',
      description:
        'Inorder (L→Root→R), preorder (Root→L→R), postorder (L→R→Root), and level-order (breadth-first queue).',
    },
    {
      title: 'Relate height to cost',
      description:
        'Operations follow a root-to-leaf path. Height ≈ log n when balanced; height ≈ n − 1 when skewed. Ordinary BSTs do not guarantee balance.',
    },
  ],

  thinkingGuide: {
    title: 'Think in “compare → left or right”',
    description:
      'Before coding, rehearse the path from the root for insert, search, and delete.',
    steps: [
      'Name the target value and start at the root.',
      'At each node: equal → done (or duplicate); smaller → left; larger → right.',
      'On insert, stop at the first null child link and attach a new leaf.',
      'On delete, identify leaf / one-child / two-child, and for two children find the inorder successor first.',
      'Ask: is this tree likely balanced, or did sorted inserts make a stick?',
    ],
  },

  treeShapeExplorer: {
    description:
      'Compare a balanced shape with a skewed chain built from sorted inserts.',
    paragraphs: [
      'Both diagrams are ordinary BSTs — no rotation or rebalancing. The left tree was grown from a mixed insert order; the right tree from ascending values only.',
      'Search, insert, and delete walk a single root-to-target path. When height grows linearly with n, that path can visit every node.',
    ],
    balanced: {
      label: 'Balanced BST',
      values: [40, 20, 60, 10, 30, 50, 70],
    },
    skewed: {
      label: 'Skewed BST (sorted inserts)',
      values: [10, 20, 30, 40],
    },
    probeValue: 40,
    explanation:
      'Inserting already-sorted values into an ordinary BST produces a skewed tree that behaves like a linked list. Do not claim every BST guarantees O(log n) — that needs balance (AVL, Red-Black, or careful insert order).',
  },

  complexity: {
    time: {
      best: 'O(log n)',
      average: 'O(log n)',
      worst: 'O(n)',
    },
    space: 'O(n)',
    notes: {
      time: [
        'Search / insert / delete / find min / find max: average O(log n) when the tree is roughly balanced; worst O(n) when skewed.',
        'Any full traversal is always Θ(n) — you must visit every node.',
        'Average-case logarithmic cost is not a guarantee for an ordinary BST. Balance assumptions matter.',
        'Height measured in edges: empty = −1, leaf = 0. Path length grows with height.',
      ],
      space: [
        'Storing n nodes uses O(n) space for values and child links.',
        'Recursive traversals use O(h) call-stack space (h = height); level-order uses an O(w) queue (w = max width).',
      ],
    },
  },

  commonMistakes: {
    description:
      'Most BST bugs come from broken ordering, incomplete delete cases, or assuming perfect balance.',
    mistakes: [
      {
        title: 'Allowing duplicates without a policy',
        explanation:
          'This lesson ignores duplicate inserts. Other codebases store counts or push equals left/right — pick one rule and stick to it.',
      },
      {
        title: 'Forgetting the two-child delete case',
        explanation:
          'You cannot drop a node with two children without reconnecting both subtrees. Copy the inorder successor (or predecessor), then delete that node instead.',
      },
      {
        title: 'Claiming every BST is O(log n)',
        explanation:
          'Only balanced shapes deliver logarithmic height. Sorted inserts make a stick of height n − 1.',
      },
      {
        title: 'Confusing binary search on arrays with BST search',
        explanation:
          'Both discard half when data is ordered, but arrays use indices on contiguous memory; BSTs follow left/right pointers and can become unbalanced.',
      },
      {
        title: 'Mutating shared history while visualizing',
        explanation:
          'Clone node snapshots per frame. Reusing one mutable tree rewrites earlier steps when scrubbing previous/next.',
      },
      {
        title: 'Mixing height conventions',
        explanation:
          'Here height is edges: empty −1, leaf 0. Some texts count nodes instead. State your convention.',
      },
    ],
  },

  algorithmConnection: {
    title: 'BST vs Binary Search vs Hash Table',
    eyebrow: 'COMPARE',
    description:
      'Same “halving” intuition as binary search — different storage — and a contrast with average-case hashing.',
    items: [
      {
        title: 'Binary Search on a sorted array',
        description:
          'Indices mid = (lo+hi)/2 discard half the range each step. Needs contiguous sorted storage and O(n) shifts for inserts in the middle. Lesson: /learn/binary-search.',
      },
      {
        title: 'Binary Search Tree',
        description:
          'Left/right child links encode order. Inserts attach leaves without shifting an array, but height depends on shape. Inorder yields sorted order.',
      },
      {
        title: 'Hash Table',
        description:
          'Average O(1) key lookup without ordering. No cheap sorted traversal or range queries. Prefer hashing when you only need associative access.',
      },
      {
        title: 'When trees win',
        description:
          'Hierarchies, ordered iteration, successor/predecessor, and range queries favor trees (especially balanced ones).',
      },
      {
        title: 'Next: AVL Tree',
        description:
          'Self-balancing BSTs restore |balance factor| ≤ 1 with LL/RR/LR/RL rotations so height stays O(log n). Lesson: /learn/avl-tree.',
      },
    ],
  },

  pseudocode: `BST node
  value
  left = null
  right = null

// Ordering: all in left subtree < value < all in right subtree
// Duplicates: ignore (this lesson)

Insert(root, value)
  if root is null
      return new Node(value)
  if value == root.value
      return root                  // duplicate ignored
  if value < root.value
      root.left = Insert(root.left, value)
  else
      root.right = Insert(root.right, value)
  return root

Search(root, value)
  if root is null
      return not found
  if value == root.value
      return found
  if value < root.value
      return Search(root.left, value)
  return Search(root.right, value)

FindMin(node)                      // leftmost
  while node.left is not null
      node = node.left
  return node

Delete(root, value)
  if root is null
      return null
  if value < root.value
      root.left = Delete(root.left, value)
  else if value > root.value
      root.right = Delete(root.right, value)
  else
      // found the node
      if root.left is null and root.right is null
          return null              // leaf
      if root.left is null
          return root.right        // one child
      if root.right is null
          return root.left         // one child
      // two children: inorder successor
      succ = FindMin(root.right)
      root.value = succ.value
      root.right = Delete(root.right, succ.value)
  return root

Inorder(node)      // Left → Root → Right
  if node is null: return
  Inorder(node.left); visit(node); Inorder(node.right)

Preorder(node)     // Root → Left → Right
Postorder(node)    // Left → Right → Root
LevelOrder(root)   // queue / BFS from root

Height(node)       // edges; empty = -1, leaf = 0
  if node is null: return -1
  return 1 + max(Height(node.left), Height(node.right))`,

  code: {
    python: `class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None


class BinarySearchTree:
    """Ordinary BST — not self-balancing. Height in edges (empty = -1)."""

    def __init__(self):
        self.root = None

    def insert(self, value):
        self.root = self._insert(self.root, value)

    def _insert(self, node, value):
        if node is None:
            return Node(value)
        if value == node.value:
            return node  # ignore duplicate
        if value < node.value:
            node.left = self._insert(node.left, value)
        else:
            node.right = self._insert(node.right, value)
        return node

    def search(self, value):
        node = self.root
        while node is not None:
            if value == node.value:
                return True
            node = node.left if value < node.value else node.right
        return False

    def _find_min(self, node):
        while node.left is not None:
            node = node.left
        return node

    def delete(self, value):
        self.root = self._delete(self.root, value)

    def _delete(self, node, value):
        if node is None:
            return None
        if value < node.value:
            node.left = self._delete(node.left, value)
        elif value > node.value:
            node.right = self._delete(node.right, value)
        else:
            if node.left is None:
                return node.right
            if node.right is None:
                return node.left
            succ = self._find_min(node.right)
            node.value = succ.value
            node.right = self._delete(node.right, succ.value)
        return node

    def inorder(self):
        out = []
        def walk(n):
            if n is None:
                return
            walk(n.left)
            out.append(n.value)
            walk(n.right)
        walk(self.root)
        return out

    def height(self):
        def h(n):
            if n is None:
                return -1
            return 1 + max(h(n.left), h(n.right))
        return h(self.root)


bst = BinarySearchTree()
for v in [50, 30, 70, 20, 40, 60, 80]:
    bst.insert(v)
print(bst.inorder())   # [20, 30, 40, 50, 60, 70, 80]
print(bst.search(40))  # True
bst.delete(30)
print(bst.inorder())   # [20, 40, 50, 60, 70, 80]
print(bst.height())    # 2`,

    javascript: `class Node {
  constructor(value) {
    this.value = value
    this.left = null
    this.right = null
  }
}

class BinarySearchTree {
  /** Ordinary BST — not self-balancing. Height in edges (empty = -1). */
  constructor() {
    this.root = null
  }

  insert(value) {
    this.root = this.#insert(this.root, value)
  }

  #insert(node, value) {
    if (node === null) return new Node(value)
    if (value === node.value) return node // ignore duplicate
    if (value < node.value) node.left = this.#insert(node.left, value)
    else node.right = this.#insert(node.right, value)
    return node
  }

  search(value) {
    let node = this.root
    while (node !== null) {
      if (value === node.value) return true
      node = value < node.value ? node.left : node.right
    }
    return false
  }

  #findMin(node) {
    while (node.left !== null) node = node.left
    return node
  }

  delete(value) {
    this.root = this.#delete(this.root, value)
  }

  #delete(node, value) {
    if (node === null) return null
    if (value < node.value) node.left = this.#delete(node.left, value)
    else if (value > node.value) node.right = this.#delete(node.right, value)
    else {
      if (node.left === null) return node.right
      if (node.right === null) return node.left
      const succ = this.#findMin(node.right)
      node.value = succ.value
      node.right = this.#delete(node.right, succ.value)
    }
    return node
  }

  inorderTraversal() {
    const out = []
    const walk = (n) => {
      if (n === null) return
      walk(n.left)
      out.push(n.value)
      walk(n.right)
    }
    walk(this.root)
    return out
  }

  height() {
    const h = (n) => (n === null ? -1 : 1 + Math.max(h(n.left), h(n.right)))
    return h(this.root)
  }
}

const bst = new BinarySearchTree()
for (const v of [50, 30, 70, 20, 40, 60, 80]) bst.insert(v)
console.log(bst.inorderTraversal()) // [20, 30, 40, 50, 60, 70, 80]
console.log(bst.search(40)) // true
bst.delete(30)
console.log(bst.inorderTraversal()) // [20, 40, 50, 60, 70, 80]
console.log(bst.height()) // 2`,

    typescript: `type BSTNode = {
  value: number
  left: BSTNode | null
  right: BSTNode | null
}

class BinarySearchTree {
  /** Ordinary BST — not self-balancing. Height in edges (empty = -1). */
  private root: BSTNode | null = null

  insert(value: number): boolean {
    const before = this.search(value)
    this.root = this.insertNode(this.root, value)
    return !before
  }

  private insertNode(node: BSTNode | null, value: number): BSTNode {
    if (node === null) return { value, left: null, right: null }
    if (value === node.value) return node // ignore duplicate
    if (value < node.value) node.left = this.insertNode(node.left, value)
    else node.right = this.insertNode(node.right, value)
    return node
  }

  search(value: number): boolean {
    let node = this.root
    while (node !== null) {
      if (value === node.value) return true
      node = value < node.value ? node.left : node.right
    }
    return false
  }

  private findMinNode(node: BSTNode): BSTNode {
    while (node.left !== null) node = node.left
    return node
  }

  delete(value: number): boolean {
    if (!this.search(value)) return false
    this.root = this.deleteNode(this.root, value)
    return true
  }

  private deleteNode(node: BSTNode | null, value: number): BSTNode | null {
    if (node === null) return null
    if (value < node.value) node.left = this.deleteNode(node.left, value)
    else if (value > node.value) node.right = this.deleteNode(node.right, value)
    else {
      if (node.left === null) return node.right
      if (node.right === null) return node.left
      const succ = this.findMinNode(node.right)
      node.value = succ.value
      node.right = this.deleteNode(node.right, succ.value)
    }
    return node
  }

  inorderTraversal(): number[] {
    const out: number[] = []
    const walk = (n: BSTNode | null) => {
      if (n === null) return
      walk(n.left)
      out.push(n.value)
      walk(n.right)
    }
    walk(this.root)
    return out
  }

  preorderTraversal(): number[] {
    const out: number[] = []
    const walk = (n: BSTNode | null) => {
      if (n === null) return
      out.push(n.value)
      walk(n.left)
      walk(n.right)
    }
    walk(this.root)
    return out
  }

  postorderTraversal(): number[] {
    const out: number[] = []
    const walk = (n: BSTNode | null) => {
      if (n === null) return
      walk(n.left)
      walk(n.right)
      out.push(n.value)
    }
    walk(this.root)
    return out
  }

  levelOrderTraversal(): number[] {
    if (this.root === null) return []
    const out: number[] = []
    const queue: BSTNode[] = [this.root]
    while (queue.length > 0) {
      const n = queue.shift()!
      out.push(n.value)
      if (n.left) queue.push(n.left)
      if (n.right) queue.push(n.right)
    }
    return out
  }

  findMin(): number | null {
    if (this.root === null) return null
    return this.findMinNode(this.root).value
  }

  findMax(): number | null {
    if (this.root === null) return null
    let node = this.root
    while (node.right !== null) node = node.right
    return node.value
  }

  height(): number {
    const h = (n: BSTNode | null): number =>
      n === null ? -1 : 1 + Math.max(h(n.left), h(n.right))
    return h(this.root)
  }

  isEmpty(): boolean {
    return this.root === null
  }

  clear(): void {
    this.root = null
  }

  toArray(): number[] {
    return this.inorderTraversal()
  }
}

const bst = new BinarySearchTree()
for (const v of [50, 30, 70, 20, 40, 60, 80]) bst.insert(v)
console.log(bst.inorderTraversal()) // [20, 30, 40, 50, 60, 70, 80]
console.log(bst.search(40)) // true
bst.delete(30)
console.log(bst.toArray()) // [20, 40, 50, 60, 70, 80]
console.log(bst.height()) // 2`,
  },

  whenToUse: [
    'You need ordered data with efficient average-case search, insert, and delete.',
    'You want inorder traversal (sorted order) or successor/predecessor style queries.',
    'You are modeling hierarchical relationships with at most two children per node.',
    'You can accept (or later add) balancing so height stays near log n.',
  ],

  whenNotToUse: [
    'You only need unordered key → value lookup — a hash table is usually simpler and faster on average.',
    'You must guarantee O(log n) worst case — use a balanced tree (AVL, Red-Black) or another structure.',
    'You need arbitrary many children per node — use a general tree or trie as appropriate.',
    'Your inserts arrive already sorted and you will not rebalance — expect O(n) paths.',
  ],

  keyTakeaways: [
    'Trees have a root, edges, parents, children, leaves, and subtrees.',
    'A BST adds left < node < right; duplicates are ignored in this lesson.',
    'Insert and search walk one path using compare → left/right.',
    'Delete has three cases; two children use the inorder successor.',
    'Inorder / preorder / postorder / level-order visit every node in different orders.',
    'Complexity follows height: balanced ≈ O(log n), skewed ≈ O(n). Ordinary BSTs do not guarantee balance.',
    'Binary search on arrays shares the halving idea but uses indices, not child pointers.',
  ],

  previousLesson: {
    title: 'Hash Table',
    href: '/learn/hash-table',
  },

  nextLesson: {
    title: 'AVL Tree',
    href: '/learn/avl-tree',
  },

  categoryHref: '/data-structures',
}
