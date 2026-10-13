import type { VisualizationStep } from '../../components/visualizations/types'
import { groupAnagrams, wordSignature } from './groupAnagrams'

export type GroupAnagramsPhase =
  | 'initialize'
  | 'read-word'
  | 'create-signature'
  | 'check-map'
  | 'create-group'
  | 'append-to-group'
  | 'update-map'
  | 'complete'

export type GroupAnagramsMapEntry = {
  signature: string
  words: string[]
}

type GroupAnagramsMeta = {
  phase: GroupAnagramsPhase
  words: string
  currentWordIndex: number
  currentWord: string
  currentSignature: string
  signatureExists: boolean
  mapSnapshot: string
  groupsSnapshot: string
  message: string
}

/** Serialize signature → word groups (insertion order) for step meta. */
export function serializeGroupAnagramsMap(
  entries: readonly GroupAnagramsMapEntry[],
): string {
  return JSON.stringify(
    entries.map((entry) => [entry.signature, [...entry.words]]),
  )
}

/** Parse a map snapshot produced by serializeGroupAnagramsMap. */
export function parseGroupAnagramsMap(
  snapshot: string,
): GroupAnagramsMapEntry[] {
  if (!snapshot) {
    return []
  }

  try {
    const parsed: unknown = JSON.parse(snapshot)
    if (!Array.isArray(parsed)) {
      return []
    }

    const entries: GroupAnagramsMapEntry[] = []
    for (const item of parsed) {
      if (
        Array.isArray(item) &&
        item.length === 2 &&
        typeof item[0] === 'string' &&
        Array.isArray(item[1]) &&
        item[1].every((word) => typeof word === 'string')
      ) {
        entries.push({ signature: item[0], words: [...item[1]] })
      }
    }
    return entries
  } catch {
    return []
  }
}

export function serializeGroupAnagramsGroups(groups: readonly string[][]): string {
  return JSON.stringify(groups.map((group) => [...group]))
}

export function parseGroupAnagramsGroups(snapshot: string): string[][] {
  if (!snapshot) {
    return []
  }

  try {
    const parsed: unknown = JSON.parse(snapshot)
    if (!Array.isArray(parsed)) {
      return []
    }

    const groups: string[][] = []
    for (const item of parsed) {
      if (
        Array.isArray(item) &&
        item.every((word) => typeof word === 'string')
      ) {
        groups.push([...item])
      }
    }
    return groups
  } catch {
    return []
  }
}

function entriesFromMap(map: Map<string, string[]>): GroupAnagramsMapEntry[] {
  return [...map.entries()].map(([signature, words]) => ({
    signature,
    words: [...words],
  }))
}

function formatQuoted(value: string): string {
  return `"${value}"`
}

function formatGroups(groups: readonly string[][]): string {
  if (groups.length === 0) {
    return '[]'
  }
  return groups.map((group) => `[${group.map(formatQuoted).join(', ')}]`).join(', ')
}

function meta(fields: GroupAnagramsMeta): NonNullable<VisualizationStep['meta']> {
  return {
    phase: fields.phase,
    words: fields.words,
    currentWordIndex: fields.currentWordIndex,
    currentWord: fields.currentWord,
    currentSignature: fields.currentSignature,
    signatureExists: fields.signatureExists,
    mapSnapshot: fields.mapSnapshot,
    groupsSnapshot: fields.groupsSnapshot,
    message: fields.message,
  }
}

function baseMeta(
  partial: Partial<GroupAnagramsMeta> &
    Pick<GroupAnagramsMeta, 'phase' | 'words' | 'message'>,
): GroupAnagramsMeta {
  return {
    phase: partial.phase,
    words: partial.words,
    currentWordIndex: partial.currentWordIndex ?? -1,
    currentWord: partial.currentWord ?? '',
    currentSignature: partial.currentSignature ?? '',
    signatureExists: partial.signatureExists ?? false,
    mapSnapshot: partial.mapSnapshot ?? '[]',
    groupsSnapshot: partial.groupsSnapshot ?? '[]',
    message: partial.message,
  }
}

/**
 * Builds a step-by-step VisualizationStep sequence for Group Anagrams.
 * Each step is an immutable snapshot. Pure data — no React state.
 */
export function buildGroupAnagramsSteps(wordsInput: readonly string[]): VisualizationStep[] {
  const words = [...wordsInput]
  const steps: VisualizationStep[] = []
  const indices = Array.from({ length: Math.max(words.length, 1) }, (_, i) => i)
  const wordsJson = JSON.stringify(words)
  const emptyMapSnapshot = serializeGroupAnagramsMap([])
  const emptyGroupsSnapshot = serializeGroupAnagramsGroups([])
  const finalGroups = groupAnagrams(words)
  const finalGroupsSnapshot = serializeGroupAnagramsGroups(finalGroups)

  steps.push({
    id: 'group-anagrams-init',
    title: 'Start with an empty map',
    explanation:
      'Anagrams share the same characters with the same frequencies. Sort each word’s characters to build a canonical signature, then use a hash map from signature to a list of words.',
    detail: `Input: ${words.length === 0 ? '[]' : words.map(formatQuoted).join(', ')}`,
    array: indices,
    operation: 'move',
    meta: meta(
      baseMeta({
        phase: 'initialize',
        words: wordsJson,
        mapSnapshot: emptyMapSnapshot,
        groupsSnapshot: emptyGroupsSnapshot,
        message:
          'Map keys are sorted-character signatures; values are groups of words.',
      }),
    ),
  })

  const groupsMap = new Map<string, string[]>()

  if (words.length === 0) {
    steps.push({
      id: 'group-anagrams-empty-complete',
      title: 'No words to process',
      explanation:
        'An empty input produces no groups. Return an empty list of groups.',
      detail: 'Result: []',
      array: indices,
      operation: 'complete',
      meta: meta(
        baseMeta({
          phase: 'complete',
          words: wordsJson,
          mapSnapshot: emptyMapSnapshot,
          groupsSnapshot: emptyGroupsSnapshot,
          message: 'Finished. Result: [].',
        }),
      ),
    })

    return steps
  }

  for (let i = 0; i < words.length; i += 1) {
    const word = words[i]!
    const beforeMapSnapshot = serializeGroupAnagramsMap(
      entriesFromMap(groupsMap),
    )

    steps.push({
      id: `group-anagrams-read-${i}`,
      title: `Read word ${formatQuoted(word)}`,
      explanation: `Process word at index ${i}: ${formatQuoted(word)}.`,
      detail: `index ${i} of ${words.length}`,
      array: indices,
      highlighted: [i],
      active: [i],
      pointers: [{ index: i, label: 'word' }],
      operation: 'compare',
      meta: meta(
        baseMeta({
          phase: 'read-word',
          words: wordsJson,
          currentWordIndex: i,
          currentWord: word,
          mapSnapshot: beforeMapSnapshot,
          groupsSnapshot: serializeGroupAnagramsGroups([...groupsMap.values()]),
          message: `Reading ${formatQuoted(word)} at index ${i}.`,
        }),
      ),
    })

    const signature = wordSignature(word)
    const sortedChars = [...word].sort().join('')

    steps.push({
      id: `group-anagrams-signature-${i}`,
      title: `Build signature for ${formatQuoted(word)}`,
      explanation: `Sort the characters of ${formatQuoted(word)} to get signature ${formatQuoted(signature)}. Words with the same signature are anagrams.`,
      detail: `${formatQuoted(word)} → characters [${[...word].map(formatQuoted).join(', ')}] → sorted ${formatQuoted(sortedChars)}`,
      array: indices,
      highlighted: [i],
      active: [i],
      operation: 'move',
      meta: meta(
        baseMeta({
          phase: 'create-signature',
          words: wordsJson,
          currentWordIndex: i,
          currentWord: word,
          currentSignature: signature,
          mapSnapshot: beforeMapSnapshot,
          groupsSnapshot: serializeGroupAnagramsGroups([...groupsMap.values()]),
          message: `Signature ${formatQuoted(signature)} identifies this word’s anagram class.`,
        }),
      ),
    })

    const exists = groupsMap.has(signature)

    steps.push({
      id: `group-anagrams-check-${i}`,
      title: exists
        ? `Signature ${formatQuoted(signature)} already in map`
        : `Signature ${formatQuoted(signature)} is new`,
      explanation: exists
        ? `The map already has a group for ${formatQuoted(signature)}. Append ${formatQuoted(word)} to that group.`
        : `No entry for ${formatQuoted(signature)} yet. Create a new group starting with ${formatQuoted(word)}.`,
      detail: exists ? 'append to existing group' : 'create new group',
      array: indices,
      highlighted: [i],
      compared: [i],
      operation: 'compare',
      meta: meta(
        baseMeta({
          phase: 'check-map',
          words: wordsJson,
          currentWordIndex: i,
          currentWord: word,
          currentSignature: signature,
          signatureExists: exists,
          mapSnapshot: beforeMapSnapshot,
          groupsSnapshot: serializeGroupAnagramsGroups([...groupsMap.values()]),
          message: exists
            ? 'Existing signature — reuse its group.'
            : 'New signature — start a fresh group.',
        }),
      ),
    })

    if (!exists) {
      groupsMap.set(signature, [word])
      const afterMapSnapshot = serializeGroupAnagramsMap(
        entriesFromMap(groupsMap),
      )

      steps.push({
        id: `group-anagrams-create-${i}`,
        title: `Create group for ${formatQuoted(signature)}`,
        explanation: `Insert map entry ${formatQuoted(signature)} → [${formatQuoted(word)}].`,
        detail: `${formatQuoted(signature)} → [${formatQuoted(word)}]`,
        array: indices,
        highlighted: [i],
        found: [i],
        operation: 'move',
        meta: meta(
          baseMeta({
            phase: 'create-group',
            words: wordsJson,
            currentWordIndex: i,
            currentWord: word,
            currentSignature: signature,
            signatureExists: false,
            mapSnapshot: afterMapSnapshot,
            groupsSnapshot: serializeGroupAnagramsGroups([...groupsMap.values()]),
            message: `New group created for signature ${formatQuoted(signature)}.`,
          }),
        ),
      })
    } else {
      const bucket = groupsMap.get(signature)!
      bucket.push(word)
      const afterMapSnapshot = serializeGroupAnagramsMap(
        entriesFromMap(groupsMap),
      )

      steps.push({
        id: `group-anagrams-append-${i}`,
        title: `Append ${formatQuoted(word)} to group ${formatQuoted(signature)}`,
        explanation: `Add ${formatQuoted(word)} to the existing group for ${formatQuoted(signature)} while preserving input order inside the group.`,
        detail: `${formatQuoted(signature)} → [${bucket.map(formatQuoted).join(', ')}]`,
        array: indices,
        highlighted: [i],
        found: [i],
        operation: 'move',
        meta: meta(
          baseMeta({
            phase: 'append-to-group',
            words: wordsJson,
            currentWordIndex: i,
            currentWord: word,
            currentSignature: signature,
            signatureExists: true,
            mapSnapshot: afterMapSnapshot,
            groupsSnapshot: serializeGroupAnagramsGroups([...groupsMap.values()]),
            message: `Group for ${formatQuoted(signature)} now has ${bucket.length} word(s).`,
          }),
        ),
      })
    }

    const afterMapSnapshot = serializeGroupAnagramsMap(entriesFromMap(groupsMap))

    steps.push({
      id: `group-anagrams-update-${i}`,
      title: 'Map after this word',
      explanation:
        'The hash map now reflects every word processed so far. Keys stay in the order each signature first appeared.',
      detail: `Groups so far: ${formatGroups([...groupsMap.values()])}`,
      array: indices,
      operation: 'move',
      meta: meta(
        baseMeta({
          phase: 'update-map',
          words: wordsJson,
          currentWordIndex: i,
          currentWord: word,
          currentSignature: signature,
          signatureExists: exists,
          mapSnapshot: afterMapSnapshot,
          groupsSnapshot: serializeGroupAnagramsGroups([...groupsMap.values()]),
          message: 'Map updated — continue with the next word.',
        }),
      ),
    })
  }

  steps.push({
    id: 'group-anagrams-complete',
    title: 'Return grouped values',
    explanation:
      'Collect every group from the map in insertion order. Each group preserves the order words appeared in the input.',
    detail: `Result: ${formatGroups(finalGroups)}`,
    array: indices,
    sorted: indices,
    operation: 'complete',
    meta: meta(
      baseMeta({
        phase: 'complete',
        words: wordsJson,
        mapSnapshot: serializeGroupAnagramsMap(entriesFromMap(groupsMap)),
        groupsSnapshot: finalGroupsSnapshot,
        message: `Finished. Result: ${formatGroups(finalGroups)}.`,
      }),
    ),
  })

  return steps
}
