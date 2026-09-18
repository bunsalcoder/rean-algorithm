import { cn } from '../../lib/cn'

type ComplexityBadgeProps = {
  className?: string
}

export function ComplexityBadge({ className }: ComplexityBadgeProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-primary/25 bg-surface/95 px-3.5 py-2.5 shadow-lg backdrop-blur-sm',
        'dark:border-primary/30 dark:bg-surface-elevated/95',
        'hero-float transition-theme',
        className,
      )}
    >
      <p className="text-label text-[0.65rem] tracking-[0.08em] text-muted-foreground">
        Time Complexity
      </p>
      <p className="mt-0.5 font-mono text-sm font-medium text-primary">
        O(log n)
      </p>
    </div>
  )
}
