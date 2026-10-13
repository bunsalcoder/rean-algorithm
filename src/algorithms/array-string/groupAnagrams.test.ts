import { describe, expect, it } from 'vitest'
import {
  groupAnagrams,
  parseGroupAnagramsInput,
  wordSignature,
} from './groupAnagrams'
import {
  buildGroupAnagramsSteps,
  parseGroupAnagramsGroups,
} from './groupAnagramsSteps'

function groupsFromFinalStep(words: readonly string[]): string[][] {
  const steps = buildGroupAnagramsSteps(words)
  const last = steps[steps.length - 1]
  const snapshot =
    typeof last?.meta?.groupsSnapshot === 'string'
      ? last.meta.groupsSnapshot
      : '[]'
  return parseGroupAnagramsGroups(snapshot)
}

describe('wordSignature', () => {
  it('sorts characters for grouping', () => {
    expect(wordSignature('eat')).toBe('aet')
    expect(wordSignature('tea')).toBe('aet')
    expect(wordSignature('tan')).toBe('ant')
  })
})

describe('groupAnagrams', () => {
  it('groups the standard example', () => {
    expect(
      groupAnagrams(['eat', 'tea', 'tan', 'ate', 'nat', 'bat']),
    ).toEqual([
      ['eat', 'tea', 'ate'],
      ['tan', 'nat'],
      ['bat'],
    ])
  })

  it('handles empty input', () => {
    expect(groupAnagrams([])).toEqual([])
  })

  it('handles a single empty string', () => {
    expect(groupAnagrams([''])).toEqual([['']])
  })

  it('handles a single word', () => {
    expect(groupAnagrams(['a'])).toEqual([['a']])
  })

  it('separates non-anagrams of different lengths', () => {
    expect(groupAnagrams(['ab', 'ba', 'abc', 'cab'])).toEqual([
      ['ab', 'ba'],
      ['abc', 'cab'],
    ])
  })

  it('keeps repeated identical words in input order', () => {
    expect(groupAnagrams(['eat', 'eat', 'tea'])).toEqual([
      ['eat', 'eat', 'tea'],
    ])
  })

  it('is case-sensitive', () => {
    expect(groupAnagrams(['a', 'A'])).toEqual([['a'], ['A']])
  })

  it('treats spaces as significant characters', () => {
    expect(groupAnagrams(['a ', ' a'])).toEqual([['a ', ' a']])
    expect(groupAnagrams(['a ', 'a'])).toEqual([['a '], ['a']])
  })

  it('preserves punctuation in signatures', () => {
    expect(groupAnagrams(['a!', '!a'])).toEqual([['a!', '!a']])
  })
})

describe('parseGroupAnagramsInput', () => {
  it('parses JSON arrays', () => {
    expect(parseGroupAnagramsInput('["eat","tea"]')).toEqual({
      ok: true,
      words: ['eat', 'tea'],
    })
  })

  it('rejects invalid JSON', () => {
    expect(parseGroupAnagramsInput('[eat]')).toMatchObject({ ok: false })
  })
})

describe('buildGroupAnagramsSteps', () => {
  it('matches algorithm output on the final step', () => {
    const words = ['eat', 'tea', 'tan', 'ate', 'nat', 'bat']
    expect(groupsFromFinalStep(words)).toEqual(groupAnagrams(words))
  })

  it('matches for edge cases', () => {
    for (const words of [
      [],
      [''],
      ['a'],
      ['a', 'A'],
      ['eat', 'eat', 'tea'],
    ]) {
      expect(groupsFromFinalStep(words)).toEqual(groupAnagrams(words))
    }
  })
})
