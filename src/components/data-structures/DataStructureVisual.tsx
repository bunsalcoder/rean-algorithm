import { cn } from '../../lib/cn'

type DataStructureVisualProps = {
  className?: string
}

/**
 * Lightweight hero illustration: array cells, stack layers, and a small tree of nodes.
 * Decorative only — respects prefers-reduced-motion via motion-safe utilities.
 */
export function DataStructureVisual({ className }: DataStructureVisualProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6',
        'motion-safe:animate-[hero-fade-up_600ms_ease-out]',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-10 top-0 size-40 rounded-full bg-primary/10 blur-3xl dark:bg-primary/16" />
        <div className="absolute -right-8 bottom-0 size-36 rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-400/12" />
      </div>

      <div className="relative space-y-6">
        <div>
          <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
            ILLUSTRATION
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            Arrays, stacks, and linked nodes
          </p>
        </div>

        {/* Array row */}
        <div>
          <p className="mb-2 font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
            Array
          </p>
          <div className="flex gap-1.5">
            {[3, 1, 4, 1, 5].map((value, index) => (
              <div
                key={`arr-${index}`}
                className={cn(
                  'flex size-9 flex-col items-center justify-center rounded-lg border font-mono text-xs font-medium sm:size-10',
                  index === 2
                    ? 'border-primary bg-primary/15 text-foreground ring-2 ring-primary/25 motion-safe:animate-[hero-float_3s_ease-in-out_infinite]'
                    : 'border-border bg-muted/70 text-foreground dark:bg-muted/40',
                )}
              >
                {value}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Stack */}
          <div>
            <p className="mb-2 font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
              Stack
            </p>
            <div className="flex flex-col-reverse gap-1">
              {['A', 'B', 'C'].map((label, index) => (
                <div
                  key={`stk-${label}`}
                  className={cn(
                    'flex h-8 items-center justify-center rounded-md border font-mono text-xs font-medium',
                    index === 2
                      ? 'border-violet-500/50 bg-violet-500/12 text-foreground dark:border-violet-400/50 dark:bg-violet-400/12 motion-safe:animate-[hero-float_3.5s_ease-in-out_infinite]'
                      : 'border-border bg-muted/60 text-muted-foreground dark:bg-muted/30',
                  )}
                >
                  {label}
                </div>
              ))}
            </div>
            <p className="mt-1.5 text-center font-mono text-[0.65rem] text-primary">
              ← top
            </p>
          </div>

          {/* Mini tree / linked nodes */}
          <div>
            <p className="mb-2 font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
              Nodes
            </p>
            <svg
              viewBox="0 0 120 88"
              className="mx-auto h-20 w-full max-w-[140px] text-primary"
              fill="none"
            >
              <path
                d="M60 22 L30 58 M60 22 L90 58"
                className="stroke-border"
                strokeWidth="1.5"
              />
              <circle
                cx="60"
                cy="18"
                r="10"
                className="fill-primary/15 stroke-primary motion-safe:animate-[hero-float_4s_ease-in-out_infinite]"
                strokeWidth="1.5"
              />
              <circle
                cx="30"
                cy="62"
                r="10"
                className="fill-muted stroke-border dark:fill-muted/40"
                strokeWidth="1.5"
              />
              <circle
                cx="90"
                cy="62"
                r="10"
                className="fill-muted stroke-border dark:fill-muted/40"
                strokeWidth="1.5"
              />
              <text
                x="60"
                y="22"
                textAnchor="middle"
                className="fill-foreground"
                fontSize="9"
                fontFamily="ui-monospace, monospace"
              >
                R
              </text>
              <text
                x="30"
                y="66"
                textAnchor="middle"
                className="fill-muted-foreground"
                fontSize="9"
                fontFamily="ui-monospace, monospace"
              >
                L
              </text>
              <text
                x="90"
                y="66"
                textAnchor="middle"
                className="fill-muted-foreground"
                fontSize="9"
                fontFamily="ui-monospace, monospace"
              >
                R
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
