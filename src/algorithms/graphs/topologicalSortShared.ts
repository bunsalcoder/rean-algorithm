/**
 * Shared types, samples, and step helpers for topological sorting.
 *
 * An edge A → B means A must come before B.
 * A topological order exists only for a directed acyclic graph.
 *
 * Kahn tie-break: zero-indegree vertices start in vertex insertion order.
 * Outgoing neighbors are always processed in sorted neighbor-id order
 * (the Graph module’s adjacency lists).
 *
 * DFS tie-break: unvisited vertices are started in insertion order, and
 * outgoing neighbors are explored in that same sorted order. The finishing
 * list is reversed to produce the topological order.
 *
 * Independent of React. The original graph is never mutated.
 */

import type { GraphSeed, VertexId } from '../data-structures/graph'
import type { VisualizationStep } from '../../components/visualizations/types'
import {
  formatVertexList,
  serializeEdges,
  serializeStringList,
  type TraversalEdge,
} from './traversalShared'

/** Normalized 0..1 positions for the lesson playground. Not used by the sort itself. */
export type TopoLayout = Readonly<
  Record<string, { readonly x: number; readonly y: number }>
>

export type TopologicalSortAlgorithm = 'kahn' | 'dfs'

export type TopologicalSortStatus = 'sorted' | 'cycle' | 'undirected'

/**
 * Successful sorts put every vertex in `order` exactly once.
 * Cyclic and undirected inputs return an empty `order` — never a partial
 * list presented as a valid topological ordering.
 */
export type TopologicalSortResult = {
  readonly status: TopologicalSortStatus
  readonly order: readonly VertexId[]
  readonly message: string
  /** Vertices placed or finished before a cycle stopped the run. Not an order. */
  readonly processedCount: number
  readonly vertexCount: number
}

export type TopologicalSortPhase =
  | 'initialize'
  | 'indegree'
  | 'seed-queue'
  | 'dequeue'
  | 'append'
  | 'relax-edge'
  | 'enqueue'
  | 'no-outgoing'
  | 'enter'
  | 'explore'
  | 'skip-finished'
  | 'back-edge'
  | 'finish'
  | 'next-component'
  | 'reverse'
  | 'cycle'
  | 'complete'
  | 'undirected'

export const UNDIRECTED_TOPO_MESSAGE =
  'Topological sorting needs a directed graph. An undirected edge can be traveled both ways, so it does not say which vertex comes first. This graph was rejected.'

export function undirectedTopologicalResult(
  vertexCount: number,
): TopologicalSortResult {
  return {
    status: 'undirected',
    order: [],
    message: UNDIRECTED_TOPO_MESSAGE,
    processedCount: 0,
    vertexCount,
  }
}

export function sortedTopologicalMessage(order: readonly VertexId[]): string {
  if (order.length === 0) {
    return 'Empty directed graph. The topological order is empty.'
  }
  return `Topological order: ${formatVertexList(order)}.`
}

export function cycleTopologicalMessage(
  processedCount: number,
  vertexCount: number,
): string {
  return `Cycle detected. ${processedCount} of ${vertexCount} vertices were processed. No topological order exists.`
}

export function serializeIndegrees(
  indegrees: Readonly<Record<string, number>>,
): string {
  return JSON.stringify(indegrees)
}

export function parseIndegrees(
  raw: string | null | undefined,
): Record<string, number> {
  if (!raw) return {}
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {}
    }
    const record: Record<string, number> = {}
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'number' && Number.isFinite(value)) {
        record[key] = value
      }
    }
    return record
  } catch {
    return {}
  }
}

export function serializeActiveEdge(edge: TraversalEdge | null): string {
  return edge ? JSON.stringify(edge) : ''
}

export function parseActiveEdge(
  raw: string | null | undefined,
): TraversalEdge | null {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const record = parsed as Record<string, unknown>
    if (typeof record.from === 'string' && typeof record.to === 'string') {
      return { from: record.from, to: record.to }
    }
    return null
  } catch {
    return null
  }
}

export function indegreeRecord(
  indegree: ReadonlyMap<VertexId, number>,
  vertices: readonly VertexId[],
): Record<string, number> {
  const record: Record<string, number> = {}
  for (const vertex of vertices) {
    record[vertex] = indegree.get(vertex) ?? 0
  }
  return record
}

type TopoStepFields = {
  id: string
  title: string
  explanation: string
  detail?: string
  algorithm: TopologicalSortAlgorithm
  phase: TopologicalSortPhase
  status: 'running' | TopologicalSortStatus
  currentVertex?: VertexId | null
  graphSnapshot: string
  indegrees: Record<string, number>
  indegreeLive: boolean
  queue: readonly VertexId[]
  path: readonly VertexId[]
  placement: readonly VertexId[]
  finishing: readonly VertexId[]
  resultOrder: readonly VertexId[]
  activeEdge: TraversalEdge | null
  relaxedEdges: readonly TraversalEdge[]
  visited: readonly VertexId[]
  cycleVertices: readonly VertexId[]
  message: string
  processedCount: number
  vertexCount: number
  complete: boolean
}

export function pushTopoStep(
  steps: VisualizationStep[],
  fields: TopoStepFields,
): void {
  steps.push({
    id: fields.id,
    title: fields.title,
    explanation: fields.explanation,
    detail: fields.detail,
    array: [],
    meta: {
      algorithm: fields.algorithm,
      phase: fields.phase,
      status: fields.status,
      currentVertex: fields.currentVertex ?? null,
      graphSnapshot: fields.graphSnapshot,
      indegrees: serializeIndegrees(fields.indegrees),
      indegreeLive: fields.indegreeLive,
      queue: serializeStringList(fields.queue),
      path: serializeStringList(fields.path),
      placement: serializeStringList(fields.placement),
      finishing: serializeStringList(fields.finishing),
      resultOrder: serializeStringList(fields.resultOrder),
      activeEdge: serializeActiveEdge(fields.activeEdge),
      relaxedEdges: serializeEdges(fields.relaxedEdges),
      visited: serializeStringList(fields.visited),
      cycleVertices: serializeStringList(fields.cycleVertices),
      message: fields.message,
      processedCount: fields.processedCount,
      vertexCount: fields.vertexCount,
      complete: fields.complete,
    },
  })
}

/** Course prerequisites. An edge means the source course comes first. */
export const TOPO_COURSES: GraphSeed = {
  directed: true,
  weighted: false,
  vertices: ['Calc', 'Prog', 'Data', 'Phys', 'Algo'],
  edges: [
    { from: 'Calc', to: 'Data' },
    { from: 'Calc', to: 'Phys' },
    { from: 'Data', to: 'Algo' },
    { from: 'Phys', to: 'Algo' },
    { from: 'Prog', to: 'Algo' },
  ],
}

/** Software build. A library must be built before the programs that import it. */
export const TOPO_BUILD: GraphSeed = {
  directed: true,
  weighted: false,
  vertices: ['Core', 'Util', 'API', 'UI', 'App'],
  edges: [
    { from: 'Core', to: 'API' },
    { from: 'Core', to: 'UI' },
    { from: 'API', to: 'App' },
    { from: 'UI', to: 'App' },
    { from: 'Util', to: 'App' },
  ],
}

/** Project tasks. An arrow is “must finish before”. */
export const TOPO_TASKS: GraphSeed = {
  directed: true,
  weighted: false,
  vertices: ['Plan', 'Code', 'Test', 'Docs', 'Ship'],
  edges: [
    { from: 'Plan', to: 'Code' },
    { from: 'Plan', to: 'Docs' },
    { from: 'Code', to: 'Test' },
    { from: 'Test', to: 'Ship' },
    { from: 'Docs', to: 'Ship' },
  ],
}

/** Package install. Base before Lib, then either command-line tool. */
export const TOPO_PACKAGES: GraphSeed = {
  directed: true,
  weighted: false,
  vertices: ['Base', 'Lib', 'CLI', 'Plug'],
  edges: [
    { from: 'Base', to: 'Lib' },
    { from: 'Lib', to: 'CLI' },
    { from: 'Lib', to: 'Plug' },
  ],
}

/** One valid order only: A before B before C before D. */
export const TOPO_CHAIN: GraphSeed = {
  directed: true,
  weighted: false,
  vertices: ['A', 'B', 'C', 'D'],
  edges: [
    { from: 'A', to: 'B' },
    { from: 'B', to: 'C' },
    { from: 'C', to: 'D' },
  ],
}

/** Two separate dependency chains. */
export const TOPO_DISCONNECTED: GraphSeed = {
  directed: true,
  weighted: false,
  vertices: ['A', 'B', 'C', 'D'],
  edges: [
    { from: 'A', to: 'B' },
    { from: 'C', to: 'D' },
  ],
}

/** D can be scheduled, then A → B → C → A has no topological order. */
export const TOPO_CYCLE: GraphSeed = {
  directed: true,
  weighted: false,
  vertices: ['D', 'A', 'B', 'C'],
  edges: [
    { from: 'D', to: 'A' },
    { from: 'A', to: 'B' },
    { from: 'B', to: 'C' },
    { from: 'C', to: 'A' },
  ],
}

/** A self-loop is a cycle of length 1. Task has no constraints. */
export const TOPO_SELF_LOOP: GraphSeed = {
  directed: true,
  weighted: false,
  vertices: ['Task', 'Loop'],
  edges: [{ from: 'Loop', to: 'Loop' }],
}

/** Undirected input is rejected by both algorithms. */
export const TOPO_UNDIRECTED: GraphSeed = {
  directed: false,
  weighted: false,
  vertices: ['A', 'B', 'C'],
  edges: [
    { from: 'A', to: 'B' },
    { from: 'B', to: 'C' },
  ],
}

export const TOPO_EMPTY: GraphSeed = {
  directed: true,
  weighted: false,
  vertices: [],
  edges: [],
}

export type TopoPreset = {
  readonly id: string
  readonly label: string
  readonly description: string
  readonly seed: GraphSeed
  readonly layout: TopoLayout
}

export const TOPO_PRESETS: readonly TopoPreset[] = [
  {
    id: 'courses',
    label: 'Course prerequisites',
    description:
      'Calc comes before Data and Phys. Prog, Data, and Phys all come before Algo.',
    seed: TOPO_COURSES,
    layout: {
      Calc: { x: 0.16, y: 0.32 },
      Prog: { x: 0.16, y: 0.76 },
      Data: { x: 0.48, y: 0.16 },
      Phys: { x: 0.48, y: 0.5 },
      Algo: { x: 0.82, y: 0.4 },
    },
  },
  {
    id: 'build',
    label: 'Build dependencies',
    description:
      'Core is built before API and UI. Util, API, and UI are built before App.',
    seed: TOPO_BUILD,
    layout: {
      Core: { x: 0.16, y: 0.28 },
      Util: { x: 0.16, y: 0.74 },
      API: { x: 0.48, y: 0.2 },
      UI: { x: 0.48, y: 0.55 },
      App: { x: 0.82, y: 0.42 },
    },
  },
  {
    id: 'tasks',
    label: 'Task scheduling',
    description:
      'Plan comes before Code and Docs. Test follows Code. Ship waits for Test and Docs.',
    seed: TOPO_TASKS,
    layout: {
      Plan: { x: 0.14, y: 0.48 },
      Code: { x: 0.38, y: 0.2 },
      Docs: { x: 0.38, y: 0.76 },
      Test: { x: 0.64, y: 0.2 },
      Ship: { x: 0.86, y: 0.48 },
    },
  },
  {
    id: 'packages',
    label: 'Package install',
    description:
      'Install Base before Lib. Lib comes before both CLI and Plug. Those two have no order between them.',
    seed: TOPO_PACKAGES,
    layout: {
      Base: { x: 0.16, y: 0.5 },
      Lib: { x: 0.46, y: 0.5 },
      CLI: { x: 0.78, y: 0.24 },
      Plug: { x: 0.78, y: 0.76 },
    },
  },
  {
    id: 'chain',
    label: 'Linear chain',
    description: 'A → B → C → D has one valid order: A, B, C, D.',
    seed: TOPO_CHAIN,
    layout: {
      A: { x: 0.12, y: 0.5 },
      B: { x: 0.38, y: 0.5 },
      C: { x: 0.62, y: 0.5 },
      D: { x: 0.88, y: 0.5 },
    },
  },
  {
    id: 'disconnected',
    label: 'Disconnected DAG',
    description: 'A → B and C → D share no vertices. Both chains must be ordered.',
    seed: TOPO_DISCONNECTED,
    layout: {
      A: { x: 0.22, y: 0.28 },
      B: { x: 0.78, y: 0.28 },
      C: { x: 0.22, y: 0.74 },
      D: { x: 0.78, y: 0.74 },
    },
  },
  {
    id: 'cycle',
    label: 'Directed cycle',
    description:
      'D → A can be taken, then A → B → C → A repeats. No full ordering exists.',
    seed: TOPO_CYCLE,
    layout: {
      D: { x: 0.14, y: 0.5 },
      A: { x: 0.42, y: 0.22 },
      B: { x: 0.78, y: 0.4 },
      C: { x: 0.5, y: 0.78 },
    },
  },
  {
    id: 'self-loop',
    label: 'Self-loop',
    description: 'Loop → Loop is a cycle. Task has indegree 0 and is not enough.',
    seed: TOPO_SELF_LOOP,
    layout: {
      Task: { x: 0.3, y: 0.5 },
      Loop: { x: 0.72, y: 0.5 },
    },
  },
  {
    id: 'undirected',
    label: 'Undirected (rejected)',
    description:
      'A — B — C has no arrow. Both algorithms refuse to invent a dependency order.',
    seed: TOPO_UNDIRECTED,
    layout: {
      A: { x: 0.18, y: 0.5 },
      B: { x: 0.5, y: 0.5 },
      C: { x: 0.82, y: 0.5 },
    },
  },
  {
    id: 'empty',
    label: 'Empty graph',
    description: 'A directed graph with no vertices. The order is empty.',
    seed: TOPO_EMPTY,
    layout: {},
  },
]
