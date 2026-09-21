import type { LearningHighlight } from '../../data/learningHighlights'
import { cn } from '../../lib/cn'
import { HighlightIcon } from './HighlightIcon'
import { highlightAccentStyles } from './highlightAccentStyles'

type HighlightCardProps = {
  highlight: LearningHighlight
  className?: string
}

export function HighlightCard({ highlight, className }: HighlightCardProps) {
  const accent = highlightAccentStyles[highlight.accent]

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-xl',
        'border border-border bg-surface p-5 shadow-sm sm:p-6',
        'transition-all duration-300 ease-out',
        'hover:-translate-y-1 hover:shadow-md',
        accent.hoverBorder,
        accent.hoverShadow,
        className,
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute -right-8 -top-8 size-28 rounded-full blur-2xl',
          'bg-transparent opacity-0 transition-opacity duration-300',
          'group-hover:opacity-100',
          accent.glow,
        )}
      />

      <div
        className={cn(
          'relative flex size-11 items-center justify-center rounded-lg',
          'transition-transform duration-300 ease-out',
          'group-hover:scale-110',
          accent.iconWrap,
        )}
      >
        <HighlightIcon
          name={highlight.icon}
          className={cn('size-5', accent.icon)}
        />
      </div>

      <div className="relative mt-4 flex flex-1 flex-col">
        <h3 className="text-base font-medium text-foreground sm:text-lg">
          {highlight.title}
        </h3>
        <p className="mt-2 text-body-sm text-muted-foreground">
          {highlight.description}
        </p>
      </div>
    </article>
  )
}
