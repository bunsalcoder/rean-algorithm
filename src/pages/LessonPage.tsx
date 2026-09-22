import { Link, useParams } from 'react-router-dom'
import { AlgorithmList } from '../components/algorithms/AlgorithmList'
import {
  LessonCode,
  LessonComplexity,
  LessonHeader,
  LessonNavigation,
  LessonObjectives,
  LessonOverview,
  LessonPseudocode,
  LessonSortedRequirement,
  LessonSteps,
  LessonTableOfContents,
  LessonTakeaways,
  LessonThinkingGuide,
  LessonUsage,
  LessonVisualization,
  LessonWhyItMatters,
  RelatedPractice,
} from '../components/lessons'
import { Container, Section } from '../components/ui'
import {
  getAlgorithmByLessonSlug,
  getAlgorithmsByCategory,
} from '../data/algorithms'
import { getLesson, getLessonToc } from '../data/lessons'
import { useInView } from '../hooks/useInView'
import { cn } from '../lib/cn'

function LessonNotFound({ slug }: { slug?: string }) {
  return (
    <Section className="flex flex-1 items-center">
      <Container size="sm" className="text-center">
        <p className="text-label text-primary">404</p>
        <h1 className="mt-3 text-foreground">Lesson not found</h1>
        <p className="mx-auto mt-4 max-w-md text-body text-muted-foreground">
          {slug
            ? `No lesson matches “${slug}”. Check the URL or return to the roadmap.`
            : 'This lesson does not exist yet.'}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/roadmap"
            className={cn(
              'inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium',
              'bg-primary text-primary-foreground shadow-sm transition-theme',
              'hover:bg-primary-hover',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            Browse roadmap
          </Link>
          <Link
            to="/"
            className={cn(
              'inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium',
              'border border-border bg-surface text-foreground shadow-sm transition-theme',
              'hover:bg-muted',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            Go home
          </Link>
        </div>
      </Container>
    </Section>
  )
}

export function LessonPage() {
  const { slug } = useParams<{ slug: string }>()
  const lesson = slug ? getLesson(slug) : undefined
  const { ref, isInView } = useInView<HTMLDivElement>({
    threshold: 0,
    rootMargin: '0px',
  })

  if (!lesson) {
    return <LessonNotFound slug={slug} />
  }

  const toc = getLessonToc(lesson)
  const relatedAlgorithm = slug ? getAlgorithmByLessonSlug(slug) : undefined
  const categoryAlgorithms = relatedAlgorithm
    ? getAlgorithmsByCategory(relatedAlgorithm.categoryId)
    : []

  return (
    <Section className="relative overflow-hidden py-10 sm:py-12 lg:py-14">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 size-72 rounded-full bg-primary/10 blur-3xl dark:bg-primary/16" />
        <div className="absolute -right-20 top-40 size-64 rounded-full bg-primary/8 blur-3xl dark:bg-primary/12" />
      </div>

      <Container
        ref={ref}
        size="lg"
        className={cn(
          'relative section-reveal',
          isInView && 'section-reveal-visible',
        )}
      >
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_260px] xl:gap-14">
          <article className="min-w-0">
            <div className="section-reveal-item">
              <LessonHeader lesson={lesson} />
            </div>

            <div className="mt-10 space-y-12 sm:mt-12 sm:space-y-14">
              <div
                className="section-reveal-item"
                style={{ transitionDelay: '60ms' }}
              >
                <LessonObjectives objectives={lesson.objectives} />
              </div>

              <div
                className="section-reveal-item"
                style={{ transitionDelay: '100ms' }}
              >
                <LessonOverview paragraphs={lesson.overview} />
              </div>

              <div
                className="section-reveal-item"
                style={{ transitionDelay: '140ms' }}
              >
                <LessonWhyItMatters points={lesson.whyItMatters} />
              </div>

              {lesson.visualization ? (
                <div
                  className="section-reveal-item"
                  style={{ transitionDelay: '180ms' }}
                >
                  <LessonVisualization visualization={lesson.visualization} />
                </div>
              ) : null}

              <div className="section-reveal-item">
                <LessonSteps steps={lesson.steps} />
              </div>

              {lesson.sortedRequirement ? (
                <div className="section-reveal-item">
                  <LessonSortedRequirement
                    requirement={lesson.sortedRequirement}
                  />
                </div>
              ) : null}

              {lesson.thinkingGuide ? (
                <div className="section-reveal-item">
                  <LessonThinkingGuide guide={lesson.thinkingGuide} />
                </div>
              ) : null}

              <div className="section-reveal-item">
                <LessonComplexity complexity={lesson.complexity} />
              </div>

              <div className="section-reveal-item">
                <LessonPseudocode pseudocode={lesson.pseudocode} />
              </div>

              <div className="section-reveal-item">
                <LessonCode code={lesson.code} />
              </div>

              <div className="section-reveal-item">
                <LessonUsage
                  whenToUse={lesson.whenToUse}
                  whenNotToUse={lesson.whenNotToUse}
                />
              </div>

              <div className="section-reveal-item">
                <LessonTakeaways takeaways={lesson.keyTakeaways} />
              </div>

              <div className="section-reveal-item">
                <RelatedPractice />
              </div>

              <div className="section-reveal-item">
                <LessonNavigation lesson={lesson} />
              </div>
            </div>
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-8 section-reveal-item">
              {categoryAlgorithms.length > 0 ? (
                <div>
                  <p className="mb-3 text-label text-[0.65rem] tracking-[0.08em]">
                    Algorithms
                  </p>
                  <AlgorithmList
                    algorithms={categoryAlgorithms}
                    compact
                  />
                </div>
              ) : null}
              <LessonTableOfContents items={toc} />
            </div>
          </aside>
        </div>
      </Container>
    </Section>
  )
}
