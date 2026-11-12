import type { ReactNode } from 'react'
import {
  getEdges,
  getVertices,
  isEmpty,
  type GraphSnapshot,
  type VertexId,
} from '../../algorithms/data-structures/graph'
import {
  edgeKey,
  parseEdges,
  parseGraphSnapshot,
  parseStringList,
  type GraphTraversalPhase,
  type TraversalAlgorithm,
  type TraversalEdge,
} from '../../algorithms/graphs/traversalShared'
import { cn } from '../../lib/cn'
import type { GraphPosition, GraphPositions } from './graphLayout'
import type { VisualizationStep } from './types'
import { VisualizationCanvas } from './VisualizationCanvas'

type GraphTraversalPanelsProps = {
  step: VisualizationStep | undefined
  positions: GraphPositions
  /** Compact mode for side-by-side comparison. */
  compact?: boolean
  className?: string
}

const VIEW_W = 640
const VIEW_H = 360
const NODE_R = 22
const PAD = 36

function readString(
  meta: VisualizationStep['meta'],
  key: string,
): string | null {
  const value = meta?.[key]
  return typeof value === 'string' ? value : null
}

function toSvg(position: GraphPosition): { cx: number; cy: number } {
  return {
    cx: PAD + position.x * (VIEW_W - PAD * 2),
    cy: PAD + position.y * (VIEW_H - PAD * 2),
  }
}

function arrowPoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const len = 10
  const spread = Math.PI / 7
  const ax = x2 - len * Math.cos(angle - spread)
  const ay = y2 - len * Math.sin(angle - spread)
  const bx = x2 - len * Math.cos(angle + spread)
  const by = y2 - len * Math.sin(angle + spread)
  return `${x2},${y2} ${ax},${ay} ${bx},${by}`
}

function shortenSegment(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  startOffset: number,
  endOffset: number,
): { x1: number; y1: number; x2: number; y2: number } {
  const dx = x2 - x1
  const dy = y2 - y1
  const dist = Math.hypot(dx, dy) || 1
  const ux = dx / dist
  const uy = dy / dist
  return {
    x1: x1 + ux * startOffset,
    y1: y1 + uy * startOffset,
    x2: x2 - ux * endOffset,
    y2: y2 - uy * endOffset,
  }
}

function parseActiveEdge(
  raw: string | null,
): { from: VertexId; to: VertexId } | null {
  if (!raw) return null
  const parts = raw.split('→')
  if (parts.length !== 2) return null
  const from = parts[0]
  const to = parts[1]
  if (!from || !to) return null
  return { from, to }
}

function isEdgeActive(
  from: VertexId,
  to: VertexId,
  directed: boolean,
  active: { from: VertexId; to: VertexId } | null,
  traversed: readonly TraversalEdge[],
): 'active' | 'traversed' | 'default' {
  if (active) {
    if (directed) {
      if (active.from === from && active.to === to) return 'active'
    } else if (
      (active.from === from && active.to === to) ||
      (active.from === to && active.to === from)
    ) {
      return 'active'
    }
  }
  for (const edge of traversed) {
    if (directed) {
      if (edge.from === from && edge.to === to) return 'traversed'
    } else if (
      (edge.from === from && edge.to === to) ||
      (edge.from === to && edge.to === from)
    ) {
      return 'traversed'
    }
  }
  return 'default'
}

type VertexRole =
  | 'current'
  | 'start'
  | 'frontier'
  | 'path'
  | 'visited'
  | 'discovered'
  | 'default'

function resolveVertexRole(
  vertex: VertexId,
  current: string | null,
  start: string | null,
  visited: ReadonlySet<string>,
  discovered: ReadonlySet<string>,
  frontier: ReadonlySet<string>,
  path: ReadonlySet<string>,
  algorithm: TraversalAlgorithm,
): VertexRole {
  if (current === vertex) return 'current'
  if (algorithm === 'dfs' && path.has(vertex)) return 'path'
  if (frontier.has(vertex)) return 'frontier'
  if (visited.has(vertex)) return 'visited'
  if (discovered.has(vertex)) return 'discovered'
  if (start === vertex) return 'start'
  return 'default'
}

function vertexClasses(role: VertexRole): string {
  switch (role) {
    case 'current':
      return 'fill-amber-500/25 stroke-amber-600 dark:stroke-amber-400'
    case 'path':
      return 'fill-violet-500/20 stroke-violet-600 dark:stroke-violet-400'
    case 'frontier':
      return 'fill-sky-500/20 stroke-sky-600 dark:stroke-sky-400'
    case 'visited':
      return 'fill-emerald-500/20 stroke-emerald-600 dark:stroke-emerald-400'
    case 'discovered':
      return 'fill-teal-500/15 stroke-teal-600 dark:stroke-teal-400'
    case 'start':
      return 'fill-primary/20 stroke-primary'
    default:
      return 'fill-surface stroke-border'
  }
}

function StructureStrip({
  label,
  hint,
  values,
  emptyLabel,
  accent,
}: {
  label: string
  hint: string
  values: readonly string[]
  emptyLabel: string
  accent: 'queue' | 'stack' | 'order' | 'path'
}) {
  const accentClass =
    accent === 'queue'
      ? 'border-sky-500/40 bg-sky-500/10'
      : accent === 'stack'
        ? 'border-violet-500/40 bg-violet-500/10'
        : accent === 'path'
          ? 'border-violet-500/30 bg-violet-500/5'
          : 'border-emerald-500/40 bg-emerald-500/10'

  return (
    <div
      className={cn(
        'rounded-lg border px-3 py-2 transition-theme',
        accentClass,
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-label text-[0.65rem] tracking-[0.08em] text-foreground">
          {label}
        </p>
        <p className="text-[0.65rem] text-muted-foreground">{hint}</p>
      </div>
      {values.length === 0 ? (
        <p className="mt-2 font-mono text-body-sm text-muted-foreground">
          {emptyLabel}
        </p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={label}>
          {values.map((value, index) => (
            <li
              key={`${label}-${value}-${index}`}
              className={cn(
                'rounded-md border border-border bg-surface px-2 py-1',
                'font-mono text-[0.7rem] text-foreground shadow-sm',
                'motion-safe:transition-transform',
              )}
            >
              {accent === 'queue' && index === 0 ? (
                <span className="mr-1 text-[0.6rem] text-sky-700 dark:text-sky-300">
                  FRONT
                </span>
              ) : null}
              {accent === 'stack' && index === values.length - 1 ? (
                <span className="mr-1 text-[0.6rem] text-violet-700 dark:text-violet-300">
                  TOP
                </span>
              ) : null}
              {value}
              {accent === 'queue' && index === values.length - 1 && values.length > 1 ? (
                <span className="ml-1 text-[0.6rem] text-sky-700 dark:text-sky-300">
                  REAR
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function LegendSwatch({
  className,
  label,
}: {
  className: string
  label: string
}) {
  return (
    <li className="flex items-center gap-1.5 text-[0.7rem] text-muted-foreground">
      <span
        aria-hidden="true"
        className={cn('size-3 rounded-full border-2', className)}
      />
      {label}
    </li>
  )
}

function GraphCanvas({
  snapshot,
  positions,
  current,
  start,
  visited,
  discovered,
  frontier,
  path,
  activeEdge,
  traversed,
  algorithm,
}: {
  snapshot: GraphSnapshot
  positions: GraphPositions
  current: string | null
  start: string | null
  visited: ReadonlySet<string>
  discovered: ReadonlySet<string>
  frontier: ReadonlySet<string>
  path: ReadonlySet<string>
  activeEdge: { from: VertexId; to: VertexId } | null
  traversed: readonly TraversalEdge[]
  algorithm: TraversalAlgorithm
}) {
  const vertices = getVertices(snapshot)
  const edges = getEdges(snapshot)

  if (isEmpty(snapshot)) {
    return (
      <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 px-4 py-8 text-center">
        <p className="text-sm font-medium text-foreground">Empty graph</p>
        <p className="max-w-sm text-body-sm text-muted-foreground">
          Load a sample graph to begin traversal.
        </p>
      </div>
    )
  }

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`${algorithm.toUpperCase()} graph traversal`}
    >
      <defs>
        <pattern
          id={`traversal-grid-${algorithm}`}
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx="1"
            cy="1"
            r="1"
            className="fill-border/70 dark:fill-border"
          />
        </pattern>
      </defs>
      <rect
        width={VIEW_W}
        height={VIEW_H}
        fill={`url(#traversal-grid-${algorithm})`}
        className="opacity-70"
      />

      {edges.map((edge) => {
        const fromPos = positions[edge.from]
        const toPos = positions[edge.to]
        if (!fromPos || !toPos) return null
        const state = isEdgeActive(
          edge.from,
          edge.to,
          snapshot.directed,
          activeEdge,
          traversed,
        )
        if (edge.from === edge.to) {
          const { cx, cy } = toSvg(fromPos)
          const pathD = `M ${cx - 10} ${cy - NODE_R + 2}
            C ${cx - 34} ${cy - NODE_R - 28}, ${cx + 34} ${cy - NODE_R - 28}, ${cx + 10} ${cy - NODE_R + 2}`
          return (
            <path
              key={edgeKey(edge.from, edge.to, snapshot.directed)}
              d={pathD}
              fill="none"
              className={cn(
                state === 'active'
                  ? 'stroke-amber-600 dark:stroke-amber-400'
                  : state === 'traversed'
                    ? 'stroke-primary'
                    : 'stroke-border',
                'transition-theme',
              )}
              strokeWidth={state === 'default' ? 1.75 : 2.75}
            />
          )
        }

        const a = toSvg(fromPos)
        const b = toSvg(toPos)
        const seg = shortenSegment(
          a.cx,
          a.cy,
          b.cx,
          b.cy,
          NODE_R,
          NODE_R + (snapshot.directed ? 2 : 0),
        )

        return (
          <g key={edgeKey(edge.from, edge.to, snapshot.directed)}>
            <line
              x1={seg.x1}
              y1={seg.y1}
              x2={seg.x2}
              y2={seg.y2}
              className={cn(
                state === 'active'
                  ? 'stroke-amber-600 dark:stroke-amber-400'
                  : state === 'traversed'
                    ? 'stroke-primary'
                    : 'stroke-border',
                'transition-theme',
              )}
              strokeWidth={state === 'default' ? 1.75 : 2.75}
            />
            {snapshot.directed ? (
              <polygon
                points={arrowPoints(seg.x1, seg.y1, seg.x2, seg.y2)}
                className={cn(
                  state === 'active'
                    ? 'fill-amber-600 dark:fill-amber-400'
                    : state === 'traversed'
                      ? 'fill-primary'
                      : 'fill-border',
                )}
              />
            ) : null}
          </g>
        )
      })}

      {vertices.map((vertex) => {
        const pos = positions[vertex]
        if (!pos) return null
        const { cx, cy } = toSvg(pos)
        const role = resolveVertexRole(
          vertex,
          current,
          start,
          visited,
          discovered,
          frontier,
          path,
          algorithm,
        )
        return (
          <g key={vertex} className="motion-safe:transition-transform">
            <circle
              cx={cx}
              cy={cy}
              r={NODE_R}
              className={cn('stroke-2 transition-theme', vertexClasses(role))}
            />
            <text
              x={cx}
              y={cy + 4}
              textAnchor="middle"
              className={cn(
                'pointer-events-none font-mono text-[11px] font-medium',
                role === 'current'
                  ? 'fill-amber-800 dark:fill-amber-200'
                  : 'fill-foreground',
              )}
            >
              {vertex.length > 8 ? `${vertex.slice(0, 7)}…` : vertex}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/**
 * Graph canvas + queue/stack/order panels driven by traversal step meta.
 */
export function GraphTraversalPanels({
  step,
  positions,
  compact = false,
  className,
}: GraphTraversalPanelsProps) {
  const meta = step?.meta
  const algorithm = (readString(meta, 'algorithm') ?? 'bfs') as TraversalAlgorithm
  const phase = (readString(meta, 'phase') ?? 'initialize') as GraphTraversalPhase
  const snapshot = parseGraphSnapshot(
    readString(meta, 'graphSnapshot') ?? '',
  )
  const current = readString(meta, 'currentVertex')
  const start = readString(meta, 'startVertex')
  const visitedList = parseStringList(readString(meta, 'visited'))
  const discoveredList = parseStringList(readString(meta, 'discovered'))
  const frontierList = parseStringList(readString(meta, 'frontier'))
  const stackList = parseStringList(readString(meta, 'stack'))
  const pathList = parseStringList(readString(meta, 'path'))
  const orderList = parseStringList(readString(meta, 'traversalOrder'))
  const traversed = parseEdges(readString(meta, 'traversedEdges'))
  const activeEdge = parseActiveEdge(readString(meta, 'activeEdge'))
  const message = readString(meta, 'message')

  const visited = new Set(visitedList)
  const discovered = new Set(discoveredList)
  const frontier = new Set(frontierList)
  const path = new Set(pathList)

  let structure: ReactNode = null
  if (algorithm === 'bfs') {
    structure = (
      <StructureStrip
        label="Queue (FIFO)"
        hint="Front left · rear right"
        values={frontierList}
        emptyLabel="(empty queue)"
        accent="queue"
      />
    )
  } else {
    structure = (
      <div className="grid gap-2 sm:grid-cols-2">
        <StructureStrip
          label="Stack (LIFO)"
          hint="Top is the rightmost cell"
          values={stackList}
          emptyLabel="(empty stack)"
          accent="stack"
        />
        <StructureStrip
          label="Active path"
          hint="Deepest route before backtrack"
          values={pathList}
          emptyLabel="(no path)"
          accent="path"
        />
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <VisualizationCanvas
        label={`${algorithm.toUpperCase()} traversal canvas`}
        className="overflow-hidden p-2 sm:p-3"
      >
        <GraphCanvas
          snapshot={snapshot}
          positions={positions}
          current={current}
          start={start}
          visited={visited}
          discovered={discovered}
          frontier={frontier}
          path={path}
          activeEdge={activeEdge}
          traversed={traversed}
          algorithm={algorithm}
        />
      </VisualizationCanvas>

      {!compact ? (
        <ul
          className="flex flex-wrap items-center gap-x-3 gap-y-2"
          aria-label="Traversal legend"
        >
          <LegendSwatch
            className="border-amber-600 bg-amber-500/25 dark:border-amber-400"
            label="Current"
          />
          {algorithm === 'bfs' ? (
            <LegendSwatch
              className="border-sky-600 bg-sky-500/20 dark:border-sky-400"
              label="Queue frontier"
            />
          ) : (
            <LegendSwatch
              className="border-violet-600 bg-violet-500/20 dark:border-violet-400"
              label="Active path"
            />
          )}
          <LegendSwatch
            className="border-emerald-600 bg-emerald-500/20 dark:border-emerald-400"
            label="Visited"
          />
          <LegendSwatch className="border-primary bg-primary/20" label="Start" />
          <LegendSwatch
            className="border-primary bg-transparent"
            label="Tree / discovery edge"
          />
        </ul>
      ) : null}

      {structure}

      <StructureStrip
        label="Traversal order"
        hint={`Phase: ${phase}${message ? ` · ${message}` : ''}`}
        values={orderList}
        emptyLabel="(none yet)"
        accent="order"
      />
    </div>
  )
}
