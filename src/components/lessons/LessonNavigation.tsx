import { Link } from 'react-router-dom'
import type { Lesson } from '../../data/lessons'
import { cn } from '../../lib/cn'

type LessonNavigationProps = {
  lesson: Lesson
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

function NavCard({
  href,
  label,
  title,
  align,
}: {
  href: string
  label: string
  title: string
  align: 'start' | 'end'
}) {
  return (
    <Link
      to={href}
      className={cn(
        'group flex flex-col gap-1 rounded-xl border border-border bg-surface p-4 shadow-sm',
        'transition-all duration-300 ease-out',
        'hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        align === 'end' && 'items-end text-right',
      )}
    >
      <span className="inline-flex items-center gap-1.5 text-label text-primary">
        {align === 'start' ? (
          <ArrowLeftIcon className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
        ) : null}
        {label}
        {align === 'end' ? (
          <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        ) : null}
      </span>
      <span className="text-sm font-medium text-foreground sm:text-base">
        {title}
      </span>
    </Link>
  )
}

export function LessonNavigation({ lesson }: LessonNavigationProps) {
  return (
    <nav
      aria-label="Lesson navigation"
      className="border-t border-border-subtle pt-8 sm:pt-10"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {lesson.previousLesson ? (
          <NavCard
            href={lesson.previousLesson.href}
            label="Previous Lesson"
            title={lesson.previousLesson.title}
            align="start"
          />
        ) : (
          <div
            className={cn(
              'rounded-xl border border-dashed border-border bg-muted/40 p-4',
              'text-body-sm text-muted-foreground dark:bg-muted/20',
            )}
          >
            This is the first lesson in the series.
          </div>
        )}

        {lesson.nextLesson ? (
          <NavCard
            href={lesson.nextLesson.href}
            label="Next Lesson"
            title={lesson.nextLesson.title}
            align="end"
          />
        ) : (
          <div
            className={cn(
              'rounded-xl border border-dashed border-border bg-muted/40 p-4 text-right',
              'text-body-sm text-muted-foreground dark:bg-muted/20',
            )}
          >
            More lessons coming soon.
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-center">
        <Link
          to={lesson.categoryHref}
          className={cn(
            'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium',
            'text-muted-foreground transition-theme',
            'hover:bg-muted hover:text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          Back to {lesson.category}
        </Link>
      </div>
    </nav>
  )
}
