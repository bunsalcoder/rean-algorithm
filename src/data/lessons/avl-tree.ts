import type { Lesson } from './types'

export const avlTree: Lesson = {
  slug: 'avl-tree',
  title: 'AVL Tree',
  description:
    'Learn self-balancing binary search trees: node heights, balance factors, LL/RR/LR/RL rotations, and how AVL insert and delete keep height logarithmic.',
  category: 'Data Structures',
  difficulty: 'Intermediate',
  estimatedTime: '45 min',
  tags: [
    'Data Structures',
    'Trees',
    'AVL',
    'Self-Balancing',
    'Binary Search Tree',
    'Rotations',
    'Intermediate',
  ],

  objectives: [
    'Explain why ordinary BSTs can become unbalanced.',
    'Define a self-balancing binary search tree.',
    'Compute node heights and balance factors.',
    'Identify LL, RR, LR, and RL imbalance cases.',
    'Perform left and right rotations (including double rotations).',
    'Insert and delete values while restoring the AVL invariant.',
    'State AVL operation complexities and trade-offs versus an ordinary BST.',
  ],

  overview: [
    'An ordinary binary search tree keeps the ordering property left < node < right, but it does not control height. Inserting already-sorted values can produce a stick of height n − 1 and turn hoped-for O(log n) searches into O(n) walks.',
    'An AVL tree is a BST that also stores (or recomputes) each node’s height and enforces |balance factor| ≤ 1 everywhere. Balance factor = height(left) − height(right). Empty subtrees have height −1; leaves have height 0.',
    'When an insert or delete would break that rule, the tree applies one or two rotations (LL, RR, LR, or RL) so every node returns to a valid factor. Rotations rearrange links without breaking BST order.',
    'Default playground sequence: insert 30, then 20, then 10. Inserting 10 creates an LL imbalance at 30; a right rotation restores the balanced tree with root 20 and children 10 and 30.',
  ],

  whyItMatters: [
    'Self-balancing trees give a strong height guarantee: search, insert, and delete stay O(log n) even when inputs arrive sorted.',
    'AVL is a classic teaching structure for rotations and balance factors — skills that transfer to other balanced trees.',
    'Understanding when to pay for rotations versus accepting a simpler unbalanced BST (or a hash table) is a core design trade-off.',
    'Many production ordered maps use related ideas (though often Red-Black trees); AVL remains an excellent foundation.',
  ],

  visualization: {
    title: 'AVL tree in action',
    description:
      'Step through insert, delete, and search with height updates, balance-factor checks, and LL/RR/LR/RL rotations. Watch the default 30 → 20 → 10 LL demo restore root 20.',
    type: 'avl-tree',
  },

  steps: [
    {
      title: 'See why BSTs can skew',
      description:
        'Sorted inserts into an ordinary BST grow a linked-list shape. Path length becomes linear in n.',
    },
    {
      title: 'Store height on every node',
      description:
        'Height(empty) = −1, height(leaf) = 0, height(node) = 1 + max(height(left), height(right)).',
    },
    {
      title: 'Compute the balance factor',
      description:
        'BF = height(left) − height(right). AVL requires BF ∈ {−1, 0, 1} at every node.',
    },
    {
      title: 'Classify LL, RR, LR, RL',
      description:
        'Look at which side is heavy and which grandchild side is heavy. That selects the rotation pattern.',
    },
    {
      title: 'Rotate to restore balance',
      description:
        'Single left/right rotations for RR/LL; double rotations for LR/RL. BST order is preserved.',
    },
    {
      title: 'Insert then rebalance upward',
      description:
        'Place like a BST, update heights on the path to the root, rotate at the first (or each) unbalanced ancestor.',
    },
    {
      title: 'Delete then rebalance upward',
      description:
        'Delete like a BST (leaf / one child / two children), then walk back updating heights and rotating as needed.',
    },
  ],

  thinkingGuide: {
    title: 'Think “place → height → BF → rotate”',
    description:
      'AVL updates are BST updates plus a disciplined walk back to the root.',
    steps: [
      'Perform the ordinary BST insert or delete.',
      'On the path toward the root, recompute each node’s height.',
      'Compute BF = height(left) − height(right).',
      'If |BF| > 1, identify LL / RR / LR / RL from the heavy child (and grandchild).',
      'Apply the matching rotation(s), refresh heights, and continue upward if needed.',
      'Confirm every node still has BF ∈ {−1, 0, 1} and inorder stays sorted.',
    ],
  },

  complexity: {
    time: {
      best: 'O(log n)',
      average: 'O(log n)',
      worst: 'O(log n)',
    },
    space: 'O(n)',
    notes: {
      time: [
        'Search / insert / delete / find min / find max are O(log n) because AVL height is O(log n).',
        'A single update may perform O(1) or O(log n) rotations along the path, still within O(log n) total work.',
        'Any full traversal remains Θ(n).',
        'Compared with an ordinary BST, you pay rotation work on updates to keep worst-case logarithmic search.',
      ],
      space: [
        'O(n) for nodes; each node stores an extra height (or equivalent) field.',
        'Recursive implementations use O(log n) call-stack space on a balanced tree.',
      ],
    },
  },

  commonMistakes: {
    description:
      'Most AVL bugs come from wrong balance-factor signs, incomplete double rotations, or forgetting to rebalance after delete.',
    mistakes: [
      {
        title: 'Swapping the balance-factor formula',
        explanation:
          'This lesson uses BF = height(left) − height(right). Some texts flip the sign. Pick one convention and match your rotation cases to it.',
      },
      {
        title: 'Updating only the rotated nodes’ heights incorrectly',
        explanation:
          'After a rotation, recompute heights bottom-up for every node whose children changed — typically the old pivot first, then the new subtree root.',
      },
      {
        title: 'Treating LR/RL as a single magic step',
        explanation:
          'Double rotations are two single rotations. Visualize both: child first, then the unbalanced node.',
      },
      {
        title: 'Rebalancing insert but not delete',
        explanation:
          'Deletion can unbalance ancestors just like insertion. Walk back to the root and rotate wherever |BF| > 1.',
      },
      {
        title: 'Breaking BST order during a rotation',
        explanation:
          'Rotations only rewire parent/child links among three subtrees. Inorder must stay sorted; if it does not, a link was assigned wrong.',
      },
      {
        title: 'Claiming AVL needs no extra metadata',
        explanation:
          'You need stored heights (or another way to know subtree height quickly). That is the cost of the height guarantee.',
      },
    ],
  },

  algorithmConnection: {
    title: 'AVL Tree vs Ordinary BST',
    eyebrow: 'COMPARE',
    description:
      'Same ordering property — different height guarantee and update cost.',
    items: [
      {
        title: 'Self-balancing',
        description:
          'Ordinary BST: no. AVL tree: yes — rotations restore |BF| ≤ 1 after updates.',
      },
      {
        title: 'Height guarantee',
        description:
          'Ordinary BST: none (can be Θ(n)). AVL: O(log n) height for n nodes.',
      },
      {
        title: 'Search worst case',
        description:
          'Ordinary BST: O(n) when skewed. AVL: O(log n) because height stays logarithmic.',
      },
      {
        title: 'Insertion & deletion',
        description:
          'Ordinary BST: simpler link updates. AVL: same BST logic plus height updates and possible rotations.',
      },
      {
        title: 'Extra metadata',
        description:
          'Ordinary BST: usually only value + child links. AVL: stores height (or equivalent) on each node.',
      },
      {
        title: 'When AVL wins',
        description:
          'Choose AVL (or another balanced tree) when you need ordered data with reliable logarithmic worst-case updates — not only average-case hope.',
      },
    ],
  },

  pseudocode: `AVL node
  value
  left = null
  right = null
  height = 0                 // leaf = 0; empty child height = -1

Height(node)
  if node is null: return -1
  return node.height

BalanceFactor(node)          // convention in this lesson
  return Height(node.left) - Height(node.right)

UpdateHeight(node)
  node.height = 1 + max(Height(node.left), Height(node.right))

RotateRight(y)               // LL single rotation
  x = y.left
  y.left = x.right
  x.right = y
  UpdateHeight(y); UpdateHeight(x)
  return x

RotateLeft(x)                // RR single rotation
  y = x.right
  x.right = y.left
  y.left = x
  UpdateHeight(x); UpdateHeight(y)
  return y

Rebalance(node)
  UpdateHeight(node)
  bf = BalanceFactor(node)
  if bf > 1                       // left heavy
      if BalanceFactor(node.left) < 0
          node.left = RotateLeft(node.left)   // LR
      return RotateRight(node)                // LL (or finish LR)
  if bf < -1                      // right heavy
      if BalanceFactor(node.right) > 0
          node.right = RotateRight(node.right) // RL
      return RotateLeft(node)                  // RR (or finish RL)
  return node

Insert(node, value)
  if node is null: return new Node(value)
  if value == node.value: return node         // duplicate ignored
  if value < node.value
      node.left = Insert(node.left, value)
  else
      node.right = Insert(node.right, value)
  return Rebalance(node)

Delete(node, value)           // standard BST delete, then Rebalance
  ... BST cases (leaf / one child / two children via inorder successor) ...
  return Rebalance(node)      // on the way back to the root`,

  code: {
    python: `class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None
        self.height = 0  # leaf


def height(node):
    return -1 if node is None else node.height


def balance_factor(node):
    if node is None:
        return 0
    return height(node.left) - height(node.right)


def update_height(node):
    node.height = 1 + max(height(node.left), height(node.right))


def rotate_right(y):
    x = y.left
    y.left = x.right
    x.right = y
    update_height(y)
    update_height(x)
    return x


def rotate_left(x):
    y = x.right
    x.right = y.left
    y.left = x
    update_height(x)
    update_height(y)
    return y


def rebalance(node):
    update_height(node)
    bf = balance_factor(node)
    if bf > 1:
        if balance_factor(node.left) < 0:
            node.left = rotate_left(node.left)
        return rotate_right(node)
    if bf < -1:
        if balance_factor(node.right) > 0:
            node.right = rotate_right(node.right)
        return rotate_left(node)
    return node


class AVLTree:
    def __init__(self):
        self.root = None

    def insert(self, value):
        self.root = self._insert(self.root, value)

    def _insert(self, node, value):
        if node is None:
            return Node(value)
        if value == node.value:
            return node
        if value < node.value:
            node.left = self._insert(node.left, value)
        else:
            node.right = self._insert(node.right, value)
        return rebalance(node)

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
        return rebalance(node)

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


avl = AVLTree()
for v in [30, 20, 10]:
    avl.insert(v)
print(avl.inorder())  # [10, 20, 30]
print(avl.root.value)  # 20`,
    javascript: `class Node {
  constructor(value) {
    this.value = value
    this.left = null
    this.right = null
    this.height = 0
  }
}

function height(node) {
  return node === null ? -1 : node.height
}

function balanceFactor(node) {
  if (node === null) return 0
  return height(node.left) - height(node.right)
}

function updateHeight(node) {
  node.height = 1 + Math.max(height(node.left), height(node.right))
}

function rotateRight(y) {
  const x = y.left
  y.left = x.right
  x.right = y
  updateHeight(y)
  updateHeight(x)
  return x
}

function rotateLeft(x) {
  const y = x.right
  x.right = y.left
  y.left = x
  updateHeight(x)
  updateHeight(y)
  return y
}

function rebalance(node) {
  updateHeight(node)
  const bf = balanceFactor(node)
  if (bf > 1) {
    if (balanceFactor(node.left) < 0) node.left = rotateLeft(node.left)
    return rotateRight(node)
  }
  if (bf < -1) {
    if (balanceFactor(node.right) > 0) node.right = rotateRight(node.right)
    return rotateLeft(node)
  }
  return node
}

class AVLTree {
  constructor() {
    this.root = null
  }

  insert(value) {
    this.root = this._insert(this.root, value)
  }

  _insert(node, value) {
    if (node === null) return new Node(value)
    if (value === node.value) return node
    if (value < node.value) node.left = this._insert(node.left, value)
    else node.right = this._insert(node.right, value)
    return rebalance(node)
  }

  search(value) {
    let node = this.root
    while (node !== null) {
      if (value === node.value) return true
      node = value < node.value ? node.left : node.right
    }
    return false
  }

  _findMin(node) {
    while (node.left !== null) node = node.left
    return node
  }

  delete(value) {
    this.root = this._delete(this.root, value)
  }

  _delete(node, value) {
    if (node === null) return null
    if (value < node.value) node.left = this._delete(node.left, value)
    else if (value > node.value) node.right = this._delete(node.right, value)
    else {
      if (node.left === null) return node.right
      if (node.right === null) return node.left
      const succ = this._findMin(node.right)
      node.value = succ.value
      node.right = this._delete(node.right, succ.value)
    }
    return rebalance(node)
  }

  inorder() {
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
}

const avl = new AVLTree()
for (const v of [30, 20, 10]) avl.insert(v)
console.log(avl.inorder()) // [10, 20, 30]
console.log(avl.root.value) // 20`,
    typescript: `class AVLNode {
  left: AVLNode | null = null
  right: AVLNode | null = null
  height = 0
  constructor(public value: number) {}
}

function height(node: AVLNode | null): number {
  return node === null ? -1 : node.height
}

function balanceFactor(node: AVLNode | null): number {
  if (node === null) return 0
  return height(node.left) - height(node.right)
}

function updateHeight(node: AVLNode): void {
  node.height = 1 + Math.max(height(node.left), height(node.right))
}

function rotateRight(y: AVLNode): AVLNode {
  const x = y.left!
  y.left = x.right
  x.right = y
  updateHeight(y)
  updateHeight(x)
  return x
}

function rotateLeft(x: AVLNode): AVLNode {
  const y = x.right!
  x.right = y.left
  y.left = x
  updateHeight(x)
  updateHeight(y)
  return y
}

function rebalance(node: AVLNode): AVLNode {
  updateHeight(node)
  const bf = balanceFactor(node)
  if (bf > 1) {
    if (balanceFactor(node.left) < 0) node.left = rotateLeft(node.left!)
    return rotateRight(node)
  }
  if (bf < -1) {
    if (balanceFactor(node.right) > 0) node.right = rotateRight(node.right!)
    return rotateLeft(node)
  }
  return node
}

class AVLTree {
  root: AVLNode | null = null

  insert(value: number): void {
    this.root = this.insertNode(this.root, value)
  }

  private insertNode(node: AVLNode | null, value: number): AVLNode {
    if (node === null) return new AVLNode(value)
    if (value === node.value) return node
    if (value < node.value) node.left = this.insertNode(node.left, value)
    else node.right = this.insertNode(node.right, value)
    return rebalance(node)
  }

  search(value: number): boolean {
    let node = this.root
    while (node !== null) {
      if (value === node.value) return true
      node = value < node.value ? node.left : node.right
    }
    return false
  }

  private findMinNode(node: AVLNode): AVLNode {
    while (node.left !== null) node = node.left
    return node
  }

  delete(value: number): void {
    this.root = this.deleteNode(this.root, value)
  }

  private deleteNode(node: AVLNode | null, value: number): AVLNode | null {
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
    return rebalance(node)
  }

  inorderTraversal(): number[] {
    const out: number[] = []
    const walk = (n: AVLNode | null) => {
      if (n === null) return
      walk(n.left)
      out.push(n.value)
      walk(n.right)
    }
    walk(this.root)
    return out
  }

  height(): number {
    return height(this.root)
  }

  isBalanced(): boolean {
    const check = (n: AVLNode | null): boolean => {
      if (n === null) return true
      const bf = balanceFactor(n)
      if (bf < -1 || bf > 1) return false
      return check(n.left) && check(n.right)
    }
    return check(this.root)
  }

  clear(): void {
    this.root = null
  }

  toArray(): number[] {
    return this.inorderTraversal()
  }
}

const avl = new AVLTree()
for (const v of [30, 20, 10]) avl.insert(v)
console.log(avl.inorderTraversal()) // [10, 20, 30]
console.log(avl.root?.value) // 20
console.log(avl.isBalanced()) // true`,
  },

  whenToUse: [
    'You need ordered data with guaranteed O(log n) search, insert, and delete.',
    'Inputs may arrive sorted or adversarial and an ordinary BST would skew.',
    'You want successor/predecessor, range scans, or sorted iteration with a height bound.',
    'You can store a height (or equivalent) on each node and accept rotation work on updates.',
  ],

  whenNotToUse: [
    'You only need unordered key → value lookup — a hash table is usually simpler and faster on average.',
    'You want the absolute simplest teaching BST without rotations — start with the ordinary BST lesson first.',
    'Your workload is read-heavy with rare updates and you already keep the tree balanced by construction.',
    'You specifically need Red-Black trees (common in language standard libraries) — similar goals, different balance rules (not covered in this step).',
  ],

  keyTakeaways: [
    'Ordinary BSTs can become O(n) tall; AVL trees keep height O(log n) via rotations.',
    'Height(empty) = −1, height(leaf) = 0; BF = height(left) − height(right) must stay in {−1, 0, 1}.',
    'LL → right rotation; RR → left rotation; LR / RL → double rotations shown as two singles.',
    'Insert and delete still use BST logic, then rebalance while unwinding to the root.',
    'Search, insert, and delete are O(log n); traversals are O(n).',
    'AVL trades a little update work and height metadata for a strong worst-case height guarantee.',
  ],

  previousLesson: {
    title: 'Binary Search Tree',
    href: '/learn/binary-search-tree',
  },

  nextLesson: {
    title: 'Heap',
    href: '/learn/heap',
  },

  categoryHref: '/data-structures',
}
