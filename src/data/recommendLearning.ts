import {
  findUsefulPrerequisiteToReview,
  getComparisonForLesson,
  getLessonSlugFromPracticeSlug,
  getNextLessonInOrder,
  getOrderedAvailableLessons,
  getRelatedPracticeForLesson,
  learningComparisonPages,
  resolveLessonRef,
  type LearningPathLink,
} from './learningPath'
import { getPracticeProblem } from './practice'

export type LearningRecommendationKind =
  | 'start_lesson'
  | 'continue_lesson'
  | 'practice_problem'
  | 'review_prerequisite'
  | 'explore_comparison'

export type LearningRecommendation =
  | {
      status: 'recommend'
      kind: LearningRecommendationKind
      title: string
      href: string
      reason: string
      /** Optional secondary destination (e.g. roadmap). */
      secondary?: LearningPathLink
    }
  | {
      status: 'empty'
      reason: string
    }

export type LearningRecommendationInput = {
  /** Practice problems marked complete in the current session. */
  completedPracticeSlugs: ReadonlySet<string>
  /**
   * Most recently visited or acted-on practice problem slug from session
   * activity, when available.
   */
  recentPracticeSlug?: string
  /** Lesson currently being viewed, when recommending from a lesson page. */
  currentLessonSlug?: string
}

function buildRecommendation(
  kind: LearningRecommendationKind,
  title: string,
  href: string,
  reason: string,
): LearningRecommendation {
  return {
    status: 'recommend',
    kind,
    title,
    href,
    reason,
    secondary: { title: 'Full roadmap', href: '/roadmap' },
  }
}

function resolveFocusLessonSlug(
  input: LearningRecommendationInput,
): string | undefined {
  if (input.currentLessonSlug && resolveLessonRef(input.currentLessonSlug)) {
    return input.currentLessonSlug
  }

  if (input.recentPracticeSlug) {
    const fromPractice = getLessonSlugFromPracticeSlug(input.recentPracticeSlug)
    if (fromPractice && resolveLessonRef(fromPractice)) {
      return fromPractice
    }
  }

  return undefined
}

/**
 * Select the next useful learning action from available content and
 * current-session activity. Deterministic when activity is missing.
 *
 * This is a recommendation based on content availability and session state —
 * not performance analysis, mastery inference, or AI personalization.
 */
export function recommendNextLearningAction(
  input: LearningRecommendationInput,
): LearningRecommendation {
  const lessons = getOrderedAvailableLessons()

  if (lessons.length === 0) {
    return {
      status: 'empty',
      reason:
        'No lessons are available yet. Check the roadmap when new content ships.',
    }
  }

  const completed = input.completedPracticeSlugs
  const focusSlug = resolveFocusLessonSlug(input)

  if (focusSlug) {
    const focusLesson = resolveLessonRef(focusSlug)
    if (focusLesson) {
      const usefulPrereq = findUsefulPrerequisiteToReview(focusSlug, completed)
      if (usefulPrereq) {
        return buildRecommendation(
          'review_prerequisite',
          usefulPrereq.lesson.title,
          usefulPrereq.lesson.href,
          usefulPrereq.reason,
        )
      }

      const relatedPractice = getRelatedPracticeForLesson(focusSlug)
      if (relatedPractice && !completed.has(relatedPractice.slug)) {
        const recentIsThis =
          input.recentPracticeSlug === relatedPractice.slug ||
          (input.recentPracticeSlug !== undefined &&
            getPracticeProblem(input.recentPracticeSlug)?.relatedLessonSlug ===
              focusSlug)

        return buildRecommendation(
          'practice_problem',
          relatedPractice.title,
          relatedPractice.href,
          recentIsThis
            ? `Continue the related practice for ${focusLesson.title} — it is not marked complete in this session.`
            : `Practice a related problem for ${focusLesson.title} based on available content and your current topic.`,
        )
      }

      const nextLesson = getNextLessonInOrder(focusSlug)
      if (nextLesson) {
        return buildRecommendation(
          'continue_lesson',
          nextLesson.title,
          nextLesson.href,
          `Next recommended lesson after ${focusLesson.title} in the learning order.`,
        )
      }

      const comparison = getComparisonForLesson(focusSlug)
      if (comparison) {
        return buildRecommendation(
          'explore_comparison',
          comparison.title,
          comparison.href,
          `You reached the end of the lesson order near ${focusLesson.title}. Explore a comparison page next.`,
        )
      }
    }
  }

  // Cold start / no usable focus: deterministic scan of learning order.
  for (const lesson of lessons) {
    const relatedPractice = getRelatedPracticeForLesson(lesson.slug)

    if (!relatedPractice) {
      // Lessons without practice: only lead the path when the session is empty.
      if (completed.size === 0 && lesson.slug === lessons[0]!.slug) {
        return buildRecommendation(
          'start_lesson',
          lesson.title,
          lesson.href,
          'Start with the first available lesson in the recommended learning order.',
        )
      }
      continue
    }

    if (completed.has(relatedPractice.slug)) {
      continue
    }

    if (input.recentPracticeSlug === relatedPractice.slug) {
      return buildRecommendation(
        'practice_problem',
        relatedPractice.title,
        relatedPractice.href,
        'Continue the practice problem you most recently opened — it is not marked complete yet.',
      )
    }

    return buildRecommendation(
      'start_lesson',
      lesson.title,
      lesson.href,
      completed.size === 0
        ? 'Start with the first available lesson in the recommended learning order.'
        : `Continue with ${lesson.title} — related practice for earlier lessons is marked complete this session.`,
    )
  }

  const firstComparison = learningComparisonPages[0]
  if (firstComparison) {
    return buildRecommendation(
      'explore_comparison',
      firstComparison.title,
      firstComparison.href,
      'Available practice tied to lessons is marked complete in this session. Explore a comparison page next.',
    )
  }

  return buildRecommendation(
    'start_lesson',
    lessons[0]!.title,
    lessons[0]!.href,
    'Review the first lesson in the recommended learning order.',
  )
}

export function getRecentPracticeSlugFromActivity(
  events: readonly { problemSlug: string }[],
): string | undefined {
  return events[0]?.problemSlug
}
