import { Link } from 'react-router-dom'
import type { Lesson, LessonDifficulty } from '../../data/lessons'
import { cn } from '../../lib/cn'
import { Badge } from '../ui'

type LessonHeaderProps = {
  lesson: Lesson
}

const difficultyVariant: Record<
  LessonDifficulty,
  'primary' | 'default' | 'muted'
> = {
  Beginner: 'primary',
  Intermediate: 'default',
  Advanced: 'muted',
}

function ChevronIcon({ className }: { className?: string }) {
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
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

export function LessonHeader({ lesson }: LessonHeaderProps) {
  return (
    <header className="border-b border-border-subtle pb-8 sm:pb-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-body-sm">
        <Link
          to="/roadmap"
          className="text-muted-foreground transition-theme hover:text-foreground"
        >
          Roadmap
        </Link>
        <ChevronIcon className="size-3.5 text-muted-foreground/60" />
        <Link
          to={lesson.categoryHref}
          className="text-muted-foreground transition-theme hover:text-foreground"
        >
          {lesson.category}
        </Link>
        <ChevronIcon className="size-3.5 text-muted-foreground/60" />
        <span className="font-medium text-foreground" aria-current="page">
          {lesson.title}
        </span>
      </nav>

      <p className="mt-5 text-label text-primary">{lesson.category}</p>

      <h1 className="mt-2 text-foreground">{lesson.title}</h1>

      <p className="mt-3 max-w-2xl text-body text-muted-foreground">
        {lesson.description}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <Badge variant={difficultyVariant[lesson.difficulty]}>
          {lesson.difficulty}
        </Badge>

        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md border border-border',
            'bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground',
            'transition-theme',
          )}
        >
          <ClockIcon className="size-3.5" />
          {lesson.estimatedTime}
        </span>

        {lesson.tags.map((tag) => (
          <Badge key={tag} variant="muted">
            {tag}
          </Badge>
        ))}
      </div>
    </header>
  )
}
