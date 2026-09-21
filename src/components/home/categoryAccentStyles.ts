import type { CategoryAccent } from '../../data/categories'

type AccentStyle = {
  iconWrap: string
  icon: string
  count: string
  hoverBorder: string
  hoverShadow: string
  glow: string
}

export const categoryAccentStyles: Record<CategoryAccent, AccentStyle> = {
  purple: {
    iconWrap: 'bg-violet-500/10 dark:bg-violet-400/10',
    icon: 'text-violet-600 dark:text-violet-300',
    count: 'text-violet-600/80 dark:text-violet-300/80',
    hoverBorder: 'hover:border-violet-400/40 dark:hover:border-violet-400/35',
    hoverShadow:
      'hover:shadow-[0_8px_24px_rgb(139_92_246/0.12)] dark:hover:shadow-[0_8px_24px_rgb(139_92_246/0.18)]',
    glow: 'bg-violet-400/25 dark:bg-violet-400/20',
  },
  blue: {
    iconWrap: 'bg-sky-500/10 dark:bg-sky-400/10',
    icon: 'text-sky-600 dark:text-sky-300',
    count: 'text-sky-600/80 dark:text-sky-300/80',
    hoverBorder: 'hover:border-sky-400/40 dark:hover:border-sky-400/35',
    hoverShadow:
      'hover:shadow-[0_8px_24px_rgb(56_189_248/0.12)] dark:hover:shadow-[0_8px_24px_rgb(56_189_248/0.18)]',
    glow: 'bg-sky-400/25 dark:bg-sky-400/20',
  },
  green: {
    iconWrap: 'bg-emerald-500/10 dark:bg-emerald-400/10',
    icon: 'text-emerald-600 dark:text-emerald-300',
    count: 'text-emerald-600/80 dark:text-emerald-300/80',
    hoverBorder:
      'hover:border-emerald-400/40 dark:hover:border-emerald-400/35',
    hoverShadow:
      'hover:shadow-[0_8px_24px_rgb(52_211_153/0.12)] dark:hover:shadow-[0_8px_24px_rgb(52_211_153/0.18)]',
    glow: 'bg-emerald-400/25 dark:bg-emerald-400/20',
  },
  orange: {
    iconWrap: 'bg-orange-500/10 dark:bg-orange-400/10',
    icon: 'text-orange-600 dark:text-orange-300',
    count: 'text-orange-600/80 dark:text-orange-300/80',
    hoverBorder: 'hover:border-orange-400/40 dark:hover:border-orange-400/35',
    hoverShadow:
      'hover:shadow-[0_8px_24px_rgb(251_146_60/0.12)] dark:hover:shadow-[0_8px_24px_rgb(251_146_60/0.18)]',
    glow: 'bg-orange-400/25 dark:bg-orange-400/20',
  },
  pink: {
    iconWrap: 'bg-pink-500/10 dark:bg-pink-400/10',
    icon: 'text-pink-600 dark:text-pink-300',
    count: 'text-pink-600/80 dark:text-pink-300/80',
    hoverBorder: 'hover:border-pink-400/40 dark:hover:border-pink-400/35',
    hoverShadow:
      'hover:shadow-[0_8px_24px_rgb(244_114_182/0.12)] dark:hover:shadow-[0_8px_24px_rgb(244_114_182/0.18)]',
    glow: 'bg-pink-400/25 dark:bg-pink-400/20',
  },
  teal: {
    iconWrap: 'bg-teal-500/10 dark:bg-teal-400/10',
    icon: 'text-teal-600 dark:text-teal-300',
    count: 'text-teal-600/80 dark:text-teal-300/80',
    hoverBorder: 'hover:border-teal-400/40 dark:hover:border-teal-400/35',
    hoverShadow:
      'hover:shadow-[0_8px_24px_rgb(45_212_191/0.12)] dark:hover:shadow-[0_8px_24px_rgb(45_212_191/0.18)]',
    glow: 'bg-teal-400/25 dark:bg-teal-400/20',
  },
  violet: {
    iconWrap: 'bg-indigo-500/10 dark:bg-indigo-400/10',
    icon: 'text-indigo-600 dark:text-indigo-300',
    count: 'text-indigo-600/80 dark:text-indigo-300/80',
    hoverBorder: 'hover:border-indigo-400/40 dark:hover:border-indigo-400/35',
    hoverShadow:
      'hover:shadow-[0_8px_24px_rgb(129_140_248/0.12)] dark:hover:shadow-[0_8px_24px_rgb(129_140_248/0.18)]',
    glow: 'bg-indigo-400/25 dark:bg-indigo-400/20',
  },
  red: {
    iconWrap: 'bg-rose-500/10 dark:bg-rose-400/10',
    icon: 'text-rose-600 dark:text-rose-300',
    count: 'text-rose-600/80 dark:text-rose-300/80',
    hoverBorder: 'hover:border-rose-400/40 dark:hover:border-rose-400/35',
    hoverShadow:
      'hover:shadow-[0_8px_24px_rgb(251_113_133/0.12)] dark:hover:shadow-[0_8px_24px_rgb(251_113_133/0.18)]',
    glow: 'bg-rose-400/25 dark:bg-rose-400/20',
  },
}
