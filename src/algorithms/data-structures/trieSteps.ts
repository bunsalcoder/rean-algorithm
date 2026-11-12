/**
 * Step generator for Trie visualization.
 *
 * Each step embeds an immutable `treeSnapshot` so previous/next scrubbing
 * never mutates historical frames. Pure data — no React.
 */

import type { VisualizationStep } from '../../components/visualizations/types'
import {
  allocateNodeId,
  assertInvariants,
  cloneSnapshot,
  createEmpty,
  deleteWord as treeDelete,
  formatTrie,
  getAllWords,
  height,
  isEmpty,
  normalizeWord,
  search as treeSearch,
  size,
  startsWith as treeStartsWith,
  walkPath,
  type TrieNodeSnapshot,
  type TrieSnapshot,
} from './trie'

export type TrieOperation =
  | 'insert'
  | 'search'
  | 'starts-with'
  | 'delete'
  | 'list-words'

export type TriePhase =
  | 'initialize'
  | 'normalize'
  | 'visit-root'
  | 'follow-char'
  | 'create-node'
  | 'reuse-node'
  | 'mark-end'
  | 'duplicate'
  | 'found'
  | 'not-found'
  | 'prefix-found'
  | 'prefix-missing'
  | 'unmark-end'
  | 'prune-node'
  | 'list'
  | 'invalid'
  | 'complete'

type StepMetaFields = {
  phase: TriePhase
  operation: TrieOperation
  treeSnapshot: string
  rootId: string | null
  activeId: string | null
  pathIds: string
  visitedIds: string
  focusId: string | null
  insertId: string | null
  deleteId: string | null
  endMarkerIds: string
  currentChar: string | null
  charIndex: number | null
  operand: string | null
  result: string | null
  success: boolean | null
  message: string
  treeHeight: number
  treeSize: number
  wordList: string
}

/** Serialize a snapshot for VisualizationStep.meta. */
export function serializeTreeSnapshot(snapshot: TrieSnapshot): string {
  return JSON.stringify({
    rootId: snapshot.rootId,
    wordCount: snapshot.wordCount,
    nextIdCounter: snapshot.nextIdCounter,
    nodes: snapshot.nodes,
  })
}

/** Parse a tree snapshot produced by serializeTreeSnapshot. */
export function parseTreeSnapshot(raw: string): TrieSnapshot {
  if (!raw) {
    return createEmpty()
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return createEmpty()
    }

    const record = parsed as Record<string, unknown>
    const rootId =
      typeof record.rootId === 'string' ? record.rootId : 'n0'
    const nextIdCounter =
      typeof record.nextIdCounter === 'number' &&
      Number.isFinite(record.nextIdCounter)
        ? Math.max(0, Math.floor(record.nextIdCounter))
        : 1
    const wordCount =
      typeof record.wordCount === 'number' && Number.isFinite(record.wordCount)
        ? Math.max(0, Math.floor(record.wordCount))
        : 0

    const nodesRaw = record.nodes
    if (!Array.isArray(nodesRaw)) {
      return createEmpty()
    }

    const nodes: TrieNodeSnapshot[] = []
    for (const item of nodesRaw) {
      if (!item || typeof item !== 'object') {
        continue
      }
      const node = item as Record<string, unknown>
      if (
        typeof node.id !== 'string' ||
        typeof node.char !== 'string' ||
        !(typeof node.parentId === 'string' || node.parentId === null) ||
        typeof node.isEndOfWord !== 'boolean' ||
        !Array.isArray(node.children)
      ) {
        continue
      }

      const children = []
      for (const edgeRaw of node.children) {
        if (!edgeRaw || typeof edgeRaw !== 'object') {
          continue
        }
        const edge = edgeRaw as Record<string, unknown>
        if (typeof edge.char !== 'string' || typeof edge.childId !== 'string') {
          continue
        }
        children.push({ char: edge.char, childId: edge.childId })
      }

      nodes.push({
        id: node.id,
        char: node.char,
        parentId: node.parentId as string | null,
        isEndOfWord: node.isEndOfWord,
        children,
      })
    }

    if (nodes.length === 0) {
      return createEmpty()
    }

    return { rootId, nodes, wordCount, nextIdCounter }
  } catch {
    return createEmpty()
  }
}

export function encodeIdList(ids: readonly string[]): string {
  return ids.join(',')
}

export function decodeIdList(raw: unknown): string[] {
  if (typeof raw !== 'string' || raw.length === 0) {
    return []
  }
  return raw.split(',').filter(Boolean)
}

export function encodeWordList(words: readonly string[]): string {
  return words.join('|')
}

export function decodeWordList(raw: unknown): string[] {
  if (typeof raw !== 'string' || raw.length === 0) {
    return []
  }
  return raw.split('|').filter((word) => word.length > 0)
}

function endMarkerIdsOf(snapshot: TrieSnapshot): string[] {
  return snapshot.nodes.filter((n) => n.isEndOfWord).map((n) => n.id)
}

function meta(fields: StepMetaFields): NonNullable<VisualizationStep['meta']> {
  return {
    phase: fields.phase,
    operation: fields.operation,
    treeSnapshot: fields.treeSnapshot,
    rootId: fields.rootId,
    activeId: fields.activeId,
    pathIds: fields.pathIds,
    visitedIds: fields.visitedIds,
    focusId: fields.focusId,
    insertId: fields.insertId,
    deleteId: fields.deleteId,
    endMarkerIds: fields.endMarkerIds,
    currentChar: fields.currentChar,
    charIndex: fields.charIndex,
    operand: fields.operand,
    result: fields.result,
    success: fields.success,
    message: fields.message,
    treeHeight: fields.treeHeight,
    treeSize: fields.treeSize,
    wordList: fields.wordList,
  }
}

function pushStep(
  steps: VisualizationStep[],
  options: {
    id: string
    title: string
    explanation: string
    detail?: string
    snapshot: TrieSnapshot
    phase: TriePhase
    operation: TrieOperation
    activeId?: string | null
    pathIds?: readonly string[]
    visitedIds?: readonly string[]
    focusId?: string | null
    insertId?: string | null
    deleteId?: string | null
    currentChar?: string | null
    charIndex?: number | null
    operand?: string | null
    result?: string | null
    success?: boolean | null
    message: string
  },
) {
  const snapshot = cloneSnapshot(options.snapshot)
  assertInvariants(snapshot)
  const pathIds = options.pathIds ?? []
  const visitedIds = options.visitedIds ?? pathIds

  steps.push({
    id: options.id,
    title: options.title,
    explanation: options.explanation,
    detail: options.detail,
    meta: meta({
      phase: options.phase,
      operation: options.operation,
      treeSnapshot: serializeTreeSnapshot(snapshot),
      rootId: snapshot.rootId,
      activeId: options.activeId ?? null,
      pathIds: encodeIdList(pathIds),
      visitedIds: encodeIdList(visitedIds),
      focusId: options.focusId ?? null,
      insertId: options.insertId ?? null,
      deleteId: options.deleteId ?? null,
      endMarkerIds: encodeIdList(endMarkerIdsOf(snapshot)),
      currentChar: options.currentChar ?? null,
      charIndex: options.charIndex ?? null,
      operand: options.operand ?? null,
      result: options.result ?? null,
      success: options.success ?? null,
      message: options.message,
      treeHeight: height(snapshot),
      treeSize: size(snapshot),
      wordList: encodeWordList(getAllWords(snapshot)),
    }),
  })
}

function invalidSteps(
  operation: TrieOperation,
  snapshot: TrieSnapshot,
  reason: string,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  pushStep(steps, {
    id: 'invalid-0',
    title: 'Invalid input',
    explanation: reason,
    snapshot,
    phase: 'invalid',
    operation,
    activeId: snapshot.rootId,
    pathIds: [snapshot.rootId],
    message: reason,
    success: false,
    result: 'invalid',
  })
  pushStep(steps, {
    id: 'invalid-done',
    title: 'Done',
    explanation: 'No changes were made to the trie.',
    snapshot,
    phase: 'complete',
    operation,
    activeId: snapshot.rootId,
    pathIds: [snapshot.rootId],
    message: 'Operation aborted',
    success: false,
    result: 'invalid',
  })
  return steps
}

function buildInsertSteps(
  snapshot: TrieSnapshot,
  raw: string,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const normalized = normalizeWord(raw)

  pushStep(steps, {
    id: 'insert-init',
    title: 'Insert word',
    explanation: `Prepare to insert "${raw.trim()}". Words are normalized to lowercase.`,
    detail: `Current words: ${formatTrie(snapshot)}`,
    snapshot,
    phase: 'initialize',
    operation: 'insert',
    activeId: snapshot.rootId,
    pathIds: [snapshot.rootId],
    operand: raw.trim() || null,
    message: 'Start insert',
  })

  if (normalized === null) {
    return invalidSteps(
      'insert',
      snapshot,
      'Empty input is rejected — enter a non-empty word.',
    )
  }

  pushStep(steps, {
    id: 'insert-normalize',
    title: 'Normalize',
    explanation: `Normalized key: "${normalized}" (lowercase, trimmed).`,
    snapshot,
    phase: 'normalize',
    operation: 'insert',
    activeId: snapshot.rootId,
    pathIds: [snapshot.rootId],
    operand: normalized,
    currentChar: null,
    message: `key = "${normalized}"`,
  })

  pushStep(steps, {
    id: 'insert-root',
    title: 'Visit root',
    explanation:
      'Begin at the root. Shared prefixes will reuse existing child edges.',
    snapshot,
    phase: 'visit-root',
    operation: 'insert',
    activeId: snapshot.rootId,
    pathIds: [snapshot.rootId],
    operand: normalized,
    message: 'At root',
  })

  // Replay insert character-by-character on a working clone (mirrors trie.insert).
  let working = cloneSnapshot(snapshot)
  const pathIds = [working.rootId]
  const createdIds: string[] = []
  let currentId = working.rootId

  for (let i = 0; i < normalized.length; i += 1) {
    const char = normalized[i]!
    const current = working.nodes.find((n) => n.id === currentId)!
    const existing = current.children.find((e) => e.char === char)

    if (existing) {
      pathIds.push(existing.childId)
      currentId = existing.childId
      pushStep(steps, {
        id: `insert-reuse-${i}`,
        title: `Reuse '${char}'`,
        explanation: `Character '${char}' already has a child — follow the shared prefix path.`,
        snapshot: working,
        phase: 'reuse-node',
        operation: 'insert',
        activeId: currentId,
        pathIds: [...pathIds],
        focusId: currentId,
        operand: normalized,
        currentChar: char,
        charIndex: i,
        message: `follow '${char}'`,
      })
      continue
    }

    const { id: newId, nextIdCounter } = allocateNodeId(working)
    const child: TrieNodeSnapshot = {
      id: newId,
      char,
      parentId: currentId,
      children: [],
      isEndOfWord: false,
    }
    const parentUpdated: TrieNodeSnapshot = {
      ...current,
      children: [...current.children, { char, childId: newId }].sort((a, b) =>
        a.char < b.char ? -1 : a.char > b.char ? 1 : 0,
      ),
    }
    working = {
      ...working,
      nextIdCounter,
      nodes: [
        ...working.nodes.map((n) => (n.id === currentId ? parentUpdated : n)),
        child,
      ],
    }
    createdIds.push(newId)
    pathIds.push(newId)
    currentId = newId

    pushStep(steps, {
      id: `insert-create-${i}`,
      title: `Create '${char}'`,
      explanation: `No child for '${char}' yet — create a new node and attach it.`,
      snapshot: working,
      phase: 'create-node',
      operation: 'insert',
      activeId: currentId,
      pathIds: [...pathIds],
      insertId: newId,
      focusId: newId,
      operand: normalized,
      currentChar: char,
      charIndex: i,
      message: `create '${char}'`,
    })
  }

  const endNode = working.nodes.find((n) => n.id === currentId)!
  if (endNode.isEndOfWord) {
    pushStep(steps, {
      id: 'insert-dup',
      title: 'Already present',
      explanation: `"${normalized}" is already a complete word — duplicate ignored, word count unchanged.`,
      snapshot: working,
      phase: 'duplicate',
      operation: 'insert',
      activeId: currentId,
      pathIds: [...pathIds],
      focusId: currentId,
      operand: normalized,
      success: false,
      result: 'duplicate',
      message: 'Duplicate — no size change',
    })
    pushStep(steps, {
      id: 'insert-done',
      title: 'Insert complete',
      explanation: `Trie unchanged. Words: ${formatTrie(working)}`,
      snapshot: working,
      phase: 'complete',
      operation: 'insert',
      activeId: currentId,
      pathIds: [...pathIds],
      focusId: currentId,
      operand: normalized,
      success: false,
      result: 'duplicate',
      message: 'Duplicate',
    })
    return steps
  }

  working = {
    ...working,
    wordCount: working.wordCount + 1,
    nodes: working.nodes.map((n) =>
      n.id === currentId ? { ...n, isEndOfWord: true } : n,
    ),
  }

  pushStep(steps, {
    id: 'insert-mark',
    title: 'Mark end of word',
    explanation: `Set isEndOfWord on the final node so "${normalized}" is a complete word.`,
    snapshot: working,
    phase: 'mark-end',
    operation: 'insert',
    activeId: currentId,
    pathIds: [...pathIds],
    focusId: currentId,
    insertId: createdIds[createdIds.length - 1] ?? currentId,
    operand: normalized,
    success: true,
    result: 'inserted',
    message: `isEndOfWord = true · size=${size(working)}`,
  })

  pushStep(steps, {
    id: 'insert-done',
    title: 'Insert complete',
    explanation: `Inserted "${normalized}". Words: ${formatTrie(working)}`,
    snapshot: working,
    phase: 'complete',
    operation: 'insert',
    activeId: currentId,
    pathIds: [...pathIds],
    focusId: currentId,
    operand: normalized,
    success: true,
    result: 'inserted',
    message: 'Inserted',
  })

  return steps
}

function buildSearchSteps(
  snapshot: TrieSnapshot,
  raw: string,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const normalized = normalizeWord(raw)

  pushStep(steps, {
    id: 'search-init',
    title: 'Search word',
    explanation: `Search for a complete word matching "${raw.trim()}".`,
    snapshot,
    phase: 'initialize',
    operation: 'search',
    activeId: snapshot.rootId,
    pathIds: [snapshot.rootId],
    operand: raw.trim() || null,
    message: 'Start search',
  })

  if (normalized === null) {
    return invalidSteps(
      'search',
      snapshot,
      'Empty input is rejected — enter a non-empty word.',
    )
  }

  pushStep(steps, {
    id: 'search-normalize',
    title: 'Normalize',
    explanation: `Normalized key: "${normalized}".`,
    snapshot,
    phase: 'normalize',
    operation: 'search',
    activeId: snapshot.rootId,
    pathIds: [snapshot.rootId],
    operand: normalized,
    message: `key = "${normalized}"`,
  })

  const walk = walkPath(snapshot, normalized)
  const pathSoFar = [snapshot.rootId]

  pushStep(steps, {
    id: 'search-root',
    title: 'Visit root',
    explanation: 'Start at the root and follow each character.',
    snapshot,
    phase: 'visit-root',
    operation: 'search',
    activeId: snapshot.rootId,
    pathIds: pathSoFar,
    operand: normalized,
    message: 'At root',
  })

  for (let i = 0; i < normalized.length; i += 1) {
    const char = normalized[i]!
    const nextId = walk.pathIds[i + 1]
    if (!nextId) {
      pushStep(steps, {
        id: `search-miss-${i}`,
        title: `Missing '${char}'`,
        explanation: `No child edge for '${char}' — the word is not in the trie.`,
        snapshot,
        phase: 'not-found',
        operation: 'search',
        activeId: pathSoFar[pathSoFar.length - 1] ?? snapshot.rootId,
        pathIds: [...pathSoFar],
        operand: normalized,
        currentChar: char,
        charIndex: i,
        success: false,
        result: 'not-found',
        message: `missing '${char}'`,
      })
      pushStep(steps, {
        id: 'search-done-miss',
        title: 'Not found',
        explanation: `"${normalized}" is not a complete word in this trie.`,
        snapshot,
        phase: 'complete',
        operation: 'search',
        activeId: pathSoFar[pathSoFar.length - 1] ?? snapshot.rootId,
        pathIds: [...pathSoFar],
        operand: normalized,
        success: false,
        result: 'not-found',
        message: 'Not found',
      })
      return steps
    }

    pathSoFar.push(nextId)
    pushStep(steps, {
      id: `search-follow-${i}`,
      title: `Follow '${char}'`,
      explanation: `Follow the edge labeled '${char}'.`,
      snapshot,
      phase: 'follow-char',
      operation: 'search',
      activeId: nextId,
      pathIds: [...pathSoFar],
      operand: normalized,
      currentChar: char,
      charIndex: i,
      message: `follow '${char}'`,
    })
  }

  const result = treeSearch(snapshot, normalized)
  if (result.found) {
    pushStep(steps, {
      id: 'search-found',
      title: 'End marker set',
      explanation: `Reached the final node with isEndOfWord = true — "${normalized}" is stored.`,
      snapshot,
      phase: 'found',
      operation: 'search',
      activeId: result.endNodeId,
      pathIds: result.pathIds,
      focusId: result.endNodeId,
      operand: normalized,
      success: true,
      result: 'found',
      message: 'Found',
    })
  } else {
    pushStep(steps, {
      id: 'search-prefix-only',
      title: 'Path exists, not a word',
      explanation: `The path for "${normalized}" exists, but isEndOfWord is false — it is only a prefix of a longer word.`,
      snapshot,
      phase: 'not-found',
      operation: 'search',
      activeId: result.endNodeId,
      pathIds: result.pathIds,
      focusId: result.endNodeId,
      operand: normalized,
      success: false,
      result: 'not-found',
      message: 'Prefix only — not a complete word',
    })
  }

  pushStep(steps, {
    id: 'search-done',
    title: 'Search complete',
    explanation: result.found
      ? `Found "${normalized}".`
      : `"${normalized}" was not found as a complete word.`,
    snapshot,
    phase: 'complete',
    operation: 'search',
    activeId: result.endNodeId ?? snapshot.rootId,
    pathIds: result.pathIds,
    focusId: result.endNodeId,
    operand: normalized,
    success: result.found,
    result: result.found ? 'found' : 'not-found',
    message: result.found ? 'Found' : 'Not found',
  })

  return steps
}

function buildStartsWithSteps(
  snapshot: TrieSnapshot,
  raw: string,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const normalized = normalizeWord(raw)

  pushStep(steps, {
    id: 'prefix-init',
    title: 'Prefix search',
    explanation: `Check whether any stored word starts with "${raw.trim()}".`,
    snapshot,
    phase: 'initialize',
    operation: 'starts-with',
    activeId: snapshot.rootId,
    pathIds: [snapshot.rootId],
    operand: raw.trim() || null,
    message: 'Start prefix search',
  })

  if (normalized === null) {
    return invalidSteps(
      'starts-with',
      snapshot,
      'Empty input is rejected — enter a non-empty prefix.',
    )
  }

  pushStep(steps, {
    id: 'prefix-normalize',
    title: 'Normalize',
    explanation: `Normalized prefix: "${normalized}".`,
    snapshot,
    phase: 'normalize',
    operation: 'starts-with',
    activeId: snapshot.rootId,
    pathIds: [snapshot.rootId],
    operand: normalized,
    message: `prefix = "${normalized}"`,
  })

  const walk = walkPath(snapshot, normalized)
  const pathSoFar = [snapshot.rootId]

  pushStep(steps, {
    id: 'prefix-root',
    title: 'Visit root',
    explanation: 'Walk the prefix character by character from the root.',
    snapshot,
    phase: 'visit-root',
    operation: 'starts-with',
    activeId: snapshot.rootId,
    pathIds: pathSoFar,
    operand: normalized,
    message: 'At root',
  })

  for (let i = 0; i < normalized.length; i += 1) {
    const char = normalized[i]!
    const nextId = walk.pathIds[i + 1]
    if (!nextId) {
      pushStep(steps, {
        id: `prefix-miss-${i}`,
        title: `Missing '${char}'`,
        explanation: `No edge for '${char}' — no word has this prefix.`,
        snapshot,
        phase: 'prefix-missing',
        operation: 'starts-with',
        activeId: pathSoFar[pathSoFar.length - 1] ?? snapshot.rootId,
        pathIds: [...pathSoFar],
        operand: normalized,
        currentChar: char,
        charIndex: i,
        success: false,
        result: 'no-match',
        message: `missing '${char}'`,
      })
      pushStep(steps, {
        id: 'prefix-done-miss',
        title: 'No match',
        explanation: `startsWith("${normalized}") → false.`,
        snapshot,
        phase: 'complete',
        operation: 'starts-with',
        activeId: pathSoFar[pathSoFar.length - 1] ?? snapshot.rootId,
        pathIds: [...pathSoFar],
        operand: normalized,
        success: false,
        result: 'no-match',
        message: 'Prefix not found',
      })
      return steps
    }

    pathSoFar.push(nextId)
    pushStep(steps, {
      id: `prefix-follow-${i}`,
      title: `Follow '${char}'`,
      explanation: `Follow '${char}' along the shared prefix path.`,
      snapshot,
      phase: 'follow-char',
      operation: 'starts-with',
      activeId: nextId,
      pathIds: [...pathSoFar],
      operand: normalized,
      currentChar: char,
      charIndex: i,
      message: `follow '${char}'`,
    })
  }

  const result = treeStartsWith(snapshot, normalized, 12)
  pushStep(steps, {
    id: 'prefix-found',
    title: 'Prefix node reached',
    explanation: `Prefix "${normalized}" exists. Suggestions: ${
      result.suggestions.length > 0
        ? result.suggestions.join(', ')
        : '(none yet — path exists but no complete word under it)'
    }.`,
    detail:
      'Prefix search only needs the path; listing matches walks the subtree.',
    snapshot,
    phase: 'prefix-found',
    operation: 'starts-with',
    activeId: result.prefixNodeId,
    pathIds: result.pathIds,
    focusId: result.prefixNodeId,
    operand: normalized,
    success: true,
    result: result.suggestions.join(', ') || 'matched',
    message: `startsWith → true · ${result.suggestions.length} suggestion(s)`,
  })

  pushStep(steps, {
    id: 'prefix-done',
    title: 'Prefix search complete',
    explanation: `startsWith("${normalized}") → true.`,
    snapshot,
    phase: 'complete',
    operation: 'starts-with',
    activeId: result.prefixNodeId ?? snapshot.rootId,
    pathIds: result.pathIds,
    focusId: result.prefixNodeId,
    operand: normalized,
    success: true,
    result: 'matched',
    message: 'Prefix found',
  })

  return steps
}

function buildDeleteSteps(
  snapshot: TrieSnapshot,
  raw: string,
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const normalized = normalizeWord(raw)

  pushStep(steps, {
    id: 'delete-init',
    title: 'Delete word',
    explanation: `Delete the complete word "${raw.trim()}" if present.`,
    detail:
      'Shared-prefix nodes stay when siblings or longer words still need them.',
    snapshot,
    phase: 'initialize',
    operation: 'delete',
    activeId: snapshot.rootId,
    pathIds: [snapshot.rootId],
    operand: raw.trim() || null,
    message: 'Start delete',
  })

  if (normalized === null) {
    return invalidSteps(
      'delete',
      snapshot,
      'Empty input is rejected — enter a non-empty word.',
    )
  }

  pushStep(steps, {
    id: 'delete-normalize',
    title: 'Normalize',
    explanation: `Normalized key: "${normalized}".`,
    snapshot,
    phase: 'normalize',
    operation: 'delete',
    activeId: snapshot.rootId,
    pathIds: [snapshot.rootId],
    operand: normalized,
    message: `key = "${normalized}"`,
  })

  const walk = walkPath(snapshot, normalized)
  const pathSoFar = [snapshot.rootId]

  for (let i = 0; i < normalized.length; i += 1) {
    const char = normalized[i]!
    const nextId = walk.pathIds[i + 1]
    if (!nextId) {
      pushStep(steps, {
        id: `delete-miss-${i}`,
        title: `Missing '${char}'`,
        explanation: `Cannot delete — path breaks at '${char}'.`,
        snapshot,
        phase: 'not-found',
        operation: 'delete',
        activeId: pathSoFar[pathSoFar.length - 1] ?? snapshot.rootId,
        pathIds: [...pathSoFar],
        operand: normalized,
        currentChar: char,
        charIndex: i,
        success: false,
        result: 'not-found',
        message: `missing '${char}'`,
      })
      pushStep(steps, {
        id: 'delete-done-miss',
        title: 'Not deleted',
        explanation: `"${normalized}" is not in the trie.`,
        snapshot,
        phase: 'complete',
        operation: 'delete',
        activeId: pathSoFar[pathSoFar.length - 1] ?? snapshot.rootId,
        pathIds: [...pathSoFar],
        operand: normalized,
        success: false,
        result: 'not-found',
        message: 'Not found',
      })
      return steps
    }
    pathSoFar.push(nextId)
    pushStep(steps, {
      id: `delete-follow-${i}`,
      title: `Follow '${char}'`,
      explanation: `Follow '${char}' toward the end-of-word node.`,
      snapshot,
      phase: 'follow-char',
      operation: 'delete',
      activeId: nextId,
      pathIds: [...pathSoFar],
      deleteId: nextId,
      operand: normalized,
      currentChar: char,
      charIndex: i,
      message: `follow '${char}'`,
    })
  }

  const endNode = snapshot.nodes.find((n) => n.id === walk.lastId)
  if (!endNode?.isEndOfWord) {
    pushStep(steps, {
      id: 'delete-not-word',
      title: 'Not a complete word',
      explanation: `Path exists but isEndOfWord is false — "${normalized}" is only a prefix.`,
      snapshot,
      phase: 'not-found',
      operation: 'delete',
      activeId: walk.lastId,
      pathIds: walk.pathIds,
      focusId: walk.lastId,
      operand: normalized,
      success: false,
      result: 'not-found',
      message: 'Prefix only',
    })
    pushStep(steps, {
      id: 'delete-done-prefix',
      title: 'Not deleted',
      explanation: 'Nothing removed.',
      snapshot,
      phase: 'complete',
      operation: 'delete',
      activeId: walk.lastId,
      pathIds: walk.pathIds,
      operand: normalized,
      success: false,
      result: 'not-found',
      message: 'Not found',
    })
    return steps
  }

  const final = treeDelete(snapshot, normalized)
  // Intermediate: unmarked but not yet pruned
  let unmarked = cloneSnapshot(snapshot)
  unmarked = {
    ...unmarked,
    wordCount: Math.max(0, unmarked.wordCount - 1),
    nodes: unmarked.nodes.map((n) =>
      n.id === walk.lastId ? { ...n, isEndOfWord: false } : n,
    ),
  }

  pushStep(steps, {
    id: 'delete-unmark',
    title: 'Clear end marker',
    explanation: `Clear isEndOfWord on the final node. Longer words that continue past here stay intact.`,
    snapshot: unmarked,
    phase: 'unmark-end',
    operation: 'delete',
    activeId: walk.lastId,
    pathIds: walk.pathIds,
    deleteId: walk.lastId,
    focusId: walk.lastId,
    operand: normalized,
    message: 'isEndOfWord = false',
  })

  if (final.removedIds.length > 0) {
    // Show progressive pruning from leaf toward root
    let pruning = unmarked
    for (let i = 0; i < final.removedIds.length; i += 1) {
      const removeId = final.removedIds[i]!
      const node = pruning.nodes.find((n) => n.id === removeId)
      const parentId = node?.parentId
      pruning = {
        ...pruning,
        nodes: pruning.nodes
          .filter((n) => n.id !== removeId)
          .map((n) =>
            n.id === parentId
              ? {
                  ...n,
                  children: n.children.filter((e) => e.childId !== removeId),
                }
              : n,
          ),
      }
      pushStep(steps, {
        id: `delete-prune-${i}`,
        title: `Prune '${node?.char ?? '?'}'`,
        explanation: `Node has no children and is not an end-of-word — safe to remove. Shared-prefix ancestors with other children stay.`,
        snapshot: pruning,
        phase: 'prune-node',
        operation: 'delete',
        activeId: parentId ?? pruning.rootId,
        pathIds: walk.pathIds.filter((id) => id !== removeId),
        deleteId: removeId,
        operand: normalized,
        currentChar: node?.char ?? null,
        message: `removed ${removeId}`,
      })
    }
  }

  pushStep(steps, {
    id: 'delete-done',
    title: 'Delete complete',
    explanation: `Deleted "${normalized}". Words: ${formatTrie(final.snapshot)}`,
    snapshot: final.snapshot,
    phase: 'complete',
    operation: 'delete',
    activeId: final.snapshot.rootId,
    pathIds: [final.snapshot.rootId],
    operand: normalized,
    success: true,
    result: 'deleted',
    message: `Deleted · size=${size(final.snapshot)}`,
  })

  return steps
}

function buildListSteps(snapshot: TrieSnapshot): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const words = getAllWords(snapshot)

  pushStep(steps, {
    id: 'list-init',
    title: 'List all words',
    explanation: 'Depth-first walk of sorted child edges collects every complete word.',
    snapshot,
    phase: 'initialize',
    operation: 'list-words',
    activeId: snapshot.rootId,
    pathIds: [snapshot.rootId],
    message: 'Start listing',
  })

  pushStep(steps, {
    id: 'list-result',
    title: isEmpty(snapshot) ? 'Empty trie' : 'Words found',
    explanation: isEmpty(snapshot)
      ? 'No complete words are stored.'
      : `Stored words (${words.length}): ${words.join(', ')}`,
    snapshot,
    phase: 'list',
    operation: 'list-words',
    activeId: snapshot.rootId,
    pathIds: [snapshot.rootId],
    success: true,
    result: words.join(', ') || '(empty)',
    message: `size=${size(snapshot)}`,
  })

  pushStep(steps, {
    id: 'list-done',
    title: 'List complete',
    explanation: 'Listing finished.',
    snapshot,
    phase: 'complete',
    operation: 'list-words',
    activeId: snapshot.rootId,
    pathIds: [snapshot.rootId],
    success: true,
    result: words.join(', ') || '(empty)',
    message: 'Done',
  })

  return steps
}

/**
 * Build a step-by-step visualization for a trie operation.
 * `operand` is the raw word/prefix string (ignored for list-words).
 */
export function buildTrieSteps(
  snapshot: TrieSnapshot,
  operation: TrieOperation,
  operand: string | null,
): VisualizationStep[] {
  if (operation === 'list-words') {
    return buildListSteps(snapshot)
  }

  const raw = operand ?? ''
  if (operation === 'insert') {
    return buildInsertSteps(snapshot, raw)
  }
  if (operation === 'search') {
    return buildSearchSteps(snapshot, raw)
  }
  if (operation === 'starts-with') {
    return buildStartsWithSteps(snapshot, raw)
  }
  return buildDeleteSteps(snapshot, raw)
}
