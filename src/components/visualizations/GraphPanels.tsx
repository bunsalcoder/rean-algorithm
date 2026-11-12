import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import type { GraphEdge, GraphSnapshot, VertexId } from '../../algorithms/data-structures/graph'
import {
  getAdjacencyList,
  getAdjacencyMatrix,
  getDegree,
  getEdges,
  getInDegree,
  getNeighbors,
  getOutDegree,
  getVertices,
  isEmpty,
} from '../../algorithms/data-structures/graph'
import { cn } from '../../lib/cn'
import type { GraphPosition, GraphPositions } from './graphLayout'
import { VisualizationCanvas } from './VisualizationCanvas'

type GraphPanelsProps = {
  snapshot: GraphSnapshot
  positions: GraphPositions
  selectedVertex: VertexId | null
  highlightEdge: { from: VertexId; to: VertexId } | null
  onSelectVertex: (vertex: VertexId | null) => void
  onPositionChange: (vertex: VertexId, position: GraphPosition) => void
  className?: string
}

const VIEW_W = 640
const VIEW_H = 360
const NODE_R = 22
const PAD = 36

function toSvg(
  position: GraphPosition,
): { cx: number; cy: number } {
  return {
    cx: PAD + position.x * (VIEW_W - PAD * 2),
    cy: PAD + position.y * (VIEW_H - PAD * 2),
  }
}

function fromSvg(cx: number, cy: number): GraphPosition {
  const x = (cx - PAD) / (VIEW_W - PAD * 2)
  const y = (cy - PAD) / (VIEW_H - PAD * 2)
  return {
    x: Math.min(1, Math.max(0, x)),
    y: Math.min(1, Math.max(0, y)),
  }
}

function edgeKey(from: VertexId, to: VertexId, directed: boolean): string {
  if (directed || from === to) return `${from}->${to}`
  return from < to ? `${from}|${to}` : `${to}|${from}`
}

function isHighlightedEdge(
  from: VertexId,
  to: VertexId,
  snapshot: GraphSnapshot,
  highlight: GraphPanelsProps['highlightEdge'],
  selected: VertexId | null,
): boolean {
  if (highlight) {
    if (snapshot.directed) {
      return highlight.from === from && highlight.to === to
    }
    return (
      (highlight.from === from && highlight.to === to) ||
      (highlight.from === to && highlight.to === from)
    )
  }
  if (!selected) return false
  return from === selected || to === selected
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

function formatWeight(weight: number, weighted: boolean): string | null {
  if (!weighted) return null
  return Number.isInteger(weight) ? String(weight) : weight.toFixed(1)
}

function SelfLoop({
  cx,
  cy,
  directed,
  active,
  weightLabel,
}: {
  cx: number
  cy: number
  directed: boolean
  active: boolean
  weightLabel: string | null
}) {
  const path = `M ${cx - 10} ${cy - NODE_R + 2}
    C ${cx - 34} ${cy - NODE_R - 28}, ${cx + 34} ${cy - NODE_R - 28}, ${cx + 10} ${cy - NODE_R + 2}`
  return (
    <g>
      <path
        d={path}
        fill="none"
        className={cn(
          active ? 'stroke-primary' : 'stroke-border',
          'transition-theme',
        )}
        strokeWidth={active ? 2.5 : 1.75}
      />
      {directed ? (
        <polygon
          points={arrowPoints(cx + 18, cy - NODE_R - 8, cx + 10, cy - NODE_R + 2)}
          className={cn(active ? 'fill-primary' : 'fill-border')}
        />
      ) : null}
      {weightLabel ? (
        <text
          x={cx}
          y={cy - NODE_R - 34}
          textAnchor="middle"
          className="fill-muted-foreground font-mono text-[10px]"
        >
          {weightLabel}
        </text>
      ) : null}
    </g>
  )
}

/**
 * Interactive SVG graph canvas plus synchronized adjacency list, matrix,
 * and edge-list panels.
 */
export function GraphPanels({
  snapshot,
  positions,
  selectedVertex,
  highlightEdge,
  onSelectVertex,
  onPositionChange,
  className,
}: GraphPanelsProps) {
  const vertices = getVertices(snapshot)
  const edges = getEdges(snapshot)
  const matrix = getAdjacencyMatrix(snapshot)
  const adjacency = getAdjacencyList(snapshot)
  const selectedNeighbors =
    selectedVertex && hasVertexSafe(snapshot, selectedVertex)
      ? getNeighbors(snapshot, selectedVertex)
      : []

  const handlePointerDown = (
    event: ReactPointerEvent<SVGCircleElement>,
    vertex: VertexId,
  ) => {
    event.preventDefault()
    event.stopPropagation()
    onSelectVertex(vertex)
    const svg = event.currentTarget.ownerSVGElement
    if (!svg) return

    const move = (clientX: number, clientY: number) => {
      const rect = svg.getBoundingClientRect()
      const scaleX = VIEW_W / rect.width
      const scaleY = VIEW_H / rect.height
      const cx = (clientX - rect.left) * scaleX
      const cy = (clientY - rect.top) * scaleY
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

  return (
    <div className={cn('space-y-4', className)}>
      <VisualizationCanvas
        label="Interactive graph editor canvas"
        className="overflow-hidden p-2 sm:p-3"
      >
        {isEmpty(snapshot) ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 px-4 py-10 text-center">
            <p className="text-sm font-medium text-foreground">Empty graph</p>
            <p className="max-w-sm text-body-sm text-muted-foreground">
              Add a vertex or load a sample graph to begin. Representations
              below stay in sync with the canvas.
            </p>
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="h-auto w-full touch-none"
            role="img"
            aria-label="Graph vertices and edges"
          >
            <defs>
              <pattern
                id="graph-grid"
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
              fill="url(#graph-grid)"
              className="opacity-70"
              onClick={() => onSelectVertex(null)}
            />

            {edges.map((edge) => {
              const fromPos = positions[edge.from]
              const toPos = positions[edge.to]
              if (!fromPos || !toPos) return null
              const active = isHighlightedEdge(
                edge.from,
                edge.to,
                snapshot,
                highlightEdge,
                selectedVertex,
              )
              const weightLabel = formatWeight(edge.weight, snapshot.weighted)

              if (edge.from === edge.to) {
                const { cx, cy } = toSvg(fromPos)
                return (
                  <SelfLoop
                    key={edgeKey(edge.from, edge.to, snapshot.directed)}
                    cx={cx}
                    cy={cy}
                    directed={snapshot.directed}
                    active={active}
                    weightLabel={weightLabel}
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
              const midX = (seg.x1 + seg.x2) / 2
              const midY = (seg.y1 + seg.y2) / 2

              return (
                <g key={edgeKey(edge.from, edge.to, snapshot.directed)}>
                  <line
                    x1={seg.x1}
                    y1={seg.y1}
                    x2={seg.x2}
                    y2={seg.y2}
                    className={cn(
                      active ? 'stroke-primary' : 'stroke-border',
                      'transition-theme',
                    )}
                    strokeWidth={active ? 2.75 : 1.75}
                  />
                  {snapshot.directed ? (
                    <polygon
                      points={arrowPoints(seg.x1, seg.y1, seg.x2, seg.y2)}
                      className={cn(active ? 'fill-primary' : 'fill-border')}
                    />
                  ) : null}
                  {weightLabel ? (
                    <g>
                      <rect
                        x={midX - 14}
                        y={midY - 10}
                        width={28}
                        height={16}
                        rx={4}
                        className="fill-surface stroke-border"
                        strokeWidth={1}
                      />
                      <text
                        x={midX}
                        y={midY + 2}
                        textAnchor="middle"
                        className="fill-foreground font-mono text-[10px]"
                      >
                        {weightLabel}
                      </text>
                    </g>
                  ) : null}
                </g>
              )
            })}

            {vertices.map((vertex) => {
              const pos = positions[vertex]
              if (!pos) return null
              const { cx, cy } = toSvg(pos)
              const selected = selectedVertex === vertex
              const connected =
                selectedVertex !== null &&
                selectedVertex !== vertex &&
                (hasEdgeSafe(snapshot, selectedVertex, vertex) ||
                  (!snapshot.directed &&
                    hasEdgeSafe(snapshot, vertex, selectedVertex)))
              return (
                <g key={vertex} className="motion-safe:transition-transform">
                  <circle
                    cx={cx}
                    cy={cy}
                    r={NODE_R}
                    className={cn(
                      'cursor-grab stroke-2 active:cursor-grabbing',
                      selected
                        ? 'fill-primary/20 stroke-primary'
                        : connected
                          ? 'fill-teal-500/15 stroke-teal-600 dark:stroke-teal-400'
                          : 'fill-surface stroke-border',
                    )}
                    onPointerDown={(event) => handlePointerDown(event, vertex)}
                  />
                  <text
                    x={cx}
                    y={cy + 4}
                    textAnchor="middle"
                    className={cn(
                      'pointer-events-none font-mono text-[11px] font-medium',
                      selected ? 'fill-primary' : 'fill-foreground',
                    )}
                  >
                    {truncateLabel(vertex)}
                  </text>
                </g>
              )
            })}
          </svg>
        )}
      </VisualizationCanvas>

      <ul
        className="flex flex-wrap items-center gap-x-3 gap-y-2"
        aria-label="Graph legend"
      >
        <LegendSwatch
          className="border-primary bg-primary/20"
          label="Selected vertex"
        />
        <LegendSwatch
          className="border-teal-600 bg-teal-500/15 dark:border-teal-400"
          label="Connected to selection"
        />
        <LegendSwatch
          className="border-border bg-surface"
          label={snapshot.directed ? 'Directed edge (arrow)' : 'Undirected edge'}
        />
        {snapshot.weighted ? (
          <LegendSwatch className="border-border bg-surface" label="Weight label" />
        ) : null}
      </ul>

      {selectedVertex && hasVertexSafe(snapshot, selectedVertex) ? (
        <div
          className="rounded-lg border border-primary/25 bg-primary-muted/40 px-3 py-2 text-body-sm dark:bg-primary-muted/20"
          aria-live="polite"
        >
          <p className="font-medium text-foreground">
            Selected: <span className="font-mono">{selectedVertex}</span>
          </p>
          <p className="mt-1 text-muted-foreground">
            {snapshot.directed
              ? `out-degree ${getOutDegree(snapshot, selectedVertex)}, in-degree ${getInDegree(snapshot, selectedVertex)}`
              : `degree ${getDegree(snapshot, selectedVertex)}`}
            {selectedNeighbors.length > 0
              ? ` · neighbors ${selectedNeighbors
                  .map((n) =>
                    snapshot.weighted ? `${n.to}(${n.weight})` : n.to,
                  )
                  .join(', ')}`
              : ' · no neighbors'}
          </p>
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-3">
        <RepresentationCard title="Adjacency list">
          {vertices.length === 0 ? (
            <EmptyRep text="No vertices yet." />
          ) : (
            <ul className="space-y-1 font-mono text-xs sm:text-sm">
              {vertices.map((vertex) => (
                <li key={vertex}>
                  <button
                    type="button"
                    className={cn(
                      'w-full rounded-md px-2 py-1 text-left transition-theme',
                      selectedVertex === vertex
                        ? 'bg-primary/15 text-foreground'
                        : 'hover:bg-muted/80',
                    )}
                    onClick={() =>
                      onSelectVertex(
                        selectedVertex === vertex ? null : vertex,
                      )
                    }
                  >
                    <span className="text-primary">{vertex}</span>
                    {': ['}
                    {(adjacency[vertex] ?? [])
                      .map((n) =>
                        snapshot.weighted ? `${n.to}:${n.weight}` : n.to,
                      )
                      .join(', ') || '—'}
                    {']'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </RepresentationCard>

        <RepresentationCard title="Adjacency matrix">
          {vertices.length === 0 ? (
            <EmptyRep text="Matrix is empty." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse font-mono text-[0.65rem] sm:text-xs">
                <thead>
                  <tr>
                    <th className="p-1 text-muted-foreground" />
                    {vertices.map((vertex) => (
                      <th
                        key={`col-${vertex}`}
                        className="p-1 text-center text-muted-foreground"
                      >
                        {truncateLabel(vertex, 4)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vertices.map((rowVertex, i) => (
                    <tr key={`row-${rowVertex}`}>
                      <th className="p-1 text-left text-muted-foreground">
                        {truncateLabel(rowVertex, 4)}
                      </th>
                      {vertices.map((colVertex, j) => {
                        const value = matrix[i]![j]
                        const filled = value !== null
                        return (
                          <td
                            key={`${rowVertex}-${colVertex}`}
                            className={cn(
                              'p-1 text-center',
                              filled
                                ? 'bg-primary/15 text-foreground'
                                : 'text-muted-foreground/70',
                            )}
                          >
                            {filled
                              ? snapshot.weighted
                                ? value
                                : 1
                              : 0}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </RepresentationCard>

        <RepresentationCard title="Edge list">
          {edges.length === 0 ? (
            <EmptyRep text="No edges yet." />
          ) : (
            <ul className="space-y-1 font-mono text-xs sm:text-sm">
              {edges.map((edge) => (
                <EdgeListItem
                  key={edgeKey(edge.from, edge.to, snapshot.directed)}
                  edge={edge}
                  directed={snapshot.directed}
                  weighted={snapshot.weighted}
                  active={isHighlightedEdge(
                    edge.from,
                    edge.to,
                    snapshot,
                    highlightEdge,
                    selectedVertex,
                  )}
                />
              ))}
            </ul>
          )}
        </RepresentationCard>
      </div>
    </div>
  )
}

function hasVertexSafe(snapshot: GraphSnapshot, vertex: VertexId): boolean {
  return getVertices(snapshot).includes(vertex)
}

function hasEdgeSafe(
  snapshot: GraphSnapshot,
  from: VertexId,
  to: VertexId,
): boolean {
  return getNeighbors(snapshot, from).some((n) => n.to === to)
}

function truncateLabel(label: string, max = 8): string {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label
}

function LegendSwatch({
  className,
  label,
}: {
  className: string
  label: string
}) {
  return (
    <li className="flex items-center gap-1.5">
      <span
        className={cn('inline-block size-3 shrink-0 rounded-full border', className)}
        aria-hidden="true"
      />
      <span className="text-body-sm text-muted-foreground">{label}</span>
    </li>
  )
}

function RepresentationCard({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3 dark:bg-muted/15">
      <p className="text-label text-[0.65rem] tracking-[0.08em] text-muted-foreground">
        {title}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  )
}

function EmptyRep({ text }: { text: string }) {
  return <p className="text-body-sm text-muted-foreground">{text}</p>
}

function EdgeListItem({
  edge,
  directed,
  weighted,
  active,
}: {
  edge: GraphEdge
  directed: boolean
  weighted: boolean
  active: boolean
}) {
  const arrow = directed ? '→' : '—'
  return (
    <li
      className={cn(
        'rounded-md px-2 py-1',
        active ? 'bg-primary/15 text-foreground' : 'text-foreground',
      )}
    >
      ({edge.from}
      {arrow}
      {edge.to}
      {weighted ? `, ${edge.weight}` : ''})
    </li>
  )
}
