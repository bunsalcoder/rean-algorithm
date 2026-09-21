import { useEffect, useRef, useState } from 'react'

type UseInViewOptions = {
  once?: boolean
  rootMargin?: string
  threshold?: number
}

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useInView<T extends HTMLElement = HTMLDivElement>({
  once = true,
  rootMargin = '0px 0px -8% 0px',
  threshold = 0.15,
}: UseInViewOptions = {}) {
  const ref = useRef<T | null>(null)
  const [isInView, setIsInView] = useState(() => prefersReducedMotion())

  useEffect(() => {
    if (isInView) return

    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setIsInView(true)
        if (once) observer.disconnect()
      },
      { rootMargin, threshold },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [isInView, once, rootMargin, threshold])

  return { ref, isInView }
}
