import { describe, expect, it } from 'vitest'
import {
  Graph,
  GRAPH_DEFAULT_WEIGHT,
  GRAPH_FLIGHT_NETWORK,
  GRAPH_SOCIAL_NETWORK,
  GRAPH_WEBSITE_LINKS,
  addEdge,
  addVertex,
  assertInvariants,
  clear,
  createEmpty,
  formatGraph,
  getAdjacencyList,
  getAdjacencyMatrix,
  getDegree,
  getEdges,
  getInDegree,
  getNeighbors,
  getOutDegree,
  getVertices,
  hasEdge,
  hasVertex,
  isEmpty,
  removeEdge,
  removeVertex,
  size,
  snapshotFromSeed,
  withMode,
} from './graph'

describe('empty graph', () => {
  it('starts empty with chosen mode flags', () => {
    const graph = createEmpty({ directed: true, weighted: true })
    expect(isEmpty(graph)).toBe(true)
    expect(size(graph)).toBe(0)
    expect(graph.directed).toBe(true)
    expect(graph.weighted).toBe(true)
    expect(getVertices(graph)).toEqual([])
    expect(getEdges(graph)).toEqual([])
    expect(getAdjacencyMatrix(graph)).toEqual([])
    expect(formatGraph(graph)).toBe('(empty)')
    assertInvariants(graph)
  })
})

describe('vertices', () => {
  it('adds and detects vertices with string ids', () => {
    let graph = createEmpty()
    const a = addVertex(graph, 'A')
    expect(a.ok).toBe(true)
    expect(a.changed).toBe(true)
    graph = a.snapshot
    expect(hasVertex(graph, 'A')).toBe(true)
    expect(hasVertex(graph, 'B')).toBe(false)
    expect(getVertices(graph)).toEqual(['A'])
    assertInvariants(graph)
  })

  it('trims vertex ids and rejects empty ids', () => {
    let graph = createEmpty()
    const bad = addVertex(graph, '   ')
    expect(bad.ok).toBe(false)
    expect(bad.changed).toBe(false)

    const ok = addVertex(graph, '  Hub  ')
    expect(ok.ok).toBe(true)
    graph = ok.snapshot
    expect(hasVertex(graph, 'Hub')).toBe(true)
    expect(getVertices(graph)).toEqual(['Hub'])
  })

  it('ignores duplicate vertex inserts', () => {
    let graph = addVertex(createEmpty(), 'A').snapshot
    const dup = addVertex(graph, 'A')
    expect(dup.ok).toBe(true)
    expect(dup.changed).toBe(false)
    expect(size(dup.snapshot)).toBe(1)
  })

  it('keeps disconnected vertices with empty neighbor lists', () => {
    let graph = createEmpty()
    graph = addVertex(graph, 'Lonely').snapshot
    graph = addVertex(graph, 'Also').snapshot
    expect(getNeighbors(graph, 'Lonely')).toEqual([])
    expect(getAdjacencyList(graph)).toEqual({ Lonely: [], Also: [] })
    expect(getEdges(graph)).toEqual([])
    assertInvariants(graph)
  })
})

describe('undirected edges', () => {
  it('adds bidirectional neighbors for an undirected edge', () => {
    let graph = createEmpty({ directed: false, weighted: false })
    graph = addVertex(graph, 'A').snapshot
    graph = addVertex(graph, 'B').snapshot
    const result = addEdge(graph, 'A', 'B')
    expect(result.ok).toBe(true)
    expect(result.changed).toBe(true)
    graph = result.snapshot

    expect(hasEdge(graph, 'A', 'B')).toBe(true)
    expect(hasEdge(graph, 'B', 'A')).toBe(true)
    expect(getNeighbors(graph, 'A')).toEqual([
      { to: 'B', weight: GRAPH_DEFAULT_WEIGHT },
    ])
    expect(getNeighbors(graph, 'B')).toEqual([
      { to: 'A', weight: GRAPH_DEFAULT_WEIGHT },
    ])
    expect(getEdges(graph)).toEqual([
      { from: 'A', to: 'B', weight: GRAPH_DEFAULT_WEIGHT },
    ])
    assertInvariants(graph)
  })

  it('treats duplicate undirected edges as a no-op when unweighted', () => {
    let graph = createEmpty()
    graph = addVertex(graph, 'A').snapshot
    graph = addVertex(graph, 'B').snapshot
    graph = addEdge(graph, 'A', 'B').snapshot
    const dup = addEdge(graph, 'B', 'A')
    expect(dup.ok).toBe(true)
    expect(dup.changed).toBe(false)
    expect(getEdges(dup.snapshot)).toHaveLength(1)
  })

  it('removes both directions for an undirected edge', () => {
    let graph = snapshotFromSeed({
      directed: false,
      weighted: false,
      vertices: ['A', 'B', 'C'],
      edges: [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
      ],
    })
    graph = removeEdge(graph, 'B', 'A').snapshot
    expect(hasEdge(graph, 'A', 'B')).toBe(false)
    expect(hasEdge(graph, 'B', 'A')).toBe(false)
    expect(hasEdge(graph, 'B', 'C')).toBe(true)
    assertInvariants(graph)
  })
})

describe('directed edges', () => {
  it('stores a one-way edge', () => {
    let graph = createEmpty({ directed: true, weighted: false })
    graph = addVertex(graph, 'A').snapshot
    graph = addVertex(graph, 'B').snapshot
    graph = addEdge(graph, 'A', 'B').snapshot

    expect(hasEdge(graph, 'A', 'B')).toBe(true)
    expect(hasEdge(graph, 'B', 'A')).toBe(false)
    expect(getOutDegree(graph, 'A')).toBe(1)
    expect(getInDegree(graph, 'B')).toBe(1)
    expect(getInDegree(graph, 'A')).toBe(0)
    expect(getEdges(graph)).toEqual([
      { from: 'A', to: 'B', weight: GRAPH_DEFAULT_WEIGHT },
    ])
    assertInvariants(graph)
  })

  it('allows opposite directed edges independently', () => {
    let graph = createEmpty({ directed: true })
    graph = addVertex(graph, 'Home').snapshot
    graph = addVertex(graph, 'Blog').snapshot
    graph = addEdge(graph, 'Home', 'Blog').snapshot
    graph = addEdge(graph, 'Blog', 'Home').snapshot
    expect(getEdges(graph)).toHaveLength(2)
    assertInvariants(graph)
  })
})

describe('weighted edges', () => {
  it('stores and updates weights', () => {
    let graph = createEmpty({ directed: true, weighted: true })
    graph = addVertex(graph, 'SGN').snapshot
    graph = addVertex(graph, 'BKK').snapshot
    graph = addEdge(graph, 'SGN', 'BKK', 1.5).snapshot
    expect(getNeighbors(graph, 'SGN')[0]?.weight).toBe(1.5)

    const updated = addEdge(graph, 'SGN', 'BKK', 2)
    expect(updated.changed).toBe(true)
    expect(getNeighbors(updated.snapshot, 'SGN')[0]?.weight).toBe(2)
    assertInvariants(updated.snapshot)
  })

  it('rejects non-finite weights on weighted graphs', () => {
    let graph = createEmpty({ weighted: true })
    graph = addVertex(graph, 'A').snapshot
    graph = addVertex(graph, 'B').snapshot
    const bad = addEdge(graph, 'A', 'B', Number.NaN)
    expect(bad.ok).toBe(false)
    expect(hasEdge(bad.snapshot, 'A', 'B')).toBe(false)
  })

  it('defaults omitted weights to 1', () => {
    let graph = createEmpty({ weighted: true })
    graph = addVertex(graph, 'A').snapshot
    graph = addVertex(graph, 'B').snapshot
    graph = addEdge(graph, 'A', 'B').snapshot
    expect(getNeighbors(graph, 'A')[0]?.weight).toBe(GRAPH_DEFAULT_WEIGHT)
  })
})

describe('self-loops', () => {
  it('allows a directed self-loop', () => {
    let graph = createEmpty({ directed: true })
    graph = addVertex(graph, 'A').snapshot
    graph = addEdge(graph, 'A', 'A').snapshot
    expect(hasEdge(graph, 'A', 'A')).toBe(true)
    expect(getEdges(graph)).toEqual([
      { from: 'A', to: 'A', weight: GRAPH_DEFAULT_WEIGHT },
    ])
    expect(getDegree(graph, 'A')).toBe(1)
    assertInvariants(graph)
  })

  it('counts an undirected self-loop once in the edge list and twice in degree', () => {
    let graph = createEmpty({ directed: false })
    graph = addVertex(graph, 'A').snapshot
    graph = addEdge(graph, 'A', 'A').snapshot
    expect(getEdges(graph)).toHaveLength(1)
    expect(getDegree(graph, 'A')).toBe(2)
    assertInvariants(graph)
  })
})

describe('missing vertices and invalid edges', () => {
  it('refuses edges whose endpoints do not exist', () => {
    let graph = addVertex(createEmpty(), 'A').snapshot
    const missing = addEdge(graph, 'A', 'B')
    expect(missing.ok).toBe(false)
    expect(missing.reason).toMatch(/exist/i)
    expect(getEdges(missing.snapshot)).toEqual([])
  })

  it('returns empty neighbors for unknown vertices', () => {
    const graph = addVertex(createEmpty(), 'A').snapshot
    expect(getNeighbors(graph, 'missing')).toEqual([])
    expect(hasEdge(graph, 'A', 'missing')).toBe(false)
  })

  it('reports failure when removing a missing edge or vertex', () => {
    let graph = createEmpty()
    graph = addVertex(graph, 'A').snapshot
    graph = addVertex(graph, 'B').snapshot
    expect(removeEdge(graph, 'A', 'B').ok).toBe(false)
    expect(removeVertex(graph, 'Z').ok).toBe(false)
  })
})

describe('vertex removal integrity', () => {
  it('removes incident edges when a vertex is deleted', () => {
    let graph = snapshotFromSeed({
      directed: false,
      weighted: false,
      vertices: ['A', 'B', 'C'],
      edges: [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
        { from: 'A', to: 'C' },
      ],
    })
    graph = removeVertex(graph, 'B').snapshot
    expect(hasVertex(graph, 'B')).toBe(false)
    expect(getVertices(graph)).toEqual(['A', 'C'])
    expect(hasEdge(graph, 'A', 'C')).toBe(true)
    expect(hasEdge(graph, 'A', 'B')).toBe(false)
    expect(getNeighbors(graph, 'A').map((n) => n.to)).toEqual(['C'])
    expect(getNeighbors(graph, 'C').map((n) => n.to)).toEqual(['A'])
    assertInvariants(graph)
  })

  it('clears directed inbound and outbound edges', () => {
    let graph = snapshotFromSeed(GRAPH_WEBSITE_LINKS)
    graph = removeVertex(graph, 'Blog').snapshot
    expect(hasVertex(graph, 'Blog')).toBe(false)
    expect(hasEdge(graph, 'Home', 'Blog')).toBe(false)
    expect(hasEdge(graph, 'Post-1', 'Blog')).toBe(false)
    for (const vertex of getVertices(graph)) {
      expect(getNeighbors(graph, vertex).every((n) => n.to !== 'Blog')).toBe(
        true,
      )
    }
    assertInvariants(graph)
  })
})

describe('representations', () => {
  it('builds adjacency list and matrix for a small undirected graph', () => {
    const graph = snapshotFromSeed({
      directed: false,
      weighted: false,
      vertices: ['A', 'B', 'C'],
      edges: [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
      ],
    })
    expect(getAdjacencyList(graph)).toEqual({
      A: [{ to: 'B', weight: 1 }],
      B: [
        { to: 'A', weight: 1 },
        { to: 'C', weight: 1 },
      ],
      C: [{ to: 'B', weight: 1 }],
    })
    expect(getAdjacencyMatrix(graph)).toEqual([
      [null, 1, null],
      [1, null, 1],
      [null, 1, null],
    ])
  })

  it('puts weights into the matrix for weighted directed graphs', () => {
    const graph = snapshotFromSeed(GRAPH_FLIGHT_NETWORK)
    const vertices = getVertices(graph)
    const matrix = getAdjacencyMatrix(graph)
    const sgn = vertices.indexOf('SGN')
    const bkk = vertices.indexOf('BKK')
    expect(matrix[sgn]![bkk]).toBe(1.5)
    expect(matrix[bkk]![sgn]).toBeNull()
    assertInvariants(graph)
  })
})

describe('clear and mode changes', () => {
  it('clears vertices and edges while keeping mode flags', () => {
    let graph = snapshotFromSeed(GRAPH_SOCIAL_NETWORK)
    graph = clear(graph)
    expect(isEmpty(graph)).toBe(true)
    expect(graph.directed).toBe(false)
    expect(graph.weighted).toBe(false)
  })

  it('preserves both directions when switching undirected to directed', () => {
    let graph = snapshotFromSeed({
      directed: false,
      weighted: false,
      vertices: ['A', 'B'],
      edges: [{ from: 'A', to: 'B' }],
    })
    graph = withMode(graph, { directed: true })
    expect(graph.directed).toBe(true)
    expect(hasEdge(graph, 'A', 'B')).toBe(true)
    expect(hasEdge(graph, 'B', 'A')).toBe(true)
    assertInvariants(graph)
  })
})

describe('sample seeds', () => {
  it('loads the social, website, and flight samples', () => {
    const social = snapshotFromSeed(GRAPH_SOCIAL_NETWORK)
    expect(size(social)).toBe(5)
    expect(getEdges(social).length).toBeGreaterThan(0)
    assertInvariants(social)

    const website = snapshotFromSeed(GRAPH_WEBSITE_LINKS)
    expect(website.directed).toBe(true)
    expect(hasEdge(website, 'Home', 'Blog')).toBe(true)
    expect(hasEdge(website, 'Blog', 'Home')).toBe(false)
    assertInvariants(website)

    const flights = snapshotFromSeed(GRAPH_FLIGHT_NETWORK)
    expect(flights.weighted).toBe(true)
    expect(hasEdge(flights, 'SGN', 'BKK')).toBe(true)
    assertInvariants(flights)
  })
})

describe('Graph class API', () => {
  it('supports the curriculum method surface', () => {
    const graph = new Graph({ directed: false, weighted: true })
    expect(graph.addVertex('A')).toBe(true)
    expect(graph.addVertex('A')).toBe(false)
    expect(graph.addVertex('B')).toBe(true)
    expect(graph.addEdge('A', 'B', 3)).toBe(true)
    expect(graph.hasVertex('A')).toBe(true)
    expect(graph.hasEdge('A', 'B')).toBe(true)
    expect(graph.getNeighbors('A')).toEqual([{ to: 'B', weight: 3 }])
    expect(graph.getVertices()).toEqual(['A', 'B'])
    expect(graph.getEdges()).toEqual([{ from: 'A', to: 'B', weight: 3 }])
    expect(graph.getAdjacencyMatrix()[0]![1]).toBe(3)
    expect(graph.size()).toBe(2)
    expect(graph.removeEdge('A', 'B')).toBe(true)
    expect(graph.hasEdge('A', 'B')).toBe(false)
    expect(graph.removeVertex('A')).toBe(true)
    graph.clear()
    expect(graph.size()).toBe(0)
  })

  it('builds from a seed', () => {
    const graph = Graph.fromSeed(GRAPH_SOCIAL_NETWORK)
    expect(graph.size()).toBe(5)
    expect(graph.hasEdge('Alice', 'Bob')).toBe(true)
  })
})
