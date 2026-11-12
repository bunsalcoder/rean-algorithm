import { describe, expect, it } from 'vitest'
import {
  GRAPH_SOCIAL_NETWORK,
  addEdge,
  addVertex,
  createEmpty,
  getNeighbors,
  snapshotFromSeed,
  type GraphSnapshot,
} from '../data-structures/graph'
import {
  breadthFirstSearch,
  buildBfsSteps,
} from './breadthFirstSearch'
import {
  GRAPH_TRAVERSAL_DEMO,
  parseEdges,
  parseGraphSnapshot,
  parseStringList,
  serializeGraphSnapshot,
} from './traversalShared'

function social(): GraphSnapshot {
  return snapshotFromSeed(GRAPH_SOCIAL_NETWORK)
}

function demo(): GraphSnapshot {
  return snapshotFromSeed(GRAPH_TRAVERSAL_DEMO)
}

describe('breadthFirstSearch', () => {
  it('traverses a connected undirected graph from the start', () => {
    const result = breadthFirstSearch(social(), { start: 'Alice' })
    expect(result.order).toEqual(['Alice', 'Bob', 'Carol', 'Dave', 'Eve'])
    expect(result.visited).toHaveLength(5)
    expect(result.start).toBe('Alice')
  })

  it('changes order when the start vertex changes', () => {
    const fromDave = breadthFirstSearch(social(), { start: 'Dave' })
    expect(fromDave.order[0]).toBe('Dave')
    expect(fromDave.order).toEqual(['Dave', 'Bob', 'Alice', 'Carol', 'Eve'])

    const fromEve = breadthFirstSearch(social(), { start: 'Eve' })
    expect(fromEve.order[0]).toBe('Eve')
    expect(fromEve.order).toContain('Alice')
  })

  it('handles an empty graph', () => {
    const result = breadthFirstSearch(createEmpty(), { start: 'A' })
    expect(result.order).toEqual([])
    expect(result.visited).toEqual([])
    expect(result.start).toBeNull()
  })

  it('handles a single vertex', () => {
    let graph = createEmpty()
    graph = addVertex(graph, 'Solo').snapshot
    const result = breadthFirstSearch(graph, { start: 'Solo' })
    expect(result.order).toEqual(['Solo'])
  })

  it('stays in the reachable component by default', () => {
    const result = breadthFirstSearch(demo(), { start: 'A' })
    expect(result.order).toEqual(['A', 'B', 'C', 'D', 'E'])
    expect(result.order).not.toContain('F')
  })

  it('covers disconnected graphs in all-components mode', () => {
    const result = breadthFirstSearch(demo(), {
      start: 'A',
      mode: 'all-components',
    })
    expect(result.order).toEqual(['A', 'B', 'C', 'D', 'E', 'F'])
  })

  it('handles cyclic graphs without infinite loops', () => {
    const result = breadthFirstSearch(demo(), { start: 'A' })
    expect(new Set(result.order).size).toBe(result.order.length)
    expect(result.order).toHaveLength(5)
  })

  it('tolerates self-loops without revisiting', () => {
    let graph = createEmpty()
    graph = addVertex(graph, 'A').snapshot
    graph = addVertex(graph, 'B').snapshot
    graph = addEdge(graph, 'A', 'A').snapshot
    graph = addEdge(graph, 'A', 'B').snapshot
    const result = breadthFirstSearch(graph, { start: 'A' })
    expect(result.order).toEqual(['A', 'B'])
  })

  it('ignores duplicate edge re-adds (deterministic neighbors)', () => {
    let graph = createEmpty()
    graph = addVertex(graph, 'A').snapshot
    graph = addVertex(graph, 'B').snapshot
    graph = addVertex(graph, 'C').snapshot
    graph = addEdge(graph, 'A', 'C').snapshot
    graph = addEdge(graph, 'A', 'B').snapshot
    graph = addEdge(graph, 'A', 'C').snapshot
    expect(getNeighbors(graph, 'A').map((n) => n.to)).toEqual(['B', 'C'])
    const result = breadthFirstSearch(graph, { start: 'A' })
    expect(result.order).toEqual(['A', 'B', 'C'])
  })

  it('uses deterministic neighbor ordering', () => {
    let graph = createEmpty()
    for (const v of ['S', 'Z', 'M', 'A']) {
      graph = addVertex(graph, v).snapshot
    }
    graph = addEdge(graph, 'S', 'Z').snapshot
    graph = addEdge(graph, 'S', 'M').snapshot
    graph = addEdge(graph, 'S', 'A').snapshot
    expect(getNeighbors(graph, 'S').map((n) => n.to)).toEqual(['A', 'M', 'Z'])
    expect(breadthFirstSearch(graph, { start: 'S' }).order).toEqual([
      'S',
      'A',
      'M',
      'Z',
    ])
  })

  it('invokes visit callbacks in traversal order', () => {
    const visits: string[] = []
    breadthFirstSearch(demo(), {
      start: 'A',
      onVisit: (vertex) => visits.push(vertex),
    })
    expect(visits).toEqual(['A', 'B', 'C', 'D', 'E'])
  })

  it('respects directed edges', () => {
    let graph = createEmpty({ directed: true })
    for (const v of ['A', 'B', 'C']) {
      graph = addVertex(graph, v).snapshot
    }
    graph = addEdge(graph, 'A', 'B').snapshot
    graph = addEdge(graph, 'C', 'A').snapshot
    expect(breadthFirstSearch(graph, { start: 'A' }).order).toEqual(['A', 'B'])
    expect(breadthFirstSearch(graph, { start: 'C' }).order).toEqual([
      'C',
      'A',
      'B',
    ])
  })
})

describe('buildBfsSteps', () => {
  it('generates immutable snapshots and a complete trail', () => {
    const graph = demo()
    const steps = buildBfsSteps(graph, 'A', 'reachable')
    expect(steps.length).toBeGreaterThan(3)
    expect(steps[0]?.meta?.phase).toBe('initialize')
    expect(steps[steps.length - 1]?.meta?.phase).toBe('complete')
    expect(steps[steps.length - 1]?.meta?.complete).toBe(true)

    const firstSnap = String(steps[0]?.meta?.graphSnapshot ?? '')
    const lastSnap = String(steps[steps.length - 1]?.meta?.graphSnapshot ?? '')
    expect(parseGraphSnapshot(firstSnap).vertices).toEqual(graph.vertices)
    expect(lastSnap).toBe(firstSnap)
    expect(serializeGraphSnapshot(graph)).toBe(firstSnap)

    const order = parseStringList(
      String(steps[steps.length - 1]?.meta?.traversalOrder ?? '[]'),
    )
    expect(order).toEqual(['A', 'B', 'C', 'D', 'E'])
  })

  it('shows FIFO queue contents while exploring', () => {
    const steps = buildBfsSteps(demo(), 'A')
    const enqueue = steps.find((step) => step.meta?.phase === 'enqueue')
    expect(enqueue).toBeDefined()
    const frontier = parseStringList(String(enqueue?.meta?.frontier ?? '[]'))
    expect(frontier.length).toBeGreaterThan(0)
  })

  it('covers empty, invalid start, and all-components modes', () => {
    expect(buildBfsSteps(createEmpty(), 'A').at(-1)?.meta?.phase).toBe(
      'complete',
    )
    expect(buildBfsSteps(demo(), 'Missing').at(-1)?.meta?.phase).toBe(
      'invalid',
    )
    const all = buildBfsSteps(demo(), 'A', 'all-components')
    const order = parseStringList(
      String(all.at(-1)?.meta?.traversalOrder ?? '[]'),
    )
    expect(order).toEqual(['A', 'B', 'C', 'D', 'E', 'F'])
    expect(all.some((step) => step.meta?.phase === 'next-component')).toBe(
      true,
    )
  })

  it('records traversed edges without mutating historical frames', () => {
    const steps = buildBfsSteps(demo(), 'A')
    const mid = Math.floor(steps.length / 2)
    const midEdges = parseEdges(String(steps[mid]?.meta?.traversedEdges ?? '[]'))
    const midVisited = parseStringList(String(steps[mid]?.meta?.visited ?? '[]'))
    const later = steps[steps.length - 1]!
    const laterEdges = parseEdges(String(later.meta?.traversedEdges ?? '[]'))
    expect(laterEdges.length).toBeGreaterThanOrEqual(midEdges.length)
    expect(midVisited).toEqual(
      parseStringList(String(steps[mid]?.meta?.visited ?? '[]')),
    )
  })
})
