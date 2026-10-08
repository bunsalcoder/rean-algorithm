import type { VisualizationStep } from '../../components/visualizations/types'
import { formatArray } from '../../components/visualizations/utils'
import { buildFrequencyMap, findMostFrequent } from './frequencyCounting'

export type FrequencyCountingPhase =
  | 'initialize'
  | 'read-value'
  | 'create-key'
  | 'increment'
  | 'frequency-updated'
  | 'complete'

export type FrequencyEntry = {
  key: number
  count: number
}

type FrequencyMeta = {
  phase: FrequencyCountingPhase
  currentIndex: number
  currentValue: number
  currentKey: number
  previousCount: number
  newCount: number
  isNewKey: boolean
  mostFrequent: number | null
  frequencySnapshot: string
}

/** Serialize frequency entries (insertion order) for step meta. */
export function serializeFrequencyEntries(
  entries: readonly FrequencyEntry[],
): string {
  return JSON.stringify(entries.map((entry) => [entry.key, entry.count]))
}

/** Parse a frequency snapshot produced by serializeFrequencyEntries. */
export function parseFrequencyEntries(snapshot: string): FrequencyEntry[] {
  if (!snapshot) {
    return []
  }

  try {
    const parsed: unknown = JSON.parse(snapshot)
    if (!Array.isArray(parsed)) {
      return []
    }

    const entries: FrequencyEntry[] = []
    for (const item of parsed) {
      if (
        Array.isArray(item) &&
        item.length === 2 &&
        typeof item[0] === 'number' &&
        typeof item[1] === 'number'
      ) {
        entries.push({ key: item[0], count: item[1] })
      }
    }
    return entries
  } catch {
    return []
  }
}

function entriesFromMap(map: Map<number, number>): FrequencyEntry[] {
  return [...map.entries()].map(([key, count]) => ({ key, count }))
}

function meta(fields: FrequencyMeta): NonNullable<VisualizationStep['meta']> {
  return {
    phase: fields.phase,
    currentIndex: fields.currentIndex,
    currentValue: fields.currentValue,
    currentKey: fields.currentKey,
    previousCount: fields.previousCount,
    newCount: fields.newCount,
    isNewKey: fields.isNewKey,
    mostFrequent: fields.mostFrequent,
    frequencySnapshot: fields.frequencySnapshot,
  }
}

/**
 * Builds a step-by-step VisualizationStep sequence for Frequency Counting.
 * Each step is an immutable snapshot. Pure data — no React state.
 */
export function buildFrequencyCountingSteps(
  input: readonly number[],
): VisualizationStep[] {
  const array = [...input]
  const steps: VisualizationStep[] = []
  const n = array.length
  const mostFrequent = findMostFrequent(array)
  const emptySnapshot = serializeFrequencyEntries([])

  if (n === 0) {
    steps.push({
      id: 'frequency-counting-empty',
      title: 'Empty array',
      explanation:
        'The array is empty, so the frequency map stays empty. There is nothing to count.',
      detail: 'Result: empty frequency map',
      array: [],
      operation: 'complete',
      meta: meta({
        phase: 'complete',
        currentIndex: -1,
        currentValue: 0,
        currentKey: 0,
        previousCount: 0,
        newCount: 0,
        isNewKey: false,
        mostFrequent: null,
        frequencySnapshot: emptySnapshot,
      }),
    })
    return steps
  }

  steps.push({
    id: 'frequency-counting-init',
    title: 'Start with an empty frequency map',
    explanation: 'Start with an empty frequency map.',
    detail: `Array: ${formatArray(array)}. We will count how many times each value appears.`,
    array,
    meta: meta({
      phase: 'initialize',
      currentIndex: -1,
      currentValue: 0,
      currentKey: 0,
      previousCount: 0,
      newCount: 0,
      isNewKey: false,
      mostFrequent,
      frequencySnapshot: emptySnapshot,
    }),
  })

  const frequency = new Map<number, number>()

  for (let i = 0; i < n; i += 1) {
    const value = array[i]!
    const previousCount = frequency.get(value) ?? 0
    const isNewKey = !frequency.has(value)
    const newCount = previousCount + 1

    steps.push({
      id: `frequency-counting-read-${i}`,
      title: `Read the value ${value}`,
      explanation: `Read the value ${value} at index ${i}.`,
      detail: isNewKey
        ? `Value ${value} has not been seen yet.`
        : `Value ${value} already exists in the map with count ${previousCount}.`,
      array,
      highlighted: [i],
      active: [i],
      compared: [i],
      pointers: [{ index: i, label: 'current' }],
      operation: 'compare',
      meta: meta({
        phase: 'read-value',
        currentIndex: i,
        currentValue: value,
        currentKey: value,
        previousCount,
        newCount: previousCount,
        isNewKey,
        mostFrequent,
        frequencySnapshot: serializeFrequencyEntries(entriesFromMap(frequency)),
      }),
    })

    // Apply the update before create/increment frames so the map shows the change.
    frequency.set(value, newCount)
    const updatedSnapshot = serializeFrequencyEntries(entriesFromMap(frequency))

    if (isNewKey) {
      steps.push({
        id: `frequency-counting-create-${i}`,
        title: `Create entry for ${value}`,
        explanation: `Value ${value} does not exist yet, so create a new entry.`,
        detail: `${value} → 1`,
        array,
        highlighted: [i],
        active: [i],
        pointers: [{ index: i, label: 'current' }],
        operation: 'move',
        meta: meta({
          phase: 'create-key',
          currentIndex: i,
          currentValue: value,
          currentKey: value,
          previousCount: 0,
          newCount: 1,
          isNewKey: true,
          mostFrequent,
          frequencySnapshot: updatedSnapshot,
        }),
      })
    } else {
      steps.push({
        id: `frequency-counting-increment-${i}`,
        title: `Increase count for ${value}`,
        explanation: `Value ${value} already exists, so increase its count.`,
        detail: `${value} → ${previousCount} + 1`,
        array,
        highlighted: [i],
        active: [i],
        pointers: [{ index: i, label: 'current' }],
        operation: 'move',
        meta: meta({
          phase: 'increment',
          currentIndex: i,
          currentValue: value,
          currentKey: value,
          previousCount,
          newCount,
          isNewKey: false,
          mostFrequent,
          frequencySnapshot: updatedSnapshot,
        }),
      })
    }

    steps.push({
      id: `frequency-counting-updated-${i}`,
      title: `Frequency of ${value} is now ${newCount}`,
      explanation: `The frequency of ${value} is now ${newCount}.`,
      detail: `Map so far: ${formatFrequencyDetail(entriesFromMap(frequency))}`,
      array,
      highlighted: [i],
      active: [i],
      found: [i],
      pointers: [{ index: i, label: 'current' }],
      meta: meta({
        phase: 'frequency-updated',
        currentIndex: i,
        currentValue: value,
        currentKey: value,
        previousCount,
        newCount,
        isNewKey,
        mostFrequent,
        frequencySnapshot: serializeFrequencyEntries(entriesFromMap(frequency)),
      }),
    })
  }

  const finalMap = buildFrequencyMap(array)
  const finalEntries = entriesFromMap(finalMap)

  steps.push({
    id: 'frequency-counting-complete',
    title: 'Frequency counting is complete',
    explanation:
      mostFrequent === null
        ? 'Frequency counting is complete.'
        : `Frequency counting is complete. The most frequent value is ${mostFrequent} (appears ${finalMap.get(mostFrequent)} time${finalMap.get(mostFrequent) === 1 ? '' : 's'}).`,
    detail: `Final map: ${formatFrequencyDetail(finalEntries)}`,
    array,
    sorted: array.map((_, index) => index),
    operation: 'complete',
    meta: meta({
      phase: 'complete',
      currentIndex: -1,
      currentValue: 0,
      currentKey: 0,
      previousCount: 0,
      newCount: 0,
      isNewKey: false,
      mostFrequent,
      frequencySnapshot: serializeFrequencyEntries(finalEntries),
    }),
  })

  return steps
}

function formatFrequencyDetail(entries: readonly FrequencyEntry[]): string {
  if (entries.length === 0) {
    return '(empty)'
  }
  return entries.map((entry) => `${entry.key} → ${entry.count}`).join(', ')
}
