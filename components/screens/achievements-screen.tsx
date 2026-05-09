'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/hooks/use-telegram'
import { achievementsData } from '@/lib/data/lessons'
import { cn } from '@/lib/utils'
import { ArrowLeft, Star, Zap, Flame, Book, Trophy, Medal, Crown, Users, GraduationCap, Lock } from 'lucide-react'

const iconMap: Record<string, React.ElementType> = {
  star: Star,
  zap: Zap,
  flame: Flame,
  book: Book,
  trophy: Trophy,
  medal: Medal,
  crown: Crown,
  users: Users,
  'graduation-cap': GraduationCap,
}

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

    return achievementsData.map((achievement) => {
      let current = 0
      const target = achievement.requirement.value

      switch (achievement.requirement.type) {
        case 'xp':
          current = user.xp
          break
        case 'streak':
          current = user.streak
          break
        case 'lessons':
          current = user.completedLessons.length
          break
        case 'referrals':
          current = user.referralCount
          break
        case 'feathers':
          current = user.feathers
          break
        case 'level':
          current = user.userLevel
          break
      }

      const progress = Math.min((current / target) * 100, 100)
      const isUnlocked = current >= target

      return {
        ...achievement,
        current,
        progress,
        isUnlocked,
      }
    })
  }, [user])

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length
  const totalXpFromAchievements = achievements
    .filter((a) => a.isUnlocked)
    .reduce((sum, a) => sum + a.xpReward, 0)

  const handleBack = () => {
    hapticFeedback('light')
    setScreen('home')
  }

  if (!user) return null

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border safe-area-top">
        <div className="flex items-center gap-4 px-4 py-3">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Achievements</h1>
            <p className="text-sm text-muted-foreground">
              {unlockedCount}/{achievements.length} unlocked
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/20 rounded-full">
            <Trophy className="w-4 h-4 text-accent" />
            <span className="text-sm font-bold text-foreground">{totalXpFromAchievements}</span>
          </div>
        </div>
      </header>

      {/* Achievements List */}
      <main className="flex-1 overflow-y-auto px-4 py-6 pb-24">
        <div className="space-y-4">
          {achievements.map((achievement) => {
            const IconComponent = iconMap[achievement.icon] || Star

            return (
              <Card
                key={achievement.id}
                className={cn(
                  'p-4 transition-all duration-200',
                  achievement.isUnlocked
                    ? 'bg-primary/5 border-primary/20'
                    : 'opacity-80'
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={cn(
                      'w-14 h-14 rounded-2xl flex items-center justify-center',
                      achievement.isUnlocked
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {achievement.isUnlocked ? (
                      <IconComponent className="w-7 h-7" />
                    ) : (
                      <Lock className="w-6 h-6" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={cn(
                        'font-semibold',
                        achievement.isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {user.learningPath === 'uz-en' 
                          ? achievement.title 
                          : achievement.titleUz
                        }
                      </h3>
                      <span className={cn(
                        'text-sm font-medium',
                        achievement.isUnlocked ? 'text-primary' : 'text-muted-foreground'
                      )}>
                        +{achievement.xpReward} XP
                      </span>
                      {!!achievement.featherReward && (
                        <span className={cn(
                          'text-sm font-medium',
                          achievement.isUnlocked ? 'text-emerald-700' : 'text-muted-foreground'
                        )}>
                          +{achievement.featherReward} 🪶
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mt-1">
                      {user.learningPath === 'uz-en' 
                        ? achievement.description 
                        : achievement.descriptionUz
                      }
                    </p>

                    {/* Progress */}
                    {!achievement.isUnlocked && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>
                            {achievement.current}/{achievement.requirement.value}
                          </span>
                        </div>
                        <Progress value={achievement.progress} className="h-2" />
                      </div>
                    )}

                    {achievement.isUnlocked && (
                      <div className="flex items-center gap-1 mt-2 text-primary">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">Unlocked!</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
