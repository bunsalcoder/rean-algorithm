import {
  formatBucket,
  formatKey,
  formatValue,
  type HashTableEntry,
  type HashTableSnapshot,
} from '../../algorithms/data-structures/hashTable'
import {
  parseHashTableSnapshot,
  type HashTablePhase,
} from '../../algorithms/data-structures/hashTableSteps'
import { cn } from '../../lib/cn'
import type { VisualizationStep } from './types'

type HashTablePanelsProps = {
  step: VisualizationStep | undefined
  className?: string
}

function readString(
  meta: VisualizationStep['meta'],
  key: string,
): string | null {
  const value = meta?.[key]
  return typeof value === 'string' ? value : null
}

function readNumber(
  meta: VisualizationStep['meta'],
  key: string,
): number | null {
  const value = meta?.[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function readBoolean(
  meta: VisualizationStep['meta'],
  key: string,
): boolean {
  const value = meta?.[key]
  return value === true
}

function readPhase(meta: VisualizationStep['meta']): HashTablePhase | null {
  const value = meta?.phase
  return typeof value === 'string' ? (value as HashTablePhase) : null
}

function entryTone(
  bucketIndex: number,
  entryIndex: number,
  activeBucket: number | null,
  activeEntry: number | null,
  phase: HashTablePhase | null,
  foundBucket: boolean,
): string {
  const isActive =
    activeBucket === bucketIndex &&
    (activeEntry === entryIndex ||
      (activeEntry === null && foundBucket && phase === 'found'))

  if (
    isActive &&
    (phase === 'insert' ||
      phase === 'update' ||
      phase === 'found' ||
      phase === 'complete')
  ) {
    return 'border-emerald-500/50 bg-emerald-500/15 text-foreground ring-2 ring-emerald-500/25'
  }
  if (isActive && phase === 'delete') {
    return 'border-rose-500/50 bg-rose-500/15 text-foreground ring-2 ring-rose-500/25'
  }
  if (isActive && phase === 'traverse-chain') {
    return 'border-amber-500/50 bg-amber-500/15 text-foreground ring-2 ring-amber-500/25'
  }
  if (activeBucket === bucketIndex) {
    return 'border-sky-500/40 bg-sky-500/10 text-foreground'
  }
  return 'border-border bg-surface text-foreground'
}

function BucketChain({
  bucket,
  bucketIndex,
  activeBucket,
  activeEntry,
  phase,
  foundBucket,
}: {
  bucket: readonly HashTableEntry[]
  bucketIndex: number
  activeBucket: number | null
  activeEntry: number | null
  phase: HashTablePhase | null
  foundBucket: boolean
}) {
  if (bucket.length === 0) {
    return (
      <span
        className={cn(
          'inline-flex h-9 min-w-[4.5rem] items-center justify-center rounded-md border border-dashed border-border',
          'bg-muted/40 px-2 font-mono text-xs text-muted-foreground',
          activeBucket === bucketIndex &&
            'border-sky-500/50 bg-sky-500/10 text-foreground',
        )}
      >
        empty
      </span>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {bucket.map((entry, entryIndex) => (
        <div key={`${bucketIndex}-${entry.key}-${entryIndex}`} className="flex items-center gap-1.5">
          {entryIndex > 0 ? (
            <span aria-hidden="true" className="font-mono text-xs text-muted-foreground">
              →
            </span>
          ) : null}
          <span
            className={cn(
              'inline-flex h-9 max-w-[14rem] items-center truncate rounded-md border px-2.5',
              'font-mono text-xs font-medium transition-[background-color,border-color,box-shadow] duration-300',
              'motion-reduce:transition-none',
              entryTone(
                bucketIndex,
                entryIndex,
                activeBucket,
                activeEntry,
                phase,
                foundBucket,
              ),
            )}
            title={formatBucket([entry])}
          >
            {formatKey(entry.key)}: {formatValue(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

/**
 * Educational panels for Hash Table separate chaining:
 * hash path summary + bucket rows with collision chains.
 */
export function HashTablePanels({ step, className }: HashTablePanelsProps) {
  const meta = step?.meta
  const snapshotRaw = meta?.hashTableSnapshot
  const snapshot: HashTableSnapshot = parseHashTableSnapshot(
    typeof snapshotRaw === 'string'
      ? snapshotRaw
      : '{"buckets":[],"capacity":7,"size":0,"loadFactorThreshold":0.75,"collisionEvents":0}',
  )
  const phase = readPhase(meta)
  const inputKey = readString(meta, 'inputKey')
  const inputValue = readString(meta, 'inputValue')
  const hash = readNumber(meta, 'hash')
  const bucketIdx = readNumber(meta, 'bucketIndex')
  const activeBucket = readNumber(meta, 'activeBucket')
  const activeEntry = readNumber(meta, 'activeEntry')
  const collision = readBoolean(meta, 'collision')
  const collisionEvents = readNumber(meta, 'collisionEvents') ?? 0
  const multiEntryBuckets = readNumber(meta, 'multiEntryBuckets') ?? 0
  const occupiedBuckets = readNumber(meta, 'occupiedBuckets') ?? 0
  const load = readNumber(meta, 'loadFactor') ?? 0
  const result = readString(meta, 'result')
  const foundBucket =
    Array.isArray(step?.found) &&
    activeBucket !== null &&
    step.found.includes(activeBucket)

  return (
    <div className={cn('mb-4 space-y-3', className)}>
      <div
        className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-muted/20 sm:p-4"
        aria-label="Hash path"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
            Hash path
          </p>
          <p className="text-[0.65rem] text-muted-foreground">
            Separate chaining · educational rolling hash
          </p>
        </div>

        <dl className="mt-3 grid gap-2 text-body-sm sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border/80 bg-surface/70 px-3 py-2">
            <dt className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground">
              Key
            </dt>
            <dd className="mt-1 font-mono text-foreground">
              {inputKey === null ? '—' : formatKey(inputKey)}
            </dd>
          </div>
          <div className="rounded-lg border border-border/80 bg-surface/70 px-3 py-2">
            <dt className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground">
              Value
            </dt>
            <dd className="mt-1 font-mono text-foreground">
              {inputValue ?? '—'}
            </dd>
          </div>
          <div className="rounded-lg border border-border/80 bg-surface/70 px-3 py-2">
            <dt className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground">
              Hash
            </dt>
            <dd className="mt-1 font-mono text-foreground">
              {hash === null ? '—' : hash}
            </dd>
          </div>
          <div className="rounded-lg border border-border/80 bg-surface/70 px-3 py-2">
            <dt className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground">
              Bucket index
            </dt>
            <dd className="mt-1 font-mono text-foreground">
              {bucketIdx === null ? '—' : bucketIdx}
              {collision ? (
                <span className="ml-2 rounded bg-amber-500/15 px-1.5 py-0.5 text-[0.65rem] text-amber-800 dark:text-amber-200">
                  collision
                </span>
              ) : null}
            </dd>
          </div>
        </dl>

        {result ? (
          <p className="mt-3 text-body-sm text-muted-foreground" aria-live="polite">
            Result:{' '}
            <span className="font-mono text-foreground">{result}</span>
          </p>
        ) : null}
      </div>

      <div
        className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-muted/20 sm:p-4"
        aria-label="Hash table buckets"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-label text-[0.65rem] tracking-[0.08em] text-primary">
            Buckets
          </p>
          <p className="text-[0.65rem] text-muted-foreground">
            capacity {snapshot.capacity} · size {snapshot.size} · load{' '}
            {load.toFixed(2)} · occupied {occupiedBuckets} · multi-entry{' '}
            {multiEntryBuckets} · collision events {collisionEvents}
          </p>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[28rem] border-separate border-spacing-y-2 text-left">
            <thead>
              <tr className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground">
                <th className="px-2 font-medium">Index</th>
                <th className="px-2 font-medium">Bucket chain</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.buckets.map((bucket, index) => {
                const isActive = activeBucket === index
                return (
                  <tr
                    key={`bucket-${index}`}
                    className={cn(
                      'align-middle',
                      isActive && '[&>td]:bg-sky-500/5',
                    )}
                  >
                    <td
                      className={cn(
                        'w-16 rounded-l-md border border-border bg-surface px-2 py-2',
                        'font-mono text-sm text-foreground',
                        isActive && 'border-sky-500/40 text-sky-800 dark:text-sky-200',
                      )}
                    >
                      {index}
                    </td>
                    <td
                      className={cn(
                        'rounded-r-md border border-l-0 border-border bg-surface px-3 py-2',
                        isActive && 'border-sky-500/40',
                      )}
                    >
                      <BucketChain
                        bucket={bucket}
                        bucketIndex={index}
                        activeBucket={activeBucket}
                        activeEntry={activeEntry}
                        phase={phase}
                        foundBucket={foundBucket}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-body-sm text-muted-foreground">
          Collision events count inserts into a non-empty bucket. Multi-entry
          buckets count chains that currently hold two or more keys.
        </p>
      </div>
    </div>
  )
}
