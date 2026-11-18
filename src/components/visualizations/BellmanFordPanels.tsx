import type { PointerEvent as ReactPointerEvent } from 'react'
import {
  getEdges,
  getVertices,
  isEmpty,
  type VertexId,
} from '../../algorithms/data-structures/graph'
import {
  formatBellmanFordDistance,
  parseBellmanFordDistances,
  parseBellmanFordHistory,
  parseBellmanFordPrevious,
  parseBellmanFordRelaxation,
  type BellmanFordIterationColumn,
  type BellmanFordPhase,
  type BellmanFordRelaxationView,
} from '../../algorithms/graphs/bellmanFord'
import {
  parseEdges,
  parseGraphSnapshot,
  parseStringList,
  type TraversalEdge,
} from '../../algorithms/graphs/traversalShared'
import { cn } from '../../lib/cn'
import type { GraphPosition, GraphPositions } from './graphLayout'
import type { VisualizationStep } from './types'

type BellmanFordPanelsProps = {
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

function readNumber(
  meta: VisualizationStep['meta'],
  key: string,
): number | null {
  const value = meta?.[key]
  return typeof value === 'number' ? value : null
}

function readBoolean(
  meta: VisualizationStep['meta'],
  key: string,
): boolean {
  return meta?.[key] === true
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

function arrowPoints(x1: number, y1: number, x2: number, y2: number): string {
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

type EdgeVisual = 'active' | 'path' | 'cycle' | 'negative' | 'default'

function edgeVisual(
  edge: { from: VertexId; to: VertexId; weight: number },
  directed: boolean,
  active: { from: VertexId; to: VertexId } | null,
  pathEdges: readonly TraversalEdge[],
  cycleEdges: readonly TraversalEdge[],
): EdgeVisual {
  if (active && edgesMatch(edge, active, directed)) return 'active'
  if (cycleEdges.some((item) => edgesMatch(edge, item, directed))) return 'cycle'
  if (pathEdges.some((item) => edgesMatch(edge, item, directed))) return 'path'
  if (edge.weight < 0) return 'negative'
  return 'default'
}

function edgeStroke(state: EdgeVisual): string {
  switch (state) {
    case 'active':
      return 'stroke-amber-600 dark:stroke-amber-400'
    case 'path':
      return 'stroke-emerald-600 dark:stroke-emerald-400'
    case 'cycle':
      return 'stroke-red-600 dark:stroke-red-400'
    case 'negative':
      return 'stroke-rose-600 dark:stroke-rose-400'
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
    case 'cycle':
      return 'fill-red-600 dark:fill-red-400'
    case 'negative':
      return 'fill-rose-600 dark:fill-rose-400'
    default:
      return 'fill-border'
  }
}

type VertexRole = 'current' | 'path' | 'cycle' | 'source' | 'default'

function vertexFill(role: VertexRole): string {
  switch (role) {
    case 'current':
      return 'fill-amber-500/25 stroke-amber-600 dark:stroke-amber-400'
    case 'path':
      return 'fill-emerald-500/20 stroke-emerald-600 dark:stroke-emerald-400'
    case 'cycle':
      return 'fill-red-500/20 stroke-red-600 dark:stroke-red-400'
    case 'source':
      return 'fill-primary/15 stroke-primary'
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

function phaseLabel(phase: BellmanFordPhase): string {
  switch (phase) {
    case 'initialize':
      return 'Setup'
    case 'iteration-start':
      return 'Iteration'
    case 'relax':
      return 'Edge relaxation'
    case 'iteration-end':
      return 'Iteration result'
    case 'early-stop':
      return 'Early stop'
    case 'negative-check':
      return 'Negative-cycle check'
    case 'negative-cycle':
      return 'Negative cycle'
    case 'complete':
      return 'Shortest paths'
    default:
      return 'Input'
  }
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
  const width = Math.max(28, text.length * 7 + 12)
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

function cellClass(changed: boolean, active: boolean): string {
  if (active) return 'bg-amber-500/20 text-foreground'
  if (changed) return 'bg-sky-500/15 text-foreground'
  return 'text-foreground'
}

/**
 * Weighted graph, relaxation card, and iteration distance table for one
 * Bellman-Ford frame. Each frame is an immutable snapshot.
 */
export function BellmanFordPanels({
  step,
  positions,
  onSelectVertex,
  onPositionChange,
  className,
}: BellmanFordPanelsProps) {
  const meta = step?.meta
  const phase = (readString(meta, 'phase') ?? 'initialize') as BellmanFordPhase
  const snapshot = parseGraphSnapshot(readString(meta, 'graphSnapshot') ?? '')
  const source = readString(meta, 'source')
  const destination = readString(meta, 'destination')
  const iteration = readNumber(meta, 'iteration') ?? 0
  const maxIterations = readNumber(meta, 'maxIterations') ?? 0
  const activeEdge = parseActiveEdge(readString(meta, 'activeEdge'))
  const distances = parseBellmanFordDistances(readString(meta, 'distances'))
  const previous = parseBellmanFordPrevious(readString(meta, 'previous'))
  const history = parseBellmanFordHistory(readString(meta, 'history'))
  const path = parseStringList(readString(meta, 'path'))
  const affected = parseStringList(readString(meta, 'affected'))
  const negativeCycle = parseStringList(readString(meta, 'negativeCycle'))
  const cycleEdges = parseEdges(readString(meta, 'cycleEdges'))
  const relaxation = parseBellmanFordRelaxation(readString(meta, 'relaxation'))
  const finalized = readBoolean(meta, 'finalized')
  const earlyTerminated = readBoolean(meta, 'earlyTerminated')
  const hasCycle = readBoolean(meta, 'hasReachableNegativeCycle')
  const pathEdges = finalized ? pathEdgesFrom(path) : []
  const pathSet = new Set(path)
  const affectedSet = new Set(affected)
  const cycleSet = new Set(negativeCycle)

  const vertices = getVertices(snapshot)
  const edges = getEdges(snapshot)
  const reverseKeys = new Set(
    edges.map((edge) => `${edge.from}->${edge.to}`),
  )
  const showLive = phase === 'iteration-start' || phase === 'relax'
  const liveColumn: BellmanFordIterationColumn | null = showLive
    ? {
        iteration,
        distances,
      }
    : null

  const handlePointerDown = (
    event: ReactPointerEvent<SVGGElement>,
    vertex: VertexId,
  ) => {
    onSelectVertex?.(vertex)
    if (!onPositionChange) return
    const svg = event.currentTarget.ownerSVGElement
    if (!svg) return
    const point = svg.createSVGPoint()
    const move = (clientX: number, clientY: number) => {
      point.x = clientX
      point.y = clientY
      const local = point.matrixTransform(svg.getScreenCTM()?.inverse())
      onPositionChange(vertex, fromSvg(local.x, local.y))
    }
    const onMove = (next: PointerEvent) => move(next.clientX, next.clientY)
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-[0.7rem] font-medium text-primary">
          {phaseLabel(phase)}
        </span>
        <span className="text-body-sm text-muted-foreground">
          {phase === 'relax' || phase === 'negative-check'
            ? 'One edge'
            : phase === 'iteration-start' ||
                phase === 'iteration-end' ||
                phase === 'early-stop'
              ? `Iteration ${iteration} of ${maxIterations}`
              : phase === 'negative-cycle'
                ? 'Reachable negative cycle'
                : 'Full algorithm'}
          {earlyTerminated && finalized ? ' · stopped early' : ''}
        </span>
      </div>

      {isEmpty(snapshot) ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-body-sm text-muted-foreground">
          Add vertices and weighted edges, or load a sample graph.
        </p>
      ) : (
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          role="img"
          aria-label="Bellman-Ford weighted graph"
          className="h-auto w-full overflow-visible rounded-xl border border-border bg-muted/30 dark:bg-muted/15"
        >
          <defs>
            <pattern
              id="bellman-ford-grid"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="1" className="fill-border" />
            </pattern>
          </defs>
          <rect
            width={VIEW_W}
            height={VIEW_H}
            fill="url(#bellman-ford-grid)"
            className="opacity-70"
          />
          {edges.map((edge) => {
            const a = positions[edge.from]
            const b = positions[edge.to]
            if (!a || !b) return null
            const start = toSvg(a)
            const end = toSvg(b)
            const state = edgeVisual(
              edge,
              snapshot.directed,
              activeEdge,
              pathEdges,
              finalized ? cycleEdges : [],
            )
            const reversed =
              edge.from !== edge.to &&
              reverseKeys.has(`${edge.to}->${edge.from}`)
            const shifted =
              snapshot.directed && reversed && edge.from !== edge.to
                ? offsetSegment(start.cx, start.cy, end.cx, end.cy, 8)
                : { x1: start.cx, y1: start.cy, x2: end.cx, y2: end.cy }
            const loop = edge.from === edge.to
            const seg = loop
              ? shifted
              : shortenSegment(
                  shifted.x1,
                  shifted.y1,
                  shifted.x2,
                  shifted.y2,
                  NODE_R + 2,
                  NODE_R + (snapshot.directed ? 8 : 2),
                )
            const labelX = loop ? start.cx + NODE_R + 16 : (seg.x1 + seg.x2) / 2
            const labelY = loop ? start.cy - NODE_R - 8 : (seg.y1 + seg.y2) / 2
            const weight = formatBellmanFordDistance(edge.weight)
            return (
              <g key={`${edge.from}->${edge.to}`}>
                {loop ? (
                  <path
                    d={`M ${start.cx} ${start.cy - NODE_R} C ${start.cx + 36} ${start.cy - 52}, ${start.cx + 36} ${start.cy + 8}, ${start.cx + 4} ${start.cy - NODE_R + 2}`}
                    fill="none"
                    className={cn(edgeStroke(state), 'motion-safe:transition-colors')}
                    strokeWidth={state === 'default' ? 1.75 : 2.75}
                  />
                ) : (
                  <line
                    x1={seg.x1}
                    y1={seg.y1}
                    x2={seg.x2}
                    y2={seg.y2}
                    className={cn(edgeStroke(state), 'motion-safe:transition-colors')}
                    strokeWidth={state === 'default' ? 1.75 : 2.75}
                    strokeDasharray={
                      state === 'negative' ? '5 3' : undefined
                    }
                  />
                )}
                {snapshot.directed && !loop ? (
                  <polygon
                    points={arrowPoints(seg.x1, seg.y1, seg.x2, seg.y2)}
                    className={cn(edgeFill(state), 'motion-safe:transition-colors')}
                  />
                ) : null}
                <WeightLabel
                  x={labelX}
                  y={labelY - 10}
                  text={weight}
                  state={state}
                />
              </g>
            )
          })}

          {vertices.map((vertex) => {
            const pos = positions[vertex]
            if (!pos) return null
            const { cx, cy } = toSvg(pos)
            const role: VertexRole =
              activeEdge?.to === vertex
                ? 'current'
                : finalized && affectedSet.has(vertex)
                  ? 'cycle'
                  : finalized && pathSet.has(vertex)
                    ? 'path'
                    : vertex === source
                      ? 'source'
                      : 'default'
            const distance = distances[vertex]
            const distanceLabel =
              distance === undefined ? '∞' : formatBellmanFordDistance(distance)
            const label = vertex.length > 8 ? `${vertex.slice(0, 7)}…` : vertex
            return (
              <g
                key={vertex}
                className="cursor-pointer"
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
                  className="pointer-events-none fill-foreground font-mono text-[11px] font-medium"
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
                      : distanceLabel === '−∞'
                        ? 'fill-red-700 dark:fill-red-300'
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

      <ul className="flex flex-wrap gap-x-3 gap-y-2" aria-label="Bellman-Ford legend">
        <LegendSwatch className="border-primary bg-primary/20" label="Source" />
        <LegendSwatch
          className="border-amber-600 bg-amber-500/25 dark:border-amber-400"
          label="Edge being relaxed"
        />
        <LegendSwatch
          className="border-rose-600 bg-transparent dark:border-rose-400"
          label="Negative weight"
        />
        <LegendSwatch
          className="border-emerald-600 bg-emerald-500/20 dark:border-emerald-400"
          label="Shortest path"
        />
        <LegendSwatch
          className="border-red-600 bg-red-500/20 dark:border-red-400"
          label="Negative cycle"
        />
      </ul>

      <RelaxationCard
        relaxation={relaxation}
        phase={phase}
        iteration={iteration}
        maxIterations={maxIterations}
      />

      <IterationTable
        vertices={vertices}
        source={source}
        destination={destination}
        history={history}
        liveColumn={liveColumn}
        distances={distances}
        previous={previous}
        finalized={finalized}
        hasCycle={hasCycle}
        affected={affectedSet}
        cycleSet={cycleSet}
        activeVertex={activeEdge?.to ?? null}
      />

      <p className="text-body-sm text-muted-foreground">
        {finalized ? 'Result' : 'Predecessor chain so far'}:{' '}
        <span className="font-mono text-foreground">
          {path.length > 0 ? path.join(' → ') : '—'}
        </span>
        {hasCycle && finalized ? (
          <span className="ml-2 text-red-800 dark:text-red-200">
            Reachable negative cycle
            {negativeCycle.length > 0
              ? ` ${negativeCycle.join('→')}${negativeCycle.length > 1 ? `→${negativeCycle[0]}` : ''}`
              : ''}
            . Affected vertices have no finite shortest path.
          </span>
        ) : null}
      </p>
    </div>
  )
}

function RelaxationCard({
  relaxation,
  phase,
  iteration,
  maxIterations,
}: {
  relaxation: BellmanFordRelaxationView | null
  phase: BellmanFordPhase
  iteration: number
  maxIterations: number
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3 dark:bg-muted/15">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-label text-[0.65rem] tracking-[0.08em] text-foreground">
          {phase === 'negative-check'
            ? 'Extra pass · one edge'
            : phase === 'relax'
              ? `Iteration ${iteration} of ${maxIterations} · one edge`
              : 'Edge inspection'}
        </p>
        <p className="text-[0.7rem] text-muted-foreground">
          Previous and Next move one relaxation. Iteration buttons jump a full pass.
        </p>
      </div>
      {relaxation ? (
        <dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Fact
            label="Edge"
            value={`${relaxation.from} → ${relaxation.to} (${formatBellmanFordDistance(relaxation.weight)})`}
          />
          <Fact
            label="Distance before"
            value={formatBellmanFordDistance(relaxation.before)}
          />
          <Fact
            label="Candidate"
            value={
              relaxation.candidate === null
                ? '— (tail unreachable)'
                : formatBellmanFordDistance(relaxation.candidate)
            }
          />
          <Fact
            label="Distance after"
            value={formatBellmanFordDistance(relaxation.after)}
          />
          <Fact
            label="Previous vertex"
            value={`${relaxation.previousBefore ?? '—'} → ${relaxation.previousAfter ?? '—'}`}
          />
          <Fact label="Update" value={relaxation.updated ? 'Yes' : 'No'} />
        </dl>
      ) : (
        <p className="mt-2 text-body-sm text-muted-foreground">
          {phase === 'iteration-start'
            ? 'This frame opens the iteration. The next steps inspect one edge at a time.'
            : phase === 'iteration-end' || phase === 'early-stop'
              ? 'This frame closes the iteration. The new column is the distances after every edge in the pass.'
              : 'No single edge is being inspected on this frame.'}
        </p>
      )}
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2">
      <dt className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 font-mono text-sm text-foreground">{value}</dd>
    </div>
  )
}

function IterationTable({
  vertices,
  source,
  destination,
  history,
  liveColumn,
  distances,
  previous,
  finalized,
  hasCycle,
  affected,
  cycleSet,
  activeVertex,
}: {
  vertices: readonly VertexId[]
  source: string | null
  destination: string | null
  history: readonly BellmanFordIterationColumn[]
  liveColumn: BellmanFordIterationColumn | null
  distances: Readonly<Record<string, number>>
  previous: Readonly<Record<string, VertexId | null>>
  finalized: boolean
  hasCycle: boolean
  affected: ReadonlySet<string>
  cycleSet: ReadonlySet<string>
  activeVertex: string | null
}) {
  const columns = [
    ...history.map((column) => ({ ...column, live: false })),
    ...(liveColumn ? [{ ...liveColumn, live: true }] : []),
  ]

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="min-w-full border-separate border-spacing-0 text-left text-body-sm">
        <caption className="sr-only">
          Bellman-Ford distance estimates by iteration. Values come from the
          current snapshot. A finalized negative cycle shows −∞ instead of the
          last finite estimate.
        </caption>
        <thead className="text-label text-[0.65rem] tracking-[0.06em] text-muted-foreground">
          <tr>
            <th
              scope="col"
              className="sticky left-0 z-10 border-b border-border bg-muted/80 px-3 py-2 font-medium"
            >
              Vertex
            </th>
            {columns.map((column) => (
              <th
                key={`${column.iteration}-${column.live ? 'live' : 'done'}`}
                scope="col"
                className={cn(
                  'border-b border-border px-3 py-2 text-right font-medium',
                  column.live && 'bg-amber-500/10 text-foreground',
                )}
              >
                {column.iteration === 0
                  ? 'Initial'
                  : `Iteration ${column.iteration}`}
                {column.live ? (
                  <span className="mt-0.5 block font-sans text-[0.6rem] font-normal normal-case tracking-normal">
                    in progress
                  </span>
                ) : null}
              </th>
            ))}
            <th
              scope="col"
              className="border-b border-border px-3 py-2 text-right font-medium"
            >
              {finalized ? 'Result' : 'Estimate'}
            </th>
            <th scope="col" className="border-b border-border px-3 py-2 font-medium">
              Previous
            </th>
          </tr>
        </thead>
        <tbody>
          {vertices.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-3 py-3 text-muted-foreground">
                No vertices yet.
              </td>
            </tr>
          ) : (
            vertices.map((vertex) => {
              const resultDistance = distances[vertex]
              const onCycle = finalized && affected.has(vertex)
              return (
                <tr key={vertex} className="border-b border-border">
                  <th
                    scope="row"
                    className={cn(
                      'sticky left-0 z-10 whitespace-nowrap border-b border-border bg-surface px-3 py-2 font-mono font-medium text-foreground',
                      vertex === activeVertex && 'bg-amber-500/10',
                      onCycle && 'bg-red-500/10',
                    )}
                  >
                    {vertex}
                    {vertex === source ? (
                      <span className="ml-2 font-sans text-[0.65rem] font-normal text-primary">
                        Source
                      </span>
                    ) : null}
                    {vertex === destination ? (
                      <span className="ml-2 font-sans text-[0.65rem] font-normal text-muted-foreground">
                        Destination
                      </span>
                    ) : null}
                    {cycleSet.has(vertex) && finalized ? (
                      <span className="ml-2 font-sans text-[0.65rem] font-normal text-red-700 dark:text-red-300">
                        Cycle
                      </span>
                    ) : null}
                  </th>
                  {columns.map((column, index) => {
                    const value = column.distances[vertex]
                    const prior =
                      index > 0 ? columns[index - 1]?.distances[vertex] : value
                    const changed = index > 0 && prior !== value
                    return (
                      <td
                        key={`${vertex}-${column.iteration}-${column.live ? 'live' : 'done'}`}
                        className={cn(
                          'border-b border-border px-3 py-2 text-right font-mono tabular-nums',
                          cellClass(changed, column.live && vertex === activeVertex),
                        )}
                      >
                        {value === undefined
                          ? '∞'
                          : formatBellmanFordDistance(value)}
                      </td>
                    )
                  })}
                  <td
                    className={cn(
                      'border-b border-border px-3 py-2 text-right font-mono tabular-nums',
                      onCycle
                        ? 'bg-red-500/10 text-red-800 dark:text-red-200'
                        : 'text-foreground',
                    )}
                  >
                    {resultDistance === undefined
                      ? '∞'
                      : formatBellmanFordDistance(resultDistance)}
                  </td>
                  <td className="border-b border-border px-3 py-2 font-mono text-foreground">
                    {previous[vertex] ?? '—'}
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
      {hasCycle && finalized ? (
        <p className="border-t border-border px-3 py-2 text-[0.75rem] text-red-800 dark:text-red-200">
          Iteration columns are estimates. The result column uses −∞ where a
          reachable negative cycle removed any finite shortest path.
        </p>
      ) : (
        <p className="border-t border-border px-3 py-2 text-[0.75rem] text-muted-foreground">
          Highlighted numbers changed on that pass. ∞ means not yet reached.
        </p>
      )}
    </div>
  )
}
