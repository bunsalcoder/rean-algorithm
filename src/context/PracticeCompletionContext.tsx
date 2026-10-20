import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type PracticeCompletionContextValue = {
  completedSlugs: ReadonlySet<string>
  isCompleted: (slug: string) => boolean
  markCompleted: (slug: string) => void
  markIncomplete: (slug: string) => void
  toggleCompleted: (slug: string) => void
}

const PracticeCompletionContext =
  createContext<PracticeCompletionContextValue | null>(null)

export function PracticeCompletionProvider({
  children,
}: {
  children: ReactNode
}) {
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(
    () => new Set(),
  )

  const value = useMemo<PracticeCompletionContextValue>(() => {
    return {
      completedSlugs,
      isCompleted: (slug: string) => completedSlugs.has(slug),
      markCompleted: (slug: string) => {
        setCompletedSlugs((current) => {
          if (current.has(slug)) {
            return current
          }
          const next = new Set(current)
          next.add(slug)
          return next
        })
      },
      markIncomplete: (slug: string) => {
        setCompletedSlugs((current) => {
          if (!current.has(slug)) {
            return current
          }
          const next = new Set(current)
          next.delete(slug)
          return next
        })
      },
      toggleCompleted: (slug: string) => {
        setCompletedSlugs((current) => {
          const next = new Set(current)
          if (next.has(slug)) {
            next.delete(slug)
          } else {
            next.add(slug)
          }
          return next
        })
      },
    }
  }, [completedSlugs])

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
