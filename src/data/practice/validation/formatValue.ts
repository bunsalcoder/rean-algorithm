import type { PracticeComparableValue, PracticeTestCaseInput } from './types'

/** Human-readable display for comparable values (UI + feedback). */
export function formatComparableValue(value: PracticeComparableValue): string {
  if (value === null) {
    return 'null'
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : 'NaN'
  }

  if (typeof value === 'string') {
    return JSON.stringify(value)
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => formatComparableValue(item)).join(', ')}]`
  }

  const entries = Object.entries(value)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, entryValue]) => `${key}: ${formatComparableValue(entryValue)}`)

  return `{ ${entries.join(', ')} }`
}

/** Compact input summary for a test case card. */
export function formatTestCaseInput(input: PracticeTestCaseInput): string {
  return Object.entries(input)
    .map(([key, value]) => `${key} = ${formatComparableValue(value)}`)
    .join('; ')
}
