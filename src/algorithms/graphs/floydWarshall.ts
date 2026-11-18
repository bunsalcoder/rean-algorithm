/**
 * Floyd-Warshall — all-pairs shortest paths by dynamic programming.
 *
 * For every intermediate vertex k, and every pair (i, j):
 *   dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
 * The right-hand side is read from the matrix before k was allowed, so each
 * iteration is one DP layer. k is an allowed intermediate vertex, not a new
 * source. Equal candidates do not replace the current path (strict <).
 *
 * A next-hop matrix reconstructs one deterministic simple path. After the
 * layers finish, a negative diagonal means that vertex lies on a negative
 * cycle. A pair is affected only when it can reach some such vertex and that
 * vertex can reach the destination. Other pairs keep a finite distance or ∞.
 * Affected pairs are not walked, so reconstruction does not loop.
 *
 * The input graph is never mutated. Independent of React.
 *
 * - Time: O(V³)
 * - Space: O(V²) for the distance and next matrices
 */

import type { VisualizationStep } from '../../components/visualizations/types'
import {
  hasVertex,
  type GraphSnapshot,
  type VertexId,
} from '../data-structures/graph'
import {
  serializeEdges,
  serializeGraphSnapshot,
  serializeStringList,
  type TraversalEdge,
} from './traversalShared'

/** No finite path is known between this pair. */
export const FLOYD_WARSHALL_INFINITY = Number.POSITIVE_INFINITY

/**
 * The pair can reach a negative cycle that can also reach the destination.
 * This is not a finite shortest-path length.
 */
export const FLOYD_WARSHALL_NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY

export type FloydWarshallPhase =
  | 'invalid'
  | 'initialize'
  | 'iteration-start'
  | 'consider'
  | 'iteration-end'
  | 'negative-cycle'
  | 'complete'

export type FloydWarshallPairState =
  | 'shortest'
  | 'unreachable'
  | 'negative-cycle'

export type FloydWarshallPair = {
  readonly from: VertexId
  readonly to: VertexId
}

/** Row-major matrix in vertex insertion order. */
export type FloydWarshallMatrix = readonly (readonly number[])[]

/** Successor on the chosen path. Null when no path is stored. */
export type FloydWarshallNextMatrix = readonly (readonly (VertexId | null)[])[]

export type FloydWarshallUpdate = {
  readonly k: VertexId
  readonly i: VertexId
  readonly j: VertexId
  readonly kIndex: number
  readonly iIndex: number
  readonly jIndex: number
  /** dist[i][k] from the matrix before this intermediate vertex. */
  readonly viaIk: number
  /** dist[k][j] from the matrix before this intermediate vertex. */
  readonly viaKj: number
  readonly before: number
  /** Null when either leg is still ∞, so no numeric candidate exists. */
  readonly candidate: number | null
  readonly after: number
  readonly updated: boolean
  readonly nextBefore: VertexId | null
  readonly nextAfter: VertexId | null
}

export type FloydWarshallIteration = {
  /** Null on the initial matrix, before any intermediate vertex is allowed. */
  readonly k: VertexId | null
  readonly distances: FloydWarshallMatrix
  readonly next: FloydWarshallNextMatrix
}

export type FloydWarshallResult = {
  readonly ok: boolean
  readonly reason?: string
  readonly vertices: readonly VertexId[]
  /**
   * Working distances after every intermediate vertex. +∞ means unreachable.
   * A negative diagonal means that vertex is on a negative cycle. Other
   * finite entries are shortest distances only when the pair is unaffected.
   */
  readonly distances: FloydWarshallMatrix
  readonly next: FloydWarshallNextMatrix
  readonly pairState: readonly (readonly FloydWarshallPairState[])[]
  readonly hasNegativeCycle: boolean
  /** Vertices with a negative diagonal, in insertion order. */
  readonly negativeCycleVertices: readonly VertexId[]
  /**
   * Pairs with no finite shortest path because they can reach a negative
   * cycle that can reach the destination. Unreachable pairs are not listed.
   */
  readonly affectedPairs: readonly FloydWarshallPair[]
  /** Index 0 is initialization. Each later entry is the matrix after that k. */
  readonly iterations: readonly FloydWarshallIteration[]
}

export type FloydWarshallPath = {
  readonly ok: boolean
  readonly reason?: string
  readonly source: VertexId | null
  readonly destination: VertexId | null
  readonly state: FloydWarshallPairState | 'invalid'
  readonly distance: number
  readonly path: readonly VertexId[]
  readonly edges: readonly TraversalEdge[]
}

/**
 * Directed routes. Shortest A → D is A–B–C–D (distance 8), not A–D (20)
 * and not A–B–D (11).
 */
export const FLOYD_WARSHALL_ROUTES = {
  directed: true,
  weighted: true,
  vertices: ['A', 'B', 'C', 'D'] as const,
  edges: [
    { from: 'A', to: 'B', weight: 5 },
    { from: 'A', to: 'D', weight: 20 },
    { from: 'B', to: 'C', weight: 2 },
    { from: 'B', to: 'D', weight: 6 },
    { from: 'C', to: 'D', weight: 1 },
  ],
} as const

export const FLOYD_WARSHALL_ROUTES_LAYOUT: Readonly<
  Record<string, { x: number; y: number }>
> = {
  A: { x: 0.14, y: 0.62 },
  B: { x: 0.4, y: 0.24 },
  C: { x: 0.68, y: 0.24 },
  D: { x: 0.86, y: 0.66 },
}

/** Undirected positive roads. Shortest A → D is A–C–B–D (distance 8). */
export const FLOYD_WARSHALL_UNDIRECTED = {
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

export const FLOYD_WARSHALL_UNDIRECTED_LAYOUT: Readonly<
  Record<string, { x: number; y: number }>
> = {
  A: { x: 0.16, y: 0.28 },
  B: { x: 0.55, y: 0.22 },
  C: { x: 0.28, y: 0.74 },
  D: { x: 0.84, y: 0.48 },
}

/** Zero-weight hops beat the direct edge. Shortest A → D is A–B–C–D (distance 1). */
export const FLOYD_WARSHALL_ZERO = {
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

export const FLOYD_WARSHALL_ZERO_LAYOUT: Readonly<
  Record<string, { x: number; y: number }>
> = {
  A: { x: 0.14, y: 0.62 },
  B: { x: 0.38, y: 0.28 },
  C: { x: 0.64, y: 0.28 },
  D: { x: 0.88, y: 0.62 },
}

/**
 * One negative edge and no negative cycle. Shortest A → D is A–C–B–D
 * (distance 4). E is disconnected.
 */
export const FLOYD_WARSHALL_NEGATIVE_EDGE = {
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

export const FLOYD_WARSHALL_NEGATIVE_EDGE_LAYOUT: Readonly<
  Record<string, { x: number; y: number }>
> = {
  A: { x: 0.12, y: 0.5 },
  B: { x: 0.46, y: 0.2 },
  C: { x: 0.46, y: 0.78 },
  D: { x: 0.8, y: 0.36 },
  E: { x: 0.86, y: 0.82 },
}

/**
 * A↔B has total weight 2 + (-3) = -1. S can reach the cycle, and the cycle
 * can reach C. S→S stays 0. X→Y is a separate positive edge and is unaffected.
 */
export const FLOYD_WARSHALL_NEGATIVE_CYCLE = {
  directed: true,
  weighted: true,
  vertices: ['S', 'A', 'B', 'C', 'X', 'Y'] as const,
  edges: [
    { from: 'S', to: 'A', weight: 1 },
    { from: 'A', to: 'B', weight: 2 },
    { from: 'B', to: 'A', weight: -3 },
    { from: 'A', to: 'C', weight: 4 },
    { from: 'X', to: 'Y', weight: 5 },
  ],
} as const

export const FLOYD_WARSHALL_NEGATIVE_CYCLE_LAYOUT: Readonly<
  Record<string, { x: number; y: number }>
> = {
  S: { x: 0.1, y: 0.32 },
  A: { x: 0.36, y: 0.22 },
  B: { x: 0.62, y: 0.18 },
  C: { x: 0.4, y: 0.62 },
  X: { x: 0.72, y: 0.74 },
  Y: { x: 0.9, y: 0.74 },
}

/**
 * A negative self-loop is a negative cycle on that vertex. A→B is affected.
 * B→B and isolated C stay unaffected.
 */
export const FLOYD_WARSHALL_SELF_LOOP = {
  directed: true,
  weighted: true,
  vertices: ['A', 'B', 'C'] as const,
  edges: [
    { from: 'A', to: 'A', weight: -2 },
    { from: 'A', to: 'B', weight: 3 },
  ],
} as const

export const FLOYD_WARSHALL_SELF_LOOP_LAYOUT: Readonly<
  Record<string, { x: number; y: number }>
> = {
  A: { x: 0.28, y: 0.48 },
  B: { x: 0.62, y: 0.28 },
  C: { x: 0.78, y: 0.74 },
}

const ANCHOR_PHASES = new Set<FloydWarshallPhase>([
  'initialize',
  'iteration-end',
  'negative-cycle',
  'complete',
])

type MutableMatrix = number[][]
type MutableNext = (VertexId | null)[][]

type FloydWarshallFrame = {
  phase: FloydWarshallPhase
  title: string
  explanation: string
  detail?: string
  k: VertexId | null
  i: VertexId | null
  j: VertexId | null
  kIndex: number
  iIndex: number
  jIndex: number
  update: FloydWarshallUpdate | null
  distances: MutableMatrix
  baseline: MutableMatrix
  next: MutableNext
  iteration: number
  vertexCount: number
  cellsUpdated: number
  hasNegativeCycle: boolean
  negativeCycleVertices: VertexId[]
  affectedPairs: FloydWarshallPair[]
  finalized: boolean
  message: string
  pathVertices: VertexId[]
  pathEdges: TraversalEdge[]
}

export function formatFloydWarshallDistance(distance: number): string {
  if (distance === FLOYD_WARSHALL_NEGATIVE_INFINITY) return '−∞'
  if (!Number.isFinite(distance)) return '∞'
  if (Object.is(distance, -0)) return '0'
  if (Number.isInteger(distance)) return String(distance)
  const rounded = Math.round(distance * 1000) / 1000
  return String(rounded)
}

export function serializeFloydWarshallMatrix(matrix: FloydWarshallMatrix): string {
  return JSON.stringify(
    matrix.map((row) => row.map((value) => encodeDistance(value))),
  )
}

export function parseFloydWarshallMatrix(
  raw: string | null | undefined,
): number[][] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map((row) => {
      if (!Array.isArray(row)) return []
      return row.map((value) => decodeDistance(value))
    })
  } catch {
    return []
  }
}

export function serializeFloydWarshallNext(
  matrix: FloydWarshallNextMatrix,
): string {
  return JSON.stringify(matrix)
}

export function parseFloydWarshallNext(
  raw: string | null | undefined,
): (VertexId | null)[][] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map((row) => {
      if (!Array.isArray(row)) return []
      return row.map((value) => (typeof value === 'string' ? value : null))
    })
  } catch {
    return []
  }
}

export function serializeFloydWarshallPairs(
  pairs: readonly FloydWarshallPair[],
): string {
  return JSON.stringify(pairs)
}

export function parseFloydWarshallPairs(
  raw: string | null | undefined,
): FloydWarshallPair[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const pairs: FloydWarshallPair[] = []
    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue
      const record = item as Record<string, unknown>
      if (typeof record.from === 'string' && typeof record.to === 'string') {
        pairs.push({ from: record.from, to: record.to })
      }
    }
    return pairs
  } catch {
    return []
  }
}

export function serializeFloydWarshallUpdate(
  update: FloydWarshallUpdate | null,
): string | null {
  if (!update) return null
  return JSON.stringify({
    k: update.k,
    i: update.i,
    j: update.j,
    kIndex: update.kIndex,
    iIndex: update.iIndex,
    jIndex: update.jIndex,
    viaIk: encodeDistance(update.viaIk),
    viaKj: encodeDistance(update.viaKj),
    before: encodeDistance(update.before),
    candidate: update.candidate === null ? null : encodeDistance(update.candidate),
    after: encodeDistance(update.after),
    updated: update.updated,
    nextBefore: update.nextBefore,
    nextAfter: update.nextAfter,
  })
}

export function parseFloydWarshallUpdate(
  raw: string | null | undefined,
): FloydWarshallUpdate | null {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null
    }
    const record = parsed as Record<string, unknown>
    if (
      typeof record.k !== 'string' ||
      typeof record.i !== 'string' ||
      typeof record.j !== 'string'
    ) {
      return null
    }
    return {
      k: record.k,
      i: record.i,
      j: record.j,
      kIndex: typeof record.kIndex === 'number' ? record.kIndex : 0,
      iIndex: typeof record.iIndex === 'number' ? record.iIndex : 0,
      jIndex: typeof record.jIndex === 'number' ? record.jIndex : 0,
      viaIk: decodeDistance(record.viaIk),
      viaKj: decodeDistance(record.viaKj),
      before: decodeDistance(record.before),
      candidate:
        record.candidate === null || record.candidate === undefined
          ? null
          : decodeDistance(record.candidate),
      after: decodeDistance(record.after),
      updated: Boolean(record.updated),
      nextBefore: typeof record.nextBefore === 'string' ? record.nextBefore : null,
      nextAfter: typeof record.nextAfter === 'string' ? record.nextAfter : null,
    }
  } catch {
    return null
  }
}

/** Indexes of frames that close a layer or finish the algorithm. */
export function floydWarshallAnchorIndexes(
  steps: readonly VisualizationStep[],
): number[] {
  const indexes: number[] = []
  steps.forEach((step, index) => {
    const phase = step.meta?.phase
    if (
      typeof phase === 'string' &&
      ANCHOR_PHASES.has(phase as FloydWarshallPhase)
    ) {
      indexes.push(index)
    }
  })
  return indexes
}

function encodeDistance(distance: number): number | null | '-inf' {
  if (distance === FLOYD_WARSHALL_NEGATIVE_INFINITY) return '-inf'
  if (!Number.isFinite(distance)) return null
  return distance
}

function decodeDistance(value: unknown): number {
  if (value === '-inf') return FLOYD_WARSHALL_NEGATIVE_INFINITY
  if (typeof value === 'number' && Number.isFinite(value)) return value
  return FLOYD_WARSHALL_INFINITY
}

function cloneMatrix(matrix: readonly (readonly number[])[]): MutableMatrix {
  return matrix.map((row) => row.slice())
}

function cloneNext(
  matrix: readonly (readonly (VertexId | null)[])[],
): MutableNext {
  return matrix.map((row) => row.slice())
}

function emptyStateMatrix(
  count: number,
  state: FloydWarshallPairState,
): FloydWarshallPairState[][] {
  return Array.from({ length: count }, () =>
    Array.from({ length: count }, () => state),
  )
}

/**
 * Reconstruct one shortest path from the next-hop matrix.
 * When `affectedPairs` is provided, an affected pair returns immediately
 * and the successor chain is not walked.
 * Ties were already broken when the matrix was built: an equal candidate
 * does not replace the stored successor.
 */
export function reconstructFloydWarshallPath(options: {
  readonly vertices: readonly VertexId[]
  readonly distances: FloydWarshallMatrix
  readonly next: FloydWarshallNextMatrix
  readonly source: string
  readonly destination: string
  readonly affectedPairs?: readonly FloydWarshallPair[]
}): FloydWarshallPath {
  const vertices = options.vertices
  const sourceId = options.source.trim()
  const destinationId = options.destination.trim()
  const source = vertices.find((vertex) => vertex === sourceId) ?? null
  const destination =
    vertices.find((vertex) => vertex === destinationId) ?? null

  if (!source || !destination) {
    const missing = !source ? sourceId : destinationId
    return {
      ok: false,
      reason: `Vertex "${missing}" is not in the graph.`,
      source,
      destination,
      state: 'invalid',
      distance: FLOYD_WARSHALL_INFINITY,
      path: [],
      edges: [],
    }
  }

  const indexOf = new Map(vertices.map((vertex, index) => [vertex, index]))
  const sourceIndex = indexOf.get(source) ?? 0
  const destinationIndex = indexOf.get(destination) ?? 0
  const affected = options.affectedPairs?.some(
    (pair) => pair.from === source && pair.to === destination,
  )

  if (affected) {
    return {
      ok: true,
      reason: `No finite shortest path from ${source} to ${destination}. The pair can reach a negative cycle that can also reach the destination, so the cost can fall forever.`,
      source,
      destination,
      state: 'negative-cycle',
      distance: FLOYD_WARSHALL_NEGATIVE_INFINITY,
      path: [],
      edges: [],
    }
  }

  const diagonal = options.distances[sourceIndex]?.[sourceIndex]
  if (source === destination) {
    if (typeof diagonal === 'number' && diagonal < 0) {
      return {
        ok: true,
        reason: `${source} lies on a negative cycle because dist[${source}][${source}] is negative. The shortest closed walk is not a finite number.`,
        source,
        destination,
        state: 'negative-cycle',
        distance: FLOYD_WARSHALL_NEGATIVE_INFINITY,
        path: [],
        edges: [],
      }
    }
    return {
      ok: true,
      reason: `Source and destination are both ${source}. The shortest path is that single vertex and the distance is 0.`,
      source,
      destination,
      state: 'shortest',
      distance: 0,
      path: [source],
      edges: [],
    }
  }

  const stored = options.distances[sourceIndex]?.[destinationIndex]
  if (stored === undefined || !Number.isFinite(stored)) {
    return {
      ok: true,
      reason: `No path from ${source} to ${destination}. The distance stays ∞.`,
      source,
      destination,
      state: 'unreachable',
      distance: FLOYD_WARSHALL_INFINITY,
      path: [],
      edges: [],
    }
  }

  const hop = options.next[sourceIndex]?.[destinationIndex]
  if (!hop) {
    return {
      ok: true,
      reason: `No successor is stored from ${source} to ${destination}.`,
      source,
      destination,
      state: 'unreachable',
      distance: FLOYD_WARSHALL_INFINITY,
      path: [],
      edges: [],
    }
  }

  const path: VertexId[] = [source]
  const seen = new Set<VertexId>([source])
  let cursor = sourceIndex
  while (vertices[cursor] !== destination) {
    const nextHop = options.next[cursor]?.[destinationIndex] ?? null
    if (!nextHop || !indexOf.has(nextHop)) {
      return {
        ok: true,
        reason: `The successor chain from ${source} to ${destination} is incomplete, so no path is reported.`,
        source,
        destination,
        state: 'unreachable',
        distance: FLOYD_WARSHALL_INFINITY,
        path: [],
        edges: [],
      }
    }
    if (seen.has(nextHop)) {
      return {
        ok: true,
        reason: `The successor chain from ${source} to ${destination} repeats ${nextHop}. That walk is not a simple shortest path, so it is not reconstructed.`,
        source,
        destination,
        state: 'negative-cycle',
        distance: FLOYD_WARSHALL_NEGATIVE_INFINITY,
        path: [],
        edges: [],
      }
    }
    seen.add(nextHop)
    path.push(nextHop)
    cursor = indexOf.get(nextHop) ?? cursor
    if (path.length > vertices.length) {
      return {
        ok: true,
        reason: `The successor chain from ${source} to ${destination} is longer than the vertex count, so it is not a simple path.`,
        source,
        destination,
        state: 'negative-cycle',
        distance: FLOYD_WARSHALL_NEGATIVE_INFINITY,
        path: [],
        edges: [],
      }
    }
  }

  const edges: TraversalEdge[] = []
  for (let index = 0; index < path.length - 1; index += 1) {
    const from = path[index]
    const to = path[index + 1]
    if (from && to) edges.push({ from, to })
  }

  return {
    ok: true,
    reason: `Shortest path ${source} to ${destination}: ${path.join(' → ')} (distance ${formatFloydWarshallDistance(stored)}).`,
    source,
    destination,
    state: 'shortest',
    distance: stored,
    path,
    edges,
  }
}

type RunOptions = {
  readonly onStep?: (frame: FloydWarshallFrame) => void
  readonly pathSource?: string | null
  readonly pathDestination?: string | null
}

function findNonFiniteEdge(
  snapshot: GraphSnapshot,
): { from: VertexId; to: VertexId; weight: number } | null {
  for (const from of snapshot.vertices) {
    for (const neighbor of snapshot.adjacency[from] ?? []) {
      if (!Number.isFinite(neighbor.weight)) {
        return { from, to: neighbor.to, weight: neighbor.weight }
      }
    }
  }
  return null
}

function failedResult(snapshot: GraphSnapshot, reason: string): FloydWarshallResult {
  const count = snapshot.vertices.length
  return {
    ok: false,
    reason,
    vertices: [...snapshot.vertices],
    distances: cloneMatrix(
      Array.from({ length: count }, () =>
        Array.from({ length: count }, () => FLOYD_WARSHALL_INFINITY),
      ),
    ),
    next: cloneNext(
      Array.from({ length: count }, () =>
        Array.from({ length: count }, () => null),
      ),
    ),
    pairState: emptyStateMatrix(count, 'unreachable'),
    hasNegativeCycle: false,
    negativeCycleVertices: [],
    affectedPairs: [],
    iterations: [],
  }
}

/**
 * Run Floyd-Warshall on a graph snapshot.
 * Does not mutate `snapshot`.
 * A non-finite weight returns `ok: false`.
 */
export function floydWarshall(snapshot: GraphSnapshot): FloydWarshallResult {
  return runFloydWarshall(snapshot, {})
}

function runFloydWarshall(
  snapshot: GraphSnapshot,
  options: RunOptions,
): FloydWarshallResult {
  const vertices = snapshot.vertices
  const count = vertices.length
  const indexOf = new Map(vertices.map((vertex, index) => [vertex, index]))

  const emit = (frame: FloydWarshallFrame) => {
    options.onStep?.({
      ...frame,
      distances: cloneMatrix(frame.distances),
      baseline: cloneMatrix(frame.baseline),
      next: cloneNext(frame.next),
      negativeCycleVertices: [...frame.negativeCycleVertices],
      affectedPairs: frame.affectedPairs.map((pair) => ({ ...pair })),
      pathVertices: [...frame.pathVertices],
      pathEdges: frame.pathEdges.map((edge) => ({ ...edge })),
    })
  }

  const nonFinite = findNonFiniteEdge(snapshot)
  if (nonFinite) {
    const reason = `Edge ${nonFinite.from} → ${nonFinite.to} has a non-finite weight. Floyd-Warshall needs every weight to be a finite number. Negative and zero weights are allowed.`
    const result = failedResult(snapshot, reason)
    emit({
      phase: 'invalid',
      title: 'Non-finite weight',
      explanation: reason,
      message: 'Invalid weight',
      k: null,
      i: null,
      j: null,
      kIndex: -1,
      iIndex: -1,
      jIndex: -1,
      update: null,
      distances: result.distances as MutableMatrix,
      baseline: result.distances as MutableMatrix,
      next: result.next as MutableNext,
      iteration: 0,
      vertexCount: count,
      cellsUpdated: 0,
      hasNegativeCycle: false,
      negativeCycleVertices: [],
      affectedPairs: [],
      finalized: true,
      pathVertices: [],
      pathEdges: [],
    })
    return result
  }

  const distances: MutableMatrix = Array.from({ length: count }, () =>
    Array.from({ length: count }, () => FLOYD_WARSHALL_INFINITY),
  )
  const next: MutableNext = Array.from({ length: count }, () =>
    Array.from({ length: count }, () => null),
  )

  for (let index = 0; index < count; index += 1) {
    distances[index]![index] = 0
    next[index]![index] = vertices[index] ?? null
  }

  for (const from of vertices) {
    const fromIndex = indexOf.get(from)
    if (fromIndex === undefined) continue
    for (const neighbor of snapshot.adjacency[from] ?? []) {
      const toIndex = indexOf.get(neighbor.to)
      if (toIndex === undefined) continue
      const weight = neighbor.weight
      if (fromIndex === toIndex) {
        if (weight < distances[fromIndex]![toIndex]!) {
          distances[fromIndex]![toIndex] = weight
        }
        continue
      }
      if (weight < distances[fromIndex]![toIndex]!) {
        distances[fromIndex]![toIndex] = weight
        next[fromIndex]![toIndex] = neighbor.to
      }
    }
  }

  const iterations: FloydWarshallIteration[] = [
    {
      k: null,
      distances: cloneMatrix(distances),
      next: cloneNext(next),
    },
  ]

  const initialSummary =
    count === 0
      ? 'The graph has no vertices, so the distance matrix is empty.'
      : `Build the distance matrix in vertex order ${vertices.join(', ')}. Every diagonal is 0, because a vertex reaches itself with an empty path. An edge u → v writes its weight when that weight is strictly smaller than the cell. Duplicate adjacency entries keep the smaller weight, which is how this graph stores one best edge between a pair. Missing pairs stay ∞. A negative self-loop is written onto the diagonal; a positive or zero self-loop does not beat the empty path.`

  emit({
    phase: 'initialize',
    title: 'Initial distance matrix',
    explanation: `${initialSummary} The next-hop matrix stores the first step of that direct edge. No intermediate vertex is allowed yet. Later iterations will try each vertex k in this same order.`,
    detail:
      count === 0
        ? '0×0 matrix.'
        : `${count}×${count} matrix. Time for the updates that follow is O(V³) = O(${count}³). Space for the two matrices is O(V²).`,
    message: 'Matrix initialized',
    k: null,
    i: null,
    j: null,
    kIndex: -1,
    iIndex: -1,
    jIndex: -1,
    update: null,
    distances,
    baseline: distances,
    next,
    iteration: 0,
    vertexCount: count,
    cellsUpdated: 0,
    hasNegativeCycle: false,
    negativeCycleVertices: [],
    affectedPairs: [],
    finalized: false,
    pathVertices: [],
    pathEdges: [],
  })

  for (let k = 0; k < count; k += 1) {
    const kVertex = vertices[k]!
    const baseline = cloneMatrix(distances)
    const baselineNext = cloneNext(next)
    let cellsUpdated = 0

    emit({
      phase: 'iteration-start',
      title: `Allow intermediate vertex ${kVertex}`,
      explanation: `Intermediate vertex k is ${kVertex} (${k + 1} of ${count}). A path may now visit ${kVertex} between its endpoints, in addition to every intermediate already allowed. Each pair (i, j) is checked with the recurrence dist[i][j] = min(dist[i][j], dist[i][${kVertex}] + dist[${kVertex}][j]). Both lookups on the right come from the matrix before this iteration, so one cell does not change the inputs of the next cell in the same pass. ${kVertex} is not a new source. It is a vertex the route is allowed to pass through.`,
      detail: `Inspect all ${count * count} pairs. Nothing has changed for k = ${kVertex} yet.`,
      message: `k = ${kVertex}`,
      k: kVertex,
      i: null,
      j: null,
      kIndex: k,
      iIndex: -1,
      jIndex: -1,
      update: null,
      distances,
      baseline,
      next,
      iteration: k + 1,
      vertexCount: count,
      cellsUpdated: 0,
      hasNegativeCycle: false,
      negativeCycleVertices: [],
      affectedPairs: [],
      finalized: false,
      pathVertices: [],
      pathEdges: [],
    })

    for (let i = 0; i < count; i += 1) {
      for (let j = 0; j < count; j += 1) {
        const iVertex = vertices[i]!
        const jVertex = vertices[j]!
        const viaIk = baseline[i]![k]!
        const viaKj = baseline[k]![j]!
        const before = baseline[i]![j]!
        const nextBefore = baselineNext[i]![j] ?? null
        const ikFinite = Number.isFinite(viaIk)
        const kjFinite = Number.isFinite(viaKj)
        const candidate = ikFinite && kjFinite ? viaIk + viaKj : null
        let updated = false
        if (candidate !== null && candidate < before) {
          distances[i]![j] = candidate
          next[i]![j] = baselineNext[i]![k] ?? null
          updated = true
          cellsUpdated += 1
        }
        const after = distances[i]![j]!
        const nextAfter = next[i]![j] ?? null
        const update: FloydWarshallUpdate = {
          k: kVertex,
          i: iVertex,
          j: jVertex,
          kIndex: k,
          iIndex: i,
          jIndex: j,
          viaIk,
          viaKj,
          before,
          candidate,
          after,
          updated,
          nextBefore,
          nextAfter,
        }
        emit({
          phase: 'consider',
          title: updated
            ? `Update ${iVertex} → ${jVertex} through ${kVertex}`
            : `Check ${iVertex} → ${jVertex} through ${kVertex}`,
          explanation: explainUpdate(update),
          detail: explainUpdateDetail(update),
          message: updated
            ? `dist[${iVertex}][${jVertex}] = ${formatFloydWarshallDistance(after)}`
            : `dist[${iVertex}][${jVertex}] stays ${formatFloydWarshallDistance(after)}`,
          k: kVertex,
          i: iVertex,
          j: jVertex,
          kIndex: k,
          iIndex: i,
          jIndex: j,
          update,
          distances,
          baseline,
          next,
          iteration: k + 1,
          vertexCount: count,
          cellsUpdated,
          hasNegativeCycle: false,
          negativeCycleVertices: [],
          affectedPairs: [],
          finalized: false,
          pathVertices: [],
          pathEdges: [],
        })
      }
    }

    iterations.push({
      k: kVertex,
      distances: cloneMatrix(distances),
      next: cloneNext(next),
    })

    emit({
      phase: 'iteration-end',
      title:
        cellsUpdated > 0
          ? `Finished intermediate ${kVertex}`
          : `Intermediate ${kVertex} changed nothing`,
      explanation:
        cellsUpdated > 0
          ? `Every pair has been compared with routes that may pass through ${kVertex}. ${cellsUpdated} cell${cellsUpdated === 1 ? '' : 's'} became strictly shorter. The current matrix is the shortest-distance table when the allowed intermediates are the vertices up through ${kVertex}. The previous matrix on this frame is the table from before ${kVertex} was allowed.`
          : `Every pair was checked with ${kVertex} as an intermediate, and no candidate was strictly smaller. The matrix stays as it was before this iteration. A later vertex may still improve a cell.`,
      detail: `Iteration ${k + 1} of ${count}. Cells updated: ${cellsUpdated}.`,
      message:
        cellsUpdated > 0
          ? `${cellsUpdated} update${cellsUpdated === 1 ? '' : 's'} via ${kVertex}`
          : `No updates via ${kVertex}`,
      k: kVertex,
      i: null,
      j: null,
      kIndex: k,
      iIndex: -1,
      jIndex: -1,
      update: null,
      distances,
      baseline,
      next,
      iteration: k + 1,
      vertexCount: count,
      cellsUpdated,
      hasNegativeCycle: false,
      negativeCycleVertices: [],
      affectedPairs: [],
      finalized: false,
      pathVertices: [],
      pathEdges: [],
    })
  }

  const negativeCycleVertices = vertices.filter((_, index) => {
    const diagonal = distances[index]?.[index]
    return typeof diagonal === 'number' && diagonal < 0
  })
  const cycleSet = new Set(negativeCycleVertices)
  const affectedPairs: FloydWarshallPair[] = []
  const pairState = emptyStateMatrix(count, 'unreachable')

  for (let i = 0; i < count; i += 1) {
    for (let j = 0; j < count; j += 1) {
      let affected = false
      if (cycleSet.size > 0) {
        for (let k = 0; k < count; k += 1) {
          const kVertex = vertices[k]
          if (!kVertex || !cycleSet.has(kVertex)) continue
          const toCycle = distances[i]![k]!
          const fromCycle = distances[k]![j]!
          if (Number.isFinite(toCycle) && Number.isFinite(fromCycle)) {
            affected = true
            break
          }
        }
      }
      if (affected) {
        pairState[i]![j] = 'negative-cycle'
        affectedPairs.push({ from: vertices[i]!, to: vertices[j]! })
      } else if (Number.isFinite(distances[i]![j]!)) {
        pairState[i]![j] = 'shortest'
      } else {
        pairState[i]![j] = 'unreachable'
      }
    }
  }

  const hasNegativeCycle = negativeCycleVertices.length > 0
  const pathPreview = previewPath(
    vertices,
    distances,
    next,
    options.pathSource,
    options.pathDestination,
    hasNegativeCycle ? affectedPairs : undefined,
  )

  if (hasNegativeCycle) {
    const sampleAffected = affectedPairs[0]
    const unaffected = findUnaffected(vertices, pairState)
    const affectedExample = sampleAffected
      ? `For example, ${sampleAffected.from} → ${sampleAffected.to} has no finite shortest path.`
      : 'No pair was marked.'
    const unaffectedExample = describeUnaffected(
      unaffected,
      vertices,
      distances,
    )
    emit({
      phase: 'negative-cycle',
      title: 'Negative cycle on the diagonal',
      explanation: `A negative diagonal means that vertex lies on a negative cycle. Vertices on a negative cycle: ${negativeCycleVertices.join(', ')}. A source-destination pair is affected only when some cycle vertex is reachable from the source and the destination is reachable from that cycle vertex. ${affectedExample} ${unaffectedExample} Affected pairs are reported as −∞ and their paths are not reconstructed. Unreachable pairs stay ∞. They are a different outcome from a negative cycle.`,
      detail: `${affectedPairs.length} affected pair${affectedPairs.length === 1 ? '' : 's'}. ${count * count - affectedPairs.length} pairs are unaffected.`,
      message: `Negative cycle: ${negativeCycleVertices.join(', ')}`,
      k: null,
      i: null,
      j: null,
      kIndex: -1,
      iIndex: -1,
      jIndex: -1,
      update: null,
      distances,
      baseline: distances,
      next,
      iteration: count,
      vertexCount: count,
      cellsUpdated: 0,
      hasNegativeCycle: true,
      negativeCycleVertices,
      affectedPairs,
      finalized: true,
      pathVertices: pathPreview.path,
      pathEdges: pathPreview.edges,
    })
  }

  const pathText = describePreview(pathPreview)
  emit({
    phase: 'complete',
    title: 'All-pairs shortest paths',
    explanation: hasNegativeCycle
      ? `Floyd-Warshall has finished. The matrix holds the dynamic-programming distances, including negative diagonals. Those diagonals are the negative-cycle test, not usable shortest-path lengths. ${affectedPairs.length} pairs can reach a negative cycle that can reach them, so they have no finite answer. The remaining pairs are ordinary shortest distances or ∞. ${pathText}`
      : `Floyd-Warshall has finished. No diagonal is negative, so every finite cell is a shortest-path distance and ∞ means no path. The next-hop matrix reconstructs one path. When several routes share the same distance, the path found first stays: direct edges are written at initialization, and a later intermediate replaces a cell only when its candidate is strictly smaller. ${pathText}`,
    detail: hasNegativeCycle
      ? `Negative-cycle vertices: ${negativeCycleVertices.join(', ')}.`
      : `All ${count * count} pairs classified. No negative cycle.`,
    message: hasNegativeCycle
      ? 'Finished with a negative cycle'
      : 'Shortest-distance matrix ready',
    k: null,
    i: null,
    j: null,
    kIndex: -1,
    iIndex: -1,
    jIndex: -1,
    update: null,
    distances,
    baseline:
      iterations.length > 1
        ? (iterations[iterations.length - 2]!.distances as MutableMatrix)
        : distances,
    next,
    iteration: count,
    vertexCount: count,
    cellsUpdated: 0,
    hasNegativeCycle,
    negativeCycleVertices,
    affectedPairs,
    finalized: true,
    pathVertices: pathPreview.path,
    pathEdges: pathPreview.edges,
  })

  return {
    ok: true,
    vertices: [...vertices],
    distances: cloneMatrix(distances),
    next: cloneNext(next),
    pairState,
    hasNegativeCycle,
    negativeCycleVertices: [...negativeCycleVertices],
    affectedPairs: affectedPairs.map((pair) => ({ ...pair })),
    iterations: iterations.map((iteration) => ({
      k: iteration.k,
      distances: cloneMatrix(iteration.distances),
      next: cloneNext(iteration.next),
    })),
  }
}

function explainUpdate(update: FloydWarshallUpdate): string {
  const ij = `dist[${update.i}][${update.j}]`
  const ik = `dist[${update.i}][${update.k}]`
  const kj = `dist[${update.k}][${update.j}]`
  const before = formatFloydWarshallDistance(update.before)
  const ikLabel = formatFloydWarshallDistance(update.viaIk)
  const kjLabel = formatFloydWarshallDistance(update.viaKj)
  const same = update.i === update.j

  if (update.candidate === null) {
    const missing: string[] = []
    if (!Number.isFinite(update.viaIk)) {
      missing.push(`${update.i} cannot reach ${update.k} (${ik} is ∞)`)
    }
    if (!Number.isFinite(update.viaKj)) {
      missing.push(`${update.k} cannot reach ${update.j} (${kj} is ∞)`)
    }
    return `Intermediate ${update.k}, pair ${update.i} → ${update.j}. The recurrence is ${ij} = min(${ij}, ${ik} + ${kj}). ${missing.join(', and ')}, so there is no numeric candidate through ${update.k}. ${ij} stays ${before}. The cell is unchanged.`
  }

  const candidate = formatFloydWarshallDistance(update.candidate)
  const formula = `${ikLabel} + ${kjLabel} = ${candidate}`
  if (update.updated) {
    const hop =
      update.nextAfter === null
        ? 'No successor was stored on the path toward the intermediate vertex.'
        : `The successor from ${update.i} toward ${update.j} becomes ${update.nextAfter}, the first step already stored toward ${update.k}.`
    const cycleNote =
      same && update.after < 0
        ? ` The diagonal is now negative, so ${update.i} lies on a negative cycle. This number is not a finite shortest closed walk.`
        : ''
    return `Intermediate ${update.k}, pair ${update.i} → ${update.j}. Current ${ij} is ${before}. The route through ${update.k} costs ${formula}, using the matrix from before ${update.k} was allowed. ${candidate} is strictly smaller than ${before}, so ${ij} becomes ${formatFloydWarshallDistance(update.after)}. ${hop}${cycleNote}`
  }

  return `Intermediate ${update.k}, pair ${update.i} → ${update.j}. Current ${ij} is ${before}. The route through ${update.k} costs ${formula}. That candidate is not strictly smaller, so ${ij} stays ${before}${update.candidate === update.before ? '. An equal distance keeps the path already stored' : ''}. The cell is unchanged.`
}

function explainUpdateDetail(update: FloydWarshallUpdate): string {
  if (update.candidate === null) {
    return 'No candidate. The cell stays put.'
  }
  const candidate = formatFloydWarshallDistance(update.candidate)
  const before = formatFloydWarshallDistance(update.before)
  if (update.updated) {
    return `${candidate} < ${before}, so the cell updates.`
  }
  return `${candidate} ≥ ${before}, so the cell stays.`
}

function describeUnaffected(
  unaffected: { from: VertexId; to: VertexId; state: FloydWarshallPairState } | null,
  vertices: readonly VertexId[],
  distances: MutableMatrix,
): string {
  if (!unaffected) return ''
  if (unaffected.state === 'shortest') {
    const fromIndex = vertices.indexOf(unaffected.from)
    const toIndex = vertices.indexOf(unaffected.to)
    const distance = distances[fromIndex]?.[toIndex] ?? FLOYD_WARSHALL_INFINITY
    return `${unaffected.from} → ${unaffected.to} is not affected (distance ${formatFloydWarshallDistance(distance)}).`
  }
  return `${unaffected.from} → ${unaffected.to} is not affected (unreachable).`
}

function findUnaffected(
  vertices: readonly VertexId[],
  pairState: readonly (readonly FloydWarshallPairState[])[],
): { from: VertexId; to: VertexId; state: FloydWarshallPairState } | null {
  for (let i = 0; i < vertices.length; i += 1) {
    for (let j = 0; j < vertices.length; j += 1) {
      const state = pairState[i]?.[j]
      if (state && state !== 'negative-cycle') {
        const from = vertices[i]
        const to = vertices[j]
        if (from && to) return { from, to, state }
      }
    }
  }
  return null
}

function previewPath(
  vertices: readonly VertexId[],
  distances: MutableMatrix,
  next: MutableNext,
  source: string | null | undefined,
  destination: string | null | undefined,
  affectedPairs: readonly FloydWarshallPair[] | undefined,
): { path: VertexId[]; edges: TraversalEdge[] } {
  if (!source || !destination) return { path: [], edges: [] }
  const result = reconstructFloydWarshallPath({
    vertices,
    distances,
    next,
    source,
    destination,
    affectedPairs,
  })
  return { path: [...result.path], edges: [...result.edges] }
}

function describePreview(preview: {
  path: VertexId[]
  edges: TraversalEdge[]
}): string {
  if (preview.path.length === 0) {
    return 'Choose a source and destination to read one path from the next-hop matrix.'
  }
  return `Selected path: ${preview.path.join(' → ')}.`
}

/**
 * Immutable visualization frames.
 * Each step stores its own matrices, so moving backward restores that state.
 * Cell frames inspect one pair. Iteration-end frames show the finished layer.
 */
export function buildFloydWarshallSteps(
  snapshot: GraphSnapshot,
  pathSource?: string | null,
  pathDestination?: string | null,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const graphSnapshot = serializeGraphSnapshot(snapshot)
  let counter = 0

  runFloydWarshall(snapshot, {
    pathSource,
    pathDestination,
    onStep: (frame) => {
      counter += 1
      steps.push({
        id: `floyd-warshall-${frame.phase}-${counter}`,
        title: frame.title,
        explanation: frame.explanation,
        detail: frame.detail,
        array: [],
        meta: {
          algorithm: 'floyd-warshall',
          phase: frame.phase,
          graphSnapshot,
          k: frame.k,
          i: frame.i,
          j: frame.j,
          kIndex: frame.kIndex,
          iIndex: frame.iIndex,
          jIndex: frame.jIndex,
          update: serializeFloydWarshallUpdate(frame.update),
          distances: serializeFloydWarshallMatrix(frame.distances),
          baseline: serializeFloydWarshallMatrix(frame.baseline),
          next: serializeFloydWarshallNext(frame.next),
          iteration: frame.iteration,
          vertexCount: frame.vertexCount,
          cellsUpdated: frame.cellsUpdated,
          hasNegativeCycle: frame.hasNegativeCycle,
          negativeCycleVertices: serializeStringList(frame.negativeCycleVertices),
          affectedPairs: serializeFloydWarshallPairs(frame.affectedPairs),
          finalized: frame.finalized,
          message: frame.message,
          path: serializeStringList(frame.pathVertices),
          pathEdges: serializeEdges(frame.pathEdges),
          vertices: serializeStringList([...snapshot.vertices]),
        },
      })
    },
  })

  return steps
}

export function reportedPairDistance(
  result: FloydWarshallResult,
  from: VertexId,
  to: VertexId,
): number {
  const i = result.vertices.indexOf(from)
  const j = result.vertices.indexOf(to)
  if (i < 0 || j < 0) return FLOYD_WARSHALL_INFINITY
  const state = result.pairState[i]?.[j]
  if (state === 'negative-cycle') return FLOYD_WARSHALL_NEGATIVE_INFINITY
  if (state === 'unreachable') return FLOYD_WARSHALL_INFINITY
  return result.distances[i]?.[j] ?? FLOYD_WARSHALL_INFINITY
}

/** True when the vertex id exists. Useful for playground guards. */
export function floydWarshallHasVertex(
  snapshot: GraphSnapshot,
  vertex: string,
): boolean {
  return hasVertex(snapshot, vertex.trim())
}
