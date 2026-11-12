import { useMemo, useState } from 'react'
import {
  TRIE_AUTOCOMPLETE_WORDS,
  TRIE_DEFAULT_WORDS,
  TRIE_WORD_PRESETS,
  clear,
  deleteWord,
  formatTrie,
  getAllWords,
  insert,
  normalizeWord,
  search,
  size,
  snapshotFromWords,
  startsWith,
  type TrieSnapshot,
} from '../../algorithms/data-structures/trie'
import {
  buildTrieSteps,
  type TrieOperation,
} from '../../algorithms/data-structures/trieSteps'
import { cn } from '../../lib/cn'
import { Button } from '../ui'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import { TriePanels } from './TriePanels'

const OPERATIONS: {
  id: TrieOperation
  label: string
  needsWord: boolean
}[] = [
  { id: 'insert', label: 'Insert', needsWord: true },
  { id: 'search', label: 'Search word', needsWord: true },
  { id: 'starts-with', label: 'Prefix search', needsWord: true },
  { id: 'delete', label: 'Delete', needsWord: true },
  { id: 'list-words', label: 'List words', needsWord: false },
]

function wordsEqual(
  left: readonly string[],
  right: readonly string[],
): boolean {
  if (left.length !== right.length) {
    return false
  }
  return left.every((word, index) => word === right[index])
}

function previewResult(
  snapshot: TrieSnapshot,
  operation: TrieOperation,
  raw: string,
): string {
  if (operation === 'list-words') {
    const words = getAllWords(snapshot)
    return words.length === 0 ? 'list → (empty)' : `list → ${words.join(', ')}`
  }

  const normalized = normalizeWord(raw)
  if (normalized === null) {
    return 'Enter a non-empty word (case-insensitive)'
  }

  if (operation === 'insert') {
    const result = insert(snapshot, normalized)
    return result.inserted
      ? `insert("${normalized}") → inserted`
      : `insert("${normalized}") → duplicate ignored`
  }
  if (operation === 'search') {
    return search(snapshot, normalized).found
      ? `search("${normalized}") → found`
      : `search("${normalized}") → not found`
  }
  if (operation === 'starts-with') {
    const result = startsWith(snapshot, normalized, 6)
    return result.matched
      ? `startsWith("${normalized}") → ${result.suggestions.join(', ') || 'matched'}`
      : `startsWith("${normalized}") → no match`
  }
  const result = deleteWord(snapshot, normalized)
  return result.deleted
    ? `delete("${normalized}") → deleted`
    : `delete("${normalized}") → not found`
}

/**
 * Interactive playground for Trie insert, search, prefix search, delete,
 * listing, and a small autocomplete demo.
 */
export function TrieVisualization() {
  const [snapshot, setSnapshot] = useState<TrieSnapshot>(() =>
    snapshotFromWords(TRIE_DEFAULT_WORDS),
  )
  const [operation, setOperation] = useState<TrieOperation>('insert')
  const [wordInput, setWordInput] = useState('cargo')
  const [autocompletePrefix, setAutocompletePrefix] = useState('ca')
  const [autocompleteTrie] = useState(() =>
    snapshotFromWords(TRIE_AUTOCOMPLETE_WORDS),
  )

  const selected = OPERATIONS.find((item) => item.id === operation)!
  const normalizedInput = selected.needsWord ? normalizeWord(wordInput) : null
  const wordError =
    selected.needsWord && normalizedInput === null
      ? 'Enter a non-empty word. Input is trimmed and lowercased.'
      : null

  const steps = useMemo(
    () =>
      buildTrieSteps(
        snapshot,
        operation,
        selected.needsWord ? wordInput : null,
      ),
    [snapshot, operation, wordInput, selected.needsWord],
  )

  const indexArray = useMemo(
    () => snapshot.nodes.map((_, index) => index),
    [snapshot.nodes],
  )

  const mutating =
    operation === 'insert' || operation === 'delete'
  const storedWords = getAllWords(snapshot)

  const autocompleteNormalized = normalizeWord(autocompletePrefix) ?? ''
  const suggestions =
    autocompleteNormalized.length === 0
      ? []
      : startsWith(autocompleteTrie, autocompleteNormalized, 8).suggestions

  const applyFinalTrie = () => {
    if (operation === 'insert') {
      if (normalizedInput === null) {
        return
      }
      setSnapshot(insert(snapshot, normalizedInput).snapshot)
      return
    }
    if (operation === 'delete') {
      if (normalizedInput === null) {
        return
      }
      const result = deleteWord(snapshot, normalizedInput)
      if (result.deleted) {
        setSnapshot(result.snapshot)
      }
    }
  }

  const resetTrie = () => {
    setSnapshot(snapshotFromWords(TRIE_DEFAULT_WORDS))
    setOperation('insert')
    setWordInput('cargo')
  }

  return (
    <div className="space-y-4">
      <p
        className={cn(
          'rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2',
          'text-body-sm text-sky-950 dark:text-sky-100',
        )}
        role="note"
      >
        A Trie stores strings character-by-character from a shared root.
        Words with the same prefix reuse one path — insert{' '}
        <span className="font-mono">card</span> after{' '}
        <span className="font-mono">car</span> only adds{' '}
        <span className="font-mono">d</span>. This playground is{' '}
        <strong className="font-medium">case-insensitive</strong>: input is
        trimmed and lowercased before every operation. Empty strings are
        rejected. Duplicates do not increase the word count. Violet dots mark
        end-of-word nodes.
      </p>

      <div className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20">
        <p className="text-body-sm text-muted-foreground" aria-live="polite">
          Words ({size(snapshot)}):{' '}
          <span className="font-mono text-foreground">
            {formatTrie(snapshot)}
          </span>
          {' · '}
          Preview:{' '}
          <span className="font-mono text-foreground">
            {previewResult(snapshot, operation, wordInput)}
          </span>
        </p>
      </div>

      <AlgorithmVisualizer
        key={`trie-${operation}-${serializeForKey(snapshot)}-${wordInput}`}
        title="Trie in action"
        category="Data Structures"
        array={indexArray}
        steps={steps}
        hideArray
        showLegend={false}
        showFullscreen
        inputSlot={
          <div className="space-y-4 rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20">
            <div>
              <p className="text-label text-[0.65rem] tracking-[0.08em]">
                Operation
              </p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {OPERATIONS.map((item) => (
                  <Button
                    key={item.id}
                    type="button"
                    variant={operation === item.id ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setOperation(item.id)}
                    aria-pressed={operation === item.id}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>

            {selected.needsWord ? (
              <label className="block min-w-0 max-w-xs">
                <span className="text-label text-[0.65rem] tracking-[0.08em]">
                  Word / prefix
                </span>
                <input
                  type="text"
                  value={wordInput}
                  onChange={(event) => setWordInput(event.target.value)}
                  className={cn(
                    'mt-1.5 h-10 w-full rounded-md border border-border bg-surface px-3',
                    'font-mono text-sm text-foreground shadow-sm transition-theme',
                    'placeholder:text-muted-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    wordError && 'border-rose-500/60',
                  )}
                  placeholder="e.g. card"
                  aria-label="Trie operation word"
                  aria-invalid={wordError ? true : undefined}
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
                {wordError ? (
                  <p className="mt-1.5 text-body-sm text-rose-600 dark:text-rose-400">
                    {wordError}
                  </p>
                ) : normalizedInput && normalizedInput !== wordInput.trim() ? (
                  <p className="mt-1.5 text-body-sm text-muted-foreground">
                    Normalized:{' '}
                    <span className="font-mono text-foreground">
                      {normalizedInput}
                    </span>
                  </p>
                ) : null}
              </label>
            ) : (
              <p className="text-body-sm text-muted-foreground">
                List walks every end-of-word marker in lexicographic edge order.
              </p>
            )}

            <div>
              <p className="text-label text-[0.65rem] tracking-[0.08em]">
                Starting trie
              </p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {TRIE_WORD_PRESETS.map((preset) => {
                  const selectedPreset = wordsEqual(
                    getAllWords(snapshotFromWords(preset.words)),
                    storedWords,
                  )
                  return (
                    <Button
                      key={preset.id}
                      type="button"
                      variant={selectedPreset ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() =>
                        setSnapshot(snapshotFromWords(preset.words))
                      }
                      aria-pressed={selectedPreset}
                    >
                      {preset.label}
                    </Button>
                  )
                })}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSnapshot(clear(snapshot))}
                >
                  Clear trie
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetTrie}
                >
                  Reset lesson words
                </Button>
              </div>
            </div>

            {mutating ? (
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={Boolean(wordError)}
                  onClick={applyFinalTrie}
                >
                  Apply result to starting trie
                </Button>
                <p className="mt-1.5 text-body-sm text-muted-foreground">
                  Optional: commit a successful insert or delete as the new
                  starting trie. Playback never mutates historical steps.
                </p>
              </div>
            ) : null}
          </div>
        }
        canvasAddon={(step) => <TriePanels step={step} />}
      />

      <section
        className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5"
        aria-labelledby="trie-autocomplete-heading"
      >
        <h3
          id="trie-autocomplete-heading"
          className="text-base font-medium text-foreground"
        >
          Autocomplete demo
        </h3>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Type a prefix against a fixed sample lexicon (
          <span className="font-mono">
            {TRIE_AUTOCOMPLETE_WORDS.slice(0, 8).join(', ')}…
          </span>
          ). Matching uses the same{' '}
          <span className="font-mono">startsWith</span> walk — not a production
          search engine.
        </p>
        <label className="mt-4 block max-w-sm">
          <span className="text-label text-[0.65rem] tracking-[0.08em]">
            Prefix
          </span>
          <input
            type="text"
            value={autocompletePrefix}
            onChange={(event) => setAutocompletePrefix(event.target.value)}
            className={cn(
              'mt-1.5 h-10 w-full rounded-md border border-border bg-muted/40 px-3',
              'font-mono text-sm text-foreground shadow-sm transition-theme',
              'placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'dark:bg-muted/20',
            )}
            placeholder="e.g. ca"
            aria-label="Autocomplete prefix"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </label>
        <ul
          className="mt-3 flex flex-wrap gap-2"
          aria-live="polite"
          aria-label="Autocomplete suggestions"
        >
          {autocompleteNormalized.length === 0 ? (
            <li className="text-body-sm text-muted-foreground">
              Type at least one character to see suggestions.
            </li>
          ) : suggestions.length === 0 ? (
            <li className="text-body-sm text-muted-foreground">
              No words start with{' '}
              <span className="font-mono text-foreground">
                {autocompleteNormalized}
              </span>
              .
            </li>
          ) : (
            suggestions.map((word) => (
              <li key={word}>
                <button
                  type="button"
                  className={cn(
                    'rounded-md border border-border bg-muted/50 px-2.5 py-1',
                    'font-mono text-sm text-foreground transition-theme',
                    'hover:border-primary/40 hover:bg-primary/10',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  )}
                  onClick={() => {
                    setWordInput(word)
                    setOperation('search')
                    setSnapshot(snapshotFromWords(TRIE_AUTOCOMPLETE_WORDS))
                  }}
                >
                  {word}
                </button>
              </li>
            ))
          )}
        </ul>
        <p className="mt-3 text-body-sm text-muted-foreground">
          Empty sample clear:{' '}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAutocompletePrefix('')}
          >
            Clear prefix
          </Button>{' '}
          · Lexicon size {size(autocompleteTrie)} · Try{' '}
          <button
            type="button"
            className="font-mono text-primary underline-offset-2 hover:underline"
            onClick={() => setAutocompletePrefix('do')}
          >
            do
          </button>
          ,{' '}
          <button
            type="button"
            className="font-mono text-primary underline-offset-2 hover:underline"
            onClick={() => setAutocompletePrefix('app')}
          >
            app
          </button>
          , or{' '}
          <button
            type="button"
            className="font-mono text-primary underline-offset-2 hover:underline"
            onClick={() => setAutocompletePrefix('ban')}
          >
            ban
          </button>
          .
        </p>
      </section>
    </div>
  )
}

function serializeForKey(snapshot: TrieSnapshot): string {
  return `${snapshot.rootId}:${snapshot.wordCount}:${snapshot.nextIdCounter}:${snapshot.nodes
    .map(
      (node) =>
        `${node.id}=${node.char}:${node.isEndOfWord ? '1' : '0'}>${node.children
          .map((e) => `${e.char}:${e.childId}`)
          .join(',')}`,
    )
    .join('|')}`
}
