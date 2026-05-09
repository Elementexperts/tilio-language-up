'use client'

import { useMemo } from 'react'
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
import { BookOpen, ChevronRight, Flame, Feather, Gift, Home, Medal, Play, ShoppingBag, Sparkles, Target, Trophy, UserRound, Users, Zap } from 'lucide-react'

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
    if (user.streak >= 30) return 'Afsona darajasidasiz. Keep the flame alive.'
    if (user.streak >= 7) return 'A full week of momentum. Beautiful work.'
    if (user.streak >= 3) return 'You are building a real habit now.'
    return 'One tiny lesson today. A bigger voice tomorrow.'
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
  const avatarSrc = user.photoUrl ?? (user.avatarStyle === 'girl' ? '/avatars/tilio-girl-avatar.png' : '/avatars/tilio-boy-avatar.png')

  return (
    <div className="tilio-shell flex flex-col">
      <header className="sticky top-0 z-20 safe-area-top">
        <div className="tilio-container px-4 pt-3">
          <div className="flex items-center justify-between rounded-[1.6rem] border border-white/70 bg-white/75 px-3 py-2 shadow-lg shadow-emerald-950/5 backdrop-blur-xl">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 ring-2 ring-white">
                <img src={avatarSrc} alt={user.firstName} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{getGreeting()}</p>
                <p className="truncate text-base font-black text-foreground">{user.firstName}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StatPill icon={<Flame className={cn('size-4', user.streak > 0 && 'animate-streak-flame text-orange-500')} />} value={user.streak} onClick={() => setScreen('daily-challenges')} />
              <StatPill icon={<Feather className="size-4 text-emerald-700" />} value={user.feathers} />
            </div>
          </div>
        </div>
      </header>

      <main className="tilio-container flex-1 overflow-y-auto px-4 pb-28 pt-4">
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#fffbea] via-[#f3fbde] to-[#d9f4bd] p-5 shadow-2xl shadow-emerald-900/10">
          <div className="absolute -right-12 top-0 h-40 w-40 rounded-full bg-primary/15" />
          <div className="absolute bottom-0 left-0 h-20 w-full bg-[linear-gradient(135deg,transparent_0_40%,rgba(34,197,94,0.12)_40%_52%,transparent_52%)] bg-[length:42px_42px]" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-1 text-xs font-extrabold text-emerald-800 shadow-sm">
                <Sparkles className="size-3.5 text-accent" />
                Tilio Daily
              </div>
              <h1 className="text-3xl font-black leading-[1.02] tracking-normal text-emerald-950">
                O&apos;rgan. Mashq qil. So&apos;zla.
              </h1>
              <p className="mt-3 text-sm font-medium leading-5 text-emerald-900/75">{motivationalMessage}</p>
            </div>
            <SparrowMascot branded size="lg" mood="waving" className="shrink-0" />
          </div>
          {nextLesson && (
            <Button
              className="tilio-button relative z-10 mt-5 h-14 w-full rounded-2xl bg-primary text-base font-black hover:bg-primary/95"
              onClick={() => {
                hapticFeedback('medium')
                useAppStore.getState().startLesson(nextLesson)
              }}
            >
              <Play className="size-5 fill-current" />
              Continue Learning
            </Button>
          )}
        </section>

        <section className="mt-4 grid grid-cols-3 gap-3">
          <MetricCard label="Level" value={user.userLevel} icon={<Zap className="size-5" />} />
          <MetricCard label="Streak" value={user.streak} icon={<Flame className="size-5" />} tone="orange" />
          <MetricCard label="Feathers" value={user.feathers} icon={<Feather className="size-5" />} />
        </section>

        <section className="tilio-card mt-4 rounded-[1.75rem] p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Level {user.userLevel}</p>
              <h2 className="mt-1 text-xl font-black">Your Uzbek voice is growing</h2>
            </div>
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BookOpen className="size-7" />
            </div>
          </div>
          <div className="mt-4">
            <Progress value={xpProgress} className="tilio-progress h-4 rounded-full bg-emerald-100" />
            <div className="mt-2 flex justify-between text-xs font-bold text-muted-foreground">
              <span>{xpProgress}/100 XP</span>
              <span>{xpToNext} XP to next level</span>
            </div>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-2 gap-3">
          <button
            className={cn('tilio-pressed rounded-[1.5rem] border p-4 text-left shadow-lg shadow-emerald-950/5', chestReady ? 'border-accent/50 bg-amber-50' : 'border-border bg-white/75')}
            onClick={() => {
              hapticFeedback('medium')
              setScreen('daily-chest')
            }}
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-white text-accent shadow-sm">
              <Gift className="size-6" />
            </div>
            <p className="mt-3 font-black">Daily Chest</p>
            <p className="text-xs font-semibold text-muted-foreground">{chestReady ? 'Ready to open' : 'Claimed today'}</p>
          </button>
          <button
            className="tilio-pressed rounded-[1.5rem] border border-primary/20 bg-white/75 p-4 text-left shadow-lg shadow-emerald-950/5"
            onClick={() => {
              hapticFeedback('light')
              setScreen('store')
            }}
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <ShoppingBag className="size-6" />
            </div>
            <p className="mt-3 font-black">Cosmetics</p>
            <p className="text-xs font-semibold text-muted-foreground">Mascot looks and boosts</p>
          </button>
        </section>

        {activeChallenge && (
          <button
            className="tilio-pressed mt-4 w-full rounded-[1.75rem] border border-primary/20 bg-white/80 p-4 text-left shadow-xl shadow-emerald-950/5"
            onClick={() => {
              hapticFeedback('light')
              setScreen('daily-challenges')
            }}
          >
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                <Target className="size-7" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-black">Daily Challenge</p>
                  <p className="shrink-0 text-sm font-black text-primary">+{activeChallenge.xpReward} XP</p>
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {activeChallenge.type === 'lessons' ? `Complete ${activeChallenge.target} lessons` : `Earn ${activeChallenge.target} XP`}
                </p>
                <Progress value={(activeChallenge.current / activeChallenge.target) * 100} className="tilio-progress mt-3 h-3" />
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </div>
          </button>
        )}

        {nextLesson && (
          <section className="tilio-card mt-4 rounded-[1.75rem] p-4">
            <div className="flex items-center gap-3">
              <SparrowMascot size="sm" mood="happy" branded />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted-foreground">Next lesson</p>
                <h2 className="truncate text-lg font-black">{nextLesson.title}</h2>
                <p className="text-sm font-medium text-muted-foreground">{nextLesson.description}</p>
              </div>
            </div>
          </section>
        )}

        <section className="tilio-card mt-4 rounded-[1.75rem] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black">Course Progress</h2>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">{completedCount}/{totalLessons}</span>
          </div>
          <Progress value={progressPercent} className="tilio-progress h-4" />
          <p className="mt-2 text-sm font-semibold text-muted-foreground">{Math.round(progressPercent)}% complete. {totalLessons - completedCount} lessons to go.</p>
        </section>

        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Path</p>
              <h2 className="text-xl font-black">Your Learning Journey</h2>
            </div>
            <Medal className="size-6 text-accent" />
          </div>
          <LessonMap />
        </section>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 safe-area-bottom">
        <div className="tilio-container px-4 pb-3">
          <div className="grid grid-cols-5 gap-1 rounded-[1.7rem] border border-white/70 bg-white/85 p-2 shadow-2xl shadow-emerald-950/12 backdrop-blur-xl">
            <NavButton icon={<Home className="size-5" />} label="Learn" active onClick={() => hapticFeedback('light')} />
            <NavButton icon={<Trophy className="size-5" />} label="Badges" onClick={() => setScreen('achievements')} />
            <NavButton icon={<Users className="size-5" />} label="Invite" onClick={() => setScreen('referral')} />
            <NavButton icon={<ShoppingBag className="size-5" />} label="Store" onClick={() => setScreen('store')} />
            <NavButton icon={<UserRound className="size-5" />} label="Profile" onClick={() => setScreen('profile')} />
          </div>
        </div>
      </nav>
    </div>
  )
}

function StatPill({ icon, value, onClick }: { icon: React.ReactNode; value: number; onClick?: () => void }) {
  const content = (
    <>
      {icon}
      <span className="text-sm font-black">{value}</span>
    </>
  )

  if (!onClick) return <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-2 text-emerald-950">{content}</div>

  return (
    <button className="tilio-pressed flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-2 text-emerald-950" onClick={onClick}>
      {content}
    </button>
  )
}

function MetricCard({ label, value, icon, tone = 'green' }: { label: string; value: number; icon: React.ReactNode; tone?: 'green' | 'orange' }) {
  return (
    <div className={cn('rounded-[1.35rem] border bg-white/78 p-3 text-center shadow-lg shadow-emerald-950/5', tone === 'orange' ? 'border-orange-200 text-orange-600' : 'border-primary/15 text-primary')}>
      <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-2xl bg-current/10">{icon}</div>
      <p className="text-xl font-black text-foreground">{value}</p>
      <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
    </div>
  )
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'tilio-pressed flex min-w-0 flex-col items-center gap-1 rounded-[1.2rem] px-1.5 py-2 text-[11px] font-black transition-colors',
        active ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground',
      )}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  )
}
