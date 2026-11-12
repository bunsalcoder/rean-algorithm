import {
  decodeIdList,
  decodeWordList,
  parseTreeSnapshot,
  type TriePhase,
} from '../../algorithms/data-structures/trieSteps'
import type {
  TrieNodeSnapshot,
  TrieSnapshot,
} from '../../algorithms/data-structures/trie'
import { cn } from '../../lib/cn'
import type { VisualizationStep } from './types'

type TriePanelsProps = {
  step: VisualizationStep | undefined
  className?: string
}

type LayoutNode = {
  id: string
  char: string
  depth: number
  x: number
  childIds: string[]
  isEndOfWord: boolean
}

const NODE_SIZE = 36
const LEVEL_GAP = 76
const H_PADDING = 28
const V_PADDING = 28

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
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function readPhase(meta: VisualizationStep['meta']): TriePhase | null {
  const value = meta?.phase
  return typeof value === 'string' ? (value as TriePhase) : null
}

/**
 * Layout multi-way trie by leaf-count weighting so shared prefixes stay
 * visually centered above their branches.
 */
function layoutTrie(snapshot: TrieSnapshot): LayoutNode[] {
  const byId = new Map(snapshot.nodes.map((node) => [node.id, node]))
  const leafWeight = new Map<string, number>()

  function weight(id: string): number {
    const cached = leafWeight.get(id)
    if (cached !== undefined) {
      return cached
    }
    const node = byId.get(id)
    if (!node || node.children.length === 0) {
      leafWeight.set(id, 1)
      return 1
    }
    let total = 0
    for (const edge of node.children) {
      total += weight(edge.childId)
    }
    total = Math.max(total, 1)
    leafWeight.set(id, total)
    return total
  }

  weight(snapshot.rootId)

  const laid: LayoutNode[] = []

  function place(id: string, depth: number, left: number, right: number) {
    const node = byId.get(id)
    if (!node) {
      return
    }
    const mid = (left + right) / 2
    laid.push({
      id: node.id,
      char: node.char,
      depth,
      x: mid,
      childIds: node.children.map((e) => e.childId),
      isEndOfWord: node.isEndOfWord,
    })

    let cursor = left
    const span = right - left
    const total = weight(id)
    for (const edge of node.children) {
      const w = weight(edge.childId)
      const childSpan = (w / total) * span
      place(edge.childId, depth + 1, cursor, cursor + childSpan)
      cursor += childSpan
    }
  }

  place(snapshot.rootId, 0, 0, 1)
  return laid
}

function nodeTone(options: {
  id: string
  rootId: string | null
  activeId: string | null
  pathIds: readonly string[]
  insertId: string | null
  deleteId: string | null
  focusId: string | null
  phase: TriePhase | null
  isEndOfWord: boolean
}): string {
  const {
    id,
    rootId,
    activeId,
    pathIds,
    insertId,
    deleteId,
    focusId,
    phase,
    isEndOfWord,
  } = options

  if (
    deleteId === id &&
    (phase === 'prune-node' || phase === 'unmark-end' || phase === 'follow-char')
  ) {
    return 'border-rose-500/60 bg-rose-500/20 text-foreground ring-2 ring-rose-500/30'
  }
  if (insertId === id || (phase === 'create-node' && activeId === id)) {
    return 'border-emerald-500/60 bg-emerald-500/20 text-foreground ring-2 ring-emerald-500/30'
  }
  if (
    (phase === 'found' || phase === 'mark-end' || phase === 'prefix-found') &&
    (focusId === id || activeId === id)
  ) {
    return 'border-emerald-500/60 bg-emerald-500/20 text-foreground ring-2 ring-emerald-500/30'
  }
  if (activeId === id || focusId === id) {
    return 'border-amber-500/60 bg-amber-500/20 text-foreground ring-2 ring-amber-500/30'
  }
  if (pathIds.includes(id)) {
    return 'border-sky-500/50 bg-sky-500/15 text-foreground'
  }
  if (rootId === id) {
    return 'border-primary/50 bg-primary/10 text-foreground'
  }
  if (isEndOfWord) {
    return 'border-violet-500/45 bg-violet-500/10 text-foreground'
  }
  return 'border-border bg-surface text-foreground'
}

function edgeClass(
  fromId: string,
  toId: string,
  pathIds: readonly string[],
  activeId: string | null,
): string {
  const onPath =
    pathIds.includes(fromId) &&
    (pathIds.includes(toId) || activeId === toId)
  return onPath ? 'stroke-sky-500/70' : 'stroke-border'
}

/**
 * Educational Trie panels: multi-way tree with end-of-word markers,
 * shared-prefix path highlights, and operation status.
 */
export function TriePanels({ step, className }: TriePanelsProps) {
  const meta = step?.meta
  const snapshot = parseTreeSnapshot(readString(meta, 'treeSnapshot') ?? '')
  const phase = readPhase(meta)
  const activeId = readString(meta, 'activeId')
  const rootId = readString(meta, 'rootId') ?? snapshot.rootId
  const pathIds = decodeIdList(meta?.pathIds)
  const insertId = readString(meta, 'insertId')
  const deleteId = readString(meta, 'deleteId')
  const focusId = readString(meta, 'focusId')
  const result = readString(meta, 'result')
  const message = readString(meta, 'message')
  const currentChar = readString(meta, 'currentChar')
  const operand = readString(meta, 'operand')
  const treeHeight = readNumber(meta, 'treeHeight')
  const treeSize = readNumber(meta, 'treeSize')
  const words = decodeWordList(meta?.wordList)
  const endMarkerIds = new Set(decodeIdList(meta?.endMarkerIds))

  const layout = layoutTrie(snapshot)
  const byId = new Map(snapshot.nodes.map((node) => [node.id, node]))
  const maxDepth = layout.reduce((max, node) => Math.max(max, node.depth), 0)
  const width = Math.max(320, layout.length * 56 + H_PADDING * 2)
  const heightPx = Math.max(160, (maxDepth + 1) * LEVEL_GAP + V_PADDING * 2)

  const positionOf = new Map(
    layout.map((node) => [
      node.id,
      {
        cx: H_PADDING + node.x * (width - H_PADDING * 2),
        cy: V_PADDING + node.depth * LEVEL_GAP + NODE_SIZE / 2,
      },
    ]),
  )

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-label text-[0.65rem] tracking-[0.08em]">
          Trie (prefix tree)
        </p>
        <p className="font-mono text-[0.7rem] text-muted-foreground">
          words={treeSize ?? snapshot.wordCount}
          {' · '}
          height={treeHeight ?? '—'}
          {operand ? ` · key="${operand}"` : ''}
          {currentChar ? ` · char='${currentChar}'` : ''}
        </p>
      </div>

      <div
        className={cn(
          'overflow-x-auto rounded-lg border border-border/70 bg-muted/30',
          'dark:bg-muted/15',
        )}
        role="img"
        aria-label="Trie diagram with character nodes and end-of-word markers"
      >
        <div className="relative mx-auto" style={{ width, height: heightPx }}>
          <svg
            width={width}
            height={heightPx}
            className="absolute inset-0"
            aria-hidden="true"
          >
            {layout.map((node) => {
              const from = positionOf.get(node.id)
              if (!from) {
                return null
              }
              return (
                <g key={`edges-${node.id}`}>
                  {node.childIds.map((childId) => {
                    const to = positionOf.get(childId)
                    const child = byId.get(childId)
                    if (!to || !child) {
                      return null
                    }
                    const midY = (from.cy + to.cy) / 2
                    return (
                      <g key={`edge-${node.id}-${childId}`}>
                        <line
                          x1={from.cx}
                          y1={from.cy + NODE_SIZE / 2 - 2}
                          x2={to.cx}
                          y2={to.cy - NODE_SIZE / 2 + 2}
                          className={edgeClass(
                            node.id,
                            childId,
                            pathIds,
                            activeId,
                          )}
                          strokeWidth={2}
                        />
                        <text
                          x={(from.cx + to.cx) / 2}
                          y={midY}
                          textAnchor="middle"
                          className="fill-muted-foreground font-mono text-[10px]"
                        >
                          {child.char}
                        </text>
                      </g>
                    )
                  })}
                </g>
              )
            })}
          </svg>

          {layout.map((node) => {
            const pos = positionOf.get(node.id)
            const source = byId.get(node.id)
            if (!pos || !source) {
              return null
            }
            const labels: string[] = []
            if (node.id === rootId) {
              labels.push('root')
            }
            if (node.isEndOfWord || endMarkerIds.has(node.id)) {
              labels.push('EOW')
            }
            if (insertId === node.id) {
              labels.push('new')
            }
            if (deleteId === node.id) {
              labels.push('delete')
            }
            if (activeId === node.id) {
              labels.push('current')
            }

            return (
              <div
                key={node.id}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5"
                style={{ left: pos.cx, top: pos.cy }}
              >
                <span
                  className={cn(
                    'relative inline-flex size-9 items-center justify-center rounded-md border font-mono text-sm font-medium',
                    'transition-[border-color,background-color,box-shadow] duration-200',
                    'motion-reduce:transition-none',
                    nodeTone({
                      id: node.id,
                      rootId,
                      activeId,
                      pathIds,
                      insertId,
                      deleteId,
                      focusId,
                      phase,
                      isEndOfWord: node.isEndOfWord,
                    }),
                  )}
                  title={`id ${node.id}${labels.length ? ` · ${labels.join(', ')}` : ''}`}
                >
                  {node.id === rootId ? '∅' : node.char}
                  {node.isEndOfWord ? (
                    <span
                      aria-hidden="true"
                      className="absolute -right-1 -top-1 size-2.5 rounded-full border border-violet-500/70 bg-violet-500/80"
                      title="End of word"
                    />
                  ) : null}
                </span>
                {labels.length > 0 ? (
                  <span className="max-w-[4.5rem] truncate text-center font-mono text-[0.55rem] text-muted-foreground">
                    {labels.join(' · ')}
                  </span>
                ) : (
                  <span className="h-3" aria-hidden="true" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-[0.7rem] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm border border-primary/50 bg-primary/10" />
          Root
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm border border-amber-500/60 bg-amber-500/20" />
          Current
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm border border-sky-500/50 bg-sky-500/15" />
          Active path
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm border border-emerald-500/60 bg-emerald-500/20" />
          Created / found
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full border border-violet-500/70 bg-violet-500/80" />
          End of word
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm border border-rose-500/60 bg-rose-500/20" />
          Deleting / pruning
        </span>
      </div>

      {words.length > 0 ? (
        <p className="font-mono text-[0.7rem] text-muted-foreground">
          Stored:{' '}
          <span className="text-foreground">{words.join(', ')}</span>
        </p>
      ) : (
        <p className="font-mono text-[0.7rem] text-muted-foreground">
          Stored: <span className="text-foreground">(empty)</span>
        </p>
      )}

      {(message || result) && (
        <p
          className="rounded-md border border-border/70 bg-surface px-3 py-2 text-body-sm text-muted-foreground"
          aria-live="polite"
        >
          {message}
          {result ? (
            <>
              {' '}
              <span className="font-mono text-foreground">→ {result}</span>
            </>
          ) : null}
        </p>
      )}
    </div>
  )
}

/** Compact static trie preview (no step meta). */
export function TrieStaticView({
  snapshot,
  label,
  className,
}: {
  snapshot: TrieSnapshot
  label: string
  className?: string
}) {
  const fakeStep: VisualizationStep = {
    id: 'static',
    title: label,
    explanation: label,
    meta: {
      phase: 'complete',
      operation: 'list-words',
      treeSnapshot: JSON.stringify({
        rootId: snapshot.rootId,
        wordCount: snapshot.wordCount,
        nextIdCounter: snapshot.nextIdCounter,
        nodes: snapshot.nodes,
      }),
      rootId: snapshot.rootId,
      activeId: null,
      pathIds: '',
      visitedIds: '',
      focusId: null,
      insertId: null,
      deleteId: null,
      endMarkerIds: snapshot.nodes
        .filter((n: TrieNodeSnapshot) => n.isEndOfWord)
        .map((n) => n.id)
        .join(','),
      currentChar: null,
      charIndex: null,
      operand: null,
      result: null,
      success: true,
      message: label,
      treeHeight: 0,
      treeSize: snapshot.wordCount,
      wordList: '',
    },
  }

  return <TriePanels step={fakeStep} className={className} />
}
