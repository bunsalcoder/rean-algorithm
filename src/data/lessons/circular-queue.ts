import type { Lesson } from './types'

export const circularQueue: Lesson = {
  slug: 'circular-queue',
  title: 'Circular Queue',
  description:
    'Learn the fixed-capacity circular queue: wraparound indexing, front/rear/size, enqueue and dequeue, full and empty conditions, complexity, and how it differs from a regular array queue.',
  category: 'Data Structures',
  difficulty: 'Beginner',
  estimatedTime: '30 min',
  tags: ['Data Structures', 'Queue', 'Circular Queue', 'Ring Buffer', 'Beginner'],

  objectives: [
    'Understand what a circular queue is and how it stores values in a fixed ring.',
    'Explain why a normal array-based queue can waste available space after repeated dequeues.',
    'Use circular indexing and modulo wraparound: nextIndex = (i + 1) % capacity.',
    'Track front, rear, size, and capacity correctly.',
    'Perform enqueue and dequeue operations on a circular buffer.',
    'Identify full (size === capacity) and empty (size === 0) conditions.',
    'Compare a circular queue with a regular (head-index or shifting) queue.',
    'State the O(1) time complexity of common circular queue operations for a fixed buffer.',
  ],

  overview: [
    'A circular queue (ring buffer) is a FIFO queue stored in a fixed-size array where indices wrap around with modulo arithmetic.',
    'After the last index, the next insert or remove position returns to index 0 if that slot is free — that is wraparound.',
    'Unlike a naive array queue that leaves “dead” slots at the front after dequeue, a circular queue reuses those slots without shifting every element.',
    'This lesson tracks three counters: front (next removal), rear (last insertion), and size (how many live values). Capacity is the fixed length of the buffer.',
    'Empty means size === 0. Full means size === capacity. An explicit size counter avoids the ambiguous “front === rear” full/empty problem.',
    'Default playground capacity is 6. Try the wrapped demo to see rear or front cross from the last index back to 0.',
  ],

  whyItMatters: [
    'Bounded buffers appear in streaming, audio/video pipelines, keyboard input, and network packet queues where memory must stay fixed.',
    'Circular indexing gives O(1) enqueue and dequeue without Array.shift() and without growing the array after every wrap.',
    'Understanding wraparound prepares you for ring buffers in systems code and for interview questions about fixed-capacity queues.',
    'Comparing circular vs regular queues clarifies when wasted prefix space or shifting costs matter.',
  ],

  visualization: {
    title: 'Circular queue in action',
    description:
      'Step through enqueue, dequeue, front, rear, isEmpty, and isFull on a fixed ring. Watch front/rear move, slots reuse, and wraparound when the next index returns to 0.',
    type: 'circular-queue',
  },

  steps: [
    {
      title: 'See the ring and the linear buffer',
      description:
        'Each slot has a fixed index. Empty slots are marked; front and rear label the live ends. The linear strip shows the same buffer left-to-right.',
    },
    {
      title: 'Why circular queues exist',
      description:
        'A plain array queue that only advances a head pointer leaves unused slots behind. Circular wraparound reclaims those slots without shifting.',
    },
    {
      title: 'Circular indexing',
      description:
        'nextIndex = (currentIndex + 1) % capacity. After the last index, the next position is 0.',
    },
    {
      title: 'Enqueue at the rear',
      description:
        'If empty, write at index 0 and set front = rear = 0. Otherwise rear = (rear + 1) % capacity, then write. Reject when size === capacity.',
    },
    {
      title: 'Dequeue from the front',
      description:
        'Read buffer[front], clear the slot, then front = (front + 1) % capacity (or reset placeholders when size becomes 0). Reject when empty.',
    },
    {
      title: 'Full and empty with size',
      description:
        'Empty: size === 0. Full: size === capacity. Do not rely on front === rear alone.',
    },
    {
      title: 'Reuse slots after wraparound',
      description:
        'Dequeue frees a slot; a later enqueue can land on a previously occupied index after wraparound.',
    },
  ],

  thinkingGuide: {
    title: 'Think in “fixed ring + size”',
    description:
      'Before coding, decide capacity, empty/full rules, and what front/rear mean when size is 0.',
    steps: [
      'Draw the buffer indices 0 … capacity−1 in a circle.',
      'Write front, rear, and size after every enqueue/dequeue.',
      'Compute the next index with (i + 1) % capacity — verify wrap from last → 0.',
      'Ask: is the queue empty? full? What happens if I enqueue or dequeue anyway?',
      'Compare to a regular queue: would this sequence waste prefix space without wraparound?',
    ],
  },

  complexity: {
    time: {
      best: 'O(1)',
      average: 'O(1)',
      worst: 'O(1)',
    },
    space: 'O(k) for capacity k',
    notes: {
      time: [
        'Enqueue: O(1) — write at the next rear index with modulo wraparound (fixed-capacity buffer, direct array indexing).',
        'Dequeue: O(1) — read/clear the front index and advance front with modulo wraparound.',
        'Front: O(1) — read buffer[front] when non-empty.',
        'Rear: O(1) — read buffer[rear] when non-empty.',
        'isEmpty: O(1) — compare size to 0.',
        'isFull: O(1) — compare size to capacity.',
        'These complexities assume a fixed-capacity circular buffer with direct array indexing (not shifting the whole array).',
      ],
      space: [
        'The buffer uses O(k) space for capacity k, whether or not all slots are occupied.',
        'Operations use O(1) auxiliary space beyond the buffer.',
        'Unlike a growable dynamic queue, capacity does not increase automatically when full.',
      ],
    },
  },

  commonMistakes: {
    description:
      'Most circular-queue bugs are off-by-one wraparound errors, ambiguous full/empty checks, or forgetting to update size.',
    mistakes: [
      {
        title: 'Detecting full/empty with only front === rear',
        explanation:
          'After wraparound, front === rear can mean empty or full depending on history. Keep an explicit size (or leave one slot empty) so the conditions stay clear.',
      },
      {
        title: 'Forgetting modulo when advancing pointers',
        explanation:
          'Use (index + 1) % capacity. Writing past the last index without wraparound either crashes or fails to reuse early slots.',
      },
      {
        title: 'Enqueueing when full or dequeueing when empty',
        explanation:
          'Full → overflow; empty → underflow. Reject the operation and leave the ring unchanged — do not invent values.',
      },
      {
        title: 'Leaving stale values in cleared slots',
        explanation:
          'After dequeue, clear the slot (or treat only the live size window as valid) so visualizations and toArray() do not resurrect old data.',
      },
      {
        title: 'Confusing circular queue with an unbounded queue',
        explanation:
          'A circular queue has fixed capacity. When full, you must dequeue (or grow with a different design) — wraparound alone does not create space.',
      },
    ],
  },

  algorithmConnection: {
    title: 'Circular Queue vs Regular Queue',
    eyebrow: 'COMPARISON & USES',
    description:
      'Both are FIFO. The circular queue adds fixed capacity and wraparound so freed prefix slots are reused without shifting.',
    items: [
      {
        title: 'Space reuse',
        description:
          'Regular head-index queues can leave discarded slots until compaction. Circular queues reuse slots immediately via modulo indexing.',
      },
      {
        title: 'Capacity',
        description:
          'Circular queues are typically fixed-size. Regular teaching queues may grow dynamically until memory limits.',
      },
      {
        title: 'Complexity',
        description:
          'With a circular buffer, enqueue/dequeue stay O(1) without Array.shift(). A shifting array dequeue is O(n).',
      },
      {
        title: 'Streaming / I/O buffers',
        description:
          'Keyboard buffers, audio rings, and network receive queues often use fixed ring buffers for predictable memory.',
      },
      {
        title: 'Producer–consumer',
        description:
          'One side enqueues, the other dequeues. Size (or empty/full flags) coordinates when the ring can accept or provide data.',
      },
      {
        title: 'Traffic / task windows',
        description:
          'Bounded recent-event windows and fixed-size job slots map naturally onto circular queues.',
      },
      {
        title: 'Related lesson',
        description:
          'Review the Queue lesson for FIFO basics and head-index arrays, then return here for wraparound and fixed capacity.',
      },
    ],
  },

  pseudocode: `CircularQueue (fixed buffer[0..k-1], front, rear, size)
  // Empty-state: size = 0, front = 0, rear = 0 (placeholders)
  // Non-empty: front = first element index, rear = last element index
  // Empty ⇔ size = 0 ; Full ⇔ size = k

Enqueue(queue, value)
    if size == capacity
        report overflow
        return
    if size == 0
        front = 0
        rear = 0
    else
        rear = (rear + 1) % capacity   // wraparound
    buffer[rear] = value
    size = size + 1

Dequeue(queue)
    if size == 0
        report underflow
        return none
    value = buffer[front]
    buffer[front] = empty
    size = size - 1
    if size == 0
        front = 0
        rear = 0
    else
        front = (front + 1) % capacity // wraparound
    return value

Front(queue)
    if size == 0: underflow / none
    else return buffer[front]

Rear(queue)
    if size == 0: underflow / none
    else return buffer[rear]

IsEmpty(queue) → size == 0
IsFull(queue)  → size == capacity
Size(queue)    → size
Capacity(queue)→ capacity`,

  code: {
    python: `class CircularQueue:
    """Fixed-capacity FIFO ring buffer with modulo wraparound."""

    def __init__(self, capacity):
        if capacity <= 0:
            raise ValueError("capacity must be a positive integer")
        self._capacity = capacity
        self._buffer = [None] * capacity
        # Empty-state placeholders: front = rear = 0 when size == 0
        self._front = 0
        self._rear = 0
        self._size = 0

    def enqueue(self, value):
        if self.is_full():
            raise IndexError("circular queue overflow")
        if self.is_empty():
            self._front = 0
            self._rear = 0
        else:
            self._rear = (self._rear + 1) % self._capacity
        self._buffer[self._rear] = value
        self._size += 1

    def dequeue(self):
        if self.is_empty():
            raise IndexError("circular queue underflow")
        value = self._buffer[self._front]
        self._buffer[self._front] = None
        self._size -= 1
        if self._size == 0:
            self._front = 0
            self._rear = 0
        else:
            self._front = (self._front + 1) % self._capacity
        return value

    def front(self):
        if self.is_empty():
            raise IndexError("circular queue underflow")
        return self._buffer[self._front]

    def rear(self):
        if self.is_empty():
            raise IndexError("circular queue underflow")
        return self._buffer[self._rear]

    def is_empty(self):
        return self._size == 0

    def is_full(self):
        return self._size == self._capacity

    def size(self):
        return self._size

    def capacity(self):
        return self._capacity

    def clear(self):
        self._buffer = [None] * self._capacity
        self._front = 0
        self._rear = 0
        self._size = 0

    def to_array(self):
        if self.is_empty():
            return []
        values = []
        index = self._front
        for _ in range(self._size):
            values.append(self._buffer[index])
            index = (index + 1) % self._capacity
        return values


# Wraparound example (capacity 4)
cq = CircularQueue(4)
for value in (10, 20, 30, 40):
    cq.enqueue(value)
print(cq.is_full())     # True
print(cq.dequeue())     # 10 — frees index 0
cq.enqueue(50)          # writes at index 0 (wrap)
print(cq.to_array())    # [20, 30, 40, 50]
print(cq.front(), cq.rear())  # 20 50`,

    javascript: `class CircularQueue {
  /** Fixed-capacity FIFO ring buffer with modulo wraparound. */
  constructor(capacity) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new Error('capacity must be a positive integer')
    }
    this._capacity = capacity
    this._buffer = Array(capacity).fill(null)
    // Empty-state placeholders: front = rear = 0 when size === 0
    this._front = 0
    this._rear = 0
    this._size = 0
  }

  enqueue(value) {
    if (this.isFull()) {
      throw new Error('circular queue overflow')
    }
    if (this.isEmpty()) {
      this._front = 0
      this._rear = 0
    } else {
      this._rear = (this._rear + 1) % this._capacity
    }
    this._buffer[this._rear] = value
    this._size += 1
  }

  dequeue() {
    if (this.isEmpty()) {
      throw new Error('circular queue underflow')
    }
    const value = this._buffer[this._front]
    this._buffer[this._front] = null
    this._size -= 1
    if (this._size === 0) {
      this._front = 0
      this._rear = 0
    } else {
      this._front = (this._front + 1) % this._capacity
    }
    return value
  }

  front() {
    if (this.isEmpty()) {
      throw new Error('circular queue underflow')
    }
    return this._buffer[this._front]
  }

  rear() {
    if (this.isEmpty()) {
      throw new Error('circular queue underflow')
    }
    return this._buffer[this._rear]
  }

  isEmpty() {
    return this._size === 0
  }

  isFull() {
    return this._size === this._capacity
  }

  size() {
    return this._size
  }

  capacity() {
    return this._capacity
  }

  clear() {
    this._buffer = Array(this._capacity).fill(null)
    this._front = 0
    this._rear = 0
    this._size = 0
  }

  toArray() {
    if (this.isEmpty()) {
      return []
    }
    const values = []
    let index = this._front
    for (let i = 0; i < this._size; i += 1) {
      values.push(this._buffer[index])
      index = (index + 1) % this._capacity
    }
    return values
  }
}

// Wraparound example (capacity 4)
const cq = new CircularQueue(4)
for (const value of [10, 20, 30, 40]) {
  cq.enqueue(value)
}
console.log(cq.isFull()) // true
console.log(cq.dequeue()) // 10 — frees index 0
cq.enqueue(50) // writes at index 0 (wrap)
console.log(cq.toArray()) // [20, 30, 40, 50]
console.log(cq.front(), cq.rear()) // 20 50`,

    typescript: `/** Fixed-capacity FIFO ring buffer with modulo wraparound. */
class CircularQueue {
  private buffer: (number | null)[]
  private frontIndex = 0
  private rearIndex = 0
  private liveSize = 0
  private readonly ringCapacity: number

  constructor(capacity: number) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new Error('capacity must be a positive integer')
    }
    this.ringCapacity = capacity
    this.buffer = Array.from({ length: capacity }, () => null)
    // Empty-state placeholders: front = rear = 0 when size === 0
  }

  enqueue(value: number): void {
    if (this.isFull()) {
      throw new Error('circular queue overflow')
    }
    if (this.isEmpty()) {
      this.frontIndex = 0
      this.rearIndex = 0
    } else {
      this.rearIndex = (this.rearIndex + 1) % this.ringCapacity
    }
    this.buffer[this.rearIndex] = value
    this.liveSize += 1
  }

  dequeue(): number {
    if (this.isEmpty()) {
      throw new Error('circular queue underflow')
    }
    const value = this.buffer[this.frontIndex]!
    this.buffer[this.frontIndex] = null
    this.liveSize -= 1
    if (this.liveSize === 0) {
      this.frontIndex = 0
      this.rearIndex = 0
    } else {
      this.frontIndex = (this.frontIndex + 1) % this.ringCapacity
    }
    return value
  }

  front(): number {
    if (this.isEmpty()) {
      throw new Error('circular queue underflow')
    }
    return this.buffer[this.frontIndex]!
  }

  rear(): number {
    if (this.isEmpty()) {
      throw new Error('circular queue underflow')
    }
    return this.buffer[this.rearIndex]!
  }

  isEmpty(): boolean {
    return this.liveSize === 0
  }

  isFull(): boolean {
    return this.liveSize === this.ringCapacity
  }

  size(): number {
    return this.liveSize
  }

  capacity(): number {
    return this.ringCapacity
  }

  clear(): void {
    this.buffer = Array.from({ length: this.ringCapacity }, () => null)
    this.frontIndex = 0
    this.rearIndex = 0
    this.liveSize = 0
  }

  toArray(): number[] {
    if (this.isEmpty()) {
      return []
    }
    const values: number[] = []
    let index = this.frontIndex
    for (let i = 0; i < this.liveSize; i += 1) {
      values.push(this.buffer[index]!)
      index = (index + 1) % this.ringCapacity
    }
    return values
  }
}

// Wraparound example (capacity 4)
const cq = new CircularQueue(4)
for (const value of [10, 20, 30, 40]) {
  cq.enqueue(value)
}
console.log(cq.isFull()) // true
console.log(cq.dequeue()) // 10 — frees index 0
cq.enqueue(50) // writes at index 0 (wrap)
console.log(cq.toArray()) // [20, 30, 40, 50]
console.log(cq.front(), cq.rear()) // 20 50`,
  },

  whenToUse: [
    'You need FIFO order with a fixed memory budget (ring / circular buffer).',
    'You must reuse slots after dequeue without shifting the whole array.',
    'You implement streaming, I/O, or producer–consumer buffers with known capacity.',
    'You want O(1) enqueue and dequeue with direct array indexing.',
  ],

  whenNotToUse: [
    'You need an unbounded queue that grows freely — use a dynamic queue or linked-list queue.',
    'You need priority ordering — use a heap / priority queue.',
    'You need frequent middle-element access by arbitrary index beyond the ring API.',
    'You only need LIFO behavior — use a stack.',
  ],

  keyTakeaways: [
    'A circular queue is a fixed-capacity FIFO ring: indices wrap with (i + 1) % capacity.',
    'Track front, rear, and an explicit size so empty (size === 0) and full (size === capacity) stay unambiguous.',
    'Enqueue writes at the rear; dequeue clears the front; both may wrap from the last index to 0.',
    'Wraparound reuses previously occupied slots — that is why circular queues fix wasted prefix space.',
    'Enqueue/dequeue/front/rear/isEmpty/isFull are O(1) on a fixed buffer with direct indexing.',
    'Overflow and underflow must be handled explicitly; never invent values.',
    'Regular queues share FIFO rules; circular queues add fixed capacity and modulo reuse.',
  ],

  previousLesson: {
    title: 'Queue',
    href: '/learn/queue',
  },

  nextLesson: {
    title: 'Data Structures Hub',
    href: '/data-structures',
  },

  categoryHref: '/data-structures',
}
