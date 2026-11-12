import type { Lesson } from './types'

export const graph: Lesson = {
  slug: 'graph',
  title: 'Graph Data Structure',
  description:
    'Learn graphs: vertices, edges, directed and undirected graphs, weighted edges, connectivity, representations (list, matrix, edge list), complexity trade-offs, and an interactive editor.',
  category: 'Data Structures',
  difficulty: 'Intermediate',
  estimatedTime: '45 min',
  tags: [
    'Data Structures',
    'Graph',
    'Vertices',
    'Edges',
    'Adjacency List',
    'Adjacency Matrix',
    'Intermediate',
  ],

  objectives: [
    'Define a graph as a set of vertices connected by edges.',
    'Distinguish directed vs undirected and weighted vs unweighted graphs.',
    'Explain connectivity, cycles, degree, and paths at a conceptual level.',
    'Compare adjacency list, adjacency matrix, and edge list representations.',
    'State typical space and query trade-offs between list and matrix storage.',
    'Recognize real uses: social networks, roads, computer networks, flights, and web links.',
  ],

  overview: [
    'A graph models relationships: entities are vertices (nodes), and connections are edges. Unlike trees, graphs may have cycles, multiple parents, and disconnected pieces.',
    'Edges can be one-way (directed) or two-way (undirected), and may carry a weight such as distance, cost, or latency. Many algorithms later — BFS, DFS, shortest paths — operate on this same structure.',
    'How you store the graph matters. An adjacency list is usually compact for sparse graphs; an adjacency matrix makes “is there an edge?” fast but uses O(V²) space. An edge list is a simple list of pairs (and optional weights).',
    'This lesson’s playground lets you add and remove vertices and edges, switch modes, drag nodes, load sample networks, and watch all three representations stay in sync. Traversal algorithms (BFS/DFS) are upcoming topics — they are referenced here but not implemented yet.',
  ],

  whyItMatters: [
    'Almost every networked system — friends, roads, packets, flights, hyperlinks — is naturally a graph.',
    'Choosing list vs matrix storage changes memory use and how fast you can check or scan edges.',
    'Clear vocabulary (degree, path, cycle, directed edge) makes later graph algorithms much easier to learn.',
    'Interactive editing builds intuition before you write BFS, DFS, or shortest-path code.',
  ],

  visualization: {
    title: 'Interactive graph editor',
    description:
      'Add and remove vertices and edges, switch directed/undirected and weighted/unweighted modes, drag nodes, load sample networks, and inspect synchronized adjacency list, matrix, and edge list views.',
    type: 'graph',
  },

  steps: [
    {
      title: 'What is a Graph?',
      description:
        'A graph G = (V, E) is a set of vertices V and a set of edges E connecting pairs of vertices. It models “who is related to whom” without forcing a single hierarchy like a tree.',
    },
    {
      title: 'Vertices (Nodes)',
      description:
        'Vertices are the entities: people, cities, devices, pages, airports. This lesson uses string ids (Alice, SGN, Home) so labels stay readable.',
    },
    {
      title: 'Edges (Connections)',
      description:
        'An edge links two vertices. In an undirected graph A—B means the same as B—A. In a directed graph A→B is one-way unless B→A also exists.',
    },
    {
      title: 'Directed Graphs',
      description:
        'Directed edges have orientation: website links, one-way streets, flight routes, task dependencies. Out-neighbors of A are vertices reachable by edges leaving A.',
    },
    {
      title: 'Undirected Graphs',
      description:
        'Undirected edges are symmetric: friendships, two-way roads, cable links. Storing A—B usually updates both adjacency lists.',
    },
    {
      title: 'Weighted Graphs',
      description:
        'A weight annotates an edge with a numeric cost — distance, time, capacity, or price. Flight hours and road lengths are classic examples.',
    },
    {
      title: 'Unweighted Graphs',
      description:
        'Unweighted graphs treat every edge equally (internally you can store weight 1). Social “friend” links and simple connectivity questions often start here.',
    },
    {
      title: 'Connected and Disconnected Graphs',
      description:
        'In an undirected graph, connected means every vertex can reach every other via some path. Disconnected graphs have isolated components — useful for islands of a network.',
    },
    {
      title: 'Cycles and Acyclic Graphs',
      description:
        'A cycle returns to a starting vertex without reusing edges (definitions vary slightly for directed graphs). DAGs (directed acyclic graphs) appear in build systems and course prerequisites. Trees are connected acyclic undirected graphs.',
    },
    {
      title: 'Degree of a Vertex',
      description:
        'Degree counts incident edges. Undirected degree counts neighbors (self-loops usually +2). Directed graphs separate in-degree and out-degree.',
    },
    {
      title: 'Path and Connectivity',
      description:
        'A path is a sequence of vertices joined by edges. Connectivity asks whether a path exists between two vertices — the foundation of BFS/DFS reachability later.',
    },
    {
      title: 'Graph Representations',
      description:
        'Adjacency list: each vertex stores its neighbors. Adjacency matrix: a V×V table of edge presence/weights. Edge list: an explicit list of (from, to[, weight]) pairs. Use the playground to compare them on the same graph.',
    },
    {
      title: 'Graph Complexity',
      description:
        'Typical adjacency-list space is O(V + E); matrix space is O(V²). Edge checks are O(degree) in a plain list vs O(1) in a matrix. Neighbor iteration is O(degree) for lists vs O(V) to scan a matrix row. Exact costs depend on implementation details (arrays vs hash sets of neighbors).',
    },
    {
      title: 'Real-world Applications',
      description:
        'Social networks, road maps, computer networks, flight routes, and website link graphs. Later lessons will use BFS/DFS (and eventually shortest paths) on these same structures.',
    },
  ],

  thinkingGuide: {
    title: 'Think in “vertices + edges + representation”',
    description:
      'Before coding a graph problem, pin down the model and the storage choice.',
    steps: [
      'Name the vertices and what an edge means in the domain (friendship, road, link, flight).',
      'Decide directed vs undirected and whether weights matter.',
      'Estimate density: sparse graphs usually prefer adjacency lists; dense graphs may prefer a matrix.',
      'State whether self-loops or parallel edges are allowed — and handle them consistently.',
      'Plan integrity: removing a vertex must remove its incident edges.',
    ],
  },

  complexity: {
    time: {
      best: 'O(1) edge check (matrix)',
      average: 'O(degree) neighbors (list)',
      worst: 'O(V + E) full scan',
    },
    space: 'O(V + E) list · O(V²) matrix',
    notes: {
      time: [
        'Adjacency list: check edge by scanning (or hashing) neighbors — typically O(degree); iterate neighbors in O(degree).',
        'Adjacency matrix: check edge in O(1); iterating neighbors scans a whole row — O(V).',
        'Adding a vertex is cheap for lists; matrices may need expansion to (V+1)².',
        'These are typical complexities and vary with neighbor storage (array, linked list, hash set) and language details.',
      ],
      space: [
        'Adjacency list stores roughly one entry per directed endpoint — O(V + E) for sparse graphs.',
        'Adjacency matrix always reserves O(V²) cells, even when few edges exist.',
        'Edge lists are O(E) to store but slower for “neighbors of v?” queries unless you also keep an index.',
      ],
    },
  },

  commonMistakes: {
    description:
      'These mistakes show up often when learners first implement graphs.',
    mistakes: [
      {
        title: 'Forgetting the reverse edge in undirected graphs',
        explanation:
          'If A—B is undirected, both adjacency[A] and adjacency[B] need the neighbor (unless you store each undirected edge once with a careful lookup convention).',
      },
      {
        title: 'Leaving dangling edges after deleting a vertex',
        explanation:
          'Removing B must delete A→B and C→B (and B’s outgoing list). Orphan references break traversal and matrix indexing.',
      },
      {
        title: 'Confusing directed A→B with undirected A—B',
        explanation:
          'Website links and flights are often one-way. Treating them as undirected invents fake reverse routes.',
      },
      {
        title: 'Assuming matrix space is always fine',
        explanation:
          'For large sparse graphs, O(V²) memory dominates. Prefer lists unless you need constant-time edge tests and V is modest.',
      },
      {
        title: 'Skipping a consistent duplicate-edge / self-loop policy',
        explanation:
          'Decide up front: update weight on duplicate, ignore duplicates, allow or forbid self-loops — then stick to it in add/remove.',
      },
    ],
  },

  algorithmConnection: {
    title: 'Adjacency List vs Matrix vs Edge List',
    eyebrow: 'REPRESENTATIONS',
    description:
      'Same graph, different storage — pick based on density and the queries you need.',
    items: [
      {
        title: 'Adjacency list — space O(V + E)',
        description:
          'Each vertex stores its neighbors. Great for sparse graphs and scanning neighbors in O(degree). Edge check is O(degree) unless neighbors are hashed.',
      },
      {
        title: 'Adjacency matrix — space O(V²)',
        description:
          'Cell (i, j) stores presence or weight. Edge check is O(1). Iterating neighbors costs O(V). Adding/removing vertices may resize the whole table.',
      },
      {
        title: 'Edge list — space O(E)',
        description:
          'A list of pairs (from, to[, weight]). Simple to dump or serialize; awkward for “all neighbors of v” unless you also build an index.',
      },
      {
        title: 'Upcoming: BFS and DFS',
        description:
          'Breadth-first and depth-first traversal walk these representations to explore connectivity and paths. They are next on the graphs path — not implemented in this lesson.',
      },
    ],
  },

  pseudocode: `Graph:
  directed: boolean
  weighted: boolean
  vertices: ordered list of ids
  adj: map id → list of {to, weight}

ADD_VERTEX(v):
  if v empty: reject
  if v already present: no-op
  vertices.append(v)
  adj[v] ← []

ADD_EDGE(u, v, w?):
  if u or v missing: reject
  weight ← w if weighted else 1
  upsert neighbor v under adj[u]
  if not directed and u ≠ v:
    upsert neighbor u under adj[v]

REMOVE_VERTEX(v):
  delete adj[v]
  for each u in vertices:
    remove neighbor v from adj[u]
  remove v from vertices

REMOVE_EDGE(u, v):
  remove neighbor v from adj[u]
  if not directed and u ≠ v:
    remove neighbor u from adj[v]

GET_ADJACENCY_LIST():
  return adj

GET_ADJACENCY_MATRIX():
  order ← vertices
  matrix[i][j] ← weight of order[i]→order[j] or null

GET_EDGE_LIST():
  if directed: emit every u→v
  else: emit each undirected edge once`,

  code: {
    python: `from __future__ import annotations


class Graph:
    """Educational graph with string vertex ids."""

    def __init__(self, *, directed: bool = False, weighted: bool = False) -> None:
        self.directed = directed
        self.weighted = weighted
        self._vertices: list[str] = []
        self._adj: dict[str, list[tuple[str, float]]] = {}

    def add_vertex(self, vertex: str) -> bool:
        v = vertex.strip()
        if not v or v in self._adj:
            return False
        self._vertices.append(v)
        self._adj[v] = []
        return True

    def remove_vertex(self, vertex: str) -> bool:
        v = vertex.strip()
        if v not in self._adj:
            return False
        del self._adj[v]
        self._vertices = [x for x in self._vertices if x != v]
        for u in self._vertices:
            self._adj[u] = [(t, w) for (t, w) in self._adj[u] if t != v]
        return True

    def add_edge(self, frm: str, to: str, weight: float | None = None) -> bool:
        u, v = frm.strip(), to.strip()
        if u not in self._adj or v not in self._adj:
            return False
        w = 1.0 if not self.weighted or weight is None else float(weight)
        self._upsert(u, v, w)
        if not self.directed and u != v:
            self._upsert(v, u, w)
        return True

    def remove_edge(self, frm: str, to: str) -> bool:
        u, v = frm.strip(), to.strip()
        if u not in self._adj or v not in self._adj:
            return False
        before = len(self._adj[u])
        self._adj[u] = [(t, w) for (t, w) in self._adj[u] if t != v]
        changed = len(self._adj[u]) != before
        if not self.directed and u != v:
            before_b = len(self._adj[v])
            self._adj[v] = [(t, w) for (t, w) in self._adj[v] if t != u]
            changed = changed or len(self._adj[v]) != before_b
        return changed

    def has_vertex(self, vertex: str) -> bool:
        return vertex.strip() in self._adj

    def has_edge(self, frm: str, to: str) -> bool:
        u, v = frm.strip(), to.strip()
        return any(t == v for (t, _) in self._adj.get(u, []))

    def get_neighbors(self, vertex: str) -> list[tuple[str, float]]:
        return list(self._adj.get(vertex.strip(), []))

    def get_vertices(self) -> list[str]:
        return list(self._vertices)

    def get_edges(self) -> list[tuple[str, str, float]]:
        edges: list[tuple[str, str, float]] = []
        seen: set[str] = set()
        index = {v: i for i, v in enumerate(self._vertices)}
        for u in self._vertices:
            for v, w in self._adj[u]:
                if self.directed or u == v:
                    edges.append((u, v, w))
                else:
                    lo, hi = (u, v) if index[u] < index[v] else (v, u)
                    key = f"{lo}|{hi}"
                    if key in seen:
                        continue
                    seen.add(key)
                    edges.append((lo, hi, w))
        return edges

    def get_adjacency_list(self) -> dict[str, list[tuple[str, float]]]:
        return {v: list(self._adj[v]) for v in self._vertices}

    def get_adjacency_matrix(self) -> list[list[float | None]]:
        n = len(self._vertices)
        idx = {v: i for i, v in enumerate(self._vertices)}
        matrix: list[list[float | None]] = [[None] * n for _ in range(n)]
        for u in self._vertices:
            for v, w in self._adj[u]:
                matrix[idx[u]][idx[v]] = w
        return matrix

    def size(self) -> int:
        return len(self._vertices)

    def clear(self) -> None:
        self._vertices.clear()
        self._adj.clear()

    def _upsert(self, u: str, v: str, w: float) -> None:
        for i, (t, _) in enumerate(self._adj[u]):
            if t == v:
                self._adj[u][i] = (v, w)
                return
        self._adj[u].append((v, w))


g = Graph(directed=False, weighted=False)
for person in ["Alice", "Bob", "Carol"]:
    g.add_vertex(person)
g.add_edge("Alice", "Bob")
g.add_edge("Bob", "Carol")
print(g.get_adjacency_list())
print(g.get_edges())
`,
    javascript: `class Graph {
  constructor({ directed = false, weighted = false } = {}) {
    this.directed = directed
    this.weighted = weighted
    this.vertices = []
    this.adj = new Map()
  }

  addVertex(vertex) {
    const v = String(vertex).trim()
    if (!v || this.adj.has(v)) return false
    this.vertices.push(v)
    this.adj.set(v, [])
    return true
  }

  removeVertex(vertex) {
    const v = String(vertex).trim()
    if (!this.adj.has(v)) return false
    this.adj.delete(v)
    this.vertices = this.vertices.filter((x) => x !== v)
    for (const u of this.vertices) {
      this.adj.set(
        u,
        this.adj.get(u).filter((n) => n.to !== v),
      )
    }
    return true
  }

  addEdge(from, to, weight) {
    const u = String(from).trim()
    const v = String(to).trim()
    if (!this.adj.has(u) || !this.adj.has(v)) return false
    const w =
      !this.weighted || weight === undefined || weight === null
        ? 1
        : Number(weight)
    if (!Number.isFinite(w)) return false
    this.#upsert(u, v, w)
    if (!this.directed && u !== v) this.#upsert(v, u, w)
    return true
  }

  removeEdge(from, to) {
    const u = String(from).trim()
    const v = String(to).trim()
    if (!this.adj.has(u) || !this.adj.has(v)) return false
    const before = this.adj.get(u).length
    this.adj.set(
      u,
      this.adj.get(u).filter((n) => n.to !== v),
    )
    let changed = this.adj.get(u).length !== before
    if (!this.directed && u !== v) {
      const beforeB = this.adj.get(v).length
      this.adj.set(
        v,
        this.adj.get(v).filter((n) => n.to !== u),
      )
      changed = changed || this.adj.get(v).length !== beforeB
    }
    return changed
  }

  hasVertex(vertex) {
    return this.adj.has(String(vertex).trim())
  }

  hasEdge(from, to) {
    const u = String(from).trim()
    const v = String(to).trim()
    return (this.adj.get(u) ?? []).some((n) => n.to === v)
  }

  getNeighbors(vertex) {
    return [...(this.adj.get(String(vertex).trim()) ?? [])]
  }

  getVertices() {
    return [...this.vertices]
  }

  getEdges() {
    const edges = []
    const seen = new Set()
    const index = new Map(this.vertices.map((v, i) => [v, i]))
    for (const u of this.vertices) {
      for (const { to: v, weight: w } of this.adj.get(u)) {
        if (this.directed || u === v) {
          edges.push({ from: u, to: v, weight: w })
          continue
        }
        const [lo, hi] = index.get(u) < index.get(v) ? [u, v] : [v, u]
        const key = \`\${lo}|\${hi}\`
        if (seen.has(key)) continue
        seen.add(key)
        edges.push({ from: lo, to: hi, weight: w })
      }
    }
    return edges
  }

  getAdjacencyList() {
    const list = {}
    for (const v of this.vertices) list[v] = [...this.adj.get(v)]
    return list
  }

  getAdjacencyMatrix() {
    const n = this.vertices.length
    const idx = new Map(this.vertices.map((v, i) => [v, i]))
    const matrix = Array.from({ length: n }, () => Array(n).fill(null))
    for (const u of this.vertices) {
      for (const { to: v, weight: w } of this.adj.get(u)) {
        matrix[idx.get(u)][idx.get(v)] = w
      }
    }
    return matrix
  }

  size() {
    return this.vertices.length
  }

  clear() {
    this.vertices = []
    this.adj.clear()
  }

  #upsert(u, v, w) {
    const list = this.adj.get(u)
    const i = list.findIndex((n) => n.to === v)
    if (i === -1) list.push({ to: v, weight: w })
    else list[i] = { to: v, weight: w }
  }
}

const g = new Graph({ directed: false, weighted: false })
for (const person of ['Alice', 'Bob', 'Carol']) g.addVertex(person)
g.addEdge('Alice', 'Bob')
g.addEdge('Bob', 'Carol')
console.log(g.getAdjacencyList())
console.log(g.getEdges())
`,
    typescript: `type Neighbor = { to: string; weight: number }
type Edge = { from: string; to: string; weight: number }

class Graph {
  readonly directed: boolean
  readonly weighted: boolean
  private vertices: string[] = []
  private adj = new Map<string, Neighbor[]>()

  constructor(options: { directed?: boolean; weighted?: boolean } = {}) {
    this.directed = options.directed ?? false
    this.weighted = options.weighted ?? false
  }

  addVertex(vertex: string): boolean {
    const v = vertex.trim()
    if (!v || this.adj.has(v)) return false
    this.vertices.push(v)
    this.adj.set(v, [])
    return true
  }

  removeVertex(vertex: string): boolean {
    const v = vertex.trim()
    if (!this.adj.has(v)) return false
    this.adj.delete(v)
    this.vertices = this.vertices.filter((x) => x !== v)
    for (const u of this.vertices) {
      this.adj.set(
        u,
        this.adj.get(u)!.filter((n) => n.to !== v),
      )
    }
    return true
  }

  addEdge(from: string, to: string, weight?: number): boolean {
    const u = from.trim()
    const v = to.trim()
    if (!this.adj.has(u) || !this.adj.has(v)) return false
    const w =
      !this.weighted || weight === undefined ? 1 : weight
    if (!Number.isFinite(w)) return false
    this.upsert(u, v, w)
    if (!this.directed && u !== v) this.upsert(v, u, w)
    return true
  }

  removeEdge(from: string, to: string): boolean {
    const u = from.trim()
    const v = to.trim()
    if (!this.adj.has(u) || !this.adj.has(v)) return false
    const before = this.adj.get(u)!.length
    this.adj.set(
      u,
      this.adj.get(u)!.filter((n) => n.to !== v),
    )
    let changed = this.adj.get(u)!.length !== before
    if (!this.directed && u !== v) {
      const beforeB = this.adj.get(v)!.length
      this.adj.set(
        v,
        this.adj.get(v)!.filter((n) => n.to !== u),
      )
      changed = changed || this.adj.get(v)!.length !== beforeB
    }
    return changed
  }

  hasVertex(vertex: string): boolean {
    return this.adj.has(vertex.trim())
  }

  hasEdge(from: string, to: string): boolean {
    return (this.adj.get(from.trim()) ?? []).some((n) => n.to === to.trim())
  }

  getNeighbors(vertex: string): Neighbor[] {
    return [...(this.adj.get(vertex.trim()) ?? [])]
  }

  getVertices(): string[] {
    return [...this.vertices]
  }

  getEdges(): Edge[] {
    const edges: Edge[] = []
    const seen = new Set<string>()
    const index = new Map(this.vertices.map((v, i) => [v, i]))
    for (const u of this.vertices) {
      for (const { to: v, weight: w } of this.adj.get(u)!) {
        if (this.directed || u === v) {
          edges.push({ from: u, to: v, weight: w })
          continue
        }
        const [lo, hi] =
          index.get(u)! < index.get(v)! ? [u, v] : [v, u]
        const key = \`\${lo}|\${hi}\`
        if (seen.has(key)) continue
        seen.add(key)
        edges.push({ from: lo, to: hi, weight: w })
      }
    }
    return edges
  }

  getAdjacencyList(): Record<string, Neighbor[]> {
    const list: Record<string, Neighbor[]> = {}
    for (const v of this.vertices) list[v] = [...this.adj.get(v)!]
    return list
  }

  getAdjacencyMatrix(): (number | null)[][] {
    const n = this.vertices.length
    const idx = new Map(this.vertices.map((v, i) => [v, i]))
    const matrix: (number | null)[][] = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => null),
    )
    for (const u of this.vertices) {
      for (const { to: v, weight: w } of this.adj.get(u)!) {
        matrix[idx.get(u)!]![idx.get(v)!] = w
      }
    }
    return matrix
  }

  size(): number {
    return this.vertices.length
  }

  clear(): void {
    this.vertices = []
    this.adj.clear()
  }

  private upsert(u: string, v: string, w: number): void {
    const list = this.adj.get(u)!
    const i = list.findIndex((n) => n.to === v)
    if (i === -1) list.push({ to: v, weight: w })
    else list[i] = { to: v, weight: w }
  }
}

const g = new Graph({ directed: false, weighted: false })
for (const person of ['Alice', 'Bob', 'Carol'] as const) g.addVertex(person)
g.addEdge('Alice', 'Bob')
g.addEdge('Bob', 'Carol')
console.log(g.getAdjacencyList())
console.log(g.getEdges())
`,
  },

  whenToUse: [
    'Relationships are arbitrary — not a single parent hierarchy (use a tree/BST when hierarchy fits better).',
    'You need to model social links, roads, networks, flights, dependencies, or hyperlinks.',
    'You will later run connectivity or path algorithms (BFS, DFS, shortest paths).',
    'You must choose storage intentionally: sparse → adjacency list; dense + fast edge tests → matrix.',
  ],

  whenNotToUse: [
    'Data is a strict hierarchy with one parent per node — a tree is clearer.',
    'You only need a flat ordered collection — use an array or list.',
    'You only need exact key → value maps with no relationships — use a hash table.',
    'You need prefix string dictionaries — use a Trie (/learn/trie).',
  ],

  keyTakeaways: [
    'Graphs = vertices + edges; edges may be directed and/or weighted.',
    'Adjacency lists use O(V + E) space; matrices use O(V²) with O(1) edge checks.',
    'Undirected edges are symmetric; directed edges are one-way unless both directions exist.',
    'Removing a vertex must remove all incident edges to keep the graph consistent.',
    'Degree, paths, cycles, and connectivity are the vocabulary for upcoming BFS/DFS lessons.',
    'Real systems: social networks, roads, computer networks, flights, and website links.',
  ],

  previousLesson: {
    title: 'Priority Queue',
    href: '/learn/priority-queue',
  },

  nextLesson: {
    title: 'Trie (Prefix Tree)',
    href: '/learn/trie',
  },

  categoryHref: '/data-structures',
}
