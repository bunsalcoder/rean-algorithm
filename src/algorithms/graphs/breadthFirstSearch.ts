/**
 * Breadth-First Search (BFS) on a GraphSnapshot.
 *
 * Explores neighbors level by level using a FIFO queue.
 * Neighbors are visited in the Graph module’s deterministic order
 * (lexicographic by neighbor id).
 *
 * Complexities (adjacency list): Time O(V + E), Space O(V).
 * Independent of React.
 */

import {
  cloneSnapshot,
  getVertices,
  isEmpty,
  type GraphSnapshot,
  type VertexId,
} from '../data-structures/graph'
import type { VisualizationStep } from '../../components/visualizations/types'
import {
  formatVertexList,
  nextUnvisitedVertex,
  orderedNeighborIds,
  pushTraversalStep,
  resolveStartVertex,
  serializeEdges,
  serializeGraphSnapshot,
  serializeStringList,
  type TraversalCallbacks,
  type TraversalEdge,
  type TraversalMode,
  type TraversalResult,
} from './traversalShared'

export type BfsOptions = TraversalCallbacks & {
  readonly start: string
  readonly mode?: TraversalMode
}

/**
 * Run BFS and return the visit order.
 * Marks a vertex visited when it is enqueued (classic educational BFS)
 * so each vertex appears in the queue at most once.
 */
export function breadthFirstSearch(
  snapshot: GraphSnapshot,
  options: BfsOptions,
): TraversalResult {
  const mode = options.mode ?? 'reachable'
  const start = resolveStartVertex(snapshot, options.start)
  if (start === null) {
    return { order: [], visited: [], mode, start: null }
  }

  const visited = new Set<VertexId>()
  const order: VertexId[] = []

  const runFrom = (seed: VertexId) => {
    const queue: VertexId[] = [seed]
    visited.add(seed)
    options.onDiscover?.(seed, seed)

    while (queue.length > 0) {
      const current = queue.shift()!
      order.push(current)
      options.onVisit?.(current, order.length - 1)

      for (const neighbor of orderedNeighborIds(snapshot, current)) {
        if (visited.has(neighbor)) continue
        visited.add(neighbor)
        queue.push(neighbor)
        options.onDiscover?.(current, neighbor)
      }
    }
  }

  runFrom(start)

  if (mode === 'all-components') {
    let next = nextUnvisitedVertex(snapshot, visited)
    while (next !== null) {
      runFrom(next)
      next = nextUnvisitedVertex(snapshot, visited)
    }
  }

  return {
    order,
    visited: [...visited],
    mode,
    start,
  }
}

/**
 * Step-by-step BFS frames for the interactive visualizer.
 * Each step embeds an immutable graph snapshot and queue / visited copies.
 */
export function buildBfsSteps(
  snapshot: GraphSnapshot,
  startInput: string | null,
  mode: TraversalMode = 'reachable',
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const graphSnapshot = serializeGraphSnapshot(snapshot)
  const start = resolveStartVertex(snapshot, startInput)

  const base = {
    algorithm: 'bfs' as const,
    graphSnapshot,
    mode,
    startVertex: start,
    discovered: serializeStringList([]),
    stack: serializeStringList([]),
    path: serializeStringList([]),
    success: null as boolean | null,
    complete: false,
  }

  pushTraversalStep(steps, {
    ...base,
    id: 'bfs-init',
    title: 'Breadth-First Search',
    explanation:
      'BFS explores level by level using a FIFO queue. Neighbors are taken in sorted id order so the walk is deterministic.',
    detail: isEmpty(snapshot)
      ? 'Graph is empty — nothing to traverse.'
      : start === null
        ? 'Choose a starting vertex that exists in the graph.'
        : `Start at ${start}. Mode: ${mode === 'reachable' ? 'reachable component only' : 'all components'}.`,
    phase: 'initialize',
    currentVertex: null,
    visited: serializeStringList([]),
    frontier: serializeStringList([]),
    traversalOrder: serializeStringList([]),
    activeEdge: null,
    traversedEdges: serializeEdges([]),
    message: 'Initialize BFS',
  })

  if (isEmpty(snapshot)) {
    pushTraversalStep(steps, {
      ...base,
      id: 'bfs-empty',
      title: 'Empty graph',
      explanation: 'An empty graph has no vertices to visit. Order is [].',
      phase: 'complete',
      currentVertex: null,
      visited: serializeStringList([]),
      frontier: serializeStringList([]),
      traversalOrder: serializeStringList([]),
      activeEdge: null,
      traversedEdges: serializeEdges([]),
      message: 'Empty graph',
      success: true,
      complete: true,
    })
    return steps
  }

  if (start === null) {
    pushTraversalStep(steps, {
      ...base,
      id: 'bfs-invalid-start',
      title: 'Invalid start',
      explanation: `Start vertex "${startInput ?? ''}" is missing. Pick an existing vertex.`,
      phase: 'invalid',
      currentVertex: null,
      visited: serializeStringList([]),
      frontier: serializeStringList([]),
      traversalOrder: serializeStringList([]),
      activeEdge: null,
      traversedEdges: serializeEdges([]),
      message: 'Invalid start vertex',
      success: false,
      complete: true,
    })
    return steps
  }

  const visited = new Set<VertexId>()
  const order: VertexId[] = []
  const discovered: VertexId[] = []
  const traversed: TraversalEdge[] = []
  let stepCounter = 0

  const emitComponent = (seed: VertexId, isResume: boolean) => {
    const queue: VertexId[] = []

    if (isResume) {
      stepCounter += 1
      pushTraversalStep(steps, {
        ...base,
        id: `bfs-next-component-${stepCounter}`,
        title: `Next component → ${seed}`,
        explanation: `Component finished. Resume from the next unvisited vertex ${seed} (insertion order).`,
        phase: 'next-component',
        currentVertex: seed,
        visited: serializeStringList([...visited]),
        discovered: serializeStringList(discovered),
        frontier: serializeStringList(queue),
        traversalOrder: serializeStringList(order),
        activeEdge: null,
        traversedEdges: serializeEdges(traversed),
        message: `Resume at ${seed}`,
      })
    }

    queue.push(seed)
    visited.add(seed)
    discovered.push(seed)
    stepCounter += 1
    pushTraversalStep(steps, {
      ...base,
      id: `bfs-seed-${stepCounter}`,
      title: `Enqueue start ${seed}`,
      explanation: `Mark ${seed} discovered and place it in the FIFO queue (front = left).`,
      detail: `Queue: ${formatVertexList(queue)}`,
      phase: 'seed',
      currentVertex: seed,
      visited: serializeStringList([...visited]),
      discovered: serializeStringList(discovered),
      frontier: serializeStringList(queue),
      traversalOrder: serializeStringList(order),
      activeEdge: null,
      traversedEdges: serializeEdges(traversed),
      message: `Enqueue ${seed}`,
    })

    while (queue.length > 0) {
      const current = queue.shift()!
      order.push(current)
      stepCounter += 1
      pushTraversalStep(steps, {
        ...base,
        id: `bfs-dequeue-${stepCounter}`,
        title: `Dequeue ${current}`,
        explanation: `Remove ${current} from the front of the queue and visit it.`,
        detail: `Order so far: ${formatVertexList(order)} · Queue: ${formatVertexList(queue)}`,
        phase: 'dequeue',
        currentVertex: current,
        visited: serializeStringList([...visited]),
        discovered: serializeStringList(discovered),
        frontier: serializeStringList(queue),
        traversalOrder: serializeStringList(order),
        activeEdge: null,
        traversedEdges: serializeEdges(traversed),
        message: `Visit ${current}`,
      })

      pushTraversalStep(steps, {
        ...base,
        id: `bfs-visit-${stepCounter}`,
        title: `Visit ${current}`,
        explanation: `Record ${current} in the traversal order (${order.length} of reachable so far).`,
        detail: `Traversal order: ${formatVertexList(order)}`,
        phase: 'visit',
        currentVertex: current,
        visited: serializeStringList([...visited]),
        discovered: serializeStringList(discovered),
        frontier: serializeStringList(queue),
        traversalOrder: serializeStringList(order),
        activeEdge: null,
        traversedEdges: serializeEdges(traversed),
        message: `Visited ${current}`,
      })

      for (const neighbor of orderedNeighborIds(snapshot, current)) {
        const edgeLabel = `${current}→${neighbor}`
        if (visited.has(neighbor)) {
          stepCounter += 1
          pushTraversalStep(steps, {
            ...base,
            id: `bfs-skip-${stepCounter}`,
            title: `Skip ${neighbor}`,
            explanation: `${neighbor} is already discovered/visited — skip to avoid cycles and duplicates.`,
            detail: `Edge ${edgeLabel} does not enqueue again.`,
            phase: 'skip-visited',
            currentVertex: current,
            visited: serializeStringList([...visited]),
            discovered: serializeStringList(discovered),
            frontier: serializeStringList(queue),
            traversalOrder: serializeStringList(order),
            activeEdge: edgeLabel,
            traversedEdges: serializeEdges(traversed),
            message: `Skip ${neighbor}`,
          })
          continue
        }

        visited.add(neighbor)
        discovered.push(neighbor)
        queue.push(neighbor)
        traversed.push({ from: current, to: neighbor })
        stepCounter += 1
        pushTraversalStep(steps, {
          ...base,
          id: `bfs-enqueue-${stepCounter}`,
          title: `Enqueue ${neighbor}`,
          explanation: `Discover ${neighbor} via ${edgeLabel} and enqueue it at the rear (FIFO).`,
          detail: `Queue: ${formatVertexList(queue)}`,
          phase: 'enqueue',
          currentVertex: current,
          visited: serializeStringList([...visited]),
          discovered: serializeStringList(discovered),
          frontier: serializeStringList(queue),
          traversalOrder: serializeStringList(order),
          activeEdge: edgeLabel,
          traversedEdges: serializeEdges(traversed),
          message: `Enqueue ${neighbor}`,
        })
      }
    }
  }

  emitComponent(start, false)

  if (mode === 'all-components') {
    let next = nextUnvisitedVertex(snapshot, visited)
    while (next !== null) {
      emitComponent(next, true)
      next = nextUnvisitedVertex(snapshot, visited)
    }
  }

  pushTraversalStep(steps, {
    ...base,
    id: 'bfs-complete',
    title: 'BFS complete',
    explanation: `Final order: ${formatVertexList(order)}. Visited ${order.length} of ${getVertices(snapshot).length} vertices.`,
    detail:
      mode === 'reachable' && order.length < getVertices(snapshot).length
        ? 'Unreachable vertices stay unvisited in reachable mode. Switch to all-components to cover them.'
        : 'Queue is empty — every targeted vertex has been processed.',
    phase: 'complete',
    currentVertex: null,
    visited: serializeStringList([...visited]),
    discovered: serializeStringList(discovered),
    frontier: serializeStringList([]),
    traversalOrder: serializeStringList(order),
    activeEdge: null,
    traversedEdges: serializeEdges(traversed),
    message: `Order ${formatVertexList(order)}`,
    success: true,
    complete: true,
  })

  return steps
}

/** Convenience: immutable copy used by scrubbing / tests. */
export function cloneBfsSnapshot(snapshot: GraphSnapshot): GraphSnapshot {
  return cloneSnapshot(snapshot)
}
