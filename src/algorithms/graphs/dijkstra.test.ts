import { describe, expect, it } from 'vitest'
import {
  GRAPH_FLIGHT_NETWORK,
  addEdge,
  addVertex,
  createEmpty,
  snapshotFromSeed,
  type GraphSnapshot,
} from '../data-structures/graph'
import {
  DIJKSTRA_DIRECTED_ROUTES,
  DIJKSTRA_INFINITY,
  DIJKSTRA_ROAD_NETWORK,
  DIJKSTRA_ZERO_WEIGHT,
  NegativeWeightError,
  buildDijkstraSteps,
  dijkstra,
  findNegativeEdge,
  formatDistance,
  parseDistances,
  parsePrevious,
  parseQueue,
  reconstructShortestPath,
} from './dijkstra'
import { parseEdges, parseStringList } from './traversalShared'

function road(): GraphSnapshot {
  return snapshotFromSeed(DIJKSTRA_ROAD_NETWORK)
}

function directed(): GraphSnapshot {
  return snapshotFromSeed(DIJKSTRA_DIRECTED_ROUTES)
}

function metaString(
  step: ReturnType<typeof buildDijkstraSteps>[number],
  key: string,
): string {
  const value = step.meta?.[key]
  return typeof value === 'string' ? value : ''
}

describe('dijkstra', () => {
  it('finds the basic shortest path on a weighted road network', () => {
    const result = dijkstra(road(), { source: 'A', destination: 'E' })
    expect(result.ok).toBe(true)
    expect(result.reachable).toBe(true)
    expect(result.distances.A).toBe(0)
    expect(result.distances.C).toBe(2)
    expect(result.distances.B).toBe(3)
    expect(result.distances.D).toBe(8)
    expect(result.distances.E).toBe(10)
    expect(result.path).toEqual(['A', 'C', 'B', 'D', 'E'])
    expect(result.visitedOrder).toEqual(['A', 'C', 'B', 'D', 'E'])
  })

  it('prefers the cheaper route when several paths exist', () => {
    const result = dijkstra(road(), { source: 'A', destination: 'E' })
    expect(result.path).not.toEqual(['A', 'C', 'E'])
    expect(result.distances.E).toBe(10)
    const fewerHops = 2 + 10
    expect(result.distances.E).toBeLessThan(fewerHops)
  })

  it('prefers an indirect route over a heavier direct edge', () => {
    let graph = createEmpty({ directed: false, weighted: true })
    for (const vertex of ['A', 'B', 'C']) {
      graph = addVertex(graph, vertex).snapshot
    }
    graph = addEdge(graph, 'A', 'B', 10).snapshot
    graph = addEdge(graph, 'A', 'C', 1).snapshot
    graph = addEdge(graph, 'C', 'B', 1).snapshot

    const result = dijkstra(graph, { source: 'A', destination: 'B' })
    expect(result.path).toEqual(['A', 'C', 'B'])
    expect(result.distances.B).toBe(2)
    expect(result.previous.B).toBe('C')
  })

  it('follows edge direction on a weighted directed graph', () => {
    const forward = dijkstra(directed(), { source: 'S', destination: 'T' })
    expect(forward.path).toEqual(['S', 'A', 'B', 'C', 'T'])
    expect(forward.distances.T).toBe(7)
    expect(forward.distances.B).toBe(3)
    expect(forward.distances.X).toBe(DIJKSTRA_INFINITY)

    const backward = dijkstra(directed(), { source: 'T', destination: 'S' })
    expect(backward.reachable).toBe(false)
    expect(backward.path).toEqual([])
    expect(backward.distances.S).toBe(DIJKSTRA_INFINITY)
  })

  it('treats undirected weighted edges as traversable both ways', () => {
    let graph = createEmpty({ directed: false, weighted: true })
    for (const vertex of ['A', 'B', 'C']) {
      graph = addVertex(graph, vertex).snapshot
    }
    graph = addEdge(graph, 'A', 'B', 2).snapshot
    graph = addEdge(graph, 'B', 'C', 3).snapshot

    const result = dijkstra(graph, { source: 'C', destination: 'A' })
    expect(result.path).toEqual(['C', 'B', 'A'])
    expect(result.distances.A).toBe(5)
  })

  it('accepts zero-weight edges and still terminates', () => {
    const graph = snapshotFromSeed(DIJKSTRA_ZERO_WEIGHT)
    const result = dijkstra(graph, { source: 'A', destination: 'D' })
    expect(result.path).toEqual(['A', 'B', 'C', 'D'])
    expect(result.distances).toEqual({
      A: 0,
      B: 0,
      C: 0,
      D: 1,
    })

    let loop = createEmpty({ directed: false, weighted: true })
    loop = addVertex(loop, 'A').snapshot
    loop = addVertex(loop, 'B').snapshot
    loop = addEdge(loop, 'A', 'B', 0).snapshot
    const zero = dijkstra(loop, { source: 'A', destination: 'B' })
    expect(zero.distances.B).toBe(0)
    expect(zero.path).toEqual(['A', 'B'])
    expect(zero.visitedOrder).toEqual(['A', 'B'])
  })

  it('leaves disconnected vertices at infinity', () => {
    let graph = road()
    graph = addVertex(graph, 'Z').snapshot
    const result = dijkstra(graph, { source: 'A', destination: 'E' })
    expect(result.distances.Z).toBe(DIJKSTRA_INFINITY)
    expect(result.previous.Z).toBeNull()
    expect(result.visitedOrder).not.toContain('Z')
    expect(result.path).toEqual(['A', 'C', 'B', 'D', 'E'])
  })

  it('reports an unreachable destination', () => {
    const result = dijkstra(directed(), { source: 'S', destination: 'X' })
    expect(result.ok).toBe(true)
    expect(result.reachable).toBe(false)
    expect(result.path).toEqual([])
    expect(result.distances.X).toBe(DIJKSTRA_INFINITY)
    expect(result.reason).toMatch(/No path/)
    expect(formatDistance(result.distances.X)).toBe('∞')
  })

  it('handles source equal to destination', () => {
    const result = dijkstra(road(), { source: 'A', destination: 'A' })
    expect(result.reachable).toBe(true)
    expect(result.path).toEqual(['A'])
    expect(result.distances.A).toBe(0)
    expect(reconstructShortestPath(result.previous, 'A', 'A')).toEqual(['A'])
  })

  it('rejects negative edge weights with a clear error', () => {
    let graph = createEmpty({ directed: true, weighted: true })
    graph = addVertex(graph, 'A').snapshot
    graph = addVertex(graph, 'B').snapshot
    graph = addEdge(graph, 'A', 'B', -2).snapshot
    const before = JSON.stringify(graph)

    expect(findNegativeEdge(graph)).toEqual({
      from: 'A',
      to: 'B',
      weight: -2,
    })
    expect(() => dijkstra(graph, { source: 'A', destination: 'B' })).toThrow(
      NegativeWeightError,
    )
    expect(() => dijkstra(graph, { source: 'A', destination: 'B' })).toThrow(
      /non-negative/,
    )
    expect(JSON.stringify(graph)).toBe(before)

    const steps = buildDijkstraSteps(graph, 'A', 'B')
    expect(steps).toHaveLength(1)
    expect(steps[0]?.meta?.phase).toBe('negative-weight')
    expect(steps[0]?.explanation).toMatch(/Bellman-Ford/)
    expect(steps[0]?.explanation).toMatch(/-2/)
  })

  it('updates distances only when the candidate is strictly smaller', () => {
    const result = dijkstra(road(), { source: 'A', destination: 'B' })
    expect(result.distances.B).toBe(3)
    expect(result.previous.B).toBe('C')
    expect(result.path).toEqual(['A', 'C', 'B'])

    const steps = buildDijkstraSteps(road(), 'A', 'B')
    const relaxB = steps.filter((step) => {
      if (step.meta?.phase !== 'relax') return false
      return step.meta.enteredVertex === 'B'
    })
    expect(relaxB.map((step) => step.meta?.enteredPriority)).toEqual([4, 3])

    const kept = steps.find(
      (step) =>
        step.meta?.phase === 'no-relax' &&
        step.meta.activeEdge === 'B→E',
    )
    expect(kept?.explanation).toMatch(/not smaller/)
    expect(kept?.explanation).toMatch(/previous vertex of E stays/)
  })

  it('tracks previous vertices used to reconstruct the path', () => {
    const result = dijkstra(road(), { source: 'A', destination: 'E' })
    expect(result.previous).toMatchObject({
      A: null,
      C: 'A',
      B: 'C',
      D: 'B',
      E: 'D',
    })
    expect(reconstructShortestPath(result.previous, 'A', 'E')).toEqual(
      result.path,
    )
    expect(reconstructShortestPath(result.previous, 'A', 'Z')).toEqual([])
  })

  it('reconstructs a flight route with fractional weights', () => {
    const flights = snapshotFromSeed(GRAPH_FLIGHT_NETWORK)
    const result = dijkstra(flights, { source: 'SGN', destination: 'NRT' })
    expect(result.path).toEqual(['SGN', 'BKK', 'NRT'])
    expect(result.distances.NRT).toBe(7.5)
  })

  it('drops stale priority-queue entries after a better distance is found', () => {
    const steps = buildDijkstraSteps(road(), 'A', 'E')
    const stale = steps.filter((step) => step.meta?.phase === 'stale')
    expect(stale.length).toBeGreaterThan(0)

    const staleB = stale.find((step) => step.meta?.dequeuedVertex === 'B')
    expect(staleB?.meta?.dequeuedPriority).toBe(4)
    expect(staleB?.explanation).toMatch(/stale/i)
    expect(staleB?.explanation).toMatch(/priority queue/i)
    expect(staleB?.explanation).toMatch(/nothing enters/i)

    const final = steps.at(-1)!
    expect(parseDistances(metaString(final, 'distances')).B).toBe(3)
    expect(final.meta?.phase).toBe('complete')
  })

  it('does not mutate the original graph', () => {
    const graph = road()
    const before = JSON.stringify(graph)
    const adjacency = graph.adjacency
    dijkstra(graph, { source: 'A', destination: 'E' })
    buildDijkstraSteps(graph, 'A', 'E')
    expect(JSON.stringify(graph)).toBe(before)
    expect(graph.adjacency).toBe(adjacency)
  })

  it('keeps visualization snapshots immutable for backward playback', () => {
    const graph = road()
    const steps = buildDijkstraSteps(graph, 'A', 'E')
    expect(steps.length).toBeGreaterThan(4)

    const early = steps[1]!
    const later = steps.find(
      (step) => step.meta?.phase === 'relax' && step.meta.enteredVertex === 'C',
    )
    expect(later).toBeDefined()

    const earlyDistances = parseDistances(metaString(early, 'distances'))
    const laterDistances = parseDistances(metaString(later!, 'distances'))
    expect(earlyDistances.C).toBe(DIJKSTRA_INFINITY)
    expect(laterDistances.C).toBe(2)

    earlyDistances.C = 99
    earlyDistances.A = 50
    expect(parseDistances(metaString(early, 'distances')).C).toBe(
      DIJKSTRA_INFINITY,
    )
    expect(parseDistances(metaString(early, 'distances')).A).toBe(0)
    expect(parseDistances(metaString(later, 'distances')).C).toBe(2)

    const earlyPrevious = parsePrevious(metaString(early, 'previous'))
    earlyPrevious.C = 'ZZZ'
    expect(parsePrevious(metaString(early, 'previous')).C).toBeNull()

    const earlyQueue = parseQueue(metaString(early, 'priorityQueue'))
    expect(earlyQueue.map((entry) => entry.vertex)).toEqual(['A'])
    earlyQueue.push({ vertex: 'NOPE', priority: 1, stale: false })
    expect(parseQueue(metaString(early, 'priorityQueue'))).toHaveLength(1)

    const replayed = parseDistances(metaString(steps[1]!, 'distances'))
    expect(replayed.A).toBe(0)
    expect(replayed.B).toBe(DIJKSTRA_INFINITY)
    expect(replayed.C).toBe(DIJKSTRA_INFINITY)

    const complete = steps.at(-1)!
    expect(parseStringList(metaString(complete, 'path'))).toEqual([
      'A',
      'C',
      'B',
      'D',
      'E',
    ])
    expect(parseEdges(metaString(complete, 'relaxedEdges')).length).toBeGreaterThan(
      0,
    )
    expect(metaString(complete, 'graphSnapshot')).toBe(
      metaString(early, 'graphSnapshot'),
    )
    expect(JSON.stringify(graph)).toBe(JSON.stringify(road()))
  })

  it('explains selection, relaxation, and the priority queue on each relevant step', () => {
    const steps = buildDijkstraSteps(road(), 'A', 'E')
    const selectC = steps.find(
      (step) => step.meta?.phase === 'select' && step.meta.currentVertex === 'C',
    )
    expect(selectC?.explanation).toMatch(/Select C/)
    expect(selectC?.explanation).toMatch(/smallest known distance/)
    expect(selectC?.explanation).toMatch(/leaves the priority queue/)

    const relax = steps.find((step) => step.meta?.phase === 'relax')
    expect(relax?.explanation).toMatch(/Candidate distance/)
    expect(relax?.explanation).toMatch(/previous vertex/)
    expect(relax?.explanation).toMatch(/enters the priority queue/)

    const phases = new Set(steps.map((step) => step.meta?.phase))
    expect(phases.has('initialize')).toBe(true)
    expect(phases.has('seed')).toBe(true)
    expect(phases.has('select')).toBe(true)
    expect(phases.has('relax')).toBe(true)
    expect(phases.has('no-relax')).toBe(true)
    expect(phases.has('stale')).toBe(true)
    expect(phases.has('complete')).toBe(true)
  })

  it('returns a failed result when the source is missing without throwing', () => {
    const graph = road()
    const result = dijkstra(graph, { source: 'Missing', destination: 'A' })
    expect(result.ok).toBe(false)
    expect(result.source).toBeNull()
    expect(result.path).toEqual([])
    const steps = buildDijkstraSteps(graph, 'Missing', 'A')
    expect(steps.at(-1)?.meta?.phase).toBe('invalid')
  })
})
