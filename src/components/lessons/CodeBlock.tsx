import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type CodeBlockProps = {
  code: string
  label?: string
  className?: string
  footer?: ReactNode
}

export function CodeBlock({ code, label, className, footer }: CodeBlockProps) {
  const lines = code.replace(/\n$/, '').split('\n')

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-[#0f172a] shadow-sm',
        'dark:border-white/10 dark:bg-[#0a1220]',
        'transition-theme',
        className,
      )}
    >
      {label ? (
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5 sm:px-4">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="ml-2 text-xs font-medium text-white/55">{label}</span>
        </div>
      ) : null}

      <pre className="overflow-x-auto p-3 font-mono text-[0.75rem] leading-6 text-slate-300 sm:p-4 sm:text-[0.8125rem] sm:leading-7">
        <code>
          {lines.map((line, index) => (
            <div key={index} className="flex gap-3 sm:gap-4">
              <span className="w-5 shrink-0 select-none text-right text-white/25 sm:w-6">
                {index + 1}
              </span>
              <span className="min-w-0 whitespace-pre text-slate-200">
                {line.length === 0 ? ' ' : line}
              </span>
            </div>
          ))}
        </code>
      </pre>

      {footer}
    </div>
  )
}
