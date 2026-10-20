import { useState } from 'react'
import {
  areAllHintsRevealed,
  getVisibleHints,
  nextHintRevealCount,
} from '../../data/practice'
import { Button, Card } from '../ui'

type PracticeHintsProps = {
  hints: string[]
}

export function PracticeHints({ hints }: PracticeHintsProps) {
  const [revealedCount, setRevealedCount] = useState(0)
  const visibleHints = getVisibleHints(hints, revealedCount)
  const allRevealed = areAllHintsRevealed(revealedCount, hints.length)

  return (
    <section aria-labelledby="practice-hints-heading">
      <h2
        id="practice-hints-heading"
        className="text-xl font-medium text-foreground sm:text-2xl"
      >
        Hints
      </h2>
      <p className="mt-2 text-body-sm text-muted-foreground">
        Reveal one hint at a time. Later hints are more specific.
      </p>

      <Card className="mt-4 space-y-4 p-5 hover:border-border hover:shadow-sm sm:p-6">
        {visibleHints.length === 0 ? (
          <p className="text-body-sm text-muted-foreground">
            No hints revealed yet.
          </p>
        ) : (
          <ol className="space-y-3">
            {visibleHints.map((hint, index) => (
              <li
                key={`hint-${index}`}
                className="rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-body-sm text-foreground dark:bg-muted/25"
              >
                <span className="font-medium text-primary">
                  Hint {index + 1}.
                </span>{' '}
                {hint}
              </li>
            ))}
          </ol>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {allRevealed ? (
            <p className="text-body-sm text-muted-foreground" role="status">
              All {hints.length} hints are visible.
            </p>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                setRevealedCount((current) =>
                  nextHintRevealCount(current, hints.length),
                )
              }
            >
              Reveal next hint
            </Button>
          )}
        </div>
      </Card>
    </section>
  )
}
