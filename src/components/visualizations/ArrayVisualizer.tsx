import { cn } from '../../lib/cn'
import type { ArrayPointer, ResolvedArrayElement } from './types'
import { elementStateClasses } from './utils'

type ArrayVisualizerProps = {
  elements: readonly ResolvedArrayElement[]
  pointers?: readonly ArrayPointer[]
  showIndices?: boolean
  className?: string
}

function PointerMarkers({
  count,
  pointers,
}: {
  count: number
  pointers: readonly ArrayPointer[]
}) {
  if (count === 0 || pointers.length === 0) {
    return null
  }

  const byIndex = new Map<number, string[]>()
  for (const pointer of pointers) {
    if (pointer.index < 0 || pointer.index >= count) {
      continue
    }
    const existing = byIndex.get(pointer.index) ?? []
    existing.push(pointer.label)
    byIndex.set(pointer.index, existing)
  }

  if (byIndex.size === 0) {
    return null
  }

  return (
    <div
      className="mt-2 grid gap-2"
      style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, index) => {
        const labels = byIndex.get(index)
        return (
          <div
            key={`pointer-${index}`}
            className="flex min-h-5 flex-col items-center justify-start"
          >
            {labels ? (
              <>
                <span className="text-[0.65rem] leading-none text-primary">
                  ▲
                </span>
                <span className="mt-0.5 font-mono text-[0.65rem] font-medium text-primary">
                  {labels.join(', ')}
                </span>
              </>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export function ArrayVisualizer({
  elements,
  pointers = [],
  showIndices = true,
  className,
}: ArrayVisualizerProps) {
  const count = elements.length
  const maxValue = elements.reduce(
    (max, element) => Math.max(max, Math.abs(element.value), 1),
    1,
  )

  if (count === 0) {
    return (
      <div
        className={cn(
          'flex min-h-36 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-4',
          className,
        )}
      >
        <p className="text-body-sm text-muted-foreground">
          No array values to display.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="overflow-x-auto pb-1">
        <div
          className="mx-auto grid w-full min-w-[16rem] gap-2"
          style={{
            gridTemplateColumns: `repeat(${count}, minmax(2.5rem, 1fr))`,
            maxWidth: `${Math.min(count * 4.5, 42)}rem`,
          }}
        >
          {elements.map((element) => {
            const barHeight = Math.round(
              28 + (Math.abs(element.value) / maxValue) * 72,
            )

            return (
              <div
                key={`cell-${element.index}`}
                className="flex min-w-0 flex-col items-center gap-1.5"
              >
                <div
                  className="flex h-28 w-full items-end justify-center"
                  aria-hidden="true"
                >
                  <div
                    className={cn(
                      'w-full max-w-14 rounded-t-md border border-b-0 transition-[height,background-color,border-color,box-shadow,transform] duration-300 ease-out motion-reduce:transition-none',
                      elementStateClasses[element.state],
                      element.state === 'swapped' &&
                        'motion-safe:-translate-y-0.5',
                    )}
                    style={{ height: `${barHeight}%` }}
                  />
                </div>

                <div
                  className={cn(
                    'flex h-11 w-full max-w-14 items-center justify-center rounded-md border font-mono text-sm font-medium transition-[background-color,border-color,box-shadow,transform] duration-300 ease-out motion-reduce:transition-none',
                    elementStateClasses[element.state],
                    element.state === 'swapped' &&
                      'motion-safe:-translate-y-0.5',
                  )}
                  aria-label={`Index ${element.index}, value ${element.value}, state ${element.state}`}
                >
                  {element.value}
                </div>

                {showIndices ? (
                  <span className="font-mono text-[0.65rem] text-muted-foreground">
                    {element.index}
                  </span>
                ) : null}

                {element.label ? (
                  <span className="max-w-full truncate text-center text-[0.65rem] text-muted-foreground">
                    {element.label}
                  </span>
                ) : null}
              </div>
            )
          })}
        </div>

        <div
          className="mx-auto w-full min-w-[16rem]"
          style={{ maxWidth: `${Math.min(count * 4.5, 42)}rem` }}
        >
          <PointerMarkers count={count} pointers={pointers} />
        </div>
      </div>
    </div>
  )
}
