import { useState } from 'react'
import {
  PRACTICE_LANGUAGES,
  copyTextToClipboard,
  getSolutionForLanguage,
  type PracticeLanguage,
  type PracticeProblem,
} from '../../data/practice'
import { cn } from '../../lib/cn'
import { CodeBlock } from '../lessons'
import { Button } from '../ui'

type PracticeSolutionPanelProps = {
  problem: PracticeProblem
}

export function PracticeSolutionPanel({ problem }: PracticeSolutionPanelProps) {
  const [language, setLanguage] = useState<PracticeLanguage>('python')
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>(
    'idle',
  )
  const code = getSolutionForLanguage(problem, language)
  const languageLabel =
    PRACTICE_LANGUAGES.find((item) => item.id === language)?.label ?? language

  async function handleCopy() {
    const succeeded = await copyTextToClipboard(code)
    setCopyStatus(succeeded ? 'copied' : 'failed')
    window.setTimeout(() => setCopyStatus('idle'), 2000)
  }

  return (
    <section aria-labelledby="practice-solution-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="practice-solution-heading"
            className="text-xl font-medium text-foreground sm:text-2xl"
          >
            Reference solution
          </h2>
          <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground">
            Read-only reference implementations. Code is not executed in the
            browser.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            void handleCopy()
          }}
          aria-label={`Copy ${languageLabel} solution`}
        >
          {copyStatus === 'copied'
            ? 'Copied'
            : copyStatus === 'failed'
              ? 'Copy unavailable'
              : 'Copy code'}
        </Button>
      </div>

      <div
        className={cn(
          'mt-4 overflow-hidden rounded-xl border border-border bg-[#0f172a] shadow-sm',
          'dark:border-white/10 dark:bg-[#0a1220]',
          'transition-theme',
        )}
      >
        <div className="flex items-center gap-2 border-b border-white/10 px-2 py-2 sm:px-3">
          <div
            className="hidden items-center gap-1.5 px-1 sm:flex"
            aria-hidden="true"
          >
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </div>

          <div
            className="flex min-w-0 flex-1 gap-0.5 overflow-x-auto"
            role="tablist"
            aria-label="Solution language"
          >
            {PRACTICE_LANGUAGES.map((item) => {
              const isActive = item.id === language

              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  id={`practice-code-tab-${item.id}`}
                  aria-controls={`practice-code-panel-${item.id}`}
                  onClick={() => {
                    setLanguage(item.id)
                    setCopyStatus('idle')
                  }}
                  className={cn(
                    'shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium transition-theme sm:px-3',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-white/45 hover:bg-white/5 hover:text-white/75',
                  )}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>

        {PRACTICE_LANGUAGES.map((item) => {
          const isActive = item.id === language

          return (
            <div
              key={item.id}
              id={`practice-code-panel-${item.id}`}
              role="tabpanel"
              aria-labelledby={`practice-code-tab-${item.id}`}
              hidden={!isActive}
            >
              {isActive ? (
                <CodeBlock
                  code={code}
                  className="rounded-none border-0 shadow-none"
                />
              ) : null}
            </div>
          )
        })}
      </div>

      <p className="mt-2 text-body-sm text-muted-foreground" aria-live="polite">
        {copyStatus === 'copied'
          ? `${languageLabel} solution copied to clipboard.`
          : copyStatus === 'failed'
            ? 'Clipboard access is unavailable in this environment.'
            : `Showing the ${languageLabel} reference solution.`}
      </p>
    </section>
  )
}
