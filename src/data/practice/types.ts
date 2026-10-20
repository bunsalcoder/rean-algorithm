export type PracticeDifficulty = 'Beginner' | 'Intermediate' | 'Advanced'

export type PracticeLanguage = 'python' | 'javascript' | 'typescript'

export type PracticeExample = {
  input: string
  output: string
  explanation?: string
}

export type PracticeComplexity = {
  time: string
  space: string
  notes?: string[]
}

export type PracticeSolutions = Record<PracticeLanguage, string>

export type PracticeProblem = {
  id: string
  slug: string
  title: string
  difficulty: PracticeDifficulty
  category: string
  description: string
  examples: PracticeExample[]
  constraints: string[]
  hints: string[]
  approach: string[]
  complexity: PracticeComplexity
  solutions: PracticeSolutions
  relatedLessonSlug: string
  relatedLessonHref: string
  tags: string[]
}

export type PracticeFilterState = {
  query: string
  category: string
  difficulty: PracticeDifficulty | 'all'
}
