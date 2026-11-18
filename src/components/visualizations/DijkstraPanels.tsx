import type { PointerEvent as ReactPointerEvent } from 'react'
import {
  getEdges,
  getVertices,
  isEmpty,
  type VertexId,
} from '../../algorithms/data-structures/graph'
import {
  formatDistance,
  parseDistances,
  parsePrevious,
  parseQueue,
  type DijkstraPhase,
  type DijkstraQueueEntry,
} from '../../algorithms/graphs/dijkstra'
import {
  parseEdges,
  parseGraphSnapshot,
  parseStringList,
  type TraversalEdge,
} from '../../algorithms/graphs/traversalShared'
import { cn } from '../../lib/cn'
import type { GraphPosition, GraphPositions } from './graphLayout'
import type { VisualizationStep } from './types'

type DijkstraPanelsProps = {
  step: VisualizationStep | undefined
  positions: GraphPositions
  onSelectVertex?: (vertex: VertexId) => void
  onPositionChange?: (vertex: VertexId, position: GraphPosition) => void
  className?: string
}

const VIEW_W = 680
const VIEW_H = 400
const NODE_R = 22
const PAD = 48

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

function fromSvg(cx: number, cy: number): GraphPosition {
  const spanX = VIEW_W - PAD * 2
  const spanY = VIEW_H - PAD * 2
  return {
    x: Math.min(1, Math.max(0, (cx - PAD) / spanX)),
    y: Math.min(1, Math.max(0, (cy - PAD) / spanY)),
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

function offsetSegment(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  amount: number,
): { x1: number; y1: number; x2: number; y2: number } {
  const dx = x2 - x1
  const dy = y2 - y1
  const dist = Math.hypot(dx, dy) || 1
  const ox = (-dy / dist) * amount
  const oy = (dx / dist) * amount
  return { x1: x1 + ox, y1: y1 + oy, x2: x2 + ox, y2: y2 + oy }
}

function parseActiveEdge(
  raw: string | null,
): { from: VertexId; to: VertexId } | null {
  if (!raw) return null
  const parts = raw.split('→')
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null
  return { from: parts[0], to: parts[1] }
}

function edgesMatch(
  a: { from: VertexId; to: VertexId },
  b: { from: VertexId; to: VertexId },
  directed: boolean,
): boolean {
  if (a.from === b.from && a.to === b.to) return true
  if (directed || a.from === a.to) return false
  return a.from === b.to && a.to === b.from
}

type EdgeVisual = 'active' | 'path' | 'relaxed' | 'negative' | 'default'

function edgeVisual(
  edge: { from: VertexId; to: VertexId },
  directed: boolean,
  phase: DijkstraPhase,
  active: { from: VertexId; to: VertexId } | null,
  pathEdges: readonly TraversalEdge[],
  relaxed: readonly TraversalEdge[],
): EdgeVisual {
  if (phase === 'negative-weight' && active && edgesMatch(edge, active, directed)) {
    return 'negative'
  }
  if (active && edgesMatch(edge, active, directed)) return 'active'
  if (pathEdges.some((item) => edgesMatch(edge, item, directed))) return 'path'
  if (relaxed.some((item) => edgesMatch(edge, item, directed))) return 'relaxed'
  return 'default'
}

function edgeStroke(state: EdgeVisual): string {
  switch (state) {
    case 'active':
      return 'stroke-amber-600 dark:stroke-amber-400'
    case 'path':
      return 'stroke-emerald-600 dark:stroke-emerald-400'
    case 'relaxed':
      return 'stroke-sky-600 dark:stroke-sky-400'
    case 'negative':
      return 'stroke-red-600 dark:stroke-red-400'
    default:
      return 'stroke-border'
  }
}

function edgeFill(state: EdgeVisual): string {
  switch (state) {
    case 'active':
      return 'fill-amber-600 dark:fill-amber-400'
    case 'path':
      return 'fill-emerald-600 dark:fill-emerald-400'
    case 'relaxed':
      return 'fill-sky-600 dark:fill-sky-400'
    case 'negative':
      return 'fill-red-600 dark:fill-red-400'
    default:
      return 'fill-border'
  }
}

type VertexRole = 'current' | 'path' | 'visited' | 'queued' | 'default'

function vertexFill(role: VertexRole): string {
  switch (role) {
    case 'current':
      return 'fill-amber-500/25 stroke-amber-600 dark:stroke-amber-400'
    case 'path':
      return 'fill-emerald-500/20 stroke-emerald-600 dark:stroke-emerald-400'
    case 'visited':
      return 'fill-emerald-500/15 stroke-emerald-600/80 dark:stroke-emerald-400/80'
    case 'queued':
      return 'fill-sky-500/15 stroke-sky-600 dark:stroke-sky-400'
    default:
      return 'fill-surface stroke-border'
  }
}

function pathEdgesFrom(path: readonly string[]): TraversalEdge[] {
  const edges: TraversalEdge[] = []
  for (let index = 0; index < path.length - 1; index += 1) {
    const from = path[index]
    const to = path[index + 1]
    if (from && to) edges.push({ from, to })
  }
  return edges
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

function WeightLabel({
  x,
  y,
  text,
  state,
}: {
  x: number
  y: number
  text: string
  state: EdgeVisual
}) {
  const width = Math.max(26, text.length * 7 + 12)
  return (
    <g className="pointer-events-none">
      <rect
        x={x - width / 2}
        y={y - 9}
        width={width}
        height={16}
        rx={4}
        className="fill-surface stroke-border"
      />
      <text
        x={x}
        y={y + 3}
        textAnchor="middle"
        className={cn(
          'font-mono text-[10px] font-medium',
          state === 'default' ? 'fill-foreground' : edgeFill(state),
        )}
      >
        {text}
      </text>
    </g>
  )
}

/**
 * Weighted graph, distance table, and priority queue for one Dijkstra frame.
 * Positions can be dragged; the frame itself is an immutable snapshot.
 */
export function DijkstraPanels({
  step,
  positions,
  onSelectVertex,
  onPositionChange,
  className,
}: DijkstraPanelsProps) {
  const meta = step?.meta
  const phase = (readString(meta, 'phase') ?? 'initialize') as DijkstraPhase
  const snapshot = parseGraphSnapshot(readString(meta, 'graphSnapshot') ?? '')
  const source = readString(meta, 'source')
  const destination = readString(meta, 'destination')
  const current = readString(meta, 'currentVertex')
  const activeEdge = parseActiveEdge(readString(meta, 'activeEdge'))
  const visited = parseStringList(readString(meta, 'visited'))
  const distances = parseDistances(readString(meta, 'distances'))
  const previous = parsePrevious(readString(meta, 'previous'))
  const queue = parseQueue(readString(meta, 'priorityQueue'))
  const relaxed = parseEdges(readString(meta, 'relaxedEdges'))
  const path = parseStringList(readString(meta, 'path'))
  const pathEdges = pathEdgesFrom(path)
  const visitedSet = new Set(visited)
  const pathSet = new Set(path)
  const queued = new Set(
    queue.filter((entry) => !entry.stale).map((entry) => entry.vertex),
  )

  const vertices = getVertices(snapshot)
  const edges = getEdges(snapshot)
  const reverseKeys = new Set(
    edges.map((edge) => `${edge.from}->${edge.to}`),
  )

  const handlePointerDown = (
    event: ReactPointerEvent<SVGGElement>,
    vertex: VertexId,
  ) => {
    onSelectVertex?.(vertex)
    if (!onPositionChange) return
    event.preventDefault()
    event.stopPropagation()
    const svg = event.currentTarget.ownerSVGElement
    if (!svg) return

    const move = (clientX: number, clientY: number) => {
      const rect = svg.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      const cx = ((clientX - rect.left) / rect.width) * VIEW_W
      const cy = ((clientY - rect.top) / rect.height) * VIEW_H
      onPositionChange(vertex, fromSvg(cx, cy))
    }

    const onPointerMove = (moveEvent: PointerEvent) => {
      move(moveEvent.clientX, moveEvent.clientY)
    }
    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  const pathSummary =
    path.length > 0
      ? path.join(' → ')
      : destination
        ? `no path to ${destination} yet`
        : 'no destination'

  return (
    <div className={cn('space-y-4', className)}>
      {isEmpty(snapshot) ? (
        <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 px-4 py-8 text-center">
          <p className="text-sm font-medium text-foreground">Empty graph</p>
          <p className="max-w-sm text-body-sm text-muted-foreground">
            Add vertices and non-negative weighted edges, or load a sample graph.
          </p>
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-auto w-full touch-none"
          role="img"
          aria-label={`Dijkstra graph. Source ${source ?? 'unset'}, destination ${destination ?? 'unset'}, current ${current ?? 'none'}, path ${pathSummary}.`}
        >
          <defs>
            <pattern
              id="dijkstra-grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="1" className="fill-border/70 dark:fill-border" />
            </pattern>
          </defs>
          <rect width={VIEW_W} height={VIEW_H} fill="url(#dijkstra-grid)" className="opacity-70" />

          {edges.map((edge) => {
            const fromPos = positions[edge.from]
            const toPos = positions[edge.to]
            if (!fromPos || !toPos) return null
            const state = edgeVisual(
              edge,
              snapshot.directed,
              phase,
              activeEdge,
              pathEdges,
              relaxed,
            )
            const weight = formatDistance(edge.weight)
            if (edge.from === edge.to) {
              const { cx, cy } = toSvg(fromPos)
              const pathD = `M ${cx - 10} ${cy - NODE_R + 2}
                C ${cx - 36} ${cy - NODE_R - 30}, ${cx + 36} ${cy - NODE_R - 30}, ${cx + 10} ${cy - NODE_R + 2}`
              return (
                <g key={`${edge.from}->${edge.to}`}>
                  <path
                    d={pathD}
                    fill="none"
                    className={cn(edgeStroke(state), 'motion-safe:transition-colors')}
                    strokeWidth={state === 'default' ? 1.75 : 2.75}
                  />
                  <WeightLabel x={cx} y={cy - NODE_R - 36} text={weight} state={state} />
                </g>
              )
            }

            const a = toSvg(fromPos)
            const b = toSvg(toPos)
            const reversed = reverseKeys.has(`${edge.to}->${edge.from}`)
            const shifted =
              snapshot.directed && reversed && edge.from !== edge.to
                ? offsetSegment(a.cx, a.cy, b.cx, b.cy, 8)
                : { x1: a.cx, y1: a.cy, x2: b.cx, y2: b.cy }
            const seg = shortenSegment(
              shifted.x1,
              shifted.y1,
              shifted.x2,
              shifted.y2,
              NODE_R + 2,
              NODE_R + (snapshot.directed ? 8 : 2),
            )
            const labelX = (seg.x1 + seg.x2) / 2
            const labelY = (seg.y1 + seg.y2) / 2

            return (
              <g key={`${edge.from}->${edge.to}`}>
                <line
                  x1={seg.x1}
                  y1={seg.y1}
                  x2={seg.x2}
                  y2={seg.y2}
                  className={cn(edgeStroke(state), 'motion-safe:transition-colors')}
                  strokeWidth={state === 'default' ? 1.75 : 2.75}
                />
                {snapshot.directed ? (
                  <polygon
                    points={arrowPoints(seg.x1, seg.y1, seg.x2, seg.y2)}
                    className={cn(edgeFill(state), 'motion-safe:transition-colors')}
                  />
                ) : null}
                <WeightLabel x={labelX} y={labelY - 10} text={weight} state={state} />
              </g>
            )
          })}

          {vertices.map((vertex) => {
            const pos = positions[vertex]
            if (!pos) return null
            const { cx, cy } = toSvg(pos)
            const role: VertexRole =
              current === vertex
                ? 'current'
                : pathSet.has(vertex)
                  ? 'path'
                  : visitedSet.has(vertex)
                    ? 'visited'
                    : queued.has(vertex)
                      ? 'queued'
                      : 'default'
            const distance = distances[vertex]
            const distanceLabel =
              distance === undefined ? '∞' : formatDistance(distance)
            const label = vertex.length > 8 ? `${vertex.slice(0, 7)}…` : vertex
            return (
              <g
                key={vertex}
                className="cursor-pointer motion-safe:transition-transform"
                onPointerDown={(event) => handlePointerDown(event, vertex)}
              >
                {source === vertex ? (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={NODE_R + 6}
                    fill="none"
                    className="stroke-primary"
                    strokeWidth={2}
                  />
                ) : null}
                {destination === vertex ? (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={NODE_R + (source === vertex ? 10 : 6)}
                    fill="none"
                    className="stroke-rose-600 dark:stroke-rose-400"
                    strokeDasharray="3 2"
                    strokeWidth={2}
                  />
                ) : null}
                <circle
                  cx={cx}
                  cy={cy}
                  r={NODE_R}
                  className={cn(
                    'stroke-2 motion-safe:transition-colors',
                    vertexFill(role),
                  )}
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
                  {label}
                  <title>{vertex}</title>
                </text>
                <text
                  x={cx}
                  y={cy + NODE_R + 14}
                  textAnchor="middle"
                  className={cn(
                    'pointer-events-none font-mono text-[10px]',
                    distanceLabel === '∞'
                      ? 'fill-muted-foreground'
                      : 'fill-foreground',
                  )}
                >
                  {distanceLabel}
                </text>
              </g>
            )
          })}
        </svg>
      )}

      <ul className="flex flex-wrap gap-x-3 gap-y-2" aria-label="Dijkstra legend">
        <LegendSwatch className="border-primary bg-primary/20" label="Source" />
        <LegendSwatch
          className="border-rose-600 bg-rose-500/15 dark:border-rose-400"
          label="Destination"
        />
        <LegendSwatch
          className="border-amber-600 bg-amber-500/25 dark:border-amber-400"
          label="Current"
        />
        <LegendSwatch
          className="border-emerald-600 bg-emerald-500/20 dark:border-emerald-400"
          label="Visited"
        />
        <LegendSwatch className="border-border bg-surface" label="Unvisited" />
        <LegendSwatch
          className="border-sky-600 bg-sky-500/20 dark:border-sky-400"
          label="In priority queue"
        />
        <LegendSwatch className="border-amber-600 bg-transparent" label="Active edge" />
        <LegendSwatch className="border-sky-600 bg-transparent" label="Relaxed edge" />
        <LegendSwatch
          className="border-emerald-600 bg-transparent"
          label="Shortest path"
        />
      </ul>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="min-w-full text-left text-body-sm">
          <caption className="sr-only">
            Distance table for Dijkstra from {source ?? 'the source'}. Distances,
            previous vertices, and visited status update with the current step.
          </caption>
          <thead className="bg-muted/50 text-label text-[0.65rem] tracking-[0.08em] text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-2 font-medium">
                Vertex
              </th>
              <th scope="col" className="px-3 py-2 text-right font-medium">
                Distance
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Previous Vertex
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {vertices.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-3 text-muted-foreground">
                  No vertices yet.
                </td>
              </tr>
            ) : (
              vertices.map((vertex) => {
                const distance = distances[vertex]
                const prev = previous[vertex]
                const isVisited = visitedSet.has(vertex)
                const isCurrent = current === vertex
                return (
                  <tr
                    key={vertex}
                    className={cn(
                      isCurrent && 'bg-amber-500/10',
                      !isCurrent && vertex === destination && 'bg-rose-500/5',
                      !isCurrent &&
                        vertex === source &&
                        vertex !== destination &&
                        'bg-primary/5',
                    )}
                  >
                    <th
                      scope="row"
                      className="whitespace-nowrap px-3 py-2 font-mono font-medium text-foreground"
                    >
                      {vertex}
                      {vertex === source ? (
                        <span className="ml-2 text-[0.65rem] font-sans font-normal text-primary">
                          Source
                        </span>
                      ) : null}
                      {vertex === destination ? (
                        <span className="ml-2 text-[0.65rem] font-sans font-normal text-rose-700 dark:text-rose-300">
                          Destination
                        </span>
                      ) : null}
                      {isCurrent ? (
                        <span className="ml-2 text-[0.65rem] font-sans font-normal text-amber-800 dark:text-amber-200">
                          Current
                        </span>
                      ) : null}
                    </th>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">
                      {distance === undefined ? '∞' : formatDistance(distance)}
                    </td>
                    <td className="px-3 py-2 font-mono text-foreground">
                      {prev ?? '—'}
                    </td>
                    <td className="px-3 py-2 text-foreground">
                      {isVisited ? 'Visited' : 'Unvisited'}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="text-body-sm text-muted-foreground">
        Shortest path so far:{' '}
        <span className="font-mono text-foreground">
          {path.length > 0 ? path.join(' → ') : '—'}
        </span>
        {destination && distances[destination] !== undefined ? (
          <>
            {' '}
            · distance{' '}
            <span className="font-mono text-foreground">
              {formatDistance(distances[destination]!)}
            </span>
          </>
        ) : null}
      </p>

      <QueueStrip entries={queue} />
    </div>
  )
}

function QueueStrip({ entries }: { entries: readonly DijkstraQueueEntry[] }) {
  return (
    <div className="rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-label text-[0.65rem] tracking-[0.08em] text-foreground">
          Min priority queue
        </p>
        <p className="text-[0.65rem] text-muted-foreground">
          Smallest distance at the root · stale duplicates stay until dequeued
        </p>
      </div>
      {entries.length === 0 ? (
        <p className="mt-2 font-mono text-body-sm text-muted-foreground">
          (empty queue)
        </p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Priority queue entries">
          {entries.map((entry, index) => (
            <li
              key={`${entry.vertex}-${entry.priority}-${index}`}
              className={cn(
                'rounded-md border px-2 py-1 font-mono text-[0.7rem] shadow-sm',
                entry.stale
                  ? 'border-border bg-muted/60 text-muted-foreground line-through decoration-muted-foreground/70'
                  : 'border-border bg-surface text-foreground',
              )}
            >
              {index === 0 && !entry.stale ? (
                <span className="mr-1 text-[0.6rem] text-sky-700 dark:text-sky-300">
                  NEXT
                </span>
              ) : null}
              {entry.vertex}@{formatDistance(entry.priority)}
              {entry.stale ? (
                <span className="ml-1 text-[0.6rem] no-underline">stale</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
