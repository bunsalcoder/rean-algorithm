import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type LessonSectionProps = {
  id: string
  children: ReactNode
  className?: string
}

export function LessonSection({ id, children, className }: LessonSectionProps) {
  return (
    <section
      id={id}
      className={cn('scroll-mt-24', className)}
      aria-labelledby={`${id}-heading`}
    >
      {children}
    </section>
  )
}

type LessonSectionHeadingProps = {
  id: string
  eyebrow?: string
  title: string
  description?: string
  className?: string
}

export function LessonSectionHeading({
  id,
  eyebrow,
  title,
  description,
  className,
}: LessonSectionHeadingProps) {
  return (
    <div className={cn('mb-5 sm:mb-6', className)}>
      {eyebrow ? (
        <p className="text-label text-primary">{eyebrow}</p>
      ) : null}
      <h2
        id={`${id}-heading`}
        className={cn('text-xl font-medium text-foreground sm:text-2xl', eyebrow && 'mt-2')}
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground sm:text-body">
          {description}
        </p>
      ) : null}
    </div>
  )
}
