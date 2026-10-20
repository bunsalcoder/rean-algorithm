import { getLesson } from '../lessons'
import { practiceProblems } from './problems'
import type {
  PracticeDifficulty,
  PracticeFilterState,
  PracticeLanguage,
  PracticeProblem,
} from './types'

export type {
  PracticeComplexity,
  PracticeDifficulty,
  PracticeExample,
  PracticeFilterState,
  PracticeLanguage,
  PracticeProblem,
  PracticeSolutions,
} from './types'

export { practiceProblems }

export {
  VALIDATION_MODE_LABEL,
  VALIDATION_MODE_LIMITATIONS,
  getProblemValidationSupport,
  getTestCasesForProblem,
  isValidationSupported,
  listCheckExampleAnswerSlugs,
  listSupportedValidationSlugs,
  summarizeValidationResults,
  validateCandidateAnswer,
  validateWithTrustedReference,
} from './validation'

const problemsBySlug = new Map(
  practiceProblems.map((problem) => [problem.slug, problem]),
)

const problemsByLessonSlug = new Map(
  practiceProblems.map((problem) => [problem.relatedLessonSlug, problem]),
)

export const PRACTICE_LANGUAGES: {
  id: PracticeLanguage
  label: string
}[] = [
  { id: 'python', label: 'Python' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
]

export const PRACTICE_DIFFICULTIES: PracticeDifficulty[] = [
  'Beginner',
  'Intermediate',
  'Advanced',
]

export function getPracticeProblem(slug: string): PracticeProblem | undefined {
  return problemsBySlug.get(slug)
}

export function getPracticeProblemByLessonSlug(
  lessonSlug: string,
): PracticeProblem | undefined {
  return problemsByLessonSlug.get(lessonSlug)
}

export function getPracticeCategories(
  problems: PracticeProblem[] = practiceProblems,
): string[] {
  return [...new Set(problems.map((problem) => problem.category))].sort()
}

export function getAdjacentPracticeProblems(slug: string): {
  previous?: PracticeProblem
  next?: PracticeProblem
} {
  const index = practiceProblems.findIndex((problem) => problem.slug === slug)

  if (index === -1) {
    return {}
  }

  return {
    previous: index > 0 ? practiceProblems[index - 1] : undefined,
    next:
      index < practiceProblems.length - 1
        ? practiceProblems[index + 1]
        : undefined,
  }
}

export function filterPracticeProblems(
  problems: PracticeProblem[],
  filters: PracticeFilterState,
): PracticeProblem[] {
  const query = filters.query.trim().toLowerCase()

  return problems.filter((problem) => {
    if (
      filters.category !== 'all' &&
      problem.category !== filters.category
    ) {
      return false
    }

    if (
      filters.difficulty !== 'all' &&
      problem.difficulty !== filters.difficulty
    ) {
      return false
    }

    if (!query) {
      return true
    }

    const haystack = [
      problem.title,
      problem.category,
      ...problem.tags,
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(query)
  })
}

export function getVisibleHints(
  hints: string[],
  revealedCount: number,
): string[] {
  const safeCount = Math.max(0, Math.min(revealedCount, hints.length))
  return hints.slice(0, safeCount)
}

export function nextHintRevealCount(
  revealedCount: number,
  totalHints: number,
): number {
  if (totalHints <= 0) {
    return 0
  }

  return Math.min(revealedCount + 1, totalHints)
}

export function areAllHintsRevealed(
  revealedCount: number,
  totalHints: number,
): boolean {
  return totalHints > 0 && revealedCount >= totalHints
}

export function getSolutionForLanguage(
  problem: PracticeProblem,
  language: PracticeLanguage,
): string {
  return problem.solutions[language]
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
  ) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Fall through to legacy path.
    }
  }

  if (typeof document === 'undefined') {
    return false
  }

  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    const succeeded = document.execCommand('copy')
    document.body.removeChild(textarea)
    return succeeded
  } catch {
    return false
  }
}

export function practiceRelatedLessonExists(problem: PracticeProblem): boolean {
  return getLesson(problem.relatedLessonSlug) !== undefined
}

/** Pure helper for session completion toggles (no persistence). */
export function toggleSlugInSet(
  slugs: ReadonlySet<string>,
  slug: string,
): Set<string> {
  const next = new Set(slugs)
  if (next.has(slug)) {
    next.delete(slug)
  } else {
    next.add(slug)
  }
  return next
}
