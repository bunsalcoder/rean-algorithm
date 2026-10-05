import { Link } from 'react-router-dom'
import type { ArrayStringLearningOrderItem } from '../../data/algorithms/array-string'
import { cn } from '../../lib/cn'
import { Badge } from '../ui'

type ArrayStringLearningPathProps = {
  items: ArrayStringLearningOrderItem[]
  className?: string
}

export function ArrayStringLearningPath({
  items,
  className,
}: ArrayStringLearningPathProps) {
  return (
    <ol className={cn('space-y-2', className)}>
      {items.map((item, index) => {
        const content = (
          <>
            <span
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-md font-mono text-xs font-medium',
                item.available
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <span
              className={cn(
                'min-w-0 flex-1 text-sm font-medium',
                item.available ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {item.title}
            </span>
            {item.available ? (
              <span className="text-sm font-medium text-primary">Open →</span>
            ) : (
              <Badge variant="muted" className="text-[0.65rem]">
                Coming Soon
              </Badge>
            )}
          </>
        )

        if (!item.available || !item.href) {
          return (
            <li key={item.id}>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 opacity-80">
                {content}
              </div>
            </li>
          )
        }

        return (
          <li key={item.id}>
            <Link
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl border border-border bg-surface p-3 shadow-sm',
                'transition-theme hover:border-primary/30 hover:shadow-md',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              )}
            >
              {content}
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
