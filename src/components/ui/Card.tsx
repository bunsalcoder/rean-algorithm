import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-surface p-6 shadow-sm transition-theme',
        'hover:border-primary/30 hover:shadow-md',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
