import { getLesson } from './lessons'
import { getPracticeProblem, getPracticeProblemByLessonSlug } from './practice'
import { roadmapStages } from './roadmap'

/**
 * Typed learning-path data that connects roadmap stages, lessons, practice,
 * and comparison pages. Only references content that exists in the codebase.
 */

export type LearningPathLink = {
  title: string
  href: string
}

export type LearningPathLessonRef = LearningPathLink & {
  slug: string
}

export type LearningPathPracticeRef = LearningPathLink & {
  slug: string
}

export type LearningPathStageContent = {
  stageId: string
  /** Lesson slugs that belong to this stage (must exist in lessons). */
  lessonSlugs: readonly string[]
  /** Practice problem slugs related to this stage (must exist in practice). */
  practiceSlugs: readonly string[]
  /** Implemented hub route, when one exists. */
  hubHref?: string
  /** Implemented comparison route, when one exists. */
  comparisonHref?: string
  comparisonTitle?: string
}

export type LessonPrerequisite = {
  lessonSlug: string
  prerequisiteSlug: string
  reason: string
}

/**
 * Recommended lesson order across Rean Algorithm.
 * Only include slugs that have an implemented lesson.
 */
export const recommendedLessonOrder: readonly string[] = [
  'introduction-to-algorithms',
  'linear-search',
  'binary-search',
  'jump-search',
  'interpolation-search',
  'exponential-search',
  'two-pointers',
  'sliding-window',
  'prefix-sum',
  'frequency-counting',
  'kadanes-algorithm',
  'longest-substring-without-repeating-characters',
  'valid-anagram',
  'group-anagrams',
  'string-compression',
  'rotate-array',
  'bubble-sort',
  'selection-sort',
  'insertion-sort',
  'merge-sort',
  'quick-sort',
  'heap-sort',
  'singly-linked-list',
  'doubly-linked-list',
] as const

/**
 * Recommended prerequisites (guidance only — never blocks navigation).
 */
export const lessonPrerequisites: readonly LessonPrerequisite[] = [
  {
    lessonSlug: 'two-pointers',
    prerequisiteSlug: 'linear-search',
    reason:
      'Basic array traversal from Linear Search helps before common array patterns like Two Pointers.',
  },
  {
    lessonSlug: 'sliding-window',
    prerequisiteSlug: 'two-pointers',
    reason:
      'Two Pointers builds the index-moving intuition used in Sliding Window.',
  },
  {
    lessonSlug: 'jump-search',
    prerequisiteSlug: 'binary-search',
    reason: 'Jump Search builds on the sorted-array ideas from Binary Search.',
  },
  {
    lessonSlug: 'interpolation-search',
    prerequisiteSlug: 'binary-search',
    reason:
      'Interpolation Search is easier after you understand Binary Search on sorted data.',
  },
  {
    lessonSlug: 'exponential-search',
    prerequisiteSlug: 'binary-search',
    reason:
      'Exponential Search finishes with a Binary Search once a range is found.',
  },
  {
    lessonSlug: 'longest-substring-without-repeating-characters',
    prerequisiteSlug: 'sliding-window',
    reason:
      'Sliding Window fundamentals come before Longest Substring Without Repeating Characters.',
  },
  {
    lessonSlug: 'valid-anagram',
    prerequisiteSlug: 'frequency-counting',
    reason:
      'Frequency counting is the core technique behind Valid Anagram.',
  },
  {
    lessonSlug: 'group-anagrams',
    prerequisiteSlug: 'frequency-counting',
    reason:
      'Group Anagrams extends frequency / signature thinking from Frequency Counting.',
  },
  {
    lessonSlug: 'group-anagrams',
    prerequisiteSlug: 'valid-anagram',
    reason:
      'Valid Anagram is a useful warm-up before grouping many anagrams.',
  },
] as const

/**
 * Roadmap stage → real content. Stages with empty lessonSlugs are coming soon.
 */
export const stageLearningContent: readonly LearningPathStageContent[] = [
  {
    stageId: 'foundations',
    lessonSlugs: ['introduction-to-algorithms'],
    practiceSlugs: [],
  },
  {
    stageId: 'complexity',
    lessonSlugs: [],
    practiceSlugs: [],
  },
  {
    stageId: 'arrays-strings',
    lessonSlugs: [
      'two-pointers',
      'sliding-window',
      'prefix-sum',
      'frequency-counting',
      'kadanes-algorithm',
      'longest-substring-without-repeating-characters',
      'valid-anagram',
      'group-anagrams',
      'string-compression',
      'rotate-array',
    ],
    practiceSlugs: [
      'two-sum-sorted',
      'max-sum-fixed-window',
      'range-sum-queries',
      'most-frequent-number',
      'maximum-subarray-sum',
      'longest-substring-no-repeat',
      'valid-anagram',
      'group-anagrams',
    ],
    hubHref: '/algorithms/array-string',
    comparisonHref: '/algorithms/array-string/comparison',
    comparisonTitle: 'Array & String Comparison',
  },
  {
    stageId: 'searching',
    lessonSlugs: [
      'linear-search',
      'binary-search',
      'jump-search',
      'interpolation-search',
      'exponential-search',
    ],
    practiceSlugs: ['find-an-element', 'find-target-sorted-array'],
    hubHref: '/algorithms/searching',
    comparisonHref: '/algorithms/searching/comparison',
    comparisonTitle: 'Searching Comparison',
  },
  {
    stageId: 'sorting',
    lessonSlugs: [
      'bubble-sort',
      'selection-sort',
      'insertion-sort',
      'merge-sort',
      'quick-sort',
      'heap-sort',
    ],
    practiceSlugs: [],
    hubHref: '/algorithms/sorting',
    comparisonHref: '/algorithms/sorting/comparison',
    comparisonTitle: 'Sorting Comparison',
  },
  {
    stageId: 'linked-lists',
    lessonSlugs: ['singly-linked-list', 'doubly-linked-list'],
    practiceSlugs: [],
    hubHref: '/data-structures',
  },
  {
    stageId: 'stack-queue',
    lessonSlugs: [],
    practiceSlugs: [],
  },
  {
    stageId: 'hashing',
    lessonSlugs: ['frequency-counting', 'valid-anagram', 'group-anagrams'],
    practiceSlugs: [
      'most-frequent-number',
      'valid-anagram',
      'group-anagrams',
    ],
    hubHref: '/algorithms/array-string',
  },
  {
    stageId: 'trees',
    lessonSlugs: [],
    practiceSlugs: [],
  },
  {
    stageId: 'graphs',
    lessonSlugs: [],
    practiceSlugs: [],
  },
  {
    stageId: 'algorithmic-techniques',
    lessonSlugs: [],
    practiceSlugs: [],
  },
  {
    stageId: 'dynamic-programming',
    lessonSlugs: [],
    practiceSlugs: [],
  },
  {
    stageId: 'advanced-algorithms',
    lessonSlugs: [],
    practiceSlugs: [],
  },
] as const

const stageContentById = new Map(
  stageLearningContent.map((entry) => [entry.stageId, entry]),
)

const comparisonByLessonSlug = new Map<string, LearningPathLink>()
for (const stage of stageLearningContent) {
  if (!stage.comparisonHref || !stage.comparisonTitle) {
    continue
  }
  for (const slug of stage.lessonSlugs) {
    if (!comparisonByLessonSlug.has(slug)) {
      comparisonByLessonSlug.set(slug, {
        title: stage.comparisonTitle,
        href: stage.comparisonHref,
      })
    }
  }
}

export function getStageLearningContent(
  stageId: string,
): LearningPathStageContent | undefined {
  return stageContentById.get(stageId)
}

export function isLessonImplemented(slug: string): boolean {
  return getLesson(slug) !== undefined
}

export function isPracticeImplemented(slug: string): boolean {
  return getPracticeProblem(slug) !== undefined
}

export function resolveLessonRef(
  slug: string,
): LearningPathLessonRef | undefined {
  const lesson = getLesson(slug)
  if (!lesson) {
    return undefined
  }
  return {
    slug: lesson.slug,
    title: lesson.title,
    href: `/learn/${lesson.slug}`,
  }
}

export function resolvePracticeRef(
  slug: string,
): LearningPathPracticeRef | undefined {
  const problem = getPracticeProblem(slug)
  if (!problem) {
    return undefined
  }
  return {
    slug: problem.slug,
    title: problem.title,
    href: `/practice/${problem.slug}`,
  }
}

export function getAvailableLessonsForStage(
  stageId: string,
): LearningPathLessonRef[] {
  const content = getStageLearningContent(stageId)
  if (!content) {
    return []
  }
  return content.lessonSlugs
    .map((slug) => resolveLessonRef(slug))
    .filter((ref): ref is LearningPathLessonRef => ref !== undefined)
}

export function getAvailablePracticeForStage(
  stageId: string,
): LearningPathPracticeRef[] {
  const content = getStageLearningContent(stageId)
  if (!content) {
    return []
  }
  return content.practiceSlugs
    .map((slug) => resolvePracticeRef(slug))
    .filter((ref): ref is LearningPathPracticeRef => ref !== undefined)
}

export function stageHasAvailableContent(stageId: string): boolean {
  return (
    getAvailableLessonsForStage(stageId).length > 0 ||
    getAvailablePracticeForStage(stageId).length > 0
  )
}

export function getStageStartAction(
  stageId: string,
): LearningPathLink | undefined {
  const content = getStageLearningContent(stageId)
  const lessons = getAvailableLessonsForStage(stageId)

  if (lessons[0]) {
    return { title: lessons[0].title, href: lessons[0].href }
  }

  if (content?.hubHref) {
    const stage = roadmapStages.find((entry) => entry.id === stageId)
    return {
      title: stage ? `Open ${stage.title} hub` : 'Open hub',
      href: content.hubHref,
    }
  }

  const practice = getAvailablePracticeForStage(stageId)
  if (practice[0]) {
    return { title: practice[0].title, href: practice[0].href }
  }

  return undefined
}

export function getOrderedAvailableLessons(): LearningPathLessonRef[] {
  return recommendedLessonOrder
    .map((slug) => resolveLessonRef(slug))
    .filter((ref): ref is LearningPathLessonRef => ref !== undefined)
}

export function getLessonIndexInOrder(slug: string): number {
  return recommendedLessonOrder.indexOf(slug)
}

export function getPreviousLessonInOrder(
  slug: string,
): LearningPathLessonRef | undefined {
  const index = getLessonIndexInOrder(slug)
  if (index <= 0) {
    return undefined
  }

  for (let i = index - 1; i >= 0; i -= 1) {
    const ref = resolveLessonRef(recommendedLessonOrder[i]!)
    if (ref) {
      return ref
    }
  }
  return undefined
}

export function getNextLessonInOrder(
  slug: string,
): LearningPathLessonRef | undefined {
  const index = getLessonIndexInOrder(slug)
  if (index === -1) {
    return undefined
  }

  for (let i = index + 1; i < recommendedLessonOrder.length; i += 1) {
    const ref = resolveLessonRef(recommendedLessonOrder[i]!)
    if (ref) {
      return ref
    }
  }
  return undefined
}

export function getPrerequisitesForLesson(
  lessonSlug: string,
): LearningPathLessonRef[] {
  return lessonPrerequisites
    .filter((entry) => entry.lessonSlug === lessonSlug)
    .map((entry) => resolveLessonRef(entry.prerequisiteSlug))
    .filter((ref): ref is LearningPathLessonRef => ref !== undefined)
}

export function getPrerequisiteReason(
  lessonSlug: string,
  prerequisiteSlug: string,
): string | undefined {
  return lessonPrerequisites.find(
    (entry) =>
      entry.lessonSlug === lessonSlug &&
      entry.prerequisiteSlug === prerequisiteSlug,
  )?.reason
}

/**
 * First recommended prerequisite that still has incomplete related practice,
 * or any implemented prerequisite when the prerequisite has no practice yet.
 */
export function findUsefulPrerequisiteToReview(
  lessonSlug: string,
  completedPracticeSlugs: ReadonlySet<string>,
): { lesson: LearningPathLessonRef; reason: string } | undefined {
  for (const entry of lessonPrerequisites) {
    if (entry.lessonSlug !== lessonSlug) {
      continue
    }

    const prereq = resolveLessonRef(entry.prerequisiteSlug)
    if (!prereq) {
      continue
    }

    const relatedPractice = getPracticeProblemByLessonSlug(prereq.slug)
    if (relatedPractice && completedPracticeSlugs.has(relatedPractice.slug)) {
      continue
    }

    return { lesson: prereq, reason: entry.reason }
  }

  return undefined
}

export function getComparisonForLesson(
  lessonSlug: string,
): LearningPathLink | undefined {
  return comparisonByLessonSlug.get(lessonSlug)
}

export function getRelatedPracticeForLesson(
  lessonSlug: string,
): LearningPathPracticeRef | undefined {
  const problem = getPracticeProblemByLessonSlug(lessonSlug)
  if (!problem) {
    return undefined
  }
  return {
    slug: problem.slug,
    title: problem.title,
    href: `/practice/${problem.slug}`,
  }
}

export function getLessonSlugFromPracticeSlug(
  practiceSlug: string,
): string | undefined {
  return getPracticeProblem(practiceSlug)?.relatedLessonSlug
}

export type LessonLearningPathContext = {
  previousLesson?: LearningPathLessonRef
  currentLesson: LearningPathLessonRef
  nextLesson?: LearningPathLessonRef
  relatedPractice?: LearningPathPracticeRef
  comparison?: LearningPathLink
  recommendedPrerequisites: LearningPathLessonRef[]
}

export function getLessonLearningPathContext(
  lessonSlug: string,
): LessonLearningPathContext | undefined {
  const current = resolveLessonRef(lessonSlug)
  if (!current) {
    return undefined
  }

  return {
    previousLesson: getPreviousLessonInOrder(lessonSlug),
    currentLesson: current,
    nextLesson: getNextLessonInOrder(lessonSlug),
    relatedPractice: getRelatedPracticeForLesson(lessonSlug),
    comparison: getComparisonForLesson(lessonSlug),
    recommendedPrerequisites: getPrerequisitesForLesson(lessonSlug),
  }
}

/** Implemented comparison destinations used across the learning journey. */
export const learningComparisonPages: readonly LearningPathLink[] = [
  {
    title: 'Searching Comparison',
    href: '/algorithms/searching/comparison',
  },
  {
    title: 'Sorting Comparison',
    href: '/algorithms/sorting/comparison',
  },
  {
    title: 'Array & String Comparison',
    href: '/algorithms/array-string/comparison',
  },
] as const
