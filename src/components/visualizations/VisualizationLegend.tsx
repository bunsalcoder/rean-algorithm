import { cn } from '../../lib/cn'
import type { ElementVisualState } from './types'
import { elementStateLegend } from './utils'

type VisualizationLegendProps = {
  className?: string
  /**
   * When provided, only these states appear in the legend.
   * Useful so search lessons do not show unused sorting states.
   */
  states?: readonly Exclude<ElementVisualState, 'default'>[]
}

export function VisualizationLegend({
  className,
  states,
}: VisualizationLegendProps) {
  const items =
    states && states.length > 0
      ? elementStateLegend.filter((item) => states.includes(item.state))
      : elementStateLegend

  if (items.length === 0) {
    return null
  }

  return (
    <ul
      className={cn(
        'flex flex-wrap items-center gap-x-3 gap-y-2',
        className,
      )}
      aria-label="Visualization legend"
    >
      {items.map((item) => (
        <li key={item.state} className="flex items-center gap-1.5">
          <span
            className={cn(
              'inline-block size-3 shrink-0 rounded-sm border',
              item.className,
            )}
            aria-hidden="true"
          />
          <span className="text-body-sm text-muted-foreground">
            {item.label}
          </span>
        </li>
      ))}
    </ul>
  )
}
