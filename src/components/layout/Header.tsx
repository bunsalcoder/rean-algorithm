import { useEffect, useId, useState } from 'react'
import { Button, Container, ThemeToggle } from '../ui'
import { Brand } from './Brand'
import { NavLinks } from './NavLinks'
import { SearchInput } from './SearchInput'
import { cn } from '../../lib/cn'

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {open ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  )
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()

  useEffect(() => {
    if (!menuOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-border',
        'bg-surface/90 backdrop-blur-md transition-theme',
      )}
    >
      <Container className="flex h-14 items-center gap-4 sm:h-16">
        <Brand className="shrink-0" onNavigate={closeMenu} />

        <nav
          aria-label="Primary"
          className="absolute left-1/2 hidden -translate-x-1/2 lg:block"
        >
          <NavLinks />
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <SearchInput className="hidden md:flex" />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            className="size-9 px-0 lg:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MenuIcon open={menuOpen} />
          </Button>
        </div>
      </Container>

      <div
        id={menuId}
        aria-hidden={!menuOpen}
        inert={!menuOpen ? true : undefined}
        className={cn(
          'grid border-t border-border transition-[grid-template-rows] duration-300 ease-out lg:hidden',
          menuOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr] border-transparent',
        )}
      >
        <div className="overflow-hidden">
          <Container className="flex flex-col gap-4 py-4">
            <SearchInput
              className="max-w-none md:hidden"
              id="mobile-header-search"
            />
            <nav aria-label="Mobile">
              <NavLinks orientation="vertical" onNavigate={closeMenu} />
            </nav>
          </Container>
        </div>
      </div>
    </header>
  )
}
