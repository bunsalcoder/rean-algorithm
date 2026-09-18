import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type SectionProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode
}

export function Section({ className, children, ...props }: SectionProps) {
  return (
    <section
      className={cn(
        'w-full py-10 sm:py-14 lg:py-16 transition-theme',
        className,
      )}
      {...props}
    >
      {children}
    </section>
  )
}
