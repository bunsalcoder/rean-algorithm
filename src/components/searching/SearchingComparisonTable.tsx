import {
  searchingComparisonAlgorithms,
  type SearchingAlgorithmComparison,
} from '../../data/algorithms/searching-comparison'
import { cn } from '../../lib/cn'
import { Badge } from '../ui'

function BooleanBadge({
  value,
  yesLabel,
  noLabel,
}: {
  value: boolean
  yesLabel: string
  noLabel: string
}) {
  return (
    <Badge
      variant={value ? 'primary' : 'muted'}
      className="whitespace-nowrap text-[0.65rem]"
    >
      {value ? yesLabel : noLabel}
    </Badge>
  )
}

type SearchingComparisonTableProps = {
  algorithms?: SearchingAlgorithmComparison[]
  className?: string
}

export function SearchingComparisonTable({
  algorithms = searchingComparisonAlgorithms,
  className,
}: SearchingComparisonTableProps) {
  return (
    <div
      className={cn(
        'overflow-x-auto rounded-xl border border-border bg-surface shadow-sm',
        className,
      )}
    >
      <table className="min-w-[52rem] w-full border-collapse text-left text-sm">
        <caption className="sr-only">
          Comparison of five searching algorithms by time complexity, space,
          sorted-data requirement, numeric-data requirement, and strategy
        </caption>
        <thead>
          <tr className="border-b border-border bg-muted/60 dark:bg-muted/40">
            <th
              scope="col"
              className="sticky left-0 z-10 bg-muted/95 px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground dark:bg-muted/95 sm:px-4"
            >
              Algorithm
            </th>
            <th
              scope="col"
              className="px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-4"
            >
              Best
            </th>
            <th
              scope="col"
              className="px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-4"
            >
              Average
            </th>
            <th
              scope="col"
              className="px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-4"
            >
              Worst
            </th>
            <th
              scope="col"
              className="px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-4"
            >
              Space
            </th>
            <th
              scope="col"
              className="px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-4"
            >
              Sorted Required
            </th>
            <th
              scope="col"
              className="px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-4"
            >
              Numeric Data
            </th>
            <th
              scope="col"
              className="px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-4"
            >
              Strategy
            </th>
          </tr>
        </thead>
        <tbody>
          {algorithms.map((algorithm) => (
            <tr
              key={algorithm.slug}
              className="border-b border-border last:border-b-0 transition-theme hover:bg-muted/40"
            >
              <th
                scope="row"
                className="sticky left-0 z-10 bg-surface px-3 py-3 text-sm font-medium text-foreground sm:px-4"
              >
                {algorithm.name}
              </th>
              <td className="px-3 py-3 font-mono text-xs text-foreground sm:px-4 sm:text-sm">
                {algorithm.best}
              </td>
              <td className="px-3 py-3 font-mono text-xs text-foreground sm:px-4 sm:text-sm">
                {algorithm.average}
              </td>
              <td className="px-3 py-3 font-mono text-xs text-foreground sm:px-4 sm:text-sm">
                {algorithm.worst}
              </td>
              <td className="px-3 py-3 font-mono text-xs text-foreground sm:px-4 sm:text-sm">
                {algorithm.space}
              </td>
              <td className="px-3 py-3 sm:px-4">
                <BooleanBadge
                  value={algorithm.sortedRequired}
                  yesLabel="Yes"
                  noLabel="No"
                />
              </td>
              <td className="px-3 py-3 sm:px-4">
                <BooleanBadge
                  value={algorithm.numericRequired}
                  yesLabel="Yes"
                  noLabel="No"
                />
              </td>
              <td className="min-w-[12rem] px-3 py-3 text-xs text-muted-foreground sm:px-4 sm:text-sm">
                {algorithm.strategyLabel}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
