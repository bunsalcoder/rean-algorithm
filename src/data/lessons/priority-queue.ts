import type { Lesson } from './types'

export const priorityQueue: Lesson = {
  slug: 'priority-queue',
  title: 'Priority Queue',
  description:
    'Learn priority queues as an ADT: min and max ordering, heap-backed enqueue/peek/dequeue, FIFO ties, complexity, and real scheduling uses — built on the Heap lesson.',
  category: 'Data Structures',
  difficulty: 'Intermediate',
  estimatedTime: '35 min',
  tags: [
    'Data Structures',
    'Priority Queue',
    'Heap',
    'Min Heap',
    'Max Heap',
    'Scheduling',
    'Intermediate',
  ],

  objectives: [
    'Define a priority queue and contrast it with FIFO queues.',
    'Explain min vs max priority queues and what the priority number means.',
    'Describe how a binary heap implements a priority queue.',
    'Perform enqueue, peek, and dequeue with correct complexity.',
    'Handle equal priorities with a deterministic FIFO tie-break.',
    'List real-world uses: OS scheduling, triage, packets, events, and Dijkstra-style frontiers.',
  ],

  overview: [
    'A priority queue is an abstract data type that always exposes the “most important” waiting item next. Importance is defined by a numeric priority — not by who arrived first.',
    'That is the key difference from a regular queue: a FIFO queue removes in insertion order; a priority queue removes by priority. Two tasks can arrive in any order and still leave according to urgency.',
    'Under the hood this lesson uses a binary heap (see /learn/heap). The heap stores entries of {item, priority, sequence}. Peek is O(1); enqueue and dequeue are O(log n).',
    'Equal priorities use FIFO: an insertion sequence number breaks ties so the earlier item comes out first. Switch between Min and Max modes in the playground — the UI states whether a smaller or larger number means higher priority.',
  ],

  whyItMatters: [
    'Schedulers, triage systems, and network stacks constantly ask “what should run next?” — that is a priority queue question.',
    'Graph algorithms such as Dijkstra’s shortest path keep a frontier of candidates ordered by distance; a heap-backed priority queue makes that efficient.',
    'Understanding the ADT separately from the heap implementation helps you choose the right tool: the interface is priority-based removal; the heap is one fast way to implement it.',
    'Deterministic tie handling matters in teaching and in production logs — FIFO for equal priorities is a clear, testable rule.',
  ],

  visualization: {
    title: 'Priority Queue in action',
    description:
      'Switch Min / Max priority queues and step through enqueue, peek, and dequeue. See the heap tree, array layout, each task’s priority, and which item is next to leave.',
    type: 'priority-queue',
  },

  steps: [
    {
      title: 'What is a Priority Queue?',
      description:
        'An ADT that stores items with priorities and always lets you inspect or remove the current highest-priority item. Order of removal follows priority, not arrival time.',
    },
    {
      title: 'Priority vs. Insertion Order',
      description:
        'A FIFO queue serves the oldest waiting customer. A priority queue serves the most urgent one — even if they joined later. Only when priorities are equal does insertion order matter (FIFO ties in this lesson).',
    },
    {
      title: 'Min Priority Queue',
      description:
        'Smaller priority numbers win. Useful when 1 means “most urgent” (SEV-1 before SEV-5). The heap root always holds the current minimum priority.',
    },
    {
      title: 'Max Priority Queue',
      description:
        'Larger priority numbers win. Useful when a score or weight means “more important.” The heap root always holds the current maximum priority.',
    },
    {
      title: 'How a Heap Implements a Priority Queue',
      description:
        'Store entries in a complete binary tree as an array. Parent–child order follows min or max priority (with sequence for ties). Reuse the same index formulas as the Heap lesson: parent ⌊(i−1)/2⌋, left 2i+1, right 2i+2.',
    },
    {
      title: 'Insert / Enqueue',
      description:
        'Append the new entry at the end (keep completeness), assign the next sequence number, then sift up while the heap order is violated. O(log n).',
    },
    {
      title: 'Peek',
      description:
        'Read index 0 without modifying the structure. O(1). Empty queues return nothing safely.',
    },
    {
      title: 'Extract / Dequeue',
      description:
        'Save the root, move the last leaf to index 0, shrink, then sift down. O(log n). The removed entry is the next item by priority.',
    },
    {
      title: 'Handling Equal Priorities',
      description:
        'When two priorities compare equal, the smaller insertion sequence wins — earlier enqueues leave first (FIFO). Duplicates are allowed and stay deterministic.',
    },
    {
      title: 'Time and Space Complexity',
      description:
        'Peek O(1); enqueue and dequeue O(log n); size / isEmpty O(1); space O(n) for the heap array of entries.',
    },
    {
      title: 'Real-world Applications',
      description:
        'OS task scheduling, emergency-room triage, network packet scheduling, event-driven simulation, and priority frontiers in graph algorithms (e.g. Dijkstra — studied later, not implemented here).',
    },
  ],

  thinkingGuide: {
    title: 'Think “ADT → heap → sift”',
    description:
      'Separate the priority-queue contract from the heap mechanics.',
    steps: [
      'State the contract: next removal is by priority, not insertion order.',
      'Choose min or max and say what the number means in your domain.',
      'Map the ADT to a heap of {item, priority, sequence}.',
      'Enqueue: append + sift up. Dequeue: extract root + sift down. Peek: read root.',
      'On equal priorities, use FIFO via sequence numbers.',
      'Quote complexities: peek O(1), update O(log n), space O(n).',
    ],
  },

  heapConcept: {
    paragraphs: [
      'A priority queue is the ADT; a binary heap is a common O(log n) implementation.',
      'Each heap node stores an item plus its priority (and a sequence for ties).',
      'Min PQ: smaller priority closer to the root. Max PQ: larger priority closer to the root.',
      'The structure is only partially ordered — just like a plain heap — so the array is not fully sorted by priority.',
    ],
    indexingTitle: 'Same heap index formulas',
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
    maxHeapProperty:
      'Min PQ: parent priority ≤ children · Max PQ: parent priority ≥ children · ties: earlier sequence first',
    before: {
      label: 'Tasks in arrival order (not yet a heap)',
      array: [3, 1, 5, 4],
      note: 'Priorities for Review PR, Fix bug, Docs, Refactor — urgency is not at the front yet.',
    },
    after: {
      label: 'After building a Min Priority Queue',
      array: [1, 3, 5, 4],
      note: 'Root priority 1 (Fix critical bug) is next to leave; parent ≤ children on priorities.',
    },
    explanation:
      'Enqueueing the sample tasks into a min priority queue bubbles the smallest priority to the root. The playground shows both the task labels and these priority numbers on the heap tree and array.',
  },

  complexity: {
    time: {
      best: 'O(1) peek',
      average: 'O(log n) update',
      worst: 'O(log n) enqueue / dequeue',
    },
    space: 'O(n)',
    notes: {
      time: [
        'Peek next item: O(1) — read the heap root.',
        'Enqueue: O(log n) — append and sift up.',
        'Dequeue: O(log n) — extract root and sift down.',
        'Size and isEmpty: O(1).',
        'Clear: O(1) to drop the array reference (or O(n) if you zero slots explicitly).',
      ],
      space: [
        'O(n) entries in the underlying heap array.',
        'Each entry stores item, priority, and a small sequence integer for FIFO ties.',
      ],
    },
  },

  commonMistakes: {
    description:
      'These mistakes show up often when learners first use priority queues.',
    mistakes: [
      {
        title: 'Expecting FIFO like a normal queue',
        explanation:
          'Unless priorities are equal, insertion order does not decide who leaves next. Priority wins.',
      },
      {
        title: 'Forgetting which way the priority number goes',
        explanation:
          'In min mode, 1 beats 5. In max mode, 5 beats 1. Always state the convention in the UI and in APIs.',
      },
      {
        title: 'Treating the heap array as sorted by priority',
        explanation:
          'Only the parent–child rule holds. Index 1 is not necessarily the second-best priority.',
      },
      {
        title: 'Ignoring equal-priority ties',
        explanation:
          'Without a tie-break, equal priorities can leave in arbitrary heap order. This lesson uses FIFO via sequence numbers.',
      },
      {
        title: 'Confusing the Priority Queue ADT with Heap Sort',
        explanation:
          'A priority queue repeatedly answers “what is next?”. Heap Sort uses a heap to fully sort an array — related idea, different goal.',
      },
      {
        title: 'Reimplementing sift logic instead of reusing heap ideas',
        explanation:
          'The Heap lesson already covers sift-up and sift-down. A priority queue wraps those mechanics around (item, priority) entries.',
      },
    ],
  },

  algorithmConnection: {
    title: 'Priority Queue vs Heap vs Queue',
    eyebrow: 'ADT VS STRUCTURE',
    description:
      'Same family of ideas — different contracts. Learn how they fit together.',
    items: [
      {
        title: 'Priority Queue (this lesson)',
        description:
          'ADT: enqueue(item, priority), peek, dequeue by priority. Tie-break FIFO for equals.',
      },
      {
        title: 'Heap',
        description:
          'Concrete complete-tree structure that makes priority operations fast. Study the mechanics at /learn/heap.',
      },
      {
        title: 'FIFO Queue',
        description:
          'Removes in insertion order only. Use when fairness by arrival matters more than urgency — see /learn/queue.',
      },
      {
        title: 'OS / triage / packets / events',
        description:
          'Classic domains: run the urgent job, treat the critical patient, send high-priority packets, fire the next timed event.',
      },
      {
        title: 'Dijkstra-style frontiers',
        description:
          'Shortest-path algorithms keep candidate nodes ordered by distance. That frontier is a priority queue — implemented later, not in this step.',
      },
      {
        title: 'Learning order',
        description:
          'Heap → Priority Queue → (later) graph algorithms that consume a priority frontier. Heap Sort remains the sorting application of heaps.',
      },
    ],
  },

  pseudocode: `// Min mode: smaller priority is closer to the root
// Max mode: larger priority is closer to the root
// Tie-break: smaller sequence (earlier enqueue) wins

Entry = { item, priority, sequence }

Compare(a, b, mode)
  if a.priority != b.priority
    return mode == min ? a.priority - b.priority : b.priority - a.priority
  return a.sequence - b.sequence   // FIFO for equal priorities

Enqueue(pq, item, priority)
  entry = { item, priority, sequence: pq.nextSequence++ }
  append entry to pq.heap
  SiftUp(pq.heap, lastIndex, Compare)

Peek(pq)
  if empty: return none
  return pq.heap[0]

Dequeue(pq)
  if empty: return none
  root = pq.heap[0]
  move last entry to index 0; shrink
  if not empty: SiftDown(pq.heap, 0, Compare)
  return root

// SiftUp / SiftDown use the same parent/child index formulas as Binary Heap`,

  code: {
    python: `from dataclasses import dataclass
from typing import Generic, List, Optional, TypeVar

T = TypeVar("T")


@dataclass(frozen=True)
class Entry(Generic[T]):
    item: T
    priority: int
    sequence: int


class PriorityQueue(Generic[T]):
    """Min priority queue by default; pass mode='max' for max ordering."""

    def __init__(self, mode: str = "min"):
        assert mode in ("min", "max")
        self.mode = mode
        self._heap: List[Entry[T]] = []
        self._next_seq = 0

    def _better(self, a: Entry[T], b: Entry[T]) -> bool:
        if a.priority != b.priority:
            return a.priority < b.priority if self.mode == "min" else a.priority > b.priority
        return a.sequence < b.sequence

    def enqueue(self, item: T, priority: int) -> None:
        entry = Entry(item, priority, self._next_seq)
        self._next_seq += 1
        self._heap.append(entry)
        self._sift_up(len(self._heap) - 1)

    def peek(self) -> Optional[Entry[T]]:
        return self._heap[0] if self._heap else None

    def dequeue(self) -> Optional[Entry[T]]:
        if not self._heap:
            return None
        root = self._heap[0]
        last = self._heap.pop()
        if self._heap:
            self._heap[0] = last
            self._sift_down(0)
        return root

    def size(self) -> int:
        return len(self._heap)

    def is_empty(self) -> bool:
        return not self._heap

    def clear(self) -> None:
        self._heap.clear()

    def to_array(self) -> List[Entry[T]]:
        return list(self._heap)

    def _sift_up(self, i: int) -> None:
        while i > 0:
            p = (i - 1) // 2
            if not self._better(self._heap[i], self._heap[p]):
                break
            self._heap[i], self._heap[p] = self._heap[p], self._heap[i]
            i = p

    def _sift_down(self, i: int) -> None:
        n = len(self._heap)
        while True:
            left, right, best = 2 * i + 1, 2 * i + 2, i
            if left < n and self._better(self._heap[left], self._heap[best]):
                best = left
            if right < n and self._better(self._heap[right], self._heap[best]):
                best = right
            if best == i:
                break
            self._heap[i], self._heap[best] = self._heap[best], self._heap[i]
            i = best


pq = PriorityQueue[str]("min")
pq.enqueue("Fix critical bug", 1)
pq.enqueue("Review pull request", 3)
print(pq.peek().item)     # Fix critical bug
print(pq.dequeue().item)  # Fix critical bug`,

    javascript: `class PriorityQueue {
  /** @param {'min' | 'max'} [mode='min'] */
  constructor(mode = 'min') {
    this.mode = mode;
    this.heap = [];
    this.nextSequence = 0;
  }

  _better(a, b) {
    if (a.priority !== b.priority) {
      return this.mode === 'min'
        ? a.priority < b.priority
        : a.priority > b.priority;
    }
    return a.sequence < b.sequence;
  }

  enqueue(item, priority) {
    const entry = { item, priority, sequence: this.nextSequence++ };
    this.heap.push(entry);
    this.#siftUp(this.heap.length - 1);
  }

  peek() {
    return this.heap.length === 0 ? undefined : this.heap[0];
  }

  dequeue() {
    if (this.heap.length === 0) return undefined;
    const root = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.#siftDown(0);
    }
    return root;
  }

  size() {
    return this.heap.length;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  clear() {
    this.heap = [];
  }

  toArray() {
    return [...this.heap];
  }

  #siftUp(i) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (!this._better(this.heap[i], this.heap[p])) break;
      [this.heap[i], this.heap[p]] = [this.heap[p], this.heap[i]];
      i = p;
    }
  }

  #siftDown(i) {
    const n = this.heap.length;
    while (true) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      let best = i;
      if (left < n && this._better(this.heap[left], this.heap[best])) best = left;
      if (right < n && this._better(this.heap[right], this.heap[best])) best = right;
      if (best === i) break;
      [this.heap[i], this.heap[best]] = [this.heap[best], this.heap[i]];
      i = best;
    }
  }
}

const pq = new PriorityQueue('min');
pq.enqueue('Fix critical bug', 1);
pq.enqueue('Review pull request', 3);
console.log(pq.peek().item);    // Fix critical bug
console.log(pq.dequeue().item); // Fix critical bug`,

    typescript: `export type PriorityQueueMode = 'min' | 'max'

export type PriorityQueueEntry<T> = {
  item: T
  priority: number
  sequence: number
}

export class PriorityQueue<T = string> {
  private heap: PriorityQueueEntry<T>[] = []
  private nextSequence = 0

  constructor(private readonly mode: PriorityQueueMode = 'min') {}

  private better(a: PriorityQueueEntry<T>, b: PriorityQueueEntry<T>): boolean {
    if (a.priority !== b.priority) {
      return this.mode === 'min'
        ? a.priority < b.priority
        : a.priority > b.priority
    }
    return a.sequence < b.sequence
  }

  enqueue(item: T, priority: number): void {
    const entry = { item, priority, sequence: this.nextSequence++ }
    this.heap.push(entry)
    this.siftUp(this.heap.length - 1)
  }

  peek(): PriorityQueueEntry<T> | undefined {
    return this.heap[0]
  }

  dequeue(): PriorityQueueEntry<T> | undefined {
    if (this.heap.length === 0) return undefined
    const root = this.heap[0]
    const last = this.heap.pop()!
    if (this.heap.length > 0) {
      this.heap[0] = last
      this.siftDown(0)
    }
    return root
  }

  size(): number {
    return this.heap.length
  }

  isEmpty(): boolean {
    return this.heap.length === 0
  }

  clear(): void {
    this.heap = []
  }

  toArray(): PriorityQueueEntry<T>[] {
    return [...this.heap]
  }

  private siftUp(i: number): void {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2)
      if (!this.better(this.heap[i], this.heap[p])) break
      ;[this.heap[i], this.heap[p]] = [this.heap[p], this.heap[i]]
      i = p
    }
  }

  private siftDown(i: number): void {
    const n = this.heap.length
    while (true) {
      const left = 2 * i + 1
      const right = 2 * i + 2
      let best = i
      if (left < n && this.better(this.heap[left], this.heap[best])) best = left
      if (right < n && this.better(this.heap[right], this.heap[best])) best = right
      if (best === i) break
      ;[this.heap[i], this.heap[best]] = [this.heap[best], this.heap[i]]
      i = best
    }
  }
}

const pq = new PriorityQueue<string>('min')
pq.enqueue('Fix critical bug', 1)
pq.enqueue('Review pull request', 3)
console.log(pq.peek()?.item)    // Fix critical bug
console.log(pq.dequeue()?.item) // Fix critical bug`,
  },

  whenToUse: [
    'You need repeated access to the current highest- or lowest-priority item.',
    'You are modeling schedulers, triage, packet queues, or event loops.',
    'You want O(log n) enqueue/dequeue with O(1) peek via a binary heap.',
    'Equal priorities should leave in a deterministic FIFO order.',
  ],

  whenNotToUse: [
    'You need strict FIFO regardless of urgency — use a regular queue.',
    'You need fast arbitrary search by item identity — pair with a map, or use another structure.',
    'You only need to sort once — call a sort (or Heap Sort) instead of maintaining a live queue.',
    'You need decrease-key intensive graph algorithms with specialized heaps — a plain binary heap PQ is a starting point, not always optimal.',
  ],

  keyTakeaways: [
    'Priority queues remove by priority, not insertion order (FIFO only for ties here).',
    'Min PQ: smaller number wins. Max PQ: larger number wins — always make the direction explicit.',
    'A binary heap implements the ADT with O(1) peek and O(log n) enqueue/dequeue.',
    'Entries carry item + priority + sequence so ties stay deterministic.',
    'Applications: OS scheduling, ER triage, packet scheduling, simulations, Dijkstra-style frontiers.',
    'Continue from /learn/heap for sift mechanics; this lesson is the priority ADT on top.',
  ],

  previousLesson: {
    title: 'Heap',
    href: '/learn/heap',
  },

  nextLesson: {
    title: 'Heap Sort',
    href: '/learn/heap-sort',
  },

  categoryHref: '/data-structures',
}
