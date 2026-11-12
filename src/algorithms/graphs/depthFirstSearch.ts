/**
 * Depth-First Search (DFS) on a GraphSnapshot.
 *
 * Explores one path as deeply as possible before backtracking.
 * Provides both recursive and iterative (explicit stack) implementations.
 * Neighbors are taken in the Graph module’s deterministic order
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

export type DfsOptions = TraversalCallbacks & {
  readonly start: string
  readonly mode?: TraversalMode
}

/**
 * Recursive DFS — classic textbook form (call stack = implicit stack).
 */
export function depthFirstSearch(
  snapshot: GraphSnapshot,
  options: DfsOptions,
): TraversalResult {
  const mode = options.mode ?? 'reachable'
  const start = resolveStartVertex(snapshot, options.start)
  if (start === null) {
    return { order: [], visited: [], mode, start: null }
  }

  const visited = new Set<VertexId>()
  const order: VertexId[] = []

  const dfsVisit = (vertex: VertexId) => {
    visited.add(vertex)
    order.push(vertex)
    options.onVisit?.(vertex, order.length - 1)

    for (const neighbor of orderedNeighborIds(snapshot, vertex)) {
      if (visited.has(neighbor)) continue
      options.onDiscover?.(vertex, neighbor)
      dfsVisit(neighbor)
    }
  }

  dfsVisit(start)

  if (mode === 'all-components') {
    let next = nextUnvisitedVertex(snapshot, visited)
    while (next !== null) {
      dfsVisit(next)
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
 * Iterative DFS with an explicit frame stack.
 * Expands one neighbor at a time so visit order matches recursive DFS
 * (lexicographic neighbor order, deepest path first, then backtrack).
 */
export function depthFirstSearchIterative(
  snapshot: GraphSnapshot,
  options: DfsOptions,
): TraversalResult {
  const mode = options.mode ?? 'reachable'
  const start = resolveStartVertex(snapshot, options.start)
  if (start === null) {
    return { order: [], visited: [], mode, start: null }
  }

  const visited = new Set<VertexId>()
  const order: VertexId[] = []

  type Frame = { vertex: VertexId; nextNeighborIndex: number }

  const runFrom = (seed: VertexId) => {
    const stack: Frame[] = [{ vertex: seed, nextNeighborIndex: 0 }]

    while (stack.length > 0) {
      const frame = stack[stack.length - 1]!
      const current = frame.vertex

      if (!visited.has(current)) {
        visited.add(current)
        order.push(current)
        options.onVisit?.(current, order.length - 1)
      }

      const neighbors = orderedNeighborIds(snapshot, current)
      let pushed = false
      while (frame.nextNeighborIndex < neighbors.length) {
        const neighbor = neighbors[frame.nextNeighborIndex]!
        frame.nextNeighborIndex += 1
        if (visited.has(neighbor)) continue
        options.onDiscover?.(current, neighbor)
        stack.push({ vertex: neighbor, nextNeighborIndex: 0 })
        pushed = true
        break
      }

      if (!pushed && frame.nextNeighborIndex >= neighbors.length) {
        stack.pop()
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
 * Step-by-step DFS using an explicit stack + active path so backtracking
 * is visible. Visit order matches recursive / iterative DFS above.
 */
export function buildDfsSteps(
  snapshot: GraphSnapshot,
  startInput: string | null,
  mode: TraversalMode = 'reachable',
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const graphSnapshot = serializeGraphSnapshot(snapshot)
  const start = resolveStartVertex(snapshot, startInput)

  const base = {
    algorithm: 'dfs' as const,
    graphSnapshot,
    mode,
    startVertex: start,
    discovered: serializeStringList([]),
    frontier: serializeStringList([]),
    success: null as boolean | null,
    complete: false,
  }

  pushTraversalStep(steps, {
    ...base,
    id: 'dfs-init',
    title: 'Depth-First Search',
    explanation:
      'DFS goes as deep as possible along one path, then backtracks. We show an explicit stack (LIFO) and the active path.',
    detail: isEmpty(snapshot)
      ? 'Graph is empty — nothing to traverse.'
      : start === null
        ? 'Choose a starting vertex that exists in the graph.'
        : `Start at ${start}. Neighbors are explored in sorted id order.`,
    phase: 'initialize',
    currentVertex: null,
    visited: serializeStringList([]),
    stack: serializeStringList([]),
    path: serializeStringList([]),
    traversalOrder: serializeStringList([]),
    activeEdge: null,
    traversedEdges: serializeEdges([]),
    message: 'Initialize DFS',
  })

  if (isEmpty(snapshot)) {
    pushTraversalStep(steps, {
      ...base,
      id: 'dfs-empty',
      title: 'Empty graph',
      explanation: 'An empty graph has no vertices to visit. Order is [].',
      phase: 'complete',
      currentVertex: null,
      visited: serializeStringList([]),
      stack: serializeStringList([]),
      path: serializeStringList([]),
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
      id: 'dfs-invalid-start',
      title: 'Invalid start',
      explanation: `Start vertex "${startInput ?? ''}" is missing. Pick an existing vertex.`,
      phase: 'invalid',
      currentVertex: null,
      visited: serializeStringList([]),
      stack: serializeStringList([]),
      path: serializeStringList([]),
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

  /**
   * Frame stack entries carry which neighbor index to try next so we can
   * show push → explore → backtrack clearly.
   */
  type Frame = {
    vertex: VertexId
    nextNeighborIndex: number
  }

  const emitComponent = (seed: VertexId, isResume: boolean) => {
    if (isResume) {
      stepCounter += 1
      pushTraversalStep(steps, {
        ...base,
        id: `dfs-next-component-${stepCounter}`,
        title: `Next component → ${seed}`,
        explanation: `Component finished. Resume DFS from unvisited vertex ${seed}.`,
        phase: 'next-component',
        currentVertex: seed,
        visited: serializeStringList([...visited]),
        discovered: serializeStringList(discovered),
        stack: serializeStringList([]),
        path: serializeStringList([]),
        traversalOrder: serializeStringList(order),
        activeEdge: null,
        traversedEdges: serializeEdges(traversed),
        message: `Resume at ${seed}`,
      })
    }

    const frames: Frame[] = [{ vertex: seed, nextNeighborIndex: 0 }]
    stepCounter += 1
    pushTraversalStep(steps, {
      ...base,
      id: `dfs-seed-${stepCounter}`,
      title: `Push start ${seed}`,
      explanation: `Place ${seed} on the stack (top = right). Recursion would push a call frame the same way.`,
      detail: `Stack: ${formatVertexList(frames.map((f) => f.vertex))}`,
      phase: 'seed',
      currentVertex: seed,
      visited: serializeStringList([...visited]),
      discovered: serializeStringList(discovered),
      stack: serializeStringList(frames.map((f) => f.vertex)),
      path: serializeStringList(frames.map((f) => f.vertex)),
      traversalOrder: serializeStringList(order),
      activeEdge: null,
      traversedEdges: serializeEdges(traversed),
      message: `Push ${seed}`,
    })

    while (frames.length > 0) {
      const frame = frames[frames.length - 1]!
      const current = frame.vertex

      if (!visited.has(current)) {
        visited.add(current)
        discovered.push(current)
        order.push(current)
        stepCounter += 1
        pushTraversalStep(steps, {
          ...base,
          id: `dfs-visit-${stepCounter}`,
          title: `Visit ${current}`,
          explanation: `Visit ${current} (depth-first). Active path shows the route from the start.`,
          detail: `Order: ${formatVertexList(order)} · Path: ${formatVertexList(frames.map((f) => f.vertex))}`,
          phase: 'visit',
          currentVertex: current,
          visited: serializeStringList([...visited]),
          discovered: serializeStringList(discovered),
          stack: serializeStringList(frames.map((f) => f.vertex)),
          path: serializeStringList(frames.map((f) => f.vertex)),
          traversalOrder: serializeStringList(order),
          activeEdge: null,
          traversedEdges: serializeEdges(traversed),
          message: `Visited ${current}`,
        })
      }

      const neighbors = orderedNeighborIds(snapshot, current)
      let advanced = false

      while (frame.nextNeighborIndex < neighbors.length) {
        const neighbor = neighbors[frame.nextNeighborIndex]!
        const edgeLabel = `${current}→${neighbor}`
        frame.nextNeighborIndex += 1

        if (visited.has(neighbor)) {
          stepCounter += 1
          pushTraversalStep(steps, {
            ...base,
            id: `dfs-skip-${stepCounter}`,
            title: `Skip ${neighbor}`,
            explanation: `${neighbor} is already visited — cycle or cross edge. Stay on the current path.`,
            detail: `Edge ${edgeLabel} does not extend the path.`,
            phase: 'skip-visited',
            currentVertex: current,
            visited: serializeStringList([...visited]),
            discovered: serializeStringList(discovered),
            stack: serializeStringList(frames.map((f) => f.vertex)),
            path: serializeStringList(frames.map((f) => f.vertex)),
            traversalOrder: serializeStringList(order),
            activeEdge: edgeLabel,
            traversedEdges: serializeEdges(traversed),
            message: `Skip ${neighbor}`,
          })
          continue
        }

        traversed.push({ from: current, to: neighbor })
        frames.push({ vertex: neighbor, nextNeighborIndex: 0 })
        advanced = true
        stepCounter += 1
        pushTraversalStep(steps, {
          ...base,
          id: `dfs-push-${stepCounter}`,
          title: `Push ${neighbor}`,
          explanation: `Go deeper: push ${neighbor} onto the stack via ${edgeLabel}.`,
          detail: `Stack: ${formatVertexList(frames.map((f) => f.vertex))}`,
          phase: 'push',
          currentVertex: neighbor,
          visited: serializeStringList([...visited]),
          discovered: serializeStringList(discovered),
          stack: serializeStringList(frames.map((f) => f.vertex)),
          path: serializeStringList(frames.map((f) => f.vertex)),
          traversalOrder: serializeStringList(order),
          activeEdge: edgeLabel,
          traversedEdges: serializeEdges(traversed),
          message: `Push ${neighbor}`,
        })
        break
      }

      if (!advanced && frame.nextNeighborIndex >= neighbors.length) {
        frames.pop()
        stepCounter += 1
        pushTraversalStep(steps, {
          ...base,
          id: `dfs-backtrack-${stepCounter}`,
          title: `Backtrack from ${current}`,
          explanation: `No unvisited neighbors left from ${current}. Pop the stack and return to the previous vertex.`,
          detail:
            frames.length === 0
              ? 'Stack empty — this component is done.'
              : `Path now: ${formatVertexList(frames.map((f) => f.vertex))}`,
          phase: 'backtrack',
          currentVertex: frames.length > 0 ? frames[frames.length - 1]!.vertex : null,
          visited: serializeStringList([...visited]),
          discovered: serializeStringList(discovered),
          stack: serializeStringList(frames.map((f) => f.vertex)),
          path: serializeStringList(frames.map((f) => f.vertex)),
          traversalOrder: serializeStringList(order),
          activeEdge: null,
          traversedEdges: serializeEdges(traversed),
          message: `Pop ${current}`,
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
    id: 'dfs-complete',
    title: 'DFS complete',
    explanation: `Final order: ${formatVertexList(order)}. Visited ${order.length} of ${getVertices(snapshot).length} vertices.`,
    detail:
      mode === 'reachable' && order.length < getVertices(snapshot).length
        ? 'Unreachable vertices stay unvisited in reachable mode. Switch to all-components to cover them.'
        : 'Stack is empty — every targeted vertex has been processed.',
    phase: 'complete',
    currentVertex: null,
    visited: serializeStringList([...visited]),
    discovered: serializeStringList(discovered),
    stack: serializeStringList([]),
    path: serializeStringList([]),
    traversalOrder: serializeStringList(order),
    activeEdge: null,
    traversedEdges: serializeEdges(traversed),
    message: `Order ${formatVertexList(order)}`,
    success: true,
    complete: true,
  })

  return steps
}

export function cloneDfsSnapshot(snapshot: GraphSnapshot): GraphSnapshot {
  return cloneSnapshot(snapshot)
}
