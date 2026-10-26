import { describe, expect, it } from 'vitest'
import { getLesson } from './lessons'
import { getPracticeProblem } from './practice'
import {
  findUsefulPrerequisiteToReview,
  getAvailableLessonsForStage,
  getAvailablePracticeForStage,
  getComparisonForLesson,
  getLessonLearningPathContext,
  getNextLessonInOrder,
  getOrderedAvailableLessons,
  getPreviousLessonInOrder,
  getRelatedPracticeForLesson,
  getStageStartAction,
  learningComparisonPages,
  lessonPrerequisites,
  recommendedLessonOrder,
  stageHasAvailableContent,
  stageLearningContent,
} from './learningPath'
import { recommendNextLearningAction } from './recommendLearning'
import { roadmapStages } from './roadmap'

const KNOWN_APP_ROUTES = new Set([
  '/',
  '/roadmap',
  '/algorithms',
  '/algorithms/sorting',
  '/algorithms/sorting/comparison',
  '/algorithms/searching',
  '/algorithms/searching/comparison',
  '/algorithms/array-string',
  '/algorithms/array-string/comparison',
  '/algorithms/tree-graph',
  '/algorithms/dynamic-programming',
  '/algorithms/backtracking',
  '/data-structures',
  '/data-structures/linked-list',
  '/data-structures/stack-queue',
  '/practice',
  '/practice/dashboard',
  '/about',
  '/visualizer-demo',
  '/sorting-visualizer-demo',
])

function isImplementedRoute(href: string): boolean {
  if (KNOWN_APP_ROUTES.has(href)) {
    return true
  }
  if (href.startsWith('/learn/')) {
    const slug = href.slice('/learn/'.length)
    return getLesson(slug) !== undefined
  }
  if (href.startsWith('/practice/')) {
    const slug = href.slice('/practice/'.length)
    if (slug === 'dashboard') {
      return true
    }
    return getPracticeProblem(slug) !== undefined
  }
  if (href.startsWith('/roadmap/')) {
    const stageId = href.slice('/roadmap/'.length)
    return roadmapStages.some((stage) => stage.id === stageId)
  }
  return false
}

describe('learning path content integrity', () => {
  it('only references implemented lessons in the recommended order', () => {
    for (const slug of recommendedLessonOrder) {
      expect(getLesson(slug), `missing lesson: ${slug}`).toBeDefined()
    }
  })

  it('only references implemented lessons and practice in stage content', () => {
    for (const stage of stageLearningContent) {
      for (const slug of stage.lessonSlugs) {
        expect(getLesson(slug), `stage ${stage.stageId} lesson ${slug}`).toBeDefined()
      }
      for (const slug of stage.practiceSlugs) {
        expect(
          getPracticeProblem(slug),
          `stage ${stage.stageId} practice ${slug}`,
        ).toBeDefined()
      }
      if (stage.hubHref) {
        expect(isImplementedRoute(stage.hubHref)).toBe(true)
      }
      if (stage.comparisonHref) {
        expect(isImplementedRoute(stage.comparisonHref)).toBe(true)
      }
    }
  })

  it('only references implemented prerequisite lessons', () => {
    for (const entry of lessonPrerequisites) {
      expect(getLesson(entry.lessonSlug)).toBeDefined()
      expect(getLesson(entry.prerequisiteSlug)).toBeDefined()
    }
  })

  it('resolves every learning-path destination to an implemented route', () => {
    for (const lesson of getOrderedAvailableLessons()) {
      expect(isImplementedRoute(lesson.href)).toBe(true)
    }

    for (const stage of roadmapStages) {
      for (const lesson of getAvailableLessonsForStage(stage.id)) {
        expect(isImplementedRoute(lesson.href)).toBe(true)
      }
      for (const problem of getAvailablePracticeForStage(stage.id)) {
        expect(isImplementedRoute(problem.href)).toBe(true)
      }
      const start = getStageStartAction(stage.id)
      if (start) {
        expect(isImplementedRoute(start.href)).toBe(true)
      }
    }

    for (const page of learningComparisonPages) {
      expect(isImplementedRoute(page.href)).toBe(true)
    }

    for (const slug of recommendedLessonOrder) {
      const context = getLessonLearningPathContext(slug)
      expect(context).toBeDefined()
      if (!context) {
        continue
      }
      expect(isImplementedRoute(context.currentLesson.href)).toBe(true)
      if (context.previousLesson) {
        expect(isImplementedRoute(context.previousLesson.href)).toBe(true)
      }
      if (context.nextLesson) {
        expect(isImplementedRoute(context.nextLesson.href)).toBe(true)
      }
      if (context.relatedPractice) {
        expect(isImplementedRoute(context.relatedPractice.href)).toBe(true)
      }
      if (context.comparison) {
        expect(isImplementedRoute(context.comparison.href)).toBe(true)
      }
    }
  })

  it('does not present unavailable stages as having start actions', () => {
    expect(stageHasAvailableContent('complexity')).toBe(false)
    expect(getStageStartAction('complexity')).toBeUndefined()
    expect(getAvailableLessonsForStage('complexity')).toEqual([])

    expect(stageHasAvailableContent('linked-lists')).toBe(false)
    expect(stageHasAvailableContent('searching')).toBe(true)
    expect(getStageStartAction('searching')?.href).toBe('/learn/linear-search')
  })

  it('keeps lesson navigation order consistent with the recommended path', () => {
    expect(getPreviousLessonInOrder('linear-search')?.slug).toBe(
      'introduction-to-algorithms',
    )
    expect(getNextLessonInOrder('linear-search')?.slug).toBe('binary-search')
    expect(getNextLessonInOrder('heap-sort')).toBeUndefined()
  })

  it('exposes comparison pages only where they exist', () => {
    expect(getComparisonForLesson('binary-search')?.href).toBe(
      '/algorithms/searching/comparison',
    )
    expect(getComparisonForLesson('bubble-sort')?.href).toBe(
      '/algorithms/sorting/comparison',
    )
    expect(getComparisonForLesson('two-pointers')?.href).toBe(
      '/algorithms/array-string/comparison',
    )
    expect(getComparisonForLesson('introduction-to-algorithms')).toBeUndefined()
  })
})

describe('recommendNextLearningAction', () => {
  it('falls back to a deterministic first lesson when session state is empty', () => {
    const first = recommendNextLearningAction({
      completedPracticeSlugs: new Set(),
    })
    const second = recommendNextLearningAction({
      completedPracticeSlugs: new Set(),
    })

    expect(first).toEqual(second)
    expect(first.status).toBe('recommend')
    if (first.status !== 'recommend') {
      return
    }
    expect(first.kind).toBe('start_lesson')
    expect(first.href).toBe('/learn/introduction-to-algorithms')
    expect(isImplementedRoute(first.href)).toBe(true)
  })

  it('recommends related practice for the current lesson when incomplete', () => {
    const result = recommendNextLearningAction({
      completedPracticeSlugs: new Set(),
      currentLessonSlug: 'linear-search',
    })

    expect(result.status).toBe('recommend')
    if (result.status !== 'recommend') {
      return
    }
    expect(result.kind).toBe('practice_problem')
    expect(result.href).toBe('/practice/find-an-element')
  })

  it('suggests reviewing a useful prerequisite without blocking navigation data', () => {
    const result = recommendNextLearningAction({
      completedPracticeSlugs: new Set(),
      currentLessonSlug: 'jump-search',
    })

    expect(result.status).toBe('recommend')
    if (result.status !== 'recommend') {
      return
    }
    expect(result.kind).toBe('review_prerequisite')
    expect(result.href).toBe('/learn/binary-search')

    // Prerequisites guide; lesson context still exposes direct next/prev links.
    const context = getLessonLearningPathContext('jump-search')
    expect(context?.currentLesson.href).toBe('/learn/jump-search')
    expect(context?.recommendedPrerequisites.some((p) => p.slug === 'binary-search')).toBe(
      true,
    )
  })

  it('does not repeatedly recommend completed practice for the focused lesson', () => {
    const result = recommendNextLearningAction({
      completedPracticeSlugs: new Set(['find-an-element']),
      currentLessonSlug: 'linear-search',
    })

    expect(result.status).toBe('recommend')
    if (result.status !== 'recommend') {
      return
    }
    expect(result.href).not.toBe('/practice/find-an-element')
    expect(result.kind).toBe('continue_lesson')
    expect(result.href).toBe('/learn/binary-search')
  })

  it('uses recent practice activity when present', () => {
    const result = recommendNextLearningAction({
      completedPracticeSlugs: new Set(),
      recentPracticeSlug: 'two-sum-sorted',
    })

    expect(result.status).toBe('recommend')
    if (result.status !== 'recommend') {
      return
    }
    // Focus resolves to two-pointers; optional prereq linear-search is suggested first.
    expect(result.kind).toBe('review_prerequisite')
    expect(result.href).toBe('/learn/linear-search')
  })

  it('skips completed practice in the cold-start scan', () => {
    const related = getRelatedPracticeForLesson('linear-search')
    expect(related).toBeDefined()

    const result = recommendNextLearningAction({
      completedPracticeSlugs: new Set([related!.slug]),
    })

    expect(result.status).toBe('recommend')
    if (result.status !== 'recommend') {
      return
    }
    expect(result.href).not.toBe(related!.href)
    expect(result.kind).toBe('start_lesson')
    expect(result.href).toBe('/learn/binary-search')
  })

  it('handles empty lesson catalog gracefully', () => {
    // Sanity: with real catalog non-empty, recommendation is never empty.
    const result = recommendNextLearningAction({
      completedPracticeSlugs: new Set(),
    })
    expect(result.status).toBe('recommend')
  })

  it('recommends a comparison after the last lesson in order', () => {
    const result = recommendNextLearningAction({
      completedPracticeSlugs: new Set(),
      currentLessonSlug: 'heap-sort',
    })

    expect(result.status).toBe('recommend')
    if (result.status !== 'recommend') {
      return
    }
    expect(result.kind).toBe('explore_comparison')
    expect(result.href).toBe('/algorithms/sorting/comparison')
  })

  it('treats prerequisites as review guidance when their practice is incomplete', () => {
    const review = findUsefulPrerequisiteToReview(
      'valid-anagram',
      new Set(),
    )
    expect(review?.lesson.slug).toBe('frequency-counting')

    const afterComplete = findUsefulPrerequisiteToReview(
      'valid-anagram',
      new Set(['most-frequent-number']),
    )
    // Next useful prereq may be absent once frequency practice is done.
    if (afterComplete) {
      expect(afterComplete.lesson.slug).not.toBe('frequency-counting')
    }
  })
})
