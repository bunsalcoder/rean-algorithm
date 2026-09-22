export const BINARY_SEARCH_ARRAY = [2, 5, 8, 12, 16, 23, 38, 45, 56] as const

export type BinarySearchOutcome = 'searching' | 'found' | 'not-found'

export type BinarySearchFrame = {
  low: number
  high: number
  mid: number | null
  outcome: BinarySearchOutcome
  foundIndex: number | null
  explanation: string
  summary: string
}

/**
 * Educational iterative binary search used by the visualization.
 * Prefer readability over clever bit tricks.
 */
export function binarySearch(array: readonly number[], target: number): number {
  let low = 0
  let high = array.length - 1

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)

    if (array[mid] === target) {
      return mid
    }

    if (array[mid] < target) {
      low = mid + 1
    } else {
      high = mid - 1
    }
  }

  return -1
}

export function buildBinarySearchFrames(
  array: readonly number[],
  target: number,
): BinarySearchFrame[] {
  const frames: BinarySearchFrame[] = []
  let low = 0
  let high = array.length - 1

  frames.push({
    low,
    high,
    mid: null,
    outcome: 'searching',
    foundIndex: null,
    summary: 'Start the search',
    explanation: `We are searching for ${target} in a sorted array of ${array.length} elements.\n\nSet low to 0 and high to ${high}. The current search range is the whole array.`,
  })

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const midValue = array[mid]

    frames.push({
      low,
      high,
      mid,
      outcome: 'searching',
      foundIndex: null,
      summary: `Check mid at index ${mid}`,
      explanation: `We are searching between index ${low} and index ${high}.\n\nThe middle index is ${mid}.\n\narr[${mid}] = ${midValue}.`,
    })

    if (midValue === target) {
      frames.push({
        low,
        high,
        mid,
        outcome: 'found',
        foundIndex: mid,
        summary: `Target ${target} found!`,
        explanation: `arr[${mid}] === ${target}.\n\nTarget ${target} found!\n\nIndex: ${mid}\n\nBinary Search stops here because we found an exact match.`,
      })
      return frames
    }

    if (midValue < target) {
      const nextLow = mid + 1
      frames.push({
        low: nextLow,
        high,
        mid,
        outcome: 'searching',
        foundIndex: null,
        summary: `Move low to ${nextLow}`,
        explanation: `The target ${target} is greater than ${midValue}, so everything to the left of mid can be ignored.\n\nMove low to index ${nextLow}.\n\nNew range: [${nextLow}, ${high}].`,
      })
      low = nextLow
    } else {
      const nextHigh = mid - 1
      frames.push({
        low,
        high: nextHigh,
        mid,
        outcome: 'searching',
        foundIndex: null,
        summary: `Move high to ${nextHigh}`,
        explanation: `The target ${target} is smaller than ${midValue}, so everything to the right of mid can be ignored.\n\nMove high to index ${nextHigh}.\n\nNew range: [${low}, ${nextHigh}].`,
      })
      high = nextHigh
    }
  }

  frames.push({
    low,
    high,
    mid: null,
    outcome: 'not-found',
    foundIndex: null,
    summary: `Target ${target} was not found.`,
    explanation: `Target ${target} was not found.\n\nBinary Search stops when low > high (here low = ${low}, high = ${high}). That means the search range is empty — the target is not in the array.`,
  })

  return frames
}
