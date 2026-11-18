import { describe, expect, it } from 'vitest'
import {
  addEdge,
  addVertex,
  createEmpty,
  snapshotFromSeed,
  type GraphSnapshot,
} from '../data-structures/graph'
import {
  FLOYD_WARSHALL_INFINITY,
  FLOYD_WARSHALL_NEGATIVE_CYCLE,
  FLOYD_WARSHALL_NEGATIVE_EDGE,
  FLOYD_WARSHALL_NEGATIVE_INFINITY,
  FLOYD_WARSHALL_ROUTES,
  FLOYD_WARSHALL_SELF_LOOP,
  FLOYD_WARSHALL_UNDIRECTED,
  FLOYD_WARSHALL_ZERO,
  buildFloydWarshallSteps,
  floydWarshall,
  floydWarshallAnchorIndexes,
  parseFloydWarshallMatrix,
  reconstructFloydWarshallPath,
  reportedPairDistance,
  type FloydWarshallPairState,
} from './floydWarshall'

function graphOf(seed: Parameters<typeof snapshotFromSeed>[0]): GraphSnapshot {
  return snapshotFromSeed(seed)
}

function cell(
  result: ReturnType<typeof floydWarshall>,
  from: string,
  to: string,
): number {
  return reportedPairDistance(result, from, to)
}

function state(
  result: ReturnType<typeof floydWarshall>,
  from: string,
  to: string,
): FloydWarshallPairState {
  const i = result.vertices.indexOf(from)
  const j = result.vertices.indexOf(to)
  return result.pairState[i]![j]!
}

function pathOf(
  result: ReturnType<typeof floydWarshall>,
  source: string,
  destination: string,
) {
  return reconstructFloydWarshallPath({
    vertices: result.vertices,
    distances: result.distances,
    next: result.next,
    source,
    destination,
    affectedPairs: result.affectedPairs,
  })
}

describe('floydWarshall', () => {
  it('finds basic all-pairs shortest paths on positive weights', () => {
    const result = floydWarshall(graphOf(FLOYD_WARSHALL_ROUTES))
    expect(result.ok).toBe(true)
    expect(result.hasNegativeCycle).toBe(false)
    expect(result.affectedPairs).toEqual([])
    expect(cell(result, 'A', 'A')).toBe(0)
    expect(cell(result, 'A', 'B')).toBe(5)
    expect(cell(result, 'A', 'C')).toBe(7)
    expect(cell(result, 'A', 'D')).toBe(8)
    expect(cell(result, 'B', 'C')).toBe(2)
    expect(cell(result, 'B', 'D')).toBe(3)
    expect(cell(result, 'C', 'D')).toBe(1)
    expect(cell(result, 'B', 'A')).toBe(FLOYD_WARSHALL_INFINITY)
    expect(cell(result, 'D', 'A')).toBe(FLOYD_WARSHALL_INFINITY)
    expect(pathOf(result, 'A', 'D').path).toEqual(['A', 'B', 'C', 'D'])
    expect(pathOf(result, 'A', 'D').edges).toEqual([
      { from: 'A', to: 'B' },
      { from: 'B', to: 'C' },
      { from: 'C', to: 'D' },
    ])
    expect(pathOf(result, 'B', 'D').path).toEqual(['B', 'C', 'D'])
  })

  it('follows edge direction on a directed graph', () => {
    const result = floydWarshall(graphOf(FLOYD_WARSHALL_NEGATIVE_EDGE))
    expect(cell(result, 'A', 'D')).toBe(4)
    expect(pathOf(result, 'A', 'D').path).toEqual(['A', 'C', 'B', 'D'])
    expect(state(result, 'D', 'A')).toBe('unreachable')
    expect(cell(result, 'D', 'A')).toBe(FLOYD_WARSHALL_INFINITY)
    expect(pathOf(result, 'D', 'A').path).toEqual([])
    expect(pathOf(result, 'A', 'B').path).toEqual(['A', 'C', 'B'])
    expect(cell(result, 'A', 'B')).toBe(1)
    expect(cell(result, 'C', 'D')).toBe(2)
  })

  it('treats an undirected edge as two directed edges of the same weight', () => {
    const result = floydWarshall(graphOf(FLOYD_WARSHALL_UNDIRECTED))
    expect(result.hasNegativeCycle).toBe(false)
    expect(cell(result, 'A', 'D')).toBe(8)
    expect(cell(result, 'D', 'A')).toBe(8)
    expect(pathOf(result, 'A', 'D').path).toEqual(['A', 'C', 'B', 'D'])
    expect(pathOf(result, 'D', 'A').path).toEqual(['D', 'B', 'C', 'A'])
    expect(cell(result, 'A', 'B')).toBe(3)
  })

  it('accepts zero-weight edges and prefers them over a heavier direct edge', () => {
    const result = floydWarshall(graphOf(FLOYD_WARSHALL_ZERO))
    expect(cell(result, 'A', 'B')).toBe(0)
    expect(cell(result, 'A', 'C')).toBe(0)
    expect(cell(result, 'A', 'D')).toBe(1)
    expect(pathOf(result, 'A', 'D').path).toEqual(['A', 'B', 'C', 'D'])
    expect(result.hasNegativeCycle).toBe(false)
  })

  it('uses a negative edge when the graph has no negative cycle', () => {
    const result = floydWarshall(graphOf(FLOYD_WARSHALL_NEGATIVE_EDGE))
    expect(result.hasNegativeCycle).toBe(false)
    expect(result.negativeCycleVertices).toEqual([])
    expect(cell(result, 'A', 'C')).toBe(2)
    expect(cell(result, 'C', 'B')).toBe(-1)
    expect(cell(result, 'A', 'D')).toBe(4)
    expect(state(result, 'A', 'D')).toBe('shortest')
  })

  it('leaves disconnected vertices unreachable except for the zero diagonal', () => {
    const result = floydWarshall(graphOf(FLOYD_WARSHALL_NEGATIVE_EDGE))
    expect(cell(result, 'E', 'E')).toBe(0)
    expect(pathOf(result, 'E', 'E').path).toEqual(['E'])
    expect(cell(result, 'A', 'E')).toBe(FLOYD_WARSHALL_INFINITY)
    expect(cell(result, 'E', 'A')).toBe(FLOYD_WARSHALL_INFINITY)
    expect(state(result, 'A', 'E')).toBe('unreachable')
    expect(pathOf(result, 'A', 'E').path).toEqual([])
    expect(result.affectedPairs).toEqual([])
  })

  it('keeps a positive or zero self-loop from replacing the empty path', () => {
    let graph = createEmpty({ directed: true, weighted: true })
    for (const vertex of ['A', 'B']) {
      graph = addVertex(graph, vertex).snapshot
    }
    graph = addEdge(graph, 'A', 'A', 5).snapshot
    graph = addEdge(graph, 'A', 'B', 1).snapshot
    graph = addEdge(graph, 'B', 'B', 0).snapshot

    const result = floydWarshall(graph)
    expect(result.distances[0]![0]).toBe(0)
    expect(result.distances[1]![1]).toBe(0)
    expect(cell(result, 'A', 'B')).toBe(1)
    expect(pathOf(result, 'A', 'B').path).toEqual(['A', 'B'])
    expect(result.hasNegativeCycle).toBe(false)
  })

  it('treats a negative self-loop as a negative cycle on that vertex only', () => {
    const result = floydWarshall(graphOf(FLOYD_WARSHALL_SELF_LOOP))
    expect(result.hasNegativeCycle).toBe(true)
    expect(result.negativeCycleVertices).toEqual(['A'])
    expect(result.distances[0]![0]).toBeLessThan(0)
    expect(state(result, 'A', 'A')).toBe('negative-cycle')
    expect(state(result, 'A', 'B')).toBe('negative-cycle')
    expect(cell(result, 'A', 'B')).toBe(FLOYD_WARSHALL_NEGATIVE_INFINITY)
    expect(pathOf(result, 'A', 'B').path).toEqual([])
    expect(pathOf(result, 'A', 'A').path).toEqual([])
    expect(state(result, 'B', 'B')).toBe('shortest')
    expect(cell(result, 'B', 'B')).toBe(0)
    expect(pathOf(result, 'B', 'B').path).toEqual(['B'])
    expect(state(result, 'C', 'C')).toBe('shortest')
    expect(state(result, 'B', 'A')).toBe('unreachable')
    expect(state(result, 'A', 'C')).toBe('unreachable')
    expect(result.affectedPairs).toEqual([
      { from: 'A', to: 'A' },
      { from: 'A', to: 'B' },
    ])
  })

  it('keeps the smaller weight when the adjacency list repeats an edge', () => {
    const graph: GraphSnapshot = {
      directed: true,
      weighted: true,
      vertices: ['A', 'B', 'C'],
      adjacency: {
        A: [
          { to: 'B', weight: 9 },
          { to: 'B', weight: 2 },
          { to: 'C', weight: 4 },
        ],
        B: [{ to: 'C', weight: 1 }],
        C: [],
      },
    }
    const before = JSON.stringify(graph)
    const result = floydWarshall(graph)
    expect(JSON.stringify(graph)).toBe(before)
    expect(cell(result, 'A', 'B')).toBe(2)
    expect(cell(result, 'A', 'C')).toBe(3)
    expect(pathOf(result, 'A', 'C').path).toEqual(['A', 'B', 'C'])
  })

  it('updates a repeated edge the same way the graph module does', () => {
    let graph = createEmpty({ directed: true, weighted: true })
    for (const vertex of ['A', 'B']) {
      graph = addVertex(graph, vertex).snapshot
    }
    graph = addEdge(graph, 'A', 'B', 9).snapshot
    graph = addEdge(graph, 'A', 'B', 2).snapshot
    const result = floydWarshall(graph)
    expect(cell(result, 'A', 'B')).toBe(2)
    expect(graph.adjacency.A).toEqual([{ to: 'B', weight: 2 }])
  })

  it('returns the one-vertex path when the source is the destination', () => {
    const result = floydWarshall(graphOf(FLOYD_WARSHALL_ROUTES))
    const path = pathOf(result, 'B', 'B')
    expect(path.ok).toBe(true)
    expect(path.state).toBe('shortest')
    expect(path.distance).toBe(0)
    expect(path.path).toEqual(['B'])
    expect(path.edges).toEqual([])
  })

  it('keeps the earlier path when two routes have the same distance', () => {
    let graph = createEmpty({ directed: true, weighted: true })
    for (const vertex of ['A', 'B', 'C', 'D']) {
      graph = addVertex(graph, vertex).snapshot
    }
    graph = addEdge(graph, 'A', 'D', 2).snapshot
    graph = addEdge(graph, 'A', 'B', 1).snapshot
    graph = addEdge(graph, 'B', 'D', 1).snapshot
    graph = addEdge(graph, 'A', 'C', 1).snapshot
    graph = addEdge(graph, 'C', 'D', 1).snapshot

    const result = floydWarshall(graph)
    expect(cell(result, 'A', 'D')).toBe(2)
    expect(pathOf(result, 'A', 'D').path).toEqual(['A', 'D'])

    let indirect = createEmpty({ directed: true, weighted: true })
    for (const vertex of ['A', 'B', 'C', 'D']) {
      indirect = addVertex(indirect, vertex).snapshot
    }
    indirect = addEdge(indirect, 'A', 'B', 1).snapshot
    indirect = addEdge(indirect, 'B', 'D', 1).snapshot
    indirect = addEdge(indirect, 'A', 'C', 1).snapshot
    indirect = addEdge(indirect, 'C', 'D', 1).snapshot
    const tied = floydWarshall(indirect)
    expect(cell(tied, 'A', 'D')).toBe(2)
    expect(pathOf(tied, 'A', 'D').path).toEqual(['A', 'B', 'D'])
  })

  it('marks only the pairs that can reach and leave a negative cycle', () => {
    const result = floydWarshall(graphOf(FLOYD_WARSHALL_NEGATIVE_CYCLE))
    expect(result.ok).toBe(true)
    expect(result.hasNegativeCycle).toBe(true)
    expect(result.negativeCycleVertices).toEqual(['A', 'B'])
    expect(result.distances[result.vertices.indexOf('A')]![result.vertices.indexOf('A')]!).toBeLessThan(0)
    expect(result.distances[result.vertices.indexOf('B')]![result.vertices.indexOf('B')]!).toBeLessThan(0)
    expect(result.distances[result.vertices.indexOf('S')]![result.vertices.indexOf('S')]).toBe(0)

    const affected = result.affectedPairs.map((pair) => `${pair.from}→${pair.to}`)
    expect(affected).toEqual([
      'S→A',
      'S→B',
      'S→C',
      'A→A',
      'A→B',
      'A→C',
      'B→A',
      'B→B',
      'B→C',
    ])

    expect(state(result, 'S', 'S')).toBe('shortest')
    expect(cell(result, 'S', 'S')).toBe(0)
    expect(pathOf(result, 'S', 'S').path).toEqual(['S'])
    expect(state(result, 'C', 'C')).toBe('shortest')
    expect(pathOf(result, 'C', 'C').path).toEqual(['C'])
    expect(state(result, 'X', 'Y')).toBe('shortest')
    expect(cell(result, 'X', 'Y')).toBe(5)
    expect(pathOf(result, 'X', 'Y').path).toEqual(['X', 'Y'])
    expect(state(result, 'S', 'X')).toBe('unreachable')
    expect(cell(result, 'S', 'X')).toBe(FLOYD_WARSHALL_INFINITY)
    expect(state(result, 'C', 'A')).toBe('unreachable')
    expect(state(result, 'S', 'C')).toBe('negative-cycle')
    expect(cell(result, 'S', 'C')).toBe(FLOYD_WARSHALL_NEGATIVE_INFINITY)
    expect(pathOf(result, 'S', 'C').path).toEqual([])
    expect(pathOf(result, 'A', 'A').state).toBe('negative-cycle')
    expect(pathOf(result, 'A', 'A').path).toEqual([])
  })

  it('treats a negative undirected edge as a cycle the walk can cross both ways', () => {
    let graph = createEmpty({ directed: false, weighted: true })
    for (const vertex of ['A', 'B', 'C']) {
      graph = addVertex(graph, vertex).snapshot
    }
    graph = addVertex(graph, 'D').snapshot
    graph = addEdge(graph, 'A', 'B', -1).snapshot
    graph = addEdge(graph, 'A', 'C', 2).snapshot
    const result = floydWarshall(graph)
    expect(result.hasNegativeCycle).toBe(true)
    expect(result.negativeCycleVertices).toEqual(['A', 'B'])
    expect(state(result, 'A', 'C')).toBe('negative-cycle')
    expect(state(result, 'B', 'C')).toBe('negative-cycle')
    // C can walk to A, loop the negative edge, and return, so C itself is affected.
    expect(state(result, 'C', 'C')).toBe('negative-cycle')
    expect(pathOf(result, 'C', 'C').path).toEqual([])
    expect(pathOf(result, 'A', 'B').path).toEqual([])
    expect(state(result, 'D', 'D')).toBe('shortest')
    expect(cell(result, 'D', 'D')).toBe(0)
    expect(pathOf(result, 'D', 'D').path).toEqual(['D'])
    expect(state(result, 'A', 'D')).toBe('unreachable')
  })

  it('reads unweighted edges as weight 1', () => {
    let graph = createEmpty({ directed: true, weighted: false })
    for (const vertex of ['A', 'B', 'C']) {
      graph = addVertex(graph, vertex).snapshot
    }
    graph = addEdge(graph, 'A', 'B').snapshot
    graph = addEdge(graph, 'B', 'C').snapshot
    const result = floydWarshall(graph)
    expect(cell(result, 'A', 'B')).toBe(1)
    expect(cell(result, 'A', 'C')).toBe(2)
    expect(pathOf(result, 'A', 'C').path).toEqual(['A', 'B', 'C'])
  })

  it('rejects a non-finite weight without editing the graph', () => {
    const graph: GraphSnapshot = {
      directed: true,
      weighted: true,
      vertices: ['A', 'B'],
      adjacency: {
        A: [{ to: 'B', weight: Number.POSITIVE_INFINITY }],
        B: [],
      },
    }
    const before = JSON.stringify(graph)
    const result = floydWarshall(graph)
    expect(result.ok).toBe(false)
    expect(result.reason).toMatch(/non-finite/)
    expect(JSON.stringify(graph)).toBe(before)
    const steps = buildFloydWarshallSteps(graph)
    expect(steps).toHaveLength(1)
    expect(steps[0]?.meta?.phase).toBe('invalid')
  })

  it('keeps iteration matrices and step snapshots independent', () => {
    const graph = graphOf(FLOYD_WARSHALL_ROUTES)
    const before = JSON.stringify(graph)
    const result = floydWarshall(graph)
    expect(JSON.stringify(graph)).toBe(before)
    expect(result.iterations).toHaveLength(graph.vertices.length + 1)
    expect(result.iterations[0]?.k).toBeNull()
    expect(result.iterations[0]?.distances[0]?.[3]).toBe(20)
    expect(result.iterations.at(-1)?.distances[0]?.[3]).toBe(8)

    const initialRow = result.iterations[0]!.distances[0] as number[]
    initialRow[3] = 999
    expect(result.distances[0]?.[3]).toBe(8)
    expect(result.iterations[1]?.distances[0]?.[3]).not.toBe(999)

    const steps = buildFloydWarshallSteps(graph)
    const firstMatrix = steps[0]?.meta?.distances
    const updated = steps.find((step) => {
      const update = step.meta?.update
      return (
        typeof update === 'string' &&
        update.includes('"i":"A"') &&
        update.includes('"j":"D"') &&
        update.includes('"k":"C"') &&
        update.includes('"updated":true')
      )
    })
    expect(updated?.meta?.phase).toBe('consider')
    expect(updated?.meta?.distances).not.toBe(firstMatrix)
    const parsed = parseFloydWarshallMatrix(
      typeof updated?.meta?.distances === 'string' ? updated.meta.distances : '',
    )
    parsed[0]![0] = 12345
    expect(steps[0]?.meta?.distances).toBe(firstMatrix)
    expect(
      parseFloydWarshallMatrix(
        typeof updated?.meta?.distances === 'string' ? updated.meta.distances : '',
      )[0]?.[3],
    ).toBe(8)

    const anchors = floydWarshallAnchorIndexes(steps)
    const endCount = steps.filter((step) => step.meta?.phase === 'iteration-end').length
    expect(endCount).toBe(graph.vertices.length)
    expect(anchors.length).toBeGreaterThan(endCount)
    expect(steps.at(-1)?.meta?.phase).toBe('complete')
    expect(steps.at(-1)?.meta?.hasNegativeCycle).toBe(false)
  })

  it('records a negative-cycle frame without marking unaffected pairs', () => {
    const steps = buildFloydWarshallSteps(graphOf(FLOYD_WARSHALL_NEGATIVE_CYCLE))
    const cycleStep = steps.find((step) => step.meta?.phase === 'negative-cycle')
    expect(cycleStep?.meta?.finalized).toBe(true)
    expect(cycleStep?.meta?.hasNegativeCycle).toBe(true)
    const affected =
      typeof cycleStep?.meta?.affectedPairs === 'string'
        ? cycleStep.meta.affectedPairs
        : ''
    expect(affected).toContain('"from":"S","to":"C"')
    expect(affected).not.toContain('"from":"X","to":"Y"')
    expect(affected).not.toContain('"from":"S","to":"S"')
    const complete = steps.at(-1)
    expect(complete?.meta?.phase).toBe('complete')
    expect(complete?.meta?.affectedPairs).toBe(cycleStep?.meta?.affectedPairs)
  })

  it('does not walk an affected pair even if a successor chain exists', () => {
    const result = floydWarshall(graphOf(FLOYD_WARSHALL_NEGATIVE_CYCLE))
    const guarded = pathOf(result, 'S', 'C')
    expect(guarded.path).toEqual([])
    expect(guarded.distance).toBe(FLOYD_WARSHALL_NEGATIVE_INFINITY)
    const unguarded = reconstructFloydWarshallPath({
      vertices: result.vertices,
      distances: result.distances,
      next: result.next,
      source: 'S',
      destination: 'C',
    })
    expect(unguarded.path.length).toBeLessThanOrEqual(result.vertices.length)
    expect(new Set(unguarded.path).size).toBe(unguarded.path.length)
  })

  it('reports a missing path endpoint without throwing', () => {
    const result = floydWarshall(graphOf(FLOYD_WARSHALL_ROUTES))
    const missing = pathOf(result, 'Missing', 'A')
    expect(missing.ok).toBe(false)
    expect(missing.state).toBe('invalid')
    expect(missing.path).toEqual([])
  })

  it('handles an empty graph', () => {
    const result = floydWarshall(createEmpty({ directed: true, weighted: true }))
    expect(result.ok).toBe(true)
    expect(result.vertices).toEqual([])
    expect(result.distances).toEqual([])
    expect(result.hasNegativeCycle).toBe(false)
    expect(result.iterations).toHaveLength(1)
  })
})
