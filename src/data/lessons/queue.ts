import type { Lesson } from './types'

export const queue: Lesson = {
  slug: 'queue',
  title: 'Queue',
  description:
    'Learn the FIFO queue: front and rear, enqueue, dequeue, peek, underflow and overflow, complexity, stack comparison, and everyday applications from print jobs to BFS.',
  category: 'Data Structures',
  difficulty: 'Beginner',
  estimatedTime: '25 min',
  tags: ['Data Structures', 'Queue', 'FIFO', 'Beginner'],

  objectives: [
    'Understand what a queue is and how it differs from a general list.',
    'Explain the FIFO (First In, First Out) principle.',
    'Identify the front and rear of a queue.',
    'Perform enqueue, dequeue, front/peek, rear, isEmpty, and size correctly.',
    'Recognize queue underflow and (when capacity is fixed) overflow.',
    'Compare queues with stacks (FIFO vs LIFO).',
    'State the time complexity of common queue operations for an efficient implementation.',
    'Name real-world applications: waiting lines, task processing, message queues, BFS, and event handling.',
  ],

  overview: [
    'A queue is a collection with two ends: the front (where items leave) and the rear (where items join).',
    'The rule is FIFO — First In, First Out. The value that arrived earliest is the first one removed.',
    'Picture a waiting line: new people join at the back; the person at the front is served next. You do not cut the line from the middle.',
    'Example left-to-right: FRONT → [10] → [20] → [30] → [40] ← REAR. Here 10 is at the front and 40 is at the rear.',
    'enqueue(50) places 50 after 40. dequeue() removes 10 and leaves 20 at the front. The interactive visual below uses this same layout.',
    'Stack vs Queue — Stack is LIFO (push/pop at the top; undo history). Queue is FIFO (enqueue at rear / dequeue at front; waiting line). Same “restricted ends” idea, opposite removal order. Review the Stack lesson if LIFO is still fuzzy.',
  ],

  whyItMatters: [
    'Scheduling and buffering need fair arrival order — queues model that naturally.',
    'Breadth-first search (BFS) explores level by level using a queue of nodes to visit next.',
    'Print jobs, customer support tickets, and many event loops process work in arrival order.',
    'Queues pair with stacks as the two classic end-restricted structures after arrays and linked lists.',
  ],

  visualization: {
    title: 'Queue in action',
    description:
      'Step through enqueue, dequeue, front, rear, isEmpty, and size. Watch the front and rear pointers, empty-queue underflow, and an optional educational capacity overflow demo.',
    type: 'queue',
  },

  steps: [
    {
      title: 'See FIFO on a diagram',
      description:
        'Draw elements left-to-right with FRONT on the left and REAR on the right. New values join at the rear; removals leave from the front.',
    },
    {
      title: 'Enqueue adds at the rear',
      description:
        'enqueue(value) places a new element at the rear. Example: [10, 20, 30] → enqueue(40) → [10, 20, 30, 40].',
    },
    {
      title: 'Dequeue removes the front',
      description:
        'dequeue() removes and returns the front. Example: [10, 20, 30] → dequeue() → [20, 30], returning 10.',
    },
    {
      title: 'Front / peek and rear',
      description:
        'front() (peek) returns the front without removing it. rear() returns the last element without removing it.',
    },
    {
      title: 'isEmpty and size',
      description:
        'isEmpty() is true when there are no elements. size() returns how many values are currently waiting.',
    },
    {
      title: 'Handle underflow safely',
      description:
        'dequeue(), front(), or rear() on an empty queue is underflow. Check isEmpty first, or treat an empty result as an error — do not invent a value.',
    },
    {
      title: 'Optional overflow (fixed capacity)',
      description:
        'Some teaching demos and fixed circular buffers refuse enqueue when full (overflow). Dynamic queues usually grow instead; label any max size as a configurable educational limit.',
    },
  ],

  thinkingGuide: {
    title: 'Think in “front leaves, rear joins”',
    description:
      'Before coding, decide which end is front and what happens on empty.',
    steps: [
      'Name front and rear. Ask: after this enqueue or dequeue, which values are front and rear?',
      'Write the before/after arrays with index 0 as front (common logical view).',
      'For every dequeue/front/rear, ask: what if the queue is empty?',
      'Match the problem to FIFO: fair scheduling, “next in line,” breadth-first exploration — not nested undo (that is a stack).',
      'If you implement with an array, avoid Array.shift() for dequeue when you need O(1); use a head index or circular buffer instead.',
    ],
  },

  complexity: {
    time: {
      best: 'O(1)',
      average: 'O(1)',
      worst: 'O(1) · enqueue amortized O(1)',
    },
    space: 'O(n)',
    notes: {
      time: [
        'Enqueue: O(1) amortized for a dynamic array (append at the end). An individual resize that copies the array can take O(n), but the average cost per enqueue stays O(1).',
        'Dequeue: O(1) with a head-index or circular-buffer implementation — advance the front pointer instead of shifting every element (Array.shift() is O(n)).',
        'Front / peek: O(1) — read the front element without removing it.',
        'Rear: O(1) — read the last live element without removing it.',
        'isEmpty: O(1) — compare size to zero.',
        'Size: O(1) — store and return a length counter (or live_end − head).',
        'Complexity depends on the underlying implementation. A naive “dequeue = shift the whole array” approach is O(n) and should not claim O(1).',
      ],
      space: [
        'Storing n values uses O(n) space.',
        'Operations themselves use O(1) auxiliary space beyond the queue storage.',
        'A head-index array may temporarily keep discarded prefix slots until compaction; a linked-list queue uses O(n) plus pointer overhead per node.',
      ],
    },
  },

  commonMistakes: {
    description:
      'Most queue bugs are empty-queue mistakes, confusing FIFO with LIFO, or claiming O(1) while shifting arrays.',
    mistakes: [
      {
        title: 'Dequeueing or peeking an empty queue',
        explanation:
          'Underflow is a real error. Guard with isEmpty, return a clear empty result, or throw — never silently invent a value.',
      },
      {
        title: 'Using Array.shift() and calling dequeue O(1)',
        explanation:
          'shift() moves every remaining element. Prefer a head index or circular buffer so dequeue stays O(1), and compact or wrap when needed.',
      },
      {
        title: 'Confusing queue with stack',
        explanation:
          'Queues are FIFO; stacks are LIFO. Waiting lines and BFS want a queue; undo and nested matching want a stack.',
      },
      {
        title: 'Assuming every queue has a fixed capacity',
        explanation:
          'Many queues grow dynamically. Overflow only applies when you choose a fixed buffer or hit memory limits. Label teaching capacities clearly.',
      },
      {
        title: 'Mutating shared history while visualizing',
        explanation:
          'When recording steps, clone the snapshot for each frame. Reusing one mutable structure rewrites earlier steps when you scrub previous/next.',
      },
    ],
  },

  algorithmConnection: {
    title: 'Where queues show up',
    eyebrow: 'APPLICATIONS',
    description:
      'FIFO matches fair waiting, buffering, and breadth-first exploration. Production message queues often add persistence, retries, delivery guarantees, and distributed workers beyond a basic in-memory queue.',
    items: [
      {
        title: 'Print job scheduling',
        description:
          'Documents join the printer queue in order. The job at the front prints next; new jobs enqueue at the rear.',
      },
      {
        title: 'Customer service waiting lines',
        description:
          'Callers or tickets wait in arrival order. Agents dequeue the front ticket so earlier customers are served first.',
      },
      {
        title: 'Task-processing queue (simple visual)',
        description:
          'FRONT → [resize] → [compress] → [upload] ← REAR. A worker dequeues “resize”, finishes it, then dequeues “compress”. New tasks enqueue behind “upload”. Same FIFO pattern as the interactive lesson queue.',
      },
      {
        title: 'Message queues',
        description:
          'Producers enqueue messages; consumers dequeue them. Real systems may persist messages, retry failures, and fan out across workers — more than a single in-memory array.',
      },
      {
        title: 'Breadth-first search (BFS)',
        description:
          'Enqueue the start node, then repeatedly dequeue a node and enqueue its unseen neighbors. The queue visits level by level.',
      },
      {
        title: 'Network packet processing & event handling',
        description:
          'Packets and UI/OS events are often buffered in arrival order so handlers process them fairly without dropping earlier work.',
      },
      {
        title: 'Stack vs Queue (quick comparison)',
        description:
          'Principle: Stack = LIFO, Queue = FIFO. Add: push vs enqueue. Remove: pop vs dequeue. Removal end: top vs front. Common example: undo history vs waiting line. Open the Stack lesson for the LIFO playground.',
      },
      {
        title: 'Circular Queue (next lesson)',
        description:
          'When you need fixed capacity and slot reuse without shifting, continue to Circular Queue — wraparound with (index + 1) % capacity and size-based full/empty checks.',
      },
    ],
  },

  pseudocode: `Queue (head-index array: live elements = buffer[head..end])

Enqueue(queue, value)
    // Amortized O(1) on a dynamic array
    if queue has a fixed capacity and is full
        report overflow  // educational / fixed-buffer case
        return
    append value to buffer
    return

Dequeue(queue)
    // O(1) — advance head; do NOT shift the whole array
    if queue is empty
        report underflow
        return none
    value = buffer[head]
    head = head + 1
    if discarded prefix is large, compact buffer and reset head
    return value

Front(queue)  // also called Peek
    if queue is empty
        report underflow
        return none
    return buffer[head]

Rear(queue)
    if queue is empty
        report underflow
        return none
    return last element of buffer

IsEmpty(queue)
    return size(queue) equals 0

Size(queue)
    return (buffer length - head)`,

  code: {
    python: `class Queue:
    """FIFO queue with a head index (O(1) dequeue, no list.pop(0))."""

    def __init__(self, max_capacity=None):
        self._buffer = []
        self._head = 0
        # Optional educational / fixed-buffer limit (None = unbounded).
        self.max_capacity = max_capacity

    def enqueue(self, value):
        if self.max_capacity is not None and self.size() >= self.max_capacity:
            raise IndexError("queue overflow (educational capacity)")
        self._buffer.append(value)  # amortized O(1)

    def dequeue(self):
        if self.is_empty():
            raise IndexError("queue underflow")
        value = self._buffer[self._head]
        self._head += 1
        # Compact when discarded prefix is at least the live length.
        if self._head > 0 and self._head >= self.size():
            self._buffer = self._buffer[self._head:]
            self._head = 0
        return value  # O(1) amortized

    def front(self):
        if self.is_empty():
            raise IndexError("queue underflow")
        return self._buffer[self._head]

    def rear(self):
        if self.is_empty():
            raise IndexError("queue underflow")
        return self._buffer[-1]

    def is_empty(self):
        return self.size() == 0

    def size(self):
        return len(self._buffer) - self._head

    def clear(self):
        self._buffer.clear()
        self._head = 0

    def to_array(self):
        return list(self._buffer[self._head:])  # front → rear


# Example: [10, 20, 30] → enqueue(40) → [10, 20, 30, 40]
queue = Queue()
queue.enqueue(10)
queue.enqueue(20)
queue.enqueue(30)
queue.enqueue(40)
print(queue.front())      # 10
print(queue.rear())       # 40
print(queue.dequeue())    # 10
print(queue.to_array())   # [20, 30, 40]
print(queue.is_empty())   # False
print(queue.size())       # 3`,

    javascript: `class Queue {
  /** FIFO queue with a head index (O(1) dequeue, no Array.shift). */
  constructor(maxCapacity = null) {
    this._buffer = []
    this._head = 0
    // Optional educational / fixed-buffer limit (null = unbounded).
    this.maxCapacity = maxCapacity
  }

  enqueue(value) {
    if (this.maxCapacity !== null && this.size() >= this.maxCapacity) {
      throw new Error('queue overflow (educational capacity)')
    }
    this._buffer.push(value) // amortized O(1)
  }

  dequeue() {
    if (this.isEmpty()) {
      throw new Error('queue underflow')
    }
    const value = this._buffer[this._head]
    this._head += 1
    // Compact when discarded prefix is at least the live length.
    if (this._head > 0 && this._head >= this.size()) {
      this._buffer = this._buffer.slice(this._head)
      this._head = 0
    }
    return value // O(1) amortized
  }

  front() {
    if (this.isEmpty()) {
      throw new Error('queue underflow')
    }
    return this._buffer[this._head]
  }

  rear() {
    if (this.isEmpty()) {
      throw new Error('queue underflow')
    }
    return this._buffer[this._buffer.length - 1]
  }

  isEmpty() {
    return this.size() === 0
  }

  size() {
    return this._buffer.length - this._head
  }

  clear() {
    this._buffer = []
    this._head = 0
  }

  toArray() {
    return this._buffer.slice(this._head) // front → rear
  }
}

// Example: [10, 20, 30] → enqueue(40) → [10, 20, 30, 40]
const queue = new Queue()
queue.enqueue(10)
queue.enqueue(20)
queue.enqueue(30)
queue.enqueue(40)
console.log(queue.front()) // 10
console.log(queue.rear()) // 40
console.log(queue.dequeue()) // 10
console.log(queue.toArray()) // [20, 30, 40]
console.log(queue.isEmpty()) // false
console.log(queue.size()) // 3`,

    typescript: `/** FIFO queue with a head index (O(1) dequeue, no Array.shift). */
class Queue {
  private buffer: number[] = []
  private head = 0
  /** Optional educational / fixed-buffer limit (null = unbounded). */
  readonly maxCapacity: number | null

  constructor(maxCapacity: number | null = null) {
    this.maxCapacity = maxCapacity
  }

  enqueue(value: number): void {
    if (
      this.maxCapacity !== null &&
      this.size() >= this.maxCapacity
    ) {
      throw new Error('queue overflow (educational capacity)')
    }
    this.buffer.push(value) // amortized O(1)
  }

  dequeue(): number {
    if (this.isEmpty()) {
      throw new Error('queue underflow')
    }
    const value = this.buffer[this.head]!
    this.head += 1
    // Compact when discarded prefix is at least the live length.
    if (this.head > 0 && this.head >= this.size()) {
      this.buffer = this.buffer.slice(this.head)
      this.head = 0
    }
    return value // O(1) amortized
  }

  front(): number {
    if (this.isEmpty()) {
      throw new Error('queue underflow')
    }
    return this.buffer[this.head]!
  }

  rear(): number {
    if (this.isEmpty()) {
      throw new Error('queue underflow')
    }
    return this.buffer[this.buffer.length - 1]!
  }

  isEmpty(): boolean {
    return this.size() === 0
  }

  size(): number {
    return this.buffer.length - this.head
  }

  clear(): void {
    this.buffer = []
    this.head = 0
  }

  toArray(): number[] {
    return this.buffer.slice(this.head) // front → rear
  }
}

// Example: [10, 20, 30] → enqueue(40) → [10, 20, 30, 40]
const queue = new Queue()
queue.enqueue(10)
queue.enqueue(20)
queue.enqueue(30)
queue.enqueue(40)
console.log(queue.front()) // 10
console.log(queue.rear()) // 40
console.log(queue.dequeue()) // 10
console.log(queue.toArray()) // [20, 30, 40]
console.log(queue.isEmpty()) // false
console.log(queue.size()) // 3`,
  },

  whenToUse: [
    'You need first-in, first-out order: waiting lines, fair scheduling, or “next in line.”',
    'You implement BFS or level-order traversal with a queue of nodes to visit.',
    'You buffer work between producers and consumers (tasks, events, packets).',
    'You want a simple two-ended API (enqueue / dequeue / front) on top of an array or linked list.',
  ],

  whenNotToUse: [
    'You need last-in, first-out ordering — use a stack.',
    'You need frequent access to middle elements by index — use an array or list with a richer API.',
    'You claim O(1) dequeue while shifting the whole array from the front on every removal.',
    'You need priority ordering — use a heap / priority queue.',
  ],

  keyTakeaways: [
    'A queue is FIFO: the first value enqueued is the first dequeued.',
    'Enqueue joins at the rear; dequeue leaves from the front. Front and rear name those ends.',
    'dequeue/front/rear on an empty queue is underflow — handle it explicitly.',
    'With a head-index or circular buffer, enqueue is amortized O(1) and dequeue/front/rear/isEmpty/size are O(1).',
    'Do not implement “O(1) dequeue” with Array.shift() — shifting is O(n).',
    'Fixed capacity overflow is optional and educational unless you truly use a bounded buffer.',
    'Queues power scheduling, buffering, BFS, and event/message processing; stacks are the LIFO counterpart.',
    'For fixed capacity and slot reuse without shifting, continue to the Circular Queue lesson.',
  ],

  previousLesson: {
    title: 'Stack',
    href: '/learn/stack',
  },

  nextLesson: {
    title: 'Circular Queue',
    href: '/learn/circular-queue',
  },

  categoryHref: '/data-structures',
}
