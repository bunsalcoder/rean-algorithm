import { Link } from 'react-router-dom'
import {
  getAvailableLessonsForStage,
  getAvailablePracticeForStage,
  getStageLearningContent,
  getStageStartAction,
  stageHasAvailableContent,
} from '../../data/learningPath'
import {
  getStageActionLabel,
  getStageStatusLabel,
  type RoadmapStage,
  type RoadmapStageStatus,
} from '../../data/roadmap'
import { useInView } from '../../hooks/useInView'
import { cn } from '../../lib/cn'
import { RoadmapIcon } from './RoadmapIcon'
import { roadmapAccentStyles } from './roadmapAccentStyles'

const TOPIC_PREVIEW_COUNT = 4
const LESSON_PREVIEW_COUNT = 4
const PRACTICE_PREVIEW_COUNT = 3

type RoadmapStageCardProps = {
  stage: RoadmapStage
  index: number
  isLast: boolean
}

function ArrowIcon({ className }: { className?: string }) {
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

function StatusDot({ status }: { status: RoadmapStageStatus }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'size-1.5 shrink-0 rounded-full',
        status === 'completed' && 'bg-emerald-500',
        status === 'in-progress' && 'bg-primary',
        status === 'not-started' && 'bg-muted-foreground/45',
      )}
    />
  )
}

export function RoadmapStageCard({
  stage,
  index,
  isLast,
}: RoadmapStageCardProps) {
  const { ref, isInView } = useInView<HTMLLIElement>({
    threshold: 0.12,
    rootMargin: '0px 0px -6% 0px',
  })
  const accent = roadmapAccentStyles[stage.accent]
  const alignRight = index % 2 === 1
  const previewTopics = stage.topics.slice(0, TOPIC_PREVIEW_COUNT)
  const remainingTopics = stage.topics.length - previewTopics.length
  const statusLabel = getStageStatusLabel(stage.status)

  const hasContent = stageHasAvailableContent(stage.id)
  const lessons = getAvailableLessonsForStage(stage.id)
  const practice = getAvailablePracticeForStage(stage.id)
  const stageContent = getStageLearningContent(stage.id)
  const startAction = getStageStartAction(stage.id)
  const actionLabel = hasContent
    ? getStageActionLabel(stage.status)
    : 'Coming Soon'

  const previewLessons = lessons.slice(0, LESSON_PREVIEW_COUNT)
  const remainingLessons = lessons.length - previewLessons.length
  const previewPractice = practice.slice(0, PRACTICE_PREVIEW_COUNT)
  const remainingPractice = practice.length - previewPractice.length

  return (
    <li
      ref={ref}
      className={cn(
        'group relative roadmap-stage',
        isInView && 'roadmap-stage-visible',
      )}
      style={{ transitionDelay: `${Math.min(index, 6) * 60}ms` }}
    >
      {/* Timeline rail + node */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-0 bottom-0 w-px sm:left-5 lg:left-1/2 lg:-translate-x-1/2"
      >
        <div
          className={cn(
            'absolute inset-x-0 top-8 bottom-0 mx-auto w-px bg-border',
            'transition-colors duration-300',
            accent.connector,
            isLast && 'bottom-8',
          )}
        />
        <div
          className={cn(
            'absolute left-1/2 top-8 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full',
            'ring-4 ring-background transition-all duration-300',
            accent.node,
            hasContent && 'group-hover:scale-125 group-hover:ring-[6px]',
            hasContent && accent.nodeRing,
          )}
        />
        <div
          className={cn(
            'absolute top-8 hidden h-px w-6 -translate-y-1/2 bg-border transition-colors duration-300 lg:block',
            'xl:w-8',
            accent.connector,
            alignRight ? 'left-1/2' : 'right-1/2',
          )}
        />
      </div>

      <div
        className={cn(
          'relative grid pl-10 sm:pl-12 lg:grid-cols-2 lg:gap-10 lg:pl-0 xl:gap-14',
          alignRight && 'lg:[&>*]:col-start-2',
        )}
      >
        <article
          className={cn(
            'relative flex min-w-0 flex-col overflow-hidden rounded-xl',
            'border border-border bg-surface p-5 shadow-sm sm:p-6',
            'transition-all duration-300 ease-out',
            hasContent && 'hover:-translate-y-1',
            hasContent && accent.hoverBorder,
            hasContent && accent.hoverShadow,
            !hasContent && 'opacity-90',
            alignRight ? 'lg:ml-6 xl:ml-8' : 'lg:mr-6 xl:mr-8',
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

          <div className="relative flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div
                className={cn(
                  'flex size-11 shrink-0 items-center justify-center rounded-lg',
                  'transition-transform duration-300 ease-out',
                  'group-hover:scale-110',
                  accent.iconWrap,
                )}
              >
                <RoadmapIcon
                  name={stage.icon}
                  className={cn('size-5', accent.icon)}
                />
              </div>

              <div className="min-w-0">
                <p className="text-label text-muted-foreground">
                  Stage {String(stage.number).padStart(2, '0')}
                </p>
                <h3 className="mt-1 text-base font-medium text-foreground sm:text-lg">
                  {stage.title}
                </h3>
              </div>
            </div>
          </div>

          <p className="relative mt-3 text-body-sm text-muted-foreground">
            {stage.description}
          </p>

          <div className="relative mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <p className={cn('text-xs font-medium tracking-wide', accent.count)}>
              {stage.topics.length} topics
            </p>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 text-xs font-medium',
                accent.status,
              )}
            >
              <StatusDot status={hasContent ? stage.status : 'not-started'} />
              {hasContent ? statusLabel : 'Coming Soon'}
            </span>
            {hasContent ? (
              <span className="text-xs text-muted-foreground">
                {lessons.length}{' '}
                {lessons.length === 1 ? 'lesson' : 'lessons'}
                {practice.length > 0
                  ? ` · ${practice.length} practice`
                  : null}
              </span>
            ) : null}
          </div>

          <ul className="relative mt-4 flex flex-wrap gap-2">
            {previewTopics.map((topic) => (
              <li
                key={topic}
                className="rounded-md border border-border-subtle bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground dark:bg-muted/40"
              >
                {topic}
              </li>
            ))}
            {remainingTopics > 0 ? (
              <li className="rounded-md border border-border-subtle bg-transparent px-2.5 py-1 text-xs text-muted-foreground">
                +{remainingTopics} more
              </li>
            ) : null}
          </ul>

          {hasContent ? (
            <div className="relative mt-4 space-y-3">
              {previewLessons.length > 0 ? (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Available lessons
                  </p>
                  <ul className="mt-1.5 flex flex-wrap gap-1.5">
                    {previewLessons.map((lesson) => (
                      <li key={lesson.slug}>
                        <Link
                          to={lesson.href}
                          className={cn(
                            'inline-flex rounded-md border border-border-subtle bg-background px-2.5 py-1 text-xs font-medium text-foreground',
                            'transition-theme hover:border-primary/40 hover:text-primary',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          )}
                        >
                          {lesson.title}
                        </Link>
                      </li>
                    ))}
                    {remainingLessons > 0 ? (
                      <li className="inline-flex px-1 py-1 text-xs text-muted-foreground">
                        +{remainingLessons} more
                      </li>
                    ) : null}
                  </ul>
                </div>
              ) : null}

              {previewPractice.length > 0 ? (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Related practice
                  </p>
                  <ul className="mt-1.5 flex flex-wrap gap-1.5">
                    {previewPractice.map((problem) => (
                      <li key={problem.slug}>
                        <Link
                          to={problem.href}
                          className={cn(
                            'inline-flex rounded-md border border-border-subtle bg-background px-2.5 py-1 text-xs font-medium text-foreground',
                            'transition-theme hover:border-primary/40 hover:text-primary',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          )}
                        >
                          {problem.title}
                        </Link>
                      </li>
                    ))}
                    {remainingPractice > 0 ? (
                      <li className="inline-flex px-1 py-1 text-xs text-muted-foreground">
                        +{remainingPractice} more
                      </li>
                    ) : null}
                  </ul>
                </div>
              ) : null}

              {stageContent?.hubHref ? (
                <Link
                  to={stageContent.hubHref}
                  className="inline-flex text-xs font-medium text-primary transition-theme hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Open topic hub →
                </Link>
              ) : null}
            </div>
          ) : (
            <p className="relative mt-4 text-body-sm text-muted-foreground">
              Lessons for this stage are not available yet. Explore an earlier
              stage with available content, or check back later.
            </p>
          )}

          {hasContent && startAction ? (
            <Link
              to={startAction.href}
              className={cn(
                'relative mt-5 inline-flex w-fit items-center gap-1.5',
                'rounded-md bg-primary px-3.5 py-2 text-sm font-medium',
                'text-primary-foreground shadow-sm',
                'transition-transform duration-300 ease-out',
                'hover:translate-x-0.5',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              )}
            >
              {actionLabel}
              <ArrowIcon className="size-3.5" />
            </Link>
          ) : (
            <span
              className={cn(
                'relative mt-5 inline-flex w-fit items-center gap-1.5',
                'rounded-md border border-border bg-muted/60 px-3.5 py-2 text-sm font-medium',
                'text-muted-foreground',
              )}
            >
              {actionLabel}
            </span>
          )}
        </article>
      </div>
    </li>
  )
}
