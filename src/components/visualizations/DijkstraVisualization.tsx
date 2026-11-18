import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  GRAPH_FLIGHT_NETWORK,
  addEdge,
  addVertex,
  clear,
  getEdges,
  getVertices,
  removeEdge,
  removeVertex,
  snapshotFromSeed,
  withMode,
  type GraphSnapshot,
  type VertexId,
} from '../../algorithms/data-structures/graph'
import {
  DIJKSTRA_DIRECTED_LAYOUT,
  DIJKSTRA_DIRECTED_ROUTES,
  DIJKSTRA_ROAD_LAYOUT,
  DIJKSTRA_ROAD_NETWORK,
  DIJKSTRA_ZERO_LAYOUT,
  DIJKSTRA_ZERO_WEIGHT,
  buildDijkstraSteps,
  findNegativeEdge,
} from '../../algorithms/graphs/dijkstra'
import { cn } from '../../lib/cn'
import { Button } from '../ui'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import { DijkstraPanels } from './DijkstraPanels'
import {
  SAMPLE_LAYOUTS,
  autoLayoutPositions,
  type GraphPosition,
  type GraphPositions,
} from './graphLayout'

const DIJKSTRA_PRESETS = [
  {
    id: 'roads',
    label: 'Weighted roads',
    description:
      'Indirect A–C–B–D–E (distance 10) beats the fewer-hop A–C–E (12).',
    seed: DIJKSTRA_ROAD_NETWORK,
    layout: DIJKSTRA_ROAD_LAYOUT,
    source: 'A',
    destination: 'E',
  },
  {
    id: 'directed',
    label: 'Directed routes',
    description: 'One-way edges. S → T is 7. Isolated X stays unreachable.',
    seed: DIJKSTRA_DIRECTED_ROUTES,
    layout: DIJKSTRA_DIRECTED_LAYOUT,
    source: 'S',
    destination: 'T',
  },
  {
    id: 'zero',
    label: 'Zero-weight edges',
    description: 'A free hop can beat a heavier direct edge.',
    seed: DIJKSTRA_ZERO_WEIGHT,
    layout: DIJKSTRA_ZERO_LAYOUT,
    source: 'A',
    destination: 'D',
  },
  {
    id: 'flights',
    label: 'Flight network',
    description: 'Directed flight times in hours.',
    seed: GRAPH_FLIGHT_NETWORK,
    layout: SAMPLE_LAYOUTS.flights ?? {},
    source: 'SGN',
    destination: 'NRT',
  },
] as const

function feedbackClass(kind: 'ok' | 'error' | 'info'): string {
  if (kind === 'error') {
    return 'border-red-500/30 bg-red-500/10 text-red-950 dark:text-red-100'
  }
  if (kind === 'ok') {
    return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100'
  }
  return 'border-border bg-muted/40 text-muted-foreground dark:bg-muted/20'
}

const inputClassName = cn(
  'mt-1 w-full rounded-md border border-border bg-surface px-3 py-2',
  'text-sm text-foreground shadow-sm transition-theme',
  'placeholder:text-muted-foreground',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
)

function Fieldset({
  legend,
  children,
}: {
  legend: string
  children: ReactNode
}) {
  return (
    <fieldset>
      <legend className="text-label text-[0.65rem] tracking-[0.08em]">
        {legend}
      </legend>
      <div className="mt-2">{children}</div>
    </fieldset>
  )
}

function graphKey(
  snapshot: GraphSnapshot,
  source: string,
  destination: string,
): string {
  const edges = getEdges(snapshot)
    .map((edge) => `${edge.from}>${edge.to}:${edge.weight}`)
    .join('|')
  return `${snapshot.directed ? 'd' : 'u'}${snapshot.weighted ? 'w' : 'n'}:${snapshot.vertices.join(',')}:${edges}:${source}:${destination}`
}

function retainVertex(vertices: readonly string[], current: string, fallbackIndex: number): string {
  if (vertices.includes(current)) return current
  return vertices[fallbackIndex] ?? vertices[0] ?? ''
}

/**
 * Interactive Dijkstra playground: edit a weighted graph, pick source and
 * destination, then step through immutable algorithm snapshots.
 */
export function DijkstraVisualization() {
  const [snapshot, setSnapshot] = useState<GraphSnapshot>(() =>
    snapshotFromSeed(DIJKSTRA_ROAD_NETWORK),
  )
  const [positions, setPositions] = useState<GraphPositions>(
    () => ({ ...DIJKSTRA_ROAD_LAYOUT }),
  )
  const [source, setSource] = useState('A')
  const [destination, setDestination] = useState('E')
  const [activePreset, setActivePreset] = useState('roads')
  const [vertexInput, setVertexInput] = useState('')
  const [fromInput, setFromInput] = useState('A')
  const [toInput, setToInput] = useState('C')
  const [weightInput, setWeightInput] = useState('2')
  const [selectedVertex, setSelectedVertex] = useState<VertexId | null>('A')
  const [message, setMessage] = useState<{
    kind: 'ok' | 'error' | 'info'
    text: string
  }>({
    kind: 'info',
    text: 'Drag a vertex to rearrange the drawing. The algorithm reads edge weights; it does not move vertices.',
  })

  const vertices = useMemo(() => getVertices(snapshot), [snapshot])
  const negative = useMemo(() => findNegativeEdge(snapshot), [snapshot])
  const steps = useMemo(
    () => buildDijkstraSteps(snapshot, source, destination),
    [snapshot, source, destination],
  )
  const playbackKey = graphKey(snapshot, source, destination)

  const applySnapshot = (next: GraphSnapshot, nextPositions?: GraphPositions) => {
    const nextVertices = getVertices(next)
    setSnapshot(next)
    setPositions(autoLayoutPositions(nextVertices, nextPositions ?? positions))
    setSource((current) => retainVertex(nextVertices, current, 0))
    setDestination((current) =>
      retainVertex(nextVertices, current, Math.max(nextVertices.length - 1, 0)),
    )
    setSelectedVertex((current) =>
      current && nextVertices.includes(current) ? current : (nextVertices[0] ?? null),
    )
  }

  const loadPreset = (presetId: string) => {
    const preset = DIJKSTRA_PRESETS.find((item) => item.id === presetId)
    if (!preset) return
    const next = snapshotFromSeed(preset.seed)
    setSnapshot(next)
    setPositions(autoLayoutPositions(getVertices(next), { ...preset.layout }))
    setSource(preset.source)
    setDestination(preset.destination)
    setActivePreset(presetId)
    setSelectedVertex(preset.source)
    setFromInput(preset.source)
    setToInput(preset.destination)
    setWeightInput('1')
    setMessage({ kind: 'ok', text: `Loaded “${preset.label}”. ${preset.description}` })
  }

  const handleAddVertex = () => {
    const result = addVertex(snapshot, vertexInput)
    if (!result.ok) {
      setMessage({ kind: 'error', text: result.reason ?? 'Could not add vertex.' })
      return
    }
    if (!result.changed) {
      setMessage({
        kind: 'info',
        text: `Vertex "${vertexInput.trim()}" already exists.`,
      })
      return
    }
    applySnapshot(result.snapshot)
    setSelectedVertex(vertexInput.trim())
    setVertexInput('')
    setActivePreset('custom')
    setMessage({ kind: 'ok', text: `Added vertex "${vertexInput.trim() || result.snapshot.vertices.at(-1)}".` })
  }

  const handleRemoveVertex = () => {
    if (!selectedVertex) {
      setMessage({ kind: 'error', text: 'Select a vertex to remove.' })
      return
    }
    const result = removeVertex(snapshot, selectedVertex)
    if (!result.ok) {
      setMessage({ kind: 'error', text: result.reason ?? 'Could not remove vertex.' })
      return
    }
    applySnapshot(result.snapshot)
    setActivePreset('custom')
    setMessage({
      kind: 'ok',
      text: `Removed ${selectedVertex} and its incident edges.`,
    })
  }

  const handleAddEdge = () => {
    const weight = snapshot.weighted ? Number(weightInput) : undefined
    if (snapshot.weighted && !Number.isFinite(weight)) {
      setMessage({ kind: 'error', text: 'Enter a finite numeric weight.' })
      return
    }
    const result = addEdge(snapshot, fromInput, toInput, weight)
    if (!result.ok) {
      setMessage({ kind: 'error', text: result.reason ?? 'Could not add edge.' })
      return
    }
    applySnapshot(result.snapshot)
    setActivePreset('custom')
    const label = `${fromInput.trim()} ${snapshot.directed ? '→' : '—'} ${toInput.trim()}`
    if (snapshot.weighted && weight !== undefined && weight < 0) {
      setMessage({
        kind: 'error',
        text: `Stored ${label} with weight ${weight}. Dijkstra will refuse to run until every weight is non-negative.`,
      })
      return
    }
    setMessage({
      kind: result.changed ? 'ok' : 'info',
      text: result.changed
        ? `Saved ${label}${snapshot.weighted ? ` (weight ${weightInput})` : ''}.`
        : 'That edge already had the same weight.',
    })
  }

  const handleRemoveEdge = () => {
    const result = removeEdge(snapshot, fromInput, toInput)
    if (!result.ok) {
      setMessage({ kind: 'error', text: result.reason ?? 'Could not remove edge.' })
      return
    }
    applySnapshot(result.snapshot)
    setActivePreset('custom')
    setMessage({
      kind: 'ok',
      text: `Removed edge ${fromInput.trim()} ${snapshot.directed ? '→' : '—'} ${toInput.trim()}.`,
    })
  }

  const handleMode = (patch: { directed?: boolean; weighted?: boolean }) => {
    applySnapshot(withMode(snapshot, patch))
    setActivePreset('custom')
  }

  const nudgeSelected = (dx: number, dy: number) => {
    if (!selectedVertex) return
    const current = positions[selectedVertex] ?? { x: 0.5, y: 0.5 }
    const next: GraphPosition = {
      x: Math.min(1, Math.max(0, current.x + dx)),
      y: Math.min(1, Math.max(0, current.y + dy)),
    }
    setPositions((prev) => ({ ...prev, [selectedVertex]: next }))
  }

  return (
    <div className="space-y-4">
      <p
        className={cn(
          'rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2',
          'text-body-sm text-sky-950 dark:text-sky-100',
        )}
        role="note"
      >
        Dijkstra repeatedly selects the unvisited vertex with the smallest
        known distance and relaxes its outgoing edges. Edge weights must be
        non-negative. The frontier is the{' '}
        <Link
          to="/learn/priority-queue"
          className="font-medium underline underline-offset-2"
        >
          min priority queue
        </Link>
        . BFS is enough when every edge has the same cost — compare it on{' '}
        <Link
          to="/learn/graph-traversal"
          className="font-medium underline underline-offset-2"
        >
          Graph Traversal
        </Link>
        . Use Previous, Next, Play, Pause, and Reset to move through immutable
        snapshots.
      </p>

      {negative ? (
        <p
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-body-sm text-red-950 dark:text-red-100"
          role="alert"
        >
          Edge {negative.from} → {negative.to} has weight {negative.weight}.
          Dijkstra cannot run. Change the weight to 0 or greater. Negative
          weights need a different algorithm, such as Bellman-Ford.
        </p>
      ) : null}

      <div className="space-y-4 rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20">
        <Fieldset legend="Sample weighted graphs">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {DIJKSTRA_PRESETS.map((preset) => (
              <Button
                key={preset.id}
                type="button"
                size="sm"
                variant={activePreset === preset.id ? 'secondary' : 'outline'}
                onClick={() => loadPreset(preset.id)}
                aria-pressed={activePreset === preset.id}
                title={preset.description}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </Fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block min-w-0">
            <span className="text-label text-[0.65rem] tracking-[0.08em]">
              Source vertex
            </span>
            <select
              value={source}
              onChange={(event) => setSource(event.target.value)}
              className={inputClassName}
            >
              {vertices.length === 0 ? <option value="">None</option> : null}
              {vertices.map((vertex) => (
                <option key={`source-${vertex}`} value={vertex}>
                  {vertex}
                </option>
              ))}
            </select>
          </label>
          <label className="block min-w-0">
            <span className="text-label text-[0.65rem] tracking-[0.08em]">
              Destination vertex
            </span>
            <select
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              className={inputClassName}
            >
              {vertices.length === 0 ? <option value="">None</option> : null}
              {vertices.map((vertex) => (
                <option key={`dest-${vertex}`} value={vertex}>
                  {vertex}
                </option>
              ))}
            </select>
          </label>
        </div>

        <Fieldset legend="Graph mode">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              size="sm"
              variant={!snapshot.directed ? 'secondary' : 'outline'}
              aria-pressed={!snapshot.directed}
              onClick={() => handleMode({ directed: false })}
            >
              Undirected
            </Button>
            <Button
              type="button"
              size="sm"
              variant={snapshot.directed ? 'secondary' : 'outline'}
              aria-pressed={snapshot.directed}
              onClick={() => handleMode({ directed: true })}
            >
              Directed
            </Button>
            <Button
              type="button"
              size="sm"
              variant={snapshot.weighted ? 'secondary' : 'outline'}
              aria-pressed={snapshot.weighted}
              onClick={() => handleMode({ weighted: true })}
            >
              Weighted
            </Button>
            <Button
              type="button"
              size="sm"
              variant={!snapshot.weighted ? 'secondary' : 'outline'}
              aria-pressed={!snapshot.weighted}
              onClick={() => handleMode({ weighted: false })}
            >
              Unweighted (cost 1)
            </Button>
          </div>
          <p className="mt-2 text-body-sm text-muted-foreground">
            {snapshot.weighted
              ? 'Weights are shown on each edge. Unweighted mode stores 1 on every edge, which is the case BFS already solves by hop count.'
              : 'Every edge currently costs 1. Turn Weighted on to compare unequal costs.'}
          </p>
        </Fieldset>

        <div className="grid gap-4 lg:grid-cols-2">
          <Fieldset legend="Vertices">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <label className="block min-w-0 flex-1">
                <span className="text-label text-[0.65rem] tracking-[0.08em]">
                  Vertex id
                </span>
                <input
                  value={vertexInput}
                  onChange={(event) => setVertexInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleAddVertex()
                  }}
                  placeholder="e.g. F"
                  className={inputClassName}
                />
              </label>
              <Button type="button" size="sm" onClick={handleAddVertex}>
                Add vertex
              </Button>
            </div>
            <label className="mt-3 block">
              <span className="text-label text-[0.65rem] tracking-[0.08em]">
                Selected vertex
              </span>
              <select
                value={selectedVertex ?? ''}
                onChange={(event) => setSelectedVertex(event.target.value || null)}
                className={inputClassName}
              >
                <option value="">None</option>
                {vertices.map((vertex) => (
                  <option key={vertex} value={vertex}>
                    {vertex}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" onClick={handleRemoveVertex}>
                Remove vertex
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => nudgeSelected(0, -0.06)}>
                Nudge up
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => nudgeSelected(0, 0.06)}>
                Nudge down
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => nudgeSelected(-0.06, 0)}>
                Nudge left
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => nudgeSelected(0.06, 0)}>
                Nudge right
              </Button>
            </div>
          </Fieldset>

          <Fieldset legend="Weighted edges">
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="block">
                <span className="text-label text-[0.65rem] tracking-[0.08em]">
                  From
                </span>
                <input
                  value={fromInput}
                  onChange={(event) => setFromInput(event.target.value)}
                  className={inputClassName}
                />
              </label>
              <label className="block">
                <span className="text-label text-[0.65rem] tracking-[0.08em]">
                  To
                </span>
                <input
                  value={toInput}
                  onChange={(event) => setToInput(event.target.value)}
                  className={inputClassName}
                />
              </label>
            </div>
            {snapshot.weighted ? (
              <label className="mt-2 block">
                <span className="text-label text-[0.65rem] tracking-[0.08em]">
                  Weight (0 or greater)
                </span>
                <input
                  value={weightInput}
                  onChange={(event) => setWeightInput(event.target.value)}
                  inputMode="decimal"
                  className={inputClassName}
                />
              </label>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={handleAddEdge}>
                Add or update edge
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={handleRemoveEdge}>
                Remove edge
              </Button>
            </div>
          </Fieldset>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => loadPreset('roads')}>
            Reset sample
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              applySnapshot(clear(snapshot), {})
              setActivePreset('custom')
              setMessage({ kind: 'info', text: 'Graph cleared.' })
            }}
          >
            Clear graph
          </Button>
        </div>
      </div>

      <div
        className={cn('rounded-lg border px-3 py-2 text-body-sm', feedbackClass(message.kind))}
        role="status"
      >
        {message.text}
      </div>

      <AlgorithmVisualizer
        key={playbackKey}
        title="Dijkstra's Algorithm"
        category="Graphs"
        array={[]}
        steps={steps}
        hideArray
        showLegend={false}
        showFullscreen
        showStepMeta={false}
        canvasAddon={(step) => (
          <DijkstraPanels
            step={step}
            positions={positions}
            onSelectVertex={(vertex) => {
              setSelectedVertex(vertex)
              setFromInput(vertex)
            }}
            onPositionChange={(vertex, position) => {
              setPositions((prev) => ({ ...prev, [vertex]: position }))
              setActivePreset('custom')
            }}
          />
        )}
      />
    </div>
  )
}
