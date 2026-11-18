import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
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
  FLOYD_WARSHALL_NEGATIVE_CYCLE,
  FLOYD_WARSHALL_NEGATIVE_CYCLE_LAYOUT,
  FLOYD_WARSHALL_NEGATIVE_EDGE,
  FLOYD_WARSHALL_NEGATIVE_EDGE_LAYOUT,
  FLOYD_WARSHALL_ROUTES,
  FLOYD_WARSHALL_ROUTES_LAYOUT,
  FLOYD_WARSHALL_SELF_LOOP,
  FLOYD_WARSHALL_SELF_LOOP_LAYOUT,
  FLOYD_WARSHALL_UNDIRECTED,
  FLOYD_WARSHALL_UNDIRECTED_LAYOUT,
  FLOYD_WARSHALL_ZERO,
  FLOYD_WARSHALL_ZERO_LAYOUT,
  buildFloydWarshallSteps,
  floydWarshallAnchorIndexes,
} from '../../algorithms/graphs/floydWarshall'
import { cn } from '../../lib/cn'
import { Button } from '../ui'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import { FloydWarshallPanels } from './FloydWarshallPanels'
import { autoLayoutPositions, type GraphPositions } from './graphLayout'
import type { VisualizerPlayback } from './useVisualizerPlayback'

const PRESETS = [
  {
    id: 'routes',
    label: 'Directed routes',
    description:
      'A→D improves from 20 to 11 through B, then to 8 through C. That is one intermediate vertex at a time.',
    seed: FLOYD_WARSHALL_ROUTES,
    layout: FLOYD_WARSHALL_ROUTES_LAYOUT,
    source: 'A',
    destination: 'D',
  },
  {
    id: 'undirected',
    label: 'Undirected roads',
    description:
      'Each undirected edge is stored both ways. Shortest A→D is A–C–B–D, distance 8.',
    seed: FLOYD_WARSHALL_UNDIRECTED,
    layout: FLOYD_WARSHALL_UNDIRECTED_LAYOUT,
    source: 'A',
    destination: 'D',
  },
  {
    id: 'zero',
    label: 'Zero-weight edges',
    description: 'Free hops A–B–C beat the direct edge of weight 5.',
    seed: FLOYD_WARSHALL_ZERO,
    layout: FLOYD_WARSHALL_ZERO_LAYOUT,
    source: 'A',
    destination: 'D',
  },
  {
    id: 'negative-edge',
    label: 'Negative edge',
    description:
      'C→B has weight -1 and no cycle is negative. A→D is 4. Isolated E stays ∞.',
    seed: FLOYD_WARSHALL_NEGATIVE_EDGE,
    layout: FLOYD_WARSHALL_NEGATIVE_EDGE_LAYOUT,
    source: 'A',
    destination: 'D',
  },
  {
    id: 'negative-cycle',
    label: 'Negative cycle',
    description:
      'A↔B is a negative cycle. S→C is affected. S→S and X→Y are not.',
    seed: FLOYD_WARSHALL_NEGATIVE_CYCLE,
    layout: FLOYD_WARSHALL_NEGATIVE_CYCLE_LAYOUT,
    source: 'S',
    destination: 'C',
  },
  {
    id: 'self-loop',
    label: 'Negative self-loop',
    description:
      'A loop of weight -2 puts A on a negative cycle. A→B is affected. B→B and isolated C are not.',
    seed: FLOYD_WARSHALL_SELF_LOOP,
    layout: FLOYD_WARSHALL_SELF_LOOP_LAYOUT,
    source: 'A',
    destination: 'B',
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

function graphKey(snapshot: GraphSnapshot): string {
  const edges = getEdges(snapshot)
    .map((edge) => `${edge.from}>${edge.to}:${edge.weight}`)
    .join('|')
  return `${snapshot.directed ? 'd' : 'u'}${snapshot.weighted ? 'w' : 'n'}:${snapshot.vertices.join(',')}:${edges}`
}

function retainVertex(
  vertices: readonly string[],
  current: string,
  fallbackIndex: number,
): string {
  if (vertices.includes(current)) return current
  return vertices[fallbackIndex] ?? vertices[0] ?? ''
}

function IterationJump({
  playback,
  anchors,
}: {
  playback: VisualizerPlayback
  anchors: readonly number[]
}) {
  const nextAnchor = anchors.find((index) => index > playback.stepIndex)
  const previousAnchor = [...anchors]
    .reverse()
    .find((index) => index < playback.stepIndex)

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/40 p-3 dark:bg-muted/20 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <p className="text-body-sm text-muted-foreground">
        Previous and Next move one cell. These buttons jump a whole intermediate vertex.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={previousAnchor === undefined && playback.isFirst}
          onClick={() => playback.goToStep(previousAnchor ?? 0)}
        >
          Previous k
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={nextAnchor === undefined}
          onClick={() => {
            if (nextAnchor !== undefined) playback.goToStep(nextAnchor)
          }}
        >
          Next k
        </Button>
      </div>
    </div>
  )
}

/**
 * Interactive Floyd-Warshall playground. Sample graphs and immutable matrix
 * snapshots. Source and destination only choose which path to read out.
 */
export function FloydWarshallVisualization() {
  const [snapshot, setSnapshot] = useState<GraphSnapshot>(() =>
    snapshotFromSeed(FLOYD_WARSHALL_ROUTES),
  )
  const [positions, setPositions] = useState<GraphPositions>(() => ({
    ...FLOYD_WARSHALL_ROUTES_LAYOUT,
  }))
  const [source, setSource] = useState('A')
  const [destination, setDestination] = useState('D')
  const [activePreset, setActivePreset] = useState('routes')
  const [vertexInput, setVertexInput] = useState('')
  const [fromInput, setFromInput] = useState('A')
  const [toInput, setToInput] = useState('D')
  const [weightInput, setWeightInput] = useState('1')
  const [selectedVertex, setSelectedVertex] = useState<VertexId | null>('A')
  const [message, setMessage] = useState<{
    kind: 'ok' | 'error' | 'info'
    text: string
  }>({
    kind: 'info',
    text: 'Drag a vertex to rearrange the drawing. The matrix is rebuilt from the graph, and playback can move one cell or one intermediate vertex at a time.',
  })

  const vertices = useMemo(() => getVertices(snapshot), [snapshot])
  const steps = useMemo(() => buildFloydWarshallSteps(snapshot), [snapshot])
  const anchors = useMemo(() => floydWarshallAnchorIndexes(steps), [steps])
  const playbackKey = graphKey(snapshot)

  const applySnapshot = (
    next: GraphSnapshot,
    nextPositions?: GraphPositions,
  ) => {
    const nextVertices = getVertices(next)
    setSnapshot(next)
    setPositions(autoLayoutPositions(nextVertices, nextPositions ?? positions))
    setSource((current) => retainVertex(nextVertices, current, 0))
    setDestination((current) =>
      retainVertex(nextVertices, current, Math.max(nextVertices.length - 1, 0)),
    )
    setSelectedVertex((current) =>
      current && nextVertices.includes(current)
        ? current
        : (nextVertices[0] ?? null),
    )
  }

  const loadPreset = (presetId: string) => {
    const preset = PRESETS.find((item) => item.id === presetId)
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
    setMessage({
      kind: 'ok',
      text: `Loaded “${preset.label}”. ${preset.description}`,
    })
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
    const added = vertexInput.trim()
    applySnapshot(result.snapshot)
    setSelectedVertex(added)
    setVertexInput('')
    setActivePreset('custom')
    setMessage({ kind: 'ok', text: `Added vertex "${added}".` })
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
      setMessage({
        kind: 'error',
        text: 'Enter a finite numeric weight. Negative and zero are allowed.',
      })
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

  return (
    <div className="space-y-4">
      <p
        className={cn(
          'rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2',
          'text-body-sm text-sky-950 dark:text-sky-100',
        )}
        role="note"
      >
        Floyd-Warshall fills one distance for every pair. For each intermediate
        vertex k it applies dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]).
        One control moves a single cell. Another jumps a whole k. Compare the
        single-source algorithms{' '}
        <Link
          to="/learn/dijkstra"
          className="font-medium underline underline-offset-2"
        >
          Dijkstra
        </Link>{' '}
        and{' '}
        <Link
          to="/learn/bellman-ford"
          className="font-medium underline underline-offset-2"
        >
          Bellman-Ford
        </Link>
        . Dijkstra needs non-negative weights and one source. Bellman-Ford allows
        a negative edge from one source. Floyd-Warshall answers every source at
        once and is practical when the graph is small or dense.
      </p>

      <div className="space-y-4 rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20">
        <Fieldset legend="Sample graphs">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {PRESETS.map((preset) => (
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
              Path source
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
              Path destination
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
        <p className="text-body-sm text-muted-foreground">
          Changing the path does not restart the matrix. The algorithm already
          computed every pair. The readout uses the next-hop matrix from the
          current snapshot.
        </p>

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
            {snapshot.directed
              ? 'Arrows are the only direction a path may use.'
              : 'An undirected edge is stored in both directions. A negative undirected edge is a negative cycle.'}
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
            <div className="mt-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleRemoveVertex}
              >
                Remove vertex
              </Button>
            </div>
          </Fieldset>

          <Fieldset legend="Edges">
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
                  Weight (negative, zero, or positive)
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
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleRemoveEdge}
              >
                Remove edge
              </Button>
            </div>
          </Fieldset>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => loadPreset('routes')}>
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
        className={cn(
          'rounded-lg border px-3 py-2 text-body-sm',
          feedbackClass(message.kind),
        )}
        role="status"
      >
        {message.text}
      </div>

      <AlgorithmVisualizer
        key={playbackKey}
        title="Floyd-Warshall Algorithm"
        category="Graphs"
        array={[]}
        steps={steps}
        hideArray
        showLegend={false}
        showFullscreen
        showStepMeta={false}
        controlsAddon={(playback) => (
          <IterationJump playback={playback} anchors={anchors} />
        )}
        canvasAddon={(step) => (
          <FloydWarshallPanels
            snapshot={snapshot}
            step={step}
            positions={positions}
            source={source}
            destination={destination}
            onSelectVertex={(vertex) => {
              setSelectedVertex(vertex)
              setFromInput(vertex)
            }}
            onPositionChange={(vertex, position) => {
              setPositions((current) => ({ ...current, [vertex]: position }))
              setActivePreset('custom')
            }}
          />
        )}
      />
    </div>
  )
}
