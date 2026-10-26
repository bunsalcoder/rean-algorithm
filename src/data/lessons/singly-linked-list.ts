import type { Lesson } from './types'

export const singlyLinkedList: Lesson = {
  slug: 'singly-linked-list',
  title: 'Singly Linked List',
  description:
    'Learn nodes, next references, traversal, insertion, and deletion on a singly linked list — and when an array is the better choice.',
  category: 'Data Structures',
  difficulty: 'Beginner',
  estimatedTime: '25 min',
  tags: ['Data Structures', 'Linked List', 'Pointers', 'Beginner'],

  objectives: [
    'Understand what a linked list is and how it differs from contiguous storage.',
    'Explain nodes and pointers/references, including the null terminator.',
    'Compare arrays and linked lists for access, insert, delete, and memory layout.',
    'Traverse a singly linked list from head to null.',
    'Insert a node at the beginning and at the end.',
    'Delete a node by value, including the head and the only node.',
    'State the time and space complexity of common operations and the assumptions behind them.',
    'Recognize when a linked list is useful and when another structure is preferable.',
  ],

  overview: [
    'A singly linked list is a sequence of nodes. Each node holds a value and a reference named next that points to the following node (or null at the end).',
    'Unlike an array, nodes do not need to sit next to each other in memory. Order comes from following next links, starting at a head reference.',
    'Example: head → [10] → [20] → [30] → null. The last node’s next is null, which marks the end of the list.',
    'This lesson focuses on the classic singly linked list: one direction only, with a head pointer and no required tail pointer.',
  ],

  whyItMatters: [
    'Linked lists teach pointer thinking used later in trees, graphs, and many interview problems.',
    'They show why “insert is cheap” only holds when you already have the right node reference.',
    'Stacks, queues, and adjacency lists are often built on linked nodes.',
    'Comparing arrays and lists builds intuition for cache locality and practical performance, not just Big O on paper.',
  ],

  visualization: {
    title: 'Singly Linked List in action',
    description:
      'Step through traversal, insert at the beginning or end, and delete by value. Watch head, current, and next references update one frame at a time.',
    type: 'singly-linked-list',
  },

  steps: [
    {
      title: 'Picture nodes and next',
      description:
        'Each node is a small box: a value field and a next field. next either points at another node or is null.',
    },
    {
      title: 'Keep a head reference',
      description:
        'head points at the first node. If head is null, the list is empty. Every walk starts from head.',
    },
    {
      title: 'Traverse with current',
      description:
        'Set current = head. While current is not null, process current.value, then set current = current.next. Stop when you reach null.',
    },
    {
      title: 'Insert at the beginning',
      description:
        'Create a new node. Set new.next = head first, then set head = new. Linking before updating head preserves the rest of the list.',
    },
    {
      title: 'Insert at the end',
      description:
        'If the list is empty, the new node becomes head. Otherwise walk until current.next is null, then set current.next = newNode.',
    },
    {
      title: 'Delete by value',
      description:
        'If head holds the value, move head to head.next. Otherwise keep prev and current; when current matches, set prev.next = current.next to skip it.',
    },
    {
      title: 'Handle edge cases',
      description:
        'Empty lists, deleting the only node, duplicate values (delete the first match), and missing values must leave the structure consistent.',
    },
  ],

  thinkingGuide: {
    title: 'Nodes and references',
    description:
      'Before writing code, be able to draw the list and say what each arrow means.',
    steps: [
      'Draw boxes for values and arrows for next. Always show null at the end.',
      'Name head. Ask: if I change head too early, do I lose the rest of the list?',
      'For deletion, name prev and current. Deletion is “make prev skip current.”',
      'Ask whether you already have a node reference. Local splice can be O(1); finding the node is often O(n).',
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
        'Access by index: O(n) — you must walk i steps from head; there is no random index math.',
        'Search by value: O(n) — scan until you find the value or reach null.',
        'Insert at head: O(1) — update two references (new.next and head).',
        'Insert at tail without a maintained tail reference: O(n) — walk to the last node, then link in O(1).',
        'Insert at tail with a maintained tail reference: O(1) — this lesson’s basic list does not keep tail.',
        'Delete head: O(1) — head = head.next.',
        'Delete by value: O(n) — find the node (and its predecessor), then unlink in O(1).',
        'If the caller already holds the node to delete (and its previous node in a singly list), the unlink itself is O(1); locating those references may still be O(n).',
      ],
      space: [
        'Storing n values needs n nodes, so the structure uses O(n) space.',
        'Each node also stores a next reference — extra memory versus a tight array of values.',
        'Traversal, insert, and delete use a few pointers (current, prev) — O(1) auxiliary space beyond the list itself.',
      ],
    },
  },

  commonMistakes: {
    description:
      'Most linked-list bugs are pointer-update mistakes. Watch for these patterns.',
    mistakes: [
      {
        title: 'Updating head before linking the new node',
        explanation:
          'If you set head = newNode before newNode.next = oldHead, you lose the previous list. Always point the new node at the old head first.',
      },
      {
        title: 'Forgetting the null terminator',
        explanation:
          'The last node’s next must be null. Loops that forget to stop on null never end, and appends that skip the walk leave the new node unreachable.',
      },
      {
        title: 'Deleting the head with the middle-node logic only',
        explanation:
          'Middle deletion needs prev. The head has no previous node — handle head as a separate case (or use a dummy node carefully).',
      },
      {
        title: 'Assuming inserts are always faster than arrays',
        explanation:
          'Pointer updates are cheap once you have the right node. Finding that node is often O(n), and arrays win on indexed access and cache locality for many workloads.',
      },
      {
        title: 'Ignoring empty-list and single-node cases',
        explanation:
          'Appending to an empty list sets head. Deleting the only node must leave head = null. Test these edges every time.',
      },
    ],
  },

  algorithmConnection: {
    title: 'Array vs Linked List',
    eyebrow: 'COMPARE',
    description:
      'Both store ordered sequences. They differ in memory layout, access patterns, and which updates are cheap.',
    items: [
      {
        title: 'Memory layout',
        description:
          'Arrays store elements in a contiguous block. Linked lists scatter nodes and connect them with next references.',
      },
      {
        title: 'Indexed access',
        description:
          'Array index access is typically O(1). Linked-list access by position is O(n) because you walk links.',
      },
      {
        title: 'Sequential traversal',
        description:
          'Both can scan in O(n). Arrays often scan faster in practice because contiguous memory is cache-friendly.',
      },
      {
        title: 'Insertion and deletion',
        description:
          'Arrays may shift many elements for a middle insert/delete. Linked lists can splice locally in O(1) once the neighboring node is known — but finding that node is usually O(n).',
      },
      {
        title: 'Extra reference storage',
        description:
          'Each linked node stores a next pointer (and object overhead in many languages), so lists use more memory per element than a packed array of values.',
      },
      {
        title: 'Cache locality and practical speed',
        description:
          'Big O ignores constant factors. Array scans often beat pointer chasing on real hardware. Prefer the structure that matches your access pattern — do not assume lists are always faster for inserts.',
      },
    ],
  },

  pseudocode: `Traverse(head)
    current = head
    while current is not null
        visit current.value
        current = current.next

InsertAtBeginning(head, value)
    node = Node(value)
    node.next = head
    head = node
    return head

InsertAtEnd(head, value)
    node = Node(value)
    node.next = null
    if head is null
        return node
    current = head
    while current.next is not null
        current = current.next
    current.next = node
    return head

DeleteByValue(head, value)
    if head is null
        return null
    if head.value equals value
        return head.next
    prev = head
    current = head.next
    while current is not null
        if current.value equals value
            prev.next = current.next
            return head
        prev = current
        current = current.next
    return head`,

  code: {
    python: `class ListNode:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next


def list_from_array(values):
    head = None
    for value in reversed(values):
        head = ListNode(value, head)
    return head


def list_to_array(head):
    values = []
    current = head
    while current is not None:
        values.append(current.value)
        current = current.next
    return values


def insert_at_beginning(head, value):
    return ListNode(value, head)


def insert_at_end(head, value):
    node = ListNode(value)
    if head is None:
        return node
    current = head
    while current.next is not None:
        current = current.next
    current.next = node
    return head


def delete_by_value(head, value):
    if head is None:
        return None
    if head.value == value:
        return head.next
    prev = head
    current = head.next
    while current is not None:
        if current.value == value:
            prev.next = current.next
            return head
        prev = current
        current = current.next
    return head


# Example: head → 10 → 20 → 30 → None
head = list_from_array([10, 20, 30])
head = insert_at_beginning(head, 5)
head = insert_at_end(head, 40)
head = delete_by_value(head, 20)
print(list_to_array(head))  # [5, 10, 30, 40]`,

    javascript: `class ListNode {
  constructor(value, next = null) {
    this.value = value
    this.next = next
  }
}

function listFromArray(values) {
  let head = null
  for (let i = values.length - 1; i >= 0; i -= 1) {
    head = new ListNode(values[i], head)
  }
  return head
}

function listToArray(head) {
  const values = []
  let current = head
  while (current !== null) {
    values.push(current.value)
    current = current.next
  }
  return values
}

function insertAtBeginning(head, value) {
  return new ListNode(value, head)
}

function insertAtEnd(head, value) {
  const node = new ListNode(value)
  if (head === null) {
    return node
  }
  let current = head
  while (current.next !== null) {
    current = current.next
  }
  current.next = node
  return head
}

function deleteByValue(head, value) {
  if (head === null) {
    return null
  }
  if (head.value === value) {
    return head.next
  }
  let prev = head
  let current = head.next
  while (current !== null) {
    if (current.value === value) {
      prev.next = current.next
      return head
    }
    prev = current
    current = current.next
  }
  return head
}

// Example: head → 10 → 20 → 30 → null
let head = listFromArray([10, 20, 30])
head = insertAtBeginning(head, 5)
head = insertAtEnd(head, 40)
head = deleteByValue(head, 20)
console.log(listToArray(head)) // [5, 10, 30, 40]`,

    typescript: `type ListNode = {
  value: number
  next: ListNode | null
}

function listFromArray(values: readonly number[]): ListNode | null {
  let head: ListNode | null = null
  for (let i = values.length - 1; i >= 0; i -= 1) {
    head = { value: values[i]!, next: head }
  }
  return head
}

function listToArray(head: ListNode | null): number[] {
  const values: number[] = []
  let current = head
  while (current !== null) {
    values.push(current.value)
    current = current.next
  }
  return values
}

function insertAtBeginning(head: ListNode | null, value: number): ListNode {
  return { value, next: head }
}

function insertAtEnd(head: ListNode | null, value: number): ListNode {
  const node: ListNode = { value, next: null }
  if (head === null) {
    return node
  }
  let current = head
  while (current.next !== null) {
    current = current.next
  }
  current.next = node
  return head
}

function deleteByValue(
  head: ListNode | null,
  value: number,
): ListNode | null {
  if (head === null) {
    return null
  }
  if (head.value === value) {
    return head.next
  }
  let prev = head
  let current = head.next
  while (current !== null) {
    if (current.value === value) {
      prev.next = current.next
      return head
    }
    prev = current
    current = current.next
  }
  return head
}

// Example: head → 10 → 20 → 30 → null
let head = listFromArray([10, 20, 30])
head = insertAtBeginning(head, 5)
head = insertAtEnd(head, 40)
head = deleteByValue(head, 20)
console.log(listToArray(head)) // [5, 10, 30, 40]`,
  },

  whenToUse: [
    'You frequently insert or delete around a node you already hold a reference to.',
    'You are implementing a stack, queue, or adjacency list with node links.',
    'The sequence grows and shrinks often, and you do not need fast indexed access.',
    'You want a clear mental model of pointer updates before learning trees and graphs.',
  ],

  whenNotToUse: [
    'You need frequent random access by index — prefer an array or dynamic array.',
    'You mostly scan sequentially on large data where cache locality matters — arrays often win in practice.',
    'You assumed inserts are O(1) without already knowing the insertion point — finding the node is still O(n).',
    'You need binary search on sorted positions — linked lists do not offer O(1) mid access.',
  ],

  keyTakeaways: [
    'A singly linked list is head → nodes connected by next → null.',
    'Traversal always starts at head and stops at null.',
    'Insert at head is O(1); append without a tail pointer is O(n).',
    'Delete by value is O(n) to find; unlinking is O(1) once prev and current are known.',
    'Arrays beat lists for indexed access and often for real-world scans; lists shine for local splices with a known node.',
    'Never update head before linking a new node, and always handle empty and single-node edge cases.',
  ],

  previousLesson: {
    title: 'Data Structures Hub',
    href: '/data-structures',
  },

  nextLesson: {
    title: 'Learning Roadmap',
    href: '/roadmap',
  },

  categoryHref: '/data-structures',
}
