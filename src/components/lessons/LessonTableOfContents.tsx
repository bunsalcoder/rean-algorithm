import { useEffect, useState } from 'react'
import type { LessonTocItem } from '../../data/lessons'
import { cn } from '../../lib/cn'

type LessonTableOfContentsProps = {
  items: LessonTocItem[]
  className?: string
}

export function LessonTableOfContents({
  items,
  className,
}: LessonTableOfContentsProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '')

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => node !== null)

    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        const top = visible[0]
        if (top?.target.id) {
          setActiveId(top.target.id)
        }
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: [0, 0.25, 0.5, 1],
      },
    )

    headings.forEach((heading) => observer.observe(heading))
    return () => observer.disconnect()
  }, [items])

  return (
    <nav
      aria-label="On this page"
      className={cn(
        'rounded-xl border border-border bg-surface p-4 shadow-sm transition-theme',
        className,
      )}
    >
      <p className="text-label text-primary">On this page</p>
      <ul className="mt-3 space-y-1">
        {items.map((item) => {
          const isActive = item.id === activeId

          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  'block rounded-md px-2.5 py-1.5 text-sm transition-theme',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive
                    ? 'bg-primary-muted font-medium text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {item.label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
