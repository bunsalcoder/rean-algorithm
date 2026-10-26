import type { Lesson } from './types'

export const doublyLinkedList: Lesson = {
  slug: 'doubly-linked-list',
  title: 'Doubly Linked List',
  description:
    'Learn prev and next references, forward and backward traversal, insertion, and deletion on a doubly linked list — and how it trades memory for convenience versus a singly linked list.',
  category: 'Data Structures',
  difficulty: 'Beginner',
  estimatedTime: '30 min',
  tags: ['Data Structures', 'Linked List', 'Pointers', 'Beginner'],

  objectives: [
    'Understand the difference between singly and doubly linked lists.',
    'Explain prev and next references on each node, including null boundaries.',
    'Traverse a doubly linked list forward from head and backward from tail.',
    'Insert nodes at the beginning and end using head and tail references.',
    'Insert a node before or after a known node and update all affected references.',
    'Delete nodes (head, middle, tail, or only node) while keeping prev/next consistent.',
    'State the time and space trade-offs, including the extra memory for prev.',
    'Choose between arrays, singly linked lists, and doubly linked lists for a use case.',
  ],

  overview: [
    'A doubly linked list is a sequence of nodes where each node holds a value plus two references: next (toward the tail) and prev (toward the head).',
    'The list maintains both a head and a tail. Example: null ← [10] ⇄ [20] ⇄ [30] → null. Head’s prev and tail’s next are null.',
    'Compared with a singly linked list, you can walk either direction and unlink a known node without searching for its predecessor — at the cost of an extra reference per node and more pointer updates on every splice.',
    'This lesson keeps a maintained head and tail so insert at either end is O(1). Finding a node by value is still O(n).',
  ],

  whyItMatters: [
    'Many real structures (browser history, LRU caches, deque implementations) rely on bidirectional links.',
    'Doubly linked lists make “delete this node I already hold” a local O(1) update — a common interview and systems pattern.',
    'Comparing singly vs doubly lists sharpens intuition about memory vs convenience trade-offs.',
    'Pointer discipline here transfers directly to trees, graphs, and intrusive list designs.',
  ],

  visualization: {
    title: 'Doubly Linked List in action',
    description:
      'Step through forward and backward traversal, insert at head or tail, insert before or after a selected value, and delete by value. Watch head, tail, prev, and next update one frame at a time.',
    type: 'doubly-linked-list',
  },

  steps: [
    {
      title: 'Picture prev and next',
      description:
        'Each node has three fields: value, prev, and next. Draw null on both ends: head.prev is null and tail.next is null.',
    },
    {
      title: 'Keep head and tail',
      description:
        'head points at the first node; tail points at the last. An empty list has head = null and tail = null.',
    },
    {
      title: 'Traverse forward and backward',
      description:
        'Forward: current = head, follow next until null. Backward: current = tail, follow prev until null.',
    },
    {
      title: 'Insert at the beginning',
      description:
        'Create a node, set new.next = oldHead and oldHead.prev = new (if oldHead exists), then head = new. If the list was empty, also set tail = new.',
    },
    {
      title: 'Insert at the end',
      description:
        'With a maintained tail, append is O(1): new.prev = oldTail, oldTail.next = new, tail = new. Empty list sets both head and tail.',
    },
    {
      title: 'Insert before or after a known node',
      description:
        'Once you hold the target node, update the four adjacent references (left.next, new.prev, new.next, right.prev). Finding the target by value is still O(n).',
    },
    {
      title: 'Delete while keeping links consistent',
      description:
        'Reconnect neighbors (or update head/tail). Deleting the only node must leave head = null and tail = null. Invalid deletes must not corrupt the structure.',
    },
  ],

  thinkingGuide: {
    title: 'Two directions, more updates',
    description:
      'Before coding, draw every arrow you will change. Miss one and the list becomes inconsistent.',
    steps: [
      'Draw boxes with prev | value | next. Label head and tail. Show null on both ends.',
      'For every splice, list the references that change. Inserting in the middle usually touches four links.',
      'Ask whether you already have the node. Local unlink can be O(1); search by value is O(n).',
      'After mutations, check: head.prev === null, tail.next === null, and every adjacent pair agrees on next/prev.',
    ],
  },

  complexity: {
    time: {
      best: 'O(1)',
      average: 'O(n)',
      worst: 'O(n)',
    },
    space: 'O(n)',
    notes: {
      time: [
        'Forward traversal: O(n) — walk next from head to null.',
        'Backward traversal: O(n) — walk prev from tail to null.',
        'Search by value: O(n) — scan until you find the value or reach a null boundary.',
        'Insert at head with head reference: O(1).',
        'Insert at tail with tail reference: O(1).',
        'Insert before/after a known node: O(1) for the pointer updates.',
        'Find a node by value (needed before relative insert/delete-by-value): O(n).',
        'Delete a known node: O(1) — update neighbors (and head/tail if needed).',
        'Delete by value: O(n) — find first, then unlink in O(1).',
        'O(1) insertion and deletion assume the relevant node reference is already available.',
      ],
      space: [
        'Storing n values needs n nodes, so the structure uses O(n) space.',
        'Each node stores both prev and next — more memory per element than a singly linked list or a packed array.',
        'Traversal and local splices use a few pointers — O(1) auxiliary space beyond the list itself.',
      ],
    },
  },

  commonMistakes: {
    description:
      'Doubly linked list bugs are almost always incomplete reference updates.',
    mistakes: [
      {
        title: 'Updating only next and forgetting prev',
        explanation:
          'If left.next = new but new.prev is still null (or right.prev still points at the old neighbor), forward and backward walks disagree. Always update both directions.',
      },
      {
        title: 'Forgetting head or tail on edge deletes',
        explanation:
          'Deleting the head must move head and clear the new head’s prev. Deleting the tail must move tail and clear the new tail’s next. Deleting the only node must null both ends.',
      },
      {
        title: 'Claiming doubly lists are always faster',
        explanation:
          'They are not universally faster. Extra pointers mean more memory traffic. Use them when bidirectional walks or known-node deletes matter — not by default.',
      },
      {
        title: 'Treating insert-before as O(1) when you only have a value',
        explanation:
          'Finding the node by value is O(n). The O(1) claim applies only after you already hold the node reference.',
      },
      {
        title: 'Corrupting the list on missing values',
        explanation:
          'If the target is missing, leave every reference untouched. Failed operations must be no-ops.',
      },
    ],
  },

  algorithmConnection: {
    title: 'Array vs Singly vs Doubly Linked List',
    eyebrow: 'COMPARE',
    description:
      'All three store ordered sequences. They differ in layout, direction of travel, and which updates are cheap.',
    items: [
      {
        title: 'Direction of traversal',
        description:
          'Arrays and singly lists walk one way efficiently (index++ or next). Doubly lists walk either way via next or prev.',
      },
      {
        title: 'Memory usage',
        description:
          'Arrays pack values tightly. Singly lists add one reference per node. Doubly lists add two — higher per-element overhead.',
      },
      {
        title: 'Pointer updates on insert/delete',
        description:
          'Singly lists often update one next link (plus a predecessor). Doubly lists typically update more links so both directions stay consistent.',
      },
      {
        title: 'Deletion of a known node',
        description:
          'In a singly list you usually need the previous node. In a doubly list the node’s own prev is enough, so unlink is local O(1).',
      },
      {
        title: 'Implementation complexity',
        description:
          'Doubly lists have more edge cases (head, tail, empty, sole node) and more arrows to keep honest. Prefer them when the extra convenience is worth the care.',
      },
      {
        title: 'Appropriate use cases',
        description:
          'Arrays: indexed access and cache-friendly scans. Singly lists: simple stacks/queues and forward-only chains. Doubly lists: deques, LRU-style structures, and frequent splices around known nodes.',
      },
    ],
  },

  pseudocode: `TraverseForward(head)
    current = head
    while current is not null
        visit current.value
        current = current.next

TraverseBackward(tail)
    current = tail
    while current is not null
        visit current.value
        current = current.prev

InsertAtBeginning(list, value)
    node = Node(value)
    node.prev = null
    node.next = list.head
    if list.head is null
        list.head = node
        list.tail = node
    else
        list.head.prev = node
        list.head = node

InsertAtEnd(list, value)
    node = Node(value)
    node.next = null
    node.prev = list.tail
    if list.tail is null
        list.head = node
        list.tail = node
    else
        list.tail.next = node
        list.tail = node

InsertAfter(target, value)   // target already known
    node = Node(value)
    node.prev = target
    node.next = target.next
    if target.next is not null
        target.next.prev = node
    else
        list.tail = node
    target.next = node

InsertBefore(target, value)  // target already known
    node = Node(value)
    node.next = target
    node.prev = target.prev
    if target.prev is not null
        target.prev.next = node
    else
        list.head = node
    target.prev = node

DeleteKnown(node)            // node already known
    if node.prev is not null
        node.prev.next = node.next
    else
        list.head = node.next
    if node.next is not null
        node.next.prev = node.prev
    else
        list.tail = node.prev

DeleteByValue(list, value)
    current = list.head
    while current is not null
        if current.value equals value
            DeleteKnown(current)
            return
        current = current.next
    // not found — leave list unchanged`,

  code: {
    python: `class Node:
    def __init__(self, value):
        self.value = value
        self.prev = None
        self.next = None


class DoublyLinkedList:
    def __init__(self):
        self.head = None
        self.tail = None

    def to_array(self):
        values = []
        current = self.head
        while current is not None:
            values.append(current.value)
            current = current.next
        return values

    def to_array_reverse(self):
        values = []
        current = self.tail
        while current is not None:
            values.append(current.value)
            current = current.prev
        return values

    def insert_at_beginning(self, value):
        node = Node(value)
        node.next = self.head
        if self.head is None:
            self.head = self.tail = node
        else:
            self.head.prev = node
            self.head = node

    def insert_at_end(self, value):
        node = Node(value)
        node.prev = self.tail
        if self.tail is None:
            self.head = self.tail = node
        else:
            self.tail.next = node
            self.tail = node

    def insert_after(self, target_value, value):
        current = self.head
        while current is not None and current.value != target_value:
            current = current.next
        if current is None:
            return False
        node = Node(value)
        node.prev = current
        node.next = current.next
        if current.next is not None:
            current.next.prev = node
        else:
            self.tail = node
        current.next = node
        return True

    def insert_before(self, target_value, value):
        current = self.head
        while current is not None and current.value != target_value:
            current = current.next
        if current is None:
            return False
        node = Node(value)
        node.next = current
        node.prev = current.prev
        if current.prev is not None:
            current.prev.next = node
        else:
            self.head = node
        current.prev = node
        return True

    def delete_by_value(self, value):
        current = self.head
        while current is not None and current.value != value:
            current = current.next
        if current is None:
            return False
        if current.prev is not None:
            current.prev.next = current.next
        else:
            self.head = current.next
        if current.next is not None:
            current.next.prev = current.prev
        else:
            self.tail = current.prev
        return True


# Example: null ← 10 ⇄ 20 ⇄ 30 → null
dll = DoublyLinkedList()
for v in [10, 20, 30]:
    dll.insert_at_end(v)
dll.insert_before(20, 15)
dll.delete_by_value(30)
print(dll.to_array())          # [10, 15, 20]
print(dll.to_array_reverse())  # [20, 15, 10]`,

    javascript: `class Node {
  constructor(value) {
    this.value = value
    this.prev = null
    this.next = null
  }
}

class DoublyLinkedList {
  constructor() {
    this.head = null
    this.tail = null
  }

  toArray() {
    const values = []
    let current = this.head
    while (current !== null) {
      values.push(current.value)
      current = current.next
    }
    return values
  }

  toArrayReverse() {
    const values = []
    let current = this.tail
    while (current !== null) {
      values.push(current.value)
      current = current.prev
    }
    return values
  }

  insertAtBeginning(value) {
    const node = new Node(value)
    node.next = this.head
    if (this.head === null) {
      this.head = this.tail = node
    } else {
      this.head.prev = node
      this.head = node
    }
  }

  insertAtEnd(value) {
    const node = new Node(value)
    node.prev = this.tail
    if (this.tail === null) {
      this.head = this.tail = node
    } else {
      this.tail.next = node
      this.tail = node
    }
  }

  insertAfter(targetValue, value) {
    let current = this.head
    while (current !== null && current.value !== targetValue) {
      current = current.next
    }
    if (current === null) {
      return false
    }
    const node = new Node(value)
    node.prev = current
    node.next = current.next
    if (current.next !== null) {
      current.next.prev = node
    } else {
      this.tail = node
    }
    current.next = node
    return true
  }

  insertBefore(targetValue, value) {
    let current = this.head
    while (current !== null && current.value !== targetValue) {
      current = current.next
    }
    if (current === null) {
      return false
    }
    const node = new Node(value)
    node.next = current
    node.prev = current.prev
    if (current.prev !== null) {
      current.prev.next = node
    } else {
      this.head = node
    }
    current.prev = node
    return true
  }

  deleteByValue(value) {
    let current = this.head
    while (current !== null && current.value !== value) {
      current = current.next
    }
    if (current === null) {
      return false
    }
    if (current.prev !== null) {
      current.prev.next = current.next
    } else {
      this.head = current.next
    }
    if (current.next !== null) {
      current.next.prev = current.prev
    } else {
      this.tail = current.prev
    }
    return true
  }
}

// Example: null ← 10 ⇄ 20 ⇄ 30 → null
const dll = new DoublyLinkedList()
;[10, 20, 30].forEach((v) => dll.insertAtEnd(v))
dll.insertBefore(20, 15)
dll.deleteByValue(30)
console.log(dll.toArray())         // [10, 15, 20]
console.log(dll.toArrayReverse())  // [20, 15, 10]`,

    typescript: `type Node = {
  value: number
  prev: Node | null
  next: Node | null
}

type DoublyLinkedList = {
  head: Node | null
  tail: Node | null
}

function createList(): DoublyLinkedList {
  return { head: null, tail: null }
}

function toArray(list: DoublyLinkedList): number[] {
  const values: number[] = []
  let current = list.head
  while (current !== null) {
    values.push(current.value)
    current = current.next
  }
  return values
}

function toArrayReverse(list: DoublyLinkedList): number[] {
  const values: number[] = []
  let current = list.tail
  while (current !== null) {
    values.push(current.value)
    current = current.prev
  }
  return values
}

function insertAtBeginning(list: DoublyLinkedList, value: number): void {
  const node: Node = { value, prev: null, next: list.head }
  if (list.head === null) {
    list.head = list.tail = node
  } else {
    list.head.prev = node
    list.head = node
  }
}

function insertAtEnd(list: DoublyLinkedList, value: number): void {
  const node: Node = { value, prev: list.tail, next: null }
  if (list.tail === null) {
    list.head = list.tail = node
  } else {
    list.tail.next = node
    list.tail = node
  }
}

function insertAfter(
  list: DoublyLinkedList,
  targetValue: number,
  value: number,
): boolean {
  let current = list.head
  while (current !== null && current.value !== targetValue) {
    current = current.next
  }
  if (current === null) {
    return false
  }
  const node: Node = { value, prev: current, next: current.next }
  if (current.next !== null) {
    current.next.prev = node
  } else {
    list.tail = node
  }
  current.next = node
  return true
}

function insertBefore(
  list: DoublyLinkedList,
  targetValue: number,
  value: number,
): boolean {
  let current = list.head
  while (current !== null && current.value !== targetValue) {
    current = current.next
  }
  if (current === null) {
    return false
  }
  const node: Node = { value, prev: current.prev, next: current }
  if (current.prev !== null) {
    current.prev.next = node
  } else {
    list.head = node
  }
  current.prev = node
  return true
}

function deleteByValue(list: DoublyLinkedList, value: number): boolean {
  let current = list.head
  while (current !== null && current.value !== value) {
    current = current.next
  }
  if (current === null) {
    return false
  }
  if (current.prev !== null) {
    current.prev.next = current.next
  } else {
    list.head = current.next
  }
  if (current.next !== null) {
    current.next.prev = current.prev
  } else {
    list.tail = current.prev
  }
  return true
}

// Example: null ← 10 ⇄ 20 ⇄ 30 → null
const dll = createList()
;[10, 20, 30].forEach((v) => insertAtEnd(dll, v))
insertBefore(dll, 20, 15)
deleteByValue(dll, 30)
console.log(toArray(dll))         // [10, 15, 20]
console.log(toArrayReverse(dll))  // [20, 15, 10]`,
  },

  whenToUse: [
    'You need efficient forward and backward traversal from head and tail.',
    'You frequently delete or splice around a node you already hold a reference to.',
    'You are implementing a deque, undo/redo buffer, or LRU-style structure.',
    'Bidirectional navigation is part of the product behavior (for example, browser-like history).',
  ],

  whenNotToUse: [
    'You need frequent random access by index — prefer an array.',
    'You only ever walk forward and rarely delete known nodes — a singly linked list is simpler and lighter.',
    'Memory is tight and the extra prev pointer is not buying needed operations.',
    'You assumed relative insert/delete is O(1) without already knowing the node — search is still O(n).',
  ],

  keyTakeaways: [
    'A doubly linked list is null ← nodes connected by prev and next → null, with head and tail.',
    'You can traverse forward (next) and backward (prev).',
    'Insert at head or tail is O(1) with maintained end references; middle splice is O(1) once the node is known.',
    'Delete of a known node is O(1); delete by value is O(n) to find.',
    'Doubly lists use more memory and more pointer updates than singly lists — they are not universally faster.',
    'Always keep both directions consistent, and set head = tail = null when the list becomes empty.',
  ],

  previousLesson: {
    title: 'Singly Linked List',
    href: '/learn/singly-linked-list',
  },

  nextLesson: {
    title: 'Learning Roadmap',
    href: '/roadmap',
  },

  categoryHref: '/data-structures',
}
