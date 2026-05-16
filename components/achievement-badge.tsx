'use client'

import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { achievementBadgeIcon, achievementBadgeTone, type AchievementProgress } from '@/lib/achievements'

type AchievementBadgeProps = {
  achievement: AchievementProgress
  compact?: boolean
  showProgress?: boolean
}

const toneClass = {
  blue: 'from-blue-800 via-blue-600 to-sky-400 text-white shadow-blue-900/22',
  teal: 'from-teal-800 via-emerald-600 to-teal-300 text-white shadow-teal-900/20',
  purple: 'from-fuchsia-700 via-purple-500 to-pink-300 text-white shadow-purple-900/20',
  gold: 'from-amber-500 via-yellow-400 to-orange-300 text-amber-950 shadow-amber-900/20',
  orange: 'from-orange-700 via-orange-500 to-amber-300 text-white shadow-orange-900/20',
  pink: 'from-pink-300 via-rose-200 to-orange-100 text-purple-950 shadow-pink-900/18',
  navy: 'from-slate-950 via-indigo-900 to-purple-700 text-white shadow-indigo-950/22',
  emerald: 'from-emerald-800 via-teal-600 to-emerald-300 text-white shadow-emerald-900/20',
  amber: 'from-yellow-500 via-amber-400 to-orange-300 text-amber-950 shadow-amber-900/20',
}

export function AchievementBadge({ achievement, compact = false, showProgress = false }: AchievementBadgeProps) {
  const tone = achievementBadgeTone[achievement.id] ?? 'teal'
  const Icon = achievementBadgeIcon[achievement.id] ?? achievementBadgeIcon['early-bird']
  const label = achievement.id === 'xp-champion'
    ? '500 XP'
    : achievement.id === 'feather-keeper'
      ? '300 feathers'
      : achievement.id === 'speaking-master'
        ? 'Level 5'
        : achievement.requirement.type === 'streak'
          ? achievement.requirement.value + ' day streak'
          : achievement.requirement.type === 'referrals'
            ? achievement.requirement.value + ' friends'
            : achievement.requirement.value + ' lessons'

  return (
    <div className={cn('group relative text-center', compact ? 'min-w-0' : '')}>
      <div
        className={cn(
          'relative mx-auto flex items-center justify-center rounded-full bg-gradient-to-br shadow-xl ring-4 ring-white/80 transition-transform duration-200 group-active:scale-95',
          toneClass[tone],
          compact ? 'size-20' : 'size-28',
          !achievement.isUnlocked && 'grayscale opacity-55',
        )}
        style={{ clipPath: 'polygon(50% 0%, 56% 7%, 64% 3%, 69% 11%, 78% 10%, 81% 19%, 90% 22%, 89% 31%, 97% 36%, 93% 44%, 100% 50%, 93% 56%, 97% 64%, 89% 69%, 90% 78%, 81% 81%, 78% 90%, 69% 89%, 64% 97%, 56% 93%, 50% 100%, 44% 93%, 36% 97%, 31% 89%, 22% 90%, 19% 81%, 10% 78%, 11% 69%, 3% 64%, 7% 56%, 0% 50%, 7% 44%, 3% 36%, 11% 31%, 10% 22%, 19% 19%, 22% 10%, 31% 11%, 36% 3%, 44% 7%)' }}
      >
        <div className="absolute inset-2 rounded-full border border-white/20" />
        <div className="absolute inset-x-4 top-3 h-8 rounded-full bg-white/18 blur-md" />
        {achievement.isUnlocked ? (
          <Icon className={cn('relative drop-shadow-sm', compact ? 'size-8' : 'size-11')} />
        ) : (
          <Lock className={cn('relative', compact ? 'size-7' : 'size-9')} />
        )}
      </div>
      <div className={cn('mx-auto mt-2', compact ? 'max-w-24' : 'max-w-32')}>
        <p className={cn('font-black leading-tight text-foreground', compact ? 'text-xs' : 'text-sm')}>{achievement.title}</p>
        <p className={cn('mt-0.5 font-extrabold uppercase leading-tight text-muted-foreground', compact ? 'text-[9px]' : 'text-[10px]')}>{label}</p>
      </div>
      {showProgress && !achievement.isUnlocked && (
        <div className="mx-auto mt-2 h-1.5 max-w-24 overflow-hidden rounded-full bg-emerald-950/10">
          <div className="h-full rounded-full bg-primary" style={{ width: achievement.progress + '%' }} />
        </div>
      )}
    </div>
  )
}
