import type { PracticeDifficulty } from '../../data/practice'
import { cn } from '../../lib/cn'
import { Badge } from '../ui'

const difficultyLabel: Record<PracticeDifficulty, string> = {
  Beginner: 'Beginner difficulty',
  Intermediate: 'Intermediate difficulty',
  Advanced: 'Advanced difficulty',
}

export function PracticeDifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: PracticeDifficulty
  className?: string
}) {
  return (
    <Badge
      variant={difficulty === 'Beginner' ? 'primary' : 'default'}
      className={cn(className)}
      aria-label={difficultyLabel[difficulty]}
    >
      {difficulty}
    </Badge>
  )
}
