import {
  searchingComparisonAlgorithms,
  type SearchingAlgorithmComparison,
} from '../../data/algorithms/searching-comparison'
import { cn } from '../../lib/cn'
import { Badge, Card } from '../ui'

type SearchingRequirementsMatrixProps = {
  algorithms?: SearchingAlgorithmComparison[]
  className?: string
}

export function SearchingRequirementsMatrix({
  algorithms = searchingComparisonAlgorithms,
  className,
}: SearchingRequirementsMatrixProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div
        className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm"
      >
        <table className="min-w-[28rem] w-full border-collapse text-left text-sm">
          <caption className="sr-only">
            Requirements matrix showing whether each searching algorithm needs
            sorted data and numeric data
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
                Sorted
              </th>
              <th
                scope="col"
                className="px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-4"
              >
                Numeric
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
                <td className="px-3 py-3 sm:px-4">
                  <Badge
                    variant={algorithm.sortedRequired ? 'primary' : 'muted'}
                    className="text-[0.65rem]"
                  >
                    {algorithm.sortedRequired ? 'Yes' : 'No'}
                  </Badge>
                </td>
                <td className="px-3 py-3 sm:px-4">
                  <Badge
                    variant={algorithm.numericRequired ? 'primary' : 'muted'}
                    className="text-[0.65rem]"
                  >
                    {algorithm.numericRequired ? 'Yes' : 'No'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {algorithms.map((algorithm) => (
          <li key={algorithm.slug}>
            <Card className="h-full p-4 hover:border-primary/25">
              <p className="text-sm font-medium text-foreground">
                {algorithm.name}
              </p>
              <p className="mt-1.5 text-body-sm text-muted-foreground">
                {algorithm.numericRequirementNote}
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
