/**
 * Bellman-Ford — single-source shortest paths with negative-cycle detection.
 *
 * Relax every edge once per iteration, for at most |V| - 1 iterations.
 * A simple shortest path has no repeated vertex, so it uses at most |V| - 1
 * edges. If a full pass changes nothing, later passes cannot change anything
 * either, and no negative cycle is reachable from the source.
 *
 * One extra pass detects a reachable negative cycle: a finite distance that
 * can still fall. Vertices that cycle can reach then have no finite shortest
 * path. Their distance is negative infinity, not the last finite estimate.
 * An unreachable negative cycle never relaxes, because its vertices stay at
 * positive infinity.
 *
 * Undirected edges are stored in both directions by the Graph module, so each
 * undirected edge is relaxed both ways. A negative undirected edge is a
 * negative cycle: the walk can cross it and come straight back.
 *
 * The input graph is never mutated. Independent of React.
 *
 * With an adjacency list:
 * - Time: O(V × E)
 * - Auxiliary space: O(V), excluding graph storage
 */

import type { VisualizationStep } from '../../components/visualizations/types'
import {
  hasVertex,
  type GraphSnapshot,
  type VertexId,
} from '../data-structures/graph'
import { reconstructShortestPath } from './dijkstra'
import {
  serializeEdges,
  serializeGraphSnapshot,
  serializeStringList,
  type TraversalEdge,
} from './traversalShared'

/** Distance of a vertex that has not been reached from the source. */
export const BELLMAN_FORD_INFINITY = Number.POSITIVE_INFINITY

/**
 * Sentinel for a vertex whose path cost can be reduced forever by a
 * reachable negative cycle. This is not a finite shortest-path length.
 */
export const BELLMAN_FORD_NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY

export type BellmanFordPhase =
  | 'invalid'
  | 'initialize'
  | 'iteration-start'
  | 'relax'
  | 'iteration-end'
  | 'early-stop'
  | 'negative-check'
  | 'negative-cycle'
  | 'complete'

/** Whole-graph outcome. Unreachable vertices are reported per vertex. */
export type BellmanFordOutcome =
  | 'shortest-paths'
  | 'negative-cycle'
  | 'invalid'

export type BellmanFordVertexState =
  | 'shortest'
  | 'unreachable'
  | 'negative-cycle'

export type BellmanFordIterationColumn = {
  readonly iteration: number
  readonly distances: Readonly<Record<string, number>>
}

/** One edge inspection, with the numbers from that exact moment. */
export type BellmanFordRelaxationView = {
  readonly from: VertexId
  readonly to: VertexId
  readonly weight: number
  /** False when the tail is still unreachable, so the edge cannot fire. */
  readonly considered: boolean
  readonly before: number
  readonly candidate: number | null
  readonly after: number
  readonly previousBefore: VertexId | null
  readonly previousAfter: VertexId | null
  readonly updated: boolean
}

export type BellmanFordResult = {
  readonly ok: boolean
  readonly reason?: string
  readonly outcome: BellmanFordOutcome
  readonly source: VertexId | null
  readonly destination: VertexId | null
  /**
   * Finite shortest-path lengths, positive infinity when unreachable, or
   * negative infinity when a reachable negative cycle affects the vertex.
   */
  readonly distances: Readonly<Record<string, number>>
  /** Previous pointers for finite shortest paths. Cleared when a cycle wins. */
  readonly previous: Readonly<Record<string, VertexId | null>>
  readonly path: readonly VertexId[]
  readonly reachable: boolean
  readonly hasReachableNegativeCycle: boolean
  /** One reachable negative cycle, in walk order. Empty when none exists. */
  readonly negativeCycle: readonly VertexId[]
  readonly affectedVertices: readonly VertexId[]
  readonly vertexState: Readonly<Record<string, BellmanFordVertexState>>
  /** Passes actually performed, including a clean pass that stops early. */
  readonly iterationsRun: number
  /** True when a clean pass ended the loop before all |V| - 1 iterations. */
  readonly earlyTerminated: boolean
  /**
   * Distance estimates after each completed pass.
   * Index 0 is the initial column. These stay finite even if the final
   * distances later become negative infinity.
   */
  readonly iterationDistances: readonly BellmanFordIterationColumn[]
}

export type BellmanFordOptions = {
  readonly source: string
  readonly destination?: string | null
}

type RelaxationEdge = {
  readonly from: VertexId
  readonly to: VertexId
  readonly weight: number
}

/**
 * Directed sample with one negative edge and no negative cycle.
 * Shortest A → D is A–C–B–D (distance 4). D is 7 after pass 1 and 4 after
 * pass 2. Isolated E stays unreachable. Pass 3 changes nothing, so the
 * fourth pass is skipped.
 */
export const BELLMAN_FORD_NEGATIVE_EDGE = {
  directed: true,
  weighted: true,
  vertices: ['A', 'B', 'C', 'D', 'E'] as const,
  edges: [
    { from: 'A', to: 'B', weight: 4 },
    { from: 'A', to: 'C', weight: 2 },
    { from: 'B', to: 'D', weight: 3 },
    { from: 'C', to: 'B', weight: -1 },
    { from: 'C', to: 'D', weight: 6 },
  ],
} as const

export const BELLMAN_FORD_NEGATIVE_EDGE_LAYOUT: Readonly<
  Record<string, { x: number; y: number }>
> = {
  A: { x: 0.12, y: 0.5 },
  B: { x: 0.46, y: 0.2 },
  C: { x: 0.46, y: 0.78 },
  D: { x: 0.8, y: 0.36 },
  E: { x: 0.86, y: 0.82 },
}

/** Zero-weight hops beat the direct edge. Shortest A → D is A–B–C–D (distance 1). */
export const BELLMAN_FORD_ZERO_WEIGHT = {
  directed: true,
  weighted: true,
  vertices: ['A', 'B', 'C', 'D'] as const,
  edges: [
    { from: 'A', to: 'B', weight: 0 },
    { from: 'B', to: 'C', weight: 0 },
    { from: 'C', to: 'D', weight: 1 },
    { from: 'A', to: 'D', weight: 5 },
  ],
} as const

export const BELLMAN_FORD_ZERO_LAYOUT: Readonly<
  Record<string, { x: number; y: number }>
> = {
  A: { x: 0.14, y: 0.62 },
  B: { x: 0.38, y: 0.28 },
  C: { x: 0.64, y: 0.28 },
  D: { x: 0.88, y: 0.62 },
}

/** Undirected positive weights. Shortest A → D is A–C–B–D (distance 8), not A–B–D (9). */
export const BELLMAN_FORD_UNDIRECTED = {
  directed: false,
  weighted: true,
  vertices: ['A', 'B', 'C', 'D'] as const,
  edges: [
    { from: 'A', to: 'B', weight: 4 },
    { from: 'A', to: 'C', weight: 2 },
    { from: 'C', to: 'B', weight: 1 },
    { from: 'B', to: 'D', weight: 5 },
  ],
} as const

export const BELLMAN_FORD_UNDIRECTED_LAYOUT: Readonly<
  Record<string, { x: number; y: number }>
> = {
  A: { x: 0.16, y: 0.28 },
  B: { x: 0.55, y: 0.22 },
  C: { x: 0.28, y: 0.74 },
  D: { x: 0.84, y: 0.48 },
}

/**
 * Cycle A→B→A has total weight 2 + (-4) = -2 and is reachable from S.
 * S keeps distance 0. A, B, and C have no finite shortest path.
 */
export const BELLMAN_FORD_REACHABLE_CYCLE = {
  directed: true,
  weighted: true,
  vertices: ['S', 'A', 'B', 'C'] as const,
  edges: [
    { from: 'S', to: 'A', weight: 1 },
    { from: 'A', to: 'B', weight: 2 },
    { from: 'A', to: 'C', weight: 3 },
    { from: 'B', to: 'A', weight: -4 },
  ],
} as const

export const BELLMAN_FORD_REACHABLE_CYCLE_LAYOUT: Readonly<
  Record<string, { x: number; y: number }>
> = {
  S: { x: 0.12, y: 0.5 },
  A: { x: 0.42, y: 0.28 },
  B: { x: 0.7, y: 0.22 },
  C: { x: 0.48, y: 0.78 },
}

/**
 * X↔Y is a negative cycle, and nothing reaches it from S.
 * Shortest S → B is S–A–B (distance 5). X and Y stay unreachable.
 */
export const BELLMAN_FORD_UNREACHABLE_CYCLE = {
  directed: true,
  weighted: true,
  vertices: ['S', 'A', 'B', 'X', 'Y'] as const,
  edges: [
    { from: 'S', to: 'A', weight: 2 },
    { from: 'A', to: 'B', weight: 3 },
    { from: 'X', to: 'Y', weight: 1 },
    { from: 'Y', to: 'X', weight: -2 },
  ],
} as const

export const BELLMAN_FORD_UNREACHABLE_CYCLE_LAYOUT: Readonly<
  Record<string, { x: number; y: number }>
> = {
  S: { x: 0.12, y: 0.32 },
  A: { x: 0.38, y: 0.32 },
  B: { x: 0.64, y: 0.32 },
  X: { x: 0.38, y: 0.78 },
  Y: { x: 0.68, y: 0.78 },
}

/**
 * Undirected edge A—B of weight -1 can be walked A–B–A forever.
 * That poisons every vertex the cycle can reach, including A and C.
 */
export const BELLMAN_FORD_UNDIRECTED_NEGATIVE = {
  directed: false,
  weighted: true,
  vertices: ['A', 'B', 'C'] as const,
  edges: [
    { from: 'A', to: 'B', weight: -1 },
    { from: 'A', to: 'C', weight: 2 },
  ],
} as const

export const BELLMAN_FORD_UNDIRECTED_NEGATIVE_LAYOUT: Readonly<
  Record<string, { x: number; y: number }>
> = {
  A: { x: 0.32, y: 0.55 },
  B: { x: 0.68, y: 0.28 },
  C: { x: 0.7, y: 0.76 },
}

const ANCHOR_PHASES = new Set<BellmanFordPhase>([
  'iteration-end',
  'early-stop',
  'negative-cycle',
  'complete',
])

export function formatBellmanFordDistance(distance: number): string {
  if (distance === BELLMAN_FORD_NEGATIVE_INFINITY) return '−∞'
  if (!Number.isFinite(distance)) return '∞'
  if (Number.isInteger(distance)) return String(distance)
  const rounded = Math.round(distance * 1000) / 1000
  return String(rounded)
}

export function serializeBellmanFordDistances(
  distances: Readonly<Record<string, number>>,
): string {
  const payload: Record<string, number | null | '-inf'> = {}
  for (const [vertex, distance] of Object.entries(distances)) {
    if (distance === BELLMAN_FORD_NEGATIVE_INFINITY) payload[vertex] = '-inf'
    else if (!Number.isFinite(distance)) payload[vertex] = null
    else payload[vertex] = distance
  }
  return JSON.stringify(payload)
}

export function parseBellmanFordDistances(
  raw: string | null | undefined,
): Record<string, number> {
  if (!raw) return {}
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {}
    }
    const distances: Record<string, number> = {}
    for (const [vertex, value] of Object.entries(parsed)) {
      if (value === '-inf') distances[vertex] = BELLMAN_FORD_NEGATIVE_INFINITY
      else if (value === null) distances[vertex] = BELLMAN_FORD_INFINITY
      else if (typeof value === 'number' && Number.isFinite(value)) {
        distances[vertex] = value
      }
    }
    return distances
  } catch {
    return {}
  }
}

export function serializeBellmanFordHistory(
  columns: readonly BellmanFordIterationColumn[],
): string {
  return JSON.stringify(
    columns.map((column) => ({
      iteration: column.iteration,
      distances: JSON.parse(serializeBellmanFordDistances(column.distances)),
    })),
  )
}

export function parseBellmanFordHistory(
  raw: string | null | undefined,
): BellmanFordIterationColumn[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const columns: BellmanFordIterationColumn[] = []
    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue
      const record = item as Record<string, unknown>
      if (typeof record.iteration !== 'number') continue
      const distances = parseBellmanFordDistances(
        JSON.stringify(record.distances ?? {}),
      )
      columns.push({ iteration: record.iteration, distances })
    }
    return columns
  } catch {
    return []
  }
}

export function serializeBellmanFordRelaxation(
  view: BellmanFordRelaxationView | null,
): string | null {
  if (!view) return null
  return JSON.stringify({
    from: view.from,
    to: view.to,
    weight: view.weight,
    considered: view.considered,
    before: encodeDistance(view.before),
    candidate:
      view.candidate === null ? null : encodeDistance(view.candidate),
    after: encodeDistance(view.after),
    previousBefore: view.previousBefore,
    previousAfter: view.previousAfter,
    updated: view.updated,
  })
}

export function parseBellmanFordRelaxation(
  raw: string | null | undefined,
): BellmanFordRelaxationView | null {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null
    }
    const record = parsed as Record<string, unknown>
    if (typeof record.from !== 'string' || typeof record.to !== 'string') {
      return null
    }
    if (typeof record.weight !== 'number' || !Number.isFinite(record.weight)) {
      return null
    }
    return {
      from: record.from,
      to: record.to,
      weight: record.weight,
      considered: Boolean(record.considered),
      before: decodeDistance(record.before),
      candidate:
        record.candidate === null || record.candidate === undefined
          ? null
          : decodeDistance(record.candidate),
      after: decodeDistance(record.after),
      previousBefore:
        typeof record.previousBefore === 'string' ? record.previousBefore : null,
      previousAfter:
        typeof record.previousAfter === 'string' ? record.previousAfter : null,
      updated: Boolean(record.updated),
    }
  } catch {
    return null
  }
}

export function serializeBellmanFordPrevious(
  previous: Readonly<Record<string, VertexId | null>>,
): string {
  return JSON.stringify(previous)
}

export function parseBellmanFordPrevious(
  raw: string | null | undefined,
): Record<string, VertexId | null> {
  if (!raw) return {}
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {}
    }
    const previous: Record<string, VertexId | null> = {}
    for (const [vertex, value] of Object.entries(parsed)) {
      previous[vertex] = typeof value === 'string' ? value : null
    }
    return previous
  } catch {
    return {}
  }
}

/** Indexes of frames that close a pass or finish the algorithm. */
export function bellmanFordAnchorIndexes(
  steps: readonly VisualizationStep[],
): number[] {
  const indexes: number[] = []
  steps.forEach((step, index) => {
    const phase = step.meta?.phase
    if (typeof phase === 'string' && ANCHOR_PHASES.has(phase as BellmanFordPhase)) {
      indexes.push(index)
    }
  })
  return indexes
}

type RunOptions = BellmanFordOptions & {
  readonly onStep?: (frame: BellmanFordFrame) => void
}

type BellmanFordFrame = {
  phase: BellmanFordPhase
  title: string
  explanation: string
  detail?: string
  iteration: number
  maxIterations: number
  activeEdge: TraversalEdge | null
  relaxation: BellmanFordRelaxationView | null
  distances: Record<string, number>
  previous: Record<string, VertexId | null>
  history: BellmanFordIterationColumn[]
  path: VertexId[]
  affected: VertexId[]
  negativeCycle: VertexId[]
  hasReachableNegativeCycle: boolean
  earlyTerminated: boolean
  finalized: boolean
  message: string
}

function encodeDistance(distance: number): number | null | '-inf' {
  if (distance === BELLMAN_FORD_NEGATIVE_INFINITY) return '-inf'
  if (!Number.isFinite(distance)) return null
  return distance
}

function decodeDistance(value: unknown): number {
  if (value === '-inf') return BELLMAN_FORD_NEGATIVE_INFINITY
  if (typeof value === 'number' && Number.isFinite(value)) return value
  return BELLMAN_FORD_INFINITY
}

function edgeArrow(from: VertexId, to: VertexId): string {
  return `${from}→${to}`
}

function cloneDistances(
  distances: Readonly<Record<string, number>>,
): Record<string, number> {
  return { ...distances }
}

function clonePrevious(
  previous: Readonly<Record<string, VertexId | null>>,
): Record<string, VertexId | null> {
  return { ...previous }
}

function emptyDistances(snapshot: GraphSnapshot): Record<string, number> {
  const distances: Record<string, number> = {}
  for (const vertex of snapshot.vertices) {
    distances[vertex] = BELLMAN_FORD_INFINITY
  }
  return distances
}

function emptyPrevious(
  snapshot: GraphSnapshot,
): Record<string, VertexId | null> {
  const previous: Record<string, VertexId | null> = {}
  for (const vertex of snapshot.vertices) {
    previous[vertex] = null
  }
  return previous
}

function resolveVertex(
  snapshot: GraphSnapshot,
  raw: string | null | undefined,
): VertexId | null {
  if (raw === null || raw === undefined) return null
  const id = raw.trim()
  if (!id || !hasVertex(snapshot, id)) return null
  return snapshot.vertices.find((vertex) => vertex === id) ?? null
}

/**
 * Outgoing adjacency in vertex insertion order, neighbors in stored order.
 * Undirected graphs already list both directions, so each edge is relaxed
 * both ways.
 */
export function bellmanFordEdges(snapshot: GraphSnapshot): RelaxationEdge[] {
  const edges: RelaxationEdge[] = []
  for (const from of snapshot.vertices) {
    for (const neighbor of snapshot.adjacency[from] ?? []) {
      edges.push({ from, to: neighbor.to, weight: neighbor.weight })
    }
  }
  return edges
}

function findNonFiniteEdge(snapshot: GraphSnapshot): RelaxationEdge | null {
  for (const edge of bellmanFordEdges(snapshot)) {
    if (!Number.isFinite(edge.weight)) return edge
  }
  return null
}

function failedResult(
  snapshot: GraphSnapshot,
  source: VertexId | null,
  destination: VertexId | null,
  reason: string,
): BellmanFordResult {
  const vertexState: Record<string, BellmanFordVertexState> = {}
  for (const vertex of snapshot.vertices) vertexState[vertex] = 'unreachable'
  return {
    ok: false,
    reason,
    outcome: 'invalid',
    source,
    destination,
    distances: emptyDistances(snapshot),
    previous: emptyPrevious(snapshot),
    path: [],
    reachable: false,
    hasReachableNegativeCycle: false,
    negativeCycle: [],
    affectedVertices: [],
    vertexState,
    iterationsRun: 0,
    earlyTerminated: false,
    iterationDistances: [],
  }
}

function vertexStateOf(
  distance: number,
): BellmanFordVertexState {
  if (distance === BELLMAN_FORD_NEGATIVE_INFINITY) return 'negative-cycle'
  if (!Number.isFinite(distance)) return 'unreachable'
  return 'shortest'
}

function buildVertexState(
  snapshot: GraphSnapshot,
  distances: Readonly<Record<string, number>>,
): Record<string, BellmanFordVertexState> {
  const vertexState: Record<string, BellmanFordVertexState> = {}
  for (const vertex of snapshot.vertices) {
    vertexState[vertex] = vertexStateOf(distances[vertex] ?? BELLMAN_FORD_INFINITY)
  }
  return vertexState
}

function pathFor(
  previous: Readonly<Record<string, VertexId | null>>,
  source: VertexId,
  destination: VertexId | null,
  distances: Readonly<Record<string, number>>,
): VertexId[] {
  if (destination === null) return []
  const distance = distances[destination]
  if (distance === undefined || !Number.isFinite(distance)) return []
  if (destination === source) return [source]
  return reconstructShortestPath(previous, source, destination)
}

function extractCycle(
  previous: Readonly<Record<string, VertexId | null>>,
  start: VertexId,
  vertexCount: number,
): VertexId[] {
  let cursor: VertexId | null = start
  for (let step = 0; step < vertexCount && cursor; step += 1) {
    cursor = previous[cursor] ?? null
  }
  if (!cursor) return []
  const cycle: VertexId[] = []
  const guard = new Set<VertexId>()
  while (cursor && !guard.has(cursor)) {
    guard.add(cursor)
    cycle.push(cursor)
    cursor = previous[cursor] ?? null
  }
  cycle.reverse()
  return cycle
}

function orderByVertices(
  snapshot: GraphSnapshot,
  ids: Iterable<VertexId>,
): VertexId[] {
  const selected = new Set(ids)
  return snapshot.vertices.filter((vertex) => selected.has(vertex))
}

/**
 * Run Bellman-Ford from `source`.
 * Does not mutate `snapshot`.
 * Missing source or destination, or a non-finite weight, returns `ok: false`.
 */
export function bellmanFord(
  snapshot: GraphSnapshot,
  options: BellmanFordOptions,
): BellmanFordResult {
  return runBellmanFord(snapshot, options)
}

function runBellmanFord(
  snapshot: GraphSnapshot,
  options: RunOptions,
): BellmanFordResult {
  const source = resolveVertex(snapshot, options.source)
  const destination =
    options.destination === undefined || options.destination === null
      ? null
      : resolveVertex(snapshot, options.destination)
  const vertexCount = snapshot.vertices.length
  const maxIterations = Math.max(vertexCount - 1, 0)
  const edges = bellmanFordEdges(snapshot)

  const history: BellmanFordIterationColumn[] = []

  const emit = (
    info: Omit<
      BellmanFordFrame,
      'distances' | 'previous' | 'history' | 'maxIterations'
    > & {
      distances: Record<string, number>
      previous: Record<string, VertexId | null>
    },
  ) => {
    options.onStep?.({
      ...info,
      maxIterations,
      distances: cloneDistances(info.distances),
      previous: clonePrevious(info.previous),
      history: history.map((column) => ({
        iteration: column.iteration,
        distances: cloneDistances(column.distances),
      })),
    })
  }

  if (source === null) {
    const reason = `Source vertex "${options.source.trim()}" does not exist.`
    const result = failedResult(snapshot, null, destination, reason)
    emit({
      phase: 'invalid',
      title: 'Source vertex missing',
      explanation: `${reason} Bellman-Ford needs a source that is already in the graph. Distances stay unset and no edge is relaxed.`,
      message: 'Invalid source',
      iteration: 0,
      activeEdge: null,
      relaxation: null,
      distances: result.distances as Record<string, number>,
      previous: result.previous as Record<string, VertexId | null>,
      path: [],
      affected: [],
      negativeCycle: [],
      hasReachableNegativeCycle: false,
      earlyTerminated: false,
      finalized: true,
    })
    return result
  }

  if (
    options.destination != null &&
    options.destination.trim() !== '' &&
    destination === null
  ) {
    const reason = `Destination vertex "${options.destination.trim()}" does not exist.`
    const result = failedResult(snapshot, source, null, reason)
    emit({
      phase: 'invalid',
      title: 'Destination vertex missing',
      explanation: `${reason} Pick a destination that exists, or clear the destination. No edge is relaxed.`,
      message: 'Invalid destination',
      iteration: 0,
      activeEdge: null,
      relaxation: null,
      distances: result.distances as Record<string, number>,
      previous: result.previous as Record<string, VertexId | null>,
      path: [],
      affected: [],
      negativeCycle: [],
      hasReachableNegativeCycle: false,
      earlyTerminated: false,
      finalized: true,
    })
    return result
  }

  const nonFinite = findNonFiniteEdge(snapshot)
  if (nonFinite) {
    const reason = `Edge ${edgeArrow(nonFinite.from, nonFinite.to)} has a non-finite weight. Bellman-Ford needs every weight to be a finite number. Negative and zero weights are allowed.`
    const result = failedResult(snapshot, source, destination, reason)
    emit({
      phase: 'invalid',
      title: 'Non-finite weight',
      explanation: reason,
      message: 'Invalid weight',
      iteration: 0,
      activeEdge: { from: nonFinite.from, to: nonFinite.to },
      relaxation: null,
      distances: result.distances as Record<string, number>,
      previous: result.previous as Record<string, VertexId | null>,
      path: [],
      affected: [],
      negativeCycle: [],
      hasReachableNegativeCycle: false,
      earlyTerminated: false,
      finalized: true,
    })
    return result
  }

  const distances = emptyDistances(snapshot)
  const previous = emptyPrevious(snapshot)
  distances[source] = 0
  history.push({ iteration: 0, distances: cloneDistances(distances) })

  const directionNote = snapshot.directed
    ? 'Directed edges relax only along the arrow.'
    : 'Undirected edges are stored in both directions, so each one is relaxed both ways. A negative undirected edge is a negative cycle, because the walk can cross it and come straight back.'

  emit({
    phase: 'initialize',
    title: `Initialize distances from ${source}`,
    explanation: `Bellman-Ford finds shortest paths from ${source} and reports a reachable negative cycle when one exists. Set dist(${source}) = 0 and every other distance to ∞. Previous vertices start empty. A shortest path that does not repeat a vertex uses at most ${maxIterations} edge${maxIterations === 1 ? '' : 's'} (|V| - 1 = ${vertexCount} - 1). The next passes relax all ${edges.length} outgoing adjacency entries, one edge at a time. ${directionNote}`,
    detail: destination
      ? `Destination: ${destination}. ${source === destination ? `Source and destination are the same vertex.` : ''}`
      : 'No destination filter. Distances are still computed for every vertex.',
    message: `dist(${source}) = 0`,
    iteration: 0,
    activeEdge: null,
    relaxation: null,
    distances,
    previous,
    path: pathFor(previous, source, destination, distances),
    affected: [],
    negativeCycle: [],
    hasReachableNegativeCycle: false,
    earlyTerminated: false,
    finalized: false,
  })

  let iterationsRun = 0
  let earlyTerminated = false
  let provedNoNegativeCycle = false

  const relaxEdge = (edge: RelaxationEdge): BellmanFordRelaxationView => {
    const before = distances[edge.to] ?? BELLMAN_FORD_INFINITY
    const previousBefore = previous[edge.to] ?? null
    const tail = distances[edge.from] ?? BELLMAN_FORD_INFINITY
    if (!Number.isFinite(tail)) {
      return {
        from: edge.from,
        to: edge.to,
        weight: edge.weight,
        considered: false,
        before,
        candidate: null,
        after: before,
        previousBefore,
        previousAfter: previousBefore,
        updated: false,
      }
    }
    const candidate = tail + edge.weight
    if (candidate < before) {
      distances[edge.to] = candidate
      previous[edge.to] = edge.from
      return {
        from: edge.from,
        to: edge.to,
        weight: edge.weight,
        considered: true,
        before,
        candidate,
        after: candidate,
        previousBefore,
        previousAfter: edge.from,
        updated: true,
      }
    }
    return {
      from: edge.from,
      to: edge.to,
      weight: edge.weight,
      considered: true,
      before,
      candidate,
      after: before,
      previousBefore,
      previousAfter: previousBefore,
      updated: false,
    }
  }

  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    emit({
      phase: 'iteration-start',
      title: `Start iteration ${iteration}`,
      explanation: `Iteration ${iteration} of at most ${maxIterations}. This pass relaxes every edge once, in adjacency order. It is a full iteration, not a single edge. Distances stay where the previous pass left them until an edge on this pass improves one. ${iteration === 1 ? 'The first pass can only use edges that leave the source, because every other tail is still ∞.' : `Pass ${iteration} can use improvements discovered on earlier passes. That is why a negative edge is allowed to fix a distance Dijkstra would already have frozen.`}`,
      detail: `${edges.length} edge${edges.length === 1 ? '' : 's'} to inspect. No distance has changed on this pass yet.`,
      message: `Iteration ${iteration} begins`,
      iteration,
      activeEdge: null,
      relaxation: null,
      distances,
      previous,
      path: pathFor(previous, source, destination, distances),
      affected: [],
      negativeCycle: [],
      hasReachableNegativeCycle: false,
      earlyTerminated: false,
      finalized: false,
    })

    let updated = false
    for (const edge of edges) {
      const view = relaxEdge(edge)
      if (view.updated) updated = true
      const weightLabel = formatBellmanFordDistance(view.weight)
      const beforeLabel = formatBellmanFordDistance(view.before)
      const afterLabel = formatBellmanFordDistance(view.after)
      const candidateLabel = formatBellmanFordDistance(
        view.candidate ?? BELLMAN_FORD_INFINITY,
      )
      const tailLabel =
        view.candidate === null
          ? '∞'
          : formatBellmanFordDistance(view.candidate - view.weight)
      let explanation: string
      let detail: string
      if (!view.considered) {
        explanation = `Iteration ${iteration}, edge relaxation of ${edgeArrow(view.from, view.to)} (weight ${weightLabel}). dist(${view.from}) is still ∞, so this edge is not considered. No candidate is calculated, dist(${view.to}) stays ${beforeLabel}, and the previous vertex of ${view.to} stays ${view.previousAfter ?? '—'}. A negative edge in another component cannot change source-reachable distances while its tail is unreachable.`
        detail = `Tail ${view.from} is unreachable. No update.`
      } else if (view.updated) {
        explanation = `Iteration ${iteration}, edge relaxation of ${edgeArrow(view.from, view.to)} (weight ${weightLabel}). Distance before relaxation: dist(${view.to}) = ${beforeLabel}. Candidate = dist(${view.from}) + ${weightLabel} = ${candidateLabel}. That is smaller, so the distance after relaxation is ${afterLabel} and the previous vertex of ${view.to} changes from ${view.previousBefore ?? '—'} to ${view.previousAfter}. This is one edge, not the end of the iteration.`
        detail = `${tailLabel} + ${weightLabel} = ${candidateLabel} < ${beforeLabel}`
      } else {
        explanation = `Iteration ${iteration}, edge relaxation of ${edgeArrow(view.from, view.to)} (weight ${weightLabel}). Distance before relaxation: dist(${view.to}) = ${beforeLabel}. Candidate = dist(${view.from}) + ${weightLabel} = ${candidateLabel}. That is not smaller, so the distance after relaxation stays ${afterLabel} and the previous vertex stays ${view.previousAfter ?? '—'}. No update on this edge.`
        detail = `${tailLabel} + ${weightLabel} = ${candidateLabel} ≥ ${beforeLabel}`
      }
      emit({
        phase: 'relax',
        title: view.updated
          ? `Update ${view.to} via ${edgeArrow(view.from, view.to)}`
          : `Inspect ${edgeArrow(view.from, view.to)}`,
        explanation,
        detail,
        message: view.updated
          ? `dist(${view.to}) = ${afterLabel}`
          : `No update for ${view.to}`,
        iteration,
        activeEdge: { from: view.from, to: view.to },
        relaxation: view,
        distances,
        previous,
        path: pathFor(previous, source, destination, distances),
        affected: [],
        negativeCycle: [],
        hasReachableNegativeCycle: false,
        earlyTerminated: false,
        finalized: false,
      })
    }

    iterationsRun += 1
    history.push({ iteration, distances: cloneDistances(distances) })

    if (!updated) {
      provedNoNegativeCycle = true
      const skipped = maxIterations - iteration
      if (iteration < maxIterations) {
        earlyTerminated = true
        emit({
          phase: 'early-stop',
          title: `Iteration ${iteration} changed nothing`,
          explanation: `Every edge was relaxed on iteration ${iteration} and no distance changed. Further iterations would repeat the same comparisons, so Bellman-Ford stops ${skipped} pass${skipped === 1 ? '' : 'es'} early instead of running all ${maxIterations}. A reachable negative cycle would have made some finite distance smaller on this pass, so this clean pass also proves there is no reachable negative cycle. The extra detection pass is unnecessary. Unreachable vertices stay ∞.`,
          detail: `Early termination after ${iteration} of ${maxIterations} iterations.`,
          message: 'No updates. Stop early.',
          iteration,
          activeEdge: null,
          relaxation: null,
          distances,
          previous,
          path: pathFor(previous, source, destination, distances),
          affected: [],
          negativeCycle: [],
          hasReachableNegativeCycle: false,
          earlyTerminated: true,
          finalized: false,
        })
      } else {
        emit({
          phase: 'iteration-end',
          title: `Iteration ${iteration} changed nothing`,
          explanation: `Iteration ${iteration} was the last of the |V| - 1 passes, and no distance changed. That clean pass proves no reachable negative cycle: another relaxation cannot improve a finite distance. The extra detection pass is unnecessary.`,
          detail: `Completed all ${maxIterations} iterations. The last pass was clean.`,
          message: 'No updates on the last pass.',
          iteration,
          activeEdge: null,
          relaxation: null,
          distances,
          previous,
          path: pathFor(previous, source, destination, distances),
          affected: [],
          negativeCycle: [],
          hasReachableNegativeCycle: false,
          earlyTerminated: false,
          finalized: false,
        })
      }
      break
    }

    emit({
      phase: 'iteration-end',
      title: `Iteration ${iteration} complete`,
      explanation: `Iteration ${iteration} has relaxed every edge. At least one distance improved, so the estimates above are the column for this pass. ${iteration < maxIterations ? `Another pass can still improve a path that uses more edges, up to ${maxIterations} edges.` : 'This was the last of the |V| - 1 passes. One more check looks for a reachable negative cycle.'} Individual edge updates inside the pass were the relaxation steps. This frame is the end of the iteration.`,
      detail: `Pass ${iteration} of ${maxIterations} updated at least one distance.`,
      message: `Iteration ${iteration} finished`,
      iteration,
      activeEdge: null,
      relaxation: null,
      distances,
      previous,
      path: pathFor(previous, source, destination, distances),
      affected: [],
      negativeCycle: [],
      hasReachableNegativeCycle: false,
      earlyTerminated: false,
      finalized: false,
    })
  }

  const affected = new Set<VertexId>()
  let negativeCycle: VertexId[] = []

  if (!provedNoNegativeCycle) {
    const seeds: VertexId[] = []
    for (const edge of edges) {
      const view = relaxEdge(edge)
      const weightLabel = formatBellmanFordDistance(view.weight)
      const beforeLabel = formatBellmanFordDistance(view.before)
      let explanation: string
      if (!view.considered) {
        explanation = `Negative-cycle check, not a shortest-path iteration. Edge ${edgeArrow(view.from, view.to)} (weight ${weightLabel}) is skipped because dist(${view.from}) is ∞. An unreachable negative edge does not affect vertices the source can reach.`
      } else if (view.updated) {
        explanation = `Negative-cycle check on ${edgeArrow(view.from, view.to)} (weight ${weightLabel}). After |V| - 1 passes, a simple path would already be finished. Distance before this check: ${beforeLabel}. Candidate ${formatBellmanFordDistance(view.candidate ?? BELLMAN_FORD_INFINITY)} is still smaller, so the distance falls to ${formatBellmanFordDistance(view.after)}. That improvement means a reachable negative cycle can reduce the cost forever. The finite number is only an estimate and will not be reported as a shortest path.`
      } else {
        explanation = `Negative-cycle check on ${edgeArrow(view.from, view.to)} (weight ${weightLabel}). Candidate ${formatBellmanFordDistance(view.candidate ?? BELLMAN_FORD_INFINITY)} is not smaller than ${beforeLabel}, so this edge does not prove a cycle by itself.`
      }
      if (view.updated) seeds.push(view.to)
      emit({
        phase: 'negative-check',
        title: view.updated
          ? `Still improving ${view.to}`
          : `Check ${edgeArrow(view.from, view.to)}`,
        explanation,
        detail: view.updated
          ? 'This edge still relaxes on the extra pass.'
          : 'No improvement on this edge.',
        message: view.updated
          ? `${view.to} can still decrease`
          : `Check ${edgeArrow(view.from, view.to)}`,
        iteration: maxIterations + 1,
        activeEdge: { from: view.from, to: view.to },
        relaxation: view,
        distances,
        previous,
        path: pathFor(previous, source, destination, distances),
        affected: [],
        negativeCycle: [],
        hasReachableNegativeCycle: false,
        earlyTerminated: false,
        finalized: false,
      })
    }

    if (seeds.length > 0) {
      const queue = [...seeds]
      for (const seed of seeds) affected.add(seed)
      let head = 0
      while (head < queue.length) {
        const vertex = queue[head]
        head += 1
        if (!vertex) continue
        for (const neighbor of snapshot.adjacency[vertex] ?? []) {
          if (affected.has(neighbor.to)) continue
          affected.add(neighbor.to)
          queue.push(neighbor.to)
        }
      }
      const cycleStart = seeds[0]
      if (cycleStart) {
        negativeCycle = extractCycle(previous, cycleStart, vertexCount)
      }
      for (const vertex of affected) {
        distances[vertex] = BELLMAN_FORD_NEGATIVE_INFINITY
        previous[vertex] = null
      }
    }
  }

  const hasReachableNegativeCycle = affected.size > 0
  const affectedVertices = orderByVertices(snapshot, affected)
  const cycleEdges = cycleEdgeList(negativeCycle)
  const vertexState = buildVertexState(snapshot, distances)
  const path = pathFor(previous, source, destination, distances)
  const reachable =
    destination !== null && vertexState[destination] === 'shortest'

  let reason: string | undefined
  if (destination && vertexState[destination] === 'negative-cycle') {
    reason = `No finite shortest path from ${source} to ${destination}. A reachable negative cycle can reduce that cost forever.`
  } else if (destination && vertexState[destination] === 'unreachable') {
    reason = `No path from ${source} to ${destination}. Its distance stays ∞.`
  } else if (hasReachableNegativeCycle) {
    reason =
      'A reachable negative cycle exists. Affected vertices have no finite shortest path. Other vertices keep their finite distances.'
  }

  const cycleText =
    negativeCycle.length > 0
      ? ` One cycle is ${formatCycle(negativeCycle)}.`
      : ''
  const affectedText =
    affectedVertices.length > 0
      ? ` Affected vertices: ${affectedVertices.join(', ')}. Their distance is −∞, not the last finite estimate.`
      : ''

  if (hasReachableNegativeCycle) {
    emit({
      phase: 'negative-cycle',
      title: 'Reachable negative cycle',
      explanation: `Bellman-Ford finished the extra pass. A reachable negative cycle exists, so repeatedly walking it reduces the path cost without bound. Vertices the cycle can reach have no finite shortest path.${cycleText}${affectedText} ${destination ? describeDestination(source, destination, vertexState[destination] ?? 'unreachable', path, distances[destination] ?? BELLMAN_FORD_INFINITY) : 'No destination was requested.'} Unreachable vertices that the cycle cannot reach stay ∞. A negative edge by itself is not a cycle; this result is the cycle.`,
      detail: `Outcome: negative cycle. Iterations run: ${iterationsRun}.`,
      message: 'No finite shortest path on the cycle',
      iteration: maxIterations + 1,
      activeEdge: cycleEdges[0] ?? null,
      relaxation: null,
      distances,
      previous,
      path,
      affected: affectedVertices,
      negativeCycle,
      hasReachableNegativeCycle: true,
      earlyTerminated,
      finalized: true,
    })
  } else {
    const pathText = destination
      ? describeDestination(
          source,
          destination,
          vertexState[destination] ?? 'unreachable',
          path,
          distances[destination] ?? BELLMAN_FORD_INFINITY,
        )
      : 'No destination was requested. Finite distances are shortest paths. ∞ means unreachable.'
    emit({
      phase: 'complete',
      title: 'Bellman-Ford complete',
      explanation: `No reachable negative cycle. ${pathText} ${earlyTerminated ? `The search stopped after iteration ${iterationsRun} because a full pass made no updates.` : provedNoNegativeCycle ? 'The last of the |V| - 1 passes made no updates, which is enough to rule out a reachable negative cycle.' : 'Every required pass was checked.'} Previous pointers reconstruct a finite path by walking backward to the source. This graph may still contain a negative cycle that the source cannot reach. That cycle does not change these distances.`,
      detail: `Iterations run: ${iterationsRun} of ${maxIterations}. Early stop: ${earlyTerminated ? 'yes' : 'no'}.`,
      message: pathText,
      iteration: iterationsRun,
      activeEdge: null,
      relaxation: null,
      distances,
      previous,
      path,
      affected: [],
      negativeCycle: [],
      hasReachableNegativeCycle: false,
      earlyTerminated,
      finalized: true,
    })
  }

  return {
    ok: true,
    reason,
    outcome: hasReachableNegativeCycle ? 'negative-cycle' : 'shortest-paths',
    source,
    destination,
    distances: cloneDistances(distances),
    previous: clonePrevious(previous),
    path,
    reachable,
    hasReachableNegativeCycle,
    negativeCycle: [...negativeCycle],
    affectedVertices,
    vertexState,
    iterationsRun,
    earlyTerminated,
    iterationDistances: history.map((column) => ({
      iteration: column.iteration,
      distances: cloneDistances(column.distances),
    })),
  }
}

function formatCycle(cycle: readonly VertexId[]): string {
  if (cycle.length === 0) return ''
  if (cycle.length === 1) return `${cycle[0]}→${cycle[0]}`
  return `${cycle.join('→')}→${cycle[0]}`
}

function cycleEdgeList(cycle: readonly VertexId[]): TraversalEdge[] {
  if (cycle.length === 0) return []
  if (cycle.length === 1 && cycle[0]) return [{ from: cycle[0], to: cycle[0] }]
  const edges: TraversalEdge[] = []
  for (let index = 0; index < cycle.length; index += 1) {
    const from = cycle[index]
    const to = cycle[(index + 1) % cycle.length]
    if (from && to) edges.push({ from, to })
  }
  return edges
}

function describeDestination(
  source: VertexId,
  destination: VertexId,
  state: BellmanFordVertexState,
  path: readonly VertexId[],
  distance: number,
): string {
  if (state === 'negative-cycle') {
    return `${destination} is affected by a reachable negative cycle, so there is no finite shortest path from ${source} to ${destination}.`
  }
  if (state === 'unreachable') {
    return `No path from ${source} to ${destination}. Its distance stays ∞.`
  }
  if (source === destination) {
    return `Source and destination are both ${source}. The shortest path is [${source}] with distance 0.`
  }
  return `Shortest path ${source} to ${destination}: ${path.join(' → ')} (distance ${formatBellmanFordDistance(distance)}).`
}

/**
 * Immutable visualization frames.
 * Each step stores its own distance table, previous map, and iteration
 * history, so moving backward restores that exact state.
 */
export function buildBellmanFordSteps(
  snapshot: GraphSnapshot,
  sourceInput: string | null,
  destinationInput: string | null,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const graphSnapshot = serializeGraphSnapshot(snapshot)
  let counter = 0

  runBellmanFord(snapshot, {
    source: sourceInput ?? '',
    destination: destinationInput,
    onStep: (frame) => {
      counter += 1
      const cycleEdges = cycleEdgeList(frame.negativeCycle)
      steps.push({
        id: `bellman-ford-${frame.phase}-${counter}`,
        title: frame.title,
        explanation: frame.explanation,
        detail: frame.detail,
        array: [],
        meta: {
          algorithm: 'bellman-ford',
          phase: frame.phase,
          graphSnapshot,
          source: sourceInput?.trim() || null,
          destination: destinationInput?.trim() || null,
          iteration: frame.iteration,
          maxIterations: frame.maxIterations,
          activeEdge: frame.activeEdge
            ? edgeArrow(frame.activeEdge.from, frame.activeEdge.to)
            : null,
          relaxation: serializeBellmanFordRelaxation(frame.relaxation),
          distances: serializeBellmanFordDistances(frame.distances),
          previous: serializeBellmanFordPrevious(frame.previous),
          history: serializeBellmanFordHistory(frame.history),
          path: serializeStringList(frame.path),
          affected: serializeStringList(frame.affected),
          negativeCycle: serializeStringList(frame.negativeCycle),
          cycleEdges: serializeEdges(cycleEdges),
          hasReachableNegativeCycle: frame.hasReachableNegativeCycle,
          earlyTerminated: frame.earlyTerminated,
          finalized: frame.finalized,
          message: frame.message,
        },
      })
    },
  })

  return steps
}
