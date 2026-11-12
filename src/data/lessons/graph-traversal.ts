import type { Lesson } from './types'

export const graphTraversal: Lesson = {
  slug: 'graph-traversal',
  title: 'Graph Traversal: BFS & DFS',
  description:
    'Learn breadth-first and depth-first graph traversal: queues vs stacks, visited sets, cycles, disconnected graphs, complexity, applications, and interactive visualizations.',
  category: 'Data Structures',
  difficulty: 'Intermediate',
  estimatedTime: '50 min',
  tags: [
    'Data Structures',
    'Graph',
    'BFS',
    'DFS',
    'Traversal',
    'Queue',
    'Stack',
    'Intermediate',
  ],

  objectives: [
    'Explain what graph traversal is and why visited tracking matters.',
    'Describe how BFS explores level by level with a FIFO queue.',
    'Describe how DFS explores deeply with a stack (or recursion) and backtracks.',
    'Compare queue vs stack exploration strategies on the same graph.',
    'Handle cycles and disconnected graphs with an explicit traversal mode.',
    'State O(V + E) time and O(V) space for adjacency-list BFS and DFS.',
    'Name practical uses of BFS and DFS without implementing shortest-path or cycle-detection algorithms yet.',
  ],

  overview: [
    'Graph traversal systematically visits vertices by following edges. The two classic strategies are Breadth-First Search (BFS) and Depth-First Search (DFS).',
    'BFS expands neighbors level by level using a FIFO queue — great intuition for “closeness” in an unweighted graph. DFS plunges down one path as far as possible, then backtracks — natural for mazes, dependency walks, and recursive exploration.',
    'Both algorithms need a visited set (or equivalent) so cycles do not loop forever. Neighbor order is deterministic in this lesson: adjacency lists are sorted by neighbor id, so the same graph and start always produce the same traversal order.',
    'The playground below lets you run BFS, DFS, or a side-by-side comparison on the same graph and starting vertex. Switch graphs, change the start, and step forward/backward through queue and stack states.',
  ],

  whyItMatters: [
    'Almost every graph algorithm begins with “walk the graph carefully” — BFS and DFS are that foundation.',
    'Choosing BFS vs DFS changes which vertices you see first and which problems feel natural.',
    'Understanding visited sets and backtracking prevents infinite loops on cyclic graphs.',
    'Queues (FIFO) and stacks (LIFO) from earlier lessons reappear here as the engines of exploration.',
  ],

  visualization: {
    title: 'BFS, DFS, and side-by-side comparison',
    description:
      'Select a start vertex, step through BFS (queue) or DFS (stack + path), then compare both on the same graph. Neighbors are explored in sorted id order for deterministic results.',
    type: 'graph-traversal',
  },

  steps: [
    {
      title: 'What is Graph Traversal?',
      description:
        'Traversal means visiting vertices by walking along edges according to a rule. Unlike a single path query, a traversal aims to explore a component (or the whole graph) systematically.',
    },
    {
      title: 'Why Do We Need Traversal?',
      description:
        'Networks are not arrays you can scan by index. To answer “what is reachable?”, “what is nearby?”, or “is there any path?”, you must follow edges from a start — that walk is a traversal.',
    },
    {
      title: 'Breadth-First Search (BFS)',
      description:
        'BFS explores neighbors level by level. From the start, visit all distance-1 neighbors before distance-2, and so on. Implement it with a FIFO queue: dequeue the front, enqueue undiscovered neighbors at the rear.',
    },
    {
      title: 'Depth-First Search (DFS)',
      description:
        'DFS explores one path as deeply as possible before backtracking. Recursion uses the call stack; an explicit stack shows the same idea. When a vertex has no unvisited neighbors, pop and return to the previous vertex.',
    },
    {
      title: 'Queue vs. Stack',
      description:
        'BFS = queue (FIFO): the oldest discovered vertex is explored next → wide, level-order growth. DFS = stack (LIFO): the newest choice is explored next → deep paths and clear backtracking.',
    },
    {
      title: 'Visited Nodes',
      description:
        'Mark vertices when you first discover them (common in BFS) or when you visit them (common framing in DFS). Never process the same vertex twice. Without a visited set, a cycle like A—B—A loops forever.',
    },
    {
      title: 'Traversal Order',
      description:
        'Order depends on the start and on neighbor ordering. This project sorts neighbors by id, so Alice’s neighbors Bob then Carol always enqueue/push in that order. Different libraries may store neighbors differently — always document the rule.',
    },
    {
      title: 'Handling Cycles',
      description:
        'When you see an edge to an already visited vertex, skip it. That edge may close a cycle, but traversal does not need to “solve” cycle detection here — skipping visited vertices is enough to finish safely.',
    },
    {
      title: 'Disconnected Graphs',
      description:
        'From one start, only the reachable component is visited. To cover every vertex, resume from the next unvisited vertex in insertion order (all-components mode in the playground). Directed graphs may leave vertices unreachable even when undirected connectivity looks fine.',
    },
    {
      title: 'Time and Space Complexity',
      description:
        'With an adjacency list, each vertex and each edge is examined a constant number of times: time O(V + E). The queue or stack (and visited set) hold at most O(V) vertices: space O(V).',
    },
    {
      title: 'Practical Applications',
      description:
        'BFS ideas: shortest path in unweighted graphs, social “degrees of connection”, level-order walks, web-crawling frontiers. DFS ideas: maze exploration, connected components, dependency walks, path existence. Full shortest-path and cycle-detection lessons come later.',
    },
  ],

  thinkingGuide: {
    title: 'How to think about a traversal',
    description:
      'Before coding, pin down start, directed vs undirected, and whether you need one component or all vertices.',
    steps: [
      'Pick the start vertex and confirm it exists.',
      'Choose BFS (levels / queue) or DFS (deep path / stack).',
      'Decide reachable-only vs all-components for disconnected graphs.',
      'Initialize visited (and queue or stack) from the start.',
      'While the structure is non-empty: take next vertex, scan neighbors in a fixed order, discover new ones, skip visited ones.',
      'Read the final visit order — it should be reproducible given the neighbor rule.',
    ],
  },

  complexity: {
    time: {
      best: 'O(V + E)',
      average: 'O(V + E)',
      worst: 'O(V + E)',
    },
    space: 'O(V)',
    notes: {
      time: [
        'Adjacency-list BFS and DFS examine each vertex and each edge a constant number of times.',
        'On a dense graph E can be Θ(V²), so O(V + E) is still tight.',
      ],
      space: [
        'Visited set is O(V). The queue (BFS) or recursion/stack (DFS) is also O(V) in the worst case.',
        'Adjacency-matrix scans can cost O(V²) time even when E is smaller — this lesson assumes lists.',
      ],
    },
  },

  commonMistakes: {
    description:
      'These pitfalls show up constantly when learners first implement BFS and DFS.',
    mistakes: [
      {
        title: 'Forgetting the visited set',
        explanation:
          'On any graph with a cycle, missing visited tracking causes an infinite loop. Mark discovery/visit before re-enqueueing or re-pushing.',
      },
      {
        title: 'Using the wrong structure',
        explanation:
          'A stack for “BFS” or a queue for “DFS” quietly changes the algorithm. Match FIFO to BFS and LIFO to DFS.',
      },
      {
        title: 'Assuming a unique traversal order',
        explanation:
          'Order depends on neighbor ordering. Always document how neighbors are stored or sorted — this lesson sorts by id.',
      },
      {
        title: 'Expecting one start to cover a disconnected graph',
        explanation:
          'Reachable mode only visits one component. Use an outer loop (all-components) when you need every vertex.',
      },
      {
        title: 'Confusing BFS levels with weighted shortest paths',
        explanation:
          'BFS layers are hop counts. Weighted shortest paths need different algorithms (later lessons).',
      },
    ],
  },

  algorithmConnection: {
    title: 'How BFS and DFS connect to the rest of the path',
    eyebrow: 'GRAPH ALGORITHMS',
    description:
      'Traversal is the gateway to later graph topics. This lesson stops at walking the graph.',
    items: [
      {
        title: 'Built on Graph + Queue + Stack',
        description:
          'Use the Graph data structure lesson for representations. Queue powers BFS; Stack (or the call stack) powers DFS.',
      },
      {
        title: 'BFS → unweighted shortest path (later)',
        description:
          'Parent pointers on a BFS tree recover a minimum-hop path. Not implemented here — reserved for a dedicated lesson.',
      },
      {
        title: 'DFS → cycles & components (later)',
        description:
          'Coloring / timestamps during DFS detect cycles and help label components. Concepts only in this step.',
      },
      {
        title: 'Same graph, different order',
        description:
          'Compare mode in the visualizer keeps one graph and start so you can see queue vs stack strategies side by side.',
      },
    ],
  },

  pseudocode: `BFS(graph, start, mode = reachable):
  visited ← empty set
  order ← empty list

  EXPLORE(seed):
    queue ← empty queue
    enqueue seed; mark seed visited
    while queue not empty:
      u ← dequeue
      append u to order
      for each neighbor v of u in sorted(neighbor ids):
        if v not visited:
          mark v visited
          enqueue v

  EXPLORE(start)
  if mode = all-components:
    for each vertex u in insertion order:
      if u not visited: EXPLORE(u)
  return order

DFS(graph, start, mode = reachable):
  visited ← empty set
  order ← empty list

  VISIT(u):
    mark u visited
    append u to order
    for each neighbor v of u in sorted(neighbor ids):
      if v not visited:
        VISIT(v)          // push call frame / stack

  VISIT(start)
  if mode = all-components:
    for each vertex u in insertion order:
      if u not visited: VISIT(u)
  return order`,

  code: {
    python: `from collections import deque

def bfs(graph, start, mode="reachable"):
    """graph.neighbors(u) yields neighbors in sorted id order."""
    visited = set()
    order = []

    def explore(seed):
        queue = deque([seed])
        visited.add(seed)
        while queue:
            u = queue.popleft()
            order.append(u)
            for v in graph.neighbors(u):
                if v not in visited:
                    visited.add(v)
                    queue.append(v)

    explore(start)
    if mode == "all-components":
        for u in graph.vertices():
            if u not in visited:
                explore(u)
    return order


def dfs(graph, start, mode="reachable"):
    visited = set()
    order = []

    def visit(u):
        visited.add(u)
        order.append(u)
        for v in graph.neighbors(u):
            if v not in visited:
                visit(v)

    visit(start)
    if mode == "all-components":
        for u in graph.vertices():
            if u not in visited:
                visit(u)
    return order
`,
    javascript: `function bfs(graph, start, mode = 'reachable') {
  const visited = new Set()
  const order = []

  function explore(seed) {
    const queue = [seed]
    visited.add(seed)
    while (queue.length > 0) {
      const u = queue.shift()
      order.push(u)
      for (const v of graph.neighbors(u)) {
        if (!visited.has(v)) {
          visited.add(v)
          queue.push(v)
        }
      }
    }
  }

  explore(start)
  if (mode === 'all-components') {
    for (const u of graph.vertices()) {
      if (!visited.has(u)) explore(u)
    }
  }
  return order
}

function dfs(graph, start, mode = 'reachable') {
  const visited = new Set()
  const order = []

  function visit(u) {
    visited.add(u)
    order.push(u)
    for (const v of graph.neighbors(u)) {
      if (!visited.has(v)) visit(v)
    }
  }

  visit(start)
  if (mode === 'all-components') {
    for (const u of graph.vertices()) {
      if (!visited.has(u)) visit(u)
    }
  }
  return order
}
`,
    typescript: `type Mode = 'reachable' | 'all-components'

/** graph.neighbors(u) and graph.vertices() mirror the lesson Graph API. */
function breadthFirstSearch(
  graph: { neighbors(u: string): string[]; vertices(): string[] },
  start: string,
  mode: Mode = 'reachable',
): string[] {
  const visited = new Set<string>()
  const order: string[] = []

  const explore = (seed: string) => {
    const queue: string[] = [seed]
    visited.add(seed)
    while (queue.length > 0) {
      const u = queue.shift()!
      order.push(u)
      for (const v of graph.neighbors(u)) {
        if (visited.has(v)) continue
        visited.add(v)
        queue.push(v)
      }
    }
  }

  explore(start)
  if (mode === 'all-components') {
    for (const u of graph.vertices()) {
      if (!visited.has(u)) explore(u)
    }
  }
  return order
}

function depthFirstSearch(
  graph: { neighbors(u: string): string[]; vertices(): string[] },
  start: string,
  mode: Mode = 'reachable',
): string[] {
  const visited = new Set<string>()
  const order: string[] = []

  const visit = (u: string) => {
    visited.add(u)
    order.push(u)
    for (const v of graph.neighbors(u)) {
      if (!visited.has(v)) visit(v)
    }
  }

  visit(start)
  if (mode === 'all-components') {
    for (const u of graph.vertices()) {
      if (!visited.has(u)) visit(u)
    }
  }
  return order
}
`,
  },

  whenToUse: [
    'You need to explore connectivity from a start vertex.',
    'You want level-order / hop-distance intuition → prefer BFS.',
    'You want deep exploration, backtracking, or recursive structure → prefer DFS.',
    'You are preparing for later path, cycle, or component algorithms on the same graph model.',
  ],

  whenNotToUse: [
    'You need weighted shortest paths — use a dedicated shortest-path algorithm later, not bare BFS layers.',
    'You only need local neighbor checks — traversal of the whole component may be unnecessary.',
    'The data is a strict tree and you already have a tree-specific walk (inorder, etc.) that fits better.',
  ],

  keyTakeaways: [
    'BFS = queue + level by level; DFS = stack/recursion + deep then backtrack.',
    'Always track visited vertices to handle cycles safely.',
    'Traversal order is deterministic only when neighbor order is fixed — this lesson sorts by id.',
    'Reachable mode vs all-components mode controls disconnected graphs explicitly.',
    'Both BFS and DFS are O(V + E) time and O(V) space on adjacency lists.',
    'Applications differ: BFS for unweighted closeness/levels; DFS for mazes, dependencies, and path existence concepts.',
  ],

  previousLesson: {
    title: 'Graph Data Structure',
    href: '/learn/graph',
  },

  nextLesson: {
    title: 'Trie (Prefix Tree)',
    href: '/learn/trie',
  },

  categoryHref: '/data-structures',
}
