import type { Lesson } from './types'

export const floydWarshall: Lesson = {
  slug: 'floyd-warshall',
  title: 'Floyd-Warshall Algorithm',
  description:
    'Learn all-pairs shortest paths with Floyd-Warshall: dynamic programming, distance matrices, intermediate vertices, path reconstruction, and negative-cycle detection.',
  category: 'Data Structures',
  difficulty: 'Intermediate',
  estimatedTime: '55 min',
  tags: [
    'Graph Algorithms',
    'Floyd-Warshall',
    'All-Pairs Shortest Path',
    'Dynamic Programming',
    'Negative Cycle',
    'Intermediate',
  ],

  objectives: [
    'Explain an all-pairs shortest path and how it differs from one source.',
    'Build and update a distance matrix with the intermediate-vertex recurrence.',
    'Reconstruct one deterministic path from a next-hop matrix.',
    'Detect a negative cycle from a negative diagonal and mark only the pairs it can affect.',
    'Choose among Dijkstra, Bellman-Ford, and Floyd-Warshall from the question you are asking.',
  ],

  overview: [
    'An all-pairs shortest path asks for the cheapest route between every ordered pair of vertices, not just from one source. Floyd-Warshall answers that with dynamic programming on a distance matrix.',
    'The central recurrence is dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]). Vertex k is an allowed intermediate vertex: a vertex the route may pass through, not a new source. Each k reads the matrix from before that vertex was allowed, then writes a new matrix.',
    'The algorithm allows negative edge weights. A negative diagonal after the last k means that vertex lies on a negative cycle. Only pairs that can reach such a vertex, and that the cycle can reach, lose their finite shortest path. Other pairs stay finite or ∞.',
    'The playground steps one cell at a time and can jump a whole intermediate vertex. Previous and Next restore the matrices from that snapshot. The algorithm module does not depend on React and does not edit the graph. This lesson does not build a production routing system.',
  ],

  whyItMatters: [
    'Some questions really do need every pair: a small road network, a dense service map, or a comparison of every city with every other city. Running a single-source algorithm once per vertex also works, and Floyd-Warshall is the direct matrix version of that idea.',
    'The recurrence is a compact dynamic program. Once you can see why k is an intermediate vertex, the same triple loop shows up in other matrix problems, including transitive closure — which answers reachability, not distance.',
    'A negative cycle makes some distances meaningless. Knowing which pairs are affected, and which are not, is the difference between a careful answer and marking the whole table.',
  ],

  visualization: {
    title: 'Watch the distance matrix fill in',
    description:
      'Load a sample graph or edit vertices and edges, then step one cell or one intermediate vertex at a time. Rows are sources, columns are destinations, and ∞ means unreachable. The highlighted cells are dist[i][j], dist[i][k], and dist[k][j]. Choose a source and destination to read one path from the next-hop matrix.',
    type: 'floyd-warshall',
  },

  steps: [
    {
      title: 'What is an All-Pairs Shortest Path?',
      description:
        'A shortest path from u to v is a walk whose edge weights sum to the smallest total. All-pairs means you want that answer for every ordered pair, including a vertex to itself. Dijkstra (/learn/dijkstra) and Bellman-Ford (/learn/bellman-ford) each start at one source and fill one row of that table. Floyd-Warshall fills the whole table together. If no walk exists, the cell stays ∞. If a walk can loop a negative cycle, that pair has no finite shortest path.',
    },
    {
      title: 'What is Floyd-Warshall?',
      description:
        'Floyd-Warshall is a dynamic-programming algorithm for all-pairs shortest paths on a weighted directed or undirected graph. It tries every vertex as an intermediate, in insertion order. After vertex k has been considered, dist[i][j] is the shortest distance from i to j that is allowed to pass through any of the vertices up through k, and no later vertex. The graph itself is never rewritten. Undirected edges are already stored in both directions by the Graph lesson (/learn/graph), so the matrix sees both ways.',
    },
    {
      title: 'Dynamic Programming Fundamentals',
      description:
        'The subproblem is “shortest path from i to j using only the first k vertices as intermediates.” That family of subproblems overlaps: the best path that may use k is either the best path that avoids k, or a path that goes i to k and then k to j, both of which were solved in the previous layer. There is no greedy choice of a closest vertex. Every pair is reconsidered for every k, which is why the time is Θ(V³) even when the graph has few edges.',
    },
    {
      title: 'Distance Matrix',
      description:
        'The distance matrix has one row per source and one column per destination, in the same vertex order. A cell holds the best distance known so far, or ∞ when no path is known. The playground keeps the previous layer beside the current matrix so you can see which cells a single k changed. On the final frames, a pair affected by a negative cycle displays −∞. That reported distance is not the last finite dynamic-programming number. Unreachable pairs stay ∞.',
    },
    {
      title: 'Intermediate Vertices',
      description:
        'Vertex k is being considered as an allowed intermediate vertex. A path from i to j may visit k in the middle. k is not required to be an endpoint, and choosing k does not mean the search starts at k. In the routes sample, allowing B improves A → D from 20 to 11. Allowing C later improves it from 11 to 8, because the path A–B–C–D uses C in the middle. Vertices that are never useful intermediates leave the matrix unchanged for that iteration.',
    },
    {
      title: 'The Relaxation Formula',
      description:
        'The update is dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]). Both lookups on the right come from the matrix before k was allowed, so one cell in this pass does not change the inputs of the next cell. If either dist[i][k] or dist[k][j] is ∞, there is no numeric candidate: i cannot reach k, or k cannot reach j. If the candidate is strictly smaller, the cell updates. If it is equal or larger, the cell stays. Equal distances keep the path already stored, which makes ties deterministic.',
    },
    {
      title: 'Matrix Initialization',
      description:
        'Before any intermediate vertex, set every diagonal to 0. A vertex reaches itself with an empty path. For each edge u → v, write the weight when it is strictly smaller than the cell. The Graph module keeps one weight per ordered pair and replaces a duplicate edge, so the matrix reads that best weight. A hand-built adjacency list with two entries for the same neighbor keeps the smaller weight as the entries are scanned. A positive or zero self-loop does not beat 0. A negative self-loop is written onto the diagonal immediately, because the empty path is no longer the cheapest closed walk.',
    },
    {
      title: 'Iterative Updates',
      description:
        'The outer loop selects k. The two inner loops visit every pair (i, j), including pairs where i or j equals k. Each cell frame is one comparison. The iteration-end frame is the finished layer: every pair has been offered k, and the current matrix is the shortest-distance table for intermediates up through k. You can step one cell with Previous and Next, or jump to the next finished k. Nothing about a later vertex is used early. Order changes the intermediate columns. It does not change the final finite distances when no negative cycle exists.',
    },
    {
      title: 'Path Reconstruction',
      description:
        'A next-hop matrix stores the first vertex on the chosen path from i to j. A direct edge u → v sets next[u][v] = v. When a route through k wins, next[i][j] becomes the successor already stored from i toward k, read from the previous layer. To rebuild the path, start at the source and follow successors until the destination. If the source and destination are the same vertex and that diagonal is not negative, the path is the single vertex and the distance is 0. If the cell is ∞, the path is empty. If several paths share a distance, the one written first remains: initialization writes direct edges, and a later k replaces a cell only on a strict improvement. In the tie sample, A → D of weight 2 stays ahead of A–B–D and A–C–D, which also cost 2. With no direct edge, A–B–D wins because B is allowed before C.',
    },
    {
      title: 'Negative Edge Weights',
      description:
        'A negative edge subtracts cost on that one link. Floyd-Warshall accepts it. In the negative-edge sample, C → B has weight -1, A → D is 4 via A–C–B–D, and no diagonal becomes negative. That is a real shortest path. Dijkstra (/learn/dijkstra) cannot take this graph, because a selected vertex is treated as finished. Zero-weight edges are free hops and are also allowed. They beat a heavier direct edge when the sum is smaller.',
    },
    {
      title: 'Negative Cycle Detection',
      description:
        'After every k, look at the diagonal. If dist[i][i] < 0, vertex i lies on a negative cycle: a closed walk through the allowed intermediates has a negative total, so repeating it reduces the cost forever. There is then no finite shortest path for a pair (s, t) when some cycle vertex k is reachable from s and t is reachable from k. Both of those reaches are finite cells in the finished matrix. Pairs that cannot touch the cycle stay finite or ∞. The negative-cycle sample marks S → C, because S reaches A and A reaches C, and it leaves S → S at 0 and X → Y at 5. It does not mark every pair. Affected pairs are reported as −∞ and are not reconstructed, so the successor chain is not walked around the cycle. An undirected negative edge is a cycle by itself: the walk crosses it and comes straight back. A vertex joined to that edge by an undirected link can also reach the cycle and return, so its own diagonal becomes affected. An isolated vertex does not.',
    },
    {
      title: 'Time and Space Complexity',
      description:
        'There are V choices of k and V² pairs, and each pair does a constant amount of work. Time is Θ(V³), which is O(V³). The distance matrix and the next-hop matrix each use Θ(V²) space, so auxiliary space is O(V²). The graph is not mutated and is not counted again. The visualization stores a copy of the matrices on every step so playback can move backward. That history is for the lesson. A production run keeps two matrices. The cubic bound does not improve when the graph is sparse: the loops still visit every pair. That is why the algorithm fits a small or dense graph and becomes expensive as V grows. One Dijkstra from every vertex is often better on a large sparse graph with non-negative weights.',
    },
    {
      title: 'Floyd-Warshall vs. Dijkstra vs. Bellman-Ford',
      description:
        'Use Dijkstra (/learn/dijkstra) when every weight is ≥ 0 and you need distances from one source. With a binary heap it is O((V + E) log V), and it is the wrong algorithm as soon as a weight is negative. Use Bellman-Ford (/learn/bellman-ford) when you still have one source, a weight may be negative, or you must report a negative cycle reachable from that source. It is O(V × E) and does not use a priority queue. An unreachable negative cycle does not change that source’s distances. Use Floyd-Warshall when you need every pair, the graph is small or dense, and you can afford O(V³) time and O(V²) memory. It also sees negative cycles anywhere in the graph, then marks only the pairs that can pass through them. Use BFS (/learn/graph-traversal) when every edge has the same positive cost and you only need one source: hop count is the distance.',
    },
  ],

  complexity: {
    time: {
      best: 'Θ(V³)',
      average: 'Θ(V³)',
      worst: 'Θ(V³)',
    },
    space: 'O(V²)',
    notes: {
      time: [
        'Three nested loops each run once per vertex. The loop body is O(1), so the running time is Θ(V³) on every graph, sparse or dense.',
        'A single-source Dijkstra from every vertex is O(V(V + E) log V) with a binary heap and only applies when every weight is non-negative. On a large sparse graph that is usually cheaper than Θ(V³).',
        'Bellman-Ford from every vertex is O(V² × E), which is worse than Floyd-Warshall when the graph is dense (E is near V²) and can be better when the graph is extremely sparse.',
      ],
      space: [
        'The distance matrix and the next-hop matrix are Θ(V²).',
        'The lesson stores an immutable copy per playback step. A production run can keep the previous layer and the current layer only.',
      ],
    },
  },

  pseudocode: `floydWarshall(graph):
    for each vertex v:
        dist[v][v] = 0
        next[v][v] = v
    for every other pair (i, j):
        dist[i][j] = ∞
        next[i][j] = null
    for each edge u → v with weight w:
        if w < dist[u][v]:
            dist[u][v] = w
            if u ≠ v:
                next[u][v] = v

    for each intermediate vertex k in vertex order:
        previous = copy of dist
        previousNext = copy of next
        for each source i:
            for each destination j:
                if previous[i][k] and previous[k][j] are finite:
                    candidate = previous[i][k] + previous[k][j]
                    if candidate < previous[i][j]:
                        dist[i][j] = candidate
                        next[i][j] = previousNext[i][k]

    for each vertex i:
        if dist[i][i] < 0:
            i is on a negative cycle
    for each pair (s, t):
        if some cycle vertex k is reachable from s
           and t is reachable from k:
            report −∞ and do not reconstruct a path
        else if dist[s][t] is ∞:
            report unreachable
        else:
            follow next[s][*] from s to t`,

  code: {
    python: `INF = float("inf")

def floyd_warshall(vertices, edges):
    """All-pairs distances and next hops.

    edges are (u, v, w). An undirected edge should appear twice.
    Equal candidates do not replace the stored path.
    """
    index = {vertex: i for i, vertex in enumerate(vertices)}
    n = len(vertices)
    dist = [[INF] * n for _ in range(n)]
    nxt = [[None] * n for _ in range(n)]
    for i, vertex in enumerate(vertices):
        dist[i][i] = 0
        nxt[i][i] = vertex
    for u, v, w in edges:
        i, j = index[u], index[v]
        if w < dist[i][j]:
            dist[i][j] = w
            if i != j:
                nxt[i][j] = v

    for k in range(n):
        previous = [row[:] for row in dist]
        previous_next = [row[:] for row in nxt]
        for i in range(n):
            if previous[i][k] == INF:
                continue
            for j in range(n):
                if previous[k][j] == INF:
                    continue
                candidate = previous[i][k] + previous[k][j]
                if candidate < previous[i][j]:
                    dist[i][j] = candidate
                    nxt[i][j] = previous_next[i][k]

    cycle = [vertices[i] for i in range(n) if dist[i][i] < 0]
    return dist, nxt, cycle`,

    javascript: `const INF = Number.POSITIVE_INFINITY

function floydWarshall(vertices, edges) {
  const index = new Map(vertices.map((vertex, i) => [vertex, i]))
  const n = vertices.length
  const dist = Array.from({ length: n }, () => Array(n).fill(INF))
  const next = Array.from({ length: n }, () => Array(n).fill(null))
  vertices.forEach((vertex, i) => {
    dist[i][i] = 0
    next[i][i] = vertex
  })
  for (const edge of edges) {
    const i = index.get(edge.from)
    const j = index.get(edge.to)
    if (edge.weight < dist[i][j]) {
      dist[i][j] = edge.weight
      if (i !== j) next[i][j] = edge.to
    }
  }

  for (let k = 0; k < n; k += 1) {
    const previous = dist.map((row) => row.slice())
    const previousNext = next.map((row) => row.slice())
    for (let i = 0; i < n; i += 1) {
      if (!Number.isFinite(previous[i][k])) continue
      for (let j = 0; j < n; j += 1) {
        if (!Number.isFinite(previous[k][j])) continue
        const candidate = previous[i][k] + previous[k][j]
        if (candidate < previous[i][j]) {
          dist[i][j] = candidate
          next[i][j] = previousNext[i][k]
        }
      }
    }
  }

  const cycle = vertices.filter((_, i) => dist[i][i] < 0)
  return { dist, next, cycle }
}`,

    typescript: `const INF = Number.POSITIVE_INFINITY

type Edge = { from: string; to: string; weight: number }

export function floydWarshall(vertices: readonly string[], edges: readonly Edge[]) {
  const index = new Map(vertices.map((vertex, i) => [vertex, i]))
  const n = vertices.length
  const dist = Array.from({ length: n }, () => Array<number>(n).fill(INF))
  const next: (string | null)[][] = Array.from({ length: n }, () =>
    Array<string | null>(n).fill(null),
  )
  vertices.forEach((vertex, i) => {
    dist[i]![i] = 0
    next[i]![i] = vertex
  })
  for (const edge of edges) {
    const i = index.get(edge.from)
    const j = index.get(edge.to)
    if (i === undefined || j === undefined) continue
    if (edge.weight < dist[i]![j]!) {
      dist[i]![j] = edge.weight
      if (i !== j) next[i]![j] = edge.to
    }
  }

  for (let k = 0; k < n; k += 1) {
    const previous = dist.map((row) => row.slice())
    const previousNext = next.map((row) => row.slice())
    for (let i = 0; i < n; i += 1) {
      if (!Number.isFinite(previous[i]![k]!)) continue
      for (let j = 0; j < n; j += 1) {
        if (!Number.isFinite(previous[k]![j]!)) continue
        const candidate = previous[i]![k]! + previous[k]![j]!
        if (candidate < previous[i]![j]!) {
          dist[i]![j] = candidate
          next[i]![j] = previousNext[i]![k] ?? null
        }
      }
    }
  }

  const cycle = vertices.filter((_, i) => dist[i]![i]! < 0)
  return { dist, next, cycle }
}`,
  },

  algorithmConnection: {
    eyebrow: 'COMPARE',
    title: 'Dijkstra vs. Bellman-Ford vs. Floyd-Warshall',
    description:
      'All three compute shortest paths. They differ in how many sources they answer, which weights they allow, and how they report a negative cycle.',
    items: [
      {
        title: "Dijkstra — one source, weights ≥ 0",
        description:
          'Pick the unfinished vertex with the smallest distance and relax its outgoing edges. A selected distance is final, so a later negative edge would make it wrong. Best when the graph is large, sparse, and every weight is zero or positive. O((V + E) log V) with a binary heap. See /learn/dijkstra.',
      },
      {
        title: 'Bellman-Ford — one source, negative edges',
        description:
          'Relax every edge up to |V| - 1 times, then check whether a distance can still fall. That catches a negative cycle reachable from the source and leaves an unreachable cycle alone. O(V × E), no priority queue. See /learn/bellman-ford.',
      },
      {
        title: 'Floyd-Warshall — every pair',
        description:
          'Dynamic programming over intermediate vertices. O(V³) time and O(V²) memory on every graph. Practical for a small or dense graph. A negative diagonal marks a cycle, and only pairs that can pass through it become −∞.',
      },
    ],
  },

  commonMistakes: {
    description:
      'These show up when the matrix, the intermediate vertex, or the negative cycle is easy to misread.',
    mistakes: [
      {
        title: 'Treating k as a source',
        explanation:
          'k is a vertex the path is allowed to pass through. The outer loop is not “run the algorithm from k.” Every pair (i, j) is still the question being answered.',
      },
      {
        title: 'Updating a cell when the candidate is only equal',
        explanation:
          'min keeps the distance, but replacing the next hop on a tie changes which path you reconstruct. This lesson updates only when the candidate is strictly smaller, so the earlier path stays.',
      },
      {
        title: 'Marking every pair after any negative diagonal',
        explanation:
          'A negative dist[i][i] means i is on a negative cycle. A pair is affected only when it can reach some such vertex and that vertex can reach the destination. An isolated component keeps its own finite distances.',
      },
      {
        title: 'Walking the next-hop matrix around a negative cycle',
        explanation:
          'The stored successors can re-enter the cycle. Affected pairs are reported as −∞ with an empty path. They are not reconstructed.',
      },
      {
        title: 'Confusing the distance matrix with transitive closure',
        explanation:
          'Transitive closure asks whether any path exists. Its cell is a boolean, combined with OR and AND. Floyd-Warshall asks for the cheapest path. Its cell is a number, combined with min and plus. The triple loop has the same shape. The meaning does not.',
      },
    ],
  },

  whenToUse: [
    'You need the shortest distance between every pair of vertices, and V is small enough that a V×V matrix is comfortable.',
    'The graph is dense, so Θ(V³) is competitive with running a single-source algorithm from every vertex.',
    'Edge weights may be negative, and you need to know which pairs a negative cycle can affect.',
    'You want one deterministic path per unaffected pair, including the case where the source and destination are the same vertex.',
  ],

  whenNotToUse: [
    'You only need distances from one source and every weight is ≥ 0. Dijkstra (/learn/dijkstra) is the better fit on a large sparse graph.',
    'You only need one source, but a weight may be negative. Bellman-Ford (/learn/bellman-ford) is O(V × E) and already detects a cycle reachable from that source.',
    'V is large. A thousand vertices is a billion triple-loop steps and a million matrix cells. The algorithm is correct and expensive.',
    'You only need reachability. Transitive closure, BFS, or DFS answers “is there a path?” without adding weights.',
    'You want a production router, live traffic, or turn-by-turn directions. This lesson computes distances on a teaching graph. It does not build that system.',
  ],

  keyTakeaways: [
    'All-pairs shortest paths fill a matrix. Floyd-Warshall does it by allowing one new intermediate vertex at a time.',
    'The recurrence is dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]). k is an intermediate vertex. The right-hand side is the previous layer.',
    'A strict < keeps ties deterministic: the path written first stays.',
    'Diagonal 0 is the empty path. A negative diagonal means a negative cycle. ∞ means unreachable. −∞ is reserved for pairs the cycle can affect.',
    'Do not mark every pair. A pair is affected only when it can reach a cycle vertex that can reach the destination.',
    'Time is Θ(V³) and space is O(V²). That is practical for a small or dense graph and costly for a large one.',
    'Dijkstra is one source and non-negative weights. Bellman-Ford is one source and negative weights. Floyd-Warshall is every pair.',
    'Transitive closure is reachability. It is not this distance calculation.',
  ],

  previousLesson: {
    title: 'Bellman-Ford Algorithm',
    href: '/learn/bellman-ford',
  },

  nextLesson: {
    title: 'Topological Sorting',
    href: '/learn/topological-sort',
  },

  categoryHref: '/data-structures',
}
