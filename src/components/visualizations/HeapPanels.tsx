import {
  parseHeapSnapshot,
  type HeapPhase,
} from '../../algorithms/data-structures/heapSteps'
import {
  leftChildIndex,
  parentIndex,
  rightChildIndex,
  type HeapKind,
} from '../../algorithms/data-structures/heap'
import { cn } from '../../lib/cn'
import type { ElementVisualState, VisualizationStep } from './types'
import { elementStateClasses } from './utils'

type HeapPanelsProps = {
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

function readPhase(meta: VisualizationStep['meta']): HeapPhase | null {
  const value = meta?.phase
  return typeof value === 'string' ? (value as HeapPhase) : null
}

function readKind(meta: VisualizationStep['meta']): HeapKind {
  return meta?.kind === 'max' ? 'max' : 'min'
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
  value: number
  depth: number
}

function collectNodes(values: readonly number[]): TreeNode[] {
  return values.map((value, index) => ({
    index,
    value,
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
 * Synchronized binary-tree + array views for the Heap playground.
 * Highlights follow immutable step metadata (active index, swaps, children).
 */
export function HeapPanels({ step, className }: HeapPanelsProps) {
  const meta = step?.meta
  const snapshot = parseHeapSnapshot(
    typeof meta?.heapSnapshot === 'string'
      ? meta.heapSnapshot
      : '{"values":[],"kind":"min"}',
  )
  const values = snapshot.values
  const kind = readKind(meta)
  const phase = readPhase(meta)
  const activeIndex = readNumber(meta, 'activeIndex')
  const validHeap = readBoolean(meta, 'validHeap')
  const message = readString(meta, 'message')
  const nodes = collectNodes(values)
  const levels = levelsFromNodes(nodes)

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-label text-[0.65rem] tracking-[0.08em]">
          {kind === 'min' ? 'Min heap' : 'Max heap'} · tree + array
        </p>
        <p className="font-mono text-[0.7rem] text-muted-foreground">
          size {values.length}
          {validHeap !== null
            ? ` · property ${validHeap ? 'ok' : 'broken'}`
            : ''}
          {phase ? ` · ${phase}` : ''}
        </p>
      </div>

      <div
        className={cn(
          'overflow-x-auto rounded-lg border border-border/70 bg-muted/30 px-3 py-4',
          'dark:bg-muted/15',
        )}
        role="img"
        aria-label={`${kind} heap tree with ${values.length} nodes`}
      >
        {values.length === 0 ? (
          <p className="py-6 text-center text-body-sm text-muted-foreground">
            Empty heap — insert a value or build from an array.
          </p>
        ) : (
          <div className="mx-auto flex min-w-max flex-col items-center gap-3 sm:gap-4">
            {levels.map((level, depth) => (
              <div
                key={`heap-level-${depth}`}
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
                      className="flex flex-col items-center gap-1"
                    >
                      <span
                        className={cn(
                          'inline-flex size-9 items-center justify-center rounded-md border font-mono text-xs font-medium sm:size-10 sm:text-sm',
                          'transition-[border-color,background-color,box-shadow,opacity] duration-200',
                          'motion-reduce:transition-none',
                          elementStateClasses[state],
                        )}
                        title={`index ${node.index}${parent !== null ? ` · parent ${parent}` : ''}${left < values.length ? ` · left ${left}` : ''}${right < values.length ? ` · right ${right}` : ''}`}
                      >
                        {node.value}
                      </span>
                      <span className="font-mono text-[0.6rem] text-muted-foreground">
                        [{node.index}]
                        {node.index === 0 ? ' root' : ''}
                      </span>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}

        <p className="mt-3 text-center text-[0.7rem] text-muted-foreground">
          Complete binary tree in level order ·{' '}
          {kind === 'min' ? 'parent ≤ children' : 'parent ≥ children'}
        </p>
      </div>

      <div>
        <p className="mb-2 text-label text-[0.65rem] tracking-[0.08em]">
          Array representation
        </p>
        <div
          className="flex flex-wrap items-end gap-1.5"
          role="list"
          aria-label="Heap array cells"
        >
          {values.length === 0 ? (
            <span className="font-mono text-sm text-muted-foreground">[]</span>
          ) : (
            values.map((value, index) => {
              const state = resolveElementState(index, meta)
              return (
                <div
                  key={`cell-${index}`}
                  className="flex flex-col items-center gap-1"
                  role="listitem"
                >
                  <span
                    className={cn(
                      'inline-flex size-9 items-center justify-center rounded-md border font-mono text-xs font-medium sm:size-10 sm:text-sm',
                      'transition-[border-color,background-color,box-shadow] duration-200',
                      'motion-reduce:transition-none',
                      elementStateClasses[state],
                      activeIndex === index && 'scale-105',
                    )}
                  >
                    {value}
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
