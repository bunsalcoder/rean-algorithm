/**
 * Step generator for Priority Queue visualization.
 *
 * Each step embeds an immutable `pqSnapshot` so previous/next scrubbing
 * never mutates historical frames. Pure data — no React.
 */

import type { VisualizationStep } from '../../components/visualizations/types'
import {
  cloneSnapshot,
  compareEntries,
  formatPriorityQueue,
  isEmpty as pqIsEmpty,
  isValidPriorityQueue,
  peek as pqPeek,
  size as pqSize,
  type PriorityQueueEntry,
  type PriorityQueueMode,
  type PriorityQueueSnapshot,
} from './priorityQueue'
import {
  leftChildIndex,
  parentIndex,
  rightChildIndex,
} from './heap'

export type PriorityQueueOperation =
  | 'enqueue'
  | 'peek'
  | 'dequeue'
  | 'is-empty'
  | 'size'
  | 'clear'

export type PriorityQueuePhase =
  | 'initialize'
  | 'append'
  | 'compare'
  | 'swap'
  | 'bubble-up'
  | 'bubble-down'
  | 'focus-root'
  | 'extract-root'
  | 'move-last'
  | 'peek'
  | 'check-empty'
  | 'report-size'
  | 'clear'
  | 'underflow'
  | 'invalid'
  | 'complete'

type StepMetaFields = {
  phase: PriorityQueuePhase
  operation: PriorityQueueOperation
  pqSnapshot: string
  mode: PriorityQueueMode
  activeIndex: number | null
  parentIndex: number | null
  leftIndex: number | null
  rightIndex: number | null
  swapA: number | null
  swapB: number | null
  result: string | null
  success: boolean | null
  operandItem: string | null
  operandPriority: number | null
  nextItem: string | null
  nextPriority: number | null
  message: string
  queueSize: number
  validHeap: boolean
}

/** Serialize a snapshot for VisualizationStep.meta. */
export function serializePriorityQueueSnapshot<T>(
  snapshot: PriorityQueueSnapshot<T>,
): string {
  return JSON.stringify({
    entries: snapshot.entries.map((entry) => ({
      item: entry.item,
      priority: entry.priority,
      sequence: entry.sequence,
    })),
    mode: snapshot.mode,
    nextSequence: snapshot.nextSequence,
  })
}

/** Parse a priority-queue snapshot produced by serializePriorityQueueSnapshot. */
export function parsePriorityQueueSnapshot(
  raw: string,
): PriorityQueueSnapshot<string> {
  if (!raw) {
    return { entries: [], mode: 'min', nextSequence: 0 }
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return { entries: [], mode: 'min', nextSequence: 0 }
    }

    const record = parsed as Record<string, unknown>
    const mode: PriorityQueueMode = record.mode === 'max' ? 'max' : 'min'
    const nextSequence =
      typeof record.nextSequence === 'number' &&
      Number.isFinite(record.nextSequence)
        ? Math.max(0, Math.floor(record.nextSequence))
        : 0

    const entriesRaw = record.entries
    if (!Array.isArray(entriesRaw)) {
      return { entries: [], mode, nextSequence }
    }

    const entries: PriorityQueueEntry<string>[] = []
    for (const item of entriesRaw) {
      if (!item || typeof item !== 'object') {
        continue
      }
      const entry = item as Record<string, unknown>
      if (
        typeof entry.priority !== 'number' ||
        !Number.isFinite(entry.priority) ||
        typeof entry.sequence !== 'number' ||
        !Number.isFinite(entry.sequence)
      ) {
        continue
      }
      entries.push({
        item: String(entry.item ?? ''),
        priority: entry.priority,
        sequence: entry.sequence,
      })
    }

    return { entries, mode, nextSequence }
  } catch {
    return { entries: [], mode: 'min', nextSequence: 0 }
  }
}

function meta(fields: StepMetaFields): NonNullable<VisualizationStep['meta']> {
  return {
    phase: fields.phase,
    operation: fields.operation,
    pqSnapshot: fields.pqSnapshot,
    mode: fields.mode,
    activeIndex: fields.activeIndex,
    parentIndex: fields.parentIndex,
    leftIndex: fields.leftIndex,
    rightIndex: fields.rightIndex,
    swapA: fields.swapA,
    swapB: fields.swapB,
    result: fields.result,
    success: fields.success,
    operandItem: fields.operandItem,
    operandPriority: fields.operandPriority,
    nextItem: fields.nextItem,
    nextPriority: fields.nextPriority,
    message: fields.message,
    queueSize: fields.queueSize,
    validHeap: fields.validHeap,
  }
}

function entryLabel(entry: PriorityQueueEntry<string> | undefined): string {
  if (!entry) {
    return '(empty)'
  }
  return `${entry.item} (priority ${entry.priority})`
}

function propertyLabel(mode: PriorityQueueMode): string {
  return mode === 'min'
    ? 'parent priority ≤ children (ties: earlier sequence first)'
    : 'parent priority ≥ children (ties: earlier sequence first)'
}

function pushStep(
  steps: VisualizationStep[],
  options: {
    id: string
    title: string
    explanation: string
    detail?: string
    snapshot: PriorityQueueSnapshot<string>
    phase: PriorityQueuePhase
    operation: PriorityQueueOperation
    activeIndex?: number | null
    parentIdx?: number | null
    leftIdx?: number | null
    rightIdx?: number | null
    swapA?: number | null
    swapB?: number | null
    result?: string | null
    success?: boolean | null
    operandItem?: string | null
    operandPriority?: number | null
    message?: string
    active?: readonly number[]
    highlighted?: readonly number[]
    compared?: readonly number[]
    swapped?: readonly number[]
    moving?: readonly number[]
    found?: readonly number[]
    candidate?: readonly number[]
    complete?: boolean
    vizOperation?: VisualizationStep['operation']
  },
): void {
  const snapshot = cloneSnapshot(options.snapshot)
  const array = snapshot.entries.map((entry) => entry.priority)
  const activeIndex =
    options.activeIndex === undefined ? null : options.activeIndex
  const next = pqPeek(snapshot)

  const pointers: Array<{ index: number; label: string }> = []
  if (array.length > 0) {
    pointers.push({ index: 0, label: 'next' })
  }
  if (activeIndex !== null && activeIndex >= 0 && activeIndex < array.length) {
    if (activeIndex !== 0) {
      pointers.push({ index: activeIndex, label: 'i' })
    }
  }
  if (
    options.parentIdx !== undefined &&
    options.parentIdx !== null &&
    options.parentIdx >= 0 &&
    options.parentIdx < array.length
  ) {
    pointers.push({ index: options.parentIdx, label: 'parent' })
  }

  steps.push({
    id: options.id,
    title: options.title,
    explanation: options.explanation,
    detail: options.detail,
    array,
    active: options.active ?? (activeIndex !== null ? [activeIndex] : undefined),
    highlighted: options.highlighted,
    compared: options.compared,
    swapped: options.swapped,
    moving: options.moving,
    found: options.found,
    candidate: options.candidate,
    pointers: pointers.length > 0 ? pointers : undefined,
    operation: options.complete ? 'complete' : options.vizOperation,
    meta: meta({
      phase: options.phase,
      operation: options.operation,
      pqSnapshot: serializePriorityQueueSnapshot(snapshot),
      mode: snapshot.mode,
      activeIndex,
      parentIndex: options.parentIdx ?? null,
      leftIndex: options.leftIdx ?? null,
      rightIndex: options.rightIdx ?? null,
      swapA: options.swapA ?? null,
      swapB: options.swapB ?? null,
      result: options.result ?? null,
      success: options.success ?? null,
      operandItem: options.operandItem ?? null,
      operandPriority: options.operandPriority ?? null,
      nextItem: next ? String(next.item) : null,
      nextPriority: next ? next.priority : null,
      message: options.message ?? options.explanation,
      queueSize: array.length,
      validHeap: isValidPriorityQueue(snapshot),
    }),
  })
}

function buildInvalidEnqueueSteps(
  initial: PriorityQueueSnapshot<string>,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  pushStep(steps, {
    id: 'invalid-0',
    title: 'Invalid enqueue',
    explanation:
      'Provide a task name and a finite priority number. Zero and negatives are allowed.',
    snapshot: initial,
    phase: 'invalid',
    operation: 'enqueue',
    activeIndex: null,
    success: false,
    result: 'invalid input',
  })
  pushStep(steps, {
    id: 'invalid-done',
    title: 'No change',
    explanation: `Queue remains ${formatPriorityQueue(initial)}.`,
    snapshot: initial,
    phase: 'complete',
    operation: 'enqueue',
    activeIndex: null,
    success: false,
    result: 'invalid input',
    complete: true,
  })
  return steps
}

function buildEnqueueSteps(
  initial: PriorityQueueSnapshot<string>,
  item: string,
  priority: number,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: PriorityQueueOperation = 'enqueue'
  const mode = initial.mode

  pushStep(steps, {
    id: 'enqueue-init',
    title: 'Start enqueue',
    explanation: `Enqueue “${item}” with priority ${priority} into the ${mode} priority queue.`,
    detail: `Current: ${formatPriorityQueue(initial)}. ${propertyLabel(mode)}.`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    operandItem: item,
    operandPriority: priority,
    activeIndex: initial.entries.length > 0 ? 0 : null,
  })

  const entry: PriorityQueueEntry<string> = {
    item,
    priority,
    sequence: initial.nextSequence,
  }
  const working = [...initial.entries, entry]
  let index = working.length - 1
  let frame: PriorityQueueSnapshot<string> = {
    entries: working.map((e) => ({ ...e })),
    mode,
    nextSequence: initial.nextSequence + 1,
  }

  pushStep(steps, {
    id: 'enqueue-append',
    title: 'Append at the end',
    explanation: `Place the new entry at the next open heap slot (index ${index}). The tree stays complete.`,
    detail: `Sequence ${entry.sequence} records insertion order for FIFO ties.`,
    snapshot: frame,
    phase: 'append',
    operation,
    operandItem: item,
    operandPriority: priority,
    activeIndex: index,
    parentIdx: index > 0 ? parentIndex(index) : null,
    moving: [index],
    vizOperation: 'move',
  })

  let step = 0
  while (index > 0) {
    const parent = parentIndex(index)
    pushStep(steps, {
      id: `enqueue-compare-${step}`,
      title: 'Compare with parent',
      explanation: `Compare ${entryLabel(working[index])} at [${index}] with parent ${entryLabel(working[parent])} at [${parent}].`,
      detail:
        mode === 'min'
          ? 'Bubble up while the child has a smaller priority (or equal priority with an earlier sequence).'
          : 'Bubble up while the child has a larger priority (or equal priority with an earlier sequence).',
      snapshot: frame,
      phase: 'compare',
      operation,
      operandItem: item,
      operandPriority: priority,
      activeIndex: index,
      parentIdx: parent,
      compared: [index, parent],
      vizOperation: 'compare',
    })

    if (compareEntries(working[index], working[parent], mode) >= 0) {
      pushStep(steps, {
        id: `enqueue-settle-${step}`,
        title: 'Heap property holds',
        explanation: `No swap needed. The new entry settles at index ${index}.`,
        snapshot: frame,
        phase: 'bubble-up',
        operation,
        operandItem: item,
        operandPriority: priority,
        activeIndex: index,
        parentIdx: parent,
        success: true,
      })
      break
    }

    ;[working[index], working[parent]] = [working[parent], working[index]]
    frame = {
      entries: working.map((e) => ({ ...e })),
      mode,
      nextSequence: initial.nextSequence + 1,
    }

    pushStep(steps, {
      id: `enqueue-swap-${step}`,
      title: 'Swap with parent',
      explanation: `Swap [${index}] ↔ [${parent}] to restore the priority-queue heap order.`,
      snapshot: frame,
      phase: 'swap',
      operation,
      operandItem: item,
      operandPriority: priority,
      activeIndex: parent,
      parentIdx: parent,
      swapA: index,
      swapB: parent,
      swapped: [index, parent],
      vizOperation: 'swap',
    })

    index = parent
    step += 1
  }

  pushStep(steps, {
    id: 'enqueue-done',
    title: 'Enqueue complete',
    explanation: `Enqueued “${item}”. Queue is now ${formatPriorityQueue(frame)}. Valid heap: ${isValidPriorityQueue(frame) ? 'yes' : 'no'}.`,
    detail: 'Enqueue is O(log n) — at most one sift along the heap height.',
    snapshot: frame,
    phase: 'complete',
    operation,
    operandItem: item,
    operandPriority: priority,
    activeIndex: index,
    found: [index],
    success: true,
    result: entryLabel(entry),
    complete: true,
  })

  return steps
}

function buildPeekSteps(
  initial: PriorityQueueSnapshot<string>,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: PriorityQueueOperation = 'peek'
  const next = pqPeek(initial)

  pushStep(steps, {
    id: 'peek-init',
    title: 'Start peek',
    explanation: `Peek reads the root without removing it. Current: ${formatPriorityQueue(initial)}.`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    activeIndex: initial.entries.length > 0 ? 0 : null,
  })

  if (!next) {
    pushStep(steps, {
      id: 'peek-empty',
      title: 'Empty queue',
      explanation: 'Nothing to peek — the priority queue is empty.',
      snapshot: initial,
      phase: 'underflow',
      operation,
      activeIndex: null,
      success: false,
      result: 'empty',
    })
  } else {
    pushStep(steps, {
      id: 'peek-root',
      title: 'Read the next item',
      explanation: `Next to remove: ${entryLabel(next)}. The heap is unchanged.`,
      snapshot: initial,
      phase: 'peek',
      operation,
      activeIndex: 0,
      found: [0],
      success: true,
      result: entryLabel(next),
    })
  }

  pushStep(steps, {
    id: 'peek-done',
    title: 'Peek complete',
    explanation: next
      ? `peek() → ${entryLabel(next)}. Size still ${pqSize(initial)}.`
      : 'peek() → undefined on an empty queue.',
    snapshot: initial,
    phase: 'complete',
    operation,
    activeIndex: next ? 0 : null,
    found: next ? [0] : undefined,
    success: Boolean(next),
    result: next ? entryLabel(next) : 'empty',
    complete: true,
  })

  return steps
}

function buildDequeueSteps(
  initial: PriorityQueueSnapshot<string>,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: PriorityQueueOperation = 'dequeue'
  const mode = initial.mode

  pushStep(steps, {
    id: 'dequeue-init',
    title: 'Start dequeue',
    explanation: `Dequeue removes the ${mode === 'min' ? 'smallest' : 'largest'}-priority root. Current: ${formatPriorityQueue(initial)}.`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    activeIndex: initial.entries.length > 0 ? 0 : null,
  })

  if (pqIsEmpty(initial)) {
    pushStep(steps, {
      id: 'dequeue-underflow',
      title: 'Underflow',
      explanation: 'Cannot dequeue from an empty priority queue.',
      snapshot: initial,
      phase: 'underflow',
      operation,
      activeIndex: null,
      success: false,
      result: 'underflow',
    })
    pushStep(steps, {
      id: 'dequeue-empty-done',
      title: 'No change',
      explanation: 'Queue remains empty.',
      snapshot: initial,
      phase: 'complete',
      operation,
      activeIndex: null,
      success: false,
      result: 'underflow',
      complete: true,
    })
    return steps
  }

  const root = initial.entries[0]
  pushStep(steps, {
    id: 'dequeue-extract',
    title: 'Extract the root',
    explanation: `Save ${entryLabel(root)} — this is the next item removed by priority.`,
    snapshot: initial,
    phase: 'extract-root',
    operation,
    activeIndex: 0,
    found: [0],
    result: entryLabel(root),
  })

  if (initial.entries.length === 1) {
    const empty: PriorityQueueSnapshot<string> = {
      entries: [],
      mode,
      nextSequence: initial.nextSequence,
    }
    pushStep(steps, {
      id: 'dequeue-last',
      title: 'Queue becomes empty',
      explanation: `Removed the only entry. ${formatPriorityQueue(empty)}.`,
      snapshot: empty,
      phase: 'complete',
      operation,
      activeIndex: null,
      success: true,
      result: entryLabel(root),
      complete: true,
    })
    return steps
  }

  const last = initial.entries[initial.entries.length - 1]
  const working = initial.entries.slice(0, -1)
  working[0] = last
  let frame: PriorityQueueSnapshot<string> = {
    entries: working.map((e) => ({ ...e })),
    mode,
    nextSequence: initial.nextSequence,
  }

  pushStep(steps, {
    id: 'dequeue-move-last',
    title: 'Move last leaf to root',
    explanation: `Move ${entryLabel(last)} into index 0 and shrink the array to keep the tree complete.`,
    snapshot: frame,
    phase: 'move-last',
    operation,
    activeIndex: 0,
    swapA: 0,
    swapB: initial.entries.length - 1,
    swapped: [0],
    moving: [0],
    vizOperation: 'move',
  })

  let index = 0
  let step = 0
  while (true) {
    const left = leftChildIndex(index)
    const right = rightChildIndex(index)
    const n = working.length
    let best = index

    if (left < n) {
      pushStep(steps, {
        id: `dequeue-compare-${step}`,
        title: 'Compare with children',
        explanation: `At [${index}] ${entryLabel(working[index])} — check children to restore ${propertyLabel(mode)}.`,
        snapshot: frame,
        phase: 'compare',
        operation,
        activeIndex: index,
        parentIdx: index,
        leftIdx: left < n ? left : null,
        rightIdx: right < n ? right : null,
        compared: [index, left, ...(right < n ? [right] : [])],
        vizOperation: 'compare',
      })
    }

    if (left < n && compareEntries(working[left], working[best], mode) < 0) {
      best = left
    }
    if (right < n && compareEntries(working[right], working[best], mode) < 0) {
      best = right
    }

    if (best === index) {
      pushStep(steps, {
        id: `dequeue-settle-${step}`,
        title: 'Heap property restored',
        explanation: `No further swaps. Sift-down settles at index ${index}.`,
        snapshot: frame,
        phase: 'bubble-down',
        operation,
        activeIndex: index,
        success: true,
      })
      break
    }

    ;[working[index], working[best]] = [working[best], working[index]]
    frame = {
      entries: working.map((e) => ({ ...e })),
      mode,
      nextSequence: initial.nextSequence,
    }

    pushStep(steps, {
      id: `dequeue-swap-${step}`,
      title: 'Swap with preferred child',
      explanation: `Swap [${index}] ↔ [${best}] during sift-down.`,
      snapshot: frame,
      phase: 'swap',
      operation,
      activeIndex: best,
      swapA: index,
      swapB: best,
      swapped: [index, best],
      vizOperation: 'swap',
    })

    index = best
    step += 1
  }

  pushStep(steps, {
    id: 'dequeue-done',
    title: 'Dequeue complete',
    explanation: `Removed ${entryLabel(root)}. Queue is now ${formatPriorityQueue(frame)}. Valid heap: ${isValidPriorityQueue(frame) ? 'yes' : 'no'}.`,
    detail: 'Dequeue is O(log n). Peek would have been O(1) without removing.',
    snapshot: frame,
    phase: 'complete',
    operation,
    activeIndex: 0,
    found: frame.entries.length > 0 ? [0] : undefined,
    success: true,
    result: entryLabel(root),
    complete: true,
  })

  return steps
}

function buildIsEmptySteps(
  initial: PriorityQueueSnapshot<string>,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const empty = pqIsEmpty(initial)
  pushStep(steps, {
    id: 'empty-check',
    title: 'Check isEmpty',
    explanation: `isEmpty() → ${empty}. Size is ${pqSize(initial)}.`,
    snapshot: initial,
    phase: 'check-empty',
    operation: 'is-empty',
    activeIndex: null,
    success: true,
    result: String(empty),
  })
  pushStep(steps, {
    id: 'empty-done',
    title: 'Done',
    explanation: empty
      ? 'The priority queue has no entries.'
      : `Next item would be ${entryLabel(pqPeek(initial))}.`,
    snapshot: initial,
    phase: 'complete',
    operation: 'is-empty',
    activeIndex: empty ? null : 0,
    success: true,
    result: String(empty),
    complete: true,
  })
  return steps
}

function buildSizeSteps(
  initial: PriorityQueueSnapshot<string>,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const n = pqSize(initial)
  pushStep(steps, {
    id: 'size-report',
    title: 'Report size',
    explanation: `size() → ${n}. This is the number of entries in the underlying heap array.`,
    snapshot: initial,
    phase: 'report-size',
    operation: 'size',
    activeIndex: null,
    success: true,
    result: String(n),
  })
  pushStep(steps, {
    id: 'size-done',
    title: 'Done',
    explanation: `O(1) size check. Queue unchanged: ${formatPriorityQueue(initial)}.`,
    snapshot: initial,
    phase: 'complete',
    operation: 'size',
    activeIndex: null,
    success: true,
    result: String(n),
    complete: true,
  })
  return steps
}

function buildClearSteps(
  initial: PriorityQueueSnapshot<string>,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  pushStep(steps, {
    id: 'clear-init',
    title: 'Start clear',
    explanation: `Clear removes every entry. Current size ${pqSize(initial)}.`,
    snapshot: initial,
    phase: 'initialize',
    operation: 'clear',
    activeIndex: initial.entries.length > 0 ? 0 : null,
  })
  const emptied: PriorityQueueSnapshot<string> = {
    entries: [],
    mode: initial.mode,
    nextSequence: initial.nextSequence,
  }
  pushStep(steps, {
    id: 'clear-done',
    title: 'Cleared',
    explanation: `Queue is empty. Mode stays ${initial.mode}.`,
    snapshot: emptied,
    phase: 'complete',
    operation: 'clear',
    activeIndex: null,
    success: true,
    result: 'cleared',
    complete: true,
  })
  return steps
}

export type PriorityQueueStepOperand = {
  item: string
  priority: number
} | null

/**
 * Build a VisualizationStep sequence for a priority-queue playground operation.
 */
export function buildPriorityQueueSteps(
  snapshot: PriorityQueueSnapshot<string>,
  operation: PriorityQueueOperation,
  operand: PriorityQueueStepOperand = null,
): VisualizationStep[] {
  if (operation === 'enqueue') {
    if (
      !operand ||
      operand.item.trim() === '' ||
      !Number.isFinite(operand.priority)
    ) {
      return buildInvalidEnqueueSteps(snapshot)
    }
    return buildEnqueueSteps(snapshot, operand.item.trim(), operand.priority)
  }

  if (operation === 'peek') {
    return buildPeekSteps(snapshot)
  }

  if (operation === 'dequeue') {
    return buildDequeueSteps(snapshot)
  }

  if (operation === 'is-empty') {
    return buildIsEmptySteps(snapshot)
  }

  if (operation === 'size') {
    return buildSizeSteps(snapshot)
  }

  if (operation === 'clear') {
    return buildClearSteps(snapshot)
  }

  return buildInvalidEnqueueSteps(snapshot)
}

/** Snapshot from the final step (for apply-to-start). */
export function snapshotFromFinalStep(
  steps: readonly VisualizationStep[],
): PriorityQueueSnapshot<string> {
  if (steps.length === 0) {
    return { entries: [], mode: 'min', nextSequence: 0 }
  }
  const last = steps[steps.length - 1]
  const raw = last.meta?.pqSnapshot
  if (typeof raw === 'string') {
    return parsePriorityQueueSnapshot(raw)
  }
  return { entries: [], mode: 'min', nextSequence: 0 }
}
