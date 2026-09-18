import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover',
  secondary:
    'bg-surface text-foreground border border-border shadow-sm hover:bg-muted',
  ghost: 'bg-transparent text-foreground hover:bg-muted',
  outline:
    'bg-transparent text-foreground border border-border hover:bg-muted hover:border-primary/40',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium',
        'transition-theme focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
