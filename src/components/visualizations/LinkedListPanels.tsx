import {
  parseNodesSnapshot,
  type SinglyLinkedListPhase,
} from '../../algorithms/data-structures/singlyLinkedListSteps'
import type { ListNodeSnapshot } from '../../algorithms/data-structures/singlyLinkedList'
import { cn } from '../../lib/cn'
import type { ElementVisualState, VisualizationStep } from './types'
import { elementStateClasses } from './utils'

type LinkedListPanelsProps = {
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
): SinglyLinkedListPhase | null {
  const value = meta?.phase
  return typeof value === 'string' ? (value as SinglyLinkedListPhase) : null
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
  if (currentId === nodeId && phase === 'compare') {
    return 'compared'
  }
  if (currentId === nodeId && (phase === 'visit' || phase === 'find-tail')) {
    return 'active'
  }
  if (currentId === nodeId && phase === 'update-head') {
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

function ArrowConnector({ className }: { className?: string }) {
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

function NullBadge({ highlighted }: { highlighted: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex h-10 min-w-14 items-center justify-center rounded-md border px-2',
        'font-mono text-xs font-medium transition-theme sm:h-11 sm:min-w-16 sm:text-sm',
        highlighted
          ? 'border-amber-500 bg-amber-500/15 text-foreground ring-2 ring-amber-500/30 dark:border-amber-400 dark:bg-amber-400/15'
          : 'border-dashed border-border bg-muted/50 text-muted-foreground',
      )}
      aria-label="null terminator"
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
  node: ListNodeSnapshot
  isHead: boolean
  isTail: boolean
  label?: string
  state: ElementVisualState
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      {label || isHead ? (
        <span className="text-label text-[0.6rem] tracking-[0.08em] text-primary">
          {label ?? 'head'}
        </span>
      ) : (
        <span className="h-3" aria-hidden="true" />
      )}
      <div
        className={cn(
          'flex overflow-hidden rounded-lg border shadow-sm transition-theme',
          elementStateClasses[state],
        )}
        aria-label={`Node ${node.value}${isHead ? ', head' : ''}${isTail ? ', last node' : ''}`}
      >
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
      {isTail ? (
        <span className="text-label text-[0.55rem] tracking-[0.06em] text-muted-foreground">
          last
        </span>
      ) : (
        <span className="h-3" aria-hidden="true" />
      )}
    </div>
  )
}

function orderedChain(
  headId: string | null,
  byId: Map<string, ListNodeSnapshot>,
): ListNodeSnapshot[] {
  const ordered: ListNodeSnapshot[] = []
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
 * Linked-list chain panel: nodes with value + next, arrows, and a null terminator.
 * Reads immutable snapshot data from the current VisualizationStep meta.
 */
export function LinkedListPanels({ step, className }: LinkedListPanelsProps) {
  const meta = step?.meta
  const snapshotRaw = meta?.nodesSnapshot
  const snapshot = parseNodesSnapshot(
    typeof snapshotRaw === 'string'
      ? snapshotRaw
      : '{"headId":null,"nodes":[],"nextIdCounter":0}',
  )
  const nullHighlighted = readBoolean(meta, 'nullHighlighted', false)
  const headId = snapshot.headId
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
        aria-label="Singly linked list visualization"
      >
        <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
          Linked list
        </p>

        <div className="mt-3 overflow-x-auto pb-1">
          <div className="flex min-w-min flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="mb-3 self-center text-label text-[0.65rem] tracking-[0.08em] text-primary sm:mb-0">
              head
            </span>
            <ArrowConnector className="mb-3 sm:mb-0" />

            {chain.length === 0 && !detached ? (
              <div className="mb-3 sm:mb-0">
                <NullBadge highlighted={nullHighlighted || headId === null} />
              </div>
            ) : null}

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
                    isTail={isLast && node.nextId === null}
                    state={resolveNodeState(node.id, meta)}
                  />
                  <ArrowConnector className="mb-3 sm:mb-0" />
                </div>
              )
            })}

            {detached ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <NodeCard
                  node={detached}
                  isHead={false}
                  isTail={detached.nextId === null}
                  label="new"
                  state={resolveNodeState(detached.id, meta)}
                />
                {detached.nextId === null ? (
                  <ArrowConnector className="mb-3 sm:mb-0" />
                ) : null}
              </div>
            ) : null}

            {chain.length > 0 || detached ? (
              <div className="mb-3 flex flex-col items-center gap-1 sm:mb-0">
                <span className="h-3" aria-hidden="true" />
                <NullBadge highlighted={nullHighlighted} />
                <span className="h-3" aria-hidden="true" />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
