import { useMemo, useState, type ReactNode } from 'react'
import {
  GRAPH_SAMPLE_PRESETS,
  GRAPH_SOCIAL_NETWORK,
  addEdge,
  addVertex,
  clear,
  formatGraph,
  getEdges,
  getNeighbors,
  getVertices,
  removeEdge,
  removeVertex,
  size,
  snapshotFromSeed,
  withMode,
  type GraphSnapshot,
  type VertexId,
} from '../../algorithms/data-structures/graph'
import { cn } from '../../lib/cn'
import { Button } from '../ui'
import { GraphPanels } from './GraphPanels'
import {
  SAMPLE_LAYOUTS,
  autoLayoutPositions,
  type GraphPosition,
  type GraphPositions,
} from './graphLayout'

function feedbackClass(kind: 'ok' | 'error' | 'info'): string {
  if (kind === 'error') {
    return 'border-red-500/30 bg-red-500/10 text-red-950 dark:text-red-100'
  }
  if (kind === 'ok') {
    return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100'
  }
  return 'border-border bg-muted/40 text-muted-foreground dark:bg-muted/20'
}

/**
 * Interactive graph playground: edit vertices/edges, switch modes, load
 * samples, and inspect synchronized adjacency list, matrix, and edge list.
 */
export function GraphVisualization() {
  const [snapshot, setSnapshot] = useState<GraphSnapshot>(() =>
    snapshotFromSeed(GRAPH_SOCIAL_NETWORK),
  )
  const [positions, setPositions] = useState<GraphPositions>(
    () => SAMPLE_LAYOUTS.social ?? {},
  )
  const [selectedVertex, setSelectedVertex] = useState<VertexId | null>('Alice')
  const [vertexInput, setVertexInput] = useState('')
  const [fromInput, setFromInput] = useState('Alice')
  const [toInput, setToInput] = useState('Eve')
  const [weightInput, setWeightInput] = useState('1')
  const [activeSample, setActiveSample] = useState<string>('social')
  const [message, setMessage] = useState<{
    kind: 'ok' | 'error' | 'info'
    text: string
  }>({
    kind: 'info',
    text: 'Drag vertices on desktop, or use the select list on any device.',
  })

  const vertices = useMemo(() => getVertices(snapshot), [snapshot])
  const edges = useMemo(() => getEdges(snapshot), [snapshot])

  const highlightEdge = useMemo(() => {
    const from = fromInput.trim()
    const to = toInput.trim()
    if (!from || !to) return null
    if (
      getNeighbors(snapshot, from).some((n) => n.to === to) ||
      (!snapshot.directed &&
        getNeighbors(snapshot, to).some((n) => n.to === from))
    ) {
      return { from, to }
    }
    return null
  }, [fromInput, toInput, snapshot])

  const applySnapshot = (
    next: GraphSnapshot,
    nextPositions?: GraphPositions,
  ) => {
    setSnapshot(next)
    setPositions(
      autoLayoutPositions(getVertices(next), nextPositions ?? positions),
    )
    if (selectedVertex && !getVertices(next).includes(selectedVertex)) {
      setSelectedVertex(null)
    }
  }

  const loadSample = (presetId: string) => {
    const preset = GRAPH_SAMPLE_PRESETS.find((item) => item.id === presetId)
    if (!preset) return
    const next = snapshotFromSeed(preset.seed)
    const layout =
      presetId in SAMPLE_LAYOUTS
        ? SAMPLE_LAYOUTS[presetId]
        : autoLayoutPositions(getVertices(next))
    setActiveSample(presetId)
    setSnapshot(next)
    setPositions(layout ?? {})
    setSelectedVertex(getVertices(next)[0] ?? null)
    setFromInput(getVertices(next)[0] ?? '')
    setToInput(getVertices(next)[1] ?? getVertices(next)[0] ?? '')
    setMessage({
      kind: 'ok',
      text: `Loaded “${preset.label}”.`,
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
    applySnapshot(result.snapshot)
    setSelectedVertex(vertexInput.trim())
    setVertexInput('')
    setMessage({
      kind: 'ok',
      text: `Added vertex "${result.snapshot.vertices.at(-1)}".`,
    })
  }

  const handleRemoveSelectedVertex = () => {
    if (!selectedVertex) {
      setMessage({ kind: 'error', text: 'Select a vertex to remove.' })
      return
    }
    const result = removeVertex(snapshot, selectedVertex)
    if (!result.ok) {
      setMessage({
        kind: 'error',
        text: result.reason ?? 'Could not remove vertex.',
      })
      return
    }
    applySnapshot(result.snapshot)
    setSelectedVertex(null)
    setMessage({
      kind: 'ok',
      text: `Removed vertex "${selectedVertex}" and its incident edges.`,
    })
  }

  const handleAddEdge = () => {
    const weight = snapshot.weighted
      ? Number(weightInput)
      : undefined
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
    setMessage({
      kind: result.changed ? 'ok' : 'info',
      text: result.changed
        ? `Edge ${fromInput.trim()} ${snapshot.directed ? '→' : '—'} ${toInput.trim()} saved.`
        : 'Edge already existed (weight unchanged).',
    })
  }

  const handleRemoveEdge = () => {
    const result = removeEdge(snapshot, fromInput, toInput)
    if (!result.ok) {
      setMessage({
        kind: 'error',
        text: result.reason ?? 'Could not remove edge.',
      })
      return
    }
    applySnapshot(result.snapshot)
    setMessage({
      kind: 'ok',
      text: `Removed edge ${fromInput.trim()} ${snapshot.directed ? '→' : '—'} ${toInput.trim()}.`,
    })
  }

  const handleModeChange = (patch: {
    directed?: boolean
    weighted?: boolean
  }) => {
    const next = withMode(snapshot, patch)
    applySnapshot(next)
    setActiveSample('custom')
    setMessage({
      kind: 'info',
      text: `Mode: ${next.directed ? 'directed' : 'undirected'}, ${next.weighted ? 'weighted' : 'unweighted'}.`,
    })
  }

  const handleClear = () => {
    applySnapshot(clear(snapshot), {})
    setSelectedVertex(null)
    setActiveSample('custom')
    setMessage({ kind: 'info', text: 'Graph cleared.' })
  }

  const handleReset = () => {
    loadSample('social')
  }

  const handlePositionChange = (vertex: VertexId, position: GraphPosition) => {
    setPositions((prev) => ({ ...prev, [vertex]: position }))
    setActiveSample('custom')
  }

  const nudgeSelected = (dx: number, dy: number) => {
    if (!selectedVertex) return
    const current = positions[selectedVertex] ?? { x: 0.5, y: 0.5 }
    handlePositionChange(selectedVertex, {
      x: Math.min(1, Math.max(0, current.x + dx)),
      y: Math.min(1, Math.max(0, current.y + dy)),
    })
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
        Build and inspect graphs as vertices and edges. Switch directed /
        undirected and weighted / unweighted modes, then watch the adjacency
        list, matrix, and edge list stay synchronized. BFS and DFS traversal
        lessons come later — this playground focuses on the structure.
      </p>

      <div className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20">
        <p className="text-body-sm text-muted-foreground" aria-live="polite">
          Graph:{' '}
          <span className="font-mono text-foreground">
            {formatGraph(snapshot)}
          </span>
          {' · '}
          |V|={size(snapshot)}
          {' · '}
          |E|={edges.length}
        </p>
      </div>

      <div className={cn('rounded-lg border px-3 py-2 text-body-sm', feedbackClass(message.kind))} role="status">
        {message.text}
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20">
        <Fieldset legend="Sample graphs">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {GRAPH_SAMPLE_PRESETS.map((preset) => (
              <Button
                key={preset.id}
                type="button"
                size="sm"
                variant={activeSample === preset.id ? 'secondary' : 'outline'}
                onClick={() => loadSample(preset.id)}
                aria-pressed={activeSample === preset.id}
                title={preset.description}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </Fieldset>

        <Fieldset legend="Graph mode">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              size="sm"
              variant={!snapshot.directed ? 'secondary' : 'outline'}
              aria-pressed={!snapshot.directed}
              onClick={() => handleModeChange({ directed: false })}
            >
              Undirected
            </Button>
            <Button
              type="button"
              size="sm"
              variant={snapshot.directed ? 'secondary' : 'outline'}
              aria-pressed={snapshot.directed}
              onClick={() => handleModeChange({ directed: true })}
            >
              Directed
            </Button>
            <Button
              type="button"
              size="sm"
              variant={!snapshot.weighted ? 'secondary' : 'outline'}
              aria-pressed={!snapshot.weighted}
              onClick={() => handleModeChange({ weighted: false })}
            >
              Unweighted
            </Button>
            <Button
              type="button"
              size="sm"
              variant={snapshot.weighted ? 'secondary' : 'outline'}
              aria-pressed={snapshot.weighted}
              onClick={() => handleModeChange({ weighted: true })}
            >
              Weighted
            </Button>
          </div>
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
                  placeholder="e.g. Frank"
                  className={inputClassName}
                />
              </label>
              <Button type="button" size="sm" onClick={handleAddVertex}>
                Add vertex
              </Button>
            </div>

            <label className="mt-3 block min-w-0">
              <span className="text-label text-[0.65rem] tracking-[0.08em]">
                Select vertex (mobile-friendly)
              </span>
              <select
                value={selectedVertex ?? ''}
                onChange={(event) =>
                  setSelectedVertex(event.target.value || null)
                }
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
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleRemoveSelectedVertex}
                disabled={!selectedVertex}
              >
                Remove selected
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => nudgeSelected(0, -0.05)}
                disabled={!selectedVertex}
                aria-label="Nudge selected vertex up"
              >
                ↑
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => nudgeSelected(0, 0.05)}
                disabled={!selectedVertex}
                aria-label="Nudge selected vertex down"
              >
                ↓
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => nudgeSelected(-0.05, 0)}
                disabled={!selectedVertex}
                aria-label="Nudge selected vertex left"
              >
                ←
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => nudgeSelected(0.05, 0)}
                disabled={!selectedVertex}
                aria-label="Nudge selected vertex right"
              >
                →
              </Button>
            </div>
          </Fieldset>

          <Fieldset legend="Edges">
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="block min-w-0">
                <span className="text-label text-[0.65rem] tracking-[0.08em]">
                  From
                </span>
                <select
                  value={fromInput}
                  onChange={(event) => setFromInput(event.target.value)}
                  className={inputClassName}
                >
                  <option value="">Select…</option>
                  {vertices.map((vertex) => (
                    <option key={`from-${vertex}`} value={vertex}>
                      {vertex}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block min-w-0">
                <span className="text-label text-[0.65rem] tracking-[0.08em]">
                  To
                </span>
                <select
                  value={toInput}
                  onChange={(event) => setToInput(event.target.value)}
                  className={inputClassName}
                >
                  <option value="">Select…</option>
                  {vertices.map((vertex) => (
                    <option key={`to-${vertex}`} value={vertex}>
                      {vertex}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {snapshot.weighted ? (
              <label className="mt-2 block max-w-[10rem]">
                <span className="text-label text-[0.65rem] tracking-[0.08em]">
                  Weight
                </span>
                <input
                  type="number"
                  step="any"
                  value={weightInput}
                  onChange={(event) => setWeightInput(event.target.value)}
                  className={inputClassName}
                />
              </label>
            ) : null}

            <div className="mt-2 flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={handleAddEdge}>
                Add edge
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
          <Button type="button" size="sm" variant="outline" onClick={handleReset}>
            Reset sample
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={handleClear}>
            Clear graph
          </Button>
        </div>
      </div>

      <GraphPanels
        snapshot={snapshot}
        positions={autoLayoutPositions(vertices, positions)}
        selectedVertex={selectedVertex}
        highlightEdge={highlightEdge}
        onSelectVertex={setSelectedVertex}
        onPositionChange={handlePositionChange}
      />
    </div>
  )
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
