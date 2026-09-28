import type { ReactNode } from 'react'
import { Badge, Button } from '../ui'
import { cn } from '../../lib/cn'

type VisualizerToolbarProps = {
  title?: string
  category?: string
  onReset?: () => void
  onToggleFullscreen?: () => void
  isFullscreen?: boolean
  inputSlot?: ReactNode
  className?: string
}

function FullscreenIcon({ expand }: { expand: boolean }) {
  const path = expand
    ? 'M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3'
    : 'M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3'

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
    >
      <path d={path} />
    </svg>
  )
}

export function VisualizerToolbar({
  title,
  category,
  onReset,
  onToggleFullscreen,
  isFullscreen = false,
  inputSlot,
  className,
}: VisualizerToolbarProps) {
  const hasHeader = Boolean(title || category || onReset || onToggleFullscreen)

  if (!hasHeader && !inputSlot) {
    return null
  }

  return (
    <div className={cn('space-y-3', className)}>
      {hasHeader ? (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {category ? (
              <Badge variant="primary" className="mb-2">
                {category}
              </Badge>
            ) : null}
            {title ? (
              <h2 className="text-lg font-medium text-foreground sm:text-xl">
                {title}
              </h2>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {onReset ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onReset}
              >
                Reset
              </Button>
            ) : null}
            {onToggleFullscreen ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onToggleFullscreen}
                aria-label={
                  isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'
                }
              >
                <FullscreenIcon expand={!isFullscreen} />
                {isFullscreen ? 'Exit' : 'Fullscreen'}
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {inputSlot}
    </div>
  )
}
