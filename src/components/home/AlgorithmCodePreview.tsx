import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { ArrayPreview } from './ArrayPreview'
import { ComplexityBadge } from './ComplexityBadge'

const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Java'] as const

type AlgorithmCodePreviewProps = {
  className?: string
}

function CodeLine({
  number,
  children,
}: {
  number: number
  children: ReactNode
}) {
  return (
    <div className="flex gap-3 sm:gap-4">
      <span className="w-4 shrink-0 select-none text-right text-white/25">
        {number}
      </span>
      <span className="min-w-0 whitespace-pre">{children}</span>
    </div>
  )
}

export function AlgorithmCodePreview({ className }: AlgorithmCodePreviewProps) {
  return (
    <div className={cn('relative mx-auto w-full min-w-0 max-w-lg', className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-primary/20 blur-3xl sm:-inset-6 dark:bg-primary/25"
      />

      <div
        className={cn(
          'relative overflow-hidden rounded-xl border border-white/10',
          'bg-[#0f172a] shadow-lg dark:bg-[#0a1220]',
          'transition-theme',
        )}
      >
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5 sm:px-4">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </div>

          <div
            className="ml-2 flex min-w-0 flex-1 gap-0.5 overflow-x-auto sm:ml-3"
            role="tablist"
            aria-label="Language preview"
          >
            {LANGUAGES.map((language) => {
              const active = language === 'TypeScript'

              return (
                <span
                  key={language}
                  role="tab"
                  aria-selected={active}
                  className={cn(
                    'shrink-0 rounded-md px-2 py-1 text-[0.7rem] font-medium sm:px-2.5 sm:text-xs',
                    active
                      ? 'bg-white/10 text-white'
                      : 'text-white/45',
                  )}
                >
                  {language}
                </span>
              )
            })}
          </div>
        </div>

        <pre className="overflow-x-auto p-3 font-mono text-[0.7rem] leading-6 text-slate-300 sm:p-4 sm:text-[0.8rem] sm:leading-7">
          <code>
            <CodeLine number={1}>
              <span className="text-[#c792ea]">function</span>{' '}
              <span className="text-[#82aaff]">binarySearch</span>
              <span className="text-white/70">(</span>
              <span className="text-[#f78c6c]">arr</span>
              <span className="text-white/50">: </span>
              <span className="text-[#ffcb6b]">number</span>
              <span className="text-white/70">[], </span>
              <span className="text-[#f78c6c]">target</span>
              <span className="text-white/50">: </span>
              <span className="text-[#ffcb6b]">number</span>
              <span className="text-white/70">) {'{'}</span>
            </CodeLine>
            <CodeLine number={2}>
              <span className="text-[#c792ea]">  let</span>{' '}
              <span className="text-[#eeffff]">left</span>
              <span className="text-white/70"> = </span>
              <span className="text-[#f78c6c]">0</span>
              <span className="text-white/70">;</span>
            </CodeLine>
            <CodeLine number={3}>
              <span className="text-[#c792ea]">  let</span>{' '}
              <span className="text-[#eeffff]">right</span>
              <span className="text-white/70"> = </span>
              <span className="text-[#eeffff]">arr</span>
              <span className="text-white/70">.</span>
              <span className="text-[#82aaff]">length</span>
              <span className="text-white/70"> - </span>
              <span className="text-[#f78c6c]">1</span>
              <span className="text-white/70">;</span>
            </CodeLine>
            <CodeLine number={4}>
              <span className="text-white/30"> </span>
            </CodeLine>
            <CodeLine number={5}>
              <span className="text-[#c792ea]">  while</span>
              <span className="text-white/70"> (</span>
              <span className="text-[#eeffff]">left</span>
              <span className="text-white/70"> {'<='} </span>
              <span className="text-[#eeffff]">right</span>
              <span className="text-white/70">) {'{'}</span>
            </CodeLine>
            <CodeLine number={6}>
              <span className="text-[#c792ea]">    const</span>{' '}
              <span className="text-[#eeffff]">mid</span>
              <span className="text-white/70"> = </span>
              <span className="text-[#82aaff]">Math</span>
              <span className="text-white/70">.</span>
              <span className="text-[#82aaff]">floor</span>
              <span className="text-white/70">((</span>
              <span className="text-[#eeffff]">left</span>
              <span className="text-white/70"> + </span>
              <span className="text-[#eeffff]">right</span>
              <span className="text-white/70">) / </span>
              <span className="text-[#f78c6c]">2</span>
              <span className="text-white/70">);</span>
            </CodeLine>
            <CodeLine number={7}>
              <span className="text-[#c792ea]">    if</span>
              <span className="text-white/70"> (</span>
              <span className="text-[#eeffff]">arr</span>
              <span className="text-white/70">[</span>
              <span className="text-[#eeffff]">mid</span>
              <span className="text-white/70">] === </span>
              <span className="text-[#eeffff]">target</span>
              <span className="text-white/70">) </span>
              <span className="text-[#c792ea]">return</span>{' '}
              <span className="text-[#eeffff]">mid</span>
              <span className="text-white/70">;</span>
            </CodeLine>
            <CodeLine number={8}>
              <span className="text-[#c792ea]">    if</span>
              <span className="text-white/70"> (</span>
              <span className="text-[#eeffff]">arr</span>
              <span className="text-white/70">[</span>
              <span className="text-[#eeffff]">mid</span>
              <span className="text-white/70">] {'<'} </span>
              <span className="text-[#eeffff]">target</span>
              <span className="text-white/70">) </span>
              <span className="text-[#eeffff]">left</span>
              <span className="text-white/70"> = </span>
              <span className="text-[#eeffff]">mid</span>
              <span className="text-white/70"> + </span>
              <span className="text-[#f78c6c]">1</span>
              <span className="text-white/70">;</span>
            </CodeLine>
            <CodeLine number={9}>
              <span className="text-[#c792ea]">    else</span>{' '}
              <span className="text-[#eeffff]">right</span>
              <span className="text-white/70"> = </span>
              <span className="text-[#eeffff]">mid</span>
              <span className="text-white/70"> - </span>
              <span className="text-[#f78c6c]">1</span>
              <span className="text-white/70">;</span>
            </CodeLine>
            <CodeLine number={10}>
              <span className="text-white/70">  {'}'}</span>
            </CodeLine>
            <CodeLine number={11}>
              <span className="text-[#c792ea]">  return</span>{' '}
              <span className="text-[#f78c6c]">-1</span>
              <span className="text-white/70">;</span>
            </CodeLine>
            <CodeLine number={12}>
              <span className="text-white/70">{'}'}</span>
            </CodeLine>
          </code>
        </pre>
      </div>

      <ComplexityBadge className="absolute right-2 top-12 z-10 sm:-right-3 sm:top-16" />
      <ArrayPreview className="absolute -bottom-4 left-1 z-10 max-w-[calc(100%-0.5rem)] sm:-bottom-5 sm:left-4" />
    </div>
  )
}
