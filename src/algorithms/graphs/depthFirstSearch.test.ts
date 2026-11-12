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
  buildDfsSteps,
  depthFirstSearch,
  depthFirstSearchIterative,
} from './depthFirstSearch'
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

describe('depthFirstSearch', () => {
  it('traverses deeply before backtracking', () => {
    // A → B → D → C → E (deterministic neighbor order)
    expect(depthFirstSearch(demo(), { start: 'A' }).order).toEqual([
      'A',
      'B',
      'D',
      'C',
      'E',
    ])
  })

  it('matches iterative DFS visit order', () => {
    const recursive = depthFirstSearch(demo(), { start: 'A' })
    const iterative = depthFirstSearchIterative(demo(), { start: 'A' })
    expect(iterative.order).toEqual(recursive.order)
  })

  it('changes order when the start vertex changes', () => {
    expect(depthFirstSearch(social(), { start: 'Alice' }).order[0]).toBe(
      'Alice',
    )
    expect(depthFirstSearch(social(), { start: 'Dave' }).order[0]).toBe('Dave')
    expect(depthFirstSearch(social(), { start: 'Eve' }).order).toEqual([
      'Eve',
      'Carol',
      'Alice',
      'Bob',
      'Dave',
    ])
  })

  it('handles an empty graph', () => {
    const result = depthFirstSearch(createEmpty(), { start: 'A' })
    expect(result.order).toEqual([])
    expect(result.start).toBeNull()
  })

  it('handles a single vertex', () => {
    let graph = createEmpty()
    graph = addVertex(graph, 'Solo').snapshot
    expect(depthFirstSearch(graph, { start: 'Solo' }).order).toEqual(['Solo'])
  })

  it('stays in the reachable component by default', () => {
    const result = depthFirstSearch(demo(), { start: 'A' })
    expect(result.order).not.toContain('F')
    expect(result.order).toHaveLength(5)
  })

  it('covers disconnected graphs in all-components mode', () => {
    expect(
      depthFirstSearch(demo(), { start: 'A', mode: 'all-components' }).order,
    ).toEqual(['A', 'B', 'D', 'C', 'E', 'F'])
    expect(
      depthFirstSearchIterative(demo(), {
        start: 'A',
        mode: 'all-components',
      }).order,
    ).toEqual(['A', 'B', 'D', 'C', 'E', 'F'])
  })

  it('handles cyclic graphs without infinite loops', () => {
    const result = depthFirstSearch(demo(), { start: 'A' })
    expect(new Set(result.order).size).toBe(result.order.length)
  })

  it('tolerates self-loops without revisiting', () => {
    let graph = createEmpty()
    graph = addVertex(graph, 'A').snapshot
    graph = addVertex(graph, 'B').snapshot
    graph = addEdge(graph, 'A', 'A').snapshot
    graph = addEdge(graph, 'A', 'B').snapshot
    expect(depthFirstSearch(graph, { start: 'A' }).order).toEqual(['A', 'B'])
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
    // DFS goes deep into A first (A has no further neighbors).
    expect(depthFirstSearch(graph, { start: 'S' }).order).toEqual([
      'S',
      'A',
      'M',
      'Z',
    ])
  })

  it('invokes visit callbacks in traversal order', () => {
    const visits: string[] = []
    depthFirstSearch(demo(), {
      start: 'A',
      onVisit: (vertex) => visits.push(vertex),
    })
    expect(visits).toEqual(['A', 'B', 'D', 'C', 'E'])
  })

  it('respects directed edges', () => {
    let graph = createEmpty({ directed: true })
    for (const v of ['A', 'B', 'C']) {
      graph = addVertex(graph, v).snapshot
    }
    graph = addEdge(graph, 'A', 'B').snapshot
    graph = addEdge(graph, 'C', 'A').snapshot
    expect(depthFirstSearch(graph, { start: 'A' }).order).toEqual(['A', 'B'])
    expect(depthFirstSearch(graph, { start: 'C' }).order).toEqual([
      'C',
      'A',
      'B',
    ])
  })
})

describe('buildDfsSteps', () => {
  it('generates immutable snapshots, path, and backtracking frames', () => {
    const graph = demo()
    const steps = buildDfsSteps(graph, 'A', 'reachable')
    expect(steps[0]?.meta?.phase).toBe('initialize')
    expect(steps.some((step) => step.meta?.phase === 'backtrack')).toBe(true)
    expect(steps.some((step) => step.meta?.phase === 'push')).toBe(true)
    expect(steps.at(-1)?.meta?.phase).toBe('complete')

    const snap = String(steps[0]?.meta?.graphSnapshot ?? '')
    expect(parseGraphSnapshot(snap).vertices).toEqual(graph.vertices)
    expect(String(steps.at(-1)?.meta?.graphSnapshot)).toBe(snap)
    expect(serializeGraphSnapshot(graph)).toBe(snap)

    const order = parseStringList(
      String(steps.at(-1)?.meta?.traversalOrder ?? '[]'),
    )
    expect(order).toEqual(depthFirstSearch(graph, { start: 'A' }).order)
  })

  it('exposes stack and active path during exploration', () => {
    const steps = buildDfsSteps(demo(), 'A')
    const push = steps.find((step) => step.meta?.phase === 'push')
    expect(push).toBeDefined()
    const stack = parseStringList(String(push?.meta?.stack ?? '[]'))
    const path = parseStringList(String(push?.meta?.path ?? '[]'))
    expect(stack.length).toBeGreaterThan(0)
    expect(path.length).toBeGreaterThan(0)
  })

  it('covers empty, invalid start, and all-components modes', () => {
    expect(buildDfsSteps(createEmpty(), 'A').at(-1)?.meta?.phase).toBe(
      'complete',
    )
    expect(buildDfsSteps(demo(), 'Missing').at(-1)?.meta?.phase).toBe(
      'invalid',
    )
    const all = buildDfsSteps(demo(), 'A', 'all-components')
    expect(parseStringList(String(all.at(-1)?.meta?.traversalOrder ?? '[]'))).toEqual(
      ['A', 'B', 'D', 'C', 'E', 'F'],
    )
    expect(all.some((step) => step.meta?.phase === 'next-component')).toBe(true)
  })

  it('keeps historical traversed-edge snapshots stable', () => {
    const steps = buildDfsSteps(demo(), 'A')
    const mid = Math.floor(steps.length / 2)
    const midEdges = parseEdges(String(steps[mid]?.meta?.traversedEdges ?? '[]'))
    const laterEdges = parseEdges(
      String(steps.at(-1)?.meta?.traversedEdges ?? '[]'),
    )
    expect(laterEdges.length).toBeGreaterThanOrEqual(midEdges.length)
    expect(parseEdges(String(steps[mid]?.meta?.traversedEdges ?? '[]'))).toEqual(
      midEdges,
    )
  })
})
