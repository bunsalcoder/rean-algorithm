import { describe, expect, it } from 'vitest'
import {
  addEdge,
  addVertex,
  cloneSnapshot,
  createEmpty,
  getEdges,
  getVertices,
  snapshotFromSeed,
  type GraphSnapshot,
  type VertexId,
} from '../data-structures/graph'
import { buildDfsTopoSteps, topologicalSortDfs } from './topologicalSortDfs'
import { buildKahnSteps, topologicalSortKahn } from './topologicalSortKahn'
import {
  TOPO_CHAIN,
  TOPO_COURSES,
  TOPO_CYCLE,
  TOPO_DISCONNECTED,
  TOPO_SELF_LOOP,
  TOPO_UNDIRECTED,
  parseIndegrees,
} from './topologicalSortShared'
import {
  parseGraphSnapshot,
  parseStringList,
  serializeGraphSnapshot,
} from './traversalShared'
import type { VisualizationStep } from '../../components/visualizations/types'

function graph(seed: Parameters<typeof snapshotFromSeed>[0]): GraphSnapshot {
  return snapshotFromSeed(seed)
}

function expectValidOrder(snapshot: GraphSnapshot, order: readonly VertexId[]) {
  const vertices = getVertices(snapshot)
  expect(order).toHaveLength(vertices.length)
  expect(new Set(order).size).toBe(order.length)
  expect([...order].sort()).toEqual([...vertices].sort())
  const index = new Map(order.map((vertex, position) => [vertex, position]))
  for (const edge of getEdges(snapshot)) {
    const from = index.get(edge.from)
    const to = index.get(edge.to)
    expect(from).toBeTypeOf('number')
    expect(to).toBeTypeOf('number')
    expect(from!).toBeLessThan(to!)
  }
}

function lastStep(steps: readonly VisualizationStep[]): VisualizationStep {
  const step = steps[steps.length - 1]
  expect(step).toBeDefined()
  return step!
}

function metaString(step: VisualizationStep, key: string): string {
  const value = step.meta?.[key]
  expect(typeof value).toBe('string')
  return value as string
}

describe('topological sort', () => {
  const algorithms = [
    { name: 'Kahn', sort: topologicalSortKahn, steps: buildKahnSteps },
    { name: 'DFS', sort: topologicalSortDfs, steps: buildDfsTopoSteps },
  ] as const

  it('orders a simple course DAG and respects every prerequisite edge', () => {
    const courses = graph(TOPO_COURSES)
    const kahn = topologicalSortKahn(courses)
    const dfs = topologicalSortDfs(courses)

    expect(kahn.status).toBe('sorted')
    expect(dfs.status).toBe('sorted')
    expect(kahn.order).toEqual(['Calc', 'Prog', 'Data', 'Phys', 'Algo'])
    expect(dfs.order).toEqual(['Prog', 'Calc', 'Phys', 'Data', 'Algo'])
    expectValidOrder(courses, kahn.order)
    expectValidOrder(courses, dfs.order)
    expect(kahn.order).not.toEqual(dfs.order)
  })

  it('accepts more than one valid order when several sources are free', () => {
    let snapshot = createEmpty({ directed: true })
    for (const vertex of ['A', 'B', 'C']) {
      snapshot = addVertex(snapshot, vertex).snapshot
    }
    snapshot = addEdge(snapshot, 'A', 'C').snapshot
    snapshot = addEdge(snapshot, 'B', 'C').snapshot

    const kahn = topologicalSortKahn(snapshot)
    const dfs = topologicalSortDfs(snapshot)
    expect(kahn.order).toEqual(['A', 'B', 'C'])
    expect(dfs.order).toEqual(['B', 'A', 'C'])
    expectValidOrder(snapshot, kahn.order)
    expectValidOrder(snapshot, dfs.order)
  })

  it('returns the only order of a linear chain from both algorithms', () => {
    const chain = graph(TOPO_CHAIN)
    expect(topologicalSortKahn(chain).order).toEqual(['A', 'B', 'C', 'D'])
    expect(topologicalSortDfs(chain).order).toEqual(['A', 'B', 'C', 'D'])
    expectValidOrder(chain, topologicalSortKahn(chain).order)
  })

  it('orders disconnected DAG components without dropping a chain', () => {
    const snapshot = graph(TOPO_DISCONNECTED)
    const kahn = topologicalSortKahn(snapshot)
    const dfs = topologicalSortDfs(snapshot)
    expect(kahn.status).toBe('sorted')
    expect(dfs.status).toBe('sorted')
    expect(kahn.order).toEqual(['A', 'C', 'B', 'D'])
    expect(dfs.order).toEqual(['C', 'D', 'A', 'B'])
    expectValidOrder(snapshot, kahn.order)
    expectValidOrder(snapshot, dfs.order)
  })

  it('queues every zero-indegree vertex before depending on a later one', () => {
    const courses = graph(TOPO_COURSES)
    const steps = buildKahnSteps(courses)
    const seed = steps.find((step) => step.meta?.phase === 'seed-queue')
    expect(parseStringList(metaString(seed!, 'queue'))).toEqual(['Calc', 'Prog'])
    expect(parseIndegrees(metaString(seed!, 'indegrees'))).toEqual({
      Calc: 0,
      Prog: 0,
      Data: 1,
      Phys: 1,
      Algo: 3,
    })
  })

  it('reports a directed cycle and does not return the partial placement', () => {
    const snapshot = graph(TOPO_CYCLE)
    for (const algorithm of algorithms) {
      const result = algorithm.sort(snapshot)
      expect(result.status).toBe('cycle')
      expect(result.order).toEqual([])
      expect(result.processedCount).toBeLessThan(result.vertexCount)
      expect(result.message).toMatch(/No topological order exists/)

      const steps = algorithm.steps(snapshot)
      expect(lastStep(steps).meta?.status).toBe('cycle')
      expect(parseStringList(metaString(lastStep(steps), 'resultOrder'))).toEqual(
        [],
      )
      expect(steps.some((step) => step.meta?.status === 'sorted')).toBe(false)
    }
    expect(topologicalSortKahn(snapshot).processedCount).toBe(1)
    expect(topologicalSortDfs(snapshot).processedCount).toBe(0)
  })

  it('treats a self-loop as a cycle', () => {
    const snapshot = graph(TOPO_SELF_LOOP)
    for (const algorithm of algorithms) {
      const result = algorithm.sort(snapshot)
      expect(result.status).toBe('cycle')
      expect(result.order).toEqual([])
      expect(result.order).not.toContain('Task')
      expect(result.order).not.toContain('Loop')
    }
  })

  it('sorts an empty directed graph and a single vertex', () => {
    const empty = createEmpty({ directed: true })
    expect(topologicalSortKahn(empty)).toMatchObject({
      status: 'sorted',
      order: [],
      processedCount: 0,
      vertexCount: 0,
    })
    expect(topologicalSortDfs(empty)).toMatchObject({
      status: 'sorted',
      order: [],
      vertexCount: 0,
    })

    const solo = addVertex(empty, 'Solo').snapshot
    expect(topologicalSortKahn(solo).order).toEqual(['Solo'])
    expect(topologicalSortDfs(solo).order).toEqual(['Solo'])
    expectValidOrder(solo, topologicalSortKahn(solo).order)
  })

  it('rejects an undirected graph instead of inventing a direction', () => {
    const snapshot = graph(TOPO_UNDIRECTED)
    for (const algorithm of algorithms) {
      const result = algorithm.sort(snapshot)
      expect(result.status).toBe('undirected')
      expect(result.order).toEqual([])
      expect(result.processedCount).toBe(0)
      expect(result.message).toMatch(/directed graph/)

      const steps = algorithm.steps(snapshot)
      expect(steps).toHaveLength(1)
      expect(lastStep(steps).meta?.status).toBe('undirected')
      expect(parseStringList(metaString(lastStep(steps), 'resultOrder'))).toEqual(
        [],
      )
    }
  })

  it('is deterministic and follows sorted neighbor order', () => {
    let snapshot = createEmpty({ directed: true })
    for (const vertex of ['S', 'Z', 'M', 'A', 'T']) {
      snapshot = addVertex(snapshot, vertex).snapshot
    }
    snapshot = addEdge(snapshot, 'S', 'Z').snapshot
    snapshot = addEdge(snapshot, 'S', 'M').snapshot
    snapshot = addEdge(snapshot, 'S', 'A').snapshot
    snapshot = addEdge(snapshot, 'A', 'T').snapshot
    snapshot = addEdge(snapshot, 'M', 'T').snapshot
    snapshot = addEdge(snapshot, 'Z', 'T').snapshot

    const firstKahn = topologicalSortKahn(snapshot)
    const secondKahn = topologicalSortKahn(snapshot)
    const firstDfs = topologicalSortDfs(snapshot)
    const secondDfs = topologicalSortDfs(snapshot)

    expect(firstKahn.order).toEqual(['S', 'A', 'M', 'Z', 'T'])
    expect(secondKahn).toEqual(firstKahn)
    expect(firstDfs.order).toEqual(['S', 'Z', 'M', 'A', 'T'])
    expect(secondDfs).toEqual(firstDfs)
    expectValidOrder(snapshot, firstKahn.order)
    expectValidOrder(snapshot, firstDfs.order)
    expect(firstKahn.order).not.toEqual(firstDfs.order)
  })

  it('ignores weights on a directed graph and still orders dependencies', () => {
    let snapshot = createEmpty({ directed: true, weighted: true })
    for (const vertex of ['Lib', 'App']) {
      snapshot = addVertex(snapshot, vertex).snapshot
    }
    snapshot = addEdge(snapshot, 'Lib', 'App', 4).snapshot
    expect(topologicalSortKahn(snapshot).order).toEqual(['Lib', 'App'])
    expect(topologicalSortDfs(snapshot).order).toEqual(['Lib', 'App'])
  })

  it('keeps the final playback order equal to the algorithm result', () => {
    const samples = [TOPO_COURSES, TOPO_CHAIN, TOPO_DISCONNECTED, TOPO_CYCLE]
    for (const seed of samples) {
      const snapshot = graph(seed)
      for (const algorithm of algorithms) {
        const result = algorithm.sort(snapshot)
        const steps = algorithm.steps(snapshot)
        const stored = parseStringList(metaString(lastStep(steps), 'resultOrder'))
        expect(stored).toEqual([...result.order])
        expect(lastStep(steps).meta?.status).toBe(result.status)
        expect(lastStep(steps).meta?.complete).toBe(true)
        if (result.status === 'sorted') {
          expectValidOrder(snapshot, stored)
        }
      }
    }
  })

  it('does not mutate the graph or reuse a live indegree object across frames', () => {
    const courses = graph(TOPO_COURSES)
    const before = serializeGraphSnapshot(courses)
    const adjacency = courses.adjacency
    const vertices = courses.vertices
    const calcNeighbors = courses.adjacency.Calc

    const kahnSteps = buildKahnSteps(courses)
    const dfsSteps = buildDfsTopoSteps(courses)
    topologicalSortKahn(courses)
    topologicalSortDfs(courses)

    expect(serializeGraphSnapshot(courses)).toBe(before)
    expect(courses.adjacency).toBe(adjacency)
    expect(courses.vertices).toBe(vertices)
    expect(courses.adjacency.Calc).toBe(calcNeighbors)
    expect(cloneSnapshot(courses)).toEqual(courses)

    const indegreeStep = kahnSteps.find((step) => step.meta?.phase === 'indegree')
    const raw = metaString(indegreeStep!, 'indegrees')
    const parsed = parseIndegrees(raw)
    parsed.Calc = 99
    expect(metaString(indegreeStep!, 'indegrees')).toBe(raw)

    const queueStep = kahnSteps.find((step) => step.meta?.phase === 'seed-queue')
    const queueRaw = metaString(queueStep!, 'queue')
    const queue = parseStringList(queueRaw)
    queue.push('Nope')
    expect(metaString(queueStep!, 'queue')).toBe(queueRaw)

    for (const step of [...kahnSteps, ...dfsSteps]) {
      const stored = parseGraphSnapshot(metaString(step, 'graphSnapshot'))
      expect(stored.vertices).toEqual([...courses.vertices])
      expect(stored.directed).toBe(true)
      expect(getEdges(stored)).toEqual(getEdges(courses))
    }

    expect(buildKahnSteps(courses).map((step) => step.meta)).toEqual(
      kahnSteps.map((step) => step.meta),
    )
    expect(buildDfsTopoSteps(courses).map((step) => step.meta)).toEqual(
      dfsSteps.map((step) => step.meta),
    )
  })

  it('shows Kahn’s indegree updates and DFS finishing-then-reverse as separate frames', () => {
    const courses = graph(TOPO_COURSES)
    const kahnPhases = buildKahnSteps(courses).map((step) => step.meta?.phase)
    expect(kahnPhases).toEqual(
      expect.arrayContaining([
        'initialize',
        'indegree',
        'seed-queue',
        'dequeue',
        'append',
        'relax-edge',
        'enqueue',
        'complete',
      ]),
    )

    const dfsSteps = buildDfsTopoSteps(courses)
    const dfsPhases = dfsSteps.map((step) => step.meta?.phase)
    expect(dfsPhases).toEqual(
      expect.arrayContaining(['enter', 'explore', 'finish', 'reverse', 'complete']),
    )
    const reverse = dfsSteps.find((step) => step.meta?.phase === 'reverse')
    expect(parseStringList(metaString(reverse!, 'finishing'))).toEqual([
      'Algo',
      'Data',
      'Phys',
      'Calc',
      'Prog',
    ])
    expect(parseStringList(metaString(reverse!, 'resultOrder'))).toEqual([
      'Prog',
      'Calc',
      'Phys',
      'Data',
      'Algo',
    ])
    expect(reverse?.explanation).toMatch(/revers/i)

    const ids = dfsSteps.map((step) => step.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
