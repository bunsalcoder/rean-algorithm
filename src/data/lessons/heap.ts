import type { Lesson } from './types'

export const heap: Lesson = {
  slug: 'heap',
  title: 'Heap',
  description:
    'Learn binary heaps as a data structure: min and max heaps, array representation, insert, peek, extract, heapify, and O(n) build-heap — distinct from Heap Sort.',
  category: 'Data Structures',
  difficulty: 'Intermediate',
  estimatedTime: '40 min',
  tags: [
    'Data Structures',
    'Heap',
    'Min Heap',
    'Max Heap',
    'Priority Queue',
    'Complete Binary Tree',
    'Intermediate',
  ],

  objectives: [
    'Define a binary heap and explain that it is not a fully sorted structure.',
    'Describe a complete binary tree and why heaps use that shape.',
    'Map a heap to an array with parent / left / right index formulas.',
    'State the Min Heap and Max Heap properties.',
    'Perform insert (sift up), peek, and extract root (sift down).',
    'Heapify a subtree and build a heap bottom-up in O(n).',
    'Compare Heap (structure) with Heap Sort (algorithm) and list real uses.',
  ],

  overview: [
    'A binary heap is a complete binary tree that satisfies a parent–child priority rule. In a Min Heap every parent is ≤ its children (root is the minimum). In a Max Heap every parent is ≥ its children (root is the maximum).',
    'A heap is not fully sorted. Sibling order is free as long as the parent–child property holds. That is enough to expose the extreme value at the root in O(1) and to insert or extract it in O(log n).',
    'Heaps are almost always stored as arrays in level order. For index i: parent = Math.floor((i − 1) / 2), left = 2·i + 1, right = 2·i + 2. No explicit pointers are required.',
    'This lesson teaches the Heap data structure. Heap Sort is a separate sorting algorithm that uses a Max Heap to repeatedly extract the next largest value — see /learn/heap-sort after you understand insert, extract, and build-heap here.',
  ],

  whyItMatters: [
    'Priority queues are usually implemented with heaps: schedulers, event loops, and Dijkstra-style shortest-path queues need fast “get next priority”.',
    'Bottom-up build-heap in O(n) is a classic complexity result — cheaper than inserting n items one-by-one.',
    'Understanding array indexing for trees transfers to Heap Sort, tournament methods, and other implicit tree layouts.',
    'Knowing that a heap is only partially ordered prevents the common mistake of treating the array as sorted.',
  ],

  visualization: {
    title: 'Heap in action',
    description:
      'Switch Min / Max Heap and step through insert, peek, extract, and O(n) build-heap. Tree and array views stay synchronized with immutable frames.',
    type: 'heap',
  },

  steps: [
    {
      title: 'What is a Heap?',
      description:
        'A binary heap keeps a priority invariant between every parent and its children. Only the root is guaranteed to be the global min or max — the rest of the array is not sorted.',
    },
    {
      title: 'Complete Binary Tree',
      description:
        'Every level is full except possibly the last, which is filled left to right. Completeness keeps height ⌊log₂ n⌋ and makes the compact array layout work.',
    },
    {
      title: 'Array Representation',
      description:
        'Store nodes in level order. Index 0 is the root. Children of i live at 2i+1 and 2i+2; the parent of i is ⌊(i−1)/2⌋.',
    },
    {
      title: 'Min Heap',
      description:
        'Every parent ≤ its children. The smallest value is always at index 0. Duplicates, zero, and negatives are allowed.',
    },
    {
      title: 'Max Heap',
      description:
        'Every parent ≥ its children. The largest value is always at index 0. Heap Sort uses this variant.',
    },
    {
      title: 'Parent and Child Index Calculations',
      description:
        'Practice the three formulas until they are automatic — off-by-one errors break sift-up and sift-down.',
    },
    {
      title: 'Insert Operation',
      description:
        'Append the new value at the end (preserve completeness), then sift up by swapping with the parent while the heap property is violated. O(log n).',
    },
    {
      title: 'Peek Operation',
      description:
        'Read index 0 without modifying the heap. O(1). Empty heaps have nothing to peek.',
    },
    {
      title: 'Extract Min / Extract Max',
      description:
        'Save the root, move the last leaf into index 0, shrink the array, then sift down until the property holds. O(log n).',
    },
    {
      title: 'Heapify',
      description:
        'Sift down from a given index to repair a subtree. Used after extract and during build-heap. O(log n) for one call.',
    },
    {
      title: 'Build Heap',
      description:
        'Heapify every non-leaf from ⌊n/2⌋−1 down to 0. Total work is O(n), not O(n log n), because most nodes are near the leaves.',
    },
    {
      title: 'Time and Space Complexity',
      description:
        'Peek O(1); insert / extract / heapify O(log n); build O(n); arbitrary search O(n); space O(n).',
    },
    {
      title: 'Real-world Applications',
      description:
        'Priority queues, top-k selection, Heap Sort, graph algorithms with priority frontiers, and scheduling.',
    },
  ],

  thinkingGuide: {
    title: 'Think “shape → property → sift”',
    description:
      'Derive heap operations from completeness and the parent–child rule.',
    steps: [
      'Keep the tree complete: inserts append; extracts shrink from the end.',
      'State the rule: min → parent ≤ children; max → parent ≥ children.',
      'On insert: append, then sift up while the child beats its parent.',
      'On extract: save root, move last to root, sift down choosing the better child.',
      'On build: heapify non-leaves bottom-up for an O(n) construction.',
      'Never assume the array is sorted — only the heap property holds.',
    ],
  },

  heapConcept: {
    paragraphs: [
      'A binary heap is a complete binary tree commonly stored in an array.',
      'Min Heap: parent ≤ children (root is minimum). Max Heap: parent ≥ children (root is maximum).',
      'The structure is only partially ordered — siblings may be out of sorted order.',
      'This lesson focuses on the Heap data structure; Heap Sort is the algorithm that repeatedly extracts from a Max Heap.',
    ],
    indexingTitle: 'Zero-based index formulas',
    formulas: [
      {
        label: 'Parent',
        formula: 'Math.floor((i - 1) / 2)',
      },
      {
        label: 'Left child',
        formula: '2 * i + 1',
      },
      {
        label: 'Right child',
        formula: '2 * i + 2',
      },
    ],
    maxHeapProperty: 'Min: parent ≤ children · Max: parent ≥ children',
    before: {
      label: 'Unordered array as a tree',
      array: [4, 8, 3, 10, 1],
      note: 'Not a heap yet — 4 > 3 on the right, and 8 > 1 on a child path.',
    },
    after: {
      label: 'After building a Min Heap',
      array: [1, 4, 3, 10, 8],
      note: 'Root 1 is the minimum; every parent ≤ its children.',
    },
    explanation:
      'The tree and the array are the same structure in level order. Index arithmetic replaces child pointers. Building bottom-up turns the unordered array into a valid heap without n separate inserts.',
  },

  complexity: {
    time: {
      best: 'O(1) peek',
      average: 'O(log n) update',
      worst: 'O(n) build / search',
    },
    space: 'O(n)',
    notes: {
      time: [
        'Peek root: O(1).',
        'Insert and extract root: O(log n) — at most one sift along the height ⌊log₂ n⌋.',
        'Heapify (sift down from one index): O(log n).',
        'Build heap bottom-up: O(n). Most nodes have small height, so total sift work sums to linear — tighter than inserting n elements at O(n log n).',
        'Search for an arbitrary value: O(n) — heaps are not search trees.',
      ],
      space: [
        'O(n) for the values in the array.',
        'In-place sift operations use O(1) auxiliary space (aside from recursion if implemented recursively).',
      ],
    },
  },

  commonMistakes: {
    description:
      'These mistakes show up often when learners first implement heaps.',
    mistakes: [
      {
        title: 'Treating the heap array as sorted',
        explanation:
          'Only the parent–child property holds. Adjacent indices are not consecutive sorted values.',
      },
      {
        title: 'Wrong child / parent formulas',
        explanation:
          'Use parent = ⌊(i−1)/2⌋, left = 2i+1, right = 2i+2 for zero-based arrays. Off-by-one bugs corrupt sift-up and sift-down.',
      },
      {
        title: 'Inserting without appending first',
        explanation:
          'Always place the new value at the end to keep the tree complete, then bubble up.',
      },
      {
        title: 'Extracting without moving the last leaf to the root',
        explanation:
          'After saving the root, move the last element to index 0 and shrink — then sift down. Deleting the root “hole” any other way breaks completeness.',
      },
      {
        title: 'Building with n inserts and calling it O(n)',
        explanation:
          'n inserts are O(n log n). Bottom-up heapify from the last non-leaf is the O(n) construction.',
      },
      {
        title: 'Confusing Heap with Heap Sort',
        explanation:
          'Heap is the data structure (priority container). Heap Sort is the algorithm that builds a Max Heap and repeatedly extracts into a sorted suffix.',
      },
      {
        title: 'Expecting O(1) arbitrary search',
        explanation:
          'Unlike a BST or hash table, finding a non-root value may scan the whole array.',
      },
    ],
  },

  algorithmConnection: {
    title: 'Heap vs Heap Sort',
    eyebrow: 'STRUCTURE VS ALGORITHM',
    description:
      'Same underlying tree idea — different jobs. Learn the structure here, then apply it in sorting.',
    items: [
      {
        title: 'Heap (this lesson)',
        description:
          'A reusable priority container: insert, peek, extract, build. Lives as long as you need a min or max frontier.',
      },
      {
        title: 'Heap Sort',
        description:
          'A sorting algorithm: build a Max Heap on the array, then repeatedly extract the maximum into a growing sorted suffix. Lesson: /learn/heap-sort.',
      },
      {
        title: 'Shared mechanics',
        description:
          'Both rely on complete-tree array indexing, the heap property, and sift-down (heapify).',
      },
      {
        title: 'Different goals',
        description:
          'A heap answers “what is the next priority?”. Heap Sort answers “put every element in order.”',
      },
      {
        title: 'Stability & layout',
        description:
          'Heaps as structures often sit behind priority queues. This project’s Heap Sort can run in place and is not stable.',
      },
      {
        title: 'Learning order',
        description:
          'Master insert / extract / build-heap here, then the Heap Sort lesson will feel like composing those ideas.',
      },
    ],
  },

  pseudocode: `// Index helpers (0-based)
Parent(i)     = floor((i - 1) / 2)
Left(i)       = 2 * i + 1
Right(i)      = 2 * i + 2

// compare(a, b) < 0 means a is closer to the root than b
// Min heap: compare = (a, b) => a - b
// Max heap: compare = (a, b) => b - a

SiftUp(heap, i, compare)
  while i > 0
    p = Parent(i)
    if compare(heap[i], heap[p]) >= 0: break
    swap(heap[i], heap[p])
    i = p

SiftDown(heap, i, compare)          // also called Heapify
  n = length(heap)
  loop
    left = Left(i); right = Right(i); best = i
    if left < n and compare(heap[left], heap[best]) < 0: best = left
    if right < n and compare(heap[right], heap[best]) < 0: best = right
    if best == i: break
    swap(heap[i], heap[best])
    i = best

Insert(heap, value, compare)
  append value to heap
  SiftUp(heap, length(heap) - 1, compare)

Peek(heap)
  if empty: error
  return heap[0]

Extract(heap, compare)
  if empty: error
  root = heap[0]
  heap[0] = heap[last]; remove last
  if not empty: SiftDown(heap, 0, compare)
  return root

BuildHeap(array, compare)           // O(n)
  for i = floor(n / 2) - 1 down to 0
    SiftDown(array, i, compare)
  return array`,

  code: {
    python: `from typing import Callable, List, Optional


def parent(i: int) -> int:
    return (i - 1) // 2


def left(i: int) -> int:
    return 2 * i + 1


def right(i: int) -> int:
    return 2 * i + 2


class BinaryHeap:
    """Min heap by default; pass compare=lambda a, b: b - a for max heap."""

    def __init__(
        self,
        values: Optional[List[int]] = None,
        compare: Optional[Callable[[int, int], int]] = None,
    ):
        self.compare = compare or (lambda a, b: a - b)
        self.data: List[int] = []
        if values:
            self.data = list(values)
            self._build()

    def size(self) -> int:
        return len(self.data)

    def is_empty(self) -> bool:
        return not self.data

    def peek(self) -> int:
        if not self.data:
            raise IndexError("peek from empty heap")
        return self.data[0]

    def insert(self, value: int) -> None:
        self.data.append(value)
        self._sift_up(len(self.data) - 1)

    def extract(self) -> int:
        if not self.data:
            raise IndexError("extract from empty heap")
        root = self.data[0]
        last = self.data.pop()
        if self.data:
            self.data[0] = last
            self._sift_down(0)
        return root

    def clear(self) -> None:
        self.data.clear()

    def to_array(self) -> List[int]:
        return list(self.data)

    def _sift_up(self, i: int) -> None:
        while i > 0:
            p = parent(i)
            if self.compare(self.data[i], self.data[p]) >= 0:
                break
            self.data[i], self.data[p] = self.data[p], self.data[i]
            i = p

    def _sift_down(self, i: int) -> None:
        n = len(self.data)
        while True:
            l, r, best = left(i), right(i), i
            if l < n and self.compare(self.data[l], self.data[best]) < 0:
                best = l
            if r < n and self.compare(self.data[r], self.data[best]) < 0:
                best = r
            if best == i:
                break
            self.data[i], self.data[best] = self.data[best], self.data[i]
            i = best

    def _build(self) -> None:
        for i in range(len(self.data) // 2 - 1, -1, -1):
            self._sift_down(i)


h = BinaryHeap([4, 8, 3, 10, 1])  # min heap
print(h.peek())                  # 1
h.insert(0)
print(h.extract())               # 0`,

    javascript: `function parent(i) {
  return Math.floor((i - 1) / 2);
}
function left(i) {
  return 2 * i + 1;
}
function right(i) {
  return 2 * i + 2;
}

class BinaryHeap {
  /** @param {'min' | 'max'} [kind='min'] */
  constructor(values = [], kind = 'min') {
    this.compare =
      kind === 'min' ? (a, b) => a - b : (a, b) => b - a;
    this.data = [...values];
    this.#build();
  }

  size() {
    return this.data.length;
  }

  isEmpty() {
    return this.data.length === 0;
  }

  peek() {
    if (this.data.length === 0) {
      throw new Error('peek from empty heap');
    }
    return this.data[0];
  }

  insert(value) {
    this.data.push(value);
    this.#siftUp(this.data.length - 1);
  }

  extract() {
    if (this.data.length === 0) {
      throw new Error('extract from empty heap');
    }
    const root = this.data[0];
    const last = this.data.pop();
    if (this.data.length > 0) {
      this.data[0] = last;
      this.#siftDown(0);
    }
    return root;
  }

  clear() {
    this.data = [];
  }

  toArray() {
    return [...this.data];
  }

  #siftUp(i) {
    while (i > 0) {
      const p = parent(i);
      if (this.compare(this.data[i], this.data[p]) >= 0) break;
      [this.data[i], this.data[p]] = [this.data[p], this.data[i]];
      i = p;
    }
  }

  #siftDown(i) {
    const n = this.data.length;
    while (true) {
      const l = left(i);
      const r = right(i);
      let best = i;
      if (l < n && this.compare(this.data[l], this.data[best]) < 0) best = l;
      if (r < n && this.compare(this.data[r], this.data[best]) < 0) best = r;
      if (best === i) break;
      [this.data[i], this.data[best]] = [this.data[best], this.data[i]];
      i = best;
    }
  }

  #build() {
    for (let i = Math.floor(this.data.length / 2) - 1; i >= 0; i -= 1) {
      this.#siftDown(i);
    }
  }
}

const h = new BinaryHeap([4, 8, 3, 10, 1], 'min');
console.log(h.peek()); // 1
h.insert(0);
console.log(h.extract()); // 0`,

    typescript: `export type HeapKind = 'min' | 'max'
export type HeapComparator = (a: number, b: number) => number

function parent(i: number): number {
  return Math.floor((i - 1) / 2)
}
function left(i: number): number {
  return 2 * i + 1
}
function right(i: number): number {
  return 2 * i + 2
}

export class BinaryHeap {
  private data: number[]
  private readonly compare: HeapComparator

  constructor(values: readonly number[] = [], kind: HeapKind = 'min') {
    this.compare = kind === 'min' ? (a, b) => a - b : (a, b) => b - a
    this.data = [...values]
    this.build()
  }

  size(): number {
    return this.data.length
  }

  isEmpty(): boolean {
    return this.data.length === 0
  }

  peek(): number {
    if (this.data.length === 0) {
      throw new Error('peek from empty heap')
    }
    return this.data[0]
  }

  insert(value: number): void {
    this.data.push(value)
    this.siftUp(this.data.length - 1)
  }

  extract(): number {
    if (this.data.length === 0) {
      throw new Error('extract from empty heap')
    }
    const root = this.data[0]
    const last = this.data.pop()!
    if (this.data.length > 0) {
      this.data[0] = last
      this.siftDown(0)
    }
    return root
  }

  clear(): void {
    this.data = []
  }

  toArray(): number[] {
    return [...this.data]
  }

  private siftUp(i: number): void {
    while (i > 0) {
      const p = parent(i)
      if (this.compare(this.data[i], this.data[p]) >= 0) break
      ;[this.data[i], this.data[p]] = [this.data[p], this.data[i]]
      i = p
    }
  }

  private siftDown(i: number): void {
    const n = this.data.length
    while (true) {
      const l = left(i)
      const r = right(i)
      let best = i
      if (l < n && this.compare(this.data[l], this.data[best]) < 0) best = l
      if (r < n && this.compare(this.data[r], this.data[best]) < 0) best = r
      if (best === i) break
      ;[this.data[i], this.data[best]] = [this.data[best], this.data[i]]
      i = best
    }
  }

  private build(): void {
    for (let i = Math.floor(this.data.length / 2) - 1; i >= 0; i -= 1) {
      this.siftDown(i)
    }
  }
}

const h = new BinaryHeap([4, 8, 3, 10, 1], 'min')
console.log(h.peek()) // 1
h.insert(0)
console.log(h.extract()) // 0`,
  },

  whenToUse: [
    'You need repeated access to the current minimum or maximum priority.',
    'You are implementing a priority queue, scheduler, or top-k structure.',
    'You want O(log n) insert/extract with O(1) peek and compact array storage.',
    'You will later study Heap Sort or graph algorithms that use priority frontiers.',
  ],

  whenNotToUse: [
    'You need fast arbitrary key lookup — use a hash table or balanced BST.',
    'You need a fully sorted sequence at all times — use a balanced tree or sort explicitly.',
    'You only need to sort once — call a sort (or the Heap Sort lesson) instead of maintaining a live heap.',
    'You need stable ordering of equal priorities with rich satellite data — consider a stable structure or explicit tie-breaks.',
  ],

  keyTakeaways: [
    'A heap is a complete binary tree with a parent–child priority rule — not a fully sorted array.',
    'Array indices: parent ⌊(i−1)/2⌋, left 2i+1, right 2i+2.',
    'Min Heap: parent ≤ children. Max Heap: parent ≥ children.',
    'Peek is O(1); insert and extract are O(log n); build-heap is O(n).',
    'Bottom-up build is faster than n inserts because most sift distances are short.',
    'Heap (structure) ≠ Heap Sort (algorithm) — continue to /learn/heap-sort to see sorting with a Max Heap.',
  ],

  previousLesson: {
    title: 'AVL Tree',
    href: '/learn/avl-tree',
  },

  nextLesson: {
    title: 'Heap Sort',
    href: '/learn/heap-sort',
  },

  categoryHref: '/data-structures',
}
