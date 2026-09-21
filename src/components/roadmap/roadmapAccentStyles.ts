import type { RoadmapAccent } from '../../data/roadmap'

type AccentStyle = {
  iconWrap: string
  icon: string
  count: string
  status: string
  hoverBorder: string
  hoverShadow: string
  glow: string
  node: string
  nodeRing: string
  connector: string
}

export const roadmapAccentStyles: Record<RoadmapAccent, AccentStyle> = {
  violet: {
    iconWrap: 'bg-violet-500/10 dark:bg-violet-400/10',
    icon: 'text-violet-600 dark:text-violet-300',
    count: 'text-violet-600/80 dark:text-violet-300/80',
    status: 'text-violet-700/70 dark:text-violet-300/70',
    hoverBorder: 'group-hover:border-violet-400/45 dark:group-hover:border-violet-400/40',
    hoverShadow:
      'group-hover:shadow-[0_10px_28px_rgb(139_92_246/0.14)] dark:group-hover:shadow-[0_10px_28px_rgb(139_92_246/0.2)]',
    glow: 'bg-violet-400/25 dark:bg-violet-400/20',
    node: 'bg-violet-500 dark:bg-violet-400',
    nodeRing: 'ring-violet-500/30 dark:ring-violet-400/30',
    connector: 'group-hover:bg-violet-400/70 dark:group-hover:bg-violet-400/60',
  },
  indigo: {
    iconWrap: 'bg-indigo-500/10 dark:bg-indigo-400/10',
    icon: 'text-indigo-600 dark:text-indigo-300',
    count: 'text-indigo-600/80 dark:text-indigo-300/80',
    status: 'text-indigo-700/70 dark:text-indigo-300/70',
    hoverBorder: 'group-hover:border-indigo-400/45 dark:group-hover:border-indigo-400/40',
    hoverShadow:
      'group-hover:shadow-[0_10px_28px_rgb(129_140_248/0.14)] dark:group-hover:shadow-[0_10px_28px_rgb(129_140_248/0.2)]',
    glow: 'bg-indigo-400/25 dark:bg-indigo-400/20',
    node: 'bg-indigo-500 dark:bg-indigo-400',
    nodeRing: 'ring-indigo-500/30 dark:ring-indigo-400/30',
    connector: 'group-hover:bg-indigo-400/70 dark:group-hover:bg-indigo-400/60',
  },
  blue: {
    iconWrap: 'bg-blue-500/10 dark:bg-blue-400/10',
    icon: 'text-blue-600 dark:text-blue-300',
    count: 'text-blue-600/80 dark:text-blue-300/80',
    status: 'text-blue-700/70 dark:text-blue-300/70',
    hoverBorder: 'group-hover:border-blue-400/45 dark:group-hover:border-blue-400/40',
    hoverShadow:
      'group-hover:shadow-[0_10px_28px_rgb(96_165_250/0.14)] dark:group-hover:shadow-[0_10px_28px_rgb(96_165_250/0.2)]',
    glow: 'bg-blue-400/25 dark:bg-blue-400/20',
    node: 'bg-blue-500 dark:bg-blue-400',
    nodeRing: 'ring-blue-500/30 dark:ring-blue-400/30',
    connector: 'group-hover:bg-blue-400/70 dark:group-hover:bg-blue-400/60',
  },
  sky: {
    iconWrap: 'bg-sky-500/10 dark:bg-sky-400/10',
    icon: 'text-sky-600 dark:text-sky-300',
    count: 'text-sky-600/80 dark:text-sky-300/80',
    status: 'text-sky-700/70 dark:text-sky-300/70',
    hoverBorder: 'group-hover:border-sky-400/45 dark:group-hover:border-sky-400/40',
    hoverShadow:
      'group-hover:shadow-[0_10px_28px_rgb(56_189_248/0.14)] dark:group-hover:shadow-[0_10px_28px_rgb(56_189_248/0.2)]',
    glow: 'bg-sky-400/25 dark:bg-sky-400/20',
    node: 'bg-sky-500 dark:bg-sky-400',
    nodeRing: 'ring-sky-500/30 dark:ring-sky-400/30',
    connector: 'group-hover:bg-sky-400/70 dark:group-hover:bg-sky-400/60',
  },
  teal: {
    iconWrap: 'bg-teal-500/10 dark:bg-teal-400/10',
    icon: 'text-teal-600 dark:text-teal-300',
    count: 'text-teal-600/80 dark:text-teal-300/80',
    status: 'text-teal-700/70 dark:text-teal-300/70',
    hoverBorder: 'group-hover:border-teal-400/45 dark:group-hover:border-teal-400/40',
    hoverShadow:
      'group-hover:shadow-[0_10px_28px_rgb(45_212_191/0.14)] dark:group-hover:shadow-[0_10px_28px_rgb(45_212_191/0.2)]',
    glow: 'bg-teal-400/25 dark:bg-teal-400/20',
    node: 'bg-teal-500 dark:bg-teal-400',
    nodeRing: 'ring-teal-500/30 dark:ring-teal-400/30',
    connector: 'group-hover:bg-teal-400/70 dark:group-hover:bg-teal-400/60',
  },
  emerald: {
    iconWrap: 'bg-emerald-500/10 dark:bg-emerald-400/10',
    icon: 'text-emerald-600 dark:text-emerald-300',
    count: 'text-emerald-600/80 dark:text-emerald-300/80',
    status: 'text-emerald-700/70 dark:text-emerald-300/70',
    hoverBorder:
      'group-hover:border-emerald-400/45 dark:group-hover:border-emerald-400/40',
    hoverShadow:
      'group-hover:shadow-[0_10px_28px_rgb(52_211_153/0.14)] dark:group-hover:shadow-[0_10px_28px_rgb(52_211_153/0.2)]',
    glow: 'bg-emerald-400/25 dark:bg-emerald-400/20',
    node: 'bg-emerald-500 dark:bg-emerald-400',
    nodeRing: 'ring-emerald-500/30 dark:ring-emerald-400/30',
    connector: 'group-hover:bg-emerald-400/70 dark:group-hover:bg-emerald-400/60',
  },
  orange: {
    iconWrap: 'bg-orange-500/10 dark:bg-orange-400/10',
    icon: 'text-orange-600 dark:text-orange-300',
    count: 'text-orange-600/80 dark:text-orange-300/80',
    status: 'text-orange-700/70 dark:text-orange-300/70',
    hoverBorder: 'group-hover:border-orange-400/45 dark:group-hover:border-orange-400/40',
    hoverShadow:
      'group-hover:shadow-[0_10px_28px_rgb(251_146_60/0.14)] dark:group-hover:shadow-[0_10px_28px_rgb(251_146_60/0.2)]',
    glow: 'bg-orange-400/25 dark:bg-orange-400/20',
    node: 'bg-orange-500 dark:bg-orange-400',
    nodeRing: 'ring-orange-500/30 dark:ring-orange-400/30',
    connector: 'group-hover:bg-orange-400/70 dark:group-hover:bg-orange-400/60',
  },
  amber: {
    iconWrap: 'bg-amber-500/10 dark:bg-amber-400/10',
    icon: 'text-amber-600 dark:text-amber-300',
    count: 'text-amber-600/80 dark:text-amber-300/80',
    status: 'text-amber-700/70 dark:text-amber-300/70',
    hoverBorder: 'group-hover:border-amber-400/45 dark:group-hover:border-amber-400/40',
    hoverShadow:
      'group-hover:shadow-[0_10px_28px_rgb(251_191_36/0.14)] dark:group-hover:shadow-[0_10px_28px_rgb(251_191_36/0.2)]',
    glow: 'bg-amber-400/25 dark:bg-amber-400/20',
    node: 'bg-amber-500 dark:bg-amber-400',
    nodeRing: 'ring-amber-500/30 dark:ring-amber-400/30',
    connector: 'group-hover:bg-amber-400/70 dark:group-hover:bg-amber-400/60',
  },
  pink: {
    iconWrap: 'bg-pink-500/10 dark:bg-pink-400/10',
    icon: 'text-pink-600 dark:text-pink-300',
    count: 'text-pink-600/80 dark:text-pink-300/80',
    status: 'text-pink-700/70 dark:text-pink-300/70',
    hoverBorder: 'group-hover:border-pink-400/45 dark:group-hover:border-pink-400/40',
    hoverShadow:
      'group-hover:shadow-[0_10px_28px_rgb(244_114_182/0.14)] dark:group-hover:shadow-[0_10px_28px_rgb(244_114_182/0.2)]',
    glow: 'bg-pink-400/25 dark:bg-pink-400/20',
    node: 'bg-pink-500 dark:bg-pink-400',
    nodeRing: 'ring-pink-500/30 dark:ring-pink-400/30',
    connector: 'group-hover:bg-pink-400/70 dark:group-hover:bg-pink-400/60',
  },
  rose: {
    iconWrap: 'bg-rose-500/10 dark:bg-rose-400/10',
    icon: 'text-rose-600 dark:text-rose-300',
    count: 'text-rose-600/80 dark:text-rose-300/80',
    status: 'text-rose-700/70 dark:text-rose-300/70',
    hoverBorder: 'group-hover:border-rose-400/45 dark:group-hover:border-rose-400/40',
    hoverShadow:
      'group-hover:shadow-[0_10px_28px_rgb(251_113_133/0.14)] dark:group-hover:shadow-[0_10px_28px_rgb(251_113_133/0.2)]',
    glow: 'bg-rose-400/25 dark:bg-rose-400/20',
    node: 'bg-rose-500 dark:bg-rose-400',
    nodeRing: 'ring-rose-500/30 dark:ring-rose-400/30',
    connector: 'group-hover:bg-rose-400/70 dark:group-hover:bg-rose-400/60',
  },
  fuchsia: {
    iconWrap: 'bg-fuchsia-500/10 dark:bg-fuchsia-400/10',
    icon: 'text-fuchsia-600 dark:text-fuchsia-300',
    count: 'text-fuchsia-600/80 dark:text-fuchsia-300/80',
    status: 'text-fuchsia-700/70 dark:text-fuchsia-300/70',
    hoverBorder:
      'group-hover:border-fuchsia-400/45 dark:group-hover:border-fuchsia-400/40',
    hoverShadow:
      'group-hover:shadow-[0_10px_28px_rgb(232_121_249/0.14)] dark:group-hover:shadow-[0_10px_28px_rgb(232_121_249/0.2)]',
    glow: 'bg-fuchsia-400/25 dark:bg-fuchsia-400/20',
    node: 'bg-fuchsia-500 dark:bg-fuchsia-400',
    nodeRing: 'ring-fuchsia-500/30 dark:ring-fuchsia-400/30',
    connector: 'group-hover:bg-fuchsia-400/70 dark:group-hover:bg-fuchsia-400/60',
  },
  cyan: {
    iconWrap: 'bg-cyan-500/10 dark:bg-cyan-400/10',
    icon: 'text-cyan-600 dark:text-cyan-300',
    count: 'text-cyan-600/80 dark:text-cyan-300/80',
    status: 'text-cyan-700/70 dark:text-cyan-300/70',
    hoverBorder: 'group-hover:border-cyan-400/45 dark:group-hover:border-cyan-400/40',
    hoverShadow:
      'group-hover:shadow-[0_10px_28px_rgb(34_211_238/0.14)] dark:group-hover:shadow-[0_10px_28px_rgb(34_211_238/0.2)]',
    glow: 'bg-cyan-400/25 dark:bg-cyan-400/20',
    node: 'bg-cyan-500 dark:bg-cyan-400',
    nodeRing: 'ring-cyan-500/30 dark:ring-cyan-400/30',
    connector: 'group-hover:bg-cyan-400/70 dark:group-hover:bg-cyan-400/60',
  },
  slate: {
    iconWrap: 'bg-slate-500/10 dark:bg-slate-400/10',
    icon: 'text-slate-600 dark:text-slate-300',
    count: 'text-slate-600/80 dark:text-slate-300/80',
    status: 'text-slate-700/70 dark:text-slate-300/70',
    hoverBorder: 'group-hover:border-slate-400/45 dark:group-hover:border-slate-400/40',
    hoverShadow:
      'group-hover:shadow-[0_10px_28px_rgb(148_163_184/0.14)] dark:group-hover:shadow-[0_10px_28px_rgb(148_163_184/0.2)]',
    glow: 'bg-slate-400/25 dark:bg-slate-400/20',
    node: 'bg-slate-500 dark:bg-slate-400',
    nodeRing: 'ring-slate-500/30 dark:ring-slate-400/30',
    connector: 'group-hover:bg-slate-400/70 dark:group-hover:bg-slate-400/60',
  },
}
