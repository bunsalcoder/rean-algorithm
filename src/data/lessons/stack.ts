import type { Lesson } from './types'

export const stack: Lesson = {
  slug: 'stack',
  title: 'Stack',
  description:
    'Learn the LIFO stack: top, push, pop, peek, underflow and overflow, complexity, and everyday applications from undo to DFS.',
  category: 'Data Structures',
  difficulty: 'Beginner',
  estimatedTime: '25 min',
  tags: ['Data Structures', 'Stack', 'LIFO', 'Beginner'],

  objectives: [
    'Understand what a stack is and how it differs from a general list.',
    'Explain the LIFO (Last In, First Out) principle.',
    'Identify the top of a stack and why only the top is accessible for push and pop.',
    'Perform push, pop, and peek operations correctly.',
    'Recognize stack underflow and (when capacity is fixed) overflow.',
    'State the time and space complexity of common stack operations, including amortized push.',
    'Name real-world applications: call stacks, undo/redo, parentheses checks, DFS, and backtracking.',
  ],

  overview: [
    'A stack is a collection with a single open end called the top. You add (push) and remove (pop) only at that end.',
    'The rule is LIFO — Last In, First Out. The value you pushed most recently is the first one that comes off.',
    'Picture a stack of plates: you put a new plate on top and take a plate from the top. You do not pull from the middle.',
    'Example with top above bottom: TOP → [30] above [20] above [10] → BOTTOM. Here 30 is the top.',
    'push(40) places 40 above 30. pop() removes 30 and leaves 20 on top. The interactive visual below uses this same layout.',
  ],

  whyItMatters: [
    'Many algorithms need nested “go deeper / come back” behavior — stacks model that naturally.',
    'Language runtimes use a call stack for function frames; understanding stacks makes recursion clearer.',
    'Undo histories, expression evaluation, and bracket matching are classic interview and production uses.',
    'Stacks are a bridge from linked lists and arrays to queues, trees (DFS), and graph traversal.',
  ],

  visualization: {
    title: 'Stack in action',
    description:
      'Step through push, pop, peek, isEmpty, and size. Watch the top pointer, empty-stack underflow, and an optional educational capacity overflow demo.',
    type: 'stack',
  },

  steps: [
    {
      title: 'See LIFO on a diagram',
      description:
        'Draw bottom elements lower and the top at the highest cell. Only the top cell is where push and pop happen.',
    },
    {
      title: 'Push adds at the top',
      description:
        'push(value) places a new element on top. Example: [10, 20] → push(30) → [10, 20, 30] with 30 as top.',
    },
    {
      title: 'Pop removes the top',
      description:
        'pop() removes and returns the top. Example: [10, 20, 30] → pop() → [10, 20], returning 30.',
    },
    {
      title: 'Peek reads without removing',
      description:
        'peek() (also called top) returns the top value but leaves the stack unchanged.',
    },
    {
      title: 'isEmpty and size',
      description:
        'isEmpty() is true when there are no elements. size() returns how many values are currently stored.',
    },
    {
      title: 'Handle underflow safely',
      description:
        'pop() or peek() on an empty stack is underflow. Check isEmpty first, or treat an empty result as an error — do not invent a value.',
    },
    {
      title: 'Optional overflow (fixed capacity)',
      description:
        'Some teaching demos and fixed buffers refuse push when full (overflow). Dynamic array stacks usually grow instead; label any max size as a configurable educational limit.',
    },
  ],

  thinkingGuide: {
    title: 'Think in “only the top”',
    description:
      'Before coding, decide what the top is and what happens on empty.',
    steps: [
      'Name the top. Ask: after this push or pop, which value is now top?',
      'Write the before/after arrays with the last element as top (common array implementation).',
      'For every pop/peek, ask: what if the stack is empty?',
      'Match the problem to LIFO: nesting, undo, “return to previous state,” depth-first exploration.',
    ],
  },

  complexity: {
    time: {
      best: 'O(1)',
      average: 'O(1)',
      worst: 'O(1) · push amortized O(1)',
    },
    space: 'O(n)',
    notes: {
      time: [
        'Push: O(1) amortized for a dynamic array (append at the end). An individual resize that copies the array can take O(n), but the average cost per push stays O(1).',
        'Pop: O(1) — remove the last element.',
        'Peek / top: O(1) — read the last element without removing it.',
        'isEmpty: O(1) — compare size to zero.',
        'Size: O(1) — store and return a length counter (or read array length).',
        'Searching or indexing into the middle is O(n) and is outside the usual stack API.',
      ],
      space: [
        'Storing n values uses O(n) space.',
        'Operations themselves use O(1) auxiliary space beyond the stack storage.',
        'A linked-list stack also uses O(n) space plus pointer overhead per node.',
      ],
    },
  },

  commonMistakes: {
    description:
      'Most stack bugs are empty-stack mistakes or confusing LIFO with FIFO.',
    mistakes: [
      {
        title: 'Popping or peeking an empty stack',
        explanation:
          'Underflow is a real error. Guard with isEmpty, return a clear empty result, or throw — never silently invent a value.',
      },
      {
        title: 'Treating the first array index as the top',
        explanation:
          'If you implement with a dynamic array, the last index is usually the top so push/pop stay O(1). Using index 0 as top forces O(n) shifts.',
      },
      {
        title: 'Confusing stack with queue',
        explanation:
          'Stacks are LIFO; queues are FIFO. Undo and nested matching want a stack; fair scheduling and BFS want a queue.',
      },
      {
        title: 'Assuming every stack has a fixed capacity',
        explanation:
          'Many stacks grow dynamically. Overflow only applies when you choose a fixed buffer or hit memory limits. Label teaching capacities clearly.',
      },
      {
        title: 'Mutating shared history while visualizing',
        explanation:
          'When recording steps, clone the array for each frame. Reusing one mutable array rewrites earlier steps when you scrub previous/next.',
      },
    ],
  },

  algorithmConnection: {
    title: 'Where stacks show up',
    eyebrow: 'APPLICATIONS',
    description:
      'LIFO matches nesting, “return to previous,” and depth-first exploration. Here are common uses — including a tiny parentheses sketch (not a full expression parser).',
    items: [
      {
        title: 'Function call stack',
        description:
          'Each function call pushes a frame; returning pops it. Recursion depth is stack depth.',
      },
      {
        title: 'Undo and redo',
        description:
          'Each edit can push onto an undo stack. Undo pops and may push onto a redo stack.',
      },
      {
        title: 'Browser history patterns',
        description:
          'A simple back-stack is LIFO. Real browser navigation often uses richer history structures than a single stack — treat “back stack” as a teaching model, not a full browser architecture.',
      },
      {
        title: 'Balanced parentheses (sketch)',
        description:
          'Scan left to right. Push openings; on a closer, pop and check the match. Example “( [ ] )”: push “(”, push “[”, see “]” → pop “[”, see “)” → pop “(”, empty → balanced. Mismatches or leftover openings mean unbalanced. This lesson does not implement a full parser.',
      },
      {
        title: 'Expression evaluation',
        description:
          'Shunting-yard and related algorithms use stacks for operators and operands when evaluating or converting expressions.',
      },
      {
        title: 'Depth-first search and backtracking',
        description:
          'DFS (explicit stack or recursion) and backtracking push a choice, explore, then pop to restore the previous state.',
      },
    ],
  },

  pseudocode: `Stack (array, last index = top)

Push(stack, value)
    // Amortized O(1) on a dynamic array
    if stack has a fixed capacity and is full
        report overflow  // educational / fixed-buffer case
        return
    append value to stack
    return

Pop(stack)
    if stack is empty
        report underflow
        return none
    value = last element
    remove last element
    return value

Peek(stack)
    if stack is empty
        report underflow
        return none
    return last element

IsEmpty(stack)
    return size(stack) equals 0

Size(stack)
    return number of elements`,

  code: {
    python: `class Stack:
    """LIFO stack. The last list element is the top."""

    def __init__(self, max_capacity=None):
        self._items = []
        # Optional educational / fixed-buffer limit (None = unbounded).
        self.max_capacity = max_capacity

    def push(self, value):
        if self.max_capacity is not None and len(self._items) >= self.max_capacity:
            raise IndexError("stack overflow (educational capacity)")
        self._items.append(value)  # amortized O(1)

    def pop(self):
        if not self._items:
            raise IndexError("stack underflow")
        return self._items.pop()  # O(1)

    def peek(self):
        if not self._items:
            raise IndexError("stack underflow")
        return self._items[-1]

    def is_empty(self):
        return len(self._items) == 0

    def size(self):
        return len(self._items)

    def clear(self):
        self._items.clear()

    def to_array(self):
        return list(self._items)  # bottom → top


# Example: [10, 20] → push(30) → [10, 20, 30]
stack = Stack()
stack.push(10)
stack.push(20)
stack.push(30)
print(stack.peek())      # 30
print(stack.pop())       # 30
print(stack.to_array())  # [10, 20]
print(stack.is_empty())  # False
print(stack.size())      # 2`,

    javascript: `class Stack {
  /** LIFO stack. The last array element is the top. */
  constructor(maxCapacity = null) {
    this._items = []
    // Optional educational / fixed-buffer limit (null = unbounded).
    this.maxCapacity = maxCapacity
  }

  push(value) {
    if (this.maxCapacity !== null && this._items.length >= this.maxCapacity) {
      throw new Error('stack overflow (educational capacity)')
    }
    this._items.push(value) // amortized O(1)
  }

  pop() {
    if (this._items.length === 0) {
      throw new Error('stack underflow')
    }
    return this._items.pop() // O(1)
  }

  peek() {
    if (this._items.length === 0) {
      throw new Error('stack underflow')
    }
    return this._items[this._items.length - 1]
  }

  isEmpty() {
    return this._items.length === 0
  }

  size() {
    return this._items.length
  }

  clear() {
    this._items = []
  }

  toArray() {
    return [...this._items] // bottom → top
  }
}

// Example: [10, 20] → push(30) → [10, 20, 30]
const stack = new Stack()
stack.push(10)
stack.push(20)
stack.push(30)
console.log(stack.peek()) // 30
console.log(stack.pop()) // 30
console.log(stack.toArray()) // [10, 20]
console.log(stack.isEmpty()) // false
console.log(stack.size()) // 2`,

    typescript: `/** LIFO stack. The last array element is the top. */
class Stack {
  private items: number[] = []
  /** Optional educational / fixed-buffer limit (null = unbounded). */
  readonly maxCapacity: number | null

  constructor(maxCapacity: number | null = null) {
    this.maxCapacity = maxCapacity
  }

  push(value: number): void {
    if (
      this.maxCapacity !== null &&
      this.items.length >= this.maxCapacity
    ) {
      throw new Error('stack overflow (educational capacity)')
    }
    this.items.push(value) // amortized O(1)
  }

  pop(): number {
    if (this.items.length === 0) {
      throw new Error('stack underflow')
    }
    return this.items.pop()!
  }

  peek(): number {
    if (this.items.length === 0) {
      throw new Error('stack underflow')
    }
    return this.items[this.items.length - 1]!
  }

  isEmpty(): boolean {
    return this.items.length === 0
  }

  size(): number {
    return this.items.length
  }

  clear(): void {
    this.items = []
  }

  toArray(): number[] {
    return [...this.items] // bottom → top
  }
}

// Example: [10, 20] → push(30) → [10, 20, 30]
const stack = new Stack()
stack.push(10)
stack.push(20)
stack.push(30)
console.log(stack.peek()) // 30
console.log(stack.pop()) // 30
console.log(stack.toArray()) // [10, 20]
console.log(stack.isEmpty()) // false
console.log(stack.size()) // 2`,
  },

  whenToUse: [
    'You need last-in, first-out order: undo, nested scopes, or “return to previous state.”',
    'You are matching nested delimiters (parentheses, HTML tags) or evaluating expressions.',
    'You implement DFS or backtracking with an explicit stack instead of only recursion.',
    'You want a simple end-restricted API (push / pop / peek) on top of an array or linked list.',
  ],

  whenNotToUse: [
    'You need first-in, first-out ordering — use a queue.',
    'You need frequent access to middle elements by index — use an array or list with a richer API.',
    'You assumed push is always O(1) with a fixed tiny buffer that you grow by copying every time without amortization analysis.',
    'You need priority ordering — use a heap / priority queue.',
  ],

  keyTakeaways: [
    'A stack is LIFO: the last value pushed is the first popped.',
    'Only the top is involved in push, pop, and peek.',
    'pop/peek on an empty stack is underflow — handle it explicitly.',
    'Push, pop, peek, isEmpty, and size are O(1); dynamic-array push is amortized O(1).',
    'Fixed capacity overflow is optional and educational unless you truly use a bounded buffer.',
    'Stacks power call frames, undo, bracket checks, expression tools, DFS, and backtracking.',
  ],

  previousLesson: {
    title: 'Doubly Linked List',
    href: '/learn/doubly-linked-list',
  },

  nextLesson: {
    title: 'Queue (coming soon)',
    href: '/roadmap/stack-queue',
  },

  categoryHref: '/data-structures',
}
