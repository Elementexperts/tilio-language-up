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
import { playSuccessSound } from '@/lib/sound'
import { ArrowLeft, Flame, Target, Zap, Calendar, Check, ArrowRight, Snowflake, Trophy } from 'lucide-react'

export function DailyChallengesScreen() {
  const user = useAppStore((state) => state.user)
  const dailyChallenges = useAppStore((state) => state.dailyChallenges)
  const setScreen = useAppStore((state) => state.setScreen)
  const useStreakFreeze = useAppStore((state) => state.useStreakFreeze)
  const isSoundEnabled = useAppStore((state) => state.isSoundEnabled)
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
    if (isSoundEnabled) playSuccessSound()
    useStreakFreeze()
  }

  if (!user) return null

  return (
    <div className="tilio-shell flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 safe-area-top">
        <div className="tilio-container px-4 py-3">
        <div className="flex items-center gap-4 rounded-[1.6rem] border border-white/70 bg-white/80 px-3 py-2 shadow-lg shadow-emerald-950/5 backdrop-blur-xl">
          <button
            onClick={handleBack}
            className="tilio-pressed flex size-10 items-center justify-center rounded-full bg-emerald-50 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-black text-foreground">Streak Rewards</h1>
          </div>
        </div>
        </div>
      </header>

      {/* Content */}
      <main className="tilio-container flex-1 overflow-y-auto px-4 py-4 pb-24">
        {/* Streak Card */}
        <Card className="relative mb-6 gap-0 overflow-hidden rounded-[2rem] border-orange-200/80 bg-gradient-to-br from-emerald-950 via-emerald-900 to-orange-900 p-6 text-white shadow-2xl shadow-orange-900/18">
          <div className="absolute -right-10 top-2 h-36 w-36 rounded-full bg-orange-400/25 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-orange-400/15 to-transparent" />
          <div className="relative mb-6 flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-white/12">
              <Flame className={cn(
                'size-9',
                user.streak > 0 ? 'animate-streak-flame text-orange-300' : 'text-white/50'
              )} />
            </div>
            <div>
              <p className="text-sm font-bold text-lime-100/75">Current Streak</p>
              <p className="text-5xl font-black leading-none">{user.streak} days</p>
              <p className="mt-2 text-sm font-bold text-orange-100">Zo'r ish. Keep the flame alive.</p>
            </div>
          </div>

          <div className="relative flex justify-between">
            {streakDays.map((day) => (
              <div key={day.dateStr} className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-white/65">{day.dayName}</span>
                <div
                  className={cn(
                    'flex size-10 items-center justify-center rounded-full transition-all',
                    day.isActive && 'bg-orange-400 text-white shadow-lg shadow-orange-400/25',
                    day.isToday && !day.isActive && 'border-2 border-orange-300 bg-white/10',
                    !day.isActive && !day.isToday && 'bg-white/10 text-white/55'
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
        </Card>

        <Card className="premium-card mb-6 rounded-[1.75rem] p-4">
          <h3 className="mb-3 font-black text-foreground">Streak Milestones</h3>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[3, 7, 14, 30].map((milestone) => {
              const reached = user.streak >= milestone
              return (
                <div
                  key={milestone}
                  className={cn(
                    'rounded-2xl border p-3 text-center',
                    reached ? 'border-orange-200 bg-orange-50 text-orange-700' : 'border-border bg-muted/40'
                  )}
                >
                  {reached ? <Trophy className="mx-auto mb-1 size-5" /> : <Flame className="mx-auto mb-1 size-5 opacity-55" />}
                  <p className="text-xs font-black">{milestone} days</p>
                  <p className="text-[10px] font-bold text-muted-foreground">{reached ? 'Unlocked' : 'Soon'}</p>
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-sky-200 bg-sky-50/85 p-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <Snowflake className="size-7" />
            </div>
            <div>
              <p className="text-sm font-black">Streak Freeze</p>
              <p className="text-xs text-muted-foreground">
                Use 50 Feathers to protect your streak when you miss a day.
              </p>
              <p className="text-xs text-sky-700 mt-1 font-black">Owned: {user.streakFreezes}/2</p>
            </div>
            <Button
              variant="outline"
              className="rounded-xl shrink-0"
              disabled={user.feathers < 50 || user.streakFreezes >= 2}
              onClick={handleBuyFreeze}
            >
              {user.streakFreezes >= 2 ? 'Max' : 'Buy (50 feathers)'}
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
              <SparrowMascot size="md" mood="happy" branded className="mx-auto mb-4" />
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
        <Card className="tilio-card rounded-[1.75rem] p-4 bg-secondary/50 border-secondary">
          <h3 className="font-black text-foreground mb-2">Tips for Success</h3>
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
          className="tilio-button w-full h-14 text-lg font-black rounded-2xl"
          size="lg"
        >
          Start Learning
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}
