import { Button } from '../ui'
import { cn } from '../../lib/cn'
import type { PlaybackSpeed } from './types'
import { PLAYBACK_SPEEDS } from './types'
import type { VisualizerPlayback } from './useVisualizerPlayback'

type ControlIconName = 'reset' | 'prev' | 'next' | 'play' | 'pause'

function ControlIcon({
  name,
  className,
}: {
  name: ControlIconName
  className?: string
}) {
  const paths: Record<ControlIconName, string> = {
    reset: 'M3.5 12a8.5 8.5 0 1 0 2.1-5.6M3.5 4.5v4h4',
    prev: 'M14.5 6.5 9 12l5.5 5.5M8 6.5v11',
    next: 'M9.5 6.5 15 12l-5.5 5.5M16 6.5v11',
    play: 'M8 5.5v13l11-6.5-11-6.5Z',
    pause: 'M8 5.5h3.5v13H8zm6.5 0H18v13h-3.5z',
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={paths[name]} />
    </svg>
  )
}

type VisualizerControlsProps = {
  playback: VisualizerPlayback
  className?: string
}

export function VisualizerControls({
  playback,
  className,
}: VisualizerControlsProps) {
  const {
    isPlaying,
    isFirst,
    isLast,
    stepIndex,
    stepCount,
    speed,
    togglePlay,
    previous,
    next,
    reset,
    setSpeed,
  } = playback

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 shadow-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-4',
        className,
      )}
    >
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={reset}
          disabled={isFirst && !isPlaying}
          aria-label="Reset visualization"
        >
          <ControlIcon name="reset" className="size-4" />
          Reset
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={previous}
          disabled={isFirst}
          aria-label="Previous step"
        >
          <ControlIcon name="prev" className="size-4" />
          Previous
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={next}
          disabled={isLast}
          aria-label="Next step"
        >
          <ControlIcon name="next" className="size-4" />
          Next
        </Button>
        <Button
          type="button"
          variant={isPlaying ? 'outline' : 'primary'}
          size="sm"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : isLast ? 'Replay' : 'Play'}
        >
          <ControlIcon
            name={isPlaying ? 'pause' : 'play'}
            className="size-4"
          />
          {isPlaying ? 'Pause' : isLast ? 'Replay' : 'Play'}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <p
          className="font-mono text-body-sm text-muted-foreground"
          aria-live="polite"
        >
          {stepCount === 0 ? '0 / 0' : `${stepIndex + 1} / ${stepCount}`}
        </p>

        <label className="flex items-center gap-2 text-body-sm text-muted-foreground">
          <span className="whitespace-nowrap">Speed</span>
          <select
            value={speed}
            onChange={(event) =>
              setSpeed(Number(event.target.value) as PlaybackSpeed)
            }
            className={cn(
              'h-8 rounded-md border border-border bg-surface px-2',
              'font-mono text-sm text-foreground shadow-sm transition-theme',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
            aria-label="Playback speed"
          >
            {PLAYBACK_SPEEDS.map((option) => (
              <option key={option} value={option}>
                {option}x
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
