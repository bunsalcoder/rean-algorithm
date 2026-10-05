import { useMemo, useState } from 'react'
import {
  SLIDING_WINDOW_DEFAULT_ARRAY,
  SLIDING_WINDOW_DEFAULT_SIZE,
} from '../../algorithms/array-string/slidingWindow'
import { buildSlidingWindowSteps } from '../../algorithms/array-string/slidingWindowSteps'
import {
  TWO_POINTERS_DEFAULT_ARRAY,
  TWO_POINTERS_DEFAULT_TARGET,
} from '../../algorithms/array-string/twoPointers'
import { buildTwoPointersSteps } from '../../algorithms/array-string/twoPointersSteps'
import { cn } from '../../lib/cn'
import { AlgorithmVisualizer } from '../visualizations'

type DemoMode = 'two-pointers' | 'sliding-window'

const MODE_OPTIONS: { id: DemoMode; label: string; hint: string }[] = [
  {
    id: 'two-pointers',
    label: 'Two Pointers',
    hint: 'Left/right pair sum on sorted data',
  },
  {
    id: 'sliding-window',
    label: 'Sliding Window',
    hint: 'Fixed window — sorting not required',
  },
]

type ArrayStringMiniDemoProps = {
  className?: string
}

export function ArrayStringMiniDemo({ className }: ArrayStringMiniDemoProps) {
  const [mode, setMode] = useState<DemoMode>('two-pointers')

  const array =
    mode === 'two-pointers'
      ? TWO_POINTERS_DEFAULT_ARRAY
      : SLIDING_WINDOW_DEFAULT_ARRAY

  const steps = useMemo(() => {
    if (mode === 'two-pointers') {
      return buildTwoPointersSteps(
        TWO_POINTERS_DEFAULT_ARRAY,
        TWO_POINTERS_DEFAULT_TARGET,
      )
    }
    return buildSlidingWindowSteps(
      SLIDING_WINDOW_DEFAULT_ARRAY,
      SLIDING_WINDOW_DEFAULT_SIZE,
    )
  }, [mode])

  return (
    <div className={cn('space-y-4', className)}>
      <div
        role="tablist"
        aria-label="Array and string algorithm preview"
        className="flex flex-col gap-2 sm:flex-row"
      >
        {MODE_OPTIONS.map((option) => {
          const selected = mode === option.id
          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={selected}
              id={`array-string-demo-tab-${option.id}`}
              onClick={() => setMode(option.id)}
              className={cn(
                'flex flex-1 flex-col rounded-xl border px-4 py-3 text-left transition-theme',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                selected
                  ? 'border-primary/40 bg-primary-muted shadow-sm'
                  : 'border-border bg-surface hover:border-primary/30',
              )}
            >
              <span
                className={cn(
                  'text-sm font-medium',
                  selected ? 'text-accent-foreground' : 'text-foreground',
                )}
              >
                {option.label}
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                {option.hint}
              </span>
            </button>
          )
        })}
      </div>

      <div className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20">
        {mode === 'two-pointers' ? (
          <p className="text-body-sm text-muted-foreground">
            Sorted example array:{' '}
            <span className="font-mono text-foreground">
              [{array.join(', ')}]
            </span>
            {' · '}
            Target:{' '}
            <span className="font-mono text-foreground">
              {TWO_POINTERS_DEFAULT_TARGET}
            </span>
            . This left/right approach requires sorted data.
          </p>
        ) : (
          <p className="text-body-sm text-muted-foreground">
            Example array:{' '}
            <span className="font-mono text-foreground">
              [{array.join(', ')}]
            </span>
            {' · '}
            Window size:{' '}
            <span className="font-mono text-foreground">
              {SLIDING_WINDOW_DEFAULT_SIZE}
            </span>
            . Sliding Window works on contiguous ranges and does not require
            sorting.
          </p>
        )}
      </div>

      <div
        role="tabpanel"
        aria-labelledby={`array-string-demo-tab-${mode}`}
        className="transition-theme"
      >
        <AlgorithmVisualizer
          key={`array-string-hub-${mode}`}
          title={
            mode === 'two-pointers'
              ? 'Two Pointers preview'
              : 'Sliding Window preview'
          }
          category="Array & String"
          array={array}
          steps={steps}
          showFullscreen={false}
        />
      </div>

      <p className="text-body-sm text-muted-foreground">
        This is a compact preview. Open the full lesson for controls, window
        size changes, and a complete walkthrough.
      </p>
    </div>
  )
}
