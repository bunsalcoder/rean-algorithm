import type {
  ElementVisualState,
  PlaybackSpeed,
  ResolvedArrayElement,
  VisualizationStep,
} from './types'

/** Default bounds for array visualization inputs. */
export const DEFAULT_ARRAY_MIN_SIZE = 3
export const DEFAULT_ARRAY_MAX_SIZE = 12
export const DEFAULT_RANDOM_MIN = 1
export const DEFAULT_RANDOM_MAX = 99

/** Base interval (ms) for 1x playback speed. */
export const BASE_PLAYBACK_INTERVAL_MS = 1000

/** Deterministic demo / fallback array. */
export const DEFAULT_DEMO_ARRAY = [7, 2, 9, 4, 1, 6] as const

/**
 * Priority when an index appears in multiple highlight lists.
 * Higher wins.
 */
const STATE_PRIORITY: Record<ElementVisualState, number> = {
  default: 0,
  eliminated: 1,
  highlighted: 2,
  sorted: 3,
  candidate: 4,
  left: 4,
  right: 4,
  active: 5,
  moving: 6,
  compared: 7,
  swapped: 8,
  found: 9,
}

/** Accessible state colors that work in light and dark themes. */
export const elementStateClasses: Record<ElementVisualState, string> = {
  default: 'border-border bg-muted text-foreground',
  eliminated:
    'border-border/60 bg-muted/40 text-muted-foreground opacity-45',
  highlighted:
    'border-sky-500/60 bg-sky-500/15 text-foreground ring-1 ring-sky-500/25 dark:border-sky-400/60 dark:bg-sky-400/15 dark:ring-sky-400/25',
  sorted:
    'border-emerald-500/55 bg-emerald-500/12 text-foreground ring-1 ring-emerald-500/25 dark:border-emerald-400/55 dark:bg-emerald-400/12 dark:ring-emerald-400/25',
  candidate:
    'border-violet-500 bg-violet-500/15 text-foreground shadow-sm ring-2 ring-violet-500/30 dark:border-violet-400 dark:bg-violet-400/15 dark:ring-violet-400/30',
  left:
    'border-indigo-500 bg-indigo-500/15 text-foreground shadow-sm ring-2 ring-indigo-500/30 dark:border-indigo-400 dark:bg-indigo-400/15 dark:ring-indigo-400/30',
  right:
    'border-fuchsia-500 bg-fuchsia-500/15 text-foreground shadow-sm ring-2 ring-fuchsia-500/30 dark:border-fuchsia-400 dark:bg-fuchsia-400/15 dark:ring-fuchsia-400/30',
  active:
    'border-primary bg-primary/15 text-foreground shadow-sm ring-2 ring-primary/30',
  moving:
    'border-cyan-500 bg-cyan-500/15 text-foreground shadow-sm ring-2 ring-cyan-500/30 dark:border-cyan-400 dark:bg-cyan-400/15 dark:ring-cyan-400/30',
  compared:
    'border-amber-500 bg-amber-500/15 text-foreground shadow-sm ring-2 ring-amber-500/30 dark:border-amber-400 dark:bg-amber-400/15 dark:ring-amber-400/30',
  swapped:
    'border-rose-500 bg-rose-500/15 text-foreground shadow-sm ring-2 ring-rose-500/30 dark:border-rose-400 dark:bg-rose-400/15 dark:ring-rose-400/30',
  found:
    'border-emerald-500 bg-emerald-500/20 text-foreground shadow-sm ring-2 ring-emerald-500/35 dark:border-emerald-400 dark:bg-emerald-400/20 dark:ring-emerald-400/35',
}

export const elementStateLegend: ReadonlyArray<{
  state: Exclude<ElementVisualState, 'default'>
  label: string
  className: string
}> = [
  {
    state: 'active',
    label: 'Active',
    className: elementStateClasses.active,
  },
  {
    state: 'compared',
    label: 'Compared',
    className: elementStateClasses.compared,
  },
  {
    state: 'highlighted',
    label: 'Highlighted',
    className: elementStateClasses.highlighted,
  },
  {
    state: 'left',
    label: 'Left half',
    className: elementStateClasses.left,
  },
  {
    state: 'right',
    label: 'Right half',
    className: elementStateClasses.right,
  },
  {
    state: 'candidate',
    label: 'Min / max candidate',
    className: elementStateClasses.candidate,
  },
  {
    state: 'moving',
    label: 'Moving',
    className: elementStateClasses.moving,
  },
  {
    state: 'swapped',
    label: 'Swapped',
    className: elementStateClasses.swapped,
  },
  {
    state: 'sorted',
    label: 'Sorted',
    className: elementStateClasses.sorted,
  },
  {
    state: 'eliminated',
    label: 'Eliminated',
    className: elementStateClasses.eliminated,
  },
  {
    state: 'found',
    label: 'Found',
    className: elementStateClasses.found,
  },
]

const OPERATION_LABELS: Record<
  NonNullable<VisualizationStep['operation']>,
  string
> = {
  compare: 'Compare',
  swap: 'Swap',
  'mark-sorted': 'Mark sorted',
  move: 'Move',
  split: 'Split',
  merge: 'Merge',
  complete: 'Complete',
}

export function getOperationLabel(
  operation: VisualizationStep['operation'],
): string | null {
  if (!operation) {
    return null
  }
  return OPERATION_LABELS[operation]
}

export function getPlaybackIntervalMs(
  speed: PlaybackSpeed,
  prefersReducedMotion: boolean,
): number {
  const base = prefersReducedMotion
    ? BASE_PLAYBACK_INTERVAL_MS * 1.5
    : BASE_PLAYBACK_INTERVAL_MS
  return Math.round(base / speed)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function formatArray(values: readonly number[]): string {
  return `[${values.join(', ')}]`
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Resolve which visual state an index should use for the current step.
 */
export function resolveElementState(
  index: number,
  step: VisualizationStep,
): ElementVisualState {
  let state: ElementVisualState = 'default'

  const candidates: Array<{
    indices: readonly number[] | undefined
    state: ElementVisualState
  }> = [
    { indices: step.eliminated, state: 'eliminated' },
    { indices: step.highlighted, state: 'highlighted' },
    { indices: step.sorted, state: 'sorted' },
    { indices: step.candidate, state: 'candidate' },
    { indices: step.left, state: 'left' },
    { indices: step.right, state: 'right' },
    { indices: step.active, state: 'active' },
    { indices: step.moving, state: 'moving' },
    { indices: step.compared, state: 'compared' },
    { indices: step.swapped, state: 'swapped' },
    { indices: step.found, state: 'found' },
  ]

  for (const candidate of candidates) {
    if (!candidate.indices?.includes(index)) {
      continue
    }
    if (STATE_PRIORITY[candidate.state] > STATE_PRIORITY[state]) {
      state = candidate.state
    }
  }

  return state
}

/**
 * Merge a step's array (or the shared input) with highlight metadata
 * into render-ready element descriptors.
 */
export function resolveArrayElements(
  baseArray: readonly number[],
  step: VisualizationStep | undefined,
): ResolvedArrayElement[] {
  const values = step?.array ?? baseArray

  return values.map((value, index) => ({
    index,
    value,
    state: step ? resolveElementState(index, step) : 'default',
    label: step?.indexLabels?.[index],
  }))
}

/**
 * Collect visual states referenced by a step sequence (for legend filtering).
 */
export function collectUsedElementStates(
  steps: readonly VisualizationStep[],
): Array<Exclude<ElementVisualState, 'default'>> {
  const used = new Set<ElementVisualState>()

  for (const step of steps) {
    if (step.highlighted?.length) used.add('highlighted')
    if (step.compared?.length) used.add('compared')
    if (step.active?.length) used.add('active')
    if (step.found?.length) used.add('found')
    if (step.swapped?.length) used.add('swapped')
    if (step.eliminated?.length) used.add('eliminated')
    if (step.sorted?.length) used.add('sorted')
    if (step.candidate?.length) used.add('candidate')
    if (step.left?.length) used.add('left')
    if (step.right?.length) used.add('right')
    if (step.moving?.length) used.add('moving')
  }

  return elementStateLegend
    .map((item) => item.state)
    .filter((state) => used.has(state))
}

export function generateRandomArray(
  size: number,
  min = DEFAULT_RANDOM_MIN,
  max = DEFAULT_RANDOM_MAX,
): number[] {
  const length = clamp(size, DEFAULT_ARRAY_MIN_SIZE, DEFAULT_ARRAY_MAX_SIZE)
  const low = Math.min(min, max)
  const high = Math.max(min, max)
  const range = high - low + 1

  return Array.from({ length }, () => low + Math.floor(Math.random() * range))
}

/**
 * Build a simple highlight/compare demonstration sequence.
 * Temporary helper for the visualizer playground — not a real algorithm lesson.
 */
export function buildDemoVisualizationSteps(
  input: readonly number[],
): VisualizationStep[] {
  const array = [...input]
  const steps: VisualizationStep[] = []

  steps.push({
    id: 'demo-start',
    title: 'Ready to explore',
    explanation:
      'This is a practice visualization. We will walk through the array, highlight values, and compare neighbors so you can try the playback controls.',
    detail: `Starting array: ${formatArray(array)}`,
    array,
    highlighted: array.map((_, index) => index),
  })

  for (let i = 0; i < array.length; i += 1) {
    steps.push({
      id: `demo-active-${i}`,
      title: `Focus on index ${i}`,
      explanation: `Look at the value ${array[i]} stored at index ${i}. The active marker shows where we are right now.`,
      array,
      active: [i],
      pointers: [{ index: i, label: 'i' }],
    })

    if (i < array.length - 1) {
      const left = array[i]
      const right = array[i + 1]
      const relation =
        left === right
          ? 'equal to'
          : left < right
            ? 'smaller than'
            : 'larger than'

      steps.push({
        id: `demo-compare-${i}`,
        title: `Compare index ${i} and ${i + 1}`,
        explanation: `Compare neighbors: ${left} is ${relation} ${right}. Comparison highlights help you see which values the algorithm is checking.`,
        array,
        compared: [i, i + 1],
        pointers: [
          { index: i, label: 'a' },
          { index: i + 1, label: 'b' },
        ],
      })
    }
  }

  if (array.length >= 2) {
    const left = 0
    const right = array.length - 1
    const swapped = [...array]
    ;[swapped[left], swapped[right]] = [swapped[right], swapped[left]]

    steps.push({
      id: 'demo-swap',
      title: 'Demonstrate a swap',
      explanation: `Swap the first and last values (${array[left]} ↔ ${array[right]}). Real sorting lessons will use this same swap highlight.`,
      array: swapped,
      swapped: [left, right],
      pointers: [
        { index: left, label: 'L' },
        { index: right, label: 'R' },
      ],
    })
  }

  const finalArray =
    array.length >= 2
      ? (() => {
          const swapped = [...array]
          ;[swapped[0], swapped[swapped.length - 1]] = [
            swapped[swapped.length - 1],
            swapped[0],
          ]
          return swapped
        })()
      : array

  let foundIndex = 0
  for (let i = 1; i < finalArray.length; i += 1) {
    if (finalArray[i] > finalArray[foundIndex]) {
      foundIndex = i
    }
  }

  steps.push({
    id: 'demo-found',
    title: 'Mark a result',
    explanation: `The largest value in the current array is ${finalArray[foundIndex]} at index ${foundIndex}. Found highlights are useful when a search finishes.`,
    detail:
      array.length >= 2
        ? 'Note: the demo swapped the ends earlier, so this result uses the post-swap array.'
        : undefined,
    array: finalArray,
    found: [foundIndex],
    pointers: [{ index: foundIndex, label: 'max' }],
    meta: { maxValue: finalArray[foundIndex], maxIndex: foundIndex },
  })

  steps.push({
    id: 'demo-done',
    title: 'Demo complete',
    explanation:
      'You reached the end of the demonstration. Use Reset to start over, generate a new array, or change the playback speed and try again.',
    array: finalArray,
    highlighted: finalArray.map((_, index) => index),
  })

  return steps
}
