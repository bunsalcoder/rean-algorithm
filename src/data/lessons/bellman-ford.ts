import type { Lesson } from './types'

export const bellmanFord: Lesson = {
  slug: 'bellman-ford',
  title: 'Bellman-Ford Algorithm',
  description:
    'Learn Bellman-Ford shortest paths on weighted graphs: edge relaxation, |V| - 1 iterations, negative weights, early stopping, and reachable negative-cycle detection.',
  category: 'Data Structures',
  difficulty: 'Intermediate',
  estimatedTime: '50 min',
  tags: [
    'Graph Algorithms',
    'Bellman-Ford',
    'Shortest Path',
    'Negative Weights',
    'Negative Cycle',
    'Intermediate',
  ],

  objectives: [
    'Explain how Bellman-Ford finds single-source shortest paths by relaxing every edge.',
    'Use a negative edge when it improves a path, and tell that apart from a negative cycle.',
    'Explain why |V| - 1 iterations are enough when no negative cycle is reachable.',
    'Stop early when a full pass changes no distance.',
    'Detect a reachable negative cycle and refuse a finite distance for every vertex it can reach.',
    'Leave an unreachable negative cycle alone, because it does not change source distances.',
    'Reconstruct a path from previous vertices, including the source-equals-destination case.',
    'Choose Bellman-Ford or Dijkstra from the sign of the weights.',
  ],

  overview: [
    'Bellman-Ford computes the cheapest path from one source to every vertex it can reach. It works on directed and undirected weighted graphs, and the weights may be negative, zero, or positive. The method is repetition: relax every edge, then do it again, up to |V| - 1 times.',
    'A shortest path that does not repeat a vertex uses at most |V| - 1 edges, where V is the number of vertices. Each iteration extends known paths by one edge. After |V| - 1 passes, every simple shortest path has been considered. If a distance can still fall, some walk is repeating a cycle whose total weight is negative.',
    'A negative edge is a single connection that reduces the cost. That is allowed, and it is why Dijkstra’s Algorithm (/learn/dijkstra) is the wrong tool: Dijkstra freezes a vertex the first time it is selected. A negative cycle is different. Walking around it reduces the total forever, so the vertices it can reach have no finite shortest path.',
    'The playground steps one edge at a time and can also jump a whole iteration. The distance table is computed from the graph you are looking at. Moving backward restores the earlier snapshot. The algorithm module does not depend on React and does not edit the graph.',
  ],

  whyItMatters: [
    'Some networks really do have credits, rebates, or exchange rates that behave like a negative cost. Pretending every weight is positive hides those cases.',
    'The |V| - 1 bound is the whole reason the algorithm stops. Without it, a negative cycle would make the loop run forever.',
    'Routing and arbitrage questions both need the same distinction: a finite best cost, an unreachable vertex, or a reachable negative cycle.',
    'Early termination is the practical version of that bound. A clean pass means later passes cannot discover anything new.',
  ],

  visualization: {
    title: 'Relax edges, then check for a negative cycle',
    description:
      'Choose a source, load a sample graph, and step through Bellman-Ford. One control moves a single edge relaxation. Another jumps a full iteration. The table uses the distances from the current snapshot, including −∞ when a reachable negative cycle removes a finite answer.',
    type: 'bellman-ford',
  },

  steps: [
    {
      title: 'What is Bellman-Ford?',
      description:
        'Bellman-Ford is a single-source shortest-path algorithm for a weighted graph. It keeps a best-known distance and a previous vertex for every vertex. Then it relaxes every edge, over and over. It does not pick a “closest” vertex the way Dijkstra does, so a later negative edge is still allowed to improve a distance. After the passes finish, one extra check asks whether any edge can still improve a finite distance. If it can, a negative cycle is reachable from the source.',
    },
    {
      title: 'Shortest Path Fundamentals',
      description:
        'A path here is a walk from the source to a destination. Its length is the sum of the edge weights, not the number of hops. The shortest path is a walk with the smallest sum. If no walk exists, the destination is unreachable and the distance stays ∞. If a walk can repeat a negative cycle, the sum can be driven down forever, and there is no finite shortest path. The algorithm reports those three outcomes separately: a finite distance, ∞, or −∞ for vertices touched by a reachable negative cycle.',
    },
    {
      title: 'Weighted Directed Graphs',
      description:
        'A directed edge u → v with weight w may be used only from u to v. The Graph lesson (/learn/graph) stores that as one adjacency entry. Bellman-Ford reads those outgoing entries in vertex order and never writes back into the graph. An undirected edge is stored twice, once in each direction, with the same weight. Relaxing an undirected graph therefore tries both directions. That matches the meaning of an undirected road: you may travel either way.',
    },
    {
      title: 'Positive and Negative Edge Weights',
      description:
        'A positive weight adds cost. Zero is a free hop and is allowed. A negative weight subtracts cost, like a rebate on that one link. One negative edge does not by itself create a cycle. In the sample “Negative edge”, C → B has weight -1, and the shortest path A–C–B–D has distance 4. D’s estimate is ∞, then 7, then 4. Nothing loops, so those numbers are real shortest paths. Dijkstra would reject this graph. Bellman-Ford accepts it because no cycle has a negative total.',
    },
    {
      title: 'Edge Relaxation',
      description:
        'Relaxing u → v with weight w asks whether dist(u) + w is strictly smaller than dist(v). If dist(u) is still ∞, the edge is not considered: you cannot extend a path you have not reached. If the candidate is smaller, set dist(v) to the candidate and set the previous vertex of v to u. If the candidate is equal or larger, leave both the distance and the previous vertex alone. The playground shows the distance before, the candidate, the distance after, the previous vertex, and whether an update happened. Each of those frames is one relaxation, not a whole iteration.',
    },
    {
      title: 'Repeated Relaxation',
      description:
        'One pass can only use distances that are already known. A path of three edges may need three passes before the last vertex sees the best sum, because each pass extends paths by one more edge. In the negative-edge sample, the first pass sets D to 7 using the older distance of B. The second pass has already improved B through the negative edge, so B → D lowers D to 4. The order of edges inside a pass changes the intermediate column. It does not change the final distances when no negative cycle is reachable.',
    },
    {
      title: 'Why V - 1 Iterations?',
      description:
        'Let V be the number of vertices. A walk that repeats a vertex contains a cycle. If that cycle’s total weight is zero or positive, removing it cannot make the walk more expensive, so some shortest path is simple: it never repeats a vertex. A simple path has at most V - 1 edges. Relaxing every edge once extends every known path by one edge. Doing that V - 1 times is enough to build every simple path from the source. The sample graph has 5 vertices, so the bound is 4 passes. You do not need a fifth shortest-path pass unless you are hunting a negative cycle.',
    },
    {
      title: 'Early Termination Optimization',
      description:
        'If a full pass relaxes every edge and changes nothing, the next pass would perform the same comparisons on the same numbers. Bellman-Ford can stop. That clean pass also proves there is no reachable negative cycle, so the extra detection pass is unnecessary. In the negative-edge sample the third pass changes nothing, and the fourth pass is skipped. The iteration table keeps the column that showed “no change”, and the result distances stay finite. Early stop is an optimization of the same algorithm, not a different answer.',
    },
    {
      title: 'Negative Cycle Detection',
      description:
        'A negative cycle is a closed walk whose weights sum to less than zero. Following it again reduces the cost. After the |V| - 1 passes, Bellman-Ford relaxes every edge once more. If any finite distance still falls, a negative cycle is reachable from the source. Every vertex that cycle can reach is marked, including vertices downstream of the cycle. Their reported distance is −∞, and their previous pointers are cleared, so the result does not pretend the last finite estimate was a shortest path. The sample “Reachable negative cycle” has A → B → A with total weight 2 + (-4) = -2. S stays 0, because the cycle cannot return to S. A, B, and C are affected: C is not on the cycle, but A can still reach C after looping. The sample “Unreachable negative cycle” has the same kind of loop on X and Y, with no path from S. Those edges are inspected and skipped because their tails stay ∞. S → B remains 5.',
    },
    {
      title: 'Path Reconstruction',
      description:
        'Whenever a relaxation improves v through u, store previous(v) = u. At the end, start at the destination and follow previous pointers back to the source, then reverse that chain. If the source and destination are the same vertex and the source is not on a reachable negative cycle, the path is that single vertex and the distance is 0. If the destination was never reached, the path is empty and the distance is ∞. If the destination is affected by a reachable negative cycle, the path is empty and the distance is −∞, even when the destination is the source. An undirected negative edge is the usual way the source itself becomes affected: walking across the edge and back returns to the source with a lower total.',
    },
    {
      title: 'Time and Space Complexity',
      description:
        'Each of up to V iterations scans every edge, and the negative-cycle check scans the edges once more. With an adjacency list that is O(V + E) to store, the running time is O(V × E). The distance array, the previous array, and the queue used to mark affected vertices are O(V) auxiliary space. The graph itself is not counted again in that auxiliary bound. The visualization keeps an immutable copy of the tables on every step so playback can move backward. That history is for the lesson, not for a production run. Early termination can stop before V - 1 passes; the worst case is still O(V × E) when every pass updates something or the graph is dense.',
    },
    {
      title: 'Dijkstra vs. Bellman-Ford',
      description:
        'Use Dijkstra (/learn/dijkstra) when every weight is zero or positive and you want the faster heap-based search, O((V + E) log V) with a binary heap. Dijkstra is wrong as soon as any weight is negative, because a selected vertex is treated as finished. Use Bellman-Ford when a weight may be negative, or when you must detect a reachable negative cycle. Bellman-Ford is O(V × E), which is slower on the same non-negative graph, and it does not need a priority queue. Use BFS (/learn/graph-traversal) when every edge has the same positive cost: hop count is then the distance. If the graph is undirected and any edge has a negative weight, Bellman-Ford reports a negative cycle, because that edge can be crossed in both directions.',
    },
    {
      title: 'Practical Applications',
      description:
        'Distance-vector routing, the idea behind protocols such as RIP, is repeated relaxation: each router replaces its distance with a neighbor’s distance plus the link cost. A routing loop that keeps offering a “better” cost is the operational cousin of a negative cycle; real protocols add hop limits because they cannot let that loop run forever. A network link with a rebate or subsidy is a negative edge. The route is still well defined if you cannot circle back through that rebate. If a loop of rebates pays you every time you go around, no cheapest route exists. Currency arbitrage is the same picture on a tiny graph. Suppose 1 USD buys 1.1 EUR, 1 EUR buys 0.9 GBP, and 1 GBP buys 1.05 USD. The product 1.1 × 0.9 × 1.05 = 1.0395 is greater than 1, so the cycle multiplies money. Taking weights as the negative logarithm of each rate turns that product into a negative cycle. This lesson stops at that model. It does not build an exchange-rate application.',
    },
  ],

  thinkingGuide: {
    title: 'How to run Bellman-Ford by hand',
    description:
      'Work one edge at a time, then close the iteration. Do not treat a negative edge as a cycle until a pass after |V| - 1 still improves a distance.',
    steps: [
      'Write dist(source) = 0 and dist(everyone else) = ∞. Previous pointers start empty.',
      'List the edges in a fixed order. For an undirected edge, list both directions.',
      'For up to |V| - 1 passes, relax every edge: replace dist(v) only when dist(u) + w is strictly smaller, and then set previous(v) = u.',
      'If a whole pass changes nothing, stop. There is no reachable negative cycle.',
      'Otherwise relax every edge once more. Any distance that still falls marks a reachable negative cycle.',
      'Mark every vertex reachable from those updated vertices. Report −∞ there, and walk previous pointers only for vertices that stayed finite.',
    ],
  },

  complexity: {
    time: {
      best: 'O(V × E)',
      average: 'O(V × E)',
      worst: 'O(V × E)',
    },
    space: 'O(V) auxiliary',
    notes: {
      time: [
        'Up to |V| - 1 full passes each scan every edge, plus one detection pass when a clean pass never happened.',
        'Early termination can do fewer passes. The bound people quote is still O(V × E), because a graph can force every pass to update something.',
        'This assumes an adjacency-list scan of the edges. A matrix makes each pass O(V²) instead of O(E).',
      ],
      space: [
        'Distance, previous, and the affected-vertex search are O(V) extra memory. The graph is stored separately and is not mutated.',
        'The lesson stores an immutable copy of those tables on each animation frame so Previous can restore them. A production run only needs the latest tables.',
      ],
    },
  },

  pseudocode: `bellmanFord(graph, source, destination):
    if source is missing or any weight is not finite:
        return invalid

    for each vertex v:
        dist[v] = ∞
        previous[v] = none
    dist[source] = 0

    for iteration in 1 .. |V| - 1:
        updated = false
        for each edge u → v with weight w:
            if dist[u] is finite and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                previous[v] = u
                updated = true
        if not updated:
            break    // early stop; no reachable negative cycle

    if a full pass made no update:
        return finite distances and reconstructed paths

    affected = empty
    for each edge u → v with weight w:
        if dist[u] is finite and dist[u] + w < dist[v]:
            add v to affected
    add every vertex reachable from affected
    for each affected vertex v:
        dist[v] = −∞
        previous[v] = none
    return distances, paths, and the affected set`,

  code: {
    python: `def bellman_ford(graph: dict[str, list[tuple[str, float]]], source: str, destination: str):
    """graph maps each vertex to (neighbor, weight) pairs. Weights may be negative."""
    vertices = list(graph)
    dist = {vertex: float("inf") for vertex in vertices}
    previous = {vertex: None for vertex in vertices}
    dist[source] = 0
    edges = [(u, v, w) for u, nbrs in graph.items() for v, w in nbrs]

    updated = False
    for _ in range(max(len(vertices) - 1, 0)):
        updated = False
        for u, v, w in edges:
            if dist[u] != float("inf") and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                previous[v] = u
                updated = True
        if not updated:
            break

    affected = set()
    if updated or len(vertices) <= 1:
        # One extra pass: any improvement means a reachable negative cycle.
        for u, v, w in edges:
            if dist[u] != float("inf") and dist[u] + w < dist[v]:
                affected.add(v)
        stack = list(affected)
        while stack:
            u = stack.pop()
            for v, _w in graph.get(u, []):
                if v not in affected:
                    affected.add(v)
                    stack.append(v)

    if destination in affected:
        return {"path": [], "distance": float("-inf")}
    if destination == source and source not in affected:
        return {"path": [source], "distance": 0}
    if dist[destination] == float("inf"):
        return {"path": [], "distance": float("inf")}

    path = []
    cursor = destination
    while cursor is not None:
        path.append(cursor)
        if cursor == source:
            break
        cursor = previous[cursor]
    path.reverse()
    return {"path": path, "distance": dist[destination]}
`,
    javascript: `function bellmanFord(graph, source, destination) {
  const vertices = Object.keys(graph);
  const dist = new Map(vertices.map((vertex) => [vertex, Infinity]));
  const previous = new Map(vertices.map((vertex) => [vertex, null]));
  dist.set(source, 0);
  const edges = vertices.flatMap((from) =>
    graph[from].map(([to, weight]) => ({ from, to, weight })),
  );

  let updated = false;
  for (let pass = 0; pass < Math.max(vertices.length - 1, 0); pass += 1) {
    updated = false;
    for (const edge of edges) {
      const tail = dist.get(edge.from);
      if (!Number.isFinite(tail)) continue;
      const candidate = tail + edge.weight;
      if (candidate < dist.get(edge.to)) {
        dist.set(edge.to, candidate);
        previous.set(edge.to, edge.from);
        updated = true;
      }
    }
    if (!updated) break;
  }

  const affected = new Set();
  if (updated || vertices.length <= 1) {
    for (const edge of edges) {
      const tail = dist.get(edge.from);
      if (Number.isFinite(tail) && tail + edge.weight < dist.get(edge.to)) {
        affected.add(edge.to);
      }
    }
    const stack = [...affected];
    while (stack.length > 0) {
      const vertex = stack.pop();
      for (const [to] of graph[vertex] ?? []) {
        if (!affected.has(to)) {
          affected.add(to);
          stack.push(to);
        }
      }
    }
  }

  if (affected.has(destination)) return { path: [], distance: -Infinity };
  if (destination === source) return { path: [source], distance: 0 };
  const distance = dist.get(destination);
  if (!Number.isFinite(distance)) return { path: [], distance };

  const path = [];
  let cursor = destination;
  while (cursor) {
    path.push(cursor);
    if (cursor === source) break;
    cursor = previous.get(cursor);
  }
  path.reverse();
  return { path, distance };
}
`,
    typescript: `type Edge = { to: string; weight: number };

/**
 * Shortest paths from source.
 * A vertex affected by a reachable negative cycle gets distance -Infinity
 * and an empty path. Unreachable vertices stay Infinity.
 * Same rules as src/algorithms/graphs/bellmanFord.ts.
 */
export function bellmanFord(
  graph: ReadonlyMap<string, readonly Edge[]>,
  source: string,
  destination: string,
): { path: string[]; distance: number } {
  const vertices = [...graph.keys()];
  const dist = new Map(vertices.map((vertex) => [vertex, Number.POSITIVE_INFINITY]));
  const previous = new Map<string, string | null>(
    vertices.map((vertex) => [vertex, null]),
  );
  dist.set(source, 0);

  let updated = false;
  for (let pass = 0; pass < Math.max(vertices.length - 1, 0); pass += 1) {
    updated = false;
    for (const [from, edges] of graph) {
      const tail = dist.get(from) ?? Number.POSITIVE_INFINITY;
      if (!Number.isFinite(tail)) continue;
      for (const edge of edges) {
        const candidate = tail + edge.weight;
        const best = dist.get(edge.to) ?? Number.POSITIVE_INFINITY;
        if (candidate < best) {
          dist.set(edge.to, candidate);
          previous.set(edge.to, from);
          updated = true;
        }
      }
    }
    if (!updated) break;
  }

  const affected = new Set<string>();
  if (updated || vertices.length <= 1) {
    for (const [from, edges] of graph) {
      const tail = dist.get(from) ?? Number.POSITIVE_INFINITY;
      if (!Number.isFinite(tail)) continue;
      for (const edge of edges) {
        const best = dist.get(edge.to) ?? Number.POSITIVE_INFINITY;
        if (tail + edge.weight < best) affected.add(edge.to);
      }
    }
    const stack = [...affected];
    while (stack.length > 0) {
      const vertex = stack.pop();
      if (!vertex) continue;
      for (const edge of graph.get(vertex) ?? []) {
        if (!affected.has(edge.to)) {
          affected.add(edge.to);
          stack.push(edge.to);
        }
      }
    }
  }

  if (affected.has(destination)) {
    return { path: [], distance: Number.NEGATIVE_INFINITY };
  }
  if (destination === source) return { path: [source], distance: 0 };
  const distance = dist.get(destination) ?? Number.POSITIVE_INFINITY;
  if (!Number.isFinite(distance)) return { path: [], distance };

  const path: string[] = [];
  let cursor: string | null = destination;
  while (cursor) {
    path.push(cursor);
    if (cursor === source) break;
    cursor = previous.get(cursor) ?? null;
  }
  path.reverse();
  return { path, distance };
}
`,
  },

  whenToUse: [
    'You need shortest paths and at least one edge weight may be negative.',
    'You must know whether a negative cycle is reachable from the source.',
    'The graph is a small routing or exchange-rate model where O(V × E) is acceptable.',
    'You want distances from one source to every vertex, plus one reconstructed path for a chosen destination.',
  ],

  whenNotToUse: [
    'Every weight is non-negative and the graph is large. Dijkstra (/learn/dijkstra) is the faster algorithm and uses the priority queue from /learn/priority-queue.',
    'Every edge has the same positive cost. BFS on /learn/graph-traversal answers fewest hops with less machinery.',
    'You need a finite “shortest” walk that is allowed to loop a negative cycle. That cost is unbounded. Report the cycle instead of inventing a number.',
    'You only need to know whether any path exists. BFS or DFS is enough and ignores weights.',
  ],

  keyTakeaways: [
    'Bellman-Ford relaxes every edge once per pass, for at most |V| - 1 passes.',
    'A simple shortest path uses at most |V| - 1 edges, which is why that many passes are enough when no negative cycle is reachable.',
    'A negative edge can improve a path. A negative cycle means some vertices have no finite shortest path.',
    'A clean pass stops the algorithm early and proves no reachable negative cycle.',
    'An unreachable negative cycle leaves source distances unchanged. Do not confuse it with a negative edge.',
    'On an undirected graph each edge is relaxed both ways, so one negative undirected edge is a negative cycle.',
    'Affected vertices are reported as −∞ with an empty path. Other vertices keep finite distances or ∞.',
    'Time is O(V × E). Auxiliary space is O(V). Continue from Dijkstra (/learn/dijkstra) when every weight is non-negative.',
  ],

  previousLesson: {
    title: "Dijkstra's Algorithm",
    href: '/learn/dijkstra',
  },

  nextLesson: {
    title: 'Trie (Prefix Tree)',
    href: '/learn/trie',
  },

  categoryHref: '/data-structures',
}
