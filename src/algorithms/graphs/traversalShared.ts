/**
 * Shared types and helpers for graph traversal (BFS / DFS).
 * Independent of React — used by algorithm modules and step generators.
 */

import {
  cloneSnapshot,
  getNeighbors,
  getVertices,
  hasVertex,
  type GraphSnapshot,
  type VertexId,
} from '../data-structures/graph'
import type { VisualizationStep } from '../../components/visualizations/types'

/**
 * How traversal handles vertices outside the start component.
 *
 * - `reachable` — only visit vertices reachable from `start`.
 * - `all-components` — after one component finishes, resume from the next
 *   unvisited vertex in insertion order (covers disconnected graphs).
 */
export type TraversalMode = 'reachable' | 'all-components'

export type TraversalEdge = {
  readonly from: VertexId
  readonly to: VertexId
}

export type TraversalResult = {
  readonly order: readonly VertexId[]
  readonly visited: readonly VertexId[]
  readonly mode: TraversalMode
  readonly start: VertexId | null
}

export type VisitCallback = (
  vertex: VertexId,
  orderIndex: number,
) => void

export type DiscoverCallback = (
  from: VertexId,
  to: VertexId,
) => void

export type TraversalCallbacks = {
  readonly onVisit?: VisitCallback
  readonly onDiscover?: DiscoverCallback
}

export type GraphTraversalPhase =
  | 'initialize'
  | 'seed'
  | 'dequeue'
  | 'enqueue'
  | 'visit'
  | 'explore-neighbor'
  | 'skip-visited'
  | 'push'
  | 'pop'
  | 'backtrack'
  | 'next-component'
  | 'complete'
  | 'invalid'

export type TraversalAlgorithm = 'bfs' | 'dfs'

/** Educational demo: cyclic undirected graph with an isolated vertex F. */
export const GRAPH_TRAVERSAL_DEMO = {
  directed: false,
  weighted: false,
  vertices: ['A', 'B', 'C', 'D', 'E', 'F'] as const,
  edges: [
    { from: 'A', to: 'B' },
    { from: 'A', to: 'C' },
    { from: 'B', to: 'D' },
    { from: 'C', to: 'D' },
    { from: 'C', to: 'E' },
    { from: 'D', to: 'E' },
  ],
} as const

/** Hand-tuned layout for GRAPH_TRAVERSAL_DEMO (normalized 0..1). */
export const GRAPH_TRAVERSAL_DEMO_LAYOUT: Readonly<
  Record<string, { x: number; y: number }>
> = {
  A: { x: 0.5, y: 0.14 },
  B: { x: 0.22, y: 0.38 },
  C: { x: 0.78, y: 0.38 },
  D: { x: 0.32, y: 0.7 },
  E: { x: 0.68, y: 0.7 },
  F: { x: 0.92, y: 0.14 },
}

export function serializeGraphSnapshot(snapshot: GraphSnapshot): string {
  return JSON.stringify(cloneSnapshot(snapshot))
}

export function parseGraphSnapshot(raw: string): GraphSnapshot {
  if (!raw) {
    return { directed: false, weighted: false, vertices: [], adjacency: {} }
  }
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return { directed: false, weighted: false, vertices: [], adjacency: {} }
    }
    const record = parsed as Record<string, unknown>
    const directed = Boolean(record.directed)
    const weighted = Boolean(record.weighted)
    const vertices: VertexId[] = []
    if (Array.isArray(record.vertices)) {
      for (const item of record.vertices) {
        if (typeof item === 'string' && item.trim()) {
          vertices.push(item)
        }
      }
    }
    const adjacency: Record<
      string,
      { to: VertexId; weight: number }[]
    > = {}
    const adjRaw = record.adjacency
    if (adjRaw && typeof adjRaw === 'object') {
      for (const [key, value] of Object.entries(
        adjRaw as Record<string, unknown>,
      )) {
        const list: { to: VertexId; weight: number }[] = []
        if (Array.isArray(value)) {
          for (const neighbor of value) {
            if (!neighbor || typeof neighbor !== 'object') continue
            const n = neighbor as Record<string, unknown>
            if (typeof n.to !== 'string') continue
            const weight =
              typeof n.weight === 'number' && Number.isFinite(n.weight)
                ? n.weight
                : 1
            list.push({ to: n.to, weight })
          }
        }
        adjacency[key] = list
      }
    }
    for (const vertex of vertices) {
      if (!(vertex in adjacency)) {
        adjacency[vertex] = []
      }
    }
    return { directed, weighted, vertices, adjacency }
  } catch {
    return { directed: false, weighted: false, vertices: [], adjacency: {} }
  }
}

export function serializeStringList(values: readonly string[]): string {
  return JSON.stringify(values)
}

export function parseStringList(raw: string | null | undefined): string[] {
  if (!raw || typeof raw !== 'string') return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === 'string')
  } catch {
    return []
  }
}

export function serializeEdges(edges: readonly TraversalEdge[]): string {
  return JSON.stringify(edges)
}

export function parseEdges(raw: string | null | undefined): TraversalEdge[] {
  if (!raw || typeof raw !== 'string') return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const edges: TraversalEdge[] = []
    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue
      const record = item as Record<string, unknown>
      if (typeof record.from === 'string' && typeof record.to === 'string') {
        edges.push({ from: record.from, to: record.to })
      }
    }
    return edges
  } catch {
    return []
  }
}

export function formatVertexList(values: readonly string[]): string {
  if (values.length === 0) return '[]'
  return `[${values.join(', ')}]`
}

export function edgeKey(
  from: VertexId,
  to: VertexId,
  directed: boolean,
): string {
  if (directed || from === to) return `${from}->${to}`
  return from < to ? `${from}|${to}` : `${to}|${from}`
}

/**
 * Deterministic neighbor order: adjacency lists are already sorted by `to`
 * in the Graph module. This helper returns that order explicitly for tests.
 */
export function orderedNeighborIds(
  snapshot: GraphSnapshot,
  vertex: VertexId,
): VertexId[] {
  return getNeighbors(snapshot, vertex).map((n) => n.to)
}

export function nextUnvisitedVertex(
  snapshot: GraphSnapshot,
  visited: ReadonlySet<VertexId>,
): VertexId | null {
  for (const vertex of getVertices(snapshot)) {
    if (!visited.has(vertex)) {
      return vertex
    }
  }
  return null
}

export function resolveStartVertex(
  snapshot: GraphSnapshot,
  start: string | null | undefined,
): VertexId | null {
  if (start === null || start === undefined) {
    return getVertices(snapshot)[0] ?? null
  }
  const trimmed = start.trim()
  if (!trimmed) return null
  if (!hasVertex(snapshot, trimmed)) return null
  return trimmed
}

type StepMetaFields = {
  algorithm: TraversalAlgorithm
  phase: GraphTraversalPhase
  graphSnapshot: string
  mode: TraversalMode
  startVertex: string | null
  currentVertex: string | null
  visited: string
  discovered: string
  frontier: string
  stack: string
  path: string
  traversalOrder: string
  activeEdge: string | null
  traversedEdges: string
  message: string
  success: boolean | null
  complete: boolean
}

export function pushTraversalStep(
  steps: VisualizationStep[],
  fields: {
    id: string
    title: string
    explanation: string
    detail?: string
  } & StepMetaFields,
): void {
  const {
    id,
    title,
    explanation,
    detail,
    algorithm,
    phase,
    graphSnapshot,
    mode,
    startVertex,
    currentVertex,
    visited,
    discovered,
    frontier,
    stack,
    path,
    traversalOrder,
    activeEdge,
    traversedEdges,
    message,
    success,
    complete,
  } = fields

  steps.push({
    id,
    title,
    explanation,
    detail,
    array: [],
    meta: {
      algorithm,
      phase,
      graphSnapshot,
      mode,
      startVertex,
      currentVertex,
      visited,
      discovered,
      frontier,
      stack,
      path,
      traversalOrder,
      activeEdge,
      traversedEdges,
      message,
      success,
      complete,
    },
  })
}
