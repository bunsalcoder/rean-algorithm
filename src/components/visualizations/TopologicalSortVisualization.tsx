import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  addEdge,
  addVertex,
  getEdges,
  getVertices,
  removeEdge,
  removeVertex,
  snapshotFromSeed,
  type GraphSnapshot,
  type VertexId,
} from '../../algorithms/data-structures/graph'
import {
  buildDfsTopoSteps,
  topologicalSortDfs,
} from '../../algorithms/graphs/topologicalSortDfs'
import {
  buildKahnSteps,
  topologicalSortKahn,
} from '../../algorithms/graphs/topologicalSortKahn'
import {
  TOPO_PRESETS,
  type TopoPreset,
} from '../../algorithms/graphs/topologicalSortShared'
import { cn } from '../../lib/cn'
import { Button } from '../ui'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import { autoLayoutPositions, type GraphPositions } from './graphLayout'
import { TopologicalSortPanels } from './TopologicalSortPanels'

type ViewMode = 'kahn' | 'dfs' | 'compare'

const inputClassName = cn(
  'mt-1 w-full rounded-md border border-border bg-surface px-3 py-2',
  'text-sm text-foreground shadow-sm transition-theme',
  'placeholder:text-muted-foreground',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
)

function feedbackClass(kind: 'ok' | 'error' | 'info'): string {
  if (kind === 'error') {
    return 'border-rose-500/30 bg-rose-500/10 text-rose-950 dark:text-rose-100'
  }
  if (kind === 'ok') {
    return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100'
  }
  return 'border-border bg-muted/40 text-muted-foreground'
}

function formatOrder(order: readonly string[], status: string): string {
  if (status === 'undirected') return 'Rejected'
  if (status === 'cycle') return 'Cycle — no order'
  if (order.length === 0) return '[]'
  return order.join(', ')
}

function ComparisonTable({
  kahnOrder,
  dfsOrder,
  kahnStatus,
  dfsStatus,
}: {
  kahnOrder: readonly string[]
  dfsOrder: readonly string[]
  kahnStatus: string
  dfsStatus: string
}) {
  const bothSorted = kahnStatus === 'sorted' && dfsStatus === 'sorted'
  const same =
    bothSorted &&
    kahnOrder.length === dfsOrder.length &&
    kahnOrder.every((vertex, index) => vertex === dfsOrder[index])

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="min-w-full text-left text-body-sm">
          <caption className="sr-only">
            Kahn’s algorithm compared with DFS topological sort on the same graph
          </caption>
          <thead className="bg-muted/50 text-label text-[0.65rem] tracking-[0.08em] text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Aspect</th>
              <th className="px-3 py-2 font-medium">Kahn</th>
              <th className="px-3 py-2 font-medium">DFS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr>
              <td className="px-3 py-2 text-muted-foreground">Works by</td>
              <td className="px-3 py-2 text-foreground">
                Indegree and a FIFO queue
              </td>
              <td className="px-3 py-2 text-foreground">
                Recursion, then reverse the finishing list
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 text-muted-foreground">Places a vertex</td>
              <td className="px-3 py-2 text-foreground">
                When it is dequeued (indegree already 0)
              </td>
              <td className="px-3 py-2 text-foreground">
                After its outgoing edges finish, then the list is reversed
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 text-muted-foreground">Tie-break</td>
              <td className="px-3 py-2 text-foreground">
                Sources in insertion order, neighbors in sorted id order
              </td>
              <td className="px-3 py-2 text-foreground">
                Roots in insertion order, neighbors in sorted id order
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 text-muted-foreground">Cycle</td>
              <td className="px-3 py-2 text-foreground">
                Queue empty before every vertex is placed
              </td>
              <td className="px-3 py-2 text-foreground">
                Back edge to a vertex still on the active path
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 text-muted-foreground">Complexity</td>
              <td className="px-3 py-2 font-mono text-foreground">
                O(V + E) time, O(V) space
              </td>
              <td className="px-3 py-2 font-mono text-foreground">
                O(V + E) time, O(V) space
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 text-muted-foreground">This run</td>
              <td className="px-3 py-2 font-mono text-foreground">
                {formatOrder(kahnOrder, kahnStatus)}
              </td>
              <td className="px-3 py-2 font-mono text-foreground">
                {formatOrder(dfsOrder, dfsStatus)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-body-sm text-muted-foreground">
        {kahnStatus === 'undirected'
          ? 'An undirected edge does not say which endpoint comes first. Both algorithms reject the graph and return an empty order.'
          : kahnStatus === 'cycle'
            ? 'A directed cycle means some vertex is still waiting on another vertex that has not been ordered. Neither algorithm returns the vertices it had already touched.'
            : same
              ? 'On this graph the two tie-breaks happen to agree. A different neighbor order could still be a valid topological order.'
              : 'These orders differ, and both are valid. Every arrow still goes from an earlier vertex to a later one. The difference is only which ready vertex each algorithm takes next.'}
      </p>
    </div>
  )
}

function graphSignature(snapshot: GraphSnapshot): string {
  const edges = getEdges(snapshot)
    .map((edge) => `${edge.from}->${edge.to}`)
    .join(',')
  return `${snapshot.directed ? 'd' : 'u'}:${snapshot.vertices.join('|')}:${edges}`
}

/**
 * Playground for Kahn’s algorithm and DFS topological sort.
 * The same directed graph drives both players. Playback frames are immutable.
 */
export function TopologicalSortVisualization() {
  const initial = TOPO_PRESETS[0]!
  const [viewMode, setViewMode] = useState<ViewMode>('kahn')
  const [snapshot, setSnapshot] = useState<GraphSnapshot>(() =>
    snapshotFromSeed(initial.seed),
  )
  const [positions, setPositions] = useState<GraphPositions>(() => ({
    ...initial.layout,
  }))
  const [activePreset, setActivePreset] = useState(initial.id)
  const [vertexInput, setVertexInput] = useState('')
  const [selectedVertex, setSelectedVertex] = useState<VertexId | null>(
    initial.seed.vertices[0] ?? null,
  )
  const [fromInput, setFromInput] = useState(initial.seed.vertices[0] ?? '')
  const [toInput, setToInput] = useState(initial.seed.vertices[2] ?? '')
  const [message, setMessage] = useState<{
    kind: 'ok' | 'error' | 'info'
    text: string
  }>({
    kind: 'info',
    text: 'Edge A → B means A comes before B. Only a directed acyclic graph has a topological order.',
  })

  const vertices = useMemo(() => getVertices(snapshot), [snapshot])
  const signature = graphSignature(snapshot)

  const kahnSteps = useMemo(() => buildKahnSteps(snapshot), [snapshot])
  const dfsSteps = useMemo(() => buildDfsTopoSteps(snapshot), [snapshot])
  const kahnResult = useMemo(() => topologicalSortKahn(snapshot), [snapshot])
  const dfsResult = useMemo(() => topologicalSortDfs(snapshot), [snapshot])

  const applySnapshot = (next: GraphSnapshot, layout?: GraphPositions) => {
    const nextVertices = getVertices(next)
    setSnapshot(next)
    setPositions(autoLayoutPositions(nextVertices, layout ?? positions))
    if (selectedVertex && !nextVertices.includes(selectedVertex)) {
      setSelectedVertex(nextVertices[0] ?? null)
    }
    if (!nextVertices.includes(fromInput)) {
      setFromInput(nextVertices[0] ?? '')
    }
    if (!nextVertices.includes(toInput)) {
      setToInput(nextVertices[1] ?? nextVertices[0] ?? '')
    }
  }

  const loadPreset = (preset: TopoPreset) => {
    const next = snapshotFromSeed(preset.seed)
    const nextVertices = getVertices(next)
    setActivePreset(preset.id)
    setSnapshot(next)
    setPositions(autoLayoutPositions(nextVertices, { ...preset.layout }))
    setSelectedVertex(nextVertices[0] ?? null)
    setFromInput(nextVertices[0] ?? '')
    setToInput(nextVertices[1] ?? nextVertices[0] ?? '')
    setMessage({ kind: 'ok', text: preset.description })
  }

  const handleAddVertex = () => {
    const result = addVertex(snapshot, vertexInput)
    if (!result.ok) {
      setMessage({
        kind: 'error',
        text: result.reason ?? 'Could not add that vertex.',
      })
      return
    }
    if (!result.changed) {
      setMessage({
        kind: 'info',
        text: `"${vertexInput.trim()}" is already in the graph.`,
      })
      return
    }
    const id = vertexInput.trim()
    applySnapshot(result.snapshot)
    setSelectedVertex(id)
    setVertexInput('')
    setActivePreset('custom')
    setMessage({ kind: 'ok', text: `Added vertex ${id}.` })
  }

  const handleRemoveVertex = () => {
    if (!selectedVertex) {
      setMessage({ kind: 'error', text: 'Choose a vertex to remove.' })
      return
    }
    const result = removeVertex(snapshot, selectedVertex)
    if (!result.ok) {
      setMessage({
        kind: 'error',
        text: result.reason ?? 'Could not remove that vertex.',
      })
      return
    }
    const removed = selectedVertex
    applySnapshot(result.snapshot)
    setSelectedVertex(null)
    setActivePreset('custom')
    setMessage({
      kind: 'ok',
      text: `Removed ${removed} and every edge that touched it.`,
    })
  }

  const handleAddEdge = () => {
    const result = addEdge(snapshot, fromInput, toInput)
    if (!result.ok) {
      setMessage({
        kind: 'error',
        text: result.reason ?? 'Could not add that edge.',
      })
      return
    }
    applySnapshot(result.snapshot)
    setActivePreset('custom')
    const from = fromInput.trim()
    const to = toInput.trim()
    setMessage({
      kind: result.changed ? 'ok' : 'info',
      text: result.changed
        ? snapshot.directed
          ? `Added ${from} → ${to}. ${from} must come before ${to}.`
          : `Added ${from} — ${to}. This graph is undirected, so both algorithms will reject it.`
        : 'That edge is already there.',
    })
  }

  const handleRemoveEdge = () => {
    const result = removeEdge(snapshot, fromInput, toInput)
    if (!result.ok) {
      setMessage({
        kind: 'error',
        text: result.reason ?? 'That edge is not in the graph.',
      })
      return
    }
    applySnapshot(result.snapshot)
    setActivePreset('custom')
    setMessage({
      kind: 'ok',
      text: `Removed ${fromInput.trim()} ${snapshot.directed ? '→' : '—'} ${toInput.trim()}.`,
    })
  }

  const editor = (
    <div className="space-y-4 rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20">
      <div>
        <p className="text-label text-[0.65rem] tracking-[0.08em]">Algorithm</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {(
            [
              { id: 'kahn', label: "Kahn's algorithm" },
              { id: 'dfs', label: 'DFS-based' },
              { id: 'compare', label: 'Compare' },
            ] as const
          ).map((item) => (
            <Button
              key={item.id}
              type="button"
              variant={viewMode === item.id ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setViewMode(item.id)}
              aria-pressed={viewMode === item.id}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-label text-[0.65rem] tracking-[0.08em]">
          Sample graphs
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {TOPO_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              variant={activePreset === preset.id ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => loadPreset(preset)}
              aria-pressed={activePreset === preset.id}
              title={preset.description}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <p className="mt-1.5 text-body-sm text-muted-foreground">
          An arrow A → B means A must come before B. Course, build, task, and
          package samples are DAGs. The cycle and self-loop samples are not.
          Neighbors are processed in sorted id order so each run is reproducible.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <fieldset className="space-y-2">
          <legend className="text-label text-[0.65rem] tracking-[0.08em]">
            Vertices
          </legend>
          <label className="block min-w-0">
            <span className="text-label text-[0.65rem] tracking-[0.08em]">
              New vertex
            </span>
            <input
              value={vertexInput}
              onChange={(event) => setVertexInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleAddVertex()
              }}
              placeholder="e.g. Review"
              className={inputClassName}
            />
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" size="sm" onClick={handleAddVertex}>
              Add vertex
            </Button>
          </div>
          <label className="block min-w-0">
            <span className="text-label text-[0.65rem] tracking-[0.08em]">
              Remove
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
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleRemoveVertex}
          >
            Remove vertex
          </Button>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-label text-[0.65rem] tracking-[0.08em]">
            Directed edges
          </legend>
          {vertices.length === 0 ? (
            <p className="text-body-sm text-muted-foreground">
              Add a vertex before adding an edge.
            </p>
          ) : (
            <>
              <label className="block min-w-0">
                <span className="text-label text-[0.65rem] tracking-[0.08em]">
                  Comes first
                </span>
                <select
                  value={fromInput}
                  onChange={(event) => setFromInput(event.target.value)}
                  className={inputClassName}
                >
                  {vertices.map((vertex) => (
                    <option key={`from-${vertex}`} value={vertex}>
                      {vertex}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block min-w-0">
                <span className="text-label text-[0.65rem] tracking-[0.08em]">
                  Comes later
                </span>
                <select
                  value={toInput}
                  onChange={(event) => setToInput(event.target.value)}
                  className={inputClassName}
                >
                  {vertices.map((vertex) => (
                    <option key={`to-${vertex}`} value={vertex}>
                      {vertex}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
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
            </>
          )}
          <p className="text-body-sm text-muted-foreground">
            {snapshot.directed
              ? `${fromInput || '…'} → ${toInput || '…'} means ${fromInput || 'the source'} is a prerequisite of ${toInput || 'the target'}.`
              : 'This sample is undirected. Adding an edge keeps it undirected, and both algorithms reject it.'}
          </p>
        </fieldset>
      </div>
    </div>
  )

  const player = (mode: 'kahn' | 'dfs', sideBySide: boolean) => {
    const steps = mode === 'kahn' ? kahnSteps : dfsSteps
    return (
      <AlgorithmVisualizer
        key={`${mode}-${signature}`}
        title={mode === 'kahn' ? "Kahn's algorithm" : 'DFS topological sort'}
        category="Graphs"
        array={[]}
        steps={steps}
        hideArray
        showLegend={false}
        showFullscreen
        showStepMeta={false}
        inputSlot={sideBySide ? null : editor}
        canvasAddon={(step) => (
          <TopologicalSortPanels
            step={step}
            positions={positions}
            compact={sideBySide}
          />
        )}
      />
    )
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
        Topological sorting orders a directed acyclic graph so every edge
        points forward. Kahn’s algorithm uses a queue of zero-indegree
        vertices, the same FIFO idea as{' '}
        <Link
          to="/learn/graph-traversal"
          className="font-medium underline underline-offset-2"
        >
          BFS
        </Link>
        . The DFS version records a vertex after its outgoing edges, then
        reverses that finishing list. Use the step controls to move backward
        and forward. The graph itself is never edited by the algorithm.
      </p>

      <div
        className={cn('rounded-lg border px-3 py-2 text-body-sm', feedbackClass(message.kind))}
        role="status"
      >
        {message.text}
      </div>

      {viewMode === 'compare' ? (
        <div className="space-y-4">
          {editor}
          <ComparisonTable
            kahnOrder={kahnResult.order}
            dfsOrder={dfsResult.order}
            kahnStatus={kahnResult.status}
            dfsStatus={dfsResult.status}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2 rounded-xl border border-border bg-surface p-3 shadow-sm">
              <p className="text-label text-[0.65rem] tracking-[0.08em] text-sky-700 dark:text-sky-300">
                Kahn · queue and indegree
              </p>
              {player('kahn', true)}
            </div>
            <div className="space-y-2 rounded-xl border border-border bg-surface p-3 shadow-sm">
              <p className="text-label text-[0.65rem] tracking-[0.08em] text-violet-700 dark:text-violet-300">
                DFS · path, finish, reverse
              </p>
              {player('dfs', true)}
            </div>
          </div>
        </div>
      ) : (
        player(viewMode, false)
      )}
    </div>
  )
}
