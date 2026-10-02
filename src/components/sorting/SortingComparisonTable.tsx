import {
  sortingComparisonAlgorithms,
  type SortingAlgorithmComparison,
} from '../../data/algorithms/sorting-comparison'
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

type SortingComparisonTableProps = {
  algorithms?: SortingAlgorithmComparison[]
  className?: string
}

export function SortingComparisonTable({
  algorithms = sortingComparisonAlgorithms,
  className,
}: SortingComparisonTableProps) {
  return (
    <div
      className={cn(
        'overflow-x-auto rounded-xl border border-border bg-surface shadow-sm',
        className,
      )}
    >
      <table className="min-w-[44rem] w-full border-collapse text-left text-sm">
        <caption className="sr-only">
          Comparison of six sorting algorithms by time complexity, space,
          stability, and in-place behavior
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
              Stable
            </th>
            <th
              scope="col"
              className="px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-4"
            >
              In-place
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
                {algorithm.bestTime}
              </td>
              <td className="px-3 py-3 font-mono text-xs text-foreground sm:px-4 sm:text-sm">
                {algorithm.averageTime}
              </td>
              <td className="px-3 py-3 font-mono text-xs text-foreground sm:px-4 sm:text-sm">
                {algorithm.worstTime}
              </td>
              <td className="px-3 py-3 font-mono text-xs text-foreground sm:px-4 sm:text-sm">
                {algorithm.space}
              </td>
              <td className="px-3 py-3 sm:px-4">
                <BooleanBadge
                  value={algorithm.stable}
                  yesLabel="Stable"
                  noLabel="Not Stable"
                />
              </td>
              <td className="px-3 py-3 sm:px-4">
                <BooleanBadge
                  value={algorithm.inPlace}
                  yesLabel="In-place"
                  noLabel="Not In-place"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
