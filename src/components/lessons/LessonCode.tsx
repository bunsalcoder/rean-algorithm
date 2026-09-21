import { useState } from 'react'
import type { LessonCode } from '../../data/lessons/types'
import { cn } from '../../lib/cn'
import { CodeBlock } from './CodeBlock'
import { LessonSection, LessonSectionHeading } from './LessonSection'

type CodeLanguage = keyof LessonCode

const LANGUAGES: { id: CodeLanguage; label: string }[] = [
  { id: 'python', label: 'Python' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
]

type LessonCodeProps = {
  code: LessonCode
}

export function LessonCodeExamples({ code }: LessonCodeProps) {
  const [active, setActive] = useState<CodeLanguage>('python')

  return (
    <LessonSection id="code">
      <LessonSectionHeading
        id="code"
        eyebrow="IMPLEMENTATION"
        title="Code Examples"
        description="Same idea in multiple languages. Reading only — execution comes later."
      />

      <div
        className={cn(
          'overflow-hidden rounded-xl border border-border bg-[#0f172a] shadow-sm',
          'dark:border-white/10 dark:bg-[#0a1220]',
          'transition-theme',
        )}
      >
        <div className="flex items-center gap-2 border-b border-white/10 px-2 py-2 sm:px-3">
          <div className="hidden items-center gap-1.5 px-1 sm:flex" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </div>

          <div
            className="flex min-w-0 flex-1 gap-0.5 overflow-x-auto"
            role="tablist"
            aria-label="Code language"
          >
            {LANGUAGES.map((language) => {
              const isActive = language.id === active

              return (
                <button
                  key={language.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  id={`code-tab-${language.id}`}
                  aria-controls={`code-panel-${language.id}`}
                  onClick={() => setActive(language.id)}
                  className={cn(
                    'shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium transition-theme sm:px-3',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-white/45 hover:bg-white/5 hover:text-white/75',
                  )}
                >
                  {language.label}
                </button>
              )
            })}
          </div>
        </div>

        {LANGUAGES.map((language) => {
          const isActive = language.id === active

          return (
            <div
              key={language.id}
              id={`code-panel-${language.id}`}
              role="tabpanel"
              aria-labelledby={`code-tab-${language.id}`}
              hidden={!isActive}
            >
              {isActive ? (
                <CodeBlock
                  code={code[language.id]}
                  className="rounded-none border-0 shadow-none"
                />
              ) : null}
            </div>
          )
        })}
      </div>
    </LessonSection>
  )
}
