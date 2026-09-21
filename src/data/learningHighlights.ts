export type HighlightIconName =
  | 'explanations'
  | 'visual'
  | 'complexity'
  | 'practice'

export type HighlightAccent = 'violet' | 'indigo' | 'blue' | 'fuchsia'

export type LearningHighlight = {
  title: string
  description: string
  icon: HighlightIconName
  accent: HighlightAccent
}

export const learningHighlights: LearningHighlight[] = [
  {
    title: 'Clear Explanations',
    description:
      'Understand what an algorithm does, why it works, and when you should use it.',
    icon: 'explanations',
    accent: 'violet',
  },
  {
    title: 'Visual Learning',
    description:
      'See algorithms in action with interactive diagrams and step-by-step animations.',
    icon: 'visual',
    accent: 'indigo',
  },
  {
    title: 'Complexity Made Simple',
    description:
      'Learn Big O notation by seeing how time and space complexity change as input grows.',
    icon: 'complexity',
    accent: 'blue',
  },
  {
    title: 'Practice What You Learn',
    description:
      'Reinforce your understanding with examples, exercises, and algorithm challenges.',
    icon: 'practice',
    accent: 'fuchsia',
  },
]

export const learningPathSteps = [
  'Learn',
  'Visualize',
  'Practice',
  'Understand',
] as const
