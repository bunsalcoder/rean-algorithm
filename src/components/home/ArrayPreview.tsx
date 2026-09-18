import { cn } from '../../lib/cn'

const VALUES = [1, 3, 5, 7, 9, 11, 13] as const
const MID_INDEX = 3

type ArrayPreviewProps = {
  className?: string
}

export function ArrayPreview({ className }: ArrayPreviewProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-surface/95 p-3 shadow-lg backdrop-blur-sm',
        'dark:border-border dark:bg-surface-elevated/95',
        'hero-float hero-float-delayed transition-theme',
        className,
      )}
    >
      <p className="mb-2 text-label text-[0.65rem] tracking-[0.08em]">
        Array
      </p>
      <div className="flex items-end gap-1 sm:gap-1.5">
        {VALUES.map((value, index) => {
          const isMid = index === MID_INDEX

          return (
            <div key={value} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'flex size-7 items-center justify-center rounded-md border font-mono text-xs font-medium sm:size-8 sm:text-sm',
                  'transition-theme',
                  isMid
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/30'
                    : 'border-border bg-muted text-foreground',
                )}
              >
                {value}
              </div>
              {isMid ? (
                <span
                  aria-hidden="true"
                  className="text-[0.6rem] font-medium uppercase tracking-wide text-primary"
                >
                  mid
                </span>
              ) : (
                <span aria-hidden="true" className="h-3.5" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
