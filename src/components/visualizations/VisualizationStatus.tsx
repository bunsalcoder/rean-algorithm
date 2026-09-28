import { cn } from '../../lib/cn'
import type { VisualizationStep } from './types'
import { getOperationLabel } from './utils'

type VisualizationStatusProps = {
  step: VisualizationStep | undefined
  stepIndex: number
  stepCount: number
  className?: string
}

export function VisualizationStatus({
  step,
  stepIndex,
  stepCount,
  className,
}: VisualizationStatusProps) {
  const displayStep = stepCount === 0 ? 0 : stepIndex + 1
  const operationLabel = getOperationLabel(step?.operation)

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5',
        className,
      )}
      aria-live="polite"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-label text-[0.65rem] tracking-[0.08em]">
            Step {displayStep} of {stepCount}
          </p>
          {operationLabel ? (
            <span className="rounded-md border border-primary/25 bg-primary/10 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-primary">
              {operationLabel}
            </span>
          ) : null}
        </div>
        {step?.meta && Object.keys(step.meta).length > 0 ? (
          <p className="font-mono text-[0.7rem] text-muted-foreground">
            {Object.entries(step.meta)
              .map(([key, value]) => `${key}: ${String(value)}`)
              .join(' · ')}
          </p>
        ) : null}
      </div>

      <h3 className="mt-2 text-base font-medium text-foreground sm:text-lg">
        {step?.title ?? 'No steps available'}
      </h3>

      <p className="mt-2 text-body-sm text-muted-foreground sm:text-body">
        {step?.explanation ??
          'Provide a visualization step sequence to begin.'}
      </p>

      {step?.detail ? (
        <p className="mt-3 rounded-md border border-border-subtle bg-muted/50 px-3 py-2 text-body-sm text-muted-foreground dark:bg-muted/30">
          {step.detail}
        </p>
      ) : null}
    </div>
  )
}
