'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/hooks/use-telegram'
import { getUserAchievementProgress } from '@/lib/achievements'
import { cn } from '@/lib/utils'
import { AchievementBadge } from '@/components/achievement-badge'
import { ArrowLeft, Feather, PartyPopper, Star, Trophy } from 'lucide-react'

export function AchievementsScreen() {
  const user = useAppStore((state) => state.user)
  const setScreen = useAppStore((state) => state.setScreen)
  const { hapticFeedback, showBackButton, hideBackButton } = useTelegram()

  useEffect(() => {
    showBackButton(() => {
      hideBackButton()
      setScreen('home')
    })
    return () => hideBackButton()
  }, [showBackButton, hideBackButton, setScreen])

  const achievements = useMemo(() => {
    if (!user) return []
    const selectedCourse = user.selectedCourse ?? user.learningPath ?? 'uz-en'
    return getUserAchievementProgress(user, selectedCourse)
  }, [user])

  if (!user) return null

  const unlockedCount = achievements.filter((achievement) => achievement.isUnlocked).length
  const totalXpFromAchievements = achievements.filter((achievement) => achievement.isUnlocked).reduce((sum, achievement) => sum + achievement.xpReward, 0)

  return (
    <div className="tilio-shell flex flex-col">
      <header className="sticky top-0 z-10 safe-area-top">
        <div className="tilio-container px-4 py-3">
          <div className="flex items-center gap-4 rounded-[1.6rem] border border-white/70 bg-white/80 px-3 py-2 shadow-lg shadow-emerald-950/5 backdrop-blur-xl">
            <button
              onClick={() => {
                hapticFeedback('light')
                setScreen('home')
              }}
              className="tilio-pressed flex size-10 items-center justify-center rounded-full bg-emerald-50 text-muted-foreground"
              aria-label="Go back"
            >
              <ArrowLeft className="size-6" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-black">Achievements</h1>
              <p className="text-sm font-semibold text-muted-foreground">{unlockedCount}/{achievements.length} unlocked</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1.5">
              <Trophy className="size-4 text-accent" />
              <span className="text-sm font-black">{totalXpFromAchievements}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="tilio-container flex-1 overflow-y-auto px-4 py-4 pb-24">
        <section className="mb-4 overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 to-lime-500 p-5 text-white shadow-2xl shadow-emerald-900/15">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-[1.35rem] bg-white/18">
              <PartyPopper className="size-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-white/75">Badge collection</p>
              <h2 className="text-3xl font-black">{unlockedCount} unlocked</h2>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={cn(
                'tilio-pressed gap-0 rounded-[1.55rem] p-4 transition-all duration-200',
                achievement.isUnlocked ? 'border-primary/20 bg-white/90 shadow-xl shadow-primary/10' : 'border-white/70 bg-white/55 opacity-85',
              )}
            >
              <AchievementBadge achievement={achievement} showProgress />
              <p className="mt-3 min-h-10 text-center text-xs font-semibold leading-4 text-muted-foreground">{achievement.description}</p>
              <div className="mt-3 flex justify-center gap-1.5 text-xs font-black">
                <span className={achievement.isUnlocked ? 'text-primary' : 'text-muted-foreground'}>+{achievement.xpReward} XP</span>
                {!!achievement.featherReward && (
                  <span className={cn('inline-flex items-center gap-1', achievement.isUnlocked ? 'text-emerald-700' : 'text-muted-foreground')}>
                    <Feather className="size-3" />
                    +{achievement.featherReward}
                  </span>
                )}
              </div>
              {achievement.isUnlocked ? (
                <div className="mx-auto mt-3 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-black text-primary">
                  <Star className="size-3 fill-current" />
                  Unlocked
                </div>
              ) : (
                <div className="mt-3 text-center text-xs font-bold text-muted-foreground">
                  {achievement.current}/{achievement.requirement.value}
                </div>
              )}
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
