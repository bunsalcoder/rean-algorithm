import type { HighlightAccent } from '../../data/learningHighlights'

type AccentStyle = {
  iconWrap: string
  icon: string
  hoverBorder: string
  hoverShadow: string
  glow: string
}

export const highlightAccentStyles: Record<HighlightAccent, AccentStyle> = {
  violet: {
    iconWrap: 'bg-violet-500/10 dark:bg-violet-400/10',
    icon: 'text-violet-600 dark:text-violet-300',
    hoverBorder: 'hover:border-violet-400/40 dark:hover:border-violet-400/35',
    hoverShadow:
      'hover:shadow-[0_8px_24px_rgb(139_92_246/0.12)] dark:hover:shadow-[0_8px_24px_rgb(139_92_246/0.18)]',
    glow: 'bg-violet-400/25 dark:bg-violet-400/20',
  },
  indigo: {
    iconWrap: 'bg-indigo-500/10 dark:bg-indigo-400/10',
    icon: 'text-indigo-600 dark:text-indigo-300',
    hoverBorder: 'hover:border-indigo-400/40 dark:hover:border-indigo-400/35',
    hoverShadow:
      'hover:shadow-[0_8px_24px_rgb(129_140_248/0.12)] dark:hover:shadow-[0_8px_24px_rgb(129_140_248/0.18)]',
    glow: 'bg-indigo-400/25 dark:bg-indigo-400/20',
  },
  blue: {
    iconWrap: 'bg-sky-500/10 dark:bg-sky-400/10',
    icon: 'text-sky-600 dark:text-sky-300',
    hoverBorder: 'hover:border-sky-400/40 dark:hover:border-sky-400/35',
    hoverShadow:
      'hover:shadow-[0_8px_24px_rgb(56_189_248/0.12)] dark:hover:shadow-[0_8px_24px_rgb(56_189_248/0.18)]',
    glow: 'bg-sky-400/25 dark:bg-sky-400/20',
  },
  fuchsia: {
    iconWrap: 'bg-fuchsia-500/10 dark:bg-fuchsia-400/10',
    icon: 'text-fuchsia-600 dark:text-fuchsia-300',
    hoverBorder:
      'hover:border-fuchsia-400/40 dark:hover:border-fuchsia-400/35',
    hoverShadow:
      'hover:shadow-[0_8px_24px_rgb(232_121_249/0.12)] dark:hover:shadow-[0_8px_24px_rgb(232_121_249/0.18)]',
    glow: 'bg-fuchsia-400/25 dark:bg-fuchsia-400/20',
  },
}
