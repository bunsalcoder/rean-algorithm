import { useId, useMemo, useState, type FormEvent } from 'react'
import { Button } from '../ui'
import { cn } from '../../lib/cn'
import { ArrayVisualizer } from './ArrayVisualizer'
import type {
  ArrayPreset,
  VisualizationStep,
  VisualizerInputOptions,
} from './types'
import { useVisualizerPlayback } from './useVisualizerPlayback'
import {
  DEFAULT_ARRAY_MAX_SIZE,
  DEFAULT_ARRAY_MIN_SIZE,
  DEFAULT_RANDOM_MAX,
  DEFAULT_RANDOM_MIN,
  collectUsedElementStates,
  formatArray,
  generateRandomArray,
  resolveArrayElements,
} from './utils'
import { VisualizationCanvas } from './VisualizationCanvas'
import { VisualizationLegend } from './VisualizationLegend'
import { VisualizationStatus } from './VisualizationStatus'
import { VisualizerControls } from './VisualizerControls'
import { VisualizerToolbar } from './VisualizerToolbar'

type AlgorithmVisualizerProps = {
  title?: string
  category?: string
  /** Shared input array used when a step omits its own array. */
  array: readonly number[]
  /** Algorithm-provided visualization sequence. */
  steps: readonly VisualizationStep[]
  /** Called when the learner requests a new input array. */
  onArrayChange?: (next: number[]) => void
  inputOptions?: VisualizerInputOptions
  className?: string
  showLegend?: boolean
  showFullscreen?: boolean
}

type ArrayInputPanelProps = {
  array: readonly number[]
  options: VisualizerInputOptions
  onArrayChange: (next: number[]) => void
}

function ArrayInputPanel({
  array,
  options,
  onArrayChange,
}: ArrayInputPanelProps) {
  const sizeId = useId()
  const minSize = options.minSize ?? DEFAULT_ARRAY_MIN_SIZE
  const maxSize = options.maxSize ?? DEFAULT_ARRAY_MAX_SIZE
  const allowRandom = options.allowRandom ?? true
  const allowSizeAdjust = options.allowSizeAdjust ?? true
  const sortAscending = options.sortAscending ?? false
  const presets = options.presets ?? []
  const [size, setSize] = useState(() =>
    Math.min(Math.max(array.length, minSize), maxSize),
  )

  function finalizeArray(values: number[]): number[] {
    if (!sortAscending) {
      return values
    }
    return [...values].sort((a, b) => a - b)
  }

  function handleRandom() {
    const next = generateRandomArray(
      size,
      options.randomMin ?? DEFAULT_RANDOM_MIN,
      options.randomMax ?? DEFAULT_RANDOM_MAX,
    )
    onArrayChange(finalizeArray(next))
  }

  function handlePreset(preset: ArrayPreset) {
    setSize(
      Math.min(Math.max(preset.values.length, minSize), maxSize),
    )
    onArrayChange(finalizeArray([...preset.values]))
  }

  function handleSizeSubmit(event: FormEvent) {
    event.preventDefault()
    const nextSize = Math.min(Math.max(size, minSize), maxSize)
    setSize(nextSize)
    onArrayChange(
      finalizeArray(
        generateRandomArray(
          nextSize,
          options.randomMin ?? DEFAULT_RANDOM_MIN,
          options.randomMax ?? DEFAULT_RANDOM_MAX,
        ),
      ),
    )
  }

  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/20">
      <p className="text-label text-[0.65rem] tracking-[0.08em]">
        Input array
      </p>
      <p className="mt-1.5 font-mono text-sm text-foreground">
        {formatArray(array)}
      </p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {allowRandom ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleRandom}
          >
            {sortAscending ? 'Random sorted array' : 'Random array'}
          </Button>
        ) : null}

        {presets.map((preset) => (
          <Button
            key={preset.id}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePreset(preset)}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {allowSizeAdjust ? (
        <form
          onSubmit={handleSizeSubmit}
          className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end"
        >
          <label htmlFor={sizeId} className="min-w-0 flex-1">
            <span className="text-label text-[0.65rem] tracking-[0.08em]">
              Array size ({minSize}–{maxSize})
            </span>
            <input
              id={sizeId}
              type="number"
              min={minSize}
              max={maxSize}
              value={size}
              onChange={(event) => {
                const next = Number(event.target.value)
                if (Number.isFinite(next)) {
                  setSize(next)
                }
              }}
              className={cn(
                'mt-1.5 h-9 w-full rounded-md border border-border bg-surface px-3',
                'font-mono text-sm text-foreground shadow-sm transition-theme',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'sm:max-w-[8rem]',
              )}
            />
          </label>
          <Button type="submit" size="sm" className="sm:mb-0.5">
            Apply size
          </Button>
        </form>
      ) : null}
    </div>
  )
}

export function AlgorithmVisualizer({
  title,
  category,
  array,
  steps,
  onArrayChange,
  inputOptions,
  className,
  showLegend = true,
  showFullscreen = true,
}: AlgorithmVisualizerProps) {
  const resetKey = useMemo(
    () => `${array.join(',')}:${steps.map((step) => step.id).join('|')}`,
    [array, steps],
  )

  const playback = useVisualizerPlayback(steps.length, { resetKey })
  const step = steps[playback.stepIndex]
  const elements = resolveArrayElements(array, step)
  const legendStates = useMemo(() => collectUsedElementStates(steps), [steps])

  const [isFullscreen, setIsFullscreen] = useState(false)

  function handleToggleFullscreen() {
    setIsFullscreen((current) => !current)
  }

  return (
    <div
      className={cn(
        'space-y-4',
        isFullscreen &&
          'fixed inset-0 z-50 overflow-y-auto bg-background p-4 sm:p-6',
        className,
      )}
    >
      <VisualizerToolbar
        title={title}
        category={category}
        onReset={playback.reset}
        onToggleFullscreen={
          showFullscreen ? handleToggleFullscreen : undefined
        }
        isFullscreen={isFullscreen}
        inputSlot={
          onArrayChange && inputOptions ? (
            <ArrayInputPanel
              array={array}
              options={inputOptions}
              onArrayChange={onArrayChange}
            />
          ) : null
        }
      />

      <VisualizationCanvas
        label={title ? `${title} visualization` : 'Algorithm visualization'}
      >
        <ArrayVisualizer
          elements={elements}
          pointers={step?.pointers}
          showIndices
          animationKey={step?.id}
        />
        {showLegend ? (
          <VisualizationLegend className="mt-4" states={legendStates} />
        ) : null}
      </VisualizationCanvas>

      <VisualizerControls playback={playback} />

      <VisualizationStatus
        step={step}
        stepIndex={playback.stepIndex}
        stepCount={playback.stepCount}
      />
    </div>
  )
}
