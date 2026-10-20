import {
  PRACTICE_DIFFICULTIES,
  type PracticeDifficulty,
  type PracticeFilterState,
} from '../../data/practice'
import { cn } from '../../lib/cn'
import { Button } from '../ui'

type PracticeFiltersProps = {
  filters: PracticeFilterState
  categories: string[]
  resultCount: number
  totalCount: number
  onChange: (next: PracticeFilterState) => void
  onClear: () => void
}

const selectClassName = cn(
  'h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground shadow-sm',
  'transition-theme',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
)

export function PracticeFilters({
  filters,
  categories,
  resultCount,
  totalCount,
  onChange,
  onClear,
}: PracticeFiltersProps) {
  const hasActiveFilters =
    filters.query.trim() !== '' ||
    filters.category !== 'all' ||
    filters.difficulty !== 'all'

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,1fr))]">
        <div className="min-w-0">
          <label
            htmlFor="practice-search"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Search
          </label>
          <input
            id="practice-search"
            type="search"
            value={filters.query}
            onChange={(event) =>
              onChange({ ...filters, query: event.target.value })
            }
            placeholder="Search by title or tags"
            className={selectClassName}
            autoComplete="off"
          />
        </div>

        <div className="min-w-0">
          <label
            htmlFor="practice-topic"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Topic
          </label>
          <select
            id="practice-topic"
            value={filters.category}
            onChange={(event) =>
              onChange({ ...filters, category: event.target.value })
            }
            className={selectClassName}
          >
            <option value="all">All topics</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-0">
          <label
            htmlFor="practice-difficulty"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Difficulty
          </label>
          <select
            id="practice-difficulty"
            value={filters.difficulty}
            onChange={(event) =>
              onChange({
                ...filters,
                difficulty: event.target.value as PracticeDifficulty | 'all',
              })
            }
            className={selectClassName}
          >
            <option value="all">All difficulties</option>
            {PRACTICE_DIFFICULTIES.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-body-sm text-muted-foreground" aria-live="polite">
          Showing {resultCount} of {totalCount}{' '}
          {totalCount === 1 ? 'problem' : 'problems'}
        </p>

        {hasActiveFilters ? (
          <Button type="button" variant="outline" size="sm" onClick={onClear}>
            Clear filters
          </Button>
        ) : null}
      </div>
    </div>
  )
}
