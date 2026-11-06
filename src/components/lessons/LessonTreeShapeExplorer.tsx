import {
  BST_BALANCED_VALUES,
  BST_SKEWED_VALUES,
  height,
  search,
  size,
  snapshotFromArray,
} from '../../algorithms/data-structures/binarySearchTree'
import type { LessonTreeShapeExplorer as TreeShapeExplorerData } from '../../data/lessons/types'
import { cn } from '../../lib/cn'
import { BinarySearchTreeStaticView } from '../visualizations/BinarySearchTreePanels'
import { LessonSection, LessonSectionHeading } from './LessonSection'

type LessonTreeShapeExplorerProps = {
  explorer: TreeShapeExplorerData
}

/**
 * Side-by-side balanced vs skewed BST comparison for the lesson body.
 */
export function LessonTreeShapeExplorer({
  explorer,
}: LessonTreeShapeExplorerProps) {
  const balanced = snapshotFromArray(
    explorer.balanced.values.length > 0
      ? explorer.balanced.values
      : BST_BALANCED_VALUES,
  )
  const skewed = snapshotFromArray(
    explorer.skewed.values.length > 0
      ? explorer.skewed.values
      : BST_SKEWED_VALUES,
  )

  const balancedHeight = height(balanced)
  const skewedHeight = height(skewed)
  const probe = explorer.probeValue
  const balancedPath = search(balanced, probe).pathIds.length
  const skewedPath = search(skewed, probe).pathIds.length

  return (
    <LessonSection id="tree-shape-explorer">
      <LessonSectionHeading
        id="tree-shape-explorer"
        eyebrow="SHAPE"
        title="Tree Shape Explorer"
        description={explorer.description}
      />

      <div className="space-y-4">
        {explorer.paragraphs.map((paragraph) => (
          <p key={paragraph} className="text-body text-muted-foreground">
            {paragraph}
          </p>
        ))}

        <div className="grid gap-4 lg:grid-cols-2">
          <div
            className={cn(
              'rounded-xl border border-border bg-surface p-4 shadow-sm',
              'transition-theme',
            )}
          >
            <BinarySearchTreeStaticView
              snapshot={balanced}
              label={explorer.balanced.label}
            />
            <dl className="mt-3 grid grid-cols-2 gap-2 font-mono text-[0.75rem]">
              <div>
                <dt className="text-muted-foreground">nodes</dt>
                <dd className="text-foreground">{size(balanced)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">height</dt>
                <dd className="text-foreground">{balancedHeight}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">
                  search({probe}) path length
                </dt>
                <dd className="text-foreground">{balancedPath} nodes</dd>
              </div>
            </dl>
            <p className="mt-2 text-body-sm text-muted-foreground">
              Insert order:{' '}
              <span className="font-mono text-foreground">
                [{explorer.balanced.values.join(', ')}]
              </span>
            </p>
          </div>

          <div
            className={cn(
              'rounded-xl border border-border bg-surface p-4 shadow-sm',
              'transition-theme',
            )}
          >
            <BinarySearchTreeStaticView
              snapshot={skewed}
              label={explorer.skewed.label}
            />
            <dl className="mt-3 grid grid-cols-2 gap-2 font-mono text-[0.75rem]">
              <div>
                <dt className="text-muted-foreground">nodes</dt>
                <dd className="text-foreground">{size(skewed)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">height</dt>
                <dd className="text-foreground">{skewedHeight}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">
                  search({probe}) path length
                </dt>
                <dd className="text-foreground">{skewedPath} nodes</dd>
              </div>
            </dl>
            <p className="mt-2 text-body-sm text-muted-foreground">
              Insert order:{' '}
              <span className="font-mono text-foreground">
                [{explorer.skewed.values.join(', ')}]
              </span>
            </p>
          </div>
        </div>

        <p
          className={cn(
            'rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2',
            'text-body-sm text-amber-950 dark:text-amber-100',
          )}
        >
          {explorer.explanation}
        </p>
      </div>
    </LessonSection>
  )
}
