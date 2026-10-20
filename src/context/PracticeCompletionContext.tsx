import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  addSlugToSet,
  createActivityEvent,
  getPracticeProblem,
  prependActivityEvent,
  removeSlugFromSet,
  toggleSlugInSet,
  type PracticeActivityEvent,
} from '../data/practice'

type PracticeCompletionContextValue = {
  completedSlugs: ReadonlySet<string>
  attemptedSlugs: ReadonlySet<string>
  recentActivity: readonly PracticeActivityEvent[]
  isCompleted: (slug: string) => boolean
  isAttempted: (slug: string) => boolean
  markCompleted: (slug: string) => void
  markIncomplete: (slug: string) => void
  toggleCompleted: (slug: string) => void
  /** Record a structured candidate-answer check (not trusted-reference runs). */
  recordAnswerCheck: (slug: string) => void
  /** Record that the learner opened a problem page this session. */
  recordVisit: (slug: string) => void
  /**
   * Clears session completion, attempts, and activity only.
   * Does not touch lesson content or algorithm data.
   */
  resetSession: () => void
}

const PracticeCompletionContext =
  createContext<PracticeCompletionContextValue | null>(null)

function resolveTitle(slug: string): string {
  return getPracticeProblem(slug)?.title ?? slug
}

export function PracticeCompletionProvider({
  children,
}: {
  children: ReactNode
}) {
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(
    () => new Set(),
  )
  const [attemptedSlugs, setAttemptedSlugs] = useState<Set<string>>(
    () => new Set(),
  )
  const [recentActivity, setRecentActivity] = useState<PracticeActivityEvent[]>(
    () => [],
  )

  const pushActivity = useCallback(
    (kind: PracticeActivityEvent['kind'], slug: string) => {
      const event = createActivityEvent({
        kind,
        problemSlug: slug,
        problemTitle: resolveTitle(slug),
      })
      setRecentActivity((current) => prependActivityEvent(current, event))
    },
    [],
  )

  const isCompleted = useCallback(
    (slug: string) => completedSlugs.has(slug),
    [completedSlugs],
  )

  const isAttempted = useCallback(
    (slug: string) => attemptedSlugs.has(slug),
    [attemptedSlugs],
  )

  const markCompleted = useCallback(
    (slug: string) => {
      let didAdd = false
      setCompletedSlugs((current) => {
        if (current.has(slug)) {
          return current
        }
        didAdd = true
        return addSlugToSet(current, slug)
      })
      if (didAdd) {
        pushActivity('completed', slug)
      }
    },
    [pushActivity],
  )

  const markIncomplete = useCallback(
    (slug: string) => {
      let didRemove = false
      setCompletedSlugs((current) => {
        if (!current.has(slug)) {
          return current
        }
        didRemove = true
        return removeSlugFromSet(current, slug)
      })
      if (didRemove) {
        pushActivity('incomplete', slug)
      }
    },
    [pushActivity],
  )

  const toggleCompleted = useCallback(
    (slug: string) => {
      let nextCompleted = false
      setCompletedSlugs((current) => {
        const next = toggleSlugInSet(current, slug)
        nextCompleted = next.has(slug)
        return next
      })
      pushActivity(nextCompleted ? 'completed' : 'incomplete', slug)
    },
    [pushActivity],
  )

  const recordAnswerCheck = useCallback(
    (slug: string) => {
      setAttemptedSlugs((current) => addSlugToSet(current, slug))
      pushActivity('checked_answer', slug)
    },
    [pushActivity],
  )

  const recordVisit = useCallback(
    (slug: string) => {
      pushActivity('visited', slug)
    },
    [pushActivity],
  )

  const resetSession = useCallback(() => {
    setCompletedSlugs(new Set())
    setAttemptedSlugs(new Set())
    setRecentActivity([])
  }, [])

  const value = useMemo<PracticeCompletionContextValue>(
    () => ({
      completedSlugs,
      attemptedSlugs,
      recentActivity,
      isCompleted,
      isAttempted,
      markCompleted,
      markIncomplete,
      toggleCompleted,
      recordAnswerCheck,
      recordVisit,
      resetSession,
    }),
    [
      attemptedSlugs,
      completedSlugs,
      isAttempted,
      isCompleted,
      markCompleted,
      markIncomplete,
      recentActivity,
      recordAnswerCheck,
      recordVisit,
      resetSession,
      toggleCompleted,
    ],
  )

  return (
    <PracticeCompletionContext.Provider value={value}>
      {children}
    </PracticeCompletionContext.Provider>
  )
}

export function usePracticeCompletion(): PracticeCompletionContextValue {
  const context = useContext(PracticeCompletionContext)

  if (!context) {
    throw new Error(
      'usePracticeCompletion must be used within PracticeCompletionProvider',
    )
  }

  return context
}
