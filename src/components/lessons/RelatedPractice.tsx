import { Link } from 'react-router-dom'
import { getPracticeProblemByLessonSlug } from '../../data/practice'
import { cn } from '../../lib/cn'
import { Badge, Card } from '../ui'
import { LessonSection, LessonSectionHeading } from './LessonSection'

type RelatedPracticeProps = {
  lessonSlug: string
}

export function RelatedPractice({ lessonSlug }: RelatedPracticeProps) {
  const problem = getPracticeProblemByLessonSlug(lessonSlug)

  return (
    <LessonSection id="related-practice">
      <LessonSectionHeading
        id="related-practice"
        eyebrow="PRACTICE"
        title="Related Practice"
        description={
          problem
            ? 'Apply this lesson with a focused practice problem.'
            : 'Hands-on problems tied to this lesson will appear here when available.'
        }
      />

      {problem ? (
        <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary">{problem.difficulty}</Badge>
              <Badge variant="muted">{problem.category}</Badge>
            </div>
            <p className="text-base font-medium text-foreground">
              {problem.title}
            </p>
            <p className="text-body-sm text-muted-foreground line-clamp-2">
              {problem.description}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              to={`/practice/${problem.slug}`}
              className={cn(
                'inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium',
                'bg-primary text-primary-foreground shadow-sm transition-theme',
                'hover:bg-primary-hover',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            >
              Practice
            </Link>
            <Link
              to="/practice"
              className={cn(
                'inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium',
                'border border-border bg-surface text-foreground shadow-sm transition-theme',
                'hover:bg-muted',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            >
              Browse library
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="flex flex-col items-center justify-center gap-2 border-dashed py-10 text-center hover:border-primary/25">
          <p className="text-base font-medium text-foreground">
            No matching practice problem yet
          </p>
          <p className="max-w-sm text-body-sm text-muted-foreground">
            You can still browse the practice library for problems from other
            lessons.
          </p>
          <Link
            to="/practice"
            className={cn(
              'mt-2 inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium',
              'bg-primary text-primary-foreground shadow-sm transition-theme',
              'hover:bg-primary-hover',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            Browse practice
          </Link>
        </Card>
      )}
    </LessonSection>
  )
}
