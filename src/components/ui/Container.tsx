import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type ContainerSize = 'sm' | 'md' | 'lg' | 'full'

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  size?: ContainerSize
  children: ReactNode
}

const sizeClasses: Record<ContainerSize, string> = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  full: 'max-w-none',
}

export function Container({
  size = 'lg',
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
