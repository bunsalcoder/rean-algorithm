import type { Lesson } from './types'

export const topologicalSort: Lesson = {
  slug: 'topological-sort',
  title: 'Topological Sorting',
  description:
    'Order a directed acyclic graph so every edge points forward. Compare Kahn’s indegree queue with DFS finishing times, and see why a cycle has no topological order.',
  category: 'Data Structures',
  difficulty: 'Intermediate',
  estimatedTime: '45 min',
  tags: [
    'Graph Algorithms',
    'Topological Sort',
    'DAG',
    'Kahn',
    'DFS',
    'Cycle Detection',
    'Intermediate',
  ],

  objectives: [
    'Explain a topological order: every directed edge goes from an earlier vertex to a later one.',
    'Tell a directed graph from a DAG, and state that only a DAG has a topological order.',
    'Read an edge A → B as “A must come before B”.',
    'Compute indegree and run Kahn’s algorithm with a queue of zero-indegree vertices.',
    'Run the DFS version, record vertices on the way back, and reverse the finishing list.',
    'Detect a directed cycle, including a self-loop, and refuse a partial list as an order.',
    'See why one DAG can have several valid orders, and why this lesson’s tie-break is deterministic.',
    'State O(V + E) time and O(V) auxiliary space for both algorithms on an adjacency list.',
  ],

  overview: [
    'Topological sorting lines up the vertices of a directed graph so that every arrow points forward. If the graph has an edge A → B, A appears before B in the order. That is the whole definition. The arrow is a dependency, not a distance.',
    'The order exists only when the graph is a directed acyclic graph, a DAG. A directed cycle means some vertex is still waiting on a vertex that is waiting on it. A self-loop is a cycle of length one. An undirected edge does not say which end comes first, so this lesson rejects undirected input instead of guessing a direction.',
    'Two algorithms produce a valid order when one exists. Kahn’s algorithm counts indegree and keeps a FIFO queue of vertices with indegree 0. The DFS version explores outgoing edges first, writes a vertex down when it backtracks, and reverses that finishing list. Both are O(V + E) on an adjacency list. On the course sample they disagree — Calc, Prog, Data, Phys, Algo versus Prog, Calc, Phys, Data, Algo — and both orders are correct.',
    'The playground uses the directed graphs from the Graph lesson (/learn/graph) and the same sorted neighbor order as Graph Traversal (/learn/graph-traversal). Step backward and forward through indegrees, the queue, the recursion path, and the order. The algorithm modules do not import React and do not edit the graph.',
  ],

  whyItMatters: [
    'Course prerequisites, build systems, task schedules, and package installs are the same picture: some work cannot start until other work has finished. An arrow stores that constraint. A topological order is one legal schedule.',
    'A cycle is not a minor error in that schedule. It means the constraints contradict each other. Reporting a partial list as if it were the order hides the contradiction.',
    'Kahn’s queue and the DFS finishing list are the two textbook ways to find the order. Seeing both on one graph shows that “the” topological order is often one of several.',
  ],

  visualization: {
    title: 'Queue the sources, or finish the dependencies and reverse',
    description:
      'Load a course plan, a build graph, a task list, a package install, a cycle, or a self-loop. Step through Kahn’s algorithm or DFS, or play both on the same directed graph. Add and remove vertices and arrows. An arrow means the source comes first.',
    type: 'topological-sort',
  },

  steps: [
    {
      title: 'What is Topological Sorting?',
      description:
        'A topological order is a list of every vertex exactly once such that, for every directed edge A → B, A appears somewhere before B. Nothing in the definition talks about edge weights or shortest paths. The list is a schedule that respects prerequisites. If the graph is empty, the only order is the empty list. If it has one vertex and no edges, the order is that vertex. If it has a cycle, there is no order at all.',
    },
    {
      title: 'Directed Graphs',
      description:
        'A directed edge has one direction. The Graph lesson (/learn/graph) stores it once, in the source vertex’s adjacency list. A → B is not the same edge as B → A. Topological sorting reads those outgoing lists and never writes them back. An undirected edge is stored in both directions because you may travel either way. That is not a dependency, so both algorithms stop and return status “undirected” with an empty order. The playground sample “Undirected (rejected)” is that case. Weights, when the graph has them, are ignored: the arrow is the constraint, not the number on it.',
    },
    {
      title: 'Directed Acyclic Graphs (DAGs)',
      description:
        'A cycle is a directed walk that returns to a vertex. A DAG is a directed graph with no cycle. Every DAG has at least one topological order, and the algorithms below find one. A graph that is almost a DAG is still not a DAG. In the cycle sample, D → A can be taken, and then A → B → C → A repeats. Kahn places D and then the queue dies. DFS follows D into A, B, and C and finds the back edge C → A. Either way the result order is empty. “Most of the vertices lined up” is not a topological order of the graph.',
    },
    {
      title: 'Dependency Relationships',
      description:
        'Read A → B as “A must come before B”, not “B must come before A”. In the course sample, Calc → Data means Calculus is a prerequisite of the data course. Prog → Algo means programming comes before algorithms. The same reading covers a build (Core → API means build Core first), a project (Plan → Code), and a package install (Base → Lib). If you draw the arrow backward, both algorithms will faithfully produce the opposite schedule. The bug is the picture, not the sort.',
    },
    {
      title: 'Valid Topological Ordering',
      description:
        'Check an order by walking every edge, not by staring at the list. Each vertex appears once, and for every edge the source’s index is strictly smaller than the target’s index. Calc, Prog, Data, Phys, Algo passes on the course graph: Calc is before Data and Phys, and Prog, Data, and Phys are all before Algo. Prog, Calc, Phys, Data, Algo also passes. A, B, C, D is the only order of the linear chain A → B → C → D, because each vertex has exactly one place it can sit. A list that skips a vertex, repeats one, or puts Algo before Calc is not valid, even if it looks sorted alphabetically.',
    },
    {
      title: 'Indegree of a Vertex',
      description:
        'Indegree is the number of arrows pointing at a vertex. Outdegree is the number pointing away. Kahn’s algorithm only needs indegree. In the course graph the counts start as Calc 0, Prog 0, Data 1, Phys 1, Algo 3. A vertex with indegree 0 has nothing that must come before it, so it is safe to place next. When Kahn processes Calc → Data, Data’s indegree falls from 1 to 0 and Data becomes safe. A self-loop adds one to a vertex’s own indegree, so that vertex cannot start at 0 and cannot be the start of a valid order. DFS does not update these counts. The playground still shows them beside the DFS run so you can compare the two views of the same graph.',
    },
    {
      title: "Kahn's Algorithm",
      description:
        'Kahn’s algorithm is a queue version of “take a vertex that is ready”. Count every indegree. Put the zeros into a FIFO queue, in vertex insertion order so the run is reproducible. Then repeat: dequeue the front, append it to the order, and for each outgoing neighbor in sorted id order, decrease that neighbor’s indegree. If the neighbor hits 0, enqueue it at the rear. On the course graph the queue starts as Calc, Prog. Dequeue Calc, and Data and Phys fall to 0, so they join behind Prog. The order grows Calc, Prog, Data, Phys, Algo. The arrows stay on the drawing; only the counts change. That is the “remove the edge” step, done with numbers so the original graph is untouched. If the queue empties before every vertex has been appended, the graph has a cycle. The function then returns an empty order. The vertices already appended are shown in the player as processed vertices, with an explicit note that they are not the answer.',
    },
    {
      title: 'DFS-Based Topological Sorting',
      description:
        'The DFS version does not use the queue. It starts at unvisited vertices in insertion order and explores outgoing neighbors in sorted id order, the same neighbor order as the DFS lesson (/learn/graph-traversal). It does not call that traversal directly. The traversal lesson records a vertex when it is first entered. A topological sort must wait. A vertex is written to the finishing list only after every vertex it points to has been finished. On the course graph, Algo finishes first because it is a dead end, then Data, Phys, Calc, and Prog. That list is the reverse of a topological order: dependents were recorded before the vertices that must precede them. Reversing it yields Prog, Calc, Phys, Data, Algo. The active path on the screen is the recursion stack. Backtracking is the pop that happens when a vertex finishes. This is why the result is reversed, and why appending on the way in would put a vertex before the work it unlocks.',
    },
    {
      title: 'Cycle Detection',
      description:
        'Kahn detects a cycle by counting. After the queue is empty, compare the number of appended vertices with V. Fewer than V means at least one vertex still has indegree above 0, and those vertices only point at each other. The cycle sample processes D (1 of 4) and stops. DFS detects a cycle with colors. A vertex on the active path is gray. A finished vertex is black. An edge into a gray vertex is a back edge, including a self-loop, because the vertex is gray while its own edges are explored. An edge into a black vertex is a forward or cross edge and is not a cycle. When a back edge appears, DFS stops. It does not reverse the partial finishing list. Both algorithms therefore distinguish “sorted” from “cycle”, and the cycle result’s order array is empty.',
    },
    {
      title: 'Multiple Valid Topological Orders',
      description:
        'A DAG can have many orders. Whenever two vertices are both ready, either one may come first, as long as later edges still hold. A and B both pointing at C allow A, B, C and B, A, C. Nothing in the graph prefers one. This lesson picks one deterministically. Kahn’s initial queue follows insertion order, and newly ready neighbors join in sorted id order. DFS starts roots in insertion order and explores neighbors in that same sorted order, then reverses. On A → C and B → C with vertices inserted A, B, C, Kahn returns A, B, C and DFS returns B, A, C. Change the insertion order or the neighbor order and a different valid list can appear. The comparison view runs both on the graph you are looking at and says when the two lists differ. Different does not mean one of them is wrong.',
    },
    {
      title: 'Time and Space Complexity',
      description:
        'Both algorithms look at each vertex and each adjacency-list edge a constant number of times, so the time is O(V + E). Kahn’s indegree array and queue are O(V). DFS’s color map, recursion stack, and finishing list are O(V). Those bounds count auxiliary memory. The graph is already stored and is not copied by the sort itself. A matrix representation would make a scan of “every edge” cost O(V²) instead, which is a different bound. The player keeps an immutable copy of the indegree map, queue, path, and lists on every frame so Previous can restore them. That history is for the lesson. A production run only needs the latest arrays. The queue in Kahn’s implementation is an array with a head index, so each vertex is enqueued and dequeued once. Using an array shift for every dequeue would still be correct and would hide an extra O(V) factor.',
    },
    {
      title: 'Real-world Applications',
      description:
        'Course prerequisites are the sample on screen: a later course lists earlier courses as incoming edges. A build system does the same with libraries. Core before API and UI, and those plus Util before App, is a compile order. Project scheduling uses the same arrows for tasks: Plan before Code and Docs, Code before Test, Test and Docs before Ship. Package installation orders Base before Lib before CLI and Plug. Spreadsheet formulas, Makefile targets, and university degree audits are the same DAG, often with more vertices. In each case the edge direction is the dependency direction you chose when you drew the graph. If the real constraints contain a cycle — a course that requires itself, two packages that each require the other — there is no install order to compute, and the honest result is “cycle”, not a best-effort prefix.',
    },
  ],

  thinkingGuide: {
    title: 'How to build an order by hand',
    description:
      'Stay with one algorithm until the queue is empty or the search returns. Then check every edge against the list.',
    steps: [
      'Confirm the graph is directed. If it is undirected, stop.',
      'For Kahn: write each indegree, queue the zeros in insertion order, and repeat dequeue, append, decrease neighbors.',
      'For DFS: follow outgoing edges first. Write the vertex down only when you backtrack. Reverse that list at the end.',
      'If Kahn processes fewer than V vertices, or DFS steps onto a gray vertex, report a cycle and throw away the partial list.',
      'Check the surviving list: one copy of every vertex, and every arrow points from left to right.',
    ],
  },

  complexity: {
    time: {
      best: 'O(V + E)',
      average: 'O(V + E)',
      worst: 'O(V + E)',
    },
    space: 'O(V) auxiliary',
    notes: {
      time: [
        'Kahn’s algorithm scans each vertex and each outgoing edge a constant number of times. The queue operations are O(1) each when the queue is an index into an array.',
        'DFS visits each vertex once and each edge once, plus a final reverse of the finishing list, which is O(V).',
        'Both bounds assume an adjacency list. Scanning a matrix for the same edges is O(V²) per full pass over possible pairs.',
      ],
      space: [
        'Indegree, the queue, DFS colors, the recursion stack, and the finishing list are all O(V). The graph is not mutated and is not counted again.',
        'The lesson stores a fresh copy of those tables on every animation frame so Previous restores them. A production run keeps only the current tables.',
      ],
    },
  },

  pseudocode: `topologicalSort(graph):
    if graph is undirected:
        return rejected, order = []

kahn(graph):
    indegree[v] = 0 for every vertex
    for each edge u → v:
        indegree[v] += 1
    queue = vertices with indegree 0, in insertion order
    order = []
    while queue is not empty:
        u = dequeue front
        append u to order
        for each neighbor v of u, in sorted id order:
            indegree[v] -= 1
            if indegree[v] == 0:
                enqueue v
    if order has fewer than V vertices:
        return cycle, order = []
    return sorted, order

dfsTopo(graph):
    color every vertex white
    finished = []
    for each vertex u in insertion order:
        if u is white: visit(u)
        if a cycle was found: return cycle, order = []

    visit(u):
        color[u] = gray
        for each neighbor v in sorted id order:
            if v is gray: cycle
            if v is white: visit(v)
        color[u] = black
        append u to finished

    return sorted, reverse(finished)`,

  code: {
    python: `def topological_sort_kahn(vertices: list[str], edges: list[tuple[str, str]]):
    """Edge (u, v) means u comes before v. None means a cycle."""
    adj = {vertex: [] for vertex in vertices}
    indegree = {vertex: 0 for vertex in vertices}
    for src, dst in edges:
        adj[src].append(dst)
        indegree[dst] += 1
    for src in adj:
        adj[src].sort()

    queue = [vertex for vertex in vertices if indegree[vertex] == 0]
    order = []
    head = 0
    while head < len(queue):
        src = queue[head]
        head += 1
        order.append(src)
        for dst in adj[src]:
            indegree[dst] -= 1
            if indegree[dst] == 0:
                queue.append(dst)
    if len(order) != len(vertices):
        return None
    return order


def topological_sort_dfs(vertices: list[str], edges: list[tuple[str, str]]):
    adj = {vertex: [] for vertex in vertices}
    for src, dst in edges:
        adj[src].append(dst)
    for src in adj:
        adj[src].sort()

    color = {vertex: "white" for vertex in vertices}
    finished = []

    def visit(src: str) -> bool:
        color[src] = "gray"
        for dst in adj[src]:
            if color[dst] == "gray":
                return True
            if color[dst] == "white" and visit(dst):
                return True
        color[src] = "black"
        finished.append(src)
        return False

    for vertex in vertices:
        if color[vertex] == "white" and visit(vertex):
            return None
    finished.reverse()
    return finished
`,
    javascript: `function topologicalSortKahn(vertices, edges) {
  const adj = new Map(vertices.map((vertex) => [vertex, []]))
  const indegree = new Map(vertices.map((vertex) => [vertex, 0]))
  for (const [src, dst] of edges) {
    adj.get(src).push(dst)
    indegree.set(dst, indegree.get(dst) + 1)
  }
  for (const neighbors of adj.values()) neighbors.sort()

  const queue = vertices.filter((vertex) => indegree.get(vertex) === 0)
  const order = []
  let head = 0
  while (head < queue.length) {
    const src = queue[head]
    head += 1
    order.push(src)
    for (const dst of adj.get(src)) {
      indegree.set(dst, indegree.get(dst) - 1)
      if (indegree.get(dst) === 0) queue.push(dst)
    }
  }
  return order.length === vertices.length ? order : null
}

function topologicalSortDfs(vertices, edges) {
  const adj = new Map(vertices.map((vertex) => [vertex, []]))
  for (const [src, dst] of edges) adj.get(src).push(dst)
  for (const neighbors of adj.values()) neighbors.sort()

  const color = new Map(vertices.map((vertex) => [vertex, "white"]))
  const finished = []

  function visit(src) {
    color.set(src, "gray")
    for (const dst of adj.get(src)) {
      if (color.get(dst) === "gray") return true
      if (color.get(dst) === "white" && visit(dst)) return true
    }
    color.set(src, "black")
    finished.push(src)
    return false
  }

  for (const vertex of vertices) {
    if (color.get(vertex) === "white" && visit(vertex)) return null
  }
  return finished.reverse()
}
`,
    typescript: `type Edge = readonly [string, string]

export function topologicalSortKahn(
  vertices: readonly string[],
  edges: readonly Edge[],
): string[] | null {
  const adj = new Map(vertices.map((vertex) => [vertex, [] as string[]]))
  const indegree = new Map(vertices.map((vertex) => [vertex, 0]))
  for (const [src, dst] of edges) {
    adj.get(src)?.push(dst)
    indegree.set(dst, (indegree.get(dst) ?? 0) + 1)
  }
  for (const neighbors of adj.values()) neighbors.sort()

  const queue = vertices.filter((vertex) => indegree.get(vertex) === 0)
  const order: string[] = []
  let head = 0
  while (head < queue.length) {
    const src = queue[head]!
    head += 1
    order.push(src)
    for (const dst of adj.get(src) ?? []) {
      const next = (indegree.get(dst) ?? 0) - 1
      indegree.set(dst, next)
      if (next === 0) queue.push(dst)
    }
  }
  return order.length === vertices.length ? order : null
}

export function topologicalSortDfs(
  vertices: readonly string[],
  edges: readonly Edge[],
): string[] | null {
  const adj = new Map(vertices.map((vertex) => [vertex, [] as string[]]))
  for (const [src, dst] of edges) adj.get(src)?.push(dst)
  for (const neighbors of adj.values()) neighbors.sort()

  const color = new Map(vertices.map((vertex) => [vertex, "white" as const]))
  const finished: string[] = []

  const visit = (src: string): boolean => {
    color.set(src, "gray")
    for (const dst of adj.get(src) ?? []) {
      const state = color.get(dst)
      if (state === "gray") return true
      if (state === "white" && visit(dst)) return true
    }
    color.set(src, "black")
    finished.push(src)
    return false
  }

  for (const vertex of vertices) {
    if (color.get(vertex) === "white" && visit(vertex)) return null
  }
  return finished.reverse()
}
`,
  },

  algorithmConnection: {
    title: "Kahn and DFS on one DAG",
    eyebrow: 'Same constraints, two schedules',
    description:
      'Both algorithms read the same arrows. They break ties in different places, so the lists can differ without either one violating an edge.',
    items: [
      {
        title: "Kahn's algorithm",
        description:
          'A queue of vertices whose indegree has fallen to 0. A vertex joins the order when it is dequeued, which is when every prerequisite is already in the list. A cycle shows up as a queue that empties too soon. The course sample produces Calc, Prog, Data, Phys, Algo.',
      },
      {
        title: 'DFS finishing times',
        description:
          'The active path is the recursion stack. A vertex is appended after its outgoing edges, so the finishing list is backward. Reverse it. A back edge into that path is a cycle, and the reversed partial list is not returned. The course sample produces Prog, Calc, Phys, Data, Algo.',
      },
      {
        title: 'What stays the same',
        description:
          'Directed input, sorted neighbor ids, one copy of every vertex, and every edge pointing forward. Time O(V + E) and auxiliary space O(V) on an adjacency list. Undirected graphs are rejected by both. A cycle yields an empty order from both, even when the processed counts differ.',
      },
    ],
  },

  commonMistakes: {
    description:
      'These are the mistakes that produce a list which looks ordered and still breaks a dependency.',
    mistakes: [
      {
        title: 'Reading the arrow backward',
        explanation:
          'A → B means A comes before B. Treating the arrow as “points at the prerequisite” reverses every constraint. Both algorithms will then faithfully emit the wrong schedule.',
      },
      {
        title: 'Returning Kahn’s partial list after a cycle',
        explanation:
          'Vertices dequeued before the queue died respected the edges among themselves. They are not an order of the whole graph. The remaining vertices still have a cycle. The result order must be empty.',
      },
      {
        title: 'Forgetting to reverse the DFS finishing list',
        explanation:
          'A vertex is recorded after the vertices it points to. That list has dependents first. The topological order is the reverse. Skipping the reverse puts Algo before Calc on the course graph.',
      },
      {
        title: 'Sorting an undirected graph by picking a direction',
        explanation:
          'An undirected edge can be walked either way, so it is not a precedence constraint. Inventing A → B because A was inserted first is a different graph. Reject the input.',
      },
      {
        title: 'Assuming the order is unique',
        explanation:
          'Two zero-indegree vertices may be taken in either order. Kahn and DFS disagree on the course sample, and both lists are valid. Uniqueness holds for a single path, not for a general DAG.',
      },
    ],
  },

  whenToUse: [
    'You need one order of tasks, courses, packages, or build targets that respects “A before B” arrows.',
    'The graph is directed, and you can reject it when a cycle or an undirected edge shows up.',
    'You want to explain a schedule with either a queue of ready tasks (Kahn) or a depth-first walk that finishes dependencies first.',
    'Several legal schedules are acceptable, and a deterministic tie-break is enough.',
  ],

  whenNotToUse: [
    'You need a shortest path. Equal edge costs use BFS on /learn/graph-traversal. Non-negative weights use Dijkstra (/learn/dijkstra). Negative weights use Bellman-Ford (/learn/bellman-ford). Every pair uses Floyd-Warshall (/learn/floyd-warshall).',
    'The graph is undirected. A topological order is not defined until you replace each edge with a real precedence.',
    'The constraints contain a directed cycle. There is no order to compute. Fix the cycle, or report it.',
    'You need every valid order, not one of them. Both algorithms return a single order determined by insertion order and sorted neighbor ids.',
  ],

  keyTakeaways: [
    'An edge A → B means A comes before B. A topological order lists every vertex once and keeps every edge pointing forward.',
    'That order exists exactly when the directed graph has no cycle. A self-loop is a cycle. An undirected graph is rejected.',
    'Kahn’s algorithm queues indegree 0, appends the front, and decreases neighbors. Fewer than V vertices means a cycle, and the order is empty.',
    'DFS appends a vertex after its outgoing edges. Reverse the finishing list. A back edge to a gray vertex is a cycle, and that partial list is not an order.',
    'Several orders can be valid. This lesson’s insertion order and sorted neighbor ids make each algorithm reproducible, and they can still disagree.',
    'Both are O(V + E) time and O(V) auxiliary space on an adjacency list. The graph is not mutated.',
    'Courses, builds, task schedules, and package installs are the same DAG. The arrow direction is the dependency you meant.',
  ],

  previousLesson: {
    title: 'Floyd-Warshall Algorithm',
    href: '/learn/floyd-warshall',
  },

  nextLesson: {
    title: 'Trie (Prefix Tree)',
    href: '/learn/trie',
  },

  categoryHref: '/data-structures',
}
