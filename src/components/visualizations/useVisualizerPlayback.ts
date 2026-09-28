import { useCallback, useEffect, useRef, useState } from 'react'
import type { PlaybackSpeed } from './types'
import { getPlaybackIntervalMs, prefersReducedMotion } from './utils'

type UseVisualizerPlaybackOptions = {
  /** Reset playback when this key changes (e.g. array signature). */
  resetKey?: string | number
}

type PlaybackState = {
  resetKey: string | number | undefined
  stepIndex: number
  isPlaying: boolean
  speed: PlaybackSpeed
}

export type VisualizerPlayback = {
  stepIndex: number
  isPlaying: boolean
  speed: PlaybackSpeed
  isFirst: boolean
  isLast: boolean
  stepCount: number
  play: () => void
  pause: () => void
  togglePlay: () => void
  next: () => void
  previous: () => void
  reset: () => void
  setSpeed: (speed: PlaybackSpeed) => void
  goToStep: (index: number) => void
}

export function useVisualizerPlayback(
  stepCount: number,
  options: UseVisualizerPlaybackOptions = {},
): VisualizerPlayback {
  const { resetKey } = options
  const [state, setState] = useState<PlaybackState>({
    resetKey,
    stepIndex: 0,
    isPlaying: false,
    speed: 1,
  })
  const reducedMotionRef = useRef(prefersReducedMotion())

  // Adjust state during render when the input sequence changes (React-recommended pattern).
  if (state.resetKey !== resetKey) {
    setState({
      resetKey,
      stepIndex: 0,
      isPlaying: false,
      speed: state.speed,
    })
  }

  const safeCount = Math.max(stepCount, 1)
  const stepIndex = Math.min(state.stepIndex, safeCount - 1)
  const isFirst = stepIndex <= 0
  const isLast = stepIndex >= safeCount - 1
  const isActivelyPlaying = state.isPlaying && !isLast

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => {
      reducedMotionRef.current = media.matches
    }
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!isActivelyPlaying) {
      return
    }

    const intervalMs = getPlaybackIntervalMs(
      state.speed,
      reducedMotionRef.current,
    )
    const timer = window.setTimeout(() => {
      setState((current) => {
        const nextIndex = Math.min(current.stepIndex + 1, safeCount - 1)
        return {
          ...current,
          stepIndex: nextIndex,
          isPlaying: nextIndex < safeCount - 1,
        }
      })
    }, intervalMs)

    return () => window.clearTimeout(timer)
  }, [isActivelyPlaying, stepIndex, state.speed, safeCount])

  const pause = useCallback(() => {
    setState((current) => ({ ...current, isPlaying: false }))
  }, [])

  const play = useCallback(() => {
    setState((current) => {
      const atEnd = current.stepIndex >= safeCount - 1
      return {
        ...current,
        stepIndex: atEnd ? 0 : current.stepIndex,
        isPlaying: true,
      }
    })
  }, [safeCount])

  const togglePlay = useCallback(() => {
    setState((current) => {
      if (current.isPlaying) {
        return { ...current, isPlaying: false }
      }
      const atEnd = current.stepIndex >= safeCount - 1
      return {
        ...current,
        stepIndex: atEnd ? 0 : Math.min(current.stepIndex, safeCount - 1),
        isPlaying: true,
      }
    })
  }, [safeCount])

  const next = useCallback(() => {
    setState((current) => ({
      ...current,
      isPlaying: false,
      stepIndex: Math.min(
        Math.min(current.stepIndex, safeCount - 1) + 1,
        safeCount - 1,
      ),
    }))
  }, [safeCount])

  const previous = useCallback(() => {
    setState((current) => ({
      ...current,
      isPlaying: false,
      stepIndex: Math.max(Math.min(current.stepIndex, safeCount - 1) - 1, 0),
    }))
  }, [safeCount])

  const reset = useCallback(() => {
    setState((current) => ({
      ...current,
      isPlaying: false,
      stepIndex: 0,
    }))
  }, [])

  const setSpeed = useCallback((nextSpeed: PlaybackSpeed) => {
    setState((current) => ({ ...current, speed: nextSpeed }))
  }, [])

  const goToStep = useCallback(
    (index: number) => {
      setState((current) => ({
        ...current,
        isPlaying: false,
        stepIndex: Math.min(Math.max(index, 0), safeCount - 1),
      }))
    },
    [safeCount],
  )

  return {
    stepIndex,
    isPlaying: isActivelyPlaying,
    speed: state.speed,
    isFirst,
    isLast,
    stepCount: safeCount,
    play,
    pause,
    togglePlay,
    next,
    previous,
    reset,
    setSpeed,
    goToStep,
  }
}
