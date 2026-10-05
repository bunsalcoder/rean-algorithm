import { cn } from '../../lib/cn'
import {
  SEARCHING_COMPARISON_DEMO_ARRAY,
  SEARCHING_COMPARISON_DEMO_TARGET,
} from '../../data/algorithms/searching-comparison'

type SearchingComparisonHeroProps = {
  className?: string
}

/**
 * Decorative hero visual: array cells, target chip, and a search pointer.
 * Not a benchmark and not an animated fake timer.
 */
export function SearchingComparisonHero({
  className,
}: SearchingComparisonHeroProps) {
  const array = SEARCHING_COMPARISON_DEMO_ARRAY
  const target = SEARCHING_COMPARISON_DEMO_TARGET
  const pointerIndex = array.indexOf(target)
  const highlighted = new Set([4, 6, 7])

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5',
        className,
      )}
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-10 -top-10 size-40 rounded-full bg-primary/10 blur-2xl dark:bg-primary/16" />
        <div className="absolute -bottom-12 left-8 size-36 rounded-full bg-primary/8 blur-2xl dark:bg-primary/12" />
      </div>

      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-label text-[0.65rem] tracking-[0.08em] text-muted-foreground">
            Example array
          </p>
          <p className="rounded-md border border-primary/25 bg-primary-muted px-2.5 py-1 font-mono text-xs font-medium text-accent-foreground">
            Target: {target}
          </p>
        </div>

        <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1 sm:gap-2">
          {array.map((value, index) => {
            const isTarget = value === target
            const isPointer = index === pointerIndex
            const isHighlighted = highlighted.has(index)

            return (
              <div
                key={`${value}-${index}`}
                className="flex min-w-[2.5rem] flex-col items-center gap-1"
              >
                <span
                  className={cn(
                    'flex size-10 items-center justify-center rounded-lg border font-mono text-xs sm:size-11 sm:text-sm',
                    'transition-theme',
                    isTarget
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : isHighlighted
                        ? 'border-primary/40 bg-primary-muted text-accent-foreground'
                        : 'border-border bg-muted/50 text-foreground dark:bg-muted/30',
                  )}
                >
                  {value}
                </span>
                <span className="font-mono text-[0.65rem] text-muted-foreground">
                  {index}
                </span>
                <span
                  className={cn(
                    'h-3 text-primary transition-opacity duration-300',
                    'motion-reduce:transition-none',
                    isPointer ? 'opacity-100' : 'opacity-0',
                  )}
                >
                  ▲
                </span>
              </div>
            )
          })}
        </div>

        <p className="mt-1 text-body-sm text-muted-foreground">
          A search pointer highlights candidate positions while the algorithm
          looks for the target — conceptual only, not a runtime measurement.
        </p>
      </div>
    </div>
  )
}
