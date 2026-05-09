'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { SparrowMascot } from '@/components/sparrow-mascot'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/hooks/use-telegram'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { cn } from '@/lib/utils'
import { ArrowLeft, Flame, Target, Zap, Calendar, Check, ArrowRight } from 'lucide-react'

export function DailyChallengesScreen() {
  const user = useAppStore((state) => state.user)
  const dailyChallenges = useAppStore((state) => state.dailyChallenges)
  const setScreen = useAppStore((state) => state.setScreen)
  const useStreakFreeze = useAppStore((state) => state.useStreakFreeze)
  const { hapticFeedback, showBackButton, hideBackButton } = useTelegram()
  const hasMounted = useHasMounted()

  useEffect(() => {
    showBackButton(() => {
      hideBackButton()
      setScreen('home')
    })
    return () => hideBackButton()
  }, [showBackButton, hideBackButton, setScreen])

  const today = hasMounted ? new Date().toISOString().split('T')[0] : ''
  const todaysChallenges = useMemo(() => {
    if (!today) return []
    return dailyChallenges.filter((c) => c.date === today)
  }, [dailyChallenges, today])

  const streakDays = useMemo(() => {
    if (!hasMounted) return []
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const isToday = i === 0
      const isActive = user?.lastActiveDate === dateStr || 
        (i > 0 && user?.streak && user.streak >= (7 - i))
      
      days.push({
        date,
        dateStr,
        isToday,
        isActive,
        dayName: weekDays[date.getDay()],
      })
    }
    return days
  }, [user, hasMounted])

  const handleBack = () => {
    hapticFeedback('light')
    setScreen('home')
  }

  const handleStartLesson = () => {
    hapticFeedback('light')
    setScreen('home')
  }

  const handleBuyFreeze = () => {
    hapticFeedback('medium')
    useStreakFreeze()
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
            <h1 className="text-xl font-bold text-foreground">Daily Goals</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 py-6 pb-24">
        {/* Streak Card */}
        <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center">
              <Flame className={cn(
                'w-9 h-9',
                user.streak > 0 ? 'text-orange-500 animate-streak-flame' : 'text-muted-foreground'
              )} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Streak</p>
              <p className="text-4xl font-bold text-foreground">{user.streak} days</p>
            </div>
          </div>

          {/* Weekly Calendar */}
          <div className="flex justify-between">
            {streakDays.map((day) => (
              <div key={day.dateStr} className="flex flex-col items-center gap-2">
                <span className="text-xs text-muted-foreground">{day.dayName}</span>
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                    day.isActive && 'bg-orange-500 text-white',
                    day.isToday && !day.isActive && 'border-2 border-orange-500 bg-orange-500/10',
                    !day.isActive && !day.isToday && 'bg-muted'
                  )}
                >
                  {day.isActive ? (
                    <Flame className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground">
                      {day.date.getDate()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground text-center mt-4">
            {user.streak > 0
              ? `Keep it up! Complete a lesson today to extend your streak.`
              : `Start a lesson today to begin your streak!`
            }
          </p>
        </Card>

        {/* Streak milestones + freeze */}
        <Card className="p-4 mb-6 border-orange-500/20">
          <h3 className="font-semibold text-foreground mb-3">Streak Milestones</h3>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[3, 7, 30].map((milestone) => {
              const reached = user.streak >= milestone
              return (
                <div
                  key={milestone}
                  className={cn(
                    'rounded-xl border p-3 text-center',
                    reached ? 'border-primary bg-primary/10' : 'border-border bg-muted/40'
                  )}
                >
                  <p className="text-xs text-muted-foreground">{milestone} days</p>
                  <p className={cn('text-sm font-semibold', reached ? 'text-primary' : 'text-foreground')}>
                    {reached ? 'Unlocked' : 'In progress'}
                  </p>
                </div>
              )
            })}
          </div>
          <div className="rounded-xl bg-muted/40 p-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Streak Freeze</p>
              <p className="text-xs text-muted-foreground">
                Use 50 Feathers to protect your streak when you miss a day.
              </p>
              <p className="text-xs text-orange-600 mt-1">Owned: {user.streakFreezes}</p>
            </div>
            <Button
              variant="outline"
              className="rounded-xl shrink-0"
              disabled={user.feathers < 50}
              onClick={handleBuyFreeze}
            >
              Buy (50 🪶)
            </Button>
          </div>
        </Card>

        {/* Daily Challenges */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Today&apos;s Challenges</h2>
          </div>

          {todaysChallenges.length > 0 ? (
            <div className="space-y-4">
              {todaysChallenges.map((challenge) => (
                <Card
                  key={challenge.id}
                  className={cn(
                    'p-4 transition-all',
                    challenge.completed 
                      ? 'bg-primary/5 border-primary/20' 
                      : 'border-border'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      challenge.completed ? 'bg-primary' : 'bg-muted'
                    )}>
                      {challenge.completed ? (
                        <Check className="w-6 h-6 text-primary-foreground" />
                      ) : challenge.type === 'lessons' ? (
                        <Target className="w-6 h-6 text-muted-foreground" />
                      ) : (
                        <Zap className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-foreground">
                          {challenge.type === 'lessons'
                            ? `Complete ${challenge.target} lessons`
                            : `Earn ${challenge.target} XP`
                          }
                        </h3>
                        <span className={cn(
                          'text-sm font-medium',
                          challenge.completed ? 'text-primary' : 'text-muted-foreground'
                        )}>
                          +{challenge.xpReward} XP
                        </span>
                        <span className={cn(
                          'text-sm font-medium ml-2',
                          challenge.completed ? 'text-emerald-700' : 'text-muted-foreground'
                        )}>
                          +{challenge.featherReward} 🪶
                        </span>
                      </div>

                      <div className="mt-2">
                        <Progress
                          value={(challenge.current / challenge.target) * 100}
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {challenge.current}/{challenge.target}
                          {challenge.completed && ' - Complete!'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <SparrowMascot size="md" mood="happy" className="mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                No challenges yet
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start a lesson to unlock today&apos;s challenges!
              </p>
            </Card>
          )}
        </div>

        {/* Tips */}
        <Card className="p-4 bg-secondary/50 border-secondary">
          <h3 className="font-semibold text-foreground mb-2">Tips for Success</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">1.</span>
              Practice every day to maintain your streak
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">2.</span>
              Complete daily challenges for bonus XP
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">3.</span>
              Review completed lessons to reinforce learning
            </li>
          </ul>
        </Card>
      </main>

      {/* Action Button */}
      <div className="p-6 safe-area-bottom">
        <Button
          onClick={handleStartLesson}
          className="w-full h-14 text-lg font-semibold rounded-2xl"
          size="lg"
        >
          Start Learning
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}
