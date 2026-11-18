import { useId, type ReactNode } from 'react'
import {
  getEdges,
  getVertices,
  isEmpty,
  type GraphSnapshot,
  type VertexId,
} from '../../algorithms/data-structures/graph'
import {
  parseActiveEdge,
  parseIndegrees,
  type TopologicalSortAlgorithm,
  type TopologicalSortStatus,
} from '../../algorithms/graphs/topologicalSortShared'
import {
  parseEdges,
  parseGraphSnapshot,
  parseStringList,
  type TraversalEdge,
} from '../../algorithms/graphs/traversalShared'
import { cn } from '../../lib/cn'
import type { GraphPosition, GraphPositions } from './graphLayout'
import type { VisualizationStep } from './types'

type TopologicalSortPanelsProps = {
  step: VisualizationStep | undefined
  positions: GraphPositions
  compact?: boolean
  className?: string
}

const VIEW_W = 640
const VIEW_H = 360
const NODE_R = 22
const PAD = 40

function readString(
  meta: VisualizationStep['meta'],
  key: string,
): string | null {
  const value = meta?.[key]
  return typeof value === 'string' ? value : null
}

function readBool(meta: VisualizationStep['meta'], key: string): boolean {
  return meta?.[key] === true
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
  const len = 9
  const spread = Math.PI / 7
  const ax = x2 - len * Math.cos(angle - spread)
  const ay = y2 - len * Math.sin(angle - spread)
  const bx = x2 - len * Math.cos(angle + spread)
  const by = y2 - len * Math.sin(angle + spread)
  return `${x2},${y2} ${ax},${ay} ${bx},${by}`
}

function shorten(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  startGap: number,
  endGap: number,
) {
  const dx = x2 - x1
  const dy = y2 - y1
  const dist = Math.hypot(dx, dy) || 1
  return {
    x1: x1 + (dx / dist) * startGap,
    y1: y1 + (dy / dist) * startGap,
    x2: x2 - (dx / dist) * endGap,
    y2: y2 - (dy / dist) * endGap,
  }
}

type VertexRole =
  | 'current'
  | 'cycle'
  | 'path'
  | 'queue'
  | 'done'
  | 'default'

function vertexClasses(role: VertexRole): string {
  switch (role) {
    case 'current':
      return 'fill-amber-500/25 stroke-amber-600 dark:stroke-amber-400'
    case 'cycle':
      return 'fill-rose-500/20 stroke-rose-600 dark:stroke-rose-400'
    case 'path':
      return 'fill-violet-500/20 stroke-violet-600 dark:stroke-violet-400'
    case 'queue':
      return 'fill-sky-500/20 stroke-sky-600 dark:stroke-sky-400'
    case 'done':
      return 'fill-emerald-500/20 stroke-emerald-600 dark:stroke-emerald-400'
    default:
      return 'fill-surface stroke-border'
  }
}

function edgePaint(state: 'active' | 'relaxed' | 'cycle' | 'default'): {
  stroke: string
  fill: string
  width: number
} {
  if (state === 'active') {
    return {
      stroke: 'stroke-amber-600 dark:stroke-amber-400',
      fill: 'fill-amber-600 dark:fill-amber-400',
      width: 2.75,
    }
  }
  if (state === 'cycle') {
    return {
      stroke: 'stroke-rose-600 dark:stroke-rose-400',
      fill: 'fill-rose-600 dark:fill-rose-400',
      width: 2.75,
    }
  }
  if (state === 'relaxed') {
    return {
      stroke: 'stroke-emerald-600/80 dark:stroke-emerald-400/80',
      fill: 'fill-emerald-600 dark:fill-emerald-400',
      width: 2.25,
    }
  }
  return {
    stroke: 'stroke-border',
    fill: 'fill-border',
    width: 1.75,
  }
}

function ChipStrip({
  label,
  hint,
  values,
  emptyLabel,
  accent,
  numbered,
}: {
  label: string
  hint: string
  values: readonly string[]
  emptyLabel: string
  accent: 'queue' | 'path' | 'finish' | 'order' | 'blocked'
  numbered?: boolean
}) {
  const accentClass =
    accent === 'queue'
      ? 'border-sky-500/40 bg-sky-500/10'
      : accent === 'path'
        ? 'border-violet-500/40 bg-violet-500/10'
        : accent === 'finish'
          ? 'border-teal-500/40 bg-teal-500/10'
          : accent === 'blocked'
            ? 'border-rose-500/40 bg-rose-500/10'
            : 'border-emerald-500/40 bg-emerald-500/10'

  return (
    <div className={cn('rounded-lg border px-3 py-2 transition-theme', accentClass)}>
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
        <ol className="mt-2 flex flex-wrap gap-1.5" aria-label={label}>
          {values.map((value, index) => (
            <li
              key={`${label}-${index}-${value}`}
              className={cn(
                'rounded-md border border-border bg-surface px-2 py-1',
                'font-mono text-[0.7rem] text-foreground shadow-sm',
                'motion-safe:transition-transform motion-reduce:transition-none',
              )}
            >
              {numbered ? (
                <span className="mr-1 text-[0.6rem] text-muted-foreground">
                  {index + 1}
                </span>
              ) : null}
              {accent === 'queue' && index === 0 ? (
                <span className="mr-1 text-[0.6rem] text-sky-700 dark:text-sky-300">
                  FRONT
                </span>
              ) : null}
              {accent === 'path' && index === values.length - 1 ? (
                <span className="mr-1 text-[0.6rem] text-violet-700 dark:text-violet-300">
                  TOP
                </span>
              ) : null}
              {value}
              {accent === 'queue' &&
              index === values.length - 1 &&
              values.length > 1 ? (
                <span className="ml-1 text-[0.6rem] text-sky-700 dark:text-sky-300">
                  REAR
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

function GraphCanvas({
  snapshot,
  positions,
  algorithm,
  current,
  queue,
  path,
  done,
  cycleVertices,
  activeEdge,
  relaxed,
  indegrees,
  hotVertex,
}: {
  snapshot: GraphSnapshot
  positions: GraphPositions
  algorithm: TopologicalSortAlgorithm
  current: string | null
  queue: ReadonlySet<string>
  path: ReadonlySet<string>
  done: ReadonlySet<string>
  cycleVertices: ReadonlySet<string>
  activeEdge: TraversalEdge | null
  relaxed: readonly TraversalEdge[]
  indegrees: Readonly<Record<string, number>>
  hotVertex: string | null
}) {
  const patternId = `topo-grid-${useId().replace(/:/g, '')}`
  const vertices = getVertices(snapshot)
  const edges = getEdges(snapshot)

  if (isEmpty(snapshot)) {
    return (
      <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 px-4 py-8 text-center">
        <p className="text-sm font-medium text-foreground">Empty directed graph</p>
        <p className="max-w-sm text-body-sm text-muted-foreground">
          The topological order is empty. Add vertices and directed edges, or
          load a sample DAG.
        </p>
      </div>
    )
  }

  const roleOf = (vertex: VertexId): VertexRole => {
    if (current === vertex) return 'current'
    if (cycleVertices.has(vertex)) return 'cycle'
    if (algorithm === 'dfs' && path.has(vertex)) return 'path'
    if (algorithm === 'kahn' && queue.has(vertex)) return 'queue'
    if (done.has(vertex)) return 'done'
    return 'default'
  }

  const edgeState = (from: VertexId, to: VertexId) => {
    if (activeEdge && activeEdge.from === from && activeEdge.to === to) {
      return cycleVertices.has(from) && cycleVertices.has(to)
        ? 'cycle'
        : 'active'
    }
    if (
      relaxed.some((edge) => edge.from === from && edge.to === to)
    ) {
      return 'relaxed'
    }
    return 'default'
  }

  const point = (vertex: VertexId) =>
    toSvg(positions[vertex] ?? { x: 0.5, y: 0.5 })

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`${algorithm === 'kahn' ? "Kahn's algorithm" : 'DFS topological sort'} on a directed graph. An arrow means the source comes first.`}
    >
      <defs>
        <pattern
          id={patternId}
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r="1" className="fill-border/70 dark:fill-border" />
        </pattern>
      </defs>
      <rect width={VIEW_W} height={VIEW_H} fill={`url(#${patternId})`} className="opacity-70" />

      {edges.map((edge) => {
        const state = edgeState(edge.from, edge.to)
        const paint = edgePaint(state)
        const motion = 'motion-safe:transition-colors motion-reduce:transition-none'
        if (edge.from === edge.to) {
          const { cx, cy } = point(edge.from)
          const d = `M ${cx - 8} ${cy - NODE_R + 2} C ${cx - 36} ${cy - NODE_R - 30}, ${cx + 36} ${cy - NODE_R - 30}, ${cx + 8} ${cy - NODE_R + 2}`
          return (
            <g key={`${edge.from}->${edge.to}`}>
              <path
                d={d}
                fill="none"
                className={cn(paint.stroke, motion)}
                strokeWidth={paint.width}
              />
              {snapshot.directed ? (
                <polygon
                  points={arrowPoints(cx + 22, cy - NODE_R - 6, cx + 8, cy - NODE_R + 2)}
                  className={cn(paint.fill, motion)}
                />
              ) : null}
            </g>
          )
        }

        const a = point(edge.from)
        const b = point(edge.to)
        const reverse = edges.some(
          (other) => other.from === edge.to && other.to === edge.from,
        )
        if (!reverse) {
          const seg = shorten(a.cx, a.cy, b.cx, b.cy, NODE_R, NODE_R + 2)
          return (
            <g key={`${edge.from}->${edge.to}`}>
              <line
                x1={seg.x1}
                y1={seg.y1}
                x2={seg.x2}
                y2={seg.y2}
                className={cn(paint.stroke, motion)}
                strokeWidth={paint.width}
              />
              {snapshot.directed ? (
                <polygon
                  points={arrowPoints(seg.x1, seg.y1, seg.x2, seg.y2)}
                  className={cn(paint.fill, motion)}
                />
              ) : null}
            </g>
          )
        }

        const dx = b.cx - a.cx
        const dy = b.cy - a.cy
        const len = Math.hypot(dx, dy) || 1
        const control = {
          x: (a.cx + b.cx) / 2 + (-dy / len) * 36,
          y: (a.cy + b.cy) / 2 + (dx / len) * 36,
        }
        const start = shorten(a.cx, a.cy, control.x, control.y, NODE_R, 0)
        const end = shorten(control.x, control.y, b.cx, b.cy, 0, NODE_R + 2)
        const d = `M ${start.x1} ${start.y1} Q ${control.x} ${control.y} ${end.x2} ${end.y2}`
        return (
          <g key={`${edge.from}->${edge.to}`}>
            <path
              d={d}
              fill="none"
              className={cn(paint.stroke, motion)}
              strokeWidth={paint.width}
            />
            {snapshot.directed ? (
              <polygon
                points={arrowPoints(end.x1, end.y1, end.x2, end.y2)}
                className={cn(paint.fill, motion)}
              />
            ) : null}
          </g>
        )
      })}

      {vertices.map((vertex) => {
        const { cx, cy } = point(vertex)
        const role = roleOf(vertex)
        const degree = indegrees[vertex]
        const label = vertex.length > 6 ? `${vertex.slice(0, 5)}…` : vertex
        return (
          <g key={vertex} className="motion-safe:transition-transform motion-reduce:transition-none">
            <title>
              {vertex}
              {degree === undefined ? '' : `, indegree ${degree}`}
            </title>
            <circle
              cx={cx}
              cy={cy}
              r={NODE_R}
              className={cn(
                'stroke-2 motion-safe:transition-colors motion-reduce:transition-none',
                vertexClasses(role),
              )}
            />
            <text
              x={cx}
              y={cy + 4}
              textAnchor="middle"
              className={cn(
                'pointer-events-none font-mono font-medium',
                vertex.length > 5 ? 'text-[9px]' : 'text-[11px]',
                role === 'current'
                  ? 'fill-amber-800 dark:fill-amber-200'
                  : 'fill-foreground',
              )}
            >
              {label}
            </text>
            {degree !== undefined ? (
              <g>
                <circle
                  cx={cx + 16}
                  cy={cy - 16}
                  r={9}
                  className={cn(
                    'stroke',
                    hotVertex === vertex
                      ? 'fill-amber-500/30 stroke-amber-600 dark:stroke-amber-400'
                      : 'fill-surface stroke-border',
                  )}
                />
                <text
                  x={cx + 16}
                  y={cy - 13}
                  textAnchor="middle"
                  className="pointer-events-none fill-foreground font-mono text-[9px]"
                >
                  {degree}
                </text>
              </g>
            ) : null}
          </g>
        )
      })}
    </svg>
  )
}

function Legend({
  algorithm,
}: {
  algorithm: TopologicalSortAlgorithm
}) {
  const items =
    algorithm === 'kahn'
      ? [
          ['bg-amber-500/40', 'Current'],
          ['bg-sky-500/40', 'In queue'],
          ['bg-emerald-500/40', 'In the order'],
          ['bg-rose-500/40', 'Blocked by a cycle'],
        ]
      : [
          ['bg-amber-500/40', 'Current'],
          ['bg-violet-500/40', 'Active path'],
          ['bg-emerald-500/40', 'Finished'],
          ['bg-rose-500/40', 'On the cycle'],
        ]

  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1">
      {items.map(([swatch, label]) => (
        <li
          key={label}
          className="flex items-center gap-1.5 text-[0.7rem] text-muted-foreground"
        >
          <span aria-hidden="true" className={cn('size-2.5 rounded-full', swatch)} />
          {label}
        </li>
      ))}
      <li className="text-[0.7rem] text-muted-foreground">
        Badge = indegree. Arrow means “comes before”.
      </li>
    </ul>
  )
}

/**
 * Directed graph, indegrees, Kahn queue or DFS path, and the order strip.
 */
export function TopologicalSortPanels({
  step,
  positions,
  compact = false,
  className,
}: TopologicalSortPanelsProps) {
  const meta = step?.meta
  const algorithm = (
    readString(meta, 'algorithm') === 'dfs' ? 'dfs' : 'kahn'
  ) as TopologicalSortAlgorithm
  const status = (readString(meta, 'status') ?? 'running') as
    | 'running'
    | TopologicalSortStatus
  const snapshot = parseGraphSnapshot(readString(meta, 'graphSnapshot') ?? '')
  const current = readString(meta, 'currentVertex')
  const queue = parseStringList(readString(meta, 'queue'))
  const path = parseStringList(readString(meta, 'path'))
  const placement = parseStringList(readString(meta, 'placement'))
  const finishing = parseStringList(readString(meta, 'finishing'))
  const resultOrder = parseStringList(readString(meta, 'resultOrder'))
  const indegrees = parseIndegrees(readString(meta, 'indegrees'))
  const indegreeLive = readBool(meta, 'indegreeLive')
  const activeEdge = parseActiveEdge(readString(meta, 'activeEdge'))
  const relaxed = parseEdges(readString(meta, 'relaxedEdges'))
  const cycleList = parseStringList(readString(meta, 'cycleVertices'))
  const message = readString(meta, 'message')

  const done =
    algorithm === 'kahn' ? placement : finishing
  const orderValues =
    status === 'sorted'
      ? resultOrder
      : algorithm === 'kahn' && status !== 'undirected'
        ? placement
        : resultOrder
  const orderLabel =
    status === 'cycle' && algorithm === 'kahn'
      ? 'Processed before the cycle'
      : status === 'sorted'
        ? 'Topological order'
        : status === 'undirected'
          ? 'Topological order'
          : algorithm === 'kahn'
            ? 'Order so far'
            : 'Topological order'
  const orderHint =
    status === 'cycle'
      ? 'Not a valid order.'
      : status === 'sorted'
        ? algorithm === 'dfs'
          ? 'Finishing list, reversed.'
          : 'Every edge points forward.'
        : status === 'undirected'
          ? 'Rejected.'
          : algorithm === 'dfs'
            ? 'Appears when the finishing list is reversed.'
            : 'Grows when a vertex is appended.'
  const orderAccent = status === 'cycle' || status === 'undirected' ? 'blocked' : 'order'

  const bannerClass =
    status === 'sorted'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100'
      : status === 'cycle'
        ? 'border-rose-500/30 bg-rose-500/10 text-rose-950 dark:text-rose-100'
        : status === 'undirected'
          ? 'border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100'
          : 'border-sky-500/30 bg-sky-500/10 text-sky-950 dark:text-sky-100'

  let structures: ReactNode = null
  if (algorithm === 'kahn') {
    structures = (
      <ChipStrip
        label="Queue"
        hint="FIFO · zero indegree"
        values={queue}
        emptyLabel="[]"
        accent="queue"
      />
    )
  } else {
    structures = (
      <div className="grid gap-2">
        <ChipStrip
          label="Active path"
          hint="Recursion stack"
          values={path}
          emptyLabel="[]"
          accent="path"
        />
        <ChipStrip
          label="Finishing list"
          hint="Recorded on the way back"
          values={finishing}
          emptyLabel="[]"
          accent="finish"
          numbered
        />
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {message ? (
        <p
          className={cn('rounded-lg border px-3 py-2 text-body-sm', bannerClass)}
          role="status"
        >
          {message}
        </p>
      ) : null}

      <GraphCanvas
        snapshot={snapshot}
        positions={positions}
        algorithm={algorithm}
        current={current}
        queue={new Set(queue)}
        path={new Set(path)}
        done={new Set(done)}
        cycleVertices={new Set(status === 'cycle' ? cycleList : [])}
        activeEdge={activeEdge}
        relaxed={relaxed}
        indegrees={indegrees}
        hotVertex={activeEdge?.to ?? null}
      />

      {compact ? null : <Legend algorithm={algorithm} />}

      <div>
        <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-label text-[0.65rem] tracking-[0.08em] text-foreground">
            Indegree
          </p>
          <p className="text-[0.65rem] text-muted-foreground">
            {indegreeLive
              ? 'Falls when an incoming edge is processed.'
              : 'Reference only. DFS does not update indegree.'}
          </p>
        </div>
        {Object.keys(indegrees).length === 0 ? (
          <p className="font-mono text-body-sm text-muted-foreground">[]</p>
        ) : (
          <ul className="flex flex-wrap gap-1.5" aria-label="Indegree of each vertex">
            {Object.entries(indegrees).map(([vertex, degree]) => (
              <li
                key={vertex}
                className={cn(
                  'rounded-md border px-2 py-1 font-mono text-[0.7rem]',
                  'motion-safe:transition-colors motion-reduce:transition-none',
                  activeEdge?.to === vertex
                    ? 'border-amber-500/50 bg-amber-500/15 text-foreground'
                    : degree === 0
                      ? 'border-sky-500/40 bg-sky-500/10 text-foreground'
                      : 'border-border bg-surface text-foreground',
                )}
              >
                {vertex}{' '}
                <span className="text-muted-foreground">{degree}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {structures}

      <ChipStrip
        label={orderLabel}
        hint={orderHint}
        values={orderValues}
        emptyLabel={status === 'cycle' ? 'No valid order' : '[]'}
        accent={orderAccent}
        numbered={status !== 'undirected'}
      />
    </div>
  )
}
