/**
 * Trie (Prefix Tree) — pure data-structure module.
 *
 * Each edge from a parent to a child is labeled with one character.
 * Words that share a prefix reuse the same path from the root.
 * A node marks a complete word with `isEndOfWord`.
 *
 * Educational policy:
 * - Keys are normalized to lowercase Unicode (`toLowerCase()`).
 * - Empty strings (after trim) are rejected for insert / search /
 *   startsWith / delete — the root alone is never a stored word.
 * - Duplicate inserts do not increase the word count.
 *
 * Children are stored as a character → child-id map (serialized as a
 * sorted edge list in snapshots). Mutating helpers return new snapshots
 * so historical visualization frames stay immutable. Independent of React.
 *
 * Complexity (L = length of the input word/prefix; Map child lookup is
 * treated as O(1) average for a typical alphabet):
 * - insert / search / startsWith / delete: O(L) average
 * - getAllWords: O(total characters traversed in the trie)
 * - space: O(number of trie nodes)
 * Actual cost also depends on the child-node representation and alphabet size.
 */

/** One directed edge from a parent to a child character node. */
export type TrieEdge = {
  readonly char: string
  readonly childId: string
}

/** Flat, JSON-friendly node for visualization frames. */
export type TrieNodeSnapshot = {
  readonly id: string
  /**
   * Character on the edge that created this node.
   * The root uses an empty string.
   */
  readonly char: string
  readonly parentId: string | null
  readonly children: readonly TrieEdge[]
  readonly isEndOfWord: boolean
}

/**
 * Immutable Trie snapshot.
 * Each historical step owns its own node array so scrubbing prev/next
 * cannot rewrite earlier frames.
 */
export type TrieSnapshot = {
  readonly rootId: string
  readonly nodes: readonly TrieNodeSnapshot[]
  /** Number of distinct complete words currently stored. */
  readonly wordCount: number
  /** Monotonic counter used when allocating new node ids. */
  readonly nextIdCounter: number
}

/** Default playground words — showcase shared prefixes (ca*, do*). */
export const TRIE_DEFAULT_WORDS = [
  'cat',
  'car',
  'card',
  'care',
  'dog',
  'door',
] as const

export const TRIE_ALT_WORDS = [
  'app',
  'apple',
  'apply',
  'apt',
  'bat',
  'batch',
] as const

export const TRIE_SINGLE_WORD = ['hello'] as const

/** Autocomplete demo lexicon (normalized lowercase). */
export const TRIE_AUTOCOMPLETE_WORDS = [
  'cat',
  'car',
  'card',
  'care',
  'cargo',
  'dog',
  'door',
  'dorm',
  'dot',
  'apple',
  'apply',
  'app',
  'banana',
  'band',
  'bank',
] as const

export const TRIE_WORD_PRESETS = [
  {
    id: 'lesson-default',
    label: 'cat · car · card · care · dog · door',
    words: TRIE_DEFAULT_WORDS,
  },
  {
    id: 'app-family',
    label: 'app · apple · apply · apt · bat · batch',
    words: TRIE_ALT_WORDS,
  },
  {
    id: 'single',
    label: 'Single word',
    words: TRIE_SINGLE_WORD,
  },
  {
    id: 'empty',
    label: 'Empty trie',
    words: [] as const,
  },
] as const

/**
 * Normalize a raw string for trie storage.
 * Trims whitespace, lowercases, and returns null when the result is empty.
 */
export function normalizeWord(raw: string): string | null {
  const normalized = raw.trim().toLowerCase()
  return normalized.length === 0 ? null : normalized
}

/** Empty trie: a single root node with no children and no end marker. */
export function createEmpty(): TrieSnapshot {
  return {
    rootId: 'n0',
    nodes: [
      {
        id: 'n0',
        char: '',
        parentId: null,
        children: [],
        isEndOfWord: false,
      },
    ],
    wordCount: 0,
    nextIdCounter: 1,
  }
}

/** Deep-clone so later frames cannot rewrite history. */
export function cloneSnapshot(snapshot: TrieSnapshot): TrieSnapshot {
  return {
    rootId: snapshot.rootId,
    wordCount: snapshot.wordCount,
    nextIdCounter: snapshot.nextIdCounter,
    nodes: snapshot.nodes.map((node) => ({
      id: node.id,
      char: node.char,
      parentId: node.parentId,
      isEndOfWord: node.isEndOfWord,
      children: node.children.map((edge) => ({
        char: edge.char,
        childId: edge.childId,
      })),
    })),
  }
}

/** Allocate the next stable node id (`n0`, `n1`, …). */
export function allocateNodeId(
  snapshot: TrieSnapshot,
): { id: string; nextIdCounter: number } {
  return {
    id: `n${snapshot.nextIdCounter}`,
    nextIdCounter: snapshot.nextIdCounter + 1,
  }
}

function nodeMap(snapshot: TrieSnapshot): Map<string, TrieNodeSnapshot> {
  return new Map(snapshot.nodes.map((node) => [node.id, node]))
}

function childMap(node: TrieNodeSnapshot): Map<string, string> {
  return new Map(node.children.map((edge) => [edge.char, edge.childId]))
}

function sortedEdges(edges: Iterable<TrieEdge>): TrieEdge[] {
  return [...edges].sort((a, b) =>
    a.char < b.char ? -1 : a.char > b.char ? 1 : 0,
  )
}

function replaceNode(
  snapshot: TrieSnapshot,
  next: TrieNodeSnapshot,
): TrieSnapshot {
  const nodes = snapshot.nodes.map((node) => (node.id === next.id ? next : node))
  return { ...snapshot, nodes }
}

function addNode(snapshot: TrieSnapshot, node: TrieNodeSnapshot): TrieSnapshot {
  return { ...snapshot, nodes: [...snapshot.nodes, node] }
}

function removeNodes(
  snapshot: TrieSnapshot,
  removeIds: ReadonlySet<string>,
): TrieSnapshot {
  if (removeIds.size === 0) {
    return snapshot
  }
  return {
    ...snapshot,
    nodes: snapshot.nodes.filter((node) => !removeIds.has(node.id)),
  }
}

/**
 * Walk from the root following each character of `word`.
 * Returns the path of node ids (including root) when the full path exists,
 * otherwise null plus the path walked so far.
 */
export function walkPath(
  snapshot: TrieSnapshot,
  word: string,
): {
  complete: boolean
  pathIds: string[]
  lastId: string
} {
  const byId = nodeMap(snapshot)
  const pathIds = [snapshot.rootId]
  let currentId = snapshot.rootId

  for (const char of word) {
    const current = byId.get(currentId)
    if (!current) {
      return { complete: false, pathIds, lastId: currentId }
    }
    const nextId = childMap(current).get(char)
    if (!nextId) {
      return { complete: false, pathIds, lastId: currentId }
    }
    pathIds.push(nextId)
    currentId = nextId
  }

  return { complete: true, pathIds, lastId: currentId }
}

export type TrieInsertResult = {
  snapshot: TrieSnapshot
  /** True when a new word was added (not a duplicate). */
  inserted: boolean
  /** False when the input normalized to empty. */
  accepted: boolean
  pathIds: string[]
  /** Node ids created during this insert (empty on duplicates / rejects). */
  createdIds: string[]
  endNodeId: string | null
  normalized: string | null
}

/**
 * Insert a word. Duplicates leave the trie unchanged and do not bump wordCount.
 * Empty input (after normalize) is rejected.
 */
export function insert(snapshot: TrieSnapshot, raw: string): TrieInsertResult {
  const normalized = normalizeWord(raw)
  if (normalized === null) {
    return {
      snapshot,
      inserted: false,
      accepted: false,
      pathIds: [snapshot.rootId],
      createdIds: [],
      endNodeId: null,
      normalized: null,
    }
  }

  let next = cloneSnapshot(snapshot)
  const pathIds = [next.rootId]
  const createdIds: string[] = []
  let currentId = next.rootId

  for (const char of normalized) {
    const byId = nodeMap(next)
    const current = byId.get(currentId)!
    const existing = childMap(current).get(char)
    if (existing) {
      pathIds.push(existing)
      currentId = existing
      continue
    }

    const { id, nextIdCounter } = allocateNodeId(next)
    next = { ...next, nextIdCounter }
    const child: TrieNodeSnapshot = {
      id,
      char,
      parentId: currentId,
      children: [],
      isEndOfWord: false,
    }
    next = addNode(next, child)
    next = replaceNode(next, {
      ...current,
      children: sortedEdges([...current.children, { char, childId: id }]),
    })
    createdIds.push(id)
    pathIds.push(id)
    currentId = id
  }

  const endNode = nodeMap(next).get(currentId)!
  if (endNode.isEndOfWord) {
    return {
      snapshot: next,
      inserted: false,
      accepted: true,
      pathIds,
      createdIds,
      endNodeId: currentId,
      normalized,
    }
  }

  next = replaceNode(next, { ...endNode, isEndOfWord: true })
  next = { ...next, wordCount: next.wordCount + 1 }

  return {
    snapshot: next,
    inserted: true,
    accepted: true,
    pathIds,
    createdIds,
    endNodeId: currentId,
    normalized,
  }
}

export type TrieSearchResult = {
  found: boolean
  accepted: boolean
  pathIds: string[]
  endNodeId: string | null
  normalized: string | null
}

/** Search for a complete word (must end on an `isEndOfWord` node). */
export function search(snapshot: TrieSnapshot, raw: string): TrieSearchResult {
  const normalized = normalizeWord(raw)
  if (normalized === null) {
    return {
      found: false,
      accepted: false,
      pathIds: [snapshot.rootId],
      endNodeId: null,
      normalized: null,
    }
  }

  const walk = walkPath(snapshot, normalized)
  if (!walk.complete) {
    return {
      found: false,
      accepted: true,
      pathIds: walk.pathIds,
      endNodeId: null,
      normalized,
    }
  }

  const end = nodeMap(snapshot).get(walk.lastId)
  const found = Boolean(end?.isEndOfWord)
  return {
    found,
    accepted: true,
    pathIds: walk.pathIds,
    endNodeId: walk.lastId,
    normalized,
  }
}

export type TriePrefixResult = {
  matched: boolean
  accepted: boolean
  pathIds: string[]
  prefixNodeId: string | null
  normalized: string | null
  suggestions: string[]
}

/**
 * Prefix search: true when every character of the prefix exists as a path.
 * Also returns up to `limit` word suggestions under that prefix node.
 */
export function startsWith(
  snapshot: TrieSnapshot,
  raw: string,
  limit = 20,
): TriePrefixResult {
  const normalized = normalizeWord(raw)
  if (normalized === null) {
    return {
      matched: false,
      accepted: false,
      pathIds: [snapshot.rootId],
      prefixNodeId: null,
      normalized: null,
      suggestions: [],
    }
  }

  const walk = walkPath(snapshot, normalized)
  if (!walk.complete) {
    return {
      matched: false,
      accepted: true,
      pathIds: walk.pathIds,
      prefixNodeId: null,
      normalized,
      suggestions: [],
    }
  }

  const suggestions = collectWordsFrom(
    snapshot,
    walk.lastId,
    normalized,
    limit,
  )

  return {
    matched: true,
    accepted: true,
    pathIds: walk.pathIds,
    prefixNodeId: walk.lastId,
    normalized,
    suggestions,
  }
}

export type TrieDeleteResult = {
  snapshot: TrieSnapshot
  deleted: boolean
  accepted: boolean
  pathIds: string[]
  removedIds: string[]
  endNodeId: string | null
  normalized: string | null
}

/**
 * Delete a complete word.
 * Only removes nodes that are no longer needed — shared-prefix siblings
 * and longer words that continue past this node are preserved.
 */
export function deleteWord(
  snapshot: TrieSnapshot,
  raw: string,
): TrieDeleteResult {
  const normalized = normalizeWord(raw)
  if (normalized === null) {
    return {
      snapshot,
      deleted: false,
      accepted: false,
      pathIds: [snapshot.rootId],
      removedIds: [],
      endNodeId: null,
      normalized: null,
    }
  }

  const walk = walkPath(snapshot, normalized)
  if (!walk.complete) {
    return {
      snapshot,
      deleted: false,
      accepted: true,
      pathIds: walk.pathIds,
      removedIds: [],
      endNodeId: null,
      normalized,
    }
  }

  const byId = nodeMap(snapshot)
  const end = byId.get(walk.lastId)
  if (!end || !end.isEndOfWord) {
    return {
      snapshot,
      deleted: false,
      accepted: true,
      pathIds: walk.pathIds,
      removedIds: [],
      endNodeId: walk.lastId,
      normalized,
    }
  }

  let next = cloneSnapshot(snapshot)
  next = replaceNode(next, { ...nodeMap(next).get(walk.lastId)!, isEndOfWord: false })
  next = { ...next, wordCount: Math.max(0, next.wordCount - 1) }

  const removedIds: string[] = []

  // Walk back toward the root, pruning nodes with no children and no end mark.
  for (let i = walk.pathIds.length - 1; i >= 1; i -= 1) {
    const id = walk.pathIds[i]!
    const node = nodeMap(next).get(id)
    if (!node) {
      break
    }
    if (node.isEndOfWord || node.children.length > 0) {
      break
    }

    const parentId = node.parentId
    if (!parentId) {
      break
    }
    const parent = nodeMap(next).get(parentId)
    if (!parent) {
      break
    }

    next = replaceNode(next, {
      ...parent,
      children: parent.children.filter((edge) => edge.childId !== id),
    })
    next = removeNodes(next, new Set([id]))
    removedIds.push(id)
  }

  return {
    snapshot: next,
    deleted: true,
    accepted: true,
    pathIds: walk.pathIds,
    removedIds,
    endNodeId: walk.lastId,
    normalized,
  }
}

function collectWordsFrom(
  snapshot: TrieSnapshot,
  nodeId: string,
  prefix: string,
  limit: number,
): string[] {
  const byId = nodeMap(snapshot)
  const results: string[] = []

  function dfs(id: string, built: string) {
    if (results.length >= limit) {
      return
    }
    const node = byId.get(id)
    if (!node) {
      return
    }
    if (node.isEndOfWord && built.length > 0) {
      results.push(built)
    }
    for (const edge of node.children) {
      if (results.length >= limit) {
        return
      }
      dfs(edge.childId, built + edge.char)
    }
  }

  dfs(nodeId, prefix)
  return results
}

/** List all stored words in lexicographic order (via sorted child edges). */
export function getAllWords(snapshot: TrieSnapshot): string[] {
  return collectWordsFrom(snapshot, snapshot.rootId, '', Number.POSITIVE_INFINITY)
}

/** Number of distinct complete words. */
export function size(snapshot: TrieSnapshot): number {
  return snapshot.wordCount
}

/** True when no complete words are stored (root may still exist). */
export function isEmpty(snapshot: TrieSnapshot): boolean {
  return snapshot.wordCount === 0
}

/** Reset to a fresh empty trie. */
export function clear(_snapshot: TrieSnapshot): TrieSnapshot {
  return createEmpty()
}

/** Build a snapshot by inserting words left-to-right (duplicates skipped). */
export function snapshotFromWords(
  words: readonly string[],
): TrieSnapshot {
  let snapshot = createEmpty()
  for (const word of words) {
    snapshot = insert(snapshot, word).snapshot
  }
  return snapshot
}

/** Height in edges from root to deepest node (−1 if somehow empty). */
export function height(snapshot: TrieSnapshot): number {
  if (snapshot.nodes.length === 0) {
    return -1
  }
  const byId = nodeMap(snapshot)
  let maxDepth = 0

  function walk(id: string, depth: number) {
    maxDepth = Math.max(maxDepth, depth)
    const node = byId.get(id)
    if (!node) {
      return
    }
    for (const edge of node.children) {
      walk(edge.childId, depth + 1)
    }
  }

  walk(snapshot.rootId, 0)
  return maxDepth
}

/** Compact debug string of stored words. */
export function formatTrie(snapshot: TrieSnapshot): string {
  const words = getAllWords(snapshot)
  return words.length === 0 ? '(empty)' : words.join(', ')
}

/** Lightweight invariant checks for tests. */
export function assertInvariants(snapshot: TrieSnapshot): void {
  const byId = nodeMap(snapshot)
  if (!byId.has(snapshot.rootId)) {
    throw new Error('Trie root missing')
  }
  const root = byId.get(snapshot.rootId)!
  if (root.parentId !== null || root.char !== '') {
    throw new Error('Invalid trie root')
  }

  let ends = 0
  for (const node of snapshot.nodes) {
    if (node.isEndOfWord) {
      ends += 1
    }
    const seen = new Set<string>()
    for (const edge of node.children) {
      if (seen.has(edge.char)) {
        throw new Error(`Duplicate child edge for '${edge.char}'`)
      }
      seen.add(edge.char)
      const child = byId.get(edge.childId)
      if (!child) {
        throw new Error(`Missing child ${edge.childId}`)
      }
      if (child.parentId !== node.id) {
        throw new Error(`Bad parent link for ${edge.childId}`)
      }
      if (child.char !== edge.char) {
        throw new Error(`Edge/char mismatch for ${edge.childId}`)
      }
    }
  }

  if (ends !== snapshot.wordCount) {
    throw new Error(
      `wordCount ${snapshot.wordCount} != end markers ${ends}`,
    )
  }
}
