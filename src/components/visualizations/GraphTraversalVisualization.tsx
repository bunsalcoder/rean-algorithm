import { useMemo, useState } from 'react'
import {
  GRAPH_SAMPLE_PRESETS,
  GRAPH_SOCIAL_NETWORK,
  getVertices,
  snapshotFromSeed,
  type GraphSnapshot,
  type VertexId,
} from '../../algorithms/data-structures/graph'
import {
  breadthFirstSearch,
  buildBfsSteps,
} from '../../algorithms/graphs/breadthFirstSearch'
import {
  buildDfsSteps,
  depthFirstSearch,
} from '../../algorithms/graphs/depthFirstSearch'
import {
  GRAPH_TRAVERSAL_DEMO,
  GRAPH_TRAVERSAL_DEMO_LAYOUT,
  type TraversalMode,
} from '../../algorithms/graphs/traversalShared'
import { cn } from '../../lib/cn'
import { Button } from '../ui'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import { GraphTraversalPanels } from './GraphTraversalPanels'
import {
  SAMPLE_LAYOUTS,
  autoLayoutPositions,
  type GraphPositions,
} from './graphLayout'

type ViewMode = 'bfs' | 'dfs' | 'compare'

const TRAVERSAL_PRESETS = [
  {
    id: 'demo',
    label: 'Traversal demo',
    description: 'Cyclic undirected graph with isolated F.',
    seed: GRAPH_TRAVERSAL_DEMO,
    layout: GRAPH_TRAVERSAL_DEMO_LAYOUT,
  },
  {
    id: 'social',
    label: 'Social network',
    description: GRAPH_SAMPLE_PRESETS.find((p) => p.id === 'social')!
      .description,
    seed: GRAPH_SOCIAL_NETWORK,
    layout: SAMPLE_LAYOUTS.social ?? {},
  },
  {
    id: 'website',
    label: 'Website links',
    description: GRAPH_SAMPLE_PRESETS.find((p) => p.id === 'website')!
      .description,
    seed: GRAPH_SAMPLE_PRESETS.find((p) => p.id === 'website')!.seed,
    layout: SAMPLE_LAYOUTS.website ?? {},
  },
  {
    id: 'roads',
    label: 'City roads',
    description: GRAPH_SAMPLE_PRESETS.find((p) => p.id === 'roads')!
      .description,
    seed: GRAPH_SAMPLE_PRESETS.find((p) => p.id === 'roads')!.seed,
    layout: SAMPLE_LAYOUTS.roads ?? {},
  },
] as const

function ComparisonTable({
  bfsOrder,
  dfsOrder,
}: {
  bfsOrder: readonly string[]
  dfsOrder: readonly string[]
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="min-w-full text-left text-body-sm">
        <caption className="sr-only">
          Side-by-side comparison of BFS and DFS
        </caption>
        <thead className="bg-muted/50 text-label text-[0.65rem] tracking-[0.08em] text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">Aspect</th>
            <th className="px-3 py-2 font-medium">BFS</th>
            <th className="px-3 py-2 font-medium">DFS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          <tr>
            <td className="px-3 py-2 text-muted-foreground">Data structure</td>
            <td className="px-3 py-2 font-mono text-foreground">Queue (FIFO)</td>
            <td className="px-3 py-2 font-mono text-foreground">Stack / recursion (LIFO)</td>
          </tr>
          <tr>
            <td className="px-3 py-2 text-muted-foreground">Strategy</td>
            <td className="px-3 py-2 text-foreground">Level by level</td>
            <td className="px-3 py-2 text-foreground">Deep path, then backtrack</td>
          </tr>
          <tr>
            <td className="px-3 py-2 text-muted-foreground">Typical uses</td>
            <td className="px-3 py-2 text-foreground">
              Shortest path (unweighted), levels, crawling
            </td>
            <td className="px-3 py-2 text-foreground">
              Cycles, mazes, components, dependencies
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2 text-muted-foreground">Complexity</td>
            <td className="px-3 py-2 font-mono text-foreground">O(V + E) time / O(V) space</td>
            <td className="px-3 py-2 font-mono text-foreground">O(V + E) time / O(V) space</td>
          </tr>
          <tr>
            <td className="px-3 py-2 text-muted-foreground">Order (this run)</td>
            <td className="px-3 py-2 font-mono text-foreground">
              [{bfsOrder.join(', ') || '—'}]
            </td>
            <td className="px-3 py-2 font-mono text-foreground">
              [{dfsOrder.join(', ') || '—'}]
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

/**
 * Interactive BFS / DFS / side-by-side comparison playground.
 * Graph configuration is shared across modes so learners can switch freely.
 */
export function GraphTraversalVisualization() {
  const [viewMode, setViewMode] = useState<ViewMode>('bfs')
  const [snapshot, setSnapshot] = useState<GraphSnapshot>(() =>
    snapshotFromSeed(GRAPH_TRAVERSAL_DEMO),
  )
  const [positions, setPositions] = useState<GraphPositions>(
    () => ({ ...GRAPH_TRAVERSAL_DEMO_LAYOUT }),
  )
  const [activePreset, setActivePreset] = useState<string>('demo')
  const [startVertex, setStartVertex] = useState<VertexId>('A')
  const [mode, setMode] = useState<TraversalMode>('reachable')

  const vertices = useMemo(() => getVertices(snapshot), [snapshot])

  const bfsSteps = useMemo(
    () => buildBfsSteps(snapshot, startVertex, mode),
    [snapshot, startVertex, mode],
  )
  const dfsSteps = useMemo(
    () => buildDfsSteps(snapshot, startVertex, mode),
    [snapshot, startVertex, mode],
  )

  const bfsOrder = useMemo(
    () =>
      breadthFirstSearch(snapshot, { start: startVertex, mode }).order,
    [snapshot, startVertex, mode],
  )
  const dfsOrder = useMemo(
    () => depthFirstSearch(snapshot, { start: startVertex, mode }).order,
    [snapshot, startVertex, mode],
  )

  const loadPreset = (presetId: string) => {
    const preset = TRAVERSAL_PRESETS.find((item) => item.id === presetId)
    if (!preset) return
    const next = snapshotFromSeed(preset.seed)
    const nextVertices = getVertices(next)
    setSnapshot(next)
    setPositions(autoLayoutPositions(nextVertices, { ...preset.layout }))
    setActivePreset(presetId)
    setStartVertex(nextVertices[0] ?? '')
  }

  const ensureStart = (vertex: string) => {
    if (vertices.includes(vertex)) {
      setStartVertex(vertex)
    }
  }

  const sharedControls = (
    <div className="space-y-4 rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20">
      <div>
        <p className="text-label text-[0.65rem] tracking-[0.08em]">View</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {(
            [
              { id: 'bfs', label: 'BFS' },
              { id: 'dfs', label: 'DFS' },
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
          Starting vertex
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {vertices.length === 0 ? (
            <p className="text-body-sm text-muted-foreground">No vertices</p>
          ) : (
            vertices.map((vertex) => (
              <Button
                key={vertex}
                type="button"
                variant={startVertex === vertex ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => ensureStart(vertex)}
                aria-pressed={startVertex === vertex}
              >
                {vertex}
              </Button>
            ))
          )}
        </div>
      </div>

      <div>
        <p className="text-label text-[0.65rem] tracking-[0.08em]">
          Disconnected mode
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            variant={mode === 'reachable' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setMode('reachable')}
            aria-pressed={mode === 'reachable'}
          >
            Reachable only
          </Button>
          <Button
            type="button"
            variant={mode === 'all-components' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setMode('all-components')}
            aria-pressed={mode === 'all-components'}
          >
            All components
          </Button>
        </div>
        <p className="mt-1.5 text-body-sm text-muted-foreground">
          Reachable stops after the start component. All components resumes
          from the next unvisited vertex in insertion order.
        </p>
      </div>

      <div>
        <p className="text-label text-[0.65rem] tracking-[0.08em]">Graph</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {TRAVERSAL_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              variant={activePreset === preset.id ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => loadPreset(preset.id)}
              aria-pressed={activePreset === preset.id}
              title={preset.description}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <p className="mt-1.5 text-body-sm text-muted-foreground">
          Neighbors are always explored in sorted id order so BFS/DFS orders
          stay deterministic for the same graph and start.
        </p>
      </div>
    </div>
  )

  if (viewMode === 'compare') {
    return (
      <div className="space-y-4">
        <p
          className={cn(
            'rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2',
            'text-body-sm text-sky-950 dark:text-sky-100',
          )}
          role="note"
        >
          Same graph and start for both algorithms. Switch to BFS or DFS for
          full step playback; the table below summarizes how their orders
          differ on this configuration.
        </p>

        {sharedControls}

        <ComparisonTable bfsOrder={bfsOrder} dfsOrder={dfsOrder} />

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2 rounded-xl border border-border bg-surface p-3 shadow-sm">
            <p className="text-label text-[0.65rem] tracking-[0.08em] text-sky-700 dark:text-sky-300">
              BFS · FIFO queue
            </p>
            <AlgorithmVisualizer
              key={`cmp-bfs-${activePreset}-${startVertex}-${mode}`}
              title="BFS comparison"
              category="Graphs"
              array={[]}
              steps={bfsSteps}
              hideArray
              showLegend={false}
              showFullscreen
              canvasAddon={(step) => (
                <GraphTraversalPanels
                  step={step}
                  positions={positions}
                  compact
                />
              )}
            />
          </div>
          <div className="space-y-2 rounded-xl border border-border bg-surface p-3 shadow-sm">
            <p className="text-label text-[0.65rem] tracking-[0.08em] text-violet-700 dark:text-violet-300">
              DFS · stack / path
            </p>
            <AlgorithmVisualizer
              key={`cmp-dfs-${activePreset}-${startVertex}-${mode}`}
              title="DFS comparison"
              category="Graphs"
              array={[]}
              steps={dfsSteps}
              hideArray
              showLegend={false}
              showFullscreen
              canvasAddon={(step) => (
                <GraphTraversalPanels
                  step={step}
                  positions={positions}
                  compact
                />
              )}
            />
          </div>
        </div>
      </div>
    )
  }

  const steps = viewMode === 'bfs' ? bfsSteps : dfsSteps
  const title = viewMode === 'bfs' ? 'BFS in action' : 'DFS in action'

  return (
    <div className="space-y-4">
      <p
        className={cn(
          'rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2',
          'text-body-sm text-sky-950 dark:text-sky-100',
        )}
        role="note"
      >
        {viewMode === 'bfs'
          ? 'BFS uses a FIFO queue: dequeue the front, enqueue undiscovered neighbors at the rear, and expand level by level.'
          : 'DFS uses a stack (or recursion): push to go deeper, pop to backtrack when a vertex has no unvisited neighbors left.'}{' '}
        Use step controls to move forward and backward. Switching BFS ↔ DFS ↔
        Compare keeps this graph and start vertex.
      </p>

      <AlgorithmVisualizer
        key={`${viewMode}-${activePreset}-${startVertex}-${mode}`}
        title={title}
        category="Graphs"
        array={[]}
        steps={steps}
        hideArray
        showLegend={false}
        showFullscreen
        inputSlot={sharedControls}
        canvasAddon={(step) => (
          <GraphTraversalPanels step={step} positions={positions} />
        )}
      />
    </div>
  )
}
