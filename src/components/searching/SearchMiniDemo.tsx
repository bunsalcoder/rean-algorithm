import { useMemo, useState, type FormEvent } from 'react'
import {
  BINARY_DEMO_ARRAY,
  BINARY_DEMO_TARGET,
  LINEAR_DEMO_ARRAY,
  LINEAR_DEMO_TARGET,
} from '../../data/algorithms/searching'
import { buildBinarySearchSteps } from '../../lib/binarySearch'
import { cn } from '../../lib/cn'
import { buildLinearSearchSteps } from '../../lib/linearSearch'
import { Button } from '../ui'
import { AlgorithmVisualizer } from '../visualizations'

type DemoMode = 'linear-search' | 'binary-search'

const MODE_OPTIONS: { id: DemoMode; label: string; hint: string }[] = [
  {
    id: 'linear-search',
    label: 'Linear Search',
    hint: 'Works on unsorted data',
  },
  {
    id: 'binary-search',
    label: 'Binary Search',
    hint: 'Requires a sorted array',
  },
]

type SearchMiniDemoProps = {
  className?: string
}

export function SearchMiniDemo({ className }: SearchMiniDemoProps) {
  const [mode, setMode] = useState<DemoMode>('linear-search')
  const [targetInput, setTargetInput] = useState(String(LINEAR_DEMO_TARGET))
  const [target, setTarget] = useState(LINEAR_DEMO_TARGET)
  const [inputError, setInputError] = useState<string | null>(null)

  const array =
    mode === 'linear-search' ? LINEAR_DEMO_ARRAY : BINARY_DEMO_ARRAY

  const steps = useMemo(
    () =>
      mode === 'linear-search'
        ? buildLinearSearchSteps(array, target)
        : buildBinarySearchSteps(array, target),
    [array, mode, target],
  )

  function applyTarget(rawValue: string) {
    const trimmed = rawValue.trim()

    if (trimmed === '') {
      setInputError('Enter a whole number to search for.')
      return
    }

    const parsed = Number(trimmed)

    if (!Number.isInteger(parsed)) {
      setInputError('Please enter a valid whole number.')
      return
    }

    setInputError(null)
    setTarget(parsed)
    setTargetInput(String(parsed))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    applyTarget(targetInput)
  }

  function handleModeChange(next: DemoMode) {
    setMode(next)
    const nextTarget =
      next === 'linear-search' ? LINEAR_DEMO_TARGET : BINARY_DEMO_TARGET
    setTarget(nextTarget)
    setTargetInput(String(nextTarget))
    setInputError(null)
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div
        role="tablist"
        aria-label="Search algorithm preview"
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
              id={`search-demo-tab-${option.id}`}
              onClick={() => handleModeChange(option.id)}
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

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1" htmlFor="search-hub-target">
            <span className="text-label text-[0.65rem] tracking-[0.08em]">
              Target
            </span>
            <input
              id="search-hub-target"
              type="text"
              inputMode="numeric"
              value={targetInput}
              onChange={(event) => {
                setTargetInput(event.target.value)
                if (inputError) {
                  setInputError(null)
                }
              }}
              className={cn(
                'mt-1.5 h-10 w-full rounded-md border border-border bg-surface px-3',
                'font-mono text-sm text-foreground shadow-sm transition-theme',
                'placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
              placeholder="e.g. 42"
              aria-invalid={inputError ? true : undefined}
              aria-describedby={
                inputError ? 'search-hub-target-error' : 'search-hub-array-hint'
              }
            />
          </label>

          <Button type="submit" className="w-full sm:w-auto">
            Apply target
          </Button>
        </div>

        <p
          id="search-hub-array-hint"
          className="mt-3 text-body-sm text-muted-foreground"
        >
          {mode === 'binary-search' ? (
            <>
              Sorted example array:{' '}
              <span className="font-mono text-foreground">
                [{array.join(', ')}]
              </span>
              . Binary Search requires sorted data.
            </>
          ) : (
            <>
              Unsorted example array:{' '}
              <span className="font-mono text-foreground">
                [{array.join(', ')}]
              </span>
              . Linear Search does not require sorting.
            </>
          )}
        </p>
      </form>

      {inputError ? (
        <p
          id="search-hub-target-error"
          className="text-sm text-rose-600 dark:text-rose-300"
          role="alert"
        >
          {inputError}
        </p>
      ) : null}

      <div
        role="tabpanel"
        aria-labelledby={`search-demo-tab-${mode}`}
        className="transition-theme"
      >
        <AlgorithmVisualizer
          key={`search-hub-${mode}-${array.join(',')}-${target}`}
          title={
            mode === 'linear-search'
              ? 'Linear Search preview'
              : 'Binary Search preview'
          }
          category="Searching"
          array={array}
          steps={steps}
          showFullscreen={false}
        />
      </div>

      <p className="text-body-sm text-muted-foreground">
        This is a compact preview. Open the full lesson for a complete
        walkthrough with explanations and practice.
      </p>
    </div>
  )
}
