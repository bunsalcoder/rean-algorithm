import { describe, expect, it } from 'vitest'
import {
  addEdge,
  addVertex,
  createEmpty,
  snapshotFromSeed,
  type GraphSnapshot,
} from '../data-structures/graph'
import {
  BELLMAN_FORD_INFINITY,
  BELLMAN_FORD_NEGATIVE_EDGE,
  BELLMAN_FORD_NEGATIVE_INFINITY,
  BELLMAN_FORD_REACHABLE_CYCLE,
  BELLMAN_FORD_UNDIRECTED,
  BELLMAN_FORD_UNDIRECTED_NEGATIVE,
  BELLMAN_FORD_UNREACHABLE_CYCLE,
  BELLMAN_FORD_ZERO_WEIGHT,
  bellmanFord,
  bellmanFordAnchorIndexes,
  buildBellmanFordSteps,
  parseBellmanFordDistances,
  parseBellmanFordHistory,
  parseBellmanFordPrevious,
  parseBellmanFordRelaxation,
} from './bellmanFord'
import { serializeGraphSnapshot } from './traversalShared'

function graphOf(
  seed: Parameters<typeof snapshotFromSeed>[0],
): GraphSnapshot {
  return snapshotFromSeed(seed)
}

function metaString(
  step: ReturnType<typeof buildBellmanFordSteps>[number],
  key: string,
): string {
  const value = step.meta?.[key]
  return typeof value === 'string' ? value : ''
}

describe('bellmanFord', () => {
  it('finds a basic shortest path on positive weights', () => {
    let graph = createEmpty({ directed: true, weighted: true })
    for (const vertex of ['A', 'B', 'C']) {
      graph = addVertex(graph, vertex).snapshot
    }
    graph = addEdge(graph, 'A', 'B', 1).snapshot
    graph = addEdge(graph, 'B', 'C', 2).snapshot
    graph = addEdge(graph, 'A', 'C', 10).snapshot

    const result = bellmanFord(graph, { source: 'A', destination: 'C' })
    expect(result.ok).toBe(true)
    expect(result.outcome).toBe('shortest-paths')
    expect(result.reachable).toBe(true)
    expect(result.distances.A).toBe(0)
    expect(result.distances.B).toBe(1)
    expect(result.distances.C).toBe(3)
    expect(result.previous.C).toBe('B')
    expect(result.previous.B).toBe('A')
    expect(result.path).toEqual(['A', 'B', 'C'])
    expect(result.hasReachableNegativeCycle).toBe(false)
    expect(result.vertexState.C).toBe('shortest')
  })

  it('uses a negative edge when it improves the path and the graph has no negative cycle', () => {
    const result = bellmanFord(graphOf(BELLMAN_FORD_NEGATIVE_EDGE), {
      source: 'A',
      destination: 'D',
    })
    expect(result.ok).toBe(true)
    expect(result.outcome).toBe('shortest-paths')
    expect(result.distances.A).toBe(0)
    expect(result.distances.B).toBe(1)
    expect(result.distances.C).toBe(2)
    expect(result.distances.D).toBe(4)
    expect(result.previous.C).toBe('A')
    expect(result.previous.B).toBe('C')
    expect(result.previous.D).toBe('B')
    expect(result.path).toEqual(['A', 'C', 'B', 'D'])
    expect(result.vertexState.D).toBe('shortest')
    expect(result.iterationDistances[0]?.distances.D).toBe(BELLMAN_FORD_INFINITY)
    expect(result.iterationDistances[1]?.distances.D).toBe(7)
    expect(result.iterationDistances[2]?.distances.D).toBe(4)
    expect(result.iterationDistances[2]?.distances.B).toBe(1)
  })

  it('accepts zero-weight edges and prefers them over a heavier direct edge', () => {
    const result = bellmanFord(graphOf(BELLMAN_FORD_ZERO_WEIGHT), {
      source: 'A',
      destination: 'D',
    })
    expect(result.distances.B).toBe(0)
    expect(result.distances.C).toBe(0)
    expect(result.distances.D).toBe(1)
    expect(result.path).toEqual(['A', 'B', 'C', 'D'])
    expect(result.previous.D).toBe('C')
    expect(result.hasReachableNegativeCycle).toBe(false)
  })

  it('follows edge direction on a directed graph', () => {
    const graph = graphOf(BELLMAN_FORD_NEGATIVE_EDGE)
    const forward = bellmanFord(graph, { source: 'A', destination: 'D' })
    const backward = bellmanFord(graph, { source: 'D', destination: 'A' })
    expect(forward.path).toEqual(['A', 'C', 'B', 'D'])
    expect(backward.reachable).toBe(false)
    expect(backward.distances.A).toBe(BELLMAN_FORD_INFINITY)
    expect(backward.vertexState.A).toBe('unreachable')
    expect(backward.path).toEqual([])
    expect(backward.outcome).toBe('shortest-paths')
  })

  it('relaxes an undirected edge in both directions', () => {
    const result = bellmanFord(graphOf(BELLMAN_FORD_UNDIRECTED), {
      source: 'A',
      destination: 'D',
    })
    expect(result.ok).toBe(true)
    expect(result.distances.A).toBe(0)
    expect(result.distances.C).toBe(2)
    expect(result.distances.B).toBe(3)
    expect(result.distances.D).toBe(8)
    expect(result.path).toEqual(['A', 'C', 'B', 'D'])
    expect(result.previous.B).toBe('C')
    expect(result.hasReachableNegativeCycle).toBe(false)
  })

  it('leaves disconnected vertices unreachable', () => {
    const result = bellmanFord(graphOf(BELLMAN_FORD_NEGATIVE_EDGE), {
      source: 'A',
      destination: 'E',
    })
    expect(result.distances.E).toBe(BELLMAN_FORD_INFINITY)
    expect(result.previous.E).toBeNull()
    expect(result.vertexState.E).toBe('unreachable')
    expect(result.path).toEqual([])
    expect(result.reachable).toBe(false)
    expect(result.affectedVertices).toEqual([])
  })

  it('ignores a negative cycle that the source cannot reach', () => {
    const result = bellmanFord(graphOf(BELLMAN_FORD_UNREACHABLE_CYCLE), {
      source: 'S',
      destination: 'B',
    })
    expect(result.outcome).toBe('shortest-paths')
    expect(result.hasReachableNegativeCycle).toBe(false)
    expect(result.affectedVertices).toEqual([])
    expect(result.negativeCycle).toEqual([])
    expect(result.distances.S).toBe(0)
    expect(result.distances.A).toBe(2)
    expect(result.distances.B).toBe(5)
    expect(result.distances.X).toBe(BELLMAN_FORD_INFINITY)
    expect(result.distances.Y).toBe(BELLMAN_FORD_INFINITY)
    expect(result.vertexState.X).toBe('unreachable')
    expect(result.vertexState.Y).toBe('unreachable')
    expect(result.path).toEqual(['S', 'A', 'B'])
    expect(result.previous.B).toBe('A')
  })

  it('reports every vertex a reachable negative cycle can affect', () => {
    const result = bellmanFord(graphOf(BELLMAN_FORD_REACHABLE_CYCLE), {
      source: 'S',
      destination: 'C',
    })
    expect(result.ok).toBe(true)
    expect(result.outcome).toBe('negative-cycle')
    expect(result.hasReachableNegativeCycle).toBe(true)
    expect(result.affectedVertices).toEqual(['A', 'B', 'C'])
    expect(result.distances.S).toBe(0)
    expect(result.vertexState.S).toBe('shortest')
    expect(result.distances.A).toBe(BELLMAN_FORD_NEGATIVE_INFINITY)
    expect(result.distances.B).toBe(BELLMAN_FORD_NEGATIVE_INFINITY)
    expect(result.distances.C).toBe(BELLMAN_FORD_NEGATIVE_INFINITY)
    expect(result.previous.A).toBeNull()
    expect(result.previous.B).toBeNull()
    expect(result.previous.C).toBeNull()
    expect(result.path).toEqual([])
    expect(result.reachable).toBe(false)
    expect([...result.negativeCycle].sort()).toEqual(['A', 'B'])
    expect(result.iterationDistances.at(-1)?.distances.A).not.toBe(
      BELLMAN_FORD_NEGATIVE_INFINITY,
    )
  })

  it('treats a negative undirected edge as a negative cycle in both directions', () => {
    const result = bellmanFord(graphOf(BELLMAN_FORD_UNDIRECTED_NEGATIVE), {
      source: 'A',
      destination: 'C',
    })
    expect(result.outcome).toBe('negative-cycle')
    expect(result.affectedVertices).toEqual(['A', 'B', 'C'])
    expect(result.distances.A).toBe(BELLMAN_FORD_NEGATIVE_INFINITY)
    expect(result.distances.B).toBe(BELLMAN_FORD_NEGATIVE_INFINITY)
    expect(result.distances.C).toBe(BELLMAN_FORD_NEGATIVE_INFINITY)
    expect(result.path).toEqual([])
    expect([...result.negativeCycle].sort()).toEqual(['A', 'B'])
  })

  it('returns the one-vertex path when the source is the destination', () => {
    const result = bellmanFord(graphOf(BELLMAN_FORD_NEGATIVE_EDGE), {
      source: 'A',
      destination: 'A',
    })
    expect(result.reachable).toBe(true)
    expect(result.distances.A).toBe(0)
    expect(result.path).toEqual(['A'])
    expect(result.vertexState.A).toBe('shortest')
  })

  it('does not report a finite path when the source sits on a reachable negative cycle', () => {
    let graph = createEmpty({ directed: true, weighted: true })
    graph = addVertex(graph, 'S').snapshot
    graph = addVertex(graph, 'A').snapshot
    graph = addEdge(graph, 'S', 'A', 1).snapshot
    graph = addEdge(graph, 'A', 'S', -2).snapshot

    const result = bellmanFord(graph, { source: 'S', destination: 'S' })
    expect(result.outcome).toBe('negative-cycle')
    expect(result.affectedVertices).toEqual(['S', 'A'])
    expect(result.distances.S).toBe(BELLMAN_FORD_NEGATIVE_INFINITY)
    expect(result.path).toEqual([])
    expect(result.reachable).toBe(false)
  })

  it('stops early when a full pass makes no updates', () => {
    const result = bellmanFord(graphOf(BELLMAN_FORD_NEGATIVE_EDGE), {
      source: 'A',
      destination: 'D',
    })
    expect(result.earlyTerminated).toBe(true)
    expect(result.iterationsRun).toBe(3)
    expect(result.iterationDistances.map((column) => column.iteration)).toEqual([
      0, 1, 2, 3,
    ])
    const last = result.iterationDistances[3]?.distances.D
    const previous = result.iterationDistances[2]?.distances.D
    expect(last).toBe(previous)
  })

  it('records the distance before, the candidate, and the distance after an update', () => {
    const graph = graphOf(BELLMAN_FORD_NEGATIVE_EDGE)
    const steps = buildBellmanFordSteps(graph, 'A', 'D')
    const step = steps.find((item) => {
      const view = parseBellmanFordRelaxation(metaString(item, 'relaxation'))
      return view?.to === 'D' && view.updated && view.before === 7 && view.after === 4
    })
    expect(step).toBeDefined()
    const view = parseBellmanFordRelaxation(metaString(step!, 'relaxation'))
    expect(view).toMatchObject({
      from: 'B',
      to: 'D',
      weight: 3,
      considered: true,
      before: 7,
      candidate: 4,
      after: 4,
      previousBefore: 'B',
      previousAfter: 'B',
      updated: true,
    })
    expect(step?.meta?.phase).toBe('relax')
    const history = parseBellmanFordHistory(metaString(step!, 'history'))
    expect(history[1]?.distances.D).toBe(7)
    expect(parseBellmanFordDistances(metaString(step!, 'distances')).D).toBe(4)
  })

  it('keeps an unreachable negative edge from updating any distance', () => {
    const steps = buildBellmanFordSteps(
      graphOf(BELLMAN_FORD_UNREACHABLE_CYCLE),
      'S',
      'B',
    )
    const ignored = steps.filter((step) => {
      const view = parseBellmanFordRelaxation(metaString(step, 'relaxation'))
      return view?.from === 'Y' && view.to === 'X'
    })
    expect(ignored.length).toBeGreaterThan(0)
    for (const step of ignored) {
      const view = parseBellmanFordRelaxation(metaString(step, 'relaxation'))
      expect(view?.considered).toBe(false)
      expect(view?.updated).toBe(false)
      expect(view?.candidate).toBeNull()
    }
  })

  it('does not mutate the graph or earlier visualization snapshots', () => {
    const graph = graphOf(BELLMAN_FORD_NEGATIVE_EDGE)
    const before = serializeGraphSnapshot(graph)
    const adjacency = graph.adjacency
    const neighbors = graph.adjacency.A
    const steps = buildBellmanFordSteps(graph, 'A', 'D')
    bellmanFord(graph, { source: 'A', destination: 'D' })
    expect(serializeGraphSnapshot(graph)).toBe(before)
    expect(graph.adjacency).toBe(adjacency)
    expect(graph.adjacency.A).toBe(neighbors)

    const firstHistory = steps[0]?.meta?.history
    const firstDistances = steps[0]?.meta?.distances
    const last = steps.at(-1)
    expect(typeof firstHistory).toBe('string')
    expect(steps[0]?.meta?.history).toBe(firstHistory)
    expect(steps[0]?.meta?.distances).toBe(firstDistances)
    expect(parseBellmanFordHistory(String(firstHistory))).toHaveLength(1)
    expect(parseBellmanFordHistory(metaString(last!, 'history')).length).toBeGreaterThan(1)
    expect(parseBellmanFordDistances(String(firstDistances)).D).toBe(
      BELLMAN_FORD_INFINITY,
    )
    expect(parseBellmanFordDistances(metaString(last!, 'distances')).D).toBe(4)
    expect(last?.meta?.finalized).toBe(true)
    expect(parseBellmanFordPrevious(metaString(last!, 'previous')).D).toBe('B')
  })

  it('separates iteration anchors from single edge relaxations', () => {
    const steps = buildBellmanFordSteps(
      graphOf(BELLMAN_FORD_NEGATIVE_EDGE),
      'A',
      'D',
    )
    const anchors = bellmanFordAnchorIndexes(steps)
    expect(anchors.length).toBeGreaterThan(1)
    const relaxIndex = steps.findIndex((step) => step.meta?.phase === 'relax')
    expect(relaxIndex).toBeGreaterThanOrEqual(0)
    expect(anchors[0]).toBeGreaterThan(relaxIndex)
    expect(steps.some((step) => step.meta?.phase === 'early-stop')).toBe(true)
    expect(steps.at(-1)?.meta?.phase).toBe('complete')
    expect(steps.at(-1)?.meta?.earlyTerminated).toBe(true)
  })

  it('ends on a negative-cycle frame and refuses a finite path for affected vertices', () => {
    const steps = buildBellmanFordSteps(
      graphOf(BELLMAN_FORD_REACHABLE_CYCLE),
      'S',
      'C',
    )
    const last = steps.at(-1)
    expect(last?.meta?.phase).toBe('negative-cycle')
    expect(last?.meta?.finalized).toBe(true)
    expect(last?.meta?.hasReachableNegativeCycle).toBe(true)
    const distances = parseBellmanFordDistances(metaString(last!, 'distances'))
    expect(distances.S).toBe(0)
    expect(distances.C).toBe(BELLMAN_FORD_NEGATIVE_INFINITY)
    expect(metaString(last!, 'path')).toBe('[]')
    const opening = steps[0]
    expect(opening?.meta?.hasReachableNegativeCycle).toBe(false)
    expect(opening?.meta?.finalized).toBe(false)
  })

  it('rejects a missing source without throwing or editing the graph', () => {
    const graph = graphOf(BELLMAN_FORD_ZERO_WEIGHT)
    const before = serializeGraphSnapshot(graph)
    const result = bellmanFord(graph, { source: 'Missing', destination: 'A' })
    expect(result.ok).toBe(false)
    expect(result.outcome).toBe('invalid')
    expect(result.path).toEqual([])
    expect(result.reason).toMatch(/does not exist/)
    expect(serializeGraphSnapshot(graph)).toBe(before)
  })

  it('rejects a non-finite weight', () => {
    let graph = createEmpty({ directed: true, weighted: true })
    graph = addVertex(graph, 'A').snapshot
    graph = addVertex(graph, 'B').snapshot
    graph = {
      ...graph,
      adjacency: {
        ...graph.adjacency,
        A: [{ to: 'B', weight: Number.POSITIVE_INFINITY }],
      },
    }
    const result = bellmanFord(graph, { source: 'A', destination: 'B' })
    expect(result.ok).toBe(false)
    expect(result.outcome).toBe('invalid')
    expect(result.reason).toMatch(/non-finite/)
  })
})
