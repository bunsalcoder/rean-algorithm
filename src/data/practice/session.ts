import { isValidationSupported } from './validation'
import { practiceProblems } from './problems'
import type { PracticeProblem } from './types'

export type PracticeActivityKind =
  | 'completed'
  | 'incomplete'
  | 'checked_answer'
  | 'visited'

export type PracticeActivityEvent = {
  id: string
  kind: PracticeActivityKind
  problemSlug: string
  problemTitle: string
  /** Epoch ms when the event actually occurred in this session. */
  at: number
}

export type PracticeSessionSnapshot = {
  completedSlugs: ReadonlySet<string>
  attemptedSlugs: ReadonlySet<string>
}

export type PracticeSessionSummary = {
  totalProblems: number
  completedCount: number
  attemptedCount: number
  remainingCount: number
  topicsExploredCount: number
  hasSessionActivity: boolean
}

export type PracticeTopicProgress = {
  category: string
  availableCount: number
  completedCount: number
  /** Fraction in [0, 1] of session completions for this topic; null when no problems. */
  sessionProgressRatio: number | null
  exploreHref: string
}

export type PracticeRecommendation =
  | {
      status: 'recommend'
      problem: PracticeProblem
      reason: string
      href: string
    }
  | {
      status: 'all_completed'
      reason: string
    }
  | {
      status: 'empty'
      reason: string
    }

const MAX_ACTIVITY_EVENTS = 20

export function addSlugToSet(
  slugs: ReadonlySet<string>,
  slug: string,
): Set<string> {
  if (slugs.has(slug)) {
    return new Set(slugs)
  }
  const next = new Set(slugs)
  next.add(slug)
  return next
}

export function removeSlugFromSet(
  slugs: ReadonlySet<string>,
  slug: string,
): Set<string> {
  if (!slugs.has(slug)) {
    return new Set(slugs)
  }
  const next = new Set(slugs)
  next.delete(slug)
  return next
}

export function createActivityEvent(input: {
  kind: PracticeActivityKind
  problemSlug: string
  problemTitle: string
  at?: number
  id?: string
}): PracticeActivityEvent {
  const at = input.at ?? Date.now()
  return {
    id: input.id ?? `${input.kind}:${input.problemSlug}:${at}`,
    kind: input.kind,
    problemSlug: input.problemSlug,
    problemTitle: input.problemTitle,
    at,
  }
}

export function prependActivityEvent(
  events: readonly PracticeActivityEvent[],
  event: PracticeActivityEvent,
  maxEvents = MAX_ACTIVITY_EVENTS,
): PracticeActivityEvent[] {
  return [event, ...events].slice(0, maxEvents)
}

export function getCompletedTopics(
  problems: readonly PracticeProblem[],
  completedSlugs: ReadonlySet<string>,
): string[] {
  const topics = new Set<string>()
  for (const problem of problems) {
    if (completedSlugs.has(problem.slug)) {
      topics.add(problem.category)
    }
  }
  return [...topics].sort()
}

export function getPracticeSessionSummary(
  problems: readonly PracticeProblem[],
  session: PracticeSessionSnapshot,
): PracticeSessionSummary {
  const totalProblems = problems.length
  let completedCount = 0
  let attemptedCount = 0

  for (const problem of problems) {
    if (session.completedSlugs.has(problem.slug)) {
      completedCount += 1
    }
    if (session.attemptedSlugs.has(problem.slug)) {
      attemptedCount += 1
    }
  }

  const topicsExploredCount = getCompletedTopics(
    problems,
    session.completedSlugs,
  ).length

  return {
    totalProblems,
    completedCount,
    attemptedCount,
    remainingCount: Math.max(0, totalProblems - completedCount),
    topicsExploredCount,
    hasSessionActivity:
      completedCount > 0 || attemptedCount > 0 || topicsExploredCount > 0,
  }
}

export function getTopicProgressOverview(
  problems: readonly PracticeProblem[],
  completedSlugs: ReadonlySet<string>,
): PracticeTopicProgress[] {
  const byCategory = new Map<string, PracticeProblem[]>()

  for (const problem of problems) {
    const list = byCategory.get(problem.category) ?? []
    list.push(problem)
    byCategory.set(problem.category, list)
  }

  return [...byCategory.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, categoryProblems]) => {
      const availableCount = categoryProblems.length
      const completedCount = categoryProblems.filter((problem) =>
        completedSlugs.has(problem.slug),
      ).length

      return {
        category,
        availableCount,
        completedCount,
        sessionProgressRatio:
          availableCount > 0 ? completedCount / availableCount : null,
        exploreHref: `/practice?category=${encodeURIComponent(category)}`,
      }
    })
}

/**
 * Recommend the next useful problem from the available collection.
 * Prefers incomplete problems in unexplored topics, then library order.
 */
export function recommendNextPracticeProblem(
  problems: readonly PracticeProblem[],
  completedSlugs: ReadonlySet<string>,
): PracticeRecommendation {
  if (problems.length === 0) {
    return {
      status: 'empty',
      reason:
        'No practice problems are available yet. Check back when the library grows.',
    }
  }

  const incomplete = problems.filter(
    (problem) => !completedSlugs.has(problem.slug),
  )

  if (incomplete.length === 0) {
    return {
      status: 'all_completed',
      reason:
        'You marked every available practice problem complete in this session. Revisit a related lesson or explore another category to keep learning.',
    }
  }

  const exploredTopics = new Set(getCompletedTopics(problems, completedSlugs))

  const unexploredTopicProblem = incomplete.find(
    (problem) => !exploredTopics.has(problem.category),
  )

  if (unexploredTopicProblem) {
    const reason =
      exploredTopics.size === 0
        ? 'Start with the first available problem in the practice library.'
        : `This problem is in ${unexploredTopicProblem.category}, a topic you have not marked complete yet this session.`

    return {
      status: 'recommend',
      problem: unexploredTopicProblem,
      reason,
      href: `/practice/${unexploredTopicProblem.slug}`,
    }
  }

  const next = incomplete[0]!
  return {
    status: 'recommend',
    problem: next,
    reason:
      'Continue with the next incomplete problem in the existing learning order.',
    href: `/practice/${next.slug}`,
  }
}

export function getValidationAvailability(
  problems: readonly PracticeProblem[] = practiceProblems,
): Map<string, boolean> {
  return new Map(
    problems.map((problem) => [
      problem.slug,
      isValidationSupported(problem.slug),
    ]),
  )
}

export function formatActivityLabel(kind: PracticeActivityKind): string {
  switch (kind) {
    case 'completed':
      return 'Marked completed'
    case 'incomplete':
      return 'Marked incomplete'
    case 'checked_answer':
      return 'Checked a structured answer'
    case 'visited':
      return 'Opened problem'
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}

export function createEmptySessionSnapshot(): PracticeSessionSnapshot {
  return {
    completedSlugs: new Set(),
    attemptedSlugs: new Set(),
  }
}
