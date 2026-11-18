import type { PointerEvent as ReactPointerEvent } from 'react'
import {
  getEdges,
  getVertices,
  isEmpty,
  type GraphSnapshot,
  type VertexId,
} from '../../algorithms/data-structures/graph'
import {
  FLOYD_WARSHALL_NEGATIVE_INFINITY,
  formatFloydWarshallDistance,
  parseFloydWarshallMatrix,
  parseFloydWarshallNext,
  parseFloydWarshallPairs,
  parseFloydWarshallUpdate,
  reconstructFloydWarshallPath,
  type FloydWarshallPhase,
  type FloydWarshallUpdate,
} from '../../algorithms/graphs/floydWarshall'
import { parseStringList } from '../../algorithms/graphs/traversalShared'
import { cn } from '../../lib/cn'
import type { GraphPosition, GraphPositions } from './graphLayout'
import type { VisualizationStep } from './types'

type FloydWarshallPanelsProps = {
  snapshot: GraphSnapshot
  step: VisualizationStep | undefined
  positions: GraphPositions
  source: string
  destination: string
  onSelectVertex?: (vertex: VertexId) => void
  onPositionChange?: (vertex: VertexId, position: GraphPosition) => void
  className?: string
}

const VIEW_W = 680
const VIEW_H = 320
const NODE_R = 20
const PAD = 40

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
  return {
    x1: x1 + (-dy / dist) * amount,
    y1: y1 + (dx / dist) * amount,
    x2: x2 + (-dy / dist) * amount,
    y2: y2 + (dx / dist) * amount,
  }
}

function arrowPoints(x1: number, y1: number, x2: number, y2: number): string {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const len = 9
  const spread = Math.PI / 7
  const ax = x2 - len * Math.cos(angle - spread)
  const ay = y2 - len * Math.sin(angle - spread)
  const bx = x2 - len * Math.cos(angle + spread)
  const by = y2 - len * Math.sin(angle + spread)
  return `${x2},${y2} ${ax},${ay} ${bx},${by}`
}

type CellRole = 'ij' | 'ik' | 'kj' | 'none'

function cellRole(
  row: number,
  col: number,
  iIndex: number,
  jIndex: number,
  kIndex: number,
): CellRole {
  if (iIndex >= 0 && jIndex >= 0 && row === iIndex && col === jIndex) return 'ij'
  if (iIndex >= 0 && kIndex >= 0 && row === iIndex && col === kIndex) return 'ik'
  if (kIndex >= 0 && jIndex >= 0 && row === kIndex && col === jIndex) return 'kj'
  return 'none'
}

function roleClass(role: CellRole, updated: boolean, affected: boolean): string {
  if (role === 'ij') {
    return updated
      ? 'bg-emerald-500/25 ring-2 ring-inset ring-emerald-600 dark:ring-emerald-400'
      : 'bg-amber-500/20 ring-2 ring-inset ring-amber-600 dark:ring-amber-400'
  }
  if (role === 'ik') {
    return 'bg-sky-500/20 ring-2 ring-inset ring-sky-600 dark:ring-sky-400'
  }
  if (role === 'kj') {
    return 'bg-violet-500/20 ring-2 ring-inset ring-violet-600 dark:ring-violet-400'
  }
  if (affected) {
    return 'bg-red-500/10 text-red-800 dark:text-red-200'
  }
  if (updated) {
    return 'bg-emerald-500/10'
  }
  return ''
}

function phaseLabel(phase: FloydWarshallPhase | null): string {
  switch (phase) {
    case 'initialize':
      return 'Initial matrix'
    case 'iteration-start':
      return 'Choose k'
    case 'consider':
      return 'One cell'
    case 'iteration-end':
      return 'Iteration done'
    case 'negative-cycle':
      return 'Negative cycle'
    case 'complete':
      return 'Final matrix'
    case 'invalid':
      return 'Invalid graph'
    default:
      return 'Floyd-Warshall'
  }
}

function pairKey(from: string, to: string): string {
  return `${from}\u0000${to}`
}

function DistanceTable({
  title,
  vertices,
  matrix,
  baseline,
  iIndex,
  jIndex,
  kIndex,
  showRoles,
  finalized,
  affected,
  caption,
}: {
  title: string
  vertices: readonly string[]
  matrix: readonly (readonly number[])[]
  baseline: readonly (readonly number[])[] | null
  iIndex: number
  jIndex: number
  kIndex: number
  showRoles: boolean
  finalized: boolean
  affected: ReadonlySet<string>
  caption: string
}) {
  return (
    <div className="min-w-0">
      <p className="mb-2 text-label text-[0.65rem] tracking-[0.08em]">{title}</p>
      <div className="max-w-full overflow-x-auto rounded-xl border border-border">
        <table className="min-w-max border-separate border-spacing-0 text-center text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-20 border-b border-r border-border bg-muted/90 px-2 py-2 text-left text-[0.65rem] font-medium text-muted-foreground"
              >
                from \ to
              </th>
              {vertices.map((vertex, col) => (
                <th
                  key={`col-${vertex}`}
                  scope="col"
                  className={cn(
                    'border-b border-border px-2 py-2 text-[0.7rem] font-semibold',
                    'motion-safe:transition-colors motion-reduce:transition-none',
                    showRoles && col === jIndex && 'bg-amber-500/15 text-amber-800 dark:text-amber-200',
                    showRoles && col === kIndex && col !== jIndex && 'bg-violet-500/15 text-violet-800 dark:text-violet-200',
                  )}
                >
                  {vertex}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vertices.map((rowVertex, row) => (
              <tr key={`row-${rowVertex}`}>
                <th
                  scope="row"
                  className={cn(
                    'sticky left-0 z-10 border-r border-border bg-muted/90 px-2 py-2 text-left text-[0.7rem] font-semibold',
                    'motion-safe:transition-colors motion-reduce:transition-none',
                    showRoles && row === iIndex && 'bg-sky-500/20 text-sky-900 dark:text-sky-100',
                    showRoles && row === kIndex && row !== iIndex && 'bg-violet-500/15 text-violet-800 dark:text-violet-200',
                  )}
                >
                  {rowVertex}
                </th>
                {vertices.map((colVertex, col) => {
                  const value = matrix[row]?.[col] ?? Number.POSITIVE_INFINITY
                  const previous = baseline?.[row]?.[col]
                  const changed =
                    previous !== undefined &&
                    previous !== value &&
                    !(Number.isNaN(previous) && Number.isNaN(value))
                  const role = showRoles ? cellRole(row, col, iIndex, jIndex, kIndex) : 'none'
                  const isAffected = affected.has(pairKey(rowVertex, colVertex))
                  const shown =
                    finalized && isAffected
                      ? FLOYD_WARSHALL_NEGATIVE_INFINITY
                      : value
                  const label = formatFloydWarshallDistance(shown)
                  const detail =
                    finalized && isAffected && Number.isFinite(value)
                      ? `Dynamic-programming cell was ${formatFloydWarshallDistance(value)}. The reported distance is −∞ because this pair can reach a negative cycle.`
                      : `dist[${rowVertex}][${colVertex}] = ${formatFloydWarshallDistance(value)}`
                  return (
                    <td
                      key={`${rowVertex}-${colVertex}`}
                      title={detail}
                      className={cn(
                        'min-w-12 border-b border-border px-2 py-2 font-mono text-xs sm:text-sm',
                        'motion-safe:transition-colors motion-reduce:transition-none',
                        !Number.isFinite(shown) && shown !== FLOYD_WARSHALL_NEGATIVE_INFINITY && 'text-muted-foreground',
                        roleClass(role, changed, isAffected),
                      )}
                    >
                      {label}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FormulaCard({ update }: { update: FloydWarshallUpdate | null }) {
  if (!update) return null
  const ik = formatFloydWarshallDistance(update.viaIk)
  const kj = formatFloydWarshallDistance(update.viaKj)
  const before = formatFloydWarshallDistance(update.before)
  const candidate =
    update.candidate === null
      ? 'no candidate'
      : formatFloydWarshallDistance(update.candidate)
  const after = formatFloydWarshallDistance(update.after)
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-3 text-body-sm">
      <p className="font-mono text-xs text-foreground sm:text-sm">
        dist[{update.i}][{update.j}] = min({before}, {ik} + {kj})
      </p>
      <p className="mt-1 text-muted-foreground">
        k = {update.k} is the intermediate vertex. dist[{update.i}][{update.k}] = {ik}, dist[
        {update.k}][{update.j}] = {kj}, candidate = {candidate}. The cell{' '}
        {update.updated ? `changes from ${before} to ${after}` : `stays ${after}`}.
        {update.candidate !== null && update.candidate === update.before
          ? ' Equal distances keep the path already stored.'
          : ''}
      </p>
    </div>
  )
}

/**
 * Distance-matrix playback for Floyd-Warshall, with the graph and one path.
 */
export function FloydWarshallPanels({
  snapshot,
  step,
  positions,
  source,
  destination,
  onSelectVertex,
  onPositionChange,
  className,
}: FloydWarshallPanelsProps) {
  const meta = step?.meta
  const phase = (readString(meta, 'phase') as FloydWarshallPhase | null) ?? null
  const vertices = getVertices(snapshot)
  const edges = getEdges(snapshot)
  const distances = parseFloydWarshallMatrix(readString(meta, 'distances'))
  const baseline = parseFloydWarshallMatrix(readString(meta, 'baseline'))
  const next = parseFloydWarshallNext(readString(meta, 'next'))
  const update = parseFloydWarshallUpdate(readString(meta, 'update'))
  const finalized = readBoolean(meta, 'finalized')
  const hasNegativeCycle = readBoolean(meta, 'hasNegativeCycle')
  const negativeCycleVertices = parseStringList(
    readString(meta, 'negativeCycleVertices'),
  )
  const affectedPairs = finalized
    ? parseFloydWarshallPairs(readString(meta, 'affectedPairs'))
    : []
  const affected = new Set(affectedPairs.map((pair) => pairKey(pair.from, pair.to)))
  const iIndex = readNumber(meta, 'iIndex') ?? -1
  const jIndex = readNumber(meta, 'jIndex') ?? -1
  const kIndex = readNumber(meta, 'kIndex') ?? -1
  const iteration = readNumber(meta, 'iteration') ?? 0
  const vertexCount = readNumber(meta, 'vertexCount') ?? vertices.length
  const cellsUpdated = readNumber(meta, 'cellsUpdated') ?? 0
  const showRoles = phase === 'consider'
  const showPrevious = phase !== 'initialize' && phase !== 'invalid' && baseline.length > 0

  const path = reconstructFloydWarshallPath({
    vertices,
    distances,
    next,
    source,
    destination,
    affectedPairs: finalized ? affectedPairs : undefined,
  })
  const pathEdgeKeys = new Set(path.edges.map((edge) => `${edge.from}>${edge.to}`))
  const cycleSet = new Set(negativeCycleVertices)

  const diagonals = vertices.flatMap((vertex, index) => {
    const value = distances[index]?.[index]
    if (typeof value === 'number' && value < 0) {
      return [`${vertex} = ${formatFloydWarshallDistance(value)}`]
    }
    return []
  })

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
    const onMove = (nextEvent: PointerEvent) => move(nextEvent.clientX, nextEvent.clientY)
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const reverseKeys = new Set(edges.map((edge) => `${edge.from}->${edge.to}`))

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-[0.7rem] font-medium text-primary">
          {phaseLabel(phase)}
        </span>
        <span className="text-body-sm text-muted-foreground">
          {phase === 'consider'
            ? `k = ${update?.k ?? '—'} · cell ${update?.i ?? '—'} → ${update?.j ?? '—'}`
            : phase === 'iteration-start' || phase === 'iteration-end'
              ? `Intermediate ${iteration} of ${vertexCount}`
              : phase === 'negative-cycle'
                ? 'Diagonal test'
                : 'All pairs'}
          {phase === 'iteration-end' ? ` · ${cellsUpdated} cells updated` : ''}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 text-[0.7rem] text-muted-foreground">
        <span className="rounded-md bg-amber-500/20 px-2 py-1 ring-1 ring-amber-600/50 dark:ring-amber-400/50">
          dist[i][j]
        </span>
        <span className="rounded-md bg-sky-500/20 px-2 py-1 ring-1 ring-sky-600/50 dark:ring-sky-400/50">
          dist[i][k]
        </span>
        <span className="rounded-md bg-violet-500/20 px-2 py-1 ring-1 ring-violet-600/50 dark:ring-violet-400/50">
          dist[k][j]
        </span>
        <span className="rounded-md bg-emerald-500/15 px-2 py-1 ring-1 ring-emerald-600/40 dark:ring-emerald-400/40">
          Updated this k
        </span>
        <span className="rounded-md bg-red-500/10 px-2 py-1 text-red-800 ring-1 ring-red-600/40 dark:text-red-200 dark:ring-red-400/40">
          Affected pair (−∞)
        </span>
      </div>

      {isEmpty(snapshot) ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-body-sm text-muted-foreground">
          Add vertices and edges, or load a sample graph. The matrix has one row and one column per vertex.
        </p>
      ) : (
        <div className={cn('grid gap-4', showPrevious && 'xl:grid-cols-2')}>
          {showPrevious ? (
            <DistanceTable
              title={
                phase === 'negative-cycle'
                  ? 'Working matrix'
                  : phase === 'complete'
                    ? 'Layer before the last k'
                    : 'Previous matrix (before this k)'
              }
              vertices={vertices}
              matrix={baseline}
              baseline={null}
              iIndex={iIndex}
              jIndex={jIndex}
              kIndex={kIndex}
              showRoles={showRoles}
              finalized={false}
              affected={new Set()}
              caption="Distance matrix from before the current intermediate vertex was allowed."
            />
          ) : null}
          <DistanceTable
            title={finalized ? 'Reported distances' : 'Current matrix'}
            vertices={vertices}
            matrix={distances}
            baseline={showPrevious ? baseline : null}
            iIndex={iIndex}
            jIndex={jIndex}
            kIndex={kIndex}
            showRoles={showRoles}
            finalized={finalized}
            affected={affected}
            caption="Current all-pairs distances. Rows are sources and columns are destinations. Infinity means unreachable. On the final frames, an affected pair shows −∞."
          />
        </div>
      )}

      <FormulaCard update={update} />

      {diagonals.length > 0 ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-body-sm text-red-950 dark:text-red-100">
          Negative diagonal{diagonals.length === 1 ? '' : 's'}: {diagonals.join(', ')}. A
          negative dist[i][i] means vertex i is on a negative cycle.
          {finalized
            ? ' Affected cells in the current matrix show −∞ instead of the dynamic-programming number.'
            : ' The detection pass runs after every intermediate vertex has been tried.'}
        </p>
      ) : null}

      <div
        className={cn(
          'rounded-xl border px-3 py-3 text-body-sm',
          path.state === 'negative-cycle'
            ? 'border-red-500/30 bg-red-500/10 text-red-950 dark:text-red-100'
            : path.state === 'unreachable' || path.state === 'invalid'
              ? 'border-border bg-muted/40 text-muted-foreground dark:bg-muted/20'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100',
        )}
      >
        <p className="font-medium text-foreground">
          Path {source || '—'} → {destination || '—'}
        </p>
        <p className="mt-1">
          Distance {formatFloydWarshallDistance(path.distance)}.
          {path.path.length > 0 ? ` Path: ${path.path.join(' → ')}.` : ' No path is shown.'}
        </p>
        {path.reason ? <p className="mt-1">{path.reason}</p> : null}
        {path.edges.length > 0 ? (
          <p className="mt-1 font-mono text-xs">
            Edges: {path.edges.map((edge) => `${edge.from}→${edge.to}`).join(', ')}
          </p>
        ) : null}
        {hasNegativeCycle && finalized ? (
          <p className="mt-1">
            Cycle vertices: {negativeCycleVertices.join(', ') || '—'}. Only pairs that
            can reach one of them, and that the cycle can reach, are −∞.
          </p>
        ) : null}
      </div>

      {!isEmpty(snapshot) ? (
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          role="img"
          aria-label="Floyd-Warshall weighted graph"
          className="h-auto w-full overflow-visible rounded-xl border border-border bg-muted/30 dark:bg-muted/15"
        >
          <defs>
            <pattern
              id="floyd-warshall-grid"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="0.8" className="fill-border/70" />
            </pattern>
          </defs>
          <rect width={VIEW_W} height={VIEW_H} fill="url(#floyd-warshall-grid)" className="opacity-70" />
          {edges.map((edge) => {
            const from = positions[edge.from] ?? { x: 0.5, y: 0.5 }
            const to = positions[edge.to] ?? { x: 0.5, y: 0.5 }
            const a = toSvg(from)
            const b = toSvg(to)
            const onPath =
              pathEdgeKeys.has(`${edge.from}>${edge.to}`) ||
              (!snapshot.directed &&
                edge.from !== edge.to &&
                (pathEdgeKeys.has(`${edge.from}>${edge.to}`) ||
                  pathEdgeKeys.has(`${edge.to}>${edge.from}`)))
            const stroke = onPath
              ? 'stroke-emerald-600 dark:stroke-emerald-400'
              : edge.weight < 0
                ? 'stroke-rose-600 dark:stroke-rose-400'
                : 'stroke-border'
            const fill = onPath
              ? 'fill-emerald-600 dark:fill-emerald-400'
              : edge.weight < 0
                ? 'fill-rose-600 dark:fill-rose-400'
                : 'fill-border'
            if (edge.from === edge.to) {
              return (
                <g key={`loop-${edge.from}`}>
                  <ellipse
                    cx={a.cx}
                    cy={a.cy - NODE_R - 10}
                    rx="14"
                    ry="9"
                    className={cn('fill-none stroke-2', stroke)}
                  />
                  <text
                    x={a.cx + 16}
                    y={a.cy - NODE_R - 12}
                    className="fill-foreground text-[11px] font-medium"
                  >
                    {formatFloydWarshallDistance(edge.weight)}
                  </text>
                </g>
              )
            }
            const hasReverse =
              snapshot.directed && reverseKeys.has(`${edge.to}->${edge.from}`)
            const shifted = hasReverse
              ? offsetSegment(a.cx, a.cy, b.cx, b.cy, 10)
              : { x1: a.cx, y1: a.cy, x2: b.cx, y2: b.cy }
            const line = shortenSegment(
              shifted.x1,
              shifted.y1,
              shifted.x2,
              shifted.y2,
              NODE_R + 2,
              NODE_R + (snapshot.directed ? 8 : 2),
            )
            const midX = (line.x1 + line.x2) / 2
            const midY = (line.y1 + line.y2) / 2
            return (
              <g key={`${edge.from}->${edge.to}`}>
                <line
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  className={cn('stroke-2', stroke)}
                />
                {snapshot.directed ? (
                  <polygon points={arrowPoints(line.x1, line.y1, line.x2, line.y2)} className={fill} />
                ) : null}
                <text
                  x={midX}
                  y={midY - 6}
                  textAnchor="middle"
                  className="fill-foreground text-[11px] font-medium"
                >
                  {snapshot.weighted ? formatFloydWarshallDistance(edge.weight) : ''}
                </text>
              </g>
            )
          })}
          {vertices.map((vertex) => {
            const point = toSvg(positions[vertex] ?? { x: 0.5, y: 0.5 })
            const onPath = path.path.includes(vertex)
            const isK = update?.k === vertex && phase === 'consider'
            const isI = update?.i === vertex && phase === 'consider'
            const isJ = update?.j === vertex && phase === 'consider'
            const onCycle = cycleSet.has(vertex)
            const ring = onCycle
              ? 'fill-red-500/20 stroke-red-600 dark:stroke-red-400'
              : isK
                ? 'fill-violet-500/25 stroke-violet-600 dark:stroke-violet-400'
                : isI
                  ? 'fill-sky-500/25 stroke-sky-600 dark:stroke-sky-400'
                  : isJ
                    ? 'fill-amber-500/25 stroke-amber-600 dark:stroke-amber-400'
                    : onPath
                      ? 'fill-emerald-500/20 stroke-emerald-600 dark:stroke-emerald-400'
                      : 'fill-surface stroke-border'
            return (
              <g
                key={vertex}
                className="cursor-pointer"
                onPointerDown={(event) => handlePointerDown(event, vertex)}
              >
                <circle
                  cx={point.cx}
                  cy={point.cy}
                  r={NODE_R}
                  className={cn('stroke-2', ring)}
                />
                <text
                  x={point.cx}
                  y={point.cy + 4}
                  textAnchor="middle"
                  className="fill-foreground text-[12px] font-semibold"
                >
                  {vertex}
                </text>
              </g>
            )
          })}
        </svg>
      ) : null}
    </div>
  )
}
