import {
  parseGroupAnagramsGroups,
  parseGroupAnagramsMap,
  type GroupAnagramsPhase,
} from '../../algorithms/array-string/groupAnagramsSteps'
import { cn } from '../../lib/cn'
import type { VisualizationStep } from './types'

type GroupAnagramPanelsProps = {
  words: readonly string[]
  step: VisualizationStep | undefined
  className?: string
}

function readNumber(
  meta: VisualizationStep['meta'],
  key: string,
  fallback: number,
): number {
  const value = meta?.[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function readString(
  meta: VisualizationStep['meta'],
  key: string,
  fallback = '',
): string {
  const value = meta?.[key]
  return typeof value === 'string' ? value : fallback
}

function readBoolean(
  meta: VisualizationStep['meta'],
  key: string,
  fallback: boolean,
): boolean {
  const value = meta?.[key]
  return typeof value === 'boolean' ? value : fallback
}

function readPhase(meta: VisualizationStep['meta']): GroupAnagramsPhase | null {
  const value = meta?.phase
  return typeof value === 'string' ? (value as GroupAnagramsPhase) : null
}

function formatQuoted(value: string): string {
  return `"${value}"`
}

/**
 * Educational panels for Group Anagrams: input words, signature, hash map, result.
 */
export function GroupAnagramPanels({
  words,
  step,
  className,
}: GroupAnagramPanelsProps) {
  const meta = step?.meta
  const phase = readPhase(meta)
  const currentWordIndex = readNumber(meta, 'currentWordIndex', -1)
  const currentWord = readString(meta, 'currentWord')
  const currentSignature = readString(meta, 'currentSignature')
  const signatureExists = readBoolean(meta, 'signatureExists', false)
  const message = readString(meta, 'message')
  const mapEntries = parseGroupAnagramsMap(readString(meta, 'mapSnapshot', '[]'))
  const resultGroups = parseGroupAnagramsGroups(
    readString(meta, 'groupsSnapshot', '[]'),
  )

  const showSignature =
    phase === 'create-signature' ||
    phase === 'check-map' ||
    phase === 'create-group' ||
    phase === 'append-to-group' ||
    phase === 'update-map'

  const highlightSignature =
    phase === 'check-map' ||
    phase === 'create-group' ||
    phase === 'append-to-group' ||
    phase === 'update-map'

  return (
    <div className={cn('mb-4 space-y-3', className)}>
      <div
        className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-muted/20 sm:p-4"
        aria-label="Input words"
      >
        <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
          Input words
        </p>
        {words.length === 0 ? (
          <p className="mt-2 text-body-sm text-muted-foreground">(empty array)</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {words.map((word, index) => {
              const isCurrent =
                currentWordIndex >= 0 && index === currentWordIndex

              return (
                <span
                  key={`word-${index}-${word}`}
                  className={cn(
                    'inline-flex items-center rounded-md border px-2.5 py-1.5 font-mono text-sm',
                    'transition-[background-color,border-color,box-shadow,transform] duration-300 ease-out',
                    'motion-reduce:transition-none motion-reduce:transform-none',
                    isCurrent
                      ? 'border-primary bg-primary/15 text-foreground shadow-sm ring-2 ring-primary/30 scale-105 motion-reduce:scale-100'
                      : 'border-border bg-surface text-foreground',
                  )}
                >
                  <span className="mr-1.5 text-[0.65rem] text-muted-foreground">
                    {index}
                  </span>
                  {formatQuoted(word)}
                </span>
              )
            })}
          </div>
        )}
      </div>

      {showSignature && currentWord !== '' ? (
        <div
          className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-muted/20 sm:p-4"
          aria-label="Signature generation"
          aria-live="polite"
        >
          <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
            Signature
          </p>
          <p className="mt-2 font-mono text-sm text-foreground">
            {formatQuoted(currentWord)} →{' '}
            <span
              className={cn(
                'rounded px-1.5 py-0.5',
                highlightSignature && 'bg-primary/15 font-semibold',
              )}
            >
              {formatQuoted(currentSignature)}
            </span>
          </p>
          <p className="mt-2 text-body-sm text-muted-foreground">
            Sorted characters form a canonical key. Matching keys mean anagrams.
          </p>
          {phase === 'check-map' ? (
            <p className="mt-2 text-body-sm text-muted-foreground">
              {signatureExists
                ? 'This signature already exists — append to its group.'
                : 'This signature is new — create a group.'}
            </p>
          ) : null}
        </div>
      ) : null}

      <div
        className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-muted/20 sm:p-4"
        aria-label="Signature to groups map"
        aria-live="polite"
      >
        <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
          Hash map (signature → words)
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Keys appear in the order each signature was first seen.
        </p>

        {mapEntries.length === 0 ? (
          <p className="mt-3 text-body-sm text-muted-foreground">(empty)</p>
        ) : (
          <div className="mt-3 space-y-2">
            {mapEntries.map((entry) => {
              const isFocus =
                highlightSignature && entry.signature === currentSignature

              return (
                <div
                  key={`map-${entry.signature}`}
                  className={cn(
                    'rounded-lg border px-3 py-2 font-mono text-sm',
                    'transition-[background-color,border-color] duration-300 ease-out motion-reduce:transition-none',
                    isFocus
                      ? 'border-primary/50 bg-primary/10'
                      : 'border-border/70 bg-surface/80',
                  )}
                >
                  <span className="font-semibold text-foreground">
                    {formatQuoted(entry.signature)}
                  </span>
                  <span className="text-muted-foreground"> → </span>
                  <span className="text-foreground">
                    [{entry.words.map(formatQuoted).join(', ')}]
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {phase === 'complete' || resultGroups.length > 0 ? (
        <div
          className={cn(
            'rounded-xl border px-4 py-3',
            phase === 'complete'
              ? 'border-emerald-500/40 bg-emerald-500/10'
              : 'border-border bg-muted/30 dark:bg-muted/15',
          )}
          role="status"
          aria-live="polite"
        >
          <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
            Grouped result
          </p>
          <p className="mt-2 font-mono text-sm text-foreground">
            {resultGroups.length === 0
              ? '[]'
              : resultGroups
                  .map((group) => `[${group.map(formatQuoted).join(', ')}]`)
                  .join(', ')}
          </p>
        </div>
      ) : null}

      {message ? (
        <p className="text-body-sm text-muted-foreground" aria-live="polite">
          {message}
        </p>
      ) : null}
    </div>
  )
}
