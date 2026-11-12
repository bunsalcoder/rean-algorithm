import { describe, expect, it } from 'vitest'
import {
  assertInvariants,
  clear,
  createEmpty,
  deleteWord,
  getAllWords,
  height,
  insert,
  isEmpty,
  normalizeWord,
  search,
  size,
  snapshotFromWords,
  startsWith,
  TRIE_DEFAULT_WORDS,
} from './trie'
import {
  buildTrieSteps,
  decodeIdList,
  parseTreeSnapshot,
} from './trieSteps'

describe('normalizeWord', () => {
  it('trims, lowercases, and rejects empty input', () => {
    expect(normalizeWord('  Cat ')).toBe('cat')
    expect(normalizeWord('CARD')).toBe('card')
    expect(normalizeWord('')).toBeNull()
    expect(normalizeWord('   ')).toBeNull()
  })
})

describe('Trie insert and search', () => {
  it('inserts and finds complete words', () => {
    let trie = createEmpty()
    expect(isEmpty(trie)).toBe(true)

    const a = insert(trie, 'cat')
    expect(a.accepted).toBe(true)
    expect(a.inserted).toBe(true)
    trie = a.snapshot
    assertInvariants(trie)

    expect(search(trie, 'cat').found).toBe(true)
    expect(search(trie, 'ca').found).toBe(false)
    expect(search(trie, 'dog').found).toBe(false)
    expect(size(trie)).toBe(1)
  })

  it('rejects empty strings consistently', () => {
    const trie = createEmpty()
    expect(insert(trie, '').accepted).toBe(false)
    expect(insert(trie, '  ').inserted).toBe(false)
    expect(search(trie, '').accepted).toBe(false)
    expect(startsWith(trie, '').accepted).toBe(false)
    expect(deleteWord(trie, '').accepted).toBe(false)
    expect(size(trie)).toBe(0)
  })

  it('normalizes case on insert and search', () => {
    let trie = createEmpty()
    trie = insert(trie, 'CaR').snapshot
    expect(search(trie, 'car').found).toBe(true)
    expect(search(trie, 'CAR').found).toBe(true)
    expect(search(trie, 'Car').found).toBe(true)
    expect(getAllWords(trie)).toEqual(['car'])
  })
})

describe('Trie shared prefixes', () => {
  it('reuses the same path for shared prefixes', () => {
    const trie = snapshotFromWords(['cat', 'car', 'card', 'care'])
    assertInvariants(trie)

    // Root → c → a should be shared; branching at r vs t.
    const root = trie.nodes.find((n) => n.id === trie.rootId)!
    expect(root.children.map((e) => e.char)).toEqual(['c'])

    const cNode = trie.nodes.find((n) => n.id === root.children[0]!.childId)!
    expect(cNode.char).toBe('c')
    expect(cNode.children.map((e) => e.char)).toEqual(['a'])

    const aNode = trie.nodes.find((n) => n.id === cNode.children[0]!.childId)!
    expect(aNode.children.map((e) => e.char).sort()).toEqual(['r', 't'])

    expect(size(trie)).toBe(4)
    expect(getAllWords(trie)).toEqual(['car', 'card', 'care', 'cat'])
  })

  it('supports the lesson default word set', () => {
    const trie = snapshotFromWords(TRIE_DEFAULT_WORDS)
    assertInvariants(trie)
    expect(size(trie)).toBe(6)
    expect(getAllWords(trie)).toEqual([
      'car',
      'card',
      'care',
      'cat',
      'dog',
      'door',
    ])
    expect(height(trie)).toBeGreaterThanOrEqual(3)
  })
})

describe('Trie prefix search', () => {
  it('matches prefixes and returns suggestions', () => {
    const trie = snapshotFromWords(TRIE_DEFAULT_WORDS)
    const ca = startsWith(trie, 'ca')
    expect(ca.matched).toBe(true)
    expect(ca.suggestions).toEqual(['car', 'card', 'care', 'cat'])

    const doo = startsWith(trie, 'doo')
    expect(doo.matched).toBe(true)
    expect(doo.suggestions).toEqual(['door'])

    const zz = startsWith(trie, 'zz')
    expect(zz.matched).toBe(false)
    expect(zz.suggestions).toEqual([])
  })

  it('startsWith succeeds even when the prefix itself is not a word', () => {
    const trie = snapshotFromWords(['card'])
    expect(startsWith(trie, 'car').matched).toBe(true)
    expect(search(trie, 'car').found).toBe(false)
  })
})

describe('Trie duplicate insertion', () => {
  it('does not increase word count on duplicates', () => {
    let trie = createEmpty()
    trie = insert(trie, 'dog').snapshot
    const beforeNodes = trie.nodes.length
    const dup = insert(trie, 'DOG')
    expect(dup.inserted).toBe(false)
    expect(dup.accepted).toBe(true)
    expect(size(dup.snapshot)).toBe(1)
    expect(dup.snapshot.nodes.length).toBe(beforeNodes)
  })
})

describe('Trie delete', () => {
  it('deletes a word and updates size', () => {
    let trie = snapshotFromWords(['cat', 'dog'])
    const result = deleteWord(trie, 'cat')
    expect(result.deleted).toBe(true)
    trie = result.snapshot
    assertInvariants(trie)
    expect(search(trie, 'cat').found).toBe(false)
    expect(search(trie, 'dog').found).toBe(true)
    expect(size(trie)).toBe(1)
  })

  it('preserves shared prefixes when deleting a longer word', () => {
    let trie = snapshotFromWords(['car', 'card'])
    const result = deleteWord(trie, 'card')
    expect(result.deleted).toBe(true)
    trie = result.snapshot
    assertInvariants(trie)
    expect(search(trie, 'car').found).toBe(true)
    expect(search(trie, 'card').found).toBe(false)
    expect(startsWith(trie, 'car').matched).toBe(true)
    expect(getAllWords(trie)).toEqual(['car'])
  })

  it('deletes a prefix word while preserving longer words', () => {
    let trie = snapshotFromWords(['car', 'card', 'care'])
    const result = deleteWord(trie, 'car')
    expect(result.deleted).toBe(true)
    trie = result.snapshot
    assertInvariants(trie)
    expect(search(trie, 'car').found).toBe(false)
    expect(search(trie, 'card').found).toBe(true)
    expect(search(trie, 'care').found).toBe(true)
    expect(startsWith(trie, 'car').matched).toBe(true)
    expect(getAllWords(trie)).toEqual(['card', 'care'])
  })

  it('ignores missing word deletion', () => {
    const trie = snapshotFromWords(['cat'])
    const missing = deleteWord(trie, 'dog')
    expect(missing.deleted).toBe(false)
    expect(size(missing.snapshot)).toBe(1)

    const prefixOnly = deleteWord(trie, 'ca')
    expect(prefixOnly.deleted).toBe(false)
    expect(size(prefixOnly.snapshot)).toBe(1)
  })
})

describe('Trie empty, clear, size, and listing', () => {
  it('handles empty trie, clear, and listing', () => {
    const empty = createEmpty()
    expect(isEmpty(empty)).toBe(true)
    expect(size(empty)).toBe(0)
    expect(getAllWords(empty)).toEqual([])

    let trie = snapshotFromWords(['door', 'dog', 'cat'])
    expect(isEmpty(trie)).toBe(false)
    expect(size(trie)).toBe(3)
    expect(getAllWords(trie)).toEqual(['cat', 'dog', 'door'])

    trie = clear(trie)
    expect(isEmpty(trie)).toBe(true)
    expect(size(trie)).toBe(0)
    expect(getAllWords(trie)).toEqual([])
    assertInvariants(trie)
  })
})

describe('Trie visualization steps', () => {
  it('embeds immutable snapshots for insert scrubbing', () => {
    const start = snapshotFromWords(['car'])
    const steps = buildTrieSteps(start, 'insert', 'card')
    expect(steps.length).toBeGreaterThan(3)

    const first = parseTreeSnapshot(String(steps[0]!.meta?.treeSnapshot ?? ''))
    const last = parseTreeSnapshot(
      String(steps[steps.length - 1]!.meta?.treeSnapshot ?? ''),
    )
    expect(getAllWords(first)).toEqual(['car'])
    expect(getAllWords(last)).toEqual(['car', 'card'])
    expect(search(first, 'card').found).toBe(false)

    const path = decodeIdList(steps[steps.length - 1]!.meta?.pathIds)
    expect(path.length).toBeGreaterThan(1)
  })

  it('marks search success only when isEndOfWord is set', () => {
    const trie = snapshotFromWords(['card'])
    const steps = buildTrieSteps(trie, 'search', 'car')
    const last = steps[steps.length - 1]!
    expect(last.meta?.success).toBe(false)
    expect(last.meta?.result).toBe('not-found')
  })
})
