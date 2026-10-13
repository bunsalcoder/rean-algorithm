import { useMemo, useState } from 'react'
import {
  GROUP_ANAGRAMS_DEFAULT_WORDS,
  GROUP_ANAGRAMS_PRESETS,
  formatGroupAnagramsInput,
  generateRandomGroupAnagramsWords,
  groupAnagrams,
  parseGroupAnagramsInput,
} from '../../algorithms/array-string/groupAnagrams'
import { buildGroupAnagramsSteps } from '../../algorithms/array-string/groupAnagramsSteps'
import { cn } from '../../lib/cn'
import { Button } from '../ui'
import { AlgorithmVisualizer } from './AlgorithmVisualizer'
import { GroupAnagramPanels } from './GroupAnagramPanels'

/**
 * Thin lesson wrapper: owns word-list input, generates steps, and feeds the
 * reusable AlgorithmVisualizer with signature-map panels.
 */
export function GroupAnagramsVisualization() {
  const [rawInput, setRawInput] = useState<string>(
    formatGroupAnagramsInput(GROUP_ANAGRAMS_DEFAULT_WORDS),
  )

  const parsed = useMemo(() => parseGroupAnagramsInput(rawInput), [rawInput])
  const words = parsed.ok ? parsed.words : [...GROUP_ANAGRAMS_DEFAULT_WORDS]

  const steps = useMemo(() => buildGroupAnagramsSteps(words), [words])
  const groups = useMemo(() => groupAnagrams(words), [words])
  const indexArray = useMemo(
    () => Array.from({ length: Math.max(words.length, 1) }, (_, index) => index),
    [words.length],
  )

  const groupsSummary =
    groups.length === 0
      ? '[]'
      : groups
          .map((group) => `[${group.map((word) => `"${word}"`).join(', ')}]`)
          .join(', ')

  return (
    <div className="space-y-4">
      <p
        className={cn(
          'rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2',
          'text-body-sm text-sky-950 dark:text-sky-100',
        )}
        role="note"
      >
        Sort each word’s characters to build a signature, then group words in a
        hash map. Comparison is exact: case-sensitive, and spaces/punctuation
        count. Examples use ordinary BMP characters.
      </p>

      <div className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20">
        <p className="text-body-sm text-muted-foreground" aria-live="polite">
          Words:{' '}
          <span className="font-mono text-foreground">
            {formatGroupAnagramsInput(words)}
          </span>
          {' · '}
          Groups:{' '}
          <span className="font-mono text-foreground">{groupsSummary}</span>
        </p>
      </div>

      <AlgorithmVisualizer
        key={`group-anagrams-${words.join('\u0000')}`}
        title="Group Anagrams in action"
        category="Array & String"
        array={indexArray}
        steps={steps}
        hideArray
        showLegend
        showFullscreen
        inputSlot={
          <div className="space-y-4 rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20">
            <label className="block min-w-0">
              <span className="text-label text-[0.65rem] tracking-[0.08em]">
                Input words (JSON array or comma-separated)
              </span>
              <input
                type="text"
                value={rawInput}
                onChange={(event) => setRawInput(event.target.value)}
                className={cn(
                  'mt-1.5 h-10 w-full rounded-md border border-border bg-surface px-3',
                  'font-mono text-sm text-foreground shadow-sm transition-theme',
                  'placeholder:text-muted-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  !parsed.ok && 'border-rose-500/60',
                )}
                placeholder='e.g. ["eat","tea","tan"] or eat, tea, tan'
                aria-label="Input words"
                aria-invalid={!parsed.ok}
              />
            </label>

            {!parsed.ok ? (
              <p
                className="text-body-sm text-rose-700 dark:text-rose-200"
                role="alert"
              >
                {parsed.error}
              </p>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setRawInput(
                    formatGroupAnagramsInput(GROUP_ANAGRAMS_DEFAULT_WORDS),
                  )
                }
              >
                Load example
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setRawInput(
                    formatGroupAnagramsInput(generateRandomGroupAnagramsWords()),
                  )
                }
              >
                Generate random
              </Button>
            </div>

            <div>
              <p className="text-label text-[0.65rem] tracking-[0.08em]">
                Presets
              </p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {GROUP_ANAGRAMS_PRESETS.map((preset) => {
                  const presetRaw = formatGroupAnagramsInput(preset.words)
                  const selected = rawInput === presetRaw
                  return (
                    <Button
                      key={preset.id}
                      type="button"
                      variant={selected ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => setRawInput(presetRaw)}
                      aria-pressed={selected}
                    >
                      {preset.label}
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>
        }
        canvasAddon={(step) => (
          <GroupAnagramPanels words={words} step={step} />
        )}
      />
    </div>
  )
}
