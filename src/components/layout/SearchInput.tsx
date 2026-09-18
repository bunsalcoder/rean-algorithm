import { cn } from '../../lib/cn'

type SearchInputProps = {
  className?: string
  id?: string
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4 shrink-0 text-muted-foreground"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

export function SearchInput({ className, id = 'header-search' }: SearchInputProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'relative flex h-9 w-full max-w-[15.5rem] items-center gap-2 rounded-lg',
        'border border-border bg-muted/60 px-3 text-muted-foreground',
        'transition-theme hover:border-border hover:bg-muted',
        'focus-within:border-primary/50 focus-within:bg-surface',
        'focus-within:ring-2 focus-within:ring-ring/30',
        className,
      )}
    >
      <SearchIcon />
      <input
        id={id}
        type="search"
        name="search"
        placeholder="Search algorithms..."
        autoComplete="off"
        className={cn(
          'min-w-0 flex-1 bg-transparent text-sm text-foreground',
          'placeholder:text-muted-foreground',
          'outline-none',
        )}
        aria-label="Search algorithms"
      />
      <kbd
        className={cn(
          'hidden shrink-0 items-center rounded border border-border bg-surface',
          'px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground',
          'sm:inline-flex',
        )}
      >
        Ctrl K
      </kbd>
    </label>
  )
}
