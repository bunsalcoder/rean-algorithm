/**
 * Graph — vertices connected by edges.
 *
 * Supports directed/undirected and weighted/unweighted graphs with string
 * vertex identifiers. Storage is an adjacency list (Record of neighbor arrays).
 *
 * Educational policy:
 * - Empty / whitespace-only vertex ids are rejected.
 * - Edges require both endpoints to already exist.
 * - Duplicate edges: undirected A↔B is one edge; re-adding updates the weight
 *   when weighted, otherwise is a no-op.
 * - Self-loops are allowed. Undirected self-loops appear once in the neighbor list.
 * - Removing a vertex deletes all incident edges.
 * - Unweighted edges use weight 1 internally; displays may omit the weight.
 *
 * Immutable snapshots keep React playgrounds scrub-safe.
 * Independent of React.
 *
 * Typical complexities (V = vertices, E = edges, deg = degree of a vertex):
 * - Space (adjacency list): O(V + E)
 * - Check edge: O(deg) list / O(1) if you also keep a matrix
 * - Iterate neighbors: O(deg)
 * - Add vertex: O(1) amortized
 * Exact costs depend on the concrete representation.
 */

/** String identifier for a vertex (node). */
export type VertexId = string

/** One directed adjacency entry from a vertex to a neighbor. */
export type GraphNeighbor = {
  readonly to: VertexId
  readonly weight: number
}

/** One edge in canonical edge-list form. */
export type GraphEdge = {
  readonly from: VertexId
  readonly to: VertexId
  readonly weight: number
}

export type GraphMode = {
  readonly directed: boolean
  readonly weighted: boolean
}

/**
 * Immutable graph snapshot.
 * `adjacency[v]` lists outgoing neighbors (both ways for undirected edges).
 * Vertex order in `vertices` is insertion order and drives matrix row/column order.
 */
export type GraphSnapshot = {
  readonly directed: boolean
  readonly weighted: boolean
  readonly vertices: readonly VertexId[]
  readonly adjacency: Readonly<Record<string, readonly GraphNeighbor[]>>
}

export type GraphMutationResult = {
  readonly ok: boolean
  readonly snapshot: GraphSnapshot
  readonly reason?: string
  /** True when the graph structure actually changed. */
  readonly changed?: boolean
}

/** Seed edge used by sample builders (weight optional). */
export type GraphEdgeSeed = {
  readonly from: VertexId
  readonly to: VertexId
  readonly weight?: number
}

export type GraphSeed = {
  readonly directed: boolean
  readonly weighted: boolean
  readonly vertices: readonly VertexId[]
  readonly edges: readonly GraphEdgeSeed[]
}

/** Default weight stored for unweighted edges and when weight is omitted. */
export const GRAPH_DEFAULT_WEIGHT = 1

export const GRAPH_EMPTY: GraphSnapshot = {
  directed: false,
  weighted: false,
  vertices: [],
  adjacency: {},
}

/** Sample: undirected social network. */
export const GRAPH_SOCIAL_NETWORK: GraphSeed = {
  directed: false,
  weighted: false,
  vertices: ['Alice', 'Bob', 'Carol', 'Dave', 'Eve'],
  edges: [
    { from: 'Alice', to: 'Bob' },
    { from: 'Alice', to: 'Carol' },
    { from: 'Bob', to: 'Carol' },
    { from: 'Bob', to: 'Dave' },
    { from: 'Carol', to: 'Eve' },
  ],
}

/** Sample: undirected city road network. */
export const GRAPH_CITY_ROADS: GraphSeed = {
  directed: false,
  weighted: false,
  vertices: ['Center', 'North', 'East', 'South', 'West', 'Airport'],
  edges: [
    { from: 'Center', to: 'North' },
    { from: 'Center', to: 'East' },
    { from: 'Center', to: 'South' },
    { from: 'Center', to: 'West' },
    { from: 'North', to: 'East' },
    { from: 'East', to: 'Airport' },
    { from: 'South', to: 'West' },
  ],
}

/** Sample: undirected computer / LAN topology. */
export const GRAPH_COMPUTER_NETWORK: GraphSeed = {
  directed: false,
  weighted: false,
  vertices: ['Router', 'Switch', 'PC-A', 'PC-B', 'Server', 'Printer'],
  edges: [
    { from: 'Router', to: 'Switch' },
    { from: 'Switch', to: 'PC-A' },
    { from: 'Switch', to: 'PC-B' },
    { from: 'Switch', to: 'Server' },
    { from: 'Server', to: 'Printer' },
  ],
}

/** Sample: directed website link network. */
export const GRAPH_WEBSITE_LINKS: GraphSeed = {
  directed: true,
  weighted: false,
  vertices: ['Home', 'About', 'Blog', 'Post-1', 'Contact'],
  edges: [
    { from: 'Home', to: 'About' },
    { from: 'Home', to: 'Blog' },
    { from: 'Home', to: 'Contact' },
    { from: 'Blog', to: 'Post-1' },
    { from: 'Post-1', to: 'Blog' },
    { from: 'About', to: 'Contact' },
  ],
}

/** Sample: weighted directed flight network (hours as weights). */
export const GRAPH_FLIGHT_NETWORK: GraphSeed = {
  directed: true,
  weighted: true,
  vertices: ['SGN', 'BKK', 'NRT', 'ICN', 'SIN'],
  edges: [
    { from: 'SGN', to: 'BKK', weight: 1.5 },
    { from: 'SGN', to: 'SIN', weight: 2 },
    { from: 'BKK', to: 'NRT', weight: 6 },
    { from: 'BKK', to: 'ICN', weight: 5 },
    { from: 'SIN', to: 'NRT', weight: 7 },
    { from: 'ICN', to: 'NRT', weight: 2.5 },
    { from: 'NRT', to: 'SGN', weight: 6.5 },
  ],
}

export const GRAPH_SAMPLE_PRESETS = [
  {
    id: 'social',
    label: 'Social network',
    description: 'Undirected friendships between people.',
    seed: GRAPH_SOCIAL_NETWORK,
  },
  {
    id: 'roads',
    label: 'City roads',
    description: 'Undirected road connections between districts.',
    seed: GRAPH_CITY_ROADS,
  },
  {
    id: 'computers',
    label: 'Computer network',
    description: 'Undirected LAN devices and links.',
    seed: GRAPH_COMPUTER_NETWORK,
  },
  {
    id: 'website',
    label: 'Website links',
    description: 'Directed hyperlinks between pages.',
    seed: GRAPH_WEBSITE_LINKS,
  },
  {
    id: 'flights',
    label: 'Flight network',
    description: 'Directed weighted routes (hours).',
    seed: GRAPH_FLIGHT_NETWORK,
  },
  {
    id: 'empty',
    label: 'Empty graph',
    description: 'Start from scratch.',
    seed: {
      directed: false,
      weighted: false,
      vertices: [] as const,
      edges: [] as const,
    } satisfies GraphSeed,
  },
] as const

export type GraphSamplePresetId = (typeof GRAPH_SAMPLE_PRESETS)[number]['id']

function normalizeVertexId(raw: string): VertexId | null {
  const id = raw.trim()
  return id.length > 0 ? id : null
}

function sortNeighbors(
  neighbors: readonly GraphNeighbor[],
): GraphNeighbor[] {
  return [...neighbors].sort((a, b) => {
    if (a.to < b.to) return -1
    if (a.to > b.to) return 1
    return 0
  })
}

function cloneAdjacency(
  adjacency: GraphSnapshot['adjacency'],
): Record<string, GraphNeighbor[]> {
  const next: Record<string, GraphNeighbor[]> = {}
  for (const [vertex, neighbors] of Object.entries(adjacency)) {
    next[vertex] = neighbors.map((n) => ({ to: n.to, weight: n.weight }))
  }
  return next
}

function resolveWeight(
  weighted: boolean,
  weight: number | undefined,
): { ok: true; weight: number } | { ok: false; reason: string } {
  if (!weighted) {
    return { ok: true, weight: GRAPH_DEFAULT_WEIGHT }
  }
  if (weight === undefined) {
    return { ok: true, weight: GRAPH_DEFAULT_WEIGHT }
  }
  if (!Number.isFinite(weight)) {
    return { ok: false, reason: 'Edge weight must be a finite number.' }
  }
  return { ok: true, weight }
}

function findNeighborIndex(
  neighbors: readonly GraphNeighbor[],
  to: VertexId,
): number {
  return neighbors.findIndex((n) => n.to === to)
}

function setNeighbor(
  list: GraphNeighbor[],
  to: VertexId,
  weight: number,
): { list: GraphNeighbor[]; changed: boolean; created: boolean } {
  const index = findNeighborIndex(list, to)
  if (index === -1) {
    return {
      list: sortNeighbors([...list, { to, weight }]),
      changed: true,
      created: true,
    }
  }
  if (list[index]!.weight === weight) {
    return { list, changed: false, created: false }
  }
  const updated = list.map((n, i) => (i === index ? { to, weight } : n))
  return { list: updated, changed: true, created: false }
}

function removeNeighbor(
  list: GraphNeighbor[],
  to: VertexId,
): { list: GraphNeighbor[]; changed: boolean } {
  const index = findNeighborIndex(list, to)
  if (index === -1) {
    return { list, changed: false }
  }
  return {
    list: [...list.slice(0, index), ...list.slice(index + 1)],
    changed: true,
  }
}

/**
 * Create an empty graph with the given mode flags.
 */
export function createEmpty(
  options: Partial<GraphMode> = {},
): GraphSnapshot {
  return {
    directed: options.directed ?? false,
    weighted: options.weighted ?? false,
    vertices: [],
    adjacency: {},
  }
}

/**
 * Build a snapshot from a seed (vertices + edges).
 * Invalid edges (missing endpoints) are skipped.
 */
export function snapshotFromSeed(seed: GraphSeed): GraphSnapshot {
  let graph = createEmpty({
    directed: seed.directed,
    weighted: seed.weighted,
  })
  for (const vertex of seed.vertices) {
    graph = addVertex(graph, vertex).snapshot
  }
  for (const edge of seed.edges) {
    graph = addEdge(graph, edge.from, edge.to, edge.weight).snapshot
  }
  return graph
}

export function cloneSnapshot(snapshot: GraphSnapshot): GraphSnapshot {
  return {
    directed: snapshot.directed,
    weighted: snapshot.weighted,
    vertices: [...snapshot.vertices],
    adjacency: cloneAdjacency(snapshot.adjacency),
  }
}

export function withMode(
  snapshot: GraphSnapshot,
  mode: Partial<GraphMode>,
): GraphSnapshot {
  const directed = mode.directed ?? snapshot.directed
  const weighted = mode.weighted ?? snapshot.weighted
  if (directed === snapshot.directed && weighted === snapshot.weighted) {
    return snapshot
  }

  // Rebuild edges under the new mode so undirected↔directed stays consistent.
  const edges = getEdges(snapshot)
  let next = createEmpty({ directed, weighted })
  for (const vertex of snapshot.vertices) {
    next = addVertex(next, vertex).snapshot
  }
  const expandToDirected = directed && !snapshot.directed
  for (const edge of edges) {
    next = addEdge(next, edge.from, edge.to, edge.weight).snapshot
    // Preserve undirected connectivity when switching to directed mode.
    if (expandToDirected && edge.from !== edge.to) {
      next = addEdge(next, edge.to, edge.from, edge.weight).snapshot
    }
  }
  return next
}

export function size(snapshot: GraphSnapshot): number {
  return snapshot.vertices.length
}

export function isEmpty(snapshot: GraphSnapshot): boolean {
  return snapshot.vertices.length === 0
}

export function clear(snapshot: GraphSnapshot): GraphSnapshot {
  return createEmpty({
    directed: snapshot.directed,
    weighted: snapshot.weighted,
  })
}

export function hasVertex(
  snapshot: GraphSnapshot,
  vertex: string,
): boolean {
  const id = normalizeVertexId(vertex)
  if (id === null) return false
  return Object.prototype.hasOwnProperty.call(snapshot.adjacency, id)
}

export function getVertices(snapshot: GraphSnapshot): VertexId[] {
  return [...snapshot.vertices]
}

export function getNeighbors(
  snapshot: GraphSnapshot,
  vertex: string,
): GraphNeighbor[] {
  const id = normalizeVertexId(vertex)
  if (id === null || !hasVertex(snapshot, id)) {
    return []
  }
  return [...(snapshot.adjacency[id] ?? [])]
}

export function hasEdge(
  snapshot: GraphSnapshot,
  from: string,
  to: string,
): boolean {
  const a = normalizeVertexId(from)
  const b = normalizeVertexId(to)
  if (a === null || b === null) return false
  if (!hasVertex(snapshot, a) || !hasVertex(snapshot, b)) return false
  return findNeighborIndex(snapshot.adjacency[a] ?? [], b) !== -1
}

/**
 * Canonical edge list.
 * Undirected edges are emitted once with endpoints ordered by insertion index
 * (earlier vertex as `from`), except self-loops which appear once as v→v.
 */
export function getEdges(snapshot: GraphSnapshot): GraphEdge[] {
  const indexOf = new Map(
    snapshot.vertices.map((vertex, index) => [vertex, index]),
  )
  const edges: GraphEdge[] = []
  const seenUndirected = new Set<string>()

  for (const from of snapshot.vertices) {
    for (const neighbor of snapshot.adjacency[from] ?? []) {
      const { to, weight } = neighbor
      if (snapshot.directed) {
        edges.push({ from, to, weight })
        continue
      }
      if (from === to) {
        const key = `${from}->${to}`
        if (!seenUndirected.has(key)) {
          seenUndirected.add(key)
          edges.push({ from, to, weight })
        }
        continue
      }
      const i = indexOf.get(from)!
      const j = indexOf.get(to)!
      const lo = i < j ? from : to
      const hi = i < j ? to : from
      const key = `${lo}|${hi}`
      if (seenUndirected.has(key)) continue
      seenUndirected.add(key)
      edges.push({
        from: lo,
        to: hi,
        weight,
      })
    }
  }

  return edges
}

export function getAdjacencyList(
  snapshot: GraphSnapshot,
): Record<string, readonly GraphNeighbor[]> {
  const list: Record<string, readonly GraphNeighbor[]> = {}
  for (const vertex of snapshot.vertices) {
    list[vertex] = [...(snapshot.adjacency[vertex] ?? [])]
  }
  return list
}

/**
 * Adjacency matrix aligned with `getVertices()` order.
 * `null` means no edge; otherwise the stored weight (1 for unweighted).
 */
export function getAdjacencyMatrix(
  snapshot: GraphSnapshot,
): (number | null)[][] {
  const n = snapshot.vertices.length
  const indexOf = new Map(
    snapshot.vertices.map((vertex, index) => [vertex, index]),
  )
  const matrix: (number | null)[][] = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => null),
  )

  for (const from of snapshot.vertices) {
    const i = indexOf.get(from)!
    for (const neighbor of snapshot.adjacency[from] ?? []) {
      const j = indexOf.get(neighbor.to)
      if (j === undefined) continue
      matrix[i]![j] = neighbor.weight
    }
  }

  return matrix
}

/** Out-degree (directed) or degree (undirected). */
export function getDegree(snapshot: GraphSnapshot, vertex: string): number {
  const id = normalizeVertexId(vertex)
  if (id === null || !hasVertex(snapshot, id)) return 0
  const outgoing = snapshot.adjacency[id] ?? []
  if (snapshot.directed) {
    return outgoing.length
  }
  // Undirected: self-loop contributes 2 to degree (standard graph theory).
  let degree = 0
  for (const neighbor of outgoing) {
    degree += neighbor.to === id ? 2 : 1
  }
  return degree
}

export function getOutDegree(
  snapshot: GraphSnapshot,
  vertex: string,
): number {
  const id = normalizeVertexId(vertex)
  if (id === null || !hasVertex(snapshot, id)) return 0
  return (snapshot.adjacency[id] ?? []).length
}

export function getInDegree(
  snapshot: GraphSnapshot,
  vertex: string,
): number {
  const id = normalizeVertexId(vertex)
  if (id === null || !hasVertex(snapshot, id)) return 0
  let count = 0
  for (const from of snapshot.vertices) {
    if (findNeighborIndex(snapshot.adjacency[from] ?? [], id) !== -1) {
      count += 1
    }
  }
  return count
}

export function addVertex(
  snapshot: GraphSnapshot,
  vertex: string,
): GraphMutationResult {
  const id = normalizeVertexId(vertex)
  if (id === null) {
    return {
      ok: false,
      snapshot,
      reason: 'Vertex id must be a non-empty string.',
      changed: false,
    }
  }
  if (hasVertex(snapshot, id)) {
    return { ok: true, snapshot, changed: false }
  }
  return {
    ok: true,
    changed: true,
    snapshot: {
      ...snapshot,
      vertices: [...snapshot.vertices, id],
      adjacency: {
        ...cloneAdjacency(snapshot.adjacency),
        [id]: [],
      },
    },
  }
}

export function removeVertex(
  snapshot: GraphSnapshot,
  vertex: string,
): GraphMutationResult {
  const id = normalizeVertexId(vertex)
  if (id === null) {
    return {
      ok: false,
      snapshot,
      reason: 'Vertex id must be a non-empty string.',
      changed: false,
    }
  }
  if (!hasVertex(snapshot, id)) {
    return {
      ok: false,
      snapshot,
      reason: `Vertex "${vertex.trim()}" does not exist.`,
      changed: false,
    }
  }

  const adjacency = cloneAdjacency(snapshot.adjacency)
  delete adjacency[id]
  for (const key of Object.keys(adjacency)) {
    adjacency[key] = adjacency[key]!.filter((n) => n.to !== id)
  }

  return {
    ok: true,
    changed: true,
    snapshot: {
      ...snapshot,
      vertices: snapshot.vertices.filter((v) => v !== id),
      adjacency,
    },
  }
}

export function addEdge(
  snapshot: GraphSnapshot,
  from: string,
  to: string,
  weight?: number,
): GraphMutationResult {
  const a = normalizeVertexId(from)
  const b = normalizeVertexId(to)
  if (a === null || b === null) {
    return {
      ok: false,
      snapshot,
      reason: 'Edge endpoints must be non-empty vertex ids.',
      changed: false,
    }
  }
  if (!hasVertex(snapshot, a) || !hasVertex(snapshot, b)) {
    return {
      ok: false,
      snapshot,
      reason: 'Both endpoints must exist before adding an edge.',
      changed: false,
    }
  }

  const resolved = resolveWeight(snapshot.weighted, weight)
  if (!resolved.ok) {
    return {
      ok: false,
      snapshot,
      reason: resolved.reason,
      changed: false,
    }
  }

  const adjacency = cloneAdjacency(snapshot.adjacency)
  const forward = setNeighbor(adjacency[a]!, b, resolved.weight)
  adjacency[a] = forward.list

  let changed = forward.changed
  if (!snapshot.directed && a !== b) {
    const backward = setNeighbor(adjacency[b]!, a, resolved.weight)
    adjacency[b] = backward.list
    changed = changed || backward.changed
  }

  if (!changed) {
    return { ok: true, snapshot, changed: false }
  }

  return {
    ok: true,
    changed: true,
    snapshot: {
      ...snapshot,
      adjacency,
    },
  }
}

export function removeEdge(
  snapshot: GraphSnapshot,
  from: string,
  to: string,
): GraphMutationResult {
  const a = normalizeVertexId(from)
  const b = normalizeVertexId(to)
  if (a === null || b === null) {
    return {
      ok: false,
      snapshot,
      reason: 'Edge endpoints must be non-empty vertex ids.',
      changed: false,
    }
  }
  if (!hasVertex(snapshot, a) || !hasVertex(snapshot, b)) {
    return {
      ok: false,
      snapshot,
      reason: 'Both endpoints must exist to remove an edge.',
      changed: false,
    }
  }

  const adjacency = cloneAdjacency(snapshot.adjacency)
  const forward = removeNeighbor(adjacency[a]!, b)
  adjacency[a] = forward.list

  let changed = forward.changed
  if (!snapshot.directed && a !== b) {
    const backward = removeNeighbor(adjacency[b]!, a)
    adjacency[b] = backward.list
    changed = changed || backward.changed
  }

  if (!changed) {
    return {
      ok: false,
      snapshot,
      reason: 'Edge does not exist.',
      changed: false,
    }
  }

  return {
    ok: true,
    changed: true,
    snapshot: {
      ...snapshot,
      adjacency,
    },
  }
}

export function formatGraph(snapshot: GraphSnapshot): string {
  if (isEmpty(snapshot)) {
    return '(empty)'
  }
  const mode = [
    snapshot.directed ? 'directed' : 'undirected',
    snapshot.weighted ? 'weighted' : 'unweighted',
  ].join(', ')
  const edges = getEdges(snapshot)
  const edgeText =
    edges.length === 0
      ? 'no edges'
      : edges
          .map((e) =>
            snapshot.weighted
              ? `${e.from}${snapshot.directed ? '→' : '—'}${e.to} (${e.weight})`
              : `${e.from}${snapshot.directed ? '→' : '—'}${e.to}`,
          )
          .join(', ')
  return `${mode}; V={${snapshot.vertices.join(', ')}}; E={${edgeText}}`
}

/**
 * Lightweight integrity checks used by tests.
 */
export function assertInvariants(snapshot: GraphSnapshot): void {
  const vertexSet = new Set(snapshot.vertices)
  if (vertexSet.size !== snapshot.vertices.length) {
    throw new Error('Duplicate vertices in snapshot.vertices')
  }
  for (const vertex of snapshot.vertices) {
    if (!(vertex in snapshot.adjacency)) {
      throw new Error(`Missing adjacency entry for vertex ${vertex}`)
    }
  }
  for (const key of Object.keys(snapshot.adjacency)) {
    if (!vertexSet.has(key)) {
      throw new Error(`Orphan adjacency key ${key}`)
    }
    const neighbors = snapshot.adjacency[key]!
    const seen = new Set<string>()
    for (const neighbor of neighbors) {
      if (!vertexSet.has(neighbor.to)) {
        throw new Error(`Edge ${key}→${neighbor.to} references missing vertex`)
      }
      if (!Number.isFinite(neighbor.weight)) {
        throw new Error(`Non-finite weight on ${key}→${neighbor.to}`)
      }
      if (seen.has(neighbor.to)) {
        throw new Error(`Duplicate neighbor ${neighbor.to} under ${key}`)
      }
      seen.add(neighbor.to)
      if (!snapshot.directed && key !== neighbor.to) {
        const back = snapshot.adjacency[neighbor.to]!
        if (findNeighborIndex(back, key) === -1) {
          throw new Error(
            `Undirected edge missing reverse ${neighbor.to}→${key}`,
          )
        }
      }
    }
  }
}

/**
 * Mutable Graph class for lesson code examples.
 * Mirrors the snapshot API with method names from the curriculum.
 */
export class Graph {
  private snapshot: GraphSnapshot

  constructor(options: Partial<GraphMode> = {}) {
    this.snapshot = createEmpty(options)
  }

  static fromSeed(seed: GraphSeed): Graph {
    const graph = new Graph({
      directed: seed.directed,
      weighted: seed.weighted,
    })
    graph.snapshot = snapshotFromSeed(seed)
    return graph
  }

  get directed(): boolean {
    return this.snapshot.directed
  }

  get weighted(): boolean {
    return this.snapshot.weighted
  }

  toSnapshot(): GraphSnapshot {
    return cloneSnapshot(this.snapshot)
  }

  addVertex(vertex: string): boolean {
    const result = addVertex(this.snapshot, vertex)
    this.snapshot = result.snapshot
    return Boolean(result.ok && result.changed)
  }

  removeVertex(vertex: string): boolean {
    const result = removeVertex(this.snapshot, vertex)
    this.snapshot = result.snapshot
    return Boolean(result.ok && result.changed)
  }

  addEdge(from: string, to: string, weight?: number): boolean {
    const result = addEdge(this.snapshot, from, to, weight)
    this.snapshot = result.snapshot
    return Boolean(result.ok && result.changed)
  }

  removeEdge(from: string, to: string): boolean {
    const result = removeEdge(this.snapshot, from, to)
    this.snapshot = result.snapshot
    return Boolean(result.ok && result.changed)
  }

  hasVertex(vertex: string): boolean {
    return hasVertex(this.snapshot, vertex)
  }

  hasEdge(from: string, to: string): boolean {
    return hasEdge(this.snapshot, from, to)
  }

  getNeighbors(vertex: string): GraphNeighbor[] {
    return getNeighbors(this.snapshot, vertex)
  }

  getVertices(): VertexId[] {
    return getVertices(this.snapshot)
  }

  getEdges(): GraphEdge[] {
    return getEdges(this.snapshot)
  }

  getAdjacencyList(): Record<string, readonly GraphNeighbor[]> {
    return getAdjacencyList(this.snapshot)
  }

  getAdjacencyMatrix(): (number | null)[][] {
    return getAdjacencyMatrix(this.snapshot)
  }

  size(): number {
    return size(this.snapshot)
  }

  clear(): void {
    this.snapshot = clear(this.snapshot)
  }
}
