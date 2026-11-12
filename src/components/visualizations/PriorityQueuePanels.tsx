import {
  parsePriorityQueueSnapshot,
  type PriorityQueuePhase,
} from '../../algorithms/data-structures/priorityQueueSteps'
import {
  leftChildIndex,
  parentIndex,
  rightChildIndex,
  type PriorityQueueMode,
} from '../../algorithms/data-structures/priorityQueue'
import { cn } from '../../lib/cn'
import type { ElementVisualState, VisualizationStep } from './types'
import { elementStateClasses } from './utils'

type PriorityQueuePanelsProps = {
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

function readNumber(
  meta: VisualizationStep['meta'],
  key: string,
): number | null {
  const value = meta?.[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function readBoolean(
  meta: VisualizationStep['meta'],
  key: string,
): boolean | null {
  const value = meta?.[key]
  return typeof value === 'boolean' ? value : null
}

function readPhase(meta: VisualizationStep['meta']): PriorityQueuePhase | null {
  const value = meta?.phase
  return typeof value === 'string' ? (value as PriorityQueuePhase) : null
}

function readMode(meta: VisualizationStep['meta']): PriorityQueueMode {
  return meta?.mode === 'max' ? 'max' : 'min'
}

function resolveElementState(
  index: number,
  meta: VisualizationStep['meta'],
): ElementVisualState {
  const phase = readPhase(meta)
  const activeIndex = readNumber(meta, 'activeIndex')
  const swapA = readNumber(meta, 'swapA')
  const swapB = readNumber(meta, 'swapB')
  const parentIdx = readNumber(meta, 'parentIndex')
  const leftIdx = readNumber(meta, 'leftIndex')
  const rightIdx = readNumber(meta, 'rightIndex')

  if (
    (swapA === index || swapB === index) &&
    (phase === 'swap' || phase === 'move-last')
  ) {
    return 'swapped'
  }
  if (
    phase === 'compare' &&
    (index === activeIndex ||
      index === parentIdx ||
      index === leftIdx ||
      index === rightIdx)
  ) {
    return 'compared'
  }
  if (phase === 'peek' && index === 0) {
    return 'found'
  }
  if (
    (phase === 'focus-root' || phase === 'extract-root') &&
    index === 0
  ) {
    return 'found'
  }
  if (phase === 'append' && index === activeIndex) {
    return 'moving'
  }
  if (phase === 'complete' && index === activeIndex) {
    return 'found'
  }
  if (index === activeIndex) {
    return 'active'
  }
  if (index === 0) {
    return 'candidate'
  }
  return 'default'
}

type TreeNode = {
  index: number
  item: string
  priority: number
  depth: number
}

function collectNodes(
  entries: readonly { item: string; priority: number }[],
): TreeNode[] {
  return entries.map((entry, index) => ({
    index,
    item: entry.item,
    priority: entry.priority,
    depth: index === 0 ? 0 : Math.floor(Math.log2(index + 1)),
  }))
}

function levelsFromNodes(nodes: TreeNode[]): TreeNode[][] {
  const levels: TreeNode[][] = []
  for (const node of nodes) {
    if (!levels[node.depth]) {
      levels[node.depth] = []
    }
    levels[node.depth].push(node)
  }
  return levels
}

/**
 * Synchronized heap-tree + array views for the Priority Queue playground.
 * Each node shows the task label and its priority; root is the next removal.
 */
export function PriorityQueuePanels({
  step,
  className,
}: PriorityQueuePanelsProps) {
  const meta = step?.meta
  const snapshot = parsePriorityQueueSnapshot(
    typeof meta?.pqSnapshot === 'string'
      ? meta.pqSnapshot
      : '{"entries":[],"mode":"min","nextSequence":0}',
  )
  const entries = snapshot.entries
  const mode = readMode(meta)
  const phase = readPhase(meta)
  const activeIndex = readNumber(meta, 'activeIndex')
  const validHeap = readBoolean(meta, 'validHeap')
  const message = readString(meta, 'message')
  const nextItem = readString(meta, 'nextItem')
  const nextPriority = readNumber(meta, 'nextPriority')
  const nodes = collectNodes(entries)
  const levels = levelsFromNodes(nodes)

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-label text-[0.65rem] tracking-[0.08em]">
          {mode === 'min' ? 'Min priority queue' : 'Max priority queue'} · heap
          + array
        </p>
        <p className="font-mono text-[0.7rem] text-muted-foreground">
          size {entries.length}
          {validHeap !== null
            ? ` · property ${validHeap ? 'ok' : 'broken'}`
            : ''}
          {phase ? ` · ${phase}` : ''}
        </p>
      </div>

      <div
        className={cn(
          'rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2',
          'text-body-sm text-sky-950 dark:text-sky-100',
        )}
        aria-live="polite"
      >
        {nextItem !== null && nextPriority !== null ? (
          <>
            Next to remove:{' '}
            <span className="font-medium">
              {nextItem} (priority {nextPriority})
            </span>
          </>
        ) : (
          'Next to remove: (empty queue)'
        )}
        <span className="mt-1 block text-[0.75rem] opacity-90">
          {mode === 'min'
            ? 'Min mode: smaller priority numbers leave first.'
            : 'Max mode: larger priority numbers leave first.'}
        </span>
      </div>

      <div
        className={cn(
          'overflow-x-auto rounded-lg border border-border/70 bg-muted/30 px-3 py-4',
          'dark:bg-muted/15',
        )}
        role="img"
        aria-label={`${mode} priority queue heap with ${entries.length} nodes`}
      >
        {entries.length === 0 ? (
          <p className="py-6 text-center text-body-sm text-muted-foreground">
            Empty priority queue — enqueue a task to begin.
          </p>
        ) : (
          <div className="mx-auto flex min-w-max flex-col items-center gap-3 sm:gap-4">
            {levels.map((level, depth) => (
              <div
                key={`pq-level-${depth}`}
                className="flex items-start justify-center gap-3 sm:gap-5"
                style={{
                  paddingInline: `${Math.max(0, (levels.length - 1 - depth) * 0.75)}rem`,
                }}
              >
                {level.map((node) => {
                  const state = resolveElementState(node.index, meta)
                  const parent =
                    node.index > 0 ? parentIndex(node.index) : null
                  const left = leftChildIndex(node.index)
                  const right = rightChildIndex(node.index)

                  return (
                    <div
                      key={`node-${node.index}`}
                      className="flex w-[5.5rem] flex-col items-center gap-1 sm:w-[6.5rem]"
                    >
                      <span
                        className={cn(
                          'flex min-h-14 w-full flex-col items-center justify-center rounded-md border px-1.5 py-1 text-center',
                          'transition-[border-color,background-color,box-shadow,opacity] duration-200',
                          'motion-reduce:transition-none',
                          elementStateClasses[state],
                        )}
                        title={`index ${node.index}${parent !== null ? ` · parent ${parent}` : ''}${left < entries.length ? ` · left ${left}` : ''}${right < entries.length ? ` · right ${right}` : ''}`}
                      >
                        <span className="line-clamp-2 text-[0.65rem] font-medium leading-tight sm:text-xs">
                          {node.item}
                        </span>
                        <span className="mt-0.5 font-mono text-[0.65rem] opacity-80">
                          p={node.priority}
                        </span>
                      </span>
                      <span className="font-mono text-[0.6rem] text-muted-foreground">
                        [{node.index}]
                        {node.index === 0 ? ' next' : ''}
                      </span>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}

        <p className="mt-3 text-center text-[0.7rem] text-muted-foreground">
          Underlying binary heap in level order · equal priorities use FIFO
        </p>
      </div>

      <div>
        <p className="mb-2 text-label text-[0.65rem] tracking-[0.08em]">
          Underlying heap array
        </p>
        <div
          className="flex flex-wrap items-end gap-1.5"
          role="list"
          aria-label="Priority queue heap array cells"
        >
          {entries.length === 0 ? (
            <span className="font-mono text-sm text-muted-foreground">[]</span>
          ) : (
            entries.map((entry, index) => {
              const state = resolveElementState(index, meta)
              return (
                <div
                  key={`cell-${index}`}
                  className="flex w-[4.75rem] flex-col items-center gap-1 sm:w-[5.25rem]"
                  role="listitem"
                >
                  <span
                    className={cn(
                      'flex min-h-12 w-full flex-col items-center justify-center rounded-md border px-1 py-1 text-center',
                      'transition-[border-color,background-color,box-shadow] duration-200',
                      'motion-reduce:transition-none',
                      elementStateClasses[state],
                      activeIndex === index && 'scale-105',
                    )}
                  >
                    <span className="line-clamp-2 text-[0.6rem] font-medium leading-tight">
                      {entry.item}
                    </span>
                    <span className="font-mono text-[0.65rem] opacity-80">
                      {entry.priority}
                    </span>
                  </span>
                  <span className="font-mono text-[0.6rem] text-muted-foreground">
                    {index}
                  </span>
                </div>
              )
            })
          )}
        </div>
        <p className="mt-2 font-mono text-[0.65rem] text-muted-foreground">
          parent = ⌊(i−1)/2⌋ · left = 2i+1 · right = 2i+2
        </p>
      </div>

      {message ? (
        <p
          className="rounded-md border border-border/60 bg-surface/80 px-3 py-2 text-body-sm text-muted-foreground"
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}
    </div>
  )
}
