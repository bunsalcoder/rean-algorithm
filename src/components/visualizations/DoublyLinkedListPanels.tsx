import {
  parseNodesSnapshot,
  type DoublyLinkedListPhase,
} from '../../algorithms/data-structures/doublyLinkedListSteps'
import type { DoublyListNodeSnapshot } from '../../algorithms/data-structures/doublyLinkedList'
import { cn } from '../../lib/cn'
import type { ElementVisualState, VisualizationStep } from './types'
import { elementStateClasses } from './utils'

type DoublyLinkedListPanelsProps = {
  step: VisualizationStep | undefined
  className?: string
}

function readString(
  meta: VisualizationStep['meta'],
  key: string,
): string | null {
  const value = meta?.[key]
  return typeof value === 'string' ? value : null
}

function readBoolean(
  meta: VisualizationStep['meta'],
  key: string,
  fallback = false,
): boolean {
  const value = meta?.[key]
  return typeof value === 'boolean' ? value : fallback
}

function readPhase(
  meta: VisualizationStep['meta'],
): DoublyLinkedListPhase | null {
  const value = meta?.phase
  return typeof value === 'string' ? (value as DoublyLinkedListPhase) : null
}

function resolveNodeState(
  nodeId: string,
  meta: VisualizationStep['meta'],
): ElementVisualState {
  const currentId = readString(meta, 'currentId')
  const focusId = readString(meta, 'focusId')
  const previousId = readString(meta, 'previousId')
  const phase = readPhase(meta)

  if (
    focusId === nodeId &&
    (phase === 'create-node' || phase === 'link' || phase === 'unlink')
  ) {
    return 'moving'
  }
  if (currentId === nodeId && (phase === 'compare' || phase === 'find-target')) {
    return 'compared'
  }
  if (currentId === nodeId && phase === 'visit') {
    return 'active'
  }
  if (
    currentId === nodeId &&
    (phase === 'update-head' || phase === 'update-tail')
  ) {
    return 'found'
  }
  if (focusId === nodeId) {
    return 'highlighted'
  }
  if (previousId === nodeId) {
    return 'candidate'
  }
  if (currentId === nodeId) {
    return 'active'
  }
  return 'default'
}

function BidirectionalArrow({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center text-muted-foreground',
        className,
      )}
    >
      <svg viewBox="0 0 44 14" className="h-3.5 w-9 sm:w-11" fill="none">
        <path
          d="M6 7h32M10 3L4 7l6 4M34 3l6 4-6 4"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

function ForwardArrow({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center text-muted-foreground',
        className,
      )}
    >
      <svg viewBox="0 0 40 12" className="h-3 w-8 sm:w-10" fill="none">
        <path
          d="M0 6h32M28 2l6 4-6 4"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

function BackwardArrow({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center text-muted-foreground',
        className,
      )}
    >
      <svg viewBox="0 0 40 12" className="h-3 w-8 sm:w-10" fill="none">
        <path
          d="M40 6H8M12 2L6 6l6 4"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

function NullBadge({
  highlighted,
  side,
}: {
  highlighted: boolean
  side: 'left' | 'right'
}) {
  return (
    <span
      className={cn(
        'inline-flex h-10 min-w-14 items-center justify-center rounded-md border px-2',
        'font-mono text-xs font-medium transition-theme sm:h-11 sm:min-w-16 sm:text-sm',
        highlighted
          ? 'border-amber-500 bg-amber-500/15 text-foreground ring-2 ring-amber-500/30 dark:border-amber-400 dark:bg-amber-400/15'
          : 'border-dashed border-border bg-muted/50 text-muted-foreground',
      )}
      aria-label={`${side} null boundary`}
    >
      null
    </span>
  )
}

function NodeCard({
  node,
  isHead,
  isTail,
  label,
  state,
}: {
  node: DoublyListNodeSnapshot
  isHead: boolean
  isTail: boolean
  label?: string
  state: ElementVisualState
}) {
  const topLabel =
    label ?? (isHead && isTail ? 'head · tail' : isHead ? 'head' : isTail ? 'tail' : undefined)

  return (
    <div className="flex flex-col items-center gap-1">
      {topLabel ? (
        <span className="text-label text-[0.6rem] tracking-[0.08em] text-primary">
          {topLabel}
        </span>
      ) : (
        <span className="h-3" aria-hidden="true" />
      )}
      <div
        className={cn(
          'flex overflow-hidden rounded-lg border shadow-sm transition-theme',
          elementStateClasses[state],
        )}
        aria-label={`Node ${node.value}${isHead ? ', head' : ''}${isTail ? ', tail' : ''}`}
      >
        <div
          className={cn(
            'flex h-10 min-w-9 items-center justify-center border-r border-current/20',
            'px-1.5 font-mono text-[0.65rem] opacity-80 sm:h-11 sm:text-xs',
          )}
          title="prev reference"
        >
          prev
        </div>
        <div className="flex h-10 min-w-10 items-center justify-center px-2.5 font-mono text-sm font-semibold sm:h-11 sm:min-w-11 sm:text-base">
          {node.value}
        </div>
        <div
          className={cn(
            'flex h-10 min-w-9 items-center justify-center border-l border-current/20',
            'px-1.5 font-mono text-[0.65rem] opacity-80 sm:h-11 sm:text-xs',
          )}
          title="next reference"
        >
          next
        </div>
      </div>
      <span className="h-3" aria-hidden="true" />
    </div>
  )
}

function orderedChain(
  headId: string | null,
  byId: Map<string, DoublyListNodeSnapshot>,
): DoublyListNodeSnapshot[] {
  const ordered: DoublyListNodeSnapshot[] = []
  const seen = new Set<string>()
  let currentId = headId
  while (currentId !== null) {
    if (seen.has(currentId)) {
      break
    }
    seen.add(currentId)
    const node = byId.get(currentId)
    if (!node) {
      break
    }
    ordered.push(node)
    currentId = node.nextId
  }
  return ordered
}

/**
 * Doubly linked list chain panel: prev | value | next cells, bidirectional
 * arrows, head/tail labels, and null boundaries on both ends.
 */
export function DoublyLinkedListPanels({
  step,
  className,
}: DoublyLinkedListPanelsProps) {
  const meta = step?.meta
  const snapshotRaw = meta?.nodesSnapshot
  const snapshot = parseNodesSnapshot(
    typeof snapshotRaw === 'string'
      ? snapshotRaw
      : '{"headId":null,"tailId":null,"nodes":[],"nextIdCounter":0}',
  )
  const nullHighlighted = readBoolean(meta, 'nullHighlighted', false)
  const headId = snapshot.headId
  const tailId = snapshot.tailId
  const byId = new Map(snapshot.nodes.map((node) => [node.id, node]))
  const chain = orderedChain(headId, byId)
  const chainIds = new Set(chain.map((node) => node.id))

  const focusId = readString(meta, 'focusId')
  const detached =
    focusId && !chainIds.has(focusId) ? byId.get(focusId) : undefined

  return (
    <div className={cn('mb-4 space-y-3', className)}>
      <div
        className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-muted/20 sm:p-4"
        aria-label="Doubly linked list visualization"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
            Doubly linked list
          </p>
          <p className="text-[0.65rem] text-muted-foreground">
            null ← … ⇄ … → null · scroll horizontally on small screens
          </p>
        </div>

        <div className="mt-3 overflow-x-auto pb-1">
          <div className="flex min-w-min items-center gap-1.5 sm:gap-2">
            <div className="mb-3 flex flex-col items-center gap-1 sm:mb-0">
              <span className="h-3" aria-hidden="true" />
              <NullBadge
                highlighted={nullHighlighted || headId === null}
                side="left"
              />
              <span className="h-3" aria-hidden="true" />
            </div>

            <BackwardArrow className="mb-3 sm:mb-0" />

            {chain.map((node, index) => {
              const isLast = index === chain.length - 1
              return (
                <div
                  key={node.id}
                  className="flex items-center gap-1.5 sm:gap-2"
                >
                  <NodeCard
                    node={node}
                    isHead={node.id === headId}
                    isTail={node.id === tailId}
                    state={resolveNodeState(node.id, meta)}
                  />
                  {!isLast ? (
                    <BidirectionalArrow className="mb-3 sm:mb-0" />
                  ) : null}
                </div>
              )
            })}

            {detached ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {chain.length > 0 ? (
                  <BidirectionalArrow className="mb-3 opacity-50 sm:mb-0" />
                ) : null}
                <NodeCard
                  node={detached}
                  isHead={false}
                  isTail={false}
                  label="new"
                  state={resolveNodeState(detached.id, meta)}
                />
              </div>
            ) : null}

            {(chain.length > 0 || detached) && (
              <>
                <ForwardArrow className="mb-3 sm:mb-0" />
                <div className="mb-3 flex flex-col items-center gap-1 sm:mb-0">
                  <span className="h-3" aria-hidden="true" />
                  <NullBadge highlighted={nullHighlighted} side="right" />
                  <span className="h-3" aria-hidden="true" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
