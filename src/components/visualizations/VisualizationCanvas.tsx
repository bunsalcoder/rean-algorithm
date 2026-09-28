import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type VisualizationCanvasProps = {
  children: ReactNode
  className?: string
  label?: string
}

export function VisualizationCanvas({
  children,
  className,
  label = 'Algorithm visualization',
}: VisualizationCanvasProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        'rounded-xl border border-border bg-muted/40 p-4 shadow-sm dark:bg-muted/20 sm:p-5',
        className,
      )}
    >
      {children}
    </div>
  )
}
