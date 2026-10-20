import type { PracticeComparableValue } from './types'

function isPlainObject(
  value: PracticeComparableValue,
): value is { readonly [key: string]: PracticeComparableValue } {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function sortedPrimitiveKeys(value: {
  readonly [key: string]: PracticeComparableValue
}): string[] {
  return Object.keys(value).sort()
}

/**
 * Multiset equality for arrays of comparable values (order ignored).
 * Nested arrays/objects still use deep ordered comparison after pairing.
 */
function arraysEqualAsMultiset(
  left: readonly PracticeComparableValue[],
  right: readonly PracticeComparableValue[],
): boolean {
  if (left.length !== right.length) {
    return false
  }

  const used = new Array<boolean>(right.length).fill(false)

  for (const leftItem of left) {
    let matched = false

    for (let index = 0; index < right.length; index += 1) {
      if (used[index]) {
        continue
      }

      if (valuesEqual(leftItem, right[index]!)) {
        used[index] = true
        matched = true
        break
      }
    }

    if (!matched) {
      return false
    }
  }

  return true
}

/**
 * Compare nested string[][] groups as in Group Anagrams:
 * group order and word order within each group may differ.
 */
export function groupAnagramsEqual(
  left: readonly PracticeComparableValue[],
  right: readonly PracticeComparableValue[],
): boolean {
  if (left.length !== right.length) {
    return false
  }

  const normalizeGroup = (group: PracticeComparableValue): string[] | null => {
    if (!Array.isArray(group)) {
      return null
    }

    const words: string[] = []
    for (const item of group) {
      if (typeof item !== 'string') {
        return null
      }
      words.push(item)
    }

    return words.sort()
  }

  const leftGroups = left.map(normalizeGroup)
  const rightGroups = right.map(normalizeGroup)

  if (leftGroups.some((group) => group === null)) {
    return false
  }
  if (rightGroups.some((group) => group === null)) {
    return false
  }

  const serialize = (group: string[]) => group.join('\0')
  const leftSerialized = leftGroups
    .map((group) => serialize(group!))
    .sort()
  const rightSerialized = rightGroups
    .map((group) => serialize(group!))
    .sort()

  return leftSerialized.every(
    (value, index) => value === rightSerialized[index],
  )
}

export type CompareOptions = {
  orderIndependent?: boolean
  /** Use group-anagram multiset semantics for string[][]. */
  groupAnagrams?: boolean
}

/**
 * Predictable deep equality for supported practice value types.
 * Does not use JSON.stringify as a universal equality check.
 */
export function valuesEqual(
  left: PracticeComparableValue,
  right: PracticeComparableValue,
  options: CompareOptions = {},
): boolean {
  if (left === right) {
    return true
  }

  if (left === null || right === null) {
    return left === right
  }

  if (typeof left !== typeof right) {
    return false
  }

  if (
    typeof left === 'boolean' ||
    typeof left === 'number' ||
    typeof left === 'string'
  ) {
    return left === right
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    if (options.groupAnagrams) {
      return groupAnagramsEqual(left, right)
    }

    if (options.orderIndependent) {
      return arraysEqualAsMultiset(left, right)
    }

    if (left.length !== right.length) {
      return false
    }

    return left.every((item, index) => valuesEqual(item, right[index]!))
  }

  if (isPlainObject(left) && isPlainObject(right)) {
    const leftKeys = sortedPrimitiveKeys(left)
    const rightKeys = sortedPrimitiveKeys(right)

    if (leftKeys.length !== rightKeys.length) {
      return false
    }

    return leftKeys.every(
      (key, index) =>
        key === rightKeys[index] &&
        valuesEqual(left[key]!, right[key]!),
    )
  }

  return false
}
