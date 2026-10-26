import { Link } from 'react-router-dom'
import { getLessonLearningPathContext } from '../../data/learningPath'
import { cn } from '../../lib/cn'
import { Badge, Card } from '../ui'
import { LessonSection, LessonSectionHeading } from '../lessons/LessonSection'

type LessonLearningPathProps = {
  lessonSlug: string
}

function PathLink({
  href,
  label,
  title,
}: {
  href: string
  label: string
  title: string
}) {
  return (
    <Link
      to={href}
      className={cn(
        'flex flex-col gap-1 rounded-lg border border-border bg-background/80 p-3',
        'transition-theme hover:border-primary/30 hover:bg-muted/40',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
    >
      <span className="text-label text-primary">{label}</span>
      <span className="text-sm font-medium text-foreground">{title}</span>
    </Link>
  )
}

function PathPlaceholder({ label, message }: { label: string; message: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-dashed border-border bg-muted/30 p-3 dark:bg-muted/15">
      <span className="text-label text-muted-foreground">{label}</span>
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  )
}

/**
 * Compact learning-path section for lesson pages.
 * Uses shared learning-path data — not duplicated per lesson file.
 */
export function LessonLearningPath({ lessonSlug }: LessonLearningPathProps) {
  const context = getLessonLearningPathContext(lessonSlug)

  if (!context) {
    return null
  }

  return (
    <LessonSection id="learning-path">
      <LessonSectionHeading
        id="learning-path"
        eyebrow="LEARNING PATH"
        title="Where you are"
        description="Recommended order based on available lessons. You can open any lesson directly — prerequisites are guidance only."
      />

      <Card className="space-y-4 p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {context.previousLesson ? (
            <PathLink
              href={context.previousLesson.href}
              label="Previous"
              title={context.previousLesson.title}
            />
          ) : (
            <PathPlaceholder
              label="Previous"
              message="This is the first lesson in the recommended order."
            />
          )}

          <div className="flex flex-col gap-1 rounded-lg border border-primary/30 bg-primary/5 p-3 dark:bg-primary/10">
            <span className="text-label text-primary">Current</span>
            <span className="text-sm font-medium text-foreground">
              {context.currentLesson.title}
            </span>
          </div>

          {context.nextLesson ? (
            <PathLink
              href={context.nextLesson.href}
              label="Next recommended"
              title={context.nextLesson.title}
            />
          ) : (
            <PathPlaceholder
              label="Next recommended"
              message="End of the current lesson order."
            />
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {context.relatedPractice ? (
            <Link
              to={context.relatedPractice.href}
              className={cn(
                'inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium',
                'bg-primary text-primary-foreground shadow-sm transition-theme',
                'hover:bg-primary-hover',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            >
              Practice: {context.relatedPractice.title}
            </Link>
          ) : (
            <Badge variant="muted">No related practice problem yet</Badge>
          )}

          {context.comparison ? (
            <Link
              to={context.comparison.href}
              className={cn(
                'inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium',
                'border border-border bg-surface text-foreground shadow-sm transition-theme',
                'hover:bg-muted',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            >
              {context.comparison.title}
            </Link>
          ) : null}

          <Link
            to="/roadmap"
            className={cn(
              'inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium',
              'border border-border bg-surface text-foreground shadow-sm transition-theme',
              'hover:bg-muted',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            Full roadmap
          </Link>
        </div>

        {context.recommendedPrerequisites.length > 0 ? (
          <div>
            <p className="text-body-sm text-muted-foreground">
              Recommended to review first (optional):
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {context.recommendedPrerequisites.map((prereq) => (
                <li key={prereq.slug}>
                  <Link
                    to={prereq.href}
                    className="text-sm font-medium text-primary transition-theme hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {prereq.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card>
    </LessonSection>
  )
}
