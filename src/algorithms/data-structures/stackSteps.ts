/**
 * Step generator for Stack visualization.
 *
 * Each step embeds an immutable `stackSnapshot` so previous/next scrubbing
 * never mutates historical frames. Pure data — no React.
 */

import type { VisualizationStep } from '../../components/visualizations/types'
import { formatArray } from '../../components/visualizations/utils'
import {
  cloneSnapshot,
  formatStack,
  isEmpty as stackIsEmpty,
  peek as stackPeek,
  pop as stackPop,
  push as stackPush,
  size as stackSize,
  snapshotFromArray,
  topIndex,
  type StackSnapshot,
} from './stack'

export type StackOperation =
  | 'push'
  | 'pop'
  | 'peek'
  | 'is-empty'
  | 'size'

export type StackPhase =
  | 'initialize'
  | 'focus-top'
  | 'create-element'
  | 'push'
  | 'pop'
  | 'peek'
  | 'check-empty'
  | 'report-size'
  | 'underflow'
  | 'overflow'
  | 'invalid'
  | 'complete'

type StepMetaFields = {
  phase: StackPhase
  operation: StackOperation
  stackSnapshot: string
  topIndex: number
  activeIndex: number | null
  result: string | null
  success: boolean | null
  operand: number | null
  message: string
  educationalCapacity: number | null
}

/** Serialize a snapshot for VisualizationStep.meta. */
export function serializeStackSnapshot(snapshot: StackSnapshot): string {
  return JSON.stringify({
    values: snapshot.values,
    maxCapacity: snapshot.maxCapacity,
  })
}

/** Parse a stack snapshot produced by serializeStackSnapshot. */
export function parseStackSnapshot(raw: string): StackSnapshot {
  if (!raw) {
    return { values: [], maxCapacity: null }
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return { values: [], maxCapacity: null }
    }

    const record = parsed as Record<string, unknown>
    const maxCapacity =
      typeof record.maxCapacity === 'number' &&
      Number.isFinite(record.maxCapacity) &&
      record.maxCapacity >= 0
        ? record.maxCapacity
        : record.maxCapacity === null
          ? null
          : null

    const valuesRaw = record.values
    if (!Array.isArray(valuesRaw)) {
      return { values: [], maxCapacity }
    }

    const values: number[] = []
    for (const item of valuesRaw) {
      if (typeof item === 'number' && Number.isFinite(item)) {
        values.push(item)
      }
    }

    return { values, maxCapacity }
  } catch {
    return { values: [], maxCapacity: null }
  }
}

function meta(fields: StepMetaFields): NonNullable<VisualizationStep['meta']> {
  return {
    phase: fields.phase,
    operation: fields.operation,
    stackSnapshot: fields.stackSnapshot,
    topIndex: fields.topIndex,
    activeIndex: fields.activeIndex,
    result: fields.result,
    success: fields.success,
    operand: fields.operand,
    message: fields.message,
    educationalCapacity: fields.educationalCapacity,
  }
}

function pushStep(
  steps: VisualizationStep[],
  options: {
    id: string
    title: string
    explanation: string
    detail?: string
    snapshot: StackSnapshot
    phase: StackPhase
    operation: StackOperation
    activeIndex?: number | null
    result?: string | null
    success?: boolean | null
    operand?: number | null
    message?: string
    active?: readonly number[]
    highlighted?: readonly number[]
    moving?: readonly number[]
    found?: readonly number[]
    complete?: boolean
  },
): void {
  const snapshot = cloneSnapshot(options.snapshot)
  const array = [...snapshot.values]
  const top = topIndex(snapshot)
  const activeIndex =
    options.activeIndex === undefined ? (top >= 0 ? top : null) : options.activeIndex

  const pointers: Array<{ index: number; label: string }> = []
  if (top >= 0) {
    pointers.push({ index: top, label: 'top' })
  }

  steps.push({
    id: options.id,
    title: options.title,
    explanation: options.explanation,
    detail: options.detail,
    array,
    active: options.active ?? (activeIndex !== null ? [activeIndex] : undefined),
    highlighted: options.highlighted,
    moving: options.moving,
    found: options.found,
    pointers: pointers.length > 0 ? pointers : undefined,
    operation: options.complete ? 'complete' : undefined,
    meta: meta({
      phase: options.phase,
      operation: options.operation,
      stackSnapshot: serializeStackSnapshot(snapshot),
      topIndex: top,
      activeIndex,
      result: options.result ?? null,
      success: options.success ?? null,
      operand: options.operand ?? null,
      message: options.message ?? options.explanation,
      educationalCapacity: snapshot.maxCapacity,
    }),
  })
}

function buildInvalidOperandSteps(
  initial: StackSnapshot,
  operation: StackOperation,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  pushStep(steps, {
    id: 'invalid-0',
    title: 'Invalid input',
    explanation:
      'Enter a finite number to push. The stack is unchanged until a valid value is provided.',
    snapshot: initial,
    phase: 'invalid',
    operation,
    activeIndex: null,
    success: false,
    result: 'invalid input',
    message: 'Waiting for a valid push value.',
  })
  pushStep(steps, {
    id: 'invalid-done',
    title: 'No change',
    explanation: `Stack remains ${formatStack(initial.values)}.`,
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

function buildPushSteps(
  initial: StackSnapshot,
  operand: number,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: StackOperation = 'push'

  pushStep(steps, {
    id: 'push-init',
    title: 'Start push',
    explanation: `Push ${operand} onto the top. Current stack: ${formatStack(initial.values)}.`,
    detail:
      initial.maxCapacity !== null
        ? `Educational capacity limit: ${initial.maxCapacity} (configurable demo — not a rule of all stacks).`
        : 'Dynamic arrays grow as needed; push is amortized O(1).',
    snapshot: initial,
    phase: 'initialize',
    operation,
    operand,
    activeIndex: topIndex(initial) >= 0 ? topIndex(initial) : null,
  })

  if (
    initial.maxCapacity !== null &&
    initial.values.length >= initial.maxCapacity
  ) {
    pushStep(steps, {
      id: 'push-overflow',
      title: 'Stack overflow (educational)',
      explanation: `Cannot push ${operand}: size ${initial.values.length} already equals the educational max capacity of ${initial.maxCapacity}.`,
      detail:
        'This limit is a teaching knob. Many real stacks grow until memory is exhausted; fixed-size stacks (e.g. some call stacks or buffers) can overflow.',
      snapshot: initial,
      phase: 'overflow',
      operation,
      operand,
      success: false,
      result: 'overflow',
      message: 'Overflow — push rejected; stack unchanged.',
    })
    pushStep(steps, {
      id: 'push-overflow-done',
      title: 'Push rejected',
      explanation: `Stack still ${formatStack(initial.values)}. Clear space with pop, or raise the educational capacity.`,
      snapshot: initial,
      phase: 'complete',
      operation,
      operand,
      success: false,
      result: 'overflow',
      complete: true,
    })
    return steps
  }

  const pendingTop = initial.values.length
  pushStep(steps, {
    id: 'push-create',
    title: 'Prepare new top',
    explanation: `Create value ${operand}. It will become the new top (last array index).`,
    snapshot: initial,
    phase: 'create-element',
    operation,
    operand,
    activeIndex: null,
    moving: [],
    highlighted: [],
    message: `New element ${operand} ready to push.`,
  })

  const { snapshot: after, ok } = stackPush(initial, operand)
  if (!ok) {
    // Defensive — capacity already handled above.
    pushStep(steps, {
      id: 'push-fail',
      title: 'Push failed',
      explanation: 'Push was rejected.',
      snapshot: initial,
      phase: 'overflow',
      operation,
      operand,
      success: false,
      result: 'overflow',
      complete: true,
    })
    return steps
  }

  pushStep(steps, {
    id: 'push-place',
    title: 'Place on top',
    explanation: `Append ${operand} at the end of the backing array. New top index = ${pendingTop}.`,
    snapshot: after,
    phase: 'push',
    operation,
    operand,
    activeIndex: pendingTop,
    moving: [pendingTop],
    result: String(operand),
    success: true,
    message: `Pushed ${operand}.`,
  })

  pushStep(steps, {
    id: 'push-done',
    title: 'Push complete',
    explanation: `Stack is now ${formatStack(after.values)}. LIFO: the next pop will return ${operand}.`,
    snapshot: after,
    phase: 'complete',
    operation,
    operand,
    activeIndex: topIndex(after),
    found: [topIndex(after)],
    result: String(operand),
    success: true,
    complete: true,
  })

  return steps
}

function buildPopSteps(initial: StackSnapshot): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: StackOperation = 'pop'
  const top = topIndex(initial)

  pushStep(steps, {
    id: 'pop-init',
    title: 'Start pop',
    explanation: `Remove the top element. Current stack: ${formatStack(initial.values)}.`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    activeIndex: top >= 0 ? top : null,
  })

  if (stackIsEmpty(initial)) {
    pushStep(steps, {
      id: 'pop-underflow',
      title: 'Stack underflow',
      explanation:
        'The stack is empty — there is no top element to remove. Popping would be an underflow error.',
      detail:
        'Always check isEmpty (or handle an empty result) before assuming pop succeeds.',
      snapshot: initial,
      phase: 'underflow',
      operation,
      success: false,
      result: 'underflow',
      message: 'Underflow — stack unchanged.',
      activeIndex: null,
    })
    pushStep(steps, {
      id: 'pop-underflow-done',
      title: 'Pop rejected',
      explanation: 'Stack remains empty. Push a value before popping.',
      snapshot: initial,
      phase: 'complete',
      operation,
      success: false,
      result: 'underflow',
      complete: true,
      activeIndex: null,
    })
    return steps
  }

  const topValue = stackPeek(initial)!

  pushStep(steps, {
    id: 'pop-focus',
    title: 'Focus the top',
    explanation: `Top is ${topValue} at index ${top}. Pop removes only this element.`,
    snapshot: initial,
    phase: 'focus-top',
    operation,
    activeIndex: top,
    highlighted: [top],
  })

  const { snapshot: after, value, ok } = stackPop(initial)
  if (!ok || value === undefined) {
    pushStep(steps, {
      id: 'pop-fail',
      title: 'Pop failed',
      explanation: 'Unexpected empty stack during pop.',
      snapshot: initial,
      phase: 'underflow',
      operation,
      success: false,
      result: 'underflow',
      complete: true,
      activeIndex: null,
    })
    return steps
  }

  pushStep(steps, {
    id: 'pop-remove',
    title: 'Remove top',
    explanation: `Return ${value} and shrink the stack. New top is ${stackPeek(after) ?? 'none (empty)'}.`,
    snapshot: after,
    phase: 'pop',
    operation,
    activeIndex: topIndex(after) >= 0 ? topIndex(after) : null,
    moving: topIndex(after) >= 0 ? [topIndex(after)] : undefined,
    result: String(value),
    success: true,
    message: `Popped ${value}.`,
  })

  pushStep(steps, {
    id: 'pop-done',
    title: 'Pop complete',
    explanation: `Returned ${value}. Stack is now ${formatStack(after.values)}.`,
    snapshot: after,
    phase: 'complete',
    operation,
    activeIndex: topIndex(after) >= 0 ? topIndex(after) : null,
    found: topIndex(after) >= 0 ? [topIndex(after)] : undefined,
    result: String(value),
    success: true,
    complete: true,
  })

  return steps
}

function buildPeekSteps(initial: StackSnapshot): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: StackOperation = 'peek'
  const top = topIndex(initial)

  pushStep(steps, {
    id: 'peek-init',
    title: 'Start peek',
    explanation: `Read the top without removing it. Current stack: ${formatStack(initial.values)}.`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    activeIndex: top >= 0 ? top : null,
  })

  if (stackIsEmpty(initial)) {
    pushStep(steps, {
      id: 'peek-underflow',
      title: 'Nothing to peek',
      explanation:
        'The stack is empty. Peek has no top value to return — treat this like an underflow / empty result.',
      snapshot: initial,
      phase: 'underflow',
      operation,
      success: false,
      result: 'underflow',
      message: 'Empty — peek returns nothing.',
      activeIndex: null,
    })
    pushStep(steps, {
      id: 'peek-underflow-done',
      title: 'Peek complete (empty)',
      explanation: 'Stack unchanged (still empty). Push before peeking for a value.',
      snapshot: initial,
      phase: 'complete',
      operation,
      success: false,
      result: 'underflow',
      complete: true,
      activeIndex: null,
    })
    return steps
  }

  const topValue = stackPeek(initial)!

  pushStep(steps, {
    id: 'peek-focus',
    title: 'Inspect top',
    explanation: `Top value is ${topValue}. Peek does not change size or order.`,
    snapshot: initial,
    phase: 'peek',
    operation,
    activeIndex: top,
    highlighted: [top],
    found: [top],
    result: String(topValue),
    success: true,
    message: `Peek → ${topValue}`,
  })

  pushStep(steps, {
    id: 'peek-done',
    title: 'Peek complete',
    explanation: `Returned ${topValue}. Stack still ${formatStack(initial.values)}.`,
    snapshot: initial,
    phase: 'complete',
    operation,
    activeIndex: top,
    found: [top],
    result: String(topValue),
    success: true,
    complete: true,
  })

  return steps
}

function buildIsEmptySteps(initial: StackSnapshot): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: StackOperation = 'is-empty'
  const empty = stackIsEmpty(initial)

  pushStep(steps, {
    id: 'empty-init',
    title: 'Check isEmpty',
    explanation: `Ask whether the stack has any elements. Current: ${formatStack(initial.values)}.`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    activeIndex: topIndex(initial) >= 0 ? topIndex(initial) : null,
  })

  pushStep(steps, {
    id: 'empty-check',
    title: empty ? 'Stack is empty' : 'Stack is not empty',
    explanation: empty
      ? 'Size is 0 — isEmpty() returns true. Pop and peek would underflow.'
      : `Size is ${stackSize(initial)} — isEmpty() returns false. Top is ${stackPeek(initial)}.`,
    snapshot: initial,
    phase: 'check-empty',
    operation,
    activeIndex: topIndex(initial) >= 0 ? topIndex(initial) : null,
    result: String(empty),
    success: true,
    message: `isEmpty → ${empty}`,
  })

  pushStep(steps, {
    id: 'empty-done',
    title: 'Check complete',
    explanation: `isEmpty() = ${empty}. Stack unchanged.`,
    snapshot: initial,
    phase: 'complete',
    operation,
    result: String(empty),
    success: true,
    complete: true,
  })

  return steps
}

function buildSizeSteps(initial: StackSnapshot): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const operation: StackOperation = 'size'
  const n = stackSize(initial)

  pushStep(steps, {
    id: 'size-init',
    title: 'Check size',
    explanation: `Count elements currently on the stack. Current: ${formatStack(initial.values)}.`,
    snapshot: initial,
    phase: 'initialize',
    operation,
    activeIndex: topIndex(initial) >= 0 ? topIndex(initial) : null,
  })

  pushStep(steps, {
    id: 'size-report',
    title: `Size = ${n}`,
    explanation:
      n === 0
        ? 'The stack has 0 elements.'
        : `The stack has ${n} element${n === 1 ? '' : 's'}. Top index = ${topIndex(initial)}.`,
    snapshot: initial,
    phase: 'report-size',
    operation,
    activeIndex: topIndex(initial) >= 0 ? topIndex(initial) : null,
    result: String(n),
    success: true,
    message: `size → ${n}`,
  })

  pushStep(steps, {
    id: 'size-done',
    title: 'Size check complete',
    explanation: `size() = ${n}. Stack unchanged.`,
    snapshot: initial,
    phase: 'complete',
    operation,
    result: String(n),
    success: true,
    complete: true,
  })

  return steps
}

/**
 * Build visualization steps for a stack operation.
 *
 * @param values Bottom→top stack values (last element = top).
 * @param operation Stack operation to animate.
 * @param operand Required for push; ignored otherwise.
 * @param maxCapacity Optional educational capacity (null = unbounded for the demo).
 */
export function buildStackSteps(
  values: readonly number[],
  operation: StackOperation,
  operand?: number,
  maxCapacity: number | null = null,
): VisualizationStep[] {
  const initial = snapshotFromArray(values, maxCapacity)

  if (operation === 'push') {
    if (operand === undefined || !Number.isFinite(operand)) {
      return buildInvalidOperandSteps(initial, operation)
    }
    return buildPushSteps(initial, operand)
  }

  if (operation === 'pop') {
    return buildPopSteps(initial)
  }

  if (operation === 'peek') {
    return buildPeekSteps(initial)
  }

  if (operation === 'is-empty') {
    return buildIsEmptySteps(initial)
  }

  return buildSizeSteps(initial)
}

/** Values from the final step's embedded snapshot (bottom → top). */
export function valuesFromFinalStep(
  steps: readonly VisualizationStep[],
): number[] {
  if (steps.length === 0) {
    return []
  }
  const raw = steps[steps.length - 1]?.meta?.stackSnapshot
  if (typeof raw !== 'string') {
    return [...(steps[steps.length - 1]?.array ?? [])]
  }
  return [...parseStackSnapshot(raw).values]
}

/** Human-readable label for the current operation result meta field. */
export function describeStackResult(
  steps: readonly VisualizationStep[],
): string {
  if (steps.length === 0) {
    return ''
  }
  const last = steps[steps.length - 1]!
  const result = last.meta?.result
  if (typeof result !== 'string' || result === '') {
    return formatArray(last.array ?? [])
  }
  return result
}
