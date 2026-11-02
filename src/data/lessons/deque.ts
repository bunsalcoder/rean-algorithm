import type { Lesson } from './types'

export const deque: Lesson = {
  slug: 'deque',
  title: 'Deque (Double-Ended Queue)',
  description:
    'Learn the deque: insert and remove at both ends, front and rear pointers, circular-buffer implementation, complexity, Stack vs Queue vs Deque, and practical applications.',
  category: 'Data Structures',
  difficulty: 'Beginner',
  estimatedTime: '30 min',
  tags: ['Data Structures', 'Deque', 'Queue', 'Stack', 'Beginner'],

  objectives: [
    'Understand what a deque (double-ended queue) is.',
    'Explain how a deque differs from a regular queue and a stack.',
    'Insert elements at both the front and the rear.',
    'Remove elements from both the front and the rear.',
    'Track front and rear positions on a circular buffer.',
    'Recognize common deque implementations (circular array, doubly linked list).',
    'Identify practical applications such as sliding windows and palindrome checks.',
    'Analyze the complexity of efficient deque operations (amortized O(1) at both ends).',
  ],

  overview: [
    'A deque (pronounced “deck”) is a double-ended queue: you can insert and remove at both the front and the rear.',
    'A stack only uses one end (LIFO). A queue inserts at the rear and removes from the front (FIFO). A deque allows both patterns — and more — from one structure.',
    'This lesson uses a circular-buffer deque: a dynamic ring with a front index and an explicit size. The rear is derived as (front + size − 1) % capacity.',
    'pushFront / pushBack / popFront / popBack are amortized O(1). An individual resize can be O(n), but growth by doubling keeps inserts amortized O(1).',
    'Optional educational capacity in the playground is a teaching knob — not a universal property of deques. Real language deques usually grow until memory limits.',
    'Default playground values are [10, 20, 30, 40]. Try pushFront and popBack to see both ends move.',
  ],

  whyItMatters: [
    'Many algorithms need flexible access at both ends — sliding window maximum, undo/redo pairs, and work queues with urgent tasks at the front.',
    'Understanding deques clarifies how stacks and queues are special cases of a more flexible end-restricted sequence.',
    'Efficient end operations without Array.shift() / Array.unshift() are a classic interview and systems topic.',
    'Palindrome checking and bidirectional buffers are simple, memorable deque demos.',
  ],

  visualization: {
    title: 'Deque in action',
    description:
      'Step through pushFront, pushBack, popFront, popBack, front, back, isEmpty, and size. Watch elements enter and leave from either end on a horizontal FRONT ⇄ REAR layout.',
    type: 'deque',
  },

  steps: [
    {
      title: 'See both ends',
      description:
        'FRONT is the left end; REAR is the right end. Elements sit between them with ⇄ links. An empty deque shows a dashed empty slot.',
    },
    {
      title: 'How both ends work',
      description:
        'pushFront / popFront touch only the front. pushBack / popBack touch only the rear. Peeks (front / back) read without removing.',
    },
    {
      title: 'Insert at the front',
      description:
        'pushFront writes at the previous modular index before front, then updates front. On an empty deque, the value lands at index 0 as both ends.',
    },
    {
      title: 'Insert at the rear',
      description:
        'pushBack writes at the next modular index after rear. When the ring is full, the buffer doubles and values are re-laid from index 0.',
    },
    {
      title: 'Remove from either end',
      description:
        'popFront advances front with wraparound. popBack retreats the rear (size decreases). Empty pops report underflow and leave state unchanged.',
    },
    {
      title: 'Front and rear pointers',
      description:
        'Track front and size. rear = (front + size − 1) % capacity when non-empty. Indices wrap with modulo arithmetic.',
    },
    {
      title: 'Compare stack, queue, and deque',
      description:
        'Stack = one end. Queue = insert rear / remove front. Deque = both ends. You can simulate stack or queue with a deque by restricting which ends you use.',
    },
  ],

  thinkingGuide: {
    title: 'Think in “two open ends”',
    description:
      'Before coding, decide which end each operation touches and what empty means.',
    steps: [
      'Draw FRONT … REAR for the current values.',
      'For each operation, mark which end changes and what the new front/rear are.',
      'Ask: is the deque empty? Would this pop underflow?',
      'On a ring buffer, compute the next index with (i ± 1) % capacity.',
      'Compare to stack/queue: could this sequence be done with only one end-restricted API?',
    ],
  },

  complexity: {
    time: {
      best: 'O(1)',
      average: 'O(1) amortized',
      worst: 'O(n) on a single resize',
    },
    space: 'O(n) for n elements (plus spare ring capacity)',
    notes: {
      time: [
        'pushFront: O(1) amortized — write at the previous modular front index; a resize is O(n) occasionally.',
        'pushBack: O(1) amortized — write at the next modular rear index; a resize is O(n) occasionally.',
        'popFront: O(1) — clear front and advance with wraparound.',
        'popBack: O(1) — clear rear and decrease size (rear retreats).',
        'front: O(1) — read buffer[front] when non-empty.',
        'back: O(1) — read buffer[rear] when non-empty.',
        'isEmpty: O(1) — compare size to 0.',
        'size: O(1) — return the size counter.',
        'Dynamic resizing may make an individual insertion O(n), while insertion remains O(1) amortized across a long sequence.',
        'These complexities assume a circular-buffer (or similarly efficient) implementation — not Array.shift() / Array.unshift().',
      ],
      space: [
        'The ring stores O(capacity) slots; live elements are size ≤ capacity.',
        'Operations use O(1) auxiliary space beyond the buffer.',
        'Doubly linked list deques also give O(1) end ops with different memory trade-offs (extra pointers, poorer locality).',
      ],
    },
  },

  commonMistakes: {
    description:
      'Most deque bugs confuse ends, claim O(1) with shifting arrays, or ignore empty underflow.',
    mistakes: [
      {
        title: 'Using Array.shift() / unshift() and calling it O(1)',
        explanation:
          'Shifting every element is O(n). A circular buffer or linked list keeps both ends O(1) (amortized for growth).',
      },
      {
        title: 'Mixing up front and rear',
        explanation:
          'pushFront and popFront must agree on the same end. Drawing FRONT ⇄ REAR after each step prevents off-by-one end swaps.',
      },
      {
        title: 'Popping or peeking when empty',
        explanation:
          'Empty → underflow. Reject the operation and leave the deque unchanged — do not invent values.',
      },
      {
        title: 'Forgetting modular wraparound',
        explanation:
          'Front and rear indices wrap with (i ± 1) % capacity. Writing past the last index without wrap either crashes or wastes the ring.',
      },
      {
        title: 'Treating educational capacity as a universal rule',
        explanation:
          'Fixed capacity overflow is optional for demos. Many real deques grow dynamically until memory is exhausted.',
      },
      {
        title: 'Using a deque when a stack or queue is enough',
        explanation:
          'Extra flexibility is useful, but a simpler stack or queue API is clearer when you only need one discipline (LIFO or FIFO).',
      },
    ],
  },

  algorithmConnection: {
    title: 'Stack vs Queue vs Deque',
    eyebrow: 'COMPARISON & USES',
    description:
      'All three are end-restricted sequences. The difference is which ends allow insert and remove.',
    items: [
      {
        title: 'Stack — LIFO',
        description:
          'Insert and remove at the top only. Model with a deque by using only pushBack/popBack (or only the front end).',
      },
      {
        title: 'Queue — FIFO',
        description:
          'Insert at the rear, remove from the front. Model with a deque via pushBack + popFront (classic FIFO).',
      },
      {
        title: 'Deque — flexible ends',
        description:
          'Insert and remove at both ends. More power when algorithms need bidirectional access; slightly richer API than you may need for simple FIFO/LIFO.',
      },
      {
        title: 'Sliding window maximum',
        description:
          'A monotonic deque stores candidate indices so the front is always the max in the current window — both ends are updated as the window slides.',
      },
      {
        title: 'Undo / redo and dual histories',
        description:
          'Some editors keep actions in structures that push/pop from ends representing “past” and “future” timelines.',
      },
      {
        title: 'Palindrome check (conceptual)',
        description:
          'Load characters into a deque, then repeatedly compare front() and back() and pop both ends. Mismatch → not a palindrome; empty → success.',
      },
      {
        title: 'Task scheduling with priority at either end',
        description:
          'Normal jobs enqueue at the rear; urgent jobs can pushFront so they run sooner — still a simple deque policy, not a full priority queue.',
      },
      {
        title: 'Related lessons',
        description:
          'Review Stack for LIFO, Queue for FIFO, and Circular Queue for fixed ring wraparound — then return here for both-end operations on a growable ring.',
      },
    ],
  },

  pseudocode: `Deque (circular buffer[0..k-1], front, size)
  // Empty: size = 0, front = 0 (placeholder)
  // Non-empty: front = first index
  // rear = (front + size - 1) % capacity
  // Indices wrap: next = (i + 1) % k , prev = (i - 1 + k) % k

PushFront(deque, value)
    if educational max capacity set and size == maxCapacity
        report overflow
        return
    if size == capacity
        grow buffer (double) and re-lay front→rear at 0   // O(n) occasionally
    if size == 0
        front = 0
        buffer[0] = value
    else
        front = (front - 1 + capacity) % capacity
        buffer[front] = value
    size = size + 1

PushBack(deque, value)
    if educational max capacity set and size == maxCapacity
        report overflow
        return
    if size == capacity
        grow buffer (double) and re-lay front→rear at 0
    if size == 0
        front = 0
        buffer[0] = value
    else
        rear = (front + size - 1) % capacity
        next = (rear + 1) % capacity
        buffer[next] = value
    size = size + 1

PopFront(deque)
    if size == 0
        report underflow
        return none
    value = buffer[front]
    buffer[front] = empty
    size = size - 1
    if size == 0
        front = 0
    else
        front = (front + 1) % capacity
    return value

PopBack(deque)
    if size == 0
        report underflow
        return none
    rear = (front + size - 1) % capacity
    value = buffer[rear]
    buffer[rear] = empty
    size = size - 1
    if size == 0
        front = 0
    return value

Front(deque)
    if size == 0: underflow / none
    else return buffer[front]

Back(deque)
    if size == 0: underflow / none
    else return buffer[(front + size - 1) % capacity]

IsEmpty(deque) → size == 0
Size(deque)    → size
Clear(deque)   → size = 0, front = 0 (keep capacity)
ToArray(deque) → walk size steps from front with wrap

# Palindrome check (conceptual — not a full algorithm lesson)
IsPalindrome(chars)
    load each character with pushBack
    while size > 1
        if Front() != Back(): return false
        PopFront(); PopBack()
    return true`,

  code: {
    python: `class Deque:
    """Circular-buffer deque with amortized O(1) ops at both ends."""

    def __init__(self, capacity=8, max_capacity=None):
        if capacity <= 0:
            raise ValueError("capacity must be a positive integer")
        self._buffer = [None] * capacity
        self._front = 0
        self._size = 0
        self._max_capacity = max_capacity

    def _capacity(self):
        return len(self._buffer)

    def _rear_index(self):
        return (self._front + self._size - 1) % self._capacity()

    def _grow(self):
        values = self.to_array()
        new_cap = max(self._capacity() * 2, self._capacity() + 1)
        if self._max_capacity is not None:
            new_cap = min(new_cap, self._max_capacity)
        if new_cap <= self._capacity():
            raise OverflowError("cannot grow deque")
        self._buffer = values + [None] * (new_cap - len(values))
        self._front = 0
        self._size = len(values)

    def push_front(self, value):
        if self._max_capacity is not None and self._size >= self._max_capacity:
            raise OverflowError("deque is full (educational capacity)")
        if self._size == self._capacity():
            self._grow()
        if self._size == 0:
            self._front = 0
            self._buffer[0] = value
        else:
            self._front = (self._front - 1) % self._capacity()
            self._buffer[self._front] = value
        self._size += 1

    def push_back(self, value):
        if self._max_capacity is not None and self._size >= self._max_capacity:
            raise OverflowError("deque is full (educational capacity)")
        if self._size == self._capacity():
            self._grow()
        if self._size == 0:
            self._front = 0
            self._buffer[0] = value
        else:
            nxt = (self._rear_index() + 1) % self._capacity()
            self._buffer[nxt] = value
        self._size += 1

    def pop_front(self):
        if self._size == 0:
            raise IndexError("pop from empty deque")
        value = self._buffer[self._front]
        self._buffer[self._front] = None
        self._size -= 1
        if self._size == 0:
            self._front = 0
        else:
            self._front = (self._front + 1) % self._capacity()
        return value

    def pop_back(self):
        if self._size == 0:
            raise IndexError("pop from empty deque")
        rear = self._rear_index()
        value = self._buffer[rear]
        self._buffer[rear] = None
        self._size -= 1
        if self._size == 0:
            self._front = 0
        return value

    def front(self):
        if self._size == 0:
            raise IndexError("front from empty deque")
        return self._buffer[self._front]

    def back(self):
        if self._size == 0:
            raise IndexError("back from empty deque")
        return self._buffer[self._rear_index()]

    def is_empty(self):
        return self._size == 0

    def size(self):
        return self._size

    def clear(self):
        self._buffer = [None] * self._capacity()
        self._front = 0
        self._size = 0

    def to_array(self):
        out = []
        idx = self._front
        for _ in range(self._size):
            out.append(self._buffer[idx])
            idx = (idx + 1) % self._capacity()
        return out


# Conceptual palindrome check with a deque
def is_palindrome(text):
    d = Deque()
    for ch in text:
        if ch.isalnum():
            d.push_back(ch.lower())
    while d.size() > 1:
        if d.front() != d.back():
            return False
        d.pop_front()
        d.pop_back()
    return True
`,
    javascript: `class Deque {
  /**
   * Circular-buffer deque. End ops are amortized O(1).
   * maxCapacity is an optional educational hard stop.
   */
  constructor(capacity = 8, maxCapacity = null) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new Error('capacity must be a positive integer')
    }
    this._buffer = Array(capacity).fill(null)
    this._front = 0
    this._size = 0
    this._maxCapacity = maxCapacity
  }

  _capacity() {
    return this._buffer.length
  }

  _rearIndex() {
    return (this._front + this._size - 1) % this._capacity()
  }

  _grow() {
    const values = this.toArray()
    let next = Math.max(this._capacity() * 2, this._capacity() + 1)
    if (this._maxCapacity !== null) {
      next = Math.min(next, this._maxCapacity)
    }
    if (next <= this._capacity()) {
      throw new Error('cannot grow deque')
    }
    this._buffer = [...values, ...Array(next - values.length).fill(null)]
    this._front = 0
    this._size = values.length
  }

  pushFront(value) {
    if (this._maxCapacity !== null && this._size >= this._maxCapacity) {
      throw new Error('deque overflow (educational capacity)')
    }
    if (this._size === this._capacity()) this._grow()
    if (this._size === 0) {
      this._front = 0
      this._buffer[0] = value
    } else {
      this._front = (this._front - 1 + this._capacity()) % this._capacity()
      this._buffer[this._front] = value
    }
    this._size += 1
  }

  pushBack(value) {
    if (this._maxCapacity !== null && this._size >= this._maxCapacity) {
      throw new Error('deque overflow (educational capacity)')
    }
    if (this._size === this._capacity()) this._grow()
    if (this._size === 0) {
      this._front = 0
      this._buffer[0] = value
    } else {
      const next = (this._rearIndex() + 1) % this._capacity()
      this._buffer[next] = value
    }
    this._size += 1
  }

  popFront() {
    if (this._size === 0) throw new Error('underflow')
    const value = this._buffer[this._front]
    this._buffer[this._front] = null
    this._size -= 1
    if (this._size === 0) this._front = 0
    else this._front = (this._front + 1) % this._capacity()
    return value
  }

  popBack() {
    if (this._size === 0) throw new Error('underflow')
    const rear = this._rearIndex()
    const value = this._buffer[rear]
    this._buffer[rear] = null
    this._size -= 1
    if (this._size === 0) this._front = 0
    return value
  }

  front() {
    if (this._size === 0) throw new Error('underflow')
    return this._buffer[this._front]
  }

  back() {
    if (this._size === 0) throw new Error('underflow')
    return this._buffer[this._rearIndex()]
  }

  isEmpty() {
    return this._size === 0
  }

  size() {
    return this._size
  }

  clear() {
    this._buffer = Array(this._capacity()).fill(null)
    this._front = 0
    this._size = 0
  }

  toArray() {
    const out = []
    let idx = this._front
    for (let i = 0; i < this._size; i += 1) {
      out.push(this._buffer[idx])
      idx = (idx + 1) % this._capacity()
    }
    return out
  }
}

/** Conceptual palindrome check using both ends. */
function isPalindrome(text) {
  const d = new Deque()
  for (const ch of text) {
    if (/[a-z0-9]/i.test(ch)) d.pushBack(ch.toLowerCase())
  }
  while (d.size() > 1) {
    if (d.front() !== d.back()) return false
    d.popFront()
    d.popBack()
  }
  return true
}
`,
    typescript: `type DequeSnapshot = {
  readonly buffer: readonly (number | null)[]
  readonly front: number
  readonly size: number
  readonly capacity: number
  readonly maxCapacity: number | null
}

function nextIndex(index: number, capacity: number): number {
  return (index + 1) % capacity
}

function prevIndex(index: number, capacity: number): number {
  return (index - 1 + capacity) % capacity
}

function rearBufferIndex(snapshot: DequeSnapshot): number {
  if (snapshot.size === 0) return -1
  return (snapshot.front + snapshot.size - 1) % snapshot.capacity
}

function toArray(snapshot: DequeSnapshot): number[] {
  if (snapshot.size === 0) return []
  const values: number[] = []
  let index = snapshot.front
  for (let i = 0; i < snapshot.size; i += 1) {
    const value = snapshot.buffer[index]
    if (value !== null && value !== undefined) values.push(value)
    index = nextIndex(index, snapshot.capacity)
  }
  return values
}

function createEmpty(capacity = 8, maxCapacity: number | null = null): DequeSnapshot {
  return {
    buffer: Array.from({ length: capacity }, () => null),
    front: 0,
    size: 0,
    capacity,
    maxCapacity,
  }
}

function grow(snapshot: DequeSnapshot): DequeSnapshot {
  const values = toArray(snapshot)
  let nextCapacity = Math.max(snapshot.capacity * 2, snapshot.capacity + 1)
  if (snapshot.maxCapacity !== null) {
    nextCapacity = Math.min(nextCapacity, snapshot.maxCapacity)
  }
  const buffer: (number | null)[] = [...values]
  while (buffer.length < nextCapacity) buffer.push(null)
  return {
    buffer,
    front: 0,
    size: values.length,
    capacity: nextCapacity,
    maxCapacity: snapshot.maxCapacity,
  }
}

function pushFront(snapshot: DequeSnapshot, value: number): DequeSnapshot {
  if (snapshot.maxCapacity !== null && snapshot.size >= snapshot.maxCapacity) {
    throw new Error('overflow')
  }
  let current = snapshot.size === snapshot.capacity ? grow(snapshot) : snapshot
  const buffer = [...current.buffer]
  let front = current.front
  if (current.size === 0) {
    front = 0
    buffer[0] = value
  } else {
    front = prevIndex(current.front, current.capacity)
    buffer[front] = value
  }
  return {
    buffer,
    front,
    size: current.size + 1,
    capacity: current.capacity,
    maxCapacity: current.maxCapacity,
  }
}

function pushBack(snapshot: DequeSnapshot, value: number): DequeSnapshot {
  if (snapshot.maxCapacity !== null && snapshot.size >= snapshot.maxCapacity) {
    throw new Error('overflow')
  }
  let current = snapshot.size === snapshot.capacity ? grow(snapshot) : snapshot
  const buffer = [...current.buffer]
  if (current.size === 0) {
    buffer[0] = value
    return {
      buffer,
      front: 0,
      size: 1,
      capacity: current.capacity,
      maxCapacity: current.maxCapacity,
    }
  }
  const next = nextIndex(rearBufferIndex(current), current.capacity)
  buffer[next] = value
  return {
    buffer,
    front: current.front,
    size: current.size + 1,
    capacity: current.capacity,
    maxCapacity: current.maxCapacity,
  }
}

function popFront(snapshot: DequeSnapshot): { snapshot: DequeSnapshot; value: number } {
  if (snapshot.size === 0) throw new Error('underflow')
  const value = snapshot.buffer[snapshot.front]!
  const buffer = [...snapshot.buffer]
  buffer[snapshot.front] = null
  const nextSize = snapshot.size - 1
  return {
    value,
    snapshot: {
      buffer,
      front: nextSize === 0 ? 0 : nextIndex(snapshot.front, snapshot.capacity),
      size: nextSize,
      capacity: snapshot.capacity,
      maxCapacity: snapshot.maxCapacity,
    },
  }
}

function popBack(snapshot: DequeSnapshot): { snapshot: DequeSnapshot; value: number } {
  if (snapshot.size === 0) throw new Error('underflow')
  const rear = rearBufferIndex(snapshot)
  const value = snapshot.buffer[rear]!
  const buffer = [...snapshot.buffer]
  buffer[rear] = null
  const nextSize = snapshot.size - 1
  return {
    value,
    snapshot: {
      buffer,
      front: nextSize === 0 ? 0 : snapshot.front,
      size: nextSize,
      capacity: snapshot.capacity,
      maxCapacity: snapshot.maxCapacity,
    },
  }
}

function front(snapshot: DequeSnapshot): number {
  if (snapshot.size === 0) throw new Error('underflow')
  return snapshot.buffer[snapshot.front]!
}

function back(snapshot: DequeSnapshot): number {
  if (snapshot.size === 0) throw new Error('underflow')
  return snapshot.buffer[rearBufferIndex(snapshot)]!
}

function isEmpty(snapshot: DequeSnapshot): boolean {
  return snapshot.size === 0
}

function size(snapshot: DequeSnapshot): number {
  return snapshot.size
}

/** Conceptual palindrome check using both ends. */
function isPalindrome(text: string): boolean {
  let d = createEmpty()
  for (const ch of text) {
    if (/[a-z0-9]/i.test(ch)) {
      d = pushBack(d, ch.toLowerCase().charCodeAt(0))
    }
  }
  while (size(d) > 1) {
    if (front(d) !== back(d)) return false
    d = popFront(d).snapshot
    d = popBack(d).snapshot
  }
  return true
}
`,
  },

  whenToUse: [
    'You need to insert or remove from both ends efficiently.',
    'You are implementing sliding-window or monotonic-deque patterns.',
    'You want one structure that can model either a stack or a queue by restricting ends.',
    'You are buffering work with occasional “urgent” items at the front.',
    'You are checking palindromes or other both-ends comparisons conceptually.',
  ],

  whenNotToUse: [
    'You only need LIFO — a stack API is clearer.',
    'You only need FIFO — a queue (or circular queue) is clearer.',
    'You need priority ordering beyond “front vs rear” — use a heap / priority queue.',
    'You need frequent middle-element access by arbitrary index — use an array or list with a richer API.',
    'You claim O(1) end ops while shifting a plain array from the front or middle.',
  ],

  keyTakeaways: [
    'A deque is double-ended: push/pop at front and rear.',
    'Stack = LIFO (one end). Queue = FIFO (rear in, front out). Deque = both ends.',
    'A circular buffer with front + size keeps both ends amortized O(1) without Array.shift()/unshift().',
    'rear = (front + size − 1) % capacity when non-empty; indices wrap with modulo.',
    'Dynamic resizing can make one insert O(n); inserts remain O(1) amortized.',
    'Empty pops and peeks are underflow — handle them; do not invent values.',
    'Educational capacity is a demo option, not a universal deque rule.',
    'Applications include sliding windows, scheduling, undo/redo patterns, and palindrome checks.',
  ],

  previousLesson: {
    title: 'Circular Queue',
    href: '/learn/circular-queue',
  },

  nextLesson: {
    title: 'Data Structures Hub',
    href: '/data-structures',
  },

  categoryHref: '/data-structures',
}
