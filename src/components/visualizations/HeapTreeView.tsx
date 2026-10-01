import { cn } from '../../lib/cn'
import type { ElementVisualState, ResolvedArrayElement } from './types'
import { elementStateClasses } from './utils'

type HeapTreeViewProps = {
  elements: readonly ResolvedArrayElement[]
  /** Number of elements still in the active heap (prefix of the array). */
  heapSize: number
  className?: string
}

type TreeNode = {
  index: number
  value: number
  state: ElementVisualState
  depth: number
  left?: TreeNode
  right?: TreeNode
}

function buildTree(
  elements: readonly ResolvedArrayElement[],
  heapSize: number,
  index: number,
  depth: number,
): TreeNode | undefined {
  if (index >= elements.length) {
    return undefined
  }

  const element = elements[index]
  const inHeap = index < heapSize

  return {
    index,
    value: element.value,
    state: inHeap ? element.state : element.state === 'sorted' ? 'sorted' : 'eliminated',
    depth,
    left: buildTree(elements, heapSize, 2 * index + 1, depth + 1),
    right: buildTree(elements, heapSize, 2 * index + 2, depth + 1),
  }
}

function collectByDepth(root: TreeNode | undefined): TreeNode[][] {
  if (!root) {
    return []
  }

  const levels: TreeNode[][] = []
  const queue: TreeNode[] = [root]

  while (queue.length > 0) {
    const size = queue.length
    const level: TreeNode[] = []

    for (let i = 0; i < size; i += 1) {
      const node = queue.shift()
      if (!node) {
        continue
      }
      level.push(node)
      if (node.left) {
        queue.push(node.left)
      }
      if (node.right) {
        queue.push(node.right)
      }
    }

    levels.push(level)
  }

  return levels
}

/**
 * Compact binary-heap tree view for Heap Sort.
 * Shows the same values as the array, limited to a small lesson-sized input.
 */
export function HeapTreeView({
  elements,
  heapSize,
  className,
}: HeapTreeViewProps) {
  const clampedHeapSize = Math.min(Math.max(heapSize, 0), elements.length)
  const root = buildTree(elements, clampedHeapSize, 0, 0)
  const levels = collectByDepth(root)

  if (elements.length === 0 || !root) {
    return null
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-label text-[0.65rem] tracking-[0.08em]">
          Heap tree
        </p>
        <p className="font-mono text-[0.7rem] text-muted-foreground">
          heapSize: {clampedHeapSize}
          {clampedHeapSize < elements.length
            ? ` · sorted: ${elements.length - clampedHeapSize}`
            : ''}
        </p>
      </div>

      <div
        className={cn(
          'overflow-x-auto rounded-lg border border-border/70 bg-muted/30 px-3 py-4',
          'dark:bg-muted/15',
        )}
        role="img"
        aria-label={`Binary heap tree with heap size ${clampedHeapSize}`}
      >
        <div className="mx-auto flex min-w-max flex-col items-center gap-3 sm:gap-4">
          {levels.map((level, depth) => (
            <div
              key={`level-${depth}`}
              className="flex items-start justify-center gap-3 sm:gap-5"
              style={{
                paddingInline: `${Math.max(0, (levels.length - 1 - depth) * 0.75)}rem`,
              }}
            >
              {level.map((node) => {
                const isOutsideHeap = node.index >= clampedHeapSize

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
                        elementStateClasses[node.state],
                        isOutsideHeap && 'opacity-70',
                      )}
                      title={`index ${node.index}`}
                    >
                      {node.value}
                    </span>
                    <span className="font-mono text-[0.6rem] text-muted-foreground">
                      [{node.index}]
                      {node.index === 0 && clampedHeapSize > 0 ? ' root' : ''}
                    </span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <p className="mt-3 text-center text-[0.7rem] text-muted-foreground">
          Same values as the array below · parent ≥ children in the active heap
        </p>
      </div>
    </div>
  )
}
