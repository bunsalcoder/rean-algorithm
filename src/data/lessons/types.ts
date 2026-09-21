export type LessonDifficulty = 'Beginner' | 'Intermediate' | 'Advanced'

export type LessonStep = {
  title: string
  description: string
}

export type LessonLink = {
  title: string
  href: string
}

export type LessonVisualization = {
  title: string
  description: string
}

export type LessonComplexity = {
  time: {
    best: string
    average: string
    worst: string
  }
  space: string
}

export type LessonCode = {
  python: string
  javascript: string
  typescript: string
}

export type Lesson = {
  slug: string
  title: string
  description: string
  category: string
  difficulty: LessonDifficulty
  estimatedTime: string
  tags: string[]

  objectives: string[]
  overview: string[]
  whyItMatters: string[]

  visualization?: LessonVisualization

  steps: LessonStep[]

  complexity: LessonComplexity

  pseudocode: string
  code: LessonCode

  whenToUse: string[]
  whenNotToUse: string[]

  keyTakeaways: string[]

  previousLesson?: LessonLink
  nextLesson?: LessonLink
  categoryHref: string
}

export type LessonTocItem = {
  id: string
  label: string
}
