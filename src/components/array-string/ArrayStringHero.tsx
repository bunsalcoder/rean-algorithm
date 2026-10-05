import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'

type ArrayStringHeroProps = {
  className?: string
}

const HERO_VALUES = [1, 2, 3, 4, 6, 8, 9] as const
const LEFT_INDEX = 0
const RIGHT_INDEX = 6

export function ArrayStringHero({ className }: ArrayStringHeroProps) {
  return (
    <header
      className={cn(
        'grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-10',
        className,
      )}
    >
      <div className="min-w-0 max-w-2xl">
        <p className="text-label text-primary">ARRAYS • STRINGS • PATTERNS</p>
        <h1 className="mt-2 text-foreground">Master Arrays &amp; Strings</h1>
        <p className="mt-3 text-body text-muted-foreground">
          Learn the techniques that make working with arrays and strings faster,
          clearer, and more efficient.
        </p>
        <p className="mt-3 text-body-sm text-muted-foreground sm:text-body">
          Arrays and strings are among the most common structures used in
          programming problems. Learn the patterns and techniques that help you
          search, transform, compare, and reason about them efficiently.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            to="/learn/two-pointers"
            className={cn(
              'inline-flex h-11 w-full items-center justify-center gap-2 rounded-md px-5 text-base font-medium',
              'bg-primary text-primary-foreground shadow-sm transition-theme hover:bg-primary-hover',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              'sm:w-auto',
            )}
          >
            Start with Two Pointers →
          </Link>
        </div>
      </div>

      <div
        aria-hidden="true"
        className={cn(
          'relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6',
          'motion-safe:animate-[hero-fade-up_600ms_ease-out]',
        )}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-10 top-0 size-40 rounded-full bg-primary/10 blur-3xl dark:bg-primary/16" />
          <div className="absolute -right-8 bottom-0 size-36 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-400/12" />
        </div>

        <div className="relative">
          <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
            ILLUSTRATION
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            Indices, pointers, and a highlighted range
          </p>

          <div className="mt-5 overflow-x-auto pb-1">
            <div className="mx-auto flex w-max flex-col gap-2">
              <div className="flex gap-1.5 sm:gap-2">
                {HERO_VALUES.map((value, index) => {
                  const isLeft = index === LEFT_INDEX
                  const isRight = index === RIGHT_INDEX
                  const inRange = index >= LEFT_INDEX && index <= RIGHT_INDEX
                  const isEndpoint = isLeft || isRight

                  let cellClass =
                    'border-border bg-muted/70 text-foreground dark:bg-muted/40'
                  if (isEndpoint) {
                    cellClass =
                      'border-primary bg-primary/15 text-foreground ring-2 ring-primary/30'
                  } else if (inRange) {
                    cellClass =
                      'border-sky-500/50 bg-sky-500/12 text-foreground dark:border-sky-400/50 dark:bg-sky-400/12'
                  }

                  return (
                    <div key={`value-${index}`} className="flex w-10 flex-col items-center gap-1.5 sm:w-11">
                      <span
                        className={cn(
                          'flex size-10 items-center justify-center rounded-lg border font-mono text-sm font-medium sm:size-11',
                          'transition-theme',
                          cellClass,
                          isEndpoint &&
                            'motion-safe:animate-[hero-float_3s_ease-in-out_infinite]',
                        )}
                      >
                        {value}
                      </span>
                      <span className="font-mono text-[0.65rem] text-muted-foreground">
                        {index}
                      </span>
                      <span
                        className={cn(
                          'h-5 font-mono text-[0.65rem] font-medium',
                          isLeft || isRight ? 'text-primary' : 'text-transparent',
                        )}
                      >
                        {isLeft ? 'L' : null}
                        {isRight ? 'R' : null}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <p className="mt-4 text-center font-mono text-sm text-foreground">
            1 + 9 = 10
          </p>
          <p className="mt-1 text-center text-body-sm text-muted-foreground">
            left and right meet a valid pair on sorted data
          </p>
        </div>
      </div>
    </header>
  )
}
