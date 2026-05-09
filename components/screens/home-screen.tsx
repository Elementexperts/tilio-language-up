'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { SparrowMascot } from '@/components/sparrow-mascot'
import { LessonMap } from '@/components/lesson-map'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/hooks/use-telegram'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { lessonsData, getNextLesson } from '@/lib/data/lessons'
import { getXpProgress, getXpToNextLevel } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Flame, Zap, Trophy, Target, Users, Sparkles, Gift, Store } from 'lucide-react'

export function HomeScreen() {
  const user = useAppStore((state) => state.user)
  const dailyChallenges = useAppStore((state) => state.dailyChallenges)
  const setScreen = useAppStore((state) => state.setScreen)
  const canClaimChest = useAppStore((state) => state.canClaimChest)
  const { hapticFeedback } = useTelegram()
  const hasMounted = useHasMounted()

  const completedCount = user?.completedLessons.length || 0
  const totalLessons = lessonsData.length
  const progressPercent = (completedCount / totalLessons) * 100

  const activeChallenge = useMemo(() => {
    if (!hasMounted) return undefined
    const today = new Date().toISOString().split('T')[0]
    return dailyChallenges.find((c) => c.date === today && !c.completed)
  }, [dailyChallenges, hasMounted])

  const nextLesson = useMemo(() => {
    if (!user) return null
    return getNextLesson(user.completedLessons) ?? lessonsData[0]
  }, [user])

  const motivationalMessage = useMemo(() => {
    if (!user) return ''
    if (user.streak >= 30) return 'Legendary streak! You inspire everyone.'
    if (user.streak >= 7) return 'Amazing consistency! Keep your streak blazing.'
    if (user.streak >= 3) return 'Momentum unlocked. You are on a roll!'
    return 'A small lesson today keeps the streak alive.'
  }, [user])

  const getGreeting = () => {
    if (!hasMounted) return 'Welcome back'
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  if (!user) return null

  const xpProgress = getXpProgress(user.xp)
  const xpToNext = getXpToNextLevel(user.xp)
  const chestReady = hasMounted ? canClaimChest() : false

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border safe-area-top">
        <div className="flex items-center justify-between px-4 py-3">
          {/* User greeting */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {user.photoUrl ? (
                <img 
                  src={user.photoUrl} 
                  alt={user.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-primary font-bold text-lg">
                  {user.firstName.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{getGreeting()}</p>
              <p className="font-semibold text-foreground">{user.firstName}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            {/* Streak */}
            <button
              onClick={() => {
                hapticFeedback('light')
                setScreen('daily-challenges')
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/20 rounded-full"
            >
              <Flame className={cn(
                'w-4 h-4',
                user.streak > 0 ? 'text-orange-500 animate-streak-flame' : 'text-muted-foreground'
              )} />
              <span className="text-sm font-bold text-foreground">{user.streak}</span>
            </button>

            {/* XP */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">Lv {user.userLevel}</span>
            </div>

            {/* Feathers */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 rounded-full">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-bold text-foreground">{user.feathers}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {/* XP and motivation */}
        <div className="px-4 pt-4">
          <Card className="p-4 bg-gradient-to-r from-primary/10 to-emerald-100/70 border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Level {user.userLevel}</span>
              <span className="text-xs text-muted-foreground">{xpProgress}/100 XP</span>
            </div>
            <Progress value={xpProgress} className="h-2.5" />
            <p className="text-xs text-muted-foreground mt-2">{xpToNext} XP to next level</p>
            <p className="text-sm text-foreground mt-2">{motivationalMessage}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Come back tomorrow for your next chest and streak bonus.
            </p>
          </Card>
        </div>

        {/* Chest + quick actions */}
        <div className="px-4 pt-4 grid grid-cols-2 gap-3">
          <Card
            className={cn(
              'p-4 cursor-pointer border-primary/20',
              chestReady ? 'bg-primary/10' : 'bg-muted/40'
            )}
            onClick={() => {
              hapticFeedback('medium')
              setScreen('daily-chest')
            }}
          >
            <div className="flex items-center gap-2">
              <Gift className={cn('w-5 h-5', chestReady ? 'text-primary' : 'text-muted-foreground')} />
              <span className="font-medium text-sm">Daily Chest</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {chestReady ? 'Ready to open' : 'Come back tomorrow'}
            </p>
          </Card>
          <Card
            className="p-4 cursor-pointer border-emerald-200 bg-emerald-50/60"
            onClick={() => {
              hapticFeedback('light')
              setScreen('store')
            }}
          >
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-700" />
              <span className="font-medium text-sm">Rewards Store</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Spend feathers on cosmetics</p>
          </Card>
        </div>

        {/* Daily Challenge Card */}
        {activeChallenge && (
          <div className="px-4 pt-4">
            <Card 
              className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 cursor-pointer"
              onClick={() => {
                hapticFeedback('light')
                setScreen('daily-challenges')
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Daily Challenge</p>
                  <p className="text-xs text-muted-foreground">
                    {activeChallenge.type === 'lessons' 
                      ? `Complete ${activeChallenge.target} lessons`
                      : `Earn ${activeChallenge.target} XP`
                    }
                  </p>
                  <div className="mt-2">
                    <Progress 
                      value={(activeChallenge.current / activeChallenge.target) * 100}
                      className="h-2"
                    />
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-primary font-medium">+{activeChallenge.xpReward} XP</span>
                  <p className="text-xs text-emerald-700">+{activeChallenge.featherReward} 🪶</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Quick lesson access */}
        {nextLesson && (
          <div className="px-4 pt-4">
            <Card className="p-4 border-primary/20">
              <p className="text-xs text-muted-foreground">Quick lesson</p>
              <p className="text-base font-semibold">{nextLesson.title}</p>
              <p className="text-xs text-muted-foreground">{nextLesson.description}</p>
              <Button
                className="mt-3 h-10 rounded-xl"
                onClick={() => {
                  hapticFeedback('light')
                  useAppStore.getState().startLesson(nextLesson)
                }}
              >
                Continue Learning
              </Button>
            </Card>
          </div>
        )}

        {/* Progress Overview */}
        <div className="px-4 pt-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">Course Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedCount}/{totalLessons} lessons
              </span>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <span>{Math.round(progressPercent)}% complete</span>
              <span>{totalLessons - completedCount} lessons remaining</span>
            </div>
          </Card>
        </div>

        {/* Lesson Map */}
        <div className="px-4 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Your Learning Path</h2>
            <SparrowMascot size="sm" mood="happy" />
          </div>
          <LessonMap />
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-bottom">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2">
          <NavButton 
            icon={<Target className="w-5 h-5" />} 
            label="Learn" 
            active 
            onClick={() => {
              hapticFeedback('light')
            }}
          />
          <NavButton 
            icon={<Trophy className="w-5 h-5" />} 
            label="Achievements" 
            onClick={() => {
              hapticFeedback('light')
              setScreen('achievements')
            }}
          />
          <NavButton 
            icon={<Users className="w-5 h-5" />} 
            label="Invite" 
            onClick={() => {
              hapticFeedback('light')
              setScreen('referral')
            }}
          />
          <NavButton
            icon={<Store className="w-5 h-5" />}
            label="Store"
            onClick={() => {
              hapticFeedback('light')
              setScreen('store')
            }}
          />
          <NavButton 
            icon={
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {user.photoUrl ? (
                  <img src={user.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-primary">{user.firstName.charAt(0)}</span>
                )}
              </div>
            } 
            label="Profile" 
            onClick={() => {
              hapticFeedback('light')
              setScreen('profile')
            }}
          />
        </div>
      </nav>
    </div>
  )
}

interface NavButtonProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick: () => void
}

function NavButton({ icon, label, active, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors touch-target',
        active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}
