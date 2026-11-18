/**
 * DFS-based topological sort.
 *
 * Explore outgoing edges before recording a vertex. The finishing list is
 * therefore a post-order: a vertex is appended only after everything it
 * points to has been finished. Reversing that list puts prerequisites first,
 * which is what an edge A → B requires (A before B).
 *
 * A neighbor that is still on the active recursion path is a back edge.
 * That directed cycle means no topological order exists. The finishing list
 * collected before the back edge is not returned as an order.
 *
 * Search roots and neighbors follow the same deterministic order as the
 * Graph and DFS lessons: insertion order for new roots, sorted neighbor ids
 * for edges. This is a separate search from `depthFirstSearch`, which records
 * a vertex when it is first entered and does not track finishing times.
 *
 * Undirected graphs are rejected. The input snapshot is not mutated.
 * Adjacency-list cost: time O(V + E), auxiliary space O(V).
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

const WHITE = 0
const GRAY = 1
const BLACK = 2

type Color = typeof WHITE | typeof GRAY | typeof BLACK

function referenceIndegrees(
  snapshot: GraphSnapshot,
  vertices: readonly VertexId[],
): Record<string, number> {
  const indegree = new Map<VertexId, number>()
  for (const vertex of vertices) indegree.set(vertex, 0)
  for (const vertex of vertices) {
    for (const neighbor of orderedNeighborIds(snapshot, vertex)) {
      if (!indegree.has(neighbor)) continue
      indegree.set(neighbor, (indegree.get(neighbor) ?? 0) + 1)
    }
  }
  return indegreeRecord(indegree, vertices)
}

/**
 * DFS topological sort. `order` is the reversed finishing list, or empty
 * when the graph is undirected or contains a directed cycle.
 */
export function topologicalSortDfs(
  snapshot: GraphSnapshot,
): TopologicalSortResult {
  const vertices = getVertices(snapshot)
  if (!snapshot.directed) {
    return undirectedTopologicalResult(vertices.length)
  }

  const color = new Map<VertexId, Color>()
  for (const vertex of vertices) color.set(vertex, WHITE)
  const finished: VertexId[] = []
  let cyclic = false

  const visit = (vertex: VertexId) => {
    color.set(vertex, GRAY)
    for (const neighbor of orderedNeighborIds(snapshot, vertex)) {
      const state = color.get(neighbor) ?? WHITE
      if (state === GRAY) {
        cyclic = true
        return
      }
      if (state === WHITE) {
        visit(neighbor)
        if (cyclic) return
      }
    }
    color.set(vertex, BLACK)
    finished.push(vertex)
  }

  for (const vertex of vertices) {
    if (cyclic) break
    if ((color.get(vertex) ?? WHITE) === WHITE) {
      visit(vertex)
    }
  }

  if (cyclic) {
    return {
      status: 'cycle',
      order: [],
      message: cycleTopologicalMessage(finished.length, vertices.length),
      processedCount: finished.length,
      vertexCount: vertices.length,
    }
  }

  const order = [...finished].reverse()
  return {
    status: 'sorted',
    order,
    message: sortedTopologicalMessage(order),
    processedCount: order.length,
    vertexCount: vertices.length,
  }
}

type Frame = {
  vertex: VertexId
  nextNeighborIndex: number
  entered: boolean
}

/**
 * Immutable playback frames for the DFS finishing-time sort.
 * The active path is the recursion stack. Vertices are recorded on the way
 * back, then the finishing list is reversed.
 */
export function buildDfsTopoSteps(
  snapshot: GraphSnapshot,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const vertices = getVertices(snapshot)
  const graphSnapshot = serializeGraphSnapshot(snapshot)
  const indegrees = snapshot.directed
    ? referenceIndegrees(snapshot, vertices)
    : {}
  let counter = 0

  const nextId = (phase: string) => {
    counter += 1
    return `dfs-topo-${phase}-${counter}`
  }

  if (!snapshot.directed) {
    const message = undirectedTopologicalResult(vertices.length).message
    pushTopoStep(steps, {
      id: nextId('undirected'),
      title: 'Undirected graph rejected',
      explanation:
        'DFS topological sort follows outgoing arrows and records a vertex after those arrows are explored. An undirected edge does not name a direction, so the search is not run.',
      detail: message,
      algorithm: 'dfs',
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
    title: 'DFS topological sort',
    explanation:
      'Depth-first search follows one outgoing path completely, then backtracks. A vertex is written to the finishing list only after each vertex it points to has been finished. The topological order is that list reversed, so an edge A → B places A before B.',
    detail:
      vertices.length === 0
        ? 'The directed graph has no vertices.'
        : 'New roots follow insertion order. Neighbors follow sorted id order. Indegrees are shown for comparison and are not updated by DFS.',
    algorithm: 'dfs',
    phase: 'initialize',
    status: 'running',
    graphSnapshot,
    indegrees,
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
    message: 'Start depth-first search.',
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
        'An empty directed graph is a DAG. Reversing an empty finishing list is still empty.',
      detail: message,
      algorithm: 'dfs',
      phase: 'complete',
      status: 'sorted',
      graphSnapshot,
      indegrees,
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
      vertexCount: 0,
      complete: true,
    })
    return steps
  }

  const color = new Map<VertexId, Color>()
  for (const vertex of vertices) color.set(vertex, WHITE)
  const finished: VertexId[] = []
  const traversed: { from: VertexId; to: VertexId }[] = []

  const visitedNow = () =>
    vertices.filter((vertex) => (color.get(vertex) ?? WHITE) !== WHITE)
  const pathOf = (frames: readonly Frame[]) => frames.map((frame) => frame.vertex)

  const emit = (
    phase: Parameters<typeof pushTopoStep>[1]['phase'],
    title: string,
    explanation: string,
    frames: readonly Frame[],
    extra: {
      detail?: string
      activeEdge?: { from: VertexId; to: VertexId } | null
      status?: 'running' | 'sorted' | 'cycle'
      resultOrder?: readonly VertexId[]
      cycleVertices?: readonly VertexId[]
      currentVertex?: VertexId | null
      message: string
      complete?: boolean
    },
  ) => {
    const status = extra.status ?? 'running'
    const currentVertex =
      extra.currentVertex !== undefined
        ? extra.currentVertex
        : (frames[frames.length - 1]?.vertex ?? null)
    pushTopoStep(steps, {
      id: nextId(phase),
      title,
      explanation,
      detail: extra.detail,
      algorithm: 'dfs',
      phase,
      status,
      currentVertex,
      graphSnapshot,
      indegrees,
      indegreeLive: false,
      queue: [],
      path: pathOf(frames),
      placement: [],
      finishing: [...finished],
      resultOrder: extra.resultOrder ? [...extra.resultOrder] : [],
      activeEdge: extra.activeEdge ?? null,
      relaxedEdges: [...traversed],
      visited: visitedNow(),
      cycleVertices: extra.cycleVertices ? [...extra.cycleVertices] : [],
      message: extra.message,
      processedCount: finished.length,
      vertexCount: vertices.length,
      complete: extra.complete ?? false,
    })
  }

  const visit = (seed: VertexId, resume: boolean): VertexId[] | null => {
    if (resume) {
      emit(
        'next-component',
        `New root ${seed}`,
        `${seed} was not reached from an earlier root. Directed graphs can have several components. Start a fresh depth-first search here. Insertion order decides which unvisited vertex is next.`,
        [],
        { currentVertex: seed, message: `Start at ${seed}.` },
      )
    }

    const frames: Frame[] = [
      { vertex: seed, nextNeighborIndex: 0, entered: false },
    ]

    while (frames.length > 0) {
      const frame = frames[frames.length - 1]!
      const current = frame.vertex

      if (!frame.entered) {
        color.set(current, GRAY)
        frame.entered = true
        emit(
          'enter',
          `Enter ${current}`,
          `${current} is now on the active recursion path (gray). Its outgoing edges will be explored before it is recorded. Recording it now would be too early: the vertices it must precede are not finished.`,
          frames,
          {
            detail: `Active path: ${pathOf(frames).join(' → ')}`,
            message: `Entered ${current}.`,
          },
        )
      }

      const neighbors = orderedNeighborIds(snapshot, current)
      let advanced = false

      while (frame.nextNeighborIndex < neighbors.length) {
        const neighbor = neighbors[frame.nextNeighborIndex]!
        frame.nextNeighborIndex += 1
        const state = color.get(neighbor) ?? WHITE
        const edge = { from: current, to: neighbor }

        if (state === GRAY) {
          const path = pathOf(frames)
          const cycleStart = path.indexOf(neighbor)
          const cycleVertices =
            cycleStart === -1 ? [neighbor, current] : path.slice(cycleStart)
          emit(
            'back-edge',
            `Back edge ${current} → ${neighbor}`,
            `${neighbor} is still on the active path, so ${current} → ${neighbor} closes a directed cycle. DFS stops. Vertices already finished are not a topological order, and the unfinished path is not appended.`,
            frames,
            {
              detail: `Cycle through ${cycleVertices.join(' → ')} → ${neighbor}.`,
              activeEdge: edge,
              status: 'cycle',
              cycleVertices,
            message: `Cycle on ${current} → ${neighbor}.`,
            complete: false,
          },
        )
        return cycleVertices
      }

        if (state === BLACK) {
          emit(
            'skip-finished',
            `Skip finished ${neighbor}`,
            `${neighbor} is already finished (black). ${current} → ${neighbor} is a forward or cross edge, not a cycle. Leave it out of the recursion stack.`,
            frames,
            {
              activeEdge: edge,
              message: `${neighbor} is already finished.`,
            },
          )
          continue
        }

        traversed.push(edge)
        frames.push({
          vertex: neighbor,
          nextNeighborIndex: 0,
          entered: false,
        })
        advanced = true
        emit(
          'explore',
          `Explore ${current} → ${neighbor}`,
          `Go deeper along ${current} → ${neighbor}. ${neighbor} has not been visited. The call stack grows, the same way a recursive call would.`,
          frames,
          {
            detail: `Active path: ${pathOf(frames).join(' → ')}`,
            activeEdge: edge,
            message: `Descend to ${neighbor}.`,
          },
        )
        break
      }

      if (!advanced && frame.nextNeighborIndex >= neighbors.length) {
        frames.pop()
        color.set(current, BLACK)
        finished.push(current)
        const parent = frames.length > 0 ? frames[frames.length - 1]!.vertex : null
        emit(
          'finish',
          `Finish ${current}`,
          `Every outgoing neighbor of ${current} is finished or already black, so record ${current} now. It sits after those neighbors in the finishing list. The topological order reverses this list, which puts ${current} before the vertices it points to. ${parent ? `Backtrack to ${parent}.` : 'The recursion stack is empty.'}`,
          frames,
          {
            detail: `Finishing list: ${finished.join(', ')}`,
            currentVertex: current,
            message: `Finished ${current}.`,
          },
        )
      }
    }

    return null
  }

  let cycleVertices: VertexId[] | null = null
  let roots = 0
  for (const vertex of vertices) {
    if ((color.get(vertex) ?? WHITE) !== WHITE) continue
    cycleVertices = visit(vertex, roots > 0)
    roots += 1
    if (cycleVertices) break
  }

  if (cycleVertices) {
    const message = cycleTopologicalMessage(finished.length, vertices.length)
    pushTopoStep(steps, {
      id: nextId('cycle'),
      title: 'No topological order',
      explanation:
        'A back edge reached a vertex that is still on the active path. The directed graph is not a DAG. The result is empty. Do not reverse the partial finishing list and call it an order.',
      detail: message,
      algorithm: 'dfs',
      phase: 'cycle',
      status: 'cycle',
      graphSnapshot,
      indegrees,
      indegreeLive: false,
      queue: [],
      path: [],
      placement: [],
      finishing: [...finished],
      resultOrder: [],
      activeEdge: null,
      relaxedEdges: [...traversed],
      visited: visitedNow(),
      cycleVertices: [...cycleVertices],
      message,
      processedCount: finished.length,
      vertexCount: vertices.length,
      complete: true,
    })
    return steps
  }

  const order = [...finished].reverse()
  emit(
    'reverse',
    'Reverse the finishing list',
    'The finishing list records a vertex after the vertices it points to. Reversing it is the topological order: if A → B was an edge, B finished before A was recorded, so A comes first after the reverse. This is why DFS appends on the way back, not on the way in.',
    [],
    {
      detail: `Finishing ${finished.join(', ') || '[]'} reverses to ${order.join(', ') || '[]'}.`,
      status: 'sorted',
      resultOrder: order,
      message: 'Reversing the finishing list.',
    },
  )

  const message = sortedTopologicalMessage(order)
  pushTopoStep(steps, {
    id: nextId('complete'),
    title: 'Topological order',
    explanation: `DFS finished every vertex without a back edge, so the graph is a DAG. ${order.length === 0 ? 'The order is empty.' : `${order.join(', ')} is one valid order.`} Kahn’s queue can list the same vertices differently when several sources are ready at once. Both orders respect every edge.`,
    detail: message,
    algorithm: 'dfs',
    phase: 'complete',
    status: 'sorted',
    graphSnapshot,
    indegrees,
    indegreeLive: false,
    queue: [],
    path: [],
    placement: [],
    finishing: [...finished],
    resultOrder: [...order],
    activeEdge: null,
    relaxedEdges: [...traversed],
    visited: visitedNow(),
    cycleVertices: [],
    message,
    processedCount: order.length,
    vertexCount: vertices.length,
    complete: true,
  })

  return steps
}
