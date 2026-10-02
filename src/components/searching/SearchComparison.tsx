import {
  searchComparisonRows,
  type SearchingAlgorithm,
} from '../../data/algorithms/searching'
import { cn } from '../../lib/cn'
import { Card } from '../ui'

type SearchComparisonProps = {
  linear: SearchingAlgorithm
  binary: SearchingAlgorithm
  className?: string
}

function CompactCells({
  values,
  activeIndex,
  label,
}: {
  values: readonly number[]
  activeIndex?: number
  label: string
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      role="img"
      aria-label={label}
    >
      {values.map((value, index) => (
        <span
          key={`${value}-${index}`}
          className={cn(
            'inline-flex size-8 items-center justify-center rounded-md border font-mono text-xs font-medium sm:size-9 sm:text-sm',
            activeIndex === index
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-muted text-foreground',
          )}
        >
          {value}
        </span>
      ))}
    </div>
  )
}

export function SearchComparison({
  linear,
  binary,
  className,
}: SearchComparisonProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        <table className="min-w-[36rem] w-full border-collapse text-left text-sm">
          <caption className="sr-only">
            Comparison of Linear Search and Binary Search properties
          </caption>
          <thead>
            <tr className="border-b border-border bg-muted/60 dark:bg-muted/40">
              <th
                scope="col"
                className="sticky left-0 z-10 bg-muted/95 px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground dark:bg-muted/95 sm:px-4"
              >
                Property
              </th>
              <th
                scope="col"
                className="px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-4"
              >
                {linear.name}
              </th>
              <th
                scope="col"
                className="px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-4"
              >
                {binary.name}
              </th>
            </tr>
          </thead>
          <tbody>
            {searchComparisonRows.map((row) => (
              <tr
                key={row.property}
                className="border-b border-border last:border-b-0"
              >
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-surface px-3 py-3 text-left text-sm font-medium text-foreground sm:px-4"
                >
                  {row.property}
                </th>
                <td className="px-3 py-3 text-muted-foreground sm:px-4">
                  <span
                    className={
                      row.property === 'Best' ||
                      row.property === 'Average' ||
                      row.property === 'Worst'
                        ? 'font-mono text-foreground'
                        : undefined
                    }
                  >
                    {row.linear}
                  </span>
                </td>
                <td className="px-3 py-3 text-muted-foreground sm:px-4">
                  <span
                    className={
                      row.property === 'Best' ||
                      row.property === 'Average' ||
                      row.property === 'Worst'
                        ? 'font-mono text-foreground'
                        : undefined
                    }
                  >
                    {row.binary}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground sm:hidden">
        Scroll horizontally to see every column on smaller screens.
      </p>

      <p className="max-w-3xl text-body-sm text-muted-foreground sm:text-body">
        The right choice depends on whether the data is sorted and what
        preprocessing or maintenance costs are acceptable. Binary Search is
        not universally better — it is better under the conditions that make
        its assumptions true.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5 hover:border-primary/25 sm:p-6">
          <p className="text-label text-primary">LINEAR SEARCH</p>
          <h3 className="mt-2 text-base font-medium text-foreground">
            Check one at a time
          </h3>
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {[10, 25, 7, 42].map((value, index) => (
              <span key={value} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'inline-flex size-9 items-center justify-center rounded-md border font-mono text-sm font-medium',
                    index === 3
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-muted text-foreground',
                  )}
                >
                  {value}
                </span>
                {index < 3 ? (
                  <span aria-hidden="true" className="text-primary">
                    →
                  </span>
                ) : null}
              </span>
            ))}
          </div>
          <p className="mt-3 text-body-sm text-muted-foreground">
            Visit each element until the target matches or the array ends.
          </p>
        </Card>

        <Card className="p-5 hover:border-primary/25 sm:p-6">
          <p className="text-label text-primary">BINARY SEARCH</p>
          <h3 className="mt-2 text-base font-medium text-foreground">
            Eliminate half of the remaining search space
          </h3>
          <div className="mt-4 space-y-3">
            <div>
              <CompactCells
                values={[3, 7, 12, 18, 24, 31, 42, 56, 68]}
                activeIndex={6}
                label="Full sorted array with target 42 highlighted"
              />
              <p aria-hidden="true" className="mt-1 text-center text-primary">
                ↓
              </p>
            </div>
            <div>
              <CompactCells
                values={[42, 56, 68]}
                activeIndex={0}
                label="Right half remaining after eliminating the left side"
              />
              <p aria-hidden="true" className="mt-1 text-center text-primary">
                ↓
              </p>
            </div>
            <CompactCells
              values={[42]}
              activeIndex={0}
              label="Target found after range reduction"
            />
          </div>
        </Card>
      </div>
    </div>
  )
}
