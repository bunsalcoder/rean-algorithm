/**
 * Typed catalog for the Data Structures Learning Hub.
 * Presentation components should read from this module instead of hardcoding metadata.
 */

export type DataStructureAvailability = 'available' | 'coming-soon'

export type DataStructureId =
  | 'arrays'
  | 'linked-lists'
  | 'stacks'
  | 'queues'
  | 'circular-queues'
  | 'deques'
  | 'hash-tables'
  | 'trees'
  | 'avl-trees'
  | 'heaps'
  | 'priority-queues'
  | 'graphs'
  | 'tries'

export type DataStructureOperation = {
  name: string
  complexity: string
  note?: string
}

export type DataStructure = {
  id: DataStructureId
  name: string
  description: string
  /** How the structure organizes data in memory / logically. */
  organization: string
  /** Primary practical use case shown on cards. */
  useCase: string
  useCases: string[]
  operations: DataStructureOperation[]
  advantages: string[]
  limitations: string[]
  /** Typical complexities; actual cost depends on implementation. */
  complexityNote: string
  availability: DataStructureAvailability
  /** Present only when a real route with learning content exists. */
  href?: string
  /** Short label for the link (lesson vs related hub). */
  hrefLabel?: string
  accent: 'purple' | 'blue' | 'green' | 'orange' | 'pink' | 'teal' | 'violet' | 'red'
}

export type StructureScenario = {
  id: string
  need: string
  structureId: DataStructureId
  structureName: string
  rationale: string
}

export type DataStructureLearningStep = {
  id: string
  title: string
  description: string
  availability: DataStructureAvailability
  href?: string
}

export const dataStructures: DataStructure[] = [
  {
    id: 'arrays',
    name: 'Arrays',
    description:
      'A contiguous sequence of elements accessed by numeric index. The foundation for many algorithms and higher-level structures.',
    organization:
      'Elements sit in consecutive memory slots (or a contiguous logical block), so the index maps directly to a location.',
    useCase: 'Fast indexed access and sequential scans',
    useCases: [
      'Storing ordered collections with frequent index lookups',
      'Implementing buffers, matrices, and dynamic lists',
      'Serving as the backing store for stacks, queues, and heaps',
    ],
    operations: [
      { name: 'Access by index', complexity: 'O(1)' },
      {
        name: 'Search (unsorted)',
        complexity: 'O(n)',
        note: 'Must scan elements until the target is found',
      },
      {
        name: 'Insert / delete at end (amortized, dynamic array)',
        complexity: 'O(1)',
      },
      {
        name: 'Insert / delete in the middle',
        complexity: 'O(n)',
        note: 'Other elements must shift to keep contiguity',
      },
    ],
    advantages: [
      'Constant-time random access by index',
      'Excellent cache locality for sequential work',
      'Simple mental model and wide language support',
    ],
    limitations: [
      'Middle inserts and deletes are costly',
      'Fixed or resizing capacity requires planning',
      'Not ideal when you mostly splice linked nodes',
    ],
    complexityNote:
      'Indexed access is typically O(1). Searching an unsorted array is O(n). Costs assume a contiguous layout; language-level dynamic arrays may resize.',
    availability: 'available',
    href: '/algorithms/array-string',
    hrefLabel: 'Explore Array & String patterns',
    accent: 'green',
  },
  {
    id: 'linked-lists',
    name: 'Linked Lists',
    description:
      'A chain of nodes where each node holds a value and a reference to the next (and sometimes previous) node.',
    organization:
      'Nodes are connected by pointers/references rather than living in one contiguous block, so order is logical, not positional in memory.',
    useCase: 'Frequent insert or delete around known nodes',
    useCases: [
      'Implementing stacks, queues, and adjacency lists',
      'Splicing elements when you already hold a node reference',
      'Building undo histories and streaming buffers',
    ],
    operations: [
      {
        name: 'Insert / delete at known node',
        complexity: 'O(1)',
        note: 'Given a reference to the neighboring node(s)',
      },
      { name: 'Access by index', complexity: 'O(n)' },
      { name: 'Search', complexity: 'O(n)' },
      { name: 'Traverse', complexity: 'O(n)' },
    ],
    advantages: [
      'Cheap local inserts and deletes once you have a node',
      'Grows without relocating an entire contiguous block',
      'Natural fit for some recursive and streaming designs',
    ],
    limitations: [
      'No O(1) random access by index',
      'Extra memory for pointers and poorer cache locality',
      'Bugs around pointer updates are easy to introduce',
    ],
    complexityNote:
      'Traversal and search are O(n). Random access by position is O(n) because you walk links. Local splice operations can be O(1) with a node reference.',
    availability: 'available',
    href: '/learn/singly-linked-list',
    hrefLabel: 'Learn linked lists',
    accent: 'orange',
  },
  {
    id: 'stacks',
    name: 'Stacks',
    description:
      'A last-in, first-out (LIFO) collection: you only add and remove from the top.',
    organization:
      'Elements form a single end-restricted sequence. Internally this is often an array or linked list exposing only push and pop at one end.',
    useCase: 'Undo, recursion simulation, and nested parsing',
    useCases: [
      'Function-call and expression evaluation',
      'Undo/redo and browser back-stack behavior',
      'Depth-first search and balanced-bracket checks',
    ],
    operations: [
      {
        name: 'Push',
        complexity: 'O(1) amortized',
        note: 'Dynamic array append; a single resize can be O(n)',
      },
      { name: 'Pop', complexity: 'O(1)' },
      { name: 'Peek / top', complexity: 'O(1)' },
      { name: 'isEmpty / size', complexity: 'O(1)' },
      {
        name: 'Search',
        complexity: 'O(n)',
        note: 'Not the primary interface; usually discouraged',
      },
    ],
    advantages: [
      'Simple LIFO contract that matches many algorithms',
      'Constant-time push and pop at the top',
      'Easy to implement with an array or linked list',
    ],
    limitations: [
      'No random access to middle elements',
      'Wrong structure when order must be first-in, first-out',
      'Can hide deep recursion costs if misused as a call stack stand-in',
    ],
    complexityNote:
      'Push is amortized O(1) on a dynamic array (an individual resize can take O(n)). Pop, peek, isEmpty, and size are O(1). Searching or indexing into the middle is O(n) and outside the usual stack API.',
    availability: 'available',
    href: '/learn/stack',
    hrefLabel: 'Learn stacks',
    accent: 'pink',
  },
  {
    id: 'queues',
    name: 'Queues',
    description:
      'A first-in, first-out (FIFO) collection: items enter at the back and leave from the front.',
    organization:
      'Elements wait in arrival order. Implementations use circular arrays, linked lists, or deques with front and back ends.',
    useCase: 'Scheduling, buffering, and breadth-first search',
    useCases: [
      'Task and print job scheduling',
      'Breadth-first search (BFS) traversal',
      'Producer–consumer buffers and rate limiting',
    ],
    operations: [
      { name: 'Enqueue', complexity: 'O(1)' },
      { name: 'Dequeue', complexity: 'O(1)' },
      { name: 'Peek / front', complexity: 'O(1)' },
      { name: 'Search', complexity: 'O(n)' },
    ],
    advantages: [
      'Natural FIFO ordering for fair processing',
      'Constant-time enqueue and dequeue with a good implementation',
      'Core building block for BFS and many pipelines',
    ],
    limitations: [
      'No efficient random access',
      'Naive array shifts can degrade dequeue to O(n)',
      'Not suited when newest items must leave first',
    ],
    complexityNote:
      'With a circular buffer or linked list, enqueue and dequeue are typically O(1). Shifting a plain array from the front is O(n)—implementation matters.',
    availability: 'available',
    href: '/learn/queue',
    hrefLabel: 'Learn queues',
    accent: 'pink',
  },
  {
    id: 'circular-queues',
    name: 'Circular Queues',
    description:
      'A fixed-capacity FIFO ring buffer: indices wrap with modulo arithmetic so freed slots are reused without shifting.',
    organization:
      'Elements live in a fixed array. Front and rear advance with (index + 1) % capacity; an explicit size tracks how many slots are live.',
    useCase: 'Bounded buffering with O(1) enqueue and dequeue',
    useCases: [
      'Streaming and I/O ring buffers',
      'Producer–consumer slots with a fixed memory budget',
      'Replacing naive array queues that waste prefix space after dequeue',
    ],
    operations: [
      { name: 'Enqueue', complexity: 'O(1)' },
      { name: 'Dequeue', complexity: 'O(1)' },
      { name: 'Front / rear', complexity: 'O(1)' },
      { name: 'isEmpty / isFull', complexity: 'O(1)' },
    ],
    advantages: [
      'Reuses slots via wraparound instead of shifting the array',
      'Predictable fixed memory footprint',
      'Constant-time enqueue and dequeue with direct indexing',
    ],
    limitations: [
      'Capacity is fixed — enqueue fails when full unless you grow elsewhere',
      'Full/empty logic needs a size counter (or a reserved empty slot)',
      'Not suited when you need unbounded growth or priority order',
    ],
    complexityNote:
      'Enqueue, dequeue, front, rear, isEmpty, and isFull are O(1) on a fixed-capacity circular buffer with direct array indexing.',
    availability: 'available',
    href: '/learn/circular-queue',
    hrefLabel: 'Learn circular queues',
    accent: 'teal',
  },
  {
    id: 'deques',
    name: 'Deques',
    description:
      'A double-ended queue: insert and remove at both the front and the rear in amortized constant time.',
    organization:
      'Elements form a sequence open at both ends. Common implementations use a circular buffer (front + size with modular wrap) or a doubly linked list.',
    useCase: 'Flexible end access for windows, buffers, and dual-ended workflows',
    useCases: [
      'Sliding window and monotonic deque algorithms',
      'Undo/redo and work queues with urgent front inserts',
      'Modeling stacks or queues by restricting which ends you use',
    ],
    operations: [
      {
        name: 'pushFront / pushBack',
        complexity: 'O(1) amortized',
        note: 'A single resize can be O(n); growth stays amortized O(1)',
      },
      { name: 'popFront / popBack', complexity: 'O(1)' },
      { name: 'front / back', complexity: 'O(1)' },
      { name: 'isEmpty / size', complexity: 'O(1)' },
    ],
    advantages: [
      'Both ends support efficient insert and remove',
      'Can simulate stack (one end) or queue (opposite ends)',
      'Circular-buffer layouts keep good locality without Array.shift()',
    ],
    limitations: [
      'Richer API than needed when only LIFO or FIFO is required',
      'Not a substitute for priority queues or middle-index access',
      'Naive shifting arrays make end ops O(n) despite the abstract API',
    ],
    complexityNote:
      'With a circular buffer or doubly linked list, push/pop at either end are O(1) (amortized for dynamic growth). An individual resize can take O(n). Shifting a plain array is O(n).',
    availability: 'available',
    href: '/learn/deque',
    hrefLabel: 'Learn deques',
    accent: 'pink',
  },
  {
    id: 'hash-tables',
    name: 'Hash Tables',
    description:
      'A key–value store that hashes keys into buckets so average lookup, insert, and delete are fast.',
    organization:
      'A hash function maps each key to a bucket index. Collisions are handled with chaining or open addressing.',
    useCase: 'Fast average key-based lookup',
    useCases: [
      'Frequency maps and counting problems',
      'Caches, sets, and dictionaries',
      'Indexing records by ID or string key',
    ],
    operations: [
      {
        name: 'Insert / lookup / delete (average)',
        complexity: 'O(1)',
        note: 'Expected under a good hash and load factor',
      },
      {
        name: 'Insert / lookup / delete (worst)',
        complexity: 'O(n)',
        note: 'Many keys can collide into one bucket',
      },
    ],
    advantages: [
      'Excellent average-case key-based performance',
      'Flexible keys beyond integer indices',
      'Powers sets, maps, and many interview patterns',
    ],
    limitations: [
      'Worst-case can degrade to O(n) with collisions',
      'No inherent ordering of keys',
      'Uses extra memory and depends on a solid hash function',
    ],
    complexityNote:
      'Average operations are typically O(1), but can degrade to O(n) under heavy collisions or a poor hash. Actual performance depends on load factor and collision strategy.',
    availability: 'available',
    href: '/learn/hash-table',
    hrefLabel: 'Learn hash tables',
    accent: 'violet',
  },
  {
    id: 'trees',
    name: 'Trees',
    description:
      'A hierarchical structure of nodes with parent–child links, commonly rooted with no cycles.',
    organization:
      'One root branches into child nodes. Binary trees, BSTs, and tries are specialized shapes of this idea.',
    useCase: 'Hierarchical relationships and ordered search trees',
    useCases: [
      'File systems and UI component trees',
      'Binary search trees for ordered data',
      'Expression trees and hierarchical configs',
    ],
    operations: [
      {
        name: 'Search / insert / delete (balanced BST)',
        complexity: 'O(log n)',
      },
      {
        name: 'Search / insert / delete (skewed tree)',
        complexity: 'O(n)',
      },
      { name: 'Traverse all nodes', complexity: 'O(n)' },
    ],
    advantages: [
      'Models hierarchy naturally',
      'Balanced search trees give logarithmic operations',
      'Supports ordered traversal and range queries',
    ],
    limitations: [
      'Unbalanced trees lose logarithmic guarantees',
      'More complex than arrays for flat data',
      'Pointer-heavy layouts can hurt cache performance',
    ],
    complexityNote:
      'Balanced binary search trees typically offer O(log n) search and update. A skewed tree behaves like a linked list at O(n). Always state balance assumptions. An ordinary BST does not guarantee balance — see AVL trees for self-balancing.',
    availability: 'available',
    href: '/learn/binary-search-tree',
    hrefLabel: 'Learn binary search trees',
    accent: 'teal',
  },
  {
    id: 'avl-trees',
    name: 'AVL Trees',
    description:
      'A self-balancing binary search tree that keeps |balance factor| ≤ 1 at every node using rotations after updates.',
    organization:
      'Same left < node < right ordering as a BST, plus a height on each node. LL/RR/LR/RL rotations restore balance after insert and delete.',
    useCase: 'Ordered maps with guaranteed logarithmic height',
    useCases: [
      'Dictionaries that need sorted iteration and reliable O(log n) updates',
      'Teaching rotations, heights, and balance factors',
      'Workloads where sorted inserts would skew an ordinary BST',
    ],
    operations: [
      { name: 'Search', complexity: 'O(log n)' },
      { name: 'Insert (with rebalancing)', complexity: 'O(log n)' },
      { name: 'Delete (with rebalancing)', complexity: 'O(log n)' },
      { name: 'Find min / max', complexity: 'O(log n)' },
      { name: 'Traverse all nodes', complexity: 'O(n)' },
    ],
    advantages: [
      'Height stays O(log n), so search and update worst cases stay logarithmic',
      'Preserves BST ordering and inorder sorted traversal',
      'Clear rotation cases (LL, RR, LR, RL) for learning and debugging',
    ],
    limitations: [
      'Updates do extra height maintenance and possible rotations',
      'Each node stores height (or equivalent) metadata',
      'More complex than an ordinary BST or a hash table for unordered keys',
    ],
    complexityNote:
      'Search, insert, and delete are O(log n) because AVL height is O(log n). Traversals are O(n). Compared with an ordinary BST, AVL pays rotation work to keep the height guarantee.',
    availability: 'available',
    href: '/learn/avl-tree',
    hrefLabel: 'Learn AVL trees',
    accent: 'teal',
  },
  {
    id: 'heaps',
    name: 'Heaps',
    description:
      'A complete binary tree (usually array-backed) that keeps the highest- or lowest-priority element at the root.',
    organization:
      'Parent–child priority invariants (min-heap or max-heap) with a compact array layout using index arithmetic.',
    useCase: 'Priority-based retrieval',
    useCases: [
      'Backing store for priority queues and scheduling',
      'Heap Sort and selection of top-k items',
      'Dijkstra-style shortest-path frontiers',
    ],
    operations: [
      { name: 'Find min / max (root)', complexity: 'O(1)' },
      { name: 'Insert', complexity: 'O(log n)' },
      { name: 'Extract min / max', complexity: 'O(log n)' },
      {
        name: 'Search arbitrary value',
        complexity: 'O(n)',
        note: 'Heaps are not optimized for arbitrary lookup',
      },
    ],
    advantages: [
      'Fast access to the current extreme priority',
      'Efficient insert and extract-priority',
      'Compact array representation is common',
    ],
    limitations: [
      'Not designed for searching arbitrary keys quickly',
      'Does not keep a full sorted order for free',
      'Only the root priority is O(1) to read',
    ],
    complexityNote:
      'Peeking at the root is O(1). Insert and extract-priority are typically O(log n) for a binary heap. Arbitrary search is O(n). Build-heap is O(n).',
    availability: 'available',
    href: '/learn/heap',
    hrefLabel: 'Learn heaps',
    accent: 'purple',
  },
  {
    id: 'priority-queues',
    name: 'Priority Queues',
    description:
      'An abstract collection that always exposes the next item by priority — not by insertion order — commonly implemented with a binary heap.',
    organization:
      'Logical ADT over a min or max heap of {item, priority} entries. Equal priorities can use FIFO via insertion sequence.',
    useCase: 'Urgency-based scheduling and event ordering',
    useCases: [
      'Operating-system and job schedulers',
      'Emergency triage and network packet prioritization',
      'Event-driven simulation and Dijkstra-style graph frontiers',
    ],
    operations: [
      { name: 'Peek next', complexity: 'O(1)' },
      { name: 'Enqueue (insert)', complexity: 'O(log n)' },
      { name: 'Dequeue (extract)', complexity: 'O(log n)' },
      { name: 'Size / isEmpty', complexity: 'O(1)' },
    ],
    advantages: [
      'Removes the current highest- or lowest-priority item efficiently',
      'Clear ADT separate from the heap implementation details',
      'Supports deterministic FIFO ties for equal priorities',
    ],
    limitations: [
      'Not a substitute for strict FIFO queues when arrival order must win',
      'Arbitrary search by item is still typically O(n) on a plain heap',
      'Specialized heaps may be needed for advanced decrease-key workloads',
    ],
    complexityNote:
      'With a binary heap, peek is O(1) and enqueue/dequeue are O(log n). Space is O(n). Complexity assumes a binary-heap backing store as in the Priority Queue lesson.',
    availability: 'available',
    href: '/learn/priority-queue',
    hrefLabel: 'Learn priority queues',
    accent: 'violet',
  },
  {
    id: 'graphs',
    name: 'Graphs',
    description:
      'A set of vertices connected by edges—directed or undirected, weighted or unweighted—to model relationships.',
    organization:
      'Usually stored as adjacency lists or adjacency matrices. Edges capture “connected to” relationships between entities.',
    useCase: 'Relationships between entities',
    useCases: [
      'Social networks and recommendation graphs',
      'Maps, routing, and dependency graphs',
      'Shortest paths, connectivity, and traversal',
    ],
    operations: [
      {
        name: 'Check edge (adjacency list)',
        complexity: 'O(degree)',
        note: 'Or O(1) average with a hash set of neighbors',
      },
      {
        name: 'Check edge (adjacency matrix)',
        complexity: 'O(1)',
        note: 'Uses O(V²) space',
      },
      { name: 'Traverse (BFS / DFS)', complexity: 'O(V + E)' },
    ],
    advantages: [
      'Expresses arbitrary relationships cleanly',
      'Supports powerful algorithms (paths, cycles, flows)',
      'Flexible density via list vs matrix storage',
    ],
    limitations: [
      'Can be memory-heavy depending on representation',
      'Many problems are computationally hard on general graphs',
      'Harder to reason about than linear structures',
    ],
    complexityNote:
      'Traversal is typically O(V + E) with adjacency lists. Edge queries and space trade off between lists and matrices. State your representation.',
    availability: 'coming-soon',
    accent: 'teal',
  },
  {
    id: 'tries',
    name: 'Tries',
    description:
      'A tree of characters (or path segments) where shared prefixes share a path from the root—ideal for string dictionaries.',
    organization:
      'Each edge represents a character (or chunk). A node marks whether a complete word (or key) ends there.',
    useCase: 'Efficient prefix-based string lookup',
    useCases: [
      'Autocomplete and spell-check dictionaries',
      'IP routing tables and prefix matching',
      'Word games and lexicon search',
    ],
    operations: [
      {
        name: 'Insert / search word',
        complexity: 'O(L)',
        note: 'L is the key length, not the dictionary size',
      },
      {
        name: 'Prefix search',
        complexity: 'O(L)',
        note: 'Then enumerate matches from that node',
      },
    ],
    advantages: [
      'Prefix queries are natural and fast in key length',
      'Shared prefixes save work versus naive string scans',
      'Great foundation for autocomplete UX',
    ],
    limitations: [
      'Can use significant memory for sparse alphabets',
      'Overkill when you only need exact key lookup',
      'Less common as a first teaching structure',
    ],
    complexityNote:
      'Insert and search are typically O(L) in the length of the string, independent of how many other keys exist—assuming Map or fixed-alphabet child lookup. Listing all words costs work proportional to nodes traversed. Child representation and alphabet size affect constants.',
    availability: 'available',
    href: '/learn/trie',
    hrefLabel: 'Learn tries',
    accent: 'blue',
  },
]

export const structureScenarios: StructureScenario[] = [
  {
    id: 'indexed-access',
    need: 'Need fast indexed access',
    structureId: 'arrays',
    structureName: 'Array',
    rationale:
      'An index maps directly to a slot, so random access is typically constant time.',
  },
  {
    id: 'local-splice',
    need: 'Need frequent insertion or deletion around known linked nodes',
    structureId: 'linked-lists',
    structureName: 'Linked List',
    rationale:
      'With a node reference, local pointer updates avoid shifting a whole contiguous block.',
  },
  {
    id: 'lifo',
    need: 'Need last-in, first-out behavior',
    structureId: 'stacks',
    structureName: 'Stack',
    rationale:
      'Push and pop at one end match undo stacks, nesting, and depth-first patterns.',
  },
  {
    id: 'fifo',
    need: 'Need first-in, first-out behavior',
    structureId: 'queues',
    structureName: 'Queue',
    rationale:
      'Enqueue at the back and dequeue from the front preserve arrival order for scheduling and BFS.',
  },
  {
    id: 'bounded-fifo',
    need: 'Need FIFO with a fixed memory budget and slot reuse',
    structureId: 'circular-queues',
    structureName: 'Circular Queue',
    rationale:
      'A ring buffer wraps indices with modulo arithmetic so dequeued slots can be reused without shifting.',
  },
  {
    id: 'both-ends',
    need: 'Need to insert or remove efficiently at both ends',
    structureId: 'deques',
    structureName: 'Deque',
    rationale:
      'A double-ended queue supports push/pop at front and rear — useful for sliding windows and flexible buffers.',
  },
  {
    id: 'key-lookup',
    need: 'Need fast average key-based lookup',
    structureId: 'hash-tables',
    structureName: 'Hash Table',
    rationale:
      'Hashing maps keys to buckets so average insert and lookup stay near constant time.',
  },
  {
    id: 'hierarchy',
    need: 'Need hierarchical relationships',
    structureId: 'trees',
    structureName: 'Tree',
    rationale:
      'Parent–child links model nested data such as file systems and org charts.',
  },
  {
    id: 'balanced-ordered',
    need: 'Need ordered data with guaranteed logarithmic height',
    structureId: 'avl-trees',
    structureName: 'AVL Tree',
    rationale:
      'AVL rotations keep |balance factor| ≤ 1 so search and updates stay O(log n) even for adversarial insert orders.',
  },
  {
    id: 'priority',
    need: 'Need priority-based retrieval',
    structureId: 'priority-queues',
    structureName: 'Priority Queue',
    rationale:
      'A priority queue removes the next item by urgency; a heap is the usual O(log n) implementation.',
  },
  {
    id: 'relationships',
    need: 'Need to represent relationships between entities',
    structureId: 'graphs',
    structureName: 'Graph',
    rationale:
      'Vertices and edges capture arbitrary connections beyond a single hierarchy.',
  },
  {
    id: 'prefix',
    need: 'Need efficient prefix-based string lookup',
    structureId: 'tries',
    structureName: 'Trie',
    rationale:
      'Shared prefix paths make autocomplete-style queries proportional to key length.',
  },
]

export const dataStructureLearningPath: DataStructureLearningStep[] = [
  {
    id: 'fundamentals',
    title: 'Data Structure Fundamentals',
    description:
      'Learn what data structures are, how they differ from algorithms, and how organization affects efficiency.',
    availability: 'available',
    href: '/data-structures#what-is',
  },
  {
    id: 'arrays-memory',
    title: 'Arrays and Memory Concepts',
    description:
      'Understand contiguous storage, indexing, and the array/string patterns used in real problems.',
    availability: 'available',
    href: '/algorithms/array-string',
  },
  {
    id: 'linked-lists',
    title: 'Linked Lists',
    description:
      'Walk node-based linking, traversal, and when pointer updates beat array shifts.',
    availability: 'available',
    href: '/learn/singly-linked-list',
  },
  {
    id: 'stacks-queues',
    title: 'Stacks and Queues',
    description:
      'Practice LIFO stacks, FIFO queues, circular ring buffers, and double-ended deques for undo, scheduling, and flexible end access.',
    availability: 'available',
    href: '/learn/stack',
  },
  {
    id: 'hash-tables',
    title: 'Hash Tables',
    description:
      'Learn key–value hashing, collisions, separate chaining, and load factor—then apply maps in frequency and anagram lessons.',
    availability: 'available',
    href: '/learn/hash-table',
  },
  {
    id: 'trees-heaps',
    title: 'Trees, Heaps, and Priority Queues',
    description:
      'Start with Binary Search Tree, continue to AVL, then Heap mechanics, and finish with the Priority Queue ADT (optionally Heap Sort for sorting).',
    availability: 'available',
    href: '/learn/binary-search-tree',
  },
  {
    id: 'graphs',
    title: 'Graphs',
    description:
      'Model relationships with vertices and edges, then traverse with BFS and DFS.',
    availability: 'coming-soon',
  },
  {
    id: 'specialized',
    title: 'Specialized Structures such as Tries',
    description:
      'Explore prefix trees for autocomplete-style string dictionaries once the core structures click.',
    availability: 'available',
    href: '/learn/trie',
  },
]

/** Routes that are placeholders without real learning content—never treat as available. */
export const PLACEHOLDER_DATA_STRUCTURE_ROUTES = [
  '/data-structures/linked-list',
  '/algorithms/tree-graph',
] as const

export function getDataStructureById(
  id: DataStructureId,
): DataStructure | undefined {
  return dataStructures.find((structure) => structure.id === id)
}

export function getAvailableDataStructures(): DataStructure[] {
  return dataStructures.filter(
    (structure) => structure.availability === 'available',
  )
}

export function getComingSoonDataStructures(): DataStructure[] {
  return dataStructures.filter(
    (structure) => structure.availability === 'coming-soon',
  )
}

export function getAvailableLearningSteps(): DataStructureLearningStep[] {
  return dataStructureLearningPath.filter(
    (step) => step.availability === 'available' && Boolean(step.href),
  )
}

/** First concrete learning destination for the hub primary CTA. */
export function getDataStructuresStartHref(): string {
  const arraysStep = dataStructureLearningPath.find(
    (step) => step.id === 'arrays-memory' && step.href,
  )
  return arraysStep?.href ?? '/algorithms/array-string'
}
