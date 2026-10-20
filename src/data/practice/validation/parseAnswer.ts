import type { CandidateAnswerKind, PracticeComparableValue } from './types'

export type ParseAnswerResult =
  | { ok: true; value: PracticeComparableValue }
  | { ok: false; error: string }

function trimInput(raw: string): string {
  return raw.trim()
}

function parseInteger(raw: string): ParseAnswerResult {
  const text = trimInput(raw)

  if (text === '') {
    return { ok: false, error: 'Enter an integer answer.' }
  }

  if (!/^-?\d+$/.test(text)) {
    return {
      ok: false,
      error: 'Answer must be a whole number (for example 3 or -1).',
    }
  }

  const value = Number(text)

  if (!Number.isSafeInteger(value)) {
    return { ok: false, error: 'Number is outside the safe integer range.' }
  }

  return { ok: true, value }
}

function parseNullishNumber(raw: string): ParseAnswerResult {
  const text = trimInput(raw).toLowerCase()

  if (text === 'null' || text === 'none') {
    return { ok: true, value: null }
  }

  return parseInteger(raw)
}

function parseBoolean(raw: string): ParseAnswerResult {
  const text = trimInput(raw).toLowerCase()

  if (text === 'true' || text === '1' || text === 'yes') {
    return { ok: true, value: true }
  }

  if (text === 'false' || text === '0' || text === 'no') {
    return { ok: true, value: false }
  }

  return {
    ok: false,
    error: 'Answer must be true or false.',
  }
}

function parseNumberArray(raw: string): ParseAnswerResult {
  const text = trimInput(raw)

  if (text === '') {
    return { ok: false, error: 'Enter an array of integers, for example [0, 6].' }
  }

  const withoutBrackets =
    text.startsWith('[') && text.endsWith(']')
      ? text.slice(1, -1).trim()
      : text

  if (withoutBrackets === '') {
    return { ok: true, value: [] }
  }

  const parts = withoutBrackets.split(',').map((part) => part.trim())
  const values: number[] = []

  for (const part of parts) {
    const parsed = parseInteger(part)
    if (!parsed.ok) {
      return {
        ok: false,
        error: `Invalid array element “${part}”. Use integers separated by commas.`,
      }
    }
    values.push(parsed.value as number)
  }

  return { ok: true, value: values }
}

/**
 * Parse a small object of integer fields from a restricted literal shape.
 * Accepts `{ maxSum: 6, start: 3, end: 6 }` or `maxSum: 6, start: 3, end: 6`.
 * Does not use eval or Function.
 */
function parseIntegerObject(
  raw: string,
  requiredKeys: readonly string[],
): ParseAnswerResult {
  let text = trimInput(raw)

  if (text === '') {
    return {
      ok: false,
      error: `Enter an object with keys ${requiredKeys.join(', ')}.`,
    }
  }

  if (text.startsWith('{') && text.endsWith('}')) {
    text = text.slice(1, -1).trim()
  }

  if (text === '') {
    return { ok: false, error: 'Object cannot be empty.' }
  }

  const entries = new Map<string, number>()
  const parts = text.split(',')

  for (const part of parts) {
    const separatorIndex = part.indexOf(':')
    if (separatorIndex === -1) {
      return {
        ok: false,
        error: `Could not parse “${part.trim()}”. Use key: value pairs.`,
      }
    }

    const key = part.slice(0, separatorIndex).trim()
    const valueText = part.slice(separatorIndex + 1).trim()

    if (!requiredKeys.includes(key)) {
      return {
        ok: false,
        error: `Unexpected key “${key}”. Expected keys: ${requiredKeys.join(', ')}.`,
      }
    }

    const parsed = parseInteger(valueText)
    if (!parsed.ok) {
      return {
        ok: false,
        error: `Invalid value for “${key}”: ${parsed.error}`,
      }
    }

    entries.set(key, parsed.value as number)
  }

  for (const key of requiredKeys) {
    if (!entries.has(key)) {
      return { ok: false, error: `Missing required key “${key}”.` }
    }
  }

  const value: { [key: string]: PracticeComparableValue } = {}
  for (const key of requiredKeys) {
    value[key] = entries.get(key)!
  }

  return { ok: true, value }
}

/**
 * Safely parse a structured candidate answer for the given kind.
 * Never evaluates code.
 */
export function parseCandidateAnswer(
  raw: string,
  kind: CandidateAnswerKind,
): ParseAnswerResult {
  switch (kind) {
    case 'number':
      return parseInteger(raw)
    case 'boolean':
      return parseBoolean(raw)
    case 'nullish_number':
      return parseNullishNumber(raw)
    case 'number_array':
      return parseNumberArray(raw)
    case 'kadane_result':
      return parseIntegerObject(raw, ['maxSum', 'start', 'end'])
    case 'longest_substring_result':
      return parseIntegerObject(raw, ['length', 'start', 'end'])
    case 'none':
      return {
        ok: false,
        error: 'This problem does not accept a structured candidate answer.',
      }
    default: {
      const _exhaustive: never = kind
      return { ok: false, error: `Unsupported answer kind: ${_exhaustive}` }
    }
  }
}
