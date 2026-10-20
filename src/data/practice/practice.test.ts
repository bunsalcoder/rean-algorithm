import { describe, expect, it, vi } from 'vitest'
import { getLesson } from '../lessons'
import {
  PRACTICE_LANGUAGES,
  areAllHintsRevealed,
  copyTextToClipboard,
  filterPracticeProblems,
  getAdjacentPracticeProblems,
  getPracticeProblem,
  getPracticeProblemByLessonSlug,
  getSolutionForLanguage,
  getVisibleHints,
  nextHintRevealCount,
  practiceProblems,
  practiceRelatedLessonExists,
  toggleSlugInSet,
} from './index'

describe('practice problem data', () => {
  it('has unique ids and slugs', () => {
    const ids = practiceProblems.map((problem) => problem.id)
    const slugs = practiceProblems.map((problem) => problem.slug)

    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(practiceProblems.length).toBeGreaterThanOrEqual(8)
    expect(practiceProblems.length).toBeLessThanOrEqual(10)
  })

  it('links every problem to an existing lesson route', () => {
    for (const problem of practiceProblems) {
      expect(
        practiceRelatedLessonExists(problem),
        `${problem.slug} → ${problem.relatedLessonSlug}`,
      ).toBe(true)
      expect(getLesson(problem.relatedLessonSlug)?.slug).toBe(
        problem.relatedLessonSlug,
      )
      expect(problem.relatedLessonHref).toBe(
        `/learn/${problem.relatedLessonSlug}`,
      )
    }
  })

  it('includes complete content and all three reference solutions', () => {
    for (const problem of practiceProblems) {
      expect(problem.title.trim().length).toBeGreaterThan(0)
      expect(problem.description.trim().length).toBeGreaterThan(0)
      expect(problem.examples.length).toBeGreaterThan(0)
      expect(problem.constraints.length).toBeGreaterThan(0)
      expect(problem.hints.length).toBeGreaterThan(0)
      expect(problem.approach.length).toBeGreaterThan(0)
      expect(problem.complexity.time.trim().length).toBeGreaterThan(0)
      expect(problem.complexity.space.trim().length).toBeGreaterThan(0)
      expect(problem.tags.length).toBeGreaterThan(0)

      for (const language of PRACTICE_LANGUAGES) {
        const code = problem.solutions[language.id]
        expect(code.trim().length).toBeGreaterThan(0)
      }

      for (const example of problem.examples) {
        expect(example.input.trim().length).toBeGreaterThan(0)
        expect(example.output.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('resolves known slugs and returns undefined for unknown ones', () => {
    const first = practiceProblems[0]!
    expect(getPracticeProblem(first.slug)?.id).toBe(first.id)
    expect(getPracticeProblem('does-not-exist')).toBeUndefined()
  })

  it('resolves problems by related lesson slug', () => {
    const first = practiceProblems[0]!
    expect(getPracticeProblemByLessonSlug(first.relatedLessonSlug)?.slug).toBe(
      first.slug,
    )
    expect(getPracticeProblemByLessonSlug('missing-lesson')).toBeUndefined()
  })
})

describe('practice filters and search', () => {
  it('filters by topic and difficulty together with search', () => {
    const filtered = filterPracticeProblems(practiceProblems, {
      query: 'anagram',
      category: 'Array & String',
      difficulty: 'Beginner',
    })

    expect(filtered.length).toBeGreaterThan(0)
    for (const problem of filtered) {
      expect(problem.category).toBe('Array & String')
      expect(problem.difficulty).toBe('Beginner')
      const haystack = `${problem.title} ${problem.tags.join(' ')}`.toLowerCase()
      expect(haystack.includes('anagram')).toBe(true)
    }
  })

  it('returns an empty list when filters match nothing', () => {
    const filtered = filterPracticeProblems(practiceProblems, {
      query: 'zzzz-not-a-real-tag',
      category: 'all',
      difficulty: 'all',
    })

    expect(filtered).toEqual([])
  })

  it('matches tags case-insensitively', () => {
    const filtered = filterPracticeProblems(practiceProblems, {
      query: 'BINARY-SEARCH',
      category: 'all',
      difficulty: 'all',
    })

    expect(filtered.some((problem) => problem.slug === 'find-target-sorted-array')).toBe(
      true,
    )
  })
})

describe('practice interactions helpers', () => {
  it('reveals hints progressively', () => {
    const hints = ['one', 'two', 'three']

    expect(getVisibleHints(hints, 0)).toEqual([])
    expect(getVisibleHints(hints, 1)).toEqual(['one'])
    expect(getVisibleHints(hints, 2)).toEqual(['one', 'two'])
    expect(nextHintRevealCount(0, hints.length)).toBe(1)
    expect(nextHintRevealCount(2, hints.length)).toBe(3)
    expect(nextHintRevealCount(3, hints.length)).toBe(3)
    expect(areAllHintsRevealed(2, hints.length)).toBe(false)
    expect(areAllHintsRevealed(3, hints.length)).toBe(true)
  })

  it('selects the solution for the active language', () => {
    const problem = practiceProblems[0]!

    expect(getSolutionForLanguage(problem, 'python')).toBe(
      problem.solutions.python,
    )
    expect(getSolutionForLanguage(problem, 'javascript')).toBe(
      problem.solutions.javascript,
    )
    expect(getSolutionForLanguage(problem, 'typescript')).toBe(
      problem.solutions.typescript,
    )
    expect(getSolutionForLanguage(problem, 'python')).not.toBe(
      problem.solutions.javascript,
    )
  })

  it('updates session completion state through a pure toggle', () => {
    let completed = new Set<string>()
    completed = toggleSlugInSet(completed, 'find-an-element')
    expect(completed.has('find-an-element')).toBe(true)
    completed = toggleSlugInSet(completed, 'find-an-element')
    expect(completed.has('find-an-element')).toBe(false)
  })

  it('copies the currently selected solution text', async () => {
    const problem = practiceProblems[0]!
    const selected = getSolutionForLanguage(problem, 'typescript')
    const writeText = vi.fn().mockResolvedValue(undefined)

    vi.stubGlobal('navigator', {
      clipboard: { writeText },
    })

    const succeeded = await copyTextToClipboard(selected)

    expect(succeeded).toBe(true)
    expect(writeText).toHaveBeenCalledWith(selected)

    vi.unstubAllGlobals()
  })

  it('reports failure when clipboard APIs are unavailable', async () => {
    vi.stubGlobal('navigator', {})
    vi.stubGlobal('document', undefined)

    await expect(copyTextToClipboard('code')).resolves.toBe(false)

    vi.unstubAllGlobals()
  })

  it('provides previous and next neighbors in library order', () => {
    const first = practiceProblems[0]!
    const last = practiceProblems[practiceProblems.length - 1]!
    const middle = practiceProblems[1]!

    expect(getAdjacentPracticeProblems(first.slug).previous).toBeUndefined()
    expect(getAdjacentPracticeProblems(first.slug).next?.slug).toBe(
      practiceProblems[1]?.slug,
    )
    expect(getAdjacentPracticeProblems(last.slug).next).toBeUndefined()
    expect(getAdjacentPracticeProblems(middle.slug).previous?.slug).toBe(
      first.slug,
    )
  })
})
