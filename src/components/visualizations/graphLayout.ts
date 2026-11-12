import type { VertexId } from '../../algorithms/data-structures/graph'

export type GraphPosition = {
  readonly x: number
  readonly y: number
}

export type GraphPositions = Readonly<Record<string, GraphPosition>>

/**
 * Place vertices on a circle when no saved position exists.
 */
export function autoLayoutPositions(
  vertices: readonly VertexId[],
  existing: GraphPositions = {},
): Record<string, GraphPosition> {
  const next: Record<string, GraphPosition> = { ...existing }
  const missing = vertices.filter((v) => !next[v])
  if (missing.length === 0) {
    for (const key of Object.keys(next)) {
      if (!vertices.includes(key)) {
        delete next[key]
      }
    }
    return next
  }

  const n = Math.max(vertices.length, 1)
  vertices.forEach((vertex, index) => {
    if (next[vertex]) return
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2
    next[vertex] = {
      x: 0.5 + 0.38 * Math.cos(angle),
      y: 0.5 + 0.38 * Math.sin(angle),
    }
  })

  for (const key of Object.keys(next)) {
    if (!vertices.includes(key)) {
      delete next[key]
    }
  }
  return next
}

/** Hand-tuned layouts for sample graphs (normalized 0..1). */
export const SAMPLE_LAYOUTS: Record<string, GraphPositions> = {
  social: {
    Alice: { x: 0.5, y: 0.18 },
    Bob: { x: 0.22, y: 0.42 },
    Carol: { x: 0.78, y: 0.42 },
    Dave: { x: 0.22, y: 0.78 },
    Eve: { x: 0.78, y: 0.78 },
  },
  roads: {
    Center: { x: 0.5, y: 0.48 },
    North: { x: 0.5, y: 0.14 },
    East: { x: 0.82, y: 0.48 },
    South: { x: 0.5, y: 0.84 },
    West: { x: 0.18, y: 0.48 },
    Airport: { x: 0.9, y: 0.2 },
  },
  computers: {
    Router: { x: 0.18, y: 0.5 },
    Switch: { x: 0.42, y: 0.5 },
    'PC-A': { x: 0.68, y: 0.22 },
    'PC-B': { x: 0.68, y: 0.5 },
    Server: { x: 0.68, y: 0.78 },
    Printer: { x: 0.9, y: 0.78 },
  },
  website: {
    Home: { x: 0.5, y: 0.14 },
    About: { x: 0.2, y: 0.45 },
    Blog: { x: 0.5, y: 0.45 },
    Contact: { x: 0.8, y: 0.45 },
    'Post-1': { x: 0.5, y: 0.82 },
  },
  flights: {
    SGN: { x: 0.18, y: 0.72 },
    BKK: { x: 0.42, y: 0.38 },
    SIN: { x: 0.42, y: 0.82 },
    ICN: { x: 0.68, y: 0.22 },
    NRT: { x: 0.88, y: 0.42 },
  },
}
