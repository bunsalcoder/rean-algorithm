import { cn } from '../../lib/cn'
import { elementStateLegend } from './utils'

type VisualizationLegendProps = {
  className?: string
}

export function VisualizationLegend({ className }: VisualizationLegendProps) {
  return (
    <ul
      className={cn(
        'flex flex-wrap items-center gap-x-3 gap-y-2',
        className,
      )}
      aria-label="Visualization legend"
    >
      {elementStateLegend.map((item) => (
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
