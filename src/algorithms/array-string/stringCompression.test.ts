import { describe, expect, it } from 'vitest'
import { compressString } from './stringCompression'
import { buildStringCompressionSteps } from './stringCompressionSteps'

function outputFromFinalStep(input: string): string {
  const steps = buildStringCompressionSteps(input)
  const last = steps[steps.length - 1]
  const output = last?.meta?.output
  return typeof output === 'string' ? output : ''
}

describe('compressString', () => {
  it('compresses aaabbc to a3b2c', () => {
    expect(compressString('aaabbc')).toBe('a3b2c')
  })

  it('leaves abc unchanged', () => {
    expect(compressString('abc')).toBe('abc')
  })

  it('compresses aabbcc to a2b2c2', () => {
    expect(compressString('aabbcc')).toBe('a2b2c2')
  })

  it('compresses aaaaa to a5', () => {
    expect(compressString('aaaaa')).toBe('a5')
  })

  it('compresses aabbaa to a2b2a2', () => {
    expect(compressString('aabbaa')).toBe('a2b2a2')
  })

  it('handles empty input', () => {
    expect(compressString('')).toBe('')
  })

  it('handles a single character', () => {
    expect(compressString('a')).toBe('a')
    expect(compressString('z')).toBe('z')
  })

  it('compresses repeated whitespace', () => {
    // 'a' + two spaces + 'b' → a, then space with count 2, then b
    expect(compressString('a  b')).toBe('a 2b')
    expect(compressString('   ')).toBe(' 3')
  })

  it('is case-sensitive for runs', () => {
    expect(compressString('aaAA')).toBe('a2A2')
    expect(compressString('AaaA')).toBe('Aa2A')
  })

  it('does not merge non-consecutive repeats', () => {
    expect(compressString('aba')).toBe('aba')
    expect(compressString('aabaa')).toBe('a2ba2')
  })

  it('does not mutate the original string', () => {
    const input = 'aaabbc'
    const copy = input
    compressString(input)
    expect(input).toBe(copy)
    expect(input).toBe('aaabbc')
  })
})

describe('buildStringCompressionSteps', () => {
  it('final output matches compressString for the default example', () => {
    expect(outputFromFinalStep('aaabbc')).toBe(compressString('aaabbc'))
  })

  it('final output matches compressString for edge cases', () => {
    for (const input of [
      '',
      'a',
      'abc',
      'aabbcc',
      'aaaaa',
      'aabbaa',
      'aaAA',
      'a  b',
      'aba',
    ]) {
      expect(outputFromFinalStep(input)).toBe(compressString(input))
    }
  })

  it('marks the final step complete', () => {
    const steps = buildStringCompressionSteps('aaabbc')
    const last = steps[steps.length - 1]
    expect(last?.meta?.phase).toBe('complete')
    expect(last?.meta?.isComplete).toBe(true)
    expect(last?.operation).toBe('complete')
  })
})
