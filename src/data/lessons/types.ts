export type LessonDifficulty = 'Beginner' | 'Intermediate' | 'Advanced'

export type LessonStep = {
  title: string
  description: string
}

export type LessonLink = {
  title: string
  href: string
}

export type LessonVisualizationType =
  | 'placeholder'
  | 'binary-search'
  | 'bubble-sort'
  | 'selection-sort'

export type LessonVisualization = {
  title: string
  description: string
  type?: LessonVisualizationType
}

export type LessonComplexity = {
  time: {
    best: string
    average: string
    worst: string
  }
  space: string
  notes?: {
    time?: string[]
    space?: string[]
  }
}

export type LessonCode = {
  python: string
  javascript: string
  typescript: string
}

export type LessonSortedRequirement = {
  paragraphs: string[]
  sorted: number[]
  unsorted: number[]
  explanation: string
}

export type LessonThinkingGuide = {
  title: string
  description?: string
  steps: string[]
}

export type LessonBubbleConcept = {
  paragraphs: string[]
  before: number[]
  after: number[]
  bubbledValue: number
  explanation: string
}

export type LessonNestedLoops = {
  description?: string
  outerLoop: {
    title: string
    description: string
  }
  innerLoop: {
    title: string
    description: string
  }
  passShrink: string[]
  passShrinkTitle?: string
  passShrinkNote?: string
}

export type LessonSelectionConcept = {
  paragraphs: string[]
  before: number[]
  afterFirst: number[]
  afterSecond: number[]
  selectedValue: number
  secondSelectedValue: number
  explanation: string
}

export type LessonMinIndexNote = {
  paragraphs: string[]
  initialExample: string
  updateCondition: string
  keyInsight: string
}

export type LessonCommonMistake = {
  paragraphs: string[]
  incorrect: string[]
  correct: string[]
  explanation: string
}

export type LessonOptimizationNote = {
  paragraphs: string[]
  exampleArray: number[]
  bestCase: string
  explanation: string
}

export type LessonAlgorithmConnection = {
  title?: string
  eyebrow?: string
  description?: string
  items: {
    title: string
    description: string
  }[]
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

  sortedRequirement?: LessonSortedRequirement
  thinkingGuide?: LessonThinkingGuide
  bubbleConcept?: LessonBubbleConcept
  selectionConcept?: LessonSelectionConcept
  nestedLoops?: LessonNestedLoops
  minIndexNote?: LessonMinIndexNote
  commonMistake?: LessonCommonMistake
  optimizationNote?: LessonOptimizationNote
  algorithmConnection?: LessonAlgorithmConnection

  previousLesson?: LessonLink
  nextLesson?: LessonLink
  categoryHref: string
}

export type LessonTocItem = {
  id: string
  label: string
}
