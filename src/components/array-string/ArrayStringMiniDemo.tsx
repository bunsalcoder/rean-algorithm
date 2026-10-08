import { useMemo, useState } from 'react'
import { FREQUENCY_COUNTING_DEFAULT_ARRAY } from '../../algorithms/array-string/frequencyCounting'
import { buildFrequencyCountingSteps } from '../../algorithms/array-string/frequencyCountingSteps'
import {
  PREFIX_SUM_DEFAULT_ARRAY,
  PREFIX_SUM_DEFAULT_LEFT,
  PREFIX_SUM_DEFAULT_RIGHT,
} from '../../algorithms/array-string/prefixSum'
import { buildPrefixSumSteps } from '../../algorithms/array-string/prefixSumSteps'
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
import {
  AlgorithmVisualizer,
  FrequencyCountingPanels,
  PrefixSumPanels,
} from '../visualizations'

type DemoMode =
  | 'two-pointers'
  | 'sliding-window'
  | 'prefix-sum'
  | 'frequency-counting'

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
  {
    id: 'prefix-sum',
    label: 'Prefix Sum',
    hint: 'Preprocess once — O(1) range sums',
  },
  {
    id: 'frequency-counting',
    label: 'Frequency Counting',
    hint: 'Build a map of value → count',
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
      : mode === 'sliding-window'
        ? SLIDING_WINDOW_DEFAULT_ARRAY
        : mode === 'prefix-sum'
          ? PREFIX_SUM_DEFAULT_ARRAY
          : FREQUENCY_COUNTING_DEFAULT_ARRAY

  const steps = useMemo(() => {
    if (mode === 'two-pointers') {
      return buildTwoPointersSteps(
        TWO_POINTERS_DEFAULT_ARRAY,
        TWO_POINTERS_DEFAULT_TARGET,
      )
    }
    if (mode === 'sliding-window') {
      return buildSlidingWindowSteps(
        SLIDING_WINDOW_DEFAULT_ARRAY,
        SLIDING_WINDOW_DEFAULT_SIZE,
      )
    }
    if (mode === 'prefix-sum') {
      return buildPrefixSumSteps(
        PREFIX_SUM_DEFAULT_ARRAY,
        PREFIX_SUM_DEFAULT_LEFT,
        PREFIX_SUM_DEFAULT_RIGHT,
      )
    }
    return buildFrequencyCountingSteps(FREQUENCY_COUNTING_DEFAULT_ARRAY)
  }, [mode])

  const title =
    mode === 'two-pointers'
      ? 'Two Pointers preview'
      : mode === 'sliding-window'
        ? 'Sliding Window preview'
        : mode === 'prefix-sum'
          ? 'Prefix Sum preview'
          : 'Frequency Counting preview'

  return (
    <div className={cn('space-y-4', className)}>
      <div
        role="tablist"
        aria-label="Array and string algorithm preview"
        className="grid gap-2 sm:grid-cols-2"
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
                'flex flex-col rounded-xl border px-4 py-3 text-left transition-theme',
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
        ) : mode === 'sliding-window' ? (
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
        ) : mode === 'prefix-sum' ? (
          <p className="text-body-sm text-muted-foreground">
            Example array:{' '}
            <span className="font-mono text-foreground">
              [{array.join(', ')}]
            </span>
            {' · '}
            Range:{' '}
            <span className="font-mono text-foreground">
              [{PREFIX_SUM_DEFAULT_LEFT}, {PREFIX_SUM_DEFAULT_RIGHT}]
            </span>
            . Prefix Sum preprocesses cumulative totals for O(1) range queries.
          </p>
        ) : (
          <p className="text-body-sm text-muted-foreground">
            Example array:{' '}
            <span className="font-mono text-foreground">
              [{array.join(', ')}]
            </span>
            . Frequency Counting builds a map of value → count in one pass.
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
          title={title}
          category="Array & String"
          array={array}
          steps={steps}
          showFullscreen={false}
          canvasAddon={
            mode === 'prefix-sum'
              ? (step) => (
                  <PrefixSumPanels
                    original={PREFIX_SUM_DEFAULT_ARRAY}
                    step={step}
                  />
                )
              : mode === 'frequency-counting'
                ? (step) => (
                    <FrequencyCountingPanels
                      original={FREQUENCY_COUNTING_DEFAULT_ARRAY}
                      step={step}
                    />
                  )
                : undefined
          }
        />
      </div>

      <p className="text-body-sm text-muted-foreground">
        This is a compact preview. Open the full lesson for controls, input
        changes, and a complete walkthrough.
      </p>
    </div>
  )
}
