import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  dataStructures,
  getDataStructureById,
  type DataStructureId,
} from '../../data/data-structures'
import { cn } from '../../lib/cn'
import { Badge, Card } from '../ui'

type StructureExplorerProps = {
  className?: string
  /** Controlled selection for tests; defaults to arrays. */
  initialId?: DataStructureId
}

export function StructureExplorer({
  className,
  initialId = 'arrays',
}: StructureExplorerProps) {
  const listId = useId()
  const [selectedId, setSelectedId] = useState<DataStructureId>(initialId)
  const selected =
    getDataStructureById(selectedId) ?? getDataStructureById('arrays')!

  return (
    <div className={cn('grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-6', className)}>
      <div>
        <p id={`${listId}-label`} className="mb-3 text-body-sm text-muted-foreground">
          Choose a structure to inspect its purpose, operations, and trade-offs.
        </p>
        <div
          role="listbox"
          aria-labelledby={`${listId}-label`}
          aria-activedescendant={`${listId}-${selectedId}`}
          className="flex flex-wrap gap-2 lg:flex-col lg:flex-nowrap"
        >
          {dataStructures.map((structure) => {
            const isActive = structure.id === selectedId
            return (
              <button
                key={structure.id}
                id={`${listId}-${structure.id}`}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => setSelectedId(structure.id)}
                className={cn(
                  'inline-flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-theme',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  isActive
                    ? 'border-primary/40 bg-primary-muted text-foreground shadow-sm'
                    : 'border-border bg-surface text-muted-foreground hover:border-primary/25 hover:text-foreground',
                )}
              >
                <span>{structure.name}</span>
                {structure.availability === 'coming-soon' ? (
                  <Badge variant="muted" className="shrink-0 text-[0.6rem]">
                    Soon
                  </Badge>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      <Card
        className="p-5 sm:p-6 hover:border-primary/25"
        aria-live="polite"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-label text-primary">EXPLORER</p>
            <h3 className="mt-1 text-xl font-medium text-foreground">
              {selected.name}
            </h3>
          </div>
          <Badge
            variant={
              selected.availability === 'available' ? 'primary' : 'muted'
            }
            className="text-[0.65rem]"
          >
            {selected.availability === 'available'
              ? 'Available'
              : 'Coming Soon'}
          </Badge>
        </div>

        <p className="mt-4 text-body text-muted-foreground">
          {selected.description}
        </p>

        <dl className="mt-5 space-y-4">
          <div>
            <dt className="text-sm font-medium text-foreground">Purpose</dt>
            <dd className="mt-1 text-body-sm text-muted-foreground">
              {selected.useCase}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-foreground">
              How it organizes data
            </dt>
            <dd className="mt-1 text-body-sm text-muted-foreground">
              {selected.organization}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-foreground">
              Common operations
            </dt>
            <dd className="mt-2">
              <ul className="space-y-1.5 rounded-lg border border-border bg-muted/40 px-3 py-2.5 dark:bg-muted/25">
                {selected.operations.map((op) => (
                  <li
                    key={op.name}
                    className="flex flex-wrap items-baseline justify-between gap-2 text-sm"
                  >
                    <span className="text-muted-foreground">
                      {op.name}
                      {op.note ? (
                        <span className="mt-0.5 block text-xs text-muted-foreground/80">
                          {op.note}
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 font-mono text-foreground">
                      {op.complexity}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">
                {selected.complexityNote}
              </p>
            </dd>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-foreground">
                Advantages
              </dt>
              <dd className="mt-2">
                <ul className="list-disc space-y-1 pl-4 text-body-sm text-muted-foreground">
                  {selected.advantages.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-foreground">
                Limitations
              </dt>
              <dd className="mt-2">
                <ul className="list-disc space-y-1 pl-4 text-body-sm text-muted-foreground">
                  {selected.limitations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </dd>
            </div>
          </div>
          <div>
            <dt className="text-sm font-medium text-foreground">
              Practical use case
            </dt>
            <dd className="mt-1 text-body-sm text-muted-foreground">
              {selected.useCases[0]}
            </dd>
          </div>
        </dl>

        {selected.availability === 'available' && selected.href ? (
          <Link
            to={selected.href}
            className={cn(
              'mt-6 inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium',
              'bg-primary text-primary-foreground shadow-sm transition-theme hover:bg-primary-hover',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            )}
          >
            {selected.hrefLabel ?? `Learn more about ${selected.name}`}
          </Link>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">
            Related lessons for {selected.name} are not published yet.
          </p>
        )}
      </Card>
    </div>
  )
}
