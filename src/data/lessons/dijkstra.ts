import type { Lesson } from './types'

export const dijkstra: Lesson = {
  slug: 'dijkstra',
  title: "Dijkstra's Algorithm",
  description:
    'Learn Dijkstra’s shortest paths on non-negative weighted graphs: distance tables, previous vertices, priority queues, relaxation, and an interactive visualization.',
  category: 'Data Structures',
  difficulty: 'Intermediate',
  estimatedTime: '45 min',
  tags: [
    'Graph Algorithms',
    'Dijkstra',
    'Shortest Path',
    'Weighted Graph',
    'Priority Queue',
    'Intermediate',
  ],

  objectives: [
    'Explain what a shortest path is on a weighted graph.',
    'Run Dijkstra by selecting the unvisited vertex with the smallest known distance.',
    'Read and update a distance table and previous-vertex map.',
    'Use a min priority queue, including stale duplicate entries.',
    'Relax an edge and decide whether the candidate distance is better.',
    'Reconstruct the path from previous pointers, including unreachable destinations.',
    'State why non-negative weights are required and when BFS is enough instead.',
  ],

  overview: [
    'A shortest path is the minimum total weight from a source vertex to a destination — not necessarily the path with the fewest edges. On an unweighted graph every edge costs the same, so breadth-first search already finds it. When edges have different non-negative costs, Dijkstra’s Algorithm is the classic tool.',
    'The central idea is small: keep a best-known distance for every vertex, repeatedly select the unvisited vertex with the smallest distance, and relax its outgoing edges. Relaxing an edge asks whether going through the current vertex is cheaper than the distance already recorded.',
    'This lesson uses the adjacency-list Graph from /learn/graph and the min priority queue from /learn/priority-queue. The queue has no decrease-key, so a better distance is enqueued again and older entries are ignored when they come out (a stale-entry check). The playground steps forward and backward through immutable snapshots of the distance table.',
    'Dijkstra requires every edge weight to be zero or positive. It is not a correct algorithm for negative weights. Bellman-Ford (/learn/bellman-ford) handles negative weights and reports a reachable negative cycle instead of a finite distance.',
  ],

  whyItMatters: [
    'Maps, networks, and games all ask “what is the cheapest way from here to there?” Hop count is the wrong question when some connections are slower or longer.',
    'The distance table is the whole algorithm: numbers get smaller, previous pointers remember how, and visited vertices are finished.',
    'Priority queues stop you from scanning every unvisited vertex on each round. That is why the binary-heap version is O((V + E) log V) instead of a slower repeated scan.',
    'Knowing the non-negative limitation prevents a very common bug: running Dijkstra on a graph that can reward a later, negative edge.',
  ],

  visualization: {
    title: 'Shortest paths on a weighted graph',
    description:
      'Choose a source and destination, load a weighted sample or edit vertices and edges, then step through Dijkstra. The distance table, priority queue, and highlighted path all come from the current snapshot, so Previous restores the earlier state exactly.',
    type: 'dijkstra',
  },

  steps: [
    {
      title: 'What is a Shortest Path?',
      description:
        'A path is a sequence of vertices connected by edges. Its length here is the sum of edge weights, not the number of hops. The shortest path from source to destination is any path whose sum is smallest. There can be several paths with the same sum; the algorithm keeps one of them. If no path exists, the destination is unreachable and its distance stays infinity (∞).',
    },
    {
      title: 'Weighted Graphs',
      description:
        'A weighted graph stores a number on each edge: kilometers, minutes, tolls, or hop cost. Undirected weighted edges can be traveled either way at that cost. Directed weighted edges only allow the arrow’s direction. The Graph lesson (/learn/graph) stores these as adjacency lists. Unweighted graphs are the special case where every weight is 1 — BFS on /learn/graph-traversal is enough there, because the first time you reach a vertex you already used the fewest edges.',
    },
    {
      title: 'Edge Weights',
      description:
        'Weights in this lesson are finite numbers greater than or equal to 0. A weight of 4 means “this connection adds 4 to the path.” A weight of 0 is allowed: it is a free connection, and Dijkstra still finishes because the distance never needs to go backward. A direct edge is not automatically best. If A—B costs 4 and A—C—B costs 2 + 1, the indirect route is shorter. Negative weights are rejected: a negative edge could make a “finished” distance wrong later.',
    },
    {
      title: "What is Dijkstra's Algorithm?",
      description:
        'Dijkstra’s Algorithm computes the shortest distance from one source to every vertex that source can reach, on a graph with non-negative edge weights. It repeatedly selects the unvisited vertex with the smallest known distance and relaxes that vertex’s outgoing edges. After a vertex is selected, its distance is final — no cheaper path can appear later, because every remaining edge adds zero or more. That guarantee is exactly why negative weights are out of scope. Bellman-Ford (/learn/bellman-ford) does not freeze a vertex when it is selected. It relaxes every edge up to |V| - 1 times, so a negative edge can still improve a distance, and a later pass can detect a reachable negative cycle.',
    },
    {
      title: 'Source and Destination Vertices',
      description:
        'The source is where every path starts. Its distance is 0 and its previous vertex is empty. The destination is the vertex whose path you want to read out at the end. Dijkstra still fills distances for the other reachable vertices; the destination just tells you which previous-pointer chain to reconstruct. If the source and destination are the same vertex, the shortest path is that single vertex and the distance is 0. If the destination is in another component, or a directed graph has no route toward it, the search reports unreachable.',
    },
    {
      title: 'Distance Table',
      description:
        'The distance table has one row per vertex: best known distance, previous vertex, and whether it is visited. At the start the source is 0 and every other distance is ∞. ∞ means “no path discovered yet,” which is also how an unreachable vertex looks at the end. Each relaxation may replace ∞, or a larger number, with a smaller candidate. The playground table uses the live snapshot, so stepping backward shows the earlier numbers again — nothing is hardcoded.',
    },
    {
      title: 'Previous Vertex Tracking',
      description:
        'A distance alone does not say which roads you took. Whenever a relaxation improves vertex v through u, store previous[v] = u. Those pointers form a tree rooted at the source. They change only when a strictly better distance is found; an equal candidate keeps the earlier previous vertex. Unreached vertices keep an empty previous pointer (shown as —).',
    },
    {
      title: 'Priority Queue',
      description:
        'A min priority queue (/learn/priority-queue) always offers the smallest distance next, which is exactly the vertex Dijkstra wants. This project’s binary heap does not support decrease-key. When a distance improves, the new pair (vertex, better distance) is enqueued and the older pair is left in place. On dequeue, if the priority is worse than the distance currently in the table, or the vertex is already visited, the entry is stale and is discarded. That check keeps the algorithm correct without a fancier heap. The queue is empty at the end.',
    },
    {
      title: 'Relaxation',
      description:
        'Relaxing edge u → v with weight w computes candidate = dist[u] + w. If the candidate is strictly smaller than dist[v], update dist[v], set previous[v] = u, and enqueue v with that priority. If the candidate is equal or larger, leave the table and the queue unchanged. Already visited neighbors are skipped: their distances are final. The playground spells out the arithmetic for the edge it is inspecting, including the cases where nothing is updated.',
    },
    {
      title: 'Visited and Unvisited Vertices',
      description:
        'Unvisited vertices are still open. The next one to select is the unvisited vertex with the smallest known distance (the priority queue’s job). Once selected, a vertex becomes visited and is not selected again. Visited does not mean “we looked at it as a neighbor”; it means “its shortest distance from the source is settled.” Vertices that stay unvisited when the queue empties cannot be reached from the source.',
    },
    {
      title: 'Reconstructing the Shortest Path',
      description:
        'Start at the destination and follow previous pointers until the source, then reverse that chain. Example: if E’s previous is D, D’s is B, B’s is C, and C’s is A, the path is A → C → B → D → E. If the destination was never given a previous pointer and it is not the source, there is no path — return an empty path and keep the distance at ∞. Source equal to destination returns a one-vertex path without walking any edges.',
    },
    {
      title: 'Time and Space Complexity',
      description:
        'With an adjacency list and a binary heap that allows duplicate entries, each vertex is settled once and each edge can cause a queue insertion, so the usual bound is O((V + E) log V) time. Space is O(V + E): the graph, the distance and previous tables (O(V)), and a queue that can hold O(E) stale copies. A different representation changes the cost. An adjacency matrix makes neighbor scans O(V) per vertex. A heap with decrease-key, such as a Fibonacci heap, can reach O(E + V log V). Always name the graph storage and the priority queue when you quote a bound.',
    },
    {
      title: 'Real-world Applications',
      description:
        'GPS navigation sums travel time or distance on road segments and asks for the cheapest route between two intersections. Road-network routing is the same model with one-way streets as directed edges. Network packet routing concepts use link cost as the weight (the real internet uses more policy than plain Dijkstra, but the shortest-path idea is the same). Flight planning adds hours or price on each directed leg — a one-stop itinerary can beat a long direct flight. Game pathfinding on a weighted grid uses terrain cost the same way; if every tile costs 1, BFS or a grid variant is enough, and if costs differ and stay non-negative, Dijkstra (or A* built on the same relaxation idea) applies. None of these examples are valid if a weight can be negative. That case, including a reachable negative cycle, is Bellman-Ford (/learn/bellman-ford).',
    },
  ],

  thinkingGuide: {
    title: 'How to run Dijkstra by hand',
    description:
      'Work from the distance table. Do not jump to the destination until it is the cheapest unvisited vertex.',
    steps: [
      'Confirm every weight is ≥ 0. If any weight is negative, stop — this algorithm does not apply.',
      'Write dist[source] = 0 and dist[everyone else] = ∞. Previous pointers start empty.',
      'Put the source in a min priority queue with priority 0.',
      'While the queue is not empty, take the smallest entry. If it is stale or already visited, discard it.',
      'Mark that vertex visited. For each outgoing edge, compute dist[current] + weight and update the neighbor only when the candidate is strictly smaller.',
      'When the queue is empty, walk previous pointers from the destination back to the source and reverse them.',
    ],
  },

  complexity: {
    time: {
      best: 'O((V + E) log V)',
      average: 'O((V + E) log V)',
      worst: 'O((V + E) log V)',
    },
    space: 'O(V + E)',
    notes: {
      time: [
        'This bound is for an adjacency list plus a binary heap with duplicate entries instead of decrease-key.',
        'Each of the O(E) queue operations costs O(log V) because the heap holds O(E) entries and log E is O(log V) on simple graphs.',
        'An adjacency-matrix scan or a different priority queue (Fibonacci heap, dial’s bucket queue) changes the bound. State the representation you used.',
      ],
      space: [
        'The graph is O(V + E). Distance and previous tables are O(V). The lazy priority queue can store O(E) entries.',
        'The visualization stores an immutable copy of that state per step so playback can move backward. That extra history is for the lesson, not for a production run.',
      ],
    },
  },

  commonMistakes: {
    description:
      'These are the mistakes that make a shortest-path answer quietly wrong.',
    mistakes: [
      {
        title: 'Using Dijkstra when a weight is negative',
        explanation:
          'The moment a vertex is selected, Dijkstra treats its distance as final. A later negative edge can undercut that distance. Reject negative weights. Bellman-Ford is the algorithm that allows them (and still fails if a negative cycle is reachable).',
      },
      {
        title: 'Using BFS on unequal weights',
        explanation:
          'BFS finds fewest edges, not least total weight. A two-edge path can cost less than a one-edge path. Use BFS only when every edge weight is identical.',
      },
      {
        title: 'Forgetting stale priority-queue entries',
        explanation:
          'Without decrease-key, the heap can contain an old worse distance. If you trust that entry, you may settle a vertex too late or with the wrong distance. Skip a dequeued entry when its priority is greater than the distance table, or when the vertex is already visited.',
      },
      {
        title: 'Updating on an equal candidate',
        explanation:
          'Replace a distance only when the candidate is strictly smaller. An equal sum is not an improvement; keeping the old previous pointer avoids needless queue growth.',
      },
      {
        title: 'Reading the path off the distance column',
        explanation:
          'Distances do not record the route. Walk the previous-vertex column from the destination back to the source, then reverse. An empty previous pointer on a non-source vertex means unreachable.',
      },
    ],
  },

  algorithmConnection: {
    title: 'BFS vs Dijkstra',
    eyebrow: 'UNWEIGHTED VS WEIGHTED',
    description:
      'Both grow a frontier from a source. They answer different questions.',
    items: [
      {
        title: 'BFS — unweighted shortest paths',
        description:
          'When every edge costs the same (the Graph Traversal lesson treats them as weight 1), the first time BFS reaches a vertex it has used the fewest edges. A FIFO queue is enough. You do not need a priority queue or a distance table of unequal costs.',
      },
      {
        title: 'Dijkstra — non-negative weights',
        description:
          'When weights differ but none are negative, fewest edges can be the expensive route. Dijkstra keeps numeric distances and always expands the smallest unfinished distance, using a min priority queue. That is the algorithm on this page.',
      },
      {
        title: 'Not for negative weights',
        description:
          'Neither BFS nor Dijkstra is correct if an edge weight can be negative. Bellman-Ford (/learn/bellman-ford) relaxes every edge up to |V| - 1 times, allows a negative edge, and reports a reachable negative cycle instead of a finite distance. Use that lesson when a weight can be negative. Do not treat Dijkstra as a substitute.',
      },
    ],
  },

  pseudocode: `dijkstra(graph, source, destination):
    if any edge weight < 0:
        error "Dijkstra needs non-negative weights"
    for each vertex v:
        dist[v] ← ∞
        previous[v] ← none
    dist[source] ← 0
    pq ← empty min priority queue
    enqueue(pq, source, priority 0)
    visited ← empty set

    while pq is not empty:
        u, priority ← dequeue(pq)
        if u is visited or priority > dist[u]:
            continue    // stale duplicate
        add u to visited
        for each edge u → v with weight w:
            if v is visited:
                continue
            candidate ← dist[u] + w
            if candidate < dist[v]:
                dist[v] ← candidate
                previous[v] ← u
                enqueue(pq, v, priority candidate)

    if destination is source:
        return path [source]
    if dist[destination] is ∞:
        return unreachable
    return path rebuilt by walking previous from destination back to source`,

  code: {
    python: `import heapq
import math

def dijkstra(graph: dict[str, list[tuple[str, float]]], source: str, destination: str):
    """graph maps a vertex to (neighbor, weight) pairs. Weights must be >= 0."""
    for neighbors in graph.values():
        for _vertex, weight in neighbors:
            if weight < 0:
                raise ValueError("Dijkstra requires non-negative edge weights")

    dist = {vertex: math.inf for vertex in graph}
    previous: dict[str, str | None] = {vertex: None for vertex in graph}
    dist[source] = 0
    pq: list[tuple[float, str]] = [(0, source)]
    visited: set[str] = set()

    while pq:
        priority, u = heapq.heappop(pq)
        if u in visited or priority > dist[u]:
            continue  # stale queue entry
        visited.add(u)
        for v, weight in graph[u]:
            if v in visited:
                continue
            candidate = dist[u] + weight
            if candidate < dist[v]:
                dist[v] = candidate
                previous[v] = u
                heapq.heappush(pq, (candidate, v))

    if destination == source:
        return [source], 0
    if math.isinf(dist[destination]):
        return [], math.inf

    path = []
    cursor: str | None = destination
    while cursor is not None:
        path.append(cursor)
        if cursor == source:
            break
        cursor = previous[cursor]
    path.reverse()
    return path, dist[destination]
`,
    javascript: `function dijkstra(graph, source, destination) {
  for (const neighbors of Object.values(graph)) {
    for (const [, weight] of neighbors) {
      if (weight < 0) {
        throw new Error('Dijkstra requires non-negative edge weights')
      }
    }
  }

  const dist = {}
  const previous = {}
  for (const vertex of Object.keys(graph)) {
    dist[vertex] = Infinity
    previous[vertex] = null
  }
  dist[source] = 0

  // Min-heap entries are [priority, vertex]. Duplicates are allowed.
  const pq = [[0, source]]
  const visited = new Set()

  const push = (priority, vertex) => {
    pq.push([priority, vertex])
    let i = pq.length - 1
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2)
      if (pq[parent][0] <= pq[i][0]) break
      ;[pq[parent], pq[i]] = [pq[i], pq[parent]]
      i = parent
    }
  }

  const pop = () => {
    const root = pq[0]
    const last = pq.pop()
    if (pq.length > 0 && last) {
      pq[0] = last
      let i = 0
      while (true) {
        const left = 2 * i + 1
        const right = 2 * i + 2
        let best = i
        if (left < pq.length && pq[left][0] < pq[best][0]) best = left
        if (right < pq.length && pq[right][0] < pq[best][0]) best = right
        if (best === i) break
        ;[pq[i], pq[best]] = [pq[best], pq[i]]
        i = best
      }
    }
    return root
  }

  while (pq.length > 0) {
    const [priority, u] = pop()
    if (visited.has(u) || priority > dist[u]) continue
    visited.add(u)
    for (const [v, weight] of graph[u]) {
      if (visited.has(v)) continue
      const candidate = dist[u] + weight
      if (candidate < dist[v]) {
        dist[v] = candidate
        previous[v] = u
        push(candidate, v)
      }
    }
  }

  if (destination === source) return { path: [source], distance: 0 }
  if (!Number.isFinite(dist[destination])) {
    return { path: [], distance: Infinity }
  }

  const path = []
  let cursor = destination
  while (cursor) {
    path.push(cursor)
    if (cursor === source) break
    cursor = previous[cursor]
  }
  path.reverse()
  return { path, distance: dist[destination] }
}
`,
    typescript: `import {
  createEmpty,
  dequeue,
  enqueue,
} from '../data-structures/priorityQueue'

type WeightedGraph = ReadonlyMap<string, readonly { to: string; weight: number }[]>

/**
 * Same rules as src/algorithms/graphs/dijkstra.ts:
 * non-negative weights, min priority queue, stale duplicates skipped.
 */
export function dijkstra(
  graph: WeightedGraph,
  source: string,
  destination: string,
): { path: string[]; distance: number } {
  for (const neighbors of graph.values()) {
    for (const edge of neighbors) {
      if (edge.weight < 0) {
        throw new Error('Dijkstra requires non-negative edge weights')
      }
    }
  }

  const dist = new Map<string, number>()
  const previous = new Map<string, string | null>()
  for (const vertex of graph.keys()) {
    dist.set(vertex, Number.POSITIVE_INFINITY)
    previous.set(vertex, null)
  }
  dist.set(source, 0)

  let pq = createEmpty<string>('min')
  pq = enqueue(pq, source, 0).snapshot
  const visited = new Set<string>()

  while (pq.entries.length > 0) {
    const popped = dequeue(pq)
    pq = popped.snapshot
    const entry = popped.entry
    if (!entry) break
    const known = dist.get(entry.item) ?? Number.POSITIVE_INFINITY
    if (visited.has(entry.item) || entry.priority > known) continue
    visited.add(entry.item)
    for (const edge of graph.get(entry.item) ?? []) {
      if (visited.has(edge.to)) continue
      const candidate = known + edge.weight
      const best = dist.get(edge.to) ?? Number.POSITIVE_INFINITY
      if (candidate < best) {
        dist.set(edge.to, candidate)
        previous.set(edge.to, entry.item)
        pq = enqueue(pq, edge.to, candidate).snapshot
      }
    }
  }

  if (destination === source) return { path: [source], distance: 0 }
  const distance = dist.get(destination) ?? Number.POSITIVE_INFINITY
  if (!Number.isFinite(distance)) return { path: [], distance }

  const path: string[] = []
  let cursor: string | null = destination
  while (cursor) {
    path.push(cursor)
    if (cursor === source) break
    cursor = previous.get(cursor) ?? null
  }
  path.reverse()
  return { path, distance }
}
`,
  },

  whenToUse: [
    'You need the minimum total weight from one source, and every edge weight is ≥ 0.',
    'Road times, flight durations, or game terrain costs differ from edge to edge.',
    'You already have an adjacency list and a min priority queue.',
    'You want distances to every reachable vertex, plus one reconstructed path.',
  ],

  whenNotToUse: [
    'Any edge weight is negative, or you must detect a reachable negative cycle. Use Bellman-Ford (/learn/bellman-ford). Dijkstra treats a selected distance as final, which is false when a later edge can subtract cost.',
    'Every edge has the same positive cost. BFS on /learn/graph-traversal answers fewest-hops more simply.',
    'You need a path that is allowed to revisit vertices to exploit a negative cycle — that problem is unbounded, and Dijkstra will not detect it.',
    'You only need to know whether any path exists. DFS or BFS is enough and does not need weights.',
  ],

  keyTakeaways: [
    'Dijkstra repeatedly selects the unvisited vertex with the smallest known distance and relaxes its outgoing edges.',
    'The distance table stores the best cost; previous pointers store the route; ∞ means unreachable.',
    'A min priority queue supplies that next vertex. Stale duplicates must be ignored when the heap cannot decrease-key.',
    'Edge weights must be non-negative. Zero is allowed. Negative weights, and reachable negative cycles, belong to Bellman-Ford (/learn/bellman-ford).',
    'BFS is the unweighted special case. Unequal non-negative weights need Dijkstra.',
    'With an adjacency list and a binary heap, time is O((V + E) log V) and space is O(V + E), including the graph. Quote the representation with the bound.',
    'Use Dijkstra when every weight is ≥ 0. Use Bellman-Ford (/learn/bellman-ford) when a weight may be negative or a reachable negative cycle must be reported. Bellman-Ford is O(V × E) and does not use a priority queue.',
  ],

  previousLesson: {
    title: 'Graph Traversal: BFS & DFS',
    href: '/learn/graph-traversal',
  },

  nextLesson: {
    title: 'Bellman-Ford Algorithm',
    href: '/learn/bellman-ford',
  },

  categoryHref: '/data-structures',
}
