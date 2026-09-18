import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { NAV_ITEMS } from './nav'

type NavLinksProps = {
  orientation?: 'horizontal' | 'vertical'
  onNavigate?: () => void
  className?: string
}

export function NavLinks({
  orientation = 'horizontal',
  onNavigate,
  className,
}: NavLinksProps) {
  const isVertical = orientation === 'vertical'

  return (
    <ul
      className={cn(
        isVertical ? 'flex flex-col gap-1' : 'flex items-center gap-1',
        className,
      )}
    >
      {NAV_ITEMS.map((item) => (
        <li key={item.to}>
          <NavLink
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'relative inline-flex items-center rounded-md text-nav',
                'transition-colors duration-200 ease-out',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                isVertical
                  ? 'w-full px-3 py-2.5'
                  : 'px-3 py-2',
                isActive
                  ? 'bg-primary-muted text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                isActive &&
                  !isVertical &&
                  'after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary',
              )
            }
          >
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}
