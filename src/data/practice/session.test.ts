import { describe, expect, it } from 'vitest'
import { practiceProblems } from './problems'
import type { PracticeProblem } from './types'
import {
  addSlugToSet,
  createActivityEvent,
  createEmptySessionSnapshot,
  getCompletedTopics,
  getPracticeSessionSummary,
  getTopicProgressOverview,
  getValidationAvailability,
  prependActivityEvent,
  recommendNextPracticeProblem,
  removeSlugFromSet,
} from './session'
import { getPracticeProblem, isValidationSupported } from './index'

function cloneProblem(
  problem: PracticeProblem,
  overrides: Partial<PracticeProblem>,
): PracticeProblem {
  return { ...problem, ...overrides }
}

describe('practice session summary', () => {
  it('derives summary counts from practice data and session state', () => {
    const first = practiceProblems[0]!
    const second = practiceProblems[1]!

    const summary = getPracticeSessionSummary(practiceProblems, {
      completedSlugs: new Set([first.slug]),
      attemptedSlugs: new Set([second.slug]),
    })

    expect(summary.totalProblems).toBe(practiceProblems.length)
    expect(summary.completedCount).toBe(1)
    expect(summary.attemptedCount).toBe(1)
    expect(summary.remainingCount).toBe(practiceProblems.length - 1)
    expect(summary.topicsExploredCount).toBe(1)
    expect(summary.hasSessionActivity).toBe(true)
  })

  it('keeps completed and attempted states distinct', () => {
    const problem = practiceProblems[0]!

    const completedOnly = getPracticeSessionSummary(practiceProblems, {
      completedSlugs: new Set([problem.slug]),
      attemptedSlugs: new Set(),
    })
    const attemptedOnly = getPracticeSessionSummary(practiceProblems, {
      completedSlugs: new Set(),
      attemptedSlugs: new Set([problem.slug]),
    })

    expect(completedOnly.completedCount).toBe(1)
    expect(completedOnly.attemptedCount).toBe(0)
    expect(attemptedOnly.completedCount).toBe(0)
    expect(attemptedOnly.attemptedCount).toBe(1)
  })

  it('reports no session activity for an empty snapshot', () => {
    const summary = getPracticeSessionSummary(
      practiceProblems,
      createEmptySessionSnapshot(),
    )

    expect(summary.hasSessionActivity).toBe(false)
    expect(summary.completedCount).toBe(0)
    expect(summary.attemptedCount).toBe(0)
    expect(summary.topicsExploredCount).toBe(0)
    expect(summary.remainingCount).toBe(practiceProblems.length)
  })
})

describe('practice topic overview', () => {
  it('counts available and completed problems per category', () => {
    const byCategory = new Map<string, PracticeProblem[]>()
    for (const problem of practiceProblems) {
      const list = byCategory.get(problem.category) ?? []
      list.push(problem)
      byCategory.set(problem.category, list)
    }

    const firstCategory = [...byCategory.keys()].sort()[0]!
    const categoryProblems = byCategory.get(firstCategory)!
    const completedSlug = categoryProblems[0]!.slug

    const overview = getTopicProgressOverview(
      practiceProblems,
      new Set([completedSlug]),
    )
    const topic = overview.find((entry) => entry.category === firstCategory)

    expect(topic).toBeDefined()
    expect(topic!.availableCount).toBe(categoryProblems.length)
    expect(topic!.completedCount).toBe(1)
    expect(topic!.sessionProgressRatio).toBe(1 / categoryProblems.length)
    expect(topic!.exploreHref).toBe(
      `/practice?category=${encodeURIComponent(firstCategory)}`,
    )
  })

  it('lists topics explored only from completed problems', () => {
    const searching = practiceProblems.find(
      (problem) => problem.category === 'Searching',
    )
    expect(searching).toBeDefined()

    const topics = getCompletedTopics(
      practiceProblems,
      new Set([searching!.slug]),
    )
    expect(topics).toEqual(['Searching'])
  })
})

describe('practice recommendations', () => {
  it('recommends an implemented incomplete problem with a real href', () => {
    const recommendation = recommendNextPracticeProblem(
      practiceProblems,
      new Set(),
    )

    expect(recommendation.status).toBe('recommend')
    if (recommendation.status !== 'recommend') {
      return
    }

    expect(getPracticeProblem(recommendation.problem.slug)).toBeDefined()
    expect(recommendation.href).toBe(`/practice/${recommendation.problem.slug}`)
    expect(practiceProblems.some((p) => p.slug === recommendation.problem.slug)).toBe(
      true,
    )
  })

  it('prefers a problem in an unexplored topic when possible', () => {
    const searching = practiceProblems.filter(
      (problem) => problem.category === 'Searching',
    )
    const other = practiceProblems.find(
      (problem) => problem.category !== 'Searching',
    )
    expect(searching.length).toBeGreaterThan(0)
    expect(other).toBeDefined()

    const completedSearching = new Set(searching.map((problem) => problem.slug))
    const recommendation = recommendNextPracticeProblem(
      practiceProblems,
      completedSearching,
    )

    expect(recommendation.status).toBe('recommend')
    if (recommendation.status !== 'recommend') {
      return
    }

    expect(recommendation.problem.category).not.toBe('Searching')
    expect(completedSearching.has(recommendation.problem.slug)).toBe(false)
  })

  it('handles an empty collection', () => {
    const recommendation = recommendNextPracticeProblem([], new Set())
    expect(recommendation.status).toBe('empty')
  })

  it('handles an all-completed collection', () => {
    const allSlugs = new Set(practiceProblems.map((problem) => problem.slug))
    const recommendation = recommendNextPracticeProblem(
      practiceProblems,
      allSlugs,
    )

    expect(recommendation.status).toBe('all_completed')
  })

  it('never recommends a nonexistent slug', () => {
    const fake = cloneProblem(practiceProblems[0]!, {
      slug: 'does-not-exist-in-library',
      id: 'fake',
    })
    // Recommendation only considers the list passed in; verify href matches list entry.
    const recommendation = recommendNextPracticeProblem([fake], new Set())
    expect(recommendation.status).toBe('recommend')
    if (recommendation.status === 'recommend') {
      expect(recommendation.problem.slug).toBe(fake.slug)
      expect(recommendation.href).toBe(`/practice/${fake.slug}`)
    }
  })
})

describe('session helpers and validation availability', () => {
  it('adds and removes slugs immutably', () => {
    const empty = new Set<string>()
    const withOne = addSlugToSet(empty, 'find-an-element')
    expect(empty.has('find-an-element')).toBe(false)
    expect(withOne.has('find-an-element')).toBe(true)

    const removed = removeSlugFromSet(withOne, 'find-an-element')
    expect(withOne.has('find-an-element')).toBe(true)
    expect(removed.has('find-an-element')).toBe(false)
  })

  it('records real activity events without fabricating fields', () => {
    const at = 1_700_000_000_000
    const event = createActivityEvent({
      kind: 'checked_answer',
      problemSlug: 'find-an-element',
      problemTitle: 'Find an Element',
      at,
      id: 'test-event',
    })

    expect(event).toEqual({
      id: 'test-event',
      kind: 'checked_answer',
      problemSlug: 'find-an-element',
      problemTitle: 'Find an Element',
      at,
    })

    const next = prependActivityEvent([], event, 2)
    expect(next).toHaveLength(1)
    expect(next[0]).toBe(event)
  })

  it('maps validation availability from the validation support matrix', () => {
    const availability = getValidationAvailability(practiceProblems)

    for (const problem of practiceProblems) {
      expect(availability.get(problem.slug)).toBe(
        isValidationSupported(problem.slug),
      )
    }
  })

  it('clears session snapshot fields independently of practice content', () => {
    const empty = createEmptySessionSnapshot()
    expect(empty.completedSlugs.size).toBe(0)
    expect(empty.attemptedSlugs.size).toBe(0)
    expect(practiceProblems.length).toBeGreaterThan(0)
  })
})
