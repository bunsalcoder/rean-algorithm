/**
 * Step generator for Heap visualization.
 *
 * Each step embeds an immutable `heapSnapshot` so previous/next scrubbing
 * never mutates historical frames. Pure data — no React.
 */

import type { VisualizationStep } from '../../components/visualizations/types'
import { formatArray } from '../../components/visualizations/utils'
import {
  buildHeap as buildHeapFromArray,
  cloneSnapshot,
  comparatorFor,
  formatHeap,
  isEmpty as heapIsEmpty,
  isValidHeap,
  leftChildIndex,
  parentIndex,
  peek as heapPeek,
  preferredChildIndex,
  respectsHeapOrder,
  rightChildIndex,
  size as heapSize,
  snapshotFromArray,
  type HeapKind,
  type HeapSnapshot,
} from './heap'

export type HeapOperation =
  | 'insert'
  | 'peek'
  | 'extract'
  | 'build-heap'
  | 'is-empty'
  | 'size'
  | 'clear'

export type HeapPhase =
  | 'initialize'
  | 'append'
  | 'compare'
  | 'swap'
  | 'bubble-up'
  | 'bubble-down'
  | 'focus-root'
  | 'extract-root'
  | 'move-last'
  | 'heapify'
  | 'build-pass'
  | 'peek'
  | 'check-empty'
  | 'report-size'
  | 'clear'
  | 'underflow'
  | 'invalid'
  | 'complete'

type StepMetaFields = {
  phase: HeapPhase
  operation: HeapOperation
  heapSnapshot: string
  kind: HeapKind
  activeIndex: number | null
  parentIndex: number | null
  leftIndex: number | null
  rightIndex: number | null
  swapA: number | null
  swapB: number | null
  result: string | null
  success: boolean | null
  operand: number | null
  message: string
  heapSize: number
  validHeap: boolean
}

/** Serialize a snapshot for VisualizationStep.meta. */
export function serializeHeapSnapshot(snapshot: HeapSnapshot): string {
  return JSON.stringify({
    values: snapshot.values,
    kind: snapshot.kind,
  })
}

/** Parse a heap snapshot produced by serializeHeapSnapshot. */
export function parseHeapSnapshot(raw: string): HeapSnapshot {
  if (!raw) {
    return { values: [], kind: 'min' }
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return { values: [], kind: 'min' }
    }

    const record = parsed as Record<string, unknown>
    const kind: HeapKind = record.kind === 'max' ? 'max' : 'min'
    const valuesRaw = record.values
    if (!Array.isArray(valuesRaw)) {
      return { values: [], kind }
    }

    const values: number[] = []
    for (const item of valuesRaw) {
      if (typeof item === 'number' && Number.isFinite(item)) {
        values.push(item)
      }
    }

    return { values, kind }
  } catch {
    return { values: [], kind: 'min' }
  }
}

function meta(fields: StepMetaFields): NonNullable<VisualizationStep['meta']> {
  return {
    phase: fields.phase,
    operation: fields.operation,
    heapSnapshot: fields.heapSnapshot,
    kind: fields.kind,
    activeIndex: fields.activeIndex,
    parentIndex: fields.parentIndex,
    leftIndex: fields.leftIndex,
    rightIndex: fields.rightIndex,
    swapA: fields.swapA,
    swapB: fields.swapB,
    result: fields.result,
    success: fields.success,
    operand: fields.operand,
    message: fields.message,
    heapSize: fields.heapSize,
    validHeap: fields.validHeap,
  }
}

function pushStep(
  steps: VisualizationStep[],
  options: {
    id: string
    title: string
    explanation: string
    detail?: string
    snapshot: HeapSnapshot
    phase: HeapPhase
    operation: HeapOperation
    activeIndex?: number | null
    parentIdx?: number | null
    leftIdx?: number | null
    rightIdx?: number | null
    swapA?: number | null
    swapB?: number | null
    result?: string | null
    success?: boolean | null
    operand?: number | null
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
  const array = [...snapshot.values]
  const activeIndex =
    options.activeIndex === undefined ? null : options.activeIndex

  const pointers: Array<{ index: number; label: string }> = []
  if (array.length > 0) {
    pointers.push({ index: 0, label: 'root' })
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
    operation: options.complete
      ? 'complete'
      : options.vizOperation,
    meta: meta({
      phase: options.phase,
      operation: options.operation,
      heapSnapshot: serializeHeapSnapshot(snapshot),
      kind: snapshot.kind,
      activeIndex,
      parentIndex: options.parentIdx ?? null,
      leftIndex: options.leftIdx ?? null,
      rightIndex: options.rightIdx ?? null,
      swapA: options.swapA ?? null,
      swapB: options.swapB ?? null,
      result: options.result ?? null,
      success: options.success ?? null,
      operand: options.operand ?? null,
      message: options.message ?? options.explanation,
      heapSize: array.length,
      validHeap: isValidHeap(snapshot),
    }),
  })
}

function propertyLabel(kind: HeapKind): string {
  return kind === 'min' ? 'parent ≤ children' : 'parent ≥ children'
}

function rootLabel(kind: HeapKind): string {
  return kind === 'min' ? 'minimum' : 'maximum'
}

function buildInvalidOperandSteps(
  initial: HeapSnapshot,
  operation: HeapOperation,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  pushStep(steps, {
    id: 'invalid-0',
    title: 'Invalid input',
    explanation:
      'Enter a finite number. Zero and negatives are allowed; non-numeric input is rejected.',
    snapshot: initial,
    phase: 'invalid',
    operation,
    activeIndex: null,
    success: false,
    result: 'invalid input',
  })
  pushStep(steps, {
    id: 'invalid-done',
    title: 'No change',
    explanation: `Heap remains ${formatHeap(initial.values, initial.kind)}.`,
    snapshot: initial,
    phase: 'complete',
    operation,
    activeIndex: null,
    success: false,
    result: 'invalid input',
    complete: true,
  })
  return steps
}

function buildInsertSteps(
  initial: HeapSnapshot,
  operand: number,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: HeapOperation = 'insert'
  const compare = comparatorFor(initial.kind)
  const kind = initial.kind

  pushStep(steps, {
    id: 'insert-init',
    title: 'Start insert',
    explanation: `Insert ${operand} into the ${kind} heap. Current: ${formatHeap(initial.values, kind)}.`,
    detail: `A heap only guarantees ${propertyLabel(kind)} — it is not a fully sorted array.`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    operand,
    activeIndex: initial.values.length > 0 ? 0 : null,
  })

  const working = [...initial.values, operand]
  let index = working.length - 1
  let frame = snapshotFromArray(working, kind)

  pushStep(steps, {
    id: 'insert-append',
    title: 'Append at the end',
    explanation: `Place ${operand} at the next open level-order slot (index ${index}). The tree stays complete.`,
    detail: `Parent index = Math.floor((${index} − 1) / 2)${index > 0 ? ` = ${parentIndex(index)}` : ''}.`,
    snapshot: frame,
    phase: 'append',
    operation,
    operand,
    activeIndex: index,
    parentIdx: index > 0 ? parentIndex(index) : null,
    moving: [index],
    vizOperation: 'move',
  })

  let step = 0
  while (index > 0) {
    const parent = parentIndex(index)
    pushStep(steps, {
      id: `insert-compare-${step}`,
      title: 'Compare with parent',
      explanation: `Compare child ${working[index]} at [${index}] with parent ${working[parent]} at [${parent}].`,
      detail:
        kind === 'min'
          ? 'Bubble up while child < parent (min-heap order).'
          : 'Bubble up while child > parent (max-heap order).',
      snapshot: frame,
      phase: 'compare',
      operation,
      operand,
      activeIndex: index,
      parentIdx: parent,
      compared: [index, parent],
      vizOperation: 'compare',
    })

    if (compare(working[index], working[parent]) >= 0) {
      pushStep(steps, {
        id: `insert-settle-${step}`,
        title: 'Heap property holds',
        explanation: `No swap needed — ${propertyLabel(kind)} is satisfied here. Insert settles at index ${index}.`,
        snapshot: frame,
        phase: 'bubble-up',
        operation,
        operand,
        activeIndex: index,
        parentIdx: parent,
        success: true,
      })
      break
    }

    ;[working[index], working[parent]] = [working[parent], working[index]]
    frame = snapshotFromArray(working, kind)

    pushStep(steps, {
      id: `insert-swap-${step}`,
      title: 'Swap with parent',
      explanation: `Swap [${index}] ↔ [${parent}] to restore ${propertyLabel(kind)}.`,
      snapshot: frame,
      phase: 'swap',
      operation,
      operand,
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
    id: 'insert-done',
    title: 'Insert complete',
    explanation: `Inserted ${operand}. Heap is now ${formatHeap(working, kind)}. Valid heap: ${isValidHeap(frame) ? 'yes' : 'no'}.`,
    detail: 'Insert is O(log n) because the height of a complete binary tree is ⌊log₂ n⌋.',
    snapshot: frame,
    phase: 'complete',
    operation,
    operand,
    activeIndex: index,
    found: [index],
    success: true,
    result: String(operand),
    complete: true,
  })

  return steps
}

function buildPeekSteps(initial: HeapSnapshot): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: HeapOperation = 'peek'
  const kind = initial.kind

  pushStep(steps, {
    id: 'peek-init',
    title: 'Start peek',
    explanation: `Peek reads the root without removing it. Current: ${formatHeap(initial.values, kind)}.`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    activeIndex: initial.values.length > 0 ? 0 : null,
  })

  if (heapIsEmpty(initial)) {
    pushStep(steps, {
      id: 'peek-empty',
      title: 'Empty heap',
      explanation: 'Cannot peek — the heap has no elements.',
      snapshot: initial,
      phase: 'underflow',
      operation,
      activeIndex: null,
      success: false,
      result: 'empty',
    })
    pushStep(steps, {
      id: 'peek-empty-done',
      title: 'Peek failed',
      explanation: 'Heap unchanged. Insert a value before peeking.',
      snapshot: initial,
      phase: 'complete',
      operation,
      activeIndex: null,
      success: false,
      result: 'empty',
      complete: true,
    })
    return steps
  }

  const root = heapPeek(initial)!
  pushStep(steps, {
    id: 'peek-root',
    title: `Root is the ${rootLabel(kind)}`,
    explanation: `Root (index 0) holds ${root} — the current ${rootLabel(kind)}. Heap is unchanged.`,
    detail: 'Peek is O(1): the extreme value always lives at the root of a valid heap.',
    snapshot: initial,
    phase: 'peek',
    operation,
    activeIndex: 0,
    found: [0],
    result: String(root),
    success: true,
  })

  pushStep(steps, {
    id: 'peek-done',
    title: 'Peek complete',
    explanation: `peek() → ${root}. Array still ${formatArray(initial.values)}.`,
    snapshot: initial,
    phase: 'complete',
    operation,
    activeIndex: 0,
    found: [0],
    result: String(root),
    success: true,
    complete: true,
  })

  return steps
}

function buildExtractSteps(initial: HeapSnapshot): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: HeapOperation = 'extract'
  const kind = initial.kind
  const compare = comparatorFor(kind)
  const verb = kind === 'min' ? 'Extract min' : 'Extract max'

  pushStep(steps, {
    id: 'extract-init',
    title: `Start ${verb.toLowerCase()}`,
    explanation: `${verb} removes the root and restores the heap property. Current: ${formatHeap(initial.values, kind)}.`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    activeIndex: initial.values.length > 0 ? 0 : null,
    vizOperation: 'extract-max',
  })

  if (heapIsEmpty(initial)) {
    pushStep(steps, {
      id: 'extract-empty',
      title: 'Empty heap',
      explanation: `Cannot extract — nothing to remove from an empty ${kind} heap.`,
      snapshot: initial,
      phase: 'underflow',
      operation,
      activeIndex: null,
      success: false,
      result: 'empty',
    })
    pushStep(steps, {
      id: 'extract-empty-done',
      title: 'Extract failed',
      explanation: 'Heap unchanged. Insert values or build a heap first.',
      snapshot: initial,
      phase: 'complete',
      operation,
      activeIndex: null,
      success: false,
      result: 'empty',
      complete: true,
    })
    return steps
  }

  const root = initial.values[0]
  pushStep(steps, {
    id: 'extract-focus',
    title: `Save the ${rootLabel(kind)}`,
    explanation: `Remember root value ${root}. It will be returned after the heap is repaired.`,
    snapshot: initial,
    phase: 'focus-root',
    operation,
    activeIndex: 0,
    found: [0],
    result: String(root),
  })

  if (initial.values.length === 1) {
    const empty = snapshotFromArray([], kind)
    pushStep(steps, {
      id: 'extract-last',
      title: 'Remove the only element',
      explanation: `Heap had a single node. After extract it is empty. Returned ${root}.`,
      snapshot: empty,
      phase: 'extract-root',
      operation,
      activeIndex: null,
      success: true,
      result: String(root),
      vizOperation: 'extract-max',
    })
    pushStep(steps, {
      id: 'extract-done-single',
      title: 'Extract complete',
      explanation: `extract() → ${root}. Heap is empty.`,
      snapshot: empty,
      phase: 'complete',
      operation,
      activeIndex: null,
      success: true,
      result: String(root),
      complete: true,
    })
    return steps
  }

  const lastIndex = initial.values.length - 1
  const last = initial.values[lastIndex]
  const afterMove = [...initial.values]
  afterMove[0] = last
  afterMove.pop()
  let frame = snapshotFromArray(afterMove, kind)

  pushStep(steps, {
    id: 'extract-move-last',
    title: 'Move last to root',
    explanation: `Move the last leaf (${last} at [${lastIndex}]) into the root slot, then shrink the array.`,
    detail: 'The tree stays complete. The root may now violate the heap property.',
    snapshot: frame,
    phase: 'move-last',
    operation,
    activeIndex: 0,
    moving: [0],
    candidate: [0],
    vizOperation: 'move',
  })

  const working = [...afterMove]
  let index = 0
  let step = 0

  while (true) {
    const left = leftChildIndex(index)
    const right = rightChildIndex(index)
    const n = working.length

    if (left >= n) {
      pushStep(steps, {
        id: `extract-leaf-${step}`,
        title: 'No children left',
        explanation: `Index ${index} has no children. Sift-down stops. Heap property restored.`,
        snapshot: frame,
        phase: 'bubble-down',
        operation,
        activeIndex: index,
        success: true,
      })
      break
    }

    const preferred = preferredChildIndex(working, index, kind)!
    const compared =
      right < n ? [index, left, right] : ([index, left] as number[])

    pushStep(steps, {
      id: `extract-compare-${step}`,
      title: 'Compare with children',
      explanation: `At [${index}] = ${working[index]}, choose the ${kind === 'min' ? 'smaller' : 'larger'} child among available children.`,
      detail: `Left = 2·i+1 = ${left}${right < n ? `, right = 2·i+2 = ${right}` : ' (no right child)'}.`,
      snapshot: frame,
      phase: 'compare',
      operation,
      activeIndex: index,
      leftIdx: left < n ? left : null,
      rightIdx: right < n ? right : null,
      compared,
      vizOperation: 'compare',
    })

    if (compare(working[preferred], working[index]) >= 0) {
      pushStep(steps, {
        id: `extract-ok-${step}`,
        title: 'Heap property holds',
        explanation: `Parent ${working[index]} already satisfies ${propertyLabel(kind)} vs children. Stop.`,
        snapshot: frame,
        phase: 'heapify',
        operation,
        activeIndex: index,
        leftIdx: left < n ? left : null,
        rightIdx: right < n ? right : null,
        success: true,
        vizOperation: 'heapify',
      })
      break
    }

    ;[working[index], working[preferred]] = [
      working[preferred],
      working[index],
    ]
    frame = snapshotFromArray(working, kind)

    pushStep(steps, {
      id: `extract-swap-${step}`,
      title: 'Swap with preferred child',
      explanation: `Swap [${index}] ↔ [${preferred}] to restore ${propertyLabel(kind)}.`,
      snapshot: frame,
      phase: 'swap',
      operation,
      activeIndex: preferred,
      swapA: index,
      swapB: preferred,
      swapped: [index, preferred],
      leftIdx: left < n ? left : null,
      rightIdx: right < n ? right : null,
      vizOperation: 'swap',
    })

    index = preferred
    step += 1
  }

  pushStep(steps, {
    id: 'extract-done',
    title: 'Extract complete',
    explanation: `extract() → ${root}. Heap is now ${formatHeap(working, kind)}. Valid: ${isValidHeap(frame) ? 'yes' : 'no'}.`,
    detail: 'Extract root is O(log n) — one sift-down along the height of the tree.',
    snapshot: frame,
    phase: 'complete',
    operation,
    activeIndex: index,
    found: working.length > 0 ? [0] : undefined,
    success: true,
    result: String(root),
    complete: true,
    vizOperation: 'extract-max',
  })

  return steps
}

function buildBuildHeapSteps(
  values: readonly number[],
  kind: HeapKind,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: HeapOperation = 'build-heap'
  const compare = comparatorFor(kind)
  const initial = snapshotFromArray(values, kind)

  pushStep(steps, {
    id: 'build-init',
    title: 'Start build heap',
    explanation: `Build a ${kind} heap from ${formatArray(values)} using bottom-up heapify.`,
    detail:
      'Bottom-up construction is O(n). Inserting n elements one-by-one would be O(n log n).',
    snapshot: initial,
    phase: 'initialize',
    operation,
    activeIndex: values.length > 0 ? 0 : null,
    vizOperation: 'build-heap',
  })

  if (values.length === 0) {
    pushStep(steps, {
      id: 'build-empty',
      title: 'Empty input',
      explanation: 'Nothing to build — the heap stays empty.',
      snapshot: initial,
      phase: 'complete',
      operation,
      activeIndex: null,
      success: true,
      result: 'empty',
      complete: true,
    })
    return steps
  }

  if (values.length === 1) {
    pushStep(steps, {
      id: 'build-single',
      title: 'Single element',
      explanation: 'A one-element array is already a valid heap.',
      snapshot: initial,
      phase: 'complete',
      operation,
      activeIndex: 0,
      found: [0],
      success: true,
      result: String(values[0]),
      complete: true,
      vizOperation: 'build-heap',
    })
    return steps
  }

  const working = [...values]
  const lastParent = Math.floor(working.length / 2) - 1

  pushStep(steps, {
    id: 'build-plan',
    title: 'Start from the last non-leaf',
    explanation: `Last non-leaf parent index = ⌊n/2⌋ − 1 = ${lastParent}. Heapify each parent toward the root.`,
    detail: 'Leaves already satisfy the heap property vacuously — only internal nodes need work.',
    snapshot: snapshotFromArray(working, kind),
    phase: 'build-pass',
    operation,
    activeIndex: lastParent,
    highlighted: Array.from({ length: lastParent + 1 }, (_, i) => i),
    vizOperation: 'build-heap',
  })

  for (let start = lastParent; start >= 0; start -= 1) {
    let index = start
    let local = 0

    pushStep(steps, {
      id: `build-focus-${start}`,
      title: `Heapify subtree at [${start}]`,
      explanation: `Sift down from index ${start} (value ${working[start]}) until ${propertyLabel(kind)} holds in this subtree.`,
      snapshot: snapshotFromArray(working, kind),
      phase: 'heapify',
      operation,
      activeIndex: start,
      vizOperation: 'heapify',
    })

    while (true) {
      const left = leftChildIndex(index)
      const right = rightChildIndex(index)
      const n = working.length
      if (left >= n) {
        break
      }

      let best = index
      if (compare(working[left], working[best]) < 0) {
        best = left
      }
      if (right < n && compare(working[right], working[best]) < 0) {
        best = right
      }

      const compared =
        right < n ? [index, left, right] : ([index, left] as number[])

      pushStep(steps, {
        id: `build-compare-${start}-${local}`,
        title: 'Compare parent and children',
        explanation: `At [${index}] = ${working[index]}, preferred extreme among children is at [${best}].`,
        snapshot: snapshotFromArray(working, kind),
        phase: 'compare',
        operation,
        activeIndex: index,
        leftIdx: left,
        rightIdx: right < n ? right : null,
        compared,
        vizOperation: 'compare',
      })

      if (best === index) {
        pushStep(steps, {
          id: `build-ok-${start}-${local}`,
          title: 'Subtree satisfied',
          explanation: `No swap — ${propertyLabel(kind)} already holds under [${index}].`,
          snapshot: snapshotFromArray(working, kind),
          phase: 'bubble-down',
          operation,
          activeIndex: index,
        })
        break
      }

      ;[working[index], working[best]] = [working[best], working[index]]

      pushStep(steps, {
        id: `build-swap-${start}-${local}`,
        title: 'Swap during heapify',
        explanation: `Swap [${index}] ↔ [${best}] and continue sift-down.`,
        snapshot: snapshotFromArray(working, kind),
        phase: 'swap',
        operation,
        activeIndex: best,
        swapA: index,
        swapB: best,
        swapped: [index, best],
        vizOperation: 'swap',
      })

      index = best
      local += 1
    }
  }

  const final = snapshotFromArray(working, kind)
  // Cross-check against the pure buildHeap helper.
  const reference = buildHeapFromArray(values, kind)

  pushStep(steps, {
    id: 'build-done',
    title: 'Build heap complete',
    explanation: `Result: ${formatHeap(working, kind)}. Valid heap: ${isValidHeap(final) ? 'yes' : 'no'}.`,
    detail:
      'Why O(n)? Most nodes sit near the leaves and sift only a short distance. Summing work over heights yields a linear bound — tighter than n·O(log n) inserts.',
    snapshot: final,
    phase: 'complete',
    operation,
    activeIndex: 0,
    found: working.length > 0 ? [0] : undefined,
    success: true,
    result: formatArray(reference.values),
    complete: true,
    vizOperation: 'build-heap',
  })

  return steps
}

function buildIsEmptySteps(initial: HeapSnapshot): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: HeapOperation = 'is-empty'
  const empty = heapIsEmpty(initial)

  pushStep(steps, {
    id: 'empty-check',
    title: 'Check isEmpty',
    explanation: `isEmpty() asks whether the heap has zero elements. Current size = ${heapSize(initial)}.`,
    snapshot: initial,
    phase: 'check-empty',
    operation,
    activeIndex: initial.values.length > 0 ? 0 : null,
    result: String(empty),
    success: true,
  })

  pushStep(steps, {
    id: 'empty-done',
    title: 'Result',
    explanation: `isEmpty() → ${empty}. Heap unchanged.`,
    snapshot: initial,
    phase: 'complete',
    operation,
    activeIndex: initial.values.length > 0 ? 0 : null,
    result: String(empty),
    success: true,
    complete: true,
  })

  return steps
}

function buildSizeSteps(initial: HeapSnapshot): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: HeapOperation = 'size'
  const n = heapSize(initial)

  pushStep(steps, {
    id: 'size-check',
    title: 'Report size',
    explanation: `size() returns the number of elements in the backing array — currently ${n}.`,
    snapshot: initial,
    phase: 'report-size',
    operation,
    activeIndex: n > 0 ? 0 : null,
    result: String(n),
    success: true,
  })

  pushStep(steps, {
    id: 'size-done',
    title: 'Result',
    explanation: `size() → ${n}. Space for the heap values is O(n).`,
    snapshot: initial,
    phase: 'complete',
    operation,
    activeIndex: n > 0 ? 0 : null,
    result: String(n),
    success: true,
    complete: true,
  })

  return steps
}

function buildClearSteps(initial: HeapSnapshot): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: HeapOperation = 'clear'
  const kind = initial.kind

  pushStep(steps, {
    id: 'clear-init',
    title: 'Start clear',
    explanation: `Clear removes every element. Current: ${formatHeap(initial.values, kind)}.`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    activeIndex: initial.values.length > 0 ? 0 : null,
  })

  const empty = snapshotFromArray([], kind)
  pushStep(steps, {
    id: 'clear-apply',
    title: 'Drop all nodes',
    explanation: 'Backing array becomes []. Size → 0, isEmpty → true.',
    snapshot: empty,
    phase: 'clear',
    operation,
    activeIndex: null,
    success: true,
    result: 'cleared',
  })

  pushStep(steps, {
    id: 'clear-done',
    title: 'Clear complete',
    explanation: `Heap is empty (${kind}). Ready for new inserts or buildHeap.`,
    snapshot: empty,
    phase: 'complete',
    operation,
    activeIndex: null,
    success: true,
    result: 'cleared',
    complete: true,
  })

  return steps
}

/**
 * Build a VisualizationStep sequence for a heap playground operation.
 *
 * `buildValues` is required when operation === 'build-heap'.
 * `operand` is required when operation === 'insert'.
 */
export function buildHeapSteps(
  snapshot: HeapSnapshot,
  operation: HeapOperation,
  operand: number | null = null,
  buildValues: readonly number[] | null = null,
): VisualizationStep[] {
  if (operation === 'insert') {
    if (operand === null || !Number.isFinite(operand)) {
      return buildInvalidOperandSteps(snapshot, operation)
    }
    return buildInsertSteps(snapshot, operand)
  }

  if (operation === 'peek') {
    return buildPeekSteps(snapshot)
  }

  if (operation === 'extract') {
    return buildExtractSteps(snapshot)
  }

  if (operation === 'build-heap') {
    const values = buildValues ?? snapshot.values
    return buildBuildHeapSteps(values, snapshot.kind)
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

  return buildInvalidOperandSteps(snapshot, operation)
}

/** Values from the final step’s immutable snapshot (for apply-to-start). */
export function valuesFromFinalStep(
  steps: readonly VisualizationStep[],
): number[] {
  if (steps.length === 0) {
    return []
  }
  const last = steps[steps.length - 1]
  const raw = last.meta?.heapSnapshot
  if (typeof raw === 'string') {
    return [...parseHeapSnapshot(raw).values]
  }
  if (last.array) {
    return [...last.array]
  }
  return []
}

/** Re-export helpers used by tests / panels. */
export { respectsHeapOrder, isValidHeap }
