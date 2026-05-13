'use client'

import { cn } from '@/lib/utils'

type SparrowMood = 'happy' | 'thinking' | 'celebrating' | 'sad' | 'waving'

interface SparrowMascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  mood?: SparrowMood
  className?: string
  animate?: boolean
  branded?: boolean
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
  xl: 'w-48 h-48',
}

const moodClasses: Record<SparrowMood, string> = {
  happy: 'from-emerald-50 to-lime-100',
  thinking: 'from-sky-50 to-emerald-100',
  celebrating: 'from-amber-50 to-lime-100',
  sad: 'from-rose-50 to-emerald-50',
  waving: 'from-emerald-50 to-lime-100',
}

function MoodReaction({ mood }: { mood: SparrowMood }) {
  if (mood === 'thinking') {
    return (
      <div className="absolute right-2 top-2 flex items-end gap-1">
        <span className="size-1.5 rounded-full bg-emerald-700/35" />
        <span className="size-2 rounded-full bg-emerald-700/30" />
        <span className="size-2.5 rounded-full bg-emerald-700/25" />
      </div>
    )
  }

  if (mood === 'celebrating') {
    return (
      <div className="pointer-events-none absolute inset-0">
        <span className="absolute left-3 top-3 size-2 rounded-full bg-amber-300 animate-confetti" />
        <span className="absolute right-4 top-5 size-2 rounded-full bg-lime-400 animate-confetti" style={{ animationDelay: '120ms' }} />
        <span className="absolute left-6 bottom-4 size-2 rounded-full bg-emerald-300 animate-confetti" style={{ animationDelay: '220ms' }} />
      </div>
    )
  }

  if (mood === 'sad') {
    return <span className="absolute right-4 top-4 size-2.5 rounded-full bg-sky-300/80 shadow-sm" />
  }

  if (mood === 'waving') {
    return <span className="absolute left-3 top-3 h-5 w-1.5 rotate-[-28deg] rounded-full bg-primary/40 animate-pulse-glow" />
  }

  return <span className="absolute right-3 top-3 size-2 rounded-full bg-lime-300/80 animate-pulse-glow" />
}

export function SparrowMascot({
  size = 'md',
  mood = 'happy',
  className,
  animate = true,
  branded: _branded = true,
}: SparrowMascotProps) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded-[2rem] bg-gradient-to-br shadow-xl shadow-emerald-900/10',
        sizeClasses[size],
        moodClasses[mood],
        animate && mood === 'celebrating' && 'animate-bounce-in',
        animate && mood !== 'celebrating' && 'animate-float',
        className,
      )}
      aria-label={`Tilio sparrow mascot - ${mood} mood`}
      role="img"
    >
      <img
        src="/tilio-mascot-brand.png"
        alt=""
        className="h-full w-full scale-[1.72] object-cover object-[82%_47%]"
        draggable={false}
      />
      <MoodReaction mood={mood} />
      <div className="absolute inset-x-3 bottom-2 h-4 rounded-full bg-emerald-950/10 blur-md" />
      <span className="sr-only">{mood} mascot</span>
    </div>
  )
}
