/**
 * Dijkstra's Algorithm — single-source shortest paths for non-negative weights.
 *
 * Repeatedly selects the unvisited vertex with the smallest known distance
 * and relaxes its outgoing edges. The frontier is a min priority queue from
 * the Priority Queue module. That heap has no decrease-key, so a better
 * distance enqueues a new entry and older entries are skipped when dequeued
 * (stale-entry check).
 *
 * Works on weighted directed and undirected GraphSnapshots. Undirected edges
 * are stored in both directions by the Graph module, so neighbor scans follow
 * outgoing adjacency either way. The input graph is never mutated.
 *
 * With an adjacency list and a binary heap (lazy duplicates):
 * - Time: O((V + E) log V)
 * - Space: O(V + E), including graph storage and up to O(E) queue entries
 *
 * Costs change if the graph is a matrix or the heap supports decrease-key
 * (for example a Fibonacci heap is O(E + V log V)). Negative weights are rejected.
 * Independent of React.
 */

import {
  getNeighbors,
  hasVertex,
  type GraphSnapshot,
  type VertexId,
} from '../data-structures/graph'
import {
  createEmpty,
  dequeue,
  enqueue,
  type PriorityQueueSnapshot,
} from '../data-structures/priorityQueue'
import type { VisualizationStep } from '../../components/visualizations/types'
import {
  serializeEdges,
  serializeGraphSnapshot,
  serializeStringList,
  type TraversalEdge,
} from './traversalShared'

/** Distance used for vertices that are not yet reached. */
export const DIJKSTRA_INFINITY = Number.POSITIVE_INFINITY

export class NegativeWeightError extends Error {
  readonly from: VertexId
  readonly to: VertexId
  readonly weight: number

  constructor(from: VertexId, to: VertexId, weight: number) {
    super(
      `Dijkstra's Algorithm requires non-negative edge weights. Edge ${from} → ${to} has weight ${weight}. Algorithms such as Bellman-Ford handle negative weights.`,
    )
    this.name = 'NegativeWeightError'
    this.from = from
    this.to = to
    this.weight = weight
  }
}

export type DijkstraPhase =
  | 'initialize'
  | 'seed'
  | 'select'
  | 'stale'
  | 'inspect'
  | 'relax'
  | 'no-relax'
  | 'skip-visited'
  | 'complete'
  | 'invalid'
  | 'negative-weight'

/** One priority-queue entry as shown in a visualization frame. */
export type DijkstraQueueEntry = {
  readonly vertex: VertexId
  readonly priority: number
  readonly stale: boolean
}

export type DijkstraResult = {
  readonly ok: boolean
  readonly reason?: string
  readonly source: VertexId | null
  readonly destination: VertexId | null
  /** Finite numbers, or DIJKSTRA_INFINITY when unreachable. */
  readonly distances: Readonly<Record<string, number>>
  readonly previous: Readonly<Record<string, VertexId | null>>
  readonly path: readonly VertexId[]
  readonly reachable: boolean
  readonly visitedOrder: readonly VertexId[]
}

export type DijkstraOptions = {
  readonly source: string
  readonly destination?: string | null
}

/** Undirected weighted roads. Shortest A → E is A–C–B–D–E (distance 10), not the fewer-hop A–C–E (12). */
export const DIJKSTRA_ROAD_NETWORK = {
  directed: false,
  weighted: true,
  vertices: ['A', 'B', 'C', 'D', 'E'] as const,
  edges: [
    { from: 'A', to: 'B', weight: 4 },
    { from: 'A', to: 'C', weight: 2 },
    { from: 'B', to: 'C', weight: 1 },
    { from: 'B', to: 'D', weight: 5 },
    { from: 'B', to: 'E', weight: 9 },
    { from: 'C', to: 'D', weight: 8 },
    { from: 'C', to: 'E', weight: 10 },
    { from: 'D', to: 'E', weight: 2 },
  ],
} as const

export const DIJKSTRA_ROAD_LAYOUT: Readonly<
  Record<string, { x: number; y: number }>
> = {
  A: { x: 0.16, y: 0.24 },
  B: { x: 0.48, y: 0.16 },
  C: { x: 0.22, y: 0.72 },
  D: { x: 0.58, y: 0.52 },
  E: { x: 0.86, y: 0.36 },
}

/** Directed routes plus an isolated vertex X. Shortest S → T is S–A–B–C–T (distance 7). */
export const DIJKSTRA_DIRECTED_ROUTES = {
  directed: true,
  weighted: true,
  vertices: ['S', 'A', 'B', 'C', 'T', 'X'] as const,
  edges: [
    { from: 'S', to: 'A', weight: 2 },
    { from: 'S', to: 'B', weight: 5 },
    { from: 'A', to: 'B', weight: 1 },
    { from: 'A', to: 'C', weight: 4 },
    { from: 'B', to: 'C', weight: 1 },
    { from: 'C', to: 'T', weight: 3 },
  ],
} as const

export const DIJKSTRA_DIRECTED_LAYOUT: Readonly<
  Record<string, { x: number; y: number }>
> = {
  S: { x: 0.1, y: 0.55 },
  A: { x: 0.36, y: 0.22 },
  B: { x: 0.36, y: 0.78 },
  C: { x: 0.64, y: 0.5 },
  T: { x: 0.9, y: 0.55 },
  X: { x: 0.9, y: 0.16 },
}

/** Zero-weight edges. Shortest A → D is A–B–C–D (distance 1), not the direct edge 5. */
export const DIJKSTRA_ZERO_WEIGHT = {
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

export const DIJKSTRA_ZERO_LAYOUT: Readonly<
  Record<string, { x: number; y: number }>
> = {
  A: { x: 0.14, y: 0.62 },
  B: { x: 0.38, y: 0.28 },
  C: { x: 0.64, y: 0.28 },
  D: { x: 0.88, y: 0.62 },
}

type NegativeEdge = {
  readonly from: VertexId
  readonly to: VertexId
  readonly weight: number
}

/**
 * First negative-weight adjacency entry in vertex insertion order.
 * Undirected graphs store both directions; the earlier endpoint is reported.
 */
export function findNegativeEdge(snapshot: GraphSnapshot): NegativeEdge | null {
  for (const from of snapshot.vertices) {
    for (const neighbor of snapshot.adjacency[from] ?? []) {
      if (neighbor.weight < 0) {
        return { from, to: neighbor.to, weight: neighbor.weight }
      }
    }
  }
  return null
}

export function formatDistance(distance: number): string {
  if (!Number.isFinite(distance)) return '∞'
  if (Number.isInteger(distance)) return String(distance)
  const rounded = Math.round(distance * 1000) / 1000
  return String(rounded)
}

export function reconstructShortestPath(
  previous: Readonly<Record<string, VertexId | null>>,
  source: VertexId,
  destination: VertexId,
): VertexId[] {
  if (source === destination) return [source]

  const path: VertexId[] = []
  const seen = new Set<VertexId>()
  let cursor: VertexId | null = destination

  while (cursor !== null) {
    if (seen.has(cursor)) return []
    seen.add(cursor)
    path.push(cursor)
    if (cursor === source) {
      path.reverse()
      return path
    }
    const next: VertexId | null | undefined = previous[cursor]
    cursor = next ?? null
  }

  return []
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

function emptyDistances(
  snapshot: GraphSnapshot,
): Record<string, number> {
  const distances: Record<string, number> = {}
  for (const vertex of snapshot.vertices) {
    distances[vertex] = DIJKSTRA_INFINITY
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

function failedResult(
  source: VertexId | null,
  destination: VertexId | null,
  snapshot: GraphSnapshot,
  reason: string,
): DijkstraResult {
  return {
    ok: false,
    reason,
    source,
    destination,
    distances: emptyDistances(snapshot),
    previous: emptyPrevious(snapshot),
    path: [],
    reachable: false,
    visitedOrder: [],
  }
}

type DijkstraFrame = {
  phase: DijkstraPhase
  title: string
  explanation: string
  detail?: string
  message: string
  currentVertex: VertexId | null
  activeEdge: TraversalEdge | null
  dequeuedVertex: VertexId | null
  dequeuedPriority: number | null
  enteredVertex: VertexId | null
  enteredPriority: number | null
  distances: Record<string, number>
  previous: Record<string, VertexId | null>
  visited: VertexId[]
  queue: DijkstraQueueEntry[]
  relaxedEdges: TraversalEdge[]
  path: VertexId[]
  success: boolean | null
  complete: boolean
}

type RunOptions = DijkstraOptions & {
  readonly onStep?: (frame: DijkstraFrame) => void
}

function edgeArrow(from: VertexId, to: VertexId): string {
  return `${from}→${to}`
}

function queueView(
  pq: PriorityQueueSnapshot<VertexId>,
  distances: Readonly<Record<string, number>>,
  settled: ReadonlySet<VertexId>,
): DijkstraQueueEntry[] {
  return pq.entries.map((entry) => ({
    vertex: entry.item,
    priority: entry.priority,
    stale: settled.has(entry.item) || entry.priority > distances[entry.item]!,
  }))
}

function rememberRelaxedEdge(
  edges: TraversalEdge[],
  from: VertexId,
  to: VertexId,
): TraversalEdge[] {
  return [...edges.filter((edge) => edge.to !== to), { from, to }]
}

/**
 * Run Dijkstra from `source`.
 * Throws NegativeWeightError when any edge weight is negative.
 * Missing source or destination returns `ok: false` without throwing.
 * Does not mutate `snapshot`.
 */
export function dijkstra(
  snapshot: GraphSnapshot,
  options: DijkstraOptions,
): DijkstraResult {
  const negative = findNegativeEdge(snapshot)
  if (negative) {
    throw new NegativeWeightError(negative.from, negative.to, negative.weight)
  }
  return runDijkstra(snapshot, options)
}

function runDijkstra(
  snapshot: GraphSnapshot,
  options: RunOptions,
): DijkstraResult {
  const source = resolveVertex(snapshot, options.source)
  const destination =
    options.destination === undefined || options.destination === null
      ? null
      : resolveVertex(snapshot, options.destination)

  if (source === null) {
    const reason = `Source vertex "${options.source.trim()}" does not exist.`
    const result = failedResult(null, destination, snapshot, reason)
    options.onStep?.({
      phase: 'invalid',
      title: 'Source vertex missing',
      explanation: `${reason} Dijkstra needs a source that is already in the graph. No distances are computed and the priority queue stays empty.`,
      message: 'Invalid source',
      currentVertex: null,
      activeEdge: null,
      dequeuedVertex: null,
      dequeuedPriority: null,
      enteredVertex: null,
      enteredPriority: null,
      distances: { ...result.distances },
      previous: { ...result.previous },
      visited: [],
      queue: [],
      relaxedEdges: [],
      path: [],
      success: false,
      complete: true,
    })
    return result
  }

  if (options.destination != null && options.destination.trim() !== '' && destination === null) {
    const reason = `Destination vertex "${options.destination.trim()}" does not exist.`
    const result = failedResult(source, null, snapshot, reason)
    options.onStep?.({
      phase: 'invalid',
      title: 'Destination vertex missing',
      explanation: `${reason} Pick a destination that exists, or remove the destination filter. The priority queue is not started.`,
      message: 'Invalid destination',
      currentVertex: null,
      activeEdge: null,
      dequeuedVertex: null,
      dequeuedPriority: null,
      enteredVertex: null,
      enteredPriority: null,
      distances: { ...result.distances },
      previous: { ...result.previous },
      visited: [],
      queue: [],
      relaxedEdges: [],
      path: [],
      success: false,
      complete: true,
    })
    return result
  }

  const distances = emptyDistances(snapshot)
  const previous = emptyPrevious(snapshot)
  distances[source] = 0

  const settled = new Set<VertexId>()
  const visitedOrder: VertexId[] = []
  let pq = createEmpty<VertexId>('min')
  let relaxedEdges: TraversalEdge[] = []

  const pathNow = (): VertexId[] => {
    if (destination === null) return []
    if (!Number.isFinite(distances[destination]!)) return []
    return reconstructShortestPath(previous, source, destination)
  }

  const emit = (
    info: Omit<
      DijkstraFrame,
      | 'distances'
      | 'previous'
      | 'visited'
      | 'queue'
      | 'relaxedEdges'
      | 'path'
    >,
  ) => {
    options.onStep?.({
      ...info,
      distances: { ...distances },
      previous: { ...previous },
      visited: [...visitedOrder],
      queue: queueView(pq, distances, settled),
      relaxedEdges: relaxedEdges.map((edge) => ({ ...edge })),
      path: pathNow(),
    })
  }

  const neighborNames = (vertex: VertexId): string => {
    const names = getNeighbors(snapshot, vertex).map((neighbor) => neighbor.to)
    return names.length === 0 ? 'none' : names.join(', ')
  }

  emit({
    phase: 'initialize',
    title: `Initialize distances from ${source}`,
    explanation: `Dijkstra's Algorithm finds shortest paths from ${source} when every edge weight is non-negative. Set dist(${source}) = 0 and every other distance to ∞. Previous vertices start empty (—). Nothing is visited yet. The priority queue is empty until the source enters. Unreachable vertices stay ∞. Neighbors are not inspected on this step, so no candidate distance is calculated and no previous pointer changes.`,
    detail: `Graph is ${snapshot.directed ? 'directed' : 'undirected'}. ${destination ? `Destination: ${destination}.` : 'No destination filter — distances are still computed for every vertex.'} ${source === destination ? `Source and destination are the same, so the shortest path is [${source}] with distance 0.` : ''}`,
    message: `dist(${source}) = 0`,
    currentVertex: null,
    activeEdge: null,
    dequeuedVertex: null,
    dequeuedPriority: null,
    enteredVertex: null,
    enteredPriority: null,
    success: null,
    complete: false,
  })

  pq = enqueue(pq, source, 0).snapshot
  emit({
    phase: 'seed',
    title: `Enqueue source ${source}`,
    explanation: `Place ${source} into the min priority queue with priority 0. The queue's job is to offer the smallest known distance next. No vertex is selected for relaxation yet, so no neighbor is inspected, no candidate distance is calculated, and no previous pointer changes. ${source} enters the priority queue; nothing leaves.`,
    detail: `Priority queue: ${source}@0`,
    message: `Enqueue ${source}@0`,
    currentVertex: null,
    activeEdge: null,
    dequeuedVertex: null,
    dequeuedPriority: null,
    enteredVertex: source,
    enteredPriority: 0,
    success: null,
    complete: false,
  })

  while (pq.entries.length > 0) {
    const popped = dequeue(pq)
    pq = popped.snapshot
    const entry = popped.entry
    if (!entry) break

    const vertex = entry.item
    const priority = entry.priority
    const known = distances[vertex]!

    if (settled.has(vertex) || priority > known) {
      const why = settled.has(vertex)
        ? `${vertex} is already visited, so this queue entry is a duplicate.`
        : `The best known distance to ${vertex} is already ${formatDistance(known)}, which is smaller than this entry's priority ${formatDistance(priority)}.`
      emit({
        phase: 'stale',
        title: `Skip stale entry ${vertex}@${formatDistance(priority)}`,
        explanation: `The priority queue offered ${vertex} at priority ${formatDistance(priority)}, but it is not selected. ${why} A shorter path was recorded earlier and enqueued separately, because this binary heap has no decrease-key. Discard the stale entry. No neighbor is inspected, no candidate distance is calculated, distances stay the same, and previous vertices stay the same. ${vertex}@${formatDistance(priority)} leaves the priority queue; nothing enters.`,
        detail: `Best dist(${vertex}) = ${formatDistance(known)}`,
        message: `Stale ${vertex}@${formatDistance(priority)}`,
        currentVertex: null,
        activeEdge: null,
        dequeuedVertex: vertex,
        dequeuedPriority: priority,
        enteredVertex: null,
        enteredPriority: null,
        success: null,
        complete: false,
      })
      continue
    }

    settled.add(vertex)
    visitedOrder.push(vertex)
    const sameEndpoint = destination === vertex && source === destination
    emit({
      phase: 'select',
      title: `Select ${vertex}`,
      explanation: `Select ${vertex} because it is unvisited and the priority queue says it has the smallest known distance (${formatDistance(known)}). With non-negative weights that distance is now final. ${sameEndpoint ? `Source and destination are both ${vertex}, so the shortest path is [${vertex}] with distance 0. ` : destination === vertex ? `${vertex} is the destination, so this is the shortest-path length. The search still finishes every other reachable vertex for the distance table. ` : ''}Outgoing neighbors in id order: ${neighborNames(vertex)}. Candidate distances are dist(${vertex}) + edge weight on the following steps. This selection does not itself change any distance or previous pointer. ${vertex} leaves the priority queue.`,
      detail: `Visited order: ${visitedOrder.join(', ')}`,
      message: `Visit ${vertex}`,
      currentVertex: vertex,
      activeEdge: null,
      dequeuedVertex: vertex,
      dequeuedPriority: priority,
      enteredVertex: null,
      enteredPriority: null,
      success: null,
      complete: false,
    })

    for (const neighbor of getNeighbors(snapshot, vertex)) {
      const next = neighbor.to
      const weight = neighbor.weight
      const activeEdge = { from: vertex, to: next }

      if (settled.has(next)) {
        emit({
          phase: 'skip-visited',
          title: `Skip visited ${next}`,
          explanation: `Inspect neighbor ${next} along ${edgeArrow(vertex, next)} (weight ${formatDistance(weight)}). ${next} is already visited, so its distance is final and is not reopened. No candidate is applied, the distance table does not change, and the previous vertex of ${next} stays ${previous[next] ?? '—'}. Nothing enters or leaves the priority queue on this inspection.`,
          detail: `dist(${next}) = ${formatDistance(distances[next]!)} is final`,
          message: `Skip ${next}`,
          currentVertex: vertex,
          activeEdge,
          dequeuedVertex: null,
          dequeuedPriority: null,
          enteredVertex: null,
          enteredPriority: null,
          success: null,
          complete: false,
        })
        continue
      }

      const candidate = known + weight
      const previousDistance = distances[next]!
      if (candidate < previousDistance) {
        distances[next] = candidate
        previous[next] = vertex
        relaxedEdges = rememberRelaxedEdge(relaxedEdges, vertex, next)
        pq = enqueue(pq, next, candidate).snapshot
        emit({
          phase: 'relax',
          title: `Relax ${edgeArrow(vertex, next)}`,
          explanation: `Inspect neighbor ${next} of the selected vertex ${vertex} along ${edgeArrow(vertex, next)} (weight ${formatDistance(weight)}). Candidate distance = dist(${vertex}) + ${formatDistance(weight)} = ${formatDistance(known)} + ${formatDistance(weight)} = ${formatDistance(candidate)}. That is smaller than the known distance ${formatDistance(previousDistance)}, so update dist(${next}) to ${formatDistance(candidate)} and set the previous vertex of ${next} to ${vertex}. ${next} enters the priority queue with priority ${formatDistance(candidate)}. ${vertex} already left when it was selected. Any older entry for ${next} stays in the queue until a later stale check discards it.`,
          detail: `${formatDistance(known)} + ${formatDistance(weight)} = ${formatDistance(candidate)} < ${formatDistance(previousDistance)}`,
          message: `dist(${next}) = ${formatDistance(candidate)}`,
          currentVertex: vertex,
          activeEdge,
          dequeuedVertex: null,
          dequeuedPriority: null,
          enteredVertex: next,
          enteredPriority: candidate,
          success: null,
          complete: false,
        })
      } else {
        emit({
          phase: 'no-relax',
          title: `Keep dist(${next})`,
          explanation: `Inspect neighbor ${next} of the selected vertex ${vertex} along ${edgeArrow(vertex, next)} (weight ${formatDistance(weight)}). Candidate distance = dist(${vertex}) + ${formatDistance(weight)} = ${formatDistance(known)} + ${formatDistance(weight)} = ${formatDistance(candidate)}. That is not smaller than the known distance ${formatDistance(previousDistance)}, so the distance is not updated and the previous vertex of ${next} stays ${previous[next] ?? '—'}. Nothing enters the priority queue.`,
          detail: `${formatDistance(known)} + ${formatDistance(weight)} = ${formatDistance(candidate)} ≥ ${formatDistance(previousDistance)}`,
          message: `No update for ${next}`,
          currentVertex: vertex,
          activeEdge,
          dequeuedVertex: null,
          dequeuedPriority: null,
          enteredVertex: null,
          enteredPriority: null,
          success: null,
          complete: false,
        })
      }
    }
  }

  const path =
    destination === null
      ? []
      : reconstructShortestPath(previous, source, destination)
  const reachable =
    destination !== null &&
    (destination === source || Number.isFinite(distances[destination]!))

  const pathText =
    destination === null
      ? 'No destination was requested.'
      : reachable
        ? `Shortest path ${source} to ${destination}: ${path.join(' → ')} (distance ${formatDistance(distances[destination]!)}).`
        : `No path from ${source} to ${destination}. Its distance stays ∞.`

  emit({
    phase: 'complete',
    title: 'Dijkstra complete',
    explanation: `The priority queue is empty, so every vertex reachable from ${source} has been selected exactly once. ${pathText} Previous pointers reconstruct that path by walking backward from the destination. Vertices that were never reached stay at ∞ and unvisited. Nothing new enters the queue. Dijkstra stops here only because every weight was non-negative; a negative edge would make “smallest so far is final” false, which is why Bellman-Ford is used for negative weights.`,
    detail: `Visited ${visitedOrder.length} of ${snapshot.vertices.length} vertices.`,
    message: pathText,
    currentVertex: null,
    activeEdge: null,
    dequeuedVertex: null,
    dequeuedPriority: null,
    enteredVertex: null,
    enteredPriority: null,
    success: true,
    complete: true,
  })

  return {
    ok: true,
    reason: destination !== null && !reachable ? pathText : undefined,
    source,
    destination,
    distances: { ...distances },
    previous: { ...previous },
    path,
    reachable,
    visitedOrder: [...visitedOrder],
  }
}

export function serializeDistances(
  distances: Readonly<Record<string, number>>,
): string {
  const payload: Record<string, number | null> = {}
  for (const [vertex, distance] of Object.entries(distances)) {
    payload[vertex] = Number.isFinite(distance) ? distance : null
  }
  return JSON.stringify(payload)
}

export function parseDistances(
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
      if (value === null) {
        distances[vertex] = DIJKSTRA_INFINITY
      } else if (typeof value === 'number' && Number.isFinite(value)) {
        distances[vertex] = value
      }
    }
    return distances
  } catch {
    return {}
  }
}

export function serializePrevious(
  previous: Readonly<Record<string, VertexId | null>>,
): string {
  return JSON.stringify(previous)
}

export function parsePrevious(
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

export function serializeQueue(entries: readonly DijkstraQueueEntry[]): string {
  return JSON.stringify(entries)
}

export function parseQueue(
  raw: string | null | undefined,
): DijkstraQueueEntry[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const entries: DijkstraQueueEntry[] = []
    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue
      const record = item as Record<string, unknown>
      if (typeof record.vertex !== 'string') continue
      if (typeof record.priority !== 'number' || !Number.isFinite(record.priority)) {
        continue
      }
      entries.push({
        vertex: record.vertex,
        priority: record.priority,
        stale: Boolean(record.stale),
      })
    }
    return entries
  } catch {
    return []
  }
}

/**
 * Immutable visualization frames.
 * Each step serializes its own distance table, previous map, visited list,
 * and priority queue, so moving backward restores that exact state.
 */
export function buildDijkstraSteps(
  snapshot: GraphSnapshot,
  sourceInput: string | null,
  destinationInput: string | null,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const graphSnapshot = serializeGraphSnapshot(snapshot)
  let counter = 0

  const push = (frame: DijkstraFrame) => {
    counter += 1
    steps.push({
      id: `dijkstra-${frame.phase}-${counter}`,
      title: frame.title,
      explanation: frame.explanation,
      detail: frame.detail,
      array: [],
      meta: {
        algorithm: 'dijkstra',
        phase: frame.phase,
        graphSnapshot,
        source: sourceInput?.trim() || null,
        destination: destinationInput?.trim() || null,
        currentVertex: frame.currentVertex,
        activeEdge: frame.activeEdge
          ? edgeArrow(frame.activeEdge.from, frame.activeEdge.to)
          : null,
        dequeuedVertex: frame.dequeuedVertex,
        dequeuedPriority: frame.dequeuedPriority,
        enteredVertex: frame.enteredVertex,
        enteredPriority: frame.enteredPriority,
        visited: serializeStringList(frame.visited),
        distances: serializeDistances(frame.distances),
        previous: serializePrevious(frame.previous),
        priorityQueue: serializeQueue(frame.queue),
        relaxedEdges: serializeEdges(frame.relaxedEdges),
        path: serializeStringList(frame.path),
        message: frame.message,
        success: frame.success,
        complete: frame.complete,
      },
    })
  }

  const negative = findNegativeEdge(snapshot)
  if (negative) {
    const distances = emptyDistances(snapshot)
    const previous = emptyPrevious(snapshot)
    push({
      phase: 'negative-weight',
      title: 'Negative weight rejected',
      explanation: `Dijkstra's Algorithm cannot run because edge ${edgeArrow(negative.from, negative.to)} has weight ${formatDistance(negative.weight)}. Selecting the smallest known distance is only safe when every weight is non-negative. No vertex is selected, no neighbor is relaxed, distances stay unset, previous pointers stay empty, and the priority queue is never used. Algorithms such as Bellman-Ford handle negative weights.`,
      detail: `Remove or change the negative edge to continue.`,
      message: `Rejected ${edgeArrow(negative.from, negative.to)} (${formatDistance(negative.weight)})`,
      currentVertex: null,
      activeEdge: { from: negative.from, to: negative.to },
      dequeuedVertex: null,
      dequeuedPriority: null,
      enteredVertex: null,
      enteredPriority: null,
      distances,
      previous,
      visited: [],
      queue: [],
      relaxedEdges: [],
      path: [],
      success: false,
      complete: true,
    })
    return steps
  }

  runDijkstra(snapshot, {
    source: sourceInput ?? '',
    destination: destinationInput,
    onStep: push,
  })

  return steps
}
