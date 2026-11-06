import {
  parseTreeSnapshot,
  decodeIdList,
  type BinarySearchTreePhase,
} from '../../algorithms/data-structures/binarySearchTreeSteps'
import type {
  BinarySearchTreeSnapshot,
  BSTNodeSnapshot,
} from '../../algorithms/data-structures/binarySearchTree'
import { cn } from '../../lib/cn'
import type { VisualizationStep } from './types'

type BinarySearchTreePanelsProps = {
  step: VisualizationStep | undefined
  className?: string
}

type LayoutNode = {
  id: string
  value: number
  depth: number
  /** 0..1 horizontal position within the tree. */
  x: number
  leftId: string | null
  rightId: string | null
}

const NODE_SIZE = 40
const LEVEL_GAP = 72
const H_PADDING = 28
const V_PADDING = 24

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

function readPhase(
  meta: VisualizationStep['meta'],
): BinarySearchTreePhase | null {
  const value = meta?.phase
  return typeof value === 'string' ? (value as BinarySearchTreePhase) : null
}

function layoutTree(snapshot: BinarySearchTreeSnapshot): LayoutNode[] {
  if (!snapshot.rootId || snapshot.nodes.length === 0) {
    return []
  }

  const byId = new Map(snapshot.nodes.map((node) => [node.id, node]))
  const inorderIds: string[] = []

  function walkInorder(id: string | null) {
    if (!id) {
      return
    }
    const node = byId.get(id)
    if (!node) {
      return
    }
    walkInorder(node.leftId)
    inorderIds.push(id)
    walkInorder(node.rightId)
  }

  walkInorder(snapshot.rootId)

  const indexOf = new Map(inorderIds.map((id, index) => [id, index]))
  const count = Math.max(inorderIds.length, 1)
  const laid: LayoutNode[] = []

  function place(id: string | null, depth: number) {
    if (!id) {
      return
    }
    const node = byId.get(id)
    if (!node) {
      return
    }
    const index = indexOf.get(id) ?? 0
    laid.push({
      id: node.id,
      value: node.value,
      depth,
      x: (index + 0.5) / count,
      leftId: node.leftId,
      rightId: node.rightId,
    })
    place(node.leftId, depth + 1)
    place(node.rightId, depth + 1)
  }

  place(snapshot.rootId, 0)
  return laid
}

function isLeaf(node: BSTNodeSnapshot): boolean {
  return node.leftId === null && node.rightId === null
}

function nodeTone(options: {
  id: string
  rootId: string | null
  activeId: string | null
  pathIds: readonly string[]
  visitedIds: readonly string[]
  insertId: string | null
  deleteId: string | null
  successorId: string | null
  focusId: string | null
  phase: BinarySearchTreePhase | null
  leaf: boolean
}): string {
  const {
    id,
    rootId,
    activeId,
    pathIds,
    visitedIds,
    insertId,
    deleteId,
    successorId,
    focusId,
    phase,
    leaf,
  } = options

  if (insertId === id || (phase === 'insert' && activeId === id)) {
    return 'border-emerald-500/60 bg-emerald-500/20 text-foreground ring-2 ring-emerald-500/30'
  }
  if (
    deleteId === id &&
    (phase === 'unlink' ||
      phase === 'identify-case' ||
      phase === 'replace-with-child' ||
      phase === 'copy-successor' ||
      phase === 'remove-successor')
  ) {
    return 'border-rose-500/60 bg-rose-500/20 text-foreground ring-2 ring-rose-500/30'
  }
  if (successorId === id || (phase === 'find-successor' && activeId === id)) {
    return 'border-violet-500/60 bg-violet-500/20 text-foreground ring-2 ring-violet-500/30'
  }
  if (phase === 'found' && (focusId === id || activeId === id)) {
    return 'border-emerald-500/60 bg-emerald-500/20 text-foreground ring-2 ring-emerald-500/30'
  }
  if (activeId === id || focusId === id) {
    return 'border-amber-500/60 bg-amber-500/20 text-foreground ring-2 ring-amber-500/30'
  }
  if (visitedIds.includes(id)) {
    return 'border-sky-500/50 bg-sky-500/15 text-foreground'
  }
  if (pathIds.includes(id)) {
    return 'border-sky-500/40 bg-sky-500/10 text-foreground'
  }
  if (rootId === id) {
    return 'border-primary/50 bg-primary/10 text-foreground'
  }
  if (leaf) {
    return 'border-border bg-muted/50 text-foreground'
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
  return onPath
    ? 'stroke-sky-500/70'
    : 'stroke-border'
}

/**
 * Educational BST panels: labeled tree with edges, path/visit highlights,
 * and a status strip for the current operation.
 */
export function BinarySearchTreePanels({
  step,
  className,
}: BinarySearchTreePanelsProps) {
  const meta = step?.meta
  const snapshot = parseTreeSnapshot(readString(meta, 'treeSnapshot') ?? '')
  const phase = readPhase(meta)
  const activeId = readString(meta, 'activeId')
  const rootId = readString(meta, 'rootId') ?? snapshot.rootId
  const pathIds = decodeIdList(meta?.pathIds)
  const visitedIds = decodeIdList(meta?.visitedIds)
  const insertId = readString(meta, 'insertId')
  const deleteId = readString(meta, 'deleteId')
  const successorId = readString(meta, 'successorId')
  const focusId = readString(meta, 'focusId')
  const caseKind = readString(meta, 'caseKind')
  const result = readString(meta, 'result')
  const message = readString(meta, 'message')
  const treeHeight = readNumber(meta, 'treeHeight')
  const treeSize = readNumber(meta, 'treeSize')
  const operand = readNumber(meta, 'operand')

  const layout = layoutTree(snapshot)
  const byId = new Map(snapshot.nodes.map((node) => [node.id, node]))
  const maxDepth = layout.reduce((max, node) => Math.max(max, node.depth), 0)
  const width = Math.max(320, layout.length * 64 + H_PADDING * 2)
  const heightPx = Math.max(140, (maxDepth + 1) * LEVEL_GAP + V_PADDING * 2)

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
          Binary search tree
        </p>
        <p className="font-mono text-[0.7rem] text-muted-foreground">
          size={treeSize ?? snapshot.nodes.length}
          {' · '}
          height={treeHeight ?? '—'}
          {operand !== null ? ` · value=${operand}` : ''}
          {caseKind ? ` · case=${caseKind}` : ''}
        </p>
      </div>

      <div
        className={cn(
          'overflow-x-auto rounded-lg border border-border/70 bg-muted/30',
          'dark:bg-muted/15',
        )}
        role="img"
        aria-label="Binary search tree diagram"
      >
        {layout.length === 0 ? (
          <div className="flex min-h-[8rem] items-center justify-center px-4 py-8">
            <p className="font-mono text-sm text-muted-foreground">
              empty tree (height = -1)
            </p>
          </div>
        ) : (
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
                    {node.leftId
                      ? (() => {
                          const to = positionOf.get(node.leftId)
                          if (!to) {
                            return null
                          }
                          return (
                            <line
                              x1={from.cx}
                              y1={from.cy + NODE_SIZE / 2 - 4}
                              x2={to.cx}
                              y2={to.cy - NODE_SIZE / 2 + 4}
                              className={edgeClass(
                                node.id,
                                node.leftId,
                                pathIds,
                                activeId,
                              )}
                              strokeWidth={2}
                            />
                          )
                        })()
                      : null}
                    {node.rightId
                      ? (() => {
                          const to = positionOf.get(node.rightId)
                          if (!to) {
                            return null
                          }
                          return (
                            <line
                              x1={from.cx}
                              y1={from.cy + NODE_SIZE / 2 - 4}
                              x2={to.cx}
                              y2={to.cy - NODE_SIZE / 2 + 4}
                              className={edgeClass(
                                node.id,
                                node.rightId,
                                pathIds,
                                activeId,
                              )}
                              strokeWidth={2}
                            />
                          )
                        })()
                      : null}
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
              const leaf = isLeaf(source)
              const labels: string[] = []
              if (node.id === rootId) {
                labels.push('root')
              }
              if (leaf) {
                labels.push('leaf')
              }
              if (insertId === node.id) {
                labels.push('inserted')
              }
              if (deleteId === node.id) {
                labels.push('delete')
              }
              if (successorId === node.id) {
                labels.push('successor')
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
                      'inline-flex size-10 items-center justify-center rounded-md border font-mono text-sm font-medium',
                      'transition-[border-color,background-color,box-shadow] duration-200',
                      'motion-reduce:transition-none',
                      nodeTone({
                        id: node.id,
                        rootId,
                        activeId,
                        pathIds,
                        visitedIds,
                        insertId,
                        deleteId,
                        successorId,
                        focusId,
                        phase,
                        leaf,
                      }),
                    )}
                    title={`id ${node.id}${labels.length ? ` · ${labels.join(', ')}` : ''}`}
                  >
                    {node.value}
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
        )}
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
          Path / visited
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm border border-emerald-500/60 bg-emerald-500/20" />
          Inserted / found
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm border border-rose-500/60 bg-rose-500/20" />
          Deleting
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm border border-violet-500/60 bg-violet-500/20" />
          Successor
        </span>
      </div>

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

/** Compact static tree for the shape explorer (no step meta). */
export function BinarySearchTreeStaticView({
  snapshot,
  label,
  className,
}: {
  snapshot: BinarySearchTreeSnapshot
  label: string
  className?: string
}) {
  const layout = layoutTree(snapshot)
  const maxDepth = layout.reduce((max, node) => Math.max(max, node.depth), 0)
  const width = Math.max(220, layout.length * 52 + H_PADDING * 2)
  const heightPx = Math.max(120, (maxDepth + 1) * 56 + V_PADDING * 2)
  const positionOf = new Map(
    layout.map((node) => [
      node.id,
      {
        cx: H_PADDING + node.x * (width - H_PADDING * 2),
        cy: V_PADDING + node.depth * 56 + 18,
      },
    ]),
  )

  return (
    <div className={cn('min-w-0', className)}>
      <p className="mb-2 text-label text-[0.65rem] tracking-[0.08em]">{label}</p>
      <div
        className={cn(
          'overflow-x-auto rounded-lg border border-border/70 bg-muted/30 px-2 py-3',
          'dark:bg-muted/15',
        )}
      >
        {layout.length === 0 ? (
          <p className="px-2 py-6 text-center font-mono text-xs text-muted-foreground">
            empty
          </p>
        ) : (
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
                  <g key={`s-edges-${node.id}`}>
                    {node.leftId && positionOf.get(node.leftId) ? (
                      <line
                        x1={from.cx}
                        y1={from.cy + 14}
                        x2={positionOf.get(node.leftId)!.cx}
                        y2={positionOf.get(node.leftId)!.cy - 14}
                        className="stroke-border"
                        strokeWidth={1.5}
                      />
                    ) : null}
                    {node.rightId && positionOf.get(node.rightId) ? (
                      <line
                        x1={from.cx}
                        y1={from.cy + 14}
                        x2={positionOf.get(node.rightId)!.cx}
                        y2={positionOf.get(node.rightId)!.cy - 14}
                        className="stroke-border"
                        strokeWidth={1.5}
                      />
                    ) : null}
                  </g>
                )
              })}
            </svg>
            {layout.map((node) => {
              const pos = positionOf.get(node.id)
              if (!pos) {
                return null
              }
              return (
                <span
                  key={node.id}
                  className={cn(
                    'absolute inline-flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center',
                    'rounded-md border border-border bg-surface font-mono text-xs font-medium',
                    node.id === snapshot.rootId &&
                      'border-primary/50 bg-primary/10',
                  )}
                  style={{ left: pos.cx, top: pos.cy }}
                >
                  {node.value}
                </span>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
