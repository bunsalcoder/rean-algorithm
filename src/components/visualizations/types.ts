/**
 * Reusable visualization data model.
 *
 * Algorithm lessons provide a sequence of VisualizationStep values.
 * Playback controls and rendering stay algorithm-agnostic.
 */

/** Visual role applied to array indices during a step. */
export type ElementVisualState =
  | 'default'
  | 'eliminated'
  | 'highlighted'
  | 'sorted'
  | 'candidate'
  | 'left'
  | 'right'
  | 'active'
  | 'moving'
  | 'compared'
  | 'swapped'
  | 'found'

/**
 * High-level operation label for status display.
 * Generators set this; the engine only renders it.
 */
export type VisualizationOperation =
  | 'compare'
  | 'swap'
  | 'mark-sorted'
  | 'move'
  | 'split'
  | 'merge'
  | 'partition'
  | 'complete'

/** Named pointer or marker shown near an array index. */
export type ArrayPointer = {
  index: number
  label: string
}

/** Optional algorithm-specific metadata attached to a step. */
export type VisualizationStepMeta = Readonly<
  Record<string, string | number | boolean | null>
>

/**
 * One frame in a visualization sequence.
 *
 * Algorithms generate these; the engine only plays them back.
 *
 * Sorting-oriented optional fields (`sorted`, `candidate`, `moving`,
 * `operation`) are additive — search steps can omit them entirely.
 */
export type VisualizationStep = {
  /** Stable unique id within a step sequence. */
  id: string
  /** Short beginner-friendly title. */
  title: string
  /** Primary explanation shown in the status panel. */
  explanation: string
  /** Optional extra context under the explanation. */
  detail?: string
  /**
   * Array values at this step.
   * When omitted, the visualizer falls back to the shared input array.
   */
  array?: readonly number[]
  /** Soft-highlighted indices (e.g. active search / unsorted range). */
  highlighted?: readonly number[]
  /** Indices currently being compared. */
  compared?: readonly number[]
  /** Currently focused / active indices. */
  active?: readonly number[]
  /** Indices marked as the found result. */
  found?: readonly number[]
  /** Indices involved in a swap. */
  swapped?: readonly number[]
  /** Indices discarded from the search (e.g. Binary Search). */
  eliminated?: readonly number[]
  /** Indices locked in their final sorted positions. */
  sorted?: readonly number[]
  /** Minimum or maximum candidate indices during selection-style scans. */
  candidate?: readonly number[]
  /** Indices in the left half of a divide/merge range (Merge Sort). */
  left?: readonly number[]
  /** Indices in the right half of a divide/merge range (Merge Sort). */
  right?: readonly number[]
  /** Indices currently being shifted or moved. */
  moving?: readonly number[]
  /** Optional high-level operation for status display. */
  operation?: VisualizationOperation
  /** Optional named pointers (e.g. left, right, mid). */
  pointers?: readonly ArrayPointer[]
  /** Optional per-index annotation labels. */
  indexLabels?: Readonly<Record<number, string>>
  /** Optional algorithm-specific metadata. */
  meta?: VisualizationStepMeta
}

/** Supported playback speed multipliers. */
export type PlaybackSpeed = 0.5 | 1 | 2

export const PLAYBACK_SPEEDS: readonly PlaybackSpeed[] = [0.5, 1, 2]

/** Future visualization kinds the engine can grow into. */
export type VisualizationKind = 'array' | 'tree' | 'graph'

/** Preset arrays offered in the input toolbar. */
export type ArrayPreset = {
  id: string
  label: string
  values: readonly number[]
}

/** Options for the array input controls. */
export type VisualizerInputOptions = {
  presets?: readonly ArrayPreset[]
  minSize?: number
  maxSize?: number
  allowRandom?: boolean
  allowSizeAdjust?: boolean
  /** Inclusive min value for random generation. */
  randomMin?: number
  /** Inclusive max value for random generation. */
  randomMax?: number
  /** When true, random arrays are sorted ascending (needed for Binary Search). */
  sortAscending?: boolean
}

/** Resolved array element with its visual role for rendering. */
export type ResolvedArrayElement = {
  index: number
  value: number
  state: ElementVisualState
  label?: string
}
