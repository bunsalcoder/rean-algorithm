/**
 * Kahn's algorithm — topological sort by indegree and a FIFO queue.
 *
 * 1. Count the indegree of every vertex.
 * 2. Enqueue every vertex whose indegree is 0 (vertex insertion order).
 * 3. Dequeue one vertex and append it to the order.
 * 4. For each outgoing edge, in sorted neighbor-id order, decrease that
 *    neighbor's indegree. A neighbor that reaches 0 joins the queue.
 * 5. Repeat until the queue is empty.
 *
 * If fewer than V vertices are appended, the directed graph has a cycle.
 * The returned `order` is empty in that case. A partial list is not a
 * topological order.
 *
 * Undirected graphs are rejected. Weights are ignored. The input snapshot
 * is not mutated. Adjacency-list cost: time O(V + E), auxiliary space O(V).
 * Independent of React.
 */

import {
  getVertices,
  type GraphSnapshot,
  type VertexId,
} from '../data-structures/graph'
import type { VisualizationStep } from '../../components/visualizations/types'
import { orderedNeighborIds, serializeGraphSnapshot } from './traversalShared'
import {
  cycleTopologicalMessage,
  indegreeRecord,
  pushTopoStep,
  sortedTopologicalMessage,
  undirectedTopologicalResult,
  type TopologicalSortResult,
} from './topologicalSortShared'

function countIndegrees(
  snapshot: GraphSnapshot,
  vertices: readonly VertexId[],
): Map<VertexId, number> {
  const indegree = new Map<VertexId, number>()
  for (const vertex of vertices) {
    indegree.set(vertex, 0)
  }
  for (const vertex of vertices) {
    for (const neighbor of orderedNeighborIds(snapshot, vertex)) {
      if (!indegree.has(neighbor)) continue
      indegree.set(neighbor, (indegree.get(neighbor) ?? 0) + 1)
    }
  }
  return indegree
}

function zeroIndegreeVertices(
  vertices: readonly VertexId[],
  indegree: ReadonlyMap<VertexId, number>,
): VertexId[] {
  const queue: VertexId[] = []
  for (const vertex of vertices) {
    if ((indegree.get(vertex) ?? 0) === 0) {
      queue.push(vertex)
    }
  }
  return queue
}

/**
 * Kahn's algorithm. `order` is a valid topological order, or empty when
 * the graph is undirected or contains a directed cycle.
 */
export function topologicalSortKahn(
  snapshot: GraphSnapshot,
): TopologicalSortResult {
  const vertices = getVertices(snapshot)
  if (!snapshot.directed) {
    return undirectedTopologicalResult(vertices.length)
  }

  const indegree = countIndegrees(snapshot, vertices)
  const queue = zeroIndegreeVertices(vertices, indegree)
  const order: VertexId[] = []
  let head = 0

  while (head < queue.length) {
    const current = queue[head]!
    head += 1
    order.push(current)
    for (const neighbor of orderedNeighborIds(snapshot, current)) {
      const next = (indegree.get(neighbor) ?? 0) - 1
      indegree.set(neighbor, next)
      if (next === 0) {
        queue.push(neighbor)
      }
    }
  }

  if (order.length !== vertices.length) {
    return {
      status: 'cycle',
      order: [],
      message: cycleTopologicalMessage(order.length, vertices.length),
      processedCount: order.length,
      vertexCount: vertices.length,
    }
  }

  return {
    status: 'sorted',
    order,
    message: sortedTopologicalMessage(order),
    processedCount: order.length,
    vertexCount: vertices.length,
  }
}

/**
 * Immutable playback frames for Kahn's algorithm.
 * Each frame stores its own indegree map, queue, and order strings.
 */
export function buildKahnSteps(snapshot: GraphSnapshot): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const vertices = getVertices(snapshot)
  const graphSnapshot = serializeGraphSnapshot(snapshot)
  let counter = 0

  const nextId = (phase: string) => {
    counter += 1
    return `kahn-${phase}-${counter}`
  }

  if (!snapshot.directed) {
    const message = undirectedTopologicalResult(vertices.length).message
    pushTopoStep(steps, {
      id: nextId('undirected'),
      title: 'Undirected graph rejected',
      explanation:
        'Kahn’s algorithm counts incoming arrows. An undirected edge has no “before” endpoint, so it is not a dependency. The sort stops before any queue is built.',
      detail: message,
      algorithm: 'kahn',
      phase: 'undirected',
      status: 'undirected',
      graphSnapshot,
      indegrees: {},
      indegreeLive: false,
      queue: [],
      path: [],
      placement: [],
      finishing: [],
      resultOrder: [],
      activeEdge: null,
      relaxedEdges: [],
      visited: [],
      cycleVertices: [],
      message,
      processedCount: 0,
      vertexCount: vertices.length,
      complete: true,
    })
    return steps
  }

  pushTopoStep(steps, {
    id: nextId('initialize'),
    title: 'Kahn’s algorithm',
    explanation:
      'An edge A → B means A must come before B. Kahn’s algorithm repeatedly takes a vertex with no remaining prerequisites and then removes its outgoing edges from the indegree counts.',
    detail:
      vertices.length === 0
        ? 'The directed graph has no vertices.'
        : 'Zero-indegree vertices are queued in insertion order. Neighbors are processed in sorted id order.',
    algorithm: 'kahn',
    phase: 'initialize',
    status: 'running',
    graphSnapshot,
    indegrees: {},
    indegreeLive: true,
    queue: [],
    path: [],
    placement: [],
    finishing: [],
    resultOrder: [],
    activeEdge: null,
    relaxedEdges: [],
    visited: [],
    cycleVertices: [],
    message: 'Count indegrees next.',
    processedCount: 0,
    vertexCount: vertices.length,
    complete: false,
  })

  if (vertices.length === 0) {
    const message = sortedTopologicalMessage([])
    pushTopoStep(steps, {
      id: nextId('complete'),
      title: 'Empty order',
      explanation:
        'An empty directed graph is a DAG. Its only topological order is the empty list.',
      detail: message,
      algorithm: 'kahn',
      phase: 'complete',
      status: 'sorted',
      graphSnapshot,
      indegrees: {},
      indegreeLive: true,
      queue: [],
      path: [],
      placement: [],
      finishing: [],
      resultOrder: [],
      activeEdge: null,
      relaxedEdges: [],
      visited: [],
      cycleVertices: [],
      message,
      processedCount: 0,
      vertexCount: 0,
      complete: true,
    })
    return steps
  }

  const indegree = countIndegrees(snapshot, vertices)
  const indegrees = () => indegreeRecord(indegree, vertices)

  pushTopoStep(steps, {
    id: nextId('indegree'),
    title: 'Initial indegrees',
    explanation:
      'Indegree is the number of arrows pointing at a vertex. Each outgoing adjacency entry adds one to its target. A self-loop counts. Weights do not.',
    detail: vertices
      .map((vertex) => `${vertex}: ${indegree.get(vertex) ?? 0}`)
      .join(' · '),
    algorithm: 'kahn',
    phase: 'indegree',
    status: 'running',
    graphSnapshot,
    indegrees: indegrees(),
    indegreeLive: true,
    queue: [],
    path: [],
    placement: [],
    finishing: [],
    resultOrder: [],
    activeEdge: null,
    relaxedEdges: [],
    visited: [],
    cycleVertices: [],
    message: 'Indegrees are ready.',
    processedCount: 0,
    vertexCount: vertices.length,
    complete: false,
  })

  const queue = zeroIndegreeVertices(vertices, indegree)
  let head = 0
  const placement: VertexId[] = []
  const relaxed: { from: VertexId; to: VertexId }[] = []

  pushTopoStep(steps, {
    id: nextId('seed-queue'),
    title: 'Queue the sources',
    explanation:
      'Every vertex with indegree 0 has no prerequisites left. They enter the FIFO queue in the order the vertices were inserted. The front of the queue is the next vertex to place.',
    detail:
      queue.length === 0
        ? 'No vertex has indegree 0. The graph has a cycle before anything can be ordered.'
        : `Queue (front → rear): ${queue.join(', ')}`,
    algorithm: 'kahn',
    phase: 'seed-queue',
    status: 'running',
    graphSnapshot,
    indegrees: indegrees(),
    indegreeLive: true,
    queue: [...queue],
    path: [],
    placement: [],
    finishing: [],
    resultOrder: [],
    activeEdge: null,
    relaxedEdges: [],
    visited: [],
    cycleVertices: [],
    message:
      queue.length === 0
        ? 'The queue started empty.'
        : `Enqueued ${queue.join(', ')}.`,
    processedCount: 0,
    vertexCount: vertices.length,
    complete: false,
  })

  while (head < queue.length) {
    const current = queue[head]!
    head += 1
    const waiting = queue.slice(head)

    pushTopoStep(steps, {
      id: nextId('dequeue'),
      title: `Dequeue ${current}`,
      explanation: `${current} is at the front of the queue, so every prerequisite of ${current} has already been ordered. Remove it from the queue. It is not in the order yet — the next frame appends it.`,
      detail:
        waiting.length === 0
          ? 'The queue is now empty.'
          : `Queue now: ${waiting.join(', ')}`,
      algorithm: 'kahn',
      phase: 'dequeue',
      currentVertex: current,
      status: 'running',
      graphSnapshot,
      indegrees: indegrees(),
      indegreeLive: true,
      queue: waiting,
      path: [],
      placement: [...placement],
      finishing: [],
      resultOrder: [],
      activeEdge: null,
      relaxedEdges: [...relaxed],
      visited: [...placement],
      cycleVertices: [],
      message: `Dequeued ${current}.`,
      processedCount: placement.length,
      vertexCount: vertices.length,
      complete: false,
    })

    placement.push(current)

    pushTopoStep(steps, {
      id: nextId('append'),
      title: `Append ${current}`,
      explanation: `Append ${current} to the order. Everything already in the order comes before ${current}, which matches the edges that pointed at it.`,
      detail: `Order so far: ${placement.join(', ')}`,
      algorithm: 'kahn',
      phase: 'append',
      currentVertex: current,
      status: 'running',
      graphSnapshot,
      indegrees: indegrees(),
      indegreeLive: true,
      queue: queue.slice(head),
      path: [],
      placement: [...placement],
      finishing: [],
      resultOrder: [],
      activeEdge: null,
      relaxedEdges: [...relaxed],
      visited: [...placement],
      cycleVertices: [],
      message: `Placed ${current}.`,
      processedCount: placement.length,
      vertexCount: vertices.length,
      complete: false,
    })

    const neighbors = orderedNeighborIds(snapshot, current)
    if (neighbors.length === 0) {
      pushTopoStep(steps, {
        id: nextId('no-outgoing'),
        title: `${current} has no outgoing edges`,
        explanation: `Nothing depends on ${current}. There is no indegree to decrease. Continue with the queue.`,
        algorithm: 'kahn',
        phase: 'no-outgoing',
        currentVertex: current,
        status: 'running',
        graphSnapshot,
        indegrees: indegrees(),
        indegreeLive: true,
        queue: queue.slice(head),
        path: [],
        placement: [...placement],
        finishing: [],
        resultOrder: [],
        activeEdge: null,
        relaxedEdges: [...relaxed],
        visited: [...placement],
        cycleVertices: [],
        message: `${current} has out-degree 0.`,
        processedCount: placement.length,
        vertexCount: vertices.length,
        complete: false,
      })
    }

    for (const neighbor of neighbors) {
      const before = indegree.get(neighbor) ?? 0
      const after = before - 1
      indegree.set(neighbor, after)
      relaxed.push({ from: current, to: neighbor })

      pushTopoStep(steps, {
        id: nextId('relax-edge'),
        title: `Edge ${current} → ${neighbor}`,
        explanation: `Process ${current} → ${neighbor}. That edge was one prerequisite of ${neighbor}, so its indegree falls from ${before} to ${after}. The graph drawing keeps the arrow; the count is what changes.`,
        detail:
          after === 0
            ? `${neighbor} now has indegree 0, so it will enter the queue.`
            : after < 0
              ? `${neighbor} was decremented below zero. The adjacency list had an unexpected extra edge.`
              : `${neighbor} still has ${after} prerequisite${after === 1 ? '' : 's'} left.`,
        algorithm: 'kahn',
        phase: 'relax-edge',
        currentVertex: current,
        status: 'running',
        graphSnapshot,
        indegrees: indegrees(),
        indegreeLive: true,
        queue: queue.slice(head),
        path: [],
        placement: [...placement],
        finishing: [],
        resultOrder: [],
        activeEdge: { from: current, to: neighbor },
        relaxedEdges: [...relaxed],
        visited: [...placement],
        cycleVertices: [],
        message: `${neighbor} indegree ${before} → ${after}.`,
        processedCount: placement.length,
        vertexCount: vertices.length,
        complete: false,
      })

      if (after === 0) {
        queue.push(neighbor)
        pushTopoStep(steps, {
          id: nextId('enqueue'),
          title: `Enqueue ${neighbor}`,
          explanation: `${neighbor} has no remaining incoming edges, so every vertex that must come before it is already in the order. Add ${neighbor} at the rear of the queue.`,
          detail: `Queue (front → rear): ${queue.slice(head).join(', ')}`,
          algorithm: 'kahn',
          phase: 'enqueue',
          currentVertex: current,
          status: 'running',
          graphSnapshot,
          indegrees: indegrees(),
          indegreeLive: true,
          queue: queue.slice(head),
          path: [],
          placement: [...placement],
          finishing: [],
          resultOrder: [],
          activeEdge: { from: current, to: neighbor },
          relaxedEdges: [...relaxed],
          visited: [...placement],
          cycleVertices: [],
          message: `Enqueued ${neighbor}.`,
          processedCount: placement.length,
          vertexCount: vertices.length,
          complete: false,
        })
      }
    }
  }

  if (placement.length !== vertices.length) {
    const stuck = vertices.filter((vertex) => !placement.includes(vertex))
    const message = cycleTopologicalMessage(placement.length, vertices.length)
    pushTopoStep(steps, {
      id: nextId('cycle'),
      title: 'Cycle detected',
      explanation: `The queue is empty and only ${placement.length} of ${vertices.length} vertices were ordered. The remaining vertices still have indegree above 0, so each is waiting on another remaining vertex. That is a directed cycle. The vertices placed so far are not returned as a topological order.`,
      detail: `Still blocked: ${stuck
        .map((vertex) => `${vertex} (indegree ${indegree.get(vertex) ?? 0})`)
        .join(', ')}`,
      algorithm: 'kahn',
      phase: 'cycle',
      status: 'cycle',
      graphSnapshot,
      indegrees: indegrees(),
      indegreeLive: true,
      queue: [],
      path: [],
      placement: [...placement],
      finishing: [],
      resultOrder: [],
      activeEdge: null,
      relaxedEdges: [...relaxed],
      visited: [...placement],
      cycleVertices: stuck,
      message,
      processedCount: placement.length,
      vertexCount: vertices.length,
      complete: true,
    })
    return steps
  }

  const message = sortedTopologicalMessage(placement)
  pushTopoStep(steps, {
    id: nextId('complete'),
    title: 'Topological order',
    explanation: `Every vertex was dequeued, so the graph is a DAG. ${placement.join(', ')} is one valid order: each arrow goes from an earlier vertex to a later one. Another queue tie-break can produce a different valid order.`,
    detail: message,
    algorithm: 'kahn',
    phase: 'complete',
    status: 'sorted',
    graphSnapshot,
    indegrees: indegrees(),
    indegreeLive: true,
    queue: [],
    path: [],
    placement: [...placement],
    finishing: [],
    resultOrder: [...placement],
    activeEdge: null,
    relaxedEdges: [...relaxed],
    visited: [...placement],
    cycleVertices: [],
    message,
    processedCount: placement.length,
    vertexCount: vertices.length,
    complete: true,
  })

  return steps
}
