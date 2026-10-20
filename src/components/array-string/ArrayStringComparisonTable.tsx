import { Link } from 'react-router-dom'
import {
  getImplementedArrayStringComparisons,
  type ArrayStringAlgorithmComparison,
} from '../../data/algorithms/array-string-comparison'
import { cn } from '../../lib/cn'

type ArrayStringComparisonTableProps = {
  algorithms?: ArrayStringAlgorithmComparison[]
  className?: string
}

export function ArrayStringComparisonTable({
  algorithms = getImplementedArrayStringComparisons(),
  className,
}: ArrayStringComparisonTableProps) {
  return (
    <div
      className={cn(
        'overflow-x-auto rounded-xl border border-border bg-surface shadow-sm',
        className,
      )}
    >
      <table className="min-w-[64rem] w-full border-collapse text-left text-sm">
        <caption className="sr-only">
          Comparison of implemented Array and String algorithms by technique,
          time complexity, auxiliary space, requirements, use cases, and lesson
          links
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
              Main technique
            </th>
            <th
              scope="col"
              className="px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-4"
            >
              Typical time
            </th>
            <th
              scope="col"
              className="px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-4"
            >
              Auxiliary space
            </th>
            <th
              scope="col"
              className="px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-4"
            >
              Important requirement
            </th>
            <th
              scope="col"
              className="px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-4"
            >
              Example use case
            </th>
            <th
              scope="col"
              className="px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-4"
            >
              Lesson
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
              <td className="min-w-[9rem] px-3 py-3 text-xs text-muted-foreground sm:px-4 sm:text-sm">
                {algorithm.technique}
              </td>
              <td className="px-3 py-3 font-mono text-xs text-foreground sm:px-4 sm:text-sm">
                <span className="block">{algorithm.timeComplexity}</span>
                {algorithm.timeNote ? (
                  <span className="mt-1 block max-w-[14rem] font-sans text-[0.7rem] leading-snug text-muted-foreground">
                    {algorithm.timeNote}
                  </span>
                ) : null}
              </td>
              <td className="px-3 py-3 font-mono text-xs text-foreground sm:px-4 sm:text-sm">
                <span className="block">{algorithm.spaceComplexity}</span>
                {algorithm.spaceNote ? (
                  <span className="mt-1 block max-w-[14rem] font-sans text-[0.7rem] leading-snug text-muted-foreground">
                    {algorithm.spaceNote}
                  </span>
                ) : null}
              </td>
              <td className="min-w-[12rem] px-3 py-3 text-xs text-muted-foreground sm:px-4 sm:text-sm">
                {algorithm.requirement}
              </td>
              <td className="min-w-[10rem] px-3 py-3 text-xs text-muted-foreground sm:px-4 sm:text-sm">
                {algorithm.exampleUseCase}
              </td>
              <td className="px-3 py-3 sm:px-4">
                <Link
                  to={algorithm.lessonHref}
                  className={cn(
                    'text-sm font-medium text-primary whitespace-nowrap',
                    'transition-theme hover:text-primary-hover',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  )}
                >
                  Open →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
