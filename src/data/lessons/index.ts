import { binarySearch } from './binary-search'
import { bubbleSort } from './bubble-sort'
import { insertionSort } from './insertion-sort'
import { introductionToAlgorithms } from './introduction-to-algorithms'
import { selectionSort } from './selection-sort'
import type { Lesson, LessonTocItem } from './types'

export type {
  Lesson,
  LessonDifficulty,
  LessonTocItem,
  LessonSortedRequirement,
  LessonThinkingGuide,
  LessonBubbleConcept,
  LessonSelectionConcept,
  LessonInsertionConcept,
  LessonInsertionMechanics,
  LessonNestedLoops,
  LessonMinIndexNote,
  LessonCommonMistake,
  LessonCommonMistakesList,
  LessonSortProperties,
  LessonOptimizationNote,
  LessonAlgorithmConnection,
} from './types'

export const lessons: Lesson[] = [
  introductionToAlgorithms,
  binarySearch,
  bubbleSort,
  selectionSort,
  insertionSort,
]

const lessonsBySlug = new Map(lessons.map((lesson) => [lesson.slug, lesson]))

export function getLesson(slug: string): Lesson | undefined {
  return lessonsBySlug.get(slug)
}

/** Table of contents entries derived from a lesson's available sections. */
export function getLessonToc(lesson: Lesson): LessonTocItem[] {
  const items: LessonTocItem[] = [
    { id: 'objectives', label: 'Objectives' },
    { id: 'overview', label: 'Overview' },
    { id: 'why-it-matters', label: 'Why It Matters' },
  ]

  if (lesson.visualization) {
    items.push({ id: 'visualization', label: 'Visual Explanation' })
  }

  items.push({ id: 'steps', label: 'Step by Step' })

  if (lesson.bubbleConcept) {
    items.push({ id: 'bubble-concept', label: 'Core Idea' })
  }

  if (lesson.selectionConcept) {
    items.push({ id: 'selection-concept', label: 'Core Idea' })
  }

  if (lesson.insertionConcept) {
    items.push({ id: 'insertion-concept', label: 'Core Idea' })
  }

  if (lesson.nestedLoops) {
    items.push({ id: 'nested-loops', label: 'The Two Loops' })
  }

  if (lesson.insertionMechanics) {
    items.push({ id: 'insertion-mechanics', label: 'Mechanics' })
  }

  if (lesson.minIndexNote) {
    items.push({ id: 'min-index', label: 'minIndex' })
  }

  if (lesson.sortedRequirement) {
    items.push({ id: 'sorted-requirement', label: 'Sorted Array' })
  }

  if (lesson.thinkingGuide) {
    items.push({ id: 'thinking-guide', label: 'How to Think' })
  }

  items.push({ id: 'complexity', label: 'Complexity' })

  if (lesson.sortProperties) {
    items.push({ id: 'sort-properties', label: 'Properties' })
  }

  if (lesson.optimizationNote) {
    items.push({ id: 'optimization', label: 'Optimization' })
  }

  if (lesson.commonMistake) {
    items.push({ id: 'common-mistake', label: 'Common Mistake' })
  }

  if (lesson.commonMistakes) {
    items.push({ id: 'common-mistakes', label: 'Common Mistakes' })
  }

  items.push(
    { id: 'pseudocode', label: 'Pseudocode' },
    { id: 'code', label: 'Code Examples' },
  )

  if (lesson.algorithmConnection) {
    items.push({
      id: 'algorithm-connection',
      label: lesson.algorithmConnection.title ?? 'Search vs Sort',
    })
  }

  items.push(
    { id: 'when-to-use', label: 'When to Use' },
    { id: 'when-not-to-use', label: 'When Not to Use' },
    { id: 'key-takeaways', label: 'Key Takeaways' },
    { id: 'related-practice', label: 'Practice' },
  )

  return items
}
